# Decisões arquiteturais — Árvore Família

> Última revisão: 2026-06-22
> Local canônico: `docs/DECISOES_ARQUITETURAIS.md`
> Tipo: registro de decisões estruturais/ADR leve.
> Status: revisado para registrar decisões atuais de mobile, IA, documentação e migrations.

---

## 1. Objetivo

Este documento registra decisões arquiteturais que orientam manutenção, refatoração e revisão documental do projeto **Árvore Família**.

Ele não substitui:

- `docs/BASELINE_PRODUTO_ATUAL.md`, que descreve o estado funcional consolidado;
- `docs/INVENTARIO_TECNICO.md`, que mapeia arquivos e dependências;
- `docs/funcionalidades/*`, que detalham comportamento por área;
- `docs/PLANO_PROXIMOS_PASSOS.md`, que registra pendências, riscos e melhorias futuras.

Regra de leitura:

```txt
Decisão vigente orienta manutenção. Pendência aberta não deve ser descrita como comportamento implementado.
```

---

## 2. Convenções

Cada decisão usa:

| Campo | Uso |
|---|---|
| ID | Identificador estável da decisão. |
| Status | Vigente, pendente, substituída, em avaliação ou histórica. |
| Contexto | Problema que motivou a decisão. |
| Decisão | Regra adotada. |
| Consequências | Impactos práticos e cuidados. |
| Arquivos relacionados | Pontos principais do código/documentação. |

---

## 3. Decisões vigentes

### ADR-001 — Duas views oficiais de árvore

**Status:** vigente.

**Contexto:** o produto já teve rotas e nomenclaturas antigas para views da árvore. Isso gerava divergência entre roteamento, menu, favoritos, busca, testes e documentação.

**Decisão:** manter apenas duas views oficiais:

| View | Rota | Papel |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | view vertical principal/default |
| Mapa Genealógico | `/mapa-familiar-horizontal` | view horizontal/genealógica por gerações |

A rota `/` redireciona para `/mapa-familiar`, preservando `location.search`.

**Rotas antigas removidas do produto ativo:**

```txt
/minha-arvore
/genealogia
/visao-completa
```

Essas rotas só podem aparecer como histórico, termo conceitual ou keyword que redireciona para rota vigente.

**Exceção:** `/minha-arvore/editar` continua vigente como página de edição do membro.

**Consequências:**

- novas alterações de navegação devem preservar `?pessoa=...`;
- favoritos e busca global devem apontar para as rotas oficiais;
- testes E2E devem impedir retorno das rotas antigas como views válidas;
- documentação histórica não pode ser tratada como fonte de verdade vigente.

**Arquivos relacionados:**

```txt
src/app/routes.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/pages/PersonProfile.tsx
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

### ADR-002 — `TreeViewMode` restrito às views atuais

**Status:** vigente.

**Contexto:** o tipo de modo da árvore já carregou nomes antigos ou ambíguos em documentação e prompts.

**Decisão:** `TreeViewMode` deve conter apenas:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Mapeamento vigente:

```txt
mapa-familiar            -> /mapa-familiar
mapa-familiar-horizontal -> /mapa-familiar-horizontal
```

Fallback:

```txt
path desconhecido -> mapa-familiar
```

**Consequências:**

- não criar alias silencioso para `/minha-arvore`, `/genealogia` ou `/visao-completa`;
- qualquer nova view exige mudança coordenada em rotas, navegação, favoritos, busca, testes e documentação;
- alternância Vertical/Horizontal deve preservar query string.

**Arquivos relacionados:**

```txt
src/app/components/FamilyTree/treeViewMode.ts
src/app/routes.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
```

---

### ADR-003 — Renderização por rota e breakpoint no shell da Home

**Status:** vigente.

**Contexto:** a árvore compartilha shell, dados, filtros, painel, modais e exportação, mas precisa renderizar componentes diferentes conforme rota e ambiente.

**Decisão:** `HomeTreeSection` escolhe o componente oficial por `TreeViewMode` e breakpoint:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapFilteredView` | `MobileFamilyHorizontalMapFilteredView` |

**Consequências:**

- a horizontal mobile não é subrota;
- a vertical mobile usa Paterno/Central/Materno;
- a horizontal mobile usa `Ger X`, swipe e scroll vertical interno;
- refatorações devem preservar a matriz de renderização.

**Arquivos relacionados:**

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapFilteredView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapFilteredView.tsx
```

---

### ADR-004 — ReactFlow não é a view pública principal

**Status:** vigente com legado ativo.

**Contexto:** o projeto ainda mantém arquivos relacionados a ReactFlow e grafo legado. As views públicas atuais da árvore são HTML/CSS/SVG próprias.

**Decisão:** preservar código ReactFlow/legado apenas enquanto houver dependência técnica ou até uma frente específica de remoção. Não reintroduzir ReactFlow como view pública principal sem nova decisão arquitetural.

**Consequências:**

- `FamilyTree.tsx`, `PersonNode.tsx`, `MarriageNode.tsx`, `GenealogySpouseEdge.tsx`, `nodeTypes.ts` e `edgeTypes.ts` não devem ser removidos em limpeza genérica;
- utilitários de exportação podem conter seletores de compatibilidade histórica;
- compatibilidade técnica não reativa rotas antigas.

**Arquivos relacionados:**

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/edgeTypes.ts
docs/PLANO_PROXIMOS_PASSOS.md
```

---

### ADR-005 — Painel sem abas `Filtros | Legendas | Ações`

**Status:** vigente.

**Contexto:** o painel antigo por abas criou redundância e dificuldade de manutenção. A UI atual expõe filtros e controles de forma direta.

**Decisão:** não restaurar a barra:

```txt
Filtros | Legendas | Ações
```

O painel desktop deve manter controles compactos, filtros visíveis e flyouts específicos para `Cores`, `Exportar` e `Destacar`.

**Consequências:**

- `activeSidebarPanel` não é contrato de produto;
- `SidebarPanelTabs` mantém nome histórico, mas não deve orientar a volta de tabs;
- legendas futuras, se existirem, devem ser ajuda contextual independente e ignorada pela exportação.

**Arquivos relacionados:**

```txt
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/styles/home-sidebar-unified.css
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

---

### ADR-006 — Modal mobile reduzido, não réplica do desktop

**Status:** vigente.

**Contexto:** controles de desktop como zoom, restauração e exportação não fazem parte do contrato mobile atual.

**Decisão:** o modal mobile de controles deve exibir apenas:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros
```

E não deve exibir:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

**Consequências:**

- `Grupos` abre/fecha cards de grupos sob demanda;
- filtros de status permanecem visíveis;
- modal deve travar scroll do body e manter rolagem interna;
- modal, bottom nav e controles não entram na exportação.

**Arquivos relacionados:**

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/styles/mobile-tree-controls.css
```

---

### ADR-007 — Desktop é referência visual das paletas

**Status:** vigente.

**Contexto:** houve regressões em que o mobile herdava fallback azul/teal mesmo quando outra paleta estava ativa.

**Decisão:** desktop é a referência visual das paletas. Mobile deve consumir os mesmos tokens/contratos visuais, com CSS escopado apenas para adaptação responsiva.

Paletas oficiais:

```txt
white
visual
orange
brown
```

**Consequências:**

- cards, grupos, bordas, conectores, canvas e exportação devem mudar juntos;
- CSS novo deve ser escopado por root/data attribute;
- não usar cores hardcoded como fonte da verdade visual mobile;
- a paleta Visual/Azul pode usar gradientes teal/ciano/azul nos cards.

**Arquivos relacionados:**

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
```

---

### ADR-008 — Exportação por DOM HTML/CSS/SVG com ignoráveis explícitos

**Status:** vigente.

**Contexto:** a exportação precisa cobrir as duas views oficiais sem capturar painel, header, overlays ou debug.

**Decisão:** a exportação deve capturar o root exportável da view ativa ou da área selecionada, preservando título, paleta, cards e conectores. Elementos transitórios devem usar atributos como:

```txt
data-tree-export-ignore="true"
data-tree-export-loading
data-tree-selection-overlay
```

**Consequências:**

- painel, modal mobile, bottom nav, loading, overlays e debug não entram na captura;
- exportação por área funciona como toggle;
- captura grande deve falhar com mensagem clara;
- `treeExport.ts` é utilitário crítico e não deve ser removido em limpezas gerais.

**Arquivos relacionados:**

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeExportLoadingOverlay.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

### ADR-009 — Ajuste visual não altera dados

**Status:** vigente.

**Contexto:** problemas de layout de cônjuges, conectores, pets, grupos ou núcleos conjugais podem induzir soluções erradas via criação de dados artificiais.

**Decisão:** nenhuma correção visual pode criar, editar ou excluir pessoas, relacionamentos, eventos ou metadados no Supabase. Mudanças de dados exigem intenção funcional explícita, migration/RPC quando aplicável e QA de permissões.

**Consequências:**

- não criar relacionamento fictício para desenhar conector;
- não inferir casamento por proximidade visual;
- não persistir geração inferida visualmente;
- mudanças de schema exigem documentação operacional e migration.

**Arquivos relacionados:**

```txt
src/app/services/dataService.ts
src/app/components/FamilyTree/*
supabase/migrations/*
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

### ADR-010 — Integrações sensíveis passam por services/Edge Functions

**Status:** vigente.

**Contexto:** calendário, notificações e outras integrações podem envolver OAuth, secrets e service role.

**Decisão:** componentes de UI não devem acessar secrets nem service role. Integrações sensíveis devem passar por `services` e, quando necessário, Edge Functions com secrets configurados no ambiente Supabase/Vercel.

**Consequências:**

- não expor `SUPABASE_SERVICE_ROLE_KEY`, tokens OAuth ou secrets no frontend;
- mudanças em OAuth/Edge Functions exigem revisão de `docs/operacao/*`;
- limitações de test users do Google OAuth devem ser documentadas como operação, não como regra de UI.

**Arquivos relacionados:**

```txt
src/app/services/googleCalendarService.ts
src/app/services/notificationService.ts
supabase/functions/*
docs/operacao/OAUTH_GOOGLE.md
docs/operacao/DEPLOY.md
```

---

### ADR-011 — `Visualizar como...` é debug temporário

**Status:** decisão pendente registrada.

**Contexto:** o seletor `Visualizar como...` auxilia QA da árvore por pessoa central, mas não deve ser tratado como produto final sem decisão.

**Decisão atual:** pode permanecer apenas como ferramenta temporária de QA/debug, ignorada pela exportação.

**Pendência:** decidir se será removido, protegido por flag/admin ou convertido em funcionalidade oficial.

**Arquivos relacionados:**

```txt
src/app/pages/Home.tsx
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 4. Decisões pendentes ou em avaliação

### PEND-001 — Cônjuges de `pais`/Geração 4 na horizontal

**Status:** pendente.

**Contexto:** a documentação funcional desejava que cônjuges de pessoas classificadas como `pais`/Geração 4 aparecessem na horizontal quando o filtro `Cônjuges` estivesse ativo. No código atual auditado, os grupos filtráveis incluem `tios`, `primos`, `sobrinhos`, `filhos` e `netos`, mas não `pais`.

**Decisão pendente:** confirmar se `pais` deve entrar em `FILTERABLE_SPOUSE_ANCHOR_GROUPS` no desktop e no mobile horizontal.

**Regra documental até correção:** não documentar esse comportamento como implementado. Registrar como pendência `TREE-003`.

---

### PEND-002 — Remoção estrutural do fallback `Nascimento não informado`

**Status:** pendente.

**Contexto:** o contrato visual diz que cards mobile não exibem `Nascimento não informado` nem `Falecimento não informado`. A solução atual depende de limpeza DOM em `src/main.tsx`, o que é funcional, mas indireto.

**Decisão pendente:** mover a regra para o componente React e remover a dependência de manipulação DOM específica da árvore.

**Regra documental até correção:** documentar como contrato visual vigente com dívida técnica `TREE-004`.

---

### PEND-003 — Remoção planejada do legado ReactFlow

**Status:** em avaliação.

**Contexto:** há arquivos ReactFlow ainda presentes. A remoção sem inventário pode quebrar tipos, imports ou compatibilidade de exportação.

**Decisão pendente:** abrir frente específica para auditar dependências e remover em lote seguro, com testes.

---

## 5. Decisões substituídas/históricas

| Decisão antiga | Status atual |
|---|---|
| Usar `/minha-arvore` como view principal | Substituída por `/mapa-familiar`. |
| Usar `/genealogia` como rota horizontal | Substituída por `/mapa-familiar-horizontal`. |
| Usar `/visao-completa` como view ativa | Removida do roteamento ativo. |
| Painel por abas `Filtros | Legendas | Ações` | Substituído por painel direto + flyouts. |
| Mobile horizontal com scroll horizontal manual | Substituído por uma geração por tela. |
| Avatar fallback por gênero | Substituído por `User`; pet usa `PawPrint`. |

---

## 6. Como atualizar este documento

Atualize este documento quando houver:

- nova view oficial;
- mudança de rota;
- mudança de guard/acesso;
- alteração estrutural de árvore, exportação ou painel;
- remoção de legado;
- decisão sobre debug `Visualizar como...`;
- decisão sobre cônjuges de `pais`/Geração 4;
- mudança na estratégia de OAuth, Edge Functions ou secrets.

Validações mínimas após atualização documental:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Se a alteração for somente documental e não tocar código, `git diff --check` e `npm run build` são o mínimo; os testes completos continuam recomendados quando a documentação altera contratos de rotas, árvore ou exportação.

### ADR-012 — Mapas mobile usam contrato composto React + scripts auxiliares

**Status:** vigente com dívida técnica.

**Contexto:** a versão mobile de `/mapa-familiar` foi estabilizada por uma combinação de componentes React, scripts auxiliares DOM/CSS, MutationObservers, handlers de swipe e ajustes visuais carregados pelo `index.html`.

**Decisão:** tratar o comportamento mobile como contrato composto. A fonte vigente é a combinação entre código atual, `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`, `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`, `docs/REGRAS_DE_NAO_REGRESSAO.md` e QA real.

**Consequências:**

- não fazer Prompt 6 ou refatoração visual de mapa mobile sem frente isolada;
- não remover scripts `mobileFamilyMap*`/`mobileFamilyTree*` por limpeza genérica;
- qualquer novo script deve declarar rota, seletor raiz, atributo de escopo e risco de conflito;
- refactor futuro deve migrar comportamento para React/hooks apenas depois de baseline visual aprovada.

**Arquivos relacionados:**

```txt
index.html
src/mobileFamilyMap*.ts
src/mobileFamilyTree*.ts
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/FamilyTree/MobileFamilyMapToolbar.tsx
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
```

---

### ADR-013 — Toolbar mobile principal sem `Exportar` fixo

**Status:** vigente com nuance de implementação.

**Contexto:** a documentação antiga afirmava que o mobile não tinha Exportar; o código atual possui fluxos auxiliares de exportação, mas a toolbar fixa principal renderizada por `MobileFamilyMapToolbar` contém apenas `Formato`, `Cor`, `Filtros`, `Zoom` e `+`.

**Decisão:** documentar separadamente:

| Área | Regra |
|---|---|
| Toolbar fixa principal | não possui item `Exportar` |
| Botão `+` / painel completo | pode conter ações avançadas, inclusive salvar/exportar enquanto implementado |
| `SidebarPanelTabs mobileControls` legado | ainda pode renderizar `Exportar`; remover exige frente de código própria |

**Consequências:**

- não tratar `Exportar` mobile como removido se o código ainda renderiza a ação em fluxos auxiliares;
- não colocar `Exportar` como item fixo obrigatório da toolbar principal;
- todo elemento de exportação mobile deve usar `data-tree-export-ignore`.

---

### ADR-014 — IA não deve inferir parentesco, gênero ou dados privados por nome

**Status:** vigente para futuras alterações; código atual ainda possui dívida.

**Contexto:** há risco de a IA e utilitários auxiliares inferirem pai/mãe por nomes ou sufixos e de contexto da IA incluir telefone/rede social sem filtragem específica.

**Decisão:** respostas assistidas por IA devem usar dados explícitos/cálculo sustentado pelo grafo. Nome, sufixo, gênero presumido, WhatsApp, telefone, endereço e redes sociais não devem ser usados como base de inferência sensível.

**Consequências:**

- `homeAiContext.ts` deve ser revisado em frente própria;
- documentação deve tratar a inferência por nome como risco, não como contrato;
- payloads da IA devem ser minimizados e respeitar permissões de privacidade.

---

### ADR-015 — Fatos históricos sem arquivo não são operação de Storage

**Status:** vigente para a frente de `/arquivos-historicos`.

**Contexto:** o produto passou a aceitar o conceito de fato/memória sem anexo. Isso altera schema e UI, mas não cria objeto no Storage.

**Decisão:** fato histórico sem arquivo deve persistir como registro textual em `arquivos_historicos`, com campos de arquivo nulos quando aplicável. A operação de Storage só entra no escopo quando houver upload real.

**Consequências:**

- `url`, `storage_bucket`, `storage_path` e `mime_type` não devem ser assumidos como obrigatórios depois da migration correspondente;
- scripts de limpeza de Storage não devem apagar ou tentar reconciliar registros sem arquivo;
- migration deve ser aplicada antes do frontend depender do comportamento.
