# Mapa Familiar Mobile — grade 3x3, zoom, scroll e conectores

> Última revisão: 2026-06-20  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`  
> Escopo: comportamento mobile das rotas `/mapa-familiar` e `/mapa-familiar-horizontal`  
> Status: documentação complementar criada após a rodada de ajustes de responsividade, conectores, rolagem e overview mobile.

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
- títulos de grupos;
- largura dos grupos por número de cards;
- conectores mobile;
- botão Zoom/overview com 9 cards;
- painel aberto pelo botão `+`;
- rolagem interna em telas com conteúdo maior que a altura útil.

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

Arquivos relacionados:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeUncleScreenGuards.ts
```

---

## 3. Tela `descendants`

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

### 3.1 Rolagem interna

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

### 3.2 Conectores internos

Contrato esperado:

- uma linha superior entra na tela `descendants` e se ramifica para `Irmãos` e `Cônjuge`;
- de `Irmãos`, a linha desce para `Sobrinhos`;
- de `Cônjuge`, a linha desce e pode se ramificar para `Pets` e `Filhos`;
- se houver `Pets` e `Filhos`, os dois grupos ficam lado a lado;
- se houver apenas `Pets`, `Pets` ocupa sozinho a área abaixo de `Cônjuge`;
- se houver apenas `Filhos`, `Filhos` ocupa sozinho a área abaixo de `Cônjuge`;
- conectores antigos clonados do layout original não devem aparecer como linhas transparentes ou duplicadas.

Arquivo relacionado:

```txt
src/mobileFamilyTreeDescendantConnectorsFix.ts
```

---

## 4. Telas de tios

Telas envolvidas:

```txt
paternal-uncles
maternal-uncles
```

### 4.1 Contrato visual

- o grupo deve ficar centralizado na tela;
- o grupo deve ajustar largura conforme quantidade de cards;
- os cards devem permanecer legíveis em 320px, 375px, 390px e 430px;
- títulos `Tios Paternos` e `Tios Maternos` devem aparecer em cor escura;
- cards não podem ficar cortados, com conteúdo invisível ou fora da área rolável;
- a tela deve permitir rolagem interna quando houver mais conteúdo que altura disponível.

### 4.2 Problema recorrente documentado

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

## 5. Títulos dos grupos

Títulos monitorados:

```txt
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

## 6. Largura dos grupos por quantidade de cards

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

## 7. Zoom/overview com 9 cards

### 7.1 `/mapa-familiar`

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

### 7.2 `/mapa-familiar-horizontal`

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

## 8. Painel do botão `+`

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

## 9. Performance e observers

Os scripts mobile usam `MutationObserver`, `requestAnimationFrame`, listeners de touch e ajustes de DOM. Para evitar loops ou travamentos:

- mutações geradas por camadas de conectores devem ser ignoradas por guards de performance;
- redesenho de conectores deve ser agendado por frame, não executado em cascata;
- scripts carregados no final devem ser usados com parcimônia;
- mudanças novas devem preferir consolidar lógica no componente React quando possível.

Arquivo relacionado:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
```

---

## 10. QA obrigatório após alterações mobile

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
- [ ] `paternal-uncles` exibe título, grupo e cards quando houver dados.
- [ ] `maternal-uncles` exibe grupo centralizado e sem excesso de tamanho.
- [ ] `descendants` permite rolagem interna quando o conteúdo excede a altura útil.
- [ ] conectores de `descendants` não duplicam linhas antigas.
- [ ] títulos de grupos estão escuros e legíveis.
- [ ] botão `+` abre painel com overlay escuro e painel branco/opaco.
- [ ] `/mapa-familiar-horizontal` abre overview pelo Zoom.
- [ ] overview da horizontal navega para a geração correspondente.
- [ ] bottom nav não cobre permanentemente o último card.
- [ ] não há scroll horizontal global indevido.

---

## 11. Pendências conhecidas

Manter como pontos de validação aberta até confirmação visual estável:

| ID | Pendência |
|---|---|
| `MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari real. |
| `MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais do ramo paterno. |
| `MOB-003` | Avaliar consolidação dos scripts auxiliares mobile dentro dos componentes React. |
| `MOB-004` | Confirmar mapeamento do overview da rota horizontal por geração com expectativa de produto. |
| `MOB-005` | Verificar se o painel `+` mantém overlay opaco em Safari/iOS após cache limpo. |

---

## 12. Arquivos principais da frente mobile

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
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyMapFullPanelStyleFix.ts
```
