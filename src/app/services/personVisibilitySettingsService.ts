import { supabase } from '../lib/supabaseClient';
import { PersonVisibilitySettings } from '../types';

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
    .from('person_visibility_settings')
    .select('*')
    .eq('pessoa_id', pessoaId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Nao foi possivel carregar configuracoes de visibilidade.');
  }

  if (!data) {
    return {
      id: `local-${pessoaId}`,
      pessoa_id: pessoaId,
      ...DEFAULT_SETTINGS,
    };
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
    .from('person_visibility_settings')
    .upsert(nextPayload, { onConflict: 'pessoa_id' })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message || 'Nao foi possivel salvar configuracoes de visibilidade.');
  }

  return mapRow(data, pessoaId);
}

export async function listPersonVisibilitySettings() {
  const { data, error } = await supabase
    .from('person_visibility_settings')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Nao foi possivel listar configuracoes de visibilidade.');
  }

  return (data || []).map((row) => mapRow(row, String(row.pessoa_id ?? '')));
}
