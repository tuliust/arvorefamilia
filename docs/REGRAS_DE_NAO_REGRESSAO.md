# Regras de não regressão

> Última revisão: 2026-07-01
> Escopo: contratos que não devem ser quebrados em novas alterações, incluindo layout compartilhado mobile dos mapas.
> Status: canônico.

## Rotas

- `/` deve continuar redirecionando para `/mapa-familiar`.
- No mobile, `/mapa-familiar` e `/linha-geracional` devem permanecer sob o layout compartilhado `TreeMapSharedLayout`, com header, toolbar superior e navegação inferior fora da área trocada pelo `<Outlet />`.
- `/mapa-familiar-horizontal` deve continuar usando a shell `Home`/`TreeHomeShell`, sem herdar o chrome compartilhado mobile.
- `/linha-geracional` deve continuar sendo experiência geracional mobile, mas como filha do layout compartilhado de mapas.
- `/pessoa/:id` e `/pessoas/:id` devem continuar apontando para `PersonProfile`.
- Rotas administrativas, exceto `/admin/login`, devem continuar protegidas por `ProtectedRoute`.
- Usuário com primeiro acesso incompleto (`dados_confirmados = false`) não pode acessar rotas internas fora do fluxo de onboarding.

## Chrome mobile compartilhado

- Alternar `Formato` entre `/mapa-familiar` e `/linha-geracional` não pode remontar visualmente header, toolbar superior ou navegação inferior.
- A área trocada pelo `<Outlet />` deve ser somente o conteúdo central do mapa.
- `TreeMapSharedLayout`, `MobileTreeChromeContext`, `MapaFamiliarSharedRoute` e `LinhaGeracional mobileChromeMode="shared"` são parte do contrato vigente.
- O adaptador `MapaFamiliarSharedRoute` é transição: pode esconder o shell antigo do `Home` no mobile, mas não deve afetar desktop.
- Runtimes específicos de linha geracional podem estar montados no layout compartilhado desde que sejam isolados internamente por `pathname`, breakpoint e seletores explícitos.

## Mapa familiar mobile

- A alternância entre mapa familiar e linha geracional deve preservar query string e pessoa de referência.
- No mobile, o header deve exibir `Árvore Familiar`.
- O painel do botão `+` deve ficar acima de todos os demais elementos da página.
- A visão geral/Mapa mobile não deve duplicar ícones, disparar ghost click ou deslocar conectores.
- O botão da toolbar mobile deve se chamar `Mapa`; `Zoom` não deve ser usado para visão geral.
- Ao abrir `Formato`, `Cor`, `Filtros`, `Mapa` ou `+`, a toolbar não pode mudar de posição e a navegação inferior não pode desaparecer.
- Backdrop/blur parcial deve ficar atrás do painel ativo e nunca cobrir header, toolbar, cards, CTA ou navegação inferior.
- O fundo branco de `Mapa da família` e `Gerações` deve envolver cards e CTA, sem corte nem sobra excessiva.
- `Tios Paternos` e `Tios Maternos` devem exibir inicialmente no máximo 8 cards quando houver muitos registros.
- O botão local `+` dos tios revela os demais cards e alterna para `−`.
- `Primos Paternos` e `Primos Maternos` devem rolar com um dedo em iPhone/Safari.
- Handlers de toque não podem bloquear scroll interno antes de avaliar se há rolagem disponível.

## Mapa completo mobile

- `Exibir mapa completo` abre camada completa com container arredondado abaixo da toolbar.
- O mapa completo não pode ficar por baixo de backdrop/blur.
- A versão atual não deve renderizar botão `X` próprio.
- Retorno/fechamento deve ser controlado pelo fluxo da toolbar/estado da rota, sem deixar blur, overlay ou tray preso.
- Pan e zoom por pinça funcionam sem rolar a página por baixo.
- Pan e zoom não podem resetar automaticamente após o gesto.
- Runtimes e observers não podem sobrescrever o `transform` do usuário, salvo por `Reenquadrar` ou reconstrução real.
- Cards exibem somente os dois primeiros termos do nome e não exibem datas/status ao lado do nome.
- `Tios maternos` não pode deixar espaço vazio excessivo abaixo da última linha.
- Conectores devem partir da borda real de grupos/cards e não podem ficar soltos ou duplicados.

## Linha geracional mobile

- `/linha-geracional` preserva título `Árvore Familiar` no header mobile.
- O painel `Mapa` preserva header, toolbar superior e navegação inferior.
- O painel `Mapa` exibe cards compactos `GERAÇÃO` numerados de 1 a 6, preferencialmente em grid `3x2`.
- Cada card navega para a geração correspondente, atualiza estado ativo e fecha o tray sem trocar rota.
- O fundo branco do painel envolve grade e CTA inferior.
- A visualização completa preserva `transform` após pan ou pinch.

## Escopo documental

- Alterações documentais finais devem ficar restritas a `docs/`.
- Alterações funcionais de mapa mobile devem atualizar `MAPA_FAMILIAR_VIEW.md`, `GUIA_UX_LAYOUT.md`, `GUIA_COMPONENTES.md`, `GUIA_IMPLEMENTACOES.md`, `QA_MANUAL.md`, `REGRAS_DE_NAO_REGRESSAO.md`, `INVENTARIO_TECNICO.md`, `ROTAS_E_GUARDS.md` e `DECISOES_ARQUITETURAIS.md`.
