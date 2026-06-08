# Guia de implementacoes - Arvore Familia

> Ultima revisao: 2026-06-08
> Revisao complementar: perfil, reset admin, Minha Arvore, edicao, forum, notificacoes e reacoes
> Local canonico: `docs/GUIA_IMPLEMENTACOES.md`
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra **o que ja foi implementado** no projeto **Arvore Familia**, o comportamento esperado das frentes consolidadas, os principais arquivos envolvidos e as decisoes tecnicas que nao devem ser reabertas sem motivo tecnico ou de produto.

Este guia responde a pergunta: **o que existe hoje e como deve se comportar**

Ele nao deve funcionar como checklist de execucao, manual de troubleshooting ou documentacao detalhada de uma funcionalidade especifica.

Use tambem:

- `docs/README.md`: indice canonico da documentacao.
- `docs/PLANO_PROXIMOS_PASSOS.md`: fechamento de MVP, pendencias e backlog pos-MVP.
- `docs/GUIA_CORRECAO_ERROS.md`: investigacao e correcao por sintoma.
- `docs/GUIA_COMPONENTES.md`: catalogo tecnico de componentes reutilizaveis.
- `docs/GUIA_UX_LAYOUT.md`: decisoes de UX, layout e responsividade.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: operacao de migrations, banco e scripts SQL.
- `docs/funcionalidades/*.md`: documentacao especifica por funcionalidade.

---

## 1. Estado consolidado do MVP

As frentes principais do MVP estao implementadas no escopo atual. Algumas dependem de configuracao operacional externa, especialmente notificacoes automaticas, e outras tem evolucao prevista pos-MVP.

| Frente | Status MVP | Decisao consolidada |
|---|---|---|
| 7.1 Notificacoes | Concluida tecnicamente | Central em `/notificacoes`, preferencias em `/ajustar-notificacoes`, botao **Personalizar Notificacoes** na central, canal interno, e-mail real via provider configuravel, rotina manual, Edge Function diaria preparada, logs e deduplicacao. Forum dispara notificacoes internas para autores, pessoas relacionadas e pessoas mencionadas por `@`, respeitando preferencias. Cron automatico depende de configuracao segura externa. |
| 7.2 Astrologia e acontecimentos do nascimento | Concluida no escopo atual | Perfil le insights persistidos. Geracao/regeneracao e acao admin. Cards vazios nao aparecem no perfil publico. |
| 7.3 Timeline | Implementada funcionalmente | Linha do tempo derivada dos dados existentes e eventos manuais. Em `/minha-arvore/editar`, a area **Eventos da Vida** exibe fatos automaticos e permite eventos manuais; upload por evento, privacidade por evento e PDF ficam pos-MVP. |
| 7.4 WhatsApp no perfil | Concluido no frontend | Botao/link controlado por telefone e permissoes; sem WhatsApp Business API no MVP. |
| 7.5 Grau de parentesco/vinculo | Consolidado funcionalmente | Utilitario puro, testes unitarios e integracao em Home/perfil. Integracoes visuais mais profundas ficam pos-MVP. |
| 7.6 Exportacao de area da arvore | Concluida no escopo atual | Exporta area visivel/selecionada da arvore como PNG, PDF ou impressao por selecao retangular; arvore completa fica pos-MVP. |
| 7.7 Legendas visuais da arvore | Concluida no frontend | Legenda no painel lateral; tambem controla filtros/camadas visuais quando recebe callbacks. |
| 7.8 Favoritos | Primeira camada aprovada | Favorito de pessoa implementado. Expansao para arquivos, forum, eventos e outros itens fica pos-MVP. |
| 7.9 Pagina de favoritos | Primeira versao aprovada | Listagem, busca, filtros, abertura e remocao funcionais. |
| 7.10 Responsividade mobile/tablet | Concluida | QA tecnico e visual aprovado em 2026-05-19 para as larguras obrigatorias. |
| Home publica e legal | Implementada | `/entrar` configuravel no admin, aceite legal obrigatorio no primeiro acesso, `noindex/nofollow` em `index.html`. |
| Headers, margens e menu do usuario | Implementados com verificacao visual pendente | Paginas internas usam `MemberPageHeader`; Home pos-login mantem header proprio; o menu deve ser consolidado em `UserProfileMenu`, com variante compacta `home-header` para o header da arvore. Se a UI ainda mostrar dropdown compacto diferente do painel das paginas internas, diagnosticar antes de declarar unificacao final. |
| Viewport das views da arvore | Ajustado tecnicamente | Minha Arvore usa bounds reais de cards; Genealogia/Visao Completa usam zoom por largura e titulo fixo unico; subtitulos foram removidos/ocultados. `/minha-arvore` teve titulo/cards reposicionados e scroll externo bloqueado no shell, preservando pan/zoom do ReactFlow. Ajustes visuais devem continuar concentrados em `FamilyTree.tsx`, sem `translate` na camada ReactFlow. |
| Genealogia mobile por geracoes | Concluida no escopo atual | `/genealogia` mobile usa chips horizontais e swipe por geracao; os chips focam/enquadram a geracao ativa sem remover as demais colunas; colunas vazias nao sao renderizadas. |
| Vinculo admin usuario-pessoa | Corrigido e validado | RPC `admin_list_profiles_for_linking` corrigida; migrations local/remoto alinhadas no historico recente. |
| Autocomplete de endereco | Concluido no frontend | Admin e dados do usuario usam Google Places quando houver chave; fallback mantem input normal. |
| Calendario familiar | Ajustes residuais concluidos | Categorias na sidebar, filtros clicaveis, pluralizacao, titulo sem mojibake, evento do grid com titulo em negrito e descricao **Faz X anos** em fonte menor. |
| Paletas visuais da arvore | Concluida no frontend | Paletas `white`, `orange` e `brown` aplicadas por CSS variables, expostas no dropdown do `HomeHeader` e persistidas em `localStorage`; sem migration ou Supabase. Botao conjugal acompanha a cor dos conectores conjugais por tokens/paletas. |
| Perfil, admin de pessoas e privacidade | Atualizado | Admin pode resetar perfil por RPC sem apagar relacionamentos familiares; lista de pessoas copia ID por botao de icone; novos registros de `pessoas` iniciam flags de privacidade/contato como `true`; `/pessoa/:id` moveu edicao para botao redondo ao lado do favorito e usa sugestoes quando usuario nao tem permissao direta. |
| Forum familiar | Atualizado | Criacao de topico usa categorias por cards, busca em pessoas relacionadas, aviso de mencao por `@` e notificacoes. Topico exibe badges, avatares, mencoes clicaveis e reacoes por icone, com uma reacao por usuario/alvo. |

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

Areas implementadas no MVP:

- arvore familiar;
- perfis de pessoa;
- administracao de pessoas;
- administracao de relacionamentos;
- solicitacoes de vinculos/alteracoes;
- arquivos historicos;
- historico de atividades;
- forum;
- criacao de topicos com mencoes, pessoas relacionadas e reacoes unicas por usuario/alvo;
- sugestoes de informacoes de perfil para revisao admin;
- reset administrativo de perfil sem remover relacionamentos;
- Google Calendar;
- notificacoes;
- menu de usuario compartilhado com variante compacta no header da arvore;
- troca de senha via fluxo de reset do Supabase Auth na edicao do perfil;
- timeline;
- favoritos;
- insights de nascimento;
- exportacao de area da arvore;
- legenda visual da arvore;
- paletas visuais da arvore;
- navegacao mobile da Genealogia por geracoes;
- inferencia em memoria de geracoes genealogicas a partir da pessoa central;
- headers internos padronizados;
- responsividade mobile/tablet.

Regra de organizacao:

- `supabase/migrations` e a fonte da verdade do schema.
- Scripts SQL soltos sao historicos, diagnosticos ou operacionais.
- Ajustes visuais nao devem criar migration.
- Mudancas de schema devem ser documentadas tambem em `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 3. Acesso, permissoes e rotas

Documentacao detalhada recomendada:

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
- a arvore principal usa `TreeAccessRoute`;
- `/` redireciona para `/minha-arvore` preservando search params, como `?pessoa=...`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` usam o mesmo shell `Home` protegido por `TreeAccessRoute`;
- `viewMode` e derivado da rota por helpers em `treeViewMode.ts`;
- a pagina antiga de edicao/dados da arvore pessoal permanece em `/minha-arvore/editar` com `MemberRoute`;
- o cabecalho clicavel do menu do usuario tambem redireciona para `/minha-arvore/editar`;
- o botao **Painel administrativo** aparece apenas para administradores;
- usuario comum nao deve acessar rotas administrativas;
- admin acessa `/admin` diretamente;
- `/admin/login` nao deve ser usado como caminho principal do menu do usuario.

Rotas de usuario/membro implementadas:

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

Regra de manutencao:

> Ao alterar rotas ou guards, atualizar tambem `docs/arquitetura/ROTAS_E_GUARDS.md`, `docs/GUIA_CORRECAO_ERROS.md` e, se afetar UX, `docs/GUIA_UX_LAYOUT.md`.

---

## 4. Home, headers e margens

### 4.1 Home publica, aceite legal e indexacao

Implementado:

- `/entrar` le `public.site_visual_settings` com fallback seguro para o visual padrao;
- admin gerencia logo, midia de background, cor de fundo em opcoes fixas e opacidade em `/admin/home`;
- primeiro acesso exige aceite explicito dos termos de uso e da politica de privacidade antes de criar conta;
- `index.html` usa titulo `Arvore Genealogica da Familia`, `lang="pt-BR"` e metatags `noindex/nofollow`;
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

- Home pos-login mantem header proprio, diferente do header das paginas internas;
- Home atua como shell unico das tres views da arvore;
- `treeViewMode` e derivado da rota atual por helpers em `treeViewMode.ts`;
- troca de view pelo header e pela navegacao mobile usa funcao central em `Home.tsx`;
- troca de view usa navegacao client-side e preserva search params;
- painel lateral da arvore contem as abas **Filtros** e **Legendas**;
- o botao **Acoes** usa icone `Printer`, mostra texto no desktop e apenas icone no mobile;
- o botao **Acoes** abre o painel/acao de informacoes, fora da toggle principal do painel lateral;
- o botao de recolher/expandir painel lateral foi unificado para evitar duplicidade;
- em desktop, o botao fica dentro ou junto ao painel;
- em mobile/largura reduzida, apenas um botao de expandir/recolher deve aparecer;
- loading atual: **Buscando pessoas e relacionamentos...**, sem complemento no Supabase;
- `HomeHeader` exibe seletor compacto de paletas visuais dentro do dropdown de views;
- paleta ativa e controlada por estado local no header;
- escolha e aplicada no `document.documentElement` por CSS variables;
- escolha e persistida em `localStorage`;
- PR #7 reimplementou a exposicao no header apos revert da tentativa anterior que causou erro em runtime.
- o menu do usuario do header da arvore deve usar `UserProfileMenu` com `variant="home-header"`, preservando o botao compacto e abrindo o painel compartilhado.
- se o ambiente atual ainda mostrar dropdown compacto distinto do painel das paginas internas, investigar `HomeHeader.tsx`, `UserProfileMenu.tsx` e `MemberPageHeader.tsx` antes de considerar a unificacao concluida.
- o antigo dropdown local `UserMenu` da Home nao deve ser reintroduzido sem decisao explicita.

Componentes extraidos da Home:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
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

Esses arquivos sao componentes/auxiliares de apresentacao ou funcoes puras. Estados principais, handlers de orquestracao, carregamento da arvore, Supabase e filtros continuam em `Home.tsx`.

### 4.3 Header compartilhado das paginas internas

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

- paginas internas usam header compartilhado baseado no padrao visual de `/minha-arvore`;
- margens laterais sao padronizadas com `PAGE_CONTAINER_CLASS`;
- acoes de navegacao ficam agrupadas de forma responsiva;
- Home pos-login continua com header proprio por regra de produto.
- o painel do `UserProfileMenu` e o padrao compartilhado de menu do usuario em paginas internas e nas views da arvore.
- a area superior do menu, com avatar, nome e e-mail, e clicavel e navega para `/minha-arvore/editar`.
- o item **Editar notificacoes** foi removido do menu; o acesso a preferencias fica na central `/notificacoes` e pela rota `/ajustar-notificacoes`.

---

## 5. Pessoas, formularios e dados pessoais

Documentacao especifica:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
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

- criacao e edicao de pessoa via admin;
- edicao dos proprios dados pelo usuario conforme permissao;
- formulario dividido em blocos reutilizaveis;
- rascunho preservado em `sessionStorage`;
- rascunho removido apos salvamento concluido;
- dados basicos, datas, locais, biografia, contato, privacidade, redes sociais, eventos pessoais, relacionamentos pendentes e dados conjugais sao tratados em blocos especificos;
- botoes internos que nao submetem formulario usam `type="button"`;
- preview/download de arquivos nao limpa o formulario;
- alteracoes de vinculo por usuario comum viram solicitacoes, nao alteracao direta;
- `PersonContactFields` usa `AddressAutocompleteInput` para endereco;
- `MeusDados` e admin usam autocomplete Google Places para endereco;
- `src/app/utils/googleAddress.ts` formata o endereco retornado pelo Google;
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
- exterior: `Cidade (Pais)`;
- flags `local_nascimento_exterior` e `local_falecimento_exterior`.

Migration relacionada:

```txt
20260514133000_add_exterior_location_flags_to_pessoas.sql
```

### 5.3 Busca sem acentuacao

Helpers:

```txt
normalizeSearchText
includesNormalizedText
```

Comportamento esperado:

- busca ignora caixa e acentos;
- `Marcio` encontra `Marcio`;
- `Sao Paulo` encontra `Sao Paulo`.

### 5.4 Reset administrativo de perfil e defaults de privacidade

Implementado:

- `/admin/pessoas` exibe botao de icone para copiar o ID da pessoa;
- admin pode acionar **Resetar Perfil** para retornar dados relacionados ao perfil ao estado base atual de `pessoas`;
- reset remove foto de perfil, astrologia/acontecimentos gerados, favoritos e preferencias customizadas associadas ao perfil;
- reset preserva relacionamentos familiares existentes;
- preferencias de notificacoes retornam para `true`;
- flags de exibicao/contato retornam para `true`;
- novos registros da tabela `pessoas` iniciam como `true` em:
  - `permitir_exibir_instagram`;
  - `permitir_mensagens_whatsapp`;
  - `permitir_exibir_data_nascimento`;
  - `permitir_exibir_endereco`;
  - `permitir_exibir_telefone`.

Migration relacionada:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
```

RPC relacionada:

```txt
admin_reset_person_profile
```

Regra anti-regressao:

```txt
O reset nao deve executar delete em relacionamentos familiares.
```

### 5.5 Perfil publico e sugestoes de informacoes

Implementado:

- em `/pessoa/:id`, o botao **Editar** saiu do header e fica ao lado do favorito;
- o botao e redondo, apenas com icone de lapis e texto somente em `title`/hover;
- o botao aparece para admin, responsavel pelo perfil ou propria pessoa vinculada;
- botao **Inserir Informacoes** usa permissao direta quando o usuario pode editar;
- quando nao pode editar, os dados viram sugestao para revisao admin;
- admin visualiza sugestoes em `/admin/solicitacoes-vinculos`.

Migration relacionada:

```txt
20260608143000_create_person_profile_suggestions.sql
```

### 5.6 Vinculo admin usuario-pessoa

Implementado:

- card **Usuarios vinculados a esta pessoa** em `AdminPessoaForm`;
- listagem de usuarios disponiveis via RPC `admin_list_profiles_for_linking`;
- correcao da RPC na migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`;
- frontend nao usa fallback inseguro de consulta direta em `profiles`.

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
- primeiro perfil social permanece sincronizado com campos legados em `pessoas` quando aplicavel;
- campos legados continuam por compatibilidade;
- exibicao no perfil respeita privacidade.

Fora do MVP:

- persistencia completa e UX avancada para multiplas redes sociais, caso o uso real exija.

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
- edicao diretamente na timeline;
- exportacao PDF de timeline/eventos.

---

## 8. Arquivos historicos e Storage

Documentacao especifica recomendada:

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
- novos arquivos historicos usam bucket `historical-files`;
- novos arquivos nao devem ser salvos como base64;
- base64/data URL legado continua compativel;
- preview de imagem funciona;
- preview de PDF funciona quando possivel;
- apos upload de novo arquivo, o input nativo fica oculto;
- campos e botoes **Cancelar**/**Adicionar** ficam ocultos imediatamente apos upload;
- mensagem verde **Arquivo carregado** permanece visivel;
- imagem carregada mostra thumbnail;
- PDF carregado mostra card com icone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- em areas compactas, especialmente `/minha-arvore/editar` e modal conjugal, a acao de adicionar pode ser representada por botao `+` com `aria-label` adequado;
- apos upload, usuario ainda pode preencher titulo, descricao, ano e categoria;
- arquivos existentes permitem editar titulo, ano, descricao e categoria historica;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- usuario comum visualiza arquivos de relacionamento conforme permissao;
- admin gerencia arquivos via formulario/perfil.

Categoria historica:

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

- `20260522121000_add_historical_file_event_category.sql` e pre-requisito de deploy para versoes que enviam `categoria_evento` no payload;
- se o ambiente remoto ainda nao recebeu a migration, insert/update em `arquivos_historicos` pode falhar;
- nao remover `categoria_evento` do payload para mascarar ambiente desatualizado.

Compatibilidade mantida:

- `public.pessoas.arquivos_historicos` continua existindo por compatibilidade ate auditoria futura;
- base64 legado nao deve ser removido automaticamente.

---

## 9. Relacionamentos, vinculos e dados conjugais

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
- usuario comum envia solicitacao de criacao, remocao ou correcao;
- relacionamento real nao e alterado diretamente por usuario comum;
- solicitacoes usam `relationship_change_requests`;
- admin aprova/rejeita solicitacoes;
- aprovacao aplica alteracao real;
- rejeicao nao altera relacionamento real.

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

### 9.1 Modal de relacionamento conjugal

Implementado:

- titulo do modal e botao de fechar ficam alinhados/centralizados conforme layout do dialog;
- texto publico usa linguagem humana, por exemplo **Fulana e Secundino foram casados**;
- subtitulo exibe informacoes complementares quando houver dados, como periodo do matrimonio e cidade/UF da cerimonia;
- botao **Inserir Informacoes** respeita permissao:
  - admin/responsavel edita diretamente;
  - usuario sem permissao envia sugestao para revisao admin;
- arquivos historicos do relacionamento usam o componente compartilhado e podem usar botao compacto `+`;
- IDs tecnicos permanecem ocultos para usuario final.

Arquivos principais:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/services/personProfileSuggestionService.ts
src/app/services/permissionService.ts
```

### 9.2 Dados conjugais

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

- observacoes internas aparecem apenas para admin;
- dados conjugais sao preservados em rascunho;
- modal de relacionamento nao deve salvar antes do botao principal do formulario;
- em `/minha-arvore`, o botao individual **Salvar casamento** foi removido;
- botao geral **Salvar meus dados** tambem processa `marriageForms`;
- admin atualiza o relacionamento conjugal principal e tenta atualizar o inverso quando existir;
- usuario nao-admin cria solicitacao via `relationshipChangeRequestService`;
- protecao contra solicitacao pendente duplicada continua em `findPendingDuplicateRelationshipChangeRequest`;
- local de casamento invalido nao bloqueia dados pessoais, mas deixa casamento sem salvar e exibe aviso.

---

## 10. Arvore, Minha Arvore, Genealogia e Visao Completa

Documentacoes especificas recomendadas:

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
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/MinhaArvore.tsx
```

### 10.1 Modos de visualizacao

- **Minha Arvore** mantem layout proprio em torno da pessoa central.
- **Genealogia** usa escopo pessoal com layout por geracoes.
- **Visao Completa** usa base completa com layout por geracoes.

Comportamentos consolidados:

- conectores pais-filhos sao ortogonais nas views por geracao;
- conjuges dos filhos nao sao tratados como filhos reais;
- conectores/aneis sao filtrados conforme pessoas visiveis;
- anel de casamento aparece entre conjuges;
- anel e clicavel;
- anel abre modal conjugal;
- status visual do anel respeita uniao ativa, separacao/divorcio, viuvez ou desconhecido;
- `MarriageNode` aceita variante visual por dados, incluindo `visualVariant: 'direct-family'` para reforcar a leitura do anel na view **Minha Arvore** sem alterar o estilo padrao da **Genealogia**.

### 10.2 Viewport e escala inicial

Comportamento consolidado:

- titulo/subtitulo da arvore sao renderizados como overlay fixo unico em `FamilyTree.tsx`;
- titulos/subtitulos internos de layout foram removidos;
- **Minha Arvore** usa bounds de cards reais (`personNode`) para evitar zoom inicial excessivamente pequeno;
- bounds de viewport e bounds de pan/arraste sao tratados separadamente;
- **Genealogia** e **Visao Completa** usam zoom inicial por largura;
- altura total nao reduz a escala de Genealogia/Visao Completa;
- se houver muitos cards verticalmente, o usuario deve arrastar/deslizar para baixo;
- botoes `+` e `-` continuam controlando zoom conforme limites definidos;
- o espacamento entre titulo e arvore deve ser ajustado por constantes de `FamilyTree.tsx`, nao por `transform`, `translate` ou deslocamento manual de `.react-flow__viewport`.

Commits de referencia:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

#### Estado visual ainda pendente

Os seguintes pontos não devem ser tratados como encerrados apenas pela existência de código ou build aprovado:

```txt
padding superior do título da árvore
redução do espaço entre título e cards sem corte superior
visibilidade clara das alianças em /minha-arvore
confirmação de que o menu da árvore abre o mesmo painel compartilhado das páginas internas
```

Regra:

```txt
Registrar como implementado somente depois de validação visual em browser real nas três views da árvore e nas páginas internas de comparação.
```


### 10.3 Paletas visuais da arvore

Implementado:

- tres paletas visuais: `white`, `orange` e `brown`;
- `white` preserva a paleta padrao da `main`;
- `orange` incorpora a variacao visual da branch `polish/layout-components-main`;
- `brown` incorpora a variacao premium inspirada em `redesign/suafamilia-tree-style`;
- o seletor aparece no dropdown do `HomeHeader`, abaixo das opcoes de view;
- a aplicacao ocorre por CSS variables/tokens, sem alterar grafo, filtros, permissao ou dados;
- a escolha persiste em `localStorage`;
- o anel conjugal foi ampliado para `60px x 60px`.

Historico:

```txt
PR #6 - feat: adicionar paletas visuais da arvore
PR #7 - fix: exibir paletas no header da arvore
```

Validador anti-regressao:

- `npm run build`;
- `git diff --check`;
- Preview da Vercel antes de merge;
- teste manual do dropdown em `/minha-arvore`, `/genealogia` e `/visao-completa`.

### 10.4 Genealogia mobile por geracoes

Implementado:

- `/genealogia` em mobile possui navegacao horizontal por geracoes;
- chips/tabs superiores exibem nomes humanos: **Tataravos**, **Bisavos**, **Avos**, **Pais**, **Nucleo** e **Descendentes**;
- os chips nao exibem contagem numerica;
- toque no chip altera a geracao ativa;
- swipe lateral na barra de chips avanca ou volta geracao;
- barra de chips ocupa a largura horizontal disponivel;
- botoes `+` e `-` ficam ocultos somente em Genealogia mobile;
- labels `GERACAO X` recebem area segura para nao sobrepor o menu superior;
- estado vazio exibe mensagem amigavel quando nao houver geracoes ou pessoas visiveis.

Arquivos principais:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Decisao consolidada:

```txt
chips focam/enquadram a geracao ativa, mas nao filtram/removem as demais colunas do ReactFlow
```

Motivo:

- o usuario deve poder reduzir zoom e enxergar a arvore inteira;
- o pan/zoom do ReactFlow precisa continuar considerando todos os nodes renderizaveis;
- a navegacao mobile deve funcionar como foco progressivo, nao como filtro destrutivo.

### 10.5 Genealogia - inferencia de geracoes e colunas vazias

Implementado:

- a view Genealogia pode inferir `manual_generation` em memoria a partir da pessoa central;
- pais sobem uma geracao;
- filhos descem uma geracao;
- conjuges permanecem na mesma geracao;
- a inferencia nao altera dados no Supabase;
- colunas vazias nao sao renderizadas;
- `Geração 1` nao deve aparecer sem cards;
- tataravos aparecem se estiverem conectados por cadeia valida de `filiacao_sangue` ou `filiacao_adotiva`.

Comportamento esperado:

- em desktop e mobile, a primeira coluna da Genealogia deve ser a primeira geracao com cards reais;
- no caso de uma pessoa central com tataravos cadastrados e conectados, `Tataravos/Geracao 1` deve aparecer como primeira coluna;
- se nao houver pessoas em uma geracao, a coluna correspondente nao aparece;
- filtros de vida/status ainda podem ocultar pessoas conforme configuracao.

Cuidados:

- nao persistir a geracao inferida no banco;
- nao substituir cadastro correto de `manual_generation`;
- nao aplicar automaticamente a navegacao mobile por chips em `Visao Completa`;
- validar conectores, aneis conjugais, paletas e exportacao apos mudancas no layout.


### 10.6 Minha Arvore - refinamento desktop de layout direto

Estado de implementação/ajuste visual:

- `/minha-arvore` mantém layout próprio em torno da pessoa central;
- áreas esquerda, central e direita foram refinadas de forma incremental;
- cards de parentes devem convergir para `340 × 136`, exceto pessoa principal;
- pessoa principal mantém dimensão lógica maior, baseada em `CENTRAL_WIDTH × 760`;
- linhas verticais laterais e espaçamentos internos de tios/primos podem ser reduzidos para evitar corte inferior;
- grupos centrais inferiores podem subir quando houver sobra superior;
- não usar escala global do renderer para resolver corte inferior.

Arquivos principais:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/styles/family-tree-visual-polish.css
```

Status:

```txt
compactacao de /minha-arvore: ajustada tecnicamente
cards de parentes: diretriz definida em 340 × 136
alianças: icone acompanha cor dos conectores conjugais
scroll externo da Home: bloqueado quando nao ha conteudo fora da viewport
borda extra da pessoa principal: removida
```

Cuidados:

- preservar `panOnScroll` e `zoomOnScroll` internos do ReactFlow;
- nao permitir scroll externo da pagina quando a arvore ja ocupa a viewport;
- aplicar deslocamentos verticais apenas em `viewMode === 'minha-arvore'`;
- nao propagar ajustes da Minha Arvore para `/genealogia` e `/visao-completa` sem validacao especifica;
- validar paletas `white`, `orange` e `brown`.

---

## 11. Painel lateral e legendas visuais da arvore - 7.7

Documentacao especifica recomendada:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Status:

- concluida no frontend;
- sem migration;
- sem Supabase;
- sem configuracao administrativa.

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
- `TreeLegend` nao e apenas informativa: tambem controla filtros reais/camadas visuais quando recebe callbacks;
- inclui `visualLineFilters`, `parentChildHighlight` e `siblingHighlight`;
- `parentChildHighlight` respeita `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` respeita `edgeFilters.irmaos`;
- estado padrao desligado mantem o visual original;
- botao flutuante duplicado de legenda foi removido;
- conteudo da legenda foi simplificado;
- subtitulo Cores, linhas, aneis e modos da arvore. foi removido;
- secao Visualizacao atual e card azul da view ativa foram removidos;
- subtitulos internos dos cards de legenda foram removidos;
- Ativa em Anel de casamento foi renomeado para **Em relacionamento**;
- area Views foi removida do final do painel;
- legenda mantem secoes de cards, linhas, anel de casamento e cores dos grupos quando compativel com a altura disponivel;
- elementos da legenda sao ignorados na exportacao quando usam `data-tree-legend`.

Camadas visuais opcionais:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Regras:

- `parentChildHighlight`: destaca pais/filhos em amarelo continuo;
- `siblingHighlight`: destaca irmaos em amarelo tracejado;
- ambos desligados por padrao;
- ambos respeitam os filtros de linhas correspondentes;
- Minha Arvore usa destaque conservador para evitar poluicao visual;
- Genealogia e Visao Completa limitam linhas de irmaos a casos visiveis e seguros.

---

## 12. Demais frentes consolidadas

### 12.1 Linha do tempo - 7.3

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
- arquivos historicos;
- eventos pessoais.

A implementacao e funcional e derivada dos dados existentes.

### 12.2 Grau de parentesco/vinculo - 7.5

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

- utilitario puro;
- testes unitarios;
- integracao em Home/perfil;
- calculo de caminho/grau/confianca;
- sem exposicao de dados sensiveis.

### 12.3 WhatsApp no perfil - 7.4

Arquivos principais:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/Home.tsx
```

Regras:

- botao aparece apenas com telefone valido e permissao;
- numero textual so aparece se `permitir_exibir_telefone = true`;
- sem WhatsApp Business API no MVP.

### 12.4 Astrologia e acontecimentos  7.2

Arquivos principais:

```txt
src/app/services/personInsightsService.ts
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
supabase/functions/generate-person-insights/index.ts
```

Comportamento consolidado:

- perfil apenas le insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- perfil publico nao renderiza cards vazios;
- texto **Conteudo ainda nao gerado.** nao aparece publicamente;
- no admin, card aparece somente quando ha acao possivel, conteudo existente, loading ou erro.

### 12.5 Notificacoes  7.1

Documentacao especifica:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Implementado:

- `/notificacoes` e central/lista de notificacoes em cards, com botao **Personalizar Notificacoes** para `/ajustar-notificacoes`;
- `/ajustar-notificacoes` e pagina dedicada de preferencias;
- `NotificationPreferencesPanel` foi extraido para toggles e salvamento;
- lista mantem marcar como lida, marcar todas como lidas, remover, loading, vazio e erro;
- `/admin/notificacoes`, logs, deduplicacao, Edge Functions, Resend e rotina diaria estao preparados;
- cron automatico depende de configuracao segura externa.

### 12.6 Exportacao de area da arvore  7.6

Documentacao especifica recomendada:

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

- selecao de area visivel;
- exportacao PNG;
- exportacao PDF;
- impressao;
- sem Storage;
- sem migration;
- sem log persistido;
- exportacao da arvore completa fica pos-MVP.

### 12.7 Favoritos  7.8 e 7.9

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
- remocao;
- isolamento por usuario.

---

## 13. Responsividade mobile/tablet  7.10

Status:

- concluida para o MVP;
- ajustes restritos a CSS, Tailwind, layout, scroll, largura, quebra de texto e usabilidade mobile/tablet;
- sem migrations;
- sem alteracao de RLS;
- sem alteracao de Edge Functions;
- sem alteracao de services;
- sem alteracao de regras de negocio de arvore, upload, vinculos, forum, favoritos ou notificacoes;
- QA final tecnico e visual aprovado em 2026-05-19.

Padroes consolidados:

- containers flex/grid com `min-w-0`;
- textos de usuario com `break-words`;
- IDs, e-mails, URLs e valores tecnicos longos com `break-all`;
- headers e grupos de acoes em `flex-col gap-2 sm:flex-row`;
- botoes principais em `w-full sm:w-auto` no mobile;
- formularios longos com grids mobile-first;
- tabelas/listas largas com `overflow-x-auto` contido;
- modais longos com altura maxima e rolagem interna.

Validacao final executada:

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

## 14. Forum, Calendario Familiar e Google Calendar

### 14.1 Calendario Familiar

Documentacao especifica:

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
- categorias da sidebar sao filtros clicaveis;
- contadores usam singular/plural: **1 evento**, **2 eventos**;
- aniversario mostra primeiro nome no card do calendario e nome completo na lista inferior;
- titulo de aniversario no grid deve ter peso visual forte/negrito;
- idade aparece como **Faz X anos** em texto secundario menor;
- titulo do header deve ser **Calendario** sem mojibake; se a UI estiver em UTF-8 pleno, validar **Calendário**.

### 14.2 Forum

Documentacao especifica:

```txt
docs/funcionalidades/FORUM.md
```

Status:

- schema versionado em migrations;
- categorias, topicos, respostas, comentarios, reacoes, denuncias e solucao;
- `/forum/novo` usa categorias por botoes/cards de selecao unica;
- dropdown de pessoas relacionadas possui busca interna e fecha ao clicar fora;
- conteudo orienta **Digite @ para marcar alguem na publicacao**;
- pessoas relacionadas e pessoas mencionadas recebem notificacao interna quando permitido;
- `/forum/topico/:id` usa badges pequenas/coloridas para categoria, tipo e status;
- autores de topicos, respostas e comentarios exibem avatar ou fallback por iniciais;
- mencoes `@Nome Completo` sao negritadas e clicaveis para `/pessoa/:id`;
- respostas nao exibem mais **Marcar solucao** nem **Ocultar**;
- reacoes usam icones e labels finais:
  - **Amei** (`curtir`, `HeartHandshake`, vermelho);
  - **Apoiar** (`apoiar`, `Handshake`, verde);
  - **Oracoes** (`lembrar`, `Flower2`, azul);
  - **Parabens** (`celebrar`, `PartyPopper`, laranja);
- uma pessoa so pode manter uma reacao por alvo;
- clicar na mesma reacao remove a reacao;
- admin usa funcao consolidada por `is_admin_user`;
- fluxo basico entra no MVP conforme QA manual.

Migration relacionada:

```txt
20260608180000_enforce_single_forum_reaction.sql
```

### 14.3 Google Calendar

Status:

- integracao versionada em migration;
- tokens devem ficar restritos a Edge Functions/service role;
- OAuth, sincronizacao e protecao de tokens exigem validacao operacional quando a frente for priorizada.

---

## 15. Banco, migrations e objetos legados

Documentacao operacional recomendada:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

Regras consolidadas:

- revisar `supabase migration list` antes de `db push`;
- usar `migration repair` apenas quando o schema remoto ja refletir comprovadamente a migration;
- nao criar migration para objeto legado sem consumidor runtime;
- nao remover coluna/view legada sem dump recente, SQL de auditoria e QA visual;
- nao commitar secrets, dumps ou tokens.

Historico operacional recente:

- migrations pendentes de visual/home/categoria historica foram aplicadas em historico recente;
- `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` corrigiu `public.admin_list_profiles_for_linking()`;
- validacao tecnica pos-migration passou no historico recente com build, testes, e2e, `git diff --check` e `supabase migration list`.

Objetos legados/compatibilidade:

- `public.pessoas.arquivos_historicos`: mantida por compatibilidade ate validacao completa;
- `public.imagens_pessoa`: legado/migrations-only;
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado;
- scripts SQL antigos de forum/Google Calendar devem ser tratados como legado se ja houver migrations oficiais.

---

## 16. Regras de seguranca permanentes

Nao deve acontecer:

- usuario comum acessar admin;
- usuario comum alterar relacionamento real diretamente;
- perfil gerar IA automaticamente;
- e-mail real ser enviado sem provider, secrets e teste controlado;
- push/WhatsApp fingirem envio real;
- dados novos serem salvos como base64;
- logs, favoritos, timeline ou notificacoes salvarem dados sensiveis;
- `/admin/integridade` alterar dados;
- `supabase db push` ser usado sem revisar migrations;
- secrets entrarem no frontend ou no repositorio;
- responsividade ignorar arvore, legenda e selecao de area;
- titulo/subtitulo interno voltar a aparecer nas views Genealogia/Visao Completa;
- legenda ou overlay aparecerem em exportacao;
- filtros visuais serem persistidos como regra de negocio.

---

## 17. Observacoes de manutencao documental

Este arquivo deve permanecer como inventario consolidado. Para evitar repeticao:

- detalhes de rotas devem migrar para `docs/arquitetura/ROTAS_E_GUARDS.md`;
- detalhes de migrations e banco devem migrar para `docs/operacao/MIGRATIONS_SUPABASE.md`;
- detalhes de exportacao devem migrar para `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- detalhes de Minha Arvore devem permanecer em `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- detalhes de legenda, painel e conectores devem permanecer em `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- historico de commits e diagnosticos deve ir para `docs/historico/`, nao para este guia.

---

## Atualizacao 2026-06-06 - Paletas visuais da arvore

Implementado e mergeado na `main` em duas etapas:

```txt
PR #6 - feat: adicionar paletas visuais da arvore
PR #7 - fix: exibir paletas no header da arvore
```

Comportamento entregue:

- base tecnica de paletas visuais na arvore;
- seletor compacto de paletas no dropdown do `HomeHeader`;
- tres paletas: `white`, `orange` e `brown`;
- `white` preserva a paleta padrao da `main`;
- `orange` incorpora a variacao visual da branch `polish/layout-components-main`;
- `brown` incorpora a variacao premium da branch `redesign/suafamilia-tree-style`;
- persistencia em `localStorage`;
- aplicacao por CSS variables no `document.documentElement`;
- botao/anel conjugal ampliado para `60px x 60px`;
- troca de paleta sem alteracao de rota, filtros, dados, permissoes ou Supabase.

Arquivos principais:

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

Validacoes registradas:

- `npm run build` aprovado localmente apos merge na `main`;
- PR #6 e PR #7 estavam `MERGEABLE`;
- Vercel Preview com status `SUCCESS`;
- producao foi restaurada apos revert do commit quebrado;
- producao foi revalidada apos merge do PR #7;
- sem marcadores de conflito ``<<<<<<<``, ``=======`` ou ``>>>>>>>``.

Incidente resolvido:

- uma tentativa anterior inseriu JSX no `HomeHeader` usando `treeColorPalette` sem declarar estado/effect;
- producao quebrou com `ReferenceError: treeColorPalette is not defined`;
- o commit foi revertido;
- a reimplementacao segura foi feita por branch/PR separado, com estado React e efeito de aplicacao/persistencia.
---

## Atualizacao 2026-06-06 - Genealogia mobile e geracoes inferidas

Implementado na `main` em commits incrementais:

```txt
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

Resumo entregue:

- Genealogia mobile passou a ter navegacao horizontal por geracoes;
- chips controlam foco/enquadramento e nao filtram estruturalmente a arvore;
- barra mobile remove contagem e ocupa a largura disponivel;
- swipe lateral entre geracoes foi implementado;
- botoes de zoom foram ocultados apenas em Genealogia mobile;
- gap entre conjuges foi ampliado para reduzir sobreposicao do anel;
- Genealogia desktop/mobile deixou de renderizar colunas vazias;
- geracoes podem ser inferidas em memoria pela cadeia de filiacao da pessoa central;
- nenhuma migration, RLS ou alteracao de dados reais foi criada nesta frente.

Validacao recomendada:

```txt
/genealogia mobile em 320px, 375px, 390px, 430px e 768px
/genealogia desktop
/minha-arvore para regressao
/visao-completa para regressao
paletas white, orange e brown
clique em pessoa
clique em anel conjugal
pan vertical e horizontal
exportacao de area visivel
```


---

## Atualizacao 2026-06-07 - Menu compartilhado, arvore e paginas auxiliares

Esta atualizacao consolida ajustes visuais e de navegacao feitos apos a frente de paletas e Genealogia mobile.

### Menu do usuario

Implementado:

- `UserProfileMenu` passou a ser o componente compartilhado do menu do usuario;
- a variante padrao permanece adequada para paginas internas;
- a variante `home-header` preserva o botao compacto do header da arvore;
- as views `/minha-arvore`, `/genealogia` e `/visao-completa` abrem o painel compartilhado do `UserProfileMenu`;
- o antigo `UserMenu` local da Home foi removido;
- o topo do painel, com avatar, nome e e-mail, e area clicavel e navega para `/minha-arvore/editar`;
- o botao de fechar do painel deve apenas fechar, sem disparar a navegacao do topo;
- o item **Editar notificacoes** foi removido do menu global.

Arquivos principais:

```txt
src/app/components/layout/UserProfileMenu.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/Home.tsx
```

### Arvore: titulo, espacamento e anel conjugal

Implementado ou definido como regra:

- titulo da arvore corrigido para evitar mojibake;
- subtitulos das views da arvore podem permanecer ocultos;
- espacamento superior do titulo e distancia ate a arvore devem ser controlados por `FamilyTree.tsx`;
- `family-tree-visual-polish.css` nao deve deslocar `.react-flow__viewport`;
- `MarriageNodeData` pode aceitar `visualVariant?: 'default' | 'direct-family'`;
- marriage nodes da view **Minha Arvore** devem receber `visualVariant: 'direct-family'` quando a variante estiver implementada;
- a variante `direct-family` deve reforcar contraste, halo, borda e SVG das aliancas;
- a view **Genealogia** preserva o estilo padrao do anel/alianca;
- dimensoes do node, handles, edges e clique no modal conjugal nao devem ser alterados sem revisar layout.

Pendencias de validacao visual:

```txt
confirmar se as aliancas aparecem claramente em /minha-arvore
confirmar se o titulo tem padding superior adequado
confirmar se o espaco titulo ↔ cards foi reduzido sem cortar cards superiores
```

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/styles/family-tree-visual-polish.css
```

### Paginas auxiliares

Implementado:

- `/calendario-familiar`: header sem mojibake, aniversario do grid com titulo em negrito e descricao **Faz X anos** em fonte menor;
- `/minha-arvore/editar`: botao **Trocar Senha**, usando fluxo de reset de senha do Supabase Auth;
- `/notificacoes`: botao **Personalizar Notificacoes** para `/ajustar-notificacoes`;
- `/ajustar-notificacoes`: titulos **Preferencias** e **Notificacoes** corrigidos na origem para evitar mojibake.

Arquivos principais:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
```

### Validacao recomendada

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/minha-arvore/editar
/notificacoes
/ajustar-notificacoes
```

Validar:

- menu compacto do header da arvore abre o painel compartilhado;
- topo do menu navega para `/minha-arvore/editar`;
- item **Editar notificacoes** nao aparece no menu;
- anel/alianca permanece clicavel e abre modal conjugal;
- aliancas em `/minha-arvore` estao visiveis;
- aliancas em `/genealogia` nao regrediram;
- titulos nao exibem mojibake;
- botao **Trocar Senha** envia o fluxo esperado;
- botao **Personalizar Notificacoes** navega corretamente.


### Status complementar

Esta atualização não deve ser lida como fechamento visual definitivo dos seguintes pontos:

```txt
menu da árvore versus menu das páginas internas
título muito próximo do topo
vazio abaixo do título
alianças pouco visíveis em /minha-arvore
```

Esses itens permanecem rastreáveis em `PLANO_PROXIMOS_PASSOS.md` até validação visual conclusiva.

---

## Atualizacao 2026-06-08 - Perfil, Minha Arvore, Forum e reacoes

Esta atualizacao consolida os prompts 1 a 8 da rodada de ajustes.

Commits de referencia:

```txt
657e39a feat: add profile reset and admin person id copy
b5608ee feat: add profile suggestion and move edit button
228713d feat: refine conjugal relationship modal
873cd4b fix: refine my tree layout interactions
8b5d93e feat: refine my tree edit page
c305ef7 feat: refine forum topic creation
29ab5b1 feat: notify mentioned and related forum people
4d51bc3 feat: refine forum topic view
0eef06c feat: update forum reactions
568ed5e fix: use available icon for forum prayer reaction
```

### Consolidado

- reset admin de perfil preserva relacoes familiares e remove dados derivados/usuario;
- defaults booleanos de privacidade e contato em `pessoas` passam a `true`;
- lista admin de pessoas copia ID por botao de icone;
- `/pessoa/:id` move edicao para botao redondo ao lado do favorito;
- sugestoes de informacoes entram em revisao admin quando o usuario nao tem permissao;
- modal conjugal usa texto humano e permite sugestoes;
- `/minha-arvore` bloqueia scroll externo, ajusta titulo/cards, remove borda extra da pessoa principal e colore alianca pelos conectores;
- `/minha-arvore/editar` separa filhos humanos de pets, concentra foto no avatar, remove botao Sair, adiciona Eventos da Vida e ajusta Arquivos Historicos;
- `/forum/novo` usa categorias por cards e busca em pessoas relacionadas;
- forum dispara notificacoes para pessoas relacionadas/mencionadas;
- `/forum/topico/:id` usa badges, avatares, mencoes clicaveis e reacoes por icone;
- reacoes sao unicas por usuario/alvo.

### Validacao registrada

- builds locais foram executados apos os prompts;
- falha por `Rose` inexistente em `lucide-react` foi corrigida com `Flower2`;
- `git diff --check` passou nas validacoes relatadas.

### Validacao ainda recomendada

```txt
/minha-arvore
/minha-arvore/editar
/pessoa/:id
/admin/pessoas
/admin/solicitacoes-vinculos
/forum/novo
/forum/topico/:id
/ajustar-notificacoes
```

Validar em desktop, tablet e mobile quando houver sessao autenticada disponivel.

