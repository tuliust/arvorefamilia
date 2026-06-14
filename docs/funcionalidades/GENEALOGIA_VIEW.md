# Genealogia - view, layout e navegação mobile

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/GENEALOGIA_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Genealogia** e do comportamento compartilhado com **Visão Completa**.  
> Status: revisado contra a estrutura atual de rotas, `treeViewMode`, `HomeTreeSection`, views ReactFlow e separação explícita das views visuais do Mapa Familiar.

---

## 1. Função deste documento

Este documento descreve a view **Genealogia**, acessada por:

```txt
/genealogia
```

A view organiza o escopo pessoal da pessoa central em colunas por geração e, no mobile, oferece navegação por chips de geração.

Este arquivo também registra o comportamento compartilhado com:

```txt
/visao-completa
```

mas apenas no que diz respeito a layout por geração, ReactFlow, chips mobile e anti-regressões.

Não use este documento para documentar profundamente:

| Tema | Documento correto |
|---|---|
| Mapa Familiar Vertical | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Mapa Familiar Horizontal | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Minha Árvore direta | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
| Filtros, pets e cônjuges | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Painel, legendas e conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |

---

## 2. Diferença entre as views da árvore

| View | Rota | `viewMode` | Escopo | Renderização |
|---|---|---|---|---|
| Minha Árvore | `/minha-arvore` | `minha-arvore` | família direta da pessoa central | ReactFlow no desktop/tablet; `MobileFamilyTreeView` no mobile |
| Mapa Familiar Vertical | `/mapa-familiar` | `mapa-familiar` | família direta em mapa visual | `DesktopFamilyMapView` no desktop/tablet; `MobileFamilyTreeView` no mobile |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | `mapa-familiar-horizontal` | família direta por gerações | `DesktopFamilyHorizontalMapView`, inclusive no mobile |
| Genealogia | `/genealogia` | `genealogia` | escopo pessoal por gerações | ReactFlow |
| Visão Completa | `/visao-completa` | `visao-completa` | base familiar completa por gerações | ReactFlow |

Regras:

- `/genealogia` e `/visao-completa` são as views por geração baseadas em ReactFlow.
- `/mapa-familiar-horizontal` pode usar `genealogyColumnsLayout` como referência de ordenação, mas não é ReactFlow e não deve ser documentada como Genealogia.
- Ajustes de cards, SVGs, conectores e exportação do Mapa Familiar pertencem ao documento do Mapa Familiar.
- CSS criado para uma dessas views deve ser escopado por `viewMode`, rota, `data-export-root`, `data-family-map-export-root` ou atributo equivalente.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Estado global, filtros e pessoa central | `src/app/pages/Home.tsx` |
| Decisão de renderização por view | `src/app/pages/home/HomeTreeSection.tsx` |
| Chips mobile de geração | `src/app/pages/home/GenealogyMobileStageTabs.tsx` |
| Componente ReactFlow | `src/app/components/FamilyTree/FamilyTree.tsx` |
| Controles mobile para views ReactFlow | `src/app/components/FamilyTree/MobileTreeControlsPortal.tsx` |
| Layout por gerações | `src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts` |
| Filtro de escopo pessoal | `src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts` |
| Tipos e filtros | `src/app/components/FamilyTree/types.ts` |
| Nodes | `src/app/components/FamilyTree/nodeTypes.ts` |
| Card ReactFlow | `src/app/components/FamilyTree/PersonNode.tsx` |
| Cabeçalhos de coluna | `src/app/components/FamilyTree/DirectFamilyLabelNode.tsx` |
| Conector familiar | `src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx` |
| Edge conjugal | `src/app/components/FamilyTree/GenealogySpouseEdge.tsx` |

---

## 4. Rotas e contrato de `TreeViewMode`

O contrato atual da árvore é:

```ts
export type TreeViewMode =
  | 'minha-arvore'
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal'
  | 'genealogia'
  | 'visao-completa';
```

Mapeamento relevante:

```txt
/genealogia       -> genealogia
/visao-completa   -> visao-completa
/                 -> mapa-familiar
```

Regras:

- `/` não abre Genealogia; redireciona para `/mapa-familiar`.
- `/mapa-familiar-horizontal` não é alias de `/visao-completa`.
- `/mapa-horizontal` e `/visao-completa-teste` não são rotas oficiais.
- A troca de view deve preservar `location.search`, especialmente `?pessoa=...`.

---

## 5. Modelo de gerações

Modelo visual atual:

| Geração | Label mobile | Uso |
|---:|---|---|
| 1 | Tataravós | ascendentes mais distantes no modelo atual |
| 2 | Bisavós | bisavós da pessoa central |
| 3 | Avós | avós da pessoa central |
| 4 | Pais | pais da pessoa central |
| 5 | Núcleo | pessoa central, cônjuges e núcleo imediato |
| 6 | Descendentes | filhos, netos e descendentes dentro do limite atual |

Regras:

- labels de chips devem ser humanos;
- cabeçalhos técnicos de coluna podem continuar como `Geração N`;
- colunas vazias não devem ser renderizadas;
- gerações sem pessoas não devem aparecer nos chips mobile;
- inferência visual de geração não deve persistir no Supabase;
- `manual_generation` pode existir como dado de apoio, mas a Genealogia não deve gravar inferências no banco.

---

## 6. Escopo da Genealogia

Em `FamilyTree.tsx`:

- `viewMode === 'genealogia'` usa o escopo pessoal da pessoa central;
- `viewMode === 'visao-completa'` usa a base familiar completa;
- pets devem ficar fora do layout genealógico por gerações;
- relações conjugais podem aparecer quando existirem e forem permitidas pelo layout/filtros;
- o layout deve preservar contexto genealógico sem transformar filtros diretos em filtros destrutivos.

Regras:

- não ampliar `/genealogia` para a base completa sem alterar o `viewMode`;
- não inserir pets em colunas genealógicas;
- não aplicar filtros diretos da Minha Árvore como se fossem filtros genealógicos;
- não reaproveitar CSS visual do Mapa Familiar nos cards ReactFlow de Genealogia.

---

## 7. Inferência visual de gerações

`HomeTreeSection.tsx` prepara a base mobile inferida para `/genealogia` e `/visao-completa` quando `isMobile` é verdadeiro. O objetivo é manter os chips e o canvas com a mesma referência de gerações.

Comportamento esperado:

- inferência acontece em memória;
- pessoa central é a referência;
- pais sobem geração;
- filhos descem geração;
- cônjuges permanecem na mesma geração;
- resultado é usado para renderização;
- nenhum dado é salvo no Supabase.

Recomendação técnica:

```txt
Se a inferência de geração for alterada, extrair a lógica para helper compartilhado em vez de duplicar regra em FamilyTree e HomeTreeSection.
```

---

## 8. Layout desktop

`genealogyColumnsLayout.ts` deve:

- agrupar pessoas por geração;
- ordenar por data de nascimento e nome quando não houver referência melhor;
- posicionar cônjuges próximos;
- adicionar labels/cabeçalhos de geração;
- criar conectores parentais por `GenealogyFamilyConnectorNode`;
- criar edges conjugais por `GenealogySpouseEdge`;
- aplicar filtros de geração;
- evitar colunas vazias;
- manter espaçamento legível entre cônjuges e gerações.

Anti-regressões:

- não deslocar `.react-flow__viewport` com `translate` ou `top` negativo para corrigir espaçamento;
- não deixar o zoom inicial ser controlado apenas pela altura total se isso tornar a árvore ilegível;
- não aplicar largura especial dos cards da Minha Árvore nos cards genealógicos;
- não aplicar CSS de `/mapa-familiar-horizontal` em `.react-flow__node-personNode`.

---

## 9. Cards em Genealogia e Visão Completa

As views ReactFlow por geração usam `PersonNode`, não `VisualPersonCard`.

Dimensão de referência:

| View | Card |
|---|---|
| `/genealogia` | padrão de card ReactFlow por geração |
| `/visao-completa` | padrão de card ReactFlow por geração |
| `/mapa-familiar-horizontal` | `VisualPersonCard`, fora deste documento |

Checklist:

- abrir `/genealogia` e confirmar que os cards não herdaram visual do Mapa Familiar;
- abrir `/visao-completa` e confirmar que os cards não foram compactados como Minha Árvore;
- abrir `/mapa-familiar-horizontal` e confirmar que ela usa cards visuais próprios;
- validar cônjuges e espaçamentos após alterações em `PersonNode`, `nodeTypes` ou `genealogyColumnsLayout`.

---

## 10. Títulos e cabeçalhos de geração

Títulos desktop vindos de `HomeTreeSection`:

| Rota | Título esperado |
|---|---|
| `/minha-arvore` | `Árvore de {primeiro nome}` |
| `/mapa-familiar` | `Mapa Familiar de {primeiro nome}` |
| `/mapa-familiar-horizontal` | `Genealogia de {primeiro nome}` |
| `/genealogia` | `Família de {primeiro nome}` |
| `/visao-completa` | `Linha Genealógica de {primeiro nome}` |

Cabeçalhos de coluna em `/genealogia` e `/visao-completa`:

```txt
Geração 1
Geração 2
Geração 3
...
```

Formatação esperada:

- pílula arredondada;
- fundo escuro;
- texto branco;
- uppercase;
- sombra discreta;
- sem wrapper branco externo.

Regras:

- o título geral da view não deve ser criado pelo layout;
- os cabeçalhos de coluna são nodes/labels do layout;
- não usar o padrão visual de cabeçalhos da view horizontal do Mapa Familiar.

---

## 11. Chips mobile

`HomeTreeSection.tsx` ativa os chips quando:

```txt
isMobile && (viewMode === 'genealogia' || viewMode === 'visao-completa')
```

Componente:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
```

Comportamento:

- aparece acima da área da árvore;
- usa a base inferida por `HomeTreeSection`;
- mostra apenas gerações com pessoas visíveis;
- usa `role="tablist"` e `role="tab"`;
- permite clique direto;
- permite rolagem horizontal da barra;
- não exibe contadores;
- não remove colunas do canvas;
- apenas altera foco/enquadramento.

Labels:

```txt
Tataravós
Bisavós
Avós
Pais
Núcleo
Descendentes
```

---

## 12. Geração ativa no mobile

Estados/conceitos:

```txt
availableMobileGenerations
defaultGenealogyMobileGeneration
activeGenealogyGeneration
effectiveActiveGenealogyGeneration
mobileGenerationSignature
```

Regras:

- geração inicial é a menor geração disponível entre pessoas visíveis;
- ao alternar entre `/genealogia` e `/visao-completa`, recalcular a geração ativa;
- ao mudar a pessoa central, recalcular;
- ao mudar o conjunto de gerações disponíveis, acompanhar nova assinatura;
- ao sair de views com chips, limpar o estado;
- geração ativa não é filtro destrutivo.

---

## 13. Foco mobile: foco, não filtro

Decisão consolidada:

```txt
Chips focam/enquadram a geração ativa, mas não removem as demais colunas renderizadas.
```

Motivos:

- o usuário pode recuperar contexto reduzindo zoom;
- ReactFlow precisa manter nodes para bounds e pan;
- evitar discrepância entre o que o usuário vê e o que a exportação captura;
- filtros destrutivos pertencem ao painel, não aos chips de navegação.

---

## 14. Exportação

Genealogia e Visão Completa usam o fluxo ReactFlow de exportação:

- `TreeAreaSelectionOverlay`;
- `treeExport.ts`;
- `resolveTreeExportTarget`;
- captura do root ReactFlow ou `data-export-root="family-tree"`;
- exclusão de controles, overlays, minimap, menus e loading;
- PNG, PDF e impressão.

Regras:

- as correções de título no canvas, loading e SVGs do Mapa Familiar não devem quebrar exportação ReactFlow;
- `MobileTreeControlsPortal` continua disponível para `/genealogia` e `/visao-completa` em mobile;
- seleção manual no portal mobile permanece limitada conforme UI atual;
- QA deve validar exportação após alterações em `treeExport.ts`, `PersonNode`, edges ou CSS global.

---

## 15. QA mínimo

Validar:

```txt
/genealogia
/visao-completa
```

Desktop:

- título correto;
- colunas por geração;
- pílulas `Geração N`;
- cards legíveis;
- cônjuges próximos;
- conectores visíveis;
- pan/zoom;
- exportação PNG/PDF/impressão.

Mobile:

- chips aparecem somente em `/genealogia` e `/visao-completa`;
- primeira geração disponível fica ativa;
- alternar view reseta chip ativo;
- alterar pessoa central recalcula gerações;
- chips focam sem destruir layout;
- bottom nav não cobre controles essenciais.

Anti-regressões:

- `/mapa-familiar-horizontal` não deve ser tratada como ReactFlow;
- `/mapa-familiar` não deve usar cabeçalhos `Geração N`;
- cards do Mapa Familiar não devem substituir `PersonNode`;
- CSS da Genealogia não deve vazar para Mapa Familiar.
