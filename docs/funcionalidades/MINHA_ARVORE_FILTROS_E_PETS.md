# Minha Arvore  filtros, pets e regras de exibicao

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
> Tipo: documentacao funcional especifica da view **Minha Arvore**.

---

## 1. Objetivo

Este documento registra as regras da view **Minha Arvore** relacionadas a:

- filtros laterais;
- pessoas vivas/falecidas;
- pets;
- separacao entre filhos humanos e pets;
- contadores dos grupos;
- modo foco da pessoa central;
- impacto dos filtros na renderizacao da arvore.

Este documento complementa:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
```

---

## 2. Contexto

A view **Minha Arvore** fica em:

```txt
/minha-arvore
```

Ela usa o layout direto em torno da pessoa central, com grupos de parentes, filtros laterais, painel lateral e ReactFlow.

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/utils/personEntity.ts
```

A decisao principal desta frente foi manter compatibilidade com o banco atual:

```txt
pets continuam usando relacionamentos.tipo_relacionamento = 'filho' como vinculo tecnico,
mas o app passa a classifica-los semanticamente por pessoas.humano_ou_pet === 'Pet'.
```

---

## 3. Regra de dominio para humanos e pets

### 3.1 Campos usados

```txt
pessoas.humano_ou_pet
relacionamentos.tipo_relacionamento
```

### 3.2 Classificacao

```txt
pessoas.humano_ou_pet === 'Humano':
  pessoa humana.

pessoas.humano_ou_pet === 'Pet':
  pet.

relacionamentos.tipo_relacionamento = 'filho':
  vinculo tecnico mantido por compatibilidade.
```

Nao foi criada migration para:

- `pet`;
- `tutor`;
- novo tipo de relacionamento especifico;
- backfill semantico de relacionamento.

---

## 4. Helper central

Arquivo:

```txt
src/app/utils/personEntity.ts
```

Funcoes esperadas:

```txt
isHumanFamilyMember(pessoa)
isPetFamilyMember(pessoa)
```

Regras:

- usar esses helpers para diferenciar humano/pet;
- evitar comparacoes duplicadas em componentes;
- nao inferir pet pelo nome, relacionamento ou grupo visual;
- a fonte semantica e `pessoas.humano_ou_pet`.

---

## 5. Correcao dos filtros Vivos/Falecidos

### 5.1 Problema original

Ao desativar o filtro **Vivos**, pessoas do ramo materno/direito eram deslocadas para o lado paterno/esquerdo.

Causa:

```txt
o filtro de status removia pessoas e relacionamentos antes do calculo estrutural do layout.
```

Isso afetava:

- classificacao paterna/materna;
- posicao dos grupos;
- conectores;
- consistencia visual.

---

### 5.2 Regra implementada

Na **Minha Arvore**, o layout usa o grafo completo para calcular:

- estrutura;
- lado paterno/materno;
- grupos;
- conectores;
- posicao dos cards.

Os filtros de status afetam apenas a renderizacao dos cards.

Regra consolidada:

```txt
Filtros de status nao devem recalcular a estrutura familiar.
```

---

### 5.3 Resultado esperado

- Desativar **Vivos** oculta pessoas vivas sem reposicionar ramos.
- Desativar **Falecidos** oculta falecidos sem quebrar a classificacao paterna/materna.
- A pessoa central permanece visivel.
- Conectores estruturais nao devem reorganizar a arvore indevidamente.
- Cards ocultos por status nao devem alterar a origem semantica dos grupos.

---

## 6. Separacao entre filhos humanos e pets

### 6.1 Antes

Pets eram tratados visualmente como filhos e apareciam dentro do grupo **Filhos**.

### 6.2 Depois

Pets aparecem em grupo proprio **Pets**, separado de **Filhos**.

Estrutura visual definida:

```txt
Conjuge
  |
  v
Bifurcacao
  |-- Filhos
  |     |
  |     v
  |   Netos
  |
  |-- Pets
```

### 6.3 Regras

- **Filhos** mostra apenas humanos.
- **Pets** mostra apenas pets.
- **Netos** derivam apenas de filhos humanos.
- Pets nao geram netos.
- Pets aparecem na **Minha Arvore**.
- Pets nao aparecem em **Genealogia**.
- Pets nao aparecem em **Visao Completa**.
- Pets aparecem no perfil em card proprio.

---

## 7. Comportamento por view

| View | Pets |
|---|---|
| Minha Arvore | aparecem no grupo Pets |
| Genealogia | nao aparecem |
| Visao Completa | nao aparecem |
| Perfil | aparecem em card proprio |

Regra:

```txt
Pets fazem parte da experiencia direta/familiar da pessoa central,
mas nao entram nas views genealogicas formais.
```

---

## 8. Perfil de pessoa

O componente de relacoes do perfil deve separar:

- filhos humanos;
- pets vinculados tecnicamente como filho.

Regras:

```txt
Card Filhos:
  apenas humanos.

Card Pets:
  pets vinculados tecnicamente como filho.
```

Label sugerido:

```txt
Pet da familia
```

Documento complementar:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

---

## 9. Cadastro e admin de relacionamentos

A UX foi ajustada para vinculos envolvendo pet.

| Situacao | Label exibido | Valor salvo |
|---|---|---|
| humano para humano | Filho(a) | `filho` |
| humano para pet | Pet da familia | `filho` |
| pet envolvido | Pet da familia | `filho` |

Objetivo:

```txt
preservar compatibilidade com dados existentes enquanto a regra de dominio nao for migrada definitivamente.
```

Regras:

- nao salvar tipo `pet` no relacionamento enquanto nao houver migration;
- nao criar tipo `tutor` por UI sem alteracao de schema;
- documentar qualquer futura mudanca de dominio antes de migrar dados.

---

## 10. Filtros laterais

### 10.1 Cards coloridos de parentes

Os cards coloridos representam grupos de parentes.

Grupos:

```txt
Tataravos
Bisavos
Avos
Tios
Primos
Conjuge
Irmaos
Filhos
Sobrinhos
Netos
```

Regra atual:

```txt
O card superior Pets foi removido.
Pets passam a ser controlados apenas pelo bloco inferior de status/tipo.
```

### 10.2 Cards inferiores de status/tipo

O bloco inferior contem:

```txt
Vivos
Falecidos
Pets
```

Funcao:

- controlar status/tipo;
- afetar renderizacao de cards;
- preservar estrutura;
- nao zerar grupos indevidamente.

---

## 11. Regra dos numeros nos cards

Os numeros dos cards coloridos devem respeitar apenas os filtros inferiores de status/tipo.

Regras:

- se **Falecidos** estiver desativado, os cards coloridos contam apenas pessoas vivas;
- se **Vivos** estiver desativado, os cards coloridos contam apenas pessoas falecidas;
- se **Pets** estiver desativado, pets sao removidos da contagem/exibicao onde aplicavel;
- se o proprio card colorido for desativado, seu numero nao deve zerar;
- cards com numero `0` continuam clicaveis.

Exemplo:

| Acao | Numero esperado |
|---|---:|
| Desativar Bisavos | Bisavos continua 6 |
| Desativar Falecidos, se todos os bisavos forem falecidos | Bisavos vira 0 |
| Reativar Falecidos | Bisavos volta para 6 |

Regra consolidada:

```txt
Desativar um grupo oculta o grupo, mas nao altera o numero do proprio card.
```

---

## 12. Responsividade do painel lateral

Ajustes esperados:

- container com `min-h-0`;
- container com `min-w-0`;
- area superior dos filtros com rolagem interna;
- grids com `minmax(0, 1fr)`;
- botoes com `w-full`;
- botoes com `min-w-0`;
- botoes com `overflow-hidden`;
- textos com `truncate`;
- cards com `0` continuam clicaveis;
- evitar `disabled` apenas porque `count === 0`.

Resultado esperado:

- cards nao saem da borda do painel;
- bloco **Vivos / Falecidos / Pets** permanece no rodape interno;
- cards com `0` continuam restauraveis/clicaveis;
- nao ha overflow horizontal global.

---

## 13. Header desktop

Ajuste consolidado para telas maiores:

- logo/titulo alinhados A  esquerda;
- navegacao no centro;
- busca e menu do usuario alinhados A  direita;
- remocao de limitacao visual que centralizava indevidamente o header em desktop amplo.

Documento complementar:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 14. Curiosidades e IA

A camada de curiosidades e IA deve diferenciar filhos humanos e pets.

Regras:

- **Mais filhos** conta apenas filhos humanos.
- Pets podem ter metrica propria.
- Contexto da IA deve explicitar que pets usam `tipo_relacionamento = 'filho'` apenas por compatibilidade tecnica.
- IA nao deve inferir que pet e filho humano.
- IA nao deve sugerir migration sem contexto explicito de dominio.

---

## 15. Modo foco da pessoa central

Quando a view **Minha Arvore** renderiza apenas a pessoa central como unico `personNode` real, o sistema ativa um modo foco visual.

### 15.1 Regra de ativacao

O modo foco e ativado em `FamilyTree.tsx` quando:

- a view atual e `minha-arvore`;
- o layout renderizado contem exatamente um `personNode` real;
- esse `personNode` e a pessoa central/effectiveCentralPersonId.

O node continua sendo do tipo:

```txt
personNode
```

Nao foi criado novo node type.

---

### 15.2 Arquitetura

A solucao usa a opcao tecnica definida anteriormente:

```txt
PersonNodeData recebe a flag useCentralFocusPanel.
FamilyTree.tsx detecta o modo foco apos o layout bruto.
PersonNode.tsx renderiza CentralPersonFocusPanel quando a flag esta ativa.
CentralPersonFocusPanel.tsx concentra a interface infografica.
```

---

### 15.3 Dados exibidos

O painel pode exibir:

- foto ou placeholder;
- nome completo;
- badge Vivo, Falecido ou Pet;
- idade ou anos de vida;
- nascimento e naturalidade, quando `permitir_exibir_data_nascimento` nao for `false`;
- local atual;
- geracao sociologica, se houver;
- contagem de arquivos historicos;
- minibio limitada;
- curiosidades limitadas;
- botao para visualizar perfil;
- botao para adicionar conexao.

---

### 15.4 Dados nao exibidos na primeira versao

A primeira versao nao exibe:

- telefone;
- endereco;
- rede social;
- Instagram;
- WhatsApp;
- `manual_generation`;
- `lado`.

Esses dados podem ser avaliados em fases futuras, sempre respeitando permissoes de privacidade.

---

### 15.5 Restricoes

- Nao altera Supabase.
- Nao cria migration.
- Nao altera regras de pets.
- Nao altera Genealogia.
- Nao altera Visao Completa.
- Mantem o node como `personNode` para preservar ReactFlow, exportacao, zoom, pan, clique e menu de contexto.

---

## 16. Commits relacionados

Principais commits desta frente:

```txt
fix: corrigir filtros de pessoas vivas e falecidas
feat: separar pets de filhos na arvore familiar
feat: separar pets e ajustar filtros da arvore familiar
fix: ajustar filtros e header da minha arvore
chore: atualizar supabase cli
```

Regra documental:

```txt
Commits sao referencia historica. A regra canonica e o comportamento descrito neste documento.
```

---

## 17. Validacao manual recomendada

Na rota `/minha-arvore`, testar:

1. desativar **Falecidos**;
2. verificar se grupos compostos apenas por falecidos passam a contar `0`;
3. confirmar que cards com `0` continuam clicaveis;
4. desativar um card colorido e confirmar que o numero dele nao zera;
5. reativar o card e confirmar que o grupo reaparece;
6. desativar **Pets** no bloco inferior e confirmar que pets somem;
7. confirmar que **Pets** nao aparece mais nos cards coloridos superiores;
8. reduzir a janela do navegador e verificar se o painel lateral nao estoura;
9. abrir **Genealogia** e confirmar que pets nao aparecem;
10. abrir **Visao Completa** e confirmar que pets nao aparecem;
11. abrir perfil e confirmar card **Pets** separado de **Filhos**;
12. desativar todos os cards coloridos;
13. confirmar painel infografico da pessoa central;
14. reativar qualquer grupo;
15. confirmar retorno ao card central normal;
16. testar pessoa viva;
17. testar pessoa falecida;
18. testar pet;
19. testar pessoa sem foto;
20. testar minibio e curiosidades longas;
21. testar desktop, notebook, tablet e mobile;
22. rodar build.

Comando:

```bash
npm run build
```

---

## 18. Decisao pendente

Ainda nao foi feita migration para tipos semanticos como:

- `pet`;
- `tutor`;
- outro relacionamento especifico.

Recomendacao:

```txt
manter o modelo atual ate a regra de dominio estar estavel.
```

Uma migration futura pode criar tipos proprios e fazer backfill com seguranca.

Se essa frente avancar, documentar em:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 19. Pos-MVP

Possiveis evolucoes:

- relacionamento semantico `pet`;
- relacionamento semantico `tutor`;
- backfill dos pets existentes;
- filtros persistidos por usuario;
- preferencia de ocultar/exibir pets;
- card especifico de pet no modo foco;
- metricas proprias de pets;
- filtros salvos no perfil do usuario.

Esses itens nao bloqueiam o MVP.
