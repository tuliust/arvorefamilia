# Guia de implementações — Árvore Família

## Objetivo

Este documento registra o estado consolidado das implementações do projeto **Árvore Família**. Ele deve ser usado como referência para entender o que já existe, o comportamento esperado, as decisões técnicas e o que ainda está em backlog.

Documentos complementares:

- `docs/PLANO_PROXIMOS_PASSOS.md`: ordem de trabalho, QA e próximas fases.
- `docs/GUIA_CORRECAO_ERROS.md`: mapa de investigação por sintoma/tema.
- `docs/NOTIFICACOES.md`: arquitetura específica de notificações, canais, Edge Functions, secrets e testes.
- `docs/TIMELINE.md`: arquitetura específica da timeline da pessoa.

---

## Estado geral das frentes 7.x

| Frente | Status atual | Observação |
|---|---|---|
| 7.1 Notificações | Arquiteturalmente pronta; QA operacional pendente | Canal interno funcional. E-mail depende de Resend/secrets/teste real. Push e WhatsApp ficam futuros. |
| 7.2 Astrologia e acontecimentos do nascimento | Concluída no escopo funcional atual | Perfil apenas lê insights persistidos. Geração/regeneração é ação admin. |
| 7.3 Linha do tempo do usuário | Implementada funcionalmente | Primeira versão derivada dos dados existentes, sem tabela própria. |
| 7.4 WhatsApp no perfil | Concluída no escopo visual/frontend | Privacidade forte em banco/API e log de clique ficam como evolução futura. |
| 7.5 Grau de parentesco/vínculo | Funcionalmente consolidada | Utilitário puro, testes unitários e integração em Home/perfil. |
| 7.6 Selecionar área para PDF/impressão | Implementada tecnicamente | Exporta a viewport visível da árvore como PNG/PDF/impressão. Falta QA amplo em navegadores/dispositivos. |
| 7.7 Legendas visuais da árvore | Pendente | Próxima frente funcional recomendada antes da responsividade. |
| 7.8 Favoritos em todo o site | Implementada em primeira camada | Schema, RLS, service, botão reutilizável, página e favorito de pessoa existem. Falta expandir para mais entidades. |
| 7.9 Página de favoritos | Implementada em primeira versão | Usa Supabase, busca, filtros e remoção. |
| 7.10 Responsividade tablet/mobile | Pendente | Deve ser a última fase antes do lançamento. |

---

## Regras operacionais permanentes

Antes de novas implementações:

- executar `git status`;
- executar `npm run build`;
- executar `git diff --check`;
- executar `supabase migration list` antes de qualquer alteração de banco.

Regras de segurança:

- não usar `supabase db push` sem revisar `supabase migration list`;
- não aplicar `db push` se a frente não tiver migration;
- não guardar secrets no repositório;
- não expor service role no frontend;
- não salvar URL completa, telefone, endereço, e-mail, base64, token ou secret em `activity_logs.metadata`, favoritos, timeline ou dispatch logs;
- não apagar dados legados/base64 sem auditoria;
- não transformar backlog em status implementado sem código e QA.

---

## Arquitetura base

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

Áreas principais:

- árvore familiar;
- perfis de pessoa;
- admin de pessoas/relacionamentos;
- arquivos históricos;
- solicitações de vínculos;
- histórico de atividades;
- fórum;
- Google Calendar;
- notificações;
- timeline;
- favoritos;
- insights de nascimento;
- exportação de área da árvore.

---

## Acesso, permissões e rotas

### Menu do usuário / Header

- O botão **Painel administrativo** só aparece para admin.
- Usuário comum não deve ver o botão de acesso admin.
- Admin deve ir direto para `/admin`.
- A tela intermediária `/admin/login` não deve ser usada pelo menu do usuário.

Arquivos principais:

- `src/app/pages/Home.tsx`
- `src/app/services/permissionService.ts`
- `src/app/components/ProtectedRoute.tsx`
- `src/app/routes.tsx`

### Rotas protegidas

- Rotas admin devem usar `ProtectedRoute`.
- Usuário comum não deve acessar:
  - `/admin`
  - `/admin/atividades`
  - `/admin/integridade`
  - `/admin/solicitacoes-vinculos`
  - `/admin/notificacoes`
- `/notificacoes` é protegida por rota de membro/autenticado.
- `/meus-favoritos` deve operar com o usuário autenticado.

---

## Pessoas, formulários e dados pessoais

### Formulários admin

Rotas:

- `/admin/pessoas/nova`
- `/admin/pessoas/:id/editar`

Comportamento consolidado:

- formulário dividido em blocos reutilizáveis;
- rascunho em `sessionStorage`;
- rascunho preserva dados básicos, arquivos, eventos, redes sociais, relacionamentos pendentes e dados conjugais;
- rascunho é removido após salvar;
- modal de relacionamento não usa `ConfirmDialog`;
- relacionamentos pendentes só são salvos ao clicar no botão principal **Salvar**;
- botões internos que não submetem formulário devem usar `type="button"`.

Componentes principais:

- `AdminPessoaForm.tsx`
- `PersonFormSection`
- `PersonBasicInfoFields`
- `PersonDatesLocationsFields`
- `PersonBioFields`
- `PersonContactFields`
- `PersonPrivacyFields`
- `SocialProfilesEditor`
- `PersonEventsEditor`
- `MarriageDetailsEditor`
- `ArquivosHistoricos`

### Meus Dados e Primeiro Acesso

- Preferências de privacidade e notificação vêm ativadas por padrão.
- Alterações feitas pelo usuário geram histórico quando aplicável.
- Arquivos históricos do próprio perfil usam Supabase Storage.
- Ajustes de vínculos no primeiro acesso viram solicitações, não alterações diretas.

### Redes sociais

- A UI usa `SocialProfilesEditor`.
- O primeiro perfil social continua sincronizado com campos legados em `pessoas`.
- Persistência completa de múltiplas redes em tabela própria fica como evolução futura.

### Pessoa falecida

- Campo booleano: `falecido`.
- Uma pessoa é considerada falecida se:
  - `falecido = true`;
  - ou `data_falecimento` existir;
  - ou `local_falecimento` existir.
- Helper: `isPersonDeceased`.
- A árvore, filtros, perfil e status conjugal devem considerar essa regra.

Migration relacionada:

- `20260514130000_add_falecido_to_pessoas.sql`

### Locais no exterior

- Brasil: `Cidade/UF`.
- Exterior: `Cidade (País)`.
- Flags:
  - `local_nascimento_exterior`
  - `local_falecimento_exterior`

Migration relacionada:

- `20260514133000_add_exterior_location_flags_to_pessoas.sql`

### Busca sem acentuação

Busca deve ignorar caixa e acentos.

Helpers:

- `normalizeSearchText`
- `includesNormalizedText`

---

## Eventos pessoais

Tabela:

- `public.person_events`

Migration:

- `20260514165000_create_person_events.sql`

Arquivos principais:

- `personEventsService.ts`
- `PersonEventsEditor.tsx`
- `PersonEventsList.tsx`
- `AdminPessoaForm.tsx`
- `PersonProfile.tsx`

Eventos suportam tipos como imigração, chegada ao Brasil, mudança, batismo, formatura, profissão, serviço militar, evento religioso, memória e outro.

Logs:

- `person_event.added`
- `person_event.updated`
- `person_event.removed`

Backlog:

- upload por evento;
- privacidade por evento;
- edição diretamente na timeline;
- exportação PDF da timeline/eventos.

---

## Arquivos históricos e Storage

### Regras gerais

- Novas fotos principais usam bucket `person-avatars`.
- Novos arquivos históricos usam bucket `historical-files`.
- Novos arquivos não devem ser salvos como base64.
- Base64/data URL antigo continua compatível.
- Não apagar base64 antigo automaticamente.
- Preview/download/abrir arquivo não deve disparar `onChange` nem limpar formulário.

### Arquivos de pessoa

- Usam `pessoa_id`.
- Usuário pode gerenciar arquivos do próprio perfil conforme RLS.
- Admin pode gerenciar arquivos por formulário/perfil.

### Arquivos de relacionamento/casamento

- Usam `relacionamento_id`.
- Devem ter `pessoa_id` nulo.
- Aparecem no modal do anel e em edição admin.
- Usuário comum apenas visualiza.
- Upload de casamento por usuário comum ainda não foi liberado.

### Preview/download

- Imagem exibe miniatura/preview.
- PDF usa identificação visual e `iframe` quando possível.
- Download é ação explícita.
- Se download cross-origin falhar, abrir em nova aba como fallback.

---

## Relacionamentos, genealogia e Visão Completa

### Regras de relacionamento

- Admin cria, edita e remove relacionamentos reais.
- Usuário comum envia solicitações.
- Usuário comum não altera `public.relacionamentos` diretamente.
- Solicitações usam `relationship_change_requests`.

### Dados conjugais

Componente:

- `MarriageDetailsEditor`

Campos:

- `data_casamento`
- `local_casamento`
- `ativo`
- `data_separacao`
- `local_separacao`
- `observacoes`

Observações internas aparecem apenas para admin.

### Genealogia e Visão Completa

- **Minha Árvore** mantém layout próprio.
- **Genealogia** usa escopo pessoal com layout por gerações.
- **Visão Completa** usa base completa com layout por gerações.
- Não deve haver linhas diagonais entre pais e filhos.
- Cônjuges dos filhos não devem ser tratados como filhos reais.
- Conectores/anéis não devem ficar soltos após filtros.

### Anel de casamento 💍

- Aparece entre cônjuges.
- É clicável.
- Abre modal conjugal.
- Respeita status visual: ativo, separado/divorciado, viuvez ou desconhecido.

---

## Solicitações de vínculos

Tabela:

- `relationship_change_requests`

Migration:

- `20260513173000_create_relationship_change_requests.sql`

Fluxo:

- usuário comum solicita criação/remoção/correção;
- relacionamento real não muda imediatamente;
- admin aprova/rejeita;
- aprovação aplica alteração real;
- rejeição não altera relacionamento real.

Logs:

- `relationship_change_requested`
- `relationship_change_approved`
- `relationship_change_rejected`
- `relationship_change_cancelled`

---

## Histórico de atividades

Tabela:

- `activity_logs`

Migration:

- `20260513143000_create_activity_logs.sql`

Regras:

- admin lê globalmente;
- usuário autenticado insere logs próprios;
- usuário comum não lê histórico global;
- `createActivityLog` não deve depender de `.select().single()` após insert;
- metadata deve ser sanitizada.

Não registrar em metadata:

- URL completa;
- base64;
- telefone;
- endereço;
- e-mail;
- token;
- secrets;
- service role;
- prompts completos;
- conteúdo completo gerado por IA.

---

## Integridade dos dados

Rota:

- `/admin/integridade`

Regras:

- somente admin;
- somente leitura;
- não executa correções automáticas;
- não depende de endpoint legado `make-server`;
- diagnostica pessoas, relacionamentos, arquivos históricos, Storage, usuários/vínculos, logs e solicitações.

Backlog:

- filtros por severidade;
- paginação/limites se a base crescer;
- ações assistidas de correção somente em frente própria.

---

## Notificações — 7.1

Documentação específica:

- `docs/NOTIFICACOES.md`

Status:

- arquitetura pronta;
- canal interno funcional;
- e-mail condicional ao deploy/configuração de Resend;
- push real e WhatsApp real futuros;
- fila/retry avançado futuro;
- cron automático depende de solução segura para segredo fora do repositório.

Implementado:

- `/notificacoes`;
- `/admin/notificacoes`;
- preferências por categoria/canal;
- `notification_dispatch_logs`;
- `notification_occurrences`;
- deduplicação por `occurrence_key`;
- rotina manual de aniversários/memórias;
- gatilhos de novo arquivo histórico, novo vínculo, resposta no fórum e comentário no fórum;
- Edge Function `send-notification-email`;
- Edge Function `run-daily-notifications`.

Hardening já consolidado:

- marcar/remover notificação usa filtro por `id` e `user_id`.

Pendências operacionais:

- configurar secrets reais do Resend;
- confirmar e-mail real por teste admin controlado;
- configurar `DAILY_NOTIFICATIONS_SECRET`;
- testar chamada manual com header;
- criar `pg_cron` apenas sem expor segredo em migration versionada;
- executar QA completo com usuário comum;
- limpar dados de teste só depois de confirmar logs, deduplicação e recebimento.

---

## Astrologia e acontecimentos do nascimento — 7.2

Status:

- concluída no escopo funcional atual.

Tabela:

- `public.person_generated_insights`

Migration:

- `20260518174542_reconcile_person_generated_insights_schema.sql`

Tipos implementados:

- `astrology`
- `historical_events`

Não implementados nesta versão:

- `birth_date_events`
- `historical_context`

Regras consolidadas:

- perfil apenas lê insights existentes;
- perfil não gera IA automaticamente;
- conteúdo ausente aparece como estado vazio/informativo;
- admin gera/regenera explicitamente em `/admin/pessoas/:id/editar`;
- chamada de IA fica apenas na Edge Function;
- secrets permanecem server-side;
- logs são seguros.

Arquivos principais:

- `personInsightsService.ts`
- `PersonDataView.tsx`
- `AdminPessoaForm.tsx`
- `Home.tsx`
- `generate-person-insights/index.ts`

Logs:

- `person_insights.generated`
- `person_insights.regenerated`

Metadata segura:

- `tipos`
- `force`
- `source`

---

## Linha do tempo — 7.3

Status:

- implementada funcionalmente.

Documentação específica:

- `docs/TIMELINE.md`

Arquivos:

- `src/app/utils/buildPersonTimeline.ts`
- `src/app/components/Timeline/PersonTimeline.tsx`
- `src/app/pages/PersonProfile.tsx`

Características:

- função pura;
- sem tabela nova;
- sem migration;
- deriva eventos de pessoa, relacionamentos, filhos, arquivos históricos e `person_events`;
- preserva precisão de data;
- ordena e deduplica eventos;
- sanitiza metadata.

Backlog:

- edição manual;
- upload por evento;
- privacidade por evento;
- exportação PDF;
- consolidação visual com `PersonEventsList`, se fizer sentido.

---

## WhatsApp no perfil — 7.4

Status:

- concluído no escopo visual/frontend.

Arquivos:

- `src/app/utils/whatsapp.ts`
- `src/app/components/person/WhatsAppContactButton.tsx`
- `PersonDataView.tsx`
- `Home.tsx`

Regras:

- botão aparece apenas com telefone válido e permissão;
- número em texto aparece somente se `permitir_exibir_telefone = true`;
- `permitir_mensagens_whatsapp = true` pode liberar botão sem exibir número;
- não há WhatsApp Business API;
- não há envio automático;
- não há log de clique nesta etapa.

Backlog:

- privacidade forte em banco/API;
- log seguro `contact.whatsapp_clicked` sem telefone, URL ou mensagem.

---

## Grau de parentesco/vínculo — 7.5

Status:

- funcionalmente consolidado após QA complementar.

Arquivos:

- `src/app/utils/relationshipDegree.ts`
- `src/app/utils/relationshipDegree.test.ts`
- `src/app/utils/relationshipDegreeDisplay.ts`
- `src/app/components/person/RelationshipFinder.tsx`
- `Home.tsx`
- `PersonProfile.tsx`

Características:

- utilitário puro;
- sem Supabase;
- sem IA;
- sem cache persistido;
- usa `Pessoa[]` e `Relacionamento[]` já carregados;
- considera orientação real dos relacionamentos do app;
- UI mostra caminho, grau, confiança e avisos amigáveis;
- não expõe dados sensíveis.

Backlog:

- integração na árvore/Genealogia;
- integração na Visão Completa;
- limpeza futura de `relationshipResolverService.ts`;
- testes de componente.

---

## Exportação de área da árvore — 7.6

Status:

- implementada tecnicamente e refinada em QA técnico.

Arquivos:

- `src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx`
- `src/app/components/FamilyTree/utils/treeExport.ts`
- `FamilyTree.tsx`
- `Home.tsx`

Características:

- botão **Selecionar área**;
- overlay sobre viewport visível da `.react-flow`;
- seleção por retângulo;
- cancelamento por botão ou `Esc`;
- exportação PNG/PDF/impressão;
- bloqueio temporário de pan/zoom;
- ignora overlay, menu de pessoa, controles e minimap;
- recusa seleção pequena ou grande demais;
- sem migration, sem Storage e sem logs persistidos.

Limitações:

- exporta apenas a viewport visível, não a árvore completa;
- requer QA amplo em navegadores, zooms, árvores grandes e mobile/tablet;
- imagens externas sem CORS podem falhar com erro amigável.

---

## Favoritos — 7.8 e 7.9

Status:

- primeira camada funcional implementada.

Banco:

- `public.user_favorites`

Migrations:

- `20260518120000_create_user_favorites.sql`
- `20260518141305_relax_legacy_user_favorites_columns.sql`

Modelo novo:

- `entity_type`
- `entity_id`
- `label`
- `description`
- `href`
- `metadata`

Arquivos:

- `src/app/services/favoritesService.ts`
- `src/app/components/favorites/FavoriteButton.tsx`
- `src/app/pages/MeusFavoritos.tsx`
- `src/app/pages/PersonProfile.tsx`

Comportamento:

- service usa Supabase e usuário autenticado;
- metadata é sanitizada;
- botão reutilizável alterna favorito;
- `/meus-favoritos` lista, busca, filtra, abre e remove favoritos;
- perfil de pessoa já possui `FavoriteButton` com `entityType="person"`.

Backlog imediato:

- integrar favoritos em arquivos históricos;
- integrar em tópicos do fórum;
- integrar em modal conjugal/relacionamentos;
- integrar em eventos pessoais/timeline;
- avaliar logs `favorite.added` e `favorite.removed` com metadata segura.

---

## Legendas visuais da árvore — 7.7

Status:

- pendente.

Objetivo:

- explicar visualmente conectores, anéis, status conjugais, cores, bordas e diferenças entre views.

Componente sugerido:

- `src/app/components/FamilyTree/TreeLegend.tsx`

Esta é a próxima frente funcional recomendada antes da responsividade.

---

## Responsividade — 7.10

Status:

- pendente.

Regra de priorização:

- deve ser a última fase antes do lançamento do site.

Escopo mínimo:

- Home;
- Minha Árvore;
- Genealogia;
- Visão Completa;
- modal conjugal;
- perfil da pessoa;
- Meus Dados;
- Meus Vínculos;
- Notificações;
- Meus Favoritos;
- Fórum;
- Admin Dashboard;
- Admin Pessoas;
- Admin Pessoa Form;
- Admin Notificações;
- Admin Integridade;
- Admin Solicitações;
- Admin Atividades.

Larguras a validar:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

---

## Fórum e Google Calendar

### Fórum

- Schema versionado em migration.
- Contempla categorias, tópicos, respostas, comentários, reações, denúncias e solução.
- Admin usa função consolidada por `is_admin_user`.
- Exige QA manual antes de ser considerado estável.

### Google Calendar

- Integração versionada em migration.
- Tokens devem ficar restritos a Edge Functions/service role.
- OAuth, sincronização e proteção de tokens ainda exigem validação manual.

---

## Banco, migrations e objetos legados

### Regras

- Sempre revisar `supabase migration list` antes de `db push`.
- Usar `migration repair` apenas quando o schema remoto já refletir comprovadamente a migration.
- Não criar migration para objeto legado sem consumidor runtime.
- Não remover coluna/view legada sem dump recente, SQL de auditoria e QA visual.

### Objetos legados/compatibilidade

- `public.pessoas.arquivos_historicos`: mantida por compatibilidade até validação completa.
- `public.imagens_pessoa`: legado/migrations-only; não criar consumidor novo sem decisão.
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado.
- scripts SQL antigos de fórum/Google Calendar devem ser tratados como legado se já houver migrations oficiais.

---

## O que não deve acontecer

- Usuário comum acessar admin.
- Usuário comum alterar relacionamento real diretamente.
- Perfil gerar IA automaticamente.
- E-mail real ser enviado sem provider/secrets/teste controlado.
- Push/WhatsApp fingirem envio real.
- Dados novos serem salvos como base64.
- Logs/favoritos/timeline/notificações salvarem dados sensíveis.
- `/admin/integridade` alterar dados.
- `supabase db push` ser usado sem revisar migrations.
- Responsividade ser iniciada antes de fechar 7.7, favoritos prioritários e QA operacional básico.
