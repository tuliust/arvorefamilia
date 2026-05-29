# Migrations Supabase

> Local recomendado: `docs/operacao/MIGRATIONS_SUPABASE.md`  
> Tipo: documentação operacional canônica.

---

## 1. Objetivo

Este documento define o fluxo seguro para trabalhar com migrations, schema Supabase, scripts SQL legados e alterações de banco no projeto **Árvore Família**.

Use este arquivo antes de:

- criar migration;
- aplicar migration local/remota;
- rodar `supabase db push`;
- revisar divergência entre local e remoto;
- lidar com schema cache;
- decidir se um SQL solto deve ser mantido, movido ou removido;
- auditar objetos legados.

---

## 2. Regra principal

```txt
supabase/migrations é a fonte da verdade do schema.
```

Scripts SQL soltos podem existir como:

- histórico;
- diagnóstico;
- referência;
- operação pontual;
- dry-run;
- correção manual documentada.

Eles **não devem substituir migrations** em novos ambientes.

---

## 3. Arquivos e pastas relevantes

```txt
supabase/migrations/
supabase/functions/
supabase/config.toml
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/GUIA_CORRECAO_ERROS.md
DEPLOYMENT.md
README.md
```

Scripts SQL soltos antigos, quando existirem, devem ser tratados como referência histórica ou operacional, não como schema principal.

---

## 4. Checklist antes de alterar banco

Antes de qualquer alteração de schema:

```bash
git status
npm run build
npm test
git diff --check
supabase migration list
```

Perguntas obrigatórias:

1. A alteração realmente exige banco?
2. É ajuste funcional ou apenas visual?
3. A coluna/tabela/RPC já existe em migration?
4. O ambiente remoto está alinhado com local?
5. Existe risco de perda de dados?
6. Há backup ou rollback manual?
7. O frontend já envia payload para a nova coluna?
8. RLS precisa ser alterada?
9. Existe teste ou QA manual para o fluxo?

Regra:

```txt
Não criar migration para ajuste puramente visual.
```

---

## 5. Criar nova migration

Criar migration com nome descritivo:

```bash
supabase migration new add_nome_da_alteracao
```

Exemplo esperado:

```txt
20260522121000_add_historical_file_event_category.sql
```

Boas práticas:

- usar nomes objetivos;
- evitar migration genérica como `fix`;
- comentar SQL complexo;
- tornar alteração idempotente quando seguro;
- revisar locks e impactos;
- incluir constraints/checks com cuidado;
- revisar RLS se a tabela/coluna for sensível.

---

## 6. Aplicar migration local

Fluxo recomendado:

```bash
supabase migration list
supabase db reset
npm run build
npm test
git diff --check
```

Quando `db reset` for destrutivo para dados locais importantes, não executar sem backup.

Alternativa controlada:

```bash
supabase db push
```

Usar apenas quando o alvo estiver correto e houver revisão prévia.

---

## 7. Aplicar migration remota

Antes:

```bash
git status
supabase migration list
```

Depois, revisar se a migration aparece como pendente/remota/local.

Aplicar:

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

Regra:

```txt
Não rodar supabase db push em produção sem autorização explícita, backup e revisão do SQL.
```

---

## 8. `migration repair`

Usar `migration repair` apenas quando:

- a migration já foi aplicada manualmente no banco;
- o schema remoto comprovadamente reflete o conteúdo da migration;
- o histórico de migrations está divergente;
- houve auditoria do SQL;
- a decisão foi registrada.

Não usar para:

- mascarar migration não aplicada;
- “fazer sumir” divergência sem conferir banco;
- corrigir erro de SQL;
- pular validação.

---

## 9. Schema cache do Supabase

Sintomas de schema cache:

- coluna recém-criada não aparece para PostgREST;
- insert/update falha dizendo que coluna não existe;
- RPC corrigida continua parecendo antiga;
- frontend falha mesmo após migration aplicada.

Ações:

1. confirmar `supabase migration list`;
2. confirmar que a coluna/RPC existe no banco;
3. aguardar/recarregar schema cache;
4. testar novamente;
5. evitar alterar frontend para contornar schema ainda não refletido.

Exemplo conhecido:

```txt
public.arquivos_historicos.categoria_evento
```

Se a migration foi aplicada, mas o PostgREST ainda reclama, avaliar cache antes de remover a coluna do payload.

---

## 10. Migrations relevantes recentes

### `20260519180000_create_site_visual_settings.sql`

Escopo:

- configurações visuais da home pública;
- usada por `/entrar`;
- não deve ser substituída por configuração hardcoded.

### `20260522121000_add_historical_file_event_category.sql`

Escopo:

- adiciona `categoria_evento` em `public.arquivos_historicos`;
- permite categorias históricas em arquivos.

Pré-requisito:

```txt
Aplicar antes de deploy que envie categoria_evento no payload.
```

Sintoma se ausente:

```txt
insert/update em arquivos_historicos falha porque categoria_evento não existe.
```

### `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`

Escopo:

- corrige RPC `admin_list_profiles_for_linking`;
- usada no vínculo admin usuário-pessoa;
- evita fallback inseguro de consulta direta em `profiles`.

Validação esperada:

- card de usuários vinculáveis carrega no admin;
- usuários já vinculados não aparecem;
- botão Recarregar funciona;
- erro de schema cache da RPC desaparece.

---

## 11. Scripts SQL soltos e legado

Scripts soltos podem existir em:

```txt
/
supabase/
scripts/
docs/historico/documentacao-antiga/
```

Classificação recomendada:

| Tipo | Destino |
|---|---|
| Diagnóstico manual | `docs/historico/` ou `scripts/` com aviso claro |
| Correção operacional pontual | `scripts/` com dry-run e instrução |
| Schema antigo substituído por migrations | `docs/historico/documentacao-antiga/` |
| Script destrutivo | `scripts/` com comentários, bloqueios e confirmação |
| Migration real | `supabase/migrations/` |

Regra:

```txt
Não aplicar database-schema.sql como schema principal em novo ambiente.
```

---

## 12. RLS e permissões

Ao alterar tabela sensível, revisar RLS.

Tabelas sensíveis:

```txt
profiles
user_person_links
pessoas
relacionamentos
relationship_change_requests
activity_logs
notificacoes_usuario
preferencias_notificacao
google_calendar_connections
arquivos_historicos
person_events
person_generated_insights
user_favorites
```

Checklist:

- SELECT de usuário comum está restrito?
- INSERT/UPDATE/DELETE exigem dono/admin?
- Admin usa RPC ou policy adequada?
- Service role fica apenas server-side?
- Usuário comum não consegue alterar relacionamento real diretamente?
- Solicitações usam `relationship_change_requests`?

---

## 13. Edge Functions e secrets

Regras:

- secrets não entram em migration;
- service role não entra no frontend;
- Edge Functions usam variáveis/segredos do ambiente;
- migrations não devem hardcodar tokens;
- cron automático que chama Edge Function precisa de segredo seguro fora do repositório.

Exemplo:

```txt
run-daily-notifications
send-notification-email
generate-person-insights
```

Para notificações diárias:

- rotina manual pode existir;
- Edge Function pode estar preparada;
- cron automático só deve ser ativado após segredo seguro externo.

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

---

## 15. Troubleshooting

### Migration aparece local, mas não remota

Verificar:

```bash
supabase migration list
```

Correção:

- revisar SQL;
- aplicar com `supabase db push`;
- validar ambiente correto.

---

### Migration remota aplicada, mas local divergente

Causas:

- SQL aplicado manualmente;
- migration repair feito incorretamente;
- branch local desatualizada.

Correção:

- puxar main;
- revisar migrations;
- comparar schema;
- usar `migration repair` apenas se o schema já estiver comprovadamente aplicado.

---

### Frontend envia coluna que não existe

Exemplo:

```txt
categoria_evento
```

Correção:

- aplicar migration correta;
- não remover campo do payload só para contornar ambiente desatualizado;
- se necessário, bloquear deploy frontend até banco estar pronto.

---

### RPC corrigida ainda falha

Verificar:

- migration aplicada;
- schema cache;
- assinatura da RPC;
- permissões;
- chamada do service;
- erro real no console/Supabase.

---

## 16. O que não fazer

Não fazer:

- commitar secrets;
- commitar dumps;
- commitar service role;
- aplicar SQL legado como schema novo;
- rodar `db push` sem revisar;
- usar `migration repair` como atalho;
- criar migration para mudança visual;
- ampliar RLS para “resolver rápido” bug de frontend;
- apagar coluna/tabela legada sem auditoria;
- apagar base64 legado sem dry-run.

---

## 17. O que fazer

Fazer:

- revisar `supabase migration list`;
- manter migrations pequenas e nomeadas;
- validar local antes de remoto;
- preservar backup;
- documentar scripts destrutivos;
- usar dry-run para limpeza;
- testar fluxo afetado;
- atualizar documentação relacionada;
- registrar pós-MVP quando a correção não bloquear lançamento.

---

## 18. Relação com outras documentações

- Estado funcional: `docs/GUIA_IMPLEMENTACOES.md`
- Troubleshooting por sintoma: `docs/GUIA_CORRECAO_ERROS.md`
- QA final: `docs/historico/QA_FINAL_MVP.md`
- Storage: `docs/operacao/STORAGE_MAINTENANCE.md`
- Rotas/guards: `docs/arquitetura/ROTAS_E_GUARDS.md`
