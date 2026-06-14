# Deploy

> Última revisão: 2026-06-14  
> Local canônico: `docs/operacao/DEPLOY.md`  
> Tipo: atalho operacional de deploy.  
> Status: documento complementar; o guia completo permanece em `docs/operacao/DEPLOYMENT.md`.

## 1. Objetivo

Este arquivo existe como atalho rápido para publicação. Para procedimento completo, variáveis, cache SPA, Supabase, Edge Functions, Google OAuth, `/api/*`, troubleshooting e QA pós-deploy, use:

```txt
docs/operacao/DEPLOYMENT.md
```

---

## 2. Checklist mínimo

Antes de publicar:

```bash
git status --short
git diff --check
npm run build
```

Quando houver alteração relevante:

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

---

## 3. Regras rápidas

- Publicar `dist/`.
- Não commitar `.env.local`.
- Não expor service role.
- Não usar secret com prefixo `VITE_`.
- Não aplicar migration junto do deploy sem autorização.
- Não cachear `index.html` como imutável.
- Preservar rewrite de `/api/(.*)` antes do fallback SPA.
- Validar `/entrar`, login, árvore, fórum, calendário e admin conforme escopo.
- Para Mapa Familiar, validar `/mapa-familiar` e `/mapa-familiar-horizontal` no desktop e mobile.

---

## 4. Mapa Familiar e mobile

Quando o deploy incluir alterações recentes da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore
/genealogia
/visao-completa
```

QA mobile mínimo:

```txt
320px
375px
390px
430px
```

Regras:

- `/mapa-familiar-horizontal` mobile usa `MobileFamilyHorizontalMapView`;
- cada geração aparece em uma tela;
- swipe lateral troca geração;
- a barra `Paterno | Central | Materno` não pertence à horizontal mobile;
- painel mobile dos mapas abre como modal de controles;
- `MobileTreeControlsPortal` não duplica painel em `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 5. Documento completo

Consulte sempre:

```txt
docs/operacao/DEPLOYMENT.md
```
