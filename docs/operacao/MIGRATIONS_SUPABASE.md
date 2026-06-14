# Migrations Supabase

> Última revisão: 2026-06-14
> Local canônico: `docs/operacao/MIGRATIONS_SUPABASE.md`
> Tipo: documentação operacional.

## Objetivo

Este documento define o fluxo seguro para trabalhar com migrations, schema Supabase, scripts SQL legados, RLS, RPCs, triggers, Edge Functions e alterações de banco no projeto **Árvore Família**.

Use este arquivo antes de:

- criar ou editar migration;
- rodar `supabase db reset`, `supabase db push` ou `supabase migration repair`;
- investigar divergência entre schema local e remoto;
- aplicar alteração que impacte RLS, constraints, RPCs, triggers ou Edge Functions;
- decidir se um SQL solto deve virar migration, permanecer histórico ou ser removido;
- auditar objetos legados ou limpar dados.

Este documento não substitui:

- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`: modelo lógico de tabelas, views e fluxos;
- `docs/GUIA_CORRECAO_ERROS.md`: troubleshooting por sintoma;
- `docs/funcionalidades/NOTIFICACOES.md`: arquitetura funcional de notificações;
- `docs/operacao/STORAGE_MAINTENANCE.md`: manutenção de Storage;
- `docs/PLANO_PROXIMOS_PASSOS.md`: pendências reais identificadas na revisão documental.

---

## 1. Regra principal

```txt
supabase/migrations é a fonte da verdade do schema.
```

Scripts SQL soltos podem existir como histórico, diagnóstico, operação pontual, dry-run ou referência, mas não substituem migrations em ambientes novos.

Não aplicar como schema principal:

```txt
database-schema.sql
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
scripts SQL antigos fora de `supabase/migrations/`
scripts SQL removidos de `docs/historico/sql-legado/` ou `docs/historico/documentacao-antiga/`
```

---

## 2. Pastas e arquivos relevantes

```txt
supabase/migrations/                 migrations oficiais
supabase/functions/                  Edge Functions
supabase/config.toml                 configuração local Supabase
docs/operacao/MIGRATIONS_SUPABASE.md operação de migrations
docs/operacao/STORAGE_MAINTENANCE.md Storage e limpeza auditada
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md modelo lógico
docs/GUIA_CORRECAO_ERROS.md          investigação por sintoma
docs/funcionalidades/NOTIFICACOES.md notificações
docs/funcionalidades/FORUM.md        fórum
```

---

## 3. Checklist antes de alterar banco

Antes de qualquer alteração de schema:

```bash
git status --short
npm run build
npm test
git diff --check
supabase migration list
```

Perguntas obrigatórias:

| Pergunta | Motivo |
|---|---|
| A alteração realmente exige banco? | Ajuste visual não deve gerar migration. |
| A coluna/tabela/RPC já existe? | Evita duplicidade de schema. |
| O ambiente remoto está alinhado com local? | Evita push no alvo errado. |
| Há risco de perda de dados? | Exige backup/rollback. |
| O frontend já envia payload para a nova coluna? | Deploy deve respeitar ordem banco → frontend. |
| A alteração foi feita manualmente no painel Supabase? | Se sim, criar migration para alinhar local/remoto. |
| RLS precisa ser criada ou revista? | Evita abertura indevida. |
| Há constraint nova? | Pode exigir deduplicação prévia. |
| Há Edge Function ou service role envolvidos? | Secrets não podem ir para frontend/repositório. |

Regra:

```txt
Não criar migration para mudança puramente visual.
```

---

## 3.1 Mudanças visuais que não exigem migration

Os ajustes abaixo são documentados como mudanças de UI/componente e não devem gerar alteração de schema:

| Ajuste | Motivo |
|---|---|
| Remover badge **VOCÊ** do card principal mobile | Alteração visual em `MobileFamilyTreeView` |
| Exibir apenas ano nos cards mobile | Formatação de dados já existentes |
| Corrigir conectores mobile entre ancestrais, Pai/Mãe e pessoa central | Estrutura visual HTML/CSS/SVG |
| Ajustar fallback visual de avatar sem foto (`User` para pessoa, `PawPrint` para pet) | Lógica frontend/visual, sem schema |
| Criar ou ajustar `MobileFamilyHorizontalMapView` | Nova composição visual mobile, sem alteração de dados |
| Exibir `/mapa-familiar-horizontal` mobile com uma geração por tela | Organização visual de dados já existentes |
| Trocar barra `Paterno | Central | Materno` da horizontal mobile por navegação por gerações | UX/navegação de tela, sem schema |
| Transformar painel mobile dos mapas em modal de controles | UI e CSS, sem schema |
| Remover fundo sólido da horizontal e usar fundo transparente | CSS/visual |
| Atualizar exportação visual HTML/CSS/SVG | Captura client-side, sem banco |
| Ajustar microcopy pública de OAuth/Google Agenda em `/entrar` | Conteúdo estático de página, sem impacto de banco |

Observação:

- `public.pessoas.genero` já possui migration versionada em `20260611003558_add_genero_to_pessoas.sql`;
- `public.pessoas.complemento` já possui migration versionada em `20260611013000_add_complemento_to_pessoas.sql`;
- não criar migration para SVGs, componentes, espaçamentos, labels, conectores, modal, paletas ou formatação de ano;
- criar migration apenas quando houver coluna, tabela, índice, constraint, policy, RPC, trigger, bucket/policy ou Edge Function dependente de schema.

---

## 4. Criar migration

Comando:

```bash
supabase migration new nome_descritivo_da_alteracao
```

Exemplo:

```txt
20260522121000_add_historical_file_event_category.sql
```

Boas práticas:

- usar nome específico;
- comentar SQL complexo;
- preferir `create ... if not exists`, `drop policy if exists` e `create or replace function` quando seguro;
- revisar locks, índices e dados existentes;
- deduplicar dados antes de `add constraint unique`;
- revisar RLS em toda tabela sensível;
- usar booleano real `true`/`false`, não string `'TRUE'`/`'FALSE'`;
- separar limpeza de dados destrutiva de alterações simples de schema.

---

## 5. Aplicar localmente

Fluxo recomendado para ambiente local descartável:

```bash
supabase migration list
supabase db reset
npm run build
npm test
git diff --check
```

Quando `db reset` puder destruir dados locais úteis, fazer backup ou usar fluxo controlado:

```bash
supabase migration list
supabase db push
npm run build
git diff --check
```

---

## 6. Aplicar remotamente

Antes:

```bash
git status --short
supabase migration list
```

Aplicar somente com autorização explícita:

```bash
supabase db push
```

Depois:

```bash
supabase migration list
npm run build
npm test
npm run test:e2e
git diff --check
```

Regras:

- não rodar `supabase db push` em produção sem backup, revisão do SQL e confirmação do alvo;
- aplicar migration antes do deploy frontend quando o frontend depende de nova coluna/RPC;
- não remover campo do payload para mascarar ambiente remoto desatualizado;
- monitorar erros de PostgREST/schema cache depois do push.

---

## 7. `migration repair`

Usar apenas quando:

- a migration já foi aplicada manualmente;
- o schema remoto comprovadamente reflete o SQL da migration;
- o histórico do Supabase ficou divergente;
- houve auditoria do SQL e registro da decisão.

Não usar para:

- mascarar migration não aplicada;
- pular erro de SQL;
- esconder diferença entre local e remoto;
- evitar backup ou QA.

---

## 8. Schema cache do Supabase/PostgREST

Sintomas comuns:

- coluna recém-criada não aparece para o frontend;
- insert/update falha com coluna inexistente;
- RPC corrigida continua parecendo antiga;
- migration aplicada, mas PostgREST ainda rejeita payload.

Fluxo de investigação:

1. confirmar `supabase migration list`;
2. confirmar se a coluna/RPC existe no banco;
3. aguardar/recarregar schema cache;
4. testar novamente;
5. evitar alterar frontend para contornar cache temporário.

Exemplos conhecidos:

```txt
public.arquivos_historicos.categoria_evento
public.admin_reset_person_profile(target_pessoa_id uuid)
public.pessoas.genero
```

Se a migration já foi aplicada, não remover `categoria_evento` do payload nem alterar o frontend para mascarar cache/ambiente atrasado. Para RPCs, confirmar assinatura, `grant execute` e recarregamento do schema cache.

---

## 9. Migrations recentes relevantes

Regra de leitura desta seção:

```txt
As migrations abaixo são relevantes para operação de banco.
Elas não devem ser confundidas com os ajustes recentes de Mapa Familiar mobile, que foram frontend/CSS/documentação.
```

### `20260611013000_add_complemento_to_pessoas.sql`

Escopo:

- adiciona `complemento text` em `public.pessoas` de forma idempotente;
- documenta a coluna como complemento manual de endereço;
- não cria índice, constraint ou RLS própria, pois o campo usa a mesma linha e permissões de `pessoas`.

Uso funcional:

- `endereco` continua sendo o endereço principal, preenchido ou normalizado pelo Google Places quando configurado;
- `complemento` guarda informação manual como apartamento, bloco, torre, casa ou referência interna;
- selecionar novo endereço via Google Places deve atualizar apenas `endereco`, sem apagar `complemento`;
- o campo é editado nos fluxos de dados próprios, incluindo `/meus-dados` e `/minha-arvore/editar`.

SQL útil para verificar:

```sql
select table_schema, table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'pessoas'
  and column_name = 'complemento';
```

Sintoma se ausente:

```txt
update em pessoas falha quando o frontend envia complemento no payload,
ou o campo aparece na UI mas não persiste após recarregar.
```

Observação operacional:

```txt
Esta coluna foi aplicada manualmente no Supabase antes de ser versionada.
A migration existe para manter ambientes futuros e histórico local/remoto alinhados.
```

---

### `20260611003558_add_genero_to_pessoas.sql`

Escopo:

- adiciona `genero text` em `public.pessoas` de forma idempotente;
- documenta a coluna como metadado opcional de pessoa;
- cria índice parcial `idx_pessoas_genero` quando `genero` não é nulo/vazio.

Uso funcional atual:

- `genero` pode permanecer como dado cadastral/compatibilidade;
- a regra visual vigente dos cards não exige avatar diferente por gênero;
- pessoa humana sem foto usa fallback `User`;
- pet sem foto usa fallback `PawPrint`;
- `humano_ou_pet` continua sendo o campo semântico principal para regras de pessoa/pet.

SQL útil para verificar:

```sql
select table_schema, table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'pessoas'
  and column_name = 'genero';
```

Sintoma se ausente:

```txt
Ambiente novo sem coluna genero pode perder compatibilidade com cadastros que preencham esse metadado, mas não deve quebrar a árvore nem o fallback visual atual de avatares.
```

---

### `20260522121000_add_historical_file_event_category.sql`

Escopo:

- adiciona `categoria_evento` em `public.arquivos_historicos`;
- cria check constraint para categorias históricas;
- deve ser aplicada antes de deploy que envie `categoria_evento` no payload.

Categorias aceitas:

```txt
certidao_nascimento
certidao_casamento
alistamento_militar
imigracao
divorcio
carreira_profissional
mudanca_cidade
certidao_obito
outro
```

Sintoma se ausente:

```txt
insert/update em arquivos_historicos falha porque categoria_evento não existe.
```

---

### `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`

Escopo:

- cria/corrige RPC `admin_list_profiles_for_linking`;
- usa `security definer`;
- bloqueia execução se `is_admin_user(auth.uid())` for falso;
- concede execução a `authenticated`.

Fluxos impactados:

- card de usuários vinculados no admin de pessoa;
- seleção de usuário para vínculo;
- remoção de fallback inseguro de consulta direta a `profiles`.

---

### `20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql`

Escopo:

- altera defaults booleanos de privacidade/contato em `pessoas` para `true`;
- cria/atualiza RPC `admin_reset_person_profile(target_pessoa_id uuid)`;
- permite reset administrativo controlado de dados complementares;
- não remove relacionamentos familiares.

Campos com default `true`:

```txt
permitir_exibir_instagram
permitir_mensagens_whatsapp
permitir_exibir_data_nascimento
permitir_exibir_endereco
permitir_exibir_telefone
```

A RPC:

- exige admin por `is_admin_user(auth.uid())`;
- zera `foto_principal_url`;
- remove insights gerados de astrologia/acontecimentos;
- remove favoritos da pessoa;
- reseta preferências de notificação dos usuários vinculados;
- preserva `relacionamentos`.

SQL útil para verificar defaults:

```sql
select column_name, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'pessoas'
  and column_name in (
    'permitir_exibir_instagram',
    'permitir_mensagens_whatsapp',
    'permitir_exibir_data_nascimento',
    'permitir_exibir_endereco',
    'permitir_exibir_telefone'
  )
order by column_name;
```

---

### `20260609193000_ensure_admin_reset_person_profile.sql`

Escopo:

- reforça de forma idempotente a criação da RPC `admin_reset_person_profile(target_pessoa_id uuid)`;
- reaplica defaults `true` de privacidade/contato em `pessoas`;
- concede `grant execute` para `authenticated`;
- executa `notify pgrst, 'reload schema';` para forçar recarregamento do schema cache do PostgREST.

Quando usar/validar:

- erro `PGRST202` ao chamar `rpc('admin_reset_person_profile')`;
- mensagem `Could not find the function public.admin_reset_person_profile(target_pessoa_id) in the schema cache`;
- ambiente remoto sem a RPC apesar de o frontend já chamar a função;
- suspeita de schema cache desatualizado após deploy/migration.

Regra: essa migration não substitui auditoria do ambiente. Confirmar o alvo do Supabase antes de aplicar `supabase db push`.

---

### `20260608143000_create_person_profile_suggestions.sql`

Escopo:

- cria `person_profile_suggestions`;
- permite sugestões de informações por usuário autenticado;
- permite leitura pelo solicitante ou admin;
- permite revisão por admin;
- usa trigger `update_updated_at_column`.

Fluxos impactados:

- `/pessoa/:id`;
- botão **Inserir Informações** quando o usuário não pode editar diretamente;
- revisão em `/admin/solicitacoes-vinculos`.

Regras:

- sugestão não altera dado real sem revisão quando o usuário não tem permissão direta;
- metadata/texto da sugestão deve ser mínimo e sem segredo;
- RLS não deve ser substituída por validação visual.

---

### `20260608180000_enforce_single_forum_reaction.sql`

Escopo:

- deduplica reações antigas, mantendo a mais recente por `user_id + alvo_tipo + alvo_id`;
- remove constraint antiga por `user_id + alvo_tipo + alvo_id + tipo`;
- cria constraint única por `user_id + alvo_tipo + alvo_id`.

Constraint esperada:

```txt
forum_reacoes_user_id_alvo_tipo_alvo_id_key
```

Regra funcional:

- usuário pode ter no máximo uma reação por tópico, resposta ou comentário;
- escolher reação diferente substitui a anterior;
- clicar novamente na mesma reação remove.

SQL de verificação:

```sql
select user_id, alvo_tipo, alvo_id, count(*)
from public.forum_reacoes
group by user_id, alvo_tipo, alvo_id
having count(*) > 1;
```

Se retornar linhas após a migration, a constraint não foi aplicada corretamente ou houve inserção manual inconsistente.

---


## 10. RLS e permissões

Ao criar ou alterar tabela sensível, revisar RLS.

Tabelas sensíveis:

```txt
profiles
user_person_links
pessoas
relacionamentos
relationship_change_requests
person_profile_suggestions
activity_logs
notificacoes_usuario
preferencias_notificacao
google_calendar_connections
arquivos_historicos
person_events
person_generated_insights
user_favorites
forum_topicos
forum_respostas
forum_comentarios
forum_reacoes
forum_denuncias
forum_topico_pessoas
```

Checklist:

- `select` de usuário comum está restrito ao escopo permitido?
- `insert/update/delete` exigem dono, vínculo ou admin?
- admin usa policy adequada ou RPC segura?
- service role fica apenas em Edge Function/server-side?
- usuário comum não consegue alterar relacionamento real diretamente?
- solicitações usam `relationship_change_requests` ou `person_profile_suggestions`?
- notificações para terceiros são criadas por fluxo controlado?
- fórum impede alteração indevida de conteúdo alheio?

---

## 11. RPCs

RPCs sensíveis devem:

- validar admin ou dono internamente;
- usar `security definer` apenas quando necessário;
- definir `set search_path = public`;
- receber parâmetros explícitos;
- evitar retornar dados além do necessário;
- ter `grant execute` mínimo.

RPCs citadas na documentação atual:

```txt
is_admin_user
admin_list_profiles_for_linking
admin_reset_person_profile
```

Ao corrigir RPC:

1. versionar como migration;
2. revisar assinatura;
3. revisar grants;
4. validar schema cache;
5. validar service consumidor.

---

## 12. Edge Functions e secrets

Regras:

- secrets não entram em migration;
- service role não entra no frontend;
- Edge Functions usam variáveis/segredos do ambiente;
- migrations não devem hardcodar tokens;
- cron automático que chama Edge Function precisa de segredo externo ao repositório.

Edge Functions citadas:

```txt
run-daily-notifications
send-notification-email
generate-person-insights
google-calendar-auth
google-calendar-callback
google-calendar-sync
```

Para notificações diárias:

- rotina manual pode existir;
- Edge Function pode estar preparada;
- cron automático só deve ser ativado após segredo seguro externo.

Para Google Calendar:

- tokens OAuth devem permanecer restritos a banco/Edge Functions;
- frontend deve invocar services/Edge Functions, não manipular tokens diretamente;
- desconexão e sincronização devem respeitar usuário autenticado.

---

## 13. Scripts SQL soltos e legado

Classificação recomendada:

| Tipo | Destino |
|---|---|
| Diagnóstico manual | `scripts/` ou documento canônico com aviso claro, se ainda for útil |
| Correção operacional pontual | `scripts/` com dry-run e instrução |
| Schema antigo substituído por migrations | Remover; não recriar `docs/historico/documentacao-antiga/` nem `docs/historico/sql-legado/` |
| Script destrutivo | `scripts/` com comentários, bloqueios e confirmação |
| Migration real | `supabase/migrations/` |

Regras:

- não aplicar SQL legado como schema de ambiente novo;
- não recriar arquivo legado apenas para arquivar SQL antigo;
- se um SQL legado ainda for útil, mover para `scripts/` como operacional, com aviso claro;
- se for apenas histórico, resumir em `docs/historico/README.md` ou remover;
- se for destrutivo, exigir dry-run, backup e confirmação explícita.

---

## 14. Fluxo seguro para deploy com migration

1. Revisar SQL.
2. Confirmar backup.
3. Aplicar em local/staging.
4. Rodar build/testes.
5. Validar fluxo manual.
6. Aplicar remoto com autorização.
7. Confirmar `supabase migration list`.
8. Validar tela afetada.
9. Fazer deploy frontend.
10. Monitorar erros.

Comandos:

```bash
supabase migration list
supabase db push
npm run build
npm test
npm run test:e2e
git diff --check
```

Telas de QA conforme migration:

| Migration/área | Telas/fluxos |
|---|---|
| Arquivos históricos | perfil de pessoa, `/minha-arvore/editar`, modal conjugal |
| Vínculo admin usuário-pessoa | `/admin/pessoas/:id/editar` |
| Reset de perfil/RPC ausente | `/admin/pessoas` e `/pessoa/:id`; validar também schema cache/PostgREST |
| Sugestões de perfil | `/pessoa/:id`, modal conjugal, `/admin/solicitacoes-vinculos` |
| Fórum/reação única | `/forum/novo`, `/forum/topico/:id` |
| Notificações | `/notificacoes`, `/ajustar-notificacoes`, `/admin/notificacoes` |
| Google Calendar | `/calendario-familiar` e Edge Functions relacionadas |

---

## 15. Troubleshooting operacional

### Migration aparece local, mas não remota

Verificar:

```bash
supabase migration list
```

Correção:

- revisar SQL;
- confirmar alvo;
- aplicar com `supabase db push`;
- validar ambiente correto.

### Migration remota aplicada, mas local divergente

Causas comuns:

- SQL aplicado manualmente;
- `migration repair` feito incorretamente;
- branch local desatualizada.

Correção:

- atualizar `main`;
- revisar migrations;
- comparar schema;
- usar `migration repair` apenas se o schema já estiver comprovadamente aplicado.

### Frontend envia coluna que não existe

Exemplo:

```txt
categoria_evento
```

Correção:

- aplicar migration correta;
- validar schema cache;
- bloquear deploy frontend até banco estar pronto, se necessário;
- não remover campo do payload apenas para contornar banco desatualizado.

### RPC corrigida ainda falha

Verificar:

- migration aplicada;
- schema cache;
- assinatura da RPC;
- grants;
- policies;
- service consumidor;
- erro real no console/Supabase.

### Reset de perfil falha

Verificar:

- migration `20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql`;
- migration `20260609193000_ensure_admin_reset_person_profile.sql`;
- RPC `admin_reset_person_profile`;
- assinatura `target_pessoa_id uuid`;
- `grant execute` para `authenticated`;
- usuário logado é admin;
- `is_admin_user` retorna verdadeiro;
- schema cache;
- erro específico em insights, favoritos ou preferências.

Se o erro for `PGRST202` ou `Could not find the function public.admin_reset_person_profile(target_pessoa_id)`, tratar como migration ausente, ambiente remoto divergente ou schema cache desatualizado. Não alterar o frontend para contornar a ausência da RPC.

### Sugestão de perfil não aparece no admin

Verificar:

- migration `20260608143000_create_person_profile_suggestions.sql`;
- tabela `person_profile_suggestions`;
- RLS/policies;
- `personProfileSuggestionService.ts`;
- `/admin/solicitacoes-vinculos`.

### Reações duplicadas no fórum

Verificar:

```sql
select user_id, alvo_tipo, alvo_id, count(*)
from public.forum_reacoes
group by user_id, alvo_tipo, alvo_id
having count(*) > 1;
```

Se houver linhas:

- migration `20260608180000_enforce_single_forum_reaction.sql` pode não ter rodado;
- constraint pode ter falhado;
- houve inserção manual inconsistente;
- revisar `forumService.ts`.

---


### Coluna `pessoas.genero` existe no remoto, mas não local

Sintomas:

```txt
Build passa, mas ambientes novos não possuem a coluna genero.
Supabase remoto aceita genero, mas db reset local não recria o campo.
Documentação menciona genero, mas não há migration correspondente.
```

Correção:

1. confirmar se existe migration em `supabase/migrations` para `public.pessoas.genero`;
2. se não existir, criar migration idempotente `add_genero_to_pessoas`;
3. aplicar localmente em ambiente seguro;
4. validar valores fora de `homem`, `mulher`, `pet` antes de constraint;
5. aplicar remoto somente após revisão do alvo e backup quando necessário.

Não usar `migration repair` para mascarar coluna criada manualmente sem SQL versionado.

---

## 16. O que não fazer

Não fazer:

- commitar secrets, dumps, service role, tokens ou backups sensíveis;
- aplicar SQL legado como schema principal;
- rodar `db push` sem revisar;
- usar `migration repair` como atalho;
- criar migration para mudança visual;
- ampliar RLS para resolver rapidamente bug de frontend;
- apagar coluna/tabela legada sem auditoria;
- apagar base64 legado sem dry-run;
- criar nova tabela de eventos se `person_events` atende;
- criar nova tabela de favoritos se `user_favorites` atende;
- criar constraint única sem deduplicar dados antigos;
- mover tokens OAuth ou service role para frontend.

---

## 17. O que fazer

Fazer:

- revisar `supabase migration list`;
- manter migrations pequenas, nomeadas e versionadas;
- validar local/staging antes de remoto;
- preservar backup;
- deduplicar antes de constraints únicas;
- documentar scripts destrutivos;
- usar dry-run para limpeza;
- testar fluxo afetado;
- atualizar documentação relacionada;
- quando a mudança for apenas visual, registrar que não há migration aplicável;
- registrar no `PLANO_PROXIMOS_PASSOS.md` apenas pendências reais, não histórico já resolvido.

---

## 18. Relação com outras documentações

| Tema | Documento |
|---|---|
| Modelo lógico | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Troubleshooting | `docs/GUIA_CORRECAO_ERROS.md` |
| Estado implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Pessoas/perfil/admin | `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` |
| Fórum | `docs/funcionalidades/FORUM.md` |
| Notificações | `docs/funcionalidades/NOTIFICACOES.md` |
| Storage | `docs/operacao/STORAGE_MAINTENANCE.md` |
| Deploy | `docs/operacao/DEPLOYMENT.md` |
| Google OAuth | `docs/operacao/OAUTH_GOOGLE.md` |
| Plano vivo | `docs/PLANO_PROXIMOS_PASSOS.md` |
