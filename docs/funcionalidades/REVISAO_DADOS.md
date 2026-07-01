# Revisão de dados

> Última revisão: 2026-07-01
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
- Parentes adicionados ou removidos em `/meus-vinculos` devem aparecer com badge `Em análise` ou estado equivalente de pendência.
- Pets cadastrados ou editados no primeiro acesso devem aparecer no resumo final quando estiverem no rascunho de vínculos.
- Para pets, a badge pública pode ser `Em aprovação`, desde que o estado continue representando pendência de análise.
- A regra de pendência vale para irmãos, filhos, cônjuges, pais, pets e demais parentes quando a alteração não for definitiva.
- No mobile, o card inicial deve priorizar o nome completo do usuário e não deve exibir o botão `Editar perfil`.
- No mobile, o botão `Finalizar e acessar árvore` deve ficar no final da página, depois das seções de resumo.

## Saída do fluxo

Ao concluir, o usuário deve ser direcionado para a experiência de árvore, preferencialmente `/mapa-familiar`.

Antes de carregar a árvore, se o usuário logado for responsável por outros perfis, o sistema deve exibir modal informando os perfis sob responsabilidade e perguntando se deseja editar essas páginas agora.

Texto funcional do modal:

```text
Você foi selecionado como responsável pelos perfis:

XXX
XXX

Deseja editar as páginas agora?

Sim / Depois
```

Regras do modal:

- `Sim` deve encaminhar para edição/fluxo dos perfis indicados;
- `Depois` deve seguir para a árvore sem perder o vínculo de responsabilidade;
- a ausência de perfis sob responsabilidade deve pular o modal;
- o modal não deve aparecer repetidamente sem mudança de estado.

## QA mínimo

- Revisar fluxo de pessoa viva.
- Revisar fluxo de pessoa falecida.
- Confirmar resumo de vínculos.
- Confirmar fatos/arquivos históricos.
- Confirmar que parentes adicionados/removidos aparecem como `Em análise`.
- Confirmar que pets pendentes aparecem na revisão com `Em aprovação` ou estado equivalente.
- Confirmar no mobile que o botão `Editar perfil` não aparece no card inicial.
- Confirmar no mobile que `Finalizar e acessar árvore` fica no final da página.
- Confirmar que o botão final não perde estado ou duplica solicitações.
- Confirmar modal de responsáveis antes da árvore quando o usuário tiver perfis sob responsabilidade.
- Confirmar que o modal não aparece quando não há perfis sob responsabilidade.
