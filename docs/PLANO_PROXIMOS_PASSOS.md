# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-07
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento define **o que falta fazer ate o lancamento** e organiza o backlog pos-MVP do projeto **Arvore Familia**.

Ele responde a pergunta: **o que ainda precisa ser feito, validado ou deixado explicitamente para depois**

Este arquivo nao deve repetir em detalhe:

- o inventario do que ja foi implementado;
- troubleshooting por sintoma;
- documentacao tecnica completa de rotas, migrations, UX ou componentes.

Use tambem:

- `docs/GUIA_IMPLEMENTACOES.md`: o que ja foi implementado e comportamento consolidado.
- `docs/GUIA_CORRECAO_ERROS.md`: investigacao e correcao por sintoma.
- `docs/GUIA_UX_LAYOUT.md`: decisoes de UX e layout.
- `docs/GUIA_COMPONENTES.md`: componentes e cuidados de implementacao.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: banco, migrations e operacao Supabase.
- `docs/funcionalidades/*.md`: documentacao especifica por funcionalidade.

---

## 1. Situação atual do MVP

As frentes funcionais principais do MVP estao implementadas e testadas manualmente no escopo atual.

| Frente | Status MVP | Decisao |
|---|---|---|
| 7.1 Notificacoes | Concluida tecnicamente | `/notificacoes` e `/ajustar-notificacoes` separados; cron automatico depende de configuracao segura externa. |
| 7.2 Astrologia/acontecimentos | Concluida no escopo atual | Cards vazios ocultos no perfil publico; evolucoes ficam pos-MVP. |
| 7.3 Timeline | Implementada funcionalmente | Edicao, upload por evento, privacidade por evento e PDF ficam pos-MVP. |
| 7.4 WhatsApp | Concluido no frontend | Privacidade forte/API/log seguro ficam pos-MVP. |
| 7.5 Grau de parentesco | Consolidado funcionalmente | Integracao direta na arvore/Genealogia/Visao Completa fica pos-MVP. |
| 7.6 Exportacao de area da arvore | Concluida no escopo atual | Arvore completa e escala automatica ficam pos-MVP. |
| 7.7 Legendas visuais | Concluida | Painel lateral simplificado e funcional; manter monitoramento visual. |
| 7.8 Favoritos | Primeira camada aprovada | Expansao para outras entidades fica pos-MVP. |
| 7.9 Pagina de favoritos | Primeira versao aprovada | Refinamentos ficam pos-MVP. |
| 7.10 Responsividade mobile/tablet | Concluida | QA final tecnico e visual aprovado em 2026-05-19. |
| Headers e margens internas | Concluidos | Header compartilhado nas paginas internas e Home pos-login preservada com header proprio. |
| Viewport da árvore | Em refinamento visual final | Minha Árvore, Genealogia e Visão Completa têm regras de escala e título em ajuste; Genealogia mobile inicia na primeira geração com cards reais, mas padding superior do título e espaço título-cards ainda exigem validação. |
| Genealogia mobile por geracoes | Concluida no escopo atual | `/genealogia` mobile usa chips horizontais e swipe por geracao; colunas vazias foram removidas; inferencia de geracoes ocorre em memoria pela pessoa central. |
| Rotas das views da arvore | Concluidas | `/minha-arvore`, `/genealogia` e `/visao-completa` usam shell Home protegido por `TreeAccessRoute`; `/` redireciona para `/minha-arvore` preservando query string. |
| Refatoracao incremental da Home | Em andamento seguro | Componentes visuais foram extraidos; `Home.tsx` segue como orquestradora. |
| Minha Arvore e arquivos historicos | Atualizados | Categoria historica, preview pos-upload, botao **Acoes** e casamento salvo pelo botao geral consolidados. |
| Vinculo admin usuario-pessoa | Corrigido e validado | RPC corrigida, migration aplicada e migrations local/remoto alinhadas no historico recente. |
| Autocomplete de endereco | Concluido no frontend | Admin e dados do usuario usam Google Places com fallback para input normal. |
| Calendario familiar | Ajustes residuais concluidos | Categorias na sidebar, filtros clicaveis, pluralizacao e Faz X anos. |
| Paletas visuais da arvore | Concluidas | Paletas `white`, `orange` e `brown` expostas no `HomeHeader`, aplicadas por CSS variables e persistidas em `localStorage`. |
| Menu compartilhado do usuário | Em diagnóstico visual final | A regra desejada é usar `UserProfileMenu` também no header da árvore, preservando botão compacto; prints recentes indicaram diferença entre o menu das views da árvore e o menu das páginas internas, exigindo comparação de código antes de declarar concluído. |
| Acoes de perfil e notificacoes | Concluidas no escopo atual | `/minha-arvore/editar` recebeu **Trocar Senha**; `/notificacoes` recebeu **Personalizar Notificacoes** para `/ajustar-notificacoes`; textos de preferencias/notificacoes foram corrigidos. |

---

## 2. Escopo congelado do MVP

O MVP deve ser fechado com:

- arvore familiar funcional;
- perfis de pessoa;
- administracao de pessoas e relacionamentos;
- solicitacoes de vinculos;
- arquivos historicos;
- forum basico;
- notificacoes internas/e-mail;
- timeline basica;
- insights persistidos;
- botao WhatsApp no frontend;
- grau de parentesco no escopo atual;
- favoritos de pessoa;
- pagina `/meus-favoritos`;
- exportacao de area visivel da arvore;
- legenda visual da arvore;
- categoria historica em arquivos historicos;
- `/minha-arvore` com dados conjugais salvos pelo botao geral;
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- Genealogia mobile navegavel por geracoes;
- Genealogia sem colunas vazias e com inferencia de geracoes em memoria;
- paletas visuais da arvore no header;
- headers internos padronizados;
- menu compartilhado do usuario com variante compacta no header da arvore;
- botao Trocar Senha na edicao do proprio perfil;
- atalho Personalizar Notificacoes na central de notificacoes;
- responsividade mobile/tablet;
- QA final de lancamento.

Nao incluir antes do lancamento:

- expansao de favoritos para novas entidades;
- push real;
- WhatsApp real por provider;
- fila/retry avancado;
- exportacao da arvore completa;
- upload por evento;
- privacidade por evento;
- PDF da timeline;
- IA consultiva;
- comparador de perfis;
- mapa familiar;
- home dinamica;
- versao administrativa/configuravel da legenda.

---

## 3. Checklist tecnico antes de qualquer etapa final

Executar antes de qualquer alteracao de fechamento, documentacao ou hotfix:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Regras:

- nao iniciar ajustes amplos com build quebrado;
- nao rodar `supabase db push` se nao houver migration nova aprovada;
- nao criar migration para ajuste puramente visual;
- nao commitar secrets, dumps, tokens, backups ou arquivos temporarios;
- nao misturar pos-MVP com correcoes de lancamento;
- nao expandir escopo funcional sem registrar neste plano;
- nao commitar arquivos `.bak`, backups temporarios ou dumps;
- nao deixar `test-results/`, `dist/` ou relatorios temporarios entrarem no commit.

---

## 4. Responsividade mobile/tablet

Status em 2026-05-19: concluida e validada para o MVP.

Objetivo:

- ajustar layout e usabilidade em tablet e mobile;
- preservar todos os fluxos ja aprovados em QA manual;
- corrigir apenas problemas de layout/usabilidade;
- nao adicionar novas funcionalidades.

Larguras obrigatorias:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

Blocos executados:

- base global;
- arvore e ReactFlow;
- perfil da pessoa;
- area do usuario;
- forum/favoritos/notificacoes;
- admin;
- QA final de lancamento.

---

## 5. Ajustes visuais recentes concluídos

Esta secao registra apenas itens concluidos que ajudam a orientar QA final. Detalhes de UX devem ficar em `docs/GUIA_UX_LAYOUT.md`.

### 5.1 Header e margens

Concluido:

- criacao de `MemberPageHeader`;
- padronizacao do header das paginas internas;
- padronizacao de margens laterais com `PAGE_CONTAINER_CLASS`;
- preservacao do header proprio da Home pos-login.

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

### 5.2 Painel lateral da arvore

Concluido:

- botao unico de expandir/recolher painel;
- botao fica dentro ou junto ao painel conforme largura;
- remocao de duplicidade com botao dentro da area ReactFlow;
- toggle principal do painel usa **Filtros** e **Legendas**;
- **Informacoes** fica fora da toggle, acionada por **Acoes**.

Arquivos relacionados:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
```

### 5.3 Viewport das views da arvore

Concluido:

- **Minha Arvore** usa bounds de cards reais para evitar zoom minusculo;
- **Genealogia** e **Visao Completa** usam zoom por largura, sem reduzir pela altura total;
- titulo/subtitulo interno foi removido dos layouts;
- overlay fixo unico foi mantido em `FamilyTree.tsx`;
- bounds de viewport e pan foram separados;
- usuario pode arrastar/deslizar verticalmente em Genealogia/Visao Completa quando houver muitos cards.

Arquivos relacionados:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Commits de referencia:

```txt
94add1e fix: padronizar viewport inicial da arvore
e94ed6b fix: ajustar escala e titulo das views da arvore
```

### 5.4 Legenda no painel lateral

Concluido:

- remocao do subtitulo do painel;
- remocao da secao Visualizacao atual;
- remocao do card azul da view atual;
- remocao dos subtitulos internos dos cards;
- renomeacao de Ativa para Em relacionamento;
- remocao da secao Views no final;
- legenda passou a controlar filtros/camadas visuais quando callbacks sao fornecidos;
- camadas opcionais incluem destaque de pais/filhos e destaque de irmaos.

Arquivo relacionado:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

### 5.5 Arquivos historicos e dados conjugais

Concluido:

- Home usa botao **Acoes** com icone `Printer`;
- desktop pode exibir texto **Acoes** e mobile usa apenas icone;
- botao continua abrindo acao/painel de informacoes;
- loading da Home e **Buscando pessoas e relacionamentos...**;
- `ArquivosHistoricos` mantem mensagem verde e miniatura/card PDF apos upload;
- input nativo, campos e botoes **Cancelar**/**Adicionar** ficam ocultos imediatamente apos upload;
- botao **Adicionar Arquivo** reabre campos mantendo a miniatura carregada;
- arquivos historicos tem `HistoricalFileEventCategory` e `categoria_evento`;
- `/minha-arvore` removeu **Salvar casamento** individual;
- **Salvar meus dados** tambem processa `marriageForms`;
- cards de **Escopo da visualizacao** exibem avatar circular com foto ou iniciais;
- admin atualiza relacionamento conjugal principal e inverso, quando existir;
- usuario nao-admin cria solicitacao via `relationshipChangeRequestService`;
- local de casamento invalido nao bloqueia dados pessoais, mas deixa casamento sem salvar e exibe aviso.

Pre-requisito operacional:

- aplicar `20260522121000_add_historical_file_event_category.sql` antes de deploy que envie `categoria_evento` em `arquivos_historicos`.

### 5.6 Ajustes apos PDF

Concluido:

- separacao de `/notificacoes` e `/ajustar-notificacoes`;
- ocultacao de cards vazios de insights no perfil publico;
- correcao da listagem de usuarios para vinculo admin;
- autocomplete de endereco no admin;
- ajustes residuais do calendario familiar.

Validacao operacional registrada no historico:

- `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` aplicada no ambiente Supabase remoto;
- `supabase migration list` confirmou local/remoto alinhados ate `20260522173000`;
- validacao tecnica pos-migration passou com build, testes, e2e e `git diff --check`.

### 5.7 Paletas visuais da arvore

Concluido:

- PR #6 mergeado na `main` com a base tecnica das paletas;
- PR #7 mergeado na `main` expondo as paletas no `HomeHeader`;
- tres paletas disponiveis: `white`, `orange` e `brown`;
- selecao por botoes circulares no dropdown de visualizacao da arvore;
- persistencia em `localStorage`;
- aplicacao por CSS variables;
- botao/anel conjugal ampliado para `60px x 60px`;
- producao reestabilizada apos revert da tentativa anterior quebrada;
- producao validada apos merge do PR #7.

Arquivos relacionados:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

QA de manutencao:

- validar persistencia apos reload quando alterar o header;
- validar contraste das tres paletas quando ajustar tokens;
- validar desktop/tablet;
- avaliar acesso equivalente em mobile estreito caso o dropdown de view nao esteja disponivel;
- qualquer nova paleta deve atualizar `treeColorPalettes.ts`, `GUIA_UX_LAYOUT.md`, `GUIA_COMPONENTES.md` e este plano.

### 5.8 Genealogia mobile por geracoes

Concluido:

- criada navegacao horizontal por geracoes em `/genealogia` mobile;
- chips exibem **Tataravos**, **Bisavos**, **Avos**, **Pais**, **Nucleo** e **Descendentes**;
- chips nao exibem contagem numerica;
- swipe lateral alterna entre geracoes;
- chips controlam foco/enquadramento, nao removem colunas da arvore;
- todas as colunas renderizaveis continuam presentes no ReactFlow;
- botoes `+` e `-` foram ocultados apenas em Genealogia mobile;
- barra de chips ocupa a largura horizontal disponivel;
- labels `GERACAO X` nao devem sobrepor o menu;
- colunas vazias nao sao renderizadas;
- inferencia de geracoes em memoria foi adicionada para a Genealogia;
- tataravos aparecem quando conectados por filiacao valida ate a pessoa central;
- sem migration, RLS, alteracao de schema ou alteracao de dados reais.

Arquivos relacionados:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Commits de referencia:

```txt
60a6cd0 feat: add genealogy mobile stage tabs
8d369f8 feat: show genealogy mobile stage tabs
096d005 feat: control genealogy mobile stage tabs
777d8fd feat: filter genealogy mobile tree by active stage
50609f0 feat: reset genealogy mobile viewport by stage
bd0d24f feat: refine genealogy mobile stage labels
ca593a6 feat: add swipe navigation to genealogy mobile stages
05742bb feat: show empty genealogy mobile stage feedback
af17ffb fix: improve genealogy mobile stage focus
f23e353 fix: refine genealogy mobile stage navigation
9c13e22 fix: focus first genealogy mobile stage on load
189303a fix: start genealogy mobile on first rendered column
b668a59 fix: infer genealogy generations from central person
```

QA especifico:

- validar `/genealogia` em 320px, 375px, 390px, 430px, 768px e desktop;
- confirmar que a primeira coluna tem cards reais;
- confirmar que Tataravos aparecem quando cadastrados e conectados;
- confirmar pan vertical/horizontal;
- confirmar que `/minha-arvore` e `/visao-completa` nao regrediram.

### 5.9 Menu compartilhado, título da árvore e páginas auxiliares

Concluído ou parcialmente consolidado:

- o header da árvore preserva a aparência compacta do botão de usuário;
- a regra desejada é que o clique no botão abra o painel compartilhado de `UserProfileMenu`;
- `UserProfileMenu` possui variante visual para o header da arvore e variante padrao para paginas internas;
- o cabecalho do menu, com avatar/nome/e-mail, navega para `/minha-arvore/editar`;
- o item **Editar notificacoes** foi removido do menu;
- `/notificacoes` ganhou botao **Personalizar Notificacoes** para `/ajustar-notificacoes`;
- `/minha-arvore/editar` ganhou botao **Trocar Senha**;
- `/calendario-familiar` teve hierarquia visual refinada no grid: titulo do evento com peso maior e descricao **Faz X anos** menor;
- titulos e textos com mojibake/Unicode escapado foram corrigidos nas paginas afetadas;
- título e espaçamento da árvore devem ser controlados por `FamilyTree.tsx`, sem `translate` em `.react-flow__viewport`;
- `MarriageNode` passou a usar SVG no lugar de emoji corrompido, mas a visibilidade final das alianças ainda precisa de ajuste visual.

Arquivos relacionados:

```txt
src/app/components/layout/UserProfileMenu.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/types.ts
src/styles/family-tree-visual-polish.css
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
```

Validacao visual recomendada:

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/minha-arvore/editar
/notificacoes
/ajustar-notificacoes
```

Pontos de atencao:

- confirmar que as aliancas estao visiveis em `/minha-arvore`;
- confirmar que `/genealogia` nao perdeu o estilo correto das aliancas;
- confirmar que nenhum card superior da arvore foi cortado;
- confirmar que o cabecalho do menu navega para `/minha-arvore/editar`;
- confirmar que o botao `X` do menu apenas fecha o painel;
- confirmar que as tres paletas `white`, `orange` e `brown` continuam legiveis.


### 5.10 Pendências visuais finais das views da árvore

Status: pendente antes de considerar a rodada visual encerrada.

Pendências:

```txt
/minha-arvore: título muito próximo do topo da área da árvore
/minha-arvore: espaço ainda grande entre título e cards
/minha-arvore: alianças ainda pouco visíveis ou ausentes no botão conjugal
/genealogia: manter título compacto sem cortar labels ou cards
/visao-completa: manter título compacto sem cortar labels ou cards
menus: diagnosticar diferença entre menu da árvore e menu das páginas internas
```

Arquivos prováveis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/styles/family-tree-visual-polish.css
src/app/pages/home/HomeHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
```

Regras:

- não usar `translate` em `.react-flow__viewport`;
- não criar migration para ajuste visual;
- não alterar Supabase, RLS ou dados reais;
- não reintroduzir `UserMenu` local sem decisão explícita;
- validar paletas `white`, `orange` e `brown`;
- validar desktop e mobile.

Critérios de aceite:

- título com padding superior suficiente;
- espaço entre título e cards reduzido sem corte superior;
- alianças legíveis em `/minha-arvore`;
- estilo de alianças preservado em `/genealogia` e `/visao-completa`;
- menu da árvore e menu das páginas internas explicados no código e na documentação, seja como componente único ou como variantes controladas.


---

## 6. QA final de lançamento

Status: validacao tecnica final executada e aprovada no historico recente. O QA visual amplo foi aprovado em 2026-05-19; a validacao tecnica pos-documentacao e pos-migration foi concluida em 2026-05-22.

### 6.1 Validacao tecnica

Comandos:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Criterios:

- build aprovado;
- testes unitarios aprovados;
- e2e aprovado;
- `git diff --check` sem erros;
- `supabase migration list` sem divergencia inesperada;
- nenhuma migration visual criada;
- nenhum secret versionado;
- worktree limpo ou apenas com alteracoes intencionais.

### 6.2 QA visual obrigatorio

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

Roteiro visual minimo para revalidacao antes de deploy:

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

- menu compartilhado do usuario funcionando em paginas internas e views da arvore;
- botao compacto do header da arvore abrindo o painel completo do menu;
- cabecalho do menu navegando para `/minha-arvore/editar`;
- item **Editar notificacoes** ausente do menu;
- botao **Trocar Senha** em `/minha-arvore/editar`;
- botao **Personalizar Notificacoes** em `/notificacoes`;
- textos **Calendario/Calendário**, **Preferencias/Preferências** e **Notificacoes/Notificações** sem mojibake;
- aliancas visiveis em `/minha-arvore` e preservadas em `/genealogia`;
- sem overflow horizontal global;
- painel lateral operavel;
- legenda visivel e nao duplicada;
- zoom funcional;
- arvore navegavel em touch;
- modais cabem ou rolam;
- usuario comum nao ve acoes admin.

### 6.3 QA funcional de regressao

Revalidar rapidamente antes do lancamento:

- login admin;
- login usuario comum;
- usuario comum nao acessa admin;
- admin acessa rotas administrativas;
- criar pessoa;
- editar pessoa;
- salvar pessoa falecida;
- salvar local no exterior;
- salvar redes sociais;
- salvar eventos pessoais;
- salvar arquivos historicos;
- Minha Arvore;
- Genealogia;
- Visao Completa;
- anel conjugal;
- painel de Legendas;
- recolher/expandir painel lateral;
- solicitacao de vinculo;
- notificacoes;
- favoritos;
- insights;
- timeline;
- exportacao PNG/PDF/impressao.

### 6.4 Checagem manual restante

Antes do deploy final, se ainda nao foi feita no ambiente final:

- abrir `/admin/pessoas/:id/editar` como admin;
- confirmar que o dropdown de usuarios vinculaveis carrega;
- confirmar que usuarios ja vinculados nao aparecem;
- testar o botao **Recarregar**;
- confirmar que o erro de schema cache da RPC desapareceu;
- salvar um arquivo historico com `categoria_evento`;
- confirmar que a migration `20260522121000_add_historical_file_event_category.sql` existe no remoto.

---

## 7. Encerramento do MVP

Depois da validacao final:

1. confirmar que os itens pos-MVP continuam fora do lancamento;
2. fazer checagem manual do card de vinculos no admin, se ainda nao feita no ambiente final;
3. confirmar migrations no remoto;
4. confirmar que nao ha arquivos temporarios versionados;
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

Pendente ate fechamento:

- checagem manual do card de vinculos em `/admin/pessoas/:id/editar`, se ainda nao feita no ambiente final;
- checagem de `categoria_evento` em ambiente final;
- deploy.

---

## 8. Criterios de bloqueio para lancamento

Bloqueiam lancamento:

- build quebrado;
- testes essenciais quebrados;
- login quebrado;
- usuario comum acessa admin;
- usuario comum altera dado restrito;
- perda/corrupcao de dados;
- secret no frontend ou no repositorio;
- arvore principal nao carrega;
- formulario principal nao salva;
- upload falha em fluxo essencial;
- notificacoes duplicam de forma massiva;
- RLS libera escrita indevida;
- responsividade impede uso em mobile;
- Genealogia/Visao Completa exibem titulo duplicado;
- painel lateral impede uso da arvore;
- viewport inicial torna a arvore inutilizavel;
- migration obrigatoria ausente em ambiente final.

Nao bloqueiam lancamento, se documentados:

- refinamentos visuais pequenos;
- expansao de favoritos;
- arvore completa em PDF;
- push real;
- WhatsApp real;
- timeline avancada;
- IA consultiva;
- filtros avancados do admin integridade;
- limpeza auditada de legado/base64;
- revisao de scripts legados.

---

# Pos-MVP

## Pos-MVP imediato

| Frente | Implementacao |
|---|---|
| Favoritos expandidos | Arquivos historicos, forum, relacionamentos, eventos pessoais/timeline. |
| WhatsApp avancado | Privacidade forte em banco/API e log seguro de clique. |
| Notificacoes avancadas | Push real, WhatsApp real, fila/retry avancado. |
| Timeline avancada | Edicao manual, upload por evento, privacidade por evento, PDF. |
| Exportacao avancada | Exportar arvore completa, nao so viewport visivel. |
| Parentesco avancado | Integracao direta na arvore, Genealogia e Visao Completa. |
| Insights avancados | Backlog editorial, privacidade refinada e novos tipos de conteudo. |

---

## Pos-MVP tecnico

| Frente | Implementacao |
|---|---|
| Rotas das views da arvore | Avaliar rota pai/layout compartilhado para `/minha-arvore`, `/genealogia` e `/visao-completa`, caso seja confirmado remount da Home ao trocar view. |
| Navegacao interna | Revisar navegacoes internas que ainda apontam para `/` e decidir se devem ir direto para `/minha-arvore`. |
| Refatoracao da Home | Continuar extracao incremental apenas em blocos seguros; `Home.tsx` ainda concentra orquestracao, efeitos, estado e handlers principais. |
| Dialog de Curiosidades/IA | Revisar acoplamento de `HomeCuriositiesDialog.tsx` e avaliar extracao adicional de subpaineis/hooks sem alterar contratos de IA, conexao ou privacidade. |
| Pagina MinhaArvore | Refatorar progressivamente `src/app/pages/MinhaArvore.tsx`, que concentra formulario grande, dados pessoais, casamento, avatar/crop e arquivos. |
| MeusDados | Reaproveitar componentes compartilhados de pessoa em `MeusDados.tsx`, respeitando avatar/crop, Places e fluxo de primeiro acesso. |
| MeusVinculos | Definir e implementar persistencia real da remocao de vinculo em Supabase quando a revisao de relacionamentos for definitiva. |
| AdminPessoaForm | Dividir formulario admin em blocos menores e revisar hooks/efeitos. |
| AdminDiagnostico | Trocar `Array<any>` por tipos explicitos para resultados de diagnostico. |
| FamilyTree | Manter refatoracoes conservadoras; arquivo e critico para viewport, exportacao, selecao de area e ReactFlow. |
| Links e AppLink | Revisar link 404 em `routes.tsx` que usa `<a href="/">`; trocar por navegacao client-side em momento seguro. |
| Storage | Verificar e prevenir uploads orfaos. |
| Base legada | Dry-run de Storage/base64 e possivel limpeza auditada. |
| Admin Integridade | Filtros por severidade, paginacao e acoes assistidas futuras. |
| Migrations | Manter `docs/operacao/MIGRATIONS_SUPABASE.md` atualizado conforme novas migrations. |
| Legado SQL | Revisar scripts antigos de forum/Google Calendar. |
| Logs | Remover ruidos tecnicos como `lado` dos `changed_fields`, se confirmado como ruido. |
| Viewport arvore | Avaliar melhorias finas para arvores muito grandes apos uso real. |
| Visao Completa mobile | Avaliar aplicacao do padrao de navegacao horizontal por blocos/geracoes depois da validacao completa da Genealogia. |
| Legenda | Avaliar versao administrativa/configuravel pos-MVP, se necessario. |
| Documentacao | Manter `docs/arquitetura/ROTAS_E_GUARDS.md`, `docs/funcionalidades/EXPORTACAO_ARVORE.md` e demais guias canonicos sincronizados com o codigo. |

### Varredura tecnica de 2026-05-26

Pontos identificados em paginas e componentes principais:

- `Home.tsx` ainda tem aproximadamente 1.800 linhas mesmo apos extracao de componentes visuais, filtros, curiosidades, IA e conexao; manter novas extracoes em etapas pequenas e testaveis.
- `MinhaArvore.tsx` tem aproximadamente 2.300 linhas e continua sendo o maior candidato a decomposicao pos-MVP.
- `AdminPessoaForm.tsx` e `FamilyTree.tsx` tem mais de 1.400 linhas cada; ambos sao criticos e devem ser refatorados apenas com validacao tecnica e, no caso da arvore, validacao visual.
- `HomeCuriositiesDialog.tsx` ficou funcional, mas ainda e ponto de acoplamento medio por reunir abas, estados e paineis de IA/conexao recebidos por props.
- Existem usos legitimos de `window.location` para origem, search params, path atual ou parsing de URL; nao tratar como bug automaticamente, mas revisar quando tocar nesses fluxos.
- Existem usos de `setTimeout` para foco, debounce, impressao e UX de carregamento; manter como pontos de atencao em refatoracoes, garantindo cleanup quando aplicavel.
- Nao foram encontrados backups `.bak-views-normalization` rastreados apos a limpeza.

---

## Pos-MVP produto

| Modulo | Implementacoes |
|---|---|
| Calendario familiar | Google Agenda, ICS, lembretes mais completos. |
| Forum | QA ampliado, moderacao, expansao de recursos. |
| Acervo | Albuns, documentos, arquivos por evento, galeria familiar. |
| Familia expandida | Linha do tempo da familia, mapa familiar, visualizacoes por ramo. |
| IA | Curiosidades, estatisticas, IA consultiva e conteudos narrativos. |
| Colaboracao | Sugestoes moderadas por familiares. |
| Comparacoes | Comparador de perfis e caminhos familiares. |
| Home dinamica | Aniversarios, memorias do dia, novidades e destaques. |

---

## 9. Manutencao documental

Para evitar repeticao:

- este plano deve manter apenas pendencias, criterios e backlog;
- historico detalhado de QA antigo deve ir para `docs/historico/`;
- decisoes de UX devem ir para `docs/GUIA_UX_LAYOUT.md`;
- estado implementado deve ir para `docs/GUIA_IMPLEMENTACOES.md`;
- troubleshooting deve ir para `docs/GUIA_CORRECAO_ERROS.md`;
- migrations devem ir para `docs/operacao/MIGRATIONS_SUPABASE.md`;
- rotas/guards devem ir para `docs/arquitetura/ROTAS_E_GUARDS.md`;
- exportacao da arvore deve ir para `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---
## 10. Plano atualizado apos ajustes recentes - ciclo 2026-05-30

Esta secao atualiza o plano de proximos passos com base nos ajustes recentes ja implementados e nas pendencias ainda abertas.

### 10.1 Concluidos no ciclo recente

Itens concluidos e tratados como anti-regressao:

```txt
/privacidade e /termos sem Arvore Genealogica no lado direito do header
/privacidade e /termos com ultima atualizacao 01/06/2026
Legendas > Linhas > Todas ocultando tambem linhas de primos
Header da arvore com busca de pessoas e paginas
Busca com pagina completa de resultados
Busca fechando por clique fora e Esc
Sugestao de pessoa com Cidade de nascimento – DD/MM/AAAA
Dropdown de views e menu do usuario acima do header
Cards coloridos em Curiosidades > Voce Sabia?
/minha-arvore/editar reorganizada
Avatar/foto com modal expandido
Confirmacao de saida sem salvar
Modal conjugal sem ID tecnico e com labels amigaveis
TreeAccessRoute sem redirecionamento recorrente para /meus-dados
Camada defensiva de reparo de encoding em textos conhecidos
```

### 10.2 Pendencias P1 antes de fechamento

#### P1.1 `/pessoa/:id` - perfil publico

Implementar:

```txt
remover Signo do topo do perfil publico
remover botao separado Entrar em contato por WhatsApp
transformar Telefone em link para WhatsApp quando permitido
usar estilo visual semelhante ao link de redes sociais
```

Documentos relacionados:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/GUIA_COMPONENTES.md
```

#### P1.2 Timeline/casamento/viuvez

Implementar:

```txt
data_casamento = 30/07/1988 deve aparecer corretamente
Data desconhecida so quando nao houver data valida
nao exibir Separacao quando relacionamento terminou por falecimento
tratar viuvez separadamente de separacao/divorcio
```

Documentos relacionados:

```txt
docs/funcionalidades/TIMELINE.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

#### P1.3 `/notificacoes`

Implementar:

```txt
corrigir acentuacao em memoria
exibir DATAS_ESPECIAIS como ESPECIAIS
tornar card inteiro clicavel
preservar botao remover sem abrir card
```

Documento relacionado:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

### 10.3 Pendencias P2 de layout

#### P2.1 `/minha-arvore` - cards e espacos laterais

Continuar ajuste incremental:

```txt
reduzir espacos laterais
ampliar cards de pessoas
ampliar grupos usando areas vazias laterais
manter gap entre colunas
reduzir truncamento excessivo de nomes
```

Cuidados:

- nao quebrar conectores;
- nao reduzir gap entre grupos internos;
- usar espacos vazios externos dos ramos paterno/materno;
- validar com nomes longos;
- validar linhas apos ajuste.

Documentos relacionados:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

#### P2.2 Modal de foto e encoding

Conferir em ambiente final:

```txt
botao Remover foto com borda visivel
O corte final sera/será quadrado sem encoding quebrado
Arquivos Historicos/Históricos sem ?
modal Sair sem salvar? com texto legivel
```

### 10.4 Sequencia recomendada de implementacao

1. Corrigir `/pessoa/:id` contato e signo.
2. Corrigir timeline de casamento/viuvez.
3. Corrigir `/notificacoes`.
4. Finalizar layout lateral/cards da `/minha-arvore`.
5. Revalidar encoding e modal de foto.
6. Atualizar documentacao afetada apos cada bloco.
7. Rodar QA final.

### 10.5 Checklist tecnico por bloco

Para cada bloco:

```bash
git status
npm run build
git diff --check
```

Quando envolver rotas/permissoes:

```bash
npm run test:e2e
```

Quando envolver banco:

```bash
supabase migration list
```

### 10.6 Criterios de aceite para fechar a rodada

A rodada so deve ser considerada fechada quando:

- todos os itens P1 estiverem implementados;
- build passar;
- nao houver texto quebrado visivel nos fluxos ajustados;
- perfil publico nao exibir Signo;
- telefone funcionar como link WhatsApp quando permitido;
- timeline nao confundir viuvez com separacao;
- notificacoes exibirem label amigavel e card clicavel;
- `/minha-arvore` nao perder legibilidade ao ajustar cards;
- docs canônicos estiverem atualizados.

---

## Atualizacao 2026-06-06 - Pos-merge das paletas visuais

Concluido:

- PR #6 mergeado na `main`;
- PR #7 mergeado na `main`;
- seletor de paletas visuais da arvore implementado no `HomeHeader`;
- paletas `white`, `orange` e `brown`;
- selecao por botoes circulares abaixo de **Minha Arvore**, **Genealogia** e **Visao Completa**;
- persistencia da paleta em `localStorage`;
- aplicacao por CSS variables;
- botao/anel conjugal ampliado para `60px x 60px`;
- build local aprovado apos merge;
- Vercel Preview do PR aprovado antes do merge;
- producao validada apos o PR #7.

Pendencias/observacoes de manutencao:

- validar contraste das paletas sempre que tokens forem alterados;
- verificar se a paleta laranja permanece suficientemente distinta da branca;
- verificar se a paleta marrom reproduz bem o estilo premium/Suafamilia;
- avaliar acesso equivalente ao seletor de paleta em mobile estreito, se o dropdown de views nao estiver disponivel;
- ajustar padding superior dos titulos dos grupos, como **BISAVOS PATERNOS**, sem alterar o tamanho geral dos containers, se ainda for uma demanda visual ativa.
---

## Atualizacao 2026-06-06 - Fechamento da frente Genealogia mobile

Concluido:

- navegacao mobile por chips de geracao em `/genealogia`;
- swipe lateral entre geracoes;
- chips sem contagem numerica;
- foco por geracao sem esconder as demais colunas;
- primeira visualizacao focada na primeira geracao com cards reais;
- colunas vazias removidas da Genealogia;
- inferencia de geracoes em memoria a partir da pessoa central;
- ajuste de espacamento vertical entre conjuges;
- ocultacao dos botoes `+` e `-` somente em Genealogia mobile;
- sem alteracao de Supabase, migrations, RLS ou dados reais.

Permanece fora desta frente:

- aplicar o mesmo padrao mobile em `/visao-completa`;
- transformar a inferencia em dado persistido;
- criar configuracao administrativa para labels/geracoes;
- alterar regras de permissao ou banco.

Checklist minimo antes de considerar a frente totalmente encerrada em producao:

```txt
/genealogia mobile carrega na primeira geracao com cards reais
Tataravos aparecem quando conectados por filiacao ate a pessoa central
chips alternam foco sem esconder colunas
pan vertical e horizontal funcionam
colunas vazias nao aparecem
/minha-arvore sem regressao
/visao-completa sem regressao
paletas white, orange e brown sem regressao visual
```
---

## Atualização 2026-06-07 - Ajustes de menu, árvore e páginas auxiliares

Concluído/parcialmente consolidado neste ciclo:

```txt
UserProfileMenu compartilhado com variante home-header
cabecalho do menu clicavel para /minha-arvore/editar
remocao do item Editar notificacoes do menu
botao Trocar Senha em /minha-arvore/editar
botao Personalizar Notificacoes em /notificacoes
correcao de titulos em /calendario-familiar e /ajustar-notificacoes
hierarquia visual dos eventos do calendario
diretriz de ajuste conservador de título/espaçamento da árvore por `FamilyTree.tsx`
limpeza de overrides conflitantes em family-tree-visual-polish.css
troca do emoji conjugal corrompido por SVG; visibilidade final das alianças ainda pendente
```

Permanece como QA e ajuste recomendado antes do deploy final:

```txt
abrir /minha-arvore, /genealogia e /visao-completa em desktop/tablet/mobile
validar botão do usuário e confirmar se o painel compartilhado é realmente o mesmo nas views da árvore e nas páginas internas
validar que o cabecalho do menu navega para /minha-arvore/editar
validar /calendario-familiar com evento de aniversario
validar /minha-arvore/editar com Trocar Senha
validar /notificacoes com Personalizar Notificacoes
validar /ajustar-notificacoes sem mojibake
validar paletas white, orange e brown
validar padding superior do título e espaço entre título e cards
validar alianças visíveis em /minha-arvore
```

Regra para proximos ajustes:

- nao reintroduzir `UserMenu` local em `Home.tsx`;
- nao usar `translate` em `.react-flow__viewport` para corrigir espacamento;
- nao alterar Supabase, migrations, RLS ou permissoes em ajustes visuais;
- nao recolocar **Editar notificacoes** no menu sem decisao de produto;
- documentar qualquer nova acao de pagina interna no guia funcional correspondente.
