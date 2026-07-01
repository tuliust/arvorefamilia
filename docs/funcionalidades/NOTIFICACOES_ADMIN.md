# Notificações administrativas

> Última revisão: 2026-07-01
> Escopo: `/admin/notificacoes`, catálogo administrativo, configuração persistida, destinatários, canais, variáveis e primeiro acesso real a `/mapa-familiar`.
> Status: canônico.

## Objetivo

A frente de notificações administrativas centraliza a configuração de tipos, templates, canais, frequências, destinatários e variáveis usadas pelo produto para comunicação interna, e-mail, push ou WhatsApp quando o canal estiver disponível.

Este documento cobre a administração do catálogo e das regras de envio. A experiência de consumo pelo usuário final permanece resumida em `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`.

## Arquivos principais

| Área | Arquivos principais |
|---|---|
| Página administrativa | `src/app/pages/admin/AdminNotificacoes.tsx` |
| Aba de configuração | `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx` |
| Formatadores de labels e variáveis | `src/app/components/admin/notifications/adminNotificationFormatters.ts` |
| Catálogo base/fallback | `src/app/constants/adminNotificationCatalog.ts` |
| Persistência da configuração | `src/app/services/adminNotificationConfigurationService.ts` |
| Resolução de destinatários | `src/app/services/notificationRecipientsService.ts` |
| Registro do primeiro acesso ao mapa | serviço ligado a `user_first_map_accesses`, quando disponível |
| UI base de formulário | `src/app/components/ui/textarea.tsx`, `Input`, `Select`, `Checkbox`, `Button`, `Card` |

## Camadas de dados

A arquitetura separa três camadas:

| Camada | Responsabilidade |
|---|---|
| `notificacoes_usuario` | Entrega real ao usuário final. |
| `preferencias_notificacao` | Preferências individuais do usuário. |
| `admin_notification_configurations` e `admin_notification_catalogs` | Administração do catálogo, overrides, templates, canais, frequências, grupos e sugestões. |

`src/app/constants/adminNotificationCatalog.ts` permanece como base técnica e fallback. Quando houver catálogo persistido válido, a UI administrativa deve preferir os serviços de carregamento do catálogo em vez de depender exclusivamente de imports estáticos.

## Aba `Configuração`

A aba de configuração permite ajustar uma notificação específica sem misturar catálogo administrativo com entregas reais.

Regras implementadas:

- o card superior exibe seleção de tipo de notificação, frequência e status;
- o status deve usar opções humanas `Ativo` e `Inativo`;
- o botão `Salvar` persiste overrides e definições customizadas;
- o botão `Novo tipo` cria definição customizada com tipo e template associados;
- campos editáveis principais: `Título`, `Texto` e `CTA`;
- alterações de conteúdo devem ser mantidas em `contentOverrides` até o salvamento;
- erros de salvamento devem usar `toast`, não diálogo nativo;
- estado de carregamento deve bloquear duplo clique e mostrar feedback textual.

## Variáveis

A UI permite inserir variáveis no campo ativo no ponto do cursor.

Regras:

- o campo ativo pode ser `Título`, `Texto` ou `CTA`;
- clicar em uma variável insere o token no cursor, preservando seleção quando houver texto selecionado;
- após inserir, o campo deve manter foco e cursor após o token;
- `{{nome}}` deve ser inserido como `{{nome_curto}}`;
- `{{nome_autor}}` deve ser inserido como `{{nome_autor_curto}}`;
- novas variáveis digitadas pelo admin devem ser normalizadas para `snake_case`, sem acentos e dentro de `{{ }}`;
- variáveis duplicadas não devem ser adicionadas novamente.

## Canais

Canais aceitos na configuração administrativa:

- `interna`;
- `email`;
- `push`;
- `whatsapp`.

Um canal fora da lista padrão permitida pelo tipo pode aparecer como extra administrativo, mas isso não garante entrega real se o dispatcher/canal correspondente não estiver implementado ou configurado.

## Destinatários

Grupos de destinatários podem vir do catálogo base, do catálogo persistido ou de grupos adicionais da UI.

Destinatários avançados aceitos:

| Grupo | Uso |
|---|---|
| `trigger_user` | Usuário que realizou a ação que originou a notificação. |
| `specific_users` | Usuários selecionados manualmente pelo admin. |
| `close_family` | Familiares próximos do usuário ou pessoa do gatilho. |

`close_family` deve considerar, quando os dados existirem, pai, mãe, irmãos, cônjuge ativo, filhos, netos e sobrinhos.

Usuários específicos devem ser representados com token técnico segmentado, por exemplo `specific_user:<userId>`, para não confundir grupo de destinatário com ID de usuário.

## Persistência

O botão `Salvar` deve persistir:

- `frequencyOverrides`;
- `contentOverrides`;
- `channelOverrides`;
- `recipientOverrides`;
- `activeOverrides`;
- `variableOverrides`;
- `customDefinitions`.

Definições customizadas devem incluir tipo e template. Tipos customizados podem usar prefixo `custom_notification_`.

## Primeiro acesso real ao mapa

O primeiro acesso real de um usuário autenticado a `/mapa-familiar` pode gerar notificação interna de boas-vindas.

Regras:

- o evento deve ser deduplicado por usuário;
- a deduplicação deve usar registro persistido em `user_first_map_accesses` quando a tabela existir;
- falha ao registrar ou enviar a notificação não deve bloquear o carregamento do mapa;
- a entrega real deve continuar gravando em `notificacoes_usuario`.

## Migrations relacionadas

Quando esta frente estiver ativa no ambiente remoto, validar as migrations:

- `supabase/migrations/20260701120000_persist_admin_notification_config_and_first_map_access.sql`;
- `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql`.

Se a migration não existir no ambiente remoto, a UI deve falhar de forma defensiva ou cair para catálogo base/fallback sem quebrar a navegação administrativa.

## QA mínimo

1. Abrir `/admin/notificacoes` como admin.
2. Entrar na aba `Configuração`.
3. Trocar tipo de notificação e confirmar que título, texto, CTA, canais, destinatários, frequência, status e variáveis carregam corretamente.
4. Editar `Título`, `Texto` e `CTA`.
5. Inserir variável no cursor do campo ativo.
6. Confirmar que `{{nome}}` entra como `{{nome_curto}}`.
7. Confirmar que `{{nome_autor}}` entra como `{{nome_autor_curto}}`.
8. Criar nova variável e validar normalização.
9. Alternar `Ativo/Inativo`.
10. Criar `Novo tipo`.
11. Selecionar destinatários `Usuário do gatilho`, `Usuários específicos` e `Familiares próximos` quando disponíveis.
12. Salvar e recarregar a página.
13. Confirmar que a configuração salva retorna do Supabase.
14. Testar falha de rede/serviço e confirmar uso de `toast` sem diálogo nativo.
15. Em usuário membro, acessar `/mapa-familiar` pela primeira vez e verificar deduplicação da notificação quando a migration estiver aplicada.

## Não regressão

- Slugs crus não devem aparecer como texto principal de leitura quando houver label humano.
- `Texto`, `Título`, `CTA`, `Frequência`, `Canais`, `Destinatários`, `Status` e `Variáveis` devem preservar acentuação correta.
- O botão `Salvar` não deve sumir quando houver alteração configurável.
- O botão `Novo tipo` não deve criar tipo sem template correspondente.
- A inserção de variável não deve sempre ir para o fim do campo quando o cursor estiver no meio do texto.
- A configuração administrativa não deve criar notificação real em `notificacoes_usuario` por si só; entrega continua sendo responsabilidade do fluxo de dispatch.
- Entrega real e catálogo administrativo devem permanecer separados.
