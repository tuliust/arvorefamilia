-- Aprofunda o reset administrativo de perfil e expõe somente selected_badges do questionário.
-- TODO(storage): remover objetos físicos de fotos/arquivos no Storage via Edge Function/service role.

create or replace function public.get_person_profile_selected_badges(target_pessoa_id uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ppqa.selected_badges
      from public.person_profile_questionnaire_answers ppqa
      where ppqa.pessoa_id = target_pessoa_id
      order by ppqa.updated_at desc nulls last, ppqa.created_at desc nulls last
      limit 1
    ),
    '[]'::jsonb
  )
  where auth.uid() is not null
    and exists (
      select 1
      from public.pessoas p
      where p.id = target_pessoa_id
    );
$$;

grant execute on function public.get_person_profile_selected_badges(uuid) to authenticated;

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
  notification_preferences_reset integer := 0;
  linked_user_ids uuid[] := '{}'::uuid[];
  auth_user_ids_to_delete uuid[] := '{}'::uuid[];
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'Apenas administradores podem resetar perfil de pessoa.';
  end if;

  select coalesce(array_agg(distinct upl.user_id), '{}'::uuid[])
  into linked_user_ids
  from public.user_person_links upl
  where upl.pessoa_id = target_pessoa_id;

  select coalesce(array_agg(distinct upl.user_id), '{}'::uuid[])
  into auth_user_ids_to_delete
  from public.user_person_links upl
  left join public.profiles p on p.id = upl.user_id
  where upl.pessoa_id = target_pessoa_id
    and upl.user_id <> auth.uid()
    and coalesce(p.role, 'member') <> 'admin'
    and not exists (
      select 1
      from public.user_person_links other_links
      where other_links.user_id = upl.user_id
        and other_links.pessoa_id <> target_pessoa_id
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
    receber_avisos_gerais = true,
    updated_at = now()
  where id = target_pessoa_id;

  get diagnostics updated_people = row_count;

  if updated_people = 0 then
    raise exception 'Pessoa não encontrada.';
  end if;

  delete from public.person_generated_insights
  where pessoa_id = target_pessoa_id;
  get diagnostics deleted_insights = row_count;

  delete from public.arquivos_historicos
  where pessoa_id = target_pessoa_id;
  get diagnostics deleted_historical_files = row_count;

  if to_regclass('public.person_events') is not null then
    delete from public.person_events
    where pessoa_id = target_pessoa_id;
    get diagnostics deleted_person_events = row_count;
  end if;

  if to_regclass('public.pessoa_social_profiles') is not null then
    delete from public.pessoa_social_profiles
    where pessoa_id = target_pessoa_id;
    get diagnostics deleted_social_profiles = row_count;
  end if;

  if to_regclass('public.person_profile_questionnaire_answers') is not null then
    delete from public.person_profile_questionnaire_answers
    where pessoa_id = target_pessoa_id;
    get diagnostics deleted_questionnaire_answers = row_count;
  end if;

  delete from public.user_favorites
  where (entity_type = 'person' and entity_id = target_pessoa_id::text)
    or (entity_type = 'historical_file' and metadata->>'pessoa_id' = target_pessoa_id::text);
  get diagnostics deleted_favorites = row_count;

  if to_regclass('public.activity_logs') is not null then
    delete from public.activity_logs
    where entity_id = target_pessoa_id
      or actor_pessoa_id = target_pessoa_id
      or (array_length(linked_user_ids, 1) is not null and actor_user_id = any(linked_user_ids));
    get diagnostics deleted_activity_logs = row_count;
  end if;

  if to_regclass('public.preferencias_notificacao') is not null
    and array_length(linked_user_ids, 1) is not null then
    delete from public.preferencias_notificacao
    where user_id = any(linked_user_ids);
    get diagnostics notification_preferences_reset = row_count;
  end if;

  select count(*)::integer
  into deleted_user_links
  from public.user_person_links
  where pessoa_id = target_pessoa_id;

  delete from public.user_person_links
  where pessoa_id = target_pessoa_id;

  if array_length(auth_user_ids_to_delete, 1) is not null then
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
    'notification_preferences_reset', notification_preferences_reset
  );
end;
$$;

grant execute on function public.admin_reset_person_profile(uuid) to authenticated;

notify pgrst, 'reload schema';
