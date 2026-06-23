# Meus vínculos

> Última revisão: 2026-06-23
> Escopo: `/meus-vinculos`, vínculos familiares, pets, textos de perfil e solicitações de alteração.
> Status: canônico.

## Objetivo

Permitir que o membro revise e complemente seus vínculos familiares, diferencie pessoas humanas de pets e mantenha textos de perfil quando aplicável.

## Contratos

- Pets são grupo próprio.
- Pessoa humana não deve aparecer como pet.
- Pet usa `humano_ou_pet: 'Pet'` quando criado pelo fluxo.
- Badge `Cadastrado` depende de vínculo real em `user_person_links`.
- Pessoa sem vínculo de usuário aparece como pré-cadastrada quando o fluxo assim indicar.
- Cônjuges ativos devem respeitar a regra de no máximo um relacionamento ativo no estado local.
- Alterações que dependem de aprovação devem ser registradas como solicitação, não como gravação definitiva direta.

## Textos de perfil

- Mini Bio e Curiosidades são tratados como textos do perfil.
- O bloco de textos fica separado dos grupos de vínculos.
- O salvamento ocorre no avanço do fluxo quando implementado; não documentar botão inexistente.

## Relação com outras rotas

- Vem após `/meus-dados`.
- Encaminha para `/arquivos-historicos`.
- Participa da revisão em `/revisao-dados`.
- Afeta o perfil em `/pessoa/:id` e estatísticas em `/curiosidades`.

## QA mínimo

- Criar ou selecionar vínculo humano.
- Criar ou selecionar pet.
- Verificar badges de cadastrado/pré-cadastrado.
- Avançar fluxo sem perder textos de perfil.
- Confirmar que alterações pendentes são exibidas como pendentes quando essa regra se aplica.
