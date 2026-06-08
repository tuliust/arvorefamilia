create table if not exists public.person_profile_suggestions (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  requester_pessoa_id uuid references public.pessoas(id) on delete set null,
  target_pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  suggestion_text text not null,
  status text not null default 'pending',
  admin_reviewed_by uuid references auth.users(id) on delete set null,
  admin_reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_profile_suggestions_status_check
    check (status in ('pending', 'reviewed', 'dismissed'))
);

create index if not exists idx_person_profile_suggestions_status_created_at
on public.person_profile_suggestions(status, created_at desc);

create index if not exists idx_person_profile_suggestions_target
on public.person_profile_suggestions(target_pessoa_id);

alter table public.person_profile_suggestions enable row level security;

drop policy if exists "users can insert own person profile suggestions"
on public.person_profile_suggestions;

create policy "users can insert own person profile suggestions"
on public.person_profile_suggestions
for insert
to authenticated
with check (auth.uid() = requester_user_id);

drop policy if exists "users can read own person profile suggestions"
on public.person_profile_suggestions;

create policy "users can read own person profile suggestions"
on public.person_profile_suggestions
for select
to authenticated
using (auth.uid() = requester_user_id or public.is_admin_user(auth.uid()));

drop policy if exists "admins can update person profile suggestions"
on public.person_profile_suggestions;

create policy "admins can update person profile suggestions"
on public.person_profile_suggestions
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop trigger if exists update_person_profile_suggestions_updated_at
on public.person_profile_suggestions;

create trigger update_person_profile_suggestions_updated_at
before update on public.person_profile_suggestions
for each row
execute function public.update_updated_at_column();
