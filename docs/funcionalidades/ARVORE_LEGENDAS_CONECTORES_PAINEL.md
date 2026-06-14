# Árvore - legendas, conectores, filtros e painel

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Tipo: documentação funcional/técnica do painel, filtros, conectores e legendas.  
> Status: alinhado à baseline atual, com dívida registrada para remover as abas `Filtros | Legendas | Ações`.

---

## 1. Função deste documento

Este documento consolida o comportamento de:

- painel lateral desktop;
- painel mobile modal;
- filtros de grupos;
- filtros de status;
- regras de cônjuges;
- botões de zoom/restauração;
- alternância Vertical/Horizontal;
- flyouts `Cores`, `Exportar`, `Destacar`;
- conectores;
- legendas;
- seleção por área;
- loading de exportação.

Views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Rotas antigas não são views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

---

## 2. Estado atual do painel

O painel atual ainda contém:

```txt
Filtros
Legendas
Ações
```

Esse é o estado vigente do código, mas é uma dívida de UX já mapeada.

Próxima frente esperada:

- remover a barra `Filtros | Legendas | Ações`;
- manter filtros/grupos visíveis diretamente;
- remover/ocultar `Legendas`;
- remover/ocultar `Ações`;
- preservar controles superiores.

---

## 3. Controles superiores que devem permanecer

| Controle | Função |
|---|---|
| Zoom + | aproxima a view ativa |
| Zoom - | afasta a view ativa |
| Restaurar visualização | reseta posição/zoom/scroll |
| Vertical | navega para `/mapa-familiar` |
| Horizontal | navega para `/mapa-familiar-horizontal` |
| Cores | alterna paleta |
| Exportar | Área, Imagem, PDF, Imprimir |
| Destacar | Linhas, Cards, Grupos |

Regras:

- Vertical/Horizontal preservam `location.search`;
- `?pessoa=...` não pode ser perdido;
- exportação não pode quebrar quando as abas forem removidas;
- painel não entra na captura/exportação.

---

## 4. Arquivos principais

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/home/SidebarInfoPanel.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
```

---

## 5. Estados principais

| Estado | Papel |
|---|---|
| `directRelativeFilters` | controla grupos/filtros diretos usados nas duas views oficiais |
| `personFilters` | controla vivos/falecidos/pets |
| `visualLineFilters` | usado por linhas/destaques conforme view |
| `activeHighlights` | controla `Destacar` |
| `legendOpen` | hoje também controla modal mobile; revisar na próxima frente |
| `activeSidebarPanel` | controla abas atuais; remover na simplificação |
| `renderedDirectRelationCounts` | contagens efetivas retornadas pela view |

Regras:

- filtro não altera dados;
- destaque não altera dados;
- contagem deve refletir renderização efetiva quando disponível;
- cônjuge sempre visível não deve inflar contagem de cônjuges filtráveis.

---

## 6. Filtros diretos

Keys:

```txt
tataravos
bisavos
avos
pais
tios
primos
sobrinhos
irmaos
filhos
netos
conjuge
pets
```

Regras:

- `Cônjuges` é filtro visual específico;
- `Pets` é filtro de pets;
- `Filhos` usa ícone próprio;
- `Pets` usa tom teal/ciano na paleta visual;
- filtros devem funcionar nas duas views oficiais.

---

## 7. Regras de cônjuges

### Sempre visíveis

Não dependem do filtro `Cônjuges`:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### Filtráveis

Dependem do filtro:

- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

### Anti-regressão

```txt
Conector conjugal nunca deve ser inferido apenas por proximidade visual.
```

---

## 8. Filtros de status

Componente:

```txt
LifeStatusKpiGrid
```

Filtros:

```txt
Vivos
Falecidos
Pets
```

Regras:

- pessoa central deve permanecer visível quando aplicável;
- pets dependem de filtros de pet e tipo de pessoa;
- filtros não devem remover dados do banco.

---

## 9. Legendas

Componente:

```txt
TreeLegend
```

Estado:

- ainda pode ser exibido na aba `Legendas`;
- deve ser revisado na simplificação do painel;
- não participa da exportação;
- elementos de legenda devem ser marcados para ignorar captura quando visíveis.

Decisão futura:

- se a legenda sair do produto atual, remover UI e docs canônicas;
- se permanecer como ajuda, reposicionar fora do fluxo de abas.

---

## 10. Ações/Info

Componente:

```txt
SidebarInfoPanel
```

Estado:

- ainda pode ser exibido na aba `Ações`;
- deve ser revisado/removido na próxima frente se não tiver função essencial.

---

## 11. Conectores

### Vertical

View:

```txt
DesktopFamilyMapView
```

Características:

- SVG por âncoras;
- recalculado com grupos, zoom e modo wide;
- ajustado quando `Destacar > Grupos` oculta chrome.

### Horizontal

View:

```txt
DesktopFamilyHorizontalMapView
```

Características:

- SVG por geração/casal/filhos;
- conectores de cônjuge e casal → filhos;
- colunas compactadas;
- recalculado quando cabeçalhos/grupos mudam.

### Mobile vertical

View:

```txt
MobileFamilyTreeView
```

Características:

- conectores HTML/CSS;
- navegação Paterno/Central/Materno.

### Mobile horizontal

View:

```txt
MobileFamilyHorizontalMapView
```

Características:

- geração ativa por tela;
- chips/swipe;
- conectores escopados à experiência mobile.

---

## 12. Destaques

Flyout:

```txt
Destacar
```

Opções:

| Opção | Papel |
|---|---|
| Linhas | oculta/suaviza conectores |
| Cards | destaca cards |
| Grupos | remove chrome visual de grupos/cabeçalhos |

Regras:

- destaque não cria relacionamento;
- destaque não reexibe item filtrado;
- destaque não persiste;
- `Destacar > Grupos` deve recalcular conectores.

---

## 13. Cores

Flyout:

```txt
Cores
```

Paletas:

```txt
white
visual
orange
brown
```

Regras:

- usa CSS variables;
- persiste preferência local quando aplicável;
- exportação deve refletir paleta ativa;
- ícones e SVGs devem manter contraste.

---

## 14. Exportar

Flyout:

```txt
Exportar
```

Ações:

```txt
Área
Imagem
PDF
Imprimir
```

Regras:

- ação vem do painel;
- alvo vem da view ativa;
- painel/modal/header/bottom nav/loading não entram na captura;
- seleção por área usa overlay próprio;
- erro libera loading.

Documento específico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 15. Painel mobile

Nas rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

comportamento:

- `HomeMobileNav` abre o modal;
- modal fica acima de header e bottom nav;
- overlay cobre tela;
- toque no overlay fecha;
- `Escape` fecha;
- body bloqueia scroll;
- conteúdo interno rola;
- modal não entra na exportação.

Dívida:

- ao remover abas, modal deve exibir filtros diretos sem depender de `activeSidebarPanel`.

---

## 16. Próxima frente: simplificação do painel

Objetivo:

- remover barra `Filtros | Legendas | Ações`;
- eliminar `activeSidebarPanel` se não houver outro uso;
- deixar filtros/grupos visíveis diretamente;
- revisar `legendOpen` para representar apenas abertura do modal mobile, ou renomear;
- remover `TreeLegend`/`SidebarInfoPanel` da experiência se não forem mais necessários;
- preservar exportação, cores, destaque, zoom e alternância.

Arquivos prováveis:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

---

## 17. Validações

Após alteração no painel:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

QA manual:

- abrir `/mapa-familiar`;
- abrir `/mapa-familiar-horizontal`;
- testar filtros diretos;
- testar vivos/falecidos/pets;
- alternar Vertical/Horizontal com `?pessoa=...`;
- abrir modal mobile;
- exportar PNG/PDF/imprimir;
- testar `Destacar > Grupos`;
- testar paletas;
- confirmar que `Filtros`, `Legendas` e `Ações` não aparecem se a frente já tiver sido aplicada.

---

## 18. Anti-regressões

Não quebrar:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros diretos
Modal mobile
Exportação
```

Não reintroduzir:

```txt
/minha-arvore
/genealogia
/visao-completa
```

como views ativas.
