# Curiosidades

> Última revisão: 2026-06-23
> Escopo: `/curiosidades`, estatísticas familiares, rankings, comparações, badges e exploração dos dados da árvore.
> Status: canônico.

## Objetivo

Transformar os dados da árvore em exploração visual e textual: pessoas, locais, pets, memórias, casais, aniversários, perfis e padrões familiares.

Este documento cobre a página geral `/curiosidades`. Textos individuais de perfil e geração assistida por IA ficam em `MINI_BIO_CURIOSIDADES_IA.md`.

## Dados usados

A página depende principalmente de:

- pessoas;
- relacionamentos;
- datas de nascimento e falecimento;
- locais de nascimento, falecimento e local atual;
- profissão;
- indicador humano/pet;
- campos de perfil;
- arquivos e fatos históricos quando disponíveis;
- badges selecionadas do questionário de perfil, com fallback quando a RPC de leitura não estiver disponível no ambiente remoto.

## Tipos de curiosidade

A página pode apresentar:

- rankings familiares;
- agrupamentos por local;
- destaques de aniversários e datas;
- estatísticas de longevidade;
- perfis com campos preenchidos;
- distribuição de pets;
- contagens de vínculos;
- fatos derivados de arquivos históricos.

## Regras de exibição

- Não inventar fatos ausentes no banco.
- Distinguir dado vazio de dado desconhecido.
- Não misturar pessoa humana e pet em rankings que exijam semântica humana.
- Usar badges e cards de forma consistente com `GUIA_UX_LAYOUT.md`.
- Não duplicar textos de mini bio como se fossem estatísticas gerais.

## Relação com IA

A IA pode apoiar textos de perfil, mas a página de curiosidades deve priorizar dados estruturados. O contrato de IA fica centralizado em `MINI_BIO_CURIOSIDADES_IA.md`.

## Não regressão

Validar:

- carregamento com dados completos;
- carregamento com dados incompletos;
- ausência de quebra quando não houver data ou local;
- cards responsivos;
- seletor de conexão entre pessoas não deve quebrar por SelectItem com valor vazio;
- ausência da RPC de badges deve usar fallback sem rajada contínua de 404;
- rankings sem duplicidade;
- consistência com favoritos, pessoa pública e arquivos históricos quando houver ligação.

## Regra de manutenção

Não criar documentos paralelos para estatísticas familiares. Novos blocos de curiosidade devem ser documentados aqui e refletidos em `QA_MANUAL.md` quando exigirem teste manual específico.
