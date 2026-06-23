# Guia de implementações

> Última revisão: 2026-06-23
> Escopo: comportamento implementado na branch `main`.
> Status: canônico.

## Rotas e carregamento

- `src/app/routes.tsx` define lazy loading para páginas públicas, de membro, de árvore e administrativas.
- O fallback de rota exibe estado de carregamento.
- Erros de chunk ou asset JS disparam tentativa controlada de reload com chave de sessão.
- A rota raiz redireciona para `/mapa-familiar`.

## Mapa familiar

- `Home.tsx` carrega pessoas e relacionamentos via `dataService`.
- O cache de árvore é segmentado por usuário e pessoa vinculada.
- Mudanças de dados invalidam cache via `treeDataCache`.
- A pessoa de referência usa, em ordem, query string, foco atual, pessoa vinculada ou primeira pessoa disponível.
- Filtros de parentes diretos são persistidos por usuário.
- Filtros de vida/pet afetam a visibilidade e os contadores.

## Alternância de visualização

- `/mapa-familiar` e `/mapa-familiar-horizontal` compartilham `Home`.
- `treeViewMode.ts` converte rota em modo de visualização.
- A query `pessoa` é preservada ao trocar entre modos.

## IA

`api/ai.ts` implementa:

- perguntas sobre árvore com contexto JSON limitado;
- geração de `minibio` e `curiosidades` quando `purpose === "profile_text"`;
- validação de payload mínimo;
- uso de `OPENAI_API_KEY`;
- modelo padrão `gpt-4.1-mini`, sobrescrevível por `OPENAI_MODEL`;
- resposta JSON estrita para geração de textos de perfil;
- limite de 500 caracteres por campo gerado.

## Dados e Supabase

- `dataService.ts` centraliza pessoas e relacionamentos.
- Campos de privacidade são normalizados no carregamento.
- Erros de Supabase são convertidos em mensagens técnicas mais legíveis.
- Alterações relevantes criam log de atividade quando o serviço aplicável faz essa chamada.
- Vínculos de membro são tratados por `memberProfileService`.

## Fórum

- Rotas do fórum estão em `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`.
- A documentação funcional do fórum deve considerar `forumService.ts` e o SQL versionado em `supabase/forum-schema.sql`.

## Notificações e favoritos

- Notificações usam rotas `/notificacoes` e `/ajustar-notificacoes`.
- Favoritos usam `/meus-favoritos`.
- As buscas/filtros dessas áreas devem ser documentadas como comportamento de UI, não como regra de banco, salvo quando o serviço correspondente existir.

## Administração

- A administração usa `ProtectedRoute`.
- Rotas administrativas atuais estão listadas em `INVENTARIO_TECNICO.md`.
- Documentação de admin deve citar apenas rotas existentes em `src/app/routes.tsx`.
