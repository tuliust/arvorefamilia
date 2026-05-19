# Guia de implementações — Árvore Família

## Objetivo

Este documento registra **o que já foi implementado** no projeto **Árvore Família**, o comportamento esperado de cada frente, os principais arquivos envolvidos e as decisões técnicas consolidadas.

Este guia não é um checklist de próximos passos nem um manual de correção de erros. Para isso, use:

- `docs/PLANO_PROXIMOS_PASSOS.md`: ordem restante até o lançamento, responsividade e backlog pós-MVP.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma, arquivos prováveis e correções.
- `docs/NOTIFICACOES.md`: arquitetura específica de notificações.
- `docs/TIMELINE.md`: arquitetura específica da timeline.

---

## 1. Estado consolidado do MVP

| Frente | Status MVP | Observação |
|---|---|---|
| 7.1 Notificações | Concluída tecnicamente | Canal interno, e-mail real, usuário comum, rotina manual, Edge Function diária, `DAILY_NOTIFICATIONS_SECRET`, `pg_cron`, logs e deduplicação validados. |
| 7.2 Astrologia e acontecimentos do nascimento | Concluída no escopo atual | Perfil lê insights persistidos; geração/regeneração é ação admin. |
| 7.3 Linha do tempo do usuário | Implementada funcionalmente | Primeira versão derivada dos dados existentes, sem tabela própria. |
| 7.4 WhatsApp no perfil | Concluído no frontend | Botão/link controlado por telefone e permissões; sem WhatsApp Business API. |
| 7.5 Grau de parentesco/vínculo | Consolidado funcionalmente | Utilitário puro, testes unitários e integração em Home/perfil. |
| 7.6 Exportação de área da árvore | Concluída no escopo atual | Exporta viewport visível da árvore como PNG/PDF/impressão; QA manual aprovado. |
| 7.7 Legendas visuais da árvore | Concluída no frontend | `TreeLegend.tsx` integrado ao `FamilyTree.tsx`; QA manual aprovado. |
| 7.8 Favoritos | Primeira camada aprovada para MVP | Favorito de pessoa e página `/meus-favoritos` implementados e validados manualmente. |
| 7.9 Página de favoritos | Primeira versão aprovada para MVP | Listagem, busca, filtros, abertura e remoção funcionais. |
| 7.10 Responsividade mobile/tablet | Concluída | Blocos 1 a 7 finalizados; QA técnico e visual de lançamento aprovado em 2026-05-19. |

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
- legenda visual da árvore.

---

## 3. Acesso, permissões e rotas

### Rotas públicas, protegidas e administrativas

Arquivos principais:

- `src/app/routes.tsx`
- `src/app/components/ProtectedRoute.tsx`
- `src/app/components/MemberRoute.tsx`
- `src/app/components/TreeAccessRoute.tsx`
- `src/app/services/permissionService.ts`
- `src/app/pages/Home.tsx`

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
- `/forum`;
- `/forum/novo`;
- `/forum/topico/:id`;
- `/forum/topico/:id/editar`.

Rotas administrativas implementadas:

- `/admin`;
- `/admin/dashboard`;
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

## 4. Pessoas, formulários e dados pessoais

Arquivos principais:

- `src/app/pages/admin/AdminPessoaForm.tsx`
- `src/app/pages/MeusDados.tsx`
- `src/app/components/person`
- `src/app/utils/personFields.ts`
- `src/app/services/dataService.ts`

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

### Pessoa falecida

Implementado:

- campo booleano `falecido`;
- helper `isPersonDeceased`;
- pessoa considerada falecida quando:
  - `falecido = true`;
  - ou `data_falecimento` existe;
  - ou `local_falecimento` existe.

Migration relacionada:

- `20260514130000_add_falecido_to_pessoas.sql`

### Locais no exterior

Implementado:

- Brasil: `Cidade/UF`;
- exterior: `Cidade (País)`;
- flags:
  - `local_nascimento_exterior`;
  - `local_falecimento_exterior`.

Migration relacionada:

- `20260514133000_add_exterior_location_flags_to_pessoas.sql`

### Busca sem acentuação

Helpers:

- `normalizeSearchText`;
- `includesNormalizedText`.

Comportamento esperado:

- busca ignora caixa e acentos;
- `Marcio` encontra `Márcio`;
- `Sao Paulo` encontra `São Paulo`.

---

## 5. Redes sociais

Arquivos principais:

- `src/app/components/person/SocialProfilesEditor`
- `src/app/pages/admin/AdminPessoaForm.tsx`
- `src/app/pages/MeusDados.tsx`

Comportamento implementado:

- UI usa `SocialProfilesEditor`;
- primeiro perfil social continua sincronizado com campos legados em `pessoas`;
- campos legados permanecem por compatibilidade.

Fora do MVP:

- persistência completa de múltiplas redes sociais em tabela própria.

---

## 6. Eventos pessoais

Tabela:

- `public.person_events`

Migration:

- `20260514165000_create_person_events.sql`

Arquivos principais:

- `src/app/services/personEventsService.ts`
- `src/app/components/person/PersonEventsEditor.tsx`
- `src/app/components/person/PersonEventsList.tsx`
- `src/app/pages/admin/AdminPessoaForm.tsx`
- `src/app/pages/PersonProfile.tsx`

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

## 7. Arquivos históricos e Storage

Arquivos principais:

- `src/app/components/ArquivosHistoricos.tsx`
- `src/app/services/arquivosHistoricosService.ts`
- `src/app/services/storageService.ts`
- `src/app/components/FotoUpload.tsx`
- `src/app/components/FamilyTree/modals/ViewMarriageModal.tsx`

Comportamento implementado:

- novas fotos principais usam bucket `person-avatars`;
- novos arquivos históricos usam bucket `historical-files`;
- novos arquivos não devem ser salvos como base64;
- base64/data URL legado continua compatível;
- preview de imagem funciona;
- preview de PDF funciona quando possível;
- download é ação explícita;
- fallback de abrir em nova aba existe para download cross-origin;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- usuário comum visualiza arquivos de relacionamento conforme permissão;
- admin gerencia arquivos via formulário/perfil.

Compatibilidade mantida:

- `public.pessoas.arquivos_historicos` continua existindo por compatibilidade até auditoria futura;
- base64 legado não deve ser removido automaticamente.

---

## 8. Relacionamentos, vínculos e dados conjugais

Arquivos principais:

- `src/app/services/dataService.ts`
- `src/app/services/relationshipChangeRequestService.ts`
- `src/app/components/relationships/MarriageDetailsEditor.tsx`
- `src/app/components/RelacionamentoManager.tsx`
- `src/app/pages/admin/AdminRelacionamentos.tsx`
- `src/app/pages/admin/AdminSolicitacoesVinculos.tsx`
- `src/app/pages/MeusVinculos.tsx`

Comportamento implementado:

- admin cria, edita e remove relacionamentos reais;
- usuário comum envia solicitação de criação, remoção ou correção;
- relacionamento real não é alterado diretamente por usuário comum;
- solicitações usam `relationship_change_requests`;
- admin aprova/rejeita solicitações;
- aprovação aplica alteração real;
- rejeição não altera relacionamento real.

Migration:

- `20260513173000_create_relationship_change_requests.sql`

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

---

## 9. Árvore, Genealogia e Visão Completa

Arquivos principais:

- `src/app/components/FamilyTree/FamilyTree.tsx`
- `src/app/components/FamilyTree/buildTreeGraph.ts`
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts`
- `src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts`
- `src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts`
- `src/app/components/FamilyTree/GenealogySpouseEdge.tsx`
- `src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx`
- `src/app/pages/Home.tsx`
- `src/app/pages/MinhaArvore.tsx`

Comportamento implementado:

- **Minha Árvore** mantém layout próprio;
- **Genealogia** usa escopo pessoal com layout por gerações;
- **Visão Completa** usa base completa com layout por gerações;
- conectores pais-filhos são ortogonais nas views por geração;
- cônjuges dos filhos não são tratados como filhos reais;
- conectores/anéis são filtrados conforme pessoas visíveis;
- anel de casamento aparece entre cônjuges;
- anel é clicável;
- anel abre modal conjugal;
- status visual do anel respeita união ativa, separação/divórcio, viuvez ou desconhecido.

---

## 10. Legendas visuais da árvore — 7.7

Status:

- concluída no escopo visual/frontend;
- QA manual aprovado;
- sem migration;
- sem Supabase;
- sem configuração administrativa.

Arquivos principais:

- `src/app/components/FamilyTree/TreeLegend.tsx`
- `src/app/components/FamilyTree/FamilyTree.tsx`
- `src/app/components/FamilyTree/utils/treeExport.ts`

Comportamento implementado:

- componente visual reutilizável;
- botão **Legenda** disponível na árvore;
- painel fechado por padrão;
- layout flexível;
- explica cards, conectores, barramento vertical, anel 💍, status conjugal, cores e diferenças entre views;
- respeita os modos **Minha Árvore**, **Genealogia** e **Visão Completa**;
- não altera lógica de relacionamento, cálculo de status conjugal ou modal do anel;
- elementos da legenda são ignorados na exportação PNG/PDF/impressão via `data-tree-legend`.

---

## 11. Linha do tempo — 7.3

Status:

- implementada funcionalmente;
- primeira versão derivada dos dados existentes;
- sem tabela nova;
- sem migration.

Arquivos principais:

- `src/app/utils/buildPersonTimeline.ts`
- `src/app/components/Timeline/PersonTimeline.tsx`
- `src/app/pages/PersonProfile.tsx`

Fontes de dados usadas:

- nascimento;
- falecimento;
- relacionamentos;
- filhos;
- arquivos históricos;
- eventos pessoais em `person_events`.

Características:

- função pura;
- preserva precisão de data;
- ordena eventos;
- deduplica eventos;
- sanitiza metadata;
- exibe estado vazio quando não há dados suficientes.

Fora do MVP:

- edição manual;
- upload por evento;
- privacidade por evento;
- exportação PDF;
- consolidação visual com `PersonEventsList`, se fizer sentido.

---

## 12. Grau de parentesco/vínculo — 7.5

Status:

- funcionalmente consolidado;
- utilitário puro;
- testes unitários;
- integração em Home/perfil.

Arquivos principais:

- `src/app/utils/relationshipDegree.ts`
- `src/app/utils/relationshipDegree.test.ts`
- `src/app/utils/relationshipDegreeDisplay.ts`
- `src/app/components/person/RelationshipFinder.tsx`
- `src/app/pages/Home.tsx`
- `src/app/pages/PersonProfile.tsx`
- `src/app/services/treeDataCache.ts`

Características:

- sem Supabase;
- sem IA;
- sem cache persistido próprio;
- usa `Pessoa[]` e `Relacionamento[]` já carregados;
- considera orientação real dos relacionamentos do app;
- exibe caminho, grau, confiança e avisos amigáveis;
- não expõe dados sensíveis.

Fora do MVP:

- integração direta na árvore;
- integração na Genealogia;
- integração na Visão Completa;
- limpeza futura de `relationshipResolverService.ts`;
- testes de componente.

---

## 13. WhatsApp no perfil — 7.4

Status:

- concluído no frontend;
- sem WhatsApp Business API;
- sem envio automático;
- sem log de clique nesta etapa.

Arquivos principais:

- `src/app/utils/whatsapp.ts`
- `src/app/components/person/WhatsAppContactButton.tsx`
- `src/app/components/person/PersonDataView.tsx`
- `src/app/pages/Home.tsx`

Regras implementadas:

- botão aparece apenas com telefone válido e permissão;
- número em texto aparece somente se `permitir_exibir_telefone = true`;
- `permitir_mensagens_whatsapp = true` pode liberar botão sem exibir número;
- link é gerado por helper, não montado manualmente em cada componente.

Fora do MVP:

- privacidade forte em banco/API;
- log seguro `contact.whatsapp_clicked` sem telefone, URL ou mensagem.

---

## 14. Astrologia e acontecimentos do nascimento — 7.2

Status:

- concluída no escopo funcional atual.

Tabela:

- `public.person_generated_insights`

Migration:

- `20260518174542_reconcile_person_generated_insights_schema.sql`

Tipos implementados:

- `astrology`;
- `historical_events`.

Tipos não implementados nesta versão:

- `birth_date_events`;
- `historical_context`.

Arquivos principais:

- `src/app/services/personInsightsService.ts`
- `src/app/components/person/PersonDataView.tsx`
- `src/app/pages/admin/AdminPessoaForm.tsx`
- `src/app/pages/Home.tsx`
- `supabase/functions/generate-person-insights/index.ts`

Regras implementadas:

- perfil apenas lê insights existentes;
- perfil não gera IA automaticamente;
- conteúdo ausente vira estado vazio/informativo;
- admin gera/regenera explicitamente;
- chamada de IA fica apenas na Edge Function;
- secrets permanecem server-side;
- logs são seguros.

Logs:

- `person_insights.generated`;
- `person_insights.regenerated`.

Metadata segura:

- `tipos`;
- `force`;
- `source`.

---

## 15. Notificações — 7.1

Status:

- concluída tecnicamente;
- QA operacional manual aprovado;
- canal interno funcional;
- e-mail real validado;
- rotina manual validada;
- Edge Function diária validada;
- cron seguro configurado sem migration versionada de segredo.

Documentação específica:

- `docs/NOTIFICACOES.md`

Arquivos principais:

- `src/app/pages/Notificacoes.tsx`
- `src/app/pages/admin/AdminNotificacoes.tsx`
- `src/app/services/userEngagementService.ts`
- `src/app/services/notificationDispatchService.ts`
- `src/app/services/notificationRecipientsService.ts`
- `src/app/services/notificationTriggersService.ts`
- `src/app/services/notificationScheduledService.ts`
- `src/app/services/notificationAdminService.ts`
- `supabase/functions/send-notification-email`
- `supabase/functions/run-daily-notifications`

Implementado e validado:

- `/notificacoes`;
- `/admin/notificacoes`;
- preferências por categoria/canal;
- `notification_dispatch_logs`;
- `notification_occurrences`;
- deduplicação por `occurrence_key`;
- rotina manual de aniversários/memórias;
- gatilhos de novo arquivo histórico, novo vínculo, resposta no fórum e comentário no fórum;
- Edge Function `send-notification-email`;
- envio real de e-mail com Resend;
- Edge Function `run-daily-notifications`;
- `DAILY_NOTIFICATIONS_SECRET`;
- `pg_cron`;
- `pg_net`;
- job `run-daily-notifications-0800-brt` com agenda `0 11 * * *`;
- chamada manual via `net.http_post`;
- hardening da central do usuário para marcar/remover notificação com filtro por `id` e `user_id`;
- deduplicação sem `occurrence_key` duplicada.

Secrets usados no Supabase:

- `RESEND_API_KEY`;
- `NOTIFICATION_EMAIL_FROM`;
- `NOTIFICATION_EMAIL_REPLY_TO`;
- `SITE_URL`;
- `DAILY_NOTIFICATIONS_SECRET`.

Fora do MVP:

- push real;
- WhatsApp real;
- fila/retry avançado;
- cron automático por migration versionada com segredo hardcoded.

---

## 16. Exportação de área da árvore — 7.6

Status:

- concluída no escopo atual;
- diagnóstico concluído;
- implementação concluída;
- QA técnico concluído;
- QA manual dirigido aprovado.

Arquivos principais:

- `src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx`
- `src/app/components/FamilyTree/utils/treeExport.ts`
- `src/app/components/FamilyTree/FamilyTree.tsx`
- `src/app/pages/Home.tsx`
- `docs/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md`
- `docs/QA_7_6_EXPORTACAO_ARVORE.md`

Comportamento implementado:

- botão **Selecionar área**;
- overlay sobre a viewport visível da `.react-flow`;
- seleção por retângulo;
- cancelamento por botão ou `Esc`;
- exportação PNG/PDF/impressão;
- bloqueio temporário de pan/zoom durante seleção;
- liberação de pan/zoom ao cancelar ou concluir exportação;
- recorte com correção de escala entre CSS pixels e canvas real;
- ignora overlay, menu de pessoa, controles ReactFlow, minimap e legenda;
- recusa seleção pequena ou grande demais;
- trata erro de popup/impressão e falhas de captura;
- não usa migration;
- não salva no Storage;
- não grava log persistido.

Limitações mantidas:

- exporta apenas a viewport visível;
- não exporta árvore completa;
- imagens externas sem CORS podem falhar com erro amigável;
- redução automática de escala para seleções grandes permanece futura;
- experiência touch deve ser observada na etapa de responsividade.

---

## 17. Favoritos — 7.8 e 7.9

Status:

- primeira camada funcional implementada;
- QA manual aprovado para escopo MVP;
- expansão para outras entidades fica pós-MVP.

Banco:

- `public.user_favorites`

Migrations:

- `20260518120000_create_user_favorites.sql`
- `20260518141305_relax_legacy_user_favorites_columns.sql`

Modelo novo:

- `entity_type`;
- `entity_id`;
- `label`;
- `description`;
- `href`;
- `metadata`.

Arquivos principais:

- `src/app/services/favoritesService.ts`
- `src/app/components/favorites/FavoriteButton.tsx`
- `src/app/pages/MeusFavoritos.tsx`
- `src/app/pages/PersonProfile.tsx`

Comportamento implementado:

- service usa Supabase e usuário autenticado;
- metadata é sanitizada;
- botão reutilizável alterna favorito;
- perfil de pessoa possui `FavoriteButton` com `entityType="person"`;
- `/meus-favoritos` lista favoritos;
- busca funciona;
- filtros funcionam;
- remoção funciona;
- links internos são tratados;
- favorito sem `href` mostra estado apropriado;
- isolamento por usuário validado manualmente.

Fora do MVP:

- favoritos em arquivos históricos;
- favoritos em tópicos do fórum;
- favoritos em modal conjugal/relacionamentos;
- favoritos em eventos pessoais/timeline;
- logs `favorite.added` e `favorite.removed`.

---

## 18. Responsividade mobile/tablet — 7.10

Status:

- concluída para o MVP;
- ajustes restritos a CSS, Tailwind, layout, scroll, largura, quebra de texto e usabilidade mobile/tablet;
- sem migrations;
- sem alteração de RLS;
- sem alteração de Edge Functions;
- sem alteração de services;
- sem alteração de regras de negócio de árvore, upload, vínculos, fórum, favoritos ou notificações;
- QA final técnico e visual aprovado em 2026-05-19.

Blocos concluídos:

- base global;
- árvore e ReactFlow;
- perfil da pessoa;
- área do usuário;
- fórum/favoritos/notificações;
- admin;
- QA final de lançamento.

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

Roteiro visual validado:

- Home/árvore;
- Minha Árvore;
- Meus Dados;
- Meus Vínculos;
- Meus Favoritos;
- Notificações;
- Fórum;
- novo tópico;
- Admin Dashboard;
- Admin Pessoas;
- Admin Pessoa Form;
- Admin Relacionamentos;
- Admin Relacionamento Form;
- Admin Solicitações de Vínculos;
- Admin Notificações;
- Admin Integridade;
- Admin Atividades;
- Admin Diagnóstico;
- Admin Importação;
- Admin Migrar Dados.

Resultado do QA visual:

- sem overflow horizontal global indevido nas larguras obrigatórias;
- headers, filtros, cards, formulários e telas admin permaneceram operáveis;
- ações destrutivas continuaram protegidas pelos fluxos existentes;
- admin continuou protegido por `ProtectedRoute`.

## 19. Fórum e Google Calendar

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

## 20. Banco, migrations e objetos legados

Regras consolidadas:

- revisar `supabase migration list` antes de `db push`;
- usar `migration repair` apenas quando o schema remoto já refletir comprovadamente a migration;
- não criar migration para objeto legado sem consumidor runtime;
- não remover coluna/view legada sem dump recente, SQL de auditoria e QA visual.

Objetos legados/compatibilidade:

- `public.pessoas.arquivos_historicos`: mantida por compatibilidade até validação completa;
- `public.imagens_pessoa`: legado/migrations-only;
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado;
- scripts SQL antigos de fórum/Google Calendar devem ser tratados como legado se já houver migrations oficiais.

---

## 21. Regras de segurança permanentes

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
- responsividade ignorar árvore, legenda e seleção de área.
