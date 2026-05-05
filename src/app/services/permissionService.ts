import { User } from '@supabase/supabase-js';
import { getPrimaryLinkedPerson } from './memberProfileService';

export const MAIN_ADMIN_EMAIL = 'tuliust@gmail.com';

export function isMainAdmin(user?: User | null) {
  return user?.email?.trim().toLowerCase() === MAIN_ADMIN_EMAIL;
}

export function canEditPerson(params: {
  currentUser?: User | null;
  pessoaId?: string | null;
  linkedPessoaId?: string | null;
}) {
  const { currentUser, pessoaId, linkedPessoaId } = params;
  if (!currentUser || !pessoaId) return false;

  return isMainAdmin(currentUser) || linkedPessoaId === pessoaId;
}

export async function getLinkedPessoaIdForUser(userId: string) {
  const { data, error } = await getPrimaryLinkedPerson(userId);
  return { error, data: data?.pessoa_id ?? null };
}
