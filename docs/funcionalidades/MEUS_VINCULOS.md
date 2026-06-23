# Meus Vínculos

> Última revisão: 2026-06-23  
> Escopo: `/meus-vinculos` após Prompts 7B, 7D e integrações posteriores com IA, badges e revisão de dados.

## Objetivo

Permitir que o usuário revise, complemente e solicite correções nos vínculos familiares da pessoa vinculada.

A tela deve funcionar como uma etapa de curadoria assistida, conectando:

- dados pessoais revisados em `/meus-dados`;
- textos de Mini Bio e Curiosidades;
- vínculos familiares;
- pets;
- solicitações de alteração para análise administrativa.

## Estrutura da tela

### Bloco `Sobre mim`

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

### Bloco `Familiares de X`

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
- Pets devem ser preservados como grupo próprio também em `/revisao-dados` e `/mapa-familiar`.

## Filhos

- Apenas humanos.
- Se souber, usuário pode informar outro pai/mãe.
- Pet não entra nesse grupo.

## Cônjuges

### Regra

No estado local, apenas um cônjuge pode estar ativo.

Se um novo cônjuge for marcado como ativo, os demais devem ser inativados no estado local.

### Efeito no mapa

A informação de cônjuge ativo influencia a visualização familiar e os grupos de relacionamento. Ajustes de exibição de cônjuges indiretos no painel do mapa não devem alterar a regra de vínculo ativo em `/meus-vinculos`.

## Badges

### `Cadastrado`

Exibir quando a pessoa possui vínculo real em `user_person_links`.

### `Pré-cadastrado`

Exibir quando a pessoa existe na árvore, mas não possui usuário vinculado.

### `Em análise`

Exibir para alterações pendentes.

## Questionário IA e características

As respostas e características de `/meus-dados` são persistidas em `person_profile_questionnaire_answers`.

Essas informações alimentam:

- geração de Mini Bio;
- geração de Curiosidades;
- badges exibidos no perfil público;
- ranking `Perfil dos familiares` em `/curiosidades`;
- comparação de interesses em `/curiosidades`.

### Regra de privacidade

A tela de vínculos não deve expor dados sensíveis como:

- telefone;
- endereço;
- WhatsApp;
- redes sociais;
- storage paths;
- tokens;
- URLs privadas.

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

## Integrações relacionadas

### `/meus-dados`

Fonte de:

- dados pessoais;
- privacidade;
- foto;
- redes sociais versionadas;
- questionário IA;
- badges selecionados.

### `/revisao-dados`

Consolida:

- dados pessoais;
- Mini Bio;
- Curiosidades;
- vínculos;
- pets;
- fatos e arquivos históricos.

### `/curiosidades`

Consome características selecionadas no questionário para:

- ranking `Perfil dos familiares`;
- comparação de interesses;
- experiências familiares não sensíveis.

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
12. Confirmar que vínculos alterados viram solicitação quando usuário não for admin.
13. Confirmar que dados do questionário não expõem telefone/endereço/redes.
14. Confirmar que badges do questionário aparecem em experiências relacionadas quando disponíveis.

## Não regressão

- Não misturar pets com filhos.
- Não reintroduzir botão inferior de adicionar em estado vazio.
- Não permitir múltiplos cônjuges ativos no estado local.
- Não voltar a salvar Mini Bio/Curiosidades por botão separado.
- Não expor dados privados em prompts ou cards derivados de IA.
