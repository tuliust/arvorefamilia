# Árvore, legendas, conectores e painel

> Última revisão: 2026-07-03
> Escopo: painéis do mapa familiar, conectores, legendas e seletor de visualização.
> Status: canônico.

## Objetivo

Consolidar em um único documento o contrato visual e funcional da árvore, sem recriar documentos antigos de rodada.

## Ajustes de manutenção de 2026-07-03

- Este documento permanece canônico para painel, conectores, legendas e seletor de visualização.
- O contrato de shell mobile compartilhada e rotas de mapa fica centralizado em `MAPA_FAMILIAR_VIEW.md`.
- Alterações de conectores mobile completos devem ser documentadas aqui apenas quando afetarem regras visuais ou semânticas; detalhes de rota e runtime ficam em `MAPA_FAMILIAR_VIEW.md`.

## Rotas relacionadas

- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- `/linha-geracional`.

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

### Visualização como outra pessoa

Ao selecionar uma pessoa no dropdown, a rota deve adotar essa pessoa como perspectiva, normalmente via query `?pessoa=`. Nessa perspectiva:

- a árvore deve carregar com cônjuges colaterais ocultos por padrão;
- `Todos os cônjuges` deve permanecer clicável para permitir ativação manual;
- o painel não deve forçar `conjuge: false` por renderização quando o usuário já ativou o filtro;
- a troca para outra pessoa pode reiniciar `conjuge` como inativo para preservar a leitura inicial focada no sangue familiar.

### Filtros finais do painel

O painel desktop expõe os controles finais:

- `Todos os cônjuges`: alterna cônjuges de tios, primos e demais parentes colaterais; não deve ser desabilitado em perspectiva por `?pessoa=`.
- `Apenas familiares`: mantém nomenclatura curta e estado desabilitado enquanto a funcionalidade definitiva não estiver especificada.

## Integridade da pessoa de referência

A mesma pessoa não pode ser renderizada simultaneamente como `Pai` e `Mãe`. Quando só houver um vínculo parental cadastrado ou inferível, o modelo deve renderizar apenas o papel seguro e não duplicar o card por fallback posicional.

## Layout dos grupos colaterais no desktop

Grupos de tios e primos devem adaptar a largura ao conteúdo visível:

- `Tios Paternos` e `Tios Maternos` podem compactar largura para 1, 2 ou 3 colunas conforme quantidade visível;
- `Primos Paternos` e `Primos Maternos` devem compactar para 2 colunas quando houver 2, 4 ou 5 cards, e para 3 colunas quando houver 3 ou 6 cards;
- o container não deve manter espaço vazio lateral excessivo quando a coluna efetiva for menor que a configuração original;
- botão local `+`/`−` só deve existir quando a expansão muda a altura útil ou revela uma linha que não cabia inicialmente;
- se expandir apenas troca a quantidade de cards sem alterar altura útil do grupo, todos os cards devem carregar visíveis e o botão local não deve aparecer.

## Relação com documentos de mapa

- `MAPA_FAMILIAR_VIEW.md` concentra rotas, shell mobile, layout de mapa familiar, linha geracional e runtimes defensivos.
- Este documento concentra painel, conectores, legendas e semântica visual da árvore.
- `STATUS_CONJUGAL.md` concentra a interpretação dos vínculos conjugais que alimentam símbolos e padrões de linha.

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
- visualização como Bianca, Charalambos e Leonardo pelo dropdown do painel;
- ausência de duplicidade entre `Pai` e `Mãe` quando só há um vínculo parental;
- grupos de tios e primos sem largura vazia desnecessária;
- legenda e conectores de status conjugais.

## Regra de manutenção

Não recriar `MINHA_ARVORE_EDITAR.md`. Alterações de edição, conectores ou painéis devem ser registradas aqui e refletidas em `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md` quando necessário.
