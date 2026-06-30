# Guia de UX e layout

> Última revisão: 2026-06-30
> Escopo: experiência visual das rotas principais da branch `main`.
> Status: canônico.

## Princípios

- Priorizar navegação familiar clara, com foco em pessoas, vínculos e memória.
- Evitar telas com excesso de ações concorrentes.
- Manter desktop e mobile como experiências equivalentes, não idênticas.
- Proteger fluxos de onboarding contra perda acidental de contexto.
- Preservar contraste, legibilidade e áreas clicáveis confortáveis.
- Alterações mobile devem ser isoladas por breakpoint/rota e não podem alterar desktop por herança.

## Mapa familiar

### Desktop

- `/mapa-familiar` usa visualização por grupos de parentesco.
- `/mapa-familiar-horizontal` usa visualização geracional horizontal.
- O painel lateral apresenta seleção de pessoa de referência, temas, métricas, filtros e exportação.
- O seletor de visualização deve manter label fechado do tipo `Família de X` quando houver pessoa de referência.
- O placeholder aberto é `Visualize a árvore como...`.
- O cabeçalho do painel deve manter o título `Visualização`, ícone de olho sem borda visual e ação de recolher alinhada dentro da mesma linha do título.
- `Visualização` deve usar hierarquia menor que o header global, com `font-size` próximo de `1.1rem`.
- Botões `Árvore Familiar` e `Linha Geracional` devem ter títulos com `font-size: clamp(0.8125rem, 1.6vh, 1.125rem)` e subtítulos curtos: `Visão por grupos` e `Por gerações`.
- Títulos `Resumo`, `Grupos de Familiares` e `Exportar` devem compartilhar formatação compacta: `font-size: clamp(0.76rem, 1.5vh, 0.9rem)`, `font-weight: 720`, `letter-spacing: -0.005em`, `line-height: 1.05`.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem preservar largura e gap gerais, com títulos e linhas legíveis em uma linha, sem reticências ou quebra forçada.
- Títulos `Núcleo`, `Ascendentes` e `Colaterais` devem usar peso moderado e tamanho compacto, sem competir com os títulos de seção.
- Os itens internos desses cards podem aumentar ocupação vertical e espaçamento entre linhas desde que a altura geral do painel não gere corte da área `Exportar`.
- A seção `Grupos de Familiares` deve exibir subtítulo `Clique para exibir/ocultar grupos de parentes na árvore`.
- A área `Exportar` deve permanecer visível e conter apenas dois botões: `Salvar Imagem` e `Imprimir`.
- O painel compacto deve preservar acesso aos botões de exportação.
- No mapa por grupos, o card `Pai` e o card `Mãe` são referências de alinhamento visual: `Irmãos` deve alinhar à esquerda com `Pai`, enquanto `Cônjuge` e `Pets` devem alinhar à direita com `Mãe`.
- `Filhos` e `Netos` podem ocupar faixa mais à direita, desde que a leitura geracional e os conectores permaneçam claros.
- Grupos com pares conjugais devem evitar terceira linha desnecessária quando houver espaço para manter solteiros e pares em duas colunas.
- Os botões `Salvar Imagem` e `Imprimir` devem aparecer em uma linha com duas colunas, com ícone acima, texto centralizado e altura compacta.
- `Salvar Imagem` deve abrir modal de instruções com fundo opaco, cards das três etapas e botões `Cancelar`/`Continuar`.
- Durante a seleção de área, zoom, favorito e botão flutuante `?` devem desaparecer para não contaminar a captura.
- A impressão deve usar página limpa, com título superior, árvore centralizada e ajuste proporcional para uma única página em retrato ou paisagem.

### Exportação desktop

Contrato visual da seção `Exportar`:

- título `Exportar` alinhado aos demais títulos compactos do painel;
- dois botões em grid de duas colunas;
- botões com altura compacta para não sair do painel;
- rótulos públicos: `Salvar Imagem` e `Imprimir`;
- não exibir `Imagem` e `PDF` como ações diretas;
- ícones devem ser legíveis mesmo em telas com menor altura;
- texto deve permanecer em UTF-8 válido, sem mojibake.

Contrato visual do modal de `Salvar Imagem`:

- overlay com fundo opaco;
- container branco;
- três cards de instrução;
- aviso destacado sobre usar zoom antes de capturar;
- botões de rodapé `Cancelar` e `Continuar`.

Contrato visual da impressão:

- título superior em formato de chip;
- árvore centralizada horizontalmente;
- uma página;
- sem header, painel lateral, controles de zoom, favorito ou botão `?`.

### Mobile

- A navegação mobile evita manter painéis abertos por padrão.
- O header das páginas de árvore deve usar `Árvore Familiar`.
- Legenda e grupos devem poder ser abertos sem bloquear permanentemente a rolagem.
- O modal/painel aberto pelo botão `+` deve ficar na camada mais alta, acima de header, toolbar, busca, notificações e canvas.
- O painel de visualização deve mostrar contadores e familiares reais por grupo.
- A visão geral/Mapa mobile deve evitar ghost click, ícones duplicados e conectores deslocados.
- A toolbar mobile deve usar o rótulo `Mapa` para abrir a visão geral; `Zoom` não deve ser usado para essa função.
- O zoom real deve estar no fluxo `Exibir mapa completo`, não no botão `Mapa`.
- As telas de tios no mobile devem mostrar até 8 cards inicialmente e usar botão local `+`/`−` quando houver mais pessoas.
- As telas de primos devem permitir scroll vertical com um dedo antes de qualquer navegação por swipe.
- Nomes de familiares em listas mobile devem usar primeiro e segundo nome completos.
- Se uma área inferior não tiver conteúdo, o gesto vertical para baixo deve ser bloqueado.
- O modal de dica desktop/mobile deve respeitar chave de sessão e não reaparecer continuamente.

#### Modal `Mapa da família`

Os botões da visão geral mobile devem seguir contrato visual próprio:

- padding lateral, superior e inferior de `8px`;
- conteúdo centralizado no eixo horizontal e vertical;
- apenas um ícone por botão;
- ícone diferente para cada grupo;
- ícones em tamanho ampliado, sem reaparecimento de ícone antigo;
- títulos com `letter-spacing` reduzido para caber em cards estreitos;
- contador centralizado e sem deslocamento vertical.
- a barra mobile deve ter container branco, borda sutil, botões arredondados e estado ativo destacado;
- o botão `Mapa` deve ter semântica de visão geral, com `aria-label` equivalente a abrir a visão geral do mapa familiar;
- os cards da visão geral devem ter destino explícito por grupo e não depender da tela em que o usuário abriu o modal;
- o controle local `+`/`−` de tios deve ser visualmente distinto do botão `+` global da toolbar.

#### Mapa completo mobile

- A camada deve ocupar a tela inteira e ficar acima do modal `Mapa da família`.
- O header interno deve ter título, subtítulo curto, botão `Reenquadrar` e botão `X`.
- O palco do mapa deve permitir pan e zoom por pinça.
- Cards e grupos devem seguir uma estrutura única para evitar diferenças visuais entre grupos clonados.
- Conectores devem tocar as bordas dos grupos/cards e não podem atravessar badges ou títulos.

### `/linha-geracional`

- A versão mobile deve ter leitura geracional equivalente à visualização horizontal.
- Cabeçalhos `Geração N` precisam de margem superior suficiente para não colar na toolbar.
- Títulos de geração devem ter fonte e peso moderados.
- Cards conjugais devem empilhar quando necessário.
- Conectores devem representar relações reais e não criar ligação lateral em todos os cards.
- Ajustes de camada da linha geracional mobile devem ser isolados para não afetar `/mapa-familiar`.
## Overlays de header no mobile

- Dropdown de notificações deve ficar acima de todo conteúdo, inclusive toolbars e painéis de árvore.
- Sugestões de busca devem ficar acima de todo conteúdo, inclusive teclado/sugestões nativas quando possível.
- Menu do avatar deve ficar alto o suficiente para exibir conteúdo sem scroll vertical excessivo.
- A área `Perfis gerenciados`, quando existir, deve ficar dentro do menu do avatar em bloco visual separado, com subtítulo `Familiares vinculados à sua conta`, e o menu deve aparecer acima do botão flutuante `?`.

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
- No mobile, a área `Outros ajustes` não deve aparecer.
- No mobile, o botão de foto deve usar `Adicionar foto`.
- No mobile, o toggle `Vivo/Falecido` deve ser compacto.
- O questionário `Sobre Mim` deve terminar em tela `Seu Perfil`, com Mini Bio e Curiosidades editáveis.
- No mobile, os botões `Voltar`, `Pular Tudo` e `Avançar` devem ficar lado a lado; `Voltar` e `Avançar` podem usar apenas ícones.

## Meus vínculos

- Pessoas e pets são grupos distintos.
- Cônjuges aparecem antes de filhos.
- O bloco de textos pessoais não fica nos blocos de vínculos.
- Alterações em vínculos são tratadas como solicitações quando aplicável.
- Pets são cadastrados por modal próprio acionado na seção `Pets`.
- Cards mobile devem manter lixeira no topo direito e badges alinhadas.
- Modais de adicionar parentes não devem abrir teclado automaticamente.

## Arquivos históricos

- A etapa aceita fatos sem arquivo e arquivos vinculados.
- Upload é opcional.
- O termo funcional é `Fatos e Arquivos Históricos`.

## Revisão de dados

- Deve resumir os dados antes do envio final.
- Deve deixar claro o que será mantido, atualizado ou solicitado.
- Não deve prometer gravação direta quando a regra implementada gerar solicitação pendente.
- Parentes pendentes devem aparecer como `Em análise`.
- Se houver perfis sob responsabilidade do usuário, o modal final deve oferecer editar agora ou depois.

## Perfil de pessoa

- Cards vazios sem utilidade, como `Irmãos` sem irmãos, devem ser ocultados.
- `Administração do perfil` não deve aparecer em `/pessoa/:id`; a administração de responsáveis fica fora da página pública do perfil.
- `Discussões relacionadas` deve aparecer abaixo da linha do tempo.
- O CTA superior duplicado de criar discussão deve ser removido quando já houver CTA interno.
- No mobile, o conteúdo inferior deve ter respiro para não ficar sob a navegação inferior.

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
- Cards superiores de `/admin` devem priorizar número principal; `Relações` deve exibir o total de relacionamentos e pode manter o subtítulo de casamentos quando couber.
- `/admin/responsaveis` deve priorizar solicitação pendente quando houver e ocultar essa seção quando vazia.
- `/admin/notificacoes` deve humanizar canais, tipos, status, disponibilidade, frequência e categorias em todas as abas, sem slugs crus.
- `/admin/relacionamentos` deve permitir leitura por filtros de cards, busca por pessoa e sugestões de nomes, sem exibir a classificação legada `sangue`/`adotivo`.
