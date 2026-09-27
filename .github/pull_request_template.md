## O que mudou

Descreva objetivamente a alteração e o motivo.

## Validação

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` quando a mudança afetar rotas, guards ou navegação
- [ ] QA manual executado quando a mudança depender de sessão, responsividade, gesto, upload, OAuth ou integração externa

## Supabase e segurança

- [ ] Não se aplica
- [ ] Migration versionada para qualquer alteração de schema/RLS/policy/view/RPC
- [ ] Edge Function versionada e deploy remoto reconciliado quando aplicável
- [ ] RLS/advisors revisados quando a mudança tocar dados, Auth ou Storage
- [ ] Nenhum secret, service role ou token foi exposto no frontend/repositório

## Documentação

- [ ] Não se aplica
- [ ] Documento canônico existente foi atualizado
- [ ] `docs/README.md` / `docs/INVENTARIO_TECNICO.md` foram atualizados se houve mudança estrutural
- [ ] Não foi criado documento paralelo ou datado sem necessidade

## Risco de regressão

Liste rotas/fluxos sensíveis afetados e o que foi verificado.
