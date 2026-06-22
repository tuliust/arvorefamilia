# Plano de próximos passos — Árvore Família

> Última revisão: 2026-06-22
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Tipo: backlog técnico/documental vivo
> Status: revisado para consolidar pendências reais de mapas mobile, debug viewer, IA/privacidade, pets em revisão e arquivos históricos sem arquivo.

---

## 1. Objetivo

Este documento registra o que **ainda precisa ser verificado, decidido, corrigido ou melhorado** no projeto.

Ele não deve duplicar:

- documentação funcional consolidada;
- regras de não regressão;
- checklists longos de QA manual;
- procedimentos operacionais completos.

Referências principais:

```txt
docs/BASELINE_PRODUTO_ATUAL.md
docs/GUIA_IMPLEMENTACOES.md
docs/INVENTARIO_TECNICO.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/funcionalidades/*
docs/arquitetura/*
docs/operacao/*
```

Regras:

- não registrar comportamento implementado como pendência;
- não registrar pendência como se fosse comportamento vigente;
- fechar item apenas após validação real, commit de correção ou decisão explícita;
- mudanças visuais/documentais não exigem migration;
- mudanças de schema, RPC, policy, trigger, bucket, Edge Function ou secret exigem documentação operacional;
- procedimentos de QA manual ficam em `docs/QA_MANUAL.md`.

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
| Onboarding do membro | Implementado em cinco etapas, com fluxo condicional para pessoa falecida, revisão final editável e Etapa 4 pulada quando aplicável. |
| Mini Bio e Curiosidades com IA | Implementado em `/meus-dados`; requer QA recorrente de modo padrão e memorial. |
| Revisão de vínculos familiares | Implementada em `/meus-vinculos`; busca pessoa existente, cria familiar, controla estados de análise e solicitação de controle visual/local. |
| QA manual | Centralizado em `docs/QA_MANUAL.md`. |

---

## 3. Itens abertos

### Itens abertos adicionados em 2026-06-22

#### ID: TREE-006

**Título:** Consolidar documentação e QA dos scripts mobile carregados no `index.html`.  
**Tipo:** não regressão | documentação técnica  
**Prioridade:** alta  
**Contexto:** a estrutura mobile dos mapas familiares depende de React + scripts auxiliares carregados diretamente no `index.html`. A lista vigente inclui scripts recentes de Zoom visual, stability lock, cônjuges estendidos, filtros mobile, mapa completo e mosaico.  
**Arquivos relacionados:** `index.html`, `src/mobileFamilyMap*.ts`, `src/mobileFamilyTree*.ts`, `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`, `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`.  
**Ação recomendada:** antes de alterar qualquer script mobile, comparar contra o contrato vigente e executar QA mobile em 320px, 375px, 390px e 430px.  
**Status:** aberto.

#### ID: TREE-007

**Título:** Resolver ambiguidade de `Exportar` no mobile.  
**Tipo:** decisão de produto | QA  
**Prioridade:** média  
**Contexto:** a toolbar fixa mobile expõe `Formato`, `Cor`, `Filtros`, `Zoom` e `+`. O código ainda possui estruturas para exportação em `HomeMobileNav`, mas `Exportar` não é botão fixo da toolbar. O modal `Controles` não deve expor Exportar.  
**Arquivos relacionados:** `src/app/pages/home/HomeMobileNav.tsx`, `src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx`, `src/app/pages/Home.tsx`.  
**Ação recomendada:** decidir se exportação mobile fica apenas no painel completo `+`, se vira fluxo oficial separado ou se permanece oculto.  
**Status:** aberto.

#### ID: AI-001

**Título:** Remover inferência parental por nomes/sufixos do contexto da IA.  
**Tipo:** privacidade | qualidade de dados  
**Prioridade:** alta  
**Contexto:** `homeAiContext.ts` usa `inferParentLabelByName` como fallback para pai/mãe. Isso conflita com a regra de não inferir parentesco por nome quando houver risco.  
**Arquivos relacionados:** `src/app/pages/home/homeAiContext.ts`, `docs/funcionalidades/CURIOSIDADES_E_IA.md`.  
**Ação recomendada:** usar apenas `tipo_relacionamento` explícito ou gênero cadastrado quando disponível; quando não houver dado, responder “não informado”.  
**Status:** aberto.

#### ID: AI-002

**Título:** Filtrar contato e rede social antes de enviar contexto para IA.  
**Tipo:** privacidade | segurança  
**Prioridade:** alta  
**Contexto:** `homeAiContext.ts` inclui telefone e rede social da pessoa selecionada no payload de contexto. O envio deve respeitar permissões de exibição e minimização de dados.  
**Arquivos relacionados:** `src/app/pages/home/homeAiContext.ts`, `src/app/types/index.ts`, `api/ai.ts`.  
**Ação recomendada:** remover esses campos do contexto ou enviá-los somente com checagem explícita de permissões.  
**Status:** aberto.

#### ID: REV-001

**Título:** Separar Pets de Filhos em `/revisao-dados`.  
**Tipo:** correção funcional  
**Prioridade:** alta  
**Contexto:** a revisão final atual agrupa `relationships.filhos` sem filtrar `humano_ou_pet === 'Pet'`. Isso pode fazer pet aparecer como filho humano.  
**Arquivos relacionados:** `src/app/pages/RevisaoDados.tsx`, `src/app/services/dataService.ts`, `src/app/types/index.ts`.  
**Ação recomendada:** filtrar filhos humanos e exibir grupo `Pets` separado; preservar drafts antigos.  
**Status:** aberto.

#### ID: HIST-001

**Título:** Transformar `/arquivos-historicos` em `Fatos e Arquivos Históricos` sem exigir arquivo.  
**Tipo:** melhoria funcional | possível migration  
**Prioridade:** média  
**Contexto:** a UI atual exige título + arquivo/url para adicionar item. Tornar memória/fato sem arquivo exige alteração em componente, service e eventualmente migration para permitir `url`, `storage_bucket`, `storage_path` e `mime_type` nulos.  
**Arquivos relacionados:** `src/app/pages/ArquivosHistoricosPage.tsx`, `src/app/components/ArquivosHistoricos.tsx`, `src/app/services/arquivosHistoricosService.ts`, `supabase/migrations/*`.  
**Ação recomendada:** implementar em lote próprio, com migration mínima se o banco exigir arquivo.  
**Status:** aberto.

#### ID: DB-001

**Título:** Não tornar `participante_ids` obrigatório sem migration aplicada.  
**Tipo:** banco de dados | compatibilidade  
**Prioridade:** média  
**Contexto:** `arquivosHistoricosService.ts` possui fallback para ausência da coluna `participante_ids`. Qualquer regra que torne participantes obrigatórios exige migration, RLS e backfill.  
**Arquivos relacionados:** `src/app/services/arquivosHistoricosService.ts`, `docs/operacao/MIGRATIONS_SUPABASE.md`.  
**Ação recomendada:** manter participantes como opcional até schema confirmado.  
**Status:** aberto.


### Documentação

#### ID: DOC-001

**Título:** Conferir links cruzados após cada reorganização documental.
**Tipo:** pendência
**Prioridade:** média
**Contexto:** a documentação está distribuída entre guias canônicos, funcionalidades, arquitetura, operação, QA e histórico. Reorganizações parciais podem deixar links quebrados ou documentos históricos parecendo vigentes.
**Evidência:** os guias canônicos referenciam documentos em `docs/funcionalidades/`, `docs/arquitetura/`, `docs/operacao/`, `docs/historico/` e `docs/QA_MANUAL.md`.
**Arquivos relacionados:** `docs/README.md`, `docs/QA_MANUAL.md`, `docs/historico/README.md`, `docs/funcionalidades/*`, `docs/arquitetura/*`, `docs/operacao/*`.
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
**Arquivos relacionados:** `package.json`, `.github/workflows/*`, `docs/QA_MANUAL.md`.
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
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar o roteiro de Árvore Familiar vertical em `docs/QA_MANUAL.md`.
**Status:** aberto.

#### ID: TREE-002

**Título:** Validar visualmente `/mapa-familiar-horizontal` com dados reais.
**Tipo:** QA visual
**Prioridade:** alta
**Contexto:** a horizontal depende de gerações, colunas, cônjuges adjacentes, conectores casal → filhos e exportação.
**Evidência:** `/mapa-familiar-horizontal` usa `DesktopFamilyHorizontalMapView` e `MobileFamilyHorizontalMapView`.
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar o roteiro de Mapa Genealógico horizontal em `docs/QA_MANUAL.md`.
**Status:** aberto.

#### ID: TREE-003

**Título:** Verificar ausência de cônjuges de `pais`/Geração 4 na horizontal.
**Tipo:** erro | pendência funcional
**Prioridade:** alta
**Contexto:** a regra desejada é que cônjuges de pessoas classificadas como `pais`/Geração 4 apareçam na horizontal quando o filtro `Cônjuges` estiver ativo. No código auditado, os grupos filtráveis não incluem `pais`.
**Evidência:** `FILTERABLE_SPOUSE_ANCHOR_GROUPS` inclui `tios`, `primos`, `sobrinhos`, `filhos` e `netos`, mas não `pais`, em desktop e mobile horizontal.
**Arquivos relacionados:** `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx`, `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`, `docs/QA_MANUAL.md`.
**Ação recomendada:** reproduzir com dados reais; se confirmado, incluir `pais` no conjunto apropriado, validar contagens e adicionar teste/QA.
**Status:** aberto.

#### ID: TREE-004

**Título:** Remover dependência de limpeza DOM para ocultar fallback de datas desconhecidas no mobile.
**Tipo:** risco | refatoração futura
**Prioridade:** média
**Contexto:** o contrato visual é não exibir `Nascimento não informado` nem `Falecimento não informado` em cards mobile. Hoje a solução é indireta, via limpeza DOM em `src/main.tsx`.
**Evidência:** `MobileFamilyTreeView.tsx` ainda pode montar fallback textual e `src/main.tsx` remove/oculta as linhas depois.
**Arquivos relacionados:** `src/app/components/FamilyTree/MobileFamilyTreeView.tsx`, `src/main.tsx`, `docs/QA_MANUAL.md`.
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
**Arquivos relacionados:** `src/app/pages/Home.tsx`, `src/app/pages/home/SidebarPanelTabs.tsx`, `src/styles/mobile-tree-controls.css`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de modal mobile em `docs/QA_MANUAL.md`.
**Status:** aberto.

#### ID: MOB-002

**Título:** Validar horizontal mobile por geração.
**Tipo:** QA visual | QA funcional
**Prioridade:** alta
**Contexto:** a horizontal mobile deve ter uma geração por tela, botões `Ger X`, swipe lateral e scroll vertical interno.
**Evidência:** `MobileFamilyHorizontalMapView` é renderizado para `/mapa-familiar-horizontal` no mobile.
**Arquivos relacionados:** `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de horizontal mobile em `docs/QA_MANUAL.md`.
**Status:** aberto.

---

### Calendário

#### ID: CAL-001

**Título:** Validar filtros mobile do calendário.
**Tipo:** QA visual
**Prioridade:** alta
**Contexto:** `/calendario-familiar` deve exibir 5 categorias em uma linha no mobile, com bolinha acima do texto.
**Evidência:** `CalendarioFamiliar.tsx` define categorias e `calendar-mobile-category-buttons.css` controla layout compacto.
**Arquivos relacionados:** `src/app/pages/CalendarioFamiliar.tsx`, `src/styles/calendar-mobile-category-buttons.css`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de calendário familiar em `docs/QA_MANUAL.md`.
**Status:** aberto.

#### ID: CAL-002

**Título:** Validar Google Agenda após mudanças em calendário/eventos.
**Tipo:** QA funcional | segurança
**Prioridade:** média
**Contexto:** a integração depende de OAuth, services e Edge Functions.
**Evidência:** a página chama services de status, conexão, sincronização e desconexão.
**Arquivos relacionados:** `src/app/pages/CalendarioFamiliar.tsx`, `src/app/services/googleCalendarService.ts`, `docs/operacao/OAUTH_GOOGLE.md`, `docs/QA_MANUAL.md`.
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
**Arquivos relacionados:** `src/app/components/FamilyTree/utils/treeExport.ts`, `TreeAreaSelectionOverlay.tsx`, `HomeTreeSection.tsx`, `SidebarPanelTabs.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de exportação em `docs/QA_MANUAL.md`.
**Status:** aberto.

#### ID: EXP-002

**Título:** Validar exportação com avatares, SVGs e imagens externas.
**Tipo:** QA funcional | risco
**Prioridade:** média
**Contexto:** `html2canvas` pode falhar ou renderizar SVGs/ícones de forma incorreta.
**Evidência:** `treeExport.ts` contém sanitização/normalização para cores e SVGs.
**Arquivos relacionados:** `src/app/components/FamilyTree/utils/treeExport.ts`, `FamilyTreeVisualCards.tsx`, `docs/QA_MANUAL.md`.
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
**Arquivos relacionados:** `src/app/pages/PersonProfile.tsx`, `src/app/pages/Home.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de perfil e retorno em `docs/QA_MANUAL.md`.
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

### Onboarding do membro

#### ID: ONB-001

**Título:** Validar manualmente o onboarding completo para pessoa viva e pessoa falecida.
**Tipo:** QA funcional | QA visual
**Prioridade:** alta
**Contexto:** o fluxo agora diverge conforme `falecido`: pessoa viva passa por `/preferencias`; pessoa falecida pula essa etapa, desativa notificações e ativa permissões de visualização.
**Evidência:** mudanças recentes envolveram `MeusDados`, `MeusVinculos`, `ArquivosHistoricosPage`, `PreferenciasPage`, `RevisaoDados` e `MemberOnboardingSteps`.
**Arquivos relacionados:** `src/app/pages/MeusDados.tsx`, `src/app/pages/MeusVinculos.tsx`, `src/app/pages/ArquivosHistoricosPage.tsx`, `src/app/pages/PreferenciasPage.tsx`, `src/app/pages/RevisaoDados.tsx`, `src/app/components/member/MemberOnboardingSteps.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar o roteiro de onboarding em `docs/QA_MANUAL.md` nos breakpoints mobile e desktop.
**Status:** aberto.

#### ID: ONB-002

**Título:** Criar cobertura automatizada mínima para o onboarding condicional.
**Tipo:** teste futuro
**Prioridade:** média
**Contexto:** o comportamento depende de estado da pessoa, navegação entre rotas, defaults de preferências e exibição condicional de boxes.
**Evidência:** regressões visuais e de navegação foram detectadas manualmente durante ajustes.
**Arquivos relacionados:** `tests/e2e/*`, `src/app/pages/*`, `docs/REGRAS_DE_NAO_REGRESSAO.md`.
**Ação recomendada:** criar smoke E2E para pessoa viva e pessoa falecida, cobrindo Etapas 1 a 5 e navegação direta para `/preferencias`.
**Status:** backlog.

#### ID: ONB-003

**Título:** Criar documentação funcional dedicada para onboarding e arquivos históricos.
**Tipo:** documentação
**Prioridade:** média
**Contexto:** o comportamento do onboarding ficou grande o suficiente para merecer documentos funcionais próprios, além dos guias gerais.
**Evidência:** regras de pessoa viva/falecida, modal de vínculos, rascunho de arquivos e revisão inline estão hoje distribuídas entre vários guias.
**Arquivos relacionados:** `docs/funcionalidades/ONBOARDING_MEMBRO.md`, `docs/funcionalidades/ARQUIVOS_HISTORICOS.md`, `docs/README.md`.
**Ação recomendada:** criar os dois documentos em frente documental específica e apontar o índice para eles.
**Status:** aberto.

#### ID: ONB-004

**Título:** Validar persistência temporária de arquivos históricos em navegadores reais.
**Tipo:** QA funcional
**Prioridade:** média
**Contexto:** a Etapa 3 preserva rascunho local quando usuário troca aba, minimiza ou recarrega antes de salvar.
**Evidência:** comportamento depende de armazenamento local e manipulação de arquivos no browser.
**Arquivos relacionados:** `src/app/components/ArquivosHistoricos.tsx`, `src/app/pages/ArquivosHistoricosPage.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** testar Chrome desktop, aba anônima e pelo menos um navegador mobile quando possível.
**Status:** aberto.



#### ID: ONB-005

**Título:** Persistir solicitação de controle de perfil e criar análise administrativa.
**Tipo:** evolução funcional | banco | admin
**Prioridade:** alta
**Contexto:** `/meus-vinculos` permite solicitar controle de perfil e exibir `Controle em análise`, mas a solicitação pode permanecer como estado local/draft visual até existir fluxo administrativo definitivo.
**Evidência:** a experiência já possui botão, modal, justificativa e badge, mas a governança futura exige persistência, RLS/policies e tela ou fila de aprovação.
**Arquivos relacionados:** `src/app/pages/MeusVinculos.tsx`, `src/app/pages/meus-vinculos/ProfileControlRequestDialog.tsx`, `src/app/services/memberProfileService.ts`, `docs/operacao/MIGRATIONS_SUPABASE.md`, `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`.
**Ação recomendada:** desenhar tabela/solicitação persistente, definir regras de aprovação, atualizar admin, RLS e documentação operacional antes de ativar como fluxo definitivo.
**Status:** backlog.

#### ID: ONB-006

**Título:** Validar visualmente a revisão de vínculos após remoção do painel lateral.
**Tipo:** QA visual | QA funcional
**Prioridade:** alta
**Contexto:** `/meus-vinculos` foi simplificada para largura total, com cards-resumo como âncoras, botão final no rodapé, badges `Pré-cadastrado`/`Ativo` e remoção compacta por ícone.
**Evidência:** validações automáticas passaram, mas a checagem visual em browser in-app foi limitada por sandbox Windows em execuções anteriores.
**Arquivos relacionados:** `src/app/pages/MeusVinculos.tsx`, `src/app/pages/meus-vinculos/*`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar QA manual real em desktop e nos breakpoints 320px, 375px, 390px e 430px, incluindo busca, criação, remoção, desfazer, controle de perfil e pré-seleção de outro pai/mãe.
**Status:** aberto.

#### ID: ONB-007

**Título:** Criar documento funcional dedicado para `/meus-vinculos`.
**Tipo:** documentação
**Prioridade:** média
**Contexto:** a Etapa 2 ganhou busca de pessoa existente, estados de análise, solicitação de controle e componentes próprios; o comportamento merece documento canônico em `docs/funcionalidades/`.
**Evidência:** regras hoje estão distribuídas entre guias gerais e QA.
**Arquivos relacionados:** `docs/funcionalidades/MEUS_VINCULOS.md`, `docs/README.md`, `docs/GUIA_IMPLEMENTACOES.md`, `docs/GUIA_COMPONENTES.md`.
**Ação recomendada:** manter `MEUS_VINCULOS.md` sincronizado sempre que a feature mudar.
**Status:** aberto.

### Fórum

#### ID: FORUM-001

**Título:** Rodar smoke test manual do fórum.
**Tipo:** QA funcional
**Prioridade:** média
**Contexto:** fórum inclui tópicos, respostas, reações, favoritos e notificações.
**Evidência:** rotas `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar` existem sob `MemberRoute`.
**Arquivos relacionados:** `src/app/pages/forum/*`, `src/app/services/forumService.ts`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de fórum em `docs/QA_MANUAL.md`.
**Status:** aberto.

---

### Notificações

#### ID: NOTIF-001

**Título:** Validar central e preferências de notificações.
**Tipo:** QA funcional
**Prioridade:** média
**Contexto:** notificações dependem de páginas, preferências, logs e eventual dispatch por Edge Functions.
**Evidência:** `/notificacoes`, `/ajustar-notificacoes` e `/admin/notificacoes` existem no roteamento atual.
**Arquivos relacionados:** `src/app/pages/Notificacoes.tsx`, `src/app/pages/AjustarNotificacoes.tsx`, `src/app/pages/admin/AdminNotificacoes.tsx`, `docs/QA_MANUAL.md`.
**Ação recomendada:** executar roteiro de notificações em `docs/QA_MANUAL.md`.
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

## 4. Backlog de refatoração futura

| ID | Frente | Prioridade | Observação |
|---|---|---:|---|
| REF-001 | Extrair responsabilidades de `Home.tsx` | média | Separar dados, filtros, painel, modais, exportação, debug e seleção de pessoa. |
| REF-002 | Renomear `SidebarPanelTabs` | baixa | O componente não representa mais tabs; possível nome futuro: `TreeControlPanel`. |
| REF-003 | Compartilhar view model entre horizontal desktop/mobile | média | Reduz divergência estrutural entre as duas renderizações. |
| REF-004 | Remover legado ReactFlow com segurança | baixa | Exige inventário de imports, testes e validação de exportação. |
| REF-005 | Extrair limpeza DOM de datas desconhecidas do `main.tsx` | média | Relacionado a `TREE-004`. |

---

## 5. Como fechar um item

Para fechar qualquer item deste plano:

1. identificar commit ou decisão explícita;
2. executar validação aplicável;
3. registrar evidência;
4. atualizar documentação canônica afetada;
5. remover, arquivar ou marcar o item como concluído.

Checklist de fechamento:

```txt
Item:
Commit:
Validação automática:
QA manual:
Documento atualizado:
Resultado:
Pendências restantes:
```

Procedimentos de QA manual ficam em:

```txt
docs/QA_MANUAL.md
```

<!-- PENDENCIAS-LEVANTAMENTO-2026-06-18 -->
## Pendências e verificações herdadas do levantamento recente

Estas frentes aparecem no levantamento como scripts gerados, execução não confirmada, tentativa falha, visual sugerido por print ou decisão pendente. Elas não devem ser registradas como baseline até verificação no código/Git.

### Verificar antes de documentar como implementado

- Contagem de cônjuges no `/mapa-familiar-horizontal`.
- Reorganização de `/pessoa/:id` com timeline lateral.
- Relacionamentos abaixo de acontecimentos históricos.
- Textos narrativos da timeline.
- Remoção de badge secundária e “Data desconhecida” da timeline.
- Subida de grupos no mapa familiar vertical quando a árvore for esparsa.
- `/meus-favoritos` com botão Filtros.
- `/meus-favoritos` com estrela ativa para remover favorito.
- Header e `/notificacoes` com contador de não lidas, textos e datas.
- Ocultação de contato/privacidade de falecidos no admin.
- Fase 2 de `/minha-arvore/editar`.
- Edição de casamento/cônjuge sob demanda.
- Separação de containers em `/minha-arvore/editar`.
- Painéis, popovers, toolbar mobile e exportação da árvore quando não houver commit confirmado.

### Bloqueado para revisão operacional

- Reset ampliado de perfil admin removendo mini bio, curiosidades, arquivos históricos e usuário em `auth.users`.

Motivo:

- envolve Supabase;
- envolve RPC/migration;
- pode afetar dados sensíveis e autenticação;
- não deve ser aplicado por script documental;
- só deve entrar em `docs/operacao/MIGRATIONS_SUPABASE.md` se houver migration real confirmada.

### Comandos recomendados para verificação

```powershell
git log --oneline -- src/app/pages/MeusFavoritos.tsx
git log --oneline -- src/app/pages/Notificacoes.tsx
git log --oneline -- src/app/components/Timeline/PersonTimeline.tsx
git log --oneline -- src/app/pages/PersonProfile.tsx
git log --oneline -- src/app/pages/MinhaArvore.tsx
git log --oneline -- src/app/pages/admin/AdminPessoaForm.tsx
```

<!-- RODADA2-PENDENCIAS-2026-06-18 -->
## Pendências remanescentes — segunda rodada

### Coordenadas e rota familiar

A frente de Curiosidades implementou cálculo de rota com coordenadas quando disponíveis, mas ainda exige consolidação da fonte canônica de coordenadas.

Pendências:

- definir se latitude/longitude vêm de autocomplete, tabela de cidades, backfill ou geocoding;
- normalizar cidades já cadastradas;
- tratar variações de grafia;
- resolver cidades homônimas por UF/país;
- garantir preservação de coordenadas ao salvar cidade de residência;
- validar massa real com:
  - nenhuma coordenada;
  - uma cidade coordenada;
  - duas ou mais cidades coordenadas;
  - cidade brasileira;
  - cidade no exterior.

### Curiosidades

- Evoluir compartilhamento de descobertas para o fórum, se essa for a decisão de produto.
- Encerrar/atualizar issue técnica da rodada, se existir.
- Manter testes de utilitários atualizados quando novos cálculos forem adicionados.

### Mapas e painel

- Executar QA visual mobile em 320px, 375px, 390px e 430px.
- Confirmar que popovers da toolbar não extrapolam a largura.
- Confirmar que desktop/tablet não foram afetados pelos PRs mobile.
- Validar exportação por Área, Imagem, PDF e Imprimir.
- Confirmar comportamento do botão `+` e do painel mobile completo.

### Painel/header

- Confirmar se o painel lateral compacto atende visualmente ao alvo final.
- Confirmar se exportação ficou no local final previsto.
- Registrar qualquer divergência visual em `QA_POS_CONSOLIDACAO_2026_06_18.md`.

### Notificações

- Se o contador de não lidas no header ainda não estiver implementado, manter como pendência separada.
- Não confundir a simplificação visual dos cards com implementação de contador global.

### Admin e pessoa falecida

- A decisão sobre ocultar ou manter contato/privacidade de pessoa falecida no admin ainda deve refletir o código atual antes de virar regra definitiva.

## Atualização 2026-06-22 — Pendências após fechamento funcional

### Concluído neste ciclo

- Mapa familiar desktop: dropdown, tour, cadastrados, layout compacto.
- Questionário e geração de Mini Bio/Curiosidades.
- Pets separados de filhos.
- Cônjuge ativo único no estado local.
- Fatos sem arquivo integrados à timeline.
- Headers de onboarding sem ações.
- Limite de 500 caracteres para textos de perfil.

### Pendências recomendadas

1. QA visual completo em mobile e desktop para `/meus-dados` e `/meus-vinculos`.
2. Confirmar em produção/preview que migrations foram aplicadas.
3. Validar RLS de `user_person_links`, `person_profile_questionnaire_answers` e `arquivos_historicos`.
4. Avaliar typecheck dedicado (`tsc --noEmit`) para capturar erros como import ausente de ícone.
5. Definir se o seletor `Visualizar como...` do mapa vira recurso final ou permanece debug/QA (`TREE-005`).
