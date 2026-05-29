# Minha Ãrvore â€” filtros, pets e regras de exibiÃ§Ã£o

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
> Tipo: documentaÃ§Ã£o funcional especÃ­fica da view **Minha Ãrvore**.

---

## 1. Objetivo

Este documento registra as regras da view **Minha Ãrvore** relacionadas a:

- filtros laterais;
- pessoas vivas/falecidas;
- pets;
- separaÃ§Ã£o entre filhos humanos e pets;
- contadores dos grupos;
- modo foco da pessoa central;
- impacto dos filtros na renderizaÃ§Ã£o da Ã¡rvore.

Este documento complementa:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
```

---

## 2. Contexto

A view **Minha Ãrvore** fica em:

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

A decisÃ£o principal desta frente foi manter compatibilidade com o banco atual:

```txt
pets continuam usando relacionamentos.tipo_relacionamento = 'filho' como vÃ­nculo tÃ©cnico,
mas o app passa a classificÃ¡-los semanticamente por pessoas.humano_ou_pet === 'Pet'.
```

---

## 3. Regra de domÃ­nio para humanos e pets

### 3.1 Campos usados

```txt
pessoas.humano_ou_pet
relacionamentos.tipo_relacionamento
```

### 3.2 ClassificaÃ§Ã£o

```txt
pessoas.humano_ou_pet === 'Humano':
  pessoa humana.

pessoas.humano_ou_pet === 'Pet':
  pet.

relacionamentos.tipo_relacionamento = 'filho':
  vÃ­nculo tÃ©cnico mantido por compatibilidade.
```

NÃ£o foi criada migration para:

- `pet`;
- `tutor`;
- novo tipo de relacionamento especÃ­fico;
- backfill semÃ¢ntico de relacionamento.

---

## 4. Helper central

Arquivo:

```txt
src/app/utils/personEntity.ts
```

FunÃ§Ãµes esperadas:

```txt
isHumanFamilyMember(pessoa)
isPetFamilyMember(pessoa)
```

Regras:

- usar esses helpers para diferenciar humano/pet;
- evitar comparaÃ§Ãµes duplicadas em componentes;
- nÃ£o inferir pet pelo nome, relacionamento ou grupo visual;
- a fonte semÃ¢ntica Ã© `pessoas.humano_ou_pet`.

---

## 5. CorreÃ§Ã£o dos filtros Vivos/Falecidos

### 5.1 Problema original

Ao desativar o filtro **Vivos**, pessoas do ramo materno/direito eram deslocadas para o lado paterno/esquerdo.

Causa:

```txt
o filtro de status removia pessoas e relacionamentos antes do cÃ¡lculo estrutural do layout.
```

Isso afetava:

- classificaÃ§Ã£o paterna/materna;
- posiÃ§Ã£o dos grupos;
- conectores;
- consistÃªncia visual.

---

### 5.2 Regra implementada

Na **Minha Ãrvore**, o layout usa o grafo completo para calcular:

- estrutura;
- lado paterno/materno;
- grupos;
- conectores;
- posiÃ§Ã£o dos cards.

Os filtros de status afetam apenas a renderizaÃ§Ã£o dos cards.

Regra consolidada:

```txt
Filtros de status nÃ£o devem recalcular a estrutura familiar.
```

---

### 5.3 Resultado esperado

- Desativar **Vivos** oculta pessoas vivas sem reposicionar ramos.
- Desativar **Falecidos** oculta falecidos sem quebrar a classificaÃ§Ã£o paterna/materna.
- A pessoa central permanece visÃ­vel.
- Conectores estruturais nÃ£o devem reorganizar a Ã¡rvore indevidamente.
- Cards ocultos por status nÃ£o devem alterar a origem semÃ¢ntica dos grupos.

---

## 6. SeparaÃ§Ã£o entre filhos humanos e pets

### 6.1 Antes

Pets eram tratados visualmente como filhos e apareciam dentro do grupo **Filhos**.

### 6.2 Depois

Pets aparecem em grupo prÃ³prio **Pets**, separado de **Filhos**.

Estrutura visual definida:

```txt
CÃ´njuge
  |
  v
BifurcaÃ§Ã£o
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
- Pets nÃ£o geram netos.
- Pets aparecem na **Minha Ãrvore**.
- Pets nÃ£o aparecem em **Genealogia**.
- Pets nÃ£o aparecem em **VisÃ£o Completa**.
- Pets aparecem no perfil em card prÃ³prio.

---

## 7. Comportamento por view

| View | Pets |
|---|---|
| Minha Ãrvore | aparecem no grupo Pets |
| Genealogia | nÃ£o aparecem |
| VisÃ£o Completa | nÃ£o aparecem |
| Perfil | aparecem em card prÃ³prio |

Regra:

```txt
Pets fazem parte da experiÃªncia direta/familiar da pessoa central,
mas nÃ£o entram nas views genealÃ³gicas formais.
```

---

## 8. Perfil de pessoa

O componente de relaÃ§Ãµes do perfil deve separar:

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
Pet da famÃ­lia
```

Documento complementar:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

---

## 9. Cadastro e admin de relacionamentos

A UX foi ajustada para vÃ­nculos envolvendo pet.

| SituaÃ§Ã£o | Label exibido | Valor salvo |
|---|---|---|
| humano para humano | Filho(a) | `filho` |
| humano para pet | Pet da famÃ­lia | `filho` |
| pet envolvido | Pet da famÃ­lia | `filho` |

Objetivo:

```txt
preservar compatibilidade com dados existentes enquanto a regra de domÃ­nio nÃ£o for migrada definitivamente.
```

Regras:

- nÃ£o salvar tipo `pet` no relacionamento enquanto nÃ£o houver migration;
- nÃ£o criar tipo `tutor` por UI sem alteraÃ§Ã£o de schema;
- documentar qualquer futura mudanÃ§a de domÃ­nio antes de migrar dados.

---

## 10. Filtros laterais

### 10.1 Cards coloridos de parentes

Os cards coloridos representam grupos de parentes.

Grupos:

```txt
TataravÃ³s
BisavÃ³s
AvÃ³s
Tios
Primos
CÃ´njuge
IrmÃ£os
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

O bloco inferior contÃ©m:

```txt
Vivos
Falecidos
Pets
```

FunÃ§Ã£o:

- controlar status/tipo;
- afetar renderizaÃ§Ã£o de cards;
- preservar estrutura;
- nÃ£o zerar grupos indevidamente.

---

## 11. Regra dos nÃºmeros nos cards

Os nÃºmeros dos cards coloridos devem respeitar apenas os filtros inferiores de status/tipo.

Regras:

- se **Falecidos** estiver desativado, os cards coloridos contam apenas pessoas vivas;
- se **Vivos** estiver desativado, os cards coloridos contam apenas pessoas falecidas;
- se **Pets** estiver desativado, pets sÃ£o removidos da contagem/exibiÃ§Ã£o onde aplicÃ¡vel;
- se o prÃ³prio card colorido for desativado, seu nÃºmero nÃ£o deve zerar;
- cards com nÃºmero `0` continuam clicÃ¡veis.

Exemplo:

| AÃ§Ã£o | NÃºmero esperado |
|---|---:|
| Desativar BisavÃ³s | BisavÃ³s continua 6 |
| Desativar Falecidos, se todos os bisavÃ³s forem falecidos | BisavÃ³s vira 0 |
| Reativar Falecidos | BisavÃ³s volta para 6 |

Regra consolidada:

```txt
Desativar um grupo oculta o grupo, mas nÃ£o altera o nÃºmero do prÃ³prio card.
```

---

## 12. Responsividade do painel lateral

Ajustes esperados:

- container com `min-h-0`;
- container com `min-w-0`;
- Ã¡rea superior dos filtros com rolagem interna;
- grids com `minmax(0, 1fr)`;
- botÃµes com `w-full`;
- botÃµes com `min-w-0`;
- botÃµes com `overflow-hidden`;
- textos com `truncate`;
- cards com `0` continuam clicÃ¡veis;
- evitar `disabled` apenas porque `count === 0`.

Resultado esperado:

- cards nÃ£o saem da borda do painel;
- bloco **Vivos / Falecidos / Pets** permanece no rodapÃ© interno;
- cards com `0` continuam restaurÃ¡veis/clicÃ¡veis;
- nÃ£o hÃ¡ overflow horizontal global.

---

## 13. Header desktop

Ajuste consolidado para telas maiores:

- logo/tÃ­tulo alinhados Ã  esquerda;
- navegaÃ§Ã£o no centro;
- busca e menu do usuÃ¡rio alinhados Ã  direita;
- remoÃ§Ã£o de limitaÃ§Ã£o visual que centralizava indevidamente o header em desktop amplo.

Documento complementar:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 14. Curiosidades e IA

A camada de curiosidades e IA deve diferenciar filhos humanos e pets.

Regras:

- **Mais filhos** conta apenas filhos humanos.
- Pets podem ter mÃ©trica prÃ³pria.
- Contexto da IA deve explicitar que pets usam `tipo_relacionamento = 'filho'` apenas por compatibilidade tÃ©cnica.
- IA nÃ£o deve inferir que pet Ã© filho humano.
- IA nÃ£o deve sugerir migration sem contexto explÃ­cito de domÃ­nio.

---

## 15. Modo foco da pessoa central

Quando a view **Minha Ãrvore** renderiza apenas a pessoa central como Ãºnico `personNode` real, o sistema ativa um modo foco visual.

### 15.1 Regra de ativaÃ§Ã£o

O modo foco Ã© ativado em `FamilyTree.tsx` quando:

- a view atual Ã© `minha-arvore`;
- o layout renderizado contÃ©m exatamente um `personNode` real;
- esse `personNode` Ã© a pessoa central/effectiveCentralPersonId.

O node continua sendo do tipo:

```txt
personNode
```

NÃ£o foi criado novo node type.

---

### 15.2 Arquitetura

A soluÃ§Ã£o usa a opÃ§Ã£o tÃ©cnica definida anteriormente:

```txt
PersonNodeData recebe a flag useCentralFocusPanel.
FamilyTree.tsx detecta o modo foco apÃ³s o layout bruto.
PersonNode.tsx renderiza CentralPersonFocusPanel quando a flag estÃ¡ ativa.
CentralPersonFocusPanel.tsx concentra a interface infogrÃ¡fica.
```

---

### 15.3 Dados exibidos

O painel pode exibir:

- foto ou placeholder;
- nome completo;
- badge Vivo, Falecido ou Pet;
- idade ou anos de vida;
- nascimento e naturalidade, quando `permitir_exibir_data_nascimento` nÃ£o for `false`;
- local atual;
- geraÃ§Ã£o sociolÃ³gica, se houver;
- contagem de arquivos histÃ³ricos;
- minibio limitada;
- curiosidades limitadas;
- botÃ£o para visualizar perfil;
- botÃ£o para adicionar conexÃ£o.

---

### 15.4 Dados nÃ£o exibidos na primeira versÃ£o

A primeira versÃ£o nÃ£o exibe:

- telefone;
- endereÃ§o;
- rede social;
- Instagram;
- WhatsApp;
- `manual_generation`;
- `lado`.

Esses dados podem ser avaliados em fases futuras, sempre respeitando permissÃµes de privacidade.

---

### 15.5 RestriÃ§Ãµes

- NÃ£o altera Supabase.
- NÃ£o cria migration.
- NÃ£o altera regras de pets.
- NÃ£o altera Genealogia.
- NÃ£o altera VisÃ£o Completa.
- MantÃ©m o node como `personNode` para preservar ReactFlow, exportaÃ§Ã£o, zoom, pan, clique e menu de contexto.

---

## 16. Commits relacionados

Principais commits desta frente:

```txt
fix: corrigir filtros de pessoas vivas e falecidas
feat: separar pets de filhos na Ã¡rvore familiar
feat: separar pets e ajustar filtros da arvore familiar
fix: ajustar filtros e header da minha arvore
chore: atualizar supabase cli
```

Regra documental:

```txt
Commits sÃ£o referÃªncia histÃ³rica. A regra canÃ´nica Ã© o comportamento descrito neste documento.
```

---

## 17. ValidaÃ§Ã£o manual recomendada

Na rota `/minha-arvore`, testar:

1. desativar **Falecidos**;
2. verificar se grupos compostos apenas por falecidos passam a contar `0`;
3. confirmar que cards com `0` continuam clicÃ¡veis;
4. desativar um card colorido e confirmar que o nÃºmero dele nÃ£o zera;
5. reativar o card e confirmar que o grupo reaparece;
6. desativar **Pets** no bloco inferior e confirmar que pets somem;
7. confirmar que **Pets** nÃ£o aparece mais nos cards coloridos superiores;
8. reduzir a janela do navegador e verificar se o painel lateral nÃ£o estoura;
9. abrir **Genealogia** e confirmar que pets nÃ£o aparecem;
10. abrir **VisÃ£o Completa** e confirmar que pets nÃ£o aparecem;
11. abrir perfil e confirmar card **Pets** separado de **Filhos**;
12. desativar todos os cards coloridos;
13. confirmar painel infogrÃ¡fico da pessoa central;
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

## 18. DecisÃ£o pendente

Ainda nÃ£o foi feita migration para tipos semÃ¢nticos como:

- `pet`;
- `tutor`;
- outro relacionamento especÃ­fico.

RecomendaÃ§Ã£o:

```txt
manter o modelo atual atÃ© a regra de domÃ­nio estar estÃ¡vel.
```

Uma migration futura pode criar tipos prÃ³prios e fazer backfill com seguranÃ§a.

Se essa frente avanÃ§ar, documentar em:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 19. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- relacionamento semÃ¢ntico `pet`;
- relacionamento semÃ¢ntico `tutor`;
- backfill dos pets existentes;
- filtros persistidos por usuÃ¡rio;
- preferÃªncia de ocultar/exibir pets;
- card especÃ­fico de pet no modo foco;
- mÃ©tricas prÃ³prias de pets;
- filtros salvos no perfil do usuÃ¡rio.

Esses itens nÃ£o bloqueiam o MVP.
