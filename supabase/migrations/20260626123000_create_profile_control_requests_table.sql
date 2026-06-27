-- =====================================================
-- PROFILE CONTROL REQUESTS
-- Data: 2026-06-26
-- Objetivo: permitir solicitacao e aprovacao de responsaveis por perfis legados ou criancas.
-- =====================================================

create table if not exists public.profile_control_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  requester_pessoa_id uuid references public.pessoas(id) on delete set null,
  target_pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  reason text not null default 'other' check (reason in ('deceased', 'minor_or_dependent', 'close_family', 'other')),
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profile_control_requests_one_pending_per_user_target
on public.profile_control_requests (requester_user_id, target_pessoa_id)
where status = 'pending';

create index if not exists profile_control_requests_target_idx
on public.profile_control_requests (target_pessoa_id, status, created_at desc);

create index if not exists profile_control_requests_requester_idx
on public.profile_control_requests (requester_user_id, status, created_at desc);

drop trigger if exists update_profile_control_requests_updated_at on public.profile_control_requests;
create trigger update_profile_control_requests_updated_at
before update on public.profile_control_requests
for each row
execute function public.update_updated_at_column();

alter table public.profile_control_requests enable row level security;

drop policy if exists "requesters can read own profile control requests" on public.profile_control_requests;
create policy "requesters can read own profile control requests"
on public.profile_control_requests
for select
to authenticated
using (requester_user_id = auth.uid());

drop policy if exists "admins can read all profile control requests" on public.profile_control_requests;
create policy "admins can read all profile control requests"
on public.profile_control_requests
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "requesters can insert own profile control requests" on public.profile_control_requests;
create policy "requesters can insert own profile control requests"
on public.profile_control_requests
for insert
to authenticated
with check (requester_user_id = auth.uid());

drop policy if exists "requesters can cancel own pending profile control requests" on public.profile_control_requests;
create policy "requesters can cancel own pending profile control requests"
on public.profile_control_requests
for update
to authenticated
using (requester_user_id = auth.uid() and status = 'pending')
with check (requester_user_id = auth.uid() and status in ('pending', 'cancelled'));

drop policy if exists "admins can update profile control requests" on public.profile_control_requests;
create policy "admins can update profile control requests"
on public.profile_control_requests
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

create or replace function public.list_profile_managers(target_pessoa_id uuid)
returns table (
  user_id uuid,
  nome_exibicao text,
  avatar_url text,
  permission_role text,
  principal boolean,
  can_edit boolean
)
language sql
security definer
set search_path = public
as $$
  select
    upl.user_id,
    coalesce(nullif(p.nome_exibicao, ''), 'Usu├írio respons├ível')::text as nome_exibicao,
    p.avatar_url::text,
    coalesce(upl.permission_role, case when upl.principal then 'owner' when upl.can_edit = false then 'viewer' else 'editor' end)::text as permission_role,
    coalesce(upl.principal, false) as principal,
    coalesce(upl.can_edit, true) as can_edit
  from public.user_person_links upl
  left join public.profiles p on p.id = upl.user_id
  where upl.pessoa_id = target_pessoa_id
    and coalesce(upl.can_edit, true) = true
    and coalesce(upl.permission_role, 'editor') <> 'viewer'
  order by coalesce(upl.principal, false) desc, upl.created_at asc;
$$;

grant execute on function public.list_profile_managers(uuid) to authenticated;

create or replace function public.create_profile_control_request(
  target_pessoa_id uuid,
  request_reason text default 'other',
  request_description text default null
)
returns public.profile_control_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  requester_link public.user_person_links;
  existing_request public.profile_control_requests;
  created_request public.profile_control_requests;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into requester_link
  from public.user_person_links
  where user_id = current_user_id
  order by principal desc, created_at asc
  limit 1;

  if exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = current_user_id
      and upl.pessoa_id = target_pessoa_id
      and coalesce(upl.can_edit, true) = true
  ) then
    raise exception 'already_manages_profile';
  end if;

  select *
  into existing_request
  from public.profile_control_requests pcr
  where pcr.requester_user_id = current_user_id
    and pcr.target_pessoa_id = create_profile_control_request.target_pessoa_id
    and pcr.status = 'pending'
  limit 1;

  if found then
    return existing_request;
  end if;

  insert into public.profile_control_requests (
    requester_user_id,
    requester_pessoa_id,
    target_pessoa_id,
    reason,
    description,
    status
  ) values (
    current_user_id,
    requester_link.pessoa_id,
    target_pessoa_id,
    case
      when request_reason in ('deceased', 'minor_or_dependent', 'close_family', 'other') then request_reason
      else 'other'
    end,
    nullif(trim(coalesce(request_description, '')), ''),
    'pending'
  )
  returning * into created_request;

  return created_request;
end;
$$;

grant execute on function public.create_profile_control_request(uuid, text, text) to authenticated;

create or replace function public.admin_list_profile_control_requests()
returns table (
  id uuid,
  requester_user_id uuid,
  requester_pessoa_id uuid,
  requester_label text,
  requester_email text,
  target_pessoa_id uuid,
  target_label text,
  reason text,
  description text,
  status text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    pcr.id,
    pcr.requester_user_id,
    pcr.requester_pessoa_id,
    coalesce(rp.nome_completo, pr.nome_exibicao, au.email::text, 'Usu├írio solicitante')::text as requester_label,
    au.email::text as requester_email,
    pcr.target_pessoa_id,
    coalesce(tp.nome_completo, 'Pessoa solicitada')::text as target_label,
    pcr.reason,
    pcr.description,
    pcr.status,
    pcr.reviewed_by,
    pcr.reviewed_at,
    pcr.admin_note,
    pcr.created_at,
    pcr.updated_at
  from public.profile_control_requests pcr
  left join public.pessoas rp on rp.id = pcr.requester_pessoa_id
  left join public.pessoas tp on tp.id = pcr.target_pessoa_id
  left join public.profiles pr on pr.id = pcr.requester_user_id
  left join auth.users au on au.id = pcr.requester_user_id
  where public.is_admin_user(auth.uid())
  order by
    case pcr.status when 'pending' then 0 when 'approved' then 1 when 'rejected' then 2 else 3 end,
    pcr.created_at desc;
$$;

grant execute on function public.admin_list_profile_control_requests() to authenticated;

create or replace function public.admin_review_profile_control_request(
  request_id uuid,
  next_status text,
  review_note text default null,
  permission_role text default null
)
returns public.profile_control_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  current_request public.profile_control_requests;
  updated_request public.profile_control_requests;
  resolved_role text;
  created_link public.user_person_links;
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  if next_status not in ('approved', 'rejected', 'cancelled') then
    raise exception 'invalid_status';
  end if;

  select *
  into current_request
  from public.profile_control_requests
  where id = request_id
  limit 1;

  if not found then
    raise exception 'request_not_found';
  end if;

  resolved_role := coalesce(
    case when permission_role in ('owner', 'editor', 'legacy_editor', 'guardian', 'viewer') then permission_role else null end,
    case current_request.reason
      when 'deceased' then 'legacy_editor'
      when 'minor_or_dependent' then 'guardian'
      else 'editor'
    end
  );

  update public.profile_control_requests
  set
    status = next_status,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    admin_note = nullif(trim(coalesce(review_note, '')), '')
  where id = request_id
  returning * into updated_request;

  if next_status = 'approved' then
    created_link := public.admin_create_user_person_link(
      updated_request.requester_user_id,
      updated_request.target_pessoa_id,
      resolved_role,
      false,
      resolved_role <> 'viewer'
    );

    update public.user_person_links
    set permission_role = resolved_role
    where id = created_link.id;
  end if;

  return updated_request;
end;
$$;

grant execute on function public.admin_review_profile_control_request(uuid, text, text, text) to authenticated;
