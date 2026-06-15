
# Deploy e operação

> Última revisão: 2026-06-14
> Local canônico: `docs/operacao/DEPLOYMENT.md`
> Tipo: checklist operacional completo de build, deploy e publicação
> Status: organizado para manter operação/deploy neste arquivo e delegar QA manual de produto para `docs/QA_MANUAL.md`.

---

## 1. Objetivo

Este documento orienta o deploy do projeto `tuliust/arvorefamilia` sem alterar schema, dados reais, secrets ou permissões fora do fluxo previsto.

Use para:

- preparar build;
- validar variáveis de ambiente;
- publicar SPA;
- configurar cache e fallback;
- validar Supabase e Edge Functions;
- proteger rotas `/api/*`;
- validar Google OAuth/Agenda;
- revisar troubleshooting pós-deploy.

Este documento não substitui:

| Tema | Documento |
|---|---|
| QA manual de produto e pós-deploy | `docs/QA_MANUAL.md` |
| Banco/schema | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Storage | `docs/operacao/STORAGE_MAINTENANCE.md` |
| OAuth Google | `docs/operacao/OAUTH_GOOGLE.md` |
| Funcionalidades da árvore | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |

---

## 2. Stack operacional

- Vite;
- React;
- TypeScript;
- Supabase;
- React Router;
- build estático em `dist/`;
- Edge Functions quando configuradas;
- rotas serverless `/api/*` quando existentes no provedor.

Scripts esperados:

```bash
npm run build
npm run dev
npm run preview
npm test
npm run test:e2e
npm run test:e2e:ui
```

---

## 3. Pré-requisitos

- Node compatível com Vite 6.
- Dependências instaladas.
- Projeto Supabase correto confirmado.
- Variáveis públicas configuradas.
- Secrets server-side fora do frontend.
- Migrations aplicadas quando o frontend depender de schema novo.
- Edge Functions publicadas quando o fluxo depender delas.
- Cache/fallback configurados no provedor.

---

## 4. Variáveis públicas do frontend

Obrigatórias:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Regras:

- `VITE_SUPABASE_ANON_KEY` é pública, mas deve pertencer ao projeto correto;
- não usar `SUPABASE_SERVICE_ROLE_KEY` no frontend;
- não prefixar service role com `VITE_`;
- não commitar `.env.local`;
- ambiente preview e produção podem apontar para projetos diferentes, mas isso deve ser intencional.

---

## 5. Secrets server-side

Secrets de Edge Functions ficam no Supabase.

Secrets de rotas serverless, como `api/ai.ts`, ficam no provedor.

Exemplos conceituais:

```bash
supabase secrets set RESEND_API_KEY="..."
supabase secrets set NOTIFICATION_EMAIL_FROM="Arvore Familia <notificacoes@seudominio.com>"
supabase secrets set SITE_URL="https://seudominio.com"
```

Para IA server-side:

```env
OPENAI_API_KEY=<server-side-secret>
OPENAI_MODEL=<opcional>
```

Regras:

- `OPENAI_API_KEY` não pode existir no frontend;
- não usar `VITE_OPENAI_API_KEY`;
- logs não devem expor dados pessoais sensíveis;
- falha de IA deve retornar erro controlado.

---

## 6. Build local

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

Quando houver rota, guard, navegação, árvore, exportação ou fluxo crítico:

```bash
npm run test:e2e
```

QA manual aplicável fica em:

```txt
docs/QA_MANUAL.md
```

Artefato esperado:

```txt
dist/
```

Observação:

```txt
Warning de chunk > 500 kB pode ser alerta conhecido de performance. Se o build termina com sucesso, não é falha automática.
```

---

## 7. Publicação estática

Publicar `dist/` em Vercel, Netlify ou provedor equivalente.

Regras:

- manter HTTPS;
- configurar domínio final;
- configurar fallback SPA;
- garantir variáveis no ambiente correto;
- não publicar build local apontando para Supabase errado;
- preservar `/api/(.*)` antes do fallback para `index.html`;
- não servir `index.html` com cache imutável.

---

## 8. Cache e fallback SPA

Política recomendada para SPA Vite com chunks versionados:

| Recurso | Cache |
|---|---|
| `/` | `no-store, max-age=0, must-revalidate` |
| `/index.html` | `no-store, max-age=0, must-revalidate` |
| `/(.*)` | `no-cache` |
| `/assets/*` | `public, max-age=31536000, immutable` |

Exemplo conceitual para Vercel:

```json
{
  "headers": [
    {
      "source": "/",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Regras:

- assets com hash podem ter cache longo;
- `index.html` não pode ter cache forte;
- fallback de `/api/(.*)` deve vir antes do fallback SPA;
- fallback SPA não deve responder HTML para asset JS inexistente como se fosse módulo.

---

## 9. Erros de chunk dinâmico

Sintomas:

```txt
Failed to fetch dynamically imported module
Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
```

Causas comuns:

- navegador manteve `index.html` antigo;
- HTML antigo aponta para chunk removido;
- fallback SPA responde `index.html` para `/assets/*.js`;
- cache/CDN externo serve HTML obsoleto.

Correção operacional:

1. conferir headers de cache;
2. testar em janela anônima;
3. abrir rotas lazy-loaded;
4. fazer hard refresh;
5. validar Safari/iOS;
6. conferir Service Worker/CDN/proxy, se existirem.

Checklist manual completo de pós-deploy:

```txt
docs/QA_MANUAL.md
```

---

## 10. Supabase e migrations

Fonte da verdade:

```txt
supabase/migrations/
```

Antes de deploy que dependa de schema novo:

1. revisar SQL;
2. confirmar projeto Supabase;
3. aplicar migration antes do frontend;
4. validar schema cache;
5. testar fluxo afetado.

Não usar como schema principal:

```txt
database-schema.sql
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
scripts SQL antigos
```

Detalhes ficam em:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## 11. Edge Functions

Antes/depois de alteração que dependa de Edge Functions:

```bash
supabase functions list
```

Deploy específico:

```bash
supabase functions deploy <nome-da-function>
```

Exemplos:

```txt
run-daily-notifications
google-calendar-auth
google-calendar-callback
google-calendar-sync
```

Regras:

- deploy frontend não publica Edge Function automaticamente;
- secrets devem estar definidos antes de testar;
- função com erro deve falhar de forma controlada no frontend.

---

## 12. Rotas `/api/*`

Se houver rotas serverless do provedor:

- garantir que `/api/(.*)` não caia no `index.html`;
- configurar secrets no provedor;
- validar resposta e status HTTP;
- impedir exposição de chave server-side no bundle.

Exemplo:

```txt
api/ai.ts
```

Regras:

- `OPENAI_API_KEY` só server-side;
- logs sem dados sensíveis;
- erro controlado para a UI.

---

## 13. Google OAuth/Agenda

Quando houver integração Google Agenda:

- confirmar domínio final;
- confirmar `/privacidade` e `/termos` públicos;
- confirmar redirect URI;
- confirmar consent screen;
- confirmar test users se app estiver em modo Testing;
- confirmar Edge Functions `google-calendar-*`;
- confirmar secrets no Supabase;
- testar conexão e desconexão.

Detalhes ficam em:

```txt
docs/operacao/OAUTH_GOOGLE.md
```

---

## 14. Admin

Regra:

```txt
Admin não depende de botão escondido no frontend.
```

Antes/depois de deploy que afete admin:

- validar acesso admin;
- validar bloqueio de usuário comum;
- validar RPCs administrativas;
- validar ações destrutivas com confirmação;
- não promover admin apenas pelo frontend.

---

## 15. Storage

Deploy visual não exige manutenção de Storage.

Storage entra no escopo quando houver:

- upload ou remoção de foto/avatar;
- arquivos históricos;
- migração de base64;
- buckets;
- policies;
- scripts administrativos.

Detalhes ficam em:

```txt
docs/operacao/STORAGE_MAINTENANCE.md
```

---

## 16. QA pós-deploy

Este documento mantém o checklist operacional. O roteiro manual completo fica em:

```txt
docs/QA_MANUAL.md
```

Checklist operacional mínimo:

- [ ] build publicado corresponde ao commit esperado;
- [ ] domínio final abre;
- [ ] cache/fallback não retorna HTML para asset JS;
- [ ] `/api/*`, quando existir, não cai no fallback SPA;
- [ ] variáveis públicas apontam para Supabase correto;
- [ ] secrets server-side não aparecem no bundle;
- [ ] Edge Functions necessárias estão publicadas;
- [ ] Google OAuth está configurado para o domínio final;
- [ ] QA manual pós-deploy foi executado ou justificado.

---

## 17. Rollback

Em caso de falha crítica:

1. identificar commit/deploy problemático;
2. reverter ou promover deploy anterior no provedor;
3. validar cache de `index.html`;
4. validar rotas críticas;
5. registrar causa;
6. abrir pendência em `PLANO_PROXIMOS_PASSOS.md` se necessário.

Nunca tentar resolver falha de schema removendo payload do frontend sem confirmar migration, schema cache e ambiente.

---

## 18. O que não fazer

- Não publicar com `.env.local` versionado.
- Não expor service role.
- Não usar secret com prefixo `VITE_`.
- Não aplicar migration em produção sem autorização.
- Não cachear `index.html` como imutável.
- Não remover rewrite de `/api/(.*)` quando houver rotas serverless.
- Não corrigir problema visual com migration.
- Não rodar scripts destrutivos sem dry-run.
- Não marcar QA como concluído sem validação real.
