# Curiosidades e IA

> Última revisão: 2026-06-22

## Objetivo

Documentar o uso de IA para gerar textos e apoiar experiências familiares sem inventar fatos ou expor dados privados.

## Usos atuais

- Mini Bio.
- Curiosidades.
- Sugestões baseadas em questionário de perfil.

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
- fatos históricos textuais.

Desde que:

- estejam preenchidos;
- sejam seguros;
- não exponham dados privados;
- não sejam tratados como certeza quando forem inferência.

## Não regressão

- Não voltar para 300 caracteres.
- Não acoplar `Nostálgico` a pessoa falecida.
- Não reintroduzir etapas 9 e 10.
- Não salvar hash de geração sem geração salva.
