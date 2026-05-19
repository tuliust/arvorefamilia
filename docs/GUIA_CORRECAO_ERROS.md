# Guia de correção de erros — Árvore Família

## Objetivo

Este documento é um mapa rápido de investigação: **sintoma → arquivos prováveis → onde olhar → como corrigir**.

Use este guia quando:

- uma funcionalidade falhar;
- houver regressão depois de uma implementação;
- o build quebrar;
- houver erro de permissão/RLS;
- for necessário localizar rapidamente os arquivos de uma frente.

Documentos complementares:

- `docs/GUIA_IMPLEMENTACOES.md`: estado consolidado das frentes.
- `docs/PLANO_PROXIMOS_PASSOS.md`: ordem de trabalho e QA.
- `docs/NOTIFICACOES.md`: detalhes específicos de notificações.
- `docs/TIMELINE.md`: detalhes específicos da timeline.

---

## 1. Checklist inicial de investigação

Antes de corrigir:

```bash
git status
npm run build
git diff --check
```

Se a falha envolver banco:

```bash
supabase migration list
```

Se envolver Edge Function:

```bash
supabase functions list
```

Regras:

- corrigir build antes de QA manual;
- não rodar `supabase db push` sem revisar migrations;
- não usar `repair` para mascarar migration não aplicada;
- não commitar dumps, tokens, service role ou secrets;
- não apagar dados legados sem auditoria.

---

## 2. Build quebrado

Arquivos prováveis:

```txt
src/app/types/index.ts
src/app/routes.tsx
src/app/pages
src/app/components
src/app/services
package.json
vite.config.ts
```

Investigar:

- imports inexistentes;
- componente sem export;
- tipo ausente em `types/index.ts`;
- campo de banco usado no frontend sem tipo;
- dependência não instalada;
- erro de caminho após mover componente;
- action/log novo não incluído nos tipos.

Correção:

- rodar `npm run build`;
- corrigir primeiro o erro mais acima no terminal;
- rodar `git diff --check`;
- confirmar que não há alteração fora do escopo.

---

## 3. Acesso, permissões e rotas admin

Arquivos:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
```

### Usuário comum acessa admin

Verificar:

- rota protegida por `ProtectedRoute`;
- `isAdminUser(user)`;
- RPC/admin role;
- fallback de erro bloqueia acesso;
- RLS da tabela sensível.

Correção:

- proteger rota;
- não renderizar botões admin para usuário comum;
- confirmar que usuário comum não altera dados diretamente.

### Admin não vê Painel Administrativo

Verificar:

- sessão Supabase;
- `profiles.role = 'admin'`;
- RPC `is_admin_user`;
- estado `isAdmin` em `Home.tsx`.

---

## 4. Formulários de pessoa

Arquivos:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/components/person
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/utils/personFields.ts
src/app/services/dataService.ts
```

### Pessoa não salva

Verificar:

- `cleanPersonPayload`;
- `PESSOA_COLUMNS`;
- tipo `Pessoa`;
- migration do campo;
- erro de RLS;
- validação de campos obrigatórios;
- `adicionarPessoa`/`atualizarPessoa`.

### Campo novo não persiste

Confirmar se o campo está em:

- tipo TypeScript;
- estado do formulário;
- payload limpo;
- colunas do service;
- banco/migration.

Campos frequentes:

- `falecido`;
- `local_nascimento_exterior`;
- `local_falecimento_exterior`;
- `permitir_mensagens_whatsapp`;
- redes sociais.

### Formulário perde dados

Verificar:

- rascunho em `sessionStorage`;
- `useUnsavedChanges`;
- `ArquivosHistoricos` não chama `onChange` ao visualizar;
- botões internos com `type="button"`;
- `useEffect` assíncrono sobrescrevendo estado após edição local.

### Modal de relacionamento trava ou salva antes da hora

Verificar:

- `ConfirmDialog` não deve ser usado para adicionar relacionamento;
- relacionamento pendente só salva no botão principal do formulário;
- cancelamentos usam `type="button"`;
- dados conjugais pendentes são preservados no rascunho.

---

## 5. Busca com acentos

Arquivos:

```txt
src/app/utils/searchText.ts
src/app/services/dataService.ts
src/app/pages/admin/AdminPessoas.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
```

Sintoma:

- `Marcio` não encontra `Márcio`;
- `Sao Paulo` não encontra `São Paulo`.

Correção:

- usar `includesNormalizedText`;
- evitar `toLowerCase().includes(...)` em busca de pessoa/local;
- testar busca em admin, árvore, relacionamentos e vinculação.

---

## 6. Pessoa falecida e locais no exterior

Arquivos:

```txt
src/app/utils/personFields.ts
src/app/components/person/PersonDatesLocationsFields.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/services/dataService.ts
```

### Pessoa marcada como falecida volta viva

Verificar:

- `falecido` em `PESSOA_COLUMNS`;
- `isPersonDeceased`;
- payload de salvamento;
- migration aplicada.

### Local exterior rejeitado

Verificar:

- flags `local_nascimento_exterior` e `local_falecimento_exterior`;
- `validateLocationByMode`;
- placeholder/modo do formulário;
- formato esperado `Cidade (País)`.

---

## 7. Arquivos históricos e Storage

Arquivos:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/components/FotoUpload.tsx
src/app/pages/PersonProfile.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

### Arquivo novo salva como base64

Verificar:

- `uploadHistoricalFile`;
- bucket `historical-files`;
- `uploadPersonAvatar`;
- bucket `person-avatars`;
- fallback legado não deve ser usado para arquivo novo.

### Preview limpa formulário

Verificar:

- abrir/fechar preview não deve chamar `onChange`;
- botões de visualizar/baixar/abrir usam `type="button"`;
- estado de `novoArquivo` não é limpo sem ação explícita.

### Download falha

Verificar:

- URL pública/acessível;
- compatibilidade com `data:`;
- fallback de abrir em nova aba;
- nome de arquivo sanitizado.

### Upload abandonado deixa órfão

Verificar:

- upload antes do salvamento final;
- se há registro correspondente em `arquivos_historicos`;
- usar scripts dry-run antes de qualquer limpeza;
- não deletar automaticamente sem auditoria.

### Arquivo de relacionamento salva errado

Esperado:

- `relacionamento_id` preenchido;
- `pessoa_id` nulo.

Verificar:

- `ViewMarriageModal`;
- `MarriageDetailsEditor`;
- `adicionarArquivoHistoricoAoRelacionamento`;
- RLS/admin.

---

## 8. Relacionamentos, solicitações e dados conjugais

Arquivos:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
```

### Usuário comum altera relacionamento real

Verificar:

- UI está chamando `createRelationshipChangeRequest`, não `adicionarRelacionamentoComInverso`;
- RLS de `public.relacionamentos`;
- policy antiga permissiva não está ativa;
- rota não expõe formulário admin.

### Solicitação não aparece no admin

Verificar:

- `relationship_change_requests`;
- status `pending`;
- RLS SELECT admin;
- `listAllRelationshipChangeRequests`.

### Aprovação não altera relacionamento

Verificar:

- `approveRelationshipChangeRequest`;
- chamadas para `dataService`;
- payload de tipo/subtipo/dados conjugais;
- logs `relationship_change_approved`.

### Rejeição altera dado real

Corrigir service: rejeitar só atualiza status da solicitação.

### Status conjugal não aparece na árvore

Verificar:

- `RELACIONAMENTO_COLUMNS`;
- `obterTodosRelacionamentos`;
- `getGenealogyMarriageStatus`;
- campos `ativo`, `data_separacao`, `subtipo_relacionamento`, `falecido`.

---

## 9. Genealogia, Visão Completa e anel 💍

Arquivos:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/pages/Home.tsx
```

### Linha diagonal entre pais e filhos

Verificar:

- regra de filho único;
- conector ortogonal;
- `GenealogyFamilyConnectorNode`.

### Conectores/anéis soltos após filtro

Verificar:

- filtro de pessoas visíveis;
- criação de edges apenas quando origem/destino estão visíveis;
- `filterPersonalTreeScope`.

### Genealogia mostra base completa

Verificar escopo pessoal da view Genealogia.

### Visão Completa mostra poucas pessoas

Verificar se a view está usando a base completa, não escopo pessoal.

### Anel não abre modal

Verificar:

- `GenealogySpouseEdge`;
- `onMarriageClick`;
- `edge.data.marriageDetails`;
- `event.stopPropagation()`.

### Modal mostra observação para usuário comum

Corrigir renderização condicional por `isAdmin`.

---

## 10. Histórico de atividades

Arquivos:

```txt
src/app/services/activityLogService.ts
src/app/pages/admin/AdminAtividades.tsx
src/app/types/index.ts
```

### Log não é criado

Verificar:

- chamada de `createActivityLog`;
- `actor_user_id`;
- RLS de INSERT;
- erro engolido em `catch`.

### Log falha para usuário comum

`createActivityLog` não deve usar `.select().single()` depois de insert.

### Admin não vê logs

Verificar:

- policy SELECT admin;
- RPC `is_admin_user`;
- rota protegida;
- `listActivityLogs`.

### Metadata sensível

Remover:

- URL completa;
- base64;
- telefone;
- endereço;
- e-mail;
- token;
- secret;
- prompt completo;
- conteúdo gerado.

---

## 11. Integridade

Arquivos:

```txt
src/app/pages/admin/AdminIntegridade.tsx
src/app/routes.tsx
src/app/services/dataService.ts
src/app/services/activityLogService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/lib/supabaseClient.ts
```

### Tela não abre

Verificar rota, import/export e `ProtectedRoute`.

### Usuário comum acessa

Corrigir proteção de rota e fallback de permissão.

### Diagnóstico acusa erro demais

Separar:

- erro crítico;
- alerta;
- legado compatível;
- pendência de validação.

### Tela altera dados

P0. `/admin/integridade` deve ser somente leitura.

---

## 12. Notificações

Documentação específica:

- `docs/NOTIFICACOES.md`

Arquivos:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/userEngagementService.ts
src/app/services/notificationDispatchService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationScheduledService.ts
src/app/services/notificationAdminService.ts
supabase/functions/send-notification-email
supabase/functions/run-daily-notifications
```

### Notificações não aparecem

Verificar:

- `listarNotificacoesSupabase`;
- RLS de `notificacoes_usuario`;
- `user_id` correto;
- fallback local.

### Marcar/remover notificação não funciona

Verificar:

- funções usam `id` e `user_id`;
- RLS UPDATE/DELETE do próprio usuário;
- chamadas em `Notificacoes.tsx` passam `user.id`.

### Preferências não salvam

Verificar:

- `salvarPreferenciasNotificacao`;
- tabela `preferencias_notificacao`;
- log `notification_preferences.updated`;
- defaults não sobrescrevem `false`.

### Gatilho não notifica

Verificar:

- `notificationTriggersService`;
- destinatários;
- exclusão do ator;
- dispatch log;
- preferências do destinatário.

### Notificação duplica

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- constraint única;
- deduplicação de destinatários.

### Email real não envia

Verificar:

- deploy de `send-notification-email`;
- secrets do Resend;
- `NOTIFICATION_EMAIL_FROM`;
- logs da Edge Function;
- `notification_dispatch_logs`.

### Email envia sem preferência

Verificar:

- `shouldSendNotificationChannel`;
- `receber_email`;
- preferências específicas por tipo.

### Push/WhatsApp tentam envio real

Corrigir para `not_configured` ou `skipped` até existir provider real.

---

## 13. Astrologia e acontecimentos do nascimento — 7.2

Arquivos:

```txt
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/personInsightsService.ts
src/app/services/activityLogService.ts
supabase/functions/generate-person-insights/index.ts
supabase/migrations/20260518174542_reconcile_person_generated_insights_schema.sql
```

### Perfil gera IA automaticamente

P0 operacional.

Corrigir:

- `PersonDataView.tsx` deve importar apenas `obterInsightsGeradosPessoa` e `getInsightByType`;
- não deve importar/chamar `gerarInsightsPessoa`;
- conteúdo ausente vira estado vazio.

### Cards não aparecem

Verificar:

- pessoa humana;
- data de nascimento completa;
- privacidade permite exibir data;
- registros em `person_generated_insights`;
- tipos `astrology` e `historical_events`;
- `getInsightByType`.

### Admin não gera/regenera

Verificar:

- botões em `/admin/pessoas/:id/editar`;
- pessoa não é pet;
- data de nascimento existe;
- privacidade permite;
- Edge Function deployada;
- secrets server-side:
  - `OPENAI_API_KEY`;
  - `SUPABASE_URL`;
  - `SUPABASE_SERVICE_ROLE_KEY`.

### Logs de geração com dados sensíveis

Corrigir metadata. Só permitir:

- `tipos`;
- `force`;
- `source`.

Não salvar prompt, conteúdo gerado, data de nascimento, telefone, e-mail, endereço, URL, base64, token, secret, OpenAI key ou service role.

---

## 14. Linha do tempo — 7.3

Documentação específica:

- `docs/TIMELINE.md`

Arquivos:

```txt
src/app/pages/PersonProfile.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/services/personEventsService.ts
src/app/services/arquivosHistoricosService.ts
src/app/services/dataService.ts
```

### Timeline vazia

Verificar se a pessoa tem:

- nascimento;
- falecimento;
- relacionamentos com data;
- filhos;
- arquivos históricos;
- eventos pessoais.

Estado vazio esperado: sem erro bloqueante.

### Casamento/separação não aparece

Verificar:

- `obterRelacionamentosDetalhadosDaPessoa`;
- `tipo_relacionamento = conjuge`;
- `data_casamento`;
- `data_separacao`;
- builder.

### Eventos duplicados

Verificar chaves de deduplicação em `buildPersonTimeline`.

### Data fora de ordem

Verificar parser de datas e precisão. Ano puro não deve virar `01/01/AAAA`.

### Metadata sensível

`PersonTimeline` não deve renderizar metadata bruta, URL de arquivo, base64, telefone, e-mail, endereço, token ou secret.

---

## 15. WhatsApp — 7.4

Arquivos:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/Home.tsx
```

### Botão não aparece

Verificar:

- telefone válido;
- DDD/DDI plausível;
- `permitir_exibir_telefone` ou `permitir_mensagens_whatsapp`;
- `canUseWhatsAppContact`.

### Número aparece indevidamente

Número em texto só pode aparecer se `permitir_exibir_telefone = true`.

`permitir_mensagens_whatsapp` libera botão/link, mas não exibição textual.

### Link errado

Usar apenas helper `buildWhatsAppUrl`, não montar `wa.me` manualmente.

### Log de clique com telefone

Se log for implementado no futuro, não salvar telefone, URL `wa.me`, mensagem, e-mail, endereço, token ou secret.

---

## 16. Grau de parentesco — 7.5

Arquivos:

```txt
src/app/utils/relationshipDegree.ts
src/app/utils/relationshipDegree.test.ts
src/app/utils/relationshipDegreeDisplay.ts
src/app/components/person/RelationshipFinder.tsx
src/app/pages/Home.tsx
src/app/pages/PersonProfile.tsx
src/app/services/treeDataCache.ts
```

### Resultado pai/filho invertido

Verificar orientação real dos dados:

- `pai`/`mae`: destino é pai/mãe da origem;
- `filho`: destino é filho da origem.

Adicionar/ajustar teste unitário antes de alterar UI.

### Sem vínculo quando deveria haver

Verificar:

- escopo de pessoas/relacionamentos carregado;
- cache da árvore;
- fallback por `dataService`;
- RLS.

Não ampliar acesso de usuário comum para mascarar ausência de dados.

### Resultado expõe dado sensível

A UI não deve exibir telefone, endereço, e-mail, URL de arquivo, base64, token, secret ou observações internas.

### Texto pouco natural

Corrigir em `relationshipDegreeDisplay.ts`, não no algoritmo, se o problema for copy.

---

## 17. Exportação de área da árvore — 7.6

Arquivos:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/pages/Home.tsx
```

### Overlay não fecha

Verificar `onClose` após PNG/PDF/impressão.

### Pan/zoom fica bloqueado

Verificar estado de modo seleção em `FamilyTree`.

### Exportação inclui overlay/controles

Verificar `ignoreElements` para:

- `[data-tree-selection-overlay="true"]`;
- `[data-tree-node-menu="true"]`;
- `.react-flow__controls`;
- `.react-flow__minimap`.

### PDF/PNG falha

Verificar:

- `html2canvas`;
- `jspdf`;
- CORS de imagens externas;
- tamanho máximo da seleção;
- sanitização de cores não suportadas.

### Seleção muito grande trava

Recusar antes da captura ou reduzir escala em evolução futura.

---

## 18. Favoritos — 7.8/7.9

Arquivos:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
src/app/types/index.ts
supabase/migrations/20260518120000_create_user_favorites.sql
supabase/migrations/20260518141305_relax_legacy_user_favorites_columns.sql
```

### Favorito não salva

Verificar:

- usuário autenticado via `supabase.auth.getUser()`;
- RLS de `user_favorites`;
- colunas novas:
  - `entity_type`;
  - `entity_id`;
  - `label`;
  - `description`;
  - `href`;
  - `metadata`;
- índice único `user_id, entity_type, entity_id`.

### Erro NOT NULL em colunas legadas

Verificar se a migration `20260518141305_relax_legacy_user_favorites_columns.sql` foi aplicada.

Colunas legadas devem aceitar null:

- `tipo_conteudo`;
- `conteudo_id`.

### Botão não muda estado

Verificar:

- `isFavorite`;
- `toggleFavorite`;
- estado `loading`;
- `type="button"`;
- `onChange`.

### `/meus-favoritos` vazio

Verificar:

- página usa `listFavorites`, não funções antigas de `userEngagementService`;
- registros pertencem ao `auth.uid()` atual;
- RLS SELECT.

### Link quebra

Verificar `href`. Favoritos sem href devem mostrar estado “Link indisponível”.

### Metadata sensível

Não salvar:

- telefone;
- endereço;
- e-mail;
- URL privada;
- base64;
- token;
- secret;
- service role;
- prompt completo.

---

## 19. Legendas visuais — 7.7

Status:

- implementada no escopo visual/frontend;
- sem migration;
- sem Supabase;
- sem configuração administrativa.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
```

### Legenda não aparece

Verificar:

- import de `TreeLegend` em `FamilyTree.tsx`;
- estado `isLegendOpen`;
- botão flutuante com texto **Legenda**;
- se o painel não está escondido por `isAreaSelectionOpen`;
- z-index e posicionamento do painel.

### Legenda abre, mas atrapalha pan/zoom da árvore

Verificar:

- `onMouseDown={(event) => event.stopPropagation()}`;
- `onClick={(event) => event.stopPropagation()}`;
- se o painel tem `data-tree-legend="true"`;
- se a interação não está propagando para o ReactFlow.

### Legenda aparece em PNG/PDF/impressão

Verificar em `treeExport.ts` se `getDefaultTreeExportIgnoreElements` ignora `[data-tree-legend="true"]`.

### Legenda contradiz visual da árvore

Comparar com:

- `GenealogySpouseEdge.tsx` para status do anel;
- `GenealogyFamilyConnectorNode.tsx` para conectores/barramentos;
- `directFamilyColors.ts` para cores de grupos;
- `visualTokens.ts` para cores de edges e cards;
- diferenças entre `minha-arvore`, `genealogia` e `visao-completa`.

### Mobile quebra

Ajustar preferencialmente dentro da fase 7.10.

Verificar:

- largura do painel;
- altura máxima;
- scroll interno;
- sobreposição com header/controles;
- legibilidade dos textos curtos;
- toque no botão **Legenda**.

---

## 20. Responsividade — 7.10

Arquivos prioritários:

```txt
src/app/pages/Home.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/admin
src/app/components/FamilyTree
src/app/components/ArquivosHistoricos.tsx
```

### Overflow horizontal

Verificar:

- containers com largura fixa;
- tabelas;
- botões em linha;
- cards com `min-width`;
- ReactFlow;
- modais.

### Modal não cabe na tela

Adicionar:

- altura máxima;
- scroll interno;
- padding responsivo;
- footer sticky, se necessário.

### Árvore ruim em touch

Verificar:

- pan/zoom;
- botões pequenos;
- sobreposição de controles;
- menu de pessoa;
- legenda;
- seleção de área 7.6.

### Admin inutilizável em mobile

Priorizar:

- formulário de pessoa;
- listas/tabelas com scroll;
- filtros;
- ações primárias visíveis.

Responsividade só deve começar depois de fechar frentes funcionais prioritárias.

---

## 21. Migrations e Supabase

Arquivos:

```txt
supabase/migrations
supabase/config.toml
supabase/functions
```

### Funciona local, mas não remoto

Verificar:

```bash
supabase migration list
```

Se há migration local pendente e aprovada:

```bash
supabase db push
```

Se o schema remoto já tem os efeitos:

- confirmar com SQL/dump;
- só então considerar `supabase migration repair --status applied`.

### RLS inesperada

Consultar:

```sql
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

E:

```sql
select
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
```

### Coluna legada `pessoas.arquivos_historicos`

Antes de qualquer remoção:

```sql
select count(*) as pessoas_com_json_legado
from public.pessoas
where arquivos_historicos is not null
  and arquivos_historicos::text not in ('[]', 'null');
```

Não remover sem dump, auditoria e QA visual.

---

## 22. Sintomas rápidos

### Usuário comum fez algo indevido

Verificar:

```txt
ProtectedRoute
permissionService
RLS
service chamado pela UI
RPC security definer
policies antigas
```

### Algo salva, mas não aparece

Verificar:

```txt
service de leitura
cache/refetch
colunas selecionadas
types/index.ts
RLS SELECT
```

### Algo aparece para usuário comum, mas deveria ser admin-only

Verificar:

```txt
isAdmin
renderização condicional
readOnly
ProtectedRoute
RLS
```

### Dados digitados somem

Verificar:

```txt
sessionStorage draft
useUnsavedChanges
botões sem type="button"
preview de arquivos
useEffect sobrescrevendo estado
```

### Notificação não chega

Verificar:

```txt
notificationTriggersService
notificationRecipientsService
notificationDispatchService
notificacoes_usuario
notification_dispatch_logs
preferencias_notificacao
RLS/RPC
```

### Secret apareceu no frontend

P0.

Correção imediata:

- remover do frontend;
- rotacionar secret se foi exposto;
- mover para Edge Function ou Supabase secrets;
- revisar histórico do Git se houve commit.
