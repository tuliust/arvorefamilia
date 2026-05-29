# Plano de próximos passos — Árvore Família

> Última revisão: 2026-05-29  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento define **o que falta fazer até o lançamento** e organiza o backlog pós-MVP do projeto **Árvore Família**.

Ele responde à pergunta: **“o que ainda precisa ser feito, validado ou deixado explicitamente para depois?”**

Este arquivo não deve repetir em detalhe:

- o inventário do que já foi implementado;
- troubleshooting por sintoma;
- documentação técnica completa de rotas, migrations, UX ou componentes.

Use também:

- `docs/GUIA_IMPLEMENTACOES.md`: o que já foi implementado e comportamento consolidado.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação e correção por sintoma.
- `docs/GUIA_UX_LAYOUT.md`: decisões de UX e layout.
- `docs/GUIA_COMPONENTES.md`: componentes e cuidados de implementação.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas e guards.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: banco, migrations e operação Supabase.
- `docs/funcionalidades/*.md`: documentação específica por funcionalidade.

---

## 1. Situação atual do MVP

As frentes funcionais principais do MVP estão implementadas e testadas manualmente no escopo atual.

| Frente | Status MVP | Decisão |
|---|---|---|
| 7.1 Notificações | Concluída tecnicamente | `/notificacoes` e `/ajustar-notificacoes` separados; cron automático depende de configuração segura externa. |
| 7.2 Astrologia/acontecimentos | Concluída no escopo atual | Cards vazios ocultos no perfil público; evoluções ficam pós-MVP. |
| 7.3 Timeline | Implementada funcionalmente | Edição, upload por evento, privacidade por evento e PDF ficam pós-MVP. |
| 7.4 WhatsApp | Concluído no frontend | Privacidade forte/API/log seguro ficam pós-MVP. |
| 7.5 Grau de parentesco | Consolidado funcionalmente | Integração direta na árvore/Genealogia/Visão Completa fica pós-MVP. |
| 7.6 Exportação de área da árvore | Concluída no escopo atual | Árvore completa e escala automática ficam pós-MVP. |
| 7.7 Legendas visuais | Concluída | Painel lateral simplificado e funcional; manter monitoramento visual. |
| 7.8 Favoritos | Primeira camada aprovada | Expansão para outras entidades fica pós-MVP. |
| 7.9 Página de favoritos | Primeira versão aprovada | Refinamentos ficam pós-MVP. |
| 7.10 Responsividade mobile/tablet | Concluída | QA final técnico e visual aprovado em 2026-05-19. |
| Headers e margens internas | Concluídos | Header compartilhado nas páginas internas e Home pós-login preservada com header próprio. |
| Viewport da árvore | Ajustado | Minha Árvore, Genealogia e Visão Completa têm regras finais de escala/título consolidadas. |
| Rotas das views da árvore | Concluídas | `/minha-arvore`, `/genealogia` e `/visao-completa` usam shell Home protegido por `TreeAccessRoute`; `/` redireciona para `/minha-arvore` preservando query string. |
| Refatoração incremental da Home | Em andamento seguro | Componentes visuais foram extraídos; `Home.tsx` segue como orquestradora. |
| Minha Árvore e arquivos históricos | Atualizados | Categoria histórica, preview pós-upload, botão **Ações** e casamento salvo pelo botão geral consolidados. |
| Vínculo admin usuário-pessoa | Corrigido e validado | RPC corrigida, migration aplicada e migrations local/remoto alinhadas no histórico recente. |
| Autocomplete de endereço | Concluído no frontend | Admin e dados do usuário usam Google Places com fallback para input normal. |
| Calendário familiar | Ajustes residuais concluídos | Categorias na sidebar, filtros clicáveis, pluralização e “Faz X anos”. |

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
- rotas dedicadas `/minha-arvore`, `/genealogia` e `/visao-completa`;
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
- home dinâmica;
- versão administrativa/configurável da legenda.

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
- não expandir escopo funcional sem registrar neste plano;
- não commitar arquivos `.bak`, backups temporários ou dumps;
- não deixar `test-results/`, `dist/` ou relatórios temporários entrarem no commit.

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

Esta seção registra apenas itens concluídos que ajudam a orientar QA final. Detalhes de UX devem ficar em `docs/GUIA_UX_LAYOUT.md`.

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
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

### 5.2 Painel lateral da árvore

Concluído:

- botão único de expandir/recolher painel;
- botão fica dentro ou junto ao painel conforme largura;
- remoção de duplicidade com botão dentro da área ReactFlow;
- toggle principal do painel usa **Filtros** e **Legendas**;
- **Informações** fica fora da toggle, acionada por **Ações**.

Arquivos relacionados:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
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
- remoção da seção “Views” no final;
- legenda passou a controlar filtros/camadas visuais quando callbacks são fornecidos;
- camadas opcionais incluem destaque de pais/filhos e destaque de irmãos.

Arquivo relacionado:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

### 5.5 Arquivos históricos e dados conjugais

Concluído:

- Home usa botão **Ações** com ícone `Printer`;
- desktop pode exibir texto **Ações** e mobile usa apenas ícone;
- botão continua abrindo ação/painel de informações;
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

- aplicar `20260522121000_add_historical_file_event_category.sql` antes de deploy que envie `categoria_evento` em `arquivos_historicos`.

### 5.6 Ajustes após PDF

Concluído:

- separação de `/notificacoes` e `/ajustar-notificacoes`;
- ocultação de cards vazios de insights no perfil público;
- correção da listagem de usuários para vínculo admin;
- autocomplete de endereço no admin;
- ajustes residuais do calendário familiar.

Validação operacional registrada no histórico:

- `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` aplicada no ambiente Supabase remoto;
- `supabase migration list` confirmou local/remoto alinhados até `20260522173000`;
- validação técnica pós-migration passou com build, testes, e2e e `git diff --check`.

---

## 6. QA final de lançamento

Status: validação técnica final executada e aprovada no histórico recente. O QA visual amplo foi aprovado em 2026-05-19; a validação técnica pós-documentação e pós-migration foi concluída em 2026-05-22.

### 6.1 Validação técnica

Comandos:

```bash
git status
npm run build
npm test
npm run test:e2e
git diff --check
supabase migration list
```

Critérios:

- build aprovado;
- testes unitários aprovados;
- e2e aprovado;
- `git diff --check` sem erros;
- `supabase migration list` sem divergência inesperada;
- nenhuma migration visual criada;
- nenhum secret versionado;
- worktree limpo ou apenas com alterações intencionais.

### 6.2 QA visual obrigatório

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

Roteiro visual mínimo para revalidação antes de deploy:

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
- painel lateral operável;
- legenda visível e não duplicada;
- zoom funcional;
- árvore navegável em touch;
- modais cabem ou rolam;
- usuário comum não vê ações admin.

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

### 6.4 Checagem manual restante

Antes do deploy final, se ainda não foi feita no ambiente final:

- abrir `/admin/pessoas/:id/editar` como admin;
- confirmar que o dropdown de usuários vinculáveis carrega;
- confirmar que usuários já vinculados não aparecem;
- testar o botão **Recarregar**;
- confirmar que o erro de schema cache da RPC desapareceu;
- salvar um arquivo histórico com `categoria_evento`;
- confirmar que a migration `20260522121000_add_historical_file_event_category.sql` existe no remoto.

---

## 7. Encerramento do MVP

Depois da validação final:

1. confirmar que os itens pós-MVP continuam fora do lançamento;
2. fazer checagem manual do card de vínculos no admin, se ainda não feita no ambiente final;
3. confirmar migrations no remoto;
4. confirmar que não há arquivos temporários versionados;
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

Pendente até fechamento:

- checagem manual do card de vínculos em `/admin/pessoas/:id/editar`, se ainda não feita no ambiente final;
- checagem de `categoria_evento` em ambiente final;
- deploy.

---

## 8. Critérios de bloqueio para lançamento

Bloqueiam lançamento:

- build quebrado;
- testes essenciais quebrados;
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
- viewport inicial torna a árvore inutilizável;
- migration obrigatória ausente em ambiente final.

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

# Pós-MVP

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
| Rotas das views da árvore | Avaliar rota pai/layout compartilhado para `/minha-arvore`, `/genealogia` e `/visao-completa`, caso seja confirmado remount da Home ao trocar view. |
| Navegação interna | Revisar navegações internas que ainda apontam para `/` e decidir se devem ir direto para `/minha-arvore`. |
| Refatoração da Home | Continuar extração incremental apenas em blocos seguros; `Home.tsx` ainda concentra orquestração, efeitos, estado e handlers principais. |
| Dialog de Curiosidades/IA | Revisar acoplamento de `HomeCuriositiesDialog.tsx` e avaliar extração adicional de subpainéis/hooks sem alterar contratos de IA, conexão ou privacidade. |
| Página MinhaArvore | Refatorar progressivamente `src/app/pages/MinhaArvore.tsx`, que concentra formulário grande, dados pessoais, casamento, avatar/crop e arquivos. |
| MeusDados | Reaproveitar componentes compartilhados de pessoa em `MeusDados.tsx`, respeitando avatar/crop, Places e fluxo de primeiro acesso. |
| MeusVinculos | Definir e implementar persistência real da remoção de vínculo em Supabase quando a revisão de relacionamentos for definitiva. |
| AdminPessoaForm | Dividir formulário admin em blocos menores e revisar hooks/efeitos. |
| AdminDiagnostico | Trocar `Array<any>` por tipos explícitos para resultados de diagnóstico. |
| FamilyTree | Manter refatorações conservadoras; arquivo é crítico para viewport, exportação, seleção de área e ReactFlow. |
| Links e AppLink | Revisar link 404 em `routes.tsx` que usa `<a href="/">`; trocar por navegação client-side em momento seguro. |
| Storage | Verificar e prevenir uploads órfãos. |
| Base legada | Dry-run de Storage/base64 e possível limpeza auditada. |
| Admin Integridade | Filtros por severidade, paginação e ações assistidas futuras. |
| Migrations | Preencher `docs/operacao/MIGRATIONS_SUPABASE.md`. |
| Legado SQL | Revisar scripts antigos de fórum/Google Calendar. |
| Logs | Remover ruídos técnicos como `lado` dos `changed_fields`, se confirmado como ruído. |
| Viewport árvore | Avaliar melhorias finas para árvores muito grandes após uso real. |
| Legenda | Avaliar versão administrativa/configurável pós-MVP, se necessário. |
| Documentação | Preencher `docs/arquitetura/ROTAS_E_GUARDS.md` e `docs/funcionalidades/EXPORTACAO_ARVORE.md`. |

### Varredura técnica de 2026-05-26

Pontos identificados em páginas e componentes principais:

- `Home.tsx` ainda tem aproximadamente 1.800 linhas mesmo após extração de componentes visuais, filtros, curiosidades, IA e conexão; manter novas extrações em etapas pequenas e testáveis.
- `MinhaArvore.tsx` tem aproximadamente 2.300 linhas e continua sendo o maior candidato a decomposição pós-MVP.
- `AdminPessoaForm.tsx` e `FamilyTree.tsx` têm mais de 1.400 linhas cada; ambos são críticos e devem ser refatorados apenas com validação técnica e, no caso da árvore, validação visual.
- `HomeCuriositiesDialog.tsx` ficou funcional, mas ainda é ponto de acoplamento médio por reunir abas, estados e painéis de IA/conexão recebidos por props.
- Existem usos legítimos de `window.location` para origem, search params, path atual ou parsing de URL; não tratar como bug automaticamente, mas revisar quando tocar nesses fluxos.
- Existem usos de `setTimeout` para foco, debounce, impressão e UX de carregamento; manter como pontos de atenção em refatorações, garantindo cleanup quando aplicável.
- Não foram encontrados backups `.bak-views-normalization` rastreados após a limpeza.

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

## 9. Manutenção documental

Para evitar repetição:

- este plano deve manter apenas pendências, critérios e backlog;
- histórico detalhado de QA antigo deve ir para `docs/historico/`;
- decisões de UX devem ir para `docs/GUIA_UX_LAYOUT.md`;
- estado implementado deve ir para `docs/GUIA_IMPLEMENTACOES.md`;
- troubleshooting deve ir para `docs/GUIA_CORRECAO_ERROS.md`;
- migrations devem ir para `docs/operacao/MIGRATIONS_SUPABASE.md`;
- rotas/guards devem ir para `docs/arquitetura/ROTAS_E_GUARDS.md`;
- exportação da árvore deve ir para `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

