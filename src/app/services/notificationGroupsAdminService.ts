import { supabase } from '../lib/supabaseClient';
import { NotificationGroup, NotificationGroupMember, NotificationGroupRule } from '../types';

function mapGroup(row: Record<string, unknown>): NotificationGroup {
  return {
    id: String(row.id),
    nome: String(row.nome ?? ''),
    descricao: row.descricao ? String(row.descricao) : null,
    ativo: row.ativo !== false,
    created_by: row.created_by ? String(row.created_by) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

function mapMember(row: Record<string, unknown>): NotificationGroupMember {
  return {
    id: String(row.id),
    group_id: String(row.group_id),
    user_id: String(row.user_id),
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

function mapRule(row: Record<string, unknown>): NotificationGroupRule {
  return {
    id: String(row.id),
    group_id: String(row.group_id),
    notification_type: String(row.notification_type ?? ''),
    enabled: row.enabled !== false,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function listNotificationGroupsAdmin() {
  const { data, error } = await supabase
    .from('notification_groups')
    .select('*')
    .order('nome', { ascending: true });

  if (error) throw new Error(error.message || 'Nao foi possivel carregar grupos de notificacao.');
  return (data || []).map(mapGroup);
}

export async function upsertNotificationGroupAdmin(payload: Partial<NotificationGroup> & { nome: string }) {
  const nextPayload = {
    id: payload.id,
    nome: payload.nome.trim(),
    descricao: payload.descricao?.trim() || null,
    ativo: payload.ativo !== false,
  };

  const { data, error } = await supabase
    .from('notification_groups')
    .upsert(nextPayload)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'Nao foi possivel salvar grupo.');
  return mapGroup(data);
}

export async function deleteNotificationGroupAdmin(groupId: string) {
  const { error } = await supabase
    .from('notification_groups')
    .delete()
    .eq('id', groupId);

  if (error) throw new Error(error.message || 'Nao foi possivel remover grupo.');
}

export async function listNotificationGroupMembersAdmin(groupId: string) {
  const { data, error } = await supabase
    .from('notification_group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message || 'Nao foi possivel carregar membros do grupo.');
  return (data || []).map(mapMember);
}

export async function replaceNotificationGroupMembersAdmin(groupId: string, userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from('notification_group_members')
    .delete()
    .eq('group_id', groupId);

  if (deleteError) throw new Error(deleteError.message || 'Nao foi possivel atualizar membros do grupo.');

  if (uniqueUserIds.length === 0) return [];

  const { data, error } = await supabase
    .from('notification_group_members')
    .insert(uniqueUserIds.map((userId) => ({ group_id: groupId, user_id: userId })))
    .select('*');

  if (error) throw new Error(error.message || 'Nao foi possivel salvar membros do grupo.');
  return (data || []).map(mapMember);
}

export async function listNotificationGroupRulesAdmin(groupId: string) {
  const { data, error } = await supabase
    .from('notification_group_rules')
    .select('*')
    .eq('group_id', groupId)
    .order('notification_type', { ascending: true });

  if (error) throw new Error(error.message || 'Nao foi possivel carregar regras do grupo.');
  return (data || []).map(mapRule);
}

export async function replaceNotificationGroupRulesAdmin(groupId: string, notificationTypes: string[]) {
  const uniqueTypes = Array.from(new Set(notificationTypes.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from('notification_group_rules')
    .delete()
    .eq('group_id', groupId);

  if (deleteError) throw new Error(deleteError.message || 'Nao foi possivel atualizar regras do grupo.');

  if (uniqueTypes.length === 0) return [];

  const { data, error } = await supabase
    .from('notification_group_rules')
    .insert(uniqueTypes.map((notificationType) => ({
      group_id: groupId,
      notification_type: notificationType,
      enabled: true,
    })))
    .select('*');

  if (error) throw new Error(error.message || 'Nao foi possivel salvar regras do grupo.');
  return (data || []).map(mapRule);
}
