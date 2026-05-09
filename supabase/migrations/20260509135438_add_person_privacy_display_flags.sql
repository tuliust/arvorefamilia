alter table public.pessoas
add column if not exists permitir_exibir_data_nascimento boolean not null default true;

alter table public.pessoas
add column if not exists permitir_exibir_endereco boolean not null default false;

alter table public.pessoas
add column if not exists permitir_exibir_rede_social boolean not null default false;

alter table public.pessoas
add column if not exists permitir_exibir_telefone boolean not null default false;
