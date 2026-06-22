# Migrations Supabase

> Última revisão: 2026-06-22  
> Local canônico: `docs/operacao/MIGRATIONS_SUPABASE.md`  
> Tipo: documentação operacional de banco, schema, RLS, RPCs e migrations.  
> Status: revisado para reforçar que `supabase/migrations/` é a fonte da verdade e que mudanças opcionais, como fatos históricos sem arquivo, só são vigentes quando a migration existir e for aplicada.

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
- ajuste de permissões/grants;
- tornar coluna obrigatória/opcional quando o frontend depender disso.

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
- microcopy estática sem banco;
- separação meramente visual de pets quando o schema já possui `humano_ou_pet`.

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

## 12. Fatos históricos sem arquivo — regra operacional

A frente **Fatos e Arquivos Históricos** só deve ser considerada implementada quando as duas condições forem verdadeiras:

1. o frontend permitir fato/memória sem arquivo obrigatório;
2. a migration oficial em `supabase/migrations/` permitir `NULL` nos campos de arquivo necessários.

Enquanto isso não ocorrer, o comportamento vigente continua sendo o observado no código atual:

```txt
ArquivosHistoricosPage title = "Arquivos históricos"
Arquivo/upload obrigatório na UI
ArquivoHistorico.url obrigatório no tipo
```

Se a frente for aplicada, a migration mínima esperada deve tornar opcionais, conforme schema real:

```sql
alter table public.arquivos_historicos
  alter column url drop not null,
  alter column storage_bucket drop not null,
  alter column storage_path drop not null,
  alter column mime_type drop not null;
```

Regras:

- adaptar ao schema real antes de aplicar;
- não assumir que todas as colunas são `not null`;
- não aplicar sem `supabase migration list`;
- não commitar documentação dizendo “aplicado” antes do arquivo existir em `supabase/migrations/` e ser enviado ao Supabase;
- se o serviço possui fallback para ausência de `participante_ids`, não transformar `participante_ids` em obrigatório sem migration e backfill.

---

## 13. `participante_ids` em arquivos históricos

O serviço atual possui compatibilidade defensiva para ausência da coluna `participante_ids`.

Regra documental:

```txt
participante_ids não deve ser tratado como obrigatório enquanto houver fallback de schema cache/coluna ausente.
```

Para torná-lo obrigatório:

1. criar migration adicionando coluna, se ainda não existir;
2. fazer backfill controlado;
3. ajustar RLS/policies se necessário;
4. remover fallback no service;
5. atualizar documentação funcional e operacional;
6. rodar build/testes;
7. aplicar no Supabase correto.

---

## 14. Pets e relacionamentos

A separação visual de Pets em `/meus-vinculos` não exige migration enquanto o schema já possui:

```txt
pessoas.humano_ou_pet
```

Não criar tipo de relacionamento `tutor` sem frente própria.

Se futuramente houver tipo `tutor`:

- criar migration de enum/check constraint/tipo relacionado, conforme schema real;
- atualizar `TipoRelacionamento`;
- atualizar `dataService`;
- atualizar `relationshipChangeRequestService`;
- migrar dados existentes com compatibilidade;
- atualizar docs e QA;
- validar mapas, perfis e revisão.

---

## 15. Documentos relacionados

```txt
docs/historico/SQLS_LEGADOS.md
docs/operacao/DEPLOYMENT.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/operacao/OAUTH_GOOGLE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/MEUS_VINCULOS.md
```

---

## 16. Alertas operacionais preservados

### Reset ampliado de perfil

O levantamento cita proposta de reset ampliado de perfil com possível alteração de RPC/migration e limpeza de `auth.users`.

Não registrar nem aplicar como implementado sem:

- arquivo real em `supabase/migrations/`;
- revisão de RLS/RPC;
- validação em ambiente seguro;
- confirmação de commit;
- rollback documentado.

Enquanto não houver essa confirmação, a frente permanece bloqueada em `PLANO_PROXIMOS_PASSOS.md`.

### Curiosidades

O levantamento registrou duas migrations aplicadas na frente de Curiosidades:

```txt
supabase/migrations/20260618120000_create_family_memory_wall_posts.sql
supabase/migrations/20260618123000_add_curiosity_discovery_favorites.sql
```

Se esses arquivos não existirem no repositório atual ou não constarem em `supabase migration list`, tratar como divergência documental e corrigir antes de novas alterações de banco.

Pendência operacional relacionada:

- confirmar fonte canônica de coordenadas de cidades para rota familiar;
- autocomplete;
- tabela de cidades;
- backfill;
- geocoding posterior.
