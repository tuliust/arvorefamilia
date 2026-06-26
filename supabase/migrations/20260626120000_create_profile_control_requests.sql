alter table public.user_person_links
  add column if not exists permission_role text;

update public.user_person_links
set permission_role = case
  when principal = true then 'owner'
  when can_edit = false then 'viewer'
  else 'editor'
end
where permission_role is null;

alter table public.user_person_links
  alter column permission_role set default 'editor';

do $$
begin
  alter table public.user_person_links
    add constraint user_person_links_permission_role_check
    check (permission_role = any (array['owner', 'editor', 'legacy_editor', 'guardian', 'viewer']));
exception
  when duplicate_object then null;
end $$;
