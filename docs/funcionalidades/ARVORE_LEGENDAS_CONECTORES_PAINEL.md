# Árvore - legendas, conectores, filtros e painel lateral

> Última revisão: 2026-06-10  
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Tipo: documentação funcional/técnica específica da árvore.  
> Status: atualizado com a malha mobile 3×3, Mapa Familiar, filtros, conectores ReactFlow, conectores HTML/CSS mobile e conectores SVG do Mapa Familiar.

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
- conectores SVG do Mapa Familiar;
- conectores internos entre cônjuges;
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
| `directRelativeFilters` | grupos da Minha Árvore e Mapa Familiar |
| `genealogyFilters` | gerações/grupos da Genealogia e Visão Completa |

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

Importante:

- conectores ReactFlow, conectores HTML/CSS mobile e conectores SVG do Mapa Familiar são sistemas diferentes;
- não corrigir um sistema assumindo que os outros usam a mesma lógica;
- filtros de linhas ReactFlow não comandam diretamente conectores HTML/CSS mobile;
- filtros de linhas ReactFlow não comandam diretamente conectores SVG do Mapa Familiar, salvo quando a view explicitamente mapear essa regra.

---

## 3. Estados principais

Os estados ficam em `src/app/pages/Home.tsx` e componentes filhos.

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
- controlar grupos visuais do Mapa Familiar, com regras próprias;
- afetar cards/contadores do escopo direto;
- não controlar linhas diretamente.

Regra de rótulo:

```txt
conjuge deve aparecer no painel como Cônjuges.
```

Regra específica do Mapa Familiar:

- o filtro **Cônjuges** não oculta o cônjuge principal;
- o filtro **Cônjuges** não oculta cônjuges de tataravós, bisavós e avós;
- o filtro **Cônjuges** controla apenas cônjuges colaterais de tios, primos, sobrinhos, filhos e netos.

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
- botões da aba **Ações** devem manter altura e espaçamento vertical consistente;
- a remoção de scroll não deve cortar conteúdo em alturas comuns de notebook;
- se a altura útil ficar insuficiente, reduzir densidade por `clamp()` antes de reintroduzir scroll.

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
| Cores dos grupos | `directRelativeFilters` quando aplicável |

Regras:

- itens interativos usam botão com `aria-pressed`;
- itens não interativos permanecem como legenda visual;
- a pessoa central é legenda, não filtro;
- cores dos grupos são interativas no escopo direto quando a view suporta filtros diretos;
- no Mapa Familiar, o rótulo do filtro deve ser **Cônjuges**.

---

## 6. Linhas ReactFlow

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
- se todos os `edgeFilters` forem desligados na Minha Árvore, CSS específico pode ocultar edges diretas.

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

## 8. Conectores da Minha Árvore ReactFlow

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

- cards compactos de relação direta na `/minha-arvore` usam largura visual definida pela view direta quando aplicável;
- nomes em cards compactos devem quebrar linha quando necessário, sem reticências indevidas;
- linhas de tios/primos devem continuar conectando bordas/anchors atuais após aumento visual dos cards;
- `isDirectLineVisible` aplica `edgeFilters`;
- `getDirectLineStyle` aplica `visualLineFilters`;
- grupos ocultos por `directRelativeFilters` não devem gerar cards visíveis;
- linhas auxiliares estruturais podem permanecer quando necessárias;
- filhos humanos e pets devem ter separação semântica;
- cônjuge usa `MarriageNode` com modal conjugal.

---

## 9. Conectores no layout mobile segmentado

O layout mobile segmentado da `/minha-arvore` usa conectores próprios de HTML/CSS em:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Esses conectores não são edges ReactFlow.

### 9.1 Estado atual esperado

| Área/tela | Conectores esperados | Observação |
|---|---|---|
| Ancestrais globais | Tataravós → Bisavós → Avós, por ramo | Tela superior em duas colunas. |
| Avós → Pai/Mãe | Avós paternos → Pai; Avós maternos → Mãe | Conexões descem visualmente até a tela Central. |
| Pai/Mãe → Tios | Pai conecta a Tios Paternos; Mãe conecta a Tios Maternos | Linhas laterais acompanham o scroll da tela Central. |
| Tios → Primos | Tios Paternos → Primos Paternos; Tios Maternos → Primos Maternos | Tios são intermediários do ramo. |
| Primos | Apenas linha superior | Não deve haver linha inferior. |
| Tela Central | Linhas internas entre Pai/Mãe, pessoa central e grupos diretos | HTML/CSS, não ReactFlow. |

### 9.2 Regras

- não deve haver linha inferior abaixo de grupos de primos;
- tios continuam sendo o grupo intermediário entre ancestrais e primos;
- conectores HTML/CSS devem ficar visualmente atrás dos containers/cards quando houver sobreposição;
- cards/containers precisam mascarar linhas internas com fundo opaco, `relative z-*` e `overflow` controlado;
- linhas estruturais não devem ficar fixas no viewport quando o card relacionado rola;
- `edgeFilters` e `visualLineFilters` continuam válidos para ReactFlow; não comandam diretamente esses conectores HTML/CSS;
- conectores não devem criar `overflow-x`.

### 9.3 QA obrigatório

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

## 10. Conectores do Mapa Familiar

A view `DesktopFamilyMapView.tsx` usa overlay SVG absoluto atrás dos cards compartilhados de `FamilyTreeVisualCards.tsx`.

Esses conectores não são edges ReactFlow.

Documento canônico:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

### 10.1 Conectores principais

Conexões cobertas:

- tataravós → bisavós → avós em cada ramo;
- avós paternos → pai;
- avós paternos → tios paternos;
- avós maternos → mãe;
- avós maternos → tios maternos;
- pai/mãe → pessoa central;
- tios → primos;
- pessoa central → ramos inferiores;
- irmãos → sobrinhos;
- cônjuge principal → filhos/pets/netos quando aplicável;
- filhos → netos quando aplicável.

Regras:

- conectores principais usam cor clara;
- conectores principais são calculados por âncoras de grupos;
- origem e destino precisam existir após filtros;
- não desenhar linha para grupo inexistente;
- linhas principais não devem ser escurecidas para resolver conectores internos.

### 10.2 Conectores internos de cônjuges

Dentro de `VisualGroup`, os pares conjugais podem receber conector interno.

Regras:

- conector interno deve ser mais escuro que as linhas principais;
- só deve conectar relacionamentos conjugais explícitos;
- não usar proximidade visual para inferir cônjuge;
- se não houver relação segura, não desenhar linha;
- casais devem ficar juntos quando possível;
- espaçadores invisíveis podem ser usados para evitar quebra do par no fim da linha.

Exemplos de anti-regressão:

```txt
Enildes Barros não deve conectar com Absalon Limeira se o cônjuge correto for Marcos Alfredo.
Márcia Tereza não deve conectar com Maria Acileide se o cônjuge correto for Mário Assis.
```

### 10.3 Filtro Cônjuges no Mapa Familiar

Regra específica:

| Cônjuge | Estado inicial |
|---|---|
| Cônjuge da pessoa central | visível |
| Cônjuges de tataravós, bisavós e avós | visíveis |
| Cônjuges de tios, primos, sobrinhos, filhos e netos | ocultos até ativar filtro **Cônjuges** |

O filtro **Cônjuges** não deve ocultar o cônjuge principal nem cônjuges ancestrais.

---

## 11. Conectores da Genealogia e Visão Completa

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

## 12. Botão/anel conjugal ReactFlow

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
- não usar cor fixa laranja ou marrom quando a paleta define outro token de conector.

---

## 13. Cores e tokens

Arquivos principais:

```txt
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/treeColorPalettes.ts
```

Regras:

- usar tokens antes de hardcodar cor;
- manter contraste entre cards, bordas e linhas;
- paletas `white`, `orange`, `brown` e `visual` não devem quebrar legibilidade;
- status vivo/falecido/pet deve permanecer distinguível;
- destaque visual deve ser claro em todas as paletas.

### 13.1 Mapa Familiar

Regras visuais específicas do Mapa Familiar:

- linhas principais entre grupos usam cor clara;
- linhas internas entre cônjuges usam cor mais escura;
- pílulas dos grupos usam cinza azulado médio;
- fundo do título e fundo da árvore usam azul claro unificado;
- cards comuns usam tom esverdeado/azulado;
- pets mantêm ícone de pet;
- avatares de pessoa seguem `genero`.

---

## 14. Ações da árvore

A aba **Ações** usa `SidebarInfoPanel` e chama métodos expostos por `FamilyTreeActions`.

Métodos expostos:

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
- botão de favoritar da página deve manter comportamento de favoritar/desfavoritar rota sem duplicidade no header;
- detalhes ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Observação:

- Mapa Familiar não é ReactFlow; exportação dessa view deve ser tratada separadamente, se implementada.

---

## 15. QA mínimo

Validar após alteração:

- botão **Linhas > Conjugal** oculta/exibe linhas conjugais ReactFlow;
- botão **Linhas > Pais/filhos** oculta/exibe conectores parentais ReactFlow;
- botão **Linhas > Irmãos** não afeta cards;
- botão **Linhas > Todas** alterna todos os grupos de linhas ReactFlow;
- destaque de cônjuges só altera linhas visíveis;
- destaque de pais/filhos só altera linhas visíveis;
- destaque de irmãos só altera linhas visíveis;
- filtros de cards alteram vivos/falecidos/pets;
- filtros diretos alteram grupos na Minha Árvore;
- filtros diretos alteram grupos no Mapa Familiar conforme política própria;
- filtros de geração alteram Genealogia/Visão Completa;
- painel desktop abre/recolhe sem quebrar viewport;
- painel desktop não cria scroll vertical interno;
- painel mobile abre/fecha e rola internamente;
- modal conjugal abre pelo anel;
- aliança e borda do anel acompanham a cor dos conectores em todas as paletas;
- botão de favoritar aparece próximo ao zoom no desktop e não fica duplicado no header;
- exportação ainda funciona nas views suportadas;
- mobile segmentado da Minha Árvore não gera rolagem horizontal;
- Mapa Familiar não conecta cônjuges errados;
- Mapa Familiar mantém conectores principais claros e conectores internos mais escuros.

---

## 16. Anti-regressões

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
- voltar a truncar nomes com `...` em cards compactos quando houver espaço para quebra;
- aplicar regras de edges ReactFlow aos conectores HTML/CSS do `MobileFamilyTreeView.tsx`;
- aplicar regras de edges ReactFlow aos conectores SVG do `DesktopFamilyMapView.tsx`;
- corrigir linha solta apenas escondendo overflow global sem validar se a linha estrutural continua visível;
- deixar conectores mobile gerarem rolagem horizontal;
- deixar conectores internos de cônjuge ligarem pares errados;
- ocultar cônjuge principal pelo filtro **Cônjuges**;
- ocultar cônjuges ancestrais pelo filtro **Cônjuges**.
