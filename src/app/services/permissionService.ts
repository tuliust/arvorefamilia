import { User } from '@supabase/supabase-js';
import { getPrimaryLinkedPerson } from './memberProfileService';
import type { UserPersonLinkRecord } from './memberProfileService';
import { supabase } from '../lib/supabaseClient';

const ADMIN_STATUS_CACHE_TTL_MS = 60_000;
const adminStatusCache = new Map<string, { isAdmin: boolean; expiresAt: number }>();
const adminStatusRequests = new Map<string, Promise<{ isAdmin: boolean; error?: string }>>();

export function invalidateAdminUserCache(userId?: string) {
  if (userId) {
    adminStatusCache.delete(userId);
    adminStatusRequests.delete(userId);
    return;
  }

  adminStatusCache.clear();
  adminStatusRequests.clear();
}

export async function isAdminUser(user?: User | null) {
  if (!user) return { isAdmin: false, error: undefined as string | undefined };

  const cached = adminStatusCache.get(user.id);
  if (cached && cached.expiresAt > Date.now()) {
    return { isAdmin: cached.isAdmin, error: undefined as string | undefined };
  }

  const inFlight = adminStatusRequests.get(user.id);
  if (inFlight) return inFlight;

  const request = (async () => {
    const { data, error } = await supabase.rpc('is_admin_user', { target_user_id: user.id });

    if (!error) {
      const result = { isAdmin: Boolean(data), error: undefined as string | undefined };
      adminStatusCache.set(user.id, {
        isAdmin: result.isAdmin,
        expiresAt: Date.now() + ADMIN_STATUS_CACHE_TTL_MS,
      });
      return result;
    }

    return { isAdmin: false, error: error.message };
  })().finally(() => {
    adminStatusRequests.delete(user.id);
  });

  adminStatusRequests.set(user.id, request);
  return request;
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
