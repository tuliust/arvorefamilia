# Inventário técnico

> Última revisão: 2026-07-04
> Escopo: rotas, módulos, documentos finais, runtimes carregados por `index.html` e `src/main.tsx`, layout compartilhado mobile de mapas, ajustes desktop do mapa familiar, notificações, vínculos, tutorial, questionário opcional `Sobre Mim`, perfis gerenciados e perspectiva memorial, timeline com preview de PDF, conexões de parentesco e conteúdos automáticos de pessoa.
> Status: canônico.

## Stack

- Aplicação React com Vite.
- Rotas em `src/app/routes.tsx`, usando `createBrowserRouter`.
- Guards: `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`.
- Dados via Supabase, com serviços em `src/app/services` e tipos em `src/app/types`.
- IA por endpoint serverless `api/ai.ts` e pela Supabase Edge Function `generate-person-insights` para conteúdos automáticos de pessoa.
- Scripts defensivos carregados por `index.html` ou importados por side effect em `src/main.tsx`.
- Validação esperada: `npm run typecheck`, `npm run build`, `npm test` e `git diff --check`.

## Documentos canônicos por área

| Área | Documento |
|---|---|
| Mapa familiar, visualização horizontal e linha geracional | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores, painel e edição | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Status conjugal | `funcionalidades/STATUS_CONJUGAL.md` |
| Meus dados, IA, Mini Bio e Curiosidades | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Notificações administrativas | `funcionalidades/NOTIFICACOES_ADMIN.md` |
| Funcionalidades complementares | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |
| Configurações públicas | `admin-home-configuracoes-publicas.md` |

## Documentos técnicos finais

| Tema | Documento |
|---|---|
| Arquitetura e decisões | `arquitetura/DECISOES_ARQUITETURAIS.md` |
| Rotas e guards | `arquitetura/ROTAS_E_GUARDS.md` |
| Componentes | `GUIA_COMPONENTES.md` |
| Implementações | `GUIA_IMPLEMENTACOES.md` |
| UX e layout | `GUIA_UX_LAYOUT.md` |
| QA manual | `QA_MANUAL.md` |
| Não regressão | `REGRAS_DE_NAO_REGRESSAO.md` |
| Correção de erros | `GUIA_CORRECAO_ERROS.md` |
| Próximos passos | `PLANO_PROXIMOS_PASSOS.md` |
| Migrations Supabase | `operacao/MIGRATIONS_SUPABASE.md` |
| Deploy | `operacao/DEPLOY.md` |
| OAuth Google | `operacao/OAUTH_GOOGLE.md` |
| Storage | `operacao/STORAGE_MAINTENANCE.md` |

## Histórico preservado

- `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md`
- `historico/LEGADO_TECNICO.md`
- `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md`
- `historico/REVISAO_DOCUMENTACAO_MAPA_MOBILE_20260701.md`

## Rotas declaradas em `src/app/routes.tsx`

### Públicas

- `/entrar`
- `/termos`
- `/privacidade`
- `/duvidas`

### Árvore, busca e perfil

- `/`
- `/mapa-familiar`
- `/mapa-familiar-horizontal`
- `/linha-geracional`
- `/busca`
- `/pessoa/:id`
- `/pessoas/:id`

### Membro e onboarding

- `/minha-arvore/editar`
- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/preferencias`
- `/revisao-dados`
- `/vincular-perfil`
- `/calendario-familiar`
- `/curiosidades`
- `/meus-favoritos`
- `/notificacoes`
- `/ajustar-notificacoes`
- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`

### Administração

- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/aprovacoes`
- `/admin/aprovacoes`
- `/admin/home`
- `/admin/pessoas`
- `/admin/pessoas/novas`
- `/admin/pessoas/nova`
- `/admin/pessoas/:id`
- `/admin/pessoas/:id/editar`
- `/admin/relacionamentos`
- `/admin/relacionamentos/novo`
- `/admin/importacao`
- `/admin/migrar-dados`
- `/admin/diagnostico`
- `/admin/integridade`
- `/admin/atividades`
- `/admin/responsaveis`
- `/admin/notificacoes`
- `/admin/gestao-conteudo-pessoas`
- `/admin/duvidas`

## Layout compartilhado mobile dos mapas

| Arquivo | Responsabilidade |
|---|---|
| `src/app/pages/tree/TreeMapSharedLayout.tsx` | Shell compartilhado mobile de `/mapa-familiar` e `/linha-geracional`; renderiza `HomeHeader`, `<Outlet />` e `HomeMobileNav`. |
| `src/app/pages/tree/MobileTreeChromeContext.tsx` | Registro dos dados de chrome fornecidos pela rota filha ativa. |
| `src/app/pages/tree/MapaFamiliarSharedRoute.tsx` | Adaptador transitório para renderizar `Home` dentro do layout compartilhado sem duplicar header/nav no mobile. |
| `src/app/pages/LinhaGeracional.tsx` | Aceita `mobileChromeMode="shared"` para operar dentro do layout comum. |
| `src/app/routes.tsx` | Declara `/mapa-familiar` e `/linha-geracional` como filhas de `TreeMapSharedLayout`. |

Essa arquitetura é mobile-first. Desktop continua sendo responsabilidade das páginas originais e da shell `Home` quando aplicável.

## Mapa familiar desktop: arquivos de implementação

| Arquivo | Responsabilidade |
|---|---|
| `src/app/pages/home/DesktopTreeVisualizationPanel.tsx` | Painel lateral desktop com dropdown de perspectiva, paletas, resumo, grupos, filtros finais e exportação; usa `directRelativeFilters` reais e mantém `Todos os cônjuges` acionável em `?pessoa=`. |
| `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` | Layout desktop por grupos; calcula coordenadas, colunas efetivas, largura adaptativa de tios/primos e controle local de expansão. |
| `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` | Renderização visual dos cards e ordenação de singles/pares conjugais nos grupos. |
| `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` | Modelo de parentesco e inferência de relações diretas; não pode duplicar a mesma pessoa como `Pai` e `Mãe`. |
| `src/app/components/FamilyTree/utils/treePreferences.ts` | Preferências persistidas e defaults iniciais de filtros; não substitui o estado real alterado pelo usuário no painel. |

## Primeiro acesso: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Dados pessoais e questionário `Sobre Mim` | `src/app/pages/MeusDados.tsx`, `src/app/pages/MeusDadosWithInlineProfileBio.tsx` |
| Texto de perfil e IA | `src/app/services/profileQuestionnaireService.ts`, `api/ai.ts` |
| Pessoa ativa e perfis gerenciados | `src/app/services/memberProfileService.ts`, `src/app/services/responsiblePerspectiveService.ts`, `src/app/services/personResponsibleLinksService.ts`, `src/app/components/layout/UserProfileMenu.tsx` |
| Vínculos, pets, cônjuges e rascunhos | `src/app/pages/MeusVinculos.tsx`, `src/app/pages/MeusVinculosWithProfileBio.tsx`, `src/app/pages/MeusVinculosMobileShortcutsPage.tsx` |
| Modal de pet | `src/app/pages/meus-vinculos/MeusVinculosPetEditorPortal.tsx` |
| Fatos e arquivos históricos | `src/app/components/ArquivosHistoricos.tsx`, `src/app/pages/ArquivosHistoricosPage.tsx` |
| Revisão final | `src/app/pages/RevisaoDados.tsx`, `src/app/pages/RevisaoDadosFlowPage.tsx` |
| Guards | `src/app/components/MemberRoute.tsx`, `src/app/components/TreeAccessRoute.tsx`, `src/app/services/memberProfileService.ts` |

Contratos atuais:

- o questionário `Sobre Mim` é opcional;
- Mini Bio e Curiosidades são opcionais;
- `Pular Tudo` abre a tela final sem exigir característica selecionada;
- `Voltar ao questionário` retorna à primeira etapa via `meus-dados:questionnaire-reset`;
- a geração de Mini Bio/Curiosidades deve usar a pessoa ativa editável;
- quando há `responsiblePerspective`, a pessoa administrada tem prioridade sobre o perfil principal do usuário responsável;
- rascunhos de `/meus-dados` devem ser segmentados por `user.id` e `pessoa.id`.

## Perfil, timeline e conexões: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Timeline de perfil | `src/app/components/Timeline/PersonTimeline.tsx`, `src/app/utils/buildPersonTimeline.ts` |
| Preview de PDF | `src/app/components/Timeline/PdfDocumentPreview.tsx` |
| Relação no perfil | `src/app/components/person/RelationshipFinder.tsx` |
| Conexão em `/curiosidades` | `src/app/pages/curiosidades/CuriosidadesConnectionSection.tsx`, `src/app/pages/home/ConnectionDiscoveryPanel.tsx` |
| Cálculo e formatação | `src/app/utils/relationshipDegree.ts`, `src/app/utils/relationshipDegreeDisplay.ts`, `src/app/utils/relationshipSentenceOverrides.ts` |
| Testes de frases | `src/app/utils/relationshipSentenceOverrides.test.ts` |

Contratos atuais:

- `PersonTimeline` renderiza anexos sem cabeçalho intermediário e usa modal para PDF.
- `PdfDocumentPreview` carrega PDF.js por CDN e renderiza páginas em canvas.
- `RelationshipFinder` calcula no perfil com `includeInactiveSpouses: true`.
- `ConnectionDiscoveryPanel` centraliza a frase final de conexão na aba de `/curiosidades`.
- `relationshipSentenceOverrides.ts` cobre padrões por filho em comum e família de cônjuge.

## Conteúdos automáticos de pessoa: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Admin | `src/app/pages/admin/AdminPeopleContentSettings.tsx` |
| Serviço frontend | `src/app/services/personInsightsService.ts` |
| Edge Function | `supabase/functions/generate-person-insights/index.ts` |
| Signo solar | `src/app/utils/zodiac.ts` |
| Tabela esperada | `person_generated_insights` |

Contratos atuais:

- tipos de insight: `astrology` e `historical_events`;
- `historical_events` deve conter `title`, `main_event`, `period_title`, `brazil` e `world`;
- geração automática depende de data de nascimento completa;
- alteração na Edge Function exige deploy próprio no Supabase;
- salvamento manual do admin usa `upsertPersonGeneratedInsight`.

### Dependência externa carregada em runtime

`PdfDocumentPreview.tsx` carrega PDF.js via CDN:

```text
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

Essa dependência não aparece em `package.json`. Alterações nessa estratégia devem atualizar `ATTRIBUTIONS.md`, deploy/cache/CDN e este inventário.

## Notificações administrativas: arquivos de implementação

| Área | Arquivos principais |
|---|---|
| Painel administrativo | `src/app/pages/admin/AdminNotificacoes.tsx` |
| Configuração | `src/app/components/admin/notifications/AdminNotificationConfiguration.tsx` |
| Formatadores | `src/app/components/admin/notifications/adminNotificationFormatters.ts` |
| Catálogo base | `src/app/constants/adminNotificationCatalog.ts` |
| Extensões runtime de catálogo | `src/app/constants/adminNotificationCatalogRuntimeExtensions.ts` |
| Persistência e reconciliação | `src/app/services/adminNotificationConfigurationService.ts` |
| Destinatários | `src/app/services/notificationRecipientsService.ts` |
| Primeiro acesso ao mapa | `src/app/services/firstMapWelcomeNotificationService.ts`, `src/app/components/TreeAccessRoute.tsx` |
| Modelos runtime catalogados | `first_access_welcome`, `admin_new_link_confirmed` e respectivos templates |
| Dispatch | `src/app/services/notificationDispatchService.ts`, `src/app/services/notificationAdminService.ts`, `src/app/services/notificationScheduledService.ts` |
| Header/dropdown | `src/app/components/layout/HeaderNotificationsDropdown.tsx` |

## Runtimes e wrappers relevantes

### Importados por componentes/rotas React

- `src/app/components/MobileGlobalTweaks.tsx`
- `src/app/components/MobileTopLayerTweaks.tsx`
- `src/app/components/LinhaGeracionalMobilePanelLayerTweaks.tsx`
- `src/app/components/FamilyTree/MobileFamilyMapBackdrop.tsx`
- `src/app/components/FamilyTree/MobileFamilyMapContextTray.tsx`
- `src/app/components/FamilyTree/MobileFamilyMapFullLayer.tsx`
- `src/app/components/FirstLoginTutorialRuntimeTweaks.tsx`
- `src/app/components/person/PersonProfileRuntimeTweaks.tsx`

### Importados por `src/main.tsx`

| Arquivo | Situação documental |
|---|---|
| `src/mobileFamilyMapFullPanelStyleFix.ts` | Compatibilidade visual mobile importada por side effect; revisar antes de remover. |
| `src/familyMapDesktopRuntimeFixes.ts` | Ajustes defensivos de mapa desktop; não substitui contratos React de origem. |
| `src/memberUiRuntimeFixes.ts` | Ajustes defensivos de UI de membro; manter isolado por rota e seletor. |
| `src/memberInteractionLayoutRuntimeFixes.ts` | Runtime transitório para perspectiva memorial em `/forum` e `/curiosidades`, ajustes de `/meus-dados` e modal de pet em `/meus-vinculos`. |

Wrappers ativos: `AdminDashboardWithTweaks`, `AdminHomeSettingsWithSaveBar`, `MeusDadosWithInlineProfileBio`, `MeusVinculosWithProfileBio` e `MeusVinculosMobileShortcutsPage`.

## Perfis gerenciados e pessoa ativa

| Elemento | Responsabilidade |
|---|---|
| `person_responsible_links` | Vínculo pessoa-a-pessoa que define quem pode administrar perfis legados, crianças ou pessoas sob responsabilidade. |
| `responsiblePerspectiveService.ts` | Perspectiva ativa no cliente; guarda `pessoaId`, nome, estado memorial e metadados de exibição. |
| `getCurrentUserEditablePeopleWithPessoa()` | Deve retornar pessoas editáveis por vínculo direto e por responsabilidade. |
| `person_profile_questionnaire_answers` | Respostas do questionário `Sobre Mim`; RLS precisa aceitar vínculo direto e responsabilidade válida. |

A regra transversal é não misturar usuário autenticado, pessoa principal e pessoa administrada. Páginas de primeiro acesso devem sempre operar sobre o `pessoa.id` ativo.

## Mapa mobile: componentes React vigentes

| Arquivo | Responsabilidade |
|---|---|
| `src/app/pages/home/HomeMobileNav.tsx` | Centraliza estado dos botões `Formato`, `Cor`, `Filtros`, `Mapa` e `+`; no chrome compartilhado fica fora do `<Outlet />`. |
| `src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx` | Toolbar mobile; `Mapa` abre visão geral. |
| `src/app/components/FamilyTree/MobileFamilyMapBackdrop.tsx` | Backdrop React parcial/imersivo. |
| `src/app/components/FamilyTree/MobileFamilyMapContextTray.tsx` | Tray contextual; em `/linha-geracional`, cards compactos `GERAÇÃO` numerados de 1 a 6. |
| `src/app/components/FamilyTree/MobileFamilyMapFullLayer.tsx` | Camada de mapa completo com base branca reta e container arredondado abaixo da toolbar; sem botão `X` próprio. |
| `src/mobileFamilyMapFullOverview.ts` | Runtime de compatibilidade do mapa completo de `/mapa-familiar`. |
| `src/mobileGenerationLineFullOverview.ts` | Runtime da visualização completa de `/linha-geracional`. |
| `src/mobileFamilyMapFullOverviewConnectorFix.ts` | Refinamentos de conectores do mapa completo. |
| `src/mobileFamilyMapFilterButtonsBehaviorFix.ts` | Comportamento defensivo dos filtros mobile. |

## Scripts carregados por `index.html`

| Arquivo | Situação documental |
|---|---|
| `src/mobileFamilyTreeMutationPerformanceGuard.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/adminActivityAndRelationshipRuntimeFixes.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/visualPatchB.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/meusDadosOptionalFirstAccessFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/headerNotificationsFullTextFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/personProfileHistoricalFilesSectionFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/firstLoginMobileTutorialFixes.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/firstLoginDesktopTutorialPlacementFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileCuriositiesNavigationFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileTreePanelViewportFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/staticMobileFamilyTreeScreens.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeScreenStateGuards.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeGrandparentScreens.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeSwipeHints.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/generationLineSwipeHintDirectionFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeAncestorConnectorsFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeDescendantConnectorsFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeCoreDescendantConnector.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyTreeGroupTitleVisibilityFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyHorizontalZoomOverview.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapUncleSwipeNavigationGuard.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapOverviewGhostClickGuard.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapOverviewButtonFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapStableMobileFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapDirectionalNavigationFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapUncleCardLimit.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapCoreConnectorFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileVisualizationPanelFamilyStatsFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapZoomOverviewVisualFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapOverviewTileVisualAdjustments.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapDescendantsStabilityLock.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapDescendantConnectorHeightFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapExtendedSpouseCards.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapFilterButtonsBehaviorFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/desktopSidebarFilterButtonStateFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/horizontalHiddenSpouseConnectorFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileMapToolbarRequestedBehaviorFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapFullOverview.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapFullOverviewCompactFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapZoomTrayHeightFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileGenerationLineFullOverview.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapFullOverviewConnectorFix.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |
| `src/mobileFamilyMapFullOverviewButtonGuard.ts` | Runtime defensivo carregado por `index.html`; manter isolado por rota, breakpoint e seletor. |

Esses arquivos devem ser tratados como camada defensiva de transição. Quando o comportamento estabilizar, migrar a regra para componentes/serviços tipados e remover a manipulação direta de DOM.

## Scripts neutralizados, removidos ou absorvidos

| Arquivo | Situação documental |
|---|---|
| `src/mobileMapPanelRefinements.ts` | Não é contrato vigente se vazio ou não carregado. |
| `src/mobileMapToolbarBackdropLayerFix.ts` | Não é contrato vigente se vazio ou não carregado. |
| `src/mobileFamilyMapFullPanelStyleFix.ts` | Se apenas importado por compatibilidade, revisar absorção por componente React. |
| `src/mobileFamilyMapFullOverviewButtonGuard.ts` | Se estiver carregado mas vazio, é compatibilidade/no-op. |
| `src/desktopTreeVisualizationPanelTextFix.ts` | Não listar como ativo quando a correção textual já estiver no componente de origem. |
| `src/visualPatchA.ts` | Se existir sem carregamento, tratar como resíduo técnico. |
| `scripts/reorganizar-documentacao.sh` | Script legado de reorganização; não executar sem revisão, pois pode recriar índice antigo. |
| `scripts/reorganizar-documentacao.ps1` | Script legado de reorganização; não executar sem revisão, pois pode recriar índice antigo. |

## Migrations recentes relevantes

| Migration | Uso |
|---|---|
| `supabase/migrations/20260701090000_allow_member_link_status_lookup.sql` | Cria função `current_user_has_person_link()` e policy para resolver status de vínculo exibido nos badges de `/meus-vinculos`. |
| `supabase/migrations/20260701120000_persist_admin_notification_config_and_first_map_access.sql` | Persiste configuração administrativa de notificações e deduplica primeiro acesso a `/mapa-familiar`. |
| `supabase/migrations/20260701143000_persist_full_admin_notification_catalog.sql` | Persiste snapshot completo do catálogo administrativo. |
| `supabase/migrations/20260701170000_add_variable_settings_to_admin_notification_config.sql` | Adiciona `variable_settings` em JSONB para regras administrativas de variáveis. |
| `supabase/migrations/20260703120000_fix_admin_reset_profile_storage_api_block.sql` | Corrige `admin_reset_person_profile` para não deletar diretamente `storage.objects`; remoção física deve ser feita pela Storage API. |
| `supabase/migrations/20260703170000_allow_responsible_profile_questionnaire_answers.sql` | Atualiza RLS de `person_profile_questionnaire_answers` para permitir respostas de questionário em perfis sob responsabilidade. |

Revisão de segurança recomendada: substituir leitura ampla de `user_person_links` por RPC que retorne apenas `pessoa_id` quando o dispatch/serviço estiver estabilizado.

## Validação

### Bash/Git Bash

```bash
git status --short
git diff --check
grep -R --include='*.md' --include='*.txt' --include='*.json' --include='*.sql' $'\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
npm test
```

### PowerShell

```powershell
git status --short
git diff --check

# Busca o caractere de substituição Unicode U+FFFD apenas em arquivos textuais.
Get-ChildItem -Path .\docs -Recurse -File |
  Where-Object { $_.Extension -in ".md", ".txt", ".json", ".sql" } |
  Select-String -SimpleMatch ([char]0xFFFD)

npm run typecheck
npm run build
npm test
```

## Regra de manutenção do inventário

Atualizar este arquivo sempre que houver nova rota, layout, guard, serviço, tabela, migration, runtime carregado por `index.html`, runtime importado por `src/main.tsx`, neutralização/remoção de runtime ou mudança no contrato de `/admin/notificacoes`.
