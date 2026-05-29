# NotificaÃ§Ãµes

> Local recomendado: `docs/funcionalidades/NOTIFICACOES.md`
> Tipo: documentaÃ§Ã£o funcional e operacional especÃ­fica.

---

## 1. Status

Frente 7.1 concluÃ­da tecnicamente no escopo atual do MVP.

### Pronto

- Central do usuÃ¡rio em `/notificacoes`, dedicada Ã  lista em cards.
- PreferÃªncias do usuÃ¡rio em `/ajustar-notificacoes`.
- Componente `NotificationPreferencesPanel`.
- Painel admin em `/admin/notificacoes`.
- NotificaÃ§Ãµes internas.
- PreferÃªncias por categoria e canal.
- Logs em `notification_dispatch_logs`.
- DeduplicaÃ§Ã£o de recorrÃªncias em `notification_occurrences`.
- Rotina manual de aniversÃ¡rios e memÃ³rias.
- Edge Function `run-daily-notifications` preparada e deployada.
- Edge Function `send-notification-email` com provider Resend e teste controlado admin.

### Futuro

- push real;
- WhatsApp real;
- fila/retry avanÃ§ado;
- cron automÃ¡tico somente depois de configurar segredo seguro fora do repositÃ³rio.

---

## 2. Rotas

| Rota | ProteÃ§Ã£o | FunÃ§Ã£o |
|---|---|---|
| `/notificacoes` | `MemberRoute` | Central/lista de notificaÃ§Ãµes em cards. |
| `/ajustar-notificacoes` | `MemberRoute` | PreferÃªncias de notificaÃ§Ãµes do usuÃ¡rio. |
| `/admin/notificacoes` | `ProtectedRoute` | DiagnÃ³stico, testes e rotinas administrativas. |

DocumentaÃ§Ã£o complementar:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
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
```

Responsabilidades:

| Service | Responsabilidade |
|---|---|
| `notificationDispatchService.ts` | Orquestra canais, preferÃªncias e logs. |
| `notificationRecipientsService.ts` | Resolve admins e usuÃ¡rios vinculados. |
| `notificationTriggersService.ts` | Integra gatilhos event-driven. |
| `notificationScheduledService.ts` | Rotina manual de aniversÃ¡rios/memÃ³rias. |
| `notificationAdminService.ts` | DiagnÃ³stico admin. |
| `userEngagementService.ts` | PreferÃªncias e lista do usuÃ¡rio. |

---

### 3.2 UI principal

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
```

Responsabilidades:

| Arquivo | FunÃ§Ã£o |
|---|---|
| `Notificacoes.tsx` | Central/lista, marcar como lida, marcar todas e remover. |
| `AjustarNotificacoes.tsx` | PÃ¡gina dedicada de preferÃªncias. |
| `NotificationPreferencesPanel.tsx` | Toggles e salvamento. |
| `AdminNotificacoes.tsx` | DiagnÃ³stico, testes e rotinas. |

---

## 4. Tabelas principais

```txt
notificacoes_usuario
preferencias_notificacao
notification_dispatch_logs
notification_occurrences
user_person_links
profiles
```

### 4.1 `notificacoes_usuario`

Uso:

- notificaÃ§Ã£o interna;
- lista do usuÃ¡rio;
- status lida/nÃ£o lida;
- remoÃ§Ã£o;
- metadata sanitizada.

### 4.2 `preferencias_notificacao`

Uso:

- preferÃªncias gerais;
- preferÃªncias por canal;
- preferÃªncias especÃ­ficas de e-mail.

### 4.3 `notification_dispatch_logs`

Uso:

- log tÃ©cnico de tentativa de envio;
- status por canal;
- provider;
- erro;
- metadata.

### 4.4 `notification_occurrences`

Uso:

- deduplicaÃ§Ã£o de recorrÃªncias;
- aniversÃ¡rios;
- datas de memÃ³ria;
- rotina diÃ¡ria/manual.

---

## 5. RPCs existentes

```txt
create_internal_notification_for_user
insert_notification_dispatch_log_for_user
list_admin_user_ids
```

Regras:

- usuÃ¡rio comum nÃ£o deve acionar envio para terceiros;
- admin pode executar testes controlados;
- service role deve ficar apenas no backend/Edge Function;
- falha de canal externo nÃ£o deve desfazer notificaÃ§Ã£o interna.

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
- destino vÃ¡lido;
- preferÃªncia do usuÃ¡rio.

### 6.2 Futuros

```txt
push
whatsapp
```

Regra:

```txt
Push e WhatsApp devem permanecer como not_configured/ignorado atÃ© haver provider real.
```

---

## 7. PreferÃªncias

### 7.1 PreferÃªncias gerais

```txt
receber_aniversarios
receber_datas_memoria
receber_eventos
receber_avisos_gerais
receber_email
receber_push
receber_whatsapp
```

### 7.2 PreferÃªncias especÃ­ficas de e-mail

```txt
receber_email_novo_usuario
receber_email_datas_especiais
receber_email_novas_mensagens_forum
receber_email_novos_registros_historicos
receber_email_evento_historico_familia
```

Regras:

- preferÃªncia geral de canal deve ser respeitada;
- preferÃªncia especÃ­fica deve ser respeitada;
- canal ausente/configurado incorretamente deve retornar status apropriado;
- usuÃ¡rio deve poder alterar preferÃªncias em `/ajustar-notificacoes`.

---

## 8. Rotina manual

A rotina manual fica em:

```txt
/admin/notificacoes
```

Card:

```txt
Rotinas manuais
```

BotÃ£o:

```txt
Verificar aniversÃ¡rios e memÃ³rias de hoje
```

FunÃ§Ã£o chamada:

```txt
runDailyNotificationChecks
```

Regras:

- rotina usa apenas canal interno;
- respeita preferÃªncias;
- deduplica por `notification_occurrences.occurrence_key`;
- nÃ£o envia email/push/WhatsApp nessa rotina manual, salvo alteraÃ§Ã£o futura explÃ­cita.

PadrÃ£o de chave:

```txt
aniversario:YYYY-MM-DD:userId:pessoaId
memoria_falecimento:YYYY-MM-DD:userId:pessoaId
```

---

## 9. Edge Function diÃ¡ria

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

Se `referenceDate` nÃ£o for enviado, a data atual em `America/Sao_Paulo` Ã© usada.

Resposta esperada:

```json
{
  "ok": true,
  "referenceDate": "2026-05-15",
  "birthdaysFound": 0,
  "memorialsFound": 0,
  "notificationsCreated": 0,
  "duplicatesSkipped": 0,
  "preferenceSkipped": 0,
  "noRecipientSkipped": 0,
  "failed": 0
}
```

SeguranÃ§a:

- usa `SUPABASE_SERVICE_ROLE_KEY` somente dentro da Edge Function;
- aceita `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` ou `x-daily-notifications-secret`;
- nÃ£o envia email/push/WhatsApp.

---

## 10. Agendamento automÃ¡tico

Status atual:

```txt
preparado, mas nÃ£o ativado por migration.
```

Motivo:

```txt
para chamar a Edge Function via pg_cron com seguranÃ§a,
o segredo precisa estar no ambiente/secret manager do projeto,
nÃ£o hardcoded em migration.
```

HorÃ¡rio planejado:

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

VerificaÃ§Ã£o Ãºtil:

```sql
select *
from cron.job
where jobname = 'run-daily-notifications-0800-brt';
```

Regra consolidada:

- a Edge Function estÃ¡ preparada;
- a rotina manual/admin Ã© suportada;
- a ativaÃ§Ã£o automÃ¡tica por cron depende de ambiente/secret seguro;
- nÃ£o versionar segredo em migration;
- antes de marcar cron como ativo em produÃ§Ã£o, confirmar no Supabase se o job estÃ¡ agendado e operacional.

---

## 11. E-mail real

Provider escolhido:

```txt
Resend
```

Function:

```txt
supabase/functions/send-notification-email/index.ts
```

Secrets necessÃ¡rios:

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

SeguranÃ§a:

- secrets ficam apenas no Supabase;
- frontend nunca recebe `RESEND_API_KEY`;
- usuÃ¡rio comum sÃ³ pode acionar e-mail para si mesmo;
- admin pode executar teste controlado para o prÃ³prio usuÃ¡rio pelo painel;
- falha de e-mail nÃ£o desfaz notificaÃ§Ã£o interna.

Status possÃ­veis:

```txt
sent
failed
not_configured
missing_destination
disabled_by_preferences
```

Para desativar temporariamente envio real:

```txt
remova/desative RESEND_API_KEY ou NOTIFICATION_EMAIL_FROM nos secrets.
```

A function deve retornar:

```txt
not_configured
```

---

## 12. Metadata e privacidade

NÃ£o salvar metadata com:

- telefone;
- endereÃ§o;
- e-mail completo;
- token;
- secret;
- base64;
- URL completa de arquivo;
- dados sensÃ­veis desnecessÃ¡rios.

Regras:

- metadata deve ser mÃ­nima;
- metadata deve ser Ãºtil para diagnÃ³stico e navegaÃ§Ã£o;
- metadata nÃ£o deve vazar informaÃ§Ã£o sensÃ­vel;
- logs tÃ©cnicos nÃ£o devem virar exposiÃ§Ã£o ao usuÃ¡rio comum.

---

## 13. Consultas SQL Ãºteis

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

## 14. Testes

### 14.1 Admin

1. Login admin.
2. Abrir `/admin/notificacoes`.
3. Verificar cards, logs e diagnÃ³sticos.
4. Clicar em **Teste interno**.
5. Clicar em **Verificar aniversÃ¡rios e memÃ³rias de hoje**.
6. Para e-mail, clicar em **Enviar e-mail de teste para mim** e confirmar.

### 14.2 UsuÃ¡rio comum

1. Login usuÃ¡rio comum.
2. Abrir `/notificacoes`.
3. Validar lista.
4. Marcar notificaÃ§Ã£o como lida.
5. Marcar todas como lidas.
6. Remover notificaÃ§Ã£o.
7. Abrir `/ajustar-notificacoes`.
8. Alterar preferÃªncias.
9. Confirmar persistÃªncia.

### 14.3 TÃ©cnico

```bash
npm run build
npm test
git diff --check
```

Se houver alteraÃ§Ã£o de Edge Function ou integraÃ§Ã£o:

```bash
supabase functions list
supabase migration list
```

---

## 15. Troubleshooting

### NotificaÃ§Ã£o interna nÃ£o aparece

Verificar:

- `notificacoes_usuario`;
- RLS;
- `user_id`;
- `create_internal_notification_for_user`;
- service de dispatch;
- filtro de lida/removida;
- erros no console.

### PreferÃªncia nÃ£o salva

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
- preferÃªncia especÃ­fica do tipo de e-mail;
- destino do usuÃ¡rio;
- logs em `notification_dispatch_logs`.

### Cron nÃ£o roda

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

### Duplicidade de notificaÃ§Ãµes

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- referenceDate;
- timezone;
- reexecuÃ§Ã£o manual;
- lÃ³gica de deduplicaÃ§Ã£o.

---

## 16. Cuidados

NÃ£o fazer:

- commitar service role key;
- commitar Resend API key;
- commitar secrets;
- usar testes de e-mail para todos os usuÃ¡rios;
- salvar metadata sensÃ­vel;
- apagar logs de produÃ§Ã£o sem confirmaÃ§Ã£o explÃ­cita;
- hardcodar segredo de cron em migration;
- marcar push/WhatsApp como ativo sem provider real.

Fazer:

- manter logs mÃ­nimos;
- tratar falha de canal externo sem desfazer notificaÃ§Ã£o interna;
- testar admin e usuÃ¡rio comum;
- manter cron automÃ¡tico separado de migration com secret;
- atualizar `docs/operacao/MIGRATIONS_SUPABASE.md` se houver alteraÃ§Ã£o de banco/cron.

---

## 17. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- push real;
- WhatsApp real;
- fila/retry avanÃ§ado;
- preferÃªncias mais granulares;
- digest semanal;
- notificaÃ§Ãµes por fÃ³rum;
- notificaÃ§Ãµes por novos arquivos histÃ³ricos;
- notificaÃ§Ãµes por eventos familiares;
- painel de mÃ©tricas;
- retry de e-mail;
- templates transacionais.

Esses itens nÃ£o bloqueiam o MVP.
