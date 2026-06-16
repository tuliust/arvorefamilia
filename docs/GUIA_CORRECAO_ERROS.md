# Guia de correção de erros — Árvore Família

> Última revisão: 2026-06-16
> Local canônico: `docs/GUIA_CORRECAO_ERROS.md`
> Projeto: `tuliust/arvorefamilia`
> Baseline revisada: `main` após os ajustes do onboarding condicional e revisão final.
> Status: troubleshooting alinhado às duas views oficiais, ao onboarding condicional e à revisão final editável.

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
