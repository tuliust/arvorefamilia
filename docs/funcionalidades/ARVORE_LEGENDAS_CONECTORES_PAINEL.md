# Árvore, legendas, conectores e painel

> Última revisão: 2026-06-26
> Escopo: painéis do mapa familiar, conectores, legendas e seletor de visualização.
> Status: canônico.

## Objetivo

Consolidar em um único documento o contrato visual e funcional da árvore, sem recriar documentos antigos de rodada.

## Rotas relacionadas

- `/mapa-familiar`;
- `/mapa-familiar-horizontal`.

`/minha-arvore/editar` permanece apenas como rota legada protegida, redirecionando para `/meus-dados`.

## Painel desktop do mapa familiar

### Dropdown

Label padrão fechado:

```text
Família de [Nome]
```

Deve usar a pessoa central/visualizada ou principal vinculada.

### Dropdown aberto

A primeira opção visível deve ser desabilitada:

```text
Visualize a árvore como...
```

A lista deve priorizar pessoas disponíveis para navegação sem duplicar a pessoa já selecionada.

## Legendas

As legendas devem explicar visualmente:

- pessoa central;
- familiares diretos;
- vínculos por casamento ou relação;
- pets quando presentes;
- estados visuais de destaque, seleção ou foco;
- status conjugais conforme `funcionalidades/STATUS_CONJUGAL.md`, usando símbolos e padrões de linha para união ativa, viuvez, separação, divórcio, união inativa e união histórica.

## Conectores

Os conectores devem preservar leitura geracional e não podem criar linhas soltas ou duplicadas. A prioridade é clareza visual sobre ornamentação.

Regras gerais:

- pais conectam à pessoa central;
- filhos e descendentes devem ficar agrupados de forma legível;
- cônjuges e vínculos relacionais devem usar distinção visual sem competir com laços sanguíneos;
- conectores conjugais devem refletir o status inferido do vínculo sem alterar a leitura geracional principal;
- conectores mobile não devem depender de documentos antigos de rodada.

## Edição de dados do usuário

A edição dos dados do usuário autenticado deve ocorrer em `/meus-dados`.

A rota antiga `/minha-arvore/editar` não deve renderizar página própria. Ela deve permanecer apenas como compatibilidade protegida e redirecionar para `/meus-dados`.

## Relação com componentes

A documentação deve ser conferida contra:

- `src/app/components/FamilyTree`;
- `src/app/components`;
- `src/app/pages`;
- `src/app/services`.

## Não regressão

Antes de alterar árvore, painel ou conectores, validar:

- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- `/meus-dados`;
- redirect legado de `/minha-arvore/editar` para `/meus-dados`;
- visualização desktop e mobile;
- dados com pessoa central, pais, cônjuge, filhos, irmãos e pets;
- legenda e conectores de status conjugais.

## Regra de manutenção

Não recriar `MINHA_ARVORE_EDITAR.md`. Alterações de edição, conectores ou painéis devem ser registradas aqui e refletidas em `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md` quando necessário.
