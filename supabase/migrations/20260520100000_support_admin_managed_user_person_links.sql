-- =====================================================
-- ADMIN MANAGED USER-PERSON LINKS
-- Data: 2026-05-20
-- Objetivo: permitir 1 usuario autenticado gerenciar N pessoas da arvore.
-- =====================================================

alter table public.user_person_links
  add column if not exists managed_by_admin boolean not null default false,
  add column if not exists can_edit boolean not null default true,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz default now();

update public.user_person_links
set
  can_edit = true,
  managed_by_admin = false
where can_edit is null
   or managed_by_admin is null;

with ranked_primary_links as (
  select
    id,
    row_number() over (partition by user_id order by created_at asc, id asc) as position
  from public.user_person_links
  where principal = true
)
update public.user_person_links upl
set principal = false
from ranked_primary_links ranked
where upl.id = ranked.id
  and ranked.position > 1;

create unique index if not exists user_person_links_one_primary_per_user
on public.user_person_links (user_id)
where principal = true;

drop trigger if exists update_user_person_links_updated_at on public.user_person_links;
create trigger update_user_person_links_updated_at
before update on public.user_person_links
for each row
execute function public.update_updated_at_column();

drop policy if exists "users can manage own links" on public.user_person_links;

drop policy if exists "admins can read all user person links" on public.user_person_links;
create policy "admins can read all user person links"
on public.user_person_links
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert user person links" on public.user_person_links;
create policy "admins can insert user person links"
on public.user_person_links
for insert
to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update user person links" on public.user_person_links;
create policy "admins can update user person links"
on public.user_person_links
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can delete user person links" on public.user_person_links;
create policy "admins can delete user person links"
on public.user_person_links
for delete
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "users can update own linked person" on public.pessoas;
create policy "users can update own linked person"
on public.pessoas
for update
using (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoas.id
      and upl.user_id = auth.uid()
      and upl.can_edit = true
  )
)
with check (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoas.id
      and upl.user_id = auth.uid()
      and upl.can_edit = true
  )
);

create or replace function public.set_user_primary_person_link(
  target_user_id uuid,
  target_pessoa_id uuid
)
returns public.user_person_links
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_link public.user_person_links;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if current_user_id <> target_user_id and not public.is_admin_user(current_user_id) then
    raise exception 'not_authorized';
  end if;

  select *
  into selected_link
  from public.user_person_links
  where user_id = target_user_id
    and pessoa_id = target_pessoa_id
  limit 1;

  if not found then
    raise exception 'link_not_found';
  end if;

  update public.user_person_links
  set principal = false
  where user_id = target_user_id
    and principal = true
    and id <> selected_link.id;

  update public.user_person_links
  set principal = true
  where id = selected_link.id
  returning * into selected_link;

  return selected_link;
end;
$$;

grant execute on function public.set_user_primary_person_link(uuid, uuid) to authenticated;

create or replace function public.confirm_own_user_person_link_data(target_link_id uuid)
returns public.user_person_links
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_link public.user_person_links;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  update public.user_person_links
  set
    dados_confirmados = true,
    dados_confirmados_em = now()
  where id = target_link_id
    and user_id = current_user_id
  returning * into updated_link;

  if not found then
    raise exception 'link_not_found';
  end if;

  return updated_link;
end;
$$;

grant execute on function public.confirm_own_user_person_link_data(uuid) to authenticated;

create or replace function public.admin_list_profiles_for_linking()
returns table (
  id uuid,
  email text,
  nome_exibicao text,
  avatar_url text,
  role text
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    p.nome_exibicao::text,
    p.avatar_url::text,
    p.role::text
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_admin_user(auth.uid())
  order by coalesce(p.nome_exibicao, u.email), u.email;
$$;

grant execute on function public.admin_list_profiles_for_linking() to authenticated;

create or replace function public.admin_create_user_person_link(
  target_user_id uuid,
  target_pessoa_id uuid,
  target_relacao_com_perfil text default null,
  target_principal boolean default false,
  target_can_edit boolean default true
)
returns public.user_person_links
language plpgsql
security definer
set search_path = public
as $$
declare
  created_link public.user_person_links;
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  if target_principal then
    update public.user_person_links
    set principal = false
    where user_id = target_user_id
      and principal = true;
  end if;

  insert into public.user_person_links (
    user_id,
    pessoa_id,
    relacao_com_perfil,
    principal,
    dados_confirmados,
    managed_by_admin,
    can_edit,
    created_by
  )
  values (
    target_user_id,
    target_pessoa_id,
    nullif(target_relacao_com_perfil, ''),
    target_principal,
    false,
    true,
    coalesce(target_can_edit, true),
    auth.uid()
  )
  on conflict (user_id, pessoa_id) do update
  set
    relacao_com_perfil = excluded.relacao_com_perfil,
    principal = excluded.principal,
    managed_by_admin = true,
    can_edit = excluded.can_edit,
    created_by = coalesce(public.user_person_links.created_by, auth.uid())
  returning * into created_link;

  return created_link;
end;
$$;

grant execute on function public.admin_create_user_person_link(uuid, uuid, text, boolean, boolean) to authenticated;

create or replace function public.admin_update_user_person_link(
  target_link_id uuid,
  target_relacao_com_perfil text default null,
  target_principal boolean default false,
  target_can_edit boolean default true
)
returns public.user_person_links
language plpgsql
security definer
set search_path = public
as $$
declare
  current_link public.user_person_links;
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  select *
  into current_link
  from public.user_person_links
  where id = target_link_id
  limit 1;

  if not found then
    raise exception 'link_not_found';
  end if;

  if target_principal then
    update public.user_person_links
    set principal = false
    where user_id = current_link.user_id
      and principal = true
      and id <> target_link_id;
  end if;

  update public.user_person_links
  set
    relacao_com_perfil = nullif(target_relacao_com_perfil, ''),
    principal = coalesce(target_principal, false),
    can_edit = coalesce(target_can_edit, true),
    managed_by_admin = public.user_person_links.managed_by_admin
      or (current_link.relacao_com_perfil is distinct from 'Sou esta pessoa')
  where id = target_link_id
  returning * into current_link;

  return current_link;
end;
$$;

grant execute on function public.admin_update_user_person_link(uuid, text, boolean, boolean) to authenticated;

create or replace function public.admin_delete_user_person_link(target_link_id uuid)
returns public.user_person_links
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_link public.user_person_links;
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  delete from public.user_person_links
  where id = target_link_id
  returning * into deleted_link;

  if not found then
    raise exception 'link_not_found';
  end if;

  return deleted_link;
end;
$$;

grant execute on function public.admin_delete_user_person_link(uuid) to authenticated;
