# Mapa Familiar - views Vertical e Horizontal

> Última revisão: 2026-06-11  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`  
> Tipo: documentação técnica/funcional das views **Mapa Familiar Vertical** e **Mapa Familiar Horizontal**.  
> Status: documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`, com layout panorâmico vertical, layout horizontal por gerações, filtros de grupos, regras de cônjuges, conectores SVG, paletas, exportação, mobile e anti-regressões.

## 1. Função deste documento

Este documento descreve as views do **Mapa Familiar**:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Use este arquivo para manter:

- objetivo funcional das views;
- diferença entre Minha Árvore, Mapa Familiar Vertical, Mapa Familiar Horizontal, Genealogia e Visão Completa;
- integração com `treeViewMode`;
- arquitetura de `DesktopFamilyMapView.tsx`;
- arquitetura de `DesktopFamilyHorizontalMapView.tsx`;
- uso dos cards compartilhados de `FamilyTreeVisualCards.tsx`;
- regras de grupos, colunas, expansão e limites;
- regras de `manual_generation`;
- regras de cônjuges principais, ancestrais e colaterais;
- conectores SVG da vertical;
- conectores SVG da horizontal;
- zoom e exportação;
- avatares visuais por `genero`;
- comportamento mobile;
- QA visual manual e anti-regressões.

Não use este documento para detalhar:

| Tema | Documento |
|---|---|
| view direta ReactFlow e mobile segmentado | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
| painel lateral, filtros globais e legenda geral | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| filtros e pets em detalhe | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| componentes gerais | `docs/GUIA_COMPONENTES.md` |
| UX geral | `docs/GUIA_UX_LAYOUT.md` |
| arquitetura geral | `docs/arquitetura/ARCHITECTURE.md` |

---

## 2. Conceito das views

O **Mapa Familiar** é o conjunto de views visuais da família direta.

| View | Rota | Renderização principal |
|---|---|---|
| Mapa Familiar Vertical | `/mapa-familiar` | HTML/CSS/SVG panorâmico no desktop/tablet; `MobileFamilyTreeView` no mobile |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | HTML/CSS/SVG por colunas de geração no desktop/tablet/mobile |

Diferenças principais:

| Aspecto | Vertical | Horizontal |
|---|---|---|
| Componente | `DesktopFamilyMapView` | `DesktopFamilyHorizontalMapView` |
| Organização | grupos familiares posicionados em canvas panorâmico | colunas por geração |
| Base visual | família direta centrada | gerações 1 a 6 |
| Coluna | não usa coluna fixa por geração | usa `manual_generation` como fonte primária |
| Conectores | SVG por âncoras de grupos | SVG casal → filhos |
| Mobile | `MobileFamilyTreeView` | mesma view horizontal com barra mobile própria |
| Painel | grupos + vida + ações | mesmo painel |
| Exportação | superfície HTML/CSS/SVG | superfície HTML/CSS/SVG |

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| View vertical desktop/tablet | `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` |
| View horizontal | `src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx` |
| Cards visuais compartilhados | `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` |
| Modelo de dados da família direta | `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` |
| Escopo direto ReactFlow/base | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Referência genealógica da horizontal | `src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts` |
| Tipos da árvore e filtros diretos | `src/app/components/FamilyTree/types.ts` |
| Renderização da área principal da Home | `src/app/pages/home/HomeTreeSection.tsx` |
| Painel de controles | `src/app/pages/home/SidebarPanelTabs.tsx` |
| Filtros diretos | `src/app/pages/home/DirectRelativeFilterGrid.tsx` |
| Rotas | `src/app/routes.tsx` |
| View mode | `src/app/components/FamilyTree/treeViewMode.ts` |
| Paletas | `src/app/components/FamilyTree/treeColorPalettes.ts` |
| Cores de grupos diretos | `src/app/components/FamilyTree/directFamilyColors.ts` |
| CSS horizontal | `src/styles/family-map-horizontal.css` |
| CSS/QA do mapa | `src/styles/family-map-qa.css` |

---

## 4. Rotas e `treeViewMode`

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Contrato atual:

```ts
export type TreeViewMode =
  | 'minha-arvore'
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal'
  | 'genealogia'
  | 'visao-completa';
```

Mapeamento:

```ts
'mapa-familiar': '/mapa-familiar'
'mapa-familiar-horizontal': '/mapa-familiar-horizontal'
```

Regras:

- `/mapa-familiar` e `/mapa-familiar-horizontal` usam o mesmo shell autenticado `Home`;
- ambas preservam search params como `?pessoa=...`;
- ambas preservam a pessoa central selecionada;
- ambas respeitam filtros do painel;
- `/` redireciona para `/mapa-familiar`;
- `/mapa-familiar-horizontal` não deve redirecionar para `/visao-completa`;
- `/mapa-horizontal` e `/visao-completa-teste` não existem mais.

---

## 5. Painel e navegação

No desktop, o painel exibe:

| Botão | View | Rota |
|---|---|---|
| Vertical | `mapa-familiar` | `/mapa-familiar` |
| Horizontal | `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Ambas as views usam os mesmos filtros diretos:

```txt
Tataravós
Bisavós
Avós
Pais
Tios
Primos
Sobrinhos
Irmãos
Filhos
Netos
Cônjuges
Pets
```

E os mesmos filtros de vida:

```txt
Vivos
Falecidos
Pets
```

Observação importante:

- `directRelativeFilters.pets` ainda precisa de revisão em `Home.tsx` se houver trecho forçando `pets: true`, porque isso pode impedir o botão de grupo **Pets** de ocultar cards como esperado.

---

## 6. Mapa Familiar Vertical - `/mapa-familiar`

### 6.1 Arquitetura

`DesktopFamilyMapView.tsx` deve manter separadas estas camadas:

1. configuração de layout;
2. composição dos grupos;
3. políticas de cônjuges;
4. regras de expansão e colunas;
5. cálculo de âncoras;
6. conectores SVG;
7. renderização de grupos;
8. renderização de cards diretos;
9. zoom e escala responsiva.

Estrutura esperada:

```txt
FAMILY_MAP_LAYOUT
types auxiliares
helpers de composição
helpers de layout
helpers de conectores
PositionedGroup
DirectPersonCard
DesktopFamilyMapView
```

### 6.2 Grupos

Tipos conceituais:

```txt
ancestor
lateral-many
central-small
descendant
pet
direct-card
single
```

Grupos principais:

| Grupo | Papel |
|---|---|
| Tataravós | ancestrais |
| Bisavós | ancestrais |
| Avós | ancestrais |
| Pais | pai/mãe da pessoa central |
| Cônjuge | cônjuge da pessoa central |
| Irmãos | irmãos da pessoa central |
| Sobrinhos | filhos de irmãos |
| Tios | irmãos dos pais |
| Primos | filhos dos tios |
| Filhos | filhos da pessoa central |
| Netos | netos da pessoa central |
| Pets | pets vinculados |

### 6.3 Modo wide

Quando `sidebarCollapsed === true`, `DesktopFamilyMapView` usa layout wide.

Regras:

- canvas deve continuar centralizado;
- não usar alinhamento forçado à esquerda;
- margens paterna/materna precisam ficar proporcionais;
- grupos inferiores não podem se sobrepor;
- `Cônjuge` e `Pets` não podem colidir;
- conectores inferiores continuam legíveis.

### 6.4 Destaque de grupos

No Mapa Familiar Vertical, **Destacar > Grupos**:

- não aplica sombra;
- oculta molduras, fundos e títulos dos containers de grupo;
- mantém os cards de pessoas e conectores visíveis.

### 6.5 Cônjuges na vertical

Regras:

- cônjuge da pessoa central permanece visível quando existir;
- cônjuges de tataravós, bisavós e avós aparecem por padrão;
- cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**;
- cônjuges não devem ser conectados à pessoa errada;
- conectores internos entre cônjuges só devem existir para relações conjugais explícitas.

### 6.6 Mobile da vertical

Em mobile, `/mapa-familiar` usa `MobileFamilyTreeView`.

Comportamento:

- barra nativa **Paterno | Central | Materno**;
- botão de controle alinhado à barra;
- painel inferior com filtros/ações;
- cards com anos;
- card central sem badge **Você**;
- conectores no contexto rolável;
- não há toggle **Vertical/Horizontal**.

---

## 7. Mapa Familiar Horizontal - `/mapa-familiar-horizontal`

### 7.1 Objetivo

A view horizontal organiza a família em colunas de geração, com visual do Mapa Familiar e conectores simplificados por casal.

Objetivo:

```txt
Mostrar gerações em colunas compactas, preservando filtros e aparência do Mapa Familiar.
```

### 7.2 Arquitetura

Componente:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Camadas internas:

1. leitura de relacionamentos;
2. cálculo de escopo visível;
3. reinclusão de cônjuges;
4. cálculo de geração;
5. referência de ordenação pela Visão Completa;
6. agrupamento por geração;
7. ordenação de filhos;
8. adjacência de cônjuges;
9. cálculo de layouts;
10. cálculo de conectores;
11. renderização de cards;
12. exportação.

### 7.3 Colunas por geração

A coluna é definida por:

```txt
pessoas.manual_generation
```

Regras:

- valores válidos são de 1 a 6;
- valores fora da faixa são limitados;
- se `manual_generation` não existir ou for inválido, a geração pode ser inferida;
- cônjuges herdam a geração do cônjuge conectado quando necessário;
- pessoa central usa fallback de geração 5 se não houver valor;
- inferência não persiste no Supabase.

### 7.4 Colunas vazias

Regras:

- colunas sem cards visíveis são ocultadas;
- as demais colunas são compactadas;
- cabeçalhos usam apenas gerações ativas;
- conectores são recalculados com base no índice compacto;
- canvas width é calculado pelas colunas ativas.

### 7.5 Ordenação dos cards

A ordenação usa:

1. posição de referência de `genealogyColumnsLayout`;
2. posição vertical `y`;
3. posição horizontal `x`;
4. fallback por nascimento;
5. fallback por nome.

Além disso:

- filhos do mesmo casal são agrupados pelo par de pais;
- filhos são ordenados do mais velho para o mais novo;
- cônjuges visíveis da mesma geração são posicionados em linhas coladas.

### 7.6 Cônjuges na horizontal

Constantes conceituais:

```txt
Sempre visíveis: cônjuge central, cônjuges de avós, bisavós e tataravós.
Filtráveis: cônjuges de tios, primos, sobrinhos, filhos e netos.
```

Regras:

- cônjuge da pessoa central é sempre reincluído quando existir e passar nos filtros de vida;
- cônjuges de avós, bisavós e tataravós são sempre reincluídos;
- cônjuges de tios, primos, sobrinhos, filhos e netos dependem do filtro **Cônjuges**;
- cônjuges reincluídos fora do escopo direto recebem tom/label **Cônjuge**;
- cônjuges devem ficar imediatamente acima/abaixo um do outro;
- se o cônjuge não passar no filtro de vida/tipo, não deve ser reincluído.

### 7.7 Conectores da horizontal

Sistema:

```txt
SVG próprio dentro de DesktopFamilyHorizontalMapView
```

Conector de cônjuges:

```txt
centro inferior do card superior
↓
centro superior do card inferior
```

Conector casal → filhos:

1. encontrar filhos comuns do casal;
2. pegar o meio da linha vertical entre cônjuges;
3. sair com linha horizontal até o gap entre colunas;
4. criar tronco vertical no gap;
5. tronco vai do primeiro ao último filho;
6. cada filho recebe ramal horizontal até o card;
7. quando vários casais usam o mesmo gap, distribuir troncos em `x` diferentes.

Regras:

- não desenhar linhas entre pais/filhos fora do modelo casal → filhos;
- não ocultar SVG globalmente;
- recalcular conectores ao filtrar grupos;
- não deixar linhas conectarem cards invisíveis;
- se casal não tiver filho visível na geração seguinte, manter apenas linha de cônjuge.

### 7.8 Cards e cores

A horizontal usa `VisualPersonCard`.

Regras:

- usa paleta/cores do Mapa Familiar;
- estrela e cruz de status herdam o contraste definido pelo card em cada paleta;
- Pets usa tom teal/ciano próprio na paleta Visual;
- cônjuges têm tom próprio;
- pets usam tom próprio;
- cards ficam compactos;
- cards mantêm avatar, nome e anos;
- foto real tem prioridade sobre avatar fallback.

### 7.9 Mobile da horizontal

Em mobile, `/mapa-familiar-horizontal` usa a própria view horizontal.

Comportamento atual:

- barra visual **Paterno | Central | Materno** renderizada em `HomeMobileNav`;
- **Central** ativo por padrão;
- botões da barra ainda não possuem função definida;
- botão de controle fica alinhado à barra;
- painel inferior abre filtros/ações;
- não há toggle **Vertical/Horizontal**.

Pendência:

```txt
Definir comportamento funcional da barra Paterno/Central/Materno na horizontal.
```

---

## 8. Zoom

Nas views do Mapa Familiar:

- `Ctrl + scroll` aplica zoom interno;
- zoom não deve alterar header, painel lateral ou bottom nav;
- `Ctrl/Cmd + +` e `Ctrl/Cmd + -` devem acionar zoom da árvore quando interceptados pelo app;
- **Restaurar visualização** redefine diretamente o zoom e a posição de rolagem iniciais;
- zoom não deve alterar dados ou filtros.

---

## 9. Exportação

Ambas as views do Mapa Familiar exportam superfície HTML/CSS/SVG.

| View | Nome base |
|---|---|
| `/mapa-familiar` | `mapa-familiar` |
| `/mapa-familiar-horizontal` | `mapa-familiar-horizontal` |

Regras:

- exportar superfície atual;
- não prometer árvore completa server-side;
- não prometer PDF multipágina;
- preservar paleta, cards e conectores;
- ignorar controles quando marcados para exportação;
- validar fidelidade visual manualmente.

---

## 10. Anti-regressões

Não fazer:

- substituir `/mapa-familiar` por `/mapa-familiar-horizontal`;
- substituir `/visao-completa` pela horizontal;
- apontar **Horizontal** para `/visao-completa`;
- recriar `/mapa-horizontal` ou `/visao-completa-teste`;
- misturar conectores ReactFlow com conectores SVG das views do Mapa Familiar;
- esconder todos os conectores SVG da horizontal;
- quebrar adjacência de cônjuges;
- deixar filhos fora da ordem de nascimento;
- renderizar colunas vazias;
- ocultar cônjuge principal pelo filtro **Cônjuges**;
- ocultar cônjuges ancestrais pelo filtro **Cônjuges**;
- tratar `manual_generation` como dado a ser alterado pela view;
- usar CSS global sem escopo para corrigir layout.

---

## 11. QA mínimo

### Desktop

Validar:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Checklist:

- Vertical/Horizontal no painel;
- filtros de grupos;
- filtros de vida;
- filtro Cônjuges;
- filtro Pets;
- paletas Branca, Azul, Laranja e Marrom;
- zoom;
- exportação;
- painel colapsado;
- colunas vazias;
- conectores casal → filhos.

### Mobile

Validar:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Breakpoints:

```txt
320px
375px
390px
430px
```

Checklist:

- sem toggle Vertical/Horizontal;
- barra Paterno/Central/Materno no lugar correto;
- botão de controle alinhado à barra;
- painel inferior abre e fecha;
- bottom nav não cobre conteúdo essencial;
- Safari/iOS respeita safe-area.

---

## 12. Pendências conhecidas

| Pendência | Local |
|---|---|
| Corrigir/validar filtro de grupo **Pets** | `Home.tsx` / filtros diretos |
| Definir função da barra mobile da horizontal | Produto/UX |
| QA real dos conectores da horizontal com filtros combinados | `DesktopFamilyHorizontalMapView.tsx` |
| QA visual autenticado da vertical em modo wide | `DesktopFamilyMapView.tsx` |
| QA de exportação das duas views | `treeExport.ts` + views |
