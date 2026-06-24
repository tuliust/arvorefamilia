# Inventário técnico

> Última revisão: 2026-06-23
> Escopo: rotas, módulos, documentos finais e referências técnicas preservadas após limpeza documental.
> Status: canônico.

## Stack

- Aplicação React com Vite.
- Rotas declaradas em `src/app/routes.tsx` com `createBrowserRouter`.
- Autenticação e contexto em `src/app/contexts/AuthContext`.
- Proteção de rotas por `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`.
- Dados via Supabase, com serviços em `src/app/services` e tipos em `src/app/types`.
- IA por endpoint serverless `api/ai.ts`.
- Validação esperada: `npm run typecheck` e `npm run build`.

## Áreas funcionais documentadas

| Área | Documento canônico |
|---|---|
| Mapa familiar vertical e horizontal | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores, painel e edição | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Meus dados, IA, mini bio e textos de perfil | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Fórum, favoritos, notificações, dúvidas, calendário, onboarding, timeline, exportação e admin de pessoas | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |

## Documentos técnicos finais

| Tema | Documento |
|---|---|
| Arquitetura e decisões | `arquitetura/DECISOES_ARQUITETURAIS.md` |
| Rotas e guards | `arquitetura/ROTAS_E_GUARDS.md` |
| Componentes | `GUIA_COMPONENTES.md` |
| Implementações | `GUIA_IMPLEMENTACOES.md` |
| UX e layout | `GUIA_UX_LAYOUT.md` |
| QA manual | `QA_MANUAL.md` |
| Não regressão | `REGRAS_DE_NAO_REGRESSAO.md` |
| Correção de erros | `GUIA_CORRECAO_ERROS.md` |
| Próximos passos | `PLANO_PROXIMOS_PASSOS.md` |
| Migrations Supabase | `operacao/MIGRATIONS_SUPABASE.md` |
| Deploy | `operacao/DEPLOY.md` |
| OAuth Google | `operacao/OAUTH_GOOGLE.md` |
| Storage | `operacao/STORAGE_MAINTENANCE.md` |

## Histórico preservado

| Tema | Documento |
|---|---|
| Auditoria documental anterior | `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md` |
| Legado técnico consolidado | `historico/LEGADO_TECNICO.md` |
| Limpeza documental final | `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md` |

## Rotas públicas principais

- `/`
- `/entrar`
- `/termos`
- `/privacidade`
- `/pessoa/:id`
- `/pessoas/:id`

## Rotas de membro principais

- `/mapa-familiar`
- `/mapa-familiar-horizontal`
- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/revisao-dados`
- `/curiosidades`
- `/forum`
- `/meus-favoritos`
- `/notificacoes`
- `/ajustar-notificacoes`
- `/preferencias`
- `/calendario-familiar`

## Área administrativa

A área administrativa permanece documentada de forma consolidada nos guias canônicos, especialmente:

- `GUIA_COMPONENTES.md`;
- `GUIA_IMPLEMENTACOES.md`;
- `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `arquitetura/ROTAS_E_GUARDS.md`.

## Arquivos removidos ou absorvidos

A limpeza final removeu arquivos de rodada, baseline, QA datado, mobile legado, histórico fragmentado e documentos funcionais pequenos. Conteúdo útil foi absorvido por:

- `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `funcionalidades/CURIOSIDADES.md`;
- `arquitetura/DECISOES_ARQUITETURAIS.md`;
- `operacao/DEPLOY.md`;
