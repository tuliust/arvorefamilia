# Minha Arvore  view, layout e viewport

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`
> Tipo: documentacao tecnica/funcional da view **Minha Arvore**.

---

## 1. Objetivo

Este documento registra o estado da view direta da arvore familiar chamada na UI de **Minha Arvore**.

A view funciona como uma visao geral individual da pessoa central, exibindo:

- ancestrais;
- pais;
- colaterais;
- conjuge;
- irmaos;
- descendentes;
- filtros laterais;
- painel lateral;
- ReactFlow.

Este documento substitui a versao anterior:

```txt
docs/VIEW_VISAO_GERAL.md
```

e consolida decisoes sobre:

- ocupacao vertical dos ramos paterno e materno;
- distribuicao da area central;
- altura e tipografia dos cards;
- controle do flash inicial do ReactFlow;
- titulos de grupos;
- viewport;
- constantes de layout.

---

## 2. Escopo

Este documento trata da geometria e UX da view **Minha Arvore**.

Para filtros, pets e regras de exibicao, use:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

Para linhas, conectores, destaques e legenda, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Para exportacao, use:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 3. Contexto tecnico

Stack:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Supabase;
- ReactFlow.

Pagina funcional:

```txt
src/app/pages/Home.tsx
```

Componente principal da arvore:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Layout da view direta:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Componente visual dos cards de pessoa:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Componente visual dos titulos de grupo:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

---

## 4. Views existentes na Home

A pagina `Home.tsx` possui tres views principais:

| View na UI | `viewMode` | Papel |
|---|---|---|
| Minha Arvore | `minha-arvore` | Visao direta individual da pessoa central |
| Genealogia | `genealogia` | Visao genealogica preservada separadamente |
| Visao Completa | `visao-completa` | Arvore expandida/completa |

Regras:

- os ajustes deste documento se aplicam A  view **Minha Arvore**;
- **Genealogia** e **Visao Completa** continuam isoladas por `viewMode`;
- nao aplicar automaticamente logica da Minha Arvore nas views por geracao.

---

## 5. Arquivos relacionados

### Pagina e viewport

```txt
src/app/pages/Home.tsx
src/app/pages/home/*
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidades:

- estrutura da pagina;
- header;
- painel lateral;
- area principal da arvore;
- renderizacao de `FamilyTree`;
- repasse de `layoutRevision`;
- shell unico das rotas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- calculo e aplicacao do viewport;
- controle de visibilidade do canvas;
- prevencao do flash inicial;
- zoom, pan e bounds.

### Layout logico da Minha Arvore

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidades:

- frame logico desktop e mobile;
- divisao horizontal `35% / 30% / 35%`;
- posicoes dos ramos paterno, central e materno;
- distribuicao vertical dos grupos laterais;
- distribuicao compacta dos grupos centrais inferiores;
- dimensoes dos cards;
- anchors;
- linhas estruturais.

### Componentes visuais

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/utils/personCardText.ts
```

---

## 6. Home e painel lateral

A pagina usa estrutura de tela cheia:

```txt
h-screen
flex flex-col
bg-gray-50
header no topo
main com flex-1 overflow-hidden
```

No desktop, o painel lateral fica em um `aside`:

```txt
aberto: w-80 p-4
fechado: w-14 p-2
conteudo em coluna
tabs via SidebarPanelTabs
area de conteudo com min-h-0 flex-1
```

Na view **Minha Arvore**, o painel lateral exibe a aba **Filtros** com:

```txt
DirectRelativeFilterGrid
LifeStatusKpiGrid
```

A Home e o shell comum das tres rotas da arvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

`/` redireciona para `/minha-arvore` preservando search params. A troca de view pelo header ou pela navegacao mobile usa navegacao client-side e mantem parametros como `pessoa=...`.

---

## 7. Filtros exibidos

A grade de filtros da familia direta inclui grupos como:

```txt
Tataravos
Bisavos
Avos
Tios
Primos
Conjuge
Irmaos
Filhos
Sobrinhos
Netos
```

O bloco inferior de status/tipo inclui:

```txt
Vivos
Falecidos
Pets
```

Regras especificas de filtros e pets ficam em:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 8. Viewport da arvore

Em `FamilyTree.tsx`, o ReactFlow desktop fica em uma area visual com constantes como:

```txt
TREE_DESKTOP_VISUAL_TOP_INSET = 70
TREE_DESKTOP_VISUAL_BOTTOM_INSET = 16
TREE_TITLE_TOP = 12
TREE_TITLE_HEIGHT = 48
TREE_VIEWPORT_PADDING_X = 24
TREE_VIEWPORT_PADDING_Y = 24
TREE_DIRECT_FAMILY_VIEWPORT_BOTTOM_PADDING_Y = 0
DIRECT_FAMILY_TRANSLATE_PADDING = 120
DIRECT_FAMILY_MAX_ZOOM = 2
DIRECT_FAMILY_FALLBACK_MIN_ZOOM = 0.01
```

A view **Minha Arvore** usa:

- `fitMode = contain`;
- alinhamento horizontal central;
- alinhamento vertical `top` no desktop;
- `minZoom` calculado a partir do viewport normalizado;
- `maxZoom = 2`;
- drag bloqueado no zoom minimo;
- restauracao do viewport inicial quando o usuario reduz o zoom ate perto do minimo.

---

## 9. Prevencao do flash inicial

Foi ajustado o carregamento inicial da arvore para evitar que uma versao ampliada apareca por um frame antes do enquadramento final.

Estado consolidado:

```txt
TREE_PENDING_VIEWPORT_ZOOM = TREE_INITIAL_TECHNICAL_MIN_ZOOM
```

A `viewportSignature` considera:

```txt
viewMode
layoutRevision
containerSize.width
containerSize.height
activeTreeViewport.x
activeTreeViewport.y
activeTreeViewport.zoom
```

Controles usados:

```txt
hasAppliedCurrentViewport
canRenderReactFlow = Boolean(activeTreeViewport && viewportSignature)
```

Regras:

- wrapper do ReactFlow fica com `visibility: hidden` ate o viewport atual ser aplicado;
- ReactFlow renderiza condicionalmente somente quando ha viewport calculado;
- `defaultViewport` usa diretamente `activeTreeViewport.x/y/zoom`;
- a area principal pode ficar brevemente vazia;
- a arvore deve aparecer ja no enquadramento correto.

---

## 10. Layout logico da Minha Arvore

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

### 10.1 Frame desktop atual

Valores principais:

```ts
DIRECT_FRAME_EXTRA_HORIZONTAL_SPACE = 560
DIRECT_FRAME_LEFT = -550
DIRECT_FRAME_RIGHT = 3770

FRAME_TOP = 10
FRAME_BOTTOM = 1810

SIDE_GROUPS_TOP = 170
SIDE_GROUPS_BOTTOM = 1810

DIRECT_FILTER_PANEL_BOTTOM_ALIGNMENT_Y = 1810
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 600
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410

CENTRAL_GROUP_BOTTOM = 2410
```

A altura logica util da view direta e:

```ts
viewportBounds.height = DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y - FRAME_TOP
```

Ou seja:

```txt
2410 - 10 = 2400
```

### 10.2 Frame mobile

O frame mobile permanece separado:

```ts
MOBILE_FRAME_LEFT = -70
MOBILE_FRAME_RIGHT = 3290
MOBILE_FRAME_TOP = -30
MOBILE_FRAME_BOTTOM = 2230
```

---

## 11. Distribuicao horizontal

A distribuicao horizontal continua baseada em tres areas:

| Area | Papel | Proporcao visual |
|---|---|---|
| Esquerda | Ramo paterno | ~35% |
| Centro | Pais, pessoa central, irmaos, conjuge e descendentes diretos | ~30% |
| Direita | Ramo materno | ~35% |

Valores principais:

```ts
SIDE_AREA_OUTER_INSET_X = 48
SIDE_AREA_CENTER_GAP_X = 48
CENTRAL_AREA_TARGET_RATIO = 0.3
```

Regras:

- o layout nao usa offsets especificos por pessoa ou familia para alinhar os lados;
- a separacao horizontal permanece sistematica;
- nao introduzir ajustes manuais por familia sem decisao explicita.

---

## 12. Dimensoes principais atuais

### 12.1 Tokens base

Em `visualTokens.ts`:

```ts
CARD_WIDTH = 410
CARD_HEIGHT = 190
CENTRAL_WIDTH = 620
CENTRAL_HEIGHT token = 680
CENTRAL_AVATAR_SIZE = 336
```

### 12.2 Layout direto atual

| Elemento | Largura | Altura |
|---|---:|---:|
| Pessoa central logica | `620` | `760` |
| Pais | `400` | `160` |
| Ancestrais laterais | `400` | `160` |
| Tios/primos base | `300` | `126` |
| Grupos inferiores centrais | `400` | `120` |

### 12.3 Labels de grupo

Os labels de grupo usam:

```ts
LABEL_HEIGHT = 38
```

Em `DirectFamilyLabelNode.tsx`:

```tsx
text-[24px]
min-h-[38px]
font-black
uppercase
```

---

## 13. Containers de grupo

Cada grupo visivel gera:

1. node de label (`directFamilyLabelNode`);
2. node de container (`directFamilyGroupBoxNode`);
3. nodes de pessoa posicionados dentro do container;
4. anchors invisiveis de borda quando o grupo participa de conexoes.

A altura de grupo e calculada por:

```ts
GROUP_BOX_PADDING_Y * 2 + LABEL_HEIGHT + LABEL_TO_CARD_GAP + cardsHeight
```

Valores atuais:

```ts
GROUP_BOX_PADDING_X = 18
GROUP_BOX_PADDING_Y = 14
LABEL_HEIGHT = 38
LABEL_TO_CARD_GAP = 8
```

### 13.1 Largura dos grupos

A funcao `getGroupWidth()` evita que grupos colaterais com 4 colunas ocupem automaticamente toda a largura da lane.

Regra atual:

```ts
if (spec.laneWidth && metrics.columns > 2 && spec.fillAvailableWidth) {
  return spec.laneWidth;
}
```

Com isso, tios e primos com 4 colunas nao criam sobras laterais internas desnecessarias, exceto quando `fillAvailableWidth` estiver explicitamente ligado.

---

## 14. Regras de colunas

Colunas laterais adaptativas:

- 1 item: 1 coluna;
- 2 itens: 2 colunas;
- 3 itens: 3 colunas;
- 4 itens: 4 colunas;
- 5 ou 6 itens: preferencia por 3 colunas;
- 7 ou mais itens: preferencia por 4 colunas;
- sempre respeitando a largura disponivel da lane.

O layout pode reduzir colunas de grupos colaterais quando ha sobra vertical grande e a reducao ainda cabe na largura lateral.

---

## 15. Ramos laterais: paterno e materno

Ramo paterno:

- Tataravos paternos;
- Bisavos paternos;
- Avos paternos;
- Tios paternos;
- Primos paternos.

Ramo materno:

- Tataravos maternos;
- Bisavos maternos;
- Avos maternos;
- Tios maternos;
- Primos maternos.

### 15.1 Bottom logico

Os ramos laterais usam:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Esse valor foi calibrado para que os grupos laterais ocupem a area inferior disponivel e se alinhem visualmente A  base do container de filtros do painel esquerdo.

### 15.2 Redistribuicao vertical

A funcao:

```txt
redistributeSideStackPlanToBottom()
```

redistribui a pilha lateral inteira entre:

```ts
SIDE_TOP = 170
```

e:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Objetivo:

- evitar que apenas o ultimo grupo seja empurrado para o bottom;
- melhorar uniformidade visual entre ramo paterno e ramo materno.

### 15.3 Escala compartilhada

O layout calcula a escala maxima segura para o lado paterno e para o lado materno.

Quando ambos existem, usa a menor escala maxima entre eles como escala compartilhada.

Objetivo:

```txt
evitar assimetria visual entre tios/primos paternos e maternos.
```

### 15.4 Escala dos colaterais

Valores principais:

```ts
SIDE_COLLATERAL_CARD_WIDTH = 300
SIDE_COLLATERAL_CARD_HEIGHT = 126
SIDE_COLLATERAL_CARD_SCALE_STEP = 0.04
SIDE_COLLATERAL_CARD_MAX_SCALE = 1.48
```

---

## 16. Area central

Os ajustes desta secao se aplicam apenas A  view **Minha Arvore**.

A area central foi redesenhada para deixar de seguir as regras rigidas dos ramos laterais.

### 16.1 Estrutura central

A area central contem:

- Pai;
- Mae;
- Pessoa principal;
- Irmaos;
- Sobrinhos;
- Conjuge;
- Filhos;
- Netos.

### 16.2 Pessoa central

A pessoa principal e centralizada com base no intervalo util vertical da arvore:

```ts
CENTRAL_AREA_VERTICAL_CENTER_Y =
  (SIDE_GROUPS_TOP + DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y) / 2

CENTRAL_BASE_Y =
  CENTRAL_AREA_VERTICAL_CENTER_Y - CENTRAL_LOWER_REFERENCE_HEIGHT / 2 + CENTRAL_AREA_SHIFT_DOWN

CENTRAL_Y =
  CENTRAL_BASE_Y - CENTRAL_CORE_SHIFT_UP
```

Valores atuais:

```ts
SIDE_GROUPS_TOP = 170
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
CENTRAL_HEIGHT = 760
CENTRAL_LOWER_REFERENCE_HEIGHT = 620
CENTRAL_AREA_SHIFT_DOWN = 60
CENTRAL_CORE_SHIFT_UP = 180
```

### 16.3 Grupos superiores

Pai e Mae sao posicionados acima da pessoa principal:

```ts
CENTRAL_PARENT_GAP = 120
SIDE_PARENT_CARD_HEIGHT = 160

CENTRAL_PARENT_GROUP_Y =
  CENTRAL_Y - CENTRAL_PARENT_GAP - SIDE_PARENT_CARD_HEIGHT
```

### 16.4 Grupos inferiores

Os grupos inferiores partem de uma referencia vertical propria, baseada em `CENTRAL_BASE_Y`.

```ts
LOWER_GROUP_Y =
  CENTRAL_BASE_Y + CENTRAL_LOWER_REFERENCE_HEIGHT + CENTRAL_LOWER_GROUP_GAP
```

Valores atuais:

```ts
CENTRAL_LOWER_GROUP_GAP = 120
CENTRAL_LOWER_STACK_GAP = 34
```

Funcao atual:

```txt
compactLowerGroupTopPositions()
```

Coluna esquerda central:

- Irmaos;
- Sobrinhos.

Coluna direita central:

- Conjuge;
- Filhos;
- Netos.

Regra:

```txt
nao reintroduzir alignGroupStackToBottom() para grupos centrais sem mudanca explicita de objetivo visual.
```

### 16.5 Arvore esparsa

Quando a pessoa central nao possui pais, ancestrais ou grupos laterais visiveis,
mas possui grupos inferiores diretos, a view usa uma composicao central mais
compacta.

Criterio tecnico:

```txt
sem grupos paternos/maternos renderizaveis
sem Pai/Mae renderizaveis
com pelo menos um grupo inferior renderizavel
```

Grupos inferiores considerados:

```txt
Irmaos
Sobrinhos
Conjuge
Filhos
Pets
Netos
```

Comportamento:

- os tamanhos dos cards sao preservados;
- o Y inicial dos grupos inferiores usa `SPARSE_LOWER_GROUP_Y`;
- o gap interno da pilha inferior usa `SPARSE_CENTRAL_LOWER_STACK_GAP`;
- o viewport logico usa bounds verticais menores para melhorar o enquadramento inicial;
- a regra nao e aplicada quando existem pais, ancestrais, tios, primos ou qualquer grupo lateral visivel.

Objetivo:

```txt
evitar grande vazio vertical em arvores incompletas sem alterar a composicao de arvores densas.
```

---

## 17. Cards de pessoa

Os cards sao renderizados por:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Para relacoes diretas (`directRelation`):

- o card recebe `layoutWidth` e `layoutHeight` definidos pelo layout;
- o estilo visual vem de `DIRECT_FAMILY_RELATION_COLORS`;
- pets podem usar estilo especifico;
- a borda de status usa:
  - vivo: `DIRECT_FAMILY_STATUS_BORDER_COLORS.alive`;
  - falecido: `DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased`;
- ha borda de `4px`;
- ha sombra e transicao de hover;
- clique abre detalhes;
- menu de contexto permite visualizar, editar, adicionar conexao e remover;
- handles do ReactFlow continuam presentes para conexoes.

---

## 18. Card da pessoa principal

A pessoa principal usa tratamento especial:

- `directRelation = central`;
- layout vertical;
- foto/avatar acima;
- nome abaixo;
- detalhes abaixo do nome;
- fundo branco;
- texto escuro;
- borda por status vivo/falecido;
- foto clicavel abre dialog com imagem ampliada.

### 18.1 Dimensao logica

No layout direto:

```ts
CENTRAL_WIDTH = 620
CENTRAL_HEIGHT = 760
```

### 18.2 Altura visual automatica

No `PersonNode.tsx`, o card central usa:

```tsx
minHeight: cardHeight
height: isCentralDirectNode  'auto' : cardHeight
```

Isso significa:

- `CENTRAL_HEIGHT = 760` funciona como altura minima logica;
- se foto + nome + detalhes exigirem mais espaco, o card central pode crescer visualmente;
- a foto nao precisa ser reduzida para impedir vazamento;
- a margem entre foto e texto e preservada.

### 18.3 Conteudo central exibido

O card central prioriza:

1. idade calculada a partir da data de nascimento;
2. local de nascimento com data;
3. local atual.

Exemplo:

```txt
36 anos
Natural de Natal (01/02/1989)
Mora atualmente em Porto Alegre
```

---

## 19. Labels de grupo

Os titulos de grupos sao renderizados por:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Para labels de grupo, a classe atual e:

```tsx
text-[24px]
font-black
uppercase
min-h-[38px]
text-slate-900
```

Exemplos:

- BISAVOS PATERNOS;
- AVOS MATERNOS;
- TIOS PATERNOS;
- PRIMOS MATERNOS;
- IRMAOS;
- CONJUGE;
- FILHOS.

Regra:

```txt
o titulo principal da arvore nao deve ser criado por este layout.
```

O titulo principal fica como overlay em:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

## 20. Linhas e anchors

As linhas sao criadas depois do posicionamento dos grupos.

O layout mede os containers reais com:

```txt
getGroupBoxBounds()
```

e adiciona anchors via:

```txt
addGroupBoundaryAnchors()
```

Anchors:

- top;
- bottom;
- left;
- right;
- center.

Regra:

```txt
As conexoes estruturais usam anchors, nao dimensoes presumidas.
```

Isso permite que mudancas de escala, colunas, altura de containers e reposicionamento central sejam refletidas automaticamente nas linhas.

---

## 21. Conexoes principais

Conexoes estruturais incluem:

- Pai  ponto medio dos pais;
- ponto medio dos pais  Mae;
- ponto medio dos pais  topo do card central;
- Pai  Tios paternos;
- Mae  Tios maternos;
- centro  Irmaos;
- centro  Conjuge;
- pilhas laterais consecutivas:
  - Tataravos  Bisavos  Avos  Tios  Primos;
- pilhas inferiores:
  - Irmaos  Sobrinhos;
  - Conjuge  Filhos  Netos.

Estilo estrutural:

```ts
DIRECT_STRUCTURAL_EDGE_STYLE = {
  stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
  strokeWidth: 3,
  opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
}
```

---

## 22. Pontos sensiveis

### 22.1 Altura visual automatica do card central

O card central pode crescer alem do `CENTRAL_HEIGHT` logico.

Riscos:

- ReactFlow e anchors continuam baseados no layout logico;
- se o crescimento visual for muito maior do que o logico, pode haver desalinhamento entre borda visual e linhas.

Se o conteudo central crescer muito, revisar:

```ts
CENTRAL_HEIGHT
centralNameFontSize
centralDetailFontSize
avatarSize
```

---

### 22.2 Bottom logico lateral

O valor:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 600
```

esta calibrado visualmente contra a Home atual.

Se mudarem:

- altura do header;
- padding do painel lateral;
- top/bottom visual do ReactFlow;
- layout do painel de filtros;

revisar:

```ts
TREE_DESKTOP_VISUAL_BOTTOM_INSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
```

---

### 22.3 Labels maiores

Como `DirectFamilyLabelNode` usa `text-[24px]`, o `LABEL_HEIGHT` logico tambem deve acompanhar:

```tsx
text-[24px]
min-h-[38px]
```

e:

```ts
LABEL_HEIGHT = 38
```

Se mudar a fonte dos titulos de grupo, revisar os dois pontos juntos.

---

### 22.4 Area central independente

A area central usa logica propria:

```ts
CENTRAL_PARENT_GAP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
compactLowerGroupTopPositions()
```

Nao reintroduzir alinhamento inferior rigido nos grupos centrais sem decisao explicita de UX.

---

## 23. Sugestoes futuras

Possiveis evolucoes:

1. Medir altura real do card central.
2. Transformar constantes em parametros configuraveis.
3. Registrar commits de geometria da arvore.
4. Separar tokens exclusivos da Minha Arvore.
5. Criar modo debug de geometria central.
6. Criar documentacao visual com imagens de antes/depois.

---

## 24. Checklist de validacao visual

Apos qualquer ajuste futuro nesta view, validar:

### View

- [ ] Minha Arvore abre sem flash ampliado inicial.
- [ ] Genealogia permanece funcional.
- [ ] Visao Completa permanece funcional.

### Ramos laterais

- [ ] Ramo paterno ocupa bem a altura disponivel.
- [ ] Ramo materno ocupa bem a altura disponivel.
- [ ] Primos/tios nao tem sobras internas exageradas.
- [ ] Grupos laterais nao sobrepoem painel, titulo ou bordas.

### Area central

- [ ] Pai e Mae nao ficam colados ao topo.
- [ ] Pai e Mae tem distancia adequada do card central.
- [ ] Pessoa principal fica visualmente central.
- [ ] Card principal exibe foto, nome e detalhes dentro da borda.
- [ ] Irmaos, Conjuge, Sobrinhos, Filhos e Netos ficam abaixo do card central com espacamento uniforme.

### Cards

- [ ] Nome em cards comuns ocupa no maximo 2 linhas.
- [ ] Nascimento/falecimento em cards comuns ocupam 1 linha cada, com ellipsis se necessario.
- [ ] Detalhes do card central tem fonte legivel.
- [ ] Foto central nao empurra conteudo para fora.
- [ ] Margem entre foto e texto central permanece adequada.

### Labels e linhas

- [ ] Titulos dos grupos estao legiveis.
- [ ] Linhas estruturais conectam anchors corretos.
- [ ] Linhas nao atravessam cards de forma visualmente problematica.
- [ ] Highlights continuam funcionando.

### Tecnico

```bash
npm run build
npm test
git diff --check
```

---

## 25. Resumo do estado atual

A view **Minha Arvore** esta estruturada como uma composicao de tres areas:

- ramo paterno A  esquerda;
- area central independente;
- ramo materno A  direita.

Os ramos laterais usam distribuicao vertical ate o bottom logico `2410`, com redistribuicao da pilha inteira e escala compartilhada de colaterais.

A area central usa logica propria, com pessoa principal maior, card central com altura visual automatica, Pai/Mae deslocados para baixo em relacao ao topo original e grupos inferiores posicionados em pilhas compactas.

O ReactFlow so aparece apos o viewport final estar calculado e aplicado, evitando o flash inicial de uma arvore ampliada.

Os cards foram refinados para melhorar legibilidade, aumentar presenca da pessoa principal, reduzir sobras internas e garantir que as informacoes centrais fiquem dentro do card.

---

## 27. Busca no header da arvore

A busca do header e compartilhada pelas rotas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Comportamento consolidado:

- o botao de busca deve ser clicavel em toda a area visual;
- o campo usa placeholder **Buscar pessoa ou pagina...**;
- as sugestoes aparecem automaticamente ao digitar;
- as sugestoes incluem pessoas e paginas;
- paginas locais importantes, como **Notificacoes** e **Ajustar Notificacoes**, devem aparecer quando o termo bater;
- o usuario pode abrir a pagina completa de resultados;
- clicar fora fecha as sugestoes;
- pressionar `Esc` fecha as sugestoes;
- as sugestoes devem ficar acima do canvas da arvore.

Para pessoas sugeridas, a linha secundaria deve seguir:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Nao exibir cidade atual nessa linha.

## 28. Dropdowns do header

O header da arvore possui:

- seletor de view;
- menu do usuario;
- busca expansivel;
- atalhos para curiosidades, forum e calendario.

Regras de camada:

- sugestoes de busca devem ficar acima da arvore;
- menu do usuario nao pode ficar coberto pelo header;
- dropdown de views nao pode ficar coberto pelo header;
- componentes base Radix devem usar camada superior ao header.

Componentes base relacionados:

```txt
src/app/components/ui/select.tsx
src/app/components/ui/dropdown-menu.tsx
```

## 29. Legendas > Linhas

A opcao **Todas** em **Legendas > Linhas** deve ocultar todas as linhas da arvore.

Isso inclui:

- linhas de filiacao;
- linhas de irmaos;
- linhas conjugais quando aplicavel ao filtro;
- linhas horizontais e verticais que conectam cards de primos.

Regra anti-regressao:

```txt
se usuario desliga Todas, nenhuma linha estrutural de primos deve permanecer visivel.
```

## 30. Cards e espacos laterais da Minha Arvore

Ajustes de layout da view direta devem obedecer estas regras:

- reduzir espacos laterais ociosos sem comprimir a leitura;
- ampliar cards quando houver area disponivel;
- ampliar grupos de parentes usando espacos externos;
- preservar gap entre colunas;
- usar melhor o lado esquerdo dos grupos paternos;
- usar melhor o lado direito dos grupos maternos;
- evitar truncamento excessivo de nomes;
- evitar corte inferior de nomes e informacoes.

Status de implementacao:

```txt
linhas de primos no filtro Todas -> consolidado
corte inferior de nomes -> consolidado
reducao de espacos laterais e ampliacao de cards -> em ajuste incremental
```

---
## 28. Ajustes recentes e anti-regressao - ciclo 2026-05-30

### 28.1 Header da arvore

As rotas abaixo usam o mesmo shell da Home e devem manter comportamento consistente:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Busca no header:

- botao integralmente clicavel;
- placeholder oficial **Buscar pessoa ou pagina...**;
- sugestoes automaticas de pessoas;
- sugestoes automaticas de paginas;
- atalho para pagina completa de resultados;
- fechamento por clique fora;
- fechamento por `Esc`;
- sugestoes acima da arvore e com fundo solido.

Sugestoes de pessoas:

```txt
Cidade de nascimento – DD/MM/AAAA
```

A lista local de paginas deve contemplar rotas frequentes, incluindo:

```txt
Notificacoes
Ajustar Notificacoes
```

### 28.2 Legendas > Linhas > Todas

Comportamento consolidado:

- a opcao **Todas** deve ocultar todas as linhas da arvore;
- isso inclui linhas entre primos;
- tambem inclui conectores estruturais relacionados a grupos laterais;
- o comportamento deve ser revalidado apos qualquer mudanca em edges, anchors ou filtros visuais.

Checklist:

```txt
Legendas > Linhas > Todas -> nenhuma linha visivel
Primos paternos -> linhas horizontais/verticais ocultas
Primos maternos -> linhas horizontais/verticais ocultas
Filtros individuais -> continuam funcionando
```

### 28.3 Cards de pessoas

Status consolidado:

```txt
evitar corte inferior de nomes/informacoes -> consolidado
evitar truncamento excessivo -> em ajuste incremental
reduzir espacos laterais -> em ajuste incremental
ampliar cards usando areas vazias laterais -> em ajuste incremental
manter gap entre colunas -> obrigatorio
```

Regras:

- ampliar cards nao deve reduzir indevidamente o gap entre colunas;
- usar preferencialmente areas vazias externas dos ramos paterno e materno;
- nomes longos devem ter mais area util antes de truncar;
- quando truncar for inevitavel, nao cortar a parte inferior do texto;
- validar com nomes compostos e sobrenomes longos.

### 28.4 Modal Curiosidades

Na aba **Voce Sabia?**, os cards estatisticos devem permanecer diferenciados por cor:

```txt
Pessoas cadastradas -> azul
Vivos -> verde
Falecidos -> slate/cinza
Pets -> ambar
```

### 28.5 Validacao manual obrigatoria apos mudancas na view

Validar:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- busca abre e fecha corretamente;
- sugestoes de pessoas e paginas aparecem;
- seletor de views nao fica coberto pelo header;
- menu do usuario nao fica coberto pelo header;
- linhas de primos somem ao selecionar Todas;
- cards nao cortam nomes na parte inferior;
- alteracoes de largura nao quebram conexoes.
