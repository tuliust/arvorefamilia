# Minha Árvore — view, layout e viewport

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Minha Árvore**.

---

## 1. Objetivo

Este documento registra o estado da view direta da árvore familiar chamada na UI de **Minha Árvore**.

A view funciona como uma visão geral individual da pessoa central, exibindo:

- ancestrais;
- pais;
- colaterais;
- cônjuge;
- irmãos;
- descendentes;
- filtros laterais;
- painel lateral;
- ReactFlow.

Este documento substitui a versão anterior:

```txt
docs/VIEW_VISAO_GERAL.md
```

e consolida decisões sobre:

- ocupação vertical dos ramos paterno e materno;
- distribuição da área central;
- altura e tipografia dos cards;
- controle do flash inicial do ReactFlow;
- títulos de grupos;
- viewport;
- constantes de layout.

---

## 2. Escopo

Este documento trata da geometria e UX da view **Minha Árvore**.

Para filtros, pets e regras de exibição, use:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

Para linhas, conectores, destaques e legenda, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Para exportação, use:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 3. Contexto técnico

Stack:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Supabase;
- ReactFlow.

Página funcional:

```txt
src/app/pages/Home.tsx
```

Componente principal da árvore:

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

Componente visual dos títulos de grupo:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

---

## 4. Views existentes na Home

A página `Home.tsx` possui três views principais:

| View na UI | `viewMode` | Papel |
|---|---|---|
| Minha Árvore | `minha-arvore` | Visão direta individual da pessoa central |
| Genealogia | `genealogia` | Visão genealógica preservada separadamente |
| Visão Completa | `visao-completa` | Árvore expandida/completa |

Regras:

- os ajustes deste documento se aplicam à view **Minha Árvore**;
- **Genealogia** e **Visão Completa** continuam isoladas por `viewMode`;
- não aplicar automaticamente lógica da Minha Árvore nas views por geração.

---

## 5. Arquivos relacionados

### Página e viewport

```txt
src/app/pages/Home.tsx
src/app/pages/home/*
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidades:

- estrutura da página;
- header;
- painel lateral;
- área principal da árvore;
- renderização de `FamilyTree`;
- repasse de `layoutRevision`;
- shell único das rotas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- cálculo e aplicação do viewport;
- controle de visibilidade do canvas;
- prevenção do flash inicial;
- zoom, pan e bounds.

### Layout lógico da Minha Árvore

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidades:

- frame lógico desktop e mobile;
- divisão horizontal `35% / 30% / 35%`;
- posições dos ramos paterno, central e materno;
- distribuição vertical dos grupos laterais;
- distribuição compacta dos grupos centrais inferiores;
- dimensões dos cards;
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

A página usa estrutura de tela cheia:

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
conteúdo em coluna
tabs via SidebarPanelTabs
área de conteúdo com min-h-0 flex-1
```

Na view **Minha Árvore**, o painel lateral exibe a aba **Filtros** com:

```txt
DirectRelativeFilterGrid
LifeStatusKpiGrid
```

A Home é o shell comum das três rotas da árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

`/` redireciona para `/minha-arvore` preservando search params. A troca de view pelo header ou pela navegação mobile usa navegação client-side e mantém parâmetros como `?pessoa=...`.

---

## 7. Filtros exibidos

A grade de filtros da família direta inclui grupos como:

```txt
Tataravós
Bisavós
Avós
Tios
Primos
Cônjuge
Irmãos
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

Regras específicas de filtros e pets ficam em:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 8. Viewport da árvore

Em `FamilyTree.tsx`, o ReactFlow desktop fica em uma área visual com constantes como:

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

A view **Minha Árvore** usa:

- `fitMode = contain`;
- alinhamento horizontal central;
- alinhamento vertical `top` no desktop;
- `minZoom` calculado a partir do viewport normalizado;
- `maxZoom = 2`;
- drag bloqueado no zoom mínimo;
- restauração do viewport inicial quando o usuário reduz o zoom até perto do mínimo.

---

## 9. Prevenção do flash inicial

Foi ajustado o carregamento inicial da árvore para evitar que uma versão ampliada apareça por um frame antes do enquadramento final.

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

- wrapper do ReactFlow fica com `visibility: hidden` até o viewport atual ser aplicado;
- ReactFlow renderiza condicionalmente somente quando há viewport calculado;
- `defaultViewport` usa diretamente `activeTreeViewport.x/y/zoom`;
- a área principal pode ficar brevemente vazia;
- a árvore deve aparecer já no enquadramento correto.

---

## 10. Layout lógico da Minha Árvore

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

A altura lógica útil da view direta é:

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

## 11. Distribuição horizontal

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

Regras:

- o layout não usa offsets específicos por pessoa ou família para alinhar os lados;
- a separação horizontal permanece sistemática;
- não introduzir ajustes manuais por família sem decisão explícita.

---

## 12. Dimensões principais atuais

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
| Pessoa central lógica | `620` | `760` |
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

### 13.1 Largura dos grupos

A função `getGroupWidth()` evita que grupos colaterais com 4 colunas ocupem automaticamente toda a largura da lane.

Regra atual:

```ts
if (spec.laneWidth && metrics.columns > 2 && spec.fillAvailableWidth) {
  return spec.laneWidth;
}
```

Com isso, tios e primos com 4 colunas não criam sobras laterais internas desnecessárias, exceto quando `fillAvailableWidth` estiver explicitamente ligado.

---

## 14. Regras de colunas

Colunas laterais adaptativas:

- 1 item: 1 coluna;
- 2 itens: 2 colunas;
- 3 itens: 3 colunas;
- 4 itens: 4 colunas;
- 5 ou 6 itens: preferência por 3 colunas;
- 7 ou mais itens: preferência por 4 colunas;
- sempre respeitando a largura disponível da lane.

O layout pode reduzir colunas de grupos colaterais quando há sobra vertical grande e a redução ainda cabe na largura lateral.

---

## 15. Ramos laterais: paterno e materno

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

### 15.1 Bottom lógico

Os ramos laterais usam:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 2410
```

Esse valor foi calibrado para que os grupos laterais ocupem a área inferior disponível e se alinhem visualmente à base do container de filtros do painel esquerdo.

### 15.2 Redistribuição vertical

A função:

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

- evitar que apenas o último grupo seja empurrado para o bottom;
- melhorar uniformidade visual entre ramo paterno e ramo materno.

### 15.3 Escala compartilhada

O layout calcula a escala máxima segura para o lado paterno e para o lado materno.

Quando ambos existem, usa a menor escala máxima entre eles como escala compartilhada.

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

## 16. Área central

Os ajustes desta seção se aplicam apenas à view **Minha Árvore**.

A área central foi redesenhada para deixar de seguir as regras rígidas dos ramos laterais.

### 16.1 Estrutura central

A área central contém:

- Pai;
- Mãe;
- Pessoa principal;
- Irmãos;
- Sobrinhos;
- Cônjuge;
- Filhos;
- Netos.

### 16.2 Pessoa central

A pessoa principal é centralizada com base no intervalo útil vertical da árvore:

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

Pai e Mãe são posicionados acima da pessoa principal:

```ts
CENTRAL_PARENT_GAP = 120
SIDE_PARENT_CARD_HEIGHT = 160

CENTRAL_PARENT_GROUP_Y =
  CENTRAL_Y - CENTRAL_PARENT_GAP - SIDE_PARENT_CARD_HEIGHT
```

### 16.4 Grupos inferiores

Os grupos inferiores partem de uma referência vertical própria, baseada em `CENTRAL_BASE_Y`.

```ts
LOWER_GROUP_Y =
  CENTRAL_BASE_Y + CENTRAL_LOWER_REFERENCE_HEIGHT + CENTRAL_LOWER_GROUP_GAP
```

Valores atuais:

```ts
CENTRAL_LOWER_GROUP_GAP = 120
CENTRAL_LOWER_STACK_GAP = 34
```

Função atual:

```txt
compactLowerGroupTopPositions()
```

Coluna esquerda central:

- Irmãos;
- Sobrinhos.

Coluna direita central:

- Cônjuge;
- Filhos;
- Netos.

Regra:

```txt
não reintroduzir alignGroupStackToBottom() para grupos centrais sem mudança explícita de objetivo visual.
```

---

## 17. Cards de pessoa

Os cards são renderizados por:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

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
- foto clicável abre dialog com imagem ampliada.

### 18.1 Dimensão lógica

No layout direto:

```ts
CENTRAL_WIDTH = 620
CENTRAL_HEIGHT = 760
```

### 18.2 Altura visual automática

No `PersonNode.tsx`, o card central usa:

```tsx
minHeight: cardHeight
height: isCentralDirectNode ? 'auto' : cardHeight
```

Isso significa:

- `CENTRAL_HEIGHT = 760` funciona como altura mínima lógica;
- se foto + nome + detalhes exigirem mais espaço, o card central pode crescer visualmente;
- a foto não precisa ser reduzida para impedir vazamento;
- a margem entre foto e texto é preservada.

### 18.3 Conteúdo central exibido

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

Os títulos de grupos são renderizados por:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Para labels de grupo, a classe atual é:

```tsx
text-[24px]
font-black
uppercase
min-h-[38px]
text-slate-900
```

Exemplos:

- BISAVÓS PATERNOS;
- AVÓS MATERNOS;
- TIOS PATERNOS;
- PRIMOS MATERNOS;
- IRMÃOS;
- CÔNJUGE;
- FILHOS.

Regra:

```txt
o título principal da árvore não deve ser criado por este layout.
```

O título principal fica como overlay em:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

## 20. Linhas e anchors

As linhas são criadas depois do posicionamento dos grupos.

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
As conexões estruturais usam anchors, não dimensões presumidas.
```

Isso permite que mudanças de escala, colunas, altura de containers e reposicionamento central sejam refletidas automaticamente nas linhas.

---

## 21. Conexões principais

Conexões estruturais incluem:

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

Estilo estrutural:

```ts
DIRECT_STRUCTURAL_EDGE_STYLE = {
  stroke: DIRECT_FAMILY_TOKENS.EDGE_STROKE,
  strokeWidth: 3,
  opacity: DIRECT_FAMILY_TOKENS.EDGE_OPACITY,
}
```

---

## 22. Pontos sensíveis

### 22.1 Altura visual automática do card central

O card central pode crescer além do `CENTRAL_HEIGHT` lógico.

Riscos:

- ReactFlow e anchors continuam baseados no layout lógico;
- se o crescimento visual for muito maior do que o lógico, pode haver desalinhamento entre borda visual e linhas.

Se o conteúdo central crescer muito, revisar:

```ts
CENTRAL_HEIGHT
centralNameFontSize
centralDetailFontSize
avatarSize
```

---

### 22.2 Bottom lógico lateral

O valor:

```ts
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 600
```

está calibrado visualmente contra a Home atual.

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

Como `DirectFamilyLabelNode` usa `text-[24px]`, o `LABEL_HEIGHT` lógico também deve acompanhar:

```tsx
text-[24px]
min-h-[38px]
```

e:

```ts
LABEL_HEIGHT = 38
```

Se mudar a fonte dos títulos de grupo, revisar os dois pontos juntos.

---

### 22.4 Área central independente

A área central usa lógica própria:

```ts
CENTRAL_PARENT_GAP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
compactLowerGroupTopPositions()
```

Não reintroduzir alinhamento inferior rígido nos grupos centrais sem decisão explícita de UX.

---

## 23. Sugestões futuras

Possíveis evoluções:

1. Medir altura real do card central.
2. Transformar constantes em parâmetros configuráveis.
3. Registrar commits de geometria da árvore.
4. Separar tokens exclusivos da Minha Árvore.
5. Criar modo debug de geometria central.
6. Criar documentação visual com imagens de antes/depois.

---

## 24. Checklist de validação visual

Após qualquer ajuste futuro nesta view, validar:

### View

- [ ] Minha Árvore abre sem flash ampliado inicial.
- [ ] Genealogia permanece funcional.
- [ ] Visão Completa permanece funcional.

### Ramos laterais

- [ ] Ramo paterno ocupa bem a altura disponível.
- [ ] Ramo materno ocupa bem a altura disponível.
- [ ] Primos/tios não têm sobras internas exageradas.
- [ ] Grupos laterais não sobrepõem painel, título ou bordas.

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

### Técnico

```bash
npm run build
npm test
git diff --check
```

---

## 25. Resumo do estado atual

A view **Minha Árvore** está estruturada como uma composição de três áreas:

- ramo paterno à esquerda;
- área central independente;
- ramo materno à direita.

Os ramos laterais usam distribuição vertical até o bottom lógico `2410`, com redistribuição da pilha inteira e escala compartilhada de colaterais.

A área central usa lógica própria, com pessoa principal maior, card central com altura visual automática, Pai/Mãe deslocados para baixo em relação ao topo original e grupos inferiores posicionados em pilhas compactas.

O ReactFlow só aparece após o viewport final estar calculado e aplicado, evitando o flash inicial de uma árvore ampliada.

Os cards foram refinados para melhorar legibilidade, aumentar presença da pessoa principal, reduzir sobras internas e garantir que as informações centrais fiquem dentro do card.
