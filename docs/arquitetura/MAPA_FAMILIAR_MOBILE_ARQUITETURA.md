# Arquitetura — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`  
> Escopo: arquitetura técnica dos mapas mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`.  
> Status: atualizado após consolidação dos scripts mobile, guard direcional e limpeza de conector central.

---

## 1. Visão geral

As rotas oficiais da árvore possuem renderizações mobile específicas:

| Rota | Componente mobile | Modelo de navegação |
|---|---|---|
| `/mapa-familiar` | `MobileFamilyTreeView` + camada DOM consolidada | grade 3x3 com telas por ramo familiar |
| `/mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` + overview compartilhado | uma geração por tela, botões `Ger X` e swipe lateral |

A arquitetura atual combina componentes React com scripts auxiliares carregados no `index.html` e um ajuste importado via `main.tsx`.

Documentos relacionados:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```

---

## 2. `/mapa-familiar` mobile

### 2.1 Componente base

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidades:

- renderizar estrutura principal mobile;
- montar tela `core`;
- renderizar telas nativas `ancestors`, `paternal-uncles`, `core`, `maternal-uncles`, `paternal-cousins` e `maternal-cousins`;
- renderizar grupos de avós, tios, primos e descendentes originais dentro da estrutura React;
- aplicar cards mobile;
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
- inferir pai/mãe quando relacionamento explícito não for suficiente;
- inferir tios por irmãos do pai/mãe;
- considerar vínculos diretos de `tio/tia`, `uncle/aunt` e relações inversas de `sobrinho/sobrinha`, quando existentes.

Regra: inferência de visualização não cria nem persiste dados.

---

## 3. Grade 3x3

A grade mobile usa atributos de tela:

```txt
data-mobile-family-tree-screen="..."
```

Telas funcionais vigentes:

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

Estado técnico atual:

- seis telas são nativas do componente React;
- `paternal-ancestors` e `maternal-ancestors` continuam dependentes de camada auxiliar para completar a grade superior;
- `descendants` é estabilizada pela camada consolidada `mobileFamilyMapStableMobileFix.ts` quando há conteúdo descendente;
- a navegação direcional final é reforçada por `mobileFamilyMapDirectionalNavigationFix.ts`.

O stage é identificado por:

```txt
data-mobile-family-tree-stage="true"
```

A raiz é identificada por:

```txt
data-mobile-family-tree-root="true"
```

---

## 4. Scripts auxiliares carregados pelo `index.html`

O carregamento vigente relevante para os mapas mobile é:

| Arquivo | Papel |
|---|---|
| `mobileFamilyTreeMutationPerformanceGuard.ts` | reduz loops de `MutationObserver` causados por conectores e estilos |
| `staticMobileFamilyTreeScreens.ts` | suporte a telas estáticas/estrutura mobile |
| `mobileFamilyTreeScreenStateGuards.ts` | guards de estado de tela/stage |
| `mobileFamilyTreeGrandparentScreens.ts` | cria/apoia telas laterais superiores de ancestrais profundos |
| `mobileFamilyTreeSwipeHints.ts` | hints/apoio visual de swipe |
| `mobileFamilyTreeAncestorConnectorsFix.ts` | corrige conectores de avós e ancestrais |
| `mobileFamilyTreeDescendantConnectorsFix.ts` | desenha/ajusta conectores internos de descendentes |
| `mobileFamilyTreeCoreDescendantConnector.ts` | desenha/apoia conectores do núcleo para descendentes |
| `mobileFamilyTreeGroupTitleVisibilityFix.ts` | força títulos visíveis e compactos |
| `mobileFamilyMapStableMobileFix.ts` | camada consolidada de estabilidade, descendentes, tios, primos, painéis e Zoom |
| `mobileFamilyMapDirectionalNavigationFix.ts` | contrato direcional da navegação 3x3 |
| `mobileFamilyMapCoreConnectorFix.ts` | oculta a linha vertical central abaixo da pessoa principal |

### Arquivos legados ou substituídos, não carregados como contrato vigente

Os arquivos abaixo existem ou já existiram como patches, mas não devem ser tratados como fonte de verdade se não estiverem carregados em `index.html`:

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

Regra: não restaurar arquivo legado sem atualizar este documento, `MAPA_FAMILIAR_MOBILE.md` e o QA pós-deploy.

---

## 5. Camada consolidada mobile

Arquivo:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Responsabilidades atuais:

- criar/estabilizar a tela `descendants`;
- preservar scroll nativo em áreas internas roláveis;
- evitar tremor por disputa de stage/transform;
- compactar altura visual de tios;
- marcar conectores principais dos grupos de primos;
- reduzir altura dos painéis `Formato`, `Cor` e `Filtros`;
- controlar o overview/Zoom nas duas rotas mobile;
- proteger contra excesso de espaço branco em painéis superiores.

Risco técnico: essa camada ainda atua por DOM. Futuro refactor ideal é migrar comportamento estável para React/hooks.

---

## 6. Guard direcional

Arquivo:

```txt
src/mobileFamilyMapDirectionalNavigationFix.ts
```

Contrato de destinos:

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

O guard captura direções bloqueadas para impedir fallback do React ou de scripts remanescentes.

---

## 7. Cleanup de conector central

Arquivo:

```txt
src/mobileFamilyMapCoreConnectorFix.ts
```

Responsabilidade:

- localizar a linha vertical central abaixo do card da pessoa principal em `core`;
- marcar o elemento com `data-mobile-core-center-descendant-line="hidden"`;
- ocultar somente essa linha no mobile;
- preservar a linha horizontal e os conectores laterais para `Irmãos` e `Cônjuge`.

---

## 8. `/mapa-familiar-horizontal` mobile

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

Cônjuges filtráveis observados no código horizontal:

```txt
irmaos
tios
primos
sobrinhos
filhos
netos
```

`pais`/Geração 4 ainda não deve ser tratado como cônjuge filtrável implementado sem mudança específica no código.

---

## 9. Overview/Zoom mobile

Arquivo ativo principal:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Responsabilidades:

- interceptar botão `Zoom` da toolbar mobile;
- abrir overlay com cards da visão geral;
- navegar para tela correspondente em `/mapa-familiar`;
- tentar navegar para geração correspondente em `/mapa-familiar-horizontal`;
- fechar overlay após escolha;
- marcar botão ativo com `data-mobile-family-map-overview-active`.

O overview usa:

```txt
id="mobile-family-tree-overview-mode"
```

Na horizontal, a navegação depende da existência do botão `Ger N` da geração de destino. Se a geração não estiver entre `activeGenerations`, o destino pode não existir visualmente.

---

## 10. Painel do botão `+`

Arquivo de estilo/comportamento complementar:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
```

Carregamento atual:

```txt
src/main.tsx
```

Contrato observado:

- overlay mais opaco;
- painel branco;
- sem efeito de transparência que atrapalhe leitura;
- preserva rolagem interna do painel.

---

## 11. Performance e risco técnico

A arquitetura atual ainda usa scripts auxiliares de DOM. Riscos:

- conflitos de ordem de carregamento;
- `MutationObserver` reagindo a alterações feitas por outro script;
- swipe global capturando scroll interno;
- Safari/iOS tratando `touch-action` e overflow de forma diferente do Chrome;
- scripts de correção acumulando complexidade fora do React;
- arquivos existentes mas não carregados serem confundidos com implementação ativa.

Mitigações atuais:

- guard de performance para observers;
- `requestAnimationFrame` para reagendamento;
- seletores escopados por rota e por atributos `data-*`;
- consolidação de grande parte do comportamento em `mobileFamilyMapStableMobileFix.ts`;
- guard direcional separado e carregado após a camada consolidada;
- documentação de QA específica.

Recomendação futura:

```txt
Consolidar progressivamente os scripts auxiliares dentro dos componentes React ou hooks próprios, sem perder o contrato de 9 telas.
```

---

## 12. Ordem conceitual de carregamento

A ordem atual precisa respeitar:

1. guard de performance;
2. app React principal;
3. criação/apoio das telas auxiliares;
4. conectores de apoio;
5. títulos/visibilidade;
6. camada consolidada de estabilidade;
7. guard direcional;
8. cleanup final de conector central.

Regra: novo script mobile deve ser justificado e documentado. Preferir ajuste estrutural em React quando o comportamento já estiver estabilizado.

---

## 13. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/QA_MANUAL.md
```
