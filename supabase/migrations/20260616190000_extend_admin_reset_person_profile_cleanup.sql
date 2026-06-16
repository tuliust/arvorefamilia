-- Amplia o reset administrativo de perfil em /admin/pessoas.
-- Limpa bio, curiosidades, arquivos históricos e vínculos/auth users vinculados ao perfil.
-- Observação: auth.users só é removido para usuários não-admin cujo único vínculo de pessoa é o perfil resetado.

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
  deleted_user_links integer := 0;
  deleted_auth_users integer := 0;
  notification_preferences_reset integer := 0;
  auth_user_ids_to_delete uuid[] := '{}'::uuid[];
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'Apenas administradores podem resetar perfil de pessoa.';
  end if;

  update public.pessoas
  set
    foto_principal_url = null,
    minibio = null,
    curiosidades = null,
    permitir_exibir_instagram = true,
    permitir_mensagens_whatsapp = true,
    permitir_exibir_data_nascimento = true,
    permitir_exibir_endereco = true,
    permitir_exibir_rede_social = true,
    permitir_exibir_telefone = true,
    updated_at = now()
  where id = target_pessoa_id;

  get diagnostics updated_people = row_count;

  if updated_people = 0 then
    raise exception 'Pessoa não encontrada.';
  end if;

  delete from public.person_generated_insights
  where pessoa_id = target_pessoa_id
    and tipo in ('astrology', 'historical_events');

  get diagnostics deleted_insights = row_count;

  delete from public.arquivos_historicos
  where pessoa_id = target_pessoa_id;

  get diagnostics deleted_historical_files = row_count;

  delete from public.user_favorites
  where entity_type = 'person'
    and entity_id = target_pessoa_id::text;

  get diagnostics deleted_favorites = row_count;

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

  select count(*)::integer
  into deleted_user_links
  from public.user_person_links
  where pessoa_id = target_pessoa_id;

  if array_length(auth_user_ids_to_delete, 1) is not null then
    delete from auth.users
    where id = any(auth_user_ids_to_delete);

    get diagnostics deleted_auth_users = row_count;
  end if;

  delete from public.user_person_links
  where pessoa_id = target_pessoa_id;

  return jsonb_build_object(
    'updated_people', updated_people,
    'deleted_insights', deleted_insights,
    'deleted_favorites', deleted_favorites,
    'deleted_historical_files', deleted_historical_files,
    'deleted_user_links', deleted_user_links,
    'deleted_auth_users', deleted_auth_users,
    'notification_preferences_reset', notification_preferences_reset
  );
end;
$$;

grant execute on function public.admin_reset_person_profile(uuid) to authenticated;

notify pgrst, 'reload schema';
