create table if not exists public.forum_topico_pessoas (
  id uuid primary key default gen_random_uuid(),
  topico_id uuid not null references public.forum_topicos(id) on delete cascade,
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint forum_topico_pessoas_unique unique (topico_id, pessoa_id)
);

create index if not exists idx_forum_topico_pessoas_topico_id
on public.forum_topico_pessoas(topico_id);

create index if not exists idx_forum_topico_pessoas_pessoa_id
on public.forum_topico_pessoas(pessoa_id);

alter table public.forum_topico_pessoas enable row level security;

drop policy if exists "Authenticated users can read forum topic people"
on public.forum_topico_pessoas;

create policy "Authenticated users can read forum topic people"
on public.forum_topico_pessoas
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert forum topic people"
on public.forum_topico_pessoas;

create policy "Authenticated users can insert forum topic people"
on public.forum_topico_pessoas
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can delete forum topic people"
on public.forum_topico_pessoas;

create policy "Authenticated users can delete forum topic people"
on public.forum_topico_pessoas
for delete
to authenticated
using (true);
