# View "Visao Geral" / Minha Arvore

Este documento registra o estado atual da view direta da arvore familiar, chamada na UI de "Minha Arvore". No contexto dos ajustes recentes, ela funciona como a visao geral individual da pessoa central: mostra ancestrais, pais, colaterais, conjuge, irmaos, descendentes e filtros laterais em uma unica area de ReactFlow.

## Contexto

- Projeto: React + Vite + TypeScript + Tailwind + Supabase.
- Area funcional: pagina Home, componente FamilyTree e layout direto `directFamilyDistributedLayout`.
- View afetada pelos ajustes recentes: `minha-arvore`.
- Views preservadas por separacao de `viewMode`: `genealogia` e `visao-completa`.
- Ultimo refinamento relevante: `cad8912 style: refinar ocupacao visual da minha arvore`.

## Arquivos Relacionados

- `src/app/pages/Home.tsx:1192`: estrutura principal da pagina, header, painel lateral e area da arvore.
- `src/app/pages/Home.tsx:1429`: renderizacao de `FamilyTree`.
- `src/app/pages/Home.tsx:1445`: repasse de `layoutRevision`.
- `src/app/pages/Home.tsx:3152`: grid de filtros da familia direta.
- `src/app/components/FamilyTree/FamilyTree.tsx:108`: constantes visuais do viewport ReactFlow.
- `src/app/components/FamilyTree/FamilyTree.tsx:1014`: assinatura do viewport calculado.
- `src/app/components/FamilyTree/FamilyTree.tsx:1095`: aplicacao do viewport com `useLayoutEffect`.
- `src/app/components/FamilyTree/FamilyTree.tsx:1432`: canvas oculto ate o viewport atual estar aplicado.
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts:87`: frame logico desktop da Minha Arvore.
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts:115`: bottom logico extra para alinhamento inferior.
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts:165`: dimensoes dos cards laterais de tios/primos.
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts:1031`: reposicionamento do ultimo grupo lateral no bottom util.
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts:1052`: calculo da escala maxima segura por lado.
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts:1553`: escala compartilhada entre lado paterno e materno.
- `src/app/components/FamilyTree/PersonNode.tsx:240`: componente visual dos cards de pessoa.
- `src/app/components/FamilyTree/DirectFamilyLabelNode.tsx:1`: labels dos grupos.
- `src/app/components/FamilyTree/nodeTypes.ts:1`: registro dos node types do ReactFlow.
- `src/app/components/FamilyTree/TreeLegend.tsx:1`: legenda usada no painel lateral.
- `src/app/components/FamilyTree/visualTokens.ts:1`: tokens visuais base da arvore.
- `src/app/components/FamilyTree/directFamilyColors.ts:1`: cores dos filtros e grupos diretos.
- `src/app/components/FamilyTree/types.ts:1`: tipos, filtros e constantes compartilhadas.

## Home E Painel

A pagina usa `h-screen flex flex-col bg-gray-50`, header no topo e `main` com `flex-1 overflow-hidden`. O header tem area compacta, seletor de visualizacao e acoes de busca/usuario. O seletor de view tem largura responsiva: `min-w-[8.25rem]`, `w-[9.5rem]`, `sm:min-w-[10.5rem]` e `lg:min-w-[13rem]`.

No desktop, o painel lateral fica em um `aside` com:

- aberto: `w-80 p-4`, ou seja 320px de largura com 16px de padding;
- fechado: `w-14 p-2`;
- conteudo em coluna com `gap-3`;
- tabs via `SidebarPanelTabs`;
- area de conteudo com `min-h-0 flex-1 overflow-visible`.

Na view "Minha Arvore", o painel de filtros usa `DirectRelativeFilterGrid`:

- grid padrao: 2 colunas;
- gap: `gap-1.5`;
- botoes: `min-h-[40px]`, `rounded-lg`, `border`, `p-1.5`;
- estado inativo: `grayscale opacity-45`;
- estado sem dados: `disabled`, `cursor-not-allowed opacity-35`;
- hover ativo: deslocamento vertical leve e sombra.

O bloco direto exclui pais dos filtros principais e exibe tataravos, bisavos, avos, tios, primos, conjuge, irmaos, filhos, sobrinhos, netos, vivos e falecidos.

## Viewport Da Arvore

Em `FamilyTree.tsx`, o ReactFlow desktop fica dentro de um container visual com:

- `top: 70px`;
- `bottom: 16px`;
- titulo interno em `top: 12`, altura `48`;
- padding horizontal do viewport: `24`;
- padding vertical padrao: `24`;
- padding inferior especifico da Minha Arvore: `0`;
- `fitMode` da Minha Arvore: `contain`;
- alinhamento vertical desktop para Minha Arvore: `top`;
- `translateExtent` com padding `120`;
- `minZoom` calculado pelo viewport normalizado;
- `maxZoom` direto desktop: `2`;
- pan desabilitado no zoom minimo para `minha-arvore`;
- zoom out perto do minimo restaura o viewport inicial.

O viewport calculado agora tem uma assinatura (`viewportSignature`) composta por `viewMode`, `layoutRevision`, tamanho do container e valores `x/y/zoom`. O ReactFlow fica com `visibility: hidden` ate a assinatura atual ter sido aplicada. A aplicacao usa `useLayoutEffect`, e para `minha-arvore` nao anima o ajuste intermediario, reduzindo o flash inicial de uma versao ampliada antes do enquadramento final.

O debug visual da arvore continua existindo como ferramenta interna, mas nao e ativado por `localStorage`. Em estado normal ele fica desligado; a ativacao explicita permanece por query string `?treeDebug=1`.

## Layout Logico Da Minha Arvore

Em `directFamilyDistributedLayout.ts`, os valores desktop atuais sao:

- `DIRECT_FRAME_EXTRA_HORIZONTAL_SPACE = 560`;
- `DIRECT_FRAME_LEFT = -550`;
- `DIRECT_FRAME_RIGHT = 3770`;
- `FRAME_TOP = 10`;
- `FRAME_BOTTOM = 1810`;
- `SIDE_GROUPS_TOP = 170`;
- `SIDE_GROUPS_BOTTOM = FRAME_BOTTOM = 1810`;
- `DIRECT_FILTER_PANEL_BOTTOM_ALIGNMENT_Y = 1810`;
- `DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET = 140`;
- `DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 1950`;
- `CENTRAL_GROUP_BOTTOM = 1950`;
- `viewportBounds.height = DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y - FRAME_TOP = 1940`.

O frame mobile permanece separado:

- `MOBILE_FRAME_LEFT = -70`;
- `MOBILE_FRAME_RIGHT = 3290`;
- `MOBILE_FRAME_TOP = -30`;
- `MOBILE_FRAME_BOTTOM = 2230`.

## Distribuicao Horizontal

A distribuicao horizontal da Minha Arvore permanece baseada em:

- inset externo: `48`;
- gap entre areas: `48`;
- area central: `30%`;
- laterais dividindo os `70%` restantes;
- resultado visual: `35% / 30% / 35%`.

Os limites laterais sao calculados a partir de `DIRECT_USEFUL_LEFT`, `DIRECT_USEFUL_RIGHT`, `CENTRAL_AREA_WIDTH`, `SIDE_AREA_WIDTH`, `PATERNAL_SIDE_AREA_*` e `MATERNAL_SIDE_AREA_*`. O layout nao usa offsets especificos por pessoa/familia para alinhar os lados.

## Dimensoes Principais

Tokens e layout atual:

- card padrao em tokens: `410x190`;
- pessoa central em tokens: `620x680`;
- pessoa central no layout direto: `620x360`;
- avatar central em tokens: `336`;
- ancestrais laterais: `410x190`;
- pais: `410x190`;
- tios/primos base: `346x152`;
- grupos inferiores centrais: `330x142`;
- gaps laterais: `8`;
- padding do container de grupo: `18px` horizontal e `14px` vertical;
- label de grupo: `28`;
- gap entre label e cards: `8`;
- gap padrao antigo de coluna/linha para grupos nao especializados: `14` e `16`.

## Containers De Grupo

Cada grupo visivel gera:

- um node de label (`directFamilyLabelNode`);
- um node de container (`directFamilyGroupBoxNode`);
- nodes de pessoa posicionados dentro do container;
- anchors invisiveis de borda quando o grupo entra nas conexoes.

A altura de um grupo e calculada por:

`GROUP_BOX_PADDING_Y * 2 + LABEL_HEIGHT + LABEL_TO_CARD_GAP + cardsHeight`

A largura e calculada por `getGroupWidth()`:

- se houver `laneWidth`, grupos colaterais laterais com mais de 2 colunas podem ocupar a lane;
- caso contrario, a largura e proporcional ao maior entre largura dos cards e largura do label, mais padding horizontal;
- o valor final nunca ultrapassa a lane quando `laneWidth` existe.

A centralizacao dos cards usa a area interna do container:

- `innerLeft = groupX + GROUP_BOX_PADDING_X`;
- `innerRight = groupX + groupWidth - GROUP_BOX_PADDING_X`;
- `innerCenterX = (innerLeft + innerRight) / 2`.

Com isso, containers com 1 card, poucas colunas ou multiplas linhas mantem cards centralizados na area util.

## Regras De Colunas

As colunas laterais continuam adaptativas:

- 1 item: 1 coluna;
- 2 itens: 2 colunas;
- 3 itens: 3 colunas;
- 4 itens: 4 colunas;
- 5 ou 6 itens: preferencia por 3 colunas;
- 7 ou mais itens: preferencia por 4 colunas;
- sempre respeitando a largura disponivel da lane.

O layout tambem pode reduzir colunas de grupos colaterais quando ha sobra vertical grande e a reducao ainda cabe na largura lateral.

## Heuristica Lateral Atual

A pilha lateral usa `SideStackPlanItem` para planejar cada grupo antes de posicionar nodes. O fluxo atual e:

1. Calcula grupos visiveis.
2. Resolve colunas adaptativas.
3. Calcula alturas de grupo.
4. Monta um plano vertical base entre `SIDE_TOP = 170` e `SIDE_BOTTOM = 1810`.
5. Identifica o ultimo grupo colateral visivel.
6. Testa escalas de cards colaterais de `1.00` ate `1.48`, em passos de `0.04`.
7. Recalcula largura, altura e colunas em cada tentativa.
8. Aceita apenas se:
   - a largura couber na lane lateral;
   - o bottom nao passar de `DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 1950`;
   - o grupo nao sobrepor o anterior;
   - o gap minimo `SIDE_GROUP_MIN_GAP = 10` for preservado.
9. Calcula a maior escala segura do lado paterno e do lado materno.
10. Quando os dois lados existem, usa a menor escala maxima entre eles como escala compartilhada.

Essa regra faz tios/primos paternos e maternos seguirem a mesma logica visual, reduz assimetrias de largura/altura e mantem o ultimo grupo lateral alinhado ao bottom util.

## Grupos Inferiores Centrais

Os grupos inferiores centrais usam:

- irmaos;
- sobrinhos;
- conjuge;
- filhos;
- netos.

Eles partem de `LOWER_GROUP_Y`, usam `LOWER_GROUP_GAP` e sao redistribuidos por `lowerGroupTopPositions()`. Depois, `alignGroupStackToBottom()` alinha a pilha visivel ao mesmo bottom logico `DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 1950`. Assim, sobrinhos, filhos e netos, quando existirem, seguem a mesma base util dos primos.

## Cards De Pessoa

Os cards sao renderizados por `PersonNode.tsx`.

Para relacoes diretas (`directRelation`):

- o card recebe `width`, `height`, `layoutWidth` e `layoutHeight` definidos pelo layout;
- o estilo visual vem de `DIRECT_RELATION_STYLES` ou do estilo de pet;
- a borda de status usa `DIRECT_FAMILY_STATUS_BORDER_COLORS`, separando vivo/falecido;
- o card tem `rounded-lg`, borda de `4px`, sombra e transicao de hover;
- clique abre detalhes via `onClick`;
- menu de contexto abre acoes: visualizar, editar, adicionar conexao e remover;
- handles do ReactFlow continuam presentes para conexoes.

Para cards nao centrais da Minha Arvore:

- layout horizontal com avatar/imagem a esquerda e texto a direita;
- padding vertical: `7%` da altura, limitado entre `10` e `18`;
- padding horizontal: `3.5%` da largura, limitado entre `12` e `20`;
- gap interno: `3.5%` da largura, limitado entre `12` e `18`;
- imagem: pelo menos `96px`, usando `cardHeight - paddingY * 2`;
- texto: largura minima `120px`;
- fonte do nome e estimada para caber em ate duas linhas;
- fonte do nome desktop fica entre `17` e `24`;
- fonte de detalhe desktop deriva de `72%` do nome e fica entre `12` e `17`.

## Card Da Pessoa Principal

A pessoa principal fica no centro da Minha Arvore, com tratamento especial:

- tamanho no layout direto: `620x360`;
- usa `directRelation = central`;
- usa layout vertical centralizado;
- padding minimo: `22px` vertical e `34px` horizontal, escalado a partir dos tokens;
- fonte do nome: minimo `28px`;
- fonte dos detalhes: minimo `15px`;
- avatar central baseado em `CENTRAL_AVATAR_SIZE = 336`, escalado pelo tamanho real do card;
- se houver foto principal, o avatar vira botao para abrir dialog de foto ampliada;
- detalhes exibidos priorizam idade, local/data de nascimento e local atual;
- o card central usa fundo branco, texto escuro e borda de status vivo/falecido.

## Linhas E Anchors

As linhas sao criadas depois do posicionamento dos grupos. O layout mede os containers reais com `getGroupBoxBounds()` e adiciona anchors por `addGroupBoundaryAnchors()`:

- top;
- bottom;
- left;
- right;
- center.

As conexoes estruturais usam esses anchors, nao dimensoes presumidas. Isso permite que alteracoes de escala, colunas e altura de containers sejam refletidas automaticamente nas linhas.

Principais conexoes:

- pai -> ponto medio dos pais;
- ponto medio dos pais -> mae;
- ponto medio dos pais -> topo do card central;
- pai -> tios paternos;
- mae -> tios maternos;
- centro -> irmaos;
- centro -> conjuge;
- pilhas laterais consecutivas: tataravos -> bisavos -> avos -> tios -> primos;
- pilhas inferiores: irmaos -> sobrinhos e conjuge -> filhos -> netos.

As linhas usam estilos estruturais com cinza claro vindo dos tokens (`EDGE_STROKE = #CBD5E1`, `EDGE_STROKE_WIDTH = 1.6`, `EDGE_OPACITY = 0.72`) e podem receber destaque conforme filtros visuais de relacao.

## Estado Atual Do Alinhamento Inferior

O alinhamento inferior e logico, nao medido diretamente do DOM do painel lateral. A Minha Arvore mira o bottom util do ReactFlow por `DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 1950`. Como o ReactFlow desktop usa `bottom: 16px`, esse bottom visual coincide com a base interna do painel de filtros no layout desktop atual.

Na validacao visual apos o ultimo ajuste, o bottom do grupo `PRIMOS PATERNOS` ficou alinhado ao bottom do ReactFlow e ao bottom do container de filtros medido no navegador. O espaco inferior residual deixou de ser causado por `padding` ou `viewport` e passou a depender principalmente da quantidade real de cards/grupos visiveis em cada familia.

## Regras Preservadas

- Distribuicao horizontal `35% / 30% / 35%`.
- Margens externas de `48px`.
- Gaps entre areas de `48px`.
- Cards centralizados dentro dos containers.
- Colunas adaptativas.
- Topo dos grupos superiores preservado.
- Bottom dos grupos baixos alinhado ao bottom logico util.
- Zoom minimo enquadrado.
- Drag no zoom minimo bloqueado para Minha Arvore.
- Zoom out perto do minimo restaura o viewport inicial.
- Genealogia e Visao Completa continuam isoladas por `viewMode`.
- Debug visual desligado por padrao.

## Analise

O sistema atual esta consistente: `Home.tsx` define o espaco de tela e o painel, `FamilyTree.tsx` calcula e aplica o viewport do ReactFlow, e `directFamilyDistributedLayout.ts` opera em coordenadas logicas com bounds proprios.

O ponto mais sensivel segue sendo o alinhamento inferior: ele e resolvido por equivalencia entre bottom logico e area visual do ReactFlow, nao por leitura direta do DOM do painel de filtros. Essa escolha e mais estavel e menos acoplada ao layout da Home, mas significa que mudancas futuras no header, no padding do aside ou no posicionamento visual do ReactFlow podem exigir revisao dos valores `TREE_DESKTOP_VISUAL_BOTTOM_INSET` ou `DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET`.

## Sugestoes Futuras

1. Manter documentado que `SIDE_BOTTOM = 1810` preserva a distribuicao superior original, enquanto `DIRECT_GROUPS_BOTTOM_ALIGNMENT_Y = 1950` e o bottom util dos grupos inferiores.
2. Se a base do painel de filtros mudar no DOM, revisar primeiro `TREE_DESKTOP_VISUAL_BOTTOM_INSET` e depois `DIRECT_GROUPS_BOTTOM_ALIGNMENT_OFFSET`.
3. Evitar offsets por pessoa/familia; a regra atual por pilha e escala compartilhada e mais robusta.
4. Caso seja exigido alinhamento matematico com o DOM em todos os viewports, considerar passar uma medida real do painel para `FamilyTree`; isso seria mais invasivo e hoje nao parece necessario.
