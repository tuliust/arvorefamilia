# Revisão de Dados

> Última revisão: 2026-06-23  
> Escopo: `/revisao-dados` após Prompts 7B, 7C, 7D e integrações posteriores com pets, IA e reset de perfil.

## Objetivo

Permitir que o usuário revise as informações finais antes de concluir o onboarding e acessar o mapa familiar.

A tela deve consolidar dados pessoais, textos, privacidade, vínculos, pets e registros históricos, sem bloquear seções não relacionadas quando apenas uma parte precisar de correção.

## Header

Não exibe ações no header.

Exibe apenas:

- ícone;
- título;
- subtítulo.

## Seções revisadas

- Dados pessoais.
- História / Mini Bio / Curiosidades.
- Contato.
- Privacidade.
- Vínculos familiares.
- Pets.
- Fatos e arquivos históricos.

## Dados pessoais

Validar:

- nome;
- data de nascimento;
- local de nascimento;
- data de falecimento, quando aplicável;
- local de falecimento, quando aplicável;
- profissão;
- local atual, apenas para pessoa viva.

## Pets

Pets aparecem em grupo próprio.

Não devem ser misturados com Filhos.

### Regra

Pet é pessoa com:

```text
humano_ou_pet = 'Pet'
```

## Fatos e Arquivos Históricos

A seção diferencia:

- `Fato sem arquivo`;
- `Imagem`;
- `PDF`.

Fatos sem arquivo são registros válidos.

## Edição inline

Seções editáveis usam controles locais de edição/salvamento.

A validação deve impedir dados pessoais inválidos sem bloquear seções não relacionadas.

## Pessoa falecida

Para pessoa falecida:

- local atual deve ser limpo/desconsiderado quando aplicável;
- WhatsApp/notificações pessoais não devem ser habilitados;
- textos devem poder estar em modo memorial;
- privacidades relacionadas a contato devem ser tratadas com cautela;
- o perfil pode manter dados históricos, mas não dados de contato operacional.

## Mini Bio e Curiosidades

A seção deve respeitar:

- limite de 500 caracteres;
- textos editáveis;
- modo memorial quando aplicável;
- ausência de dados sensíveis;
- salvamento coerente com fluxo de onboarding.

## Questionário IA

A revisão pode refletir dados derivados de `/meus-dados`, mas não deve exigir que o usuário veja internamente todos os campos técnicos.

Dados do questionário podem alimentar:

- Mini Bio;
- Curiosidades;
- badges;
- experiências agregadas em `/curiosidades`.

## Reset administrativo relacionado

O reset de perfil deve limpar dados personalizáveis e vínculos de usuário quando acionado pela área administrativa, incluindo:

- foto;
- Mini Bio;
- Curiosidades;
- contato;
- endereço;
- redes sociais;
- eventos pessoais;
- arquivos históricos;
- respostas do questionário;
- favoritos relacionados;
- preferências de notificação;
- vínculos de usuário, quando aplicável.

A revisão de dados não executa reset, mas deve continuar compatível com perfis resetados.

## Conclusão

Ao finalizar:

- dados confirmados devem ser marcados quando aplicável;
- o usuário segue para `/mapa-familiar`.

## QA

1. Acessar `/revisao-dados` como pessoa viva.
2. Acessar `/revisao-dados` como pessoa falecida.
3. Conferir header sem ações.
4. Conferir pets separados.
5. Conferir fatos sem arquivo.
6. Conferir imagem/PDF.
7. Editar seção pessoal.
8. Salvar seção.
9. Confirmar Mini Bio/Curiosidades com limite de 500 caracteres.
10. Confirmar que pessoa falecida não mantém local atual indevido.
11. Confirmar que WhatsApp/notificações pessoais não ficam habilitados para falecido.
12. Finalizar fluxo e ir para `/mapa-familiar`.

## Não regressão

- Não misturar pets com filhos.
- Não remover fatos sem arquivo.
- Não exibir ações no header.
- Não bloquear toda a revisão por erro em seção isolada.
- Não reintroduzir dados de contato operacional para pessoa falecida.
