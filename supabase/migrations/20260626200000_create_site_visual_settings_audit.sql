-- =====================================================
-- AUDITORIA DE CONFIGURACOES PUBLICAS
-- Data: 2026-06-26
-- Objetivo: preparar trilha de auditoria e base para futuras publicacoes em etapas.
-- =====================================================

create table if not exists public.site_visual_settings_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('created', 'updated', 'published', 'scheduled', 'draft_saved', 'restored')),
  previous_payload jsonb,
  next_payload jsonb,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_site_visual_settings_audit_created_at
on public.site_visual_settings_audit (created_at desc);

create index if not exists idx_site_visual_settings_audit_created_by
on public.site_visual_settings_audit (created_by);

alter table public.site_visual_settings
  add column if not exists publication_status text not null default 'published' check (publication_status in ('draft', 'scheduled', 'published')),
  add column if not exists draft_payload jsonb,
  add column if not exists scheduled_publish_at timestamptz,
  add column if not exists last_published_at timestamptz,
  add column if not exists last_published_by uuid references auth.users(id) on delete set null;

update public.site_visual_settings
set
  publication_status = coalesce(nullif(publication_status, ''), 'published'),
  last_published_at = coalesce(last_published_at, updated_at, now()),
  last_published_by = coalesce(last_published_by, updated_by);

alter table public.site_visual_settings_audit enable row level security;

drop policy if exists "admins can read site visual settings audit" on public.site_visual_settings_audit;
create policy "admins can read site visual settings audit"
on public.site_visual_settings_audit
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert site visual settings audit" on public.site_visual_settings_audit;
create policy "admins can insert site visual settings audit"
on public.site_visual_settings_audit
for insert
to authenticated
with check (public.is_admin_user(auth.uid()));
