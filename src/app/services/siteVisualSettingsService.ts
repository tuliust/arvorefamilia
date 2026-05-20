import { supabase } from '../lib/supabaseClient';

export const HOME_BACKGROUND_COLORS = [
  { label: 'Branco', value: '#ffffff' },
  { label: 'Cor atual/padrão', value: '#f9fafb' },
  { label: 'Cinza 100', value: '#f3f4f6' },
  { label: 'Cinza 200', value: '#e5e7eb' },
  { label: 'Cinza 400', value: '#9ca3af' },
  { label: 'Azul claro', value: '#dbeafe' },
  { label: 'Azul médio', value: '#93c5fd' },
  { label: 'Azul escuro', value: '#1e3a8a' },
  { label: 'Slate escuro', value: '#0f172a' },
  { label: 'Preto', value: '#000000' },
] as const;

const ALLOWED_BACKGROUND_COLORS = new Set(HOME_BACKGROUND_COLORS.map((color) => color.value));

export type SiteVisualSettings = {
  home_logo_media_url: string | null;
  home_background_media_url: string | null;
  home_background_color: string;
  home_background_media_opacity: number;
  updated_at?: string | null;
  updated_by?: string | null;
};

export type SiteVisualSettingsPayload = Partial<Omit<SiteVisualSettings, 'updated_at' | 'updated_by'>>;

export const DEFAULT_SITE_VISUAL_SETTINGS: SiteVisualSettings = {
  home_logo_media_url: null,
  home_background_media_url: null,
  home_background_color: '#f9fafb',
  home_background_media_opacity: 0,
  updated_at: null,
  updated_by: null,
};

function isMissingSiteVisualSettingsTableError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('site_visual_settings') &&
    (normalized.includes('does not exist') || normalized.includes('not found') || normalized.includes('schema cache'))
  );
}

function normalizeMediaUrl(value: unknown) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

export function normalizeHomeBackgroundColor(value: unknown) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return ALLOWED_BACKGROUND_COLORS.has(normalized)
    ? normalized
    : DEFAULT_SITE_VISUAL_SETTINGS.home_background_color;
}

export function normalizeHomeBackgroundOpacity(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return DEFAULT_SITE_VISUAL_SETTINGS.home_background_media_opacity;

  return Math.min(100, Math.max(0, Math.round(numericValue)));
}

function normalizeSiteVisualSettings(row: Partial<SiteVisualSettings> | null | undefined): SiteVisualSettings {
  return {
    home_logo_media_url: normalizeMediaUrl(row?.home_logo_media_url),
    home_background_media_url: normalizeMediaUrl(row?.home_background_media_url),
    home_background_color: normalizeHomeBackgroundColor(row?.home_background_color),
    home_background_media_opacity: normalizeHomeBackgroundOpacity(row?.home_background_media_opacity),
    updated_at: row?.updated_at ?? null,
    updated_by: row?.updated_by ?? null,
  };
}

export async function getSiteVisualSettings(): Promise<SiteVisualSettings> {
  const { data, error } = await supabase
    .from('site_visual_settings')
    .select('home_logo_media_url,home_background_media_url,home_background_color,home_background_media_opacity,updated_at,updated_by')
    .eq('id', true)
    .maybeSingle();

  if (error) {
    if (isMissingSiteVisualSettingsTableError(error.message)) {
      return DEFAULT_SITE_VISUAL_SETTINGS;
    }

    console.warn('[siteVisualSettings] Falha ao carregar configurações visuais:', error.message);
    return DEFAULT_SITE_VISUAL_SETTINGS;
  }

  return normalizeSiteVisualSettings(data);
}

export async function saveSiteVisualSettings(payload: SiteVisualSettingsPayload): Promise<SiteVisualSettings> {
  const { data: authData } = await supabase.auth.getUser();
  const normalizedPayload = {
    id: true,
    home_logo_media_url: normalizeMediaUrl(payload.home_logo_media_url),
    home_background_media_url: normalizeMediaUrl(payload.home_background_media_url),
    home_background_color: normalizeHomeBackgroundColor(payload.home_background_color),
    home_background_media_opacity: normalizeHomeBackgroundOpacity(payload.home_background_media_opacity),
    updated_by: authData.user?.id ?? null,
  };

  const { data, error } = await supabase
    .from('site_visual_settings')
    .upsert(normalizedPayload, { onConflict: 'id' })
    .select('home_logo_media_url,home_background_media_url,home_background_color,home_background_media_opacity,updated_at,updated_by')
    .single();

  if (error) {
    if (isMissingSiteVisualSettingsTableError(error.message)) {
      throw new Error('A tabela de configurações visuais ainda não foi aplicada no Supabase.');
    }

    throw new Error(error.message);
  }

  return normalizeSiteVisualSettings(data);
}
