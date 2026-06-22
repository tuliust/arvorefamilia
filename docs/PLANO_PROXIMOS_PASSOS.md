# Plano de próximos passos

> Última revisão: 2026-06-22  
> Estado: frentes 6A, 7A, 7B, 7C e 7D concluídas. Este documento lista apenas pendências reais após esses commits.

## Concluído neste ciclo


| Frente | Commit | Status |
|---|---:|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Implementado e pushado |
| Prompt 7A — questionário, IA e privacidade | `4a1a995` | Implementado e pushado |
| Prompt 7B — vínculos, pets, cônjuges e badges | `c9a8f27` | Implementado e pushado |
| Prompt 7C — fatos/arquivos históricos na timeline | `6185b6d` | Implementado e pushado |
| Prompt 7D — UX final do onboarding e IA 500 caracteres | `de4f60f` | Implementado e pushado |


## Pendências fechadas

| ID antigo | Tema | Status |
|---|---|---|
| `TREE-6A` | Dropdown `Família de X`, tour, cadastrados e layout compacto | Fechado |
| `AI-7A` | Questionário IA, privacidade e hash de geração | Fechado |
| `VINC-7B` | Pets separados, cônjuge ativo, badges, fluxo pendente | Fechado |
| `HIST-7C` | Fatos sem arquivo e timeline do perfil | Fechado |
| `UX-7D` | UX final do onboarding, headers sem ações e IA 500 caracteres | Fechado |
| `REV-001` | Pets separados de Filhos em `/revisao-dados` | Fechado |
| `HIST-001` | Fatos e Arquivos Históricos sem exigir arquivo | Fechado |

## Pendências reais abertas

### `TREE-005` — Decisão sobre seletor/debug “Visualizar como...”

**Status:** aberto.

O seletor/debug de visualização ainda precisa de decisão de produto:

- manter apenas em ambiente de QA/admin;
- remover da experiência final;
- transformar em funcionalidade oficial de troca de pessoa central.

A documentação não deve apresentar o seletor como funcionalidade final até essa decisão.

### `QA-001` — Rodada manual pós-deploy

**Status:** aberto.

Executar em preview/produção:

- `/meus-dados` com pessoa viva;
- `/meus-dados` com pessoa falecida;
- geração de Mini Bio/Curiosidades com todos os tons;
- `/meus-vinculos` com filhos, pets, cônjuges e irmãos;
- `/arquivos-historicos` com fato sem arquivo, imagem e PDF;
- `/revisao-dados`;
- `/pessoa/:id` com timeline;
- `/mapa-familiar` desktop e mobile.

### `DB-001` — Confirmar migrations no Supabase remoto

**Status:** aberto até validação no ambiente remoto.

Confirmar:

- `person_profile_questionnaire_answers` criada;
- policies aplicadas;
- `arquivos_historicos.url/storage_bucket/storage_path/mime_type` aceitam nulo;
- RLS permite leitura/escrita dos registros do usuário vinculado.

### `CI-001` — Typecheck explícito

**Status:** recomendado.

O Vite build passou, mas não substitui uma checagem completa de tipos. Recomenda-se adicionar ou rodar:

```bash
npx tsc --noEmit
```

ou script equivalente no `package.json`.

### `MOBILE-001` — QA específica dos scripts mobile

**Status:** aberto.

O ciclo não alterou scripts mobile. Ainda assim, após deploy, validar:

- mapa vertical mobile;
- mapa horizontal mobile;
- zoom 3x3;
- overview;
- filtros;
- painel `+`;
- conectores;
- cards de pets e pessoas.

### `IA-002` — Enriquecimento controlado do contexto da IA

**Status:** aberto como melhoria incremental.

O Prompt 7D permitiu considerar dados estruturados adicionais, desde que seguros. Próxima melhoria possível:

- incluir resumo controlado de vínculos;
- incluir fatos históricos textuais sem URLs;
- incluir idade aproximada calculada no backend/frontend;
- incluir profissão/localidade quando informados.

Essa evolução deve manter o filtro de privacidade.

## Não fazer sem nova frente explícita

- Não reabrir as etapas 9 e 10 do questionário IA.
- Não voltar o limite para 300 caracteres.
- Não usar `Nostálgico` como gatilho automático de pessoa falecida.
- Não exigir upload em Fatos e Arquivos Históricos.
- Não voltar pets para Filhos.
- Não exibir ações no header das páginas de onboarding.
- Não alterar scripts mobile ou `index.html` em frentes de onboarding.
