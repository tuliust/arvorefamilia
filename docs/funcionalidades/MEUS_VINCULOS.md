# Meus vínculos

> Última revisão: 2026-06-27
> Escopo: `/meus-vinculos`, vínculos familiares, pets, responsáveis por edição familiar e solicitações de alteração.
> Status: canônico.

## Objetivo

Permitir que o membro revise e complemente seus vínculos familiares, diferencie pessoas humanas de pets e encaminhe alterações para revisão quando a regra exigir aprovação.

## Estrutura da página

A página deve concentrar os grupos de vínculo sem cabeçalho redundante de pessoa. A área superior com avatar, título `Familiares de X` e texto explicativo longo não faz parte do contrato atual.

Grupos funcionais:

- Pais;
- Cônjuges;
- Filhos;
- Irmãos;
- Pets.

No mobile, os atalhos de grupos devem ficar compactos, na mesma linha/grade, sem subtítulo, preservando distância visual dos botões principais `Dados`, `Vínculos` e `Fatos e Arquivos`.

## Contratos gerais

- Pets são grupo próprio.
- Pessoa humana não deve aparecer como pet.
- Pet usa `humano_ou_pet: 'Pet'` quando criado pelo fluxo.
- Badge `Cadastrado` depende de vínculo real em `user_person_links`.
- Pessoa sem vínculo de usuário aparece como pré-cadastrada quando o fluxo assim indicar.
- Alterações que dependem de aprovação devem ser registradas como solicitação, não como gravação definitiva direta.
- Parentes adicionados ou removidos no fluxo devem ficar marcados como pendentes ou `Em análise` até revisão.

## Pais

- A seção de pais deve permitir confirmar pai e mãe cadastrados.
- No desktop, pai e mãe podem ficar lado a lado quando houver espaço.
- Contadores redundantes como `2 vínculos` não devem ser exibidos no corpo do título quando não agregarem informação.
- Cards devem diferenciar pessoa cadastrada, pré-cadastrada, viva ou falecida por badges legíveis.

## Cônjuges

- A seção `Cônjuges` deve aparecer antes de `Filhos`.
- Cônjuges ativos devem respeitar a regra de no máximo um relacionamento ativo no estado local.
- Ao abrir o modal mobile de adicionar cônjuge, o teclado do navegador não deve abrir automaticamente antes de ação explícita do usuário no campo.

## Filhos

- A seção `Filhos` depende do contexto conjugal quando o fluxo pedir o outro pai/mãe.
- Quando não houver cônjuge cadastrado, o fluxo deve exibir a mensagem: `Cadastre inicialmente um cônjuge na seção anterior.`
- O seletor do outro responsável deve usar o rótulo `Mãe do filho(a)` quando estiver pedindo a mãe.
- O seletor deve listar as pessoas válidas do contexto esperado, sem travar a página mobile.
- Filhos adicionados ou removidos devem aparecer como `Em análise` até aprovação.

## Irmãos

- Irmãos adicionados ou removidos devem aparecer como `Em análise` até aprovação.
- A revisão deve preservar o mesmo tratamento visual de pendência usado para filhos, cônjuges e demais parentes.

## Pets

- A página deve manter apenas a seção `Pets`; a área separada `Cadastro e edição de pets` não deve aparecer como bloco permanente.
- Ao clicar em `Adicionar pet`, abrir modal próprio para cadastro.
- O modal de pet deve usar campos específicos:
  - nome;
  - data de nascimento;
  - raça;
  - local de nascimento;
  - data de falecimento quando marcado como falecido;
  - upload de foto.
- Pets não devem ser tratados como filhos humanos.

## Mobile

- Botão de apagar/lixeira deve ficar na área superior direita do card.
- Badges como `Pré-cadastrado`, `Vivo`, `Falecido` e `Falecida` devem usar formatação consistente e, quando possível, ficar na mesma linha.
- Modais de adicionar parentes não devem abrir teclado automaticamente antes de foco explícito no campo.
- Ajustes mobile devem ser isolados por breakpoint/rota e não alterar comportamento desktop.
- Manipulações defensivas de DOM não podem recriar opções de select repetidamente a ponto de travar a página.

## Relação com outras rotas

- Vem após `/meus-dados`.
- Encaminha para `/arquivos-historicos`.
- Participa da revisão em `/revisao-dados`.
- Afeta o perfil em `/pessoa/:id`, estatísticas em `/curiosidades` e visualizações em `/mapa-familiar`.

## QA mínimo

- Criar ou selecionar vínculo humano.
- Criar ou selecionar pet.
- Verificar badges de cadastrado/pré-cadastrado/vivo/falecido.
- Confirmar que cônjuges aparecem antes de filhos.
- Confirmar que filhos exigem contexto conjugal quando a regra estiver ativa.
- Confirmar que pets abrem modal próprio e não aparecem como filhos.
- Confirmar que alterações pendentes são exibidas como `Em análise`.
- Confirmar que a seleção de filho, cônjuge, irmão ou pet não trava o mobile.
