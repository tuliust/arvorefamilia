# Plano de próximos passos

> Última revisão: 2026-06-23
> Escopo: pendências reais após auditoria documental da branch `main`.
> Status: canônico.

## Pendências críticas antes de merge

1. Executar validação local completa em ambiente com acesso ao repositório:
   - `git status --short`;
   - `git diff --check`;
   - busca de mojibake em `docs/`;
   - `npm run typecheck`;
   - `npm run build`.
2. Validar manualmente `/mapa-familiar` e `/mapa-familiar-horizontal` em desktop e mobile.
3. Conferir `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` e `/revisao-dados` em fluxo completo.
4. Conferir `/curiosidades`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/pessoa/:id`.
5. Validar rotas administrativas com usuário autorizado.

## Pendências de produto

- Confirmar aplicação dos SQLs Supabase no ambiente remoto.
- Confirmar políticas RLS para pessoas, relacionamentos, vínculos, fatos históricos, notificações, favoritos e fórum.
- Confirmar disponibilidade de `OPENAI_API_KEY` e modelo usado por `api/ai.ts`.
- Revisar eventual texto com mojibake remanescente fora de `docs/`, se detectado em validação de código.

## Pendências documentais

- Manter `docs/historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md` como referência da consolidação.
- Atualizar o inventário sempre que novas rotas forem adicionadas em `src/app/routes.tsx`.
- Criar documentação administrativa mais detalhada apenas se houver necessidade operacional após QA.

## Fora de escopo desta auditoria

- Alteração de código em `src/`.
- Alteração de SQLs em `supabase/`.
- Correção de build, typecheck ou bugs funcionais.
- Merge automático na `main`.
