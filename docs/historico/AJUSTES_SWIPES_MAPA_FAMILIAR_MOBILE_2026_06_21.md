# Histórico — ajustes de swipes no mapa familiar mobile

Data: 2026-06-21
Rotas: `/mapa-familiar` e `/mapa-familiar-horizontal`

## 1. Contexto

Esta rodada corrigiu regressões de navegação mobile no mapa familiar 3x3, principalmente nas telas laterais de tios/primos e na tela dinâmica `descendants`.

O principal risco identificado foi a coexistência de múltiplos handlers de swipe:

- handler React em `MobileFamilyTreeView.tsx`;
- script geral `mobileFamilyMapDirectionalNavigationFix.ts`;
- script estrutural `mobileFamilyMapStableMobileFix.ts`;
- guard específico `mobileFamilyMapUncleSwipeNavigationGuard.ts`;
- lock específico `mobileFamilyMapDescendantsStabilityLock.ts`.

A documentação abaixo registra o contrato atual para evitar regressão.

## 2. Ajustes por arquivo

### `src/mobileFamilyMapUncleSwipeNavigationGuard.ts`

Responsabilidade atual: interceptar com prioridade os gestos físicos nas telas:

- `paternal-uncles`;
- `paternal-cousins`;
- `maternal-uncles`.

Principais ajustes realizados:

- listeners migrados para `window` em capture para rodar antes de handlers em `document`, root e React;
- detecção da tela por target, ponto do toque e estado ativo do transform;
- uso explícito da direção física do dedo;
- bloqueio de handlers concorrentes em gestos permitidos e bloqueados;
- inclusão de `paternal-cousins` no guard prioritário.

Contrato atual:

| Tela | Esquerda | Direita | Cima | Baixo |
|---|---|---|---|---|
| `paternal-uncles` | `core` | bloqueado | `paternal-cousins` | bloqueado |
| `paternal-cousins` | bloqueado | bloqueado | bloqueado | `paternal-uncles` |
| `maternal-uncles` | bloqueado | `core` | `maternal-cousins` | bloqueado |

### `src/mobileFamilyMapDescendantsStabilityLock.ts`

Responsabilidade atual: estabilizar a tela dinâmica `descendants` e impedir tremor ou deslocamento indevido do stage.

Principais ajustes realizados:

- controle dedicado do transform de `descendants`;
- preservação do retorno para `core` ao deslizar fisicamente para baixo a partir do topo;
- separação entre scroll interno e swipe de navegação;
- bloqueio de bounce no topo/fundo;
- redução de microtremor evitando reaplicação contínua de transform quando o scroll interno ainda pode rolar;
- uso de `window` em capture para bloquear handlers concorrentes antes do React/document.

Contrato atual:

| Situação | Resultado esperado |
|---|---|
| `descendants` em repouso | stage travado em transform de descendentes |
| scroll interno com conteúdo rolável | rolagem nativa do conteúdo, sem deslocamento do stage |
| deslizar para baixo no topo | navega para `core` |
| gesto lateral | bloqueado |
| bounce no limite | não move a grade |

### `src/mobileFamilyMapDirectionalNavigationFix.ts`

Responsabilidade atual: navegação geral com direção funcional da grade.

Observação importante:

- Este arquivo traduz gesto físico para direção funcional.
- Exemplo: dedo para cima vira direção funcional `down`.
- Por isso, regras específicas que usam direção física devem ficar nos guards dedicados, não neste contrato geral.

### `src/mobileFamilyMapStableMobileFix.ts`

Responsabilidade atual:

- manter estrutura 3x3;
- criar/normalizar a tela `descendants` quando necessário;
- aplicar estilos mobile;
- marcar conectores;
- ajustar toolbar/overview;
- preservar separação entre `/mapa-familiar` e `/mapa-familiar-horizontal`.

## 3. Ajustes funcionais consolidados

### Tios paternos

Problemas corrigidos:

- gesto lateral levando para telas de bisavós;
- direção invertida entre esquerda/direita;
- conflito entre direção física e direção funcional;
- fallback de handlers antigos.

Estado atual:

```text
paternal-uncles:
- esquerda -> core
- direita  -> bloqueado
- cima     -> paternal-cousins
- baixo    -> bloqueado
```

### Primos paternos

Problemas corrigidos:

- gestos laterais abrindo telas indevidas;
- retorno vertical incorreto.

Estado atual:

```text
paternal-cousins:
- esquerda -> bloqueado
- direita  -> bloqueado
- cima     -> bloqueado
- baixo    -> paternal-uncles
```

### Tios maternos

Problemas corrigidos:

- cima e baixo levando ambos para `maternal-cousins`;
- esquerda/direita invertidos.

Estado atual:

```text
maternal-uncles:
- esquerda -> bloqueado
- direita  -> core
- cima     -> maternal-cousins
- baixo    -> bloqueado
```

### Descendentes

Problemas tratados:

- tela tremendo durante scroll ou gesto;
- conflito entre scroll interno, swipe de retorno e transform do stage;
- retorno para `core` ao deslizar para baixo no topo.

Estado desejado:

```text
descendants:
- scroll interno permitido quando há conteúdo;
- stage não acompanha o dedo;
- gestos laterais bloqueados;
- bounce não deve deslocar a grade;
- deslizar para baixo no topo -> core.
```

## 4. Separação entre rotas

### `/mapa-familiar`

- Usa root `data-mobile-family-tree-root="true"`.
- Usa stage `data-mobile-family-tree-stage="true"`.
- Opera como grade 3x3.
- Recebe guards de tios/primos e lock de descendentes.

### `/mapa-familiar-horizontal`

- Usa root `data-family-map-horizontal-mobile-root="true"`.
- Usa componente horizontal dedicado.
- Usa CSS dedicado `family-map-horizontal.css`.
- Não deve receber transformações do grid 3x3.

## 5. Regras de manutenção

- Não misturar direção física e direção funcional no mesmo contrato sem comentário explícito.
- Guards específicos devem rodar antes dos handlers genéricos quando houver conflito.
- Qualquer tela com scroll interno precisa separar `scroll` de `swipe de navegação`.
- Qualquer alteração em `descendants` exige validação real em iOS/Safari.
- Qualquer alteração em `/mapa-familiar-horizontal` deve confirmar que scripts do mapa direto não atuam na rota horizontal.

## 6. Documentos relacionados

- `docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_POS_AJUSTES_2026_06_21.md`
- `docs/operacao/QA_NAO_REGRESSAO_MAPAS_MOBILE_POS_AJUSTES_2026_06_21.md`
- `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`
- `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`
- `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md`
