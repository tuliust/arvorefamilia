# Plano de próximos passos — Árvore Família

> Última revisão: 2026-06-14
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Tipo: backlog técnico/documental vivo.
> Status: revisado para conter apenas pendências, riscos, decisões futuras e QA aberto.

---

## 1. Objetivo

Este documento registra o que **ainda precisa ser verificado, decidido, corrigido ou melhorado** no projeto.

Ele não deve duplicar a documentação funcional consolidada. O estado implementado fica nos documentos canônicos:

```txt
docs/BASELINE_PRODUTO_ATUAL.md
docs/GUIA_IMPLEMENTACOES.md
docs/INVENTARIO_TECNICO.md
docs/funcionalidades/*
docs/arquitetura/*
docs/operacao/*
```

Regras:

- não registrar comportamento implementado como pendência;
- não registrar pendência como se fosse comportamento vigente;
- fechar item apenas após validação real, commit de correção ou decisão explícita;
- mudanças visuais/documentais não exigem migration;
- mudanças de schema, RPC, policy, trigger, bucket, Edge Function ou secret exigem documentação operacional.

---

## 2. Situação consolidada

| Área | Estado |
|---|---|
| `/mapa-familiar` | View vertical principal/default implementada. |
| `/mapa-familiar-horizontal` | View horizontal/genealógica implementada. |
| `/` | Redireciona para `/mapa-familiar`, preservando query string. |
| `/minha-arvore/editar` | Rota vigente de edição do membro. |
| `/minha-arvore`, `/genealogia`, `/visao-completa` | Removidas do roteamento ativo; só podem aparecer como histórico ou keywords. |
| Painel desktop | Implementado sem barra `Filtros | Legendas | Ações`. |
| Modal mobile | Implementado como painel reduzido, sem Zoom/Exportar. |
| Exportação | Implementada para as views oficiais por Área, PNG, PDF e Impressão. |
| Calendário | Implementado com filtros mobile compactos e integração Google Agenda quando configurada. |
| Fórum, notificações e favoritos | Implementados, sujeitos a QA funcional recorrente. |

---

## 3. Itens abertos

### Documentação

#### ID: DOC-001

**Título:** Conferir links cruzados após cada reorganização documental.
**Tipo:** pendência
**Prioridade:** média
**Contexto:** a documentação está distribuída entre guias canônicos, funcionalidades, arquitetura, operação e histórico. Reorganizações parciais podem deixar links quebrados ou documentos históricos parecendo vigentes.
**Evidência:** os guias canônicos referenciam documentos em `docs/funcionalidades/`, `docs/arquitetura/`, `docs/operacao/` e `docs/historico/`.
**Arquivos relacionados:** `docs/README.md`, `docs/historico/README.md`, `docs/funcionalidades/*`, `docs/arquitetura/*`, `docs/operacao/*`.
**Ação recomendada:** antes de remover/mover documento, rodar `rg "NOME_DO_ARQUIVO" docs src README.md` e atualizar links no mesmo commit.
**Status:** aberto.

#### ID: DOC-002

**Título:** Manter clara a diferença entre título funcional e rótulo de navegação da horizontal.
**Tipo:** melhoria
**Prioridade:** baixa
**Contexto:** a view horizontal usa título funcional/exportável `Mapa Genealógico`, mas alguns atalhos podem usar rótulos como `Mapa Familiar Horizontal`.
**Evidência:** a documentação funcional padroniza o título exportável como `Mapa Genealógico`; favoritos/busca podem usar rótulos de navegação.
**Arquivos relacionados:** `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`, `src/app/pages/home/HomeTreeSection.tsx`, `src/app/constants/favoritePages.ts`, `src/app/services/globalSearchService.ts`.
**Ação recomendada:** manter a distinção documentada; se o produto decidir unificar nomes, alterar código e documentação no mesmo lote.
**Status:** aberto.

#### ID: DOC-003

**Título:** Revisar documentos operacionais após qualquer mudança em Supabase, OAuth ou deploy.
**Tipo:** pendência
**Prioridade:** média
**Contexto:** mudanças em migrations, Edge Functions, Storage, service role, secrets e OAuth podem deixar documentação operacional desatualizada.
**Evidência:** documentação operacional separa deploy, migrations, OAuth Google e Storage.
**Arquivos relacionados:** `docs/operacao/*`, `supabase/migrations/*`, `supabase/functions/*`, `vercel.json`.
**Ação recomendada:** em qualquer alteração operacional, atualizar o documento específico e não apenas o inventário técnico.
**Status:** aberto.

---

### Código/arquitetura

#### ID: ARCH-001

**Título:** Criar CI para build, testes unitários e E2E.
**Tipo:** melhoria
**Prioridade:** média
**Contexto:** os comandos existem, mas a validação ainda depende de execução manual quando não há workflow configurado.
**Evidência:** `package.json` declara `vite build`, `vitest run` e `playwright test`.
**Arquivos relacionados:** `package.json`, `.github/workflows/*`.
**Ação recomendada:** criar workflow para PR/push com build e Vitest; Playwright pode ser job separado.
**Status:** backlog.

#### ID: ARCH-002

**Título:** Separar responsabilidades transversais hoje concentradas em `src/main.tsx`.
**Tipo:** refatoração futura
**Prioridade:** média
**Contexto:** o bootstrap do app concentra recuperação de chunk/CSS, atalhos de zoom e limpeza visual de linhas vitais mobile.
**Evidência:** `src/main.tsx` contém lógica global e comportamento específico da árvore.
**Arquivos relacionados:** `src/main.tsx`, `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`.
**Ação recomendada:** extrair comportamentos da árvore para hook/módulo próprio ou documentar explicitamente a responsabilidade transversal até refatoração.
**Status:** aberto.

#### ID: ARCH-003

**Título:** Planejar remoção segura do legado ReactFlow.
**Tipo:** refatoração futura
**Prioridade:** baixa
**Contexto:** ainda existem arquivos ReactFlow/legados que não são views públicas principais, mas podem conter tipos, imports ou compatibilidade.
**Evidência:** inventário técnico classifica essa stack como legado ativo/candidato a remoção controlada.
**Arquivos relacionados:** `src/app/components/FamilyTree/FamilyTree.tsx`, `PersonNode.tsx`, `MarriageNode.tsx`, `GenealogySpouseEdge.tsx`, `nodeTypes.ts`, `edgeTypes.ts`, `treeExport.ts`.
**Ação recomendada:** abrir frente específica de inventário de imports, remoção em lote pequeno, build e E2E.
**Status:** backlog.

---

### Árvore

#### ID: TREE-001

**Título:** Validar visualmente `/mapa-familiar` com dados reais.
**Tipo:** QA visual
**Prioridade:** alta
**Contexto:** a view vertical combina grupos, conectores, paletas, pets, cônjuges, zoom, painel e exportação.
**Evidência:** `/mapa-familiar` usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile.
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`.
**Ação recomendada:** testar 1366, 1440, 1536, 1920, tablet e mobile 320/375/390/430.
**Status:** aberto.

#### ID: TREE-002

**Título:** Validar visualmente `/mapa-familiar-horizontal` com dados reais.
**Tipo:** QA visual
**Prioridade:** alta
**Contexto:** a horizontal depende de gerações, colunas, cônjuges adjacentes, conectores casal → filhos e exportação.
**Evidência:** `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` e `MobileFamilyHorizontalMapView`.
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`.
**Ação recomendada:** validar colunas por geração, conectores, filtros, exportação e mobile por geração.
**Status:** aberto.

#### ID: TREE-003

**Título:** Verificar ausência de cônjuges de `pais`/Geração 4 na horizontal.
**Tipo:** erro | pendência funcional
**Prioridade:** alta
**Contexto:** a regra desejada é que cônjuges de pessoas classificadas como `pais`/Geração 4 apareçam na horizontal quando o filtro `Cônjuges` estiver ativo. No código auditado, os grupos filtráveis não incluem `pais`.
**Evidência:** `FILTERABLE_SPOUSE_ANCHOR_GROUPS` inclui `tios`, `primos`, `sobrinhos`, `filhos` e `netos`, mas não `pais`, em desktop e mobile horizontal.
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`.
**Ação recomendada:** reproduzir com dados reais; se confirmado, incluir `pais` no conjunto apropriado, validar contagens e adicionar teste/QA.
**Status:** aberto.

#### ID: TREE-004

**Título:** Remover dependência de limpeza DOM para ocultar fallback de datas desconhecidas no mobile.
**Tipo:** risco | refatoração futura
**Prioridade:** média
**Contexto:** o contrato visual é não exibir `Nascimento não informado` nem `Falecimento não informado` em cards mobile. Hoje a solução é indireta, via limpeza DOM em `src/main.tsx`.
**Evidência:** `MobileFamilyTreeView.tsx` ainda pode montar fallback textual e `src/main.tsx` remove/oculta as linhas depois.
**Arquivos relacionados:** `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `src/main.tsx`.
**Ação recomendada:** corrigir no componente React em frente própria e remover fallback DOM quando validado.
**Status:** aberto.

#### ID: TREE-005

**Título:** Decidir destino do dropdown `Visualizar como...`.
**Tipo:** decisão necessária
**Prioridade:** média
**Contexto:** o seletor auxilia QA, mas aparece sobre a árvore e não deve ser produto final sem decisão.
**Evidência:** `Home.tsx` renderiza bloco com `data-tree-debug-viewer="true"` e `data-tree-export-ignore="true"`.
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `docs/DECISOES_ARQUITETURAIS.md`.
**Ação recomendada:** remover, esconder por flag/admin ou converter em funcionalidade oficial com UX própria.
**Status:** aberto.

---

### Mobile

#### ID: MOB-001

**Título:** Validar modal mobile de controles em navegadores reais.
**Tipo:** QA visual | QA funcional
**Prioridade:** alta
**Contexto:** o modal tem contrato específico: sem Zoom, sem Restaurar, sem Exportar, com `Grupos` sob demanda.
**Evidência:** `SidebarPanelTabs` muda comportamento quando `mobileControls=true`; `Home` controla abertura/fechamento do modal.
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `src/app/pages/home/SidebarPanelTabs.tsx`, `src/styles/mobile-tree-controls.css`.
**Ação recomendada:** testar Chrome Android, Safari/iOS, 320/375/390/430px, safe area, overlay, scroll interno e destravamento do body.
**Status:** aberto.

#### ID: MOB-002

**Título:** Validar horizontal mobile por geração.
**Tipo:** QA visual | QA funcional
**Prioridade:** alta
**Contexto:** a horizontal mobile deve ter uma geração por tela, botões `Ger X`, swipe lateral e scroll vertical interno.
**Evidência:** `MobileFamilyHorizontalMapView` é renderizado para `/mapa-familiar-horizontal` no mobile.
**Arquivos relacionados:** `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`.
**Ação recomendada:** validar gestos reais, altura de conectores, último card, safe area e ausência de scroll horizontal manual.
**Status:** aberto.

---

### Calendário

#### ID: CAL-001

**Título:** Validar filtros mobile do calendário.
**Tipo:** QA visual
**Prioridade:** alta
**Contexto:** `/calendario-familiar` deve exibir 5 categorias em uma linha no mobile, com bolinha acima do texto.
**Evidência:** `CalendarioFamiliar.tsx` define categorias e `calendar-mobile-category-buttons.css` controla layout compacto.
**Arquivos relacionados:** `src/app/pages/CalendarioFamiliar.tsx`, `src/styles/calendar-mobile-category-buttons.css`.
**Ação recomendada:** validar 320, 375, 390 e 430px, especialmente `Aniversário` e `Falecimento`.
**Status:** aberto.

#### ID: CAL-002

**Título:** Validar Google Agenda após mudanças em calendário/eventos.
**Tipo:** QA funcional | segurança
**Prioridade:** média
**Contexto:** a integração depende de OAuth, services e Edge Functions.
**Evidência:** a página chama services de status, conexão, sincronização e desconexão.
**Arquivos relacionados:** `src/app/pages/CalendarioFamiliar.tsx`, `src/app/services/googleCalendarService.ts`, `docs/operacao/OAUTH_GOOGLE.md`.
**Ação recomendada:** testar conexão, callback, sincronização, desconexão, ausência de tokens no frontend e test users quando aplicável.
**Status:** aberto.

---

### Exportação

#### ID: EXP-001

**Título:** Validar exportação das duas views oficiais.
**Tipo:** QA funcional
**Prioridade:** alta
**Contexto:** exportação deve funcionar por Área, PNG, PDF e Impressão em `/mapa-familiar` e `/mapa-familiar-horizontal`.
**Evidência:** painel dispara `select-area`, `save-image`, `save-pdf` e `print`; views fornecem refs e ações.
**Arquivos relacionados:** `src/app/components/FamilyTree/utils/treeExport.ts`, `TreeAreaSelectionOverlay.tsx`, `HomeTreeSection.tsx`, `SidebarPanelTabs.tsx`.
**Ação recomendada:** testar as quatro ações em ambas as views, com paletas diferentes, filtros e área selecionada.
**Status:** aberto.

#### ID: EXP-002

**Título:** Validar exportação com avatares, SVGs e imagens externas.
**Tipo:** QA funcional | risco
**Prioridade:** média
**Contexto:** `html2canvas` pode falhar ou renderizar SVGs/ícones de forma incorreta.
**Evidência:** `treeExport.ts` contém sanitização/normalização para cores e SVGs.
**Arquivos relacionados:** `src/app/components/FamilyTree/utils/treeExport.ts`, `FamilyTreeVisualCards.tsx`.
**Ação recomendada:** testar pessoas com foto, pessoas sem foto, pets, ícones de nascimento/falecimento e CORS de imagens.
**Status:** aberto.

---

### Perfil/pessoas

#### ID: PERF-001

**Título:** Validar retorno seguro de perfil para as duas views.
**Tipo:** QA funcional
**Prioridade:** média
**Contexto:** `?voltar=` deve aceitar apenas destinos internos seguros e cair no fallback canônico quando inválido.
**Evidência:** perfil aceita retorno para `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`.
**Arquivos relacionados:** `src/app/pages/PersonProfile.tsx`, `src/app/pages/Home.tsx`.
**Ação recomendada:** testar abertura de perfil a partir das duas views, retorno com `?pessoa=...`, rejeição de URL externa e fallback.
**Status:** aberto.

#### ID: PERF-002

**Título:** Validar sugestões de alteração de perfil e permissões.
**Tipo:** QA funcional | segurança
**Prioridade:** média
**Contexto:** perfil combina dados pessoais, vínculos, sugestões, arquivos, eventos e permissões.
**Evidência:** perfil usa services de permissão e sugestões.
**Arquivos relacionados:** `src/app/pages/PersonProfile.tsx`, `src/app/services/personProfileSuggestionService.ts`, `src/app/services/permissionService.ts`.
**Ação recomendada:** testar usuário comum, pessoa vinculada, admin e usuário sem permissão.
**Status:** aberto.

---

### Fórum

#### ID: FORUM-001

**Título:** Rodar smoke test manual do fórum.
**Tipo:** QA funcional
**Prioridade:** média
**Contexto:** fórum inclui tópicos, respostas, reações, favoritos e notificações.
**Evidência:** rotas `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar` existem sob `MemberRoute`.
**Arquivos relacionados:** `src/app/pages/forum/*`, `src/app/services/forumService.ts`.
**Ação recomendada:** validar listagem, criação, edição, abertura de tópico, permissão, favoritos e notificações.
**Status:** aberto.

---

### Notificações

#### ID: NOTIF-001

**Título:** Validar central e preferências de notificações.
**Tipo:** QA funcional
**Prioridade:** média
**Contexto:** notificações dependem de páginas, preferências, logs e eventual dispatch por Edge Functions.
**Evidência:** `/notificacoes`, `/ajustar-notificacoes` e `/admin/notificacoes` existem no roteamento atual.
**Arquivos relacionados:** `src/app/pages/Notificacoes.tsx`, `src/app/pages/AjustarNotificacoes.tsx`, `src/app/pages/admin/AdminNotificacoes.tsx`.
**Ação recomendada:** validar leitura, marcação, preferências e área administrativa.
**Status:** aberto.

---

### Banco/Supabase

#### ID: SUPA-001

**Título:** Manter distinção entre visual/documental e schema.
**Tipo:** risco
**Prioridade:** alta
**Contexto:** mudanças visuais/documentais não exigem migration; alterações de tabelas, RPCs, policies, buckets, triggers ou Edge Functions exigem migration/documentação operacional.
**Evidência:** a documentação operacional separa migrations, Edge Functions, Storage, OAuth e deploy.
**Arquivos relacionados:** `supabase/migrations/*`, `supabase/functions/*`, `docs/operacao/*`.
**Ação recomendada:** exigir migration e revisão operacional quando houver mudança de schema/segurança.
**Status:** aberto.

#### ID: SUPA-002

**Título:** Revisar uso de service role e secrets antes de novas automações.
**Tipo:** segurança
**Prioridade:** alta
**Contexto:** service role e secrets nunca devem aparecer no frontend nem em documentação pública com valores reais.
**Evidência:** integrações operacionais dependem de variáveis como service role, OAuth e chaves de API.
**Arquivos relacionados:** `supabase/functions/*`, `docs/operacao/*`, `.env.example`.
**Ação recomendada:** revisar variáveis por ambiente e manter docs apenas com nomes, nunca valores.
**Status:** aberto.

---

### Operação/deploy

#### ID: OPS-001

**Título:** Rodar validação completa após alterações documentais que mexam em contratos.
**Tipo:** pendência operacional
**Prioridade:** média
**Contexto:** mesmo documentação pode induzir alterações futuras incorretas se divergir do código.
**Evidência:** contratos de rotas, guards e árvore são verificados por build/testes.
**Arquivos relacionados:** `package.json`, `tests/e2e/*`, `docs/*`.
**Ação recomendada:** após alterar docs canônicos, rodar `git diff --check`, `npm run build`, `npm test` e `npm run test:e2e`.
**Status:** aberto.

---

### Refatoração futura

#### ID: REF-001

**Título:** Extrair responsabilidades de `Home.tsx`.
**Tipo:** refatoração futura
**Prioridade:** média
**Contexto:** `Home.tsx` concentra dados, filtros, painel, modais, exportação, debug e seleção de pessoa.
**Evidência:** inventário técnico classifica `Home.tsx` como vigente com dívida alta.
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `src/app/pages/home/*`.
**Ação recomendada:** extrair por domínio em etapas pequenas: estado de filtros, ações de exportação, pessoa central, modal mobile e debug.
**Status:** backlog.

#### ID: REF-002

**Título:** Renomear `SidebarPanelTabs` quando o painel estiver estabilizado.
**Tipo:** refatoração futura
**Prioridade:** baixa
**Contexto:** o componente não representa mais tabs, mas o nome histórico permanece.
**Evidência:** docs funcionais registram que a barra de tabs foi removida.
**Arquivos relacionados:** `src/app/pages/home/SidebarPanelTabs.tsx`.
**Ação recomendada:** renomear em frente própria, por exemplo para `TreeControlPanel`, com busca global e build.
**Status:** backlog.

---

## 4. Itens fechados ou tratados como baseline

Os itens abaixo não devem permanecer como pendências abertas:

| Item | Onde documentar |
|---|---|
| Rotas oficiais da árvore | `BASELINE_PRODUTO_ATUAL.md`, `ROTAS_E_GUARDS.md`, `MAPA_FAMILIAR_VIEW.md` |
| Remoção de `/minha-arvore`, `/genealogia`, `/visao-completa` como views ativas | Baseline, regras de não regressão, arquitetura |
| Matriz de renderização desktop/mobile | Baseline, guia de componentes, mapa familiar |
| Painel sem `Filtros | Legendas | Ações` | Guia UX, painel/conectores |
| Modal mobile sem Zoom/Exportar | Guia UX, painel/conectores |
| Exportação por Área/PNG/PDF/Imprimir | `EXPORTACAO_ARVORE.md` |
| Paletas oficiais | Baseline, UX, inventário |
| Calendário mobile com 5 categorias | Baseline, calendário funcional |

---

## 5. Validação recomendada

Antes de fechar qualquer item:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Para alterações visuais, adicionar QA manual:

```txt
Desktop: 1366, 1440, 1536, 1920
Mobile: 320, 375, 390, 430
Tablet: ao menos um breakpoint intermediário
Browsers: Chrome e Safari/iOS quando houver mobile
```

---

## 6. Regra de atualização deste plano

Adicionar item novo apenas quando houver:

- erro confirmado;
- risco técnico claro;
- decisão pendente;
- QA não executado;
- melhoria futura não implementada;
- lacuna documental real.

Não usar este arquivo como depósito de histórico extenso. Histórico útil deve ir para `docs/historico/`.
