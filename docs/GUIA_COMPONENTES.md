# Guia de componentes - Árvore Família

> Última atualização: 2026-06-08  
> Local canônico: `docs/GUIA_COMPONENTES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico revisado para manutenção final.

## Objetivo

Este documento identifica os principais componentes reutilizáveis do projeto **Árvore Família**, suas responsabilidades, arquivos relacionados e cuidados contra regressões.

Use este guia para decidir **qual componente alterar** antes de editar UI, layout, responsividade ou padrões de interação.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventário consolidado das funcionalidades;
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais e padrões de layout;
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: migrations, Supabase e operação;
- `docs/funcionalidades/*.md`: comportamento detalhado por funcionalidade.

---

## 1. Convenções gerais

### 1.1 Organização

| Área | Caminho |
|---|---|
| Componentes gerais | `src/app/components/` |
| UI base | `src/app/components/ui/` |
| Layout/header/menu | `src/app/components/layout/` |
| Árvore | `src/app/components/FamilyTree/` |
| Pessoa/perfil | `src/app/components/person/` |
| Relacionamentos | `src/app/components/relationships/` |
| Timeline | `src/app/components/Timeline/` |
| Favoritos | `src/app/components/favorites/` |
| Páginas da Home pós-login | `src/app/pages/home/` |
| Fórum | `src/app/pages/forum/` e services relacionados |

Services, utils e types devem permanecer fora de componentes visuais:

```txt
src/app/services/
src/app/utils/
src/app/types/
```

### 1.2 Regras de alteração

Ao alterar componente:

- manter props tipadas;
- não inserir lógica de banco em componente visual;
- usar `services` para Supabase;
- usar `utils` para cálculo puro;
- preservar loading, erro e estado vazio;
- usar `type="button"` em botões internos que não submetem formulário;
- preservar `aria-label`, foco visível e navegação básica por teclado;
- validar `npm run build` e `git diff --check`.

### 1.3 Padrões visuais

- `min-w-0` em wrappers flex/grid;
- `shrink-0` em ícones e avatares;
- `truncate` quando o texto precisa ficar em uma linha;
- `break-words` para conteúdo de usuário;
- `break-all` para valores técnicos longos;
- `w-full sm:w-auto` em botões responsivos;
- modais com altura máxima e rolagem interna.

---

## 2. Layout, header e menu

### 2.1 `MemberPageHeader`

Arquivo:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Exports principais:

```txt
MemberPageHeader
PAGE_CONTAINER_CLASS
HEADER_ACTION_ICONS
```

Responsabilidade:

- padronizar headers de páginas internas;
- renderizar título, subtítulo, ícone e ações;
- exportar `PAGE_CONTAINER_CLASS`;
- renderizar `UserProfileMenu` padrão;
- renderizar navegação inferior mobile fixa.

Props relevantes:

```txt
title
subtitle
icon
actions
customActions
mobileCustomActions
className
```

`HeaderAction` aceita:

```txt
label
to
onClick
icon
variant: default | primary | danger | ghost
responsiveLabel: always | lg | xl | never
disabled
```

Cuidados:

- não usar em `src/app/pages/Home.tsx`, que possui `HomeHeader`;
- não criar container divergente quando `PAGE_CONTAINER_CLASS` atender;
- manter textos curtos porque título/subtítulo truncam em telas estreitas;
- ações devem ser links/botões acessíveis;
- preservar `MemberMobileBottomNav` em mobile.

### 2.2 `UserProfileMenu`

Arquivo:

```txt
src/app/components/layout/UserProfileMenu.tsx
```

Variantes:

```txt
avatar
home-header
```

Responsabilidade:

- exibir botão de menu do usuário;
- carregar dados do perfil, pessoa vinculada e status admin;
- abrir painel compartilhado de navegação;
- direcionar o cabeçalho do painel para `/minha-arvore/editar`;
- limpar cache da árvore no logout.

Comportamento consolidado:

- páginas internas usam `UserProfileMenu` padrão;
- o header da árvore usa `UserProfileMenu variant="home-header"`;
- o menu mobile inclui bloco de troca de view da árvore;
- o item **Editar notificações** não existe mais;
- **Painel Admin** aparece apenas para administradores;
- **Sair** executa logout e limpa `treeDataCache`.

Cuidados:

- não recriar dropdown local dentro de `Home.tsx`;
- não fazer o botão de fechar navegar para perfil;
- preservar fechamento por clique fora e `Escape`;
- não expor rota admin para usuário comum apenas por ocultação visual.

### 2.3 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidade:

- header específico das views da árvore;
- seletor de view: `/minha-arvore`, `/genealogia`, `/visao-completa`;
- seletor de paletas `white`, `orange`, `brown`;
- busca expansível por pessoa e página;
- atalhos para curiosidades, fórum e calendário;
- menu compacto do usuário.

Arquivos relacionados:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/layout/UserProfileMenu.tsx
```

Cuidados:

- preservar search params, especialmente `?pessoa=...`;
- troca de paleta só altera CSS variables e `localStorage`;
- não alterar rota, dados, filtros, permissões ou Supabase ao trocar paleta;
- manter sugestões de busca acima da árvore;
- garantir estado React para `treeColorPalette` antes de renderizar botões de paleta;
- não reintroduzir `UserMenu` local legado.

---

## 3. Árvore familiar

### 3.1 `FamilyTree`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- renderizar React Flow;
- selecionar layout por `viewMode`;
- calcular viewport inicial;
- controlar pan/zoom;
- expor ações imperativas;
- renderizar título fixo da árvore;
- integrar seleção/exportação de área;
- integrar clique em pessoa e em relacionamento conjugal.

Props principais:

```txt
pessoas
relacionamentos
visiblePersonIds
viewMode
centralPersonId
selectedPersonId
edgeFilters
directRelativeFilters
genealogyFilters
visualLineFilters
activeGenealogyGeneration
isMobile
layoutRevision
onPersonClick
onPersonView
onPersonEdit
onPersonAddConnection
onPersonRemove
onMarriageClick
onDirectRelationRenderedCounts
```

Ações expostas via ref:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Comportamento por view:

| `viewMode` | Layout |
|---|---|
| `minha-arvore` | `directFamilyDistributedLayout` |
| `genealogia` | `genealogyColumnsLayout` com escopo pessoal |
| `visao-completa` | `genealogyColumnsLayout` com base completa |

Cuidados:

- não recolocar título geral dentro dos layouts;
- não usar `transform`, `translate` ou `top` negativo em `.react-flow__viewport` para resolver espaçamento;
- não persistir no Supabase a inferência visual de gerações;
- não transformar `activeGenealogyGeneration` em filtro destrutivo;
- não misturar pan/zoom do React Flow com scroll externo da página;
- seleção de área deve bloquear pan/zoom temporariamente.

### 3.2 Layout direto: `directFamilyDistributedLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Responsabilidade:

- montar a view **Minha Árvore**;
- posicionar pessoa central;
- distribuir parentes diretos por grupos;
- criar labels, group boxes, anchors e edges;
- criar marriage nodes quando necessário.

Nodes/edges relevantes:

```txt
personNode
marriageNode
directFamilyGroupBoxNode
directFamilyLabelNode
directFamilyAnchorNode
spouseEdge
childEdge
siblingEdge
```

Cuidados:

- group boxes, labels e anchors não devem comandar zoom inicial;
- alteração de constantes afeta toda a composição;
- marriage nodes da Minha Árvore podem usar `visualVariant: 'direct-family'`;
- validar desktop e mobile quando mexer em espaçamentos.

### 3.3 Layout por gerações: `genealogyColumnsLayout`

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Responsabilidade:

- montar **Genealogia** e **Visão Completa**;
- agrupar por `manual_generation`;
- inferir gerações visualmente quando necessário;
- posicionar cônjuges;
- criar labels de geração;
- criar conectores ortogonais e edges conjugais.

Cuidados:

- não criar colunas vazias apenas para manter sequência numérica;
- preservar conectores pais/filhos;
- preservar status visual do anel conjugal;
- manter anel padrão em Genealogia/Visão Completa;
- validar chips mobile quando alterar geração, filtros ou agrupamento.

### 3.4 `PersonNode`

Arquivo:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Responsabilidade:

- renderizar card de pessoa no React Flow;
- exibir avatar/fallback;
- exibir nome, datas, locais e idade quando aplicável;
- indicar pessoa falecida;
- indicar pet;
- exibir ações de visualizar, editar, vincular e remover conforme props;
- abrir painel central de foco quando aplicável.

Padrões consolidados:

- nascimento usa ícone `Star`;
- falecimento usa ícone `Cross`;
- pet usa marcador com `Dog`;
- textos longos usam truncamento/quebra controlada;
- handles do React Flow permanecem invisíveis.

Cuidados:

- não trocar ícones por caracteres textuais;
- não remover `stopPropagation` das ações;
- não alterar dimensões sem validar a árvore inteira;
- não misturar permissão de edição dentro do card; receber callbacks já resolvidos.

### 3.5 `MarriageNode`

Arquivo:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
```

Responsabilidade:

- renderizar botão/anel conjugal na Minha Árvore;
- abrir `ViewMarriageModal`;
- inferir pessoas próximas quando detalhes não chegam por props;
- usar ícone `Blend`.

Padrões consolidados:

- tamanho base: `60px × 60px`;
- cor acompanha `FAMILY_TREE_COLORS.EDGE_SPOUSE`;
- variante `direct-family` reforça contraste na Minha Árvore;
- clique deve parar propagação para não mover/selecionar indevidamente o canvas.

Cuidados:

- preservar handles invisíveis;
- não alterar dimensão sem revisar layout;
- não remover fallback de inferência;
- não usar cor fixa fora dos tokens.

### 3.6 `GenealogySpouseEdge`

Arquivo:

```txt
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Responsabilidade:

- representar vínculo conjugal nas views por gerações;
- manter interação com o modal conjugal quando suportada;
- preservar estilo padrão da Genealogia/Visão Completa.

Cuidados:

- não aplicar variante visual da Minha Árvore automaticamente;
- preservar clique no vínculo conjugal;
- validar paletas e filtros de linha.

### 3.7 `TreeLegend`

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Responsabilidade:

- exibir legenda visual;
- controlar filtros/camadas visuais quando recebe callbacks;
- orientar cores, linhas, anéis e estados.

Cuidados:

- legenda não deve ser apenas decorativa quando conectada a callbacks;
- elementos de legenda não devem aparecer na exportação;
- filtros visuais não devem virar regra de banco;
- manter estado padrão conservador.

### 3.8 Exportação da árvore

Arquivos:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Responsabilidade:

- seleção retangular de área visível;
- exportação PNG;
- exportação PDF;
- impressão.

Cuidados:

- sem Storage;
- sem migration;
- sem log persistido;
- overlay/legenda não devem poluir exportação;
- exportação da árvore completa continua evolução futura.

---

## 4. Home pós-login

Componentes extraídos de `Home.tsx`:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/SidebarInfoPanel.tsx
src/app/pages/home/HomeCuriositiesDialog.tsx
src/app/pages/home/DiscoverResultCard.tsx
src/app/pages/home/ContactInfo.tsx
src/app/pages/home/ConnectionDiscoveryPanel.tsx
src/app/pages/home/AiQuestionPanel.tsx
src/app/pages/home/homeCuriositiesUtils.ts
src/app/pages/home/homeAiContext.ts
```

Regra de responsabilidade:

- `Home.tsx` continua orquestrando estado principal, carregamento, Supabase, filtros e handlers;
- componentes extraídos cuidam de apresentação e interação localizada;
- novos dados persistentes devem entrar via service, não direto no componente visual.

---

## 5. Perfil, pessoa e dados pessoais

Componentes principais:

```txt
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/SocialProfilesEditor.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/components/person/RelationshipFinder.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
```

Responsabilidades:

| Componente | Responsabilidade |
|---|---|
| `PersonDataView` | Exibir dados públicos do perfil respeitando privacidade. |
| `PersonContactFields` | Editar contato, privacidade e dados correlatos. |
| `AddressAutocompleteInput` | Autocomplete Google Places com fallback para input comum. |
| `SocialProfilesEditor` | Editar redes sociais e manter compatibilidade com campos legados. |
| `PersonEventsEditor` | Criar/editar eventos pessoais. |
| `PersonEventsList` | Exibir eventos pessoais. |
| `RelationshipFinder` | Exibir cálculo de vínculo/grau de parentesco. |

Cuidados:

- campos de privacidade devem ser respeitados na exibição;
- autocomplete não pode ser obrigatório;
- sem `VITE_GOOGLE_MAPS_API_KEY`, o input deve continuar funcional;
- botão de favorito no perfil deve usar `FavoriteButton`;
- botão de edição no perfil público deve respeitar permissão já resolvida pela página/service;
- sugestão de informação para admin deve passar por `personProfileSuggestionService`.

---

## 6. Relacionamentos e vínculo conjugal

Componentes principais:

```txt
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/RelacionamentoManager.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
```

Responsabilidades:

| Componente | Responsabilidade |
|---|---|
| `MarriageDetailsEditor` | Editar dados conjugais em contexto admin ou formulário permitido. |
| `ViewMarriageModal` | Exibir relacionamento conjugal de forma pública/humana. |
| `RelacionamentoManager` | Gerenciar relacionamentos no contexto de formulário/admin. |

Cuidados:

- observações internas aparecem apenas para admin;
- modal conjugal não deve exibir ID técnico para usuário final;
- usuário sem permissão envia sugestão/solicitação, não altera relacionamento real;
- arquivos históricos de relacionamento usam `relacionamento_id`;
- botão compacto `+` pode ser usado em áreas de espaço reduzido.

---

## 7. Arquivos históricos e upload

Componentes/services principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/components/FotoUpload.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
```

Responsabilidade:

- upload/preview de imagem e PDF;
- edição de título, descrição, ano e categoria;
- suporte a pessoa ou relacionamento;
- compatibilidade com base64 legado;
- uso de Storage para novos arquivos.

Cuidados:

- novos uploads não devem salvar base64;
- preview/download não pode limpar formulário;
- bucket de avatar é diferente de bucket de arquivos históricos;
- categoria histórica depende de migration aplicada;
- não apagar legado sem auditoria.

---

## 8. Favoritos

Componentes/services:

```txt
src/app/components/favorites/FavoriteButton.tsx
src/app/services/favoritesService.ts
src/app/pages/MeusFavoritos.tsx
```

Responsabilidade:

- favoritar/desfavoritar entidade;
- exibir estado ativo;
- chamar `toggleFavorite`;
- preservar metadados sanitizados.

Props principais:

```txt
entityType
entityId
label
description
href
metadata
size: sm | md
variant: icon | button
onChange
```

Estado atual:

- botão implementado e usado para pessoa;
- `FavoriteEntityType` já prevê outras entidades;
- expansão de favoritos para outros tipos deve ser validada funcionalmente antes de expor novos botões.

Cuidados:

- não enviar URL, telefone, token, base64 ou dado sensível em `metadata`;
- usar `href` navegável;
- usar `variant="icon"` para ações compactas como perfil/card;
- expansão para novas entidades deve considerar schema, UI e página `/meus-favoritos`.

---

## 9. Fórum

Páginas/componentes relevantes:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
```

Responsabilidades consolidadas:

| Área | Responsabilidade |
|---|---|
| `ForumNovoTopico` | Criar tópico, selecionar categoria, relacionar pessoas, detectar/inserir menções `@`. |
| `ForumTopico` | Exibir tópico, respostas, comentários, badges, avatares, menções e reações. |
| `forumService` | Persistência de tópicos, respostas, comentários, reações e denúncias. |
| `notificationTriggersService` | Notificar pessoas mencionadas/relacionadas e participantes. |

Padrões consolidados:

- tipo do tópico não aparece como dropdown na criação;
- categoria usa botões/cards;
- pessoas relacionadas usam dropdown com busca e clique fora;
- menções usam `@Nome Completo`;
- reações usam `HeartHandshake`, `Handshake`, `Flower2` e `PartyPopper`;
- uma reação por usuário/alvo;
- clicar na mesma reação remove; clicar em outra substitui.

Cuidados:

- não reintroduzir `Marcar solução` ou `Ocultar` nas respostas se a decisão visual continuar vigente;
- não quebrar deduplicação entre menção e pessoa relacionada;
- falha de notificação não deve impedir publicação do tópico;
- ao alterar reações, validar migration/constraint de unicidade.

---

## 10. Notificações

Componentes/services principais:

```txt
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/notificationDispatchService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
```

Responsabilidades:

| Componente/service | Responsabilidade |
|---|---|
| `NotificationPreferencesPanel` | Toggles e salvamento de preferências. |
| `Notificacoes` | Central/lista de notificações. |
| `AjustarNotificacoes` | Página dedicada de preferências. |
| `AdminNotificacoes` | Rotina/admin de notificações. |
| `notificationTriggersService` | Gatilhos de domínio. |
| `notificationDispatchService` | Criação/despacho respeitando canais e preferências. |

Cuidados:

- separar central `/notificacoes` de preferências `/ajustar-notificacoes`;
- falha de dispatch não deve quebrar ação principal;
- e-mail real depende de provider/secrets;
- push/WhatsApp não devem simular envio real;
- cron externo deve ser configurado fora do frontend.

---

## 11. Calendário familiar

Página principal:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Componentes/conceitos internos:

```txt
MemberPageHeader
PAGE_CONTAINER_CLASS
CALENDAR_CATEGORY_COLORS
MOBILE_CALENDAR_LEGEND_ITEMS
Google Agenda card
```

Responsabilidade:

- exibir eventos familiares por mês;
- filtrar categorias;
- destacar aniversários, casamentos, falecimentos e eventos históricos;
- integrar conexão/sincronização com Google Agenda quando configurada.

Cuidados:

- filtros mobile compactos ficam acima do calendário;
- card Google Agenda pode ser oculto/mostrado no mobile;
- título deve ser **Calendário**;
- textos de idade usam **Faz X anos** quando aplicável;
- tokens/cores do calendário são locais à página.

---

## 12. Timeline e eventos da vida

Componentes/utils:

```txt
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
```

Responsabilidade:

- montar linha do tempo derivada;
- exibir nascimento, falecimento, vínculos, filhos, arquivos históricos e eventos pessoais;
- permitir eventos manuais em contextos editáveis.

Cuidados:

- upload por evento, privacidade por evento e PDF são evolução futura;
- não duplicar dados já derivados;
- manter eventos manuais separados de fatos automáticos quando necessário.

---

## 13. UI base

Componentes em:

```txt
src/app/components/ui/
```

Uso esperado:

- botões;
- cards;
- inputs;
- textareas;
- dialogs;
- tabs;
- selects;
- switches;
- tooltips;
- demais primitivas visuais.

Cuidados:

- preservar compatibilidade com Radix quando aplicável;
- não customizar globalmente componente base para resolver problema isolado;
- preferir composição local quando a variação for específica de tela;
- validar acessibilidade mínima.

---

## 14. Checklist anti-regressão por alteração

| Alteração | Validar |
|---|---|
| Header/menu | `HomeHeader`, `MemberPageHeader`, `UserProfileMenu`, mobile e desktop. |
| Árvore | `/minha-arvore`, `/genealogia`, `/visao-completa`, pan/zoom, paletas e modal conjugal. |
| Cards de pessoa | ícones, texto, truncamento, avatar, pets, falecidos e ações. |
| Fórum | criação, tópico, respostas, comentários, menções, pessoas relacionadas e reações. |
| Notificações | central, preferências, triggers e falha sem bloquear fluxo principal. |
| Favoritos | botão, página `/meus-favoritos`, sanitização de metadata e remoção. |
| Calendário | filtros mobile, Google Agenda, grid e lista do mês. |
| Upload/Storage | preview, bucket correto, edição de metadados e legado base64. |

Comandos mínimos:

```bash
npm run build
git diff --check
```

Quando houver testes relacionados:

```bash
npm test
npm run test:e2e
```
