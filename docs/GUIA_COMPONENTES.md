# Guia de componentes â€” Ãrvore FamÃ­lia

> Ãšltima atualizaÃ§Ã£o: 2026-05-29
> Local canÃ´nico: `docs/GUIA_COMPONENTES.md`

## Objetivo

Este documento registra os principais componentes reutilizÃ¡veis do projeto **Ãrvore FamÃ­lia**, suas responsabilidades, arquivos relacionados, padrÃµes de uso e cuidados contra regressÃµes.

Use este guia para:

- localizar rapidamente componentes relevantes;
- saber onde alterar UI sem mexer em regra de negÃ³cio;
- evitar duplicaÃ§Ã£o de componentes;
- preservar padrÃµes de props, layout e acessibilidade;
- orientar novos prompts de implementaÃ§Ã£o.

Este documento nÃ£o substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: visÃ£o funcional consolidada.
- `docs/GUIA_UX_LAYOUT.md`: decisÃµes visuais e regras de layout.
- `docs/GUIA_CORRECAO_ERROS.md`: investigaÃ§Ã£o por sintoma.
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap e pÃ³s-MVP.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`: comportamento especÃ­fico da view Minha Ãrvore.
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: regra funcional de exportaÃ§Ã£o.

---

## Escopo deste guia

Este guia deve responder a trÃªs perguntas:

1. **qual componente alterar**;
2. **qual responsabilidade ele possui**;
3. **quais cuidados evitam regressÃ£o**.

Quando a dÃºvida envolver regra de negÃ³cio, Supabase, RLS, migrations ou fluxo de produto, consulte primeiro o documento funcional ou operacional correspondente. Componentes visuais nÃ£o devem se tornar ponto de entrada para regras de banco.

## 1. ConvenÃ§Ãµes gerais de componentes

### 1.1 OrganizaÃ§Ã£o

Componentes ficam principalmente em:

```txt
src/app/components
src/app/components/ui
src/app/components/layout
src/app/components/FamilyTree
src/app/components/person
src/app/components/relationships
src/app/components/Timeline
src/app/components/favorites
src/app/components/forum
```

PÃ¡ginas ficam em:

```txt
src/app/pages
src/app/pages/admin
src/app/pages/forum
src/app/pages/home
```

Services, utils e types nÃ£o devem ser misturados com componentes:

```txt
src/app/services
src/app/utils
src/app/types
```

### 1.2 Regras de alteraÃ§Ã£o

Ao alterar componente:

- manter props tipadas;
- evitar lÃ³gica de banco dentro do componente visual;
- usar services para Supabase;
- usar utils para cÃ¡lculo puro;
- nÃ£o introduzir side effects em componentes de exibiÃ§Ã£o;
- manter `type="button"` em botÃµes internos que nÃ£o fazem submit;
- preservar estados de loading/erro/vazio;
- preservar acessibilidade bÃ¡sica: `aria-label`, foco visÃ­vel e semÃ¢ntica.

### 1.3 PadrÃµes de estilo

- Tailwind local no JSX;
- `min-w-0` em wrappers flex/grid;
- `shrink-0` em Ã­cones/avatares;
- `truncate` quando texto precisa caber em uma linha;
- `break-words` para conteÃºdo de usuÃ¡rio;
- `break-all` para valores tÃ©cnicos;
- `w-full sm:w-auto` em botÃµes responsivos;
- modais com `max-h` e rolagem interna.

---

## 2. Componentes de layout

### 2.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Responsabilidade:

- padronizar header de pÃ¡ginas internas;
- fornecer tÃ­tulo, subtÃ­tulo, Ã­cone e aÃ§Ãµes;
- exportar classe global de container;
- exportar Ã­cones comuns para aÃ§Ãµes.

Exports principais:

```txt
MemberPageHeader
PAGE_CONTAINER_CLASS
HEADER_ACTION_ICONS
```

Props:

```txt
title: string
subtitle: string
icon?: React.ComponentType
actions?: HeaderAction[]
```

`HeaderAction` aceita:

```txt
label
to
onClick
icon
variant: default | primary | danger | ghost
```

Uso esperado:

- pÃ¡ginas internas de usuÃ¡rio;
- pÃ¡ginas internas administrativas;
- pÃ¡ginas que precisam seguir o padrÃ£o visual de `/minha-arvore`.

NÃ£o usar em:

- Home pÃ³s-login (`src/app/pages/Home.tsx`), que possui header prÃ³prio integrado Ã  Ã¡rvore.

Cuidados:

- nÃ£o duplicar botÃµes de navegaÃ§Ã£o que jÃ¡ existam no conteÃºdo;
- manter textos curtos, pois o header trunca tÃ­tulo/subtÃ­tulo;
- nÃ£o criar novo container se `PAGE_CONTAINER_CLASS` atender.

---

## 3. Componentes da Ã¡rvore

### 3.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar React Flow;
- selecionar layout conforme view;
- gerenciar viewport inicial;
- controlar pan/zoom;
- expor aÃ§Ãµes imperativas;
- renderizar tÃ­tulo/subtÃ­tulo fixo da Ã¡rvore;
- integrar exportaÃ§Ã£o de Ã¡rea;
- integrar clique em pessoa e casamento.

Props principais:

```txt
pessoas
relacionamentos
viewMode
centralPersonId
selectedPersonId
edgeFilters
directRelativeFilters
genealogyFilters
isMobile
layoutRevision
onPersonClick
onPersonView
onPersonEdit
onPersonAddConnection
onPersonRemove
onMarriageClick
```

`TreeViewMode` fica em:

```txt
src/app/components/FamilyTree/treeViewMode.ts
```

Esse arquivo centraliza o tipo e os helpers de rota:

```txt
VIEW_MODE_TO_PATH
PATH_TO_VIEW_MODE
getTreeViewModeFromPath
getPathForTreeViewMode
```

As rotas dedicadas da Ã¡rvore devem continuar usando esses helpers para evitar divergÃªncia entre URL e `viewMode`.

AÃ§Ãµes expostas via `ref`:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Comportamento consolidado:

- `viewMode = minha-arvore` usa `directFamilyDistributedLayout`;
- `viewMode = genealogia` usa `genealogyColumnsLayout` com escopo pessoal;
- `viewMode = visao-completa` usa `genealogyColumnsLayout` com base completa;
- tÃ­tulo da Ã¡rvore Ã© overlay fixo no prÃ³prio componente;
- viewport inicial usa bounds de `personNode`;
- bounds de pan sÃ£o separados dos bounds de viewport;
- Genealogia/VisÃ£o Completa usam zoom por largura;
- seleÃ§Ã£o de Ã¡rea bloqueia pan/zoom temporariamente.

Cuidados:

- nÃ£o recolocar title nodes nos layouts;
- nÃ£o usar altura total para reduzir zoom de Genealogia/VisÃ£o Completa;
- nÃ£o incluir labels/group boxes/anchors no bounds visual de zoom;
- nÃ£o alterar filtros sem revisar `Home.tsx`;
- nÃ£o mexer em Supabase neste componente.

---

### 3.2 Layout `directFamilyDistributedLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidade:

- posicionar a view **Minha Ãrvore**;
- montar pessoa central;
- agrupar parentes por lado paterno/materno;
- criar labels de grupos;
- criar group boxes;
- criar anchors estruturais;
- criar edges estruturais.

Elementos relevantes:

```txt
directFamilyGroupBoxNode
directFamilyLabelNode
directFamilyAnchorNode
personNode
spouseEdge
childEdge
```

Cuidados:

- labels de grupo podem permanecer;
- tÃ­tulo geral da Ã¡rvore nÃ£o deve ser criado aqui;
- group boxes e anchors nÃ£o devem comandar zoom inicial;
- alteraÃ§Ã£o de constantes de posiÃ§Ã£o pode afetar toda a composiÃ§Ã£o visual;
- validar em desktop e mobile apÃ³s qualquer mudanÃ§a.

---

### 3.3 Layout `genealogyColumnsLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidade:

- posicionar **Genealogia** e **VisÃ£o Completa**;
- agrupar pessoas por `manual_generation`;
- ordenar por data de nascimento e nome;
- posicionar cÃ´njuges;
- criar labels de geraÃ§Ã£o;
- criar conectores ortogonais de famÃ­lia;
- criar edges conjugais com anel;
- aplicar filtros de geraÃ§Ã£o.

FunÃ§Ãµes/conceitos importantes:

```txt
getGenealogyMarriageStatus
groupPeopleByGeneration
addLabelNode
appendPlacementNodes
createGenealogyFamilyConnectorNode
addGenealogySpouseEdge
genealogyColumnsLayout
```

Cuidados:

- nÃ£o adicionar tÃ­tulo/subtÃ­tulo geral da Ã¡rvore;
- labels de geraÃ§Ã£o sÃ£o permitidas;
- altura pode exceder a viewport;
- preservar conectores entre pais e filhos;
- preservar status visual do anel de casamento;
- testar filtros de geraÃ§Ã£o apÃ³s mudanÃ§as.

---

### 3.4 `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Responsabilidade:

- explicar elementos visuais da Ã¡rvore;
- controlar filtros reais/camadas visuais quando recebe callbacks;
- renderizar modo compacto no painel lateral;
- renderizar modo expandido se necessÃ¡rio;
- mostrar cards, linhas, anel e cores dos grupos.

Props:

```txt
viewMode?: TreeViewMode
compact?: boolean
className?: string
showTitle?: boolean
edgeFilters?: EdgeFilters
onToggleEdgeFilter?: (...)
visualLineFilters?: VisualLineFilters
onToggleVisualLineFilter?: (...)
```

Estado atual da UX:

- subtÃ­tulo removido;
- â€œVisualizaÃ§Ã£o atualâ€ removida;
- card azul da view atual removido;
- seÃ§Ã£o â€œViewsâ€ removida;
- descriÃ§Ãµes internas dos itens removidas;
- â€œAtivaâ€ alterado para â€œEm relacionamentoâ€.

SeÃ§Ãµes atuais:

```txt
Cards
Linhas
Anel de casamento
Cores dos grupos
```

Camadas/filtros funcionais:

- `visualLineFilters.parentChildHighlight`;
- `visualLineFilters.siblingHighlight`;
- `parentChildHighlight` deve respeitar `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` deve respeitar `edgeFilters.irmaos`;
- estado padrÃ£o desligado mantÃ©m o visual original.

Cuidados:

- nÃ£o reintroduzir descriÃ§Ãµes redundantes sem decisÃ£o de UX;
- nÃ£o conectar a legenda a Supabase;
- nÃ£o alterar regra do status conjugal aqui;
- se adicionar item, validar painel lateral em mobile.

---

### 3.5 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidade:

- permitir seleÃ§Ã£o retangular de Ã¡rea visÃ­vel da Ã¡rvore;
- exportar seleÃ§Ã£o em PNG;
- exportar seleÃ§Ã£o em PDF;
- imprimir seleÃ§Ã£o;
- cancelar por botÃ£o ou `Esc`.

Props:

```txt
getTargetElement
filenameLabel
title
onClose
```

Regras implementadas:

- seleÃ§Ã£o mÃ­nima de 80x80px;
- limite mÃ¡ximo de exportaÃ§Ã£o estimado;
- toolbar contextual;
- bloqueia propagaÃ§Ã£o de eventos;
- exibe mensagens de erro locais;
- fecha apÃ³s exportaÃ§Ã£o bem-sucedida.

Cuidados:

- nÃ£o usar para exportar Ã¡rvore completa;
- nÃ£o salvar arquivo no Storage;
- nÃ£o criar log persistido;
- manter pan/zoom bloqueados enquanto overlay estiver aberto;
- manter `data-tree-selection-overlay="true"` para exclusÃ£o na captura.

---

### 3.6 Utils de exportaÃ§Ã£o da Ã¡rvore

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidade:

- gerar nome de arquivo;
- capturar elemento com `html2canvas`;
- sanitizar cores nÃ£o suportadas;
- recortar canvas;
- salvar PNG;
- gerar PDF;
- abrir janela de impressÃ£o;
- imprimir canvas;
- ignorar elementos que nÃ£o devem aparecer na exportaÃ§Ã£o.

FunÃ§Ãµes principais:

```txt
buildTreeExportFilename
getDefaultTreeExportIgnoreElements
captureElementToCanvas
cropCanvas
downloadCanvasAsPng
exportCanvasAsPdf
openTreePrintWindow
printCanvas
```

Elementos ignorados:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

Cuidados:

- preservar `useCORS: true`;
- preservar `allowTaint: false`;
- manter mensagens amigÃ¡veis para erro de CORS;
- nÃ£o remover sanitizaÃ§Ã£o de cores;
- nÃ£o capturar overlay/legenda/menus.

---

## 4. Nodes e edges da Ã¡rvore

Arquivos principais:

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
src/app/components/FamilyTree/DirectFamilyGroupBoxNode.tsx
src/app/components/FamilyTree/DirectFamilyAnchorNode.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/edges
```

Responsabilidades:

- `PersonNode`: card visual da pessoa;
- `DirectFamilyLabelNode`: labels de grupos/geraÃ§Ãµes;
- `DirectFamilyGroupBoxNode`: caixas visuais de agrupamento;
- `DirectFamilyAnchorNode`: pontos estruturais para edges;
- `GenealogyFamilyConnectorNode`: conectores ortogonais entre pais e filhos;
- `GenealogySpouseEdge`: linha conjugal com anel clicÃ¡vel.

Cuidados:

- nodes estruturais nÃ£o devem comandar zoom inicial;
- edges devem checar se source/target estÃ£o visÃ­veis;
- anel conjugal deve preservar clique no modal;
- observaÃ§Ãµes internas nÃ£o devem aparecer para usuÃ¡rio comum.

---

## 5. Componentes da Home

### 5.1 Componentes extraÃ­dos da Home

Pasta:

```txt
src/app/pages/home
```

Responsabilidade:

- reduzir o tamanho de `Home.tsx`;
- manter componentes visuais simples, tipados e orientados por props;
- preservar `Home.tsx` como orquestrador de estado, carregamento, filtros, IA, conexÃ£o e navegaÃ§Ã£o.

Componentes principais:

```txt
HomeHeader
HomeTreeSection
HomeMobileNav
DirectRelationKpiGrid
DirectRelativeFilterGrid
GenealogyFilterGrid
LifeStatusKpiGrid
SidebarPanelTabs
SidebarInfoPanel
HomeCuriositiesDialog
DiscoverResultCard
ContactInfo
ConnectionDiscoveryPanel
AiQuestionPanel
```

Auxiliares:

```txt
homeCuriositiesUtils
homeAiContext
```

Cuidados:

- nÃ£o mover estado principal para esses componentes sem decisÃ£o explÃ­cita;
- preservar textos, labels, `aria-labels`, classes Tailwind e ordem visual;
- manter `UserMenu` montado pela Home e repassado ao header por slot, salvo nova refatoraÃ§Ã£o deliberada;
- header e nav mobile devem receber o mesmo callback de troca de view;
- grids de filtros nÃ£o devem alterar chaves de filtros nem contadores recebidos por props.

## 6. Componentes de navegaÃ§Ã£o e menu

### 6.1 `AppLink`

Arquivo:

```txt
src/app/components/AppLink.tsx
```

Responsabilidade:

- padronizar links internos do app;
- evitar inconsistÃªncia entre navegaÃ§Ã£o por rota e links visuais.

Uso:

- headers;
- pÃ¡ginas internas;
- cards de navegaÃ§Ã£o;
- botÃµes com `to`.

Cuidados:

- ao remover import de `AppLink as Link`, confirmar se a pÃ¡gina ainda usa `<Link>`;
- erro conhecido corrigido: `Link is not defined` em `CalendarioFamiliar.tsx`.

### 6.2 `UserMenu`

Arquivo provÃ¡vel:

```txt
src/app/components/UserMenu.tsx
```

Responsabilidade:

- menu do usuÃ¡rio autenticado;
- atalhos de navegaÃ§Ã£o;
- acesso admin condicional;
- favoritos, notificaÃ§Ãµes, calendÃ¡rio, fÃ³rum e logout.

Uso principal:

```txt
src/app/pages/Home.tsx
```

Cuidados:

- botÃ£o admin apenas para admin;
- nÃ£o duplicar atalhos jÃ¡ presentes no header se isso causar overflow;
- preservar contagem de notificaÃ§Ãµes;
- preservar logout.

---

## 7. Componentes de pessoa

DocumentaÃ§Ã£o especÃ­fica de pessoas/perfil/admin:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

Arquivos principais:

```txt
src/app/components/person/PersonDataView.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/PersonDatesLocationsFields.tsx
src/app/components/person/SocialProfilesEditor.tsx
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/RelationshipFinder.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/utils/googleAddress.ts
src/app/pages/PersonProfile.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
```

Responsabilidades gerais:

- exibiÃ§Ã£o de dados pessoais;
- formulÃ¡rio de dados pessoais;
- datas e locais;
- privacidade;
- redes sociais;
- WhatsApp;
- eventos pessoais;
- grau de parentesco;
- dados gerados de astrologia/acontecimentos;
- autocomplete de endereÃ§o em formulÃ¡rios de contato.

Cuidados:

- perfil nÃ£o deve gerar IA automaticamente;
- WhatsApp nÃ£o deve revelar nÃºmero se privacidade nÃ£o permitir;
- campos de local exterior precisam preservar formato;
- `PersonContactFields` usa `AddressAutocompleteInput` para endereÃ§o;
- `AddressAutocompleteInput` usa Google Places quando `VITE_GOOGLE_MAPS_API_KEY` existe;
- `googleAddress.ts` centraliza a formataÃ§Ã£o de endereÃ§o selecionado;
- sem API key ou com falha do Google, o campo continua como input normal;
- botÃµes internos em formulÃ¡rios devem usar `type="button"`;
- componentes visuais nÃ£o devem persistir Supabase diretamente quando jÃ¡ existir service.

---

## 8. Componentes de relacionamentos

Arquivos principais:

```txt
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminRelacionamentoForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/MeusVinculos.tsx
```

Responsabilidades:

- criar/editar relacionamento;
- editar dados conjugais;
- abrir modal conjugal;
- criar solicitaÃ§Ã£o de vÃ­nculo para usuÃ¡rio comum;
- aprovar/rejeitar vÃ­nculo no admin.

Cuidados:

- usuÃ¡rio comum nÃ£o altera relacionamento real diretamente;
- observaÃ§Ãµes conjugais internas sÃ³ aparecem para admin;
- modal nÃ£o deve salvar antes do botÃ£o principal;
- rejeiÃ§Ã£o de solicitaÃ§Ã£o nÃ£o altera dado real;
- arquivos de relacionamento usam `relacionamento_id`.

---

## 9. Componentes de arquivos histÃ³ricos

Arquivos principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/components/FotoUpload.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
```

Responsabilidades:

- upload;
- preview;
- download;
- remoÃ§Ã£o;
- compatibilidade com base64 legado;
- arquivos de pessoa e relacionamento;
- ediÃ§Ã£o de tÃ­tulo, ano, descriÃ§Ã£o e categoria histÃ³rica.

Comportamento atual:

- aceita JPG, PNG, WebP e PDF;
- apÃ³s upload de novo arquivo, o input nativo fica oculto;
- campos e botÃµes **Cancelar**/**Adicionar** ficam ocultos imediatamente apÃ³s upload;
- mensagem verde **â€œâœ“ Arquivo carregadoâ€** permanece visÃ­vel;
- imagens mostram thumbnail;
- PDF mostra card com Ã­cone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- usuÃ¡rio pode preencher tÃ­tulo, descriÃ§Ã£o, ano e categoria depois do upload;
- arquivos existentes permitem editar tÃ­tulo, ano, descriÃ§Ã£o e categoria histÃ³rica.

Categoria histÃ³rica:

- tipo `HistoricalFileEventCategory`;
- campo `ArquivoHistorico.categoria_evento`;
- coluna `public.arquivos_historicos.categoria_evento`;
- valores aceitos: `certidao_nascimento`, `certidao_casamento`, `alistamento_militar`, `imigracao`, `divorcio`, `carreira_profissional`, `mudanca_cidade`, `certidao_obito`, `outro`.

Cuidados:

- novos arquivos devem ir para Storage;
- preview/download nÃ£o deve limpar formulÃ¡rio;
- botÃµes de visualizar/baixar/remover devem usar `type="button"`;
- nÃ£o apagar base64 legado automaticamente;
- nÃ£o criar limpeza automÃ¡tica de Ã³rfÃ£os sem auditoria;
- migration `20260522121000_add_historical_file_event_category.sql` precisa estar aplicada antes de deploy que envie `categoria_evento`.

---

## 10. Componentes de timeline

Arquivos principais:

```txt
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/pages/PersonProfile.tsx
```

Responsabilidades:

- exibir linha do tempo derivada;
- ordenar eventos;
- mostrar eventos de nascimento, falecimento, relacionamentos, filhos, arquivos e eventos pessoais;
- exibir estado vazio.

Cuidados:

- nÃ£o renderizar metadata bruta;
- preservar precisÃ£o de data;
- evitar duplicaÃ§Ã£o de eventos;
- ediÃ§Ã£o manual fica pÃ³s-MVP.

---

## 11. Componentes de favoritos

Arquivos principais:

```txt
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/services/favoritesService.ts
```

Responsabilidades:

- favoritar pessoa;
- remover favorito;
- listar favoritos;
- filtrar/buscar favoritos;
- abrir links internos.

Cuidados:

- metadata deve ser sanitizada no service;
- botÃ£o precisa ser clicÃ¡vel em mobile;
- isolamento por usuÃ¡rio depende de RLS/service;
- expansÃ£o para outras entidades fica pÃ³s-MVP.

---

## 12. Componentes de fÃ³rum

Arquivos principais:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum
src/app/services/forumService.ts
```

Responsabilidades:

- listar tÃ³picos;
- criar tÃ³pico;
- editar tÃ³pico;
- exibir tÃ³pico;
- respostas/comentÃ¡rios;
- categorias;
- aÃ§Ãµes de moderaÃ§Ã£o conforme permissÃ£o.

Cuidados:

- textos de usuÃ¡rio precisam quebrar linha;
- editores/textareas devem funcionar em mobile;
- aÃ§Ãµes destrutivas devem ser protegidas;
- manter filtros sem overflow.

---

## 13. Componentes de notificaÃ§Ãµes

DocumentaÃ§Ã£o especÃ­fica de notificaÃ§Ãµes:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Arquivos principais:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/userEngagementService.ts
src/app/services/notificationDispatchService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationScheduledService.ts
src/app/services/notificationAdminService.ts
```

Responsabilidades:

- `Notificacoes.tsx`: lista/central em cards, leitura, marcaÃ§Ã£o e remoÃ§Ã£o;
- `AjustarNotificacoes.tsx`: pÃ¡gina dedicada de preferÃªncias;
- `NotificationPreferencesPanel.tsx`: toggles e salvamento de preferÃªncias;
- administraÃ§Ã£o/testes;
- disparos internos/e-mail;
- logs e deduplicaÃ§Ã£o.

Cuidados:

- marcar/remover sempre filtrar por `id` e `user_id`;
- admin nÃ£o deve disparar massa por acidente;
- WhatsApp/push sem provider real devem retornar status nÃ£o configurado;
- preferÃªncias `false` nÃ£o devem ser sobrescritas por defaults.

---

## 14. Componentes administrativos

Arquivos principais:

```txt
src/app/pages/admin/AdminDashboard.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminRelacionamentoForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/admin/AdminAtividades.tsx
src/app/pages/admin/AdminIntegridade.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/pages/admin/AdminDiagnostico.tsx
src/app/pages/admin/AdminImportacao.tsx
src/app/pages/admin/AdminMigrarDados.tsx
src/app/pages/admin/AdminHomeSettings.tsx
```

Responsabilidades:

- administraÃ§Ã£o de dados;
- formulÃ¡rios longos;
- vÃ­nculo usuÃ¡rio-pessoa no card **UsuÃ¡rios vinculados a esta pessoa**;
- diagnÃ³stico;
- integridade;
- atividades;
- notificaÃ§Ãµes;
- home pÃºblica;
- importaÃ§Ã£o/migraÃ§Ã£o.

Cuidados:

- rotas admin devem usar `ProtectedRoute`;
- usuÃ¡rio comum nÃ£o deve acessar;
- `/admin/integridade` Ã© leitura/diagnÃ³stico;
- tabelas podem usar scroll horizontal controlado;
- formulÃ¡rios precisam ser operÃ¡veis em mobile;
- vÃ­nculo usuÃ¡rio-pessoa depende da RPC `admin_list_profiles_for_linking`;
- erro de listagem de usuÃ¡rios aparece inline no card;
- botÃ£o **Recarregar** deve permanecer disponÃ­vel para nova tentativa;
- dropdown de usuÃ¡rio fica desabilitado durante erro/loading;
- nÃ£o substituir falha da RPC por consulta direta insegura em `profiles`;
- aÃ§Ãµes destrutivas precisam de confirmaÃ§Ã£o.

---

## 15. Componentes UI base

Pasta:

```txt
src/app/components/ui
```

Componentes comuns:

```txt
button
input
textarea
select
dialog
checkbox
switch
label
card
badge
```

Regras:

- usar componentes UI base antes de criar botÃ£o/input prÃ³prio;
- preservar variantes existentes;
- nÃ£o quebrar classes responsivas;
- manter foco visÃ­vel;
- nÃ£o acoplar UI base a regras de negÃ³cio.

---

## 16. Componentes e estados vazios

PadrÃ£o esperado:

- toda pÃ¡gina com carregamento deve ter estado de loading;
- toda consulta vazia deve ter estado vazio compreensÃ­vel;
- erros devem explicar o problema sem expor stack/secrets;
- botÃµes de retry devem existir quando fizer sentido.

Exemplos de uso:

```txt
StateMessage em Home
ForumEmptyState no fÃ³rum
Estados vazios em MeusFavoritos, Notificacoes e Timeline
```

---

## 17. AlteraÃ§Ãµes recentes registradas

### 17.1 `MemberPageHeader`

- criado para padronizar headers internos;
- exporta `PAGE_CONTAINER_CLASS`;
- usado em pÃ¡ginas internas;
- Home pÃ³s-login ficou fora por ter header prÃ³prio.

### 17.2 `Home.tsx`

- header compacto mantido;
- busca expansÃ­vel preservada;
- painel lateral passou a ter controle Ãºnico;
- mobile passou a controlar painel acima da Ã¡rvore;
- botÃ£o duplicado de painel vindo da Ã¡rvore foi removido do fluxo principal.

### 17.3 `FamilyTree.tsx`

- refatorado para `FamilyTreeComponent` com `React.forwardRef`;
- adicionados bounds separados:
  - `getViewportContentBounds`;
  - `getTranslateBounds`;
- viewport inicial usa cards reais;
- Genealogia/VisÃ£o Completa usam largura, nÃ£o altura total;
- overlay fixo de tÃ­tulo/subtÃ­tulo centralizado;
- seleÃ§Ã£o de Ã¡rea permanece integrada;
- `TreeAreaSelectionOverlay` aparece quando `isAreaSelectionOpen`.

### 17.4 `genealogyColumnsLayout.ts`

- tÃ­tulo/subtÃ­tulo interno removido;
- labels de geraÃ§Ã£o preservadas;
- layout por colunas mantido;
- conectores e anÃ©is preservados.

### 17.5 `directFamilyDistributedLayout.ts`

- tÃ­tulo principal interno removido;
- labels de grupo preservadas;
- estrutura de grupos e boxes mantida.

### 17.6 `TreeLegend.tsx`

- componente simplificado;
- view atual removida;
- seÃ§Ã£o â€œViewsâ€ removida;
- descriÃ§Ãµes internas removidas;
- texto â€œEm relacionamentoâ€ consolidado.

---

## 18. Checklist antes de alterar componentes crÃ­ticos

Para componentes da Ã¡rvore:

```bash
npm run build
npm test
git diff --check
```

E validar manualmente:

- Minha Ãrvore;
- Genealogia;
- VisÃ£o Completa;
- zoom + e -;
- pan/arraste;
- painel lateral;
- aba Legendas;
- seleÃ§Ã£o/exportaÃ§Ã£o de Ã¡rea;
- modal conjugal;
- mobile.

Para componentes de formulÃ¡rio:

```bash
npm run build
npm test
git diff --check
```

E validar:

- salvar;
- cancelar;
- preview/download;
- rascunho;
- botÃµes internos;
- permissÃµes.

Para componentes admin:

- validar admin autenticado;
- validar usuÃ¡rio comum bloqueado;
- checar tabelas/listas em mobile;
- checar aÃ§Ãµes destrutivas;
- checar RLS quando houver service novo.

---

## 19. O que evitar

NÃ£o fazer:

- duplicar componente jÃ¡ existente;
- colocar chamada Supabase em componente puramente visual;
- criar title node da Ã¡rvore dentro de layouts;
- usar `git add .` sem checar arquivos temporÃ¡rios;
- commitar backups;
- alterar migrations em ajuste visual;
- remover `AppLink` sem procurar `<Link>`;
- remover `type="button"` de botÃµes internos;
- renderizar observaÃ§Ãµes internas para usuÃ¡rio comum;
- salvar telefone, e-mail, URL privada, base64, token ou secret em logs/metadata;
- expandir comportamento pÃ³s-MVP dentro de ajuste de componente.

---

## 20. Arquivos de referÃªncia rÃ¡pida

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/person
src/app/components/relationships
src/app/components/Timeline
src/app/components/favorites
src/app/components/forum
src/app/components/ui
```

---

## 21. AtualizaÃ§Ã£o recente â€” legenda, painel e linhas da Ã¡rvore

### 21.1 `TreeLegend` como legenda funcional

`TreeLegend` deixou de ser apenas informativa no painel lateral e tambÃ©m atua como controle visual/filtro, quando recebe callbacks.

Props relevantes atuais:

```txt
viewMode?
compact?
className?
showTitle?
personFilters?
edgeFilters?
directRelativeFilters?
visualLineFilters?
onTogglePersonFilter?
onToggleEdgeFilter?
onToggleDirectRelativeFilter?
onToggleVisualLineFilter?
```

Controles funcionais possÃ­veis:

- Pessoa viva;
- Falecida;
- Pet;
- Conjugal;
- Pais/filhos;
- IrmÃ£os;
- Cores dos grupos na Minha Ãrvore, quando aplicÃ¡vel;
- Destacar pais/filhos;
- Destacar irmÃ£os.

### 21.2 Camadas visuais opcionais

As camadas visuais opcionais usam:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Comportamento:

- **Destacar pais/filhos** usa linha amarela contÃ­nua;
- **Destacar irmÃ£os** usa linha amarela tracejada;
- ambas ficam desligadas por padrÃ£o;
- ambas respeitam os filtros legados de linhas.

### 21.3 `FamilyTree`

`FamilyTree` recebe `visualLineFilters` e repassa a configuraÃ§Ã£o para:

```txt
directFamilyDistributedLayout
genealogyColumnsLayout
GenealogyFamilyConnectorNode
```

TambÃ©m expÃµe via ref:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

### 21.4 Painel lateral da Home

O topo do painel lateral da Home tem toggle apenas para:

```txt
Filtros
Legendas
```

O painel **InformaÃ§Ãµes da Ã¡rvore** Ã© aberto pelo botÃ£o externo **AÃ§Ãµes**, com Ã­cone `Printer`.

A versÃ£o compacta da legenda removeu **Cores dos grupos** para caber melhor no painel lateral, mas mantÃ©m:

- Cards;
- Linhas;
- Camadas extras;
- Anel de casamento.

### 21.5 BotÃµes de zoom

Os botÃµes de zoom da Ã¡rvore ficam no canto superior direito da Ã¡rea da Ã¡rvore.
