# Curiosidades

## Objetivo

A pagina /curiosidades transforma o antigo modal de Curiosidades em uma experiencia completa para explorar dados, historias, relacoes, datas e padroes da arvore familiar.

## Rota

- /curiosidades
- Rota protegida por MemberRoute.
- Em sessao anonima, deve redirecionar para /entrar.

## Header

A pagina usa MemberPageHeader.

Comportamento esperado:

- Exibir Arvore Familiar como primeiro botao.
- Ocultar o botao Curiosidades, porque o usuario ja esta na pagina.
- Manter os demais atalhos globais conforme padrao do projeto.

## Arquivos principais

- src/app/pages/Curiosidades.tsx
- src/app/pages/curiosidades/CuriosidadesHero.tsx
- src/app/pages/curiosidades/CuriosidadesSectionNav.tsx
- src/app/pages/curiosidades/CuriosidadesStats.tsx
- src/app/pages/curiosidades/CuriosidadesToday.tsx
- src/app/pages/curiosidades/CuriosidadesRankings.tsx
- src/app/pages/curiosidades/CuriosidadesGenerations.tsx
- src/app/pages/curiosidades/CuriosidadesCouples.tsx
- src/app/pages/curiosidades/CuriosidadesDiscoverySection.tsx
- src/app/pages/curiosidades/CuriosidadesAiSection.tsx
- src/app/pages/curiosidades/CuriosidadesConnectionSection.tsx
- src/app/pages/curiosidades/CuriosidadesQuizSection.tsx
- src/app/pages/curiosidades/CuriosidadesRouteSection.tsx
- src/app/pages/curiosidades/CuriosidadesInterestsSection.tsx
- src/app/pages/curiosidades/CuriosidadesMemoryWall.tsx
- src/app/pages/curiosidades/CuriosidadesAstrology.tsx
- src/app/pages/curiosidades/curiosidadesUtils.ts

## Modulos implementados

### Hero

Apresentacao editorial da pagina com chamada para exploracao de historias, padroes, conexoes, lugares, datas e descobertas familiares.

### Navegacao interna

Componente CuriosidadesSectionNav com atalhos por ancora para as principais areas da pagina.

### Numeros da familia

Big numbers baseados em dados reais:

- pessoas cadastradas
- pessoas vivas
- memorias preservadas
- pets
- datas de casamento

### Hoje na familia

Cards automaticos para acontecimentos da data atual:

- aniversarios
- memorias e falecimentos
- aniversarios de casamento

### Voce Sabia?

Rankings e curiosidades automaticas:

- nome mais repetido
- mes com mais aniversarios
- profissao mais repetida
- cidade de nascimento mais comum

### Geracoes da familia

Classificacao por geracao social a partir do ano de nascimento:

- Baby Boomer: 1946-1964
- Geracao X: 1965-1980
- Millennial / Y: 1981-1996
- Geracao Z: 1997-2012
- Geracao Alpha: 2013-2024
- Geracao Beta: 2025-2039

### Bodas e vinculos

Lista casais com data de casamento cadastrada e identifica marcos:

- Bodas de Papel
- Bodas de Prata
- Bodas de Ouro
- Bodas de Diamante
- Bodas de Platina
- Bodas de Jequitiba

### Descubra mais sobre

Reaproveita o fluxo do modal para selecionar uma pessoa e topicos:

- Dados e Contato
- Biografia
- Curiosidades
- Fatos Historicos do Dia de Nascimento
- O que diz a Astrologia
- Arvore Genealogica

### Pergunte a IA

Reaproveita AiQuestionPanel e monta contexto familiar estruturado com buildAiTreeContext.

### Conexoes familiares

Reaproveita ConnectionDiscoveryPanel e usa calculo de grau de parentesco para descobrir o caminho familiar entre duas pessoas.

### Teste seus conhecimentos

Quiz automatico com perguntas baseadas em dados cadastrados.

### Rota da familia

Modulo textual baseado em cidades de residencia cadastradas.

Limitacao atual:

- ainda nao calcula distancia real em quilometros
- a rota e textual
- depende de coordenadas ou integracao de mapas para calculo geografico confiavel

### Comparar interesses

Compara duas pessoas por campos disponiveis:

- interesses
- hobbies
- preferencias
- time
- profissao
- cidade atual
- cidade de nascimento

### Mural da familia

Mural local para responder: Qual sua lembranca favorita da familia?

Limitacao atual:

- as respostas ficam apenas na sessao local
- ainda nao ha persistencia em banco
- pode evoluir para integracao com forum ou acervo de memorias

### Astrologia da familia

Cruzamento recreativo de signos com base na data de nascimento.

Regra de conteudo:

- sempre apresentar como entretenimento
- nao tratar como analise deterministica

## Limitacoes conhecidas

- Mural ainda nao persiste dados.
- Rota da familia ainda nao calcula quilometros.
- Comparacao de interesses depende de campos existentes e bem preenchidos.
- Astrologia depende de data de nascimento completa.
- IA depende de disponibilidade do endpoint /api/ai.
- Algumas secoes ficam vazias quando os perfis tem dados incompletos.

## QA manual

Validar:

- /curiosidades carrega em sessao autenticada.
- Sessao anonima redireciona para /entrar.
- Header exibe Arvore Familiar e oculta Curiosidades.
- Atalhos internos fazem scroll ate as secoes.
- Big numbers nao quebram com dados vazios.
- Hoje na familia mostra eventos ou estado vazio.
- Rankings mostram dados reais ou fallback.
- Geracoes exibem pessoas com avatar ou foto quando disponivel.
- Bodas exibem casais ou estado vazio.
- Descoberta por pessoa permite selecionar topicos e voltar.
- IA aceita pergunta, exibe loading, resposta ou erro.
- Conexoes impedem selecao da mesma pessoa.
- Quiz permite responder e avancar.
- Rota textual exibe cidades sem inventar distancia.
- Comparacao de interesses nao quebra com campos ausentes.
- Mural informa que e local.
- Astrologia informa que e recreativa.
- Layout mobile nao causa overflow horizontal relevante.

## Validacoes tecnicas

Executar antes de commit:

npm run build
git diff --check
npm test

## Proximos incrementos

- Persistir mural em banco.
- Adicionar compartilhamento de descoberta no forum.
- Adicionar favoritar descoberta.
- Calcular distancia real da rota com coordenadas.
- Melhorar normalizacao de profissoes, cidades e interesses.
- Adicionar graficos reais para meses, geracoes e idade media ao casar.
- Adicionar testes unitarios para curiosidadesUtils.ts.
