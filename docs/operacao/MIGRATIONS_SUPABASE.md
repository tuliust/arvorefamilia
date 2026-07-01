# Migrations Supabase

> Última revisão: 2026-07-01
> Escopo: fontes SQL e orientação de validação do Supabase na branch `main`.
> Status: canônico.

## Estado versionado

A branch atual possui diretório versionado `supabase/migrations`. As fontes SQL versionadas e citadas na documentação são:

- `supabase/migrations/20260422_create_core_family_schema.sql`, schema base de pessoas, relacionamentos e estruturas familiares centrais;
- `supabase/migrations/20260622143000_deepen_admin_reset_and_profile_badges.sql`, que cria a RPC `get_person_profile_selected_badges(uuid)` e ajustes correlatos de perfil/admin;
- `supabase/migrations/20260627143000_create_person_responsible_links.sql`, que cria vínculos pessoa-a-pessoa de responsáveis por perfis legados ou crianças;
- `supabase/migrations/20260627152000_allow_responsible_people_perspective.sql`, que permite a perspectiva de pessoas sob responsabilidade quando aplicável;
- `supabase/migrations/20260701120000_persist_admin_notification_config_and_first_map_access.sql`, que cria persistência de configuração administrativa de notificações e deduplicação do primeiro acesso a `/mapa-familiar`;
- `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql`, que cria persistência do catálogo administrativo completo de notificações;
- `supabase/migrations/20260701170000_add_variable_settings_to_admin_notification_config.sql`, que adiciona `variable_settings` para origem, link, fallback e formato de variáveis administrativas;
- `supabase/forum-schema.sql`;
- `supabase/google-calendar-schema.sql`;
- `supabase/config.toml`;
- textos SQL legados em `src/imports/pasted_text/*`, documentados apenas como histórico/importação.

## Regras

- Não aplicar SQL diretamente sem revisão.
- Não copiar SQL legado para produção sem adaptar ao estado atual do banco.
- Sempre validar RLS depois de criar ou alterar tabela.
- Manter migrations numeradas em `supabase/migrations` quando houver alteração de schema ou RPC.
- Timestamps de migrations devem ser únicos; versões duplicadas quebram o registro em `supabase_migrations.schema_migrations`.
- Arquivos SQL devem permanecer em UTF-8 sem BOM. Erro de sintaxe no primeiro caractere do arquivo pode indicar BOM invisível antes do SQL.
- Status conjugal permanece inferido pelos campos existentes; não criar migration de `status_conjugal` sem decisão explícita de schema.
- Vínculos de responsáveis pessoa-a-pessoa devem usar `person_responsible_links`, não gravação indevida em `user_person_links.user_id`.
- Catálogo administrativo de notificações deve usar `admin_notification_catalogs`; entregas reais ao usuário permanecem em `notificacoes_usuario`.
- Configurações por variável de notificação devem usar `admin_notification_configurations.variable_settings` em JSONB, sem criar colunas específicas por variável.

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

## Tabelas de notificações administrativas

| Tabela | Uso |
|---|---|
| `notificacoes_usuario` | Notificações reais entregues aos usuários. |
| `preferencias_notificacao` | Preferências individuais por tipo/canal. |
| `admin_notification_configurations` | Overrides, configurações da tela administrativa e `variable_settings`. |
| `admin_notification_catalogs` | Snapshot editável do catálogo completo. |
| `user_first_map_accesses` | Deduplicação do primeiro acesso real a `/mapa-familiar`. |

### Coluna `variable_settings`

A coluna `admin_notification_configurations.variable_settings` deve existir quando a UI de edição de regras de variáveis estiver ativa.

Contrato:

- tipo `jsonb`;
- `not null`;
- default `'{}'::jsonb`;
- usada para guardar origem, valor, fallback, link e formato de data por variável/template;
- não substitui `variable_overrides`, que continua representando a lista de tokens disponíveis por template.

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

Resultado esperado: uma linha `variable_settings`, `jsonb`, `NO` e default `{}`.

## Checklist operacional

1. Confirmar URL e anon key do Supabase.
2. Confirmar tabelas exigidas pelos serviços em `src/app/services`.
3. Confirmar políticas RLS para leitura e escrita.
4. Confirmar buckets e paths usados por arquivos históricos.
5. Confirmar que dados sensíveis não são expostos em views públicas.
6. Confirmar RPC `get_person_profile_selected_badges(uuid)` ou fallback da aplicação.
7. Confirmar RPCs de `/admin/home` quando configuração pública ou auditoria visual estiverem em validação.
8. Quando houver mudanças em notificações administrativas, confirmar `admin_notification_configurations`, `admin_notification_catalogs`, `user_first_map_accesses` e `admin_notification_configurations.variable_settings`.
9. Rodar `npx supabase db push` antes do build quando houver migration nova.
10. Rodar a aplicação e validar as rotas documentadas em `QA_MANUAL.md`.
