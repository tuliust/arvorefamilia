alter table public.arquivos_historicos
  add column if not exists categoria_evento text null;

alter table public.arquivos_historicos
  drop constraint if exists arquivos_historicos_categoria_evento_check;

alter table public.arquivos_historicos
  add constraint arquivos_historicos_categoria_evento_check
  check (
    categoria_evento is null
    or categoria_evento in (
      'certidao_nascimento',
      'certidao_casamento',
      'alistamento_militar',
      'imigracao',
      'divorcio',
      'carreira_profissional',
      'mudanca_cidade',
      'certidao_obito',
      'outro'
    )
  );
