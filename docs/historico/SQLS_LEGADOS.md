# SQLs legados e documentos antigos de banco

> Última revisão: 2026-06-14
> Local canônico: `docs/historico/SQLS_LEGADOS.md`
> Tipo: inventário histórico/preventivo de SQLs fora de `supabase/migrations/`.
> Status: revisado após neutralização de SQLs soltos em `supabase/`, `src/imports/pasted_text/` e `scripts/`, com referência ao inventário de imports colados legados.

---

## 1. Objetivo

Este documento registra SQLs soltos, scripts históricos e referências antigas de banco que podem aparecer no repositório ou na documentação.

Ele existe para evitar regressões operacionais, principalmente:

- aplicar schema antigo em ambiente novo;
- executar SQL solto como se fosse migration oficial;
- confundir diagnóstico com fonte de verdade;
- restaurar modelo de dados antigo por cópia manual;
- versionar dump, backup ou dados reais;
- manter scripts destrutivos com identificadores reais no repositório.

Para a política geral de arquivos colados em `src/imports/pasted_text/`, consultar também:

```txt
docs/historico/IMPORTS_COLADOS_LEGADOS.md
```

---

## 2. Regra principal

```txt
supabase/migrations/ é a fonte da verdade do schema.
```

SQL fora de `supabase/migrations/` pode existir apenas como:

- histórico;
- diagnóstico;
- operação pontual documentada;
- material de comparação;
- artefato temporário não versionado;
- stub preventivo sem instruções operacionais.

Não usar SQL solto para montar ambiente novo sem antes transformar a mudança em migration revisada.

---

## 3. SQLs legados neutralizados

Os arquivos abaixo foram mantidos no caminho antigo apenas como **stubs preventivos**.

Eles não devem conter instruções operacionais, comandos de schema, comandos de DML, dumps, resultados reais, UUIDs reais, e-mails reais ou dados pessoais.

| Arquivo | Classificação | Fonte oficial ou ação correta | Status |
|---|---|---|---|
| `supabase/forum-schema.sql` | Stub preventivo de schema legado do fórum | `supabase/migrations/20260509100000_add_forum_schema.sql` e migrations complementares do fórum | Não executar |
| `supabase/google-calendar-schema.sql` | Stub preventivo de schema legado da integração Google Agenda | `supabase/migrations/20260509100100_add_google_calendar_schema.sql` | Não executar |
| `src/imports/pasted_text/genealogy-schema.txt` | Stub preventivo de schema antigo colado | Verificar migrations oficiais e criar migration nova apenas para diferença real | Não executar |
| `src/imports/pasted_text/sibling-check.txt` | Stub preventivo de diagnóstico antigo de irmãos | Recriar diagnóstico caso a caso, com escopo e dry-run | Não executar |
| `src/imports/pasted_text/irmaos-relacionamento.txt` | Stub preventivo de diagnóstico/correção antiga de irmãos | Recriar diagnóstico ou correção caso a caso, com autorização e backup quando aplicável | Não executar |
| `scripts/cleanup-test-user-9feabe7c.sql` | Stub preventivo de limpeza operacional antiga | Criar script operacional novo fora do versionamento ou rotina revisada e autorizada | Não executar |

Motivo:

```txt
Manter SQL completo fora de supabase/migrations/ aumenta o risco de alguém aplicar schema antigo, diagnóstico obsoleto ou operação destrutiva manualmente.
Manter um stub no caminho antigo preserva rastreabilidade sem oferecer script executável perigoso.
```

Para consultar o conteúdo antigo, usar o histórico do Git e comparar com as migrations oficiais antes de qualquer decisão.

Observação sobre `src/imports/pasted_text/`:

```txt
Quando o arquivo colado não for especificamente SQL, a política preventiva fica em docs/historico/IMPORTS_COLADOS_LEGADOS.md.
Quando contiver SQL, diagnóstico ou operação de banco, este documento continua sendo a referência principal.
```

---

## 4. SQLs soltos e referências antigas monitoradas

| Referência | Classificação | Uso permitido | Status |
|---|---|---|---|
| `database-schema.sql` | Referência antiga possível/documentada | Se existir localmente, tratar como histórico ou dump estrutural | Não usar como fonte da verdade |
| `supabase_schema.sql` | Dump/backup possível | Não versionar se contiver dados reais ou estrutura obsoleta | Não usar como migration |
| `supabase_data.sql` | Dump/backup possível | Não versionar se contiver dados reais | Não aplicar em ambiente real sem revisão |
| `diagnostico-*.sql` | Diagnóstico pontual | Executar apenas em ambiente controlado, se ainda existir e for atual | Não converter em schema |
| `verificar-*.sql` | Diagnóstico pontual possível | Executar apenas para investigação específica, se ainda existir e for atual | Não converter em schema |
| `scripts SQL antigos fora de supabase/migrations/` | Legado | Revisão caso a caso | Preferir arquivar, remover ou neutralizar |
| `src/imports/pasted_text/*` com SQL | Import legado/colado | Não usar como operação | Preferir neutralizar |

Observação:

```txt
A presença textual de termos como CREATE TABLE, CREATE POLICY, FUNCTION, ALTER TABLE, INSERT, UPDATE ou DELETE em SQL solto não transforma o arquivo em fonte oficial de schema.
```

---

## 5. Relação com migrations oficiais

Migrations oficiais ficam em:

```txt
supabase/migrations/
```

Exemplos de migrations oficiais relevantes já documentadas:

```txt
20260509100000_add_forum_schema.sql
20260509100100_add_google_calendar_schema.sql
20260509100200_enable_rls_core_family_tables.sql
20260509100300_use_profile_role_for_forum_admin.sql
20260509143000_create_forum_topic_people.sql
20260518120000_create_user_favorites.sql
20260522121000_add_historical_file_event_category.sql
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260611003558_add_genero_to_pessoas.sql
```

Se um SQL legado contém uma tabela, policy, RPC ou trigger que ainda é necessária, o caminho correto é:

1. verificar se já existe migration equivalente;
2. comparar o banco local/remoto;
3. criar nova migration idempotente apenas para a diferença real;
4. atualizar `docs/operacao/MIGRATIONS_SUPABASE.md`;
5. testar build, testes e fluxo afetado.

---

## 6. Como classificar SQL solto novo

Antes de commitar um SQL fora de `supabase/migrations/`, classifique:

| Pergunta | Decisão |
|---|---|
| Altera schema, RLS, RPC, trigger, index, function ou grants? | Deve virar migration. |
| É diagnóstico de leitura? | Pode ficar como script temporário, mas deve ter escopo, data, ambiente e ausência de dados sensíveis. |
| Contém dados reais, UUIDs reais, nomes, e-mails ou dumps de resultado? | Não versionar. |
| É dump de produção/staging? | Não versionar. |
| É material histórico? | Mover para `docs/historico/`, documentar aqui ou neutralizar como stub. |
| É operação destrutiva? | Exige dry-run, backup e autorização explícita; preferir não versionar. |

---

## 7. Anti-regressão

Não fazer:

- usar `supabase/forum-schema.sql` como setup novo do fórum;
- usar `supabase/google-calendar-schema.sql` como setup novo da integração Google Agenda;
- usar arquivos em `src/imports/pasted_text/` como SQL operacional;
- usar `scripts/cleanup-test-user-*.sql` como limpeza operacional vigente;
- reintroduzir schema completo em stubs sem decisão explícita;
- restaurar `database-schema.sql` como guia principal de banco;
- aplicar dump local em produção;
- commitar `supabase_data.sql` com dados reais;
- commitar resultados de diagnóstico com nomes, e-mails, UUIDs ou dados reais;
- corrigir erro visual criando migration;
- resolver schema cache removendo payload correto do frontend;
- aplicar SQL destrutivo sem backup.

Fazer:

- preferir migration oficial;
- manter SQL legado versionado apenas como stub ou documentação histórica;
- confirmar projeto Supabase antes de qualquer push de banco;
- revisar RLS e policies junto da mudança;
- registrar decisões operacionais em `docs/operacao/MIGRATIONS_SUPABASE.md`;
- usar este documento apenas como histórico/prevenção.

---

## 8. Buscas recomendadas

Antes de fechar auditoria de banco:

```bash
rg --files -g "*.sql"
rg "database-schema\.sql|supabase_schema\.sql|supabase_data\.sql|forum-schema\.sql|google-calendar-schema\.sql" .
rg "diagnostico-.*\.sql|verificar-.*\.sql|cleanup-test-user" .
rg "Execute este SQL|Supabase SQL Editor|CREATE TABLE|CREATE POLICY|CREATE OR REPLACE FUNCTION|ALTER TABLE|INSERT INTO|DELETE FROM|UPDATE " supabase docs scripts src
rg "src/imports/pasted_text" .
```

Interpretação:

- ocorrências em `supabase/migrations/` são esperadas;
- ocorrências em `docs/historico/SQLS_LEGADOS.md` são esperadas e preventivas;
- ocorrências em `docs/historico/IMPORTS_COLADOS_LEGADOS.md` são esperadas e preventivas;
- ocorrências em SQL solto exigem classificação;
- ocorrências em stubs devem aparecer apenas como comentário preventivo;
- ocorrências em documentação operacional devem apontar para migrations como fonte da verdade.

---

## 9. Documentos relacionados

```txt
docs/historico/IMPORTS_COLADOS_LEGADOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/DEPLOYMENT.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/operacao/OAUTH_GOOGLE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
```

---

## 10. Critério de fechamento

Uma frente de banco/documentação só deve ser considerada limpa quando:

- `supabase/migrations/` estiver tratado como fonte da verdade;
- SQL solto estiver classificado como histórico, diagnóstico, operação pontual ou stub preventivo;
- SQL legado versionado não contiver comandos operacionais;
- dumps e dados reais não estiverem versionados;
- documentação operacional apontar para migrations;
- nenhuma orientação recomendar executar SQL legado como setup principal;
- nenhum arquivo fora de `supabase/migrations/` orientar execução direta no Supabase SQL Editor sem escopo operacional aprovado.
