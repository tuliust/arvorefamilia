# Plano de próximos passos — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: plano vivo após auditoria documental contra código-fonte, rotas, componentes, services, styles, scripts operacionais e configuração do projeto.

---

## Objetivo

Este documento registra apenas pendências reais, riscos, sugestões, decisões futuras, QA aberto e divergências encontradas entre documentação e implementação.

O estado implementado deve permanecer nos guias canônicos:

```txt
docs/BASELINE_PRODUTO_ATUAL.md
docs/GUIA_IMPLEMENTACOES.md
docs/INVENTARIO_TECNICO.md
docs/funcionalidades/
docs/arquitetura/
docs/operacao/
```

Regras deste arquivo:

- não usar como fonte de verdade para comportamento já consolidado;
- não duplicar documentação funcional extensa;
- registrar qualquer risco antes de alterar código;
- fechar item apenas após validação real, decisão explícita ou commit de correção;
- mudanças de schema exigem migration e atualização operacional;
- mudanças visuais/documentais não exigem migration.

---

## 1. Situação atual consolidada

| Área | Estado |
|---|---|
| `/mapa-familiar` | Implementada como view vertical principal/default; usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| `/mapa-familiar-horizontal` | Implementada como view horizontal/genealógica; usa `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile. |
| `/` | Redireciona para `/mapa-familiar`, preservando query string. |
| `/minha-arvore/editar` | Rota vigente de edição do membro; não é a antiga view `/minha-arvore`. |
| `/calendario-familiar` | Implementada com categorias, filtros mobile compactos e integração Google Agenda quando configurada. |
| `/forum` | Implementada como área de tópicos e discussões entre membros. |
| `/notificacoes` e `/ajustar-notificacoes` | Implementadas como central e preferências de notificações. |
| `/meus-favoritos` | Implementada para páginas, pessoas e conteúdos favoritos. |
| `/minha-arvore`, `/genealogia`, `/visao-completa` | Removidas do roteamento ativo; só podem aparecer como histórico ou keywords que apontam para rotas atuais. |

---

## 2. Itens abertos por categoria

### Documentação

#### ID: DOC-001

**Título:** Conferir links cruzados após auditorias documentais.  
**Tipo:** pendência  
**Prioridade:** média  
**Contexto:** a documentação foi reorganizada em guias canônicos, funcionais, operacionais e históricos. Qualquer nova frente documental deve garantir que `docs/README.md` continue apontando para documentos existentes e que documentos históricos não pareçam fonte de verdade vigente.  
**Evidência:** índice principal referencia os guias canônicos na raiz, arquitetura, funcionalidades, operação e histórico.  
**Arquivos relacionados:** `docs/README.md`, `docs/historico/README.md`, `docs/funcionalidades/*`, `docs/arquitetura/*`, `docs/operacao/*`.  
**Ação recomendada:** rodar busca por nomes de documentos removidos/movidos antes de qualquer reorganização e atualizar links no mesmo commit.  
**Status:** aberto.

#### ID: DOC-002

**Título:** Diferenciar título funcional da horizontal e rótulo de navegação.  
**Tipo:** melhoria  
**Prioridade:** baixa  
**Contexto:** a view horizontal usa título funcional/exportável `Mapa Genealógico de {nome}`, enquanto alguns atalhos, favoritos, busca global e painel usam o rótulo `Mapa Familiar Horizontal`. Isso não é erro necessariamente, mas precisa permanecer explícito para evitar correções indevidas de copy.  
**Evidência:** `HomeTreeSection.tsx` monta o título desktop/exportável como `Mapa Genealógico`, enquanto `SidebarPanelTabs.tsx`, `favoritePages.ts` e `globalSearchService.ts` usam `Mapa Familiar Horizontal` como rótulo de navegação/atalho.  
**Arquivos relacionados:** `src/app/pages/home/HomeTreeSection.tsx`, `src/app/pages/home/SidebarPanelTabs.tsx`, `src/app/constants/favoritePages.ts`, `src/app/services/globalSearchService.ts`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.  
**Ação recomendada:** manter a distinção documentada; se o produto decidir unificar nomes, alterar código e documentação no mesmo lote.  
**Status:** aberto.

### Código/arquitetura

#### ID: ARCH-001

**Título:** Criar CI para build, testes unitários e E2E.  
**Tipo:** melhoria  
**Prioridade:** média  
**Contexto:** o projeto possui scripts `build`, `test` e `test:e2e`, mas a validação ainda depende de execução manual quando não houver GitHub Actions configurado.  
**Evidência:** `package.json` declara `vite build`, `vitest run` e `playwright test`.  
**Arquivos relacionados:** `package.json`, `.github/workflows/*` se criado futuramente.  
**Ação recomendada:** criar workflow para PR/push com build e Vitest; adicionar Playwright como job separado ou condicional conforme custo.  
**Status:** backlog.

#### ID: ARCH-002

**Título:** Clarificar responsabilidades globais em `src/main.tsx`.  
**Tipo:** refatoração futura  
**Prioridade:** média  
**Contexto:** `src/main.tsx` concentra bootstrap do app, recuperação de dynamic import/CSS, atalhos de zoom da árvore e limpeza visual de linhas vitais mobile. A mistura é funcional, mas aumenta risco de regressão em mudanças aparentemente globais.  
**Evidência:** o arquivo instala atalhos de zoom dependentes de superfícies de árvore e um `MutationObserver` para ocultar textos de fallback em cards mobile.  
**Arquivos relacionados:** `src/main.tsx`, `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `src/styles/mobile-tree-*`, `docs/INVENTARIO_TECNICO.md`, `docs/GUIA_COMPONENTES.md`.  
**Ação recomendada:** em frente própria, extrair comportamentos de árvore para módulo/hook específico ou documentar explicitamente `main.tsx` como bootstrap com responsabilidades transversais.  
**Status:** aberto.

### Árvore

#### ID: TREE-001

**Título:** Validar visualmente `/mapa-familiar` com dados reais.  
**Tipo:** QA visual  
**Prioridade:** alta  
**Contexto:** a view vertical é a superfície principal da árvore e depende de layout panorâmico, grupos, conectores, zoom, painel colapsado, paletas, pets, cônjuges e núcleos conjugais adicionais.  
**Evidência:** a documentação funcional define `/mapa-familiar` como view principal e o código renderiza `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile.  
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `src/app/pages/home/HomeTreeSection.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.  
**Ação recomendada:** validar 1366, 1440, 1536, 1920, tablet e mobile 320/375/390/430; registrar screenshots se houver divergência.  
**Status:** aberto.

#### ID: TREE-002

**Título:** Validar visualmente `/mapa-familiar-horizontal` com dados reais.  
**Tipo:** QA visual  
**Prioridade:** alta  
**Contexto:** a horizontal depende de gerações, colunas, cônjuges adjacentes, conectores casal → filhos, ocultação de colunas vazias, paletas e exportação.  
**Evidência:** o shell renderiza `DesktopFamilyHorizontalMapView` no desktop/tablet e `MobileFamilyHorizontalMapView` no mobile.  
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `src/app/pages/home/HomeTreeSection.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.  
**Ação recomendada:** validar colunas por geração, conectores, cônjuges, filtros, exportação e comportamento mobile por geração.  
**Status:** aberto.

#### ID: TREE-003

**Título:** Verificar ausência de cônjuges da Geração 4/Pais na horizontal.  
**Tipo:** erro | pendência funcional  
**Prioridade:** alta  
**Contexto:** a documentação define que cônjuges de pessoas do grupo `pais`/Geração 4 devem aparecer na horizontal quando o filtro `Cônjuges` estiver ativo. No código auditado, os grupos filtráveis de cônjuges incluem `tios`, `primos`, `sobrinhos`, `filhos` e `netos`, mas não incluem `pais`.  
**Evidência:** `DesktopFamilyHorizontalMapView.tsx` e `MobileFamilyHorizontalMapView.tsx` declaram `FILTERABLE_SPOUSE_ANCHOR_GROUPS` sem `pais`; a documentação funcional exige cônjuges de `pais`/Geração 4 quando `Cônjuges` estiver ativo.  
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`, `docs/REGRAS_DE_NAO_REGRESSAO.md`.  
**Ação recomendada:** reproduzir com pessoa da Geração 4 que tenha cônjuge não incluído por outra relação; se confirmado, corrigir em frente de código incluindo `pais` no conjunto apropriado e adicionar teste/QA.  
**Status:** aberto.

#### ID: TREE-004

**Título:** Reduzir dependência de limpeza DOM para remover fallback de nascimento/falecimento no mobile.  
**Tipo:** risco | refatoração futura  
**Prioridade:** média  
**Contexto:** o contrato funcional diz que cards mobile não devem exibir `Nascimento não informado` nem `Falecimento não informado`. A implementação atual de `MobileFamilyTreeView.tsx` ainda monta esses fallbacks em `VitalLines`, e `src/main.tsx` oculta as linhas por `MutationObserver`. O resultado visual pode estar correto, mas a solução é indireta.  
**Evidência:** `MobileFamilyTreeView.tsx` usa fallback textual em `VitalLines`; `src/main.tsx` contém `UNKNOWN_BIRTH_TEXT`, `UNKNOWN_DEATH_TEXT` e `syncMobileFamilyTreeUnknownVitalLines()`.  
**Arquivos relacionados:** `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `src/main.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`, `docs/GUIA_COMPONENTES.md`.  
**Ação recomendada:** em frente de código autorizada, remover fallback direto no componente React e manter `main.tsx` sem manipulação DOM específica da árvore, ou documentar essa limpeza como fallback transitório até refatoração.  
**Status:** aberto.

#### ID: TREE-005

**Título:** Decidir destino do dropdown temporário `Visualizar como...`.  
**Tipo:** decisão necessária  
**Prioridade:** média  
**Contexto:** o dropdown auxilia QA/debug de renderização por pessoa central, mas aparece sobre as views quando a árvore renderiza.  
**Evidência:** `Home.tsx` renderiza o bloco `data-tree-debug-viewer="true"` com label `Visualizar como...` e `data-tree-export-ignore="true"`.  
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.  
**Ação recomendada:** decidir se permanece, se será removido antes de produção ou se ficará condicionado a flag/admin.  
**Status:** aberto.

### Mobile

#### ID: MOB-001

**Título:** Validar modal mobile de controles em Safari/iOS.  
**Tipo:** QA visual | QA funcional  
**Prioridade:** alta  
**Contexto:** o modal mobile tem contrato próprio e não deve expor Zoom, Restaurar visualização ou Exportar.  
**Evidência:** `Home.tsx` monta `tree-mobile-controls-modal`; `SidebarPanelTabs.tsx` troca `Exportar` por `Grupos` quando `mobileControls=true`.  
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `src/app/pages/home/SidebarPanelTabs.tsx`, `src/styles/mobile-tree-controls.css`, `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`.  
**Ação recomendada:** testar 320, 375, 390 e 430px em Chrome e Safari/iOS; validar abertura, fechamento, safe area, scroll interno e destravamento do body.  
**Status:** aberto.

#### ID: MOB-002

**Título:** Validar horizontal mobile por geração.  
**Tipo:** QA visual | QA funcional  
**Prioridade:** alta  
**Contexto:** a horizontal mobile deve usar uma geração por tela, botões `Ger X`, swipe lateral e scroll vertical interno, sem scroll horizontal manual.  
**Evidência:** `MobileFamilyHorizontalMapView.tsx` é renderizado para `/mapa-familiar-horizontal` quando `isMobile=true`.  
**Arquivos relacionados:** `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `src/app/pages/home/HomeTreeSection.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.  
**Ação recomendada:** validar gestos reais, comprimento vertical até último card/conector, safe area e retorno ao estado inicial.  
**Status:** aberto.

### Calendário

#### ID: CAL-001

**Título:** Validar filtros mobile do calendário.  
**Tipo:** QA visual  
**Prioridade:** alta  
**Contexto:** `/calendario-familiar` deve exibir 5 botões de categorias em uma única linha no mobile, com bolinha colorida acima do título e sem overflow.  
**Evidência:** `CalendarioFamiliar.tsx` define cinco categorias mobile; `calendar-mobile-category-buttons.css` força `repeat(5, minmax(0, 1fr))`, layout em coluna, bolinha acima e texto nowrap/ellipsis.  
**Arquivos relacionados:** `src/app/pages/CalendarioFamiliar.tsx`, `src/styles/calendar-mobile-category-buttons.css`, `docs/funcionalidades/CALENDARIO_FAMILIAR.md`.  
**Ação recomendada:** validar 320, 375, 390 e 430px, especialmente os rótulos `Aniversário` e `Falecimento`.  
**Status:** aberto.

#### ID: CAL-002

**Título:** Validar Google Agenda após mudanças em calendário/eventos.  
**Tipo:** QA funcional | segurança  
**Prioridade:** média  
**Contexto:** a integração com Google Agenda depende de services/Edge Functions, OAuth e shape de eventos. Mudanças visuais no calendário não devem alterar secrets nem contratos de sincronização.  
**Evidência:** `CalendarioFamiliar.tsx` chama `obterStatusGoogleCalendar`, `iniciarConexaoGoogleCalendar`, `sincronizarGoogleCalendar` e `desconectarGoogleCalendar`; a documentação operacional separa OAuth/secrets/deploy.  
**Arquivos relacionados:** `src/app/pages/CalendarioFamiliar.tsx`, `src/app/services/googleCalendarService.ts`, `docs/operacao/OAUTH_GOOGLE.md`, `docs/funcionalidades/CALENDARIO_FAMILIAR.md`.  
**Ação recomendada:** testar conexão, callback, sincronização, desconexão, ausência de tokens no frontend e limitação de usuários de teste quando aplicável.  
**Status:** aberto.

### Exportação

#### ID: EXP-001

**Título:** Validar exportação das duas views oficiais.  
**Tipo:** QA funcional  
**Prioridade:** alta  
**Contexto:** exportação deve funcionar por Área, PNG, PDF e Impressão em `/mapa-familiar` e `/mapa-familiar-horizontal`, preservando título, conectores, paleta, filtros e avatares.  
**Evidência:** `SidebarPanelTabs.tsx` dispara `select-area`, `save-image`, `save-pdf` e `print`; `HomeTreeSection.tsx` roteia essas ações para `FamilyTreeActions`.  
**Arquivos relacionados:** `src/app/pages/home/SidebarPanelTabs.tsx`, `src/app/pages/home/HomeTreeSection.tsx`, `src/app/components/FamilyTree/utils/treeExport.ts`, `docs/funcionalidades/EXPORTACAO_ARVORE.md`.  
**Ação recomendada:** testar as quatro ações em ambas as views, com paletas diferentes e com/sem área selecionada.  
**Status:** aberto.

### Perfil/pessoas

#### ID: PERF-001

**Título:** Validar retorno seguro de perfil para as duas views da árvore.  
**Tipo:** QA funcional  
**Prioridade:** média  
**Contexto:** perfil de pessoa deve permitir retorno seguro para `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`, preservando query quando codificada no parâmetro `voltar`.  
**Evidência:** `PersonProfile.tsx` define `TREE_RETURN_FALLBACK_PATH = /mapa-familiar` e aceita apenas os caminhos internos permitidos.  
**Arquivos relacionados:** `src/app/pages/PersonProfile.tsx`, `src/app/pages/Home.tsx`, `docs/arquitetura/ROTAS_E_GUARDS.md`, `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`.  
**Ação recomendada:** testar abertura de perfil a partir das duas views, retorno com `?pessoa=...`, rejeição de URLs externas e fallback seguro.  
**Status:** aberto.

#### ID: PERF-002

**Título:** Validar sugestões de alteração de perfil e permissões de edição.  
**Tipo:** QA funcional | segurança  
**Prioridade:** média  
**Contexto:** perfil combina dados pessoais, vínculos, permissões, sugestões, timeline, arquivos históricos e eventos.  
**Evidência:** `PersonProfile.tsx` usa `canEditPerson`, `canEditLinkedPersonRecord`, `createPersonProfileSuggestion`, timeline, arquivos e eventos.  
**Arquivos relacionados:** `src/app/pages/PersonProfile.tsx`, `src/app/services/personProfileSuggestionService.ts`, `src/app/services/permissionService.ts`, `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`.  
**Ação recomendada:** validar usuário comum, pessoa vinculada, admin e usuário sem permissão; conferir RLS/RPC quando houver escrita.  
**Status:** aberto.

### Fórum

#### ID: FORUM-001

**Título:** Rodar smoke test manual do fórum.  
**Tipo:** QA funcional  
**Prioridade:** média  
**Contexto:** fórum está documentado como funcionalidade de tópicos, respostas, menções, reações, favoritos e notificações.  
**Evidência:** rotas `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar` estão protegidas por `MemberRoute`.  
**Arquivos relacionados:** `src/app/pages/forum/*`, `src/app/services/forumService.ts`, `docs/funcionalidades/FORUM.md`.  
**Ação recomendada:** validar listagem, criação, edição, abertura de tópico, permissão, favoritos e notificações associadas.  
**Status:** aberto.

### Notificações

#### ID: NOTIF-001

**Título:** Validar central e preferências de notificações.  
**Tipo:** QA funcional  
**Prioridade:** média  
**Contexto:** notificações dependem de páginas de central/preferências, logs, Edge Functions e preferências de membro quando configuradas.  
**Evidência:** `/notificacoes` e `/ajustar-notificacoes` estão protegidas por `MemberRoute`; `/admin/notificacoes` está protegida por `ProtectedRoute`.  
**Arquivos relacionados:** `src/app/pages/Notificacoes.tsx`, `src/app/pages/AjustarNotificacoes.tsx`, `src/app/pages/admin/AdminNotificacoes.tsx`, `docs/funcionalidades/NOTIFICACOES.md`.  
**Ação recomendada:** validar leitura, marcação, preferências e área administrativa; revisar Edge Functions antes de qualquer automação.  
**Status:** aberto.

### Banco/Supabase

#### ID: SUPA-001

**Título:** Manter distinção entre ajuste visual/documental e mudança de schema.  
**Tipo:** risco  
**Prioridade:** alta  
**Contexto:** mudanças visuais/documentais não exigem migration; alterações de tabelas, RPCs, policies, buckets, triggers ou funções exigem migration e atualização operacional.  
**Evidência:** documentação operacional separa migrations, Edge Functions, Storage, OAuth, service role e deploy.  
**Arquivos relacionados:** `supabase/migrations/*`, `supabase/functions/*`, `docs/operacao/MIGRATIONS_SUPABASE.md`, `docs/operacao/STORAGE_MAINTENANCE.md`, `docs/operacao/OAUTH_GOOGLE.md`.  
**Ação recomendada:** antes de qualquer mudança em Supabase, registrar migration, rollback, secrets necessários e validação em ambiente seguro.  
**Status:** aberto.

### Operação/deploy

#### ID: OPS-001

**Título:** Validar build/test/diff em ambiente local ou CI antes de merge.  
**Tipo:** pendência  
**Prioridade:** alta  
**Contexto:** esta auditoria documental foi feita via conector GitHub porque o ambiente local disponível não conseguiu clonar o repositório por falha de resolução DNS para GitHub. Assim, comandos locais como `git diff --check`, `npm run build`, `npm test` e `npm run test:e2e` precisam ser executados em ambiente com checkout real antes de merge.  
**Evidência:** `package.json` possui scripts de build/test/E2E; os guias operacionais exigem build e diff check antes de fechar lote.  
**Arquivos relacionados:** `package.json`, `docs/operacao/DEPLOY.md`, `docs/operacao/DEPLOYMENT.md`, `docs/README.md`.  
**Ação recomendada:** rodar `git diff --check`, `npm run build`, `npm test` e `npm run test:e2e` localmente ou em CI antes de mesclar qualquer alteração desta frente.  
**Status:** aberto.

### Segurança

#### ID: SEC-001

**Título:** Não expor secrets no frontend.  
**Tipo:** risco  
**Prioridade:** alta  
**Contexto:** integrações com Google, Supabase service role e OpenAI devem permanecer no backend/Edge Functions, sem prefixo `VITE_` quando forem segredo.  
**Evidência:** documentação operacional cita service role, secrets, Edge Functions, OAuth e variáveis `VITE_`; o calendário chama serviços de Google sem carregar secret diretamente na página.  
**Arquivos relacionados:** `docs/operacao/OAUTH_GOOGLE.md`, `docs/operacao/DEPLOYMENT.md`, `src/app/services/googleCalendarService.ts`, `supabase/functions/*`.  
**Ação recomendada:** revisar bundle/frontend e logs antes de deploy de integrações; não documentar tokens, dumps ou dados reais.  
**Status:** aberto.

### Refatoração futura

#### ID: REF-001

**Título:** Refatorar `Home.tsx`.  
**Tipo:** refatoração futura  
**Prioridade:** média  
**Contexto:** `Home.tsx` acumula carregamento de dados, filtros, pessoa central, busca, curiosidades/IA, modal, painel, debug e navegação.  
**Evidência:** o arquivo concentra estados e callbacks para árvore, IA, busca, filtros e modal.  
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `src/app/pages/home/*`, `src/app/components/FamilyTree/*`.  
**Ação recomendada:** extrair hooks como `useTreeDataLoader`, `useTreeFilters`, `useTreeDebugViewer` e componentes menores em frente própria.  
**Status:** backlog.

#### ID: REF-002

**Título:** Renomear `SidebarPanelTabs.tsx` para nome compatível com função atual.  
**Tipo:** refatoração futura  
**Prioridade:** baixa  
**Contexto:** o componente não representa mais uma barra de tabs tradicional; ele renderiza painel/stack de controles da árvore.  
**Evidência:** o componente controla paletas, exportação, destaques, alternância Vertical/Horizontal e modo mobile `Grupos`.  
**Arquivos relacionados:** `src/app/pages/home/SidebarPanelTabs.tsx`, `docs/GUIA_COMPONENTES.md`.  
**Ação recomendada:** renomear para algo como `TreeControlPanel` em frente com atualização de imports e documentação.  
**Status:** backlog.

#### ID: REF-003

**Título:** Auditar permanência de ReactFlow/Dagre.  
**Tipo:** refatoração futura  
**Prioridade:** baixa  
**Contexto:** ReactFlow/Dagre continuam em dependências e imports de helpers/layouts legados ou ativos. Remoção superficial pode quebrar tipos, layouts, exportação ou compatibilidade.  
**Evidência:** `package.json` mantém `reactflow`, `dagre` e `@types/dagre`; views horizontais ainda importam `Node` de `reactflow` e usam `genealogyColumnsLayout`.  
**Arquivos relacionados:** `package.json`, `src/app/components/FamilyTree/*`, `docs/INVENTARIO_TECNICO.md`.  
**Ação recomendada:** fazer inventário de imports antes de qualquer remoção; planejar rollback e QA de árvore/exportação.  
**Status:** backlog.

#### ID: REF-004

**Título:** Extrair modelo compartilhado para horizontal desktop/mobile.  
**Tipo:** refatoração futura  
**Prioridade:** média  
**Contexto:** `DesktopFamilyHorizontalMapView` e `MobileFamilyHorizontalMapView` repetem lógica de gerações, cônjuges, mapas de relacionamento e filtros. Isso aumenta risco de divergência.  
**Evidência:** ambos declaram grupos de cônjuges ancestrais/filtráveis e implementam inferência de gerações.  
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`.  
**Ação recomendada:** extrair view model compartilhado e cobrir com testes antes de alterar layout visual.  
**Status:** backlog.

### QA visual

#### ID: QA-001

**Título:** Consolidar QA visual antes de fechar a frente da árvore.  
**Tipo:** QA visual  
**Prioridade:** alta  
**Contexto:** várias correções recentes são visuais e responsivas; build não substitui validação com dados reais.  
**Evidência:** os guias funcionais e operacionais exigem breakpoints 320, 375, 390, 430, tablet e desktop, além de paletas e exportação.  
**Arquivos relacionados:** `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`, `docs/funcionalidades/CALENDARIO_FAMILIAR.md`, `docs/REGRAS_DE_NAO_REGRESSAO.md`.  
**Ação recomendada:** registrar evidências de QA manual por rota, breakpoint e paleta.  
**Status:** aberto.

---

## 3. Itens fechados, obsoletos ou reclassificados

| ID | Frente | Resultado | Status |
|---|---|---|---|
| ROT-001 | `/minha-arvore` como view | Removida do roteamento ativo; permanece apenas `/minha-arvore/editar`. | Concluído |
| ROT-002 | `/genealogia` | Removida do roteamento ativo. | Concluído |
| ROT-003 | `/visao-completa` | Removida do roteamento ativo. | Concluído |
| EXP-OLD-001 | `/mapa-horizontal` | Rota experimental removida. | Obsoleto/removido |
| EXP-OLD-002 | `/visao-completa-teste` | Rota experimental removida. | Obsoleto/removido |
| PANEL-001 | Barra `Filtros | Legendas | Ações` | Removida/simplificada no painel atual. | Concluído |
| MOB-OLD-001 | Toggle mobile antigo | Substituído pelo modal de controles. | Concluído |
| SEARCH-001 | Busca/favoritos da horizontal | `/mapa-familiar-horizontal` incluída em busca e favoritos. | Concluído |
| AVATAR-001 | Avatares sem foto | Padronização em `User`; pets em `PawPrint`. | Concluído tecnicamente; QA aberto |
| CAL-OLD-001 | Categorias mobile | 5 botões em linha com bolinha acima do título. | Concluído tecnicamente; QA aberto |
| HYGIENE-001 | Artefatos locais | `test-results/`, `playwright-report/`, `coverage/`, `backups/` e `.env*.save` devem permanecer fora do versionamento. | Concluído/regra vigente |

---

## 4. Critério para fechar lote documental

Antes de fechar qualquer lote documental:

```bash
git status --short
git diff --check
npm run build
```

Quando a mudança tocar rotas, guards, árvore, exportação ou contratos funcionais:

```bash
npm test
npm run test:e2e
```

Checklist de fechamento:

- [ ] documentos alterados revisados contra código atual;
- [ ] nenhuma rota antiga foi reintroduzida como vigente;
- [ ] links internos conferidos;
- [ ] pendências adicionadas neste plano quando não forem corrigidas no lote;
- [ ] `git diff --check` sem erro;
- [ ] `npm run build` passando;
- [ ] testes unitários/E2E rodados quando aplicável ou justificativa registrada;
- [ ] `git status --short` revisado;
- [ ] commit contém apenas arquivos autorizados.

---

## 5. Próximas frentes recomendadas

### Frente A — QA visual real

Prioridade alta.

Escopo:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/calendario-familiar
mobile iOS/Safari
desktop 1366/1440/1536/1920
paletas
exportação
```

### Frente B — Correção da horizontal Geração 4/Pais

Prioridade alta se o QA confirmar o item `TREE-003`.

Escopo:

```txt
DesktopFamilyHorizontalMapView
MobileFamilyHorizontalMapView
filtro Cônjuges
grupo pais/Geração 4
contagem de conjuge
```

### Frente C — Remoção do fallback textual no componente mobile

Prioridade média.

Escopo:

```txt
MobileFamilyTreeView
VitalLines
src/main.tsx
MutationObserver de limpeza visual
```

### Frente D — Refatoração de `Home.tsx`

Prioridade média.

Possíveis extrações:

```txt
useTreeDataLoader
useTreeFilters
useTreeDebugViewer
useTreeAiDialog
TreeControlPanel
```

### Frente E — Modelo compartilhado da horizontal

Prioridade média.

Objetivo:

```txt
Evitar divergência entre DesktopFamilyHorizontalMapView e MobileFamilyHorizontalMapView.
```

### Frente F — Remoção planejada de legado ReactFlow/Dagre

Prioridade baixa/média.

Não iniciar sem inventário de imports, plano de rollback e QA de exportação.
