# Inventário técnico

> Última revisão: 2026-07-01
> Escopo: rotas, módulos, documentos finais e referências técnicas preservadas após limpeza documental e ajustes mobile/admin de 2026-07-01.
> Status: canônico.

## Stack

- Aplicação React com Vite.
- Rotas em `src/app/routes.tsx`, usando `createBrowserRouter`.
- Guards: `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`.
- Dados via Supabase, com serviços em `src/app/services` e tipos em `src/app/types`.
- IA por endpoint serverless `api/ai.ts`.
- Scripts de runtime mobile e defensivo carregados por `index.html`.
- Validação esperada: `npm run typecheck` e `npm run build`.

## Documentos canônicos por área

| Área | Documento |
|---|---|
| Mapa familiar, visualização horizontal e linha geracional | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores, painel e edição | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Status conjugal | `funcionalidades/STATUS_CONJUGAL.md` |
| Meus dados, IA, Mini Bio e Curiosidades | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Notificações administrativas, catálogo e destinatários | `funcionalidades/NOTIFICACOES_ADMIN.md` |
| Fórum, favoritos, notificações do usuário, dúvidas, calendário, onboarding, timeline, exportação, perfil e administração | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |
| Configurações públicas de `/admin/home` | `admin-home-configuracoes-publicas.md` |

## Documentos técnicos finais

| Tema | Documento |
|---|---|
| Arquitetura e decisões | `arquitetura/DECISOES_ARQUITETURAIS.md` |
| Rotas e guards | `arquitetura/ROTAS_E_GUARDS.md` |
| Componentes | `GUIA_COMPONENTES.md` |
| Implementações | `GUIA_IMPLEMENTACOES.md` |
| UX e layout | `GUIA_UX_LAYOUT.md` |
| QA manual | `QA_MANUAL.md` |
| Não regressão | `REGRAS_DE_NAO_REGRESSAO.md` |
| Correção de erros | `GUIA_CORRECAO_ERROS.md` |
| Próximos passos | `PLANO_PROXIMOS_PASSOS.md` |
| Migrations Supabase | `operacao/MIGRATIONS_SUPABASE.md` |
| Deploy | `operacao/DEPLOY.md` |
| OAuth Google | `operacao/OAUTH_GOOGLE.md` |
| Storage | `operacao/STORAGE_MAINTENANCE.md` |

## Histórico preservado

- `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md`
- `historico/LEGADO_TECNICO.md`
- `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md`

## Rotas declaradas em `src/app/routes.tsx`

### Públicas

- `/entrar`
- `/termos`
- `/privacidade`
- `/duvidas`

### Árvore, busca e perfil

- `/`
- `/mapa-familiar`
- `/mapa-familiar-horizontal`
- `/linha-geracional`
- `/busca`
- `/pessoa/:id`
- `/pessoas/:id`

### Membro e onboarding

- `/minha-arvore/editar`
- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/preferencias`
- `/revisao-dados`
- `/vincular-perfil`
- `/calendario-familiar`
- `/curiosidades`
- `/meus-favoritos`
- `/notificacoes`
- `/ajustar-notificacoes`
- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`

### Administração

- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/aprovacoes`
- `/admin/aprovacoes`
- `/admin/home`
- `/admin/pessoas`
- `/admin/pessoas/novas`
- `/admin/pessoas/nova`
- `/admin/pessoas/:id`
- `/admin/pessoas/:id/editar`
- `/admin/relacionamentos`
- `/admin/relacionamentos/novo`
- `/admin/importacao`
- `/admin/migrar-dados`
- `/admin/diagnostico`
- `/admin/integridade`
- `/admin/atividades`
- `/admin/responsaveis`
- `/admin/notificacoes`
- `/admin/gestao-conteudo-pessoas`
- `/admin/duvidas`

## Primeiro acesso: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Dados pessoais, avatar, privacidade e questionário `Sobre Mim` | `src/app/pages/MeusDados.tsx`, `src/app/pages/MeusDadosWithInlineProfileBio.tsx` |
| Vínculos, pets, cônjuges e rascunho de relacionamentos | `src/app/pages/MeusVinculos.tsx`, `src/app/pages/MeusVinculosWithProfileBio.tsx`, `src/app/pages/MeusVinculosMobileShortcutsPage.tsx` |
| Modal de pet | `src/app/pages/meus-vinculos/MeusVinculosPetEditorPortal.tsx` |
| Fatos e arquivos históricos | `src/app/components/ArquivosHistoricos.tsx`, `src/app/pages/ArquivosHistoricosPage.tsx` |
| Revisão final | `src/app/pages/RevisaoDados.tsx`, `src/app/pages/RevisaoDadosFlowPage.tsx` |
| Guards de primeiro acesso | `src/app/components/MemberRoute.tsx`, `src/app/components/TreeAccessRoute.tsx`, `src/app/services/memberProfileService.ts` |

Notas técnicas:

- rascunhos de primeiro acesso são auxiliares e podem usar `sessionStorage` segmentado por usuário/pessoa;
- pets salvos por modal devem sincronizar com a página principal antes da revisão final;
- badges de pendência em vínculos e revisão representam solicitações ou estados aguardando aprovação;
- ajustes exclusivamente documentais dessa frente não alteram Supabase, autenticação, migrations ou guards;
- o controle de acesso do primeiro acesso depende de `MemberRoute`, `TreeAccessRoute` e `resolveFirstAccessLinkForUser`;
- `dados_confirmados = false` mantém o usuário restrito às etapas de onboarding até a confirmação final em `/revisao-dados`;
- rotas internas e rotas de árvore só devem abrir depois que `dados_confirmados = true` estiver persistido.

## Notificações administrativas: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Painel administrativo de notificações, aba ativa e rascunho local | `src/app/pages/admin/AdminNotificacoes.tsx` |
| Aba de configuração, conteúdo, canais, destinatários, eventos de gatilho, variáveis e regras de variáveis | `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx` |
| Formatação humana de labels, variáveis e slugs | `src/app/components/admin/notifications/adminNotificationFormatters.ts` |
| Catálogo base/fallback de tipos, templates, automações, frequências e grupos | `src/app/constants/adminNotificationCatalog.ts` |
| Persistência de configuração e catálogo completo | `src/app/services/adminNotificationConfigurationService.ts` |
| Resolução de destinatários e familiares próximos | `src/app/services/notificationRecipientsService.ts` |
| Primeiro acesso real ao mapa | `src/app/services/firstMapWelcomeNotificationService.ts`, `src/app/components/TreeAccessRoute.tsx` |
| Dispatch e persistência de notificações reais | `src/app/services/notificationDispatchService.ts`, `src/app/services/notificationAdminService.ts`, `src/app/services/notificationScheduledService.ts` |
| Header/dropdown de notificações | `src/app/components/layout/HeaderNotificationsDropdown.tsx` |
| Campo de texto com ref para inserção de variável no cursor | `src/app/components/ui/textarea.tsx` |

Tabelas Supabase relacionadas:

- `notificacoes_usuario`, para notificações reais entregues;
- `preferencias_notificacao`, para preferências de usuários;
- `admin_notification_configurations`, para overrides/configurações da UI administrativa, incluindo `variable_settings` por template;
- `admin_notification_catalogs`, para snapshot editável do catálogo completo;
- `user_first_map_accesses`, para deduplicação do gatilho de boas-vindas ao acessar `/mapa-familiar`.

Tokens e chaves operacionais:

- `specific_user:<uuid>`: seleção manual de usuários específicos;
- `trigger_user`: grupo dinâmico para usuário que realizou a ação;
- `trigger_event:first_map_access`: gatilho implementado de primeiro acesso a `/mapa-familiar`;
- `trigger_event:first_login`: gatilho preparado para autenticação;
- `trigger_event:onboarding_completed`: gatilho preparado para conclusão de primeiro acesso;
- `trigger_event:profile_updated`: gatilho preparado para atualização própria de perfil;
- `arvorefamilia:admin-notifications-console-config`: rascunho local da configuração administrativa;
- `arvorefamilia:admin-notifications-active-tab`: aba ativa da página administrativa.

Migrations relacionadas:

- `supabase/migrations/20260701120000_persist_admin_notification_config_and_first_map_access.sql`;
- `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql`;
- `supabase/migrations/20260701170000_add_variable_settings_to_admin_notification_config.sql`.

Documentos relacionados:

- contrato funcional: `docs/funcionalidades/NOTIFICACOES_ADMIN.md`;
- QA: `docs/QA_MANUAL.md`;
- não regressão: `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- migrations/tabelas: `docs/operacao/MIGRATIONS_SUPABASE.md`;
- pendências: `docs/PLANO_PROXIMOS_PASSOS.md`.

Regras de inventário:

- novas chaves de `localStorage`, tokens técnicos, tabelas e migrations de notificações devem ser registradas nesta seção;
- entregas reais em `notificacoes_usuario` não devem ser confundidas com catálogo administrativo;
- `variable_settings` deve ser tratado como contrato técnico da configuração administrativa enquanto existir a UI de regras de variáveis.

## Configurações públicas e tema

| Área | Arquivos principais |
|---|---|
| Admin de configurações públicas | `src/app/pages/admin/AdminHomeSettings.tsx`, `src/app/pages/admin/AdminHomeSettingsWithSaveBar.tsx` |
| Serviço de leitura, salvamento, publicação, rascunho e diff | `src/app/services/siteVisualSettingsService.ts` |
| Auditoria de configurações visuais | `src/app/services/siteVisualSettingsAuditService.ts`, `src/app/services/siteVisualSettingsAuditDiffService.ts` |
| Consumo público do tema | `src/app/hooks/useSiteVisualSettings.ts` |
| Frame público temático | `src/app/components/public/PublicThemeFrame.tsx` |
| Páginas públicas tematizadas | `src/app/pages/Entrar.tsx`, `src/app/pages/Duvidas.tsx`, `src/app/pages/legal/PublicLegalDocumentPage.tsx` |

Notas técnicas:

- `useSiteVisualSettings.ts` pode usar cache best-effort em `localStorage` para reduzir flicker e servir fallback quando a leitura remota falhar;
- a fonte definitiva permanece `site_visual_settings`;
- cache local não substitui auditoria, publicação, rascunho ou agendamento;
- alterações dessa frente devem ser refletidas em `admin-home-configuracoes-publicas.md`.

## Runtimes e wrappers relevantes

- `src/app/components/MobileGlobalTweaks.tsx`
- `src/app/components/MobileTopLayerTweaks.tsx`
- `src/app/components/LinhaGeracionalMobilePanelLayerTweaks.tsx`
- `src/app/components/FamilyTree/MobileFamilyMapBackdrop.tsx`
- `src/app/components/FamilyTree/MobileFamilyMapContextTray.tsx`
- `src/app/components/FamilyTree/MobileFamilyMapFullLayer.tsx`
- `src/app/components/FirstLoginTutorialRuntimeTweaks.tsx`
- `src/app/components/person/PersonProfileRuntimeTweaks.tsx`
- Wrappers ativos: `AdminDashboardWithTweaks`, `AdminHomeSettingsWithSaveBar`, `MeusDadosWithInlineProfileBio`, `MeusVinculosWithProfileBio` e `MeusVinculosMobileShortcutsPage`.
- Componentes auxiliares do primeiro acesso: `MeusVinculosPetEditorPortal`, `RelationshipGroupPanel`, `RelativeCard`, `RelationshipOverview` e `ProfileControlRequestDialog`.

## Mapa mobile: componentes React vigentes

| Arquivo | Responsabilidade |
|---|---|
| `src/app/pages/home/HomeMobileNav.tsx` | Centraliza estado dos botões `Formato`, `Cor`, `Filtros`, `Mapa` e `+`; renderiza toolbar, trays, backdrop parcial/imersivo e camada de mapa completo. |
| `src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx` | Toolbar mobile de mapa; o botão `Mapa` abre visão geral, não zoom direto. |
| `src/app/components/FamilyTree/MobileFamilyMapBackdrop.tsx` | Backdrop React parcial/imersivo; no modo parcial calcula limite inferior pelo topo real da navegação inferior e no modo imersivo cobre a shell atrás da camada ativa. |
| `src/app/components/FamilyTree/MobileFamilyMapContextTray.tsx` | Tray contextual React da toolbar; em `/linha-geracional`, renderiza atalhos `GER. 1` a `GER. 6`, contadores e CTA de mapa completo. |
| `src/app/components/FamilyTree/MobileFamilyMapFullLayer.tsx` | Camada React de mapa completo acima do blur imersivo, com botão `X`, safe-area e área de toque confortável. |
| `src/mobileFamilyMapFullOverview.ts` | Runtime de compatibilidade do mapa completo mobile de `/mapa-familiar`, quando usado pelo fluxo de renderização vigente. |
| `src/mobileGenerationLineFullOverview.ts` | Runtime de compatibilidade da visualização completa de `/linha-geracional`, preservando pan/zoom após gestos. |
| `src/mobileFamilyMapFullOverviewConnectorFix.ts` | Refinamentos de conectores do mapa completo mobile enquanto a regra não estiver totalmente absorvida pelo modelo React. |
| `src/mobileFamilyMapFilterButtonsBehaviorFix.ts` | Isola comportamento de filtros mobile, incluindo regra de cônjuges colaterais na linha geracional. |

Scripts defensivos devem ser tratados como camada de transição. Quando o comportamento estiver estabilizado em componente React, a documentação canônica deve privilegiar o componente de origem.

## Scripts carregados por `index.html`

Além de `src/main.tsx`, `index.html` carrega os seguintes scripts defensivos:

- `src/mobileFamilyTreeMutationPerformanceGuard.ts`
- `src/visualPatchB.ts`
- `src/firstLoginMobileTutorialFixes.ts`
- `src/mobileCuriositiesNavigationFix.ts`
- `src/mobileTreePanelViewportFix.ts`
- `src/staticMobileFamilyTreeScreens.ts`
- `src/mobileFamilyTreeScreenStateGuards.ts`
- `src/mobileFamilyTreeGrandparentScreens.ts`
- `src/mobileFamilyTreeSwipeHints.ts`
- `src/mobileFamilyTreeAncestorConnectorsFix.ts`
- `src/mobileFamilyTreeDescendantConnectorsFix.ts`
- `src/mobileFamilyTreeCoreDescendantConnector.ts`
- `src/mobileFamilyTreeGroupTitleVisibilityFix.ts`
- `src/mobileFamilyHorizontalZoomOverview.ts`
- `src/mobileFamilyMapUncleSwipeNavigationGuard.ts`
- `src/mobileFamilyMapOverviewGhostClickGuard.ts`
- `src/mobileFamilyMapOverviewButtonFix.ts`
- `src/mobileFamilyMapStableMobileFix.ts`
- `src/mobileFamilyMapDirectionalNavigationFix.ts`
- `src/mobileFamilyMapUncleCardLimit.ts`
- `src/mobileFamilyMapCoreConnectorFix.ts`
- `src/mobileVisualizationPanelFamilyStatsFix.ts`
- `src/mobileFamilyMapZoomOverviewVisualFix.ts`
- `src/mobileFamilyMapOverviewTileVisualAdjustments.ts`
- `src/mobileFamilyMapDescendantsStabilityLock.ts`
- `src/mobileFamilyMapExtendedSpouseCards.ts`
- `src/mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `src/mobileFamilyMapFullOverview.ts`
- `src/mobileGenerationLineFullOverview.ts`
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`

Observações:

- `src/mobileMapToolbarBackdropLayerFix.ts` não deve ser listado como script ativo se não estiver carregado por `index.html`.
- `src/mobileMapPanelRefinements.ts` não deve ser listado como script ativo se não estiver carregado por `index.html`.
- `src/mobileFamilyMapFullPanelStyleFix.ts` não deve ser listado como script ativo se não estiver carregado por `index.html`.
- `src/visualPatchA.ts`, quando existir sem carregamento em `index.html`, deve ser tratado como resíduo técnico a remover ou justificar em outra frente.

## Scripts neutralizados, removidos ou absorvidos

| Arquivo | Situação documental |
|---|---|
| `src/mobileMapPanelRefinements.ts` | Não é contrato vigente se estiver vazio ou não carregado; regras de backdrop/tray devem ficar nos componentes React. |
| `src/mobileMapToolbarBackdropLayerFix.ts` | Não é contrato vigente se estiver vazio ou não carregado; seletores legados de backdrop não devem ser reintroduzidos. |
| `src/mobileFamilyMapFullPanelStyleFix.ts` | Não é contrato vigente se estiver vazio ou não carregado; estilos do mapa completo devem estar no componente/camada atual. |
| `src/mobileFamilyMapFullOverviewButtonGuard.ts` | Se estiver carregado mas vazio, é compatibilidade/no-op e deve ser removido quando seguro. |
| `src/desktopTreeVisualizationPanelTextFix.ts` | Não deve ser listado como script ativo quando a correção textual já estiver aplicada nos componentes de origem. |
| `src/visualPatchA.ts` | Se existir apenas como teste/resíduo e não for carregado, deve ser removido em limpeza técnica futura. |

## Exportação e impressão da árvore

Arquivos e módulos relevantes:

- `src/app/pages/home/HomeTreeSection.tsx`: recebe ações do painel, controla o modal de instruções de `Salvar Imagem`, coordena impressão e mantém helpers de preview/captura interna.
- `src/app/pages/home/DesktopTreeVisualizationPanel.tsx`: expõe no painel desktop somente `Salvar Imagem` e `Imprimir`.
- `src/app/pages/home/SidebarPanelTabs.tsx`: preserva a mesma semântica no painel compacto/flyout.
- `src/app/utils/screenAreaCapture.ts`: implementa captura real de área visível por `getDisplayMedia`, overlay de seleção, recorte, salvamento PNG e fallback de download.
- `src/app/components/FamilyTree/utils/exportColorSanitizer.ts`: sanitiza cores para fluxos que ainda passam por `html2canvas`.
- `html2canvas` e `jsPDF`: permanecem como dependências técnicas para captura/artefatos internos, mas `PDF` não é ação exposta no painel principal atual.

Contrato técnico atual:

- `select-area` representa `Salvar Imagem`;
- `print` representa impressão em página limpa com título e imagem dimensionada da árvore;
- durante captura de área, o `html` recebe atributo transitório para ocultar zoom, favorito e botão `?`;
- durante impressão, a página gerada deve conter somente título e árvore, centralizados e em uma página;
- `window.alert`, `alert`, `confirm` e `prompt` não devem ser usados.

## Arquivos removidos ou absorvidos

A documentação operacional não deve manter arquivos de rodada, baseline antigo ou QA datado quando o conteúdo couber em documentos canônicos. Nesta auditoria, `docs/operacao/QA_NAO_REGRESSAO_MAPAS_MOBILE_POS_AJUSTES_2026_06_21.md` foi removido e seus pontos úteis foram consolidados em `QA_MANUAL.md`.

O runtime `src/desktopTreeVisualizationPanelTextFix.ts` não deve ser listado como script ativo quando a correção textual já estiver aplicada nos componentes de origem.

Arquivos temporários, patches de teste e módulos sem carregamento ativo devem ser removidos em limpeza técnica posterior, ou documentados explicitamente como pendência quando houver motivo para mantê-los no repositório.

## Regra de manutenção do inventário

Atualizar este arquivo sempre que houver:

- nova rota, guard ou página canônica;
- novo serviço em `src/app/services` com responsabilidade de domínio;
- nova tabela, RPC, migration, bucket ou chave técnica persistida;
- novo runtime carregado por `index.html`;
- neutralização, remoção ou absorção de runtime defensivo;
- mudança no contrato de `/admin/notificacoes`, especialmente tokens, eventos, variáveis, catálogo ou tabelas.

O inventário deve descrever módulos ativos e pendências técnicas reais. Não deve listar scripts vazios, arquivos de teste, patches temporários ou documentação de rodada como se fossem contrato vigente.
