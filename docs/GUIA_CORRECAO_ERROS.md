# Guia de correção de erros - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/GUIA_CORRECAO_ERROS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: troubleshooting alinhado à baseline atual: `/mapa-familiar` e `/mapa-familiar-horizontal` são as únicas views oficiais da árvore.

---

## 1. Objetivo

Este documento orienta investigação e correção de erros por sintoma observado.

Use quando houver:

- build quebrado;
- teste falhando;
- rota errada;
- regressão visual;
- falha de exportação;
- falha de favoritos/busca;
- problema em guards;
- problema mobile;
- comportamento inesperado da árvore.

Este guia não substitui:

| Tema | Documento |
|---|---|
| Baseline | `docs/BASELINE_PRODUTO_ATUAL.md` |
| Regras de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |
| Implementações | `docs/GUIA_IMPLEMENTACOES.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX/layout | `docs/GUIA_UX_LAYOUT.md` |
| Rotas | `docs/arquitetura/ROTAS_E_GUARDS.md` |

---

## 2. Checklist inicial

Antes de alterar código:

```bash
git status --short
npm run build
git diff --check
```

Se envolver testes:

```bash
npm test
npm run test:e2e
```

Se envolver rotas antigas:

```bash
rg "/minha-arvore|/genealogia|/visao-completa"
rg "minha-arvore|genealogia|visao-completa"
```

Interpretação:

- `/minha-arvore/editar` pode aparecer;
- `docs/historico/` pode aparecer;
- a palavra “genealogia” pode aparecer como conceito;
- `/genealogia` não deve voltar como rota ativa;
- `/visao-completa` não deve voltar como rota ativa;
- `/minha-arvore` não deve voltar como view ativa.

---

## 3. Build quebrado

Arquivos prováveis:

```txt
src/app/routes.tsx
src/app/pages/
src/app/components/
src/app/services/
src/app/types/
package.json
vite.config.ts
tsconfig.json
```

Causas comuns:

- import inexistente;
- export removido;
- tipo ausente;
- JSX inválido;
- componente movido sem atualizar caminho;
- dependência não instalada;
- conflito de merge;
- arquivo com encoding corrompido.

Correção:

1. rodar `npm run build`;
2. corrigir o primeiro erro real;
3. repetir build;
4. rodar `git diff --check`;
5. validar que não reabriu rotas antigas.

---

## 4. Rotas e guards

Arquivos:

```txt
src/app/routes.tsx
src/app/components/TreeAccessRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/pages/Home.tsx
src/app/pages/PersonProfile.tsx
```

Comportamento esperado:

- `/` redireciona para `/mapa-familiar`;
- `/mapa-familiar` usa `TreeAccessRoute`;
- `/mapa-familiar-horizontal` usa `TreeAccessRoute`;
- `/busca` usa `TreeAccessRoute`;
- `/minha-arvore/editar` usa `MemberRoute`;
- `/pessoa/:id` e `/pessoas/:id` usam `MemberRoute`;
- `/admin/*` usa `ProtectedRoute`.

Sintomas:

| Sintoma | Investigar |
|---|---|
| `/` não abre a árvore | `RedirectToMapaFamiliar`, `TreeAccessRoute`, sessão/vínculo. |
| `/mapa-familiar-horizontal` vira `/mapa-familiar` sem motivo | `treeViewMode.ts`, fallback, navegação do painel. |
| `?pessoa=` some ao alternar | helpers de navegação e `location.search`. |
| perfil não volta para horizontal | `PersonProfile.tsx`, lista segura de retorno. |
| rota antiga abre conteúdo | `routes.tsx`; não reintroduzir aliases sem decisão. |

---

## 5. E2E falhando por rota antiga

Sintoma:

```txt
page.goto('/minha-arvore')
```

ou expectativa de:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Causa:

- teste desatualizado em relação à baseline.

Correção:

- substituir smoke de view da árvore por `/mapa-familiar`;
- adicionar smoke para `/mapa-familiar-horizontal`;
- manter teste separado para `/minha-arvore/editar` se necessário;
- rotas antigas devem retornar 404, redirect ou login conforme decisão implementada, mas não devem ser documentadas como views ativas.

Arquivo provável:

```txt
tests/e2e/app-smoke.spec.ts
```

---

## 6. `TreeViewMode` divergente

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Contrato atual:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Sintomas:

| Sintoma | Causa provável |
|---|---|
| TypeScript pede `minha-arvore` | componente/doc antigo ainda tipado contra contrato removido. |
| botão horizontal abre rota errada | `VIEW_MODE_TO_PATH` ou navegação local incorreta. |
| rota desconhecida renderiza view errada | fallback de `getTreeViewModeFromPath`. |

Correção:

- manter apenas os dois modos oficiais;
- tratar path desconhecido como `mapa-familiar`;
- não reintroduzir modos antigos para “resolver” erro de build.

---

## 7. Painel lateral/mobile

Arquivos:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
```

Estado atual:

- abas `Filtros`, `Legendas`, `Ações` ainda existem;
- próxima frente deve removê-las;
- controles superiores devem ser preservados.

Sintomas:

| Sintoma | Investigar |
|---|---|
| filtros desapareceram | `activeSidebarPanel`, conteúdo condicional, modal mobile. |
| exportação parou | eventos de `SidebarPanelTabs`, refs da view ativa. |
| modal mobile não fecha | `legendOpen`, overlay, `Escape`, scroll lock. |
| painel entra na captura | falta de `data-tree-export-ignore`. |

Correção:

- remover abas apenas em frente própria;
- ao remover abas, deixar filtros visíveis diretamente;
- manter Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar e Destacar.

---

## 8. Mapa Familiar Vertical

Arquivos:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/styles/family-map-qa.css
```

Sintomas comuns:

| Sintoma | Investigar |
|---|---|
| grupos laterais sobrepostos | configuração de layout, áreas left/right, expansão. |
| cônjuge conectado à pessoa errada | relacionamento explícito `conjuge`, ordenação de cards. |
| pets não aparecem | `directRelativeFilters.pets`, `personFilters.pets`, tipo da pessoa. |
| conectores desalinhados | cálculo de âncoras, modo wide, `hideGroupChrome`. |
| exportação cortada | root exportável, escala, viewport, offsets. |

Correções seguras:

- ajustar configuração centralizada;
- não usar zoom padrão para mascarar sobreposição;
- não inferir cônjuge por proximidade visual;
- validar desktop e mobile.

---

## 9. Mapa Familiar Horizontal

Arquivos:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/styles/family-map-horizontal.css
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| geração vazia aparece | compactação de colunas e filtro de pessoas visíveis. |
| geração errada | `manual_generation`, inferência em memória. |
| cônjuges separados | ordenação/pareamento por relacionamento. |
| mobile mostra Paterno/Central/Materno | `HomeMobileNav`, condição de rota. |
| swipe não troca geração | handlers mobile, estado da geração ativa. |
| exportação horizontal corta colunas | root exportável, largura normalizada, escala. |

Correções:

- não usar `/genealogia` ou `/visao-completa` como fallback;
- não criar subrotas por geração;
- manter chips `G1`, `G2`, `G3` como navegação interna.

---

## 10. Exportação

Arquivos:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| PNG inclui painel | `data-tree-export-ignore`. |
| PDF duplica título | uso de `prependTitleToCanvas` e título passado ao PDF. |
| SVG vira quadrado escuro | normalização de SVGs no clone. |
| Área captura região errada | `getBoundingClientRect`, viewport, scroll. |
| loading aparece no canvas | `data-tree-export-loading`. |
| exportação muito grande falha | limite preventivo de pixels. |

Correção:

- manter `allowTaint: false`;
- revisar CORS de imagens;
- sanitizar cores incompatíveis no clone;
- testar PNG, PDF e impressão.

---

## 11. Favoritos e busca global

Arquivos:

```txt
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/components/favorites/PageFavoriteButton.tsx
```

Estado esperado:

- `/mapa-familiar` em favoritos e busca;
- `/mapa-familiar-horizontal` em favoritos e busca;
- `/minha-arvore`, `/genealogia`, `/visao-completa` fora dos catálogos ativos.

Sintomas:

| Sintoma | Investigar |
|---|---|
| horizontal não aparece na busca | `GLOBAL_SEARCH_PAGES`. |
| horizontal não pode ser favoritada | `FAVORITE_PAGES`. |
| rota antiga aparece em favoritos | catálogo ou registro legado salvo no banco. |
| favorito abre rota removida | dados antigos em `user_favorites`. |

Correção:

- atualizar catálogo;
- tratar registros antigos como legado de dados, não como rota ativa;
- não salvar query params em favorito de página.

---

## 12. CSS e regressões visuais

Arquivos:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/family-tree-visual-polish.css
src/styles/mobile-tree-lines.css
src/styles/tree-view-desktop-polish.css
```

Regras:

- CSS com nome antigo não é automaticamente removível;
- verificar uso real antes de apagar;
- preservar raízes:
  - `data-family-map-horizontal-root`;
  - `data-mobile-family-horizontal-root`;
  - `data-mobile-family-tree-root`;
  - `data-tree-route-view="mapa-familiar-horizontal"`;
- remover seletor legado apenas após QA visual.

---

## 13. Segurança e higiene

Itens de risco:

```txt
.env.local.save
backups/
*.bak
*.patch
dist/
test-results/
```

Regras:

- não commitar secrets;
- se `.env.local.save` tiver credenciais reais, rotacionar;
- não expor conteúdo de secrets em relatório;
- remover backup versionado após confirmar que não contém conteúdo necessário.

---

## 14. Encerramento da correção

Antes de commit:

```bash
git status --short
npm run build
npm test
npm run test:e2e
git diff --check
```

Se envolver docs:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" README.md docs
```

Critério:

- docs canônicos não devem descrever rotas antigas como views ativas;
- histórico pode permanecer em `docs/historico/`;
- toda mudança funcional deve atualizar doc afetada no mesmo commit.
