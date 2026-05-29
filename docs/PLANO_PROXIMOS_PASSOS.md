# Plano de prÃ³ximos passos â€” Ãrvore FamÃ­lia

> Ãšltima revisÃ£o: 2026-05-29
> Local canÃ´nico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento define **o que falta fazer atÃ© o lanÃ§amento** e organiza o backlog pÃ³s-MVP do projeto **Ãrvore FamÃ­lia**.

Ele responde Ã  pergunta: **â€œo que ainda precisa ser feito, validado ou deixado explicitamente para depois?â€**

Este arquivo nÃ£o deve repetir em detalhe:

- o inventÃ¡rio do que jÃ¡ foi implementado;
- troubleshooting por sintoma;
- documentaÃ§Ã£o tÃ©cnica completa de rotas, migrations, UX ou componentes.

Use tambÃ©m:

- `docs/GUIA_IMPLEMENTACOES.md`: o que jÃ¡ foi implementado e comportamento consolidado.
- `docs/GUIA_CORRECAO_ERROS.md`: investigaÃ§Ã£o e correÃ§Ã£o por sintoma.
- `docs/GUIA_UX_LAYOUT.md`: decisÃµes de UX e layout.
- `docs/GUIA_COMPONENTES.md`: componentes e cuidados de implementaÃ§Ã£o.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: banco, migrations e operaÃ§Ã£o Supabase.
- `docs/funcionalidades/*.md`: documentaÃ§Ã£o especÃ­fica por funcionalidade.

---

## 1. SituaÃ§Ã£o atual do MVP

As frentes funcionais principais do MVP estÃ£o implementadas e testadas manualmente no escopo atual.

| Frente | Status MVP | DecisÃ£o |
|---|---|---|
| 7.1 NotificaÃ§Ãµes | ConcluÃ­da tecnicamente | `/notificacoes` e `/ajustar-notificacoes` separados; cron automÃ¡tico depende de configuraÃ§Ã£o segura externa. |
| 7.2 Astrologia/acontecimentos | ConcluÃ­da no escopo atual | Cards vazios ocultos no perfil pÃºblico; evoluÃ§Ãµes ficam pÃ³s-MVP. |
| 7.3 Timeline | Implementada funcionalmente | EdiÃ§Ã£o, upload por evento, privacidade por evento e PDF ficam pÃ³s-MVP. |
| 7.4 WhatsApp | ConcluÃ­do no frontend | Privacidade forte/API/log seguro ficam pÃ³s-MVP. |
| 7.5 Grau de parentesco | Consolidado funcionalmente | IntegraÃ§Ã£o direta na Ã¡rvore/Genealogia/VisÃ£o Completa fica pÃ³s-MVP. |
| 7.6 ExportaÃ§Ã£o de Ã¡rea da Ã¡rvore | ConcluÃ­da no escopo atual | Ãrvore completa e escala automÃ¡tica ficam pÃ³s-MVP. |
| 7.7 Legendas visuais | ConcluÃ­da | Painel lateral simplificado e funcional; manter monitoramento visual. |
| 7.8 Favoritos | Primeira camada aprovada | ExpansÃ£o para outras entidades fica pÃ³s-MVP. |
| 7.9 PÃ¡gina de favoritos | Primeira versÃ£o aprovada | Refinamentos ficam pÃ³s-MVP. |
| 7.10 Responsividade mobile/tablet | ConcluÃ­da | QA final tÃ©cnico e visual aprovado em 2026-05-19. |
| Headers e margens internas | ConcluÃ­dos | Header compartilhado nas pÃ¡ginas internas e Home pÃ³s-login preservada com header prÃ³prio. |
| Viewport da Ã¡rvore | Ajustado | Minha Ãrvore, Genealogia e VisÃ£o Completa tÃªm regras finais de escala/tÃ­tulo consolidadas. |
| Rotas das views da Ã¡rvore | ConcluÃ­das | `/minha-arvore`, `/genealogia` e `/visao-completa` usam shell Home protegido por `TreeAccessRoute`; `/` redireciona para `/minha-arvore` preservando query string. |
| RefatoraÃ§Ã£o incremental da Home | Em andamento seguro | Componentes visuais foram extraÃ­dos; `Home.tsx` segue como orquestradora. |
| Minha Ãrvore e arquivos histÃ³ricos | Atualizados | Categoria histÃ³rica, preview pÃ³s-upload, botÃ£o **AÃ§Ãµes** e casamento salvo pelo botÃ£o geral consolidados. |
| VÃ­nculo admin usuÃ¡rio-pessoa | Corrigido e validado | RPC corrigida, migration aplicada e migrations local/remoto alinhadas no histÃ³rico recente. |
| Autocomplete de endereÃ§o | ConcluÃ­do no frontend | Admin e dados do usuÃ¡rio usam Google Places com fallback para input normal. |
| CalendÃ¡rio familiar | Ajustes residuais concluÃ­dos | Categorias na sidebar, filtros clicÃ¡veis, pluralizaÃ§Ã£o e â€œFaz X anosâ€. |

---

## 2. Escopo congelado do MVP

O MVP deve ser fechado com:

- Ã¡rvore familiar funcional;
- perfis de pessoa;
- administraÃ§Ã£o de pessoas e relacionamentos;
- solicitaÃ§Ãµes de vÃ­nculos;
- arquivos histÃ³ricos;
- fÃ³rum bÃ¡sico;
- notificaÃ§Ãµes internas/e-mail;
- timeline bÃ¡sica;
- insights persistidos;
- botÃ£o WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- pÃ¡gina `/meus-favoritos`;
- exportaÃ§Ã£o de Ã¡rea visÃ­vel da Ã¡rvore;
- legenda visual da Ã¡rvore;
- categoria histÃ³rica em arquivos histÃ³ricos;
- `/minha-arvore` com dados conjugais salvos pelo botÃ£o geral;
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- headers internos padronizados;
- responsividade mobile/tablet;
- QA final de lanÃ§amento.

NÃ£o incluir antes do lanÃ§amento:

- expansÃ£o de favoritos para novas entidades;
- push real;
- WhatsApp real por provider;
- fila/retry avanÃ§ado;
- exportaÃ§Ã£o da Ã¡rvore completa;
- upload por evento;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinÃ¢mica;
- versÃ£o administrativa/configurÃ¡vel da legenda.

---

## 3. Checklist tÃ©cnico antes de qualquer etapa final

Executar antes de qualquer alteraÃ§Ã£o de fechamento, documentaÃ§Ã£o ou hotfix:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Regras:

- nÃ£o iniciar ajustes amplos com build quebrado;
- nÃ£o rodar `supabase db push` se nÃ£o houver migration nova aprovada;
- nÃ£o criar migration para ajuste puramente visual;
- nÃ£o commitar secrets, dumps, tokens, backups ou arquivos temporÃ¡rios;
- nÃ£o misturar pÃ³s-MVP com correÃ§Ãµes de lanÃ§amento;
- nÃ£o expandir escopo funcional sem registrar neste plano;
- nÃ£o commitar arquivos `.bak`, backups temporÃ¡rios ou dumps;
- nÃ£o deixar `test-results/`, `dist/` ou relatÃ³rios temporÃ¡rios entrarem no commit.

---

## 4. Responsividade mobile/tablet

Status em 2026-05-19: concluÃ­da e validada para o MVP.

Objetivo:

- ajustar layout e usabilidade em tablet e mobile;
- preservar todos os fluxos jÃ¡ aprovados em QA manual;
- corrigir apenas problemas de layout/usabilidade;
- nÃ£o adicionar novas funcionalidades.

Larguras obrigatÃ³rias:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Blocos executados:

- base global;
- Ã¡rvore e ReactFlow;
- perfil da pessoa;
- Ã¡rea do usuÃ¡rio;
- fÃ³rum/favoritos/notificaÃ§Ãµes;
- admin;
- QA final de lanÃ§amento.

---

## 5. Ajustes visuais recentes concluÃ­dos

Esta seÃ§Ã£o registra apenas itens concluÃ­dos que ajudam a orientar QA final. Detalhes de UX devem ficar em `docs/GUIA_UX_LAYOUT.md`.

### 5.1 Header e margens

ConcluÃ­do:

- criaÃ§Ã£o de `MemberPageHeader`;
- padronizaÃ§Ã£o do header das pÃ¡ginas internas;
- padronizaÃ§Ã£o de margens laterais com `PAGE_CONTAINER_CLASS`;
- preservaÃ§Ã£o do header prÃ³prio da Home pÃ³s-login.

Arquivos relacionados:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/Home.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

### 5.2 Painel lateral da Ã¡rvore

ConcluÃ­do:

- botÃ£o Ãºnico de expandir/recolher painel;
- botÃ£o fica dentro ou junto ao painel conforme largura;
- remoÃ§Ã£o de duplicidade com botÃ£o dentro da Ã¡rea ReactFlow;
- toggle principal do painel usa **Filtros** e **Legendas**;
- **InformaÃ§Ãµes** fica fora da toggle, acionada por **AÃ§Ãµes**.

Arquivos relacionados:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
```

### 5.3 Viewport das views da Ã¡rvore

ConcluÃ­do:

- **Minha Ãrvore** usa bounds de cards reais para evitar zoom minÃºsculo;
- **Genealogia** e **VisÃ£o Completa** usam zoom por largura, sem reduzir pela altura total;
- tÃ­tulo/subtÃ­tulo interno foi removido dos layouts;
- overlay fixo Ãºnico foi mantido em `FamilyTree.tsx`;
- bounds de viewport e pan foram separados;
- usuÃ¡rio pode arrastar/deslizar verticalmente em Genealogia/VisÃ£o Completa quando houver muitos cards.

Arquivos relacionados:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Commits de referÃªncia:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

### 5.4 Legenda no painel lateral

ConcluÃ­do:

- remoÃ§Ã£o do subtÃ­tulo do painel;
- remoÃ§Ã£o da seÃ§Ã£o â€œVisualizaÃ§Ã£o atualâ€;
- remoÃ§Ã£o do card azul da view atual;
- remoÃ§Ã£o dos subtÃ­tulos internos dos cards;
- renomeaÃ§Ã£o de â€œAtivaâ€ para â€œEm relacionamentoâ€;
- remoÃ§Ã£o da seÃ§Ã£o â€œViewsâ€ no final;
- legenda passou a controlar filtros/camadas visuais quando callbacks sÃ£o fornecidos;
- camadas opcionais incluem destaque de pais/filhos e destaque de irmÃ£os.

Arquivo relacionado:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

### 5.5 Arquivos histÃ³ricos e dados conjugais

ConcluÃ­do:

- Home usa botÃ£o **AÃ§Ãµes** com Ã­cone `Printer`;
- desktop pode exibir texto **AÃ§Ãµes** e mobile usa apenas Ã­cone;
- botÃ£o continua abrindo aÃ§Ã£o/painel de informaÃ§Ãµes;
- loading da Home Ã© **â€œBuscando pessoas e relacionamentosâ€¦â€**;
- `ArquivosHistoricos` mantÃ©m mensagem verde e miniatura/card PDF apÃ³s upload;
- input nativo, campos e botÃµes **Cancelar**/**Adicionar** ficam ocultos imediatamente apÃ³s upload;
- botÃ£o **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- arquivos histÃ³ricos tÃªm `HistoricalFileEventCategory` e `categoria_evento`;
- `/minha-arvore` removeu **Salvar casamento** individual;
- **Salvar meus dados** tambÃ©m processa `marriageForms`;
- cards de **Escopo da visualizaÃ§Ã£o** exibem avatar circular com foto ou iniciais;
- admin atualiza relacionamento conjugal principal e inverso, quando existir;
- usuÃ¡rio nÃ£o-admin cria solicitaÃ§Ã£o via `relationshipChangeRequestService`;
- local de casamento invÃ¡lido nÃ£o bloqueia dados pessoais, mas deixa casamento sem salvar e exibe aviso.

PrÃ©-requisito operacional:

- aplicar `20260522121000_add_historical_file_event_category.sql` antes de deploy que envie `categoria_evento` em `arquivos_historicos`.

### 5.6 Ajustes apÃ³s PDF

ConcluÃ­do:

- separaÃ§Ã£o de `/notificacoes` e `/ajustar-notificacoes`;
- ocultaÃ§Ã£o de cards vazios de insights no perfil pÃºblico;
- correÃ§Ã£o da listagem de usuÃ¡rios para vÃ­nculo admin;
- autocomplete de endereÃ§o no admin;
- ajustes residuais do calendÃ¡rio familiar.

ValidaÃ§Ã£o operacional registrada no histÃ³rico:

- `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` aplicada no ambiente Supabase remoto;
- `supabase migration list` confirmou local/remoto alinhados atÃ© `20260522173000`;
- validaÃ§Ã£o tÃ©cnica pÃ³s-migration passou com build, testes, e2e e `git diff --check`.

---

## 6. QA final de lanÃ§amento

Status: validaÃ§Ã£o tÃ©cnica final executada e aprovada no histÃ³rico recente. O QA visual amplo foi aprovado em 2026-05-19; a validaÃ§Ã£o tÃ©cnica pÃ³s-documentaÃ§Ã£o e pÃ³s-migration foi concluÃ­da em 2026-05-22.

### 6.1 ValidaÃ§Ã£o tÃ©cnica

Comandos:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

CritÃ©rios:

- build aprovado;
- testes unitÃ¡rios aprovados;
- e2e aprovado;
- `git diff --check` sem erros;
- `supabase migration list` sem divergÃªncia inesperada;
- nenhuma migration visual criada;
- nenhum secret versionado;
- worktree limpo ou apenas com alteraÃ§Ãµes intencionais.

### 6.2 QA visual obrigatÃ³rio

Testar em:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Checklist por largura:

- [x] 320px aprovado no QA anterior.
- [x] 375px aprovado no QA anterior.
- [x] 390px aprovado no QA anterior.
- [x] 430px aprovado no QA anterior.
- [x] 768px aprovado no QA anterior.
- [x] desktop aprovado no QA anterior.

Roteiro visual mÃ­nimo para revalidaÃ§Ã£o antes de deploy:

```txt
/
/minha-arvore
/genealogia
/visao-completa
/meus-dados
/meus-vinculos
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum
/forum/novo
/calendario-familiar
/admin/dashboard
/admin/pessoas
/admin/pessoas/nova
/admin/relacionamentos
/admin/relacionamentos/novo
/admin/solicitacoes-vinculos
/admin/notificacoes
/admin/integridade
/admin/atividades
/admin/diagnostico
/admin/importacao
/admin/migrar-dados
```

Verificar:

- sem overflow horizontal global;
- painel lateral operÃ¡vel;
- legenda visÃ­vel e nÃ£o duplicada;
- zoom funcional;
- Ã¡rvore navegÃ¡vel em touch;
- modais cabem ou rolam;
- usuÃ¡rio comum nÃ£o vÃª aÃ§Ãµes admin.

### 6.3 QA funcional de regressÃ£o

Revalidar rapidamente antes do lanÃ§amento:

- login admin;
- login usuÃ¡rio comum;
- usuÃ¡rio comum nÃ£o acessa admin;
- admin acessa rotas administrativas;
- criar pessoa;
- editar pessoa;
- salvar pessoa falecida;
- salvar local no exterior;
- salvar redes sociais;
- salvar eventos pessoais;
- salvar arquivos histÃ³ricos;
- Minha Ãrvore;
- Genealogia;
- VisÃ£o Completa;
- anel conjugal;
- painel de Legendas;
- recolher/expandir painel lateral;
- solicitaÃ§Ã£o de vÃ­nculo;
- notificaÃ§Ãµes;
- favoritos;
- insights;
- timeline;
- exportaÃ§Ã£o PNG/PDF/impressÃ£o.

### 6.4 Checagem manual restante

Antes do deploy final, se ainda nÃ£o foi feita no ambiente final:

- abrir `/admin/pessoas/:id/editar` como admin;
- confirmar que o dropdown de usuÃ¡rios vinculÃ¡veis carrega;
- confirmar que usuÃ¡rios jÃ¡ vinculados nÃ£o aparecem;
- testar o botÃ£o **Recarregar**;
- confirmar que o erro de schema cache da RPC desapareceu;
- salvar um arquivo histÃ³rico com `categoria_evento`;
- confirmar que a migration `20260522121000_add_historical_file_event_category.sql` existe no remoto.

---

## 7. Encerramento do MVP

Depois da validaÃ§Ã£o final:

1. confirmar que os itens pÃ³s-MVP continuam fora do lanÃ§amento;
2. fazer checagem manual do card de vÃ­nculos no admin, se ainda nÃ£o feita no ambiente final;
3. confirmar migrations no remoto;
4. confirmar que nÃ£o hÃ¡ arquivos temporÃ¡rios versionados;
5. criar tag ou release, se o fluxo do projeto usar versionamento;
6. preparar deploy.

Comandos sugeridos:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Pendente atÃ© fechamento:

- checagem manual do card de vÃ­nculos em `/admin/pessoas/:id/editar`, se ainda nÃ£o feita no ambiente final;
- checagem de `categoria_evento` em ambiente final;
- deploy.

---

## 8. CritÃ©rios de bloqueio para lanÃ§amento

Bloqueiam lanÃ§amento:

- build quebrado;
- testes essenciais quebrados;
- login quebrado;
- usuÃ¡rio comum acessa admin;
- usuÃ¡rio comum altera dado restrito;
- perda/corrupÃ§Ã£o de dados;
- secret no frontend ou no repositÃ³rio;
- Ã¡rvore principal nÃ£o carrega;
- formulÃ¡rio principal nÃ£o salva;
- upload falha em fluxo essencial;
- notificaÃ§Ãµes duplicam de forma massiva;
- RLS libera escrita indevida;
- responsividade impede uso em mobile;
- Genealogia/VisÃ£o Completa exibem tÃ­tulo duplicado;
- painel lateral impede uso da Ã¡rvore;
- viewport inicial torna a Ã¡rvore inutilizÃ¡vel;
- migration obrigatÃ³ria ausente em ambiente final.

NÃ£o bloqueiam lanÃ§amento, se documentados:

- refinamentos visuais pequenos;
- expansÃ£o de favoritos;
- Ã¡rvore completa em PDF;
- push real;
- WhatsApp real;
- timeline avanÃ§ada;
- IA consultiva;
- filtros avanÃ§ados do admin integridade;
- limpeza auditada de legado/base64;
- revisÃ£o de scripts legados.

---

# PÃ³s-MVP

## PÃ³s-MVP imediato

| Frente | ImplementaÃ§Ã£o |
|---|---|
| Favoritos expandidos | Arquivos histÃ³ricos, fÃ³rum, relacionamentos, eventos pessoais/timeline. |
| WhatsApp avanÃ§ado | Privacidade forte em banco/API e log seguro de clique. |
| NotificaÃ§Ãµes avanÃ§adas | Push real, WhatsApp real, fila/retry avanÃ§ado. |
| Timeline avanÃ§ada | EdiÃ§Ã£o manual, upload por evento, privacidade por evento, PDF. |
| ExportaÃ§Ã£o avanÃ§ada | Exportar Ã¡rvore completa, nÃ£o sÃ³ viewport visÃ­vel. |
| Parentesco avanÃ§ado | IntegraÃ§Ã£o direta na Ã¡rvore, Genealogia e VisÃ£o Completa. |
| Insights avanÃ§ados | Backlog editorial, privacidade refinada e novos tipos de conteÃºdo. |

---

## PÃ³s-MVP tÃ©cnico

| Frente | ImplementaÃ§Ã£o |
|---|---|
| Rotas das views da Ã¡rvore | Avaliar rota pai/layout compartilhado para `/minha-arvore`, `/genealogia` e `/visao-completa`, caso seja confirmado remount da Home ao trocar view. |
| NavegaÃ§Ã£o interna | Revisar navegaÃ§Ãµes internas que ainda apontam para `/` e decidir se devem ir direto para `/minha-arvore`. |
| RefatoraÃ§Ã£o da Home | Continuar extraÃ§Ã£o incremental apenas em blocos seguros; `Home.tsx` ainda concentra orquestraÃ§Ã£o, efeitos, estado e handlers principais. |
| Dialog de Curiosidades/IA | Revisar acoplamento de `HomeCuriositiesDialog.tsx` e avaliar extraÃ§Ã£o adicional de subpainÃ©is/hooks sem alterar contratos de IA, conexÃ£o ou privacidade. |
| PÃ¡gina MinhaArvore | Refatorar progressivamente `src/app/pages/MinhaArvore.tsx`, que concentra formulÃ¡rio grande, dados pessoais, casamento, avatar/crop e arquivos. |
| MeusDados | Reaproveitar componentes compartilhados de pessoa em `MeusDados.tsx`, respeitando avatar/crop, Places e fluxo de primeiro acesso. |
| MeusVinculos | Definir e implementar persistÃªncia real da remoÃ§Ã£o de vÃ­nculo em Supabase quando a revisÃ£o de relacionamentos for definitiva. |
| AdminPessoaForm | Dividir formulÃ¡rio admin em blocos menores e revisar hooks/efeitos. |
| AdminDiagnostico | Trocar `Array<any>` por tipos explÃ­citos para resultados de diagnÃ³stico. |
| FamilyTree | Manter refatoraÃ§Ãµes conservadoras; arquivo Ã© crÃ­tico para viewport, exportaÃ§Ã£o, seleÃ§Ã£o de Ã¡rea e ReactFlow. |
| Links e AppLink | Revisar link 404 em `routes.tsx` que usa `<a href="/">`; trocar por navegaÃ§Ã£o client-side em momento seguro. |
| Storage | Verificar e prevenir uploads Ã³rfÃ£os. |
| Base legada | Dry-run de Storage/base64 e possÃ­vel limpeza auditada. |
| Admin Integridade | Filtros por severidade, paginaÃ§Ã£o e aÃ§Ãµes assistidas futuras. |
| Migrations | Preencher `docs/operacao/MIGRATIONS_SUPABASE.md`. |
| Legado SQL | Revisar scripts antigos de fÃ³rum/Google Calendar. |
| Logs | Remover ruÃ­dos tÃ©cnicos como `lado` dos `changed_fields`, se confirmado como ruÃ­do. |
| Viewport Ã¡rvore | Avaliar melhorias finas para Ã¡rvores muito grandes apÃ³s uso real. |
| Legenda | Avaliar versÃ£o administrativa/configurÃ¡vel pÃ³s-MVP, se necessÃ¡rio. |
| DocumentaÃ§Ã£o | Preencher `docs/arquitetura/ROTAS_E_GUARDS.md` e `docs/funcionalidades/EXPORTACAO_ARVORE.md`. |

### Varredura tÃ©cnica de 2026-05-26

Pontos identificados em pÃ¡ginas e componentes principais:

- `Home.tsx` ainda tem aproximadamente 1.800 linhas mesmo apÃ³s extraÃ§Ã£o de componentes visuais, filtros, curiosidades, IA e conexÃ£o; manter novas extraÃ§Ãµes em etapas pequenas e testÃ¡veis.
- `MinhaArvore.tsx` tem aproximadamente 2.300 linhas e continua sendo o maior candidato a decomposiÃ§Ã£o pÃ³s-MVP.
- `AdminPessoaForm.tsx` e `FamilyTree.tsx` tÃªm mais de 1.400 linhas cada; ambos sÃ£o crÃ­ticos e devem ser refatorados apenas com validaÃ§Ã£o tÃ©cnica e, no caso da Ã¡rvore, validaÃ§Ã£o visual.
- `HomeCuriositiesDialog.tsx` ficou funcional, mas ainda Ã© ponto de acoplamento mÃ©dio por reunir abas, estados e painÃ©is de IA/conexÃ£o recebidos por props.
- Existem usos legÃ­timos de `window.location` para origem, search params, path atual ou parsing de URL; nÃ£o tratar como bug automaticamente, mas revisar quando tocar nesses fluxos.
- Existem usos de `setTimeout` para foco, debounce, impressÃ£o e UX de carregamento; manter como pontos de atenÃ§Ã£o em refatoraÃ§Ãµes, garantindo cleanup quando aplicÃ¡vel.
- NÃ£o foram encontrados backups `.bak-views-normalization` rastreados apÃ³s a limpeza.

---

## PÃ³s-MVP produto

| MÃ³dulo | ImplementaÃ§Ãµes |
|---|---|
| CalendÃ¡rio familiar | Google Agenda, ICS, lembretes mais completos. |
| FÃ³rum | QA ampliado, moderaÃ§Ã£o, expansÃ£o de recursos. |
| Acervo | Ãlbuns, documentos, arquivos por evento, galeria familiar. |
| FamÃ­lia expandida | Linha do tempo da famÃ­lia, mapa familiar, visualizaÃ§Ãµes por ramo. |
| IA | Curiosidades, estatÃ­sticas, IA consultiva e conteÃºdos narrativos. |
| ColaboraÃ§Ã£o | SugestÃµes moderadas por familiares. |
| ComparaÃ§Ãµes | Comparador de perfis e caminhos familiares. |
| Home dinÃ¢mica | AniversÃ¡rios, memÃ³rias do dia, novidades e destaques. |

---

## 9. ManutenÃ§Ã£o documental

Para evitar repetiÃ§Ã£o:

- este plano deve manter apenas pendÃªncias, critÃ©rios e backlog;
- histÃ³rico detalhado de QA antigo deve ir para `docs/historico/`;
- decisÃµes de UX devem ir para `docs/GUIA_UX_LAYOUT.md`;
- estado implementado deve ir para `docs/GUIA_IMPLEMENTACOES.md`;
- troubleshooting deve ir para `docs/GUIA_CORRECAO_ERROS.md`;
- migrations devem ir para `docs/operacao/MIGRATIONS_SUPABASE.md`;
- rotas/guards devem ir para `docs/arquitetura/ROTAS_E_GUARDS.md`;
- exportaÃ§Ã£o da Ã¡rvore deve ir para `docs/funcionalidades/EXPORTACAO_ARVORE.md`.
