drop policy if exists "admins can read all profiles" on public.profiles;

create or replace function public.is_admin_user(target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_user_id
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin_user(uuid) to authenticated;

create policy "admins can read all profiles"
on public.profiles
for select
using (public.is_admin_user(auth.uid()));
