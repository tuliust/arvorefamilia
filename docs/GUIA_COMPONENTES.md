# Guia de componentes - Árvore Família

> Última atualização: 2026-06-08  
> Revisão complementar: ícones lucide, botão conjugal neutro, destaques de conectores, Genealogia/Visão Completa mobile e Calendário mobile  
> Local canônico: `docs/GUIA_COMPONENTES.md`

## Objetivo

Este documento registra os principais componentes reutilizáveis do projeto **Árvore Família**, suas responsabilidades, arquivos relacionados, padrões de uso e cuidados contra regressões.

Use este guia para:

- localizar rapidamente componentes relevantes;
- saber onde alterar UI sem mexer em regra de negócio;
- evitar duplicação de componentes;
- preservar padrões de props, layout e acessibilidade;
- orientar novos prompts de implementação.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: visão funcional consolidada;
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais e regras de layout;
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma;
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap e pós-MVP;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso;
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`: comportamento específico da view Minha Árvore;
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: regra funcional de exportação.

---

## Escopo deste guia

Este guia responde a três perguntas:

1. **qual componente alterar**;
2. **qual responsabilidade ele possui**;
3. **quais cuidados evitam regressão**.

Quando a dúvida envolver regra de negócio, Supabase, RLS, migrations ou fluxo de produto, consulte primeiro o documento funcional ou operacional correspondente. Componentes visuais não devem se tornar ponto de entrada para regras de banco.

---

## 1. Convenções gerais de componentes

### 1.1 Organização

Componentes ficam principalmente em:

```txt
src/app/components
src/app/components/ui
src/app/components/layout
src/app/components/FamilyTree
src/app/components/person
src/app/components/relationships
src/app/components/Timeline
src/app/components/favorites
src/app/components/forum
```

Páginas ficam em:

```txt
src/app/pages
src/app/pages/admin
src/app/pages/forum
src/app/pages/home
```

Services, utils e types não devem ser misturados com componentes:

```txt
src/app/services
src/app/utils
src/app/types
```

### 1.2 Regras de alteração

Ao alterar componente:

- manter props tipadas;
- evitar lógica de banco dentro de componente visual;
- usar services para Supabase quando houver persistência;
- usar utils para cálculo puro;
- não introduzir side effects em componentes de exibição;
- manter `type="button"` em botões internos que não submetem formulário;
- preservar estados de loading, erro e vazio;
- preservar acessibilidade básica: `aria-label`, foco visível, semântica e navegação por teclado;
- validar `npm run build` e `git diff --check`.

### 1.3 Padrões de estilo

- Tailwind local no JSX;
- `min-w-0` em wrappers flex/grid;
- `shrink-0` em ícones/avatares;
- `truncate` quando texto precisa caber em uma linha;
- `break-words` para conteúdo de usuário;
- `break-all` para valores técnicos;
- `w-full sm:w-auto` em botões responsivos;
- modais com `max-h` e rolagem interna.

---

## 2. Componentes de layout

### 2.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Responsabilidade:

- padronizar header de páginas internas;
- fornecer título, subtítulo, ícone e ações;
- exportar classe global de container;
- exportar ícones comuns para ações;
- renderizar o menu do usuário por meio de `UserProfileMenu`.

Exports principais:

```txt
MemberPageHeader
PAGE_CONTAINER_CLASS
HEADER_ACTION_ICONS
```

Props principais:

```txt
title: string
subtitle: string
icon: React.ComponentType
actions: HeaderAction[]
```

`HeaderAction` aceita:

```txt
label
to
onClick
icon
variant: default | primary | danger | ghost
```

Uso esperado:

- páginas internas de usuário;
- páginas internas administrativas;
- páginas que precisam seguir o padrão visual de `/minha-arvore/editar`, `/calendario-familiar`, `/notificacoes`, `/forum` e afins.

Não usar em:

- Home pós-login (`src/app/pages/Home.tsx`), que possui header próprio integrado à árvore.

Cuidados:

- não duplicar botões de navegação que já existam no conteúdo;
- manter textos curtos, pois o header trunca título/subtítulo;
- não criar novo container se `PAGE_CONTAINER_CLASS` atender;
- ações de header devem ser botões/links acessíveis e não devem quebrar texto em telas estreitas.

---

## 3. Componentes da árvore

### 3.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar React Flow;
- selecionar layout conforme view;
- gerenciar viewport inicial;
- controlar pan/zoom;
- expor ações imperativas;
- renderizar título fixo da árvore;
- integrar exportação de área;
- integrar clique em pessoa e casamento.

Props principais:

```txt
pessoas
relacionamentos
viewMode
centralPersonId
selectedPersonId
edgeFilters
directRelativeFilters
genealogyFilters
activeGenealogyGeneration
isMobile
layoutRevision
onPersonClick
onPersonView
onPersonEdit
onPersonAddConnection
onPersonRemove
onMarriageClick
```

`activeGenealogyGeneration` é usado pelas views **Genealogia** e **Visão Completa** em mobile para enquadrar/focar a geração ativa escolhida nos chips superiores. Essa prop não deve ser usada para remover as demais colunas da árvore.

`TreeViewMode` fica em:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Helpers principais:

```txt
VIEW_MODE_TO_PATH
PATH_TO_VIEW_MODE
getTreeViewModeFromPath
getPathForTreeViewMode
```

Ações expostas via `ref`:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Comportamento consolidado:

- `viewMode = minha-arvore` usa `directFamilyDistributedLayout`;
- `viewMode = genealogia` usa `genealogyColumnsLayout` com escopo pessoal;
- `viewMode = visao-completa` usa `genealogyColumnsLayout` com base completa;
- título da árvore é overlay fixo no próprio componente;
- subtítulos internos abaixo do título foram removidos/ocultados nas views da árvore;
- padding superior do título e espaço entre título e cards ainda estão em refinamento visual final;
- viewport inicial usa bounds de `personNode`;
- bounds de pan são separados dos bounds de viewport;
- Genealogia/Visão Completa usam zoom por largura;
- Genealogia infere `manual_generation` em memória a partir da pessoa central quando necessário, sem persistir no Supabase;
- Genealogia mobile inicia na primeira coluna real renderizada;
- Visão Completa mobile também usa navegação por chips de geração/bloco quando há gerações disponíveis;
- Genealogia e Visão Completa mobile usam a geração 3/Avós como referência vertical de enquadramento quando o usuário alterna chips superiores;
- em Genealogia e Visão Completa mobile, o eixo X acompanha a geração ativa, mas o eixo Y deve permanecer ancorado em `referenceBounds.y` para evitar saltos verticais entre Tataravós, Bisavós, Avós, Pais, Núcleo e Descendentes;
- em Genealogia e Visão Completa mobile, o `translateExtent` não deve impedir o usuário de arrastar a árvore para recuperar cabeçalhos/área superior;
- seleção de área bloqueia pan/zoom temporariamente.

Cuidados:

- não recolocar title nodes nos layouts;
- não usar altura total para reduzir zoom de Genealogia/Visão Completa;
- não incluir labels/group boxes/anchors no bounds visual de zoom;
- não alterar filtros sem revisar `Home.tsx`;
- não transformar `activeGenealogyGeneration` em filtro destrutivo de pessoas;
- não persistir no banco a inferência visual de gerações feita para renderização;
- não mexer em Supabase neste componente;
- não corrigir espaçamento do título usando `transform`, `translate` ou `top` negativo em `.react-flow__viewport`;
- ajustar espaçamento título-canvas preferencialmente por constantes/cálculo em `FamilyTree.tsx`, validando corte superior de cards.

---

### 3.2 Layout `directFamilyDistributedLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidade:

- posicionar a view **Minha Árvore**;
- montar pessoa central;
- agrupar parentes por lado paterno/materno;
- criar labels de grupos;
- criar group boxes;
- criar anchors estruturais;
- criar edges estruturais;
- criar marriage nodes do layout direto quando necessário.

Elementos relevantes:

```txt
directFamilyGroupBoxNode
directFamilyLabelNode
directFamilyAnchorNode
personNode
marriageNode
spouseEdge
childEdge
```

Cuidados:

- labels de grupo podem permanecer;
- título geral da árvore não deve ser criado aqui;
- group boxes e anchors não devem comandar zoom inicial;
- alteração de constantes de posição pode afetar toda a composição visual;
- validar em desktop e mobile após qualquer mudança;
- marriage nodes criados para `/minha-arvore` podem usar `visualVariant: 'direct-family'` para reforçar a legibilidade da aliança sem alterar `/genealogia`;
- cards de parentes da view direta devem manter padronização visual em torno de `340 × 136`, exceto o card da pessoa principal, salvo nova decisão de layout.

---

### 3.3 Layout `genealogyColumnsLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidade:

- posicionar **Genealogia** e **Visão Completa**;
- agrupar pessoas por `manual_generation`;
- ordenar por data de nascimento e nome;
- posicionar cônjuges;
- criar labels de geração;
- criar conectores ortogonais de família;
- criar edges conjugais com anel;
- aplicar filtros de geração;
- não criar colunas fixas vazias quando não houver cards renderizáveis;
- manter espaçamento vertical suficiente entre cônjuges para evitar sobreposição do anel.

Funções/conceitos importantes:

```txt
getGenealogyMarriageStatus
groupPeopleByGeneration
addLabelNode
appendPlacementNodes
createGenealogyFamilyConnectorNode
addGenealogySpouseEdge
genealogyColumnsLayout
```

Cuidados:

- não adicionar título/subtítulo geral da árvore;
- labels de geração são permitidas;
- altura pode exceder a viewport;
- preservar conectores entre pais e filhos;
- preservar status visual do anel de casamento;
- não reintroduzir colunas vazias apenas para manter a sequência numérica `1..6`;
- validar desktop e mobile quando alterar `manual_generation`, filtros ou agrupamento;
- `/genealogia` deve manter a variante padrão do anel conjugal, sem `visualVariant: 'direct-family'`.

---

### 3.4 `MarriageNode`

Arquivo:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
```

Tipo relacionado:

```txt
src/app/components/FamilyTree/types.ts
```

Responsabilidade:

- renderizar o botão clicável de vínculo conjugal na view `/minha-arvore`;
- exibir o ícone `Blend` de `lucide-react`, substituindo emoji/SVG customizado de alianças;
- abrir modal de vínculo conjugal por `onMarriageClick`;
- preservar handles invisíveis necessários ao ReactFlow.

Tipo de dados:

```ts
export interface MarriageNodeData {
  visualVariant?: 'default' | 'direct-family';
  details?: MarriageNodeDetails;
  onClickMarriage?: (details: MarriageNodeDetails) => void;
}
```

Padrão visual atual:

- ícone: `Blend` de `lucide-react`;
- cor do ícone: cinza/neutra (`text-slate-*` ou equivalente);
- borda do botão: cinza/neutra;
- halo/shadow: cinza suave;
- `direct-family`: usada em marriage nodes criados em `directFamilyDistributedLayout.ts` para `/minha-arvore`.

Regras da variante `direct-family`:

- reforçar legibilidade do botão conjugal sem usar laranja como padrão final;
- não alterar dimensão lógica do node;
- não alterar handles;
- não alterar edges;
- não alterar clique/modal;
- manter coerência com `GenealogySpouseEdge` em `/genealogia` e `/visao-completa`.

Cuidados:

- não voltar a usar emoji como conteúdo visual principal;
- remover resíduos como `emoji: '??'`, `💍`, `⭐` ou `✝` nos cards/nodes;
- manter `aria-label` e `title` legíveis;
- validar `/minha-arvore`, `/genealogia` e `/visao-completa` após qualquer mudança;
- preservar clique no modal conjugal e não bloquear clique dos cards próximos.

---

### 3.5 `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Responsabilidade:

- explicar elementos visuais da árvore;
- controlar filtros reais/camadas visuais quando recebe callbacks;
- renderizar modo compacto no painel lateral;
- renderizar modo expandido se necessário;
- mostrar cards, linhas, anel e cores dos grupos.

Props relevantes:

```txt
viewMode
compact
className
showTitle
personFilters
edgeFilters
directRelativeFilters
visualLineFilters
onTogglePersonFilter
onToggleEdgeFilter
onToggleDirectRelativeFilter
onToggleVisualLineFilter
```

Seções atuais:

```txt
Cards
Linhas
Camadas extras
Anel de casamento
Cores dos grupos
```

Cuidados:

- não reintroduzir descrições redundantes sem decisão de UX;
- não conectar a legenda a Supabase;
- não alterar regra do status conjugal aqui;
- se adicionar item, validar painel lateral em mobile;
- `Legendas > Linhas > Todas` deve ocultar todas as linhas estruturais, inclusive linhas de primos.

---

### 3.6 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidade:

- permitir seleção retangular de área visível da árvore;
- exportar seleção em PNG pelo botão **Salvar PNG**;
- exportar seleção em PDF pelo botão **Salvar PDF**;
- imprimir seleção;
- cancelar por botão ou `Esc`.

Props:

```txt
getTargetElement
filenameLabel
title
onClose
```

Cuidados:

- não usar para exportar árvore completa;
- não salvar arquivo no Storage;
- não criar log persistido;
- manter pan/zoom bloqueados enquanto overlay estiver aberto;
- manter `data-tree-selection-overlay="true"` para exclusão na captura.

---

### 3.7 Utils de exportação da árvore

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidade:

- gerar nome de arquivo;
- capturar elemento com `html2canvas`;
- sanitizar cores não suportadas;
- recortar canvas;
- salvar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- ignorar elementos que não devem aparecer na exportação.

Elementos ignorados:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

Cuidados:

- preservar `useCORS: true`;
- preservar `allowTaint: false`;
- manter mensagens amigáveis para erro de CORS;
- não remover sanitização de cores;
- não capturar overlay/legenda/menus.

---

### 3.8 `treeColorPalettes`

Arquivo:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
```

Responsabilidade:

- centralizar `TreeColorPalette = 'white' | 'orange' | 'brown'`;
- expor `TREE_COLOR_PALETTE_STORAGE_KEY`;
- expor `TREE_COLOR_PALETTE_CSS_VARIABLES`;
- mapear `TREE_COLOR_PALETTES`;
- validar valores persistidos com `isTreeColorPalette`;
- fornecer swatch/label/ariaLabel para os botões circulares do header.

Uso atual:

- `HomeHeader.tsx` renderiza os círculos, aplica CSS variables e persiste a escolha;
- `directFamilyColors.ts`, `visualTokens.ts`, `nodeTypes.ts` e `FamilyTree.tsx` consomem tokens/CSS variables.

Cuidados:

- não criar paleta nova sem atualizar documentação, QA visual e labels acessíveis;
- não usar paleta como regra de negócio;
- manter fallback seguro para a paleta `white`;
- preservar compatibilidade com `localStorage` inválido ou ausente.

---

## 4. Nodes e edges da árvore

Arquivos principais:

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
src/app/components/FamilyTree/DirectFamilyGroupBoxNode.tsx
src/app/components/FamilyTree/DirectFamilyAnchorNode.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/edges
```

Responsabilidades:

- `PersonNode`: card visual da pessoa;
- `DirectFamilyLabelNode`: labels de grupos/gerações;
- `DirectFamilyGroupBoxNode`: caixas visuais de agrupamento;
- `DirectFamilyAnchorNode`: pontos estruturais para edges;
- `GenealogyFamilyConnectorNode`: conectores ortogonais entre pais e filhos;
- `GenealogySpouseEdge`: linha conjugal com botão clicável nas views por geração;
- `MarriageNode`: botão conjugal clicável usado no layout direto.

Padrões recentes:

- `PersonNode` deve usar `Star` e `Cross` de `lucide-react` para nascimento e falecimento, no lugar dos emojis `⭐` e `✝`;
- `GenealogySpouseEdge` deve usar `Blend` de `lucide-react`, com estilo cinza/neutro, para o botão conjugal em `/genealogia` e `/visao-completa`;
- `MarriageNode` deve usar `Blend` de `lucide-react`, com estilo cinza/neutro, para o botão conjugal em `/minha-arvore`;
- `GenealogyFamilyConnectorNode` deve diferenciar os destaques: pais/filhos em amarelo/dourado e irmãos em azul tracejado.

Cuidados:

- nodes estruturais não devem comandar zoom inicial;
- edges devem checar se source/target estão visíveis;
- anel conjugal deve preservar clique no modal;
- observações internas não devem aparecer para usuário comum.

---

## 5. Componentes da Home

### 5.1 Componentes extraídos da Home

Pasta:

```txt
src/app/pages/home
```

Responsabilidade:

- reduzir o tamanho de `Home.tsx`;
- manter componentes visuais simples, tipados e orientados por props;
- preservar `Home.tsx` como orquestrador de estado, carregamento, filtros, IA, conexão e navegação.

Componentes principais:

```txt
HomeHeader
HomeTreeSection
HomeMobileNav
GenealogyMobileStageTabs
DirectRelationKpiGrid
DirectRelativeFilterGrid
GenealogyFilterGrid
LifeStatusKpiGrid
SidebarPanelTabs
SidebarInfoPanel
HomeCuriositiesDialog
DiscoverResultCard
ContactInfo
ConnectionDiscoveryPanel
AiQuestionPanel
```

Cuidados:

- não mover estado principal para esses componentes sem decisão explícita;
- preservar textos, labels, `aria-labels`, classes Tailwind e ordem visual;
- header e nav mobile devem receber o mesmo callback de troca de view;
- grids de filtros não devem alterar chaves de filtros nem contadores recebidos por props.

### 5.2 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidade:

- exibir nome da família e label da view atual;
- renderizar o seletor **Minha Árvore** / **Genealogia** / **Visão Completa**;
- renderizar, dentro do dropdown de views, os botões circulares de paleta visual branco, laranja e marrom;
- manter o estado local `treeColorPalette`;
- aplicar a paleta ativa no `document.documentElement` por CSS variables;
- persistir a paleta em `TREE_COLOR_PALETTE_STORAGE_KEY`;
- preservar busca expansível com sugestões de pessoas e páginas;
- renderizar `UserProfileMenu` no header da árvore com `variant="home-header"`, salvo diagnóstico que comprove código legado ainda ativo.

Regra atual de menu:

```tsx
<UserProfileMenu variant="home-header" />
```

O antigo `UserMenu` local da Home não deve ser recriado. O botão visual compacto do header da árvore deve permanecer; o painel aberto deve ser o menu compartilhado de `UserProfileMenu`. Prints recentes indicaram possível divergência visual entre o menu das views da árvore e o menu das páginas internas, portanto a implementação real deve ser conferida antes de declarar a unificação como concluída.

Cuidados:

- paleta visual não é rota, filtro ou `TreeViewMode`;
- clique em paleta não deve chamar `onTreeViewModeChange`;
- os botões de paleta devem manter `type="button"`, `aria-label` e `aria-pressed`;
- não recriar `UserMenu` local em `Home.tsx`;
- não restaurar `userMenuSlot` sem decisão explícita;
- não mover estado principal, carregamento Supabase ou filtros da árvore para o header.

### 5.3 `GenealogyMobileStageTabs`

Arquivo:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
```

Responsabilidade:

- renderizar a navegação mobile das views **Genealogia** e **Visão Completa** por gerações/blocos;
- exibir chips horizontais com labels humanos, como **Tataravós**, **Bisavós**, **Avós**, **Pais**, **Núcleo** e **Descendentes**;
- controlar seleção direta por toque/clique;
- controlar swipe lateral entre gerações;
- indicar a geração ativa;
- exibir estado vazio quando não houver gerações visíveis;
- ocupar a extensão horizontal disponível na área da árvore em mobile.

Nota de uso atual:

- o componente mantém o nome histórico `GenealogyMobileStageTabs`, mas desde o commit `c5988a9 feat: add full tree mobile stage navigation` também é usado em `/visao-completa` mobile;
- a ativação fica em `HomeTreeSection.tsx` por meio de `usesMobileGenerationStages`;
- o componente continua apenas controlando foco/enquadramento, não filtros destrutivos de nodes.

Contrato de UX:

- chips focam/enquadram a geração ativa, mas não removem as demais colunas;
- contagem numérica ao lado do label não deve ser exibida;
- barra deve preservar espaço vertical suficiente para não sobrepor labels `GERAÇÃO X`;
- em Genealogia e Visão Completa mobile, botões de zoom `+` e `-` podem ficar ocultos;
- clique em chip deve mudar o enquadramento horizontal, mas manter a régua vertical baseada em Avós/Geração 3;
- swipe nos chips não deve bloquear pan/zoom do canvas ReactFlow fora da barra;
- o `translateExtent` não deve impedir o usuário de arrastar a árvore para cima/baixo e recuperar os cabeçalhos.

---

## 6. Componentes de navegação e menu

### 6.1 `AppLink`

Arquivo:

```txt
src/app/components/AppLink.tsx
```

Responsabilidade:

- padronizar links internos do app;
- evitar inconsistência entre navegação por rota e links visuais.

Uso:

- headers;
- páginas internas;
- cards de navegação;
- botões com `to`.

Cuidados:

- ao remover import de `AppLink as Link`, confirmar se a página ainda usa `<Link>`;
- erro conhecido corrigido: `Link is not defined` em `CalendarioFamiliar.tsx`.

### 6.2 `UserProfileMenu`

Arquivo:

```txt
src/app/components/layout/UserProfileMenu.tsx
```

Responsabilidade:

- renderizar menu do usuário autenticado;
- renderizar estado de visitante quando necessário;
- exibir avatar, nome e e-mail;
- oferecer atalhos de navegação;
- condicionar acesso ao Painel Admin;
- executar logout;
- unificar o menu das páginas internas e das views da árvore.

Variantes:

```ts
variant?: 'avatar' | 'home-header'
```

- `avatar`: padrão usado nas páginas internas, com botão circular/avatar;
- `home-header`: usado nas views da árvore para manter aparência compacta no header da Home.

Comportamento desejado/consolidável:

- o painel aberto deve ser o mesmo nas duas variantes;
- a área superior com avatar, nome e e-mail é clicável;
- clique no cabeçalho redireciona usuário autenticado para `/minha-arvore/editar`;
- visitante pode ser levado para `/entrar`;
- botão `X` fecha o menu e não dispara navegação;
- item **Editar notificações** não aparece mais no menu;
- item **Atualizar perfil** continua disponível;
- **Painel Admin** aparece apenas para administradores;
- logout deve limpar estado/cache relevante antes de sair.

Itens principais:

```txt
Home
Atualizar perfil
Fórum
Calendário
Favoritos
Notificações
Painel Admin
Sair
```

Cuidados:

- manter cabeçalho clicável acessível, com foco visível;
- usar `event.stopPropagation()` no botão de fechar se necessário;
- não duplicar menu local no `Home.tsx`;
- se houver diferença visual entre menu da árvore e menu das páginas internas, confirmar se ela vem apenas da variante de botão ou de implementação duplicada;
- não usar `window.location` para navegação interna quando `navigate` resolver;
- não esconder botão admin como substituto de guard/RLS.

---

## 7. Componentes de calendário familiar

Arquivo:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Responsabilidade:

- renderizar rota `/calendario-familiar`;
- exibir grid mensal, categorias, aniversariantes e dias de falecimento;
- formatar microcopy visual de eventos sem alterar o shape de `EventoCalendarioFamiliar`;
- manter integração visual com `MemberPageHeader`.

Cuidados:

- preferir ajustes de exibição em `CalendarioFamiliar.tsx`, sem mexer em `familyDates.ts` quando a mudança for apenas visual;
- preservar filtros por categoria e contadores em `evento/eventos`;
- aniversários no grid devem usar título compacto, em peso forte, como **Aniversário de PrimeiroNome**;
- descrição de aniversário deve usar **Faz X anos** em fonte menor;
- falecimentos no grid devem usar título compacto, como **44 anos de falecimento**, com descrição **Memória de Nome Completo**;
- o card **Memória** deve usar **44 anos da morte de Nome Completo** ou **Morte de Nome Completo**;
- o seletor de mês deve manter setas em botões `type="button"` e texto centralizado entre elas;
- textos do header devem estar em UTF-8 correto: **Calendário**, **Reunião**, **Filtros do calendário**;
- no mobile, os filtros/chips superiores de categorias devem usar fonte compacta para caber em telas estreitas;
- no mobile, o card **Categorias** abaixo do calendário fica oculto; desktop/tablet podem manter o bloco de categorias;
- se a bolinha mobile não encontrar card específico de destino, o fallback deve rolar para um resumo visível, não para um elemento oculto.

---

## 8. Componentes de pessoa e edição de perfil

Documentação específica:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
```

Arquivos principais:

```txt
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusDados.tsx
src/app/components/person
src/app/services/memberProfileService.ts
src/app/utils/personFields.ts
```

Responsabilidades gerais:

- exibição e edição de dados pessoais;
- formulário de dados pessoais;
- datas e locais;
- privacidade;
- redes sociais;
- WhatsApp;
- eventos pessoais;
- grau de parentesco;
- dados gerados de astrologia/acontecimentos;
- autocomplete de endereço em formulários de contato.

Regra recente em `/minha-arvore/editar`:

- botão **Trocar Senha** aparece no card superior do perfil;
- usa o e-mail do usuário autenticado;
- chama `supabase.auth.resetPasswordForEmail`;
- exibe estado **Enviando...**;
- mostra toast de sucesso/erro;
- não altera dados da pessoa;
- não participa do fluxo de salvamento do formulário;
- não cria migration, service novo ou alteração de RLS.

Cuidados:

- perfil não deve gerar IA automaticamente;
- WhatsApp não deve revelar número se privacidade não permitir;
- botões internos em formulários devem usar `type="button"`;
- componentes visuais não devem persistir Supabase diretamente quando já existir service;
- exceções pontuais, como reset de senha via Supabase Auth na página de perfil, devem ficar documentadas.

---

## 9. Componentes de relacionamentos

Arquivos principais:

```txt
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminRelacionamentoForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/MeusVinculos.tsx
```

Responsabilidades:

- criar/editar relacionamento;
- editar dados conjugais;
- abrir modal conjugal;
- criar solicitação de vínculo para usuário comum;
- aprovar/rejeitar vínculo no admin.

Cuidados:

- usuário comum não altera relacionamento real diretamente;
- observações conjugais internas só aparecem para admin;
- modal não deve salvar antes do botão principal;
- rejeição de solicitação não altera dado real;
- arquivos de relacionamento usam `relacionamento_id`;
- anel/aliança conjugal deve continuar abrindo `ViewMarriageModal`.

---

## 10. Componentes de arquivos históricos

Arquivos principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/components/FotoUpload.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
```

Responsabilidades:

- upload;
- preview;
- download;
- remoção;
- compatibilidade com base64 legado;
- arquivos de pessoa e relacionamento;
- edição de título, ano, descrição e categoria histórica.

Cuidados:

- novos arquivos devem ir para Storage;
- preview/download não deve limpar formulário;
- botões de visualizar/baixar/remover devem usar `type="button"`;
- não apagar base64 legado automaticamente;
- não criar limpeza automática de órfãos sem auditoria;
- migration `20260522121000_add_historical_file_event_category.sql` precisa estar aplicada antes de deploy que envie `categoria_evento`.

---

## 11. Componentes de timeline

Arquivos principais:

```txt
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/pages/PersonProfile.tsx
```

Responsabilidades:

- exibir linha do tempo derivada;
- ordenar eventos;
- mostrar eventos de nascimento, falecimento, relacionamentos, filhos, arquivos e eventos pessoais;
- exibir estado vazio.

Cuidados:

- não renderizar metadata bruta;
- preservar precisão de data;
- evitar duplicação de eventos;
- edição manual fica pós-MVP.

---

## 12. Componentes de favoritos

Arquivos principais:

```txt
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/services/favoritesService.ts
```

Responsabilidades:

- favoritar pessoa;
- remover favorito;
- listar favoritos;
- filtrar/buscar favoritos;
- abrir links internos.

Cuidados:

- metadata deve ser sanitizada no service;
- botão precisa ser clicável em mobile;
- isolamento por usuário depende de RLS/service;
- expansão para outras entidades fica pós-MVP.

---

## 13. Componentes de fórum

Arquivos principais:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum
src/app/services/forumService.ts
```

Responsabilidades:

- listar tópicos;
- criar tópico;
- editar tópico;
- exibir tópico;
- respostas/comentários;
- categorias;
- ações de moderação conforme permissão.

Cuidados:

- textos de usuário precisam quebrar linha;
- editores/textareas devem funcionar em mobile;
- ações destrutivas devem ser protegidas;
- manter filtros sem overflow.

---

## 14. Componentes de notificações

Documentação específica:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Arquivos principais:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/userEngagementService.ts
src/app/services/notificationDispatchService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationScheduledService.ts
src/app/services/notificationAdminService.ts
```

Responsabilidades:

- `Notificacoes.tsx`: lista/central em cards, leitura, marcação, remoção e atalho **Personalizar Notificações**;
- `AjustarNotificacoes.tsx`: página dedicada de preferências;
- `NotificationPreferencesPanel.tsx`: toggles e salvamento de preferências;
- administração/testes;
- disparos internos/e-mail;
- logs e deduplicação.

Cuidados:

- marcar/remover sempre filtrar por `id` e `user_id`;
- admin não deve disparar massa por acidente;
- WhatsApp/push sem provider real devem retornar status não configurado;
- preferências `false` não devem ser sobrescritas por defaults;
- títulos devem usar UTF-8 correto: **Preferências** e **Notificações**.

---

## 15. Componentes administrativos

Arquivos principais:

```txt
src/app/pages/admin/AdminDashboard.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminRelacionamentoForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/admin/AdminAtividades.tsx
src/app/pages/admin/AdminIntegridade.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/pages/admin/AdminDiagnostico.tsx
src/app/pages/admin/AdminImportacao.tsx
src/app/pages/admin/AdminMigrarDados.tsx
src/app/pages/admin/AdminHomeSettings.tsx
```

Responsabilidades:

- administração de dados;
- formulários longos;
- vínculo usuário-pessoa no card **Usuários vinculados a esta pessoa**;
- diagnóstico;
- integridade;
- atividades;
- notificações;
- home pública;
- importação/migração.

Cuidados:

- rotas admin devem usar `ProtectedRoute`;
- usuário comum não deve acessar;
- tabelas podem usar scroll horizontal controlado;
- formulários precisam ser operáveis em mobile;
- vínculo usuário-pessoa depende da RPC `admin_list_profiles_for_linking`;
- não substituir falha da RPC por consulta direta insegura em `profiles`;
- ações destrutivas precisam de confirmação.

---

## 16. Componentes UI base

Pasta:

```txt
src/app/components/ui
```

Componentes comuns:

```txt
button
input
textarea
select
dialog
checkbox
switch
label
card
badge
dropdown-menu
```

Regras:

- usar componentes UI base antes de criar botão/input próprio;
- preservar variantes existentes;
- não quebrar classes responsivas;
- manter foco visível;
- não acoplar UI base a regras de negócio.

### 16.1 `SelectContent`, `DropdownMenuContent` e `DropdownMenuSubContent`

Arquivos:

```txt
src/app/components/ui/select.tsx
src/app/components/ui/dropdown-menu.tsx
```

Padrão consolidado:

```txt
z-[1000]
sideOffset = 8
```

Motivo:

- o header da árvore usa camada elevada;
- menus com `z-50` podem ficar parcialmente cobertos;
- seletor de views e menu do usuário precisam abrir integralmente acima do header.

Cuidados:

- antes de reduzir `z-index`, testar `/minha-arvore`, `/genealogia` e `/visao-completa`;
- ajustes globais impactam selects e menus de todo o app;
- se houver conflito local, preferir `className` local.

---

## 17. Estados vazios, loading e erro

Padrão esperado:

- toda página com carregamento deve ter estado de loading;
- toda consulta vazia deve ter estado vazio compreensível;
- erros devem explicar o problema sem expor stack/secrets;
- botões de retry devem existir quando fizer sentido.

Exemplos:

```txt
StateMessage em Home
ForumEmptyState no forum
Estados vazios em MeusFavoritos, Notificacoes e Timeline
```

---

## 18. Textos, acentuação e encoding

Regras:

- arquivos-fonte devem ser salvos em UTF-8;
- corrigir mojibake na origem sempre que possível;
- evitar strings escapadas visíveis como `Calend\u00e1rio`, `Prefer\u00eancias` e `Notifica\u00e7\u00f5es`;
- a camada defensiva `textEncodingRepair` não substitui correção no arquivo-fonte.

Textos validados recentemente:

```txt
Calendário
Reunião
Filtros do calendário
Preferências
Notificações
Aniversário de Fábio
Faz 60 anos
Trocar Senha
Personalizar Notificações
```

---

## 19. Checklist antes de alterar componentes críticos

Para componentes da árvore:

```bash
npm run build
npm test
git diff --check
```

Validar manualmente:

- Minha Árvore;
- Genealogia;
- Visão Completa;
- zoom `+` e `-`;
- pan/arraste;
- painel lateral;
- aba Legendas;
- seleção/exportação de área;
- modal conjugal;
- mobile.

Para componentes de formulário:

```bash
npm run build
npm test
git diff --check
```

Validar:

- salvar;
- cancelar;
- preview/download;
- rascunho;
- botões internos;
- permissões.

Para componentes admin:

- validar admin autenticado;
- validar usuário comum bloqueado;
- checar tabelas/listas em mobile;
- checar ações destrutivas;
- checar RLS quando houver service novo.

---

## 20. O que evitar

Não fazer:

- duplicar componente já existente;
- recriar `UserMenu` local no `Home.tsx`;
- colocar chamada Supabase em componente puramente visual sem necessidade documentada;
- criar title node da árvore dentro de layouts;
- usar `git add .` sem checar arquivos temporários;
- commitar backups;
- alterar migrations em ajuste visual;
- remover `AppLink` sem procurar `<Link>`;
- remover `type="button"` de botões internos;
- renderizar observações internas para usuário comum;
- salvar telefone, e-mail, URL privada, base64, token ou secret em logs/metadata;
- expandir comportamento pós-MVP dentro de ajuste de componente.

---

## 21. Arquivos de referência rápida

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/components/person
src/app/components/relationships
src/app/components/Timeline
src/app/components/favorites
src/app/components/forum
src/app/components/ui
```

---

## 22. Atualização recente - ciclo 2026-06-07

Frente documentada:

```txt
3f50694 fix: refine member navigation and page actions
```

Status: parcialmente consolidada; menu compartilhado, título/viewport e alianças ainda exigem validação visual final.

Itens documentados neste ciclo:

- `UserProfileMenu` deve atender também o header da árvore via `variant="home-header"`;
- o antigo `UserMenu` local de `Home.tsx` foi removido;
- o cabeçalho do menu do usuário ficou clicável e navega para `/minha-arvore/editar`;
- o item **Editar notificações** foi removido do menu;
- `/notificacoes` recebeu botão **Personalizar Notificações**;
- `/minha-arvore/editar` recebeu botão **Trocar Senha**;
- `CalendarioFamiliar.tsx` recebeu correções de texto e microcopy visual;
- `AjustarNotificacoes.tsx` e `NotificationPreferencesPanel.tsx` receberam correções de acentuação;
- `MarriageNode` e `GenealogySpouseEdge` passaram a usar `Blend` de `lucide-react` com estilo cinza/neutro no lugar de emoji/SVG customizado;
- `PersonNode` passou a usar `Star` e `Cross` de `lucide-react` no lugar dos emojis de nascimento/falecimento;
- destaques de linhas foram padronizados: cônjuges laranja, pais/filhos amarelo/dourado e irmãos azul tracejado;
- `/genealogia` mobile passou a alinhar o eixo Y dos chips pela referência visual de Avós/Geração 3;
- `/calendario-familiar` mobile passou a usar filtros superiores mais compactos e ocultar o card **Categorias** inferior.

Pendências relacionadas:

- confirmar se o menu da árvore abre o mesmo painel das páginas internas;
- ajustar padding superior do título e reduzir espaço título-cards em `FamilyTree.tsx`;
- validar o botão conjugal `Blend` cinza nas três views e confirmar clique/modal em browser real.
- validar pan vertical superior em `/genealogia` mobile após ajuste de `translateExtent`.

QA recomendado:

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/minha-arvore/editar
/notificacoes
/ajustar-notificacoes
```

---

## 23. Atualização recente - ciclo 2026-06-08

Frente documentada:

```txt
c5988a9 feat: add full tree mobile stage navigation
```

Status: concluída tecnicamente; build local aprovado e Vercel retornou sucesso.

Itens documentados neste ciclo:

- `/visao-completa` mobile passou a reutilizar `GenealogyMobileStageTabs`;
- `HomeTreeSection.tsx` substituiu a condição exclusiva `isGenealogyMobile` por `usesMobileGenerationStages`;
- `usesMobileGenerationStages` vale para `isMobile && (treeViewMode === 'genealogia' || treeViewMode === 'visao-completa')`;
- a prop `activeGenealogyGeneration` continua sendo foco/enquadramento, sem remover nodes ou colunas do ReactFlow;
- os botões móveis de zoom/direção podem ficar ocultos nas duas views por geração para não competir com a barra de chips;
- `/minha-arvore` não foi alterada por esta frente.

Validação registrada:

```bash
npm run build
```

Resultado: aprovado.

Anti-regressão:

- não transformar chips em filtro de pessoas;
- não reintroduzir colunas vazias;
- não alterar Supabase, migrations, RLS ou dados reais para ajuste visual;
- validar `/genealogia` e `/visao-completa` mobile nas larguras 320px, 375px, 390px e 430px;
- validar paletas `white`, `orange` e `brown`.
