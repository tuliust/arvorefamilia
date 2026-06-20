# Arquitetura — mapas familiares mobile

> Última revisão: 2026-06-20  
> Local: `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`  
> Escopo: arquitetura técnica dos mapas mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`.  
> Status: atualizado após baseline padrão `baseline/mapas-mobile-padrao-2026-06-20`.

---

## 1. Visão geral

As rotas oficiais da árvore possuem renderizações mobile específicas:

| Rota | Componente mobile | Modelo de navegação | Zoom |
|---|---|---|---|
| `/mapa-familiar` | `MobileFamilyTreeView` + camada DOM consolidada | grade 3x3 por ramo familiar | overview 3x3 |
| `/mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` + script específico de overview | uma geração por tela, botões `Ger X` e swipe lateral | overview por gerações |

A arquitetura atual combina componentes React com scripts auxiliares carregados no `index.html` e um ajuste importado via `main.tsx`.

Documento de baseline:

```txt
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
```

Branch preservada:

```txt
baseline/mapas-mobile-padrao-2026-06-20
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
- renderizar grupos que são usados como fonte técnica para a tela `descendants`;
- aplicar cards mobile;
- expor atributos usados por scripts auxiliares.

Regra de baseline: apesar de parte dos grupos descendentes existir tecnicamente no DOM do `core`, eles não devem aparecer visualmente no `core`. A visualização desses grupos pertence à tela `descendants`.

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
- `paternal-ancestors` e `maternal-ancestors` dependem de camada auxiliar para completar a grade superior;
- `descendants` é estabilizada pela camada consolidada `mobileFamilyMapStableMobileFix.ts`;
- a fonte visual duplicada dos descendentes no `core` é ocultada por `mobileFamilyMapCoreConnectorFix.ts`;
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
| `mobileFamilyHorizontalZoomOverview.ts` | Zoom específico da horizontal, com cards por geração |
| `mobileFamilyMapStableMobileFix.ts` | camada consolidada de estabilidade, descendentes, tios, primos, painéis e Zoom 3x3 |
| `mobileFamilyMapDirectionalNavigationFix.ts` | contrato direcional da navegação 3x3 |
| `mobileFamilyMapCoreConnectorFix.ts` | cleanup de conectores e ocultação de descendentes duplicados no `core` |

### Arquivos legados ou substituídos

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
- controlar o overview/Zoom 3x3 de `/mapa-familiar`;
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

## 7. Cleanup de conectores e duplicação no `core`

Arquivo:

```txt
src/mobileFamilyMapCoreConnectorFix.ts
```

Responsabilidades:

- localizar e ocultar a linha vertical central abaixo do card da pessoa principal em `core`;
- ocultar linhas verticais acima dos grupos de tios;
- ocultar no `core` os elementos marcados como fonte visual dos descendentes;
- preservar a existência técnica dessa fonte para que a tela `descendants` continue sendo montada.

Seletores de ocultação da fonte duplicada:

```txt
[data-mobile-family-tree-descendant-source="true"]
[data-mobile-family-tree-descendant-connector="true"]
```

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

---

## 9. Zoom horizontal por gerações

Arquivo:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
```

Responsabilidades:

- interceptar o botão `Zoom` apenas em `/mapa-familiar-horizontal` mobile;
- abrir overlay próprio com gerações disponíveis;
- listar `Geração 1` a `Geração 6` quando houver botões/cartões correspondentes;
- mostrar nome funcional e contagem de pessoas;
- navegar acionando o botão `Ger N` correspondente;
- fechar sem travar scroll, swipe ou bottom nav.

ID da janela:

```txt
mobile-family-horizontal-generation-overview
```

Labels:

| Geração | Nome |
|---|---|
| 1 | Tataravós |
| 2 | Bisavós |
| 3 | Avós |
| 4 | Pais |
| 5 | Núcleo |
| 6 | Descendentes |

---

## 10. Zoom 3x3 de `/mapa-familiar`

Arquivo ativo principal:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Responsabilidades:

- interceptar botão `Zoom` na rota `/mapa-familiar` mobile;
- abrir overlay com cards da grade 3x3;
- navegar para tela correspondente;
- fechar overlay após escolha;
- marcar botão ativo com `data-mobile-family-map-overview-active`.

O overview usa:

```txt
id="mobile-family-tree-overview-mode"
```

---

## 11. Painel do botão `+`

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

## 12. Performance e risco técnico

Riscos atuais:

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
- Zoom horizontal separado do Zoom 3x3;
- guard direcional separado e carregado após a camada consolidada;
- cleanup final de conectores e duplicações;
- documentação de QA específica.

Recomendação futura:

```txt
Consolidar progressivamente os scripts auxiliares dentro dos componentes React ou hooks próprios, sem perder o contrato de 9 telas e o Zoom horizontal por gerações.
```

---

## 13. Ordem conceitual de carregamento

A ordem atual precisa respeitar:

1. guard de performance;
2. app React principal;
3. criação/apoio das telas auxiliares;
4. conectores de apoio;
5. títulos/visibilidade;
6. Zoom horizontal específico;
7. camada consolidada de estabilidade;
8. guard direcional;
9. cleanup final de conector central, tios e descendentes duplicados no `core`.

Regra: novo script mobile deve ser justificado e documentado. Preferir ajuste estrutural em React quando o comportamento já estiver estabilizado.

---

## 14. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/QA_MANUAL.md
```
