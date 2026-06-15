# Imports colados legados

> Última revisão: 2026-06-14
> Local canônico: `docs/historico/IMPORTS_COLADOS_LEGADOS.md`
> Tipo: inventário histórico/preventivo de arquivos colados ou importados fora do fluxo operacional.
> Status: criado após neutralização de SQLs e diagnósticos antigos em `src/imports/pasted_text/`.

---

## 1. Objetivo

Este documento registra a política para arquivos em:

```txt
src/imports/pasted_text/
```

Essa pasta pode conter material colado durante investigações, importações, diagnósticos ou migrações manuais antigas.

Ela **não** é fonte de verdade de schema, dados, fluxo operacional, UI ou regra de produto.

Use este documento para evitar que arquivos colados sejam interpretados como:

- migration oficial;
- script operacional vigente;
- diagnóstico atual;
- base de dados real;
- regra funcional consolidada;
- fonte canônica de documentação.

---

## 2. Regra principal

```txt
Arquivos em src/imports/pasted_text/ são legado/import colado até prova em contrário.
```

Portanto:

- não executar conteúdo dessa pasta no Supabase SQL Editor;
- não usar como migration;
- não usar como diagnóstico atual;
- não usar como fonte de dados reais;
- não copiar para docs canônicos sem auditoria;
- não restaurar conteúdo antigo sem comparar com a `main`, migrations oficiais e documentação canônica.

---

## 3. Arquivos já neutralizados

Os arquivos abaixo foram identificados como risco operacional e convertidos em stubs preventivos:

| Arquivo | Tipo anterior | Status atual | Documento relacionado |
|---|---|---|---|
| `src/imports/pasted_text/genealogy-schema.txt` | schema antigo colado | stub preventivo | `docs/historico/SQLS_LEGADOS.md` |
| `src/imports/pasted_text/sibling-check.txt` | diagnóstico antigo de irmãos | stub preventivo | `docs/historico/SQLS_LEGADOS.md` |
| `src/imports/pasted_text/irmaos-relacionamento.txt` | diagnóstico/correção antiga de irmãos | stub preventivo | `docs/historico/SQLS_LEGADOS.md` |

Regras para esses arquivos:

- não reintroduzir SQL executável;
- não adicionar exemplos com dados reais;
- não incluir UUIDs, e-mails, nomes ou resultados de consulta;
- não orientar execução direta;
- recuperar conteúdo antigo apenas pelo histórico do Git, quando houver necessidade justificada de auditoria.

---

## 4. Relação com SQLs legados

Quando o arquivo colado contém SQL, schema, consulta, diagnóstico, DML ou operação de banco, a referência principal é:

```txt
docs/historico/SQLS_LEGADOS.md
```

Regra:

```txt
Todo SQL solto em src/imports/pasted_text/ deve ser tratado como legado, diagnóstico antigo ou stub preventivo.
```

A fonte oficial do schema continua sendo:

```txt
supabase/migrations/
```

---

## 5. Relação com documentação canônica

Arquivos colados não substituem:

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/GUIA_IMPLEMENTACOES.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/arquitetura/*
docs/funcionalidades/*
docs/operacao/*
```

Se algum conteúdo colado parecer útil:

1. identificar o contexto original;
2. verificar se ainda corresponde ao código atual;
3. comparar com documentação canônica vigente;
4. remover dados sensíveis ou exemplos reais;
5. registrar apenas a conclusão necessária no documento correto;
6. manter o arquivo colado como histórico, stub ou remover em frente própria.

---

## 6. Critérios de classificação

| Caso encontrado em `src/imports/pasted_text/` | Classificação | Ação recomendada |
|---|---|---|
| SQL de schema | Legado operacional | Neutralizar ou transformar em migration formal após auditoria. |
| SELECT diagnóstico | Diagnóstico antigo | Neutralizar se contiver dados reais ou orientar execução. |
| INSERT/UPDATE/DELETE | Operação potencialmente destrutiva | Neutralizar; recriar operação fora do versionamento se necessário. |
| Resultado de consulta | Dado sensível possível | Remover ou substituir por stub. |
| Texto funcional antigo | Histórico | Mover conclusão útil para doc canônico ou histórico. |
| Prompt/rascunho temporário | Artefato temporário | Remover ou mover para local não versionado. |
| Arquivo sem uso atual | Lixo histórico | Avaliar remoção em frente própria. |

---

## 7. Anti-regressão

Não fazer:

- tratar `src/imports/pasted_text/` como documentação oficial;
- executar arquivos da pasta em ambiente real;
- restaurar SQL completo em stubs preventivos;
- versionar resultados reais de diagnóstico;
- usar exemplos com dados pessoais;
- criar migration copiando conteúdo antigo sem auditoria;
- usar import colado para resolver bug visual ou problema de cache.

Fazer:

- manter stubs preventivos quando o caminho antigo tiver valor de rastreabilidade;
- mover conhecimento útil para documento canônico apropriado;
- registrar SQL legado em `docs/historico/SQLS_LEGADOS.md`;
- preferir remoção quando o arquivo não tiver função histórica clara;
- auditar com busca antes de fechar novas frentes.

---

## 8. Buscas recomendadas

```bash
rg "src/imports/pasted_text" .
rg "Supabase SQL Editor|CREATE TABLE|ALTER TABLE|INSERT INTO|UPDATE |DELETE FROM|DROP TABLE" src/imports/pasted_text docs supabase scripts
rg "@[A-Za-z0-9._%+-]+\.[A-Za-z0-9.-]+|[0-9a-fA-F-]{36}" src/imports/pasted_text
```

Interpretação:

- ocorrências em stubs preventivos são permitidas se não houver comando executável;
- ocorrências em `docs/historico/SQLS_LEGADOS.md` são preventivas;
- UUIDs, e-mails, nomes reais e resultados de consulta exigem remoção ou neutralização;
- qualquer SQL executável fora de `supabase/migrations/` exige classificação.

---

## 9. Documentos relacionados

```txt
docs/historico/SQLS_LEGADOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/README.md
```

---

## 10. Critério de fechamento

Uma auditoria de `src/imports/pasted_text/` só deve ser considerada limpa quando:

- arquivos com SQL executável estiverem neutralizados, removidos ou transformados em migration oficial;
- arquivos com resultados reais estiverem removidos ou neutralizados;
- stubs não contiverem comandos operacionais;
- docs canônicos não apontarem para a pasta como fonte vigente;
- `docs/historico/SQLS_LEGADOS.md` estiver atualizado quando houver SQL envolvido;
- `git diff --check` e `npm run build` passarem localmente.
