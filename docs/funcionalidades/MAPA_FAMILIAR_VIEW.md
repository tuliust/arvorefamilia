# Mapa familiar

> Última revisão: 2026-06-30
> Escopo: `/mapa-familiar`, `/mapa-familiar-horizontal`, `/linha-geracional`, `Home.tsx` e componentes `FamilyTree`.
> Status: canônico.

## Rotas

- `/mapa-familiar`: visualização principal por grupos familiares.
- `/mapa-familiar-horizontal`: visualização geracional horizontal.
- `/linha-geracional`: experiência mobile dedicada baseada na leitura horizontal geracional.
- `/mapa-familiar` e `/mapa-familiar-horizontal` usam a mesma shell `Home`.
- A rota raiz `/` redireciona para `/mapa-familiar`.

## Dados

`Home.tsx` carrega:

- pessoas por `obterTodasPessoas`;
- relacionamentos por `obterTodosRelacionamentos`;
- pessoa principal vinculada por `getPrimaryLinkedPerson`/serviço equivalente do perfil de membro;
- perfil do membro por `getMemberProfile`;
- contagem de pessoas cadastradas por `getLinkedPersonIds`.

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
- A troca entre visualizações preserva a query string.
- O painel desktop permite selecionar outra pessoa para visualizar a árvore.
- Em visualização por `?pessoa=`, a árvore deve adotar a pessoa da query como perspectiva e ocultar cônjuges colaterais por padrão.
- No mobile, o header das telas de mapa deve usar o título curto `Árvore Familiar`.
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
- Em perspectiva por `?pessoa=`, o controle de cônjuges colaterais pode ficar indisponível para evitar exibir parentes por afinidade fora da perspectiva atual.
## Exportação no painel desktop

A seção `Exportar` do painel desktop das rotas `/mapa-familiar` e `/mapa-familiar-horizontal` deve expor somente as ações principais estabilizadas:

- `Salvar Imagem`;
- `Imprimir`.

Contrato visual:

- os dois botões devem ficar em uma linha com duas colunas;
- os botões devem ser compactos e não podem extrapolar a altura do painel;
- a nomenclatura `Salvar Imagem` substitui a ação antiga `Área`;
- os botões diretos `Imagem` e `PDF` não devem aparecer no painel principal;
- o painel compacto/flyout deve preservar a mesma semântica quando expuser exportação.

### `Salvar Imagem`

- Abre modal de instruções antes de acionar captura real.
- O modal explica permissão da guia, seleção da área e salvamento do arquivo.
- O usuário deve selecionar a aba atual no prompt do navegador.
- A captura é feita sobre a área visível da página e salva em PNG.
- Durante a seleção, controles de zoom, favorito e botão flutuante `?` devem ficar ocultos.
- O modal deve ter fundo opaco nas duas rotas de mapa.

### `Imprimir`

- Abre a janela nativa de impressão do navegador.
- A página de impressão deve ser limpa e conter apenas título superior e árvore.
- O título deve usar o padrão `Árvore Familiar de X` mesmo quando a rota atual for `/mapa-familiar-horizontal`.
- A árvore deve ficar centralizada horizontalmente.
- A árvore deve caber em uma única página por dimensionamento proporcional.
- O usuário pode alternar `Retrato` e `Paisagem`, e ambos os modos devem ser validados.
- Header, painel lateral, zoom, favorito, botão `?` e overlays não podem aparecer na impressão.

## Layout mobile de `/mapa-familiar`

- A visualização mobile usa telas/grupos navegáveis por gesto, sem herdar o painel fixo desktop.
- O painel aberto pelo botão `+` deve aparecer na camada mais alta da página, acima de header, toolbar, notificações, busca e conteúdo da árvore.
- O painel de visualização deve reconhecer corretamente os familiares da pessoa ativa: pais, cônjuges, irmãos, filhos, pets, avós, bisavós, tataravós, tios, primos e sobrinhos.
- Os itens expandidos do painel devem exibir primeiro e segundo nome completos, evitando truncamentos como duas letras ou reticências prematuras.
- Ao tocar em um familiar listado no painel, a visualização deve mudar para aquela pessoa preservando a query `pessoa`.
- Quando a tela central não tiver conteúdo abaixo, o mobile não deve permitir arrasto vertical para baixo.
- Quando a tela de tios não tiver primos abaixo, o mobile não deve permitir arrasto para baixo a partir de tios paternos ou maternos.
- Linhas verticais abaixo de tios devem aparecer apenas quando houver primos reais naquele lado.
- Avós paternos e maternos devem permanecer nos lados corretos para a pessoa de referência.
- A visão geral/Mapa mobile deve evitar ícones duplicados, ghost click após toque e conectores desalinhados.
- As telas `paternal-uncles` e `maternal-uncles` devem exibir inicialmente até 8 cards no mobile; quando houver mais cards, um botão local `+` revela os demais e alterna para `−` para recolher.
- A limitação de 8 cards é visual e local das telas de tios; contagens da visão geral, filtros e dados da árvore devem continuar usando o total real de pessoas do grupo.
- As telas `paternal-cousins` e `maternal-cousins` devem permitir scroll vertical com um dedo em iPhone/Safari.
- A navegação de retorno de `paternal-cousins` para `paternal-uncles` e de `maternal-cousins` para `maternal-uncles` só deve ocorrer quando a lista de primos estiver no topo e o usuário puxar para baixo.
- Handlers de gesto em `window capture` devem priorizar scroll interno de listas antes de bloquear o evento ou disparar navegação por swipe.

### Visão geral/Mapa mobile

O botão `Mapa` da tela central de `/mapa-familiar` abre um modal de visão geral com nove grupos navegáveis:

- `Ancestrais paternos`;
- `Avós`;
- `Ancestrais maternos`;
- `Tios paternos`;
- `Núcleo central`;
- `Tios maternos`;
- `Primos paternos`;
- `Descendentes`;
- `Primos maternos`.

Contrato visual e funcional:

- cada botão deve ter padding uniforme de `8px`;
- todo o conteúdo do botão deve ficar centralizado;
- cada grupo deve exibir um único ícone, diferente dos demais, sem ícone legado duplicado;
- os ícones devem permanecer maiores que o padrão inicial da visão geral, sem cortar título ou contador;
- títulos em caixa alta podem usar `letter-spacing` reduzido para preservar legibilidade em telas estreitas;
- tocar em um grupo deve navegar para a tela do grupo dentro de `/mapa-familiar`, sem abrir `/pessoa/:id`;
- o guard contra ghost click deve impedir que o toque no modal vaze para cards posicionados por baixo;
- o modal deve ficar acima do header, toolbar, canvas e painéis.
- o botão da toolbar mobile deve se chamar `Mapa`, não `Zoom`, porque sua função é abrir a visão geral de grupos;
- o zoom real deve permanecer associado ao fluxo `Exibir mapa completo`;
- a barra mobile deve manter botões compactos, arredondados, com estado ativo evidente e sem herdar visual desktop;
- os botões da visão geral devem navegar por `data-screen`/tela de destino explícita, sem depender da tela atual ou de estado residual da rota;
- abrir `Mapa` a partir de qualquer tela de `/mapa-familiar` deve sempre manter o usuário dentro de `/mapa-familiar`.

### Mapa completo mobile

O botão `Exibir mapa completo` abre uma camada própria do mapa completo no mobile.

Contrato atual:

- o mapa completo deve abrir acima do modal `Mapa da família`;
- o modal anterior deve ser removido ou ficar inerte quando o mapa completo estiver ativo;
- o body deve permanecer com scroll bloqueado enquanto o mapa completo estiver aberto;
- a camada deve ter botão de fechar e ação de reenquadrar;
- o usuário pode usar pan e zoom por gesto de pinça;
- a implementação não deve depender de clone visual frágil de seções posicionadas na tela;
- a renderização deve usar modelo próprio de nós, cards e conectores;
- cards devem usar estrutura única com variantes como `ancestor`, `mini`, `parent`, `central` e `core`;
- os dados podem ser extraídos das telas mobile existentes, mas devem ser normalizados antes da renderização;
- conectores devem ser gerados a partir de âncoras dos nós, não de paths fixos desconectados da geometria real.

### Conectores do mapa completo mobile

Regras específicas:

- linhas devem iniciar e terminar na borda real do grupo ou card;
- `Bisavós paternos` deve conectar-se a `Avós paternos` por uma única linha saindo da lateral direita do grupo de bisavós;
- `Bisavós maternos` deve conectar-se a `Avós maternos` por uma única linha saindo da lateral esquerda do grupo de bisavós;
- `Tios paternos` deve conectar-se horizontalmente ao card `Pai`;
- `Tios maternos` deve conectar-se horizontalmente ao card `Mãe`;
- os títulos dos cards `Pai` e `Mãe` não podem ficar cortados;
- acima do card da pessoa principal deve sair uma única linha vertical que se ramifica para `Pai` e `Mãe`;
- abaixo do card da pessoa principal deve sair uma única linha vertical que se ramifica para `Irmãos` e `Cônjuge`;
- `Irmãos` deve conectar-se verticalmente a `Sobrinhos`;
- `Tios maternos` deve conectar-se verticalmente a `Primos maternos`;
- conectores não podem ficar soltos, duplicados, atravessar títulos ou depender de offsets manuais sem relação com o box real.

## `/linha-geracional` mobile

- A rota `/linha-geracional` deve manter o header `Árvore Familiar` no mobile.
- A experiência mobile deve reaproveitar a lógica visual horizontal sempre que possível: colunas por geração, conectores de cônjuges, conectores entre casais e filhos e cores por geração.
- Cabeçalhos `Geração 1`, `Geração 2`, etc. devem ter espaçamento superior suficiente em relação à toolbar e ao topo da área rolável.
- Cabeçalhos de geração no mobile devem usar peso e tamanho moderados para não competir com o header principal.
- Gerações sem pessoas não devem ser exibidas como tela vazia inicial quando houver geração seguinte com conteúdo.
- Cards de cônjuges devem ficar um acima do outro quando o layout mobile exigir empilhamento.
- Linhas laterais devem conectar apenas os pares ou relações que justificam conexão visual; não devem conectar todos os cards indiscriminadamente.

### Painel mobile da linha geracional

O painel acionado por `Mapa`/visualização em `/linha-geracional` deve ser isolado da rota `/mapa-familiar`.

Contrato:

- o runtime específico da linha geracional só deve ser montado em `/linha-geracional`;
- o painel deve ficar acima do header no mobile;
- deve existir apenas um botão `X` visível para fechar;
- o botão de fechar deve permanecer no canto superior direito, sem duplicação no DOM;
- grupos devem ser calculados a partir dos dados reais de pessoas e relacionamentos;
- a listagem deve contemplar pais, cônjuges, irmãos, filhos, pets, avós, bisavós, tataravós, tios, primos e sobrinhos;
- nomes de pessoas devem exibir primeiro e segundo nome completos quando disponíveis;
- botões de pessoas devem manter altura compacta, texto alinhado à esquerda e centralização vertical;
- a navegação por pessoa deve preservar a query `pessoa` e não afetar desktop.

## Filtros

- Parentes diretos: pais, filhos, netos, irmãos, avós, bisavós, tataravós, tios, primos, sobrinhos e cônjuges de parentes colaterais.
- Status: vivos, falecidos e pets.
- Preferências de parentes diretos são persistidas por usuário.
- O subtipo legado `sangue` não deve ser usado como critério visual ou formulário de parentesco.

## Paletas

A árvore pode usar paletas visuais de leitura familiar.

Regras atuais:

- a paleta branca permanece limpa e neutra;
- a paleta azul permanece moderna/digital;
- a paleta laranja deve ter atmosfera quente, solar e familiar, com fundo e linhas mais quentes do que a paleta branca;
- a paleta marrom deve preservar caráter sépia, documental e de memória;
- a paleta laranja não deve voltar ao visual bege-amarelado semelhante à branca.

## Ações

- Abrir perfil de pessoa.
- Abrir detalhes de casamento.
- Abrir modal de conexão.
- Alternar tema visual.
- Restaurar visualização.
- Exportar imagem, PDF, impressão ou área selecionada, quando a ação estiver disponível no painel.

## Exportação

As ações de exportação são disparadas pelo painel lateral e executadas em `HomeTreeSection.tsx`.

Comportamento atual:

- `Salvar Imagem` é a ação pública de captura de área real da tela;
- `Salvar Imagem` abre modal de instruções antes de acionar `getDisplayMedia`;
- o usuário seleciona uma área visível da árvore e salva o resultado como PNG;
- durante a seleção, controles de zoom, favorito e botão flutuante `?` ficam ocultos;
- `Imprimir` abre a janela nativa do navegador a partir de uma página limpa de impressão;
- a impressão deve exibir título superior, árvore centralizada e caber em uma única página;
- a impressão não deve exibir header, painel lateral, zoom, favorito, botão `?`, modais ou overlays;
- fluxos internos de preview/PNG/PDF podem existir como compatibilidade técnica, mas não são ações principais expostas no painel desktop atual.

QA mínimo:

- validar `Salvar Imagem` e `Imprimir` em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- validar impressão em `Retrato` e `Paisagem`;
- confirmar que a saída não contém elementos auxiliares da interface;
- confirmar que erros de captura/impressão usam `toast` e não diálogos nativos.

## Busca e notificações no header

As páginas de mapa usam busca no header com sugestões de pessoas e páginas. As páginas internas que usam `MemberPageHeader` devem manter comportamento equivalente por meio do componente compartilhado `HeaderGlobalSearch`.

No mobile:

- sugestões de busca devem aparecer na camada mais alta da interface, acima da toolbar e dos painéis da árvore;
- o dropdown de notificações deve aparecer acima da toolbar, do canvas e de qualquer painel flutuante;
- fechar busca ou notificações não deve deixar overlay preso na página.

## Contratos de UX

- Desktop deve preservar painel compacto sem cortar a área de exportação.
- O botão de recolher do painel deve ficar dentro do container do painel.
- Botões de exportação não devem cortar texto.
- Mobile deve iniciar com painéis fechados quando aplicável.
- A visualização horizontal não substitui a visualização principal; é rota própria.
- Exportações diretas longas devem preparar o preview em aba/janela dedicada, sem bloquear visualmente a página principal.
