# Inventário técnico — Árvore Família

> Local canônico sugerido: `docs/INVENTARIO_TECNICO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: inventário técnico da baseline atual  
> Escopo: rotas, componentes, services, hooks, tipos, CSS, testes e documentação

---

## 1. Objetivo

Este inventário registra os principais arquivos, contratos e dependências técnicas do projeto no estado atual da `main`.

Use este documento para:

- revisar impacto antes de refatorações;
- identificar código vigente, legado ativo e candidatos a remoção;
- evitar remoções inseguras;
- orientar novos prompts, commits e QA;
- manter documentação e código sincronizados.

Classificações usadas:

| Categoria | Definição |
|---|---|
| Vigente | Usado pelo produto atual. |
| Vigente com dívida | Necessário, mas concentrado, duplicado, mal nomeado ou difícil de manter. |
| Legado ativo | Antigo, mas ainda usado por dependência, contrato, compatibilidade ou CSS. |
| Histórico | Pode permanecer apenas em `docs/historico/` ou registros claramente legados. |
| Candidato a remoção | Sem consumidor aparente, removível após busca final e build. |
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

### 2.3 Rotas públicas

| Rota | Componente | Categoria |
|---|---|---|
| `/entrar` | `Entrar` | Vigente |
| `/termos` | `Termos` | Vigente |
| `/privacidade` | `Privacidade` | Vigente |
| `/admin/login` | `AdminLogin` | Pública/legada |

### 2.4 Rotas administrativas

| Rota | Guard | Categoria |
|---|---|---|
| `/admin` | `ProtectedRoute` | Vigente |
| `/admin/dashboard` | `ProtectedRoute` | Alias vigente |
| `/admin/home` | `ProtectedRoute` | Vigente |
| `/admin/pessoas` | `ProtectedRoute` | Vigente |
| `/admin/pessoas/nova` | `ProtectedRoute` | Vigente |
| `/admin/pessoas/:id` | `ProtectedRoute` | Alias vigente |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` | Vigente |
| `/admin/relacionamentos` | `ProtectedRoute` | Vigente |
| `/admin/relacionamentos/novo` | `ProtectedRoute` | Vigente |
| `/admin/importacao` | `ProtectedRoute` | Vigente |
| `/admin/migrar-dados` | `ProtectedRoute` | Sensível |
| `/admin/diagnostico` | `ProtectedRoute` | Vigente com legado possível |
| `/admin/integridade` | `ProtectedRoute` | Vigente |
| `/admin/atividades` | `ProtectedRoute` | Vigente |
| `/admin/notificacoes` | `ProtectedRoute` | Vigente |
| `/admin/solicitacoes-vinculos` | `ProtectedRoute` | Vigente |

---

## 3. Arquivos centrais de roteamento e navegação

| Arquivo | Função | Categoria | Observação |
|---|---|---|---|
| `src/app/routes.tsx` | Define rotas, guards, lazy loading e fallback de chunks | Vigente crítico | Não reintroduzir views antigas. |
| `src/app/components/FamilyTree/treeViewMode.ts` | Contrato de views da árvore | Vigente crítico | Deve conter só dois modos. |
| `src/app/constants/favoritePages.ts` | Catálogo de páginas favoritáveis | Vigente | Inclui as duas views oficiais. |
| `src/app/services/globalSearchService.ts` | Busca global de páginas e pessoas | Vigente | Inclui as duas views oficiais. |
| `src/app/components/layout/UserProfileMenu.tsx` | Menu do usuário | Vigente | Deve apontar para rotas atuais. |
| `src/app/components/layout/MemberPageHeader.tsx` | Header de páginas internas | Vigente | Deve usar `/mapa-familiar` como home da árvore. |
| `src/app/pages/PersonProfile.tsx` | Perfil e retorno via `?voltar=` | Vigente crítico | Retornos seguros devem incluir horizontal. |

---

## 4. Shell da árvore

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/Home.tsx` | Orquestra carregamento da árvore, filtros, pessoa central, painel, modais, exportação e navegação | Vigente com dívida alta |
| `src/app/pages/home/HomeTreeSection.tsx` | Decide renderização da view ativa por modo e breakpoint | Vigente crítico |
| `src/app/pages/home/HomeHeader.tsx` | Header da Home pós-login | Vigente |
| `src/app/pages/home/HomeMobileNav.tsx` | Bottom/mobile nav e acesso ao painel mobile | Vigente crítico no mobile |
| `src/app/pages/home/SidebarPanelTabs.tsx` | Controles superiores, alternância vertical/horizontal, paletas, exportação, destaque e abas do painel | Vigente com dívida |
| `src/app/pages/home/SidebarInfoPanel.tsx` | Conteúdo de ações/info do painel | Candidato a revisão na próxima frente |
| `src/app/pages/home/DirectRelationKpiGrid.tsx` | Filtros/grupos diretos | Vigente |
| `src/app/pages/home/LifeStatusKpiGrid.tsx` | Filtros por status de vida/pets | Vigente |
| `src/app/pages/home/GenealogyFilterGrid.tsx` | Grid de filtros genealógicos | Candidato a remoção/investigação |

Dívida principal:

```txt
Home.tsx concentra responsabilidades demais.
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
| `FamilyTree.tsx` | Renderer legado não montado como view pública, mas contém/exporta `FamilyTreeActions` | Extrair contrato antes de remover. |
| `PersonNode.tsx` | Nó ReactFlow legado | Remover apenas no projeto de desativação do stack ReactFlow. |
| `MarriageNode.tsx` | Nó ReactFlow legado e tipos úteis | Separar tipos antes de remover. |
| `GenealogySpouseEdge.tsx` | Edge ReactFlow legado | Remover junto do lote ReactFlow. |
| `nodeTypes.ts` / `edgeTypes.ts`, se existentes | Configuração ReactFlow | Investigar no lote ReactFlow. |
| `buildTreeGraph.ts` | Grafo/layout auxiliar ainda usado | Preservar até análise específica. |
| `layouts/directFamilyDistributedLayout.ts` | Helper usado pelas views oficiais | Preservar. |
| `layouts/genealogyColumnsLayout.ts` | Dependência da horizontal | Preservar. |

Recomendação prioritária:

```txt
Mover FamilyTreeActions para um arquivo neutro, por exemplo:
src/app/components/FamilyTree/actions.ts
```

---

## 7. Services principais

| Arquivo | Função | Categoria | Ação |
|---|---|---|---|
| `dataService.ts` | CRUD central de pessoas, relacionamentos e dados | Vigente com dívida | Dividir por domínio futuramente. |
| `memberProfileService.ts` | Vínculo usuário-pessoa | Vigente crítico | Cobrir com testes. |
| `treeDataCache.ts` | Cache e invalidação da árvore | Vigente crítico | Documentar contrato. |
| `favoritesService.ts` | Favoritos | Vigente | Preservar. |
| `globalSearchService.ts` | Busca global | Vigente | Manter sincronizado com favoritos. |
| `permissionService.ts` | Permissões/admin | Vigente crítico | Não substituir por UI. |
| `personInsightsService.ts` | Insights/IA por pessoa | Vigente | Preservar. |
| `forumService.ts` | Fórum | Vigente | Preservar. |
| `notification*` | Notificações | Vigente | Testes de integração futuros. |
| `googleCalendarService.ts` | Integração Google Calendar | Vigente/opcional | Preservar. |
| `relationshipResolverService.ts` | Sem consumidor aparente no diagnóstico | Candidato a remoção | Remover em commit próprio após busca final. |
| `userEngagementService.ts` | Compatibilidade local/legado | Legado ativo | Migrar consumidores antes de remover. |

---

## 8. Hooks e utils relevantes

| Arquivo | Função | Categoria |
|---|---|---|
| `components/FamilyTree/hooks/useIsMobile.ts` | Breakpoint da árvore | Vigente com possível dívida |
| `components/FamilyTree/utils/treeExport.ts` | Exportação PNG/PDF/impressão/área | Vigente crítico |
| `components/FamilyTree/utils/treePreferences.ts` | Preferências e migrações locais | Exceção necessária |
| `utils/relationshipDegree.ts` | Grau de parentesco | Vigente |
| `utils/personFields.ts` | Normalização de campos de pessoa | Vigente |
| `utils/personEntity.ts` | Humanos/pets | Vigente crítico |
| `utils/searchText.ts` | Normalização de busca | Vigente |

---

## 9. Tipos e contratos

| Contrato | Arquivo provável | Categoria | Risco |
|---|---|---|---|
| `Pessoa` | `src/app/types` | Vigente crítico | Muito alto |
| `Relacionamento` | `src/app/types` | Vigente crítico | Muito alto |
| `TreeViewMode` | `treeViewMode.ts` | Vigente crítico | Alto |
| `FamilyTreeActions` | `FamilyTree.tsx` atualmente | Vigente em local legado | Alto |
| `DirectRelativeFilters` | `FamilyTree/types.ts` | Vigente | Alto |
| `GenealogyFilters` | `FamilyTree/types.ts` | Legado ativo/dívida | Médio |
| `MarriageNodeDetails` | `FamilyTree/types.ts` | Vigente | Alto |
| `FavoriteEntityType` | tipos/favoritos | Vigente | Médio |
| `VinculoUsuarioPessoa` | perfis/vínculos | Vigente crítico | Muito alto |
| `NotificationIntent` | notificações | Vigente | Alto |

---

## 10. CSS e estilos

| Arquivo | Categoria | Ação |
|---|---|---|
| `family-map-qa.css` | Vigente | Preservar. |
| `family-map-horizontal.css` | Vigente com possíveis aliases | Remover aliases só após QA. |
| `family-tree-mobile.css` | Compartilhado | Preservar. |
| `mobile-tree-controls.css` | Vigente mobile | Preservar. |
| `home-sidebar-unified.css` | Vigente com dívida do painel | Revisar na frente do painel. |
| `mobile-edit-profile.css` | Vigente para `/minha-arvore/editar` | Preservar. |
| `family-tree-visual-polish.css` | Misto | Separar seletores. |
| `mobile-tree-lines.css` | Ligado ao renderer antigo | Remover só no lote ReactFlow. |
| `tree-view-desktop-polish.css` | Misto | Remover seletores antigos com QA. |

Data attributes críticos:

```txt
data-tree-route-view="mapa-familiar-horizontal"
data-family-map-horizontal-root
data-mobile-family-horizontal-root
data-mobile-family-tree-root
data-family-map-export-root="true"
data-tree-export-ignore="true"
data-tree-export-loading="true"
```

---

## 11. Testes

| Arquivo/área | Status | Ação |
|---|---|---|
| `tests/e2e/app-smoke.spec.ts` | Deve testar rotas atuais | Manter alinhado à baseline. |
| Vitest | Existente | Ampliar cobertura de helpers críticos. |
| Playwright | Existente | Adicionar fluxos autenticados quando houver fixtures. |
| Typecheck separado | Ausente/pendente | Criar script `npm run typecheck`. |
| Lint | Ausente/pendente | Criar script e CI. |
| CI versionado | Ausente no diagnóstico | Criar workflow mínimo. |

---

## 12. Candidatos a remoção em commits próprios

Confirmar com `rg` antes de remover:

```txt
src/app/components/FamilyTree/ViewModeToggle.tsx
src/app/components/FamilyTree/GenealogyMobileStageTabs.tsx
src/app/components/ImageWithFallback.tsx
src/app/services/relationshipResolverService.ts
src/app/pages/CentralNotificacoes.tsx
```

Regras:

- um lote pequeno por commit;
- rodar `npm run build` e `git diff --check`;
- se alterar import, rodar `npm test`;
- se alterar árvore, rodar `npm run test:e2e` e QA visual.

---

## 13. Arquivos sensíveis ou de higiene

| Arquivo/pasta | Risco | Ação |
|---|---|---|
| `.env.local.save` | Pode conter segredo | Auditar sem expor conteúdo; rotacionar se necessário. |
| `backups/FamilyTree.before_debug_bounds...tsx` | Backup versionado | Remover após confirmar irrelevância. |
| Dumps SQL soltos | Risco de dados/sensibilidade | Mover para histórico seguro ou fora do repo. |
| `test-results/` | Artefato local | Não versionar. |
| `dist/` | Build local | Não versionar. |

---

## 14. Dependências e scripts

Revisar em lote futuro:

```txt
package.json
package-lock.json
vite.config.*
playwright.config.*
vitest.config.*
.github/
```

Prioridades:

1. adicionar `typecheck` separado;
2. adicionar lint;
3. criar CI mínimo;
4. auditar dependências sem uso;
5. não remover ReactFlow/Dagre enquanto houver tipos/helpers ativos.

---

## 15. Ordem recomendada de limpeza

1. Baseline documental e E2E.
2. Painel `Filtros | Legendas | Ações`.
3. Extração de `FamilyTreeActions`.
4. Remoção de órfãos claros.
5. Limpeza de CSS por seletor.
6. Arquivamento de docs legados.
7. Auditoria de design system (`components/ui`).
8. Typecheck/lint/CI.
9. Planejamento específico para remover renderer ReactFlow legado.

---

## 16. Regra operacional

Este inventário deve ser atualizado sempre que uma mudança alterar:

- rotas;
- guards;
- contratos da árvore;
- services centrais;
- favoritos;
- busca global;
- exportação;
- componentes oficiais;
- documentação canônica.

