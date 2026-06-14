# Operação e manutenção

> Última revisão: 2026-06-14
> Local canônico: `docs/operacao/README.md`
> Tipo: índice operacional da pasta `docs/operacao`.
> Status: revisado após os lotes documentais de arquitetura, componentes, UX, funcionalidades da árvore, exportação, deploy, migrations, Storage e OAuth.

## 1. Objetivo

Esta pasta reúne procedimentos operacionais que podem afetar infraestrutura, banco, Storage, deploy, migrations, secrets, OAuth, Edge Functions, rotas serverless ou dados reais.

Ela não substitui os guias canônicos da raiz de `docs/`. Use os documentos de operação quando a tarefa envolver:

- deploy e publicação;
- variáveis de ambiente;
- Supabase migrations;
- Edge Functions;
- rotas serverless do provedor, como `/api/*`;
- manutenção de Storage;
- scripts administrativos;
- dry-run de limpeza;
- operações com service role;
- dados legados;
- Google OAuth/Agenda;
- execução de comandos que podem alterar infraestrutura ou dados.

Este índice operacional também registra a separação entre mudanças de produto/UI e operações de infraestrutura: ajustes em árvore, calendário mobile, paletas, conectores, cards, painel ou documentação não devem ser tratados como motivo automático para migration, deploy de Edge Function ou manutenção de Storage.

Regra de escopo:

```txt
Ajuste visual, layout mobile, paleta, conectores, modal, exportação visual ou documentação não exige migration.
Alteração de schema, RLS, RPC, trigger, Storage policy ou Edge Function exige revisão operacional.
```

---

## 2. Documentos desta pasta

| Arquivo | Função | Status |
|---|---|---|
| `DEPLOYMENT.md` | Checklist completo de build, variáveis, deploy estático, cache SPA, Supabase, Edge Functions, rotas `/api/*`, Google Agenda/OAuth, QA pós-deploy e troubleshooting. | Canônico para deploy. |
| `DEPLOY.md` | Atalho operacional curto para deploy, apontando para `DEPLOYMENT.md`. | Complementar. |
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, `supabase migration list`, `supabase db push`, schema cache, RLS, RPCs, SQL legado, dados familiares, Google Calendar e validação pós-migration. | Canônico para banco. |
| `STORAGE_MAINTENANCE.md` | Diagnóstico de objetos órfãos, migração de base64 legado, buckets, scripts administrativos e limpeza auditada de Storage. | Canônico para Storage. |
| `OAUTH_GOOGLE.md` | Operação específica de Google OAuth/Google Agenda, consent screen, test users, domínio, redirects, escopos e troubleshooting. | Complementar/canônico para OAuth Google. |

Observação:

```txt
Se o repositório optar por manter apenas DEPLOYMENT.md como documento único de deploy,
DEPLOY.md pode permanecer como arquivo curto de redirecionamento operacional.
```

---

## 3. Relação com outros documentos

| Documento | Papel |
|---|---|
| `../README.md` | Índice canônico da documentação do projeto. |
| `../GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que está implementado. |
| `../GUIA_COMPONENTES.md` | Componentes, responsabilidades e anti-regressões. |
| `../GUIA_UX_LAYOUT.md` | Decisões visuais, responsividade, painéis, árvore e mobile. |
| `../GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. |
| `../PLANO_PROXIMOS_PASSOS.md` | Pendências reais e QA ainda aberto. |
| `../arquitetura/ARCHITECTURE.md` | Visão técnica geral da aplicação. |
| `../arquitetura/ROTAS_E_GUARDS.md` | Rotas, guards, `TreeViewMode` e renderização por view. |
| `../arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de dados, tabelas, vínculos e objetos legados. |
| `../funcionalidades/CALENDARIO_FAMILIAR.md` | Regras funcionais do calendário e Google Agenda. |
| `../funcionalidades/CURIOSIDADES_E_IA.md` | Uso de IA e rota serverless `/api/ai`. |
| `../historico/README.md` | Registro histórico consolidado de auditorias, QA e frentes antigas. |

---

## 4. Regras operacionais permanentes

- Nunca versionar `.env`, `.env.local`, dumps, tokens, secrets, API keys, service role ou relatórios com dados reais.
- Nunca usar service role no frontend.
- Nunca aplicar SQL em produção sem revisão, backup e confirmação explícita.
- Nunca tratar SQL legado como fonte principal de schema.
- Preferir `supabase/migrations/` como fonte da verdade do banco.
- Executar scripts destrutivos apenas com dry-run prévio e flag explícita.
- Não misturar limpeza de Storage com migration de schema.
- Não apagar dados reais sem plano de rollback.
- Registrar no plano apenas pendências reais, não histórico longo de implementação concluída.
- Não resolver problema visual criando migration.
- Não alterar RLS, Auth, Storage ou Edge Functions para corrigir layout.
- Não expor `OPENAI_API_KEY`, OAuth client secret, Resend key ou service role com prefixo `VITE_`.
- Não deixar fallback SPA capturar rotas `/api/*`.
- Não cachear `index.html` como imutável em SPA Vite com code splitting.

---

## 5. Ordem segura para tarefas operacionais

1. Ler o documento específico desta pasta.
2. Conferir branch, ambiente e projeto Supabase.
3. Confirmar variáveis necessárias.
4. Rodar comandos não destrutivos primeiro.
5. Revisar relatório, diff ou saída.
6. Executar ação de escrita apenas quando houver confirmação explícita.
7. Validar UI/fluxos afetados.
8. Registrar ajustes documentais ou pendências reais em `PLANO_PROXIMOS_PASSOS.md`.

---

## 6. Comandos técnicos mínimos

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

## 7. Relação entre mudanças visuais e operação

Mudanças como as abaixo são **não operacionais de banco**:

- ajuste de `/mapa-familiar` mobile;
- criação/uso de `MobileFamilyHorizontalMapView`;
- troca da horizontal mobile para uma geração por tela;
- modal mobile de controles;
- fundo transparente da horizontal;
- conectores HTML/CSS/SVG;
- paletas;
- exportação visual;
- documentação.

Elas exigem:

```bash
git status --short
git diff --check
npm run build
```

E QA manual nas rotas afetadas, mas **não** exigem `supabase db push`.

---

## 8. Arquivos que não pertencem aqui

Não colocar nesta pasta:

- documentação funcional detalhada de página ou módulo;
- decisões visuais de UX;
- changelog longo de ciclos concluídos;
- diagnóstico histórico que não seja procedimento atual;
- SQL avulso sem contexto operacional;
- screenshots ou dumps com dados reais;
- backups temporários de `.env`, exports de banco ou arquivos de Storage.

Esses conteúdos devem ficar em `docs/funcionalidades/`, `docs/historico/`, `docs/GUIA_UX_LAYOUT.md`, `docs/GUIA_COMPONENTES.md`, `docs/GUIA_CORRECAO_ERROS.md`, `scripts/` ou `supabase/migrations/`, conforme o caso.

---

## 9. Critérios de bloqueio operacional

Bloquear operação, deploy ou alteração de infraestrutura se houver:

- build quebrado;
- migrations locais e remotas divergentes sem explicação;
- SQL legado sendo tratado como schema principal;
- comando destrutivo sem dry-run;
- ausência de backup quando houver escrita em dados reais;
- uso de service role fora de ambiente seguro;
- secret em frontend, documentação, issue, commit ou log;
- RLS sem validação em fluxo de usuário comum;
- Edge Function dependente de secret ausente;
- fallback SPA capturando `/api/*`;
- `index.html` com cache forte;
- documentação operacional orientando comando inseguro.

---

## 10. Manutenção deste índice

Atualizar este arquivo quando:

- documento novo for criado em `docs/operacao/`;
- documento operacional for removido ou consolidado;
- regra operacional permanente mudar;
- comandos mínimos mudarem;
- histórico consolidado substituir referências antigas;
- Google OAuth sair de modo Testing;
- rota serverless nova for adicionada.

Não usar este índice para registrar pendência funcional. Pendências reais ficam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```


---

## 7.1 Rotas vigentes em QA operacional

Quando uma tarefa operacional afetar deploy, cache, rotas, guards ou build, validar como rotas vigentes:

```txt
/entrar
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore/editar
/calendario-familiar
/forum
/notificacoes
/admin
```

E validar como rotas removidas/404, salvo redirecionamento explícito futuro:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Regra:

```txt
/minha-arvore/editar é vigente; /minha-arvore como view de árvore não é vigente.
```
