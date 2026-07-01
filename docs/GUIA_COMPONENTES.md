# Guia de componentes

> Última revisão: 2026-07-01
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`.
> Status: canônico.

## Home e mapas

| Componente | Papel |
|---|---|
| `Home.tsx` | Orquestra carregamento de pessoas/relacionamentos, pessoa vinculada, filtros, busca, IA, curiosidades, navegação para perfil e recolhimento do painel desktop. |
| `HomeHeader.tsx` | Cabeçalho da experiência de mapa. No mobile deve exibir `Árvore Familiar`. |
| `HomeMobileNav.tsx` | Navegação e ações mobile da home, incluindo toolbar `Formato`/`Cor`/`Filtros`/`Mapa`/`+`, painéis inline, filtros e ações de mapa dentro da shell mobile. |
| `MobileFamilyMapToolbar.tsx` | Toolbar mobile do mapa familiar; no mobile o botão `Mapa` abre a visão geral de grupos e não representa zoom real. |
| `HomeTreeSection.tsx` | Área de renderização da árvore, roteamento de ações vindas do painel, modal de instruções de `Salvar Imagem`, captura/impressão e helpers internos de preview quando necessários. |
| `DesktopTreeVisualizationPanel.tsx` | Painel desktop de visualização, temas, grupos, filtros, seção `Exportar` com `Salvar Imagem` e `Imprimir`, títulos `Grupos de Familiares`/`Exportar` e ação interna de recolher. |
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
| `MobileFamilyMapBackdrop.tsx` | Backdrop mobile parcial ou imersivo dos painéis de mapa; no modo parcial calcula o limite inferior pelo menu inferior real e no modo imersivo cobre a shell atrás do mapa completo. |
| `MobileFamilyMapContextTray.tsx` | Tray contextual dos botões `Formato`, `Cor`, `Filtros` e `Mapa`; em `/linha-geracional`, renderiza os atalhos compactos `GER. 1` a `GER. 6` e reaproveita o CTA real de mapa completo. |
| `MobileFamilyMapFullLayer.tsx` | Camada completa mobile acima do blur imersivo, com container próprio, respeito a `safe-area` e botão `X` no canto superior direito. |
| `mobileFamilyTreeModel.ts` | Modelo de parentesco mobile usado para reconhecer grupos familiares e navegação por telas. |
| `buildTreeGraph.ts` | Montagem do grafo a partir de pessoas e relacionamentos. |
| `MarriageNode.tsx` | Nó conjugal com símbolo, status, tooltip e acessibilidade do vínculo. |
| `TreeConjugalStatusLegend.tsx` | Legenda de status conjugais por símbolo e padrão de linha. |
| `TreeLegend.tsx` | Legenda consolidada da árvore. |
| `treeViewMode.ts` | Conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | Preferências visuais e ocultação inicial de cônjuges colaterais em perspectiva por `?pessoa=`. |
| `utils/treeExport.ts` | Helpers legados/compartilhados de captura e artefatos quando usados por fluxos internos da árvore. |
| `utils/exportColorSanitizer.ts` | Sanitização de cores modernas não suportadas pelo `html2canvas`. |
| `src/app/utils/screenAreaCapture.ts` | Captura real de área visível por `getDisplayMedia`, overlay de seleção, recorte, salvamento PNG e fallback de download. |
| `modals/AddConnectionModal.tsx` | Modal de nova conexão. |
| `modals/ViewMarriageModal.tsx` | Modal de detalhes de casamento. |

## Runtimes React defensivos

| Componente | Papel |
|---|---|
| `MobileGlobalTweaks.tsx` | Ajustes mobile transversais de header, overlays, `/meus-dados`, `/meus-vinculos` e mapa quando aplicável. |
| `MobileTopLayerTweaks.tsx` | Ajustes de camada mobile para painéis, busca, notificações e menu do avatar. |
| `LinhaGeracionalMobilePanelLayerTweaks.tsx` | Isolamento de camada e comportamento do painel mobile da linha geracional. |
| `FirstLoginTutorialRuntimeTweaks.tsx` | Ajustes defensivos do tutorial, spotlight e compatibilidade mobile. |
| `PersonProfileRuntimeTweaks.tsx` | Ocultações e reposicionamentos defensivos em `/pessoa/:id`. |
| `AdminDashboardRuntimeTweaks.tsx` | Ajustes defensivos do dashboard administrativo. |
| `MeusVinculosEnhancements.tsx` | Ajustes progressivos de `/meus-vinculos`. |

## Scripts defensivos carregados por `index.html`

Esses scripts devem ser conferidos antes de alterar mobile, mapa familiar, curiosidades, tutorial ou painel desktop:

- `mobileFamilyTreeMutationPerformanceGuard.ts`
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
- `mobileFamilyMapExtendedSpouseCards.ts`
- `mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `mobileFamilyMapFullOverview.ts`
- `mobileFamilyMapFullOverviewConnectorFix.ts`
- `mobileFamilyMapFullOverviewButtonGuard.ts`
- `mobileMapToolbarBackdropLayerFix.ts`

Regras:

- runtimes devem ser isolados por rota e breakpoint;
- evitar observar atributos quando o runtime altera `style`, `dataset` ou classes;
- usar `requestAnimationFrame` e `try/catch` para evitar travamento;
- migrar regra para componente de origem quando o comportamento estiver estabilizado.

## Seletores funcionais do mapa mobile

Os seletores abaixo funcionam como contrato entre componentes React, runtimes defensivos e QA mobile. Alterações nesses atributos exigem revisar os runtimes relacionados e a documentação canônica de mapa.

| Seletor / atributo | Uso |
|---|---|
| `data-mobile-family-map-toolbar` | Identifica a toolbar mobile de mapa. |
| `data-mobile-family-map-toolbar-active` | Indica que há painel da toolbar ativo. |
| `data-mobile-family-map-toolbar-action` | Expõe a ação ativa (`formato`, `cor`, `grupos`, `zoom`/`Mapa`, etc.). |
| `data-mobile-family-map-inline-overview` | Identifica painel inline de visão geral/mapa. |
| `data-mobile-family-map-panel-mode` | Diferencia painel em modo `overview` ou `full`. |
| `data-mobile-family-full-map-button` | Identifica o CTA de mapa completo de `/mapa-familiar`. |
| `data-mobile-family-map-backdrop` | Identifica o backdrop React vigente, com valores `partial` ou `immersive`. |
| `data-mobile-family-map-context-tray` | Identifica o tray contextual React aberto por ação da toolbar. |
| `data-mobile-family-map-context-action` | Expõe a ação do tray contextual, incluindo `zoom` para o botão `Mapa`. |
| `data-mobile-family-map-context-hidden` | Preserva conteúdo original oculto para reaproveitar ações internas, como o CTA real de mapa completo. |
| `data-mobile-generation-map-compact-tray` | Identifica o tray compacto de gerações de `/linha-geracional`. |
| `data-mobile-family-map-full-layer` | Identifica a camada React de mapa completo mobile acima do blur imersivo. |
| `data-family-map-horizontal-mobile-root` | Raiz da visualização horizontal/linha geracional mobile. |
| `data-mobile-horizontal-generation` | Identifica a geração associada a cards da linha geracional mobile. |
| `data-mobile-horizontal-card` | Identifica cards contabilizados por geração na linha geracional mobile. |
| `mobile-family-map-full-overview` | Container do mapa completo mobile de `/mapa-familiar` quando renderizado por runtime de compatibilidade. |
| `mobile-generation-line-full-overview` | Container da visualização completa de `/linha-geracional` quando renderizada por runtime de compatibilidade. |
| `mobile-generation-safe-overview-overlay` | Overlay seguro do painel de gerações em implementações de transição. |

Seletores legados que não devem voltar como contrato vigente:

- `mobile-map-toolbar-panel-backdrop`;
- `data-mobile-map-toolbar-backdrop`;
- `--mobile-map-toolbar-backdrop-top`;
- `--mobile-map-toolbar-backdrop-bottom`.

Quando houver necessidade de compatibilidade com código legado, a documentação deve tratar esses seletores como histórico técnico, não como API operacional atual.

## Componentes e utilitários de exportação

| Componente / módulo | Papel |
|---|---|
| `DesktopTreeVisualizationPanel.tsx` | Expõe apenas `Salvar Imagem` e `Imprimir` na seção `Exportar` do painel desktop. |
| `SidebarPanelTabs.tsx` | Mantém as mesmas ações de exportação no painel compacto/flyout. |
| `HomeTreeSection.tsx` | Recebe ações `select-area` e `print`, abre modal de instruções, inicia captura real ou impressão limpa. |
| `AreaCaptureInstructionsDialog` | Modal local de `HomeTreeSection.tsx` com três etapas: permissão da guia, seleção da área e salvamento. |
| `screenAreaCapture.ts` | Utilitário de captura real da tela/aba, com validação de superfície, overlay de seleção, geração de PNG e salvamento. |
| `exportColorSanitizer.ts` | Sanitização de CSS moderno para fluxos internos que ainda usam `html2canvas`. |

Regras de composição:

- `Salvar Imagem` é o rótulo público da ação interna `select-area`;
- `Imagem` e `PDF` não devem aparecer como botões diretos no painel principal;
- o modal de instruções deve ser fechado antes de abrir a permissão de captura;
- botões de zoom, favorito e `?` devem ficar ocultos durante a seleção de área;
- impressão deve usar página limpa, com título e árvore centralizados em uma página.

## Páginas de membro

| Página | Papel |
|---|---|
| `MeusDadosWithInlineProfileBio.tsx` | Composição atual de `/meus-dados`, com dados pessoais, privacidade, redes sociais, questionário e tela final de Mini Bio/Curiosidades. |
| `MeusVinculosMobileShortcutsPage.tsx` | Composição atual de `/meus-vinculos`, com atalhos mobile de grupos. |
| `ArquivosHistoricosPage.tsx` | Fatos e arquivos históricos. |
| `PreferenciasPage.tsx` | Preferências do membro. |
| `RevisaoDadosFlowPage.tsx` | Revisão final antes de concluir o fluxo. |
| `PersonProfile.tsx` | Perfil individual da pessoa. |
| `CalendarioFamiliar.tsx` | Calendário familiar. |
| `Curiosidades.tsx` | Página de exploração de dados familiares. |
| `ForumHome.tsx` | Listagem de tópicos, busca e categorias. |
| `ForumNovoTopico.tsx` | Criação de tópico. |
| `ForumTopico.tsx` | Tópico individual. |

## Curiosidades

| Componente / módulo | Papel |
|---|---|
| `Curiosidades.tsx` | Orquestra a página, carregando pessoas, relacionamentos e badges. |
| `CuriosidadesHero.tsx` | Barra sticky de atalhos internos. |
| `CuriosidadesToday.tsx` | Eventos da data atual. |
| `CuriosidadesPhotoSlider.tsx` | Slide de fotos principais de pessoas humanas. |
| `CuriosidadesAiSection.tsx` | Perguntas em linguagem natural com contexto estruturado da árvore. |
| `AiQuestionPanel.tsx` | Painel reutilizado para pergunta, envio, erro e resposta da IA. |
| `CuriosidadesQuizSection.tsx` | Quiz gerado a partir dos dados da árvore. |
| `CuriosidadesMemoryWall.tsx` | Mural de lembranças. |
| `CuriosidadesRankings.tsx` | Rankings e curiosidades calculadas. |
| `CuriosidadesCharts.tsx` | Gráficos de aniversários, profissões e faixa etária. |
| `CuriosidadesGenerations.tsx` | Cards expansíveis por geração social. |
| `CuriosidadesCouples.tsx` | Métricas de uniões e bodas. |
| `CuriosidadesRouteSection.tsx` | Rota familiar editorial. |
| `CuriosidadesInsightTabs.tsx` | Abas inferiores de descoberta. |
| `ConnectionDiscoveryPanel.tsx` | Seletores para conexão entre pessoas. |
| `DiscoverMoreFlow.tsx` | Fluxo de exploração assistida. |
| `profileQuestionnaireService.ts` | Serviço de questionário e badges. |

## Feedback, confirmação e modais

| Recurso | Papel |
|---|---|
| `ConfirmDialog.tsx` | Modal padrão para confirmações de ações destrutivas, sensíveis ou irreversíveis. |
| `toast` de `sonner` | Feedback não bloqueante. |
| `Dialog` controlado | Base para fluxos que coletam texto ou justificativa. |
| `src/app/components/ui/alert.tsx` | Componente visual de UI; não é API nativa do navegador. |

Não introduzir `window.alert`, `alert`, `window.confirm`, `confirm`, `window.prompt` ou `prompt` em fluxos da aplicação.

## Layout e navegação

- `ProtectedRoute`: protege rotas administrativas.
- `MemberRoute`: protege rotas de membro autenticado.
- `TreeAccessRoute`: protege a experiência de árvore.
- `MemberPageHeader`: cabeçalho das páginas de membro.
- `HeaderGlobalSearch`: busca compartilhada do header.
- `HeaderNotificationsDropdown`: dropdown de notificações recentes.
- `UserProfileMenu`: menu de avatar e ações do usuário.
- Componentes de UI em `src/app/components/ui` devem permanecer genéricos e reutilizáveis.

## Componentes administrativos

| Componente / página | Papel |
|---|---|
| `AdminDashboardWithTweaks.tsx` | Dashboard administrativo com ajustes de cards, aprovações e ações rápidas. |
| `AdminNotificacoes.tsx` | Administração de notificações. |
| `AdminRelacionamentos.tsx` | Listagem administrativa de casamentos e filiações. |
| `AdminAprovacoes.tsx` | Aprovações administrativas. |
| `AdminHomeSettingsWithSaveBar.tsx` | Composição atual de `/admin/home`. |
| `AdminRelacionamentoForm.tsx` | Cadastro de vínculos com status conjugal inferido. |
| `AdminResponsaveis.tsx` | Gestão de responsáveis por perfis legados e crianças. |
| `AdminDuvidasRefined.tsx` | Versão ativa de `/admin/duvidas`. |
| `AdminAtividades.tsx` | Histórico administrativo de atividades. |
| `AdminPeopleContentSettings.tsx` | Gestão de geração, visibilidade, privacidade e conteúdos automáticos de pessoas. |

A área administrativa está documentada em `INVENTARIO_TECNICO.md` e deve continuar protegida por `ProtectedRoute`.
