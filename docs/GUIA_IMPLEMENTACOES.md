# Guia de implementações — Árvore Família

## Objetivo

Este documento registra **o que já foi implementado** no projeto **Árvore Família**, o comportamento esperado de cada frente, os principais arquivos envolvidos e as decisões técnicas consolidadas.

Este guia não é um checklist de próximos passos nem um manual de correção de erros. Para isso, use:

- `docs/PLANO_PROXIMOS_PASSOS.md`: ordem restante até o lançamento, validações finais e backlog pós-MVP.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma, arquivos prováveis e correções.
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`: comportamento específico do calendário familiar.
- `docs/funcionalidades/NOTIFICACOES.md`: arquitetura específica de notificações.
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: detalhes de perfil público, admin de pessoa e vínculos.
- `docs/funcionalidades/TIMELINE.md`: arquitetura específica da timeline.

---

## 1. Estado consolidado do MVP

| Frente | Status MVP | Observação |
|---|---|---|
| 7.1 Notificações | Concluída tecnicamente | Central em `/notificacoes`, preferências em `/ajustar-notificacoes`, canal interno, e-mail real, rotina manual, Edge Function diária preparada, logs e deduplicação. Cron automático depende de configuração segura externa. |
| 7.2 Astrologia e acontecimentos do nascimento | Concluída no escopo atual | Perfil lê insights persistidos e não exibe cards vazios; geração/regeneração é ação admin. |
| 7.3 Linha do tempo do usuário | Implementada funcionalmente | Primeira versão derivada dos dados existentes, sem tabela própria. |
| 7.4 WhatsApp no perfil | Concluído no frontend | Botão/link controlado por telefone e permissões; sem WhatsApp Business API. |
| 7.5 Grau de parentesco/vínculo | Consolidado funcionalmente | Utilitário puro, testes unitários e integração em Home/perfil. |
| 7.6 Exportação de área da árvore | Concluída no escopo atual | Exporta viewport visível da árvore como PNG/PDF/impressão; QA manual aprovado. |
| 7.7 Legendas visuais da árvore | Concluída no frontend | Legenda simplificada no painel lateral; sem legenda flutuante duplicada. |
| 7.8 Favoritos | Primeira camada aprovada para MVP | Favorito de pessoa e página `/meus-favoritos` implementados e validados manualmente. |
| 7.9 Página de favoritos | Primeira versão aprovada para MVP | Listagem, busca, filtros, abertura e remoção funcionais. |
| 7.10 Responsividade mobile/tablet | Concluída | Blocos 1 a 7 finalizados; QA técnico e visual de lançamento aprovado em 2026-05-19. |
| Home pública e legal | Implementada | `/entrar` configurável no admin, aceite legal obrigatório no primeiro acesso, noindex em `index.html` e script manual de limpeza de dados de teste. |
| Headers e margens internas | Implementados | Páginas internas usam header compartilhado baseado em `/minha-arvore`; Home pós-login mantém header próprio. |
| Viewport das views da árvore | Ajustado | Minha Árvore usa bounds reais de cards; Genealogia/Visão Completa usam zoom por largura e título fixo único. |

---

## 2. Arquitetura base

Stack atual:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Supabase Auth;
- Supabase PostgreSQL/RLS/RPCs;
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
- solicitações de vínculos;
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

---

## 3. Acesso, permissões e rotas

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
```

Comportamento consolidado:

- rotas administrativas usam `ProtectedRoute`;
- rotas de membro usam `MemberRoute`;
- a árvore principal usa `TreeAccessRoute`;
- o botão **Painel administrativo** aparece apenas para administradores;
- usuário comum não deve acessar rotas administrativas;
- admin acessa `/admin` diretamente;
- `/admin/login` não deve ser usado como caminho principal do menu do usuário.

Rotas de usuário/membro implementadas:

- `/minha-arvore`;
- `/meus-dados`;
- `/meus-vinculos`;
- `/vincular-perfil`;
- `/pessoa/:id`;
- `/pessoas/:id`;
- `/meus-favoritos`;
- `/notificacoes`;
- `/ajustar-notificacoes`;
- `/forum`;
- `/forum/novo`;
- `/forum/topico/:id`;
- `/forum/topico/:id/editar`;
- `/calendario-familiar`.

Rotas administrativas implementadas:

- `/admin`;
- `/admin/dashboard`;
- `/admin/home`;
- `/admin/pessoas`;
- `/admin/pessoas/nova`;
- `/admin/pessoas/:id/editar`;
- `/admin/relacionamentos`;
- `/admin/relacionamentos/novo`;
- `/admin/importacao`;
- `/admin/migrar-dados`;
- `/admin/diagnostico`;
- `/admin/integridade`;
- `/admin/atividades`;
- `/admin/notificacoes`;
- `/admin/solicitacoes-vinculos`.

---

## 4. Home, headers e margens

### Home pública, aceite legal e indexação

Implementado:

- `/entrar` lê `public.site_visual_settings` com fallback seguro para o visual padrão;
- admin gerencia logo, mídia de background, cor de fundo em 10 opções fixas e opacidade em `/admin/home`;
- primeiro acesso exige aceite explícito dos termos de uso e da política de privacidade antes de criar conta;
- `index.html` usa título `Árvore Genealógica da Família`, `lang="pt-BR"` e metatags `noindex/nofollow`;
- limpeza de dados de teste fica em script manual comentado: `scripts/cleanup-test-user-9feabe7c.sql`.

Migration relacionada:

```txt
20260519180000_create_site_visual_settings.sql
```

### Home autenticada

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

Comportamento consolidado:

- Home pós-login mantém header próprio, diferente do header das páginas internas;
- margens laterais do header principal foram padronizadas com o restante do layout;
- painel lateral da árvore contém as abas **Filtros** e **Legendas**;
- o botão **Ações** usa ícone `Printer`, mostra texto no desktop e apenas ícone no mobile;
- o botão **Ações** abre o painel interno `activeSidebarPanel = 'info'`;
- o botão de recolher/expandir painel lateral foi unificado para evitar duplicidade;
- em desktop, o botão fica dentro ou junto ao painel;
- em mobile/largura reduzida, apenas um botão de expandir/recolher deve aparecer.
- loading atual: **“Buscando pessoas e relacionamentos…”**, sem complemento “no Supabase”.

### Header compartilhado das páginas internas

Arquivos principais:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

Comportamento implementado:

- páginas internas usam header compartilhado baseado no padrão visual de `/minha-arvore`;
- as margens laterais são padronizadas com `PAGE_CONTAINER_CLASS`;
- `/minha-arvore`, `/calendario-familiar`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/admin` compartilham a mesma estrutura;
- a Home pós-login continua com header próprio por regra de produto;
- ações de navegação ficam agrupadas de forma responsiva.

---

## 5. Pessoas, formulários e dados pessoais

Documentação específica:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

Arquivos principais:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person
src/app/utils/personFields.ts
src/app/utils/googleAddress.ts
src/app/services/dataService.ts
```

Comportamento implementado:

- criação e edição de pessoa via admin;
- formulário dividido em blocos reutilizáveis;
- rascunho preservado em `sessionStorage`;
- rascunho remove dados após salvamento concluído;
- dados básicos, datas, locais, biografia, contato, privacidade, redes sociais, eventos pessoais, relacionamentos pendentes e dados conjugais são tratados em blocos específicos;
- botões internos que não submetem formulário usam `type="button"`;
- preview/download de arquivos não limpa o formulário;
- usuário edita os próprios dados conforme permissão;
- alterações de vínculo por usuário comum viram solicitações, não alteração direta.
- `PersonContactFields` usa `AddressAutocompleteInput` para endereço;
- `MeusDados` e o admin usam autocomplete Google Places para endereço;
- `src/app/utils/googleAddress.ts` formata o endereço retornado pelo Google;
- se `VITE_GOOGLE_MAPS_API_KEY` não existir ou o Google falhar, o campo continua como input normal, sem bloquear o formulário.

### Pessoa falecida

Implementado:

- campo booleano `falecido`;
- helper `isPersonDeceased`;
- pessoa considerada falecida quando `falecido = true`, `data_falecimento` existe ou `local_falecimento` existe.

Migration relacionada:

```txt
20260514130000_add_falecido_to_pessoas.sql
```

### Locais no exterior

Implementado:

- Brasil: `Cidade/UF`;
- exterior: `Cidade (País)`;
- flags `local_nascimento_exterior` e `local_falecimento_exterior`.

Migration relacionada:

```txt
20260514133000_add_exterior_location_flags_to_pessoas.sql
```

### Busca sem acentuação

Helpers:

- `normalizeSearchText`;
- `includesNormalizedText`.

Comportamento esperado:

- busca ignora caixa e acentos;
- `Marcio` encontra `Márcio`;
- `Sao Paulo` encontra `São Paulo`.

### Vínculo admin usuário-pessoa

Implementado:

- o card **Usuários vinculados a esta pessoa** fica em `AdminPessoaForm`;
- a listagem de usuários disponíveis usa a RPC `admin_list_profiles_for_linking`;
- a correção da RPC está na migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`;
- essa migration foi aplicada no Supabase remoto e local/remoto ficaram alinhados em `supabase migration list`;
- o frontend não usa fallback inseguro de consulta direta em `profiles`.

---

## 6. Redes sociais

Arquivos principais:

```txt
src/app/components/person/SocialProfilesEditor
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
```

Comportamento implementado:

- UI usa `SocialProfilesEditor`;
- primeiro perfil social continua sincronizado com campos legados em `pessoas`;
- campos legados permanecem por compatibilidade.

Fora do MVP:

- persistência completa de múltiplas redes sociais em tabela própria.

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

- imigração;
- chegada ao Brasil;
- mudança;
- batismo;
- formatura;
- profissão;
- serviço militar;
- evento religioso;
- memória;
- outro.

Logs implementados:

- `person_event.added`;
- `person_event.updated`;
- `person_event.removed`.

Fora do MVP:

- upload por evento;
- privacidade por evento;
- edição diretamente na timeline;
- exportação PDF de timeline/eventos.

---

## 8. Arquivos históricos e Storage

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
- após upload de novo arquivo, campos e botões **Cancelar**/**Adicionar** ficam ocultos imediatamente;
- mensagem verde **“✓ Arquivo carregado”** permanece visível;
- imagem carregada mostra thumbnail;
- PDF carregado mostra card com ícone/label PDF;
- clicar em **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- após upload, usuário ainda pode preencher título, descrição, ano e categoria;
- arquivos existentes permitem editar título, ano, descrição e categoria histórica;
- download é ação explícita;
- fallback de abrir em nova aba existe para download cross-origin;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- usuário comum visualiza arquivos de relacionamento conforme permissão;
- admin gerencia arquivos via formulário/perfil.

Categoria histórica:

- tipo `HistoricalFileEventCategory` em `src/app/types/index.ts`;
- campo `ArquivoHistorico.categoria_evento`;
- coluna `public.arquivos_historicos.categoria_evento`;
- migration `supabase/migrations/20260522121000_add_historical_file_event_category.sql`;
- constraint aceita `certidao_nascimento`, `certidao_casamento`, `alistamento_militar`, `imigracao`, `divorcio`, `carreira_profissional`, `mudanca_cidade`, `certidao_obito` e `outro`.

Risco operacional:

- `20260522121000_add_historical_file_event_category.sql` é pré-requisito de deploy para o commit `ce482a2`;
- se o ambiente remoto ainda não recebeu a migration, insert/update em `arquivos_historicos` pode falhar por ausência da coluna `categoria_evento`;
- listagens podem continuar funcionando, mas salvar/inserir/atualizar envia payload com `categoria_evento`.

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

- `relationship_change_requested`;
- `relationship_change_approved`;
- `relationship_change_rejected`;
- `relationship_change_cancelled`.

### Dados conjugais

Componente:

- `MarriageDetailsEditor`

Campos:

- `data_casamento`;
- `local_casamento`;
- `ativo`;
- `data_separacao`;
- `local_separacao`;
- `observacoes`.

Regras:

- observações internas aparecem apenas para admin;
- dados conjugais são preservados em rascunho;
- modal de relacionamento não deve salvar antes do botão principal do formulário.
- em `/minha-arvore`, o botão individual **Salvar casamento** foi removido;
- o botão geral **Salvar meus dados** também processa `marriageForms`;
- admin atualiza o relacionamento conjugal principal e tenta atualizar o inverso quando existir;
- usuário não-admin cria solicitação via `relationshipChangeRequestService`;
- proteção contra solicitação pendente duplicada continua em `findPendingDuplicateRelationshipChangeRequest`;
- local de casamento inválido não bloqueia os dados pessoais, mas deixa o casamento sem salvar e exibe aviso.

UX de `/minha-arvore`:

- cards da seção **Escopo da visualização** exibem avatar circular com foto ou iniciais.

---

## 10. Árvore, Minha Árvore, Genealogia e Visão Completa

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

### Modos de visualização

Comportamento implementado:

- **Minha Árvore** mantém layout próprio em torno da pessoa central;
- **Genealogia** usa escopo pessoal com layout por gerações;
- **Visão Completa** usa base completa com layout por gerações;
- conectores pais-filhos são ortogonais nas views por geração;
- cônjuges dos filhos não são tratados como filhos reais;
- conectores/anéis são filtrados conforme pessoas visíveis;
- anel de casamento aparece entre cônjuges;
- anel é clicável;
- anel abre modal conjugal;
- status visual do anel respeita união ativa, separação/divórcio, viuvez ou desconhecido.

### Viewport e escala inicial

Comportamento consolidado após ajustes:

- título/subtítulo da árvore são renderizados como overlay fixo único em `FamilyTree.tsx`;
- títulos/subtítulos internos de layout foram removidos de `directFamilyDistributedLayout.ts` e `genealogyColumnsLayout.ts`;
- **Minha Árvore** usa bounds de cards reais (`personNode`) para evitar zoom inicial excessivamente pequeno;
- bounds de viewport e bounds de pan/arraste são tratados separadamente;
- **Genealogia** e **Visão Completa** usam zoom inicial por largura, sem reduzir a escala por causa da altura total;
- **Genealogia** e **Visão Completa** começam na mesma posição vertical de referência da Minha Árvore;
- se houver muitos cards verticalmente em Genealogia/Visão Completa, o usuário deve arrastar/deslizar para baixo;
- os botões `+` e `-` continuam controlando zoom respeitando os limites definidos.

Commits de referência:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

---

## 11. Painel lateral e legendas visuais da árvore — 7.7

Status:

- concluída no frontend;
- sem migration;
- sem Supabase;
- sem configuração administrativa.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/FamilyTree.tsx
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
- legenda mantém seções de cards, linhas, anel de casamento e cores dos grupos;
- elementos da legenda são ignorados na exportação PNG/PDF/impressão via `data-tree-legend`, quando aplicável.

---

## 12. Demais frentes consolidadas

### Linha do tempo — 7.3

Arquivos principais:

```txt
src/app/utils/buildPersonTimeline.ts
src/app/components/Timeline/PersonTimeline.tsx
src/app/pages/PersonProfile.tsx
```

Fontes usadas: nascimento, falecimento, relacionamentos, filhos, arquivos históricos e eventos pessoais. A implementação é funcional, derivada dos dados existentes, sem tabela nova e sem migration.

### Grau de parentesco/vínculo — 7.5

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

Utilitário puro, com testes unitários, integração em Home/perfil, caminho/grau/confiança e sem exposição de dados sensíveis.

### WhatsApp no perfil — 7.4

Arquivos principais:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/Home.tsx
```

Botão aparece apenas com telefone válido e permissão. Número textual só aparece se `permitir_exibir_telefone = true`.

### Astrologia e acontecimentos — 7.2

Arquivos principais:

```txt
src/app/services/personInsightsService.ts
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
supabase/functions/generate-person-insights/index.ts
```

Perfil apenas lê insights persistidos. Admin gera/regenera explicitamente. Secrets ficam server-side.

Comportamento consolidado:

- o perfil público não renderiza cards vazios de astrologia/acontecimentos;
- o texto **“Conteúdo ainda não gerado.”** não deve aparecer publicamente;
- no admin, o card de insights aparece somente quando há ação possível, conteúdo existente, loading ou erro.

### Notificações — 7.1

Documentação específica:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Implementado:

- `/notificacoes` é a central/lista de notificações em cards;
- `/ajustar-notificacoes` é a página dedicada de preferências;
- `NotificationPreferencesPanel` foi extraído para toggles e salvamento de preferências;
- a lista mantém marcar como lida, marcar todas como lidas, remover, loading, vazio e erro;
- `/admin/notificacoes`, logs, deduplicação, Edge Functions, Resend e rotina diária estão preparados;
- cron automático depende de configuração segura externa, conforme `docs/funcionalidades/NOTIFICACOES.md`.

Arquivos principais:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/services/userEngagementService.ts
```

### Exportação de área da árvore — 7.6

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/pages/Home.tsx
```

Selecionar área, PNG, PDF e impressão estão concluídos no escopo atual. A exportação usa a viewport visível da `.react-flow`, sem salvar no Storage e sem migration. Exportação da árvore completa fica pós-MVP.

### Favoritos — 7.8 e 7.9

Arquivos principais:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
```

Primeira camada funcional: favoritos de pessoa, busca, filtros, remoção e isolamento por usuário.

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

- `npm run build`;
- `npm test`;
- `npm run test:e2e`;
- `git diff --check`;
- `supabase migration list`;
- QA visual em 320px, 375px, 390px, 430px, 768px e desktop.

---

## 14. Fórum e Google Calendar

### Calendário Familiar

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

- o bloco superior de **Categorias** foi removido;
- **Categorias** fica na sidebar;
- categorias da sidebar são filtros clicáveis;
- contadores usam singular/plural: **1 evento**, **2 eventos**;
- aniversário mostra primeiro nome no card do calendário e nome completo na lista inferior;
- idade aparece como **“Faz X anos”**.

### Fórum

Status:

- schema versionado em migration;
- contempla categorias, tópicos, respostas, comentários, reações, denúncias e solução;
- admin usa função consolidada por `is_admin_user`;
- fluxo básico entra no MVP conforme QA manual já realizado.

### Google Calendar

Status:

- integração versionada em migration;
- tokens devem ficar restritos a Edge Functions/service role;
- OAuth, sincronização e proteção de tokens exigem validação operacional quando a frente for priorizada.

---

## 15. Banco, migrations e objetos legados

Regras consolidadas:

- revisar `supabase migration list` antes de `db push`;
- usar `migration repair` apenas quando o schema remoto já refletir comprovadamente a migration;
- não criar migration para objeto legado sem consumidor runtime;
- não remover coluna/view legada sem dump recente, SQL de auditoria e QA visual.

Histórico operacional recente:

- no `supabase db push` citado no histórico do projeto, também foram aplicadas as migrations pendentes `20260519180000_create_site_visual_settings.sql`, `20260520100000_support_admin_managed_user_person_links.sql` e `20260522121000_add_historical_file_event_category.sql`;
- a migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` foi aplicada no remoto para recriar `public.admin_list_profiles_for_linking()` e resolver o erro de schema cache no vínculo admin usuário-pessoa.

Validação técnica final pós-migration:

- `npm run build` aprovado;
- `npm test` aprovado com 28 testes;
- `npm run test:e2e` aprovado com 5 testes;
- `git diff --check` sem erros;
- `supabase migration list` alinhado até `20260522173000`;
- worktree limpo após remoção de `test-results/`.

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
- e-mail real ser enviado sem provider/secrets/teste controlado;
- push/WhatsApp fingirem envio real;
- dados novos serem salvos como base64;
- logs, favoritos, timeline ou notificações salvarem dados sensíveis;
- `/admin/integridade` alterar dados;
- `supabase db push` ser usado sem revisar migrations;
- secrets entrarem no frontend ou no repositório;
- responsividade ignorar árvore, legenda e seleção de área;
- título/subtítulo interno voltar a aparecer nas views Genealogia/Visão Completa.

---

## 17. Atualização recente — legenda funcional, camadas visuais e painel lateral

### 17.1 Legenda visual 7.7 consolidada

A frente 7.7 evoluiu de legenda explicativa para legenda funcional no painel lateral.

Além de explicar cards, linhas e anel de casamento, a legenda pode controlar:

- filtros de status de pessoa;
- filtros de linhas;
- filtros de grupos da Minha Árvore;
- camadas visuais opcionais.

### 17.2 Camadas visuais opcionais das linhas

Implementado:

```txt
visualLineFilters.parentChildHighlight
visualLineFilters.siblingHighlight
```

Comportamento:

- `parentChildHighlight`: destaca pais/filhos em amarelo contínuo;
- `siblingHighlight`: destaca irmãos em amarelo tracejado;
- estado inicial: desligado;
- não altera o visual padrão quando desligado;
- respeita filtros de linhas existentes.

Regras consolidadas:

- `parentChildHighlight` só aparece quando `filiacao_sangue || filiacao_adotiva` está ativo;
- `siblingHighlight` só aparece quando `edgeFilters.irmaos` está ativo;
- Minha Árvore usa destaque conservador para evitar poluição visual;
- Genealogia e Visão Completa limitam linhas de irmãos a casos visíveis e seguros.

### 17.3 Painel lateral da Home

Implementado:

- toggle principal apenas com **Filtros** e **Legendas**;
- **Informações** saiu da toggle;
- botão externo de ações/informações usa `Printer` e texto **Ações** no desktop;
- botão fica ao lado do controle de recolher/expandir;
- versão desktop e mobile preservadas;
- zoom da árvore movido para o canto superior direito.

### 17.4 Arquivos envolvidos

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

### 17.5 Commits de referência

```txt
779fee6 feat: tornar legenda visual em filtros da arvore
733eb65 feat: preparar camadas visuais opcionais da arvore
e41d9b1 feat: adicionar destaques visuais opcionais nas linhas da arvore
94b5408 style: ajustar painel lateral e controles da home
```
