create table if not exists public.notification_groups (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  ativo boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.notification_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.notification_group_rules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.notification_groups(id) on delete cascade,
  notification_type text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, notification_type)
);

alter table public.notification_groups enable row level security;
alter table public.notification_group_members enable row level security;
alter table public.notification_group_rules enable row level security;

drop policy if exists "admins can read notification groups" on public.notification_groups;
create policy "admins can read notification groups"
on public.notification_groups
for select to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert notification groups" on public.notification_groups;
create policy "admins can insert notification groups"
on public.notification_groups
for insert to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update notification groups" on public.notification_groups;
create policy "admins can update notification groups"
on public.notification_groups
for update to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can delete notification groups" on public.notification_groups;
create policy "admins can delete notification groups"
on public.notification_groups
for delete to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can manage notification group members" on public.notification_group_members;
create policy "admins can manage notification group members"
on public.notification_group_members
for all to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can manage notification group rules" on public.notification_group_rules;
create policy "admins can manage notification group rules"
on public.notification_group_rules
for all to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update notification preferences" on public.preferencias_notificacao;
create policy "admins can update notification preferences"
on public.preferencias_notificacao
for update to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert notification preferences" on public.preferencias_notificacao;
create policy "admins can insert notification preferences"
on public.preferencias_notificacao
for insert to authenticated
with check (public.is_admin_user(auth.uid()));
