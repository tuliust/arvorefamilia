# Árvore, legendas, conectores e painel

> Última revisão: 2026-06-29
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

### Conectores do mapa completo mobile

Além das regras gerais, o mapa completo mobile possui contrato próprio:

- conectores devem ser recalculados a partir das bordas reais dos grupos e cards renderizados;
- as âncoras válidas são `top`, `right`, `bottom` e `left`;
- linhas não devem iniciar no centro visual arbitrário quando a borda do card/grupo for a origem correta;
- `Bisavós paternos → Avós paternos` deve usar uma única linha lateral;
- `Bisavós maternos → Avós maternos` deve usar uma única linha lateral;
- `Tios paternos → Pai` e `Tios maternos → Mãe` devem ser conexões horizontais claras;
- `Tios paternos → Primos paternos` e `Tios maternos → Primos maternos` devem ser conexões verticais quando houver conteúdo real;
- a pessoa central deve ter uma única ramificação superior para `Pai` e `Mãe`;
- a pessoa central deve ter uma única ramificação inferior para `Irmãos` e `Cônjuge`;
- `Irmãos → Sobrinhos`, `Cônjuge → Filhos`, `Cônjuge → Pets` e `Filhos → Netos` devem permanecer legíveis quando os grupos existirem;
- rótulos como `Pai` e `Mãe` devem ficar com `overflow` visível para evitar corte do badge;
- conectores duplicados, soltos, desalinhados ou que atravessem títulos são regressão.

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
