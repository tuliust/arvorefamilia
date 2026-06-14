# Mapa Familiar - views Vertical e Horizontal

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`  
> Tipo: documentação técnica/funcional das views **Mapa Familiar Vertical** e **Mapa Familiar Horizontal**.  
> Status: revisado contra a estrutura atual das views, exportação, filtros, destaques, paletas, conectores e mobile.

---

## 1. Função deste documento

Este documento descreve as views:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Use este arquivo para manter:

- objetivo funcional das views;
- diferenças entre Vertical e Horizontal;
- integração com `treeViewMode`;
- arquitetura dos componentes;
- filtros de grupos e status;
- regras de cônjuges;
- conectores SVG;
- paletas e cards;
- exportação;
- mobile;
- QA e anti-regressões.

---

## 2. Conceito

O Mapa Familiar é a experiência visual da família direta.

| View | Rota | Componente |
|---|---|---|
| Mapa Familiar Vertical | `/mapa-familiar` | `DesktopFamilyMapView` no desktop/tablet; `MobileFamilyTreeView` no mobile |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` também no mobile |

Diferenças:

| Aspecto | Vertical | Horizontal |
|---|---|---|
| Organização | canvas panorâmico com grupos familiares | colunas por geração |
| Base | pessoa central com parentes diretos/colaterais | gerações 1 a 6 |
| Conectores | SVG por âncoras de grupos/cards | SVG de cônjuges e casal → filhos |
| Mobile | usa `MobileFamilyTreeView` | usa a própria horizontal |
| Título | `Mapa Familiar de {primeiroNome}` | `Genealogia de {primeiroNome}` |
| Exportação | root HTML/CSS/SVG vertical | root HTML/CSS/SVG horizontal |

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| View vertical | `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` |
| View horizontal | `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx` |
| Cards visuais | `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` |
| Seleção/exportação por área | `src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx` |
| Utilitários de exportação | `src/app/components/FamilyTree/utils/treeExport.ts` |
| Modelo mobile | `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` |
| Escopo direto | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Referência genealógica | `src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts` |
| Tipos/filtros | `src/app/components/FamilyTree/types.ts` |
| Shell da área da árvore | `src/app/pages/home/HomeTreeSection.tsx` |
| Painel | `src/app/pages/home/SidebarPanelTabs.tsx` |
| Filtros diretos | `src/app/pages/home/DirectRelativeFilterGrid.tsx` |
| Paletas | `src/app/components/FamilyTree/treeColorPalettes.ts` |
| Cores dos grupos | `src/app/components/FamilyTree/directFamilyColors.ts` |
| CSS de painel/exportação | `src/styles/home-sidebar-unified.css` |
| CSS horizontal | `src/styles/family-map-horizontal.css` |
| CSS QA/paletas do mapa | `src/styles/family-map-qa.css` |

---

## 4. Rotas e títulos

Rotas oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Regras:

- `/` redireciona para `/mapa-familiar`;
- `/mapa-horizontal` não é rota oficial;
- `/visao-completa-teste` não é rota oficial;
- search params como `?pessoa=...` devem ser preservados na troca de view.

Títulos desktop:

| View | Título |
|---|---|
| `/mapa-familiar` | `Mapa Familiar de {primeiroNome}` |
| `/mapa-familiar-horizontal` | `Genealogia de {primeiroNome}` |

O mesmo título é usado como base para exportação.

---

## 5. Painel

As duas views usam o mesmo painel de grupos, filtros e ações.

### 5.1 Grupos/filtros diretos

| Key | Label |
|---|---|
| `tataravos` | Tataravós |
| `bisavos` | Bisavós |
| `avos` | Avós |
| `pais` | Pais |
| `tios` | Tios |
| `primos` | Primos |
| `sobrinhos` | Sobrinhos |
| `irmaos` | Irmãos |
| `filhos` | Filhos |
| `netos` | Netos |
| `conjuge` | Cônjuges |
| `pets` | Pets |

Regras:

- `Cônjuges` e `Pets` ficam no bloco de filtros;
- `Filhos` usa ícone `UserRoundPlus`;
- contadores usam valores efetivamente renderizados pela view quando disponíveis.

### 5.2 Ações

| Flyout | Ações |
|---|---|
| Cores | paletas `white`, `visual`, `orange`, `brown` |
| Exportar | `Área`, `Imagem`, `PDF`, `Imprimir` |
| Destacar | `Linhas`, `Cards`, `Grupos` |

---

## 6. Mapa Familiar Vertical

### 6.1 Arquitetura

`DesktopFamilyMapView.tsx` organiza:

1. configuração de layout;
2. composição de grupos;
3. políticas de cônjuges;
4. expansão;
5. cálculo de altura/largura;
6. cálculo de âncoras;
7. conectores SVG;
8. renderização de grupos/cards;
9. zoom/escala;
10. exportação/loading/seleção.

### 6.2 Layout

Tipos conceituais:

```txt
ancestor
lateral-many
central-small
descendant
pet
direct-card
single
```

Grupos principais:

- tataravós, bisavós, avós;
- pai, mãe, pessoa central;
- cônjuge;
- tios, primos;
- irmãos, sobrinhos;
- filhos, netos;
- pets.

### 6.3 Modo wide

Quando o painel lateral é colapsado, a vertical usa configuração wide.

Regras:

- canvas maior;
- áreas laterais reposicionadas;
- largura exportável normalizada;
- conectores recebem o mesmo offset dos grupos;
- `Cônjuge`, `Pets`, filhos e netos não devem se sobrepor.

### 6.4 Grupos com uma pessoa

Quando um grupo tem uma pessoa e possui `singleWidth`, a largura deve ser reduzida.

Regra aplicada:

```txt
Primos Paternos e Primos Maternos com uma pessoa usam largura menor para evitar destaque excessivo.
```

### 6.5 `Destacar > Grupos`

No vertical, o estado ativo equivale a:

```txt
hideGroupChrome = true
```

Comportamento:

- remove molduras/fundos/sombras dos grupos;
- oculta títulos dos grupos;
- oculta labels `PAI`, `MÃE` e `CÔNJUGE`;
- mantém cards visíveis;
- recalcula altura/geometria dos grupos sem padding visual;
- ajusta âncoras para que conectores se aproximem dos cards, não de caixas invisíveis.

Atributos relacionados:

```txt
data-family-map-group="true"
data-family-map-group-title="true"
data-family-map-chrome-hidden="true"
```

### 6.6 Conectores

Sistema:

```txt
SVG próprio em DesktopFamilyMapView
```

Regras:

- conectores usam âncoras calculadas;
- alterações em `x`, `width`, `top`, `height`, offsets ou modo sem chrome devem recalcular conectores;
- `Destacar > Linhas` oculta conectores;
- `Destacar > Grupos` não deve ocultar conectores.

---

## 7. Mapa Familiar Horizontal

### 7.1 Arquitetura

`DesktopFamilyHorizontalMapView.tsx` organiza:

1. mapas de relacionamentos;
2. escopo direto;
3. reinclusão de cônjuges;
4. geração manual/inferida;
5. ordenação de referência;
6. colunas por geração;
7. layouts dos cards;
8. conectores;
9. exportação/loading/seleção.

### 7.2 Gerações

Fonte primária:

```txt
pessoas.manual_generation
```

Regras:

- valores válidos: 1 a 6;
- valores inválidos são limitados;
- fallback por inferência a partir de pais/filhos/cônjuges;
- cônjuges podem herdar geração;
- inferência é visual e não persiste no Supabase.

### 7.3 Colunas vazias

- colunas sem cards visíveis são omitidas;
- colunas restantes são compactadas;
- conectores são recalculados;
- canvas width acompanha as colunas ativas.

### 7.4 Ordenação

Ordem baseada em:

1. referência de `genealogyColumnsLayout`;
2. coordenada vertical;
3. coordenada horizontal;
4. ano de nascimento;
5. nome.

Filhos do mesmo casal são ordenados do mais velho para o mais novo.

### 7.5 Cônjuges

Sempre visíveis:

- cônjuge central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

Filtráveis:

- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

### 7.6 Conectores

Sistema:

```txt
SVG próprio em DesktopFamilyHorizontalMapView
```

Regras:

- cônjuges da mesma geração ficam adjacentes;
- linha vertical liga o casal;
- do meio da linha sai conexão ao gap;
- tronco vertical no gap liga filhos comuns;
- ramais horizontais chegam aos filhos;
- múltiplos casais no mesmo gap distribuem troncos em X.

### 7.7 `Destacar > Grupos`

Quando ativo:

- oculta cabeçalhos `Geração X`;
- recalcula `canvasTop` para subir cards;
- recalcula conectores;
- estado desligado restaura cabeçalhos e posição original.

---

## 8. Regras de Cônjuges

### 8.1 Contagem

O painel deve exibir apenas cônjuges filtráveis:

```txt
tios, primos, sobrinhos, filhos, netos
```

Não conta:

```txt
cônjuge central, cônjuges de avós, bisavós e tataravós.
```

### 8.2 Renderização

- cônjuge central sempre aparece quando existir e passar nos filtros de vida;
- cônjuges ancestrais sempre aparecem quando seus grupos ancestrais estão ativos;
- cônjuges colaterais/descendentes dependem do filtro `Cônjuges`;
- cônjuges reincluídos recebem tom/label visual de `Cônjuge`.

---

## 9. Paletas e cards

Paletas:

```txt
white
visual
orange
brown
```

Regras:

- paletas são CSS variables aplicadas no document root;
- não alteram dados/filtros;
- `Pets` no modo visual usa tom teal/ciano, não laranja;
- estrela e cruz seguem lógica de cor por paleta;
- SVGs internos dos cards usam classes semânticas para exportação.

Classes/atributos relevantes:

```txt
family-map-avatar-icon
family-map-person-silhouette
family-map-pet-icon
family-map-status-icon
family-map-birth-icon
family-map-deceased-icon
data-family-map-avatar="true"
data-family-map-photo-avatar="true"
data-family-map-color-key
```

---

## 10. Exportação

As duas views expõem:

```txt
saveImage
savePdf
print
startAreaSelection
zoomIn
zoomOut
```

### 10.1 Títulos

| View | Título exportado |
|---|---|
| Vertical | `Mapa Familiar de {primeiroNome}` |
| Horizontal | `Genealogia de {primeiroNome}` |

O título é composto no canvas com `prependTitleToCanvas`.

### 10.2 Loading

A view usa `TreeExportLoadingOverlay` e:

- espera pintura do loading antes do processamento;
- aguarda settle antes de remover o loading;
- para impressão, aguarda `printCanvas` resolver.

### 10.3 Área

O overlay usa:

- `position: fixed`;
- target visível da árvore;
- `captureVisibleAreaOnly`;
- `cropCanvas`;
- título no recorte.

### 10.4 Avatares

Durante exportação:

- SVGs internos são normalizados no clone;
- conectores são excluídos da serialização de ícones;
- avatares sem foto não devem virar quadrados escuros.

---

## 11. Mobile

### 11.1 `/mapa-familiar`

No mobile usa:

```txt
MobileFamilyTreeView
```

Com:

- abas `Paterno | Central | Materno`;
- botão `Controles` do `HomeMobileNav`;
- painel inferior com filtros/ações.

### 11.2 `/mapa-familiar-horizontal`

No mobile usa:

```txt
DesktopFamilyHorizontalMapView
```

Com:

- barra visual `Paterno | Central | Materno`;
- `Central` ativo por padrão;
- comportamento funcional da barra ainda não definido;
- botão `Controles` na mesma faixa;
- painel inferior com filtros/ações.

---

## 12. QA obrigatório

### Vertical

- grupos e filtros;
- `Cônjuges`;
- `Pets`;
- `Destacar > Linhas`;
- `Destacar > Grupos`;
- labels `PAI`, `MÃE`, `CÔNJUGE`;
- conectores em modo sem grupos;
- modo wide;
- exportação PNG/PDF/print/área.

### Horizontal

- gerações 1–6;
- colunas vazias;
- cônjuges adjacentes;
- casal → filhos;
- `Destacar > Grupos`;
- título `Genealogia de {nome}`;
- exportação PNG/PDF/print/área.

### Paletas/exportação

- white, visual, orange, brown;
- avatares/silhuetas;
- estrela/cruz;
- pets;
- título no canvas;
- loading.

---

## 13. Anti-regressões

Não fazer:

- mover a horizontal para ReactFlow;
- usar `.react-flow` como alvo de exportação dos mapas;
- reintroduzir `/mapa-horizontal`;
- remover `netos` de cônjuges filtráveis;
- reexibir labels `PAI`, `MÃE`, `CÔNJUGE` no modo `Destacar > Grupos`;
- aplicar CSS amplo em `svg path`;
- ocultar ícones internos ao esconder conectores;
- duplicar título no PDF;
- fechar loading cedo demais.
