import { supabase } from '../lib/supabaseClient';
import { getPrimaryLinkedPerson } from './memberProfileService';

export type PersonProfileSuggestionStatus = 'pending' | 'reviewed' | 'dismissed';

export type PersonProfileSuggestion = {
  id: string;
  requester_user_id: string;
  requester_pessoa_id?: string | null;
  target_pessoa_id: string;
  suggestion_text: string;
  status: PersonProfileSuggestionStatus;
  admin_reviewed_by?: string | null;
  admin_reviewed_at?: string | null;
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

const PERSON_PROFILE_SUGGESTIONS_TABLE = 'person_profile_suggestions';

function isMissingPersonProfileSuggestionsTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const record = error as { code?: unknown; message?: unknown; details?: unknown };
  const code = String(record.code || '');
  const text = [record.message, record.details]
    .filter(Boolean)
    .map((value) => String(value))
    .join(' ')
    .toLowerCase();

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    (text.includes(PERSON_PROFILE_SUGGESTIONS_TABLE) &&
      (text.includes('schema cache') || text.includes('could not find') || text.includes('does not exist')))
  );
}

function getMissingPersonProfileSuggestionsTableMessage() {
  return 'A tabela person_profile_suggestions ainda não está disponível no Supabase. Aplique a migration 20260608143000_create_person_profile_suggestions.sql e recarregue o schema cache.';
}

function handleMissingPersonProfileSuggestionsTable(error: unknown) {
  if (!isMissingPersonProfileSuggestionsTableError(error)) return false;

  console.warn('[Supabase] person_profile_suggestions ausente ou fora do schema cache.', error);
  return true;
}

function toPersonProfileSuggestion(row: Record<string, unknown>): PersonProfileSuggestion {
  return {
    id: String(row.id),
    requester_user_id: String(row.requester_user_id),
    requester_pessoa_id: row.requester_pessoa_id ? String(row.requester_pessoa_id) : null,
    target_pessoa_id: String(row.target_pessoa_id),
    suggestion_text: String(row.suggestion_text ?? ''),
    status: row.status as PersonProfileSuggestionStatus,
    admin_reviewed_by: row.admin_reviewed_by ? String(row.admin_reviewed_by) : null,
    admin_reviewed_at: row.admin_reviewed_at ? String(row.admin_reviewed_at) : null,
    admin_note: row.admin_note ? String(row.admin_note) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function createPersonProfileSuggestion(params: {
  targetPessoaId: string;
  suggestionText: string;
}) {
  const suggestionText = params.suggestionText.trim();

  if (!suggestionText) {
    throw new Error('Descreva a informação que deseja inserir.');
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user?.id) {
    throw new Error(authError?.message || 'Usuário autenticado não encontrado.');
  }

  const requesterLink = await getPrimaryLinkedPerson(authData.user.id);

  const { data, error } = await supabase
    .from(PERSON_PROFILE_SUGGESTIONS_TABLE)
    .insert({
      requester_user_id: authData.user.id,
      requester_pessoa_id: requesterLink.data?.pessoa_id ?? null,
      target_pessoa_id: params.targetPessoaId,
      suggestion_text: suggestionText,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    if (isMissingPersonProfileSuggestionsTableError(error)) {
      throw new Error(getMissingPersonProfileSuggestionsTableMessage());
    }

    throw new Error(error.message);
  }

  return toPersonProfileSuggestion(data as Record<string, unknown>);
}

export async function listPendingPersonProfileSuggestions() {
  const { data, error } = await supabase
    .from(PERSON_PROFILE_SUGGESTIONS_TABLE)
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    if (handleMissingPersonProfileSuggestionsTable(error)) {
      return [];
    }

    throw new Error(error.message);
  }

  return (data || []).map((row) => toPersonProfileSuggestion(row as Record<string, unknown>));
}

export async function reviewPersonProfileSuggestion(params: {
  suggestionId: string;
  status: Extract<PersonProfileSuggestionStatus, 'reviewed' | 'dismissed'>;
  adminNote?: string | null;
}) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user?.id) {
    throw new Error(authError?.message || 'Usuário autenticado não encontrado.');
  }

  const { data, error } = await supabase
    .from(PERSON_PROFILE_SUGGESTIONS_TABLE)
    .update({
      status: params.status,
      admin_note: params.adminNote ?? null,
      admin_reviewed_by: authData.user.id,
      admin_reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.suggestionId)
    .select('*')
    .single();

  if (error) {
    if (isMissingPersonProfileSuggestionsTableError(error)) {
      throw new Error(getMissingPersonProfileSuggestionsTableMessage());
    }

    throw new Error(error.message);
  }

  return toPersonProfileSuggestion(data as Record<string, unknown>);
}
