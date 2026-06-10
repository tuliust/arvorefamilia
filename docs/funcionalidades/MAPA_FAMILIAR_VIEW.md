# Mapa Familiar - view panorâmica desktop/tablet

> Última revisão: 2026-06-10  
> Local canônico: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Mapa Familiar**.  
> Status: documento canônico da rota `/mapa-familiar`, com layout panorâmico desktop/tablet, fallback mobile, grupos expansíveis, regras de cônjuges, conectores SVG, zoom e avatares por `genero`.

## 1. Função deste documento

Este documento descreve a view **Mapa Familiar**, acessada pela rota:

```txt
/mapa-familiar
```

Use este arquivo para manter:

- objetivo funcional da view panorâmica;
- diferença entre **Minha Árvore** e **Mapa Familiar**;
- integração com `treeViewMode`;
- arquitetura de `DesktopFamilyMapView.tsx`;
- uso dos cards compartilhados de `FamilyTreeVisualCards.tsx`;
- regras de grupos, colunas, expansão e limites;
- regras de cônjuges principais, ancestrais e colaterais;
- conectores SVG principais por âncoras;
- conectores internos entre cônjuges;
- zoom com `Ctrl + scroll`;
- avatares visuais por coluna `genero`;
- fallback mobile;
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

## 2. Conceito da view

O **Mapa Familiar** é uma quarta visualização da árvore familiar.

Views principais da árvore:

| View | Rota | Renderização principal |
|---|---|---|
| Minha Árvore | `/minha-arvore` | ReactFlow no desktop/tablet; `MobileFamilyTreeView` no mobile |
| Mapa Familiar | `/mapa-familiar` | HTML/CSS/SVG panorâmico no desktop/tablet; fallback mobile |
| Genealogia | `/genealogia` | ReactFlow |
| Visão Completa | `/visao-completa` | ReactFlow |

O **Mapa Familiar** não substitui a **Minha Árvore**. Ele é uma visualização panorâmica da família direta, com estética visual derivada da experiência mobile, mas adaptada para uma única tela desktop/tablet.

Diferença central:

| Aspecto | Minha Árvore | Mapa Familiar |
|---|---|---|
| Desktop/tablet | ReactFlow | HTML/CSS/SVG próprio |
| Mobile | malha segmentada 3×3 | fallback seguro para `MobileFamilyTreeView` |
| Navegação | pan/zoom ReactFlow | canvas panorâmico com zoom via `Ctrl + scroll` |
| Conectores | edges ReactFlow | SVG por âncoras de grupos |
| Cards | `PersonNode` | `FamilyTreeVisualCards` |
| Grupos | layout ReactFlow distribuído | configuração centralizada em `FAMILY_MAP_LAYOUT` |

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| View panorâmica desktop/tablet | `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` |
| Cards visuais compartilhados | `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` |
| Modelo de dados da família direta | `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` |
| Tipos da árvore e filtros diretos | `src/app/components/FamilyTree/types.ts` |
| Renderização da área principal da Home | `src/app/pages/home/HomeTreeSection.tsx` |
| Seletor/header de views | `src/app/pages/home/HomeHeader.tsx` |
| Filtros diretos no painel | `src/app/pages/home/DirectRelativeFilterGrid.tsx` |
| Rotas | `src/app/routes.tsx` |
| View mode | `src/app/utils/treeViewMode.ts` |
| Paletas | `src/app/components/FamilyTree/treeColorPalettes.ts` |
| Cores de grupos diretos | `src/app/components/FamilyTree/directFamilyColors.ts` |

---

## 4. Rota e `treeViewMode`

A rota é:

```txt
/mapa-familiar
```

`treeViewMode` deve reconhecer:

```txt
'minha-arvore' | 'mapa-familiar' | 'genealogia' | 'visao-completa'
```

Regras:

- `/mapa-familiar` deve usar o mesmo shell autenticado das demais views da árvore;
- deve preservar search params como `?pessoa=...`;
- deve preservar a pessoa central selecionada;
- deve respeitar filtros do painel quando aplicável;
- deve ser acessível pelo seletor de views como **Mapa Familiar**;
- não deve alterar ou substituir `/minha-arvore`;
- no mobile, deve usar fallback seguro para `MobileFamilyTreeView` ou comportamento equivalente definido pelo app.

---

## 5. Arquitetura do `DesktopFamilyMapView`

`DesktopFamilyMapView.tsx` deve manter separadas estas camadas:

1. **configuração de layout**;
2. **composição dos grupos**;
3. **políticas de cônjuges**;
4. **regras de expansão e colunas**;
5. **cálculo de âncoras**;
6. **conectores SVG**;
7. **renderização de grupos**;
8. **renderização de cards diretos**;
9. **zoom e escala responsiva**.

A view foi estabilizada para usar uma configuração centralizada, em vez de coordenadas soltas espalhadas no JSX.

Estrutura esperada no arquivo:

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

---

## 6. `FAMILY_MAP_LAYOUT`

A configuração centralizada deve conter, no mínimo:

```txt
canvas
metrics
connectors
areas
groups
```

### 6.1 `canvas`

Define:

- largura base do canvas;
- altura mínima;
- cor de fundo;
- escala mínima;
- zoom mínimo;
- zoom máximo;
- passo de zoom.

Regras:

- fundo da área do título e fundo da área da árvore devem usar o mesmo azul claro;
- canvas deve evitar overflow horizontal indevido;
- `Ctrl + scroll` deve aplicar zoom sem bloquear scroll normal.

### 6.2 `metrics`

Define espaçamentos e alturas de referência, como:

- início superior;
- gap vertical entre grupos;
- padding interno de grupos;
- gap de grid;
- altura dos cards horizontais;
- altura dos cards mini;
- altura dos cards de pai/mãe/cônjuge;
- altura do card da pessoa central;
- gaps entre ancestrais, pais, central e descendentes.

### 6.3 `areas`

Define áreas conceituais do canvas:

| Área | Papel |
|---|---|
| `left` | tios/primos paternos |
| `paternalAncestors` | tataravós, bisavós e avós paternos |
| `center` | eixo principal |
| `maternalAncestors` | tataravós, bisavós e avós maternos |
| `right` | tios/primos maternos |
| `lowerLeft` | irmãos e sobrinhos |
| `lowerMiddle` | pets ou apoio inferior central |
| `lowerRight` | cônjuge, filhos e netos |

Regras para laterais:

- `Tios Paternos` e `Primos Paternos` devem ocupar a área vazia da esquerda;
- `Tios Maternos` e `Primos Maternos` devem ocupar a área vazia da direita;
- laterais não devem invadir o núcleo central;
- laterais não devem cortar na borda da viewport;
- manter margem lateral mínima;
- ajustes devem ser feitos preferencialmente em `areas.left`, `areas.right` e configs dos grupos laterais.

### 6.4 `groups`

Cada grupo deve declarar explicitamente:

- `id`;
- `title`;
- `kind`;
- `area`;
- `x`;
- `y`;
- `width`;
- `singleWidth`, quando aplicável;
- `columns`;
- `collapsedLimit`;
- `variant`;
- `expandable`;
- `allowsSpouses`;
- `spousePolicy`;
- `spouseTone`;
- flags: `isLateral`, `isAncestor`, `isLower`, `isDirectCard`.

Não espalhar valores de posição/largura diretamente no JSX sem passar pela configuração.

---

## 7. Tipos de grupo

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

### 7.1 `ancestor`

Usado para:

- Tataravós;
- Bisavós;
- Avós.

Regras:

- até 2 colunas;
- cônjuges aparecem por padrão;
- cônjuges ancestrais usam tom `ancestorSpouse`;
- conectores internos entre cônjuges só devem existir para relações conjugais explícitas;
- pares devem ficar lado a lado quando possível;
- não conectar visualmente cônjuge à pessoa errada.

### 7.2 `lateral-many`

Usado para:

- Tios Paternos;
- Primos Paternos;
- Tios Maternos;
- Primos Maternos.

Regras:

- até 4 colunas;
- limite inicial de 8 cards;
- botão `+` exibe demais linhas;
- deve ocupar laterais sem invadir núcleo;
- cônjuges colaterais aparecem apenas quando filtro **Cônjuges** estiver ativo;
- cards devem ter largura suficiente para exibir nome e segundo nome quando possível.

### 7.3 `central-small`

Usado para:

- Irmãos;
- Sobrinhos.

Regras:

- até 2 colunas;
- grupos com uma pessoa não devem ter espaço vazio excessivo;
- card único deve ocupar a largura útil sem ficar exageradamente largo;
- linha entre irmãos e sobrinhos deve permanecer vertical e centralizada.

### 7.4 `descendant`

Usado para:

- Filhos;
- Netos.

Regras:

- até 2 colunas;
- cônjuges aparecem apenas quando filtro **Cônjuges** estiver ativo;
- netos ficam abaixo de filhos quando aplicável.

### 7.5 `pet`

Usado para:

- Pets.

Regras:

- pet usa ícone de pet;
- pet não usa avatar humano;
- `genero = pet` deve reforçar esse comportamento;
- a cor do pet segue o padrão visual atual definido nos cards.

### 7.6 `direct-card`

Usado para:

- Pai;
- Mãe;
- Pessoa Central;
- Cônjuge principal.

Regras:

- pai, mãe, pessoa central e cônjuge principal podem exibir local + ano;
- cônjuge principal sempre aparece quando existir, independentemente do filtro **Cônjuges**;
- esses cards não devem ser tratados como grupos expansíveis.

---

## 8. Regras de cônjuges

O filtro lateral deve ser exibido como:

```txt
Cônjuges
```

Não usar mais o rótulo singular **Cônjuge** para o filtro.

### 8.1 Política de exibição

| Tipo de cônjuge | Exibição |
|---|---|
| Cônjuge da pessoa central | sempre aparece, se existir |
| Cônjuges de tataravós, bisavós e avós | aparecem por padrão |
| Cônjuges de tios, primos, sobrinhos, filhos e netos | aparecem apenas quando filtro **Cônjuges** está ativo |

### 8.2 Política técnica

Cônjuges devem ser compostos por política:

```txt
never
always
filter
```

Onde:

- `never`: não inclui cônjuges;
- `always`: inclui cônjuges por padrão;
- `filter`: inclui cônjuges apenas se `directRelativeFilters.conjuge === true`.

### 8.3 Pareamento

Regras obrigatórias:

- não inferir cônjuges apenas por proximidade visual;
- usar relações explícitas `tipo_relacionamento === 'conjuge'`;
- se não houver informação suficiente, não desenhar conector interno;
- preferir não conectar a conectar errado;
- casais devem ficar lado a lado quando possível;
- se um casal quebraria no fim da linha, o layout pode usar espaçador invisível para manter o par junto.

Exemplos de anti-regressão:

```txt
Enildes Barros deve conectar com Marcos Alfredo, não com Absalon Limeira.
Márcia Tereza deve conectar com Mário Assis, não com Maria Acileide.
```

### 8.4 Cores dos cônjuges

Estado visual atual:

- cônjuge principal e cônjuges nos grupos usam tom específico definido por `tone`/`spouseTone`;
- cônjuges de ancestrais usam `ancestorSpouse`;
- cônjuges colaterais devem seguir a cor definida para cônjuges dentro de grupos, conforme decisão visual vigente;
- não alterar a cor de pets ao mudar a cor de cônjuges.

---

## 9. Grupos expansíveis

`VisualGroup` deve suportar:

- `expandable`;
- `collapsedLimit`;
- `expanded`;
- `onExpandedChange`;
- `disableInternalScroll`;
- `titleVariant="pill"`;
- botão `+ / -`.

Regras:

- grupos não devem usar scroll interno apertado como padrão;
- grupos crescem verticalmente ao expandir;
- botão `+` aparece quando há mais pessoas que o limite;
- botão `-` recolhe;
- clique no botão não deve abrir card;
- o botão deve ter `aria-label` e `title`;
- títulos internos dos grupos não devem ocupar linha dentro do card quando `titleVariant="pill"`;
- pílulas de título usam cinza azulado médio.

### 9.1 Limites

| Grupo | Colunas | Limite inicial |
|---|---:|---:|
| Tios | 4 | 8 |
| Primos | 4 | 8 |
| Ancestrais | 2 | 4 |
| Irmãos | 2 | 2 |
| Sobrinhos | 2 | 2 |
| Filhos | 2 | 2 |
| Netos | 2 | 2 |
| Pets | 1 | 2 |

---

## 10. Conectores principais

O Mapa Familiar usa um overlay SVG absoluto atrás dos grupos/cards.

Conectores principais:

- tataravós → bisavós → avós;
- avós paternos → pai;
- avós paternos → tios paternos;
- avós maternos → mãe;
- avós maternos → tios maternos;
- pai/mãe → pessoa central;
- tios paternos → primos paternos;
- tios maternos → primos maternos;
- pessoa central → ramo inferior;
- ramo inferior esquerdo → irmãos/sobrinhos;
- ramo inferior direito → cônjuge/filhos/pets/netos;
- filhos → netos quando aplicável.

Regras:

- conectores principais usam cor clara;
- conectores principais devem ser gerados por âncoras de grupos;
- não usar coordenadas soltas espalhadas;
- não deixar linhas inclinadas quando a conexão deveria ser vertical;
- não desenhar conector quando origem ou destino não existe;
- paths devem ficar atrás dos cards/grupos;
- cards e grupos devem ficar em z-index superior.

---

## 11. Conectores internos entre cônjuges

Conectores internos entre cônjuges são diferentes das linhas principais da árvore.

Regras:

- devem ser mais escuros que as linhas principais;
- devem conectar apenas pessoas com relação conjugal explícita;
- devem aparecer dentro do grupo quando o casal estiver visível;
- não devem ser usados para inferir relação;
- se a relação não for segura, não desenhar conector.

Implementação atual esperada:

- `spousePersonIds` identifica cards de cônjuges;
- `spousePartnerByPersonId` mapeia cônjuge → pessoa parceira;
- `VisualGroup` pode inserir conector lateral entre cards adjacentes;
- se o par quebrar linha, o layout tenta manter o casal junto com espaçador.

---

## 12. Cards visuais

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Componentes principais:

```txt
VisualPersonAvatar
VisualVitalLines
VisualPersonCard
VisualEmptyCard
VisualGroup
getVisualPersonCardData
```

### 12.1 Dados vitais

Cards comuns exibem apenas:

- ano de nascimento;
- ano de falecimento, se houver.

Cards especiais exibem local + ano:

- Pai;
- Mãe;
- Pessoa Central;
- Cônjuge principal.

Regra:

- não exibir texto “Nascimento não informado”;
- não exibir texto “Falecimento não informado”;
- se faltar informação, exibir apenas o ícone correspondente quando aplicável.

### 12.2 Nomes

Regras:

- exibir primeiro e segundo nome quando possível;
- evitar truncamento excessivo;
- nomes com acento não devem ser cortados;
- `line-height` deve permitir acentos em nomes como `Márcio` e `Condilênia`.

### 12.3 Tons dos cards

Tons relevantes:

```txt
default
spouse
ancestorSpouse
```

Regras:

- `default` é usado para pessoas comuns;
- `spouse` ou `ancestorSpouse` é usado para cônjuges conforme política visual;
- pet não deve ser confundido com cônjuge;
- tom visual não altera relação real.

---

## 13. Avatares por `genero`

A tabela `pessoas` usa a coluna:

```txt
genero
```

Valores esperados:

```txt
homem
mulher
pet
```

Regras:

| Valor | Avatar |
|---|---|
| `homem` | avatar gráfico masculino |
| `mulher` | avatar gráfico feminino |
| `pet` | ícone de pet |
| foto existente | foto tem prioridade sobre avatar gráfico |

Regras técnicas:

- `genero` deve ser a fonte principal;
- campos legados (`sexo`, `gender`, `sexo_biologico`, etc.) só são fallback;
- inferência por nome só deve ocorrer quando `genero` não existir;
- se `Pessoa` ainda não tipar `genero`, atualizar o tipo;
- se a coluna foi criada manualmente no Supabase, criar migration correspondente.

Sugestão de tipo:

```ts
genero?: 'homem' | 'mulher' | 'pet' | string | null;
```

---

## 14. Filtros diretos

O Mapa Familiar respeita `directRelativeFilters`.

Grupos principais:

```txt
pais
avos
bisavos
tataravos
conjuge
filhos
netos
irmaos
sobrinhos
tios
primos
pets
```

Regras específicas:

- `conjuge` deve ser tratado como **Cônjuges**;
- filtro `conjuge` não oculta o cônjuge principal;
- filtro `conjuge` não oculta cônjuges de ancestrais;
- filtro `conjuge` controla apenas cônjuges colaterais;
- `pets` controla grupo de pets, mas `genero = pet` também deve preservar avatar/semântica visual de pet;
- filtros não alteram dados reais;
- filtros não criam/removem relacionamentos.

---

## 15. Zoom e escala

O Mapa Familiar suporta:

```txt
Ctrl + scroll
```

Comportamento:

- `Ctrl + scroll para cima`: aproxima;
- `Ctrl + scroll para baixo`: afasta;
- sem `Ctrl`, scroll normal deve continuar;
- usar `preventDefault` apenas com `Ctrl`;
- aplicar limites de zoom;
- resetar zoom quando muda pessoa central ou `layoutRevision`.

Regras:

- zoom não deve mascarar layout cortado;
- laterais devem continuar com margem mínima em escala inicial;
- canvas deve evitar scroll horizontal excessivo em escala padrão.

---

## 16. Fallback mobile

Em telas mobile, `/mapa-familiar` deve usar fallback seguro.

Regra atual:

```txt
MobileFamilyTreeView
```

Motivo:

- o Mapa Familiar é panorâmico desktop/tablet;
- a experiência mobile já possui malha segmentada própria;
- não duplicar a árvore em tela pequena;
- não substituir a experiência mobile de `/minha-arvore`.

---

## 17. Exportação

O Mapa Familiar não é ReactFlow.

Consequência:

- exportação baseada no canvas ReactFlow pode não capturar o Mapa Familiar;
- se a exportação ainda não foi adaptada, documentar como limitação;
- uma futura exportação deve capturar HTML/SVG do container do Mapa Familiar;
- manter pendência em `docs/funcionalidades/EXPORTACAO_ARVORE.md` ou `PLANO_PROXIMOS_PASSOS.md`.

---

## 18. Busca global e favoritos

Se a view deve aparecer como página acessível nos mecanismos do app, revisar:

```txt
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
docs/funcionalidades/FAVORITOS.md
```

Regras:

- `/mapa-familiar` deve poder aparecer como página favoritable, se produto decidir;
- busca global deve reconhecer **Mapa Familiar**, se produto decidir;
- se ainda não implementado, manter como pendência.

---

## 19. QA visual manual

Codex ou agentes sem login não devem afirmar QA visual autenticado.

Validar manualmente após login em:

```txt
1366x768
1440x900
1536x864
1920x1080
```

Checklist:

- `/mapa-familiar` abre com pessoa central correta;
- `?pessoa=...` é preservado;
- fundo do título e da árvore têm o mesmo azul claro;
- seletor mostra **Mapa Familiar**;
- `Ctrl + scroll` aproxima/afasta;
- scroll normal sem `Ctrl` continua funcionando;
- tios/primos usam laterais sem invadir núcleo;
- tios/primos mantêm margem lateral mínima;
- tios/primos usam 4 colunas e 8 cards iniciais;
- botão `+/-` expande e recolhe;
- grupos não exibem scroll interno apertado;
- grupos unitários não ficam largos nem estreitos demais;
- cônjuge principal aparece mesmo com filtro **Cônjuges** desativado;
- cônjuges de ancestrais aparecem por padrão;
- cônjuges colaterais aparecem só quando filtro **Cônjuges** está ativo;
- casais estão conectados às pessoas corretas;
- não há conector interno ligando cônjuge a pessoa errada;
- conectores principais estão claros e alinhados;
- conectores internos de cônjuges estão mais escuros;
- nomes acentuados não são cortados;
- avatares masculinos/femininos/pet seguem `genero`;
- pet mantém ícone de pet;
- `/minha-arvore` mobile não sofreu regressão;
- `/genealogia` não sofreu regressão;
- `/visao-completa` não sofreu regressão.

---

## 20. Anti-regressões

Não fazer:

- mover o Mapa Familiar para dentro de `FamilyTree.tsx`;
- substituir `/minha-arvore` pelo Mapa Familiar;
- usar ReactFlow para a composição panorâmica;
- espalhar coordenadas mágicas fora de `FAMILY_MAP_LAYOUT`;
- conectar cônjuges por proximidade visual;
- ocultar cônjuge principal pelo filtro **Cônjuges**;
- ocultar cônjuges ancestrais pelo filtro **Cônjuges**;
- usar scroll interno apertado nos grupos como padrão;
- permitir tios/primos invadirem pai, mãe ou pessoa central;
- permitir grupos laterais cortados nas bordas;
- voltar a usar iniciais como avatar principal;
- ignorar `genero`;
- trocar pet por avatar humano;
- exibir “Nascimento não informado” nos cards;
- hardcodar cores sem revisar tokens/paleta;
- alterar Supabase, RLS ou migrations para resolver problema visual, exceto migration necessária para `genero`;
- quebrar `/genealogia` e `/visao-completa`;
- quebrar o mobile segmentado.

## 23. Atualizações pós-refatoração estrutural

Esta seção registra os ajustes consolidados após a estabilização estrutural do `DesktopFamilyMapView`.

### 23.1 Refatoração estrutural

O componente passou a concentrar regras de layout em `FAMILY_MAP_LAYOUT`, reduzindo a dependência de coordenadas soltas no JSX.

Configurações centralizadas:

- `canvas`: largura, altura mínima, fundo, escala mínima, zoom mínimo/máximo e passo de zoom;
- `metrics`: espaçamentos verticais, gaps, alturas de cards e distâncias entre faixas;
- `connectors`: cor, espessura e espaçamento de junção;
- `areas`: laterais, ancestrais, centro e faixas inferiores;
- `groups`: configuração por grupo visual.

### 23.2 Regras atuais de cônjuges

- Cônjuge principal aparece quando existir, independentemente do filtro **Cônjuges**.
- Cônjuges de tataravós, bisavós e avós aparecem por padrão.
- Cônjuges de tios, primos, sobrinhos, filhos e netos aparecem apenas com filtro **Cônjuges** ativo.
- Conectores internos de cônjuges devem ligar apenas relacionamentos `conjuge` explícitos.
- Quando não houver pareamento seguro, é preferível não desenhar conector interno a conectar pessoas erradas.

### 23.3 Avatares por `genero`

A coluna `pessoas.genero` deve orientar os avatares visuais:

| Valor | Avatar |
|---|---|
| `homem` | avatar masculino |
| `mulher` | avatar feminino |
| `pet` | ícone de pet |

Atenção operacional: se a coluna foi criada manualmente no Supabase, criar migration versionada e conferir a tipagem de `Pessoa`.

### 23.4 Cores e conectores

- Linhas principais entre grupos devem ser claras.
- Linhas internas entre cônjuges devem ser mais escuras que as linhas principais.
- Cônjuges de ancestrais e cônjuges colaterais usam tom esverdeado próprio.
- O cônjuge principal deve seguir a decisão visual vigente documentada no código; caso a cor mude, atualizar este documento e `FamilyTreeVisualCards.tsx` juntos.

### 23.5 Grupos laterais

Tios e primos laterais são a área visual mais sensível da view.

Regras:

- usar até 4 colunas;
- exibir até 8 cards inicialmente;
- expandir por botão `+/-`;
- ocupar áreas vazias laterais;
- não invadir Pai, Mãe, Pessoa Central ou grupos inferiores;
- preservar margem mínima nas bordas;
- ajustar preferencialmente `FAMILY_MAP_LAYOUT.areas.left`, `FAMILY_MAP_LAYOUT.areas.right` e os grupos laterais correspondentes.


