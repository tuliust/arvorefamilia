# Inventário técnico — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/INVENTARIO_TECNICO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Baseline revisada: `main` em `833108f`  
> Status: inventário técnico atualizado após refatoração das rotas, painel, CSS e higiene do repositório.

---

## 1. Objetivo

Este inventário registra os principais arquivos, contratos e dependências técnicas do projeto no estado atual da `main`.

Use este documento para:

- revisar impacto antes de refatorações;
- identificar código vigente, legado ativo e candidatos a remoção;
- evitar remoções inseguras;
- orientar novos prompts, commits e QA;
- manter documentação e código sincronizados.

Classificações:

| Categoria | Definição |
|---|---|
| Vigente | Usado pelo produto atual. |
| Vigente com dívida | Necessário, mas concentrado, duplicado, mal nomeado ou difícil de manter. |
| Legado ativo | Antigo, mas ainda usado por dependência, contrato, compatibilidade ou CSS. |
| Histórico | Pode permanecer apenas em documentação histórica. |
| Removido | Não existe mais no código versionado ou foi removido da frente atual. |
| Candidato a refatoração | Usado, mas deve ser simplificado antes de futuras limpezas. |
| Risco de regressão | Pode quebrar fluxo crítico se alterado sem teste. |

---

## 2. Rotas

### 2.1 Rotas da árvore

| Rota | Componente/guard | Categoria | Ação |
|---|---|---|---|
| `/` | `TreeAccessRoute` + redirect para `/mapa-familiar` | Vigente | Preservar query string. |
| `/mapa-familiar` | `TreeHomeShell` → `Home` | Vigente | View principal/default. |
| `/mapa-familiar-horizontal` | `TreeHomeShell` → `Home` | Vigente | View horizontal/genealógica. |
| `/busca` | `TreeAccessRoute` → `BuscaResultados` | Vigente | Preservar. |
| `/minha-arvore` | Sem rota ativa | Histórico/removida | Não restaurar. |
| `/genealogia` | Sem rota ativa | Histórico/removida | Não restaurar. |
| `/visao-completa` | Sem rota ativa | Histórico/removida | Não restaurar. |

### 2.2 Rotas de membro

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
| `/forum/*` | Fórum | `MemberRoute` | Vigente |

### 2.3 Rotas públicas e admin

| Rota | Categoria |
|---|---|
| `/entrar` | Pública vigente |
| `/termos` | Pública vigente |
| `/privacidade` | Pública vigente |
| `/admin/login` | Pública/admin |
| `/admin/*` | Protegida por `ProtectedRoute` |

---

## 3. Arquivos centrais de roteamento e navegação

| Arquivo | Função | Categoria | Observação |
|---|---|---|---|
| `src/app/routes.tsx` | Define rotas, guards, lazy loading e fallback de chunks | Vigente crítico | Não reintroduzir views antigas. |
| `src/app/components/FamilyTree/treeViewMode.ts` | Contrato de views da árvore | Vigente crítico | Deve conter só dois modos. |
| `src/app/constants/favoritePages.ts` | Catálogo de páginas favoritáveis | Vigente | Inclui as duas views oficiais; aliases antigos apenas como keywords. |
| `src/app/services/globalSearchService.ts` | Busca global de páginas e pessoas | Vigente | Inclui as duas views oficiais; aliases antigos apontam para rotas atuais. |
| `src/app/components/layout/UserProfileMenu.tsx` | Menu do usuário | Vigente | Deve apontar para rotas atuais. |
| `src/app/components/layout/MemberPageHeader.tsx` | Header de páginas internas | Vigente | Deve usar `/mapa-familiar` como home da árvore. |
| `src/app/pages/PersonProfile.tsx` | Perfil e retorno via `?voltar=` | Vigente crítico | Retornos seguros incluem horizontal. |

---

## 4. Shell da árvore

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/Home.tsx` | Orquestra carregamento da árvore, filtros, pessoa central, painel, modais, exportação e navegação | Vigente com dívida alta |
| `src/app/pages/home/HomeTreeSection.tsx` | Decide renderização da view ativa por modo e breakpoint | Vigente crítico |
| `src/app/pages/home/HomeHeader.tsx` | Header da Home pós-login | Vigente |
| `src/app/pages/home/HomeMobileNav.tsx` | Bottom/mobile nav e acesso ao painel mobile | Vigente crítico no mobile |
| `src/app/pages/home/SidebarPanelTabs.tsx` | Controles superiores, alternância, paletas, exportação, destaque e filtros diretos | Vigente com dívida de nome |
| `src/app/pages/home/DirectRelationKpiGrid.tsx` | KPIs/filtros de relações diretas | Vigente |
| `src/app/pages/home/DirectRelativeFilterGrid.tsx` | Filtros de grupos diretos | Vigente |
| `src/app/pages/home/LifeStatusKpiGrid.tsx` | Filtros por status de vida/pets | Vigente |

Dívida principal:

```txt
Home.tsx concentra responsabilidades demais.
SidebarPanelTabs.tsx mantém nome histórico, embora não use mais tabs.
```

Refatorações futuras devem extrair estado e ações por domínio, não reescrever tudo em um único commit.

---

## 5. Views oficiais da árvore

| Arquivo | Uso | Categoria | Risco |
|---|---|---|---|
| `DesktopFamilyMapView.tsx` | `/mapa-familiar` desktop/tablet | Vigente | Alto |
| `MobileFamilyTreeView.tsx` | `/mapa-familiar` mobile | Vigente | Alto |
| `DesktopFamilyHorizontalMapView.tsx` | `/mapa-familiar-horizontal` desktop/tablet | Vigente | Alto |
| `MobileFamilyHorizontalMapView.tsx` | `/mapa-familiar-horizontal` mobile | Vigente | Alto |
| `FamilyTreeVisualCards.tsx` | Cards compartilhados | Vigente | Alto |
| `TreeAreaSelectionOverlay.tsx` | Exportação por área | Vigente | Alto |
| `TreeExportLoadingOverlay.tsx` | Loading de exportação | Vigente | Médio |

---

## 6. Stack legado ativo da árvore

| Arquivo | Situação | Ação recomendada |
|---|---|---|
| `FamilyTree.tsx` | Renderer legado não montado como view pública principal | Preservar até projeto de remoção ReactFlow. |
| `PersonNode.tsx` | Nó ReactFlow legado | Remover apenas no lote ReactFlow. |
| `MarriageNode.tsx` | Nó ReactFlow legado e tipos úteis | Separar tipos antes de remover. |
| `GenealogySpouseEdge.tsx` | Edge ReactFlow legado | Remover junto do lote ReactFlow. |
| `nodeTypes.ts` / `edgeTypes.ts` | Configuração ReactFlow | Investigar no lote ReactFlow. |
| `buildTreeGraph.ts` | Grafo/layout auxiliar ainda usado | Preservar até análise específica. |
| `layouts/directFamilyDistributedLayout.ts` | Helper usado pelas views oficiais | Preservar. |
| `layouts/genealogyColumnsLayout.ts` | Dependência da horizontal | Preservar. |

Contrato já extraído:

```txt
src/app/components/FamilyTree/actions.ts
```

---

## 7. Serviços principais

| Arquivo | Categoria | Observação |
|---|---|---|
| `dataService.ts` | Vigente crítico | CRUD de pessoas/relacionamentos, logs, eventos da árvore. |
| `memberProfileService.ts` | Vigente crítico | Perfis, vínculos usuário-pessoa, primeiro acesso. |
| `treeDataCache.ts` | Vigente | Cache/evento global da árvore. |
| `relationshipCacheService.ts` | Vigente | Limpeza de cache de parentesco. |
| `favoritesService.ts` | Vigente | Persistência de favoritos. |
| `globalSearchService.ts` | Vigente | Busca global com rotas atuais. |
| `userEngagementService.ts` | Vigente com legado | Notificações/preferências e compatibilidade local. |
| `relationshipResolverService.ts` | Removido | Resolver legado/parcial removido. |

---

## 8. Componentes removidos na frente atual

| Arquivo | Status |
|---|---|
| `src/app/pages/home/GenealogyMobileStageTabs.tsx` | Removido |
| `src/app/pages/home/GenealogyFilterGrid.tsx` | Removido |
| `src/app/pages/CentralNotificacoes.tsx` | Removido |
| `src/app/components/FamilyTree/ViewModeToggle.tsx` | Removido |
| `src/app/components/figma/ImageWithFallback.tsx` | Removido |
| `src/app/services/relationshipResolverService.ts` | Removido |

Regra:

```txt
Não restaurar arquivo removido sem nova busca de uso, justificativa e validação.
```

---

## 9. CSS

| Arquivo | Categoria | Observação |
|---|---|---|
| `home-sidebar-unified.css` | Vigente | Painel simplificado e modal mobile. |
| `mobile-tree-controls.css` | Legado ativo | Renderer ReactFlow mobile; preservar até remoção do stack. |
| `family-map-qa.css` | Vigente | Ajustes do mapa vertical e transparência da horizontal. |
| `family-map-horizontal.css` | Vigente | Horizontal desktop/mobile, paletas e exportação. |
| `family-tree-mobile.css` | Vigente/legado misto | Mobile vertical/horizontal e CSS ReactFlow legado. |
| `mobile-tree-lines.css` | Legado ativo | Regras ReactFlow diretas; preservar. |
| `tree-view-desktop-polish.css` | Vigente | Ajustes desktop transversais sem resíduos de view antiga. |
| `mobile-edit-profile.css` | Vigente | Escopado a `/minha-arvore/editar`. |

Regras:

- não remover CSS por nome antigo sem verificar escopo;
- `minha-arvore` pode existir em CSS da rota `/minha-arvore/editar`;
- `genealogia` pode existir como conceito visual, não rota;
- CSS global de SVG deve ser evitado.

---

## 10. Testes

| Arquivo | Categoria | Observação |
|---|---|---|
| `tests/e2e/app-smoke.spec.ts` | Vigente | Protege rotas oficiais e bloqueia retorno das antigas. |
| `relationshipDegree.test.ts` | Vigente | Relacionamento/grau. |
| `relationshipDegreeDisplay.test.ts` | Vigente | Exibição textual de parentesco. |
| `mobileFamilyTreeModel.test.ts` | Vigente | Modelo mobile. |

Comandos:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

---

## 11. Configuração e higiene

| Arquivo | Categoria | Observação |
|---|---|---|
| `.gitignore` | Vigente | Ignora envs, testes, backups e artefatos locais. |
| `package.json` | Vigente | Scripts de build/test/e2e presentes. |
| `vite.config.ts` | Vigente | Vite, React, Tailwind, chunks manuais e Vitest. |
| `playwright.config.ts` | Vigente | Build + preview antes dos E2E. |
| `tsconfig.json` | Inexistente | Não criar sem necessidade; o projeto builda sem ele. |

Ignorados:

```txt
node_modules/
dist/
.vite/
.env
.env.local
.env.*.local
.env*.save
coverage/
test-results/
playwright-report/
backups/
```

---

## 12. Documentação

Canônicos atualizados:

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Documentos históricos ou mistos devem ser revisados antes de virar referência.

---

## 13. Próximas frentes técnicas possíveis

1. Renomear `SidebarPanelTabs.tsx` para nome neutro.
2. Extrair responsabilidades de `Home.tsx`.
3. Auditar stack ReactFlow/Dagre.
4. Criar CI GitHub Actions.
5. Ampliar E2E autenticado com dados reais ou fixtures.
6. Auditar dependências e `pnpm.overrides`.
