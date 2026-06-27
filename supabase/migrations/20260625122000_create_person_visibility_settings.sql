create table if not exists public.person_visibility_settings (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null unique references public.pessoas(id) on delete cascade,
  perfil_visivel boolean not null default true,
  arvore_visivel boolean not null default true,
  mapa_familiar_visivel boolean not null default true,
  curiosidades_visivel boolean not null default true,
  arquivos_historicos_visivel boolean not null default true,
  calendario_visivel boolean not null default true,
  forum_visivel boolean not null default true,
  dados_sensiveis_visiveis boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.person_visibility_settings enable row level security;

drop policy if exists "admins can read person visibility settings" on public.person_visibility_settings;
create policy "admins can read person visibility settings"
on public.person_visibility_settings
for select to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert person visibility settings" on public.person_visibility_settings;
create policy "admins can insert person visibility settings"
on public.person_visibility_settings
for insert to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update person visibility settings" on public.person_visibility_settings;
create policy "admins can update person visibility settings"
on public.person_visibility_settings
for update to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can delete person visibility settings" on public.person_visibility_settings;
create policy "admins can delete person visibility settings"
on public.person_visibility_settings
for delete to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert person generated insights" on public.person_generated_insights;
create policy "admins can insert person generated insights"
on public.person_generated_insights
for insert to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update person generated insights" on public.person_generated_insights;
create policy "admins can update person generated insights"
on public.person_generated_insights
for update to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can delete person generated insights" on public.person_generated_insights;
create policy "admins can delete person generated insights"
on public.person_generated_insights
for delete to authenticated
using (public.is_admin_user(auth.uid()));
