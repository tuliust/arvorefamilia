# Inventário técnico

> Última revisão: 2026-06-29
> Escopo: rotas, módulos, documentos finais e referências técnicas preservadas após limpeza documental.
> Status: canônico.

## Stack

- Aplicação React com Vite.
- Rotas em `src/app/routes.tsx`, usando `createBrowserRouter`.
- Guards: `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`.
- Dados via Supabase, com serviços em `src/app/services` e tipos em `src/app/types`.
- IA por endpoint serverless `api/ai.ts`.
- Scripts de runtime mobile e defensivo carregados por `index.html`.
- Validação esperada: `npm run typecheck` e `npm run build`.

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
| Fórum, favoritos, notificações, dúvidas, calendário, onboarding, timeline, exportação, perfil e administração | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |
| Configurações públicas de `/admin/home` | `admin-home-configuracoes-publicas.md` |

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

## Runtimes e wrappers relevantes

- `src/app/components/MobileGlobalTweaks.tsx`
- `src/app/components/MobileTopLayerTweaks.tsx`
- `src/app/components/LinhaGeracionalMobilePanelLayerTweaks.tsx`
- `src/app/components/FirstLoginTutorialRuntimeTweaks.tsx`
- `src/app/components/person/PersonProfileRuntimeTweaks.tsx`
- Wrappers ativos: `AdminDashboardWithTweaks`, `AdminHomeSettingsWithSaveBar`, `MeusDadosWithInlineProfileBio` e `MeusVinculosMobileShortcutsPage`.

## Scripts carregados por `index.html`

Além de `src/main.tsx`, `index.html` carrega os seguintes scripts defensivos:

- `src/mobileFamilyTreeMutationPerformanceGuard.ts`
- `src/desktopTreeVisualizationPanelTextFix.ts`
- `src/firstLoginMobileTutorialFixes.ts`
- `src/mobileCuriositiesNavigationFix.ts`
- `src/mobileTreePanelViewportFix.ts`
- `src/staticMobileFamilyTreeScreens.ts`
- `src/mobileFamilyTreeScreenStateGuards.ts`
- `src/mobileFamilyTreeGrandparentScreens.ts`
- `src/mobileFamilyTreeSwipeHints.ts`
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
- `src/mobileFamilyMapExtendedSpouseCards.ts`
- `src/mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `src/mobileFamilyMapFullOverview.ts`
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`

Scripts defensivos devem ser tratados como camada de transição, sempre isolados por rota e breakpoint. Quando um comportamento estabilizar, a preferência é migrar para o componente React de origem.

## Arquivos removidos ou absorvidos

A documentação operacional não deve manter arquivos de rodada, baseline antigo ou QA datado quando o conteúdo couber em documentos canônicos. Nesta auditoria, `docs/operacao/QA_NAO_REGRESSAO_MAPAS_MOBILE_POS_AJUSTES_2026_06_21.md` foi removido e seus pontos úteis foram consolidados em `QA_MANUAL.md`.
