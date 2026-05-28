# Minha Árvore — Filtros, Pets e Regras de Exibição

## Contexto

Esta documentação registra as alterações recentes na view Minha Árvore (/minha-arvore), especialmente nos filtros laterais, no tratamento de pessoas vivas/falecidas e na separação entre filhos humanos e pets.

A decisão principal foi manter compatibilidade com o banco atual: pets continuam usando relacionamentos.tipo_relacionamento = 'filho' como vínculo técnico, mas o app passa a classificá-los semanticamente por pessoas.humano_ou_pet === 'Pet'.

---

## Correção dos filtros Vivos/Falecidos

### Problema original

Ao desativar o filtro Vivos, pessoas do ramo materno/direito eram deslocadas para o lado paterno/esquerdo. Isso ocorria porque o filtro de status removia pessoas e relacionamentos antes do cálculo estrutural do layout.

### Regra implementada

Na Minha Árvore, o layout usa o grafo completo para calcular estrutura, lado paterno/materno e conectores. Os filtros de status afetam apenas a renderização dos cards.

### Resultado esperado

- Desativar Vivos oculta pessoas vivas sem reposicionar ramos.
- Desativar Falecidos oculta falecidos sem quebrar a classificação paterna/materna.
- A pessoa central permanece visível.

---

## Separação entre Filhos e Pets

### Regra de domínio

- pessoas.humano_ou_pet === 'Humano': pessoa humana.
- pessoas.humano_ou_pet === 'Pet': pet.
- relacionamentos.tipo_relacionamento = 'filho': vínculo técnico mantido por compatibilidade.

Não foi criada migration para pet, tutor ou novo tipo de relacionamento.

### Helper central

Foi criado o helper central:

- src/app/utils/personEntity.ts

Uso esperado:

- isHumanFamilyMember(pessoa)
- isPetFamilyMember(pessoa)

---

## Layout da Minha Árvore

### Antes

Pets eram tratados como filhos e apareciam dentro do grupo Filhos.

### Depois

Pets aparecem em grupo próprio Pets, separado de Filhos.

Estrutura visual definida:

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

### Regras

- Filhos mostra apenas humanos.
- Pets mostra apenas pets.
- Netos derivam apenas de filhos humanos.
- Pets não geram netos.
- Pets aparecem na Minha Árvore, mas não em Genealogia nem em Visão Completa.

---

## Genealogia e Visão Completa

Pets foram removidos das views genealógicas.

| View | Pets |
|---|---|
| Minha Árvore | aparecem no grupo Pets |
| Genealogia | não aparecem |
| Visão Completa | não aparecem |
| Perfil | aparecem em card próprio |

---

## Perfil de pessoa

O componente de relações do perfil foi ajustado:

- Card Filhos: apenas humanos.
- Card Pets: pets vinculados tecnicamente como filho.

Label sugerido para pets:

- Pet da família

---

## Cadastro e Admin de Relacionamentos

A UX foi ajustada para vínculos envolvendo pet.

| Situação | Label exibido | Valor salvo |
|---|---|---|
| humano para humano | Filho(a) | filho |
| humano para pet | Pet da família | filho |
| pet envolvido | Pet da família | filho |

O objetivo é preservar compatibilidade com dados existentes enquanto a regra de domínio não for migrada definitivamente.

---

## Filtros laterais

### Cards coloridos de parentes

Os cards coloridos representam grupos de parentes:

- Tataravós
- Bisavós
- Avós
- Tios
- Primos
- Cônjuge
- Irmãos
- Filhos
- Sobrinhos
- Netos

O card superior Pets foi removido. Pets passam a ser controlados apenas pelo bloco inferior.

### Cards inferiores de status

O bloco inferior contém:

- Vivos
- Falecidos
- Pets

### Regra dos números

Os números dos cards coloridos devem respeitar apenas os filtros inferiores de status:

- se Falecidos estiver desativado, os cards coloridos contam apenas pessoas vivas;
- se Vivos estiver desativado, os cards coloridos contam apenas pessoas falecidas;
- se o próprio card colorido for desativado, seu número não deve zerar;
- cards com número 0 continuam clicáveis.

Exemplo:

| Ação | Número esperado |
|---|---:|
| Desativar Bisavós | Bisavós continua 6 |
| Desativar Falecidos, se todos os bisavós forem falecidos | Bisavós vira 0 |
| Reativar Falecidos | Bisavós volta para 6 |

---

## Responsividade do painel lateral

Ajustes feitos:

- container com min-h-0, min-w-0 e overflow-hidden;
- área superior dos filtros com rolagem interna;
- grids com minmax(0, 1fr);
- botões com w-full, min-w-0, overflow-hidden;
- textos com truncate;
- remoção do disabled quando count === 0.

Resultado esperado:

- os cards não devem sair da borda do painel;
- o bloco Vivos / Falecidos / Pets deve permanecer no rodapé interno;
- cards com 0 devem continuar restauráveis/clicáveis.

---

## Header desktop

Ajuste realizado para telas maiores:

- logo/título alinhados à esquerda;
- navegação no centro;
- busca e menu do usuário alinhados à direita;
- remoção de limitação visual que centralizava indevidamente o header em desktop amplo.

---

## Curiosidades e IA

A camada de curiosidades e IA foi ajustada para diferenciar filhos humanos e pets.

Regras:

- Mais filhos deve contar apenas filhos humanos.
- Pets podem ter métrica própria.
- Contexto da IA deve explicitar que pets usam tipo_relacionamento = 'filho' apenas por compatibilidade técnica.

---

## Commits relacionados

Principais commits desta frente:

- fix: corrigir filtros de pessoas vivas e falecidas
- feat: separar pets de filhos na árvore familiar
- feat: separar pets e ajustar filtros da arvore familiar
- fix: ajustar filtros e header da minha arvore
- chore: atualizar supabase cli

---

## Validação manual recomendada

Na rota /minha-arvore, testar:

1. desativar Falecidos;
2. verificar se grupos compostos apenas por falecidos passam a contar 0;
3. confirmar que cards com 0 continuam clicáveis;
4. desativar um card colorido e confirmar que o número dele não zera;
5. reativar o card e confirmar que o grupo reaparece;
6. desativar Pets no bloco inferior e confirmar que pets somem;
7. confirmar que Pets não aparece mais nos cards coloridos superiores;
8. reduzir a janela do navegador e verificar se o painel lateral não estoura;
9. abrir Genealogia e Visão Completa e confirmar que pets não aparecem;
10. abrir Perfil e confirmar card Pets separado de Filhos.

---

## Decisão pendente

Ainda não foi feita migration para tipos semânticos como pet e tutor.

A recomendação é manter o modelo atual até a regra de domínio estar estável. Uma migration futura pode criar tipos próprios e fazer backfill com segurança.
