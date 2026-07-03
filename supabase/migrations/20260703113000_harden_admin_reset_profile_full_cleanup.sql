-- Amplia a limpeza do reset de perfil administrativo para cobrir dados
-- editados pelo membro, logs, favoritos, Storage e auth user quando seguro.

create or replace function public.admin_reset_person_profile(target_pessoa_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_people integer := 0;
  deleted_insights integer := 0;
  deleted_favorites integer := 0;
  deleted_historical_files integer := 0;
  deleted_person_events integer := 0;
  deleted_social_profiles integer := 0;
  deleted_questionnaire_answers integer := 0;
  deleted_activity_logs integer := 0;
  deleted_user_links integer := 0;
  deleted_auth_users integer := 0;
  deleted_profiles integer := 0;
  notification_preferences_reset integer := 0;
  deleted_notifications integer := 0;
  deleted_notification_dispatch_logs integer := 0;
  deleted_notification_occurrences integer := 0;
  deleted_relationship_change_requests integer := 0;
  deleted_profile_control_requests integer := 0;
  deleted_profile_suggestions integer := 0;
  deleted_visibility_settings integer := 0;
  deleted_first_map_accesses integer := 0;
  deleted_avatar_storage_objects integer := 0;
  deleted_historical_storage_objects integer := 0;
  deleted_step integer := 0;
  reset_pessoa_id uuid := target_pessoa_id;
  linked_user_ids uuid[] := '{}'::uuid[];
  auth_user_ids_to_delete uuid[] := '{}'::uuid[];
  notification_ids uuid[] := '{}'::uuid[];
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'Apenas administradores podem resetar perfil de pessoa.';
  end if;

  select coalesce(array_agg(distinct upl.user_id), '{}'::uuid[])
  into linked_user_ids
  from public.user_person_links upl
  where upl.pessoa_id = reset_pessoa_id;

  select coalesce(array_agg(distinct upl.user_id), '{}'::uuid[])
  into auth_user_ids_to_delete
  from public.user_person_links upl
  left join public.profiles p on p.id = upl.user_id
  where upl.pessoa_id = reset_pessoa_id
    and upl.user_id <> auth.uid()
    and coalesce(p.role, 'member') <> 'admin'
    and not exists (
      select 1
      from public.user_person_links other_links
      where other_links.user_id = upl.user_id
        and other_links.pessoa_id <> reset_pessoa_id
    );

  update public.pessoas
  set
    foto_principal_url = null,
    minibio = null,
    curiosidades = null,
    telefone = null,
    endereco = null,
    complemento = null,
    local_atual = null,
    rede_social = null,
    instagram_usuario = null,
    instagram_url = null,
    permitir_exibir_instagram = true,
    permitir_mensagens_whatsapp = true,
    permitir_exibir_data_nascimento = true,
    permitir_exibir_endereco = true,
    permitir_exibir_rede_social = true,
    permitir_exibir_telefone = true,
    updated_at = now()
  where id = reset_pessoa_id;

  get diagnostics updated_people = row_count;

  if updated_people = 0 then
    raise exception 'Pessoa nao encontrada.';
  end if;

  if to_regclass('storage.objects') is not null then
    delete from storage.objects
    where bucket_id = 'person-avatars'
      and name like reset_pessoa_id::text || '/%';
    get diagnostics deleted_avatar_storage_objects = row_count;

    delete from storage.objects storage_object
    using public.arquivos_historicos arquivo
    where arquivo.pessoa_id = reset_pessoa_id
      and arquivo.storage_bucket is not null
      and arquivo.storage_path is not null
      and storage_object.bucket_id = arquivo.storage_bucket
      and storage_object.name = arquivo.storage_path;
    get diagnostics deleted_historical_storage_objects = row_count;

    delete from storage.objects
    where bucket_id = 'historical-files'
      and name like 'pessoas/' || reset_pessoa_id::text || '/%';
    get diagnostics deleted_step = row_count;
    deleted_historical_storage_objects := deleted_historical_storage_objects + deleted_step;
  end if;

  delete from public.person_generated_insights
  where pessoa_id = reset_pessoa_id;
  get diagnostics deleted_insights = row_count;

  delete from public.arquivos_historicos
  where pessoa_id = reset_pessoa_id;
  get diagnostics deleted_historical_files = row_count;

  if to_regclass('public.person_events') is not null then
    delete from public.person_events
    where pessoa_id = reset_pessoa_id;
    get diagnostics deleted_person_events = row_count;
  end if;

  if to_regclass('public.pessoa_social_profiles') is not null then
    delete from public.pessoa_social_profiles
    where pessoa_id = reset_pessoa_id;
    get diagnostics deleted_social_profiles = row_count;
  end if;

  if to_regclass('public.person_profile_questionnaire_answers') is not null then
    delete from public.person_profile_questionnaire_answers
    where pessoa_id = reset_pessoa_id;
    get diagnostics deleted_questionnaire_answers = row_count;
  end if;

  if to_regclass('public.person_visibility_settings') is not null then
    delete from public.person_visibility_settings
    where pessoa_id = reset_pessoa_id;
    get diagnostics deleted_visibility_settings = row_count;
  end if;

  if to_regclass('public.person_profile_suggestions') is not null then
    delete from public.person_profile_suggestions pps
    where pps.target_pessoa_id = reset_pessoa_id
      or pps.requester_pessoa_id = reset_pessoa_id
      or pps.requester_user_id = any(linked_user_ids);
    get diagnostics deleted_profile_suggestions = row_count;
  end if;

  if to_regclass('public.relationship_change_requests') is not null then
    delete from public.relationship_change_requests rcr
    where rcr.requester_user_id = any(linked_user_ids)
      or rcr.requester_pessoa_id = reset_pessoa_id
      or rcr.target_pessoa_id = reset_pessoa_id
      or rcr.related_pessoa_id = reset_pessoa_id;
    get diagnostics deleted_relationship_change_requests = row_count;
  end if;

  if to_regclass('public.profile_control_requests') is not null then
    delete from public.profile_control_requests pcr
    where pcr.requester_user_id = any(linked_user_ids)
      or pcr.requester_pessoa_id = reset_pessoa_id
      or pcr.target_pessoa_id = reset_pessoa_id;
    get diagnostics deleted_profile_control_requests = row_count;
  end if;

  delete from public.user_favorites
  where user_id = any(linked_user_ids)
    or (entity_type = 'person' and entity_id = reset_pessoa_id::text)
    or (entity_type = 'historical_file' and metadata->>'pessoa_id' = reset_pessoa_id::text);
  get diagnostics deleted_favorites = row_count;

  if to_regclass('public.notificacoes_usuario') is not null then
    select coalesce(array_agg(id), '{}'::uuid[])
    into notification_ids
    from public.notificacoes_usuario
    where user_id = any(linked_user_ids);
  end if;

  if to_regclass('public.notification_dispatch_logs') is not null then
    delete from public.notification_dispatch_logs
    where user_id = any(linked_user_ids)
      or notification_id = any(notification_ids);
    get diagnostics deleted_notification_dispatch_logs = row_count;
  end if;

  if to_regclass('public.notification_occurrences') is not null then
    delete from public.notification_occurrences
    where user_id = any(linked_user_ids)
      or notification_id = any(notification_ids)
      or (entity_type = 'person' and entity_id = reset_pessoa_id);
    get diagnostics deleted_notification_occurrences = row_count;
  end if;

  if to_regclass('public.notificacoes_usuario') is not null then
    delete from public.notificacoes_usuario
    where user_id = any(linked_user_ids);
    get diagnostics deleted_notifications = row_count;
  end if;

  if to_regclass('public.preferencias_notificacao') is not null then
    delete from public.preferencias_notificacao
    where user_id = any(linked_user_ids);
    get diagnostics notification_preferences_reset = row_count;
  end if;

  if to_regclass('public.user_first_map_accesses') is not null then
    delete from public.user_first_map_accesses
    where user_id = any(linked_user_ids)
      or pessoa_id = reset_pessoa_id;
    get diagnostics deleted_first_map_accesses = row_count;
  end if;

  if to_regclass('public.activity_logs') is not null then
    delete from public.activity_logs
    where entity_id = reset_pessoa_id
      or actor_pessoa_id = reset_pessoa_id
      or actor_user_id = any(linked_user_ids);
    get diagnostics deleted_activity_logs = row_count;
  end if;

  select count(*)::integer
  into deleted_user_links
  from public.user_person_links
  where pessoa_id = reset_pessoa_id;

  delete from public.user_person_links
  where pessoa_id = reset_pessoa_id;

  if array_length(auth_user_ids_to_delete, 1) is not null then
    delete from public.profiles
    where id = any(auth_user_ids_to_delete);
    get diagnostics deleted_profiles = row_count;

    delete from auth.users
    where id = any(auth_user_ids_to_delete);
    get diagnostics deleted_auth_users = row_count;
  end if;

  return jsonb_build_object(
    'updated_people', updated_people,
    'deleted_insights', deleted_insights,
    'deleted_favorites', deleted_favorites,
    'deleted_historical_files', deleted_historical_files,
    'deleted_person_events', deleted_person_events,
    'deleted_social_profiles', deleted_social_profiles,
    'deleted_questionnaire_answers', deleted_questionnaire_answers,
    'deleted_activity_logs', deleted_activity_logs,
    'deleted_user_links', deleted_user_links,
    'deleted_auth_users', deleted_auth_users,
    'deleted_profiles', deleted_profiles,
    'notification_preferences_reset', notification_preferences_reset,
    'deleted_notifications', deleted_notifications,
    'deleted_notification_dispatch_logs', deleted_notification_dispatch_logs,
    'deleted_notification_occurrences', deleted_notification_occurrences,
    'deleted_relationship_change_requests', deleted_relationship_change_requests,
    'deleted_profile_control_requests', deleted_profile_control_requests,
    'deleted_profile_suggestions', deleted_profile_suggestions,
    'deleted_visibility_settings', deleted_visibility_settings,
    'deleted_first_map_accesses', deleted_first_map_accesses,
    'deleted_avatar_storage_objects', deleted_avatar_storage_objects,
    'deleted_historical_storage_objects', deleted_historical_storage_objects
  );
end;
$$;

grant execute on function public.admin_reset_person_profile(uuid) to authenticated;

notify pgrst, 'reload schema';
