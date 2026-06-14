# Arquitetura atual - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/arquitetura/ARCHITECTURE.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado contra a estrutura atual do repositório, com rotas oficiais da árvore, shell compartilhado da Home, Mapa Familiar Vertical/Horizontal, painel desktop/mobile, exportação com título/loading/SVGs e remoção de rotas experimentais.

---

## 1. Objetivo

Este documento registra a visão técnica de alto nível do projeto **Árvore Família**: stack, organização de código, camadas, fluxo de dados, rotas, banco, Edge Functions, views da árvore, exportação e regras estruturais que não devem ser alteradas sem revisão.

Use este arquivo para entender a arquitetura geral. Para detalhes específicos, consulte:

| Tema | Documento |
|---|---|
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Estrutura de usuários/banco | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Migrations/Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| Implementações consolidadas | `docs/GUIA_IMPLEMENTACOES.md` |
| UX e layout | `docs/GUIA_UX_LAYOUT.md` |
| Mapa Familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Painel, legendas e conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Pendências reais | `docs/PLANO_PROXIMOS_PASSOS.md` |

---

## 2. Stack atual

| Camada | Tecnologia / recurso |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Roteamento | React Router 7 com `createBrowserRouter` |
| UI | Tailwind CSS v4, CSS complementar em `src/styles`, componentes locais, `lucide-react` |
| Árvore ReactFlow | React Flow, Dagre e layouts próprios em `components/FamilyTree` |
| Mapa Familiar | HTML/CSS/SVG próprio em `DesktopFamilyMapView` e `DesktopFamilyHorizontalMapView` |
| Banco/Auth | Supabase Auth, Supabase Postgres, RLS, RPCs e Storage |
| Edge/serverless | Supabase Edge Functions |
| Exportação | `html2canvas`, `jspdf`, utilitários em `treeExport.ts` |
| Testes | Vitest e Playwright |
| Integrações | Google Places/Maps, Google Calendar, Resend/OpenAI server-side quando configurados |

Regras estruturais:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são históricos, diagnósticos ou operacionais.
- Ajustes visuais, views de apresentação, paletas, exportação e CSS não exigem migration.
- Mudança de schema exige migration versionada.
- Secrets não devem ir para frontend, repositório, dumps versionados ou documentação pública.
- Views visuais da árvore não devem alterar relacionamentos reais.

---

## 3. Estrutura de código

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
  constants/              Constantes de navegação/favoritos
  lib/                    Cliente Supabase
  pages/                  Páginas públicas, membro, fórum e admin
  pages/home/             Subcomponentes da Home pós-login
  services/               Acesso a dados, Supabase e regras de aplicação
  types/                  Contratos TypeScript
  utils/                  Funções puras e helpers
  routes.tsx              Definição de rotas e guards

src/styles/
  family-map-qa.css
  family-map-horizontal.css
  home-sidebar-unified.css
  mobile-tree-controls.css
  ...
```

Arquivos centrais da árvore:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Regra de separação:

| Camada | Responsabilidade |
|---|---|
| Pages | Orquestração de tela, estado local e composição |
| Components | UI, interação visual e componentes reutilizáveis |
| Services | Supabase, RPCs, Storage e integrações |
| Utils/modelos | Transformações e cálculos puros |
| Layouts da árvore | Cálculo de nós, colunas, escopo e posicionamento |
| Migrations | Schema, RLS, functions SQL e seeds controlados |
| Edge Functions | Execução server-side com secrets |

---

## 4. Autenticação, rotas e guards

A autenticação é centralizada em `AuthContext` com Supabase Auth.

Guards atuais:

| Guard | Arquivo | Uso |
|---|---|---|
| `TreeAccessRoute` | `src/app/components/TreeAccessRoute.tsx` | `/`, `/minha-arvore`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/genealogia`, `/visao-completa`, `/busca` |
| `MemberRoute` | `src/app/components/MemberRoute.tsx` | páginas de usuário autenticado, fórum, notificações, calendário, favoritos e perfis |
| `ProtectedRoute` | `src/app/components/ProtectedRoute.tsx` | rotas administrativas |

Regras:

- `MemberRoute` exige usuário autenticado.
- `TreeAccessRoute` exige sessão recente e vínculo resolvido com pessoa da árvore.
- `ProtectedRoute` consulta `permissionService.isAdminUser`, que usa RPC `is_admin_user`.
- Usuário comum não deve acessar `/admin/*`.
- UI escondida não substitui RLS/RPC segura.
- A rota `/` redireciona para `/mapa-familiar`, preservando `location.search`.
- `/mapa-familiar` e `/mapa-familiar-horizontal` são views protegidas da árvore, não páginas internas comuns.

---

## 5. Home pós-login e shell das views

A Home pós-login é o shell compartilhado das views principais da árvore:

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

Regras consolidadas:

- `treeViewMode.ts` centraliza `VIEW_MODE_TO_PATH`, `PATH_TO_VIEW_MODE` e fallback para `mapa-familiar`.
- `routes.tsx` usa `TreeHomeShell` para as rotas da árvore e adiciona `data-tree-route-view="mapa-familiar-horizontal"` quando a rota horizontal está ativa.
- `Home.tsx` deriva `treeViewMode` da URL e mantém filtros, pessoa central, painel, paleta e estados de interação.
- `HomeTreeSection.tsx` decide a renderização principal da área da árvore.
- A troca de views preserva search params, especialmente `?pessoa=...`.
- A navegação para perfil usa `?voltar=...` para retornar à view de origem.

Matriz de renderização:

| View | Desktop/tablet | Mobile |
|---|---|---|
| `minha-arvore` | `FamilyTree` / ReactFlow | `MobileFamilyTreeView` |
| `mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `DesktopFamilyHorizontalMapView` |
| `genealogia` | `FamilyTree` / ReactFlow | `FamilyTree` com tabs/chips de geração |
| `visao-completa` | `FamilyTree` / ReactFlow | `FamilyTree` com tabs/chips de geração |

---

## 6. Views da árvore

### 6.1 Minha Árvore

`/minha-arvore` é a view direta da pessoa central.

Desktop/tablet:

- usa `FamilyTree.tsx`;
- renderiza ReactFlow;
- usa `directFamilyDistributedLayout.ts`;
- respeita `edgeFilters`, `visualLineFilters`, `directRelativeFilters` e filtros de vida;
- mantém pan/zoom interno.

Mobile:

- usa `MobileFamilyTreeView.tsx`;
- usa malha 3×3;
- mantém abas **Paterno | Central | Materno**;
- usa conectores HTML/CSS próprios;
- cards exibem anos, não localidade;
- card central não exibe badge **Você**.

### 6.2 Mapa Familiar Vertical

`/mapa-familiar` é a view visual vertical da família direta.

Características:

- componente principal: `DesktopFamilyMapView.tsx`;
- composição visual: HTML/CSS/SVG, sem ReactFlow;
- modelo base: `buildMobileFamilyTreeModel`;
- cards compartilhados: `FamilyTreeVisualCards.tsx`;
- grupos posicionados por configuração de layout;
- conectores SVG por âncoras;
- conectores internos entre cônjuges quando há relação explícita;
- grupos expansíveis;
- modo wide quando o painel lateral é colapsado;
- zoom manual e escala responsiva;
- exportação direta e por área sobre root HTML/CSS/SVG;
- fallback mobile para `MobileFamilyTreeView`.

Regra de cônjuges:

- cônjuge da pessoa central permanece visível quando existir;
- cônjuges de avós, bisavós e tataravós permanecem visíveis;
- cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**.

Destaque de grupos:

- `Destacar > Grupos` oculta molduras/títulos dos grupos;
- também oculta labels diretos `PAI`, `MÃE` e `CÔNJUGE`;
- grupos entram em modo sem chrome;
- conectores usam geometria coerente com a área real dos cards.

### 6.3 Mapa Familiar Horizontal

`/mapa-familiar-horizontal` é a view horizontal por gerações.

Características:

- componente principal: `DesktopFamilyHorizontalMapView.tsx`;
- composição visual: HTML/CSS/SVG, sem ReactFlow;
- usa `pessoas.manual_generation` como fonte primária da coluna;
- valores válidos de geração são 1 a 6;
- valores ausentes/invalidos podem ser inferidos em memória;
- colunas vazias são ocultadas e as demais compactadas;
- usa `genealogyColumnsLayout` como referência de ordenação;
- filhos do mesmo casal são ordenados por nascimento;
- cônjuges da mesma geração ficam adjacentes;
- conectores SVG próprios:
  - linha vertical entre cônjuges;
  - linha horizontal do casal até o gap;
  - tronco vertical no gap;
  - ramais até filhos;
  - troncos distribuídos no eixo X para evitar sobreposição;
- usa a mesma lógica de paletas/cards do Mapa Familiar;
- exporta a superfície HTML/CSS/SVG atual;
- mobile usa a mesma view horizontal, com barra visual `Paterno | Central | Materno` renderizada pela Home.

Destaque de grupos:

- `Destacar > Grupos` oculta os cabeçalhos `Geração X`;
- os cards sobem para ocupar o espaço dos cabeçalhos;
- conectores são recalculados.

### 6.4 Genealogia e Visão Completa

`/genealogia` e `/visao-completa` continuam baseadas em ReactFlow.

- `genealogia` usa escopo pessoal.
- `visao-completa` usa base ampliada/completa.
- Ambas usam `genealogyColumnsLayout`.
- No mobile, chips/tabs de geração são calculados sobre a mesma base inferida repassada ao ReactFlow.
- Cabeçalhos de geração usam pílulas escuras.

---

## 7. Painel desktop e painel mobile

### 7.1 Painel desktop

`SidebarPanelTabs.tsx` concentra os controles superiores:

| Controle | Comportamento |
|---|---|
| Zoom + | `zoom-in` |
| Zoom - | `zoom-out` |
| Restaurar visualização | `restore-view` |
| Vertical | navega para `/mapa-familiar` |
| Horizontal | navega para `/mapa-familiar-horizontal` |
| Cores | paletas `white`, `visual`, `orange`, `brown` |
| Exportar | Área, Imagem, PDF, Imprimir |
| Destacar | Linhas, Cards, Grupos |

Regras:

- `SIDEBAR_TREE_ACTION_EVENT` envia a ação para `HomeTreeSection`.
- `HomeTreeSection` chama a ref imperativa da view ativa.
- `Restaurar visualização` não é zoom-out; ele reseta zoom/scroll/posição conforme a view.
- O painel não entra na exportação.

### 7.2 Painel mobile

No mobile:

- `/mapa-familiar` usa `MobileFamilyTreeView` com toggle nativa **Paterno | Central | Materno**.
- `/mapa-familiar-horizontal` usa a própria view horizontal com barra visual **Paterno | Central | Materno**.
- `HomeMobileNav` renderiza o botão de controle para `/mapa-familiar` e `/mapa-familiar-horizontal`.
- O botão abre painel inferior baseado no mesmo conteúdo funcional do painel desktop.
- `MobileTreeControlsPortal` não renderiza seu painel simplificado nessas duas rotas para evitar duplicidade.

---

## 8. Exportação

Arquivos centrais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

Capacidades atuais:

| Ação | Comportamento |
|---|---|
| Área | seleção retangular sobre a superfície exportável |
| Imagem | PNG da superfície capturável |
| PDF | PDF A4 proporcional |
| Imprimir | janela de impressão com imagem capturada |

Contrato:

- views ReactFlow capturam ReactFlow/root da árvore;
- Mapa Familiar Vertical/Horizontal capturam HTML/CSS/SVG próprio;
- `html2canvas` usa `useCORS: true` e `allowTaint: false`;
- painéis, overlays, menus, loading e legendas marcadas são ignorados;
- loading aparece antes do trabalho pesado;
- PNG/PDF/print aguardam feedback mínimo antes de liberar UI;
- exportação dos mapas adiciona título ao canvas:
  - `Mapa Familiar de {primeiroNome}`;
  - `Genealogia de {primeiroNome}`;
- `printCanvas` é assíncrono e aguarda a imagem carregar antes de disparar `window.print()`;
- SVGs internos dos cards são normalizados/serializados no clone para evitar avatares como quadrados escuros;
- há limite preventivo de pixels.

---

## 9. Paletas e cards visuais

Paletas atuais:

| Chave | Nome exibido | Observação |
|---|---|---|
| `white` | Branca | Paleta clara |
| `visual` | Azul | Paleta ciano/azul |
| `orange` | Laranja | Paleta quente |
| `brown` | Marrom | Paleta editorial/premium |

Regras:

- paleta altera CSS variables no `document.documentElement`;
- paleta persiste em `localStorage`;
- paleta não altera rota, filtros, dados, Supabase ou permissões;
- Mapa Familiar Vertical/Horizontal devem respeitar a mesma paleta.

`FamilyTreeVisualCards.tsx` concentra cards/avatares visuais:

- `VisualPersonCard`;
- `VisualGroup`;
- `VisualPersonAvatar`;
- `VisualVitalLines`;
- classes semânticas de exportação para SVGs:
  - `family-map-avatar-icon`;
  - `family-map-person-silhouette`;
  - `family-map-pet-icon`;
  - `family-map-status-icon`.

---

## 10. Busca global e favoritos

Estado atual do código:

- `GLOBAL_SEARCH_PAGES` contém `/mapa-familiar`, mas ainda não lista `/mapa-familiar-horizontal` como página própria.
- `FAVORITE_PAGES` contém `/mapa-familiar`, mas ainda não lista `/mapa-familiar-horizontal` como página própria.

Decisão de produto pendente:

- definir se `/mapa-familiar-horizontal` deve aparecer como página independente em busca global e favoritos;
- se sim, atualizar `src/app/services/globalSearchService.ts`, `src/app/constants/favoritePages.ts` e documentação de favoritos/busca.

---

## 11. Anti-regressões de arquitetura

Não fazer sem revisão:

- recriar `/mapa-horizontal` ou `/visao-completa-teste`;
- redirecionar o botão **Horizontal** para `/visao-completa`;
- mover Mapa Familiar para dentro de ReactFlow;
- usar `translate/top` negativo em `.react-flow__viewport` para correções visuais;
- reativar `MobileTreeControlsPortal` em `/mapa-familiar` ou `/mapa-familiar-horizontal`;
- fazer exportação dos Mapas Familiares capturar `.react-flow`;
- remover `data-tree-export-ignore`, `data-tree-selection-overlay` ou `data-tree-export-loading`;
- usar `allowTaint: true` sem revisão;
- persistir `manual_generation` inferido automaticamente;
- criar migrations para mudanças puramente visuais;
- esconder rota/admin apenas por UI sem guard/RLS/RPC.
