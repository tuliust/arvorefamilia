# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-09  
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Minha Árvore**.  
> Status: revisado após ajustes de largura dos cards centrais, grupos, labels e âncoras, com anti-regressão para Genealogia/Visão Completa.

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
- largura e alinhamento dos cards da área central;
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

A área central da Minha Árvore possui ajuste visual próprio: os cards de parentes diretos centrais e os grupos correspondentes são mais largos do que o padrão compacto original, sem alterar o card central nem as views de Genealogia/Visão Completa.

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
| Estilos dos controles mobile | `src/styles/mobile-tree-controls.css` |
| Layout direto | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Nodes customizados e ajuste de largura visual | `src/app/components/FamilyTree/nodeTypes.ts` |
| Cards de pessoa | `src/app/components/FamilyTree/PersonNode.tsx` |
| Painel especial da pessoa central | `src/app/components/FamilyTree/CentralPersonFocusPanel.tsx` |
| Nó de relacionamento conjugal | `src/app/components/FamilyTree/MarriageNode.tsx` |
| Cores/tokens | `src/app/components/FamilyTree/visualTokens.ts` e `directFamilyColors.ts` |
| Tipos e filtros | `src/app/components/FamilyTree/types.ts` |

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

## 9. Largura dos cards da área central

A view direta possui ajuste visual específico em `nodeTypes.ts` para aumentar a largura de cards centrais compactos.

Escopo da ampliação:

| Grupo/relação | Deve ampliar? |
|---|---|
| Pai | Sim |
| Mãe | Sim |
| Irmãos | Sim |
| Sobrinhos | Sim |
| Cônjuge | Sim |
| Filhos | Sim |
| Netos | Sim |
| Pets | Sim |
| Pessoa central | Não |
| Avós, bisavós, tataravós | Não |
| Tios e primos laterais | Não |
| Genealogia/Visão Completa | Não |

Regra técnica consolidada:

```txt
A ampliação deve ser restrita aos cards compactos da área central da Minha Árvore.
```

Comportamento visual:

- cards à esquerda do eixo central podem crescer em direção ao centro pela direita;
- cards à direita do eixo central podem crescer em direção ao centro pela esquerda;
- o card central da pessoa foco mantém seu padrão;
- os grupos laterais preservam largura original;
- a ampliação não deve contaminar `/genealogia` e `/visao-completa`.

Atenção:

- se `CENTRAL_AREA_CARD_EXTRA_WIDTH` for alterado, revisar também group boxes, labels e anchors;
- se `DIRECT_FAMILY_LOGICAL_CENTER_X` for alterado, validar lado de crescimento dos cards;
- se a largura-base dos cards mudar, revisar o critério que impede o efeito colateral em Genealogia/Visão Completa.

---

## 10. Grupos, labels e anchors da área central

Após a ampliação dos cards, os grupos visuais também devem acompanhar a nova largura.

Grupos centrais ampliados:

```txt
PAI
MÃE
IRMÃOS
SOBRINHOS
CÔNJUGE
FILHOS
NETOS
PETS
```

Regras:

- `directFamilyGroupBoxNode` deve aumentar a largura dos grupos centrais;
- grupos do lado direito devem deslocar visualmente para preservar crescimento em direção ao centro;
- labels (`directFamilyLabelNode`) devem permanecer centralizadas no centro visual do grupo ampliado;
- anchors invisíveis (`directFamilyAnchorNode`) devem acompanhar bordas e centros visuais dos grupos;
- linhas devem conectar as bordas/centros corretos após o aumento;
- grupos laterais de avós, bisavós, tios e primos não devem ser deslocados por esse ajuste.

Checklist visual:

- label `PAI` centralizada dentro do grupo do pai;
- label `MÃE` centralizada dentro do grupo da mãe;
- label `CÔNJUGE` centralizada no grupo do cônjuge;
- linhas parentais e descendentes tocam as bordas/âncoras corretas;
- não há linha conectando ponto antigo após aumento do grupo;
- pan/zoom não usa group box como referência principal de bounds.

---

## 11. Viewport, pan e zoom

`FamilyTree.tsx` calcula bounds e viewport a partir dos nós renderizados.

Regras consolidadas:

- `personNode` deve comandar o enquadramento visual principal;
- labels, group boxes e anchors não devem reduzir indevidamente o zoom inicial;
- título fixo não participa dos bounds do canvas;
- `translateBounds` pode incluir mais elementos que `viewportBounds`;
- em `/minha-arvore`, o fit usa modo `contain`;
- em desktop, o viewport pode restaurar o enquadramento inicial quando o zoom chega ao mínimo;
- em mobile, a pessoa central pode comandar bounds específicos.

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

- reposicionar `.react-flow__viewport` com `transform`;
- usar `top` negativo para corrigir corte;
- usar CSS global para alterar bounds;
- alterar zoom da Genealogia ao corrigir a Minha Árvore;
- incluir labels/group boxes como principal referência de fit inicial.

---

## 12. Título fixo

Em `/minha-arvore`, o título é:

```txt
A árvore de {primeiro nome}
```

Regras:

- título é overlay fixo em `FamilyTree.tsx`;
- no mobile, o texto de orientação sobre a árvore deve permanecer oculto quando competir com a navegação;
- não criar title node no layout;
- não duplicar subtítulo dentro do canvas;
- espaçamento entre título e cards deve ser ajustado por constantes/cálculo em `FamilyTree.tsx`;
- validar corte superior de cards após qualquer alteração.

---

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
- após alteração de largura de grupos, validar que as linhas conectam bordas/anchors atuais, não coordenadas antigas.

---

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

- a aba Filtros usa `DirectRelationKpiGrid`;
- o rodapé usa `LifeStatusKpiGrid`;
- a aba Legendas recebe `directRelativeFilters`;
- o botão **Ações** aciona exportação/impressão/seleção de área.

No mobile:

- a sidebar desktop não aparece;
- `HomeMobileNav` controla abertura do painel inferior;
- o painel inferior mostra as mesmas abas conceituais com altura máxima e rolagem própria.

---

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
- header sem scroll externo;
- pan/zoom interno funcional;
- pessoa central visível;
- card central sem ampliação indevida;
- cards centrais diretos com largura ampliada;
- grupos centrais acompanhando largura dos cards;
- labels dos grupos centralizadas;
- linhas conectando bordas/âncoras corretas dos grupos;
- cônjuge abre modal;
- filtros de grupos ocultam cards corretos;
- filtros de linhas não removem cards;
- destaque não recria linha oculta;
- pets não entram como filhos humanos;
- controles mobile aparecem apenas nas rotas da árvore;
- botão de ocultar/exibir setas funciona;
- exportação continua funcionando;
- troca para `/genealogia` e `/visao-completa` sem regressão de largura.

---

## 20. Anti-regressões

Não fazer:

- misturar regras de `minha-arvore` com `genealogia`;
- aplicar largura ampliada em `/genealogia` ou `/visao-completa`;
- aplicar aumento visual no card central da pessoa foco;
- ampliar grupos laterais de avós, bisavós, tios ou primos por acidente;
- persistir inferência visual no Supabase;
- mover título para dentro do layout;
- incluir anchors/group boxes no zoom visual principal;
- remover `overflow-hidden` do shell fixo sem testar scroll;
- usar `window.location` para trocar view;
- criar migration para ajuste visual;
- alterar RLS/Storage/Auth para corrigir problema de layout;
- criar novo controle mobile fora do portal sem remover o anterior;
- deixar controles fixos competindo com navegação inferior mobile;
- corrigir conexão de linha apenas no SVG sem revisar anchors dos grupos.
