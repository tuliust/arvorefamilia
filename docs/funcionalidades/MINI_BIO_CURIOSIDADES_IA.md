# Meus dados, IA, Mini Bio e Curiosidades

> Última revisão: 2026-06-23  
> Escopo: `/meus-dados`, `/pessoa/:id`, textos de perfil, geração assistida por IA, mini bio e curiosidades individuais.  
> Status: canônico.

## Objetivo

Documentar o contrato dos textos curtos de perfil e da geração assistida por IA. Este documento absorve o conteúdo útil do antigo `CURIOSIDADES_E_IA.md`.

## Campos de perfil

A aplicação trabalha com textos curtos associados à pessoa:

- `minibio`;
- `curiosidades`.

Quando gerados por IA, os textos devem ser curtos, revisáveis e compatíveis com exibição em cards, perfil público e telas internas.

## Geração por IA

`api/ai.ts` usa `purpose === "profile_text"` para gerar textos de perfil.

Payload funcional esperado:

- dados básicos da pessoa;
- fatos familiares disponíveis;
- contexto textual limitado;
- tipo de texto solicitado.

A IA não deve ser tratada como fonte de verdade. O usuário deve poder revisar, ajustar ou descartar o texto gerado.

## Mini bio

A mini bio deve:

- resumir a pessoa em linguagem natural;
- evitar extrapolações sem base nos dados existentes;
- ser adequada para perfil público e telas internas;
- manter tom respeitoso e familiar.

## Curiosidades individuais

As curiosidades individuais devem:

- destacar fatos de perfil, família, locais, datas ou relações;
- evitar inventar eventos;
- ser separadas das estatísticas gerais da página `/curiosidades`.

A página `/curiosidades` continua documentada em `funcionalidades/CURIOSIDADES.md`.

## Integrações relevantes

Conferir implementação em:

- `api/ai.ts`;
- `src/app/pages/MeusDados` quando aplicável;
- `src/app/pages/curiosidades`;
- `src/app/services/personInsightsService` quando aplicável;
- componentes de perfil em `src/app/components`.

## Não regressão

Validar:

- geração de mini bio;
- geração de curiosidades individuais;
- edição manual em `/meus-dados`;
- exibição em `/pessoa/:id`;
- ausência de texto salvo automaticamente sem ação do usuário;
- tratamento de erro quando IA falhar.

## Regra de manutenção

Não recriar `CURIOSIDADES_E_IA.md`. Novas regras de IA para perfil devem ser registradas aqui; estatísticas e rankings familiares devem permanecer em `funcionalidades/CURIOSIDADES.md`.
