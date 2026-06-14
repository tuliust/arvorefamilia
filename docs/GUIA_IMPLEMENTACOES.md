# Guia de implementações - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico alinhado à baseline atual da `main`, com duas views oficiais da árvore: `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 1. Objetivo

Este documento registra o que está implementado no projeto **Árvore Família** e quais comportamentos devem ser considerados vigentes.

Ele deve ser usado para:

- entender o estado atual do produto;
- evitar restauração acidental de rotas e padrões removidos;
- localizar os arquivos responsáveis por cada frente;
- orientar manutenção sem transformar histórico em regra ativa;
- distinguir implementação vigente, legado técnico e backlog.

Este guia não substitui:

| Tema | Documento |
|---|---|
| Baseline atual | `docs/BASELINE_PRODUTO_ATUAL.md` |
| Inventário técnico | `docs/INVENTARIO_TECNICO.md` |
| Decisões de arquitetura | `docs/DECISOES_ARQUITETURAIS.md` |
| Regras de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Arquitetura | `docs/arquitetura/ARCHITECTURE.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX e layout | `docs/GUIA_UX_LAYOUT.md` |
| Correção de erros | `docs/GUIA_CORRECAO_ERROS.md` |
| Funcionalidades | `docs/funcionalidades/*.md` |

---

## 2. Baseline funcional atual

A baseline vigente da árvore é:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

Comportamento:

- `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- `/mapa-familiar` é a view principal/default;
- `/mapa-familiar-horizontal` é a alternativa horizontal/genealógica;
- `TreeViewMode` possui apenas:
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`.

Rotas removidas do produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa rota é uma página de edição de membro e não deve ser confundida com a antiga view `/minha-arvore`.

---

## 3. Estado consolidado do MVP

| Frente | Estado atual | Observação de manutenção |
|---|---|---|
| Rotas da árvore | Implementadas | Apenas `/mapa-familiar` e `/mapa-familiar-horizontal` são views ativas. |
| Redirect raiz | Implementado | `/` redireciona para `/mapa-familiar` preservando query string. |
| Guards | Implementados | Árvore usa `TreeAccessRoute`; membro usa `MemberRoute`; admin usa `ProtectedRoute`. |
| Shell da árvore | Implementado | `Home` é o shell das duas views oficiais. |
| Mapa Familiar | Implementado | Desktop/tablet usa `DesktopFamilyMapView`; mobile usa `MobileFamilyTreeView`. |
| Mapa Familiar Horizontal | Implementado | Desktop/tablet usa `DesktopFamilyHorizontalMapView`; mobile usa `MobileFamilyHorizontalMapView`. |
| Favoritos de páginas | Implementados | `FAVORITE_PAGES` inclui `/mapa-familiar` e `/mapa-familiar-horizontal`. |
| Busca global | Implementada | `GLOBAL_SEARCH_PAGES` inclui as duas views oficiais. |
| Retorno de perfil | Implementado | `?voltar=` deve aceitar `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`. |
| Painel desktop/mobile | Implementado, com dívida conhecida | Ainda possui abas `Filtros`, `Legendas` e `Ações`. Próxima frente deve simplificar. |
| Exportação | Implementada | Área, Imagem, PDF e Imprimir nas views oficiais. |
| Paletas | Implementadas | `white`, `visual`, `orange`, `brown`. |
| Destaques | Implementados | `Linhas`, `Cards`, `Grupos`. |
| Perfil de pessoa | Implementado | Perfil autenticado, dados, arquivos, eventos e favoritos. |
| Admin | Implementado | Pessoas, relacionamentos, importação, integridade, notificações e solicitações. |
| Fórum | Implementado | Categorias, tópicos, respostas, reações, favoritos e notificações. |
| Calendário | Implementado | Datas familiares e integração Google Calendar quando configurada. |
| Notificações | Implementadas | Central, preferências, dispatch interno/e-mail conforme configuração. |
| Testes | Implementados parcialmente | Vitest e Playwright existem; E2E deve seguir a baseline atual. |

---

## 4. Rotas, acesso e guards

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/TreeAccessRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/contexts/AuthContext.tsx
src/app/services/permissionService.ts
```

Contrato atual:

| Rota | Guard | Status |
|---|---|---|
| `/` | `TreeAccessRoute` | redireciona para `/mapa-familiar` |
| `/mapa-familiar` | `TreeAccessRoute` | view oficial principal |
| `/mapa-familiar-horizontal` | `TreeAccessRoute` | view oficial horizontal |
| `/busca` | `TreeAccessRoute` | busca global autenticada |
| `/minha-arvore/editar` | `MemberRoute` | edição do membro; preservar |
| `/pessoa/:id` | `MemberRoute` | perfil de pessoa |
| `/pessoas/:id` | `MemberRoute` | alias vigente; documentar |
| `/meus-dados`, `/meus-vinculos`, `/vincular-perfil` | `MemberRoute` | área de membro |
| `/forum/*` | `MemberRoute` | fórum |
| `/admin/*` | `ProtectedRoute` | administração |

Não reintroduzir como view ativa:

```txt
/minha-arvore
/genealogia
/visao-completa
```

---

## 5. Shell da Home e renderização da árvore

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
```

Matriz de renderização vigente:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Regras:

- a troca Vertical/Horizontal deve preservar `location.search`;
- `?pessoa=...` não pode ser perdido;
- a horizontal mobile não usa barra `Paterno | Central | Materno`;
- a horizontal mobile navega por gerações dentro de `MobileFamilyHorizontalMapView`;
- as rotas antigas não devem ser usadas como fallback visual.

---

## 6. Painel, filtros e controles

Estado atual:

- o painel ainda contém abas `Filtros`, `Legendas` e `Ações`;
- a próxima frente deve remover essa barra de abas;
- filtros/grupos devem ficar visíveis diretamente;
- `Legendas` e `Ações` devem ser ocultadas/removidas se não forem mais parte da experiência;
- os controles superiores devem permanecer.

Controles que devem continuar funcionando:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
```

Arquivos envolvidos:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
```

---

## 7. Mapa Familiar

Documento específico:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Resumo:

- `/mapa-familiar` é a experiência principal;
- desktop/tablet usa HTML/CSS/SVG próprio;
- mobile usa `MobileFamilyTreeView`;
- grupos diretos são controlados por `directRelativeFilters`;
- pets e cônjuges possuem regras específicas;
- conectores SVG não criam dados;
- destaque de grupos oculta chrome visual, não pessoas.

---

## 8. Mapa Familiar Horizontal

Resumo:

- `/mapa-familiar-horizontal` é view oficial;
- desktop/tablet usa colunas por geração;
- mobile usa uma geração por tela;
- `manual_generation` é referência primária quando disponível;
- `genealogyColumnsLayout` pode ser usado como referência técnica, mas a rota não é `/genealogia`;
- título visual/exportável pode usar `Genealogia de {primeiroNome}` sem reintroduzir a rota `/genealogia`.

---

## 9. Exportação

Documento específico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Implementado:

- `Área`;
- `Imagem`;
- `PDF`;
- `Imprimir`;
- loading de exportação;
- título no canvas;
- captura de raízes HTML/CSS/SVG;
- exclusão de painel, header, bottom nav, overlays e loading.

Regras:

- qualquer alteração no painel deve preservar o disparo das ações de exportação;
- `treeExport.ts` é crítico e não deve ser alterado sem teste manual em desktop e mobile;
- compatibilidades com ReactFlow não significam que rotas antigas estejam ativas.

---

## 10. Favoritos e busca global

Documentos específicos:

```txt
docs/funcionalidades/FAVORITOS.md
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
```

Estado atual:

- `/mapa-familiar` está em favoritos e busca global;
- `/mapa-familiar-horizontal` está em favoritos e busca global;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não devem voltar aos catálogos ativos;
- favoritos de página salvam rota canônica, não zoom/filtros/search params da sessão.

---

## 11. Legado ativo e cuidado técnico

Ainda exigem cuidado:

| Item | Motivo |
|---|---|
| `FamilyTree.tsx` | não renderiza views oficiais, mas ainda pode fornecer contratos como `FamilyTreeActions`. |
| `directFamilyDistributedLayout.ts` | helper usado por views atuais. |
| `genealogyColumnsLayout.ts` | dependência técnica da horizontal. |
| `ReactFlow` | ainda pode existir como dependência técnica de tipos/layouts legados. |
| CSS com nomes antigos | pode conter regras compartilhadas; remover só após QA visual. |
| `/minha-arvore/editar` | rota vigente de edição; preservar. |

---

## 12. Validações obrigatórias

Antes de fechar alteração relevante:

```bash
git status --short
npm run build
npm test
npm run test:e2e
git diff --check
```

Buscas recomendadas:

```bash
rg "/minha-arvore|/genealogia|/visao-completa"
rg "minha-arvore|genealogia|visao-completa"
rg "TreeViewMode"
rg "Filtros|Legendas|Ações"
```

Critério:

- `/minha-arvore/editar` pode aparecer;
- `docs/historico/` pode conter histórico;
- a palavra “genealogia” pode aparecer como conceito, mas não como rota ativa;
- rotas antigas não podem aparecer em navegação, favoritos, busca global ou docs canônicos como produto ativo.

---

## 13. Próximas frentes recomendadas

1. Simplificar painel `Filtros | Legendas | Ações`.
2. Extrair contratos atuais de arquivos legados.
3. Remover componentes órfãos com confirmação de imports.
4. Limpar CSS exclusivo de views antigas.
5. Arquivar docs de views removidas.
6. Auditar dependências e UI scaffolding.
7. Criar CI com build, testes, diff check e E2E smoke.

---

## 14. Anti-regressões

Não reintroduzir:

```txt
/minha-arvore
/genealogia
/visao-completa
```

como views ativas.

Não substituir:

```txt
/mapa-familiar-horizontal
```

por:

```txt
/genealogia
/visao-completa
```

Não remover:

```txt
/minha-arvore/editar
```

sem decisão específica de produto.
