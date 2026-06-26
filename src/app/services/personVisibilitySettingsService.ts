import { supabase } from '../lib/supabaseClient';
import { PersonVisibilitySettings } from '../types';

const VISIBILITY_TABLE = 'person_visibility_settings';

const DEFAULT_SETTINGS = {
  perfil_visivel: true,
  arvore_visivel: true,
  mapa_familiar_visivel: true,
  curiosidades_visivel: true,
  arquivos_historicos_visivel: true,
  calendario_visivel: true,
  forum_visivel: true,
  dados_sensiveis_visiveis: false,
} satisfies Omit<PersonVisibilitySettings, 'id' | 'pessoa_id' | 'created_at' | 'updated_at'>;

function isMissingVisibilityTableError(error: unknown) {
  const supabaseError = error as { code?: string; message?: string; details?: string; hint?: string } | null | undefined;
  const message = [supabaseError?.message, supabaseError?.details, supabaseError?.hint].filter(Boolean).join(' ');

  return (
    supabaseError?.code === '42P01' ||
    supabaseError?.code === 'PGRST205' ||
    message.includes(VISIBILITY_TABLE) ||
    message.includes('schema cache') ||
    message.includes('Could not find the table')
  );
}

function createDefaultSettings(pessoaId: string): PersonVisibilitySettings {
  return {
    id: `local-${pessoaId}`,
    pessoa_id: pessoaId,
    ...DEFAULT_SETTINGS,
  };
}

function mapRow(row: Record<string, unknown>, pessoaId: string): PersonVisibilitySettings {
  return {
    id: String(row.id ?? `local-${pessoaId}`),
    pessoa_id: String(row.pessoa_id ?? pessoaId),
    perfil_visivel: row.perfil_visivel !== false,
    arvore_visivel: row.arvore_visivel !== false,
    mapa_familiar_visivel: row.mapa_familiar_visivel !== false,
    curiosidades_visivel: row.curiosidades_visiveis !== false && row.curiosidades_visivel !== false,
    arquivos_historicos_visivel: row.arquivos_historicos_visivel !== false,
    calendario_visivel: row.calendario_visivel !== false,
    forum_visivel: row.forum_visivel !== false,
    dados_sensiveis_visiveis: row.dados_sensiveis_visiveis === true,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function getPersonVisibilitySettings(pessoaId: string): Promise<PersonVisibilitySettings> {
  const { data, error } = await supabase
    .from(VISIBILITY_TABLE)
    .select('*')
    .eq('pessoa_id', pessoaId)
    .maybeSingle();

  if (error) {
    if (isMissingVisibilityTableError(error)) {
      console.warn('[Supabase] Tabela de visibilidade de pessoas ausente. Usando defaults locais.', error.message);
      return createDefaultSettings(pessoaId);
    }

    throw new Error(error.message || 'Não foi possível carregar configurações de visibilidade.');
  }

  if (!data) {
    return createDefaultSettings(pessoaId);
  }

  return mapRow(data, pessoaId);
}

export async function upsertPersonVisibilitySettings(
  pessoaId: string,
  payload: Partial<PersonVisibilitySettings>,
): Promise<PersonVisibilitySettings> {
  const nextPayload = {
    pessoa_id: pessoaId,
    ...DEFAULT_SETTINGS,
    ...payload,
  };

  delete (nextPayload as Partial<PersonVisibilitySettings>).id;
  delete (nextPayload as Partial<PersonVisibilitySettings>).created_at;
  delete (nextPayload as Partial<PersonVisibilitySettings>).updated_at;

  const { data, error } = await supabase
    .from(VISIBILITY_TABLE)
    .upsert(nextPayload, { onConflict: 'pessoa_id' })
    .select('*')
    .single();

  if (error) {
    if (isMissingVisibilityTableError(error)) {
      console.warn('[Supabase] Tabela de visibilidade de pessoas ausente. Retornando estado local.', error.message);
      return mapRow(nextPayload, pessoaId);
    }

    throw new Error(error.message || 'Não foi possível salvar configurações de visibilidade.');
  }

  return mapRow(data, pessoaId);
}

export async function listPersonVisibilitySettings() {
  const { data, error } = await supabase
    .from(VISIBILITY_TABLE)
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    if (isMissingVisibilityTableError(error)) {
      console.warn('[Supabase] Tabela de visibilidade de pessoas ausente. Retornando lista vazia.', error.message);
      return [];
    }

    throw new Error(error.message || 'Não foi possível listar configurações de visibilidade.');
  }

  return (data || []).map((row) => mapRow(row, String(row.pessoa_id ?? '')));
}
