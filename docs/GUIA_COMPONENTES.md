# Guia de componentes — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/GUIA_COMPONENTES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Baseline revisada: `main` em `833108f`  
> Status: guia alinhado às duas views oficiais, painel simplificado e remoção de componentes órfãos.

---

## 1. Objetivo

Este guia identifica os principais componentes do projeto, suas responsabilidades e os cuidados necessários para evitar regressões.

Use antes de alterar:

- shell da árvore;
- views do Mapa Familiar;
- painel lateral/mobile;
- exportação;
- filtros;
- favoritos;
- busca;
- componentes compartilhados.

---

## 2. Convenções gerais

| Regra | Aplicação |
|---|---|
| Componentes visuais não acessam Supabase diretamente | Usar `services`. |
| Cálculos puros ficam em utils/layouts | Evitar lógica pesada dentro de JSX. |
| Botões não-submit usam `type="button"` | Evitar envio acidental de forms. |
| Props devem permanecer tipadas | Evitar `any` para corrigir build rapidamente. |
| Exportação ignora UI transitória | Usar `data-tree-export-ignore="true"`. |
| CSS deve ser escopado | Preferir rota, data attribute ou container. |
| Histórico não orienta implementação | Docs legados não podem reintroduzir views removidas. |
| Painel não usa abas antigas | Não restaurar `Filtros | Legendas | Ações`. |

---

## 3. Shell da árvore

### 3.1 `Home`

Arquivo:

```txt
src/app/pages/Home.tsx
```

Responsabilidades:

- carregar pessoas e relacionamentos;
- resolver pessoa vinculada/central;
- manter filtros globais;
- controlar painel desktop/mobile;
- compor header e área da árvore;
- alimentar contagens renderizadas;
- controlar modais, IA, curiosidades, conexão e exportação.

Cuidados:

- `Home` ainda concentra responsabilidades e deve ser refatorado por etapas pequenas;
- não inserir views antigas no shell;
- não misturar regras de rota com layout específico;
- preservar `?pessoa=...` e `?voltar=...`.

### 3.2 `HomeTreeSection`

Arquivo:

```txt
src/app/pages/home/HomeTreeSection.tsx
```

Responsabilidade:

- decidir qual componente de árvore renderizar;
- repassar filtros e callbacks;
- reagir a ações do painel;
- controlar título, loading e estados vazios.

Renderização vigente:

| Condição | Componente |
|---|---|
| mobile + `mapa-familiar` | `MobileFamilyTreeView` |
| mobile + `mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` |
| desktop/tablet + `mapa-familiar` | `DesktopFamilyMapView` |
| desktop/tablet + `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` |

Não reintroduzir branches para:

```txt
minha-arvore
genealogia
visao-completa
```

### 3.3 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidades:

- header das views de árvore;
- busca;
- atalhos;
- menu de usuário;
- favoritos de página da view atual.

Cuidados:

- não apontar ação principal para `/minha-arvore`;
- preservar páginas favoritas de `/mapa-familiar` e `/mapa-familiar-horizontal`;
- nome/e-mail do usuário ficam no menu, não ao lado do avatar.

### 3.4 `HomeMobileNav`

Arquivo:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Responsabilidades:

- navegação inferior mobile;
- botão `Controles` nas views oficiais;
- abertura do modal mobile de controles;
- marcação para ignorar exportação.

Regras:

- `/mapa-familiar` mobile pode usar navegação interna de `MobileFamilyTreeView`;
- `/mapa-familiar-horizontal` mobile usa navegação por gerações;
- não reintroduzir `Paterno | Central | Materno` na horizontal mobile;
- não duplicar `MobileTreeControlsPortal`.

---

## 4. Painel e controles

### 4.1 `SidebarPanelTabs`

Arquivo:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
```

Estado atual:

- renderiza controles de zoom/restauração;
- troca Vertical/Horizontal preservando search params;
- concentra flyouts `Cores`, `Exportar`, `Destacar`;
- exibe filtros diretos/status sem barra de abas;
- não renderiza a barra `Filtros | Legendas | Ações`.

Controles vigentes:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros/grupos
Filtros de status
```

Dívida restante:

- `SidebarPanelTabs` pode ter nome histórico e responsabilidades amplas;
- eventual renome deve ser feita em frente própria, por exemplo para `TreeControlPanel`.

### 4.2 `DirectRelationKpiGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
```

Responsabilidades:

- exibir grupos diretos;
- usar contagens efetivas quando a view informa;
- refletir `directRelativeFilters`.

### 4.3 `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Responsabilidades:

- renderizar cards/filtros de grupos;
- controlar `Cônjuges` e `Pets`;
- preservar semântica de filtros diretos.

### 4.4 `LifeStatusKpiGrid`

Arquivo:

```txt
src/app/pages/home/LifeStatusKpiGrid.tsx
```

Responsabilidades:

- filtros `Vivos`, `Falecidos` e `Pets`;
- contadores por status/tipo.

### 4.5 Componentes de legenda/info

Arquivos que podem existir por histórico:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/home/SidebarInfoPanel.tsx
```

Regras:

- não documentar como UI ativa se não estiverem montados no painel atual;
- não reintroduzir aba `Legendas`;
- qualquer ajuda contextual futura deve ser reposicionada fora da barra de abas e ignorada pela exportação.

---

## 5. Views oficiais da árvore

### 5.1 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar` no desktop/tablet;
- compor grupos da família direta;
- aplicar filtros de grupos/status;
- calcular cônjuges;
- desenhar conectores SVG;
- controlar zoom/scroll;
- exportar PNG/PDF/print;
- abrir seleção por área;
- implementar `Destacar > Grupos`.

Cuidados:

- não corrigir sobreposição por zoom padrão;
- não criar relações por proximidade visual;
- conectores devem depender de âncoras e relacionamentos explícitos;
- alteração de layout exige QA visual.

### 5.2 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidades:

- experiência mobile de `/mapa-familiar`;
- telas Paterno/Central/Materno;
- conectores HTML/CSS;
- visual compacto.

Cuidados:

- não usar na horizontal mobile;
- preservar swipe/abas internas;
- manter controles marcados para ignorar exportação.

### 5.3 `DesktopFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` no desktop/tablet;
- organizar pessoas por gerações;
- ocultar colunas vazias;
- posicionar cônjuges;
- desenhar conectores SVG;
- preservar fundo transparente quando definido;
- exportar com título e paleta.

### 5.4 `MobileFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` no mobile;
- apresentar uma geração por tela;
- permitir swipe lateral;
- permitir scroll vertical interno;
- exibir chips de geração.

Cuidados:

- não usar barra Paterno/Central/Materno;
- não gerar subrotas por geração;
- não capturar bottom nav/modal na exportação.

---

## 6. Componentes de exportação

Arquivos:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeExportLoadingOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidades:

- seleção de área;
- loading de exportação;
- captura com `html2canvas`;
- exportação PNG/PDF/impressão;
- normalização de SVGs e cores.

Regras:

- não remover `treeExport.ts` em limpeza superficial;
- não usar seletor global que afete todos os SVGs;
- não capturar painel, header, bottom nav ou overlays.

---

## 7. Contratos e tipos

Arquivo extraído:

```txt
src/app/components/FamilyTree/actions.ts
```

Responsabilidade:

- declarar `FamilyTreeActions` fora de `FamilyTree.tsx`;
- permitir que views oficiais usem o contrato sem depender do renderer legado.

Regra:

- novos contratos compartilhados devem ficar em arquivos neutros;
- não centralizar tipos novos em componentes legados.

---

## 8. Services principais

Preservar:

```txt
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/treeDataCache.ts
src/app/services/relationshipCacheService.ts
src/app/services/userEngagementService.ts
src/app/services/favoritesService.ts
src/app/services/globalSearchService.ts
```

Removido:

```txt
src/app/services/relationshipResolverService.ts
```

Regras:

- `dataService.ts` é crítico para CRUD e eventos da árvore;
- `treeDataCache.ts` coordena invalidação/recarregamento;
- `relationshipCacheService.ts` limpa `parentescos_calculados`;
- `memberProfileService.ts` é crítico para vínculo usuário-pessoa;
- `userEngagementService.ts` ainda concentra compatibilidade local/legada e notificações.

---

## 9. Componentes removidos

Não reintroduzir sem decisão explícita:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/CentralNotificacoes.tsx
src/app/components/FamilyTree/ViewModeToggle.tsx
src/app/components/figma/ImageWithFallback.tsx
```

Se algum import quebrar após remoção:

1. confirmar se o fluxo ainda é vigente;
2. procurar substituto atual;
3. não restaurar o arquivo antigo por conveniência;
4. rodar build/testes.

---

## 10. Legado técnico preservado

Preservar até frente específica:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/styles/mobile-tree-lines.css
```

Motivo:

- pode haver tipos/helpers ativos;
- a horizontal usa layout genealógico;
- remover ReactFlow/Dagre exige frente própria.

---

## 11. Checklist antes de remover componente

```bash
rg "NomeDoComponente"
rg "from './NomeDoComponente'"
rg "from '../NomeDoComponente'"
npm run build
npm test
npm run test:e2e
git diff --check
```

Critérios:

- sem import ativo;
- sem lazy import;
- sem CSS necessário para view atual;
- sem teste dependente;
- sem contrato exportado usado por outro arquivo;
- sem função de fallback intencional.

---

## 12. Critério de aceitação

Uma alteração de componente só deve ser fechada quando:

- build passa;
- testes unitários passam;
- E2E passa quando rota/navegação/árvore for afetada;
- `git diff --check` não aponta erro bloqueante;
- rotas antigas não voltam;
- painel antigo de abas não volta;
- docs canônicas são atualizadas se o comportamento mudar.
