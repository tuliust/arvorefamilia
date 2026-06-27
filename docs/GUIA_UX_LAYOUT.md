# Guia de UX e layout

> Última revisão: 2026-06-27
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
- A área `Outros ajustes` usa rótulos diretos: `Meus Vínculos` e `Fatos e Arquivos Históricos`.

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
- A página usa navegação interna sticky por atalhos. No mobile, os atalhos rolam horizontalmente com botões circulares laterais.
- Os cards numéricos superiores de Pessoas, Localização, In memoriam, Pets e Casais não fazem parte da estrutura final da página.
- O topo combina `Hoje na família`, slide de fotos e `Pergunte à IA`. O slide exibe miniaturas no desktop e uma foto por vez no mobile.
- `Pergunte à IA` deve usar contraste azul, sugestões rápidas legíveis e campo de pergunta com placeholder curto.
- `Teste seus conhecimentos` e `Mural da família` devem ter composição equilibrada em desktop e leitura confortável no mobile.
- No quiz, botões de resposta devem ocupar a área disponível, com conteúdo legível e sem truncamento desnecessário.
- Ao selecionar resposta no quiz, o feedback deve aparecer na própria área das opções, com animação de entrada, antes de avançar para a próxima pergunta.
- Ao concluir a rodada do quiz, a página deve exibir mensagem final consolidada de desempenho.
- O mural deve priorizar a pergunta da lembrança e evitar campos redundantes de autoria e visibilidade.
- `Gráficos da família` deve manter leitura simples: barras verticais para aniversários, círculos para profissões e barras horizontais para faixas etárias.
- Círculos de profissões devem preservar proporção e não cortar título, número ou ícone.
- `Gerações da família` inicia com cards recolhidos, exibindo contador por categoria; a expansão revela as pessoas apenas no card aberto.
- `Relacionamentos` consolida métricas de Uniões, Média e Faixa, com Uniões como primeiro card métrico.
- `Rota da família` usa leitura visual de percurso, com pins, linha pontilhada, badges de distância e chegada.
- O card inferior usa abas para `Descubra mais sobre...`, `Qual a minha conexão?`, `Comparar interesses` e `Astrologia da família`.
- No mobile, as abas inferiores devem caber em uma linha, com ícones acima dos títulos e títulos em até duas linhas.
- Dropdowns iniciam em estado neutro quando dependem de seleção do usuário, salvo quando o código usa pessoa vinculada como contexto inicial.
- A área `Descubra mais sobre...` deve iniciar com `Selecione` e não selecionar uma pessoa automaticamente.
- Bodas devem ser exibidas apenas para casais ativos, sem falecidos, em marcos exatos documentados em `funcionalidades/CURIOSIDADES.md`.

## Fórum, favoritos e notificações

- `/forum` mantém busca e filtros visíveis no desktop.
- No desktop, a busca do fórum deve iniciar alinhada a `Categorias` e a ação `Criar novo` deve permanecer alinhada à margem direita do container.
- `/forum/topico/:id` deve usar largura compatível com `/forum`, com tópico principal e coluna lateral de `Tópicos recentes` no desktop.
- Em `/forum/topico/:id`, reações aparecem apenas para o tópico principal, não para respostas.
- `/forum/novo` deve preservar menções legíveis no campo de conteúdo; quando destacado visualmente, o nome mencionado deve aparecer em azul e negrito.
- `/meus-favoritos` deve usar layout amplo para busca/filtros no desktop.
- O botão de notificações nos headers de mapa e páginas de membro deve abrir o dropdown, sem redirecionar diretamente para `/notificacoes` no desktop.
- Notificações devem ter dropdown responsivo e rodapé em duas colunas iguais, com ações curtas sem quebra de linha.
- O menu do avatar mantém primeiro e segundo nome no topo, subtítulo `Editar perfil`, atalhos de dúvidas e saída; o painel deve ficar acima de elementos sticky ou botões superiores.

## Administração

- Nas rotas `/admin/*`, o header global deve manter apenas navegação essencial: `Painel Administrativo`, `Principal` e menu do usuário.
- O botão `Principal` não deve exibir seta; o retorno ao painel administrativo usa `Painel Administrativo`.
- Ações administrativas secundárias, como membros, conteúdo e responsáveis, devem permanecer nas páginas correspondentes ou em cards internos, não no header global.
- Páginas administrativas devem manter acentuação correta em títulos, labels, botões e mensagens.
