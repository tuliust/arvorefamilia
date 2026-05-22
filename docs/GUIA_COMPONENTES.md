# Guia de componentes — Árvore Família

## Objetivo

Este documento registra os principais componentes reutilizáveis do projeto **Árvore Família**, suas responsabilidades, arquivos relacionados, padrões de uso e cuidados contra regressões.

Use este guia para:

- localizar rapidamente componentes relevantes;
- saber onde alterar UI sem mexer em regra de negócio;
- evitar duplicação de componentes;
- preservar padrões de props, layout e acessibilidade;
- orientar novos prompts de implementação.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: visão funcional consolidada.
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais e regras de layout.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma.
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap e pós-MVP.

---

## 1. Convenções gerais de componentes

### 1.1 Organização

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

Páginas ficam em:

```txt
src/app/pages
src/app/pages/admin
src/app/pages/forum
```

Services, utils e types não devem ser misturados com componentes:

```txt
src/app/services
src/app/utils
src/app/types
```

### 1.2 Regras de alteração

Ao alterar componente:

- manter props tipadas;
- evitar lógica de banco dentro do componente visual;
- usar services para Supabase;
- usar utils para cálculo puro;
- não introduzir side effects em componentes de exibição;
- manter `type="button"` em botões internos que não fazem submit;
- preservar estados de loading/erro/vazio;
- preservar acessibilidade básica: `aria-label`, foco visível e semântica.

### 1.3 Padrões de estilo

- Tailwind local no JSX;
- `min-w-0` em wrappers flex/grid;
- `shrink-0` em ícones/avatares;
- `truncate` quando texto precisa caber em uma linha;
- `break-words` para conteúdo de usuário;
- `break-all` para valores técnicos;
- `w-full sm:w-auto` em botões responsivos;
- modais com `max-h` e rolagem interna.

---

## 2. Componentes de layout

## 2.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Responsabilidade:

- padronizar header de páginas internas;
- fornecer título, subtítulo, ícone e ações;
- exportar classe global de container;
- exportar ícones comuns para ações.

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

- páginas internas de usuário;
- páginas internas administrativas;
- páginas que precisam seguir o padrão visual de `/minha-arvore`.

Não usar em:

- Home pós-login (`src/app/pages/Home.tsx`), que possui header próprio integrado à árvore.

Cuidados:

- não duplicar botões de navegação que já existam no conteúdo;
- manter textos curtos, pois o header trunca título/subtítulo;
- não criar novo container se `PAGE_CONTAINER_CLASS` atender.

---

## 3. Componentes da árvore

## 3.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar React Flow;
- selecionar layout conforme view;
- gerenciar viewport inicial;
- controlar pan/zoom;
- expor ações imperativas;
- renderizar título/subtítulo fixo da árvore;
- integrar exportação de área;
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

Ações expostas via `ref`:

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
- título da árvore é overlay fixo no próprio componente;
- viewport inicial usa bounds de `personNode`;
- bounds de pan são separados dos bounds de viewport;
- Genealogia/Visão Completa usam zoom por largura;
- seleção de área bloqueia pan/zoom temporariamente.

Cuidados:

- não recolocar title nodes nos layouts;
- não usar altura total para reduzir zoom de Genealogia/Visão Completa;
- não incluir labels/group boxes/anchors no bounds visual de zoom;
- não alterar filtros sem revisar `Home.tsx`;
- não mexer em Supabase neste componente.

---

## 3.2 Layout `directFamilyDistributedLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidade:

- posicionar a view **Minha Árvore**;
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
- título geral da árvore não deve ser criado aqui;
- group boxes e anchors não devem comandar zoom inicial;
- alteração de constantes de posição pode afetar toda a composição visual;
- validar em desktop e mobile após qualquer mudança.

---

## 3.3 Layout `genealogyColumnsLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidade:

- posicionar **Genealogia** e **Visão Completa**;
- agrupar pessoas por `manual_generation`;
- ordenar por data de nascimento e nome;
- posicionar cônjuges;
- criar labels de geração;
- criar conectores ortogonais de família;
- criar edges conjugais com anel;
- aplicar filtros de geração.

Funções/conceitos importantes:

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

- não adicionar título/subtítulo geral da árvore;
- labels de geração são permitidas;
- altura pode exceder a viewport;
- preservar conectores entre pais e filhos;
- preservar status visual do anel de casamento;
- testar filtros de geração após mudanças.

---

## 3.4 `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Responsabilidade:

- explicar elementos visuais da árvore;
- controlar filtros reais/camadas visuais quando recebe callbacks;
- renderizar modo compacto no painel lateral;
- renderizar modo expandido se necessário;
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

- subtítulo removido;
- “Visualização atual” removida;
- card azul da view atual removido;
- seção “Views” removida;
- descrições internas dos itens removidas;
- “Ativa” alterado para “Em relacionamento”.

Seções atuais:

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
- estado padrão desligado mantém o visual original.

Cuidados:

- não reintroduzir descrições redundantes sem decisão de UX;
- não conectar a legenda a Supabase;
- não alterar regra do status conjugal aqui;
- se adicionar item, validar painel lateral em mobile.

---

## 3.5 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidade:

- permitir seleção retangular de área visível da árvore;
- exportar seleção em PNG;
- exportar seleção em PDF;
- imprimir seleção;
- cancelar por botão ou `Esc`.

Props:

```txt
getTargetElement
filenameLabel
title
onClose
```

Regras implementadas:

- seleção mínima de 80x80px;
- limite máximo de exportação estimado;
- toolbar contextual;
- bloqueia propagação de eventos;
- exibe mensagens de erro locais;
- fecha após exportação bem-sucedida.

Cuidados:

- não usar para exportar árvore completa;
- não salvar arquivo no Storage;
- não criar log persistido;
- manter pan/zoom bloqueados enquanto overlay estiver aberto;
- manter `data-tree-selection-overlay="true"` para exclusão na captura.

---

## 3.6 Utils de exportação da árvore

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidade:

- gerar nome de arquivo;
- capturar elemento com `html2canvas`;
- sanitizar cores não suportadas;
- recortar canvas;
- salvar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- ignorar elementos que não devem aparecer na exportação.

Funções principais:

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
- manter mensagens amigáveis para erro de CORS;
- não remover sanitização de cores;
- não capturar overlay/legenda/menus.

---

## 4. Nodes e edges da árvore

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
- `DirectFamilyLabelNode`: labels de grupos/gerações;
- `DirectFamilyGroupBoxNode`: caixas visuais de agrupamento;
- `DirectFamilyAnchorNode`: pontos estruturais para edges;
- `GenealogyFamilyConnectorNode`: conectores ortogonais entre pais e filhos;
- `GenealogySpouseEdge`: linha conjugal com anel clicável.

Cuidados:

- nodes estruturais não devem comandar zoom inicial;
- edges devem checar se source/target estão visíveis;
- anel conjugal deve preservar clique no modal;
- observações internas não devem aparecer para usuário comum.

---

## 5. Componentes de navegação e menu

## 5.1 `AppLink`

Arquivo:

```txt
src/app/components/AppLink.tsx
```

Responsabilidade:

- padronizar links internos do app;
- evitar inconsistência entre navegação por rota e links visuais.

Uso:

- headers;
- páginas internas;
- cards de navegação;
- botões com `to`.

Cuidados:

- ao remover import de `AppLink as Link`, confirmar se a página ainda usa `<Link>`;
- erro conhecido corrigido: `Link is not defined` em `CalendarioFamiliar.tsx`.

## 5.2 `UserMenu`

Arquivo provável:

```txt
src/app/components/UserMenu.tsx
```

Responsabilidade:

- menu do usuário autenticado;
- atalhos de navegação;
- acesso admin condicional;
- favoritos, notificações, calendário, fórum e logout.

Uso principal:

```txt
src/app/pages/Home.tsx
```

Cuidados:

- botão admin apenas para admin;
- não duplicar atalhos já presentes no header se isso causar overflow;
- preservar contagem de notificações;
- preservar logout.

---

## 6. Componentes de pessoa

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

- exibição de dados pessoais;
- formulário de dados pessoais;
- datas e locais;
- privacidade;
- redes sociais;
- WhatsApp;
- eventos pessoais;
- grau de parentesco;
- dados gerados de astrologia/acontecimentos;
- autocomplete de endereço em formulários de contato.

Cuidados:

- perfil não deve gerar IA automaticamente;
- WhatsApp não deve revelar número se privacidade não permitir;
- campos de local exterior precisam preservar formato;
- `PersonContactFields` usa `AddressAutocompleteInput` para endereço;
- `AddressAutocompleteInput` usa Google Places quando `VITE_GOOGLE_MAPS_API_KEY` existe;
- `googleAddress.ts` centraliza a formatação de endereço selecionado;
- sem API key ou com falha do Google, o campo continua como input normal;
- botões internos em formulários devem usar `type="button"`;
- componentes visuais não devem persistir Supabase diretamente quando já existir service.

---

## 7. Componentes de relacionamentos

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
- criar solicitação de vínculo para usuário comum;
- aprovar/rejeitar vínculo no admin.

Cuidados:

- usuário comum não altera relacionamento real diretamente;
- observações conjugais internas só aparecem para admin;
- modal não deve salvar antes do botão principal;
- rejeição de solicitação não altera dado real;
- arquivos de relacionamento usam `relacionamento_id`.

---

## 8. Componentes de arquivos históricos

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
- remoção;
- compatibilidade com base64 legado;
- arquivos de pessoa e relacionamento;
- edição de título, ano, descrição e categoria histórica.

Comportamento atual:

- aceita JPG, PNG, WebP e PDF;
- após upload de novo arquivo, o input nativo fica oculto;
- campos e botões **Cancelar**/**Adicionar** ficam ocultos imediatamente após upload;
- mensagem verde **“✓ Arquivo carregado”** permanece visível;
- imagens mostram thumbnail;
- PDF mostra card com ícone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- usuário pode preencher título, descrição, ano e categoria depois do upload;
- arquivos existentes permitem editar título, ano, descrição e categoria histórica.

Categoria histórica:

- tipo `HistoricalFileEventCategory`;
- campo `ArquivoHistorico.categoria_evento`;
- coluna `public.arquivos_historicos.categoria_evento`;
- valores aceitos: `certidao_nascimento`, `certidao_casamento`, `alistamento_militar`, `imigracao`, `divorcio`, `carreira_profissional`, `mudanca_cidade`, `certidao_obito`, `outro`.

Cuidados:

- novos arquivos devem ir para Storage;
- preview/download não deve limpar formulário;
- botões de visualizar/baixar/remover devem usar `type="button"`;
- não apagar base64 legado automaticamente;
- não criar limpeza automática de órfãos sem auditoria.
- migration `20260522121000_add_historical_file_event_category.sql` precisa estar aplicada antes de deploy que envie `categoria_evento`.

---

## 9. Componentes de timeline

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

- não renderizar metadata bruta;
- preservar precisão de data;
- evitar duplicação de eventos;
- edição manual fica pós-MVP.

---

## 10. Componentes de favoritos

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
- botão precisa ser clicável em mobile;
- isolamento por usuário depende de RLS/service;
- expansão para outras entidades fica pós-MVP.

---

## 11. Componentes de fórum

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

- listar tópicos;
- criar tópico;
- editar tópico;
- exibir tópico;
- respostas/comentários;
- categorias;
- ações de moderação conforme permissão.

Cuidados:

- textos de usuário precisam quebrar linha;
- editores/textareas devem funcionar em mobile;
- ações destrutivas devem ser protegidas;
- manter filtros sem overflow.

---

## 12. Componentes de notificações

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

- `Notificacoes.tsx`: lista/central em cards, leitura, marcação e remoção;
- `AjustarNotificacoes.tsx`: página dedicada de preferências;
- `NotificationPreferencesPanel.tsx`: toggles e salvamento de preferências;
- administração/testes;
- disparos internos/e-mail;
- logs e deduplicação.

Cuidados:

- marcar/remover sempre filtrar por `id` e `user_id`;
- admin não deve disparar massa por acidente;
- WhatsApp/push sem provider real devem retornar status não configurado;
- preferências `false` não devem ser sobrescritas por defaults.

---

## 13. Componentes administrativos

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

- administração de dados;
- formulários longos;
- vínculo usuário-pessoa no card **Usuários vinculados a esta pessoa**;
- diagnóstico;
- integridade;
- atividades;
- notificações;
- home pública;
- importação/migração.

Cuidados:

- rotas admin devem usar `ProtectedRoute`;
- usuário comum não deve acessar;
- `/admin/integridade` é leitura/diagnóstico;
- tabelas podem usar scroll horizontal controlado;
- formulários precisam ser operáveis em mobile;
- vínculo usuário-pessoa depende da RPC `admin_list_profiles_for_linking`;
- erro de listagem de usuários aparece inline no card;
- botão **Recarregar** deve permanecer disponível para nova tentativa;
- dropdown de usuário fica desabilitado durante erro/loading;
- não substituir falha da RPC por consulta direta insegura em `profiles`;
- ações destrutivas precisam de confirmação.

---

## 14. Componentes UI base

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

- usar componentes UI base antes de criar botão/input próprio;
- preservar variantes existentes;
- não quebrar classes responsivas;
- manter foco visível;
- não acoplar UI base a regras de negócio.

---

## 15. Componentes e estados vazios

Padrão esperado:

- toda página com carregamento deve ter estado de loading;
- toda consulta vazia deve ter estado vazio compreensível;
- erros devem explicar o problema sem expor stack/secrets;
- botões de retry devem existir quando fizer sentido.

Exemplos de uso:

```txt
StateMessage em Home
ForumEmptyState no fórum
Estados vazios em MeusFavoritos, Notificacoes e Timeline
```

---

## 16. Alterações recentes registradas

### 16.1 `MemberPageHeader`

- criado para padronizar headers internos;
- exporta `PAGE_CONTAINER_CLASS`;
- usado em páginas internas;
- Home pós-login ficou fora por ter header próprio.

### 16.2 `Home.tsx`

- header compacto mantido;
- busca expansível preservada;
- painel lateral passou a ter controle único;
- mobile passou a controlar painel acima da árvore;
- botão duplicado de painel vindo da árvore foi removido do fluxo principal.

### 16.3 `FamilyTree.tsx`

- refatorado para `FamilyTreeComponent` com `React.forwardRef`;
- adicionados bounds separados:
  - `getViewportContentBounds`;
  - `getTranslateBounds`;
- viewport inicial usa cards reais;
- Genealogia/Visão Completa usam largura, não altura total;
- overlay fixo de título/subtítulo centralizado;
- seleção de área permanece integrada;
- `TreeAreaSelectionOverlay` aparece quando `isAreaSelectionOpen`.

### 16.4 `genealogyColumnsLayout.ts`

- título/subtítulo interno removido;
- labels de geração preservadas;
- layout por colunas mantido;
- conectores e anéis preservados.

### 16.5 `directFamilyDistributedLayout.ts`

- título principal interno removido;
- labels de grupo preservadas;
- estrutura de grupos e boxes mantida.

### 16.6 `TreeLegend.tsx`

- componente simplificado;
- view atual removida;
- seção “Views” removida;
- descrições internas removidas;
- texto “Em relacionamento” consolidado.

---

## 17. Checklist antes de alterar componentes críticos

Para componentes da árvore:

```bash
npm run build
npm test
git diff --check
```

E validar manualmente:

- Minha Árvore;
- Genealogia;
- Visão Completa;
- zoom + e -;
- pan/arraste;
- painel lateral;
- aba Legendas;
- seleção/exportação de área;
- modal conjugal;
- mobile.

Para componentes de formulário:

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
- botões internos;
- permissões.

Para componentes admin:

- validar admin autenticado;
- validar usuário comum bloqueado;
- checar tabelas/listas em mobile;
- checar ações destrutivas;
- checar RLS quando houver service novo.

---

## 18. O que evitar

Não fazer:

- duplicar componente já existente;
- colocar chamada Supabase em componente puramente visual;
- criar title node da árvore dentro de layouts;
- usar `git add .` sem checar arquivos temporários;
- commitar backups;
- alterar migrations em ajuste visual;
- remover `AppLink` sem procurar `<Link>`;
- remover `type="button"` de botões internos;
- renderizar observações internas para usuário comum;
- salvar telefone, e-mail, URL privada, base64, token ou secret em logs/metadata;
- expandir comportamento pós-MVP dentro de ajuste de componente.

---

## 19. Arquivos de referência rápida

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

## 20. Atualização recente — legenda, painel e linhas da árvore

### 20.1 `TreeLegend` como legenda funcional

`TreeLegend` deixou de ser apenas informativa no painel lateral e também atua como controle visual/filtro, quando recebe callbacks.

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

Controles funcionais possíveis:

- Pessoa viva;
- Falecida;
- Pet;
- Conjugal;
- Pais/filhos;
- Irmãos;
- Cores dos grupos na Minha Árvore, quando aplicável;
- Destacar pais/filhos;
- Destacar irmãos.

### 20.2 Camadas visuais opcionais

As camadas visuais opcionais usam:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Comportamento:

- **Destacar pais/filhos** usa linha amarela contínua;
- **Destacar irmãos** usa linha amarela tracejada;
- ambas ficam desligadas por padrão;
- ambas respeitam os filtros legados de linhas.

### 20.3 `FamilyTree`

`FamilyTree` recebe `visualLineFilters` e repassa a configuração para:

```txt
directFamilyDistributedLayout
genealogyColumnsLayout
GenealogyFamilyConnectorNode
```

Também expõe via ref:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

### 20.4 Painel lateral da Home

O topo do painel lateral da Home tem toggle apenas para:

```txt
Filtros
Legendas
```

O painel **Informações da árvore** é aberto pelo botão externo **Ações**, com ícone `Printer`.

A versão compacta da legenda removeu **Cores dos grupos** para caber melhor no painel lateral, mas mantém:

- Cards;
- Linhas;
- Camadas extras;
- Anel de casamento.

### 20.5 Botões de zoom

Os botões de zoom da árvore ficam no canto superior direito da área da árvore.
