# View "Visão Geral" / Minha Árvore

Este documento registra o estado atualizado da view direta da árvore familiar, chamada na UI de **"Minha Árvore"**. A view funciona como uma visão geral individual da pessoa central: mostra ancestrais, pais, colaterais, cônjuge, irmãos, descendentes e filtros laterais em uma única área de ReactFlow.

O documento substitui a versão anterior de `docs/VIEW_VISAO_GERAL.md` e consolida os ajustes feitos ao longo do refinamento visual da Home, especialmente em:

- ocupação vertical dos ramos paterno e materno;
- distribuição da área central;
- altura e tipografia dos cards;
- controle do flash inicial do ReactFlow;
- títulos de grupos;
- documentação dos novos valores de layout.

---

## 1. Contexto

### Projeto

- Stack: React + Vite + TypeScript + Tailwind + Supabase.
- Página funcional: `Home.tsx`.
- Componente principal da árvore: `FamilyTree.tsx`.
- Layout da view direta: `directFamilyDistributedLayout.ts`.
- Componente visual dos cards de pessoa: `PersonNode.tsx`.
- Componente visual dos títulos de grupo: `DirectFamilyLabelNode.tsx`.

### Views existentes na Home

A página Home possui três views principais:

| View na UI | `viewMode` | Papel |
|---|---|---|
| Minha Árvore | `minha-arvore` | Visão direta individual da pessoa central |
| Genealogia | `genealogia` | Visão genealógica preservada separadamente |
| Visão Completa | `visao-completa` | Árvore expandida/completa |

Os ajustes descritos aqui se aplicam à view **Minha Árvore**. As views **Genealogia** e **Visão Completa** continuam isoladas por `viewMode`.

---

## 2. Arquivos relacionados

### Página e viewport

- `src/app/pages/Home.tsx`
  - Estrutura da página.
  - Header.
  - Painel lateral.
  - Área principal da árvore.
  - Renderização de `FamilyTree`.
  - Repasse de `layoutRevision`.

- `src/app/components/FamilyTree/FamilyTree.tsx`
  - Controle do ReactFlow.
  - Cálculo do viewport.
  - Aplicação do viewport final.
  - Controle de visibilidade do canvas.
  - Prevenção do flash inicial.
  - Zoom, pan e bounds.

### Layout lógico da Minha Árvore

- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts`
  - Frame lógico desktop e mobile.
  - Divisão horizontal `35% / 30% / 35%`.
  - Posições dos ramos paterno, central e materno.
  - Distribuição vertical dos grupos laterais.
  - Distribuição compacta dos grupos centrais inferiores.
  - Dimensões dos cards.
  - Anchors e linhas estruturais.

### Componentes visuais

- `src/app/components/FamilyTree/PersonNode.tsx`
  - Cards de pessoa.
  - Card central.
  - Foto/avatar.
  - Nome.
  - Detalhes de nascimento/falecimento/local.
  - Menu de contexto.
  - Bordas por status.

- `src/app/components/FamilyTree/DirectFamilyLabelNode.tsx`
  - Títulos dos grupos.
  - Título principal da árvore.

- `src/app/components/FamilyTree/directFamilyColors.ts`
  - Cores por tipo de relação.
  - Cores de texto e borda por status.

- `src/app/components/FamilyTree/visualTokens.ts`
  - Tokens visuais base.
  - Larguras e alturas base.
  - Tamanho base do avatar central.
  - Tokens das linhas estruturais.

- `src/app/components/FamilyTree/utils/personCardText.ts`
  - Formatação de datas.
  - Linhas de nascimento e falecimento.
  - Texto secundário dos cards.

---

## 3. Home e painel lateral

A página usa uma estrutura de tela cheia:

- `h-screen`;
- `flex flex-col`;
- `bg-gray-50`;
- header no topo;
- `main` com `flex-1 overflow-hidden`.

No desktop, o painel lateral fica em um `aside`:

- aberto: `w-80 p-4`;
- fechado: `w-14 p-2`;
- conteúdo em coluna;
- tabs via `SidebarPanelTabs`;
- área de conteúdo com `min-h-0 flex-1 overflow-visible`.

Na view **Minha Árvore**, o painel lateral exibe a aba **Filtros** com `DirectRelativeFilterGrid`.

### Filtros exibidos

A grade de filtros da família direta inclui:

- Tataravós;
- Bisavós;
- Avós;
- Tios;
- Primos;
- Cônjuge;
- Irmãos;
- Filhos;
- Sobrinhos;
- Netos;
- Vivos;
- Falecidos.

O bloco direto exclui pais dos filtros principais.

### Comportamento visual dos filtros

- Grid padrão em 2 colunas.
- Gap visual compacto.
- Botões com altura mínima de aproximadamente `40px`.
- Estado inativo com `grayscale opacity-45`.
- Estado sem dados com `disabled`, `cursor-not-allowed` e opacidade reduzida.
- Hover ativo com deslocamento vertical leve e sombra.

---

## 4. Viewport da árvore

Em `FamilyTree.tsx`, o ReactFlow desktop fica em uma área visual com:

- `TREE_DESKTOP_VISUAL_TOP_INSET = 70`;
- `TREE_DESKTOP_VISUAL_BOTTOM_INSET = 16`;
- `TREE_TITLE_TOP = 12`;
- `TREE_TITLE_HEIGHT = 48`;
- `TREE_VIEWPORT_PADDING_X = 24`;
- `TREE_VIEWPORT_PADDING_Y = 24`;
- `TREE_DIRECT_FAMILY_VIEWPORT_BOTTOM_PADDING_Y = 0`;
- `DIRECT_FAMILY_TRANSLATE_PADDING = 120`;
- `DIRECT_FAMILY_MAX_ZOOM = 2`;
- `DIRECT_FAMILY_FALLBACK_MIN_ZOOM = 0.01`.

A view **Minha Árvore** usa:

- `fitMode = contain`;
- alinhamento horizontal central;
- alinhamento vertical `top` no desktop;
- `minZoom` calculado a partir do viewport normalizado;
- `maxZoom = 2`;
- drag bloqueado no zoom mínimo;
- restauração do viewport inicial quando o usuário reduz o zoom até perto do mínimo.

### Prevenção do flash inicial

Foi ajustado o carregamento inicial da árvore para evitar que uma versão ampliada apareça por um frame antes do enquadramento final.

O estado atual inclui:

- `TREE_PENDING_VIEWPORT_ZOOM = TREE_INITIAL_TECHNICAL_MIN_ZOOM`;
- `viewportSignature` composta por:
  - `viewMode`;
  - `layoutRevision`;
  - `containerSize.width`;
  - `containerSize.height`;
  - `directFamilyViewport.x`;
  - `directFamilyViewport.y`;
  - `directFamilyViewport.zoom`;
- `hasAppliedCurrentViewport`;
- `canRenderReactFlow = Boolean(directFamilyViewport && viewportSignature)`;
- wrapper do ReactFlow com `visibility: hidden` até o viewport atual ser aplicado;
- ReactFlow renderizado condicionalmente somente quando há viewport calculado;
- `defaultViewport` usando diretamente `directFamilyViewport.x/y/zoom`.

Com isso, a área principal pode ficar brevemente vazia, mas a árvore aparece já no enquadramento correto.

---

## 5. Layout lógico da Minha Árvore

Arquivo: `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts`.

### Frame desktop atual

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

A altura lógica útil da view direta é:

```ts
viewportBounds.height = DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y - FRAME_TOP
```

Ou seja:

```ts
2410 - 10 = 2400
```

### Frame mobile

O frame mobile permanece separado:

```ts
MOBILE_FRAME_LEFT = -70
MOBILE_FRAME_RIGHT = 3290
MOBILE_FRAME_TOP = -30
MOBILE_FRAME_BOTTOM = 2230
```

---

## 6. Distribuição horizontal

A distribuição horizontal continua baseada em três áreas:

| Área | Papel | Proporção visual |
|---|---|---|
| Esquerda | Ramo paterno | ~35% |
| Centro | Pais, pessoa central, irmãos, cônjuge e descendentes diretos | ~30% |
| Direita | Ramo materno | ~35% |

Valores principais:

```ts
SIDE_AREA_OUTER_INSET_X = 48
SIDE_AREA_CENTER_GAP_X = 48
CENTRAL_AREA_TARGET_RATIO = 0.3
```

A área útil é calculada a partir de:

- `DIRECT_USEFUL_LEFT`;
- `DIRECT_USEFUL_RIGHT`;
- `DIRECT_AREA_CONTENT_WIDTH`;
- `CENTRAL_AREA_WIDTH`;
- `SIDE_AREA_WIDTH`;
- `PATERNAL_SIDE_AREA_*`;
- `MATERNAL_SIDE_AREA_*`.

O layout não usa offsets específicos por pessoa ou família para alinhar os lados. A separação horizontal permanece sistemática.

---

## 7. Dimensões principais atuais

### Tokens base

Em `visualTokens.ts`:

```ts
CARD_WIDTH = 410
CARD_HEIGHT = 190
CENTRAL_WIDTH = 620
CENTRAL_HEIGHT token = 680
CENTRAL_AVATAR_SIZE = 336
```

### Layout direto atual

No layout direto, os valores efetivos são:

| Elemento | Largura | Altura |
|---|---:|---:|
| Pessoa central lógica | `620` | `620` |
| Pais | `410` | `160` |
| Ancestrais laterais | `410` | `160` |
| Tios/primos base | `346` | `126` |
| Grupos inferiores centrais | `330` | `120` |

### Labels de grupo

Os labels de grupo foram ampliados:

```ts
LABEL_HEIGHT = 38
```

Em `DirectFamilyLabelNode.tsx`, os títulos de grupo usam:

```tsx
text-[24px]
min-h-[38px]
font-black
uppercase
```

---

## 8. Containers de grupo

Cada grupo visível gera:

1. node de label (`directFamilyLabelNode`);
2. node de container (`directFamilyGroupBoxNode`);
3. nodes de pessoa posicionados dentro do container;
4. anchors invisíveis de borda quando o grupo participa de conexões.

A altura de grupo é calculada por:

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

### Largura dos grupos

A função `getGroupWidth()` foi ajustada para evitar que grupos colaterais com 4 colunas ocupem automaticamente toda a largura da lane.

Regra atual:

```ts
if (spec.laneWidth && metrics.columns > 2 && spec.fillAvailableWidth) {
  return spec.laneWidth;
}
```

Com isso, tios e primos com 4 colunas não criam sobras laterais internas desnecessárias, exceto quando `fillAvailableWidth` estiver explicitamente ligado.

---

## 9. Regras de colunas

As colunas laterais são adaptativas:

- 1 item: 1 coluna;
- 2 itens: 2 colunas;
- 3 itens: 3 colunas;
- 4 itens: 4 colunas;
- 5 ou 6 itens: preferência por 3 colunas;
- 7 ou mais itens: preferência por 4 colunas;
- sempre respeitando a largura disponível da lane.

O layout pode reduzir colunas de grupos colaterais quando há sobra vertical grande e a redução ainda cabe na largura lateral.

---

## 10. Ramos laterais: paterno e materno

Os ramos laterais permanecem com a lógica de pilha vertical por lado.

### Grupos laterais

Ramo paterno:

- Tataravós paternos;
- Bisavós paternos;
- Avós paternos;
- Tios paternos;
- Primos paternos.

Ramo materno:

- Tataravós maternos;
- Bisavós maternos;
- Avós maternos;
- Tios maternos;
- Primos maternos.

### Bottom lógico

Os ramos laterais usam:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Esse valor foi calibrado para que os grupos laterais ocupem a área inferior disponível e se alinhem visualmente à base do container de filtros do painel esquerdo.

### Redistribuição vertical

A função `redistributeSideStackPlanToBottom()` redistribui a pilha lateral inteira entre:

```ts
SIDE_TOP = 170
```

e:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Isso evita que apenas o último grupo seja empurrado para o bottom e melhora a uniformidade visual entre ramo paterno e ramo materno.

### Escala compartilhada

O layout calcula a escala máxima segura para o lado paterno e para o lado materno. Quando ambos existem, usa a menor escala máxima entre eles como escala compartilhada. Isso evita assimetria visual entre tios/primos paternos e maternos.

### Escala dos colaterais

Valores principais:

```ts
SIDE_COLLATERAL_CARD_WIDTH = 346
SIDE_COLLATERAL_CARD_HEIGHT = 126
SIDE_COLLATERAL_CARD_SCALE_STEP = 0.04
SIDE_COLLATERAL_CARD_MAX_SCALE = 1.48
```

---

## 11. Área central

A área central foi redesenhada para deixar de seguir as regras rígidas dos ramos laterais.

### Estrutura central

A área central contém:

- Pai;
- Mãe;
- Pessoa principal;
- Irmãos;
- Sobrinhos;
- Cônjuge;
- Filhos;
- Netos.

### Pessoa central

A pessoa principal é centralizada com base no intervalo útil vertical da árvore:

```ts
CENTRAL_AREA_VERTICAL_CENTER_Y =
  (SIDE_GROUPS_TOP + DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y) / 2

CENTRAL_Y =
  CENTRAL_AREA_VERTICAL_CENTER_Y - CENTRAL_HEIGHT / 2
```

Com os valores atuais:

```ts
SIDE_GROUPS_TOP = 170
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
CENTRAL_HEIGHT = 620
```

O card central passa a ocupar uma posição vertical mais representativa do centro visual da árvore.

### Pai e mãe

Os grupos de Pai e Mãe não ficam mais presos ao topo da área lateral.

O posicionamento é:

```ts
CENTRAL_PARENT_GAP = 120
SIDE_PARENT_CARD_HEIGHT = 160

CENTRAL_PARENT_GROUP_Y =
  CENTRAL_Y - CENTRAL_PARENT_GAP - SIDE_PARENT_CARD_HEIGHT
```

Com isso, Pai e Mãe ficam acima da pessoa principal, mas com distância visual maior em relação às linhas estruturais e ao card central.

### Grupos inferiores centrais

Os grupos inferiores não são mais empurrados para o bottom lógico da view.

Eles partem de:

```ts
LOWER_GROUP_Y =
  CENTRAL_Y + CENTRAL_HEIGHT + CENTRAL_LOWER_GROUP_GAP
```

Valores atuais:

```ts
CENTRAL_LOWER_GROUP_GAP = 64
CENTRAL_LOWER_STACK_GAP = 34
```

A função atual é:

```ts
compactLowerGroupTopPositions()
```

Ela posiciona os grupos visíveis em sequência, com gap uniforme, sem alinhar o último grupo ao bottom.

### Grupos inferiores por coluna

Coluna esquerda central:

- Irmãos;
- Sobrinhos.

Coluna direita central:

- Cônjuge;
- Filhos;
- Netos.

---

## 12. Cards de pessoa

Os cards são renderizados por `PersonNode.tsx`.

Para relações diretas (`directRelation`):

- o card recebe `layoutWidth` e `layoutHeight` definidos pelo layout;
- o estilo visual vem de `DIRECT_FAMILY_RELATION_COLORS`;
- pets podem usar estilo específico;
- a borda de status usa:
  - vivo: `DIRECT_FAMILY_STATUS_BORDER_COLORS.alive`;
  - falecido: `DIRECT_FAMILY_STATUS_BORDER_COLORS.deceased`;
- há borda de `4px`;
- há sombra e transição de hover;
- clique abre detalhes;
- menu de contexto permite visualizar, editar, adicionar conexão e remover;
- handles do ReactFlow continuam presentes para conexões.

### Cards não centrais

Cards não centrais usam layout horizontal:

- avatar/foto à esquerda;
- texto à direita;
- nome em até 2 linhas;
- detalhes em linhas separadas com ellipsis;
- card com altura fixa definida pelo layout.

Valores atuais de cálculo:

```ts
isCompactDirectCard = cardHeight <= 160
isSmallDirectCard = cardHeight <= 175
```

Padding e gap:

```ts
nonCentralPaddingY:
  compacto: 5.5% da altura, limitado entre 8 e 12
  normal: 6.5% da altura, limitado entre 10 e 18

nonCentralPaddingX:
  compacto: 3% da largura, limitado entre 10 e 14
  normal: 3.5% da largura, limitado entre 12 e 20

nonCentralGap:
  compacto: 2.5% da largura, limitado entre 8 e 12
  normal: 3.5% da largura, limitado entre 12 e 18
```

Avatar não central:

```ts
compacto: 58% da altura, limitado entre 72 e 88
pequeno: 62% da altura, limitado entre 82 e 100
normal: 64% da altura, limitado entre 96 e 124
```

Fonte do nome não central:

```ts
estimatedNameFontForTwoLines =
  (nonCentralTextWidth * 2) /
  max(10, nome.length * 0.46)
```

Limites desktop:

```ts
compacto: mínimo 17, máximo 26
pequeno: máximo 29
normal: mínimo 19, máximo 30
```

Fonte dos detalhes não centrais:

```ts
estimatedDetailFontForOneLine =
  nonCentralTextWidth /
  max(8, linhaMaisLonga.length * 0.40)
```

Limites desktop:

```ts
compacto: mínimo 13, máximo 18
pequeno: mínimo 14, máximo 20
normal: mínimo 14, máximo 21
```

Espaçamento dos detalhes não centrais:

```tsx
compacto:
  mt-[8px]
  space-y-[6px]
  leading-[1.22]

normal:
  mt-[10px]
  space-y-[7px]
  leading-[1.26]
```

---

## 13. Card da pessoa principal

A pessoa principal usa tratamento especial:

- `directRelation = central`;
- layout vertical;
- foto/avatar acima;
- nome abaixo;
- detalhes abaixo do nome;
- fundo branco;
- texto escuro;
- borda por status vivo/falecido;
- foto clicável abre dialog com imagem ampliada.

### Dimensão lógica

No layout direto:

```ts
CENTRAL_WIDTH = 620
CENTRAL_HEIGHT = 620
```

### Altura visual automática

O card principal foi ajustado para evitar que o conteúdo interno vaze para fora da borda.

No `PersonNode.tsx`, o card central usa:

```tsx
minHeight: cardHeight
height: isCentralDirectNode ? 'auto' : cardHeight
```

Isso significa:

- `CENTRAL_HEIGHT = 620` funciona como altura mínima lógica;
- se foto + nome + detalhes exigirem mais espaço, o card central pode crescer visualmente;
- a foto não precisa ser reduzida para impedir vazamento;
- a margem entre foto e texto é preservada.

### Avatar central

O avatar central continua baseado em:

```ts
DIRECT_FAMILY_TOKENS.CENTRAL_AVATAR_SIZE = 336
```

Cálculo atual:

```ts
avatarSize =
  DIRECT_FAMILY_TOKENS.CENTRAL_AVATAR_SIZE
  * cardScale
  * mobileAvatarScale
  * 1.22
```

### Tipografia central

Nome:

```ts
centralNameFontSize =
  Math.max(
    42,
    Math.round((isMobile ? 62 : 58) * cappedCardScale * 1.2)
  )
```

Detalhes:

```ts
centralDetailFontSize =
  clampNumber(
    Math.round((isMobile ? 44 : 40) * cappedCardScale * 1.12),
    28,
    isMobile ? 42 : 38
  )
```

### Espaçamento central

Margem entre foto e texto:

```ts
marginTop = Math.max(28, Math.round(56 * cappedCardScale))
```

Bloco de detalhes:

```tsx
mt-6
space-y-2.5
leading-[1.22]
```

### Conteúdo central exibido

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

## 14. Labels de grupo

Os títulos de grupos são renderizados por `DirectFamilyLabelNode.tsx`.

Para labels de grupo, a classe atual é:

```tsx
text-[24px]
font-black
uppercase
min-h-[38px]
text-slate-900
```

Isso vale para labels como:

- BISAVÓS PATERNOS;
- AVÓS MATERNOS;
- TIOS PATERNOS;
- PRIMOS MATERNOS;
- IRMÃOS;
- CÔNJUGE;
- FILHOS.

O título principal da árvore continua com `variant = title`, usando tipografia maior própria.

---

## 15. Linhas e anchors

As linhas são criadas depois do posicionamento dos grupos.

O layout mede os containers reais com `getGroupBoxBounds()` e adiciona anchors via `addGroupBoundaryAnchors()`:

- top;
- bottom;
- left;
- right;
- center.

As conexões estruturais usam anchors, não dimensões presumidas. Isso permite que mudanças de escala, colunas, altura de containers e reposicionamento central sejam refletidas automaticamente nas linhas.

### Conexões principais

- Pai → ponto médio dos pais;
- ponto médio dos pais → Mãe;
- ponto médio dos pais → topo do card central;
- Pai → Tios paternos;
- Mãe → Tios maternos;
- centro → Irmãos;
- centro → Cônjuge;
- pilhas laterais consecutivas:
  - Tataravós → Bisavós → Avós → Tios → Primos;
- pilhas inferiores:
  - Irmãos → Sobrinhos;
  - Cônjuge → Filhos → Netos.

### Estilo atual das linhas diretas

```ts
DIRECT_STRUCTURAL_EDGE_STYLE = {
  stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
  strokeWidth: 3,
  opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
}
```

O stroke estrutural usa cinza claro vindo dos tokens da árvore.

---

## 16. Estado atual do alinhamento inferior

O alinhamento inferior da Minha Árvore é lógico, não medido diretamente do DOM do painel lateral.

A view usa:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Esse valor é resultado de:

```ts
DIRECT_FILTER_PANEL_BOTTOM_ALIGNMENT_Y = 1810
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 600
```

O ajuste foi calibrado visualmente para que os grupos laterais paternos e maternos ocupem melhor o espaço inferior e cheguem próximo da base visual do container de filtros do painel esquerdo.

A área central deixou de seguir o mesmo alinhamento inferior. Sobrinhos, filhos e netos não são mais forçados a encostar no bottom lógico; eles seguem uma pilha compacta abaixo do card central.

---

## 17. Regras preservadas

Continuam preservados:

- separação por `viewMode`;
- isolamento de `minha-arvore`, `genealogia` e `visao-completa`;
- distribuição horizontal `35% / 30% / 35%`;
- ramos paterno e materno sem offsets por pessoa/família;
- colunas adaptativas;
- centralização dos cards dentro dos containers;
- anchors de grupo para conexões;
- zoom mínimo calculado pelo viewport;
- drag bloqueado no zoom mínimo para Minha Árvore;
- zoom out perto do mínimo restaurando viewport inicial;
- debug visual desligado por padrão;
- ativação explícita do debug via `?treeDebug=1`.

---

## 18. Pontos sensíveis

### 18.1 Altura visual automática do card central

O card central agora pode crescer além do `CENTRAL_HEIGHT` lógico.

Isso resolve o vazamento de texto, mas exige atenção:

- o ReactFlow e os anchors continuam baseados no layout lógico;
- se o crescimento visual for muito maior do que o lógico, pode haver desalinhamento entre borda visual e linhas;
- por isso `CENTRAL_HEIGHT = 620` deve funcionar como uma aproximação generosa da altura real esperada.

Se o conteúdo central crescer muito no futuro, revisar primeiro:

```ts
CENTRAL_HEIGHT
centralNameFontSize
centralDetailFontSize
avatarSize
```

### 18.2 Bottom lógico lateral

O valor `DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 600` está calibrado visualmente contra a Home atual.

Se mudarem:

- altura do header;
- padding do painel lateral;
- top/bottom visual do ReactFlow;
- layout do painel de filtros;

então revisar:

```ts
TREE_DESKTOP_VISUAL_BOTTOM_INSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
```

### 18.3 Labels maiores

Como `DirectFamilyLabelNode` passou para `text-[24px]`, o `LABEL_HEIGHT` lógico também foi ampliado para `38`.

Se a fonte dos títulos de grupo mudar novamente, atualizar os dois pontos em conjunto:

```tsx
text-[24px]
min-h-[38px]
```

e:

```ts
LABEL_HEIGHT = 38
```

### 18.4 Área central independente

A área central agora tem sua própria lógica:

```ts
CENTRAL_PARENT_GAP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
compactLowerGroupTopPositions()
```

Não reintroduzir `alignGroupStackToBottom()` para os grupos centrais, a menos que o objetivo visual mude novamente.

---

## 19. Sugestões futuras

1. **Medir altura real do card central**
   - Se houver divergência entre altura visual automática e anchors, considerar passar uma altura medida do DOM para o layout ou padronizar o card central com uma altura lógica ainda mais fiel.

2. **Transformar constantes em parâmetros configuráveis**
   - `CENTRAL_PARENT_GAP`;
   - `CENTRAL_LOWER_GROUP_GAP`;
   - `CENTRAL_LOWER_STACK_GAP`;
   - `DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET`.

3. **Documentar commits de layout**
   - Manter registro dos commits que alteram geometria da árvore, porque pequenas mudanças impactam viewport, linhas e filtros.

4. **Separar tokens do layout direto**
   - Algumas dimensões hoje estão no layout (`directFamilyDistributedLayout.ts`) e outras em tokens (`visualTokens.ts`).
   - Uma futura reorganização poderia separar:
     - tokens globais;
     - tokens exclusivos da Minha Árvore;
     - tokens exclusivos da Genealogia.

5. **Criar modo debug de geometria central**
   - O debug atual exibe bounds gerais.
   - Um modo específico poderia mostrar:
     - `CENTRAL_Y`;
     - `CENTRAL_PARENT_GROUP_Y`;
     - `LOWER_GROUP_Y`;
     - `DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y`;
     - bounds dos grupos centrais.

---

## 20. Checklist de validação visual

Após qualquer ajuste futuro nesta view, validar:

### View

- [ ] Minha Árvore abre sem flash ampliado inicial.
- [ ] Genealogia permanece funcional.
- [ ] Visão Completa permanece funcional.

### Ramos laterais

- [ ] Ramo paterno ocupa bem a altura disponível.
- [ ] Ramo materno ocupa bem a altura disponível.
- [ ] Primos/tios não têm sobras internas exageradas.
- [ ] Grupos laterais não sobrepõem o painel, título ou bordas.

### Área central

- [ ] Pai e Mãe não ficam colados ao topo.
- [ ] Pai e Mãe têm distância adequada do card central.
- [ ] Pessoa principal fica visualmente central.
- [ ] Card principal exibe foto, nome e detalhes dentro da borda.
- [ ] Irmãos, Cônjuge, Sobrinhos, Filhos e Netos ficam abaixo do card central com espaçamento uniforme.

### Cards

- [ ] Nome em cards comuns ocupa no máximo 2 linhas.
- [ ] Nascimento/falecimento em cards comuns ocupam 1 linha cada, com ellipsis se necessário.
- [ ] Detalhes do card central têm fonte legível.
- [ ] Foto central não empurra conteúdo para fora.
- [ ] Margem entre foto e texto central permanece adequada.

### Labels e linhas

- [ ] Títulos dos grupos estão legíveis.
- [ ] Linhas estruturais conectam anchors corretos.
- [ ] Linhas não atravessam cards de forma visualmente problemática.
- [ ] Highlights continuam funcionando.

---

## 21. Resumo do estado atual

A view **Minha Árvore** está estruturada como uma composição de três áreas:

- ramo paterno à esquerda;
- área central independente;
- ramo materno à direita.

Os ramos laterais usam distribuição vertical até o bottom lógico `2410`, com redistribuição da pilha inteira e escala compartilhada de colaterais.

A área central usa lógica própria, com pessoa principal maior, card central com altura visual automática, Pai/Mãe deslocados para baixo em relação ao topo original e grupos inferiores posicionados em pilhas compactas.

O ReactFlow só aparece após o viewport final estar calculado e aplicado, evitando o flash inicial de uma árvore ampliada.

Os cards foram refinados para melhorar legibilidade, aumentar presença da pessoa principal, reduzir sobras internas e garantir que as informações centrais fiquem dentro do card.
