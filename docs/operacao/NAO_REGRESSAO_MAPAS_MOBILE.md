# Não regressão — mapas familiares mobile

> Última revisão: 2026-06-22  
> Local: `docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md`  
> Escopo: complemento operacional de `docs/REGRAS_DE_NAO_REGRESSAO.md` para `/mapa-familiar` e `/mapa-familiar-horizontal` no mobile.  
> Status: vigente conforme baseline `baseline/mapas-mobile-padrao-2026-06-20`.

---

## 1. Objetivo

Este documento complementa `docs/REGRAS_DE_NAO_REGRESSAO.md` com regras específicas da frente mobile dos mapas familiares.

Use antes de alterar:

- `MobileFamilyTreeView.tsx`;
- `MobileFamilyHorizontalMapView.tsx`;
- `mobileFamilyTreeModel.ts`;
- `mobileFamilyHorizontalZoomOverview.ts`;
- `mobileFamilyMapStableMobileFix.ts`;
- `mobileFamilyMapDirectionalNavigationFix.ts`;
- `mobileFamilyMapCoreConnectorFix.ts`;
- conectores mobile;
- painel `+`;
- toolbar mobile;
- Zoom/overview;
- scripts carregados em `index.html`.

---

## 2. Baseline preservada

Branch de referência:

```txt
baseline/mapas-mobile-padrao-2026-06-20
```

Documento histórico:

```txt
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
```

Regra: qualquer alteração que mude a estrutura visual ou a navegação mobile deve ser comparada contra essa baseline.

---

## 3. Scripts vigentes que não devem ser removidos sem substituição documentada

Scripts carregados pelo `index.html` e relevantes para mapas mobile:

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
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapUncleSwipeNavigationGuard.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileVisualizationPanelFamilyStatsFix.ts
src/mobileFamilyMapZoomOverviewVisualFix.ts
src/mobileFamilyMapDescendantsStabilityLock.ts
src/mobileFamilyMapExtendedSpouseCards.ts
src/mobileFamilyMapFilterButtonsBehaviorFix.ts
src/mobileFamilyMapFullOverview.ts
src/mobileFamilyMapFullOverviewMosaicFix.ts
```

Scripts críticos de preservação imediata:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapUncleSwipeNavigationGuard.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileVisualizationPanelFamilyStatsFix.ts
src/mobileFamilyMapZoomOverviewVisualFix.ts
src/mobileFamilyMapDescendantsStabilityLock.ts
src/mobileFamilyMapExtendedSpouseCards.ts
src/mobileFamilyMapFilterButtonsBehaviorFix.ts
src/mobileFamilyMapFullOverview.ts
src/mobileFamilyMapFullOverviewMosaicFix.ts
```

Regras:

- se remover `mobileFamilyHorizontalZoomOverview.ts`, documentar onde o Zoom horizontal por gerações passa a ser controlado;
- se remover `mobileFamilyMapStableMobileFix.ts`, documentar como `descendants`, tios, primos, painéis compactos e Zoom 3x3 passam a ser controlados;
- se remover `mobileFamilyMapDirectionalNavigationFix.ts`, documentar onde a matriz de 9 telas passa a ser garantida;
- se remover `mobileFamilyMapCoreConnectorFix.ts`, garantir que a linha vertical central, linhas acima dos tios e descendentes duplicados no `core` não voltem;
- se remover `mobileFamilyMapFullOverview*`, documentar como o mapa completo em mosaico único será substituído;
- se remover filtros/cônjuges estendidos, atualizar QA, arquitetura e documentação funcional.

## 4. Grade 3x3 obrigatória de `/mapa-familiar`

As telas abaixo não devem ser removidas sem decisão explícita:

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

Regra de posição:

```txt
paternal-ancestors  top-left
ancestors           top-center
maternal-ancestors  top-right
paternal-uncles     middle-left
core                middle-center
maternal-uncles     middle-right
paternal-cousins    bottom-left
descendants         bottom-center
maternal-cousins    bottom-right
```

---

## 5. `core` não pode voltar a duplicar descendentes

Na baseline atual, a tela `core` mostra apenas:

```txt
pai
mãe
pessoa principal
```

Não devem aparecer visualmente em `core`:

```txt
Irmãos
Sobrinhos
Cônjuge
Pets
Filhos
Netos
```

Esses grupos pertencem à tela `descendants`.

---

## 6. Matriz direcional obrigatória

| Tela | Permitido | Bloqueado |
|---|---|---|
| `paternal-ancestors` | direita | cima, baixo, esquerda |
| `ancestors` | esquerda, direita, baixo | cima |
| `maternal-ancestors` | esquerda | cima, baixo, direita |
| `core` | cima, baixo, esquerda, direita | nenhuma, se houver destino |
| `paternal-uncles` | direita, baixo | cima, esquerda |
| `maternal-uncles` | esquerda, baixo | cima, direita |
| `paternal-cousins` | cima | baixo, esquerda, direita |
| `descendants` | cima | baixo, esquerda, direita |
| `maternal-cousins` | cima | baixo, esquerda, direita |

Regra: gesto bloqueado não pode alterar `data-mobile-family-tree-active-screen` nem aplicar `transform` para outra tela.

---

## 7. Scroll interno

Telas com conteúdo maior que a altura útil devem priorizar scroll interno:

```txt
descendants
paternal-uncles
maternal-uncles
paternal-cousins
maternal-cousins
```

Regras:

- o swipe só deve navegar quando o scroll interno chegou ao limite correspondente;
- o bottom nav e a safe area não podem cobrir permanentemente o último grupo;
- não pode haver tremor visual por disputa de `transform`.

---

## 8. Conectores que não podem regredir

### Pessoa central

- manter conectores superiores entre pai/mãe e pessoa central;
- remover/ocultar a linha vertical central abaixo da pessoa principal;
- não reexibir grupos descendentes no `core`.

### Tios

- não deve haver linha vertical acima de `Tios Paternos`;
- não deve haver linha vertical acima de `Tios Maternos`.

### Primos

- linha vertical deve conectar ao topo do grupo;
- grupo não deve ficar excessivamente baixo.

### Descendentes

- conectores não devem duplicar linhas antigas clonadas;
- `Irmãos` deve conectar a `Sobrinhos` quando houver sobrinhos;
- `Cônjuge` deve conectar a `Pets` e/ou `Filhos` quando houver dados.

---

## 9. Tios paternos e maternos

Regras:

- cards reais devem aparecer quando houver dados e filtros permitirem;
- estado vazio controlado pode aparecer apenas quando não houver card real;
- não criar dados fictícios;
- altura do grupo deve ser compacta;
- não deve haver linha vertical acima do grupo;
- modelo mobile deve considerar irmãos do pai/mãe e vínculos diretos de tio/tia;
- `paternal-uncles` deve bloquear esquerda e descer para `paternal-cousins`;
- `maternal-uncles` deve bloquear direita e descer para `maternal-cousins`.

---

## 10. Zoom e painéis superiores

Regras:

- `Zoom` em `/mapa-familiar` deve abrir overview 3x3;
- `Zoom` em `/mapa-familiar-horizontal` deve abrir overview por gerações;
- o Zoom horizontal não deve usar a grade 3x3;
- overview não entra na exportação;
- abrir/fechar overview não pode travar `body`;
- toolbar superior mobile contém `Formato`, `Cor`, `Filtros` e `Zoom`;
- `Exportar` não é item fixo da toolbar superior mobile vigente;
- o botão `+` abre painel completo de **Visualização**;
- salvar/exportar pode existir no painel completo aberto por `+`;
- `Zoom +`, `Zoom -` e `Restaurar` são controles desktop/canvas e não devem ser reintroduzidos como itens fixos mobile sem decisão explícita.

## 10.1. Riscos adjacentes bloqueados por padrão

Não fazer em frente mobile de mapa sem prompt próprio:

- remover `Visualizar como...`/seletor de visualizador de `Home.tsx`;
- alterar `homeAiContext.ts` ou payload de IA;
- mudar regras de pets/filhos humanos em onboarding;
- converter pedido pendente de vínculo em relacionamento direto;
- exigir `participante_ids` em arquivos históricos sem migration aplicada;
- alterar stepper/preferências de pessoa falecida;
- mexer em rotas antigas ou preservar query string de forma diferente.

## 11. QA mínimo antes de fechar mudança mobile

- [ ] `git diff --check`.
- [ ] `npm run build`.
- [ ] Safari/iOS em 375px ou aparelho real.
- [ ] `/mapa-familiar` carrega e não trava.
- [ ] `/mapa-familiar-horizontal` carrega e não trava.
- [ ] matriz direcional validada nas 9 telas.
- [ ] `core` não duplica descendentes.
- [ ] `descendants` concentra descendentes e rola internamente.
- [ ] `Tios Paternos` e `Tios Maternos` validados com dados reais ou estado vazio controlado.
- [ ] linhas acima dos tios ausentes.
- [ ] Zoom 3x3 abre em `/mapa-familiar`.
- [ ] Zoom por gerações abre em `/mapa-familiar-horizontal`.
- [ ] `Cor` e `Filtros` compactos.

---

## 12. Documentos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```
