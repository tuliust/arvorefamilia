# OperaÃ§Ã£o e manutenÃ§Ã£o

> Ãšltima revisÃ£o: 2026-06-14
> Local canÃ´nico: `docs/operacao/README.md`
> Tipo: Ã­ndice operacional da pasta `docs/operacao`.
> Status: revisado apÃ³s os lotes documentais de arquitetura, componentes, UX, funcionalidades da Ã¡rvore, exportaÃ§Ã£o, deploy, migrations, Storage e OAuth.

## 1. Objetivo

Esta pasta reÃºne procedimentos operacionais que podem afetar infraestrutura, banco, Storage, deploy, migrations, secrets, OAuth, Edge Functions, rotas serverless ou dados reais.

Ela nÃ£o substitui os guias canÃ´nicos da raiz de `docs/`. Use os documentos de operaÃ§Ã£o quando a tarefa envolver:

- deploy e publicaÃ§Ã£o;
- variÃ¡veis de ambiente;
- Supabase migrations;
- Edge Functions;
- rotas serverless do provedor, como `/api/*`;
- manutenÃ§Ã£o de Storage;
- scripts administrativos;
- dry-run de limpeza;
- operaÃ§Ãµes com service role;
- dados legados;
- Google OAuth/Agenda;
- execuÃ§Ã£o de comandos que podem alterar infraestrutura ou dados.

Regra de escopo:

```txt
Ajuste visual, layout mobile, paleta, conectores, modal, exportaÃ§Ã£o visual ou documentaÃ§Ã£o nÃ£o exige migration.
AlteraÃ§Ã£o de schema, RLS, RPC, trigger, Storage policy ou Edge Function exige revisÃ£o operacional.
```

---

## 2. Documentos desta pasta

| Arquivo | FunÃ§Ã£o | Status |
|---|---|---|
| `DEPLOYMENT.md` | Checklist completo de build, variÃ¡veis, deploy estÃ¡tico, cache SPA, Supabase, Edge Functions, rotas `/api/*`, Google Agenda/OAuth, QA pÃ³s-deploy e troubleshooting. | CanÃ´nico para deploy. |
| `DEPLOY.md` | Atalho operacional curto para deploy, apontando para `DEPLOYMENT.md`. | Complementar. |
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, `supabase migration list`, `supabase db push`, schema cache, RLS, RPCs, SQL legado e validaÃ§Ã£o pÃ³s-migration. | CanÃ´nico para banco. |
| `STORAGE_MAINTENANCE.md` | DiagnÃ³stico de objetos Ã³rfÃ£os, migraÃ§Ã£o de base64 legado, buckets, scripts administrativos e limpeza auditada de Storage. | CanÃ´nico para Storage. |
| `OAUTH_GOOGLE.md` | OperaÃ§Ã£o especÃ­fica de Google OAuth/Google Agenda, consent screen, test users, domÃ­nio, redirects e troubleshooting. | Complementar/canÃ´nico para OAuth Google. |

ObservaÃ§Ã£o:

```txt
Se o repositÃ³rio optar por manter apenas DEPLOYMENT.md como documento Ãºnico de deploy,
DEPLOY.md pode permanecer como arquivo curto de redirecionamento operacional.
```

---

## 3. RelaÃ§Ã£o com outros documentos

| Documento | Papel |
|---|---|
| `../README.md` | Ãndice canÃ´nico da documentaÃ§Ã£o do projeto. |
| `../GUIA_IMPLEMENTACOES.md` | InventÃ¡rio consolidado do que estÃ¡ implementado. |
| `../GUIA_COMPONENTES.md` | Componentes, responsabilidades e anti-regressÃµes. |
| `../GUIA_UX_LAYOUT.md` | DecisÃµes visuais, responsividade, painÃ©is, Ã¡rvore e mobile. |
| `../GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. |
| `../PLANO_PROXIMOS_PASSOS.md` | PendÃªncias reais e QA ainda aberto. |
| `../arquitetura/ARCHITECTURE.md` | VisÃ£o tÃ©cnica geral da aplicaÃ§Ã£o. |
| `../arquitetura/ROTAS_E_GUARDS.md` | Rotas, guards, `TreeViewMode` e renderizaÃ§Ã£o por view. |
| `../arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de dados, tabelas, vÃ­nculos e objetos legados. |
| `../funcionalidades/CALENDARIO_FAMILIAR.md` | Regras funcionais do calendÃ¡rio e Google Agenda. |
| `../funcionalidades/CURIOSIDADES_E_IA.md` | Uso de IA e rota serverless `/api/ai`. |
| `../historico/README.md` | Registro histÃ³rico consolidado de auditorias, QA e frentes antigas. |

---

## 4. Regras operacionais permanentes

- Nunca versionar `.env`, `.env.local`, dumps, tokens, secrets, API keys, service role ou relatÃ³rios com dados reais.
- Nunca usar service role no frontend.
- Nunca aplicar SQL em produÃ§Ã£o sem revisÃ£o, backup e confirmaÃ§Ã£o explÃ­cita.
- Nunca tratar SQL legado como fonte principal de schema.
- Preferir `supabase/migrations/` como fonte da verdade do banco.
- Executar scripts destrutivos apenas com dry-run prÃ©vio e flag explÃ­cita.
- NÃ£o misturar limpeza de Storage com migration de schema.
- NÃ£o apagar dados reais sem plano de rollback.
- Registrar no plano apenas pendÃªncias reais, nÃ£o histÃ³rico longo de implementaÃ§Ã£o concluÃ­da.
- NÃ£o resolver problema visual criando migration.
- NÃ£o alterar RLS, Auth, Storage ou Edge Functions para corrigir layout.
- NÃ£o expor `OPENAI_API_KEY`, OAuth client secret, Resend key ou service role com prefixo `VITE_`.
- NÃ£o deixar fallback SPA capturar rotas `/api/*`.
- NÃ£o cachear `index.html` como imutÃ¡vel em SPA Vite com code splitting.

---

## 5. Ordem segura para tarefas operacionais

1. Ler o documento especÃ­fico desta pasta.
2. Conferir branch, ambiente e projeto Supabase.
3. Confirmar variÃ¡veis necessÃ¡rias.
4. Rodar comandos nÃ£o destrutivos primeiro.
5. Revisar relatÃ³rio, diff ou saÃ­da.
6. Executar aÃ§Ã£o de escrita apenas quando houver confirmaÃ§Ã£o explÃ­cita.
7. Validar UI/fluxos afetados.
8. Registrar ajustes documentais ou pendÃªncias reais em `PLANO_PROXIMOS_PASSOS.md`.

---

## 6. Comandos tÃ©cnicos mÃ­nimos

```bash
git status --short
git diff --check
npm run build
```

Quando houver testes afetados:

```bash
npm test
npm run test:e2e
```

Quando houver banco ou Edge Functions:

```bash
supabase migration list
supabase functions list
```

Quando houver ajuste documental amplo:

```bash
git diff --check -- docs/
npm run build
```

Quando houver deploy:

```bash
npm run build
npm run preview
```

---

## 7. RelaÃ§Ã£o entre mudanÃ§as visuais e operaÃ§Ã£o

MudanÃ§as como as abaixo sÃ£o **nÃ£o operacionais de banco**:

- ajuste de `/mapa-familiar` mobile;
- criaÃ§Ã£o/uso de `MobileFamilyHorizontalMapView`;
- troca da horizontal mobile para uma geraÃ§Ã£o por tela;
- modal mobile de controles;
- fundo transparente da horizontal;
- conectores HTML/CSS/SVG;
- paletas;
- exportaÃ§Ã£o visual;
- documentaÃ§Ã£o.

Elas exigem:

```bash
git status --short
git diff --check
npm run build
```

E QA manual nas rotas afetadas, mas **nÃ£o** exigem `supabase db push`.

---

## 8. Arquivos que nÃ£o pertencem aqui

NÃ£o colocar nesta pasta:

- documentaÃ§Ã£o funcional detalhada de pÃ¡gina ou mÃ³dulo;
- decisÃµes visuais de UX;
- changelog longo de ciclos concluÃ­dos;
- diagnÃ³stico histÃ³rico que nÃ£o seja procedimento atual;
- SQL avulso sem contexto operacional;
- screenshots ou dumps com dados reais;
- backups temporÃ¡rios de `.env`, exports de banco ou arquivos de Storage.

Esses conteÃºdos devem ficar em `docs/funcionalidades/`, `docs/historico/`, `docs/GUIA_UX_LAYOUT.md`, `docs/GUIA_COMPONENTES.md`, `docs/GUIA_CORRECAO_ERROS.md`, `scripts/` ou `supabase/migrations/`, conforme o caso.

---

## 9. CritÃ©rios de bloqueio operacional

Bloquear operaÃ§Ã£o, deploy ou alteraÃ§Ã£o de infraestrutura se houver:

- build quebrado;
- migrations locais e remotas divergentes sem explicaÃ§Ã£o;
- SQL legado sendo tratado como schema principal;
- comando destrutivo sem dry-run;
- ausÃªncia de backup quando houver escrita em dados reais;
- uso de service role fora de ambiente seguro;
- secret em frontend, documentaÃ§Ã£o, issue, commit ou log;
- RLS sem validaÃ§Ã£o em fluxo de usuÃ¡rio comum;
- Edge Function dependente de secret ausente;
- fallback SPA capturando `/api/*`;
- `index.html` com cache forte;
- documentaÃ§Ã£o operacional orientando comando inseguro.

---

## 10. ManutenÃ§Ã£o deste Ã­ndice

Atualizar este arquivo quando:

- documento novo for criado em `docs/operacao/`;
- documento operacional for removido ou consolidado;
- regra operacional permanente mudar;
- comandos mÃ­nimos mudarem;
- histÃ³rico consolidado substituir referÃªncias antigas;
- Google OAuth sair de modo Testing;
- rota serverless nova for adicionada.

NÃ£o usar este Ã­ndice para registrar pendÃªncia funcional. PendÃªncias reais ficam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```
