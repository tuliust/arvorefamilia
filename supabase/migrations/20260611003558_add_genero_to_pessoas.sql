alter table public.pessoas
  add column if not exists genero text;

comment on column public.pessoas.genero is
  'Genero visual opcional usado para orientar avatar fallback: homem, mulher ou pet. Campo nullable; humano_ou_pet segue como campo semantico principal para distinguir pessoa/pet.';

create index if not exists idx_pessoas_genero
  on public.pessoas (genero)
  where genero is not null and btrim(genero) <> '';
