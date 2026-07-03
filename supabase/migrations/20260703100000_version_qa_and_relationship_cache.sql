-- Versiona tabelas que ja existiam no ambiente remoto, mas ainda nao
-- estavam representadas nas migrations do repositorio.

create extension if not exists "pgcrypto";

create table if not exists public.qa_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_title text,
  slug text not null unique,
  description text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qa_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.qa_categories(id) on delete cascade,
  question text not null,
  answer text not null,
  slug text not null unique,
  keywords text[] not null default '{}'::text[],
  related_page_label text,
  related_page_path text,
  is_featured boolean not null default false,
  status text not null default 'draft',
  order_index integer not null default 0,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qa_items_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.parentescos_calculados (
  id uuid primary key default gen_random_uuid(),
  origem_pessoa_id uuid references public.pessoas(id) on delete cascade,
  destino_pessoa_id uuid references public.pessoas(id) on delete cascade,
  tipo_parentesco text,
  grau integer,
  linha text,
  lado text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parentescos_calculados_pessoas_diferentes_check
    check (origem_pessoa_id is null or destino_pessoa_id is null or origem_pessoa_id <> destino_pessoa_id)
);

alter table public.parentescos_calculados
  add column if not exists origem_pessoa_id uuid references public.pessoas(id) on delete cascade,
  add column if not exists destino_pessoa_id uuid references public.pessoas(id) on delete cascade,
  add column if not exists tipo_parentesco text,
  add column if not exists grau integer,
  add column if not exists linha text,
  add column if not exists lado text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'parentescos_calculados_pessoas_diferentes_check'
      and conrelid = 'public.parentescos_calculados'::regclass
  ) then
    alter table public.parentescos_calculados
      add constraint parentescos_calculados_pessoas_diferentes_check
      check (origem_pessoa_id is null or destino_pessoa_id is null or origem_pessoa_id <> destino_pessoa_id);
  end if;
end $$;

alter table public.qa_categories
  add column if not exists short_title text,
  add column if not exists description text,
  add column if not exists order_index integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.qa_items
  add column if not exists keywords text[] not null default '{}'::text[],
  add column if not exists related_page_label text,
  add column if not exists related_page_path text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists status text not null default 'draft',
  add column if not exists order_index integer not null default 0,
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'qa_items_status_check'
      and conrelid = 'public.qa_items'::regclass
  ) then
    alter table public.qa_items
      add constraint qa_items_status_check
      check (status in ('draft', 'published', 'archived'));
  end if;
end $$;

create index if not exists idx_qa_categories_active_order
  on public.qa_categories (is_active, order_index, title);

create index if not exists idx_qa_items_category
  on public.qa_items (category_id);

create index if not exists idx_qa_items_status_order
  on public.qa_items (status, order_index, question);

create index if not exists idx_qa_items_featured
  on public.qa_items (is_featured)
  where is_featured = true;

create index if not exists idx_parentescos_calculados_origem
  on public.parentescos_calculados (origem_pessoa_id);

create index if not exists idx_parentescos_calculados_destino
  on public.parentescos_calculados (destino_pessoa_id);

create index if not exists idx_parentescos_calculados_pair
  on public.parentescos_calculados (origem_pessoa_id, destino_pessoa_id);

drop trigger if exists update_qa_categories_updated_at on public.qa_categories;
create trigger update_qa_categories_updated_at
before update on public.qa_categories
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_qa_items_updated_at on public.qa_items;
create trigger update_qa_items_updated_at
before update on public.qa_items
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_parentescos_calculados_updated_at on public.parentescos_calculados;
create trigger update_parentescos_calculados_updated_at
before update on public.parentescos_calculados
for each row
execute function public.update_updated_at_column();

create or replace function public.clear_parentescos_calculados()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.parentescos_calculados;
$$;

grant execute on function public.clear_parentescos_calculados() to authenticated;

alter table public.qa_categories enable row level security;
alter table public.qa_items enable row level security;
alter table public.parentescos_calculados enable row level security;

drop policy if exists "public can read active qa categories" on public.qa_categories;
create policy "public can read active qa categories"
  on public.qa_categories for select
  to anon, authenticated
  using (is_active = true or public.is_admin_user(auth.uid()));

drop policy if exists "admins can manage qa categories" on public.qa_categories;
create policy "admins can manage qa categories"
  on public.qa_categories for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

drop policy if exists "public can read published qa items" on public.qa_items;
create policy "public can read published qa items"
  on public.qa_items for select
  to anon, authenticated
  using (
    status = 'published'
    or public.is_admin_user(auth.uid())
  );

drop policy if exists "admins can manage qa items" on public.qa_items;
create policy "admins can manage qa items"
  on public.qa_items for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can manage relationship cache" on public.parentescos_calculados;
create policy "admins can manage relationship cache"
  on public.parentescos_calculados for all
  to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

notify pgrst, 'reload schema';
