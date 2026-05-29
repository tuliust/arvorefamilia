# Minha Árvore — filtros, pets e regras de exibição

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Tipo: documentação funcional específica da view **Minha Árvore**.

---

## 1. Objetivo

Este documento registra as regras da view **Minha Árvore** relacionadas a:

- filtros laterais;
- pessoas vivas/falecidas;
- pets;
- separação entre filhos humanos e pets;
- contadores dos grupos;
- modo foco da pessoa central;
- impacto dos filtros na renderização da árvore.

Este documento complementa:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
```

---

## 2. Contexto

A view **Minha Árvore** fica em:

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

A decisão principal desta frente foi manter compatibilidade com o banco atual:

```txt
pets continuam usando relacionamentos.tipo_relacionamento = 'filho' como vínculo técnico,
mas o app passa a classificá-los semanticamente por pessoas.humano_ou_pet === 'Pet'.
```

---

## 3. Regra de domínio para humanos e pets

### 3.1 Campos usados

```txt
pessoas.humano_ou_pet
relacionamentos.tipo_relacionamento
```

### 3.2 Classificação

```txt
pessoas.humano_ou_pet === 'Humano':
  pessoa humana.

pessoas.humano_ou_pet === 'Pet':
  pet.

relacionamentos.tipo_relacionamento = 'filho':
  vínculo técnico mantido por compatibilidade.
```

Não foi criada migration para:

- `pet`;
- `tutor`;
- novo tipo de relacionamento específico;
- backfill semântico de relacionamento.

---

## 4. Helper central

Arquivo:

```txt
src/app/utils/personEntity.ts
```

Funções esperadas:

```txt
isHumanFamilyMember(pessoa)
isPetFamilyMember(pessoa)
```

Regras:

- usar esses helpers para diferenciar humano/pet;
- evitar comparações duplicadas em componentes;
- não inferir pet pelo nome, relacionamento ou grupo visual;
- a fonte semântica é `pessoas.humano_ou_pet`.

---

## 5. Correção dos filtros Vivos/Falecidos

### 5.1 Problema original

Ao desativar o filtro **Vivos**, pessoas do ramo materno/direito eram deslocadas para o lado paterno/esquerdo.

Causa:

```txt
o filtro de status removia pessoas e relacionamentos antes do cálculo estrutural do layout.
```

Isso afetava:

- classificação paterna/materna;
- posição dos grupos;
- conectores;
- consistência visual.

---

### 5.2 Regra implementada

Na **Minha Árvore**, o layout usa o grafo completo para calcular:

- estrutura;
- lado paterno/materno;
- grupos;
- conectores;
- posição dos cards.

Os filtros de status afetam apenas a renderização dos cards.

Regra consolidada:

```txt
Filtros de status não devem recalcular a estrutura familiar.
```

---

### 5.3 Resultado esperado

- Desativar **Vivos** oculta pessoas vivas sem reposicionar ramos.
- Desativar **Falecidos** oculta falecidos sem quebrar a classificação paterna/materna.
- A pessoa central permanece visível.
- Conectores estruturais não devem reorganizar a árvore indevidamente.
- Cards ocultos por status não devem alterar a origem semântica dos grupos.

---

## 6. Separação entre filhos humanos e pets

### 6.1 Antes

Pets eram tratados visualmente como filhos e apareciam dentro do grupo **Filhos**.

### 6.2 Depois

Pets aparecem em grupo próprio **Pets**, separado de **Filhos**.

Estrutura visual definida:

```txt
Cônjuge
  |
  v
Bifurcação
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
- Pets não geram netos.
- Pets aparecem na **Minha Árvore**.
- Pets não aparecem em **Genealogia**.
- Pets não aparecem em **Visão Completa**.
- Pets aparecem no perfil em card próprio.

---

## 7. Comportamento por view

| View | Pets |
|---|---|
| Minha Árvore | aparecem no grupo Pets |
| Genealogia | não aparecem |
| Visão Completa | não aparecem |
| Perfil | aparecem em card próprio |

Regra:

```txt
Pets fazem parte da experiência direta/familiar da pessoa central,
mas não entram nas views genealógicas formais.
```

---

## 8. Perfil de pessoa

O componente de relações do perfil deve separar:

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
Pet da família
```

Documento complementar:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

---

## 9. Cadastro e admin de relacionamentos

A UX foi ajustada para vínculos envolvendo pet.

| Situação | Label exibido | Valor salvo |
|---|---|---|
| humano para humano | Filho(a) | `filho` |
| humano para pet | Pet da família | `filho` |
| pet envolvido | Pet da família | `filho` |

Objetivo:

```txt
preservar compatibilidade com dados existentes enquanto a regra de domínio não for migrada definitivamente.
```

Regras:

- não salvar tipo `pet` no relacionamento enquanto não houver migration;
- não criar tipo `tutor` por UI sem alteração de schema;
- documentar qualquer futura mudança de domínio antes de migrar dados.

---

## 10. Filtros laterais

### 10.1 Cards coloridos de parentes

Os cards coloridos representam grupos de parentes.

Grupos:

```txt
Tataravós
Bisavós
Avós
Tios
Primos
Cônjuge
Irmãos
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

O bloco inferior contém:

```txt
Vivos
Falecidos
Pets
```

Função:

- controlar status/tipo;
- afetar renderização de cards;
- preservar estrutura;
- não zerar grupos indevidamente.

---

## 11. Regra dos números nos cards

Os números dos cards coloridos devem respeitar apenas os filtros inferiores de status/tipo.

Regras:

- se **Falecidos** estiver desativado, os cards coloridos contam apenas pessoas vivas;
- se **Vivos** estiver desativado, os cards coloridos contam apenas pessoas falecidas;
- se **Pets** estiver desativado, pets são removidos da contagem/exibição onde aplicável;
- se o próprio card colorido for desativado, seu número não deve zerar;
- cards com número `0` continuam clicáveis.

Exemplo:

| Ação | Número esperado |
|---|---:|
| Desativar Bisavós | Bisavós continua 6 |
| Desativar Falecidos, se todos os bisavós forem falecidos | Bisavós vira 0 |
| Reativar Falecidos | Bisavós volta para 6 |

Regra consolidada:

```txt
Desativar um grupo oculta o grupo, mas não altera o número do próprio card.
```

---

## 12. Responsividade do painel lateral

Ajustes esperados:

- container com `min-h-0`;
- container com `min-w-0`;
- área superior dos filtros com rolagem interna;
- grids com `minmax(0, 1fr)`;
- botões com `w-full`;
- botões com `min-w-0`;
- botões com `overflow-hidden`;
- textos com `truncate`;
- cards com `0` continuam clicáveis;
- evitar `disabled` apenas porque `count === 0`.

Resultado esperado:

- cards não saem da borda do painel;
- bloco **Vivos / Falecidos / Pets** permanece no rodapé interno;
- cards com `0` continuam restauráveis/clicáveis;
- não há overflow horizontal global.

---

## 13. Header desktop

Ajuste consolidado para telas maiores:

- logo/título alinhados à esquerda;
- navegação no centro;
- busca e menu do usuário alinhados à direita;
- remoção de limitação visual que centralizava indevidamente o header em desktop amplo.

Documento complementar:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 14. Curiosidades e IA

A camada de curiosidades e IA deve diferenciar filhos humanos e pets.

Regras:

- **Mais filhos** conta apenas filhos humanos.
- Pets podem ter métrica própria.
- Contexto da IA deve explicitar que pets usam `tipo_relacionamento = 'filho'` apenas por compatibilidade técnica.
- IA não deve inferir que pet é filho humano.
- IA não deve sugerir migration sem contexto explícito de domínio.

---

## 15. Modo foco da pessoa central

Quando a view **Minha Árvore** renderiza apenas a pessoa central como único `personNode` real, o sistema ativa um modo foco visual.

### 15.1 Regra de ativação

O modo foco é ativado em `FamilyTree.tsx` quando:

- a view atual é `minha-arvore`;
- o layout renderizado contém exatamente um `personNode` real;
- esse `personNode` é a pessoa central/effectiveCentralPersonId.

O node continua sendo do tipo:

```txt
personNode
```

Não foi criado novo node type.

---

### 15.2 Arquitetura

A solução usa a opção técnica definida anteriormente:

```txt
PersonNodeData recebe a flag useCentralFocusPanel.
FamilyTree.tsx detecta o modo foco após o layout bruto.
PersonNode.tsx renderiza CentralPersonFocusPanel quando a flag está ativa.
CentralPersonFocusPanel.tsx concentra a interface infográfica.
```

---

### 15.3 Dados exibidos

O painel pode exibir:

- foto ou placeholder;
- nome completo;
- badge Vivo, Falecido ou Pet;
- idade ou anos de vida;
- nascimento e naturalidade, quando `permitir_exibir_data_nascimento` não for `false`;
- local atual;
- geração sociológica, se houver;
- contagem de arquivos históricos;
- minibio limitada;
- curiosidades limitadas;
- botão para visualizar perfil;
- botão para adicionar conexão.

---

### 15.4 Dados não exibidos na primeira versão

A primeira versão não exibe:

- telefone;
- endereço;
- rede social;
- Instagram;
- WhatsApp;
- `manual_generation`;
- `lado`.

Esses dados podem ser avaliados em fases futuras, sempre respeitando permissões de privacidade.

---

### 15.5 Restrições

- Não altera Supabase.
- Não cria migration.
- Não altera regras de pets.
- Não altera Genealogia.
- Não altera Visão Completa.
- Mantém o node como `personNode` para preservar ReactFlow, exportação, zoom, pan, clique e menu de contexto.

---

## 16. Commits relacionados

Principais commits desta frente:

```txt
fix: corrigir filtros de pessoas vivas e falecidas
feat: separar pets de filhos na árvore familiar
feat: separar pets e ajustar filtros da arvore familiar
fix: ajustar filtros e header da minha arvore
chore: atualizar supabase cli
```

Regra documental:

```txt
Commits são referência histórica. A regra canônica é o comportamento descrito neste documento.
```

---

## 17. Validação manual recomendada

Na rota `/minha-arvore`, testar:

1. desativar **Falecidos**;
2. verificar se grupos compostos apenas por falecidos passam a contar `0`;
3. confirmar que cards com `0` continuam clicáveis;
4. desativar um card colorido e confirmar que o número dele não zera;
5. reativar o card e confirmar que o grupo reaparece;
6. desativar **Pets** no bloco inferior e confirmar que pets somem;
7. confirmar que **Pets** não aparece mais nos cards coloridos superiores;
8. reduzir a janela do navegador e verificar se o painel lateral não estoura;
9. abrir **Genealogia** e confirmar que pets não aparecem;
10. abrir **Visão Completa** e confirmar que pets não aparecem;
11. abrir perfil e confirmar card **Pets** separado de **Filhos**;
12. desativar todos os cards coloridos;
13. confirmar painel infográfico da pessoa central;
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

## 18. Decisão pendente

Ainda não foi feita migration para tipos semânticos como:

- `pet`;
- `tutor`;
- outro relacionamento específico.

Recomendação:

```txt
manter o modelo atual até a regra de domínio estar estável.
```

Uma migration futura pode criar tipos próprios e fazer backfill com segurança.

Se essa frente avançar, documentar em:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 19. Pós-MVP

Possíveis evoluções:

- relacionamento semântico `pet`;
- relacionamento semântico `tutor`;
- backfill dos pets existentes;
- filtros persistidos por usuário;
- preferência de ocultar/exibir pets;
- card específico de pet no modo foco;
- métricas próprias de pets;
- filtros salvos no perfil do usuário.

Esses itens não bloqueiam o MVP.
