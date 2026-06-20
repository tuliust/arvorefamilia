# Auditoria do código atual — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md`  
> Escopo: conferência do código atual antes de tratar implementações mobile como consolidadas.  
> Status: atualizado após `mobileFamilyMapStableMobileFix.ts`, `mobileFamilyMapDirectionalNavigationFix.ts` e `mobileFamilyMapCoreConnectorFix.ts`.

---

## 1. Objetivo

Registrar o que o código atual indica sobre as rotas mobile:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Este documento existe porque parte das implementações mobile foi iterada em scripts auxiliares. Algumas frentes foram substituídas, removidas do carregamento ou preservadas apenas como histórico técnico.

A documentação funcional deve separar:

- comportamento observado no código;
- comportamento esperado de produto;
- comportamento que ainda exige QA visual real.

---

## 2. Scripts carregados atualmente

O `index.html` carrega, para o mapa mobile, os seguintes scripts auxiliares relevantes:

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

Consequência documental: comportamento vigente deve ser auditado nesses arquivos, não nos patches antigos removidos do `index.html`.

---

## 3. Arquivos substituídos ou legados

Os arquivos abaixo existem ou já foram usados, mas não são fonte de verdade se não estiverem carregados:

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

Regra: ao encontrar comportamento documentado nesses arquivos, verificar se ainda está carregado antes de tratá-lo como vigente.

---

## 4. Import global pelo `main.tsx`

O ajuste de fundo do painel mobile completo é importado por:

```txt
src/main.tsx
```

Arquivo importado:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
```

Contrato observado:

- overlay do `Painel de visualização` recebe fundo escuro;
- botão/área de fechamento recebe o mesmo fundo;
- `section` principal do painel recebe `background: #ffffff` e `opacity: 1`;
- o painel mantém rolagem interna.

---

## 5. `/mapa-familiar` — estrutura React e complementos DOM

No componente React `MobileFamilyTreeView`, o tipo nativo `MobileTreeScreen` contém seis telas:

```txt
ancestors
paternal-uncles
core
maternal-uncles
paternal-cousins
maternal-cousins
```

A grade nativa posiciona essas telas em:

| Tela | Posição nativa |
|---|---|
| `ancestors` | coluna 2, linha 1 |
| `paternal-uncles` | coluna 1, linha 2 |
| `core` | coluna 2, linha 2 |
| `maternal-uncles` | coluna 3, linha 2 |
| `paternal-cousins` | coluna 1, linha 3 |
| `maternal-cousins` | coluna 3, linha 3 |

As outras três telas da grade 3x3 são completadas por scripts auxiliares:

| Tela | Origem vigente |
|---|---|
| `paternal-ancestors` | `mobileFamilyTreeGrandparentScreens.ts` + contrato do guard direcional |
| `maternal-ancestors` | `mobileFamilyTreeGrandparentScreens.ts` + contrato do guard direcional |
| `descendants` | `mobileFamilyMapStableMobileFix.ts` |

Consequência documental: a grade 3x3 é comportamento composto por React + scripts auxiliares, não uma estrutura puramente nativa do componente React.

---

## 6. `/mapa-familiar` — tela `descendants`

A estabilização vigente da tela `descendants` está em:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Comportamento observado no código:

- procura a grade de descendentes dentro da tela `core`;
- clona o conteúdo relevante para uma tela `descendants`;
- cria `.mobile-family-descendant-screen__scroll` com `data-mobile-tree-scroll="true"`;
- posiciona a tela em coluna 2, linha 3;
- só mantém a tela quando existe conteúdo descendente;
- preserva scroll nativo quando ainda há conteúdo para rolar;
- reduz disputa de transform/scroll com listeners antigos removidos do carregamento.

Ponto de atenção:

- ainda exige QA em Safari/iOS real, porque a tela é dinâmica e depende de DOM clonado.

---

## 7. `/mapa-familiar` — navegação direcional

Arquivo vigente:

```txt
src/mobileFamilyMapDirectionalNavigationFix.ts
```

Matriz vigente no código:

| Tela | Destinos permitidos |
|---|---|
| `paternal-ancestors` | direita → `ancestors` |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` |
| `maternal-ancestors` | esquerda → `ancestors` |
| `core` | cima → `ancestors`; baixo → `descendants`; esquerda → `paternal-uncles`; direita → `maternal-uncles` |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` |
| `paternal-cousins` | cima → `paternal-uncles` |
| `descendants` | cima → `core` |
| `maternal-cousins` | cima → `maternal-uncles` |

Comportamento observado:

- captura direções permitidas e bloqueadas;
- bloqueia fallback de outra camada;
- respeita scroll vertical interno antes de navegar;
- aplica `transform` no stage com base em `SCREEN_POSITIONS`;
- usa `data-mobile-family-tree-active-screen` quando disponível e fallback por transform/geometria.

---

## 8. `/mapa-familiar` — telas de tios

Arquivos vigentes:

```txt
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
```

Comportamento observado:

- o modelo infere tios por irmãos do pai/mãe;
- o modelo também aceita relações diretas de `tio/tia`, `uncle/aunt`, `sobrinho/sobrinha`, `nephew/niece`;
- o script consolidado reduz altura artificial e posiciona grupos de tios mais acima;
- o guard direcional permite apenas direita/baixo em `paternal-uncles` e esquerda/baixo em `maternal-uncles`.

Ponto de atenção:

- se `paternal-uncles` não exibir cards, verificar dados reais, filtros, vínculo direto, inferência por irmãos do pai e visibilidade antes de tratar como bug de CSS.

---

## 9. `/mapa-familiar` — conector central abaixo da pessoa principal

Arquivo vigente:

```txt
src/mobileFamilyMapCoreConnectorFix.ts
```

Comportamento observado:

- atua somente em `/mapa-familiar` mobile;
- procura blocos `div.relative.mx-auto.h-9.w-full` dentro da tela `core`;
- identifica a primeira linha vertical central por classes `left-1/2`, `top-0`, `h-5`, `w-px`, `bg-cyan-600`;
- marca o elemento com `data-mobile-core-center-descendant-line="hidden"`;
- injeta CSS para ocultar apenas essa linha.

Contrato de QA:

- a linha vertical central abaixo da pessoa principal deve sumir;
- a linha horizontal e os conectores laterais para `Irmãos` e `Cônjuge` devem permanecer.

---

## 10. `/mapa-familiar` — títulos de grupos

Arquivo ativo:

```txt
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
```

Títulos monitorados:

```txt
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

Comportamento esperado:

- força `display`, `visibility`, `opacity`, cor e `-webkit-text-fill-color` quando necessário;
- evita título branco em fundo branco;
- preserva fonte compacta.

---

## 11. `/mapa-familiar-horizontal` — estado atual

O componente `MobileFamilyHorizontalMapView`:

- usa raiz `data-family-map-horizontal-mobile-root="true"`;
- renderiza uma geração ativa por tela;
- usa botões `Ger X` em `nav[aria-label="Gerações do Mapa Genealógico"]`;
- usa `data-mobile-horizontal-generation="N"` nos cards;
- mantém scroll vertical interno no stage mobile;
- expõe geração ativa e cards para o script de overview.

Cônjuges filtráveis atuais no código horizontal:

```txt
irmaos
tios
primos
sobrinhos
filhos
netos
```

Ponto de atenção:

- `pais`/Geração 4 não aparece nesse conjunto filtrável e não deve ser documentado como implementado sem correção específica.

---

## 12. Zoom/overview mobile

Arquivo vigente:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Comportamento observado:

- suporta `/mapa-familiar` e `/mapa-familiar-horizontal`;
- intercepta o botão `data-mobile-family-map-toolbar-action="zoom"`;
- cria o overlay `mobile-family-tree-overview-mode`;
- monta cards por `SCREEN_POSITIONS`;
- em `/mapa-familiar`, aplica `transform` no stage para navegar até a tela da grade;
- em `/mapa-familiar-horizontal`, tenta clicar no botão `Ger N` correspondente.

Ponto de atenção:

- na horizontal, a navegação depende da existência do botão `Ger N`. Se a geração não estiver em `activeGenerations`, o clique não encontra destino.

---

## 13. Pendências documentais/QA sem conflito de IDs

Para não conflitar com IDs `MOB-001` e `MOB-002` já existentes em backlog geral, usar o prefixo `MAP-MOB` para pendências específicas dos mapas mobile quando a frente não estiver registrada em `PLANO_PROXIMOS_PASSOS.md`.

| ID | Tema |
|---|---|
| `MAP-MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari real. |
| `MAP-MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais do ramo paterno. |
| `MAP-MOB-003` | Confirmar bloqueio de direções proibidas nas 9 telas. |
| `MAP-MOB-004` | Confirmar comportamento do overview da horizontal quando a geração de destino não está ativa/visível. |
| `MAP-MOB-005` | Confirmar overlay opaco do painel `+` em Safari/iOS após cache limpo. |
| `MAP-MOB-006` | Confirmar que a linha vertical central abaixo da pessoa principal foi removida sem remover conectores laterais. |
| `MAP-MOB-007` | Avaliar consolidação futura dos scripts auxiliares mobile dentro de React/hooks. |

---

## 14. Regra para documentação futura

Não registrar como comportamento consolidado sem checar o código atual e, quando aplicável, validar visualmente:

- rolagem interna;
- posição de stage/transform;
- telas dinâmicas criadas por script;
- abertura e navegação do overview;
- painel `+`;
- exibição de `paternal-uncles`;
- conectores clonados/dinâmicos;
- remoção da linha central abaixo da pessoa principal;
- Safari/iOS.
