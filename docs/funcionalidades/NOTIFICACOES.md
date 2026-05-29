# Notificações

> Local recomendado: `docs/funcionalidades/NOTIFICACOES.md`  
> Tipo: documentação funcional e operacional específica.

---

## 1. Status

Frente 7.1 concluída tecnicamente no escopo atual do MVP.

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

### Futuro

- push real;
- WhatsApp real;
- fila/retry avançado;
- cron automático somente depois de configurar segredo seguro fora do repositório.

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
| `notificationDispatchService.ts` | Orquestra canais, preferências e logs. |
| `notificationRecipientsService.ts` | Resolve admins e usuários vinculados. |
| `notificationTriggersService.ts` | Integra gatilhos event-driven. |
| `notificationScheduledService.ts` | Rotina manual de aniversários/memórias. |
| `notificationAdminService.ts` | Diagnóstico admin. |
| `userEngagementService.ts` | Preferências e lista do usuário. |

---

### 3.2 UI principal

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
```

Responsabilidades:

| Arquivo | Função |
|---|---|
| `Notificacoes.tsx` | Central/lista, marcar como lida, marcar todas e remover. |
| `AjustarNotificacoes.tsx` | Página dedicada de preferências. |
| `NotificationPreferencesPanel.tsx` | Toggles e salvamento. |
| `AdminNotificacoes.tsx` | Diagnóstico, testes e rotinas. |

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

- notificação interna;
- lista do usuário;
- status lida/não lida;
- remoção;
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

---

## 5. RPCs existentes

```txt
create_internal_notification_for_user
insert_notification_dispatch_log_for_user
list_admin_user_ids
```

Regras:

- usuário comum não deve acionar envio para terceiros;
- admin pode executar testes controlados;
- service role deve ficar apenas no backend/Edge Function;
- falha de canal externo não deve desfazer notificação interna.

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

Regras:

- preferência geral de canal deve ser respeitada;
- preferência específica deve ser respeitada;
- canal ausente/configurado incorretamente deve retornar status apropriado;
- usuário deve poder alterar preferências em `/ajustar-notificacoes`.

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

## 9. Edge Function diária

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
  "duplicatesSkipped": 0,
  "preferenceSkipped": 0,
  "noRecipientSkipped": 0,
  "failed": 0
}
```

Segurança:

- usa `SUPABASE_SERVICE_ROLE_KEY` somente dentro da Edge Function;
- aceita `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` ou `x-daily-notifications-secret`;
- não envia email/push/WhatsApp.

---

## 10. Agendamento automático

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

Regra consolidada:

- a Edge Function está preparada;
- a rotina manual/admin é suportada;
- a ativação automática por cron depende de ambiente/secret seguro;
- não versionar segredo em migration;
- antes de marcar cron como ativo em produção, confirmar no Supabase se o job está agendado e operacional.

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

---

## 13. Consultas SQL úteis

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
3. Verificar cards, logs e diagnósticos.
4. Clicar em **Teste interno**.
5. Clicar em **Verificar aniversários e memórias de hoje**.
6. Para e-mail, clicar em **Enviar e-mail de teste para mim** e confirmar.

### 14.2 Usuário comum

1. Login usuário comum.
2. Abrir `/notificacoes`.
3. Validar lista.
4. Marcar notificação como lida.
5. Marcar todas como lidas.
6. Remover notificação.
7. Abrir `/ajustar-notificacoes`.
8. Alterar preferências.
9. Confirmar persistência.

### 14.3 Técnico

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

## 15. Troubleshooting

### Notificação interna não aparece

Verificar:

- `notificacoes_usuario`;
- RLS;
- `user_id`;
- `create_internal_notification_for_user`;
- service de dispatch;
- filtro de lida/removida;
- erros no console.

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

### Duplicidade de notificações

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- referenceDate;
- timezone;
- reexecução manual;
- lógica de deduplicação.

---

## 16. Cuidados

Não fazer:

- commitar service role key;
- commitar Resend API key;
- commitar secrets;
- usar testes de e-mail para todos os usuários;
- salvar metadata sensível;
- apagar logs de produção sem confirmação explícita;
- hardcodar segredo de cron em migration;
- marcar push/WhatsApp como ativo sem provider real.

Fazer:

- manter logs mínimos;
- tratar falha de canal externo sem desfazer notificação interna;
- testar admin e usuário comum;
- manter cron automático separado de migration com secret;
- atualizar `docs/operacao/MIGRATIONS_SUPABASE.md` se houver alteração de banco/cron.

---

## 17. Pós-MVP

Possíveis evoluções:

- push real;
- WhatsApp real;
- fila/retry avançado;
- preferências mais granulares;
- digest semanal;
- notificações por fórum;
- notificações por novos arquivos históricos;
- notificações por eventos familiares;
- painel de métricas;
- retry de e-mail;
- templates transacionais.

Esses itens não bloqueiam o MVP.
