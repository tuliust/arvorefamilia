# Guia de implementaÃ§Ãµes â€” Ãrvore FamÃ­lia

> Ãšltima revisÃ£o: 2026-05-29
> Local canÃ´nico: `docs/GUIA_IMPLEMENTACOES.md`
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra **o que jÃ¡ foi implementado** no projeto **Ãrvore FamÃ­lia**, o comportamento esperado das frentes consolidadas, os principais arquivos envolvidos e as decisÃµes tÃ©cnicas que nÃ£o devem ser reabertas sem motivo tÃ©cnico ou de produto.

Este guia responde Ã  pergunta: **â€œo que existe hoje e como deve se comportar?â€**

Ele nÃ£o deve funcionar como checklist de execuÃ§Ã£o, manual de troubleshooting ou documentaÃ§Ã£o detalhada de uma funcionalidade especÃ­fica.

Use tambÃ©m:

- `docs/README.md`: Ã­ndice canÃ´nico da documentaÃ§Ã£o.
- `docs/PLANO_PROXIMOS_PASSOS.md`: fechamento de MVP, pendÃªncias e backlog pÃ³s-MVP.
- `docs/GUIA_CORRECAO_ERROS.md`: investigaÃ§Ã£o e correÃ§Ã£o por sintoma.
- `docs/GUIA_COMPONENTES.md`: catÃ¡logo tÃ©cnico de componentes reutilizÃ¡veis.
- `docs/GUIA_UX_LAYOUT.md`: decisÃµes de UX, layout e responsividade.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: operaÃ§Ã£o de migrations, banco e scripts SQL.
- `docs/funcionalidades/*.md`: documentaÃ§Ã£o especÃ­fica por funcionalidade.

---

## 1. Estado consolidado do MVP

As frentes principais do MVP estÃ£o implementadas no escopo atual. Algumas dependem de configuraÃ§Ã£o operacional externa, especialmente notificaÃ§Ãµes automÃ¡ticas, e outras tÃªm evoluÃ§Ã£o prevista pÃ³s-MVP.

| Frente | Status MVP | DecisÃ£o consolidada |
|---|---|---|
| 7.1 NotificaÃ§Ãµes | ConcluÃ­da tecnicamente | Central em `/notificacoes`, preferÃªncias em `/ajustar-notificacoes`, canal interno, e-mail real via provider configurÃ¡vel, rotina manual, Edge Function diÃ¡ria preparada, logs e deduplicaÃ§Ã£o. Cron automÃ¡tico depende de configuraÃ§Ã£o segura externa. |
| 7.2 Astrologia e acontecimentos do nascimento | ConcluÃ­da no escopo atual | Perfil lÃª insights persistidos. GeraÃ§Ã£o/regeneraÃ§Ã£o Ã© aÃ§Ã£o admin. Cards vazios nÃ£o aparecem no perfil pÃºblico. |
| 7.3 Timeline | Implementada funcionalmente | Linha do tempo derivada dos dados existentes; ediÃ§Ã£o avanÃ§ada, upload por evento, privacidade por evento e PDF ficam pÃ³s-MVP. |
| 7.4 WhatsApp no perfil | ConcluÃ­do no frontend | BotÃ£o/link controlado por telefone e permissÃµes; sem WhatsApp Business API no MVP. |
| 7.5 Grau de parentesco/vÃ­nculo | Consolidado funcionalmente | UtilitÃ¡rio puro, testes unitÃ¡rios e integraÃ§Ã£o em Home/perfil. IntegraÃ§Ãµes visuais mais profundas ficam pÃ³s-MVP. |
| 7.6 ExportaÃ§Ã£o de Ã¡rea da Ã¡rvore | ConcluÃ­da no escopo atual | Exporta Ã¡rea visÃ­vel/selecionada da Ã¡rvore como PNG, PDF ou impressÃ£o; Ã¡rvore completa fica pÃ³s-MVP. |
| 7.7 Legendas visuais da Ã¡rvore | ConcluÃ­da no frontend | Legenda no painel lateral; tambÃ©m controla filtros/camadas visuais quando recebe callbacks. |
| 7.8 Favoritos | Primeira camada aprovada | Favorito de pessoa implementado. ExpansÃ£o para arquivos, fÃ³rum, eventos e outros itens fica pÃ³s-MVP. |
| 7.9 PÃ¡gina de favoritos | Primeira versÃ£o aprovada | Listagem, busca, filtros, abertura e remoÃ§Ã£o funcionais. |
| 7.10 Responsividade mobile/tablet | ConcluÃ­da | QA tÃ©cnico e visual aprovado em 2026-05-19 para as larguras obrigatÃ³rias. |
| Home pÃºblica e legal | Implementada | `/entrar` configurÃ¡vel no admin, aceite legal obrigatÃ³rio no primeiro acesso, `noindex/nofollow` em `index.html`. |
| Headers e margens internas | Implementados | PÃ¡ginas internas usam `MemberPageHeader`; Home pÃ³s-login mantÃ©m header prÃ³prio. |
| Viewport das views da Ã¡rvore | Ajustado | Minha Ãrvore usa bounds reais de cards; Genealogia/VisÃ£o Completa usam zoom por largura e tÃ­tulo fixo Ãºnico. |
| VÃ­nculo admin usuÃ¡rio-pessoa | Corrigido e validado | RPC `admin_list_profiles_for_linking` corrigida; migrations local/remoto alinhadas no histÃ³rico recente. |
| Autocomplete de endereÃ§o | ConcluÃ­do no frontend | Admin e dados do usuÃ¡rio usam Google Places quando houver chave; fallback mantÃ©m input normal. |
| CalendÃ¡rio familiar | Ajustes residuais concluÃ­dos | Categorias na sidebar, filtros clicÃ¡veis, pluralizaÃ§Ã£o e texto â€œFaz X anosâ€. |

---

## 2. Arquitetura base

Stack atual:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Supabase Auth;
- Supabase PostgreSQL, RLS e RPCs;
- Supabase Storage;
- Supabase Edge Functions;
- Google Maps/Places API;
- `lucide-react`;
- `react-easy-crop`;
- `reactflow`;
- `html2canvas`;
- `jspdf`;
- Vitest;
- Playwright.

Ãreas implementadas no MVP:

- Ã¡rvore familiar;
- perfis de pessoa;
- administraÃ§Ã£o de pessoas;
- administraÃ§Ã£o de relacionamentos;
- solicitaÃ§Ãµes de vÃ­nculos/alteraÃ§Ãµes;
- arquivos histÃ³ricos;
- histÃ³rico de atividades;
- fÃ³rum;
- Google Calendar;
- notificaÃ§Ãµes;
- timeline;
- favoritos;
- insights de nascimento;
- exportaÃ§Ã£o de Ã¡rea da Ã¡rvore;
- legenda visual da Ã¡rvore;
- headers internos padronizados;
- responsividade mobile/tablet.

Regra de organizaÃ§Ã£o:

- `supabase/migrations` Ã© a fonte da verdade do schema.
- Scripts SQL soltos sÃ£o histÃ³ricos, diagnÃ³sticos ou operacionais.
- Ajustes visuais nÃ£o devem criar migration.
- MudanÃ§as de schema devem ser documentadas tambÃ©m em `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 3. Acesso, permissÃµes e rotas

DocumentaÃ§Ã£o detalhada recomendada:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
src/app/contexts/AuthContext.tsx
```

Comportamento consolidado:

- rotas administrativas usam `ProtectedRoute`;
- rotas de membro usam `MemberRoute`;
- a Ã¡rvore principal usa `TreeAccessRoute`;
- `/` redireciona para `/minha-arvore` preservando search params, como `?pessoa=...`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` usam o mesmo shell `Home` protegido por `TreeAccessRoute`;
- `viewMode` Ã© derivado da rota por helpers em `treeViewMode.ts`;
- a pÃ¡gina antiga de ediÃ§Ã£o/dados da Ã¡rvore pessoal permanece em `/minha-arvore/editar` com `MemberRoute`;
- o botÃ£o **Painel administrativo** aparece apenas para administradores;
- usuÃ¡rio comum nÃ£o deve acessar rotas administrativas;
- admin acessa `/admin` diretamente;
- `/admin/login` nÃ£o deve ser usado como caminho principal do menu do usuÃ¡rio.

Rotas de usuÃ¡rio/membro implementadas:

```txt
/minha-arvore
/genealogia
/visao-completa
/minha-arvore/editar
/meus-dados
/meus-vinculos
/vincular-perfil
/pessoa/:id
/pessoas/:id
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum
/forum/novo
/forum/topico/:id
/forum/topico/:id/editar
/calendario-familiar
```

Rotas administrativas implementadas:

```txt
/admin
/admin/dashboard
/admin/home
/admin/pessoas
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/admin/relacionamentos
/admin/relacionamentos/novo
/admin/importacao
/admin/migrar-dados
/admin/diagnostico
/admin/integridade
/admin/atividades
/admin/notificacoes
/admin/solicitacoes-vinculos
```

Regra de manutenÃ§Ã£o:

> Ao alterar rotas ou guards, atualizar tambÃ©m `docs/arquitetura/ROTAS_E_GUARDS.md`, `docs/GUIA_CORRECAO_ERROS.md` e, se afetar UX, `docs/GUIA_UX_LAYOUT.md`.

---

## 4. Home, headers e margens

### 4.1 Home pÃºblica, aceite legal e indexaÃ§Ã£o

Implementado:

- `/entrar` lÃª `public.site_visual_settings` com fallback seguro para o visual padrÃ£o;
- admin gerencia logo, mÃ­dia de background, cor de fundo em opÃ§Ãµes fixas e opacidade em `/admin/home`;
- primeiro acesso exige aceite explÃ­cito dos termos de uso e da polÃ­tica de privacidade antes de criar conta;
- `index.html` usa tÃ­tulo `Ãrvore GenealÃ³gica da FamÃ­lia`, `lang="pt-BR"` e metatags `noindex/nofollow`;
- limpeza de dados de teste fica em script manual comentado.

Migration relacionada:

```txt
20260519180000_create_site_visual_settings.sql
```

### 4.2 Home autenticada

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

Comportamento consolidado:

- Home pÃ³s-login mantÃ©m header prÃ³prio, diferente do header das pÃ¡ginas internas;
- Home atua como shell Ãºnico das trÃªs views da Ã¡rvore;
- `treeViewMode` Ã© derivado da rota atual por helpers em `treeViewMode.ts`;
- troca de view pelo header e pela navegaÃ§Ã£o mobile usa funÃ§Ã£o central em `Home.tsx`;
- troca de view usa navegaÃ§Ã£o client-side e preserva search params;
- painel lateral da Ã¡rvore contÃ©m as abas **Filtros** e **Legendas**;
- o botÃ£o **AÃ§Ãµes** usa Ã­cone `Printer`, mostra texto no desktop e apenas Ã­cone no mobile;
- o botÃ£o **AÃ§Ãµes** abre o painel/aÃ§Ã£o de informaÃ§Ãµes, fora da toggle principal do painel lateral;
- o botÃ£o de recolher/expandir painel lateral foi unificado para evitar duplicidade;
- em desktop, o botÃ£o fica dentro ou junto ao painel;
- em mobile/largura reduzida, apenas um botÃ£o de expandir/recolher deve aparecer;
- loading atual: **â€œBuscando pessoas e relacionamentosâ€¦â€**, sem complemento â€œno Supabaseâ€.

Componentes extraÃ­dos da Home:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
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

Esses arquivos sÃ£o componentes/auxiliares de apresentaÃ§Ã£o ou funÃ§Ãµes puras. Estados principais, handlers de orquestraÃ§Ã£o, carregamento da Ã¡rvore, Supabase e filtros continuam em `Home.tsx`.

### 4.3 Header compartilhado das pÃ¡ginas internas

Arquivos principais:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

Comportamento implementado:

- pÃ¡ginas internas usam header compartilhado baseado no padrÃ£o visual de `/minha-arvore`;
- margens laterais sÃ£o padronizadas com `PAGE_CONTAINER_CLASS`;
- aÃ§Ãµes de navegaÃ§Ã£o ficam agrupadas de forma responsiva;
- Home pÃ³s-login continua com header prÃ³prio por regra de produto.

---

## 5. Pessoas, formulÃ¡rios e dados pessoais

DocumentaÃ§Ã£o especÃ­fica:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/ESTRUTURA_USUARIOS_BANCO_DADOS.md
```

Arquivos principais:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person
src/app/utils/personFields.ts
src/app/utils/googleAddress.ts
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/relationshipChangeRequestService.ts
```

Comportamento implementado:

- criaÃ§Ã£o e ediÃ§Ã£o de pessoa via admin;
- ediÃ§Ã£o dos prÃ³prios dados pelo usuÃ¡rio conforme permissÃ£o;
- formulÃ¡rio dividido em blocos reutilizÃ¡veis;
- rascunho preservado em `sessionStorage`;
- rascunho removido apÃ³s salvamento concluÃ­do;
- dados bÃ¡sicos, datas, locais, biografia, contato, privacidade, redes sociais, eventos pessoais, relacionamentos pendentes e dados conjugais sÃ£o tratados em blocos especÃ­ficos;
- botÃµes internos que nÃ£o submetem formulÃ¡rio usam `type="button"`;
- preview/download de arquivos nÃ£o limpa o formulÃ¡rio;
- alteraÃ§Ãµes de vÃ­nculo por usuÃ¡rio comum viram solicitaÃ§Ãµes, nÃ£o alteraÃ§Ã£o direta;
- `PersonContactFields` usa `AddressAutocompleteInput` para endereÃ§o;
- `MeusDados` e admin usam autocomplete Google Places para endereÃ§o;
- `src/app/utils/googleAddress.ts` formata o endereÃ§o retornado pelo Google;
- sem `VITE_GOOGLE_MAPS_API_KEY`, ou se o Google falhar, o campo continua como input normal.

### 5.1 Pessoa falecida

Implementado:

- campo booleano `falecido`;
- helper `isPersonDeceased`;
- pessoa considerada falecida quando `falecido = true`, `data_falecimento` existe ou `local_falecimento` existe.

Migration relacionada:

```txt
20260514130000_add_falecido_to_pessoas.sql
```

### 5.2 Locais no exterior

Implementado:

- Brasil: `Cidade/UF`;
- exterior: `Cidade (PaÃ­s)`;
- flags `local_nascimento_exterior` e `local_falecimento_exterior`.

Migration relacionada:

```txt
20260514133000_add_exterior_location_flags_to_pessoas.sql
```

### 5.3 Busca sem acentuaÃ§Ã£o

Helpers:

```txt
normalizeSearchText
includesNormalizedText
```

Comportamento esperado:

- busca ignora caixa e acentos;
- `Marcio` encontra `MÃ¡rcio`;
- `Sao Paulo` encontra `SÃ£o Paulo`.

### 5.4 VÃ­nculo admin usuÃ¡rio-pessoa

Implementado:

- card **UsuÃ¡rios vinculados a esta pessoa** em `AdminPessoaForm`;
- listagem de usuÃ¡rios disponÃ­veis via RPC `admin_list_profiles_for_linking`;
- correÃ§Ã£o da RPC na migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`;
- frontend nÃ£o usa fallback inseguro de consulta direta em `profiles`.

---

## 6. Redes sociais

Arquivos principais:

```txt
src/app/components/person/SocialProfilesEditor
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/services/pessoaSocialProfilesService.ts
```

Comportamento implementado:

- UI usa `SocialProfilesEditor`;
- primeiro perfil social permanece sincronizado com campos legados em `pessoas` quando aplicÃ¡vel;
- campos legados continuam por compatibilidade;
- exibiÃ§Ã£o no perfil respeita privacidade.

Fora do MVP:

- persistÃªncia completa e UX avanÃ§ada para mÃºltiplas redes sociais, caso o uso real exija.

---

## 7. Eventos pessoais

Tabela:

```txt
public.person_events
```

Migration:

```txt
20260514165000_create_person_events.sql
```

Arquivos principais:

```txt
src/app/services/personEventsService.ts
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/PersonProfile.tsx
```

Tipos suportados:

```txt
imigracao
chegada_brasil
mudanca
batismo
formatura
profissao
militar
religioso
memoria
outro
```

Logs implementados:

```txt
person_event.added
person_event.updated
person_event.removed
```

Fora do MVP:

- upload por evento;
- privacidade por evento;
- ediÃ§Ã£o diretamente na timeline;
- exportaÃ§Ã£o PDF de timeline/eventos.

---

## 8. Arquivos histÃ³ricos e Storage

DocumentaÃ§Ã£o especÃ­fica recomendada:

```txt
docs/operacao/STORAGE_MAINTENANCE.md
```

Arquivos principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/components/FotoUpload.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

Comportamento implementado:

- novas fotos principais usam bucket `person-avatars`;
- novos arquivos histÃ³ricos usam bucket `historical-files`;
- novos arquivos nÃ£o devem ser salvos como base64;
- base64/data URL legado continua compatÃ­vel;
- preview de imagem funciona;
- preview de PDF funciona quando possÃ­vel;
- apÃ³s upload de novo arquivo, o input nativo fica oculto;
- campos e botÃµes **Cancelar**/**Adicionar** ficam ocultos imediatamente apÃ³s upload;
- mensagem verde **â€œâœ“ Arquivo carregadoâ€** permanece visÃ­vel;
- imagem carregada mostra thumbnail;
- PDF carregado mostra card com Ã­cone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- apÃ³s upload, usuÃ¡rio ainda pode preencher tÃ­tulo, descriÃ§Ã£o, ano e categoria;
- arquivos existentes permitem editar tÃ­tulo, ano, descriÃ§Ã£o e categoria histÃ³rica;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- usuÃ¡rio comum visualiza arquivos de relacionamento conforme permissÃ£o;
- admin gerencia arquivos via formulÃ¡rio/perfil.

Categoria histÃ³rica:

```txt
HistoricalFileEventCategory
ArquivoHistorico.categoria_evento
public.arquivos_historicos.categoria_evento
20260522121000_add_historical_file_event_category.sql
```

Valores aceitos:

```txt
certidao_nascimento
certidao_casamento
alistamento_militar
imigracao
divorcio
carreira_profissional
mudanca_cidade
certidao_obito
outro
```

Risco operacional:

- `20260522121000_add_historical_file_event_category.sql` Ã© prÃ©-requisito de deploy para versÃµes que enviam `categoria_evento` no payload;
- se o ambiente remoto ainda nÃ£o recebeu a migration, insert/update em `arquivos_historicos` pode falhar;
- nÃ£o remover `categoria_evento` do payload para mascarar ambiente desatualizado.

Compatibilidade mantida:

- `public.pessoas.arquivos_historicos` continua existindo por compatibilidade atÃ© auditoria futura;
- base64 legado nÃ£o deve ser removido automaticamente.

---

## 9. Relacionamentos, vÃ­nculos e dados conjugais

Arquivos principais:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/MeusVinculos.tsx
```

Comportamento implementado:

- admin cria, edita e remove relacionamentos reais;
- usuÃ¡rio comum envia solicitaÃ§Ã£o de criaÃ§Ã£o, remoÃ§Ã£o ou correÃ§Ã£o;
- relacionamento real nÃ£o Ã© alterado diretamente por usuÃ¡rio comum;
- solicitaÃ§Ãµes usam `relationship_change_requests`;
- admin aprova/rejeita solicitaÃ§Ãµes;
- aprovaÃ§Ã£o aplica alteraÃ§Ã£o real;
- rejeiÃ§Ã£o nÃ£o altera relacionamento real.

Migration:

```txt
20260513173000_create_relationship_change_requests.sql
```

Logs:

```txt
relationship_change_requested
relationship_change_approved
relationship_change_rejected
relationship_change_cancelled
```

### 9.1 Dados conjugais

Componente:

```txt
MarriageDetailsEditor
```

Campos:

```txt
data_casamento
local_casamento
ativo
data_separacao
local_separacao
observacoes
```

Regras:

- observaÃ§Ãµes internas aparecem apenas para admin;
- dados conjugais sÃ£o preservados em rascunho;
- modal de relacionamento nÃ£o deve salvar antes do botÃ£o principal do formulÃ¡rio;
- em `/minha-arvore`, o botÃ£o individual **Salvar casamento** foi removido;
- botÃ£o geral **Salvar meus dados** tambÃ©m processa `marriageForms`;
- admin atualiza o relacionamento conjugal principal e tenta atualizar o inverso quando existir;
- usuÃ¡rio nÃ£o-admin cria solicitaÃ§Ã£o via `relationshipChangeRequestService`;
- proteÃ§Ã£o contra solicitaÃ§Ã£o pendente duplicada continua em `findPendingDuplicateRelationshipChangeRequest`;
- local de casamento invÃ¡lido nÃ£o bloqueia dados pessoais, mas deixa casamento sem salvar e exibe aviso.

---

## 10. Ãrvore, Minha Ãrvore, Genealogia e VisÃ£o Completa

DocumentaÃ§Ãµes especÃ­ficas recomendadas:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/buildTreeGraph.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/pages/Home.tsx
src/app/pages/MinhaArvore.tsx
```

### 10.1 Modos de visualizaÃ§Ã£o

- **Minha Ãrvore** mantÃ©m layout prÃ³prio em torno da pessoa central.
- **Genealogia** usa escopo pessoal com layout por geraÃ§Ãµes.
- **VisÃ£o Completa** usa base completa com layout por geraÃ§Ãµes.

Comportamentos consolidados:

- conectores pais-filhos sÃ£o ortogonais nas views por geraÃ§Ã£o;
- cÃ´njuges dos filhos nÃ£o sÃ£o tratados como filhos reais;
- conectores/anÃ©is sÃ£o filtrados conforme pessoas visÃ­veis;
- anel de casamento aparece entre cÃ´njuges;
- anel Ã© clicÃ¡vel;
- anel abre modal conjugal;
- status visual do anel respeita uniÃ£o ativa, separaÃ§Ã£o/divÃ³rcio, viuvez ou desconhecido.

### 10.2 Viewport e escala inicial

Comportamento consolidado:

- tÃ­tulo/subtÃ­tulo da Ã¡rvore sÃ£o renderizados como overlay fixo Ãºnico em `FamilyTree.tsx`;
- tÃ­tulos/subtÃ­tulos internos de layout foram removidos;
- **Minha Ãrvore** usa bounds de cards reais (`personNode`) para evitar zoom inicial excessivamente pequeno;
- bounds de viewport e bounds de pan/arraste sÃ£o tratados separadamente;
- **Genealogia** e **VisÃ£o Completa** usam zoom inicial por largura;
- altura total nÃ£o reduz a escala de Genealogia/VisÃ£o Completa;
- se houver muitos cards verticalmente, o usuÃ¡rio deve arrastar/deslizar para baixo;
- botÃµes `+` e `-` continuam controlando zoom conforme limites definidos.

Commits de referÃªncia:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

---

## 11. Painel lateral e legendas visuais da Ã¡rvore â€” 7.7

DocumentaÃ§Ã£o especÃ­fica recomendada:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Status:

- concluÃ­da no frontend;
- sem migration;
- sem Supabase;
- sem configuraÃ§Ã£o administrativa.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/utils/treeExport.ts
src/app/pages/Home.tsx
```

Comportamento implementado:

- legenda aparece no painel lateral, aba **Legendas**;
- `TreeLegend` nÃ£o Ã© apenas informativa: tambÃ©m controla filtros reais/camadas visuais quando recebe callbacks;
- inclui `visualLineFilters`, `parentChildHighlight` e `siblingHighlight`;
- `parentChildHighlight` respeita `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` respeita `edgeFilters.irmaos`;
- estado padrÃ£o desligado mantÃ©m o visual original;
- botÃ£o flutuante duplicado de legenda foi removido;
- conteÃºdo da legenda foi simplificado;
- subtÃ­tulo â€œCores, linhas, anÃ©is e modos da Ã¡rvore.â€ foi removido;
- seÃ§Ã£o â€œVisualizaÃ§Ã£o atualâ€ e card azul da view ativa foram removidos;
- subtÃ­tulos internos dos cards de legenda foram removidos;
- â€œAtivaâ€ em Anel de casamento foi renomeado para **Em relacionamento**;
- Ã¡rea â€œViewsâ€ foi removida do final do painel;
- legenda mantÃ©m seÃ§Ãµes de cards, linhas, anel de casamento e cores dos grupos quando compatÃ­vel com a altura disponÃ­vel;
- elementos da legenda sÃ£o ignorados na exportaÃ§Ã£o quando usam `data-tree-legend`.

Camadas visuais opcionais:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Regras:

- `parentChildHighlight`: destaca pais/filhos em amarelo contÃ­nuo;
- `siblingHighlight`: destaca irmÃ£os em amarelo tracejado;
- ambos desligados por padrÃ£o;
- ambos respeitam os filtros de linhas correspondentes;
- Minha Ãrvore usa destaque conservador para evitar poluiÃ§Ã£o visual;
- Genealogia e VisÃ£o Completa limitam linhas de irmÃ£os a casos visÃ­veis e seguros.

---

## 12. Demais frentes consolidadas

### 12.1 Linha do tempo â€” 7.3

Arquivos principais:

```txt
src/app/utils/buildPersonTimeline.ts
src/app/components/Timeline/PersonTimeline.tsx
src/app/pages/PersonProfile.tsx
```

Fontes usadas:

- nascimento;
- falecimento;
- relacionamentos;
- filhos;
- arquivos histÃ³ricos;
- eventos pessoais.

A implementaÃ§Ã£o Ã© funcional e derivada dos dados existentes.

### 12.2 Grau de parentesco/vÃ­nculo â€” 7.5

Arquivos principais:

```txt
src/app/utils/relationshipDegree.ts
src/app/utils/relationshipDegree.test.ts
src/app/utils/relationshipDegreeDisplay.ts
src/app/components/person/RelationshipFinder.tsx
src/app/pages/Home.tsx
src/app/pages/PersonProfile.tsx
src/app/services/treeDataCache.ts
```

Comportamento:

- utilitÃ¡rio puro;
- testes unitÃ¡rios;
- integraÃ§Ã£o em Home/perfil;
- cÃ¡lculo de caminho/grau/confianÃ§a;
- sem exposiÃ§Ã£o de dados sensÃ­veis.

### 12.3 WhatsApp no perfil â€” 7.4

Arquivos principais:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/Home.tsx
```

Regras:

- botÃ£o aparece apenas com telefone vÃ¡lido e permissÃ£o;
- nÃºmero textual sÃ³ aparece se `permitir_exibir_telefone = true`;
- sem WhatsApp Business API no MVP.

### 12.4 Astrologia e acontecimentos â€” 7.2

Arquivos principais:

```txt
src/app/services/personInsightsService.ts
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
supabase/functions/generate-person-insights/index.ts
```

Comportamento consolidado:

- perfil apenas lÃª insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- perfil pÃºblico nÃ£o renderiza cards vazios;
- texto **â€œConteÃºdo ainda nÃ£o gerado.â€** nÃ£o aparece publicamente;
- no admin, card aparece somente quando hÃ¡ aÃ§Ã£o possÃ­vel, conteÃºdo existente, loading ou erro.

### 12.5 NotificaÃ§Ãµes â€” 7.1

DocumentaÃ§Ã£o especÃ­fica:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Implementado:

- `/notificacoes` Ã© central/lista de notificaÃ§Ãµes em cards;
- `/ajustar-notificacoes` Ã© pÃ¡gina dedicada de preferÃªncias;
- `NotificationPreferencesPanel` foi extraÃ­do para toggles e salvamento;
- lista mantÃ©m marcar como lida, marcar todas como lidas, remover, loading, vazio e erro;
- `/admin/notificacoes`, logs, deduplicaÃ§Ã£o, Edge Functions, Resend e rotina diÃ¡ria estÃ£o preparados;
- cron automÃ¡tico depende de configuraÃ§Ã£o segura externa.

### 12.6 ExportaÃ§Ã£o de Ã¡rea da Ã¡rvore â€” 7.6

DocumentaÃ§Ã£o especÃ­fica recomendada:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/pages/Home.tsx
```

Comportamento:

- seleÃ§Ã£o de Ã¡rea visÃ­vel;
- exportaÃ§Ã£o PNG;
- exportaÃ§Ã£o PDF;
- impressÃ£o;
- sem Storage;
- sem migration;
- sem log persistido;
- exportaÃ§Ã£o da Ã¡rvore completa fica pÃ³s-MVP.

### 12.7 Favoritos â€” 7.8 e 7.9

Arquivos principais:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
```

Primeira camada funcional:

- favoritos de pessoa;
- busca;
- filtros;
- remoÃ§Ã£o;
- isolamento por usuÃ¡rio.

---

## 13. Responsividade mobile/tablet â€” 7.10

Status:

- concluÃ­da para o MVP;
- ajustes restritos a CSS, Tailwind, layout, scroll, largura, quebra de texto e usabilidade mobile/tablet;
- sem migrations;
- sem alteraÃ§Ã£o de RLS;
- sem alteraÃ§Ã£o de Edge Functions;
- sem alteraÃ§Ã£o de services;
- sem alteraÃ§Ã£o de regras de negÃ³cio de Ã¡rvore, upload, vÃ­nculos, fÃ³rum, favoritos ou notificaÃ§Ãµes;
- QA final tÃ©cnico e visual aprovado em 2026-05-19.

PadrÃµes consolidados:

- containers flex/grid com `min-w-0`;
- textos de usuÃ¡rio com `break-words`;
- IDs, e-mails, URLs e valores tÃ©cnicos longos com `break-all`;
- headers e grupos de aÃ§Ãµes em `flex-col gap-2 sm:flex-row`;
- botÃµes principais em `w-full sm:w-auto` no mobile;
- formulÃ¡rios longos com grids mobile-first;
- tabelas/listas largas com `overflow-x-auto` contido;
- modais longos com altura mÃ¡xima e rolagem interna.

ValidaÃ§Ã£o final executada:

```txt
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

QA visual:

```txt
320px
375px
390px
430px
768px
desktop
```

---

## 14. FÃ³rum, CalendÃ¡rio Familiar e Google Calendar

### 14.1 CalendÃ¡rio Familiar

DocumentaÃ§Ã£o especÃ­fica:

```txt
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Arquivos principais:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
```

Comportamento consolidado:

- bloco superior de **Categorias** foi removido;
- **Categorias** fica na sidebar;
- categorias da sidebar sÃ£o filtros clicÃ¡veis;
- contadores usam singular/plural: **1 evento**, **2 eventos**;
- aniversÃ¡rio mostra primeiro nome no card do calendÃ¡rio e nome completo na lista inferior;
- idade aparece como **â€œFaz X anosâ€**.

### 14.2 FÃ³rum

Status:

- schema versionado em migration;
- categorias, tÃ³picos, respostas, comentÃ¡rios, reaÃ§Ãµes, denÃºncias e soluÃ§Ã£o;
- admin usa funÃ§Ã£o consolidada por `is_admin_user`;
- fluxo bÃ¡sico entra no MVP conforme QA manual.

### 14.3 Google Calendar

Status:

- integraÃ§Ã£o versionada em migration;
- tokens devem ficar restritos a Edge Functions/service role;
- OAuth, sincronizaÃ§Ã£o e proteÃ§Ã£o de tokens exigem validaÃ§Ã£o operacional quando a frente for priorizada.

---

## 15. Banco, migrations e objetos legados

DocumentaÃ§Ã£o operacional recomendada:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

Regras consolidadas:

- revisar `supabase migration list` antes de `db push`;
- usar `migration repair` apenas quando o schema remoto jÃ¡ refletir comprovadamente a migration;
- nÃ£o criar migration para objeto legado sem consumidor runtime;
- nÃ£o remover coluna/view legada sem dump recente, SQL de auditoria e QA visual;
- nÃ£o commitar secrets, dumps ou tokens.

HistÃ³rico operacional recente:

- migrations pendentes de visual/home/categoria histÃ³rica foram aplicadas em histÃ³rico recente;
- `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` corrigiu `public.admin_list_profiles_for_linking()`;
- validaÃ§Ã£o tÃ©cnica pÃ³s-migration passou no histÃ³rico recente com build, testes, e2e, `git diff --check` e `supabase migration list`.

Objetos legados/compatibilidade:

- `public.pessoas.arquivos_historicos`: mantida por compatibilidade atÃ© validaÃ§Ã£o completa;
- `public.imagens_pessoa`: legado/migrations-only;
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado;
- scripts SQL antigos de fÃ³rum/Google Calendar devem ser tratados como legado se jÃ¡ houver migrations oficiais.

---

## 16. Regras de seguranÃ§a permanentes

NÃ£o deve acontecer:

- usuÃ¡rio comum acessar admin;
- usuÃ¡rio comum alterar relacionamento real diretamente;
- perfil gerar IA automaticamente;
- e-mail real ser enviado sem provider, secrets e teste controlado;
- push/WhatsApp fingirem envio real;
- dados novos serem salvos como base64;
- logs, favoritos, timeline ou notificaÃ§Ãµes salvarem dados sensÃ­veis;
- `/admin/integridade` alterar dados;
- `supabase db push` ser usado sem revisar migrations;
- secrets entrarem no frontend ou no repositÃ³rio;
- responsividade ignorar Ã¡rvore, legenda e seleÃ§Ã£o de Ã¡rea;
- tÃ­tulo/subtÃ­tulo interno voltar a aparecer nas views Genealogia/VisÃ£o Completa;
- legenda ou overlay aparecerem em exportaÃ§Ã£o;
- filtros visuais serem persistidos como regra de negÃ³cio.

---

## 17. ObservaÃ§Ãµes de manutenÃ§Ã£o documental

Este arquivo deve permanecer como inventÃ¡rio consolidado. Para evitar repetiÃ§Ã£o:

- detalhes de rotas devem migrar para `docs/arquitetura/ROTAS_E_GUARDS.md`;
- detalhes de migrations e banco devem migrar para `docs/operacao/MIGRATIONS_SUPABASE.md`;
- detalhes de exportaÃ§Ã£o devem migrar para `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- detalhes de Minha Ãrvore devem permanecer em `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- detalhes de legenda, painel e conectores devem permanecer em `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- histÃ³rico de commits e diagnÃ³sticos deve ir para `docs/historico/`, nÃ£o para este guia.
