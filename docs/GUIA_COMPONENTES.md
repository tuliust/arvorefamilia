# Guia de componentes

> Última revisão: 2026-06-23
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`.
> Status: canônico.

## Home e mapas

| Componente | Papel |
|---|---|
| `Home.tsx` | orquestra carregamento de pessoas/relacionamentos, pessoa vinculada, filtros, busca, IA, curiosidades e navegação para perfil. |
| `HomeHeader.tsx` | cabeçalho da experiência de mapa. |
| `HomeMobileNav.tsx` | navegação e ações mobile da home. |
| `HomeTreeSection.tsx` | área de renderização da árvore. |
| `DesktopTreeVisualizationPanel.tsx` | painel desktop de visualização, temas, grupos, filtros e exportação. |
| `SidebarPanelTabs.tsx` | abas auxiliares do painel lateral. |
| `HomeCuriositiesDialog.tsx` | diálogo de curiosidades e perguntas assistidas na home. |
| `FirstLoginTutorial.tsx` | tutorial de primeiro acesso. |

## FamilyTree

| Componente / módulo | Papel |
|---|---|
| `FamilyTree.tsx` | componente principal de árvore com ações expostas por ref. |
| `DesktopFamilyMapView.tsx` | mapa familiar desktop por grupos. |
| `MobileFamilyTreeView.tsx` | mapa familiar mobile. |
| `DesktopFamilyHorizontalMapView.tsx` | linha geracional desktop. |
| `DesktopFamilyHorizontalMapFilteredView.tsx` | linha geracional desktop filtrada. |
| `MobileFamilyHorizontalMapView.tsx` | linha geracional mobile. |
| `MobileFamilyHorizontalMapFilteredView.tsx` | linha geracional mobile filtrada. |
| `buildTreeGraph.ts` | montagem do grafo a partir de pessoas e relacionamentos. |
| `treeViewMode.ts` | conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | leitura, persistência e migração de preferências visuais. |
| `layouts/*` | algoritmos de distribuição e escopo direto da família. |
| `modals/AddConnectionModal.tsx` | modal de nova conexão. |
| `modals/ViewMarriageModal.tsx` | modal de detalhes de casamento. |

## Páginas de membro

| Página | Papel |
|---|---|
| `MeusDados.tsx` | dados pessoais, privacidade e insumos de perfil. |
| `MeusVinculosWithProfileBio.tsx` | vínculos, familiares, pets e textos de perfil. |
| `ArquivosHistoricosPage.tsx` | fatos e arquivos históricos. |
| `PreferenciasPage.tsx` | preferências do membro. |
| `RevisaoDados.tsx` | revisão final antes de concluir o fluxo. |
| `PersonProfile.tsx` | perfil público/protegido da pessoa. |
| `Curiosidades.tsx` | exploração de estatísticas e narrativas da árvore. |

## Layout e navegação

- `ProtectedRoute`: protege rotas administrativas.
- `MemberRoute`: protege rotas de membro autenticado.
- `TreeAccessRoute`: protege a experiência de árvore.
- `UserProfileMenu`: menu de avatar e ações do usuário.
- Componentes de UI em `src/app/components/ui` devem permanecer genéricos e reutilizáveis.

## Componentes administrativos

A área administrativa está documentada em `INVENTARIO_TECNICO.md` e deve continuar protegida por `ProtectedRoute`.
