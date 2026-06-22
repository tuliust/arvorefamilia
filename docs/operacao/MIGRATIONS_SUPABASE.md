# Migrations Supabase

> Última revisão: 2026-06-22

## Regra geral

O estado implementado só deve ser considerado válido no ambiente em que as migrations correspondentes foram aplicadas.

## Migrations relevantes do ciclo

### `20260622120000_create_person_profile_questionnaire_answers.sql`

Cria/padroniza a tabela:

```text
person_profile_questionnaire_answers
```

Uso:

- questionário IA;
- tom;
- badges;
- respostas;
- modo memorial;
- hash de última geração.

Requisitos:

- RLS habilitado;
- usuário só acessa respostas de pessoa vinculada/editável;
- upsert por `pessoa_id` e `user_id`.

### `20260622170000_allow_historical_facts_without_file.sql`

Permite fatos históricos sem arquivo.

Campos alterados em `arquivos_historicos`:

- `url` pode ser nulo;
- `storage_bucket` pode ser nulo;
- `storage_path` pode ser nulo;
- `mime_type` pode ser nulo.

Status: implementado no ciclo 7C.

## `arquivos_historicos` após 7C

Comportamento vigente:

- upload opcional;
- fato sem arquivo válido;
- imagem/PDF continuam válidos;
- timeline consome a tabela.

Não documentar mais como comportamento vigente:

- upload obrigatório;
- `url` obrigatória;
- fatos sem arquivo como pendência.

## Validação SQL sugerida

Verificar nulabilidade:

```sql
select column_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'arquivos_historicos'
  and column_name in ('url', 'storage_bucket', 'storage_path', 'mime_type')
order by column_name;
```

Verificar tabela de questionário:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'person_profile_questionnaire_answers';
```

## RLS

### Questionário IA

Usuário deve poder:

- ler respostas da própria pessoa vinculada;
- inserir/atualizar respostas da própria pessoa vinculada com permissão de edição.

### Arquivos históricos

Usuário deve poder:

- listar fatos/arquivos da própria pessoa vinculada;
- salvar/substituir registros no fluxo de onboarding;
- não acessar dados privados de terceiros sem permissão.

## Ordem operacional

1. Aplicar migrations.
2. Rodar build.
3. Testar `/meus-dados`.
4. Testar `/arquivos-historicos` com fato sem arquivo.
5. Testar timeline em `/pessoa/:id`.
6. Testar `/revisao-dados`.

## Não regressão

- Não criar migration para voltar `url` para not null.
- Não criar tabela paralela de fatos sem decisão arquitetural.
- Não remover RLS.
- Não usar service role no frontend.
