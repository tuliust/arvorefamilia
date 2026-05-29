# Migrations Supabase

> Local recomendado: `docs/operacao/MIGRATIONS_SUPABASE.md`
> Tipo: documentaÃ§Ã£o operacional canÃ´nica.

---

## 1. Objetivo

Este documento define o fluxo seguro para trabalhar com migrations, schema Supabase, scripts SQL legados e alteraÃ§Ãµes de banco no projeto **Ãrvore FamÃ­lia**.

Use este arquivo antes de:

- criar migration;
- aplicar migration local/remota;
- rodar `supabase db push`;
- revisar divergÃªncia entre local e remoto;
- lidar com schema cache;
- decidir se um SQL solto deve ser mantido, movido ou removido;
- auditar objetos legados.

---

## 2. Regra principal

```txt
supabase/migrations Ã© a fonte da verdade do schema.
```

Scripts SQL soltos podem existir como:

- histÃ³rico;
- diagnÃ³stico;
- referÃªncia;
- operaÃ§Ã£o pontual;
- dry-run;
- correÃ§Ã£o manual documentada.

Eles **nÃ£o devem substituir migrations** em novos ambientes.

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

Scripts SQL soltos antigos, quando existirem, devem ser tratados como referÃªncia histÃ³rica ou operacional, nÃ£o como schema principal.

---

## 4. Checklist antes de alterar banco

Antes de qualquer alteraÃ§Ã£o de schema:

```bash
git status
npm run build
npm test
git diff --check
supabase migration list
```

Perguntas obrigatÃ³rias:

1. A alteraÃ§Ã£o realmente exige banco?
2. Ã‰ ajuste funcional ou apenas visual?
3. A coluna/tabela/RPC jÃ¡ existe em migration?
4. O ambiente remoto estÃ¡ alinhado com local?
5. Existe risco de perda de dados?
6. HÃ¡ backup ou rollback manual?
7. O frontend jÃ¡ envia payload para a nova coluna?
8. RLS precisa ser alterada?
9. Existe teste ou QA manual para o fluxo?

Regra:

```txt
NÃ£o criar migration para ajuste puramente visual.
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

Boas prÃ¡ticas:

- usar nomes objetivos;
- evitar migration genÃ©rica como `fix`;
- comentar SQL complexo;
- tornar alteraÃ§Ã£o idempotente quando seguro;
- revisar locks e impactos;
- incluir constraints/checks com cuidado;
- revisar RLS se a tabela/coluna for sensÃ­vel.

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

Quando `db reset` for destrutivo para dados locais importantes, nÃ£o executar sem backup.

Alternativa controlada:

```bash
supabase db push
```

Usar apenas quando o alvo estiver correto e houver revisÃ£o prÃ©via.

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
NÃ£o rodar supabase db push em produÃ§Ã£o sem autorizaÃ§Ã£o explÃ­cita, backup e revisÃ£o do SQL.
```

---

## 8. `migration repair`

Usar `migration repair` apenas quando:

- a migration jÃ¡ foi aplicada manualmente no banco;
- o schema remoto comprovadamente reflete o conteÃºdo da migration;
- o histÃ³rico de migrations estÃ¡ divergente;
- houve auditoria do SQL;
- a decisÃ£o foi registrada.

NÃ£o usar para:

- mascarar migration nÃ£o aplicada;
- â€œfazer sumirâ€ divergÃªncia sem conferir banco;
- corrigir erro de SQL;
- pular validaÃ§Ã£o.

---

## 9. Schema cache do Supabase

Sintomas de schema cache:

- coluna recÃ©m-criada nÃ£o aparece para PostgREST;
- insert/update falha dizendo que coluna nÃ£o existe;
- RPC corrigida continua parecendo antiga;
- frontend falha mesmo apÃ³s migration aplicada.

AÃ§Ãµes:

1. confirmar `supabase migration list`;
2. confirmar que a coluna/RPC existe no banco;
3. aguardar/recarregar schema cache;
4. testar novamente;
5. evitar alterar frontend para contornar schema ainda nÃ£o refletido.

Exemplo conhecido:

```txt
public.arquivos_historicos.categoria_evento
```

Se a migration foi aplicada, mas o PostgREST ainda reclama, avaliar cache antes de remover a coluna do payload.

---

## 10. Migrations relevantes recentes

### `20260519180000_create_site_visual_settings.sql`

Escopo:

- configuraÃ§Ãµes visuais da home pÃºblica;
- usada por `/entrar`;
- nÃ£o deve ser substituÃ­da por configuraÃ§Ã£o hardcoded.

### `20260522121000_add_historical_file_event_category.sql`

Escopo:

- adiciona `categoria_evento` em `public.arquivos_historicos`;
- permite categorias histÃ³ricas em arquivos.

PrÃ©-requisito:

```txt
Aplicar antes de deploy que envie categoria_evento no payload.
```

Sintoma se ausente:

```txt
insert/update em arquivos_historicos falha porque categoria_evento nÃ£o existe.
```

### `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`

Escopo:

- corrige RPC `admin_list_profiles_for_linking`;
- usada no vÃ­nculo admin usuÃ¡rio-pessoa;
- evita fallback inseguro de consulta direta em `profiles`.

ValidaÃ§Ã£o esperada:

- card de usuÃ¡rios vinculÃ¡veis carrega no admin;
- usuÃ¡rios jÃ¡ vinculados nÃ£o aparecem;
- botÃ£o Recarregar funciona;
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

ClassificaÃ§Ã£o recomendada:

| Tipo | Destino |
|---|---|
| DiagnÃ³stico manual | `docs/historico/` ou `scripts/` com aviso claro |
| CorreÃ§Ã£o operacional pontual | `scripts/` com dry-run e instruÃ§Ã£o |
| Schema antigo substituÃ­do por migrations | `docs/historico/documentacao-antiga/` |
| Script destrutivo | `scripts/` com comentÃ¡rios, bloqueios e confirmaÃ§Ã£o |
| Migration real | `supabase/migrations/` |

Regra:

```txt
NÃ£o aplicar database-schema.sql como schema principal em novo ambiente.
```

---

## 12. RLS e permissÃµes

Ao alterar tabela sensÃ­vel, revisar RLS.

Tabelas sensÃ­veis:

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

- SELECT de usuÃ¡rio comum estÃ¡ restrito?
- INSERT/UPDATE/DELETE exigem dono/admin?
- Admin usa RPC ou policy adequada?
- Service role fica apenas server-side?
- UsuÃ¡rio comum nÃ£o consegue alterar relacionamento real diretamente?
- SolicitaÃ§Ãµes usam `relationship_change_requests`?

---

## 13. Edge Functions e secrets

Regras:

- secrets nÃ£o entram em migration;
- service role nÃ£o entra no frontend;
- Edge Functions usam variÃ¡veis/segredos do ambiente;
- migrations nÃ£o devem hardcodar tokens;
- cron automÃ¡tico que chama Edge Function precisa de segredo seguro fora do repositÃ³rio.

Exemplo:

```txt
run-daily-notifications
send-notification-email
generate-person-insights
```

Para notificaÃ§Ãµes diÃ¡rias:

- rotina manual pode existir;
- Edge Function pode estar preparada;
- cron automÃ¡tico sÃ³ deve ser ativado apÃ³s segredo seguro externo.

---

## 14. Fluxo seguro para deploy com migration

1. Revisar SQL.
2. Confirmar backup.
3. Aplicar em local/staging.
4. Rodar build/testes.
5. Validar fluxo manual.
6. Aplicar remoto com autorizaÃ§Ã£o.
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

### Migration aparece local, mas nÃ£o remota

Verificar:

```bash
supabase migration list
```

CorreÃ§Ã£o:

- revisar SQL;
- aplicar com `supabase db push`;
- validar ambiente correto.

---

### Migration remota aplicada, mas local divergente

Causas:

- SQL aplicado manualmente;
- migration repair feito incorretamente;
- branch local desatualizada.

CorreÃ§Ã£o:

- puxar main;
- revisar migrations;
- comparar schema;
- usar `migration repair` apenas se o schema jÃ¡ estiver comprovadamente aplicado.

---

### Frontend envia coluna que nÃ£o existe

Exemplo:

```txt
categoria_evento
```

CorreÃ§Ã£o:

- aplicar migration correta;
- nÃ£o remover campo do payload sÃ³ para contornar ambiente desatualizado;
- se necessÃ¡rio, bloquear deploy frontend atÃ© banco estar pronto.

---

### RPC corrigida ainda falha

Verificar:

- migration aplicada;
- schema cache;
- assinatura da RPC;
- permissÃµes;
- chamada do service;
- erro real no console/Supabase.

---

## 16. O que nÃ£o fazer

NÃ£o fazer:

- commitar secrets;
- commitar dumps;
- commitar service role;
- aplicar SQL legado como schema novo;
- rodar `db push` sem revisar;
- usar `migration repair` como atalho;
- criar migration para mudanÃ§a visual;
- ampliar RLS para â€œresolver rÃ¡pidoâ€ bug de frontend;
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
- atualizar documentaÃ§Ã£o relacionada;
- registrar pÃ³s-MVP quando a correÃ§Ã£o nÃ£o bloquear lanÃ§amento.

---

## 18. RelaÃ§Ã£o com outras documentaÃ§Ãµes

- Estado funcional: `docs/GUIA_IMPLEMENTACOES.md`
- Troubleshooting por sintoma: `docs/GUIA_CORRECAO_ERROS.md`
- QA final: `docs/historico/QA_FINAL_MVP.md`
- Storage: `docs/operacao/STORAGE_MAINTENANCE.md`
- Rotas/guards: `docs/arquitetura/ROTAS_E_GUARDS.md`
