# SQLs legados e documentos antigos de banco

> Última revisão: 2026-06-14
> Local canônico: `docs/historico/SQLS_LEGADOS.md`
> Tipo: inventário histórico/preventivo de SQLs fora de `supabase/migrations/`.
> Status: criado para evitar uso acidental de SQL solto como fonte da verdade do schema.

---

## 1. Objetivo

Este documento registra SQLs soltos, scripts históricos e referências antigas de banco que podem aparecer no repositório ou na documentação.

Ele existe para evitar regressões operacionais, principalmente:

- aplicar schema antigo em ambiente novo;
- executar SQL solto como se fosse migration oficial;
- confundir diagnóstico com fonte de verdade;
- restaurar modelo de dados antigo por cópia manual;
- versionar dump, backup ou dados reais.

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
- artefato temporário não versionado.

Não usar SQL solto para montar ambiente novo sem antes transformar a mudança em migration revisada.

---

## 3. SQLs soltos identificados

| Arquivo | Classificação | Uso permitido | Status |
|---|---|---|---|
| `supabase/forum-schema.sql` | SQL legado/histórico do fórum | Consulta histórica ou comparação com migrations oficiais | Não usar como schema principal. |
| `supabase/google-calendar-schema.sql` | SQL legado/histórico da integração Google Agenda | Consulta histórica ou comparação com migrations oficiais | Não usar como schema principal. |
| `database-schema.sql` | Referência antiga possível/documentada | Se existir localmente, tratar como histórico ou dump estrutural | Não usar como fonte da verdade. |
| `supabase_schema.sql` | Dump/backup possível | Não versionar se contiver dados reais ou estrutura obsoleta | Não usar como migration. |
| `supabase_data.sql` | Dump/backup possível | Não versionar se contiver dados reais | Não aplicar em ambiente real sem revisão. |
| `diagnostico-*.sql` | Diagnóstico pontual | Executar apenas em ambiente controlado | Não converter em schema. |
| `verificar-irmaos.sql` | Diagnóstico pontual possível | Executar apenas para investigação específica | Não converter em schema. |
| `scripts SQL antigos fora de supabase/migrations/` | Legado | Revisão caso a caso | Preferir arquivar/remover. |

Observação:

```txt
A presença de `CREATE TABLE`, `CREATE POLICY`, `CREATE FUNCTION` ou `ALTER TABLE` em SQL solto não transforma o arquivo em fonte oficial de schema.
```

---

## 4. Relação com migrations oficiais

Migrations oficiais ficam em:

```txt
supabase/migrations/
```

Exemplos de migrations oficiais relevantes já documentadas:

```txt
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

## 5. Como classificar SQL solto novo

Antes de commitar um SQL fora de `supabase/migrations/`, classifique:

| Pergunta | Decisão |
|---|---|
| Altera schema, RLS, RPC, trigger, index, function ou grants? | Deve virar migration. |
| É diagnóstico de leitura? | Pode ficar em script temporário, com comentário e escopo. |
| Contém dados reais? | Não versionar. |
| É dump de produção/staging? | Não versionar. |
| É material histórico? | Mover para `docs/historico/` ou documentar aqui. |
| É operação destrutiva? | Exige dry-run, backup e autorização explícita. |

---

## 6. Anti-regressão

Não fazer:

- usar `supabase/forum-schema.sql` como setup novo do fórum;
- usar `supabase/google-calendar-schema.sql` como setup novo da integração Google Agenda;
- restaurar `database-schema.sql` como guia principal de banco;
- aplicar dump local em produção;
- commitar `supabase_data.sql` com dados reais;
- corrigir erro visual criando migration;
- resolver schema cache removendo payload correto do frontend;
- aplicar SQL destrutivo sem backup.

Fazer:

- preferir migration oficial;
- confirmar projeto Supabase antes de qualquer push de banco;
- revisar RLS e policies junto da mudança;
- registrar decisões operacionais em `docs/operacao/MIGRATIONS_SUPABASE.md`;
- usar este documento apenas como histórico/prevenção.

---

## 7. Buscas recomendadas

Antes de fechar auditoria de banco:

```bash
rg "database-schema\.sql|supabase_schema\.sql|supabase_data\.sql|forum-schema\.sql|google-calendar-schema\.sql" .
rg "diagnostico-.*\.sql|verificar-.*\.sql" .
rg "CREATE TABLE|CREATE POLICY|CREATE OR REPLACE FUNCTION|ALTER TABLE" supabase docs scripts src
```

Interpretação:

- ocorrências em `supabase/migrations/` são esperadas;
- ocorrências em `docs/historico/SQLS_LEGADOS.md` são preventivas;
- ocorrências em SQL solto exigem classificação;
- ocorrências em documentação operacional devem apontar para migrations como fonte da verdade.

---

## 8. Documentos relacionados

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/DEPLOYMENT.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/operacao/OAUTH_GOOGLE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
```

---

## 9. Critério de fechamento

Uma frente de banco/documentação só deve ser considerada limpa quando:

- `supabase/migrations/` estiver tratado como fonte da verdade;
- SQL solto estiver classificado como histórico, diagnóstico ou operação pontual;
- dumps e dados reais não estiverem versionados;
- documentação operacional apontar para migrations;
- nenhuma orientação recomendar executar SQL legado como setup principal.
