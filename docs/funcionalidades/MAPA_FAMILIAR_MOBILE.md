# Mapa Familiar Mobile — contrato vigente da grade 3x3

> Última revisão: 2026-06-20  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`  
> Escopo: comportamento mobile de `/mapa-familiar` e `/mapa-familiar-horizontal`  
> Status: contrato funcional atualizado após consolidação dos scripts mobile, guard direcional e limpeza de conector central.

---

## 1. Objetivo

Este documento complementa `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` com o contrato mobile específico das duas views oficiais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Use este arquivo para validar e alterar:

- grade 3x3 da Árvore Familiar mobile;
- navegação direcional por swipe;
- tela `descendants`;
- telas de avós, ancestrais profundos, tios e primos;
- títulos de grupos;
- largura/altura dos grupos por quantidade de cards;
- conectores mobile;
- botão `Zoom`/overview;
- painéis `Formato`, `Cor`, `Filtros` e botão `+`;
- rolagem interna em telas com conteúdo maior que a altura útil.

Regra documental: quando houver divergência entre contrato desejado e comportamento observado, registrar como pendência. Não documentar regressão como comportamento consolidado.

---

## 2. Carregamento mobile vigente

O `index.html` carrega hoje, depois do app principal, estes scripts relevantes para os mapas mobile:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
src/main.tsx
src/firstLoginMobileTutorialFixes.ts
src/mobileCuriositiesNavigationFix.ts
src/mobileTreePanelViewportFix.ts
src/staticMobileFamilyTreeScreens.ts
src/mobileFamilyTreeScreenStateGuards.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
```

Os scripts antigos abaixo existem no repositório, mas **não são contrato ativo** se não estiverem carregados no `index.html`:

```txt
src/mobileFamilyTreeViewportContentFix.ts
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/mobileFamilyMapMicroLayoutFix.ts
src/mobileFamilyMapOverviewNavigationBridge.ts
```

Regra: ao auditar o comportamento vigente, considerar primeiro o que está carregado em `index.html`, depois o que está importado por `main.tsx`, e só então arquivos legados existentes.

---

## 3. Responsabilidades dos scripts vigentes

| Arquivo | Responsabilidade vigente |
|---|---|
| `mobileFamilyMapStableMobileFix.ts` | consolida estabilidade geral: tela `descendants`, scroll interno, tios, primos, painéis compactos e overview/Zoom |
| `mobileFamilyMapDirectionalNavigationFix.ts` | aplica e bloqueia direções de swipe da grade 3x3 em `/mapa-familiar` |
| `mobileFamilyMapCoreConnectorFix.ts` | oculta a linha vertical central abaixo da pessoa principal, entre `Irmãos` e `Cônjuge` |
| `mobileFamilyTreeGrandparentScreens.ts` | cria/apoia telas dinâmicas de ancestrais profundos |
| `mobileFamilyTreeAncestorConnectorsFix.ts` | ajusta conectores de avós e ancestrais |
| `mobileFamilyTreeDescendantConnectorsFix.ts` | ajusta conectores internos da área descendente |
| `mobileFamilyTreeCoreDescendantConnector.ts` | mantém conectores do núcleo com área descendente, exceto a linha central removida pelo cleanup |
| `mobileFamilyTreeGroupTitleVisibilityFix.ts` | preserva títulos escuros e legíveis no mobile |
| `mobileFamilyTreeMutationPerformanceGuard.ts` | reduz risco de loops por `MutationObserver` |

Regra de manutenção: evitar criar novo listener global de touch antes de auditar `mobileFamilyMapStableMobileFix.ts` e `mobileFamilyMapDirectionalNavigationFix.ts`.

---

## 4. Grade 3x3 de `/mapa-familiar`

No mobile, `/mapa-familiar` opera como uma grade de 9 telas.

| Posição | Tela técnica | Nome funcional | Conteúdo esperado |
|---|---|---|---|
| Superior esquerda | `paternal-ancestors` | Bisavós paternos | bisavós/tataravós paternos |
| Superior centro | `ancestors` | Avós | avós paternos e maternos |
| Superior direita | `maternal-ancestors` | Bisavós maternos | bisavós/tataravós maternos |
| Meio esquerda | `paternal-uncles` | Tios paternos | irmãos do pai e vínculos diretos de tio/tia paternos |
| Meio centro | `core` | Núcleo central | pai, mãe, pessoa central e grupos descendentes originais |
| Meio direita | `maternal-uncles` | Tios maternos | irmãos da mãe e vínculos diretos de tio/tia maternos |
| Inferior esquerda | `paternal-cousins` | Primos paternos | descendentes dos tios paternos |
| Inferior centro | `descendants` | Descendentes | irmãos, cônjuge, sobrinhos, pets, filhos e netos |
| Inferior direita | `maternal-cousins` | Primos maternos | descendentes dos tios maternos |

A posição técnica atual é:

```txt
paternal-ancestors  coluna 0, linha 0
ancestors           coluna 1, linha 0
maternal-ancestors  coluna 2, linha 0
paternal-uncles     coluna 0, linha 1
core                coluna 1, linha 1
maternal-uncles     coluna 2, linha 1
paternal-cousins    coluna 0, linha 2
descendants         coluna 1, linha 2
maternal-cousins    coluna 2, linha 2
```

---

## 5. Contrato de navegação da grade 3x3

As direções abaixo são direções funcionais de destino na grade. No código de touch, o movimento físico do dedo é convertido para essa direção funcional.

| Tela atual | Direções permitidas | Direções bloqueadas |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; baixo → `descendants`; esquerda → `paternal-uncles`; direita → `maternal-uncles` | nenhuma, se houver conteúdo no destino |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core` | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

Implementação ativa:

```txt
src/mobileFamilyMapDirectionalNavigationFix.ts
```

Esse arquivo deve capturar tanto direções permitidas quanto bloqueadas para impedir fallback de outro listener. Em telas com scroll vertical interno, a rolagem nativa deve prevalecer enquanto ainda houver conteúdo a rolar.

---

## 6. Semântica de gesto no código

A conversão usada pelos guards mobile é:

```txt
arrastar dedo para a esquerda  => direção funcional right
arrastar dedo para a direita   => direção funcional left
arrastar dedo para cima        => direção funcional down
arrastar dedo para baixo       => direção funcional up
```

Ao documentar bug de navegação, registrar sempre:

```txt
1. rota;
2. tela atual;
3. movimento físico do dedo;
4. direção funcional esperada;
5. tela de destino esperada;
6. tela real após o gesto;
7. se havia scroll interno disponível.
```

---

## 7. Tela `core`

A tela `core` é a tela central da grade.

Conteúdo esperado:

- pai;
- mãe;
- pessoa central;
- grupos originais abaixo da pessoa central: `Irmãos`, `Sobrinhos`, `Cônjuge`, `Pets`, `Filhos`, `Netos`.

Contrato visual:

- a pessoa central permanece no eixo central;
- conectores superiores entre pai/mãe e pessoa central permanecem;
- a linha horizontal que ramifica para `Irmãos` e `Cônjuge` permanece;
- a linha vertical central imediatamente abaixo da pessoa principal, entre `Irmãos` e `Cônjuge`, deve ficar oculta no mobile;
- bottom nav não pode cobrir permanentemente os cards.

Implementação do cleanup específico:

```txt
src/mobileFamilyMapCoreConnectorFix.ts
```

---

## 8. Tela `descendants`

A tela `descendants` fica abaixo da tela `core`.

Ela contém, quando houver dados:

```txt
Irmãos
Sobrinhos
Cônjuge
Pets
Filhos
Netos
```

Contrato:

- deve ter área interna rolável quando o conteúdo for maior que a altura útil;
- o scroll vertical deve ocorrer dentro da tela;
- o swipe para voltar à tela `core` só deve ser capturado quando a rolagem interna estiver no topo;
- o bottom nav e a safe area não devem impedir acesso ao último grupo;
- não deve haver tremor por disputa de `transform` entre React e scripts.

Implementação ativa:

```txt
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
```

---

## 9. Telas de tios

Telas:

```txt
paternal-uncles
maternal-uncles
```

Contrato visual:

- grupo alinhado mais acima da tela, sem excesso de espaço vertical vazio;
- altura proporcional ao conteúdo;
- largura adaptada à quantidade de cards;
- cards legíveis em 320px, 375px, 390px e 430px;
- títulos escuros e visíveis;
- não deve haver linha vertical acima do grupo;
- se houver mais cards que a altura útil, a tela deve rolar internamente.

Contrato de dados:

- `mobileFamilyTreeModel.ts` deve inferir tios por irmãos do pai/mãe;
- também deve aceitar vínculos diretos de `tio/tia`, `uncle/aunt` e relações inversas de `sobrinho/sobrinha`, quando esses dados existirem;
- ajuste visual não pode criar pessoas fictícias.

---

## 10. Telas de primos

Telas:

```txt
paternal-cousins
maternal-cousins
```

Contrato:

- o grupo deve ficar posicionado de forma que a linha vertical conecte ao topo do container;
- se houver conteúdo maior que a altura útil, deve haver rolagem interna;
- `paternal-cousins` só navega funcionalmente para cima, voltando a `paternal-uncles`;
- `maternal-cousins` só navega funcionalmente para cima, voltando a `maternal-uncles`.

---

## 11. Títulos dos grupos

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
Cônjuge
Pets
Filhos
Netos
Primos Paternos
Primos Maternos
```

Contrato:

- `display: block`;
- `visibility: visible`;
- `opacity: 1`;
- cor escura compatível com o fundo do grupo;
- `-webkit-text-fill-color` definido quando necessário para Safari/iOS;
- fonte compacta no mobile;
- não depender da cor herdada do card.

Arquivo ativo relacionado:

```txt
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
```

---

## 12. Painéis superiores `Formato`, `Cor`, `Filtros` e `Zoom`

Contrato:

- `Formato`, `Cor` e `Filtros` abrem painel abaixo da toolbar sem espaço branco excessivo;
- `Zoom` abre overview, não legenda genérica;
- abrir ou fechar painel não deve deslocar permanentemente a tela ativa;
- abrir ou fechar painel não deve travar `body`;
- opções devem permanecer tocáveis em Safari/iOS.

Implementação ativa para compactação e Zoom:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

---

## 13. Zoom/overview com 9 cards

### `/mapa-familiar`

O botão `Zoom` da toolbar mobile deve abrir uma visão geral da grade 3x3.

Ao tocar em um card:

- o overview fecha;
- a tela correspondente é posicionada no stage;
- o estado `data-mobile-family-tree-active-screen` é atualizado;
- scroll interno da tela de destino é resetado para o topo.

### `/mapa-familiar-horizontal`

Na rota horizontal mobile, o mesmo botão `Zoom` deve abrir o overview e direcionar para a geração mais próxima.

Mapeamento vigente:

| Card no overview | Destino horizontal |
|---|---|
| ancestrais profundos | geração 1 |
| avós | geração 3 |
| tios/pais | geração 4 |
| núcleo/primos | geração 5 |
| descendentes | geração 6 |

A navegação horizontal depende da existência visual do botão `Ger N` de destino.

---

## 14. Painel do botão `+`

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

## 15. Performance e observers

Os scripts mobile usam `MutationObserver`, `requestAnimationFrame`, listeners de touch e ajustes de DOM.

Regras:

- mutações geradas por camadas de conectores devem ser ignoradas por guards de performance;
- redesenho de conectores deve ser agendado por frame, não executado em cascata;
- scripts carregados no final devem ser usados com parcimônia;
- qualquer nova camada de touch/swipe deve declarar quais telas controla e quais telas não controla;
- não adicionar novo script global se a alteração puder ser feita no script consolidado vigente.

Arquivo relacionado:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
```

---

## 16. QA obrigatório após alterações mobile

Executar em Safari/iOS quando possível:

```txt
320px
375px
390px
430px
```

Checklist mínimo:

- [ ] `/mapa-familiar` carrega sem travar.
- [ ] as 9 telas existem ou têm ausência justificada por falta de dados.
- [ ] a matriz direcional de swipe é respeitada.
- [ ] nenhum gesto bloqueado muda de tela.
- [ ] `descendants` rola internamente e não treme.
- [ ] `Tios Maternos` fica com altura compacta.
- [ ] `Tios Paternos` mostra cards quando houver dados reais ou estado vazio controlado quando não houver.
- [ ] a linha vertical central abaixo da pessoa principal não aparece entre `Irmãos` e `Cônjuge`.
- [ ] os conectores de primos chegam ao topo dos grupos.
- [ ] botão `Zoom` abre overview nas duas rotas.
- [ ] `Cor` e `Filtros` abrem painéis sem espaço branco excessivo.
- [ ] bottom nav não cobre permanentemente o último card.

---

## 17. Pendências conhecidas

Manter como pontos de validação aberta até confirmação visual estável:

| ID | Pendência |
|---|---|
| `MAP-MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari real. |
| `MAP-MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais. |
| `MAP-MOB-003` | Confirmar que o guard direcional bloqueia todas as direções proibidas nas 9 telas. |
| `MAP-MOB-004` | Confirmar mapeamento do overview da rota horizontal por geração. |
| `MAP-MOB-005` | Confirmar overlay opaco do painel `+` em Safari/iOS após cache limpo. |
| `MAP-MOB-006` | Revalidar conectores de avós, tios, descendentes e primos após qualquer mudança no sistema de navegação. |
| `MAP-MOB-007` | Avaliar migração futura dos scripts DOM consolidados para React/hooks. |

---

## 18. Arquivos principais da frente mobile

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyTreeMutationPerformanceGuard.ts
```
