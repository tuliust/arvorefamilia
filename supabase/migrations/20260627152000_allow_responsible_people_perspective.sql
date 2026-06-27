-- Permite que usuários autenticados leiam os perfis sob sua responsabilidade
-- e editem a pessoa administrada quando o vínculo pessoa-a-pessoa existir.

alter table public.person_responsible_links enable row level security;

drop policy if exists "responsibles can read own person responsible links" on public.person_responsible_links;
create policy "responsibles can read own person responsible links"
on public.person_responsible_links
for select to authenticated
using (
  public.is_admin_user(auth.uid())
  or exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
      and upl.pessoa_id = person_responsible_links.responsible_pessoa_id
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "responsibles can update managed people" on public.pessoas;
create policy "responsibles can update managed people"
on public.pessoas
for update to authenticated
using (
  exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoas.id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
)
with check (
  exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoas.id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

notify pgrst, 'reload schema';
