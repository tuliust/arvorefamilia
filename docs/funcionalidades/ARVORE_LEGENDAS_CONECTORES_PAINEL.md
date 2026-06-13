# Árvore - legendas, conectores, filtros e painel lateral

> Última revisão: 2026-06-11  
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Tipo: documentação funcional/técnica específica da árvore.  
> Status: atualizado com Mapa Familiar Vertical/Horizontal, filtros de cônjuges, conectores SVG da horizontal, colunas vazias, painel desktop/mobile, controle mobile por `HomeMobileNav` e pendência do filtro de grupo Pets.

## 1. Função deste documento

Este documento consolida os controles visuais da árvore:

- aba **Legendas**;
- filtros de cards;
- filtros de linhas;
- destaques visuais;
- filtros de grupos diretos;
- filtros de gerações;
- filtros e regras de **Cônjuges**;
- conectores da Minha Árvore ReactFlow;
- conectores HTML/CSS do layout mobile segmentado;
- conectores SVG do Mapa Familiar Vertical;
- conectores SVG do Mapa Familiar Horizontal;
- conectores da Genealogia e Visão Completa;
- painel lateral desktop;
- painel inferior mobile;
- ações de exportação.

Não substitui:

| Tema | Documento |
|---|---|
| view direta | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
| Mapa Familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Genealogia/mobile | `docs/funcionalidades/GENEALOGIA_VIEW.md` |
| filtros e pets | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| componentes | `docs/GUIA_COMPONENTES.md` |
| UX geral | `docs/GUIA_UX_LAYOUT.md` |

---

## 2. Regra central

Separar claramente:

| Estado | Responsabilidade |
|---|---|
| `edgeFilters` | existência/visibilidade de linhas ReactFlow |
| `visualLineFilters` | destaque visual de linhas já visíveis |
| `personFilters` | visibilidade de cards por vivo/falecido/pet |
| `directRelativeFilters` | grupos da Minha Árvore, Mapa Familiar Vertical e Mapa Familiar Horizontal |
| `genealogyFilters` | gerações/grupos da Genealogia e Visão Completa |

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

Importante:

- conectores ReactFlow, HTML/CSS mobile e SVG do Mapa Familiar são sistemas diferentes;
- filtros de linhas ReactFlow não comandam diretamente conectores HTML/CSS mobile;
- filtros de linhas ReactFlow não comandam diretamente conectores SVG do Mapa Familiar, salvo quando a view explicitamente mapear essa regra;
- filtros de grupos controlam cards e escopo, não linhas diretamente.

---

## 3. Estados principais

Os estados ficam principalmente em `src/app/pages/Home.tsx` e componentes filhos.

### 3.1 `edgeFilters`

```ts
{
  conjugal: boolean;
  filiacao_sangue: boolean;
  filiacao_adotiva: boolean;
  irmaos: boolean;
}
```

Função:

- controlar linhas conjugais em views ReactFlow;
- controlar linhas parentais de filiação em views ReactFlow;
- controlar linhas de irmãos quando suportadas.

Não deve:

- alterar cards;
- alterar contadores de vida/pets;
- persistir no Supabase;
- alterar relacionamentos reais.

### 3.2 `visualLineFilters`

```ts
{
  spouseHighlight: boolean;
  parentChildHighlight: boolean;
  siblingHighlight: boolean;
}
```

Função:

- destacar linhas visíveis;
- preservar linhas ocultas;
- não alterar estrutura do grafo.

### 3.3 `personFilters`

```ts
{
  vivos: boolean;
  falecidos: boolean;
  pets: boolean;
}
```

Função:

- controlar cards renderizados por status/tipo;
- preservar pessoa central quando aplicável;
- alimentar contadores de `LifeStatusKpiGrid`.

### 3.4 `directRelativeFilters`

```txt
pais
avos
bisavos
tataravos
conjuge
filhos
netos
irmaos
sobrinhos
tios
primos
pets
```

Função:

- controlar grupos visuais da Minha Árvore;
- controlar grupos visuais do Mapa Familiar Vertical;
- controlar grupos visuais do Mapa Familiar Horizontal;
- afetar cards/contadores do escopo direto;
- não controlar linhas diretamente.

Regra de rótulo:

```txt
conjuge deve aparecer no painel como Cônjuges.
```

### 3.5 `genealogyFilters`

```txt
generation1
generation2
generation3Family
generation3Spouses
generation4Family
generation4Spouses
generation5Family
generation5Spouses
generation6
```

Função:

- controlar grupos da Genealogia/Visão Completa;
- preservar conectores apenas entre pessoas visíveis;
- evitar edges soltas.

---

## 4. Painel lateral e painel mobile

### 4.1 Painel desktop

No desktop, a Home renderiza uma sidebar com:

| Aba | Conteúdo |
|---|---|
| Filtros | `DirectRelationKpiGrid` ou `GenealogyFilterGrid` + `LifeStatusKpiGrid` |
| Legendas | `TreeLegend` |
| Ações | `SidebarInfoPanel` |

O topo do painel inclui:

- botões de zoom;
- recolher/expandir painel;
- toggle **Vertical / Horizontal**;
- botão/flyout **Cores**;
- botão/flyout **Exportar**;
- botão/flyout **Destacar**.

Toggle atual:

| Botão | Rota |
|---|---|
| Vertical | `/mapa-familiar` |
| Horizontal | `/mapa-familiar-horizontal` |

Regras desktop:

- o painel lateral desktop não deve gerar scroll vertical interno desnecessário;
- filtros devem permanecer legíveis;
- cards desligados usam opacidade/grayscale;
- se a altura útil ficar insuficiente, reduzir densidade por `clamp()` antes de reintroduzir scroll;
- não esconder filtros importantes para caber visualmente.

### 4.2 Painel mobile

No mobile:

- não há sidebar lateral;
- `HomeMobileNav` abre o painel inferior;
- painel inferior reaproveita `sidebarPanelContent`;
- altura máxima é limitada;
- conteúdo pode rolar internamente;
- overlay fecha o painel.

Rotas controladas pelo painel mobile do `HomeMobileNav`:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Nessas rotas, `MobileTreeControlsPortal` não renderiza seu painel antigo.

### 4.3 `MobileTreeControlsPortal`

`MobileTreeControlsPortal` continua registrando rotas de árvore para exportação e ações rápidas, mas retorna `null` quando o path é:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Motivo:

- evitar duplicidade;
- essas rotas usam botão superior e painel inferior do `HomeMobileNav`.

---

## 5. `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Cards atuais:

| Key | Label |
|---|---|
| `tataravos` | Tataravós |
| `bisavos` | Bisavós |
| `avos` | Avós |
| `pais` | Pais |
| `tios` | Tios |
| `primos` | Primos |
| `sobrinhos` | Sobrinhos |
| `irmaos` | Irmãos |
| `filhos` | Filhos |
| `netos` | Netos |
| `conjuge` | Cônjuges |
| `pets` | Pets |

Cuidados:

- o card **Cônjuges** não deve ser removido;
- o card **Pets** deve ser mantido, mas há pendência em `Home.tsx` quando `directRelativeFilters.pets` é forçado como `true`;
- `excludedKeys` existe como prop, mas o painel atual não deve esconder cônjuges por padrão.

---

## 6. Regras de Cônjuges

### 6.1 Regras gerais

Cônjuge não é apenas uma linha; pode gerar card visual.

Regra específica do Mapa Familiar:

- o filtro **Cônjuges** não oculta o cônjuge principal;
- o filtro **Cônjuges** não oculta cônjuges de tataravós, bisavós e avós;
- o filtro **Cônjuges** controla cônjuges colaterais/descendentes de:
  - tios;
  - primos;
  - sobrinhos;
  - filhos;
  - netos.

No Mapa Familiar Horizontal, a lógica atual usa:

```txt
ALWAYS_VISIBLE_SPOUSE_ANCHOR_GROUPS = ['avos', 'bisavos', 'tataravos']
FILTERABLE_SPOUSE_ANCHOR_GROUPS = ['tios', 'primos', 'sobrinhos', 'filhos', 'netos']
```

E sempre reinclui cônjuge da pessoa central.

### 6.2 Card visual de cônjuge

Quando uma pessoa é reincluída como cônjuge fora do escopo direto, ela entra em `spouseTonePersonIds` e recebe label/tom de **Cônjuge**.

---

## 7. Linhas ReactFlow

A seção **Linhas** controla `edgeFilters`.

| Botão | Estado afetado |
|---|---|
| Conjugal | `edgeFilters.conjugal` |
| Pais/filhos | `edgeFilters.filiacao_sangue` e `edgeFilters.filiacao_adotiva` |
| Irmãos | `edgeFilters.irmaos` |
| Todas | todos os `edgeFilters` |

Regras:

- ocultar linhas não deve ocultar cards;
- ocultar linhas não deve alterar dados;
- `Pais/filhos` trata sangue e adoção em conjunto no controle atual;
- se todos os `edgeFilters` forem desligados na Minha Árvore, CSS específico pode ocultar edges diretas.

---

## 8. Destaques

A seção **Destacar** controla `visualLineFilters`.

| Botão | Estado |
|---|---|
| Cônjuges | `spouseHighlight` |
| Pais/Filhos | `parentChildHighlight` |
| Irmãos | `siblingHighlight` |
| Todas | todos os destaques |

Regras:

- **Linhas** oculta os conectores visuais, sem ocultar ícones internos dos cards;
- destaque vence a cor normal da linha;
- destaque não reexibe linha oculta;
- destaque não altera cards;
- destaque não altera dados.

O controle **Restaurar visualização** redefine diretamente o zoom e a posição de rolagem iniciais nas views vertical e horizontal.

---

## 9. Conectores por view

### 9.1 Minha Árvore desktop/tablet

Sistema:

```txt
ReactFlow edges
```

Controlados por:

```txt
edgeFilters
visualLineFilters
```

### 9.2 Minha Árvore mobile

Sistema:

```txt
HTML/CSS
```

Características:

- conectores de Pai/Mãe para pessoa central;
- conectores para ancestrais;
- conectores laterais para tios/primos;
- devem acompanhar scroll da tela Central;
- não dependem diretamente de `edgeFilters` ReactFlow.

### 9.3 Mapa Familiar Vertical

Sistema:

```txt
SVG por âncoras internas de DesktopFamilyMapView
```

Características:

- conecta grupos visuais;
- conecta relações principais;
- pode ter conectores internos entre cônjuges;
- usa `FAMILY_MAP_LAYOUT`.

Cuidados:

- não tentar corrigir conectores verticais alterando ReactFlow;
- validar painel aberto/colapsado.

### 9.4 Mapa Familiar Horizontal

Sistema:

```txt
SVG próprio em DesktopFamilyHorizontalMapView
```

Regras implementadas:

1. cônjuges visíveis da mesma geração ficam adjacentes;
2. uma linha vertical conecta o centro inferior do card superior ao centro superior do card inferior;
3. do meio dessa linha sai uma linha horizontal até o gap entre colunas;
4. no gap há tronco vertical;
5. o tronco vai do primeiro ao último filho do casal;
6. cada filho recebe ramal horizontal;
7. os troncos são distribuídos no eixo X dentro do gap para evitar sobreposição;
8. filhos do casal são ordenados do mais velho ao mais novo;
9. se uma coluna estiver vazia, ela é ocultada e conectores são recalculados.

Não fazer:

- ocultar globalmente `svg.pointer-events-none`;
- remover `buildConnectors`;
- desenhar linhas pais/filhos fora do modelo casal → filhos;
- usar linhas de `/visao-completa` para a horizontal.

### 9.5 Genealogia e Visão Completa

Sistema:

```txt
ReactFlow + genealogyColumnsLayout
```

Características:

- `genealogySpouseEdge`;
- `genealogyFamilyConnectorNode`;
- cabeçalhos `GERAÇÃO N` com pílula escura;
- conectores entre pessoas visíveis.

---

## 10. Exportação

A aba **Ações** e o flyout **Exportar** disparam:

```txt
select-area
save-image
save-pdf
print
```

Regras:

- ReactFlow usa captura da área de grafo;
- `/mapa-familiar` usa captura HTML/CSS/SVG;
- `/mapa-familiar-horizontal` usa captura HTML/CSS/SVG;
- se seleção de área não estiver disponível em view HTML/CSS/SVG, a view pode exportar diretamente a superfície atual.

---

## 11. Anti-regressões

Não fazer:

- reintroduzir scroll vertical no painel lateral desktop sem decisão explícita;
- duplicar controle de legenda fora da aba **Legendas**;
- fazer aba **Ações** competir com botões do canvas;
- esconder filtros importantes para caber visualmente;
- misturar filtros de linha com filtros de cards;
- aplicar regra desktop ao painel inferior mobile sem validação;
- reintroduzir toggle **Vertical | Horizontal** no mobile;
- reativar `MobileTreeControlsPortal` em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- remover a lógica de cônjuges sempre visíveis;
- remover `Pets` do painel sem corrigir a lógica de filtro;
- confundir `/mapa-familiar-horizontal` com `/visao-completa`.

---

## 12. QA mínimo

Após alterações de painel, filtros ou conectores, validar:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore
/genealogia
/visao-completa
```

Casos:

- painel aberto;
- painel colapsado;
- mobile;
- paletas;
- filtros de grupos;
- filtro Cônjuges;
- filtro Pets;
- zoom;
- exportação;
- conectores casal → filhos;
- colunas vazias.
