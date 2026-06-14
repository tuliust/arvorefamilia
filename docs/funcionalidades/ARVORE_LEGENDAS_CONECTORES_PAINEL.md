# Árvore — painel, filtros, conectores, destaques e exportação

> Última revisão: 2026-06-14  
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Projeto: `tuliust/arvorefamilia`  
> Baseline revisada: `main` em `833108f`  
> Status: documentação funcional/técnica atualizada após simplificação do painel.

---

## 1. Função deste documento

Este documento consolida o comportamento de:

- painel lateral desktop;
- modal mobile de controles;
- filtros de grupos;
- filtros de status;
- regras de cônjuges;
- botões de zoom/restauração;
- alternância Vertical/Horizontal;
- flyouts `Cores`, `Exportar`, `Destacar`;
- conectores;
- destaques;
- seleção por área;
- loading de exportação.

Views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Rotas antigas não são views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

---

## 2. Estado atual do painel

O painel atual **não contém mais** a barra:

```txt
Filtros | Legendas | Ações
```

O painel foi simplificado para operar com:

- controles superiores compactos;
- filtros/grupos visíveis diretamente;
- status e KPIs acessíveis sem alternância por aba;
- flyouts específicos para paleta, exportação e destaques;
- modal mobile equivalente para controles essenciais.

A antiga estrutura de abas e o estado `activeSidebarPanel` não devem voltar como contrato de produto.

---

## 3. Controles que devem permanecer

| Controle | Função |
|---|---|
| Zoom + | Aproxima a view ativa. |
| Zoom - | Afasta a view ativa. |
| Restaurar visualização | Reseta posição, zoom, scroll ou enquadramento conforme view. |
| Vertical | Navega para `/mapa-familiar`. |
| Horizontal | Navega para `/mapa-familiar-horizontal`. |
| Cores | Alterna paleta visual. |
| Exportar | Área, Imagem, PDF, Imprimir. |
| Destacar | Linhas, Cards, Grupos. |

Regras:

- Vertical/Horizontal preservam `location.search`;
- `?pessoa=...` não pode ser perdido;
- exportação não pode depender de abas removidas;
- painel não entra na captura/exportação;
- botões de ação não devem ser `submit`.

---

## 4. Arquivos principais

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
```

Arquivos/elementos legados não montados no painel atual podem permanecer no repo apenas se houver dependência técnica comprovada. Eles não devem ser documentados como UI vigente.

---

## 5. Estados principais

| Estado | Papel |
|---|---|
| `directRelativeFilters` | Controla grupos/filtros diretos usados nas duas views oficiais. |
| `personFilters` | Controla vivos, falecidos e pets. |
| `visualLineFilters` | Controla filtros/destaques de linhas conforme view. |
| `activeHighlights` | Controla `Destacar`: linhas, cards e grupos. |
| `legendOpen` | Controla abertura do modal mobile de controles; não representa mais uma aba de legenda. |
| `renderedDirectRelationCounts` | Contagens efetivas retornadas pela view renderizada. |

Estados que não devem voltar como contrato de produto:

```txt
activeSidebarPanel
tabs Filtros/Legendas/Ações
viewMode com minha-arvore/genealogia/visao-completa
```

Regras:

- filtro não altera dados no Supabase;
- destaque não altera dados;
- contagem deve refletir renderização efetiva quando disponível;
- cônjuge sempre visível não deve inflar contagem de cônjuges filtráveis.

---

## 6. Filtros diretos

Keys esperadas:

```txt
tataravos
bisavos
avos
pais
tios
primos
sobrinhos
irmaos
filhos
netos
conjuge
pets
```

Regras:

- `Cônjuges` é filtro visual específico;
- `Pets` é filtro de grupo/pessoa pet conforme a view;
- `Filhos` usa ícone próprio;
- `Pets` usa tom específico da paleta ativa;
- filtros devem funcionar nas duas views oficiais;
- pessoa central deve permanecer visível quando aplicável.

---

## 7. Regras de cônjuges

### Sempre visíveis

Não dependem do filtro `Cônjuges`:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### Filtráveis

Dependem do filtro:

- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

### Anti-regressão

```txt
Conector conjugal nunca deve ser inferido apenas por proximidade visual.
```

Conectores conjugais devem depender de relacionamento explícito.

---

## 8. Filtros de status

Componente:

```txt
LifeStatusKpiGrid
```

Filtros:

```txt
Vivos
Falecidos
Pets
```

Regras:

- pessoa central deve permanecer visível quando aplicável;
- pets dependem de filtros de pet e tipo de pessoa;
- filtros não devem remover dados do banco;
- filtros devem ser refletidos na exportação.

---

## 9. Legendas e ajuda contextual

A antiga aba `Legendas` não é UI vigente do painel.

Possibilidades futuras:

| Opção | Decisão necessária |
|---|---|
| Remover totalmente legenda visual | Excluir UI, docs funcionais específicas e CSS órfão após auditoria. |
| Manter como ajuda contextual | Reposicionar fora do fluxo de abas, por exemplo em tooltip/modal independente. |

Até nova decisão:

- não reintroduzir a aba `Legendas`;
- qualquer legenda visível deve ter `data-tree-export-ignore="true"`;
- documentação histórica sobre legendas deve ficar marcada como legado.

---

## 10. Conectores

### Vertical

View:

```txt
DesktopFamilyMapView
```

Características:

- SVG por âncoras;
- recalculado com grupos, zoom e modo wide;
- ajustado quando `Destacar > Grupos` oculta chrome;
- não deve depender de proximidade visual.

### Horizontal

View:

```txt
DesktopFamilyHorizontalMapView
```

Características:

- SVG por geração/casal/filhos;
- conectores de cônjuge e casal → filhos;
- colunas compactadas;
- recalculado quando cabeçalhos/grupos mudam.

### Mobile vertical

View:

```txt
MobileFamilyTreeView
```

Características:

- conectores HTML/CSS;
- navegação Paterno/Central/Materno;
- não deve afetar horizontal mobile.

### Mobile horizontal

View:

```txt
MobileFamilyHorizontalMapView
```

Características:

- uma geração por tela;
- chips de geração;
- swipe lateral;
- scroll vertical interno por geração;
- conectores visuais escopados ao root mobile horizontal.

---

## 11. Destaques

Flyout:

```txt
Destacar
```

Opções:

| Opção | Comportamento |
|---|---|
| Linhas | Oculta/destaca conectores conforme view. |
| Cards | Aplica outline/realce nos cards. |
| Grupos | Remove ou reduz chrome visual de grupos, preservando conteúdo. |

Regras:

- destaque não altera dados;
- destaque deve ser respeitado na exportação;
- `Destacar > Grupos` não pode quebrar conectores;
- labels auxiliares não devem aparecer na exportação se forem apenas UI.

---

## 12. Exportação e seleção por área

Ações:

```txt
Área
Imagem
PDF
Imprimir
```

Regras:

- exporta a view ativa;
- usa root exportável específico da vertical/horizontal;
- oculta painel, header, bottom nav, overlays e loading;
- preserva cards, conectores, paleta e título;
- recorte por área deve respeitar coordenadas da superfície capturada;
- captura muito grande deve ser bloqueada com mensagem clara.

Arquivos críticos:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/styles/home-sidebar-unified.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
```

---

## 13. Mobile

Regras do modal mobile:

- aberto pelo botão `Controles`;
- overlay fecha o modal;
- `Escape` fecha quando disponível;
- body fica com scroll travado;
- conteúdo interno tem rolagem própria;
- painel fica acima do header, bottom nav e botões flutuantes;
- painel não entra na exportação.

Não reintroduzir:

```txt
MobileTreeControlsPortal como UI duplicada nas rotas oficiais
sidebar lateral mobile
bottom sheet parcial que comprometa controles
barra Paterno/Central/Materno na horizontal mobile
```

---

## 14. Checklist de QA

### Desktop

- [ ] `/mapa-familiar` abre como view default.
- [ ] `/mapa-familiar-horizontal` abre como horizontal.
- [ ] Vertical/Horizontal preservam `?pessoa=...`.
- [ ] Zoom + e Zoom - funcionam.
- [ ] Restaurar visualização funciona.
- [ ] Cores alteram paleta.
- [ ] Exportar abre ações e executa PNG/PDF/print/área.
- [ ] Destacar altera linhas/cards/grupos sem quebrar conectores.
- [ ] Filtros funcionam sem abas internas.
- [ ] Painel não aparece na exportação.

### Mobile

- [ ] Botão `Controles` abre modal.
- [ ] Overlay fecha modal.
- [ ] Scroll interno funciona.
- [ ] Body destrava ao fechar.
- [ ] Horizontal mobile navega por geração.
- [ ] Vertical mobile mantém Paterno/Central/Materno.
- [ ] Exportação não captura header, bottom nav ou modal.

---

## 15. Não regressão

Não reintroduzir:

```txt
/minha-arvore como view ativa
/genealogia como rota ativa
/visao-completa como rota ativa
TreeViewMode com mais de dois valores
barra Filtros | Legendas | Ações
activeSidebarPanel como contrato de produto
favoritos apontando para rotas removidas
busca global retornando rotas removidas como páginas ativas
```
