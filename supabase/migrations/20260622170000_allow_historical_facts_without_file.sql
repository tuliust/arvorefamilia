-- Permite registrar fatos e memórias históricas sem arquivo anexado.
-- A tabela continua sendo a fonte única para fatos com ou sem imagem/PDF.

alter table if exists public.arquivos_historicos
  alter column url drop not null,
  alter column storage_bucket drop not null,
  alter column storage_path drop not null,
  alter column mime_type drop not null;

comment on column public.arquivos_historicos.url is
  'URL pública do arquivo anexado. Pode ser nula quando o registro representa apenas um fato ou memória histórica.';

comment on column public.arquivos_historicos.storage_path is
  'Caminho no Storage. Pode ser nulo quando não há arquivo anexado.';
