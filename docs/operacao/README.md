# Operação e manutenção

> Última revisão: 2026-06-14  
> Local canônico: `docs/operacao/README.md`  
> Tipo: índice operacional da pasta `docs/operacao`.  
> Status: revisado para separar deploy, migrations, Storage e OAuth sem duplicar os guias funcionais.

---

## 1. Objetivo

A pasta `docs/operacao/` reúne procedimentos que podem afetar publicação, infraestrutura, banco, Edge Functions, Storage, secrets, OAuth, rotas serverless ou dados reais.

Use esta pasta quando a tarefa envolver:

- deploy;
- variáveis de ambiente;
- Supabase migrations;
- Edge Functions;
- rotas serverless `/api/*`;
- Google OAuth/Agenda;
- manutenção de Storage;
- scripts administrativos;
- service role;
- dry-run de limpeza;
- dados reais.

Não use esta pasta para explicar layout da árvore, regras visuais ou componentes. Para isso, use os documentos funcionais e guias da raiz de `docs/`.

---

## 2. Regra principal

```txt
Ajuste visual, paleta, modal, calendário mobile, exportação visual ou documentação não exige migration.
Alteração de schema, RLS, RPC, trigger, Storage policy, bucket ou Edge Function exige revisão operacional.
```

---

## 3. Documentos operacionais

| Arquivo | Função | Status |
|---|---|---|
| `DEPLOYMENT.md` | checklist completo de build, deploy, cache SPA, variáveis, Supabase, Edge Functions, `/api/*`, OAuth e QA pós-deploy | canônico para deploy |
| `DEPLOY.md` | atalho curto para publicação | complementar |
| `MIGRATIONS_SUPABASE.md` | fluxo seguro de migrations, schema, RLS, RPCs e scripts SQL | canônico para banco |
| `STORAGE_MAINTENANCE.md` | diagnóstico de órfãos, base64 legado, buckets e scripts de Storage | canônico para Storage |
| `OAUTH_GOOGLE.md` | consent screen, redirect URI, test users, secrets e Google Agenda | canônico para OAuth Google |

---

## 4. Relação com a documentação funcional

| Documento | Quando consultar |
|---|---|
| `../README.md` | índice geral da documentação |
| `../BASELINE_PRODUTO_ATUAL.md` | estado funcional vigente |
| `../GUIA_IMPLEMENTACOES.md` | implementação consolidada versus backlog |
| `../GUIA_COMPONENTES.md` | responsabilidades dos componentes |
| `../GUIA_UX_LAYOUT.md` | decisões visuais e responsividade |
| `../REGRAS_DE_NAO_REGRESSAO.md` | checklists de regressão |
| `../PLANO_PROXIMOS_PASSOS.md` | pendências reais |
| `../arquitetura/ARCHITECTURE.md` | arquitetura geral |
| `../arquitetura/ROTAS_E_GUARDS.md` | rotas, guards e TreeViewMode |
| `../funcionalidades/CALENDARIO_FAMILIAR.md` | comportamento funcional do calendário |
| `../funcionalidades/EXPORTACAO_ARVORE.md` | exportação da árvore |
| `../historico/README.md` | histórico e docs legados |

---

## 5. Regras permanentes

- Não versionar `.env`, `.env.local`, dumps, tokens, API keys, service role ou dados reais.
- Não usar service role no frontend.
- Não prefixar secrets server-side com `VITE_`.
- Não aplicar SQL em produção sem autorização explícita.
- Não rodar script destrutivo sem dry-run.
- Não misturar limpeza de Storage com migration de schema.
- Não resolver problema visual criando migration.
- Não alterar RLS, Auth, Storage ou Edge Function para corrigir layout.
- Não deixar fallback SPA capturar `/api/*`.
- Não cachear `index.html` como imutável em SPA Vite.
- Registrar riscos e pendências reais em `docs/PLANO_PROXIMOS_PASSOS.md`.

---

## 6. Ordem segura para tarefas operacionais

1. Confirmar branch, ambiente e projeto Supabase.
2. Ler o documento operacional específico.
3. Conferir variáveis necessárias.
4. Rodar comandos não destrutivos.
5. Revisar diff, relatório ou saída.
6. Executar escrita apenas com confirmação explícita.
7. Validar UI/fluxos afetados.
8. Atualizar documentação ou plano, se houver pendência.

---

## 7. Comandos mínimos

Antes de deploy ou alteração relevante:

```bash
git status --short
git diff --check
npm run build
```

Quando houver teste afetado:

```bash
npm test
npm run test:e2e
```

Quando houver banco:

```bash
supabase migration list
```

Quando houver Edge Functions:

```bash
supabase functions list
```

Quando houver alteração documental ampla:

```bash
git diff --check -- docs/
npm run build
```

---

## 8. Mudanças que não exigem operação de banco

Exemplos:

- ajuste de `/mapa-familiar` mobile;
- ajuste de `/mapa-familiar-horizontal` mobile;
- paletas da árvore;
- modal mobile de controles;
- cards do painel;
- conectores visuais;
- fallback visual de avatar;
- bolinhas e botões do calendário mobile;
- exportação client-side;
- documentação.

Essas mudanças podem exigir build, testes e QA visual, mas não migration.

---

## 9. Mudanças que exigem revisão operacional

Exemplos:

- nova coluna/tabela/índice/constraint;
- nova ou alterada RPC;
- mudança de RLS/policy;
- trigger/function SQL;
- bucket ou policy de Storage;
- Edge Function;
- secret;
- redirect URI OAuth;
- rota serverless `/api/*`;
- scripts com service role;
- limpeza ou migração de arquivos reais.

---

## 10. Critério de atualização deste índice

Atualize `docs/operacao/README.md` quando:

- novo documento operacional for criado;
- `DEPLOY.md` ou `DEPLOYMENT.md` mudar de papel;
- surgir nova integração server-side;
- scripts administrativos forem adicionados;
- política operacional de banco, Storage, OAuth ou deploy mudar.
