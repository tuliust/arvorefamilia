# Revisão documental — mapa mobile

> Data: 2026-07-01
> Escopo: documentação canônica afetada pelos ajustes mobile de mapa, blur/backdrop, toolbar, visão geral e mapa completo.
> Status: registro de revisão e orientação para atualização dos documentos canônicos.

## Contexto

Esta revisão consolida os ajustes implementados na frente de mapa mobile envolvendo:

- toolbar mobile com `Formato`, `Cor`, `Filtros`, `Mapa` e `+`;
- backdrop/blur atrás dos painéis ativos;
- preservação de header, toolbar superior e navegação inferior;
- painel `Mapa` de `/mapa-familiar`;
- painel `Mapa` de `/linha-geracional`;
- visualização completa de `/mapa-familiar`;
- visualização completa de `/linha-geracional`;
- pan/zoom sem reset automático após gesto;
- isolamento de runtimes por rota, breakpoint e seletor.

## Documentos que devem refletir este contrato

- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/QA_MANUAL.md`;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `docs/arquitetura/DECISOES_ARQUITETURAIS.md`;
- `docs/arquitetura/ROTAS_E_GUARDS.md`.

## Contrato consolidado

### Shell mobile das rotas de mapa

Nas rotas `/mapa-familiar` e `/linha-geracional`, a experiência mobile deve preservar a estrutura principal da página:

- header superior;
- toolbar superior dos mapas;
- área de conteúdo;
- navegação inferior.

Abrir painéis por `Formato`, `Cor`, `Filtros`, `Mapa` ou `+` não pode deslocar a toolbar para a parte inferior nem ocultar a navegação inferior.

### Backdrop/blur

Backdrop/blur mobile, quando usado, deve afetar apenas o conteúdo atrás do painel ativo.

Não pode cobrir:

- header;
- toolbar superior;
- painel ativo;
- cards;
- CTA;
- mapa completo;
- navegação inferior.

O início do backdrop deve ser calculado abaixo do painel ativo, não apenas abaixo da toolbar.

Regras por painel:

- `Formato`: blur começa abaixo dos cards de escolha de visualização;
- `Cor`: blur começa abaixo da faixa de paletas;
- `Filtros`: blur começa abaixo do container de filtros;
- `Mapa` em `/mapa-familiar`: blur começa abaixo dos cards de grupos e CTA;
- `Mapa` em `/linha-geracional`: blur começa abaixo do container `Gerações`, incluindo o botão `Exibir visualização completa`.

O backdrop deve terminar antes da navegação inferior.

### `/mapa-familiar` — painel `Mapa`

O botão `Mapa` abre a visão geral de grupos dentro da shell mobile da rota, preservando header, toolbar e navegação inferior.

A visão geral deve exibir nove grupos navegáveis:

- `Ancestrais paternos`;
- `Avós`;
- `Ancestrais maternos`;
- `Tios paternos`;
- `Núcleo central`;
- `Tios maternos`;
- `Primos paternos`;
- `Descendentes`;
- `Primos maternos`.

Cards e CTA devem ficar acima do backdrop/blur.

### `/linha-geracional` — painel `Mapa`

O painel acionado por `Mapa` em `/linha-geracional` deve ser isolado da rota `/mapa-familiar` e exibido dentro da shell mobile.

Contrato:

- header, toolbar superior e navegação inferior permanecem visíveis;
- o painel de gerações fica acima do backdrop/blur;
- o painel exibe cards `Geração 1` a `Geração 6` quando houver dados suficientes ou quando a navegação exigir atalhos fixos;
- o botão `Exibir visualização completa` permanece dentro da área branca do painel e acima do backdrop.

### Mapa completo mobile

O botão `Exibir mapa completo` ou `Exibir visualização completa` abre a visualização completa sem colocar a árvore por baixo do backdrop/blur.

Contrato:

- mapa completo fica acima do backdrop/blur;
- pan com um dedo funciona;
- zoom por pinça funciona;
- pan/zoom não resetam automaticamente após o usuário soltar o dedo ou encerrar a pinça;
- reidratação, `MutationObserver`, resize ou runtime defensivo não podem sobrescrever o `transform` aplicado pelo usuário, salvo por `Reenquadrar` ou reconstrução real do stage;
- `Reenquadrar`, quando disponível, é a ação explícita para recalcular escala e posição.

## Runtimes relevantes

- `src/mobileMapPanelRefinements.ts`;
- `src/mobileMapToolbarBackdropLayerFix.ts`;
- `src/mobileFamilyMapFullOverview.ts`;
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`;
- `src/mobileFamilyMapFullOverviewConnectorFix.ts`;
- `src/mobileGenerationLineFullOverview.ts`;
- `src/mobileFamilyMapFilterButtonsBehaviorFix.ts`.

## Seletores funcionais relevantes

- `data-mobile-family-map-toolbar`;
- `data-mobile-family-map-toolbar-active`;
- `data-mobile-family-map-toolbar-action`;
- `data-mobile-family-map-inline-overview`;
- `data-mobile-family-map-panel-mode`;
- `data-mobile-family-full-map-button`;
- `mobile-map-toolbar-panel-backdrop`;
- `mobile-family-map-full-overview`;
- `mobile-generation-line-full-overview`;
- `mobile-generation-safe-overview-overlay`.

## QA mínimo

Validar em mobile:

- 320px;
- 375px;
- 390px;
- 430px.

Cenários obrigatórios:

1. Abrir `/mapa-familiar`.
2. Acionar `Formato`, `Cor`, `Filtros`, `Mapa` e `+`.
3. Confirmar que header, toolbar e navegação inferior permanecem visíveis.
4. Confirmar que o blur não cobre painéis, cards, CTA ou menu inferior.
5. Abrir `Exibir mapa completo` em `/mapa-familiar`.
6. Validar pan, zoom e ausência de reset automático.
7. Abrir `/linha-geracional`.
8. Acionar `Mapa`.
9. Confirmar que `Gerações` e `Exibir visualização completa` ficam acima do blur.
10. Abrir visualização completa de `/linha-geracional`.
11. Validar pan, zoom e ausência de reset automático.

## Próxima ação documental

Os documentos canônicos listados neste registro devem ser mantidos coerentes com este contrato. Alterações futuras em mapa mobile devem atualizar primeiro os documentos canônicos, não apenas este histórico.
