# Arquitetura atual - Árvore Família

> Última revisão: 2026-06-11  
> Local canônico: `docs/arquitetura/ARCHITECTURE.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado contra o código atual após criação e consolidação de `/mapa-familiar-horizontal`, remoção das rotas experimentais `/mapa-horizontal` e `/visao-completa-teste`, atualização do redirect `/` para `/mapa-familiar`, painel Vertical/Horizontal, conectores do Mapa Familiar Horizontal, controles mobile e documentação de pendências reais.

## Objetivo

Este documento registra a visão técnica de alto nível do projeto **Árvore Família**: stack, organização de código, camadas, fluxo de dados, rotas, banco, Edge Functions, views da árvore e regras estruturais que não devem ser alteradas sem revisão.

Use este arquivo para entender a arquitetura geral. Para detalhes específicos, consulte:

- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e navegação;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`: modelo de usuários, pessoas, vínculos e tabelas;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations, SQL legado e operação Supabase;
- `docs/GUIA_COMPONENTES.md`: responsabilidades de componentes;
- `docs/GUIA_IMPLEMENTACOES.md`: inventário consolidado do que já está implementado;
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais e padrões de layout;
- `docs/funcionalidades/*.md`: comportamento funcional por área.

---

## 1. Stack atual

| Camada | Tecnologia / recurso |
|---|---|
| Frontend | React 18, TypeScript e Vite |
| Roteamento | React Router 7 com `createBrowserRouter` |
| UI | Tailwind CSS v4, componentes locais em `src/app/components/ui`, `lucide-react` |
| Árvore ReactFlow | React Flow, Dagre, layouts próprios em `components/FamilyTree` |
| Views visuais da árvore | HTML/CSS/SVG em `DesktopFamilyMapView` e `DesktopFamilyHorizontalMapView` |
| Banco/Auth | Supabase Auth, Supabase Postgres, RLS, RPCs e Storage |
| Edge/serverless | Supabase Edge Functions |
| Testes | Vitest e Playwright |
| Exportação | `html2canvas` e `jspdf` para captura de árvore ReactFlow e superfícies HTML/CSS/SVG |
| Integrações | Google Places/Maps, Google Calendar, Resend/OpenAI server-side quando configurados |

Observações:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são referência histórica ou operacional, não schema canônico.
- Secrets não devem ir para frontend, repositório, dumps versionados ou documentação operacional aberta.
- Ajustes visuais, novas views de apresentação e novas paletas não exigem migration.
- Mudança de schema exige migration versionada.
- A view `/mapa-familiar-horizontal` usa dados existentes de `pessoas`, `relacionamentos` e `pessoas.manual_generation`; não exige migration.

---

## 2. Estrutura de código

```txt
src/app/
  components/             Componentes reutilizáveis
  components/ui/          Componentes base de UI
  components/layout/      Headers, menu do usuário e containers
  components/FamilyTree/  ReactFlow, nodes, edges, layouts, exportação e views visuais da árvore
  components/person/      Campos, exibição e editores de pessoa
  components/relationships/ Dados conjugais e vínculos
  components/Timeline/    Timeline de pessoa
  components/favorites/   Favoritos
  contexts/               AuthContext
  lib/                    Cliente Supabase
  pages/                  Páginas públicas, membro, fórum e admin
  pages/home/             Subcomponentes da Home pós-login
  pages/forum/            Fórum
  pages/admin/            Área administrativa
  services/               Acesso a dados, Supabase e regras de aplicação
  types/                  Contratos TypeScript
  utils/                  Funções puras e helpers
  routes.tsx              Definição de rotas e guards

src/styles/
  family-map-qa.css
  family-map-horizontal.css
  mobile-tree-controls.css
  ...

supabase/
  migrations/
  functions/
```

Arquivos centrais da árvore:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Regra de separação:

- componente visual não deve concentrar regra de banco;
- persistência deve passar por service;
- cálculo puro deve ficar em util/model/layout;
- schema deve evoluir por migration;
- rota/guard deve ficar centralizada em `routes.tsx` e nos componentes de proteção;
- view visual da árvore não deve alterar relacionamentos reais.

---

## 3. Camadas principais

| Camada | Responsabilidade | Exemplos |
|---|---|---|
| Rotas/guards | Definir acesso e navegação | `routes.tsx`, `ProtectedRoute`, `MemberRoute`, `TreeAccessRoute` |
| Contexto de auth | Sessão, login, cadastro, logout e estado do usuário | `AuthContext.tsx` |
| Pages | Orquestração de tela, estado local e composição | `Home.tsx`, `PersonProfile.tsx`, páginas admin |
| Components | UI, interação visual e componentes reutilizáveis | `FamilyTree`, `DesktopFamilyMapView`, `DesktopFamilyHorizontalMapView`, `MobileFamilyTreeView`, `MemberPageHeader`, `UserProfileMenu` |
| Services | Leitura/escrita Supabase, RPCs, Storage e integrações | `dataService`, `memberProfileService`, `forumService`, `notification*Service` |
| Utils/modelos | Transformações e cálculos puros | `relationshipDegree`, `familyDates`, `buildPersonTimeline`, `buildMobileFamilyTreeModel` |
| Layouts da árvore | Cálculo de nós, colunas, escopo e posicionamento | `directFamilyDistributedLayout`, `genealogyColumnsLayout`, `filterPersonalTreeScope` |
| Migrations | Schema, RLS, functions SQL e seeds controlados | `supabase/migrations/*.sql` |
| Edge Functions | Execução server-side com secrets | notificações, Google Calendar, insights |

---

## 4. Autenticação, rotas e guards

A autenticação é centralizada em `AuthContext` com Supabase Auth.

Guards atuais:

| Guard | Arquivo | Uso |
|---|---|---|
| `TreeAccessRoute` | `src/app/components/TreeAccessRoute.tsx` | `/`, `/minha-arvore`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/genealogia`, `/visao-completa`, `/busca` |
| `MemberRoute` | `src/app/components/MemberRoute.tsx` | páginas de usuário autenticado, fórum, notificações, calendário, favoritos e perfis |
| `ProtectedRoute` | `src/app/components/ProtectedRoute.tsx` | rotas administrativas |

Regras consolidadas:

- `MemberRoute` exige usuário autenticado.
- `TreeAccessRoute` exige sessão recente e vínculo resolvido com pessoa da árvore.
- `ProtectedRoute` consulta `permissionService.isAdminUser`, que usa RPC `is_admin_user`.
- Usuário comum não deve acessar `/admin/*`.
- UI escondida não substitui RLS/RPC segura.
- `/` redireciona para `/mapa-familiar` preservando search params.
- `/mapa-familiar` e `/mapa-familiar-horizontal` são views protegidas da árvore, não páginas internas comuns.

---

## 5. Home pós-login e views da árvore

A Home pós-login é o shell das views principais da árvore:

```txt
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
```

O contrato técnico de `TreeViewMode` é:

```ts
'minha-arvore'
'mapa-familiar'
'mapa-familiar-horizontal'
'genealogia'
'visao-completa'
```

Regras:

- `Home.tsx` deriva `treeViewMode` da URL.
- `treeViewMode.ts` centraliza mapeamento view/path e define `/` como `mapa-familiar`.
- `HomeTreeSection.tsx` decide a renderização principal da área da árvore.
- `FamilyTree.tsx` renderiza React Flow, layouts, viewport, pan/zoom e exportação nas views ReactFlow.
- `/minha-arvore` usa layout direto da pessoa central no desktop/tablet e `MobileFamilyTreeView` no mobile.
- `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile.
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` também no mobile, com barra mobile própria renderizada em `HomeMobileNav`.
- `/genealogia` usa layout por gerações com escopo pessoal.
- `/visao-completa` usa layout por gerações com base completa.
- Paletas visuais são aplicadas por CSS variables e `localStorage`; não usam Supabase.
- Ajuste visual da árvore não deve criar migration.

### 5.1 Mapa Familiar Vertical

`/mapa-familiar` é a view visual vertical da família direta.

Características:

- componente principal: `DesktopFamilyMapView.tsx`;
- cards compartilhados: `FamilyTreeVisualCards.tsx`;
- modelo de dados base: `buildMobileFamilyTreeModel`;
- composição visual: HTML/CSS/SVG;
- configuração de layout: `FAMILY_MAP_LAYOUT`;
- conectores principais por âncoras;
- conectores internos entre cônjuges;
- zoom manual por `Ctrl + scroll`;
- fallback mobile: `MobileFamilyTreeView`;
- painel desktop: grupos diretos, filtros de vida, cores, exportação e destaque.

### 5.2 Mapa Familiar Horizontal

`/mapa-familiar-horizontal` é a view visual horizontal da família por gerações.

Características:

- componente principal: `DesktopFamilyHorizontalMapView.tsx`;
- cards compartilhados: `VisualPersonCard`;
- composição visual: HTML/CSS/SVG;
- colunas por `pessoas.manual_generation`, com fallback por inferência de relacionamento;
- gerações limitadas de 1 a 6;
- colunas vazias ocultadas;
- ordenação baseada em referência de `genealogyColumnsLayout`;
- filhos do mesmo casal ordenados por nascimento;
- cônjuges da mesma geração ficam em linhas adjacentes;
- conectores SVG próprios:
  - linha vertical entre cônjuges;
  - saída horizontal do casal até o gap;
  - tronco vertical no gap;
  - ramais para filhos;
  - distribuição de troncos no eixo X quando há múltiplos casais no mesmo gap;
- exportação por captura da superfície HTML/CSS/SVG;
- mobile usa a mesma view horizontal com barra visual `Paterno | Central | Materno` ainda sem comportamento funcional definido.

### 5.3 Paletas da árvore

Paletas atuais:

| Chave | Nome exibido | Observação |
|---|---|---|
| `white` | Branca/Padrão | Paleta clara |
| `visual` | Azul/Visual | Paleta ciano/azul |
| `orange` | Laranja | Paleta quente |
| `brown` | Marrom | Paleta editorial/premium |

Regras:

- paleta altera CSS variables no `document.documentElement`;
- paleta persiste em `localStorage`;
- paleta não altera rota, filtros, dados, Supabase ou permissões;
- views do Mapa Familiar devem respeitar a mesma escolha de paleta.

---

## 6. Painel lateral e painel mobile

### 6.1 Desktop

O painel desktop é composto em `SidebarPanelTabs.tsx`.

Na área de views, o painel exibe:

| Botão | `TreeViewMode` | Rota |
|---|---|---|
| Vertical | `mapa-familiar` | `/mapa-familiar` |
| Horizontal | `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Outras views podem permanecer acessíveis por rota/menu mobile, mas o painel desktop do Mapa Familiar privilegia Vertical/Horizontal.

O painel também concentra:

- Cores;
- Exportar;
- Destacar;
- Grupos;
- Filtros de vida.

### 6.2 Mobile

No mobile:

- `/mapa-familiar` usa `MobileFamilyTreeView`, que contém a barra nativa `Paterno | Central | Materno`.
- `/mapa-familiar-horizontal` renderiza uma barra visual equivalente em `HomeMobileNav`.
- O botão de controle mobile é renderizado em `HomeMobileNav` para `/mapa-familiar` e `/mapa-familiar-horizontal`.
- O botão abre o painel inferior baseado no mesmo conteúdo funcional do painel desktop.
- `MobileTreeControlsPortal` não deve renderizar painel nessas duas rotas para evitar duplicidade.

---

## 7. Exportação

Fluxos atuais:

| View | Captura |
|---|---|
| `/minha-arvore` | ReactFlow / área selecionada |
| `/genealogia` | ReactFlow / área selecionada |
| `/visao-completa` | ReactFlow / área selecionada |
| `/mapa-familiar` | superfície HTML/CSS/SVG de `DesktopFamilyMapView` |
| `/mapa-familiar-horizontal` | superfície HTML/CSS/SVG de `DesktopFamilyHorizontalMapView` |

Regras:

- `treeExport.ts` é o fluxo canônico;
- `html2canvas` deve manter `useCORS: true` e `allowTaint: false`;
- elementos de UI devem ser ignorados quando marcados para exportação;
- Mapa Familiar exporta a superfície atual, não a árvore completa server-side;
- PDF multipágina e exportação vetorial continuam fora do escopo atual.

---

## 8. Banco e dados

Tabelas/colunas relevantes para a árvore:

| Campo | Uso |
|---|---|
| `pessoas.id` | identidade da pessoa |
| `pessoas.nome_completo` | rótulo do card |
| `pessoas.data_nascimento` | ordenação/linhas vitais |
| `pessoas.data_falecimento` | status/linhas vitais |
| `pessoas.humano_ou_pet` | diferencia humano/pet |
| `pessoas.genero` | avatar visual quando não há foto |
| `pessoas.manual_generation` | geração manual usada pela horizontal e por layouts genealógicos |
| `relacionamentos.tipo_relacionamento` | filiação, cônjuge e relações diretas |
| `relacionamentos.pessoa_origem_id` / `pessoa_destino_id` | direção do relacionamento |

Regras:

- `manual_generation` é fonte primária da coluna da horizontal quando válido.
- Fallback de geração é visual/em memória.
- A view horizontal não persiste inferências em Supabase.
- Mudança de regra de dados deve ser feita em service/layout, não em JSX solto.
- A direção dos relacionamentos deve ser tratada explicitamente para `pai`, `mae`, `filho`, `filiacao_sangue` e `filiacao_adotiva`.

---

## 9. Anti-regressões arquiteturais

Não fazer:

- reintroduzir `/mapa-horizontal` ou `/visao-completa-teste` sem decisão explícita;
- apontar o botão **Horizontal** para `/visao-completa`;
- usar `/visao-completa` como substituto funcional do Mapa Familiar Horizontal;
- mover `DesktopFamilyMapView` ou `DesktopFamilyHorizontalMapView` para dentro de `FamilyTree.tsx`;
- misturar conectores ReactFlow com conectores SVG das views visuais;
- corrigir posicionamento da árvore com transformações globais em `.react-flow__viewport`;
- usar filtro de linhas para esconder cards;
- usar filtro de cards para alterar relacionamentos reais;
- persistir inferência visual de geração no banco;
- ocultar cônjuge principal ou cônjuges ancestrais por filtro **Cônjuges**;
- renderizar dois painéis mobile simultâneos.

---

## 10. QA mínimo por alteração

Após mudanças em árvore, rotas, painel ou mobile, validar:

```bash
npm run build
git diff --check
```

QA visual mínimo:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore
/genealogia
/visao-completa
```

Breakpoints recomendados:

```txt
320px
375px
390px
430px
768px
1366x768
1440x900
1920x1080
```

Checklist específico:

- `/` redireciona para `/mapa-familiar`;
- Vertical abre `/mapa-familiar`;
- Horizontal abre `/mapa-familiar-horizontal`;
- colunas vazias somem na horizontal;
- conectores casal → filhos aparecem quando há filhos visíveis;
- cônjuges colaterais obedecem ao filtro **Cônjuges**;
- botão **Pets** deve ser testado porque há pendência documentada no filtro de grupo;
- mobile não mostra toggle Vertical/Horizontal;
- mobile mantém botão de controle alinhado à barra superior;
- `/genealogia` e `/visao-completa` preservam cabeçalhos de geração em pílula escura.
