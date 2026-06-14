# Google OAuth e Google Agenda

> Última revisão: 2026-06-14  
> Local canônico: `docs/operacao/OAUTH_GOOGLE.md`  
> Tipo: documentação operacional específica de OAuth Google e integração Google Agenda.  
> Status: documento complementar extraído e consolidado a partir de `DEPLOYMENT.md`, `CALENDARIO_FAMILIAR.md`, Edge Functions e regras atuais de operação.

## 1. Objetivo

Este documento orienta a operação da integração com Google OAuth/Google Agenda no projeto **Árvore Família**.

Use este arquivo para:

- configurar ou revisar consent screen do Google Cloud;
- validar domínio, redirect URI e modo Testing/Production;
- adicionar test users;
- revisar secrets das Edge Functions;
- diagnosticar bloqueio de OAuth;
- validar integração no calendário familiar;
- evitar exposição de tokens OAuth no frontend.

Este documento não substitui:

| Tema | Documento |
|---|---|
| Deploy geral | `docs/operacao/DEPLOYMENT.md` |
| Calendário familiar | `docs/funcionalidades/CALENDARIO_FAMILIAR.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Segurança/secrets | `docs/operacao/README.md` |
| Migrations | `docs/operacao/MIGRATIONS_SUPABASE.md` |

---

## 2. Escopo da integração

A integração com Google Agenda permite conectar a conta Google do usuário para sincronizar ou interagir com datas familiares, conforme o escopo implementado no calendário.

Arquivos e funções relevantes:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/services/googleCalendarService.ts
supabase/functions/google-calendar-auth/index.ts
supabase/functions/google-calendar-callback/index.ts
supabase/functions/google-calendar-sync/index.ts
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Regras:

- o frontend não manipula tokens OAuth sensíveis diretamente;
- tokens e client secret ficam em Edge Function/backend/Supabase;
- o usuário precisa estar autenticado para conectar a agenda;
- falha externa do Google não deve quebrar o restante do app;
- a ausência de aprovação OAuth não é bug de frontend.

---

## 3. Variáveis e secrets

Secrets OAuth devem ficar no ambiente seguro do Supabase/Edge Functions ou no provedor backend equivalente.

Exemplos conceituais:

```bash
supabase secrets set GOOGLE_CLIENT_ID="..."
supabase secrets set GOOGLE_CLIENT_SECRET="..."
supabase secrets set GOOGLE_REDIRECT_URI="https://seudominio.com/..."
supabase secrets set SITE_URL="https://seudominio.com"
```

Regras:

- não usar secrets OAuth com prefixo `VITE_`;
- não commitar `.env.local`;
- não colar client secret em issue, prompt, log ou documentação;
- confirmar ambiente correto antes de testar;
- preview e produção podem exigir redirect URIs diferentes.

---

## 4. Consent screen e domínio

A tela de consentimento OAuth deve estar alinhada com:

- domínio final publicado;
- nome público do app;
- descrição da finalidade da integração;
- política de privacidade pública;
- termos de uso públicos;
- escopos solicitados;
- e-mail de suporte;
- redirect URI autorizado.

Páginas públicas obrigatórias:

```txt
/entrar
/privacidade
/termos
```

Regras:

- `/privacidade` e `/termos` devem abrir sem login;
- `/entrar` deve explicar a plataforma sem depender de login;
- o texto público não deve prometer funcionalidade Google além do que está implementado/aprovado;
- se o app estiver em modo Testing, usuários reais precisam estar cadastrados como test users.

---

## 5. Modo Testing

Enquanto a autorização OAuth não estiver aprovada para produção:

```txt
O app deve permanecer em modo Testing no Google Cloud.
Usuários reais que testarem Google Agenda devem ser adicionados manualmente como test users.
```

Checklist:

1. Abrir Google Cloud Console.
2. Selecionar o projeto correto.
3. Confirmar OAuth consent screen.
4. Confirmar app em modo Testing.
5. Adicionar e-mail do usuário como test user.
6. Confirmar redirect URI.
7. Testar conexão em `/calendario-familiar`.

Não tratar bloqueio de usuário não cadastrado como bug do app.

---

## 6. Checklist de configuração

```txt
1. Confirmar domínio final.
2. Confirmar /entrar público.
3. Confirmar /privacidade público.
4. Confirmar /termos público.
5. Confirmar Google Client ID.
6. Confirmar Google Client Secret em ambiente seguro.
7. Confirmar redirect URI autorizado.
8. Confirmar Edge Functions publicadas.
9. Confirmar usuário testador, se Testing.
10. Abrir /calendario-familiar e conectar agenda.
```

Comandos úteis:

```bash
supabase functions list
supabase functions deploy google-calendar-auth
supabase functions deploy google-calendar-callback
supabase functions deploy google-calendar-sync
```

---

## 7. Checklist manual de teste

```txt
1. Abrir /entrar em janela anônima.
2. Abrir /privacidade sem login.
3. Abrir /termos sem login.
4. Entrar com usuário autorizado.
5. Abrir /calendario-familiar.
6. Acionar conexão com Google Agenda.
7. Confirmar redirect para Google.
8. Autorizar escopos.
9. Confirmar retorno ao app.
10. Confirmar estado conectado ou mensagem de erro controlada.
11. Sincronizar, quando a ação estiver disponível.
12. Desconectar, quando a ação estiver disponível.
```

---

## 8. Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| Google bloqueia usuário real | App em modo Testing e usuário não cadastrado | Adicionar e-mail como test user |
| Redirect URI mismatch | URI no Google Cloud não corresponde ao callback real | Corrigir authorized redirect URI |
| Tela de consentimento não aprovada | App ainda em verificação | Manter Testing ou concluir processo de aprovação |
| Callback volta com erro | Secret ausente, URI errada ou state inválido | Verificar Edge Function e logs |
| Conexão funciona local e falha produção | Secrets/domínio diferentes | Conferir variáveis do ambiente final |
| Frontend recebe HTML em rota API | fallback SPA capturou endpoint | Revisar rewrites/fallback |
| Tokens aparecem no console | log indevido | Remover logs e revisar Edge Function |
| Falha após deploy | cache/rotas/chunks ou Edge Function não publicada | Validar `DEPLOYMENT.md` |

---

## 9. Não fazer

- Não colocar client secret no frontend.
- Não usar `VITE_GOOGLE_CLIENT_SECRET`.
- Não commitar `.env.local`.
- Não expor tokens em logs.
- Não tratar usuário não cadastrado em Testing como bug do frontend.
- Não alterar RLS/Auth para contornar OAuth.
- Não ampliar escopos sem revisar consent screen e justificativa.
- Não remover `/privacidade` ou `/termos` do acesso público.
- Não reintroduzir texto promocional de Google Agenda em `/entrar` sem decisão explícita.

---

## 10. Documentos relacionados

```txt
docs/operacao/DEPLOYMENT.md
docs/operacao/README.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/GUIA_CORRECAO_ERROS.md
docs/PLANO_PROXIMOS_PASSOS.md
```
