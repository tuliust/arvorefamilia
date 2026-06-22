import { supabase } from '../lib/supabaseClient';
import { ArquivoHistorico } from '../types';
import { createActivityLog } from './activityLogService';
import { notifyHistoricalFileAdded } from './notificationTriggersService';
import { isAdminUser } from './permissionService';
import { uploadHistoricalFile } from './storageService';
import { emitTreeDataChanged } from './treeDataCache';

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

type HistoricalFileParticipant = { id: string; nome_completo: string };
type ArquivoHistoricoWithParticipants = ArquivoHistorico & {
  participante_ids?: string[];
  participantes?: HistoricalFileParticipant[];
};

function getErrorMessage(context: string, error: SupabaseErrorLike) {
  return `${context}: ${error.message || 'erro desconhecido do Supabase'}`;
}

async function assertAdminRelationshipFileWrite() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || 'Usuário autenticado não encontrado.');
  }

  const { isAdmin, error: permissionError } = await isAdminUser(data.user);
  if (permissionError) {
    throw new Error(permissionError);
  }

  if (!isAdmin) {
    throw new Error('Apenas administradores podem alterar arquivos históricos de relacionamento.');
  }
}

function normalizeParticipantIds(value: unknown) {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && Boolean(id.trim()))
    : [];
}

function normalizeParticipants(value: unknown): HistoricalFileParticipant[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((participant) => ({
      id: String((participant as Partial<HistoricalFileParticipant>)?.id ?? '').trim(),
      nome_completo: String((participant as Partial<HistoricalFileParticipant>)?.nome_completo ?? '').trim(),
    }))
    .filter((participant) => participant.id && participant.nome_completo);
}

function toArquivoHistorico(row: any): ArquivoHistorico {
  return {
    id: row.id,
    pessoa_id: row.pessoa_id ?? null,
    relacionamento_id: row.relacionamento_id ?? null,
    tipo: row.tipo,
    url: row.url ?? '',
    storage_bucket: row.storage_bucket ?? null,
    storage_path: row.storage_path ?? null,
    mime_type: row.mime_type ?? null,
    created_by: row.created_by ?? null,
    titulo: row.titulo,
    descricao: row.descricao ?? undefined,
    ano: row.ano ?? undefined,
    categoria_evento: row.categoria_evento ?? null,
    ordem: row.ordem ?? 0,
    participante_ids: normalizeParticipantIds(row.participante_ids),
    participantes: normalizeParticipants(row.participantes),
  } as ArquivoHistorico;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeOptional(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

function getArquivoParticipanteIds(arquivo: ArquivoHistorico) {
  return normalizeParticipantIds((arquivo as ArquivoHistoricoWithParticipants).participante_ids);
}

function sameStringList(current: string[], next: string[]) {
  if (current.length !== next.length) return false;
  const currentSorted = [...current].sort();
  const nextSorted = [...next].sort();
  return currentSorted.every((value, index) => value === nextSorted[index]);
}

function isMissingParticipantColumnError(error: SupabaseErrorLike) {
  const combined = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase();
  return (
    error.code === 'PGRST204' && combined.includes('participante_ids')
  ) || (
    combined.includes('participante_ids') &&
    (combined.includes('column') || combined.includes('schema cache') || combined.includes('could not find'))
  );
}

function buildArquivoPayload(
  ownerPayload: Record<string, unknown>,
  arquivo: ArquivoHistorico,
  ordem: number,
  options: { includeParticipants?: boolean } = {}
) {
  const payload: Record<string, unknown> = {
    ...ownerPayload,
    tipo: arquivo.tipo,
    url: normalizeOptional(arquivo.url),
    storage_bucket: normalizeOptional(arquivo.storage_bucket),
    storage_path: normalizeOptional(arquivo.storage_path),
    mime_type: normalizeOptional(arquivo.mime_type),
    titulo: arquivo.titulo,
    descricao: normalizeOptional(arquivo.descricao),
    ano: normalizeOptional(arquivo.ano),
    categoria_evento: normalizeOptional(arquivo.categoria_evento),
    ordem,
  };

  if (options.includeParticipants !== false) {
    payload.participante_ids = getArquivoParticipanteIds(arquivo);
  }

  return payload;
}

async function updateArquivoHistoricoWithOptionalParticipants(
  owner: ArquivoHistoricoOwner,
  arquivoId: string,
  payload: Record<string, unknown>
) {
  const updateQuery = supabase
    .from('arquivos_historicos')
    .update(payload)
    .eq('id', arquivoId);
  const { error } = await getOwnerFilter(updateQuery, owner);

  if (!error || !isMissingParticipantColumnError(error)) {
    return { error };
  }

  const fallbackPayload = { ...payload };
  delete fallbackPayload.participante_ids;

  const fallbackQuery = supabase
    .from('arquivos_historicos')
    .update(fallbackPayload)
    .eq('id', arquivoId);
  return getOwnerFilter(fallbackQuery, owner);
}

async function insertArquivoHistoricoWithOptionalParticipants(payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('arquivos_historicos')
    .insert(payload)
    .select('*')
    .single();

  if (!error || !isMissingParticipantColumnError(error)) {
    return { data, error };
  }

  const fallbackPayload = { ...payload };
  delete fallbackPayload.participante_ids;

  return supabase
    .from('arquivos_historicos')
    .insert(fallbackPayload)
    .select('*')
    .single();
}

function hasArquivoChanged(current: ArquivoHistorico, next: ArquivoHistorico, nextOrder: number) {
  return (
    current.tipo !== next.tipo ||
    normalizeOptional(current.url) !== normalizeOptional(next.url) ||
    normalizeOptional(current.storage_bucket) !== normalizeOptional(next.storage_bucket) ||
    normalizeOptional(current.storage_path) !== normalizeOptional(next.storage_path) ||
    normalizeOptional(current.mime_type) !== normalizeOptional(next.mime_type) ||
    current.titulo !== next.titulo ||
    normalizeOptional(current.descricao) !== normalizeOptional(next.descricao) ||
    normalizeOptional(current.ano) !== normalizeOptional(next.ano) ||
    normalizeOptional(current.categoria_evento) !== normalizeOptional(next.categoria_evento) ||
    !sameStringList(getArquivoParticipanteIds(current), getArquivoParticipanteIds(next)) ||
    (current.ordem ?? 0) !== nextOrder
  );
}

type ArquivoHistoricoOwner =
  | { linkedTo: 'person'; pessoaId: string }
  | { linkedTo: 'relationship'; relacionamentoId: string };

type NovoArquivoHistoricoInput = {
  file?: File | null;
  titulo: string;
  descricao?: string | null;
  ano?: string | null;
  categoria_evento?: ArquivoHistorico['categoria_evento'];
  participante_ids?: string[] | null;
  ordem?: number;
};

function getOwnerFilter(query: any, owner: ArquivoHistoricoOwner) {
  if (owner.linkedTo === 'person') {
    return query.eq('pessoa_id', owner.pessoaId).is('relacionamento_id', null);
  }

  return query.eq('relacionamento_id', owner.relacionamentoId).is('pessoa_id', null);
}

function getOwnerPayload(owner: ArquivoHistoricoOwner) {
  if (owner.linkedTo === 'person') {
    return {
      pessoa_id: owner.pessoaId,
      relacionamento_id: null,
    };
  }

  return {
    pessoa_id: null,
    relacionamento_id: owner.relacionamentoId,
  };
}

function getOwnerMetadata(owner: ArquivoHistoricoOwner) {
  if (owner.linkedTo === 'person') {
    return {
      linked_to: 'person',
      pessoa_id: owner.pessoaId,
    };
  }

  return {
    linked_to: 'relationship',
    relacionamento_id: owner.relacionamentoId,
  };
}

async function listarArquivosHistoricosPorOwner(owner: ArquivoHistoricoOwner): Promise<ArquivoHistorico[]> {
  const query = supabase
    .from('arquivos_historicos')
    .select('*')
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: true });

  const { data, error } = await getOwnerFilter(query, owner);

  if (error) {
    throw new Error(getErrorMessage('Erro ao carregar arquivos históricos', error));
  }

  return (data || []).map(toArquivoHistorico);
}

async function salvarArquivosHistoricosPorOwner(
  owner: ArquivoHistoricoOwner,
  arquivos: ArquivoHistorico[]
): Promise<ArquivoHistorico[]> {
  const arquivosExistentes = await listarArquivosHistoricosPorOwner(owner);
  const arquivosExistentesPorId = new Map(arquivosExistentes.map((arquivo) => [arquivo.id, arquivo]));
  const idsMantidos = new Set(arquivos.filter((arquivo) => isUuid(arquivo.id)).map((arquivo) => arquivo.id));
  const arquivosParaRemover = arquivosExistentes.filter((arquivo) => !idsMantidos.has(arquivo.id));
  const idsParaRemover = arquivosExistentes
    .map((arquivo) => arquivo.id)
    .filter((arquivoId) => !idsMantidos.has(arquivoId));
  const ownerPayload = getOwnerPayload(owner);
  const ownerMetadata = getOwnerMetadata(owner);

  if (idsParaRemover.length > 0) {
    const deleteQuery = supabase
      .from('arquivos_historicos')
      .delete()
      .in('id', idsParaRemover);
    const { error } = await getOwnerFilter(deleteQuery, owner);

    if (error) {
      throw new Error(getErrorMessage('Erro ao remover arquivos históricos', error));
    }

    for (const arquivo of arquivosParaRemover) {
      await createActivityLog({
        action: 'historical_file.removed',
        entity_type: 'historical_file',
        entity_id: arquivo.id,
        entity_label: arquivo.titulo,
        metadata: {
          ...ownerMetadata,
          file_type: arquivo.tipo,
        },
      });
    }
  }

  for (const [index, arquivo] of arquivos.entries()) {
    if (!String(arquivo.titulo ?? '').trim() && !String(arquivo.descricao ?? '').trim()) {
      throw new Error('Informe pelo menos um título ou uma descrição para salvar o fato ou memória histórica.');
    }

    const payload = buildArquivoPayload(ownerPayload, arquivo, index);

    if (isUuid(arquivo.id)) {
      const arquivoExistente = arquivosExistentesPorId.get(arquivo.id);
      if (arquivoExistente && !hasArquivoChanged(arquivoExistente, arquivo, index)) {
        continue;
      }

      const { error } = await updateArquivoHistoricoWithOptionalParticipants(owner, arquivo.id, payload);

      if (error) {
        throw new Error(getErrorMessage('Erro ao atualizar arquivo histórico', error));
      }

      await createActivityLog({
        action: 'historical_file.updated',
        entity_type: 'historical_file',
        entity_id: arquivo.id,
        entity_label: arquivo.titulo,
        metadata: {
          ...ownerMetadata,
          file_type: arquivo.tipo,
          has_file: Boolean(arquivo.url),
          has_description: Boolean(arquivo.descricao),
          has_year: Boolean(arquivo.ano),
          categoria_evento: payload.categoria_evento,
          order: payload.ordem,
        },
      });
    } else {
      const { data, error } = await insertArquivoHistoricoWithOptionalParticipants(payload);

      if (error) {
        throw new Error(getErrorMessage('Erro ao inserir arquivo histórico', error));
      }

      await createActivityLog({
        action: 'historical_file.added',
        entity_type: 'historical_file',
        entity_id: data?.id ?? null,
        entity_label: arquivo.titulo,
        metadata: {
          ...ownerMetadata,
          file_type: arquivo.tipo,
          has_file: Boolean(arquivo.url),
          has_description: Boolean(arquivo.descricao),
          has_year: Boolean(arquivo.ano),
          categoria_evento: payload.categoria_evento,
          order: payload.ordem,
        },
      });

      try {
        await notifyHistoricalFileAdded({
          historicalFileId: String(data?.id ?? arquivo.id),
          title: arquivo.titulo,
          fileType: arquivo.tipo,
          pessoaId: owner.linkedTo === 'person' ? owner.pessoaId : null,
          relacionamentoId: owner.linkedTo === 'relationship' ? owner.relacionamentoId : null,
        });
      } catch (notificationError) {
        console.warn('[Notificações] Falha ao notificar novo arquivo histórico:', notificationError);
      }
    }
  }

  const nextArquivos = await listarArquivosHistoricosPorOwner(owner);
  emitTreeDataChanged();
  return nextArquivos;
}

export async function listarArquivosHistoricosPorPessoa(pessoaId: string): Promise<ArquivoHistorico[]> {
  return listarArquivosHistoricosPorOwner({ linkedTo: 'person', pessoaId });
}

export async function substituirArquivosHistoricosDaPessoa(
  pessoaId: string,
  arquivos: ArquivoHistorico[]
): Promise<ArquivoHistorico[]> {
  return salvarArquivosHistoricosPorOwner({ linkedTo: 'person', pessoaId }, arquivos);
}

export async function listarArquivosHistoricosDoRelacionamento(relacionamentoId: string): Promise<ArquivoHistorico[]> {
  return listarArquivosHistoricosPorOwner({ linkedTo: 'relationship', relacionamentoId });
}

export async function salvarArquivosHistoricosDoRelacionamento(
  relacionamentoId: string,
  arquivos: ArquivoHistorico[]
): Promise<ArquivoHistorico[]> {
  await assertAdminRelationshipFileWrite();
  return salvarArquivosHistoricosPorOwner({ linkedTo: 'relationship', relacionamentoId }, arquivos);
}

export async function adicionarArquivoHistoricoAoRelacionamento(
  relacionamentoId: string,
  input: NovoArquivoHistoricoInput
): Promise<ArquivoHistorico> {
  await assertAdminRelationshipFileWrite();
  const file = input.file ?? null;
  const isImage = file ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) : true;
  const upload = file ? await uploadHistoricalFile(file, { relacionamentoId }) : null;
  const arquivosExistentes = await listarArquivosHistoricosDoRelacionamento(relacionamentoId);
  const nextArquivo: ArquivoHistoricoWithParticipants = {
    id: `arquivo-${Date.now()}`,
    relacionamento_id: relacionamentoId,
    pessoa_id: null,
    tipo: isImage ? 'imagem' : 'pdf',
    url: upload?.url ?? '',
    storage_bucket: upload?.bucket ?? null,
    storage_path: upload?.path ?? null,
    mime_type: file?.type ?? null,
    titulo: input.titulo,
    descricao: input.descricao ?? undefined,
    ano: input.ano ?? undefined,
    categoria_evento: input.categoria_evento ?? null,
    participante_ids: normalizeParticipantIds(input.participante_ids),
    ordem: input.ordem ?? arquivosExistentes.length,
  };
  const arquivos = await salvarArquivosHistoricosPorOwner(
    { linkedTo: 'relationship', relacionamentoId },
    [...arquivosExistentes, nextArquivo]
  );

  const arquivoCriado = upload
    ? arquivos.find((arquivo) => arquivo.url === upload.url) ?? arquivos[arquivos.length - 1]
    : arquivos.find((arquivo) => arquivo.titulo === input.titulo) ?? arquivos[arquivos.length - 1];
  if (!arquivoCriado) {
    throw new Error('Não foi possível localizar o arquivo histórico criado.');
  }

  return arquivoCriado;
}

export async function removerArquivoHistoricoDoRelacionamento(
  relacionamentoId: string,
  arquivoId: string
): Promise<ArquivoHistorico[]> {
  await assertAdminRelationshipFileWrite();
  const arquivos = await listarArquivosHistoricosDoRelacionamento(relacionamentoId);
  return salvarArquivosHistoricosPorOwner(
    { linkedTo: 'relationship', relacionamentoId },
    arquivos.filter((arquivo) => arquivo.id !== arquivoId)
  );
}
