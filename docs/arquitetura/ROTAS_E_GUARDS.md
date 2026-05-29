# Rotas e guards de acesso

> Documento canonico de rotas, navegacao e protecao de acesso.
> Local recomendado: `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 1. Objetivo

Este documento consolida as rotas do projeto **Arvore Familia**, os guards de acesso e as regras de navegacao entre paginas publicas, area de membros, arvore e administracao.

Use este arquivo quando precisar:

- adicionar rota;
- alterar protecao de rota;
- revisar fluxo de login/primeiro acesso;
- entender diferenca entre `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`;
- corrigir redirecionamentos;
- revisar navegacao entre `/minha-arvore`, `/genealogia` e `/visao-completa`;
- validar que usuario comum nao acessa admin.

---

## 2. Arquivos principais

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/contexts/AuthContext.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
src/app/components/FamilyTree/treeViewMode.ts
```

Documentos relacionados:

```txt
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_CORRECAO_ERROS.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
```

---

## 3. Conceitos de acesso

O sistema separa quatro niveis de navegacao:

1. **Rotas publicas**
   - nao exigem login;
   - usadas para entrada, termos e privacidade.

2. **Rotas de arvore**
   - exigem login;
   - exigem acesso confirmado a arvore;
   - protegidas por `TreeAccessRoute`.

3. **Rotas de membro**
   - exigem login;
   - usadas por usuarios autenticados com area pessoal;
   - protegidas por `MemberRoute`.

4. **Rotas administrativas**
   - exigem login;
   - exigem permissao administrativa;
   - protegidas por `ProtectedRoute`.

---

## 4. Guards

### 4.1 `TreeAccessRoute`

Arquivo:

```txt
src/app/components/TreeAccessRoute.tsx
```

Responsabilidade:

- proteger a arvore principal;
- exigir usuario autenticado;
- validar acesso/vinculo necessario para visualizar a arvore;
- direcionar usuarios sem vinculo confirmado para o fluxo adequado.

Rotas protegidas:

```txt
/
/minha-arvore
/genealogia
/visao-completa
```

Comportamento esperado:

- usuario sem sessao nao acessa a arvore;
- usuario sem vinculo/acesso confirmado nao deve ver dados da arvore;
- arvore so renderiza apos validacao de acesso;
- `/` redireciona para `/minha-arvore` preservando search params.

---

### 4.2 `MemberRoute`

Arquivo:

```txt
src/app/components/MemberRoute.tsx
```

Responsabilidade:

- proteger paginas da area de membro;
- exigir usuario autenticado;
- permitir acesso a paginas pessoais, forum, notificacoes, calendario e perfil.

Rotas protegidas:

```txt
/minha-arvore/editar
/meus-dados
/meus-vinculos
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum
/forum/novo
/forum/topico/:id
/forum/topico/:id/editar
```

Comportamento esperado:

- usuario nao autenticado e redirecionado para entrada/login;
- usuario autenticado acessa area de membro conforme regras de produto e RLS;
- dados sensiveis continuam protegidos por service/RLS, nao apenas por UI.

---

### 4.3 `ProtectedRoute`

Arquivo:

```txt
src/app/components/ProtectedRoute.tsx
```

Responsabilidade:

- proteger paginas administrativas;
- exigir usuario autenticado;
- validar perfil admin;
- bloquear usuario comum.

Rotas protegidas:

```txt
/admin
/admin/dashboard
/admin/home
/admin/pessoas
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/admin/relacionamentos
/admin/relacionamentos/novo
/admin/importacao
/admin/migrar-dados
/admin/diagnostico
/admin/integridade
/admin/atividades
/admin/notificacoes
/admin/solicitacoes-vinculos
```

Comportamento esperado:

- usuario comum nao acessa admin;
- botao **Painel administrativo** so aparece para admin;
- falha de verificacao deve bloquear, nao liberar;
- UI nao substitui RLS;
- dados administrativos precisam continuar protegidos no banco.

---

## 5. Rotas publicas

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/entrar` | `Entrar` | publica | Login, cadastro, primeiro acesso e aceite legal. |
| `/termos` | `Termos` | publica | Termos de uso. |
| `/privacidade` | `Privacidade` | publica | Politica de privacidade. |
| `/admin/login` | `AdminLogin` | publica | Entrada administrativa legada/especifica. |

Observacao:

- `/admin/login` nao deve ser usado como caminho principal do menu do usuario.
- Admin autenticado deve acessar `/admin` ou `/admin/dashboard`.

---

## 6. Rotas da arvore

| Rota | Componente | Protecao | View |
|---|---|---|---|
| `/` | redireciona para `/minha-arvore` | `TreeAccessRoute` | Entrada canonica com redirect. |
| `/minha-arvore` | `Home` | `TreeAccessRoute` | `minha-arvore` |
| `/genealogia` | `Home` | `TreeAccessRoute` | `genealogia` |
| `/visao-completa` | `Home` | `TreeAccessRoute` | `visao-completa` |

Regras:

- `/` redireciona para `/minha-arvore`;
- o redirect preserva search params, como `?pessoa=...`;
- as tres views usam o mesmo shell `Home`;
- `Home.tsx` deriva `treeViewMode` a partir da rota atual;
- troca de view deve usar navegacao client-side;
- troca de view deve preservar search params;
- nao usar `window.location` para trocar view se `navigate` resolver;
- evitar estado local de view separado da URL.

---

## 7. Helpers de view da arvore

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Responsabilidade:

- centralizar o tipo `TreeViewMode`;
- mapear view para rota;
- mapear rota para view;
- evitar divergencia entre URL e `viewMode`.

Helpers esperados:

```txt
VIEW_MODE_TO_PATH
PATH_TO_VIEW_MODE
getTreeViewModeFromPath
getPathForTreeViewMode
```

Regras:

- qualquer novo link entre views deve usar os helpers;
- nao duplicar mapeamento de paths em componentes;
- preservar `?pessoa=...` ao navegar;
- manter nomes de view estaveis.

---

## 8. Rotas de membro

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/minha-arvore/editar` | `MinhaArvore` | `MemberRoute` | Edicao da propria arvore/dados pelo membro. |
| `/meus-dados` | `MeusDados` | `MemberRoute` | Edicao dos dados da pessoa vinculada ao usuario. |
| `/meus-vinculos` | `MeusVinculos` | `MemberRoute` | Gestao/visualizacao de vinculos do usuario. |
| `/vincular-perfil` | `VincularPerfil` | `MemberRoute` | Solicitacao/criacao de vinculo adicional. |
| `/pessoa/:id` | `PersonProfile` | `MemberRoute` | Perfil publico/interno de pessoa da arvore. |
| `/pessoas/:id` | `PersonProfile` | `MemberRoute` | Alias do perfil de pessoa. |
| `/calendario-familiar` | `CalendarioFamiliar` | `MemberRoute` | Calendario familiar. |
| `/meus-favoritos` | `MeusFavoritos` | `MemberRoute` | Favoritos do usuario. |
| `/notificacoes` | `Notificacoes` | `MemberRoute` | Central/lista de notificacoes. |
| `/ajustar-notificacoes` | `AjustarNotificacoes` | `MemberRoute` | Preferencias de notificacoes. |
| `/forum` | `ForumHome` | `MemberRoute` | Home do forum. |
| `/forum/novo` | `ForumNovoTopico` | `MemberRoute` | Criacao de topico. |
| `/forum/topico/:id` | `ForumTopico` | `MemberRoute` | Visualizacao de topico. |
| `/forum/topico/:id/editar` | `ForumEditarTopico` | `MemberRoute` | Edicao de topico. |

Regras:

- rotas de membro nao devem usar `ProtectedRoute`;
- acoes administrativas dentro de rotas de membro devem ser condicionais;
- links internos devem usar navegacao client-side quando possivel;
- dados pessoais devem respeitar privacidade e RLS.

---

## 9. Rotas administrativas

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/admin` | `AdminDashboard` | `ProtectedRoute` | Dashboard admin. |
| `/admin/dashboard` | `AdminDashboard` | `ProtectedRoute` | Alias/dashboard admin. |
| `/admin/home` | `AdminHomeSettings` | `ProtectedRoute` | Configuracoes visuais da home publica. |
| `/admin/pessoas` | `AdminPessoas` | `ProtectedRoute` | Listagem de pessoas. |
| `/admin/pessoas/nova` | `AdminPessoaForm` | `ProtectedRoute` | Criacao de pessoa. |
| `/admin/pessoas/:id` | `AdminPessoaForm` | `ProtectedRoute` | Alias de edicao/visualizacao admin. |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` | `ProtectedRoute` | Edicao de pessoa. |
| `/admin/relacionamentos` | `AdminRelacionamentos` | `ProtectedRoute` | Gestao de relacionamentos. |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` | `ProtectedRoute` | Criacao de relacionamento. |
| `/admin/importacao` | `AdminImportacao` | `ProtectedRoute` | Importacao. |
| `/admin/migrar-dados` | `AdminMigrarDados` | `ProtectedRoute` | Ferramenta destrutiva de migracao de seed. |
| `/admin/diagnostico` | `AdminDiagnostico` | `ProtectedRoute` | Diagnostico de integridade. |
| `/admin/integridade` | `AdminIntegridade` | `ProtectedRoute` | Integridade de dados. |
| `/admin/atividades` | `AdminAtividades` | `ProtectedRoute` | Historico de atividades. |
| `/admin/notificacoes` | `AdminNotificacoes` | `ProtectedRoute` | Diagnostico/gestao de notificacoes. |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos` | `ProtectedRoute` | Solicitacoes de vinculo/relacionamento. |

Regras:

- toda rota `/admin/*`, salvo `/admin/login`, deve usar `ProtectedRoute`;
- ferramentas destrutivas devem ter protecao adicional;
- `/admin/migrar-dados` nao deve ficar liberada em producao sem variavel explicita e confirmacao textual;
- admin no frontend nao substitui RLS/policies no banco;
- usuario comum nunca deve alterar dados reais por rota administrativa.

---

## 10. Rota 404

Comportamento atual esperado:

- rota `*` renderiza tela 404;
- deve oferecer retorno seguro para a home/arvore;
- idealmente usar navegacao client-side em momento seguro.

Pos-MVP tecnico:

- revisar link 404 que usa `<a href="/">`;
- trocar por navegacao client-side, se nao houver impacto colateral;
- decidir se destino deve ser `/` ou `/minha-arvore`.

---

## 11. Primeiro acesso e vinculo

Fluxo resumido:

```txt
Usuario acessa /entrar

Informa codigo de primeiro acesso

Sistema valida codigo contra uma pessoa existente

Usuario cria conta no Supabase Auth

Sistema cria/resolve profile

Sistema cria/resolve vinculo em user_person_links

Usuario confirma dados proprios

Usuario passa a acessar area de membro/arvore
```

Services relacionados:

```txt
src/app/services/memberProfileService.ts
src/app/services/permissionService.ts
src/app/contexts/AuthContext.tsx
```

Regras:

- usuario autenticado deve estar ligado a `auth.users`;
- `profiles` complementa dados e role;
- `user_person_links` conecta usuario a pessoa da arvore;
- vinculo principal define a pessoa de referencia;
- `dados_confirmados` controla confirmacao de dados;
- `can_edit` controla permissao de edicao;
- admin pode gerenciar vinculos por fluxo proprio.

---

## 12. Permissoes administrativas

Arquivos relacionados:

```txt
src/app/services/permissionService.ts
src/app/components/ProtectedRoute.tsx
src/app/pages/Home.tsx
src/app/components/UserMenu.tsx
```

Regra principal:

- admin deve ser identificado por `profiles.role = 'admin'` ou mecanismo consolidado no service/RPC.

Verificacoes esperadas:

- `isAdminUser(user)`;
- RPC `is_admin_user`, quando aplicavel;
- role em `profiles`;
- fallback temporario por e-mail, se ainda existir, deve ser tratado como divida tecnica;
- falhas devem bloquear acesso administrativo.

Regras de UI:

- botao **Painel administrativo** apenas para admin;
- acoes destrutivas apenas em telas admin;
- usuario comum nao deve ver nem acionar acoes administrativas reais.

---

## 13. Navegacao e links internos

Regras gerais:

- preferir `AppLink` ou navegacao client-side;
- evitar `<a href="/">` quando reload nao for necessario;
- preservar search params quando a intencao do usuario depender deles;
- nao trocar view da arvore por estado local isolado;
- nao usar `window.location` para navegacao interna se `navigate` resolver.

Casos especificos:

- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` deve preservar `location.search`;
- links para pessoa devem usar `/pessoa/:id` ou `/pessoas/:id` conforme padrao atual;
- navegacao de admin deve ir para `/admin` ou `/admin/dashboard`;
- retorno da 404 pode usar `/` por compatibilidade, mas deve ser revisado pos-MVP.

---

## 14. Seguranca e RLS

Regras:

- guard de frontend melhora UX, mas nao substitui RLS;
- operacao sensivel precisa ter policy/RPC/service compativel;
- usuario comum nao deve escrever diretamente em tabelas sensiveis;
- alteracoes reais de relacionamento por usuario comum devem virar solicitacao;
- admin deve ser validado no banco para operacoes criticas;
- tokens, secrets e service role nao podem ser expostos no frontend;
- Edge Functions devem manter secrets server-side.

Tabelas sensiveis:

```txt
profiles
user_person_links
pessoas
relacionamentos
relationship_change_requests
activity_logs
notificacoes_usuario
preferencias_notificacao
google_calendar_connections
```

---

## 15. QA de rotas e guards

Antes de alterar rotas:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Checklist manual minimo:

- usuario deslogado acessa `/entrar`;
- usuario deslogado nao acessa `/minha-arvore`;
- usuario deslogado nao acessa `/admin`;
- usuario comum acessa `/meus-dados`;
- usuario comum acessa `/notificacoes`;
- usuario comum acessa `/forum`;
- usuario comum nao acessa `/admin`;
- admin acessa `/admin`;
- admin acessa `/admin/pessoas`;
- `/` redireciona para `/minha-arvore`;
- `/?pessoa=ID` redireciona para `/minha-arvore?pessoa=ID`;
- trocar de `/minha-arvore?pessoa=ID` para `/genealogia?pessoa=ID` preserva `?pessoa=ID`;
- trocar de `/genealogia?pessoa=ID` para `/visao-completa?pessoa=ID` preserva `?pessoa=ID`;
- rota inexistente mostra 404.

---

## 16. Troubleshooting

### Usuario comum acessa admin

Verificar:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/services/permissionService.ts
profiles.role
RLS/policies
```

Correcao:

- garantir `ProtectedRoute`;
- corrigir `isAdminUser`;
- bloquear por erro/falha;
- corrigir RLS;
- nao resolver apenas escondendo botao.

---

### Admin nao ve painel administrativo

Verificar:

```txt
profiles.role
is_admin_user
permissionService.ts
UserMenu
Home.tsx
sessao Supabase
```

Correcao:

- confirmar role no banco;
- limpar sessao/cache se necessario;
- corrigir service/RPC;
- validar loading/erro.

---

### `?pessoa=...` desaparece ao trocar view

Verificar:

```txt
Home.tsx
treeViewMode.ts
HomeHeader.tsx
HomeMobileNav.tsx
```

Correcao:

- usar helper de path;
- concatenar `location.search`;
- evitar substituicao por rota sem query string.

---

### View abre publica por engano

Verificar:

```txt
src/app/routes.tsx
TreeAccessRoute
MemberRoute
ProtectedRoute
```

Correcao:

- aplicar guard correto;
- validar comportamento sem sessao;
- validar comportamento com usuario comum;
- validar comportamento admin.

---

### Rota admin quebra apos refatoracao

Verificar:

- import lazy;
- nome do componente exportado;
- path da rota;
- `ProtectedRoute`;
- fallback de Suspense;
- build.

Correcao:

```bash
npm run build
git diff --check
```

---

## 17. Pos-MVP tecnico

Itens recomendados:

- avaliar rota pai/layout compartilhado para `/minha-arvore`, `/genealogia` e `/visao-completa`;
- revisar se troca de view remonta `Home`;
- revisar navegacoes internas ainda apontando para `/`;
- trocar link 404 por navegacao client-side;
- remover fallback temporario por e-mail de admin quando `profiles.role` estiver garantido;
- documentar matriz final de permissoes por tabela/RPC;
- ampliar testes e2e de acesso por perfil.

Esses itens nao bloqueiam o MVP se nao houver falha P0/P1.
