# Arvore Familia

Aplicacao web para arvore genealogica familiar, com area de membros, painel administrativo, perfis de pessoas, relacionamentos, arquivos historicos, forum, calendario, notificacoes, favoritos e integracoes opcionais.

Este `README.md` e a porta de entrada rapida do repositorio. A documentacao tecnica completa fica em `docs/README.md`.

---

## Estado atual

O projeto esta estruturado como uma aplicacao React/Vite com persistencia no Supabase.

Principais frentes consolidadas:

- arvore familiar interativa;
- visualizacoes `/minha-arvore`, `/genealogia` e `/visao-completa`;
- perfis individuais de pessoas;
- painel administrativo;
- CRUD de pessoas e relacionamentos;
- relacionamentos inversos quando a regra e deterministica;
- arquivos historicos por pessoa;
- area autenticada de membros;
- vinculo entre usuario e pessoa da arvore;
- forum familiar;
- calendario familiar;
- notificacoes internas/e-mail conforme configuracao;
- favoritos;
- timeline e insights familiares;
- exportacao de area visivel da arvore;
- responsividade mobile/tablet validada no escopo atual.

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
- ReactFlow/Dagre;
- Vitest;
- Playwright.

---

## Estrutura do repositorio

```txt
src/app/
  components/        componentes reutilizaveis
  components/FamilyTree/
  contexts/          AuthContext e estado compartilhado
  lib/               cliente Supabase e utilitarios base
  pages/             telas publicas, membro, forum e admin
  services/          acesso a dados e regras de negocio
  types/             contratos TypeScript
  routes.tsx         rotas e guards

docs/
  README.md          indice canonico da documentacao
  arquitetura/       rotas, guards, usuarios e modelo de dados
  funcionalidades/   documentacao por funcionalidade
  operacao/          migrations, Supabase, storage e manutencao
  historico/         diagnosticos, QA e registros antigos

supabase/
  migrations/        fonte da verdade do schema
  functions/         Edge Functions
```

Regra de organizacao:

- o root deve conter apenas arquivos essenciais do projeto;
- documentacao tecnica detalhada deve ficar em `docs/`;
- diagnosticos, relatorios antigos e SQLs soltos devem ficar em `docs/historico/` ou fora do repositorio quando forem dumps sensiveis;
- `supabase/migrations` e a fonte da verdade do banco.

---

## Variaveis de ambiente

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

Nao versionar `.env.local`, service role, dumps, tokens, backups ou secrets.

---

## Comandos principais

Instalacao:

```bash
npm install
```

Desenvolvimento local:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Preview local do build:

```bash
npm run preview
```

Testes unitarios:

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

### Entrada e area de membro

- `/entrar`: login, cadastro e primeiro acesso;
- `/`: redireciona para `/minha-arvore`, preservando query string;
- `/minha-arvore`: arvore direta protegida por `TreeAccessRoute`;
- `/genealogia`: visualizacao genealogica protegida por `TreeAccessRoute`;
- `/visao-completa`: visualizacao completa protegida por `TreeAccessRoute`;
- `/minha-arvore/editar`: edicao da propria arvore/dados pelo membro;
- `/meus-dados`: dados pessoais do usuario vinculado;
- `/meus-vinculos`: vinculos usuario-pessoa;
- `/vincular-perfil`: fluxo de solicitacao/vinculo;
- `/calendario-familiar`: calendario familiar;
- `/meus-favoritos`: favoritos;
- `/notificacoes`: central de notificacoes;
- `/ajustar-notificacoes`: preferencias de notificacao.

### Pessoas e forum

- `/pessoa/:id`: perfil publico/autenticado de pessoa;
- `/pessoas/:id`: alias/rota de perfil;
- `/forum`: forum familiar;
- `/forum/novo`: novo topico;
- `/forum/topico/:id`: detalhe do topico;
- `/forum/topico/:id/editar`: edicao do topico.

### Admin

- `/admin/login`: entrada admin publica/legada;
- `/admin` e `/admin/dashboard`: dashboard administrativo;
- `/admin/home`: configuracao visual da entrada;
- `/admin/pessoas`: listagem de pessoas;
- `/admin/pessoas/nova`: criacao de pessoa;
- `/admin/pessoas/:id`: detalhe administrativo da pessoa;
- `/admin/pessoas/:id/editar`: edicao administrativa da pessoa;
- `/admin/relacionamentos`: listagem de relacionamentos;
- `/admin/relacionamentos/novo`: criacao de relacionamento;
- `/admin/importacao`: importacao;
- `/admin/migrar-dados`: ferramenta destrutiva protegida por confirmacao;
- `/admin/diagnostico`: diagnosticos administrativos;
- `/admin/integridade`: integridade de dados;
- `/admin/atividades`: historico de atividades;
- `/admin/notificacoes`: administracao de notificacoes;
- `/admin/solicitacoes-vinculos`: solicitacoes de vinculo.

A documentacao detalhada de rotas fica em:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

## Guards e permissoes

- `MemberRoute`: exige usuario autenticado;
- `TreeAccessRoute`: exige login recente e vinculo confirmado em `user_person_links`;
- `ProtectedRoute`: protege rotas administrativas com verificacao de admin;
- `permissionService`: centraliza permissoes de admin e edicao por pessoa vinculada.

Admin deve ser definido no banco por `profiles.role = 'admin'`.

Durante transicoes, pode existir fallback temporario por e-mail no frontend. Esse fallback deve ser removido quando todos os admins estiverem garantidos por `profiles.role`.

---

## Banco de dados e migrations

Use sempre:

```txt
supabase/migrations
```

como fonte da verdade do schema.

Nao use SQLs soltos como schema principal em ambientes novos. Arquivos como `database-schema.sql`, `supabase_schema.sql`, `supabase_data.sql`, `diagnostico-*.sql`, `verificar-irmaos.sql` ou similares devem ser tratados como historico, diagnostico ou backup local, nao como fonte oficial.

Antes de aplicar migrations em staging/producao:

1. revisar o SQL;
2. fazer backup quando aplicavel;
3. validar em ambiente local/staging;
4. rodar build e testes;
5. aplicar apenas com autorizacao explicita.

Nao rode `supabase db push` em banco remoto sem revisar o estado das migrations.

Documentacao operacional:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## Modelagem principal

Tabelas e objetos centrais:

- `pessoas`: dados cadastrais, biograficos e campos complementares;
- `relacionamentos`: arestas entre pessoas;
- `arquivos_historicos`: arquivos vinculados por `pessoa_id`;
- `profiles`: perfis de usuarios e roles;
- `user_person_links`: vinculo entre usuario autenticado e pessoa da arvore;
- `forum_*`: categorias, topicos, respostas, comentarios, reacoes e denuncias;
- `notifications` e tabelas correlatas: notificacoes e preferencias;
- `user_favorites`: favoritos do usuario;
- `google_calendar_*`: conexao e metadados de integracao quando habilitada.

Observacoes:

- `arquivos_historicos` e tabela relacional, nao coluna JSON de `pessoas`;
- relacionamentos de `conjuge` e `irmao` sao simetricos;
- relacionamentos `pai`/`mae` geram inverso `filho` quando o fluxo permite;
- relacionamento `filho` so deve gerar inverso `pai` ou `mae` quando o fluxo informa o tipo correto;
- nao inferir genero/tipo parental quando o dado nao estiver claro.

---

## Ferramentas destrutivas

A rota abaixo e sensivel:

```txt
/admin/migrar-dados
```

Ela pode apagar pessoas e relacionamentos antes de importar seed.

Em producao, deve permanecer bloqueada por padrao. Para liberar em ambiente controlado, use:

```env
VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true
```

A tela ainda exige confirmacao textual:

```txt
MIGRAR DADOS
```

---

## Checklist tecnico antes de commit/deploy

Execute antes de fechar alteracoes relevantes:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Verifique tambem:

- nenhuma migration criada para ajuste puramente visual;
- nenhum secret ou dump versionado;
- nenhum `dist/`, `test-results/`, `.bak`, log temporario ou arquivo gerado entrou no commit;
- documentacao atualizada quando houver mudanca de rota, banco, permissao, UX ou comportamento consolidado.

---

## Deploy

Fluxo padrao:

```bash
npm install
npm run build
```

O artefato final fica em:

```txt
dist/
```

Para deploy estatico, configure as variaveis de ambiente no provedor e publique `dist/`.

Se o provedor exigir, configure fallback SPA para:

```txt
index.html
```

Documentacao de deploy:

```txt
docs/operacao/DEPLOYMENT.md
```

---

## Documentacao

Ponto de entrada canonico:

```txt
docs/README.md
```

Documentos principais:

- `docs/GUIA_IMPLEMENTACOES.md`: estado consolidado do que ja foi implementado;
- `docs/GUIA_COMPONENTES.md`: componentes, props, responsabilidades e cuidados contra regressao;
- `docs/GUIA_UX_LAYOUT.md`: decisoes de UX, layout e responsividade;
- `docs/GUIA_CORRECAO_ERROS.md`: troubleshooting por sintoma;
- `docs/PLANO_PROXIMOS_PASSOS.md`: pendencias, fechamento de MVP e backlog pos-MVP;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e navegacao;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`: usuarios, pessoas, vinculos e modelo de dados;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations, Supabase e seguranca operacional;
- `docs/operacao/DEPLOYMENT.md`: deploy, variaveis e operacao;
- `docs/funcionalidades/`: documentacao especifica por funcionalidade;
- `docs/historico/`: diagnosticos, QA e registros historicos;
- `docs/ATTRIBUTIONS.md`: atribuicoes e licencas de componentes/assets, se mantido dentro de `docs/`.

Se houver divergencia entre um documento antigo e os guias em `docs/`, prevalece a documentacao canonica em `docs/`.

---

## Politica para arquivos no root

Devem permanecer no root apenas arquivos necessarios para execucao, build, deploy ou entrada rapida do repositorio, como:

```txt
README.md
index.html
package.json
package-lock.json
playwright.config.ts
postcss.config.mjs
vercel.json
vite.config.ts
```

Arquivos de documentacao complementar devem preferencialmente ficar em `docs/`.

Arquivos historicos, diagnosticos, relatorios antigos, logs e SQLs legados nao devem permanecer soltos na raiz.
