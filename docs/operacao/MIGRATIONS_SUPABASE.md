# Migrations Supabase

> Local recomendado: `docs/operacao/MIGRATIONS_SUPABASE.md`
> Tipo: documentacao operacional canonica.

---

## 1. Objetivo

Este documento define o fluxo seguro para trabalhar com migrations, schema Supabase, scripts SQL legados e alteracoes de banco no projeto **Arvore Familia**.

Use este arquivo antes de:

- criar migration;
- aplicar migration local/remota;
- rodar `supabase db push`;
- revisar divergencia entre local e remoto;
- lidar com schema cache;
- decidir se um SQL solto deve ser mantido, movido ou removido;
- auditar objetos legados.

---

## 2. Regra principal

```txt
supabase/migrations e a fonte da verdade do schema.
```

Scripts SQL soltos podem existir como:

- historico;
- diagnostico;
- referencia;
- operacao pontual;
- dry-run;
- correcao manual documentada.

Eles **nao devem substituir migrations** em novos ambientes.

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

Scripts SQL soltos antigos, quando existirem, devem ser tratados como referencia historica ou operacional, nao como schema principal.

---

## 4. Checklist antes de alterar banco

Antes de qualquer alteracao de schema:

```bash
git status
npm run build
npm test
git diff --check
supabase migration list
```

Perguntas obrigatorias:

1. A alteracao realmente exige banco
2. E ajuste funcional ou apenas visual
3. A coluna/tabela/RPC ja existe em migration
4. O ambiente remoto esta alinhado com local
5. Existe risco de perda de dados
6. Ha backup ou rollback manual
7. O frontend ja envia payload para a nova coluna
8. RLS precisa ser alterada
9. Existe teste ou QA manual para o fluxo

Regra:

```txt
Nao criar migration para ajuste puramente visual.
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

Boas praticas:

- usar nomes objetivos;
- evitar migration generica como `fix`;
- comentar SQL complexo;
- tornar alteracao idempotente quando seguro;
- revisar locks e impactos;
- incluir constraints/checks com cuidado;
- revisar RLS se a tabela/coluna for sensivel.

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

Quando `db reset` for destrutivo para dados locais importantes, nao executar sem backup.

Alternativa controlada:

```bash
supabase db push
```

Usar apenas quando o alvo estiver correto e houver revisao previa.

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
Nao rodar supabase db push em producao sem autorizacao explicita, backup e revisao do SQL.
```

---

## 8. `migration repair`

Usar `migration repair` apenas quando:

- a migration ja foi aplicada manualmente no banco;
- o schema remoto comprovadamente reflete o conteudo da migration;
- o historico de migrations esta divergente;
- houve auditoria do SQL;
- a decisao foi registrada.

Nao usar para:

- mascarar migration nao aplicada;
- fazer sumir divergencia sem conferir banco;
- corrigir erro de SQL;
- pular validacao.

---

## 9. Schema cache do Supabase

Sintomas de schema cache:

- coluna recem-criada nao aparece para PostgREST;
- insert/update falha dizendo que coluna nao existe;
- RPC corrigida continua parecendo antiga;
- frontend falha mesmo apos migration aplicada.

Acoes:

1. confirmar `supabase migration list`;
2. confirmar que a coluna/RPC existe no banco;
3. aguardar/recarregar schema cache;
4. testar novamente;
5. evitar alterar frontend para contornar schema ainda nao refletido.

Exemplo conhecido:

```txt
public.arquivos_historicos.categoria_evento
```

Se a migration foi aplicada, mas o PostgREST ainda reclama, avaliar cache antes de remover a coluna do payload.

---

## 10. Migrations relevantes recentes

### `20260519180000_create_site_visual_settings.sql`

Escopo:

- configuracoes visuais da home publica;
- usada por `/entrar`;
- nao deve ser substituida por configuracao hardcoded.

### `20260522121000_add_historical_file_event_category.sql`

Escopo:

- adiciona `categoria_evento` em `public.arquivos_historicos`;
- permite categorias historicas em arquivos.

Pre-requisito:

```txt
Aplicar antes de deploy que envie categoria_evento no payload.
```

Sintoma se ausente:

```txt
insert/update em arquivos_historicos falha porque categoria_evento nao existe.
```

### `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`

Escopo:

- corrige RPC `admin_list_profiles_for_linking`;
- usada no vinculo admin usuario-pessoa;
- evita fallback inseguro de consulta direta em `profiles`.

Validacao esperada:

- card de usuarios vinculaveis carrega no admin;
- usuarios ja vinculados nao aparecem;
- botao Recarregar funciona;
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

Classificacao recomendada:

| Tipo | Destino |
|---|---|
| Diagnostico manual | `docs/historico/` ou `scripts/` com aviso claro |
| Correcao operacional pontual | `scripts/` com dry-run e instrucao |
| Schema antigo substituido por migrations | `docs/historico/documentacao-antiga/` |
| Script destrutivo | `scripts/` com comentarios, bloqueios e confirmacao |
| Migration real | `supabase/migrations/` |

Regra:

```txt
Nao aplicar database-schema.sql como schema principal em novo ambiente.
```

---

## 12. RLS e permissoes

Ao alterar tabela sensivel, revisar RLS.

Tabelas sensiveis:

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

- SELECT de usuario comum esta restrito
- INSERT/UPDATE/DELETE exigem dono/admin
- Admin usa RPC ou policy adequada
- Service role fica apenas server-side
- Usuario comum nao consegue alterar relacionamento real diretamente
- Solicitacoes usam `relationship_change_requests`

---

## 13. Edge Functions e secrets

Regras:

- secrets nao entram em migration;
- service role nao entra no frontend;
- Edge Functions usam variaveis/segredos do ambiente;
- migrations nao devem hardcodar tokens;
- cron automatico que chama Edge Function precisa de segredo seguro fora do repositorio.

Exemplo:

```txt
run-daily-notifications
send-notification-email
generate-person-insights
```

Para notificacoes diarias:

- rotina manual pode existir;
- Edge Function pode estar preparada;
- cron automatico so deve ser ativado apos segredo seguro externo.

---

## 14. Fluxo seguro para deploy com migration

1. Revisar SQL.
2. Confirmar backup.
3. Aplicar em local/staging.
4. Rodar build/testes.
5. Validar fluxo manual.
6. Aplicar remoto com autorizacao.
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

### Migration aparece local, mas nao remota

Verificar:

```bash
supabase migration list
```

Correcao:

- revisar SQL;
- aplicar com `supabase db push`;
- validar ambiente correto.

---

### Migration remota aplicada, mas local divergente

Causas:

- SQL aplicado manualmente;
- migration repair feito incorretamente;
- branch local desatualizada.

Correcao:

- puxar main;
- revisar migrations;
- comparar schema;
- usar `migration repair` apenas se o schema ja estiver comprovadamente aplicado.

---

### Frontend envia coluna que nao existe

Exemplo:

```txt
categoria_evento
```

Correcao:

- aplicar migration correta;
- nao remover campo do payload so para contornar ambiente desatualizado;
- se necessario, bloquear deploy frontend ate banco estar pronto.

---

### RPC corrigida ainda falha

Verificar:

- migration aplicada;
- schema cache;
- assinatura da RPC;
- permissoes;
- chamada do service;
- erro real no console/Supabase.

---

## 16. O que nao fazer

Nao fazer:

- commitar secrets;
- commitar dumps;
- commitar service role;
- aplicar SQL legado como schema novo;
- rodar `db push` sem revisar;
- usar `migration repair` como atalho;
- criar migration para mudanca visual;
- ampliar RLS para resolver rapido bug de frontend;
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
- atualizar documentacao relacionada;
- registrar pos-MVP quando a correcao nao bloquear lancamento.

---

## 18. Relacao com outras documentacoes

- Estado funcional: `docs/GUIA_IMPLEMENTACOES.md`
- Troubleshooting por sintoma: `docs/GUIA_CORRECAO_ERROS.md`
- QA final: `docs/historico/QA_FINAL_MVP.md`
- Storage: `docs/operacao/STORAGE_MAINTENANCE.md`
- Rotas/guards: `docs/arquitetura/ROTAS_E_GUARDS.md`
