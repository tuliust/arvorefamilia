# QA de não regressão — mapas familiares mobile pós-ajustes

Data: 2026-06-21
Rotas: `/mapa-familiar` e `/mapa-familiar-horizontal`
Baseline relacionado: `docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_POS_AJUSTES_2026_06_21.md`

## 1. Objetivo

Garantir que os ajustes recentes de navegação mobile, guards de swipe, estabilidade de `descendants` e separação entre mapa direto e horizontal não sofram regressão.

Este checklist deve ser executado após qualquer alteração em componentes, scripts globais ou estilos que atinjam os mapas familiares mobile.

## 2. Ambiente de teste recomendado

Prioridade:

1. iPhone real em Safari.
2. iOS Simulator/Safari responsivo.
3. Chrome DevTools em larguras 320, 375, 390 e 430 px.

Antes de validar:

- limpar cache agressivo do navegador;
- aguardar deploy Vercel em estado `Ready`;
- testar em produção e, se necessário, no preview do commit;
- garantir que a rota não esteja com overlay de zoom aberto.

## 3. Checklist — `/mapa-familiar`

### 3.1 Carregamento e estrutura

- [ ] A rota `/mapa-familiar` carrega sem tela branca.
- [ ] O título e a barra superior aparecem corretamente.
- [ ] A toolbar mobile não cobre a área principal de forma permanente.
- [ ] O bottom navigation continua acessível.
- [ ] O stage 3x3 não aparece deslocado ao carregar.
- [ ] `core` é a posição inicial esperada após troca de pessoa central ou refresh.

### 3.2 Núcleo central — `core`

- [ ] A tela central exibe pessoa principal, pais, cônjuge, irmãos, sobrinhos, filhos, netos e pets conforme dados disponíveis.
- [ ] Os conectores não atravessam cards de forma visualmente incorreta.
- [ ] Deslizar para o ramo paterno não quebra a estrutura.
- [ ] Deslizar para o ramo materno não quebra a estrutura.
- [ ] Deslizar para `descendants` continua disponível conforme o contrato geral da rota.

### 3.3 Tios paternos — `paternal-uncles`

Validar direção física do dedo:

- [ ] deslizar para esquerda leva para `core`.
- [ ] deslizar para direita fica bloqueado.
- [ ] deslizar para cima leva para `paternal-cousins`.
- [ ] deslizar para baixo fica bloqueado.
- [ ] Não deve abrir `paternal-ancestors`.
- [ ] Não deve abrir `maternal-ancestors`.
- [ ] Não deve haver tremor de stage em gestos bloqueados.

### 3.4 Primos paternos — `paternal-cousins`

Validar direção física do dedo:

- [ ] deslizar para esquerda fica bloqueado.
- [ ] deslizar para direita fica bloqueado.
- [ ] deslizar para cima fica bloqueado.
- [ ] deslizar para baixo volta para `paternal-uncles`.
- [ ] A lista pode rolar internamente se houver conteúdo.
- [ ] O gesto lateral não deve deslocar a grade.

### 3.5 Tios maternos — `maternal-uncles`

Validar direção física do dedo:

- [ ] deslizar para esquerda fica bloqueado.
- [ ] deslizar para direita leva para `core`.
- [ ] deslizar para cima leva para `maternal-cousins`.
- [ ] deslizar para baixo fica bloqueado.
- [ ] O gesto para baixo não deve levar para `maternal-cousins`.
- [ ] O gesto para esquerda não deve levar para `core`.
- [ ] Não deve haver tremor de stage em gestos bloqueados.

### 3.6 Descendentes — `descendants`

Validar com atenção, pois é a tela mais sensível a regressão visual:

- [ ] A tela entra estável, sem oscilação inicial.
- [ ] O scroll interno funciona quando há conteúdo rolável.
- [ ] Durante scroll interno, a grade 3x3 não acompanha o dedo.
- [ ] No topo do scroll, deslizar para baixo leva para `core`.
- [ ] Nos demais casos, o gesto não deve deslocar o stage.
- [ ] Gestos laterais ficam bloqueados.
- [ ] Não deve haver tremor visual ao tentar gestos bloqueados.
- [ ] Não deve haver bounce elástico perceptível que mova o stage.

### 3.7 Primos maternos — `maternal-cousins`

- [ ] A tela abre a partir de `maternal-uncles` com gesto físico para cima.
- [ ] A estrutura visual não invade a área de outras telas.
- [ ] O scroll interno funciona se houver conteúdo.
- [ ] Não há interferência nos guards de `maternal-uncles`.

## 4. Checklist — `/mapa-familiar-horizontal`

- [ ] A rota `/mapa-familiar-horizontal` carrega no mobile.
- [ ] O root horizontal `data-family-map-horizontal-mobile-root="true"` é respeitado.
- [ ] A visualização mantém estrutura geracional horizontal.
- [ ] O zoom/overview horizontal abre e fecha corretamente.
- [ ] Scripts de `/mapa-familiar` não alteram transformações da rota horizontal.
- [ ] O CSS `family-map-horizontal.css` continua aplicado.
- [ ] Não há interferência dos locks de `descendants` da rota 3x3.
- [ ] Não há tremor, deslocamento inesperado ou tela branca.

## 5. Critérios de bloqueio de deploy

Bloquear merge/deploy se qualquer item abaixo ocorrer:

- tela branca em `/mapa-familiar` ou `/mapa-familiar-horizontal`;
- gestos invertidos em `paternal-uncles`, `paternal-cousins` ou `maternal-uncles`;
- `descendants` tremendo durante scroll ou gesto bloqueado;
- `descendants` não volta para `core` ao deslizar para baixo no topo;
- rota horizontal recebendo transform/estado do mapa 3x3;
- regressão em toolbar, zoom ou bottom navigation.

## 6. Mapa de arquivos críticos

| Área | Arquivo principal |
|---|---|
| Componente 3x3 mobile | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Componente horizontal mobile | `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx` |
| Fix estrutural mobile | `src/mobileFamilyMapStableMobileFix.ts` |
| Navegação direcional geral | `src/mobileFamilyMapDirectionalNavigationFix.ts` |
| Guards de tios/primos | `src/mobileFamilyMapUncleSwipeNavigationGuard.ts` |
| Lock de descendentes | `src/mobileFamilyMapDescendantsStabilityLock.ts` |
| Zoom/overview direto | `src/mobileFamilyMapZoomOverviewVisualFix.ts` |
| Zoom/overview horizontal | `src/mobileFamilyHorizontalZoomOverview.ts` |
| CSS horizontal | `src/styles/family-map-horizontal.css` |

## 7. Procedimento pós-correção

Após qualquer correção:

1. Fazer commit específico.
2. Aguardar Vercel ficar `Ready`.
3. Rodar este checklist no mobile.
4. Registrar novo baseline em `docs/historico/` se houver mudança de contrato.
5. Atualizar documentação operacional em `docs/operacao/` se houver mudança de QA.
