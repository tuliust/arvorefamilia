# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-10
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`
> Tipo: documentação técnica/funcional da view **Minha Árvore**.
> Status: atualizado com a malha mobile 3×3, tela Central, ancestrais globais, conectores e preview de swipe.

## 1. Função deste documento

Este documento descreve a view direta **Minha Árvore**, acessada pela rota:

```txt
/minha-arvore
```

Use este arquivo para manter:

- shell da Home aplicado à árvore;
- viewport, pan, zoom e scroll;
- distribuição da pessoa central e dos grupos diretos;
- regras de filtros diretos;
- largura e alinhamento dos cards compactos da view direta;
- group boxes, labels e âncoras dos grupos;
- integração com painel lateral, legenda e ações;
- controles mobile da árvore;
- anti-regressões específicas da view direta.

Não use este documento para detalhar:

| Tema | Documento |
|---|---|
| edição do próprio perfil | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` |
| filtros e pets em detalhe | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| legendas, linhas e conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| componentes | `docs/GUIA_COMPONENTES.md` |
| UX geral | `docs/GUIA_UX_LAYOUT.md` |
| Genealogia e Visão Completa | `docs/funcionalidades/GENEALOGIA_VIEW.md` |

---

## Nota de verificação contra o código atual

Esta revisão consolida os ajustes implementados neste ciclo da `/minha-arvore` mobile e substitui a documentação anterior, que ainda descrevia o fluxo antigo de sete telas e abas `Núcleo`/`Completa`.

Estado confirmado/esperado da frente atual:

- `HomeTreeSection.tsx` continua renderizando `MobileFamilyTreeView` somente em mobile e somente quando `treeViewMode === 'minha-arvore'`.
- `MobileFamilyTreeView.tsx` mantém a experiência mobile separada de `FamilyTree`/ReactFlow; desktop/tablet continuam usando o layout ReactFlow da Minha Árvore.
- As abas superiores internas do mobile são apenas **Paterno**, **Central** e **Materno**; a antiga aba **Completa** não deve reaparecer.
- A navegação mobile usa uma malha 3×3 de telas: **Ancestrais globais** acima da tela **Central**, **Tios Paternos** à esquerda, **Tios Maternos** à direita, **Primos Paternos** abaixo dos tios paternos e **Primos Maternos** abaixo dos tios maternos.
- A tela **Ancestrais globais** reúne os ramos paterno e materno em duas colunas, com grupos de **Tataravós**, **Bisavós** e **Avós** quando houver pessoas.
- Os grupos de ancestrais não usam mais o container externo único `Ancestrais Paternos/Maternos` do fluxo antigo.
- Tios usam cards compactos em grupo ampliado; primos exibem todos os cards disponíveis e usam rolagem vertical quando a altura útil não comporta todos.
- Os conectores HTML/CSS do mobile são independentes dos edges ReactFlow e incluem conexões entre avós/bisavós/tataravós, avós → pai/mãe, pai/mãe → tios e tios → primos.
- As linhas laterais de Pai e Mãe ficam no mesmo contexto rolável dos cards, para acompanhar o movimento vertical da tela Central.
- Primos são fim de ramo: não deve haver linha inferior abaixo dos grupos de primos.
- O swipe direcional mantém a navegação entre telas e recebeu pré-visualização da próxima tela durante o gesto por deslocamento temporário da malha.

Regra documental desta revisão:

```txt
Documentar como implementado apenas o que pertence ao MobileFamilyTreeView atual; intenções futuras devem permanecer como backlog explícito.
```

---

## 2. Estado atual

A view **Minha Árvore** está consolidada no MVP.

Ela renderiza uma visão individual da pessoa central, com:

- pessoa central;
- pais;
- avós, bisavós e tataravós;
- cônjuge;
- irmãos;
- filhos;
- netos;
- tios, primos e sobrinhos;
- pets quando vinculados;
- filtros de grupos;
- filtros por vivo/falecido/pet;
- linhas de parentesco e destaques;
- clique em pessoa para abrir perfil;
- clique em relacionamento conjugal para abrir modal;
- ações de exportação pelo painel lateral no desktop;
- painel compacto de controles no mobile.

A view direta possui ajuste visual próprio: os cards compactos dos grupos laterais, inferiores e centrais podem ser exibidos mais largos do que o padrão lógico original, preservando o card central e sem contaminar as views de Genealogia/Visão Completa.

Nesta revisão, o padrão visual corrente da `/minha-arvore` é:

| Tipo de card | Dimensão lógica/base | Exibição visual atual |
|---|---:|---:|
| Pessoa central | `620px × 760px` | Mantida |
| Cards compactos de grupos da Minha Árvore | `340px × 136px` | Largura visual de referência: `360px` |
| Cards de Genealogia/Visão Completa | `410px × 190px` | Mantidos, sem herdar `360px` |

A ampliação visual de `360px` é uma decisão de UI da view direta. A consolidação ideal é estrutural, no layout/tokens da árvore; enquanto estiver em CSS complementar, deve permanecer fortemente escopada por `data-export-view="minha-arvore"`.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Shell da árvore, estado, filtros e navegação | `src/app/pages/Home.tsx` |
| Header da Home pós-login | `src/app/pages/home/HomeHeader.tsx` |
| Área principal da árvore | `src/app/pages/home/HomeTreeSection.tsx` |
| Navegação mobile da Home | `src/app/pages/home/HomeMobileNav.tsx` |
| Componente ReactFlow | `src/app/components/FamilyTree/FamilyTree.tsx` |
| Controles mobile da árvore | `src/app/components/FamilyTree/MobileTreeControlsPortal.tsx` |
| Layout mobile segmentado da Minha Árvore | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Estilos dos controles mobile | `src/styles/mobile-tree-controls.css` |
| Ajustes visuais complementares da árvore | `src/styles/family-tree-visual-polish.css` |
| Layout direto | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Nodes customizados e ajuste de largura visual | `src/app/components/FamilyTree/nodeTypes.ts` |
| Cards de pessoa | `src/app/components/FamilyTree/PersonNode.tsx` |
| Painel especial da pessoa central | `src/app/components/FamilyTree/CentralPersonFocusPanel.tsx` |
| Nó de relacionamento conjugal | `src/app/components/FamilyTree/MarriageNode.tsx` |
| Cores/tokens | `src/app/components/FamilyTree/visualTokens.ts` e `directFamilyColors.ts` |
| Tipos e filtros | `src/app/components/FamilyTree/types.ts` |


## 3.1 MobileFamilyTreeView atual

No mobile, a `/minha-arvore` não usa o canvas ReactFlow da versão desktop/tablet. A experiência direta é renderizada por:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Estrutura atual:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Abas superiores:

```txt
Paterno | Central | Materno
```

Comportamento:

- **Paterno** abre a tela de Tios Paternos;
- **Central** abre a tela central;
- **Materno** abre a tela de Tios Maternos;
- swipe para cima a partir da Central abre Ancestrais globais;
- swipe lateral a partir da Central abre tios paternos/maternos;
- swipe para baixo a partir dos tios abre os respectivos primos;
- swipe para cima a partir dos primos volta aos respectivos tios;
- a tela de Ancestrais globais permite retornar para Central ou ir para os tios por gesto lateral;
- o gesto de swipe exibe pré-visualização parcial da próxima tela durante o movimento.

Regras visuais:

- Ancestrais globais ficam em tela própria acima da Central, não como continuidade vertical da Central;
- ramos paterno e materno de ancestrais ficam em duas colunas;
- grupos de ancestrais são **Tataravós**, **Bisavós** e **Avós**;
- primos exibem todos os cards, sem botão **Ver todos**;
- telas com muitos cards usam rolagem vertical interna e padding inferior contra a bottom navigation;
- conectores HTML/CSS do mobile não são edges ReactFlow;
- linhas de Pai/Mãe acompanham o scroll da tela Central;
- não deve haver linha inferior abaixo de primos.

---

## 4. Rotas e viewMode

A view usa o mesmo shell das rotas de árvore:

| Rota | `viewMode` | Escopo |
|---|---|---|
| `/minha-arvore` | `minha-arvore` | família direta da pessoa central |
| `/genealogia` | `genealogia` | escopo pessoal por gerações |
| `/visao-completa` | `visao-completa` | base familiar completa por gerações |

Regras:

- ajustes deste documento devem ser condicionados a `viewMode === 'minha-arvore'` ou a sinais equivalentes de layout direto;
- não aplicar ajustes da view direta em `genealogia` ou `visao-completa` sem validação específica;
- trocar view deve usar helpers de `treeViewMode.ts`;
- search params, como `?pessoa=...`, devem ser preservados na troca de view;
- alterações em `nodeTypes.ts` precisam ser validadas nas três rotas.

---

## 5. Shell da Home

`Home.tsx` usa shell fixo na viewport:

```txt
fixed inset-0
flex flex-col
overflow-hidden
overscroll-none
```

A área principal usa:

```txt
relative flex min-h-0 flex-1 overflow-hidden overscroll-none
```

Regras:

- a página externa não deve rolar quando a árvore ocupa a viewport;
- pan/zoom interno do ReactFlow deve continuar funcionando;
- não resolver scroll externo quebrando a interação do canvas;
- `HomeTreeSection` deve manter `overflow-hidden` e `overscroll-none`;
- sidebar desktop e painel mobile devem ter rolagem própria quando necessário.

---

## 6. Pessoa central

A pessoa central é definida por prioridade:

1. `?pessoa=...`, quando válido;
2. pessoa vinculada ao usuário (`user_person_links`);
3. seleção local;
4. primeira pessoa carregada como fallback.

Em `FamilyTree`, a referência efetiva é:

```txt
centralPersonId || selectedPersonId || pessoas[0]?.id
```

Regras:

- a pessoa central deve permanecer visível mesmo quando filtros por status ocultam outras pessoas;
- em `/minha-arvore`, `isSelected` e `isCentralPerson` são aplicados apenas para essa view;
- quando houver somente a pessoa central real renderizada, o componente pode usar `CentralPersonFocusPanel`;
- o card central da pessoa foco não deve receber a ampliação visual aplicada a pai, mãe, cônjuge, irmãos, descendentes e pets.

---

## 7. Filtros da view direta

A view direta combina quatro grupos de filtros.

| Estado | Função |
|---|---|
| `edgeFilters` | controla linhas visíveis |
| `visualLineFilters` | controla destaque visual de linhas visíveis |
| `personFilters` | controla cards por vivo/falecido/pet |
| `directRelativeFilters` | controla grupos diretos da Minha Árvore |

`directRelativeFilters` usa:

```txt
pais
avos
bisavos
tataravos
conjuge
filhos
netos
irmaos
sobrinhos
tios
primos
pets
```

Regras:

- `directRelativeFilters` é específico de `minha-arvore`;
- em mobile, a view direta usa `DEFAULT_DIRECT_RELATIVE_FILTERS`;
- `pets` permanece sempre ativo nos filtros diretos efetivos;
- filtros de linha não devem ocultar cards;
- filtros de destaque não devem recriar linhas ocultas;
- contadores devem respeitar o escopo visual da view direta.

---

## 8. Layout direto

O layout principal é:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Ele monta:

- grupos laterais paternos e maternos;
- centro com pais, pessoa central, cônjuge, irmãos e descendentes;
- group boxes;
- labels de grupos;
- anchors estruturais;
- edges estruturais;
- nós conjugais;
- separação visual de filhos humanos e pets.

Áreas conceituais:

| Área | Papel |
|---|---|
| esquerda | ramo paterno e colaterais |
| centro | núcleo direto da pessoa central |
| direita | ramo materno e colaterais |
| faixa inferior | descendentes, netos e pets |

Regras:

- título geral não deve ser criado pelo layout;
- labels de grupo podem existir;
- group boxes e anchors não devem comandar o zoom inicial;
- alterações em constantes de posição devem ser validadas em desktop e mobile;
- cards diretos devem preservar legibilidade;
- a ampliação atual dos cards centrais é uma decisão de UI específica da Minha Árvore, não um novo padrão global de cards.

---

## 9. Largura dos cards compactos da Minha Árvore

A view direta possui cards com dimensões lógicas calculadas pelo layout e uma camada de ajuste visual complementar.

Dimensões de referência:

| Tipo | Largura | Altura | Observação |
|---|---:|---:|---|
| Card central da pessoa foco | `620px` | `760px` | Não deve ser ampliado pelo ajuste de cards compactos. |
| Cards compactos da Minha Árvore | `340px` | `136px` | Podem ser exibidos visualmente com `360px`. |
| Cards de `/genealogia` e `/visao-completa` | `410px` | `190px` | Não devem herdar a largura de `360px`. |

Escopo da ampliação visual atual:

| Grupo/relação | Pode exibir `360px`? | Observação |
|---|---:|---|
| Pai | Sim | Card central superior, deve crescer em direção ao eixo central quando aplicável. |
| Mãe | Sim | Card central superior, deve crescer em direção ao eixo central quando aplicável. |
| Irmãos | Sim | Não deve cortar nomes com reticências quando houver espaço. |
| Sobrinhos | Sim | Não deve cortar nomes com reticências quando houver espaço. |
| Cônjuge | Sim | Deve permanecer alinhado ao núcleo central. |
| Filhos | Sim | Quando existirem, seguem padrão compacto ampliado. |
| Netos | Sim | Quando existirem, seguem padrão compacto ampliado. |
| Pets | Sim | Mantêm distinção visual de pet. |
| Avós, bisavós e tataravós | Sim | Podem usar `360px`, mas não devem deslocar a árvore para fora da área útil. |
| Tios e primos laterais | Sim | Linhas horizontais internas tendem a ficar mais curtas; validar visualmente. |
| Pessoa central | Não | Mantém dimensão própria. |
| Genealogia/Visão Completa | Não | Mantêm `410px × 190px`. |

Regra técnica consolidada:

```txt
A ampliação de cards compactos deve ser restrita à viewMode === 'minha-arvore'.
```

Comportamento visual:

- cards à esquerda do eixo central podem crescer em direção ao centro pela direita;
- cards à direita do eixo central podem crescer em direção ao centro pela esquerda;
- grupos de **Tios** e **Primos** devem reduzir visualmente o excesso de linha horizontal entre cards quando a largura aumenta;
- cards da área central, como **Mãe**, **Irmãos**, **Sobrinhos**, **Cônjuge** e **Pets**, devem priorizar legibilidade do nome completo;
- nomes longos devem quebrar linha quando houver altura suficiente, evitando `...` desnecessário;
- a ampliação não deve contaminar `/genealogia` e `/visao-completa`.

Dívida técnica controlada:

```txt
Se o ajuste estiver em family-tree-visual-polish.css, tratá-lo como camada provisória.
A solução preferencial é migrar largura, anchors, group boxes e conectores para directFamilyDistributedLayout.ts.
```

Atenção:

- se a largura-base dos cards compactos mudar, revisar todos os seletores e cálculos relacionados;
- se a ampliação migrar para o layout estrutural, revisar anchors, labels, group boxes e edges;
- se nomes voltarem a aparecer com reticências em cards com espaço disponível, revisar `PersonNode.tsx` e os overrides de texto escopados da view direta.

## 10. Grupos, labels e anchors após ampliação

Após a ampliação dos cards compactos, grupos visuais, labels e anchors precisam continuar coerentes.

Grupos que exigem validação após alteração de largura:

```txt
PAI
MÃE
AVÓS PATERNOS
BISAVÓS PATERNOS
TATARAVÓS PATERNOS
TIOS PATERNOS
PRIMOS PATERNOS
IRMÃOS
SOBRINHOS
CÔNJUGE
FILHOS
NETOS
PETS
AVÓS MATERNOS
BISAVÓS MATERNOS
TATARAVÓS MATERNOS
TIOS MATERNOS
PRIMOS MATERNOS
```

Regras:

- `directFamilyGroupBoxNode` deve acompanhar visualmente a largura dos cards contidos quando o ajuste for estrutural;
- labels (`directFamilyLabelNode`) devem permanecer centralizadas no centro visual do group box;
- anchors invisíveis (`directFamilyAnchorNode`) devem acompanhar bordas e centros visuais dos grupos;
- linhas devem conectar bordas/centros atuais, não coordenadas antigas;
- grupos laterais de **Tios** e **Primos** devem evitar linhas horizontais excessivamente longas entre cards;
- grupos centrais do lado direito devem crescer em direção ao centro quando necessário;
- ajustes puramente visuais por CSS não devem quebrar hitbox, clique, pan ou cálculo de bounds.

Checklist visual:

- label `PAI` centralizada dentro do grupo do pai;
- label `MÃE` centralizada dentro do grupo da mãe;
- label `CÔNJUGE` centralizada no grupo do cônjuge;
- grupos de **Irmãos**, **Sobrinhos**, **Cônjuge** e **Pets** sem nomes cortados com `...` quando houver espaço;
- linhas parentais e descendentes tocam as bordas/âncoras corretas;
- não há linha conectando ponto antigo após aumento do grupo;
- pan/zoom não usa group box como referência principal de bounds.


### 10.1 Layout mobile segmentado da Minha Árvore

No mobile, a view **Minha Árvore** usa uma experiência segmentada própria, independente do canvas ReactFlow tradicional, implementada em:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Esse layout é renderizado por `HomeTreeSection.tsx` apenas quando:

```txt
isMobile && treeViewMode === 'minha-arvore'
```

Ele não substitui `directFamilyDistributedLayout.ts` no desktop/tablet e não deve herdar regras de `/genealogia` ou `/visao-completa`.

#### Estado atual confirmado

O fluxo mobile segmentado combina:

- uma tela central/núcleo;
- uma tela lateral do ramo paterno;
- uma tela lateral do ramo materno;
- rolagem vertical interna em cada ramo lateral.

Na prática, a experiência cobre estas 7 telas conceituais:

| Tela conceitual | Estado atual no código |
|---|---|
| Principal / Núcleo | Implementada dentro da tela central do `core`. |
| Ancestrais paternos | Implementada como tela superior do ramo paterno, dentro de `AncestorGroupsScreen`. |
| Tios paternos | Implementada como tela central do ramo paterno, com 2 colunas e limite recolhido de 6 cards. |
| Primos paternos | Implementada como tela inferior do ramo paterno, com 3 colunas e limite recolhido de 9 cards. |
| Ancestrais maternos | Implementada como tela superior do ramo materno, dentro de `AncestorGroupsScreen`. |
| Tios maternos | Implementada como tela central do ramo materno, com 2 colunas e limite recolhido de 6 cards. |
| Primos maternos | Implementada como tela inferior do ramo materno, com 3 colunas e limite recolhido de 9 cards. |

#### Ancestrais no estado atual

O código atual ainda renderiza os ancestrais assim:

```txt
AncestorGroupsScreen
└── container externo "Ancestrais Paternos/Maternos"
    ├── subgrupo Tataravós
    ├── subgrupo Bisavós
    └── subgrupo Avós
```

Também existe uma regra de distribuição compacta:

```txt
distributeAncestorSubgroups(groups, maxTotal = 6)
```

Quando há três subgrupos, ela tende a limitar cada grupo a até 2 pessoas para totalizar 6 cards na tela.

#### Pendência de produto/layout

A solicitação mais recente ainda não está implementada no código atual:

```txt
Remover o container externo "Ancestrais Paternos/Maternos".
Renderizar diretamente os grupos/cards Tataravós, Bisavós e Avós, quando houver.
```

A documentação deve tratar isso como pendência até que `AncestorGroupsScreen` seja reestruturado.

#### Tios e primos no estado atual

No código atual:

- `Tios Paternos` e `Tios Maternos` usam `VerticalRelativeScreen`;
- tios usam `columns="double"` e `maxCollapsedItems={6}`;
- primos usam `columns="triple"` e `maxCollapsedItems={9}`;
- o container interno usa largura máxima próxima de `360px`;
- ainda não existe implementação estrutural de `70vh`, `80vh`, `min-h-[70vh]` ou distribuição de cards por altura útil.

#### Pendência visual de containers

A intenção de produto é:

```txt
Nas telas de tios e primos, o container do grupo deve ocupar cerca de 70% a 80% da tela útil.
Os cards devem se ajustar ao espaço disponível.
```

Enquanto isso não estiver no código, documentar como pendência, não como estado consolidado.

#### Conectores no estado atual

Conectores atuais do mobile segmentado:

- ancestrais: sem linha acima; com linha inferior local;
- tios: linha superior e inferior local;
- primos: linha superior local; sem linha abaixo;
- ramos laterais: linha horizontal de conexão entre a tela lateral e a tela central;
- os conectores são HTML/CSS, não edges ReactFlow.

#### Pendência visual de conectores

A intenção de produto é que:

```txt
Linhas estruturais laterais, superiores e inferiores cheguem até a extremidade da tela quando houver conexão naquela direção.
```

No código atual, parte dos conectores ainda usa trechos locais (`h-9`, `max-w-[360px]`, `top-[92px]`) e precisa de QA visual antes de ser documentada como finalizada.

#### QA obrigatório

Validar sempre em:

```txt
320px
375px
390px
430px
```

Checklist mínimo:

- tela principal não gera overflow horizontal;
- swipe horizontal abre ramo paterno e materno;
- swipe vertical dentro dos ramos abre ancestrais, tios e primos;
- ancestrais não têm linha acima;
- primos não têm linha abaixo;
- tios têm linha acima e abaixo;
- conectores laterais não aparecem como sobras soltas;
- bottom navigation não cobre cards, títulos ou conectores.

---

## 11. Viewport, pan, zoom e scroll

`FamilyTree.tsx` calcula bounds e viewport a partir dos nós renderizados.

Regras consolidadas:

- `personNode` deve comandar o enquadramento visual principal;
- labels, group boxes e anchors não devem reduzir indevidamente o zoom inicial;
- título fixo não participa dos bounds do canvas;
- `translateBounds` pode incluir mais elementos que `viewportBounds`;
- em `/minha-arvore`, o fit usa modo `contain`;
- em desktop, o viewport pode restaurar o enquadramento inicial quando o zoom chega ao mínimo;
- em mobile, a pessoa central pode comandar bounds específicos;
- no desktop, quando a árvore já está enquadrada e não existe conteúdo acima, o scroll do mouse para cima não deve deslocar a árvore indevidamente;
- pan/zoom interno do ReactFlow deve continuar funcionando para navegação lateral e inferior.

Constantes relevantes:

```txt
TREE_DIRECT_FAMILY_TITLE_TOP
TREE_DIRECT_FAMILY_DESKTOP_VISUAL_TOP_INSET
TREE_DIRECT_FAMILY_VIEWPORT_BOTTOM_PADDING_Y
DIRECT_FAMILY_MAX_ZOOM
DIRECT_FAMILY_MOBILE_MAX_ZOOM
DIRECT_FAMILY_TRANSLATE_PADDING
DIRECT_FAMILY_MOBILE_TRANSLATE_PADDING
TREE_INITIAL_TECHNICAL_MIN_ZOOM
TREE_PENDING_VIEWPORT_ZOOM
```

Não fazer:

- reposicionar `.react-flow__viewport` com `transform` global;
- usar `top` negativo para corrigir corte;
- usar CSS global para alterar bounds;
- alterar zoom da Genealogia ao corrigir a Minha Árvore;
- incluir labels/group boxes como principal referência de fit inicial;
- permitir scroll externo da página quando a árvore já ocupa a viewport.

## 12. Título fixo

Em `/minha-arvore`, o título desktop/tablet deve usar o padrão:

```txt
Árvore de {primeiro nome}
```

Exemplo:

```txt
Árvore de Tulius
```

Regras:

- o título visível da view é renderizado pelo shell da Home/área da árvore, não pelo layout do ReactFlow;
- o texto antigo **A árvore de {nome}** não deve voltar;
- no mobile, o texto de orientação sobre a árvore deve permanecer oculto quando competir com a navegação;
- não criar title node no layout;
- não duplicar subtítulo dentro do canvas;
- o espaçamento abaixo do título deve permitir que os cards iniciem com respiro visual;
- validar corte superior de cards após qualquer alteração.

Formatação visual de referência do título das views:

```txt
font-bold
text-slate-950
text-center
text-[clamp(1.65rem,2.1vw,2.25rem)]
leading-tight
```

## 13. Linhas e relacionamento conjugal

A view direta recebe:

```txt
edgeFilters
visualLineFilters
onMarriageClick
```

Regras:

- `edgeFilters.conjugal` controla linhas conjugais;
- `edgeFilters.filiacao_sangue` e `edgeFilters.filiacao_adotiva` controlam linhas parentais;
- `edgeFilters.irmaos` controla linhas/trechos de irmãos quando suportado;
- destaque visual só altera estilo de linhas visíveis;
- linha oculta por filtro permanece oculta mesmo com destaque ativo;
- o nó conjugal usa `MarriageNode` e abre `ViewMarriageModal`;
- a borda/anel azul duplicado do card principal não deve voltar no mobile;
- o ícone de aliança e a borda circular do nó conjugal devem acompanhar a cor dos conectores conforme a paleta ativa;
- não usar laranja ou marrom fixo se o modo de cor define outra cor para conectores;
- após alteração de largura de grupos, validar que as linhas conectam bordas/anchors atuais, não coordenadas antigas.

## 14. Modal de relacionamento conjugal

O clique no nó conjugal abre `ViewMarriageModal`.

Regras documentais relacionadas:

- regras de tempo verbal e campos do modal ficam em `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- componentes e responsabilidades ficam em `docs/GUIA_COMPONENTES.md`;
- troubleshooting fica em `docs/GUIA_CORRECAO_ERROS.md`.

Comportamento consolidado:

- cabeçalho com ícone de coração, título e botão fechar na mesma linha;
- frase usa “são casados” quando relacionamento está ativo e ambos vivos;
- frase usa “foram casados” quando há separação/fim, `ativo === false`, subtipo separado ou falecimento;
- **Inserir Informações** abre formulário textual;
- **+** em Arquivos Históricos abre upload de arquivo do relacionamento.

---

## 15. Painel lateral

No desktop, a sidebar exibe:

| Aba | Conteúdo |
|---|---|
| Filtros | `DirectRelationKpiGrid` ou `GenealogyFilterGrid`, conforme view |
| Legendas | `TreeLegend` |
| Ações | `SidebarInfoPanel` |

Na Minha Árvore:

- a aba **Filtros** usa `DirectRelationKpiGrid`;
- o rodapé usa `LifeStatusKpiGrid`;
- a aba **Legendas** recebe `directRelativeFilters`;
- o botão **Ações** aciona exportação/impressão/seleção de área.

Padrão visual consolidado no desktop:

- painel sem scroll vertical interno;
- título e subtítulo das abas com hierarquia mais clara;
- espaçamento maior entre subtítulo e cards;
- cards de filtro/KPI com altura maior;
- botões da aba **Ações** com altura e respiro compatíveis com o espaço vertical disponível;
- conteúdo pode ocupar melhor a extensão vertical, sem forçar rolagem.

No mobile:

- a sidebar desktop não aparece;
- `HomeMobileNav` controla abertura do painel inferior;
- o painel inferior mostra as mesmas abas conceituais com altura máxima e rolagem própria.

Regras:

- desktop não deve gerar scroll vertical no painel lateral;
- mobile pode usar rolagem interna controlada;
- a ausência de scroll desktop não deve cortar ações essenciais;
- se novas ações forem adicionadas, revisar altura disponível antes de ocultar overflow.

## 16. Controles mobile da árvore

A frente mobile adicionou um painel compacto de controles por portal.

Arquivos:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/styles/mobile-tree-controls.css
src/main.tsx
```

Rotas atendidas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Ações esperadas no painel mobile:

```txt
Zoom +
Zoom -
Reajustar
Ocultar/Exibir setas
PDF
Imagem
Imprimir
Seleção
```

Regras:

- o portal deve aparecer apenas nas rotas da árvore;
- os botões `+` e `-` antigos do canvas devem ficar ocultos no mobile;
- o botão de seta para cima deve manter a mesma formatação dos demais botões direcionais;
- o usuário deve conseguir ocultar/exibir setas direcionais;
- ações de exportação mobile não devem alterar estado de dados;
- em `/genealogia` e `/visao-completa`, os chips continuam sendo a navegação primária por geração;
- a ação **Seleção** no mobile deve ser tratada com cuidado porque a seleção manual de área é uma experiência sensível em telas pequenas.

---

## 17. Paletas

A view direta respeita as paletas globais da árvore:

```txt
white
orange
brown
```

Regras:

- paleta é decisão visual da Home/header;
- no mobile, a paleta também pode aparecer no menu do usuário via `MobileUserMenuPalettePortal`;
- componentes da árvore devem consumir tokens/CSS variables;
- não hardcodar cor nova sem checar `treeColorPalettes.ts`;
- o modo direto deve preservar contraste dos cards e linhas.

---

## 18. Exportação

A exportação usa ações expostas por `FamilyTreeActions`:

```txt
saveImage
savePdf
print
startAreaSelection
```

Regras:

- exporta a área visível/capturada, não necessariamente a árvore completa;
- seleção de área bloqueia pan/zoom temporariamente;
- no mobile, há painel rápido de exportação por `MobileTreeControlsPortal`;
- detalhes funcionais ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 19. QA mínimo

Validar após alteração em `/minha-arvore`:

- desktop: 1366px, 1440px e largura maior;
- mobile: 320px, 375px, 390px e 430px;
- as 7 telas mobile da Minha Árvore: Principal/Núcleo, Ancestrais Paternos, Tios Paternos, Primos Paternos, Ancestrais Maternos, Tios Maternos e Primos Maternos;
- quando a pendência for implementada: containers das telas de tios e primos ocupando cerca de 70% a 80% da altura útil; no código atual, validar apenas se não houve regressão de largura/altura;
- cards internos sem compressão excessiva; adaptação por altura útil ainda depende da pendência de containers;
- quando a pendência for implementada: linhas verticais/horizontais chegando às extremidades quando forem estruturais; no código atual, validar conectores locais e ausência de sobras;
- ausência de linha horizontal solta ou sobrando na lateral do container;
- ausência de overflow horizontal no layout mobile segmentado;
- header sem scroll externo;
- painel lateral desktop sem scroll vertical;
- pan/zoom interno funcional;
- scroll do mouse para cima não desloca a árvore quando não há conteúdo acima;
- pessoa central visível;
- card central sem ampliação indevida;
- cards compactos da Minha Árvore com largura visual prevista;
- nomes longos sem `...` quando houver espaço suficiente para quebra de linha;
- grupos acompanhando visualmente a largura dos cards;
- labels dos grupos centralizadas;
- linhas conectando bordas/âncoras corretas dos grupos;
- aliança conjugal com cor coerente com conectores/paleta;
- botão de favorito posicionado junto aos controles de zoom no desktop;
- cônjuge abre modal;
- filtros de grupos ocultam cards corretos;
- filtros de linhas não removem cards;
- destaque não recria linha oculta;
- pets não entram como filhos humanos;
- controles mobile aparecem apenas nas rotas da árvore;
- botão de ocultar/exibir setas funciona;
- exportação continua funcionando;
- troca para `/genealogia` e `/visao-completa` sem regressão de largura.

## 20. Anti-regressões

Não fazer:

- misturar regras de `minha-arvore` com `genealogia`;
- aplicar largura de `360px` em `/genealogia` ou `/visao-completa`;
- aplicar aumento visual no card central da pessoa foco;
- deixar cards compactos com nomes truncados por `...` quando há espaço para quebra de linha;
- persistir inferência visual no Supabase;
- mover título para dentro do layout;
- reverter o título para **A árvore de {nome}**;
- incluir anchors/group boxes no zoom visual principal;
- remover `overflow-hidden` do shell fixo sem testar scroll;
- permitir deslocamento para cima por wheel quando não há conteúdo acima;
- usar `window.location` para trocar view;
- criar migration para ajuste visual;
- alterar RLS/Storage/Auth para corrigir problema de layout;
- criar novo controle mobile fora do portal sem remover o anterior;
- tratar `MobileFamilyTreeView.tsx` como se fosse ReactFlow: seus conectores são HTML/CSS e precisam de regras próprias;
- após implementar a pendência, deixar container de tios ou primos abaixo da faixa visual esperada de 70% a 80% da altura útil;
- permitir linha horizontal solta saindo do topo/lateral do grupo no mobile segmentado;
- deixar controles fixos competindo com navegação inferior mobile;
- corrigir conexão de linha apenas no SVG sem revisar anchors dos grupos;
- transformar `family-tree-visual-polish.css` em área sem escopo por rota/view.
