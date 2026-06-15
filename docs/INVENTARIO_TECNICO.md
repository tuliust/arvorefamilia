# Inventário técnico — Árvore Família

> Última revisão: 2026-06-14
> Local canônico: `docs/INVENTARIO_TECNICO.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: inventário técnico
> Status: revisado contra documentos enviados e código da `main`; marca legado ativo, dívidas e riscos sem transformar pendências em baseline.

---

## 1. Objetivo

Este inventário lista arquivos, contratos e dependências técnicas relevantes.

Use para:

- estimar impacto de alterações;
- planejar refatorações;
- evitar remoções inseguras;
- orientar QA e revisão;
- manter documentação sincronizada.

Classificações:

| Categoria | Definição |
|---|---|
| Vigente | Usado pelo produto atual. |
| Vigente crítico | Usado em fluxo sensível; alteração exige teste/QA. |
| Vigente com dívida | Usado, mas concentrado, mal nomeado ou difícil de manter. |
| Legado ativo | Antigo, mas ainda importado/usado. |
| Temporário/debug | Útil para QA, não produto final. |
| Histórico/removido | Não deve orientar implementação ativa. |
| Candidato a refatoração | Deve ser tratado em frente própria. |

---

## 2. Rotas

### 2.1 Árvore

| Rota | Componente/guard | Categoria | Observação |
|---|---|---|---|
| `/` | `TreeAccessRoute` + redirect | Vigente crítico | Redireciona para `/mapa-familiar` preservando search. |
| `/mapa-familiar` | `TreeHomeShell` → `Home` | Vigente crítico | View principal. |
| `/mapa-familiar-horizontal` | `TreeHomeShell` → `Home` | Vigente crítico | View horizontal. |
| `/busca` | `TreeAccessRoute` → `BuscaResultados` | Vigente | Busca global. |
| `/minha-arvore` | Sem rota ativa | Histórico/removido | Não restaurar. |
| `/genealogia` | Sem rota ativa | Histórico/removido | Não restaurar. |
| `/visao-completa` | Sem rota ativa | Histórico/removido | Não restaurar. |

### 2.2 Membro

| Rota | Componente | Guard | Categoria |
|---|---|---|---|
| `/minha-arvore/editar` | `MinhaArvore` | `MemberRoute` | Vigente com nome histórico |
| `/meus-dados` | `MeusDados` | `MemberRoute` | Vigente |
| `/meus-vinculos` | `MeusVinculos` | `MemberRoute` | Vigente |
| `/vincular-perfil` | `VincularPerfil` | `MemberRoute` | Vigente |
| `/pessoa/:id` | `PersonProfile` | `MemberRoute` | Vigente |
| `/pessoas/:id` | `PersonProfile` | `MemberRoute` | Alias vigente |
| `/calendario-familiar` | `CalendarioFamiliar` | `MemberRoute` | Vigente |
| `/meus-favoritos` | `MeusFavoritos` | `MemberRoute` | Vigente |
| `/notificacoes` | `Notificacoes` | `MemberRoute` | Vigente |
| `/ajustar-notificacoes` | `AjustarNotificacoes` | `MemberRoute` | Vigente |
| `/forum/*` | páginas de fórum | `MemberRoute` | Vigente |

### 2.3 Públicas e admin

| Rota | Categoria |
|---|---|
| `/entrar` | Pública |
| `/termos` | Pública |
| `/privacidade` | Pública |
| `/admin/login` | Pública/admin |
| `/admin/*` | Protegida por `ProtectedRoute` |

---

## 3. Roteamento e navegação

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/routes.tsx` | rotas, lazy loading, guards e fallback | Vigente crítico |
| `src/app/components/FamilyTree/treeViewMode.ts` | contrato das views oficiais | Vigente crítico |
| `src/app/constants/favoritePages.ts` | páginas favoritáveis | Vigente |
| `src/app/services/globalSearchService.ts` | busca global de páginas/pessoas | Vigente |
| `src/app/components/layout/UserProfileMenu.tsx` | menu do usuário | Vigente |
| `src/app/components/layout/MemberPageHeader.tsx` | header interno | Vigente |
| `src/app/pages/PersonProfile.tsx` | perfil e retorno via `?voltar=` | Vigente crítico |

Contrato de `TreeViewMode`:

```txt
mapa-familiar
mapa-familiar-horizontal
```

---

## 4. Shell da árvore

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/Home.tsx` | orquestra dados, filtros, painel, modal, exportação e debug | Vigente com dívida alta |
| `src/app/pages/home/HomeTreeSection.tsx` | decide view por modo/breakpoint | Vigente crítico |
| `src/app/pages/home/HomeHeader.tsx` | header da Home | Vigente |
| `src/app/pages/home/HomeMobileNav.tsx` | bottom nav e controles mobile | Vigente crítico |
| `src/app/pages/home/SidebarPanelTabs.tsx` | painel/controles/flyouts/filtros | Vigente com dívida de nome |
| `DirectRelationKpiGrid.tsx` | KPIs/contagens de relações diretas | Vigente |
| `DirectRelativeFilterGrid.tsx` | filtros de grupos diretos | Vigente |
| `LifeStatusKpiGrid.tsx` | filtros por status/tipo | Vigente |

Dívidas:

```txt
Home.tsx concentra responsabilidades demais.
SidebarPanelTabs.tsx mantém nome histórico.
legendOpen controla modal de controles, não aba de legenda.
```

---

## 5. Views oficiais da árvore

| Arquivo | Uso | Categoria | Risco |
|---|---|---|---|
| `DesktopFamilyMapView.tsx` | `/mapa-familiar` desktop/tablet | Vigente crítico | Alto |
| `MobileFamilyTreeView.tsx` | `/mapa-familiar` mobile | Vigente crítico | Alto |
| `DesktopFamilyHorizontalMapView.tsx` | `/mapa-familiar-horizontal` desktop/tablet | Vigente crítico | Alto |
| `MobileFamilyHorizontalMapView.tsx` | `/mapa-familiar-horizontal` mobile | Vigente crítico | Alto |
| `FamilyTreeVisualCards.tsx` | cards e avatares compartilhados | Vigente crítico | Alto |
| `TreeAreaSelectionOverlay.tsx` | seleção/exportação por área | Vigente crítico | Alto |
| `TreeExportLoadingOverlay.tsx` | loading de exportação | Vigente | Médio |

### Contratos técnicos relevantes

| Contrato | Estado |
|---|---|
| Títulos `Árvore Familiar` e `Mapa Genealógico` | Implementados em `HomeTreeSection`. |
| Horizontal mobile por geração | Implementado em `MobileFamilyHorizontalMapView`. |
| Cônjuges filtráveis horizontais | Implementado para alguns grupos; `pais` é pendência `TREE-003`. |
| Fallback de datas mobile | Resultado visual protegido por limpeza DOM; dívida `TREE-004`. |
| Debug `Visualizar como...` | Temporário/decisão pendente `TREE-005`. |

---

## 6. Paletas, cards e CSS

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/components/FamilyTree/treeColorPalettes.ts` | tokens de paleta | Vigente crítico |
| `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` | cards/avatares/status | Vigente crítico |
| `src/styles/family-map-qa.css` | estilos da vertical e tokens | Vigente |
| `src/styles/family-map-horizontal.css` | estilos da horizontal | Vigente |
| `src/styles/family-map-mobile-palettes.css` | paletas mobile | Vigente crítico |
| `src/styles/tree-panel-palette-cards.css` | cards do painel por paleta | Vigente |
| `src/styles/home-sidebar-unified.css` | painel e ajustes da Home | Vigente |
| `src/styles/mobile-tree-controls.css` | modal mobile de controles | Vigente |
| `src/styles/calendar-mobile-category-buttons.css` | calendário mobile | Vigente crítico |

Paletas:

```txt
white
visual
orange
brown
```

---

## 7. Calendário familiar

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/CalendarioFamiliar.tsx` | calendário familiar | Vigente |
| `src/styles/calendar-mobile-category-buttons.css` | layout mobile dos botões | Vigente crítico |

Categorias documentadas:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

---

## 8. Perfil, favoritos, fórum e notificações

| Área | Arquivos | Categoria |
|---|---|---|
| Perfil/pessoas | `PersonProfile.tsx`, `components/person/`, `MinhaArvore.tsx`, `MeusDados.tsx` | Vigente |
| Favoritos | `components/favorites/`, `favoritesService.ts`, `favoritePages.ts` | Vigente |
| Fórum | `pages/forum/`, `forumService.ts` | Vigente |
| Notificações | `Notificacoes.tsx`, `AjustarNotificacoes.tsx`, `userEngagementService.ts` | Vigente |
| Busca | `BuscaResultados.tsx`, `globalSearchService.ts` | Vigente |

---

## 9. Services principais

| Arquivo | Categoria | Observação |
|---|---|---|
| `dataService.ts` | Vigente crítico | Pessoas, relacionamentos e eventos. |
| `memberProfileService.ts` | Vigente crítico | Vínculos e perfis de membro. |
| `treeDataCache.ts` | Vigente | Cache/eventos da árvore. |
| `relationshipCacheService.ts` | Vigente | Cache de parentesco. |
| `favoritesService.ts` | Vigente | Favoritos. |
| `globalSearchService.ts` | Vigente | Busca e aliases de páginas. |
| `forumService.ts` | Vigente | Fórum. |
| `userEngagementService.ts` | Vigente com compatibilidade | Notificações/preferências. |
| `storageService.ts` | Vigente | Storage/arquivos quando usado. |
| `personProfileSuggestionService.ts` | Vigente se integrado | Sugestões/edição assistida. |

---

## 10. Legado ativo da árvore

| Arquivo | Situação | Ação recomendada |
|---|---|---|
| `FamilyTree.tsx` | origem/contrato legado, ainda pode fornecer tipos/refs | preservar até frente ReactFlow |
| `PersonNode.tsx` | nó ReactFlow legado | remover só com inventário de imports |
| `MarriageNode.tsx` | nó/tipos legados | separar tipos antes de remover |
| `GenealogySpouseEdge.tsx` | edge legado | remover em lote específico |
| `OrthogonalChildEdge.tsx` | edge legado | remover em lote específico |
| `nodeTypes.ts` / `edgeTypes.ts` | configuração ReactFlow | auditar antes de remover |
| `buildTreeGraph.ts` | helper ainda usado por views horizontais | preservar |
| `layouts/directFamilyDistributedLayout.ts` | helper das views oficiais | preservar |
| `layouts/genealogyColumnsLayout.ts` | helper da horizontal | preservar |

Regra:

```txt
Legado ativo não é lixo. Remover apenas em frente própria.
```

---

## 11. Supabase, migrations e operação

Áreas a verificar em alterações operacionais:

```txt
supabase/migrations/
supabase/functions/
scripts/
docs/operacao/
```

Regras:

| Mudança | Exige migration? |
|---|---|
| CSS/layout/documentação | Não |
| Nova coluna/tabela/policy/índice | Sim |
| Edge Function | Não como migration necessariamente, mas exige documentação de deploy/secrets |
| Storage bucket/policy | Sim ou procedimento operacional documentado |
| Secret/OAuth/service role | Não versionar valor; documentar nome e uso |

---

## 12. Scripts, build e testes

Arquivos de configuração relevantes:

```txt
package.json
vite.config.*
playwright.config.*
tsconfig*.json
vercel.json
```

Comandos conhecidos:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Testes esperados:

| Tipo | Uso |
|---|---|
| Vitest | utils/modelos e lógica pura. |
| Playwright | smoke de rotas, guards e rotas antigas removidas. |
| QA manual | layout, paletas, exportação e mobile real. |

---

## 13. Data attributes críticos

| Atributo | Função |
|---|---|
| `data-tree-route-view` | identifica view horizontal no shell |
| `data-export-root="family-tree"` | raiz de exportação |
| `data-family-map-export-root="true"` | raiz/escopo de mapa familiar |
| `data-tree-export-ignore="true"` | ignora UI na exportação |
| `data-family-map-color-key` | paletas/cards |
| `data-mobile-family-tree-root="true"` | escopo mobile vertical |
| `data-family-map-mobile-card="true"` | cards mobile |
| `data-tree-debug-viewer="true"` | debug temporário |

---

## 14. Documentação

| Documento | Papel |
|---|---|
| `BASELINE_PRODUTO_ATUAL.md` | estado funcional vigente |
| `GUIA_IMPLEMENTACOES.md` | frentes implementadas |
| `GUIA_COMPONENTES.md` | responsabilidades de componentes |
| `GUIA_UX_LAYOUT.md` | UX e layout |
| `REGRAS_DE_NAO_REGRESSAO.md` | checklists e comandos |
| `PLANO_PROXIMOS_PASSOS.md` | pendências, riscos e decisões |
| `DECISOES_ARQUITETURAIS.md` | decisões estruturais |
| `docs/funcionalidades/` | documentação funcional detalhada |
| `docs/arquitetura/` | arquitetura, rotas e guards |
| `docs/operacao/` | deploy, migrations, OAuth, storage e manutenção |

---

## 15. Riscos técnicos principais

| Risco | Categoria | Mitigação |
|---|---|---|
| Reativar rotas antigas | alto | testes E2E e busca por rotas |
| Tratar pendência como implementada | alto | manter `TREE-003`/`TREE-004` no plano |
| Quebrar exportação | alto | QA em Área/PNG/PDF/Print |
| Alterar CSS global demais | alto | escopo por root/data attribute |
| Remover legado ativo | alto | inventário de imports e build |
| Quebrar mobile horizontal | alto | QA em dispositivos/larguras reais |
| Quebrar OAuth/Storage | médio/alto | docs operacionais e secrets fora do repo |

---

## 16. Critério para refatoração segura

Antes de refatorar:

```bash
rg "arquivoOuSímbolo" src docs
npm run build
npm test
npm run test:e2e
```

Além disso:

- manter commits pequenos;
- alterar documentação junto com código;
- não fazer `git add .`;
- não versionar secrets;
- registrar pendências no `PLANO_PROXIMOS_PASSOS.md`;
- validar visualmente se tocar árvore, CSS, painel, modal ou exportação.
