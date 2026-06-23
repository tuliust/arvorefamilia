# Curiosidades e IA

> Última revisão: 2026-06-23  
> Escopo: `/curiosidades`, `/meus-dados`, `/pessoa/:id`, geração de Mini Bio/Curiosidades e experiências agregadas com badges.

## Objetivo

Documentar o uso de IA e dados estruturados para gerar textos e apoiar experiências familiares sem inventar fatos ou expor dados privados.

## Usos atuais

- Mini Bio.
- Curiosidades.
- Sugestões baseadas em questionário de perfil.
- Badges no perfil público.
- Rankings familiares agregados.
- Comparação de interesses.
- Quiz familiar.
- Bodas e vínculos.

## Limites atuais

- Mini Bio: até 500 caracteres.
- Curiosidades: até 500 caracteres.
- Geração desejada: cerca de 400–450 caracteres por campo.

## Regras de segurança

A IA deve usar apenas dados fornecidos ou campos estruturados seguros.

### Proibido

- inventar fatos;
- inventar cidade, profissão, filhos, casamento, migração ou data;
- inferir saúde, religião, orientação sexual, finanças, conflitos familiares ou causa de morte;
- expor telefone/endereço/WhatsApp/redes sociais;
- usar URLs/storage paths/base64;
- mencionar IA no texto final.

## Memorial

O modo memorial é controlado por toggle, não por tom.

Se memorial ativo:

- terceira pessoa;
- passado;
- linguagem respeitosa;
- sem simular fala da pessoa.

## Uso de contexto adicional

Pode considerar:

- idade aproximada;
- local de nascimento;
- local de falecimento;
- profissão;
- vínculos familiares resumidos;
- fatos históricos textuais;
- tom selecionado;
- badges selecionados;
- respostas do questionário.

Desde que:

- estejam preenchidos;
- sejam seguros;
- não exponham dados privados;
- não sejam tratados como certeza quando forem inferência.

## `/curiosidades`

### Cards numéricos

Cards atuais:

- `Pessoas`;
- `Localização`;
- `In memoriam`;
- `Pets`;
- `Casais`.

### Regras dos cards

#### Pessoas

Conta familiares humanos cadastrados no site.

#### Localização

Conta cidades onde vivem pessoas com `local_atual` informado.

#### In memoriam

Conta familiares humanos falecidos na árvore genealógica.

#### Pets

Conta perfis com `humano_ou_pet = 'Pet'`.

#### Casais

Conta relações de união/casamento ativas quando aplicável.

## Rankings

### `Nomes mais comuns`

Substitui o antigo `Nome mais repetido`.

### `Mês com mais aniversários`

Exibe ranking dos 5 meses com mais aniversários.

Não deve listar nomes de pessoas nesse card.

### `Perfil dos familiares`

Substitui o antigo ranking de profissão repetida.

Deve usar preferencialmente `selected_badges` do questionário de `/meus-dados`.

Fallbacks permitidos:

- características disponíveis no objeto de pessoa;
- profissão somente quando não houver dados de badges suficientes, e com label adequado.

### `Principais cidades de nascimento`

Substitui `Cidade de nascimento mais comum`.

## Gráficos

### Profissões

Descrição atual:

```text
Principais ocupações dos perfis.
```

### Faixa etária

Substitui `Pessoas por geração` quando a visualização for por idade.

Deve classificar por faixas de idade, não por geração sociológica, quando o card assim indicar.

## Bodas

### Título

Usar:

```text
Bodas
```

Não usar `Bodas e Vínculos` quando o foco for aniversário de união.

### Falecimento

Anos de casamento não devem continuar contando depois da morte de um dos cônjuges.

Regra:

- se há casamento e um cônjuge faleceu, usar a menor data de falecimento como data final;
- se há separação antes do falecimento, usar separação como data final;
- se ambos vivos e relação ativa, contar até hoje.

## Comparar interesses

Deve usar informações de `/meus-dados` quando disponíveis:

- badges selecionados;
- características;
- hobbies;
- trabalho;
- lugares;
- momentos;
- marcas pessoais.

### Dropdown

Deve iniciar sem pessoa pré-selecionada.

Label inicial:

```text
Selecione
```

Não iniciar automaticamente com Absalon ou outra pessoa.

## Astrologia da família

Dropdowns devem iniciar em estado neutro:

```text
Selecione
```

Não pré-selecionar pessoas.

## Qual a minha conexão com alguém

Dropdowns devem iniciar em estado neutro:

```text
Selecione
```

Não pré-selecionar pessoas.

## Quiz familiar

### Pessoa viva com mais tempo de vida

Pergunta:

```text
Quem é a pessoa viva com mais tempo de vida na árvore?
```

Opções:

- 5 pessoas vivas mais velhas;
- correta: a pessoa viva mais velha.

### Pessoa mais jovem

Pergunta:

```text
Quem é a pessoa mais jovem na família?
```

Opções:

- 5 pessoas mais jovens;
- correta: a mais jovem.

### Cidade de nascimento

Exemplo:

```text
Quem nasceu em Paulo Afonso/BA?
```

Opções:

- 1 pessoa nascida na cidade;
- 4 pessoas aleatórias que não nasceram lá.

### Profissão

Exemplo:

```text
Qual destas pessoas abaixo é jornalista?
```

Opções:

- 1 pessoa com profissão Jornalista;
- 4 pessoas com profissões diferentes.

## Integração com `/meus-dados`

### Fonte

Usar dados de:

```text
person_profile_questionnaire_answers.selected_badges
```

### RPC/fallback

Preferir RPC segura para ler apenas badges selecionados.

Fallback permitido:

- leitura do registro do questionário quando o usuário autenticado tiver permissão;
- nunca expor respostas privadas completas em cards agregados sem necessidade.

## Perfil público

Badges do questionário podem aparecer em `/pessoa/:id`, agrupados por categoria.

Categorias:

- Personalidade;
- Família;
- Trabalho;
- Lugares;
- Momentos;
- Hobbies;
- Marcas pessoais.

## Não regressão

- Não voltar para 300 caracteres.
- Não acoplar `Nostálgico` a pessoa falecida.
- Não reintroduzir etapas 9 e 10 no questionário.
- Não salvar hash de geração sem geração salva.
- Não voltar cards para textos antigos.
- Não listar nomes no card de mês de aniversários.
- Não contar casamento após falecimento de cônjuge.
- Não pré-selecionar pessoas nos dropdowns de comparação/conexão/astrologia.
- Não usar telefone/endereço/redes sociais como contexto de IA.

## QA

1. Abrir `/curiosidades`.
2. Conferir cards `Pessoas`, `Localização`, `In memoriam`, `Pets`, `Casais`.
3. Conferir ranking `Nomes mais comuns`.
4. Conferir top 5 meses no card de aniversários.
5. Conferir `Perfil dos familiares` usando badges quando existirem.
6. Conferir `Principais cidades de nascimento`.
7. Conferir gráfico de `Faixa etária`.
8. Conferir `Bodas` com falecimento interrompendo contagem.
9. Conferir dropdowns iniciando com `Selecione`.
10. Conferir quiz com perguntas revisadas.
11. Conferir ausência de dados sensíveis.
12. Rodar `npm run typecheck`.
13. Rodar `npm run build`.
