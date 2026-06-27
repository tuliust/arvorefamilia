-- =====================================================
-- ADMIN PROFILES FOR LINKING CREATED_AT
-- Data: 2026-06-26
-- Objetivo: expor data de criação dos auth users para ordenar novos cadastros no painel admin.
-- =====================================================

drop function if exists public.admin_list_profiles_for_linking();

create or replace function public.admin_list_profiles_for_linking()
returns table (
  id uuid,
  email text,
  nome_exibicao text,
  avatar_url text,
  role text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    p.nome_exibicao::text,
    p.avatar_url::text,
    p.role::text,
    u.created_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_admin_user(auth.uid())
  order by u.created_at desc nulls last, coalesce(p.nome_exibicao, u.email), u.email;
$$;

grant execute on function public.admin_list_profiles_for_linking() to authenticated;
