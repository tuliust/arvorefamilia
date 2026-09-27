-- Directed PostgREST timeout mitigation: consolidate hot RLS paths and add indexes
-- matching observed notification queries.

drop policy if exists "admins can read all profiles" on public.profiles;
drop policy if exists "users can read own profile" on public.profiles;
create policy "authenticated users can read permitted profiles"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or public.is_admin_user((select auth.uid()))
);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can read own notifications" on public.notificacoes_usuario;
drop policy if exists "admins can read user notifications" on public.notificacoes_usuario;
create policy "authenticated users can read permitted notifications"
on public.notificacoes_usuario for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin_user((select auth.uid()))
);

drop policy if exists "Users can insert own notifications" on public.notificacoes_usuario;
create policy "Users can insert own notifications"
on public.notificacoes_usuario for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own notifications" on public.notificacoes_usuario;
create policy "Users can update own notifications"
on public.notificacoes_usuario for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own notifications" on public.notificacoes_usuario;
create policy "Users can delete own notifications"
on public.notificacoes_usuario for delete to authenticated
using (user_id = (select auth.uid()));

create index if not exists idx_notificacoes_usuario_unread_user
  on public.notificacoes_usuario (user_id)
  where lida = false;

create index if not exists idx_notificacoes_usuario_user_created_at
  on public.notificacoes_usuario (user_id, created_at desc);

drop policy if exists "admins can read all user person links" on public.user_person_links;
drop policy if exists "members can read linked person ids for status badges" on public.user_person_links;
drop policy if exists "users can read own links" on public.user_person_links;
drop policy if exists "users can read own person links" on public.user_person_links;
create policy "authenticated users can read permitted user person links"
on public.user_person_links for select to authenticated
using (
  public.is_admin_user((select auth.uid()))
  or user_id = (select auth.uid())
  or (select public.current_user_has_person_link())
);

drop policy if exists "admins can insert user person links" on public.user_person_links;
drop policy if exists "users can create own person link" on public.user_person_links;
create policy "authenticated users can insert permitted user person links"
on public.user_person_links for insert to authenticated
with check (
  public.is_admin_user((select auth.uid()))
  or user_id = (select auth.uid())
);

drop policy if exists "admins can update user person links" on public.user_person_links;
drop policy if exists "users can update own person links" on public.user_person_links;
create policy "authenticated users can update permitted user person links"
on public.user_person_links for update to authenticated
using (
  public.is_admin_user((select auth.uid()))
  or user_id = (select auth.uid())
)
with check (
  public.is_admin_user((select auth.uid()))
  or user_id = (select auth.uid())
);

drop policy if exists "admins can delete user person links" on public.user_person_links;
create policy "admins can delete user person links"
on public.user_person_links for delete to authenticated
using (public.is_admin_user((select auth.uid())));

drop policy if exists "admins can read person responsible links" on public.person_responsible_links;
drop policy if exists "responsibles can read own person responsible links" on public.person_responsible_links;
create policy "authenticated users can read permitted person responsible links"
on public.person_responsible_links for select to authenticated
using (
  public.is_admin_user((select auth.uid()))
  or exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = (select auth.uid())
      and upl.pessoa_id = person_responsible_links.responsible_pessoa_id
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "admins can insert person responsible links" on public.person_responsible_links;
create policy "admins can insert person responsible links"
on public.person_responsible_links for insert to authenticated
with check (public.is_admin_user((select auth.uid())));

drop policy if exists "admins can update person responsible links" on public.person_responsible_links;
create policy "admins can update person responsible links"
on public.person_responsible_links for update to authenticated
using (public.is_admin_user((select auth.uid())))
with check (public.is_admin_user((select auth.uid())));

drop policy if exists "admins can delete person responsible links" on public.person_responsible_links;
create policy "admins can delete person responsible links"
on public.person_responsible_links for delete to authenticated
using (public.is_admin_user((select auth.uid())));

notify pgrst, 'reload schema';
