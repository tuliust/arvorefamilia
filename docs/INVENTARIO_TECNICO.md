# Inventário técnico

> Última revisão: 2026-06-29
> Escopo: rotas, módulos, documentos finais e referências técnicas preservadas após limpeza documental.
> Status: canônico.

## Stack

- Aplicação React com Vite.
- Rotas declaradas em `src/app/routes.tsx` com `createBrowserRouter`.
- Autenticação e contexto em `src/app/contexts/AuthContext`.
- Proteção de rotas por `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`.
- Dados via Supabase, com serviços em `src/app/services` e tipos em `src/app/types`.
- IA por endpoint serverless `api/ai.ts`.
- Validação esperada: `npm run typecheck` e `npm run build`.

## Contratos transversais de UI

- Feedbacks de sucesso, erro, aviso e informação devem usar `toast` de `sonner`, sem `alert` nativo.
- Ações destrutivas, sensíveis ou que disparam efeitos reais devem usar `ConfirmDialog` ou modal controlado equivalente, sem `confirm` nativo.
- Fluxos que coletam justificativa ou texto do usuário devem usar modal controlado com campo de formulário, sem `prompt` nativo.
- `src/app/components/ConfirmDialog.tsx` é o componente padrão para confirmação reutilizável.
- `src/app/components/ui/alert.tsx` é componente visual genérico e não deve ser confundido com `window.alert`.
- Runtimes defensivos de UI devem ser isolados por rota/breakpoint e não podem bloquear carregamento de páginas.

## Áreas funcionais documentadas

| Área | Documento canônico |
|---|---|
| Mapa familiar vertical, horizontal e linha geracional | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores, painel e edição | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Status conjugal | `funcionalidades/STATUS_CONJUGAL.md` |
| Meus dados, IA, mini bio e textos de perfil | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Fórum, favoritos, notificações, dúvidas, calendário, onboarding, timeline, exportação, perfil e admin de pessoas | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |

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

| Tema | Documento |
|---|---|
| Auditoria documental anterior | `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md` |
| Legado técnico consolidado | `historico/LEGADO_TECNICO.md` |
| Limpeza documental final | `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md` |

## Rotas públicas principais

- `/`
- `/entrar`
- `/termos`
- `/privacidade`
- `/pessoa/:id`
- `/pessoas/:id`

## Rotas de membro principais

- `/mapa-familiar`
- `/mapa-familiar-horizontal`
- `/linha-geracional`
- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/revisao-dados`
- `/curiosidades`
- `/forum`
- `/meus-favoritos`
- `/notificacoes`
- `/ajustar-notificacoes`
- `/preferencias`
- `/calendario-familiar`

## Área administrativa

Rotas administrativas principais:

- `/admin`
- `/admin/dashboard`
- `/aprovacoes`
- `/admin/aprovacoes`
- `/admin/home`
- `/admin/pessoas`
- `/admin/pessoas/nova`
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

A área administrativa permanece documentada de forma consolidada nos guias canônicos, especialmente:

- `GUIA_COMPONENTES.md`;
- `GUIA_IMPLEMENTACOES.md`;
- `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `arquitetura/ROTAS_E_GUARDS.md`.

## Modelo de status conjugal

O status conjugal é inferido pelos campos já existentes de relacionamento e pelos dados de falecimento das pessoas envolvidas. Não há coluna persistida `status_conjugal` na documentação canônica atual.

Contrato funcional: `funcionalidades/STATUS_CONJUGAL.md`.

## Runtimes e wrappers relevantes

- `src/app/components/MobileGlobalTweaks.tsx`: ajustes defensivos mobile transversais.
- `src/app/components/FirstLoginTutorialRuntimeTweaks.tsx`: ajustes do tour inicial e compatibilidade visual de árvore.
- `src/app/components/person/PersonProfileRuntimeTweaks.tsx`: regras defensivas de exibição no perfil.
- Wrappers de páginas como `AdminDashboardWithTweaks`, `AdminHomeSettingsWithSaveBar`, `MeusDadosWithInlineProfileBio` e `MeusVinculosMobileShortcutsPage` representam composição atual da UI e devem ser conferidos antes de mover regras para componentes definitivos.

## Scripts mobile defensivos relevantes

Além dos componentes React, a branch usa scripts TypeScript carregados pelo `index.html` para ajustes mobile de transição.

Scripts de mapa familiar mobile que devem ser conferidos antes de alterar `/mapa-familiar`:

- `src/mobileFamilyMapOverviewTileVisualAdjustments.ts`;
- `src/mobileFamilyMapOverviewGhostClickGuard.ts`;
- `src/mobileFamilyMapFullOverview.ts`;
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`;
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`;
- `src/mobileFamilyMapCoreConnectorFix.ts`;
- `src/mobileFamilyMapUncleSwipeNavigationGuard.ts`;
- `src/mobileFamilyMapStableMobileFix.ts`;
- `src/mobileFamilyMapDirectionalNavigationFix.ts`;
- `src/mobileFamilyMapFilterButtonsBehaviorFix.ts`;
- `src/mobileFamilyMapUncleCardLimit.ts`;
- `src/mobileFamilyMapOverviewButtonFix.ts`.


`src/mobileFamilyMapUncleSwipeNavigationGuard.ts` é sensível porque registra handlers de gesto em `window` com capture phase; alterações em scroll ou swipe de tios/primos devem considerar essa prioridade antes de mexer em handlers de `document` ou componentes React. `src/mobileFamilyMapUncleCardLimit.ts` controla o limite visual de 8 cards em tios no mobile. `src/mobileFamilyMapOverviewButtonFix.ts` assume o botão `Mapa` de `/mapa-familiar` e direciona a visão geral por tela explícita.

Componentes/runtimes React relevantes:

- `src/app/components/MobileTopLayerTweaks.tsx`;
- `src/app/components/LinhaGeracionalMobilePanelLayerTweaks.tsx`;
- `src/app/components/MobileGlobalTweaks.tsx`.

Esses arquivos devem permanecer isolados por rota e breakpoint. Qualquer regra estabilizada deve ser considerada para migração ao componente de origem.

## Arquivos removidos ou absorvidos

A limpeza final removeu arquivos de rodada, baseline, QA datado, mobile legado, histórico fragmentado e documentos funcionais pequenos. Conteúdo útil foi absorvido por:

- `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `funcionalidades/CURIOSIDADES.md`;
- `arquitetura/DECISOES_ARQUITETURAIS.md`;
- `operacao/DEPLOY.md`;
