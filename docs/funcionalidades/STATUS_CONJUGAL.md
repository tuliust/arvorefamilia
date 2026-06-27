# Status conjugal

> Última revisão: 2026-06-26
> Escopo: interpretação, exibição e validação de vínculos conjugais.
> Status: canônico.

## Objetivo

O status conjugal é uma camada semântica compartilhada para interpretar vínculos do tipo `conjuge` sem criar campo persistido adicional neste momento.

A fonte de verdade continua sendo composta pelos campos já existentes em `relacionamentos` e pelos dados de falecimento das pessoas envolvidas.

## Fonte técnica

```text
src/app/utils/conjugalRelationshipStatus.ts
```

Funções públicas principais:

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

## Campos considerados

Do relacionamento:

- `subtipo_relacionamento`;
- `data_casamento`;
- `data_separacao`;
- `local_casamento`;
- `local_separacao`;
- `ativo`;
- `observacoes`.

Das pessoas:

- `falecido`;
- `data_falecimento`;
- `local_falecimento`.

## Status calculados

| Status | Critério |
|---|---|
| `active` | Sem separação, sem falecimento e `ativo !== false`. |
| `widowed` | Um dos cônjuges está falecido e não há separação registrada. |
| `separated` | Existe `data_separacao`, `data_fim` ou `subtipo_relacionamento = separado`. |
| `divorced` | Existe subtipo `divorciado` ou `divorcio`, quando o dado estiver disponível. |
| `inactive` | `ativo = false` sem separação ou falecimento. |
| `historical` | Ambos os cônjuges estão falecidos e não há separação registrada. |

## Uso atual

### Árvore familiar

Arquivos principais:

```text
src/app/components/FamilyTree/buildTreeGraph.ts
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/TreeConjugalStatusLegend.tsx
src/app/components/FamilyTree/TreeLegend.tsx
```

A árvore diferencia visualmente os vínculos conjugais por status. A diferenciação usa símbolo e padrão de linha, não apenas cor.

| Status | Símbolo | Linha |
|---|---|---|
| `active` | `♥` | sólida |
| `widowed` | `◌` | discreta |
| `separated` | `∕` | tracejada |
| `divorced` | `×` | tracejada |
| `inactive` | `…` | pontilhada |
| `historical` | `◇` | discreta |

### Modal conjugal

Arquivo principal:

```text
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

O modal consome a camada compartilhada para exibir:

- status do vínculo;
- descrição curta;
- chamada principal do relacionamento;
- narrativa de datas e locais;
- contexto enviado nas sugestões de correção.

### Perfil público

Arquivo principal:

```text
src/app/components/person/PersonRelationshipsView.tsx
```

O perfil agrupa vínculos conjugais em:

| Grupo | Status incluídos |
|---|---|
| Relacionamento atual | `active` |
| Relacionamentos anteriores | `separated`, `divorced`, `inactive` |
| Uniões históricas | `widowed`, `historical` |

### Admin de relacionamentos

Arquivo principal:

```text
src/app/pages/admin/AdminRelacionamentoForm.tsx
```

O formulário administrativo:

- exibe status inferido antes de salvar;
- força relacionamento como inativo quando o subtipo é `separado`;
- força relacionamento como inativo quando há data de separação;
- bloqueia combinações contraditórias entre relacionamento ativo e separação;
- bloqueia local de separação isolado sem data ou subtipo `separado`.

## Decisão sobre persistência

Não foi criada migration para coluna própria de status conjugal.

Motivo: o status atual é inferido de campos já existentes. Persistir um campo adicional agora criaria risco de divergência entre:

- status inferido pelo modelo semântico;
- status salvo manualmente em coluna própria.

A criação de uma coluna explícita só deve ser considerada se surgir necessidade operacional de edição manual independente da inferência.

## Limites conhecidos

- `uniao_estavel` ainda é usado no admin com cast local porque a tipagem global `SubtipoRelacionamento` não foi ampliada nesta frente.
- `divorced` está preparado semanticamente, mas depende de dado com subtipo `divorciado` ou `divorcio`.
- O modelo não altera schema, migrations, RLS ou payloads externos.

## Regra de manutenção

Toda nova exibição de vínculo conjugal deve consumir `src/app/utils/conjugalRelationshipStatus.ts` em vez de duplicar regras localmente.
