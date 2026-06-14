# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: plano vivo revisado após consolidação das views `/mapa-familiar` e `/mapa-familiar-horizontal`, correções de exportação, atualização documental dos lotes recentes e reclassificação das pendências reais.

---

## Objetivo

Este documento registra apenas:

- pendências reais;
- QA visual ou funcional ainda aberto;
- divergências entre documentação e implementação;
- decisões futuras que exigem validação;
- pontos que não devem ser tratados como concluídos sem teste real;
- ações de refatoração ou produto que não pertencem aos guias canônicos.

O estado implementado deve ficar em:

```txt
docs/GUIA_IMPLEMENTACOES.md
```

---

## 1. Situação atual das views

| View | Rota | Estado |
|---|---|---|
| Mapa Familiar Vertical | `/mapa-familiar` | Implementada; rota default de `/`; usa `DesktopFamilyMapView` no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | Implementada; usa `DesktopFamilyHorizontalMapView`, colunas por geração, conectores SVG e painel compartilhado. |
| Minha Árvore | `/minha-arvore` | Implementada; ReactFlow no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Genealogia | `/genealogia` | Implementada; ReactFlow por gerações; chips mobile. |
| Visão Completa | `/visao-completa` | Implementada; ReactFlow por gerações com base completa. |

Rotas experimentais removidas:

```txt
/mapa-horizontal
/visao-completa-teste
```

Estado técnico consolidado:

- `/` redireciona para `/mapa-familiar`;
- `TreeViewMode` contém cinco views oficiais;
- `TreeHomeShell` envolve as rotas de árvore;
- `/mapa-familiar-horizontal` é rota oficial e protegida por `TreeAccessRoute`;
- painel desktop mostra **Vertical** e **Horizontal**;
- mobile não usa toggle Vertical/Horizontal;
- `/mapa-familiar-horizontal` mobile tem barra visual `Paterno | Central | Materno`;
- `MobileTreeControlsPortal` não renderiza em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- exportação dos Mapas Familiares foi corrigida tecnicamente para título, loading, impressão, seleção por área e SVGs/avatares;
- QA manual autenticado ainda é necessário.

---

## 2. Pendências abertas

| ID | Área | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| DOC-014 | `/mapa-familiar` | QA visual/manual | Validar alinhamento panorâmico, conectores, grupos laterais, modo painel colapsado, centralização, colisões, margens, exportação e paletas com dados reais. | Aberto |
| DOC-025 | `/mapa-familiar-horizontal` | QA visual/manual | Validar colunas ativas, colunas vazias ocultadas, cônjuges adjacentes, conectores casal → filhos, distribuição de troncos, filhos por nascimento, filtros e exportação. | Aberto |
| DOC-026 | Pets | Bug/QA funcional | Confirmar se `directRelativeFilters.pets` funciona como filtro de grupo independente de `personFilters.pets` nas views que suportam grupo Pets. | Aberto |
| DOC-027 | `/mapa-familiar-horizontal` mobile | Produto/UX | Definir comportamento real dos botões `Paterno`, `Central` e `Materno`. Hoje a barra é visual e `Central` fica ativo por padrão. | Aberto |
| DOC-028 | Mobile Safari/iOS | QA visual | Validar posição da barra e do botão de controle em iOS/Safari nos breakpoints 320, 375, 390 e 430px. | Aberto |
| DOC-029 | Exportação | QA funcional pós-correção | Validar PNG, PDF, impressão e Área de `/mapa-familiar` e `/mapa-familiar-horizontal`, incluindo título, loading, conectores, paletas e avatares. | Implementado tecnicamente; QA aberto |
| DOC-030 | Documentação cruzada | Documentação/QA | Conferir links cruzados após aplicar todos os lotes documentais. | Aberto |
| DOC-031 | Busca/favoritos | Produto | Decidir se `/mapa-familiar-horizontal` deve entrar em `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES` como página própria. | Aberto |
| DOC-032 | Legenda na horizontal | UX/consistência | Verificar se a aba Legendas deve receber `directRelativeFilters` também em `/mapa-familiar-horizontal`, já que o painel de filtros atua na horizontal. | Aberto |
| DOC-033 | Exportação ReactFlow pós-ajustes | QA regressão | Revalidar `/minha-arvore`, `/genealogia` e `/visao-completa` depois das mudanças em `treeExport.ts`. | Aberto |

Regras:

- não duplicar esta tabela em outros documentos;
- documentos funcionais podem citar o contexto, mas o controle de pendências fica aqui;
- fechar apenas após validação real, decisão explícita ou commit de correção;
- alteração de schema exige migration e atualização em `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 3. Itens fechados, obsoletos ou reclassificados

| ID | Frente | Resultado | Status |
|---|---|---|---|
| EXP-001 | `/mapa-horizontal` | Rota experimental removida. | Obsoleto/removido |
| EXP-002 | `/visao-completa-teste` | Rota experimental removida. | Obsoleto/removido |
| EXP-003 | Botão Horizontal → `/visao-completa` | Substituído por `/mapa-familiar-horizontal`. | Concluído |
| HMAP-001 | Cônjuges na horizontal | Linha vertical entre cônjuges implementada. | Concluído tecnicamente; QA aberto |
| HMAP-002 | Casal → filhos | Tronco horizontal/vertical e ramais implementados. | Concluído tecnicamente; QA aberto |
| HMAP-003 | Colunas vazias | Colunas sem cards visíveis ocultadas. | Concluído tecnicamente; QA aberto |
| HMAP-004 | Cônjuges colaterais | Cônjuges de tios, primos, sobrinhos, filhos e netos seguem regra de filtro. | Concluído tecnicamente; QA aberto |
| MOB-001 | Toggle Vertical/Horizontal mobile | Removido nas rotas do Mapa Familiar. | Concluído |
| MOB-002 | Botão de controle mobile | Alinhado à faixa superior das views de mapa. | Concluído tecnicamente; QA iOS aberto |
| EXP-004 | Loading de exportação | Implementado e revisado para não sumir cedo demais. | Concluído tecnicamente; QA aberto |
| EXP-005 | Título na exportação | Canvas passa a incluir título da view. | Concluído tecnicamente; QA aberto |
| EXP-006 | Avatares/SVGs na exportação | Tratamento de SVGs e classes semânticas aplicado. | Concluído tecnicamente; QA aberto |

---

## 4. QA prioritário

### 4.1 Mapa Familiar Vertical

Rota:

```txt
/mapa-familiar
```

Breakpoints:

```txt
1366x768
1440x900
1536x864
1920x1080
768px a 1023px
320px
375px
390px
430px
```

Checklist:

- abre como view padrão a partir de `/`;
- título `Mapa Familiar de {nome}`;
- botão **Horizontal** navega para `/mapa-familiar-horizontal`;
- painel desktop não corta controles;
- cônjuge principal aparece;
- cônjuges ancestrais aparecem;
- cônjuges colaterais dependem de **Cônjuges**;
- filtro Pets de grupo funciona, se implementado;
- filtro Pets de status/tipo funciona;
- `Destacar > Linhas` oculta conectores;
- `Destacar > Grupos` oculta molduras/títulos e labels `PAI`, `MÃE`, `CÔNJUGE`;
- conectores continuam coerentes quando grupos estão sem chrome;
- `Restaurar visualização` reseta zoom/scroll;
- exportação por Área cobre laterais;
- PNG/PDF/impressão incluem título;
- avatares não viram quadrados pretos;
- painel/header/overlay/loading não entram no artefato.

### 4.2 Mapa Familiar Horizontal

Rota:

```txt
/mapa-familiar-horizontal
```

Checklist:

- título `Genealogia de {nome}`;
- botão **Vertical** retorna para `/mapa-familiar`;
- `manual_generation` define colunas quando válido;
- valores fora de 1 a 6 são limitados;
- colunas vazias somem;
- filhos de casal ficam do mais velho ao mais novo;
- cônjuges ficam em linhas consecutivas;
- linha vertical entre cônjuges aparece;
- tronco casal → filhos aparece quando há filhos visíveis;
- múltiplos troncos no mesmo gap não ficam sobrepostos;
- filhos invisíveis por filtro não recebem linha;
- cônjuges de tios/primos/sobrinhos/filhos/netos obedecem **Cônjuges**;
- cônjuge central e ancestrais permanecem;
- `Destacar > Grupos` oculta cabeçalhos `Geração X` e recalcula layout;
- cards respeitam paletas;
- exportação preserva colunas e conectores;
- título aparece na exportação;
- avatares/SVGs aparecem corretamente.

### 4.3 Minha Árvore

Rota:

```txt
/minha-arvore
```

Checklist:

- desktop/tablet usa ReactFlow;
- mobile usa `MobileFamilyTreeView`;
- filtros diretos funcionam no desktop/tablet;
- filtros de status/tipo funcionam;
- `MobileTreeControlsPortal` aparece no mobile;
- não há duplicidade com painel do HomeMobileNav;
- exportação ReactFlow funciona após mudanças em `treeExport.ts`;
- card central mobile não exibe `VOCÊ`;
- linhas vitais mobile exibem só ano;
- avatares por `genero`.

### 4.4 Genealogia e Visão Completa

Rotas:

```txt
/genealogia
/visao-completa
```

Checklist:

- ReactFlow renderiza;
- chips mobile aparecem apenas nessas rotas;
- chips focam, não filtram destrutivamente;
- pílulas `Geração N` continuam com fundo escuro;
- cards não herdam visual do Mapa Familiar;
- exportação ReactFlow funciona;
- bottom nav não cobre controles.

---

## 5. Pendência específica: filtro Pets

### Problema

O projeto possui dois conceitos com o mesmo rótulo:

- Pets como status/tipo (`personFilters.pets`);
- Pets como grupo direto (`directRelativeFilters.pets`).

### Ação recomendada

Revisar:

```txt
src/app/pages/Home.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Critério de aceite:

- desligar Pets em status/tipo remove pets de todos os escopos;
- desligar Pets em grupos remove o grupo visual Pets quando aplicável;
- filhos humanos não são afetados;
- contadores não ficam incoerentes;
- exportação reflete o estado visual.

---

## 6. Pendência específica: barra mobile da horizontal

Estado atual:

```txt
/mapa-familiar-horizontal
```

exibe barra visual:

```txt
Paterno | Central | Materno
```

com **Central** ativo por padrão.

Decisão pendente:

| Opção | Comportamento |
|---|---|
| Manter visual | barra comunica organização, mas não navega |
| Implementar scroll/foco | botões rolam para colunas/faixas relacionadas |
| Remover | se não houver ação real, substituir por título/controle mais claro |

Critério antes de implementar:

- definir significado de Paterno/Materno na horizontal por gerações;
- evitar conflito com colunas de geração;
- evitar comportamento falso;
- validar mobile 320–430px.

---

## 7. Pendência específica: busca/favoritos da horizontal

Estado atual a validar:

- `/mapa-familiar` consta como página de busca/favoritos;
- `/mapa-familiar-horizontal` é rota oficial, mas pode não constar como página própria.

Arquivos:

```txt
src/app/services/globalSearchService.ts
src/app/constants/favoritePages.ts
```

Decisão:

```txt
Adicionar /mapa-familiar-horizontal como página própria?
```

Critério de aceite, se sim:

- item aparece na busca global;
- item pode ser favoritado;
- título diferencia da vertical;
- favoritos não salvam zoom/filtros/estado de seleção;
- documentação de favoritos é atualizada.

---

## 8. Comandos mínimos

Antes de fechar qualquer frente técnica:

```bash
git status --short
git diff --check
npm run build
```

Quando houver teste aplicável:

```bash
npm test
npm run test:e2e
```

Para banco/schema:

```bash
supabase migration list
```

---

## 9. Regras de manutenção

- Este documento não deve repetir implementação completa.
- Itens concluídos devem sair de pendências e entrar em `GUIA_IMPLEMENTACOES.md` se forem relevantes.
- QA manual autenticado deve ser mantido como aberto até validação em ambiente real.
- Não abrir nova rota experimental sem atualizar `treeViewMode.ts`, `routes.tsx`, busca/favoritos quando aplicável e documentação.
- Não criar migration para ajuste visual.
