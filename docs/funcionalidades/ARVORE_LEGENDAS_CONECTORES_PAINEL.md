# Árvore: Legendas, Conectores, Filtros e Painel Lateral

## 1. Objetivo

Este documento consolida as implementações, correções e decisões arquiteturais feitas nas frentes recentes da visualização da árvore familiar no projeto `tuliust/arvorefamilia`.

O foco está em:

- aba **Legendas**;
- botões de **LINHAS** e **DESTACAR**;
- conectores da **Minha Árvore**;
- conectores da **Genealogia** e da **Visão Completa**;
- comportamento de Pets;
- painel lateral esquerdo;
- filtros visuais e de grupos;
- correções de pan/scroll;
- ajustes administrativos correlatos realizados no mesmo ciclo.

A regra central desta frente é separar claramente:

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
  controlam gerações/grupos na Genealogia e Visão Completa.
```

---

## 2. Views da árvore

O projeto possui três rotas principais para a árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 2.1 Minha Árvore

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
- suporte a modo foco da pessoa central.

### 2.2 Genealogia

Layout principal:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Características:

- organização por gerações;
- conectores familiares por geração;
- cônjuges com edge própria;
- conectores de pais/filhos por `GenealogyFamilyConnectorNode`.

### 2.3 Visão Completa

Também usa:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Diferença principal:

```txt
hideUngenerated: true
```

A Visão Completa compartilha a arquitetura visual da Genealogia, mas com recorte/ocultação específica de pessoas não geradas.

---

## 3. Estados principais

Os estados principais são mantidos em:

```txt
src/app/pages/Home.tsx
```

### 3.1 `edgeFilters`

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

### 3.2 `visualLineFilters`

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

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

### 3.3 `personFilters`

Controla cards por status/tipo.

```ts
{
  vivos: boolean;
  falecidos: boolean;
  pets: boolean;
}
```

Regras:

- não deve ser alterado por controles de linhas;
- não deve ser alterado por destaques;
- afeta cards renderizados;
- contadores devem continuar coerentes com o escopo da view.

### 3.4 `directRelativeFilters`

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

- usado na lógica da Minha Árvore;
- não deve ser confundido com `edgeFilters`;
- oculta/exibe grupos de cards, não apenas linhas.

### 3.5 `genealogyFilters`

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

---

## 4. Aba Legendas

Componente principal:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

A aba **Legendas** possui blocos conceitualmente diferentes.

### 4.1 Cards

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

### 4.2 Linhas

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
  exibe/oculta linhas ou trechos visuais de irmãos quando a view suportar controle separado.

Todas:
  liga/desliga todos os edgeFilters controláveis.
```

### 4.3 Destacar

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

### 4.4 Aliança

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

A seção **ALIANÇA** não deve virar filtro sem uma frente específica.

---

## 5. Classificação de linhas na Minha Árvore

Na Minha Árvore, a classificação conceitual adotada foi:

```ts
type DirectLineGroup = 'spouse' | 'parentChild' | 'sibling' | 'auxiliary';
```

### 5.1 `spouse`

Linhas conjugais.

Exemplos:

```txt
cônjuge ↔ central
cônjuges ancestrais
pai ↔ mãe
```

### 5.2 `parentChild`

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

### 5.3 `sibling`

Linhas entre irmãos.

Exemplos:

```txt
central ↔ irmãos
pai/mãe ↔ tios, quando a linha representa relação entre irmãos
conectores internos de irmãos reais dentro de grupos
```

### 5.4 `auxiliary`

Apenas conectores técnicos indispensáveis.

Regra:

```txt
Se a linha parece visualmente representar cônjuge, pais/filhos ou irmãos, ela não deve ser auxiliary.
```

---

## 6. Correções realizadas na Minha Árvore

Arquivo principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

### 6.1 Separação entre ocultação e destaque

Foram separados:

```txt
edgeFilters:
  exibir/ocultar linhas.

visualLineFilters:
  destacar linhas visíveis.
```

Regra obrigatória:

```txt
Destaque não recria linha oculta.
```

Exemplo:

```txt
Se edgeFilters.conjugal === false,
spouseHighlight === true não pode fazer linha conjugal aparecer.
```

### 6.2 Correções de conectores

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

### 6.3 Correção de destaque indevido

Foi corrigido caso em que:

```txt
spouseHighlight era aplicado indevidamente em linha de irmãos.
```

### 6.4 Pets

Decisão consolidada:

```txt
Pets continuam separados dos filhos nos cards,
mas a linha de Pets é controlada por Pais/filhos, ou seja, parentChild.
```

### 6.5 Alianças

Foram adicionados/ajustados marriage nodes com ícone de aliança:

- entre cônjuges ancestrais;
- entre pai e mãe;
- em linhas conjugais relevantes.

Também foram removidas bolinhas/handles visuais em casos específicos.

---

## 7. Genealogia e Visão Completa

Arquivo principal:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Componentes relacionados:

```txt
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

### 7.1 Controle de linhas

A Genealogia e a Visão Completa passaram a respeitar:

```txt
LINHAS > Conjugal
LINHAS > Pais/filhos
LINHAS > Irmãos
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

### 7.2 Destaque visual

A seção DESTACAR atua apenas em linhas visíveis.

Regras:

```txt
Destaque não cria linha nova.
Destaque não exibe linha oculta.
Destaque não altera cards.
Destaque não altera contadores.
```

### 7.3 Correção de pan/scroll

Problema:

```txt
Em /genealogia e /visao-completa, ao tentar deslizar a árvore para baixo,
a view voltava automaticamente para cima.
```

Correção:

```txt
O restore automático do viewport no zoom mínimo passou a ser restrito a viewMode === 'minha-arvore'.
```

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

### 7.4 Correção de handle do React Flow

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

## 8. Destaque de irmãos em Genealogia/Visão Completa

### 8.1 Problema

A Genealogia/Visão Completa estavam criando uma nova edge vertical para destacar irmãos.

Isso era incorreto porque o conector familiar já possuía a linha vertical e os braços horizontais necessários.

### 8.2 Arquitetura correta

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

### 8.3 Alterações realizadas

Em `GenealogyFamilyConnectorNode.tsx`, foi adicionado:

```ts
siblingHighlight?: boolean;
```

Foram separados os estilos:

```ts
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

### 8.4 Remoção de edge duplicada

Foi removida a criação de edges extras:

```txt
addGenealogySiblingEdges
```

Motivo:

```txt
A função criava uma segunda linha visual, duplicando a ramificação já existente.
```

### 8.5 Correção complementar

Após diagnóstico, foi identificado que `siblingHighlight` chegava até `addGenealogyFamilyConnectorNodes`, mas não entrava em `createGenealogyFamilyConnectorNode`.

Foi corrigido com:

```ts
parentChildHighlight,
siblingHighlight,
```

e no `data` do node:

```ts
...(siblingHighlight ? { siblingHighlight } : {}),
```

---

## 9. Painel lateral esquerdo

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

### 9.1 Objetivo

Melhorar a responsividade vertical das abas:

```txt
Filtros
Legendas
Ações
```

Especialmente em telas menores de desktop.

### 9.2 Problema anterior

A aba Legendas usava:

```txt
justify-between
```

Isso espalhava artificialmente os grupos pela altura disponível.

Os cards da aba Filtros tinham dimensões fixas:

```txt
min-h-[40px]
p-1.5
text-xs
text-lg
gap fixo
```

### 9.3 Script 1 — Legendas

Arquivos:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/TreeLegend.tsx
```

Alterações:

- a aba Legendas passou a ter wrapper com `overflow-y-auto`;
- `TreeLegend compact` deixou de usar `justify-between`;
- gaps, títulos, textos e cards compactos passaram a usar `clamp`.

Exemplos:

```txt
gap-[clamp(...)]
min-h-[clamp(...)]
text-[clamp(...)]
```

### 9.4 Script 2 — Filtros

Arquivos:

```txt
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
```

Alterações:

- cards de filtros com altura adaptativa;
- fontes com `clamp`;
- gaps com `clamp`;
- padding vertical adaptativo;
- contadores mais responsivos.

Importante:

```txt
Nenhuma lógica de filtro foi alterada.
Nenhum contador foi alterado.
Nenhum estado foi alterado.
```

### 9.5 Script 3 — Acabamento do painel

Arquivos previstos:

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/SidebarInfoPanel.tsx
```

Objetivo:

- ajustar densidade dos controles superiores;
- ajustar botão Ações;
- ajustar botão recolher/expandir;
- trocar `overflow-visible` por `overflow-hidden` no miolo do painel;
- tornar a aba Ações rolável internamente;
- padronizar alturas, gaps e fontes com `clamp`.

Status:

```txt
Gerado para execução e validação visual.
```

---

## 10. Header desktop das páginas internas

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

### 10.1 Problema

As páginas internas ainda usavam o header no padrão antigo, diferente da Home.

### 10.2 Correção

Foi padronizado o header para:

- largura total;
- ícone/título à esquerda;
- botões à direita;
- conteúdo principal preservado;
- comportamento visual alinhado ao header da Home.

Também foi corrigido um erro de interpolação inválida em JSX causado por tentativa anterior de script.

---

## 11. Página Admin

### 11.1 Dashboard

Arquivo:

```txt
src/app/pages/admin/AdminDashboard.tsx
```

Ajustes realizados:

- 4 cards superiores em uma linha no desktop;
- 8 ações rápidas em 4 colunas e 2 linhas;
- card “Pessoas Recentes” com altura proporcional;
- botão “Editar” com estilo `outline`, borda cinza, fundo branco e sombra leve.

### 11.2 Histórico de Atividades

Arquivo:

```txt
src/app/services/activityLogService.ts
```

Correção:

- logs técnicos foram convertidos em textos mais legíveis;
- campos técnicos foram agrupados em categorias humanas.

Exemplo:

```txt
Antes:
Pessoa atualizada em Populos. Campos: nome_completo, data_nascimento...

Depois:
Perfil atualizado em Populos com alterações em dados pessoais, locais de nascimento e falecimento, foto, biografia, redes sociais, preferências de exibição e configurações de contato.
```

Durante a frente, foram corrigidos:

- duplicação de helpers;
- problemas de encoding;
- assinatura quebrada de função;
- ocorrências de caracteres corrompidos.

### 11.3 Atividades

Arquivo:

```txt
src/app/pages/admin/AdminAtividades.tsx
```

Ajustes previstos/aplicados:

```txt
Entidade -> Atividade
Usuário/ator -> Responsável
Entidade afetada -> Para usuário
```

Também foi definido o helper para reduzir o nome do responsável ao primeiro e último nome:

```ts
function formatResponsibleDisplayName(name?: string | null) {
  const fallback = 'Responsável não identificado';
  const cleanName = name?.trim();

  if (!cleanName) return fallback;

  const parts = cleanName.split(/\s+/).filter(Boolean);

  if (parts.length <= 2) {
    return cleanName;
  }

  return `${parts[0]} ${parts[parts.length - 1]}`;
}
```

---

## 12. Regras de validação manual

Após alterações em árvore, validar:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 12.1 Aba Legendas

Validar LINHAS:

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

Validar DESTACAR:

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

### 12.2 Aba Filtros

Validar:

```txt
cards não desaparecem por alteração de linhas;
contadores não mudam por destaque;
Vivos/Falecidos/Pets continuam funcionando;
filtros de grupos continuam funcionando;
modo foco da pessoa central continua funcionando;
Pets continuam separados nos cards.
```

### 12.3 Genealogia/Visão Completa

Validar:

```txt
scroll/pan vertical não volta sozinho ao topo;
console sem erro sibling-left;
destaque de irmãos não cria linha duplicada;
ramificação existente fica amarela e tracejada;
linha pais/casal -> ramificação mantém estilo de pais/filhos.
```

### 12.4 Painel lateral

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

Qualquer helper de estilo deve respeitar primeiro a visibilidade.

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

### 13.5 Painel lateral

Ajustes visuais devem evitar:

```txt
overflow externo fora do painel;
cards com altura fixa excessiva;
fontes grandes demais em telas baixas;
uso de justify-between para tentar preencher altura.
```

---

## 14. Arquivos envolvidos

### 14.1 Árvore e conectores

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

### 14.2 Home e painel lateral

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

### 14.3 Admin

```txt
src/app/pages/admin/AdminDashboard.tsx
src/app/pages/admin/AdminAtividades.tsx
src/app/services/activityLogService.ts
```

### 14.4 Layout global

```txt
src/app/components/layout/MemberPageHeader.tsx
```

---

## 15. Histórico de commits relacionados

Commits já registrados durante as frentes:

```txt
68eb237 Ajusta conectores visuais da minha arvore
8ad397d Refina conexoes internas de primos
9a7c969 Ajusta controles de linhas na genealogia
c366926 Refina conectores visuais da arvore
```

Mensagens de commit sugeridas/usadas em frentes posteriores:

```txt
Padroniza header desktop das paginas internas
Ajusta layout e historico do painel administrativo
Corrige pan e conexoes de irmaos na genealogia
Destaca ramificacoes de irmaos na genealogia
Ajusta painel lateral da arvore para telas menores
```

---

## 16. Checklist final de build

Após alterações relevantes, rodar:

```powershell
npm.cmd run build
```

Depois conferir:

```powershell
git status --short
git diff
```

Para commits específicos, preferir commits separados por frente funcional.

---

## 17. Recomendações para próximas manutenções

### 17.1 Para Legendas

Se novos botões forem adicionados:

- definir se são filtro, destaque ou apenas legenda;
- evitar que um botão faça duas coisas ao mesmo tempo;
- atualizar `TreeLegend.tsx`;
- atualizar o layout correspondente.

### 17.2 Para linhas

Sempre registrar nos `edge.data` ou nos nodes equivalentes, quando aplicável:

```txt
lineGroup
relationKind
relationshipSubtype
isStructural
```

### 17.3 Para Genealogia

Antes de criar nova edge:

```txt
verificar se GenealogyFamilyConnectorNode já desenha o trecho necessário.
```

Se o conector já existir, preferir estilizar o conector existente.

### 17.4 Para Painel Lateral

Evitar alturas fixas. Preferir:

```txt
min-h-0
flex-1
overflow-y-auto
clamp()
leading-tight
gaps adaptativos
```

---

## 18. Estado atual consolidado

Até esta documentação, as principais frentes estão consolidadas assim:

```txt
Minha Árvore:
  conectores corrigidos e filtros/destaques separados.

Genealogia/Visão Completa:
  pan corrigido;
  erro sibling-left corrigido;
  destaque de irmãos reaproveita conector familiar existente.

Painel lateral:
  Legendas e Filtros com responsividade vertical em evolução;
  Scripts 1 e 2 aplicados;
  Script 3 planejado/gerado para acabamento.

Admin:
  dashboard ajustado;
  histórico de atividades convertido para linguagem mais legível;
  labels de atividades revisados.
```
