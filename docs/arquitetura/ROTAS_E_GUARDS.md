# Rotas e guards de acesso — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/arquitetura/ROTAS_E_GUARDS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado para consolidar rotas vigentes, rotas removidas, guards, shell das views oficiais, painel simplificado e navegação preservando `location.search`.

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
- garantir que usuário comum não acesse admin;
- evitar a restauração acidental de views removidas.

Documentos relacionados:

```txt
docs/arquitetura/ARCHITECTURE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/funcionalidades/FAVORITOS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
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
src/app/pages/PersonProfile.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
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
- exigir login recente quando aplicável;
- resolver vínculo de primeiro acesso;
- redirecionar usuário sem acesso para `/entrar`;
- redirecionar vínculo recém-criado com dados não confirmados para `/meus-dados`, conforme regra vigente.

Rotas protegidas:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
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
- perfil, arquivos, sugestões, favoritos e fórum devem respeitar permissões próprias;
- `/minha-arvore/editar` é vigente, apesar do nome histórico.

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
- `/entrar` também funciona como superfície pública de identidade do app e pode conter explicação de integrações como Google Agenda.

---

## 6. Rotas da árvore

| Rota | Elemento/Componente | Guard | View |
|---|---|---|---|
| `/` | `RedirectToMapaFamiliar` | `TreeAccessRoute` | redireciona para `/mapa-familiar` |
| `/mapa-familiar` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `mapa-familiar` |
| `/mapa-familiar-horizontal` | `TreeHomeShell` → `Home` | `TreeAccessRoute` | `mapa-familiar-horizontal` |
| `/busca` | `BuscaResultados` | `TreeAccessRoute` | busca global protegida |

Regras:

- as duas views da árvore usam o mesmo shell `Home`;
- `/mapa-familiar` é a view default;
- `/mapa-familiar-horizontal` é a view horizontal/genealógica oficial;
- `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` foram removidas como views ativas;
- não adicionar rota experimental nova sem registrar em `treeViewMode.ts`, `routes.tsx`, painel, testes e documentação.

Rotas antigas removidas:

| Rota | Status esperado |
|---|---|
| `/minha-arvore` | 404 |
| `/genealogia` | 404 |
| `/visao-completa` | 404 |

Exceção vigente:

| Rota | Guard | Observação |
|---|---|---|
| `/minha-arvore/editar` | `MemberRoute` | Edição de dados/árvore pelo membro. Não é a view antiga `/minha-arvore`. |

---

## 7. Contrato de `TreeViewMode`

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Contrato atual:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Mapeamento atual:

```ts
export const VIEW_MODE_TO_PATH: Record<TreeViewMode, string> = {
  'mapa-familiar': '/mapa-familiar',
  'mapa-familiar-horizontal': '/mapa-familiar-horizontal',
};

export const PATH_TO_VIEW_MODE: Record<string, TreeViewMode> = {
  '/': 'mapa-familiar',
  '/mapa-familiar': 'mapa-familiar',
  '/mapa-familiar-horizontal': 'mapa-familiar-horizontal',
};
```

Fallback:

```txt
getTreeViewModeFromPath(pathname) -> mapa-familiar quando path não é conhecido.
```

Cuidados:

- qualquer nova view deve ser decisão de produto, não exceção local;
- rota antiga removida não deve permanecer como alias silencioso sem decisão explícita;
- se a rota possuir subrotas, revisar detecção por prefixo no painel;
- `TreeViewMode` não deve voltar a incluir `minha-arvore`, `genealogia` ou `visao-completa`.

---

## 8. Renderização por view

A decisão principal fica em `HomeTreeSection.tsx`.

| View | Desktop/tablet | Mobile |
|---|---|---|
| `mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Observações:

- `DesktopFamilyHorizontalMapView` não é ReactFlow, embora possa usar helpers e layouts preservados;
- `MobileFamilyHorizontalMapView` é a experiência mobile própria da horizontal, com uma geração por tela e swipe lateral;
- `MobileFamilyTreeView` é a experiência mobile segmentada da família direta;
- `FamilyTree.tsx` não é renderer oficial das views atuais, mas ainda pode fornecer contrato/tipos e deve ser removido apenas após extração segura.

---

## 9. Navegação do painel

No desktop, `SidebarPanelTabs.tsx` exibe alternância de rota:

| Botão | View | Rota |
|---|---|---|
| Vertical | `mapa-familiar` | `/mapa-familiar` |
| Horizontal | `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Regras:

- clique em **Vertical** e **Horizontal** preserva `location.search`;
- a rota ativa deve ser detectada por prefixo, especialmente `/mapa-familiar-horizontal`;
- não adicionar atalhos para `/minha-arvore`, `/genealogia` ou `/visao-completa`.

Controles vigentes no desktop:

```txt
Zoom +
Zoom -
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Grupos/Filtros
Filtros de status
```

O produto não usa mais a barra visual persistente:

```txt
Filtros | Legendas | Ações
```

No mobile, o modal de controles deve conter apenas:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

E não deve conter:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

---

## 10. Retorno de perfil

Arquivo:

```txt
src/app/pages/PersonProfile.tsx
```

Contrato atual:

```txt
TREE_RETURN_FALLBACK_PATH = /mapa-familiar
ALLOWED_TREE_RETURN_PATHS = /, /mapa-familiar, /mapa-familiar-horizontal
```

Regras:

- abrir perfil a partir de `/mapa-familiar` deve permitir retorno para `/mapa-familiar`;
- abrir perfil a partir de `/mapa-familiar-horizontal` deve permitir retorno para `/mapa-familiar-horizontal`;
- `?voltar=...` deve aceitar apenas caminhos internos permitidos;
- caminhos externos, vazios ou não permitidos caem em `/mapa-familiar`;
- `?pessoa=...` e demais search params de retorno podem ser preservados quando codificados no `voltar`.

---

## 11. Navegação, busca global e favoritos

Arquivos:

```txt
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
```

Estado atual:

| Rota | Busca global | Favoritos | Observação |
|---|---:|---:|---|
| `/mapa-familiar` | Sim | Sim | View principal. |
| `/mapa-familiar-horizontal` | Sim | Sim | View horizontal/genealógica. |
| `/minha-arvore` | Não | Não | Removida. |
| `/genealogia` | Não | Não | Removida. |
| `/visao-completa` | Não | Não | Removida. |
| `/minha-arvore/editar` | Não como página favorita da árvore | Não listado como atalho principal | Rota de edição protegida. |

Regras:

- navegação ativa não deve apontar para rotas removidas;
- favoritos de página devem salvar rotas canônicas, sem `?pessoa=...`;
- busca global pode indexar termos como “genealogia” para localizar `/mapa-familiar-horizontal`, desde que não use `/genealogia` como rota.

---

## 12. Rotas de membro

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

Observações:

- `/pessoas/:id` é alias de `/pessoa/:id`; se for removido futuramente, criar redirect ou plano de compatibilidade;
- `/minha-arvore/editar` mantém nome histórico por compatibilidade e escopo funcional;
- `/calendario-familiar` inclui UI mobile com filtros compactos de categorias e integração Google Agenda quando configurada.

---

## 13. Rotas administrativas

| Rota | Componente | Guard |
|---|---|---|
| `/admin` | `AdminDashboard` | `ProtectedRoute` |
| `/admin/dashboard` | `AdminDashboard` | `ProtectedRoute` |
| `/admin/home` | `AdminHomeSettings` | `ProtectedRoute` |
| `/admin/pessoas` | `AdminPessoas` | `ProtectedRoute` |
| `/admin/pessoas/nova` | `AdminPessoaForm` | `ProtectedRoute` |
| `/admin/pessoas/:id` | `AdminPessoaForm` | `ProtectedRoute` |
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

`/admin/migrar-dados` é rota destrutiva e também depende da variável:

```env
VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true
```

---

## 14. 404

A rota catch-all `*` renderiza página de rota não encontrada.

Deve cobrir:

```txt
/minha-arvore
/genealogia
/visao-completa
qualquer rota desconhecida
```

---

## 15. Checklist antes de alterar rotas

Rodar:

```bash
git status --short
npm run build
npm test
npm run test:e2e
git diff --check
```

Buscas úteis:

```bash
rg "/minha-arvore|/genealogia|/visao-completa"
rg "TreeViewMode"
rg "FAVORITE_PAGES|GLOBAL_SEARCH_PAGES"
rg "ALLOWED_TREE_RETURN_PATHS|TREE_RETURN_FALLBACK_PATH"
rg "Filtros|Legendas|Ações"
```

Validações manuais:

- `/` redireciona para `/mapa-familiar`;
- `/?pessoa=abc` preserva a query ao redirecionar;
- `/mapa-familiar` bloqueia visitante sem sessão;
- `/mapa-familiar-horizontal` bloqueia visitante sem sessão;
- `/minha-arvore`, `/genealogia` e `/visao-completa` retornam 404;
- `/minha-arvore/editar` bloqueia visitante sem sessão;
- perfil permite retorno para as duas views oficiais;
- favoritos e busca global exibem as duas views oficiais.

---

## 16. Regra final

Rotas removidas não devem ser restauradas por documentação antiga.

A baseline atual de árvore é:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Qualquer nova view exige:

1. decisão de produto;
2. alteração em `routes.tsx`;
3. alteração em `treeViewMode.ts`;
4. atualização de navegação, favoritos e busca se aplicável;
5. testes E2E;
6. documentação no mesmo commit.
