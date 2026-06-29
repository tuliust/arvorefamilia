# Guia de componentes

> Última revisão: 2026-06-29
> Escopo: componentes relevantes para rotas e fluxos funcionais da branch `main`.
> Status: canônico.

## Home e mapas

| Componente | Papel |
|---|---|
| `Home.tsx` | orquestra carregamento de pessoas/relacionamentos, pessoa vinculada, filtros, busca, IA, curiosidades, navegação para perfil e recolhimento do painel desktop. |
| `HomeHeader.tsx` | cabeçalho da experiência de mapa. No mobile deve exibir `Árvore Familiar`. |
| `HomeMobileNav.tsx` | navegação e ações mobile da home, incluindo botão `+`, painel de visualização, filtros e ações de mapa. |
| `MobileFamilyMapToolbar.tsx` | toolbar mobile do mapa familiar; no mobile o botão `Mapa` abre a visão geral de grupos e não representa zoom real. |
| `HomeTreeSection.tsx` | área de renderização da árvore, roteamento de ações vindas do painel, preview de exportação por `exportPreview=1` e composição do toolbar de exportação em aba dedicada. |
| `DesktopTreeVisualizationPanel.tsx` | painel desktop de visualização, temas, grupos, filtros, exportação, títulos `Grupos de Familiares`/`Exportar` e ação interna de recolher. |
| `SidebarPanelTabs.tsx` | abas auxiliares do painel lateral. |
| `HomeCuriositiesDialog.tsx` | diálogo de curiosidades e perguntas assistidas na home. |
| `FirstLoginTutorial.tsx` | tutorial de primeiro acesso. |
| `FirstLoginTutorialRuntimeTweaks.tsx` | ajustes defensivos do tutorial, posicionamento de spotlight e compatibilidade mobile de árvore/linha quando aplicável. |
| `desktopTreeVisualizationPanelTextFix.ts` | camada defensiva para normalizar textos do painel quando houver mojibake remanescente no DOM. |
| `familyMapDesktopRuntimeFixes.ts` | ajustes defensivos de runtime para textos, exportação e comportamento visual dos mapas familiares desktop. |

## FamilyTree

| Componente / módulo | Papel |
|---|---|
| `FamilyTree.tsx` | componente principal de árvore com ações expostas por ref. |
| `DesktopFamilyMapView.tsx` | mapa familiar desktop por grupos, com layout posicional dos blocos de parentesco. |
| `FamilyTreeVisualCards.tsx` | cards visuais dos grupos, incluindo ordenação de pares conjugais para evitar quebra de linha desnecessária. |
| `MobileFamilyTreeView.tsx` | mapa familiar mobile por telas/grupos. |
| `DesktopFamilyHorizontalMapView.tsx` | linha geracional desktop. |
| `DesktopFamilyHorizontalMapFilteredView.tsx` | linha geracional desktop filtrada. |
| `MobileFamilyHorizontalMapView.tsx` | linha geracional mobile/horizontal, com cabeçalhos por geração, conectores e exportação. |
| `MobileFamilyHorizontalMapFilteredView.tsx` | linha geracional mobile filtrada. |
| `mobileFamilyTreeModel.ts` | modelo de parentesco mobile usado para reconhecer grupos familiares e navegação por telas. |
| `buildTreeGraph.ts` | montagem do grafo a partir de pessoas e relacionamentos, incluindo status visual de vínculos conjugais. |
| `MarriageNode.tsx` | nó conjugal com símbolo, status, tooltip e acessibilidade do vínculo. |
| `TreeConjugalStatusLegend.tsx` | legenda de status conjugais por símbolo e padrão de linha. |
| `TreeLegend.tsx` | legenda consolidada da árvore, incluindo status conjugais. |
| `treeViewMode.ts` | conversão entre rota e modo de visualização. |
| `utils/treePreferences.ts` | leitura, persistência e migração de preferências visuais; em perspectiva por `?pessoa=`, força a ocultação inicial de cônjuges colaterais. |
| `utils/treeExport.ts` | utilitários de captura, sanitização, preview, PNG, PDF, impressão e tratamento de erro da exportação da árvore. |
| `utils/exportColorSanitizer.ts` | sanitização de cores modernas não suportadas pelo `html2canvas`, incluindo fallback para funções como `oklch`. |
| `TreeAreaSelectionOverlay.tsx` | overlay de seleção de área visível da árvore, com ações de PNG, PDF, impressão, cancelamento e erro no preview. |
| `modals/AddConnectionModal.tsx` | modal de nova conexão. |
| `modals/ViewMarriageModal.tsx` | modal de detalhes de casamento, com badge, narrativa e tooltip baseados no status conjugal inferido. |

## Runtimes defensivos

| Componente / módulo | Papel |
|---|---|
| `MobileGlobalTweaks.tsx` | ajustes mobile transversais de header, overlays, `/meus-dados`, `/meus-vinculos` e painel de mapa quando aplicável. |
| `MobileTopLayerTweaks.tsx` | ajustes de camada mobile para manter painéis, busca, notificações e menu do avatar acima do canvas e de elementos sticky. |
| `LinhaGeracionalMobilePanelLayerTweaks.tsx` | isolamento de camada e comportamento do painel mobile da linha geracional. |
| `mobileFamilyMapOverviewTileVisualAdjustments.ts` | script defensivo do modal `Mapa da família`; padroniza cards, remove ícones duplicados e aplica ícones únicos por grupo no mobile. |
| `mobileFamilyMapOverviewGhostClickGuard.ts` | bloqueia ghost click após toque em botões da visão geral mobile para impedir navegação indevida para `/pessoa/:id`. |
| `mobileFamilyMapFullOverview.ts` | renderiza o `Mapa completo` mobile por modelo de nós, cards e conectores, com pan e zoom. |
| `mobileFamilyMapFullOverviewButtonGuard.ts` | reforça a ativação do botão `Exibir mapa completo` e promove a camada correta. |
| `mobileFamilyMapFullOverviewConnectorFix.ts` | normaliza conectores do mapa completo usando bordas reais de grupos/cards. |
| `mobileFamilyMapCoreConnectorFix.ts` | estabiliza conectores do núcleo do mapa familiar mobile quando necessário. |
| `mobileFamilyMapUncleSwipeNavigationGuard.ts` | guard prioritário de swipe em `window capture`; controla navegação entre tios/primos e preserva scroll com um dedo nas telas de primos. |
| `mobileFamilyMapDirectionalNavigationFix.ts` | reforça navegação direcional do mapa familiar mobile em handlers de documento. |
| `mobileFamilyTreeNavigationRules.ts` | regras auxiliares de navegação e preservação de scroll entre telas mobile. |
| `mobileFamilyMapUncleCardLimit.ts` | limita `Tios Paternos` e `Tios Maternos` a 8 cards iniciais no mobile e adiciona controle local `+`/`−`. |
| `mobileFamilyMapOverviewButtonFix.ts` | renomeia/assume a ação `Mapa`, reestrutura a visão geral de `/mapa-familiar` e navega por destino explícito. |
| `PersonProfileRuntimeTweaks.tsx` | ocultações e reposicionamentos defensivos em `/pessoa/:id`. |
| `AdminDashboardRuntimeTweaks.tsx` | ajustes defensivos do dashboard administrativo. |
| `MeusVinculosEnhancements.tsx` | ajustes progressivos de `/meus-vinculos`, incluindo ordem de seções, seletor de cônjuge/filhos e modal de pet. |

Regras:

- runtimes devem ser isolados por rota e breakpoint;
- evitar observar atributos quando o runtime altera `style`, `dataset` ou classes;
- usar `requestAnimationFrame` e `try/catch` para evitar travamento;
- migrar regra para componente de origem quando o comportamento estiver estabilizado.

## Páginas de membro

| Página | Papel |
|---|---|
| `MeusDadosWithInlineProfileBio.tsx` | composição atual de `/meus-dados`, com dados pessoais, privacidade, redes sociais, questionário e tela final de Mini Bio/Curiosidades. |
| `MeusDados.tsx` | base de dados pessoais, privacidade, redes sociais e insumos de perfil. |
| `MeusVinculosMobileShortcutsPage.tsx` | composição atual de `/meus-vinculos`, com atalhos mobile de grupos. |
| `MeusVinculos.tsx` | vínculos, familiares, pets e solicitações de alteração. |
| `ArquivosHistoricosPage.tsx` | fatos e arquivos históricos. |
| `PreferenciasPage.tsx` | preferências do membro. |
| `RevisaoDadosFlowPage.tsx` | composição atual de revisão final antes de concluir o fluxo. |
| `RevisaoDados.tsx` | revisão final antes de concluir o fluxo. |
| `PersonProfile.tsx` | perfil público/protegido da pessoa. |
| `PersonRelationshipsView.tsx` | relacionamentos do perfil, incluindo agrupamento conjugal por status. |
| `CalendarioFamiliar.tsx` | calendário familiar com categorias, eventos do mês, aniversariantes e casamentos. |
| `Curiosidades.tsx` | página de exploração de dados familiares com navegação sticky, IA, fotos, quiz, mural, gráficos, gerações, relacionamentos, rota e abas de descoberta. |
| `ForumHome.tsx` | listagem de tópicos, busca, categorias e ações principais do fórum. |
| `ForumNovoTopico.tsx` | criação de tópico com categorias, conteúdo e suporte a menções. |
| `ForumTopico.tsx` | tópico individual com card principal, respostas, campo de resposta e coluna de tópicos recentes no desktop. |

## Curiosidades

| Componente / módulo | Papel |
|---|---|
| `Curiosidades.tsx` | orquestra a página, carregando pessoas, relacionamentos e badges; define a ordem dos blocos e a composição desktop/mobile. |
| `CuriosidadesHero.tsx` | barra sticky de atalhos internos; no mobile usa rolagem horizontal com botões laterais de avançar e voltar. |
| `CuriosidadesToday.tsx` | eventos da data atual, incluindo aniversários, casamentos, falecimentos e memórias. |
| `CuriosidadesPhotoSlider.tsx` | slide de fotos principais de pessoas humanas; usa miniaturas no desktop e uma foto por vez no mobile. |
| `CuriosidadesAiSection.tsx` | perguntas em linguagem natural com contexto estruturado da árvore e sugestões rápidas. |
| `AiQuestionPanel.tsx` | painel reutilizado para campo de pergunta, envio, erro e resposta da IA. |
| `CuriosidadesQuizSection.tsx` | quiz gerado a partir dos dados da árvore, com até cinco perguntas, alternativas ampliadas, feedback animado na área das opções e resultado final consolidado. |
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

## Feedback, confirmação e modais

| Componente / recurso | Papel |
|---|---|
| `ConfirmDialog.tsx` | modal padrão para confirmações de ações destrutivas, sensíveis ou irreversíveis, substituindo `window.confirm` e `confirm`. |
| `toast` de `sonner` | feedback não bloqueante para sucesso, erro, aviso e informação, substituindo `window.alert` e `alert`. |
| `Dialog` controlado | base para fluxos que precisam coletar texto ou justificativa do usuário, substituindo `window.prompt` e `prompt`. |
| `src/app/components/ui/alert.tsx` | componente visual de UI; não é API nativa do navegador e pode aparecer como falso positivo em varreduras textuais. |

Regras de uso:

- Não introduzir `window.alert`, `alert`, `window.confirm`, `confirm`, `window.prompt` ou `prompt` em novos componentes.
- Para exclusão, remoção de vínculo, limpeza local, envio real, desconexão, aprovação/rejeição ou restauração de configuração, usar confirmação própria.
- Para textos livres, usar modal controlado com estado React, validação e ações explícitas de cancelar/confirmar.
- A confirmação deve expor `loading` quando a ação assíncrona estiver em andamento.

## Layout e navegação

- `ProtectedRoute`: protege rotas administrativas.
- `MemberRoute`: protege rotas de membro autenticado.
- `TreeAccessRoute`: protege a experiência de árvore.
- `MemberPageHeader`: cabeçalho das páginas de membro, com atalhos de navegação, busca compartilhada e menu de notificações no desktop; em `/admin/*`, usa navegação administrativa reduzida.
- `HeaderGlobalSearch`: busca compartilhada do header, com sugestões de pessoas e páginas e fallback para `/busca?q=...`.
- `HeaderNotificationsDropdown`: dropdown reutilizado por headers para listar notificações recentes, ações rápidas e atalhos para páginas de notificações e preferências.
- `UserProfileMenu`: menu de avatar e ações do usuário, com primeiro e segundo nome, subtítulo de edição de perfil, área `Perfis gerenciados` quando aplicável, atalhos de navegação, dúvidas e saída.
- Componentes de UI em `src/app/components/ui` devem permanecer genéricos e reutilizáveis.

## Componentes administrativos

| Componente / página | Papel |
|---|---|
| `AdminDashboardWithTweaks.tsx` | composição atual do dashboard administrativo com ajustes de cards, aprovações e ações rápidas. |
| `AdminDashboardRuntimeTweaks.tsx` | runtime defensivo do dashboard. |
| `AdminNotificacoes.tsx` | página administrativa de notificações, com abas de visão geral, preferências, destinatários, tipos, templates, frequência, automações, métricas e diagnóstico. |
| `adminNotificationFormatters.ts` | formatadores de labels, status, canais, tipos e categorias de notificações para evitar slugs crus na UI. |
| `AdminRelacionamentos.tsx` | listagem administrativa de casamentos e filiações, com filtros por cards, busca por pessoa e sugestões por nome. |
| `AdminAprovacoes.tsx` | página de aprovações administrativas. |
| `AdminHomeSettingsWithSaveBar.tsx` | composição atual de `/admin/home`, com salvamento das configurações. |
| `AdminRelacionamentoForm.tsx` | cadastro de vínculos com status conjugal inferido e validações de separação/inatividade. |
| `AdminResponsaveis.tsx` | gestão de responsáveis por perfis legados e crianças. |
| `AdminDuvidasRefined.tsx` | versão ativa de `/admin/duvidas`, com filtros em linha própria, listagem sem slugs visíveis e ações compactas por ícone. |
| `AdminAtividades.tsx` | histórico administrativo de atividades, com filtros por autor/usuário, botão de limpeza local da lista e tabela alinhada por Data, Autor, Atividade e Resumo. |
| `AdminPeopleContentSettings.tsx` | gestão de geração, visibilidade, privacidade e conteúdos automáticos de pessoas, com fallback defensivo quando `person_visibility_settings` não existir no ambiente remoto. |

A área administrativa está documentada em `INVENTARIO_TECNICO.md` e deve continuar protegida por `ProtectedRoute`.
