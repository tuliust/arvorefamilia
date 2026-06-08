# Operação e manutenção

> Última revisão: 2026-06-08  
> Local canônico: `docs/operacao/README.md`  
> Tipo: índice operacional da pasta `docs/operacao/`.

## 1. Objetivo

Esta pasta reúne procedimentos operacionais que podem afetar infraestrutura, banco, Storage, deploy, migrations, secrets ou dados reais.

Ela não substitui os guias canônicos da raiz de `docs/`. Use os documentos de operação quando a tarefa envolver:

- deploy e publicação;
- variáveis de ambiente;
- Supabase migrations;
- Edge Functions;
- manutenção de Storage;
- scripts administrativos;
- dry-run de limpeza;
- operações com service role;
- dados legados;
- execução de comandos que podem alterar infraestrutura ou dados.

## 2. Documentos desta pasta

| Arquivo | Função |
|---|---|
| `DEPLOYMENT.md` | Checklist de build, variáveis, deploy estático, Supabase, Edge Functions e cuidados antes/depois da publicação. |
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, `supabase migration list`, `supabase db push`, schema cache, RLS, RPCs e SQL legado. |
| `STORAGE_MAINTENANCE.md` | Diagnóstico de objetos órfãos, migração de base64 legado, buckets, scripts administrativos e limpeza auditada de Storage. |

## 3. Relação com outros documentos

| Documento | Papel |
|---|---|
| `../README.md` | Índice canônico da documentação do projeto. |
| `../GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que está implementado. |
| `../GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. |
| `../PLANO_PROXIMOS_PASSOS.md` | Pendências reais identificadas na auditoria documental. |
| `../arquitetura/ARCHITECTURE.md` | Visão técnica geral da aplicação. |
| `../arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de dados, tabelas, vínculos e objetos legados. |
| `../historico/QA_FINAL_MVP.md` | Registro histórico de QA de fase. |

## 4. Regras operacionais permanentes

- Nunca versionar `.env`, `.env.local`, dumps, tokens, secrets, API keys ou service role.
- Nunca usar service role no frontend.
- Nunca aplicar SQL em produção sem revisão, backup e confirmação explícita.
- Nunca tratar SQL legado como fonte principal de schema.
- Preferir `supabase/migrations/` como fonte da verdade do banco.
- Executar scripts destrutivos apenas com dry-run prévio e flag explícita.
- Não misturar limpeza de Storage com migration de schema.
- Não apagar dados reais sem plano de rollback.
- Registrar no plano apenas pendências reais, não histórico longo de implementação concluída.

## 5. Ordem segura para tarefas operacionais

1. Ler o documento específico desta pasta.
2. Conferir branch, ambiente e projeto Supabase.
3. Confirmar variáveis necessárias.
4. Rodar comandos não destrutivos primeiro.
5. Revisar relatório, diff ou saída.
6. Executar ação de escrita apenas quando houver confirmação explícita.
7. Validar UI/fluxos afetados.
8. Registrar ajustes documentais ou pendências reais em `PLANO_PROXIMOS_PASSOS.md`.

## 6. Comandos técnicos mínimos

```bash
git status --short
git diff --check
npm run build
```

Quando houver testes afetados:

```bash
npm test
npm run test:e2e
```

Quando houver banco ou Edge Functions:

```bash
supabase migration list
supabase functions list
```

## 7. Arquivos que não pertencem aqui

Não colocar nesta pasta:

- documentação funcional detalhada de uma página ou módulo;
- decisões visuais de UX;
- changelog longo de ciclos concluídos;
- diagnóstico histórico que não seja procedimento atual;
- SQL avulso sem contexto operacional.

Esses conteúdos devem ficar em `docs/funcionalidades/`, `docs/historico/`, `docs/GUIA_UX_LAYOUT.md`, `docs/GUIA_COMPONENTES.md` ou `docs/GUIA_CORRECAO_ERROS.md`.
