# Guia de componentes

> Última revisão: 2026-06-26
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`.
> Status: canônico.

## Home e mapas

| Componente | Papel |
|---|---|
| `Home.tsx` | orquestra carregamento de pessoas/relacionamentos, pessoa vinculada, filtros, busca, IA, curiosidades, navegação para perfil e recolhimento do painel desktop. |
| `HomeHeader.tsx` | cabeçalho da experiência de mapa. |
| `HomeMobileNav.tsx` | navegação e ações mobile da home. |
| `HomeTreeSection.tsx` | área de renderização da árvore. |
| `DesktopTreeVisualizationPanel.tsx` | painel desktop de visualização, temas, grupos, filtros, exportação e ação interna de recolher. |
| `SidebarPanelTabs.tsx` | abas auxiliares do painel lateral. |
| `HomeCuriositiesDialog.tsx` | diálogo de curiosidades e perguntas assistidas na home. |
| `FirstLoginTutorial.tsx` | tutorial de primeiro acesso. |
| `desktopTreeVisualizationPanelTextFix.ts` | camada defensiva para normalizar textos do painel quando houver mojibake remanescente no DOM. |
| `familyMapDesktopRuntimeFixes.ts` | ajustes defensivos de runtime para textos, exportação e comportamento visual dos mapas familiares desktop. |

## FamilyTree

| Componente / módulo | Papel |
|---|---|
| `FamilyTree.tsx` | componente principal de árvore com ações expostas por ref. |
| `DesktopFamilyMapView.tsx` | mapa familiar desktop por grupos, com layout posicional dos blocos de parentesco. |
| `FamilyTreeVisualCards.tsx` | cards visuais dos grupos, incluindo ordenação de pares conjugais para evitar quebra de linha desnecessária. |
| `MobileFamilyTreeView.tsx` | mapa familiar mobile. |
| `DesktopFamilyHorizontalMapView.tsx` | linha geracional desktop. |
| `DesktopFamilyHorizontalMapFilteredView.tsx` | linha geracional desktop filtrada. |
| `MobileFamilyHorizontalMapView.tsx` | linha geracional mobile. |
| `MobileFamilyHorizontalMapFilteredView.tsx` | linha geracional mobile filtrada. |
| `buildTreeGraph.ts` | montagem do grafo a partir de pessoas e relacionamentos. |
| `treeViewMode.ts` | conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | leitura, persistência e migração de preferências visuais. |
| `modals/AddConnectionModal.tsx` | modal de nova conexão. |
| `modals/ViewMarriageModal.tsx` | modal de detalhes de casamento. |

## Páginas de membro

| Página | Papel |
|---|---|
| `MeusDados.tsx` | dados pessoais, privacidade, redes sociais e insumos de perfil. |
| `MeusVinculosWithProfileBio.tsx` | vínculos, familiares, pets e textos de perfil. |
| `ArquivosHistoricosPage.tsx` | fatos e arquivos históricos. |
| `PreferenciasPage.tsx` | preferências do membro. |
| `RevisaoDados.tsx` | revisão final antes de concluir o fluxo. |
| `PersonProfile.tsx` | perfil público/protegido da pessoa. |
| `Curiosidades.tsx` | página de exploração de dados familiares com navegação sticky, IA, fotos, quiz, mural, gráficos, gerações, relacionamentos, rota e abas de descoberta. |

## Curiosidades

| Componente / módulo | Papel |
|---|---|
| `Curiosidades.tsx` | orquestra a página, carregando pessoas, relacionamentos e badges; define a ordem dos blocos e a composição desktop/mobile. |
| `CuriosidadesHero.tsx` | barra sticky de atalhos internos; no mobile usa rolagem horizontal com botões laterais de avançar e voltar. |
| `CuriosidadesToday.tsx` | eventos da data atual, incluindo aniversários, casamentos, falecimentos e memórias. |
| `CuriosidadesPhotoSlider.tsx` | slide de fotos principais de pessoas humanas; usa miniaturas no desktop e uma foto por vez no mobile. |
| `CuriosidadesAiSection.tsx` | perguntas em linguagem natural com contexto estruturado da árvore e sugestões rápidas. |
| `AiQuestionPanel.tsx` | painel reutilizado para campo de pergunta, envio, erro e resposta da IA. |
| `CuriosidadesQuizSection.tsx` | quiz gerado a partir dos dados da árvore, com etapas compactas, alternativas variadas e desambiguação de homônimos. |
| `CuriosidadesMemoryWall.tsx` | mural de lembranças com autor derivado do usuário logado, limite de 200 caracteres e exclusão restrita ao autor. |
| `CuriosidadesRankings.tsx` | rankings e curiosidades calculadas a partir dos dados familiares. |
| `CuriosidadesCharts.tsx` | gráficos de aniversários por mês, profissões mais comuns e faixa etária. |
| `CuriosidadesGenerations.tsx` | cards expansíveis por geração social, com primeira geração aberta inicialmente, contador por categoria e usuários apenas na expansão. |
| `CuriosidadesCouples.tsx` | card de Relacionamentos, com métricas de Uniões, Média, Faixa e lista de bodas. |
| `CuriosidadesRouteSection.tsx` | rota familiar editorial com distância total, pins, linha pontilhada, badges de distância e chegada. |
| `CuriosidadesInsightTabs.tsx` | card inferior com abas de descoberta, conexão, comparação de interesses e astrologia. |
| `CuriosidadesConnectionSection.tsx` | monta a seção de descoberta de conexões entre duas pessoas sem placeholder com ID vazio. |
| `ConnectionDiscoveryPanel.tsx` | renderiza seletores Radix para conexão entre pessoas, filtrando itens sem ID ou nome. |
| `CuriosidadesDiscoverySection.tsx` | seção `Descubra mais sobre...` com seleção explícita de pessoa e tópicos. |
| `DiscoverMoreFlow.tsx` | fluxo de exploração assistida usado pela seção de descoberta, com placeholder `Selecione`. |
| `CuriosidadesInterestsSection.tsx` | comparação de interesses a partir de dados de perfil e badges do questionário, com pluralização correta de pontos em comum. |
| `CuriosidadesAstrology.tsx` | visão astrológica e signos mais comuns da família. |
| `curiosidadesUtils.ts` | utilitários de datas, rankings, gráficos, quiz, gerações, bodas, eventos e badges. |
| `profileQuestionnaireService.ts` | serviço de questionário de perfil, com RPC de badges e fallback quando a RPC não estiver disponível. |

## Layout e navegação

- `ProtectedRoute`: protege rotas administrativas.
- `MemberRoute`: protege rotas de membro autenticado.
- `TreeAccessRoute`: protege a experiência de árvore.
- `MemberPageHeader`: cabeçalho das páginas de membro, com atalhos de navegação, busca compartilhada e menu de notificações no desktop.
- `HeaderGlobalSearch`: busca compartilhada do header, com sugestões de pessoas e páginas e fallback para `/busca?q=...`.
- `HeaderNotificationsDropdown`: dropdown reutilizado por headers para listar notificações recentes, ações rápidas e atalhos para páginas de notificações e preferências.
- `UserProfileMenu`: menu de avatar e ações do usuário.
- Componentes de UI em `src/app/components/ui` devem permanecer genéricos e reutilizáveis.

## Componentes administrativos

| Componente / página | Papel |
|---|---|
| `AdminDuvidasRefined.tsx` | versão ativa de `/admin/duvidas`, com filtros em linha própria, listagem sem slugs visíveis e ações compactas por ícone. |
| `AdminAtividades.tsx` | histórico administrativo de atividades, com filtros por autor/usuário, botão de limpeza local da lista e tabela alinhada por Data, Autor, Atividade e Resumo. |
| `AdminPeopleContentSettings.tsx` | gestão de geração, visibilidade e conteúdos automáticos de pessoas, com fallback defensivo quando `person_visibility_settings` não existir no ambiente remoto. |

A área administrativa está documentada em `INVENTARIO_TECNICO.md` e deve continuar protegida por `ProtectedRoute`.
