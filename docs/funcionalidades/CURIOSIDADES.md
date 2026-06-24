# Curiosidades

> Última revisão: 2026-06-23
> Escopo: `/curiosidades`, estatísticas familiares, rankings, comparações, badges, bodas e exploração dos dados da árvore.
> Status: canônico.

## Objetivo

Transformar os dados da árvore em exploração visual e textual: pessoas, locais, pets, memórias, casais, aniversários, perfis, gerações e padrões familiares.

Este documento cobre a página geral `/curiosidades`. Textos individuais de perfil e geração assistida por IA ficam em `MINI_BIO_CURIOSIDADES_IA.md`.

## Dados usados

A página depende principalmente de:

- pessoas;
- relacionamentos;
- datas de nascimento, casamento e falecimento;
- locais de nascimento, falecimento e local atual;
- profissão;
- indicador humano/pet;
- campos de perfil;
- arquivos e fatos históricos quando disponíveis;
- badges selecionadas do questionário de perfil, com fallback quando a RPC de leitura não estiver disponível no ambiente remoto.

## Tipos de curiosidade

A página pode apresentar rankings, agrupamentos por local, aniversários, estatísticas de longevidade, perfis com campos preenchidos, pets, vínculos, gerações sociais, bodas e descobertas orientadas por pessoa e tópicos.

## Regras de exibição

- Não inventar fatos ausentes no banco.
- Distinguir dado vazio de dado desconhecido.
- Não misturar pessoa humana e pet em rankings que exijam semântica humana.
- Usar badges e cards de forma consistente com `GUIA_UX_LAYOUT.md`.
- Dropdowns que dependem de escolha do usuário devem iniciar neutros.
- O fluxo “Descubra mais sobre...” deve iniciar com `Selecione` e não pode quebrar sem pessoa selecionada.
- Badges de status devem manter texto em uma linha.
- Marcadores `+N` em gerações devem permitir revelar as pessoas restantes.

## Bodas

Exibir somente casais ativos, sem separação registrada e sem data de falecimento em nenhuma das duas pessoas do casal.

Marcos permitidos: 1 ano Papel; 5 anos Madeira; 10 anos Estanho; 15 anos Cristal; 20 anos Porcelana; 25 anos Prata; 30 anos Pérola; 40 anos Esmeralda; 45 anos Rubi; 50 anos Ouro; 60 anos Diamante; 75 anos Brilhante.

Não exibir boda por aproximação. O número de anos precisa corresponder exatamente a um dos marcos permitidos.

## Relação com IA

A IA pode apoiar textos de perfil, mas a página de curiosidades deve priorizar dados estruturados. O contrato de IA fica centralizado em `MINI_BIO_CURIOSIDADES_IA.md`.

## Não regressão

Validar:

- carregamento com dados completos;
- carregamento com dados incompletos;
- ausência de quebra quando não houver data ou local;
- cards responsivos;
- seletor de conexão entre pessoas sem SelectItem vazio;
- fallback da RPC de badges sem impedir a página;
- descoberta sem erro quando nenhuma pessoa estiver selecionada;
- expansão de `+N` nas gerações;
- regras de bodas listadas neste documento;
- rankings sem duplicidade;
- consistência com favoritos, pessoa pública e arquivos históricos quando houver ligação.

## Regra de manutenção

Não criar documentos paralelos para estatísticas familiares. Novos blocos de curiosidade devem ser documentados aqui e refletidos em `QA_MANUAL.md` quando exigirem teste manual específico.
