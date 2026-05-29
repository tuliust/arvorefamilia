# Sistema de Arvore Genealogica

Aplicacao React + TypeScript + Vite para arvore genealogica familiar com area de membros, painel administrativo, forum e integracoes opcionais.

## Estado atual

- Frontend em React 18, React Router 7 e Tailwind CSS v4.
- Persistencia em Supabase Postgres via `@supabase/supabase-js`.
- Autenticacao real via Supabase Auth.
- `supabase/migrations` e a fonte principal do schema.
- Scripts SQL soltos existem como historico/referencia e nao devem substituir migrations.

## Variaveis de ambiente

Crie `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Se usar rotinas server/API com OpenAI:

```env
OPENAI_API_KEY=sua-chave
```

Ferramentas destrutivas de admin ficam bloqueadas em producao. Para liberar em ambiente controlado:

```env
VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm test
npm run test:e2e
```

## Rotas principais

- `/entrar`: login, cadastro e primeiro acesso.
- `/`: redireciona para `/minha-arvore`, preservando query string.
- `/minha-arvore`: view direta da arvore protegida por `TreeAccessRoute`.
- `/genealogia`: view genealogica protegida por `TreeAccessRoute`.
- `/visao-completa`: view completa protegida por `TreeAccessRoute`.
- `/meus-dados`, `/meus-vinculos`, `/vincular-perfil`, `/calendario-familiar`, `/meus-favoritos`, `/notificacoes`, `/ajustar-notificacoes`: area de membro protegida por `MemberRoute`.
- `/forum`: forum familiar protegido por `MemberRoute`.
- `/admin/login`: entrada admin publica/legada.
- `/admin`, `/admin/dashboard`: dashboard admin protegido por `ProtectedRoute`.
- `/admin/pessoas`, `/admin/pessoas/nova`, `/admin/pessoas/:id`, `/admin/pessoas/:id/editar`: gestao de pessoas.
- `/admin/relacionamentos`, `/admin/relacionamentos/novo`: gestao de relacionamentos.
- `/admin/migrar-dados`: ferramenta destrutiva protegida por confirmacao e bloqueio em producao.

## Guards de acesso

- `TreeAccessRoute`: protege as views da arvore e direciona usuarios sem vinculo confirmado.
- `MemberRoute`: protege paginas de membro.
- `ProtectedRoute`: protege admin com verificacao de perfil admin no Supabase.

A documentacao detalhada fica em:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

## Banco e migrations

Use `supabase/migrations` como fonte da verdade. Nao aplique `database-schema.sql` como schema principal em novos ambientes.

Antes de aplicar migrations em ambiente remoto:

1. Revisar SQL.
2. Fazer backup quando aplicavel.
3. Validar em local/staging.
4. Rodar build/testes.
5. Aplicar com autorizacao explicita.

Detalhes operacionais:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

## Observacoes operacionais

- `arquivos_historicos` e tratado como tabela relacional, nao como coluna JSON de `pessoas`.
- Relacionamentos criados pelos fluxos admin usam service centralizado para criar/remover inversos quando possivel.
- A ferramenta `/admin/migrar-dados` apaga dados antes de importar seed; use apenas em ambiente controlado.
- Service role, tokens e secrets nunca devem ir para o frontend ou para o repositorio.

## Documentacao

- `docs/README.md`: indice canonico da documentacao.
- `ARCHITECTURE.md`: visao sintetica da arquitetura.
- `DEPLOYMENT.md`: deploy e Supabase.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations e Supabase.
- `docs/historico/`: diagnosticos, QA e registros historicos.
