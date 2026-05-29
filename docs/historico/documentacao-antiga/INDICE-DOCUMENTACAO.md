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
# Indice de documentacao antigo

## Objetivo historico

Este arquivo funcionava como um indice antigo da documentacao inicial do projeto, reunindo referencias a arquivos como:

```txt
RESPOSTA-RAPIDA-IRMAOS.md
SETUP-BANCO-DADOS.md
COMO-FUNCIONA-IRMAOS.md
RELATORIO-DIAGNOSTICO-COMPLETO.md
ERROS-E-SOLUCOES.md
MIGRATION-GUIDE.md
```

## Por que foi tornado obsoleto

O projeto passou a usar uma estrutura documental nova, organizada por escopo:

```txt
docs/
  README.md
  arquitetura/
  funcionalidades/
  operacao/
  historico/
```

O indice canonico atual e:

```txt
docs/README.md
```

## Regra de uso

Nao usar este arquivo para localizar documentacao atual. Ele deve permanecer apenas como registro de uma organizacao anterior.

## Para onde migrar informacoes uteis

| Tipo de informacao | Documento atual |
|---|---|
| Indice geral | `docs/README.md` |
| Banco, schema e usuarios | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Migrations e Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Erros e troubleshooting | `docs/GUIA_CORRECAO_ERROS.md` |
| Historico/QA | `docs/historico/` |
