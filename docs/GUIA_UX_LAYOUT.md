# Guia de UX e layout

> Última revisão: 2026-07-01
> Escopo: experiência visual das rotas principais da branch `main`, com foco em mapa mobile, linha geracional e layout compartilhado.
> Status: canônico.

## Princípios

- Priorizar navegação familiar clara, com foco em pessoas, vínculos e memória.
- Evitar telas com excesso de ações concorrentes.
- Manter desktop e mobile como experiências equivalentes, não idênticas.
- Proteger fluxos de onboarding contra perda acidental de contexto.
- Preservar contraste, legibilidade e áreas clicáveis confortáveis.
- Alterações mobile devem ser isoladas por breakpoint/rota e não podem alterar desktop por herança.

## Mapa familiar

### Desktop

- `/mapa-familiar` usa visualização por grupos de parentesco.
- `/mapa-familiar-horizontal` usa visualização geracional horizontal.
- O painel lateral apresenta seleção de pessoa de referência, temas, métricas, filtros e exportação.
- O seletor de visualização mantém label fechado do tipo `Família de X` quando houver pessoa de referência.
- O placeholder aberto é `Visualize a árvore como...`.
- O cabeçalho do painel mantém título `Visualização`, ícone de olho sem borda visual e ação de recolher na mesma linha.
- `Visualização` usa hierarquia menor que o header global.
- Botões `Árvore Familiar` e `Linha Geracional` devem ter títulos compactos e subtítulos `Visão por grupos` e `Por gerações`.
- Títulos `Resumo`, `Grupos de Familiares` e `Exportar` compartilham formatação compacta.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` preservam largura, gap, labels e botões de exportação.
- `Pai` e `Mãe` são referências de alinhamento visual no mapa por grupos.
- `Salvar Imagem` e `Imprimir` aparecem em uma linha com duas colunas.

### Exportação desktop

- A seção `Exportar` mostra apenas `Salvar Imagem` e `Imprimir`.
- `Salvar Imagem` abre modal de instruções com fundo opaco, três etapas e botões `Cancelar`/`Continuar`.
- Durante seleção de área, zoom, favorito e botão `?` desaparecem.
- A impressão usa página limpa, título superior, árvore centralizada e uma página em retrato ou paisagem.

### Mobile compartilhado

- Em `/mapa-familiar` e `/linha-geracional`, o mobile usa chrome compartilhado: header, toolbar superior e navegação inferior ficam fora da área central trocada pelo `<Outlet />`.
- Alternar `Formato` entre mapa familiar e linha geracional preserva visualmente header, toolbar e menu inferior.
- A navegação mobile evita manter painéis abertos por padrão.
- O header das páginas de árvore usa `Árvore Familiar`.
- O painel aberto pelo botão `+` fica na camada mais alta, acima de header, toolbar, busca, notificações e canvas.
- O painel de visualização mostra contadores e familiares reais por grupo.
- A toolbar mobile usa o rótulo `Mapa`; `Zoom` não deve ser usado para visão geral.
- O zoom real fica no fluxo `Exibir mapa completo`.
- Botões ativos da toolbar superior usam azul principal do site.
- Controles inativos em `Filtros` usam cinza uniforme.
- Ícones do tray `Formato` usam azul principal.

## Tray `Mapa da família`

Os botões da visão geral mobile seguem contrato visual próprio:

- padding uniforme de `8px`;
- conteúdo centralizado nos eixos horizontal e vertical;
- apenas um ícone por botão;
- ícone diferente para cada grupo;
- títulos com `letter-spacing` reduzido em cards estreitos;
- contador centralizado;
- container branco, borda sutil, botões arredondados e estado ativo destacado;
- o botão `Mapa` tem semântica de visão geral;
- cards da visão geral têm destino explícito por grupo;
- controle local `+`/`−` de tios é distinto do botão `+` global;
- painel abre dentro da shell mobile preservando header, toolbar e navegação inferior;
- cards e CTA permanecem acima do backdrop/blur;
- base branca reta envolve cards e `Exibir mapa completo` sem sobra excessiva abaixo do CTA.

## Mapa completo mobile

- A visualização completa é camada própria posicionada abaixo da área superior compartilhada.
- Header, toolbar superior e área de botões permanecem visíveis.
- O container arredondado inicia logo abaixo da toolbar, sem espaçamento extra.
- A base branca reta acompanha a altura do container arredondado.
- O palco permite pan com um dedo e zoom por pinça.
- Pan/pinch preservam o `transform` aplicado pelo usuário.
- `Reenquadrar`, quando disponível, é a ação explícita para recalcular escala e posição.
- Cards e grupos seguem estrutura única.
- Conectores tocam bordas de grupos/cards e não atravessam badges ou títulos.
- A versão atual não renderiza botão `X` próprio; retorno/fechamento deve ser controlado pelo fluxo de toolbar/estado da rota sem deixar blur, overlay ou tray preso.
- Nomes no mapa completo mostram somente dois primeiros termos e não exibem datas/status ao lado do nome.
- `Tios maternos` não deve deixar espaço vazio excessivo abaixo da última linha de cards.

## Camadas e backdrop dos painéis mobile

- Header, toolbar superior, painel ativo, cards, CTA e navegação inferior ficam acima do backdrop parcial.
- O backdrop parcial começa abaixo do painel ativo, não apenas abaixo da toolbar.
- Em `Formato`, o blur começa abaixo dos cards de escolha de visualização.
- Em `Cor`, o blur começa abaixo da faixa de paletas.
- Em `Filtros`, o blur começa abaixo do container de filtros.
- Em `Mapa` de `/mapa-familiar`, o blur começa abaixo dos cards de grupos e do CTA.
- Em `Mapa` de `/linha-geracional`, o blur começa abaixo do container `Gerações`, incluindo `Exibir mapa completo`.
- O backdrop parcial termina no topo real da navegação inferior.
- A toolbar não muda de posição quando qualquer painel é aberto.

## `/linha-geracional`

- A versão mobile tem leitura geracional equivalente à visualização horizontal.
- Cabeçalhos `Geração N` têm margem superior suficiente para não colar na toolbar.
- Títulos de geração têm fonte e peso moderados.
- Cards conjugais empilham quando necessário.
- Conectores representam relações reais e não criam ligação lateral em todos os cards.
- Ajustes de camada da linha geracional são isolados para não afetar `/mapa-familiar`.
- O painel `Mapa` usa grid compacto preferencialmente `3x2`.
- Cada card usa label `GERAÇÃO`, número central, contador e estado ativo evidente.
- A geração ativa, badge e CTA usam azul principal do site.
- O CTA `Exibir mapa completo` permanece dentro da área branca do painel.
- Tocar em uma geração navega para a geração correspondente e fecha o tray sem alterar rota.

## Overlays de header no mobile

- Dropdown de notificações fica acima de todo conteúdo, inclusive toolbars e painéis.
- Sugestões de busca ficam acima de todo conteúdo.
- Menu do avatar fica alto o suficiente para exibir conteúdo sem scroll vertical excessivo.
- A área `Perfis gerenciados`, quando existir, fica dentro do menu do avatar.

## Fluxo de onboarding

```text
/meus-dados
  -> /meus-vinculos
  -> /arquivos-historicos
  -> /preferencias
  -> /revisao-dados
  -> /mapa-familiar
```

Pessoa marcada como falecida em `/meus-dados` pula `/preferencias` e segue para `/revisao-dados`.

## Regra de manutenção visual

Mudanças em mapa mobile devem validar 320px, 375px, 390px e 430px, preferencialmente em iPhone/Safari real ou device mode equivalente. Nenhum ajuste mobile deve alterar desktop por herança.
