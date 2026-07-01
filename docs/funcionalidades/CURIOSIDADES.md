# Curiosidades

> Última revisão: 2026-07-01
> Escopo: `/curiosidades`, exploração visual e textual dos dados familiares, rankings, IA, quiz, mural, fotos, relacionamentos, rota, gerações e abas de descoberta.
> Status: canônico.

## Objetivo

Transformar os dados da árvore em exploração visual e textual: datas, relações, cidades, memórias, profissões, casais, gerações, padrões familiares e perguntas assistidas por IA.

Este documento cobre a página geral `/curiosidades`. Textos individuais de perfil e geração assistida por IA ficam em `MINI_BIO_CURIOSIDADES_IA.md`.

## Dados usados

A página depende principalmente de:

- pessoas;
- relacionamentos;
- datas de nascimento, casamento e falecimento;
- locais de nascimento, falecimento e residência atual;
- profissão;
- indicador humano/pet;
- campos de perfil;
- foto principal dos perfis;
- memórias publicadas no mural;
- badges selecionadas do questionário de perfil, com fallback quando a RPC de leitura não estiver disponível no ambiente remoto.

## Estrutura atual da página

A página `/curiosidades` é composta por blocos responsivos, renderizados a partir de `Curiosidades.tsx`:

1. navegação sticky por atalhos internos;
2. `Hoje na família` e slide de fotos;
3. `Pergunte à IA`;
4. `Teste seus conhecimentos` e `Mural da família`;
5. `Você Sabia?`;
6. `Gráficos da família`;
7. `Gerações da família`;
8. `Relacionamentos` e `Rota da família`;
9. card inferior com abas de exploração.

Os cards numéricos superiores de `Pessoas`, `Localização`, `In memoriam`, `Pets` e `Casais` não fazem parte da estrutura final da página.

## Navegação interna

A barra superior deve funcionar como navegação sticky da página. Os atalhos canônicos são:

- Hoje;
- IA;
- Fotos;
- Quiz;
- Mural;
- Você Sabia;
- Gráficos;
- Gerações;
- Relacionamentos;
- Rotas;
- Conexões.

No mobile, a barra usa rolagem horizontal com botões circulares laterais para avançar e voltar. Esses botões devem ficar ao lado da lista de atalhos, sem sobrepor os cards.

A página usa desbloqueio de overflow específico para permitir o comportamento sticky da navegação sem afetar outras rotas. Enquanto `/curiosidades` está montada, `html`, `body` e o wrapper direto da página devem permitir overflow compatível com a fixação da barra.

## Hoje na família e fotos

`Hoje na família` exibe eventos da data atual a partir de aniversários, casamentos, falecimentos e memórias cadastradas.

O slide de fotos usa fotos principais de pessoas humanas, excluindo pets. No desktop, o componente pode exibir miniaturas em grade. No mobile, deve exibir uma foto por vez, com botões circulares de avançar e voltar sobre a imagem e legenda em faixa abaixo da foto.

## Pergunte à IA

A área `Pergunte à IA` permite perguntas em linguagem natural sobre pessoas, relações, cidades, datas e padrões da árvore.

Regras:

- o placeholder do campo deve ser `Faça aqui sua pergunta…`;
- as sugestões rápidas devem preencher o card sem comprometer leitura;
- no mobile, a interface deve limitar visualmente a três sugestões rápidas;
- sugestões mobile devem ter texto alinhado à esquerda;
- a pergunta só deve ser enviada quando houver contexto familiar carregado e texto preenchido;
- a resposta deve usar o contexto estruturado da árvore, sem inventar dados ausentes.

O contrato técnico de IA permanece centralizado em `MINI_BIO_CURIOSIDADES_IA.md` e em `api/ai.ts`.

## Teste seus conhecimentos

O quiz é gerado a partir dos dados familiares cadastrados.

Regras:

- cada rodada deve exibir até cinco perguntas;
- cada pergunta deve exibir até seis opções quando houver dados suficientes;

- a base mínima para gerar perguntas completas é de seis pessoas humanas elegíveis;
- o estado vazio deve orientar cadastrar pelo menos seis familiares com datas, cidades ou profissões;
- testes unitários devem validar seis opções por pergunta quando o dataset de teste contém seis pessoas elegíveis;
- opções de pessoas devem usar nome curto sempre que possível;
- quando houver homônimos, a opção deve ser desambiguada com último sobrenome ou nome completo, evitando duas respostas visualmente idênticas;
- perguntas de profissão, localidade, longevidade e quantidade de filhos devem variar candidatos quando houver base suficiente, evitando repetir sempre o mesmo bloco de alternativas;
- a pergunta de longevidade usa o texto `Quem é a pessoa com mais tempo de vida?`;
- o indicador da pergunta deve usar formato compacto, como `1/5`;
- a etapa visual pode usar pílulas ou pontos, mas não deve exibir ícone de interrogação no cabeçalho da pergunta;
- botões de resposta devem ocupar a área disponível, com altura confortável, avatares ou iniciais legíveis e texto sem truncamento desnecessário;
- a resposta correta e a explicação devem aparecer somente após seleção;
- após seleção, o feedback deve substituir a área das alternativas e usar animação de entrada;
- o avanço para a próxima pergunta ou resultado deve ocorrer por botão dentro do painel de feedback;
- ao final, o quiz deve exibir resultado consolidado e opção de refazer.

Mensagens finais canônicas:

- `Parabéns! Você acertou todas as perguntas.`;
- `Quase lá... Você acertou X/Y perguntas.`;
- `Ah... Você acertou somente X/Y das perguntas.`;
- `Que pena! Você não acertou nenhuma pergunta.`.

## Mural da família

O mural coleta lembranças familiares.

Regras:

- não exibir campo manual de nome;
- não exibir dropdown de visibilidade;
- a pergunta deve aparecer como título destacado: `Qual sua lembrança favorita da família?`;
- não exibir o prefixo `Responda:`;
- a publicação deve ser familiar internamente, sem exibir chips como `Todos da família` ou `lembrança` nos cards;
- o autor deve ser derivado do usuário logado;
- o texto da lembrança deve ser limitado a 200 caracteres;
- a lista deve exibir rolagem vertical quando houver mais lembranças do que a área visível comporta;
- o botão de apagar deve aparecer apenas para o autor da lembrança;
- estado vazio deve indicar que nenhuma lembrança foi publicada.

## Gráficos da família

A área de gráficos deve priorizar visualizações simples e legíveis.

Blocos atuais:

- `Aniversários por mês`: gráfico vertical com meses abreviados `Jan`, `Fev`, `Mar`, `Abr`, `Mai`, `Jun`, `Jul`, `Ago`, `Set`, `Out`, `Nov` e `Dez`, com o número de aniversários acima de cada barra.
- `Profissões mais comuns`: até cinco profissões no desktop; no mobile, limite visual de três círculos. Cada círculo deve manter proporção perfeita e conter ícone, contagem e título sem corte inferior.
- `Faixa Etária`: barras horizontais com números em círculos e sem repetição da label abaixo da barra.

## Gerações da família

A seção agrupa pessoas por geração social.

Regras:

- a primeira geração com pessoas cadastradas deve iniciar expandida;
- ao expandir outra geração, a geração anterior deve ser recolhida;
- apenas uma geração deve permanecer expandida por vez;
- cards recolhidos não devem exibir usuários;
- cada card recolhido deve exibir o número de pessoas da categoria;
- ao expandir uma geração, os usuários aparecem apenas no card expandido;
- o botão de expansão deve ser claro e acessível.

## Relacionamentos

`Relacionamentos` consolida indicadores de casamentos, uniões ativas e bodas.

Regras:

- o card deve exibir três métricas: `Uniões`, `Média` e `Faixa`;
- `Uniões` deve ser o primeiro card métrico, à esquerda no desktop;
- `Média` representa a idade média ao casar quando houver datas suficientes;
- `Faixa` representa a menor e a maior idade ao casar calculadas;
- quando não houver dados suficientes para média/faixa, o card de `Uniões` deve continuar visível e o restante deve exibir estado informativo;
- bodas devem listar somente casais ativos, sem separação registrada e sem data de falecimento em nenhuma das duas pessoas do casal.

Marcos permitidos de bodas: 1 ano Papel; 5 anos Madeira; 10 anos Estanho; 15 anos Cristal; 20 anos Porcelana; 25 anos Prata; 30 anos Pérola; 40 anos Esmeralda; 45 anos Rubi; 50 anos Ouro; 60 anos Diamante; 75 anos Brilhante.

Não exibir boda por aproximação. O número de anos precisa corresponder exatamente a um dos marcos permitidos.

## Rota da família

A rota apresenta um percurso editorial pelas cidades familiares cadastradas.

Regras atuais:

- exibir título `Rota da família` em UTF-8 válido;
- exibir subtítulo `Uma rota pelas cidades onde familiares têm residência cadastrada.`;
- exibir `Trajeto de carro` com o total rodoviário `4.231 km`;
- usar a ilustração `src/app/components/layout/mapa.png`;
- no desktop, renderizar a ilustração no card com 575 x 327 px, permitindo que a imagem extrapole visualmente o card sem alterar a altura principal;
- no mobile, manter a imagem contida e proporcional;
- ordenar as cidades como Natal/RN, Recife/PE, Paulo Afonso/BA, Aracaju/SE, Belo Horizonte/MG e Porto Alegre/RS;
- mostrar pins, linha pontilhada e badges de distância;
- a última cidade deve exibir estado de chegada.

Distâncias editoriais:

- Natal → Recife: 285 km;
- Recife → Paulo Afonso: 445 km;
- Paulo Afonso → Aracaju: 262 km;
- Aracaju → Belo Horizonte: 1.533 km;
- Belo Horizonte → Porto Alegre: 1.706 km.

## Card inferior com abas

O card inferior consolida quatro explorações:

- `Descubra mais sobre...`;
- `Qual a minha conexão?`;
- `Comparar interesses`;
- `Astrologia da família`.

Regras:

- abas devem alternar conteúdo sem criar cards independentes duplicados;
- o hash da URL pode selecionar a aba correspondente;
- botões das abas devem caber em uma linha no mobile;
- ícones ficam acima dos títulos no mobile;
- títulos dos botões podem quebrar em até duas linhas;
- o título interno da aba ativa deve alinhar à margem esquerda no mobile;
- o ícone ao lado do título interno pode ser ocultado no mobile para preservar leitura.

## Comparar interesses

A comparação de interesses cruza dados objetivos do perfil e badges do questionário de `/meus-dados`.

Regras:

- considerar interesses e características selecionados no questionário de perfil, incluindo grupos como estilo, autodefinição e família/vínculos;
- manter fallback quando as badges do questionário não estiverem disponíveis;
- pluralizar corretamente o resultado: `1 ponto em comum`, `2 pontos em comum` etc.;
- não criar afinidade com dado inexistente ou inferido fora do cadastro.

## Tipos de curiosidade

A página pode apresentar rankings, agrupamentos por local, aniversários, estatísticas de longevidade, perfis com campos preenchidos, pets, vínculos, gerações sociais, bodas, rota familiar, mural, quiz e descobertas orientadas por pessoa e tópicos.

## Regras gerais de exibição

- Não inventar fatos ausentes no banco.
- Distinguir dado vazio de dado desconhecido.
- Não misturar pessoa humana e pet em rankings que exijam semântica humana.
- Usar badges e cards de forma consistente com `GUIA_UX_LAYOUT.md`.
- Dropdowns que dependem de escolha do usuário devem iniciar neutros, salvo quando o comportamento implementado define pessoa vinculada como contexto inicial.
- O fluxo `Descubra mais sobre...` deve iniciar com `Selecione` e não pode quebrar sem pessoa selecionada.
- Badges de status devem manter texto em uma linha.
- Layout mobile e desktop devem ser equivalentes em conteúdo, mas podem usar composições diferentes.

## Não regressão

Validar:

- carregamento com dados completos;
- carregamento com dados incompletos;
- ausência de quebra quando não houver data, local, profissão, relacionamento ou foto;
- navegação sticky e rolagem horizontal dos atalhos no mobile;
- slide de fotos com uma foto por vez no mobile;
- cards responsivos sem overflow horizontal;
- seletor de conexão entre pessoas sem SelectItem vazio;
- fallback da RPC de badges sem impedir a página;
- descoberta sem erro quando nenhuma pessoa estiver selecionada;
- primeira geração expandida inicialmente e apenas uma geração aberta por vez;
- regras de bodas listadas neste documento;
- ranking de profissões sem corte visual nos círculos;
- IA com placeholder e limite visual de sugestões no mobile;
- quiz com homônimos desambiguados, alternativas variadas, feedback animado na área das opções e resultado final consolidado;
- quiz com seis alternativas quando houver dados suficientes e estado vazio citando seis familiares;
- mural publicando com usuário logado, limite de 200 caracteres, scroll vertical e exclusão restrita ao autor;
- rota com textos acentuados em UTF-8 válido e ilustração `mapa.png` no tamanho desktop documentado;
- comparação de interesses com pluralização correta de `ponto/pontos` e badges do questionário quando disponíveis;
- consistência com favoritos, pessoa pública e arquivos históricos quando houver ligação.

## Regra de manutenção

Não criar documentos paralelos para estatísticas familiares. Novos blocos de curiosidade devem ser documentados aqui e refletidos em `QA_MANUAL.md` quando exigirem teste manual específico.
