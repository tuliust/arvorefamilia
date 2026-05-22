# Plano de próximos passos — Árvore Família

## Objetivo

Este documento define **o que falta fazer** até o lançamento do site e organiza o backlog pós-MVP.

Este arquivo não deve repetir o guia de implementações nem o guia de correção de erros. Para esses temas, use:

- `docs/GUIA_IMPLEMENTACOES.md`: o que já foi implementado e comportamento consolidado.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação e correção por sintoma.
- `docs/NOTIFICACOES.md`: detalhes técnicos de notificações.
- `docs/TIMELINE.md`: detalhes técnicos da timeline.

---

## 1. Situação atual do MVP

As frentes funcionais principais do MVP já foram implementadas e testadas manualmente.

| Frente | Status MVP | Decisão |
|---|---|---|
| 7.1 Notificações | Concluída tecnicamente | Monitorar execução automática do cron e limpar testes se necessário. |
| 7.2 Astrologia/acontecimentos | Concluída no escopo atual | Evoluções ficam pós-MVP. |
| 7.3 Timeline | Implementada funcionalmente | Edição, upload por evento, privacidade por evento e PDF ficam pós-MVP. |
| 7.4 WhatsApp | Concluído no frontend | Privacidade forte/API/log seguro ficam pós-MVP. |
| 7.5 Grau de parentesco | Consolidado funcionalmente | Integração direta na árvore/Genealogia/Visão Completa fica pós-MVP. |
| 7.6 Exportação de área da árvore | Concluída no escopo atual | Árvore completa e escala automática ficam pós-MVP. |
| 7.7 Legendas visuais | Concluída | Painel lateral simplificado; manter monitoramento visual. |
| 7.8 Favoritos | Primeira camada aprovada | Expansão para outras entidades fica pós-MVP. |
| 7.9 Página de favoritos | Primeira versão aprovada | Refinamentos ficam pós-MVP. |
| 7.10 Responsividade mobile/tablet | Concluída | Blocos 1 a 7 finalizados; QA final técnico e visual aprovado em 2026-05-19. |
| Headers e margens internas | Concluídos | Header compartilhado nas páginas internas e Home pós-login preservada com header próprio. |
| Viewport da árvore | Ajustado | Minha Árvore, Genealogia e Visão Completa têm regras finais de escala/título consolidadas. |
| Minha Árvore e arquivos históricos | Atualizados | `ce482a2` consolidou categoria histórica, preview pós-upload, botão **Ações** e casamento salvo pelo botão geral. |

---

## 2. Escopo congelado do MVP

O MVP deve ser fechado com:

- árvore familiar funcional;
- perfis de pessoa;
- administração de pessoas e relacionamentos;
- solicitações de vínculos;
- arquivos históricos;
- fórum básico;
- notificações internas/e-mail;
- timeline básica;
- insights persistidos;
- botão WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- página `/meus-favoritos`;
- exportação de área visível da árvore;
- legenda visual da árvore;
- categoria histórica em arquivos históricos;
- `/minha-arvore` com dados conjugais salvos pelo botão geral;
- headers internos padronizados;
- responsividade mobile/tablet;
- QA final de lançamento.

Não incluir antes do lançamento:

- expansão de favoritos para novas entidades;
- push real;
- WhatsApp real por provider;
- fila/retry avançado;
- exportação da árvore completa;
- upload por evento;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinâmica.

---

## 3. Checklist técnico antes de qualquer etapa final

Executar antes de qualquer alteração de fechamento, documentação ou hotfix:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Regras:

- não iniciar ajustes amplos com build quebrado;
- não rodar `supabase db push` se não houver migration nova aprovada;
- não criar migration para ajuste puramente visual;
- não commitar secrets, dumps, tokens, backups ou arquivos temporários;
- não misturar pós-MVP com correções de lançamento;
- não expandir escopo funcional sem registrar no plano.

---

## 4. Responsividade mobile/tablet

Status em 2026-05-19: concluída e validada para o MVP.

Objetivo:

- ajustar layout e usabilidade em tablet e mobile;
- preservar todos os fluxos já aprovados em QA manual;
- corrigir apenas problemas de layout/usabilidade;
- não adicionar novas funcionalidades.

Larguras obrigatórias:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Blocos executados:

- base global;
- árvore e ReactFlow;
- perfil da pessoa;
- área do usuário;
- fórum/favoritos/notificações;
- admin;
- QA final de lançamento.

---

## 5. Ajustes visuais recentes concluídos

### 5.1 Header e margens

Concluído:

- criação de `MemberPageHeader`;
- padronização do header das páginas internas;
- padronização de margens laterais com `PAGE_CONTAINER_CLASS`;
- preservação do header próprio da Home pós-login.

Arquivos relacionados:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/Home.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

### 5.2 Painel lateral da árvore

Concluído:

- botão único de expandir/recolher painel;
- botão fica dentro ou junto ao painel conforme largura;
- remoção de duplicidade com botão dentro da área ReactFlow.

Arquivos relacionados:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

### 5.3 Viewport das views da árvore

Concluído:

- **Minha Árvore** usa bounds de cards reais para evitar zoom minúsculo;
- **Genealogia** e **Visão Completa** usam zoom por largura, sem reduzir pela altura total;
- título/subtítulo interno foi removido dos layouts;
- overlay fixo único foi mantido em `FamilyTree.tsx`;
- bounds de viewport e pan foram separados;
- usuário pode arrastar/deslizar verticalmente em Genealogia/Visão Completa quando houver muitos cards.

Arquivos relacionados:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Commits de referência:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

### 5.4 Legenda no painel lateral

Concluído:

- remoção do subtítulo do painel;
- remoção da seção “Visualização atual”;
- remoção do card azul da view atual;
- remoção dos subtítulos internos dos cards;
- renomeação de “Ativa” para “Em relacionamento”;
- remoção da seção “Views” no final.

Arquivo relacionado:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

### 5.5 Ajustes de `ce482a2`

Concluído:

- Home usa botão **Ações** com ícone `Printer`;
- desktop pode exibir texto **Ações** e mobile usa apenas ícone;
- o botão continua abrindo `activeSidebarPanel = 'info'`;
- loading da Home é **“Buscando pessoas e relacionamentos…”**;
- `ArquivosHistoricos` mantém mensagem verde e miniatura/card PDF após upload;
- input nativo, campos e botões **Cancelar**/**Adicionar** ficam ocultos imediatamente após upload;
- botão **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- arquivos históricos têm `HistoricalFileEventCategory` e `categoria_evento`;
- `/minha-arvore` removeu **Salvar casamento** individual;
- **Salvar meus dados** também processa `marriageForms`;
- cards de **Escopo da visualização** exibem avatar circular com foto ou iniciais;
- admin atualiza relacionamento conjugal principal e inverso, quando existir;
- usuário não-admin cria solicitação via `relationshipChangeRequestService`;
- local de casamento inválido não bloqueia dados pessoais, mas deixa casamento sem salvar e exibe aviso.

Pré-requisito operacional:

- aplicar `20260522121000_add_historical_file_event_category.sql` antes de deploy com `ce482a2`, pois insert/update em `arquivos_historicos` envia `categoria_evento`.

---

## 6. QA final de lançamento

Status em 2026-05-19: executado e aprovado.

### 6.1 Validação técnica

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Critérios:

- build passou com `npm run build`;
- testes unitários passaram com `npm test` (`28` testes);
- e2e passou com `npm run test:e2e` (`5` testes);
- `git diff --check` passou sem erros;
- `supabase migration list` mostrou migrations locais/remotas alinhadas;
- nenhuma migration visual foi criada;
- nenhum secret foi versionado.

### 6.2 QA visual obrigatório

Testar em:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Checklist por largura:

- [x] 320px aprovado.
- [x] 375px aprovado.
- [x] 390px aprovado.
- [x] 430px aprovado.
- [x] 768px aprovado.
- [x] desktop aprovado.

Roteiro visual executado com sessão admin autenticada e verificação de overflow global:

- `/`;
- `/minha-arvore`;
- `/meus-dados`;
- `/meus-vinculos`;
- `/meus-favoritos`;
- `/notificacoes`;
- `/forum`;
- `/forum/novo`;
- `/admin/dashboard`;
- `/admin/pessoas`;
- `/admin/pessoas/nova`;
- `/admin/relacionamentos`;
- `/admin/relacionamentos/novo`;
- `/admin/solicitacoes-vinculos`;
- `/admin/notificacoes`;
- `/admin/integridade`;
- `/admin/atividades`;
- `/admin/diagnostico`;
- `/admin/importacao`;
- `/admin/migrar-dados`.

Resultado: `document.documentElement.scrollWidth > window.innerWidth` retornou `false` nas rotas acima em todas as larguras testadas.

### 6.3 QA funcional de regressão

Revalidar rapidamente antes do lançamento:

- login admin;
- login usuário comum;
- usuário comum não acessa admin;
- admin acessa rotas administrativas;
- criar pessoa;
- editar pessoa;
- salvar pessoa falecida;
- salvar local no exterior;
- salvar redes sociais;
- salvar eventos pessoais;
- salvar arquivos históricos;
- Minha Árvore;
- Genealogia;
- Visão Completa;
- anel conjugal;
- painel de Legendas;
- recolher/expandir painel lateral;
- solicitação de vínculo;
- notificações;
- favoritos;
- insights;
- timeline;
- exportação PNG/PDF/impressão.

---

## 7. Encerramento do MVP

Depois do QA final:

1. atualizar documentações;
2. confirmar que os itens pós-MVP continuam fora do lançamento;
3. rodar validação técnica final;
4. fazer commit de documentação;
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

Commit sugerido:

```bash
git add docs/GUIA_IMPLEMENTACOES.md docs/GUIA_CORRECAO_ERROS.md docs/PLANO_PROXIMOS_PASSOS.md
git commit -m "docs: atualizar documentacao do MVP"
git push origin main
```

---

# O que fica pós-MVP

## Pós-MVP imediato

| Frente | Implementação |
|---|---|
| Favoritos expandidos | Arquivos históricos, fórum, relacionamentos, eventos pessoais/timeline. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado. |
| Timeline avançada | Edição manual, upload por evento, privacidade por evento, PDF. |
| Exportação avançada | Exportar árvore completa, não só viewport visível. |
| Parentesco avançado | Integração direta na árvore, Genealogia e Visão Completa. |
| Insights avançados | Backlog editorial, privacidade refinada e novos tipos de conteúdo. |

---

## Pós-MVP técnico

| Frente | Implementação |
|---|---|
| Storage | Verificar e prevenir uploads órfãos. |
| Base legada | Dry-run de Storage/base64 e possível limpeza auditada. |
| Admin Integridade | Filtros por severidade, paginação e ações assistidas futuras. |
| Migrations | Atualizar `MIGRATION-GUIDE.md`. |
| Legado SQL | Revisar scripts antigos de fórum/Google Calendar. |
| Logs | Remover ruídos técnicos como `lado` dos `changed_fields`. |
| Viewport árvore | Avaliar melhorias finas para árvores muito grandes após uso real. |
| Legenda | Avaliar versão administrativa/configurável pós-MVP, se necessário. |

Essas pendências aparecem no plano como técnicas e operacionais e não devem bloquear o MVP se não houver P0/P1 aberto.

---

## Pós-MVP produto

| Módulo | Implementações |
|---|---|
| Calendário familiar | Google Agenda, ICS, lembretes mais completos. |
| Fórum | QA ampliado, moderação, expansão de recursos. |
| Acervo | Álbuns, documentos, arquivos por evento, galeria familiar. |
| Família expandida | Linha do tempo da família, mapa familiar, visualizações por ramo. |
| IA | Curiosidades, estatísticas, IA consultiva e conteúdos narrativos. |
| Colaboração | Sugestões moderadas por familiares. |
| Comparações | Comparador de perfis e caminhos familiares. |
| Home dinâmica | Aniversários, memórias do dia, novidades e destaques. |

---

## Critérios de bloqueio para lançamento

Bloqueiam lançamento:

- build quebrado;
- login quebrado;
- usuário comum acessa admin;
- usuário comum altera dado restrito;
- perda/corrupção de dados;
- secret no frontend ou no repositório;
- árvore principal não carrega;
- formulário principal não salva;
- upload falha em fluxo essencial;
- notificações duplicam de forma massiva;
- RLS libera escrita indevida;
- responsividade impede uso em mobile;
- Genealogia/Visão Completa exibem título duplicado;
- painel lateral impede uso da árvore;
- viewport inicial torna a árvore inutilizável.

Não bloqueiam lançamento, se documentados:

- refinamentos visuais pequenos;
- expansão de favoritos;
- árvore completa em PDF;
- push real;
- WhatsApp real;
- timeline avançada;
- IA consultiva;
- filtros avançados do admin integridade;
- limpeza auditada de legado/base64;
- revisão de scripts legados.

---

## 8. Atualização recente — ajustes visuais concluídos após 7.10

Concluído após os ajustes finais de responsividade:

- legenda visual transformada em filtros funcionais;
- preparação de camadas visuais opcionais;
- destaque opcional de pais/filhos;
- destaque opcional de irmãos;
- QA visual dos destaques;
- painel lateral com toggle apenas para Filtros/Legendas;
- botão externo **Ações** com `Printer`, texto no desktop e ícone apenas no mobile;
- botões de zoom reposicionados à direita.

Commits de referência:

```txt
779fee6 feat: tornar legenda visual em filtros da arvore
733eb65 feat: preparar camadas visuais opcionais da arvore
e41d9b1 feat: adicionar destaques visuais opcionais nas linhas da arvore
94b5408 style: ajustar painel lateral e controles da home
```

Esses ajustes não alteraram Supabase, migrations, autenticação, rotas ou `package.json`.

Pós-MVP permanece:

- versão administrativa/configurável da legenda, se necessária;
- exportação da árvore completa;
- melhorias finas para árvores muito grandes;
- integração mais profunda do grau de parentesco diretamente na árvore.
