# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-13
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Minha Árvore**.  
> Status: revisado contra `treeViewMode`, `routes.tsx`, `HomeTreeSection`, `MobileTreeControlsPortal`, Mapa Familiar Vertical/Horizontal com `MobileFamilyHorizontalMapView`, filtros atuais e exportação.

---

## 1. Função deste documento

Este documento descreve a view direta **Minha Árvore**, acessada pela rota:

```txt
/minha-arvore
```

Use este arquivo para manter:

- shell da Home aplicado à árvore;
- viewport, pan, zoom e scroll da view direta ReactFlow;
- pessoa central e grupos diretos;
- layout ReactFlow direto;
- experiência mobile segmentada;
- integração com painel, filtros, legenda e exportação;
- anti-regressões específicas da Minha Árvore.

Não use este documento para detalhar:

| Tema | Documento |
|---|---|
| Mapa Familiar Vertical/Horizontal | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Genealogia/Visão Completa | `docs/funcionalidades/GENEALOGIA_VIEW.md` |
| Filtros e pets | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Painel/legendas/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |

---

## 2. Estado atual

A Minha Árvore está consolidada como view direta da pessoa central.

| Breakpoint | Componente |
|---|---|
| desktop/tablet | `FamilyTree` com ReactFlow |
| mobile | `MobileFamilyTreeView` |

A view mostra:

- pessoa central;
- pais;
- avós, bisavós e tataravós;
- cônjuge;
- irmãos;
- filhos;
- netos;
- tios;
- primos;
- sobrinhos;
- pets;
- linhas de parentesco;
- filtros e destaques;
- clique em pessoa para abrir perfil;
- clique em relacionamento conjugal quando aplicável;
- exportação via ações da árvore.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Shell da árvore, estado e filtros | `src/app/pages/Home.tsx` |
| Header da Home | `src/app/pages/home/HomeHeader.tsx` |
| Área principal da árvore | `src/app/pages/home/HomeTreeSection.tsx` |
| Navegação mobile da Home | `src/app/pages/home/HomeMobileNav.tsx` |
| ReactFlow da árvore | `src/app/components/FamilyTree/FamilyTree.tsx` |
| Controles mobile ReactFlow | `src/app/components/FamilyTree/MobileTreeControlsPortal.tsx` |
| Mobile segmentado | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Layout direto ReactFlow | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Escopo direto | `src/app/components/FamilyTree/layouts/directFamilyScope.ts` |
| Nodes | `src/app/components/FamilyTree/nodeTypes.ts` |
| Card ReactFlow | `src/app/components/FamilyTree/PersonNode.tsx` |
| Painel da pessoa central | `src/app/components/FamilyTree/CentralPersonFocusPanel.tsx` |
| Nó conjugal | `src/app/components/FamilyTree/MarriageNode.tsx` |
| Tipos/filtros | `src/app/components/FamilyTree/types.ts` |
| Exportação | `src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx`, `utils/treeExport.ts` |
| CSS mobile | `src/styles/mobile-tree-controls.css` |

Arquivos relacionados, mas documentados separadamente:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

---

## 4. Rotas e `viewMode`

Contrato atual:

| Rota | `viewMode` | Renderização |
|---|---|---|
| `/minha-arvore` | `minha-arvore` | ReactFlow desktop/tablet; `MobileFamilyTreeView` mobile |
| `/mapa-familiar` | `mapa-familiar` | Mapa Familiar vertical; fallback mobile `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` no desktop/tablet; `MobileFamilyHorizontalMapView` no mobile |
| `/genealogia` | `genealogia` | ReactFlow por gerações |
| `/visao-completa` | `visao-completa` | ReactFlow por gerações/base completa |

Regras:

- `/` redireciona para `/mapa-familiar`, não para `/minha-arvore`;
- `/mapa-familiar-horizontal` não é Minha Árvore e possui componente mobile próprio por gerações;
- ajustes desta documentação devem ser condicionados a `viewMode === 'minha-arvore'` ou ao mobile compartilhado explicitamente;
- search params como `?pessoa=...` devem ser preservados na troca de view.

---


### 4.1 Observação sobre horizontal mobile

A experiência `Paterno | Central | Materno` descrita neste documento pertence à Minha Árvore mobile e ao fallback mobile de `/mapa-familiar`.

Ela **não** deve ser aplicada a `/mapa-familiar-horizontal`.

Contrato da horizontal mobile:

```txt
MobileFamilyHorizontalMapView
1 geração por tela
swipe lateral entre gerações
chips G1/G2/G3...
```


## 5. Shell da Home

`Home.tsx` usa shell fixo:

```txt
fixed inset-0
flex flex-col
overflow-hidden
overscroll-none
```

Área principal:

```txt
relative flex min-h-0 flex-1 overflow-hidden overscroll-none
```

Regras:

- página externa não deve rolar quando a árvore ocupa a viewport;
- pan/zoom interno do ReactFlow deve funcionar;
- sidebar/painel mobile podem ter rolagem própria;
- não resolver problemas de scroll mexendo diretamente em `.react-flow__viewport` com offsets frágeis.

---

## 6. Pessoa central

A pessoa central é resolvida por prioridade:

1. `?pessoa=...`, se válido;
2. pessoa vinculada ao usuário;
3. seleção local;
4. primeira pessoa carregada como fallback.

Regras:

- pessoa central deve permanecer visível;
- em `/minha-arvore`, `isCentralPerson` e destaque de seleção pertencem ao ReactFlow;
- se houver apenas a pessoa central renderizada, o painel de foco pode ser usado;
- retorno de perfil deve preservar origem por `?voltar=...` quando aplicável.

---

## 7. Filtros da view direta

Estados relevantes:

| Estado | Função |
|---|---|
| `edgeFilters` | linhas ReactFlow |
| `visualLineFilters` | destaque de linhas/cards/grupos |
| `personFilters` | status/tipo: vivos, falecidos, pets |
| `directRelativeFilters` | grupos diretos |
| `genealogyFilters` | não é filtro principal da Minha Árvore |

Regras:

- filtros de linha não ocultam cards;
- filtros de destaque não recriam linhas ocultas;
- filtros de grupo não persistem no banco;
- contadores respeitam status/tipo e escopo;
- `directRelativeFilters.pets` e `personFilters.pets` são conceitos diferentes.

---

## 8. Layout direto ReactFlow

Arquivo principal:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

O layout monta:

- áreas paterna e materna;
- núcleo central;
- grupos de ancestrais;
- grupos laterais de tios/primos;
- grupos inferiores de filhos/netos/pets;
- group boxes;
- labels;
- anchors;
- edges;
- nós conjugais.

Regras:

- título geral não deve ser criado pelo layout;
- labels de grupo podem existir;
- anchors não devem comandar zoom inicial sozinhos;
- alteração em constantes de posição exige validação desktop/tablet;
- CSS visual de Minha Árvore não deve vazar para Genealogia/Visão Completa/Mapa Familiar.

---

## 9. Cards compactos da Minha Árvore

A Minha Árvore pode usar ajuste visual próprio para melhorar legibilidade de cards compactos ReactFlow.

Regras:

- escopo deve ser restrito a `viewMode === 'minha-arvore'`;
- pessoa central mantém dimensão própria;
- Genealogia/Visão Completa mantêm padrão de card por geração;
- Mapa Familiar usa `VisualPersonCard` e não herda `PersonNode`.

Validar após alterações:

- Pai/Mãe;
- irmãos;
- sobrinhos;
- cônjuge;
- filhos;
- netos;
- pets;
- avós/bisavós/tataravós;
- tios/primos;
- edges e group boxes.

---

## 10. Mobile segmentado

No mobile, `/minha-arvore` usa:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Estrutura:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Abas:

```txt
Paterno | Central | Materno
```

Comportamento:

- **Paterno** abre Tios Paternos;
- **Central** volta à tela central;
- **Materno** abre Tios Maternos;
- swipe para cima da Central abre Ancestrais globais;
- swipe lateral abre tios paternos/maternos;
- swipe para baixo a partir de tios abre primos;
- swipe para cima a partir de primos volta aos tios;
- preview parcial da próxima tela pode aparecer durante o gesto.

Regras:

- aba antiga **Núcleo** não deve reaparecer;
- aba antiga **Completa** não deve reaparecer;
- primos exibem todos os cards disponíveis, sem botão **Ver todos**;
- telas longas usam rolagem interna;
- conectores HTML/CSS não são ReactFlow.

---

## 11. Regras de cards e conectores mobile

Valem para `/minha-arvore` mobile e para `/mapa-familiar` mobile, porque ambas usam `MobileFamilyTreeView`.

| Elemento | Regra |
|---|---|
| Card central | sem badge `VOCÊ` |
| Pai/Mãe | labels podem permanecer |
| Linhas vitais | apenas ano |
| Avatar | foto real primeiro; fallback por `genero` |
| Conectores | HTML/CSS próprios |
| Conectores de ancestrais/Pai/Mãe | devem acompanhar scroll quando os cards relacionados rolam |
| Primos | fim de ramo, sem linha inferior |

Anti-regressões:

- não voltar a exibir localidade nas linhas vitais mobile;
- não usar iniciais como fallback principal quando há avatar visual;
- não mover conectores para fora do scroll se precisam acompanhar cards;
- validar 320, 375, 390 e 430px.

---

## 12. Controles e painel mobile

`MobileTreeControlsPortal`:

- continua disponível para rotas de árvore em geral;
- retorna `null` em `/mapa-familiar` e `/mapa-familiar-horizontal`, porque essas rotas usam o painel mobile do `HomeMobileNav`;
- permanece relevante para `/minha-arvore`, `/genealogia` e `/visao-completa`.

Regras:

- não duplicar controles mobile;
- não mostrar painel antigo nas rotas do Mapa Familiar;
- ações de PDF/imagem/impressão devem usar `treeExport.ts`;
- seleção manual em mobile permanece limitada conforme UI atual.

---

## 13. Exportação

Minha Árvore usa o fluxo ReactFlow:

- `FamilyTreeActions`;
- `TreeAreaSelectionOverlay`;
- `treeExport.ts`;
- `resolveTreeExportTarget`;
- `captureElementToCanvas`;
- PNG/PDF/impressão.

Elementos ignorados:

- controles ReactFlow;
- minimap;
- overlays;
- loading;
- menus;
- legenda marcada;
- painel lateral/mobile.

Regras:

- exportação não altera filtros;
- exportação não deve incluir painel;
- atualização em `treeExport.ts` deve validar Minha Árvore, Genealogia, Visão Completa e Mapas Familiares.

---

## 14. Relação com Mapa Familiar

`/mapa-familiar` reutiliza `MobileFamilyTreeView` no mobile, mas no desktop/tablet é outra view.

Diferenças:

| Aspecto | Minha Árvore | Mapa Familiar Vertical |
|---|---|---|
| Desktop | ReactFlow | HTML/CSS/SVG |
| Mobile | `MobileFamilyTreeView` | `MobileFamilyTreeView` |
| Cards | `PersonNode` | `VisualPersonCard` no desktop |
| Conectores | ReactFlow | SVG no desktop |
| Exportação | ReactFlow root | root HTML/CSS/SVG próprio |
| Título | `Árvore de {nome}` | `Mapa Familiar de {nome}` |

Regra:

```txt
Compartilhamento mobile não transforma o Mapa Familiar desktop em ReactFlow.
```

---

## 15. QA mínimo

Validar `/minha-arvore`:

Desktop/tablet:

- pan/zoom;
- pessoa central;
- group boxes;
- labels;
- anchors;
- filtros de grupo;
- filtros de vida;
- linhas;
- destaques;
- exportação;
- favoritos;
- navegação para perfil e retorno.

Mobile:

- abas Paterno/Central/Materno;
- swipe;
- rolagem interna;
- anos nos cards;
- avatar por `genero`;
- sem badge `VOCÊ`;
- conectores alinhados;
- bottom nav não cobre conteúdo;
- controles sem duplicidade.

Anti-regressões:

- não afetar `/genealogia`;
- não afetar `/visao-completa`;
- não afetar `/mapa-familiar-horizontal`;
- não reintroduzir rotas antigas.
