-- Phase 1 hardening follow-up: remove remaining unintended anonymous RPC execution.

alter function public.google_calendar_update_updated_at() set search_path = public;
alter function public.set_updated_at() set search_path = public;
alter function public.update_updated_at_column() set search_path = public;
alter function public.forum_update_updated_at() set search_path = public;

revoke all on function public.confirm_own_user_person_link_data(uuid) from public, anon;
grant execute on function public.confirm_own_user_person_link_data(uuid) to authenticated, service_role;

revoke all on function public.create_first_access_link_from_auth_user() from public, anon, authenticated;
grant execute on function public.create_first_access_link_from_auth_user() to service_role;

revoke all on function public.create_profile_control_request(uuid,text,text) from public, anon;
grant execute on function public.create_profile_control_request(uuid,text,text) to authenticated, service_role;

revoke all on function public.current_user_has_person_link() from public, anon;
grant execute on function public.current_user_has_person_link() to authenticated, service_role;

revoke all on function public.ensure_first_access_person_link(uuid) from public, anon;
grant execute on function public.ensure_first_access_person_link(uuid) to authenticated, service_role;

revoke all on function public.forum_increment_topic_view(uuid) from public, anon;
grant execute on function public.forum_increment_topic_view(uuid) to authenticated, service_role;

revoke all on function public.forum_is_admin() from public, anon;
grant execute on function public.forum_is_admin() to authenticated, service_role;

revoke all on function public.forum_mark_solution(uuid,uuid) from public, anon;
grant execute on function public.forum_mark_solution(uuid,uuid) to authenticated, service_role;

revoke all on function public.get_person_profile_selected_badges(uuid) from public, anon;
grant execute on function public.get_person_profile_selected_badges(uuid) to authenticated, service_role;

revoke all on function public.guard_relationship_change_request_member_update() from public, anon, authenticated;
grant execute on function public.guard_relationship_change_request_member_update() to service_role;

revoke all on function public.insert_notification_dispatch_log_for_user(uuid,uuid,text,text,text,text,text,jsonb) from public, anon;
grant execute on function public.insert_notification_dispatch_log_for_user(uuid,uuid,text,text,text,text,text,jsonb) to authenticated, service_role;

revoke all on function public.is_admin_user(uuid) from public, anon;
grant execute on function public.is_admin_user(uuid) to authenticated, service_role;

revoke all on function public.list_profile_managers(uuid) from public, anon;
grant execute on function public.list_profile_managers(uuid) to authenticated, service_role;

-- validate_first_access_code(uuid) remains intentionally callable by anon.
notify pgrst, 'reload schema';
