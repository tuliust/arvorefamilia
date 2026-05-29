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
# README antigo da documentacao

## Objetivo historico

Este arquivo era um resumo antigo do estado do sistema e da documentacao criada em uma fase inicial do projeto.

Ele citava contagens, diagnosticos e arquivos antigos relacionados a:

```txt
irmaos
setup de banco
schema SQL
diagnosticos
erros e solucoes
migracao de seed
```

## Aviso sobre validade dos dados

Numeros, contagens e conclusoes deste arquivo pertencem a um diagnostico antigo. Eles nao devem ser usados para validar o banco atual, o seed atual ou o estado atual das migrations.

Para validacao corrente, usar:

```txt
docs/historico/QA_FINAL_MVP.md
docs/GUIA_CORRECAO_ERROS.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

## Por que foi tornado obsoleto

O projeto passou a usar `docs/README.md` como indice canonico e separou a documentacao em guias oficiais, arquitetura, funcionalidades, operacao e historico.

## Regra de uso

Nao usar este arquivo como resumo atual do projeto.

Use:

```txt
docs/README.md
```

como ponto de entrada.

## Para onde migrar informacoes uteis

| Tipo de informacao | Documento atual |
|---|---|
| Estado implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX/layout | `docs/GUIA_UX_LAYOUT.md` |
| Correcao de erros | `docs/GUIA_CORRECAO_ERROS.md` |
| Banco/migrations | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| QA/historico | `docs/historico/` |
