# Revisão de Dados

> Última revisão: 2026-06-22  
> Escopo: `/revisao-dados` após Prompts 7B, 7C e 7D.

## Objetivo

Permitir que o usuário revise as informações finais antes de concluir o onboarding e acessar o mapa familiar.

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

## Pets

Pets aparecem em grupo próprio.

Não devem ser misturados com Filhos.

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
- textos devem poder estar em modo memorial.

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
9. Finalizar fluxo.
