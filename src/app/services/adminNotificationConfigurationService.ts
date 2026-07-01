import type {
  AdminNotificationFrequencyId,
  AdminNotificationThemeId,
} from '../constants/adminNotificationCatalog';
import { supabase } from '../lib/supabaseClient';
import type { TipoCanalNotificacao } from '../types';
import type {
  AdminNotificationContentOverride,
  AdminNotificationCustomDefinition,
} from '../components/admin/notifications/AdminNotificationConfiguration';

const ADMIN_NOTIFICATION_CONFIG_KEY = 'default';

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
}
