import { supabase } from '../lib/supabaseClient';
import { SiteVisualSettings } from './siteVisualSettingsService';

export type SiteVisualSettingsAuditAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'scheduled'
  | 'draft_saved'
  | 'restored';

export type SiteVisualSettingsAuditRecord = {
  id: string;
  action: SiteVisualSettingsAuditAction;
  previous_payload?: Partial<SiteVisualSettings> | null;
  next_payload?: Partial<SiteVisualSettings> | null;
  note?: string | null;
  created_by?: string | null;
  created_at: string;
};

export async function listSiteVisualSettingsAudit(limit = 20) {
  const { data, error } = await supabase
    .from('site_visual_settings_audit')
    .select('id,action,previous_payload,next_payload,note,created_by,created_at')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(100, limit)));

  return {
    data: (data ?? []) as SiteVisualSettingsAuditRecord[],
    error: error?.message,
  };
}

export async function createSiteVisualSettingsAudit(input: {
  action: SiteVisualSettingsAuditAction;
  previousPayload?: Partial<SiteVisualSettings> | null;
  nextPayload?: Partial<SiteVisualSettings> | null;
  note?: string | null;
}) {
  const { data: authData } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('site_visual_settings_audit')
    .insert({
      action: input.action,
      previous_payload: input.previousPayload ?? null,
      next_payload: input.nextPayload ?? null,
      note: input.note ?? null,
      created_by: authData.user?.id ?? null,
    });

  return { error: error?.message };
}
