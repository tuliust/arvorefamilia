create or replace function public.create_first_access_link_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_pessoa_id uuid;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.profiles (
    id,
    nome_exibicao,
    role
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nome_exibicao', ''), new.email),
    'member'
  )
  on conflict (id) do nothing;

  metadata_pessoa_id := nullif(new.raw_user_meta_data->>'pessoa_id', '')::uuid;

  if metadata_pessoa_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.pessoas
    where id = metadata_pessoa_id
  ) then
    return new;
  end if;

  if exists (
    select 1
    from public.user_person_links
    where pessoa_id = metadata_pessoa_id
      and user_id <> new.id
  ) then
    return new;
  end if;

  insert into public.user_person_links (
    user_id,
    pessoa_id,
    relacao_com_perfil,
    principal,
    dados_confirmados
  )
  values (
    new.id,
    metadata_pessoa_id,
    'Sou esta pessoa',
    true,
    false
  )
  on conflict (user_id, pessoa_id) do nothing;

  return new;
exception
  when invalid_text_representation then
    return new;
end;
$$;

insert into public.profiles (id, nome_exibicao, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'nome_exibicao', ''), u.email),
  'member'
from auth.users u
where u.email_confirmed_at is not null
  and exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = u.id
  )
  and not exists (
    select 1
    from public.profiles p
    where p.id = u.id
  )
on conflict (id) do nothing;

notify pgrst, 'reload schema';
