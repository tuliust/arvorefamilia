# Registro técnico consolidado do projeto ArvoreFamilia

**Arquivo principal:** `docs/REGISTRO-TECNICO-IMPLEMENTACOES-2026-05-09.md`  
**Projeto:** `tuliust/arvorefamilia`  
**Data de consolidação:** 2026-05-09  
**Status atual:** migrations versionadas, histórico remoto reparado, dump pré-push gerado, build aprovado e principais divergências documentadas.

> Este documento é a referência operacional principal da rodada de auditoria, correção e consolidação do projeto. O arquivo `docs/ADDENDUM-COMPARACAO-DUMP-REMOTO-MIGRATIONS-2026-05-09.md` fica mantido apenas como complemento histórico e ponteiro para este registro.

---

## 1. Resumo executivo

Durante a rodada de revisão técnica de 2026-05-09, o projeto saiu de um estado com drift relevante entre banco remoto, migrations e documentação para um estado mais controlado:

- as migrations locais foram revisadas e commitadas;
- o banco remoto foi comparado com dumps e consultas diretas;
- divergências críticas em `public.relacionamentos` foram corrigidas em migrations versionadas;
- `public.pessoa_social_profiles` foi oficialmente versionada sem integrar o frontend ainda;
- `public.imagens_pessoa` foi classificada como legado/migrations-only sem uso runtime;
- `public.pessoas_com_estatisticas` foi classificada como view remota legada sem uso runtime;
- `public.pessoas.arquivos_historicos` permanece como coluna legada, sem remoção nesta rodada;
- o histórico de migrations remoto foi alinhado com `supabase migration repair --status applied`;
- `supabase db push` não foi executado porque não era mais necessário após o repair;
- `npm run build` passou ao final da rodada;
- dump manual pré-repair/pré-push foi gerado com sucesso.

Conclusão operacional: **o histórico de migrations Local x Remote está alinhado** e não há migrations pendentes para aplicar no momento.

---

## 2. Stack e arquitetura resumida

O projeto é uma SPA em **React + TypeScript + Vite** para árvore genealógica familiar, usando Supabase para autenticação, banco, RLS, funções RPC, fórum, calendário e integrações.

| Camada | Tecnologia |
|---|---|
| Front-end | React 18 + TypeScript |
| Build/dev server | Vite |
| Roteamento | React Router |
| Backend/BaaS | Supabase |
| Auth | Supabase Auth |
| Banco | Supabase PostgreSQL 17.x no remoto |
| Segurança | RLS + policies + RPCs |
| UI | Tailwind CSS, Radix/shadcn-like components, Lucide |
| Árvore visual | ReactFlow |
| Layout de árvore | Algoritmos internos + Dagre instalado |
| Notificações UI | Sonner |
| Edge/server functions | Supabase Functions, API local `/api/ai` |
| Integrações externas | Google Calendar, OpenAI API |

---

## 3. Estrutura principal do projeto

```text
src/
  app/
    components/
    contexts/
    data/
    lib/
    pages/
    services/
    types/
    utils/
  styles/

supabase/
  migrations/
  functions/
  dumps/          # ignorado no Git
  forum-schema.sql
  google-calendar-schema.sql

api/
  ai.ts

docs/
README.md
ARCHITECTURE.md
DEPLOYMENT.md
MIGRATION-GUIDE.md
```

Arquivos-chave:

| Arquivo | Função |
|---|---|
| `src/main.tsx` | Entrada da aplicação |
| `src/app/App.tsx` | Providers e router |
| `src/app/routes.tsx` | Mapa central de rotas |
| `src/app/contexts/AuthContext.tsx` | Sessão/autenticação Supabase |
| `src/app/components/ProtectedRoute.tsx` | Proteção de rotas admin |
| `src/app/components/MemberRoute.tsx` | Proteção de rotas de membro |
| `src/app/components/TreeAccessRoute.tsx` | Proteção da árvore principal |
| `src/app/services/permissionService.ts` | Checagem de admin/permissões |
| `src/app/services/dataService.ts` | CRUD de pessoas/relacionamentos e funções legadas |
| `src/app/services/arquivosHistoricosService.ts` | CRUD relacional de arquivos históricos |
| `src/app/services/memberProfileService.ts` | Perfis, vínculos e primeiro acesso |
| `src/app/services/forumService.ts` | Fórum familiar |
| `src/app/services/googleCalendarService.ts` | Google Calendar |
| `src/app/lib/supabaseClient.ts` | Cliente Supabase oficial |
| `supabase/migrations/` | Fonte versionada do schema |

---

## 4. Fluxos funcionais principais

### 4.1 Autenticação e primeiro acesso

O projeto usa Supabase Auth. O fluxo de primeiro acesso vincula uma conta autenticada a uma pessoa da árvore.

Objetos relevantes:

- `profiles`;
- `user_person_links`;
- `validate_first_access_code`;
- `ensure_first_access_person_link`;
- `TreeAccessRoute`;
- `MemberRoute`;
- `memberProfileService`.

### 4.2 Admin

O admin é acessado por `/admin` e subrotas. A autorização deixou de depender de e-mail fixo no frontend e passou a usar:

```ts
supabase.rpc('is_admin_user', { target_user_id: user.id })
```

A função consulta `profiles.role = 'admin'`.

Para promover um usuário admin:

```sql
update public.profiles
set role = 'admin'
where id = '<auth_user_id>';
```

> Não registrar IDs reais, tokens, senhas ou connection strings completas em documentação pública.

### 4.3 Fórum

O fórum tem categorias, tópicos, respostas, comentários, reações, denúncias e marcação de solução.

Objetos principais:

- `forum_categorias`;
- `forum_topicos`;
- `forum_respostas`;
- `forum_comentarios`;
- `forum_reacoes`;
- `forum_denuncias`;
- `forum_increment_topic_view`;
- `forum_mark_solution`;
- `forum_is_admin()`.

`forum_is_admin()` foi consolidada para usar:

```sql
select public.is_admin_user(auth.uid());
```

### 4.4 Google Calendar

Integração versionada por migrations, com:

- `google_calendar_connections`;
- `google_calendar_oauth_states`;
- `google_calendar_synced_events`;
- view `google_calendar_connection_status`;
- Edge Functions para OAuth/sync.

Tokens devem ficar restritos a Edge Functions/service role, sem exposição no frontend.

### 4.5 Arquivos históricos

A modelagem correta é **relacional**, não JSONB dentro de `public.pessoas`.

Tabela oficial:

```text
public.arquivos_historicos
```

A coluna antiga:

```text
public.pessoas.arquivos_historicos jsonb
```

permanece no remoto por segurança, mas o frontend atual lê e grava via `public.arquivos_historicos` usando `arquivosHistoricosService`.

### 4.6 Relacionamentos

A lógica de inversos foi centralizada em funções como:

- `getRelacionamentoInversoPayload`;
- `adicionarRelacionamentoComInverso`;
- `encontrarRelacionamentoInverso`;
- `excluirRelacionamentoComInverso`;
- `excluirRelacionamentoPorPayloadComInverso`.

Regras:

| Relação | Inverso esperado |
|---|---|
| `conjuge` A → B | `conjuge` B → A |
| `pai` / `mae` filho → pai/mãe | pai/mãe → filho |
| `irmao` A → B | `irmao` B → A |
| `filho` | só cria inverso se houver informação suficiente para `pai` ou `mae` |

---

## 5. Rotas principais

### Públicas

| Rota | Componente |
|---|---|
| `/entrar` | `Entrar` |
| `/admin/login` | `AdminLogin` |

### Protegidas por `TreeAccessRoute`

| Rota | Componente |
|---|---|
| `/` | `Home` |

### Protegidas por `MemberRoute`

| Rota | Componente |
|---|---|
| `/minha-arvore` | `MinhaArvore` |
| `/meus-dados` | `MeusDados` |
| `/meus-vinculos` | `MeusVinculos` |
| `/vincular-perfil` | `VincularPerfil` |
| `/pessoa/:id` | `PersonProfile` |
| `/pessoas/:id` | `PersonProfile` |
| `/calendario-familiar` | `CalendarioFamiliar` |
| `/meus-favoritos` | `MeusFavoritos` |
| `/notificacoes` | `CentralNotificacoes` |
| `/forum` | `ForumHome` |
| `/forum/novo` | `ForumNovoTopico` |
| `/forum/topico/:id` | `ForumTopico` |
| `/forum/topico/:id/editar` | `ForumEditarTopico` |

### Protegidas por `ProtectedRoute`

| Rota | Componente |
|---|---|
| `/admin` | `AdminDashboard` |
| `/admin/dashboard` | `AdminDashboard` |
| `/admin/pessoas` | `AdminPessoas` |
| `/admin/pessoas/nova` | `AdminPessoaForm` |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` |
| `/admin/pessoas/:id` | `AdminPessoaForm` |
| `/admin/relacionamentos` | `AdminRelacionamentos` |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` |
| `/admin/importacao` | `AdminImportacao` |
| `/admin/migrar-dados` | `AdminMigrarDados` |
| `/admin/diagnostico` | `AdminDiagnostico` |

---

## 6. Banco de dados e Supabase

### 6.1 Tabelas e objetos principais

#### Core familiar

- `pessoas`;
- `relacionamentos`;
- `arquivos_historicos`;
- `pessoa_social_profiles`;
- `imagens_pessoa` aparece em migration antiga, mas não existe no remoto e não tem uso runtime atual.

#### Auth/perfil/membros

- `profiles`;
- `user_person_links`.

#### Engajamento/eventos

- `user_favorites`;
- `notification_preferences`;
- `notifications`;
- `family_events`;
- `event_attendees`.

#### Fórum

- `forum_categorias`;
- `forum_topicos`;
- `forum_respostas`;
- `forum_comentarios`;
- `forum_reacoes`;
- `forum_denuncias`.

#### Google Calendar

- `google_calendar_connections`;
- `google_calendar_oauth_states`;
- `google_calendar_synced_events`;
- view `google_calendar_connection_status`.

#### Views legadas/remotas

- `pessoas_com_estatisticas` existe no remoto, mas não há uso runtime atual no app.

### 6.2 RLS e policies

Foi confirmado que RLS está habilitado nas tabelas centrais, fórum, Google Calendar, perfis, favoritos, notificações, vínculos e `pessoa_social_profiles`.

Policies antigas permissivas foram removidas de:

- `public.pessoas`;
- `public.arquivos_historicos`;
- `public.relacionamentos`.

Depois da consolidação, as policies relevantes passam a depender de:

- role `authenticated`;
- `public.is_admin_user(auth.uid())`;
- vínculo em `user_person_links`;
- regras específicas de visibilidade, como `exibir_no_perfil = true` em `pessoa_social_profiles`.

### 6.3 Funções/RPCs importantes

| Função | Finalidade |
|---|---|
| `is_admin_user(target_user_id uuid)` | Verifica se `profiles.role = 'admin'` |
| `forum_is_admin()` | Admin do fórum via `is_admin_user(auth.uid())` |
| `forum_increment_topic_view(topic_id uuid)` | Incrementa visualização de tópico |
| `forum_mark_solution(target_topico_id uuid, target_resposta_id uuid)` | Marca solução no fórum |
| `validate_first_access_code(access_code uuid)` | Valida primeiro acesso |
| `ensure_first_access_person_link(target_pessoa_id uuid)` | Cria vínculo usuário-pessoa |
| `update_updated_at_column()` | Atualiza `updated_at` em triggers |

---

## 7. Migrations consolidadas

### 7.1 Migrations principais da rodada anterior

| Migration | Objetivo |
|---|---|
| `20260509100000_add_forum_schema.sql` | Versionar schema do fórum |
| `20260509100100_add_google_calendar_schema.sql` | Versionar Google Calendar |
| `20260509100200_enable_rls_core_family_tables.sql` | Habilitar RLS core e policies seguras |
| `20260509100300_use_profile_role_for_forum_admin.sql` | Remover admin de fórum por e-mail fixo |
| `20260509100400_remove_legacy_public_core_policies.sql` | Remover policies antigas/permissivas de `pessoas` e `arquivos_historicos` |
| `20260509100500_migrate_legacy_pessoas_arquivos_historicos.sql` | Migrar JSONB legado para tabela relacional |

### 7.2 Migrations criadas nesta conversa

| Migration | Objetivo | Status |
|---|---|---|
| `20260509100600_remove_legacy_relacionamentos_policies.sql` | Remove policies legadas permissivas de `public.relacionamentos` | Criada, commitada e marcada como aplicada no remoto |
| `20260509100700_align_relacionamentos_schema.sql` | Alinha schema de `public.relacionamentos` | Criada, commitada e marcada como aplicada no remoto |
| `20260509100800_version_pessoa_social_profiles.sql` | Versiona `public.pessoa_social_profiles` com RLS/policies | Criada, commitada e marcada como aplicada no remoto |

### 7.3 Histórico remoto reparado

Foi executado `supabase migration repair --status applied` para alinhar o histórico remoto às migrations locais que já tinham seus efeitos presentes no banco remoto.

Versões reparadas como `applied`:

```text
20260422
20260503133000
20260509100000
20260509100100
20260509100200
20260509100300
20260509100400
20260509100500
20260509100600
20260509100700
20260509100800
```

Após o repair, `supabase migration list` mostrou Local e Remote alinhados:

```text
20260422       | 20260422
20260423       | 20260423
20260503095032 | 20260503095032
20260503105949 | 20260503105949
20260503123000 | 20260503123000
20260503124500 | 20260503124500
20260503133000 | 20260503133000
20260509100000 | 20260509100000
20260509100100 | 20260509100100
20260509100200 | 20260509100200
20260509100300 | 20260509100300
20260509100400 | 20260509100400
20260509100500 | 20260509100500
20260509100600 | 20260509100600
20260509100700 | 20260509100700
20260509100800 | 20260509100800
```

Conclusão: **não havia mais necessidade de executar `supabase db push`**.

---

## 8. Correções detalhadas realizadas

### 8.1 `public.relacionamentos` — policies legadas removidas

Antes havia policies permissivas `{public}` com `USING true` / `WITH CHECK true`:

- `Permitir leitura pública de relacionamentos`;
- `Permitir inserção de relacionamentos via service role`;
- `Permitir atualização de relacionamentos via service role`;
- `Permitir deleção de relacionamentos via service role`.

Foi criada a migration:

```text
supabase/migrations/20260509100600_remove_legacy_relacionamentos_policies.sql
```

Conteúdo essencial:

```sql
drop policy if exists "Permitir leitura pública de relacionamentos" on public.relacionamentos;
drop policy if exists "Permitir inserção de relacionamentos via service role" on public.relacionamentos;
drop policy if exists "Permitir atualização de relacionamentos via service role" on public.relacionamentos;
drop policy if exists "Permitir deleção de relacionamentos via service role" on public.relacionamentos;
```

Estado final esperado das policies:

| Policy | Papel |
|---|---|
| `authenticated users can read relacionamentos` | leitura para autenticados |
| `admins can insert relacionamentos` | insert apenas admin |
| `admins can update relacionamentos` | update apenas admin |
| `admins can delete relacionamentos` | delete apenas admin |

### 8.2 `public.relacionamentos` — schema alinhado

Diagnóstico remoto anterior indicava ausência das colunas:

- `ativo`;
- `data_casamento`;
- `data_separacao`;
- `local_casamento`;
- `local_separacao`;
- `observacoes`.

Também havia divergência em:

- check de `subtipo_relacionamento`;
- unique constraint sem considerar subtipo.

Foi criada a migration:

```text
supabase/migrations/20260509100700_align_relacionamentos_schema.sql
```

Ela:

- adiciona colunas ausentes com `add column if not exists`;
- amplia `subtipo_relacionamento` para aceitar `sangue`, `adotivo`, `casamento`, `uniao_estavel`, `uniao`, `separado`;
- troca a unicidade antiga por índice único considerando `coalesce(subtipo_relacionamento, '')`.

Estado final esperado:

```text
id
pessoa_origem_id
pessoa_destino_id
tipo_relacionamento
subtipo_relacionamento
created_at
updated_at
ativo
data_casamento
data_separacao
local_casamento
local_separacao
observacoes
```

### 8.3 `public.pessoa_social_profiles` versionada

Diagnóstico:

- tabela existia no remoto;
- `count(*) = 0`;
- não havia uso runtime no frontend;
- havia intenção futura em comentário de `MeusDados.tsx`.

Decisão: **versionar agora**, sem refatorar frontend e sem remover os campos atuais em `public.pessoas`.

Foi criada a migration:

```text
supabase/migrations/20260509100800_version_pessoa_social_profiles.sql
```

Ela:

- cria tabela se não existir;
- garante colunas esperadas;
- cria FK para `public.pessoas(id)`;
- cria índices;
- cria trigger de `updated_at`;
- ativa RLS;
- cria policies para admin, leitura autenticada de perfis exibíveis e usuários vinculados.

Frontend atual ainda usa campos diretos em `public.pessoas`, como:

- `rede_social`;
- `instagram_usuario`;
- `instagram_url`;
- `permitir_exibir_instagram`.

### 8.4 `public.imagens_pessoa` não foi criada

Diagnóstico:

- não existe no remoto;
- aparece em migration antiga/documentação;
- não há uso runtime atual;
- o app usa `public.arquivos_historicos`, `public.pessoas.foto_principal_url`, Supabase Storage `person-avatars` e `profiles.avatar_url`.

Decisão: **não criar migration agora**.

Motivo: criar a tabela apenas para igualar uma migration antiga aumentaria a superfície de schema sem consumidor real.

### 8.5 `public.pessoas_com_estatisticas` não foi versionada

Diagnóstico:

- view existe no remoto;
- retorna dados;
- possui colunas de `pessoas` mais totais como `total_conjuges`, `total_filhos`, `total_pais`, `total_arquivos`;
- não há uso runtime atual;
- `Home.tsx`, `AdminDashboard.tsx` e endpoint legado calculam estatísticas por consultas diretas/cálculo local.

Decisão: **não versionar agora**.

Risco aceito: ambientes recriados do zero não terão a view, mas o runtime atual não depende dela.

### 8.6 `public.pessoas.arquivos_historicos` mantida

Diagnóstico:

- runtime atual usa `public.arquivos_historicos`;
- `arquivosHistoricosService` lê, insere, atualiza e remove na tabela relacional;
- `PersonProfile`, `AdminPessoaForm` e `MeusVinculos` usam o service relacional;
- `PESSOA_COLUMNS` em `dataService.ts` não inclui `arquivos_historicos`;
- `Pessoa.arquivos_historicos` ainda existe como tipo/estado local para UI, não como contrato de persistência direta em `public.pessoas`.

Resultado remoto via consulta disponível ao app:

- `pessoas_com_json_legado = 0`;
- `total_arquivos_relacionais = 0`;
- nenhuma linha com JSON legado não vazio.

Decisão: **não remover a coluna nesta rodada**.

Motivo: a consulta administrativa via SQL Editor ainda deve ser confirmada antes de qualquer `drop column`, e `total_arquivos_relacionais = 0` precisa ser validado visualmente para confirmar se não há arquivos esperados em produção.

---

## 9. Dumps e backup manual

### 9.1 Dump antigo

Foi identificado um dump anterior válido:

```text
supabase/dumps/supabase_schema_remote_20260509043321.sql
```

Tamanho aproximado: 65 KB.

### 9.2 Dump pré-repair/pré-push gerado nesta conversa

O comando `supabase db dump --linked` falhou inicialmente por DNS/host:

```text
pg_dump: error: could not translate host name "db.jimymkzejbhuseozunxl.supabase.co" to address
```

Foi usado então `pg_dump` via Docker com `postgres:17`, porque o servidor remoto estava em PostgreSQL 17.6 e `postgres:16` gerou mismatch:

```text
server version: 17.6; pg_dump version: 16.13
```

Dump válido final:

```text
supabase/dumps/supabase_schema_before_push_20260509062036.sql
```

Tamanho aproximado: 3.9 MB.

O arquivo termina com:

```text
-- PostgreSQL database dump complete
```

### 9.3 Segurança de dumps

Dumps não devem ser commitados. Manter:

```text
supabase/dumps/*.sql
```

no `.gitignore`.

---

## 10. Validações realizadas

### 10.1 Git

Estado final informado:

```text
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

### 10.2 Build

`npm run build` passou.

Aviso conhecido e não bloqueante:

```text
Some chunks are larger than 500 kB after minification.
```

Arquivo JS principal observado:

```text
dist/assets/index-ltHzxJRt.js   1,147.49 kB │ gzip: 330.34 kB
```

### 10.3 Migrations

Após `supabase migration repair`, `supabase migration list` mostrou Local e Remote alinhados para todas as versões locais.

### 10.4 Banco remoto

Foi confirmado por dump/diagnósticos:

- fórum presente no remoto;
- Google Calendar presente no remoto;
- RLS/policies centrais presentes;
- `forum_is_admin()` usando `public.is_admin_user(auth.uid())`;
- `pessoa_social_profiles` presente;
- `relacionamentos` com schema/policies alinhados;
- `pessoas_com_estatisticas` existe no remoto, mas não é usada pelo runtime;
- `imagens_pessoa` não existe no remoto e não é usada pelo runtime.

---

## 11. Comandos úteis

### Rodar projeto

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Git

```bash
git status
git add .
git commit -m "Mensagem do commit"
git push origin main
```

### Supabase link

```bash
supabase login
supabase link --project-ref jimymkzejbhuseozunxl
supabase migration list
```

### Dump manual via Docker/Postgres 17

Usar variável de ambiente local, sem commitar e sem expor senha:

```bash
export SUPABASE_DB_URL='postgresql://postgres.<project-ref>:<senha-url-encoded>@<host-pooler>:5432/postgres'
```

Gerar dump:

```bash
mkdir -p supabase/dumps

docker run --rm postgres:17 \
  pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  > supabase/dumps/supabase_schema_before_push_$(date +%Y%m%d%H%M%S).sql
```

Conferir:

```bash
LATEST_DUMP=$(ls -t supabase/dumps/supabase_schema_before_push_*.sql | head -n 1)
echo "$LATEST_DUMP"
ls -lh "$LATEST_DUMP"
tail -n 20 "$LATEST_DUMP"
```

### Repair de migrations

Usado quando o schema já está aplicado no remoto, mas o histórico `supabase_migrations` está desalinhado:

```bash
supabase migration repair --status applied <version>
supabase migration list
```

Não usar `repair` para mascarar migrations não aplicadas. Nesta rodada, ele foi usado porque o dump indicou que os efeitos já existiam no remoto.

### Auditar RLS

```sql
select
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
```

### Auditar policies

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Auditar funções sensíveis

```sql
select
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_admin_user',
    'forum_is_admin',
    'forum_increment_topic_view',
    'forum_mark_solution',
    'validate_first_access_code',
    'ensure_first_access_person_link'
  )
order by p.proname;
```

---

## 12. Testes manuais ainda necessários

Antes de tratar como produção estável, executar testes funcionais no app.

### Admin

- usuário com `profiles.role = 'admin'` acessa `/admin`;
- usuário comum é bloqueado em `/admin`;
- fallback por e-mail não libera acesso;
- `/admin/dashboard` carrega métricas;
- logout encerra sessão.

### RLS

- usuário anônimo não lê dados protegidos;
- usuário autenticado lê o que deve ler;
- usuário comum não cria/deleta `pessoas`;
- usuário comum não cria/deleta `relacionamentos`;
- admin cria/edita/deleta;
- usuário vinculado edita apenas a própria pessoa.

### Relacionamentos

- criar cônjuge cria inverso;
- excluir cônjuge remove inverso;
- criar pai/mãe cria filho inverso;
- irmão cria inverso;
- relação `filho` sem contexto não inventa `pai`/`mae`;
- duplicidade é tratada sem quebrar UX.

### Arquivos históricos

- confirmar se há ou não arquivos esperados em produção;
- perfil exibe arquivos esperados;
- admin adiciona/remove arquivo;
- usuário vinculado edita arquivo próprio;
- usuário comum não edita arquivo de outro;
- confirmar via SQL Editor se `pessoas.arquivos_historicos` está realmente vazio/sem conteúdo útil antes de futura remoção.

### Fórum

- listar categorias;
- criar tópico;
- editar tópico próprio;
- responder;
- comentar;
- reagir;
- marcar solução;
- admin modera;
- usuário comum não acessa dados restritos de denúncia/admin.

### Google Calendar

- view `google_calendar_connection_status` responde;
- fluxo OAuth funciona;
- sync funciona;
- tokens não aparecem no frontend.

### Migração destrutiva

- `/admin/migrar-dados` fica bloqueado em produção;
- local só libera com frase exata e variável adequada;
- ferramenta não é executada acidentalmente.

---

## 13. Pendências e próximos passos

### Alta prioridade

1. **Executar testes manuais funcionais** em admin, RLS, relacionamentos, arquivos históricos, fórum e Google Calendar.
2. **Confirmar no Supabase SQL Editor** a situação de `public.pessoas.arquivos_historicos` antes de qualquer remoção futura.
3. **Validar visualmente arquivos históricos**: o diagnóstico retornou `total_arquivos_relacionais = 0` via API disponível ao app; confirmar se isso é esperado para produção.
4. **Manter rotina de dump manual** antes de futuras alterações de schema.

### Média prioridade

1. Criar migration futura para remover `public.pessoas.arquivos_historicos` somente se:
   - SQL administrativo confirmar ausência de dados úteis;
   - testes visuais confirmarem que nada depende da coluna;
   - houver dump recente.
2. Decidir se `public.pessoas_com_estatisticas` deve ser removida futuramente ou formalmente documentada como legado remoto.
3. Decidir se `imagens_pessoa` deve ser removida/aposentada das migrations futuras ou apenas mantida como histórico antigo.
4. Planejar refatoração futura de redes sociais para `pessoa_social_profiles`, se a funcionalidade evoluir.
5. Atualizar `MIGRATION-GUIDE.md` com o fluxo correto de dump, repair e validação.
6. Arquivar scripts SQL legados em `docs/legacy` ou `sql/legacy`.

### Baixa/média prioridade

1. Migrar favoritos de `localStorage` para Supabase, se ainda aplicável.
2. Migrar notificações de `localStorage` para Supabase, se ainda aplicável.
3. Remover `DEFAULT_USER_ID = demo-user`, se ainda existir.
4. Migrar upload admin para Supabase Storage de forma estruturada.
5. Refatorar `dataService.ts`, `forumService.ts` e `memberProfileService.ts`.
6. Reduzir acoplamento de `Home.tsx`.
7. Separar componentes inline do fórum.
8. Criar matriz de funcionalidades: público / membro / admin / legado / experimental.
9. Padronizar tratamento de erro dos services.
10. Criar testes automatizados.
11. Avaliar code splitting para reduzir o aviso de bundle acima de 500 kB.

---

## 14. Pontos de atenção permanentes

### 14.1 Não usar `supabase db push` sem revisar `migration list`

Antes de qualquer push:

```bash
git status
npm run build
supabase migration list
```

Se houver Local sem Remote, revisar se a migration deve ser aplicada ou se o schema já existe e exige `migration repair`.

### 14.2 Diffs e dumps

- Sempre gerar dump antes de alteração estrutural.
- Não commitar dumps.
- Validar fim do dump com `-- PostgreSQL database dump complete`.
- Usar `postgres:17` via Docker se o banco remoto estiver em PostgreSQL 17.x.

### 14.3 Dados sensíveis

Nunca registrar em docs públicas:

- senha do banco;
- service role key;
- tokens Google;
- tokens OpenAI;
- connection strings completas;
- IDs reais de usuários, salvo documentação privada;
- links temporários de login/autenticação.

Se uma senha ou token for exposto acidentalmente, rotacionar/revogar no provedor correspondente.

### 14.4 Scripts legados

Arquivos como:

- `database-schema.sql`;
- `SETUP-BANCO-DADOS.md`;
- `supabase/forum-schema.sql`;
- `supabase/google-calendar-schema.sql`;
- `src/imports/pasted_text/*`;
- relatórios antigos de diagnóstico;

podem conter definições históricas que não representam o contrato runtime atual. Tratar como legado até revisão formal.

---

## 15. Estado final da rodada

Estado final informado:

- Git limpo e sincronizado com `origin/main`;
- build aprovado;
- dump manual válido gerado;
- migrations Local x Remote alinhadas;
- `supabase db push` não necessário;
- divergências críticas documentadas e classificadas;
- próximos passos definidos.

Resumo final:

| Área | Estado |
|---|---|
| Admin por role | Consolidado |
| RLS core | Consolidado, requer testes manuais |
| Relacionamentos | Policies e schema alinhados |
| Arquivos históricos | Runtime relacional; coluna legada mantida |
| Fórum | Versionado e reparado no histórico remoto |
| Google Calendar | Versionado e reparado no histórico remoto |
| `pessoa_social_profiles` | Versionada, ainda sem uso runtime |
| `imagens_pessoa` | Legado/migrations-only; não criar agora |
| `pessoas_com_estatisticas` | View remota legada; não versionar agora |
| Migrations | Local e Remote alinhadas |
| Próximo passo | Testes manuais funcionais e validação administrativa de arquivos históricos |
