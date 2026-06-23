# Plano de próximos passos

> Última revisão: 2026-06-23  
> Estado: frentes 6A, 7A, 7B, 7C, 7D e ajustes pós-ciclo de `/curiosidades`, `/mapa-familiar`, notificações, fórum e favoritos concluídos. Este documento lista pendências reais após os commits recentes.

## Concluído no ciclo 6A–7D

| Frente | Commit | Status |
|---|---:|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Implementado e pushado |
| Prompt 7A — questionário, IA e privacidade | `4a1a995` | Implementado e pushado |
| Prompt 7B — vínculos, pets, cônjuges e badges | `c9a8f27` | Implementado e pushado |
| Prompt 7C — fatos/arquivos históricos na timeline | `6185b6d` | Implementado e pushado |
| Prompt 7D — UX final do onboarding e IA 500 caracteres | `de4f60f` | Implementado e pushado |

## Concluído no pós-ciclo

| Frente | Commit | Status |
|---|---:|---|
| Ajustes amplos de `/curiosidades` | `bf8f57a` | Implementado e pushado |
| Integração de badges em `/curiosidades` | `ce80a00` | Implementado e pushado |
| Correção de tipagem de badges e bodas | `62a6254` | Implementado e pushado |
| Ajustes de painel, notificações, fórum e favoritos via overrides/conector | `e70f8a7` | Implementado e pushado |
| Seletor de visualização e cônjuges no painel | `dbcc09c` | Implementado e pushado |
| Distribuição de irmãos, cônjuge e pets no mapa | `5b69baf` | Implementado e pushado |
| Correção UTF-8 em layout do mapa | `3d228fa` | Implementado e pushado |

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
| `CURI-001` | Cards e rankings de `/curiosidades` revisados | Fechado |
| `CURI-002` | Badges de `/meus-dados` integrados a `/curiosidades` | Fechado |
| `TREE-UI-001` | Painel desktop compacto e dropdown revisado | Fechado |
| `TREE-LAYOUT-001` | Irmãos em 2 colunas, cônjuge/pets à direita | Fechado |
| `NOTIF-001` | Rodapé do dropdown de notificações sem corte | Fechado |
| `FORUM-001` | Busca desktop expandida | Fechado |
| `FAV-001` | Busca/filtros de favoritos expandidos | Fechado |

## Pendências reais abertas

### `QA-001` — Rodada manual pós-deploy

**Status:** aberto.

Executar em preview/produção:

- `/meus-dados` com pessoa viva;
- `/meus-dados` com pessoa falecida;
- geração de Mini Bio/Curiosidades com todos os tons;
- `/meus-vinculos` com filhos, pets, cônjuges e irmãos;
- `/arquivos-historicos` com fato sem arquivo, imagem e PDF;
- `/revisao-dados`;
- `/pessoa/:id` com timeline, contato e badges;
- `/curiosidades`;
- `/mapa-familiar` desktop e mobile;
- dropdown de notificações;
- `/forum` desktop/mobile;
- `/meus-favoritos` desktop/mobile.

### `DB-001` — Confirmar migrations no Supabase remoto

**Status:** aberto até validação no ambiente remoto.

Confirmar:

- `person_profile_questionnaire_answers` criada;
- policies aplicadas;
- `selected_badges` persistido corretamente;
- RPC `get_person_profile_selected_badges` disponível;
- `admin_reset_person_profile` atualizado;
- `arquivos_historicos.url/storage_bucket/storage_path/mime_type` aceitam nulo;
- RLS permite leitura/escrita dos registros do usuário vinculado.

### `CI-001` — Typecheck explícito

**Status:** recomendado.

O Vite build passou em vários ciclos, mas não substitui checagem completa de tipos. Recomenda-se manter como validação obrigatória:

```bash
npm run typecheck
npm run build
git diff --check
```

Também avaliar CI para bloquear merge/push em caso de falha.

### `MOBILE-001` — QA específica dos scripts mobile

**Status:** aberto.

O ciclo recente preservou mobile por condicionais/overrides, mas ainda precisa QA visual:

- mapa vertical mobile;
- mapa horizontal mobile;
- zoom 3x3;
- overview;
- filtros;
- painel `+`;
- conectores;
- cards de pets e pessoas;
- dropdowns e botões sem overflow.

### `ENC-001` — Monitorar encoding UTF-8

**Status:** monitoramento.

Foi necessário corrigir encoding em `directFamilyDistributedLayout.ts`. Manter atenção a strings com mojibake:

- `FamÃ­lia`;
- `cÃ´njuges`;
- `VisualizaÃ§Ã£o`;
- `Ãrvore`;
- `Irmăos`.

Se aparecer, corrigir o arquivo em UTF-8 e validar no GitHub remoto.

### `DOC-001` — Aplicar documentação ao repositório

**Status:** aberto até commit dos arquivos `docs/`.

Arquivos atualizados fora do repo devem ser copiados para:

- `docs/funcionalidades/`;
- `docs/`;
- `docs/historico/`;
- `docs/operacao/`, quando aplicável.

Commit sugerido:

```bash
git add docs
git commit -m "docs: documenta ajustes pós ciclo 7D"
git push origin feature/questionario-ia-vinculos-pets
```

### `PREVIEW-001` — Revisão em ambiente publicado

**Status:** aberto.

Depois do deploy/preview:

- validar se CSS de overrides foi carregado;
- validar se o bundle não usa cache antigo;
- validar se as alterações do painel e dropdown estão visíveis;
- validar se Supabase remoto tem migrations aplicadas;
- validar se usuários reais com dados incompletos não quebram `/curiosidades`.

## Melhorias futuras possíveis

### `IA-002` — Enriquecimento controlado do contexto da IA

**Status:** melhoria incremental.

Próxima evolução possível:

- incluir resumo controlado de vínculos;
- incluir fatos históricos textuais sem URLs;
- incluir idade aproximada calculada no backend/frontend;
- incluir profissão/localidade quando informados.

Essa evolução deve manter o filtro de privacidade.

### `CURI-003` — Melhorar personalização de `/curiosidades`

**Status:** melhoria incremental.

Possibilidades:

- filtros por ramo familiar;
- destaque de pessoas com mais informações completas;
- ranking de perfis mais preenchidos;
- cards de descobertas baseados em fatos históricos.

### `TREE-006` — Decisão de produto sobre seletor “Visualizar como”

**Status:** decisão de produto.

O seletor está funcional, mas pode exigir decisão final:

- manter como funcionalidade oficial;
- restringir a QA/admin;
- ocultar em produção;
- manter para todos os membros.

Enquanto isso, a documentação trata o seletor como funcionalidade do painel desktop.

## Não fazer sem nova frente explícita

- Não reabrir as etapas 9 e 10 do questionário IA.
- Não voltar o limite para 300 caracteres.
- Não usar `Nostálgico` como gatilho automático de pessoa falecida.
- Não exigir upload em Fatos e Arquivos Históricos.
- Não voltar pets para Filhos.
- Não exibir ações no header das páginas de onboarding.
- Não alterar scripts mobile ou `index.html` em frentes de onboarding/desktop.
- Não reverter o dropdown para `Família de Maria` nas opções.
- Não reverter irmãos desktop para 1 coluna.
- Não remover o deslocamento desktop de cônjuge/pets sem QA visual.
- Não remover validação `typecheck`.
