# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-08  
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Minha Árvore**.

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
- integração com painel lateral, legenda e ações;
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
- ações de exportação pelo painel lateral.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Shell da árvore, estado, filtros e navegação | `src/app/pages/Home.tsx` |
| Header da Home pós-login | `src/app/pages/home/HomeHeader.tsx` |
| Área principal da árvore | `src/app/pages/home/HomeTreeSection.tsx` |
| Navegação mobile da Home | `src/app/pages/home/HomeMobileNav.tsx` |
| Componente ReactFlow | `src/app/components/FamilyTree/FamilyTree.tsx` |
| Layout direto | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
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

- ajustes deste documento devem ser condicionados a `viewMode === 'minha-arvore'`;
- não aplicar ajustes da view direta em `genealogia` ou `visao-completa` sem validação específica;
- trocar view deve usar helpers de `treeViewMode.ts`;
- search params, como `?pessoa=...`, devem ser preservados na troca de view.

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
- quando houver somente a pessoa central real renderizada, o componente pode usar `CentralPersonFocusPanel`.

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
- cards diretos devem preservar legibilidade em torno de `340 × 136`, salvo decisão explícita de redesign.

---

## 9. Viewport, pan e zoom

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
- alterar zoom da Genealogia ao corrigir a Minha Árvore.

---

## 10. Título fixo

Em `/minha-arvore`, o título é:

```txt
A árvore de {primeiro nome}
```

Regras:

- título é overlay fixo em `FamilyTree.tsx`;
- não criar title node no layout;
- não duplicar subtítulo dentro do canvas;
- espaçamento entre título e cards deve ser ajustado por constantes/cálculo em `FamilyTree.tsx`;
- validar corte superior de cards após qualquer alteração.

---

## 11. Linhas e relacionamento conjugal

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
- o nó conjugal usa `MarriageNode` e abre `ViewMarriageModal`.

---

## 12. Painel lateral

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

## 13. Paletas

A view direta respeita as paletas globais da árvore:

```txt
white
orange
brown
```

Regras:

- paleta é decisão visual da Home/header;
- componentes da árvore devem consumir tokens/CSS variables;
- não hardcodar cor nova sem checar `treeColorPalettes.ts`;
- o modo direto deve preservar contraste dos cards e linhas.

---

## 14. Exportação

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
- detalhes funcionais ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 15. QA mínimo

Validar após alteração em `/minha-arvore`:

- desktop: 1366px, 1440px e largura maior;
- mobile: 375px, 390px e 430px;
- header sem scroll externo;
- pan/zoom interno funcional;
- pessoa central visível;
- cônjuge abre modal;
- filtros de grupos ocultam cards corretos;
- filtros de linhas não removem cards;
- destaque não recria linha oculta;
- pets não entram como filhos humanos;
- exportação continua funcionando;
- troca para `/genealogia` e `/visao-completa` sem regressão.

---

## 16. Anti-regressões

Não fazer:

- misturar regras de `minha-arvore` com `genealogia`;
- persistir inferência visual no Supabase;
- mover título para dentro do layout;
- incluir anchors/group boxes no zoom visual principal;
- remover `overflow-hidden` do shell fixo sem testar scroll;
- usar `window.location` para trocar view;
- criar migration para ajuste visual;
- alterar RLS/Storage/Auth para corrigir problema de layout.
