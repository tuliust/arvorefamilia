# Deploy

> Última revisão: 2026-06-23
> Escopo: checklist operacional de validação, publicação e QA pós-deploy.
> Status: canônico.

## Objetivo

Concentrar o procedimento de deploy em um único documento operacional. Este arquivo substitui o antigo `docs/operacao/DEPLOYMENT.md` e o antigo índice local de operação.

## Checklist antes do deploy

```bash
npm run typecheck
npm run build
git status --short
git diff --check
```

A saída esperada é:

- typecheck sem erros;
- build concluído;
- nenhuma alteração fora do escopo planejado;
- nenhum erro de whitespace no diff.

## Publicação

1. Confirmar branch correta.
2. Confirmar que a `main` está atualizada.
3. Executar validações locais.
4. Fazer commit com mensagem objetiva.
5. Fazer push.
6. Conferir deploy na plataforma configurada.
7. Executar QA manual mínimo.

## Integrações relacionadas

Detalhes específicos ficam em:

- `operacao/OAUTH_GOOGLE.md`;
- `operacao/STORAGE_MAINTENANCE.md`;
- `operacao/MIGRATIONS_SUPABASE.md`.

## QA mínimo pós-deploy

Validar manualmente:

- home pública;
- login;
- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- `/meus-dados`;
- `/meus-dados`;
- `/meus-vinculos`;
- `/revisao-dados`;
- `/curiosidades`;
- `/arquivos-historicos`;
- `/forum`;
- `/meus-favoritos`;
- `/notificacoes`;
- `/preferencias`;
- área administrativa.

## Troubleshooting

| Sintoma | Verificação |
|---|---|
| Página 404 ao recarregar rota interna | Conferir fallback SPA da hospedagem. |
| Erro de autenticação | Conferir configuração do provedor e callback. |
| Falha em upload ou leitura de arquivos | Conferir buckets, policies e `STORAGE_MAINTENANCE.md`. |
| Erro em IA | Conferir `api/ai.ts` e limites de payload. |
| Tela protegida inacessível | Conferir guards, sessão e perfil do usuário. |

## Regra de manutenção

Não recriar documentos paralelos de deploy. Se o processo mudar, atualizar este arquivo e os documentos específicos de operação quando necessário.
