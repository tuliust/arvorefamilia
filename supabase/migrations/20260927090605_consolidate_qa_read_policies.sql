-- Consolida policies de leitura pública das FAQs sem alterar o modelo de acesso.
-- Mantém leitura pública apenas de categorias ativas e itens publicados em categorias ativas.
-- Admins continuam com leitura total e escrita exclusiva.
-- Usa (select auth.uid()) para evitar reavaliação por linha nos checks administrativos.

drop policy if exists "admins can manage qa categories" on public.qa_categories;
drop policy if exists "public can read active qa categories" on public.qa_categories;
drop policy if exists "qa_categories_public_read_active" on public.qa_categories;

create policy "qa categories public read active or admin"
on public.qa_categories
for select
to anon, authenticated
using (
  is_active = true
  or public.is_admin_user((select auth.uid()))
);

create policy "qa categories admin insert"
on public.qa_categories
for insert
to authenticated
with check (public.is_admin_user((select auth.uid())));

create policy "qa categories admin update"
on public.qa_categories
for update
to authenticated
using (public.is_admin_user((select auth.uid())))
with check (public.is_admin_user((select auth.uid())));

create policy "qa categories admin delete"
on public.qa_categories
for delete
to authenticated
using (public.is_admin_user((select auth.uid())));

drop policy if exists "admins can manage qa items" on public.qa_items;
drop policy if exists "public can read published qa items" on public.qa_items;
drop policy if exists "qa_items_public_read_published" on public.qa_items;

create policy "qa items public read published active category or admin"
on public.qa_items
for select
to anon, authenticated
using (
  (
    status = 'published'
    and exists (
      select 1
      from public.qa_categories c
      where c.id = qa_items.category_id
        and c.is_active = true
    )
  )
  or public.is_admin_user((select auth.uid()))
);

create policy "qa items admin insert"
on public.qa_items
for insert
to authenticated
with check (public.is_admin_user((select auth.uid())));

create policy "qa items admin update"
on public.qa_items
for update
to authenticated
using (public.is_admin_user((select auth.uid())))
with check (public.is_admin_user((select auth.uid())));

create policy "qa items admin delete"
on public.qa_items
for delete
to authenticated
using (public.is_admin_user((select auth.uid())));
