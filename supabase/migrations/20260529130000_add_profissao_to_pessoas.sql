alter table public.pessoas add column if not exists profissao text;

comment on column public.pessoas.profissao is 'Profissao ou ocupacao principal da pessoa exibida/editavel no perfil familiar.';

create index if not exists idx_pessoas_profissao on public.pessoas (profissao) where profissao is not null and btrim(profissao) <> '';
