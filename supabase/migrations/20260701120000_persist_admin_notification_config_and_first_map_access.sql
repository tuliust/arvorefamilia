-- =====================================================
-- NOTIFICATION CONFIG PERSISTENCE AND FIRST MAP ACCESS
-- Data: 2026-07-01
-- Objetivo: persistir configurações administrativas de notificações e deduplicar boas-vindas no primeiro acesso ao mapa.
-- =====================================================

create table if not exists public.admin_notification_configurations (
  id uuid primary key default gen_random_uuid(),
  config_key text not null unique default 'default',

  frequency_overrides jsonb not null default '{}'::jsonb,
  theme_overrides jsonb not null default '{}'::jsonb,
  active_overrides jsonb not null default '{}'::jsonb,
  content_overrides jsonb not null default '{}'::jsonb,
  channel_overrides jsonb not null default '{}'::jsonb,
  recipient_overrides jsonb not null default '{}'::jsonb,
  variable_overrides jsonb not null default '{}'::jsonb,
  custom_definitions jsonb not null default '[]'::jsonb,

  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_notification_configurations_config_key
on public.admin_notification_configurations(config_key);

alter table public.admin_notification_configurations enable row level security;

drop policy if exists "admins can read notification configurations"
on public.admin_notification_configurations;
create policy "admins can read notification configurations"
on public.admin_notification_configurations
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert notification configurations"
on public.admin_notification_configurations;
create policy "admins can insert notification configurations"
on public.admin_notification_configurations
for insert
to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update notification configurations"
on public.admin_notification_configurations;
create policy "admins can update notification configurations"
on public.admin_notification_configurations
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop trigger if exists trg_admin_notification_configurations_updated_at
on public.admin_notification_configurations;
create trigger trg_admin_notification_configurations_updated_at
before update on public.admin_notification_configurations
for each row
execute function public.set_updated_at();

create table if not exists public.user_first_map_accesses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pessoa_id uuid references public.pessoas(id) on delete set null,
  welcome_notification_id uuid references public.notificacoes_usuario(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  first_accessed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_first_map_accesses_pessoa_id
on public.user_first_map_accesses(pessoa_id);

alter table public.user_first_map_accesses enable row level security;

drop policy if exists "users can read own first map access"
on public.user_first_map_accesses;
create policy "users can read own first map access"
on public.user_first_map_accesses
for select
to authenticated
using (auth.uid() = user_id or public.is_admin_user(auth.uid()));

drop policy if exists "users can insert own first map access"
on public.user_first_map_accesses;
create policy "users can insert own first map access"
on public.user_first_map_accesses
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own first map access"
on public.user_first_map_accesses;
create policy "users can update own first map access"
on public.user_first_map_accesses
for update
to authenticated
using (auth.uid() = user_id or public.is_admin_user(auth.uid()))
with check (auth.uid() = user_id or public.is_admin_user(auth.uid()));

drop trigger if exists trg_user_first_map_accesses_updated_at
on public.user_first_map_accesses;
create trigger trg_user_first_map_accesses_updated_at
before update on public.user_first_map_accesses
for each row
execute function public.set_updated_at();
