# Inventário técnico — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/INVENTARIO_TECNICO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: inventário técnico atualizado após refatoração de rotas, painel, CSS, mobile, paletas, calendário mobile, cônjuges e debug temporário.

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
| Temporário/debug | Útil para QA, mas não deve ser tratado como produto final. |

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
| `src/app/pages/home/SidebarPanelTabs.tsx` | Controles, alternância, paletas, exportação, destaque e filtros | Vigente com dívida de nome |
| `src/app/pages/home/DirectRelationKpiGrid.tsx` | KPIs/filtros de relações diretas | Vigente |
| `src/app/pages/home/DirectRelativeFilterGrid.tsx` | Filtros de grupos diretos | Vigente |
| `src/app/pages/home/LifeStatusKpiGrid.tsx` | Filtros por status de vida/pets | Vigente |

Dívida principal:

```txt
Home.tsx concentra responsabilidades demais.
SidebarPanelTabs.tsx mantém nome histórico, embora não use mais tabs.
```

Refatorações futuras devem extrair estado e ações por domínio, não reescrever tudo em um único commit.

### 4.1 Estados/contratos em `Home.tsx`

| Estado/contrato | Categoria | Observação |
|---|---|---|
| `mobileGroupsOpen` | Vigente mobile | Controla grupos sob demanda no modal mobile. |
| `legendOpen` | Vigente com nome histórico | Controla modal mobile de controles; não representa aba de legenda. |
| `renderedDirectRelationCounts` | Vigente | Contagens efetivas vindas da view. |
| `treeLayoutRevision` | Vigente | Força recalculo/re-render de layout quando necessário. |
| `debugViewPersonId` | Temporário/debug | Usado para `Visualizar como...`, se implementado. |

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

### 5.1 Contratos de títulos

| View | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` |

### 5.2 Contratos mobile

| View mobile | Contrato |
|---|---|
| `MobileFamilyTreeView` | Paterno/Central/Materno; paleta herdada do desktop; conectores alinhados ao desktop; cards sem microcopy de data ausente. |
| `MobileFamilyHorizontalMapView` | Uma geração por tela; botões `Ger X`; swipe; scroll vertical até cards/conectores; sem scroll horizontal manual; sem fallback azul fora da paleta visual. |

### 5.3 Cônjuges e núcleos conjugais

| Área | Contrato |
|---|---|
| Vertical desktop | Suporta cônjuge principal e núcleos conjugais adicionais da pessoa central. |
| Vertical desktop | Filhos são agrupados pelo outro pai/mãe quando houver relacionamento explícito. |
| Horizontal desktop | Cônjuges da Geração 4/Pais devem aparecer quando filtro `Cônjuges` está ativo. |
| Horizontal mobile | Deve seguir a estrutura/recorte da horizontal desktop. |

---

## 6. Paletas, cards e avatares

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/components/FamilyTree/treeColorPalettes.ts` | Define paletas `white`, `visual`, `orange`, `brown` | Vigente crítico |
| `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` | Cards, avatares, ícones e status | Vigente crítico |
| `src/styles/family-map-qa.css` | Estilo da vertical e tokens | Vigente |
| `src/styles/family-map-horizontal.css` | Estilo da horizontal e tokens | Vigente |
| `src/styles/family-map-mobile-palettes.css` | Paletas mobile da árvore vertical e horizontal | Vigente crítico |
| `src/styles/tree-panel-palette-cards.css` | Cards do painel desktop com paleta/gradiente da árvore | Vigente |
| `src/styles/home-sidebar-unified.css` | Painel, modal mobile e ajustes globais da Home | Vigente |

Contrato de avatar:

```txt
foto real -> foto_principal_url
pessoa sem foto -> User
pet -> PawPrint
```

Contrato de paleta:

```txt
Desktop é referência. Mobile herda o contrato visual do desktop.
```

---

## 7. Calendário familiar

| Arquivo | Função | Categoria |
|---|---|---|
| `src/app/pages/CalendarioFamiliar.tsx` | Página do calendário familiar | Vigente |
| `src/styles/calendar-mobile-category-buttons.css` | Layout mobile dos botões de categorias | Vigente crítico no mobile |

Contrato dos botões mobile:

```txt
5 botões em uma linha
bolinha colorida acima do título
título em uma linha
sem overflow horizontal
```

Categorias:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

---

## 8. Stack legado ativo da árvore

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

Contrato já extraído ou recomendado:

```txt
src/app/components/FamilyTree/actions.ts
```

---

## 9. Serviços principais

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

## 10. Componentes removidos na frente atual

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

## 11. CSS

| Arquivo | Categoria | Observação |
|---|---|---|
| `home-sidebar-unified.css` | Vigente | Painel simplificado, modal mobile, filtros e grupos. |
| `mobile-tree-controls.css` | Legado ativo | Renderer ReactFlow mobile; preservar até remoção do stack. |
| `family-map-qa.css` | Vigente | Ajustes do mapa vertical, tokens e transparência da horizontal. |
| `family-map-horizontal.css` | Vigente | Horizontal desktop/mobile, paletas e exportação. |
| `family-map-mobile-palettes.css` | Vigente crítico | Corrige paletas mobile vertical/horizontal e bordas de grupos. |
| `tree-panel-palette-cards.css` | Vigente | Faz painel desktop seguir gradiente/paleta da árvore. |
| `calendar-mobile-category-buttons.css` | Vigente | Botões mobile de categorias do calendário. |
| `family-tree-mobile.css` | Vigente/legado misto | Mobile vertical/horizontal e CSS ReactFlow legado. |
| `mobile-tree-lines.css` | Legado ativo | Regras ReactFlow diretas; preservar. |
| `tree-view-desktop-polish.css` | Vigente | Ajustes desktop transversais sem resíduos de view antiga. |
| `mobile-edit-profile.css` | Vigente | Escopado a `/minha-arvore/editar`. |

Regras:

- não remover CSS por nome antigo sem verificar escopo;
- `minha-arvore` pode existir em CSS da rota `/minha-arvore/editar`;
- `genealogia` pode existir como conceito visual, não rota;
- CSS global de SVG deve ser evitado;
- mobile de árvore não deve usar cores hardcoded como fonte da paleta;
- arquivos importados por último podem estar vencendo conflitos de Tailwind ou inline style; revisar antes de reordenar imports.

---

## 12. Data attributes críticos

| Attribute | Uso |
|---|---|
| `data-tree-route-view` | Escopo de rota/view. |
| `data-family-map-horizontal-root` | Root da horizontal desktop. |
| `data-family-map-horizontal-mobile-root` | Root da horizontal mobile. |
| `data-mobile-family-tree-root` | Root da vertical mobile. |
| `data-family-map-export-root="true"` | Root exportável. |
| `data-tree-export-ignore="true"` | Elementos ignorados na exportação. |
| `data-tree-selection-overlay="true"` | Overlay de seleção de área. |
| `data-tree-export-loading="true"` | Overlay de loading. |
| `data-tree-debug-viewer="true"` | Debug `Visualizar como...`. |
| `data-family-map-color-key` | Chave visual de paleta dos cards. |
| `data-family-map-mobile-card="true"` | Cards mobile da vertical. |
| `data-family-map-avatar="true"` | Avatar/foto/ícone do card. |
| `data-family-map-connectors="true"` | Conectores SVG/escopados. |
| `data-tree-panel-card="true"` | Cards do painel desktop. |
| `data-tree-panel-filter-key` | Filtros de status/tipo no painel. |

---

## 13. Debug temporário

| Elemento | Local | Categoria | Ação |
|---|---|---|---|
| `Visualizar como...` | `Home.tsx` | Temporário/debug | Decidir se remove, protege por flag ou restringe a admin. |
| `data-tree-debug-viewer="true"` | DOM do debug | Temporário/debug | Deve ser ignorado pela exportação. |
| `debugViewPersonId` | Estado em memória | Temporário/debug | Não persistir dados reais. |

---

## 14. Testes

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

QA manual obrigatório para:

```txt
/mapa-familiar desktop
/mapa-familiar mobile
/mapa-familiar-horizontal desktop
/mapa-familiar-horizontal mobile
/calendario-familiar mobile
paletas branca/azul/laranja/marrom
modal mobile
exportação
debug Visualizar como...
```

---

## 15. Configuração e higiene

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

## 16. Documentação

Canônicos prioritários:

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
docs/DECISOES_ARQUITETURAIS.md
```

Funcionais que devem ficar sincronizados com este inventário:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

Regra:

```txt
Se o código mudar contrato visual ou funcional, atualizar docs no mesmo lote ou registrar pendência explícita no PLANO_PROXIMOS_PASSOS.
```

---

## 17. Riscos técnicos principais

| Risco | Causa provável | Mitigação |
|---|---|---|
| Paleta mobile divergente | CSS importado antes de override ou seletor de root errado | Testar roots mobile e ordem de imports. |
| Fallback azul indevido | Card sem `data-family-map-color-key` | Garantir fallback por paleta. |
| Exportação capturando UI | Falta de `data-tree-export-ignore` | Revisar header, painel, bottom nav, modal e debug. |
| Cônjuges ausentes | Grupo fora da lista de inclusão | Testar `pais`, tios, primos, sobrinhos, filhos e netos. |
| Quebra de calendário mobile | Rótulos longos em 5 colunas | Validar 320px/375px/390px/430px. |
| Remoção insegura de legado | Arquivo antigo ainda usado por helper/tipo | Buscar imports antes de remover. |
| CSS global agressivo | Seletor `svg path` genérico | Escopar por data attribute. |

---

## 18. Critério para refatoração segura

Refatorar apenas quando:

```txt
[ ] Escopo de arquivo e rota estiver claro.
[ ] Contrato visual estiver documentado.
[ ] Não houver mudança de dados escondida.
[ ] Build passar.
[ ] Testes relevantes passarem.
[ ] QA manual for possível ou pendência for registrada.
[ ] Documentação for atualizada no mesmo lote.
```
