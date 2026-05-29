# Minha Ãrvore â€” view, layout e viewport

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`
> Tipo: documentaÃ§Ã£o tÃ©cnica/funcional da view **Minha Ãrvore**.

---

## 1. Objetivo

Este documento registra o estado da view direta da Ã¡rvore familiar chamada na UI de **Minha Ãrvore**.

A view funciona como uma visÃ£o geral individual da pessoa central, exibindo:

- ancestrais;
- pais;
- colaterais;
- cÃ´njuge;
- irmÃ£os;
- descendentes;
- filtros laterais;
- painel lateral;
- ReactFlow.

Este documento substitui a versÃ£o anterior:

```txt
docs/VIEW_VISAO_GERAL.md
```

e consolida decisÃµes sobre:

- ocupaÃ§Ã£o vertical dos ramos paterno e materno;
- distribuiÃ§Ã£o da Ã¡rea central;
- altura e tipografia dos cards;
- controle do flash inicial do ReactFlow;
- tÃ­tulos de grupos;
- viewport;
- constantes de layout.

---

## 2. Escopo

Este documento trata da geometria e UX da view **Minha Ãrvore**.

Para filtros, pets e regras de exibiÃ§Ã£o, use:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

Para linhas, conectores, destaques e legenda, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Para exportaÃ§Ã£o, use:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 3. Contexto tÃ©cnico

Stack:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Supabase;
- ReactFlow.

PÃ¡gina funcional:

```txt
src/app/pages/Home.tsx
```

Componente principal da Ã¡rvore:

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

Componente visual dos tÃ­tulos de grupo:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

---

## 4. Views existentes na Home

A pÃ¡gina `Home.tsx` possui trÃªs views principais:

| View na UI | `viewMode` | Papel |
|---|---|---|
| Minha Ãrvore | `minha-arvore` | VisÃ£o direta individual da pessoa central |
| Genealogia | `genealogia` | VisÃ£o genealÃ³gica preservada separadamente |
| VisÃ£o Completa | `visao-completa` | Ãrvore expandida/completa |

Regras:

- os ajustes deste documento se aplicam Ã  view **Minha Ãrvore**;
- **Genealogia** e **VisÃ£o Completa** continuam isoladas por `viewMode`;
- nÃ£o aplicar automaticamente lÃ³gica da Minha Ãrvore nas views por geraÃ§Ã£o.

---

## 5. Arquivos relacionados

### PÃ¡gina e viewport

```txt
src/app/pages/Home.tsx
src/app/pages/home/*
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidades:

- estrutura da pÃ¡gina;
- header;
- painel lateral;
- Ã¡rea principal da Ã¡rvore;
- renderizaÃ§Ã£o de `FamilyTree`;
- repasse de `layoutRevision`;
- shell Ãºnico das rotas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- cÃ¡lculo e aplicaÃ§Ã£o do viewport;
- controle de visibilidade do canvas;
- prevenÃ§Ã£o do flash inicial;
- zoom, pan e bounds.

### Layout lÃ³gico da Minha Ãrvore

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidades:

- frame lÃ³gico desktop e mobile;
- divisÃ£o horizontal `35% / 30% / 35%`;
- posiÃ§Ãµes dos ramos paterno, central e materno;
- distribuiÃ§Ã£o vertical dos grupos laterais;
- distribuiÃ§Ã£o compacta dos grupos centrais inferiores;
- dimensÃµes dos cards;
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

A pÃ¡gina usa estrutura de tela cheia:

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
conteÃºdo em coluna
tabs via SidebarPanelTabs
Ã¡rea de conteÃºdo com min-h-0 flex-1
```

Na view **Minha Ãrvore**, o painel lateral exibe a aba **Filtros** com:

```txt
DirectRelativeFilterGrid
LifeStatusKpiGrid
```

A Home Ã© o shell comum das trÃªs rotas da Ã¡rvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

`/` redireciona para `/minha-arvore` preservando search params. A troca de view pelo header ou pela navegaÃ§Ã£o mobile usa navegaÃ§Ã£o client-side e mantÃ©m parÃ¢metros como `?pessoa=...`.

---

## 7. Filtros exibidos

A grade de filtros da famÃ­lia direta inclui grupos como:

```txt
TataravÃ³s
BisavÃ³s
AvÃ³s
Tios
Primos
CÃ´njuge
IrmÃ£os
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

Regras especÃ­ficas de filtros e pets ficam em:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 8. Viewport da Ã¡rvore

Em `FamilyTree.tsx`, o ReactFlow desktop fica em uma Ã¡rea visual com constantes como:

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

A view **Minha Ãrvore** usa:

- `fitMode = contain`;
- alinhamento horizontal central;
- alinhamento vertical `top` no desktop;
- `minZoom` calculado a partir do viewport normalizado;
- `maxZoom = 2`;
- drag bloqueado no zoom mÃ­nimo;
- restauraÃ§Ã£o do viewport inicial quando o usuÃ¡rio reduz o zoom atÃ© perto do mÃ­nimo.

---

## 9. PrevenÃ§Ã£o do flash inicial

Foi ajustado o carregamento inicial da Ã¡rvore para evitar que uma versÃ£o ampliada apareÃ§a por um frame antes do enquadramento final.

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

- wrapper do ReactFlow fica com `visibility: hidden` atÃ© o viewport atual ser aplicado;
- ReactFlow renderiza condicionalmente somente quando hÃ¡ viewport calculado;
- `defaultViewport` usa diretamente `activeTreeViewport.x/y/zoom`;
- a Ã¡rea principal pode ficar brevemente vazia;
- a Ã¡rvore deve aparecer jÃ¡ no enquadramento correto.

---

## 10. Layout lÃ³gico da Minha Ãrvore

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

A altura lÃ³gica Ãºtil da view direta Ã©:

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

## 11. DistribuiÃ§Ã£o horizontal

A distribuiÃ§Ã£o horizontal continua baseada em trÃªs Ã¡reas:

| Ãrea | Papel | ProporÃ§Ã£o visual |
|---|---|---|
| Esquerda | Ramo paterno | ~35% |
| Centro | Pais, pessoa central, irmÃ£os, cÃ´njuge e descendentes diretos | ~30% |
| Direita | Ramo materno | ~35% |

Valores principais:

```ts
SIDE_AREA_OUTER_INSET_X = 48
SIDE_AREA_CENTER_GAP_X = 48
CENTRAL_AREA_TARGET_RATIO = 0.3
```

Regras:

- o layout nÃ£o usa offsets especÃ­ficos por pessoa ou famÃ­lia para alinhar os lados;
- a separaÃ§Ã£o horizontal permanece sistemÃ¡tica;
- nÃ£o introduzir ajustes manuais por famÃ­lia sem decisÃ£o explÃ­cita.

---

## 12. DimensÃµes principais atuais

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
| Pessoa central lÃ³gica | `620` | `760` |
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

Cada grupo visÃ­vel gera:

1. node de label (`directFamilyLabelNode`);
2. node de container (`directFamilyGroupBoxNode`);
3. nodes de pessoa posicionados dentro do container;
4. anchors invisÃ­veis de borda quando o grupo participa de conexÃµes.

A altura de grupo Ã© calculada por:

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

A funÃ§Ã£o `getGroupWidth()` evita que grupos colaterais com 4 colunas ocupem automaticamente toda a largura da lane.

Regra atual:

```ts
if (spec.laneWidth && metrics.columns > 2 && spec.fillAvailableWidth) {
  return spec.laneWidth;
}
```

Com isso, tios e primos com 4 colunas nÃ£o criam sobras laterais internas desnecessÃ¡rias, exceto quando `fillAvailableWidth` estiver explicitamente ligado.

---

## 14. Regras de colunas

Colunas laterais adaptativas:

- 1 item: 1 coluna;
- 2 itens: 2 colunas;
- 3 itens: 3 colunas;
- 4 itens: 4 colunas;
- 5 ou 6 itens: preferÃªncia por 3 colunas;
- 7 ou mais itens: preferÃªncia por 4 colunas;
- sempre respeitando a largura disponÃ­vel da lane.

O layout pode reduzir colunas de grupos colaterais quando hÃ¡ sobra vertical grande e a reduÃ§Ã£o ainda cabe na largura lateral.

---

## 15. Ramos laterais: paterno e materno

Ramo paterno:

- TataravÃ³s paternos;
- BisavÃ³s paternos;
- AvÃ³s paternos;
- Tios paternos;
- Primos paternos.

Ramo materno:

- TataravÃ³s maternos;
- BisavÃ³s maternos;
- AvÃ³s maternos;
- Tios maternos;
- Primos maternos.

### 15.1 Bottom lÃ³gico

Os ramos laterais usam:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Esse valor foi calibrado para que os grupos laterais ocupem a Ã¡rea inferior disponÃ­vel e se alinhem visualmente Ã  base do container de filtros do painel esquerdo.

### 15.2 RedistribuiÃ§Ã£o vertical

A funÃ§Ã£o:

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

- evitar que apenas o Ãºltimo grupo seja empurrado para o bottom;
- melhorar uniformidade visual entre ramo paterno e ramo materno.

### 15.3 Escala compartilhada

O layout calcula a escala mÃ¡xima segura para o lado paterno e para o lado materno.

Quando ambos existem, usa a menor escala mÃ¡xima entre eles como escala compartilhada.

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

## 16. Ãrea central

Os ajustes desta seÃ§Ã£o se aplicam apenas Ã  view **Minha Ãrvore**.

A Ã¡rea central foi redesenhada para deixar de seguir as regras rÃ­gidas dos ramos laterais.

### 16.1 Estrutura central

A Ã¡rea central contÃ©m:

- Pai;
- MÃ£e;
- Pessoa principal;
- IrmÃ£os;
- Sobrinhos;
- CÃ´njuge;
- Filhos;
- Netos.

### 16.2 Pessoa central

A pessoa principal Ã© centralizada com base no intervalo Ãºtil vertical da Ã¡rvore:

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

Pai e MÃ£e sÃ£o posicionados acima da pessoa principal:

```ts
CENTRAL_PARENT_GAP = 120
SIDE_PARENT_CARD_HEIGHT = 160

CENTRAL_PARENT_GROUP_Y =
  CENTRAL_Y - CENTRAL_PARENT_GAP - SIDE_PARENT_CARD_HEIGHT
```

### 16.4 Grupos inferiores

Os grupos inferiores partem de uma referÃªncia vertical prÃ³pria, baseada em `CENTRAL_BASE_Y`.

```ts
LOWER_GROUP_Y =
  CENTRAL_BASE_Y + CENTRAL_LOWER_REFERENCE_HEIGHT + CENTRAL_LOWER_GROUP_GAP
```

Valores atuais:

```ts
CENTRAL_LOWER_GROUP_GAP = 120
CENTRAL_LOWER_STACK_GAP = 34
```

FunÃ§Ã£o atual:

```txt
compactLowerGroupTopPositions()
```

Coluna esquerda central:

- IrmÃ£os;
- Sobrinhos.

Coluna direita central:

- CÃ´njuge;
- Filhos;
- Netos.

Regra:

```txt
nÃ£o reintroduzir alignGroupStackToBottom() para grupos centrais sem mudanÃ§a explÃ­cita de objetivo visual.
```

---

## 17. Cards de pessoa

Os cards sÃ£o renderizados por:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Para relaÃ§Ãµes diretas (`directRelation`):

- o card recebe `layoutWidth` e `layoutHeight` definidos pelo layout;
- o estilo visual vem de `DIRECT_FAMILY_RELATION_COLORS`;
- pets podem usar estilo especÃ­fico;
- a borda de status usa:
  - vivo: `DIRECT_FAMILY_STATUS_BORDER_COLORS.alive`;
  - falecido: `DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased`;
- hÃ¡ borda de `4px`;
- hÃ¡ sombra e transiÃ§Ã£o de hover;
- clique abre detalhes;
- menu de contexto permite visualizar, editar, adicionar conexÃ£o e remover;
- handles do ReactFlow continuam presentes para conexÃµes.

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
- foto clicÃ¡vel abre dialog com imagem ampliada.

### 18.1 DimensÃ£o lÃ³gica

No layout direto:

```ts
CENTRAL_WIDTH = 620
CENTRAL_HEIGHT = 760
```

### 18.2 Altura visual automÃ¡tica

No `PersonNode.tsx`, o card central usa:

```tsx
minHeight: cardHeight
height: isCentralDirectNode ? 'auto' : cardHeight
```

Isso significa:

- `CENTRAL_HEIGHT = 760` funciona como altura mÃ­nima lÃ³gica;
- se foto + nome + detalhes exigirem mais espaÃ§o, o card central pode crescer visualmente;
- a foto nÃ£o precisa ser reduzida para impedir vazamento;
- a margem entre foto e texto Ã© preservada.

### 18.3 ConteÃºdo central exibido

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

Os tÃ­tulos de grupos sÃ£o renderizados por:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Para labels de grupo, a classe atual Ã©:

```tsx
text-[24px]
font-black
uppercase
min-h-[38px]
text-slate-900
```

Exemplos:

- BISAVÃ“S PATERNOS;
- AVÃ“S MATERNOS;
- TIOS PATERNOS;
- PRIMOS MATERNOS;
- IRMÃƒOS;
- CÃ”NJUGE;
- FILHOS.

Regra:

```txt
o tÃ­tulo principal da Ã¡rvore nÃ£o deve ser criado por este layout.
```

O tÃ­tulo principal fica como overlay em:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

## 20. Linhas e anchors

As linhas sÃ£o criadas depois do posicionamento dos grupos.

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
As conexÃµes estruturais usam anchors, nÃ£o dimensÃµes presumidas.
```

Isso permite que mudanÃ§as de escala, colunas, altura de containers e reposicionamento central sejam refletidas automaticamente nas linhas.

---

## 21. ConexÃµes principais

ConexÃµes estruturais incluem:

- Pai â†’ ponto mÃ©dio dos pais;
- ponto mÃ©dio dos pais â†’ MÃ£e;
- ponto mÃ©dio dos pais â†’ topo do card central;
- Pai â†’ Tios paternos;
- MÃ£e â†’ Tios maternos;
- centro â†’ IrmÃ£os;
- centro â†’ CÃ´njuge;
- pilhas laterais consecutivas:
  - TataravÃ³s â†’ BisavÃ³s â†’ AvÃ³s â†’ Tios â†’ Primos;
- pilhas inferiores:
  - IrmÃ£os â†’ Sobrinhos;
  - CÃ´njuge â†’ Filhos â†’ Netos.

Estilo estrutural:

```ts
DIRECT_STRUCTURAL_EDGE_STYLE = {
  stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
  strokeWidth: 3,
  opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
}
```

---

## 22. Pontos sensÃ­veis

### 22.1 Altura visual automÃ¡tica do card central

O card central pode crescer alÃ©m do `CENTRAL_HEIGHT` lÃ³gico.

Riscos:

- ReactFlow e anchors continuam baseados no layout lÃ³gico;
- se o crescimento visual for muito maior do que o lÃ³gico, pode haver desalinhamento entre borda visual e linhas.

Se o conteÃºdo central crescer muito, revisar:

```ts
CENTRAL_HEIGHT
centralNameFontSize
centralDetailFontSize
avatarSize
```

---

### 22.2 Bottom lÃ³gico lateral

O valor:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 600
```

estÃ¡ calibrado visualmente contra a Home atual.

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

Como `DirectFamilyLabelNode` usa `text-[24px]`, o `LABEL_HEIGHT` lÃ³gico tambÃ©m deve acompanhar:

```tsx
text-[24px]
min-h-[38px]
```

e:

```ts
LABEL_HEIGHT = 38
```

Se mudar a fonte dos tÃ­tulos de grupo, revisar os dois pontos juntos.

---

### 22.4 Ãrea central independente

A Ã¡rea central usa lÃ³gica prÃ³pria:

```ts
CENTRAL_PARENT_GAP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
compactLowerGroupTopPositions()
```

NÃ£o reintroduzir alinhamento inferior rÃ­gido nos grupos centrais sem decisÃ£o explÃ­cita de UX.

---

## 23. SugestÃµes futuras

PossÃ­veis evoluÃ§Ãµes:

1. Medir altura real do card central.
2. Transformar constantes em parÃ¢metros configurÃ¡veis.
3. Registrar commits de geometria da Ã¡rvore.
4. Separar tokens exclusivos da Minha Ãrvore.
5. Criar modo debug de geometria central.
6. Criar documentaÃ§Ã£o visual com imagens de antes/depois.

---

## 24. Checklist de validaÃ§Ã£o visual

ApÃ³s qualquer ajuste futuro nesta view, validar:

### View

- [ ] Minha Ãrvore abre sem flash ampliado inicial.
- [ ] Genealogia permanece funcional.
- [ ] VisÃ£o Completa permanece funcional.

### Ramos laterais

- [ ] Ramo paterno ocupa bem a altura disponÃ­vel.
- [ ] Ramo materno ocupa bem a altura disponÃ­vel.
- [ ] Primos/tios nÃ£o tÃªm sobras internas exageradas.
- [ ] Grupos laterais nÃ£o sobrepÃµem painel, tÃ­tulo ou bordas.

### Ãrea central

- [ ] Pai e MÃ£e nÃ£o ficam colados ao topo.
- [ ] Pai e MÃ£e tÃªm distÃ¢ncia adequada do card central.
- [ ] Pessoa principal fica visualmente central.
- [ ] Card principal exibe foto, nome e detalhes dentro da borda.
- [ ] IrmÃ£os, CÃ´njuge, Sobrinhos, Filhos e Netos ficam abaixo do card central com espaÃ§amento uniforme.

### Cards

- [ ] Nome em cards comuns ocupa no mÃ¡ximo 2 linhas.
- [ ] Nascimento/falecimento em cards comuns ocupam 1 linha cada, com ellipsis se necessÃ¡rio.
- [ ] Detalhes do card central tÃªm fonte legÃ­vel.
- [ ] Foto central nÃ£o empurra conteÃºdo para fora.
- [ ] Margem entre foto e texto central permanece adequada.

### Labels e linhas

- [ ] TÃ­tulos dos grupos estÃ£o legÃ­veis.
- [ ] Linhas estruturais conectam anchors corretos.
- [ ] Linhas nÃ£o atravessam cards de forma visualmente problemÃ¡tica.
- [ ] Highlights continuam funcionando.

### TÃ©cnico

```bash
npm run build
npm test
git diff --check
```

---

## 25. Resumo do estado atual

A view **Minha Ãrvore** estÃ¡ estruturada como uma composiÃ§Ã£o de trÃªs Ã¡reas:

- ramo paterno Ã  esquerda;
- Ã¡rea central independente;
- ramo materno Ã  direita.

Os ramos laterais usam distribuiÃ§Ã£o vertical atÃ© o bottom lÃ³gico `2410`, com redistribuiÃ§Ã£o da pilha inteira e escala compartilhada de colaterais.

A Ã¡rea central usa lÃ³gica prÃ³pria, com pessoa principal maior, card central com altura visual automÃ¡tica, Pai/MÃ£e deslocados para baixo em relaÃ§Ã£o ao topo original e grupos inferiores posicionados em pilhas compactas.

O ReactFlow sÃ³ aparece apÃ³s o viewport final estar calculado e aplicado, evitando o flash inicial de uma Ã¡rvore ampliada.

Os cards foram refinados para melhorar legibilidade, aumentar presenÃ§a da pessoa principal, reduzir sobras internas e garantir que as informaÃ§Ãµes centrais fiquem dentro do card.
