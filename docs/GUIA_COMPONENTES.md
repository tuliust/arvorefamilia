# Guia de componentes

> Última revisão: 2026-07-01
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`, incluindo layout compartilhado mobile dos mapas.
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
| `DesktopTreeVisualizationPanel.tsx` | Painel desktop de visualização, temas, grupos, filtros e exportação. |
| `SidebarPanelTabs.tsx` | Abas auxiliares do painel lateral. |
| `HomeCuriositiesDialog.tsx` | Diálogo de curiosidades e perguntas assistidas na home. |
| `FirstLoginTutorial.tsx` | Tutorial de primeiro acesso. |

## FamilyTree

| Componente / módulo | Papel |
|---|---|
| `FamilyTree.tsx` | Componente principal de árvore com ações expostas por ref. |
| `DesktopFamilyMapView.tsx` | Mapa familiar desktop por grupos. |
| `FamilyTreeVisualCards.tsx` | Cards visuais dos grupos, incluindo ordenação de pares conjugais. |
| `MobileFamilyTreeView.tsx` | Mapa familiar mobile por telas/grupos. |
| `DesktopFamilyHorizontalMapView.tsx` | Linha geracional desktop. |
| `DesktopFamilyHorizontalMapFilteredView.tsx` | Linha geracional desktop filtrada. |
| `MobileFamilyHorizontalMapView.tsx` | Linha geracional mobile/horizontal. |
| `MobileFamilyHorizontalMapFilteredView.tsx` | Linha geracional mobile filtrada. |
| `MobileFamilyMapBackdrop.tsx` | Backdrop mobile parcial ou imersivo; no modo parcial calcula limite inferior pelo menu inferior real. |
| `MobileFamilyMapContextTray.tsx` | Tray contextual dos botões `Formato`, `Cor`, `Filtros` e `Mapa`; em `/linha-geracional`, renderiza cards compactos `GERAÇÃO` numerados de 1 a 6, contadores e CTA real de mapa completo. |
| `MobileFamilyMapFullLayer.tsx` | Camada completa mobile com base branca reta e container arredondado iniciado logo abaixo da toolbar; a versão atual não renderiza botão `X` próprio. |
| `mobileFamilyTreeModel.ts` | Modelo de parentesco mobile usado para reconhecer grupos e navegação por telas. |
| `buildTreeGraph.ts` | Montagem do grafo a partir de pessoas e relacionamentos. |
| `MarriageNode.tsx` | Nó conjugal com símbolo, status, tooltip e acessibilidade do vínculo. |
| `TreeConjugalStatusLegend.tsx` | Legenda de status conjugais por símbolo e padrão de linha. |
| `TreeLegend.tsx` | Legenda consolidada da árvore. |
| `treeViewMode.ts` | Conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | Preferências visuais e ocultação inicial de cônjuges colaterais em perspectiva por `?pessoa=`. |
| `utils/treeExport.ts` | Helpers legados/compartilhados de captura e artefatos internos. |
| `utils/exportColorSanitizer.ts` | Sanitização de cores modernas não suportadas por `html2canvas`. |
| `src/app/utils/screenAreaCapture.ts` | Captura real de área visível por `getDisplayMedia`, overlay de seleção, recorte, PNG e fallback. |
| `modals/AddConnectionModal.tsx` | Modal de nova conexão. |
| `modals/ViewMarriageModal.tsx` | Modal de detalhes de casamento. |

## Runtimes React defensivos

| Componente | Papel |
|---|---|
| `MobileGlobalTweaks.tsx` | Ajustes mobile transversais de header, overlays, `/meus-dados`, `/meus-vinculos` e mapa quando aplicável. |
| `MobileTopLayerTweaks.tsx` | Ajustes de camada mobile para painéis, busca, notificações e menu do avatar. |
| `LinhaGeracionalMobilePanelLayerTweaks.tsx` | Isolamento de camada e comportamento do painel mobile da linha geracional; no layout compartilhado deve se isolar por `pathname`. |
| `FirstLoginTutorialRuntimeTweaks.tsx` | Ajustes defensivos do tutorial e compatibilidade mobile. |
| `PersonProfileRuntimeTweaks.tsx` | Ocultações e reposicionamentos defensivos em `/pessoa/:id`. |
| `AdminDashboardRuntimeTweaks.tsx` | Ajustes defensivos do dashboard administrativo. |
| `MeusVinculosEnhancements.tsx` | Ajustes progressivos de `/meus-vinculos`. |

## Scripts defensivos carregados por `index.html`

Conferir antes de alterar mobile, mapa familiar, curiosidades, tutorial ou painel desktop:

- `mobileFamilyTreeMutationPerformanceGuard.ts`
- `visualPatchB.ts`
- `firstLoginMobileTutorialFixes.ts`
- `mobileCuriositiesNavigationFix.ts`
- `mobileTreePanelViewportFix.ts`
- `staticMobileFamilyTreeScreens.ts`
- `mobileFamilyTreeScreenStateGuards.ts`
- `mobileFamilyTreeGrandparentScreens.ts`
- `mobileFamilyTreeSwipeHints.ts`
- `mobileFamilyTreeAncestorConnectorsFix.ts`
- `mobileFamilyTreeDescendantConnectorsFix.ts`
- `mobileFamilyTreeCoreDescendantConnector.ts`
- `mobileFamilyTreeGroupTitleVisibilityFix.ts`
- `mobileFamilyHorizontalZoomOverview.ts`
- `mobileFamilyMapUncleSwipeNavigationGuard.ts`
- `mobileFamilyMapOverviewGhostClickGuard.ts`
- `mobileFamilyMapOverviewButtonFix.ts`
- `mobileFamilyMapStableMobileFix.ts`
- `mobileFamilyMapDirectionalNavigationFix.ts`
- `mobileFamilyMapUncleCardLimit.ts`
- `mobileFamilyMapCoreConnectorFix.ts`
- `mobileVisualizationPanelFamilyStatsFix.ts`
- `mobileFamilyMapZoomOverviewVisualFix.ts`
- `mobileFamilyMapOverviewTileVisualAdjustments.ts`
- `mobileFamilyMapDescendantsStabilityLock.ts`
- `mobileFamilyMapDescendantConnectorHeightFix.ts`
- `mobileFamilyMapExtendedSpouseCards.ts`
- `mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `mobileFamilyMapFullOverview.ts`
- `mobileFamilyMapFullOverviewCompactFix.ts`
- `mobileFamilyMapZoomTrayHeightFix.ts`
- `mobileGenerationLineFullOverview.ts`
- `mobileFamilyMapFullOverviewConnectorFix.ts`
- `mobileFamilyMapFullOverviewButtonGuard.ts`

Scripts e seletores absorvidos pela implementação React:

- `mobileMapToolbarBackdropLayerFix.ts`, `mobileMapPanelRefinements.ts` e `mobileFamilyMapFullPanelStyleFix.ts` permanecem como neutralizados quando existirem, mas não são contratos ativos;
- `mobileFamilyMapFullOverviewButtonGuard.ts` é compatibilidade/no-op quando não concentrar regra;
- `visualPatchA.ts` não é carregado por `index.html` e não é contrato operacional.

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

## Regra de manutenção

- Novos componentes de shell, rota, toolbar ou mapa devem ser registrados neste guia.
- Novo script carregado por `index.html` deve ser listado também em `INVENTARIO_TECNICO.md` e `GUIA_IMPLEMENTACOES.md`.
- Scripts defensivos devem ser isolados por rota, breakpoint e seletor explícito.
- Comportamento estabilizado deve migrar para componente React de origem quando possível.
