import { supabase } from '../lib/supabaseClient';

export type SiteVisualSettingsAuditChange = {
  field_key: string;
  field_label: string;
  previous_value: string | null;
  next_value: string | null;
};

export async function listSiteVisualSettingsAuditChanges(auditRecordId: string) {
  const { data, error } = await supabase.rpc('get_site_visual_settings_audit_changes', {
    audit_record_id: auditRecordId,
  });

  return {
    data: (data ?? []) as SiteVisualSettingsAuditChange[],
    error: error?.message,
  };
}
