create table if not exists public.family_memory_wall_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null,
  visibility text not null default 'family',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint family_memory_wall_posts_body_length
    check (char_length(trim(body)) between 1 and 1200),
  constraint family_memory_wall_posts_author_length
    check (char_length(trim(author_name)) between 1 and 120),
  constraint family_memory_wall_posts_visibility_check
    check (visibility in ('family', 'close_relatives', 'private')),
  constraint family_memory_wall_posts_status_check
    check (status in ('published', 'hidden'))
);

create index if not exists idx_family_memory_wall_posts_created_at
  on public.family_memory_wall_posts (created_at desc);

create index if not exists idx_family_memory_wall_posts_user_id
  on public.family_memory_wall_posts (user_id);

create index if not exists idx_family_memory_wall_posts_status_visibility
  on public.family_memory_wall_posts (status, visibility);

drop trigger if exists update_family_memory_wall_posts_updated_at on public.family_memory_wall_posts;

create trigger update_family_memory_wall_posts_updated_at
before update on public.family_memory_wall_posts
for each row
execute function public.update_updated_at_column();

alter table public.family_memory_wall_posts enable row level security;

drop policy if exists "authenticated users can read memory wall posts" on public.family_memory_wall_posts;
drop policy if exists "users can insert own memory wall posts" on public.family_memory_wall_posts;
drop policy if exists "authors or admins can update memory wall posts" on public.family_memory_wall_posts;
drop policy if exists "authors or admins can delete memory wall posts" on public.family_memory_wall_posts;

create policy "authenticated users can read memory wall posts"
on public.family_memory_wall_posts
for select
to authenticated
using (
  status = 'published'
  and (
    visibility <> 'private'
    or user_id = auth.uid()
    or public.is_admin_user(auth.uid())
  )
);

create policy "users can insert own memory wall posts"
on public.family_memory_wall_posts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'published'
);

create policy "authors or admins can update memory wall posts"
on public.family_memory_wall_posts
for update
to authenticated
using (user_id = auth.uid() or public.is_admin_user(auth.uid()))
with check (user_id = auth.uid() or public.is_admin_user(auth.uid()));

create policy "authors or admins can delete memory wall posts"
on public.family_memory_wall_posts
for delete
to authenticated
using (user_id = auth.uid() or public.is_admin_user(auth.uid()));
