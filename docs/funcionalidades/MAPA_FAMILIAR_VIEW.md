# Mapa familiar

> Última revisão: 2026-06-23
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

## Ações

- Abrir perfil de pessoa.
- Abrir detalhes de casamento.
- Abrir modal de conexão.
- Alternar tema visual.
- Exportar imagem, PDF, impressão ou área selecionada, quando a ação estiver disponível no painel.

## Contratos de UX

- Desktop deve preservar painel compacto sem cortar a área de exportação.
- O botão de recolher do painel deve ficar dentro do container do painel.
- Botões de exportação não devem cortar texto.
- Mobile deve iniciar com painéis fechados quando aplicável.
- A visualização horizontal não substitui a visualização principal; é rota própria.
