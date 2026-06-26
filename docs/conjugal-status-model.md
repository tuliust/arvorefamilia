# Modelo de status conjugal

## Objetivo

Esta frente cria uma camada semântica compartilhada para interpretar vínculos conjugais antes de alterar visualmente a árvore, o perfil da pessoa ou o admin de relacionamentos.

O modelo parte dos campos já existentes em `Relacionamento`:

- `subtipo_relacionamento`;
- `data_casamento`;
- `data_separacao`;
- `local_casamento`;
- `local_separacao`;
- `ativo`;
- `observacoes`.

Também considera dados das pessoas envolvidas, principalmente falecimento.

## Arquivo principal

```text
src/app/utils/conjugalRelationshipStatus.ts
```

## Status calculados

| Status | Critério inicial |
|---|---|
| `active` | Sem separação, sem falecimento e `ativo !== false`. |
| `widowed` | Um dos cônjuges está falecido e não há separação registrada. |
| `separated` | Existe `data_separacao`, `data_fim` ou `subtipo_relacionamento = separado`. |
| `divorced` | Reservado para subtipo `divorciado` ou `divorcio`, quando existir no dado. |
| `inactive` | `ativo = false` sem separação ou falecimento. |
| `historical` | Ambos os cônjuges estão falecidos e não há separação registrada. |

## Funções públicas

```ts
getConjugalRelationshipStatus(relationship, person1, person2)
getConjugalRelationshipStatusLabel(status)
getConjugalRelationshipStatusDescription(status)
isConjugalRelationshipEnded(status)
buildConjugalRelationshipHeadline(input)
buildConjugalRelationshipNarrative(relationship)
buildConjugalRelationshipTooltip(relationship, person1, person2)
parseConjugalDateValue(value)
formatConjugalRelationshipPlace(place)
```

## Regra de implementação

As próximas fases devem consumir esse utilitário em vez de duplicar lógica em componentes.

Primeiros alvos:

1. `src/app/components/FamilyTree/modals/ViewMarriageModal.tsx`;
2. `src/app/components/FamilyTree/buildTreeGraph.ts`;
3. `src/app/components/FamilyTree/MarriageNode.tsx`;
4. perfil público da pessoa;
5. admin de relacionamentos.

## Limites desta fase

- Esta fase não altera layout visual da árvore.
- Esta fase não altera banco de dados.
- O suporte semântico a `uniao_estavel` está preparado no utilitário, mas a tipagem global `SubtipoRelacionamento` ainda deve ser atualizada em etapa separada se o valor passar a ser usado diretamente nos formulários TypeScript.
