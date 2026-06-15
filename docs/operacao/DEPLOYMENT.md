# Deploy e operação

> Última revisão: 2026-06-14
> Local canônico: `docs/operacao/DEPLOYMENT.md`
> Tipo: checklist operacional completo de build, deploy e publicação.
> Status: revisado para SPA Vite, Vercel/cache, Supabase, Edge Functions, rotas `/api/*`, OAuth Google e QA das views atuais da árvore.

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

- `MIGRATIONS_SUPABASE.md` para banco;
- `STORAGE_MAINTENANCE.md` para Storage;
- `OAUTH_GOOGLE.md` para OAuth Google;
- guias funcionais para UX/árvore.

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

Checklist:

```txt
/entrar
/mapa-familiar
/mapa-familiar-horizontal
/forum
/calendario-familiar
/admin
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
- confirmar Edge Functions `google-calendar-*`;
- confirmar test users quando consent screen estiver em Testing;
- validar conexão e desconexão em `/calendario-familiar`.

Detalhes em:

```txt
docs/operacao/OAUTH_GOOGLE.md
```

---

## 14. QA pós-deploy

### Rotas

```txt
/entrar
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore/editar
/calendario-familiar
/forum
/meus-favoritos
/notificacoes
/admin
```

Confirmar que não voltaram como views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### Árvore

- `/mapa-familiar` desktop/tablet;
- `/mapa-familiar` mobile;
- `/mapa-familiar-horizontal` desktop/tablet;
- `/mapa-familiar-horizontal` mobile;
- paletas;
- modal mobile;
- exportação;
- retorno de perfil.

### Mobile mínimo

```txt
320px
375px
390px
430px
```

### Calendário

- categorias mobile;
- Google Agenda quando configurada;
- ausência de overflow.

---

## 15. Admin e segurança

Validar:

- `/admin/*` bloqueia usuário comum;
- admin acessa painel;
- RPCs administrativas exigem admin;
- botões destrutivos pedem confirmação;
- erro de permissão não expõe dados;
- service role não está no bundle.

---

## 16. Rollback

Se o deploy quebrar:

1. identificar se é frontend, cache, Supabase, Edge Function ou OAuth;
2. pausar novas alterações;
3. reverter deploy no provedor quando necessário;
4. evitar migration rollback destrutivo sem plano;
5. registrar causa e correção;
6. atualizar documentação se for nova classe de problema.

---

## 17. Critérios para atualizar este documento

Atualize quando houver:

- mudança de provedor;
- alteração em `vercel.json`;
- nova rota `/api/*`;
- nova Edge Function;
- nova política de cache;
- mudança de variáveis de ambiente;
- mudança em OAuth;
- novo fluxo de QA pós-deploy.
