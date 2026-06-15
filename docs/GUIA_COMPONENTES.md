# Guia de componentes — Árvore Família

> Última revisão: 2026-06-14
> Local canônico: `docs/GUIA_COMPONENTES.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: guia de responsabilidades de componentes
> Status: revisado para reduzir repetição com baseline/inventário e destacar responsabilidades, limites e riscos por componente.

---

## 1. Objetivo

Este guia descreve **quem faz o quê** no front-end e nos services principais.

Use antes de alterar:

- shell da árvore;
- views oficiais;
- painel desktop;
- modal mobile;
- exportação;
- paletas;
- calendário;
- perfil/pessoas;
- favoritos, fórum e notificações.

Para contratos funcionais, use `BASELINE_PRODUTO_ATUAL.md`.
Para mapa técnico completo, use `INVENTARIO_TECNICO.md`.
Para checklists, use `REGRAS_DE_NAO_REGRESSAO.md`.

---

## 2. Convenções de componentes

| Regra | Aplicação |
|---|---|
| UI não acessa Supabase diretamente | Usar camada `services`. |
| Cálculos puros não ficam misturados ao JSX | Preferir `utils`, `layouts` ou helpers locais pequenos. |
| Botões não-submit usam `type="button"` | Evita envio acidental de forms. |
| Elementos fora da captura de árvore usam atributo de ignore | `data-tree-export-ignore="true"` ou equivalente. |
| CSS de árvore deve ser escopado | Evitar seletor global que afete fórum, admin ou perfil. |
| Histórico não orienta produto ativo | Não reintroduzir views removidas. |
| Mobile não é cópia integral do desktop | Modal mobile é reduzido por contrato. |
| Debug não é produto final | `Visualizar como...` deve ficar temporário/flagado ou ser removido por decisão. |

---

## 3. Shell da árvore

### 3.1 `Home`

Arquivo:

```txt
src/app/pages/Home.tsx
```

Responsabilidades:

- carregar dados necessários à árvore;
- resolver pessoa central;
- manter filtros, destaques e paleta;
- controlar painel desktop;
- controlar modal mobile;
- disparar ações de exportação;
- integrar favoritos, modais auxiliares e debug;
- preservar `location.search`.

Riscos:

- concentra responsabilidades demais;
- mudanças pequenas podem afetar árvore, modal, exportação e navegação ao mesmo tempo;
- estados de debug não devem persistir dados reais.

Estados/contratos relevantes:

| Estado | Papel |
|---|---|
| `directRelativeFilters` | filtros de grupos diretos |
| `personFilters` | vivos, falecidos e pets |
| `visualLineFilters` | conectores/linhas |
| `activeHighlights` | destaques |
| `legendOpen` | abertura do modal mobile de controles |
| `mobileGroupsOpen` | grupos sob demanda no modal mobile |
| `renderedDirectRelationCounts` | contagens efetivas informadas pela view |
| `treeLayoutRevision` | força recalculo/re-render |
| `debugViewPersonId` | debug temporário `Visualizar como...` |

### 3.2 `HomeTreeSection`

Arquivo:

```txt
src/app/pages/home/HomeTreeSection.tsx
```

Responsabilidade:

- escolher a view correta conforme rota e breakpoint;
- repassar filtros, callbacks e refs;
- tratar loading, erro e estado vazio;
- montar título desktop/exportável;
- receber ações de exportação do painel.

Matriz:

| Condição | Componente |
|---|---|
| mobile + `mapa-familiar` | `MobileFamilyTreeView` |
| mobile + `mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` |
| desktop/tablet + `mapa-familiar` | `DesktopFamilyMapView` |
| desktop/tablet + `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` |

Não adicionar branches para `minha-arvore`, `genealogia` ou `visao-completa`.

### 3.3 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidades:

- header da Home pós-login;
- busca;
- atalhos;
- menu do usuário;
- favorito da página atual.

Cuidados:

- header não entra na exportação;
- não apontar ação principal para rota removida;
- nome/e-mail do usuário ficam no menu, não como texto lateral permanente.

### 3.4 `HomeMobileNav`

Arquivo:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Responsabilidades:

- navegação inferior mobile;
- acesso ao modal `Controles`;
- integração com a horizontal mobile sem sobrepor os botões `Ger X`.

Cuidados:

- não duplicar `MobileTreeControlsPortal`;
- não reintroduzir `Paterno | Central | Materno` na horizontal mobile;
- marcar UI transitória para ser ignorada na exportação.

---

## 4. Painel e controles

### 4.1 `SidebarPanelTabs`

Arquivo:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
```

Responsabilidades atuais:

- controles de zoom/restauração no desktop;
- alternância Vertical/Horizontal preservando search params;
- flyouts de `Cores`, `Exportar` e `Destacar`;
- grupos e filtros de status;
- versão reduzida para modal mobile.

Cuidados:

- o nome mantém legado; o componente não deve restaurar abas persistentes;
- mobile não deve expor Zoom, Restaurar ou Exportar;
- `Exportar > Área` deve continuar como toggle;
- qualquer renome para `TreeControlPanel` deve ser feito em frente própria.

### 4.2 `DirectRelationKpiGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
```

Responsabilidades:

- exibir KPIs/contagens de relações diretas;
- refletir contagens efetivamente renderizadas quando fornecidas pela view;
- funcionar no painel desktop e no modal mobile sob demanda.

Cuidados:

- grupos no modal mobile aparecem apenas após ação `Grupos`;
- contagens não devem inflar cônjuges sempre visíveis.

### 4.3 `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Responsabilidades:

- controlar filtros de grupos diretos;
- expor atributos de paleta para cards do painel;
- tratar `Cônjuges` e `Pets` como grupos/filtros distintos.

Cuidados:

- cônjuge ancestral sempre visível não é a mesma coisa que cônjuge filtrável;
- não resolver ausência visual criando relacionamento fictício.

### 4.4 `LifeStatusKpiGrid`

Arquivo:

```txt
src/app/pages/home/LifeStatusKpiGrid.tsx
```

Responsabilidades:

- filtros de vivos, falecidos, cônjuges e pets;
- contadores por status/tipo;
- visibilidade permanente no modal mobile.

Cuidados:

- filtros mobile devem caber em layout compacto;
- contraste deve ser preservado nas quatro paletas.

---

## 5. Views oficiais da árvore

### 5.1 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar` em desktop/tablet;
- compor grupos da família direta;
- aplicar filtros;
- calcular cônjuges e núcleos conjugais adicionais;
- desenhar conectores;
- controlar zoom/scroll;
- executar exportação;
- servir de referência visual para a vertical mobile.

Riscos:

- alterações em layout exigem QA visual;
- conectores devem depender de âncoras/dados, não de proximidade visual;
- não corrigir sobreposição apenas com zoom padrão.

### 5.2 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar` no mobile;
- organizar experiência Paterno/Central/Materno;
- mostrar cards compactos;
- usar conectores HTML/CSS;
- consumir paletas da árvore.

Cuidados:

- não usar na horizontal mobile;
- não criar paleta própria hardcoded;
- resultado visual não deve mostrar fallbacks `Nascimento não informado`/`Falecimento não informado`.

Dívida conhecida:

```txt
TREE-004 — hoje há limpeza em src/main.tsx para ocultar fallback de datas.
```

### 5.3 `DesktopFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` em desktop/tablet;
- organizar pessoas por gerações;
- posicionar cônjuges conforme grupos suportados;
- desenhar conectores SVG;
- exportar com título e paleta.

Cuidados:

- `pais` ainda não está entre os grupos filtráveis de cônjuges no código auditado;
- não documentar cônjuges de pais/Geração 4 como implementados até correção;
- não inferir conjugalidade por proximidade visual.

### 5.4 `MobileFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` no mobile;
- exibir uma geração por tela;
- permitir swipe lateral;
- permitir scroll vertical interno;
- renderizar botões `Ger X`;
- preservar paleta ativa.

Cuidados:

- não usar barra Paterno/Central/Materno;
- não usar scroll horizontal manual como navegação principal;
- não reintroduzir setas laterais como navegação principal;
- manter coerência com estrutura desktop.

---

## 6. Cards, avatares e paletas

### 6.1 `FamilyTreeVisualCards`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Responsabilidades:

- renderizar card visual compartilhado;
- tratar foto real, fallback `User` e pet `PawPrint`;
- aplicar data attributes de paleta e exportação;
- exibir metadados vitais quando houver.

Cuidados:

- não restaurar fallback visual por gênero;
- SVGs internos não podem herdar estilo global de conectores;
- textos de data ausente não devem aparecer no resultado visual mobile.

### 6.2 `treeColorPalettes`

Arquivo:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
```

Responsabilidades:

- definir chaves `white`, `visual`, `orange`, `brown`;
- fornecer tokens de canvas, cards, texto, conectores e labels.

Cuidados:

- novas paletas exigem atualização em CSS, painel, exportação e QA;
- mobile deve herdar, não duplicar regras.

---

## 7. Exportação

Componentes/utilitários:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeExportLoadingOverlay.tsx
```

Responsabilidades:

- captura por área;
- PNG;
- PDF;
- impressão;
- loading;
- proteção contra captura grande;
- filename e título.

Cuidados:

- não capturar painel, header, bottom nav, modal, loading ou debug;
- não remover utilitários por parecerem legados de ReactFlow sem auditoria.

---

## 8. Calendário familiar

Arquivo:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

CSS crítico:

```txt
src/styles/calendar-mobile-category-buttons.css
```

Responsabilidades:

- renderizar calendário familiar;
- filtrar categorias;
- lidar com eventos familiares;
- oferecer integração Google Agenda quando configurada.

Cuidados:

- mobile deve manter 5 botões em linha quando possível;
- bolinha colorida fica acima do texto;
- título do botão deve ficar em uma linha;
- OAuth/secrets/test users são operação, não componente.

---

## 9. Perfil, favoritos, fórum e notificações

### Perfil/pessoas

```txt
src/app/pages/PersonProfile.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusDados.tsx
src/app/components/person/
```

Responsabilidades:

- perfil de pessoa;
- dados e arquivos;
- edição de membro;
- retorno seguro via `?voltar=`.

### Favoritos

```txt
src/app/components/favorites/
src/app/services/favoritesService.ts
```

Responsabilidades:

- favoritos de páginas;
- favoritos de pessoas/conteúdos suportados.

### Fórum

```txt
src/app/pages/forum/
src/app/services/forumService.ts
```

Responsabilidades:

- tópicos;
- edição;
- visualização;
- interações conforme service.

### Notificações

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/services/userEngagementService.ts
```

Responsabilidades:

- central;
- preferências;
- compatibilidade com notificações internas/e-mail conforme configuração.

---

## 10. Services principais

| Service | Papel |
|---|---|
| `dataService.ts` | CRUD e consultas principais de pessoas/relacionamentos/eventos. |
| `memberProfileService.ts` | vínculo usuário-pessoa e área de membro. |
| `treeDataCache.ts` | cache/eventos globais da árvore. |
| `relationshipCacheService.ts` | cache de parentesco. |
| `favoritesService.ts` | favoritos. |
| `globalSearchService.ts` | busca global. |
| `forumService.ts` | fórum. |
| `userEngagementService.ts` | notificações, preferências e compatibilidade. |
| `storageService.ts` | arquivos/storage quando usado. |

Regra:

```txt
Componente visual não deve bypassar service para gravar dados.
```

---

## 11. Legado ativo e componentes históricos

Podem existir arquivos com nomes ou origem legada, especialmente ligados a ReactFlow.

Regra de remoção:

1. procurar imports;
2. verificar uso indireto por tipos/helpers;
3. rodar build/testes;
4. fazer QA visual;
5. remover documentação relacionada no mesmo commit.

Não remover apenas por parecer antigo.

---

## 12. Data attributes críticos

| Atributo | Uso |
|---|---|
| `data-export-root="family-tree"` | raiz de exportação |
| `data-family-map-export-root="true"` | raiz/escopo alternativo da árvore |
| `data-tree-export-ignore="true"` | UI ignorada na exportação |
| `data-tree-route-view` | marcação da view ativa |
| `data-family-map-color-key` | paletas/cards |
| `data-mobile-family-tree-root="true"` | escopo da vertical mobile |
| `data-family-map-mobile-card="true"` | cards mobile para ajustes visuais |
| `data-tree-debug-viewer="true"` | debug temporário |

---

## 13. QA por tipo de alteração

Alteração em árvore:

```bash
npm run build
npm test
npm run test:e2e
```

Alteração em CSS/paleta:

```bash
npm run build
npm run test:e2e
```

Alteração apenas documental:

```bash
git diff --check
npm run build
```

QA manual mínimo:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/calendario-familiar
320 / 375 / 390 / 430 / 768 / 1366 / 1440 / 1536 / 1920px
```
