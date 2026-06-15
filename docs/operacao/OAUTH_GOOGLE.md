# Google OAuth e Google Agenda

> Última revisão: 2026-06-14  
> Local canônico: `docs/operacao/OAUTH_GOOGLE.md`  
> Tipo: documentação operacional específica de OAuth Google e integração Google Agenda.  
> Status: revisado para separar operação OAuth de ajustes visuais do calendário.

---

## 1. Objetivo

Este documento orienta a configuração e manutenção da integração com Google OAuth/Google Agenda.

Use para:

- configurar consent screen;
- revisar domínio e redirect URI;
- adicionar test users;
- configurar secrets;
- publicar Edge Functions;
- diagnosticar bloqueios de OAuth;
- validar conexão no calendário familiar.

Não use este documento para ajustes visuais do calendário mobile.

---

## 2. Escopo da integração

Arquivos relevantes:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/services/googleCalendarService.ts
supabase/functions/google-calendar-auth/index.ts
supabase/functions/google-calendar-callback/index.ts
supabase/functions/google-calendar-sync/index.ts
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Regras:

- frontend não manipula client secret;
- tokens sensíveis ficam em Edge Function/backend/Supabase;
- usuário precisa estar autenticado;
- falha do Google deve ser exibida como erro controlado;
- app em Testing exige usuários cadastrados como test users.

---

## 3. O que não é OAuth

Ajustes abaixo não alteram OAuth:

- cinco botões mobile de categoria;
- bolinha colorida acima do texto;
- layout mobile do calendário;
- copy local do botão;
- CSS do calendário;
- filtro visual de categorias.

OAuth só entra no escopo quando mudar:

- escopos;
- redirect URI;
- consent screen;
- domínio;
- Edge Functions `google-calendar-*`;
- secrets;
- service `googleCalendarService.ts`;
- textos públicos exigidos pela verificação Google.

---

## 4. Secrets

Secrets devem ficar no Supabase/Edge Functions ou backend seguro.

Exemplos conceituais:

```bash
supabase secrets set GOOGLE_CLIENT_ID="..."
supabase secrets set GOOGLE_CLIENT_SECRET="..."
supabase secrets set GOOGLE_REDIRECT_URI="https://seudominio.com/..."
supabase secrets set SITE_URL="https://seudominio.com"
```

Regras:

- não usar `VITE_GOOGLE_CLIENT_SECRET`;
- não commitar `.env.local`;
- não colar client secret em prompt, issue, log ou documentação;
- preview e produção podem exigir redirect URIs diferentes;
- confirmar projeto Supabase antes de testar.

---

## 5. Consent screen

A tela de consentimento deve estar alinhada com:

- domínio final;
- nome público do app;
- descrição da integração;
- política de privacidade pública;
- termos de uso públicos;
- escopos solicitados;
- e-mail de suporte;
- redirect URI autorizado.

Páginas públicas necessárias:

```txt
/entrar
/privacidade
/termos
```

Regras:

- `/privacidade` e `/termos` devem abrir sem login;
- `/entrar` deve explicar a plataforma de forma pública;
- não prometer funcionalidade Google além do implementado/aprovado.

---

## 6. Modo Testing

Enquanto o app OAuth não estiver aprovado para produção:

```txt
Usuários reais que testarem Google Agenda devem ser adicionados como test users.
```

Checklist:

1. abrir Google Cloud Console;
2. selecionar projeto correto;
3. confirmar OAuth consent screen;
4. confirmar app em Testing;
5. adicionar e-mail do usuário;
6. conferir redirect URI;
7. testar em `/calendario-familiar`.

Bloqueio por usuário não cadastrado como test user não é bug de frontend.

---

## 7. Edge Functions

Comandos úteis:

```bash
supabase functions list
supabase functions deploy google-calendar-auth
supabase functions deploy google-calendar-callback
supabase functions deploy google-calendar-sync
```

Antes de testar:

- secrets configurados;
- domínio e redirect URI corretos;
- usuário testador cadastrado quando Testing;
- frontend apontando para Supabase correto.

---

## 8. Checklist manual

```txt
1. Abrir /entrar sem login.
2. Abrir /privacidade sem login.
3. Abrir /termos sem login.
4. Entrar com usuário autorizado.
5. Abrir /calendario-familiar.
6. Clicar para conectar Google Agenda.
7. Confirmar redirect para Google.
8. Autorizar escopos.
9. Confirmar callback ao app.
10. Confirmar estado conectado ou erro controlado.
11. Sincronizar, se ação disponível.
12. Desconectar, se ação disponível.
```

---

## 9. Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| usuário bloqueado | app em Testing sem test user | adicionar e-mail no Google Cloud |
| redirect mismatch | URI diferente da configurada | corrigir redirect URI |
| erro de secret | secret ausente/incorreto | revisar secrets da Edge Function |
| callback não conclui | função não publicada ou erro server-side | conferir logs e deploy |
| calendário não conecta | escopo/domínio/consent screen | revisar configuração OAuth |
| UI quebra após falha Google | erro não tratado | corrigir tratamento no service/UI |

---

## 10. Segurança

- não expor tokens OAuth no frontend;
- não salvar client secret no repositório;
- não registrar tokens em logs;
- não usar service role no navegador;
- revogar tokens quando desconectar, se o fluxo implementar;
- respeitar escopos mínimos necessários;
- manter política de privacidade coerente com o uso real.

---

## 11. Relação com migrations

OAuth pode depender de tabelas/conexões no banco.

Se houver alteração de schema:

```txt
Criar migration e seguir MIGRATIONS_SUPABASE.md.
```

Se a mudança for apenas consent screen, redirect URI, test user ou secret:

```txt
Não criar migration.
```

---

## 12. Critérios para atualizar este documento

Atualize quando houver:

- novo escopo Google;
- mudança de redirect URI;
- mudança de domínio;
- aprovação para produção;
- nova Edge Function Google;
- mudança em `googleCalendarService.ts`;
- alteração de exigência pública de privacidade/termos;
- novo troubleshooting recorrente.
