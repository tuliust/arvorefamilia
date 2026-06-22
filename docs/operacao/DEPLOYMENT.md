# Deployment

> Última revisão: 2026-06-22

## Checklist antes do deploy

```bash
git status --short
git diff --check
npm run build
```

Recomendado:

```bash
npx tsc --noEmit
```

## Checklist de migrations

Confirmar aplicação no Supabase remoto:

- `20260622120000_create_person_profile_questionnaire_answers.sql`;
- `20260622170000_allow_historical_facts_without_file.sql`.

## Checklist pós-deploy

### Onboarding

- `/meus-dados` abre sem erro.
- Questionário tem 8 etapas.
- Toggle memorial funciona.
- Mini Bio/Curiosidades aceitam 500 caracteres.
- `/meus-vinculos` salva textos ao avançar.
- `/arquivos-historicos` salva fato sem arquivo.
- `/revisao-dados` mostra fatos/arquivos corretamente.

### Perfil

- `/pessoa/:id` mostra timeline.
- Fato sem arquivo aparece como `Fato`.
- Arquivo com anexo aparece como `Arquivo`.

### Mapa

- `/mapa-familiar` carrega.
- Dropdown `Família de X`.
- Tour funciona.
- Mobile sem regressão.

## Cache

Se houver erro em produção com chunk antigo:

1. Abrir aba anônima.
2. Limpar cache local.
3. Confirmar hash do asset no deploy.
4. Invalidar cache/CDN se aplicável.

## Rollback

Rollback exige avaliar migrations:

- código pode voltar;
- migrations geralmente não devem ser revertidas automaticamente;
- `url` nullable em `arquivos_historicos` é compatível com estado atual e não deve ser revertido sem plano.

## Variáveis de ambiente

Para IA:

- `OPENAI_API_KEY`;
- `OPENAI_MODEL` opcional.

Sem `OPENAI_API_KEY`, geração de textos falha com mensagem amigável.

## Critérios de aprovação

- build aprovado;
- migrations aplicadas;
- rotas críticas testadas;
- console sem erro runtime;
- RLS validado com usuário membro;
- documentação compatível com o código implantado.
