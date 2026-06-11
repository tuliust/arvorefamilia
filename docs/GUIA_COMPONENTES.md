# Guia de componentes - Árvore Família

> Última atualização: 2026-06-11  
> Local canônico: `docs/GUIA_COMPONENTES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico atualizado com `DesktopFamilyHorizontalMapView`, rotas Vertical/Horizontal, painel mobile do `HomeMobileNav`, desativação do painel antigo do `MobileTreeControlsPortal` em `/mapa-familiar` e `/mapa-familiar-horizontal`, conectores do Mapa Familiar Horizontal, filtros de cônjuges e pendência do filtro Pets.

## Objetivo

Este documento identifica os principais componentes reutilizáveis do projeto **Árvore Família**, suas responsabilidades, arquivos relacionados e cuidados contra regressões.

Use este guia para decidir **qual componente alterar** antes de editar UI, layout, responsividade ou padrões de interação.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/arquitetura/ROTAS_E_GUARDS.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`;
- `docs/funcionalidades/*.md`;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.

---

## 1. Nota de verificação contra o código atual

Esta revisão consolida três frentes da árvore que não devem ser confundidas:

1. **Minha Árvore mobile segmentada**  
   Implementada em `MobileFamilyTreeView.tsx`, com malha 3×3, abas **Paterno | Central | Materno**, tela global de ancestrais, tios laterais, primos abaixo dos tios, conectores HTML/CSS e preview durante swipe.

2. **Mapa Familiar Vertical**  
   Implementado em `DesktopFamilyMapView.tsx`, na rota `/mapa-familiar`, com composição HTML/CSS/SVG própria, sem ReactFlow, layout centralizado em `FAMILY_MAP_LAYOUT`, conectores por âncoras, grupos expansíveis, zoom com `Ctrl + scroll`, cards visuais compartilhados, modo wide quando o painel lateral é colapsado e regras próprias de cônjuges.

3. **Mapa Familiar Horizontal**  
   Implementado em `DesktopFamilyHorizontalMapView.tsx`, na rota `/mapa-familiar-horizontal`, com colunas por `manual_generation`, ordenação referenciada em `genealogyColumnsLayout`, cards `VisualPersonCard`, conectores SVG próprios de cônjuge/casal/filhos, colunas vazias ocultadas, filtros de grupos e exportação própria.

Estado confirmado/esperado:

- `/minha-arvore` desktop/tablet usa `FamilyTree`/ReactFlow e `directFamilyDistributedLayout.ts`;
- `/minha-arvore` mobile usa `MobileFamilyTreeView.tsx`;
- `/mapa-familiar` desktop/tablet usa `DesktopFamilyMapView.tsx`;
- `/mapa-familiar` mobile usa `MobileFamilyTreeView.tsx`;
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView.tsx` também em mobile, com barra visual **Paterno | Central | Materno** renderizada por `HomeMobileNav`;
- `/genealogia` e `/visao-completa` usam `FamilyTree`/ReactFlow;
- `MobileTreeControlsPortal` não renderiza seu painel simplificado em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- `HomeMobileNav` controla o botão superior de painel dessas duas rotas.

---

## 2. Convenções gerais

### 2.1 Organização

| Área | Caminho |
|---|---|
| Componentes gerais | `src/app/components/` |
| UI base | `src/app/components/ui/` |
| Layout/header/menu | `src/app/components/layout/` |
| Árvore | `src/app/components/FamilyTree/` |
| Árvore mobile segmentada | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Views do Mapa Familiar | `DesktopFamilyMapView.tsx`, `DesktopFamilyHorizontalMapView.tsx` |
| Pessoa/perfil | `src/app/components/person/` |
| Relacionamentos | `src/app/components/relationships/` |
| Timeline | `src/app/components/Timeline/` |
| Favoritos | `src/app/components/favorites/` |
| Páginas da Home pós-login | `src/app/pages/home/` |
| Fórum | `src/app/pages/forum/` e services relacionados |
| Estilos globais complementares | `src/styles/` |

### 2.2 Regras de alteração

Ao alterar componente:

- manter props tipadas;
- não inserir lógica de banco em componente visual;
- usar `services` para Supabase;
- usar `utils` para cálculo puro;
- preservar loading, erro e estado vazio;
- usar `type="button"` em botões internos que não submetem formulário;
- preservar `aria-label`, foco visível e navegação básica por teclado;
- validar `npm run build` e `git diff --check`.

### 2.3 Padrões visuais

- `min-w-0` em wrappers flex/grid;
- `shrink-0` em ícones e avatares;
- `truncate` quando o texto precisa ficar em uma linha;
- evitar `truncate` em cards de árvore quando houver espaço para quebra útil;
- `break-words` para conteúdo de usuário;
- `break-all` para valores técnicos longos;
- `w-full sm:w-auto` em botões responsivos;
- modais com altura máxima e rolagem interna;
- CSS mobile específico deve ser escopado por seletor confiável;
- conectores ReactFlow, HTML/CSS e SVG devem ser documentados separadamente.

---

## 3. Layout, header e menu

### 3.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Responsabilidade:

- padronizar headers de páginas internas;
- renderizar título, subtítulo, ícone e ações;
- exportar `PAGE_CONTAINER_CLASS`;
- renderizar `UserProfileMenu` padrão;
- renderizar navegação inferior mobile fixa.

Cuidados:

- não usar em `src/app/pages/Home.tsx`, que possui `HomeHeader`;
- não criar container divergente quando `PAGE_CONTAINER_CLASS` atender;
- manter textos curtos;
- preservar `MemberMobileBottomNav` em mobile.

### 3.2 `UserProfileMenu`

Arquivo:

```txt
src/app/components/layout/UserProfileMenu.tsx
```

Responsabilidade:

- exibir botão de menu do usuário;
- carregar dados do perfil, pessoa vinculada e status admin;
- abrir painel compartilhado de navegação;
- limpar cache da árvore no logout.

Cuidados:

- não recriar dropdown local dentro de `Home.tsx`;
- não fazer o botão de fechar navegar para perfil;
- preservar fechamento por clique fora e `Escape`.

### 3.3 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidade:

- header específico das views da árvore;
- nome da família;
- busca expansível por pessoa/página;
- atalhos;
- menu compacto do usuário;
- título mobile personalizado por pessoa vinculada quando aplicável.

Observação atual:

- o painel lateral/controle é responsável pela alternância principal **Vertical / Horizontal** em desktop;
- a rota raiz da árvore é `/mapa-familiar`.

Cuidados:

- preservar search params, especialmente `?pessoa=...`;
- troca de paleta só altera CSS variables e `localStorage`;
- sugestões de busca devem ficar acima da árvore.

### 3.4 `HomeMobileNav`

Arquivo:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Responsabilidade atual:

- renderizar navegação inferior mobile:
  - Home;
  - Calendário;
  - Fórum;
  - Favoritos;
  - Alertas;
- renderizar botão de controle superior em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- renderizar barra visual **Paterno | Central | Materno** em `/mapa-familiar-horizontal`;
- abrir/fechar o painel mobile controlado por `legendOpen`.

Detalhes atuais:

```ts
const horizontalTabs = ['Paterno', 'Central', 'Materno'] as const;
const mobileTreeControlsTopClass = 'top-[calc(env(safe-area-inset-top,0px)+4.35rem)]';
```

Regras:

- em `/mapa-familiar`, a toggle **Paterno | Central | Materno** vem de `MobileFamilyTreeView`;
- em `/mapa-familiar-horizontal`, a barra visual vem de `HomeMobileNav`;
- em `/mapa-familiar-horizontal`, os botões da barra ainda não têm comportamento funcional definido;
- botão de controle e barra horizontal devem ficar na mesma faixa visual;
- não reintroduzir toggle **Vertical | Horizontal** no mobile.

---

## 4. Árvore familiar

### 4.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar ReactFlow;
- selecionar layout por `viewMode`;
- controlar pan/zoom;
- expor ações imperativas;
- renderizar título fixo;
- integrar exportação/seleção de área;
- integrar clique em pessoa e relacionamento conjugal.

Comportamento por view:

| `viewMode` | Layout |
|---|---|
| `minha-arvore` | `directFamilyDistributedLayout` |
| `genealogia` | `genealogyColumnsLayout` com escopo pessoal |
| `visao-completa` | `genealogyColumnsLayout` com base completa |

`mapa-familiar` e `mapa-familiar-horizontal` não devem ser implementados dentro de `FamilyTree`.

Cuidados:

- não usar `transform`, `translate` ou `top` negativo em `.react-flow__viewport`;
- não persistir inferência visual de gerações no Supabase;
- não misturar pan/zoom do ReactFlow com scroll externo da página.

### 4.2 `HomeTreeSection`

Arquivo:

```txt
src/app/pages/home/HomeTreeSection.tsx
```

Responsabilidade:

- decidir qual árvore renderizar;
- aplicar ajustes mobile/desktop;
- renderizar título desktop;
- integrar `PageFavoriteButton`;
- escutar eventos de `SidebarPanelTabs`;
- repassar filtros, pessoas, relacionamentos e actions.

Renderização esperada:

| Condição | Componente |
|---|---|
| `isMobile && (minha-arvore || mapa-familiar)` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` |
| `mapa-familiar` desktop/tablet | `DesktopFamilyMapView` |
| demais views | `FamilyTree` |

Títulos desktop:

| View | Título |
|---|---|
| `minha-arvore` | `Árvore de {primeiroNome}` |
| `mapa-familiar` | `Mapa Familiar de {primeiroNome}` |
| `mapa-familiar-horizontal` | `Mapa Familiar Horizontal de {primeiroNome}` |
| `genealogia` | `Família de {primeiroNome}` |
| `visao-completa` | `Linha Genealógica de {primeiroNome}` |

### 4.3 `MobileTreeControlsPortal`

Arquivo:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
```

Responsabilidade:

- renderizar botão circular de controles da árvore em mobile para rotas que ainda usam o portal antigo;
- oferecer ações rápidas de zoom, reajuste, ocultar/exibir setas, PDF, imagem e impressão;
- reutilizar `treeExport.ts`.

Rotas registradas internamente:

```txt
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
```

Regra atual importante:

```txt
Se path for /mapa-familiar ou /mapa-familiar-horizontal, o portal retorna null.
```

Motivo:

- essas duas rotas usam botão/painel do `HomeMobileNav`;
- evita duplicidade de botões de controle.

Cuidados:

- não reativar o painel antigo nessas duas rotas sem revisar UX mobile;
- não duplicar ações de exportação.

### 4.4 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidade:

- renderizar experiência mobile segmentada da família direta;
- organizar a árvore em malha 3×3;
- oferecer swipe direcional;
- renderizar abas **Paterno | Central | Materno**;
- renderizar cards mobile com anos;
- desenhar conectores HTML/CSS próprios.

Uso atual:

```txt
/minha-arvore mobile
/mapa-familiar mobile
```

Não é usado para `/mapa-familiar-horizontal`.

### 4.5 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidade:

- renderizar Mapa Familiar Vertical no desktop/tablet;
- usar HTML/CSS/SVG próprio;
- compor grupos familiares;
- posicionar cards em layout panorâmico;
- desenhar conectores SVG por âncoras;
- expor ações de zoom/exportação.

Uso atual:

```txt
/mapa-familiar desktop/tablet
```

### 4.6 `DesktopFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Responsabilidade:

- renderizar Mapa Familiar Horizontal;
- organizar pessoas por geração em colunas;
- usar `pessoas.manual_generation` como fonte primária da coluna;
- inferir geração por relações quando necessário;
- usar `genealogyColumnsLayout` como referência de ordenação;
- renderizar cards `VisualPersonCard`;
- ocultar colunas sem cards;
- manter cônjuges adjacentes;
- ordenar filhos por nascimento;
- desenhar conectores SVG de cônjuge/casal/filhos;
- aplicar filtros de grupos e filtros de vida;
- expor ações de zoom/exportação.

Uso atual:

```txt
/mapa-familiar-horizontal desktop/tablet/mobile
```

Principais helpers internos:

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

Regras de cônjuges:

- `ALWAYS_VISIBLE_SPOUSE_ANCHOR_GROUPS = ['avos', 'bisavos', 'tataravos']`;
- `FILTERABLE_SPOUSE_ANCHOR_GROUPS = ['tios', 'primos', 'sobrinhos', 'filhos']`;
- cônjuge da pessoa central é reincluído;
- cônjuges colaterais filtráveis dependem de `directRelativeFilters.conjuge`.

Cuidados:

- não remover `collectDirectFamilyScopePersonIds`;
- não trocar a direção de `getParentChildIds` sem comparar com `buildTreeGraph`;
- não esconder o SVG de conectores de forma global;
- não voltar a desenhar linhas pais/filhos fora do modelo casal → filhos;
- não ocupar espaço com colunas vazias.

### 4.7 `FamilyTreeVisualCards`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Responsabilidade:

- padronizar cards visuais usados pelo Mapa Familiar Vertical/Horizontal;
- fornecer avatar visual por `genero`/pet;
- consolidar linhas vitais;
- padronizar tons por grupo.

Usado por:

```txt
DesktopFamilyMapView
DesktopFamilyHorizontalMapView
MobileFamilyTreeView
```

---

## 5. Painel, filtros e ações

### 5.1 `SidebarPanelTabs`

Arquivo:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
```

Responsabilidade:

- renderizar controles superiores do painel desktop;
- alternar views;
- abrir flyouts de Cores, Exportar e Destacar;
- disparar eventos de ações da árvore;
- aplicar paleta no `document.documentElement`.

Opções atuais de view:

```txt
Vertical   -> mapa-familiar
Horizontal -> mapa-familiar-horizontal
```

Opções mobile-only internas:

```txt
Minha Árvore
Genealogia
```

Paletas:

```txt
white
visual
orange
brown
```

Ações:

```txt
zoom-in
zoom-out
select-area
save-image
save-pdf
print
```

### 5.2 `DirectRelationKpiGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
```

Responsabilidade:

- renderizar bloco de filtros de grupos diretos;
- delegar cards a `DirectRelativeFilterGrid`;
- ser usado em `/mapa-familiar` e `/mapa-familiar-horizontal`.

### 5.3 `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Opções atuais:

```txt
Tataravós
Bisavós
Avós
Pais
Tios
Primos
Sobrinhos
Irmãos
Filhos
Netos
Cônjuges
Pets
```

Cuidados:

- manter `conjuge` com label **Cônjuges**;
- manter `pets` como card de grupo;
- não confundir `directRelativeFilters.pets` com `personFilters.pets`.

### 5.4 `LifeStatusKpiGrid`

Responsabilidade:

- controlar `personFilters`;
- filtrar vivos, falecidos e pets por status/tipo;
- alimentar contadores de vida.

---

## 6. Labels e cabeçalhos da árvore

### 6.1 `DirectFamilyLabelNode`

Arquivo:

```txt
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Responsabilidade:

- renderizar labels de título e cabeçalhos de geração em layouts ReactFlow.

Estado atual:

- `variant === 'title'` preserva título maior;
- demais labels, como `GERAÇÃO N`, usam pílula escura `bg-slate-600`;
- não há caixa branca atrás da pílula.

Cuidados:

- não reintroduzir wrapper branco;
- validar Genealogia e Visão Completa após alteração visual.

---

## 7. Exportação

Componentes que expõem `FamilyTreeActions`:

```txt
FamilyTree
DesktopFamilyMapView
DesktopFamilyHorizontalMapView
```

Ações:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Regras:

- ReactFlow usa fluxo baseado em `.react-flow` quando aplicável;
- Mapa Familiar Vertical/Horizontal usa superfície HTML/CSS/SVG;
- `DesktopFamilyHorizontalMapView` exporta com label `mapa-familiar-horizontal`.

---

## 8. Anti-regressões

Não fazer:

- mover `DesktopFamilyMapView` ou `DesktopFamilyHorizontalMapView` para dentro de `FamilyTree`;
- confundir `/mapa-familiar-horizontal` com `/visao-completa`;
- reintroduzir `/mapa-horizontal` ou `/visao-completa-teste`;
- usar CSS global para esconder conectores da horizontal;
- duplicar controles mobile entre `HomeMobileNav` e `MobileTreeControlsPortal`;
- reintroduzir toggle **Vertical | Horizontal** no mobile;
- remover o card **Cônjuges** do painel;
- forçar `pets: true` sem registrar a consequência no filtro de grupo;
- corrigir layout com manipulação direta de `.react-flow__viewport`;
- mudar relacionamento pai/filho sem revisar `buildTreeGraph` e `DesktopFamilyHorizontalMapView`.

---

## 9. QA mínimo após alteração em componentes da árvore

Rodar:

```bash
npm run build
git diff --check
```

Validar:

- `/mapa-familiar` desktop;
- `/mapa-familiar-horizontal` desktop;
- `/mapa-familiar` mobile;
- `/mapa-familiar-horizontal` mobile;
- `/visao-completa`;
- filtros de grupos;
- filtro Cônjuges;
- filtro Pets;
- paletas `white`, `visual`, `orange`, `brown`;
- exportar imagem/PDF/impressão;
- zoom por botões e atalhos;
- colunas vazias;
- conectores casal → filhos.
