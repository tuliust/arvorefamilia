# Mapa Familiar — views Vertical e Horizontal

> Última revisão: 2026-06-14  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`  
> Tipo: documentação funcional/técnica das duas views oficiais da árvore.  
> Status: atualizado após ajustes em títulos, painel desktop, modal mobile, mobile horizontal, paletas e avatares.

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

As duas views oficiais são experiências complementares da mesma árvore familiar.

| View | Rota | Papel |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | view vertical principal/default |
| Mapa Genealógico | `/mapa-familiar-horizontal` | alternativa horizontal por gerações |

Diferenças:

| Aspecto | Vertical | Horizontal |
|---|---|---|
| Organização | grupos familiares em canvas panorâmico | colunas por geração |
| Desktop/tablet | `DesktopFamilyMapView` | `DesktopFamilyHorizontalMapView` |
| Mobile | `MobileFamilyTreeView` | `MobileFamilyHorizontalMapView` |
| Navegação mobile | Paterno/Central/Materno | botões `Ger 1`, `Ger 2`, `Ger 3` e swipe |
| Título | `Árvore Familiar de {nome}` | `Mapa Genealógico de {nome}` |
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
| Modelo mobile vertical | `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` |
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
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |

Observação:

- “Genealogia” pode aparecer como termo conceitual ou keyword de busca;
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

## 6. Árvore Familiar Vertical

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
- expansão não deve afetar dados reais;
- pessoa central deve permanecer visível quando aplicável.

### 6.3 Modo wide

Quando o painel é colapsado:

- canvas ganha área útil;
- conectores acompanham offsets;
- grupos laterais não devem invadir o núcleo;
- exportação deve capturar superfície normalizada.

### 6.4 Mobile vertical

`MobileFamilyTreeView` mantém experiência própria:

```txt
Paterno
Central
Materno
```

Regras:

- não usar a navegação `Ger 1/Ger 2/...` da horizontal;
- conectores devem respeitar o alinhamento de referência do desktop;
- paletas mobile devem herdar tokens do desktop;
- não usar cores hardcoded como fonte de verdade visual.

---

## 7. Mapa Genealógico Horizontal

### 7.1 Arquitetura desktop

`DesktopFamilyHorizontalMapView` organiza:

1. pessoas por geração;
2. colunas;
3. cônjuges adjacentes;
4. filhos por casal;
5. conectores SVG;
6. compactação de colunas vazias;
7. exportação.

O desktop é a referência estrutural da hierarquia horizontal.

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
- a ordem deve preservar relações familiares e nascimento quando disponível;
- mobile não deve criar uma hierarquia alternativa divergente da desktop.

### 7.3 Conectores

Conectores:

- linha entre cônjuges;
- linha casal → gap;
- tronco vertical;
- ramais até filhos.

Regras:

- conector conjugal depende de relacionamento explícito;
- não inferir casamento por proximidade;
- conectores devem recalcular quando grupos/cabeçalhos mudam;
- no mobile, a altura rolável deve considerar cards e linhas conectoras visíveis.

### 7.4 Mobile horizontal

Componente:

```txt
MobileFamilyHorizontalMapView
```

Contrato:

```txt
1 geração = 1 tela
botões Ger 1/Ger 2/Ger 3... = atalho de geração
swipe lateral = troca de geração
scroll vertical = dentro da geração ativa
sem scroll horizontal manual
```

Regras:

- a primeira tela deve ser a menor geração visível, por exemplo `Ger 2`;
- os botões laterais com setas não devem aparecer;
- o botão de controles deve ficar alinhado à linha dos botões `Ger`;
- o scroll vertical deve ir até o último card ou até o fim das linhas conectoras visíveis;
- não usar `MobileFamilyTreeView`;
- não usar barra `Paterno | Central | Materno`;
- não criar subrota por geração;
- não aplicar CSS ReactFlow;
- a direção do swipe deve ser validada em aparelho real/iOS antes do fechamento de QA.

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
- pet usa `PawPrint` como avatar padrão quando não há foto;
- a cor de pets deve vir da paleta ativa, não de classe hardcoded.

---

## 10. Paletas e cards

Paletas oficiais:

```txt
white
visual
orange
brown
```

Contrato:

- desktop é a referência visual;
- mobile deve herdar os mesmos tokens `--tree-palette-*`;
- cards, bordas, texto, ícones, canvas e conectores devem mudar juntos;
- não usar classes fixas `teal/cyan/blue/orange/brown` no mobile como fonte de verdade visual;
- a exportação deve respeitar a paleta ativa.

---

## 11. Avatares

Contrato:

```txt
Pessoa com foto -> foto_principal_url
Pessoa sem foto -> User, lucide-react
Pet             -> PawPrint, lucide-react
```

Regras:

- não há mais avatar diferente para homem, mulher ou gênero neutro;
- todos os cards de pessoas sem foto usam o mesmo ícone `User`;
- pets usam `PawPrint`;
- fotos reais continuam com prioridade;
- avatares devem exportar corretamente e não virar quadrado escuro.

---

## 12. Exportação

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
- seleção por área captura área visível;
- `Exportar > Área` deve funcionar como toggle;
- loading deve permanecer até a ação real concluir;
- no mobile, o modal de controles não expõe Exportar.

Documento específico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 13. Painel e modal de controles

### Desktop

Controles vigentes:

```txt
Zoom +
Zoom -
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Grupos
Filtros
```

### Mobile

Controles vigentes:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros
```

No mobile, não exibir:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Regras:

- botão **Grupos** abre/fecha os cards de grupos;
- cards de grupos não aparecem por padrão;
- filtros ficam sempre visíveis;
- filtros devem caber em 4 colunas;
- título do modal deve ser `Controles`;
- subtítulo removido;
- botão superior direito usa ícone `X`.

---

## 14. Debug temporário

Pode existir, como ferramenta de diagnóstico, um dropdown:

```txt
Visualizar como...
```

Objetivo:

- renderizar `/mapa-familiar` e `/mapa-familiar-horizontal` usando outra pessoa da tabela `pessoas` como referência central;
- não navegar para `/pessoa/:id`;
- não alterar dados;
- não entrar na exportação.

Regras:

- deve ser marcado como debug temporário;
- deve ter `data-tree-export-ignore="true"`;
- antes de produção, decidir se permanece, se fica protegido por flag/admin ou se será removido.

---

## 15. QA obrigatório

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
- avatares;
- exportação PNG/PDF/imprimir;
- modal mobile de controles;
- swipe da horizontal mobile;
- scroll vertical até conectores no mobile horizontal.

---

## 16. Anti-regressões

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
