# Auditoria do código atual — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md`  
> Escopo: conferência do código atual antes de tratar implementações mobile como consolidadas.  
> Status: documento de verificação. Não substitui QA visual em Safari/iOS.

---

## 1. Objetivo

Registrar o que o código atual indica sobre as rotas mobile:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Este documento existe porque parte das implementações mobile foi iterada em scripts auxiliares, e algumas frentes podem ter sido revertidas, substituídas ou regredido. Portanto, a documentação funcional deve separar:

- comportamento observado no código;
- comportamento esperado de produto;
- comportamento que ainda exige QA visual real.

---

## 2. Scripts carregados atualmente

O `index.html` carrega, para o mapa mobile, os seguintes scripts auxiliares relevantes:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
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

O arquivo abaixo existe no repositório, mas **não está carregado no `index.html` atual**:

```txt
src/mobileFamilyMapOverviewNavigationBridge.ts
```

Consequência documental: não tratar `mobileFamilyMapOverviewNavigationBridge.ts` como implementação ativa, salvo se ele voltar a ser importado/carregado.

---

## 3. Import global pelo `main.tsx`

O ajuste de fundo do painel mobile completo é importado por:

```txt
src/main.tsx
```

Arquivo importado:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
```

Contrato atual observado:

- overlay do `Painel de visualização` recebe fundo escuro;
- botão/área de fechamento recebe o mesmo fundo;
- `section` principal do painel recebe `background: #ffffff` e `opacity: 1`.

---

## 4. `/mapa-familiar` — estrutura nativa e telas dinâmicas

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

As outras três telas da grade 3x3 são adicionadas por scripts auxiliares quando há dados/condição:

| Tela | Origem atual |
|---|---|
| `paternal-ancestors` | `mobileFamilyTreeGrandparentScreens.ts` |
| `maternal-ancestors` | `mobileFamilyTreeGrandparentScreens.ts` |
| `descendants` | `mobileFamilyTreeDescendantScreen.ts` |

Consequência documental: a grade 3x3 é um comportamento composto por React + scripts auxiliares, não uma estrutura puramente nativa do componente React.

---

## 5. `/mapa-familiar` — tela `descendants`

O script `mobileFamilyTreeDescendantScreen.ts`:

- procura a grade de descendentes dentro da tela `core`;
- clona o conteúdo para uma tela dinâmica `descendants`;
- cria `.mobile-family-descendant-screen__scroll` com `data-mobile-tree-scroll="true"`;
- posiciona a tela em coluna 2, linha 3;
- só mantém a tela quando existe conteúdo descendente;
- controla o gesto vertical entre `core` e `descendants` respeitando a rolagem interna.

Ponto de atenção:

- o scroll interno existe no código, mas continua exigindo QA em Safari/iOS real porque compete com swipe global e outros listeners de touch.

---

## 6. `/mapa-familiar` — telas de tios

O script `mobileFamilyTreeUncleSizingFix.ts` atua somente em:

```txt
paternal-uncles
maternal-uncles
```

Comportamento observado no código:

- força scroll vertical interno no primeiro `div` da tela;
- centraliza o wrapper de conteúdo;
- limita largura do grupo a `min(calc(100vw - 2rem), 354px)`;
- marca `data-mobile-family-tree-uncle-scroll="true"`;
- marca `data-family-map-card-count` quando há cards;
- normaliza títulos para `Tios Paternos` e `Tios Maternos`;
- reduz os cards de tios para 78px de altura no CSS aplicado por script.

Ponto de atenção:

- se `paternal-uncles` não exibir cards, a causa pode estar no modelo de dados, no filtro visual, no stage/transform, no scroll interno ou em regressão de CSS. Não declarar corrigido sem QA visual.

---

## 7. `/mapa-familiar` — títulos de grupos

O script `mobileFamilyTreeGroupTitleVisibilityFix.ts` atua sobre títulos de seções nas telas:

```txt
paternal-uncles
maternal-uncles
core
descendants
paternal-cousins
maternal-cousins
```

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

Comportamento observado:

- força `display`, `visibility`, `opacity`, cor e `-webkit-text-fill-color`;
- reduz fonte para `0.75rem`;
- marca contagem de cards com `data-family-map-card-count`.

---

## 8. `/mapa-familiar-horizontal` — estado atual

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

## 9. Zoom/overview mobile

O arquivo ativo para overview/Zoom é:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

Comportamento observado:

- suporta `/mapa-familiar` e `/mapa-familiar-horizontal`;
- intercepta o botão `data-mobile-family-map-toolbar-action="zoom"`;
- cria o overlay `mobile-family-tree-overview-mode`;
- monta cards por `SCREEN_CONFIG`;
- em `/mapa-familiar`, aplica `transform` no stage para navegar até a tela da grade;
- em `/mapa-familiar-horizontal`, tenta clicar no botão `Ger N` correspondente.

Ponto de atenção:

- na horizontal, a navegação depende da existência do botão `Ger N`. Se a geração não estiver em `activeGenerations`, o clique não encontra destino.

---

## 10. Pendências documentais/QA sem conflito de IDs

Para não conflitar com IDs `MOB-001` e `MOB-002` já existentes em `docs/PLANO_PROXIMOS_PASSOS.md`, usar o prefixo `MAP-MOB` para pendências específicas dos mapas mobile:

| ID | Tema |
|---|---|
| `MAP-MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari real. |
| `MAP-MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais do ramo paterno. |
| `MAP-MOB-003` | Avaliar consolidação dos scripts auxiliares mobile dentro de React/hooks. |
| `MAP-MOB-004` | Confirmar comportamento do overview da horizontal quando a geração de destino não está ativa/visível. |
| `MAP-MOB-005` | Confirmar overlay opaco do painel `+` em Safari/iOS após cache limpo. |
| `MAP-MOB-006` | Verificar se `mobileFamilyMapOverviewNavigationBridge.ts` deve ser removido, carregado ou mantido como legado inativo. |

---

## 11. Regra para documentação futura

Não registrar como comportamento consolidado sem checar o código atual e, quando aplicável, validar visualmente:

- rolagem interna;
- posição de stage/transform;
- telas dinâmicas criadas por script;
- abertura e navegação do overview;
- painel `+`;
- exibição de `paternal-uncles`;
- conectores clonados/dinâmicos;
- Safari/iOS.
