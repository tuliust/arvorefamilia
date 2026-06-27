import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ArquivoHistorico, HistoricalFileEventCategory, Pessoa } from '../types';
import { toast } from 'sonner';
import {
  Baby,
  Briefcase,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  Images,
  Plane,
  Pencil,
  Plus,
  ScrollText,
  Shield,
  Upload,
  X,
} from 'lucide-react';
import { uploadHistoricalFile } from '../services/storageService';
import { HistoricalFileFavoriteButton } from './favorites/HistoricalFileFavoriteButton';

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const HISTORICAL_FILE_EVENT_CATEGORY_OPTIONS: Array<{ value: HistoricalFileEventCategory; label: string }> = [
  { value: 'certidao_nascimento', label: 'Certidão de Nascimento' },
  { value: 'certidao_casamento', label: 'Certidão de Casamento' },
  { value: 'alistamento_militar', label: 'Alistamento Militar' },
  { value: 'imigracao', label: 'Imigração' },
  { value: 'divorcio', label: 'Divórcio' },
  { value: 'carreira_profissional', label: 'Carreira Profissional' },
  { value: 'mudanca_cidade', label: 'Mudança de Cidade' },
  { value: 'certidao_obito', label: 'Certidão de Óbito' },
  { value: 'outro', label: 'Outro' },
];

type HistoricalFileCategoryOption = { value: HistoricalFileEventCategory; label: string };
type HistoricalFileParticipant = Pick<Pessoa, 'id' | 'nome_completo'>;
type ArquivoHistoricoWithParticipants = ArquivoHistorico & {
  participante_ids?: string[];
  participantes?: HistoricalFileParticipant[];
};
type DraftHistoricalFile = {
  titulo: string;
  descricao: string;
  ano: string;
  tipo: 'imagem' | 'pdf';
  url: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  categoria_evento: HistoricalFileEventCategory | '';
  participante_ids: string[];
};

const INTERACTIVE_CATEGORY_OPTIONS: Array<
  HistoricalFileCategoryOption & { description: string; icon: React.ComponentType<{ className?: string }> }
> = [
  { value: 'certidao_nascimento', label: 'Certidão de Nascimento', description: 'Registro do nascimento.', icon: Baby },
  { value: 'alistamento_militar', label: 'Alistamento Militar', description: 'Documentos de serviço militar.', icon: Shield },
  { value: 'certidao_casamento', label: 'Certidão de Casamento', description: 'Registros de união e casamento.', icon: Heart },
  { value: 'divorcio', label: 'Divórcio', description: 'Documentos de separação ou divórcio.', icon: FileText },
  { value: 'imigracao', label: 'Imigração no Brasil', description: 'Chegada e trajetória migratória.', icon: Plane },
  { value: 'mudanca_cidade', label: 'Mudança de Cidade', description: 'Registros de mudança e recomeço.', icon: Plane },
  { value: 'carreira_profissional', label: 'Primeiro Trabalho', description: 'Início da vida profissional.', icon: Briefcase },
  { value: 'certidao_obito', label: 'Certidão de Óbito', description: 'Registro de falecimento.', icon: ScrollText },
  { value: 'outro', label: 'Outras Memórias', description: 'Fotos, documentos e lembranças.', icon: Images },
];

function sanitizeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function getExtensionFromDataUrl(url: string) {
  const match = url.match(/^data:([^;,]+)/);
  const mimeType = match?.[1];

  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';

  return null;
}

function getExtensionFromUrl(url: string) {
  if (!url) return null;
  if (url.startsWith('data:')) return getExtensionFromDataUrl(url);

  try {
    const pathname = new URL(url, window.location.href).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  } catch {
    const extension = url.split('?')[0]?.split('#')[0]?.split('.').pop()?.toLowerCase();
    if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  }

  return null;
}

function hasArquivoFile(arquivo: Pick<ArquivoHistorico, 'url'>) {
  return Boolean(String(arquivo.url ?? '').trim());
}

function getHistoricalFileName(arquivo: ArquivoHistorico) {
  const baseName = sanitizeFileName(arquivo.titulo || 'arquivo-historico') || 'arquivo-historico';
  const extension = getExtensionFromUrl(String(arquivo.url ?? '')) ?? (arquivo.tipo === 'pdf' ? 'pdf' : 'jpg');

  return baseName.endsWith(`.${extension}`) ? baseName : `${baseName}.${extension}`;
}

function openArquivoInNewTab(arquivo: ArquivoHistorico) {
  if (!hasArquivoFile(arquivo)) return;
  window.open(String(arquivo.url ?? ''), '_blank', 'noopener,noreferrer');
}

function getHistoricalFileEventCategoryLabel(value: ArquivoHistorico['categoria_evento']) {
  return HISTORICAL_FILE_EVENT_CATEGORY_OPTIONS.find((option) => option.value === value)?.label;
}
function getHistoricalRecordKindLabel(arquivo: ArquivoHistorico) {
  if (!hasArquivoFile(arquivo)) return 'Fato sem arquivo';
  if (arquivo.tipo === 'pdf' || arquivo.mime_type === 'application/pdf') return 'Arquivo PDF';
  return 'Imagem histórica';
}

function getHistoricalRecordKindClassName(arquivo: ArquivoHistorico) {
  if (!hasArquivoFile(arquivo)) return 'border-blue-100 bg-blue-50 text-blue-700';
  if (arquivo.tipo === 'pdf' || arquivo.mime_type === 'application/pdf') return 'border-red-100 bg-red-50 text-red-700';
  return 'border-emerald-100 bg-emerald-50 text-emerald-700';
}


function createEmptyDraftHistoricalFile(): DraftHistoricalFile {
  return {
    titulo: '',
    descricao: '',
    ano: '',
    tipo: 'imagem',
    url: '',
    storage_bucket: '',
    storage_path: '',
    mime_type: '',
    categoria_evento: '',
    participante_ids: [],
  };
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function ArquivoThumbnail({ arquivo }: { arquivo: Pick<ArquivoHistorico, 'tipo' | 'url' | 'titulo'> }) {
  if (!hasArquivoFile(arquivo)) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded bg-blue-50">
        <div className="flex flex-col items-center gap-1">
          <ScrollText className="h-7 w-7 text-blue-600" />
          <span className="text-[10px] font-semibold text-blue-700">FATO</span>
        </div>
      </div>
    );
  }

  return arquivo.tipo === 'imagem' ? (
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100">
      <img
        src={arquivo.url}
        alt={arquivo.titulo || 'Arquivo carregado'}
        className="h-full w-full object-cover"
      />
    </div>
  ) : (
    <div className="flex h-16 w-16 items-center justify-center rounded bg-red-50">
      <div className="flex flex-col items-center gap-1">
        <FileText className="h-7 w-7 text-red-600" />
        <span className="text-[10px] font-semibold text-red-700">PDF</span>
      </div>
    </div>
  );
}

interface ArquivosHistoricosProps {
  arquivos: ArquivoHistorico[];
  onChange: (arquivos: ArquivoHistorico[]) => void;
  pessoaId?: string | null;
  relacionamentoId?: string | null;
  readOnly?: boolean;
  onRequestAdd?: () => void;
  addButtonVariant?: 'full' | 'icon';
  showTitle?: boolean;
  eventCategoryOptions?: HistoricalFileCategoryOption[];
  variant?: 'default' | 'interactive';
  participantOptions?: HistoricalFileParticipant[];
  draftStorageKey?: string;
}

export function ArquivosHistoricos({
  arquivos,
  onChange,
  pessoaId,
  relacionamentoId,
  readOnly = false,
  onRequestAdd,
  addButtonVariant = 'full',
  showTitle = true,
  eventCategoryOptions = HISTORICAL_FILE_EVENT_CATEGORY_OPTIONS,
  variant = 'default',
  participantOptions = [],
  draftStorageKey,
}: ArquivosHistoricosProps) {
  const [novoArquivo, setNovoArquivo] = useState<DraftHistoricalFile>(() => createEmptyDraftHistoricalFile());
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState<ArquivoHistorico | null>(null);
  const hasUploadedDraftFile = Boolean(novoArquivo.url);
  const [editingArquivoId, setEditingArquivoId] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState('');
  const uploadFormRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToUploadRef = useRef(false);
  const selectedDraftParticipants = useMemo(
    () => participantOptions.filter((person) => novoArquivo.participante_ids.includes(person.id)),
    [novoArquivo.participante_ids, participantOptions]
  );

  useEffect(() => {
    if (!draftStorageKey) return;

    try {
      const rawDraft = window.localStorage.getItem(draftStorageKey);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft) as Partial<DraftHistoricalFile>;
      setNovoArquivo({ ...createEmptyDraftHistoricalFile(), ...draft });
      setIsAddingFile(Boolean(draft.url || draft.titulo || draft.descricao || draft.ano || draft.categoria_evento || draft.participante_ids?.length));
    } catch {
      // Rascunho local é auxiliar; falha de leitura não deve bloquear a tela.
    }
  }, [draftStorageKey]);


  useEffect(() => {
    if (!shouldScrollToUploadRef.current || !isAddingFile || !uploadFormRef.current) return;

    shouldScrollToUploadRef.current = false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.requestAnimationFrame(() => {
      uploadFormRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }, [isAddingFile]);

  useEffect(() => {
    if (!draftStorageKey || readOnly) return;

    try {
      if (
        !novoArquivo.url &&
        !novoArquivo.titulo &&
        !novoArquivo.descricao &&
        !novoArquivo.ano &&
        !novoArquivo.categoria_evento &&
        novoArquivo.participante_ids.length === 0
      ) {
        window.localStorage.removeItem(draftStorageKey);
        return;
      }

      window.localStorage.setItem(draftStorageKey, JSON.stringify(novoArquivo));
    } catch {
      // Rascunho local é auxiliar; falha de storage não deve bloquear o upload.
    }
  }, [draftStorageKey, novoArquivo, readOnly]);

  const resetNovoArquivo = () => {
    setNovoArquivo(createEmptyDraftHistoricalFile());
    setParticipantSearch('');
    if (draftStorageKey) {
      try {
        window.localStorage.removeItem(draftStorageKey);
      } catch {
        // noop
      }
    }
  };

  const handleToggleAddFile = () => {
    if (readOnly) {
      onRequestAdd?.();
      return;
    }

    setIsAddingFile((current) => !current);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;

    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Apenas JPG, PNG, WebP e PDF são permitidos');
      return;
    }

    setIsUploadingFile(true);
    try {
      const upload = await uploadHistoricalFile(file, { pessoaId, relacionamentoId });
      setNovoArquivo((prev) => ({
        ...prev,
        url: upload.url,
        storage_bucket: upload.bucket,
        storage_path: upload.path,
        mime_type: file.type || 'application/octet-stream',
        tipo: isImage ? 'imagem' : 'pdf',
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível enviar o arquivo.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleInteractiveCategorySelect = (category: HistoricalFileEventCategory) => {
    const option = INTERACTIVE_CATEGORY_OPTIONS.find((item) => item.value === category);

    shouldScrollToUploadRef.current = true;
    setNovoArquivo((current) => ({
      ...current,
      categoria_evento: category,
      titulo: option?.label ?? '',
      descricao: option?.description ?? '',
    }));
    setIsAddingFile(true);
  };

  const handleAddDraftParticipant = (personId: string) => {
    setNovoArquivo((current) => current.participante_ids.includes(personId)
      ? current
      : { ...current, participante_ids: [...current.participante_ids, personId] });
    setParticipantSearch('');
  };

  const handleRemoveDraftParticipant = (personId: string) => {
    setNovoArquivo((current) => ({
      ...current,
      participante_ids: current.participante_ids.filter((id) => id !== personId),
    }));
  };

  const getParticipantsFromIds = (ids: string[]) => {
    const peopleById = new Map(participantOptions.map((person) => [person.id, person]));
    return ids
      .map((id) => peopleById.get(id))
      .filter((person): person is HistoricalFileParticipant => Boolean(person));
  };

  const getArquivoParticipantIds = (arquivo: ArquivoHistorico) => (
    (arquivo as ArquivoHistoricoWithParticipants).participante_ids ?? []
  );

  const getArquivoParticipants = (arquivo: ArquivoHistorico) => {
    const archiveWithParticipants = arquivo as ArquivoHistoricoWithParticipants;
    const byIds = getParticipantsFromIds(getArquivoParticipantIds(arquivo));
    return byIds.length > 0 ? byIds : archiveWithParticipants.participantes ?? [];
  };

  const renderParticipantSelector = (
    selectedParticipants: HistoricalFileParticipant[],
    selectedIds: string[],
    onAdd: (personId: string) => void,
    onRemove: (personId: string) => void,
    searchValue: string,
    onSearchChange: (value: string) => void
  ) => {
    const selectedSet = new Set(selectedIds);
    const query = normalizeSearchText(searchValue.trim());
    const options = participantOptions
      .filter((person) => !selectedSet.has(person.id))
      .filter((person) => !query || normalizeSearchText(person.nome_completo).includes(query));

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Pessoas participantes
        </label>
        {selectedParticipants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedParticipants.map((person) => (
              <span key={person.id} className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                <span className="truncate">{person.nome_completo}</span>
                <button
                  type="button"
                  onClick={() => onRemove(person.id)}
                  className="rounded-full p-0.5 text-blue-700 hover:bg-blue-100"
                  aria-label={`Remover ${person.nome_completo}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="rounded-lg border border-gray-200 bg-white p-2">
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar pessoa pelo nome"
            className="h-9"
          />
          {participantOptions.length === 0 ? (
            <p className="px-1 py-2 text-xs text-gray-500">Nenhuma pessoa disponível para seleção.</p>
          ) : (
            <div className="mt-2 max-h-44 overflow-y-auto">
              {options.length > 0 ? (
                options.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => onAdd(person.id)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {person.nome_completo}
                  </button>
                ))
              ) : (
                <p className="px-1 py-2 text-xs text-gray-500">Nenhuma pessoa encontrada.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleAddArquivo = () => {
    const titulo = novoArquivo.titulo.trim();
    const descricao = novoArquivo.descricao.trim();

    if (!titulo && !descricao) {
      toast.error('Informe pelo menos um título ou uma descrição para salvar o fato ou memória.');
      return;
    }

    const arquivo: ArquivoHistoricoWithParticipants = {
      id: `arquivo-${Date.now()}`,
      tipo: novoArquivo.tipo,
      url: novoArquivo.url.trim(),
      storage_bucket: novoArquivo.storage_bucket || undefined,
      storage_path: novoArquivo.storage_path || undefined,
      mime_type: novoArquivo.mime_type || undefined,
      titulo: titulo || 'Memória sem título',
      pessoa_id: pessoaId ?? null,
      relacionamento_id: relacionamentoId ?? null,
      descricao: descricao || undefined,
      ano: novoArquivo.ano || undefined,
      categoria_evento: novoArquivo.categoria_evento || null,
      participante_ids: novoArquivo.participante_ids,
      participantes: selectedDraftParticipants,
      ordem: arquivos.length,
    };

    onChange([...arquivos, arquivo]);
    resetNovoArquivo();
    setIsAddingFile(false);
    setEditingArquivoId(null);
  };

  const handleRemoveArquivo = (id: string) => {
    onChange(arquivos.filter((arquivo) => arquivo.id !== id));
    setEditingArquivoId((current) => (current === id ? null : current));
  };

  const handleUpdateArquivo = (id: string, updates: Partial<ArquivoHistoricoWithParticipants>) => {
    onChange(arquivos.map((arquivo) => (
      arquivo.id === id ? { ...(arquivo as ArquivoHistoricoWithParticipants), ...updates } : arquivo
    )) as ArquivoHistorico[]);
  };


  const handleViewFile = (arquivo: ArquivoHistorico) => {
    if (!hasArquivoFile(arquivo)) return;
    setPreviewFile(arquivo);
  };

  const handleDownloadArquivo = (arquivo: ArquivoHistorico) => {
    if (!hasArquivoFile(arquivo)) return;
    const link = document.createElement('a');
    link.href = String(arquivo.url ?? '');
    link.download = getHistoricalFileName(arquivo);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="min-w-0">
        {(showTitle || !readOnly || onRequestAdd) && (
          <CardHeader>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {showTitle ? (
                <CardTitle className="flex items-center gap-2 break-words">
                  <ScrollText className="h-5 w-5 shrink-0 text-blue-600" />
                  Fatos e Arquivos Históricos
                </CardTitle>
              ) : <div />}
              {variant === 'default' && (!readOnly || onRequestAdd) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={readOnly || addButtonVariant === 'icon' ? 'h-9 w-9 shrink-0 rounded-full p-0' : 'w-full sm:w-auto'}
                  onClick={handleToggleAddFile}
                  aria-label={readOnly || addButtonVariant === 'icon' ? 'Inserir fato ou arquivo histórico' : undefined}
                  title={readOnly || addButtonVariant === 'icon' ? 'Inserir fato ou arquivo histórico' : undefined}
                >
                  {readOnly || addButtonVariant === 'icon' ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Adicionar fato ou arquivo
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {variant === 'interactive' && !readOnly && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Que tipo de fato, memória ou arquivo deseja adicionar?</h3>
                <p className="mt-1 text-xs text-gray-500">Escolha uma categoria para registrar uma história em texto e, se quiser, anexar uma imagem ou PDF.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-2 lg:grid-cols-3">
                {INTERACTIVE_CATEGORY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = novoArquivo.categoria_evento === option.value && isAddingFile;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleInteractiveCategorySelect(option.value)}
                      className={`min-w-0 rounded-xl border p-3 text-left transition-colors ${
                        selected
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selected ? 'text-blue-700' : 'text-gray-600'}`} />
                      <span className="mt-2 block break-words text-sm font-semibold text-gray-900">{option.label}</span>
                      <span className="mt-1 block break-words text-xs text-gray-500">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(isAddingFile || hasUploadedDraftFile) && !readOnly && (
            <div ref={uploadFormRef} className="scroll-mt-24 space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
              {hasUploadedDraftFile && (
                <div className="flex min-w-0 items-center gap-3 rounded-lg border border-green-100 bg-white p-3">
                  <ArquivoThumbnail arquivo={{ tipo: novoArquivo.tipo, url: novoArquivo.url, titulo: novoArquivo.titulo }} />
                  <div className="min-w-0">
                    <p className="mt-1 break-words text-xs text-green-600">
                      ✓ Arquivo carregado ({novoArquivo.tipo})
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Preencha os dados abaixo e clique em Adicionar.
                    </p>
                  </div>
                </div>
              )}

              {isAddingFile && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {variant === 'interactive' ? 'Arquivo opcional' : 'Arquivo opcional'}
                    </label>
                    {variant === 'interactive' ? (
                      <label
                        className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          void handleFile(event.dataTransfer.files?.[0]);
                        }}
                      >
                        <Upload className="h-6 w-6 text-blue-600" />
                        <span className="mt-2 text-sm font-medium text-gray-900">Anexe uma imagem ou PDF, se houver</span>
                        <span className="mt-1 text-xs text-gray-500">Você também pode salvar apenas o texto do fato ou memória.</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          disabled={isUploadingFile}
                          className="sr-only"
                        />
                      </label>
                    ) : (
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                        disabled={isUploadingFile}
                        className="cursor-pointer"
                      />
                    )}
                    {isUploadingFile && (
                      <p className="mt-1 break-words text-xs text-blue-600">
                        Enviando arquivo para o Storage...
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Título *
                    </label>
                    <Input
                      type="text"
                      value={novoArquivo.titulo}
                      onChange={(e) => setNovoArquivo((prev) => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Chegada ao Brasil, casamento, primeira casa..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      value={novoArquivo.descricao}
                      onChange={(e) => setNovoArquivo((prev) => ({ ...prev, descricao: e.target.value }))}
                      rows={2}
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Conte a história, memória ou contexto deste registro..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Ano
                    </label>
                    <Input
                      type="text"
                      value={novoArquivo.ano}
                      onChange={(e) => setNovoArquivo((prev) => ({ ...prev, ano: e.target.value }))}
                      placeholder="Ex: 1950"
                    />
                  </div>

                  {renderParticipantSelector(
                    selectedDraftParticipants,
                    novoArquivo.participante_ids,
                    handleAddDraftParticipant,
                    handleRemoveDraftParticipant,
                    participantSearch,
                    setParticipantSearch
                  )}

                  {variant === 'default' && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Categoria
                      </label>
                      <select
                        value={novoArquivo.categoria_evento}
                        onChange={(e) => setNovoArquivo((prev) => ({
                          ...prev,
                          categoria_evento: e.target.value as HistoricalFileEventCategory | '',
                        }))}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Sem categoria</option>
                        {eventCategoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setIsAddingFile(false);
                        resetNovoArquivo();
                      }}
                      disabled={isUploadingFile}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={handleAddArquivo}
                      disabled={isUploadingFile}
                    >
                      Adicionar
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {arquivos.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Nenhum fato ou arquivo histórico adicionado
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {arquivos.map((arquivo) => (
                <div
                  key={arquivo.id}
                  className="min-w-0 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0">
                      <ArquivoThumbnail arquivo={arquivo} />
                    </div>

                    <div className="min-w-0 flex-1">
                      {readOnly || editingArquivoId !== arquivo.id ? (
                        <>
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <h4 className="min-w-0 break-words text-sm font-medium text-gray-900">
                              {arquivo.titulo}
                            </h4>
                            <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getHistoricalRecordKindClassName(arquivo)}`}>
                              {getHistoricalRecordKindLabel(arquivo)}
                            </span>
                          </div>
                          {arquivo.ano && (
                            <p className="mt-1 break-words text-xs text-gray-500">{arquivo.ano}</p>
                          )}
                          {arquivo.categoria_evento && (
                            <p className="mt-1 break-words text-xs font-medium text-gray-600">
                              {getHistoricalFileEventCategoryLabel(arquivo.categoria_evento)}
                            </p>
                          )}
                          {arquivo.descricao && (
                            <p className="mt-1 line-clamp-2 break-words text-xs text-gray-500">
                              {arquivo.descricao}
                            </p>
                          )}
                          {getArquivoParticipants(arquivo).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {getArquivoParticipants(arquivo).map((person) => (
                                <span key={person.id} className="max-w-full truncate rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                  {person.nome_completo}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            {readOnly ? (
                              <>
                                <HistoricalFileFavoriteButton
                                  arquivo={arquivo}
                                  pessoaId={pessoaId}
                                  relacionamentoId={relacionamentoId}
                                  className="h-8 w-8 border-gray-200"
                                />
                                {hasArquivoFile(arquivo) ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleViewFile(arquivo)}
                                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    >
                                      <Eye className="h-3 w-3" />
                                      Visualizar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDownloadArquivo(arquivo)}
                                      className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                                    >
                                      <Download className="h-3 w-3" />
                                      Baixar arquivo
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openArquivoInNewTab(arquivo)}
                                      className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Abrir
                                    </button>
                                  </>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <ScrollText className="h-3 w-3" />
                                    Fato ou memória sem arquivo anexado
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingArquivoId(arquivo.id)}
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveArquivo(arquivo.id)}
                                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                                >
                                  <X className="h-3 w-3" />
                                  Remover
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            value={arquivo.titulo}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, { titulo: event.target.value })}
                            placeholder="Título"
                            className="h-8 bg-white text-sm"
                          />
                          <Input
                            value={arquivo.ano ?? ''}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, { ano: event.target.value })}
                            placeholder="Ano"
                            className="h-8 bg-white text-sm"
                          />
                          <select
                            value={arquivo.categoria_evento ?? ''}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, {
                              categoria_evento: event.target.value
                                ? event.target.value as HistoricalFileEventCategory
                                : null,
                            })}
                            className="flex h-8 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm"
                            aria-label="Categoria histórica"
                          >
                            <option value="">Sem categoria</option>
                            {eventCategoryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={arquivo.descricao ?? ''}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, { descricao: event.target.value })}
                            rows={2}
                            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            placeholder="Descrição"
                          />
                          {renderParticipantSelector(
                            getArquivoParticipants(arquivo),
                            getArquivoParticipantIds(arquivo),
                            (personId) => {
                              const nextIds = Array.from(new Set([...(getArquivoParticipantIds(arquivo)), personId]));
                              handleUpdateArquivo(arquivo.id, {
                                participante_ids: nextIds,
                                participantes: getParticipantsFromIds(nextIds),
                              });
                            },
                            (personId) => {
                              const nextIds = (getArquivoParticipantIds(arquivo)).filter((id) => id !== personId);
                              handleUpdateArquivo(arquivo.id, {
                                participante_ids: nextIds,
                                participantes: getParticipantsFromIds(nextIds),
                              });
                            },
                            participantSearch,
                            setParticipantSearch
                          )}
                          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => setEditingArquivoId(null)}
                            >
                              Cancelar edição
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => setEditingArquivoId(null)}
                            >
                              Concluir edição
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewFile} onOpenChange={(open) => {
        if (!open) setPreviewFile(null);
      }}>
        <DialogContent className="grid max-h-[92vh] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="break-words">
              {previewFile?.titulo ? `Visualização: ${previewFile.titulo}` : 'Visualização do arquivo'}
            </DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="min-h-0 overflow-auto rounded-lg border bg-gray-50 p-3">
              {previewFile.url && (previewFile.tipo === 'imagem' || previewFile.url.startsWith('data:image')) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.titulo || 'Arquivo histórico'}
                  className="mx-auto max-h-[68vh] w-auto max-w-full rounded object-contain"
                />
              ) : (
                <div className="space-y-3">
                  <iframe
                    src={previewFile.url}
                    className="h-[68vh] w-full rounded border bg-white"
                    title={`Preview do PDF ${previewFile.titulo || 'arquivo histórico'}`}
                  />
                  <p className="break-words text-xs text-gray-600">
                    Se o PDF não carregar no navegador, use “Abrir em nova aba”.
                  </p>
                </div>
              )}
            </div>
          )}
          {previewFile && (
            <DialogFooter className="sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDownloadArquivo(previewFile)}
              >
                <Download className="h-4 w-4" />
                Baixar arquivo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => openArquivoInNewTab(previewFile)}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba
              </Button>
              <DialogClose asChild>
                <Button type="button" className="w-full sm:w-auto">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
