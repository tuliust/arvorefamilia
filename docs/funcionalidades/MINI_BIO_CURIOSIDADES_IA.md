# Meus dados, IA, Mini Bio e Curiosidades

> Última revisão: 2026-06-27  
> Escopo: `/meus-dados`, `/pessoa/:id`, textos de perfil, geração assistida por IA, mini bio e curiosidades individuais.  
> Status: canônico.

## Objetivo

Documentar o contrato dos textos curtos de perfil e da geração assistida por IA. Este documento absorve o conteúdo útil do antigo `CURIOSIDADES_E_IA.md`.

## Campos de perfil

A aplicação trabalha com textos curtos associados à pessoa:

- `minibio`;
- `curiosidades`.

Quando gerados por IA, os textos devem ser curtos, revisáveis e compatíveis com exibição em cards, perfil público e telas internas.

## Fluxo em `/meus-dados`

A área `Sobre Mim` contém o questionário que alimenta a geração de textos de perfil.

Contrato atual:

- o questionário tem oito etapas de perguntas;
- ao fim das oito etapas, os campos de Mini Bio e Curiosidades aparecem dentro da mesma área `Sobre Mim`, como tela final do fluxo;
- a tela final deve usar o título `Seu Perfil`;
- enquanto a IA gera os textos, deve haver estado de loading;
- o usuário pode editar Mini Bio e Curiosidades antes de confirmar;
- o botão `Pular Tudo` avança diretamente para a tela final de perfil/textos;
- `Confirmar meus dados` só deve aparecer na tela final;
- Mini Bio e Curiosidades não devem aparecer como bloco de edição em `/meus-vinculos`.

## Mobile em `/meus-dados`

Regras específicas de mobile:

- a área `Outros ajustes` não deve aparecer;
- o botão de foto deve usar o rótulo `Adicionar foto`, não `Cadastrar`;
- o toggle `Vivo/Falecido` deve ter largura compacta, sem espaço vazio excessivo após `Falecido`;
- os botões do questionário devem manter ícones visíveis e com contraste adequado;
- o botão `Voltar` do questionário deve exibir apenas ícone de seta para esquerda;
- o botão `Avançar` deve exibir apenas ícone de seta para direita;
- `Voltar`, `Pular Tudo` e `Avançar` devem ficar na mesma linha;
- ajustes mobile devem ser isolados por breakpoint e não alterar desktop.

## Redes sociais

O editor de redes sociais deve tratar o perfil digitado como rascunho até confirmação explícita.

Não regressão:

- digitar uma única letra não pode converter automaticamente o campo em rede social salva;
- o usuário deve conseguir preencher perfil completo ou URL;
- salvar e recarregar deve preservar o valor completo.

## Geração por IA

`api/ai.ts` usa `purpose === "profile_text"` para gerar textos de perfil.

Payload funcional esperado:

- dados básicos da pessoa;
- fatos familiares disponíveis;
- contexto textual limitado;
- tipo de texto solicitado;
- estilo escolhido no questionário quando disponível.

A IA não deve ser tratada como fonte de verdade. O usuário deve poder revisar, ajustar ou descartar o texto gerado.

## Mini bio

A mini bio deve:

- resumir a pessoa em linguagem natural;
- evitar extrapolações sem base nos dados existentes;
- ser adequada para perfil público e telas internas;
- manter tom respeitoso e familiar;
- respeitar limite de 500 caracteres quando gerada por IA.

## Curiosidades individuais

As curiosidades individuais devem:

- destacar fatos de perfil, família, locais, datas ou relações;
- evitar inventar eventos;
- ser separadas das estatísticas gerais da página `/curiosidades`;
- respeitar limite de 500 caracteres quando geradas por IA.

A página `/curiosidades` continua documentada em `funcionalidades/CURIOSIDADES.md`.

## Integrações relevantes

Conferir implementação em:

- `api/ai.ts`;
- `src/app/pages/MeusDadosWithInlineProfileBio`;
- `src/app/pages/curiosidades` quando aplicável;
- `src/app/services/personInsightsService` quando aplicável;
- componentes de perfil em `src/app/components`.

## Não regressão

Validar:

- geração de mini bio;
- geração de curiosidades individuais;
- edição manual em `/meus-dados`;
- exibição em `/pessoa/:id`;
- ausência de texto salvo automaticamente sem ação do usuário;
- tratamento de erro quando IA falhar;
- ausência dos campos de Mini Bio/Curiosidades em `/meus-vinculos`;
- presença da tela final `Seu Perfil` ao concluir ou pular o questionário.

## Regra de manutenção

Não recriar `CURIOSIDADES_E_IA.md`. Novas regras de IA para perfil devem ser registradas aqui; estatísticas e rankings familiares devem permanecer em `funcionalidades/CURIOSIDADES.md`.
