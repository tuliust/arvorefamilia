# Mapa Familiar Mobile — contrato vigente da grade 3x3 e horizontal

> Última revisão: 2026-06-20  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`  
> Escopo: comportamento mobile de `/mapa-familiar` e `/mapa-familiar-horizontal`  
> Status: contrato funcional atualizado após baseline padrão `baseline/mapas-mobile-padrao-2026-06-20`.

---

## 1. Objetivo

Este documento complementa `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` com o contrato mobile das duas views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Ele é a referência canônica para evitar regressões em:

- grade 3x3 da Árvore Familiar mobile;
- navegação direcional por swipe;
- tela `core` sem descendentes duplicados;
- tela `descendants` com irmãos, sobrinhos, cônjuge, pets, filhos e netos;
- telas de avós, ancestrais profundos, tios e primos;
- Zoom 3x3 de `/mapa-familiar`;
- Zoom por gerações de `/mapa-familiar-horizontal`;
- painéis `Formato`, `Cor`, `Filtros` e botão `+`;
- conectores mobile;
- rolagem interna.

Regra: histórico não substitui este contrato. Se um comportamento observado divergir deste documento, registrar como regressão ou pendência.

---

## 2. Branch e baseline de preservação

A estrutura atual foi preservada em:

```txt
baseline/mapas-mobile-padrao-2026-06-20
```

Documento histórico da baseline:

```txt
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
```

Uso recomendado:

- comparação visual;
- validação de não regressão;
- rollback controlado;
- referência para QA manual.

---

## 3. Carregamento mobile vigente

O `index.html` carrega hoje estes scripts relevantes para os mapas mobile:

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
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
```

Arquivos legados ou substituídos que não devem ser tratados como contrato ativo se não estiverem carregados:

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

---

## 4. Responsabilidades dos scripts vigentes

| Arquivo | Responsabilidade vigente |
|---|---|
| `mobileFamilyHorizontalZoomOverview.ts` | cria o Zoom específico de `/mapa-familiar-horizontal`, com navegação por gerações |
| `mobileFamilyMapStableMobileFix.ts` | estabiliza `descendants`, tios, primos, painéis compactos e Zoom 3x3 de `/mapa-familiar` |
| `mobileFamilyMapDirectionalNavigationFix.ts` | aplica e bloqueia direções de swipe da grade 3x3 em `/mapa-familiar` |
| `mobileFamilyMapCoreConnectorFix.ts` | oculta linha central abaixo da pessoa principal, linhas acima dos tios e fonte visual duplicada dos descendentes no `core` |
| `mobileFamilyTreeGrandparentScreens.ts` | cria/apoia telas dinâmicas de ancestrais profundos |
| `mobileFamilyTreeAncestorConnectorsFix.ts` | ajusta conectores de avós e ancestrais |
| `mobileFamilyTreeDescendantConnectorsFix.ts` | ajusta conectores internos da área descendente |
| `mobileFamilyTreeCoreDescendantConnector.ts` | apoia conectores do núcleo e da área descendente |
| `mobileFamilyTreeGroupTitleVisibilityFix.ts` | preserva títulos escuros e legíveis no mobile |
| `mobileFamilyTreeMutationPerformanceGuard.ts` | reduz risco de loops por `MutationObserver` |

Regra: antes de criar outro script global de touch, Zoom, conector ou scroll, auditar primeiro os quatro scripts principais desta seção.

---

## 5. Estrutura padrão de `/mapa-familiar`

No mobile, `/mapa-familiar` opera como grade 3x3.

| Posição | Tela técnica | Nome funcional | Conteúdo esperado |
|---|---|---|---|
| Superior esquerda | `paternal-ancestors` | Bisavós paternos | bisavós/tataravós paternos |
| Superior centro | `ancestors` | Avós | avós paternos e maternos |
| Superior direita | `maternal-ancestors` | Bisavós maternos | bisavós/tataravós maternos |
| Meio esquerda | `paternal-uncles` | Tios paternos | irmãos do pai e vínculos diretos de tio/tia paternos |
| Meio centro | `core` | Núcleo central | pai, mãe e pessoa principal |
| Meio direita | `maternal-uncles` | Tios maternos | irmãos da mãe e vínculos diretos de tio/tia maternos |
| Inferior esquerda | `paternal-cousins` | Primos paternos | descendentes dos tios paternos |
| Inferior centro | `descendants` | Descendentes | irmãos, cônjuge, sobrinhos, pets, filhos e netos |
| Inferior direita | `maternal-cousins` | Primos maternos | descendentes dos tios maternos |

Posição técnica:

```txt
paternal-ancestors  coluna 0, linha 0
ancestors           coluna 1, linha 0
maternal-ancestors  coluna 2, linha 0
paternal-uncles     coluna 0, linha 1
core                coluna 1, linha 1
maternal-uncles     coluna 2, linha 1
paternal-cousins    coluna 0, linha 2
descendants         coluna 1, linha 2
maternal-cousins    coluna 2, linha 2
```

---

## 6. Contrato direcional de `/mapa-familiar`

As direções abaixo são funcionais, isto é, descrevem o destino na grade.

| Tela atual | Direções permitidas | Direções bloqueadas |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; baixo → `descendants`; esquerda → `paternal-uncles`; direita → `maternal-uncles` | nenhuma, se houver destino |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core` | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

Conversão entre gesto físico e direção funcional:

```txt
arrastar dedo para a esquerda  => direção funcional right
arrastar dedo para a direita   => direção funcional left
arrastar dedo para cima        => direção funcional down
arrastar dedo para baixo       => direção funcional up
```

---

## 7. Tela `core`

A tela `core` é o centro da grade.

Conteúdo visual padrão:

```txt
pai
mãe
pessoa principal
```

Não devem aparecer visualmente no `core`:

```txt
Irmãos
Sobrinhos
Cônjuge
Pets
Filhos
Netos
```

Esses grupos pertencem à tela `descendants`. O conteúdo-fonte pode continuar existindo tecnicamente para clonagem, mas deve permanecer oculto no `core` por `mobileFamilyMapCoreConnectorFix.ts`.

Contrato visual:

- pessoa central no eixo central;
- conectores superiores entre pai/mãe e pessoa central preservados;
- grupos descendentes ausentes visualmente;
- linha vertical central abaixo da pessoa principal ausente;
- bottom nav não deve cobrir permanentemente a estrutura.

---

## 8. Tela `descendants`

A tela `descendants` fica abaixo de `core`.

Conteúdo:

```txt
Irmãos
Sobrinhos
Cônjuge
Pets
Filhos
Netos
```

Contrato:

- deve concentrar todos os grupos descendentes que foram removidos visualmente do `core`;
- deve ter área interna rolável quando necessário;
- deve bloquear esquerda, direita e baixo;
- só pode voltar para `core` pela direção funcional cima;
- o bottom nav e a safe area não podem impedir acesso ao último grupo;
- não pode tremer por disputa de `transform`.

---

## 9. Telas de tios

Telas:

```txt
paternal-uncles
maternal-uncles
```

Contrato visual:

- grupos alinhados mais acima;
- altura proporcional ao conteúdo;
- títulos escuros e visíveis;
- cards legíveis em 320px, 375px, 390px e 430px;
- sem linha vertical acima do grupo;
- rolagem interna quando houver mais cards que a altura útil.

Contrato de dados:

- `mobileFamilyTreeModel.ts` infere tios por irmãos do pai/mãe;
- também aceita vínculos diretos de `tio/tia`, `uncle/aunt` e relações inversas de `sobrinho/sobrinha`;
- ajuste visual não pode criar pessoas fictícias.

Contrato direcional específico:

```txt
paternal-uncles: direita para core; baixo para paternal-cousins; esquerda bloqueada; cima bloqueada
maternal-uncles: esquerda para core; baixo para maternal-cousins; direita bloqueada; cima bloqueada
```

---

## 10. Telas de primos

Telas:

```txt
paternal-cousins
maternal-cousins
```

Contrato:

- grupo posicionado de forma que a linha vertical conecte ao topo do container;
- rolagem interna quando houver muitos cards;
- `paternal-cousins` só navega para cima, voltando a `paternal-uncles`;
- `maternal-cousins` só navega para cima, voltando a `maternal-uncles`.

---

## 11. `/mapa-familiar-horizontal` mobile

A rota horizontal usa navegação por gerações.

| Geração | Nome funcional |
|---|---|
| 1 | Tataravós |
| 2 | Bisavós |
| 3 | Avós |
| 4 | Pais |
| 5 | Núcleo |
| 6 | Descendentes |

Contrato:

- botões `Ger N` visíveis conforme gerações disponíveis;
- uma geração ativa por tela;
- scroll vertical interno na geração ativa;
- swipe lateral entre gerações;
- conectores horizontais preservados;
- botão `Zoom` deve abrir janela própria por gerações.

Implementação do Zoom horizontal:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
```

A janela usa:

```txt
id="mobile-family-horizontal-generation-overview"
```

Ela deve listar gerações disponíveis e, ao tocar em uma geração, acionar o botão `Ger N` correspondente.

---

## 12. Zoom/overview

### `/mapa-familiar`

O botão `Zoom` abre overview da grade 3x3.

Ao tocar em um card:

- overview fecha;
- tela correspondente é posicionada no stage;
- `data-mobile-family-tree-active-screen` é atualizado;
- scroll interno da tela destino é resetado.

Implementação:

```txt
src/mobileFamilyMapStableMobileFix.ts
```

### `/mapa-familiar-horizontal`

O botão `Zoom` abre overview de gerações, não overview 3x3.

Ao tocar em uma geração:

- overview fecha;
- a página navega para o botão `Ger N`;
- scroll/swipe/bottom nav permanecem funcionais.

Implementação:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
```

---

## 13. Painéis superiores e botão `+`

Contrato:

- `Formato`, `Cor` e `Filtros` abrem painel abaixo da toolbar sem espaço branco excessivo;
- abrir/fechar painel não deve deslocar permanentemente a tela ativa;
- abrir/fechar painel não deve travar `body`;
- opções devem permanecer tocáveis em Safari/iOS;
- botão `+` abre painel completo com overlay escuro, painel branco/opaco e scroll próprio.

---

## 14. Títulos dos grupos

Títulos monitorados:

```txt
Avós Paternos
Avós Maternos
Bisavós Paternos
Bisavós Maternos
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

Contrato:

- `display: block`;
- `visibility: visible`;
- `opacity: 1`;
- cor escura compatível com o fundo do grupo;
- `-webkit-text-fill-color` definido quando necessário para Safari/iOS;
- fonte compacta;
- não depender da cor herdada do card.

---

## 15. QA obrigatório após alterações mobile

Validar em Safari/iOS quando possível:

```txt
320px
375px
390px
430px
```

Checklist mínimo:

- [ ] `/mapa-familiar` carrega sem travar.
- [ ] `core` não exibe grupos descendentes.
- [ ] `descendants` exibe irmãos, sobrinhos, cônjuge, pets, filhos e netos.
- [ ] matriz direcional da grade 3x3 é respeitada.
- [ ] nenhum gesto bloqueado muda de tela.
- [ ] `descendants` rola internamente e não treme.
- [ ] tios não exibem linha vertical acima do grupo.
- [ ] `paternal-uncles` bloqueia esquerda e desce para `paternal-cousins`.
- [ ] `Tios Paternos` mostra cards quando houver dados reais ou estado vazio controlado quando não houver.
- [ ] conectores de primos chegam ao topo dos grupos.
- [ ] `/mapa-familiar` abre Zoom 3x3.
- [ ] `/mapa-familiar-horizontal` abre Zoom por gerações.
- [ ] tocar em geração no Zoom horizontal navega para `Ger N`.
- [ ] fechar Zoom não trava scroll, swipe nem bottom nav.
- [ ] `Cor` e `Filtros` abrem painéis sem espaço branco excessivo.

---

## 16. Pendências conhecidas

| ID | Pendência |
|---|---|
| `MAP-MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari real. |
| `MAP-MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais. |
| `MAP-MOB-003` | Confirmar que o guard direcional bloqueia todas as direções proibidas nas 9 telas. |
| `MAP-MOB-004` | Confirmar Zoom horizontal por gerações em Safari/iOS após cache limpo. |
| `MAP-MOB-005` | Confirmar overlay opaco do painel `+` em Safari/iOS. |
| `MAP-MOB-006` | Revalidar conectores de avós, tios, descendentes e primos após mudança de navegação. |
| `MAP-MOB-007` | Avaliar migração futura dos scripts DOM consolidados para React/hooks. |

---

## 17. Arquivos principais da frente mobile

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeSwipeHints.ts
src/mobileFamilyTreeAncestorConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
src/mobileFamilyTreeMutationPerformanceGuard.ts
```
