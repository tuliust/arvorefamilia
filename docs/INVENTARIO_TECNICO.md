# Inventário técnico — Árvore Família

> Última revisão: 2026-06-22
> Local canônico: `docs/INVENTARIO_TECNICO.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: inventário técnico
> Status: atualizado com a auditoria da branch `feature/questionario-ia-vinculos-pets`, mapas mobile recentes, Home debug viewer, riscos de IA e pendências de revisão/arquivos históricos.

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
| `/meus-dados` | `MeusDados` | `MemberRoute` | Vigente crítico |
| `/meus-vinculos` | `MeusVinculos` | `MemberRoute` | Vigente crítico |
| `/arquivos-historicos` | `ArquivosHistoricosPage` | `MemberRoute` | Vigente crítico |
| `/preferencias` | `PreferenciasPage` | `MemberRoute` | Vigente crítico |
| `/revisao-dados` | `RevisaoDados` | `MemberRoute` | Vigente crítico |
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
| `DesktopFamilyHorizontalMapFilteredView.tsx` | `/mapa-familiar-horizontal` desktop/tablet | Vigente crítico | Alto |
| `MobileFamilyHorizontalMapFilteredView.tsx` | `/mapa-familiar-horizontal` mobile | Vigente crítico | Alto |
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

## 8.1 Onboarding do membro

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/MeusDados.tsx` | Etapa 1: dados pessoais, contato, endereço, redes sociais, Mini Bio, Curiosidades e assistente de IA. | Vigente crítico |
| `src/app/pages/MeusVinculos.tsx` | Etapa 2: orquestra revisão de vínculos, busca de pessoa existente, criação manual, remoção, solicitação de controle e finalização. | Vigente crítico |
| `src/app/pages/ArquivosHistoricosPage.tsx` | Etapa 3: arquivos históricos da pessoa vinculada. | Vigente crítico |
| `src/app/pages/PreferenciasPage.tsx` | Etapa 4: preferências de notificação e permissões de exibição. | Vigente crítico |
| `src/app/pages/RevisaoDados.tsx` | Etapa 5: síntese final e confirmação do primeiro acesso. | Vigente crítico |
| `src/app/components/member/MemberOnboardingSteps.tsx` | Indicador visual/navegação entre as cinco etapas. | Vigente crítico |


Arquivos da feature `/meus-vinculos`:

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/meus-vinculos/RelationshipOverview.tsx` | Card superior `Familiares de [Primeiro Nome]` e cards-resumo com âncoras. | Vigente crítico |
| `src/app/pages/meus-vinculos/RelationshipGroupPanel.tsx` | Seções de Pais, Filhos, Cônjuges e Irmãos. | Vigente crítico |
| `src/app/pages/meus-vinculos/RelativeCard.tsx` | Card individual de familiar, badges e ações compactas. | Vigente crítico |
| `src/app/pages/meus-vinculos/ProfileControlRequestDialog.tsx` | Modal de solicitação de controle de perfil. | Vigente crítico |
| `src/app/pages/meus-vinculos/meusVinculosUtils.ts` | Helpers puros de status, pluralização, labels e vínculo. | Vigente crítico |
| `src/app/pages/meus-vinculos/types.ts` | Tipos compartilhados da feature. | Vigente crítico |

Arquivos relacionados à IA de Mini Bio/Curiosidades:

| Arquivo | Função | Categoria |
|---|---|---|
| `api/ai.ts` | Endpoint serverless usado para perguntas da Home e geração de textos de perfil. | Vigente crítico |
| `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` | Contrato canônico da geração assistida em `/meus-dados`. | Vigente |

Contratos:

```txt
Arquivos Históricos não devem voltar a ser editados em /revisao-dados.
Notificações e permissões não devem voltar a ser editadas em /revisao-dados.
A revisão final pode exibir resumo, não edição completa.
```

---

## 9. Services principais

| Arquivo | Categoria | Observação |
|---|---|---|
| `dataService.ts` | Vigente crítico | Pessoas, relacionamentos e eventos. |
| `memberProfileService.ts` | Vigente crítico | Vínculos, perfis de membro, busca de pessoa para vínculo e consulta de pessoas com usuário vinculado. |
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

---

## 17. Sincronização técnica — 2026-06-22

### 17.1 Scripts mobile carregados no `index.html`

Arquivos vigentes carregados diretamente:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/main.tsx
src/firstLoginMobileTutorialFixes.ts
src/mobileCuriositiesNavigationFix.ts
src/mobileTreePanelViewportFix.ts
src/staticMobileFamilyTreeScreens.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapUncleSwipeNavigationGuard.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileVisualizationPanelFamilyStatsFix.ts
src/mobileFamilyMapZoomOverviewVisualFix.ts
src/mobileFamilyMapDescendantsStabilityLock.ts
src/mobileFamilyMapExtendedSpouseCards.ts
src/mobileFamilyMapFilterButtonsBehaviorFix.ts
src/mobileFamilyMapFullOverview.ts
src/mobileFamilyMapFullOverviewMosaicFix.ts
```

Categoria: **Vigente crítico**. Remoção, reorder ou substituição exige QA visual mobile.

### 17.2 Horizontal filtrada

A renderização atual da horizontal usa:

```txt
DesktopFamilyHorizontalMapFilteredView
MobileFamilyHorizontalMapFilteredView
```

Não documentar `DesktopFamilyHorizontalMapView`/`MobileFamilyHorizontalMapView` como componentes efetivamente renderizados pelo shell atual sem validar imports e uso.

### 17.3 Home e debug viewer

`Home.tsx` permanece como **Vigente com dívida alta**. Além de dados, filtros, exportação e modais, ele ainda controla:

```txt
debugViewPersonId
showViewAsSelector
handleDebugViewPersonChange
handleDesktopViewAsPersonChange
```

Categoria do recurso: **Temporário/debug ou decisão pendente**. Risco alto se alterado junto com mapa mobile.

### 17.4 IA da Home

`homeAiContext.ts` deve ser inventariado como **Vigente com dívida de privacidade/inferência**.

Riscos técnicos:

| Risco | Evidência | Tratamento |
|---|---|---|
| Inferência por nomes/sufixos para pai/mãe | `inferParentLabelByName` | Remover ou restringir em frente própria; priorizar `relacionamentos` explícitos. |
| Dados de contato no contexto | `telefone` e `redeSocial` em `selectedCuriosityPerson` | Filtrar por permissões antes de enviar ao endpoint. |
| Uso de IDs no contexto | IDs entram no JSON para cálculo | Instruir IA a não exibir IDs; idealmente reduzir contexto. |

### 17.5 Onboarding e revisão

Na branch auditada:

| Área | Estado |
|---|---|
| `/meus-vinculos` | Já recebeu separação visual de pets, regras de cônjuges e badges ajustados no Prompt 4. |
| `/revisao-dados` | Ainda precisa separar pets de filhos; `relationshipSummary` usa `relationships.filhos` sem filtro. |
| `/arquivos-historicos` | Ainda exige arquivo na UI atual; evolução para fatos sem arquivo depende de alteração/migration. |
| `arquivosHistoricosService.ts` | Possui fallback para ausência de `participante_ids`; não tratar participantes como obrigatório sem migration e QA. |
| `MemberOnboardingSteps` | Pode permitir clique direto em `/preferencias`; pessoa falecida deve continuar sendo corrigida pela própria página de preferências/guard. |

## Atualização 2026-06-22 — Arquivos impactados no ciclo

### Principais arquivos alterados por frente

- Mapa/painel: `Home.tsx`, `DesktopTreeVisualizationPanel.tsx`, `HomeTreeSection.tsx`, `FirstLoginTutorial.tsx`, `DesktopFamilyMapView.tsx`, `memberProfileService.ts`, `home-sidebar-unified.css`.
- Questionário/IA: `MeusDados.tsx`, `MeusVinculosWithProfileBio.tsx`, `profileQuestionnaireService.ts`, `profileQuestionnaireConfig.ts`, `api/ai.ts`.
- Vínculos: `MeusVinculos.tsx`, `RelationshipGroupPanel.tsx`, `RelationshipOverview.tsx`, `RelativeCard.tsx`, `meusVinculosUtils.ts`, `dataService.ts`, `relationshipChangeRequestService.ts`.
- Fatos/timeline: `ArquivosHistoricos.tsx`, `ArquivosHistoricosPage.tsx`, `RevisaoDados.tsx`, `arquivosHistoricosService.ts`, `PersonTimeline.tsx`, `buildPersonTimeline.ts`.
- Header/onboarding: `MemberPageHeader.tsx`, páginas de onboarding.
- Migrations: questionário de perfil e fatos sem arquivo.
