# Meus dados, IA, Mini Bio e Curiosidades

> Última revisão: 2026-07-03
> Escopo: `/meus-dados`, `/pessoa/:id`, textos de perfil, geração assistida por IA, mini bio, curiosidades individuais, questionário opcional `Sobre Mim` e perfis gerenciados.
> Status: canônico.

## Objetivo

Documentar o contrato dos textos curtos de perfil e da geração assistida por IA. Este documento absorve o conteúdo útil do antigo `CURIOSIDADES_E_IA.md` e registra o comportamento vigente do questionário opcional de `/meus-dados`.

## Ajustes de manutenção de 2026-07-03

- Este documento permanece canônico para textos individuais de perfil, mini bio, curiosidades individuais e geração assistida por IA.
- A página geral `/curiosidades` continua documentada separadamente em `CURIOSIDADES.md`.
- A IA deve ser tratada como assistente de redação, nunca como fonte de verdade genealógica.
- O questionário `Sobre Mim` é opcional no primeiro acesso e fora dele.
- Mini Bio e Curiosidades também são opcionais; a ausência desses campos não pode bloquear o fluxo.
- `Pular Tudo` deve levar à tela final de perfil/textos sem exigir característica selecionada.
- `Voltar ao questionário` deve retornar à primeira etapa do questionário, preservando a possibilidade de preenchimento posterior.
- Em perfis gerenciados, a geração por IA deve usar exclusivamente a pessoa ativa editável, não o usuário responsável autenticado.
- Mudanças em prompts, payloads, fallback de IA ou RLS de respostas de perfil devem atualizar também `api/ai.ts`, `QA_MANUAL.md`, `REGRAS_DE_NAO_REGRESSAO.md`, `GUIA_IMPLEMENTACOES.md`, `GUIA_COMPONENTES.md` e `operacao/MIGRATIONS_SUPABASE.md` quando afetarem operação.

## Separação entre perfil individual e página de curiosidades

- Este documento trata de textos individuais de pessoa e geração assistida por IA.
- A rota `/curiosidades` trata exploração familiar agregada, quiz, mural, gráficos e perguntas sobre a árvore.
- Contratos compartilhados de IA devem ser mantidos coerentes entre este documento, `CURIOSIDADES.md` e `api/ai.ts`.

## Campos de perfil

A aplicação trabalha com textos curtos associados à pessoa:

- `minibio`;
- `curiosidades`.

Quando gerados por IA, os textos devem ser curtos, revisáveis e compatíveis com exibição em cards, perfil público e telas internas.

Esses campos não são obrigatórios. O usuário pode:

- deixá-los vazios;
- preenchê-los manualmente;
- responder ao questionário e usar a IA como sugestão;
- editar ou descartar sugestões geradas.

## Fluxo em `/meus-dados`

A área `Sobre Mim` contém o questionário que pode alimentar a geração de textos de perfil.

Contrato atual:

- o questionário tem oito etapas de perguntas;
- a tela final aparece como etapa `Perfil`/`Etapa 9 de 9`;
- a tela final exibe campos editáveis de Mini Bio e Curiosidades;
- enquanto a IA gera os textos, deve haver estado de loading;
- o usuário pode editar Mini Bio e Curiosidades antes de confirmar;
- o botão `Pular Tudo` avança diretamente para a tela final de perfil/textos;
- `Pular Tudo` não pode exigir tom, badge, resposta ou característica;
- a mensagem `Selecione ao menos uma característica antes de continuar.` não pode aparecer ao pular o questionário ou confirmar dados pessoais;
- `Confirmar meus dados` só deve aparecer na tela final;
- Mini Bio e Curiosidades não devem aparecer como bloco de edição em `/meus-vinculos`;
- o botão `Voltar ao questionário` deve estar disponível na tela final;
- `Voltar ao questionário` deve esconder a tela final, voltar visualmente à etapa 1 e rolar para o início da seção `Sobre Mim`;
- a comunicação entre a tela final e o questionário usa o evento `meus-dados:questionnaire-reset`;
- a conclusão do questionário usa o evento `meus-dados:questionnaire-finished`.

## Comportamento opcional

O questionário e os textos de perfil são opcionais.

Regras:

- `saveProfileQuestionnaire` pode retornar `skipped: true` quando não houver insumo mínimo;
- `skipped: true` não é erro de validação;
- o salvamento de dados pessoais deve continuar mesmo com questionário vazio;
- Mini Bio e Curiosidades podem permanecer vazias;
- a geração/regeneração por IA só deve aparecer ou executar quando houver fonte suficiente;
- se o usuário tentar gerar IA sem fonte, a mensagem deve orientar a responder ao menos uma opção do questionário, sem bloquear a página inteira;
- erros reais de IA ou Supabase devem aparecer como feedback não bloqueante, preferencialmente `toast` ou mensagem contextual.

## Perfis gerenciados e pessoa ativa

Quando o usuário for responsável por outra pessoa, `/meus-dados` pode operar sobre a pessoa administrada.

Contrato:

- a pessoa ativa deve ser resolvida pela lista editável, não apenas por vínculo direto do usuário logado;
- `getCurrentUserEditablePeopleWithPessoa()` deve incluir pessoas com vínculo direto e pessoas sob responsabilidade quando permitido;
- `responsiblePerspective` deve ter prioridade sobre a pessoa principal do usuário quando houver perspectiva ativa;
- rascunhos locais devem ser segmentados por `user.id` e `pessoa.id`;
- `readQuestionnaireDraft`, `getProfileQuestionnaireAnswers`, `upsertProfileQuestionnaireAnswers`, `buildSafeProfileContext` e `updateOwnLinkedPerson` devem receber o `pessoa.id` da pessoa ativa;
- `profiles.nome_exibicao`, `auth.user.email`, `user_metadata` e outros dados do usuário autenticado não devem alimentar Mini Bio/Curiosidades;
- a IA deve usar dados da pessoa ativa: nome, nascimento, locais, profissão, relacionamentos, fatos, arquivos históricos e respostas do questionário da própria pessoa.

## Mobile em `/meus-dados`

Regras específicas de mobile:

- a área `Outros ajustes` não deve aparecer;
- o botão de foto deve usar o rótulo `Adicionar foto`, não `Cadastrar`;
- o toggle `Vivo/Falecido` deve ter largura compacta, sem espaço vazio excessivo após `Falecido`;
- os botões do questionário devem manter ícones visíveis e com contraste adequado;
- o botão `Voltar` do questionário deve exibir apenas ícone de seta para esquerda;
- o botão `Avançar` deve exibir apenas ícone de seta para direita;
- `Voltar`, `Pular Tudo` e `Avançar` devem ficar na mesma linha quando a largura permitir;
- a tela final deve manter campos legíveis e botão `Voltar ao questionário` acessível;
- ajustes mobile devem ser isolados por breakpoint e não alterar desktop.

## Layout desktop em `/meus-dados`

Regras complementares:

- `Dia ou Ano de Nascimento` deve manter largura compacta em desktop para preservar a hierarquia do formulário;
- quando a pessoa estiver marcada como falecida, `Local de falecimento` e `Falecimento no exterior` devem permanecer legíveis no mesmo grupo visual quando houver espaço;
- labels importantes não devem quebrar de forma a prejudicar leitura;
- ajustes atuais podem existir em runtime defensivo, mas o destino preferencial é o componente React de origem;
- mudanças visuais em desktop não podem alterar o contrato mobile do questionário e dos botões.

## Redes sociais

O editor de redes sociais deve tratar o perfil digitado como rascunho até confirmação explícita.

Não regressão:

- digitar uma única letra não pode converter automaticamente o campo em rede social salva;
- o usuário deve conseguir preencher perfil completo ou URL;
- salvar e recarregar deve preservar o valor completo.

## Geração por IA

`api/ai.ts` usa `purpose === "profile_text"` para gerar textos de perfil.

Payload funcional esperado:

- dados básicos da pessoa ativa;
- fatos familiares disponíveis da pessoa ativa;
- contexto textual limitado;
- tipo de texto solicitado;
- estilo escolhido no questionário quando disponível;
- características, respostas e perguntas geradas vinculadas ao `pessoa.id` ativo;
- modo memorial quando a pessoa ativa estiver marcada como falecida.

A IA não deve ser tratada como fonte de verdade. O usuário deve poder revisar, ajustar ou descartar o texto gerado.

## Mini bio

A mini bio deve:

- resumir a pessoa em linguagem natural;
- evitar extrapolações sem base nos dados existentes;
- ser adequada para perfil público e telas internas;
- manter tom respeitoso e familiar;
- respeitar limite de 500 caracteres quando gerada por IA;
- poder permanecer vazia sem bloquear o onboarding.

## Curiosidades individuais

As curiosidades individuais devem:

- destacar fatos de perfil, família, locais, datas ou relações;
- evitar inventar eventos;
- ser separadas das estatísticas gerais da página `/curiosidades`;
- respeitar limite de 500 caracteres quando geradas por IA;
- poder permanecer vazias sem bloquear o onboarding.

A página `/curiosidades` continua documentada em `funcionalidades/CURIOSIDADES.md`.

## Integrações relevantes

Conferir implementação em:

- `api/ai.ts`;
- `src/app/pages/MeusDados.tsx`;
- `src/app/pages/MeusDadosWithInlineProfileBio.tsx`;
- `src/app/services/memberProfileService.ts`;
- `src/app/services/responsiblePerspectiveService.ts`;
- `src/app/services/profileQuestionnaireService.ts`;
- `src/app/pages/curiosidades` quando aplicável;
- `src/app/services/personInsightsService` quando aplicável;
- componentes de perfil em `src/app/components`;
- policies de `person_profile_questionnaire_answers` quando houver edição de perfil gerenciado.

## Não regressão

Validar:

- geração de mini bio;
- geração de curiosidades individuais;
- edição manual em `/meus-dados`;
- exibição em `/pessoa/:id`;
- ausência de texto salvo automaticamente sem ação do usuário;
- tratamento de erro quando IA falhar;
- ausência dos campos de Mini Bio/Curiosidades em `/meus-vinculos`;
- presença da tela final `Perfil` ao concluir ou pular o questionário;
- ausência da mensagem `Selecione ao menos uma característica antes de continuar.` após `Pular Tudo`;
- possibilidade de confirmar dados pessoais sem questionário;
- possibilidade de deixar Mini Bio e Curiosidades vazias;
- botão `Voltar ao questionário` retornando à primeira etapa;
- IA de perfil gerenciado usando dados da pessoa gerenciada, não do responsável;
- ausência de erro RLS em `person_profile_questionnaire_answers` para pessoa sob responsabilidade;
- layout legível de nascimento e falecimento em desktop;
- ausência de regressão mobile ao ajustar campos de desktop.

## Regra de manutenção

Não recriar `CURIOSIDADES_E_IA.md`. Novas regras de IA para perfil devem ser registradas aqui; estatísticas e rankings familiares devem permanecer em `funcionalidades/CURIOSIDADES.md`.
