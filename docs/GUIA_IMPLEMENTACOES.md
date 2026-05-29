# Guia de implementações — Árvore Família

> Última revisão: 2026-05-29  
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`  
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra **o que já foi implementado** no projeto **Árvore Família**, o comportamento esperado das frentes consolidadas, os principais arquivos envolvidos e as decisões técnicas que não devem ser reabertas sem motivo técnico ou de produto.

Este guia responde à pergunta: **“o que existe hoje e como deve se comportar?”**

Ele não deve funcionar como checklist de execução, manual de troubleshooting ou documentação detalhada de uma funcionalidade específica.

Use também:

- `docs/README.md`: índice canônico da documentação.
- `docs/PLANO_PROXIMOS_PASSOS.md`: fechamento de MVP, pendências e backlog pós-MVP.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação e correção por sintoma.
- `docs/GUIA_COMPONENTES.md`: catálogo técnico de componentes reutilizáveis.
- `docs/GUIA_UX_LAYOUT.md`: decisões de UX, layout e responsividade.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: operação de migrations, banco e scripts SQL.
- `docs/funcionalidades/*.md`: documentação específica por funcionalidade.

---

## 1. Estado consolidado do MVP

As frentes principais do MVP estão implementadas no escopo atual. Algumas dependem de configuração operacional externa, especialmente notificações automáticas, e outras têm evolução prevista pós-MVP.

| Frente | Status MVP | Decisão consolidada |
|---|---|---|
| 7.1 Notificações | Concluída tecnicamente | Central em `/notificacoes`, preferências em `/ajustar-notificacoes`, canal interno, e-mail real via provider configurável, rotina manual, Edge Function diária preparada, logs e deduplicação. Cron automático depende de configuração segura externa. |
| 7.2 Astrologia e acontecimentos do nascimento | Concluída no escopo atual | Perfil lê insights persistidos. Geração/regeneração é ação admin. Cards vazios não aparecem no perfil público. |
| 7.3 Timeline | Implementada funcionalmente | Linha do tempo derivada dos dados existentes; edição avançada, upload por evento, privacidade por evento e PDF ficam pós-MVP. |
| 7.4 WhatsApp no perfil | Concluído no frontend | Botão/link controlado por telefone e permissões; sem WhatsApp Business API no MVP. |
| 7.5 Grau de parentesco/vínculo | Consolidado funcionalmente | Utilitário puro, testes unitários e integração em Home/perfil. Integrações visuais mais profundas ficam pós-MVP. |
| 7.6 Exportação de área da árvore | Concluída no escopo atual | Exporta área visível/selecionada da árvore como PNG, PDF ou impressão; árvore completa fica pós-MVP. |
| 7.7 Legendas visuais da árvore | Concluída no frontend | Legenda no painel lateral; também controla filtros/camadas visuais quando recebe callbacks. |
| 7.8 Favoritos | Primeira camada aprovada | Favorito de pessoa implementado. Expansão para arquivos, fórum, eventos e outros itens fica pós-MVP. |
| 7.9 Página de favoritos | Primeira versão aprovada | Listagem, busca, filtros, abertura e remoção funcionais. |
| 7.10 Responsividade mobile/tablet | Concluída | QA técnico e visual aprovado em 2026-05-19 para as larguras obrigatórias. |
| Home pública e legal | Implementada | `/entrar` configurável no admin, aceite legal obrigatório no primeiro acesso, `noindex/nofollow` em `index.html`. |
| Headers e margens internas | Implementados | Páginas internas usam `MemberPageHeader`; Home pós-login mantém header próprio. |
| Viewport das views da árvore | Ajustado | Minha Árvore usa bounds reais de cards; Genealogia/Visão Completa usam zoom por largura e título fixo único. |
| Vínculo admin usuário-pessoa | Corrigido e validado | RPC `admin_list_profiles_for_linking` corrigida; migrations local/remoto alinhadas no histórico recente. |
| Autocomplete de endereço | Concluído no frontend | Admin e dados do usuário usam Google Places quando houver chave; fallback mantém input normal. |
| Calendário familiar | Ajustes residuais concluídos | Categorias na sidebar, filtros clicáveis, pluralização e texto “Faz X anos”. |

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

Áreas implementadas no MVP:

- árvore familiar;
- perfis de pessoa;
- administração de pessoas;
- administração de relacionamentos;
- solicitações de vínculos/alterações;
- arquivos históricos;
- histórico de atividades;
- fórum;
- Google Calendar;
- notificações;
- timeline;
- favoritos;
- insights de nascimento;
- exportação de área da árvore;
- legenda visual da árvore;
- headers internos padronizados;
- responsividade mobile/tablet.

Regra de organização:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são históricos, diagnósticos ou operacionais.
- Ajustes visuais não devem criar migration.
- Mudanças de schema devem ser documentadas também em `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 3. Acesso, permissões e rotas

Documentação detalhada recomendada:

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
- a árvore principal usa `TreeAccessRoute`;
- `/` redireciona para `/minha-arvore` preservando search params, como `?pessoa=...`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` usam o mesmo shell `Home` protegido por `TreeAccessRoute`;
- `viewMode` é derivado da rota por helpers em `treeViewMode.ts`;
- a página antiga de edição/dados da árvore pessoal permanece em `/minha-arvore/editar` com `MemberRoute`;
- o botão **Painel administrativo** aparece apenas para administradores;
- usuário comum não deve acessar rotas administrativas;
- admin acessa `/admin` diretamente;
- `/admin/login` não deve ser usado como caminho principal do menu do usuário.

Rotas de usuário/membro implementadas:

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

Regra de manutenção:

> Ao alterar rotas ou guards, atualizar também `docs/arquitetura/ROTAS_E_GUARDS.md`, `docs/GUIA_CORRECAO_ERROS.md` e, se afetar UX, `docs/GUIA_UX_LAYOUT.md`.

---

## 4. Home, headers e margens

### 4.1 Home pública, aceite legal e indexação

Implementado:

- `/entrar` lê `public.site_visual_settings` com fallback seguro para o visual padrão;
- admin gerencia logo, mídia de background, cor de fundo em opções fixas e opacidade em `/admin/home`;
- primeiro acesso exige aceite explícito dos termos de uso e da política de privacidade antes de criar conta;
- `index.html` usa título `Árvore Genealógica da Família`, `lang="pt-BR"` e metatags `noindex/nofollow`;
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

- Home pós-login mantém header próprio, diferente do header das páginas internas;
- Home atua como shell único das três views da árvore;
- `treeViewMode` é derivado da rota atual por helpers em `treeViewMode.ts`;
- troca de view pelo header e pela navegação mobile usa função central em `Home.tsx`;
- troca de view usa navegação client-side e preserva search params;
- painel lateral da árvore contém as abas **Filtros** e **Legendas**;
- o botão **Ações** usa ícone `Printer`, mostra texto no desktop e apenas ícone no mobile;
- o botão **Ações** abre o painel/ação de informações, fora da toggle principal do painel lateral;
- o botão de recolher/expandir painel lateral foi unificado para evitar duplicidade;
- em desktop, o botão fica dentro ou junto ao painel;
- em mobile/largura reduzida, apenas um botão de expandir/recolher deve aparecer;
- loading atual: **“Buscando pessoas e relacionamentos…”**, sem complemento “no Supabase”.

Componentes extraídos da Home:

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

Esses arquivos são componentes/auxiliares de apresentação ou funções puras. Estados principais, handlers de orquestração, carregamento da árvore, Supabase e filtros continuam em `Home.tsx`.

### 4.3 Header compartilhado das páginas internas

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

- páginas internas usam header compartilhado baseado no padrão visual de `/minha-arvore`;
- margens laterais são padronizadas com `PAGE_CONTAINER_CLASS`;
- ações de navegação ficam agrupadas de forma responsiva;
- Home pós-login continua com header próprio por regra de produto.

---

## 5. Pessoas, formulários e dados pessoais

Documentação específica:

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

- criação e edição de pessoa via admin;
- edição dos próprios dados pelo usuário conforme permissão;
- formulário dividido em blocos reutilizáveis;
- rascunho preservado em `sessionStorage`;
- rascunho removido após salvamento concluído;
- dados básicos, datas, locais, biografia, contato, privacidade, redes sociais, eventos pessoais, relacionamentos pendentes e dados conjugais são tratados em blocos específicos;
- botões internos que não submetem formulário usam `type="button"`;
- preview/download de arquivos não limpa o formulário;
- alterações de vínculo por usuário comum viram solicitações, não alteração direta;
- `PersonContactFields` usa `AddressAutocompleteInput` para endereço;
- `MeusDados` e admin usam autocomplete Google Places para endereço;
- `src/app/utils/googleAddress.ts` formata o endereço retornado pelo Google;
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
- exterior: `Cidade (País)`;
- flags `local_nascimento_exterior` e `local_falecimento_exterior`.

Migration relacionada:

```txt
20260514133000_add_exterior_location_flags_to_pessoas.sql
```

### 5.3 Busca sem acentuação

Helpers:

```txt
normalizeSearchText
includesNormalizedText
```

Comportamento esperado:

- busca ignora caixa e acentos;
- `Marcio` encontra `Márcio`;
- `Sao Paulo` encontra `São Paulo`.

### 5.4 Vínculo admin usuário-pessoa

Implementado:

- card **Usuários vinculados a esta pessoa** em `AdminPessoaForm`;
- listagem de usuários disponíveis via RPC `admin_list_profiles_for_linking`;
- correção da RPC na migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`;
- frontend não usa fallback inseguro de consulta direta em `profiles`.

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
- primeiro perfil social permanece sincronizado com campos legados em `pessoas` quando aplicável;
- campos legados continuam por compatibilidade;
- exibição no perfil respeita privacidade.

Fora do MVP:

- persistência completa e UX avançada para múltiplas redes sociais, caso o uso real exija.

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
- edição diretamente na timeline;
- exportação PDF de timeline/eventos.

---

## 8. Arquivos históricos e Storage

Documentação específica recomendada:

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
- novos arquivos históricos usam bucket `historical-files`;
- novos arquivos não devem ser salvos como base64;
- base64/data URL legado continua compatível;
- preview de imagem funciona;
- preview de PDF funciona quando possível;
- após upload de novo arquivo, o input nativo fica oculto;
- campos e botões **Cancelar**/**Adicionar** ficam ocultos imediatamente após upload;
- mensagem verde **“✓ Arquivo carregado”** permanece visível;
- imagem carregada mostra thumbnail;
- PDF carregado mostra card com ícone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- após upload, usuário ainda pode preencher título, descrição, ano e categoria;
- arquivos existentes permitem editar título, ano, descrição e categoria histórica;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- usuário comum visualiza arquivos de relacionamento conforme permissão;
- admin gerencia arquivos via formulário/perfil.

Categoria histórica:

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

- `20260522121000_add_historical_file_event_category.sql` é pré-requisito de deploy para versões que enviam `categoria_evento` no payload;
- se o ambiente remoto ainda não recebeu a migration, insert/update em `arquivos_historicos` pode falhar;
- não remover `categoria_evento` do payload para mascarar ambiente desatualizado.

Compatibilidade mantida:

- `public.pessoas.arquivos_historicos` continua existindo por compatibilidade até auditoria futura;
- base64 legado não deve ser removido automaticamente.

---

## 9. Relacionamentos, vínculos e dados conjugais

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
- usuário comum envia solicitação de criação, remoção ou correção;
- relacionamento real não é alterado diretamente por usuário comum;
- solicitações usam `relationship_change_requests`;
- admin aprova/rejeita solicitações;
- aprovação aplica alteração real;
- rejeição não altera relacionamento real.

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

- observações internas aparecem apenas para admin;
- dados conjugais são preservados em rascunho;
- modal de relacionamento não deve salvar antes do botão principal do formulário;
- em `/minha-arvore`, o botão individual **Salvar casamento** foi removido;
- botão geral **Salvar meus dados** também processa `marriageForms`;
- admin atualiza o relacionamento conjugal principal e tenta atualizar o inverso quando existir;
- usuário não-admin cria solicitação via `relationshipChangeRequestService`;
- proteção contra solicitação pendente duplicada continua em `findPendingDuplicateRelationshipChangeRequest`;
- local de casamento inválido não bloqueia dados pessoais, mas deixa casamento sem salvar e exibe aviso.

---

## 10. Árvore, Minha Árvore, Genealogia e Visão Completa

Documentações específicas recomendadas:

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

### 10.1 Modos de visualização

- **Minha Árvore** mantém layout próprio em torno da pessoa central.
- **Genealogia** usa escopo pessoal com layout por gerações.
- **Visão Completa** usa base completa com layout por gerações.

Comportamentos consolidados:

- conectores pais-filhos são ortogonais nas views por geração;
- cônjuges dos filhos não são tratados como filhos reais;
- conectores/anéis são filtrados conforme pessoas visíveis;
- anel de casamento aparece entre cônjuges;
- anel é clicável;
- anel abre modal conjugal;
- status visual do anel respeita união ativa, separação/divórcio, viuvez ou desconhecido.

### 10.2 Viewport e escala inicial

Comportamento consolidado:

- título/subtítulo da árvore são renderizados como overlay fixo único em `FamilyTree.tsx`;
- títulos/subtítulos internos de layout foram removidos;
- **Minha Árvore** usa bounds de cards reais (`personNode`) para evitar zoom inicial excessivamente pequeno;
- bounds de viewport e bounds de pan/arraste são tratados separadamente;
- **Genealogia** e **Visão Completa** usam zoom inicial por largura;
- altura total não reduz a escala de Genealogia/Visão Completa;
- se houver muitos cards verticalmente, o usuário deve arrastar/deslizar para baixo;
- botões `+` e `-` continuam controlando zoom conforme limites definidos.

Commits de referência:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

---

## 11. Painel lateral e legendas visuais da árvore — 7.7

Documentação específica recomendada:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Status:

- concluída no frontend;
- sem migration;
- sem Supabase;
- sem configuração administrativa.

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
- `TreeLegend` não é apenas informativa: também controla filtros reais/camadas visuais quando recebe callbacks;
- inclui `visualLineFilters`, `parentChildHighlight` e `siblingHighlight`;
- `parentChildHighlight` respeita `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` respeita `edgeFilters.irmaos`;
- estado padrão desligado mantém o visual original;
- botão flutuante duplicado de legenda foi removido;
- conteúdo da legenda foi simplificado;
- subtítulo “Cores, linhas, anéis e modos da árvore.” foi removido;
- seção “Visualização atual” e card azul da view ativa foram removidos;
- subtítulos internos dos cards de legenda foram removidos;
- “Ativa” em Anel de casamento foi renomeado para **Em relacionamento**;
- área “Views” foi removida do final do painel;
- legenda mantém seções de cards, linhas, anel de casamento e cores dos grupos quando compatível com a altura disponível;
- elementos da legenda são ignorados na exportação quando usam `data-tree-legend`.

Camadas visuais opcionais:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Regras:

- `parentChildHighlight`: destaca pais/filhos em amarelo contínuo;
- `siblingHighlight`: destaca irmãos em amarelo tracejado;
- ambos desligados por padrão;
- ambos respeitam os filtros de linhas correspondentes;
- Minha Árvore usa destaque conservador para evitar poluição visual;
- Genealogia e Visão Completa limitam linhas de irmãos a casos visíveis e seguros.

---

## 12. Demais frentes consolidadas

### 12.1 Linha do tempo — 7.3

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
- arquivos históricos;
- eventos pessoais.

A implementação é funcional e derivada dos dados existentes.

### 12.2 Grau de parentesco/vínculo — 7.5

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

- utilitário puro;
- testes unitários;
- integração em Home/perfil;
- cálculo de caminho/grau/confiança;
- sem exposição de dados sensíveis.

### 12.3 WhatsApp no perfil — 7.4

Arquivos principais:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/Home.tsx
```

Regras:

- botão aparece apenas com telefone válido e permissão;
- número textual só aparece se `permitir_exibir_telefone = true`;
- sem WhatsApp Business API no MVP.

### 12.4 Astrologia e acontecimentos — 7.2

Arquivos principais:

```txt
src/app/services/personInsightsService.ts
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
supabase/functions/generate-person-insights/index.ts
```

Comportamento consolidado:

- perfil apenas lê insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- perfil público não renderiza cards vazios;
- texto **“Conteúdo ainda não gerado.”** não aparece publicamente;
- no admin, card aparece somente quando há ação possível, conteúdo existente, loading ou erro.

### 12.5 Notificações — 7.1

Documentação específica:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Implementado:

- `/notificacoes` é central/lista de notificações em cards;
- `/ajustar-notificacoes` é página dedicada de preferências;
- `NotificationPreferencesPanel` foi extraído para toggles e salvamento;
- lista mantém marcar como lida, marcar todas como lidas, remover, loading, vazio e erro;
- `/admin/notificacoes`, logs, deduplicação, Edge Functions, Resend e rotina diária estão preparados;
- cron automático depende de configuração segura externa.

### 12.6 Exportação de área da árvore — 7.6

Documentação específica recomendada:

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

- seleção de área visível;
- exportação PNG;
- exportação PDF;
- impressão;
- sem Storage;
- sem migration;
- sem log persistido;
- exportação da árvore completa fica pós-MVP.

### 12.7 Favoritos — 7.8 e 7.9

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
- remoção;
- isolamento por usuário.

---

## 13. Responsividade mobile/tablet — 7.10

Status:

- concluída para o MVP;
- ajustes restritos a CSS, Tailwind, layout, scroll, largura, quebra de texto e usabilidade mobile/tablet;
- sem migrations;
- sem alteração de RLS;
- sem alteração de Edge Functions;
- sem alteração de services;
- sem alteração de regras de negócio de árvore, upload, vínculos, fórum, favoritos ou notificações;
- QA final técnico e visual aprovado em 2026-05-19.

Padrões consolidados:

- containers flex/grid com `min-w-0`;
- textos de usuário com `break-words`;
- IDs, e-mails, URLs e valores técnicos longos com `break-all`;
- headers e grupos de ações em `flex-col gap-2 sm:flex-row`;
- botões principais em `w-full sm:w-auto` no mobile;
- formulários longos com grids mobile-first;
- tabelas/listas largas com `overflow-x-auto` contido;
- modais longos com altura máxima e rolagem interna.

Validação final executada:

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

## 14. Fórum, Calendário Familiar e Google Calendar

### 14.1 Calendário Familiar

Documentação específica:

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
- categorias da sidebar são filtros clicáveis;
- contadores usam singular/plural: **1 evento**, **2 eventos**;
- aniversário mostra primeiro nome no card do calendário e nome completo na lista inferior;
- idade aparece como **“Faz X anos”**.

### 14.2 Fórum

Status:

- schema versionado em migration;
- categorias, tópicos, respostas, comentários, reações, denúncias e solução;
- admin usa função consolidada por `is_admin_user`;
- fluxo básico entra no MVP conforme QA manual.

### 14.3 Google Calendar

Status:

- integração versionada em migration;
- tokens devem ficar restritos a Edge Functions/service role;
- OAuth, sincronização e proteção de tokens exigem validação operacional quando a frente for priorizada.

---

## 15. Banco, migrations e objetos legados

Documentação operacional recomendada:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

Regras consolidadas:

- revisar `supabase migration list` antes de `db push`;
- usar `migration repair` apenas quando o schema remoto já refletir comprovadamente a migration;
- não criar migration para objeto legado sem consumidor runtime;
- não remover coluna/view legada sem dump recente, SQL de auditoria e QA visual;
- não commitar secrets, dumps ou tokens.

Histórico operacional recente:

- migrations pendentes de visual/home/categoria histórica foram aplicadas em histórico recente;
- `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` corrigiu `public.admin_list_profiles_for_linking()`;
- validação técnica pós-migration passou no histórico recente com build, testes, e2e, `git diff --check` e `supabase migration list`.

Objetos legados/compatibilidade:

- `public.pessoas.arquivos_historicos`: mantida por compatibilidade até validação completa;
- `public.imagens_pessoa`: legado/migrations-only;
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado;
- scripts SQL antigos de fórum/Google Calendar devem ser tratados como legado se já houver migrations oficiais.

---

## 16. Regras de segurança permanentes

Não deve acontecer:

- usuário comum acessar admin;
- usuário comum alterar relacionamento real diretamente;
- perfil gerar IA automaticamente;
- e-mail real ser enviado sem provider, secrets e teste controlado;
- push/WhatsApp fingirem envio real;
- dados novos serem salvos como base64;
- logs, favoritos, timeline ou notificações salvarem dados sensíveis;
- `/admin/integridade` alterar dados;
- `supabase db push` ser usado sem revisar migrations;
- secrets entrarem no frontend ou no repositório;
- responsividade ignorar árvore, legenda e seleção de área;
- título/subtítulo interno voltar a aparecer nas views Genealogia/Visão Completa;
- legenda ou overlay aparecerem em exportação;
- filtros visuais serem persistidos como regra de negócio.

---

## 17. Observações de manutenção documental

Este arquivo deve permanecer como inventário consolidado. Para evitar repetição:

- detalhes de rotas devem migrar para `docs/arquitetura/ROTAS_E_GUARDS.md`;
- detalhes de migrations e banco devem migrar para `docs/operacao/MIGRATIONS_SUPABASE.md`;
- detalhes de exportação devem migrar para `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- detalhes de Minha Árvore devem permanecer em `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- detalhes de legenda, painel e conectores devem permanecer em `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- histórico de commits e diagnósticos deve ir para `docs/historico/`, não para este guia.

