# Deploy e operação

> Última revisão: 2026-06-09  
> Local canônico: `docs/operacao/DEPLOYMENT.md`  
> Tipo: checklist operacional de build, deploy e publicação.  
> Status: revisado com política de cache real para SPA Vite/Vercel, troubleshooting pós-deploy de chunks dinâmicos e validação em Safari/iOS.

## 1. Objetivo

Este documento orienta a publicação do projeto `tuliust/arvorefamilia` sem alterar schema, dados reais ou permissões fora do fluxo previsto.

Use este arquivo para:

- preparar build;
- revisar variáveis de ambiente;
- validar Supabase antes/depois do deploy;
- publicar SPA estática;
- configurar cache e fallback de SPA;
- checar Edge Functions;
- evitar exposição de secrets;
- separar deploy frontend de migration de banco.

---

## 2. Stack operacional

O projeto usa:

- Vite;
- React;
- TypeScript;
- Supabase;
- Tailwind;
- React Router;
- build estático em `dist/`.

Scripts versionados em `package.json`:

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

- Node.js compatível com Vite 6.
- Dependências instaladas com o gerenciador usado no projeto.
- Projeto Supabase correto identificado.
- Variáveis públicas do frontend configuradas no provedor de deploy.
- Migrations já revisadas quando houver alteração de banco.
- Edge Functions publicadas quando a frente depender delas.
- Política de cache/fallback configurada no provedor de hospedagem.

---

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
- Confirmar se o ambiente de preview e produção apontam para o Supabase esperado.

---

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

- `docs/funcionalidades/NOTIFICACOES.md`;
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

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

Observação:

```txt
Warning de chunk > 500 kB pode ser conhecido no projeto. Tratar como alerta de performance, não como falha de deploy, se o build terminou com sucesso.
```

---

## 7. Deploy estático

Publicar `dist/` em Vercel, Netlify ou provedor equivalente.

Regras para SPA:

- configurar fallback para `index.html`;
- manter HTTPS;
- configurar domínio final;
- conferir variáveis no ambiente correto;
- não publicar build local com variáveis de projeto errado;
- garantir que `index.html` não seja servido com cache forte;
- garantir que assets versionados em `/assets/*` possam usar cache longo.

---

## 8. Fallback e cache para SPA Vite

O projeto usa arquivos gerados com hash, por exemplo:

```txt
/assets/Home-BvI21Gz3.js
/assets/ForumHome-Dx8g5_9f.js
/assets/vendor-react-Dxcc5Yb4.js
```

Esses arquivos mudam a cada build. Por isso, a política correta é:

| Recurso | Cache recomendado | Motivo |
|---|---|---|
| `/` | `no-store, max-age=0, must-revalidate` | evitar HTML antigo apontando para chunks removidos |
| `/index.html` | `no-store, max-age=0, must-revalidate` | sempre buscar manifesto/chunks atuais |
| `/(.*)` | `no-cache` | fallback amplo conservador para rotas SPA fora de assets |
| `/assets/*` | `public, max-age=31536000, immutable` | arquivos têm hash e podem ser cacheados |

Configuração Vercel esperada no projeto:

```json
{
  "headers": [
    {
      "source": "/",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Regras:

```txt
Nunca deixar index.html com cache imutável em SPA Vite com code splitting.
Não remover o fallback de /api/(.*) se houver rotas/API servidas pelo provedor.
```

---

## 9. Erro de chunk dinâmico após deploy

Sintomas:

```txt
Failed to fetch dynamically imported module
Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
```

Exemplo de causa:

```txt
Navegador mantém index.html antigo.
Esse HTML aponta para /assets/Home-antigo.js.
O deploy atual não possui mais esse chunk.
O fallback SPA responde index.html para a URL do asset.
O navegador rejeita porque esperava JavaScript e recebeu text/html.
```

Correção implementada no frontend:

- captura global de erro de import dinâmico em `src/main.tsx`;
- tentativa best-effort de limpeza de caches;
- reload uma vez com parâmetro `__reload`;
- liberação da proteção após carregamento estável.

Correção operacional:

- garantir headers de cache do `vercel.json`;
- após deploy, testar em janela anônima;
- usar hard refresh quando necessário;
- no Safari/iOS, validar também em aba privada;
- se persistir em iPhone/iPad, orientar apagar dados do site em Ajustes > Safari > Avançado > Dados dos Sites;
- se persistir em usuários finais, orientar limpar cache do domínio;
- verificar se Service Worker, proxy, CDN ou cache externo está servindo HTML antigo.

Checklist específico:

```txt
1. Abrir domínio final.
2. Abrir /forum.
3. Abrir /minha-arvore.
4. Abrir /genealogia.
5. Abrir /visao-completa.
6. Navegar entre rotas lazy-loaded.
7. Verificar console para erros de dynamic import.
```

---

## 10. Supabase e migrations

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

Quando frontend depende de nova RPC/coluna:

```txt
Aplicar migration antes do deploy frontend.
```

Exemplo recente:

```txt
admin_reset_person_profile(target_pessoa_id uuid)
```

Se a função não existir no remoto, `/admin/pessoas` retorna `PGRST202` ao resetar perfil.

---

## 11. Admin

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
- retorno seguro quando `is_admin_user` falhar;
- botões destrutivos exigindo confirmação;
- RPCs admin com `security definer` e validação interna.

---

## 12. Ferramentas destrutivas

Ferramentas de migração/importação administrativa podem apagar dados se usadas incorretamente.

Regras:

- não executar em produção sem autorização explícita;
- confirmar ambiente;
- revisar código da tela/serviço antes de usar;
- garantir backup;
- exigir confirmação textual quando a UI solicitar;
- documentar resultado.

Se uma ferramenta estiver bloqueada por variável, manter bloqueada em produção.

---

## 13. Edge Functions

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
generate-person-insights
google-calendar-auth
google-calendar-callback
google-calendar-sync
```

Regras:

- secrets ficam no Supabase;
- service role só dentro de Edge Function/backend confiável;
- cron automático não deve hardcodar secret em migration;
- falha de canal externo não deve desfazer notificação interna;
- frontend não deve manipular tokens OAuth sensíveis.

---

## 14. Checklist antes do deploy

```bash
git status --short
git diff --check
npm run build
```

Quando houver alteração de banco:

```bash
supabase migration list
```

Quando houver alteração de Edge Function:

```bash
supabase functions list
```

Verificar manualmente, conforme escopo alterado:

- `/entrar`;
- `/minha-arvore`;
- `/genealogia`;
- `/visao-completa`;
- `/minha-arvore/editar`;
- `/pessoa/:id`;
- `/forum`;
- `/forum/novo`;
- `/forum/topico/:id`;
- `/notificacoes`;
- `/calendario-familiar`;
- `/admin`;
- `/admin/pessoas`.

---

## 15. Checklist depois do deploy

- Abrir domínio final.
- Conferir login.
- Conferir rota protegida.
- Conferir rota admin com usuário autorizado.
- Conferir bloqueio admin com usuário comum.
- Conferir carregamento da árvore.
- Conferir `/forum` sem erro de chunk dinâmico.
- Conferir `/forum/novo` e edição de tópico se a frente de fórum foi alterada.
- Conferir modal conjugal se a frente de árvore/perfil foi alterada.
- Conferir console sem erro crítico.
- Conferir Supabase Auth/Storage quando a frente afetar arquivos.
- Conferir Edge Functions quando a frente afetar notificações/e-mail/Google Agenda.
- Conferir se nenhuma migration pendente ficou sem aplicar quando o frontend depende dela.

---

## 16. Troubleshooting rápido pós-deploy

| Sintoma | Causa provável | Ação |
|---|---|---|
| `Failed to fetch dynamically imported module` | HTML antigo apontando para chunk removido | hard refresh, validar cache headers, testar anônimo |
| MIME `text/html` para `.js` | fallback SPA respondendo `index.html` para asset inexistente | revisar `vercel.json`, cache de `index.html` e CDN |
| Erro só no Safari/iOS após deploy | cache local do domínio ou aba antiga com HTML anterior | testar aba privada e limpar dados do site em Ajustes > Safari |
| RPC `PGRST202` | migration não aplicada ou schema cache atrasado | aplicar migration, validar função no banco, `notify pgrst, 'reload schema'` |
| Campo novo não existe | migration ausente no remoto | aplicar migration antes do frontend |
| Upload falha | bucket/policy/env incorreto | revisar Storage/RLS e `storageService.ts` |
| Admin comum acessando rota | guard/RPC/RLS incorretos | revisar `ProtectedRoute`, `is_admin_user` e policies |
| Tela branca sem build error | erro runtime/lazy import | abrir console, testar anônimo, checar chunks e imports |

---

## 17. Não fazer

- Não usar `git add .` no commit documental final.
- Não commitar `.env.local`.
- Não expor service role.
- Não aplicar migrations como parte de deploy frontend sem autorização.
- Não usar SQL legado como fonte principal.
- Não liberar ferramenta destrutiva em produção por conveniência.
- Não tratar warning de chunk grande como erro de deploy se o build passou e o warning já for conhecido.
- Não cachear `index.html` como imutável.
- Não contornar migration ausente removendo payload de campo novo no frontend.
- Não corrigir permissão apenas escondendo botão visual.

---

## 18. Documentos relacionados

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/funcionalidades/NOTIFICACOES.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/FORUM.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```
