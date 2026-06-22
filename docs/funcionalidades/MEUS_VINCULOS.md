# Meus Vínculos

> Última revisão: 2026-06-22  
> Escopo: `/meus-vinculos` após Prompts 7B e 7D.

## Objetivo

Permitir que o usuário revise, complemente e solicite correções nos vínculos familiares da pessoa vinculada.

## Estrutura da tela

### Bloco “Sobre mim”

Fica acima do box de Mini Bio/Curiosidades.

Contém:

- ícone à esquerda;
- título `Sobre mim`;
- subtítulo explicando que a IA usa respostas de `/meus-dados`.

O box abaixo contém:

- Mini Bio;
- Curiosidades;
- botão `Regenerar com IA`.

Não existe mais botão `Salvar textos`. Os textos são salvos ao avançar.

### Bloco “Familiares de X”

Fica fora do container de vínculos.

Contém:

- avatar/ícone;
- título `Familiares de [Nome]`;
- subtítulo orientativo.

## Grupos de vínculo

Grupos atuais:

- Pais/Mães;
- Cônjuges;
- Filhos;
- Pets;
- Irmãos.

## Pets

### Regra

Pet é pessoa com:

```text
humano_ou_pet = 'Pet'
```

### Comportamento

- Pet aparece em `Pets`.
- Pet não aparece em `Filhos`.
- Pet não aparece em Pais/Mães/Cônjuges/Irmãos.
- Novo pet deve ser criado como `Pet`.

## Filhos

- Apenas humanos.
- Se souber, usuário pode informar outro pai/mãe.
- Pet não entra nesse grupo.

## Cônjuges

### Regra

No estado local, apenas um cônjuge pode estar ativo.

Se um novo cônjuge for marcado como ativo, os demais devem ser inativados no estado local.

## Badges

### `Cadastrado`

Exibir quando a pessoa possui vínculo real em `user_person_links`.

### `Pré-cadastrado`

Exibir quando a pessoa existe na árvore, mas não possui usuário vinculado.

### `Em análise`

Exibir para alterações pendentes.

## Solicitações pendentes

Membros não criam relacionamento definitivo diretamente.

Ações de vínculo geram registros em:

```text
relationship_change_requests
```

## Botões de adicionar

Cada grupo possui apenas botão superior de adicionar.

O botão inferior em estado vazio foi removido.

## Labels de gênero

Quando pessoa for mulher:

- usar `Irmã`;
- usar `Falecida`/`Viva` quando aplicável.

Evitar `Irmão(a)` quando há gênero conhecido.

## Rascunho

A tela usa rascunho em `sessionStorage` para preservar alterações locais até avanço/conclusão.

## QA mínimo

1. Abrir `/meus-vinculos`.
2. Confirmar header sem ações.
3. Confirmar `Sobre mim` fora do box.
4. Confirmar ausência de `Salvar textos`.
5. Editar textos e avançar; confirmar persistência.
6. Confirmar `Familiares de X` fora do container.
7. Criar pet; confirmar grupo Pets.
8. Criar filho; confirmar grupo Filhos.
9. Confirmar ausência de botão inferior nos estados vazios.
10. Confirmar label `Irmã` para mulher.
11. Confirmar só um cônjuge ativo.
