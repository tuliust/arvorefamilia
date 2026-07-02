# Mapa familiar

> Última revisão: 2026-07-01
> Escopo: `/mapa-familiar`, `/mapa-familiar-horizontal`, `/linha-geracional`, shell mobile compartilhada, `Home.tsx`, `LinhaGeracional.tsx` e componentes `FamilyTree`.
> Status: canônico.

## Rotas

- `/mapa-familiar`: visualização principal por grupos familiares; no mobile é filha de `TreeMapSharedLayout` por meio de `MapaFamiliarSharedRoute`.
- `/linha-geracional`: experiência mobile geracional baseada na leitura horizontal; no mobile é filha do mesmo layout compartilhado e usa `mobileChromeMode="shared"`.
- `/mapa-familiar-horizontal`: visualização geracional horizontal baseada na shell `Home`/`TreeHomeShell`, fora do chrome compartilhado mobile.
- `/` redireciona para `/mapa-familiar`.

## Shell mobile compartilhada

No mobile, `/mapa-familiar` e `/linha-geracional` compartilham a mesma estrutura de chrome:

- `TreeMapSharedLayout` renderiza `HomeHeader`, `<Outlet />` e `HomeMobileNav`;
- o header, a toolbar superior e a navegação inferior permanecem fora da área trocada pelo `<Outlet />`;
- alternar `Formato` troca apenas o conteúdo central do mapa;
- `MobileTreeChromeContext` recebe os dados de header, busca, sugestões e navegação da rota filha ativa;
- `MapaFamiliarSharedRoute` adapta temporariamente `Home` ao layout compartilhado, escondendo o shell mobile antigo para evitar duplicidade;
- `LinhaGeracional` usa `mobileChromeMode="shared"` para operar dentro do mesmo chrome.

A experiência desktop continua separada: `/mapa-familiar-horizontal` não deve herdar o chrome compartilhado mobile.

## Dados

`Home.tsx` carrega pessoas, relacionamentos, pessoa vinculada, perfil de membro e contagens. `LinhaGeracional.tsx` carrega a mesma base de pessoas/relacionamentos, resolve a pessoa central por query `pessoa` ou vínculo primário e reaproveita cache de árvore quando disponível.

## Pessoa de referência

A pessoa de referência é resolvida a partir de:

1. query string `pessoa`;
2. pessoa em foco na árvore;
3. pessoa vinculada ao usuário;
4. pessoa selecionada;
5. primeira pessoa disponível.

Ao navegar para perfil, o retorno é preservado em `?voltar=` quando o fluxo de origem fornece essa informação.

## Visualizações

- `treeViewMode.ts` converte rota em modo.
- A troca entre visualizações deve preservar a query string.
- O painel desktop permite selecionar outra pessoa para visualizar a árvore.
- Em visualização por `?pessoa=`, a árvore deve adotar a pessoa da query como perspectiva e ocultar cônjuges colaterais por padrão.
- No mobile, o header das telas de mapa deve usar `Árvore Familiar`.
- O título `Visualização` e labels como `Família de X` devem permanecer em UTF-8 válido.
- Ajustes defensivos de runtime devem permanecer isolados por rota/breakpoint e não substituir a correção dos textos de origem.

## Layout desktop por grupos

- `DesktopFamilyMapView.tsx` define coordenadas dos grupos no mapa vertical.
- O card `Pai` e o card `Mãe` são referências visuais que não devem ser deslocadas em ajustes finos.
- `Irmãos` deve alinhar a borda esquerda com `Pai`.
- `Cônjuge` e `Pets` devem alinhar a borda direita com `Mãe`.
- `Filhos` e `Netos` podem ocupar faixa mais à direita para preservar leitura e evitar sobreposição.
- `FamilyTreeVisualCards.tsx` pode reordenar visualmente singles e pares conjugais para evitar terceira linha desnecessária.
- O painel desktop deve exibir `Grupos de Familiares` e subtítulo `Clique para exibir/ocultar grupos de parentes na árvore`.
- Títulos `Resumo`, `Grupos de Familiares` e `Exportar` devem ter tratamento tipográfico equivalente.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem ocupar o espaço vertical disponível sem cortar a seção `Exportar`.

## Exportação no painel desktop

A seção `Exportar` do painel desktop das rotas `/mapa-familiar` e `/mapa-familiar-horizontal` deve expor somente:

- `Salvar Imagem`;
- `Imprimir`.

Contrato:

- os dois botões ficam em linha com duas colunas;
- os botões são compactos e não extrapolam a altura do painel;
- `Salvar Imagem` substitui a ação antiga `Área`;
- `Imagem` e `PDF` não aparecem como ações diretas no painel principal;
- `Salvar Imagem` abre modal de instruções antes de solicitar captura;
- `Imprimir` abre a janela nativa de impressão com página limpa, título superior e árvore centralizada.

## Layout mobile de `/mapa-familiar`

- A visualização mobile usa telas/grupos navegáveis por gesto, sem herdar o painel fixo desktop.
- A shell mobile preserva header, toolbar superior, área de conteúdo e navegação inferior.
- A toolbar mobile expõe `Formato`, `Cor`, `Filtros`, `Mapa` e `+`.
- Abrir qualquer painel por esses botões não pode deslocar a toolbar para baixo nem ocultar a navegação inferior.
- Botões ativos na toolbar superior usam azul principal do site.
- No tray `Formato`, os cards `Linha Geracional` e `Árvore Familiar` usam ícones azuis e ordem visual controlada pelo componente.
- Em `Filtros`, controles inativos devem usar leitura cinza uniforme.
- Backdrop/blur parcial afeta apenas conteúdo atrás do painel ativo e nunca cobre header, toolbar, painel, cards, CTA ou menu inferior.
- O modo imersivo é reservado a camadas completas, mas o mapa completo atual preserva a área superior compartilhada visível.

## Painel `Mapa` de `/mapa-familiar`

O botão `Mapa` abre a visão geral com nove grupos navegáveis:

- `Ancestrais paternos`;
- `Avós`;
- `Ancestrais maternos`;
- `Tios paternos`;
- `Núcleo central`;
- `Tios maternos`;
- `Primos paternos`;
- `Descendentes`;
- `Primos maternos`.

Contrato:

- cada botão tem padding uniforme e conteúdo centralizado;
- cada grupo tem ícone único;
- tocar em grupo navega para a tela do grupo dentro de `/mapa-familiar`;
- o guard de ghost click impede vazamento para cards posicionados por baixo;
- a área branca envolve grade e CTA `Exibir mapa completo`, sem corte nem sobra excessiva abaixo do botão;
- abrir `Mapa` a partir de qualquer tela deve manter o usuário dentro de `/mapa-familiar`.

## Telas de tios, primos e descendentes

- `Tios Paternos` e `Tios Maternos` exibem inicialmente até 8 cards no mobile.
- Quando houver mais cards, um botão local `+` revela os demais e alterna para `−` para recolher.
- A limitação de 8 cards é visual e local; contagens e dados reais continuam usando o total do grupo.
- O sizing dos grupos de tios deve ser estável e não pode piscar alternando quantidade de cards.
- `Primos Paternos` e `Primos Maternos` permitem scroll vertical com um dedo em iPhone/Safari.
- A navegação de primos para tios só ocorre quando a lista de primos está no topo e o usuário puxa para baixo.
- Em `Descendentes`, as linhas verticais superiores acima do card de cônjuge e do grupo de irmãos devem ter altura equivalente à linha que conecta irmãos e sobrinhos.

## Mapa completo mobile

O botão `Exibir mapa completo` abre uma camada própria de mapa completo no mobile.

Contrato atual:

- a abertura parte do painel `Mapa`/`Mapa da família` ou do painel `Mapa` da linha geracional;
- o container arredondado inicia logo abaixo da toolbar superior, sem espaçamento extra;
- a base branca reta atrás do container acompanha a altura da área arredondada até o fim;
- a versão atual de `MobileFamilyMapFullLayer` não renderiza botão `X` próprio;
- o retorno/fechamento é controlado pelo estado da toolbar/rota, sem deixar blur, overlay ou tray preso;
- pan com um dedo e zoom por pinça devem funcionar;
- pan e zoom não podem resetar automaticamente após o gesto;
- reidratações, observers, resize ou runtimes defensivos não podem sobrescrever o `transform` do usuário, salvo por `Reenquadrar` ou reconstrução real do stage;
- a renderização usa modelo próprio de nós, cards e conectores;
- cards exibem somente os dois primeiros termos do nome, sem datas/status ao lado do nome;
- `Tios maternos` deve ser compactado quando houver sobra vertical abaixo da última linha de cards;
- conectores devem ser reconstruídos após compactações para manter âncoras corretas.

## Conectores do mapa completo mobile

- Linhas devem iniciar e terminar na borda real do grupo ou card.
- `Bisavós paternos` conecta-se a `Avós paternos` por uma única linha saindo da lateral direita do grupo de bisavós.
- `Bisavós maternos` conecta-se a `Avós maternos` por uma única linha saindo da lateral esquerda do grupo de bisavós.
- `Tios paternos` conecta-se horizontalmente ao card `Pai`.
- `Tios maternos` conecta-se horizontalmente ao card `Mãe`.
- Acima da pessoa principal sai uma única linha vertical que se ramifica para `Pai` e `Mãe`.
- Abaixo da pessoa principal sai uma única linha vertical que se ramifica para `Irmãos` e `Cônjuge`.
- `Irmãos` conecta-se verticalmente a `Sobrinhos`.
- `Tios maternos` conecta-se verticalmente a `Primos maternos`.
- Conectores não podem ficar soltos, duplicados, atravessar títulos ou depender de offsets sem relação com o box real.

## `/linha-geracional` mobile

- A rota mantém header `Árvore Familiar` no mobile.
- A experiência reaproveita a leitura horizontal por gerações.
- Cabeçalhos `Geração N` têm espaçamento superior suficiente em relação à toolbar.
- Cards de cônjuges empilham quando necessário.
- Linhas laterais conectam apenas pares ou relações justificadas por dados reais.

### Painel `Mapa` da linha geracional

- O painel é isolado da rota `/mapa-familiar` e exibido dentro da shell mobile compartilhada.
- Header, toolbar superior e navegação inferior permanecem visíveis.
- O painel fica acima do backdrop/blur.
- O painel exibe cards compactos com label `GERAÇÃO`, numerados de 1 a 6.
- O layout preferencial é grid `3x2`.
- A geração ativa tem estado visual evidente, borda azul e acessibilidade equivalente.
- O badge de contagem e o CTA `Exibir mapa completo` usam azul alinhado à cor principal do site.
- Tocar em geração navega para a geração correspondente e fecha o tray sem trocar rota.
- O botão `Exibir mapa completo` fica dentro da área branca do painel.
- A visualização completa monta colunas geracionais lado a lado e preserva pan/zoom.
- Nomes exibem primeiro e segundo nome completos; no mapa completo não devem aparecer datas/status junto ao nome.

## Filtros

- Parentes diretos: pais, filhos, netos, irmãos, avós, bisavós, tataravós, tios, primos, sobrinhos e cônjuges de parentes colaterais.
- Status: vivos, falecidos e pets.
- Preferências de parentes diretos são persistidas por usuário.
- O subtipo legado `sangue` não deve ser usado como critério visual ou formulário de parentesco.

## Paletas

- A paleta branca permanece limpa e neutra.
- A paleta azul permanece moderna/digital.
- A paleta laranja deve ter atmosfera quente, solar e familiar.
- A paleta marrom deve preservar caráter sépia, documental e de memória.

## Runtimes defensivos vigentes nesta frente

- `mobileFamilyMapUncleCardLimit.ts`: limite visual local de tios e coordenação de expansão.
- `mobileFamilyTreeUncleSizingFix.ts`: sizing estável de telas de tios.
- `mobileFamilyMapDescendantConnectorHeightFix.ts`: altura dos conectores superiores de `Descendentes`.
- `mobileFamilyMapFullOverviewCompactFix.ts`: compactação de `Tios maternos`, nomes de dois termos e reconstrução de conectores no mapa completo.
- `mobileFamilyMapZoomTrayHeightFix.ts`: redução da base branca reta do tray `Mapa`.
- `mobileFamilyMapFullOverviewConnectorFix.ts`: refinamento de conectores do mapa completo.
- `mobileGenerationLineFullOverview.ts`: visualização completa da linha geracional.
- `mobileFamilyMapFilterButtonsBehaviorFix.ts`: comportamento defensivo dos filtros mobile.

Esses runtimes devem permanecer isolados por rota, breakpoint e seletor. Quando o comportamento estabilizar no componente React de origem, o runtime correspondente deve ser removido ou neutralizado com documentação.
