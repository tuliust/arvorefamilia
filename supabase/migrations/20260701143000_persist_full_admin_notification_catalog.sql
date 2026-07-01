create table if not exists public.admin_notification_catalogs (
  id uuid primary key default gen_random_uuid(),
  catalog_key text not null unique default 'default',
  frequency_options jsonb not null default '[]'::jsonb,
  theme_options jsonb not null default '[]'::jsonb,
  recipient_groups jsonb not null default '[]'::jsonb,
  notification_types jsonb not null default '[]'::jsonb,
  notification_templates jsonb not null default '[]'::jsonb,
  automations jsonb not null default '[]'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_notification_catalogs_catalog_key
  on public.admin_notification_catalogs (catalog_key);

alter table public.admin_notification_catalogs enable row level security;

drop policy if exists "admins can read notification catalogs" on public.admin_notification_catalogs;
create policy "admins can read notification catalogs"
  on public.admin_notification_catalogs
  for select
  to authenticated
  using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert notification catalogs" on public.admin_notification_catalogs;
create policy "admins can insert notification catalogs"
  on public.admin_notification_catalogs
  for insert
  to authenticated
  with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update notification catalogs" on public.admin_notification_catalogs;
create policy "admins can update notification catalogs"
  on public.admin_notification_catalogs
  for update
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

drop trigger if exists trg_admin_notification_catalogs_updated_at on public.admin_notification_catalogs;
create trigger trg_admin_notification_catalogs_updated_at
  before update on public.admin_notification_catalogs
  for each row
  execute function public.set_updated_at();
