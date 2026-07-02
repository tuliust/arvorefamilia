# Inventário técnico

> Última revisão: 2026-07-01
> Escopo: rotas, módulos, documentos finais e referências técnicas preservadas após limpeza documental, ajustes mobile/admin e layout compartilhado mobile de mapas de 2026-07-01.
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
| Notificações administrativas | `funcionalidades/NOTIFICACOES_ADMIN.md` |
| Funcionalidades complementares | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |
| Configurações públicas | `admin-home-configuracoes-publicas.md` |

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
- `historico/REVISAO_DOCUMENTACAO_MAPA_MOBILE_20260701.md`

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

## Layout compartilhado mobile dos mapas

| Arquivo | Responsabilidade |
|---|---|
| `src/app/pages/tree/TreeMapSharedLayout.tsx` | Shell compartilhado mobile de `/mapa-familiar` e `/linha-geracional`; renderiza `HomeHeader`, `<Outlet />` e `HomeMobileNav`. |
| `src/app/pages/tree/MobileTreeChromeContext.tsx` | Registro dos dados de chrome fornecidos pela rota filha ativa. |
| `src/app/pages/tree/MapaFamiliarSharedRoute.tsx` | Adaptador transitório para renderizar `Home` dentro do layout compartilhado sem duplicar header/nav no mobile. |
| `src/app/pages/LinhaGeracional.tsx` | Aceita `mobileChromeMode="shared"` para operar dentro do layout comum. |
| `src/app/routes.tsx` | Declara `/mapa-familiar` e `/linha-geracional` como filhas de `TreeMapSharedLayout`. |

Essa arquitetura é mobile-first. Desktop continua sendo responsabilidade das páginas originais e da shell `Home` quando aplicável.

## Primeiro acesso: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Dados pessoais e questionário `Sobre Mim` | `src/app/pages/MeusDados.tsx`, `src/app/pages/MeusDadosWithInlineProfileBio.tsx` |
| Vínculos, pets, cônjuges e rascunhos | `src/app/pages/MeusVinculos.tsx`, `src/app/pages/MeusVinculosWithProfileBio.tsx`, `src/app/pages/MeusVinculosMobileShortcutsPage.tsx` |
| Modal de pet | `src/app/pages/meus-vinculos/MeusVinculosPetEditorPortal.tsx` |
| Fatos e arquivos históricos | `src/app/components/ArquivosHistoricos.tsx`, `src/app/pages/ArquivosHistoricosPage.tsx` |
| Revisão final | `src/app/pages/RevisaoDados.tsx`, `src/app/pages/RevisaoDadosFlowPage.tsx` |
| Guards | `src/app/components/MemberRoute.tsx`, `src/app/components/TreeAccessRoute.tsx`, `src/app/services/memberProfileService.ts` |

## Notificações administrativas: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Painel administrativo | `src/app/pages/admin/AdminNotificacoes.tsx` |
| Configuração | `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx` |
| Formatadores | `src/app/components/admin/notifications/adminNotificationFormatters.ts` |
| Catálogo base | `src/app/constants/adminNotificationCatalog.ts` |
| Persistência | `src/app/services/adminNotificationConfigurationService.ts` |
| Destinatários | `src/app/services/notificationRecipientsService.ts` |
| Primeiro acesso ao mapa | `src/app/services/firstMapWelcomeNotificationService.ts`, `src/app/components/TreeAccessRoute.tsx` |
| Dispatch | `src/app/services/notificationDispatchService.ts`, `src/app/services/notificationAdminService.ts`, `src/app/services/notificationScheduledService.ts` |
| Header/dropdown | `src/app/components/layout/HeaderNotificationsDropdown.tsx` |

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

## Mapa mobile: componentes React vigentes

| Arquivo | Responsabilidade |
|---|---|
| `src/app/pages/home/HomeMobileNav.tsx` | Centraliza estado dos botões `Formato`, `Cor`, `Filtros`, `Mapa` e `+`; no chrome compartilhado fica fora do `<Outlet />`. |
| `src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx` | Toolbar mobile; `Mapa` abre visão geral. |
| `src/app/components/FamilyTree/MobileFamilyMapBackdrop.tsx` | Backdrop React parcial/imersivo. |
| `src/app/components/FamilyTree/MobileFamilyMapContextTray.tsx` | Tray contextual; em `/linha-geracional`, cards compactos `GERAÇÃO` numerados de 1 a 6. |
| `src/app/components/FamilyTree/MobileFamilyMapFullLayer.tsx` | Camada de mapa completo com base branca reta e container arredondado abaixo da toolbar; sem botão `X` próprio. |
| `src/mobileFamilyMapFullOverview.ts` | Runtime de compatibilidade do mapa completo de `/mapa-familiar`. |
| `src/mobileGenerationLineFullOverview.ts` | Runtime da visualização completa de `/linha-geracional`. |
| `src/mobileFamilyMapFullOverviewConnectorFix.ts` | Refinamentos de conectores do mapa completo. |
| `src/mobileFamilyMapFilterButtonsBehaviorFix.ts` | Comportamento defensivo dos filtros mobile. |

## Scripts carregados por `index.html`

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
- `src/mobileFamilyMapDescendantConnectorHeightFix.ts`
- `src/mobileFamilyMapExtendedSpouseCards.ts`
- `src/mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `src/mobileFamilyMapFullOverview.ts`
- `src/mobileFamilyMapFullOverviewCompactFix.ts`
- `src/mobileFamilyMapZoomTrayHeightFix.ts`
- `src/mobileGenerationLineFullOverview.ts`
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`

## Scripts neutralizados, removidos ou absorvidos

| Arquivo | Situação documental |
|---|---|
| `src/mobileMapPanelRefinements.ts` | Não é contrato vigente se vazio ou não carregado. |
| `src/mobileMapToolbarBackdropLayerFix.ts` | Não é contrato vigente se vazio ou não carregado. |
| `src/mobileFamilyMapFullPanelStyleFix.ts` | Não é contrato vigente se vazio ou não carregado. |
| `src/mobileFamilyMapFullOverviewButtonGuard.ts` | Se estiver carregado mas vazio, é compatibilidade/no-op. |
| `src/desktopTreeVisualizationPanelTextFix.ts` | Não listar como ativo quando a correção textual já estiver no componente de origem. |
| `src/visualPatchA.ts` | Se existir sem carregamento, tratar como resíduo técnico. |

## Regra de manutenção do inventário

Atualizar este arquivo sempre que houver nova rota, layout, guard, serviço, tabela, migration, runtime carregado por `index.html`, neutralização/remoção de runtime ou mudança no contrato de `/admin/notificacoes`.
