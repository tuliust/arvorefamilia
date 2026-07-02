-- Permite que usuarios autenticados leiam o catalogo/configuracao de notificacoes
-- para que os disparos em runtime usem o que foi salvo em /admin/notificacoes.
-- Escrita continua restrita aos administradores pelas policies ja existentes.

alter table public.admin_notification_configurations
  add column if not exists deleted_type_ids jsonb not null default '[]'::jsonb;

drop policy if exists "authenticated can read notification runtime configurations"
on public.admin_notification_configurations;
create policy "authenticated can read notification runtime configurations"
on public.admin_notification_configurations
for select
to authenticated
using (true);

drop policy if exists "authenticated can read notification runtime catalogs"
on public.admin_notification_catalogs;
create policy "authenticated can read notification runtime catalogs"
on public.admin_notification_catalogs
for select
to authenticated
using (true);

notify pgrst, 'reload schema';
