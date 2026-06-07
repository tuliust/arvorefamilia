# Genealogia - view, layout e navegacao mobile

> Local recomendado: `docs/funcionalidades/GENEALOGIA_VIEW.md`
> Tipo: documentacao tecnica/funcional da view **Genealogia**.
> Projeto: `tuliust/arvorefamilia`
> Ultima atualizacao: 2026-06-07
> Revisao complementar: alinhamento vertical dos chips mobile, pan da arvore, icone conjugal `Blend` e anti-regressao de viewport.
> Status: comportamento mobile por geracoes consolidado; alinhamento por `Avos/Geracao 3` definido como referencia vertical; ajustes transversais devem ser validados nas tres views da arvore.

---

## 1. Objetivo

Este documento registra o comportamento consolidado da view **Genealogia**, acessada pela rota:

```txt
/genealogia
```

A view **Genealogia** e a visualizacao genealogica pessoal da arvore familiar. Ela organiza pessoas em colunas por geracao, a partir da pessoa central, e deve permitir leitura progressiva dos ancestrais, nucleo familiar e descendentes.

A partir do ciclo de ajustes de 2026-06-06, a view passou a ter experiencia mobile propria, inspirada no padrao de navegacao horizontal por etapas observado em tabelas mobile do Google Search.

Este documento consolida:

- escopo funcional da Genealogia;
- diferenca entre **Genealogia**, **Minha Arvore** e **Visao Completa**;
- layout por colunas;
- navegacao mobile por geracoes;
- foco/enquadramento da geracao ativa;
- alinhamento vertical padronizado dos chips mobile usando `Avos/Geracao 3` como referencia;
- inferencia de geracoes a partir da pessoa central;
- regras de pan, zoom, chips, swipe e `translateExtent`;
- regras transversais de titulo e menu compartilhadas com as demais views da arvore;
- riscos de regressao;
- checklist de QA.

---

## 2. Escopo da view

A view **Genealogia** mostra o escopo pessoal da pessoa central em formato de colunas por geracao.

Ela deve exibir, quando existirem dados e relacoes validas:

- tataravos;
- bisavos;
- avos;
- pais;
- pessoa central/nucleo;
- conjuges;
- descendentes.

A view nao deve ser confundida com:

| View | Rota | Papel |
|---|---|---|
| Minha Arvore | `/minha-arvore` | Visao direta individual, com grupos paternos/maternos e foco em parentes diretos. |
| Genealogia | `/genealogia` | Visao pessoal por geracoes, com colunas e foco por etapa no mobile. |
| Visao Completa | `/visao-completa` | Visao por geracoes usando a base familiar completa. |

Regras:

- este documento trata apenas de **Genealogia**;
- ajustes de **Minha Arvore** nao devem ser aplicados automaticamente aqui;
- ajustes de **Visao Completa** devem ser avaliados separadamente;
- o padrao mobile por chips foi implementado primeiro em **Genealogia**;
- aplicar o mesmo padrao em **Visao Completa** continua como etapa futura;
- ajustes transversais de header, menu, titulo, paletas e ReactFlow devem ser validados nas tres views.

---

## 3. Arquivos principais

### 3.1 Pagina e shell da arvore

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/treeViewMode.ts
```

Responsabilidades:

- derivar `treeViewMode` da rota atual;
- manter o shell unico das rotas da arvore;
- renderizar a area principal da arvore;
- repassar props e estado para `FamilyTree`;
- exibir a navegacao mobile por geracoes quando `viewMode = genealogia` e `isMobile = true`;
- preservar search params, como `?pessoa=...`, ao trocar view.

### 3.2 Navegacao mobile por geracoes

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
```

Responsabilidades:

- montar chips horizontais de geracoes disponiveis;
- exibir labels humanos;
- indicar geracao ativa;
- permitir clique direto em uma geracao;
- permitir swipe lateral na barra;
- exibir feedback quando nao houver geracoes visiveis;
- nao exibir contadores;
- ocupar a largura horizontal disponivel no mobile.

### 3.3 Componente da arvore

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidades:

- renderizar ReactFlow;
- receber `activeGenealogyGeneration`;
- calcular viewport inicial;
- focar a geracao ativa no mobile;
- calcular bounds mobile mantendo o eixo X da geracao ativa e o eixo Y da referencia `Avos/Geracao 3`;
- manter pan/zoom e permitir recuperacao da area superior por arraste;
- inferir geracoes genealogicas em memoria quando necessario;
- renderizar titulo fixo da arvore;
- controlar area visual entre titulo e ReactFlow;
- preservar exportacao, selecao de area e modal conjugal.

### 3.4 Layout por colunas

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidades:

- agrupar pessoas por geracao;
- criar colunas;
- ordenar pessoas;
- posicionar conjuges;
- criar labels de geracao;
- criar conectores ortogonais;
- criar edges conjugais com anel;
- evitar colunas vazias;
- preservar espacamento entre conjuges.

### 3.5 Escopo pessoal

```txt
src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts
```

Responsabilidade:

- restringir a Genealogia ao escopo pessoal da pessoa central.

---

## 4. Modelo de geracoes

A Genealogia usa geracoes numericas para montar colunas.

Modelo consolidado:

| Geracao | Label mobile | Uso |
|---|---|---|
| 1 | Tataravos | Primeira geracao ascendente mais distante no modelo atual. |
| 2 | Bisavos | Bisavos da pessoa central. |
| 3 | Avos | Avos da pessoa central. |
| 4 | Pais | Pais da pessoa central. |
| 5 | Nucleo | Pessoa central, conjuge e nucleo imediato conforme dados. |
| 6 | Descendentes | Filhos, netos e demais descendentes no limite atual. |

Regras:

- os chips usam labels humanos, nao `Geracao 1`, `Geracao 2` etc.;
- labels tecnicos de coluna podem continuar como `GERACAO 1`, `GERACAO 2` etc.;
- geracoes fora do intervalo esperado devem ter fallback seguro;
- colunas sem pessoas nao devem aparecer;
- nao criar colunas fixas vazias apenas para manter grade visual.

---

## 5. Inferencia de geracoes

A Genealogia pode usar `manual_generation`, mas nao deve depender exclusivamente dele quando a cadeia de filiacoes permite inferir a posicao da pessoa.

Comportamento consolidado:

- a inferencia acontece em memoria, durante a renderizacao;
- nenhum dado real do Supabase e alterado;
- a pessoa central e tratada como geracao 5 no modelo atual;
- pais sobem uma geracao;
- filhos descem uma geracao;
- conjuges permanecem na mesma geracao;
- o intervalo e limitado ao modelo de geracoes da view;
- a inferencia usa relacoes de `filiacao_sangue` e `filiacao_adotiva`;
- relacoes conjugais sao usadas para manter conjuges alinhados.

Objetivo:

- evitar que tataravos/bisavos/avos conectados por filiacoes fiquem fora da Genealogia por ausencia ou divergencia de `manual_generation`;
- evitar colunas vazias;
- manter consistencia entre desktop e mobile.

Exemplo relevante do ciclo de ajuste:

```txt
Usuario central: Tulius
Tataravos esperados: Amalia Tsangaropoulos e Dimitri Tsangaropoulos
```

Se essas pessoas estiverem conectadas a Tulius por cadeia valida de `filiacao_sangue` ou `filiacao_adotiva`, devem aparecer em **Tataravos/Geracao 1**.

Se nao aparecerem, investigar primeiro:

- cadeia de relacionamentos entre Tulius e essas pessoas;
- tipo de relacionamento usado;
- presenca das pessoas no escopo pessoal;
- filtros ativos;
- RLS/leitura dos relacionamentos.

---

## 6. Layout desktop

No desktop, a Genealogia deve:

- exibir colunas por geracao;
- usar labels de geracao;
- manter conectores ortogonais;
- manter aneis conjugais;
- permitir pan/zoom;
- nao renderizar colunas vazias;
- iniciar em enquadramento legivel;
- preservar zoom por largura;
- nao reduzir a arvore por causa da altura total.

Regras:

- labels de geracao sao permitidas;
- titulo principal nao deve ser criado no layout;
- titulo/subtitulo da arvore devem vir apenas do overlay fixo em `FamilyTree.tsx`;
- subtitulos abaixo do titulo principal podem permanecer ocultos nas views da arvore;
- o usuario deve poder navegar verticalmente quando houver muitos cards;
- colunas sem pessoas nao devem ocupar espaco.

---

## 7. Layout mobile

No mobile, a Genealogia usa um padrao proprio de navegacao por etapas.

Referencia conceitual:

```txt
Google Copa -> fases da competicao
Genealogia -> geracoes familiares
```

Equivalencia:

| Padrao de referencia | Genealogia mobile |
|---|---|
| Fases | Geracoes |
| Tabela compacta | Arvore focada por coluna |
| Aba ativa | Geracao ativa |
| Swipe horizontal | Swipe entre geracoes |
| Selecao direta | Chips superiores |

### 7.1 Barra de chips

A barra superior deve:

- aparecer somente em `/genealogia` no mobile;
- ocupar a largura horizontal disponivel;
- ficar acima da area da arvore;
- nao competir com botoes de zoom;
- mostrar apenas geracoes com pessoas visiveis;
- nao exibir contagem numerica;
- indicar claramente o chip ativo;
- manter `aria-label` e foco acessivel;
- permitir rolagem horizontal se os chips nao couberem.

Labels atuais:

```txt
Tataravos
Bisavos
Avos
Pais
Nucleo
Descendentes
```

### 7.2 Clique e swipe

Comportamento:

- clique no chip foca a geracao correspondente;
- swipe para esquerda avanca para a proxima geracao disponivel;
- swipe para direita volta para a geracao anterior;
- o gesto de swipe fica restrito a barra de chips;
- o pan/zoom da arvore nao deve ser bloqueado pelo swipe da barra.

### 7.3 Foco, nao filtro

Decisao consolidada:

```txt
Os chips focam/enquadram a geracao ativa, mas nao removem as demais colunas da arvore.
```

Motivo:

- o usuario pode reduzir zoom e ver a arvore completa;
- ReactFlow precisa manter os nodes renderizados para bounds, pan e contexto visual;
- a Genealogia continua sendo uma arvore navegavel, nao uma lista filtrada.

Portanto:

- a geracao ativa deve ser centralizada/enquadrada;
- as demais geracoes devem permanecer no canvas;
- nenhuma coluna com pessoas deve ser removida so porque nao esta ativa.

### 7.4 Estado inicial mobile

Ao carregar `/genealogia` no mobile:

- a geracao ativa inicial deve ser a primeira geracao disponivel com cards reais;
- se houver tataravos, iniciar em **Tataravos/Geracao 1**;
- os cards da primeira geracao devem estar visiveis no topo util;
- a view nao deve iniciar em **Bisavos/Geracao 2** ou **Avos/Geracao 3** quando houver **Geracao 1** com cards.

### 7.5 Geracoes vazias

Regras:

- geracoes sem cards nao devem gerar coluna;
- geracoes sem cards nao devem gerar chip;
- se nenhuma geracao estiver disponivel, exibir feedback compacto;
- feedbacks possiveis: `Sem geracoes definidas` ou `Sem pessoas visiveis`.

---

### 7.6 Alinhamento vertical dos chips por geracao

Comportamento consolidado no mobile:

```txt
O chip ativo muda o enquadramento horizontal da arvore, mas nao deve mudar a regua vertical dos cabecalhos/cards.
```

Referencia visual:

```txt
Avos / Geracao 3
```

Regra tecnica:

- `targetBounds.x` deve continuar vindo da geracao clicada;
- `y` deve usar `referenceBounds.y`, com referencia em `Avos/Geracao 3`;
- `height` deve usar a altura de referencia, nao a altura real de cada geracao;
- isso evita que **Tataravos**, **Bisavos**, **Pais**, **Nucleo** e **Descendentes** abram mais abaixo ou mais acima que o padrao visual.

Exemplo esperado em `FamilyTree.tsx`:

```ts
return {
  x: targetBounds.x,
  y: referenceBounds.y,
  width: targetBounds.width,
  height: Math.max(1, referenceBounds.height),
};
```

Nao fazer:

- usar `targetBounds.y` para mobile quando o objetivo for padronizar a altura dos chips;
- corrigir a diferenca usando `translate`, `transform`, `top` negativo ou deslocamento em `.react-flow__viewport`;
- transformar chip em filtro destrutivo.

Validador visual:

```txt
Ao alternar Tataravos, Bisavos, Avos, Pais, Nucleo e Descendentes,
os labels GERACAO X devem permanecer na mesma altura vertical base.
```

---

## 8. Titulo fixo e espacamento da arvore

A Genealogia compartilha com `/minha-arvore` e `/visao-completa` o titulo fixo renderizado por `FamilyTree.tsx`.

Titulo esperado:

```txt
Familia de {primeiro nome}
```

Regras:

- o titulo principal nao deve ser criado em `genealogyColumnsLayout.ts`;
- labels `GERACAO X` podem continuar no layout;
- subtitulo abaixo do titulo principal pode permanecer oculto/removido;
- deve haver pequeno padding superior acima do titulo;
- o espaco entre titulo e cards deve ser reduzido sem cortar cards superiores;
- ajuste de espacamento deve acontecer por constantes/caculo em `FamilyTree.tsx`;
- nao usar `translate`, `transform`, `top` negativo ou manipulacao de `.react-flow__viewport`;
- `family-tree-visual-polish.css` deve ser polimento visual, nao reposicionamento estrutural do ReactFlow.

Constantes relevantes a revisar em `FamilyTree.tsx`:

```txt
TREE_TITLE_TOP
TREE_TITLE_HEIGHT
TREE_DESKTOP_VISUAL_TOP_INSET
TREE_DESKTOP_VISUAL_BOTTOM_INSET
TREE_VIEWPORT_PADDING_X
TREE_VIEWPORT_PADDING_Y
getNormalizedTreeViewport
```

Status:

```txt
subtitulos ocultos/removidos -> consolidado
padding superior do titulo -> pendente de validacao visual
espaco titulo-cards -> pendente de ajuste fino
uso de translate em .react-flow__viewport -> proibido para esta correcao
```

---

## 9. Menu do usuario no header da arvore

As rotas da arvore compartilham `HomeHeader`:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Comportamento esperado:

- o botao do usuario no header da arvore permanece compacto;
- o conteudo aberto deve ser o painel compartilhado de `UserProfileMenu`;
- o antigo `UserMenu` local nao deve voltar;
- o cabecalho do painel com avatar, nome e e-mail deve navegar para `/minha-arvore/editar`;
- o botao `X` deve apenas fechar;
- o item **Editar notificacoes** nao deve aparecer;
- **Painel Admin** continua condicional para administradores.

Arquivos provaveis em caso de divergencia:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/Home.tsx
```

Pendente de validacao visual:

```txt
confirmar se /genealogia abre o mesmo painel de usuario que /calendario-familiar, /forum, /notificacoes e /meus-favoritos
```

---

## 10. Pan e zoom

### 10.1 Mobile

Na Genealogia mobile:

- pan horizontal e vertical devem funcionar;
- o usuario deve conseguir arrastar para baixo/cima e recuperar cabecalhos/camadas superiores depois de mover a arvore;
- quando o `translateExtent` impedir a recuperacao dos cabecalhos, a solucao esperada e liberar o extent apenas para `isMobile && isGenealogyLayout`;
- o usuario deve conseguir reduzir/ampliar por gesto conforme ReactFlow permitir;
- botoes `+` e `-` devem ficar ocultos na Genealogia mobile;
- a ausencia dos botoes nao deve remover capacidade de navegacao por gesto;
- a barra de chips nao deve bloquear pan na area da arvore.

Regra tecnica de pan:

```ts
const activeTreeTranslateExtent = useMemo<CoordinateExtent | undefined>(() => {
  if (isMobile && isGenealogyLayout) return undefined;
  if (!translateBounds) return undefined;

  return getDirectFamilyTranslateExtent(...);
}, [translateBounds, isGenealogyLayout, isMobile]);
```

Objetivo:

- manter pan controlado nas demais views;
- liberar o pan vertical/horizontal na Genealogia mobile quando necessario para o usuario recuperar os cabecalhos;
- nao alterar dados, filtros ou layout logico.

### 10.2 Desktop

No desktop:

- botoes de zoom podem continuar visiveis;
- pan/arraste deve funcionar;
- zoom inicial deve usar largura como referencia;
- altura total nao deve diminuir excessivamente os cards;
- labels e elementos auxiliares nao devem comandar o zoom visual.

---

## 11. Botao conjugal e espacamento

A Genealogia exibe um botao conjugal clicavel entre conjuges. O padrao visual consolidado no ciclo atual usa o icone `Blend` de `lucide-react`, em estilo cinza/neutro, no lugar de emoji ou SVG customizado de aliancas.

Arquivos relacionados:

```txt
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/MarriageNode.tsx
```

Regras:

- o botao deve permanecer clicavel;
- clique deve abrir modal conjugal;
- area ampliada do botao nao pode bloquear clique nos cards;
- conjuges devem ter espacamento vertical suficiente para evitar sobreposicao;
- ajustes de espacamento devem preservar conectores familiares;
- Genealogia deve manter a variante visual padrao, salvo decisao explicita.

Historico recente:

- o botao conjugal foi ampliado para `60px x 60px` no ciclo de paletas visuais;
- depois, a Genealogia recebeu aumento de espacamento entre conjuges para reduzir sobreposicao;
- o conteudo visual foi padronizado como `Blend` de `lucide-react`;
- a cor final solicitada para as tres views e cinza/neutra;
- ajustes de visibilidade especificos da `/minha-arvore` nao devem degradar a Genealogia.

---

## 12. Paletas visuais

A Genealogia deve respeitar as paletas visuais globais da arvore.

Paletas atuais:

```txt
white
orange
brown
```

Regras:

- a troca de paleta nao altera view, filtros ou dados;
- a troca de paleta nao deve afetar inferencia de geracoes;
- a troca de paleta nao deve alterar posicionamento ou conectores;
- os tokens devem vir de `treeColorPalettes.ts`, `directFamilyColors.ts`, `visualTokens.ts` e componentes relacionados;
- a paleta `white` deve manter fundo da area da arvore em branco quando essa for a regra visual vigente.

Validar as tres paletas em:

```txt
/minha-arvore
/genealogia
/visao-completa
```

---

## 13. Exportacao

A frente de Genealogia mobile nao alterou diretamente a exportacao, mas a view continua integrada ao sistema de exportacao da arvore.

Regras:

- `TreeAreaSelectionOverlay` deve continuar funcionando;
- exportacao deve ignorar overlays/legenda/menus conforme `treeExport.ts`;
- a barra de chips mobile nao deve entrar indevidamente em exportacao se estiver fora da area selecionada;
- nao salvar arquivos exportados no Supabase;
- exportacao da arvore completa continua pos-MVP.

Documentacao relacionada:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 14. Acessibilidade e microcopy

### 14.1 Chips mobile

Regras:

- chips devem ter `type="button"`;
- chip ativo deve ser distinguivel visualmente;
- chip ativo deve ser indicado por `aria-pressed` ou atributo equivalente quando aplicavel;
- `aria-label` deve explicar a geracao;
- labels devem ser curtos.

Microcopy consolidada:

```txt
Tataravos
Bisavos
Avos
Pais
Nucleo
Descendentes
```

### 14.2 Feedback vazio

Mensagens aceitas:

```txt
Sem geracoes definidas
Sem pessoas visiveis
```

Nao usar mensagens tecnicas como:

```txt
manual_generation vazio
nodes ausentes
filtered graph empty
```

---

## 15. Regras de anti-regressao

Nao fazer:

- transformar chip em filtro que remove colunas com pessoas;
- voltar a criar colunas fixas vazias `1..6`;
- usar `Avos/Geracao 3` como fallback de foco inicial quando existir geracao anterior com cards;
- esconder tataravos conectados por filiacoes validas;
- depender exclusivamente de `manual_generation` quando a relacao permite inferencia;
- criar migration para resolver posicionamento visual;
- alterar RLS, permissions ou Supabase nesta frente;
- colocar titulo/subtitulo principal dentro de `genealogyColumnsLayout.ts`;
- usar altura total para reduzir zoom inicial da Genealogia;
- usar `translate` em `.react-flow__viewport` para aproximar titulo e cards;
- usar `targetBounds.y` para variar a altura vertical dos chips mobile quando a referencia correta for `Avos/Geracao 3`;
- recolocar botoes `+` e `-` sobre a barra mobile de chips;
- impedir pan vertical no mobile;
- permitir que o anel conjugal sobreponha cards;
- aplicar automaticamente em `/visao-completa` o modelo mobile da Genealogia sem estudo separado.

---

## 16. Troubleshooting rapido

### 16.1 Genealogia inicia na geracao errada

Sintoma:

```txt
Mobile abre em Geracao 2 ou Avos mesmo havendo Geracao 1 com cards.
```

Verificar:

- `activeGenealogyGeneration` em `HomeTreeSection.tsx`;
- primeira geracao disponivel em `FamilyTree.tsx`;
- colunas vazias em `genealogyColumnsLayout.ts`;
- se a geracao 1 tem cards reais ou apenas label;
- se os tataravos estao no escopo pessoal.

### 16.2 Geracao 1 aparece vazia

Sintoma:

```txt
Label GERACAO 1 aparece, mas sem cards.
```

Verificar:

- se `genealogyColumnsLayout.ts` voltou a criar chaves fixas vazias;
- se `groupPeopleByGeneration` esta retornando grupo vazio;
- se filtros removeram pessoas da coluna;
- se a inferencia em memoria foi removida.

### 16.3 Tataravos nao aparecem

Verificar:

- se existem pessoas cadastradas;
- se estao conectadas por `filiacao_sangue` ou `filiacao_adotiva` ate a pessoa central;
- se `filterGraphToPersonalScope` manteve essas pessoas;
- se a leitura de relacionamentos trouxe toda a cadeia;
- se ha filtro de status de vida ocultando pessoas;
- se RLS permite leitura dos relacionamentos necessarios.

### 16.4 Chips nao mudam a arvore

Verificar:

- `GenealogyMobileStageTabs.tsx` chamando `onActiveGenerationChange`;
- `HomeTreeSection.tsx` repassando `activeGenealogyGeneration`;
- `FamilyTree.tsx` usando `activeGenealogyGeneration` no viewport;
- diferenca entre foco e filtro: os chips nao devem remover outras colunas.

### 16.5 Nao consigo arrastar verticalmente

Verificar:

- `translateExtent` e bounds de pan;
- se `activeTreeTranslateExtent` esta limitando a Genealogia mobile;
- bloqueio temporario de pan por selecao de area;
- handlers de toque da barra de chips;
- CSS que possa estar impedindo gestos;
- se o pointer event esta preso em overlay.

Correcao esperada quando o problema for restrito a `/genealogia` mobile:

```ts
if (isMobile && isGenealogyLayout) return undefined;
```

A correcao deve liberar o pan da Genealogia mobile sem alterar pan/zoom das demais views.

### 16.6 Chips abrem em alturas diferentes

Sintoma:

```txt
Tataravos, Bisavos, Pais, Nucleo ou Descendentes abrem abaixo/acima do padrao visual de Avos.
```

Causa provavel:

```txt
mobileGenealogyInitialColumnBounds usando y: targetBounds.y.
```

Correcao esperada:

```ts
return {
  x: targetBounds.x,
  y: referenceBounds.y,
  width: targetBounds.width,
  height: Math.max(1, referenceBounds.height),
};
```

Regra:

- `x` muda com a geracao clicada;
- `y` permanece fixo pela referencia `Avos/Geracao 3`;
- nao usar `translate` ou deslocamento de `.react-flow__viewport`.

### 16.7 Botao conjugal com visual diferente entre views

Verificar:

- `MarriageNode.tsx` em `/minha-arvore`;
- `GenealogySpouseEdge.tsx` em `/genealogia` e `/visao-completa`;
- se ambos usam `Blend` de `lucide-react`;
- se a cor do botao e do icone esta cinza/neutra;
- se `title` e `aria-label` continuam como **Ver vinculo do casal**.

### 16.8 Anel/botao conjugal sobrepoe os cards

Verificar:

- espacamento vertical entre conjuges em `genealogyColumnsLayout.ts`;
- tamanho do anel em `GenealogySpouseEdge.tsx`/`MarriageNode.tsx`;
- handles usados pela edge;
- z-index/click area do anel.

### 16.9 Titulo colado no topo ou com grande vazio abaixo

Verificar:

- `TREE_TITLE_TOP`;
- `TREE_TITLE_HEIGHT`;
- `TREE_DESKTOP_VISUAL_TOP_INSET`;
- `TREE_DESKTOP_VISUAL_BOTTOM_INSET`;
- regras residuais em `family-tree-visual-polish.css`;
- qualquer uso de `translate` em `.react-flow__viewport`.

Correcao esperada:

- ajustar constantes de `FamilyTree.tsx`;
- remover overrides conflitantes;
- validar se cards superiores nao foram cortados.

### 16.10 Menu da Genealogia diferente do menu das paginas internas

Verificar:

- `HomeHeader.tsx`;
- `UserProfileMenu.tsx`;
- `MemberPageHeader.tsx`;
- variante `home-header`;
- se algum dropdown local antigo foi recriado;
- z-index e portal do menu.

---

## 17. QA obrigatorio

### 17.1 Larguras

Testar:

```txt
320px
375px
390px
430px
768px
desktop
```

### 17.2 Roteiro mobile

Em `/genealogia`:

- carregar a pagina limpa;
- confirmar que o primeiro chip disponivel esta ativo;
- se houver tataravos, confirmar que **Tataravos** abre primeiro;
- confirmar que os cards da primeira coluna aparecem no topo;
- tocar em cada chip;
- confirmar que Tataravos, Bisavos, Avos, Pais, Nucleo e Descendentes mantem a mesma regua vertical dos cabecalhos;
- confirmar que Avos/Geracao 3 continua como referencia visual de altura;
- testar swipe esquerda/direita;
- reduzir zoom por gesto;
- confirmar que demais colunas continuam renderizadas;
- arrastar para baixo/cima;
- confirmar que e possivel recuperar os cabecalhos apos pan manual;
- confirmar que botoes `+` e `-` nao aparecem;
- confirmar que labels `GERACAO X` nao ficam cobertas pelos chips;
- abrir menu do usuario;
- testar paletas `white`, `orange` e `brown`.

### 17.3 Roteiro desktop

Em `/genealogia`:

- confirmar que nao ha colunas vazias;
- confirmar que tataravos aparecem quando conectados;
- confirmar pan/zoom;
- confirmar anel conjugal clicavel;
- confirmar modal conjugal;
- confirmar filtros de status de vida;
- confirmar paletas;
- confirmar titulo com respiro superior e sem vazio excessivo abaixo;
- confirmar exportacao de area se a alteracao afetou ReactFlow/overlay.

### 17.4 Regressao em outras views

Validar:

```txt
/minha-arvore
/visao-completa
```

Checar:

- layout nao foi alterado indevidamente;
- paletas continuam funcionando;
- painel lateral continua operavel;
- zoom/pan continuam funcionando;
- exportacao continua disponivel;
- legenda nao duplicou;
- menu do usuario abre corretamente;
- titulo e cards nao sao cortados.

---

## 18. Commits de referencia

Ciclo da Genealogia mobile por geracoes:

```txt
dd434014 fix: refine genealogy mobile tree header
60a6cd0 feat: add genealogy mobile stage tabs
8d369f8 feat: show genealogy mobile stage tabs
096d005 feat: control genealogy mobile stage tabs
777d8fd feat: filter genealogy mobile tree by active stage
50609f0 feat: reset genealogy mobile viewport by stage
bd0d24f feat: refine genealogy mobile stage labels
ca593a6 feat: add swipe navigation to genealogy mobile stages
05742bb feat: show empty genealogy mobile stage feedback
af17ffb fix: improve genealogy mobile stage focus
f23e353 fix: refine genealogy mobile stage navigation
9c13e22 fix: focus first genealogy mobile stage on load
189303a fix: start genealogy mobile on first rendered column
b668a59 fix: infer genealogy generations from central person
79f44f4 fix: keep genealogy mobile generations vertically aligned
```

Observacao:

- o ciclo teve mudanca conceitual importante: a primeira implementacao filtrava a arvore pela geracao ativa;
- a decisao final foi usar chips como **foco/enquadramento**, nao filtro;
- a correcao final tambem passou a afetar desktop ao remover colunas vazias e inferir geracoes pela pessoa central.

---

## 19. Relacao com outros documentos

Consultar tambem:

```txt
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Regras de manutencao documental:

- mudancas funcionais consolidadas devem refletir em `GUIA_IMPLEMENTACOES.md`;
- mudancas de UX/layout devem refletir em `GUIA_UX_LAYOUT.md`;
- novos componentes ou props devem refletir em `GUIA_COMPONENTES.md`;
- sintomas e correcoes recorrentes devem refletir em `GUIA_CORRECAO_ERROS.md`;
- pendencias e etapas futuras devem refletir em `PLANO_PROXIMOS_PASSOS.md`;
- este documento deve concentrar o comportamento especifico da view **Genealogia**.

---

## 20. Pendencias futuras

Fora do escopo desta frente:

- aplicar padrao similar em **Visao Completa** somente apos estudo proprio;
- avaliar refinamentos finos de zoom para arvores muito grandes;
- revisar labels acentuados se o projeto migrar documentos/codigo para acentuacao plena sem risco de encoding;
- avaliar exportacao completa da arvore;
- integrar grau de parentesco visual diretamente na Genealogia;
- criar controles avancados por ramo familiar;
- finalizar ajuste transversal do titulo das tres views sem cortar cards;
- confirmar comportamento unico do menu do usuario nas views da arvore e nas paginas internas.
