# Revisão de dados

> Última revisão: 2026-06-23
> Escopo: `/revisao-dados` e fechamento do fluxo de membro.
> Status: canônico.

## Objetivo

Apresentar ao membro um resumo final dos dados antes de concluir o fluxo e seguir para o mapa familiar.

## Entradas esperadas

- Dados pessoais de `/meus-dados`.
- Vínculos familiares de `/meus-vinculos`.
- Fatos e arquivos de `/arquivos-historicos`.
- Preferências de `/preferencias`, quando aplicável.
- Textos de Mini Bio e Curiosidades quando fornecidos ou gerados.

## Regras

- Pessoa falecida pode chegar à revisão sem passar por `/preferencias`.
- Alterações que dependem de aprovação não devem ser descritas como aplicadas definitivamente.
- Dados privados devem respeitar permissões de exibição.
- Pets devem permanecer separados de filhos humanos.

## Saída do fluxo

Ao concluir, o usuário deve ser direcionado para a experiência de árvore, preferencialmente `/mapa-familiar`.

## QA mínimo

- Revisar fluxo de pessoa viva.
- Revisar fluxo de pessoa falecida.
- Confirmar resumo de vínculos.
- Confirmar fatos/arquivos históricos.
- Confirmar que o botão final não perde estado ou duplica solicitações.
