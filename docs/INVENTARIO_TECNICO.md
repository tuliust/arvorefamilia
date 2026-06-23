# Inventário técnico

> Última revisão: 2026-06-23
> Escopo: rotas, páginas, componentes, serviços, tipos, API e SQLs relevantes da branch `main`.
> Status: canônico.

## Stack

- Aplicação React com Vite.
- Rotas em `src/app/routes.tsx` usando `createBrowserRouter`.
- Autenticação e contexto em `src/app/contexts/AuthContext`.
- Proteção de rota por `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`.
- Dados no Supabase via serviços em `src/app/services`.
- IA via endpoint serverless `api/ai.ts`.
- Build e verificação: `npm run typecheck` e `npm run build`.

## Rotas públicas

| Rota | Página |
|---|---|
| `/entrar` | `src/app/pages/Entrar.tsx` |
| `/termos` | `src/app/pages/Termos.tsx` |
| `/privacidade` | `src/app/pages/Privacidade.tsx` |
| `/duvidas` | `src/app/pages/Duvidas.tsx` |
| `/admin/login` | `src/app/pages/admin/AdminLogin.tsx` |

`/` redireciona para `/mapa-familiar`.

## Rotas protegidas por árvore ou membro

| Rota | Página / shell |
|---|---|
| `/mapa-familiar` | `Home` com modo `mapa-familiar` |
| `/mapa-familiar-horizontal` | `Home` com modo `mapa-familiar-horizontal` |
| `/busca` | `BuscaResultados` |
| `/minha-arvore/editar` | `MinhaArvore` |
| `/meus-dados` | `MeusDados` |
| `/meus-vinculos` | `MeusVinculosWithProfileBio` |
| `/arquivos-historicos` | `ArquivosHistoricosPage` |
| `/preferencias` | `PreferenciasPage` |
| `/revisao-dados` | `RevisaoDados` |
| `/vincular-perfil` | `VincularPerfil` |
| `/pessoa/:id` e `/pessoas/:id` | `PersonProfile` |
| `/calendario-familiar` | `CalendarioFamiliar` |
| `/curiosidades` | `Curiosidades` |
| `/meus-favoritos` | `MeusFavoritos` |
| `/notificacoes` | `Notificacoes` |
| `/ajustar-notificacoes` | `AjustarNotificacoes` |
| `/forum` | `ForumHome` |
| `/forum/novo` | `ForumNovoTopico` |
| `/forum/topico/:id` | `ForumTopico` |
| `/forum/topico/:id/editar` | `ForumEditarTopico` |

## Área administrativa

| Rota | Página |
|---|---|
| `/admin` e `/admin/dashboard` | `AdminDashboard` |
| `/admin/home` | `AdminHomeSettings` |
| `/admin/pessoas` | `AdminPessoas` |
| `/admin/pessoas/nova` | `AdminPessoaForm` |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` |
| `/admin/pessoas/:id` | `AdminPessoaForm` |
| `/admin/relacionamentos` | `AdminRelacionamentos` |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` |
| `/admin/importacao` | `AdminImportacao` |
| `/admin/migrar-dados` | `AdminMigrarDados` |
| `/admin/diagnostico` | `AdminDiagnostico` |
| `/admin/integridade` | `AdminIntegridade` |
| `/admin/atividades` | `AdminAtividades` |
| `/admin/notificacoes` | `AdminNotificacoes` |
| `/admin/duvidas` | `AdminDuvidas` |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos` |

## Componentes centrais

- `src/app/pages/Home.tsx`: orquestra mapas, IA contextual, filtros, busca, abertura de perfil e estado de visualização.
- `src/app/pages/home/*`: header, painel desktop, navegação mobile, seções e diálogos do mapa.
- `src/app/components/FamilyTree/*`: renderização da árvore, mapas desktop/mobile, layout horizontal, conectores, preferências e ações de exportação.
- `src/app/components/layout/*`: navegação global, avatar, menus, notificações e atalhos.
- `src/app/pages/forum/*`: fórum de tópicos.
- `src/app/pages/curiosidades/*` e `src/app/pages/Curiosidades.tsx`: estatísticas e exploração de dados familiares.

## Serviços principais

| Serviço | Responsabilidade |
|---|---|
| `dataService.ts` | CRUD de pessoas e relacionamentos, normalização de campos, logs de atividade e invalidação de cache. |
| `memberProfileService.ts` | perfis de membros, vínculos entre usuário e pessoa, pessoa principal vinculada. |
| `personInsightsService.ts` | leitura de insights gerados por pessoa. |
| `historicalFilesService.ts` | fatos e arquivos históricos. |
| `notificationService.ts` | notificações e preferências. |
| `favoritesService.ts` | favoritos do usuário. |
| `forumService.ts` | tópicos e interações do fórum. |
| `treeDataCache.ts` | cache local e eventos de atualização da árvore. |
| `permissionService.ts` | detecção de permissão administrativa. |

## Tipos e contratos

- `src/app/types` concentra os modelos de pessoa, relacionamento e entidades de domínio.
- `src/app/components/FamilyTree/types.ts` define filtros de visualização, grupos de parentesco, dados de casamento e opções de layout.
- `api/ai.ts` aceita dois usos: perguntas sobre a árvore e geração de textos de perfil (`purpose: "profile_text"`).

## Supabase

Não foi localizado, pela busca disponível, um diretório versionado `supabase/migrations` como fonte primária. A documentação operacional deve tratar como fontes versionadas atuais:

- `supabase/forum-schema.sql`;
- `supabase/google-calendar-schema.sql`;
- `supabase/config.toml`;
- SQLs legados preservados em `docs/historico/SQLS_LEGADOS.md`.

Se migrations numeradas forem adicionadas depois, `docs/operacao/MIGRATIONS_SUPABASE.md` deve ser atualizado.
