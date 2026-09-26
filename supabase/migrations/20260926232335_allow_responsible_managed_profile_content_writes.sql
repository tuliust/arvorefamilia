-- Allow responsible users to manage content for people linked through person_responsible_links.

drop policy if exists "linked users can read own pessoa social profiles" on public.pessoa_social_profiles;
create policy "linked users can read own pessoa social profiles"
on public.pessoa_social_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "linked users can insert own pessoa social profiles" on public.pessoa_social_profiles;
create policy "linked users can insert own pessoa social profiles"
on public.pessoa_social_profiles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "linked users can update own pessoa social profiles" on public.pessoa_social_profiles;
create policy "linked users can update own pessoa social profiles"
on public.pessoa_social_profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
)
with check (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "linked users can delete own pessoa social profiles" on public.pessoa_social_profiles;
create policy "linked users can delete own pessoa social profiles"
on public.pessoa_social_profiles
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = pessoa_social_profiles.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "linked users can insert own arquivos historicos" on public.arquivos_historicos;
create policy "linked users can insert own arquivos historicos"
on public.arquivos_historicos
for insert
to authenticated
with check (
  relacionamento_id is null
  and (
    exists (
      select 1
      from public.user_person_links upl
      where upl.pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

drop policy if exists "linked users can update own arquivos historicos" on public.arquivos_historicos;
create policy "linked users can update own arquivos historicos"
on public.arquivos_historicos
for update
to authenticated
using (
  relacionamento_id is null
  and (
    exists (
      select 1
      from public.user_person_links upl
      where upl.pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
)
with check (
  relacionamento_id is null
  and (
    exists (
      select 1
      from public.user_person_links upl
      where upl.pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

drop policy if exists "linked users can delete own arquivos historicos" on public.arquivos_historicos;
create policy "linked users can delete own arquivos historicos"
on public.arquivos_historicos
for delete
to authenticated
using (
  relacionamento_id is null
  and (
    exists (
      select 1
      from public.user_person_links upl
      where upl.pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = arquivos_historicos.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

drop policy if exists "linked users can insert own person events" on public.person_events;
create policy "linked users can insert own person events"
on public.person_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "linked users can update own person events" on public.person_events;
create policy "linked users can update own person events"
on public.person_events
for update
to authenticated
using (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
)
with check (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

drop policy if exists "linked users can delete own person events" on public.person_events;
create policy "linked users can delete own person events"
on public.person_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.user_person_links upl
    where upl.pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.person_responsible_links prl
    join public.user_person_links upl
      on upl.pessoa_id = prl.responsible_pessoa_id
    where prl.managed_pessoa_id = person_events.pessoa_id
      and upl.user_id = auth.uid()
      and coalesce(upl.can_edit, true) = true
  )
);

notify pgrst, 'reload schema';
