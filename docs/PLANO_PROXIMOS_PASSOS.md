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
| 7.7 Legendas visuais | Concluída | Ajustes finos podem entrar na responsividade. |
| 7.8 Favoritos | Primeira camada aprovada | Expansão para outras entidades fica pós-MVP. |
| 7.9 Página de favoritos | Primeira versão aprovada | Refinamentos ficam pós-MVP. |
| 7.10 Responsividade mobile/tablet | Concluída | Blocos 1 a 7 finalizados; QA final técnico e visual aprovado em 2026-05-19. |

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

## 3. Checklist técnico antes da etapa final

Executar antes de iniciar ou concluir a responsividade:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Regras:

- não iniciar ajustes amplos de responsividade com build quebrado;
- não rodar `supabase db push` se não houver migration nova aprovada;
- não criar migration para ajuste puramente visual;
- não commitar secrets, dumps, tokens ou arquivos temporários;
- não misturar pós-MVP com responsividade;
- não expandir escopo funcional durante 7.10.

---

## 4. Responsividade mobile/tablet

**Última etapa antes do lançamento.**

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

Ordem recomendada:

1. base global;
2. árvore e ReactFlow;
3. perfil da pessoa;
4. área do usuário;
5. fórum/favoritos/notificações;
6. admin;
7. QA final de lançamento.

Blocos executados:

- base global;
- árvore e ReactFlow;
- perfil da pessoa;
- área do usuário;
- fórum/favoritos/notificações;
- admin;
- QA final de lançamento.

---

## 5. Responsividade — bloco 1: base global

Arquivos prováveis:

```txt
src/app/pages/Home.tsx
src/app/components
src/app/components/ui
src/app/routes.tsx
src/index.css
src/app/index.css
```

Validar:

- header;
- menus;
- containers;
- grids;
- botões;
- tipografia;
- cards;
- modais;
- tabelas;
- estados vazios;
- loading states;
- mensagens de erro;
- overflow horizontal.

Critérios de aceite:

- não há scroll horizontal indevido;
- botões têm área de toque adequada;
- menus são acessíveis;
- cards quebram linha corretamente;
- textos longos não estouram layout;
- modais têm rolagem interna quando necessário;
- tabelas usam scroll controlado;
- ações destrutivas continuam protegidas.

Commit sugerido:

```bash
git add .
git commit -m "style: ajustar base responsiva global"
```

---

## 6. Responsividade — bloco 2: árvore e ReactFlow

Arquivos prováveis:

```txt
src/app/pages/Home.tsx
src/app/pages/MinhaArvore.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/modals
src/app/components/FamilyTree/layouts
```

Validar:

- Home;
- Minha Árvore;
- Genealogia;
- Visão Completa;
- ReactFlow;
- pan/zoom touch;
- controles de zoom;
- botão de legenda;
- painel da legenda;
- menu de pessoa;
- anel de casamento;
- modal conjugal;
- busca/filtros;
- exportação de área;
- seleção por retângulo;
- cancelamento por `Esc`;
- overlay em tela pequena.

Critérios de aceite:

- árvore é utilizável em touch;
- controles não ficam sobrepostos de forma impeditiva;
- legenda não impede pan/zoom;
- modais cabem na tela ou rolam internamente;
- exportação não inclui controles/legenda/menu;
- pan/zoom são restaurados após seleção/exportação;
- não há scroll horizontal indevido na página.

Commit sugerido:

```bash
git add .
git commit -m "style: ajustar árvore para mobile e tablet"
```

---

## 7. Responsividade — bloco 3: perfil da pessoa

Arquivos prováveis:

```txt
src/app/pages/PersonProfile.tsx
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonRelationshipsView.tsx
src/app/components/person/RelationshipFinder.tsx
src/app/components/person/PersonEventsList.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/favorites/FavoriteButton.tsx
```

Validar:

- cabeçalho do perfil;
- foto/avatar;
- dados pessoais;
- status de falecimento;
- locais no exterior;
- redes sociais;
- botão WhatsApp;
- favoritos;
- relacionamentos;
- grau de parentesco;
- timeline;
- eventos pessoais;
- arquivos históricos;
- tópicos relacionados do fórum;
- estados vazios;
- permissões admin/usuário comum.

Critérios de aceite:

- dados principais são legíveis em 320px;
- cards empilham corretamente;
- timeline não estoura largura;
- arquivos históricos têm preview/download acessíveis;
- botão WhatsApp não revela número indevidamente;
- FavoriteButton é clicável;
- RelationshipFinder é usável;
- ações admin não aparecem para usuário comum.

Commit sugerido:

```bash
git add .
git commit -m "style: ajustar perfil de pessoa para mobile"
```

---

## 8. Responsividade — bloco 4: área do usuário

Arquivos prováveis:

```txt
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/VincularPerfil.tsx
```

Validar:

- Meus Dados;
- Meus Vínculos;
- Notificações;
- Meus Favoritos;
- Primeiro acesso/vinculação;
- formulários longos;
- listas;
- filtros;
- busca;
- botões de ação;
- mensagens de sucesso/erro.

Critérios de aceite:

- formulários são usáveis em mobile;
- listas não estouram horizontalmente;
- filtros e busca cabem em telas pequenas;
- notificações podem ser lidas, marcadas e removidas;
- favoritos podem ser listados, filtrados, abertos e removidos;
- solicitações de vínculo são compreensíveis.

Commit sugerido:

```bash
git add .
git commit -m "style: ajustar área do usuário para mobile"
```

---

## 9. Responsividade — bloco 5: fórum/favoritos/notificações

Arquivos prováveis:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
```

Validar:

- lista de tópicos;
- categorias;
- criação de tópico;
- edição de tópico;
- tela de tópico;
- respostas;
- comentários;
- reações/ações disponíveis;
- denúncia/solução, se visível;
- favoritos;
- notificações.

Critérios de aceite:

- cards/tópicos quebram linha corretamente;
- editores e textareas são usáveis;
- botões de ação não ficam fora da tela;
- filtros não geram overflow;
- notificações e favoritos preservam comportamento aprovado no QA manual.

Commit sugerido:

```bash
git add .
git commit -m "style: ajustar fórum favoritos e notificações para mobile"
```

---

## 10. Responsividade — bloco 6: admin

Arquivos prováveis:

```txt
src/app/pages/admin/AdminDashboard.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminRelacionamentoForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/admin/AdminAtividades.tsx
src/app/pages/admin/AdminIntegridade.tsx
src/app/pages/admin/AdminNotificacoes.tsx
```

Prioridade:

1. Admin Pessoas;
2. Admin Pessoa Form;
3. Admin Solicitações;
4. Admin Integridade;
5. Admin Notificações;
6. Admin Relacionamentos;
7. Admin Atividades;
8. Dashboard.

Validar:

- tabelas/listas;
- filtros;
- busca;
- botões de ação;
- formulários longos;
- modais;
- previews;
- áreas com scroll;
- ações destrutivas;
- permissões.

Critérios de aceite:

- admin não precisa ser perfeito no mobile;
- admin precisa ser operável;
- tabelas podem ter scroll horizontal controlado;
- formulário de pessoa deve ser utilizável;
- botões críticos não ficam fora da tela;
- modais têm altura máxima e scroll;
- ações destrutivas continuam protegidas.

Commit sugerido:

```bash
git add .
git commit -m "style: ajustar admin para mobile"
```

---

## 11. QA final de lançamento

Executar após concluir os blocos de responsividade.

Status em 2026-05-19: executado e aprovado.

### 11.1 Validação técnica

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

### 11.2 QA visual obrigatório

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

### 11.3 QA funcional de regressão

Revalidar rapidamente:

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
- solicitação de vínculo;
- notificações;
- favoritos;
- insights;
- timeline;
- exportação PNG/PDF/impressão.

---

## 12. Encerramento do MVP

Depois do QA final:

1. atualizar este documento, marcando 7.10 como concluída;
2. confirmar que os itens pós-MVP continuam fora do lançamento;
3. rodar validação técnica final;
4. fazer commit de documentação;
5. preparar merge para `main`;
6. criar tag ou release, se o fluxo do projeto usar versionamento;
7. preparar deploy.

Status em 2026-05-19: itens 1 a 4 concluídos nesta branch. O próximo passo é preparar o merge para `main`.

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
git add docs/PLANO_PROXIMOS_PASSOS.md
git commit -m "docs: registrar responsividade MVP aprovada"
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
- responsividade impede uso em mobile.

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
