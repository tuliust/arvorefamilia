-- =====================================================
-- ACTIVITY LOGS
-- Data: 2026-05-13
-- Objetivo: registrar atividades relevantes sem expor logs globais a usuarios comuns.
-- =====================================================

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null references auth.users(id) on delete set null,
  actor_pessoa_id uuid null references public.pessoas(id) on delete set null,
  actor_display_name text null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  entity_label text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created_at_desc
on public.activity_logs (created_at desc);

create index if not exists idx_activity_logs_actor_user_id
on public.activity_logs (actor_user_id);

create index if not exists idx_activity_logs_actor_pessoa_id
on public.activity_logs (actor_pessoa_id);

create index if not exists idx_activity_logs_action
on public.activity_logs (action);

create index if not exists idx_activity_logs_entity_type
on public.activity_logs (entity_type);

create index if not exists idx_activity_logs_entity_id
on public.activity_logs (entity_id);

alter table public.activity_logs enable row level security;

drop policy if exists "admins can read activity logs"
on public.activity_logs;

create policy "admins can read activity logs"
on public.activity_logs
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "authenticated users can insert own activity logs"
on public.activity_logs;

create policy "authenticated users can insert own activity logs"
on public.activity_logs
for insert
to authenticated
with check (actor_user_id = auth.uid());
