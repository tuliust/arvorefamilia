# Baseline do produto atual — Árvore Família

> Local canônico sugerido: `docs/BASELINE_PRODUTO_ATUAL.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: baseline funcional da `main` após a remoção das views antigas da árvore  
> Escopo: comportamento implementado no código atual, não histórico de produto

---

## 1. Objetivo

Este documento define o **estado canônico atual** do produto para orientar novas alterações, revisões e limpezas.

A baseline serve para evitar regressões como:

- restaurar rotas antigas da árvore;
- reintroduzir documentos canônicos desatualizados;
- remover código ainda compartilhado pelas views oficiais;
- apagar compatibilidades de dados sem migração;
- remover CSS misto sem teste visual;
- alterar navegação, exportação ou retorno de perfil sem validação.

Regra principal:

```txt
O comportamento implementado no código atual prevalece sobre documentação histórica.
```

Documentos em `docs/historico/` podem explicar decisões anteriores, mas não devem orientar implementação ativa sem validação contra o código atual.

---

## 2. Baseline funcional da árvore

O produto mantém **duas views oficiais de árvore**:

| View | Rota | Status | Uso |
|---|---|---|---|
| Mapa Familiar | `/mapa-familiar` | Oficial/default | View vertical principal da árvore |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | Oficial | View horizontal/genealógica por gerações |

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`, especialmente `?pessoa=...`.

### Rotas antigas removidas do produto ativo

As rotas abaixo **não são mais views ativas**:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Elas não devem voltar a aparecer em:

- `routes.tsx` como views da árvore;
- `TreeViewMode`;
- menu do usuário;
- favoritos de página;
- busca global;
- headers e breadcrumbs;
- documentação canônica;
- testes E2E como rotas válidas.

### Exceção nominal importante

A rota abaixo continua vigente:

```txt
/minha-arvore/editar
```

Ela representa a edição dos dados/árvore do membro e **não deve ser confundida** com a view antiga `/minha-arvore`.

---

## 3. Contrato de `TreeViewMode`

O contrato atual de `TreeViewMode` deve permanecer restrito a:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Mapeamento esperado:

```txt
mapa-familiar            -> /mapa-familiar
mapa-familiar-horizontal -> /mapa-familiar-horizontal
```

Fallback esperado:

```txt
getTreeViewModeFromPath(path desconhecido) -> mapa-familiar
```

Regras de não regressão:

- não reintroduzir `minha-arvore`, `genealogia` ou `visao-completa` no tipo;
- não criar alias silencioso para rotas removidas;
- qualquer nova view futura exige alteração coordenada em rotas, navegação, favoritos, busca, testes e documentação;
- alternância vertical/horizontal deve preservar `location.search`.

---

## 4. Renderização oficial das views

| Rota | Ambiente | Componente oficial |
|---|---|---|
| `/mapa-familiar` | Desktop/tablet | `DesktopFamilyMapView` |
| `/mapa-familiar` | Mobile | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | Desktop/tablet | `DesktopFamilyHorizontalMapView` |
| `/mapa-familiar-horizontal` | Mobile | `MobileFamilyHorizontalMapView` |

Regras:

- `/mapa-familiar` é a experiência visual vertical principal;
- `/mapa-familiar-horizontal` é a experiência genealógica horizontal;
- a horizontal mobile não é subrota; é uma renderização interna da mesma rota;
- não usar `/visao-completa` como substituto da horizontal;
- não reintroduzir renderização ReactFlow como view pública principal sem decisão arquitetural.

---

## 5. Navegação, favoritos e busca global

As duas views oficiais devem estar alinhadas em:

```txt
src/app/routes.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/pages/home/SidebarPanelTabs.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
```

### Favoritos

As páginas de árvore favoritáveis vigentes são:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Favoritar uma página salva o atalho da rota canônica, não estado visual de zoom, geração ativa ou filtros.

### Busca global

A busca global deve indexar as duas views oficiais e não deve indexar as views removidas como páginas ativas.

### Retorno de perfil

A navegação entre árvore e perfil usa `?voltar=...`.

Retornos seguros para a árvore:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

Fallback padrão:

```txt
/mapa-familiar
```

---

## 6. Painel da árvore: estado atual e pendência

Estado atual:

- o painel ainda possui controles superiores para:
  - Zoom +;
  - Zoom -;
  - Restaurar visualização;
  - Vertical;
  - Horizontal;
  - Cores;
  - Exportar;
  - Destacar;
- a barra inferior do painel ainda possui:
  - `Filtros`;
  - `Legendas`;
  - `Ações`.

Pendência planejada:

```txt
Remover a barra Filtros | Legendas | Ações.
```

Comportamento desejado para a próxima frente:

- filtros/grupos visíveis diretamente no painel;
- remover/ocultar aba de legendas;
- remover/ocultar aba de ações;
- preservar todos os controles superiores necessários;
- preservar modal mobile de controles;
- preservar exportação, cores e destaque.

---

## 7. Exportação

A exportação vigente deve funcionar nas duas views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Ações oficiais:

- Área;
- Imagem/PNG;
- PDF;
- Imprimir.

Regras:

- painel, header, bottom nav, overlays e loading não devem entrar na captura;
- a exportação deve preservar paleta, filtros, conectores SVG, cards e título;
- área selecionada deve capturar apenas a região visível escolhida;
- `treeExport.ts` é utilitário crítico e não deve ser removido em limpezas gerais;
- a existência de compatibilidade técnica com ReactFlow não significa que as rotas antigas estejam ativas.

---

## 8. Componentes e contratos críticos

### Preservar como oficiais

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/treeViewMode.ts
```

### Preservar por dependência até refatoração

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Motivos:

- `FamilyTree.tsx` ainda contém/exporta contrato usado pelas views atuais (`FamilyTreeActions`);
- `directFamilyDistributedLayout.ts` contém helper usado nas views oficiais;
- `genealogyColumnsLayout.ts` é dependência real da horizontal;
- ReactFlow ainda aparece em tipos, grafos ou layouts compartilhados.

Regra:

```txt
Não remover o stack ReactFlow legado em limpezas pequenas.
```

A remoção deve ser um projeto próprio, depois de extrair contratos e helpers ativos.

---

## 9. CSS e data attributes críticos

Preservar:

```txt
data-tree-route-view="mapa-familiar-horizontal"
data-family-map-horizontal-root
data-mobile-family-horizontal-root
data-mobile-family-tree-root
data-family-map-export-root="true"
data-tree-export-ignore="true"
data-tree-selection-overlay="true"
data-tree-export-loading="true"
```

Não remover CSS apenas por nome antigo. Há arquivos mistos que contêm regras vigentes e legado.

Preservar especialmente:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-tree-mobile.css
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
```

Atenção:

- `mobile-edit-profile.css` pode usar nomenclatura associada a `/minha-arvore/editar`, que continua vigente;
- aliases antigos como `mapa-horizontal` devem ser removidos apenas depois de QA visual;
- CSS de ReactFlow deve ser limpo apenas junto do projeto de remoção do renderer legado.

---

## 10. Documentação canônica vigente

Os arquivos abaixo devem refletir esta baseline:

```txt
README.md
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/DECISOES_ARQUITETURAIS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/arquitetura/ARCHITECTURE.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/funcionalidades/FAVORITOS.md
```

Documentos sobre views removidas devem ser arquivados em `docs/historico/` ou marcados explicitamente como legado.

Antes de arquivar documentos mistos, extrair regras ainda vigentes, especialmente sobre:

- filtros;
- pets;
- cônjuges;
- exportação;
- mobile;
- favoritos;
- busca global.

---

## 11. Testes obrigatórios de baseline

Antes de fechar mudanças relevantes:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Buscas recomendadas:

```bash
rg "minha-arvore"
rg "genealogia"
rg "visao-completa"
rg "/minha-arvore|/genealogia|/visao-completa"
rg "TreeViewMode|treeViewMode"
rg "Filtros|Legendas|Ações"
```

Interpretação:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode aparecer como termo descritivo/comercial da horizontal;
- `docs/historico/` pode conter rotas antigas;
- rotas antigas não devem aparecer como navegação ativa, favoritos, busca global ou `TreeViewMode`.

---

## 12. Backlog imediato após esta baseline

1. Corrigir e manter E2E alinhado às duas rotas oficiais.
2. Simplificar painel removendo `Filtros | Legendas | Ações`.
3. Extrair `FamilyTreeActions` de `FamilyTree.tsx` para contrato neutro.
4. Remover órfãos claros em commits pequenos.
5. Atualizar guias canônicos restantes.
6. Arquivar docs de views removidas.
7. Auditar CSS legado por seletor, com QA visual.
8. Planejar remoção do renderer ReactFlow legado como projeto separado.

---

## 13. Regra final

Qualquer mudança futura que altere rotas, views da árvore, exportação, retorno de perfil, favoritos, busca global, guards ou CSS estrutural deve atualizar esta baseline ou registrar uma decisão arquitetural explícita.

