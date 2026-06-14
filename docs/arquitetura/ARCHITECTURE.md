# Arquitetura atual - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/arquitetura/ARCHITECTURE.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado contra a baseline atual da branch `main`.

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
| Árvore visual oficial | HTML/CSS/SVG próprio em `DesktopFamilyMapView`, `DesktopFamilyHorizontalMapView`, `MobileFamilyTreeView` e `MobileFamilyHorizontalMapView` |
| Legado ativo da árvore | ReactFlow/Dagre ainda presentes em tipos, layouts, helpers e renderer legado não montado |
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
- ReactFlow/Dagre não devem ser removidos sem projeto próprio, porque ainda existem dependências técnicas indiretas.

---

## 3. Estrutura de código

```txt
src/app/
  components/             Componentes reutilizáveis
  components/ui/          Componentes base de UI
  components/layout/      Headers, menu do usuário e containers
  components/FamilyTree/  Views visuais, contratos, layouts, utilitários, exportação e legado ReactFlow
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
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Arquivos de legado ativo que exigem cuidado:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

`FamilyTree.tsx` não é renderer oficial das duas views atuais, mas ainda fornece o contrato `FamilyTreeActions`. Antes de removê-lo, esse tipo deve ser extraído para um arquivo neutro.

---

## 4. Separação de camadas

| Camada | Responsabilidade |
|---|---|
| Pages | Orquestração de tela, estado local e composição |
| Components | UI, interação visual e componentes reutilizáveis |
| Services | Supabase, RPCs, Storage e integrações |
| Utils/modelos | Transformações e cálculos puros |
| Layouts da árvore | Cálculo de nós, colunas, escopo e posicionamento |
| Migrations | Schema, RLS, functions SQL e seeds controlados |
| Edge Functions | Execução server-side com secrets |

Dívida técnica atual:

- `Home.tsx` concentra carregamento da árvore, pessoa central, filtros, navegação, painel, modais e exportação;
- parte do estado de filtros genealógicos permanece atravessando a Home mesmo após a remoção das rotas antigas;
- `FamilyTreeActions` reside em arquivo legado;
- CSS mistura regras vigentes, aliases antigos e restos de ReactFlow;
- documentação histórica e canônica ainda precisa permanecer sincronizada com a baseline.

---

## 5. Autenticação, rotas e guards

A autenticação é centralizada em `AuthContext` com Supabase Auth.

Guards atuais:

| Guard | Arquivo | Uso |
|---|---|---|
| `TreeAccessRoute` | `src/app/components/TreeAccessRoute.tsx` | `/`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/busca` |
| `MemberRoute` | `src/app/components/MemberRoute.tsx` | páginas de usuário autenticado, fórum, notificações, calendário, favoritos e perfis |
| `ProtectedRoute` | `src/app/components/ProtectedRoute.tsx` | rotas administrativas |

Regras:

- `MemberRoute` exige usuário autenticado.
- `TreeAccessRoute` exige sessão recente e vínculo resolvido com pessoa da árvore.
- `ProtectedRoute` consulta `permissionService.isAdminUser`, que usa a regra administrativa vigente.
- Usuário comum não deve acessar `/admin/*`.
- UI escondida não substitui RLS/RPC segura.
- A rota `/` redireciona para `/mapa-familiar`, preservando `location.search`.
- `/mapa-familiar` e `/mapa-familiar-horizontal` são views protegidas da árvore, não páginas internas comuns.

---

## 6. Home pós-login e shell das views

A Home pós-login é o shell compartilhado das duas views principais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

O contrato técnico de `TreeViewMode` é:

```ts
'mapa-familiar'
'mapa-familiar-horizontal'
```

Regras consolidadas:

- `treeViewMode.ts` centraliza `VIEW_MODE_TO_PATH`, `PATH_TO_VIEW_MODE` e fallback para `mapa-familiar`;
- `routes.tsx` usa `TreeHomeShell` para as rotas da árvore;
- `TreeHomeShell` adiciona `data-tree-route-view="mapa-familiar-horizontal"` quando a rota horizontal está ativa;
- `Home.tsx` deriva `treeViewMode` da URL e mantém filtros, pessoa central, painel, paleta e estados de interação;
- `HomeTreeSection.tsx` decide a renderização principal da área da árvore;
- a troca de views preserva search params, especialmente `?pessoa=...`;
- a navegação para perfil usa `?voltar=...` para retornar à view de origem.

Matriz de renderização:

| View | Desktop/tablet | Mobile |
|---|---|---|
| `mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Rotas antigas removidas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção:

```txt
/minha-arvore/editar
```

Essa rota pertence ao fluxo de edição do membro e continua vigente.

---

## 7. Views da árvore

### 7.1 Mapa Familiar

`/mapa-familiar` é a view principal/default da árvore.

Características:

- componente desktop/tablet: `DesktopFamilyMapView.tsx`;
- componente mobile: `MobileFamilyTreeView.tsx`;
- composição visual: HTML/CSS/SVG;
- modelo base: `buildMobileFamilyTreeModel`;
- cards compartilhados: `FamilyTreeVisualCards.tsx`;
- grupos posicionados por configuração de layout;
- conectores SVG por âncoras;
- conectores internos entre cônjuges quando há relação explícita;
- grupos expansíveis;
- modo wide quando o painel lateral é colapsado;
- zoom manual e escala responsiva;
- exportação direta e por área sobre root HTML/CSS/SVG.

Regra de cônjuges:

- cônjuge da pessoa central permanece visível quando existir;
- cônjuges de avós, bisavós e tataravós permanecem visíveis;
- cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**.

Destaque de grupos:

- `Destacar > Grupos` oculta molduras/títulos dos grupos;
- também oculta labels diretos `PAI`, `MÃE` e `CÔNJUGE`;
- grupos entram em modo sem chrome;
- conectores usam geometria coerente com a área real dos cards.

### 7.2 Mapa Familiar Horizontal

`/mapa-familiar-horizontal` é a view horizontal por gerações.

Características:

- componente desktop/tablet: `DesktopFamilyHorizontalMapView.tsx`;
- componente mobile: `MobileFamilyHorizontalMapView.tsx`;
- composição visual: HTML/CSS/SVG;
- usa `pessoas.manual_generation` como fonte primária da coluna;
- valores válidos de geração são 1 a 6;
- valores ausentes/inválidos podem ser inferidos em memória;
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
- exporta a superfície HTML/CSS/SVG atual.

Contrato mobile:

```txt
1 geração = 1 tela
swipe lateral = troca de geração
scroll vertical = rolagem interna da geração ativa
chips G1/G2/G3... = atalho de navegação entre gerações ativas
```

Anti-regressões:

- não reintroduzir a barra `Paterno | Central | Materno` em `/mapa-familiar-horizontal`;
- não usar `/visao-completa` como substituto da horizontal;
- não aplicar CSS ReactFlow na horizontal mobile;
- não capturar header, bottom nav ou modal no fluxo de exportação.

---

## 8. Painel desktop e mobile

O estado atual do painel ainda usa `SidebarPanelTabs.tsx`.

Controles vigentes:

- Zoom +;
- Zoom -;
- Restaurar visualização;
- Vertical;
- Horizontal;
- Cores;
- Exportar;
- Destacar;
- Filtros;
- Legendas;
- Ações.

Dívida técnica planejada:

- remover a barra `Filtros | Legendas | Ações`;
- manter filtros/grupos visíveis diretamente;
- remover/ocultar Legendas e Ações;
- preservar Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar e Destacar;
- garantir que o painel mobile continue abrindo como modal quando aplicável.

Arquivos envolvidos:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
```

---

## 9. Exportação

Documento canônico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Arquivos centrais:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Contrato:

- exportar a superfície capturável da view ativa ou área selecionada;
- não incluir painel, header, bottom nav, overlays ou controles;
- preservar paleta, filtros, zoom/escala, grupos visíveis, conectores, avatares e título;
- suportar PNG, PDF, impressão e seleção por área.

---

## 10. Favoritos e busca global

Arquivos:

```txt
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
```

Estado atual:

- `/mapa-familiar` está em favoritos e busca global;
- `/mapa-familiar-horizontal` está em favoritos e busca global;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não devem aparecer em navegação ativa, favoritos ou busca global;
- favoritos de página apontam para a rota canônica, não para estado de zoom/filtros.

---

## 11. Dados, services e cache

Services críticos:

| Arquivo | Função |
|---|---|
| `dataService.ts` | CRUD central de pessoas e relacionamentos. |
| `memberProfileService.ts` | Vínculo usuário-pessoa. |
| `treeDataCache.ts` | Cache/invalidação da árvore. |
| `favoritesService.ts` | Favoritos. |
| `notification*` | Notificações. |
| `treeExport.ts` | Exportação. |
| `treePreferences.ts` | Preferências e migração de chaves antigas. |

Dívidas:

- `dataService.ts` é amplo e deve ser dividido por domínio futuramente;
- `relationshipResolverService.ts` foi identificado como candidato a remoção se continuar sem consumidores;
- `treePreferences.ts` deve documentar chaves e prazo de compatibilidade;
- `userEngagementService.ts` deve ser revisado como compatibilidade local/legado ativo.

---

## 12. CSS e estilos

CSS vigente e/ou compartilhado:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-tree-mobile.css
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
```

Cuidados:

- `mobile-edit-profile.css` pertence a `/minha-arvore/editar` e deve ser preservado;
- CSS com nomes antigos pode conter regras compartilhadas;
- não remover seletores por nome sem confirmar uso real;
- aliases antigos, como `data-tree-route-view="mapa-horizontal"`, devem ser removidos só após QA visual;
- regras `data-export-view` de views antigas devem ser tratadas no mesmo lote do renderer legado.

---

## 13. Testes e validações

Scripts disponíveis:

```bash
npm run build
npm test
npm run test:e2e
npm run test:e2e:ui
```

Não há script separado de lint ou typecheck no `package.json` atual.

Checklist mínimo:

```bash
git status --short
npm run build
npm test
npm run test:e2e
git diff --check
```

Fluxos manuais críticos:

- `/` redireciona para `/mapa-familiar`;
- visitante sem sessão em `/mapa-familiar` vai para `/entrar`;
- visitante sem sessão em `/mapa-familiar-horizontal` vai para `/entrar`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` retornam 404;
- `/minha-arvore/editar` continua protegida;
- alternância vertical/horizontal preserva search params;
- perfil de pessoa volta para a view de origem;
- favoritos e busca global exibem as duas views oficiais;
- exportação funciona nas duas views oficiais.

---

## 14. Regras de não regressão

Não reintroduzir:

```txt
/minha-arvore
/genealogia
/visao-completa
```

como rotas de views ativas.

Não remover sem projeto próprio:

```txt
FamilyTree.tsx
ReactFlow
Dagre
directFamilyDistributedLayout.ts
genealogyColumnsLayout.ts
treeExport.ts
treePreferences.ts
```

Não confundir:

```txt
/minha-arvore
```

rota removida de view, com:

```txt
/minha-arvore/editar
```

rota vigente de edição.

Toda mudança na árvore deve revisar:

```txt
routes.tsx
treeViewMode.ts
Home.tsx
HomeTreeSection.tsx
SidebarPanelTabs.tsx
favoritePages.ts
globalSearchService.ts
PersonProfile.tsx
docs/arquitetura/ROTAS_E_GUARDS.md
```
