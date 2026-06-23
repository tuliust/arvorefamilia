# Arquitetura — mapas familiares mobile

> Última revisão: 2026-06-22  
> Local: `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`  
> Escopo: arquitetura técnica dos mapas mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`.  
> Status: atualizado após a rodada de ajustes de tios, cônjuges, Zoom e mapa completo mobile.

---

## 1. Visão geral

As rotas oficiais da árvore possuem renderizações mobile específicas:

| Rota | Componente mobile | Modelo de navegação | Zoom |
|---|---|---|---|
| `/mapa-familiar` | `MobileFamilyTreeView` + camadas auxiliares DOM/CSS | grade 3x3 por ramo familiar | overview 3x3 + mapa completo em mosaico único |
| `/mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` + scripts de apoio | uma geração por tela, botões `Ger X` e swipe lateral | overview por gerações |

A arquitetura atual combina componentes React com scripts auxiliares carregados no `index.html`. Os scripts foram usados para estabilizar comportamento mobile sem refatorar imediatamente a árvore inteira.

Documento histórico da rodada mais recente:

```txt
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md
```

Branch baseline anterior preservada:

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

- renderizar a estrutura principal mobile;
- montar a tela `core`;
- renderizar telas nativas e fontes técnicas usadas por scripts auxiliares;
- aplicar cards mobile;
- expor atributos usados por camadas de correção.

Regra de baseline: grupos descendentes podem existir tecnicamente no DOM do `core`, mas não devem aparecer visualmente no `core`. A visualização desses grupos pertence à tela `descendants`.

### 2.2 Modelo de dados

```txt
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
```

Responsabilidades:

- identificar pessoa central;
- identificar pai e mãe;
- montar ramos paterno e materno;
- calcular irmãos, sobrinhos, filhos, netos, pets e cônjuges;
- inferir pai/mãe quando o relacionamento explícito não for suficiente;
- inferir tios por irmãos do pai/mãe;
- considerar vínculos diretos de `tio/tia`, `uncle/aunt` e relações inversas de `sobrinho/sobrinha`, quando existentes;
- intercalar cônjuges estendidos após o parente âncora nos grupos mobile suportados.

Tipos e flags relevantes:

```txt
MobileFamilyExtendedSpousePerson
__mobileFamilyExtendedSpouse
__mobileFamilySpouseAnchorId
```

Regra: inferência de visualização não cria nem persiste dados.

---

## 3. Grade 3x3 de `/mapa-familiar`

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

- `core` é a tela central;
- `paternal-uncles` fica à esquerda de `core`;
- `maternal-uncles` fica à direita de `core`;
- `descendants` fica abaixo de `core`;
- `paternal-cousins` fica abaixo de `paternal-uncles`;
- `maternal-cousins` fica abaixo de `maternal-uncles`;
- `paternal-ancestors` e `maternal-ancestors` completam a faixa superior lateral;
- a navegação direcional é reforçada por `mobileFamilyMapDirectionalNavigationFix.ts`;
- a estabilidade de `descendants` é reforçada por `mobileFamilyMapDescendantsStabilityLock.ts`.

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

| Arquivo | Responsabilidade vigente |
|---|---|
| `mobileFamilyTreeMutationPerformanceGuard.ts` | reduz risco de loops de `MutationObserver` em conectores e ajustes DOM. |
| `main.tsx` | carrega React e importa ajustes globais como `mobileFamilyMapFullPanelStyleFix.ts`. |
| `firstLoginMobileTutorialFixes.ts` | ajustes do tutorial/primeiro acesso no mobile. |
| `mobileCuriositiesNavigationFix.ts` | ajustes de navegação mobile em curiosidades. |
| `mobileTreePanelViewportFix.ts` | correções de viewport/painel no mobile. |
| `staticMobileFamilyTreeScreens.ts` | suporte a telas estáticas/estrutura de telas mobile. |
| `mobileFamilyTreeScreenStateGuards.ts` | guards de estado de tela e stage. |
| `mobileFamilyTreeGrandparentScreens.ts` | cria/apoia telas laterais superiores de ancestrais profundos. |
| `mobileFamilyTreeSwipeHints.ts` | hints/apoio visual de swipe. |
| `mobileFamilyTreeAncestorConnectorsFix.ts` | ajusta conectores de avós e ancestrais. |
| `mobileFamilyTreeDescendantConnectorsFix.ts` | ajusta conectores internos de descendentes. |
| `mobileFamilyTreeCoreDescendantConnector.ts` | apoia conectores do núcleo e da área descendente. |
| `mobileFamilyTreeGroupTitleVisibilityFix.ts` | preserva títulos escuros, compactos e legíveis no mobile. |
| `mobileFamilyHorizontalZoomOverview.ts` | cria o Zoom específico de `/mapa-familiar-horizontal`, com cards por geração. |
| `mobileFamilyMapUncleSwipeNavigationGuard.ts` | protege gestos nas telas de tios para evitar navegação indevida. |
| `mobileFamilyMapStableMobileFix.ts` | estabiliza `descendants`, tios, primos, painéis compactos e overview 3x3. |
| `mobileFamilyMapDirectionalNavigationFix.ts` | aplica e bloqueia direções de swipe da grade 3x3. |
| `mobileFamilyMapCoreConnectorFix.ts` | oculta duplicações no `core`, linha central abaixo da pessoa principal e conectores indevidos. |
| `mobileVisualizationPanelFamilyStatsFix.ts` | ajusta estatísticas/resumo do painel mobile de visualização. |
| `mobileFamilyMapZoomOverviewVisualFix.ts` | refina aparência/funcionamento visual do Zoom 3x3. |
| `mobileFamilyMapDescendantsStabilityLock.ts` | trava estabilidade de `descendants`, pausando interferências durante Zoom/overview. |
| `mobileFamilyMapExtendedSpouseCards.ts` | marca e expande visualmente cônjuges estendidos. |
| `mobileFamilyMapFilterButtonsBehaviorFix.ts` | separa comportamento dos filtros mobile de cônjuges. |
| `mobileFamilyMapFullOverview.ts` | adiciona `Exibir mapa completo`, overlay com pinça/arraste e mosaico único. |
| `mobileFamilyMapFullOverviewMosaicFix.ts` | refina mosaico completo, filhos/netos e conectores extras. |

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

Regra: não restaurar arquivo legado sem atualizar esta documentação, o QA pós-deploy e os documentos canônicos afetados.

## 4.1. Componentes React observados no roteamento atual

`HomeTreeSection.tsx` é a camada que escolhe a implementação por rota e breakpoint:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapFilteredView` | `MobileFamilyHorizontalMapFilteredView` |

Regra: a documentação antiga que cita `DesktopFamilyHorizontalMapView` ou `MobileFamilyHorizontalMapView` sem `Filtered` deve ser entendida como conceitual, não como nome de componente renderizado na rota atual.

## 4.2. Toolbar mobile e painel completo

`MobileFamilyMapToolbar.tsx` expõe tecnicamente o union:

```txt
visualizacao
formato
cor
grupos
exportar
zoom
```

Mas `TOOLBAR_ITEMS` renderiza somente:

```txt
Formato
Cor
Filtros
Zoom
```

O botão `+` abre o painel completo de **Visualização**.

Implicações:

- `Exportar` pode existir como painel técnico, mas não é botão fixo da toolbar superior no estado atual;
- salvar/exportar imagem pertence ao painel completo aberto pelo `+`;
- `Zoom` pertence ao overview da rota ativa, não a zoom incremental.

## 5. Camada consolidada mobile

Arquivo:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

Responsabilidades atuais:

- criar/estabilizar a tela `descendants`;
- preservar scroll nativo em áreas internas roláveis;
- evitar tremor por disputa de stage/transform;
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

## 7. Tios, conectores e cleanup de duplicações

Arquivos:

```txt
src/mobileFamilyMapCoreConnectorFix.ts
src/styles/mobile-family-map-branch-connectors-final.css
```

Responsabilidades:

- localizar e ocultar a linha vertical central abaixo do card da pessoa principal em `core`;
- ocultar conectores nativos antigos nas telas de tios;
- ocultar no `core` os elementos marcados como fonte visual dos descendentes;
- preservar a existência técnica dessa fonte para que a tela `descendants` continue sendo montada;
- centralizar e compactar grupos de tios;
- desenhar conectores controlados de tios.

Contrato visual vigente:

| Tela | Conectores |
|---|---|
| `paternal-uncles` | linha horizontal da direita do grupo até o lado de `core`/pai; linha vertical inferior até o final da tela em direção a `paternal-cousins`. |
| `maternal-uncles` | linha horizontal da esquerda do grupo até o lado de `core`/mãe; linha vertical inferior até o final da tela em direção a `maternal-cousins`. |

Seletores importantes:

```txt
[data-mobile-family-tree-descendant-source="true"]
[data-mobile-family-tree-descendant-connector="true"]
[data-mobile-uncle-branch-connector="down"]
[data-mobile-uncle-branch-connector="horizontal"]
```

---

## 8. Cônjuges estendidos e filtros mobile

Arquivos:

```txt
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyMapExtendedSpouseCards.ts
src/mobileFamilyMapFilterButtonsBehaviorFix.ts
src/styles/family-map-horizontal-spouse-tone.css
```

### 8.1 Escopo funcional

O botão **Exibir cônjuges de tios, primos etc** funciona como toggle de exibição para cônjuges nos grupos:

```txt
tios
primos
sobrinhos
filhos
netos
irmãos, quando aplicável ao grupo renderizado
```

O botão **Apenas meus familiares** permanece sempre ativo visualmente e, por enquanto, não executa ação de filtro.

### 8.2 Estado técnico

O estado é exposto no HTML:

```txt
html[data-mobile-family-spouse-scope="extended"]
html[data-mobile-family-spouse-scope="direct"]
```

O estado também é persistido em:

```txt
localStorage['arvorefamilia:mobile-family-map:show-extended-spouses']
```

Cards de cônjuges recebem:

```txt
data-family-map-extended-spouse-card="true"
data-family-map-spouse-tone="true"
data-family-map-spouse-anchor-id="..."
```

### 8.3 Cor dos cônjuges

Cards de cônjuges devem usar tom diferente, mas próximo ao tom do grupo/geração. A regra visual é centralizada em:

```txt
src/styles/family-map-horizontal-spouse-tone.css
```

---

## 9. Zoom 3x3 de `/mapa-familiar`

Arquivos ativos:

```txt
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapZoomOverviewVisualFix.ts
src/mobileFamilyMapDescendantsStabilityLock.ts
```

Responsabilidades:

- interceptar botão `Zoom` na rota `/mapa-familiar` mobile;
- abrir overlay com cards da grade 3x3;
- navegar para tela correspondente;
- fechar overlay após escolha;
- marcar card ativo;
- compactar títulos, espaçamentos e badges;
- remover subtítulos como **Ancestrais profundos**;
- inserir ícone central nos cards;
- manter `DESCENDENTES` em uma linha quando possível;
- impedir tremor quando o Zoom é aberto a partir de `descendants`.

O overview usa:

```txt
id="mobile-family-tree-overview-mode"
```

---

## 10. Mapa completo em tela única

Arquivos:

```txt
src/mobileFamilyMapFullOverview.ts
src/mobileFamilyMapFullOverviewMosaicFix.ts
```

Entrada:

```txt
/mapa-familiar → Zoom → Exibir mapa completo
```

Contrato atual:

- botão **Exibir mapa completo** abaixo dos 9 cards do Zoom;
- overlay dedicado com `id="mobile-family-map-full-overview"`;
- tela única em canvas/mosaico, não grade de 9 cards independentes;
- grupos posicionados por coordenadas absolutas;
- conectores SVG entre blocos;
- suporte a pinça para ampliar/reduzir;
- suporte a arraste;
- botão **Reenquadrar**;
- botão de fechar;
- filhos e netos incluídos como grupos do mosaico;
- uso de clones do DOM existente como fonte visual.

Limitação técnica: o mosaico depende da existência dos grupos renderizados no DOM. Se o componente React mudar títulos, seções ou atributos, os seletores de `mobileFamilyMapFullOverview*.ts` devem ser revisados.

---

## 11. `/mapa-familiar-horizontal` mobile

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

A exibição/ocultação tonal de cônjuges mobile também respeita:

```txt
data-family-map-spouse-tone="true"
html[data-mobile-family-spouse-scope="extended|direct"]
```

---

## 12. Zoom horizontal por gerações

Arquivo:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
```

Responsabilidades:

- interceptar o botão `Zoom` apenas em `/mapa-familiar-horizontal` mobile;
- abrir overlay próprio com gerações disponíveis;
- listar gerações quando houver botões/cartões correspondentes;
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

## 13. Performance e risco técnico

Riscos atuais:

- conflitos de ordem de carregamento;
- `MutationObserver` reagindo a alterações feitas por outro script;
- swipe global capturando scroll interno;
- Safari/iOS tratando `touch-action` e overflow de forma diferente do Chrome;
- scripts de correção acumulando complexidade fora do React;
- arquivos existentes mas não carregados serem confundidos com implementação ativa;
- mosaico completo depender de clones do DOM em vez de dados estruturados próprios.

Mitigações atuais:

- guard de performance para observers;
- `requestAnimationFrame` para reagendamento;
- seletores escopados por rota e por atributos `data-*`;
- Zoom horizontal separado do Zoom 3x3;
- guard direcional separado e carregado após a camada consolidada;
- cleanup final de conectores e duplicações;
- documentação de QA específica;
- histórico da rodada de scripts em `docs/historico/`.

Recomendação futura:

```txt
Consolidar progressivamente os scripts auxiliares dentro dos componentes React ou hooks próprios, sem perder o contrato de 9 telas, filtros mobile de cônjuges e mapa completo em tela única.
```

---

## 13.1. Riscos fora do escopo dos scripts mobile

- `Home.tsx` concentra `debugViewPersonId`, seletor de visualizador, preservação de `?pessoa=`, contagens e abertura do tutorial. Alterações devem ser isoladas e testadas em ambas as rotas.
- `homeAiContext.ts` possui inferência por nome/sufixo para pai/mãe e inclui dados de contato/rede social em parte do contexto. Alterar IA exige revisão de privacidade e payload.
- O modelo mobile pode inferir relações para visualização; isso não cria nem corrige dados persistidos.
- Rascunhos e fluxo de onboarding não fazem parte desta arquitetura, mas regressões ali podem afetar quais dados chegam ao mapa.

## 14. Ordem conceitual de carregamento

A ordem atual precisa respeitar:

1. guard de performance;
2. app React principal;
3. criação/apoio das telas auxiliares;
4. conectores de apoio;
5. títulos/visibilidade;
6. Zoom horizontal específico;
7. camada consolidada de estabilidade;
8. guard direcional;
9. cleanup final de conector central, tios e descendentes duplicados no `core`;
10. ajustes visuais do Zoom 3x3;
11. lock de estabilidade de `descendants`;
12. marcação de cônjuges estendidos;
13. comportamento separado dos filtros mobile;
14. mapa completo e refinamento do mosaico.

Regra: novo script mobile deve ser justificado e documentado. Preferir ajuste estrutural em React quando o comportamento já estiver estabilizado.

---

## 15. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/QA_MANUAL.md
```
