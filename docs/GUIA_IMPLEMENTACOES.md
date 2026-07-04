# Guia de implementações

> Última revisão: 2026-07-04
> Escopo: comportamento implementado na branch `main`, incluindo layout compartilhado mobile dos mapas, runtimes defensivos reais, primeiro acesso, vínculos, notificações administrativas e validação compatível com PowerShell, timeline com PDF em canvas, parentesco por afinidade e conteúdos automáticos de pessoa.
> Status: canônico.

## Rotas e carregamento

- `src/app/routes.tsx` define lazy loading para páginas públicas, de membro, de árvore e administrativas.
- O fallback de rota exibe estado de carregamento.
- `routes.tsx` mantém error boundary de rota.
- `src/main.tsx` instala recuperação global para falhas de import dinâmico e CSS/cache, com reload controlado por `sessionStorage`.
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

## Timeline, anexos e preview de PDF

- `PersonTimeline.tsx` renderiza eventos e anexos no perfil.
- `TimelineAttachments` retorna `null` quando não há anexos.
- Anexos aparecem em cards internos sem título intermediário.
- `ATTACHMENT_ACTION_CLASS` padroniza visualmente `Abrir` e `Baixar`.
- Para PDF, `Abrir` altera o estado `previewAttachment` e abre `AttachmentPreviewDialog`.
- `AttachmentPreviewDialog` usa `PdfDocumentPreview` quando `attachment.kind === 'pdf'`.
- Para não-PDF com URL, a pré-visualização pode usar iframe ou nova aba, conforme o tipo.
- `PdfDocumentPreview` carrega PDF.js por CDN, configura `GlobalWorkerOptions.workerSrc`, busca o arquivo por `fetch(url, { cache: 'no-store' })`, lê `ArrayBuffer` e renderiza cada página em canvas.
- O componente mantém estados `idle`, `loading`, `ready` e `error`.
- Ao desmontar, remove canvases renderizados e limpa o container.
- `Abrir em nova aba` é fallback permanente no rodapé do modal.

Regras técnicas:

- não usar Google Viewer em iframe, pois pode ser bloqueado por `X-Frame-Options: sameorigin`;
- não depender do viewer nativo do navegador para renderizar PDF remoto dentro do modal;
- não remover o botão `Baixar` do card da timeline;
- se o projeto migrar de CDN para `pdfjs-dist`, atualizar dependências, atribuições e inventário.

## Parentesco, conexões e sobrescritas de frases

- `calculateRelationshipDegree` continua sendo a fonte do caminho no grafo.
- `relationshipDegreeDisplay.ts` formata o resultado geral, aplica inferência de gênero e gera frases para parentesco direto, avós/netos, tios/sobrinhos, primos e vínculos conjugais.
- `relationshipSentenceOverrides.ts` atua como camada final de frase para caminhos específicos que o classificador genérico encontra por filho em comum e família de cônjuge.
- `RelationshipFinder.tsx` usa `getRelationshipResultSentenceWithOverrides` no perfil.
- `ConnectionDiscoveryPanel.tsx` usa `getRelationshipResultSentenceWithOverrides` na aba de conexões.
- `CuriosidadesConnectionSection.tsx` delega a renderização do resultado ao painel compartilhado.

Padrões cobertos pela camada de sobrescrita:

- `parent>child>sibling>parent`;
- `parent>child>sibling>parent>spouse`.

Regras:

- frases devem privilegiar narrativa familiar clara;
- `Há uma ligação familiar entre...` deve ser fallback, não resultado para caminhos já conhecidos;
- termos de gênero devem respeitar `pessoa.genero` e, quando ausente, inferência conservadora por nome;
- novos padrões devem ter teste em `relationshipSentenceOverrides.test.ts` ou teste equivalente.

## Conteúdos automáticos de pessoa

- `AdminPeopleContentSettings.tsx` permite gerar, regenerar, editar, limpar e salvar astrologia e fatos do nascimento.
- `personInsightsService.ts` invoca a Supabase Edge Function `generate-person-insights`, lê e persiste registros em `person_generated_insights`.
- `generate-person-insights/index.ts` exige data de nascimento completa, usa `OPENAI_API_KEY`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
- A Edge Function gera `astrology` e `historical_events`.
- Para fatos históricos, o prompt exige `title`, `main_event`, `period_title`, `brazil` e `world`.
- Se `brazil.body` ou `world.body` vierem vazios, a função chama um prompt de reparo.
- O conteúdo histórico final é normalizado antes do upsert.
- Registros históricos gerados pela função usam `prompt_version: v2-contexto-brasil-mundo`; salvamento manual do admin usa `prompt_version: admin-manual-v1`.

Regras:

- alteração na Edge Function exige `supabase functions deploy generate-person-insights`;
- alteração apenas no admin/frontend exige deploy do frontend;
- o admin deve impedir geração/salvamento sem data de nascimento completa;
- erro de IA deve retornar mensagem clara e não bloquear edição manual.

## Runtimes defensivos

Regras de implementação:

- qualquer ajuste de DOM deve ser isolado por rota e breakpoint;
- não observar `attributes` em `MutationObserver` quando o próprio código altera `style`, `dataset` ou classes;
- evitar recriar repetidamente opções de `<select>` ou nós equivalentes;
- usar `requestAnimationFrame` para agrupar mutações;
- usar `try/catch` para impedir que ajuste visual bloqueie a página;
- preferir correção no componente de origem quando o ajuste deixar de ser temporário;
- não usar runtime defensivo para substituir regra de domínio, RLS, guard ou schema.

Componentes e módulos relevantes:

- `MobileGlobalTweaks` para overlays mobile e ajustes transversais;
- `MobileTopLayerTweaks` para busca, notificações, avatar e painéis;
- `LinhaGeracionalMobilePanelLayerTweaks` para isolamento da linha geracional, inclusive quando montado no layout compartilhado;
- `FirstLoginTutorialRuntimeTweaks` para tour;
- `PersonProfileRuntimeTweaks` para `/pessoa/:id`;
- `memberInteractionLayoutRuntimeFixes.ts` para perspectiva memorial transitória;
- `memberUiRuntimeFixes.ts`, `familyMapDesktopRuntimeFixes.ts` e `mobileFamilyMapFullPanelStyleFix.ts` como side effects controlados de `src/main.tsx`.

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
- O botão `Todos os cônjuges` continua acionável e deve refletir `directRelativeFilters.conjuge`.
- `DesktopTreeVisualizationPanel.tsx` não deve aplicar filtro efetivo artificial para forçar `conjuge: false` depois que o usuário ativa o filtro.
- Ao trocar a pessoa no dropdown, o filtro de cônjuges pode ser desligado para iniciar a nova perspectiva limpa.
- `DesktopFamilyMapView.tsx` usa grupos colaterais adaptativos para reduzir largura de tios e primos quando a quantidade de cards pede menos colunas.
- Para grupos de primos, 2, 4 e 5 cards usam `double`; 3 e 6 cards usam `triple`.
- O botão local `+`/`−` de grupos só deve ser usado quando a expansão altera linhas visíveis ou altura útil.
- `mobileFamilyTreeModel.ts` não deve usar fallback posicional que atribua a mesma pessoa como `Pai` e `Mãe`; se `motherId === fatherId`, o segundo papel deve ser descartado.

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

Scripts relevantes antes de alterar mapa, mobile, curiosidades, tutorial, header, notificações, painel desktop ou admin:

- `src/mobileFamilyTreeMutationPerformanceGuard.ts`
- `src/adminActivityAndRelationshipRuntimeFixes.ts`
- `src/visualPatchB.ts`
- `src/meusDadosOptionalFirstAccessFix.ts`
- `src/headerNotificationsFullTextFix.ts`
- `src/personProfileHistoricalFilesSectionFix.ts`
- `src/firstLoginMobileTutorialFixes.ts`
- `src/firstLoginDesktopTutorialPlacementFix.ts`
- `src/mobileCuriositiesNavigationFix.ts`
- `src/mobileTreePanelViewportFix.ts`
- `src/staticMobileFamilyTreeScreens.ts`
- `src/mobileFamilyTreeScreenStateGuards.ts`
- `src/mobileFamilyTreeGrandparentScreens.ts`
- `src/mobileFamilyTreeSwipeHints.ts`
- `src/generationLineSwipeHintDirectionFix.ts`
- `src/mobileFamilyTreeAncestorConnectorsFix.ts`
- `src/mobileFamilyTreeDescendantConnectorsFix.ts`
- `src/mobileFamilyTreeCoreDescendantConnector.ts`
- `src/mobileFamilyTreeGroupTitleVisibilityFix.ts`
- `src/mobileFamilyHorizontalZoomOverview.ts`
- `src/mobileFamilyMapUncleSwipeNavigationGuard.ts`
- `src/mobileFamilyMapOverviewGhostClickGuard.ts`
- `src/mobileFamilyMapOverviewButtonFix.ts`
- `src/mobileFamilyMapStableMobileFix.ts`
- `src/mobileFamilyMapDirectionalNavigationFix.ts`
- `src/mobileFamilyMapUncleCardLimit.ts`
- `src/mobileFamilyMapCoreConnectorFix.ts`
- `src/mobileVisualizationPanelFamilyStatsFix.ts`
- `src/mobileFamilyMapZoomOverviewVisualFix.ts`
- `src/mobileFamilyMapOverviewTileVisualAdjustments.ts`
- `src/mobileFamilyMapDescendantsStabilityLock.ts`
- `src/mobileFamilyMapDescendantConnectorHeightFix.ts`
- `src/mobileFamilyMapExtendedSpouseCards.ts`
- `src/mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `src/desktopSidebarFilterButtonStateFix.ts`
- `src/horizontalHiddenSpouseConnectorFix.ts`
- `src/mobileMapToolbarRequestedBehaviorFix.ts`
- `src/mobileFamilyMapFullOverview.ts`
- `src/mobileFamilyMapFullOverviewCompactFix.ts`
- `src/mobileFamilyMapZoomTrayHeightFix.ts`
- `src/mobileGenerationLineFullOverview.ts`
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`

Arquivos de transição neutralizados ou não contratuais:

- `mobileMapToolbarBackdropLayerFix.ts`;
- `mobileMapPanelRefinements.ts`;
- `mobileFamilyMapFullPanelStyleFix.ts`, quando a regra já estiver absorvida por componente;
- `mobileFamilyMapFullOverviewButtonGuard.ts`, quando estiver vazio/no-op;
- `visualPatchA.ts`, quando não carregado por `index.html`;
- `desktopTreeVisualizationPanelTextFix.ts`, quando a correção textual já estiver no componente de origem.

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
- `Imagem` e `PDF` não são ações diretas expostas no painel principal; se existirem helpers internos, são legado/fallback técnico.

## Tutorial de primeiro acesso

- `FirstLoginTutorial.tsx` deve armazenar o índice da etapa em `sessionStorage` com chave de versão.
- Ao reabrir o tutorial na mesma sessão, a etapa corrente pode ser restaurada.
- Seletores inválidos, elementos ausentes, targets não visíveis e falhas de cálculo de layout não podem quebrar a rota.
- Quando nenhum alvo válido for encontrado, o painel deve cair para posição centralizada/segura, preservando o avanço do tutorial.
- A finalização limpa a etapa armazenada e chama o fluxo normal de conclusão.

## Perspectiva memorial e interações sociais

- `src/memberInteractionLayoutRuntimeFixes.ts` é camada defensiva transitória para perfis memoriais gerenciados por responsáveis.
- Quando a perspectiva ativa tiver `falecido = true`, `/forum` e `/curiosidades` devem continuar acessíveis para leitura.
- Ações de escrita, criação de tópico, resposta, reação, pergunta à IA e publicação no mural devem ser bloqueadas nessa perspectiva.
- O bloqueio deve exibir aviso claro e não depender de `alert`, `confirm` ou `prompt` nativos.
- A regra definitiva deve migrar para componentes/serviços tipados quando a experiência estabilizar.

## Catálogo administrativo de notificações

- `adminNotificationCatalogRuntimeExtensions.ts` adiciona modelos runtime sem alterar o catálogo base original.
- `adminNotificationConfigurationService.ts` deve mesclar catálogo base, extensões runtime e catálogo persistido.
- A reconciliação deve preservar itens customizados pelo admin e adicionar apenas definições ausentes.
- Modelos catalogados nesta etapa: `first_access_welcome` e `admin_new_link_confirmed`.
- A catalogação/editabilidade não implica, por si só, que todos os gatilhos reais já usem o template persistido; a conexão do dispatch deve ser etapa separada e testada.

## Badges de vínculos e RLS

- `/meus-vinculos` depende de `user_person_links` para distinguir `Cadastrado` de `Pré-cadastrado`.
- A migration `20260701090000_allow_member_link_status_lookup.sql` viabiliza a leitura necessária por membros autenticados.
- Qualquer endurecimento futuro deve preferir RPC que retorne apenas `pessoa_id`, evitando expor colunas não necessárias de `user_person_links`.

## Validação técnica esperada

### Bash/Git Bash

```bash
git status --short
git diff --check
grep -R $'\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
npm test
```

### PowerShell

```powershell
git status --short
git diff --check

# Busca o caractere de substituição Unicode U+FFFD em docs/.
Get-ChildItem .\docs -Recurse -File | Select-String -SimpleMatch ([char]0xFFFD)

npm run typecheck
npm run build
npm test
```
