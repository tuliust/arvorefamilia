# Baseline — Mapas familiares mobile após ajustes de swipe

Data: 2026-06-21
Rotas cobertas: `/mapa-familiar` e `/mapa-familiar-horizontal`
Objetivo: registrar a estrutura atual como referência de não regressão após os ajustes de navegação por gesto, estabilidade visual e documentação operacional.

## 1. Escopo protegido

Este baseline deve ser usado como referência antes de qualquer alteração em:

- `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`
- `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`
- `src/mobileFamilyMapStableMobileFix.ts`
- `src/mobileFamilyMapDirectionalNavigationFix.ts`
- `src/mobileFamilyMapUncleSwipeNavigationGuard.ts`
- `src/mobileFamilyMapDescendantsStabilityLock.ts`
- `src/mobileFamilyMapCoreConnectorFix.ts`
- `src/mobileFamilyMapZoomOverviewVisualFix.ts`
- `src/mobileFamilyHorizontalZoomOverview.ts`
- `src/styles/family-map-horizontal.css`
- scripts carregados em `index.html` que atuem sobre mapa familiar mobile.

## 2. Estrutura esperada — `/mapa-familiar`

A rota `/mapa-familiar` deve operar como um mapa mobile direto em grade 3x3. A navegação visual é controlada por `data-mobile-family-tree-root="true"` e `data-mobile-family-tree-stage="true"`.

### Grade de referência

| Posição | Tela | Identificador |
|---|---|---|
| Linha 1, coluna 1 | Bisavós/tataravós paternos | `paternal-ancestors` |
| Linha 1, coluna 2 | Avós / ancestrais centrais | `ancestors` |
| Linha 1, coluna 3 | Bisavós/tataravós maternos | `maternal-ancestors` |
| Linha 2, coluna 1 | Tios paternos | `paternal-uncles` |
| Linha 2, coluna 2 | Núcleo central | `core` |
| Linha 2, coluna 3 | Tios maternos | `maternal-uncles` |
| Linha 3, coluna 1 | Primos paternos | `paternal-cousins` |
| Linha 3, coluna 2 | Descendentes | `descendants` |
| Linha 3, coluna 3 | Primos maternos | `maternal-cousins` |

### Transformações-base

A posição da tela ativa é controlada por `translate3d(calc(...), calc(...), 0)` no stage.

| Tela | Transform esperado |
|---|---|
| `core` | `translate3d(calc(-33.333333333333336% + 0px), calc(-33.333333333333336% + 0px), 0)` |
| `paternal-uncles` | `translate3d(calc(0% + 0px), calc(-33.333333333333336% + 0px), 0)` |
| `maternal-uncles` | `translate3d(calc(-66.66666666666667% + 0px), calc(-33.333333333333336% + 0px), 0)` |
| `paternal-cousins` | `translate3d(calc(0% + 0px), calc(-66.66666666666667% + 0px), 0)` |
| `descendants` | `translate3d(calc(-33.333333333333336% + 0px), calc(-66.66666666666667% + 0px), 0)` |
| `maternal-cousins` | `translate3d(calc(-66.66666666666667% + 0px), calc(-66.66666666666667% + 0px), 0)` |

## 3. Contrato atual de navegação física — `/mapa-familiar`

As regras abaixo usam a direção física do dedo, não a direção funcional da grade.

### `paternal-uncles`

| Gesto físico | Resultado esperado |
|---|---|
| deslizar para esquerda | `core` |
| deslizar para direita | bloqueado |
| deslizar para cima | `paternal-cousins` |
| deslizar para baixo | bloqueado |

### `paternal-cousins`

| Gesto físico | Resultado esperado |
|---|---|
| deslizar para esquerda | bloqueado |
| deslizar para direita | bloqueado |
| deslizar para cima | bloqueado |
| deslizar para baixo | `paternal-uncles` |

### `maternal-uncles`

| Gesto físico | Resultado esperado |
|---|---|
| deslizar para esquerda | bloqueado |
| deslizar para direita | `core` |
| deslizar para cima | `maternal-cousins` |
| deslizar para baixo | bloqueado |

### `descendants`

| Gesto físico | Resultado esperado |
|---|---|
| deslizar para baixo no topo do scroll | `core` |
| scroll interno com conteúdo rolável | rolagem nativa do conteúdo |
| gestos laterais | bloqueados |
| bounce no topo/fundo | não deve deslocar o stage nem provocar tremor |

## 4. Estabilidade visual da tela `descendants`

A tela `descendants` é protegida por `src/mobileFamilyMapDescendantsStabilityLock.ts`.

Requisitos atuais:

- O `stage` deve permanecer travado em `DESCENDANTS_TRANSFORM` enquanto `data-mobile-family-descendants-transform-lock="true"` estiver ativo.
- O retorno para `core` deve ocorrer somente no gesto físico para baixo quando o scroll interno estiver no topo.
- O scroll interno deve ser preservado quando ainda houver conteúdo para rolar.
- O stage não deve acompanhar o dedo em gestos laterais nem no bounce vertical.
- Não deve haver tremor perceptível da grade durante scroll, swipe bloqueado ou bounce.

## 5. Estrutura esperada — `/mapa-familiar-horizontal`

A rota `/mapa-familiar-horizontal` deve permanecer como mapa horizontal/generacional mobile, separado do mapa 3x3 direto.

Elementos de referência:

- root: `data-family-map-horizontal-mobile-root="true"`
- estilos principais: `src/styles/family-map-horizontal.css`
- componente principal: `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`
- zoom/overview horizontal: `src/mobileFamilyHorizontalZoomOverview.ts`

Requisitos de não regressão:

- a rota horizontal não deve herdar transformações do grid 3x3 de `/mapa-familiar`;
- a visualização horizontal deve preservar hierarquia geracional;
- o zoom/overview deve continuar operando sem misturar os estados de `data-mobile-family-tree-root`;
- scripts específicos de `/mapa-familiar` devem validar pathname antes de agir;
- scripts específicos de `/mapa-familiar-horizontal` devem validar root horizontal antes de agir.

## 6. Scripts de comportamento e responsabilidades

| Arquivo | Responsabilidade atual |
|---|---|
| `mobileFamilyMapStableMobileFix.ts` | Ajustes estruturais, criação/normalização da tela `descendants`, estilos, conectores, toolbar e overview. |
| `mobileFamilyMapDirectionalNavigationFix.ts` | Navegação geral por gestos e fallback de direção funcional. |
| `mobileFamilyMapUncleSwipeNavigationGuard.ts` | Guard prioritário das telas `paternal-uncles`, `paternal-cousins` e `maternal-uncles`, usando direção física. |
| `mobileFamilyMapDescendantsStabilityLock.ts` | Estabilização e contrato de retorno da tela `descendants`. |
| `mobileFamilyMapCoreConnectorFix.ts` | Conectores e ajustes de núcleo central. |
| `mobileFamilyMapZoomOverviewVisualFix.ts` | Ajustes visuais do overview/zoom do mapa direto. |
| `mobileFamilyHorizontalZoomOverview.ts` | Overview/zoom da rota horizontal. |

## 7. Regra de alteração futura

Antes de alterar qualquer tela ou gesto:

1. Conferir se a alteração afeta `/mapa-familiar`, `/mapa-familiar-horizontal` ou ambas.
2. Verificar se a regra usa direção física do dedo ou direção funcional da grade.
3. Preservar os contratos listados neste baseline, salvo pedido explícito de alteração.
4. Rodar validação manual no mobile Safari ou simulador equivalente.
5. Atualizar este baseline ou criar novo baseline datado em `docs/historico/`.

## 8. Checklist mínimo de validação

- `/mapa-familiar`: carregar em mobile sem tela branca.
- `core`: navegação para tios paternos e maternos sem regressão.
- `paternal-uncles`: validar quatro gestos físicos.
- `paternal-cousins`: validar quatro gestos físicos.
- `maternal-uncles`: validar quatro gestos físicos.
- `descendants`: validar scroll, ausência de tremor e retorno para `core`.
- `/mapa-familiar-horizontal`: validar carregamento, zoom/overview e ausência de interferência do grid direto.
