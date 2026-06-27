# Decisões arquiteturais

> Última revisão: 2026-06-27  
> Escopo: arquitetura final documentada após consolidação dos documentos técnicos anteriores.  
> Status: canônico.

## Camadas

```text
React/Vite UI
Rotas, guards e layouts
Componentes de domínio
Services de aplicação
Supabase Auth, Database, Storage e RLS
APIs serverless
```

## Frontend

- Páginas: `src/app/pages`.
- Componentes compartilhados: `src/app/components`.
- Componentes da árvore: `src/app/components/FamilyTree`.
- Services: `src/app/services`.
- Tipos centrais: `src/app/types`.
- Utilitários: `src/app/utils` quando aplicável.

## Rotas e guards

A fonte de verdade é `src/app/routes.tsx`.

- Rotas públicas: home, login, termos, privacidade e perfis públicos.
- Rotas de membro: mapa, árvore, dados, vínculos, revisão, curiosidades, fórum, favoritos, notificações, preferências e calendário.
- Rotas administrativas: `/admin` e subrotas.
- Guards principais: `ProtectedRoute`, `MemberRoute`, `TreeAccessRoute` e checagens administrativas.

Detalhes operacionais ficam em `arquitetura/ROTAS_E_GUARDS.md`.

## Supabase e dados

A aplicação usa Supabase para autenticação, pessoas, relacionamentos, solicitações de vínculo, responsáveis por perfis, arquivos históricos, favoritos, notificações, fórum, preferências e storage.

Regras de banco e migrations ficam em `operacao/MIGRATIONS_SUPABASE.md`. SQLs antigos foram consolidados em `historico/LEGADO_TECNICO.md` apenas para rastreabilidade.

### Vínculos entre usuários, pessoas e responsáveis

A arquitetura separa dois tipos de vínculo:

- `user_person_links`: vínculo entre um usuário autenticado (`auth.users.id`) e uma pessoa da árvore (`pessoas.id`). Deve ser usado quando o vínculo concede acesso, edição, perfil principal ou permissões associadas a login.
- `person_responsible_links`: vínculo pessoa-a-pessoa entre uma pessoa administrada (`managed_pessoa_id`) e uma pessoa responsável (`responsible_pessoa_id`). Deve ser usado para indicar responsáveis familiares por perfis legados ou crianças quando o responsável vem da tabela `pessoas`, mesmo que não tenha usuário autenticado.

Essa separação evita gravar `pessoas.id` em campos que referenciam `auth.users.id` e preserva a integridade referencial de `user_person_links`.

A página `/admin/responsaveis` usa `person_responsible_links` para o seletor inline de responsáveis em perfis legados e crianças. As solicitações de administração continuam sendo tratadas pelo fluxo próprio de solicitações e, quando aprovadas, podem gerar vínculo com usuário autenticado.

## IA

A IA é funcionalidade de apoio e não substitui revisão humana dos dados.

- Endpoint principal: `api/ai.ts`.
- Textos de perfil: `purpose === "profile_text"`.
- Documentação funcional: `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`.

## Mapa familiar e árvore

- `funcionalidades/MAPA_FAMILIAR_VIEW.md`: contrato das views `/mapa-familiar` e `/mapa-familiar-horizontal`.
- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: painéis, conectores, legendas, seletor de visualização e edição da árvore.

Documentos antigos de mobile, baseline e ajustes por rodada foram removidos porque o contrato vigente passou a estar nos documentos canônicos.

## Decisões de documentação

- Documentos datados de rodada não são contrato operacional.
- Histórico técnico fragmentado fica em `historico/LEGADO_TECNICO.md`.
- Funcionalidades menores ficam em `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`.
- `docs/README.md` e `docs/INVENTARIO_TECNICO.md` são as fontes de navegação documental.

## Regra de atualização

Sempre que uma decisão arquitetural mudar, atualizar este documento e, quando afetar rota, também atualizar `arquitetura/ROTAS_E_GUARDS.md` e `INVENTARIO_TECNICO.md`.

Quando uma alteração criar ou alterar tabelas, vínculos, permissões, policies ou fluxos administrativos, atualizar também `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md`.
