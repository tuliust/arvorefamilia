# Arquitetura atual - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/arquitetura/ARCHITECTURE.md`  
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra a visão técnica de alto nível do projeto **Árvore Família**: stack, organização de código, camadas, fluxo de dados, rotas, banco, Edge Functions e regras estruturais que não devem ser alteradas sem revisão.

Use este arquivo para entender a arquitetura geral. Para detalhes específicos, consulte:

- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e navegação;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`: modelo de usuários, pessoas, vínculos e tabelas;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations, SQL legado e operação Supabase;
- `docs/GUIA_COMPONENTES.md`: responsabilidades de componentes;
- `docs/GUIA_IMPLEMENTACOES.md`: inventário consolidado do que já está implementado;
- `docs/funcionalidades/*.md`: comportamento funcional por área.

---

## 1. Stack atual

| Camada | Tecnologia / recurso |
|---|---|
| Frontend | React 18, TypeScript e Vite |
| Roteamento | React Router 7 com `createBrowserRouter` |
| UI | Tailwind CSS v4, componentes locais em `src/app/components/ui`, `lucide-react` |
| Árvore | React Flow, Dagre e layouts próprios em `components/FamilyTree` |
| Banco/Auth | Supabase Auth, Supabase Postgres, RLS, RPCs e Storage |
| Edge/serverless | Supabase Edge Functions |
| Testes | Vitest e Playwright |
| Exportação | `html2canvas` e `jspdf` |
| Integrações | Google Places/Maps, Google Calendar, Resend/OpenAI server-side quando configurados |

Observações:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são referência histórica ou operacional, não schema canônico.
- Secrets não devem ir para frontend, repositório, dumps versionados ou documentação operacional aberta.

---

## 2. Estrutura de código

```txt
src/app/
  components/             Componentes reutilizáveis
  components/ui/          Componentes base de UI
  components/layout/      Headers, menu do usuário e containers
  components/FamilyTree/  ReactFlow, nodes, edges, layouts e exportação
  components/person/      Campos, exibição e editores de pessoa
  components/relationships/ Dados conjugais e vínculos
  components/Timeline/    Timeline de pessoa
  components/favorites/   Favoritos
  contexts/               AuthContext
  lib/                    Cliente Supabase
  pages/                  Páginas públicas, membro, fórum e admin
  pages/home/             Subcomponentes da Home pós-login
  pages/forum/            Fórum
  pages/admin/            Área administrativa
  services/               Acesso a dados, Supabase e regras de aplicação
  types/                  Contratos TypeScript
  utils/                  Funções puras e helpers
  routes.tsx              Definição de rotas e guards

supabase/
  migrations/             Fonte da verdade do schema
  functions/              Edge Functions
```

Regra de separação:

- componente visual não deve concentrar regra de banco;
- persistência deve passar por service;
- cálculo puro deve ficar em util;
- schema deve evoluir por migration;
- rota/guard deve ficar centralizada em `routes.tsx` e nos componentes de proteção.

---

## 3. Camadas principais

| Camada | Responsabilidade | Exemplos |
|---|---|---|
| Rotas/guards | Definir acesso e navegação | `routes.tsx`, `ProtectedRoute`, `MemberRoute`, `TreeAccessRoute` |
| Contexto de auth | Sessão, login, cadastro, logout e estado do usuário | `AuthContext.tsx` |
| Pages | Orquestração de tela, estado local e composição | `Home.tsx`, `PersonProfile.tsx`, `MinhaArvore.tsx`, páginas admin |
| Components | UI, interação visual e componentes reutilizáveis | `FamilyTree`, `MemberPageHeader`, `UserProfileMenu`, `FavoriteButton` |
| Services | Leitura/escrita Supabase, RPCs, Storage e integrações | `dataService`, `memberProfileService`, `forumService`, `notification*Service` |
| Utils | Transformações e cálculos puros | `relationshipDegree`, `familyDates`, `buildPersonTimeline` |
| Migrations | Schema, RLS, functions SQL e seeds controlados | `supabase/migrations/*.sql` |
| Edge Functions | Execução server-side com secrets | notificações, Google Calendar, insights |

---

## 4. Autenticação, rotas e guards

A autenticação é centralizada em `AuthContext` com Supabase Auth.

Guards atuais:

| Guard | Arquivo | Uso |
|---|---|---|
| `TreeAccessRoute` | `src/app/components/TreeAccessRoute.tsx` | `/`, `/minha-arvore`, `/genealogia`, `/visao-completa` |
| `MemberRoute` | `src/app/components/MemberRoute.tsx` | páginas de usuário autenticado, fórum, notificações, calendário, favoritos e perfis |
| `ProtectedRoute` | `src/app/components/ProtectedRoute.tsx` | rotas administrativas |

Regras consolidadas:

- `MemberRoute` exige apenas usuário autenticado.
- `TreeAccessRoute` exige sessão recente e vínculo resolvido com pessoa da árvore.
- `ProtectedRoute` consulta `permissionService.isAdminUser`, que usa RPC `is_admin_user`.
- Usuário comum não deve acessar `/admin/*`.
- UI escondida não substitui RLS/RPC segura.
- `/` redireciona para `/minha-arvore` preservando search params.

Detalhes ficam em `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 5. Home pós-login e árvore

A Home pós-login é o shell das três views da árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/treeViewMode.ts
```

Regras:

- `Home.tsx` deriva `treeViewMode` da URL.
- `treeViewMode.ts` centraliza mapeamento de view para path.
- `FamilyTree.tsx` renderiza React Flow, layouts, viewport, pan/zoom e exportação.
- `/minha-arvore` usa layout direto da pessoa central.
- `/genealogia` usa layout por gerações com escopo pessoal.
- `/visao-completa` usa layout por gerações com base completa.
- Paletas visuais são aplicadas por CSS variables e `localStorage`; não usam Supabase.
- Ajuste visual da árvore não deve criar migration.

---

## 6. Modelo principal de dados

| Objeto | Função |
|---|---|
| `auth.users` | Usuário autenticado do Supabase Auth |
| `profiles` | Complemento público do usuário, incluindo role |
| `user_person_links` | Vínculo entre usuário e pessoa da árvore |
| `pessoas` | Dados cadastrais, biográficos, contato, privacidade e flags de pessoa/pet |
| `relacionamentos` | Arestas familiares/conjugais entre pessoas |
| `arquivos_historicos` | Arquivos vinculados a pessoa ou relacionamento |
| `person_events` | Eventos da vida de uma pessoa |
| `pessoa_social_profiles` | Redes sociais estruturadas por pessoa |
| `person_generated_insights` | Insights gerados/persistidos por pessoa |
| `person_profile_suggestions` | Sugestões de informação para revisão admin |
| `preferencias_notificacao` | Preferências atuais de notificação |
| `notificacoes_usuario` | Notificações internas do usuário |
| `notification_dispatch_logs` | Logs técnicos de envio/canal |
| `notification_occurrences` | Deduplicação/ocorrências de rotina automática |
| `user_favorites` | Favoritos por usuário e tipo de entidade |
| `forum_*` | Fórum: categorias, tópicos, pessoas relacionadas, respostas, comentários, reações e denúncias |
| `google_calendar_*` | Conexão OAuth, status e eventos sincronizados |

Detalhamento fica em `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`.

---

## 7. Services centrais

| Service | Responsabilidade |
|---|---|
| `dataService.ts` | CRUD principal de pessoas e relacionamentos, RPCs administrativas e normalizações de relacionamento |
| `memberProfileService.ts` | Perfis, primeiro acesso, vínculo usuário-pessoa e edição de dados próprios |
| `permissionService.ts` | Admin e permissões de edição de pessoa |
| `relationshipChangeRequestService.ts` | Solicitações de alteração de relacionamento por usuário comum |
| `arquivosHistoricosService.ts` | CRUD de arquivos históricos e vínculos com pessoa/relacionamento |
| `storageService.ts` | Upload/remoção em Supabase Storage |
| `personEventsService.ts` | Eventos da vida |
| `personInsightsService.ts` | Insights de astrologia/acontecimentos históricos |
| `personProfileSuggestionService.ts` | Sugestões de informação para revisão admin |
| `favoritesService.ts` | Favoritos e sanitização de metadata |
| `forumService.ts` | Fórum, reações, denúncias e moderação básica |
| `notification*Service.ts` | Preferências, disparo, destinatários, logs e gatilhos de notificações |
| `googleCalendarService.ts` | Edge Functions e status de Google Calendar |

Regra:

- services podem falar com Supabase;
- componentes chamam services;
- services não devem depender de componentes;
- erros de Supabase devem ser registrados com contexto suficiente para troubleshooting.

---

## 8. Relacionamentos

Tipos principais:

```txt
conjuge
pai
mae
filho
irmao
```

Subtipos principais:

```txt
sangue
adotivo
uniao
casamento
separado
```

Regras estruturais:

- `conjuge`: A → B cria/atualiza relação equivalente B → A quando o fluxo permite.
- `irmao`: A → B cria B → A.
- `pai`/`mae`: filho → pai/mãe cria inverso pai/mãe → filho.
- `filho`: inverso só é criado quando o fluxo informa se deve ser `pai` ou `mae`; não inferir gênero/tipo sem dado.
- Usuário comum não altera relacionamento real diretamente; cria solicitação.
- Admin aprova/rejeita solicitações e aplica a alteração real quando apropriado.

---

## 9. Storage e arquivos

Buckets principais:

| Bucket | Uso |
|---|---|
| `person-avatars` | Foto principal/avatar de pessoa |
| `historical-files` | Arquivos históricos de pessoa ou relacionamento |

Regras:

- novos arquivos não devem ser salvos como base64;
- base64 legado deve permanecer compatível até auditoria específica;
- `storage_bucket` e `storage_path` devem ser preservados quando disponíveis;
- exclusão física em Storage deve ser tratada com cuidado para evitar remover arquivo ainda referenciado;
- limpeza de órfãos deve seguir `docs/operacao/STORAGE_MAINTENANCE.md`.

---

## 10. Edge Functions e integrações

Edge Functions devem concentrar operações com secrets ou integrações externas sensíveis.

Exemplos de frentes:

- geração/regeneração de insights;
- envio de e-mail via provider configurado;
- rotinas diárias de notificação;
- OAuth/sincronização do Google Calendar.

Regras:

- secrets ficam server-side;
- frontend deve usar `supabase.functions.invoke` ou service dedicado quando aplicável;
- falha de Edge Function deve resultar em mensagem controlada no frontend;
- cron automático depende de configuração operacional externa segura.

---

## 11. Segurança e RLS

Regras permanentes:

- não liberar RLS para corrigir bug de UI sem entender o fluxo de dados;
- não confiar apenas em botão escondido;
- admin deve ser validado por RPC/RLS, não por texto no frontend;
- usuário comum não pode escrever diretamente em dados administrativos ou relacionamento real;
- metadata de favoritos/logs/notificações não deve armazenar segredo, token, telefone completo desnecessário, URL sensível ou base64;
- migrations devem preservar compatibilidade quando houver dados reais.

---

## 12. Ferramentas administrativas de risco

`/admin/migrar-dados` é ferramenta destrutiva.

Regra operacional:

```txt
VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true
```

Mesmo com a flag ativa, o fluxo deve exigir confirmação explícita, como digitar `MIGRAR DADOS`.

Não usar essa ferramenta para manutenção cotidiana ou correção pontual de dados reais sem plano de backup e rollback.

---

## 13. Regras de manutenção

Ao alterar arquitetura:

1. conferir impacto em `routes.tsx`, guards, services e RLS;
2. evitar misturar refatoração visual com alteração de schema;
3. criar migration apenas quando houver mudança real de banco;
4. atualizar `MIGRATIONS_SUPABASE.md` quando houver schema/RLS/RPC nova;
5. atualizar documentos funcionais afetados;
6. rodar validações mínimas:

```bash
npm run build
git diff --check
```

Quando envolver banco:

```bash
supabase migration list
```

Quando envolver testes cobertos:

```bash
npm test
npm run test:e2e
```
