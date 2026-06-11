# Guia de componentes - Árvore Família

> Última atualização: 2026-06-11
> Local canônico: `docs/GUIA_COMPONENTES.md`
> Projeto: `tuliust/arvorefamilia`
> Status: guia canônico atualizado com `MobileFamilyTreeView`, `DesktopFamilyMapView`, `FamilyTreeVisualCards`, Mapa Familiar, regras de cônjuges, avatares por `genero`, cards mobile com anos, card central sem badge e conectores mobile em contexto rolável.

## Objetivo

Este documento identifica os principais componentes reutilizáveis do projeto **Árvore Família**, suas responsabilidades, arquivos relacionados e cuidados contra regressões.

Use este guia para decidir **qual componente alterar** antes de editar UI, layout, responsividade ou padrões de interação.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventário consolidado das funcionalidades;
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais e padrões de layout;
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations, Supabase e operação;
- `docs/funcionalidades/*.md`: comportamento detalhado por funcionalidade.
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`: documentação canônica da view panorâmica `/mapa-familiar`.

---

## Nota de verificação contra o código atual

Esta revisão consolida duas frentes diferentes da árvore, que não devem ser confundidas:

1. **Minha Árvore mobile segmentada**: implementada em `MobileFamilyTreeView.tsx`, com malha 3×3, abas **Paterno | Central | Materno**, tela global de ancestrais, tios laterais, primos abaixo dos tios, conectores HTML/CSS e preview durante swipe.
2. **Mapa Familiar desktop/tablet**: implementado em `DesktopFamilyMapView.tsx`, na rota `/mapa-familiar`, com composição HTML/CSS/SVG própria, sem ReactFlow, layout centralizado em `FAMILY_MAP_LAYOUT`, conectores por âncoras, grupos expansíveis, zoom com `Ctrl + scroll`, cards visuais compartilhados, modo wide quando o painel lateral é colapsado e regras próprias de cônjuges.

Estado confirmado/esperado da frente atual:

- `/minha-arvore` desktop/tablet continua usando `FamilyTree`/ReactFlow e `directFamilyDistributedLayout.ts`.
- `/minha-arvore` mobile usa `MobileFamilyTreeView.tsx`.
- `/mapa-familiar` desktop/tablet usa `DesktopFamilyMapView.tsx`.
- `/mapa-familiar` mobile usa `MobileFamilyTreeView.tsx` como fallback seguro.
- `DesktopFamilyMapView.tsx` não deve ser movido para dentro de `FamilyTree.tsx`.
- `DesktopFamilyMapView.tsx` usa `buildMobileFamilyTreeModel` como base de composição, mas possui layout visual próprio.
- O Mapa Familiar tem grupos por tipo: ancestrais, laterais numerosos, centrais pequenos, descendentes, pets e cards diretos.
- Tios e primos laterais usam até 4 colunas, limite inicial de 8 cards e expansão via botão `+/-`.
- Quando o painel lateral é colapsado, o Mapa Familiar usa layout wide: o canvas deve permanecer centralizado, com margens paterna/materna equivalentes e sem sobreposição entre `Cônjuge`, `Pets`, `Irmãos` e `Sobrinhos`.
- Demais grupos usam regras específicas de largura, colunas e expansão.
- Cônjuge da pessoa central permanece visível quando existir.
- Cônjuges de tataravós, bisavós e avós aparecem por padrão.
- Cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**.
- A coluna `pessoas.genero` passa a orientar avatares do Mapa Familiar e do fallback mobile compartilhado: `homem`, `mulher` e `pet`.
- `MobileFamilyTreeView` reutiliza dados/avatares visuais de `FamilyTreeVisualCards.tsx` para manter consistência entre Minha Árvore mobile e Mapa Familiar mobile.
- Cards mobile exibem apenas anos nas linhas vitais, sem local/cidade/UF.
- O card principal mobile não exibe badge **VOCÊ**; labels como **PAI** e **MÃE** permanecem.
- Conectores de avós → Pai/Mãe na tela Central mobile devem acompanhar o scroll dos cards.
- Se `genero` tiver sido criada manualmente no Supabase, a migration e a tipagem de `Pessoa` precisam ser conferidas.

Regra documental desta revisão:

```txt
Documentar como implementado apenas o que pertence à view atual; intenções futuras ou ajustes visuais ainda não validados devem permanecer como backlog explícito.
```

---

## 1. Convenções gerais

### 1.1 Organização

| Área | Caminho |
|---|---|
| Componentes gerais | `src/app/components/` |
| UI base | `src/app/components/ui/` |
| Layout/header/menu | `src/app/components/layout/` |
| Árvore | `src/app/components/FamilyTree/` |
| Árvore mobile segmentada | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Pessoa/perfil | `src/app/components/person/` |
| Relacionamentos | `src/app/components/relationships/` |
| Timeline | `src/app/components/Timeline/` |
| Favoritos | `src/app/components/favorites/` |
| Páginas da Home pós-login | `src/app/pages/home/` |
| Fórum | `src/app/pages/forum/` e services relacionados |
| Estilos globais complementares | `src/styles/` |

Services, utils e types devem permanecer fora de componentes visuais:

```txt
src/app/services/
src/app/utils/
src/app/types/
```

### 1.2 Regras de alteração

Ao alterar componente:

- manter props tipadas;
- não inserir lógica de banco em componente visual;
- usar `services` para Supabase;
- usar `utils` para cálculo puro;
- preservar loading, erro e estado vazio;
- usar `type="button"` em botões internos que não submetem formulário;
- preservar `aria-label`, foco visível e navegação básica por teclado;
- validar `npm run build` e `git diff --check`.

### 1.3 Padrões visuais

- `min-w-0` em wrappers flex/grid;
- `shrink-0` em ícones e avatares;
- `truncate` quando o texto precisa ficar em uma linha;
- evitar `truncate` em cards de árvore quando houver espaço para quebra de linha útil;
- `break-words` para conteúdo de usuário;
- `break-all` para valores técnicos longos;
- `w-full sm:w-auto` em botões responsivos;
- modais com altura máxima e rolagem interna;
- CSS mobile específico deve ser escopado por seletor confiável;
- conectores HTML/CSS do layout mobile segmentado devem ser documentados separadamente dos edges ReactFlow.

---

## 2. Layout, header e menu

### 2.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Exports principais:

```txt
MemberPageHeader
PAGE_CONTAINER_CLASS
HEADER_ACTION_ICONS
```

Responsabilidade:

- padronizar headers de páginas internas;
- renderizar título, subtítulo, ícone e ações;
- exportar `PAGE_CONTAINER_CLASS`;
- renderizar `UserProfileMenu` padrão;
- renderizar navegação inferior mobile fixa.

Props relevantes:

```txt
title
subtitle
icon
actions
customActions
mobileCustomActions
className
```

`HeaderAction` aceita:

```txt
label
to
onClick
icon
variant: default | primary | danger | ghost
responsiveLabel: always | lg | xl | never
disabled
```

Cuidados:

- não usar em `src/app/pages/Home.tsx`, que possui `HomeHeader`;
- não criar container divergente quando `PAGE_CONTAINER_CLASS` atender;
- manter textos curtos porque título/subtítulo truncam em telas estreitas;
- ações devem ser links/botões acessíveis;
- preservar `MemberMobileBottomNav` em mobile.

### 2.2 `UserProfileMenu`

Arquivo:

```txt
src/app/components/layout/UserProfileMenu.tsx
```

Variantes:

```txt
avatar
home-header
```

Responsabilidade:

- exibir botão de menu do usuário;
- carregar dados do perfil, pessoa vinculada e status admin;
- abrir painel compartilhado de navegação;
- direcionar o cabeçalho do painel para `/minha-arvore/editar`;
- limpar cache da árvore no logout.

Comportamento consolidado:

- páginas internas usam `UserProfileMenu` padrão;
- o header da árvore usa `UserProfileMenu variant="home-header"`;
- o menu mobile inclui bloco de troca de view da árvore;
- o item **Editar notificações** não existe mais;
- **Painel Admin** aparece apenas para administradores;
- **Sair** executa logout e limpa `treeDataCache`.

Cuidados:

- não recriar dropdown local dentro de `Home.tsx`;
- não fazer o botão de fechar navegar para perfil;
- preservar fechamento por clique fora e `Escape`;
- não expor rota admin para usuário comum apenas por ocultação visual.

### 2.3 `MobileUserMenuPalettePortal`

Arquivo:

```txt
src/app/components/layout/MobileUserMenuPalettePortal.tsx
```

Montagem:

```txt
src/main.tsx
```

Estilo relacionado:

```txt
src/styles/mobile-tree-controls.css
```

Responsabilidade:

- detectar quando o menu mobile do usuário está aberto;
- exibir linha compacta **Cores da árvore**;
- renderizar botões circulares das paletas `white`, `orange`, `brown` e `visual`;
- aplicar CSS variables da paleta em `document.documentElement`;
- persistir a escolha em `localStorage`.

Cuidados:

- deve aparecer apenas em mobile;
- não deve alterar rota, filtros, dados, Supabase, permissões ou sessão;
- não deve substituir o seletor de paleta do `HomeHeader` em desktop/tablet;
- deve usar as mesmas chaves e tokens definidos em `treeColorPalettes.ts`;
- se o menu mobile mudar estrutura/label de fechamento, validar detecção do portal.

### 2.4 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidade:

- header específico das views da árvore;
- seletor de view: `/minha-arvore`, `/mapa-familiar`, `/genealogia`, `/visao-completa`;
- seletor de paletas `white`, `orange`, `brown`;
- busca expansível por pessoa e página;
- atalhos para curiosidades, fórum e calendário;
- menu compacto do usuário;
- título mobile personalizado por pessoa vinculada quando aplicável.

Arquivos relacionados:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
```

Cuidados:

- preservar search params, especialmente `?pessoa=...`;
- troca de paleta só altera CSS variables e `localStorage`;
- não alterar rota, dados, filtros, permissões ou Supabase ao trocar paleta;
- manter sugestões de busca acima da árvore;
- garantir estado React para `treeColorPalette` antes de renderizar botões de paleta;
- não reintroduzir `UserMenu` local legado.

---

## 3. Árvore familiar

### 3.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar React Flow;
- selecionar layout por `viewMode`;
- calcular viewport inicial;
- controlar pan/zoom;
- expor ações imperativas;
- renderizar título fixo da árvore;
- integrar seleção/exportação de área;
- integrar clique em pessoa e em relacionamento conjugal.

Props principais:

```txt
pessoas
relacionamentos
visiblePersonIds
viewMode
centralPersonId
selectedPersonId
edgeFilters
directRelativeFilters
genealogyFilters
visualLineFilters
activeGenealogyGeneration
isMobile
layoutRevision
onPersonClick
onPersonView
onPersonEdit
onPersonAddConnection
onPersonRemove
onMarriageClick
onDirectRelationRenderedCounts
```

Ações expostas via ref:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Comportamento por view:

| `viewMode` | Layout |
|---|---|
| `minha-arvore` | `directFamilyDistributedLayout` |
| `genealogia` | `genealogyColumnsLayout` com escopo pessoal |
| `visao-completa` | `genealogyColumnsLayout` com base completa |

Cuidados:

- não recolocar título geral dentro dos layouts;
- não usar `transform`, `translate` ou `top` negativo em `.react-flow__viewport` para resolver espaçamento;
- não persistir no Supabase a inferência visual de gerações;
- não transformar `activeGenealogyGeneration` em filtro destrutivo;
- não misturar pan/zoom do React Flow com scroll externo da página;
- seleção de área deve bloquear pan/zoom temporariamente.

### 3.2 `MobileTreeControlsPortal`

Arquivo:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
```

Montagem:

```txt
src/main.tsx
```

Estilo relacionado:

```txt
src/styles/mobile-tree-controls.css
```

Responsabilidade:

- renderizar botão circular de controles da árvore em mobile;
- abrir painel compacto nas rotas de árvore;
- oferecer ações rápidas de zoom, reajuste, ocultar/exibir setas, PDF, imagem e impressão;
- reutilizar o fluxo canônico de `treeExport.ts` para captura, PNG/imagem, PDF e impressão;
- fechar o painel após exportação bem-sucedida;
- esconder visualmente os botões antigos `+` e `-` no mobile;
- controlar classe global para ocultar/exibir setas de navegação;
- manter desktop/tablet fora do escopo.

Rotas onde aparece:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Cuidados:

- não deve aparecer em páginas internas como `/minha-arvore/editar`, `/meus-favoritos` ou `/calendario-familiar`;
- ações devem manter `aria-label`/texto acessível;
- se exportação falhar por CORS/canvas, revisar `treeExport.ts`, elementos ignorados e origem das imagens;
- não reintroduzir import direto de `html2canvas` ou `jsPDF` no portal mobile;
- se a implementação for migrada para dentro de `FamilyTree`, remover o portal e atualizar esta seção;
- não usar o portal para alterar dados, filtros, Supabase ou permissões.


### 3.2.1 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidade:

- renderizar a experiência mobile segmentada da view **Minha Árvore**;
- organizar a árvore direta em uma malha 3×3 de telas independentes;
- manter desktop/tablet fora do escopo, preservando `FamilyTree`/ReactFlow;
- renderizar a tela **Central**, os grupos laterais de tios, os grupos inferiores de primos e a tela superior de ancestrais globais;
- exibir cards mobile com composição própria;
- desenhar conectores HTML/CSS independentes dos edges ReactFlow;
- preservar a navegação inferior mobile e o header da Home;
- oferecer swipe direcional com pré-visualização da tela vizinha durante o gesto.

Condição de uso:

```txt
HomeTreeSection.tsx
isMobile && treeViewMode === 'minha-arvore'
```

Malha de telas:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Abas superiores internas:

```txt
Paterno | Central | Materno
```

Comportamento das abas:

- **Paterno** abre **Tios Paternos**;
- **Central** abre a tela central;
- **Materno** abre **Tios Maternos**;
- não existe mais aba **Completa** no mobile segmentado.

Subcomponentes/partes internas relevantes no código atual:

```txt
FamilyGroup
VerticalRelativeScreen
AncestorsOverviewScreen
AncestorGroupCard
PersonCard
MainPersonCard
SiblingPersonCard
AncestorPersonCard
MiniPersonCard
PetPersonCard
VitalLines
PersonAvatar
```

Estado atual do layout:

- a tela **Central** reúne Pai, Mãe, pessoa principal, irmãos, sobrinhos, cônjuge, pets, filhos e netos quando houver;
- a tela **Ancestrais globais** reúne ramo paterno e materno em duas colunas;
- cada coluna de ancestrais pode exibir **Tataravós**, **Bisavós** e **Avós**;
- tios ficam nas telas laterais e conectam visualmente aos ramos de avós;
- primos ficam abaixo dos respectivos tios e exibem todos os cards disponíveis com rolagem interna;
- em 320px, primos podem usar duas colunas; a partir de 360px, preferem três colunas;
- as linhas laterais de Pai/Mãe acompanham o scroll da tela Central;
- os conectores entre ancestrais, Pai/Mãe e pessoa central devem ficar no mesmo contexto rolável/visual dos cards quando dependerem da posição desses cards;
- os conectores de primos não possuem linha inferior;
- a malha usa `touchStart`, `touchMove` e `touchEnd` para swipe direcional e preview por deslocamento temporário (`dragOffset`).

Regras atuais dos cards mobile:

- `VitalLines` deve exibir apenas ano de nascimento/falecimento;
- `MainPersonCard` não deve exibir badge **VOCÊ** no card principal;
- `PersonCard` pode manter labels específicas como **PAI** e **MÃE**;
- `PersonAvatar` deve privilegiar `foto_principal_url` e, na ausência de foto, usar fallback visual por `genero` (`homem`, `mulher`, `pet`) via lógica compartilhada com `FamilyTreeVisualCards`;
- não usar iniciais como fallback principal quando a lógica visual por `genero` estiver disponível.

Cuidados:

- não tratar conectores do `MobileFamilyTreeView` como edges ReactFlow;
- não aplicar CSS do mobile segmentado em `/genealogia` ou `/visao-completa`;
- não deixar bottom navigation cobrir cards ou títulos de grupo;
- não reintroduzir a aba **Completa** no topo mobile;
- não reintroduzir o container externo único `Ancestrais Paternos/Maternos`;
- não recolocar botão **Ver todos** nos grupos de primos;
- não deixar conectores visíveis atravessando o fundo de cards/containers;
- manter primeiro e segundo nome como rótulo curto dos cards mobile;
- manter linhas vitais com `Star` para nascimento e `Cross` para falecimento;
- validar 320px, 375px, 390px e 430px;
- validar Central, Ancestrais, Tios Paternos/Maternos e Primos Paternos/Maternos sempre que alterar container, grid, conectores ou navegação.



### 3.2.2 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidade:

- renderizar a experiência desktop/tablet da view **Mapa Familiar**;
- compor uma superfície panorâmica HTML/CSS/SVG independente do ReactFlow;
- montar grupos de ancestrais, laterais, eixo central, descendentes, pets e cônjuge principal;
- calcular posições a partir de `FAMILY_MAP_LAYOUT_BASE` e do layout wide acionado por `sidebarCollapsed`;
- centralizar o canvas tanto com painel lateral aberto quanto com painel lateral colapsado;
- manter conectores principais SVG por âncoras (`topCenter`, `bottomCenter`, `leftCenter`, `rightCenter`);
- manter pares conjugais adjacentes quando houver relacionamento `conjuge` explícito;
- renderizar `VisualGroup`, `VisualPersonCard` e `VisualEmptyCard`;
- expor contagens renderizadas ao painel por `onDirectRelationRenderedCounts`;
- aplicar zoom manual por `Ctrl + scroll`, sem bloquear o scroll comum.

Estrutura interna esperada:

```txt
FAMILY_MAP_LAYOUT_BASE
getFamilyMapLayout
helpers de grupos e cônjuges
helpers de medidas e áreas
helpers de conectores
PositionedGroup
DirectPersonCard
DesktopFamilyMapView
```

Regras de layout base:

- o layout base atende o Mapa Familiar com painel lateral aberto;
- `areas.left` e `areas.right` concentram tios/primos paternos e maternos;
- `areas.lowerLeft` concentra irmãos/sobrinhos;
- `areas.lowerMiddle` concentra apoio inferior central, como pets quando aplicável;
- `areas.lowerRight` concentra descendentes e netos;
- alterações de `x`, `width`, `singleWidth`, `columns` e limites devem passar por `FAMILY_MAP_LAYOUT_BASE.groups` ou pelo retorno de `getFamilyMapLayout`.

Regras do layout wide (`sidebarCollapsed === true`):

- não alinhar a superfície com `ml-0 mr-auto`; usar centralização (`mx-auto`) para preservar margens laterais equivalentes;
- manter a pessoa central como referência visual do mapa expandido;
- ampliar laterais sem encostar tios/primos nas bordas da viewport;
- separar horizontalmente as faixas inferiores:
  - `lowerLeft`: `Irmãos` e `Sobrinhos`;
  - `lowerMiddle`: `Cônjuge` e `Pets`, sem colisão;
  - `lowerRight`: `Filhos` e `Netos`;
- cônjuge e pets não devem se sobrepor entre si nem invadir grupos de irmãos/sobrinhos;
- conectores inferiores devem continuar partindo da pessoa central/cônjuge para os grupos corretos.

Cuidados:

- não mover `DesktopFamilyMapView` para dentro de `FamilyTree.tsx`;
- não trocar conectores SVG do Mapa Familiar por edges ReactFlow;
- não corrigir assimetria com transform ou deslocamento visual externo;
- não usar coordenadas soltas no JSX quando o ajuste pertence ao layout;
- não alterar schema, Supabase, filtros ou regra de parentesco para resolver colisão visual;
- validar painel aberto e painel colapsado sempre que `FAMILY_MAP_LAYOUT_BASE`, `getFamilyMapLayout`, `areas` ou grupos inferiores forem alterados;
- validar desktop em 1366×768, 1440×900, 1536×864 e 1920×1080.

### 3.2.3 `FamilyTreeVisualCards`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Responsabilidade:

- renderizar os cards visuais compartilhados pelo Mapa Familiar;
- prover `VisualGroup`, `VisualPersonCard` e `VisualEmptyCard`;
- prover dados visuais reutilizáveis por `MobileFamilyTreeView`, incluindo `birthYearLine`, `deathYearLine` e avatar por `genero`;
- exibir cards mini, compactos, horizontais e centrais conforme `variant`;
- aplicar pílulas de grupo, botão `+/-`, modo expandido e limite inicial;
- renderizar conectores internos entre cônjuges quando há pareamento explícito;
- renderizar avatar/fallback visual por `genero`.

Regras de avatar fallback:

- `genero = homem` usa silhueta masculina;
- `genero = mulher` usa silhueta feminina legível, com aparência humana e sem visual de “fantasma”;
- `genero = pet` usa ícone próprio de pet;
- pet não deve cair em avatar humano;
- ausência de foto não deve alterar dados da pessoa, apenas fallback visual;
- se `genero` estiver ausente ou indefinido, preservar o fallback genérico previsto no componente.

Cuidados:

- não usar assets externos com watermark;
- preferir SVG inline ou componente local para avatares fallback;
- não mudar cores e dimensões globais dos cards ao alterar apenas um avatar;
- conferir o mesmo card em grupos horizontais, mini, compactos, central, cônjuge e pet.


### 3.3 Layout direto: `directFamilyDistributedLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidade:

- montar a view **Minha Árvore**;
- posicionar pessoa central;
- distribuir parentes diretos por grupos;
- criar labels, group boxes, anchors e edges;
- criar marriage nodes quando necessário.

Nodes/edges relevantes:

```txt
personNode
marriageNode
directFamilyGroupBoxNode
directFamilyLabelNode
directFamilyAnchorNode
spouseEdge
childEdge
siblingEdge
```

Cuidados:

- group boxes, labels e anchors não devem comandar zoom inicial;
- alteração de constantes afeta toda a composição;
- cards compactos da Minha Árvore podem ter largura visual ampliada sem alterar o card central nem contaminar Genealogia/Visão Completa;
- labels de grupos devem permanecer centralizadas dentro do group box visual;
- edges/linhas estruturais devem conectar as bordas/anchors reais dos grupos após qualquer ajuste de largura;
- ajustes de largura da Minha Árvore não devem vazar para `/genealogia` ou `/visao-completa`;
- marriage nodes da Minha Árvore podem usar `visualVariant: 'direct-family'`;
- validar desktop e mobile quando mexer em espaçamentos.

### 3.4 Layout por gerações: `genealogyColumnsLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidade:

- montar **Genealogia** e **Visão Completa**;
- agrupar por `manual_generation`;
- inferir gerações visualmente quando necessário;
- posicionar cônjuges;
- criar labels de geração;
- criar conectores ortogonais e edges conjugais.

Cuidados:

- não criar colunas vazias apenas para manter sequência numérica;
- preservar conectores pais/filhos;
- preservar status visual do anel conjugal;
- manter anel padrão em Genealogia/Visão Completa;
- validar chips mobile quando alterar geração, filtros ou agrupamento.

### 3.5 `PersonNode`

Arquivo:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Responsabilidade:

- renderizar card de pessoa no React Flow;
- exibir avatar/fallback;
- exibir nome, datas, locais e idade quando aplicável;
- indicar pessoa falecida;
- indicar pet;
- exibir ações de visualizar, editar, vincular e remover conforme props;
- abrir painel central de foco quando aplicável.

Padrões consolidados:

- nascimento usa ícone `Star`;
- falecimento usa ícone `Cross`;
- pet usa marcador com `Dog`;
- textos longos usam truncamento ou quebra conforme o contexto visual;
- na `/minha-arvore`, cards compactos com espaço suficiente devem preferir quebra de linha a reticências;
- em `/genealogia` e `/visao-completa`, preservar proporção e legibilidade dos cards `410px × 190px`;
- handles do React Flow permanecem invisíveis;
- no mobile, anéis/bordas duplicadas não devem competir com a borda principal do card.

Dimensões de referência:

| Contexto | Largura | Altura | Observação |
|---|---:|---:|---|
| Card central da `/minha-arvore` | `620px` | `760px` | Card de foco, sem ampliação compacta. |
| Card compacto da `/minha-arvore` | `340px` base, `360px` visual | `136px` | Ampliação visual escopada à view direta. |
| Card de `/genealogia` e `/visao-completa` | `410px` | `190px` | Não deve herdar `360px`. |

Cuidados:

- não trocar ícones por caracteres textuais;
- não remover `stopPropagation` das ações;
- não alterar dimensões sem validar a árvore inteira;
- não misturar permissão de edição dentro do card; receber callbacks já resolvidos;
- não aplicar regra de `line-clamp` que gere `...` desnecessário em nomes da `/minha-arvore`;
- validar nomes longos como mãe, irmãos e sobrinhos após qualquer alteração de largura.

### 3.6 `MarriageNode`

Arquivo:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
```

Responsabilidade:

- renderizar botão/anel conjugal na Minha Árvore;
- abrir `ViewMarriageModal`;
- inferir pessoas próximas quando detalhes não chegam por props;
- usar ícone `Blend`.

Padrões consolidados:

- tamanho base: `60px × 60px`;
- cor do ícone e da borda deve acompanhar a cor efetiva dos conectores da árvore conforme a paleta ativa;
- não usar laranja/marrom fixo quando o modo de cor define outra cor para os conectores;
- variante `direct-family` reforça contraste na Minha Árvore;
- clique deve parar propagação para não mover/selecionar indevidamente o canvas.

Cuidados:

- preservar handles invisíveis;
- não alterar dimensão sem revisar layout;
- não remover fallback de inferência;
- não usar cor fixa fora dos tokens/CSS variables;
- validar paletas `white`, `orange`, `brown` e `visual` após alteração visual.

### 3.7 `GenealogySpouseEdge`

Arquivo:

```txt
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Responsabilidade:

- representar vínculo conjugal nas views por gerações;
- manter interação com o modal conjugal quando suportada;
- preservar estilo padrão da Genealogia/Visão Completa.

Cuidados:

- não aplicar variante visual da Minha Árvore automaticamente;
- preservar clique no vínculo conjugal;
- validar paletas e filtros de linha.

### 3.8 `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Responsabilidade:

- exibir legenda visual;
- controlar filtros/camadas visuais quando recebe callbacks;
- orientar cores, linhas, anéis e estados.

Cuidados:

- legenda não deve ser apenas decorativa quando conectada a callbacks;
- elementos de legenda não devem aparecer na exportação;
- filtros visuais não devem virar regra de banco;
- manter estado padrão conservador.

### 3.9 Exportação da árvore

Arquivos:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
```

Responsabilidade:

- seleção retangular de área visível;
- exportação PNG/imagem;
- exportação PDF;
- impressão;
- acesso mobile rápido a ações de exportação.

Cuidados:

- sem Storage;
- sem migration;
- sem log persistido;
- overlay/legenda não devem poluir exportação;
- exportação da árvore completa continua evolução futura;
- divergências entre exportação desktop e mobile devem ser registradas em `PLANO_PROXIMOS_PASSOS.md`.

---

## 4. Home pós-login

Componentes extraídos de `Home.tsx`:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/SidebarInfoPanel.tsx
src/app/pages/home/HomeCuriositiesDialog.tsx
src/app/pages/home/DiscoverResultCard.tsx
src/app/pages/home/ContactInfo.tsx
src/app/pages/home/ConnectionDiscoveryPanel.tsx
src/app/pages/home/AiQuestionPanel.tsx
src/app/pages/home/homeCuriositiesUtils.ts
src/app/pages/home/homeAiContext.ts
```

Regra de responsabilidade:

- `Home.tsx` continua orquestrando estado principal, carregamento, Supabase, filtros e handlers;
- componentes extraídos cuidam de apresentação e interação localizada;
- novos dados persistentes devem entrar via service, não direto no componente visual.

### 4.1 `HomeTreeSection`

Responsabilidade:

- renderizar a superfície principal da árvore;
- decidir quando usar chips mobile de geração;
- passar `activeGenealogyGeneration` para `FamilyTree`;
- aplicar estilos condicionais por view/mobile;
- renderizar estados de loading/erro/vazio;
- renderizar título desktop/tablet da view;
- posicionar o botão de favorito da página junto aos controles de zoom no desktop;
- controlar bloqueios de scroll externo/indevido quando a árvore ocupa a viewport;
- em mobile, para `/genealogia` e `/visao-completa`, calcular uma base de pessoas com gerações inferidas antes de montar `availableMobileGenerations`, `GenealogyMobileStageTabs` e a prop `pessoas` de `FamilyTree`.

Padrões atuais:

| View | Título visível |
|---|---|
| `/minha-arvore` | `Árvore de {primeiro nome}` |
| `/genealogia` | `Família de {primeiro nome}` |
| `/visao-completa` | `Linha Genealógica de {primeiro nome}` |

Cuidados:

- resetar geração ativa quando mudar view, pessoa central ou assinatura de gerações disponíveis;
- não transformar chips mobile em filtro destrutivo;
- não vazar estilos da Minha Árvore para Genealogia/Visão Completa;
- não reintroduzir botão de favorito duplicado no header desktop;
- no desktop da `/minha-arvore`, wheel para cima não deve deslocar a árvore quando não há conteúdo acima;
- manter controles de zoom, favorito e overlays acima do ReactFlow sem bloquear pan/zoom.

### 4.2 `GenealogyMobileStageTabs`

Responsabilidade:

- exibir chips mobile por geração;
- aceitar geração ativa;
- disparar alteração por clique/swipe;
- não remover nodes do canvas.

Cuidados:

- chips dependem das gerações disponíveis no shell;
- essas gerações devem vir da mesma base inferida usada pela árvore em mobile para evitar divergência entre chips e canvas;
- se a inferência visual de gerações mudar, validar QA visual mobile de `/genealogia` e `/visao-completa`;
- labels devem permanecer humanos e curtos.

### 4.3 `ConnectionDiscoveryPanel`

Responsabilidade:

- comparar duas pessoas da árvore;
- exibir resumo de parentesco e caminho familiar;
- renderizar resultado visual na aba **Qual a minha conexão com alguém?**;
- tratar pessoas humanas e pets de forma semanticamente distinta;
- separar título curto de parentesco e subtítulo explicativo quando existir complemento real.

Padrões consolidados:

- título deve classificar a relação de forma direta;
- subtítulo deve explicar o caminho familiar, sem repetir literalmente o título;
- quando não houver complemento definido, não exibir subtítulo genérico;
- nomes nos cards visuais podem quebrar linha quando houver espaço;
- explicações longas devem sair do título e ir para o subtítulo.

Exemplos:

```txt
Tulius Souza e Eike são primos.
O pai de Eike, Absalon Jr, é irmão de Márcio, pai de Tulius.
```

```txt
Tulius Souza é sobrinho de Athanase Tsangaropoulos.
Athanase é irmão de Condilênia, mãe de Tulius.
```

Cuidados:

- não usar texto genérico `pai/mãe` quando o papel parental puder ser inferido;
- exibir **pai** para relação paterna e **mãe** para relação materna;
- quando o destino for pet, usar relação de tutela, como `Tulius Souza é tutor de Populos`;
- não classificar pet como filho humano;
- manter card visual legível e frase textual completa;
- não truncar nome com `...` quando houver espaço para o nome completo.

### 4.4 `AiQuestionPanel`

Arquivo:

```txt
src/app/pages/home/AiQuestionPanel.tsx
```

Responsabilidade:

- renderizar a aba **Pergunte à IA** no modal de Curiosidades;
- receber pergunta do usuário;
- enviar contexto estruturado da árvore;
- exibir resposta em português, sem expor IDs internos;
- permitir nova pergunta após resposta.

Cuidados:

- não enviar secrets para o frontend;
- não exibir IDs internos de pessoas ou relacionamentos;
- não finalizar respostas com frases genéricas;
- usar bullets com `•` para listas curtas de pessoas;
- perguntas sem suporte nos dados devem receber resposta limitada ao contexto;
- respostas devem diferenciar humanos, pets, cônjuges e relações de tutela;
- perguntas sensíveis, inferenciais ou de fofoca não devem ser respondidas fora do dado cadastrado.

### 4.5 `homeAiContext`

Arquivo:

```txt
src/app/pages/home/homeAiContext.ts
```

Responsabilidade:

- montar contexto estruturado para a IA;
- normalizar vínculos pai/mãe;
- separar filhos humanos de pets;
- gerar respostas diretas sugeridas para perguntas frequentes;
- evitar que a IA precise inferir relações básicas a partir de dados brutos.

Respostas diretas/casos determinísticos esperados:

- bisavós paternos da pessoa central;
- pessoas nascidas em Recife/PE;
- irmãos de uma pessoa por pais compartilhados;
- pessoas mais antigas com ano de nascimento e idade aproximada;
- cidades de nascimento mais recorrentes com nomes por cidade;
- resumo da linha genealógica da pessoa central.

Cuidados:

- manter funções puras e testáveis quando possível;
- não expor IDs na resposta final ao usuário;
- não confundir avós com bisavós;
- não classificar pets como filhos humanos;
- manter respostas em linguagem familiar, não em linguagem de banco;
- atualizar `api/ai.ts` quando a estrutura do contexto mudar.

## 5. Perfil, pessoa e dados pessoais

Componentes principais:

```txt
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/SocialProfilesEditor.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/components/person/RelationshipFinder.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MinhaArvore.tsx
```

Responsabilidades:

| Componente | Responsabilidade |
|---|---|
| `PersonDataView` | Exibir dados públicos do perfil respeitando privacidade. |
| `PersonContactFields` | Editar contato, privacidade e dados correlatos. |
| `AddressAutocompleteInput` | Autocomplete Google Places com fallback para input comum. |
| `SocialProfilesEditor` | Editar redes sociais, manter compatibilidade com campos legados e apoiar persistência versionada em `pessoa_social_profiles`. |
| `PersonEventsEditor` | Criar/editar eventos pessoais. |
| `PersonEventsList` | Exibir eventos pessoais. |
| `RelationshipFinder` | Exibir cálculo de vínculo/grau de parentesco. |
| `MinhaArvore` | Editar dados próprios, avatar, arquivos, eventos, redes sociais versionadas e vínculos do membro autenticado. |

Cuidados:

- campos de privacidade devem ser respeitados na exibição;
- autocomplete não pode ser obrigatório;
- sem `VITE_GOOGLE_MAPS_API_KEY`, o input deve continuar funcional;
- botão de favorito no perfil deve usar `FavoriteButton`;
- botão de edição no perfil público deve respeitar permissão já resolvida pela página/service;
- sugestão de informação para admin deve passar por `personProfileSuggestionService`;
- CSS mobile de `/minha-arvore/editar` deve permanecer escopado por `#minha-arvore-edit-form`;
- múltiplas redes sociais em `/minha-arvore/editar` devem persistir via `pessoaSocialProfilesService`, mantendo a primeira rede sincronizada com `rede_social`/`instagram_usuario` para compatibilidade.

---

## 6. Relacionamentos e vínculo conjugal

Componentes principais:

```txt
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/RelacionamentoManager.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
```

Responsabilidades:

| Componente | Responsabilidade |
|---|---|
| `MarriageDetailsEditor` | Editar dados conjugais em contexto admin ou formulário permitido. |
| `ViewMarriageModal` | Exibir relacionamento conjugal de forma pública/humana, abrir sugestão textual e integrar arquivos históricos do relacionamento. |
| `RelacionamentoManager` | Gerenciar relacionamentos no contexto de formulário/admin. |

`ViewMarriageModal` deve preservar:

- cabeçalho em uma linha horizontal com ícone, título à esquerda e botão `X`;
- título com peso/tamanho maior que os subtítulos internos;
- headline humana no presente ou passado;
- **Inserir Informações** abrindo modal secundário de sugestão textual;
- `+` em **Arquivos Históricos** abrindo upload de arquivo histórico;
- modal secundário fechando sem fechar o modal conjugal pai.

Campos do modal secundário de **Inserir Informações**:

```txt
Informações
Data
Local
Outros
```

Cuidados:

- observações internas aparecem apenas para admin;
- modal conjugal não deve exibir ID técnico para usuário final;
- usuário sem permissão envia sugestão/solicitação, não altera relacionamento real;
- arquivos históricos de relacionamento usam `relacionamento_id`;
- botão compacto `+` pode ser usado em áreas de espaço reduzido;
- `+` de arquivos não deve chamar o fluxo de **Inserir Informações**;
- `readOnly` em `ArquivosHistoricos` controla a visibilidade do botão `+`;
- sem `relacionamento_id`, salvamento de arquivo deve falhar de forma controlada, sem quebrar a tela.

---

## 7. Arquivos históricos e upload

Componentes/services principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/components/FotoUpload.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
```

Responsabilidade:

- upload/preview de imagem e PDF;
- edição de título, descrição, ano e categoria;
- suporte a pessoa ou relacionamento;
- compatibilidade com base64 legado;
- uso de Storage para novos arquivos;
- aceitar lista contextual de categorias por prop, quando a tela precisar restringir opções.

Props/variações relevantes:

```txt
readOnly
addButtonVariant
eventCategoryOptions
onRequestAdd
relacionamentoId
```

No contexto de relacionamento conjugal, categorias permitidas:

```txt
certidao_casamento -> Certidão de Casamento
divorcio -> Divórcio
outro -> Outro
```

Cuidados:

- novos uploads não devem salvar base64;
- preview/download não pode limpar formulário;
- bucket de avatar é diferente de bucket de arquivos históricos;
- categoria histórica depende de migration aplicada;
- `eventCategoryOptions` deve restringir apenas a UI do contexto, sem alterar a constraint global do banco;
- não apagar legado sem auditoria.

---

## 8. Favoritos

Componentes/services:

```txt
src/app/components/favorites/FavoriteButton.tsx
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/components/favorites/PageFavoriteButton.tsx
src/app/services/favoritesService.ts
src/app/pages/MeusFavoritos.tsx
```

Responsabilidade:

- favoritar/desfavoritar entidade;
- exibir estado ativo;
- chamar `toggleFavorite`;
- preservar metadados sanitizados;
- listar favoritos do usuário com busca, filtros, abertura e remoção.

Props principais:

```txt
entityType
entityId
label
description
href
metadata
size: sm | md
variant: icon | button
onChange
```

Estado atual:

- botão implementado e usado para pessoa;
- tópico de fórum pode ser favoritado por `ForumTopicFavoriteButton`;
- há componentes auxiliares para páginas e arquivos históricos quando a tela expõe a ação;
- `FavoriteEntityType` já prevê outras entidades;
- `/meus-favoritos` usa badges de tipo no topo do card, sem ícone redundante de coração;
- `forum_topic` deve aparecer como **Fórum**;
- cada tipo de favorito pode ter cor própria para escaneabilidade;
- o botão textual **Abrir conteúdo** foi removido da página;
- o card inteiro abre o favorito quando há `href`;
- link interno deve navegar via SPA; link externo deve abrir em nova aba segura;
- botão de lixeira deve interromper propagação para não abrir o card;
- card clicável deve aceitar `Enter` e `Espaço`;
- expansão de favoritos para outros tipos deve ser validada funcionalmente antes de expor novos botões.

Cuidados:

- não enviar URL sensível, telefone, token, base64 ou dado sensível em `metadata`;
- usar `href` navegável e seguro;
- usar `variant="icon"` para ações compactas como perfil/card;
- preservar `aria-label`, foco visível e navegação por teclado nos cards clicáveis;
- expansão para novas entidades deve considerar schema, UI e página `/meus-favoritos`.

---

## 9. Fórum

Páginas/componentes relevantes:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
```

Responsabilidades consolidadas:

| Área | Responsabilidade |
|---|---|
| `ForumHome` | Listar tópicos com busca, filtro de categoria e limpeza de filtros. A UI atual não deve exibir dropdowns de tipo/status. |
| `ForumNovoTopico` | Criar tópico, selecionar categoria em cards, detectar/inserir menções `@` e gerar vínculos técnicos por menção. |
| `ForumEditarTopico` | Editar tópico com categorias em cards, sem campo manual de pessoa relacionada. |
| `ForumTopico` | Exibir tópico principal, respostas diretas, badge de categoria, avatares, menções quando aplicável, favoritos e reações. |
| `forumService` | Persistência de tópicos, respostas, comentários legados, reações e denúncias. |
| `notificationTriggersService` | Notificar pessoas mencionadas/relacionadas e participantes. |

Cuidados:

- `/forum` deve manter apenas busca, categoria e limpar filtros; dropdowns de tipo/status não devem voltar sem decisão explícita;
- em `/forum`, cards de tópicos devem exibir apenas badge de categoria e badge **Fixado** quando aplicável;
- badges **Discussão** e **Aberto** não fazem parte da UI atual;
- `/forum/novo` e `/forum/topico/:id/editar` não devem exibir campo manual **Pessoas Relacionadas**;
- `/forum/topico/:id` deve usar estrutura de post/conversa, com tópico principal, respostas diretas e campo único de nova resposta;
- a visualização do tópico não deve exibir box **Pessoa relacionada**;
- a visualização do tópico não deve exibir botão `...` ao lado da lixeira;
- comentários aninhados em respostas não fazem parte da UI atual; dados/funções de comentário podem permanecer como compatibilidade técnica até decisão futura;
- as 5 categorias devem ficar em uma linha em desktop amplo;
- não reintroduzir `Marcar solução` ou `Ocultar` nas respostas se a decisão visual continuar vigente;
- não quebrar deduplicação entre menção e vínculo técnico em `forum_topico_pessoas`;
- falha de notificação não deve impedir publicação do tópico;
- ao alterar reações, validar migration/constraint de unicidade.

---

## 10. Notificações

Componentes/services principais:

```txt
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/notificationDispatchService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
```

Cuidados:

- separar central `/notificacoes` de preferências `/ajustar-notificacoes`;
- falha de dispatch não deve quebrar ação principal;
- e-mail real depende de provider/secrets;
- push/WhatsApp não devem simular envio real;
- cron externo deve ser configurado fora do frontend.

---

## 11. Calendário familiar

Página principal:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Componentes/conceitos internos:

```txt
MemberPageHeader
PAGE_CONTAINER_CLASS
CALENDAR_CATEGORY_COLORS
MOBILE_CALENDAR_LEGEND_ITEMS
Google Agenda card
```

Responsabilidade:

- exibir eventos familiares por mês;
- filtrar categorias;
- destacar aniversários, casamentos, falecimentos e eventos históricos;
- integrar conexão/sincronização com Google Agenda quando configurada.

Cuidados:

- filtros mobile compactos ficam acima do calendário;
- card Google Agenda pode ser oculto/mostrado no mobile;
- título deve ser **Calendário**;
- textos de idade usam **Faz X anos** quando aplicável;
- tokens/cores do calendário são locais à página.

---

## 12. Timeline e eventos da vida

Componentes/utils:

```txt
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
```

Responsabilidade:

- montar linha do tempo derivada;
- exibir nascimento, falecimento, vínculos, filhos, arquivos históricos e eventos pessoais;
- permitir eventos manuais em contextos editáveis.

Cuidados:

- upload por evento, privacidade por evento e PDF são evolução futura;
- não duplicar dados já derivados;
- manter eventos manuais separados de fatos automáticos quando necessário;
- em modo `embedded`, evitar título redundante quando a página já contextualiza a seção.

---

## 13. UI base

Componentes em:

```txt
src/app/components/ui/
```

Uso esperado:

- botões;
- cards;
- inputs;
- textareas;
- dialogs;
- tabs;
- selects;
- switches;
- tooltips;
- demais primitivas visuais.

Cuidados:

- preservar compatibilidade com Radix quando aplicável;
- não customizar globalmente componente base para resolver problema isolado;
- preferir composição local quando a variação for específica de tela;
- validar acessibilidade mínima.

---

## 14. Checklist anti-regressão por alteração

| Alteração | Validar |
|---|---|
| Header/menu | `HomeHeader`, `MemberPageHeader`, `UserProfileMenu`, `MobileUserMenuPalettePortal`, mobile e desktop. |
| Árvore | `/minha-arvore`, `/genealogia`, `/visao-completa`, pan/zoom, paletas, `MobileTreeControlsPortal` e modal conjugal. |
| Cards de pessoa | ícones, texto, truncamento, avatar, pets, falecidos e ações. |
| Fórum | criação, edição, listagem, tópico, respostas diretas, menções, vínculos técnicos e reações. |
| Notificações | central, preferências, triggers e falha sem bloquear fluxo principal. |
| Favoritos | botão, página `/meus-favoritos`, sanitização de metadata e remoção. |
| Calendário | filtros mobile, Google Agenda, grid e lista do mês. |
| Upload/Storage | preview, bucket correto, edição de metadados e legado base64. |
| Edição própria | `/minha-arvore/editar`, CSS escopado, avatar, cards compactos e nav inferior. |

Comandos mínimos:

```bash
npm run build
git diff --check
```

Quando houver testes relacionados:

```bash
npm test
npm run test:e2e
```

## 15. Documentação relacionada ao Mapa Familiar

O comportamento detalhado da view `/mapa-familiar` deve ficar em:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Este guia deve manter apenas o inventário de componentes e suas responsabilidades. Mudanças funcionais profundas do Mapa Familiar devem atualizar primeiro o documento funcional canônico.

