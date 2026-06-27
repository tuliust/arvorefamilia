-- Vínculos pessoa-a-pessoa para responsáveis por perfis legados/crianças.
-- Diferente de user_person_links, esta tabela não depende de auth.users.

create table if not exists public.person_responsible_links (
  id uuid primary key default gen_random_uuid(),
  managed_pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  responsible_pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  responsibility_role text not null default 'Responsável',
  notes text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint person_responsible_links_unique unique (managed_pessoa_id, responsible_pessoa_id),
  constraint person_responsible_links_not_self check (managed_pessoa_id <> responsible_pessoa_id)
);

create index if not exists idx_person_responsible_links_managed
on public.person_responsible_links (managed_pessoa_id);

create index if not exists idx_person_responsible_links_responsible
on public.person_responsible_links (responsible_pessoa_id);

alter table public.person_responsible_links enable row level security;

drop policy if exists "admins can read person responsible links" on public.person_responsible_links;
create policy "admins can read person responsible links"
on public.person_responsible_links
for select to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "admins can insert person responsible links" on public.person_responsible_links;
create policy "admins can insert person responsible links"
on public.person_responsible_links
for insert to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can update person responsible links" on public.person_responsible_links;
create policy "admins can update person responsible links"
on public.person_responsible_links
for update to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "admins can delete person responsible links" on public.person_responsible_links;
create policy "admins can delete person responsible links"
on public.person_responsible_links
for delete to authenticated
using (public.is_admin_user(auth.uid()));

drop trigger if exists update_person_responsible_links_updated_at on public.person_responsible_links;
create trigger update_person_responsible_links_updated_at
before update on public.person_responsible_links
for each row
execute function public.update_updated_at_column();

notify pgrst, 'reload schema';
