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
- menu do avatar/header;
- documentacao historica e funcional relacionada.

## 2. Commits de referencia do ciclo

Commits citados ou produzidos durante o ciclo:

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
d1916a3 fix: ajustar resumo e botoes da edicao da arvore
8c98de0 fix: ajustar zoom mobile das views genealogicas
abd6310 docs: registrar ajustes mobile recentes
beb5438 fix: ajustar calendario mobile e filtros
8a14c9f fix: ajustar menu do avatar
1a6b03b fix: compactar filtros do calendario mobile
d7a88d2 fix: subir card e alinhar seta mobile da arvore
```

Estado final registrado localmente apos o ciclo:

```txt
d7a88d2 (HEAD -> main, origin/main, origin/HEAD) fix: subir card e alinhar seta mobile da arvore
1a6b03b fix: compactar filtros do calendario mobile
8a14c9f fix: ajustar menu do avatar
beb5438 fix: ajustar calendario mobile e filtros
abd6310 docs: registrar ajustes mobile recentes
8c98de0 fix: ajustar zoom mobile das views genealogicas
d1916a3 fix: ajustar resumo e botoes da edicao da arvore
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
- reposicionar card central para ficar mais alto na tela;
- apos nova rodada, subir novamente o enquadramento mobile da `/minha-arvore`.

Valores usados durante o ciclo:

```txt
centralWidth = 320
centralHeight = 350
centralNameFontSize = 16 / 20
centralDetailFontSize = 12 / 14
mobileAvatarScale = 0.85
TREE_MOBILE_VIEWPORT_TOP_SAFE_AREA = 12 / 24 / 36 / 60 / 96 / 100
centralY = CENTRAL_Y - 120
centralY = CENTRAL_Y - 220
centralY = CENTRAL_Y - 400
centralY = CENTRAL_Y - 520
centralY = CENTRAL_Y - 760
```

Estado final do ciclo:

- a view mobile da `/minha-arvore` passou a usar alinhamento vertical `top` no calculo de viewport;
- `TREE_MOBILE_VIEWPORT_TOP_SAFE_AREA` foi ajustado para favorecer o card principal mais alto;
- o card central deve ser validado visualmente em 320px, 375px, 390px e 430px.

Commit de referencia:

```txt
d7a88d2 fix: subir card e alinhar seta mobile da arvore
```

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

Estado final do ciclo:

- a seta superior deixou de depender do posicionamento fixo antigo via CSS;
- a seta superior foi reposicionada junto ao grupo visual dos botoes de zoom `+` e `-`;
- o alinhamento deve ser padronizado nas tres views da Home: `/minha-arvore`, `/genealogia` e `/visao-completa`.

Commits de referencia:

```txt
c269539 fix: ajustar seta mobile e dashboard admin
d7a88d2 fix: subir card e alinhar seta mobile da arvore
```

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

Ajustes implementados no ciclo:

- no mobile, iniciar a view na primeira coluna que contem cards de pessoas, em vez de enquadrar toda a arvore;
- ampliar os cards/zoom inicial no mobile;
- reduzir padding mobile do viewport para deixar a coluna inicial mais legivel;
- igualar o comportamento mobile de `/visao-completa` ao de `/genealogia`.

Commits de referencia:

```txt
455fdf2 fix: iniciar genealogia mobile na primeira coluna com pessoas
8c98de0 fix: ajustar zoom mobile das views genealogicas
```

Valores finais de referencia no ciclo:

```txt
GENEALOGY_MOBILE_MAX_ZOOM = 1.08
TREE_GENEALOGY_MOBILE_VIEWPORT_TOP_SAFE_AREA = 96
TREE_MOBILE_VIEWPORT_PADDING_X = 12
TREE_MOBILE_VIEWPORT_PADDING_Y = 10
fitMode mobile = contain
verticalAlign mobile = top
```

QA visual necessario:

- `/genealogia`: confirmar uma coluna visivel no carregamento inicial;
- `/genealogia`: confirmar cards maiores e legiveis;
- `/visao-completa`: confirmar mesmo padrao de zoom e visualizacao de `/genealogia`;
- validar que titulos/legendas da geracao nao ficam colados no topo nem escondidos pelo header.

## 6. `/calendario-familiar`

Ajustes definidos/aplicados no ciclo:

- incluir card compacto de legendas no mobile abaixo de **Mes exibido**;
- categorias da legenda: aniversario, casamento, falecimento, outros, reuniao/confraternizacao;
- alterar cor de **Falecimento** para roxo;
- alterar destaque do dia atual de azul para cinza;
- trocar label **Confraternizacao** por **Reuniao**;
- clarear o cinza do dia atual;
- no mobile, trocar clique da bolinha colorida do calendario por rolagem/ancora para cards de resumo;
- fazer a legenda mobile funcionar como filtro de categorias;
- compactar filtros do calendario mobile para melhorar encaixe em telas estreitas.

Commits de referencia:

```txt
beb5438 fix: ajustar calendario mobile e filtros
1a6b03b fix: compactar filtros do calendario mobile
```

Comportamento final esperado:

- tocar em legenda/filtro mobile alterna a categoria via `activeCategories`/`toggleCategory`;
- filtros usam estado visual ativo/inativo com `aria-pressed`;
- tocar na bolinha de um dia com aniversario leva ao card **Aniversariantes**;
- tocar na bolinha de um dia com falecimento/memoria leva ao card **Memoria**;
- tocar em evento sem card especifico pode levar ao card **Categorias**;
- o modal de eventos do dia deixa de ser o comportamento padrao da bolinha mobile;
- o dia atual usa cinza claro, nao cinza escuro/azul.

Documento canonico atualizado:

```txt
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

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

Ajustes aplicados no ciclo:

- cards **Pais**, **Irmaos**, **Conjuges** e **Filhos** exibidos em uma linha com quatro colunas;
- no container **Meus Dados**, botao **Alterar foto** renomeado para **Alterar**;
- botao **Remover foto** renomeado para **Remover**.

Commit de referencia:

```txt
d1916a3 fix: ajustar resumo e botoes da edicao da arvore
```

QA visual necessario:

- validar legibilidade dos quatro cards em 320px;
- confirmar que os botoes de foto continuam acionando os mesmos handlers.

## 10. Menu do avatar/header

Ajustes realizados no ciclo:

- corrigida abertura do menu do usuario no desktop;
- menu mobile passou a incluir seletor de visualizacao da arvore;
- corrigida acentuacao dos itens **Forum/Fórum**, **Calendario/Calendário** e **Notificacoes/Notificações**, conforme padrao final aplicado no codigo;
- adicionado atalho **Painel Admin**, condicionado a permissao administrativa;
- adicionado atalho **Editar notificacoes**.

Commits de referencia:

```txt
8a14c9f fix: ajustar menu do avatar
```

Ponto de atencao:

- botao **Painel Admin** deve continuar condicionado a permissao real; UI nao substitui `ProtectedRoute`, RLS ou validacao de acesso.

## 11. Pendencias atuais rastreadas

Pendencias de implementacao do ciclo: **nao ha pendencias de codigo abertas registradas neste historico para as frentes acima**.

Pendencias de QA/manual ainda recomendadas:

1. `/minha-arvore`: confirmar em mobile que o card principal subiu o suficiente e nao ficou escondido pelo header/controles.
2. `/minha-arvore`: confirmar que a seta superior esta alinhada visualmente aos botoes de zoom `+`/`-`.
3. `/genealogia`: confirmar cards maiores e uma coluna visivel no carregamento inicial.
4. `/visao-completa`: confirmar mesmo comportamento mobile de `/genealogia`.
5. `/calendario-familiar`: validar filtro por legenda mobile em todas as categorias.
6. `/calendario-familiar`: validar ancoragem da bolinha para **Aniversariantes**, **Memoria** ou **Categorias**, conforme evento do dia.
7. `/minha-arvore/editar`: validar quatro cards em 320px e 375px.
8. Menu do avatar: validar acentos, atalhos e exibicao condicional do **Painel Admin**.

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
- bolinhas do calendario mobile ancoram para cards de resumo;
- dia atual do calendario permanece em cinza claro;
- menu do avatar preserva rotas e permissao de admin;
- build, testes e `git diff --check` passam antes do commit.

## 13. Reflexo em documentos canonicos

Atualizacoes realizadas neste ciclo documental:

- `docs/historico/AJUSTES_MOBILE_2026-06-02.md`: consolidado como registro historico do ciclo.
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`: atualizado para registrar comportamento especifico do calendario mobile.

Documentos revisados sem alteracao nesta rodada:

- `docs/GUIA_UX_LAYOUT.md`: regras gerais de responsividade, header, containers e mobile-first ja cobrem o padrao; evitar duplicar detalhes especificos do calendario.
- `docs/PLANO_PROXIMOS_PASSOS.md`: nao ha nova pendencia de implementacao; manter apenas QA manual no historico deste ciclo.

Se algum comportamento visual da arvore mobile for confirmado como regra permanente apos QA final, avaliar atualizacao pontual em:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
```
