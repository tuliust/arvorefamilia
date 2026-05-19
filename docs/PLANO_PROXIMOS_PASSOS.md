# Plano de próximos passos — Árvore Família

## Objetivo

Este documento define a ordem de trabalho até o lançamento do site, separando:

- validações obrigatórias;
- pendências funcionais;
- QA operacional;
- documentação mínima;
- fase final de responsividade tablet/mobile.

A responsividade deve ser tratada como **última fase antes do lançamento**, depois de estabilizar as funcionalidades principais.

---

## 1. Checklist técnico antes de qualquer frente

Executar no terminal:

```bash
git status
npm run build
git diff --check
```

Antes de qualquer alteração de banco:

```bash
supabase migration list
```

Regras:

- não rodar `supabase db push` se não houver migration da frente;
- não rodar `db push` sem revisar `migration list`;
- não usar `migration repair` sem confirmar que o schema remoto já reflete a migration;
- não misturar frentes diferentes no mesmo commit;
- não commitar dumps, secrets, tokens ou arquivos temporários;
- ao mexer em Edge Functions, validar deploy e secrets no Supabase Dashboard.

---

## 2. Estado atual das frentes

| Frente | Status | Próximo passo |
|---|---|---|
| 7.1 Notificações | Concluída tecnicamente | Resend/e-mail real, canal interno, usuário comum, rotina manual, Edge Function diária, `DAILY_NOTIFICATIONS_SECRET`, `pg_cron`, logs e deduplicação validados. Resta monitorar a primeira execução automática e limpar testes, se necessário. |
| 7.2 Astrologia/acontecimentos | Concluída no escopo atual | Apenas backlog editorial/privacidade avançada. |
| 7.3 Timeline | Implementada funcionalmente | Backlog futuro: edição manual, upload por evento, PDF, privacidade por evento. |
| 7.4 WhatsApp | Concluído no frontend | Backlog: privacidade forte em banco/API e log seguro opcional. |
| 7.5 Grau de parentesco | Consolidado funcionalmente | Backlog: integração na árvore/Visão Completa e limpeza de legado. |
| 7.6 Exportação área da árvore | Implementada tecnicamente | QA amplo em navegadores, zoom, árvores grandes e mobile/tablet. |
| 7.7 Legendas visuais | Concluída no escopo visual/frontend | QA manual aprovado; considerar apenas refinamentos durante 7.10. |
| 7.8 Favoritos | Primeira camada implementada | Expandir para arquivos, fórum, relacionamento e timeline. |
| 7.9 Página de favoritos | Primeira versão implementada | QA e expansão junto à 7.8. |
| 7.10 Responsividade | Pendente | Última fase pré-lançamento. |

---

## 3. Ordem recomendada até a responsividade

### Fase 1 — Alinhamento documental

Status desta fase:

- atualizar `GUIA_IMPLEMENTACOES.md`;
- atualizar `PLANO_PROXIMOS_PASSOS.md`;
- atualizar `GUIA_CORRECAO_ERROS.md`;
- remover contradições antigas;
- registrar que 7.8/7.9 já possuem primeira camada funcional;
- manter 7.10 como última fase pré-lançamento.

Validação:

```bash
git diff --check
git status
```

---

### Fase 2 — 7.7 Legendas visuais da árvore

Status:

- concluída no escopo visual/frontend;
- QA manual aprovado.

Implementado:

- `src/app/components/FamilyTree/TreeLegend.tsx`;
- integração em `src/app/components/FamilyTree/FamilyTree.tsx`;
- exclusão da legenda nas exportações em `src/app/components/FamilyTree/utils/treeExport.ts`;
- explicação de linhas pais-filhos, barramento vertical, linhas/anel conjugal, anel ativo, anel separado/divorciado, anel de viuvez, cores de pessoa/pet/falecido e diferenças entre Minha Árvore, Genealogia e Visão Completa.

Validação realizada:

- `npm run build`;
- `git diff --check`;
- `git status`;
- `supabase migration list`.

Observações:

- não houve migration;
- não houve alteração em Supabase;
- eventuais ajustes visuais finos devem entrar na fase 7.10 de responsividade.

---

### Fase 3 — Expandir favoritos 7.8/7.9

Base já implementada:

- `user_favorites`;
- RLS;
- `favoritesService.ts`;
- `FavoriteButton.tsx`;
- `/meus-favoritos`;
- favorito inicial no perfil de pessoa.

Próximo escopo recomendado:

1. arquivos históricos;
2. tópicos de fórum;
3. relacionamento/modal conjugal;
4. eventos pessoais/timeline.

Regras:

- usar `favoritesService.ts`;
- não voltar para `userEngagementService.ts` no novo fluxo;
- usar `entity_type` e `entity_id`;
- salvar `href` quando houver rota direta;
- sanitizar metadata;
- não salvar URL privada, base64, telefone, endereço, e-mail, token ou secret.

Validação:

```bash
npm run build
git diff --check
git status
```

---

### Fase 4 — QA operacional de notificações 7.1

Status:

- concluída tecnicamente.
- QA operacional manual concluído.
- Canal interno validado.
- Resend configurado.
- E-mail real validado em teste admin controlado.
- Usuário comum validado em `/notificacoes`.
- Hardening de ownership validado: marcar/remover notificação usa `id` e `user_id`.
- Rotina manual de aniversários/memórias validada.
- Deduplicação manual validada via `notification_occurrences`.
- `DAILY_NOTIFICATIONS_SECRET` configurado.
- `run-daily-notifications` deployada e validada.
- Chamada com secret validada com HTTP 200.
- Chamada sem secret validada com HTTP 401.
- `pg_cron` e `pg_net` habilitados.
- Job `run-daily-notifications-0800-brt` ativo com agenda `0 11 * * *`.
- Chamada manual via `net.http_post` validada com status 200.
- `notification_occurrences` conferida.
- `notification_dispatch_logs` conferido.
- Consulta de duplicidade por `occurrence_key` sem linhas retornadas.

Já concluído:

- acessar `/admin/notificacoes`;
- criar teste interno;
- confirmar notificação interna;
- configurar secrets reais do Resend;
- executar teste de e-mail para o próprio admin;
- confirmar recebimento real;
- confirmar log em `notification_dispatch_logs`;
- acessar `/notificacoes` como usuário comum;
- alterar preferências;
- marcar notificação como lida;
- marcar todas como lidas;
- remover notificação;
- confirmar bloqueio de `/admin/notificacoes` para usuário comum;
- executar rotina manual de aniversários/memórias;
- rodar a rotina duas vezes e confirmar deduplicação;
- configurar `DAILY_NOTIFICATIONS_SECRET`;
- fazer deploy de `run-daily-notifications`;
- testar `run-daily-notifications` manualmente com `x-daily-notifications-secret`;
- testar `run-daily-notifications` sem secret e confirmar retorno `401`;
- criar `pg_cron` no SQL Editor sem migration versionada;
- validar `net.http_post` com status 200;
- confirmar que não há `occurrence_key` duplicada.

Secrets esperados/configurados:

```txt
RESEND_API_KEY
NOTIFICATION_EMAIL_FROM
NOTIFICATION_EMAIL_REPLY_TO
SITE_URL
DAILY_NOTIFICATIONS_SECRET
```

Monitoramento pós-conclusão:

- confirmar a primeira execução automática do cron após 08:00 America/Sao_Paulo;
- verificar `net._http_response` depois da execução automática;
- verificar `notification_dispatch_logs` quando houver candidatos no dia;
- verificar `notification_occurrences` quando houver aniversários ou datas de memória;
- limpar notificações/logs de teste apenas se necessário;
- manter secrets fora do repositório;
- rotacionar `DAILY_NOTIFICATIONS_SECRET` se o valor for exposto fora de ambiente controlado.

Validação:

```bash
npm run build
git diff --check
git status
```

Observação:

- esta fase não exige `supabase db push`;
- push real, WhatsApp real e fila/retry avançado permanecem backlog.

---

### Fase 5 — QA amplo da exportação 7.6

Objetivo:

Validar PNG/PDF/impressão da área visível da árvore.

Testes mínimos:

- Chrome desktop;
- Safari desktop;
- zoom 80%, 100%, 125%;
- árvore pequena;
- árvore grande;
- Genealogia;
- Visão Completa;
- Minha Árvore;
- seleção pequena;
- seleção grande;
- cancelar com `Esc`;
- exportar PNG;
- exportar PDF;
- imprimir;
- imagem externa sem CORS;
- tablet/mobile em modo básico.

Critérios:

- pan/zoom não ficam bloqueados;
- overlay fecha após exportar;
- controles/minimap/menu não aparecem na exportação;
- erro é amigável;
- nenhuma alteração de banco é feita.

---

### Fase 6 — Documentação mínima pré-responsividade

Criar ou revisar, se houver janela:

1. `docs/MATRIZ_PERMISSOES.md`;
2. `docs/TESTES_MANUAIS_1405.md` ou checklist equivalente atualizado;
3. `docs/ARQUIVOS_HISTORICOS.md`, se a frente de arquivos continuar gerando dúvidas operacionais.

Não bloquear lançamento por documentações opcionais se o QA funcional estiver aprovado.

---

### Fase 7 — Responsividade tablet/mobile — última fase antes do lançamento

Objetivo:

Ajustar layout e usabilidade em tablet e mobile após estabilizar funcionalidades.

Larguras obrigatórias:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Ordem de trabalho:

1. base global;
2. árvore e ReactFlow;
3. perfil da pessoa;
4. área do usuário;
5. fórum/favoritos/notificações;
6. admin;
7. QA final de lançamento.

Detalhamento:

#### 7.1 Base global

- header;
- menus;
- containers;
- grids;
- botões;
- tipografia;
- cards;
- modais;
- tabelas;
- overflow horizontal.

#### 7.2 Árvore

Rotas/componentes:

- Home;
- Minha Árvore;
- Genealogia;
- Visão Completa;
- `FamilyTree`;
- controles ReactFlow;
- legenda 7.7;
- exportação 7.6.

Validar:

- pan/zoom touch;
- botões acessíveis;
- modais na tela pequena;
- menu de pessoa;
- conectores visíveis;
- busca/filtros;
- exportação sem quebrar.

#### 7.3 Perfil

Validar:

- `PersonProfile`;
- `PersonDataView`;
- `RelationshipFinder`;
- `PersonTimeline`;
- `PersonEventsList`;
- `ArquivosHistoricos`;
- `FavoriteButton`;
- discussões relacionadas.

#### 7.4 Área do usuário

Validar:

- `MeusDados`;
- `MeusVinculos`;
- `Notificacoes`;
- `MeusFavoritos`;
- fórum;
- primeiro acesso/vinculação.

#### 7.5 Admin

Validar:

- Dashboard;
- Pessoas;
- Formulário de pessoa;
- Relacionamentos;
- Solicitações;
- Atividades;
- Integridade;
- Notificações.

Critérios finais:

- sem overflow horizontal indevido;
- botões não ficam fora da tela;
- modais roláveis em tela pequena;
- tabelas com scroll controlado;
- árvore utilizável em touch;
- formulários longos usáveis;
- ações destrutivas continuam protegidas;
- `npm run build` passa;
- `git diff --check` passa.

---

## 4. QA funcional principal

### 4.1 Login e permissões

- [ ] Login admin.
- [ ] Login usuário comum.
- [ ] Header mostra admin apenas para admin.
- [ ] Usuário comum não acessa rotas admin.
- [ ] Admin acessa todas as rotas administrativas.

### 4.2 Pessoas e formulários

- [ ] Criar pessoa.
- [ ] Editar pessoa.
- [ ] Preservar rascunho.
- [ ] Salvar pessoa falecida.
- [ ] Salvar local no exterior.
- [ ] Salvar redes sociais.
- [ ] Salvar eventos pessoais.
- [ ] Salvar arquivos históricos.
- [ ] Preview/download não limpa formulário.

### 4.3 Relacionamentos e árvore

- [ ] Minha Árvore carrega.
- [ ] Genealogia carrega.
- [ ] Visão Completa carrega.
- [ ] Conectores não ficam diagonais indevidamente.
- [ ] Anel abre modal.
- [ ] Usuário comum não altera relação real.
- [ ] Solicitação de vínculo é registrada.
- [ ] Admin aprova/rejeita corretamente.

### 4.4 Arquivos históricos

- [ ] Arquivo de pessoa salva com `pessoa_id`.
- [ ] Arquivo de relacionamento salva com `relacionamento_id` e `pessoa_id` nulo.
- [ ] Storage é usado para novos arquivos.
- [ ] Base64 legado continua visualizável.
- [ ] Preview de imagem funciona.
- [ ] Preview de PDF funciona.
- [ ] Download explícito funciona.

### 4.5 Notificações

- [x] `/notificacoes` funciona.
- [x] `/admin/notificacoes` funciona.
- [x] Preferências persistem.
- [x] Marcar/remover notificação respeita `user_id`.
- [x] Gatilhos principais geram notificações internas.
- [x] Deduplicação manual funciona.
- [x] E-mail real testado de forma controlada.
- [x] `DAILY_NOTIFICATIONS_SECRET` configurado.
- [x] Edge Function diária testada com secret.
- [x] Edge Function diária testada sem secret com retorno `401`.
- [x] Cron seguro ativado e confirmado.
- [x] `net.http_post` validado com status `200`.
- [x] Logs e occurrences conferidos.
- [x] Consulta de duplicidade sem linhas retornadas.
- [ ] Primeira execução automática do cron conferida após 08:00 America/Sao_Paulo.
- [ ] Limpeza de dados de teste feita ou conscientemente adiada.

### 4.6 Insights 7.2

- [ ] Perfil lê insights existentes.
- [ ] Perfil sem insight não gera IA automaticamente.
- [ ] Admin gera/regenera explicitamente.
- [ ] Usuário comum não vê ações admin.
- [ ] Logs não contêm dados sensíveis.

### 4.7 Favoritos

- [ ] Favoritar pessoa.
- [ ] Remover favorito.
- [ ] `/meus-favoritos` lista favoritos.
- [ ] Busca e filtros funcionam.
- [ ] Persistência após reload.
- [ ] Isolamento por usuário.
- [ ] Metadata sem dados sensíveis.

---

## 5. Pendências técnicas e operacionais

### Técnicas

- [ ] Verificar uploads órfãos no Storage.
- [ ] Criar controle para evitar uploads órfãos, se necessário.
- [ ] Rodar dry-run de Storage/base64 em ambiente protegido.
- [ ] Refinar `/admin/integridade` com filtros por severidade.
- [ ] Remover ruído técnico `lado` dos `changed_fields`.
- [ ] Revisar scripts SQL legados de fórum/Google Calendar.
- [ ] Atualizar `MIGRATION-GUIDE.md` com fluxo de `migration list`, `db push`, dump e `repair`.

### Operacionais

- [x] Configurar Resend.
- [x] Validar e-mail real.
- [x] Configurar segredo da rotina diária.
- [x] Ativar cron com segurança.
- [ ] Limpar notificações/logs de teste após validação.

### Produto/backlog

- [ ] Exportação da árvore completa.
- [ ] Upload por evento pessoal.
- [ ] Privacidade por evento pessoal.
- [ ] PDF de timeline/eventos.
- [ ] Integração de parentesco diretamente na árvore.
- [ ] Privacidade forte para telefone/WhatsApp em banco/API.
- [ ] Push real.
- [ ] WhatsApp real por provider.
- [ ] Fila/retry avançado de notificações.

---

## 6. Bugs e prioridades

### P0 — bloqueador

- build quebrado;
- login quebrado;
- usuário comum acessa admin;
- usuário comum altera dado restrito;
- perda/corrupção de dados;
- secrets no frontend;
- envio real em massa não controlado.

### P1 — alto

- árvore principal não carrega;
- formulário principal não salva;
- solicitações de vínculo não registram;
- admin não aprova/rejeita;
- upload falha;
- notificações duplicam;
- RLS bloqueia fluxo principal ou libera escrita indevida.

### P2 — médio

- problema visual relevante;
- preview/download falha em um formato;
- filtro/busca inconsistente;
- logs incompletos;
- mensagem confusa.

### P3 — baixo

- copy;
- espaçamento;
- refinamento visual;
- documentação complementar.

---

## 7. Comandos de validação final antes de lançamento

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Se houver migration nova e aprovada:

```bash
supabase db push
```

Se houver Edge Function alterada:

```bash
supabase functions deploy send-notification-email
supabase functions deploy run-daily-notifications
```

Nunca commitar secrets.
