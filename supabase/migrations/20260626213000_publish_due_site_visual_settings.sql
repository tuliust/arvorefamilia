-- =====================================================
-- PUBLICACAO AGENDADA REAL DAS CONFIGURACOES PUBLICAS
-- Data: 2026-06-26
-- Objetivo: publicar automaticamente draft_payload quando scheduled_publish_at chegar.
-- =====================================================

create or replace function public.publish_due_site_visual_settings()
returns table (
  published boolean,
  message text,
  published_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_settings public.site_visual_settings%rowtype;
  payload jsonb;
  now_value timestamptz := now();
begin
  if auth.uid() is not null and not public.is_admin_user(auth.uid()) then
    raise exception 'Apenas administradores podem executar a publicação agendada.';
  end if;

  select *
  into current_settings
  from public.site_visual_settings
  where id = true
  for update;

  if not found then
    return query select false, 'Configurações públicas não encontradas.'::text, null::timestamptz;
    return;
  end if;

  if current_settings.publication_status <> 'scheduled' then
    return query select false, 'Não há publicação agendada pendente.'::text, current_settings.last_published_at;
    return;
  end if;

  if current_settings.scheduled_publish_at is null or current_settings.scheduled_publish_at > now_value then
    return query select false, 'A publicação agendada ainda não venceu.'::text, current_settings.last_published_at;
    return;
  end if;

  if current_settings.draft_payload is null then
    update public.site_visual_settings
    set
      publication_status = 'published',
      scheduled_publish_at = null,
      updated_at = now_value
    where id = true;

    return query select false, 'Agendamento encerrado sem rascunho para publicar.'::text, current_settings.last_published_at;
    return;
  end if;

  payload := current_settings.draft_payload;

  insert into public.site_visual_settings_audit (
    action,
    previous_payload,
    next_payload,
    note,
    created_by,
    created_at
  ) values (
    'published',
    to_jsonb(current_settings),
    payload,
    'Publicação agendada executada automaticamente.',
    auth.uid(),
    now_value
  );

  update public.site_visual_settings
  set
    home_logo_media_url = payload ->> 'home_logo_media_url',
    home_background_media_url = payload ->> 'home_background_media_url',
    home_background_color = coalesce(payload ->> 'home_background_color', home_background_color),
    home_background_media_opacity = coalesce(nullif(payload ->> 'home_background_media_opacity', '')::integer, home_background_media_opacity),
    global_identity_name = coalesce(payload ->> 'global_identity_name', global_identity_name),
    global_identity_short_name = coalesce(payload ->> 'global_identity_short_name', global_identity_short_name),
    global_identity_tagline = coalesce(payload ->> 'global_identity_tagline', global_identity_tagline),
    global_primary_color = coalesce(payload ->> 'global_primary_color', global_primary_color),
    global_accent_color = coalesce(payload ->> 'global_accent_color', global_accent_color),
    global_text_color = coalesce(payload ->> 'global_text_color', global_text_color),
    global_muted_text_color = coalesce(payload ->> 'global_muted_text_color', global_muted_text_color),
    global_card_background_color = coalesce(payload ->> 'global_card_background_color', global_card_background_color),
    global_button_radius = coalesce(payload ->> 'global_button_radius', global_button_radius),
    global_card_radius = coalesce(payload ->> 'global_card_radius', global_card_radius),
    home_logo_alt_text = coalesce(payload ->> 'home_logo_alt_text', home_logo_alt_text),
    entrance_eyebrow = coalesce(payload ->> 'entrance_eyebrow', entrance_eyebrow),
    entrance_title = coalesce(payload ->> 'entrance_title', entrance_title),
    entrance_description = coalesce(payload ->> 'entrance_description', entrance_description),
    entrance_login_title = coalesce(payload ->> 'entrance_login_title', entrance_login_title),
    entrance_login_description = coalesce(payload ->> 'entrance_login_description', entrance_login_description),
    entrance_first_access_title = coalesce(payload ->> 'entrance_first_access_title', entrance_first_access_title),
    entrance_first_access_description = coalesce(payload ->> 'entrance_first_access_description', entrance_first_access_description),
    entrance_confirmation_title = coalesce(payload ->> 'entrance_confirmation_title', entrance_confirmation_title),
    entrance_confirmation_description = coalesce(payload ->> 'entrance_confirmation_description', entrance_confirmation_description),
    entrance_login_cta_label = coalesce(payload ->> 'entrance_login_cta_label', entrance_login_cta_label),
    entrance_first_access_cta_label = coalesce(payload ->> 'entrance_first_access_cta_label', entrance_first_access_cta_label),
    entrance_create_account_cta_label = coalesce(payload ->> 'entrance_create_account_cta_label', entrance_create_account_cta_label),
    entrance_forgot_password_label = coalesce(payload ->> 'entrance_forgot_password_label', entrance_forgot_password_label),
    entrance_footer_note = payload ->> 'entrance_footer_note',
    public_terms_label = coalesce(payload ->> 'public_terms_label', public_terms_label),
    public_terms_url = coalesce(payload ->> 'public_terms_url', public_terms_url),
    public_privacy_label = coalesce(payload ->> 'public_privacy_label', public_privacy_label),
    public_privacy_url = coalesce(payload ->> 'public_privacy_url', public_privacy_url),
    public_support_label = payload ->> 'public_support_label',
    public_support_url = payload ->> 'public_support_url',
    seo_title = coalesce(payload ->> 'seo_title', seo_title),
    seo_description = coalesce(payload ->> 'seo_description', seo_description),
    social_share_image_url = payload ->> 'social_share_image_url',
    publication_status = 'published',
    draft_payload = null,
    scheduled_publish_at = null,
    last_published_at = now_value,
    last_published_by = auth.uid(),
    updated_at = now_value,
    updated_by = coalesce(auth.uid(), updated_by)
  where id = true;

  return query select true, 'Publicação agendada executada.'::text, now_value;
end;
$$;

grant execute on function public.publish_due_site_visual_settings() to authenticated;
grant execute on function public.publish_due_site_visual_settings() to service_role;
