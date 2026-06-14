# Documentação - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/README.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: índice canônico revisado contra a estrutura atual do repositório, incluindo `MobileFamilyHorizontalMapView`, modal mobile de controles, Mapa Familiar Horizontal mobile por geração, exportação e pendências documentais remanescentes.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar guias específicos. A documentação deve registrar apenas comportamento implementado ou pendências explicitamente classificadas como backlog/QA. Conteúdo histórico não substitui os guias canônicos atuais.

---

## 1. Estado atual consolidado

A revisão mais recente registra:

- `/entrar` funciona como home pública, login, primeiro acesso e aceite legal;
- a rota raiz `/` redireciona para `/mapa-familiar`, preservando search params;
- as views principais da árvore são:
  - **Minha Árvore** — `/minha-arvore`;
  - **Mapa Familiar Vertical** — `/mapa-familiar`;
  - **Mapa Familiar Horizontal** — `/mapa-familiar-horizontal`;
  - **Genealogia** — `/genealogia`;
  - **Visão Completa** — `/visao-completa`;
- as rotas experimentais `/mapa-horizontal` e `/visao-completa-teste` foram removidas;
- `TreeViewMode` possui exatamente:
  - `minha-arvore`;
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`;
  - `genealogia`;
  - `visao-completa`;
- `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile;
- `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile;
- o painel desktop exibe botões **Vertical** e **Horizontal**:
  - **Vertical** → `/mapa-familiar`;
  - **Horizontal** → `/mapa-familiar-horizontal`;
- `HomeMobileNav` controla o botão de painel mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- o painel mobile dos mapas é um modal de controles acima do header, bottom nav e botões flutuantes, com overlay, scroll interno e fechamento por `Escape`;
- `MobileTreeControlsPortal` não renderiza seu painel antigo nessas duas rotas;
- `/mapa-familiar-horizontal` organiza cards por `pessoas.manual_generation`, limitado de 1 a 6, com fallback por inferência;
- no mobile, `/mapa-familiar-horizontal` exibe uma geração por tela, com chips `G1`, `G2`, `G3` etc. e swipe lateral entre gerações;
- colunas vazias em `/mapa-familiar-horizontal` são ocultadas e as demais colunas são compactadas;
- cônjuges da pessoa central e cônjuges de avós, bisavós e tataravós permanecem visíveis quando existirem;
- cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**;
- filhos de um casal em `/mapa-familiar-horizontal` são ordenados do mais velho para o mais novo;
- conectores de `/mapa-familiar-horizontal` são SVG próprios;
- `/visao-completa` continua como view própria baseada em ReactFlow/genealogy layout;
- cabeçalhos `GERAÇÃO N` em Genealogia/Visão Completa usam pílula escura;
- exportação de `/mapa-familiar` e `/mapa-familiar-horizontal` foi corrigida tecnicamente:
  - **Área** abre seleção manual retangular;
  - **Imagem** exporta PNG;
  - **PDF** exporta em A4 proporcional;
  - **Imprimir** abre fluxo de impressão;
  - há loading contextual;
  - o título entra no canvas exportado;
  - painel, header, bottom nav, overlay e loading são ignorados na captura;
  - SVGs de avatares/status são tratados para evitar renderização como quadrados escuros;
- `Destacar > Grupos` no Mapa Familiar Vertical oculta molduras/títulos de grupos e labels `PAI`, `MÃE`, `CÔNJUGE`;
- `Destacar > Grupos` no Mapa Familiar Horizontal oculta cabeçalhos de geração e recalcula cards/conectores;
- `Destacar > Linhas` oculta conectores visuais;
- `Restaurar visualização` reseta posição/zoom da view ativa;
- paletas `white`, `visual`, `orange` e `brown` são aplicadas via CSS variables e `localStorage`;
- `/mapa-familiar` está em busca global e favoritos;
- `/mapa-familiar-horizontal` ainda precisa de decisão para entrar como página própria em busca/favoritos.

---

## 2. Regras de uso da documentação

Regras gerais:

- arquivos na raiz de `docs/` são guias canônicos gerais;
- arquivos em `docs/funcionalidades/` são guias canônicos de comportamento funcional específico;
- arquivos em `docs/arquitetura/` são guias canônicos de rotas, guards, arquitetura e modelo de usuários/dados;
- arquivos em `docs/operacao/` são procedimentos operacionais e de manutenção;
- arquivos em `docs/comandos/` são checklists/comandos auxiliares;
- `docs/historico/README.md` é o resumo histórico consolidado;
- pendências reais, bugs prováveis e decisões futuras devem ficar em `PLANO_PROXIMOS_PASSOS.md`;
- scripts SQL soltos, diagnósticos antigos e documentação removida não substituem `supabase/migrations` nem os guias canônicos;
- quando houver divergência entre documentação e código atual, revisar o código e atualizar o guia canônico antes de fazer novas alterações.

Quando houver divergência entre guia atual e conteúdo histórico, prevalece o guia atual.

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso |
|---|---|
| `README.md` | Índice canônico da documentação. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que já está implementado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões de uso e anti-regressões. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, headers, árvore, menus, painéis, paletas, Mapa Familiar Vertical/Horizontal e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, bloqueios, QA futuro e backlog pós-MVP. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. |

---

## 4. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `arquitetura/ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, shell da Home, views da árvore, exportação client-side, paletas e integrações. |
| `arquitetura/ROTAS_E_GUARDS.md` | Rotas públicas, rotas de árvore, rotas de membro, rotas administrativas, guards, redirecionamentos e navegação. |
| `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações e objetos legados. |

---

## 5. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo |
|---|---|
| `PESSOAS_PERFIL_ADMIN.md` | Perfil público, perfil admin, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. |
| `MINHA_ARVORE_VIEW.md` | View direta da árvore, ReactFlow desktop/tablet, viewport, layout central, filtros diretos e `MobileFamilyTreeView`. |
| `MAPA_FAMILIAR_VIEW.md` | Documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`: vertical, horizontal, cards, grupos, conectores, filtros, paletas, seleção, exportação, loading, mobile e anti-regressões. |
| `GENEALOGIA_VIEW.md` | Genealogia, Visão Completa, gerações, chips mobile, cabeçalhos de coluna, reset de geração ativa, inferência visual e QA. |
| `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legendas, linhas, conectores ReactFlow, conectores HTML/CSS mobile, conectores SVG do Mapa Familiar, filtros, destaques, painel lateral e ações. |
| `MINHA_ARVORE_EDITAR.md` | Edição da própria árvore, avatar, arquivos, eventos pessoais, dados próprios, CSS mobile escopado e saída sem salvar. |
| `MINHA_ARVORE_FILTROS_E_PETS.md` | Filtros da Minha Árvore, separação humanos/pets, contadores, modo foco e impacto no Mapa Familiar. |
| `FORUM.md` | Fórum, categorias, tópicos, menções, respostas diretas, reações, favoritos, vínculos técnicos e notificações. |
| `NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions, fórum e cron futuro. |
| `CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile, Google Agenda, compliance OAuth, microcopy e QA. |
| `TIMELINE.md` | Timeline de pessoa, eventos derivados, `person_events`, arquivos históricos, relacionamentos e pós-MVP. |
| `EXPORTACAO_ARVORE.md` | Exportação por Área, Imagem, PDF e Impressão, incluindo captura HTML/CSS/SVG de `/mapa-familiar` e `/mapa-familiar-horizontal`, loading, título no canvas, SVGs e limite preventivo de pixels. |
| `FAVORITOS.md` | Favoritos de pessoas/páginas; revisar se `/mapa-familiar-horizontal` entrará em `FAVORITE_PAGES`. |

---

## 6. Operação

Pasta:

```txt
docs/operacao/
```

| Arquivo | Uso |
|---|---|
| `operacao/MIGRATIONS_SUPABASE.md` | Migrations versionadas, ordem de aplicação, validação e rollback. |
| `operacao/DEPLOY.md` ou `DEPLOYMENT.md` | Deploy, build, Vercel/hosting, variáveis e checagens. |
| `operacao/OAUTH_GOOGLE.md` | Operação Google OAuth, test users e compliance. |

---

## 7. Rotas da árvore

Rotas protegidas por `TreeAccessRoute`:

```txt
/
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
/busca
```

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`.

Contrato atual:

```ts
export type TreeViewMode =
  | 'minha-arvore'
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal'
  | 'genealogia'
  | 'visao-completa';
```

Rotas experimentais removidas:

```txt
/mapa-horizontal
/visao-completa-teste
```

---

## 8. Mapa rápido de arquivos de código por documentação

| Escopo | Arquivos principais |
|---|---|
| Rotas | `src/app/routes.tsx`, `src/app/components/FamilyTree/treeViewMode.ts` |
| Shell da Home | `src/app/pages/Home.tsx`, `src/app/pages/home/HomeTreeSection.tsx`, `src/app/pages/home/HomeHeader.tsx`, `src/app/pages/home/HomeMobileNav.tsx` |
| Painel | `src/app/pages/home/SidebarPanelTabs.tsx`, `DirectRelationKpiGrid.tsx`, `LifeStatusKpiGrid.tsx`, `SidebarInfoPanel.tsx` |
| Minha Árvore | `src/app/components/FamilyTree/FamilyTree.tsx`, `directFamilyDistributedLayout.ts` |
| Mobile direto | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `mobileFamilyTreeModel.ts` |
| Mapa Familiar Vertical | `DesktopFamilyMapView.tsx`, `FamilyTreeVisualCards.tsx`, `family-map-qa.css` |
| Mapa Familiar Horizontal | `DesktopFamilyHorizontalMapView.tsx`, `MobileFamilyHorizontalMapView.tsx`, `family-map-horizontal.css` |
| Exportação | `TreeAreaSelectionOverlay.tsx`, `utils/treeExport.ts`, `utils/exportColorSanitizer.ts`, `home-sidebar-unified.css` |
| Paletas | `treeColorPalettes.ts`, `directFamilyColors.ts`, CSS de suporte |
| Busca/favoritos | `globalSearchService.ts`, `favoritePages.ts`, `MeusFavoritos.tsx` |
| Auth/guards | `AuthContext.tsx`, `TreeAccessRoute.tsx`, `MemberRoute.tsx`, `ProtectedRoute.tsx` |

---

## 9. Sequência recomendada para atualização documental

Após mudanças em árvore/exportação:

1. `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`
2. `docs/funcionalidades/EXPORTACAO_ARVORE.md`
3. `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
4. `docs/GUIA_COMPONENTES.md`
5. `docs/GUIA_UX_LAYOUT.md`
6. `docs/arquitetura/ROTAS_E_GUARDS.md`
7. `docs/arquitetura/ARCHITECTURE.md`
8. `docs/GUIA_IMPLEMENTACOES.md`
9. `docs/README.md`
10. `docs/PLANO_PROXIMOS_PASSOS.md`

---

## 10. Pendências documentais conhecidas

Revisar nos próximos lotes:

```txt
docs/arquitetura/ARCHITECTURE.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/funcionalidades/FAVORITOS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
docs/historico/README.md
docs/operacao/
```

Pontos específicos:

- confirmar se `/mapa-familiar-horizontal` deve entrar em favoritos/busca como página própria;
- registrar QA pós-exportação dos Mapas Familiares;
- revisar efeitos compartilhados de filtros de vida/pets/cônjuges entre views;
- manter explícito que a barra `Paterno | Central | Materno` pertence ao mobile de `/mapa-familiar` e `MobileFamilyTreeView`, não ao mobile de `/mapa-familiar-horizontal`;
- manter explícito que a horizontal mobile usa `MobileFamilyHorizontalMapView` com uma geração por tela.
