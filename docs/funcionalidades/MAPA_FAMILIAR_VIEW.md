# Mapa Familiar View

> Última revisão: 2026-06-23  
> Escopo: `/mapa-familiar` após Prompt 6A, ciclo 7D e ajustes pós-7D de painel, seletor e layout desktop.

## Objetivo

A tela `/mapa-familiar` apresenta a árvore familiar com painel lateral, filtros, tour, visualização desktop/mobile e seletor de contexto familiar.

A experiência deve permitir que o usuário:

- visualize a árvore a partir da pessoa principal/vinculada;
- alterne a visualização por outra pessoa quando necessário;
- filtre grupos familiares diretos e indiretos;
- identifique status de cadastro;
- navegue sem regressão em desktop e mobile.

## Ajustes consolidados

### Prompt 6A

- Dropdown do painel desktop com label `Família de X`.
- Pessoa central/visualizada usada como base do label.
- Seleção manual por `?pessoa=` preservada.
- Card `Cadastrados` baseado em `user_person_links`.
- Tour revisado.
- Layout compacto para árvore pequena e simples.

### Pós-ciclo 7D / ajustes de 2026-06-23

- Cards `Núcleo`, `Ascendentes` e `Colaterais` ficaram mais compactos no desktop.
- Gap entre os cards do painel lateral foi reduzido.
- Fonte dos títulos internos de parentes foi reduzida.
- Botão de cônjuges passa a alternar entre:
  - `Exibir cônjuges de tios, primos etc`;
  - `Ocultar cônjuges de tios, primos etc`.
- Dropdown de visualização mantém label fechado `Família de Tulius` ou `Família de [Nome]`.
- Ao abrir o dropdown, aparece a opção desabilitada `Visualize a árvore como...`.
- As opções de pessoas no dropdown usam primeiro e segundo nome, por exemplo `Maria Acileide`, não `Família de Maria`.
- Layout desktop do canvas passou a permitir irmãos em até 2 colunas.
- Grupo de cônjuge e grupo de pets foram deslocados à direita no desktop.
- Mobile foi preservado.

## Dropdown `Família de X`

### Label fechado

Quando houver pessoa vinculada/central, o label fechado deve seguir:

```text
Família de Leonardo
Família de Tulius
Família de Tomás
```

Evitar label genérico como `Sua view padrão` quando há pessoa identificada.

### Dropdown aberto

Ao abrir o seletor, a primeira opção deve ser desabilitada:

```text
Visualize a árvore como...
```

Abaixo, listar pessoas por primeiro e segundo nome:

```text
Maria Acileide
Tulius Tsangaropulos
Titus Tsangaropulos
```

### Regras

- Não listar opções como `Família de Maria`.
- Se a pessoa tiver apenas um nome, exibir esse nome.
- O label fechado pode continuar usando `Família de X`.
- A query `?pessoa=` deve continuar funcionando.
- O item `Visualize a árvore como...` não deve alterar o estado.

## Card `Cadastrados`

### Fonte

Usar `user_person_links`, deduplicando `pessoa_id`.

### Não fazer

- Não usar fallback silencioso para `1`.
- Não contar pessoa sem vínculo de usuário como cadastrada.
- Não inferir cadastro a partir de existência na tabela `pessoas`.

Se RLS impedir leitura completa, registrar limitação e avaliar RPC/policy.

## Painel lateral desktop

### Grupos

Grupos principais:

- `Núcleo`;
- `Ascendentes`;
- `Colaterais`.

### Regra visual

No desktop, os cards devem ser compactos para caber melhor no painel lateral:

- gap horizontal reduzido;
- padding interno menor;
- fonte dos títulos reduzida;
- fonte das linhas de parentes reduzida;
- contadores legíveis, mas menos dominantes;
- sem truncamento agressivo.

### Títulos internos de parentes

Exemplos de linhas afetadas:

- Pais;
- Irmãos;
- Filhos;
- Netos;
- Avós;
- Bisavós;
- Tataravós;
- Tios;
- Primos;
- Sobrinhos.

## Botão de cônjuges indiretos

### Regra

Quando o filtro estiver desativado:

```text
Exibir cônjuges de tios, primos etc
```

Quando o filtro estiver ativo:

```text
Ocultar cônjuges de tios, primos etc
```

### Preservar

- `aria-pressed`;
- `data-active`;
- lógica de filtro;
- comportamento mobile.

## Layout do canvas no desktop

### Irmãos

O grupo de irmãos pode usar até 2 cards por linha no desktop.

Regra esperada:

```ts
maxPerRow: options.isMobile ? 1 : 2
```

Objetivo:

- permitir que Lorenzo fique ao lado direito de Titus quando houver espaço;
- reduzir altura do bloco de irmãos;
- manter mobile com 1 card por linha.

### Cônjuge e pets

O grupo inferior direito recebeu deslocamento desktop:

```ts
const LOWER_RIGHT_GROUP_SHIFT_X = 180;
```

O cálculo preserva mobile:

```ts
const lowerRightGroupCenterX = options.isMobile
  ? MOBILE_LOWER_RIGHT_GROUP_CENTER_X
  : LOWER_RIGHT_GROUP_CENTER_X + LOWER_RIGHT_GROUP_SHIFT_X;
```

Como cônjuge e pets derivam desse centro, ambos se deslocam para a direita no desktop.

### Não alterar sem frente explícita

- cálculo de parentes;
- filtros;
- edges/conectores;
- layout mobile;
- dados de `pessoas` ou `relacionamentos`.

## Tour

### Etapas relevantes

- `Perfis, vínculos e memórias`;
- `Inteligência artificial e datas importantes`;
- `Guarde os seus destaques`.

## Layout compacto

### Aplicação

Somente no desktop vertical (`DesktopFamilyMapView`) para árvore pequena e simples.

### Não aplicar quando houver

- múltiplos ramos;
- múltiplos pais/cônjuges/filhos complexos;
- árvore extensa;
- layout mobile.

## Proteções

Não alterar sem frente explícita:

- `src/mobileFamilyMap*.ts`;
- `src/mobileFamilyTree*.ts`;
- `src/staticMobileFamilyTreeScreens.ts`;
- `src/firstLoginMobileTutorialFixes.ts`;
- `index.html`.

## QA mínimo

1. Abrir `/mapa-familiar`.
2. Confirmar dropdown fechado `Família de X`.
3. Abrir dropdown e confirmar `Visualize a árvore como...`.
4. Confirmar pessoas listadas por primeiro e segundo nome.
5. Trocar pessoa via seletor/query e confirmar centralização.
6. Conferir card `Cadastrados`.
7. Confirmar cards `Núcleo`, `Ascendentes` e `Colaterais` compactos.
8. Confirmar botão de cônjuges alternando `Exibir`/`Ocultar`.
9. Abrir `?tutorial=1`.
10. Validar etapa de Favoritos.
11. Validar árvore pequena compacta.
12. Validar árvore complexa sem compactação indevida.
13. Confirmar irmãos em até 2 colunas no desktop.
14. Confirmar cônjuge e pets mais à direita.
15. Conferir mobile sem regressão.
16. Rodar `npm run typecheck`.
17. Rodar `npm run build`.
18. Rodar `git diff --check`.

## Não regressão

- Não voltar a listar pessoas como `Família de Maria` dentro do dropdown aberto.
- Não remover o placeholder `Visualize a árvore como...`.
- Não reverter irmãos para 1 coluna no desktop.
- Não aplicar o deslocamento de cônjuge/pets no mobile.
- Não reintroduzir espaçamentos excessivos no painel lateral.
- Não alterar scripts mobile sem demanda explícita.
