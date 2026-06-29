# Mapa familiar

> Última revisão: 2026-06-29
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
## `/linha-geracional` mobile

- A rota `/linha-geracional` deve manter o header `Árvore Familiar` no mobile.
- A experiência mobile deve reaproveitar a lógica visual horizontal sempre que possível: colunas por geração, conectores de cônjuges, conectores entre casais e filhos e cores por geração.
- Cabeçalhos `Geração 1`, `Geração 2`, etc. devem ter espaçamento superior suficiente em relação à toolbar e ao topo da área rolável.
- Cabeçalhos de geração no mobile devem usar peso e tamanho moderados para não competir com o header principal.
- Gerações sem pessoas não devem ser exibidas como tela vazia inicial quando houver geração seguinte com conteúdo.
- Cards de cônjuges devem ficar um acima do outro quando o layout mobile exigir empilhamento.
- Linhas laterais devem conectar apenas os pares ou relações que justificam conexão visual; não devem conectar todos os cards indiscriminadamente.

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

As ações de exportação são disparadas pelo painel lateral e executadas pelo componente de árvore ativo ou pela aba de preview.

Comportamento atual:

- `Área` continua usando o fluxo de seleção visível da árvore e seus estados próprios de loading;
- no fluxo `Área`, os botões `Salvar PNG`, `Salvar PDF`, `Imprimir` e `Cancelar` devem executar a ação correspondente ou encerrar a seleção;
- `Imagem`, `PDF` e `Imprimir` não devem substituir a página de trabalho atual do usuário;
- `Imagem`, `PDF` e `Imprimir` abrem uma nova aba/janela usando a rota atual com `exportPreview=1`;
- `exportIntent=png` exibe apenas a ação `Salvar PNG`;
- `exportIntent=pdf` exibe apenas a ação `Exportar PDF`;
- `exportIntent=print` exibe apenas a ação `Imprimir`;
- a aba de preview deve renderizar a mesma visualização de `/mapa-familiar` ou `/mapa-familiar-horizontal`, sem header, painel lateral, botão flutuante `?`, favoritos, controles auxiliares ou toolbars de navegação;
- `Salvar PNG` captura a árvore renderizada no próprio preview com escala `1.5`;
- `Exportar PDF` deve gerar arquivo PDF a partir da captura do preview quando o fluxo estiver estável;
- `Imprimir` deve organizar a árvore em página única, usando orientação retrato ou paisagem conforme a proporção;
- `treeExport.ts` e `TreeAreaSelectionOverlay.tsx` devem tratar erros, timeouts e bloqueio de pop-up com mensagem legível;
- a página principal do usuário deve permanecer preservada durante os fluxos de preview.

Estado de QA:

- o preview real está implementado, mas a captura final por `html2canvas` ainda exige validação visual;
- o artefato exportado não pode exibir blocos cinza derivados de sombras/filtros, títulos de grupos cortados, texto ilegível ou cards deformados;
- se esses artefatos aparecerem, a frente deve permanecer marcada como em ajuste, sem ser tratada como concluída.
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
