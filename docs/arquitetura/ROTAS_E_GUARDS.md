# Rotas e guards de acesso - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/arquitetura/ROTAS_E_GUARDS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado contra `routes.tsx`, `treeViewMode.ts` e shell atual das views da árvore, com `/` redirecionando para `/mapa-familiar`, `/mapa-familiar-horizontal` consolidada e rotas experimentais removidas.

---

## 1. Objetivo

Este documento consolida as rotas atuais, os guards de acesso e as regras de navegação do projeto **Árvore Família**.

Use este arquivo para:

- adicionar ou revisar rotas;
- validar `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`;
- entender fluxo de login, primeiro acesso e vínculo com pessoa;
- corrigir redirecionamentos;
- revisar navegação entre views da árvore;
- preservar search params, especialmente `?pessoa=...`;
- garantir que usuário comum não acesse admin.

Documentos relacionados:

```txt
docs/arquitetura/ARCHITECTURE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
```

---

## 2. Arquivos principais

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/contexts/AuthContext.tsx
src/app/services/permissionService.ts
src/app/services/memberProfileService.ts
src/app/components/FamilyTree/treeViewMode.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
```

---

## 3. Níveis de acesso

| Nível | Exige login | Exige vínculo com pessoa | Exige admin | Guard |
|---|---:|---:|---:|---|
| Público | Não | Não | Não | Nenhum |
| Árvore | Sim | Sim, resolvido pelo fluxo de primeiro acesso | Não | `TreeAccessRoute` |
| Membro | Sim | Não obrigatoriamente no guard | Não | `MemberRoute` |
| Admin | Sim | Não | Sim | `ProtectedRoute` |

Regra importante:

```txt
Guard de rota não substitui RLS, RPC segura, policies, service e validações de permissão.
```

---

## 4. Guards

### 4.1 `TreeAccessRoute`

Arquivo:

```txt
src/app/components/TreeAccessRoute.tsx
```

Responsabilidade:

- proteger views principais da árvore;
- proteger busca global autenticada;
- exigir usuário autenticado;
- exigir login recente;
- resolver vínculo de primeiro acesso;
- redirecionar usuário sem acesso para `/entrar`;
- redirecionar vínculo recém-criado com dados não confirmados para `/meus-dados`, conforme regra vigente.

Rotas protegidas:

```txt
/
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
/busca
```

Fluxo conceitual:

```txt
loading
-> sem sessão: /entrar
-> sessão sem login recente: /entrar
-> sem vínculo resolvido: /entrar
-> vínculo recém-criado + dados_confirmados=false: /meus-dados
-> vínculo existente ou resolvido: libera árvore/busca
```

Cuidados:

- não liberar árvore para usuário sem vínculo resolvido;
- não trocar `TreeAccessRoute` por `MemberRoute` nas views da árvore;
- preservar search params ao redirecionar `/` para `/mapa-familiar`;
- não implementar permissão sensível apenas no frontend.

### 4.2 `MemberRoute`

Arquivo:

```txt
src/app/components/MemberRoute.tsx
```

Responsabilidade:

- proteger páginas de usuário autenticado;
- redirecionar visitante para `/entrar`;
- deixar regras específicas de dados para services/RLS/RPC.

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

Cuidados:

- não usar `ProtectedRoute` em página de membro comum;
- não assumir que usuário autenticado pode editar qualquer pessoa;
- perfil, arquivos, sugestões, favoritos e fórum devem respeitar permissões próprias.

### 4.3 `ProtectedRoute`

Arquivo:

```txt
src/app/components/ProtectedRoute.tsx
```

Responsabilidade:

- proteger área administrativa;
- exigir usuário autenticado;
- consultar `permissionService.isAdminUser`;
- bloquear usuário comum.

Validação de admin:

```txt
permissionService.isAdminUser(user)
  -> supabase.rpc('is_admin_user', { target_user_id: user.id })
```

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

Cuidados:

- falha de verificação deve bloquear;
- botão **Painel Admin** no menu não substitui guard;
- dados administrativos devem continuar protegidos por RLS/RPC;
- `/admin/login` é rota pública/legada, não item principal do menu de usuário.

---

## 5. Rotas públicas

| Rota | Componente | Função |
|---|---|---|
| `/entrar` | `Entrar` | Home pública, login, cadastro, primeiro acesso e aceite legal |
| `/termos` | `Termos` | Termos de uso |
| `/privacidade` | `Privacidade` | Política de privacidade |
| `/admin/login` | `AdminLogin` | Entrada administrativa específica/legada |

Regras:

- `/entrar` não exige sessão;
- termos e privacidade permanecem acessíveis sem login;
- `/admin/login` não deve ser item principal de navegação;
- `/entrar` também funciona como superfície pública de identidade do app.

---

## 6. Rotas da árvore

| Rota | Elemento/Componente | Guard | View |
|---|---|---|---|
| `/` | `RedirectToMapaFamiliar` | `TreeAccessRoute` | redireciona para `/mapa-familiar` |
| `/minha-arvore` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `minha-arvore` |
| `/mapa-familiar` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `mapa-familiar` |
| `/mapa-familiar-horizontal` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `mapa-familiar-horizontal` |
| `/genealogia` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `genealogia` |
| `/visao-completa` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `visao-completa` |
| `/busca` | `BuscaResultados` | `TreeAccessRoute` | busca global protegida |

Regras:

- todas as views da árvore usam o mesmo shell `Home`;
- `/mapa-familiar-horizontal` recebe `data-tree-route-view="mapa-familiar-horizontal"` no wrapper;
- `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- `/mapa-horizontal` e `/visao-completa-teste` foram removidas;
- não adicionar rota experimental nova sem registrar em `treeViewMode.ts`, `routes.tsx`, painel e documentação.

---

## 7. Contrato de `TreeViewMode`

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Contrato atual:

```ts
export type TreeViewMode =
  | 'minha-arvore'
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal'
  | 'genealogia'
  | 'visao-completa';
```

Mapeamento atual:

```ts
export const VIEW_MODE_TO_PATH: Record<TreeViewMode, string> = {
  'minha-arvore': '/minha-arvore',
  'mapa-familiar': '/mapa-familiar',
  'mapa-familiar-horizontal': '/mapa-familiar-horizontal',
  genealogia: '/genealogia',
  'visao-completa': '/visao-completa',
};

export const PATH_TO_VIEW_MODE: Record<string, TreeViewMode> = {
  '/': 'mapa-familiar',
  '/minha-arvore': 'minha-arvore',
  '/mapa-familiar': 'mapa-familiar',
  '/mapa-familiar-horizontal': 'mapa-familiar-horizontal',
  '/genealogia': 'genealogia',
  '/visao-completa': 'visao-completa',
};
```

Fallback:

```txt
getTreeViewModeFromPath(pathname) -> mapa-familiar quando path não é conhecido.
```

Cuidados:

- qualquer nova view deve ser registrada em `TreeViewMode`, `VIEW_MODE_TO_PATH`, `PATH_TO_VIEW_MODE`, `routes.tsx`, painel, busca/favoritos se aplicável e documentação;
- rota antiga removida não deve permanecer como alias silencioso sem decisão explícita;
- se a rota possuir subrotas, revisar detecção por prefixo no painel.

---

## 8. Renderização por view

A decisão principal fica em `HomeTreeSection.tsx`.

| View | Desktop/tablet | Mobile |
|---|---|---|
| `minha-arvore` | `FamilyTree` / ReactFlow | `MobileFamilyTreeView` |
| `mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `DesktopFamilyHorizontalMapView` |
| `genealogia` | `FamilyTree` / ReactFlow | `FamilyTree` com tabs/chips de geração |
| `visao-completa` | `FamilyTree` / ReactFlow | `FamilyTree` com tabs/chips de geração |

Observações:

- `DesktopFamilyHorizontalMapView` não é ReactFlow, embora use `buildTreeGraph` e `genealogyColumnsLayout` como referência interna;
- `MobileFamilyTreeView` é a experiência mobile segmentada da família direta;
- `MobileTreeControlsPortal` não deve renderizar painel simplificado para `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 9. Navegação do painel

No desktop, `SidebarPanelTabs.tsx` exibe:

| Botão | View | Rota |
|---|---|---|
| Vertical | `mapa-familiar` | `/mapa-familiar` |
| Horizontal | `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Opções mobile-only internas ainda podem existir para `minha-arvore` e `genealogia`, mas a experiência desktop atual privilegia o par Vertical/Horizontal.

Regras:

- clique em **Vertical** e **Horizontal** preserva `location.search`;
- a rota ativa deve ser detectada por prefixo, especialmente `/mapa-familiar-horizontal`;
- não redirecionar **Horizontal** para `/visao-completa`;
- `Restaurar visualização` dispara `restore-view`, não `zoom-out`.

---

## 10. Rotas de membro

| Rota | Componente | Guard |
|---|---|---|
| `/minha-arvore/editar` | `MinhaArvore` | `MemberRoute` |
| `/meus-dados` | `MeusDados` | `MemberRoute` |
| `/meus-vinculos` | `MeusVinculos` | `MemberRoute` |
| `/vincular-perfil` | `VincularPerfil` | `MemberRoute` |
| `/pessoa/:id` | `PersonProfile` | `MemberRoute` |
| `/pessoas/:id` | `PersonProfile` | `MemberRoute` |
| `/calendario-familiar` | `CalendarioFamiliar` | `MemberRoute` |
| `/meus-favoritos` | `MeusFavoritos` | `MemberRoute` |
| `/notificacoes` | `Notificacoes` | `MemberRoute` |
| `/ajustar-notificacoes` | `AjustarNotificacoes` | `MemberRoute` |
| `/forum` | `ForumHome` | `MemberRoute` |
| `/forum/novo` | `ForumNovoTopico` | `MemberRoute` |
| `/forum/topico/:id` | `ForumTopico` | `MemberRoute` |
| `/forum/topico/:id/editar` | `ForumEditarTopico` | `MemberRoute` |

Regras:

- edição de pessoa, arquivos e relacionamentos depende de permissões além do login;
- retorno para árvore deve respeitar `voltar`;
- `/pessoa/:id` e `/pessoas/:id` apontam para `PersonProfile`.

---

## 11. Rotas administrativas

| Rota | Componente | Guard |
|---|---|---|
| `/admin` | `AdminDashboard` | `ProtectedRoute` |
| `/admin/dashboard` | `AdminDashboard` | `ProtectedRoute` |
| `/admin/home` | `AdminHomeSettings` | `ProtectedRoute` |
| `/admin/pessoas` | `AdminPessoas` | `ProtectedRoute` |
| `/admin/pessoas/nova` | `AdminPessoaForm` | `ProtectedRoute` |
| `/admin/pessoas/:id` | `AdminPessoaForm` ou equivalente | `ProtectedRoute` |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` | `ProtectedRoute` |
| `/admin/relacionamentos` | `AdminRelacionamentos` | `ProtectedRoute` |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` | `ProtectedRoute` |
| `/admin/importacao` | `AdminImportacao` | `ProtectedRoute` |
| `/admin/migrar-dados` | `AdminMigrarDados` | `ProtectedRoute` |
| `/admin/diagnostico` | `AdminDiagnostico` | `ProtectedRoute` |
| `/admin/integridade` | `AdminIntegridade` | `ProtectedRoute` |
| `/admin/atividades` | `AdminAtividades` | `ProtectedRoute` |
| `/admin/notificacoes` | `AdminNotificacoes` | `ProtectedRoute` |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos` | `ProtectedRoute` |
| `/admin/login` | `AdminLogin` | pública/legada |

Regras:

- `/admin/login` não substitui `ProtectedRoute`;
- rotas admin não devem ser acessíveis por usuário comum;
- se RPC/admin falhar, bloquear por segurança.

---

## 12. Busca global e favoritos

Estado atual:

- `/mapa-familiar` está em `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES`.
- `/mapa-familiar-horizontal` ainda não aparece como página própria nesses arrays.

Pendência de produto:

```txt
Decidir se /mapa-familiar-horizontal deve ser indexada/favoritável como página independente.
```

Se sim, atualizar:

```txt
src/app/services/globalSearchService.ts
src/app/constants/favoritePages.ts
docs/funcionalidades/FAVORITOS.md
docs/README.md
```

---

## 13. Anti-regressões

Não fazer sem revisão:

- recriar `/mapa-horizontal` ou `/visao-completa-teste`;
- trocar `/` para `/minha-arvore` sem decisão de produto;
- remover `TreeAccessRoute` das views da árvore;
- trocar `TreeHomeShell` por páginas isoladas sem revisar estado compartilhado;
- fazer `Horizontal` navegar para `/visao-completa`;
- reativar `MobileTreeControlsPortal` nos Mapas Familiares;
- usar UI escondida como substituto de guard/RLS/RPC;
- perder search params ao trocar view;
- persistir inferências visuais de geração automaticamente no banco.
