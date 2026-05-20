-- =====================================================
-- SITE VISUAL SETTINGS
-- Data: 2026-05-19
-- Objetivo: permitir configuracao visual publica da tela de entrada/home.
-- =====================================================

create table if not exists public.site_visual_settings (
  id boolean primary key default true check (id = true),
  home_logo_media_url text,
  home_background_media_url text,
  home_background_color text not null default '#f9fafb',
  home_background_media_opacity integer not null default 0 check (
    home_background_media_opacity between 0 and 100
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.site_visual_settings (
  id,
  home_logo_media_url,
  home_background_media_url,
  home_background_color,
  home_background_media_opacity
)
values (true, null, null, '#f9fafb', 0)
on conflict (id) do nothing;

drop trigger if exists update_site_visual_settings_updated_at on public.site_visual_settings;
create trigger update_site_visual_settings_updated_at
before update on public.site_visual_settings
for each row
execute function public.update_updated_at_column();

alter table public.site_visual_settings enable row level security;

drop policy if exists "public can read site visual settings" on public.site_visual_settings;
create policy "public can read site visual settings"
on public.site_visual_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admins can insert site visual settings" on public.site_visual_settings;
create policy "admins can insert site visual settings"
on public.site_visual_settings
for insert
to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update site visual settings" on public.site_visual_settings;
create policy "admins can update site visual settings"
on public.site_visual_settings
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read site media" on storage.objects;
create policy "public can read site media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-media');

drop policy if exists "admins can upload site media" on storage.objects;
create policy "admins can upload site media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and public.is_admin_user(auth.uid())
);

drop policy if exists "admins can update site media" on storage.objects;
create policy "admins can update site media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin_user(auth.uid())
)
with check (
  bucket_id = 'site-media'
  and public.is_admin_user(auth.uid())
);

drop policy if exists "admins can delete site media" on storage.objects;
create policy "admins can delete site media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and public.is_admin_user(auth.uid())
);
