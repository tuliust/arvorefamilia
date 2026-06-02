# Ajustes mobile recentes - ciclo 2026-06-02

> Documento historico de rastreabilidade. Nao substitui os guias canonicos em `docs/GUIA_UX_LAYOUT.md`, `docs/GUIA_IMPLEMENTACOES.md`, `docs/PLANO_PROXIMOS_PASSOS.md` e `docs/funcionalidades/`.

## 1. Escopo do ciclo

Este documento consolida os ajustes discutidos e/ou aplicados no ciclo recente de refinamento mobile do projeto `tuliust/arvorefamilia`.

Frentes envolvidas:

- `/minha-arvore`;
- `/genealogia`;
- `/visao-completa`;
- `/forum`;
- `/calendario-familiar`;
- `/meus-favoritos`;
- `/admin`;
- `/minha-arvore/editar`;
- menu do avatar/header.

## 2. Commits de referencia citados no ciclo

```txt
66e1100 feat: adicionar seletor de visualizacao no menu mobile
4aade3f fix: permitir abertura do menu de usuario no desktop
52d84d7 fix: limitar card principal visivel no mobile
0cbf7cc fix: refinar arvore mobile para foco no card central
f552773 fix: reduzir card central mobile da arvore
bf228d5 fix: aplicar dimensoes ao painel central mobile real
c3f535c fix: aplicar layout mobile real na minha arvore
9aa8087 fix: ajustar navegacao mobile da minha arvore
455fdf2 fix: iniciar genealogia mobile na primeira coluna com pessoas
5e82e04 fix: refinar ultimos ajustes mobile da arvore
c269539 fix: ajustar seta mobile e dashboard admin
```

## 3. `/forum`

Ajustes definidos para a versao mobile:

- reduzir categorias para quatro itens: **Duvidas**, **Memorias**, **Documentos** e **Eventos**;
- tratar **Duvidas** como equivalente funcional de **Ajuda**;
- posicionar categorias acima do card de busca, abaixo do header;
- ocultar titulo **Topicos recentes** no mobile;
- ocultar botao **Limpar filtros** no mobile;
- remover label **Categorias** no mobile;
- reduzir espacamentos e paddings dos botoes para que os quatro filtros caibam sem scroll horizontal.

## 4. `/minha-arvore`

### 4.1 Header mobile

Ajustes definidos/aplicados:

- usar o mesmo avatar/menu mobile das demais paginas;
- transformar o header inteiro em campo de digitacao ao acionar busca;
- remover subtitulo do header no mobile;
- usar titulo curto **Barros Souza** no mobile;
- manter seletor de visualizacao no menu mobile: **Minha Arvore**, **Genealogia**, **Visao Completa**.

### 4.2 Card principal mobile

Ajustes iterativos realizados:

- reduzir largura e altura do card central;
- ajustar fonte do nome e dos detalhes;
- ajustar escala da foto/avatar;
- deslocar pais para fora da area visivel inicial;
- reposicionar card central para ficar mais alto na tela.

Valores usados durante o ciclo:

```txt
centralWidth = 320
centralHeight = 350
centralNameFontSize = 16 / 20
centralDetailFontSize = 12 / 14
mobileAvatarScale = 0.85
TREE_MOBILE_VIEWPORT_TOP_SAFE_AREA = 12 / 24 / 36 / 60 / 100
centralY = CENTRAL_Y - 120
centralY = CENTRAL_Y - 220
centralY = CENTRAL_Y - 400
centralY = CENTRAL_Y - 520
centralY = CENTRAL_Y - 760
```

Estado confirmado no ciclo:

```ts
const centralY = isMobile ? CENTRAL_Y - 760 : CENTRAL_Y;
```

Pendente visual reportado apos o ultimo deploy:

- subir ainda mais o card central, se necessario;
- manter o card central visualmente centralizado entre os botoes laterais de seta.

### 4.3 Setas de navegacao mobile

Comportamento definido:

```txt
seta para cima     -> pai e mae
seta para esquerda -> ramo paterno
seta para direita  -> ramo materno
seta para baixo    -> irmaos, conjuge, sobrinhos, pets, filhos e netos
```

Regra adicional:

- se o usuario estiver no ramo paterno e tocar seta direita, voltar ao card central;
- se o usuario estiver no ramo materno e tocar seta esquerda, voltar ao card central.

Estado/ponto de atencao:

- o botao de seta superior existe no JSX e recebeu reforco de CSS;
- ainda foi solicitado alinhar a seta superior exatamente na mesma reta dos botoes `+` e `-`;
- esse alinhamento deve ser padronizado nas tres views da Home.

### 4.4 Grupos inferiores

Ajustes definidos/aplicados:

- aproximar horizontalmente grupos inferiores da area central;
- subir grupos de **Irmaos**, **Conjuge**, **Sobrinhos**, **Pets**, **Filhos** e **Netos**;
- preservar comportamento apenas mobile.

Valores usados no ciclo:

```txt
MOBILE_LOWER_LEFT_GROUP_CENTER_X = VIEW_CENTER_X - 220
MOBILE_LOWER_RIGHT_GROUP_CENTER_X = VIEW_CENTER_X + 220
MOBILE_LOWER_GROUP_Y = LOWER_GROUP_Y - 360
```

### 4.5 Conectores

Ajustes definidos:

- linhas conectoras mais claras;
- conector inferior deve partir da base real do card central;
- conector inferior deve ligar o card central aos grupos inferiores;
- evitar calculo fixo baseado apenas em `CENTRAL_Y + CENTRAL_HEIGHT` quando o card mobile tiver dimensoes diferentes.

## 5. `/genealogia` e `/visao-completa`

Ajuste implementado no ciclo:

- no mobile, iniciar a view na primeira coluna que contem cards de pessoas, em vez de enquadrar toda a arvore.

Commit de referencia:

```txt
455fdf2 fix: iniciar genealogia mobile na primeira coluna com pessoas
```

Ajustes ainda solicitados:

- `/genealogia`: ampliar mais os cards;
- `/genealogia`: deixar apenas uma coluna visivel no carregamento inicial;
- `/genealogia`: garantir que cards e cabecalho **Geracao 1** fiquem abaixo do titulo/subtitulo **Familia de Tulius**;
- `/visao-completa`: usar mesmo zoom e mesmo comportamento visual de `/genealogia`;
- `/visao-completa`: garantir que cards e cabecalho **Geracao 1** fiquem abaixo de **Linha Genealogica de Tulius**.

Valores tentados no ciclo:

```txt
GENEALOGY_MOBILE_MAX_ZOOM = 0.84
TREE_GENEALOGY_MOBILE_VIEWPORT_TOP_SAFE_AREA = 150
fitMode mobile = contain
verticalAlign mobile = top
```

## 6. `/calendario-familiar`

Ajustes definidos/aplicados no ciclo:

- incluir card compacto de legendas no mobile abaixo de **Mes exibido**;
- categorias da legenda: aniversario, casamento, falecimento, outros, reuniao/confraternizacao;
- alterar cor de **Falecimento** para roxo;
- alterar destaque do dia atual de azul para cinza;
- trocar label **Confraternizacao** por **Reuniao**.

Ajustes ainda solicitados:

- deixar o cinza do dia atual mais claro;
- clique na bolinha colorida de evento no calendario deve redirecionar/ancorar para o card **Aniversariantes** ou **Memoria**, em vez de abrir modal;
- o card de legendas deve funcionar como filtro de categorias: clicar em uma legenda oculta/exibe eventos daquela categoria.

## 7. `/meus-favoritos`

Ajuste definido:

- aumentar margem inferior no mobile para evitar que conteudo fique escondido pelo menu inferior.

Referencia de classe usada no ciclo:

```txt
pb-40 md:pb-6
```

## 8. `/admin`

Ajustes aplicados no ciclo:

- cards superiores em quatro colunas no mobile;
- cards superiores compactos;
- exibir apenas icone, numero e titulo curto no mobile;
- titulos curtos usados: **Membros**, **Relacoes**, **Pendentes**, **Memoria**;
- esconder subtitulos dos cards superiores no mobile;
- cards de **Acoes Rapidas** em duas colunas no mobile;
- esconder subtitulos das acoes rapidas no mobile;
- reduzir padding e tamanho de icones no mobile.

Commit de referencia:

```txt
c269539 fix: ajustar seta mobile e dashboard admin
```

## 9. `/minha-arvore/editar`

Ajustes solicitados e ainda pendentes de implementacao/validacao:

- exibir os cards **Pais**, **Irmaos**, **Conjuges** e **Filhos** em uma linha com quatro colunas;
- no container **Meus Dados**, renomear botao **Alterar foto** para **Alterar**;
- renomear botao **Remover foto** para **Remover**.

## 10. Menu do avatar/header

Ajustes realizados no ciclo:

- corrigida abertura do menu do usuario no desktop;
- menu mobile passou a incluir seletor de visualizacao da arvore.

Ajustes ainda solicitados:

- corrigir acentuacao dos itens:
  - **Forum** -> **Forum** com acento: **Forum/Fórum** conforme padrao final do projeto;
  - **Calendario** -> **Calendario** com acento: **Calendario/Calendário** conforme padrao final;
  - **Notificacoes** -> **Notificacoes** com acento: **Notificações**;
- adicionar botao **Painel Admin**;
- adicionar botao **Editar notificacoes**.

Observacao: manter consistencia com os textos canonicos definidos em `MemberPageHeader`/menu do usuario.

## 11. Pendencias atuais rastreadas

Pendencias de produto/UX ao final do ciclo:

1. `/minha-arvore`: subir mais o card central, se necessario.
2. `/minha-arvore`: alinhar seta superior com botoes de zoom `+`/`-` e padronizar nas tres views.
3. `/genealogia`: ampliar cards e garantir uma coluna visivel no mobile.
4. `/visao-completa`: igualar zoom e visualizacao a `/genealogia`.
5. `/calendario-familiar`: clarear cinza do dia atual.
6. `/calendario-familiar`: bolinhas do calendario devem ancorar para cards de resumo.
7. `/calendario-familiar`: legenda mobile deve funcionar como filtro.
8. `/minha-arvore/editar`: ajustar cards de vinculos e labels de botoes de foto.
9. Menu do avatar: corrigir acentos e adicionar atalhos faltantes.

## 12. QA recomendado para proxima rodada

Larguras mobile prioritarias:

```txt
320px
375px
390px
430px
```

Rotas prioritarias:

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/minha-arvore/editar
/admin
/forum
/meus-favoritos
/notificacoes
/ajustar-notificacoes
```

Checklist minimo:

- sem overflow horizontal;
- botoes de seta e zoom nao se sobrepoem;
- arvore navegavel por toque;
- uma coluna por tela em Genealogia/Visao Completa mobile;
- calendario filtra categorias sem perder contadores essenciais;
- menu do avatar preserva rotas e permissao de admin;
- build, testes e `git diff --check` passam antes do commit.
