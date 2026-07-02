# Guia de implementações

> Última revisão: 2026-07-01
> Escopo: comportamento implementado na branch `main`, incluindo layout compartilhado mobile dos mapas.
> Status: canônico.

## Rotas e carregamento

- `src/app/routes.tsx` define lazy loading para páginas públicas, de membro, de árvore e administrativas.
- O fallback de rota exibe estado de carregamento.
- Erros de chunk ou asset JS disparam tentativa controlada de reload com chave de sessão.
- `/` redireciona para `/mapa-familiar`.
- `/aprovacoes` e `/admin/aprovacoes` carregam a página administrativa de aprovações.
- Runtime tweaks globais devem ser defensivos, com `requestAnimationFrame`, `try/catch` e observação mínima de mutações para evitar loops.

## Layout compartilhado mobile dos mapas

- `/mapa-familiar` e `/linha-geracional` são filhas de um layout comum em `TreeMapSharedLayout`.
- O layout comum renderiza `HomeHeader`, `<Outlet />` e `HomeMobileNav` no mobile, mantendo header, toolbar superior e navegação inferior fora da área que troca ao alternar formato.
- `MobileTreeChromeContext` permite que a rota filha ativa registre label, busca, sugestões, handlers e navegação usados pelo header.
- `/mapa-familiar` usa `MapaFamiliarSharedRoute` como adaptador transitório para encaixar `Home` no `<Outlet />` sem duplicar header/nav no mobile.
- `/linha-geracional` aceita `mobileChromeMode="shared"` para omitir header/nav próprios e registrar o chrome compartilhado.
- `TreeMapSharedLayout` dispara `arvorefamilia:tree-map-route-change` em mudança de rota para facilitar runtimes defensivos isolados por pathname.
- Desktop continua controlado pelas páginas originais; o chrome compartilhado é contrato mobile.

## Primeiro acesso e rascunhos locais

- O primeiro acesso usa rotas de membro com estado preservado por usuário e pessoa vinculada.
- Rascunhos de `/meus-dados` e `/meus-vinculos` podem usar `sessionStorage` com chave segmentada por `user.id` e `pessoa.id`.
- Rascunhos são proteção auxiliar de UX; falhas de storage não bloqueiam salvamento nem navegação.
- O fluxo preserva a ordem `/meus-dados` → `/meus-vinculos` → `/arquivos-historicos` → `/preferencias` → `/revisao-dados` → `/mapa-familiar`.
- `MemberRoute` e `TreeAccessRoute` bloqueiam rotas internas enquanto `dados_confirmados = false`.
- Pessoa marcada como falecida em `/meus-dados` pula `/preferencias`.
- Alterações de vínculos que dependem de aprovação são pendência, não gravação definitiva.

## Runtimes defensivos mobile

Regras de implementação:

- qualquer ajuste de DOM deve ser isolado por rota e breakpoint;
- não observar `attributes` em `MutationObserver` quando o próprio código altera `style`, `dataset` ou classes;
- evitar recriar repetidamente opções de `<select>` ou nós equivalentes;
- usar `requestAnimationFrame` para agrupar mutações;
- usar `try/catch` para impedir que ajuste visual bloqueie a página;
- preferir correção no componente de origem quando o ajuste deixar de ser temporário.

Componentes relevantes:

- `MobileGlobalTweaks` para overlays mobile e ajustes transversais;
- `MobileTopLayerTweaks` para busca, notificações, avatar e painéis;
- `LinhaGeracionalMobilePanelLayerTweaks` para isolamento da linha geracional, inclusive quando montado no layout compartilhado;
- `FirstLoginTutorialRuntimeTweaks` para tour;
- `PersonProfileRuntimeTweaks` para `/pessoa/:id`.

## Mapa familiar

- `Home.tsx` carrega pessoas e relacionamentos via `dataService`.
- O cache de árvore é segmentado por usuário e pessoa vinculada.
- Mudanças de dados invalidam cache via `treeDataCache`.
- A pessoa de referência usa query string, foco atual, pessoa vinculada ou primeira pessoa disponível.
- Filtros de parentes diretos são persistidos por usuário.
- Em perspectiva por `?pessoa=`, cônjuges colaterais iniciam ocultos.
- O painel desktop usa `DesktopTreeVisualizationPanel`.
- O mapa desktop por grupos usa `DesktopFamilyMapView`.
- Cards em grupos usam `FamilyTreeVisualCards`.
- O subtipo legado `sangue`/`adotivo` não deve ser reintroduzido como texto visível.

## Mapa e linha geracional no mobile

- O header mobile das experiências de árvore usa `Árvore Familiar`.
- A toolbar mobile permanece fixa abaixo do header ao abrir `Formato`, `Cor`, `Filtros`, `Mapa` ou `+`.
- Botões ativos da toolbar usam azul principal do site.
- O botão `Mapa` abre visão geral de grupos/gerações; zoom real é reservado ao mapa completo.
- `MobileFamilyMapBackdrop.tsx` controla o backdrop parcial/imersivo, calculando o limite inferior pelo menu inferior real no modo parcial.
- `MobileFamilyMapContextTray.tsx` controla trays contextuais; em `/linha-geracional`, renderiza cards compactos `GERAÇÃO` numerados de 1 a 6, contadores e CTA.
- `MobileFamilyMapFullLayer.tsx` monta a camada de mapa completo com base branca reta e container arredondado logo abaixo da toolbar; a versão atual não renderiza botão `X` próprio.
- Painéis ativos, cards, CTA e mapas completos permanecem acima do backdrop aplicável.
- Seletores legados de backdrop de toolbar não devem ser reintroduzidos.

## Scripts carregados por `index.html`

Scripts relevantes antes de alterar mapa, mobile, curiosidades, tutorial ou painel desktop:

- `mobileFamilyTreeMutationPerformanceGuard.ts`
- `visualPatchB.ts`
- `firstLoginMobileTutorialFixes.ts`
- `mobileCuriositiesNavigationFix.ts`
- `mobileTreePanelViewportFix.ts`
- `staticMobileFamilyTreeScreens.ts`
- `mobileFamilyTreeScreenStateGuards.ts`
- `mobileFamilyTreeGrandparentScreens.ts`
- `mobileFamilyTreeSwipeHints.ts`
- `mobileFamilyTreeAncestorConnectorsFix.ts`
- `mobileFamilyTreeDescendantConnectorsFix.ts`
- `mobileFamilyTreeCoreDescendantConnector.ts`
- `mobileFamilyTreeGroupTitleVisibilityFix.ts`
- `mobileFamilyHorizontalZoomOverview.ts`
- `mobileFamilyMapUncleSwipeNavigationGuard.ts`
- `mobileFamilyMapOverviewGhostClickGuard.ts`
- `mobileFamilyMapOverviewButtonFix.ts`
- `mobileFamilyMapStableMobileFix.ts`
- `mobileFamilyMapDirectionalNavigationFix.ts`
- `mobileFamilyMapUncleCardLimit.ts`
- `mobileFamilyMapCoreConnectorFix.ts`
- `mobileVisualizationPanelFamilyStatsFix.ts`
- `mobileFamilyMapZoomOverviewVisualFix.ts`
- `mobileFamilyMapOverviewTileVisualAdjustments.ts`
- `mobileFamilyMapDescendantsStabilityLock.ts`
- `mobileFamilyMapDescendantConnectorHeightFix.ts`
- `mobileFamilyMapExtendedSpouseCards.ts`
- `mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `mobileFamilyMapFullOverview.ts`
- `mobileFamilyMapFullOverviewCompactFix.ts`
- `mobileFamilyMapZoomTrayHeightFix.ts`
- `mobileGenerationLineFullOverview.ts`
- `mobileFamilyMapFullOverviewConnectorFix.ts`
- `mobileFamilyMapFullOverviewButtonGuard.ts`

Arquivos de transição neutralizados:

- `mobileMapToolbarBackdropLayerFix.ts`;
- `mobileMapPanelRefinements.ts`;
- `mobileFamilyMapFullPanelStyleFix.ts`;
- `mobileFamilyMapFullOverviewButtonGuard.ts`, quando estiver vazio/no-op;
- `visualPatchA.ts`, quando não carregado por `index.html`.

Handlers de `touchmove`/`touchend` devem avaliar scroll interno antes de chamar `preventDefault()` ou `stopImmediatePropagation()`.

## Mapa completo mobile

Contrato:

- abertura via `Exibir mapa completo` no painel `Mapa da família` ou no painel de gerações;
- container arredondado inicia abaixo da toolbar superior;
- base branca reta acompanha o container;
- versão atual não renderiza botão `X` próprio;
- retorno/fechamento é controlado pelo estado da toolbar/rota;
- pan e zoom funcionam sem rolar a página por baixo;
- pan/zoom não resetam após gesto;
- observers e runtimes não sobrescrevem `transform` do usuário fora de `Reenquadrar` ou reconstrução real;
- conectores são SVGs derivados de âncoras dos nós;
- cards do mapa completo mostram apenas dois primeiros termos do nome e ocultam datas/status;
- `mobileFamilyMapFullOverviewCompactFix.ts` compacta `Tios maternos` e reconstrói conectores.

## Exportação e paletas

- A paleta laranja deve permanecer quente, terracota e solar.
- A paleta marrom preserva caráter documental/sépia.
- A seção `Exportar` do painel desktop exibe somente `Salvar Imagem` e `Imprimir`.
- `Salvar Imagem` é captura de área real da tela.
- `Imprimir` abre janela nativa a partir de página limpa.
- `Imagem` e `PDF` não são ações diretas expostas no painel principal.

## Validação técnica esperada

Antes de merge/deploy:

```bash
git status --short
git diff --check
grep -R $'\xEF\xBF\xBD' docs || true
npm run test
npm run typecheck
npm run build
```
