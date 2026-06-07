# Guia de UX e Layout - Arvore Familia

> Ultima revisao: 2026-06-06
> Revisao complementar: Genealogia mobile por geracoes
> Local canonico: `docs/GUIA_UX_LAYOUT.md`
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra as decisoes consolidadas de experiencia, layout, responsividade e comportamento visual do projeto **Arvore Familia**.

Use este guia para orientar:

- ajustes de interface;
- revisao visual de telas;
- padronizacao de headers, containers e margens;
- comportamento da arvore em desktop, tablet e mobile;
- validacao visual antes de lancamento;
- decisoes de UX que nao devem ser reabertas sem motivo tecnico ou de produto.

Este documento nao substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventario funcional e tecnico do que ja foi implementado.
- `docs/GUIA_COMPONENTES.md`: catalogo tecnico dos componentes reutilizaveis.
- `docs/GUIA_CORRECAO_ERROS.md`: investigacao por sintoma.
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap, pendencias e backlog.
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`: comportamento especifico da view Minha Arvore.
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: legenda, conectores, painel lateral e filtros visuais.
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: selecao de area, PNG, PDF e impressao.

---

## 1. Principios gerais de UX

O projeto deve manter uma experiencia:

- clara para usuarios familiares nao tecnicos;
- objetiva para administradores;
- visualmente estavel entre telas;
- responsiva em mobile, tablet e desktop;
- segura quanto a permissoes;
- conservadora em mudancas de layout de arvore, para evitar regressoes visuais.

Principios obrigatorios:

1. **Nao esconder erro funcional com ajuste visual.**
   Se uma tela quebra por dados, permissao ou service, corrigir a causa.
2. **Nao resolver problema de layout alterando regra de negocio.**
   Ajustes de Tailwind, scroll, largura e agrupamento nao devem mudar payloads, RLS, migrations ou services.
3. **Mobile-first para telas comuns.**
   Area do usuario, perfil, favoritos, notificacoes e forum devem ser confortaveis em 320px+.
4. **Admin operavel, nao necessariamente perfeito, em mobile.**
   O painel administrativo pode usar scroll horizontal controlado em listas/tabelas, mas formularios e acoes criticas precisam continuar acessiveis.
5. **Arvore e uma superficie interativa propria.**
   Pan, zoom, exportacao, legenda e selecao de area devem ser tratados como experiencia de canvas, nao como pagina tradicional.
6. **Mudanca visual nao pode enfraquecer permissao.**
   Botao escondido nao substitui `ProtectedRoute`, RLS, RPC segura ou validacao server-side.

---

## 2. Estrutura visual global

### 2.1 Stack visual

A UI usa:

- React;
- Vite;
- TypeScript;
- Tailwind;
- `lucide-react`;
- componentes locais em `src/app/components`;
- componentes de UI base em `src/app/components/ui`;
- React Flow para arvore.

A identidade visual predominante usa:

- fundo geral cinza claro;
- cartoes brancos com bordas suaves;
- sombras discretas;
- botoes arredondados;
- azul como cor principal de acao/estado ativo;
- estados de erro em vermelho;
- estados de alerta em ambar;
- texto principal em tons de slate/gray.

### 2.2 Containers

As paginas internas usam container centralizado com largura maxima consistente.

Classe consolidada:

```txt
mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8
```

Essa classe esta exportada como `PAGE_CONTAINER_CLASS` em:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Uso esperado:

- paginas internas devem usar `PAGE_CONTAINER_CLASS` para alinhar header e conteudo;
- nao criar variacoes locais de margem sem necessidade;
- evitar containers com `max-w` divergente em paginas de membro;
- preservar `min-w-0` em wrappers flex/grid para impedir overflow;
- conteudo de usuario deve usar `break-words` quando houver risco de texto longo;
- IDs, e-mails, URLs e valores tecnicos longos devem usar `break-all`.

---

## 3. Headers

### 3.1 Header da Home pos-login

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

Componente visual extraido:

```txt
src/app/pages/home/HomeHeader.tsx
```

A Home pos-login mantem header proprio porque concentra:

- nome da familia;
- label da view atual;
- seletor de visualizacao da arvore;
- seletor compacto de paletas visuais da arvore;
- busca expansivel;
- atalhos para curiosidades, forum e calendario;
- `UserMenu`;
- integracao com estado da arvore.

Regras:

- nao substituir o header da Home por `MemberPageHeader`;
- manter altura compacta;
- preservar busca expansivel;
- preservar seletor de view;
- seletor de view deve navegar entre `/minha-arvore`, `/genealogia` e `/visao-completa` sem recarregar a pagina;
- abaixo das opcoes **Minha Arvore**, **Genealogia** e **Visao Completa**, o dropdown deve exibir tres botoes circulares de paleta: branco, laranja e marrom;
- a paleta branca e a opcao padrao herdada da `main`;
- a paleta laranja representa a variacao visual de `polish/layout-components-main`;
- a paleta marrom representa a variacao premium inspirada em `redesign/suafamilia-tree-style`;
- a troca de paleta deve alterar apenas CSS variables/tokens visuais da arvore;
- a troca de paleta nao deve alterar rota, `viewMode`, filtros, dados, permissao, Supabase ou regras de negocio;
- a escolha de paleta deve persistir em `localStorage`;
- search params existentes, especialmente `?pessoa=...`, devem ser preservados ao trocar view;
- botao **Acoes** usa icone `Printer`;
- no desktop, o botao pode exibir texto **Acoes**;
- no mobile, o botao deve aparecer apenas como icone;
- **Acoes** abre o painel/acao de informacoes, nao uma terceira aba persistente na toggle principal;
- loading da Home deve usar **Buscando pessoas e relacionamentos...**, sem no Supabase;
- evitar acoes que causem overflow horizontal;
- em breakpoints menores, esconder textos e priorizar icones.

### 3.2 Header das paginas internas

Arquivo principal:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Paginas internas padronizadas:

```txt
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

O header interno possui:

- icone opcional;
- titulo;
- subtitulo;
- acoes opcionais;
- layout responsivo em coluna no mobile e linha no desktop;
- `PAGE_CONTAINER_CLASS` para alinhamento.

Regras:

- usar `MemberPageHeader` para novas paginas internas de usuario/admin, salvo excecao justificada;
- acoes do header devem usar `actions`;
- botoes devem preservar foco visivel;
- botoes de header e acoes internas nao devem quebrar texto em duas linhas;
- icones devem vir de `HEADER_ACTION_ICONS` quando ja existirem ali;
- titulos e subtitulos devem usar textos curtos, pois sao truncados em tela estreita.


### 3.3 Busca expansivel no header da arvore

A busca do header da Home pos-login deve funcionar nas rotas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Comportamento consolidado:

- o botao de busca precisa ser clicavel em toda a area visual;
- ao expandir, o campo deve usar o placeholder **Buscar pessoa ou pagina...**;
- a busca deve sugerir pessoas e paginas;
- a lista local de paginas deve incluir rotas de uso recorrente, como **Notificacoes** e **Ajustar Notificacoes**;
- a busca deve oferecer atalho para a pagina completa de resultados;
- sugestoes devem fechar ao clicar fora da area de busca;
- sugestoes devem fechar ao pressionar `Esc`;
- sugestoes devem ficar acima da arvore e nao podem usar fundo transparente.

Para sugestoes de pessoas, a linha secundaria deve seguir o padrao:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Se faltar cidade ou data, exibir apenas a informacao disponivel. Se ambas estiverem ausentes, ocultar a linha secundaria.

### 3.4 Camadas de dropdowns no header

O header da Home usa camada elevada para permanecer acima da arvore. Por isso, menus em portal precisam ter camada superior a do header.

Regras consolidadas:

- `SelectContent` deve abrir acima do header;
- `DropdownMenuContent` deve abrir acima do header;
- `DropdownMenuSubContent` deve abrir acima do header;
- menus devem usar afastamento vertical suficiente para nao parecerem encaixados sob a barra;
- sugestoes de busca, menu do usuario e seletor de views nao devem se sobrepor visualmente de forma indevida;
- os botoes circulares de paleta ficam dentro do `SelectContent` do seletor de views e devem manter clique/foco funcionais sem fechar por erro ou propagar evento indevido para a arvore.

Padrao atual:

```txt
conteudos Radix em portal -> z-[1000]
sideOffset padrao -> 8
```

Esse padrao evita regressao em que o menu do usuario e o dropdown de views ficavam com a parte superior coberta pelo header.

### 3.5 Modal Curiosidades - Voce Sabia

No modal **Curiosidades**, a aba **Voce Sabia?** usa cards estatisticos com cores distintas para facilitar leitura rapida:

| Card | Tratamento visual |
|---|---|
| Pessoas cadastradas | Azul |
| Vivos | Verde |
| Falecidos | Slate/cinza |
| Pets | Ambar |

Regras:

- manter contraste suficiente entre fundo, label e numero;
- preservar grid responsivo;
- nao misturar a cor dos cards estatisticos com status de permissao ou erro;
- novas estatisticas devem seguir variacao cromatica discreta e coerente com Tailwind ja usado no projeto.


---

## 4. Layout da Home e painel lateral

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

A Home pos-login e composta por:

- header no topo da viewport;
- area principal `main` com altura restante;
- painel lateral;
- area da arvore;
- modais globais da arvore.

Componentes visuais extraidos:

```txt
HomeHeader
HomeTreeSection
HomeMobileNav
SidebarPanelTabs
SidebarInfoPanel
DirectRelationKpiGrid
DirectRelativeFilterGrid
GenealogyFilterGrid
LifeStatusKpiGrid
HomeCuriositiesDialog
DiscoverResultCard
ContactInfo
ConnectionDiscoveryPanel
AiQuestionPanel
```

Regra de refatoracao:

> A extracao e incremental. Nao mover estado principal, handlers complexos, chamadas Supabase ou regras da arvore para esses componentes sem nova revisao.

### 4.1 Painel lateral desktop

No desktop:

- painel aberto usa largura aproximada `w-80`;
- painel recolhido usa largura estreita, como `w-14`;
- botao de recolher/expandir deve ficar dentro ou junto ao painel;
- conteudo interno do painel rola verticalmente;
- area da arvore ocupa o espaco restante.

Regra consolidada:

> Deve existir apenas um controle de expandir/recolher painel lateral. Nao duplicar botao dentro da arvore.

### 4.2 Painel lateral mobile

No mobile:

- painel aparece como secao acima da arvore quando aberto;
- ha botao para recolher;
- quando fechado, aparece botao de expandir sobre a area da arvore;
- conteudo do painel deve ser legivel e compacto;
- a arvore continua ocupando o espaco restante;
- textos longos devem truncar ou quebrar sem gerar overflow horizontal.

### 4.3 Abas do painel lateral

O painel lateral organiza conteudos por abas principais:

```txt
Filtros
Legendas
```

A aba **Informacoes** nao deve aparecer na toggle principal. Ela e acionada pelo botao externo **Acoes**.

A aba **Legendas** foi simplificada. Nao deve exibir:

- subtitulo Cores, linhas, aneis e modos da arvore.;
- label Visualizacao atual;
- card azul da view atual;
- area Views no final;
- subtitulos dentro dos cards de Cards, Linhas e Anel de casamento.

Texto consolidado do status conjugal:

```txt
Em relacionamento
```

Alem de legenda, `TreeLegend` tambem pode controlar filtros/camadas visuais reais:

- `visualLineFilters.parentChildHighlight`;
- `visualLineFilters.siblingHighlight`;
- `parentChildHighlight` respeita `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` respeita `edgeFilters.irmaos`;
- estado padrao desligado mantem o visual original.

---

## 5. Arvore: views e comportamento visual

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
```

Views existentes:

| View | Rota | Uso |
|---|---|---|
| Minha Arvore | `/minha-arvore` | Escopo em torno da pessoa central. |
| Genealogia | `/genealogia` | Escopo pessoal por geracoes. |
| Visao Completa | `/visao-completa` | Base familiar completa por geracoes. |

`/` redireciona para `/minha-arvore` preservando search params. As tres rotas usam o mesmo shell `Home`, e a mudanca de view deve alterar apenas a area principal da arvore e controles condicionados por `viewMode`.

### 5.1 Titulo fixo da arvore

O titulo/subtitulo da arvore deve ser renderizado apenas como overlay fixo em `FamilyTree.tsx`.

Texto atual:

```txt
Linha Genealogica de {primeiro nome}
Use zoom, arraste a arvore e clique nas pessoas para abrir detalhes.
```

Regras:

- nao adicionar title node interno nos layouts;
- `directFamilyDistributedLayout.ts` nao deve criar titulo principal da arvore;
- `genealogyColumnsLayout.ts` nao deve criar titulo/subtitulo principal;
- labels de geracao e grupo podem existir, mas nao devem duplicar o titulo principal.

### 5.2 Viewport inicial

O viewport inicial separa:

- bounds usados para zoom/enquadramento visual;
- bounds usados para pan/arraste.

Regra consolidada:

- zoom inicial deve considerar cards reais (`personNode`) como base visual;
- elementos auxiliares nao devem reduzir a arvore;
- labels, group boxes, legend nodes e anchors nao devem comandar o zoom inicial;
- bounds de pan podem considerar mais elementos para permitir navegacao segura;
- titulo fixo nao participa do bounds da arvore.

### 5.3 Minha Arvore

A view **Minha Arvore** deve:

- carregar legivel apos login;
- nao aparecer minuscula no centro;
- caber de forma equilibrada no container;
- usar bounds de cards reais;
- permitir zoom maximo perceptivel;
- recentralizar apenas quando necessario;
- preservar layout de grupos diretos;
- manter filtros diretos e KPIs em sincronia com a pessoa central.

A view pode considerar altura para fit inicial, desde que isso nao reduza a arvore a ponto de perder legibilidade.

Quando a pessoa central tiver arvore direta esparsa, sem pais, ancestrais
ou grupos laterais visiveis, `/minha-arvore` pode usar enquadramento vertical
mais curto e aproximar os grupos inferiores do card central.

Regras:

- a compactacao deve ser detectada por estrutura renderizavel, nao por nome de pessoa;
- arvores densas continuam com o layout distribuido atual;
- filtros de grupos e filtros de linhas nao devem ser alterados;
- conectores e anchors existentes devem continuar comandados pelo layout logico.

### 5.4 Genealogia

A view **Genealogia** deve:

- usar zoom por largura;
- nao reduzir zoom por causa da altura total;
- iniciar no mesmo topo visual das demais views;
- manter largura visual equivalente a Minha Arvore;
- permitir que o usuario arraste/deslize para baixo quando houver muitos cards verticais;
- preservar labels de geracao;
- preservar aneis conjugais e conectores ortogonais;
- no mobile, oferecer navegacao horizontal por geracoes, com chips superiores e suporte a swipe lateral.

#### 5.4.1 Genealogia mobile por geracoes

No mobile, a view **Genealogia** adota um padrao inspirado em navegacao horizontal por etapas:

```txt
Tataravos
Bisavos
Avos
Pais
Nucleo
Descendentes
```

Regras consolidadas:

- a barra de chips aparece apenas em `/genealogia` mobile;
- os chips ocupam a largura horizontal disponivel da area da arvore;
- os chips nao exibem contagem numerica;
- a geracao ativa deve ter estado visual claro;
- toque/click em chip deve focar a respectiva geracao;
- swipe lateral nos chips deve avancar ou voltar geracao;
- os chips focam/enquadram a geracao, mas nao removem as demais colunas do ReactFlow;
- ao reduzir zoom, o usuario deve conseguir ver as demais colunas com cards reais;
- a tela inicial deve focar a primeira geracao renderizada com cards reais;
- se a pessoa central tiver tataravos conectados, a primeira coluna deve aparecer com esses cards;
- colunas sem cards nao devem ser exibidas;
- labels `GERACAO X` nao devem ficar sobrepostos ao menu de chips;
- em Genealogia mobile, botoes `+` e `-` podem ficar ocultos para evitar disputa de espaco com a barra de chips;
- pan vertical e horizontal por touch deve continuar disponivel na area da arvore.

A inferencia de geracao deve ser tratada como regra de renderizacao em memoria. Ela nao deve alterar dados reais, migrations, RLS ou Supabase.

### 5.5 Visao Completa

A view **Visao Completa** segue a mesma regra de UX da Genealogia:

- zoom por largura;
- mesma posicao inicial vertical;
- altura total nao reduz zoom;
- navegacao vertical por pan/arraste;
- base completa da familia;
- sem titulo/subtitulo duplicado.

### 5.6 Pan e zoom

Controles esperados:

- botao `+`;
- botao `-`;
- scroll/pinch quando habilitados;
- pan por arraste quando permitido.

Regras:

- botoes de zoom ficam no canto superior direito da area da arvore, por exemplo `right-4 top-4`;
- em Genealogia mobile, os botoes `+` e `-` podem ser ocultados para priorizar a barra horizontal de geracoes;
- durante selecao de area, pan/zoom devem ser bloqueados;
- ao cancelar/concluir selecao, pan/zoom devem voltar;
- Genealogia e Visao Completa sempre precisam permitir pan vertical;
- Minha Arvore pode restringir pan quando esta no zoom de fit, para evitar deslocamento acidental;
- swipe nos chips de geracao nao deve bloquear o pan/zoom do canvas fora da barra.

---

## 6. Layouts da arvore

### 6.1 Minha Arvore - layout distribuido

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Caracteristicas:

- pessoa central destacada;
- grupos laterais paternos/maternos;
- pais, avos, bisavos e demais grupos;
- labels de grupo;
- caixas de agrupamento;
- anchors estruturais;
- edges estruturais.

Regras de UX:

- grupos devem ter alinhamento visual estavel;
- labels de grupo sao permitidas;
- titulo geral da arvore nao deve ser criado aqui;
- caixas e anchors nao devem controlar zoom inicial;
- cards devem continuar clicaveis via `FamilyTree`.

### 6.2 Genealogia/Visao Completa - layout por colunas

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Caracteristicas:

- colunas por geracao;
- cards ordenados por geracao;
- ordenacao por nascimento/nome;
- conjuges proximos;
- aneis de casamento;
- conectores familiares ortogonais;
- labels de geracao;
- suporte a filtros por geracao;
- colunas vazias nao devem ser renderizadas;
- espacamento vertical entre conjuges deve evitar sobreposicao do anel.

Regras de UX:

- `COLUMN_TOP` define o inicio estrutural das colunas;
- labels de geracao sao permitidas;
- titulo/subtitulo principal nao deve ser renderizado aqui;
- altura vertical pode exceder a viewport;
- usuario deve navegar por pan/arraste;
- conectores devem continuar legiveis mesmo com filtros ativos;
- em Genealogia, a primeira coluna com cards reais deve ser tratada como ponto inicial de leitura;
- no mobile, a barra de geracoes deve focar colunas reais, nao colunas vazias.

---

## 7. Legendas visuais

Documentacao especifica recomendada:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Estado atual:

- legenda visual simplificada;
- modo compacto para painel lateral;
- modo nao compacto preservado para uso futuro;
- sem descricao da view atual;
- sem secao Views;
- sem subtitulos internos nos itens;
- item Em relacionamento para uniao ativa.

Secoes atuais:

- Cards;
- Linhas;
- Camadas extras, quando disponiveis;
- Anel de casamento;
- Cores dos grupos, quando houver altura util.

Regras:

- a legenda deve explicar o essencial, nao repetir textos de tutorial;
- nao deve bloquear pan/zoom;
- deve ser ignorada em exportacoes;
- nao deve criar dependencia com Supabase;
- nao deve alterar calculo de status conjugal;
- alteracoes de copy devem ser feitas em `TreeLegend.tsx` e refletidas na documentacao especifica.

---

## 8. Exportacao e selecao de area

Documentacao especifica recomendada:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

UX implementada:

- botao de selecao de area;
- overlay sobre a area visivel da arvore;
- instrucao **Arraste para selecionar uma area visivel da arvore.**;
- retangulo de selecao;
- toolbar contextual para Salvar PNG, Salvar PDF, Imprimir e Cancelar;
- cancelamento por botao ou `Esc`;
- bloqueio temporario de pan/zoom durante selecao.

Regras:

- selecao minima: 80 x 80px;
- limite de seguranca: 12.000.000 pixels estimados;
- exportacao opera sobre viewport visivel, nao arvore completa;
- controles ReactFlow, minimap, menus, overlay e legenda sao ignorados;
- imagens externas sem CORS podem falhar com erro amigavel;
- exportacao nao deve salvar no Supabase nem criar log persistido.

---

## 9. Modais, dialogs e overlays

Padroes:

- modais longos usam altura maxima e rolagem interna;
- em mobile, largura deve ser `calc(100vw - margem)`;
- botoes internos que nao salvam devem usar `type="button"`;
- overlays interativos devem impedir propagacao quando necessario;
- modais administrativos devem manter acoes destrutivas protegidas por confirmacao;
- modais nao devem esconder erros funcionais com fechamento automatico.

Exemplos relevantes:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/pages/Home.tsx
```

---

## 10. Responsividade

Larguras obrigatorias de QA:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Padroes obrigatorios:

- `min-w-0` em containers flex/grid;
- `break-words` para textos de usuario;
- `break-all` para IDs, e-mails, URLs e valores tecnicos longos;
- botoes em `w-full sm:w-auto` quando houver risco de overflow;
- headers com `flex-col gap-2 sm:flex-row`;
- listas/tabelas largas com `overflow-x-auto` contido;
- modais com `max-h` e scroll interno;
- cards empilhados no mobile;
- textos e botoes truncados quando necessario.

Criterios gerais:

- sem overflow horizontal global indevido;
- acoes principais acessiveis;
- menus operaveis;
- modais cabem ou rolam internamente;
- arvore utilizavel em touch;
- legenda nao bloqueia a arvore;
- admin operavel em telas menores.

---

## 11. Padroes de conteudo e microcopy

Diretrizes:

- titulos curtos;
- subtitulos informativos, mas nao redundantes;
- botoes com verbo claro;
- mensagens de erro orientadas a acao;
- evitar jargao tecnico para usuario comum;
- preservar termos tecnicos no admin quando necessario.

Exemplos consolidados:

| Contexto | Texto |
|---|---|
| View principal | Minha Arvore |
| View genealogica | Genealogia |
| View completa | Visao Completa |
| Titulo da arvore | Linha Genealogica de {primeiro nome} |
| Subtitulo da arvore | Use zoom, arraste a arvore e clique nas pessoas para abrir detalhes. |
| Status conjugal ativo | Em relacionamento |
| Exportacao | Selecionar area |
| Exportacao PNG | Salvar PNG |
| Exportacao PDF | Salvar PDF |
| Acoes da arvore | Acoes |
| Paletas da arvore | Branco, laranja e marrom |
| Loading da Home | Buscando pessoas e relacionamentos... |
| Busca | Buscar por nome ou local... |
| Calendario - falecimento no grid | 44 anos de falecimento / Memoria de Nome |
| Calendario - card Memoria | 44 anos da morte de Nome |

---

## 12. QA visual obrigatorio apos mudancas de layout

Antes de commitar ajuste visual relevante:

```bash
git status
npm run build
npm test
git diff --check
```

Quando houver mudanca em arvore, painel ou responsividade:

```bash
npm run test:e2e
```

Checklist manual minimo:

- abrir Home pos-login;
- testar Minha Arvore;
- testar Genealogia;
- testar Visao Completa;
- abrir/recolher painel lateral;
- abrir aba Legendas;
- usar zoom `+` e `-`;
- arrastar arvore;
- testar mobile estreito;
- testar exportacao de area se algo afetou overlay/ReactFlow;
- garantir que usuario comum nao ve acoes admin.

---

## 13. Alteracoes recentes registradas

### 13.1 Header e margens internas

- criado/padronizado `MemberPageHeader`;
- consolidado `PAGE_CONTAINER_CLASS`;
- paginas internas passaram a seguir o mesmo padrao visual de header;
- Home pos-login permaneceu com header proprio.

### 13.2 Painel lateral

- removida duplicidade de botoes de recolher/expandir painel;
- controle passou a ficar junto ao painel;
- mobile mantem botao de expandir sobre a arvore quando painel esta fechado;
- toggle principal ficou restrita a **Filtros** e **Legendas**;
- **Informacoes** saiu da toggle e passou a ser acionada por **Acoes**.

### 13.3 Viewport da arvore

- zoom inicial passou a usar bounds de cards reais;
- bounds de viewport foram separados de bounds de pan;
- Genealogia/Visao Completa passaram a usar zoom por largura;
- altura total nao reduz mais a escala dessas views;
- titulo/subtitulo interno das views genealogicas foi removido;
- overlay fixo em `FamilyTree.tsx` tornou-se a fonte unica do titulo.

### 13.4 Legendas

- removido subtitulo da legenda;
- removida Visualizacao atual;
- removido card azul da view atual;
- removida secao Views;
- removidas descricoes internas dos itens;
- Ativa foi trocado por Em relacionamento;
- legenda tambem controla filtros/camadas visuais quando callbacks sao fornecidos;
- controles de camadas extras incluem destaque opcional de pais/filhos e irmaos.

### 13.5 Arquivos historicos

- apos upload, o input nativo fica oculto;
- campos e botoes **Cancelar**/**Adicionar** ficam ocultos imediatamente;
- mensagem verde **a Arquivo carregado** permanece visivel;
- imagens mostram thumbnail;
- PDF mostra card/icone/label PDF;
- botao **Adicionar Arquivo** reabre campos sem apagar a miniatura carregada;
- usuario ainda pode preencher titulo, descricao, ano e categoria depois do upload.

### 13.6 Minha Arvore

- cards de **Escopo da visualizacao** exibem avatar circular com foto ou iniciais;
- botao individual **Salvar casamento** foi removido;
- botao geral **Salvar meus dados** salva dados pessoais e processa dados conjugais;
- local de casamento invalido nao bloqueia os dados pessoais, mas deixa casamento sem salvar e mostra aviso.

### 13.7 Ajustes pos-PDF

Notificacoes:

- `/notificacoes` e lista/central em cards;
- `/ajustar-notificacoes` e pagina dedicada de preferencias.

Calendario Familiar:

- bloco superior de **Categorias** foi removido;
- sidebar mantem o titulo **Categorias**;
- categorias sao filtros clicaveis;
- contadores usam singular/plural: **1 evento**, **2 eventos**;
- aniversarios mostram **Faz X anos**.
- no topo do mes, **MES EXIBIDO** e o nome do mes ficam centralizados entre as setas anterior/proximo;
- no grid, falecimentos usam titulo compacto (**44 anos de falecimento**) e descricao separada (**Memoria de Nome Completo**);
- no card **Memoria**, falecimentos usam **44 anos da morte de Nome Completo** ou **Morte de Nome Completo**.

Perfil e contato:

- cards vazios de insights nao devem renderizar no perfil publico;
- botao WhatsApp deve manter o mesmo peso visual dos botoes de acao/header.

Admin:

- erro de listagem de usuarios para vinculo aparece inline;
- evitar toast repetitivo para a mesma falha de listagem;
- autocomplete de endereco nao bloqueia o formulario se o Google falhar.

---

## 14. O que evitar

Nao fazer:

- adicionar novo titulo dentro de layouts da arvore;
- usar altura total da Genealogia/Visao Completa para reduzir zoom inicial;
- duplicar controles de painel lateral;
- criar nova classe de container se `PAGE_CONTAINER_CLASS` resolver;
- alterar service/RLS/migration para correcao visual;
- colocar legenda dentro da exportacao;
- salvar estado visual transitorio no banco;
- criar nova view de arvore sem documentar comportamento de zoom/pan;
- commitar arquivos de backup, `.bak`, patches temporarios ou dumps;
- usar `window.location` para navegacao interna quando `navigate` resolver;
- transformar ajuste de copy em alteracao de regra de negocio.

---

## 15. Arquivos de referencia

```txt
src/app/pages/Home.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

---

## 16. Manutencao documental

Este arquivo deve concentrar decisoes de UX e layout. Para evitar repeticao:

- detalhes tecnicos de componentes ficam em `docs/GUIA_COMPONENTES.md`;
- troubleshooting fica em `docs/GUIA_CORRECAO_ERROS.md`;
- estado implementado fica em `docs/GUIA_IMPLEMENTACOES.md`;
- exportacao da arvore deve ser detalhada em `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- legenda/painel/conectores devem ser detalhados em `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- rotas e guards devem ficar em `docs/arquitetura/ROTAS_E_GUARDS.md`.

---
## 13. Registro de ajustes recentes - ciclo 2026-05-30

Esta secao consolida decisoes de UX validadas durante o ciclo recente de ajustes. Quando houver divergencia entre prints, PDFs antigos ou documentos historicos, prevalecem as regras abaixo junto aos documentos funcionais especificos.

### 13.1 Header da arvore: busca, sugestoes e pagina de resultados

Rotas afetadas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Regras consolidadas:

- o botao de busca deve ser clicavel em toda a area visual;
- a busca deve sugerir automaticamente **pessoas** e **paginas**;
- a busca deve oferecer acesso para a pagina completa de resultados;
- o placeholder oficial e **Buscar pessoa ou pagina...**;
- sugestoes fecham ao clicar fora;
- sugestoes fecham com `Esc`;
- sugestoes devem ficar em camada acima da arvore;
- sugestoes devem usar fundo solido, nunca transparente;
- a lista local de paginas deve contemplar rotas recorrentes, incluindo **Notificacoes** e **Ajustar Notificacoes**.

Linha secundaria das sugestoes de pessoas:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Se uma das informacoes estiver ausente, exibir apenas o dado disponivel. Se ambas estiverem ausentes, ocultar a linha secundaria.

### 13.2 Header da arvore: camadas de menus

O header da arvore usa camada elevada para ficar acima do canvas. Conteudos Radix em portal precisam ficar acima do header.

Padrao consolidado:

```txt
SelectContent -> z-[1000]
DropdownMenuContent -> z-[1000]
DropdownMenuSubContent -> z-[1000]
sideOffset -> 8
```

Esse padrao evita regressao em que o menu do usuario e o dropdown de views aparecem parcialmente cobertos pelo header.

### 13.3 Modal Curiosidades > Voce Sabia

A aba **Voce Sabia?** deve manter cards estatisticos com cores distintas:

| Card | Cor |
|---|---|
| Pessoas cadastradas | Azul |
| Vivos | Verde |
| Falecidos | Slate/cinza |
| Pets | Ambar |

A cor serve para leitura rapida e nao deve ser usada como estado de permissao, erro ou alerta.

### 13.4 /minha-arvore/editar

A experiencia da rota `/minha-arvore/editar` possui documento funcional proprio:

```txt
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
```

Regras de UX a preservar:

- avatar do topo e clicavel;
- modal de foto permite visualizar, alterar, cortar e remover imagem;
- botao **Remover foto** deve ter borda visivel e tratamento destrutivo discreto;
- saida sem salvar deve exibir confirmacao quando houver alteracoes pendentes;
- o modal **Sair sem salvar?** deve manter microcopy acentuada corretamente;
- a pagina nao deve exibir preferencias de notificacao nem campo de edicao de signo.

### 13.5 Textos, acentuacao e encoding

Textos de UI devem ser mantidos em UTF-8. A existencia de camada defensiva de reparo de texto renderizado nao substitui a correcao dos arquivos-fonte.

Validar visualmente:

- **Arquivos Historicos**;
- **voce / alteracoes / pagina / nao / serao** em modais;
- **O corte final sera quadrado.** com acentuacao correta no ambiente final;
- labels de relacionamento como **Conjuge** e **Casamento** quando a UI estiver em ASCII, ou **Cônjuge** quando o arquivo-fonte permitir acentos sem corromper.

### 13.6 Paginas legais

Em `/privacidade` e `/termos`:

- o header nao deve exibir **Arvore Genealogica** do lado direito;
- a data oficial de ultima atualizacao e **01/06/2026**.

---

## Atualizacao 2026-06-06 - Paletas visuais da arvore

O ciclo de paletas foi concluido em duas etapas:

```txt
PR #6 - feat: adicionar paletas visuais da arvore
PR #7 - fix: exibir paletas no header da arvore
```

O dropdown de visualizacao da arvore em `HomeHeader.tsx` inclui, abaixo das opcoes **Minha Arvore**, **Genealogia** e **Visao Completa**, um seletor compacto de paleta visual com tres botoes circulares:

- **branco**: paleta padrao da `main`;
- **laranja**: variacao visual baseada na branch `polish/layout-components-main`;
- **marrom**: variacao premium baseada na branch `redesign/suafamilia-tree-style`.

Regras de UX:

- os botoes de paleta devem ser discretos, circulares, sem texto visivel e com `aria-label`;
- o estado ativo deve ser evidente por borda/ring;
- o clique em paleta deve usar `type="button"` e nao deve alterar a view selecionada;
- a troca de paleta nao altera rota, `viewMode`, filtros, permissao, dados ou Supabase;
- a escolha deve persistir em `localStorage`;
- a aplicacao visual deve ocorrer por CSS variables/tokens, preservando estrutura e dados da arvore;
- o seletor deve permanecer associado ao controle visual da arvore no header, nao ao painel lateral;
- validar em desktop e tablet; em mobile estreito, confirmar se o dropdown do header esta disponivel ou se sera preciso acesso equivalente futuro;
- validar nas tres views: `/minha-arvore`, `/genealogia` e `/visao-completa`.

Arquivos relacionados:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Historico de estabilizacao:

- uma primeira tentativa de expor as paletas no header causou `treeColorPalette is not defined` em runtime;
- o commit problemático foi revertido para restaurar producao;
- a reimplementacao segura foi feita em branch/PR separado;
- o PR #7 adicionou estado React, `applyTreePalette`, persistencia e botoes no `SelectContent`;
- o build local e o Preview da Vercel foram validados antes do merge;
- apos merge, a producao foi testada e voltou a exibir as paletas corretamente.

---

## Atualizacao 2026-06-06 - UX da Genealogia mobile por geracoes

A view `/genealogia` recebeu uma navegacao mobile por geracoes inspirada em tabs/chips horizontais de etapas.

### Decisoes de UX

- aplicar inicialmente apenas em **Genealogia**;
- deixar **Visao Completa** como etapa futura;
- evitar empilhar todas as geracoes verticalmente no mobile;
- usar chips horizontais para selecao direta;
- permitir swipe lateral entre chips;
- manter o canvas ReactFlow como superficie interativa de pan/zoom;
- focar a geracao ativa sem esconder as demais colunas;
- iniciar na primeira geracao com cards reais;
- remover contagens dos chips para reduzir ruído visual;
- ocultar controles `+` e `-` em Genealogia mobile para liberar espaco ao menu;
- manter pan vertical para colunas altas;
- remover colunas vazias da Genealogia.

### QA visual obrigatorio

Testar `/genealogia` em:

```txt
320px
375px
390px
430px
768px
desktop
```

Validar:

- barra de chips sem contagem;
- chip ativo coerente com a coluna focada;
- primeira coluna real visivel no carregamento;
- tataravos visiveis quando existirem na cadeia de filiacao;
- labels de geracao sem sobreposicao com chips;
- pan vertical funcional;
- zoom por gesto funcional;
- desktop sem coluna vazia;
- `/minha-arvore` e `/visao-completa` sem regressao.

