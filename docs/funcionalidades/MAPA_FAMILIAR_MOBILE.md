# Mapa Familiar Mobile — grade 3x3, zoom, scroll e conectores

> Última revisão: 2026-06-20  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`  
> Escopo: comportamento mobile das rotas `/mapa-familiar` e `/mapa-familiar-horizontal`  
> Status: contrato funcional e técnico complementar. A navegação mobile da grade 3x3 está em validação, com risco conhecido de regressão por sobreposição de scripts auxiliares.

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
- telas de avós, ancestrais profundos, tios e primos;
- títulos de grupos;
- largura dos grupos por número de cards;
- conectores mobile;
- botão `Zoom`/overview com 9 cards;
- painel aberto pelo botão `+`;
- rolagem interna em telas com conteúdo maior que a altura útil.

Regra documental: quando houver divergência entre contrato desejado e comportamento observado, registrar como pendência. Não documentar regressão como comportamento consolidado.

---

## 2. Estado atual auditado no código

O `index.html` carrega o app principal e vários módulos auxiliares mobile. A ordem atual inclui, entre outros:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/main.tsx
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

O arquivo que melhor representa a matriz-alvo atual é:

```txt
src/mobileFamilyTreeNavigationRules.ts
```

Ele define:

- as 9 telas da grade;
- a posição técnica de cada tela;
- as direções de navegação esperadas;
- o `transform` aplicado no stage.

Atenção: ainda existem listeners de gesto em scripts específicos (`GrandparentScreens`, `DescendantScreen` e `UncleScreenGuards`). Esses scripts podem competir com `mobileFamilyTreeNavigationRules.ts`. Qualquer correção nova de navegação deve preferir consolidar a regra em uma única camada, em vez de adicionar novo patch concorrente.

---

## 3. Grade 3x3 da rota `/mapa-familiar`

No mobile, `/mapa-familiar` deve operar como uma grade de 9 telas.

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

Arquivos relacionados:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeUncleScreenGuards.ts
```

---

## 4. Contrato de navegação da grade 3x3

### 4.1 Direções funcionais

As direções abaixo descrevem a tela de destino esperada, não necessariamente o sentido físico do dedo no código.

| Tela atual | Direções permitidas | Direções bloqueadas |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; esquerda → `paternal-uncles`; direita → `maternal-uncles`; baixo → `descendants` | nenhuma, desde que exista conteúdo de destino |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core` | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

### 4.2 Semântica de gesto no código

Nos listeners atuais, a direção é calculada por delta do toque:

```txt
deltaX < 0 => direção funcional right
deltaX > 0 => direção funcional left
deltaY < 0 => direção funcional down
deltaY > 0 => direção funcional up
```

Essa diferença causa confusão recorrente em QA. Ao documentar bug, registrar sempre:

```txt
1. tela atual;
2. movimento físico do dedo;
3. direção funcional esperada;
4. tela de destino esperada;
5. tela real após o gesto.
```

### 4.3 Regra de implementação

`mobileFamilyTreeNavigationRules.ts` deve ser tratado como o contrato técnico preferencial. Scripts específicos podem ajustar visual, sizing, scroll ou conectores, mas não devem redefinir navegação se a regra puder ficar no coordenador principal.

Pendência atual: remover duplicidade de captura de gestos entre:

```txt
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeUncleScreenGuards.ts
```

---

## 5. Tela `ancestors`

Conteúdo esperado:

```txt
Avós Paternos
Avós Maternos
```

Contrato visual:

- grupos não devem ficar colados no topo do viewport;
- não deve haver linha vertical acima dos grupos de avós;
- `Avós Paternos` deve ter linha horizontal lateral para a esquerda, apontando para `paternal-ancestors`;
- `Avós Maternos` deve ter linha horizontal lateral para a direita, apontando para `maternal-ancestors`;
- linhas verticais abaixo dos grupos podem existir para indicar conexão com a tela `core`.

Arquivos relacionados:

```txt
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
```

---

## 6. Telas de ancestrais profundos

Telas:

```txt
paternal-ancestors
maternal-ancestors
```

Contrato:

- `paternal-ancestors` exibe bisavós/tataravós paternos;
- `maternal-ancestors` exibe bisavós/tataravós maternos;
- grupos e cards devem ser mais estreitos que os grupos de avós;
- bordas e cards devem seguir a mesma família visual dos avós;
- `paternal-ancestors` deve ter linha horizontal para a direita;
- `maternal-ancestors` deve ter linha horizontal para a esquerda;
- não deve haver navegação vertical nessas telas.

---

## 7. Tela `descendants`

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

### 7.1 Rolagem interna

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

### 7.2 Conectores internos

Contrato esperado:

- uma linha superior entra na tela `descendants` e se ramifica para `Irmãos` e `Cônjuge`;
- de `Irmãos`, a linha desce para `Sobrinhos`;
- de `Cônjuge`, a linha desce e pode se ramificar para `Pets` e `Filhos`;
- se houver `Pets` e `Filhos`, os dois grupos ficam lado a lado;
- se houver apenas `Pets`, `Pets` ocupa sozinho a área abaixo de `Cônjuge`;
- se houver apenas `Filhos`, `Filhos` ocupa sozinho a área abaixo de `Cônjuge`;
- conectores antigos clonados do layout original não devem aparecer como linhas transparentes ou duplicadas.

Arquivos relacionados:

```txt
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
```

---

## 8. Telas de tios

Telas envolvidas:

```txt
paternal-uncles
maternal-uncles
```

### 8.1 Contrato visual

- o grupo deve ficar centralizado na tela;
- o grupo deve ajustar largura conforme quantidade de cards;
- os cards devem permanecer legíveis em 320px, 375px, 390px e 430px;
- títulos `Tios Paternos` e `Tios Maternos` devem aparecer em cor escura;
- não deve haver linha vertical acima dos grupos de tios;
- deve haver apenas conector inferior quando houver tela de primos correspondente;
- cards não podem ficar cortados, com conteúdo invisível ou fora da área rolável;
- a tela deve permitir rolagem interna quando houver mais conteúdo que altura disponível.

### 8.2 Contrato de navegação

| Tela | Permitido | Bloqueado |
|---|---|---|
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima; esquerda |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima; direita |

Arquivo relacionado:

```txt
src/mobileFamilyTreeUncleScreenGuards.ts
```

### 8.3 Problema recorrente documentado

As telas de tios tiveram relatos de navegação errada e gestos não respeitados. Possíveis causas a verificar em QA:

- conflito entre `mobileFamilyTreeNavigationRules.ts` e `mobileFamilyTreeUncleScreenGuards.ts`;
- listener global bloqueando gesto antes do scroll interno;
- `data-mobile-family-tree-active-screen` divergente do `transform` real do stage;
- tela de primos não considerada como conteúdo disponível por `screenHasContent`;
- overflow/safe area impedindo gesto dentro da área útil.

Arquivos relacionados:

```txt
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
```

---

## 9. Títulos dos grupos

Títulos monitorados:

```txt
Avós Paternos
Avós Maternos
Bisavós Paternos
Bisavós Maternos
Tios Paternos
Tios Maternos
Irmãos
Sobrinhos
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
- não depender da cor herdada do card.

Arquivo relacionado:

```txt
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
```

---

## 10. Largura dos grupos por quantidade de cards

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

## 11. Zoom/overview com 9 cards

### 11.1 `/mapa-familiar`

O botão `Zoom` da toolbar mobile deve abrir uma visão geral com os 9 cards da grade 3x3.

Ao tocar em um card:

- o overview fecha;
- a tela correspondente é posicionada no stage;
- o estado `data-mobile-family-tree-active-screen` é atualizado;
- scroll interno da tela de destino é resetado para o topo.

Arquivos principais:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyMapOverviewNavigationBridge.ts
```

### 11.2 `/mapa-familiar-horizontal`

Na rota horizontal mobile, o mesmo botão `Zoom` deve abrir o overview com 9 cards.

Como a horizontal trabalha por gerações, os cards direcionam para a geração mais próxima:

| Card no overview | Destino horizontal |
|---|---|
| ancestrais profundos | geração 1 |
| avós | geração 3 |
| tios/pais | geração 4 |
| núcleo/primos | geração 5 |
| descendentes | geração 6 |

Arquivo principal:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

---

## 12. Painel do botão `+`

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

## 13. Performance e observers

Os scripts mobile usam `MutationObserver`, `requestAnimationFrame`, listeners de touch e ajustes de DOM. Para evitar loops ou travamentos:

- mutações geradas por camadas de conectores devem ser ignoradas por guards de performance;
- redesenho de conectores deve ser agendado por frame, não executado em cascata;
- scripts carregados no final devem ser usados com parcimônia;
- mudanças novas devem preferir consolidar lógica no componente React quando possível;
- qualquer nova camada de touch/swipe deve declarar quais telas controla e quais telas não controla.

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
- [ ] `ancestors` mostra apenas avós e não mostra bisavós/tataravós.
- [ ] `ancestors` volta para `core` pela navegação vertical esperada.
- [ ] `paternal-ancestors` volta apenas para `ancestors`.
- [ ] `maternal-ancestors` volta apenas para `ancestors`.
- [ ] `paternal-uncles` permite apenas direita e baixo.
- [ ] `maternal-uncles` permite apenas esquerda e baixo.
- [ ] `paternal-cousins` volta apenas para `paternal-uncles`.
- [ ] `maternal-cousins` volta apenas para `maternal-uncles`.
- [ ] `descendants` permite rolagem interna quando o conteúdo excede a altura útil.
- [ ] conectores de `descendants` não duplicam linhas antigas.
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
| `MOB-002` | Confirmar exibição de cards em `paternal-uncles` e `maternal-uncles` com dados reais. |
| `MOB-003` | Consolidar navegação da grade 3x3 em uma única camada, reduzindo conflitos entre scripts de gesture. |
| `MOB-004` | Confirmar mapeamento do overview da rota horizontal por geração com expectativa de produto. |
| `MOB-005` | Verificar se o painel `+` mantém overlay opaco em Safari/iOS após cache limpo. |
| `MOB-006` | Revalidar conectores de avós, tios e descendentes após qualquer mudança no sistema de navegação. |

---

## 16. Arquivos principais da frente mobile

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyMapOverviewNavigationBridge.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/mobileFamilyMapFullPanelStyleFix.ts
```
