# Mini Bio e Curiosidades com IA

> Última revisão: 2026-06-23  
> Escopo: `/meus-dados`, `/meus-vinculos`, `/pessoa/:id`, `/curiosidades` e `api/ai.ts` após Prompts 7A, 7D e integrações pós-7D.

## Objetivo

Gerar e permitir edição de dois textos do perfil familiar:

- Mini Bio;
- Curiosidades.

Os textos ajudam a humanizar o perfil da pessoa na árvore familiar, no perfil público e nas experiências de memória/curiosidades.

## Limite atual

Cada campo aceita até:

```text
500 caracteres
```

A IA deve buscar aproximadamente:

```text
400–450 caracteres por campo
```

quando houver dados suficientes.

## Regra de início do texto

Não é necessário começar com:

- `Sou Fulano...`;
- `[Nome] foi...`;
- `[Nome] é...`.

O nome já aparece no perfil. O texto pode começar diretamente pela característica, trajetória, memória ou contexto.

## Questionário IA

O questionário em `/meus-dados` possui 8 etapas:

1. Qual é o seu estilo?
2. Personalidade.
3. Família e vínculos.
4. Trabalho e trajetória.
5. Lugares e mudanças de cidade.
6. Momentos marcantes.
7. Hobbies e paixões.
8. Marcas pessoais e curiosidades.

As antigas etapas `Outras características` e `Perguntas opcionais` foram removidas.

## Tons

Tons disponíveis:

- Afetivo;
- Simples e direto;
- Divertido;
- Elegante;
- Nostálgico;
- Inspirador;
- Familiar;
- Emocional;
- Leve;
- Formal.

## Modo memorial

O modo memorial não é definido pelo tom.

É definido pelo toggle:

```text
Você está escrevendo o perfil de uma pessoa falecida?
```

### Se o toggle for `Sim`

Qualquer tom deve gerar:

- terceira pessoa;
- verbos no passado;
- tom respeitoso;
- sem tratar a pessoa como viva;
- sem simular fala direta da pessoa.

### Se o toggle for `Não`

O texto pode usar primeira pessoa quando o usuário escreve o próprio perfil.

## `Nostálgico`

`Nostálgico` é apenas um tom. Ele pode ser usado para pessoa viva ou falecida.

Não deve ativar modo memorial sozinho.

## Persistência

As respostas do questionário são persistidas em:

```text
person_profile_questionnaire_answers
```

Campos relevantes:

- `tone`;
- `selected_badges`;
- `custom_traits`;
- `generated_questions`;
- `answers`;
- `memorial_mode`;
- `last_generated_hash`.

## Badges selecionados

Os badges de `selected_badges` são usados além da geração de texto.

Eles alimentam:

- badges exibidos em `/pessoa/:id`;
- ranking `Perfil dos familiares` em `/curiosidades`;
- comparação de interesses em `/curiosidades`;
- contexto seguro para sugestões e cards familiares.

### Categorias

Categorias atuais:

- Personalidade;
- Família;
- Trabalho;
- Lugares;
- Momentos;
- Hobbies;
- Marcas pessoais.

## Hash de geração

`lastGeneratedHash` deve representar a última geração efetivamente salva.

Não atualizar hash apenas por salvar questionário comum.

### Regra

Atualizar `lastGeneratedHash` somente quando:

- a IA gerou texto;
- o texto foi salvo;
- o payload usado na geração corresponde ao hash persistido.

## Fontes de contexto permitidas

A IA pode considerar, quando disponíveis e seguros:

- respostas do questionário;
- tom selecionado;
- modo memorial;
- badges selecionados;
- características customizadas;
- nome, apenas para contexto, sem precisar repetir no início;
- data de nascimento;
- local de nascimento;
- data/local de falecimento;
- profissão;
- local atual, apenas para pessoa viva;
- vínculos familiares em resumo seguro;
- fatos históricos textuais sem URLs;
- idade aproximada, se calculada de forma segura.

## Dados proibidos no contexto

Não enviar:

- telefone;
- endereço;
- complemento;
- WhatsApp;
- redes sociais;
- Instagram;
- permissões de privacidade;
- URLs;
- storage paths;
- signed URLs;
- base64;
- tokens;
- chaves;
- causa de morte não informada;
- inferências sensíveis não declaradas.

## Backend `api/ai.ts`

### Contratos

- Método POST.
- `purpose: 'profile_text'` para Mini Bio/Curiosidades.
- Retorno exclusivamente JSON:

```json
{
  "minibio": "...",
  "curiosidades": "..."
}
```

### Limite backend

O backend também deve limitar a 500 caracteres.

### Prompt

A instrução do modelo deve:

- pedir cerca de 400–450 caracteres por campo;
- evitar início redundante com nome;
- proibir invenção;
- proibir dados técnicos;
- respeitar memorial quando `memorialMode === true`;
- retornar JSON válido.

## Frontend `/meus-dados`

### Responsabilidades

- coletar tom;
- coletar badges;
- coletar características customizadas;
- gerar perguntas;
- salvar respostas;
- preservar rascunho em sessão quando necessário;
- não bloquear salvamento por campos não relacionados.

## Frontend `/meus-vinculos`

### Estado atual

- Exibe os dois textos editáveis.
- Mostra contadores de 500 caracteres.
- Permite regenerar com IA.
- Não tem botão `Salvar textos`.
- Salva ao avançar a página.

## Perfil público `/pessoa/:id`

Quando houver badges do questionário:

- exibir no card `Sobre`;
- agrupar por categoria;
- não expor dados sensíveis;
- não exibir badges inexistentes ou vazios.

## `/curiosidades`

Pode usar badges para:

- ranking `Perfil dos familiares`;
- comparação de interesses;
- sugestões familiares;
- experiências agregadas.

Não deve usar badges para inferir dados sensíveis.

## Exemplos de texto aceitável

### Pessoa viva

```text
Valoriza vínculos familiares, histórias antigas e momentos de convivência. Tem um jeito curioso e comunicativo, gosta de aprender com as experiências e costuma preservar lembranças que ajudam a manter a família próxima.
```

### Pessoa falecida

```text
Era lembrada pelo cuidado com a família, pelo jeito acolhedor e pela presença marcante nas histórias compartilhadas. Sua trajetória preserva memórias de afeto, origem e convivência, mantendo viva a ligação com quem fez parte da sua vida.
```

## QA

1. Gerar texto com pessoa viva.
2. Gerar texto com pessoa falecida e tom diferente de `Nostálgico`.
3. Confirmar passado/terceira pessoa no memorial.
4. Confirmar limite 500.
5. Confirmar alvo 400–450 quando houver contexto suficiente.
6. Confirmar que texto não começa obrigatoriamente pelo nome.
7. Confirmar ausência de dados sensíveis.
8. Confirmar salvamento ao avançar em `/meus-vinculos`.
9. Confirmar persistência de `selected_badges`.
10. Confirmar badges no perfil público quando existirem.
11. Confirmar uso agregado em `/curiosidades`.
12. Confirmar que `lastGeneratedHash` não muda sem geração salva.

## Não regressão

- Não voltar para 300 caracteres.
- Não acoplar `Nostálgico` a pessoa falecida.
- Não reintroduzir etapas 9 e 10.
- Não salvar hash de geração sem geração salva.
- Não expor telefone/endereço/redes em prompts.
- Não tratar badge como fato biográfico se for apenas característica declarada.
