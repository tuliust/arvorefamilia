# Guia de componentes - Árvore Família

> Última atualização: 2026-06-13  
> Local canônico: `docs/GUIA_COMPONENTES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado contra os componentes atuais das views da árvore, incluindo `MobileFamilyHorizontalMapView`, modal mobile de controles, painel, exportação, cards visuais, paletas e CSS de suporte.

---

## Objetivo

Este documento identifica os principais componentes reutilizáveis do projeto **Árvore Família**, suas responsabilidades, arquivos relacionados e cuidados contra regressões.

Use este guia para decidir qual componente alterar antes de editar UI, layout, responsividade, exportação ou padrões de interação.

---

## 1. Convenções gerais

### 1.1 Organização

| Área | Caminho |
|---|---|
| Componentes gerais | `src/app/components/` |
| UI base | `src/app/components/ui/` |
| Layout/header/menu | `src/app/components/layout/` |
| Árvore | `src/app/components/FamilyTree/` |
| Páginas da Home pós-login | `src/app/pages/home/` |
| Estilos complementares | `src/styles/` |
| Serviços | `src/app/services/` |
| Utils globais | `src/app/utils/` |

### 1.2 Regras de alteração

- manter props tipadas;
- não inserir lógica de banco em componente visual;
- usar `services` para Supabase;
- usar `utils` para cálculo puro;
- preservar loading, erro e estado vazio;
- usar `type="button"` em botões que não submetem formulário;
- preservar `aria-label`, foco e teclado;
- rodar `npm run build` e `git diff --check`.

---

## 2. Shell da Home e navegação

### 2.1 `Home`

Arquivo:

```txt
src/app/pages/Home.tsx
```

Responsabilidade:

- carregar pessoas/relacionamentos;
- resolver pessoa vinculada/central;
- manter filtros globais da árvore;
- renderizar header, sidebar, painel mobile e seção da árvore;
- controlar `legendOpen` no mobile;
- persistir preferências de filtros diretos;
- alimentar contagens e estados visuais do painel.

Cuidados:

- não colocar lógica de layout específica da árvore diretamente na Home;
- não duplicar controles mobile;
- não capturar sidebar/painel nas exportações.

### 2.2 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidade:

- header específico das views da árvore;
- busca expansível;
- atalhos;
- menu do usuário;
- não exibir nome textual ao lado do avatar no desktop.

Cuidados:

- nome/e-mail do usuário devem aparecer no menu, não ao lado da foto;
- preservar search params na navegação.

### 2.3 `HomeMobileNav`

Arquivo:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Responsabilidade:

- navegação inferior mobile;
- botão de controle superior em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- abrir/fechar o modal de controles da árvore via estado controlado por `Home.tsx`;
- manter os elementos de navegação marcados com `data-tree-export-ignore="true"`.

Regras:

- `/mapa-familiar` usa a navegação/toggle nativa de `MobileFamilyTreeView`;
- `/mapa-familiar-horizontal` não usa barra `Paterno | Central | Materno`;
- a horizontal mobile navega por geração dentro de `MobileFamilyHorizontalMapView`;
- não reintroduzir toggle `Vertical | Horizontal` no mobile.

### 2.4 `HomeTreeSection`

Arquivo:

```txt
src/app/pages/home/HomeTreeSection.tsx
```

Responsabilidade:

- decidir qual árvore renderizar;
- calcular título desktop;
- escutar ações do painel via `SIDEBAR_TREE_ACTION_EVENT`;
- repassar filtros e callbacks;
- controlar `restore-view`.

Renderização atual:

| Condição | Componente |
|---|---|
| `isMobile && (minha-arvore || mapa-familiar)` | `MobileFamilyTreeView` |
| `isMobile && mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` |
| `mapa-familiar` desktop/tablet | `DesktopFamilyMapView` |
| `mapa-familiar-horizontal` desktop/tablet | `DesktopFamilyHorizontalMapView` |
| demais views | `FamilyTree` |

Títulos:

| View | Título |
|---|---|
| `minha-arvore` | `Árvore de {primeiroNome}` |
| `mapa-familiar` | `Mapa Familiar de {primeiroNome}` |
| `mapa-familiar-horizontal` | `Genealogia de {primeiroNome}` |
| `genealogia` | `Família de {primeiroNome}` |
| `visao-completa` | `Linha Genealógica de {primeiroNome}` |

---

## 3. Painel e filtros

### 3.1 `SidebarPanelTabs`

Arquivo:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
```

Responsabilidade:

- abas `Filtros`, `Legendas`, `Ações`;
- controles de zoom;
- `Restaurar visualização`;
- toggle `Vertical/Horizontal`;
- flyouts `Cores`, `Exportar`, `Destacar`;
- emissão de `SIDEBAR_TREE_ACTION_EVENT`.

Ações expostas:

```txt
zoom-in
zoom-out
restore-view
print
save-pdf
save-image
select-area
```

Regras:

- `restore-view` não é `zoom-out`;
- `Exportar > Área` chama `startAreaSelection`;
- `Destacar` controla atributos globais `data-tree-highlight-*`.

### 3.2 `DirectRelationKpiGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
```

Responsabilidade:

- renderizar grupos diretos;
- usar contagens efetivas quando passadas;
- refletir estado de `directRelativeFilters`.

### 3.3 `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Responsabilidade:

- renderizar cards de grupos/filtros diretos.

Notas atuais:

- `Filhos` usa `UserRoundPlus`;
- `Cônjuges` e `Pets` são filtros;
- `Pets` usa tokens de paleta.

### 3.4 `LifeStatusKpiGrid`

Arquivo:

```txt
src/app/pages/home/LifeStatusKpiGrid.tsx
```

Responsabilidade:

- filtros `Vivos`, `Falecidos`, `Pets`;
- contadores por status/tipo.

---

## 4. Views ReactFlow

### 4.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar ReactFlow;
- controlar pan/zoom;
- renderizar views `minha-arvore`, `genealogia`, `visao-completa`;
- expor ações imperativas de exportação e zoom;
- usar `treeExport.ts`.

Não usar para:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

### 4.2 Layouts ReactFlow

| Layout | Arquivo |
|---|---|
| Família direta | `directFamilyDistributedLayout.ts` |
| Genealogia/visão completa | `genealogyColumnsLayout.ts` |

---

## 5. Mapa Familiar Vertical

### 5.1 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidade:

- renderizar `/mapa-familiar` no desktop/tablet;
- compor grupos da família direta;
- aplicar filtros;
- calcular cônjuges;
- desenhar conectores SVG;
- controlar zoom/scroll;
- exportar PNG/PDF/print;
- abrir seleção por área;
- exibir loading de exportação;
- implementar `hideGroupChrome`.

Conceitos internos:

```txt
FAMILY_MAP_LAYOUT_BASE
getFamilyMapLayout
composeGroup
collectCollateralSpouses
getGroupHeight
stackGroups
resolveGroup
getGroupAnchor
verticalConnector
branchConnector
PositionedGroup
DirectPersonCard
```

Regras atuais:

- `Destacar > Grupos` ativa modo sem chrome;
- labels `PAI`, `MÃE`, `CÔNJUGE` somem nesse modo;
- conectores são ajustados para a área real dos cards;
- `Restaurar visualização` reseta zoom e scroll;
- exportação compõe título `Mapa Familiar de {nome}`.

---

## 6. Mapa Familiar Horizontal

### 6.1 `DesktopFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Responsabilidade:

- renderizar `/mapa-familiar-horizontal`;
- organizar por `manual_generation`;
- inferir geração quando necessário;
- usar referência de `genealogyColumnsLayout`;
- ocultar colunas vazias;
- manter cônjuges adjacentes;
- conectar casais a filhos;
- exportar PNG/PDF/print;
- abrir seleção por área;
- exibir loading de exportação.

Helpers importantes:

```txt
buildRelationshipMaps
getManualGeneration
inferHorizontalGenerations
buildGenealogyReferencePlacements
orderChildrenByParentGroups
orderPeopleWithAdjacentSpouses
getChildLayoutsForCouple
getDistributedTrunkX
buildConnectors
getCanvasWidth
```

Regras atuais:

- título/exportação: `Genealogia de {nome}`;
- `Destacar > Grupos` oculta cabeçalhos `Geração X` e sobe cards/conectores;
- cônjuges filtráveis incluem netos;
- exportação não usa ReactFlow.

---

### 6.2 `MobileFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Responsabilidade:

- renderizar `/mapa-familiar-horizontal` no mobile;
- transformar colunas de geração em telas paginadas;
- exibir uma geração por tela;
- permitir swipe lateral entre gerações;
- permitir scroll vertical dentro da geração ativa;
- renderizar chips compactos de geração (`G1`, `G2`, `G3` etc.);
- reaproveitar `VisualPersonCard` e tokens visuais compartilhados;
- informar contagens renderizadas para o painel;
- respeitar filtros diretos, filtros de vida/pets e regra de cônjuges;
- expor ações imperativas compatíveis com o painel quando aplicável.

Regras atuais:

- não usa ReactFlow;
- não usa barra `Paterno | Central | Materno`;
- não deve substituir a view desktop/tablet;
- deve manter o escopo por rota e `data-mobile-family-horizontal-root`;
- conectores e cards devem se mover juntos durante o swipe.

---

## 7. Cards visuais

### 7.1 `FamilyTreeVisualCards`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Exports principais:

```txt
getVisualPersonCardData
VisualPersonAvatar
VisualVitalLines
VisualPersonCard
VisualEmptyCard
VisualGroup
```

### 7.2 `VisualPersonCard`

Responsabilidade:

- renderizar card visual de pessoa/pet;
- exibir avatar/foto/silhueta;
- exibir nome;
- exibir nascimento/falecimento;
- aplicar labels como `Pai`, `Mãe`, `Cônjuge`, grupo ou pessoa central;
- aplicar `data-family-map-color-key`.

### 7.3 `VisualPersonAvatar`

Responsabilidade:

- exibir foto se existir;
- se for pet, exibir `PawPrint`;
- se humano sem foto, exibir silhueta por gênero;
- marcar elementos para exportação.

Classes/atributos atuais:

```txt
data-family-map-avatar="true"
data-family-map-photo-avatar="true"
family-map-avatar-icon
family-map-person-silhouette
family-map-pet-icon
```

### 7.4 `VisualVitalLines`

Responsabilidade:

- exibir estrela de nascimento;
- exibir cruz de falecimento;
- manter contraste por paleta.

Classes:

```txt
family-map-status-icon
family-map-birth-icon
family-map-deceased-icon
```

### 7.5 `VisualGroup`

Responsabilidade:

- renderizar grupos visuais;
- controlar título/pill;
- renderizar grid de pessoas;
- suportar expansão;
- manter cônjuges adjacentes;
- suportar modo sem chrome.

Props relevantes:

```txt
hideChrome
titleVariant
expandable
collapsedLimit
spousePersonIds
spousePartnerByPersonId
```

Atributos:

```txt
data-family-map-group="true"
data-family-map-group-title="true"
data-family-map-chrome-hidden="true"
```

---

## 8. Exportação

### 8.1 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidade:

- overlay de seleção por área;
- captura da área visível;
- recorte;
- exportação PNG/PDF/print;
- loading local;
- fechamento por `Esc` quando não está exportando.

Características:

- overlay `fixed`;
- toolbar de exportação;
- seleção mínima;
- limite preventivo de pixels;
- título composto no canvas.

### 8.2 `TreeExportLoadingOverlay`

Mesmo arquivo.

Responsabilidade:

- feedback visual durante exportação;
- `aria-busy`;
- ignorado pela captura.

### 8.3 `treeExport.ts`

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidade:

- `html2canvas`;
- PDF;
- impressão;
- recorte;
- título;
- loading settle;
- normalização de SVGs no clone.

Funções importantes:

```txt
captureElementToCanvas
captureVisibleAreaOnly option
cropCanvas
downloadCanvasAsPng
exportCanvasAsPdf
openTreePrintWindow
printCanvas
prependTitleToCanvas
waitForExportUiSettle
normalizeInlineSvgIconsForTreeExport
```

---

## 9. CSS de suporte

### 9.1 `home-sidebar-unified.css`

Responsabilidades:

- densidade do painel;
- scroll do painel;
- destaques globais;
- ocultação de linhas;
- modo `hideGroupChrome`;
- regras de exportação;
- preservação de ícones/SVGs.

### 9.2 `family-map-horizontal.css`

Responsabilidades:

- tokens visuais da horizontal;
- cores por paleta;
- conectores da horizontal;
- regras de SVG e avatar da horizontal.

### 9.3 `family-map-qa.css`

Responsabilidades:

- ajustes específicos do Mapa Familiar;
- paletas white/orange/brown;
- título visual;
- conectores;
- ícones/status;
- segurança visual de SVGs.

---

## 10. Mobile

### 10.1 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Uso:

```txt
/minha-arvore mobile
/mapa-familiar mobile
```

### 10.2 `MobileTreeControlsPortal`

Arquivo:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
```

Regra atual:

```txt
Retorna null em /mapa-familiar e /mapa-familiar-horizontal.
```

Motivo:

- essas rotas usam `HomeMobileNav` e o modal de controles renderizado pela Home.

---

## 11. Anti-regressões por componente

| Componente | Não fazer |
|---|---|
| `Home` | duplicar controles mobile ou capturar painel na exportação. |
| `HomeTreeSection` | mandar `/mapa-familiar-horizontal` para `FamilyTree`. |
| `DesktopFamilyMapView` | usar ReactFlow ou remover `hideGroupChrome`. |
| `DesktopFamilyHorizontalMapView` | remover `netos` dos cônjuges filtráveis. |
| `VisualGroup` | remover `hideChrome` ou atributos de grupo. |
| `TreeAreaSelectionOverlay` | voltar para overlay `absolute` limitado por container errado. |
| `treeExport.ts` | remover normalização de SVGs ou título no canvas. |
| CSS | usar seletor global `svg path` sem escopo. |

---

## 12. Checklist de revisão

Antes de commit:

```txt
npm run build
git diff --check
```

QA mínimo:

- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- `Destacar > Linhas`;
- `Destacar > Grupos`;
- `Exportar > Área`;
- `Imagem`, `PDF`, `Imprimir`;
- paletas white, visual, orange, brown;
- mobile em 375px e 430px.


## 13. Atualização Lote 1 — 2026-06-13

- `HomeMobileNav` não renderiza mais barra `Paterno | Central | Materno` para `/mapa-familiar-horizontal`.
- `HomeTreeSection` separa horizontal desktop/tablet e horizontal mobile.
- `MobileFamilyHorizontalMapView` é componente obrigatório para a horizontal mobile.
- O painel mobile dos mapas é modal acima do header e do bottom nav.
