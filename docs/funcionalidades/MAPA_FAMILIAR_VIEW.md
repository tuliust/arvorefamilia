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
- Mobile deve iniciar com painéis fechados quando aplicável.
- A visualização horizontal não substitui a visualização principal; é rota própria.
