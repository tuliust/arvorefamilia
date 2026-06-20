# Mapa Familiar Mobile — grade 3x3, zoom, scroll e conectores

> Última revisão: 2026-06-20  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`  
> Escopo: comportamento mobile das rotas `/mapa-familiar` e `/mapa-familiar-horizontal`  
> Status: revisado contra o código atual da `main` após rollback da refatoração ampla e aplicação de ajustes pontuais em Zoom, overview e conectores.

---

## 1. Objetivo

Este documento complementa `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` com o contrato mobile específico das duas views oficiais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Use este arquivo para validar e alterar:

- grade 3x3 da Árvore Familiar mobile;
- tela `descendants`;
- telas de tios paternos e maternos;
- telas de avós, bisavós e tataravós;
- títulos de grupos;
- largura dos grupos por número de cards;
- conectores mobile;
- botão `Zoom`/overview com 9 cards;
- painel aberto pelo botão `+`;
- rolagem interna em telas com conteúdo maior que a altura útil.

> Regra de leitura: este documento descreve o código atual. Tentativas de refatoração ampla e branches de rollback devem ser tratadas como histórico, não como contrato vigente.

---

## 2. Grade 3x3 da rota `/mapa-familiar`

No mobile, `/mapa-familiar` opera como uma grade de 9 telas.

| Posição | Tela técnica | Nome funcional | Conteúdo esperado |
|---|---|---|---|
| Superior esquerda | `paternal-ancestors` | Ancestrais paternos | bisavós/tataravós paternos |
| Superior centro | `ancestors` | Avós | avós paternos e maternos |
| Superior direita | `maternal-ancestors` | Ancestrais maternos | bisavós/tataravós maternos |
| Meio esquerda | `paternal-uncles` | Tios paternos | irmãos do pai e vínculos do ramo paterno |
| Meio centro | `core` | Núcleo central | pai, mãe e pessoa central |
| Meio direita | `maternal-uncles` | Tios maternos | irmãos da mãe e vínculos do ramo materno |
| Inferior esquerda | `paternal-cousins` | Primos paternos | descendentes dos tios paternos |
| Inferior centro | `descendants` | Descendentes e vínculos | irmãos, cônjuge, sobrinhos, pets, filhos e netos |
| Inferior direita | `maternal-cousins` | Primos maternos | descendentes dos tios maternos |

Arquivos relacionados no código atual:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/mobileFamilyTreeNavigationRules.ts
src/staticMobileFamilyTreeScreens.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
```

---

## 3. Navegação por swipe

Contrato vigente de navegação na grade 3x3:

| Tela atual | Direções permitidas |
|---|---|
| `paternal-ancestors` | direita → `ancestors` |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` |
| `maternal-ancestors` | esquerda → `ancestors` |
| `core` | cima → `ancestors`; esquerda → `paternal-uncles`; direita → `maternal-uncles`; baixo → `descendants` |
| `descendants` | cima → `core` |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` |
| `paternal-cousins` | cima → `paternal-uncles` |
| `maternal-cousins` | cima → `maternal-uncles` |

Regras:

- direções não listadas devem ser bloqueadas;
- swipe não pode impedir scroll interno quando a tela possui área rolável;
- mudanças em direção física do gesto devem ser testadas em iPhone/Safari;
- overview e swipe devem convergir para o mesmo estado visual do stage.

Arquivo principal:

```txt
src/mobileFamilyTreeNavigationRules.ts
```

---

## 4. Tela `ancestors` — Avós e conectores

A tela `ancestors` contém dois grupos principais:

```txt
Avós paternos
Avós maternos
```

Contrato visual:

- o grupo `Avós paternos` deve ter linha horizontal saindo para a esquerda, em direção à tela `paternal-ancestors`;
- o grupo `Avós maternos` deve ter linha horizontal saindo para a direita, em direção à tela `maternal-ancestors`;
- abaixo do grupo `Avós paternos` deve haver linha vertical descendo em direção ao card do pai na tela `core`;
- abaixo do grupo `Avós maternos` deve haver linha vertical descendo em direção ao card da mãe na tela `core`;
- essas linhas verticais não devem aparecer nas telas de bisavós/tataravós.

Implementação atual:

```txt
src/mobileFamilyTreeAncestorConnectorsFix.ts
```

Esse script:

- roda apenas em mobile e apenas na rota `/mapa-familiar`;
- procura a tela `[data-mobile-family-tree-screen="ancestors"]`;
- considera apenas seções com cards mobile e título normalizado contendo `avos`, mas não `bisavos` nem `tataravos`;
- desenha conectores em uma camada própria com `data-mobile-family-tree-ancestor-connectors="true"`;
- usa variáveis de paleta para cor e espessura dos conectores.

Pendência de QA aberta: confirmar visualmente em Safari/iOS se as duas linhas verticais abaixo dos grupos de avós estão visíveis depois do deploy atual.

---

## 5. Telas `paternal-ancestors` e `maternal-ancestors`

Essas telas exibem ancestrais profundos do ramo paterno e materno, principalmente bisavós e tataravós.

Contrato:

- linhas horizontais podem apontar em direção à tela central de avós;
- linhas verticais de descida para pai/mãe não devem aparecer aqui;
- não usar o ajuste de avós para desenhar conectores abaixo de bisavós ou tataravós.

Arquivo relacionado:

```txt
src/mobileFamilyTreeGrandparentScreens.ts
```

---

## 6. Tela `descendants`

A tela `descendants` é uma tela mobile adicional posicionada abaixo da tela `core`.

Ela deve conter, quando houver dados:

```txt
Irmãos
Sobrinhos
Cônjuge
Pets
Filhos
Netos
```

### 6.1 Rolagem interna

Contrato esperado:

- a tela deve ter área interna rolável quando o conteúdo for maior que a altura útil;
- o scroll vertical deve ocorrer dentro da tela `descendants`;
- o swipe para voltar à tela `core` só deve ser capturado quando a rolagem interna estiver no topo;
- o bottom nav e a safe area não devem cobrir permanentemente o último grupo.

Arquivos relacionados:

```txt
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
```

### 6.2 Conectores internos

Contrato esperado:

- uma linha superior entra na tela `descendants` e se ramifica para `Irmãos` e `Cônjuge` quando ambos existem;
- de `Irmãos`, a linha desce para `Sobrinhos` quando houver sobrinhos;
- de `Cônjuge`, a linha desce e pode se ramificar para `Pets` e `Filhos`;
- se houver `Pets` e `Filhos`, os dois grupos ficam lado a lado;
- se houver apenas `Pets`, `Pets` ocupa sozinho a área abaixo de `Cônjuge`;
- se houver apenas `Filhos`, `Filhos` ocupa sozinho a área abaixo de `Cônjuge`;
- conectores antigos clonados do layout original não devem aparecer como linhas transparentes ou duplicadas.

Arquivo relacionado:

```txt
src/mobileFamilyTreeDescendantConnectorsFix.ts
```

Implementação atual:

- cria camada própria com `data-mobile-family-tree-descendant-connectors="true"`;
- usa `.mobile-family-descendant-screen__inner` como host preferencial da camada de conectores;
- oculta conectores antigos clonados por CSS escopado;
- usa os grupos encontrados dentro da tela `descendants`, não elementos de origem da tela `core`;
- recalcula em resize, orientationchange, scroll, click, touchend e mutações no root.

Pendência de QA aberta: confirmar visualmente se as linhas têm a mesma espessura das demais e encostam corretamente no topo dos grupos `Irmãos` e `Cônjuge` em Safari/iOS.

---

## 7. Telas de tios

Telas envolvidas:

```txt
paternal-uncles
maternal-uncles
```

### 7.1 Contrato visual

- o grupo deve ficar centralizado na tela;
- o grupo deve ajustar largura conforme quantidade de cards;
- os cards devem permanecer legíveis em 320px, 375px, 390px e 430px;
- títulos `Tios Paternos` e `Tios Maternos` devem aparecer em cor escura;
- cards não podem ficar cortados, com conteúdo invisível ou fora da área rolável;
- a tela deve permitir rolagem interna quando houver mais conteúdo que altura disponível.

### 7.2 Problema recorrente documentado

`paternal-uncles` teve relatos de cards não visíveis. Possíveis causas a verificar em QA:

- ramo paterno sem dados suficientes após inferência de pai;
- `transform` do stage levando a tela para fora do viewport;
- conflito entre `overflow`, altura da tela e safe area;
- filtro de relações não retornando irmãos do pai;
- listener de swipe capturando gesto antes do scroll interno.

Arquivos relacionados:

```txt
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
```

---

## 8. Títulos dos grupos

Títulos monitorados:

```txt
Avós paternos
Avós maternos
Tios Paternos
Tios Maternos
Irmãos
Sobrinhos
Cônjuge
Pets
Filhos
Netos
```

Contrato:

- `display: block`;
- `visibility: visible`;
- `opacity: 1`;
- cor escura compatível com o fundo do grupo;
- `-webkit-text-fill-color` definido para evitar texto branco em Safari/iOS;
- fonte compacta no mobile;
- não depender da cor herdada do card;
- conectores não devem cobrir o título.

Arquivo relacionado:

```txt
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
```

---

## 9. Largura dos grupos por quantidade de cards

Os grupos podem receber o atributo:

```txt
data-family-map-card-count="N"
```

Contrato:

| Número de cards | Comportamento esperado |
|---|---|
| 1 | grupo mais estreito, sem excesso de área vazia |
| 2 ou 3 | largura intermediária, normalmente 2 colunas |
| 4 ou mais | largura máxima disponível dentro do viewport |
| Pets/Filhos sozinho abaixo de Cônjuge | pode ocupar área total do bloco de ramificação |

Regra: a largura visual nunca deve criar dados, ocultar cards ou alterar relacionamentos.

---

## 10. Zoom/overview com 9 cards

### 10.1 `/mapa-familiar`

O botão `Zoom` da toolbar mobile deve abrir uma visão geral com os 9 cards da grade 3x3.

Ao tocar em um card:

- o overview fecha;
- a tela correspondente é posicionada no stage;
- o estado `data-mobile-family-tree-active-screen` é atualizado;
- scroll interno da tela de destino é resetado para o topo.

Arquivo principal:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

Regras de implementação vigentes:

- o script deve carregar antes de `src/mobileFamilyTreeOverviewMode.ts` para interceptar o botão `Zoom` sem deixar estado preso;
- o overview exibe contagem como `pessoa`/`pessoas`, não como `card`/`cards`;
- não deve exibir `Toque para abrir`;
- não deve reintroduzir textos auxiliares como `ancestrais profundos`, `tela inicial da árvore`, `área lateral esquerda`, `área lateral direita`, `abaixo dos tios paternos` ou `abaixo dos tios maternos`;
- ao fechar pelo `X`, o body deve destravar e o botão Zoom não deve permanecer ativo.

### 10.2 `/mapa-familiar-horizontal`

Na rota horizontal mobile, o mesmo botão `Zoom` deve abrir o overview com 9 cards.

Como a horizontal trabalha por gerações, os cards direcionam para a geração mais próxima:

| Card no overview | Destino horizontal |
|---|---|
| bisavós/tataravós paternos ou maternos | geração 1 |
| avós | geração 3 |
| tios/pais | geração 4 |
| núcleo/primos | geração 5 |
| descendentes | geração 6 |

Arquivo principal:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

---

## 11. Painel do botão `+`

O botão `+` abre o painel mobile completo de visualização.

Contrato visual:

- overlay deve escurecer o fundo;
- painel principal deve ser branco e opaco;
- conteúdo interno deve ter scroll próprio;
- o painel não deve entrar em exportação;
- o fundo não deve parecer transparente a ponto de confundir com a árvore ao fundo.

Arquivo relacionado:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
```

Esse ajuste é importado em:

```txt
src/main.tsx
```

---

## 12. Scripts auxiliares carregados em `index.html`

A versão atual mantém scripts auxiliares mobile carregados em `index.html`.

Ordem relevante do código atual:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/main.tsx
src/firstLoginMobileTutorialFixes.ts
src/mobileCuriositiesNavigationFix.ts
src/mobileTreePanelViewportFix.ts
src/mobileFamilyTreeNavigationRules.ts
src/staticMobileFamilyTreeScreens.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
```

Regras:

- não remover script mobile sem testar a grade 3x3 completa;
- não alterar a ordem de `mobileFamilyTreeZoomOverviewFix.ts` sem revalidar o botão `Zoom`;
- `mobileFamilyTreeAncestorConnectorsFix.ts` e `mobileFamilyTreeDescendantConnectorsFix.ts` são ajustes pontuais de conectores e devem ser tratados como risco visual em QA;
- refatorações futuras devem preferir consolidar esses comportamentos no React, mas só depois de preservar a versão visual atual.

---

## 13. Performance e observers

Os scripts mobile usam `MutationObserver`, `requestAnimationFrame`, listeners de touch e ajustes de DOM. Para evitar loops ou travamentos:

- mutações geradas por camadas de conectores devem ser ignoradas por guards de performance;
- redesenho de conectores deve ser agendado por frame, não executado em cascata;
- scripts carregados no final devem ser usados com parcimônia;
- mudanças novas devem preferir consolidar lógica no componente React quando possível;
- todo ajuste em conectores deve ser validado em viewport real, porque medidas via `getBoundingClientRect()` podem variar com scroll interno e transform do stage.

Arquivo relacionado:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
```

---

## 14. QA obrigatório após alterações mobile

Executar em Safari/iOS quando possível:

```txt
320px
375px
390px
430px
```

Checklist mínimo:

- [ ] `/mapa-familiar` carrega sem travar.
- [ ] botão `Zoom` abre overview com 9 cards.
- [ ] cada card do overview navega para a tela correta.
- [ ] `ancestors` exibe avós paternos e maternos.
- [ ] `ancestors` exibe conectores horizontais laterais.
- [ ] `ancestors` exibe conectores verticais abaixo dos dois grupos de avós.
- [ ] `paternal-ancestors` e `maternal-ancestors` não exibem linhas verticais indevidas abaixo de bisavós/tataravós.
- [ ] `paternal-uncles` exibe título, grupo e cards quando houver dados.
- [ ] `maternal-uncles` exibe grupo centralizado e sem excesso de tamanho.
- [ ] `descendants` permite rolagem interna quando o conteúdo excede a altura útil.
- [ ] conectores de `descendants` não duplicam linhas antigas.
- [ ] conectores de `descendants` têm a mesma espessura visual das demais linhas.
- [ ] títulos de grupos estão escuros e legíveis.
- [ ] botão `+` abre painel com overlay escuro e painel branco/opaco.
- [ ] `/mapa-familiar-horizontal` abre overview pelo Zoom.
- [ ] overview da horizontal navega para a geração correspondente.
- [ ] bottom nav não cobre permanentemente o último card.
- [ ] não há scroll horizontal global indevido.

---

## 15. Pendências conhecidas

Manter como pontos de validação aberta até confirmação visual estável:

| ID | Pendência |
|---|---|
| `MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari real. |
| `MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais do ramo paterno. |
| `MOB-003` | Avaliar consolidação dos scripts auxiliares mobile dentro dos componentes React. |
| `MOB-004` | Confirmar mapeamento do overview da rota horizontal por geração com expectativa de produto. |
| `MOB-005` | Verificar se o painel `+` mantém overlay opaco em Safari/iOS após cache limpo. |
| `MOB-006` | Confirmar conectores verticais abaixo de `Avós paternos` e `Avós maternos` após o ajuste vigente. |
| `MOB-007` | Confirmar conectores da tela `descendants` após ajustes de espessura, topo e rolagem interna. |

---

## 16. Arquivos principais da frente mobile

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyMapFullPanelStyleFix.ts
```
