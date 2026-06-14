# Guia de componentes - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/GUIA_COMPONENTES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia alinhado à baseline atual: `/mapa-familiar` e `/mapa-familiar-horizontal` como únicas views oficiais da árvore.

---

## 1. Objetivo

Este guia identifica os principais componentes do projeto, suas responsabilidades e os cuidados necessários para evitar regressões.

Use este documento antes de alterar:

- shell da árvore;
- views do Mapa Familiar;
- painel lateral/mobile;
- exportação;
- filtros;
- favoritos;
- busca;
- componentes compartilhados.

Documentos relacionados:

| Tema | Documento |
|---|---|
| Baseline | `docs/BASELINE_PRODUTO_ATUAL.md` |
| Inventário técnico | `docs/INVENTARIO_TECNICO.md` |
| UX/layout | `docs/GUIA_UX_LAYOUT.md` |
| Mapa Familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Painel/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Rotas | `docs/arquitetura/ROTAS_E_GUARDS.md` |

---

## 2. Convenções gerais

| Regra | Aplicação |
|---|---|
| Componentes visuais não acessam Supabase diretamente | Usar `services`. |
| Cálculos puros ficam em utils/layouts | Evitar lógica pesada dentro de JSX. |
| Botões não-submit usam `type="button"` | Evitar envio acidental de forms. |
| Props devem permanecer tipadas | Evitar `any` para corrigir build rapidamente. |
| Exportação ignora UI transitória | Usar `data-tree-export-ignore="true"`. |
| CSS deve ser escopado | Preferir rota, data attribute ou container. |
| Histórico não orienta implementação | Docs legados não podem reintroduzir views removidas. |

---

## 3. Shell da árvore

### 3.1 `Home`

Arquivo:

```txt
src/app/pages/Home.tsx
```

Responsabilidades:

- carregar pessoas e relacionamentos;
- resolver pessoa vinculada/central;
- manter filtros globais;
- controlar painel desktop/mobile;
- compor header e área da árvore;
- alimentar contagens renderizadas;
- controlar modais, IA, curiosidades, conexão e exportação.

Cuidados:

- `Home` está concentrado e deve ser refatorado por etapas pequenas;
- não inserir novas views antigas no shell;
- não misturar regras de rota com layout específico;
- preservar `?pessoa=...` e `?voltar=...`.

### 3.2 `HomeTreeSection`

Arquivo:

```txt
src/app/pages/home/HomeTreeSection.tsx
```

Responsabilidade:

- decidir qual componente de árvore renderizar;
- repassar filtros e callbacks;
- reagir a ações do painel;
- controlar título, loading e estados vazios.

Renderização vigente:

| Condição | Componente |
|---|---|
| mobile + `mapa-familiar` | `MobileFamilyTreeView` |
| mobile + `mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` |
| desktop/tablet + `mapa-familiar` | `DesktopFamilyMapView` |
| desktop/tablet + `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` |

Não reintroduzir branches para:

```txt
minha-arvore
genealogia
visao-completa
```

como views ativas.

### 3.3 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidades:

- header das views de árvore;
- busca;
- atalhos;
- menu de usuário;
- favoritos de página da view atual.

Cuidados:

- não apontar ação principal para `/minha-arvore`;
- preservar páginas favoritas de `/mapa-familiar` e `/mapa-familiar-horizontal`;
- nome/e-mail do usuário ficam no menu, não ao lado do avatar.

### 3.4 `HomeMobileNav`

Arquivo:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Responsabilidades:

- navegação inferior mobile;
- botão `Controles` nas views oficiais;
- abertura do modal mobile de controles;
- marcação para ignorar exportação.

Regras:

- `/mapa-familiar` mobile pode usar navegação interna de `MobileFamilyTreeView`;
- `/mapa-familiar-horizontal` mobile usa navegação por gerações;
- não reintroduzir `Paterno | Central | Materno` na horizontal mobile;
- não duplicar `MobileTreeControlsPortal`.

---

## 4. Painel e controles

### 4.1 `SidebarPanelTabs`

Arquivo:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
```

Estado atual:

- renderiza controles superiores;
- renderiza barra de abas `Filtros`, `Legendas`, `Ações`;
- emite eventos de zoom, restore e exportação;
- troca Vertical/Horizontal preservando search params.

Controles superiores vigentes:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
```

Dívida conhecida:

- a barra `Filtros | Legendas | Ações` deve ser removida em frente posterior;
- filtros/grupos devem ficar visíveis diretamente;
- `Legendas` e `Ações` devem ser ocultadas/removidas se não fizerem parte da experiência final.

### 4.2 `DirectRelationKpiGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
```

Responsabilidades:

- exibir grupos diretos;
- usar contagens efetivas quando a view informa;
- refletir `directRelativeFilters`.

### 4.3 `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Responsabilidades:

- renderizar cards/filtros de grupos;
- controlar `Cônjuges` e `Pets`;
- preservar semântica de filtros diretos.

### 4.4 `LifeStatusKpiGrid`

Arquivo:

```txt
src/app/pages/home/LifeStatusKpiGrid.tsx
```

Responsabilidades:

- filtros `Vivos`, `Falecidos` e `Pets`;
- contadores por status/tipo.

### 4.5 `TreeLegend` e `SidebarInfoPanel`

Arquivos:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/home/SidebarInfoPanel.tsx
```

Estado:

- ainda podem ser renderizados pelas abas atuais;
- devem ser revisados na frente de simplificação do painel;
- não remover antes de confirmar que não são usados em fluxo visível ou ajuda contextual.

---

## 5. Views oficiais da árvore

### 5.1 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar` no desktop/tablet;
- compor grupos da família direta;
- aplicar filtros de grupos/status;
- calcular cônjuges;
- desenhar conectores SVG;
- controlar zoom/scroll;
- exportar PNG/PDF/print;
- abrir seleção por área;
- implementar `Destacar > Grupos`.

Cuidados:

- não corrigir sobreposição por zoom padrão;
- não criar relações por proximidade visual;
- conectores devem depender de âncoras e relacionamentos explícitos;
- alteração de layout exige QA visual.

### 5.2 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidades:

- experiência mobile de `/mapa-familiar`;
- telas Paterno/Central/Materno;
- conectores HTML/CSS;
- visual compacto.

Cuidados:

- não usar na horizontal mobile;
- preservar swipe/abas internas;
- manter controles marcados para ignorar exportação.

### 5.3 `DesktopFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` no desktop/tablet;
- organizar pessoas por gerações;
- usar `manual_generation` quando disponível;
- compactar colunas vazias;
- desenhar conectores SVG;
- exportar superfície horizontal.

Cuidados:

- rota oficial é `/mapa-familiar-horizontal`, não `/genealogia`;
- `genealogyColumnsLayout` pode ser dependência técnica, não rota ativa;
- não remover layout compartilhado sem rastrear imports reais.

### 5.4 `MobileFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Responsabilidades:

- experiência mobile da horizontal;
- uma geração por tela;
- chips `G1`, `G2`, `G3` etc.;
- swipe lateral entre gerações;
- scroll vertical interno da geração ativa.

Cuidados:

- não reintroduzir `Paterno | Central | Materno`;
- não transformar geração em subrota;
- não capturar header/bottom nav na exportação.

### 5.5 `FamilyTreeVisualCards`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Responsabilidades:

- cards compartilhados das views visuais;
- avatares/silhuetas/pets;
- ícones de status;
- classes semânticas para exportação.

Cuidados:

- SVGs internos devem ser compatíveis com `html2canvas`;
- não usar seletor global `svg path`;
- conectores devem ser escopados separadamente.

---

## 6. Legado ativo e contratos a extrair

### 6.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Estado:

- renderer ReactFlow legado não é view oficial ativa;
- ainda exige cuidado porque pode concentrar tipos/contratos, especialmente `FamilyTreeActions`.

Recomendação:

- extrair `FamilyTreeActions` para arquivo neutro antes de remover `FamilyTree.tsx`;
- não remover ReactFlow em commit misto com mudança de UX;
- tratar remoção do renderer legado como projeto próprio.

### 6.2 Nodes/edges ReactFlow

Arquivos:

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Estado:

- candidatos a remoção apenas quando o stack ReactFlow legado for removido;
- não remover isoladamente se tipos ou exports ainda forem consumidos.

### 6.3 Layouts compartilhados

Arquivos:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Regra:

- preservar enquanto houver uso por views oficiais;
- nomes antigos não são evidência suficiente para remoção.

---

## 7. Favoritos e busca

Componentes/arquivos:

```txt
src/app/components/favorites/FavoriteButton.tsx
src/app/components/favorites/PageFavoriteButton.tsx
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
```

Estado:

- `/mapa-familiar` e `/mapa-familiar-horizontal` são páginas favoritáveis;
- ambas aparecem na busca global;
- rotas antigas não devem voltar aos catálogos ativos.

---

## 8. Exportação

Arquivos:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Responsabilidades:

- resolver alvo exportável;
- capturar com `html2canvas`;
- gerar PNG/PDF/impressão;
- compor título no canvas;
- ignorar interface.

Cuidados:

- painel e overlays devem ter `data-tree-export-ignore="true"`;
- alterações no painel não podem quebrar `Área`, `Imagem`, `PDF` e `Imprimir`;
- exportação precisa de QA manual.

---

## 9. Componentes candidatos a revisão futura

| Componente/arquivo | Situação | Ação |
|---|---|---|
| `GenealogyMobileStageTabs.tsx` | ligado a fluxo antigo | remover após confirmar zero imports |
| `ViewModeToggle.tsx` | sem consumidor aparente | remover em commit próprio |
| `ImageWithFallback.tsx` | sem consumidor aparente | remover após busca final |
| `CentralNotificacoes.tsx` | sem rota/import aparente | investigar antes de remover |
| `GenealogyFilterGrid.tsx` | pode estar importado sem renderização útil | limpar junto ao painel |

---

## 10. Validação

Após alterar componentes:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Quando envolver árvore:

```bash
rg "TreeViewMode"
rg "/minha-arvore|/genealogia|/visao-completa"
rg "data-tree-route-view"
```

Critérios:

- as duas views oficiais funcionam no desktop e mobile;
- `?pessoa=...` é preservado;
- exportação continua funcionando;
- painel mobile continua abrindo;
- rotas antigas não voltam como navegação ativa;
- `/minha-arvore/editar` continua preservada.
