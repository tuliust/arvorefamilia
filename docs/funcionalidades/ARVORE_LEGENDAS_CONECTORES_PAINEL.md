# Árvore, legendas, conectores e painel

> Última revisão: 2026-06-23  
> Escopo: painel desktop, conectores, legendas, seletor de visualização e layout direto do mapa familiar.

## Painel desktop do mapa familiar

### Dropdown

Label padrão fechado:

```text
Família de [Nome]
```

Deve usar a pessoa central/visualizada ou principal vinculada.

### Dropdown aberto

A primeira opção visível deve ser desabilitada:

```text
Visualize a árvore como...
```

Depois, listar pessoas por primeiro e segundo nome:

```text
Maria Acileide
Tulius Tsangaropulos
```

Não usar `Família de Maria` nas opções abertas.

## Contagem de cadastrados

Fonte:

```text
user_person_links
```

Regras:

- deduplicar `pessoa_id`;
- não usar fallback artificial para 1;
- se RLS limitar leitura, registrar limitação;
- não confundir pessoa existente em `pessoas` com pessoa cadastrada.

## Cards e status

### Cadastrado

Pessoa com usuário vinculado.

### Pré-cadastrado

Pessoa existente na árvore sem usuário vinculado.

### Em análise

Pessoa ou vínculo com alteração pendente.

## Cards do painel lateral

### Grupos

- Núcleo;
- Ascendentes;
- Colaterais.

### Ajuste desktop pós-7D

Os cards foram compactados:

- menor gap entre cards;
- menor padding interno;
- menor fonte nos títulos;
- menor fonte nas linhas de parentes;
- contadores preservados;
- mobile sem alteração.

### Linhas internas

Exemplos:

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

### Estados

Quando inativo:

```text
Exibir cônjuges de tios, primos etc
```

Quando ativo:

```text
Ocultar cônjuges de tios, primos etc
```

### Preservar

- estado visual ativo;
- `aria-pressed`;
- `data-active`;
- lógica de filtro.

## Conectores

- Conectores devem preservar relação visual entre gerações.
- Ajustes de layout compacto não devem desconectar cards.
- Layout compacto é permitido apenas para árvore pequena e simples.
- Alterações de posição devem preservar leitura de ascendentes, núcleo, descendentes e colaterais.

## Layout direto desktop

### Irmãos

No desktop, o grupo de irmãos permite até 2 cards por linha.

Regra esperada:

```ts
maxPerRow: options.isMobile ? 1 : 2
```

### Cônjuge e pets

O grupo inferior direito foi deslocado no desktop:

```ts
const LOWER_RIGHT_GROUP_SHIFT_X = 180;
```

Cálculo esperado:

```ts
const lowerRightGroupCenterX = options.isMobile
  ? MOBILE_LOWER_RIGHT_GROUP_CENTER_X
  : LOWER_RIGHT_GROUP_CENTER_X + LOWER_RIGHT_GROUP_SHIFT_X;
```

### Mobile

Mobile deve manter comportamento anterior:

- 1 card por linha nos irmãos;
- sem deslocamento desktop;
- sem reabrir problemas de sobreposição.

## Tour

Etapas pós-6A:

- Perfis, vínculos e memórias.
- Inteligência artificial e datas importantes.
- Guarde os seus destaques.

## Proteções mobile

Não alterar scripts mobile sem frente explícita:

- `src/mobileFamilyMap*.ts`;
- `src/mobileFamilyTree*.ts`;
- `src/staticMobileFamilyTreeScreens.ts`;
- `src/firstLoginMobileTutorialFixes.ts`.

## QA

1. Conferir dropdown fechado `Família de X`.
2. Conferir dropdown aberto com `Visualize a árvore como...`.
3. Conferir nomes no seletor com primeiro e segundo nome.
4. Conferir contagem `Cadastrados`.
5. Conferir cards cadastrados/pré-cadastrados.
6. Conferir cards `Núcleo`, `Ascendentes` e `Colaterais` compactos.
7. Conferir botão `Exibir/Ocultar cônjuges`.
8. Conferir conectores no layout padrão.
9. Conferir conectores no layout compacto.
10. Conferir irmãos em até 2 colunas no desktop.
11. Conferir cônjuge e pets deslocados à direita no desktop.
12. Conferir tour.
13. Conferir mobile.

## Não regressão

- Não voltar ao label `Sua view padrão` quando houver pessoa.
- Não listar `Família de Maria` dentro do dropdown aberto.
- Não remover compactação do painel lateral.
- Não aplicar deslocamento desktop no mobile.
- Não desconectar edges/conectores ao ajustar layout.
