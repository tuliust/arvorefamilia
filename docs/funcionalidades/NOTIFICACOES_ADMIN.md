# Notificações administrativas

> Última revisão: 2026-07-01
> Escopo: catálogo administrativo de notificações, persistência Supabase, destinatários avançados, primeiro acesso ao mapa e contratos de QA.
> Status: canônico funcional.

## Objetivo

Documentar o contrato vigente da área `/admin/notificacoes` e dos serviços de notificação após a persistência administrativa em Supabase.

Este documento passa a ser a referência canônica para notificações administrativas. O resumo geral de notificações de usuário continua em `FUNCIONALIDADES_COMPLEMENTARES.md`.

## Levantamento das implementações realizadas em 2026-07-01

### Persistência das configurações administrativas

Foi criada a tabela `admin_notification_configurations` para persistir a configuração administrativa da tela de notificações.

Campos principais:

- `config_key`, com valor padrão `default`;
- `frequency_overrides`;
- `theme_overrides`;
- `active_overrides`;
- `content_overrides`;
- `channel_overrides`;
- `recipient_overrides`;
- `variable_overrides`;
- `custom_definitions`;
- auditoria por `created_by`, `updated_by`, `created_at` e `updated_at`.

Arquivo principal:

- `src/app/services/adminNotificationConfigurationService.ts`.

Contrato:

- alterações feitas na aba `Configuração` devem persistir no Supabase;
- o botão `Salvar` deve gravar as configurações e exibir feedback por `toast`;
- erro de persistência deve ser tratado sem quebrar a página;
- o fallback local não deve ser tratado como fonte definitiva quando a tabela persistida estiver disponível.

### Persistência do catálogo completo

Foi criada a tabela `admin_notification_catalogs` para persistir o catálogo inteiro, em JSONB versionado por chave.

Campos principais:

- `catalog_key`, com valor padrão `default`;
- `frequency_options`;
- `theme_options`;
- `recipient_groups`;
- `notification_types`;
- `notification_templates`;
- `automations`;
- `suggestions`;
- `metadata`;
- auditoria por `created_by`, `updated_by`, `created_at` e `updated_at`.

Contrato:

- o catálogo padrão deve ser semeado automaticamente no Supabase na primeira carga administrativa quando ainda não existir registro;
- após semeadura, o catálogo persistido deve ser considerado a fonte editável;
- ao salvar a configuração administrativa, o serviço deve gravar também um snapshot completo do catálogo em `admin_notification_catalogs`;
- os arrays em `src/app/constants/adminNotificationCatalog.ts` permanecem como fallback/base técnica de compatibilidade até a remoção completa das dependências diretas no restante da UI;
- novas abas ou componentes administrativos devem preferir carregar catálogo via serviço, não por importação direta de constantes.

Arquivos principais:

- `src/app/services/adminNotificationConfigurationService.ts`;
- `src/app/constants/adminNotificationCatalog.ts`;
- `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx`;
- `src/app/pages/admin/AdminNotificacoes.tsx`.

### Destinatários avançados

Foram adicionados grupos administrativos de destinatários para a configuração de notificações:

- `trigger_user`: usuário que realizou a ação do gatilho;
- `specific_users`: seleção manual de um ou mais usuários;
- `close_family`: familiares próximos da pessoa ou usuário do gatilho.

Familiares próximos incluem:

- pai;
- mãe;
- irmãos;
- cônjuge ativo;
- filhos;
- netos;
- sobrinhos.

Arquivos principais:

- `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx`;
- `src/app/services/notificationRecipientsService.ts`.

Contrato:

- seleção de usuários específicos deve persistir como tokens `specific_user:<uuid>`;
- a opção `Usuários específicos` deve habilitar seleção múltipla;
- `close_family` deve resolver usuários vinculados às pessoas próximas, não apenas perfis exibidos na UI;
- o usuário ator pode ser excluído da lista quando a regra do gatilho exigir.

### Primeiro acesso ao mapa familiar

Foi criado gatilho para registrar o primeiro acesso real do usuário a `/mapa-familiar` e enviar notificação interna de boas-vindas.

Tabelas/serviços:

- `user_first_map_accesses`;
- `src/app/services/firstMapWelcomeNotificationService.ts`;
- `src/app/components/TreeAccessRoute.tsx`.

Contrato:

- a notificação só deve ser criada quando o usuário acessar `/mapa-familiar`;
- não deve disparar em `/meus-dados`, `/linha-geracional`, `/mapa-familiar-horizontal`, `/busca` ou etapas anteriores;
- deve haver deduplicação por usuário em `user_first_map_accesses`;
- após criar a notificação, o serviço deve disparar o evento `arvorefamilia:notifications-updated` para atualizar o dropdown/header;
- enquanto não houver tipo customizado dedicado para boas-vindas, o tipo técnico pode permanecer como `novo_usuario`.

### Notificações enviadas aos usuários

As notificações entregues continuam sendo persistidas em `notificacoes_usuario`.

Contrato:

- o catálogo administrativo não substitui a caixa real do usuário;
- configurações e catálogo definem comportamento, conteúdo e destinatários;
- entregas reais continuam sendo criadas pelo dispatch interno/RPC/fallback em `notificacoes_usuario`;
- preferências de usuário continuam em `preferencias_notificacao`.

### Correções operacionais em migrations antigas

Durante a aplicação das migrations, foram corrigidos problemas que impediam `supabase db push`:

- remoção de BOM invisível em `20260611003558_add_genero_to_pessoas.sql`;
- normalização de encoding/BOM em `20260626123000_create_profile_control_requests_table.sql`;
- renomeação de migration duplicada de `20260626180000_expand_site_visual_settings_public_pages.sql` para `20260626180100_expand_site_visual_settings_public_pages.sql`.

Contrato:

- migrations devem usar UTF-8 sem BOM;
- timestamps de migration devem ser únicos;
- nomes duplicados de versão não podem entrar em `supabase_migrations.schema_migrations`;
- se o Supabase apontar erro no início do arquivo antes de comando SQL real, verificar BOM/caractere invisível antes de alterar lógica.

## Migrations relacionadas

- `supabase/migrations/20260701120000_persist_admin_notification_config_and_first_map_access.sql`;
- `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql`.

## QA funcional obrigatório

### Banco

Validar no Supabase SQL Editor:

```sql
select
  catalog_key,
  jsonb_array_length(notification_types) as tipos,
  jsonb_array_length(notification_templates) as templates,
  jsonb_array_length(recipient_groups) as grupos,
  updated_at
from public.admin_notification_catalogs;
```

Resultado esperado:

- uma linha `default`;
- contagens maiores que zero para tipos, templates e grupos;
- `updated_at` atualizado depois de salvar na UI.

Também validar:

```sql
select config_key, updated_at
from public.admin_notification_configurations;
```

Resultado esperado:

- uma linha `default` após primeiro salvamento da aba `Configuração`.

### Interface administrativa

Em `/admin/notificacoes`:

- abrir aba `Configuração` sem erro;
- selecionar um tipo de notificação;
- alterar frequência;
- alterar status ativo/inativo;
- editar título, texto e CTA;
- adicionar variável;
- alterar canais;
- marcar `Usuário do gatilho`;
- marcar `Usuários específicos` e selecionar mais de um usuário;
- marcar `Familiares próximos`;
- salvar;
- recarregar a página e confirmar persistência visual.

### Primeiro acesso ao mapa

Com usuário vinculado:

- limpar/garantir ausência de linha em `user_first_map_accesses` para o usuário de teste;
- acessar `/mapa-familiar`;
- confirmar criação de linha em `user_first_map_accesses`;
- confirmar criação de notificação interna em `notificacoes_usuario`;
- acessar `/mapa-familiar` novamente e confirmar que não duplica a notificação.

### Não regressão

- `npx supabase db push` deve retornar banco atualizado ou aplicar migrations sem erro;
- `npm run build` deve passar;
- dropdown de notificações do header deve continuar exibindo notificações recentes;
- `/notificacoes` e `/ajustar-notificacoes` não podem quebrar;
- notificações reais não devem ser confundidas com o catálogo administrativo;
- abas administrativas não devem exibir slugs crus como texto principal.

## Pendências técnicas mapeadas

- Refatorar `AdminNotificacoes.tsx` para substituir todos os usos diretos de `ADMIN_NOTIFICATION_TYPES`, `ADMIN_NOTIFICATION_TEMPLATES`, `ADMIN_NOTIFICATION_RECIPIENT_GROUPS`, `ADMIN_NOTIFICATION_FREQUENCY_OPTIONS`, `ADMIN_NOTIFICATION_AUTOMATIONS` e `ADMIN_NOTIFICATION_SUGGESTIONS` por estado carregado de `loadAdminNotificationCatalog()`.
- Integrar `themeOverrides` de forma completa no fluxo de salvamento quando a UI expuser edição temática fora das abas já existentes.
- Mapear o gatilho de boas-vindas para tipo customizado dedicado quando ele for criado no catálogo administrativo.
- Conectar `trigger_user`, `specific_users` e `close_family` no dispatch layer de todos os gatilhos que ainda usam destinatários fixos.
- Evoluir de snapshot JSONB para tabelas normalizadas somente se houver necessidade de filtros, auditoria granular por item ou edição concorrente por registro.

## Regra de manutenção

Qualquer mudança em notificações administrativas deve revisar também:

- `docs/README.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`, quando houver schema/RLS/RPC;
- `docs/QA_MANUAL.md`;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- `docs/arquitetura/DECISOES_ARQUITETURAIS.md`, quando alterar fonte de verdade ou persistência.
