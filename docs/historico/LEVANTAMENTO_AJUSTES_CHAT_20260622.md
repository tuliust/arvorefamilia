# Levantamento dos ajustes realizados no chat — 2026-06-22

> Última revisão: 2026-06-22  
> Escopo: consolidação funcional e documental do ciclo 6A–7D.

## Commits confirmados


| Frente | Commit | Status |
|---|---:|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Implementado e pushado |
| Prompt 7A — questionário, IA e privacidade | `4a1a995` | Implementado e pushado |
| Prompt 7B — vínculos, pets, cônjuges e badges | `c9a8f27` | Implementado e pushado |
| Prompt 7C — fatos/arquivos históricos na timeline | `6185b6d` | Implementado e pushado |
| Prompt 7D — UX final do onboarding e IA 500 caracteres | `de4f60f` | Implementado e pushado |


## Prompt 6A — Mapa familiar, tour e painel

### Commit

```text
5e64d74 Improve family map tour and compact layout
```

### Ajustes

- Dropdown do painel desktop passou a usar `Família de X`.
- Seleção manual preservada.
- Card `Cadastrados` passou a usar `user_person_links`.
- Tour revisado:
  - `Inteligência artificial e datas importantes`;
  - `Guarde os seus destaques`.
- Layout compacto para árvore pequena e simples.
- Scripts mobile e `index.html` não foram alterados.

## Prompt 7A — Questionário e geração de perfil

### Commit

```text
4a1a995 Refine profile questionnaire generation flow
```

### Ajustes

- Refinado fluxo de questionário IA.
- `lastGeneratedHash` só representa geração salva.
- Contexto de IA sanitizado no frontend.
- Contexto de IA sanitizado no backend.
- Migration/tabela `person_profile_questionnaire_answers` usada para persistência.

## Prompt 7B — Vínculos, pets e cônjuges

### Commit

```text
c9a8f27 Refine relationship review rules for pets and spouses
```

### Ajustes

- Pets reforçados como grupo próprio.
- Pet não entra em Filhos.
- Pessoa humana não entra em Pets.
- Criação de pet com `humano_ou_pet: 'Pet'`.
- Cônjuges limitados a um ativo no estado local.
- Badge `Cadastrado` baseado em vínculo real.
- Alterações seguem como solicitação pendente.

## Prompt 7C — Fatos e Arquivos Históricos na timeline

### Commit

```text
6185b6d Integrate historical facts into person timeline
```

### Ajustes

- Fatos sem arquivo implementados.
- Upload tornou-se opcional.
- Migration `20260622170000_allow_historical_facts_without_file.sql` criada.
- `url`, `storage_bucket`, `storage_path`, `mime_type` podem ser nulos.
- Timeline do perfil passou a receber fatos/arquivos.
- Badge `Fato` para registro sem anexo.
- Badge `Arquivo` para registro com anexo.
- `/revisao-dados` diferencia Fato sem arquivo, Imagem e PDF.

## Hotfix — MapPin

### Ajuste

- Corrigido `ReferenceError: MapPin is not defined` em `/meus-dados`.
- Causa: ícone usado sem import.
- Lição: Vite build pode passar sem detectar todos os erros de runtime; typecheck explícito é recomendado.

## Prompt 7D — UX final do onboarding

### Commit

```text
de4f60f Refine onboarding profile and relationship UX
```

### Ajustes em `/meus-dados`

- Pergunta da etapa 1 virou `Qual é o seu estilo?`.
- `Nostálgico` deixou de ser gatilho de memorial.
- Toggle virou `Você está escrevendo o perfil de uma pessoa falecida?`.
- Qualquer tom pode gerar memorial se o toggle estiver em `Sim`.
- Removidas etapas 9 e 10.
- Última etapa sem botão `Avançar`.

### Ajustes em IA

- Limite aumentado para 500 caracteres por campo.
- IA orientada a gerar 400–450 caracteres.
- Texto não precisa começar com nome da pessoa.
- IA pode considerar dados estruturados seguros além do questionário.

### Ajustes em `/meus-vinculos`

- Removido botão `Salvar textos`.
- Textos salvos ao avançar.
- `Sobre mim` fora do box.
- `Familiares de X` fora do container.
- Botões inferiores de adicionar removidos.
- Label feminina de irmã corrigida.

### Ajustes em headers

Header sem ações em:

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

## Documentação corrigida

Esta revisão documental removeu contradições sobre:

- 300 vs 500 caracteres;
- 10 vs 8 etapas;
- `Nostálgico` como memorial;
- fatos históricos sem arquivo como pendência;
- layout antigo de `/meus-vinculos`;
- botões duplicados;
- headers com ações no onboarding;
- trechos corrompidos por encoding/mojibake.

## Pendências reais restantes

- QA manual pós-deploy.
- Aplicação/validação das migrations no Supabase remoto.
- Decisão de produto sobre `Visualizar como...`.
- Typecheck explícito no pipeline.
- QA mobile dedicada.
