# Decisões arquiteturais — Árvore Família

> Local canônico sugerido: `docs/DECISOES_ARQUITETURAIS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: decisões vigentes da baseline atual  
> Objetivo: impedir reversões acidentais e registrar justificativas técnicas/produto

---

## 1. Como usar este documento

Este documento registra decisões que devem ser respeitadas em futuras implementações.

Regras:

- não alterar uma decisão sem registrar nova decisão, motivo e impacto;
- não usar documentação histórica para reverter decisões vigentes;
- mudanças funcionais devem atualizar documentação e testes no mesmo ciclo;
- exceções temporárias precisam ter condição de expiração ou migração.

Formato recomendado para novas decisões:

```txt
ID: ADR-XXX
Decisão:
Contexto:
Motivo:
Impacto:
Arquivos afetados:
Validações obrigatórias:
Status:
```

---

## ADR-001 — A árvore possui apenas duas views oficiais

**Status:** vigente  
**Data de referência:** baseline após remoção das rotas antigas da árvore

### Decisão

Manter apenas duas views principais de árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

A rota `/mapa-familiar` é a view default.

### Contexto

O produto já teve múltiplas views:

```txt
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
```

A experiência foi simplificada para reduzir redundância, confusão de navegação, dívida de painel e documentação duplicada.

### Impacto

Não devem existir como rotas ativas de árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### Exceção

A rota abaixo permanece vigente:

```txt
/minha-arvore/editar
```

Ela é edição de membro, não view de árvore.

### Validações

```bash
rg "/minha-arvore|/genealogia|/visao-completa" src docs tests
npm run build
npm run test:e2e
git diff --check
```

Interpretação: `/minha-arvore/editar` e `docs/historico/` podem permanecer.

---

## ADR-002 — `TreeViewMode` deve conter apenas dois modos

**Status:** vigente

### Decisão

`TreeViewMode` deve ser restrito a:

```txt
mapa-familiar
mapa-familiar-horizontal
```

### Motivo

O tipo é usado para decidir renderização, navegação, troca de view e fallback. Manter modos antigos no tipo cria risco de reintrodução acidental de rotas removidas.

### Impacto

Arquivos que devem permanecer sincronizados:

```txt
src/app/components/FamilyTree/treeViewMode.ts
src/app/routes.tsx
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
```

### Regra

Qualquer nova view futura exige alteração planejada em código, testes e docs. Não criar modo novo apenas para resolver condicional local.

---

## ADR-003 — `/` redireciona para `/mapa-familiar` preservando search params

**Status:** vigente

### Decisão

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`.

### Motivo

`?pessoa=...` é usado para foco/seleção de pessoa na árvore. Perder query string quebra deep links e retorno contextual.

### Validações

- `/` → `/mapa-familiar`;
- `/?pessoa=abc` → `/mapa-familiar?pessoa=abc`;
- alternância vertical/horizontal preserva query string.

---

## ADR-004 — A horizontal é view oficial e também página favoritável/buscável

**Status:** vigente

### Decisão

`/mapa-familiar-horizontal` é:

- rota oficial;
- item em favoritos de página;
- resultado de busca global;
- opção de alternância no painel.

### Motivo

A horizontal é uma experiência própria, não apenas estado interno da vertical.

### Regra

Favorito de página salva a rota canônica:

```txt
/mapa-familiar-horizontal
```

Não salva geração ativa, zoom, filtros ou estado transitório mobile.

---

## ADR-005 — A horizontal mobile é comportamento interno da mesma rota

**Status:** vigente

### Decisão

Não existe rota separada para horizontal mobile.

A rota continua:

```txt
/mapa-familiar-horizontal
```

O componente mobile oficial é:

```txt
MobileFamilyHorizontalMapView
```

### Motivo

A diferença é de breakpoint/UX, não de navegação.

### Regra

Não criar subrotas como:

```txt
/mapa-familiar-horizontal/mobile
/mapa-familiar-horizontal/geracao/:id
```

sem decisão específica de produto.

---

## ADR-006 — `FamilyTree.tsx` é legado ativo até extração de contratos

**Status:** vigente com dívida

### Decisão

Não remover `FamilyTree.tsx` enquanto ele ainda fornecer contratos, tipos ou ações consumidas por views oficiais.

### Motivo

O renderer ReactFlow antigo pode não estar montado como view pública, mas parte do stack ainda sustenta tipos, grafos, layouts e ações.

### Ação futura

Extrair `FamilyTreeActions` para arquivo neutro:

```txt
src/app/components/FamilyTree/actions.ts
```

Depois disso, reavaliar remoção do renderer legado em projeto próprio.

---

## ADR-007 — `directFamilyDistributedLayout` e `genealogyColumnsLayout` são dependências vigentes

**Status:** vigente

### Decisão

Preservar:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

### Motivo

Mesmo que tenham nomes associados a estruturas antigas, ainda fornecem helpers ou ordenação para views oficiais, especialmente a horizontal.

### Regra

Não remover por busca textual sem análise de imports e build.

---

## ADR-008 — Exportação é funcionalidade crítica das duas views oficiais

**Status:** vigente

### Decisão

Manter exportação para:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

com ações:

- Área;
- Imagem/PNG;
- PDF;
- Imprimir.

### Motivo

Exportação é parte funcional do produto, não utilitário secundário.

### Regra

Não alterar `treeExport.ts`, `TreeAreaSelectionOverlay`, refs de exportação ou CSS de captura sem testes manuais.

### QA obrigatório

- exportar PNG na vertical;
- exportar PDF na vertical;
- imprimir vertical;
- exportar área vertical;
- repetir na horizontal;
- testar mobile quando aplicável.

---

## ADR-009 — O painel ainda será simplificado, mas controles superiores são preservados

**Status:** pendente de implementação

### Decisão vigente

Hoje o painel mantém:

- controles superiores;
- alternância Vertical/Horizontal;
- Cores;
- Exportar;
- Destacar;
- abas `Filtros | Legendas | Ações`.

### Decisão de produto planejada

Remover as abas:

```txt
Filtros
Legendas
Ações
```

### Regra para a próxima frente

A simplificação do painel deve preservar:

- Zoom +/−;
- Restaurar/Fit;
- Vertical;
- Horizontal;
- Cores;
- Exportar;
- Destacar;
- painel mobile como modal;
- filtros/grupos diretamente visíveis.

---

## ADR-010 — CSS legado deve ser removido por seletor, não por arquivo inteiro

**Status:** vigente

### Decisão

Arquivos CSS mistos não devem ser removidos apenas porque têm nome antigo ou contêm seletores legados.

### Motivo

Alguns arquivos misturam:

- estilos oficiais da vertical/horizontal;
- estilos mobile vigentes;
- aliases antigos;
- CSS de ReactFlow legado;
- CSS de edição `/minha-arvore/editar`.

### Regra

Limpeza de CSS deve seguir:

1. localizar seletor;
2. confirmar uso no DOM atual;
3. testar visualmente;
4. remover em commit pequeno;
5. rodar build, E2E e QA visual.

---

## ADR-011 — `/minha-arvore/editar` permanece por compatibilidade funcional

**Status:** vigente

### Decisão

Preservar `/minha-arvore/editar`.

### Motivo

A rota é usada para edição de membro e não representa a view removida `/minha-arvore`.

### Regra

Buscas por `/minha-arvore` devem distinguir:

```txt
/minha-arvore      -> removida
/minha-arvore/editar -> vigente
```

---

## ADR-012 — Guards de frontend não substituem RLS/RPC

**Status:** vigente

### Decisão

Manter proteção em múltiplas camadas:

- guards no frontend;
- services;
- RLS;
- RPCs seguras;
- permissões no banco.

### Motivo

UI escondida não é controle de segurança.

### Regra

Rotas admin usam `ProtectedRoute`, mas dados administrativos também devem depender de `permissionService`, RLS ou RPC.

---

## ADR-013 — Preferências e compatibilidades antigas só saem com plano de migração

**Status:** vigente

### Decisão

Não remover compatibilidades de dados, localStorage, gênero, pets, base64/data URL ou notificações sem plano.

### Motivo

Dados antigos podem estar persistidos em Supabase, storage, localStorage ou registros de usuário.

### Regra

Toda remoção de compatibilidade deve responder:

- quais dados antigos existem?
- há migration?
- há fallback seguro?
- há teste?
- há prazo de expiração?

---

## ADR-014 — Documentação canônica deve acompanhar mudanças funcionais

**Status:** vigente

### Decisão

Mudança funcional relevante deve atualizar docs canônicos no mesmo ciclo.

### Motivo

Documentação desatualizada já gerou risco de restaurar rotas antigas.

### Arquivos prioritários

```txt
README.md
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/DECISOES_ARQUITETURAIS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/arquitetura/ARCHITECTURE.md
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

## ADR-015 — Histórico não é fonte de verdade para implementação atual

**Status:** vigente

### Decisão

`docs/historico/` preserva rastreabilidade, mas não substitui documentação canônica.

### Regra

Se uma informação histórica ainda for regra vigente, ela deve ser migrada para um guia canônico atual antes de arquivar o documento antigo.

---

## 2. Decisões futuras a registrar

As seguintes frentes devem gerar novas ADRs ou atualizar este documento:

1. remoção do renderer ReactFlow legado;
2. padronização de aliases `/pessoa/:id` e `/pessoas/:id`;
3. padronização `/admin` e `/admin/dashboard`;
4. decisão sobre relação entre favoritos e estados de filtros;
5. extração de `Home.tsx` em hooks/domínios;
6. implantação de CI/lint/typecheck;
7. política de expiração de compatibilidades antigas.

