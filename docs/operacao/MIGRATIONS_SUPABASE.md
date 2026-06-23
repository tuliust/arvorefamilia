# Migrations Supabase

> Última revisão: 2026-06-23

## Regra geral

O estado implementado só deve ser considerado válido no ambiente em que as migrations correspondentes foram aplicadas.

Sempre validar migrations no ambiente remoto, não apenas localmente.

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

### `20260623...get_person_profile_selected_badges.sql` ou equivalente

Expõe de forma controlada os badges selecionados no questionário de perfil.

Função esperada:

```text
get_person_profile_selected_badges(target_pessoa_id uuid)
```

Uso:

- `/curiosidades`;
- rankings de `Perfil dos familiares`;
- comparação de interesses;
- perfil público quando exibir características agrupadas.

Requisitos:

- não expor respostas completas do questionário quando a tela só precisa de badges;
- respeitar RLS/escopo de pessoa acessível;
- retornar apenas dados mínimos:
  - `id`;
  - `label`;
  - `category`.

### `admin_reset_person_profile` — versão atualizada

A RPC de reset administrativo deve limpar profundamente dados de perfil.

Escopo esperado:

- campos editáveis de `pessoas`;
- avatar/foto;
- mini bio;
- curiosidades;
- telefone/endereço/redes legacy;
- localização atual quando aplicável;
- `person_insights`;
- favoritos relacionados;
- arquivos históricos;
- eventos pessoais;
- redes sociais versionadas;
- respostas do questionário;
- logs de atividade relacionados;
- vínculos usuário-pessoa quando aplicável;
- preferências de notificação relacionadas;
- usuários auth elegíveis, quando a regra administrativa permitir.

A função deve retornar contadores por tipo de item removido/alterado.

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

### Verificar nulabilidade de fatos/arquivos

```sql
select column_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'arquivos_historicos'
  and column_name in ('url', 'storage_bucket', 'storage_path', 'mime_type')
order by column_name;
```

Resultado esperado:

```text
YES para url, storage_bucket, storage_path, mime_type
```

### Verificar tabela de questionário

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'person_profile_questionnaire_answers';
```

### Verificar função de badges

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'get_person_profile_selected_badges';
```

### Verificar função de reset

```sql
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'admin_reset_person_profile';
```

### Testar retorno mínimo de badges

```sql
select *
from public.get_person_profile_selected_badges('<pessoa_id_de_teste>'::uuid);
```

Validar que o retorno não inclui:

- respostas abertas;
- custom traits;
- hash;
- user_id;
- dados sensíveis.

## RLS

### Questionário IA

Usuário deve poder:

- ler respostas da própria pessoa vinculada;
- inserir/atualizar respostas da própria pessoa vinculada com permissão de edição.

### Badges para curiosidades/perfil

Usuário autenticado deve poder ler somente os badges necessários para a experiência autorizada.

A consulta deve evitar expor:

- respostas completas;
- dados de outro usuário sem permissão;
- dados sensíveis.

### Arquivos históricos

Usuário deve poder:

- listar fatos/arquivos da própria pessoa vinculada;
- salvar/substituir registros no fluxo de onboarding;
- não acessar dados privados de terceiros sem permissão.

### Reset administrativo

Somente admin deve conseguir executar reset profundo.

Não usar service role no frontend.

## Ordem operacional

1. Aplicar migrations.
2. Validar nulabilidade de `arquivos_historicos`.
3. Validar existência de `person_profile_questionnaire_answers`.
4. Validar RPC de badges.
5. Validar RPC de reset.
6. Rodar build.
7. Testar `/meus-dados`.
8. Testar `/curiosidades`.
9. Testar `/arquivos-historicos` com fato sem arquivo.
10. Testar timeline em `/pessoa/:id`.
11. Testar `/revisao-dados`.

## Não regressão

- Não criar migration para voltar `url` para not null.
- Não criar tabela paralela de fatos sem decisão arquitetural.
- Não remover RLS.
- Não usar service role no frontend.
- Não expor respostas completas do questionário quando só badges são necessários.
- Não permitir reset administrativo por usuário comum.
