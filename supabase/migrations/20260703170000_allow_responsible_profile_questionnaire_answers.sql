drop policy if exists "users can read own profile questionnaire answers"
on public.person_profile_questionnaire_answers;

create policy "users can read own profile questionnaire answers"
on public.person_profile_questionnaire_answers
for select
to authenticated
using (
  user_id = auth.uid()
  and (
    public.is_admin_user(auth.uid())
    or exists (
      select 1
      from public.user_person_links upl
      where upl.user_id = auth.uid()
        and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and coalesce(upl.can_edit, true) = true
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

drop policy if exists "users can insert own profile questionnaire answers"
on public.person_profile_questionnaire_answers;

create policy "users can insert own profile questionnaire answers"
on public.person_profile_questionnaire_answers
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    public.is_admin_user(auth.uid())
    or exists (
      select 1
      from public.user_person_links upl
      where upl.user_id = auth.uid()
        and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and coalesce(upl.can_edit, true) = true
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

drop policy if exists "users can update own profile questionnaire answers"
on public.person_profile_questionnaire_answers;

create policy "users can update own profile questionnaire answers"
on public.person_profile_questionnaire_answers
for update
to authenticated
using (
  user_id = auth.uid()
  and (
    public.is_admin_user(auth.uid())
    or exists (
      select 1
      from public.user_person_links upl
      where upl.user_id = auth.uid()
        and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and coalesce(upl.can_edit, true) = true
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    public.is_admin_user(auth.uid())
    or exists (
      select 1
      from public.user_person_links upl
      where upl.user_id = auth.uid()
        and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and coalesce(upl.can_edit, true) = true
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

drop policy if exists "users can delete own profile questionnaire answers"
on public.person_profile_questionnaire_answers;

create policy "users can delete own profile questionnaire answers"
on public.person_profile_questionnaire_answers
for delete
to authenticated
using (
  user_id = auth.uid()
  and (
    public.is_admin_user(auth.uid())
    or exists (
      select 1
      from public.user_person_links upl
      where upl.user_id = auth.uid()
        and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and coalesce(upl.can_edit, true) = true
    )
    or exists (
      select 1
      from public.person_responsible_links prl
      join public.user_person_links upl
        on upl.pessoa_id = prl.responsible_pessoa_id
      where prl.managed_pessoa_id = person_profile_questionnaire_answers.pessoa_id
        and upl.user_id = auth.uid()
        and coalesce(upl.can_edit, true) = true
    )
  )
);

notify pgrst, 'reload schema';