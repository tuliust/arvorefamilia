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
  historico/         registros históricos e rotas removidas

supabase/
  migrations/        fonte da verdade do schema
  functions/         Edge Functions
```

Regra de organização:

- o root deve conter apenas arquivos essenciais do projeto;
- documentação técnica detalhada deve ficar em `docs/`;
- diagnósticos, relatórios antigos e SQLs soltos devem ficar em `docs/historico/` ou fora do repositório quando forem dumps sensíveis;
- `supabase/migrations` é a fonte da verdade do banco.

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
- `/admin/pessoas/nova`: criação de pessoa;
- `/admin/pessoas/:id`: detalhe administrativo da pessoa;
- `/admin/pessoas/:id/editar`: edição administrativa da pessoa;
- `/admin/relacionamentos`: listagem de relacionamentos;
- `/admin/relacionamentos/novo`: criação de relacionamento;
- `/admin/importacao`: importação;
- `/admin/migrar-dados`: ferramenta destrutiva protegida por confirmação;
- `/admin/diagnostico`: diagnósticos administrativos;
- `/admin/integridade`: integridade de dados;
- `/admin/atividades`: histórico de atividades;
- `/admin/notificacoes`: administração de notificações;
- `/admin/solicitacoes-vinculos`: solicitações de vínculo.

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

Não use SQLs soltos como schema principal em ambientes novos. Arquivos como `database-schema.sql`, `supabase_schema.sql`, `supabase_data.sql`, `diagnostico-*.sql`, `verificar-irmaos.sql` ou similares devem ser tratados como histórico, diagnóstico ou backup local, não como fonte oficial.

Antes de aplicar migrations em staging/produção:

1. revisar o SQL;
2. fazer backup quando aplicável;
3. validar em ambiente local/staging;
4. rodar build e testes;
5. aplicar apenas com autorização explícita.

Documentação operacional:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## Modelagem principal

Tabelas e objetos centrais:

- `pessoas`: dados cadastrais, biográficos e campos complementares;
- `relacionamentos`: arestas entre pessoas;
- `arquivos_historicos`: arquivos vinculados por `pessoa_id` ou `relacionamento_id` quando aplicável;
- `profiles`: perfis de usuários e roles;
- `user_person_links`: vínculo entre usuário autenticado e pessoa da árvore;
- `forum_*`: categorias, tópicos, respostas, comentários, reações e denúncias;
- `notifications` e tabelas correlatas: notificações e preferências;
- `user_favorites`: favoritos do usuário;
- `google_calendar_*`: conexão e metadados de integração quando habilitada.

Observações:

- `arquivos_historicos` é tabela relacional, não coluna JSON de `pessoas` para novos registros;
- relacionamentos de `conjuge` e `irmao` são simétricos;
- relacionamentos `pai`/`mae` geram inverso `filho` quando o fluxo permite;
- relacionamento `filho` só deve gerar inverso `pai` ou `mae` quando o fluxo informa o tipo correto;
- não inferir gênero/tipo parental quando o dado não estiver claro.

---

## Ferramentas destrutivas

A rota abaixo é sensível:

```txt
/admin/migrar-dados
```

Ela pode apagar pessoas e relacionamentos antes de importar seed.

Em produção, deve permanecer bloqueada por padrão. Para liberar em ambiente controlado, use:

```env
VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true
```

A tela ainda exige confirmação textual:

```txt
MIGRAR DADOS
```

---

## Checklist técnico antes de commit/deploy

Execute antes de fechar alterações relevantes:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Verifique também:

- nenhuma migration criada para ajuste puramente visual;
- nenhum secret ou dump versionado;
- nenhum `dist/`, `test-results/`, `.bak`, log temporário ou arquivo gerado entrou no commit;
- documentação atualizada quando houver mudança de rota, banco, permissão, UX ou comportamento consolidado.

---

## Deploy

Fluxo padrão:

```bash
npm install
npm run build
```

O artefato final fica em:

```txt
dist/
```

Para deploy estático, configure as variáveis de ambiente no provedor e publique `dist/`.

Se o provedor exigir, configure fallback SPA para:

```txt
index.html
```

Documentação de deploy:

```txt
docs/operacao/DEPLOYMENT.md
```

---

## Documentação

Ponto de entrada canônico:

```txt
docs/README.md
```

Documentos principais:

- `docs/BASELINE_PRODUTO_ATUAL.md`: estado funcional vigente;
- `docs/QA_MANUAL.md`: QA manual centralizado;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`: contratos que não podem regredir;
- `docs/GUIA_IMPLEMENTACOES.md`: estado consolidado do que já foi implementado;
- `docs/GUIA_COMPONENTES.md`: componentes, props, responsabilidades e cuidados contra regressão;
- `docs/GUIA_UX_LAYOUT.md`: decisões de UX, layout e responsividade;
- `docs/GUIA_CORRECAO_ERROS.md`: troubleshooting por sintoma;
- `docs/PLANO_PROXIMOS_PASSOS.md`: pendências, riscos e backlog;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e navegação;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`: usuários, pessoas, vínculos e modelo de dados;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations, Supabase e segurança operacional;
- `docs/operacao/DEPLOYMENT.md`: deploy, variáveis e operação;
- `docs/funcionalidades/`: documentação específica por funcionalidade;
- `docs/historico/ROTAS_REMOVIDAS.md`: histórico preventivo de rotas removidas;
- `docs/historico/`: diagnósticos, QA e registros históricos;
- `docs/ATTRIBUTIONS.md`: atribuições e licenças de componentes/assets, se mantido dentro de `docs/`.

Se houver divergência entre um documento antigo e os guias em `docs/`, prevalece a documentação canônica em `docs/`.

---

## Política para arquivos no root

Devem permanecer no root apenas arquivos necessários para execução, build, deploy ou configuração do projeto.

Exemplos:

```txt
README.md
package.json
package-lock.json
vite.config.ts
vercel.json
index.html
```

Não manter no root:

```txt
dist/
backups/
test-results/
playwright-report/
coverage/
*.bak
*.patch
.env
.env.local
.env*.save
```

---

## Anti-regressão de rotas antigas

Não reativar como views de produto:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Permitido:

- `/minha-arvore/editar` como rota vigente de edição do membro;
- termos como “minha árvore”, “genealogia” e “visão completa” como keywords, rótulos históricos ou texto explicativo, desde que apontem para rotas vigentes;
- ocorrências em `docs/historico/` claramente marcadas como legado.

Regra:

```txt
Keyword antiga não reativa rota antiga.
```

---

## Validação documental

Antes de fechar mudanças de documentação:

```bash
git diff --check
npm run build
```

Para auditoria de rotas antigas:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" README.md docs src tests
```

Interpretação:

- `/minha-arvore/editar` é permitido;
- `docs/historico/ROTAS_REMOVIDAS.md` é a referência preventiva;
- `docs/historico/` pode conter ocorrências legadas;
- documentos canônicos não devem tratar as rotas removidas como views ativas.
