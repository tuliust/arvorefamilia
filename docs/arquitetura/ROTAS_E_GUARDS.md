# Rotas e guards de acesso - Árvore Família

> Última revisão: 2026-06-11  
> Local canônico: `docs/arquitetura/ROTAS_E_GUARDS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado após inclusão de `/mapa-familiar-horizontal`, remoção das rotas experimentais `/mapa-horizontal` e `/visao-completa-teste`, atualização do contrato de `TreeViewMode` e alinhamento do redirecionamento raiz para `/mapa-familiar`.

## Objetivo

Este documento consolida as rotas atuais, os guards de acesso e as regras de navegação do projeto **Árvore Família**.

Use este arquivo para:

- adicionar ou revisar rotas;
- validar `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`;
- entender o fluxo de login, primeiro acesso e vínculo com pessoa;
- corrigir redirecionamentos;
- revisar navegação entre views da árvore;
- garantir preservação de search params, especialmente `?pessoa=...`;
- garantir que usuário comum não acesse admin.

Documentos relacionados:

- `docs/arquitetura/ARCHITECTURE.md`;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`.

---

## 1. Arquivos principais

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/contexts/AuthContext.tsx
src/app/services/permissionService.ts
src/app/services/memberProfileService.ts
src/app/pages/Entrar.tsx
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
```

---

## 2. Níveis de acesso

| Nível | Exige login | Exige vínculo com pessoa | Exige admin | Guard |
|---|---:|---:|---:|---|
| Público | Não | Não | Não | Nenhum |
| Árvore | Sim | Sim, resolvido pelo fluxo de primeiro acesso | Não | `TreeAccessRoute` |
| Membro | Sim | Não obrigatoriamente no guard | Não | `MemberRoute` |
| Admin | Sim | Não | Sim | `ProtectedRoute` |

Observação: RLS, RPCs e services continuam obrigatórios. Guard de rota não substitui regra de banco.

---

## 3. Guards

### 3.1 `TreeAccessRoute`

Arquivo:

```txt
src/app/components/TreeAccessRoute.tsx
```

Responsabilidade:

- proteger as views principais da árvore;
- proteger a busca global autenticada;
- exigir usuário autenticado;
- exigir login recente;
- resolver vínculo de primeiro acesso via `resolveFirstAccessLinkForUser`;
- redirecionar usuário sem acesso para `/entrar`;
- redirecionar vínculo recém-criado com dados não confirmados para `/meus-dados`.

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

Fluxo consolidado:

```txt
loading -> tela de verificação
sem sessão -> /entrar
sessão sem login recente -> /entrar
sem vínculo resolvido -> /entrar
vínculo recém-criado + dados_confirmados=false -> /meus-dados
vínculo existente ou resolvido -> libera árvore/busca
```

Cuidados:

- não liberar árvore para usuário sem vínculo resolvido;
- não transformar `dados_confirmados=false` de vínculo antigo em loop permanente para `/meus-dados` sem validar regra de produto;
- não resolver acesso apenas no frontend se RLS exigir ajuste;
- não trocar `TreeAccessRoute` por `MemberRoute` nas views da árvore;
- preservar search params ao redirecionar `/` para `/mapa-familiar`.

### 3.2 `MemberRoute`

Arquivo:

```txt
src/app/components/MemberRoute.tsx
```

Responsabilidade:

- proteger páginas de usuário autenticado;
- redirecionar visitante para `/entrar`;
- permitir que regras específicas de dados sejam tratadas por service/RLS.

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

- não usar `ProtectedRoute` em página de membro;
- não assumir que todo usuário autenticado pode editar qualquer pessoa;
- perfil, sugestões, arquivos, favoritos e fórum devem respeitar permissões e RLS próprias.

### 3.3 `ProtectedRoute`

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
- `/admin/login` é rota pública/legada, não caminho principal do menu do usuário.

---

## 4. Rotas públicas

| Rota | Componente | Função |
|---|---|---|
| `/entrar` | `Entrar` | Home pública, login, cadastro, primeiro acesso e aceite legal |
| `/termos` | `Termos` | Termos de uso |
| `/privacidade` | `Privacidade` | Política de privacidade |
| `/admin/login` | `AdminLogin` | Entrada administrativa específica/legada |

Regras:

- `/entrar` não deve exigir sessão;
- termos e privacidade devem permanecer acessíveis sem login;
- `/admin/login` não deve ser usado como item principal de navegação;
- `/entrar` também funciona como tela pública de identidade do app;
- o título principal da home pública deve ser **Família Souza Barros**;
- o texto institucional da plataforma deve existir diretamente no JSX de `src/app/pages/Entrar.tsx`;
- se uma exigência de OAuth pedir descrição pública da integração, definir superfície pública adequada sem usar CSS, pseudo-elementos ou conteúdo invisível.

---

## 5. Rotas da árvore

| Rota | Componente | Guard | View |
|---|---|---|---|
| `/` | `RedirectToMapaFamiliar` | `TreeAccessRoute` | redireciona para `/mapa-familiar` |
| `/minha-arvore` | `Home` | `TreeAccessRoute` | `minha-arvore` |
| `/mapa-familiar` | `Home` | `TreeAccessRoute` | `mapa-familiar` |
| `/mapa-familiar-horizontal` | `FamilyHorizontalMapRoute` → `Home` | `TreeAccessRoute` | `mapa-familiar-horizontal` |
| `/genealogia` | `Home` | `TreeAccessRoute` | `genealogia` |
| `/visao-completa` | `Home` | `TreeAccessRoute` | `visao-completa` |
| `/busca` | `BuscaResultados` | `TreeAccessRoute` | busca global protegida |

Regras:

- as views da árvore usam o mesmo shell `Home`;
- `/mapa-familiar-horizontal` usa wrapper com `data-tree-route-view="mapa-familiar-horizontal"`;
- `/` redireciona para `/mapa-familiar`, preservando search params;
- `/mapa-horizontal` e `/visao-completa-teste` foram removidas e devem cair no fallback 404;
- não adicionar rota experimental nova sem registrá-la na documentação e em `treeViewMode.ts`.

---

## 6. Contrato de `TreeViewMode`

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

Regras:

- qualquer nova view deve ser registrada em `TreeViewMode`, `VIEW_MODE_TO_PATH`, `PATH_TO_VIEW_MODE`, `routes.tsx`, painel, busca/favoritos quando aplicável e documentação;
- rotas antigas removidas não devem permanecer como alias silencioso sem decisão explícita;
- `getTreeViewModeFromPath()` deve cair em `mapa-familiar` como fallback atual.

---

## 7. Renderização por view

A decisão de renderização fica em `HomeTreeSection.tsx`.

| View | Desktop/tablet | Mobile |
|---|---|---|
| `minha-arvore` | `FamilyTree`/ReactFlow | `MobileFamilyTreeView` |
| `mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `DesktopFamilyHorizontalMapView` |
| `genealogia` | `FamilyTree`/ReactFlow | `FamilyTree` com tabs/chips de geração |
| `visao-completa` | `FamilyTree`/ReactFlow | `FamilyTree` com tabs/chips de geração |

Observações:

- `DesktopFamilyHorizontalMapView` não é ReactFlow, apesar de usar `buildTreeGraph` e `genealogyColumnsLayout` como referência interna de ordenação;
- `MobileFamilyTreeView` é a experiência mobile segmentada 3×3 da família direta;
- `MobileTreeControlsPortal` não deve renderizar seu painel simplificado para `/mapa-familiar` e `/mapa-familiar-horizontal`, pois essas rotas usam painel mobile do `HomeMobileNav`/`Home`.

---

## 8. Painel e navegação entre views

No desktop, `SidebarPanelTabs.tsx` exibe:

| Botão | View | Rota |
|---|---|---|
| Vertical | `mapa-familiar` | `/mapa-familiar` |
| Horizontal | `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Opções mobile-only ainda podem existir internamente para `minha-arvore` e `genealogia`, mas a experiência desktop atual prioriza o par Vertical/Horizontal.

Regras:

- clique em **Vertical** deve preservar search params relevantes;
- clique em **Horizontal** deve preservar search params relevantes;
- a rota ativa deve ser detectada por prefixo, especialmente `/mapa-familiar-horizontal`;
- não redirecionar **Horizontal** para `/visao-completa`.

---

## 9. Rotas de membro

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

---

## 10. Rotas administrativas

| Rota | Guard |
|---|---|
| `/admin` | `ProtectedRoute` |
| `/admin/dashboard` | `ProtectedRoute` |
| `/admin/home` | `ProtectedRoute` |
| `/admin/pessoas` | `ProtectedRoute` |
| `/admin/pessoas/nova` | `ProtectedRoute` |
| `/admin/pessoas/:id` | `ProtectedRoute` |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` |
| `/admin/relacionamentos` | `ProtectedRoute` |
| `/admin/relacionamentos/novo` | `ProtectedRoute` |
| `/admin/importacao` | `ProtectedRoute` |
| `/admin/migrar-dados` | `ProtectedRoute` |
| `/admin/diagnostico` | `ProtectedRoute` |
| `/admin/integridade` | `ProtectedRoute` |
| `/admin/atividades` | `ProtectedRoute` |
| `/admin/notificacoes` | `ProtectedRoute` |
| `/admin/solicitacoes-vinculos` | `ProtectedRoute` |

---

## 11. Search params e navegação contextual

Regras:

- `?pessoa=...` deve ser preservado ao alternar views da árvore quando tecnicamente aplicável;
- navegação de perfil deve preservar origem por `?voltar=...`;
- `RedirectToMapaFamiliar` deve preservar `location.search`;
- troca de paleta não altera URL;
- troca de filtros não altera URL;
- troca de view pelo painel deve usar `getPathForTreeViewMode`.

---

## 12. Checklist para adicionar ou ajustar view da árvore

Ao adicionar/alterar view:

1. Atualizar `TreeViewMode`.
2. Atualizar `VIEW_MODE_TO_PATH`.
3. Atualizar `PATH_TO_VIEW_MODE`.
4. Atualizar `routes.tsx`.
5. Definir wrapper de rota se precisar de `data-tree-route-view`.
6. Atualizar `HomeTreeSection.tsx`.
7. Atualizar `SidebarPanelTabs.tsx`.
8. Atualizar busca global e favoritos se a view for pública no app.
9. Validar `MobileTreeControlsPortal`.
10. Validar `HomeMobileNav`.
11. Atualizar documentação:
    - `ROTAS_E_GUARDS.md`;
    - `GUIA_COMPONENTES.md`;
    - `GUIA_UX_LAYOUT.md`;
    - documento funcional da view.
12. Rodar:
    ```bash
    npm run build
    git diff --check
    ```

---

## 13. Anti-regressões

Não fazer:

- reintroduzir `/mapa-horizontal` ou `/visao-completa-teste` sem decisão explícita;
- redirecionar `/mapa-familiar-horizontal` para `/visao-completa`;
- trocar `TreeAccessRoute` por `MemberRoute` nas rotas da árvore;
- remover preservação de search params do redirect `/`;
- esconder rota via UI sem remover do router quando a decisão for exclusão;
- alterar guard de admin baseado apenas em estado visual do menu;
- criar alias silencioso sem documentação.
