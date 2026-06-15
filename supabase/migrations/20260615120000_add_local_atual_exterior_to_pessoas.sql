alter table public.pessoas
add column if not exists local_atual_exterior boolean not null default false;
