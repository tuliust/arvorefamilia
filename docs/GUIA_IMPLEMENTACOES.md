# Guia de implementações — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico alinhado às duas views oficiais da árvore, painel simplificado, paletas desktop/mobile, calendário mobile e exportação.

---

## 1. Objetivo

Este documento registra o que está implementado no projeto **Árvore Família** e quais comportamentos devem ser considerados vigentes.

Use este guia para:

- entender o estado atual do produto;
- evitar restauração acidental de rotas e padrões removidos;
- localizar os arquivos responsáveis por cada frente;
- orientar manutenção sem transformar histórico em regra ativa;
- distinguir implementação vigente, legado técnico e backlog.

---

## 2. Baseline funcional atual

Rotas centrais:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

Comportamento:

- `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- `/mapa-familiar` é a view principal/default;
- `/mapa-familiar-horizontal` é a alternativa horizontal/genealógica;
- `TreeViewMode` possui apenas:
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`.

Rotas removidas do produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa rota é uma página de edição de membro e não deve ser confundida com a antiga view `/minha-arvore`.

---

## 3. Estado consolidado do MVP

| Frente | Estado atual | Observação de manutenção |
|---|---|---|
| Rotas da árvore | Implementadas | Apenas `/mapa-familiar` e `/mapa-familiar-horizontal` são views ativas. |
| Redirect raiz | Implementado | `/` redireciona para `/mapa-familiar` preservando query string. |
| Guards | Implementados | Árvore usa `TreeAccessRoute`; membro usa `MemberRoute`; admin usa `ProtectedRoute`. |
| Shell da árvore | Implementado | `Home` é o shell das duas views oficiais. |
| Mapa Familiar | Implementado | Desktop/tablet usa `DesktopFamilyMapView`; mobile usa `MobileFamilyTreeView`. |
| Mapa Familiar Horizontal | Implementado | Desktop/tablet usa `DesktopFamilyHorizontalMapView`; mobile usa `MobileFamilyHorizontalMapView`. |
| Horizontal mobile | Implementada | Uma geração por tela, botões `Ger X`, swipe lateral e scroll vertical interno. |
| Favoritos de páginas | Implementados | `FAVORITE_PAGES` inclui `/mapa-familiar` e `/mapa-familiar-horizontal`. |
| Busca global | Implementada | `GLOBAL_SEARCH_PAGES` inclui as duas views oficiais e aliases antigos apontam para rotas atuais. |
| Retorno de perfil | Implementado | `?voltar=` aceita `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`. |
| Painel desktop/mobile | Implementado | Painel simplificado, sem barra `Filtros | Legendas | Ações`. |
| Cards do painel | Implementados | Cards de grupos/filtros no desktop seguem o visual da paleta ativa. |
| Exportação | Implementada | Área, Imagem, PDF e Imprimir nas views oficiais. |
| Paletas | Implementadas | `white`, `visual`, `orange`, `brown`. |
| Paletas mobile | Implementadas | Mobile replica desktop, com CSS escopado para corrigir divergências visuais. |
| Bordas de grupos mobile | Implementadas | Containers de grupos usam variáveis de paleta, não borda fixa. |
| Cards mobile de pessoas | Implementados | Sem fallback textual de nascimento/falecimento não informado. |
| Cônjuges adicionais | Implementado estruturalmente | `/mapa-familiar` suporta segundo núcleo conjugal quando dados existem. |
| Cônjuges da Geração 4 | Implementado/contrato vigente | `/mapa-familiar-horizontal` deve renderizar cônjuges de Pais/Geração 4 quando filtro está ativo. |
| Destaques | Implementados | `Linhas`, `Cards`, `Grupos`. |
| Perfil de pessoa | Implementado | Perfil autenticado, dados, arquivos, eventos e favoritos. |
| Admin | Implementado | Pessoas, relacionamentos, importação, integridade, notificações e solicitações. |
| Fórum | Implementado | Categorias, tópicos, respostas, reações, favoritos e notificações. |
| Calendário | Implementado | Datas familiares e integração Google Calendar quando configurada. |
| Calendário mobile | Implementado | 5 categorias em uma linha, bolinha colorida acima do título, título em uma linha. |
| Notificações | Implementadas | Central, preferências, dispatch interno/e-mail conforme configuração. |
| Testes | Implementados parcialmente | Vitest e Playwright validam baseline estrutural. |
| Higiene de repo | Implementada | Artefatos locais de teste, backups e cópias de env ignorados. |

---

## 4. Rotas, acesso e guards

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/TreeAccessRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/contexts/AuthContext.tsx
src/app/services/permissionService.ts
```

Contrato atual:

| Rota | Guard | Status |
|---|---|---|
| `/` | `TreeAccessRoute` | Redireciona para `/mapa-familiar`. |
| `/mapa-familiar` | `TreeAccessRoute` | View oficial principal. |
| `/mapa-familiar-horizontal` | `TreeAccessRoute` | View oficial horizontal. |
| `/busca` | `TreeAccessRoute` | Busca global autenticada. |
| `/minha-arvore/editar` | `MemberRoute` | Edição do membro; preservar. |
| `/pessoa/:id` | `MemberRoute` | Perfil de pessoa. |
| `/pessoas/:id` | `MemberRoute` | Alias vigente. |
| `/meus-dados`, `/meus-vinculos`, `/vincular-perfil` | `MemberRoute` | Área de membro. |
| `/calendario-familiar` | `MemberRoute` | Calendário familiar. |
| `/forum/*` | `MemberRoute` | Fórum. |
| `/admin/*` | `ProtectedRoute` | Administração. |

Não reintroduzir:

```txt
/minha-arvore
/genealogia
/visao-completa
```

como views ativas.

---

## 5. Shell da Home e renderização da árvore

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Matriz vigente:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Regras:

- a troca Vertical/Horizontal deve preservar `location.search`;
- `?pessoa=...` não pode ser perdido;
- a horizontal mobile não usa barra `Paterno | Central | Materno`;
- a horizontal mobile navega por gerações dentro de `MobileFamilyHorizontalMapView`;
- as rotas antigas não devem ser usadas como fallback visual.

---

## 6. Painel, filtros e controles

Estado atual:

- painel sem barra `Filtros | Legendas | Ações`;
- filtros/grupos/status ficam visíveis diretamente;
- controles superiores permanecem;
- flyouts específicos concentram paletas, exportação e destaques;
- modal mobile usa o mesmo conjunto de controles essenciais.

Controles desktop vigentes:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros/grupos
Filtros de status
```

Controles mobile vigentes:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

No mobile, não exibir:

```txt
Zoom
Restaurar visualização
Exportar
```

Arquivos envolvidos:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/styles/home-sidebar-unified.css
src/styles/tree-panel-palette-cards.css
src/styles/mobile-tree-controls.css
```

---

## 7. Paletas, cards e CSS escopado

Paletas oficiais:

```txt
white
visual
orange
brown
```

Arquivos principais:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
src/styles/calendar-mobile-category-buttons.css
```

Contrato:

- desktop é referência visual;
- mobile replica desktop;
- cards, bordas, texto, conectores e canvas mudam juntos;
- Visual/Azul usa gradiente teal/cyan/blue quando o componente base exige correção;
- demais paletas não devem cair em fallback azul;
- bordas dos grupos mobile usam `--family-map-group-border`;
- fundos de grupos mobile usam `--family-map-group-bg`;
- CSS novo deve ser escopado por root/data attribute.

---

## 8. Regras de cônjuges implementadas

### Sempre visíveis

Não dependem do filtro:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### Filtráveis

Dependem do filtro `Cônjuges`:

- cônjuges de pais/Geração 4 na horizontal;
- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

### Núcleos conjugais descendentes

`/mapa-familiar` suporta estruturalmente:

- primeiro cônjuge visível como núcleo principal;
- cônjuges adicionais como “Outro relacionamento”;
- filhos agrupados pelo outro pai/mãe quando a relação explícita existe;
- filhos sem outro pai/mãe identificado permanecem no grupo principal.

---

## 9. Calendário familiar implementado

Rota:

```txt
/calendario-familiar
```

Arquivos:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/styles/calendar-mobile-category-buttons.css
src/app/utils/familyDates.ts
src/app/services/googleCalendarService.ts
```

Contrato mobile atual:

- 5 categorias em uma única linha;
- bolinha colorida acima do título;
- título em uma linha;
- sem overflow horizontal;
- card grande de categorias oculto no mobile quando duplicar os filtros superiores.

Categorias compactas:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

---

## 10. Exportação da árvore

Implementada em:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeExportLoadingOverlay.tsx
```

Ações:

- Área;
- Imagem/PNG;
- PDF;
- Imprimir.

Views suportadas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Regras:

- painel e UI transitória não entram na captura;
- exportação deve respeitar filtros, destaques, paletas, conectores e título;
- captura excessiva deve ser bloqueada;
- HTML/CSS/SVG das views oficiais tem prioridade sobre compatibilidade ReactFlow;
- título exportável deve usar a nomenclatura vigente:
  - `Árvore Familiar`;
  - `Mapa Genealógico`.

---

## 11. Busca e favoritos

Arquivos:

```txt
src/app/services/globalSearchService.ts
src/app/constants/favoritePages.ts
src/app/services/favoritesService.ts
```

Regras:

- busca/favoritos usam rotas canônicas;
- termos antigos podem servir como aliases;
- aliases antigos não podem salvar `/minha-arvore`, `/genealogia` ou `/visao-completa` como destino ativo;
- favorito de página não salva zoom/filtro/query como contrato obrigatório.

---

## 12. Código removido ou desativado na frente

Removido:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/CentralNotificacoes.tsx
src/app/components/FamilyTree/ViewModeToggle.tsx
src/app/components/figma/ImageWithFallback.tsx
src/app/services/relationshipResolverService.ts
```

Removido do versionamento:

```txt
backups/
.env.local.save
```

Ignorado em `.gitignore`:

```txt
coverage/
test-results/
playwright-report/
backups/
.env*.save
```

---

## 13. Legado técnico preservado

Preservar até projeto específico:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/styles/mobile-tree-lines.css
```

Motivo:

- podem conter tipos, contratos ou helpers usados;
- limpeza superficial pode quebrar exportação/layout;
- ReactFlow/Dagre devem ser desativados em frente própria.

---

## 14. Validação da baseline

Comandos obrigatórios antes de fechar mudança relevante:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```

Resultado final esperado:

- build passa;
- testes unitários passam;
- testes E2E passam;
- `git status --short` sem saída;
- `main` sincronizada com `origin/main`.

---

## 15. Pendências não implementadas neste guia

Registrar e acompanhar em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

Principais categorias:

- QA visual manual;
- QA mobile iOS/Safari;
- QA de exportação;
- limpeza futura do stack ReactFlow legado;
- eventual CI GitHub Actions;
- fechamento formal de issues.
