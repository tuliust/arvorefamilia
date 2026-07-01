# Notificações administrativas

> Última revisão: 2026-07-01
> Escopo: `/admin/notificacoes`, catálogo administrativo, configuração persistida, destinatários, eventos de gatilho, canais, variáveis, regras de variáveis, rascunho local e primeiro acesso real a `/mapa-familiar`.
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
| Persistência da configuração, catálogo e regras de variáveis | `src/app/services/adminNotificationConfigurationService.ts` |
| Resolução de destinatários | `src/app/services/notificationRecipientsService.ts` |
| Registro do primeiro acesso ao mapa | `src/app/services/firstMapWelcomeNotificationService.ts`, `src/app/components/TreeAccessRoute.tsx` |
| UI base de formulário | `src/app/components/ui/textarea.tsx`, `Input`, `Select`, `Checkbox`, `Button`, `Card` |
| Rascunho local da página | `localStorage` nas chaves `arvorefamilia:admin-notifications-console-config` e `arvorefamilia:admin-notifications-active-tab` |

## Camadas de dados

A arquitetura separa três camadas:

| Camada | Responsabilidade |
|---|---|
| `notificacoes_usuario` | Entrega real ao usuário final. |
| `preferencias_notificacao` | Preferências individuais do usuário. |
| `admin_notification_configurations` e `admin_notification_catalogs` | Administração do catálogo, overrides, templates, canais, frequências, grupos, sugestões e regras de variáveis. |

`src/app/constants/adminNotificationCatalog.ts` permanece como base técnica e fallback. Quando houver catálogo persistido válido, a UI administrativa deve preferir os serviços de carregamento do catálogo em vez de depender exclusivamente de imports estáticos.

## Aba `Configuração`

A aba de configuração permite ajustar uma notificação específica sem misturar catálogo administrativo com entregas reais.

Regras implementadas:

- o card superior exibe seleção de tipo de notificação, frequência e status;
- o status deve usar opções humanas `Ativo` e `Inativo`;
- o botão `Salvar` persiste overrides, regras de variáveis e definições customizadas;
- o botão `Novo tipo` cria definição customizada com tipo e template associados;
- campos editáveis principais: `Título`, `Texto` e `CTA`;
- em tipos customizados, o título preenchido pelo admin deve virar o nome administrativo exibido no seletor, substituindo o rótulo genérico `Nova notificação N`;
- alterações de conteúdo devem ser mantidas em `contentOverrides` até o salvamento;
- a aba ativa deve ser preservada em `localStorage` para evitar retorno indevido para `Visão geral` ao trocar de aba do navegador ou remontar a página;
- rascunhos ainda não salvos devem ser preservados localmente em `arvorefamilia:admin-notifications-console-config`;
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

### Regras de variáveis

A seção `Editar regras das variáveis` permite definir como cada variável deve ser resolvida no momento de renderizar ou disparar a mensagem.

Configurações aceitas por variável:

| Campo | Uso |
|---|---|
| `source` | Origem da variável: `auto`, `fixed`, `trigger_context`, `profile` ou `date`. |
| `value` | Valor fixo ou fallback. Para `{{link}}`, representa o link considerado pela notificação. |
| `dateFormat` | Formato de data: `short`, `long`, `relative` ou `custom`. |
| `customFormat` | Máscara personalizada quando `dateFormat` for `custom`. |
| `description` | Observação administrativa opcional. |

Regras:

- `{{link}}` pode ser configurado com valor fixo, por exemplo `/mapa-familiar`;
- variáveis de data podem receber formato curto, longo, relativo ou personalizado;
- a configuração das variáveis deve persistir em `admin_notification_configurations.variable_settings`;
- o snapshot de catálogo em `admin_notification_catalogs.notification_templates` pode carregar `variableSettings` em cada template;
- as regras de variáveis definem contrato administrativo, mas a resolução final no envio depende do dispatcher ou renderer do template.

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

### Eventos do usuário do gatilho

Quando `trigger_user` é selecionado, a UI deve exibir seleção complementar de eventos que indicam qual ação define o usuário destinatário.

Eventos administrativos previstos:

| Evento | Token | Status |
|---|---|---|
| Primeiro acesso ao mapa familiar | `trigger_event:first_map_access` | Implementado para `/mapa-familiar`. |
| Primeiro login | `trigger_event:first_login` | Preparado para conexão posterior com autenticação. |
| Conclusão do primeiro acesso | `trigger_event:onboarding_completed` | Preparado para conexão posterior com onboarding/revisão. |
| Atualização própria de perfil | `trigger_event:profile_updated` | Preparado para conexão posterior com edição de perfil. |

Regras:

- selecionar `Usuário do gatilho` deve adicionar o grupo `trigger_user`;
- quando `trigger_user` for marcado, `trigger_event:first_map_access` pode ser pré-selecionado por ser o gatilho real já implementado;
- eventos de gatilho devem ser persistidos em `recipientOverrides` como tokens `trigger_event:<evento>`;
- o card `Usuário do gatilho` não executa ação sozinho; ele apenas define que o destinatário será resolvido pelo contexto do evento;
- eventos preparados não devem prometer envio real enquanto não houver conexão no dispatch layer.

## Persistência

O botão `Salvar` deve persistir:

- `frequencyOverrides`;
- `contentOverrides`;
- `channelOverrides`;
- `recipientOverrides`;
- `activeOverrides`;
- `variableOverrides`;
- `variableSettings`;
- `customDefinitions`.

Definições customizadas devem incluir tipo e template. Tipos customizados podem usar prefixo `custom_notification_`.

Ao salvar um tipo customizado, o título visível do formulário deve atualizar `administrativeName`, `shortName` e `template.title`. O link padrão deve respeitar `{{link}}` quando essa variável tiver valor configurado.

O rascunho local em `localStorage` é mecanismo de recuperação de edição, não substitui persistência remota. A fonte remota para configuração continua sendo Supabase.

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
- `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql`;
- `supabase/migrations/20260701170000_add_variable_settings_to_admin_notification_config.sql`.

Se a migration não existir no ambiente remoto, a UI deve falhar de forma defensiva ou cair para catálogo base/fallback sem quebrar a navegação administrativa.

## QA mínimo

1. Abrir `/admin/notificacoes` como admin.
2. Entrar na aba `Configuração`.
3. Trocar tipo de notificação e confirmar que título, texto, CTA, canais, destinatários, frequência, status e variáveis carregam corretamente.
4. Editar `Título`, `Texto` e `CTA`.
5. Confirmar que, em tipo customizado, o título editado aparece no seletor de tipo e substitui `Nova notificação N` após salvar/recarregar.
6. Inserir variável no cursor do campo ativo.
7. Confirmar que `{{nome}}` entra como `{{nome_curto}}`.
8. Confirmar que `{{nome_autor}}` entra como `{{nome_autor_curto}}`.
9. Criar nova variável e validar normalização.
10. Abrir `Editar regras das variáveis`.
11. Configurar `{{link}}` com valor `/mapa-familiar`.
12. Configurar variável de data com `short`, `long`, `relative` e `custom`.
13. Alternar `Ativo/Inativo`.
14. Criar `Novo tipo`.
15. Selecionar destinatário `Usuário do gatilho` e confirmar abertura do seletor de eventos.
16. Confirmar que `Primeiro acesso ao mapa familiar` aparece como implementado.
17. Selecionar `Primeiro login`, `Conclusão do primeiro acesso` ou `Atualização própria de perfil` e confirmar que aparecem como preparados, sem prometer envio real.
18. Selecionar destinatário `Usuários específicos` e escolher mais de um usuário.
19. Selecionar destinatário `Familiares próximos`.
20. Trocar de aba do navegador ou rememorar a rota e confirmar que a aba `Configuração` e o rascunho foram preservados.
21. Salvar e recarregar a página.
22. Confirmar que a configuração salva retorna do Supabase.
23. Confirmar que `variable_settings` foi gravado em `admin_notification_configurations`.
24. Testar falha de rede/serviço e confirmar uso de `toast` sem diálogo nativo.
25. Em usuário membro, acessar `/mapa-familiar` pela primeira vez e verificar deduplicação da notificação quando a migration estiver aplicada.

## Não regressão

- Slugs crus não devem aparecer como texto principal de leitura quando houver label humano.
- `Texto`, `Título`, `CTA`, `Frequência`, `Canais`, `Destinatários`, `Status` e `Variáveis` devem preservar acentuação correta.
- O botão `Salvar` não deve sumir quando houver alteração configurável.
- O botão `Novo tipo` não deve criar tipo sem template correspondente.
- Tipos customizados não devem permanecer como `Nova notificação N` depois que o admin preencher título e salvar.
- `Usuário do gatilho` deve abrir configuração de eventos e persistir tokens `trigger_event:<evento>`.
- A seleção de `Usuários específicos` deve continuar persistindo tokens `specific_user:<userId>`.
- `variable_settings` não deve ser perdido ao salvar ou reabrir a aba de configuração.
- Trocar de aba do navegador não deve levar o admin de volta para `Visão geral` nem apagar rascunhos da aba `Configuração`.
- A inserção de variável não deve sempre ir para o fim do campo quando o cursor estiver no meio do texto.
- A configuração administrativa não deve criar notificação real em `notificacoes_usuario` por si só; entrega continua sendo responsabilidade do fluxo de dispatch.
- Entrega real e catálogo administrativo devem permanecer separados.
