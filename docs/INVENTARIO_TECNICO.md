# Inventário técnico

> Última revisão: 2026-07-01
> Escopo: rotas, módulos, documentos finais e referências técnicas preservadas após limpeza documental.
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

Notas técnicas:

- rascunhos de primeiro acesso são auxiliares e podem usar `sessionStorage` segmentado por usuário/pessoa;
- pets salvos por modal devem sincronizar com a página principal antes da revisão final;
- badges de pendência em vínculos e revisão representam solicitações ou estados aguardando aprovação;
- ajustes documentais dessa frente não alteram Supabase, autenticação, migrations ou guards.

## Notificações administrativas: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Painel administrativo de notificações | `src/app/pages/admin/AdminNotificacoes.tsx` |
| Aba de configuração, conteúdo, canais, destinatários e variáveis | `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx` |
| Catálogo base/fallback de tipos, templates, automações, frequências e grupos | `src/app/constants/adminNotificationCatalog.ts` |
| Persistência de configuração e catálogo completo | `src/app/services/adminNotificationConfigurationService.ts` |
| Resolução de destinatários e familiares próximos | `src/app/services/notificationRecipientsService.ts` |
| Primeiro acesso real ao mapa | `src/app/services/firstMapWelcomeNotificationService.ts`, `src/app/components/TreeAccessRoute.tsx` |
| Dispatch e persistência de notificações reais | `src/app/services/notificationDispatchService.ts`, `src/app/services/notificationAdminService.ts`, `src/app/services/notificationScheduledService.ts` |
| Header/dropdown de notificações | `src/app/components/layout/HeaderNotificationsDropdown.tsx` |

Tabelas Supabase relacionadas:

- `notificacoes_usuario`, para notificações reais entregues;
- `preferencias_notificacao`, para preferências de usuários;
- `admin_notification_configurations`, para overrides/configurações da UI administrativa;
- `admin_notification_catalogs`, para snapshot editável do catálogo completo;
- `user_first_map_accesses`, para deduplicação do gatilho de boas-vindas ao acessar `/mapa-familiar`.

## Runtimes e wrappers relevantes

- `src/app/components/MobileGlobalTweaks.tsx`
- `src/app/components/MobileTopLayerTweaks.tsx`
- `src/app/components/LinhaGeracionalMobilePanelLayerTweaks.tsx`
- `src/app/components/FirstLoginTutorialRuntimeTweaks.tsx`
- `src/app/components/person/PersonProfileRuntimeTweaks.tsx`
- Wrappers ativos: `AdminDashboardWithTweaks`, `AdminHomeSettingsWithSaveBar`, `MeusDadosWithInlineProfileBio`, `MeusVinculosWithProfileBio` e `MeusVinculosMobileShortcutsPage`.
- Componentes auxiliares do primeiro acesso: `MeusVinculosPetEditorPortal`, `RelationshipGroupPanel`, `RelativeCard`, `RelationshipOverview` e `ProfileControlRequestDialog`.

### Runtimes de mapa mobile estabilizados

| Arquivo | Responsabilidade |
|---|---|
| `src/mobileMapPanelRefinements.ts` | Backdrop, overlay seguro de gerações e refinamentos de gestos/camadas dos mapas mobile. |
| `src/mobileMapToolbarBackdropLayerFix.ts` | Ajusta limites superior/inferior do blur para ficar atrás do painel ativo e fora da navegação inferior. |
| `src/mobileFamilyMapFullOverviewButtonGuard.ts` | Guarda ativações do mapa completo de `/mapa-familiar` e carrega side effects relacionados. |
| `src/mobileFamilyMapFullOverview.ts` | Renderiza o mapa completo mobile de `/mapa-familiar`. |
| `src/mobileFamilyMapFullOverviewConnectorFix.ts` | Refinamentos de conectores do mapa completo mobile. |
| `src/mobileGenerationLineFullOverview.ts` | Renderiza a visualização completa de `/linha-geracional` e preserva pan/zoom após gestos. |
| `src/mobileFamilyMapFilterButtonsBehaviorFix.ts` | Isola comportamento de filtros mobile, incluindo regra de cônjuges colaterais na linha geracional. |

## Scripts carregados por `index.html`

Além de `src/main.tsx`, `index.html` carrega os seguintes scripts defensivos:

- `src/mobileFamilyTreeMutationPerformanceGuard.ts`
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
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`
- `src/mobileMapToolbarBackdropLayerFix.ts`

Scripts defensivos devem ser tratados como camada de transição, sempre isolados por rota e breakpoint. Quando um comportamento estabilizar, a preferência é migrar para o componente React de origem.

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
