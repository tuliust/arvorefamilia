# Minha Árvore - filtros, pets e regras de exibição

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Tipo: documentação funcional/técnica dos filtros da árvore direta, pets, cônjuges, contadores e impactos cruzados nas views de mapa.  
> Status: revisado contra a estrutura atual de `Home.tsx`, filtros diretos, filtros de status, Mapa Familiar Vertical/Horizontal e mobile segmentado.

---

## 1. Função deste documento

Este documento descreve as regras de:

- filtros de grupos familiares diretos;
- filtros por status/tipo;
- pets;
- separação entre filhos humanos e pets;
- contadores;
- cônjuges;
- impacto dos filtros na renderização de `/minha-arvore`, `/mapa-familiar` e `/mapa-familiar-horizontal`;
- comportamento mobile do `MobileFamilyTreeView`.

Para layout/viewport da Minha Árvore, use:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
```

Para Mapa Familiar, use:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Para painel, legendas e conectores, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

---

## 2. Arquivos principais

```txt
src/app/pages/Home.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/directFamilyScope.ts
src/app/components/FamilyTree/types.ts
src/app/utils/personEntity.ts
```

Tipos principais:

```txt
DirectRelativeFilters
DirectRelativeGroup
EdgeFilters
VisualLineFilters
GenealogyFilters
```

---

## 3. Separação dos filtros

A Home trabalha com estados diferentes. Eles não devem ser misturados.

| Estado | Papel |
|---|---|
| `personFilters` | filtra cards por status/tipo: vivos, falecidos e pets |
| `directRelativeFilters` | filtra grupos diretos: avós, tios, primos, cônjuges, filhos, pets etc. |
| `edgeFilters` | controla linhas ReactFlow |
| `visualLineFilters` | controla destaques visuais de linhas/grupos/cards |
| `genealogyFilters` | controla gerações/grupos em Genealogia/Visão Completa |

Regra central:

```txt
Filtro de grupo não é filtro de vida.
Filtro de vida não é filtro de linha.
Destaque não altera dados nem contadores.
```

---

## 4. Modelo atual para pets

A regra semântica principal de pet continua sendo:

```txt
pessoas.humano_ou_pet === 'Pet'
```

Helper obrigatório:

```txt
src/app/utils/personEntity.ts
isPetFamilyMember(pessoa)
isHumanFamilyMember(pessoa)
```

Regras:

- não inferir pet pelo nome;
- não inferir pet apenas pelo grupo visual;
- não inferir pet apenas pelo relacionamento;
- `pessoas.genero = 'pet'` orienta avatar, mas não substitui semanticamente `humano_ou_pet === 'Pet'` enquanto não houver migração/backfill;
- não criar `tipo_relacionamento = 'pet'` sem migration;
- não criar relacionamento `tutor` sem schema e regra de domínio.

---

## 5. Coluna `genero` e avatar visual

`pessoas.genero` é usada como fonte visual para avatar.

Valores esperados:

| Valor | Uso visual |
|---|---|
| `homem` | avatar masculino |
| `mulher` | avatar feminino |
| `pet` | avatar de pet |

Prioridade:

1. `foto_principal_url`;
2. `genero`;
3. fallbacks legados ou neutros de `FamilyTreeVisualCards.tsx`.

Regras:

- `genero` não deve alterar relacionamentos;
- `genero = pet` não deve transformar pessoa em pet se `humano_ou_pet` disser outra coisa;
- avatar é UI, não regra de banco;
- mudanças de avatar não exigem migration, salvo criação/alteração de coluna.

---

## 6. Filtros por status/tipo

Estado em `Home.tsx`:

```ts
personFilters = {
  vivos: true,
  falecidos: true,
  pets: true,
}
```

Função:

- ocultar/exibir cards por status ou tipo;
- preservar a pessoa central;
- alimentar `LifeStatusKpiGrid`;
- gerar `visiblePersonIdsByLifeStatus`.

Comportamento esperado:

| Ação | Resultado |
|---|---|
| Desligar `Vivos` | oculta humanos vivos, preservando pessoa central quando aplicável |
| Desligar `Falecidos` | oculta humanos falecidos |
| Desligar `Pets` | oculta pets semanticamente identificados |
| Religar | cards voltam se também passarem nos filtros de grupo |

Regras:

- não recalcular parentesco por causa de filtro de vida;
- não trocar ramo paterno/materno;
- não alterar dados;
- não persistir no Supabase.

---

## 7. Filtros de grupos diretos

Estado compartilhado:

```ts
directRelativeFilters = {
  pais,
  avos,
  bisavos,
  tataravos,
  conjuge,
  filhos,
  netos,
  irmaos,
  sobrinhos,
  tios,
  primos,
  pets,
}
```

Uso:

| View | Interpretação |
|---|---|
| `/minha-arvore` desktop/tablet | grupos ReactFlow da família direta |
| `/minha-arvore` mobile | recebe defaults no fluxo atual; filtros diretos não controlam a malha como painel interativo completo |
| `/mapa-familiar` desktop/tablet | grupos visuais do Mapa Familiar Vertical |
| `/mapa-familiar` mobile | usa `MobileFamilyTreeView`; comportamento similar ao mobile da Minha Árvore |
| `/mapa-familiar-horizontal` | grupos/escopo da view horizontal por gerações |
| `/genealogia` | usa `genealogyFilters`, não `directRelativeFilters` como filtro principal |

Regras:

- desligar um grupo deve ocultar cards daquele grupo quando a view suportar o filtro;
- contadores não devem ser zerados pelo próprio toggle do grupo;
- filtros de grupo não persistem no banco;
- filtros de grupo não criam ou removem relacionamentos;
- `pets` em `directRelativeFilters` deve ser mantido separado de `personFilters.pets`.

---

## 8. Estado atual do mobile segmentado

No mobile, `/minha-arvore` e `/mapa-familiar` usam `MobileFamilyTreeView`.

Estrutura conceitual:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Filtros atuais:

| Estado/filtro | Impacto atual |
|---|---|
| `personFilters.vivos` | pode ocultar pessoas vivas |
| `personFilters.falecidos` | pode ocultar falecidos |
| `personFilters.pets` | pode ocultar pets |
| `directRelativeFilters` | em `/minha-arvore` mobile, normalizado para defaults no código atual |
| `edgeFilters` | controla ReactFlow, não conectores HTML/CSS mobile |
| `visualLineFilters` | não cria conectores HTML/CSS mobile |

Regras:

- não documentar `directRelativeFilters` como painel interativo pleno da malha mobile enquanto o código não implementar;
- pessoa central deve continuar preservada;
- conectores HTML/CSS mobile não são edges ReactFlow.

---

## 9. Regras visuais do mobile

Valem para `/minha-arvore` mobile e fallback mobile de `/mapa-familiar`.

| Elemento | Regra |
|---|---|
| Card central | não exibe badge `VOCÊ` |
| Pai/Mãe | podem manter labels `PAI` e `MÃE` |
| Linhas vitais | mostram apenas ano |
| Avatar | foto real primeiro; depois fallback por `genero` |
| Conectores | HTML/CSS próprios; acompanham scroll da tela quando necessário |
| Primos | fim de ramo; sem linha inferior |

Exemplo de linhas vitais:

```txt
⭐ 1962
✝ 2009
```

Não exibir no mobile:

```txt
⭐ Paulo Afonso/BA 1962
✝ Natal/RN 2009
```

---

## 10. Filtro Cônjuges

O rótulo do painel deve ser:

```txt
Cônjuges
```

No Mapa Familiar, a regra é específica:

| Tipo de cônjuge | Estado | Controlado por `directRelativeFilters.conjuge`? |
|---|---:|---:|
| Cônjuge da pessoa central | visível quando existir | Não |
| Cônjuges de tataravós, bisavós e avós | visíveis quando existirem | Não |
| Cônjuges de tios | filtráveis | Sim |
| Cônjuges de primos | filtráveis | Sim |
| Cônjuges de sobrinhos | filtráveis | Sim |
| Cônjuges de filhos | filtráveis | Sim |
| Cônjuges de netos | filtráveis | Sim |

Regras:

- desligar **Cônjuges** não esconde cônjuge principal;
- desligar **Cônjuges** não esconde cônjuges ancestrais;
- cônjuges colaterais/descendentes dependem do filtro;
- conectores conjugais só devem existir quando houver relacionamento `conjuge` explícito;
- não conectar pessoas adjacentes apenas por proximidade visual.

---

## 11. Filtro Pets: estado e pendência

Existem dois filtros com nome parecido:

| Filtro | Estado | Papel |
|---|---|---|
| Pets em `personFilters` | filtro de status/tipo | oculta/exibe todos os pets semanticamente |
| Pets em `directRelativeFilters` | filtro de grupo | oculta/exibe o grupo visual Pets quando a view suportar |

Risco conhecido:

```txt
Confundir personFilters.pets com directRelativeFilters.pets.
```

Critério de aceite para correção/QA:

- desligar Pets em filtros de grupo deve remover o grupo/card visual de pets em views que suportam `directRelativeFilters`;
- desligar Pets em filtros de vida/tipo deve remover pets de todos os escopos visuais;
- ambos devem permanecer independentes;
- contadores devem refletir o estado esperado;
- filhos humanos não devem sumir ao desligar pets;
- pets não devem aparecer misturados como filhos humanos quando a view separa os grupos.

---

## 12. Contadores

Contadores de grupos diretos devem considerar:

- pessoa central;
- relacionamentos;
- filtros de status/tipo;
- escopo da view;
- contagens efetivamente renderizadas quando a view envia `onDirectRelationRenderedCounts`.

Regra:

```txt
Desligar um grupo não zera a contagem do próprio card.
```

Exemplos:

| Ação | Resultado esperado |
|---|---|
| Desativar Bisavós | card Bisavós mantém contagem calculada |
| Desativar Falecidos quando todos os bisavós são falecidos | contagem de Bisavós pode ir para 0 |
| Reativar Falecidos | contagem volta |
| Desativar Cônjuges no Mapa Familiar | cônjuge principal e ancestrais não entram como cônjuges filtráveis |

No Mapa Familiar, a contagem efetiva de **Cônjuges** pode ser fornecida pela própria view para refletir apenas cônjuges filtráveis.

---

## 13. Interação com busca/favoritos

Estado atual:

- `/mapa-familiar` aparece na busca global e favoritos;
- `/mapa-familiar-horizontal` é rota oficial, mas deve ser avaliada separadamente para busca/favoritos;
- favorito de página salva rota, não estado de zoom, filtros ou pessoa central.

Pendência recomendada:

```txt
Decidir se /mapa-familiar-horizontal deve entrar em GLOBAL_SEARCH_PAGES e FAVORITE_PAGES como página própria.
```

---

## 14. Anti-regressões

Não fazer:

- misturar `personFilters.pets` com `directRelativeFilters.pets`;
- usar `genero = pet` como única fonte semântica de pet;
- ocultar cônjuge principal ao desligar **Cônjuges** no Mapa Familiar;
- ocultar cônjuges ancestrais ao desligar **Cônjuges**;
- transformar filtros de destaque em filtros de dados;
- controlar conectores HTML/CSS mobile por `edgeFilters` ReactFlow;
- reintroduzir pets como filhos humanos no visual quando existe grupo próprio;
- criar migration para ajuste puramente visual.

---

## 15. QA mínimo

Validar:

```txt
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
```

Checklist:

- filtro Vivos;
- filtro Falecidos;
- filtro Pets de status/tipo;
- filtro Pets de grupo;
- filtro Cônjuges;
- cônjuge principal;
- cônjuges ancestrais;
- cônjuges de tios/primos/sobrinhos/filhos/netos;
- contagens nos cards;
- mobile segmentado;
- exportação após filtros;
- paletas após filtros.
