# Árvore, legendas, conectores e painel

> Última revisão: 2026-06-23  
> Escopo: `/minha-arvore`, `/minha-arvore/editar`, painéis do mapa familiar, conectores, legendas e seletor de visualização.  
> Status: canônico.

## Objetivo

Consolidar em um único documento o contrato visual e funcional da árvore, incluindo a edição que antes estava documentada separadamente em `MINHA_ARVORE_EDITAR.md`.

## Rotas relacionadas

- `/minha-arvore`;
- `/minha-arvore/editar`;
- `/mapa-familiar`;
- `/mapa-familiar-horizontal`.

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
- estados visuais de destaque, seleção ou foco.

## Conectores

Os conectores devem preservar leitura geracional e não podem criar linhas soltas ou duplicadas. A prioridade é clareza visual sobre ornamentação.

Regras gerais:

- pais conectam à pessoa central;
- filhos e descendentes devem ficar agrupados de forma legível;
- cônjuges e vínculos relacionais devem usar distinção visual sem competir com laços sanguíneos;
- conectores mobile não devem depender de documentos antigos de rodada.

## Edição da árvore

A edição em `/minha-arvore/editar` deve permitir manutenção controlada de dados familiares conforme permissões do usuário.

Fluxos esperados:

- localizar pessoa;
- revisar dados principais;
- ajustar vínculos quando disponível;
- respeitar guards e perfil de acesso;
- evitar alterações silenciosas sem confirmação visual.

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
- `/minha-arvore`;
- `/minha-arvore/editar`;
- visualização desktop e mobile;
- dados com pessoa central, pais, cônjuge, filhos, irmãos e pets.

## Regra de manutenção

Não recriar `MINHA_ARVORE_EDITAR.md`. Alterações de edição, conectores ou painéis devem ser registradas aqui e refletidas em `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md` quando necessário.
