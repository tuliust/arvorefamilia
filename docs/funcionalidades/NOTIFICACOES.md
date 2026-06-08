# Notificações

> Última revisão: 2026-06-08  
> Local recomendado: `docs/funcionalidades/NOTIFICACOES.md`  
> Tipo: documentação funcional e operacional específica.

---

## 1. Status

Frente funcional consolidada no escopo atual do MVP.

### Pronto

- Central do usuário em `/notificacoes`, dedicada à lista em cards.
- Preferências do usuário em `/ajustar-notificacoes`.
- Componente `NotificationPreferencesPanel`.
- Painel admin em `/admin/notificacoes`.
- Notificações internas.
- Preferências por categoria e canal.
- Logs em `notification_dispatch_logs`.
- Deduplicação de recorrências em `notification_occurrences`.
- Rotina manual de aniversários e memórias.
- Edge Function `run-daily-notifications` preparada e deployada.
- Edge Function `send-notification-email` com provider Resend e teste controlado admin.
- Notificações internas de fórum para menções `@` e pessoas relacionadas a tópicos.
- Deduplicação de destinatários em notificações de fórum.
- Preferência `receber_avisos_gerais` reutilizada para notificações internas de publicações/menções.

### Futuro

- push real;
- WhatsApp real;
- fila/retry avançado;
- cron automático somente depois de configurar segredo seguro fora do repositório;
- preferências mais granulares por fórum, caso o produto precise separar menções, respostas e pessoas relacionadas.

---

## 2. Rotas

| Rota | Proteção | Função |
|---|---|---|
| `/notificacoes` | `MemberRoute` | Central/lista de notificações em cards. |
| `/ajustar-notificacoes` | `MemberRoute` | Preferências de notificações do usuário. |
| `/admin/notificacoes` | `ProtectedRoute` | Diagnóstico, testes e rotinas administrativas. |

Documentação complementar:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/FORUM.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/GUIA_CORRECAO_ERROS.md
```

---

## 3. Arquitetura

### 3.1 Services principais

```txt
notificationDispatchService.ts
notificationRecipientsService.ts
notificationTriggersService.ts
notificationScheduledService.ts
notificationAdminService.ts
userEngagementService.ts
forumService.ts
```

Responsabilidades:

| Service | Responsabilidade |
|---|---|
| `notificationDispatchService.ts` | Orquestra canais, preferências e logs. |
| `notificationRecipientsService.ts` | Resolve admins, usuários vinculados a pessoas, participantes de fórum e destinatários relacionados. |
| `notificationTriggersService.ts` | Integra gatilhos event-driven: arquivos históricos, novo vínculo de usuário, fórum, respostas e comentários. |
| `notificationScheduledService.ts` | Rotina manual de aniversários/memórias. |
| `notificationAdminService.ts` | Diagnóstico admin. |
| `userEngagementService.ts` | Preferências e lista do usuário. |
| `forumService.ts` | Cria tópicos, respostas/comentários e aciona notificações de fórum quando aplicável. |

### 3.2 UI principal

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
```

Responsabilidades:

| Arquivo | Função |
|---|---|
| `Notificacoes.tsx` | Central/lista, marcar como lida, marcar todas e remover. |
| `AjustarNotificacoes.tsx` | Página dedicada de preferências. |
| `NotificationPreferencesPanel.tsx` | Toggles e salvamento. O label de avisos gerais cobre publicações e menções do fórum. |
| `AdminNotificacoes.tsx` | Diagnóstico, testes e rotinas. |
| `ForumNovoTopico.tsx` | Criação de tópico; coleta pessoas relacionadas e menções `@`. |
| `ForumTopico.tsx` | Visualização do tópico; link de destino das notificações. |

---

## 4. Tabelas principais

```txt
notificacoes_usuario
preferencias_notificacao
notification_dispatch_logs
notification_occurrences
user_person_links
profiles
forum_topicos
forum_topico_pessoas
```

### 4.1 `notificacoes_usuario`

Uso:

- notificação interna;
- lista do usuário;
- status lida/não lida;
- remoção;
- link de destino;
- metadata sanitizada.

### 4.2 `preferencias_notificacao`

Uso:

- preferências gerais;
- preferências por canal;
- preferências específicas de e-mail.

### 4.3 `notification_dispatch_logs`

Uso:

- log técnico de tentativa de envio;
- status por canal;
- provider;
- erro;
- metadata.

### 4.4 `notification_occurrences`

Uso:

- deduplicação de recorrências;
- aniversários;
- datas de memória;
- rotina diária/manual.

### 4.5 Tabelas de fórum usadas como origem

| Tabela | Uso em notificações |
|---|---|
| `forum_topicos` | Origem do tópico e link `/forum/topico/:id`. |
| `forum_topico_pessoas` | Pessoas relacionadas ao tópico. |
| `user_person_links` | Resolve destinatários a partir de `pessoa_id`. |
| `forum_respostas` | Participantes notificados quando há nova resposta. |
| `forum_comentarios` | Participantes notificados quando há novo comentário. |

---

## 5. RPCs existentes

```txt
create_internal_notification_for_user
insert_notification_dispatch_log_for_user
list_admin_user_ids
```

Regras:

- usuário comum não deve acionar envio para terceiros de forma arbitrária;
- fluxos event-driven podem resolver destinatários via services controlados;
- admin pode executar testes controlados;
- service role deve ficar apenas no backend/Edge Function;
- falha de canal externo não deve desfazer notificação interna;
- falha de notificação de fórum não deve impedir a criação do tópico.

---

## 6. Canais

### 6.1 Ativos

```txt
interna
email
```

O canal `email` depende de:

- Edge Function `send-notification-email`;
- provider Resend;
- secrets configurados;
- destino válido;
- preferência do usuário.

### 6.2 Futuros

```txt
push
whatsapp
```

Regra:

```txt
Push e WhatsApp devem permanecer como not_configured/ignorado até haver provider real.
```

---

## 7. Preferências

### 7.1 Preferências gerais

```txt
receber_aniversarios
receber_datas_memoria
receber_eventos
receber_avisos_gerais
receber_email
receber_push
receber_whatsapp
```

### 7.2 Preferências específicas de e-mail

```txt
receber_email_novo_usuario
receber_email_datas_especiais
receber_email_novas_mensagens_forum
receber_email_novos_registros_historicos
receber_email_evento_historico_familia
```

### 7.3 Fórum e publicações

No ciclo atual, notificações internas de fórum usam o tipo:

```txt
novas_mensagens_forum
```

Para canal interno, o controle principal é:

```txt
receber_avisos_gerais
```

Motivo:

- a estrutura atual já possui preferência geral para avisos/publicações;
- não foi criada migration para uma nova coluna específica de fórum;
- o label da UI em `NotificationPreferencesPanel` deve deixar claro que essa opção cobre publicações, menções e comunicados importantes.

Para e-mail de fórum, quando/onde usado, a preferência específica é:

```txt
receber_email_novas_mensagens_forum
```

Regras:

- preferência geral de canal deve ser respeitada;
- preferência específica deve ser respeitada quando o canal for e-mail;
- canal ausente/configurado incorretamente deve retornar status apropriado;
- usuário deve poder alterar preferências em `/ajustar-notificacoes`.

---

## 8. Notificações de fórum

### 8.1 Criação de tópico com menção `@`

Quando um usuário cria um tópico e menciona uma pessoa no conteúdo com `@Nome Completo`:

1. `ForumNovoTopico.tsx` identifica as pessoas mencionadas.
2. A pessoa mencionada também é vinculada ao tópico quando aplicável.
3. `notifyForumTopicCreated` recebe `mentionedPessoaIds`.
4. `notificationRecipientsService.ts` resolve usuários vinculados a essas pessoas via `user_person_links`.
5. `notificationDispatchService.ts` cria notificação interna do tipo `novas_mensagens_forum`.

Mensagem sugerida/implementada:

```txt
Você foi mencionado em uma publicação.
```

Link:

```txt
/forum/topico/:id
```

### 8.2 Pessoa relacionada ao tópico

Quando uma pessoa é selecionada em **Pessoas Relacionadas** no tópico:

1. `forum_topico_pessoas` registra a associação.
2. `notifyForumTopicCreated` recebe `relatedPessoaIds`.
3. usuários vinculados a essas pessoas recebem notificação interna.

Mensagem sugerida/implementada:

```txt
Você foi relacionado a uma publicação.
```

Link:

```txt
/forum/topico/:id
```

### 8.3 Deduplicação

Regra:

- cada usuário deve receber no máximo uma notificação por tópico criado;
- se a mesma pessoa foi mencionada e relacionada, prevalece a mensagem de menção;
- o autor do tópico não recebe notificação sobre a própria publicação;
- pessoas sem usuário vinculado não geram destinatário;
- duplicidades por múltiplas menções no conteúdo são removidas antes do dispatch.

### 8.4 Falhas

Regra de resiliência:

```txt
Falha ao criar notificação não deve impedir a criação/publicação do tópico.
```

O erro deve ser registrado de forma controlada no console/service, sem vazar dados sensíveis.

### 8.5 Respostas e comentários

O sistema também possui gatilhos para:

```txt
notifyForumReplyCreated
notifyForumCommentCreated
```

Comportamento esperado:

- notificar participantes relevantes do tópico/conversa;
- excluir o autor da nova resposta/comentário;
- respeitar `receber_avisos_gerais`/tipo `novas_mensagens_forum`;
- apontar para `/forum/topico/:id`.

---

## 9. Rotina manual

A rotina manual fica em:

```txt
/admin/notificacoes
```

Card:

```txt
Rotinas manuais
```

Botão:

```txt
Verificar aniversários e memórias de hoje
```

Função chamada:

```txt
runDailyNotificationChecks
```

Regras:

- rotina usa apenas canal interno;
- respeita preferências;
- deduplica por `notification_occurrences.occurrence_key`;
- não envia email/push/WhatsApp nessa rotina manual, salvo alteração futura explícita.

Padrão de chave:

```txt
aniversario:YYYY-MM-DD:userId:pessoaId
memoria_falecimento:YYYY-MM-DD:userId:pessoaId
```

---

## 10. Edge Function diária

Function:

```txt
run-daily-notifications
```

Arquivo:

```txt
supabase/functions/run-daily-notifications/index.ts
```

Aceita `POST` com body opcional:

```json
{
  "referenceDate": "2026-05-15"
}
```

Se `referenceDate` não for enviado, a data atual em `America/Sao_Paulo` é usada.

Resposta esperada:

```json
{
  "ok": true,
  "referenceDate": "2026-05-15",
  "birthdaysFound": 0,
  "memorialsFound": 0,
  "notificationsCreated": 0,
  "skippedDuplicates": 0,
  "skippedByPreferences": 0,
  "skippedWithoutRecipients": 0,
  "dispatchFailures": 0,
  "recipientsResolved": 0,
  "dispatchResults": []
}
```

Segurança:

- usa `SUPABASE_SERVICE_ROLE_KEY` somente dentro da Edge Function;
- aceita `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` ou `x-daily-notifications-secret`;
- não envia email/push/WhatsApp.

---

## 11. Agendamento automático

Status atual:

```txt
preparado, mas não ativado por migration.
```

Motivo:

```txt
para chamar a Edge Function via pg_cron com segurança,
o segredo precisa estar no ambiente/secret manager do projeto,
não hardcoded em migration.
```

Horário planejado:

- 08:00 `America/Sao_Paulo`;
- 11:00 UTC.

Exemplo conceitual para adaptar no Supabase SQL Editor depois de configurar segredo seguro:

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

Verificação útil:

```sql
select *
from cron.job
where jobname = 'run-daily-notifications-0800-brt';
```

---

## 12. E-mail real

Provider escolhido:

```txt
Resend
```

Function:

```txt
supabase/functions/send-notification-email/index.ts
```

Secrets necessários:

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

Segurança:

- secrets ficam apenas no Supabase;
- frontend nunca recebe `RESEND_API_KEY`;
- usuário comum só pode acionar e-mail para si mesmo;
- admin pode executar teste controlado para o próprio usuário pelo painel;
- falha de e-mail não desfaz notificação interna.

Status possíveis:

```txt
sent
failed
not_configured
missing_destination
disabled_by_preferences
```

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

Regras:

- metadata deve ser mínima;
- metadata deve ser útil para diagnóstico e navegação;
- metadata não deve vazar informação sensível;
- logs técnicos não devem virar exposição ao usuário comum.

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

```sql
select id, topico_id, pessoa_id, created_at
from public.forum_topico_pessoas
order by created_at desc
limit 50;
```

---

## 15. Testes

### 15.1 Admin

1. Login admin.
2. Abrir `/admin/notificacoes`.
3. Verificar cards, logs e diagnósticos.
4. Clicar em **Teste interno**.
5. Clicar em **Verificar aniversários e memórias de hoje**.
6. Para e-mail, clicar em **Enviar e-mail de teste para mim** e confirmar.

### 15.2 Usuário comum

1. Login usuário comum.
2. Abrir `/notificacoes`.
3. Validar lista.
4. Marcar notificação como lida.
5. Marcar todas como lidas.
6. Remover notificação.
7. Abrir `/ajustar-notificacoes`.
8. Alterar preferências.
9. Confirmar persistência.

### 15.3 Fórum

1. Criar tópico em `/forum/novo` com pessoa relacionada.
2. Criar tópico com menção `@Nome Completo`.
3. Confirmar que o autor não recebeu notificação própria.
4. Confirmar que a pessoa relacionada recebeu notificação, se tiver usuário vinculado.
5. Confirmar que a pessoa mencionada recebeu notificação, se tiver usuário vinculado.
6. Confirmar que menção + pessoa relacionada não geram duplicidade para o mesmo usuário.
7. Confirmar que o link abre `/forum/topico/:id`.
8. Desligar `receber_avisos_gerais` e confirmar que a notificação interna não é criada para aquele usuário.

### 15.4 Técnico

```bash
npm run build
npm test
git diff --check
```

Se houver alteração de Edge Function ou integração:

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
- service de dispatch;
- filtro de lida/removida;
- erros no console.

### Menção de fórum não notifica

Verificar:

- se o conteúdo contém `@Nome Completo` exatamente compatível com pessoa cadastrada;
- `ForumNovoTopico.tsx` e extração de menções;
- se a pessoa mencionada possui usuário vinculado em `user_person_links`;
- `notifyForumTopicCreated`;
- `listLinkedUserIdsForPessoas`;
- preferência `receber_avisos_gerais` do destinatário.

### Pessoa relacionada não notifica

Verificar:

- se `forum_topico_pessoas` recebeu o vínculo;
- se `relatedPessoaIds` foi enviado ao trigger;
- se a pessoa possui usuário vinculado;
- se o autor não é o próprio destinatário;
- preferência `receber_avisos_gerais`.

### Duplicidade de notificações de fórum

Verificar:

- deduplicação em `notifyForumTopicCreated`;
- união de `mentionedPessoaIds` e `relatedPessoaIds`;
- prioridade da mensagem de menção;
- múltiplos vínculos do mesmo usuário a pessoas diferentes;
- duplicidades de `user_person_links`.

### Preferência não salva

Verificar:

- `preferencias_notificacao`;
- `userEngagementService.ts`;
- `NotificationPreferencesPanel.tsx`;
- RLS de update/insert;
- unique por `user_id`.

### E-mail retorna `not_configured`

Verificar secrets:

```txt
RESEND_API_KEY
NOTIFICATION_EMAIL_FROM
SITE_URL
```

### E-mail retorna `disabled_by_preferences`

Verificar:

- `receber_email`;
- preferência específica do tipo de e-mail;
- destino do usuário;
- logs em `notification_dispatch_logs`.

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
- logs HTTP/Supabase;
- Edge Function deployada.

---

## 17. Cuidados

Não fazer:

- commitar service role key;
- commitar Resend API key;
- commitar secrets;
- usar testes de e-mail para todos os usuários;
- salvar metadata sensível;
- apagar logs de produção sem confirmação explícita;
- hardcodar segredo de cron em migration;
- marcar push/WhatsApp como ativo sem provider real;
- criar nova coluna de preferência para fórum sem necessidade real;
- bloquear criação de tópico por falha de notificação.

Fazer:

- manter logs mínimos;
- tratar falha de canal externo sem desfazer notificação interna;
- testar admin e usuário comum;
- manter cron automático separado de migration com secret;
- atualizar `docs/operacao/MIGRATIONS_SUPABASE.md` se houver alteração de banco/cron.

---

## 18. Ajustes recentes e pendências - ciclo 2026-05-30

Esta seção registra os ajustes mapeados para a central de notificações após rodada de QA visual.

### 18.1 Ajustes pendentes na central `/notificacoes`

Pendências mapeadas:

```txt
corrigir acentuação de textos exibidos, como memória
trocar tag DATAS_ESPECIAIS por ESPECIAIS
tornar toda a área do item de notificação clicável para abrir o conteúdo
```

Arquivo principal:

```txt
src/app/pages/Notificacoes.tsx
```

### 18.2 Label amigável para tipo de notificação

A UI não deve expor necessariamente o valor técnico cru do tipo da notificação.

Regra esperada:

```txt
DATAS_ESPECIAIS -> ESPECIAIS
```

Outros tipos podem continuar com label derivado desde que legível, mas a exibição deve evitar underscore técnico quando houver label amigável.

### 18.3 Acentuação

Textos exibidos ao usuário devem respeitar acentuação.

Exemplos esperados:

```txt
memória
notificações
aniversários
```

Se o projeto optar por manter Markdown em ASCII por compatibilidade de terminal, a UI final ainda deve ser validada visualmente para não exibir caracteres quebrados como:

```txt
mem?ria
notifica??es
```

### 18.4 Item inteiro clicável

Comportamento esperado:

- clicar em qualquer área útil do card deve abrir o conteúdo/detalhe da notificação;
- botões internos, como remover, não devem disparar a abertura;
- se houver botão interno, usar `event.stopPropagation()`;
- manter suporte a teclado quando o card for interativo.

---

## 19. Pós-MVP

Possíveis evoluções:

- push real;
- WhatsApp real;
- fila/retry avançado;
- preferências mais granulares;
- digest semanal;
- notificações por fórum separadas por menção, resposta e pessoa relacionada;
- notificações por novos arquivos históricos;
- notificações por eventos familiares;
- painel de métricas;
- retry de e-mail;
- templates transacionais.

Esses itens não bloqueiam o MVP.

---
