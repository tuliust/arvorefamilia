# Notificacoes

> Local recomendado: `docs/funcionalidades/NOTIFICACOES.md`
> Tipo: documentacao funcional e operacional especifica.

---

## 1. Status

Frente 7.1 concluida tecnicamente no escopo atual do MVP.

### Pronto

- Central do usuario em `/notificacoes`, dedicada a lista em cards.
- Preferencias do usuario em `/ajustar-notificacoes`.
- Componente `NotificationPreferencesPanel`.
- Painel admin em `/admin/notificacoes`.
- Notificacoes internas.
- Preferencias por categoria e canal.
- Logs em `notification_dispatch_logs`.
- Deduplicacao de recorrencias em `notification_occurrences`.
- Rotina manual de aniversarios e memorias.
- Edge Function `run-daily-notifications` preparada e deployada.
- Edge Function `send-notification-email` com provider Resend e teste controlado admin.

### Futuro

- push real;
- WhatsApp real;
- fila/retry avancado;
- cron automatico somente depois de configurar segredo seguro fora do repositorio.

---

## 2. Rotas

| Rota | Protecao | Funcao |
|---|---|---|
| `/notificacoes` | `MemberRoute` | Central/lista de notificacoes em cards. |
| `/ajustar-notificacoes` | `MemberRoute` | Preferencias de notificacoes do usuario. |
| `/admin/notificacoes` | `ProtectedRoute` | Diagnostico, testes e rotinas administrativas. |

Documentacao complementar:

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
| `notificationDispatchService.ts` | Orquestra canais, preferencias e logs. |
| `notificationRecipientsService.ts` | Resolve admins e usuarios vinculados. |
| `notificationTriggersService.ts` | Integra gatilhos event-driven. |
| `notificationScheduledService.ts` | Rotina manual de aniversarios/memorias. |
| `notificationAdminService.ts` | Diagnostico admin. |
| `userEngagementService.ts` | Preferencias e lista do usuario. |

---

### 3.2 UI principal

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
```

Responsabilidades:

| Arquivo | Funcao |
|---|---|
| `Notificacoes.tsx` | Central/lista, marcar como lida, marcar todas e remover. |
| `AjustarNotificacoes.tsx` | Pagina dedicada de preferencias. |
| `NotificationPreferencesPanel.tsx` | Toggles e salvamento. |
| `AdminNotificacoes.tsx` | Diagnostico, testes e rotinas. |

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

- notificacao interna;
- lista do usuario;
- status lida/nao lida;
- remocao;
- metadata sanitizada.

### 4.2 `preferencias_notificacao`

Uso:

- preferencias gerais;
- preferencias por canal;
- preferencias especificas de e-mail.

### 4.3 `notification_dispatch_logs`

Uso:

- log tecnico de tentativa de envio;
- status por canal;
- provider;
- erro;
- metadata.

### 4.4 `notification_occurrences`

Uso:

- deduplicacao de recorrencias;
- aniversarios;
- datas de memoria;
- rotina diaria/manual.

---

## 5. RPCs existentes

```txt
create_internal_notification_for_user
insert_notification_dispatch_log_for_user
list_admin_user_ids
```

Regras:

- usuario comum nao deve acionar envio para terceiros;
- admin pode executar testes controlados;
- service role deve ficar apenas no backend/Edge Function;
- falha de canal externo nao deve desfazer notificacao interna.

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
- destino valido;
- preferencia do usuario.

### 6.2 Futuros

```txt
push
whatsapp
```

Regra:

```txt
Push e WhatsApp devem permanecer como not_configured/ignorado ate haver provider real.
```

---

## 7. Preferencias

### 7.1 Preferencias gerais

```txt
receber_aniversarios
receber_datas_memoria
receber_eventos
receber_avisos_gerais
receber_email
receber_push
receber_whatsapp
```

### 7.2 Preferencias especificas de e-mail

```txt
receber_email_novo_usuario
receber_email_datas_especiais
receber_email_novas_mensagens_forum
receber_email_novos_registros_historicos
receber_email_evento_historico_familia
```

Regras:

- preferencia geral de canal deve ser respeitada;
- preferencia especifica deve ser respeitada;
- canal ausente/configurado incorretamente deve retornar status apropriado;
- usuario deve poder alterar preferencias em `/ajustar-notificacoes`.

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

Botao:

```txt
Verificar aniversarios e memorias de hoje
```

Funcao chamada:

```txt
runDailyNotificationChecks
```

Regras:

- rotina usa apenas canal interno;
- respeita preferencias;
- deduplica por `notification_occurrences.occurrence_key`;
- nao envia email/push/WhatsApp nessa rotina manual, salvo alteracao futura explicita.

Padrao de chave:

```txt
aniversario:YYYY-MM-DD:userId:pessoaId
memoria_falecimento:YYYY-MM-DD:userId:pessoaId
```

---

## 9. Edge Function diaria

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

Se `referenceDate` nao for enviado, a data atual em `America/Sao_Paulo` e usada.

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

Seguranca:

- usa `SUPABASE_SERVICE_ROLE_KEY` somente dentro da Edge Function;
- aceita `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` ou `x-daily-notifications-secret`;
- nao envia email/push/WhatsApp.

---

## 10. Agendamento automatico

Status atual:

```txt
preparado, mas nao ativado por migration.
```

Motivo:

```txt
para chamar a Edge Function via pg_cron com seguranca,
o segredo precisa estar no ambiente/secret manager do projeto,
nao hardcoded em migration.
```

Horario planejado:

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

Verificacao util:

```sql
select *
from cron.job
where jobname = 'run-daily-notifications-0800-brt';
```

Regra consolidada:

- a Edge Function esta preparada;
- a rotina manual/admin e suportada;
- a ativacao automatica por cron depende de ambiente/secret seguro;
- nao versionar segredo em migration;
- antes de marcar cron como ativo em producao, confirmar no Supabase se o job esta agendado e operacional.

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

Secrets necessarios:

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

Seguranca:

- secrets ficam apenas no Supabase;
- frontend nunca recebe `RESEND_API_KEY`;
- usuario comum so pode acionar e-mail para si mesmo;
- admin pode executar teste controlado para o proprio usuario pelo painel;
- falha de e-mail nao desfaz notificacao interna.

Status possiveis:

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

Nao salvar metadata com:

- telefone;
- endereco;
- e-mail completo;
- token;
- secret;
- base64;
- URL completa de arquivo;
- dados sensiveis desnecessarios.

Regras:

- metadata deve ser minima;
- metadata deve ser util para diagnostico e navegacao;
- metadata nao deve vazar informacao sensivel;
- logs tecnicos nao devem virar exposicao ao usuario comum.

---

## 13. Consultas SQL uteis

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
3. Verificar cards, logs e diagnosticos.
4. Clicar em **Teste interno**.
5. Clicar em **Verificar aniversarios e memorias de hoje**.
6. Para e-mail, clicar em **Enviar e-mail de teste para mim** e confirmar.

### 14.2 Usuario comum

1. Login usuario comum.
2. Abrir `/notificacoes`.
3. Validar lista.
4. Marcar notificacao como lida.
5. Marcar todas como lidas.
6. Remover notificacao.
7. Abrir `/ajustar-notificacoes`.
8. Alterar preferencias.
9. Confirmar persistencia.

### 14.3 Tecnico

```bash
npm run build
npm test
git diff --check
```

Se houver alteracao de Edge Function ou integracao:

```bash
supabase functions list
supabase migration list
```

---

## 15. Troubleshooting

### Notificacao interna nao aparece

Verificar:

- `notificacoes_usuario`;
- RLS;
- `user_id`;
- `create_internal_notification_for_user`;
- service de dispatch;
- filtro de lida/removida;
- erros no console.

### Preferencia nao salva

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
- preferencia especifica do tipo de e-mail;
- destino do usuario;
- logs em `notification_dispatch_logs`.

### Cron nao roda

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

### Duplicidade de notificacoes

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- referenceDate;
- timezone;
- reexecucao manual;
- logica de deduplicacao.

---

## 16. Cuidados

Nao fazer:

- commitar service role key;
- commitar Resend API key;
- commitar secrets;
- usar testes de e-mail para todos os usuarios;
- salvar metadata sensivel;
- apagar logs de producao sem confirmacao explicita;
- hardcodar segredo de cron em migration;
- marcar push/WhatsApp como ativo sem provider real.

Fazer:

- manter logs minimos;
- tratar falha de canal externo sem desfazer notificacao interna;
- testar admin e usuario comum;
- manter cron automatico separado de migration com secret;
- atualizar `docs/operacao/MIGRATIONS_SUPABASE.md` se houver alteracao de banco/cron.

---

## 17. Pos-MVP

Possiveis evolucoes:

- push real;
- WhatsApp real;
- fila/retry avancado;
- preferencias mais granulares;
- digest semanal;
- notificacoes por forum;
- notificacoes por novos arquivos historicos;
- notificacoes por eventos familiares;
- painel de metricas;
- retry de e-mail;
- templates transacionais.

Esses itens nao bloqueiam o MVP.
