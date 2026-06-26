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

export const GLOBAL_THEME_COLOR_OPTIONS = [
  { label: 'Azul institucional', value: '#1d4ed8' },
  { label: 'Slate editorial', value: '#0f172a' },
  { label: 'Terracota', value: '#a85f45' },
  { label: 'Verde oliva', value: '#66745b' },
  { label: 'Dourado discreto', value: '#b7791f' },
  { label: 'Vinho', value: '#7f1d1d' },
] as const;

const ALLOWED_BACKGROUND_COLORS = new Set<string>(HOME_BACKGROUND_COLORS.map((color) => color.value));
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const SETTINGS_COLUMNS = [
  'home_logo_media_url',
  'home_background_media_url',
  'home_background_color',
  'home_background_media_opacity',
  'global_identity_name',
  'global_identity_short_name',
  'global_identity_tagline',
  'global_primary_color',
  'global_accent_color',
  'global_text_color',
  'global_muted_text_color',
  'global_card_background_color',
  'global_button_radius',
  'global_card_radius',
  'home_logo_alt_text',
  'entrance_eyebrow',
  'entrance_title',
  'entrance_description',
  'entrance_login_title',
  'entrance_login_description',
  'entrance_first_access_title',
  'entrance_first_access_description',
  'entrance_confirmation_title',
  'entrance_confirmation_description',
  'entrance_login_cta_label',
  'entrance_first_access_cta_label',
  'entrance_create_account_cta_label',
  'entrance_forgot_password_label',
  'entrance_footer_note',
  'public_terms_label',
  'public_terms_url',
  'public_privacy_label',
  'public_privacy_url',
  'public_support_label',
  'public_support_url',
  'seo_title',
  'seo_description',
  'social_share_image_url',
  'publication_status',
  'draft_payload',
  'scheduled_publish_at',
  'last_published_at',
  'last_published_by',
  'updated_at',
  'updated_by',
].join(',');

export type SiteVisualPublicationStatus = 'draft' | 'scheduled' | 'published';

export type SiteVisualSettingsDraftPayload = Record<string, unknown> | null;

export type SiteVisualSettings = {
  home_logo_media_url: string | null;
  home_background_media_url: string | null;
  home_background_color: string;
  home_background_media_opacity: number;
  global_identity_name: string;
  global_identity_short_name: string;
  global_identity_tagline: string;
  global_primary_color: string;
  global_accent_color: string;
  global_text_color: string;
  global_muted_text_color: string;
  global_card_background_color: string;
  global_button_radius: string;
  global_card_radius: string;
  home_logo_alt_text: string;
  entrance_eyebrow: string;
  entrance_title: string;
  entrance_description: string;
  entrance_login_title: string;
  entrance_login_description: string;
  entrance_first_access_title: string;
  entrance_first_access_description: string;
  entrance_confirmation_title: string;
  entrance_confirmation_description: string;
  entrance_login_cta_label: string;
  entrance_first_access_cta_label: string;
  entrance_create_account_cta_label: string;
  entrance_forgot_password_label: string;
  entrance_footer_note: string | null;
  public_terms_label: string;
  public_terms_url: string;
  public_privacy_label: string;
  public_privacy_url: string;
  public_support_label: string | null;
  public_support_url: string | null;
  seo_title: string;
  seo_description: string;
  social_share_image_url: string | null;
  publication_status: SiteVisualPublicationStatus;
  draft_payload: SiteVisualSettingsDraftPayload;
  scheduled_publish_at?: string | null;
  last_published_at?: string | null;
  last_published_by?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
};

export type SiteVisualSettingsPayload = Partial<Omit<SiteVisualSettings, 'updated_at' | 'updated_by' | 'last_published_at' | 'last_published_by'>>;

export const DEFAULT_SITE_VISUAL_SETTINGS: SiteVisualSettings = {
  home_logo_media_url: null,
  home_background_media_url: null,
  home_background_color: '#f9fafb',
  home_background_media_opacity: 0,
  global_identity_name: 'Família Souza Barros',
  global_identity_short_name: 'Árvore Genealógica',
  global_identity_tagline: 'Plataforma familiar privada',
  global_primary_color: '#1d4ed8',
  global_accent_color: '#0f172a',
  global_text_color: '#111827',
  global_muted_text_color: '#4b5563',
  global_card_background_color: '#ffffff',
  global_button_radius: '0.75rem',
  global_card_radius: '1rem',
  home_logo_alt_text: 'Família Souza Barros',
  entrance_eyebrow: 'Plataforma familiar privada',
  entrance_title: 'Família Souza Barros',
  entrance_description: 'Família Souza Barros é uma plataforma familiar privada para organizar a árvore genealógica, perfis de familiares, fotos, documentos, memórias e datas importantes da família.',
  entrance_login_title: 'Entrar na árvore',
  entrance_login_description: 'Entre com seu e-mail e senha para acessar sua árvore.',
  entrance_first_access_title: 'Primeiro acesso',
  entrance_first_access_description: 'Informe o código recebido e crie suas credenciais.',
  entrance_confirmation_title: 'Confirme seu e-mail',
  entrance_confirmation_description: 'Finalize a confirmação no seu e-mail antes de entrar.',
  entrance_login_cta_label: 'Entrar',
  entrance_first_access_cta_label: 'Validar código',
  entrance_create_account_cta_label: 'Criar conta e revisar dados',
  entrance_forgot_password_label: 'Esqueci minha senha',
  entrance_footer_note: null,
  public_terms_label: 'Termos de Uso',
  public_terms_url: '/termos',
  public_privacy_label: 'Política de Privacidade',
  public_privacy_url: '/privacidade',
  public_support_label: null,
  public_support_url: null,
  seo_title: 'Árvore Genealógica da Família',
  seo_description: 'Plataforma familiar privada para preservar pessoas, memórias e vínculos.',
  social_share_image_url: null,
  publication_status: 'published',
  draft_payload: null,
  scheduled_publish_at: null,
  last_published_at: null,
  last_published_by: null,
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

function normalizeNullableText(value: unknown) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function normalizeText(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
}

function normalizeCssSize(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return fallback;
  if /^\d+(\.\d+)?(px|rem|em)$/i.test(normalized)) return normalized;
  return fallback;
}

export function normalizeHexColor(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : fallback;
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

function normalizePublicationStatus(value: unknown): SiteVisualPublicationStatus {
  if (value === 'draft' || value === 'scheduled' || value === 'published') return value;
  return 'published';
}

function normalizeDraftPayload(value: unknown): SiteVisualSettingsDraftPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeSiteVisualSettings(row: Partial<SiteVisualSettings> | null | undefined): SiteVisualSettings {
  return {
    home_logo_media_url: normalizeNullableText(row?.home_logo_media_url),
    home_background_media_url: normalizeNullableText(row?.home_background_media_url),
    home_background_color: normalizeHomeBackgroundColor(row?.home_background_color),
    home_background_media_opacity: normalizeHomeBackgroundOpacity(row?.home_background_media_opacity),
    global_identity_name: normalizeText(row?.global_identity_name, DEFAULT_SITE_VISUAL_SETTINGS.global_identity_name),
    global_identity_short_name: normalizeText(row?.global_identity_short_name, DEFAULT_SITE_VISUAL_SETTINGS.global_identity_short_name),
    global_identity_tagline: normalizeText(row?.global_identity_tagline, DEFAULT_SITE_VISUAL_SETTINGS.global_identity_tagline),
    global_primary_color: normalizeHexColor(row?.global_primary_color, DEFAULT_SITE_VISUAL_SETTINGS.global_primary_color),
    global_accent_color: normalizeHexColor(row?.global_accent_color, DEFAULT_SITE_VISUAL_SETTINGS.global_accent_color),
    global_text_color: normalizeHexColor(row?.global_text_color, DEFAULT_SITE_VISUAL_SETTINGS.global_text_color),
    global_muted_text_color: normalizeHexColor(row?.global_muted_text_color, DEFAULT_SITE_VISUAL_SETTINGS.global_muted_text_color),
    global_card_background_color: normalizeHexColor(row?.global_card_background_color, DEFAULT_SITE_VISUAL_SETTINGS.global_card_background_color),
    global_button_radius: normalizeCssSize(row?.global_button_radius, DEFAULT_SITE_VISUAL_SETTINGS.global_button_radius),
    global_card_radius: normalizeCssSize(row?.global_card_radius, DEFAULT_SITE_VISUAL_SETTINGS.global_card_radius),
    home_logo_alt_text: normalizeText(row?.home_logo_alt_text, DEFAULT_SITE_VISUAL_SETTINGS.home_logo_alt_text),
    entrance_eyebrow: normalizeText(row?.entrance_eyebrow, DEFAULT_SITE_VISUAL_SETTINGS.entrance_eyebrow),
    entrance_title: normalizeText(row?.entrance_title, DEFAULT_SITE_VISUAL_SETTINGS.entrance_title),
    entrance_description: normalizeText(row?.entrance_description, DEFAULT_SITE_VISUAL_SETTINGS.entrance_description),
    entrance_login_title: normalizeText(row?.entrance_login_title, DEFAULT_SITE_VISUAL_SETTINGS.entrance_login_title),
    entrance_login_description: normalizeText(row?.entrance_login_description, DEFAULT_SITE_VISUAL_SETTINGS.entrance_login_description),
    entrance_first_access_title: normalizeText(row?.entrance_first_access_title, DEFAULT_SITE_VISUAL_SETTINGS.entrance_first_access_title),
    entrance_first_access_description: normalizeText(row?.entrance_first_access_description, DEFAULT_SITE_VISUAL_SETTINGS.entrance_first_access_description),
    entrance_confirmation_title: normalizeText(row?.entrance_confirmation_title, DEFAULT_SITE_VISUAL_SETTINGS.entrance_confirmation_title),
    entrance_confirmation_description: normalizeText(row?.entrance_confirmation_description, DEFAULT_SITE_VISUAL_SETTINGS.entrance_confirmation_description),
    entrance_login_cta_label: normalizeText(row?.entrance_login_cta_label, DEFAULT_SITE_VISUAL_SETTINGS.entrance_login_cta_label),
    entrance_first_access_cta_label: normalizeText(row?.entrance_first_access_cta_label, DEFAULT_SITE_VISUAL_SETTINGS.entrance_first_access_cta_label),
    entrance_create_account_cta_label: normalizeText(row?.entrance_create_account_cta_label, DEFAULT_SITE_VISUAL_SETTINGS.entrance_create_account_cta_label),
    entrance_forgot_password_label: normalizeText(row?.entrance_forgot_password_label, DEFAULT_SITE_VISUAL_SETTINGS.entrance_forgot_password_label),
    entrance_footer_note: normalizeNullableText(row?.entrance_footer_note),
    public_terms_label: normalizeText(row?.public_terms_label, DEFAULT_SITE_VISUAL_SETTINGS.public_terms_label),
    public_terms_url: normalizeText(row?.public_terms_url, DEFAULT_SITE_VISUAL_SETTINGS.public_terms_url),
    public_privacy_label: normalizeText(row?.public_privacy_label, DEFAULT_SITE_VISUAL_SETTINGS.public_privacy_label),
    public_privacy_url: normalizeText(row?.public_privacy_url, DEFAULT_SITE_VISUAL_SETTINGS.public_privacy_url),
    public_support_label: normalizeNullableText(row?.public_support_label),
    public_support_url: normalizeNullableText(row?.public_support_url),
    seo_title: normalizeText(row?.seo_title, DEFAULT_SITE_VISUAL_SETTINGS.seo_title),
    seo_description: normalizeText(row?.seo_description, DEFAULT_SITE_VISUAL_SETTINGS.seo_description),
    social_share_image_url: normalizeNullableText(row?.social_share_image_url),
    publication_status: normalizePublicationStatus(row?.publication_status),
    draft_payload: normalizeDraftPayload(row?.draft_payload),
    scheduled_publish_at: row?.scheduled_publish_at ?? null,
    last_published_at: row?.last_published_at ?? null,
    last_published_by: row?.last_published_by ?? null,
    updated_at: row?.updated_at ?? null,
    updated_by: row?.updated_by ?? null,
  };
}

function buildNormalizedPayload(payload: SiteVisualSettingsPayload) {
  const normalized = normalizeSiteVisualSettings({ ...DEFAULT_SITE_VISUAL_SETTINGS, ...payload });

  return {
    id: true,
    home_logo_media_url: normalized.home_logo_media_url,
    home_background_media_url: normalized.home_background_media_url,
    home_background_color: normalized.home_background_color,
    home_background_media_opacity: normalized.home_background_media_opacity,
    global_identity_name: normalized.global_identity_name,
    global_identity_short_name: normalized.global_identity_short_name,
    global_identity_tagline: normalized.global_identity_tagline,
    global_primary_color: normalized.global_primary_color,
    global_accent_color: normalized.global_accent_color,
    global_text_color: normalized.global_text_color,
    global_muted_text_color: normalized.global_muted_text_color,
    global_card_background_color: normalized.global_card_background_color,
    global_button_radius: normalized.global_button_radius,
    global_card_radius: normalized.global_card_radius,
    home_logo_alt_text: normalized.home_logo_alt_text,
    entrance_eyebrow: normalized.entrance_eyebrow,
    entrance_title: normalized.entrance_title,
    entrance_description: normalized.entrance_description,
    entrance_login_title: normalized.entrance_login_title,
    entrance_login_description: normalized.entrance_login_description,
    entrance_first_access_title: normalized.entrance_first_access_title,
    entrance_first_access_description: normalized.entrance_first_access_description,
    entrance_confirmation_title: normalized.entrance_confirmation_title,
    entrance_confirmation_description: normalized.entrance_confirmation_description,
    entrance_login_cta_label: normalized.entrance_login_cta_label,
    entrance_first_access_cta_label: normalized.entrance_first_access_cta_label,
    entrance_create_account_cta_label: normalized.entrance_create_account_cta_label,
    entrance_forgot_password_label: normalized.entrance_forgot_password_label,
    entrance_footer_note: normalized.entrance_footer_note,
    public_terms_label: normalized.public_terms_label,
    public_terms_url: normalized.public_terms_url,
    public_privacy_label: normalized.public_privacy_label,
    public_privacy_url: normalized.public_privacy_url,
    public_support_label: normalized.public_support_label,
    public_support_url: normalized.public_support_url,
    seo_title: normalized.seo_title,
    seo_description: normalized.seo_description,
    social_share_image_url: normalized.social_share_image_url,
  };
}

export async function getSiteVisualSettings(): Promise<SiteVisualSettings> {
  const { data, error } = await supabase
    .from('site_visual_settings')
    .select(SETTINGS_COLUMNS)
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
    ...buildNormalizedPayload(payload),
    publication_status: 'published' as SiteVisualPublicationStatus,
    draft_payload: null,
    scheduled_publish_at: null,
    last_published_at: new Date().toISOString(),
    last_published_by: authData.user?.id ?? null,
    updated_by: authData.user?.id ?? null,
  };

  const { data, error } = await supabase
    .from('site_visual_settings')
    .upsert(normalizedPayload, { onConflict: 'id' })
    .select(SETTINGS_COLUMNS)
    .single();

  if (error) {
    if (isMissingSiteVisualSettingsTableError(error.message)) {
      throw new Error('A tabela de configurações visuais ainda não foi aplicada no Supabase.');
    }

    throw new Error(error.message);
  }

  return normalizeSiteVisualSettings(data);
}

export async function saveSiteVisualSettingsDraft(payload: SiteVisualSettingsPayload): Promise<SiteVisualSettings> {
  const { data: authData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('site_visual_settings')
    .upsert({
      id: true,
      publication_status: 'draft',
      draft_payload: buildNormalizedPayload(payload),
      scheduled_publish_at: null,
      updated_by: authData.user?.id ?? null,
    }, { onConflict: 'id' })
    .select(SETTINGS_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return normalizeSiteVisualSettings(data);
}

export async function scheduleSiteVisualSettingsPublication(payload: SiteVisualSettingsPayload, scheduledPublishAt: string): Promise<SiteVisualSettings> {
  const scheduledDate = new Date(scheduledPublishAt);
  if (!Number.isFinite(scheduledDate.getTime())) {
    throw new Error('Informe uma data e hora válidas para o agendamento.');
  }

  const { data: authData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('site_visual_settings')
    .upsert({
      id: true,
      publication_status: 'scheduled',
      draft_payload: buildNormalizedPayload(payload),
      scheduled_publish_at: scheduledDate.toISOString(),
      updated_by: authData.user?.id ?? null,
    }, { onConflict: 'id' })
    .select(SETTINGS_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return normalizeSiteVisualSettings(data);
}

export async function publishSiteVisualSettingsDraft(): Promise<SiteVisualSettings> {
  const current = await getSiteVisualSettings();
  if (!current.draft_payload) return current;
  return saveSiteVisualSettings(current.draft_payload as SiteVisualSettingsPayload);
}
