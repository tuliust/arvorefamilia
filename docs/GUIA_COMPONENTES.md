# Guia de componentes

> Última revisão: 2026-06-29
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`.
> Status: canônico.

## Home e mapas

| Componente | Papel |
|---|---|
| `Home.tsx` | Orquestra carregamento de pessoas/relacionamentos, pessoa vinculada, filtros, busca, IA, curiosidades, navegação para perfil e recolhimento do painel desktop. |
| `HomeHeader.tsx` | Cabeçalho da experiência de mapa. No mobile deve exibir `Árvore Familiar`. |
| `HomeMobileNav.tsx` | Navegação e ações mobile da home, incluindo botão `+`, painel de visualização, filtros e ações de mapa. |
| `MobileFamilyMapToolbar.tsx` | Toolbar mobile do mapa familiar; no mobile o botão `Mapa` abre a visão geral de grupos e não representa zoom real. |
| `HomeTreeSection.tsx` | Área de renderização da árvore, roteamento de ações vindas do painel, preview de exportação por `exportPreview=1` e composição do toolbar de exportação em aba dedicada. |
| `DesktopTreeVisualizationPanel.tsx` | Painel desktop de visualização, temas, grupos, filtros, exportação, títulos `Grupos de Familiares`/`Exportar` e ação interna de recolher. |
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
| `mobileFamilyTreeModel.ts` | Modelo de parentesco mobile usado para reconhecer grupos familiares e navegação por telas. |
| `buildTreeGraph.ts` | Montagem do grafo a partir de pessoas e relacionamentos. |
| `MarriageNode.tsx` | Nó conjugal com símbolo, status, tooltip e acessibilidade do vínculo. |
| `TreeConjugalStatusLegend.tsx` | Legenda de status conjugais por símbolo e padrão de linha. |
| `TreeLegend.tsx` | Legenda consolidada da árvore. |
| `treeViewMode.ts` | Conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | Preferências visuais e ocultação inicial de cônjuges colaterais em perspectiva por `?pessoa=`. |
| `utils/treeExport.ts` | Captura, sanitização, preview, PNG, PDF, impressão e tratamento de erro da exportação. |
| `utils/exportColorSanitizer.ts` | Sanitização de cores modernas não suportadas pelo `html2canvas`. |
| `TreeAreaSelectionOverlay.tsx` | Seleção de área visível da árvore para exportação. |
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
- `desktopTreeVisualizationPanelTextFix.ts`
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

Regras:

- runtimes devem ser isolados por rota e breakpoint;
- evitar observar atributos quando o runtime altera `style`, `dataset` ou classes;
- usar `requestAnimationFrame` e `try/catch` para evitar travamento;
- migrar regra para componente de origem quando o comportamento estiver estabilizado.

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
