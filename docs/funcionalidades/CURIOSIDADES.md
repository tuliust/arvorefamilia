# Curiosidades

> Última revisão: 2026-06-23
> Escopo: `/curiosidades`, estatísticas familiares, rankings, comparações e uso de badges.
> Status: canônico.

## Objetivo

Transformar os dados da árvore em exploração visual e textual: pessoas, locais, pets, memórias, casais, aniversários, perfis e padrões familiares.

## Dados usados

A página depende principalmente de:

- pessoas;
- relacionamentos;
- datas de nascimento e falecimento;
- locais de nascimento, falecimento e local atual;
- profissão;
- indicador humano/pet;
- vínculos e badges de perfil quando disponíveis;
- fatos históricos quando integrados ao contexto.

## Cards principais

A documentação canônica considera estes agrupamentos funcionais:

- Pessoas;
- Localização;
- In memoriam;
- Pets;
- Casais.

## Rankings e análises

- Nomes mais comuns.
- Meses com mais aniversários.
- Perfil dos familiares com base em badges quando disponíveis.
- Cidades de nascimento mais recorrentes.
- Faixas etárias.
- Bodas e duração de casais, considerando falecimento quando aplicável.

## Interações

- Dropdowns dependentes de seleção iniciam em estado neutro.
- Quiz familiar usa dados reais disponíveis.
- Comparações de interesses devem usar badges ou características salvas, sem inventar informações.

## Não regressão

- Não reintroduzir modal antigo como experiência principal se a rota `/curiosidades` estiver ativa.
- Não usar geração sociológica como substituto de faixa etária se a página implementada estiver usando faixa etária.
- Não misturar pets em contagens de pessoas humanas.
