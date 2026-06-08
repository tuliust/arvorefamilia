# Deploy e operação

> Última revisão: 2026-06-08  
> Local canônico: `docs/operacao/DEPLOYMENT.md`  
> Tipo: checklist operacional de build, deploy e publicação.

## 1. Objetivo

Este documento orienta a publicação do projeto `tuliust/arvorefamilia` sem alterar schema, dados reais ou permissões fora do fluxo previsto.

Use este arquivo para:

- preparar build;
- revisar variáveis de ambiente;
- validar Supabase antes/depois do deploy;
- publicar SPA estática;
- checar Edge Functions;
- evitar exposição de secrets;
- separar deploy frontend de migration de banco.

## 2. Stack operacional

O projeto usa Vite, React, TypeScript, Supabase e Tailwind. Os scripts versionados em `package.json` são:

```bash
npm run build
npm run dev
npm run preview
npm test
npm run test:e2e
npm run test:e2e:ui
```

## 3. Pré-requisitos

- Node.js compatível com Vite 6.
- Dependências instaladas com o gerenciador usado no projeto.
- Projeto Supabase correto identificado.
- Variáveis públicas do frontend configuradas no provedor de deploy.
- Migrations já revisadas quando houver alteração de banco.
- Edge Functions publicadas quando a frente depender delas.

## 4. Variáveis de ambiente do frontend

Obrigatórias para a SPA:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Regras:

- `VITE_SUPABASE_ANON_KEY` é pública por natureza, mas ainda deve pertencer ao projeto correto.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Nunca prefixar service role com `VITE_`.
- Nunca commitar `.env.local`.

## 5. Secrets server-side e Edge Functions

Secrets de Edge Functions devem ficar no Supabase, não no repositório.

Exemplos usados pelo projeto:

```bash
supabase secrets set RESEND_API_KEY="..."
supabase secrets set NOTIFICATION_EMAIL_FROM="Arvore Familia <notificacoes@seudominio.com>"
supabase secrets set NOTIFICATION_EMAIL_REPLY_TO="contato@seudominio.com"
supabase secrets set SITE_URL="https://seudominio.com"
```

Rotinas/documentos relacionados:

- `docs/funcionalidades/NOTIFICACOES.md`
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`
- `docs/operacao/MIGRATIONS_SUPABASE.md`

## 6. Build

Comandos mínimos:

```bash
npm install
npm run build
```

Artefato esperado:

```txt
dist/
```

Antes de publicar:

```bash
git status --short
git diff --check
npm run build
```

Quando houver alteração funcional relevante:

```bash
npm test
```

Quando houver alteração de rota, autenticação, navegação, árvore ou fluxo crítico:

```bash
npm run test:e2e
```

## 7. Deploy estático

Publicar `dist/` em Vercel, Netlify ou provedor equivalente.

Regras para SPA:

- configurar fallback para `index.html`, quando o provedor exigir;
- manter HTTPS;
- configurar domínio final;
- conferir variáveis no ambiente correto;
- não publicar build local com variáveis de projeto errado.

## 8. Supabase e migrations

Fonte da verdade do banco:

```txt
supabase/migrations/
```

Antes de aplicar em remoto:

1. Revisar SQL.
2. Confirmar projeto Supabase.
3. Fazer backup quando envolver dados reais.
4. Aplicar primeiro em local/staging quando possível.
5. Conferir `supabase migration list`.
6. Testar login, admin, árvore, perfil, fórum, notificações, arquivos históricos e Google Agenda quando afetados.

Não usar como schema principal:

```txt
database-schema.sql
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
diagnostico-*.sql
verificar-irmaos.sql
corrigir-pessoa-isolada.sql
```

Esses arquivos são referência histórica ou scripts pontuais. O fluxo seguro está em `MIGRATIONS_SUPABASE.md`.

## 9. Admin

A permissão administrativa atual deve ser controlada no banco e validada pela RPC de admin usada pelo frontend.

Regra atual:

```txt
não depender de fallback por e-mail no frontend.
```

Para promover admin, usar procedimento controlado no banco, por exemplo:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-id>';
```

Depois validar:

- login admin;
- acesso a `/admin`;
- bloqueio de usuário comum em rotas admin;
- retorno seguro quando `is_admin_user` falhar.

## 10. Ferramentas destrutivas

Ferramentas de migração/importação administrativa podem apagar dados se usadas incorretamente.

Regras:

- não executar em produção sem autorização explícita;
- confirmar ambiente;
- revisar código da tela/serviço antes de usar;
- garantir backup;
- exigir confirmação textual quando a UI solicitar;
- documentar resultado.

Se uma ferramenta estiver bloqueada por variável, manter bloqueada em produção.

## 11. Edge Functions

Antes/depois de alterações em notificações, e-mail ou Google Agenda:

```bash
supabase functions list
```

Deploy específico:

```bash
supabase functions deploy <nome-da-function>
```

Exemplos relevantes:

```txt
run-daily-notifications
send-notification-email
```

Regras:

- secrets ficam no Supabase;
- service role só dentro de Edge Function/backend confiável;
- cron automático não deve hardcodar secret em migration;
- falha de canal externo não deve desfazer notificação interna.

## 12. Checklist antes do deploy

```bash
git status --short
git diff --check
npm run build
```

Verificar manualmente, conforme escopo alterado:

- `/entrar`;
- `/minha-arvore`;
- `/genealogia`;
- `/visao-completa`;
- `/minha-arvore/editar`;
- `/pessoa/:id`;
- `/forum`;
- `/notificacoes`;
- `/calendario-familiar`;
- `/admin`.

## 13. Checklist depois do deploy

- Abrir domínio final.
- Conferir login.
- Conferir rota protegida.
- Conferir rota admin com usuário autorizado.
- Conferir bloqueio admin com usuário comum.
- Conferir carregamento da árvore.
- Conferir console sem erro crítico.
- Conferir Supabase Auth/Storage quando a frente afetar arquivos.
- Conferir Edge Functions quando a frente afetar notificações/e-mail/Google Agenda.

## 14. Não fazer

- Não usar `git add .` no commit documental final.
- Não commitar `.env.local`.
- Não expor service role.
- Não aplicar migrations como parte de deploy frontend sem autorização.
- Não usar SQL legado como fonte principal.
- Não liberar ferramenta destrutiva em produção por conveniência.
- Não tratar warning de chunk grande como erro de deploy se o build passou e o warning já for conhecido.

## 15. Documentos relacionados

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/funcionalidades/NOTIFICACOES.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/GUIA_CORRECAO_ERROS.md
```
