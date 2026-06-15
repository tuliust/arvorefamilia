# Migrations Supabase

> Última revisão: 2026-06-14
> Local canônico: `docs/operacao/MIGRATIONS_SUPABASE.md`
> Tipo: documentação operacional de banco, schema, RLS, RPCs e migrations.
> Status: revisado para separar migrations oficiais, SQLs soltos, stubs preventivos, diagnósticos e operações pontuais.

---

## 1. Objetivo

Este documento define o fluxo seguro para trabalhar com migrations Supabase no projeto **Árvore Família**.

Use antes de:

- criar migration;
- aplicar `supabase db push`;
- rodar `supabase db reset`;
- investigar schema local/remoto;
- alterar RLS, RPC, trigger, constraint ou função SQL;
- decidir se SQL solto deve virar migration;
- corrigir divergência de schema cache;
- revisar script SQL fora de `supabase/migrations/`.

Não use este documento para ajustes puramente visuais.

---

## 2. Regra principal

```txt
supabase/migrations/ é a fonte da verdade do schema.
```

SQL solto pode existir como histórico, diagnóstico, operação pontual ou stub preventivo, mas não substitui migration.

Não aplicar como schema principal:

```txt
database-schema.sql
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
src/imports/pasted_text/*.txt com SQL antigo
scripts/cleanup-test-user-*.sql
diagnostico-*.sql
verificar-*.sql
scripts SQL antigos fora de supabase/migrations/
```

Observação:

```txt
supabase/forum-schema.sql, supabase/google-calendar-schema.sql, arquivos SQL-like em src/imports/pasted_text/ e scripts de limpeza antigos foram neutralizados ou devem permanecer como stubs preventivos.
Eles não devem conter comandos operacionais nem ser usados para provisionar banco.
```

Inventário histórico:

```txt
docs/historico/SQLS_LEGADOS.md
```

---

## 3. Quando criar migration

Criar migration para:

- nova tabela;
- nova coluna;
- alteração de tipo;
- índice;
- constraint;
- trigger;
- function SQL;
- RPC;
- policy/RLS;
- bucket/policy quando versionado via SQL;
- seed controlado necessário;
- ajuste de permissões/grants.

Não criar migration para:

- paleta;
- CSS;
- layout mobile;
- conectores visuais;
- cards;
- avatar fallback visual;
- modal;
- exportação client-side;
- documentação;
- microcopy estática sem banco.

---

## 4. Checklist antes de alterar banco

```bash
git status --short
git diff --check
npm run build
npm test
supabase migration list
```

Perguntas obrigatórias:

| Pergunta | Motivo |
|---|---|
| A mudança exige banco? | Evita migration desnecessária. |
| O objeto já existe? | Evita duplicidade. |
| O ambiente remoto está correto? | Evita aplicar no projeto errado. |
| Há risco de perda de dados? | Exige backup. |
| O frontend depende da mudança? | Define ordem banco -> frontend. |
| RLS precisa mudar? | Evita exposição indevida. |
| Há Edge Function envolvida? | Exige secrets e deploy server-side. |
| Existe SQL solto equivalente? | Exige comparação com migrations e neutralização se for legado. |

---

## 5. Criar migration

```bash
supabase migration new nome_descritivo
```

Boas práticas:

- nome claro;
- SQL idempotente quando seguro;
- `create or replace function` para RPCs;
- `drop policy if exists` antes de recriar policy;
- revisar locks e dados existentes;
- deduplicar antes de constraint unique;
- separar limpeza destrutiva de alteração de schema;
- comentar SQL complexo.

---

## 6. Aplicar localmente

Ambiente descartável:

```bash
supabase migration list
supabase db reset
npm run build
npm test
git diff --check
```

Quando não puder resetar dados locais:

```bash
supabase migration list
supabase db push
npm run build
git diff --check
```

---

## 7. Aplicar remotamente

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

- confirmar projeto Supabase;
- fazer backup se houver dados reais sensíveis;
- aplicar migration antes de deploy frontend dependente;
- monitorar PostgREST/schema cache;
- não alterar frontend para mascarar schema ausente.

---

## 8. `migration repair`

Usar apenas quando:

- migration foi aplicada manualmente;
- schema remoto comprovadamente reflete o SQL;
- histórico Supabase divergiu;
- decisão foi registrada.

Não usar para:

- pular migration;
- esconder erro de SQL;
- mascarar ambiente errado;
- evitar backup;
- corrigir cache temporário.

---

## 9. SQLs fora de `supabase/migrations/`

Arquivos fora de `supabase/migrations/` devem ser tratados como exceção.

Classificação permitida:

| Tipo | Pode ficar versionado? | Condição |
|---|---:|---|
| Stub preventivo | Sim | Sem comandos operacionais e com referência à fonte oficial. |
| Diagnóstico de leitura | Avaliar | Sem dados reais no arquivo; escopo e ambiente claros. |
| Operação destrutiva | Evitar | Preferir arquivo local não versionado; exige dry-run, backup e autorização. |
| Dump de schema | Não recomendado | Só histórico controlado; não usar como migration. |
| Dump de dados | Não | Não versionar. |
| Schema operacional | Não | Deve virar migration oficial. |

Arquivos neutralizados ou monitorados:

```txt
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
src/imports/pasted_text/genealogy-schema.txt
src/imports/pasted_text/sibling-check.txt
src/imports/pasted_text/irmaos-relacionamento.txt
scripts/cleanup-test-user-9feabe7c.sql
```

Regra:

```txt
Se o arquivo orienta executar SQL no Supabase SQL Editor, cria/altera schema, contém comandos destrutivos, contém resultados reais ou contém identificadores reais, ele deve ser neutralizado, removido do versionamento ou refeito como migration/rotina operacional aprovada.
```

---

## 10. Schema cache/PostgREST

Sintomas:

```txt
coluna recém-criada não aparece
RPC corrigida continua antiga
payload falha com coluna inexistente
PGRST202 em RPC existente localmente
```

Fluxo:

1. conferir `supabase migration list`;
2. verificar coluna/RPC no banco;
3. conferir assinatura e grants;
4. aguardar/recarregar schema cache;
5. testar novamente;
6. não remover payload correto para contornar ambiente atrasado.

Exemplos de objetos sensíveis:

```txt
RPCs usadas pelo frontend
policies RLS
grants de funções
triggers de auditoria
views usadas por services
colunas novas consumidas pelo frontend
```

---

## 11. Operações destrutivas

Operações destrutivas não devem ser tratadas como migration normal quando forem limpeza pontual de dados.

Regras mínimas:

- nunca commitar service role key;
- nunca commitar dump de dados reais;
- nunca commitar script com UUID, e-mail ou identificador real sem justificativa explícita;
- preferir script local não versionado;
- usar dry-run antes de qualquer alteração;
- fazer backup quando houver dados compartilhados ou produção;
- confirmar projeto Supabase antes de executar;
- registrar decisão operacional quando a limpeza impactar dados reais.

---

## 12. Documentos relacionados

```txt
docs/historico/SQLS_LEGADOS.md
docs/operacao/DEPLOYMENT.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/operacao/OAUTH_GOOGLE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
```
