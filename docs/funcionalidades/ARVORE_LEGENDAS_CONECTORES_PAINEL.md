# Árvore - legendas, conectores, filtros e painel lateral

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Tipo: documentação funcional/técnica específica da árvore.  
> Status: revisado contra a estrutura atual de `Home.tsx`, `HomeTreeSection.tsx`, `HomeMobileNav.tsx`, `SidebarPanelTabs.tsx`, `DesktopFamilyMapView.tsx`, `DesktopFamilyHorizontalMapView.tsx`, `MobileFamilyHorizontalMapView.tsx`, `TreeAreaSelectionOverlay.tsx`, `FamilyTreeVisualCards.tsx`, `treeExport.ts` e CSS complementar.

---

## 1. Função deste documento

Este documento consolida o comportamento dos controles visuais da árvore:

- painel lateral desktop;
- painel mobile modal das rotas de Mapa Familiar;
- filtros de grupos;
- filtros de status;
- regras de `Cônjuges`;
- botões de zoom e restauração;
- flyouts de `Cores`, `Exportar` e `Destacar`;
- conectores ReactFlow, HTML/CSS e SVG;
- seleção manual de área;
- loading de exportação;
- regras de exclusão de interface durante captura.

Não substitui:

| Tema | Documento |
|---|---|
| Mapa Familiar Vertical/Horizontal | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX/layout | `docs/GUIA_UX_LAYOUT.md` |
| Minha Árvore | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
| Genealogia | `docs/funcionalidades/GENEALOGIA_VIEW.md` |

---

## 2. Regra central dos estados

Os controles da árvore devem permanecer separados por responsabilidade.

| Estado | Responsabilidade |
|---|---|
| `edgeFilters` | existência/visibilidade de linhas ReactFlow. |
| `visualLineFilters` | destaque visual de linhas já visíveis em views ReactFlow. |
| `personFilters` | visibilidade de cards por status: vivos, falecidos, pets. |
| `directRelativeFilters` | grupos/filtros diretos usados em Minha Árvore, Mapa Familiar Vertical e Mapa Familiar Horizontal. |
| `genealogyFilters` | gerações/grupos da Genealogia e da Visão Completa. |
| `activeHighlights` / `data-tree-highlight-*` | efeitos visuais globais acionados pelo flyout `Destacar`. |

Regras obrigatórias:

```txt
Destaque não cria relacionamento.
Destaque não reexibe card filtrado.
Destaque não altera dados.
Destaque não persiste no Supabase.
Contadores devem refletir o que a view renderiza quando a view fornece contagem efetiva.
```

---

## 3. Painel desktop

O painel desktop é renderizado na Home pós-login e integra `SidebarPanelTabs`, `DirectRelationKpiGrid`, `LifeStatusKpiGrid`, `GenealogyFilterGrid`, `TreeLegend` e `SidebarInfoPanel`.

### 3.1 Topo do painel

O topo do painel concentra:

| Controle | Papel |
|---|---|
| `+ Zoom` | chama `zoomIn` na view atual. |
| `- Zoom` | chama `zoomOut` na view atual. |
| `Restaurar visualização` | dispara `restore-view`; reseta zoom e posição/scroll inicial. |
| `Vertical` | navega para `/mapa-familiar`. |
| `Horizontal` | navega para `/mapa-familiar-horizontal`. |
| `Cores` | alterna paletas via CSS variables/document root. |
| `Exportar` | abre `Área`, `Imagem`, `PDF`, `Imprimir`. |
| `Destacar` | abre `Linhas`, `Cards`, `Grupos`. |

O painel não deve entrar em PNG, PDF, impressão ou captura de área.

### 3.2 Abas

| Aba | Conteúdo |
|---|---|
| `Filtros` | grupos diretos ou filtros de genealogia + status de vida/pets. |
| `Legendas` | legenda visual da árvore. |
| `Ações` | painel informativo/ações auxiliares. |

---

## 4. Painel mobile

Nas rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

o botão `Controles` é controlado por `HomeMobileNav` e abre o painel mobile de `Home.tsx`, reaproveitando `sidebarPanelContent`.

Contrato atual:

- não existe sidebar lateral;
- o conteúdo do painel mobile usa os mesmos filtros e ações do desktop;
- o painel mobile deve abrir como modal acima do header, do bottom nav e dos botões flutuantes;
- o overlay cobre a tela inteira e fecha o modal ao toque;
- o conteúdo interno tem rolagem própria;
- a tecla `Escape` fecha o modal quando disponível;
- o body deve bloquear rolagem enquanto o modal estiver aberto;
- `MobileTreeControlsPortal` retorna `null` nessas duas rotas para evitar duplicidade;
- o painel, bottom nav, botões flutuantes e overlays têm marcadores/estilos para não entrar na exportação.

Regras de camada:

```txt
Painel mobile > header > barra superior da árvore > bottom nav > conteúdo da árvore
```

Regras de exportação:

- o painel mobile deve usar `data-tree-export-ignore="true"`;
- o overlay e botões do painel não devem entrar em PNG, PDF, impressão ou seleção de área.

---

## 5. `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Cards atuais:

| Key | Label | Tipo |
|---|---|---|
| `tataravos` | Tataravós | Grupo |
| `bisavos` | Bisavós | Grupo |
| `avos` | Avós | Grupo |
| `pais` | Pais | Grupo |
| `tios` | Tios | Grupo |
| `primos` | Primos | Grupo |
| `sobrinhos` | Sobrinhos | Grupo |
| `irmaos` | Irmãos | Grupo |
| `filhos` | Filhos | Grupo |
| `netos` | Netos | Grupo |
| `conjuge` | Cônjuges | Filtro visual de cônjuges específicos |
| `pets` | Pets | Filtro de pets |

Regras:

- `Filhos` usa o ícone `UserRoundPlus`.
- `Netos` mantém o ícone de bebê/criança.
- `Cônjuges` não deve voltar para o bloco de grupos.
- `Pets` fica nos filtros e respeita a paleta visual ativa.
- Na paleta `visual`, Pets usa tom teal/ciano, não laranja.

---

## 6. Regras de `Cônjuges`

### 6.1 Conceito

O filtro `Cônjuges` não significa “mostrar/ocultar todos os cônjuges do banco”.

Ele controla apenas cônjuges filtráveis de grupos colaterais/descendentes.

### 6.2 Sempre visíveis

Nunca devem depender do filtro `Cônjuges`:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### 6.3 Filtráveis

Dependem do filtro `Cônjuges`:

- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

No Mapa Familiar Horizontal, as constantes conceituais são:

```txt
ALWAYS_VISIBLE_SPOUSE_ANCHOR_GROUPS = ['avos', 'bisavos', 'tataravos']
FILTERABLE_SPOUSE_ANCHOR_GROUPS = ['tios', 'primos', 'sobrinhos', 'filhos', 'netos']
```

### 6.4 Contagem

O painel deve usar contagem efetiva renderizada pela view quando disponível.

Regra de aceite:

```txt
A contagem de Cônjuges não inclui cônjuge central nem cônjuges ancestrais obrigatórios.
```

---

## 7. Filtros de status

`LifeStatusKpiGrid` usa:

```ts
{
  vivos: boolean;
  falecidos: boolean;
  pets: boolean;
}
```

Regras:

- pessoa central permanece visível quando aplicável;
- pets obedecem ao filtro `pets`;
- falecidos obedecem ao filtro `falecidos`;
- vivos obedecem ao filtro `vivos`;
- placeholders vazios/dashed não devem aparecer como caixas fantasma quando filtros removem cards.

---

## 8. Linhas e conectores

### 8.1 ReactFlow

Usado em:

```txt
/minha-arvore desktop/tablet
/genealogia
/visao-completa
```

Controlado por:

```txt
edgeFilters
visualLineFilters
```

### 8.2 Mobile segmentado

Usado em:

```txt
/minha-arvore mobile
/mapa-familiar mobile
```

Conectores HTML/CSS próprios, não ReactFlow.

### 8.3 Mapa Familiar Vertical

Usa SVG próprio dentro de `DesktopFamilyMapView.tsx`.

Características:

- conecta grupos e cards por âncoras calculadas;
- precisa acompanhar modo wide, offsets laterais e grupos ocultos;
- ao ativar `Destacar > Grupos`, os conectores devem se aproximar dos cards, não da caixa invisível antiga;
- ao ativar `Destacar > Linhas`, os conectores são ocultados.

### 8.4 Mapa Familiar Horizontal

Usa SVG próprio dentro de `DesktopFamilyHorizontalMapView.tsx`.

Características:

- linha vertical entre cônjuges;
- saída horizontal do meio do casal para o gap;
- tronco vertical no gap;
- ramais horizontais até filhos;
- troncos distribuídos no eixo X para evitar sobreposição;
- filhos ordenados do mais velho para o mais novo;
- colunas vazias são omitidas e conectores recalculados.

---

### 8.5 Mapa Familiar Horizontal mobile

Usado em:

```txt
/mapa-familiar-horizontal mobile
```

Sistema:

```txt
MobileFamilyHorizontalMapView + SVG/HTML próprios
```

Características:

- uma geração visível por tela;
- track horizontal paginado;
- swipe lateral para trocar geração;
- scroll vertical independente dentro de cada geração;
- conectores devem acompanhar o track, não telas isoladas;
- gerações sem cards visíveis não devem gerar tela vazia;
- filtros diretos, filtros de status, cônjuges e pets continuam compartilhados com o painel.

A barra `Paterno | Central | Materno` não pertence à horizontal mobile.


## 9. `Destacar`

O flyout `Destacar` altera atributos globais no `document.documentElement`.

| Botão | Comportamento atual |
|---|---|
| `Linhas` | oculta conectores visuais da view atual. |
| `Cards` | aplica outline/destaque em cards visíveis. |
| `Grupos` | altera chrome dos grupos/cabeçalhos conforme a view. |

### 9.1 `Destacar > Linhas`

Comportamento atual:

- oculta conectores do Mapa Familiar Vertical/Horizontal via `[data-family-map-connectors='true']`;
- oculta edges ReactFlow quando aplicável;
- não deve ocultar ícones internos dos cards;
- não deve alterar cards ou contadores.

### 9.2 `Destacar > Cards`

Comportamento atual:

- aplica outline/destaque visual em cards visíveis;
- não reexibe cards ocultos por filtro;
- não altera paleta, dados ou contadores.

### 9.3 `Destacar > Grupos` no Mapa Familiar Vertical

Quando ativo:

- oculta molduras, fundos, bordas e sombras de grupos;
- oculta títulos/pills dos grupos;
- oculta os labels diretos `PAI`, `MÃE` e `CÔNJUGE`;
- mantém cards visíveis;
- recalcula altura/geometria dos grupos em modo sem chrome;
- aproxima conectores dos cards, em vez de conectá-los à caixa invisível antiga.

A implementação usa conceitos como:

```txt
hideGroupChrome
data-family-map-group="true"
data-family-map-group-title="true"
data-family-map-chrome-hidden="true"
```

### 9.4 `Destacar > Grupos` no Mapa Familiar Horizontal

Quando ativo:

- oculta cabeçalhos `Geração X`;
- reduz o topo do canvas/colunas;
- recalcula cards e conectores mais acima;
- quando desativado, restaura layout anterior.

---

## 10. Restaurar visualização

O botão `Restaurar visualização` dispara a ação própria:

```txt
restore-view
```

Regras:

- não deve ser tratado como `zoom-out`;
- deve resetar zoom manual;
- deve resetar scroll/posição inicial da árvore;
- deve funcionar repetidas vezes;
- deve funcionar em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- deve preservar filtros, paleta e pessoa central.

---

## 11. Exportar

O flyout `Exportar` oferece:

| Botão | Ação |
|---|---|
| `Área` | abre seleção retangular. |
| `Imagem` | exporta PNG. |
| `PDF` | exporta PDF A4 proporcional. |
| `Imprimir` | abre janela de impressão com imagem da árvore. |

A view ativa expõe essas ações via `FamilyTreeActions`:

```ts
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Regras gerais:

- o painel apenas dispara a ação;
- a view decide o alvo capturável;
- exportação não altera filtros;
- elementos de UI devem ser ignorados na captura;
- o loading de exportação deve bloquear cliques repetidos;
- o título da view é composto no canvas exportado.

---

## 12. Loading de exportação

A exportação usa `TreeExportLoadingOverlay`.

Textos recomendados:

| Ação | Texto |
|---|---|
| Imagem | `Preparando imagem...` |
| PDF | `Gerando PDF...` |
| Imprimir | `Preparando impressão...` |
| Área | texto específico da ação da toolbar. |

Regras:

- mostrar antes do trabalho pesado;
- usar `waitForTreeExportPaint()` para garantir pintura visual;
- usar `waitForExportUiSettle()` para não fechar cedo demais;
- ignorar o loading no clone de exportação;
- fechar em `finally`;
- exibir erro via toast ou mensagem local.

---

## 13. Elementos ignorados na exportação

Devem ser ignorados por `treeExport.ts` e/ou CSS:

```txt
[data-tree-export-ignore="true"]
[data-tree-selection-overlay="true"]
[data-tree-export-loading="true"]
[data-tree-node-menu="true"]
[data-tree-legend="true"]
.react-flow__controls
.react-flow__minimap
```

---

## 14. QA obrigatório

### Painel

- alternar Vertical/Horizontal preservando search params;
- abrir `Cores`, `Exportar`, `Destacar`;
- testar zoom in/out;
- testar `Restaurar visualização`;
- validar contagens após filtros.

### Destaques

- `Linhas`: conectores somem, ícones permanecem;
- `Cards`: cards destacados;
- `Grupos` vertical: caixas/títulos/labels diretos somem, cards permanecem;
- `Grupos` horizontal: cabeçalhos somem, cards sobem, conectores alinhados.

### Exportação

- Imagem/PDF/Imprimir com título;
- área selecionada com título;
- loading não some cedo demais;
- avatares/silhuetas não viram quadrados;
- painel/overlays não aparecem no artefato;
- `/mapa-familiar-horizontal` mobile exibe uma geração por tela;
- swipe lateral muda geração sem quebrar scroll vertical.

---

## 15. Anti-regressões

Não fazer:

- usar CSS amplo como `svg path` sem escopo;
- ocultar conectores por seletor que atinja ícones internos;
- reintroduzir sombra em `Destacar > Grupos`;
- tratar `restore-view` como `zoom-out`;
- usar `.react-flow` como alvo de exportação do Mapa Familiar;
- remover `netos` dos cônjuges filtráveis;
- colocar `Cônjuges` de volta no bloco de grupos;
- reativar `MobileTreeControlsPortal` em `/mapa-familiar` ou `/mapa-familiar-horizontal`;
- reintroduzir a barra `Paterno | Central | Materno` na horizontal mobile;
- usar z-index inferior ao header/bottom nav no painel mobile.
