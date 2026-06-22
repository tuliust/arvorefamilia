# Mapa Familiar Mobile — contrato vigente da grade 3x3 e horizontal

> Última revisão: 2026-06-22  
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

Fonte de verdade técnica: `index.html` da branch `feature/questionario-ia-vinculos-pets`.

O carregamento atual dos scripts relevantes para os mapas mobile é:

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

Regra operacional:

- só tratar como contrato ativo scripts carregados pelo `index.html` ou importados por arquivos carregados;
- se um arquivo existir no repositório, mas não estiver carregado, ele é legado ou candidato a remoção;
- qualquer alteração na ordem de carregamento deve ser documentada neste arquivo, em `MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md`, em `NAO_REGRESSAO_MAPAS_MOBILE.md` e no QA pós-deploy.

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

## 4. Responsabilidades dos scripts vigentes

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

Regra: antes de criar outro script global de touch, Zoom, conector, filtro, painel ou scroll, auditar primeiro os scripts desta tabela. O risco maior é criar disputa de `transform`, `MutationObserver`, `touchmove`, `pointermove`, `data-mobile-family-tree-active-screen` ou `body.style.overflow`.

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

A palavra **Zoom** tem dois contratos diferentes no mobile, conforme a rota.

### `/mapa-familiar`

Contrato vigente:

- botão **Zoom** da toolbar mobile abre uma janela de **Visão geral** com 9 cards da grade 3x3;
- cada card representa uma tela técnica da grade;
- tocar em um card reposiciona o stage na tela correspondente;
- a janela de Zoom não deve entrar na exportação;
- a janela de Zoom pode expor o botão **Exibir mapa completo**;
- **Exibir mapa completo** abre um overlay separado em mosaico único, com pinça, arraste e reenquadramento.

Telas esperadas no overview:

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

### `/mapa-familiar-horizontal`

Contrato vigente:

- botão **Zoom** abre overview por **gerações**, não a grade 3x3;
- cada card/botão representa uma geração disponível;
- selecionar uma geração fecha o overview e navega para a geração correspondente;
- não deve reintroduzir Paterno/Central/Materno;
- não deve usar scroll horizontal manual como navegação principal.

### Regra de conflito resolvida

- A toolbar mobile visível tem `Formato`, `Cor`, `Filtros` e `Zoom`.
- O botão `+` abre o painel completo de **Visualização**.
- Exportação/salvar pode existir no painel completo aberto pelo `+`.
- **Exportar não deve ser documentado como botão fixo da toolbar superior mobile**, porque não está em `TOOLBAR_ITEMS`.
- O painel mobile de visualização e os popovers devem manter `data-tree-export-ignore="true"`.

## 13. Painéis superiores e botão `+`

Toolbar mobile vigente:

```txt
Formato
Cor
Filtros
Zoom
+
```

Contrato:

- `Formato` alterna entre `/mapa-familiar` e `/mapa-familiar-horizontal` preservando a query string, especialmente `?pessoa=...`;
- `Cor` altera a paleta global da árvore;
- `Filtros` controla a exibição de cônjuges estendidos;
- `Zoom` abre o overview adequado à rota ativa;
- `+` abre o painel completo de **Visualização**.

O painel completo aberto pelo `+` pode conter:

- seletor de visualizador/família;
- alternância de formato;
- paleta;
- resumo/estatísticas;
- grupos familiares;
- filtros de cônjuges;
- ação de salvar/exportar imagem, conforme o código vigente.

Regras:

- overlay deve escurecer o fundo;
- painel principal deve ser branco/opaco;
- conteúdo interno deve ter rolagem própria;
- `body` deve destravar ao fechar;
- painel não entra na exportação;
- não documentar `Exportar` como item fixo da toolbar superior enquanto não existir em `TOOLBAR_ITEMS`;
- não remover `+` sem substituir as funções do painel completo.

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

## 15.1. Riscos adjacentes que não pertencem a Prompt 6

Antes de qualquer Prompt 6 ou alteração futura nos mapas, registrar estes pontos como **risco de regressão**, não como tarefa automática de mapa:

- `Home.tsx` ainda mantém seleção de visualizador/`Visualizar como...` em mobile e desktop. A decisão de produto segue pendente; não remover sem frente própria.
- `homeAiContext.ts` ainda contém inferência por nomes/sufixos para rótulos de pai/mãe e envia alguns campos sensíveis no contexto. Não ampliar IA nem dados privados sem revisão específica.
- `/meus-vinculos` deve manter pets separados de filhos humanos e mudanças de vínculo como pedidos pendentes.
- `arquivosHistoricosService.ts` trata `participante_ids` como coluna opcional com fallback; não tornar obrigatório sem migration aplicada.
- o stepper pode permitir clique direto em `/preferencias`; pessoa falecida deve ser protegida pela própria página de preferências.

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
