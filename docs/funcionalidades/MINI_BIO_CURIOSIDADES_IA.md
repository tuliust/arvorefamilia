# Meus dados, IA, Mini Bio e Curiosidades

> Última revisão: 2026-06-23
> Escopo: `/meus-dados`, `/meus-vinculos`, `/pessoa/:id`, `/curiosidades` e `api/ai.ts`.
> Status: canônico.

## Campos de perfil

A aplicação trabalha com textos curtos de perfil:

- `minibio`;
- `curiosidades`.

Os campos devem ter até 500 caracteres cada quando gerados por IA.

## Geração por IA

`api/ai.ts` usa `purpose === "profile_text"` para gerar textos de perfil.

Payload relevante:

- `tone`;
- `selectedBadges`;
- `customTraits`;
- `answers`;
- `context`;
- `memorialMode`.

A resposta esperada é JSON válido:

```json
{"minibio":"...","curiosidades":"..."}
```

## Modo memorial

- Ativado apenas por `memorialMode === true`.
- Usa terceira pessoa.
- Usa verbos no passado.
- Não deve escrever como se a pessoa ainda estivesse viva.
- Evita linguagem fúnebre pesada.

## Pessoa viva

- Usa primeira pessoa.
- Não deve inventar fatos.
- Pode considerar respostas do questionário, badges, idade aproximada, local de nascimento, cidade atual, profissão, vínculos e fatos históricos enviados no contexto.

## Restrições

A IA não deve:

- expor IDs internos;
- expor telefone, endereço, tokens, storage paths ou dados técnicos;
- inferir saúde, religião, orientação sexual, condição financeira, conflitos, causa de morte ou tema sensível não informado;
- mencionar IA no texto final;
- usar placeholders.

## Integrações

- `/meus-dados` coleta dados e preferências.
- `/meus-vinculos` pode exibir e salvar textos de perfil conforme fluxo.
- `/pessoa/:id` consome os textos salvos.
- `/curiosidades` pode usar badges e características de perfil para estatísticas.
- `Home.tsx` também usa IA para perguntas sobre a árvore com contexto JSON limitado.
