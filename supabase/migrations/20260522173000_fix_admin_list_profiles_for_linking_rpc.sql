create or replace function public.admin_list_profiles_for_linking()
returns table (
  id uuid,
  email text,
  nome_exibicao text,
  avatar_url text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  return query
  select
    u.id,
    u.email::text,
    p.nome_exibicao::text,
    p.avatar_url::text,
    p.role::text
  from auth.users u
  left join public.profiles p on p.id = u.id
  order by coalesce(p.nome_exibicao, u.email), u.email;
end;
$$;

revoke all on function public.admin_list_profiles_for_linking() from public;
grant execute on function public.admin_list_profiles_for_linking() to authenticated;
