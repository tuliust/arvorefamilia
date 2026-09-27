# Migrations Supabase

> Última revisão: 2026-09-27
> Escopo: fontes SQL, RLS, RPCs, Edge Functions e orientação de validação do Supabase na branch `main`.
> Status: canônico.

## Estado versionado

A branch atual possui diretório versionado `supabase/migrations`. As fontes SQL versionadas e citadas na documentação são:

- `supabase/migrations/20260422_create_core_family_schema.sql`, schema base de pessoas, relacionamentos e estruturas familiares centrais;
- `supabase/migrations/20260622143000_deepen_admin_reset_and_profile_badges.sql`, que cria a RPC `get_person_profile_selected_badges(uuid)` e ajustes correlatos de perfil/admin;
- `supabase/migrations/20260627143000_create_person_responsible_links.sql`, que cria vínculos pessoa-a-pessoa de responsáveis por perfis legados ou crianças;
- `supabase/migrations/20260627152000_allow_responsible_people_perspective.sql`, que permite a perspectiva de pessoas sob responsabilidade quando aplicável;
- `supabase/migrations/20260701090000_allow_member_link_status_lookup.sql`, que cria a função `current_user_has_person_link()` e policy de leitura para resolver badges `Cadastrado`/`Pré-cadastrado` em `/meus-vinculos`;
- `supabase/migrations/20260701120000_persist_admin_notification_config_and_first_map_access.sql`;
- `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql`;
- `supabase/migrations/20260701170000_add_variable_settings_to_admin_notification_config.sql`;
- `supabase/migrations/20260703120000_fix_admin_reset_profile_storage_api_block.sql`, quando presente no repositório/ambiente;
- `supabase/migrations/20260703170000_allow_responsible_profile_questionnaire_answers.sql`, quando presente no repositório/ambiente;
- `supabase/migrations/20260927081540_make_historical_files_private.sql`, que torna `historical-files` privado após validação de signed URL/download autenticado;
- `supabase/migrations/20260927090605_consolidate_qa_read_policies.sql`, que consolida leitura pública/admin de `qa_categories` e `qa_items` e reduz policies permissivas redundantes;
- `supabase/forum-schema.sql`;
- `supabase/google-calendar-schema.sql`;
- `supabase/config.toml`;
- textos SQL legados em `src/imports/pasted_text/*`, documentados apenas como histórico/importação.

## Regras

- Não aplicar SQL diretamente sem revisão.
- Não copiar SQL legado para produção sem adaptar ao estado atual do banco.
- Sempre validar RLS depois de criar ou alterar tabela.
- Manter migrations numeradas em `supabase/migrations` quando houver alteração de schema, RLS, policy, view ou RPC.
- Timestamps de migrations devem ser únicos.
- Arquivos SQL devem permanecer em UTF-8 sem BOM.
- Status conjugal permanece inferido pelos campos existentes; não criar migration de `status_conjugal` sem decisão explícita de schema.
- Vínculos de responsáveis pessoa-a-pessoa devem usar `person_responsible_links`.
- Catálogo administrativo de notificações deve usar `admin_notification_catalogs`.
- Configurações por variável de notificação devem usar `admin_notification_configurations.variable_settings` em JSONB.
- Edge Functions não substituem migrations. Alterações em `supabase/functions/*` exigem deploy de função, não `db push`.

## Tabelas e domínios esperados pela aplicação

A documentação funcional depende de tabelas ou estruturas equivalentes para:

- pessoas;
- relacionamentos;
- vínculos entre usuário e pessoa;
- vínculos de responsáveis por perfis legados ou crianças;
- solicitações de alteração de vínculos;
- respostas/questionário de perfil;
- fatos e arquivos históricos;
- insights de pessoa;
- favoritos;
- notificações e preferências;
- configurações administrativas de notificações;
- catálogo administrativo de notificações;
- regras administrativas de variáveis de notificação;
- primeiro acesso ao mapa familiar;
- fórum;
- logs de atividade;
- permissões administrativas;
- configurações públicas de site e auditoria de `/admin/home`.

## Insights de pessoa

A tabela/domínio `person_generated_insights` é usado por:

```txt
src/app/services/personInsightsService.ts
src/app/pages/admin/AdminPeopleContentSettings.tsx
supabase/functions/generate-person-insights/index.ts
```

Tipos esperados:

```txt
astrology
historical_events
```

Contrato de `conteudo`:

### `astrology`

```json
{
  "title": "O que diz a astrologia",
  "body": "texto em um parágrafo",
  "sign": "Signo"
}
```

### `historical_events`

```json
{
  "title": "DD/MM/AAAA — principal acontecimento do dia",
  "main_event": "parágrafo sobre o principal acontecimento",
  "period_title": "O que estava acontecendo na época",
  "brazil": {
    "title": "Brasil",
    "body": ["parágrafo 1", "parágrafo 2 opcional"]
  },
  "world": {
    "title": "Mundo",
    "body": ["parágrafo 1", "parágrafo 2 opcional"]
  }
}
```

Regras:

- `period_title`, `brazil` e `world` devem ser preservados no admin.
- `brazil.body` e `world.body` devem ser arrays de parágrafos.
- Respostas em português com chaves `brasil`/`mundo` podem ser normalizadas pela Edge Function, mas o formato salvo deve ser `brazil`/`world`.
- Conteúdo salvo manualmente pelo admin usa `modelo = manual` e `prompt_version = admin-manual-v1`.
- Conteúdo gerado pela função deve usar `modelo = gpt-4o-mini`.
- Fatos históricos gerados pela versão atual usam `prompt_version = v2-contexto-brasil-mundo`.

## Edge Function `generate-person-insights`

Local:

```txt
supabase/functions/generate-person-insights/index.ts
```

Função:

- recebe `pessoaId` e `force`;
- busca pessoa em `pessoas`;
- exige data completa em `DD/MM/AAAA` ou `YYYY-MM-DD`;
- gera astrologia e fatos históricos;
- se `force = false`, preserva conteúdo existente;
- se `force = true`, regenera;
- chama OpenAI via `OPENAI_API_KEY`;
- normaliza JSON histórico;
- faz reparo automático quando Brasil/Mundo vierem incompletos;
- grava em `person_generated_insights` com conflito em `pessoa_id,tipo`.

Deploy:

```bash
supabase functions deploy generate-person-insights
```

PowerShell:

```powershell
supabase functions deploy generate-person-insights
```

Validações:

1. Confirmar que o comando apontou para o projeto Supabase correto.
2. Confirmar no dashboard a função publicada.
3. Confirmar variável `OPENAI_API_KEY`.
4. Testar em `/admin/gestao-conteudo-pessoas`.
5. Confirmar persistência de `period_title`, `brazil`, `world`.

## Vínculos de usuário e status de badges

| Elemento | Uso |
|---|---|
| `user_person_links` | Vínculo real entre `auth.users.id` e `pessoas.id`. |
| `current_user_has_person_link()` | Função `security definer` que verifica se o usuário autenticado tem ao menos um vínculo. |
| Policy `members can read linked person ids for status badges` | Permite leitura necessária para resolver status de cadastro em `/meus-vinculos`. |

Revisão de segurança recomendada: em etapa futura, substituir a policy ampla por RPC que receba lista de `pessoa_id` e retorne somente IDs vinculados.

## Tabelas de notificações administrativas

| Tabela | Uso |
|---|---|
| `notificacoes_usuario` | Notificações reais entregues aos usuários. |
| `preferencias_notificacao` | Preferências individuais por tipo/canal. |
| `admin_notification_configurations` | Overrides, configurações da tela administrativa e `variable_settings`. |
| `admin_notification_catalogs` | Snapshot editável do catálogo completo. |
| `user_first_map_accesses` | Deduplicação do primeiro acesso real a `/mapa-familiar`. |

### Coluna `variable_settings`

Contrato:

- tipo `jsonb`;
- `not null`;
- default `'{}'::jsonb`;
- usada para guardar origem, valor, fallback, link e formato de data por variável/template;
- não substitui `variable_overrides`.

Validação SQL sugerida:

```sql
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'admin_notification_configurations'
  and column_name = 'variable_settings';
```

## Storage e arquivos históricos

O bucket `historical-files` é necessário para PDFs/imagens históricos e está **privado** no ambiente remoto desde a migration `20260927081540_make_historical_files_private`.

Validações:

- arquivo histórico com upload deve ter `url`, `storage_bucket`, `storage_path`, `mime_type`;
- registro sem arquivo não deve gerar `storage_path`;
- PDF precisa ser legível pelo frontend via URL compatível com `fetch`;
- preview em modal depende de leitura do arquivo pelo navegador;
- se a leitura falhar por CORS, revisar bucket/policy/header;
- não remover arquivos ainda referenciados em `arquivos_historicos.storage_path`.

## Checklist operacional

1. Confirmar URL e anon key do Supabase.
2. Confirmar tabelas exigidas pelos serviços em `src/app/services`.
3. Confirmar políticas RLS para leitura e escrita.
4. Confirmar buckets e paths usados por arquivos históricos.
5. Confirmar que dados sensíveis não são expostos em views públicas.
6. Confirmar RPC `get_person_profile_selected_badges(uuid)` ou fallback da aplicação.
7. Confirmar RPCs de `/admin/home` quando configuração pública ou auditoria visual estiverem em validação.
8. Confirmar `current_user_has_person_link()` e a policy de leitura de status de vínculos.
9. Quando houver mudanças em notificações administrativas, confirmar tabelas e `variable_settings`.
10. Rodar `npx supabase db push` antes do build quando houver migration nova.
11. Rodar `supabase functions deploy <nome>` quando houver mudança em Edge Function.
12. Rodar a aplicação e validar as rotas documentadas em `QA_MANUAL.md`.


## Advisors pós-QA — 2026-09-27

Após a consolidação seletiva das policies de FAQ:

- `auth_rls_initplan`: 109 ocorrências (antes 113);
- `multiple_permissive_policies`: 24 grupos (antes 28);
- `unindexed_foreign_keys`: 23;
- `unused_index`: 48, apenas informativo e sem remoção em massa;
- `SECURITY DEFINER`: 1 função acessível a `anon` e 25 a `authenticated`, exigindo revisão individual;
- proteção contra senhas vazadas continua desabilitada no Auth;
- não há mais warning de índice duplicado.

Regra: tratar os advisors por domínio/uso real, com migration pequena e validação após cada alteração. Não consolidar policies ou remover índices em massa apenas para zerar o linter.
