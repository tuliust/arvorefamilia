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
import {
  RUNTIME_NOTIFICATION_RECIPIENT_GROUPS,
  RUNTIME_NOTIFICATION_SUGGESTIONS,
  RUNTIME_NOTIFICATION_TEMPLATES,
  RUNTIME_NOTIFICATION_TYPES,
} from '../constants/adminNotificationCatalogRuntimeExtensions';
import { supabase } from '../lib/supabaseClient';
import type { TipoCanalNotificacao } from '../types';
import type {
  AdminNotificationContentOverride,
  AdminNotificationCustomDefinition,
  AdminNotificationVariableSettings,
} from '../components/admin/notifications/AdminNotificationConfiguration';

const ADMIN_NOTIFICATION_CONFIG_KEY = 'default';
const SPECIFIC_USER_PREFIX = 'specific_user:';
const TRIGGER_EVENT_PREFIX = 'trigger_event:';

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
  variableSettings?: AdminNotificationVariableSettings;
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

type TemplateWithVariableSettings = AdminNotificationTemplateDefinition & {
  variableSettings?: AdminNotificationVariableSettings[string];
};

type AdminNotificationConfigurationRow = {
  frequency_overrides?: Record<string, AdminNotificationFrequencyId> | null;
  theme_overrides?: Record<string, AdminNotificationThemeId> | null;
  active_overrides?: Record<string, boolean> | null;
  content_overrides?: Record<string, AdminNotificationContentOverride> | null;
  channel_overrides?: Record<string, TipoCanalNotificacao[]> | null;
  recipient_overrides?: Record<string, string[]> | null;
  variable_overrides?: Record<string, string[]> | null;
  variable_settings?: AdminNotificationVariableSettings | null;
  custom_definitions?: AdminNotificationCustomDefinition[] | null;
};

type AdminNotificationCatalogRow = {
  frequency_options?: PersistedAdminNotificationCatalog['frequencyOptions'] | null;
  theme_options?: PersistedAdminNotificationCatalog['themeOptions'] | null;
  recipient_groups?: AdminNotificationRecipientGroupDefinition[] | null;
  notification_types?: AdminNotificationTypeDefinition[] | null;
  notification_templates?: TemplateWithVariableSettings[] | null;
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
    variableSettings: row.variable_settings ?? {},
    customDefinitions: row.custom_definitions ?? [],
  };
}

function mergeById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mergePreservingExisting<T extends { id: string }>(fallbackItems: T[], existingItems: T[]) {
  const map = new Map<string, T>();
  fallbackItems.forEach((item) => map.set(item.id, cloneCatalogItem(item)));
  existingItems.forEach((item) => map.set(item.id, cloneCatalogItem(item)));
  return Array.from(map.values());
}

function mergeSuggestions(fallbackItems: string[], existingItems: string[]) {
  return Array.from(new Set([...fallbackItems, ...existingItems].map((item) => String(item))));
}

function cloneCatalogItem<T>(item: T): T {
  return JSON.parse(JSON.stringify(item)) as T;
}

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
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
    recipientGroups: mergeById([
      ...ADMIN_NOTIFICATION_RECIPIENT_GROUPS,
      ...PERSISTED_EXTRA_RECIPIENT_GROUPS,
      ...RUNTIME_NOTIFICATION_RECIPIENT_GROUPS,
    ]).map(cloneCatalogItem),
    types: mergeById([...ADMIN_NOTIFICATION_TYPES, ...RUNTIME_NOTIFICATION_TYPES]).map(cloneCatalogItem),
    templates: mergeById([...ADMIN_NOTIFICATION_TEMPLATES, ...RUNTIME_NOTIFICATION_TEMPLATES]).map(cloneCatalogItem),
    automations: ADMIN_NOTIFICATION_AUTOMATIONS.map(cloneCatalogItem),
    suggestions: mergeSuggestions(ADMIN_NOTIFICATION_SUGGESTIONS, RUNTIME_NOTIFICATION_SUGGESTIONS),
  };
}

function reconcileCatalogWithDefaults(
  existingCatalog: PersistedAdminNotificationCatalog,
  defaultCatalog: PersistedAdminNotificationCatalog,
): PersistedAdminNotificationCatalog {
  return {
    frequencyOptions: mergePreservingExisting(defaultCatalog.frequencyOptions, existingCatalog.frequencyOptions),
    themeOptions: mergePreservingExisting(defaultCatalog.themeOptions, existingCatalog.themeOptions),
    recipientGroups: mergePreservingExisting(defaultCatalog.recipientGroups, existingCatalog.recipientGroups),
    types: mergePreservingExisting(defaultCatalog.types, existingCatalog.types),
    templates: mergePreservingExisting(defaultCatalog.templates, existingCatalog.templates),
    automations: mergePreservingExisting(defaultCatalog.automations, existingCatalog.automations),
    suggestions: mergeSuggestions(defaultCatalog.suggestions, existingCatalog.suggestions),
  };
}

function buildCatalogFromConfig(config: PersistedAdminNotificationConfig): PersistedAdminNotificationCatalog {
  const defaultCatalog = buildDefaultCatalog();
  const customDefinitions = config.customDefinitions ?? [];

  const typeMap = new Map<string, AdminNotificationTypeDefinition>();
  [...defaultCatalog.types, ...customDefinitions.map((definition) => definition.type)].forEach((type) => {
    typeMap.set(type.id, cloneCatalogItem(type));
  });

  const templateMap = new Map<string, TemplateWithVariableSettings>();
  [...defaultCatalog.templates, ...customDefinitions.map((definition) => definition.template)].forEach((template) => {
    templateMap.set(template.id, cloneCatalogItem(template) as TemplateWithVariableSettings);
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
    const defaultAudience = recipients.find((recipientId) => (
      !recipientId.startsWith(SPECIFIC_USER_PREFIX) && !recipientId.startsWith(TRIGGER_EVENT_PREFIX)
    ));
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

  Object.entries(config.variableSettings ?? {}).forEach(([templateId, settings]) => {
    const template = templateMap.get(templateId);
    if (template) template.variableSettings = settings;
  });

  return {
    ...defaultCatalog,
    types: Array.from(typeMap.values()),
    templates: Array.from(templateMap.values()),
  };
}

function buildConfigFromCatalog(catalog: PersistedAdminNotificationCatalog): PersistedAdminNotificationConfig {
  const baseTypeMap = new Map(ADMIN_NOTIFICATION_TYPES.map((type) => [type.id, type]));
  const baseTemplateMap = new Map(ADMIN_NOTIFICATION_TEMPLATES.map((template) => [template.id, template]));
  const catalogTemplateByType = new Map(catalog.templates.map((template) => [template.typeId, template]));

  const config: PersistedAdminNotificationConfig = {
    frequencyOverrides: {},
    themeOverrides: {},
    activeOverrides: {},
    contentOverrides: {},
    channelOverrides: {},
    recipientOverrides: {},
    variableOverrides: {},
    variableSettings: {},
    customDefinitions: [],
  };

  catalog.types.forEach((type) => {
    const baseType = baseTypeMap.get(type.id);
    const persistedType = type as AdminNotificationTypeDefinition & { recipientGroupIds?: string[] };

    if (!baseType) {
      const template = catalogTemplateByType.get(type.id);
      if (template) config.customDefinitions?.push({ type, template });
      return;
    }

    if (baseType.defaultFrequency !== type.defaultFrequency) config.frequencyOverrides![type.id] = type.defaultFrequency;
    if (baseType.active !== type.active) config.activeOverrides![type.id] = type.active;
    if (!sameJson(baseType.allowedChannels, type.allowedChannels)) config.channelOverrides![type.id] = type.allowedChannels;

    if (persistedType.recipientGroupIds?.length) {
      config.recipientOverrides![type.id] = persistedType.recipientGroupIds;
    } else if (baseType.defaultAudience !== type.defaultAudience) {
      config.recipientOverrides![type.id] = [type.defaultAudience].filter(Boolean);
    }
  });

  catalog.templates.forEach((template) => {
    const baseTemplate = baseTemplateMap.get(template.id);
    const templateWithSettings = template as TemplateWithVariableSettings;

    if (!baseTemplate) return;

    const contentOverride: AdminNotificationContentOverride = {};
    if (baseTemplate.title !== template.title) contentOverride.title = template.title;
    if (baseTemplate.longMessage !== template.longMessage) contentOverride.longMessage = template.longMessage;
    if (baseTemplate.cta !== template.cta) contentOverride.cta = template.cta;
    if (Object.keys(contentOverride).length > 0) config.contentOverrides![template.id] = contentOverride;

    if (baseTemplate.themeId !== template.themeId) config.themeOverrides![template.id] = template.themeId;
    if (!sameJson(baseTemplate.variables, template.variables)) config.variableOverrides![template.id] = template.variables;
    if (templateWithSettings.variableSettings && Object.keys(templateWithSettings.variableSettings).length > 0) {
      config.variableSettings![template.id] = templateWithSettings.variableSettings;
    }
  });

  return config;
}

function mergeConfigs(
  catalogConfig: PersistedAdminNotificationConfig,
  rowConfig: PersistedAdminNotificationConfig,
): PersistedAdminNotificationConfig {
  const customDefinitionMap = new Map<string, AdminNotificationCustomDefinition>();
  [...(catalogConfig.customDefinitions ?? []), ...(rowConfig.customDefinitions ?? [])].forEach((definition) => {
    customDefinitionMap.set(definition.type.id, definition);
  });

  return {
    frequencyOverrides: { ...(catalogConfig.frequencyOverrides ?? {}), ...(rowConfig.frequencyOverrides ?? {}) },
    themeOverrides: { ...(catalogConfig.themeOverrides ?? {}), ...(rowConfig.themeOverrides ?? {}) },
    activeOverrides: { ...(catalogConfig.activeOverrides ?? {}), ...(rowConfig.activeOverrides ?? {}) },
    contentOverrides: { ...(catalogConfig.contentOverrides ?? {}), ...(rowConfig.contentOverrides ?? {}) },
    channelOverrides: { ...(catalogConfig.channelOverrides ?? {}), ...(rowConfig.channelOverrides ?? {}) },
    recipientOverrides: { ...(catalogConfig.recipientOverrides ?? {}), ...(rowConfig.recipientOverrides ?? {}) },
    variableOverrides: { ...(catalogConfig.variableOverrides ?? {}), ...(rowConfig.variableOverrides ?? {}) },
    variableSettings: { ...(catalogConfig.variableSettings ?? {}), ...(rowConfig.variableSettings ?? {}) },
    customDefinitions: Array.from(customDefinitionMap.values()),
  };
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

async function loadOrSeedAdminNotificationCatalog(): Promise<PersistedAdminNotificationCatalog | null> {
  const defaultCatalog = buildDefaultCatalog();
  const existingCatalog = await loadAdminNotificationCatalog();

  if (existingCatalog) {
    const reconciledCatalog = reconcileCatalogWithDefaults(existingCatalog, defaultCatalog);

    if (!sameJson(existingCatalog, reconciledCatalog)) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        await saveAdminNotificationCatalog(reconciledCatalog, authData.user?.id ?? null);
      } catch (error) {
        console.warn('[Supabase] Não foi possível reconciliar catálogo administrativo de notificações:', error);
      }
    }

    return reconciledCatalog;
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    await saveAdminNotificationCatalog(defaultCatalog, authData.user?.id ?? null);
    return defaultCatalog;
  } catch (error) {
    console.warn('[Supabase] Não foi possível inicializar catálogo administrativo de notificações:', error);
    return null;
  }
}

export async function loadAdminNotificationConfiguration(): Promise<PersistedAdminNotificationConfig> {
  const [catalog, configurationResult] = await Promise.all([
    loadOrSeedAdminNotificationCatalog(),
    supabase
      .from('admin_notification_configurations')
      .select('*')
      .eq('config_key', ADMIN_NOTIFICATION_CONFIG_KEY)
      .maybeSingle(),
  ]);

  const catalogConfig = catalog ? buildConfigFromCatalog(catalog) : {};

  if (configurationResult.error) {
    console.warn('[Supabase] Não foi possível carregar configurações administrativas de notificações:', configurationResult.error.message);
    return catalogConfig;
  }

  return mergeConfigs(catalogConfig, normalizeConfig(configurationResult.data as AdminNotificationConfigurationRow | null));
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
        variable_settings: config.variableSettings ?? {},
        custom_definitions: config.customDefinitions ?? [],
        updated_by: userId,
        created_by: userId,
      },
      { onConflict: 'config_key' }
    );

  if (error) throw error;

  await saveAdminNotificationCatalog(buildCatalogFromConfig(config), userId);
}
