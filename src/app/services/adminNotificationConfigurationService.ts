import {
  ADMIN_NOTIFICATION_AUTOMATIONS,
  ADMIN_NOTIFICATION_FREQUENCY_OPTIONS,
  ADMIN_NOTIFICATION_RECIPIENT_GROUPS,
  ADMIN_NOTIFICATION_SUGGESTIONS,
  ADMIN_NOTIFICATION_TEMPLATES,
  ADMIN_NOTIFICATION_THEME_OPTIONS,
  ADMIN_NOTIFICATION_TYPES,
  type AdminNotificationAutomationDefinition,
  type AdminNotificationFrequencyId,
  type AdminNotificationRecipientGroupDefinition,
  type AdminNotificationTemplateDefinition,
  type AdminNotificationThemeId,
  type AdminNotificationTypeDefinition,
} from '../constants/adminNotificationCatalog';
import { supabase } from '../lib/supabaseClient';
import type { TipoCanalNotificacao } from '../types';
import type {
  AdminNotificationContentOverride,
  AdminNotificationCustomDefinition,
} from '../components/admin/notifications/AdminNotificationConfiguration';

const ADMIN_NOTIFICATION_CONFIG_KEY = 'default';
const SPECIFIC_USER_PREFIX = 'specific_user:';

const PERSISTED_EXTRA_RECIPIENT_GROUPS: AdminNotificationRecipientGroupDefinition[] = [
  {
    id: 'trigger_user',
    title: 'Usuário do gatilho',
    description: 'Usuário que realizou a ação que originou a notificação, como primeiro login ou atualização própria.',
    kind: 'gatilho',
    availability: 'available',
  },
  {
    id: 'specific_users',
    title: 'Usuários específicos',
    description: 'Permite selecionar um ou mais usuários manualmente para receber a notificação.',
    kind: 'manual_futuro',
    availability: 'available',
  },
  {
    id: 'close_family',
    title: 'Familiares próximos',
    description: 'Pai, mãe, irmãos, cônjuge ativo, filhos, netos e sobrinhos do usuário ou pessoa do gatilho.',
    kind: 'gatilho',
    availability: 'available',
  },
];

export type PersistedAdminNotificationConfig = {
  frequencyOverrides?: Record<string, AdminNotificationFrequencyId>;
  themeOverrides?: Record<string, AdminNotificationThemeId>;
  activeOverrides?: Record<string, boolean>;
  contentOverrides?: Record<string, AdminNotificationContentOverride>;
  channelOverrides?: Record<string, TipoCanalNotificacao[]>;
  recipientOverrides?: Record<string, string[]>;
  variableOverrides?: Record<string, string[]>;
  customDefinitions?: AdminNotificationCustomDefinition[];
};

export type PersistedAdminNotificationCatalog = {
  frequencyOptions: Array<{ id: AdminNotificationFrequencyId; label: string; description: string }>;
  themeOptions: Array<{ id: AdminNotificationThemeId; label: string; description: string }>;
  recipientGroups: AdminNotificationRecipientGroupDefinition[];
  types: AdminNotificationTypeDefinition[];
  templates: AdminNotificationTemplateDefinition[];
  automations: AdminNotificationAutomationDefinition[];
  suggestions: string[];
};

type AdminNotificationConfigurationRow = {
  frequency_overrides?: Record<string, AdminNotificationFrequencyId> | null;
  theme_overrides?: Record<string, AdminNotificationThemeId> | null;
  active_overrides?: Record<string, boolean> | null;
  content_overrides?: Record<string, AdminNotificationContentOverride> | null;
  channel_overrides?: Record<string, TipoCanalNotificacao[]> | null;
  recipient_overrides?: Record<string, string[]> | null;
  variable_overrides?: Record<string, string[]> | null;
  custom_definitions?: AdminNotificationCustomDefinition[] | null;
};

type AdminNotificationCatalogRow = {
  frequency_options?: PersistedAdminNotificationCatalog['frequencyOptions'] | null;
  theme_options?: PersistedAdminNotificationCatalog['themeOptions'] | null;
  recipient_groups?: AdminNotificationRecipientGroupDefinition[] | null;
  notification_types?: AdminNotificationTypeDefinition[] | null;
  notification_templates?: AdminNotificationTemplateDefinition[] | null;
  automations?: AdminNotificationAutomationDefinition[] | null;
  suggestions?: string[] | null;
};

function normalizeConfig(row?: AdminNotificationConfigurationRow | null): PersistedAdminNotificationConfig {
  if (!row) return {};

  return {
    frequencyOverrides: row.frequency_overrides ?? {},
    themeOverrides: row.theme_overrides ?? {},
    activeOverrides: row.active_overrides ?? {},
    contentOverrides: row.content_overrides ?? {},
    channelOverrides: row.channel_overrides ?? {},
    recipientOverrides: row.recipient_overrides ?? {},
    variableOverrides: row.variable_overrides ?? {},
    customDefinitions: row.custom_definitions ?? [],
  };
}

function mergeById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function cloneCatalogItem<T>(item: T): T {
  return JSON.parse(JSON.stringify(item)) as T;
}

function normalizeCatalog(row?: AdminNotificationCatalogRow | null): PersistedAdminNotificationCatalog | null {
  if (!row) return null;

  return {
    frequencyOptions: row.frequency_options ?? [],
    themeOptions: row.theme_options ?? [],
    recipientGroups: row.recipient_groups ?? [],
    types: row.notification_types ?? [],
    templates: row.notification_templates ?? [],
    automations: row.automations ?? [],
    suggestions: row.suggestions ?? [],
  };
}

function buildDefaultCatalog(): PersistedAdminNotificationCatalog {
  return {
    frequencyOptions: ADMIN_NOTIFICATION_FREQUENCY_OPTIONS.map(cloneCatalogItem),
    themeOptions: ADMIN_NOTIFICATION_THEME_OPTIONS.map(cloneCatalogItem),
    recipientGroups: mergeById([...ADMIN_NOTIFICATION_RECIPIENT_GROUPS, ...PERSISTED_EXTRA_RECIPIENT_GROUPS]).map(cloneCatalogItem),
    types: ADMIN_NOTIFICATION_TYPES.map(cloneCatalogItem),
    templates: ADMIN_NOTIFICATION_TEMPLATES.map(cloneCatalogItem),
    automations: ADMIN_NOTIFICATION_AUTOMATIONS.map(cloneCatalogItem),
    suggestions: ADMIN_NOTIFICATION_SUGGESTIONS.map((suggestion) => String(suggestion)),
  };
}

function buildCatalogFromConfig(config: PersistedAdminNotificationConfig): PersistedAdminNotificationCatalog {
  const defaultCatalog = buildDefaultCatalog();
  const customDefinitions = config.customDefinitions ?? [];

  const typeMap = new Map<string, AdminNotificationTypeDefinition>();
  [...defaultCatalog.types, ...customDefinitions.map((definition) => definition.type)].forEach((type) => {
    typeMap.set(type.id, cloneCatalogItem(type));
  });

  const templateMap = new Map<string, AdminNotificationTemplateDefinition>();
  [...defaultCatalog.templates, ...customDefinitions.map((definition) => definition.template)].forEach((template) => {
    templateMap.set(template.id, cloneCatalogItem(template));
  });

  Object.entries(config.frequencyOverrides ?? {}).forEach(([typeId, frequency]) => {
    const type = typeMap.get(typeId);
    if (type) type.defaultFrequency = frequency;
  });

  Object.entries(config.activeOverrides ?? {}).forEach(([typeId, active]) => {
    const type = typeMap.get(typeId);
    if (type) type.active = active;
  });

  Object.entries(config.channelOverrides ?? {}).forEach(([typeId, channels]) => {
    const type = typeMap.get(typeId);
    if (type) type.allowedChannels = channels;
  });

  Object.entries(config.recipientOverrides ?? {}).forEach(([typeId, recipients]) => {
    const type = typeMap.get(typeId) as (AdminNotificationTypeDefinition & { recipientGroupIds?: string[] }) | undefined;
    if (!type) return;
    type.recipientGroupIds = recipients;
    const defaultAudience = recipients.find((recipientId) => !recipientId.startsWith(SPECIFIC_USER_PREFIX));
    if (defaultAudience) type.defaultAudience = defaultAudience;
  });

  Object.entries(config.contentOverrides ?? {}).forEach(([templateId, content]) => {
    const template = templateMap.get(templateId);
    if (!template) return;
    if (content.title !== undefined) template.title = content.title;
    if (content.longMessage !== undefined) template.longMessage = content.longMessage;
    if (content.cta !== undefined) template.cta = content.cta;
  });

  Object.entries(config.themeOverrides ?? {}).forEach(([templateId, theme]) => {
    const template = templateMap.get(templateId);
    if (template) template.themeId = theme;
  });

  Object.entries(config.variableOverrides ?? {}).forEach(([templateId, variables]) => {
    const template = templateMap.get(templateId);
    if (template) template.variables = variables;
  });

  return {
    ...defaultCatalog,
    types: Array.from(typeMap.values()),
    templates: Array.from(templateMap.values()),
  };
}

export async function loadAdminNotificationConfiguration(): Promise<PersistedAdminNotificationConfig> {
  const { data, error } = await supabase
    .from('admin_notification_configurations')
    .select('*')
    .eq('config_key', ADMIN_NOTIFICATION_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Não foi possível carregar configurações administrativas de notificações:', error.message);
    return {};
  }

  return normalizeConfig(data as AdminNotificationConfigurationRow | null);
}

export async function loadAdminNotificationCatalog(): Promise<PersistedAdminNotificationCatalog | null> {
  const { data, error } = await supabase
    .from('admin_notification_catalogs')
    .select('frequency_options, theme_options, recipient_groups, notification_types, notification_templates, automations, suggestions')
    .eq('catalog_key', ADMIN_NOTIFICATION_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Não foi possível carregar catálogo administrativo de notificações:', error.message);
    return null;
  }

  return normalizeCatalog(data as AdminNotificationCatalogRow | null);
}

export async function saveAdminNotificationCatalog(
  catalog: PersistedAdminNotificationCatalog,
  userId?: string | null,
) {
  const { error } = await supabase
    .from('admin_notification_catalogs')
    .upsert(
      {
        catalog_key: ADMIN_NOTIFICATION_CONFIG_KEY,
        frequency_options: catalog.frequencyOptions ?? [],
        theme_options: catalog.themeOptions ?? [],
        recipient_groups: catalog.recipientGroups ?? [],
        notification_types: catalog.types ?? [],
        notification_templates: catalog.templates ?? [],
        automations: catalog.automations ?? [],
        suggestions: catalog.suggestions ?? [],
        metadata: {
          source: 'admin-notification-configuration',
          persisted_at: new Date().toISOString(),
        },
        updated_by: userId ?? null,
        created_by: userId ?? null,
      },
      { onConflict: 'catalog_key' }
    );

  if (error) throw error;
}

export async function saveAdminNotificationConfiguration(config: PersistedAdminNotificationConfig) {
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const { error } = await supabase
    .from('admin_notification_configurations')
    .upsert(
      {
        config_key: ADMIN_NOTIFICATION_CONFIG_KEY,
        frequency_overrides: config.frequencyOverrides ?? {},
        theme_overrides: config.themeOverrides ?? {},
        active_overrides: config.activeOverrides ?? {},
        content_overrides: config.contentOverrides ?? {},
        channel_overrides: config.channelOverrides ?? {},
        recipient_overrides: config.recipientOverrides ?? {},
        variable_overrides: config.variableOverrides ?? {},
        custom_definitions: config.customDefinitions ?? [],
        updated_by: userId,
        created_by: userId,
      },
      { onConflict: 'config_key' }
    );

  if (error) throw error;

  await saveAdminNotificationCatalog(buildCatalogFromConfig(config), userId);
}
