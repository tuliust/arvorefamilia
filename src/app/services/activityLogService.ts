import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import {
  ActivityLog,
  ActivityLogAction,
  ActivityLogEntityType,
  ActivityLogFilters,
  CreateActivityLogPayload,
  Pessoa,
} from '../types';

type ActorProfileLike = {
  nome_exibicao?: string | null;
  avatar_url?: string | null;
};

export const ACTIVITY_ACTION_LABELS: Record<ActivityLogAction, string> = {
  'person.created': 'Pessoa criada',
  'person.updated': 'Pessoa atualizada',
  'person.photo_updated': 'Foto atualizada',
  'person.privacy_updated': 'Privacidade atualizada',
  'user_person_link.created': 'Vínculo de usuário criado',
  'user_person_link.updated': 'Vínculo de usuário atualizado',
  'user_person_link.deleted': 'Vínculo de usuário removido',
  'person_insights.generated': 'Insights da pessoa gerados',
  'person_insights.regenerated': 'Insights da pessoa regenerados',
  'person_event.added': 'Evento da pessoa adicionado',
  'person_event.updated': 'Evento da pessoa atualizado',
  'person_event.removed': 'Evento da pessoa removido',
  'relationship_change_requested': 'Solicitação de vínculo criada',
  'relationship_change_approved': 'Solicitação de vínculo aprovada',
  'relationship_change_rejected': 'Solicitação de vínculo rejeitada',
  'relationship_change_cancelled': 'Solicitação de vínculo cancelada',
  'relationship.created': 'Relacionamento criado',
  'relationship.updated': 'Relacionamento atualizado',
  'relationship.deleted': 'Relacionamento removido',
  'historical_file.added': 'Arquivo histórico adicionado',
  'historical_file.removed': 'Arquivo histórico removido',
  'historical_file.updated': 'Arquivo histórico atualizado',
  'notification_preferences.updated': 'Preferências de notificação atualizadas',
  'notification.created': 'Notificação criada',
  'notification.dispatched': 'Notificação disparada',
  'notification.dispatch_failed': 'Falha no disparo de notificação',
  'notification.marked_read': 'Notificação marcada como lida',
  'notification.removed': 'Notificação removida',
  'first_access.confirmed': 'Primeiro acesso confirmado',
};

export const ACTIVITY_ENTITY_LABELS: Record<ActivityLogEntityType, string> = {
  person: 'Pessoa',
  user_person_link: 'Vínculo de usuário',
  person_event: 'Evento da pessoa',
  relationship: 'Relacionamento',
  historical_file: 'Arquivo histórico',
  notification_preferences: 'Notificações',
  notification: 'Notificação',
  notification_dispatch: 'Disparo de notificação',
  first_access: 'Primeiro acesso',
};

const METADATA_LABELS: Record<string, string> = {
  changed_fields: 'Campos',
  file_type: 'Tipo de arquivo',
  event_type: 'Tipo de evento',
  has_description: 'Descrição',
  has_inverse: 'Inverso',
  has_observations: 'Observações',
  has_separation_date: 'Data de separação',
  had_inverse: 'Inverso',
  has_photo: 'Foto',
  has_year: 'Ano',
  humano_ou_pet: 'Tipo',
  manual_generation: 'Geração manual',
  order: 'Ordem',
  preference_keys: 'Preferências',
  relationship_subtype: 'Subtipo',
  relationship_type: 'Tipo de vínculo',
};

function toActivityLog(row: Record<string, unknown>): ActivityLog {
  return {
    id: String(row.id),
    actor_user_id: row.actor_user_id ? String(row.actor_user_id) : null,
    actor_pessoa_id: row.actor_pessoa_id ? String(row.actor_pessoa_id) : null,
    actor_display_name: row.actor_display_name ? String(row.actor_display_name) : null,
    action: row.action as ActivityLog['action'],
    entity_type: row.entity_type as ActivityLog['entity_type'],
    entity_id: row.entity_id ? String(row.entity_id) : null,
    entity_label: row.entity_label ? String(row.entity_label) : null,
    metadata: (row.metadata as Record<string, unknown> | null) ?? {},
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return {};

  const blockedKeys = new Set([
    'telefone',
    'phone',
    'endereco',
    'address',
    'email',
    'rede_social',
    'instagram_usuario',
    'instagram_url',
    'url',
  ]);

  return Object.entries(metadata).reduce<Record<string, unknown>>((safeMetadata, [key, value]) => {
    if (blockedKeys.has(key)) return safeMetadata;
    if (value === undefined) return safeMetadata;
    safeMetadata[key] = value;
    return safeMetadata;
  }, {});
}

export function buildActivityActorFromUser(
  user?: User | null,
  pessoa?: Pick<Pessoa, 'id' | 'nome_completo'> | null,
  profile?: ActorProfileLike | null
): Pick<CreateActivityLogPayload, 'actor_user_id' | 'actor_pessoa_id' | 'actor_display_name'> {
  const metadata = user?.user_metadata ?? {};
  const displayName = (
    pessoa?.nome_completo ||
    profile?.nome_exibicao ||
    (metadata.nome_exibicao as string | undefined) ||
    (metadata.name as string | undefined) ||
    (metadata.full_name as string | undefined) ||
    user?.email ||
    ''
  ).trim();

  return {
    actor_user_id: user?.id ?? null,
    actor_pessoa_id: pessoa?.id ?? null,
    actor_display_name: displayName || null,
  };
}

async function getCurrentActor() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[Supabase] Erro ao obter usuário para activity log:', error.message);
  }

  return buildActivityActorFromUser(data.user);
}

export async function createActivityLog(payload: CreateActivityLogPayload): Promise<ActivityLog | null> {
  try {
    const currentActor = payload.actor_user_id ? {} : await getCurrentActor();
    const activityPayload = {
      ...currentActor,
      ...payload,
      metadata: sanitizeMetadata(payload.metadata),
    };

    if (!activityPayload.actor_user_id) {
      return null;
    }

    const { error } = await supabase
      .from('activity_logs')
      .insert(activityPayload);

    if (error) {
      console.error('[Supabase] Erro ao registrar activity log:', error.message, error);
      return null;
    }

    return null;
  } catch (error) {
    console.error('[Supabase] Erro inesperado ao registrar activity log:', error);
    return null;
  }
}

export async function listRecentActivityLogs(limit = 50): Promise<ActivityLog[]> {
  return listActivityLogs({ limit });
}

export async function listActivityLogs(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
  try {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters.limit ?? 50);

    if (filters.actor_user_id) query = query.eq('actor_user_id', filters.actor_user_id);
    if (filters.actor_pessoa_id) query = query.eq('actor_pessoa_id', filters.actor_pessoa_id);
    if (filters.actor_query) query = query.ilike('actor_display_name', `%${filters.actor_query}%`);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
    if (filters.entity_id) query = query.eq('entity_id', filters.entity_id);
    if (filters.entity_query) query = query.ilike('entity_label', `%${filters.entity_query}%`);
    if (filters.created_from) query = query.gte('created_at', filters.created_from);
    if (filters.created_to) query = query.lte('created_at', filters.created_to);

    const { data, error } = await query;

    if (error) {
      console.error('[Supabase] Erro ao listar activity logs:', error.message);
      return [];
    }

    return (data || []).map(toActivityLog);
  } catch (error) {
    console.error('[Supabase] Erro inesperado ao listar activity logs:', error);
    return [];
  }
}

export function getActivityActionLabel(action: ActivityLogAction) {
  return ACTIVITY_ACTION_LABELS[action] ?? action;
}

export function getActivityEntityLabel(entityType: ActivityLogEntityType) {
  return ACTIVITY_ENTITY_LABELS[entityType] ?? entityType;
}

function formatMetadataValue(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

export function getActivityMetadataSummary(metadata: Record<string, unknown> = {}

const ACTIVITY_CHANGED_FIELD_GROUPS: Array<{ label: string; fields: string[] }> = [
  {
    label: 'dados pessoais',
    fields: [
      'nome_completo',
      'data_nascimento',
      'falecido',
      'humano_ou_pet',
      'lado',
      'genero',
    ],
  },
  {
    label: 'locais de nascimento e falecimento',
    fields: [
      'local_nascimento',
      'local_nascimento_exterior',
      'local_falecimento',
      'local_falecimento_exterior',
      'local_atual',
    ],
  },
  {
    label: 'foto',
    fields: ['foto_principal_url', 'has_photo'],
  },
  {
    label: 'biografia e curiosidades',
    fields: ['minibio', 'curiosidades'],
  },
  {
    label: 'redes sociais',
    fields: ['rede_social', 'instagram_usuario', 'instagram_url'],
  },
  {
    label: 'preferências de exibição',
    fields: [
      'permitir_exibir_instagram',
      'permitir_exibir_data_nascimento',
      'permitir_exibir_endereco',
      'permitir_exibir_rede_social',
      'permitir_exibir_telefone',
    ],
  },
  {
    label: 'configurações de contato',
    fields: ['permitir_mensagens_whatsapp', 'telefone', 'whatsapp'],
  },
  {
    label: 'configurações técnicas',
    fields: ['manual_generation'],
  },
];

function normalizeChangedFields(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((field) => String(field).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);
  }

  return [];
}

function formatReadableList(items: string[]) {
  const uniqueItems = Array.from(new Set(items.filter(Boolean)));

  if (uniqueItems.length === 0) return '';
  if (uniqueItems.length === 1) return uniqueItems[0];
  if (uniqueItems.length === 2) return `${uniqueItems[0]} e ${uniqueItems[1]}`;

  return `${uniqueItems.slice(0, -1).join(', ')} e ${uniqueItems[uniqueItems.length - 1]}`;
}

function getChangedFieldGroupLabels(metadata: Record<string, unknown> = {}) {
  const changedFields = normalizeChangedFields(metadata.changed_fields);
  if (changedFields.length === 0) return [];

  const changedFieldSet = new Set(changedFields);

  return ACTIVITY_CHANGED_FIELD_GROUPS
    .filter((group) => group.fields.some((field) => changedFieldSet.has(field)))
    .map((group) => group.label);
}

function getReadableActivitySummary(activity: ActivityLog, actionLabel: string, entityLabel: string) {
  const metadata = activity.metadata ?? {};
  const changedGroups = getChangedFieldGroupLabels(metadata);
  const changedGroupsText = formatReadableList(changedGroups);

  if (activity.action === 'person.created') {
    return `Perfil criado para ${entityLabel}.`;
  }

  if (activity.action === 'person.updated') {
    return changedGroupsText
      ? `Perfil atualizado em ${entityLabel} com alterações em ${changedGroupsText}.`
      : `Perfil atualizado em ${entityLabel}.`;
  }

  if (activity.action === 'person.photo_updated') {
    return `Foto atualizada em ${entityLabel}.`;
  }

  if (activity.action === 'person.privacy_updated') {
    const preferenceGroups = changedGroupsText || 'preferências de privacidade e exibição';
    return `Privacidade atualizada em ${entityLabel}, com ajustes em ${preferenceGroups}.`;
  }

  if (activity.action === 'relationship.created') {
    return `Relacionamento criado em ${entityLabel}.`;
  }

  if (activity.action === 'relationship.updated') {
    return `Relacionamento atualizado em ${entityLabel}.`;
  }

  if (activity.action === 'relationship.deleted') {
    return `Relacionamento removido em ${entityLabel}.`;
  }

  if (activity.action === 'user_person_link.created') {
    return `Vínculo de usuário criado em ${entityLabel}.`;
  }

  if (activity.action === 'user_person_link.updated') {
    return `Vínculo de usuário atualizado em ${entityLabel}.`;
  }

  if (activity.action === 'user_person_link.deleted') {
    return `Vínculo de usuário removido em ${entityLabel}.`;
  }

  if (activity.action === 'relationship_change_requested') {
    return `Solicitação de vínculo criada em ${entityLabel}.`;
  }

  if (activity.action === 'relationship_change_approved') {
    return `Solicitação de vínculo aprovada em ${entityLabel}.`;
  }

  if (activity.action === 'relationship_change_rejected') {
    return `Solicitação de vínculo rejeitada em ${entityLabel}.`;
  }

  if (activity.action === 'relationship_change_cancelled') {
    return `Solicitação de vínculo cancelada em ${entityLabel}.`;
  }

  if (activity.action === 'notification_preferences.updated') {
    return `Preferências de notificação atualizadas em ${entityLabel}.`;
  }

  if (activity.action === 'notification.created') {
    return `Notificação criada em ${entityLabel}.`;
  }

  if (activity.action === 'notification.dispatched') {
    return `Notificação enviada em ${entityLabel}.`;
  }

  if (activity.action === 'notification.dispatch_failed') {
    return `Falha ao enviar notificação em ${entityLabel}.`;
  }

  if (activity.action === 'notification.marked_read') {
    return `Notificação marcada como lida em ${entityLabel}.`;
  }

  if (activity.action === 'notification.removed') {
    return `Notificação removida em ${entityLabel}.`;
  }

  if (activity.action === 'historical_file.added') {
    return `Arquivo histórico adicionado em ${entityLabel}.`;
  }

  if (activity.action === 'historical_file.updated') {
    return `Arquivo histórico atualizado em ${entityLabel}.`;
  }

  if (activity.action === 'historical_file.removed') {
    return `Arquivo histórico removido em ${entityLabel}.`;
  }

  if (activity.action === 'person_insights.generated') {
    return `Insights gerados para ${entityLabel}.`;
  }

  if (activity.action === 'person_insights.regenerated') {
    return `Insights regenerados para ${entityLabel}.`;
  }

  if (activity.action === 'person_event.added') {
    return `Evento adicionado ao perfil de ${entityLabel}.`;
  }

  if (activity.action === 'person_event.updated') {
    return `Evento atualizado no perfil de ${entityLabel}.`;
  }

  if (activity.action === 'person_event.removed') {
    return `Evento removido do perfil de ${entityLabel}.`;
  }

  if (activity.action === 'first_access.confirmed') {
    return `Primeiro acesso confirmado em ${entityLabel}.`;
  }

  const metadataSummary = getActivityMetadataSummary(metadata);

  return metadataSummary
    ? `${actionLabel} em ${entityLabel}. ${metadataSummary}`
    : `${actionLabel} em ${entityLabel}.`;
}

export function getActivitySummary(activity: ActivityLog) {
  const actionLabel = getActivityActionLabel(activity.action);
  const entityLabel = activity.entity_label || getActivityEntityLabel(activity.entity_type);

  return getReadableActivitySummary(activity, actionLabel, entityLabel);
}
