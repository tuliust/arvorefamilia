# Notificações

> Última revisão: 2026-06-14  
> Local canônico: `docs/funcionalidades/NOTIFICACOES.md`  
> Tipo: documentação funcional, técnica e operacional do módulo de notificações.  
> Status: revisado na auditoria final da documentação.

---

## 1. Objetivo

Este documento registra o comportamento atual de notificações internas, preferências, logs, rotinas administrativas, Edge Functions e integrações com fórum.

Rotas:

| Rota | Proteção | Função |
|---|---|---|
| `/notificacoes` | `MemberRoute` | Central/lista de notificações em cards. |
| `/ajustar-notificacoes` | `MemberRoute` | Preferências do usuário. |
| `/admin/notificacoes` | `ProtectedRoute` | Diagnóstico, testes e rotinas administrativas. |

Documentação complementar:

```txt
docs/funcionalidades/FORUM.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/GUIA_CORRECAO_ERROS.md
```

---

## 2. Status atual

Implementado no escopo MVP:

- central do usuário em `/notificacoes`;
- preferências em `/ajustar-notificacoes`;
- `NotificationPreferencesPanel`;
- painel admin em `/admin/notificacoes`;
- notificações internas;
- logs em `notification_dispatch_logs`;
- deduplicação de recorrências em `notification_occurrences`;
- rotina manual de aniversários e memórias;
- Edge Function `run-daily-notifications`;
- Edge Function `send-notification-email` com Resend;
- notificações internas de fórum para menções, pessoas relacionadas, respostas e comentários;
- deduplicação de destinatários em notificações de fórum.

Futuro/pós-MVP:

- push real;
- WhatsApp real;
- fila/retry avançado;
- cron automático com segredo seguro fora do repositório;
- preferências mais granulares por fórum, se o produto exigir.

---

### 2.1 Integração com calendário familiar

O calendário familiar consome datas familiares e pode gerar contexto para notificações de rotina.

Escopo vigente:

- aniversários;
- datas de memória/falecimento;
- eventos familiares quando houver fluxo suportado;
- rotina manual/admin e Edge Function diária, conforme configuração.

Regras:

- notificações de calendário devem respeitar preferências do usuário;
- deduplicação deve usar `notification_occurrences`;
- falha de e-mail não deve desfazer notificação interna;
- Google Agenda é integração de calendário, não canal de notificação;
- alterações no shape de evento do calendário exigem revisar notificações e Google Agenda.

## 3. Arquitetura

### 3.1 Services

| Service | Responsabilidade |
|---|---|
| `notificationDispatchService.ts` | Orquestra canais, preferências e logs. |
| `notificationRecipientsService.ts` | Resolve admins, usuários vinculados a pessoas e participantes de fórum. |
| `notificationTriggersService.ts` | Gatilhos event-driven: arquivos, vínculo, fórum, respostas e comentários. |
| `notificationScheduledService.ts` | Rotina manual de aniversários/memórias. |
| `notificationAdminService.ts` | Diagnóstico admin. |
| `userEngagementService.ts` | Preferências e lista do usuário. |
| `forumService.ts` | Cria respostas/comentários e aciona notificações de fórum. |

### 3.2 UI

| Arquivo | Função |
|---|---|
| `src/app/pages/Notificacoes.tsx` | Lista, marcação como lida, marcar todas, remoção e abertura de link. |
| `src/app/pages/AjustarNotificacoes.tsx` | Página dedicada de preferências. |
| `src/app/components/notifications/NotificationPreferencesPanel.tsx` | Toggles e salvamento. |
| `src/app/pages/admin/AdminNotificacoes.tsx` | Diagnóstico, logs, teste e rotina manual. |
| `src/app/pages/forum/ForumNovoTopico.tsx` | Origem de menções e pessoas relacionadas. |
| `src/app/pages/forum/ForumTopico.tsx` | Destino dos links de fórum. |

---

## 4. Tabelas e RPCs

Tabelas principais:

| Tabela | Uso |
|---|---|
| `notificacoes_usuario` | Notificação interna, lida/não lida, link, metadata e remoção. |
| `preferencias_notificacao` | Preferências gerais e por canal. |
| `notification_dispatch_logs` | Logs técnicos de envio. |
| `notification_occurrences` | Deduplicação de recorrências. |
| `user_person_links` | Resolve usuário vinculado a pessoa. |
| `profiles` | Nome/avatar do usuário. |
| `forum_topicos` | Origem e link do tópico. |
| `forum_topico_pessoas` | Pessoas relacionadas ao tópico. |
| `forum_respostas` | Origem de respostas do fórum. |
| `forum_comentarios` | Origem de comentários do fórum. |

RPCs relevantes:

```txt
create_internal_notification_for_user
insert_notification_dispatch_log_for_user
list_admin_user_ids
```

Regras:

- usuário comum não deve disparar notificação arbitrária para terceiros;
- services controlados resolvem destinatários por vínculo;
- falha de canal externo não desfaz notificação interna;
- falha de notificação de fórum não deve impedir criação de conteúdo.

---

## 5. Canais

### Ativos

```txt
interna
email
```

Canal `email` depende de:

- Edge Function `send-notification-email`;
- provider Resend;
- secrets configurados;
- destinatário válido;
- preferências do usuário.

### Futuros

```txt
push
whatsapp
```

Regra:

```txt
Push e WhatsApp permanecem como not_configured/ignorado até haver provider real.
```

---

## 6. Preferências

Preferências gerais:

```txt
receber_aniversarios
receber_datas_memoria
receber_eventos
receber_avisos_gerais
receber_email
receber_push
receber_whatsapp
```

Preferências específicas de e-mail:

```txt
receber_email_novo_usuario
receber_email_datas_especiais
receber_email_novas_mensagens_forum
receber_email_novos_registros_historicos
receber_email_evento_historico_familia
```

### Fórum

Notificações internas de fórum usam:

```txt
tipo = novas_mensagens_forum
preferência interna principal = receber_avisos_gerais
```

E-mails de fórum, quando usados, respeitam:

```txt
receber_email
receber_email_novas_mensagens_forum
```

Não há coluna específica separada para menções/respostas/pessoas relacionadas no escopo atual.

---

## 7. Central `/notificacoes`

Arquivo:

```txt
src/app/pages/Notificacoes.tsx
```

Comportamento atual:

- lista notificações recentes;
- mostra total de não lidas;
- card inteiro é clicável quando `link` existe;
- `Enter` e `Espaço` abrem o link quando o card tem foco;
- link interno **Abrir conteúdo** também existe;
- marca uma notificação como lida;
- marca todas como lidas;
- remove notificação;
- normaliza alguns textos antigos sem acento na renderização;
- converte `DATAS_ESPECIAIS` para label visual `ESPECIAIS`.

Anti-regressões:

- não voltar a exibir tags técnicas cruas quando houver label amigável;
- não remover clique no card inteiro;
- botões internos devem usar `stopPropagation`;
- não quebrar acessibilidade por teclado.

---

## 8. Gatilhos event-driven

Arquivo:

```txt
src/app/services/notificationTriggersService.ts
```

### 8.1 Arquivo histórico

Função:

```txt
notifyHistoricalFileAdded
```

Destinatários:

- usuários relevantes para pessoa/relacionamento;
- admins quando aplicável;
- exceto ator.

Tipo:

```txt
novos_registros_historicos
```

### 8.2 Novo vínculo confirmado

Função:

```txt
notifyNewUserLinked
```

Destinatários:

- admins;
- exceto ator.

Tipo:

```txt
novo_usuario
```

Link:

```txt
/admin/atividades
```

### 8.3 Fórum — tópico criado

Função:

```txt
notifyForumTopicCreated
```

Entradas:

```txt
topicId
actorUserId
mentionedPessoaIds
relatedPessoaIds
```

Regras:

- deduplicar pessoas;
- resolver usuários via `user_person_links`;
- excluir autor;
- se usuário é mencionado e relacionado, priorizar menção;
- criar no máximo uma notificação por usuário por tópico.

Mensagens:

| Motivo | Título | Mensagem |
|---|---|---|
| menção | Você foi mencionado no fórum | Você foi mencionado em uma publicação. |
| pessoa relacionada | Você foi relacionado a uma publicação | Você foi relacionado a uma publicação. |

### 8.4 Fórum — resposta criada

Função:

```txt
notifyForumReplyCreated
```

Destinatários:

- participantes do tópico;
- exceto autor.

Mensagem:

```txt
Um tópico que você acompanha recebeu uma nova resposta.
```

### 8.5 Fórum — comentário criado

Função:

```txt
notifyForumCommentCreated
```

Destinatários:

- participantes da conversa;
- exceto autor.

Mensagem:

```txt
Uma conversa do fórum que você acompanha recebeu um novo comentário.
```

---

## 9. Rotina manual de aniversários e memórias

Rota:

```txt
/admin/notificacoes
```

Função:

```txt
runDailyNotificationChecks
```

Regras:

- rotina manual usa canal interno;
- respeita preferências;
- deduplica por `notification_occurrences.occurrence_key`;
- não envia e-mail/push/WhatsApp, salvo alteração futura explícita.

Padrão de chave:

```txt
aniversario:YYYY-MM-DD:userId:pessoaId
memoria_falecimento:YYYY-MM-DD:userId:pessoaId
```

---

### 9.1 Relação com `/calendario-familiar`

A rota `/calendario-familiar` exibe datas familiares; o módulo de notificações pode avisar sobre datas especiais, mas não deve duplicar a responsabilidade visual do calendário.

Checklist:

- [ ] aniversários e memórias usam labels amigáveis;
- [ ] rotina diária respeita fuso `America/Sao_Paulo`;
- [ ] usuários sem preferência ativa não recebem o canal desativado;
- [ ] notificações internas podem existir mesmo quando e-mail falha;
- [ ] não expor tokens do Google Agenda nem Resend em logs ou metadata.

## 10. Edge Function diária

Function:

```txt
run-daily-notifications
```

Arquivo:

```txt
supabase/functions/run-daily-notifications/index.ts
```

Entrada opcional:

```json
{
  "referenceDate": "2026-05-15"
}
```

Se `referenceDate` não for enviado, usa data atual em `America/Sao_Paulo`.

Segurança:

- usa `SUPABASE_SERVICE_ROLE_KEY` apenas dentro da Edge Function;
- aceita `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` ou `x-daily-notifications-secret`;
- não envia e-mail/push/WhatsApp no escopo atual.

---

## 11. Agendamento automático

Status:

```txt
preparado, mas não ativado por migration.
```

Motivo:

```txt
o segredo para chamar a Edge Function não deve ser hardcoded em migration.
```

Horário planejado:

- 08:00 `America/Sao_Paulo`;
- 11:00 UTC.

Exemplo conceitual após configurar segredo seguro fora do repositório:

```sql
select cron.schedule(
  'run-daily-notifications-0800-brt',
  '0 11 * * *',
  $$
  select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/run-daily-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-daily-notifications-secret', '<secret-configurado-fora-do-repo>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Verificação:

```sql
select *
from cron.job
where jobname = 'run-daily-notifications-0800-brt';
```

---

## 12. E-mail real

Provider:

```txt
Resend
```

Function:

```txt
supabase/functions/send-notification-email/index.ts
```

Secrets:

```bash
supabase secrets set RESEND_API_KEY="..."
supabase secrets set NOTIFICATION_EMAIL_FROM="Arvore Familia <notificacoes@seudominio.com>"
supabase secrets set NOTIFICATION_EMAIL_REPLY_TO="contato@seudominio.com"
supabase secrets set SITE_URL="https://seudominio.com"
```

Deploy:

```bash
supabase functions deploy send-notification-email
```

Status esperados:

```txt
sent
failed
not_configured
missing_destination
disabled_by_preferences
```

Regras:

- frontend nunca recebe `RESEND_API_KEY`;
- usuário comum só pode acionar e-mail para si mesmo;
- admin pode executar teste controlado;
- falha de e-mail não desfaz notificação interna.

---

## 13. Metadata e privacidade

Não salvar metadata com:

- telefone;
- endereço;
- e-mail completo;
- token;
- secret;
- base64;
- URL completa de arquivo;
- dados sensíveis desnecessários.

Metadata típica de fórum:

```json
{
  "topic_id": "uuid",
  "notification_reason": "mention",
  "mentioned_pessoa_ids": ["uuid"]
}
```

ou:

```json
{
  "topic_id": "uuid",
  "notification_reason": "related_person",
  "related_pessoa_ids": ["uuid"]
}
```

---

## 14. Consultas SQL úteis

```sql
select id, user_id, titulo, mensagem, tipo, canal, lida, metadata, created_at
from public.notificacoes_usuario
order by created_at desc
limit 50;
```

```sql
select id, notification_id, user_id, tipo, canal, status, provider, error_message, metadata, created_at
from public.notification_dispatch_logs
order by created_at desc
limit 50;
```

```sql
select id, occurrence_key, tipo, user_id, entity_type, entity_id, occurrence_date, status, metadata, created_at
from public.notification_occurrences
order by created_at desc
limit 50;
```

```sql
select id, user_id, receber_aniversarios, receber_datas_memoria, receber_eventos, receber_avisos_gerais, receber_email, receber_push, receber_whatsapp, updated_at
from public.preferencias_notificacao
order by updated_at desc nulls last
limit 50;
```

---

## 15. QA

### Admin

- abrir `/admin/notificacoes`;
- validar cards, logs e diagnósticos;
- executar **Teste interno**;
- executar **Verificar aniversários e memórias de hoje**;
- executar e-mail de teste apenas de forma controlada.

### Usuário comum

- abrir `/notificacoes`;
- validar lista;
- abrir notificação clicando no card;
- abrir notificação pelo link interno;
- marcar uma como lida;
- marcar todas como lidas;
- remover notificação;
- abrir `/ajustar-notificacoes`;
- alterar preferências e confirmar persistência.

### Fórum

- criar tópico com pessoa relacionada;
- criar tópico com menção;
- confirmar que autor não recebe notificação própria;
- confirmar notificação de pessoa relacionada;
- confirmar notificação de pessoa mencionada;
- confirmar deduplicação;
- confirmar link `/forum/topico/:id`;
- testar resposta e comentário.

### Técnico

```bash
npm run build
git diff --check
git status --short
```

Se houver alteração de Edge Function:

```bash
supabase functions list
supabase migration list
```

---

## 16. Troubleshooting

### Notificação interna não aparece

Verificar:

- `notificacoes_usuario`;
- RLS;
- `user_id`;
- `create_internal_notification_for_user`;
- dispatch service;
- filtros de lida/removida;
- erros no console.

### Menção de fórum não notifica

Verificar:

- conteúdo contém `@Nome Completo`;
- pessoa tem usuário vinculado em `user_person_links`;
- `notifyForumTopicCreated`;
- `listLinkedUserIdsForPessoas`;
- preferência `receber_avisos_gerais`.

### Pessoa relacionada não notifica

Verificar:

- `forum_topico_pessoas`;
- `relatedPessoaIds`;
- usuário vinculado;
- exclusão do autor;
- preferência `receber_avisos_gerais`.

### Resposta/comentário não notifica

Verificar:

- `criarRespostaForum` ou `criarComentarioForum`;
- status `publicado`;
- `notifyForumReplyCreated` ou `notifyForumCommentCreated`;
- participantes resolvidos pelo service;
- preferência do destinatário.

### Preferência não salva

Verificar:

- `preferencias_notificacao`;
- `userEngagementService.ts`;
- `NotificationPreferencesPanel.tsx`;
- RLS de insert/update;
- unique por `user_id`.

### E-mail retorna `not_configured`

Verificar secrets:

```txt
RESEND_API_KEY
NOTIFICATION_EMAIL_FROM
SITE_URL
```

### Cron não roda

Verificar:

```sql
select *
from cron.job
where jobname = 'run-daily-notifications-0800-brt';
```

Confirmar:

- segredo externo configurado;
- URL correta;
- job criado fora de migration com secret seguro;
- Edge Function deployada.

---

## 17. Segurança e anti-regressões

Não fazer:

- commitar service role;
- commitar Resend API key;
- commitar secrets;
- hardcodar segredo de cron em migration;
- salvar metadata sensível;
- apagar logs de produção sem confirmação;
- marcar push/WhatsApp como ativo sem provider real;
- bloquear criação de tópico por falha de notificação.

Preservar:

- logs mínimos;
- falha de canal externo sem rollback da notificação interna;
- falha de notificação de fórum sem rollback do conteúdo salvo;
- teste admin controlado;
- cron automático fora de migration com secret seguro;
- labels amigáveis e acentuação em `/notificacoes`;
- clique no card inteiro quando houver link.

## 17. Anti-regressões de integração

Checklist:

- [ ] Fórum continua disparando notificações para menções e respostas sem bloquear criação de conteúdo.
- [ ] Calendário/datas especiais continuam deduplicados por ocorrência.
- [ ] Links internos de notificações usam rotas vigentes.
- [ ] Não usar `/minha-arvore`, `/genealogia` ou `/visao-completa` como destino ativo.
- [ ] `/calendario-familiar`, `/forum/topico/:id`, `/pessoa/:id` e `/admin/*` continuam sendo destinos válidos conforme permissão.
- [ ] Preferências de e-mail continuam separadas das preferências internas.
