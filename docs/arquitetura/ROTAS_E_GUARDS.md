# Rotas e guards de acesso

> Documento canÃ´nico de rotas, navegaÃ§Ã£o e proteÃ§Ã£o de acesso.
> Local recomendado: `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 1. Objetivo

Este documento consolida as rotas do projeto **Ãrvore FamÃ­lia**, os guards de acesso e as regras de navegaÃ§Ã£o entre pÃ¡ginas pÃºblicas, Ã¡rea de membros, Ã¡rvore e administraÃ§Ã£o.

Use este arquivo quando precisar:

- adicionar rota;
- alterar proteÃ§Ã£o de rota;
- revisar fluxo de login/primeiro acesso;
- entender diferenÃ§a entre `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`;
- corrigir redirecionamentos;
- revisar navegaÃ§Ã£o entre `/minha-arvore`, `/genealogia` e `/visao-completa`;
- validar que usuÃ¡rio comum nÃ£o acessa admin.

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

O sistema separa quatro nÃ­veis de navegaÃ§Ã£o:

1. **Rotas pÃºblicas**
   - nÃ£o exigem login;
   - usadas para entrada, termos e privacidade.

2. **Rotas de Ã¡rvore**
   - exigem login;
   - exigem acesso confirmado Ã  Ã¡rvore;
   - protegidas por `TreeAccessRoute`.

3. **Rotas de membro**
   - exigem login;
   - usadas por usuÃ¡rios autenticados com Ã¡rea pessoal;
   - protegidas por `MemberRoute`.

4. **Rotas administrativas**
   - exigem login;
   - exigem permissÃ£o administrativa;
   - protegidas por `ProtectedRoute`.

---

## 4. Guards

### 4.1 `TreeAccessRoute`

Arquivo:

```txt
src/app/components/TreeAccessRoute.tsx
```

Responsabilidade:

- proteger a Ã¡rvore principal;
- exigir usuÃ¡rio autenticado;
- validar acesso/vÃ­nculo necessÃ¡rio para visualizar a Ã¡rvore;
- direcionar usuÃ¡rios sem vÃ­nculo confirmado para o fluxo adequado.

Rotas protegidas:

```txt
/
/minha-arvore
/genealogia
/visao-completa
```

Comportamento esperado:

- usuÃ¡rio sem sessÃ£o nÃ£o acessa a Ã¡rvore;
- usuÃ¡rio sem vÃ­nculo/acesso confirmado nÃ£o deve ver dados da Ã¡rvore;
- Ã¡rvore sÃ³ renderiza apÃ³s validaÃ§Ã£o de acesso;
- `/` redireciona para `/minha-arvore` preservando search params.

---

### 4.2 `MemberRoute`

Arquivo:

```txt
src/app/components/MemberRoute.tsx
```

Responsabilidade:

- proteger pÃ¡ginas da Ã¡rea de membro;
- exigir usuÃ¡rio autenticado;
- permitir acesso a pÃ¡ginas pessoais, fÃ³rum, notificaÃ§Ãµes, calendÃ¡rio e perfil.

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

- usuÃ¡rio nÃ£o autenticado Ã© redirecionado para entrada/login;
- usuÃ¡rio autenticado acessa Ã¡rea de membro conforme regras de produto e RLS;
- dados sensÃ­veis continuam protegidos por service/RLS, nÃ£o apenas por UI.

---

### 4.3 `ProtectedRoute`

Arquivo:

```txt
src/app/components/ProtectedRoute.tsx
```

Responsabilidade:

- proteger pÃ¡ginas administrativas;
- exigir usuÃ¡rio autenticado;
- validar perfil admin;
- bloquear usuÃ¡rio comum.

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

- usuÃ¡rio comum nÃ£o acessa admin;
- botÃ£o **Painel administrativo** sÃ³ aparece para admin;
- falha de verificaÃ§Ã£o deve bloquear, nÃ£o liberar;
- UI nÃ£o substitui RLS;
- dados administrativos precisam continuar protegidos no banco.

---

## 5. Rotas pÃºblicas

| Rota | Componente | ProteÃ§Ã£o | FunÃ§Ã£o |
|---|---|---|---|
| `/entrar` | `Entrar` | pÃºblica | Login, cadastro, primeiro acesso e aceite legal. |
| `/termos` | `Termos` | pÃºblica | Termos de uso. |
| `/privacidade` | `Privacidade` | pÃºblica | PolÃ­tica de privacidade. |
| `/admin/login` | `AdminLogin` | pÃºblica | Entrada administrativa legada/especÃ­fica. |

ObservaÃ§Ã£o:

- `/admin/login` nÃ£o deve ser usado como caminho principal do menu do usuÃ¡rio.
- Admin autenticado deve acessar `/admin` ou `/admin/dashboard`.

---

## 6. Rotas da Ã¡rvore

| Rota | Componente | ProteÃ§Ã£o | View |
|---|---|---|---|
| `/` | redireciona para `/minha-arvore` | `TreeAccessRoute` | Entrada canÃ´nica com redirect. |
| `/minha-arvore` | `Home` | `TreeAccessRoute` | `minha-arvore` |
| `/genealogia` | `Home` | `TreeAccessRoute` | `genealogia` |
| `/visao-completa` | `Home` | `TreeAccessRoute` | `visao-completa` |

Regras:

- `/` redireciona para `/minha-arvore`;
- o redirect preserva search params, como `?pessoa=...`;
- as trÃªs views usam o mesmo shell `Home`;
- `Home.tsx` deriva `treeViewMode` a partir da rota atual;
- troca de view deve usar navegaÃ§Ã£o client-side;
- troca de view deve preservar search params;
- nÃ£o usar `window.location` para trocar view se `navigate` resolver;
- evitar estado local de view separado da URL.

---

## 7. Helpers de view da Ã¡rvore

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Responsabilidade:

- centralizar o tipo `TreeViewMode`;
- mapear view para rota;
- mapear rota para view;
- evitar divergÃªncia entre URL e `viewMode`.

Helpers esperados:

```txt
VIEW_MODE_TO_PATH
PATH_TO_VIEW_MODE
getTreeViewModeFromPath
getPathForTreeViewMode
```

Regras:

- qualquer novo link entre views deve usar os helpers;
- nÃ£o duplicar mapeamento de paths em componentes;
- preservar `?pessoa=...` ao navegar;
- manter nomes de view estÃ¡veis.

---

## 8. Rotas de membro

| Rota | Componente | ProteÃ§Ã£o | FunÃ§Ã£o |
|---|---|---|---|
| `/minha-arvore/editar` | `MinhaArvore` | `MemberRoute` | EdiÃ§Ã£o da prÃ³pria Ã¡rvore/dados pelo membro. |
| `/meus-dados` | `MeusDados` | `MemberRoute` | EdiÃ§Ã£o dos dados da pessoa vinculada ao usuÃ¡rio. |
| `/meus-vinculos` | `MeusVinculos` | `MemberRoute` | GestÃ£o/visualizaÃ§Ã£o de vÃ­nculos do usuÃ¡rio. |
| `/vincular-perfil` | `VincularPerfil` | `MemberRoute` | SolicitaÃ§Ã£o/criaÃ§Ã£o de vÃ­nculo adicional. |
| `/pessoa/:id` | `PersonProfile` | `MemberRoute` | Perfil pÃºblico/interno de pessoa da Ã¡rvore. |
| `/pessoas/:id` | `PersonProfile` | `MemberRoute` | Alias do perfil de pessoa. |
| `/calendario-familiar` | `CalendarioFamiliar` | `MemberRoute` | CalendÃ¡rio familiar. |
| `/meus-favoritos` | `MeusFavoritos` | `MemberRoute` | Favoritos do usuÃ¡rio. |
| `/notificacoes` | `Notificacoes` | `MemberRoute` | Central/lista de notificaÃ§Ãµes. |
| `/ajustar-notificacoes` | `AjustarNotificacoes` | `MemberRoute` | PreferÃªncias de notificaÃ§Ãµes. |
| `/forum` | `ForumHome` | `MemberRoute` | Home do fÃ³rum. |
| `/forum/novo` | `ForumNovoTopico` | `MemberRoute` | CriaÃ§Ã£o de tÃ³pico. |
| `/forum/topico/:id` | `ForumTopico` | `MemberRoute` | VisualizaÃ§Ã£o de tÃ³pico. |
| `/forum/topico/:id/editar` | `ForumEditarTopico` | `MemberRoute` | EdiÃ§Ã£o de tÃ³pico. |

Regras:

- rotas de membro nÃ£o devem usar `ProtectedRoute`;
- aÃ§Ãµes administrativas dentro de rotas de membro devem ser condicionais;
- links internos devem usar navegaÃ§Ã£o client-side quando possÃ­vel;
- dados pessoais devem respeitar privacidade e RLS.

---

## 9. Rotas administrativas

| Rota | Componente | ProteÃ§Ã£o | FunÃ§Ã£o |
|---|---|---|---|
| `/admin` | `AdminDashboard` | `ProtectedRoute` | Dashboard admin. |
| `/admin/dashboard` | `AdminDashboard` | `ProtectedRoute` | Alias/dashboard admin. |
| `/admin/home` | `AdminHomeSettings` | `ProtectedRoute` | ConfiguraÃ§Ãµes visuais da home pÃºblica. |
| `/admin/pessoas` | `AdminPessoas` | `ProtectedRoute` | Listagem de pessoas. |
| `/admin/pessoas/nova` | `AdminPessoaForm` | `ProtectedRoute` | CriaÃ§Ã£o de pessoa. |
| `/admin/pessoas/:id` | `AdminPessoaForm` | `ProtectedRoute` | Alias de ediÃ§Ã£o/visualizaÃ§Ã£o admin. |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` | `ProtectedRoute` | EdiÃ§Ã£o de pessoa. |
| `/admin/relacionamentos` | `AdminRelacionamentos` | `ProtectedRoute` | GestÃ£o de relacionamentos. |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` | `ProtectedRoute` | CriaÃ§Ã£o de relacionamento. |
| `/admin/importacao` | `AdminImportacao` | `ProtectedRoute` | ImportaÃ§Ã£o. |
| `/admin/migrar-dados` | `AdminMigrarDados` | `ProtectedRoute` | Ferramenta destrutiva de migraÃ§Ã£o de seed. |
| `/admin/diagnostico` | `AdminDiagnostico` | `ProtectedRoute` | DiagnÃ³stico de integridade. |
| `/admin/integridade` | `AdminIntegridade` | `ProtectedRoute` | Integridade de dados. |
| `/admin/atividades` | `AdminAtividades` | `ProtectedRoute` | HistÃ³rico de atividades. |
| `/admin/notificacoes` | `AdminNotificacoes` | `ProtectedRoute` | DiagnÃ³stico/gestÃ£o de notificaÃ§Ãµes. |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos` | `ProtectedRoute` | SolicitaÃ§Ãµes de vÃ­nculo/relacionamento. |

Regras:

- toda rota `/admin/*`, salvo `/admin/login`, deve usar `ProtectedRoute`;
- ferramentas destrutivas devem ter proteÃ§Ã£o adicional;
- `/admin/migrar-dados` nÃ£o deve ficar liberada em produÃ§Ã£o sem variÃ¡vel explÃ­cita e confirmaÃ§Ã£o textual;
- admin no frontend nÃ£o substitui RLS/policies no banco;
- usuÃ¡rio comum nunca deve alterar dados reais por rota administrativa.

---

## 10. Rota 404

Comportamento atual esperado:

- rota `*` renderiza tela 404;
- deve oferecer retorno seguro para a home/Ã¡rvore;
- idealmente usar navegaÃ§Ã£o client-side em momento seguro.

PÃ³s-MVP tÃ©cnico:

- revisar link 404 que usa `<a href="/">`;
- trocar por navegaÃ§Ã£o client-side, se nÃ£o houver impacto colateral;
- decidir se destino deve ser `/` ou `/minha-arvore`.

---

## 11. Primeiro acesso e vÃ­nculo

Fluxo resumido:

```txt
UsuÃ¡rio acessa /entrar
  â†“
Informa cÃ³digo de primeiro acesso
  â†“
Sistema valida cÃ³digo contra uma pessoa existente
  â†“
UsuÃ¡rio cria conta no Supabase Auth
  â†“
Sistema cria/resolve profile
  â†“
Sistema cria/resolve vÃ­nculo em user_person_links
  â†“
UsuÃ¡rio confirma dados prÃ³prios
  â†“
UsuÃ¡rio passa a acessar Ã¡rea de membro/Ã¡rvore
```

Services relacionados:

```txt
src/app/services/memberProfileService.ts
src/app/services/permissionService.ts
src/app/contexts/AuthContext.tsx
```

Regras:

- usuÃ¡rio autenticado deve estar ligado a `auth.users`;
- `profiles` complementa dados e role;
- `user_person_links` conecta usuÃ¡rio a pessoa da Ã¡rvore;
- vÃ­nculo principal define a pessoa de referÃªncia;
- `dados_confirmados` controla confirmaÃ§Ã£o de dados;
- `can_edit` controla permissÃ£o de ediÃ§Ã£o;
- admin pode gerenciar vÃ­nculos por fluxo prÃ³prio.

---

## 12. PermissÃµes administrativas

Arquivos relacionados:

```txt
src/app/services/permissionService.ts
src/app/components/ProtectedRoute.tsx
src/app/pages/Home.tsx
src/app/components/UserMenu.tsx
```

Regra principal:

- admin deve ser identificado por `profiles.role = 'admin'` ou mecanismo consolidado no service/RPC.

VerificaÃ§Ãµes esperadas:

- `isAdminUser(user)`;
- RPC `is_admin_user`, quando aplicÃ¡vel;
- role em `profiles`;
- fallback temporÃ¡rio por e-mail, se ainda existir, deve ser tratado como dÃ­vida tÃ©cnica;
- falhas devem bloquear acesso administrativo.

Regras de UI:

- botÃ£o **Painel administrativo** apenas para admin;
- aÃ§Ãµes destrutivas apenas em telas admin;
- usuÃ¡rio comum nÃ£o deve ver nem acionar aÃ§Ãµes administrativas reais.

---

## 13. NavegaÃ§Ã£o e links internos

Regras gerais:

- preferir `AppLink` ou navegaÃ§Ã£o client-side;
- evitar `<a href="/">` quando reload nÃ£o for necessÃ¡rio;
- preservar search params quando a intenÃ§Ã£o do usuÃ¡rio depender deles;
- nÃ£o trocar view da Ã¡rvore por estado local isolado;
- nÃ£o usar `window.location` para navegaÃ§Ã£o interna se `navigate` resolver.

Casos especÃ­ficos:

- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` deve preservar `location.search`;
- links para pessoa devem usar `/pessoa/:id` ou `/pessoas/:id` conforme padrÃ£o atual;
- navegaÃ§Ã£o de admin deve ir para `/admin` ou `/admin/dashboard`;
- retorno da 404 pode usar `/` por compatibilidade, mas deve ser revisado pÃ³s-MVP.

---

## 14. SeguranÃ§a e RLS

Regras:

- guard de frontend melhora UX, mas nÃ£o substitui RLS;
- operaÃ§Ã£o sensÃ­vel precisa ter policy/RPC/service compatÃ­vel;
- usuÃ¡rio comum nÃ£o deve escrever diretamente em tabelas sensÃ­veis;
- alteraÃ§Ãµes reais de relacionamento por usuÃ¡rio comum devem virar solicitaÃ§Ã£o;
- admin deve ser validado no banco para operaÃ§Ãµes crÃ­ticas;
- tokens, secrets e service role nÃ£o podem ser expostos no frontend;
- Edge Functions devem manter secrets server-side.

Tabelas sensÃ­veis:

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

Checklist manual mÃ­nimo:

- usuÃ¡rio deslogado acessa `/entrar`;
- usuÃ¡rio deslogado nÃ£o acessa `/minha-arvore`;
- usuÃ¡rio deslogado nÃ£o acessa `/admin`;
- usuÃ¡rio comum acessa `/meus-dados`;
- usuÃ¡rio comum acessa `/notificacoes`;
- usuÃ¡rio comum acessa `/forum`;
- usuÃ¡rio comum nÃ£o acessa `/admin`;
- admin acessa `/admin`;
- admin acessa `/admin/pessoas`;
- `/` redireciona para `/minha-arvore`;
- `/?pessoa=ID` redireciona para `/minha-arvore?pessoa=ID`;
- trocar de `/minha-arvore?pessoa=ID` para `/genealogia` preserva `?pessoa=ID`;
- trocar de `/genealogia?pessoa=ID` para `/visao-completa` preserva `?pessoa=ID`;
- rota inexistente mostra 404.

---

## 16. Troubleshooting

### UsuÃ¡rio comum acessa admin

Verificar:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/services/permissionService.ts
profiles.role
RLS/policies
```

CorreÃ§Ã£o:

- garantir `ProtectedRoute`;
- corrigir `isAdminUser`;
- bloquear por erro/falha;
- corrigir RLS;
- nÃ£o resolver apenas escondendo botÃ£o.

---

### Admin nÃ£o vÃª painel administrativo

Verificar:

```txt
profiles.role
is_admin_user
permissionService.ts
UserMenu
Home.tsx
sessÃ£o Supabase
```

CorreÃ§Ã£o:

- confirmar role no banco;
- limpar sessÃ£o/cache se necessÃ¡rio;
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

CorreÃ§Ã£o:

- usar helper de path;
- concatenar `location.search`;
- evitar substituiÃ§Ã£o por rota sem query string.

---

### View abre pÃºblica por engano

Verificar:

```txt
src/app/routes.tsx
TreeAccessRoute
MemberRoute
ProtectedRoute
```

CorreÃ§Ã£o:

- aplicar guard correto;
- validar comportamento sem sessÃ£o;
- validar comportamento com usuÃ¡rio comum;
- validar comportamento admin.

---

### Rota admin quebra apÃ³s refatoraÃ§Ã£o

Verificar:

- import lazy;
- nome do componente exportado;
- path da rota;
- `ProtectedRoute`;
- fallback de Suspense;
- build.

CorreÃ§Ã£o:

```bash
npm run build
git diff --check
```

---

## 17. PÃ³s-MVP tÃ©cnico

Itens recomendados:

- avaliar rota pai/layout compartilhado para `/minha-arvore`, `/genealogia` e `/visao-completa`;
- revisar se troca de view remonta `Home`;
- revisar navegaÃ§Ãµes internas ainda apontando para `/`;
- trocar link 404 por navegaÃ§Ã£o client-side;
- remover fallback temporÃ¡rio por e-mail de admin quando `profiles.role` estiver garantido;
- documentar matriz final de permissÃµes por tabela/RPC;
- ampliar testes e2e de acesso por perfil.

Esses itens nÃ£o bloqueiam o MVP se nÃ£o houver falha P0/P1.
