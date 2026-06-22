# Fatos e Arquivos Históricos

Última revisão: 2026-06-22

## Objetivo

A funcionalidade registra memórias, fatos e documentos ligados a uma pessoa ou a um relacionamento. Um registro histórico pode existir com ou sem anexo.

## Modelo funcional

| Caso | Como registrar | Como exibir |
|---|---|---|
| Fato sem arquivo | `arquivos_historicos` com `url`, `storage_bucket`, `storage_path` e `mime_type` nulos/vazios | Badge `Fato` ou `Memória`; ícone textual/memória |
| Imagem histórica | `arquivos_historicos` com `tipo = 'imagem'` e URL pública | Badge `Arquivo`; thumbnail de imagem |
| PDF/documento | `arquivos_historicos` com `tipo = 'pdf'` ou `mime_type = 'application/pdf'` | Badge `Arquivo`; ícone de PDF/documento |

## Regras de dados

- Título ou descrição devem existir para salvar um registro.
- Upload é opcional.
- Storage só deve ser chamado quando houver arquivo real.
- `participante_ids` continua opcional e deve ter fallback quando a coluna não existir ou ainda não estiver no cache do Supabase.
- Não armazenar base64 como registro final.
- Não expor URL, storage path, bucket ou base64 na metadata pública da timeline.

## Timeline do perfil

- Todo item salvo em `arquivos_historicos` pode aparecer na timeline do perfil da pessoa.
- Registros com `ano` participam da ordenação cronológica.
- Registros sem `ano` ficam ao final da timeline.
- Fatos sem arquivo não devem ser rotulados como `Arquivo`.
- Arquivos com imagem/PDF permanecem como `Arquivo`.

## Revisão de dados

`/revisao-dados` deve diferenciar visualmente:

- `Fato sem arquivo`;
- `Imagem`;
- `PDF`.

## Migration relacionada

- `20260622170000_allow_historical_facts_without_file.sql` permite que `url`, `storage_bucket`, `storage_path` e `mime_type` sejam nulos em `arquivos_historicos`.
