# Rotas e guards de acesso - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/arquitetura/ROTAS_E_GUARDS.md`  
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento consolida as rotas atuais, os guards de acesso e as regras de navegação do projeto **Árvore Família**.

Use este arquivo para:

- adicionar ou revisar rotas;
- validar `ProtectedRoute`, `MemberRoute` e `TreeAccessRoute`;
- entender o fluxo de login, primeiro acesso e vínculo com pessoa;
- corrigir redirecionamentos;
- revisar navegação entre `/minha-arvore`, `/genealogia` e `/visao-completa`;
- garantir que usuário comum não acesse admin.

Documentos relacionados:

- `docs/arquitetura/ARCHITECTURE.md`;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
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
src/app/pages/Home.tsx
src/app/components/FamilyTree/treeViewMode.ts
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
- exigir usuário autenticado;
- exigir login recente;
- resolver vínculo de primeiro acesso via `resolveFirstAccessLinkForUser`;
- redirecionar usuário sem acesso para `/entrar`;
- redirecionar vínculo recém-criado com dados não confirmados para `/meus-dados`.

Rotas protegidas:

```txt
/
/minha-arvore
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
vínculo existente ou resolvido -> libera árvore
```

Cuidados:

- não remover preservação de search params do redirect `/` → `/minha-arvore`;
- não liberar árvore para usuário sem vínculo resolvido;
- não transformar `dados_confirmados=false` de vínculo antigo em loop permanente para `/meus-dados` sem validar regra de produto;
- não resolver acesso apenas no frontend se RLS exigir ajuste.

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
| `/entrar` | `Entrar` | Login, cadastro, primeiro acesso e aceite legal |
| `/termos` | `Termos` | Termos de uso |
| `/privacidade` | `Privacidade` | Política de privacidade |
| `/admin/login` | `AdminLogin` | Entrada administrativa específica/legada |

Regras:

- `/entrar` não deve exigir sessão;
- termos e privacidade devem permanecer acessíveis sem login;
- `/admin/login` não deve ser usado como item principal de navegação.

---

## 5. Rotas da árvore

| Rota | Componente | Guard | View |
|---|---|---|---|
| `/` | `RedirectToMinhaArvore` | `TreeAccessRoute` | redireciona para `minha-arvore` |
| `/minha-arvore` | `Home` | `TreeAccessRoute` | `minha-arvore` |
| `/genealogia` | `Home` | `TreeAccessRoute` | `genealogia` |
| `/visao-completa` | `Home` | `TreeAccessRoute` | `visao-completa` |
| `/busca` | `BuscaResultados` | `TreeAccessRoute` | busca global protegida |

Regras:

- as três views usam o mesmo shell `Home`;
- `Home.tsx` deriva `treeViewMode` de `location.pathname`;
- troca de view deve usar navegação client-side;
- search params devem ser preservados, especialmente `?pessoa=...`;
- não manter estado paralelo de view quando a URL já define a view.

---

## 6. Helpers de view da árvore

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Contrato atual:

```txt
TreeViewMode = 'minha-arvore' | 'genealogia' | 'visao-completa'
VIEW_MODE_TO_PATH
PATH_TO_VIEW_MODE
getTreeViewModeFromPath
getPathForTreeViewMode
```

Regras:

- qualquer link interno entre views deve usar helper ou rota canônica equivalente;
- não duplicar mapeamento manual em vários componentes;
- preservar nomes de view, pois eles orientam layout e filtros.

---

## 7. Rotas de membro

| Rota | Componente | Função |
|---|---|---|
| `/minha-arvore/editar` | `MinhaArvore` | Edição da própria árvore/dados pelo membro |
| `/meus-dados` | `MeusDados` | Edição dos dados da pessoa vinculada |
| `/meus-vinculos` | `MeusVinculos` | Gestão/visualização de vínculos |
| `/vincular-perfil` | `VincularPerfil` | Solicitação/criação de vínculo adicional |
| `/pessoa/:id` | `PersonProfile` | Perfil público/interno de pessoa |
| `/pessoas/:id` | `PersonProfile` | Alias do perfil de pessoa |
| `/calendario-familiar` | `CalendarioFamiliar` | Calendário familiar e Google Agenda |
| `/meus-favoritos` | `MeusFavoritos` | Favoritos do usuário |
| `/notificacoes` | `Notificacoes` | Central de notificações |
| `/ajustar-notificacoes` | `AjustarNotificacoes` | Preferências de notificações |
| `/forum` | `ForumHome` | Home do fórum |
| `/forum/novo` | `ForumNovoTopico` | Criação de tópico |
| `/forum/topico/:id` | `ForumTopico` | Visualização de tópico |
| `/forum/topico/:id/editar` | `ForumEditarTopico` | Edição de tópico |

Regras:

- rotas de membro usam `MemberRoute`;
- ações administrativas dentro dessas rotas devem ser condicionais;
- acesso à edição de pessoa depende de permissão específica, não apenas da rota;
- navegação deve usar React Router/AppLink quando possível.

---

## 8. Rotas administrativas

| Rota | Componente | Função |
|---|---|---|
| `/admin` | `AdminDashboard` | Dashboard admin |
| `/admin/dashboard` | `AdminDashboard` | Alias/dashboard admin |
| `/admin/home` | `AdminHomeSettings` | Configurações visuais da home pública |
| `/admin/pessoas` | `AdminPessoas` | Listagem de pessoas |
| `/admin/pessoas/nova` | `AdminPessoaForm` | Criação de pessoa |
| `/admin/pessoas/:id` | `AdminPessoaForm` | Alias de edição/visualização admin |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm` | Edição de pessoa |
| `/admin/relacionamentos` | `AdminRelacionamentos` | Gestão de relacionamentos |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm` | Criação de relacionamento |
| `/admin/importacao` | `AdminImportacao` | Importação |
| `/admin/migrar-dados` | `AdminMigrarDados` | Ferramenta destrutiva de migração de seed |
| `/admin/diagnostico` | `AdminDiagnostico` | Diagnóstico de integridade |
| `/admin/integridade` | `AdminIntegridade` | Integridade de dados |
| `/admin/atividades` | `AdminAtividades` | Histórico de atividades |
| `/admin/notificacoes` | `AdminNotificacoes` | Diagnóstico/gestão de notificações |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos` | Solicitações de vínculo, sugestões de perfil e relacionamento |

Regras:

- toda rota `/admin/*`, exceto `/admin/login`, deve usar `ProtectedRoute`;
- `/admin/migrar-dados` exige proteção adicional por flag e confirmação textual;
- alterações em relacionamento real, reset de perfil, moderação e diagnóstico devem permanecer restritas a admin.

---

## 9. Navegação global

### Home pós-login

`HomeHeader` contém:

- seletor de view;
- seletor de paleta;
- busca de pessoa/página;
- atalhos de fórum/calendário/curiosidades;
- `UserProfileMenu variant="home-header"`.

### Páginas internas

`MemberPageHeader` contém:

- título/subtítulo;
- ações responsivas;
- `UserProfileMenu` padrão;
- navegação inferior mobile fixa com atalhos para Home, Calendário, Fórum, Favoritos e Notificações.

### Menu do usuário

`UserProfileMenu` contém:

- topo clicável para `/minha-arvore/editar`;
- Home;
- Atualizar perfil;
- Fórum;
- Calendário;
- Favoritos;
- Notificações;
- Painel Admin condicional;
- Sair.

No mobile, também apresenta seleção rápida das views da árvore.

---

## 10. Regras anti-regressão

- Não trocar `TreeAccessRoute` por `MemberRoute` nas views da árvore.
- Não proteger `/entrar`, `/termos` ou `/privacidade`.
- Não expor admin por link sem `ProtectedRoute`.
- Não usar e-mail hardcoded como regra de admin.
- Não redirecionar usuário já vinculado em loop para `/meus-dados`.
- Não usar `window.location` para navegação interna quando `navigate` resolver.
- Não quebrar preservação de `?pessoa=...`.
- Não duplicar mapeamento de `TreeViewMode` fora de `treeViewMode.ts` sem justificativa.
- Não usar botão escondido como única proteção de dados.

---

## 11. Checklist de validação

Após alterar rotas/guards:

```bash
npm run build
git diff --check
```

Validar manualmente, sem alterar dados reais:

- visitante acessa `/entrar`, `/termos`, `/privacidade`;
- visitante não acessa área de membro/admin;
- membro acessa `/minha-arvore/editar`, fórum, favoritos, notificações e calendário;
- membro sem admin não acessa `/admin`;
- admin acessa `/admin` e páginas administrativas;
- `/` redireciona para `/minha-arvore` preservando search params;
- troca entre `/minha-arvore`, `/genealogia` e `/visao-completa` mantém navegação client-side.
