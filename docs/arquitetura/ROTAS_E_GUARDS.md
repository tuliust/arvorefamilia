# Rotas e guards de acesso — Árvore Família

> Última revisão: 2026-06-14
> Local canônico: `docs/arquitetura/ROTAS_E_GUARDS.md`
> Tipo: documentação arquitetural de rotas, guards e navegação.
> Status: revisado para refletir a `main` atual, com duas views oficiais da árvore e rotas antigas removidas do produto ativo.

---

## 1. Objetivo

Este documento define o contrato vigente de rotas, guards de acesso, redirecionamentos e navegação do projeto.

Use este arquivo para:

- revisar `src/app/routes.tsx`;
- alterar ou validar guards;
- manter `TreeViewMode` coerente;
- impedir retorno acidental de rotas antigas;
- validar navegação entre as views da árvore;
- revisar retorno de perfil, busca e favoritos.

Este documento não detalha layout, exportação nem regras visuais. Para isso, consulte:

- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- `docs/GUIA_UX_LAYOUT.md`.

Para histórico preventivo das rotas removidas, consulte:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

---

## 2. Regra principal

```txt
A rota implementada em `src/app/routes.tsx` prevalece sobre documentação histórica.
```

As views ativas da árvore são apenas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

As rotas antigas abaixo não são views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa rota pertence ao fluxo de edição de dados do membro e não deve ser confundida com a antiga view `/minha-arvore`.

O histórico das rotas removidas fica em:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

---

## 3. Arquivos envolvidos

```txt
src/app/routes.tsx
src/app/components/TreeAccessRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/PersonProfile.tsx
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/contexts/AuthContext.tsx
src/app/services/permissionService.ts
```

---

## 4. Níveis de acesso

| Nível | Exige sessão | Exige vínculo com pessoa | Exige admin | Guard |
|---|---:|---:|---:|---|
| Público | Não | Não | Não | nenhum |
| Árvore | Sim | Sim, via fluxo de primeiro acesso/vínculo | Não | `TreeAccessRoute` |
| Membro | Sim | Não necessariamente no guard | Não | `MemberRoute` |
| Admin | Sim | Não | Sim | `ProtectedRoute` |

Regra de segurança:

```txt
Guard frontend não substitui RLS, RPC segura, service layer, policies ou validação server-side.
```

---

## 5. Guards

### 5.1 `TreeAccessRoute`

Protege:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
/busca
```

Responsabilidades:

- exigir usuário autenticado;
- exigir condição de acesso à árvore;
- resolver fluxo de vínculo/primeiro acesso;
- redirecionar visitante para `/entrar`;
- preservar query string quando a rota raiz redirecionar para `/mapa-familiar`.

Cuidados:

- não trocar as views da árvore para `MemberRoute`;
- não liberar árvore para usuário sem vínculo quando o fluxo exigir vínculo;
- não remover preservação de `location.search`.

### 5.2 `MemberRoute`

Protege páginas de membro autenticado:

```txt
/minha-arvore/editar
/meus-dados
/meus-vinculos
/vincular-perfil
/revisao-dados
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum/*
```

Cuidados:

- autenticação não significa permissão para editar qualquer pessoa;
- permissões de perfil, arquivos, fórum e sugestões continuam em services/RLS/RPC;
- `/minha-arvore/editar` é vigente, apesar do nome histórico.

### 5.3 `ProtectedRoute`

Protege:

```txt
/admin
/admin/*
```

Responsabilidades:

- exigir usuário autenticado;
- consultar permissão administrativa;
- bloquear usuário comum;
- tratar falha de checagem como bloqueio seguro.

Cuidados:

- o botão de menu “Painel Admin” não substitui guard;
- permissões administrativas sensíveis devem ser reforçadas no banco;
- `/admin/login` é rota pública/admin específica, não substitui `ProtectedRoute`.

---

## 6. Rotas públicas

| Rota | Função |
|---|---|
| `/entrar` | login, cadastro, primeiro acesso e superfície pública do app |
| `/termos` | termos de uso |
| `/privacidade` | política de privacidade |
| `/admin/login` | entrada administrativa específica/legada |

Regras:

- termos e privacidade devem abrir sem login;
- `/entrar` deve funcionar sem sessão;
- textos públicos de integração, quando existirem, não devem prometer funcionalidade OAuth além do implementado.

---

## 7. Rotas da árvore

| Rota | Guard | Resultado |
|---|---|---|
| `/` | `TreeAccessRoute` | redireciona para `/mapa-familiar`, preservando query string |
| `/mapa-familiar` | `TreeAccessRoute` | shell `Home` com view vertical |
| `/mapa-familiar-horizontal` | `TreeAccessRoute` | shell `Home` com view horizontal |
| `/busca` | `TreeAccessRoute` | busca global autenticada |

Rotas antigas:

| Rota | Status esperado |
|---|---|
| `/minha-arvore` | não é view ativa; deve cair em 404/fluxo não encontrado |
| `/genealogia` | não é view ativa; deve cair em 404/fluxo não encontrado |
| `/visao-completa` | não é view ativa; deve cair em 404/fluxo não encontrado |

Referência histórica/preventiva:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

---

## 8. `TreeViewMode`

Arquivo:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Contrato vigente:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Mapeamento:

| `TreeViewMode` | Path |
|---|---|
| `mapa-familiar` | `/mapa-familiar` |
| `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Fallback:

```txt
getTreeViewModeFromPath(path desconhecido) -> mapa-familiar
```

Regras:

- não adicionar `minha-arvore`, `genealogia` ou `visao-completa`;
- não criar alias silencioso para rota antiga removida;
- nova view exige decisão arquitetural, rota, navegação, favoritos, busca, testes e documentação.

---

## 9. Renderização das views

A renderização principal é decidida por `HomeTreeSection.tsx`.

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Regras:

- `/mapa-familiar` é a view principal/default;
- `/mapa-familiar-horizontal` é a horizontal/genealógica oficial;
- horizontal mobile usa uma geração por tela;
- vertical mobile usa experiência Paterno/Central/Materno;
- `FamilyTree.tsx` pode existir como legado ativo, mas não é renderer público principal das views oficiais.

---

## 10. Alternância de view

A alternância Vertical/Horizontal deve:

- navegar entre `/mapa-familiar` e `/mapa-familiar-horizontal`;
- preservar `location.search`;
- não remover `?pessoa=...`;
- não transformar `/minha-arvore/editar` em view da árvore;
- não usar `/genealogia` ou `/visao-completa` como atalho.

Exemplos:

```txt
/mapa-familiar?pessoa=abc
-> /mapa-familiar-horizontal?pessoa=abc

/mapa-familiar-horizontal?pessoa=abc
-> /mapa-familiar?pessoa=abc
```

---

## 11. Favoritos e busca global

Páginas de árvore favoritáveis:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

A busca global pode aceitar termos antigos como keywords, desde que apontem para rotas vigentes.

Exemplos permitidos:

| Keyword | Destino |
|---|---|
| minha árvore | `/mapa-familiar` |
| árvore genealógica | `/mapa-familiar-horizontal` |
| genealogia | `/mapa-familiar-horizontal` |
| visão completa | `/mapa-familiar-horizontal` |

Regra:

```txt
Keyword antiga não reativa rota antiga.
```

---

## 12. Retorno de perfil

`PersonProfile.tsx` deve aceitar apenas retornos internos seguros.

Retornos seguros para a árvore:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

Fallback:

```txt
/mapa-familiar
```

Regras:

- rejeitar URL externa;
- rejeitar rota antiga como destino ativo;
- preservar retorno a partir da horizontal quando codificado em `?voltar=...`;
- não usar `/minha-arvore` como fallback.

---

## 13. Testes e QA

Comandos mínimos para mudanças neste documento ou nos arquivos relacionados:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

QA de rotas:

- `/` redireciona corretamente;
- `/mapa-familiar` exige acesso à árvore;
- `/mapa-familiar-horizontal` exige acesso à árvore;
- `/minha-arvore/editar` exige membro autenticado;
- `/admin/*` bloqueia usuário comum;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não voltam como views ativas.

Para interpretar ocorrências dessas rotas em buscas, use também `docs/historico/ROTAS_REMOVIDAS.md`.

---

## 14. Critérios para alterar este documento

Atualize este arquivo quando houver:

- nova rota;
- mudança de guard;
- mudança em `TreeViewMode`;
- alteração de fallback de `/`;
- alteração de retorno de perfil;
- novo comportamento de favoritos/busca;
- remoção ou reativação formal de rota.

Não atualize este arquivo para mudanças puramente visuais em cards, CSS, paletas ou exportação, exceto se a mudança afetar navegação.
