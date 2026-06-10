# Árvore - legendas, conectores, filtros e painel lateral

> Última revisão: 2026-06-10
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
> Tipo: documentação funcional/técnica específica da árvore.
> Status: atualizado com a malha mobile 3×3, abas Paterno/Central/Materno, conectores HTML/CSS e preview de swipe.

## 1. Função deste documento

Este documento consolida os controles visuais da árvore:

- aba **Legendas**;
- filtros de cards;
- filtros de linhas;
- destaques visuais;
- filtros de grupos diretos;
- filtros de gerações;
- conectores da Minha Árvore;
- conectores HTML/CSS do layout mobile segmentado;
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

## Nota de verificação contra o código atual

Esta revisão consolida os ajustes implementados neste ciclo da `/minha-arvore` mobile e substitui a documentação anterior, que ainda descrevia o fluxo antigo de sete telas e abas `Núcleo`/`Completa`.

Estado confirmado/esperado da frente atual:

- `HomeTreeSection.tsx` continua renderizando `MobileFamilyTreeView` somente em mobile e somente quando `treeViewMode === 'minha-arvore'`.
- `MobileFamilyTreeView.tsx` mantém a experiência mobile separada de `FamilyTree`/ReactFlow; desktop/tablet continuam usando o layout ReactFlow da Minha Árvore.
- As abas superiores internas do mobile são apenas **Paterno**, **Central** e **Materno**; a antiga aba **Completa** não deve reaparecer.
- A navegação mobile usa uma malha 3×3 de telas: **Ancestrais globais** acima da tela **Central**, **Tios Paternos** à esquerda, **Tios Maternos** à direita, **Primos Paternos** abaixo dos tios paternos e **Primos Maternos** abaixo dos tios maternos.
- A tela **Ancestrais globais** reúne os ramos paterno e materno em duas colunas, com grupos de **Tataravós**, **Bisavós** e **Avós** quando houver pessoas.
- Os grupos de ancestrais não usam mais o container externo único `Ancestrais Paternos/Maternos` do fluxo antigo.
- Tios usam cards compactos em grupo ampliado; primos exibem todos os cards disponíveis e usam rolagem vertical quando a altura útil não comporta todos.
- Os conectores HTML/CSS do mobile são independentes dos edges ReactFlow e incluem conexões entre avós/bisavós/tataravós, avós → pai/mãe, pai/mãe → tios e tios → primos.
- As linhas laterais de Pai e Mãe ficam no mesmo contexto rolável dos cards, para acompanhar o movimento vertical da tela Central.
- Primos são fim de ramo: não deve haver linha inferior abaixo dos grupos de primos.
- O swipe direcional mantém a navegação entre telas e recebeu pré-visualização da próxima tela durante o gesto por deslocamento temporário da malha.

Regra documental desta revisão:

```txt
Documentar como implementado apenas o que pertence ao MobileFamilyTreeView atual; intenções futuras devem permanecer como backlog explícito.
```

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


### 2.1 Atualizações consolidadas em 2026-06-09

A experiência da árvore passou a considerar os seguintes padrões visuais recentes:

- o painel lateral desktop não deve ter scroll vertical interno;
- abas **Filtros**, **Legendas** e **Ações** devem usar mais respiro vertical;
- títulos e subtítulos do painel lateral são maiores do que o padrão compacto anterior;
- cards/botões do painel lateral têm altura maior e espaçamento mais confortável;
- o botão de favoritar da página da árvore fica na área do canvas, junto aos controles de zoom, e não duplicado no header desktop;
- ícones/aneis de aliança devem acompanhar a cor do conector conjugal conforme a paleta ativa;
- cards compactos da `/minha-arvore` foram ampliados visualmente para 360px e devem permitir quebra de linha nos nomes, evitando reticências indevidas.

Essas regras devem ser tratadas como estado atual da UI, não como experimento visual.

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

### 4.1 Regras desktop

Regras consolidadas:

- o painel lateral desktop não deve gerar scroll vertical interno;
- o conteúdo deve usar a extensão vertical disponível com respiro entre título, subtítulo, cards e botões;
- títulos das abas devem ser maiores que o padrão anterior de texto compacto;
- subtítulos devem ter tamanho legível e espaçamento inferior suficiente antes dos cards;
- cards de filtros e KPIs podem ter altura maior para melhorar leitura;
- botões da aba **Ações** devem manter altura confortável e espaçamento vertical consistente;
- a remoção de scroll não deve cortar conteúdo em alturas comuns de notebook;
- se a altura útil ficar insuficiente, reduzir densidade por `clamp()` antes de reintroduzir scroll.

Componentes afetados:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/pages/home/SidebarInfoPanel.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/styles/family-tree-visual-polish.css
```

### 4.2 Regras mobile

No mobile:

- não há sidebar lateral;
- `HomeMobileNav` abre o painel inferior;
- painel inferior reaproveita `sidebarPanelContent`;
- altura máxima é limitada;
- conteúdo pode rolar internamente;
- overlay fecha o painel;
- chips de geração e painel de controles da árvore têm prioridade visual sobre abas laterais.

### 4.3 Anti-regressões do painel

Não fazer:

- reintroduzir scroll vertical no painel lateral desktop sem decisão explícita;
- duplicar controle de legenda fora da aba **Legendas**;
- fazer a aba **Ações** competir com botões do canvas;
- esconder filtros importantes para caber visualmente;
- misturar filtros de linha com filtros de cards;
- aplicar regra desktop ao painel inferior mobile sem validação.

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

- cards compactos de relação direta na `/minha-arvore` usam largura visual atual de 360px quando aplicável;
- nomes em cards compactos devem quebrar linha quando necessário, sem reticências indevidas;
- linhas de tios/primos devem continuar conectando bordas/anchors atuais após aumento visual dos cards;
- cards do lado direito podem crescer em direção ao centro para evitar expansão para fora da tela;
- `isDirectLineVisible` aplica `edgeFilters`;
- `getDirectLineStyle` aplica `visualLineFilters`;
- grupos ocultos por `directRelativeFilters` não devem gerar cards visíveis;
- linhas auxiliares estruturais podem permanecer quando necessárias;
- filhos humanos e pets devem ter separação semântica;
- cônjuge usa `MarriageNode` com modal conjugal.

---


### 8.1 Conectores no layout mobile segmentado

O layout mobile segmentado da `/minha-arvore` usa conectores próprios de HTML/CSS em:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Esses conectores não são edges ReactFlow e não devem ser tratados como `spouseEdge`, `childEdge`, `siblingEdge` ou `auxiliary`.

#### Estado atual confirmado

| Área/tela | Conectores esperados | Observação |
|---|---|---|
| Ancestrais globais | Tataravós → Bisavós → Avós, por ramo | Tela superior em duas colunas: paterno à esquerda, materno à direita. |
| Avós → Pai/Mãe | Avós paternos → Pai; Avós maternos → Mãe | Conexões descem visualmente até a tela Central. |
| Pai/Mãe → Tios | Pai conecta lateralmente a Tios Paternos; Mãe conecta lateralmente a Tios Maternos | As linhas laterais acompanham o scroll da tela Central. |
| Tios → Primos | Tios Paternos → Primos Paternos; Tios Maternos → Primos Maternos | Tios são o grupo intermediário do ramo. |
| Primos | Apenas linha superior | Não deve haver linha inferior abaixo dos primos. |
| Tela Central | Linhas internas entre Pai/Mãe, pessoa central e grupos diretos | Linhas manuais em HTML/CSS, não ReactFlow. |

#### Regras consolidadas

- não deve haver linha inferior abaixo de grupos de primos;
- tios continuam sendo o grupo intermediário entre ancestrais e primos;
- conectores HTML/CSS devem ficar visualmente atrás dos containers/cards quando houver sobreposição;
- cards/containers precisam mascarar linhas internas com fundo opaco, `relative z-*` e `overflow` controlado;
- linhas estruturais não devem ficar fixas no viewport quando o card relacionado rola; elas devem acompanhar o contexto visual do card;
- ajustes de conectores mobile devem ser testados sem usar lógica de edges ReactFlow;
- `edgeFilters` e `visualLineFilters` continuam válidos para ReactFlow; não comandam diretamente esses conectores HTML/CSS;
- conectores não devem criar `overflow-x`.

#### QA obrigatório

```txt
320px
375px
390px
430px
```

Validar:

- avós paternos conectados ao Pai;
- avós maternos conectados à Mãe;
- tataravós, bisavós e avós conectados dentro de cada ramo;
- Pai conectado a Tios Paternos;
- Mãe conectada a Tios Maternos;
- tios conectados a primos;
- ausência de linha inferior em primos;
- ausência de linha atravessando fundo de cards/containers;
- ausência de scroll horizontal.


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
- não deve ser substituído por emoji;
- ícone de aliança e borda/anel devem acompanhar a cor do conector conjugal da paleta ativa;
- não usar cor fixa laranja ou marrom quando a paleta define outro token de conector;
- em Genealogia/Visão Completa, a edge conjugal usa `GenealogySpouseEdge` e dados de `marriageStatus`.

Regra de paleta:

```txt
A aliança e sua borda devem seguir a mesma família visual das linhas/conectores.
```

Anti-regressão:

- alternar paleta `white`, `orange` e `brown` deve alterar linhas e anéis de forma coerente;
- a cor do anel não deve ficar presa ao modo anterior após troca de paleta;
- a aliança não deve virar controle de filtro.

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

A aba **Ações** usa `SidebarInfoPanel` e chama métodos expostos por `FamilyTreeActions`.

O botão de favoritar da página da árvore não pertence mais ao header desktop nessa experiência: ele deve ficar dentro da área do canvas, próximo aos controles de zoom `+` e `-`, usando `PageFavoriteButton`.

Métodos expostos por `FamilyTreeActions`:

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
- o favorito da página deve manter comportamento de favoritar/desfavoritar rota sem duplicidade no header;
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
- painel desktop não cria scroll vertical interno;
- títulos/subtítulos/cards do painel lateral têm respiro suficiente;
- painel mobile abre/fecha e rola internamente;
- modal conjugal abre pelo anel;
- aliança e borda do anel acompanham a cor dos conectores em todas as paletas;
- botão de favoritar aparece próximo ao zoom no desktop e não fica duplicado no header;
- exportação ainda funciona.
- mobile segmentado da Minha Árvore: conectores estruturais chegam às extremidades da viewport sem criar rolagem horizontal;
- mobile segmentado da Minha Árvore: não há linha horizontal solta ou sobra lateral no topo/lado dos containers;
- mobile segmentado da Minha Árvore: conectores ficam atrás dos containers/cards quando necessário.

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
- fazer a seção Aliança virar filtro sem nova decisão funcional;
- fixar cor de aliança/conector fora dos tokens de paleta;
- reintroduzir scroll vertical no painel lateral desktop;
- voltar a truncar nomes com `...` em cards compactos da Minha Árvore quando houver espaço para quebra de linha;
- aplicar regras de edges ReactFlow aos conectores HTML/CSS do `MobileFamilyTreeView.tsx`;
- corrigir linha solta apenas escondendo overflow global sem validar se a linha estrutural continua visível;
- deixar conectores mobile gerarem rolagem horizontal.
