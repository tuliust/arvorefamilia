import { User } from '@supabase/supabase-js';
import { getPrimaryLinkedPerson } from './memberProfileService';
import type { UserPersonLinkRecord } from './memberProfileService';
import { supabase } from '../lib/supabaseClient';

export async function isAdminUser(user?: User | null) {
  if (!user) return { isAdmin: false, error: undefined as string | undefined };

  const { data, error } = await supabase.rpc('is_admin_user', { target_user_id: user.id });

  if (!error) {
    return { isAdmin: Boolean(data), error: undefined };
  }

  return { isAdmin: false, error: error.message };
}

export function canEditPerson(params: {
  currentUser?: User | null;
  pessoaId?: string | null;
  linkedPessoaId?: string | null;
  isAdmin?: boolean;
}) {
  const { currentUser, pessoaId, linkedPessoaId, isAdmin = false } = params;
  if (!currentUser || !pessoaId) return false;

  return isAdmin || linkedPessoaId === pessoaId;
}

export function canEditLinkedPersonRecord(
  link?: Pick<UserPersonLinkRecord, 'can_edit' | 'relacao_com_perfil' | 'permission_role'> | null
) {
  if (!link) return false;

  if (link.can_edit === false && link.relacao_com_perfil !== 'Sou esta pessoa') {
    return false;
  }

  if (link.permission_role === 'viewer') {
    return false;
  }

  if (
    link.permission_role === 'owner' ||
    link.permission_role === 'editor' ||
    link.permission_role === 'legacy_editor' ||
    link.permission_role === 'guardian'
  ) {
    return true;
  }

  return link.can_edit !== false || link.relacao_com_perfil === 'Sou esta pessoa';
}

export async function getLinkedPessoaIdForUser(userId: string) {
  const { data, error } = await getPrimaryLinkedPerson(userId);
  return { error, data: data?.pessoa_id ?? null };
}
