import { supabase } from '../lib/supabaseClient';
import type { NotificationTargetChannel } from '../types';

const ADMIN_NOTIFICATION_CONFIG_KEY = 'default';
const TRIGGER_EVENT_PREFIX = 'trigger_event:';
const VALID_CHANNELS = new Set<NotificationTargetChannel>(['interna', 'email', 'push', 'whatsapp']);

type RuntimeNotificationType = {
  id?: string;
  active?: boolean;
  allowedChannels?: NotificationTargetChannel[];
  defaultFrequency?: string;
  defaultAudience?: string;
  defaultLink?: string;
  recipientGroupIds?: string[];
};

type RuntimeNotificationTemplate = {
  id?: string;
  typeId?: string;
  title?: string;
  longMessage?: string;
  shortMessage?: string;
  cta?: string;
  defaultLink?: string;
  allowedChannels?: NotificationTargetChannel[];
  variableSettings?: Record<string, { value?: string }>;
};

type RuntimeAdminNotificationConfig = {
  active_overrides?: Record<string, boolean>;
  frequency_overrides?: Record<string, string>;
  channel_overrides?: Record<string, NotificationTargetChannel[]>;
  content_overrides?: Record<string, { title?: string; longMessage?: string; cta?: string }>;
  recipient_overrides?: Record<string, string[]>;
  variable_settings?: Record<string, Record<string, { value?: string }>>;
  deleted_type_ids?: string[];
};

export type RuntimeNotificationTemplateForTrigger = {
  typeId: string;
  templateId: string;
  title: string;
  message: string;
  cta: string;
  link: string;
  channels: NotificationTargetChannel[];
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function asRecord<T>(value: unknown): Record<string, T> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, T> : {};
}

function normalizeChannels(value: unknown): NotificationTargetChannel[] {
  return asArray<NotificationTargetChannel>(value).filter((channel) => VALID_CHANNELS.has(channel));
}

function getTemplateLink(
  template: RuntimeNotificationTemplate,
  type: RuntimeNotificationType,
  variableSettings?: Record<string, { value?: string }>,
) {
  const linkSetting = variableSettings?.['{{link}}'] ?? template.variableSettings?.['{{link}}'];
  return String(linkSetting?.value || template.defaultLink || type.defaultLink || '/notificacoes').trim();
}

function hasTriggerRecipient(recipients: string[], triggerEventId: string) {
  return recipients.includes(`${TRIGGER_EVENT_PREFIX}${triggerEventId}`);
}

function hasTriggerUserRecipient(recipients: string[], type: RuntimeNotificationType) {
  return recipients.includes('trigger_user') || type.defaultAudience === 'trigger_user';
}

export async function getRuntimeNotificationTemplateForTrigger(
  triggerEventId: string,
  fallbackTypeId = 'first_access_welcome',
): Promise<RuntimeNotificationTemplateForTrigger | null> {
  const [{ data: catalogRow, error: catalogError }, { data: configRow, error: configError }] = await Promise.all([
    supabase
      .from('admin_notification_catalogs')
      .select('notification_types, notification_templates')
      .eq('catalog_key', ADMIN_NOTIFICATION_CONFIG_KEY)
      .maybeSingle(),
    supabase
      .from('admin_notification_configurations')
      .select('active_overrides, frequency_overrides, channel_overrides, content_overrides, recipient_overrides, variable_settings, deleted_type_ids')
      .eq('config_key', ADMIN_NOTIFICATION_CONFIG_KEY)
      .maybeSingle(),
  ]);

  if (catalogError) {
    console.warn('[Notificações] Não foi possível carregar catálogo de runtime:', catalogError.message);
    return null;
  }

  if (configError) {
    console.warn('[Notificações] Não foi possível carregar configuração de runtime:', configError.message);
  }

  const types = asArray<RuntimeNotificationType>(catalogRow?.notification_types);
  const templates = asArray<RuntimeNotificationTemplate>(catalogRow?.notification_templates);
  const config: RuntimeAdminNotificationConfig = {
    active_overrides: asRecord<boolean>(configRow?.active_overrides),
    frequency_overrides: asRecord<string>(configRow?.frequency_overrides),
    channel_overrides: asRecord<NotificationTargetChannel[]>(configRow?.channel_overrides),
    content_overrides: asRecord<{ title?: string; longMessage?: string; cta?: string }>(configRow?.content_overrides),
    recipient_overrides: asRecord<string[]>(configRow?.recipient_overrides),
    variable_settings: asRecord<Record<string, { value?: string }>>(configRow?.variable_settings),
    deleted_type_ids: asArray<string>(configRow?.deleted_type_ids),
  };

  const deletedTypeIds = new Set(config.deleted_type_ids ?? []);

  const candidates = types
    .filter((type) => Boolean(type.id) && !deletedTypeIds.has(String(type.id)))
    .map((type) => {
      const typeId = String(type.id);
      const recipients = config.recipient_overrides?.[typeId] ?? type.recipientGroupIds ?? [type.defaultAudience].filter(Boolean) as string[];
      const active = config.active_overrides?.[typeId] ?? type.active ?? true;
      const frequency = config.frequency_overrides?.[typeId] ?? type.defaultFrequency ?? 'manual';
      const exactTrigger = hasTriggerRecipient(recipients, triggerEventId);
      const fallbackTrigger = typeId === fallbackTypeId && hasTriggerUserRecipient(recipients, type);

      return { type, typeId, recipients, active, frequency, exactTrigger, fallbackTrigger };
    })
    .filter((item) => item.active && item.frequency !== 'desativada' && (item.exactTrigger || item.fallbackTrigger))
    .sort((left, right) => Number(right.exactTrigger) - Number(left.exactTrigger));

  const selected = candidates[0];
  if (!selected) return null;

  const template = templates.find((item) => item.typeId === selected.typeId);
  if (!template?.id) return null;

  const templateId = String(template.id);
  const content = config.content_overrides?.[templateId] ?? {};
  const variableSettings = config.variable_settings?.[templateId] ?? template.variableSettings ?? {};
  const channels = normalizeChannels(config.channel_overrides?.[selected.typeId] ?? selected.type.allowedChannels ?? template.allowedChannels ?? ['interna']);

  return {
    typeId: selected.typeId,
    templateId,
    title: String(content.title || template.title || '').trim(),
    message: String(content.longMessage || template.longMessage || template.shortMessage || '').trim(),
    cta: String(content.cta || template.cta || '').trim(),
    link: getTemplateLink(template, selected.type, variableSettings),
    channels: channels.length > 0 ? channels : ['interna'],
  };
}

export function renderRuntimeNotificationText(value: string, variables: Record<string, string>) {
  return Object.entries(variables).reduce((current, [key, replacement]) => {
    return current.replaceAll(`{{${key}}}`, replacement);
  }, value);
}
