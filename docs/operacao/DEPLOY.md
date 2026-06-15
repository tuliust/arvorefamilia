# Deploy

> Última revisão: 2026-06-14  
> Local canônico: `docs/operacao/DEPLOY.md`  
> Tipo: atalho operacional de deploy.  
> Status: complementar; o procedimento completo está em `docs/operacao/DEPLOYMENT.md`.

---

## 1. Objetivo

Este arquivo é um atalho rápido para publicação.

Para detalhes de variáveis, cache SPA, Supabase, Edge Functions, OAuth, rotas `/api/*`, troubleshooting e QA pós-deploy, use:

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

Quando houver alteração funcional:

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
- Validar rotas críticas após deploy.
- Tratar warning de chunk grande como alerta de performance, não como falha, se o build concluiu.

---

## 4. Rotas mínimas para QA

```txt
/entrar
/mapa-familiar
/mapa-familiar-horizontal
/calendario-familiar
/forum
/meus-favoritos
/notificacoes
/admin
```

Confirmar que estas rotas antigas não voltaram como views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

---

## 5. QA mobile mínimo da árvore

Breakpoints:

```txt
320px
375px
390px
430px
```

Validar:

- `/mapa-familiar` mobile usa `MobileFamilyTreeView`;
- `/mapa-familiar-horizontal` mobile usa `MobileFamilyHorizontalMapView`;
- horizontal mobile mostra uma geração por tela;
- horizontal mobile não usa barra `Paterno | Central | Materno`;
- modal mobile de controles não exibe Zoom, Restaurar nem Exportar;
- paletas não caem em fallback azul indevido.

---

## 6. Documento completo

```txt
docs/operacao/DEPLOYMENT.md
```
