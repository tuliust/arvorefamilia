# Genealogia - view, layout e navegacao mobile

> Local recomendado: `docs/funcionalidades/GENEALOGIA_VIEW.md`
> Tipo: documentacao tecnica/funcional da view **Genealogia**.
> Projeto: `tuliust/arvorefamilia`
> Ultima atualizacao: 2026-06-06

---

## 1. Objetivo

Este documento registra o comportamento consolidado da view **Genealogia**, acessada pela rota:

```txt
/genealogia
```

A view **Genealogia** e a visualizacao genealogica pessoal da arvore familiar. Ela organiza pessoas em colunas por geracao, a partir da pessoa central, e deve permitir leitura progressiva dos ancestrais, nucleo familiar e descendentes.

A partir do ciclo de ajustes de 2026-06-06, a view passou a ter uma experiencia mobile propria, inspirada no padrao de navegacao horizontal por etapas observado em tabelas mobile do Google Search.

Este documento consolida:

- escopo funcional da Genealogia;
- diferenca entre **Genealogia**, **Minha Arvore** e **Visao Completa**;
- layout por colunas;
- navegacao mobile por geracoes;
- foco/enquadramento da geracao ativa;
- inferencia de geracoes a partir da pessoa central;
- regras de pan, zoom, chips e swipe;
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
- aplicar o mesmo padrao em **Visao Completa** continua como etapa futura.

---

## 3. Arquivos principais

### Pagina e shell da arvore

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
- exibir a navegacao mobile por geracoes quando `viewMode = genealogia` e `isMobile = true`.

### Navegacao mobile por geracoes

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

### Componente da arvore

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidades:

- renderizar ReactFlow;
- receber `activeGenealogyGeneration`;
- calcular viewport inicial;
- focar a geracao ativa no mobile;
- manter pan/zoom;
- inferir geracoes genealogicas em memoria quando necessario;
- preservar exportacao, selecao de area e modal conjugal.

### Layout por colunas

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

### Escopo pessoal

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

### 7.5 Gerações vazias

Regras:

- geracoes sem cards nao devem gerar coluna;
- geracoes sem cards nao devem gerar chip;
- se nenhuma geracao estiver disponivel, exibir feedback compacto;
- feedbacks possiveis: `Sem geracoes definidas` ou `Sem pessoas visiveis`.

---

## 8. Pan e zoom

### 8.1 Mobile

Na Genealogia mobile:

- pan horizontal e vertical devem funcionar;
- o usuario deve conseguir arrastar para baixo/cima;
- o usuario deve conseguir reduzir/ampliar por gesto conforme ReactFlow permitir;
- botoes `+` e `-` devem ficar ocultos na Genealogia mobile;
- a ausencia dos botoes nao deve remover capacidade de navegacao por gesto;
- a barra de chips nao deve bloquear pan na area da arvore.

### 8.2 Desktop

No desktop:

- botoes de zoom podem continuar visiveis;
- pan/arraste deve funcionar;
- zoom inicial deve usar largura como referencia;
- altura total nao deve diminuir excessivamente os cards;
- labels e elementos auxiliares nao devem comandar o zoom visual.

---

## 9. Anel conjugal e espacamento

A Genealogia exibe anel/alianca entre conjuges.

Regras:

- o anel deve permanecer clicavel;
- clique deve abrir modal conjugal;
- area ampliada do anel nao pode bloquear clique nos cards;
- cônjuges devem ter espacamento vertical suficiente para evitar sobreposicao;
- ajustes de espacamento devem preservar conectores familiares.

Historico recente:

- o botao/anel conjugal foi ampliado para `60px x 60px` no ciclo de paletas visuais;
- depois, a Genealogia recebeu aumento de espacamento entre conjuges para reduzir sobreposicao.

---

## 10. Paletas visuais

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
- os tokens devem vir de `treeColorPalettes.ts`, `directFamilyColors.ts`, `visualTokens.ts` e componentes relacionados.

Validar as tres paletas em:

```txt
/minha-arvore
/genealogia
/visao-completa
```

---

## 11. Exportacao

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

## 12. Acessibilidade e microcopy

### 12.1 Chips mobile

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

### 12.2 Feedback vazio

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

## 13. Regras de anti-regressao

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
- recolocar botoes `+` e `-` sobre a barra mobile de chips;
- impedir pan vertical no mobile;
- permitir que o anel conjugal sobreponha cards.

---

## 14. Troubleshooting rapido

### 14.1 Genealogia inicia na geracao errada

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

### 14.2 Geracao 1 aparece vazia

Sintoma:

```txt
Label GERACAO 1 aparece, mas sem cards.
```

Verificar:

- se `genealogyColumnsLayout.ts` voltou a criar chaves fixas vazias;
- se `groupPeopleByGeneration` esta retornando grupo vazio;
- se filtros removeram pessoas da coluna;
- se a inferencia em memoria foi removida.

### 14.3 Tataravos nao aparecem

Verificar:

- se existem pessoas cadastradas;
- se estao conectadas por `filiacao_sangue` ou `filiacao_adotiva` ate a pessoa central;
- se `filterGraphToPersonalScope` manteve essas pessoas;
- se a leitura de relacionamentos trouxe toda a cadeia;
- se ha filtro de status de vida ocultando pessoas;
- se RLS permite leitura dos relacionamentos necessarios.

### 14.4 Chips nao mudam a arvore

Verificar:

- `GenealogyMobileStageTabs.tsx` chamando `onActiveGenerationChange`;
- `HomeTreeSection.tsx` repassando `activeGenealogyGeneration`;
- `FamilyTree.tsx` usando `activeGenealogyGeneration` no viewport;
- diferenca entre foco e filtro: os chips nao devem remover outras colunas.

### 14.5 Nao consigo arrastar verticalmente

Verificar:

- `translateExtent` e bounds de pan;
- bloqueio temporario de pan por selecao de area;
- handlers de toque da barra de chips;
- CSS que possa estar impedindo gestos;
- se o pointer event esta preso em overlay.

### 14.6 Anel sobrepoe os cards

Verificar:

- espacamento vertical entre conjuges em `genealogyColumnsLayout.ts`;
- tamanho do anel em `GenealogySpouseEdge.tsx`/`MarriageNode.tsx`;
- handles usados pela edge;
- z-index/click area do anel.

---

## 15. QA obrigatorio

### 15.1 Larguras

Testar:

```txt
320px
375px
390px
430px
768px
desktop
```

### 15.2 Roteiro mobile

Em `/genealogia`:

- carregar a pagina limpa;
- confirmar que o primeiro chip disponivel esta ativo;
- se houver tataravos, confirmar que **Tataravos** abre primeiro;
- confirmar que os cards da primeira coluna aparecem no topo;
- tocar em cada chip;
- testar swipe esquerda/direita;
- reduzir zoom por gesto;
- confirmar que demais colunas continuam renderizadas;
- arrastar para baixo/cima;
- confirmar que botoes `+` e `-` nao aparecem;
- confirmar que labels `GERACAO X` nao ficam cobertas pelos chips;
- testar paletas `white`, `orange` e `brown`.

### 15.3 Roteiro desktop

Em `/genealogia`:

- confirmar que nao ha colunas vazias;
- confirmar que tataravos aparecem quando conectados;
- confirmar pan/zoom;
- confirmar anel conjugal clicavel;
- confirmar modal conjugal;
- confirmar filtros de status de vida;
- confirmar paletas;
- confirmar exportacao de area se a alteracao afetou ReactFlow/overlay.

### 15.4 Regressao em outras views

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
- legenda nao duplicou.

---

## 16. Commits de referencia

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
```

Observacao:

- o ciclo teve uma mudanca conceitual importante: a primeira implementacao filtrava a arvore pela geracao ativa;
- a decisao final foi usar chips como **foco/enquadramento**, nao filtro;
- a correcao final tambem passou a afetar desktop ao remover colunas vazias e inferir geracoes pela pessoa central.

---

## 17. Relacao com outros documentos

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

## 18. Pendencias futuras

Fora do escopo desta frente:

- aplicar padrao similar em **Visao Completa**;
- avaliar refinamentos finos de zoom para arvores muito grandes;
- revisar labels acentuados se o projeto migrar documentos/codigo para acentuacao plena sem risco de encoding;
- avaliar exportacao completa da arvore;
- integrar grau de parentesco visual diretamente na Genealogia;
- criar controles avancados por ramo familiar.
