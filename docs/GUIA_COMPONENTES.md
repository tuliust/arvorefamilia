# Guia de componentes

> Última revisão: 2026-07-03
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`, incluindo layout compartilhado mobile dos mapas, runtimes defensivos reais carregados por `index.html` e wrappers atuais.
> Status: canônico.

## Home, mapas e shell compartilhada

| Componente | Papel |
|---|---|
| `Home.tsx` | Orquestra carregamento de pessoas/relacionamentos, pessoa vinculada, filtros, busca, IA, curiosidades, navegação para perfil e painel desktop. No mobile de `/mapa-familiar`, ainda é encaixado no layout compartilhado por `MapaFamiliarSharedRoute`. |
| `src/app/pages/tree/TreeMapSharedLayout.tsx` | Layout compartilhado mobile de `/mapa-familiar` e `/linha-geracional`, com `HomeHeader`, `<Outlet />` e `HomeMobileNav` fora da área trocada. |
| `src/app/pages/tree/MobileTreeChromeContext.tsx` | Contexto de registro do chrome mobile; permite que a rota filha ativa forneça dados de header, busca e navegação. |
| `src/app/pages/tree/MapaFamiliarSharedRoute.tsx` | Adaptador transitório que encaixa `Home` dentro do layout compartilhado mobile e neutraliza header/nav duplicados do shell antigo. |
| `LinhaGeracional.tsx` | Página da linha geracional; aceita `mobileChromeMode="shared"` para usar o chrome compartilhado. |
| `HomeHeader.tsx` | Cabeçalho da experiência de mapa. No mobile deve exibir `Árvore Familiar`. |
| `HomeMobileNav.tsx` | Navegação e ações mobile dos mapas; no chrome compartilhado fica fora do `<Outlet />` e mantém toolbar `Formato`/`Cor`/`Filtros`/`Mapa`/`+`, trays, filtros e ações de mapa. |
| `MobileFamilyMapToolbar.tsx` | Toolbar mobile; o botão `Mapa` abre visão geral de grupos/gerações, não zoom direto. |
| `HomeTreeSection.tsx` | Área de renderização da árvore, ações do painel, modal de `Salvar Imagem`, captura/impressão e helpers internos. |
| `DesktopTreeVisualizationPanel.tsx` | Painel desktop de visualização, dropdown de perspectiva, paletas, grupos, filtros finais (`Todos os cônjuges`/`Apenas familiares`) e exportação; não deve bloquear `Todos os cônjuges` em perspectiva por `?pessoa=`. |
| `SidebarPanelTabs.tsx` | Abas auxiliares do painel lateral. |
| `HomeCuriositiesDialog.tsx` | Diálogo de curiosidades e perguntas assistidas na home. |
| `FirstLoginTutorial.tsx` | Tutorial de primeiro acesso; persiste a etapa corrente em `sessionStorage`, ignora alvos ausentes e usa fallback centralizado quando o spotlight não pode ser calculado. |

## FamilyTree

| Componente / módulo | Papel |
|---|---|
| `FamilyTree.tsx` | Componente principal de árvore com ações expostas por ref. |
| `DesktopFamilyMapView.tsx` | Mapa familiar desktop por grupos; define coordenadas, colunas efetivas, largura adaptativa de tios/primos e controles locais de expansão. |
| `FamilyTreeVisualCards.tsx` | Cards visuais dos grupos, incluindo ordenação de pares conjugais. |
| `MobileFamilyTreeView.tsx` | Mapa familiar mobile por telas/grupos. |
| `DesktopFamilyHorizontalMapView.tsx` | Linha geracional desktop. |
| `DesktopFamilyHorizontalMapFilteredView.tsx` | Linha geracional desktop filtrada; o escopo de pessoas visíveis deve respeitar `directRelativeFilters`, inclusive `conjuge`. |
| `MobileFamilyHorizontalMapView.tsx` | Linha geracional mobile/horizontal. |
| `MobileFamilyHorizontalMapFilteredView.tsx` | Linha geracional mobile filtrada. |
| `MobileFamilyMapBackdrop.tsx` | Backdrop mobile parcial ou imersivo; no modo parcial calcula limite inferior pelo menu inferior real. |
| `MobileFamilyMapContextTray.tsx` | Tray contextual dos botões `Formato`, `Cor`, `Filtros` e `Mapa`; em `/linha-geracional`, renderiza cards compactos `GERAÇÃO` numerados de 1 a 6, contadores e CTA real de mapa completo. |
| `MobileFamilyMapFullLayer.tsx` | Camada completa mobile com base branca reta e container arredondado iniciado logo abaixo da toolbar; a versão atual não renderiza botão `X` próprio. |
| `mobileFamilyTreeModel.ts` | Modelo de parentesco usado para reconhecer grupos, navegação por telas e relações diretas; deve evitar duplicar a mesma pessoa como `Pai` e `Mãe`. |
| `buildTreeGraph.ts` | Montagem do grafo a partir de pessoas e relacionamentos. |
| `MarriageNode.tsx` | Nó conjugal com símbolo, status, tooltip e acessibilidade do vínculo. |
| `TreeConjugalStatusLegend.tsx` | Legenda de status conjugais por símbolo e padrão de linha. |
| `TreeLegend.tsx` | Legenda consolidada da árvore. |
| `treeViewMode.ts` | Conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | Preferências visuais e defaults iniciais de filtros; não deve substituir o estado real controlado pelo painel quando o usuário altera `Todos os cônjuges`. |
| `utils/treeExport.ts` | Helpers legados/compartilhados de captura e artefatos internos. |
| `utils/exportColorSanitizer.ts` | Sanitização de cores modernas não suportadas por `html2canvas`. |
| `src/app/utils/screenAreaCapture.ts` | Captura real de área visível por `getDisplayMedia`, overlay de seleção, recorte, PNG e fallback. |
| `modals/AddConnectionModal.tsx` | Modal de nova conexão. |
| `modals/ViewMarriageModal.tsx` | Modal de detalhes de casamento. |

### Contratos recentes dos componentes desktop

- `DesktopTreeVisualizationPanel.tsx` deve usar `directRelativeFilters` reais para estado visual e clique dos filtros; não deve criar `effectiveDirectRelativeFilters` que bloqueie cônjuges em `?pessoa=`.
- `DesktopFamilyMapView.tsx` deve tratar `paternalUncles`, `maternalUncles`, `paternalCousins` e `maternalCousins` como grupos colaterais adaptativos.
- A compactação de primos deve considerar 2, 4 e 5 cards como `double` e 3 ou 6 cards como `triple`.
- Controles locais `+`/`−` dos grupos devem existir apenas quando houver ganho visual real com expansão.
- `mobileFamilyTreeModel.ts` deve privilegiar relação explícita e metadados confiáveis antes de inferências, e nunca devolver o mesmo ID para pai e mãe.

## Runtimes React defensivos

| Componente / módulo | Papel |
|---|---|
| `MobileGlobalTweaks.tsx` | Ajustes mobile transversais de header, overlays, `/meus-dados`, `/meus-vinculos` e mapa quando aplicável. |
| `MobileTopLayerTweaks.tsx` | Ajustes de camada mobile para painéis, busca, notificações e menu do avatar. |
| `LinhaGeracionalMobilePanelLayerTweaks.tsx` | Isolamento de camada e comportamento do painel mobile da linha geracional; no layout compartilhado deve se isolar por `pathname`. |
| `FirstLoginTutorialRuntimeTweaks.tsx` | Ajustes defensivos do tutorial e compatibilidade mobile. |
| `PersonProfileRuntimeTweaks.tsx` | Ocultações e reposicionamentos defensivos em `/pessoa/:id`. |
| `src/memberInteractionLayoutRuntimeFixes.ts` | Runtime transitório importado em `src/main.tsx`; bloqueia ações sociais em perspectiva memorial e ajusta layout de `/meus-dados` e do modal de pet. |
| `src/memberUiRuntimeFixes.ts` | Ajustes defensivos de UI de membro. |
| `src/familyMapDesktopRuntimeFixes.ts` | Ajustes defensivos de mapa desktop. |
| `src/mobileFamilyMapFullPanelStyleFix.ts` | Compatibilidade visual mobile importada por side effect; revisar antes de remover. |
| `AdminDashboardRuntimeTweaks.tsx` | Ajustes defensivos do dashboard administrativo quando montado por wrapper. |
| `MeusVinculosEnhancements.tsx` | Ajustes progressivos de `/meus-vinculos` quando aplicável. |

## Scripts defensivos carregados por `index.html`

Conferir antes de alterar mobile, mapa familiar, curiosidades, tutorial, notificações de header, painel desktop ou rotas administrativas:

- `src/mobileFamilyTreeMutationPerformanceGuard.ts`
- `src/adminActivityAndRelationshipRuntimeFixes.ts`
- `src/visualPatchB.ts`
- `src/meusDadosOptionalFirstAccessFix.ts`
- `src/headerNotificationsFullTextFix.ts`
- `src/personProfileHistoricalFilesSectionFix.ts`
- `src/firstLoginMobileTutorialFixes.ts`
- `src/firstLoginDesktopTutorialPlacementFix.ts`
- `src/mobileCuriositiesNavigationFix.ts`
- `src/mobileTreePanelViewportFix.ts`
- `src/staticMobileFamilyTreeScreens.ts`
- `src/mobileFamilyTreeScreenStateGuards.ts`
- `src/mobileFamilyTreeGrandparentScreens.ts`
- `src/mobileFamilyTreeSwipeHints.ts`
- `src/generationLineSwipeHintDirectionFix.ts`
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
- `src/desktopSidebarFilterButtonStateFix.ts`
- `src/horizontalHiddenSpouseConnectorFix.ts`
- `src/mobileMapToolbarRequestedBehaviorFix.ts`
- `src/mobileFamilyMapFullOverview.ts`
- `src/mobileFamilyMapFullOverviewCompactFix.ts`
- `src/mobileFamilyMapZoomTrayHeightFix.ts`
- `src/mobileGenerationLineFullOverview.ts`
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`

### Critério de uso

- Esses scripts são camada defensiva/transitória.
- Devem ser isolados por rota, breakpoint e seletor explícito.
- Não devem alterar regras de domínio, RLS, permissões ou persistência.
- Quando a regra estiver estável, migrar para componente React, serviço ou utilitário tipado.
- Scripts inexistentes ou não carregados não devem ser tratados como contrato vigente.

## Seletores funcionais do mapa mobile

| Seletor / atributo | Uso |
|---|---|
| `data-tree-map-shared-layout` | Raiz do layout compartilhado mobile de mapas. |
| `data-tree-map-shared-outlet` | Área central trocada pelo `<Outlet />`. |
| `data-tree-map-shared-content` | Marca conteúdo adaptado, como `mapa-familiar`. |
| `data-mobile-family-map-toolbar` | Identifica a toolbar mobile de mapa. |
| `data-mobile-family-map-toolbar-active` | Indica painel ativo da toolbar. |
| `data-mobile-family-map-toolbar-action` | Expõe ação ativa (`formato`, `cor`, `grupos`, `zoom`/`Mapa`). |
| `data-mobile-family-map-inline-overview` | Identifica painel inline de visão geral/mapa. |
| `data-mobile-family-map-panel-mode` | Diferencia painel `overview` ou `full`. |
| `data-mobile-family-full-map-button` | Identifica o CTA de mapa completo de `/mapa-familiar`. |
| `data-mobile-family-map-backdrop` | Identifica backdrop React parcial/imersivo. |
| `data-mobile-family-map-context-tray` | Identifica tray contextual aberto pela toolbar. |
| `data-mobile-family-map-context-action` | Expõe a ação do tray. |
| `data-mobile-family-map-context-hidden` | Preserva conteúdo original oculto para reaproveitar ações internas. |
| `data-mobile-generation-map-compact-tray` | Identifica o tray compacto de gerações. |
| `data-mobile-family-map-full-layer` | Identifica a camada React de mapa completo. |
| `data-mobile-family-map-full-flat-base` | Base branca reta atrás do container do mapa completo. |
| `data-family-map-horizontal-mobile-root` | Raiz da linha geracional mobile. |
| `data-mobile-horizontal-generation` | Geração associada a cards. |
| `data-mobile-horizontal-card` | Cards contabilizados por geração. |
| `mobile-family-map-full-overview` | Container do mapa completo mobile de `/mapa-familiar`. |
| `mobile-generation-line-full-overview` | Container da visualização completa de `/linha-geracional`. |

Seletores legados que não devem voltar como contrato vigente:

- `mobile-map-toolbar-panel-backdrop`;
- `data-mobile-map-toolbar-backdrop`;
- `--mobile-map-toolbar-backdrop-top`;
- `--mobile-map-toolbar-backdrop-bottom`.

## Componentes e utilitários de exportação

| Componente / módulo | Papel |
|---|---|
| `DesktopTreeVisualizationPanel.tsx` | Expõe `Salvar Imagem` e `Imprimir` na seção `Exportar`. |
| `SidebarPanelTabs.tsx` | Mantém as mesmas ações no painel compacto/flyout. |
| `HomeTreeSection.tsx` | Recebe ações `select-area` e `print`, abre modal de instruções e inicia captura/impressão. |
| `AreaCaptureInstructionsDialog` | Modal local de `HomeTreeSection.tsx`. |
| `screenAreaCapture.ts` | Captura real da tela/aba, overlay de seleção, PNG e salvamento. |
| `exportColorSanitizer.ts` | Sanitização de CSS moderno para fluxos que usam `html2canvas`. |

## Administração de notificações

| Componente / módulo | Papel |
|---|---|
| `AdminNotificacoes.tsx` | Página administrativa de notificações. |
| `AdminNotificationConfiguration.tsx` | Aba de configuração de tipos, conteúdo, canais, destinatários, variáveis e status. |
| `adminNotificationCatalog.ts` | Catálogo base/fallback versionado no frontend. |
| `adminNotificationCatalogRuntimeExtensions.ts` | Extensões runtime catalogadas, incluindo `first_access_welcome`, `admin_new_link_confirmed`, `trigger_user`, `specific_users` e `close_family`. |
| `adminNotificationConfigurationService.ts` | Carrega, reconcilia e salva catálogo/configurações persistidas em Supabase sem sobrescrever customizações existentes. |

A UI administrativa deve consumir preferencialmente o catálogo carregado/reconciliado pelo serviço, não apenas arrays estáticos importados diretamente.

## Regra de manutenção

- Novos componentes de shell, rota, toolbar ou mapa devem ser registrados neste guia.
- Novo script carregado por `index.html` deve ser listado também em `INVENTARIO_TECNICO.md` e `GUIA_IMPLEMENTACOES.md`.
- Novo runtime importado por `src/main.tsx` deve ser listado em `INVENTARIO_TECNICO.md`.
- Scripts defensivos devem ser isolados por rota, breakpoint e seletor explícito.
- Comportamento estabilizado deve migrar para componente React de origem quando possível.
