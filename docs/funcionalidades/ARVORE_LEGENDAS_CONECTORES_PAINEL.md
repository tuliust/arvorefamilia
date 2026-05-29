# Ãrvore â€” legendas, conectores, filtros e painel lateral

> Local recomendado: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
> Tipo: documentaÃ§Ã£o funcional/tÃ©cnica especÃ­fica da Ã¡rvore.

---

## 1. Objetivo

Este documento consolida as decisÃµes, regras e cuidados da visualizaÃ§Ã£o da Ã¡rvore familiar no projeto `tuliust/arvorefamilia`, com foco em:

- aba **Legendas**;
- botÃµes de **Linhas**;
- botÃµes de **Destacar**;
- conectores da **Minha Ãrvore**;
- conectores da **Genealogia**;
- conectores da **VisÃ£o Completa**;
- comportamento visual de pets;
- painel lateral esquerdo;
- filtros visuais e filtros de grupos;
- correÃ§Ãµes de pan/scroll;
- riscos de regressÃ£o visual.

Este documento nÃ£o substitui:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 2. Regra central da frente

A regra central Ã© separar claramente **existÃªncia**, **destaque**, **cards** e **grupos**.

```txt
edgeFilters:
  controlam existÃªncia/visibilidade de linhas.

visualLineFilters:
  controlam apenas destaque visual de linhas jÃ¡ visÃ­veis.

personFilters:
  controlam cards por status/tipo.

directRelativeFilters:
  controlam grupos de parentes na Minha Ãrvore.

genealogyFilters:
  controlam geraÃ§Ãµes/grupos na Genealogia e na VisÃ£o Completa.
```

Regra obrigatÃ³ria:

```txt
Destaque nÃ£o cria linha nova.
Destaque nÃ£o reexibe linha oculta.
Destaque nÃ£o altera cards.
Destaque nÃ£o altera contadores.
```

---

## 3. Views da Ã¡rvore

O projeto possui trÃªs rotas principais da Ã¡rvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 3.1 Minha Ãrvore

Layout principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

CaracterÃ­sticas:

- foco na pessoa central;
- grupos diretos de parentes;
- cards coloridos por grupo;
- separaÃ§Ã£o visual entre filhos humanos e pets;
- conectores customizados entre grupos diretos;
- suporte ao modo de foco da pessoa central;
- filtros por grupos diretos.

DocumentaÃ§Ã£o complementar:

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

CaracterÃ­sticas:

- organizaÃ§Ã£o por geraÃ§Ãµes;
- conectores familiares por geraÃ§Ã£o;
- cÃ´njuges com edge prÃ³pria;
- conectores de pais/filhos por `GenealogyFamilyConnectorNode`;
- anel conjugal via `GenealogySpouseEdge`;
- escopo pessoal.

---

### 3.3 VisÃ£o Completa

TambÃ©m usa:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

CaracterÃ­sticas:

- base familiar completa;
- organizaÃ§Ã£o por geraÃ§Ãµes;
- mesma arquitetura visual da Genealogia;
- regras prÃ³prias de recorte/exibiÃ§Ã£o conforme o `viewMode`.

---

## 4. Estados principais

Os estados principais sÃ£o mantidos em:

```txt
src/app/pages/Home.tsx
```

### 4.1 `edgeFilters`

Controla exibiÃ§Ã£o/ocultaÃ§Ã£o de linhas.

```ts
{
  conjugal: boolean;
  filiacao_sangue: boolean;
  filiacao_adotiva: boolean;
  irmaos: boolean;
}
```

Uso esperado:

- `conjugal`: linhas conjugais/cÃ´njuges;
- `filiacao_sangue`: linhas de pais/filhos por filiaÃ§Ã£o sanguÃ­nea;
- `filiacao_adotiva`: linhas de pais/filhos por filiaÃ§Ã£o adotiva;
- `irmaos`: linhas ou trechos visuais relacionados a irmÃ£os, quando a view suportar controle separado.

NÃ£o deve:

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

- `spouseHighlight`: destacar linhas conjugais visÃ­veis;
- `parentChildHighlight`: destacar linhas parentais/de filiaÃ§Ã£o visÃ­veis;
- `siblingHighlight`: destacar linhas/trechos de irmÃ£os visÃ­veis.

NÃ£o deve:

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
- nÃ£o deve ser alterado por botÃµes de linhas;
- nÃ£o deve ser alterado por botÃµes de destaque;
- contadores devem continuar coerentes com o escopo da view.

---

### 4.4 `directRelativeFilters`

Controla grupos de parentes na Minha Ãrvore.

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

- usado apenas na lÃ³gica da Minha Ãrvore;
- oculta/exibe grupos de cards;
- nÃ£o deve ser confundido com `edgeFilters`;
- pode afetar contadores e cards exibidos.

---

### 4.5 `genealogyFilters`

Controla geraÃ§Ãµes e grupos na Genealogia/VisÃ£o Completa.

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

- usado em views por geraÃ§Ã£o;
- deve preservar conectores apenas entre pessoas visÃ­veis;
- deve evitar edges soltas apÃ³s filtro.

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

FunÃ§Ã£o:

- indicar estilo visual dos cards;
- quando interativos, controlar `personFilters`;
- nÃ£o controlar linhas;
- nÃ£o aplicar destaque em conectores.

---

### 5.2 Linhas

Exemplos:

```txt
Conjugal
Pais/filhos
IrmÃ£os
Todas
```

FunÃ§Ã£o:

- controlar `edgeFilters`;
- exibir/ocultar linhas controlÃ¡veis;
- nÃ£o alterar cards;
- nÃ£o alterar contadores;
- nÃ£o aplicar destaque visual.

Regras esperadas:

```txt
Conjugal:
  exibe/oculta linhas de cÃ´njuge/casal.

Pais/filhos:
  exibe/oculta linhas parentais/de filiaÃ§Ã£o.

IrmÃ£os:
  exibe/oculta linhas ou trechos de irmÃ£os quando a view suportar.

Todas:
  liga/desliga todos os edgeFilters controlÃ¡veis.
```

---

### 5.3 Destacar

Exemplos:

```txt
Todas
CÃ´njuges
Pais/Filhos
IrmÃ£os
```

FunÃ§Ã£o:

- controlar `visualLineFilters`;
- destacar linhas visÃ­veis;
- nunca recriar linha oculta;
- nÃ£o alterar cards;
- nÃ£o alterar contadores.

Regras esperadas:

```txt
Destaque CÃ´njuges:
  destaca apenas linhas conjugais visÃ­veis.

Destaque Pais/Filhos:
  destaca apenas linhas parentais/de filiaÃ§Ã£o visÃ­veis.

Destaque IrmÃ£os:
  destaca apenas linhas ou trechos de irmÃ£os visÃ­veis.

Destaque Todas:
  destaca todos os grupos de linhas visÃ­veis.
```

---

### 5.4 AlianÃ§a

Exemplos:

```txt
Casados
DivÃ³rcio
Viuvez
UniÃ£o EstÃ¡vel
```

FunÃ§Ã£o atual:

- legenda visual;
- nÃ£o filtra;
- nÃ£o destaca;
- nÃ£o altera Ã¡rvore;
- nÃ£o altera relaÃ§Ã£o no banco.

Regra:

```txt
A seÃ§Ã£o AlianÃ§a nÃ£o deve virar filtro sem uma frente especÃ­fica.
```

---

## 6. ClassificaÃ§Ã£o de linhas na Minha Ãrvore

Na Minha Ãrvore, a classificaÃ§Ã£o conceitual adotada foi:

```ts
type DirectLineGroup = 'spouse' | 'parentChild' | 'sibling' | 'auxiliary';
```

### 6.1 `spouse`

Linhas conjugais.

Exemplos:

```txt
cÃ´njuge â†” central
cÃ´njuges ancestrais
pai â†” mÃ£e
```

### 6.2 `parentChild`

Linhas de filiaÃ§Ã£o/descendÃªncia.

Exemplos:

```txt
pai/mÃ£e â†” pessoa central
central â†” filhos
cÃ´njuge â†” filhos
filhos â†” netos
irmÃ£os â†” sobrinhos
pets
```

ObservaÃ§Ãµes:

- irmÃ£os â†’ sobrinhos Ã© `parentChild`, porque sobrinhos sÃ£o filhos dos irmÃ£os;
- pets ficam nesse grupo porque usam vÃ­nculo tÃ©cnico equivalente a `filho`.

### 6.3 `sibling`

Linhas entre irmÃ£os.

Exemplos:

```txt
central â†” irmÃ£os
pai/mÃ£e â†” tios, quando a linha representa relaÃ§Ã£o entre irmÃ£os
conectores internos de irmÃ£os reais dentro de grupos
```

### 6.4 `auxiliary`

Apenas conectores tÃ©cnicos indispensÃ¡veis.

Regra:

```txt
Se a linha parece visualmente representar cÃ´njuge, pais/filhos ou irmÃ£os, ela nÃ£o deve ser auxiliary.
```

---

## 7. CorreÃ§Ãµes consolidadas na Minha Ãrvore

Arquivo principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Foram ajustados:

- conectores conjugais;
- conectores parentais;
- conectores entre irmÃ£os;
- conectores internos de grupos;
- conectores de pets;
- conectores de netos;
- conectores de sobrinhos;
- conectores de primos;
- conectores de tios;
- conectores de ancestrais.

CorreÃ§Ã£o relevante:

```txt
spouseHighlight nÃ£o deve ser aplicado indevidamente em linha de irmÃ£os.
```

DecisÃ£o sobre pets:

```txt
Pets continuam separados dos filhos nos cards,
mas a linha de Pets Ã© controlada por Pais/filhos, ou seja, parentChild.
```

---

## 8. Genealogia e VisÃ£o Completa

Arquivos principais:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

### 8.1 Controle de linhas

A Genealogia e a VisÃ£o Completa devem respeitar:

```txt
Linhas > Conjugal
Linhas > Pais/filhos
Linhas > IrmÃ£os
```

Comportamento:

```txt
Conjugal:
  oculta/exibe linhas conjugais e Ã­cone de alianÃ§a.

Pais/filhos:
  oculta/exibe conectores familiares entre geraÃ§Ãµes.

IrmÃ£os:
  controla linhas/trechos de irmÃ£os quando aplicÃ¡vel.
```

---

### 8.2 Destaque visual

A seÃ§Ã£o **Destacar** atua apenas em linhas visÃ­veis.

Regras:

```txt
Destaque nÃ£o cria linha nova.
Destaque nÃ£o exibe linha oculta.
Destaque nÃ£o altera cards.
Destaque nÃ£o altera contadores.
```

---

### 8.3 CorreÃ§Ã£o de pan/scroll

Problema corrigido:

```txt
Em /genealogia e /visao-completa, ao tentar deslizar a Ã¡rvore para baixo,
a view voltava automaticamente para cima.
```

CorreÃ§Ã£o consolidada:

```txt
O restore automÃ¡tico do viewport no zoom mÃ­nimo deve ser restrito a viewMode === 'minha-arvore'.
```

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

---

### 8.4 CorreÃ§Ã£o de handle do React Flow

Erro observado:

```txt
Couldn't create edge for target handle id: "sibling-left"
```

DiagnÃ³stico:

```txt
sibling-left existia como source handle, nÃ£o como target handle.
```

CorreÃ§Ã£o:

```ts
targetHandle: 'left-target'
```

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

---

## 9. Destaque de irmÃ£os em Genealogia/VisÃ£o Completa

### 9.1 Problema

A Genealogia/VisÃ£o Completa estavam criando uma nova edge vertical para destacar irmÃ£os.

Isso era incorreto porque o conector familiar jÃ¡ possuÃ­a a linha vertical e os braÃ§os horizontais necessÃ¡rios.

### 9.2 Arquitetura correta

Componente responsÃ¡vel:

```txt
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
```

Esse componente jÃ¡ desenha:

```txt
linha pais/casal -> ramificaÃ§Ã£o
linha vertical da ramificaÃ§Ã£o
braÃ§os horizontais atÃ© cada filho/irmÃ£o
```

Portanto, o destaque de irmÃ£os deve estilizar a ramificaÃ§Ã£o existente, nÃ£o criar uma edge nova.

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
a linha vertical da ramificaÃ§Ã£o fica no estilo de irmÃ£os;
os braÃ§os horizontais atÃ© cada irmÃ£o tambÃ©m ficam no estilo de irmÃ£os.
```

Estilo esperado:

```txt
amarelo
tracejado
```

### 9.4 RemoÃ§Ã£o de edge duplicada

NÃ£o recriar funÃ§Ã£o equivalente a:

```txt
addGenealogySiblingEdges
```

Motivo:

```txt
A funÃ§Ã£o criava uma segunda linha visual, duplicando a ramificaÃ§Ã£o jÃ¡ existente.
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
- permitir rolagem interna quando necessÃ¡rio;
- manter cards e textos legÃ­veis em telas menores de desktop;
- preservar lÃ³gica de filtros.

### 10.1 Problemas anteriores

- uso de `justify-between` espalhava grupos pela altura disponÃ­vel;
- cards de filtros tinham dimensÃµes fixas;
- alguns grupos ficavam altos demais em telas baixas;
- rolagem interna era insuficiente.

### 10.2 Regras atuais

Usar preferencialmente:

```txt
min-h-0
flex-1
overflow-y-auto
overflow-hidden no miolo quando necessÃ¡rio
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

## 11. Regras de validaÃ§Ã£o manual

ApÃ³s alteraÃ§Ãµes em Ã¡rvore, validar:

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

IrmÃ£os:
  linhas ou trechos de irmÃ£os somem/voltam quando a view suportar.

Todas:
  todas as linhas controlÃ¡veis somem/voltam.
```

Validar **Destacar**:

```txt
CÃ´njuges:
  apenas linhas conjugais visÃ­veis destacam.

Pais/Filhos:
  apenas linhas parentais visÃ­veis destacam.

IrmÃ£os:
  trechos de irmÃ£os visÃ­veis destacam.

Todas:
  todas as linhas visÃ­veis destacam.
```

Regra obrigatÃ³ria:

```txt
Destaque nÃ£o recria linha oculta.
```

---

### 11.2 Aba Filtros

Validar:

```txt
cards nÃ£o desaparecem por alteraÃ§Ã£o de linhas;
contadores nÃ£o mudam por destaque;
Vivos/Falecidos/Pets continuam funcionando;
filtros de grupos continuam funcionando;
modo foco da pessoa central continua funcionando;
Pets continuam separados nos cards.
```

---

### 11.3 Genealogia/VisÃ£o Completa

Validar:

```txt
scroll/pan vertical nÃ£o volta sozinho ao topo;
console sem erro sibling-left;
destaque de irmÃ£os nÃ£o cria linha duplicada;
ramificaÃ§Ã£o existente fica amarela e tracejada;
linha pais/casal -> ramificaÃ§Ã£o mantÃ©m estilo de pais/filhos.
```

---

### 11.4 Painel lateral

Validar:

```txt
Filtros:
  cards compactos e adaptativos;
  Vivos/Falecidos/Pets no rodapÃ©;
  rolagem interna se necessÃ¡rio.

Legendas:
  sem espaÃ§amento artificial por justify-between;
  rolagem interna se necessÃ¡rio;
  cards e textos compactos em telas baixas.

AÃ§Ãµes:
  botÃµes proporcionais;
  rolagem interna se necessÃ¡rio.
```

---

## 12. Arquivos envolvidos

### Ãrvore e conectores

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

### 13.1 NÃ£o misturar estados

Evitar confundir:

```txt
edgeFilters:
  existÃªncia/visibilidade de linhas.

visualLineFilters:
  estilo/destaque de linhas existentes.

personFilters:
  visibilidade de cards por status.

directRelativeFilters:
  grupos de parentes na Minha Ãrvore.

genealogyFilters:
  geraÃ§Ãµes/grupos na Genealogia.
```

### 13.2 NÃ£o recriar linha oculta por destaque

SequÃªncia correta:

```txt
1. decidir se linha existe;
2. se existir, decidir estilo;
3. se nÃ£o existir, destaque nÃ£o faz nada.
```

### 13.3 Cuidado com conectores estruturais

Nem toda linha Ã© uma relaÃ§Ã£o familiar explÃ­cita, mas se visualmente parece representar uma relaÃ§Ã£o, deve ser classificada corretamente.

NÃ£o usar `auxiliary` para linhas percebidas pelo usuÃ¡rio como:

```txt
cÃ´njuge
pais/filhos
irmÃ£os
```

### 13.4 Genealogia usa arquitetura prÃ³pria

NÃ£o aplicar automaticamente soluÃ§Ãµes da Minha Ãrvore em:

```txt
genealogyColumnsLayout.ts
GenealogyFamilyConnectorNode.tsx
GenealogySpouseEdge.tsx
```

Genealogia e VisÃ£o Completa compartilham arquitetura, mas diferem da Minha Ãrvore.

---

## 14. QA tÃ©cnico

ApÃ³s alteraÃ§Ãµes relevantes, rodar:

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

## 15. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- legenda configurÃ¡vel por admin;
- presets de visualizaÃ§Ã£o da Ã¡rvore;
- filtros salvos por usuÃ¡rio;
- controle persistido de preferÃªncias visuais;
- legenda contextual por view;
- modo apresentaÃ§Ã£o;
- exportaÃ§Ã£o com legenda embutida;
- documentaÃ§Ã£o visual com imagens de exemplo.

Esses itens nÃ£o bloqueiam o MVP.
