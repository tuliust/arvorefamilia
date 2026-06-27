# /admin/home — configurações visuais e páginas públicas

> Última revisão: 2026-06-27  
> Escopo: `/admin/home`, configurações públicas, publicação, rascunho, agendamento, auditoria e salvamento por abas.  
> Status: canônico.

## Objetivo

A área `/admin/home` centraliza a gestão visual e editorial das páginas públicas do projeto, incluindo `/entrar`, `/termos`, `/privacidade` e `/duvidas`.

Esta frente cobre:

- identidade visual global;
- textos da tela `/entrar`;
- links públicos de termos, privacidade e suporte;
- SEO básico;
- upload de logo, background e imagem de compartilhamento;
- preview mobile/desktop;
- rascunho, publicação manual e publicação agendada;
- auditoria de alterações visuais;
- diff detalhado campo a campo para registros de auditoria;
- aplicação progressiva do tema público em páginas públicas;
- salvamento controlado das abas após carregamento das configurações.

## Arquivos principais

| Arquivo | Função |
|---|---|
| `src/app/pages/admin/AdminHomeSettings.tsx` | Interface administrativa de configurações públicas, histórico e visualização detalhada de alterações. |
| `src/app/pages/admin/AdminHomeSettingsWithSaveBar.tsx` | Wrapper/composição atual com barra ou ação de salvar quando aplicável. |
| `src/app/services/siteVisualSettingsService.ts` | Leitura, normalização, salvamento, rascunho, publicação e diff. |
| `src/app/services/siteVisualSettingsAuditService.ts` | Listagem e criação de registros de auditoria. |
| `src/app/services/siteVisualSettingsAuditDiffService.ts` | Cliente RPC para consultar diferenças campo a campo por registro de auditoria. |
| `src/app/hooks/useSiteVisualSettings.ts` | Hook compartilhado para páginas públicas consumirem o tema. |
| `src/app/components/public/PublicThemeFrame.tsx` | Frame visual público reutilizável. |
| `src/app/pages/Entrar.tsx` | Tela pública de entrada e primeiro acesso. |
| `src/app/pages/Duvidas.tsx` | Central pública de dúvidas usando o tema público. |
| `src/app/pages/legal/PublicLegalDocumentPage.tsx` | Layout temático de `/termos` e `/privacidade`. |
| `supabase/functions/publish-scheduled-site-settings/index.ts` | Edge Function chamada pelo scheduler. |
| `.github/workflows/publish-scheduled-site-settings.yml` | Cron GitHub Actions para acionar a Edge Function. |

## Páginas públicas tematizadas

| Rota | Status |
|---|---|
| `/entrar` | Usa configurações públicas de identidade, texto, logo, fundo, links e SEO. |
| `/termos` | Usa layout público temático e links públicos. |
| `/privacidade` | Usa layout público temático e links públicos. |
| `/duvidas` | Usa `PublicThemeFrame`, background configurável e rodapé público. |

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

### Diff detalhado da auditoria

A função SQL:

```sql
public.get_site_visual_settings_audit_changes(audit_record_id uuid)
```

Retorna, para um registro de auditoria específico:

- `field_key`;
- `field_label`;
- `previous_value`;
- `next_value`.

Ela compara `previous_payload` e `next_payload`, filtra apenas campos realmente alterados e só retorna dados para usuários administradores autenticados.

Cliente frontend:

```text
src/app/services/siteVisualSettingsAuditDiffService.ts
```

Uso na interface:

```text
/admin/home > Histórico > Ver alterações
```

A abertura mostra tabela campo a campo com coluna `Antes` e `Depois` para o registro selecionado.

## Salvamento de alterações

A página deve permitir salvar alterações depois que as configurações terminarem de carregar.

Regras:

- o botão ou barra de salvar deve estar disponível nas abas quando houver alteração aplicável;
- o toast `Aguarde o carregamento das configurações antes de salvar.` só pode bloquear ações enquanto o carregamento realmente estiver pendente;
- depois do carregamento, o salvamento deve chamar o serviço correto e persistir os campos alterados;
- salvar não deve quebrar rascunho, publicação manual ou agendamento;
- estados de carregamento devem evitar clique duplo e feedback deve ser exibido por `toast`.

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
supabase functions deploy publish-scheduled-site-settings --no-verify-jwt
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

1. Salvar alteração simples em uma aba e recarregar para confirmar persistência.
2. Confirmar que o botão/barra de salvar aparece quando há alteração aplicável.
3. Confirmar que o toast de carregamento não bloqueia salvamento após dados carregados.
4. Salvar rascunho e confirmar comparativo.
5. Publicar rascunho manualmente.
6. Agendar publicação para horário vencido.
7. Clicar em `Executar vencidas` no admin.
8. Confirmar que a publicação foi aplicada.
9. Confirmar novo registro em `Histórico`.
10. Testar workflow manual no GitHub Actions.
11. Confirmar que chamada sem `x-cron-secret` falha quando o segredo está configurado.
12. Conferir `/duvidas` com o mesmo background, rodapé público e links configurados em `/admin/home`.
13. Executar a RPC `get_site_visual_settings_audit_changes` para um registro de auditoria e confirmar retorno campo a campo.
14. Em `/admin/home`, abrir `Histórico`, clicar em `Ver alterações` e validar a tabela `Antes`/`Depois`.

## Limites conhecidos

- O cron GitHub Actions não roda exatamente a cada 15 minutos; o GitHub pode atrasar execuções.
- A publicação agendada depende da Edge Function estar deployada e dos secrets estarem configurados.
- O comparativo atual é textual/campo a campo. Comparativo visual por screenshots é uma etapa futura.
- A auditoria detalhada mostra valores textuais retornados pela RPC. Campos JSON extensos, como `draft_payload`, podem aparecer serializados.
