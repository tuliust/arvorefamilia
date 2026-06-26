# Mapa familiar

> Última revisão: 2026-06-26
> Escopo: `/mapa-familiar`, `/mapa-familiar-horizontal`, `Home.tsx` e componentes `FamilyTree`.
> Status: canônico.

## Rotas

- `/mapa-familiar`: visualização principal por grupos familiares.
- `/mapa-familiar-horizontal`: visualização geracional horizontal.
- Ambas usam a mesma shell `Home`.
- A rota raiz `/` redireciona para `/mapa-familiar`.

## Dados

`Home.tsx` carrega:

- pessoas por `obterTodasPessoas`;
- relacionamentos por `obterTodosRelacionamentos`;
- pessoa principal vinculada por `getPrimaryLinkedPerson`;
- perfil do membro por `getMemberProfile`;
- contagem de pessoas cadastradas por `getLinkedPersonIds`.

## Pessoa de referência

A pessoa de referência é resolvida a partir de:

1. query string `pessoa`;
2. pessoa em foco na árvore;
3. pessoa vinculada ao usuário;
4. pessoa selecionada;
5. primeira pessoa disponível.

Ao navegar para perfil, o retorno é preservado em `?voltar=`.

## Visualizações

- `treeViewMode.ts` converte rota em modo.
- A troca entre visualizações preserva a query string.
- O painel desktop permite selecionar outra pessoa para visualizar a árvore.
- O título `Visualização` e labels como `Família de X` devem permanecer em UTF-8 válido.
- Ajustes defensivos de runtime devem permanecer isolados e não substituir a correção dos textos de origem.

## Layout desktop por grupos

- `DesktopFamilyMapView.tsx` define coordenadas dos grupos no mapa vertical.
- O card `Pai` e o card `Mãe` são referências visuais que não devem ser deslocadas em ajustes finos.
- `Irmãos` deve alinhar a borda esquerda com `Pai`.
- `Cônjuge` e `Pets` devem alinhar a borda direita com `Mãe`.
- `Filhos` e `Netos` podem ocupar faixa mais à direita para preservar leitura e evitar sobreposição.
- `FamilyTreeVisualCards.tsx` pode reordenar visualmente singles e pares conjugais para evitar terceira linha desnecessária.

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

As ações de exportação são disparadas pelo painel lateral e executadas pelo componente de árvore ativo.

Comportamento atual:

- `Imagem`, `PDF` e `Imprimir` exibem overlay global de preparação antes da operação pesada;
- o overlay é mantido até sinal provável de abertura do diálogo do sistema por `blur`/`visibilitychange`, ou até fallback temporal quando o navegador não emite esses eventos;
- o overlay deve cobrir canvas e painel para evitar impressão visual de travamento;
- o overlay deve usar atributos de ignorar exportação, para não aparecer em capturas geradas por `html2canvas`;
- quando o fluxo abrir janela/aba dedicada para salvar ou imprimir, a página principal do usuário deve permanecer preservada;
- `Área` continua usando o fluxo de seleção visível da árvore e seus estados próprios de loading;
- a geração da imagem/PDF continua baseada no canvas capturado do elemento exportável.

## Busca no header

As páginas de mapa usam busca no header com sugestões de pessoas e páginas. As páginas internas que usam `MemberPageHeader` devem manter comportamento equivalente por meio do componente compartilhado `HeaderGlobalSearch`.

## Contratos de UX

- Desktop deve preservar painel compacto sem cortar a área de exportação.
- O botão de recolher do painel deve ficar dentro do container do painel.
- Botões de exportação não devem cortar texto.
- Mobile deve iniciar com painéis fechados quando aplicável.
- A visualização horizontal não substitui a visualização principal; é rota própria.
- Exportações longas devem manter feedback visual contínuo até que o navegador assuma o fluxo de salvar/imprimir ou o fallback finalize o overlay.
