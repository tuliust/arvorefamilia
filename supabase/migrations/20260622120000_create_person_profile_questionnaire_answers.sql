create table if not exists public.person_profile_questionnaire_answers (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tone text,
  selected_badges jsonb not null default '[]'::jsonb,
  custom_traits text,
  generated_questions jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  memorial_mode boolean not null default false,
  last_generated_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_profile_questionnaire_answers_unique_person_user
    unique (pessoa_id, user_id),
  constraint person_profile_questionnaire_answers_tone_check
    check (
      tone is null
      or tone in (
        'afetivo',
        'simples',
        'divertido',
        'elegante',
        'nostalgico',
        'inspirador',
        'familiar',
        'emocional',
        'leve',
        'formal'
      )
    ),
  constraint person_profile_questionnaire_answers_selected_badges_array
    check (jsonb_typeof(selected_badges) = 'array'),
  constraint person_profile_questionnaire_answers_generated_questions_array
    check (jsonb_typeof(generated_questions) = 'array'),
  constraint person_profile_questionnaire_answers_answers_object
    check (jsonb_typeof(answers) = 'object')
);

create index if not exists idx_person_profile_questionnaire_answers_pessoa_id
on public.person_profile_questionnaire_answers(pessoa_id);

create index if not exists idx_person_profile_questionnaire_answers_user_id
on public.person_profile_questionnaire_answers(user_id);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_person_profile_questionnaire_answers_updated_at
on public.person_profile_questionnaire_answers;

create trigger update_person_profile_questionnaire_answers_updated_at
before update on public.person_profile_questionnaire_answers
for each row
execute function public.update_updated_at_column();

alter table public.person_profile_questionnaire_answers enable row level security;

drop policy if exists "users can read own profile questionnaire answers"
on public.person_profile_questionnaire_answers;

create policy "users can read own profile questionnaire answers"
on public.person_profile_questionnaire_answers
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
      and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
      and coalesce(upl.can_edit, true) = true
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
  and exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
      and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
      and coalesce(upl.can_edit, true) = true
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
  and exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
      and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
      and coalesce(upl.can_edit, true) = true
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
      and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
      and coalesce(upl.can_edit, true) = true
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
  and exists (
    select 1
    from public.user_person_links upl
    where upl.user_id = auth.uid()
      and upl.pessoa_id = person_profile_questionnaire_answers.pessoa_id
      and coalesce(upl.can_edit, true) = true
  )
);
