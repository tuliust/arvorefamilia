# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-07  
> Revisão complementar: refinamento visual de `/minha-arvore`, título/viewport, alianças e pendências de QA  
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
- título fixo da árvore;
- viewport;
- constantes de layout;
- alianças/vínculos conjugais na view direta.

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

Para componentes reutilizáveis, use:

```txt
docs/GUIA_COMPONENTES.md
```

Para decisões gerais de UX, use:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 2.1 Estado de revisão visual atual

Esta documentação diferencia **comportamento consolidado** de **refinamento visual ainda pendente**.

### Consolidado

- A view **Minha Árvore** mantém layout próprio, separado de **Genealogia** e **Visão Completa**.
- O título principal é overlay único em `FamilyTree.tsx`; layouts internos não devem criar título principal.
- Subtítulos abaixo dos títulos das views da árvore podem permanecer ocultos/removidos.
- Ajustes de fundo, bordas, conectores e paletas devem ser feitos por tokens/CSS variables, sem alterar dados.
- Ajustes visuais não devem criar migrations, alterar RLS, Supabase, permissões ou dados reais.

### Em refinamento visual

- O título da árvore ainda precisa de padding superior adequado: não deve ficar colado ao topo da área da árvore.
- O espaço entre título e cards ainda precisa ser reduzido sem cortar cards superiores.
- As alianças da view **Minha Árvore** devem ficar claramente visíveis; o problema não deve ser resolvido voltando a usar emoji.
- O menu do usuário no header da árvore deve ser comparado com o menu das páginas internas para confirmar se ambos usam o mesmo painel compartilhado.

Regra operacional:

```txt
Antes de documentar esses pontos como concluídos, validar em browser real nas rotas /minha-arvore, /genealogia e /visao-completa, nas paletas white, orange e brown.
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

Componente visual do vínculo conjugal direto:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
```

Tipo relacionado:

```txt
src/app/components/FamilyTree/types.ts
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
- não aplicar automaticamente lógica da Minha Árvore nas views por geração;
- as três views compartilham o shell `Home`, mas cada layout preserva regras próprias.

---

## 5. Arquivos relacionados

### 5.1 Página e viewport

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

### 5.2 Layout lógico da Minha Árvore

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
- linhas estruturais;
- marriage nodes diretos com variante visual `direct-family`.

### 5.3 Componentes visuais

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/utils/personCardText.ts
```

---

## 6. Home, header e painel lateral

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

`/` redireciona para `/minha-arvore` preservando search params. A troca de view pelo header ou pela navegação mobile usa navegação client-side e mantém parâmetros como `pessoa=...`.

### 6.1 Menu do usuário no header da árvore

O header da árvore usa:

```tsx
<UserProfileMenu variant="home-header" />
```

Comportamento esperado:

- o botão visual permanece compacto no header;
- o conteúdo aberto deve ser o painel completo de `UserProfileMenu`, equivalente ao menu das páginas internas;
- o antigo `UserMenu` local de `Home.tsx` não deve ser recriado;
- a área superior do painel com avatar, nome e e-mail é clicável e navega para `/minha-arvore/editar`;
- o botão `X` apenas fecha o painel;
- o item **Editar notificações** não aparece mais no menu.

Ponto de verificação pendente:

```txt
Se os prints ou o ambiente atual mostrarem dropdown compacto nas views da árvore e painel completo nas páginas internas, investigar HomeHeader.tsx, UserProfileMenu.tsx e MemberPageHeader.tsx antes de considerar o menu como unificado.
```

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

## 8. Título fixo e viewport da árvore

Em `FamilyTree.tsx`, o título da árvore é renderizado como overlay fixo acima do ReactFlow.

Textos esperados, conforme view:

```txt
A árvore de {primeiro nome}
Família de {primeiro nome}
Linha Genealógica de {primeiro nome}
```

Regras:

- o título geral não deve ser criado em `directFamilyDistributedLayout.ts`;
- o título geral não deve ser criado em `genealogyColumnsLayout.ts`;
- subtítulos abaixo do título podem permanecer ocultos/removidos nas views da árvore;
- deve haver pequeno espaçamento vertical acima do título;
- o espaço entre título e cards deve ser reduzido sem cortar cards superiores;
- o ajuste deve ser feito por constantes/cálculo em `FamilyTree.tsx`;
- não usar `translate`, `transform`, `top` negativo ou manipulação de `.react-flow__viewport`;
- `family-tree-visual-polish.css` não deve reposicionar o ReactFlow nem alterar bounds.
- qualquer tentativa com `translate` em `.react-flow__viewport` deve ser removida se cortar cards superiores;
- ajustes finos devem priorizar `TREE_TITLE_TOP`, `TREE_TITLE_HEIGHT`, `TREE_DESKTOP_VISUAL_TOP_INSET` e `TREE_DESKTOP_VISUAL_BOTTOM_INSET`.

Status atual de QA visual:

```txt
Subtítulos: removidos/ocultos.
Padding superior do título: pendente de refinamento.
Espaço título ↔ cards: pendente de refinamento.
Cards superiores cortados por translate: regressão conhecida; não repetir essa abordagem.
```

Constantes relevantes em `FamilyTree.tsx`:

```txt
TREE_TITLE_TOP
TREE_TITLE_HEIGHT
TREE_DESKTOP_VISUAL_TOP_INSET
TREE_DESKTOP_VISUAL_BOTTOM_INSET
TREE_VIEWPORT_PADDING_X
TREE_VIEWPORT_PADDING_Y
TREE_DIRECT_FAMILY_VIEWPORT_BOTTOM_PADDING_Y
DIRECT_FAMILY_TRANSLATE_PADDING
DIRECT_FAMILY_MAX_ZOOM
DIRECT_FAMILY_FALLBACK_MIN_ZOOM
```

> Observação: os valores numéricos dessas constantes devem ser conferidos diretamente em `FamilyTree.tsx` antes de qualquer nova alteração. Documentar valores fixos aqui só é seguro quando a frente de layout estiver congelada.

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

### 10.1 Frame desktop

Valores e constantes estruturais devem ser conferidos no arquivo antes de alteração. Pontos principais:

```txt
DIRECT_FRAME_EXTRA_HORIZONTAL_SPACE
DIRECT_FRAME_LEFT
DIRECT_FRAME_RIGHT
FRAME_TOP
FRAME_BOTTOM
SIDE_GROUPS_TOP
SIDE_GROUPS_BOTTOM
DIRECT_FILTER_PANEL_BOTTOM_ALIGNMENT_Y
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
CENTRAL_GROUP_BOTTOM
```

A altura lógica útil da view direta é baseada na diferença entre o bottom lógico dos grupos e o topo do frame.

### 10.2 Frame mobile

O frame mobile permanece separado e deve ser revisado de forma isolada.

Constantes relevantes:

```txt
MOBILE_FRAME_LEFT
MOBILE_FRAME_RIGHT
MOBILE_FRAME_TOP
MOBILE_FRAME_BOTTOM
```

Regras:

- não ajustar frame mobile como efeito colateral de correção desktop;
- validar 320px, 375px, 390px, 430px e 768px após mudanças.

---

## 11. Distribuição horizontal

A distribuição horizontal continua baseada em três áreas:

| Área | Papel | Proporção visual |
|---|---|---|
| Esquerda | Ramo paterno | ~35% |
| Centro | Pais, pessoa central, irmãos, cônjuge e descendentes diretos | ~30% |
| Direita | Ramo materno | ~35% |

Valores principais:

```txt
SIDE_AREA_OUTER_INSET_X
SIDE_AREA_CENTER_GAP_X
CENTRAL_AREA_TARGET_RATIO
```

Regras:

- layout não usa offsets específicos por pessoa ou família para alinhar os lados;
- separação horizontal permanece sistemática;
- não introduzir ajustes manuais por família sem decisão explícita;
- reduzir espaços laterais ociosos deve preservar gap entre colunas.

---

## 12. Dimensões principais

### 12.1 Tokens base

Em `visualTokens.ts`, conferir:

```txt
CARD_WIDTH
CARD_HEIGHT
CENTRAL_WIDTH
CENTRAL_HEIGHT
CENTRAL_AVATAR_SIZE
```

### 12.2 Layout direto

Elementos principais:

| Elemento | Observação |
|---|---|
| Pessoa central lógica | Maior e visualmente destacada |
| Pais | Cards acima da pessoa central |
| Ancestrais laterais | Ramos paterno/materno |
| Tios/primos | Cards colaterais adaptáveis |
| Grupos inferiores centrais | Irmãos, cônjuge, filhos, netos etc. |


### 12.3 Padronização recente dos cards de parentes

Diretriz visual da rodada de refinamento:

```txt
Todos os cards de parentes, exceto a pessoa principal, devem convergir para o tamanho base dos cards de tios/primos: 340 × 136.
Pessoa principal mantém CENTRAL_WIDTH × 760.
```

Aplicação esperada em `/minha-arvore`:

| Grupo | Tamanho visual esperado |
|---|---:|
| Tataravós, bisavós e avós | 340 × 136 |
| Tios e primos | 340 × 136 |
| Pai e mãe | 340 × 136 |
| Irmãos, sobrinhos, cônjuge, filhos, pets e netos | 340 × 136 |
| Pessoa principal | `CENTRAL_WIDTH × 760` |

Cuidados:

- validar se a alteração não desalinha anchors e conectores;
- validar nomes longos e truncamento;
- validar corte inferior em grupos de primos e sobrinhos;
- validar as paletas `white`, `orange` e `brown`.

### 12.4 Títulos de grupo

Os labels de grupo usam dimensão lógica e tipografia própria em:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Regras:

- se alterar fonte dos títulos de grupo, revisar também altura lógica do label;
- labels de grupo são permitidas;
- título principal da árvore não deve ser criado por labels de grupo.

---

## 13. Containers de grupo

Cada grupo visível gera:

1. node de label (`directFamilyLabelNode`);
2. node de container (`directFamilyGroupBoxNode`);
3. nodes de pessoa posicionados dentro do container;
4. anchors invisíveis de borda quando o grupo participa de conexões.

Altura de grupo é calculada por:

```txt
GROUP_BOX_PADDING_Y * 2 + LABEL_HEIGHT + LABEL_TO_CARD_GAP + cardsHeight
```

Constantes relevantes:

```txt
GROUP_BOX_PADDING_X
GROUP_BOX_PADDING_Y
LABEL_HEIGHT
LABEL_TO_CARD_GAP
```

### 13.1 Largura dos grupos

A função `getGroupWidth()` evita que grupos colaterais com muitas colunas ocupem automaticamente toda a largura da lane.

Regra:

- tios e primos com várias colunas não devem criar sobras laterais internas desnecessárias;
- grupos só devem preencher a largura disponível quando `fillAvailableWidth` estiver explicitamente ligado.

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

Os ramos laterais usam bottom lógico calibrado contra a Home atual.

Constantes relevantes:

```txt
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
```

Se mudarem:

- altura do header;
- padding do painel lateral;
- top/bottom visual do ReactFlow;
- layout do painel de filtros;

revisar:

```txt
TREE_DESKTOP_VISUAL_BOTTOM_INSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
```

### 15.2 Redistribuição vertical

A função:

```txt
redistributeSideStackPlanToBottom()
```

redistribui a pilha lateral inteira entre o topo lateral e o bottom lógico.

Objetivo:

- evitar que apenas o último grupo seja empurrado para o bottom;
- melhorar uniformidade visual entre ramo paterno e ramo materno.

### 15.3 Escala compartilhada

O layout calcula a escala máxima segura para o lado paterno e para o lado materno.

Quando ambos existem, usa a menor escala máxima entre eles como escala compartilhada.

Objetivo:

```txt
evitar assimetria visual entre tios/primos paternos e maternos
```

---

## 16. Área central

Os ajustes desta seção se aplicam apenas à view **Minha Árvore**.

A área central foi redesenhada para deixar de seguir regras rígidas dos ramos laterais.

### 16.1 Estrutura central

A área central contém:

- Pai;
- Mãe;
- Pessoa principal;
- Irmãos;
- Sobrinhos;
- Cônjuge;
- Filhos;
- Netos;
- Pets, quando aplicável.

### 16.2 Pessoa central

A pessoa principal é centralizada com base no intervalo útil vertical da árvore.

Constantes/conceitos relevantes:

```txt
CENTRAL_AREA_VERTICAL_CENTER_Y
CENTRAL_BASE_Y
CENTRAL_Y
CENTRAL_HEIGHT
CENTRAL_LOWER_REFERENCE_HEIGHT
CENTRAL_AREA_SHIFT_DOWN
CENTRAL_CORE_SHIFT_UP
```

### 16.3 Grupos superiores

Pai e Mãe são posicionados acima da pessoa principal.

Constantes/conceitos relevantes:

```txt
CENTRAL_PARENT_GAP
SIDE_PARENT_CARD_HEIGHT
CENTRAL_PARENT_GROUP_Y
```

### 16.4 Grupos inferiores

Os grupos inferiores partem de referência vertical própria, baseada em `CENTRAL_BASE_Y`.

Constantes/conceitos relevantes:

```txt
LOWER_GROUP_Y
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
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
não reintroduzir alignGroupStackToBottom() para grupos centrais sem mudança explícita de objetivo visual
```

### 16.5 Árvore esparsa

Quando a pessoa central não possui pais, ancestrais ou grupos laterais visíveis, mas possui grupos inferiores diretos, a view usa composição central mais compacta.

Critério técnico:

```txt
sem grupos paternos/maternos renderizáveis
sem Pai/Mãe renderizáveis
com pelo menos um grupo inferior renderizável
```

Grupos inferiores considerados:

```txt
Irmãos
Sobrinhos
Cônjuge
Filhos
Pets
Netos
```

Comportamento:

- tamanhos dos cards são preservados;
- Y inicial dos grupos inferiores usa constante específica de árvore esparsa;
- gap interno da pilha inferior usa constante específica;
- viewport lógico usa bounds verticais menores para melhorar enquadramento inicial;
- regra não é aplicada quando existem pais, ancestrais, tios, primos ou qualquer grupo lateral visível.

Objetivo:

```txt
evitar grande vazio vertical em árvores incompletas sem alterar a composição de árvores densas
```

---

## 17. Cards de pessoa

Cards são renderizados por:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Para relações diretas (`directRelation`):

- card recebe `layoutWidth` e `layoutHeight` definidos pelo layout;
- estilo visual vem de tokens da família direta;
- pets podem usar estilo específico;
- borda de status diferencia vivo/falecido;
- há sombra e transição de hover;
- clique abre detalhes;
- menu de contexto permite visualizar, editar, adicionar conexão e remover;
- handles do ReactFlow continuam presentes para conexões.

Regras:

- nome em cards comuns deve ocupar no máximo 2 linhas;
- nascimento/falecimento em cards comuns devem caber com ellipsis quando necessário;
- mudanças de largura devem preservar conectores e anchors;
- evitar corte inferior de nomes/informações.

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

```txt
CENTRAL_WIDTH
CENTRAL_HEIGHT
```

### 18.2 Altura visual automática

No `PersonNode.tsx`, o card central pode usar altura visual automática com altura mínima lógica.

Isso significa:

- `CENTRAL_HEIGHT` funciona como altura mínima lógica;
- se foto + nome + detalhes exigirem mais espaço, o card central pode crescer visualmente;
- a foto não precisa ser reduzida apenas para impedir vazamento;
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

Títulos de grupos são renderizados por:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
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
o título principal da árvore não deve ser criado por este layout
```

O título principal fica como overlay em:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

## 20. Linhas e anchors

As linhas são criadas depois do posicionamento dos grupos.

O layout mede containers reais com:

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
as conexões estruturais usam anchors, não dimensões presumidas
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

```txt
DIRECT_STRUCTURAL_EDGE_STYLE
```

---

## 22. Alianças e vínculo conjugal

### 22.1 Componente

```txt
src/app/components/FamilyTree/MarriageNode.tsx
```

Tipo:

```txt
src/app/components/FamilyTree/types.ts
```

Campo relevante:

```ts
visualVariant?: 'default' | 'direct-family';
```

### 22.2 Variante `direct-family`

Os marriage nodes criados pelo layout direto devem receber:

```ts
visualVariant: 'direct-family'
```

Objetivo:

- melhorar visibilidade das alianças em `/minha-arvore`;
- reforçar borda/halo/contraste do SVG;
- preservar clique no modal conjugal;
- preservar dimensão do nó;
- preservar handles invisíveis;
- preservar edges.

### 22.3 Variante padrão

Views por geração, especialmente `/genealogia`, devem manter o visual padrão já aprovado.

Regras:

- não aplicar `direct-family` em nodes de Genealogia sem nova decisão;
- não degradar o anel conjugal da Genealogia;
- validar `/genealogia` após qualquer ajuste em `MarriageNode`.

### 22.4 Anti-regressão

Não fazer:

- voltar a exibir emoji corrompido como `??`;
- remover SVG de alianças;
- esconder ícone por stroke/fill sem contraste;
- alterar dimensão lógica do node para resolver problema visual sem recalcular layout;
- quebrar clique no modal conjugal.

---

## 23. Pontos sensíveis

### 23.1 Altura visual automática do card central

O card central pode crescer além do `CENTRAL_HEIGHT` lógico.

Riscos:

- ReactFlow e anchors continuam baseados no layout lógico;
- se crescimento visual for muito maior que o lógico, pode haver desalinhamento entre borda visual e linhas.

Se o conteúdo central crescer muito, revisar:

```txt
CENTRAL_HEIGHT
centralNameFontSize
centralDetailFontSize
avatarSize
```

### 23.2 Bottom lógico lateral

Se mudarem:

- altura do header;
- padding do painel lateral;
- top/bottom visual do ReactFlow;
- layout do painel de filtros;

revisar:

```txt
TREE_DESKTOP_VISUAL_BOTTOM_INSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y
```

### 23.3 Labels maiores

Se mudar a fonte dos títulos de grupo, revisar simultaneamente:

```txt
LABEL_HEIGHT
DirectFamilyLabelNode.tsx
```

### 23.4 Área central independente

A área central usa lógica própria:

```txt
CENTRAL_PARENT_GAP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
compactLowerGroupTopPositions()
```

Não reintroduzir alinhamento inferior rígido nos grupos centrais sem decisão explícita de UX.

### 23.5 Espaçamento título ↔ árvore

O espaçamento entre título e cards é sensível.

Regras:

- ajustar por constantes em `FamilyTree.tsx`;
- não mover `.react-flow__viewport`;
- não usar `translate`;
- não usar CSS com `height: calc(...)` para ampliar artificialmente canvas;
- validar se cards superiores não foram cortados.

---

## 24. Busca no header da árvore

A busca do header é compartilhada pelas rotas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Comportamento consolidado:

- botão de busca deve ser clicável em toda a área visual;
- campo usa placeholder **Buscar pessoa ou página...**;
- sugestões aparecem automaticamente ao digitar;
- sugestões incluem pessoas e páginas;
- páginas locais importantes, como **Notificações** e **Ajustar Notificações**, devem aparecer quando o termo bater;
- usuário pode abrir página completa de resultados;
- clicar fora fecha sugestões;
- pressionar `Esc` fecha sugestões;
- sugestões devem ficar acima do canvas da árvore.

Para pessoas sugeridas, a linha secundária deve seguir:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Não exibir cidade atual nessa linha.

---

## 25. Dropdowns do header

O header da árvore possui:

- seletor de view;
- seletor de paletas;
- menu do usuário;
- busca expansível;
- atalhos para curiosidades, fórum e calendário.

Regras de camada:

- sugestões de busca devem ficar acima da árvore;
- menu do usuário não pode ficar coberto pelo header;
- dropdown de views não pode ficar coberto pelo header;
- componentes base Radix devem usar camada superior ao header.

Componentes base relacionados:

```txt
src/app/components/ui/select.tsx
src/app/components/ui/dropdown-menu.tsx
```

---

## 26. Legendas > Linhas

A opção **Todas** em **Legendas > Linhas** deve ocultar todas as linhas da árvore.

Isso inclui:

- linhas de filiação;
- linhas de irmãos;
- linhas conjugais quando aplicável ao filtro;
- linhas horizontais e verticais que conectam cards de primos.

Regra anti-regressão:

```txt
se usuário desliga Todas, nenhuma linha estrutural de primos deve permanecer visível
```

---

## 27. Cards e espaços laterais da Minha Árvore

Ajustes de layout da view direta devem obedecer estas regras:

- reduzir espaços laterais ociosos sem comprimir a leitura;
- ampliar cards quando houver área disponível;
- ampliar grupos de parentes usando espaços externos;
- preservar gap entre colunas;
- usar melhor o lado esquerdo dos grupos paternos;
- usar melhor o lado direito dos grupos maternos;
- evitar truncamento excessivo de nomes;
- evitar corte inferior de nomes e informações.

Status:

```txt
linhas de primos no filtro Todas -> consolidado
corte inferior de nomes -> consolidado
redução de espaços laterais e ampliação de cards -> em ajuste incremental
```

### 27.1 Ajustes recentes de geometria desktop

A frente recente de refinamento de `/minha-arvore` desktop concentrou-se em:

- reduzir linhas verticais laterais dos ramos paterno e materno;
- reduzir espaços internos excessivos entre colunas de tios/primos;
- aumentar o respiro entre as áreas esquerda, central e direita;
- subir grupos e cards da área central quando houver sobra superior;
- reduzir risco de corte dos grupos inferiores, especialmente primos e sobrinhos;
- padronizar os cards de parentes no tamanho `340 × 136`, exceto pessoa principal.

Constantes que costumam participar desse ajuste:

```txt
DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET
SIDE_AREA_CENTER_GAP_X
CENTRAL_AREA_TARGET_RATIO
SIDE_COLLATERAL_CARD_WIDTH
SIDE_COLLATERAL_CARD_HEIGHT
SIDE_COLUMN_GAP
SIDE_ROW_GAP
ANCESTOR_COLUMN_GAP
ANCESTOR_ROW_GAP
CENTRAL_AREA_SHIFT_DOWN
CENTRAL_CORE_SHIFT_UP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
STANDARD_GROUP_CARD_WIDTH
SIDE_ANCESTOR_CARD_HEIGHT
SIDE_PARENT_CARD_HEIGHT
LOWER_CARD_WIDTH
LOWER_CARD_HEIGHT
```

Regra:

```txt
Alterar essas constantes de forma incremental, validando visualmente antes de novo commit.
```

### 27.2 Pendências visuais específicas

Permanecem como pendências de refinamento:

- dar padding superior ao título sem aumentar o vazio abaixo dele;
- reduzir o espaço entre título e cards por constantes em `FamilyTree.tsx`;
- garantir que nenhum card superior seja cortado;
- tornar o ícone de alianças claramente visível em `/minha-arvore`;
- confirmar se o menu do header da árvore abriu o painel compartilhado ou um dropdown legado.

---

## 28. Paletas visuais e containers de grupo

A view **Minha Árvore** respeita a paleta visual global escolhida no seletor da árvore.

Paletas definidas em:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
```

Impactos na view direta:

- cards de parentes usam cores derivadas da paleta ativa;
- containers de grupo usam background, borda e largura de borda por CSS variables;
- paleta branca preserva visual padrão da `main`;
- paleta laranja incorpora variação visual `polish`;
- paleta marrom aplica identidade editorial bege/marrom inspirada no Sua Família;
- escolha da paleta não altera geometria, filtros, contadores ou dados.

Arquivos relacionados:

```txt
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

---

## 29. Validação visual obrigatória

Após qualquer ajuste futuro nesta view, validar:

### View

- [ ] Minha Árvore abre sem flash ampliado inicial.
- [ ] Genealogia permanece funcional.
- [ ] Visão Completa permanece funcional.

### Header

- [ ] Busca abre e fecha corretamente.
- [ ] Sugestões de pessoas e páginas aparecem.
- [ ] Seletor de views não fica coberto pelo header.
- [ ] Menu do usuário não fica coberto pelo header.
- [ ] Botão compacto do menu abre o painel de `UserProfileMenu`.
- [ ] Cabeçalho do menu navega para `/minha-arvore/editar`.
- [ ] Botão `X` apenas fecha.

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

### Labels, linhas e alianças

- [ ] Títulos dos grupos estão legíveis.
- [ ] Linhas estruturais conectam anchors corretos.
- [ ] Linhas não atravessam cards de forma visualmente problemática.
- [ ] Highlights continuam funcionando.
- [ ] Legendas > Linhas > Todas oculta linhas de primos.
- [ ] Alianças em `/minha-arvore` estão visíveis.
- [ ] Alianças em `/genealogia` permanecem corretas.
- [ ] Clique na aliança abre modal conjugal.

### Técnico

```bash
npm run build
npm test
git diff --check
```

---

## 30. Sugestões futuras

Possíveis evoluções:

1. Medir altura real do card central.
2. Transformar constantes em parâmetros configuráveis.
3. Registrar commits de geometria da árvore.
4. Separar tokens exclusivos da Minha Árvore.
5. Criar modo debug de geometria central.
6. Criar documentação visual com imagens de antes/depois.
7. Criar QA automatizado específico para presença visual de alianças.
8. Criar snapshot visual controlado para as três views da árvore.

---


## 31. Revisão complementar - pendências pós-refinamento de layout

Esta seção registra o estado a partir da validação visual recente.

### 31.1 Concluído ou aceitável

- Subtítulos abaixo dos títulos das três views foram removidos/ocultados.
- A paleta `white` deve usar fundo branco puro na área da árvore.
- Linhas estruturais devem acompanhar a cor da borda dos grupos por CSS variables.
- Cards de parentes da **Minha Árvore** foram direcionados para padronização visual em `340 × 136`, exceto a pessoa principal.
- A compactação vertical/horizontal de `/minha-arvore` desktop deve ser tratada no layout direto, não com escala global do renderer.

### 31.2 Ainda pendente

- Título da árvore precisa de padding superior.
- Espaço abaixo do título ainda precisa ser reduzido sem `translate` no viewport.
- Alianças em `/minha-arvore` ainda precisam ficar visualmente perceptíveis.
- Diferença entre o menu do header da árvore e o menu das páginas internas precisa ser diagnosticada no código.

### 31.3 Arquivos prioritários para próxima etapa

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/styles/family-tree-visual-polish.css
src/app/pages/home/HomeHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
```

### 31.4 Validação obrigatória

```bash
git diff --check
npm run build
git status --short
```

Validação visual mínima:

```txt
/minha-arvore desktop/mobile nas paletas white, orange e brown
/genealogia desktop/mobile nas paletas white, orange e brown
/visao-completa desktop/mobile nas paletas white, orange e brown
/calendario-familiar e /forum para comparação do menu do usuário
```

---

## 32. Resumo do estado atual

A view **Minha Árvore** está estruturada como composição de três áreas:

- ramo paterno à esquerda;
- área central independente;
- ramo materno à direita.

Os ramos laterais usam distribuição vertical até bottom lógico próprio, com redistribuição da pilha inteira e escala compartilhada de colaterais.

A área central usa lógica própria, com pessoa principal maior, card central com altura visual automática, Pai/Mãe deslocados para baixo em relação ao topo original e grupos inferiores posicionados em pilhas compactas.

O ReactFlow só aparece após o viewport final estar calculado e aplicado, evitando flash inicial de árvore ampliada.

Os cards foram refinados para melhorar legibilidade, aumentar presença da pessoa principal, reduzir sobras internas e garantir que as informações centrais fiquem dentro do card.

O título fixo da árvore é controlado por `FamilyTree.tsx`. Correções de espaçamento não devem mover `.react-flow__viewport`.

As alianças da **Minha Árvore** usam variante `direct-family` para melhorar legibilidade sem alterar o estilo já aprovado em **Genealogia**.
