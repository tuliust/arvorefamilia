alter table public.pessoas
add column if not exists profissao text;

comment on column public.pessoas.profissao is 'Profissão ou ocupação principal da pessoa exibida/editável no perfil familiar.';

create index if not exists idx_pessoas_profissao
on public.pessoas (profissao)
where profissao is not null and btrim(profissao) <> '';
