# Fatos e Arquivos Históricos

> Última revisão: 2026-06-22  
> Escopo: `/arquivos-historicos`, `ArquivosHistoricos`, `arquivosHistoricosService` e timeline do perfil após Prompt 7C.

## Objetivo

Permitir que o usuário registre fatos, memórias, documentos e imagens ligados à história da pessoa ou de um relacionamento.

## Tipos de registro

| Tipo funcional | Arquivo obrigatório? | Exemplo |
|---|---:|---|
| Fato sem arquivo | Não | Mudança de cidade, chegada ao Brasil, lembrança familiar. |
| Imagem | Sim | Foto antiga, certidão fotografada. |
| PDF | Sim | Certidão digitalizada, documento histórico. |

## Fonte de dados

Tabela:

```text
arquivos_historicos
```

A tabela suporta registros ligados a:

- `pessoa_id`;
- `relacionamento_id`.

## Migration necessária

```text
supabase/migrations/20260622170000_allow_historical_facts_without_file.sql
```

Campos que podem ser nulos:

- `url`;
- `storage_bucket`;
- `storage_path`;
- `mime_type`.

## Regra para distinguir fato de arquivo

```text
url vazia/nula = fato sem arquivo
url preenchida = arquivo histórico
```

## Campos principais

- `titulo`;
- `descricao`;
- `ano`;
- `categoria_evento`;
- `participante_ids` quando disponível;
- `tipo` (`imagem` ou `pdf` para compatibilidade visual);
- campos de storage quando houver arquivo.

## Upload

Upload é opcional.

Se houver upload:

- JPG/PNG/WebP/PDF são aceitos;
- arquivo vai para bucket `historical-files`;
- `url`, `storage_bucket`, `storage_path` e `mime_type` são preenchidos.

Se não houver upload:

- registro continua válido;
- não deve aparecer ação de download/abrir arquivo.

## Timeline do perfil

Registros aparecem em `/pessoa/:id` na timeline lateral.

- Fato sem arquivo: badge `Fato`.
- Arquivo com anexo: badge `Arquivo`.
- Com ano: ordenação cronológica.
- Sem ano: final da timeline.

## Revisão de dados

Em `/revisao-dados`, exibir:

- `Fato sem arquivo`;
- `Imagem`;
- `PDF`.

## Não regressão

- Não exigir upload.
- Não descartar fato sem arquivo.
- Não expor storage path ou URL na timeline.
- Não criar tabela nova sem decisão arquitetural.
- Não tratar essa frente como pendência: ela está implementada no Prompt 7C.

## QA

1. Criar fato sem arquivo.
2. Criar imagem.
3. Criar PDF.
4. Salvar e recarregar.
5. Conferir revisão.
6. Conferir perfil e timeline.
7. Conferir ordenação por ano.
8. Conferir registro sem ano no final.
