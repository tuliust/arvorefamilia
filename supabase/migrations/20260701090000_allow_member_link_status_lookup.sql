-- =====================================================
-- MEMBER LINK STATUS LOOKUP
-- Data: 2026-07-01
-- Objetivo: permitir que membros autenticados identifiquem quais pessoas ja possuem conta vinculada.
-- Contexto: a tela /meus-vinculos exibe o badge Cadastrado/Pre-cadastrado usando apenas pessoa_id de user_person_links.
-- =====================================================

create or replace function public.current_user_has_person_link()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
  );
$$;

grant execute on function public.current_user_has_person_link() to authenticated;

drop policy if exists "members can read linked person ids for status badges" on public.user_person_links;
create policy "members can read linked person ids for status badges"
on public.user_person_links
for select
to authenticated
using (
  public.is_admin_user(auth.uid())
  or user_id = auth.uid()
  or public.current_user_has_person_link()
);
