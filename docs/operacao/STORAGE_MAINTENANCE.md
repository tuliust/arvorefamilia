# Storage Maintenance

> Última revisão: 2026-06-22

## Buckets

| Bucket | Uso |
|---|---|
| `person-avatars` | Avatares das pessoas. |
| `historical-files` | Imagens/PDFs históricos. |
| `site-media` | Mídias institucionais do site. |

## Fatos sem arquivo

Fatos sem arquivo não usam Storage.

Portanto:

- não exigem bucket;
- não geram `storage_path`;
- não têm `url` pública;
- não devem ser tratados como upload pendente.

## Arquivos históricos com upload

Quando há upload:

- salvar arquivo no bucket `historical-files`;
- preencher `url`, `storage_bucket`, `storage_path`, `mime_type`;
- permitir abrir/download quando aplicável.

## Limpeza de órfãos

Possíveis órfãos:

- upload concluído, mas registro não salvo;
- registro removido sem remover arquivo;
- substituição de arquivo sem limpeza antiga.

A limpeza deve ser cautelosa e preferencialmente administrativa.

## Não remover

- arquivos ainda referenciados em `arquivos_historicos.storage_path`;
- avatares referenciados em `pessoas.foto_principal_url`;
- mídias do site em uso.

## QA Storage

1. Upload de avatar.
2. Upload de imagem histórica.
3. Upload de PDF histórico.
4. Registro histórico sem upload.
5. Remoção/edição de registro.
6. Link público de arquivo.
7. Falha amigável se bucket ausente.
