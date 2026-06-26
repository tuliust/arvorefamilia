import { supabase } from '../lib/supabaseClient';
import { UserPersonPermissionRole } from '../types';

export type ProfileControlRequestReason = 'deceased' | 'minor_or_dependent' | 'close_family' | 'other';
export type ProfileControlRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type ProfileManagerSummary = {
  user_id: string;
  nome_exibicao: string;
  avatar_url?: string | null;
  permission_role?: UserPersonPermissionRole | string | null;
  principal?: boolean | null;
  can_edit?: boolean | null;
};

export type ProfileControlRequestRecord = {
  id: string;
  requester_user_id: string;
  requester_pessoa_id?: string | null;
  target_pessoa_id: string;
  reason: ProfileControlRequestReason;
  description?: string | null;
  status: ProfileControlRequestStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  admin_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminProfileControlRequestRecord = ProfileControlRequestRecord & {
  requester_label: string;
  requester_email?: string | null;
  target_label: string;
};

function normalizeRequestReason(reason: string | null | undefined): ProfileControlRequestReason {
  if (reason === 'deceased' || reason === 'minor_or_dependent' || reason === 'close_family' || reason === 'other') {
    return reason;
  }

  return 'other';
}

function normalizeRequestStatus(status: string | null | undefined): ProfileControlRequestStatus {
  if (status === 'pending' || status === 'approved' || status === 'rejected' || status === 'cancelled') {
    return status;
  }

  return 'pending';
}

function normalizeProfileControlRequest(row: any): ProfileControlRequestRecord {
  return {
    ...row,
    reason: normalizeRequestReason(row?.reason),
    status: normalizeRequestStatus(row?.status),
  } as ProfileControlRequestRecord;
}

function normalizeAdminProfileControlRequest(row: any): AdminProfileControlRequestRecord {
  return {
    ...normalizeProfileControlRequest(row),
    requester_label: String(row?.requester_label ?? 'Usuário solicitante'),
    requester_email: row?.requester_email ?? null,
    target_label: String(row?.target_label ?? 'Pessoa solicitada'),
  };
}

export async function listProfileManagersForPerson(pessoaId: string) {
  const { data, error } = await supabase.rpc('list_profile_managers', {
    target_pessoa_id: pessoaId,
  });

  return {
    error: error?.message,
    data: ((data || []) as ProfileManagerSummary[]).map((manager) => ({
      ...manager,
      nome_exibicao: manager.nome_exibicao || 'Usuário responsável',
    })),
  };
}

export async function createProfileControlRequest(params: {
  targetPessoaId: string;
  reason: ProfileControlRequestReason;
  description?: string | null;
}) {
  const { data, error } = await supabase
    .rpc('create_profile_control_request', {
      target_pessoa_id: params.targetPessoaId,
      request_reason: params.reason,
      request_description: params.description ?? null,
    })
    .maybeSingle();

  return {
    error: error?.message,
    data: data ? normalizeProfileControlRequest(data) : null,
  };
}

export async function listMyProfileControlRequests() {
  const { data, error } = await supabase
    .from('profile_control_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return {
    error: error?.message,
    data: ((data || []) as any[]).map(normalizeProfileControlRequest),
  };
}

export async function adminListProfileControlRequests() {
  const { data, error } = await supabase.rpc('admin_list_profile_control_requests');

  return {
    error: error?.message,
    data: ((data || []) as any[]).map(normalizeAdminProfileControlRequest),
  };
}

export async function adminReviewProfileControlRequest(params: {
  requestId: string;
  status: Exclude<ProfileControlRequestStatus, 'pending'>;
  adminNote?: string | null;
  permissionRole?: UserPersonPermissionRole | null;
}) {
  const { data, error } = await supabase
    .rpc('admin_review_profile_control_request', {
      request_id: params.requestId,
      next_status: params.status,
      review_note: params.adminNote ?? null,
      permission_role: params.permissionRole ?? null,
    })
    .maybeSingle();

  return {
    error: error?.message,
    data: data ? normalizeProfileControlRequest(data) : null,
  };
}
