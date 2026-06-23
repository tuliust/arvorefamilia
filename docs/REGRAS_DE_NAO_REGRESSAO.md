# Regras de não regressão

> Última revisão: 2026-06-23
> Escopo: contratos que não devem ser quebrados em novas alterações.
> Status: canônico.

## Escopo de alteração documental

- Alterações documentais finais devem ficar restritas a `docs/`.
- Não alterar `src/`, `api/`, `supabase/`, `package.json`, `vite.config`, `index.html` ou arquivos fora de `docs/` em frentes exclusivamente documentais.

## Rotas

- `/` deve continuar redirecionando para `/mapa-familiar`.
- `/mapa-familiar` e `/mapa-familiar-horizontal` devem continuar compartilhando a shell `Home`.
- `/pessoa/:id` e `/pessoas/:id` devem continuar apontando para `PersonProfile`.
- Rotas administrativas, exceto `/admin/login`, devem continuar protegidas por `ProtectedRoute`.

## Mapa familiar

- A alternância entre mapa familiar e linha geracional deve preservar query string.
- A pessoa de referência não pode ser perdida ao trocar de rota.
- Filtros de parentes diretos devem persistir por usuário.
- Mobile não deve herdar layout desktop de painel fixo.
- Exportação não pode ser removida do painel desktop sem substituto documentado.

## Dados

- Pets devem permanecer distinguíveis de pessoas humanas.
- Falecidos devem ser tratados por `falecido` ou por campos de falecimento conforme normalização.
- Campos de privacidade não devem ser expostos indevidamente no perfil.
- Alterações de vínculos que dependem de aprovação não devem ser documentadas como gravação direta.

## IA

- `api/ai.ts` não deve inventar fatos fora do contexto enviado.
- `profile_text` deve retornar JSON válido com `minibio` e `curiosidades`.
- Cada campo de texto gerado deve respeitar limite de 500 caracteres.
- Modo memorial depende de `memorialMode === true`.

## Documentação

- Todo documento canônico deve manter título, última revisão, escopo e status.
- Histórico não substitui contrato canônico.
- `docs/README.md` deve ser atualizado em qualquer criação, remoção ou renomeação de documento canônico.
- Não inserir mojibake em `docs/`.
