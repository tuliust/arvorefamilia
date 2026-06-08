# Árvore - legendas, conectores, filtros e painel lateral

> Última revisão: 2026-06-08  
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Tipo: documentação funcional/técnica específica da árvore.

## 1. Função deste documento

Este documento consolida os controles visuais da árvore:

- aba **Legendas**;
- filtros de cards;
- filtros de linhas;
- destaques visuais;
- filtros de grupos diretos;
- filtros de gerações;
- conectores da Minha Árvore;
- conectores da Genealogia e Visão Completa;
- painel lateral desktop;
- painel inferior mobile;
- ações de exportação.

Não substitui:

| Tema | Documento |
|---|---|
| view direta | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
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
| `edgeFilters` | existência/visibilidade de linhas |
| `visualLineFilters` | destaque visual de linhas já visíveis |
| `personFilters` | visibilidade de cards por vivo/falecido/pet |
| `directRelativeFilters` | grupos da Minha Árvore |
| `genealogyFilters` | gerações/grupos da Genealogia e Visão Completa |

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

---

## 3. Estados principais

Os estados ficam em `src/app/pages/Home.tsx`.

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

- controlar linhas conjugais;
- controlar linhas parentais de filiação;
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
- afetar cards/contadores do escopo direto;
- não controlar linhas diretamente.

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

No desktop, a Home renderiza uma sidebar com três abas:

| Aba | Conteúdo |
|---|---|
| Filtros | `DirectRelationKpiGrid` ou `GenealogyFilterGrid` + `LifeStatusKpiGrid` |
| Legendas | `TreeLegend` |
| Ações | `SidebarInfoPanel` |

No mobile:

- não há sidebar lateral;
- `HomeMobileNav` abre o painel inferior;
- painel inferior reaproveita `sidebarPanelContent`;
- altura máxima é limitada;
- conteúdo rola internamente;
- overlay fecha o painel.

---

## 5. `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Props funcionais:

```txt
viewMode
compact
showTitle
personFilters
edgeFilters
directRelativeFilters
visualLineFilters
onTogglePersonFilter
onToggleEdgeFilter
onToggleAllEdgeFilters
onToggleParentChildFilter
onToggleDirectRelativeFilter
onToggleVisualLineFilter
onToggleAllVisualLineFilters
```

Blocos da legenda:

| Bloco | Controla |
|---|---|
| Cards | `personFilters` |
| Linhas | `edgeFilters` |
| Destacar | `visualLineFilters` |
| Cores dos grupos | `directRelativeFilters` apenas em `minha-arvore` |

Regras:

- itens interativos usam botão com `aria-pressed`;
- itens não interativos permanecem como legenda visual;
- a pessoa central é legenda, não filtro;
- cores dos grupos só são interativas quando `viewMode === 'minha-arvore'`.

---

## 6. Linhas

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
- `Pais/filhos` deve tratar sangue e adoção em conjunto no controle atual;
- se todos os `edgeFilters` forem desligados na Minha Árvore, CSS específico oculta edges diretas.

---

## 7. Destaques

A seção **Destacar** controla `visualLineFilters`.

| Botão | Estado |
|---|---|
| Cônjuges | `spouseHighlight` |
| Pais/Filhos | `parentChildHighlight` |
| Irmãos | `siblingHighlight` |
| Todas | todos os destaques |

Regras:

- destaque vence a cor normal da paleta em linhas visíveis;
- destaque não vence `edgeFilters`;
- destaque não deve alterar nodes;
- destaque não deve alterar contadores;
- CSS global não deve sobrescrever estilos de edge.

---

## 8. Conectores da Minha Árvore

Layout:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Linhas conceituais:

```txt
spouse
parentChild
sibling
auxiliary
```

Regras:

- `isDirectLineVisible` aplica `edgeFilters`;
- `getDirectLineStyle` aplica `visualLineFilters`;
- grupos ocultos por `directRelativeFilters` não devem gerar cards visíveis;
- linhas auxiliares estruturais podem permanecer quando necessárias;
- filhos humanos e pets devem ter separação semântica;
- cônjuge usa `MarriageNode` com modal conjugal.

---

## 9. Conectores da Genealogia e Visão Completa

Layout:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Elementos:

| Elemento | Função |
|---|---|
| `GenealogyFamilyConnectorNode` | bus de pais-filhos |
| `GenealogySpouseEdge` | vínculo conjugal e status |
| `directFamilyLabelNode` | label de geração |
| `personNode` | card da pessoa |

Regras:

- `edgeFilters.conjugal` controla spouse edges;
- `edgeFilters.filiacao_sangue`/`filiacao_adotiva` controlam conectores parentais;
- `visualLineFilters` só destaca edges visíveis;
- filtros de geração não devem deixar conectores órfãos;
- cônjuges devem manter espaçamento extra para o anel.

---

## 10. Botão/anel conjugal

Componente principal:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
```

Regras:

- o botão usa ícone `Blend`;
- deve ter `aria-label` e `title`;
- deve manter handles invisíveis do ReactFlow;
- deve abrir `ViewMarriageModal`;
- não é filtro;
- não altera relacionamento no banco;
- não deve ser substituído por emoji.

Em Genealogia/Visão Completa, a edge conjugal usa `GenealogySpouseEdge` e dados de `marriageStatus`.

---

## 11. Cores e tokens

Arquivos principais:

```txt
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/treeColorPalettes.ts
```

Regras:

- usar tokens antes de hardcodar cor;
- manter contraste entre cards, bordas e linhas;
- paletas `white`, `orange` e `brown` não devem quebrar legibilidade;
- status vivo/falecido/pet deve permanecer distinguível;
- destaque visual deve ser claro em todas as paletas.

---

## 12. Ações da árvore

A aba **Ações** usa `SidebarInfoPanel` e chama métodos expostos por `FamilyTreeActions`:

```txt
startAreaSelection
savePdf
saveImage
print
```

Regras:

- exportação deve capturar a área visível ou a área selecionada;
- seleção de área bloqueia pan/zoom temporariamente;
- envio por WhatsApp permanece futuro/pós-MVP;
- detalhes ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 13. QA mínimo

Validar após alteração:

- botão **Linhas > Conjugal** oculta/exibe linhas conjugais;
- botão **Linhas > Pais/filhos** oculta/exibe conectores parentais;
- botão **Linhas > Irmãos** não afeta cards;
- botão **Linhas > Todas** alterna todos os grupos de linhas;
- destaque de cônjuges só altera linhas visíveis;
- destaque de pais/filhos só altera linhas visíveis;
- destaque de irmãos só altera linhas visíveis;
- filtros de cards alteram vivos/falecidos/pets;
- filtros diretos alteram grupos na Minha Árvore;
- filtros de geração alteram Genealogia/Visão Completa;
- painel desktop abre/recolhe sem quebrar viewport;
- painel mobile abre/fecha e rola internamente;
- modal conjugal abre pelo anel;
- exportação ainda funciona.

---

## 14. Anti-regressões

Não fazer:

- usar destaque para reexibir linha oculta;
- misturar `edgeFilters` com `personFilters`;
- persistir filtros visuais no Supabase sem frente específica;
- criar migration para mudança visual;
- duplicar estado de filtros em outro componente;
- fazer `TreeLegend` alterar dados reais;
- quebrar acessibilidade de botões interativos;
- usar CSS global que sobrescreva todas as linhas com a mesma cor;
- remover `aria-pressed` dos controles;
- fazer a seção Aliança virar filtro sem nova decisão funcional.
