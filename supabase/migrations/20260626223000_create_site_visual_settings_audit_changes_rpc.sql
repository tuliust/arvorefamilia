-- =====================================================
-- DIFF DETALHADO DA AUDITORIA VISUAL PUBLICA
-- Data: 2026-06-26
-- Objetivo: expor diferencas campo a campo de um registro de auditoria visual.
-- =====================================================

create or replace function public.get_site_visual_settings_audit_changes(audit_record_id uuid)
returns table (
  field_key text,
  field_label text,
  previous_value text,
  next_value text
)
language sql
stable
security definer
set search_path = public
as $$
  with audit_record as (
    select
      previous_payload,
      next_payload
    from public.site_visual_settings_audit
    where id = audit_record_id
      and public.is_admin_user(auth.uid())
  ), changed_keys as (
    select distinct key
    from audit_record,
      jsonb_object_keys(
        coalesce(previous_payload, '{}'::jsonb) || coalesce(next_payload, '{}'::jsonb)
      ) as key
  )
  select
    changed_keys.key as field_key,
    case changed_keys.key
      when 'home_logo_media_url' then 'Logo'
      when 'home_background_media_url' then 'Imagem de fundo'
      when 'home_background_color' then 'Cor de fundo'
      when 'home_background_media_opacity' then 'Opacidade do fundo'
      when 'global_identity_name' then 'Nome completo'
      when 'global_identity_short_name' then 'Nome curto'
      when 'global_identity_tagline' then 'Tagline'
      when 'global_primary_color' then 'Cor primária'
      when 'global_accent_color' then 'Cor de destaque'
      when 'global_text_color' then 'Cor do texto'
      when 'global_muted_text_color' then 'Cor do texto secundário'
      when 'global_card_background_color' then 'Cor dos cards'
      when 'global_button_radius' then 'Raio dos botões'
      when 'global_card_radius' then 'Raio dos cards'
      when 'home_logo_alt_text' then 'Alt text da logo'
      when 'entrance_eyebrow' then 'Chamada superior'
      when 'entrance_title' then 'Título da entrada'
      when 'entrance_description' then 'Descrição da entrada'
      when 'entrance_login_title' then 'Título do login'
      when 'entrance_login_description' then 'Descrição do login'
      when 'entrance_first_access_title' then 'Título do primeiro acesso'
      when 'entrance_first_access_description' then 'Descrição do primeiro acesso'
      when 'entrance_confirmation_title' then 'Título de confirmação'
      when 'entrance_confirmation_description' then 'Descrição de confirmação'
      when 'entrance_login_cta_label' then 'CTA de login'
      when 'entrance_first_access_cta_label' then 'CTA de validação'
      when 'entrance_create_account_cta_label' then 'CTA de criação de conta'
      when 'entrance_forgot_password_label' then 'Link de senha'
      when 'entrance_footer_note' then 'Nota de rodapé'
      when 'public_terms_label' then 'Label de termos'
      when 'public_terms_url' then 'URL de termos'
      when 'public_privacy_label' then 'Label de privacidade'
      when 'public_privacy_url' then 'URL de privacidade'
      when 'public_support_label' then 'Label de suporte'
      when 'public_support_url' then 'URL de suporte'
      when 'seo_title' then 'Título SEO'
      when 'seo_description' then 'Descrição SEO'
      when 'social_share_image_url' then 'Imagem de compartilhamento'
      when 'publication_status' then 'Status de publicação'
      when 'draft_payload' then 'Payload do rascunho'
      when 'scheduled_publish_at' then 'Data de publicação agendada'
      when 'last_published_at' then 'Última publicação'
      when 'last_published_by' then 'Publicado por'
      when 'updated_at' then 'Atualizado em'
      when 'updated_by' then 'Atualizado por'
      when 'id' then 'ID técnico'
      else changed_keys.key
    end as field_label,
    case
      when audit_record.previous_payload ? changed_keys.key
        then nullif(trim(both '"' from (audit_record.previous_payload -> changed_keys.key)::text), 'null')
      else null
    end as previous_value,
    case
      when audit_record.next_payload ? changed_keys.key
        then nullif(trim(both '"' from (audit_record.next_payload -> changed_keys.key)::text), 'null')
      else null
    end as next_value
  from audit_record
  join changed_keys on true
  where coalesce(audit_record.previous_payload -> changed_keys.key, 'null'::jsonb)
    is distinct from coalesce(audit_record.next_payload -> changed_keys.key, 'null'::jsonb)
  order by field_label;
$$;

grant execute on function public.get_site_visual_settings_audit_changes(uuid) to authenticated;
