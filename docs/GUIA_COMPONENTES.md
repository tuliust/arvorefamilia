# Guia de componentes  Arvore Familia

> Ultima atualizacao: 2026-05-29
> Local canonico: `docs/GUIA_COMPONENTES.md`

## Objetivo

Este documento registra os principais componentes reutilizaveis do projeto **Arvore Familia**, suas responsabilidades, arquivos relacionados, padroes de uso e cuidados contra regressoes.

Use este guia para:

- localizar rapidamente componentes relevantes;
- saber onde alterar UI sem mexer em regra de negocio;
- evitar duplicacao de componentes;
- preservar padroes de props, layout e acessibilidade;
- orientar novos prompts de implementacao.

Este documento nao substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: visao funcional consolidada.
- `docs/GUIA_UX_LAYOUT.md`: decisoes visuais e regras de layout.
- `docs/GUIA_CORRECAO_ERROS.md`: investigacao por sintoma.
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap e pos-MVP.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`: comportamento especifico da view Minha Arvore.
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: regra funcional de exportacao.

---

## Escopo deste guia

Este guia deve responder a tres perguntas:

1. **qual componente alterar**;
2. **qual responsabilidade ele possui**;
3. **quais cuidados evitam regressao**.

Quando a duvida envolver regra de negocio, Supabase, RLS, migrations ou fluxo de produto, consulte primeiro o documento funcional ou operacional correspondente. Componentes visuais nao devem se tornar ponto de entrada para regras de banco.

## 1. Convencoes gerais de componentes

### 1.1 Organizacao

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

Paginas ficam em:

```txt
src/app/pages
src/app/pages/admin
src/app/pages/forum
src/app/pages/home
```

Services, utils e types nao devem ser misturados com componentes:

```txt
src/app/services
src/app/utils
src/app/types
```

### 1.2 Regras de alteracao

Ao alterar componente:

- manter props tipadas;
- evitar logica de banco dentro do componente visual;
- usar services para Supabase;
- usar utils para calculo puro;
- nao introduzir side effects em componentes de exibicao;
- manter `type="button"` em botoes internos que nao fazem submit;
- preservar estados de loading/erro/vazio;
- preservar acessibilidade basica: `aria-label`, foco visivel e semantica.

### 1.3 Padroes de estilo

- Tailwind local no JSX;
- `min-w-0` em wrappers flex/grid;
- `shrink-0` em icones/avatares;
- `truncate` quando texto precisa caber em uma linha;
- `break-words` para conteudo de usuario;
- `break-all` para valores tecnicos;
- `w-full sm:w-auto` em botoes responsivos;
- modais com `max-h` e rolagem interna.

---

## 2. Componentes de layout

### 2.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Responsabilidade:

- padronizar header de paginas internas;
- fornecer titulo, subtitulo, icone e acoes;
- exportar classe global de container;
- exportar icones comuns para acoes.

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
icon: React.ComponentType
actions: HeaderAction[]
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

- paginas internas de usuario;
- paginas internas administrativas;
- paginas que precisam seguir o padrao visual de `/minha-arvore`.

Nao usar em:

- Home pos-login (`src/app/pages/Home.tsx`), que possui header proprio integrado A  arvore.

Cuidados:

- nao duplicar botoes de navegacao que ja existam no conteudo;
- manter textos curtos, pois o header trunca titulo/subtitulo;
- nao criar novo container se `PAGE_CONTAINER_CLASS` atender.

---

## 3. Componentes da arvore

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
- expor acoes imperativas;
- renderizar titulo/subtitulo fixo da arvore;
- integrar exportacao de area;
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

As rotas dedicadas da arvore devem continuar usando esses helpers para evitar divergencia entre URL e `viewMode`.

Acoes expostas via `ref`:

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
- titulo da arvore e overlay fixo no proprio componente;
- viewport inicial usa bounds de `personNode`;
- bounds de pan sao separados dos bounds de viewport;
- Genealogia/Visao Completa usam zoom por largura;
- selecao de area bloqueia pan/zoom temporariamente.

Cuidados:

- nao recolocar title nodes nos layouts;
- nao usar altura total para reduzir zoom de Genealogia/Visao Completa;
- nao incluir labels/group boxes/anchors no bounds visual de zoom;
- nao alterar filtros sem revisar `Home.tsx`;
- nao mexer em Supabase neste componente.

---

### 3.2 Layout `directFamilyDistributedLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidade:

- posicionar a view **Minha Arvore**;
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
- titulo geral da arvore nao deve ser criado aqui;
- group boxes e anchors nao devem comandar zoom inicial;
- alteracao de constantes de posicao pode afetar toda a composicao visual;
- validar em desktop e mobile apos qualquer mudanca.

---

### 3.3 Layout `genealogyColumnsLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidade:

- posicionar **Genealogia** e **Visao Completa**;
- agrupar pessoas por `manual_generation`;
- ordenar por data de nascimento e nome;
- posicionar conjuges;
- criar labels de geracao;
- criar conectores ortogonais de familia;
- criar edges conjugais com anel;
- aplicar filtros de geracao.

Funcoes/conceitos importantes:

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

- nao adicionar titulo/subtitulo geral da arvore;
- labels de geracao sao permitidas;
- altura pode exceder a viewport;
- preservar conectores entre pais e filhos;
- preservar status visual do anel de casamento;
- testar filtros de geracao apos mudancas.

---

### 3.4 `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Responsabilidade:

- explicar elementos visuais da arvore;
- controlar filtros reais/camadas visuais quando recebe callbacks;
- renderizar modo compacto no painel lateral;
- renderizar modo expandido se necessario;
- mostrar cards, linhas, anel e cores dos grupos.

Props:

```txt
viewMode: TreeViewMode
compact: boolean
className: string
showTitle: boolean
edgeFilters: EdgeFilters
onToggleEdgeFilter: (...)
visualLineFilters: VisualLineFilters
onToggleVisualLineFilter: (...)
```

Estado atual da UX:

- subtitulo removido;
- Visualizacao atual removida;
- card azul da view atual removido;
- secao Views removida;
- descricoes internas dos itens removidas;
- Ativa alterado para Em relacionamento.

Secoes atuais:

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
- estado padrao desligado mantem o visual original.

Cuidados:

- nao reintroduzir descricoes redundantes sem decisao de UX;
- nao conectar a legenda a Supabase;
- nao alterar regra do status conjugal aqui;
- se adicionar item, validar painel lateral em mobile.

---

### 3.5 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidade:

- permitir selecao retangular de area visivel da arvore;
- exportar selecao em PNG;
- exportar selecao em PDF;
- imprimir selecao;
- cancelar por botao ou `Esc`.

Props:

```txt
getTargetElement
filenameLabel
title
onClose
```

Regras implementadas:

- selecao minima de 80x80px;
- limite maximo de exportacao estimado;
- toolbar contextual;
- bloqueia propagacao de eventos;
- exibe mensagens de erro locais;
- fecha apos exportacao bem-sucedida.

Cuidados:

- nao usar para exportar arvore completa;
- nao salvar arquivo no Storage;
- nao criar log persistido;
- manter pan/zoom bloqueados enquanto overlay estiver aberto;
- manter `data-tree-selection-overlay="true"` para exclusao na captura.

---

### 3.6 Utils de exportacao da arvore

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidade:

- gerar nome de arquivo;
- capturar elemento com `html2canvas`;
- sanitizar cores nao suportadas;
- recortar canvas;
- salvar PNG;
- gerar PDF;
- abrir janela de impressao;
- imprimir canvas;
- ignorar elementos que nao devem aparecer na exportacao.

Funcoes principais:

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
- manter mensagens amigaveis para erro de CORS;
- nao remover sanitizacao de cores;
- nao capturar overlay/legenda/menus.

---

## 4. Nodes e edges da arvore

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
- `DirectFamilyLabelNode`: labels de grupos/geracoes;
- `DirectFamilyGroupBoxNode`: caixas visuais de agrupamento;
- `DirectFamilyAnchorNode`: pontos estruturais para edges;
- `GenealogyFamilyConnectorNode`: conectores ortogonais entre pais e filhos;
- `GenealogySpouseEdge`: linha conjugal com anel clicavel.

Cuidados:

- nodes estruturais nao devem comandar zoom inicial;
- edges devem checar se source/target estao visiveis;
- anel conjugal deve preservar clique no modal;
- observacoes internas nao devem aparecer para usuario comum.

---

## 5. Componentes da Home

### 5.1 Componentes extraidos da Home

Pasta:

```txt
src/app/pages/home
```

Responsabilidade:

- reduzir o tamanho de `Home.tsx`;
- manter componentes visuais simples, tipados e orientados por props;
- preservar `Home.tsx` como orquestrador de estado, carregamento, filtros, IA, conexao e navegacao.

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

- nao mover estado principal para esses componentes sem decisao explicita;
- preservar textos, labels, `aria-labels`, classes Tailwind e ordem visual;
- manter `UserMenu` montado pela Home e repassado ao header por slot, salvo nova refatoracao deliberada;
- header e nav mobile devem receber o mesmo callback de troca de view;
- grids de filtros nao devem alterar chaves de filtros nem contadores recebidos por props.

## 6. Componentes de navegacao e menu

### 6.1 `AppLink`

Arquivo:

```txt
src/app/components/AppLink.tsx
```

Responsabilidade:

- padronizar links internos do app;
- evitar inconsistencia entre navegacao por rota e links visuais.

Uso:

- headers;
- paginas internas;
- cards de navegacao;
- botoes com `to`.

Cuidados:

- ao remover import de `AppLink as Link`, confirmar se a pagina ainda usa `<Link>`;
- erro conhecido corrigido: `Link is not defined` em `CalendarioFamiliar.tsx`.

### 6.2 `UserMenu`

Arquivo provavel:

```txt
src/app/components/UserMenu.tsx
```

Responsabilidade:

- menu do usuario autenticado;
- atalhos de navegacao;
- acesso admin condicional;
- favoritos, notificacoes, calendario, forum e logout.

Uso principal:

```txt
src/app/pages/Home.tsx
```

Cuidados:

- botao admin apenas para admin;
- nao duplicar atalhos ja presentes no header se isso causar overflow;
- preservar contagem de notificacoes;
- preservar logout.

---

## 7. Componentes de pessoa

Documentacao especifica de pessoas/perfil/admin:

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

- exibicao de dados pessoais;
- formulario de dados pessoais;
- datas e locais;
- privacidade;
- redes sociais;
- WhatsApp;
- eventos pessoais;
- grau de parentesco;
- dados gerados de astrologia/acontecimentos;
- autocomplete de endereco em formularios de contato.

Cuidados:

- perfil nao deve gerar IA automaticamente;
- WhatsApp nao deve revelar numero se privacidade nao permitir;
- campos de local exterior precisam preservar formato;
- `PersonContactFields` usa `AddressAutocompleteInput` para endereco;
- `AddressAutocompleteInput` usa Google Places quando `VITE_GOOGLE_MAPS_API_KEY` existe;
- `googleAddress.ts` centraliza a formatacao de endereco selecionado;
- sem API key ou com falha do Google, o campo continua como input normal;
- botoes internos em formularios devem usar `type="button"`;
- componentes visuais nao devem persistir Supabase diretamente quando ja existir service.

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
- criar solicitacao de vinculo para usuario comum;
- aprovar/rejeitar vinculo no admin.

Cuidados:

- usuario comum nao altera relacionamento real diretamente;
- observacoes conjugais internas so aparecem para admin;
- modal nao deve salvar antes do botao principal;
- rejeicao de solicitacao nao altera dado real;
- arquivos de relacionamento usam `relacionamento_id`.

---

## 9. Componentes de arquivos historicos

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
- remocao;
- compatibilidade com base64 legado;
- arquivos de pessoa e relacionamento;
- edicao de titulo, ano, descricao e categoria historica.

Comportamento atual:

- aceita JPG, PNG, WebP e PDF;
- apos upload de novo arquivo, o input nativo fica oculto;
- campos e botoes **Cancelar**/**Adicionar** ficam ocultos imediatamente apos upload;
- mensagem verde **a Arquivo carregado** permanece visivel;
- imagens mostram thumbnail;
- PDF mostra card com icone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- usuario pode preencher titulo, descricao, ano e categoria depois do upload;
- arquivos existentes permitem editar titulo, ano, descricao e categoria historica.

Categoria historica:

- tipo `HistoricalFileEventCategory`;
- campo `ArquivoHistorico.categoria_evento`;
- coluna `public.arquivos_historicos.categoria_evento`;
- valores aceitos: `certidao_nascimento`, `certidao_casamento`, `alistamento_militar`, `imigracao`, `divorcio`, `carreira_profissional`, `mudanca_cidade`, `certidao_obito`, `outro`.

Cuidados:

- novos arquivos devem ir para Storage;
- preview/download nao deve limpar formulario;
- botoes de visualizar/baixar/remover devem usar `type="button"`;
- nao apagar base64 legado automaticamente;
- nao criar limpeza automatica de orfaos sem auditoria;
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

- nao renderizar metadata bruta;
- preservar precisao de data;
- evitar duplicacao de eventos;
- edicao manual fica pos-MVP.

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
- botao precisa ser clicavel em mobile;
- isolamento por usuario depende de RLS/service;
- expansao para outras entidades fica pos-MVP.

---

## 12. Componentes de forum

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

- listar topicos;
- criar topico;
- editar topico;
- exibir topico;
- respostas/comentarios;
- categorias;
- acoes de moderacao conforme permissao.

Cuidados:

- textos de usuario precisam quebrar linha;
- editores/textareas devem funcionar em mobile;
- acoes destrutivas devem ser protegidas;
- manter filtros sem overflow.

---

## 13. Componentes de notificacoes

Documentacao especifica de notificacoes:

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

- `Notificacoes.tsx`: lista/central em cards, leitura, marcacao e remocao;
- `AjustarNotificacoes.tsx`: pagina dedicada de preferencias;
- `NotificationPreferencesPanel.tsx`: toggles e salvamento de preferencias;
- administracao/testes;
- disparos internos/e-mail;
- logs e deduplicacao.

Cuidados:

- marcar/remover sempre filtrar por `id` e `user_id`;
- admin nao deve disparar massa por acidente;
- WhatsApp/push sem provider real devem retornar status nao configurado;
- preferencias `false` nao devem ser sobrescritas por defaults.

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

- administracao de dados;
- formularios longos;
- vinculo usuario-pessoa no card **Usuarios vinculados a esta pessoa**;
- diagnostico;
- integridade;
- atividades;
- notificacoes;
- home publica;
- importacao/migracao.

Cuidados:

- rotas admin devem usar `ProtectedRoute`;
- usuario comum nao deve acessar;
- `/admin/integridade` e leitura/diagnostico;
- tabelas podem usar scroll horizontal controlado;
- formularios precisam ser operaveis em mobile;
- vinculo usuario-pessoa depende da RPC `admin_list_profiles_for_linking`;
- erro de listagem de usuarios aparece inline no card;
- botao **Recarregar** deve permanecer disponivel para nova tentativa;
- dropdown de usuario fica desabilitado durante erro/loading;
- nao substituir falha da RPC por consulta direta insegura em `profiles`;
- acoes destrutivas precisam de confirmacao.

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

- usar componentes UI base antes de criar botao/input proprio;
- preservar variantes existentes;
- nao quebrar classes responsivas;
- manter foco visivel;
- nao acoplar UI base a regras de negocio.

---

## 16. Componentes e estados vazios

Padrao esperado:

- toda pagina com carregamento deve ter estado de loading;
- toda consulta vazia deve ter estado vazio compreensivel;
- erros devem explicar o problema sem expor stack/secrets;
- botoes de retry devem existir quando fizer sentido.

Exemplos de uso:

```txt
StateMessage em Home
ForumEmptyState no forum
Estados vazios em MeusFavoritos, Notificacoes e Timeline
```

---

## 17. Alteracoes recentes registradas

### 17.1 `MemberPageHeader`

- criado para padronizar headers internos;
- exporta `PAGE_CONTAINER_CLASS`;
- usado em paginas internas;
- Home pos-login ficou fora por ter header proprio.

### 17.2 `Home.tsx`

- header compacto mantido;
- busca expansivel preservada;
- painel lateral passou a ter controle unico;
- mobile passou a controlar painel acima da arvore;
- botao duplicado de painel vindo da arvore foi removido do fluxo principal.

### 17.3 `FamilyTree.tsx`

- refatorado para `FamilyTreeComponent` com `React.forwardRef`;
- adicionados bounds separados:
  - `getViewportContentBounds`;
  - `getTranslateBounds`;
- viewport inicial usa cards reais;
- Genealogia/Visao Completa usam largura, nao altura total;
- overlay fixo de titulo/subtitulo centralizado;
- selecao de area permanece integrada;
- `TreeAreaSelectionOverlay` aparece quando `isAreaSelectionOpen`.

### 17.4 `genealogyColumnsLayout.ts`

- titulo/subtitulo interno removido;
- labels de geracao preservadas;
- layout por colunas mantido;
- conectores e aneis preservados.

### 17.5 `directFamilyDistributedLayout.ts`

- titulo principal interno removido;
- labels de grupo preservadas;
- estrutura de grupos e boxes mantida.

### 17.6 `TreeLegend.tsx`

- componente simplificado;
- view atual removida;
- secao Views removida;
- descricoes internas removidas;
- texto Em relacionamento consolidado.

---

## 18. Checklist antes de alterar componentes criticos

Para componentes da arvore:

```bash
npm run build
npm test
git diff --check
```

E validar manualmente:

- Minha Arvore;
- Genealogia;
- Visao Completa;
- zoom + e -;
- pan/arraste;
- painel lateral;
- aba Legendas;
- selecao/exportacao de area;
- modal conjugal;
- mobile.

Para componentes de formulario:

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
- botoes internos;
- permissoes.

Para componentes admin:

- validar admin autenticado;
- validar usuario comum bloqueado;
- checar tabelas/listas em mobile;
- checar acoes destrutivas;
- checar RLS quando houver service novo.

---

## 19. O que evitar

Nao fazer:

- duplicar componente ja existente;
- colocar chamada Supabase em componente puramente visual;
- criar title node da arvore dentro de layouts;
- usar `git add .` sem checar arquivos temporarios;
- commitar backups;
- alterar migrations em ajuste visual;
- remover `AppLink` sem procurar `<Link>`;
- remover `type="button"` de botoes internos;
- renderizar observacoes internas para usuario comum;
- salvar telefone, e-mail, URL privada, base64, token ou secret em logs/metadata;
- expandir comportamento pos-MVP dentro de ajuste de componente.

---

## 20. Arquivos de referencia rapida

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

## 21. Atualizacao recente  legenda, painel e linhas da arvore

### 21.1 `TreeLegend` como legenda funcional

`TreeLegend` deixou de ser apenas informativa no painel lateral e tambem atua como controle visual/filtro, quando recebe callbacks.

Props relevantes atuais:

```txt
viewMode
compact
className
showTitle
personFilters
edgeFilters
directRelativeFilters
visualLineFilters
onTogglePersonFilter
onToggleEdgeFilter
onToggleDirectRelativeFilter
onToggleVisualLineFilter
```

Controles funcionais possiveis:

- Pessoa viva;
- Falecida;
- Pet;
- Conjugal;
- Pais/filhos;
- Irmaos;
- Cores dos grupos na Minha Arvore, quando aplicavel;
- Destacar pais/filhos;
- Destacar irmaos.

### 21.2 Camadas visuais opcionais

As camadas visuais opcionais usam:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Comportamento:

- **Destacar pais/filhos** usa linha amarela continua;
- **Destacar irmaos** usa linha amarela tracejada;
- ambas ficam desligadas por padrao;
- ambas respeitam os filtros legados de linhas.

### 21.3 `FamilyTree`

`FamilyTree` recebe `visualLineFilters` e repassa a configuracao para:

```txt
directFamilyDistributedLayout
genealogyColumnsLayout
GenealogyFamilyConnectorNode
```

Tambem expoe via ref:

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

O painel **Informacoes da arvore** e aberto pelo botao externo **Acoes**, com icone `Printer`.

A versao compacta da legenda removeu **Cores dos grupos** para caber melhor no painel lateral, mas mantem:

- Cards;
- Linhas;
- Camadas extras;
- Anel de casamento.

### 21.5 Botoes de zoom

Os botoes de zoom da arvore ficam no canto superior direito da area da arvore.
