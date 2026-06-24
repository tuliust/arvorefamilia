# Guia de UX e layout

> Última revisão: 2026-06-23
> Escopo: experiência visual das rotas principais da branch `main`.
> Status: canônico.

## Princípios

- Priorizar navegação familiar clara, com foco em pessoas, vínculos e memória.
- Evitar telas com excesso de ações concorrentes.
- Manter desktop e mobile como experiências equivalentes, não idênticas.
- Proteger fluxos de onboarding contra perda acidental de contexto.
- Preservar contraste, legibilidade e áreas clicáveis confortáveis.

## Mapa familiar

### Desktop

- `/mapa-familiar` usa visualização por grupos de parentesco.
- `/mapa-familiar-horizontal` usa visualização geracional horizontal.
- O painel lateral apresenta seleção de pessoa de referência, temas, métricas, filtros e exportação.
- O seletor de visualização deve manter label fechado do tipo `Família de X` quando houver pessoa de referência.
- O placeholder aberto é `Visualize a árvore como...`.
- O cabeçalho do painel deve manter o título `Visualização`, ícone de olho sem borda visual e ação de recolher alinhada dentro da mesma linha do título.
- Os cards `Núcleo`, `Ascendentes` e `Colaterais` devem preservar largura e gap gerais, com títulos e linhas legíveis em uma linha, sem reticências ou quebra forçada.
- A área `Exportar` deve permanecer visível; quando houver sobra vertical, pode usar maior espaçamento interno e botões mais altos, desde que os quatro botões continuem no painel.
- O painel compacto deve preservar acesso aos botões de exportação.
- No mapa por grupos, o card `Pai` e o card `Mãe` são referências de alinhamento visual: `Irmãos` deve alinhar à esquerda com `Pai`, enquanto `Cônjuge` e `Pets` devem alinhar à direita com `Mãe`.
- `Filhos` e `Netos` podem ocupar faixa mais à direita, desde que a leitura geracional e os conectores permaneçam claros.
- Grupos com pares conjugais devem evitar terceira linha desnecessária quando houver espaço para manter solteiros e pares em duas colunas.

### Mobile

- A navegação mobile evita manter painéis abertos por padrão.
- Legenda e grupos devem poder ser abertos sem bloquear permanentemente a rolagem.
- O modal de dica desktop/mobile deve respeitar chave de sessão e não reaparecer continuamente.

## Fluxo de onboarding

Fluxo principal:

```text
/meus-dados
  -> /meus-vinculos
  -> /arquivos-historicos
  -> /preferencias
  -> /revisao-dados
  -> /mapa-familiar
```

Pessoa marcada como falecida em `/meus-dados` pula `/preferencias` e segue para `/revisao-dados`.

## Meus dados

- O formulário coleta dados pessoais, preferências de privacidade, questionário e insumos para Mini Bio/Curiosidades.
- O modo memorial depende de toggle explícito, não do tom textual.
- Textos de IA devem caber em até 500 caracteres por campo.

## Meus vínculos

- Pessoas e pets são grupos distintos.
- O bloco de textos pessoais fica separado dos blocos de vínculos.
- Alterações em vínculos são tratadas como solicitações quando aplicável.

## Arquivos históricos

- A etapa aceita fatos sem arquivo e arquivos vinculados.
- Upload é opcional.
- O termo funcional é `Fatos e Arquivos Históricos`.

## Revisão de dados

- Deve resumir os dados antes do envio final.
- Deve deixar claro o que será mantido, atualizado ou solicitado.
- Não deve prometer gravação direta quando a regra implementada gerar solicitação pendente.

## Curiosidades

- A rota `/curiosidades` substitui a experiência de modal isolado para exploração de dados.
- Cards e rankings devem refletir dados reais carregados.
- Dropdowns iniciam em estado neutro quando dependem de seleção do usuário.
- A área “Descubra mais sobre...” deve iniciar com `Selecione` e não selecionar uma pessoa automaticamente.
- Badges de status, como `classificados` e `uniões`, devem manter o texto em uma linha.
- Marcadores `+N` em gerações devem ser acionáveis e revelar as pessoas restantes.
- Bodas devem ser exibidas apenas para casais ativos, sem falecidos, em marcos exatos documentados em `funcionalidades/CURIOSIDADES.md`.

## Fórum, favoritos e notificações

- `/forum` mantém busca e filtros visíveis no desktop.
- No desktop, a busca do fórum deve iniciar alinhada a `Categorias` e a ação `Criar novo` deve permanecer alinhada à margem direita do container.
- `/meus-favoritos` deve usar layout amplo para busca/filtros no desktop.
- O botão de notificações nos headers de mapa e páginas de membro deve abrir o dropdown, sem redirecionar diretamente para `/notificacoes` no desktop.
- Notificações devem ter dropdown responsivo e rodapé em duas colunas iguais, com ações curtas sem quebra de linha.
- O menu do avatar mantém atalhos de dúvidas e saída.
