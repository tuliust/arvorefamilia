> Status: documento historico / obsoleto.
> Local: `docs/historico/documentacao-antiga/`.
> Nao usar como fonte canonica para desenvolvimento atual.
>
> Este arquivo foi preservado apenas para rastreabilidade historica. O conteudo original citava rotas, scripts SQL, endpoints, dados de seed, senhas, numeros de registros ou fluxos que nao representam mais o estado atual do projeto.

---

## Fontes canonicas atuais

Use os documentos abaixo como fonte de verdade:

```txt
docs/README.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/GUIA_CORRECAO_ERROS.md
docs/historico/QA_FINAL_MVP.md
```

---
# Guia antigo de migracao Supabase

## Objetivo historico

Este arquivo descrevia um fluxo antigo de criacao de schema e migracao de dados baseado em:

```txt
database-schema.sql
seed
/admin/migrar-dados
endpoints legados de API
```

## Aviso operacional

Nao executar `database-schema.sql`, rotinas destrutivas antigas ou endpoints legados como fonte principal de schema em ambiente atual.

A fonte principal de schema do projeto atual e:

```txt
supabase/migrations/
```

O fluxo operacional atual esta documentado em:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

## Por que foi tornado obsoleto

O projeto passou a consolidar banco, RLS, RPCs e alteracoes de schema em migrations versionadas. Scripts SQL soltos e guias antigos devem ser tratados como referencia historica, nao como procedimento padrao.

## Regra de uso

Antes de qualquer operacao de banco:

```txt
1. Consultar docs/operacao/MIGRATIONS_SUPABASE.md.
2. Conferir supabase/migrations/.
3. Validar ambiente.
4. Fazer backup quando aplicavel.
5. Rodar build/testes.
6. Aplicar apenas com autorizacao explicita.
```

## Para onde migrar informacoes uteis

| Assunto | Documento atual |
|---|---|
| Fluxo de migrations | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Estrutura de banco | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Erros de Supabase/RLS | `docs/GUIA_CORRECAO_ERROS.md` |
| QA final | `docs/historico/QA_FINAL_MVP.md` |
