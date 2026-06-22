# Guia de correção de erros — Árvore Família

> Última revisão: 2026-06-22
> Local canônico: `docs/GUIA_CORRECAO_ERROS.md`
> Projeto: `tuliust/arvorefamilia`
> Baseline revisada: `main` após os ajustes do onboarding condicional e revisão final.
> Status: revisado para incluir troubleshooting de mobile 3x3, toolbar, fatos históricos, IA e cache pós-deploy.

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
- problema no onboarding do membro;
- comportamento inesperado da árvore.

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
```

Observação:

```txt
O projeto não possui tsconfig.json nesta baseline. Não criar um apenas para resolver erro sem diagnóstico.
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

Interpretação atual:

- essas rotas podem aparecer em teste apenas para garantir que não voltaram como views ativas;
- `/minha-arvore/editar` continua válida e deve ser testada como rota protegida.

Arquivo provável:

```txt
tests/e2e/app-smoke.spec.ts
```

Correção:

- substituir smoke de view da árvore por `/mapa-familiar`;
- manter smoke para `/mapa-familiar-horizontal`;
- manter teste separado para `/minha-arvore/editar`;
- rotas antigas não devem ser documentadas como views ativas.

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

- painel sem barra `Filtros | Legendas | Ações`;
- filtros/grupos/status ficam visíveis diretamente;
- controles superiores e flyouts continuam.

Sintomas:

| Sintoma | Investigar |
|---|---|
| filtros desapareceram | renderização direta no painel, props, filtros por status/grupo. |
| exportação parou | eventos de `SidebarPanelTabs`, refs da view ativa. |
| modal mobile não fecha | `legendOpen`, overlay, `Escape`, scroll lock. |
| painel entra na captura | falta de `data-tree-export-ignore`. |
| abas antigas voltaram | regressão em `SidebarPanelTabs` ou CSS. |

Correção:

- não restaurar `activeSidebarPanel`;
- deixar filtros visíveis diretamente;
- manter Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar e Destacar;
- rodar E2E e QA manual.

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
| colunas vazias aparecem | lógica de colunas visíveis. |
| cônjuges distantes | agrupamento por casal/relacionamento. |
| conectores casal → filhos quebram | cálculo SVG e anchors. |
| horizontal mobile vira vertical | `HomeTreeSection` e breakpoint. |
| fundo deixa de ser transparente | CSS `family-map-horizontal.css` e `family-map-qa.css`. |

Correção:

- não usar `/visao-completa` como fallback;
- validar mobile e desktop;
- preservar root horizontal e data attributes.

---

## 10. Exportação quebrada

Arquivos:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/styles/home-sidebar-unified.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
```

Sintomas:

| Sintoma | Causa provável |
|---|---|
| painel aparece no PNG | falta de `data-tree-export-ignore`. |
| SVG vira quadrado escuro | sanitização/normalização de SVG. |
| PDF corta árvore | escala/canvas/tamanho da captura. |
| impressão abre janela vazia | popup bloqueado ou canvas inválido. |
| área selecionada captura errado | offsets/crop/escala. |

Correção:

- preservar `treeExport.ts`;
- não remover sanitização de cor;
- validar PNG, PDF, print e Área nas duas views.

---

## 11. Busca/favoritos errados

Arquivos:

```txt
src/app/services/globalSearchService.ts
src/app/constants/favoritePages.ts
src/app/services/favoritesService.ts
```

Sintomas:

| Sintoma | Correção |
|---|---|
| busca retorna `/minha-arvore` | trocar destino para `/mapa-familiar` ou remover página. |
| busca retorna `/genealogia` | trocar destino para `/mapa-familiar-horizontal`. |
| favorito abre rota removida | atualizar `favoritePages.ts`. |
| alias antigo não encontra nada | adicionar keyword sem mudar path canônico. |

---

## 12. Arquivo local aparece no Git

Sintoma:

```txt
?? test-results/
?? backups/
?? .env.local.save
```

Correção:

1. confirmar `.gitignore`;
2. se for untracked e ignorável, limpar ou deixar ignorado;
3. se estiver versionado, remover só do índice:

```bash
git rm --cached arquivo
git rm -r --cached pasta
```

Não colar conteúdo de `.env`.

Arquivos que devem ficar ignorados:

```txt
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

## 13. Componente removido é pedido pelo build

Arquivos já removidos:

```txt
GenealogyMobileStageTabs.tsx
GenealogyFilterGrid.tsx
CentralNotificacoes.tsx
ViewModeToggle.tsx
ImageWithFallback.tsx
relationshipResolverService.ts
```

Se o build pedir um deles:

1. identificar quem importou;
2. confirmar se esse fluxo ainda é vigente;
3. remover ou substituir o import;
4. não restaurar arquivo removido como solução rápida;
5. rodar build/testes.

---

## 14. Onboarding do membro com comportamento incorreto

Arquivos prováveis:

```txt
src/app/components/member/MemberOnboardingSteps.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/ArquivosHistoricosPage.tsx
src/app/pages/PreferenciasPage.tsx
src/app/pages/RevisaoDados.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/meus-vinculos/
src/app/services/userEngagementService.ts
```

Sintomas e investigação:

| Sintoma | Investigar |
|---|---|
| pessoa falecida ainda vê contato/endereço/redes | condição de `falecido` em `MeusDados.tsx`. |
| pessoa viva não vê cidade de residência | renderização condicional de residência na Etapa 1. |
| pessoa falecida entra em `/preferencias` | navegação de `ArquivosHistoricosPage`, redirecionamento em `PreferenciasPage` e `hidePreferences`. |
| stepper mostra Preferências para falecido | prop `hidePreferences` em `MemberOnboardingSteps`. |
| notificações ficam ativas para falecido | defaults em `userEngagementService`/payload salvo nas etapas. |
| modal de vínculos mostra botão Buscar | regressão em `MeusVinculos.tsx`. |
| modal mostra box cinza de nenhum resultado | renderização condicional da lista/dropdown. |
| Etapa 3 perde arquivos ao trocar aba | rascunho local em `ArquivosHistoricos.tsx`. |
| Revisão mostra mini bio ao lado do nome | bloco superior de `RevisaoDados.tsx`. |
| Revisão mostra botão Voltar para preferências no rodapé | rodapé antigo de `RevisaoDados.tsx`. |
| Revisão mostra notificações para falecido | condição do box lateral em `RevisaoDados.tsx`. |

Correções esperadas:

- pessoa viva segue `/meus-dados -> /meus-vinculos -> /arquivos-historicos -> /preferencias -> /revisao-dados`;
- pessoa falecida segue `/meus-dados -> /meus-vinculos -> /arquivos-historicos -> /revisao-dados`;
- badges usam `Vivo`, `Viva`, `Falecido`, `Falecida` e `Em análise`;
- botão final fica no topo da revisão;
- botões secundários removidos não reaparecem.

### 14.1 Tela antiga aparece apesar do Git estar atualizado

Sintoma:

```txt
git status limpo
build passa
GitHub atualizado
navegador ainda exibe UI antiga
```

Causa provável:

- cache do Vite;
- bundle antigo em `dist`;
- aba do navegador com cache;
- servidor local ainda rodando versão anterior;
- deploy de produção ainda não finalizado.

Correção local no PowerShell:

```powershell
# parar o servidor local com Ctrl+C
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run dev
```

Depois:

```txt
Ctrl + F5
```

ou abrir janela anônima.

Critério de aceite:

- `git rev-parse --short HEAD` corresponde ao commit esperado;
- `Select-String` encontra o trecho novo no arquivo local;
- a tela recarregada mostra o comportamento novo.


## 15. Checklist final de correção

Antes de commit:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```

Depois de push:

```bash
git log --oneline --decorate -5
```

Critério de aceite:

- erro resolvido;
- rotas antigas não voltaram;
- painel antigo não voltou;
- testes passam;
- docs canônicas atualizadas se o comportamento mudou.

## 20. Mapa mobile 3x3 com regressão

Arquivos prováveis:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx
src/mobileFamilyMap*.ts
src/mobileFamilyTree*.ts
src/staticMobileFamilyTreeScreens.ts
src/styles/family-map-mobile-palettes.css
src/styles/mobile-family-map-branch-connectors-final.css
index.html
```

Sintomas:

| Sintoma | Investigar primeiro |
|---|---|
| `core` volta a mostrar filhos/pets/netos | `mobileFamilyMapCoreConnectorFix.ts`, fonte de descendentes e seletores `data-mobile-family-tree-descendant-*`. |
| `descendants` treme ou some | `mobileFamilyMapStableMobileFix.ts`, `mobileFamilyMapDescendantsStabilityLock.ts`, conflito de `transform`. |
| swipe vai para tela errada | `mobileFamilyMapDirectionalNavigationFix.ts`, estado `data-mobile-family-tree-active-screen`. |
| tios perdem conectores | `mobileFamilyMapCoreConnectorFix.ts`, CSS de branch connectors. |
| Zoom abre tela errada | `mobileFamilyMapZoomOverviewVisualFix.ts`, scripts de overview, tela ativa real. |
| mapa completo vira cards soltos | `mobileFamilyMapFullOverview.ts`, `mobileFamilyMapFullOverviewMosaicFix.ts`. |

Correção segura:

1. não remover scripts em lote;
2. comparar contra baseline mobile;
3. testar em 375px/390px/430px;
4. validar Safari/iOS real quando possível;
5. confirmar que nenhum arquivo de mapa mobile entrou no diff sem intenção.

---

## 21. Toolbar mobile, `+`, Zoom e Exportar

Arquivos prováveis:

```txt
src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
```

Contrato atual:

```txt
Toolbar fixa principal = Formato, Cor, Filtros, Zoom, +
```

Sintomas:

| Sintoma | Interpretação |
|---|---|
| `Exportar` aparece na toolbar fixa principal | regressão de UX; conferir `MobileFamilyMapToolbar.tsx`. |
| `Exportar` aparece em painel/popup auxiliar | pode ser comportamento atual, não bug automático. |
| `Zoom` não abre overview 3x3 | conferir scripts de Zoom da vertical. |
| `Zoom` horizontal abre 3x3 | regressão; horizontal deve abrir overview por gerações. |
| botão `+` trava body | conferir `fullControlsOpen` e cleanup do `overflow`. |

Regra: distinguir toolbar fixa, popovers da toolbar, painel completo do botão `+` e modal legado `SidebarPanelTabs mobileControls`.

---

## 22. Fatos históricos sem arquivo falham

Arquivos prováveis:

```txt
src/app/pages/ArquivosHistoricosPage.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/types/index.ts
supabase/migrations/
docs/operacao/MIGRATIONS_SUPABASE.md
```

Sintomas:

| Sintoma | Causa provável |
|---|---|
| erro de `url` nulo | migration que permite arquivo opcional não aplicada. |
| erro de `storage_path` ou `mime_type` nulo | constraint/not null ainda existe no banco remoto. |
| botão exige upload | validação no componente ainda antiga. |
| registro sem arquivo aparece como imagem quebrada | renderização não diferencia fato textual de arquivo. |
| `participante_ids` falha | coluna ausente/schema cache; fallback do service ou migration precisa ser verificado. |

Correção:

1. confirmar migration aplicada;
2. conferir schema remoto;
3. aguardar/recarregar PostgREST schema cache;
4. não mascarar com string vazia;
5. manter `null` para campos de arquivo ausentes;
6. validar item com arquivo e item sem arquivo.

---

## 23. Pets voltam a aparecer como filhos humanos

Arquivos prováveis:

```txt
src/app/pages/MeusVinculos.tsx
src/app/pages/meus-vinculos/*
src/app/pages/RevisaoDados.tsx
src/app/services/dataService.ts
src/app/utils/personEntity.ts
src/app/types/index.ts
```

Sintomas:

| Sintoma | Correção |
|---|---|
| pet aparece no grupo Filhos | filtrar `humano_ou_pet !== 'Pet'` para filhos humanos. |
| grupo Pets sumiu | separar pets de `relationships.filhos` ou grupo equivalente. |
| card de pet mostra `Alterar mãe/pai` | usar microcopy `Outros tutores`. |
| IA chama pet de filho humano | revisar contexto semântico de IA. |

---

## 24. IA expõe dado privado ou inventa relação

Arquivos prováveis:

```txt
src/app/pages/home/homeAiContext.ts
src/app/pages/home/AiQuestionPanel.tsx
api/ai.ts
docs/funcionalidades/CURIOSIDADES_E_IA.md
docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| resposta usa telefone/rede social | payload de `homeAiContext.ts`. |
| resposta infere pai/mãe por nome | funções de inferência por nome/sufixo. |
| IA inventa fato biográfico | system prompt e contexto enviado. |
| pet vira filho humano | normalização semântica de pets. |

Correção esperada:

- usar dados explícitos ou calculáveis;
- minimizar payload;
- remover dado privado do contexto padrão;
- orientar IA a responder “não há dado suficiente” quando o grafo não sustenta a resposta.

---

## 25. Cache pós-deploy e chunks antigos

Sintomas:

```txt
Failed to fetch dynamically imported module
Expected a JavaScript-or-Wasm module script but the server responded with MIME type text/html
Não foi possível carregar esta página
```

Investigar:

- headers de cache de `/` e `/index.html`;
- fallback SPA respondendo HTML para `/assets/*.js`;
- deployment ativo na Vercel;
- Safari/iOS com HTML antigo;
- rota lazy-loaded recém-alterada.

Correção:

1. abrir em janela anônima;
2. hard refresh;
3. confirmar commit do deployment;
4. conferir headers;
5. garantir `/api/*` antes do fallback SPA;
6. não alterar código funcional para mascarar cache.
