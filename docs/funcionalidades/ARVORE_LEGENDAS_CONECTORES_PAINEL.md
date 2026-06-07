# Arvore - legendas, conectores, filtros e painel lateral

> Ultima revisao: 2026-06-07
> Revisao complementar: destaques de linhas por cor, botao conjugal `Blend` cinza e anti-regressao de conectores.

> Local recomendado: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
> Tipo: documentacao funcional/tecnica especifica da arvore.

---

## 1. Objetivo

Este documento consolida as decisoes, regras e cuidados da visualizacao da arvore familiar no projeto `tuliust/arvorefamilia`, com foco em:

- aba **Legendas**;
- botoes de **Linhas**;
- botoes de **Destacar**;
- conectores da **Minha Arvore**;
- conectores da **Genealogia**;
- conectores da **Visao Completa**;
- comportamento visual de pets;
- painel lateral esquerdo;
- filtros visuais e filtros de grupos;
- correcoes de pan/scroll;
- riscos de regressao visual.

Este documento nao substitui:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

## 2. Regra central da frente

A regra central e separar claramente **existencia**, **destaque**, **cards** e **grupos**.

```txt
edgeFilters:
  controlam existencia/visibilidade de linhas.

visualLineFilters:
  controlam apenas destaque visual de linhas ja visiveis.

personFilters:
  controlam cards por status/tipo.

directRelativeFilters:
  controlam grupos de parentes na Minha Arvore.

genealogyFilters:
  controlam geracoes/grupos na Genealogia e na Visao Completa.
```

Regra obrigatoria:

```txt
Destaque nao cria linha nova.
Destaque nao reexibe linha oculta.
Destaque nao altera cards.
Destaque nao altera contadores.
```

---

## 3. Views da arvore

O projeto possui tres rotas principais da arvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 3.1 Minha Arvore

Layout principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Caracteristicas:

- foco na pessoa central;
- grupos diretos de parentes;
- cards coloridos por grupo;
- separacao visual entre filhos humanos e pets;
- conectores customizados entre grupos diretos;
- suporte ao modo de foco da pessoa central;
- filtros por grupos diretos.

Documentacao complementar:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

### 3.2 Genealogia

Layout principal:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Caracteristicas:

- organizacao por geracoes;
- conectores familiares por geracao;
- conjuges com edge propria;
- conectores de pais/filhos por `GenealogyFamilyConnectorNode`;
- anel conjugal via `GenealogySpouseEdge`;
- escopo pessoal.

---

### 3.3 Visao Completa

Tambem usa:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Caracteristicas:

- base familiar completa;
- organizacao por geracoes;
- mesma arquitetura visual da Genealogia;
- regras proprias de recorte/exibicao conforme o `viewMode`.

---

## 4. Estados principais

Os estados principais sao mantidos em:

```txt
src/app/pages/Home.tsx
```

### 4.1 `edgeFilters`

Controla exibicao/ocultacao de linhas.

```ts
{
  conjugal: boolean;
  filiacao_sangue: boolean;
  filiacao_adotiva: boolean;
  irmaos: boolean;
}
```

Uso esperado:

- `conjugal`: linhas conjugais/conjuges;
- `filiacao_sangue`: linhas de pais/filhos por filiacao sanguinea;
- `filiacao_adotiva`: linhas de pais/filhos por filiacao adotiva;
- `irmaos`: linhas ou trechos visuais relacionados a irmaos, quando a view suportar controle separado.

Nao deve:

- alterar cards;
- alterar contadores;
- alterar filtros de pessoa;
- mudar dados no Supabase.

---

### 4.2 `visualLineFilters`

Controla apenas destaque visual.

```ts
{
  spouseHighlight: boolean;
  parentChildHighlight: boolean;
  siblingHighlight: boolean;
}
```

Uso esperado:

- `spouseHighlight`: destacar linhas conjugais visiveis;
- `parentChildHighlight`: destacar linhas parentais/de filiacao visiveis;
- `siblingHighlight`: destacar linhas/trechos de irmaos visiveis.

Nao deve:

- criar novas edges;
- reexibir edge oculta por `edgeFilters`;
- afetar cards;
- afetar contadores;
- persistir estado no banco.

---

### 4.3 `personFilters`

Controla cards por status/tipo.

```ts
{
  vivos: boolean;
  falecidos: boolean;
  pets: boolean;
}
```

Regras:

- afeta cards renderizados;
- nao deve ser alterado por botoes de linhas;
- nao deve ser alterado por botoes de destaque;
- contadores devem continuar coerentes com o escopo da view.

---

### 4.4 `directRelativeFilters`

Controla grupos de parentes na Minha Arvore.

Exemplos:

```txt
tataravos
bisavos
avos
tios
pais
primos
conjuge
irmaos
filhos
sobrinhos
netos
pets
```

Regras:

- usado apenas na logica da Minha Arvore;
- oculta/exibe grupos de cards;
- nao deve ser confundido com `edgeFilters`;
- pode afetar contadores e cards exibidos.

---

### 4.5 `genealogyFilters`

Controla geracoes e grupos na Genealogia/Visao Completa.

Exemplos:

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

Regras:

- usado em views por geracao;
- deve preservar conectores apenas entre pessoas visiveis;
- deve evitar edges soltas apos filtro.

---

## 5. Aba Legendas

Componente principal:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

A aba **Legendas** possui blocos conceitualmente diferentes.

### 5.1 Cards

Exemplos:

```txt
Pessoa viva
Falecida
Pet
Central
```

Funcao:

- indicar estilo visual dos cards;
- quando interativos, controlar `personFilters`;
- nao controlar linhas;
- nao aplicar destaque em conectores.

---

### 5.2 Linhas

Exemplos:

```txt
Conjugal
Pais/filhos
Irmaos
Todas
```

Funcao:

- controlar `edgeFilters`;
- exibir/ocultar linhas controlaveis;
- nao alterar cards;
- nao alterar contadores;
- nao aplicar destaque visual.

Regras esperadas:

```txt
Conjugal:
  exibe/oculta linhas de conjuge/casal.

Pais/filhos:
  exibe/oculta linhas parentais/de filiacao.

Irmaos:
  exibe/oculta linhas ou trechos de irmaos quando a view suportar.

Todas:
  liga/desliga todos os edgeFilters controlaveis.
```

---

### 5.3 Destacar

Exemplos:

```txt
Todas
Conjuges
Pais/Filhos
Irmaos
```

Funcao:

- controlar `visualLineFilters`;
- destacar linhas visiveis;
- nunca recriar linha oculta;
- nao alterar cards;
- nao alterar contadores.

Regras esperadas:

```txt
Destaque Conjuges:
  destaca apenas linhas conjugais visiveis.

Destaque Pais/Filhos:
  destaca apenas linhas parentais/de filiacao visiveis.

Destaque Irmaos:
  destaca apenas linhas ou trechos de irmaos visiveis.

Destaque Todas:
  destaca todos os grupos de linhas visiveis.
```

Padrao visual consolidado:

| Controle de destaque | Cor/estilo esperado |
|---|---|
| `Conjuges` / `spouseHighlight` | laranja, linha solida, maior contraste |
| `Pais/Filhos` / `parentChildHighlight` | amarelo/dourado, linha solida, maior contraste |
| `Irmaos` / `siblingHighlight` | azul, linha tracejada, maior contraste |
| `Todas` | aplica os tres estilos acima apenas em linhas visiveis |

Regra de prioridade:

- destaque visual deve vencer a cor normal da paleta;
- linha oculta por `edgeFilters` continua oculta;
- `family-tree-visual-polish.css` nao deve sobrescrever os destaques com uma cor unica de borda/grupo;
- se houver conflito entre CSS global e estilo inline da edge, revisar seletores com `!important`.

---

### 5.4 Botao conjugal / alianca

Exemplos:

```txt
Casados
Divorcio
Viuvez
Uniao Estavel
```

Funcao atual:

- legenda visual;
- ponto de acesso ao modal conjugal quando renderizado como botao na arvore;
- nao filtra;
- nao destaca;
- nao altera arvore;
- nao altera relacao no banco.

Padrao visual consolidado no ciclo atual:

- icone `Blend` de `lucide-react`;
- estilo cinza/neutro nas tres views;
- nao usar emoji de alianca;
- manter botao clicavel e com `aria-label`/`title`;
- manter handles invisiveis e edges do ReactFlow.

Regra:

```txt
A secao Alianca nao deve virar filtro sem uma frente especifica.
```

Modal aberto pela alianca:

- titulo do header: **Relacionamento conjugal**;
- nao exibir subtitulo com os dois nomes no header;
- manter nomes completos abaixo dos avatares;
- headline narrativa usa primeiro nome, sem `+` entre pessoas;
- exemplos: **Nome1 e Nome2 sao casados.** ou **Nome1 e Nome2 foram casados.**

---

## 6. Classificacao de linhas na Minha Arvore

Na Minha Arvore, a classificacao conceitual adotada foi:

```ts
type DirectLineGroup = 'spouse' | 'parentChild' | 'sibling' | 'auxiliary';
```

### 6.1 `spouse`

Linhas conjugais.

Exemplos:

```txt
conjuge a central
conjuges ancestrais
pai a mae
```

### 6.2 `parentChild`

Linhas de filiacao/descendencia.

Exemplos:

```txt
pai/mae a pessoa central
central a filhos
conjuge a filhos
filhos a netos
irmaos a sobrinhos
pets
```

Observacoes:

- irmaos  sobrinhos e `parentChild`, porque sobrinhos sao filhos dos irmaos;
- pets ficam nesse grupo porque usam vinculo tecnico equivalente a `filho`.

### 6.3 `sibling`

Linhas entre irmaos.

Exemplos:

```txt
central a irmaos
pai/mae a tios, quando a linha representa relacao entre irmaos
conectores internos de irmaos reais dentro de grupos
```

### 6.4 `auxiliary`

Apenas conectores tecnicos indispensaveis.

Regra:

```txt
Se a linha parece visualmente representar conjuge, pais/filhos ou irmaos, ela nao deve ser auxiliary.
```

---

## 7. Correcoes consolidadas na Minha Arvore

Arquivo principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Foram ajustados:

- conectores conjugais;
- conectores parentais;
- conectores entre irmaos;
- conectores internos de grupos;
- conectores de pets;
- conectores de netos;
- conectores de sobrinhos;
- conectores de primos;
- conectores de tios;
- conectores de ancestrais.

Correcao relevante:

```txt
spouseHighlight nao deve ser aplicado indevidamente em linha de irmaos.
```

Decisao sobre pets:

```txt
Pets continuam separados dos filhos nos cards,
mas a linha de Pets e controlada por Pais/filhos, ou seja, parentChild.
```

### 7.1 Layout esparso da Minha Arvore

Em `/minha-arvore`, quando a pessoa central nao possui pais, ancestrais
ou grupos laterais visiveis, o layout direto pode usar composicao mais
compacta para grupos inferiores.

A compactacao e restrita a geometria:

- aproximar Conjuge, Pets, Filhos, Netos, Irmaos e Sobrinhos do card central;
- reduzir o bounds vertical usado no enquadramento inicial;
- preservar os mesmos cards, anchors e conectores estruturais;
- nao alterar `edgeFilters`, `visualLineFilters` ou `directRelativeFilters`.

Anti-regressao:

```txt
Se houver pai, mae, ancestrais, tios, primos ou grupos laterais visiveis,
usar o layout denso atual.
```

---

## 8. Genealogia e Visao Completa

Arquivos principais:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

### 8.1 Controle de linhas

A Genealogia e a Visao Completa devem respeitar:

```txt
Linhas > Conjugal
Linhas > Pais/filhos
Linhas > Irmaos
```

Comportamento:

```txt
Conjugal:
  oculta/exibe linhas conjugais e o botao conjugal quando a arquitetura da view o vincular a esse filtro.

Pais/filhos:
  oculta/exibe conectores familiares entre geracoes.

Irmaos:
  controla linhas/trechos de irmaos quando aplicavel.
```

---

### 8.2 Destaque visual

A secao **Destacar** atua apenas em linhas visiveis.

Regras:

```txt
Destaque nao cria linha nova.
Destaque nao exibe linha oculta.
Destaque nao altera cards.
Destaque nao altera contadores.
```

Cores/estilos esperados:

```txt
Conjuges -> laranja solido
Pais/filhos -> amarelo/dourado solido
Irmaos -> azul tracejado
Todas -> aplica os tres destaques simultaneamente
```

Arquivos que podem interferir:

```txt
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/styles/family-tree-visual-polish.css
```

Anti-regressao:

- o CSS global nao deve forcar todas as edges para `--tree-palette-group-border` quando houver destaque ativo;
- `GenealogyFamilyConnectorNode` deve aumentar stroke/opacidade quando `parentChildHighlight` ou `siblingHighlight` estiverem ativos;
- irmaos devem permanecer tracejados e azuis, inclusive nos conectores SVG internos.

---

### 8.3 Correcao de pan/scroll

Problema corrigido:

```txt
Em /genealogia e /visao-completa, ao tentar deslizar a arvore para baixo,
a view voltava automaticamente para cima.
```

Correcao consolidada:

```txt
O restore automatico do viewport no zoom minimo deve ser restrito a viewMode === 'minha-arvore'.
```

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

### 8.4 Correcao de handle do React Flow

Erro observado:

```txt
Couldn't create edge for target handle id: "sibling-left"
```

Diagnostico:

```txt
sibling-left existia como source handle, nao como target handle.
```

Correcao:

```ts
targetHandle: 'left-target'
```

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

---

## 9. Destaque de irmaos em Genealogia/Visao Completa

### 9.1 Problema

A Genealogia/Visao Completa estavam criando uma nova edge vertical para destacar irmaos.

Isso era incorreto porque o conector familiar ja possuia a linha vertical e os bracos horizontais necessarios.

### 9.2 Arquitetura correta

Componente responsavel:

```txt
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
```

Esse componente ja desenha:

```txt
linha pais/casal -> ramificacao
linha vertical da ramificacao
bracos horizontais ate cada filho/irmao
```

Portanto, o destaque de irmaos deve estilizar a ramificacao existente, nao criar uma edge nova.

### 9.3 Regra implementada

Em `GenealogyFamilyConnectorNode.tsx`, o node pode receber:

```ts
siblingHighlight: boolean;
```

Estilos separados:

```txt
parentChildStroke
parentChildStrokeWidth
siblingBranchStroke
siblingBranchStrokeWidth
siblingBranchStrokeDasharray
```

Quando `siblingHighlight === true`:

```txt
a linha vertical da ramificacao fica no estilo de irmaos;
os bracos horizontais ate cada irmao tambem ficam no estilo de irmaos.
```

Estilo esperado:

```txt
azul
tracejado
```

### 9.4 Remocao de edge duplicada

Nao recriar funcao equivalente a:

```txt
addGenealogySiblingEdges
```

Motivo:

```txt
A funcao criava uma segunda linha visual, duplicando a ramificacao ja existente.
```

### 9.5 Botao conjugal em Genealogia/Visao Completa

A Genealogia e a Visao Completa usam:

```txt
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Padrao consolidado:

- renderizar `Blend` de `lucide-react`;
- usar cor cinza/neutra;
- manter botao circular de `60px x 60px`;
- manter clique no modal de relacionamento conjugal;
- preservar `EdgeLabelRenderer`;
- nao usar emoji como conteudo visual principal;
- nao deixar o container cinza apagado se a decisao visual vigente for botao branco com borda cinza.

---

## 10. Painel lateral esquerdo

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/SidebarInfoPanel.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/TreeLegend.tsx
```

Objetivo:

- melhorar responsividade vertical das abas;
- evitar overflow externo fora do painel;
- permitir rolagem interna quando necessario;
- manter cards e textos legiveis em telas menores de desktop;
- preservar logica de filtros.

### 10.1 Problemas anteriores

- uso de `justify-between` espalhava grupos pela altura disponivel;
- cards de filtros tinham dimensoes fixas;
- alguns grupos ficavam altos demais em telas baixas;
- rolagem interna era insuficiente.

### 10.2 Regras atuais

Usar preferencialmente:

```txt
min-h-0
flex-1
overflow-y-auto
overflow-hidden no miolo quando necessario
clamp()
leading-tight
gaps adaptativos
```

Evitar:

```txt
justify-between para preencher altura
altura fixa excessiva
overflow externo global
fontes grandes demais em telas baixas
```

---

## 11. Regras de validacao manual

Apos alteracoes em arvore, validar:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 11.1 Aba Legendas

Validar **Linhas**:

```txt
Conjugal:
  linhas conjugais somem/voltam; cards permanecem.

Pais/filhos:
  linhas parentais somem/voltam; cards permanecem.

Irmaos:
  linhas ou trechos de irmaos somem/voltam quando a view suportar.

Todas:
  todas as linhas controlaveis somem/voltam.
```

Validar **Destacar**:

```txt
Conjuges:
  apenas linhas conjugais visiveis destacam.

Pais/Filhos:
  apenas linhas parentais visiveis destacam.

Irmaos:
  trechos de irmaos visiveis destacam em azul tracejado.

Todas:
  todas as linhas visiveis destacam, respeitando laranja para conjuges,
  amarelo/dourado para pais/filhos e azul tracejado para irmaos.
```

Regra obrigatoria:

```txt
Destaque nao recria linha oculta.
```

---

### 11.2 Aba Filtros

Validar:

```txt
cards nao desaparecem por alteracao de linhas;
contadores nao mudam por destaque;
Vivos/Falecidos/Pets continuam funcionando;
filtros de grupos continuam funcionando;
modo foco da pessoa central continua funcionando;
Pets continuam separados nos cards.
```

---

### 11.3 Genealogia/Visao Completa

Validar:

```txt
scroll/pan vertical nao volta sozinho ao topo;
console sem erro sibling-left;
destaque de irmaos nao cria linha duplicada;
ramificacao existente fica azul e tracejada;
linha pais/casal -> ramificacao mantem estilo de pais/filhos.
```

---

### 11.4 Painel lateral

Validar:

```txt
Filtros:
  cards compactos e adaptativos;
  Vivos/Falecidos/Pets no rodape;
  rolagem interna se necessario.

Legendas:
  sem espacamento artificial por justify-between;
  rolagem interna se necessario;
  cards e textos compactos em telas baixas.

Acoes:
  botoes proporcionais;
  rolagem interna se necessario.
```

---

## 12. Arquivos envolvidos

### Arvore e conectores

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

### Home e painel lateral

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/SidebarInfoPanel.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
```

---

## 13. Riscos e cuidados futuros

### 13.1 Nao misturar estados

Evitar confundir:

```txt
edgeFilters:
  existencia/visibilidade de linhas.

visualLineFilters:
  estilo/destaque de linhas existentes.

personFilters:
  visibilidade de cards por status.

directRelativeFilters:
  grupos de parentes na Minha Arvore.

genealogyFilters:
  geracoes/grupos na Genealogia.
```

### 13.2 Nao recriar linha oculta por destaque

Sequencia correta:

```txt
1. decidir se linha existe;
2. se existir, decidir estilo;
3. se nao existir, destaque nao faz nada.
```

### 13.3 Cuidado com conectores estruturais

Nem toda linha e uma relacao familiar explicita, mas se visualmente parece representar uma relacao, deve ser classificada corretamente.

Nao usar `auxiliary` para linhas percebidas pelo usuario como:

```txt
conjuge
pais/filhos
irmaos
```

### 13.4 Genealogia usa arquitetura propria

Nao aplicar automaticamente solucoes da Minha Arvore em:

```txt
genealogyColumnsLayout.ts
GenealogyFamilyConnectorNode.tsx
GenealogySpouseEdge.tsx
```

Genealogia e Visao Completa compartilham arquitetura, mas diferem da Minha Arvore.

---

## 14. QA tecnico

Apos alteracoes relevantes, rodar:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Para debug visual:

```bash
git status --short
git diff --stat
git diff -- src/app/components/FamilyTree
git diff -- src/app/pages/Home.tsx
```

---

## 15. Pos-MVP

Possiveis evolucoes:

- legenda configuravel por admin;
- presets de visualizacao da arvore;
- filtros salvos por usuario;
- controle persistido de preferencias visuais;
- legenda contextual por view;
- modo apresentacao;
- exportacao com legenda embutida;
- documentacao visual com imagens de exemplo.

Esses itens nao bloqueiam o MVP.

---
### 15.1 Nota de sincronizacao documental - Calendario Familiar

Este documento permanece focado em arvore, legendas, conectores e painel lateral. Quando houver ajustes compartilhados de UX em paginas de membro, revisar tambem:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Regra relacionada ao ciclo atual:

- ajustes de microcopy do `/calendario-familiar`, como falecimentos no grid e no card **Dias de falecimento**, nao devem alterar filtros, conectores, legendas ou layouts da arvore.

---
## 16. Ajustes recentes e anti-regressao - ciclo 2026-05-30

### 16.1 `Legendas > Linhas > Todas`

Comportamento consolidado:

```txt
Ao clicar em Todas, todas as linhas controlaveis devem sumir.
```

Isso inclui obrigatoriamente:

- linhas conjugais;
- linhas de pais/filhos;
- linhas de irmaos;
- linhas entre primos;
- linhas horizontais e verticais que conectam cards de primos;
- conectores estruturais que visualmente representam relacao familiar.

A correcao desta frente foi necessaria porque as linhas entre primos permaneciam visiveis mesmo com **Todas** desativado.

### 16.2 Regra tecnica para linhas de primos

Linhas de primos nao devem ser tratadas como puramente auxiliares se, para o usuario, representam relacao de irmaos/colaterais.

Regra:

```txt
Se a linha e percebida como conector familiar, ela precisa respeitar edgeFilters.
```

Classificacao recomendada:

```txt
linhas entre primos -> sibling ou parentChild, conforme origem estrutural
linhas tecnicas invisiveis -> auxiliary apenas quando nao forem percebidas como relacao
```

### 16.3 Checklist especifico de linhas

Validar em `/minha-arvore`:

```txt
Legendas > Linhas > Todas desligado -> nenhuma linha visivel
Primos paternos -> sem conectores horizontais/verticais
Primos maternos -> sem conectores horizontais/verticais
Pais/filhos ligado isoladamente -> apenas linhas parentais
Irmaos ligado isoladamente -> apenas linhas de irmaos/colaterais suportadas
Conjugal ligado isoladamente -> apenas linhas conjugais
Destacar Todas -> destaca apenas linhas que continuam visiveis
```

Validar tambem:

```txt
/genealogia
/visao-completa
```

Nessas views, o destaque de irmaos deve estilizar ramificacao existente, nao criar edge duplicada.

### 16.4 Relacao com cards

Filtros de linhas nao devem:

- ocultar cards;
- alterar contadores;
- alterar filtros de vivos/falecidos/pets;
- alterar grupos laterais;
- persistir preferencias no banco sem frente especifica.

### 16.5 Relacao com documentacao da view

Quando este arquivo for atualizado por linhas/conectores, revisar tambem:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
```

Principalmente se a alteracao impactar:

- largura dos cards;
- espacamento dos grupos;
- conectores entre grupos;
- pan/zoom;
- camadas de header ou legenda.

---

## Atualizacao 2026-06-06 - Paletas visuais

A arvore passou a suportar paletas visuais globais selecionaveis no controle de visualizacao da Home.

Paletas disponiveis:

| Paleta | Origem | Uso |
|---|---|---|
| `white` | `main` | visual padrao |
| `orange` | `polish/layout-components-main` | variacao laranja/polish |
| `brown` | `redesign/suafamilia-tree-style` | variacao marrom/premium |

Regra funcional:

```txt
Paleta visual nao e filtro.
Paleta visual nao altera cards visiveis.
Paleta visual nao altera edgeFilters.
Paleta visual nao altera visualLineFilters.
Paleta visual nao altera directRelativeFilters.
Paleta visual nao altera genealogyFilters.
Paleta visual nao altera dados no Supabase.
```

A paleta atua apenas sobre tokens visuais via CSS variables, incluindo:

- fundos de cards;
- bordas de cards;
- texto primario/secundario;
- status vivo/falecido;
- linhas/conectores;
- fundo e borda dos containers de grupo;
- fundo da legenda;
- fundo/canvas da arvore.

O botao conjugal permanece funcional, foi padronizado em `60px x 60px`, usa `Blend` de `lucide-react` e deve permanecer em cinza/neutro salvo nova decisao visual.


---

## 17. Atualizacao 2026-06-07 - Destaques e icones vetoriais

Ajustes consolidados no ciclo atual:

- emojis de data nos cards de pessoa foram substituidos por `Star` e `Cross` de `lucide-react`;
- botao conjugal passou a usar `Blend` de `lucide-react`;
- estilo final do botao conjugal nas tres views: cinza/neutro;
- destaques de linhas foram reforcados para ficarem perceptiveis nas paletas `white`, `orange` e `brown`;
- a cor de destaque de irmaos foi consolidada como azul tracejado;
- conectores SVG internos de `GenealogyFamilyConnectorNode` devem aumentar stroke/opacidade quando destacados.

Arquivos principais:

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/family-tree-visual-polish.css
```

Checklist anti-regressao:

```txt
/minha-arvore -> Blend cinza no botao conjugal
/genealogia -> Blend cinza no botao conjugal
/visao-completa -> Blend cinza no botao conjugal
Destacar Conjuges -> laranja
Destacar Pais/Filhos -> amarelo/dourado
Destacar Irmaos -> azul tracejado
Destacar Todas -> aplica os tres estilos sem recriar linhas ocultas
```
