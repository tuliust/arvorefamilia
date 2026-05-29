# Rotas e guards de acesso

> Documento canônico de rotas, navegação e proteção de acesso.  
> Local recomendado: `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 1. Objetivo

Este documento consolida as rotas do projeto **Árvore Família**, os guards de acesso e as regras de navegação entre páginas públicas, área de membros, árvore e administração.

Use este arquivo quando precisar:

- adicionar rota;
- alterar proteção de rota;
- revisar fluxo de login/primeiro acesso;
- entender diferença entre `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`;
- corrigir redirecionamentos;
- revisar navegação entre `/minha-arvore`, `/genealogia` e `/visao-completa`;
- validar que usuário comum não acessa admin.

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

O sistema separa quatro níveis de navegação:

1. **Rotas públicas**
   - não exigem login;
   - usadas para entrada, termos e privacidade.

2. **Rotas de árvore**
   - exigem login;
   - exigem acesso confirmado à árvore;
   - protegidas por `TreeAccessRoute`.

3. **Rotas de membro**
   - exigem login;
   - usadas por usuários autenticados com área pessoal;
   - protegidas por `MemberRoute`.

4. **Rotas administrativas**
   - exigem login;
   - exigem permissão administrativa;
   - protegidas por `ProtectedRoute`.

---

## 4. Guards

### 4.1 `TreeAccessRoute`

Arquivo:

```txt
src/app/components/TreeAccessRoute.tsx
```

Responsabilidade:

- proteger a árvore principal;
- exigir usuário autenticado;
- validar acesso/vínculo necessário para visualizar a árvore;
- direcionar usuários sem vínculo confirmado para o fluxo adequado.

Rotas protegidas:

```txt
/
/minha-arvore
/genealogia
/visao-completa
```

Comportamento esperado:

- usuário sem sessão não acessa a árvore;
- usuário sem vínculo/acesso confirmado não deve ver dados da árvore;
- árvore só renderiza após validação de acesso;
- `/` redireciona para `/minha-arvore` preservando search params.

---

### 4.2 `MemberRoute`

Arquivo:

```txt
src/app/components/MemberRoute.tsx
```

Responsabilidade:

- proteger páginas da área de membro;
- exigir usuário autenticado;
- permitir acesso a páginas pessoais, fórum, notificações, calendário e perfil.

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

- usuário não autenticado é redirecionado para entrada/login;
- usuário autenticado acessa área de membro conforme regras de produto e RLS;
- dados sensíveis continuam protegidos por service/RLS, não apenas por UI.

---

### 4.3 `ProtectedRoute`

Arquivo:

```txt
src/app/components/ProtectedRoute.tsx
```

Responsabilidade:

- proteger páginas administrativas;
- exigir usuário autenticado;
- validar perfil admin;
- bloquear usuário comum.

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

- usuário comum não acessa admin;
- botão **Painel administrativo** só aparece para admin;
- falha de verificação deve bloquear, não liberar;
- UI não substitui RLS;
- dados administrativos precisam continuar protegidos no banco.

---

## 5. Rotas públicas

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/entrar` | `Entrar` | pública | Login, cadastro, primeiro acesso e aceite legal. |
| `/termos` | `Termos` | pública | Termos de uso. |
| `/privacidade` | `Privacidade` | pública | Política de privacidade. |
| `/admin/login` | `AdminLogin` | pública | Entrada administrativa legada/específica. |

Observação:

- `/admin/login` não deve ser usado como caminho principal do menu do usuário.
- Admin autenticado deve acessar `/admin` ou `/admin/dashboard`.

---

## 6. Rotas da árvore

| Rota | Componente | Proteção | View |
|---|---|---|---|
| `/` | redireciona para `/minha-arvore` | `TreeAccessRoute` | Entrada canônica com redirect. |
| `/minha-arvore` | `Home` | `TreeAccessRoute` | `minha-arvore` |
| `/genealogia` | `Home` | `TreeAccessRoute` | `genealogia` |
| `/visao-completa` | `Home` | `TreeAccessRoute` | `visao-completa` |

Regras:

- `/` redireciona para `/minha-arvore`;
- o redirect preserva search params, como `?pessoa=...`;
- as três views usam o mesmo shell `Home`;
- `Home.tsx` deriva `treeViewMode` a partir da rota atual;
- troca de view deve usar navegação client-side;
- troca de view deve preservar search params;
- não usar `window.location` para trocar view se `navigate` resolver;
- evitar estado local de view separado da URL.

---

## 7. Helpers de view da árvore

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Responsabilidade:

- centralizar o tipo `TreeViewMode`;
- mapear view para rota;
- mapear rota para view;
- evitar divergência entre URL e `viewMode`.

Helpers esperados:

```txt
VIEW_MODE_TO_PATH
PATH_TO_VIEW_MODE
getTreeViewModeFromPath
getPathForTreeViewMode
```

Regras:

- qualquer novo link entre views deve usar os helpers;
- não duplicar mapeamento de paths em componentes;
- preservar `?pessoa=...` ao navegar;
- manter nomes de view estáveis.

---

## 8. Rotas de membro

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/minha-arvore/editar` | `MinhaArvore` | `MemberRoute` | Edição da própria árvore/dados pelo membro. |
| `/meus-dados` | `MeusDados` | `MemberRoute` | Edição dos dados da pessoa vinculada ao usuário. |
| `/meus-vinculos` | `MeusVinculos` | `MemberRoute` | Gestão/visualização de vínculos do usuário. |
| `/vincular-perfil` | `VincularPerfil` | `MemberRoute` | Solicitação/criação de vínculo adicional. |
| `/pessoa/:id` | `PersonProfile` | `MemberRoute` | Perfil público/interno de pessoa da árvore. |
| `/pessoas/:id` | `PersonProfile` | `MemberRoute` | Alias do perfil de pessoa. |
| `/calendario-familiar` | `CalendarioFamiliar` | `MemberRoute` | Calendário familiar. |
| `/meus-favoritos` | `MeusFavoritos` | `MemberRoute` | Favoritos do usuário. |
| `/notificacoes` | `Notificacoes` | `MemberRoute` | Central/lista de notificações. |
| `/ajustar-notificacoes` | `AjustarNotificacoes` | `MemberRoute` | Preferências de notificações. |
| `/forum` | `ForumHome` | `MemberRoute` | Home do fórum. |
| `/forum/novo` | `ForumNovoTopico` | `MemberRoute` | Criação de tópico. |
| `/forum/topico/:id` | `ForumTopico` | `MemberRoute` | Visualização de tópico. |
| `/forum/topico/:id/editar` | `ForumEditarTopico` | `MemberRoute` | Edição de tópico. |

Regras:

- rotas de membro não devem usar `ProtectedRoute`;
- ações administrativas dentro de rotas de membro devem ser condicionais;
- links internos devem usar navegação client-side quando possível;
- dados pessoais devem respeitar privacidade e RLS.

---

## 9. Rotas administrativas

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/admin` | `AdminDashboard` | `ProtectedRoute` | Dashboard admin. |
| `/admin/dashboard` | `AdminDashboard` | `ProtectedRoute` | Alias/dashboard admin. |
| `/admin/home` | `AdminHomeSettings` | `ProtectedRoute` | Configurações visuais da home pública. |
| `/admin/pessoas` | `AdminPessoas` | `ProtectedRoute` | Listagem de pessoas. |
| `/admin/pessoas/nova` | `AdminPessoaForm` | `ProtectedRoute` | Criação de pessoa. |
| `/admin/pessoas/:id` | `AdminPessoaForm` | `ProtectedRoute` | Alias de edição/visualização admin. |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` | `ProtectedRoute` | Edição de pessoa. |
| `/admin/relacionamentos` | `AdminRelacionamentos` | `ProtectedRoute` | Gestão de relacionamentos. |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` | `ProtectedRoute` | Criação de relacionamento. |
| `/admin/importacao` | `AdminImportacao` | `ProtectedRoute` | Importação. |
| `/admin/migrar-dados` | `AdminMigrarDados` | `ProtectedRoute` | Ferramenta destrutiva de migração de seed. |
| `/admin/diagnostico` | `AdminDiagnostico` | `ProtectedRoute` | Diagnóstico de integridade. |
| `/admin/integridade` | `AdminIntegridade` | `ProtectedRoute` | Integridade de dados. |
| `/admin/atividades` | `AdminAtividades` | `ProtectedRoute` | Histórico de atividades. |
| `/admin/notificacoes` | `AdminNotificacoes` | `ProtectedRoute` | Diagnóstico/gestão de notificações. |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos` | `ProtectedRoute` | Solicitações de vínculo/relacionamento. |

Regras:

- toda rota `/admin/*`, salvo `/admin/login`, deve usar `ProtectedRoute`;
- ferramentas destrutivas devem ter proteção adicional;
- `/admin/migrar-dados` não deve ficar liberada em produção sem variável explícita e confirmação textual;
- admin no frontend não substitui RLS/policies no banco;
- usuário comum nunca deve alterar dados reais por rota administrativa.

---

## 10. Rota 404

Comportamento atual esperado:

- rota `*` renderiza tela 404;
- deve oferecer retorno seguro para a home/árvore;
- idealmente usar navegação client-side em momento seguro.

Pós-MVP técnico:

- revisar link 404 que usa `<a href="/">`;
- trocar por navegação client-side, se não houver impacto colateral;
- decidir se destino deve ser `/` ou `/minha-arvore`.

---

## 11. Primeiro acesso e vínculo

Fluxo resumido:

```txt
Usuário acessa /entrar
  ↓
Informa código de primeiro acesso
  ↓
Sistema valida código contra uma pessoa existente
  ↓
Usuário cria conta no Supabase Auth
  ↓
Sistema cria/resolve profile
  ↓
Sistema cria/resolve vínculo em user_person_links
  ↓
Usuário confirma dados próprios
  ↓
Usuário passa a acessar área de membro/árvore
```

Services relacionados:

```txt
src/app/services/memberProfileService.ts
src/app/services/permissionService.ts
src/app/contexts/AuthContext.tsx
```

Regras:

- usuário autenticado deve estar ligado a `auth.users`;
- `profiles` complementa dados e role;
- `user_person_links` conecta usuário a pessoa da árvore;
- vínculo principal define a pessoa de referência;
- `dados_confirmados` controla confirmação de dados;
- `can_edit` controla permissão de edição;
- admin pode gerenciar vínculos por fluxo próprio.

---

## 12. Permissões administrativas

Arquivos relacionados:

```txt
src/app/services/permissionService.ts
src/app/components/ProtectedRoute.tsx
src/app/pages/Home.tsx
src/app/components/UserMenu.tsx
```

Regra principal:

- admin deve ser identificado por `profiles.role = 'admin'` ou mecanismo consolidado no service/RPC.

Verificações esperadas:

- `isAdminUser(user)`;
- RPC `is_admin_user`, quando aplicável;
- role em `profiles`;
- fallback temporário por e-mail, se ainda existir, deve ser tratado como dívida técnica;
- falhas devem bloquear acesso administrativo.

Regras de UI:

- botão **Painel administrativo** apenas para admin;
- ações destrutivas apenas em telas admin;
- usuário comum não deve ver nem acionar ações administrativas reais.

---

## 13. Navegação e links internos

Regras gerais:

- preferir `AppLink` ou navegação client-side;
- evitar `<a href="/">` quando reload não for necessário;
- preservar search params quando a intenção do usuário depender deles;
- não trocar view da árvore por estado local isolado;
- não usar `window.location` para navegação interna se `navigate` resolver.

Casos específicos:

- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` deve preservar `location.search`;
- links para pessoa devem usar `/pessoa/:id` ou `/pessoas/:id` conforme padrão atual;
- navegação de admin deve ir para `/admin` ou `/admin/dashboard`;
- retorno da 404 pode usar `/` por compatibilidade, mas deve ser revisado pós-MVP.

---

## 14. Segurança e RLS

Regras:

- guard de frontend melhora UX, mas não substitui RLS;
- operação sensível precisa ter policy/RPC/service compatível;
- usuário comum não deve escrever diretamente em tabelas sensíveis;
- alterações reais de relacionamento por usuário comum devem virar solicitação;
- admin deve ser validado no banco para operações críticas;
- tokens, secrets e service role não podem ser expostos no frontend;
- Edge Functions devem manter secrets server-side.

Tabelas sensíveis:

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

Checklist manual mínimo:

- usuário deslogado acessa `/entrar`;
- usuário deslogado não acessa `/minha-arvore`;
- usuário deslogado não acessa `/admin`;
- usuário comum acessa `/meus-dados`;
- usuário comum acessa `/notificacoes`;
- usuário comum acessa `/forum`;
- usuário comum não acessa `/admin`;
- admin acessa `/admin`;
- admin acessa `/admin/pessoas`;
- `/` redireciona para `/minha-arvore`;
- `/?pessoa=ID` redireciona para `/minha-arvore?pessoa=ID`;
- trocar de `/minha-arvore?pessoa=ID` para `/genealogia` preserva `?pessoa=ID`;
- trocar de `/genealogia?pessoa=ID` para `/visao-completa` preserva `?pessoa=ID`;
- rota inexistente mostra 404.

---

## 16. Troubleshooting

### Usuário comum acessa admin

Verificar:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/services/permissionService.ts
profiles.role
RLS/policies
```

Correção:

- garantir `ProtectedRoute`;
- corrigir `isAdminUser`;
- bloquear por erro/falha;
- corrigir RLS;
- não resolver apenas escondendo botão.

---

### Admin não vê painel administrativo

Verificar:

```txt
profiles.role
is_admin_user
permissionService.ts
UserMenu
Home.tsx
sessão Supabase
```

Correção:

- confirmar role no banco;
- limpar sessão/cache se necessário;
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

Correção:

- usar helper de path;
- concatenar `location.search`;
- evitar substituição por rota sem query string.

---

### View abre pública por engano

Verificar:

```txt
src/app/routes.tsx
TreeAccessRoute
MemberRoute
ProtectedRoute
```

Correção:

- aplicar guard correto;
- validar comportamento sem sessão;
- validar comportamento com usuário comum;
- validar comportamento admin.

---

### Rota admin quebra após refatoração

Verificar:

- import lazy;
- nome do componente exportado;
- path da rota;
- `ProtectedRoute`;
- fallback de Suspense;
- build.

Correção:

```bash
npm run build
git diff --check
```

---

## 17. Pós-MVP técnico

Itens recomendados:

- avaliar rota pai/layout compartilhado para `/minha-arvore`, `/genealogia` e `/visao-completa`;
- revisar se troca de view remonta `Home`;
- revisar navegações internas ainda apontando para `/`;
- trocar link 404 por navegação client-side;
- remover fallback temporário por e-mail de admin quando `profiles.role` estiver garantido;
- documentar matriz final de permissões por tabela/RPC;
- ampliar testes e2e de acesso por perfil.

Esses itens não bloqueiam o MVP se não houver falha P0/P1.
