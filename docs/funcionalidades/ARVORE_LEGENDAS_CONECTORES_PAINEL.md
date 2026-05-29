# Árvore — legendas, conectores, filtros e painel lateral

> Local recomendado: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`  
> Tipo: documentação funcional/técnica específica da árvore.

---

## 1. Objetivo

Este documento consolida as decisões, regras e cuidados da visualização da árvore familiar no projeto `tuliust/arvorefamilia`, com foco em:

- aba **Legendas**;
- botões de **Linhas**;
- botões de **Destacar**;
- conectores da **Minha Árvore**;
- conectores da **Genealogia**;
- conectores da **Visão Completa**;
- comportamento visual de pets;
- painel lateral esquerdo;
- filtros visuais e filtros de grupos;
- correções de pan/scroll;
- riscos de regressão visual.

Este documento não substitui:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 2. Regra central da frente

A regra central é separar claramente **existência**, **destaque**, **cards** e **grupos**.

```txt
edgeFilters:
  controlam existência/visibilidade de linhas.

visualLineFilters:
  controlam apenas destaque visual de linhas já visíveis.

personFilters:
  controlam cards por status/tipo.

directRelativeFilters:
  controlam grupos de parentes na Minha Árvore.

genealogyFilters:
  controlam gerações/grupos na Genealogia e na Visão Completa.
```

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

---

## 3. Views da árvore

O projeto possui três rotas principais da árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 3.1 Minha Árvore

Layout principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Características:

- foco na pessoa central;
- grupos diretos de parentes;
- cards coloridos por grupo;
- separação visual entre filhos humanos e pets;
- conectores customizados entre grupos diretos;
- suporte ao modo de foco da pessoa central;
- filtros por grupos diretos.

Documentação complementar:

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

Características:

- organização por gerações;
- conectores familiares por geração;
- cônjuges com edge própria;
- conectores de pais/filhos por `GenealogyFamilyConnectorNode`;
- anel conjugal via `GenealogySpouseEdge`;
- escopo pessoal.

---

### 3.3 Visão Completa

Também usa:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Características:

- base familiar completa;
- organização por gerações;
- mesma arquitetura visual da Genealogia;
- regras próprias de recorte/exibição conforme o `viewMode`.

---

## 4. Estados principais

Os estados principais são mantidos em:

```txt
src/app/pages/Home.tsx
```

### 4.1 `edgeFilters`

Controla exibição/ocultação de linhas.

```ts
{
  conjugal: boolean;
  filiacao_sangue: boolean;
  filiacao_adotiva: boolean;
  irmaos: boolean;
}
```

Uso esperado:

- `conjugal`: linhas conjugais/cônjuges;
- `filiacao_sangue`: linhas de pais/filhos por filiação sanguínea;
- `filiacao_adotiva`: linhas de pais/filhos por filiação adotiva;
- `irmaos`: linhas ou trechos visuais relacionados a irmãos, quando a view suportar controle separado.

Não deve:

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

- `spouseHighlight`: destacar linhas conjugais visíveis;
- `parentChildHighlight`: destacar linhas parentais/de filiação visíveis;
- `siblingHighlight`: destacar linhas/trechos de irmãos visíveis.

Não deve:

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
- não deve ser alterado por botões de linhas;
- não deve ser alterado por botões de destaque;
- contadores devem continuar coerentes com o escopo da view.

---

### 4.4 `directRelativeFilters`

Controla grupos de parentes na Minha Árvore.

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

- usado apenas na lógica da Minha Árvore;
- oculta/exibe grupos de cards;
- não deve ser confundido com `edgeFilters`;
- pode afetar contadores e cards exibidos.

---

### 4.5 `genealogyFilters`

Controla gerações e grupos na Genealogia/Visão Completa.

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

- usado em views por geração;
- deve preservar conectores apenas entre pessoas visíveis;
- deve evitar edges soltas após filtro.

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

Função:

- indicar estilo visual dos cards;
- quando interativos, controlar `personFilters`;
- não controlar linhas;
- não aplicar destaque em conectores.

---

### 5.2 Linhas

Exemplos:

```txt
Conjugal
Pais/filhos
Irmãos
Todas
```

Função:

- controlar `edgeFilters`;
- exibir/ocultar linhas controláveis;
- não alterar cards;
- não alterar contadores;
- não aplicar destaque visual.

Regras esperadas:

```txt
Conjugal:
  exibe/oculta linhas de cônjuge/casal.

Pais/filhos:
  exibe/oculta linhas parentais/de filiação.

Irmãos:
  exibe/oculta linhas ou trechos de irmãos quando a view suportar.

Todas:
  liga/desliga todos os edgeFilters controláveis.
```

---

### 5.3 Destacar

Exemplos:

```txt
Todas
Cônjuges
Pais/Filhos
Irmãos
```

Função:

- controlar `visualLineFilters`;
- destacar linhas visíveis;
- nunca recriar linha oculta;
- não alterar cards;
- não alterar contadores.

Regras esperadas:

```txt
Destaque Cônjuges:
  destaca apenas linhas conjugais visíveis.

Destaque Pais/Filhos:
  destaca apenas linhas parentais/de filiação visíveis.

Destaque Irmãos:
  destaca apenas linhas ou trechos de irmãos visíveis.

Destaque Todas:
  destaca todos os grupos de linhas visíveis.
```

---

### 5.4 Aliança

Exemplos:

```txt
Casados
Divórcio
Viuvez
União Estável
```

Função atual:

- legenda visual;
- não filtra;
- não destaca;
- não altera árvore;
- não altera relação no banco.

Regra:

```txt
A seção Aliança não deve virar filtro sem uma frente específica.
```

---

## 6. Classificação de linhas na Minha Árvore

Na Minha Árvore, a classificação conceitual adotada foi:

```ts
type DirectLineGroup = 'spouse' | 'parentChild' | 'sibling' | 'auxiliary';
```

### 6.1 `spouse`

Linhas conjugais.

Exemplos:

```txt
cônjuge ↔ central
cônjuges ancestrais
pai ↔ mãe
```

### 6.2 `parentChild`

Linhas de filiação/descendência.

Exemplos:

```txt
pai/mãe ↔ pessoa central
central ↔ filhos
cônjuge ↔ filhos
filhos ↔ netos
irmãos ↔ sobrinhos
pets
```

Observações:

- irmãos → sobrinhos é `parentChild`, porque sobrinhos são filhos dos irmãos;
- pets ficam nesse grupo porque usam vínculo técnico equivalente a `filho`.

### 6.3 `sibling`

Linhas entre irmãos.

Exemplos:

```txt
central ↔ irmãos
pai/mãe ↔ tios, quando a linha representa relação entre irmãos
conectores internos de irmãos reais dentro de grupos
```

### 6.4 `auxiliary`

Apenas conectores técnicos indispensáveis.

Regra:

```txt
Se a linha parece visualmente representar cônjuge, pais/filhos ou irmãos, ela não deve ser auxiliary.
```

---

## 7. Correções consolidadas na Minha Árvore

Arquivo principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Foram ajustados:

- conectores conjugais;
- conectores parentais;
- conectores entre irmãos;
- conectores internos de grupos;
- conectores de pets;
- conectores de netos;
- conectores de sobrinhos;
- conectores de primos;
- conectores de tios;
- conectores de ancestrais.

Correção relevante:

```txt
spouseHighlight não deve ser aplicado indevidamente em linha de irmãos.
```

Decisão sobre pets:

```txt
Pets continuam separados dos filhos nos cards,
mas a linha de Pets é controlada por Pais/filhos, ou seja, parentChild.
```

---

## 8. Genealogia e Visão Completa

Arquivos principais:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

### 8.1 Controle de linhas

A Genealogia e a Visão Completa devem respeitar:

```txt
Linhas > Conjugal
Linhas > Pais/filhos
Linhas > Irmãos
```

Comportamento:

```txt
Conjugal:
  oculta/exibe linhas conjugais e ícone de aliança.

Pais/filhos:
  oculta/exibe conectores familiares entre gerações.

Irmãos:
  controla linhas/trechos de irmãos quando aplicável.
```

---

### 8.2 Destaque visual

A seção **Destacar** atua apenas em linhas visíveis.

Regras:

```txt
Destaque não cria linha nova.
Destaque não exibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

---

### 8.3 Correção de pan/scroll

Problema corrigido:

```txt
Em /genealogia e /visao-completa, ao tentar deslizar a árvore para baixo,
a view voltava automaticamente para cima.
```

Correção consolidada:

```txt
O restore automático do viewport no zoom mínimo deve ser restrito a viewMode === 'minha-arvore'.
```

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

### 8.4 Correção de handle do React Flow

Erro observado:

```txt
Couldn't create edge for target handle id: "sibling-left"
```

Diagnóstico:

```txt
sibling-left existia como source handle, não como target handle.
```

Correção:

```ts
targetHandle: 'left-target'
```

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

---

## 9. Destaque de irmãos em Genealogia/Visão Completa

### 9.1 Problema

A Genealogia/Visão Completa estavam criando uma nova edge vertical para destacar irmãos.

Isso era incorreto porque o conector familiar já possuía a linha vertical e os braços horizontais necessários.

### 9.2 Arquitetura correta

Componente responsável:

```txt
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
```

Esse componente já desenha:

```txt
linha pais/casal -> ramificação
linha vertical da ramificação
braços horizontais até cada filho/irmão
```

Portanto, o destaque de irmãos deve estilizar a ramificação existente, não criar uma edge nova.

### 9.3 Regra implementada

Em `GenealogyFamilyConnectorNode.tsx`, o node pode receber:

```ts
siblingHighlight?: boolean;
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
a linha vertical da ramificação fica no estilo de irmãos;
os braços horizontais até cada irmão também ficam no estilo de irmãos.
```

Estilo esperado:

```txt
amarelo
tracejado
```

### 9.4 Remoção de edge duplicada

Não recriar função equivalente a:

```txt
addGenealogySiblingEdges
```

Motivo:

```txt
A função criava uma segunda linha visual, duplicando a ramificação já existente.
```

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
- permitir rolagem interna quando necessário;
- manter cards e textos legíveis em telas menores de desktop;
- preservar lógica de filtros.

### 10.1 Problemas anteriores

- uso de `justify-between` espalhava grupos pela altura disponível;
- cards de filtros tinham dimensões fixas;
- alguns grupos ficavam altos demais em telas baixas;
- rolagem interna era insuficiente.

### 10.2 Regras atuais

Usar preferencialmente:

```txt
min-h-0
flex-1
overflow-y-auto
overflow-hidden no miolo quando necessário
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

## 11. Regras de validação manual

Após alterações em árvore, validar:

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

Irmãos:
  linhas ou trechos de irmãos somem/voltam quando a view suportar.

Todas:
  todas as linhas controláveis somem/voltam.
```

Validar **Destacar**:

```txt
Cônjuges:
  apenas linhas conjugais visíveis destacam.

Pais/Filhos:
  apenas linhas parentais visíveis destacam.

Irmãos:
  trechos de irmãos visíveis destacam.

Todas:
  todas as linhas visíveis destacam.
```

Regra obrigatória:

```txt
Destaque não recria linha oculta.
```

---

### 11.2 Aba Filtros

Validar:

```txt
cards não desaparecem por alteração de linhas;
contadores não mudam por destaque;
Vivos/Falecidos/Pets continuam funcionando;
filtros de grupos continuam funcionando;
modo foco da pessoa central continua funcionando;
Pets continuam separados nos cards.
```

---

### 11.3 Genealogia/Visão Completa

Validar:

```txt
scroll/pan vertical não volta sozinho ao topo;
console sem erro sibling-left;
destaque de irmãos não cria linha duplicada;
ramificação existente fica amarela e tracejada;
linha pais/casal -> ramificação mantém estilo de pais/filhos.
```

---

### 11.4 Painel lateral

Validar:

```txt
Filtros:
  cards compactos e adaptativos;
  Vivos/Falecidos/Pets no rodapé;
  rolagem interna se necessário.

Legendas:
  sem espaçamento artificial por justify-between;
  rolagem interna se necessário;
  cards e textos compactos em telas baixas.

Ações:
  botões proporcionais;
  rolagem interna se necessário.
```

---

## 12. Arquivos envolvidos

### Árvore e conectores

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

### 13.1 Não misturar estados

Evitar confundir:

```txt
edgeFilters:
  existência/visibilidade de linhas.

visualLineFilters:
  estilo/destaque de linhas existentes.

personFilters:
  visibilidade de cards por status.

directRelativeFilters:
  grupos de parentes na Minha Árvore.

genealogyFilters:
  gerações/grupos na Genealogia.
```

### 13.2 Não recriar linha oculta por destaque

Sequência correta:

```txt
1. decidir se linha existe;
2. se existir, decidir estilo;
3. se não existir, destaque não faz nada.
```

### 13.3 Cuidado com conectores estruturais

Nem toda linha é uma relação familiar explícita, mas se visualmente parece representar uma relação, deve ser classificada corretamente.

Não usar `auxiliary` para linhas percebidas pelo usuário como:

```txt
cônjuge
pais/filhos
irmãos
```

### 13.4 Genealogia usa arquitetura própria

Não aplicar automaticamente soluções da Minha Árvore em:

```txt
genealogyColumnsLayout.ts
GenealogyFamilyConnectorNode.tsx
GenealogySpouseEdge.tsx
```

Genealogia e Visão Completa compartilham arquitetura, mas diferem da Minha Árvore.

---

## 14. QA técnico

Após alterações relevantes, rodar:

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

## 15. Pós-MVP

Possíveis evoluções:

- legenda configurável por admin;
- presets de visualização da árvore;
- filtros salvos por usuário;
- controle persistido de preferências visuais;
- legenda contextual por view;
- modo apresentação;
- exportação com legenda embutida;
- documentação visual com imagens de exemplo.

Esses itens não bloqueiam o MVP.
