# Arquitetura — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`  
> Escopo: arquitetura técnica dos mapas mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`.

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

---

## 4. Scripts auxiliares da vertical mobile

| Arquivo | Papel |
|---|---|
| `mobileFamilyTreeGrandparentScreens.ts` | cria telas laterais superiores de ancestrais profundos |
| `mobileFamilyTreeDescendantScreen.ts` | cria tela `descendants` abaixo de `core` |
| `mobileFamilyTreeAncestorConnectorsFix.ts` | corrige conectores de avós e ancestrais |
| `mobileFamilyTreeCoreDescendantConnector.ts` | desenha linha entre card central e tela `descendants` |
| `mobileFamilyTreeDescendantConnectorsFix.ts` | desenha conectores internos de `descendants` |
| `mobileFamilyTreeUncleSizingFix.ts` | ajusta sizing/centralização das telas de tios |
| `mobileFamilyTreeUncleScreenGuards.ts` | controla gestos e scroll nas telas de tios |
| `mobileFamilyTreeGroupTitleVisibilityFix.ts` | força títulos visíveis e compactos |
| `mobileFamilyTreeScrollAndVisibilityFix.ts` | reforça scroll interno e visibilidade em telas sensíveis |
| `mobileFamilyTreeMutationPerformanceGuard.ts` | reduz loops de MutationObserver causados por conectores |
| `mobileFamilyTreeZoomOverviewFix.ts` | controla overview/zoom mobile |

---

## 5. `/mapa-familiar-horizontal` mobile

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

## 6. Overview/Zoom mobile

Arquivo principal:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
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

## 7. Painel do botão `+`

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

## 8. Performance e risco técnico

A arquitetura atual usa vários scripts auxiliares de DOM. Riscos:

- conflitos de ordem de carregamento;
- `MutationObserver` reagindo a alterações feitas por outro script;
- swipe global capturando scroll interno;
- Safari/iOS tratando `touch-action` e overflow de forma diferente do Chrome;
- scripts de correção acumulando complexidade fora do React.

Mitigações atuais:

- guard de performance para observers;
- `requestAnimationFrame` para reagendamento;
- filtros de mutação para ignorar conectores;
- seletores escopados por rota e por atributos `data-*`;
- documentos de QA específicos.

Recomendação futura:

```txt
Consolidar progressivamente os scripts auxiliares dentro dos componentes React ou hooks próprios.
```

---

## 9. Ordem conceitual de carregamento

A ordem atual precisa respeitar:

1. app React principal;
2. criação das telas auxiliares;
3. regras de navegação/guards;
4. sizing/visibilidade;
5. conectores;
6. overview/zoom;
7. ajustes finais de scroll/painel.

Regra: novo script mobile deve ser justificado e documentado. Preferir ajuste estrutural em React quando o comportamento já estiver estabilizado.

---

## 10. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/QA_MANUAL.md
```
