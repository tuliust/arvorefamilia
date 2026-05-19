# Guia de correção de erros — Árvore Família

## Objetivo

Este documento é um guia de investigação e correção por sintoma. Use quando:

- uma funcionalidade falhar;
- houver regressão;
- o build quebrar;
- uma tela não carregar;
- uma permissão/RLS se comportar de forma inesperada;
- uma Edge Function, migration, Storage ou rotina de notificação apresentar erro.

Este guia não descreve roadmap nem lista implementações concluídas em detalhe. Para isso, use:

- `docs/GUIA_IMPLEMENTACOES.md`: o que já foi implementado.
- `docs/PLANO_PROXIMOS_PASSOS.md`: responsividade, lançamento e pós-MVP.
- `docs/NOTIFICACOES.md`: detalhes de arquitetura e operação de notificações.
- `docs/TIMELINE.md`: detalhes da timeline.

---

## 1. Checklist inicial de investigação

Antes de alterar código:

```bash
git status
npm run build
git diff --check
```

Se envolver banco:

```bash
supabase migration list
```

Se envolver Edge Functions:

```bash
supabase functions list
```

Se envolver testes:

```bash
npm test
npm run test:e2e
```

Regras:

- corrigir build antes de QA manual;
- corrigir o primeiro erro real do terminal antes de seguir para erros derivados;
- não rodar `supabase db push` sem revisar `supabase migration list`;
- não usar `migration repair` para mascarar migration não aplicada;
- não commitar dumps, tokens, service role ou secrets;
- não apagar dados legados/base64 sem auditoria;
- não ampliar RLS para resolver bug de leitura sem entender a regra de negócio.

---

## 2. Build quebrado

Arquivos prováveis:

```txt
src/app/types/index.ts
src/app/routes.tsx
src/app/pages
src/app/components
src/app/services
src/app/utils
package.json
vite.config.ts
tsconfig.json
```

Investigar:

- import inexistente;
- export ausente;
- componente movido sem ajustar caminho;
- tipo ausente em `types/index.ts`;
- campo de banco usado no frontend sem tipo;
- dependência não instalada;
- action/log novo não incluído nos tipos;
- conflito de nome entre tipos, componentes e services;
- arquivo com erro de sintaxe após merge.

Correção:

1. rodar `npm run build`;
2. ler o primeiro erro do terminal;
3. corrigir o arquivo apontado;
4. repetir `npm run build`;
5. rodar `git diff --check`;
6. confirmar que a correção não alterou escopo funcional indevidamente.

---

## 3. Rotas, acesso e permissões

Arquivos prováveis:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
src/app/contexts/AuthContext.tsx
```

### Usuário comum acessa admin

Verificar:

- rota usa `ProtectedRoute`;
- `isAdminUser(user)` retorna corretamente;
- `profiles.role = 'admin'`;
- RPC/admin role está funcionando;
- fallback de erro bloqueia acesso;
- RLS da tabela sensível não libera leitura/escrita indevida;
- menu não renderiza botão admin para usuário comum.

Correção:

- proteger rota;
- corrigir renderização condicional;
- corrigir service chamado pela UI;
- corrigir policy RLS, se necessário;
- nunca esconder só no frontend mantendo escrita liberada no banco.

### Admin não vê Painel Administrativo

Verificar:

- sessão Supabase ativa;
- `profiles.role`;
- RPC `is_admin_user`;
- estado `isAdmin` em `Home.tsx`;
- fallback de loading/erro;
- cache de sessão antigo.

### Usuário autenticado não acessa página de membro

Verificar:

- `MemberRoute`;
- `AuthContext`;
- status de loading da sessão;
- vínculo de perfil, se a rota exigir;
- erro de RLS em consultas iniciais.

---

## 4. Formulários de pessoa

Arquivos prováveis:

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
- validação de campos obrigatórios;
- `adicionarPessoa`;
- `atualizarPessoa`;
- erro de RLS;
- erro no console do Supabase.

Correção:

- incluir campo no tipo e no payload somente se existir no banco;
- manter limpeza de campos desconhecidos;
- corrigir policy sem liberar escrita indevida;
- validar que o formulário não envia `undefined` onde o banco exige `null`.

### Campo novo não persiste

Confirmar se o campo está em:

- tipo TypeScript;
- estado do formulário;
- componente de input;
- payload limpo;
- lista de colunas do service;
- migration;
- banco remoto;
- SELECT usado na leitura após salvar.

Campos frequentes:

- `falecido`;
- `local_nascimento_exterior`;
- `local_falecimento_exterior`;
- `permitir_mensagens_whatsapp`;
- redes sociais;
- datas conjugais;
- observações internas.

### Formulário perde dados

Verificar:

- rascunho em `sessionStorage`;
- `useUnsavedChanges`;
- `useEffect` assíncrono sobrescrevendo estado após edição local;
- preview/download chamando `onChange`;
- botões internos sem `type="button"`;
- modal fechando e limpando estado pai;
- objeto inicial recalculado sem memoização adequada.

### Modal de relacionamento salva antes da hora

Verificar:

- `ConfirmDialog` não deve ser usado para adicionar relacionamento no fluxo de formulário;
- relacionamento pendente só deve salvar no botão principal;
- cancelamentos usam `type="button"`;
- dados conjugais pendentes ficam no rascunho;
- `onSubmit` do formulário não é disparado por botão interno.

---

## 5. Busca com acentos

Arquivos prováveis:

```txt
src/app/utils/searchText.ts
src/app/services/dataService.ts
src/app/pages/admin/AdminPessoas.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
```

Sintomas:

- `Marcio` não encontra `Márcio`;
- `Sao Paulo` não encontra `São Paulo`;
- busca funciona em uma tela e falha em outra.

Verificar:

- uso de `normalizeSearchText`;
- uso de `includesNormalizedText`;
- `toLowerCase().includes(...)` sem normalização;
- busca feita no frontend versus busca feita no banco;
- campos nulos.

Correção:

- padronizar com os helpers;
- tratar `null`/`undefined`;
- testar em admin, árvore, relacionamentos e vinculação.

---

## 6. Pessoa falecida e locais no exterior

Arquivos prováveis:

```txt
src/app/utils/personFields.ts
src/app/components/person/PersonDatesLocationsFields.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/services/dataService.ts
src/app/components/FamilyTree
```

### Pessoa marcada como falecida volta viva

Verificar:

- `falecido` em `PESSOA_COLUMNS`;
- `isPersonDeceased`;
- payload de salvamento;
- migration aplicada;
- SELECT após salvar;
- componentes da árvore usando helper correto.

### Local exterior rejeitado

Verificar:

- flags `local_nascimento_exterior` e `local_falecimento_exterior`;
- `validateLocationByMode`;
- modo Brasil/exterior;
- placeholder;
- formato esperado `Cidade (País)`;
- campo limpo indevidamente antes de salvar.

---

## 7. Arquivos históricos e Storage

Arquivos prováveis:

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
- fallback legado sendo chamado indevidamente;
- falha de upload escondida por fallback.

Correção:

- novos arquivos devem ir para Storage;
- fallback base64 só deve servir legado/compatibilidade;
- não apagar base64 antigo automaticamente.

### Preview limpa formulário

Verificar:

- abrir/fechar preview não chama `onChange`;
- botões de visualizar/baixar/abrir usam `type="button"`;
- estado de `novoArquivo` não é limpo sem ação explícita;
- preview não dispara submit do formulário.

### Download falha

Verificar:

- URL pública/acessível;
- compatibilidade com `data:`;
- fallback de abrir em nova aba;
- nome de arquivo sanitizado;
- CORS;
- tipo MIME.

### Upload abandonado deixa órfão

Verificar:

- upload antes do salvamento final;
- existência de registro correspondente em `arquivos_historicos`;
- scripts dry-run antes de qualquer limpeza.

Correção:

- não deletar automaticamente sem auditoria;
- registrar procedimento de limpeza em frente técnica separada.

### Arquivo de relacionamento salva como arquivo de pessoa

Esperado:

- `relacionamento_id` preenchido;
- `pessoa_id` nulo.

Verificar:

- `ViewMarriageModal`;
- `MarriageDetailsEditor`;
- `adicionarArquivoHistoricoAoRelacionamento`;
- RLS/admin;
- payload de criação.

---

## 8. Relacionamentos, solicitações e dados conjugais

Arquivos prováveis:

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

- UI está chamando `createRelationshipChangeRequest`;
- UI não chama `adicionarRelacionamentoComInverso`;
- RLS de `public.relacionamentos`;
- policy antiga permissiva;
- rota admin exposta indevidamente.

Correção:

- usuário comum deve gerar solicitação;
- alteração real deve ser feita apenas por admin/aprovação.

### Solicitação não aparece no admin

Verificar:

- tabela `relationship_change_requests`;
- status `pending`;
- RLS SELECT admin;
- `listAllRelationshipChangeRequests`;
- filtro de status na tela.

### Aprovação não altera relacionamento

Verificar:

- `approveRelationshipChangeRequest`;
- chamada ao `dataService`;
- payload de tipo/subtipo;
- dados conjugais;
- logs `relationship_change_approved`.

### Rejeição altera dado real

P0 funcional.

Correção:

- rejeitar só deve atualizar status da solicitação;
- não chamar função que altera relacionamento real.

### Status conjugal não aparece na árvore

Verificar:

- `RELACIONAMENTO_COLUMNS`;
- `obterTodosRelacionamentos`;
- `getGenealogyMarriageStatus`;
- `ativo`;
- `data_separacao`;
- `subtipo_relacionamento`;
- `falecido`.

---

## 9. Árvore, Genealogia, Visão Completa e anel 💍

Arquivos prováveis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/buildTreeGraph.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/pages/Home.tsx
```

### Linha diagonal entre pais e filhos

Verificar:

- regra de filho único;
- edge ortogonal;
- `GenealogyFamilyConnectorNode`;
- layout por gerações.

### Conectores/anéis soltos após filtro

Verificar:

- filtro de pessoas visíveis;
- criação de edges apenas quando origem/destino visíveis;
- `filterPersonalTreeScope`;
- dados de relacionamento sem pessoa correspondente.

### Genealogia mostra base completa

Verificar:

- view mode;
- escopo pessoal;
- pessoa central;
- `filterGraphToPersonalScope`.

### Visão Completa mostra poucas pessoas

Verificar:

- se usa base completa;
- filtros ativos;
- cache de dados;
- RLS;
- modo de visualização selecionado.

### Anel não abre modal

Verificar:

- `GenealogySpouseEdge`;
- `onMarriageClick`;
- `edge.data.marriageDetails`;
- `event.stopPropagation()`;
- modal em `Home.tsx` ou `FamilyTree`.

### Modal mostra observação para usuário comum

Correção:

- renderizar observações internas apenas quando `isAdmin = true`.

---

## 10. Histórico de atividades

Arquivos prováveis:

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
- erro engolido em `catch`;
- action permitida no tipo.

### Log falha para usuário comum

Verificar:

- `createActivityLog` não deve depender de `.select().single()` após insert;
- policy permite INSERT próprio;
- metadata está sanitizada.

### Admin não vê logs

Verificar:

- policy SELECT admin;
- RPC `is_admin_user`;
- rota protegida;
- `listActivityLogs`.

### Metadata sensível

Remover imediatamente:

- URL completa;
- base64;
- telefone;
- endereço;
- e-mail;
- token;
- secret;
- service role;
- prompt completo;
- conteúdo gerado por IA.

---

## 11. Admin Integridade

Arquivos prováveis:

```txt
src/app/pages/admin/AdminIntegridade.tsx
src/app/routes.tsx
src/app/services/dataService.ts
src/app/services/activityLogService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/lib/supabaseClient.ts
```

### Tela não abre

Verificar:

- rota;
- import/export;
- `ProtectedRoute`;
- erro de service;
- erro de RLS;
- dados nulos não tratados.

### Usuário comum acessa

P0 de permissão.

Corrigir:

- proteção de rota;
- fallback de permissão;
- policy RLS;
- renderização condicional do menu.

### Diagnóstico acusa erro demais

Separar:

- erro crítico;
- alerta;
- legado compatível;
- pendência de validação;
- item informativo.

### Tela altera dados

P0.

Correção:

- `/admin/integridade` deve ser somente leitura;
- qualquer correção automática deve virar frente própria;
- ações assistidas ficam pós-MVP.

---

## 12. Notificações

Arquivos prováveis:

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
docs/NOTIFICACOES.md
```

### Notificações não aparecem

Verificar:

- `listarNotificacoesSupabase`;
- RLS de `notificacoes_usuario`;
- `user_id` correto;
- usuário autenticado;
- central em `/notificacoes`;
- fallback local apenas como compatibilidade.

### Marcar/remover notificação não funciona

Verificar:

- função filtra por `id` e `user_id`;
- chamadas passam `user.id`;
- RLS UPDATE/DELETE do próprio usuário;
- rollback visual após erro;
- console do navegador.

### Preferências não salvam

Verificar:

- `salvarPreferenciasNotificacao`;
- tabela `preferencias_notificacao`;
- RLS de upsert por `user_id`;
- log `notification_preferences.updated`;
- defaults não sobrescrevem `false`.

### Gatilho não notifica

Verificar:

- `notificationTriggersService`;
- destinatários em `notificationRecipientsService`;
- exclusão do ator;
- dispatch log;
- preferências do destinatário;
- canal interno versus e-mail.

### Notificação duplica

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- constraint única;
- deduplicação de destinatários;
- execução manual repetida;
- Edge Function diária e rotina manual usando o mesmo padrão de chave.

### E-mail real não envia

Verificar:

- deploy de `send-notification-email`;
- secrets:
  - `RESEND_API_KEY`;
  - `NOTIFICATION_EMAIL_FROM`;
  - `NOTIFICATION_EMAIL_REPLY_TO`;
  - `SITE_URL`;
- domínio/remetente verificado no Resend;
- logs da Edge Function;
- `notification_dispatch_logs`;
- status:
  - `not_configured`;
  - `missing_destination`;
  - `disabled_by_preferences`;
  - `failed`;
  - `sent`.

### E-mail envia para destinatário errado

P0 operacional.

Verificar imediatamente:

- Edge Function exige usuário autenticado;
- usuário comum só envia para si mesmo;
- teste admin é controlado;
- teste admin não dispara massa de usuários;
- `userId` no body;
- logs em `notification_dispatch_logs`.

### Rotina diária retorna 401

Verificar:

- `DAILY_NOTIFICATIONS_SECRET`;
- header `x-daily-notifications-secret`;
- `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`;
- secret sem espaços/quebras de linha;
- function redeployada após alteração.

### Cron não dispara

Verificar:

- `pg_cron`;
- job `run-daily-notifications-0800-brt`;
- horário UTC;
- 08:00 `America/Sao_Paulo` equivale a 11:00 UTC;
- URL da Edge Function;
- header com secret;
- segredo não está em migration versionada;
- resposta recente em `net._http_response`.

### Push/WhatsApp tentam envio real

Correção:

- retornar `not_configured` ou `skipped` até existir provider real.

---

## 13. Astrologia e acontecimentos do nascimento

Arquivos prováveis:

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

Correção:

- `PersonDataView.tsx` deve apenas ler;
- não importar/chamar `gerarInsightsPessoa` no perfil;
- conteúdo ausente vira estado vazio.

### Cards não aparecem

Verificar:

- pessoa humana;
- data de nascimento completa;
- privacidade permite exibir data;
- registros em `person_generated_insights`;
- tipos `astrology` e `historical_events`;
- status `completed`;
- `getInsightByType`.

### Admin não gera/regenera

Verificar:

- botões no formulário admin;
- pessoa não é pet;
- data de nascimento existe;
- Edge Function deployada;
- secrets:
  - `OPENAI_API_KEY`;
  - `SUPABASE_URL`;
  - `SUPABASE_SERVICE_ROLE_KEY`.

### Logs com dados sensíveis

Metadata permitida:

- `tipos`;
- `force`;
- `source`.

Remover:

- prompt;
- conteúdo gerado;
- data de nascimento;
- telefone;
- e-mail;
- endereço;
- URL;
- base64;
- token;
- secret.

---

## 14. Timeline

Arquivos prováveis:

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

Estado vazio sem erro é comportamento esperado.

### Casamento/separação não aparece

Verificar:

- `obterRelacionamentosDetalhadosDaPessoa`;
- `tipo_relacionamento = conjuge`;
- `data_casamento`;
- `data_separacao`;
- builder.

### Eventos duplicados

Verificar:

- chaves de deduplicação em `buildPersonTimeline`;
- fonte duplicada entre relacionamento e evento pessoal;
- arquivo histórico repetido.

### Data fora de ordem

Verificar:

- parser de datas;
- precisão da data;
- ano puro não deve virar `01/01/AAAA` se a precisão for anual.

### Metadata sensível aparece

Correção:

- `PersonTimeline` não deve renderizar metadata bruta;
- remover URL de arquivo, base64, telefone, e-mail, endereço, token ou secret.

---

## 15. WhatsApp

Arquivos prováveis:

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
- `permitir_exibir_telefone`;
- `permitir_mensagens_whatsapp`;
- `canUseWhatsAppContact`.

### Número aparece indevidamente

Regra:

- número em texto só aparece se `permitir_exibir_telefone = true`;
- `permitir_mensagens_whatsapp` libera botão/link, mas não exibição textual.

### Link errado

Correção:

- usar `buildWhatsAppUrl`;
- não montar `wa.me` manualmente em componente.

### Log de clique com telefone

Se log for implementado no futuro:

- não salvar telefone;
- não salvar URL `wa.me`;
- não salvar mensagem;
- não salvar e-mail/endereço/token/secret.

---

## 16. Grau de parentesco

Arquivos prováveis:

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

Correção:

- ajustar algoritmo com teste unitário antes de mexer na UI.

### Sem vínculo quando deveria haver

Verificar:

- pessoas carregadas;
- relacionamentos carregados;
- cache da árvore;
- fallback por `dataService`;
- RLS;
- profundidade máxima.

### Resultado expõe dado sensível

Correção:

- UI não deve exibir telefone, endereço, e-mail, URL de arquivo, base64, token, secret ou observações internas.

### Texto pouco natural

Correção:

- ajustar em `relationshipDegreeDisplay.ts`;
- não alterar algoritmo se o problema é só copy.

---

## 17. Exportação de área da árvore

Arquivos prováveis:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/pages/Home.tsx
```

### Overlay não fecha

Verificar:

- `onClose` após PNG/PDF/impressão;
- botão **Cancelar**;
- listener de `Escape`;
- estado `isAreaSelectionOpen`.

### Pan/zoom fica bloqueado

Verificar:

- `panOnDrag`;
- `panOnScroll`;
- `zoomOnScroll`;
- `zoomOnPinch`;
- `onClose` após exportação.

### Exportação inclui overlay, controles ou legenda

Verificar `ignoreElements` para:

- `[data-tree-selection-overlay="true"]`;
- `[data-tree-node-menu="true"]`;
- `[data-tree-legend="true"]`;
- `.react-flow__controls`;
- `.react-flow__minimap`.

### PDF/PNG falha

Verificar:

- `html2canvas`;
- `jspdf`;
- CORS;
- `allowTaint: false`;
- `useCORS: true`;
- tamanho máximo;
- cores não suportadas;
- mensagem amigável no overlay.

### Impressão falha

Verificar:

- popup bloqueado;
- `openTreePrintWindow`;
- `printCanvas`;
- fechamento de janela no `catch`;
- interação direta do usuário.

### Crop deslocado

Verificar:

- `getBoundingClientRect`;
- `scaleX`;
- `scaleY`;
- `cropCanvas`;
- seleção em qualquer direção.

---

## 18. Favoritos

Arquivos prováveis:

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
- colunas:
  - `entity_type`;
  - `entity_id`;
  - `label`;
  - `description`;
  - `href`;
  - `metadata`;
- índice único `user_id, entity_type, entity_id`.

### Erro NOT NULL em colunas legadas

Verificar migration:

- `20260518141305_relax_legacy_user_favorites_columns.sql`.

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

- página usa `listFavorites`;
- não usa fluxo antigo de `userEngagementService`;
- registros pertencem ao `auth.uid()` atual;
- RLS SELECT.

### Link quebra

Verificar:

- `href`;
- favoritos sem `href` devem mostrar estado “Link indisponível” ou equivalente;
- links internos devem iniciar com `/`.

### Metadata sensível

Remover:

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

## 19. Legendas visuais

Arquivos prováveis:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
```

### Legenda não aparece

Verificar:

- import de `TreeLegend`;
- estado `isLegendOpen`;
- botão **Legenda**;
- painel escondido por `isAreaSelectionOpen`;
- z-index;
- posição do painel.

### Legenda atrapalha pan/zoom

Verificar:

- `onMouseDown={(event) => event.stopPropagation()}`;
- `onClick={(event) => event.stopPropagation()}`;
- `data-tree-legend="true"`;
- propagação para ReactFlow.

### Legenda aparece em exportação

Verificar:

- `getDefaultTreeExportIgnoreElements`;
- seletor `[data-tree-legend="true"]`.

### Legenda contradiz árvore

Comparar com:

- `GenealogySpouseEdge.tsx`;
- `GenealogyFamilyConnectorNode.tsx`;
- `directFamilyColors.ts`;
- `visualTokens.ts`;
- modos `minha-arvore`, `genealogia`, `visao-completa`.

---

## 20. Responsividade

Arquivos prioritários:

```txt
src/app/pages/Home.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/forum
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
- modais;
- imagens sem `max-width`.

### Modal não cabe na tela

Correção:

- altura máxima;
- scroll interno;
- padding responsivo;
- footer sticky se necessário.

### Árvore ruim em touch

Verificar:

- pan/zoom;
- botões pequenos;
- sobreposição de controles;
- menu de pessoa;
- legenda;
- seleção de área.

### Admin inutilizável em mobile

Priorizar:

- formulário de pessoa;
- listas/tabelas com scroll;
- filtros;
- ações primárias visíveis.

---

## 21. Migrations e Supabase

Arquivos prováveis:

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