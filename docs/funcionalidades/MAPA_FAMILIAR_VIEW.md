# Mapa Familiar - views Vertical e Horizontal

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`  
> Tipo: documentação funcional/técnica das duas views oficiais da árvore.  
> Status: alinhado à baseline atual: `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 1. Função deste documento

Este documento descreve as duas views oficiais da árvore:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Use para manter:

- comportamento das views;
- componentes responsáveis;
- filtros;
- cônjuges;
- pets;
- conectores;
- exportação;
- paletas;
- mobile;
- anti-regressões.

Não confundir com rotas antigas removidas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

---

## 2. Conceito

O Mapa Familiar é a experiência visual da árvore.

| View | Rota | Papel |
|---|---|---|
| Mapa Familiar | `/mapa-familiar` | view principal/default |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | alternativa horizontal/genealógica |

Diferenças:

| Aspecto | Vertical | Horizontal |
|---|---|---|
| Organização | grupos familiares em canvas panorâmico | colunas por geração |
| Desktop/tablet | `DesktopFamilyMapView` | `DesktopFamilyHorizontalMapView` |
| Mobile | `MobileFamilyTreeView` | `MobileFamilyHorizontalMapView` |
| Navegação mobile | Paterno/Central/Materno | chips e swipe por geração |
| Título | `Mapa Familiar de {nome}` | `Genealogia de {nome}` |
| Exportação | root HTML/CSS/SVG vertical | root HTML/CSS/SVG horizontal |

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| View vertical desktop/tablet | `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` |
| View horizontal desktop/tablet | `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx` |
| View vertical mobile | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| View horizontal mobile | `src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx` |
| Cards visuais | `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` |
| Modelo mobile | `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` |
| Layout direto/helper | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Layout de referência horizontal | `src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts` |
| Tipos e filtros | `src/app/components/FamilyTree/types.ts` |
| Exportação | `src/app/components/FamilyTree/utils/treeExport.ts` |
| Área selecionada | `src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx` |
| Shell/renderização | `src/app/pages/home/HomeTreeSection.tsx` |
| Painel | `src/app/pages/home/SidebarPanelTabs.tsx` |
| Navegação mobile | `src/app/pages/home/HomeMobileNav.tsx` |
| CSS vertical/paletas | `src/styles/family-map-qa.css` |
| CSS horizontal | `src/styles/family-map-horizontal.css` |
| CSS painel | `src/styles/home-sidebar-unified.css` |
| CSS controles mobile | `src/styles/mobile-tree-controls.css` |

---

## 4. Rotas e títulos

Rotas oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Redirect:

```txt
/ -> /mapa-familiar
```

Regras:

- preservar `location.search`;
- preservar `?pessoa=...`;
- alternância Vertical/Horizontal não pode limpar query params;
- `/mapa-horizontal` não é rota oficial;
- `/genealogia` não é rota oficial;
- `/visao-completa` não é rota oficial.

Títulos:

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Mapa Familiar de {primeiroNome}` ou `Mapa Familiar` |
| `/mapa-familiar-horizontal` | `Genealogia de {primeiroNome}` ou `Genealogia` |

Observação:

- “Genealogia” pode ser usado como título conceitual da horizontal;
- isso não reativa a rota `/genealogia`.

---

## 5. `TreeViewMode`

Contrato vigente:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Mapeamento:

| ViewMode | Path |
|---|---|
| `mapa-familiar` | `/mapa-familiar` |
| `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Fallback:

```txt
getTreeViewModeFromPath(pathname) -> mapa-familiar
```

---

## 6. Mapa Familiar Vertical

### 6.1 Arquitetura

`DesktopFamilyMapView` organiza:

1. pessoas visíveis;
2. grupos diretos;
3. cônjuges;
4. pets;
5. layout das áreas;
6. expansão/recolhimento;
7. conectores SVG;
8. zoom/scroll;
9. exportação.

### 6.2 Grupos

Grupos principais:

```txt
tataravos
bisavos
avos
pais
tios
primos
sobrinhos
irmaos
filhos
netos
conjuge
pets
```

Regras:

- `Cônjuges` e `Pets` são filtros;
- `Filhos` usa ícone próprio;
- grupos podem ter contagem efetiva renderizada;
- expansão não deve afetar dados reais.

### 6.3 Modo wide

Quando o painel é colapsado:

- canvas ganha área útil;
- conectores acompanham offsets;
- grupos laterais não devem invadir o núcleo;
- exportação deve capturar superfície normalizada.

### 6.4 `Destacar > Grupos`

Comportamento:

- remove molduras, fundos e sombras dos grupos;
- oculta títulos dos grupos;
- oculta labels `PAI`, `MÃE`, `CÔNJUGE`;
- mantém cards visíveis;
- recalcula conectores/âncoras.

Atributos úteis:

```txt
data-family-map-group="true"
data-family-map-group-title="true"
data-family-map-chrome-hidden="true"
```

---

## 7. Mapa Familiar Horizontal

### 7.1 Arquitetura

`DesktopFamilyHorizontalMapView` organiza:

1. pessoas por geração;
2. colunas;
3. cônjuges adjacentes;
4. filhos por casal;
5. conectores SVG;
6. compactação de colunas vazias;
7. exportação.

### 7.2 Gerações

Fonte primária:

```txt
pessoas.manual_generation
```

Faixa esperada:

```txt
1 a 6
```

Regras:

- valores ausentes podem ser inferidos em memória;
- inferência visual não deve persistir no Supabase;
- colunas vazias são ocultadas;
- a ordem deve preservar relações familiares e nascimento quando disponível.

### 7.3 Conectores

Conectores:

- linha entre cônjuges;
- linha casal → gap;
- tronco vertical;
- ramais até filhos.

Regras:

- conector conjugal depende de relacionamento explícito;
- não inferir casamento por proximidade;
- conectores devem recalcular quando grupos/cabeçalhos mudam.

### 7.4 Mobile horizontal

Componente:

```txt
MobileFamilyHorizontalMapView
```

Contrato:

```txt
1 geração = 1 tela
chips G1/G2/G3... = atalho de geração
swipe esquerda = próxima geração
swipe direita = geração anterior
scroll vertical = dentro da geração ativa
```

Regras:

- não usar `MobileFamilyTreeView`;
- não usar barra `Paterno | Central | Materno`;
- não criar subrota por geração;
- não aplicar CSS ReactFlow.

---

## 8. Cônjuges

### 8.1 Sempre visíveis

Não dependem do filtro `Cônjuges`:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### 8.2 Filtráveis

Dependem do filtro `Cônjuges`:

- cônjuges de tios;
- cônjuges de primos;
- cônjuges de sobrinhos;
- cônjuges de filhos;
- cônjuges de netos.

### 8.3 Contagem

A contagem deve refletir o que a view renderiza.

Regra:

```txt
Cônjuge sempre visível não deve inflar contagem de filtro filtrável.
```

---

## 9. Pets

Regras:

- pets são pessoas/tipos especiais no modelo atual;
- `Pets` aparece como filtro;
- pets também são considerados em `personFilters`;
- não remover compatibilidade de pets sem migração de dados;
- paleta visual usa teal/ciano para pets.

---

## 10. Paletas e cards

Paletas:

```txt
white
visual
orange
brown
```

Cards:

- usam `FamilyTreeVisualCards`;
- devem manter legibilidade;
- avatares e ícones devem exportar corretamente;
- não usar seletor global de SVG.

---

## 11. Exportação

Ações:

```txt
Área
Imagem
PDF
Imprimir
```

Regras:

- exportar superfície da view ativa;
- incluir título no canvas;
- ignorar painel/header/bottom nav/modal/loading;
- preservar conectores e paleta;
- seleção por área captura área visível.

Documento específico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 12. Painel

Estado atual:

- controles superiores existem;
- abas `Filtros`, `Legendas`, `Ações` ainda existem;
- próxima frente deve remover as abas e deixar filtros diretos visíveis.

Controles que não podem quebrar:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
```

---

## 13. QA obrigatório

Validar:

```txt
320px
375px
390px
430px
768px
1024px
1366px
1440px
1536px
1920px
```

Fluxos:

- `/` com query string;
- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- alternância com `?pessoa=...`;
- abertura de perfil e retorno;
- filtros de grupos;
- cônjuges;
- pets;
- paletas;
- exportação PNG/PDF/imprimir;
- modal mobile de controles;
- swipe da horizontal mobile.

---

## 14. Anti-regressões

Não reintroduzir:

```txt
/minha-arvore
/genealogia
/visao-completa
```

como views ativas.

Não remover sem plano próprio:

```txt
directFamilyDistributedLayout.ts
genealogyColumnsLayout.ts
FamilyTreeActions
```

Não alterar dados reais por ajuste visual.
