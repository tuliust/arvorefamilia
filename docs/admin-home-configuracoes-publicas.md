# /admin/home — configurações visuais e páginas públicas

## Objetivo

A área `/admin/home` centraliza a gestão visual e editorial das páginas públicas do projeto, incluindo `/entrar`, `/termos` e `/privacidade`.

Esta frente cobre:

- identidade visual global;
- textos da tela `/entrar`;
- links públicos de termos, privacidade e suporte;
- SEO básico;
- upload de logo, background e imagem de compartilhamento;
- preview mobile/desktop;
- rascunho, publicação manual e publicação agendada;
- auditoria de alterações visuais.

## Arquivos principais

| Arquivo | Função |
|---|---|
| `src/app/pages/admin/AdminHomeSettings.tsx` | Interface administrativa de configurações públicas. |
| `src/app/services/siteVisualSettingsService.ts` | Leitura, normalização, salvamento, rascunho, publicação e diff. |
| `src/app/services/siteVisualSettingsAuditService.ts` | Listagem e criação de registros de auditoria. |
| `src/app/hooks/useSiteVisualSettings.ts` | Hook compartilhado para páginas públicas consumirem o tema. |
| `src/app/components/public/PublicThemeFrame.tsx` | Frame visual público reutilizável. |
| `src/app/pages/legal/PublicLegalDocumentPage.tsx` | Layout temático de `/termos` e `/privacidade`. |
| `supabase/functions/publish-scheduled-site-settings/index.ts` | Edge Function chamada pelo scheduler. |
| `.github/workflows/publish-scheduled-site-settings.yml` | Cron GitHub Actions para acionar a Edge Function. |

## Banco de dados

### Tabela principal

`public.site_visual_settings`

Contém a versão publicada e, quando houver, o rascunho/agendamento.

Campos operacionais relevantes:

- `publication_status`: `published`, `draft` ou `scheduled`;
- `draft_payload`: JSON com a versão preparada para publicação;
- `scheduled_publish_at`: data/hora prevista para publicação;
- `last_published_at`: data/hora da última publicação;
- `last_published_by`: usuário que publicou manualmente, quando aplicável.

### Tabela de auditoria

`public.site_visual_settings_audit`

Registra ações administrativas:

- `created`;
- `updated`;
- `published`;
- `scheduled`;
- `draft_saved`;
- `restored`.

## Publicação manual

Fluxo:

1. Admin altera campos em `/admin/home`.
2. Admin clica em `Publicar agora`.
3. `saveSiteVisualSettings()` grava os campos na tabela principal.
4. `draft_payload` e `scheduled_publish_at` são limpos.
5. `publication_status` volta para `published`.
6. Auditoria é registrada.

## Rascunho

Fluxo:

1. Admin altera campos em `/admin/home`.
2. Admin clica em `Salvar rascunho`.
3. `saveSiteVisualSettingsDraft()` grava os campos em `draft_payload`.
4. A versão pública não muda.
5. O comparativo `publicado x rascunho` passa a exibir diferenças.

## Agendamento

Fluxo:

1. Admin altera campos em `/admin/home`.
2. Admin define data/hora.
3. Admin clica em `Agendar`.
4. `scheduleSiteVisualSettingsPublication()` grava `publication_status = scheduled`, `draft_payload` e `scheduled_publish_at`.
5. A versão pública não muda até a publicação ser executada.

## Execução de publicações vencidas

A função SQL:

```sql
public.publish_due_site_visual_settings()
```

Executa a publicação se:

- `publication_status = 'scheduled'`;
- `scheduled_publish_at <= now()`;
- `draft_payload` não está vazio.

Ela publica o rascunho, limpa o agendamento, registra auditoria e retorna status da operação.

## Edge Function

A Edge Function `publish-scheduled-site-settings` chama a RPC acima usando a service role.

Variáveis necessárias no Supabase:

| Variável | Obrigatória | Função |
|---|---:|---|
| `SUPABASE_URL` | Sim | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave service role para executar a RPC com segurança. |
| `SITE_SETTINGS_CRON_SECRET` | Recomendado | Segredo para proteger chamadas externas. |

Deploy sugerido:

```bash
supabase functions deploy publish-scheduled-site-settings
```

## GitHub Actions cron

Workflow:

```text
.github/workflows/publish-scheduled-site-settings.yml
```

Ele roda a cada 15 minutos e também pode ser acionado manualmente com `workflow_dispatch`.

Secrets necessários no GitHub:

| Secret | Exemplo |
|---|---|
| `SITE_SETTINGS_PUBLISH_URL` | `https://<project-ref>.functions.supabase.co/publish-scheduled-site-settings` |
| `SITE_SETTINGS_CRON_SECRET` | Mesmo valor configurado em `SITE_SETTINGS_CRON_SECRET` no Supabase. |

## QA mínimo

1. Salvar rascunho e confirmar comparativo.
2. Publicar rascunho manualmente.
3. Agendar publicação para horário vencido.
4. Clicar em `Executar vencidas` no admin.
5. Confirmar que a publicação foi aplicada.
6. Confirmar novo registro em `Histórico`.
7. Testar workflow manual no GitHub Actions.
8. Confirmar que chamada sem `x-cron-secret` falha quando o segredo está configurado.

## Limites conhecidos

- O cron GitHub Actions não roda exatamente a cada 15 minutos; o GitHub pode atrasar execuções.
- A publicação agendada depende da Edge Function estar deployada e dos secrets estarem configurados.
- O comparativo atual é textual/campo a campo. Comparativo visual por screenshots é uma etapa futura.
