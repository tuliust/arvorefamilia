# Árvore Família

Aplicação web para árvore genealógica familiar, com área de membros, painel administrativo, perfis de pessoas, relacionamentos, arquivos históricos, fórum, calendário, notificações, favoritos e integrações opcionais.

Este `README.md` é a porta de entrada rápida do repositório. A documentação técnica completa fica em `docs/README.md`.

---

## Estado atual

O projeto está estruturado como uma aplicação React/Vite com persistência no Supabase.

Principais frentes consolidadas:

- árvore familiar interativa nas duas views oficiais atuais;
- **Árvore Familiar** em `/mapa-familiar`;
- **Mapa Genealógico** em `/mapa-familiar-horizontal`;
- rota raiz `/` redirecionando para `/mapa-familiar`, preservando query string;
- `/minha-arvore/editar` como rota vigente de edição do membro;
- perfis individuais de pessoas;
- painel administrativo;
- CRUD de pessoas e relacionamentos;
- relacionamentos inversos quando a regra é determinística;
- arquivos históricos por pessoa e por relacionamento quando aplicável;
- área autenticada de membros;
- vínculo entre usuário e pessoa da árvore;
- fórum familiar;
- calendário familiar;
- notificações internas/e-mail conforme configuração;
- favoritos;
- timeline e insights familiares;
- exportação da árvore por área, PNG, PDF e impressão;
- responsividade mobile/tablet validada no escopo atual.

Rotas antigas que não são views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Histórico preventivo:

```txt
docs/historico/ROTAS_REMOVIDAS.md
docs/historico/SQLS_LEGADOS.md
```

---

## Stack principal

- React 18;
- TypeScript;
- Vite 6;
- React Router 7;
- Tailwind CSS v4;
- Supabase Auth;
- Supabase Postgres;
- Supabase Storage;
- Supabase Edge Functions;
- ReactFlow/Dagre como legado ativo/dependência técnica, não como renderer público principal das views oficiais;
- Vitest;
- Playwright.

---

## Estrutura do repositório

```txt
src/app/
  components/        componentes reutilizáveis
  components/FamilyTree/
  contexts/          AuthContext e estado compartilhado
  lib/               cliente Supabase e utilitários base
  pages/             telas públicas, membro, fórum e admin
  services/          acesso a dados e regras de negócio
  types/             contratos TypeScript
  routes.tsx         rotas e guards

docs/
  README.md          índice canônico da documentação
  QA_MANUAL.md       QA manual centralizado
  arquitetura/       rotas, guards, usuários e modelo de dados
  funcionalidades/   documentação por funcionalidade
  operacao/          migrations, deploy, OAuth, Storage e manutenção
  historico/         registros históricos, rotas removidas e SQLs legados

supabase/
  migrations/        fonte da verdade do schema
  functions/         Edge Functions
```

Regra de organização:

- o root deve conter apenas arquivos essenciais do projeto;
- documentação técnica detalhada deve ficar em `docs/`;
- diagnósticos, relatórios antigos e SQLs soltos devem ficar em `docs/historico/` ou fora do repositório quando forem dumps sensíveis;
- `supabase/migrations` é a fonte da verdade do banco;
- SQL solto não substitui migration oficial.

---

## Variáveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Opcional, apenas para rotinas server/API que usem OpenAI:

```env
OPENAI_API_KEY=sua-chave
```

Opcional, apenas para liberar ferramentas destrutivas em ambiente controlado:

```env
VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true
```

Não versionar `.env.local`, service role, dumps, tokens, backups ou secrets.

---

## Comandos principais

Instalação:

```bash
npm install
```

Desenvolvimento local:

```bash
npm run dev
```

Build de produção:

```bash
npm run build
```

Preview local do build:

```bash
npm run preview
```

Testes unitários:

```bash
npm test
```

Testes E2E:

```bash
npm run test:e2e
```

Testes E2E com UI:

```bash
npm run test:e2e:ui
```

---

## Rotas principais

### Entrada e área de membro

- `/entrar`: login, cadastro e primeiro acesso;
- `/`: redireciona para `/mapa-familiar`, preservando query string;
- `/mapa-familiar`: Árvore Familiar, protegida por `TreeAccessRoute`;
- `/mapa-familiar-horizontal`: Mapa Genealógico, protegido por `TreeAccessRoute`;
- `/busca`: busca global autenticada, protegida por `TreeAccessRoute`;
- `/minha-arvore/editar`: edição da própria árvore/dados pelo membro, protegida por `MemberRoute`;
- `/meus-dados`: dados pessoais do usuário vinculado;
- `/meus-vinculos`: vínculos usuário-pessoa;
- `/vincular-perfil`: fluxo de solicitação/vínculo;
- `/calendario-familiar`: calendário familiar;
- `/meus-favoritos`: favoritos;
- `/notificacoes`: central de notificações;
- `/ajustar-notificacoes`: preferências de notificação.

### Pessoas e fórum

- `/pessoa/:id`: perfil público/autenticado de pessoa;
- `/pessoas/:id`: alias/rota de perfil;
- `/forum`: fórum familiar;
- `/forum/novo`: novo tópico;
- `/forum/topico/:id`: detalhe do tópico;
- `/forum/topico/:id/editar`: edição do tópico.

### Admin

- `/admin/login`: entrada admin pública/legada;
- `/admin` e `/admin/dashboard`: dashboard administrativo;
- `/admin/home`: configuração visual da entrada;
- `/admin/pessoas`: listagem de pessoas;
- `/admin/pessoas/novas`: pessoas com usuário autenticado vinculado;
- `/admin/pessoas/nova`: criação de pessoa;
- `/admin/pessoas/:id`: detalhe administrativo da pessoa;
- `/admin/pessoas/:id/editar`: edição administrativa da pessoa;
- `/admin/relacionamentos`: listagem de relacionamentos;
- `/admin/relacionamentos/novo`: criação de relacionamento;
- `/admin/responsaveis`: responsáveis por usuários e vínculos entre cadastros e pessoas;
- `/admin/importacao`: importação;
- `/admin/migrar-dados`: ferramenta destrutiva protegida por confirmação;
- `/admin/diagnostico`: diagnósticos administrativos;
- `/admin/integridade`: integridade de dados;
- `/admin/atividades`: histórico de atividades;
- `/admin/notificacoes`: administração de notificações.

A documentação detalhada de rotas fica em:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

O histórico das rotas removidas fica em:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

---

## Guards e permissões

- `MemberRoute`: exige usuário autenticado;
- `TreeAccessRoute`: protege as views da árvore e a busca autenticada;
- `ProtectedRoute`: protege rotas administrativas com verificação de admin;
- `permissionService`: centraliza permissões de admin e edição por pessoa vinculada.

Admin deve ser definido no banco por `profiles.role = 'admin'` ou fluxo equivalente documentado.

---

## Banco de dados e migrations

Use sempre:

```txt
supabase/migrations
```

como fonte da verdade do schema.

Não use SQLs soltos como schema principal em ambientes novos. Arquivos como `database-schema.sql`, `supabase_schema.sql`, `supabase_data.sql`, `diagnostico-*.sql`, `verificar-irmaos.sql`, `supabase/forum-schema.sql`, `supabase/google-calendar-schema.sql` ou similares devem ser tratados como histórico, diagnóstico ou backup local, não como fonte oficial.

Referência preventiva:
