-- Phase 1 hardening: views, privileged RPCs and storage writes.

alter view public.google_calendar_connection_status set (security_invoker = true);
alter view public.pessoas_com_estatisticas set (security_invoker = true);

create or replace function public.clear_parentescos_calculados()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  delete from public.parentescos_calculados;
end;
$$;

revoke all on function public.clear_parentescos_calculados() from public, anon;
grant execute on function public.clear_parentescos_calculados() to authenticated, service_role;

revoke all on function public.list_admin_user_ids() from public, anon;
grant execute on function public.list_admin_user_ids() to authenticated, service_role;

revoke all on function public.create_internal_notification_for_user(uuid,text,text,text,text,jsonb) from public, anon;
grant execute on function public.create_internal_notification_for_user(uuid,text,text,text,text,jsonb) to authenticated, service_role;

revoke all on function public.publish_due_site_visual_settings() from public, anon;
grant execute on function public.publish_due_site_visual_settings() to authenticated, service_role;

revoke all on function public.admin_create_user_person_link(uuid,uuid,text,boolean,boolean) from public, anon;
revoke all on function public.admin_delete_user_person_link(uuid) from public, anon;
revoke all on function public.admin_list_profile_control_requests() from public, anon;
revoke all on function public.admin_list_profiles_for_linking() from public, anon;
revoke all on function public.admin_reset_person_profile(uuid) from public, anon;
revoke all on function public.admin_review_profile_control_request(uuid,text,text,text) from public, anon;
revoke all on function public.admin_update_user_person_link(uuid,text,boolean,boolean) from public, anon;

grant execute on function public.admin_create_user_person_link(uuid,uuid,text,boolean,boolean) to authenticated, service_role;
grant execute on function public.admin_delete_user_person_link(uuid) to authenticated, service_role;
grant execute on function public.admin_list_profile_control_requests() to authenticated, service_role;
grant execute on function public.admin_list_profiles_for_linking() to authenticated, service_role;
grant execute on function public.admin_reset_person_profile(uuid) to authenticated, service_role;
grant execute on function public.admin_review_profile_control_request(uuid,text,text,text) to authenticated, service_role;
grant execute on function public.admin_update_user_person_link(uuid,text,boolean,boolean) to authenticated, service_role;

revoke all on function public.get_site_visual_settings_audit_changes(uuid) from public, anon;
grant execute on function public.get_site_visual_settings_audit_changes(uuid) to authenticated, service_role;

revoke all on function public.set_user_primary_person_link(uuid,uuid) from public, anon;
grant execute on function public.set_user_primary_person_link(uuid,uuid) to authenticated, service_role;

grant execute on function public.validate_first_access_code(uuid) to anon, authenticated;

drop policy if exists "authenticated users can delete person avatars" on storage.objects;
drop policy if exists "authenticated users can update person avatars" on storage.objects;
drop policy if exists "authenticated users can update family storage files" on storage.objects;

create policy "owners can update own family storage files"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('person-avatars','historical-files')
  and (
    owner = (select auth.uid())
    or public.is_admin_user((select auth.uid()))
  )
)
with check (
  bucket_id in ('person-avatars','historical-files')
  and (
    owner = (select auth.uid())
    or public.is_admin_user((select auth.uid()))
  )
);

create policy "owners can delete own person avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'person-avatars'
  and (
    owner = (select auth.uid())
    or public.is_admin_user((select auth.uid()))
  )
);

notify pgrst, 'reload schema';
