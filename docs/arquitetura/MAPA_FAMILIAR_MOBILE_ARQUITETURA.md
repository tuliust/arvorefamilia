# Arquitetura — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`  
> Escopo: arquitetura técnica dos mapas mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`.  
> Status: referência arquitetural. A navegação da grade 3x3 ainda precisa ser consolidada para reduzir regressões de gesture.

---

## 1. Visão geral

As rotas oficiais da árvore possuem renderizações mobile específicas:

| Rota | Componente mobile | Modelo de navegação |
|---|---|---|
| `/mapa-familiar` | `MobileFamilyTreeView` | grade 3x3 com telas por ramo familiar |
| `/mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` | uma geração por tela, botões `Ger X` e swipe lateral |

A arquitetura atual combina componentes React com scripts auxiliares carregados no `index.html` e, em um caso, via `main.tsx`.

---

## 2. `/mapa-familiar` mobile

### 2.1 Componente base

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidades:

- renderizar estrutura principal mobile;
- montar tela `core`;
- renderizar grupos de avós, tios, primos e descendentes originais;
- aplicar cards por `VisualPersonCard`/cards mobile;
- expor atributos usados por scripts auxiliares.

### 2.2 Modelo de dados

```txt
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
```

Responsabilidades:

- identificar pessoa central;
- identificar pai e mãe;
- montar ramos paterno e materno;
- calcular irmãos, sobrinhos, filhos, netos, pets e cônjuges;
- inferir pai/mãe quando relacionamento explícito não for suficiente.

Regra: inferência de visualização não cria nem persiste dados.

---

## 3. Grade 3x3

A grade mobile usa atributos de tela:

```txt
data-mobile-family-tree-screen="..."
```

Telas esperadas:

```txt
paternal-ancestors
ancestors
maternal-ancestors
paternal-uncles
core
maternal-uncles
paternal-cousins
descendants
maternal-cousins
```

O stage é identificado por:

```txt
data-mobile-family-tree-stage="true"
```

A raiz é identificada por:

```txt
data-mobile-family-tree-root="true"
```

A matriz técnica atual fica em:

```txt
src/mobileFamilyTreeNavigationRules.ts
```

Esse arquivo define `SCREEN_POSITIONS`, `DESTINATIONS`, cálculo de direção por delta e aplicação do `transform` do stage.

---

## 4. Camadas atuais da vertical mobile

| Arquivo | Papel atual | Observação de risco |
|---|---|---|
| `MobileFamilyTreeView.tsx` | estrutura React base da grade original | ainda renderiza parte do conteúdo que scripts clonam/ocultam |
| `mobileFamilyTreeNavigationRules.ts` | coordenador preferencial da grade 3x3 | deve ser fonte principal para navegação futura |
| `mobileFamilyTreeGrandparentScreens.ts` | cria telas superiores laterais e trata gestos de avós/ancestrais | também captura touch; pode competir com o coordenador |
| `mobileFamilyTreeDescendantScreen.ts` | cria tela `descendants`, clona grid de descendentes e trata scroll/gesto vertical | também captura touch; deve ser integrado ao coordenador no futuro |
| `mobileFamilyTreeUncleScreenGuards.ts` | bloqueia direções inválidas e força destino em telas de tios | também captura touch; causa provável de regressões se divergir da matriz |
| `mobileFamilyTreeScreenStateGuards.ts` | limpa estado stale quando `active-screen` diverge do transform | depende de padrões de transform |
| `mobileFamilyTreeSwipeHints.ts` | exibe setas temporárias de navegação | deve refletir as mesmas direções da matriz oficial |
| `mobileFamilyTreeZoomOverviewFix.ts` | controla overview/zoom mobile | deve navegar usando os mesmos nomes de tela |
| `mobileFamilyTreeOverviewMode.ts` / `mobileFamilyTreeOverviewFixes.ts` | complementos visuais/funcionais do overview | manter sincronizado com os 9 destinos |
| `mobileFamilyTreeAncestorConnectorsFix.ts` | conectores de avós/ancestrais | visual; não deve controlar navegação |
| `mobileFamilyTreeCoreDescendantConnector.ts` | linha entre núcleo e descendentes | visual; não deve controlar navegação |
| `mobileFamilyTreeDescendantConnectorsFix.ts` | conectores internos de descendentes | visual; não deve controlar navegação |
| `mobileFamilyTreeUncleSizingFix.ts` | sizing/centralização de tios | visual; não deve controlar navegação |
| `mobileFamilyTreeGroupTitleVisibilityFix.ts` | visibilidade de títulos | visual; não deve controlar navegação |
| `mobileFamilyTreeScrollAndVisibilityFix.ts` | reforços de scroll/visibilidade | pode interagir com gesture; validar em Safari |
| `mobileFamilyTreeMutationPerformanceGuard.ts` | reduz loops de MutationObserver | deve carregar antes das camadas que mutam DOM |

Regra arquitetural: navegação e direções devem existir em um único lugar. Scripts visuais podem ler estado, mas não devem ter regras divergentes de destino.

---

## 5. Navegação 3x3 — contrato arquitetural

Matriz técnica esperada:

| Tela | Coluna | Linha | Destinos permitidos |
|---|---:|---:|---|
| `paternal-ancestors` | 0 | 0 | direita → `ancestors` |
| `ancestors` | 1 | 0 | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` |
| `maternal-ancestors` | 2 | 0 | esquerda → `ancestors` |
| `paternal-uncles` | 0 | 1 | direita → `core`; baixo → `paternal-cousins` |
| `core` | 1 | 1 | cima → `ancestors`; esquerda → `paternal-uncles`; direita → `maternal-uncles`; baixo → `descendants` |
| `maternal-uncles` | 2 | 1 | esquerda → `core`; baixo → `maternal-cousins` |
| `paternal-cousins` | 0 | 2 | cima → `paternal-uncles` |
| `descendants` | 1 | 2 | cima → `core` |
| `maternal-cousins` | 2 | 2 | cima → `maternal-uncles` |

Semântica atual de delta usada pelos scripts:

```txt
deltaX < 0 => right
deltaX > 0 => left
deltaY < 0 => down
deltaY > 0 => up
```

Por isso, documentação de bug deve sempre distinguir movimento físico do dedo, direção funcional calculada e tela de destino.

---

## 6. `/mapa-familiar-horizontal` mobile

Componente:

```txt
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Responsabilidades:

- organizar pessoas por geração;
- renderizar uma geração por tela;
- permitir navegação pelos botões `Ger X`;
- permitir swipe lateral entre gerações;
- permitir scroll vertical dentro da geração ativa;
- renderizar conectores da geração ativa;
- responder a exportação.

A raiz mobile horizontal é identificada por:

```txt
data-family-map-horizontal-mobile-root="true"
```

Os cards/generation markers usam:

```txt
data-mobile-horizontal-generation="N"
data-mobile-horizontal-card="true"
```

---

## 7. Overview/Zoom mobile

Arquivos principais:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyMapOverviewNavigationBridge.ts
```

Responsabilidades:

- interceptar botão `Zoom` da toolbar mobile;
- abrir overlay com 9 cards;
- navegar para tela correspondente em `/mapa-familiar`;
- navegar para geração correspondente em `/mapa-familiar-horizontal`;
- fechar overlay após escolha;
- marcar botão ativo com `data-mobile-family-map-overview-active`.

O overview usa:

```txt
id="mobile-family-tree-overview-mode"
```

---

## 8. Painel do botão `+`

Arquivo de estilo/comportamento complementar:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
```

Carregamento:

```txt
src/main.tsx
```

Contrato:

- overlay mais opaco;
- painel branco;
- sem efeito de transparência que atrapalhe leitura;
- preserva rolagem interna do painel.

---

## 9. Ordem real de carregamento

A ordem observada em `index.html` é relevante para depurar regressões:

1. `mobileFamilyTreeMutationPerformanceGuard.ts`
2. `main.tsx`
3. scripts gerais de tutorial, curiosidades e painel;
4. `mobileFamilyTreeNavigationRules.ts`
5. `staticMobileFamilyTreeScreens.ts`
6. `mobileFamilyTreeScreenStateGuards.ts`
7. `mobileFamilyTreeGrandparentScreens.ts`
8. `mobileFamilyTreeUncleScreenGuards.ts`
9. `mobileFamilyTreeUncleSizingFix.ts`
10. `mobileFamilyTreeDescendantScreen.ts`
11. `mobileFamilyTreeSwipeHints.ts`
12. `mobileFamilyTreeZoomOverviewFix.ts`
13. `mobileFamilyTreeOverviewMode.ts`
14. `mobileFamilyTreeOverviewFixes.ts`
15. conectores e ajustes finais de títulos/scroll.

Risco: scripts posteriores podem sobrescrever comportamento anterior via listeners em capture phase, `style` injetado ou `MutationObserver`.

---

## 10. Performance e risco técnico

A arquitetura atual usa vários scripts auxiliares de DOM. Riscos:

- conflitos de ordem de carregamento;
- `MutationObserver` reagindo a alterações feitas por outro script;
- swipe global capturando scroll interno;
- Safari/iOS tratando `touch-action` e overflow de forma diferente do Chrome;
- scripts de correção acumulando complexidade fora do React;
- estado `data-mobile-family-tree-active-screen` divergindo do `transform` real;
- direções duplicadas entre scripts, causando navegação não determinística.

Mitigações atuais:

- guard de performance para observers;
- `requestAnimationFrame` para reagendamento;
- filtros de mutação para ignorar conectores;
- seletores escopados por rota e por atributos `data-*`;
- documentos de QA específicos;
- matriz declarada em `mobileFamilyTreeNavigationRules.ts`.

Recomendação futura:

```txt
Consolidar progressivamente os scripts auxiliares dentro de componentes React/hooks próprios, começando pela navegação da grade 3x3.
```

---

## 11. Estratégia recomendada para estabilização

1. Eleger `mobileFamilyTreeNavigationRules.ts` como fonte única de navegação.
2. Remover navegação direta de `GrandparentScreens`, `DescendantScreen` e `UncleScreenGuards`, mantendo neles apenas visual, scroll ou sizing.
3. Centralizar `screenHasContent` e regras de bloqueio por tela.
4. Fazer `SwipeHints` ler a mesma matriz de destinos.
5. Fazer `Zoom/Overview` chamar a mesma função de navegação.
6. Revalidar conectores depois de estabilizar navegação, não antes.

Não criar novo script de gesture sem remover ou desativar o comportamento concorrente anterior.

---

## 12. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/QA_MANUAL.md
```
