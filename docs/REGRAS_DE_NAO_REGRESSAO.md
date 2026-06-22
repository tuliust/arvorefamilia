# Regras de não regressão

> Última revisão: 2026-06-22

## Onboarding

- Não exibir ações no header de `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` e `/revisao-dados`.
- Não reintroduzir etapas 9 e 10 no questionário IA.
- Não exibir botão `Avançar` na última etapa do questionário IA.
- Não alterar o fluxo de pessoa falecida que pula `/preferencias`.

## IA / Mini Bio / Curiosidades

- Não voltar o limite para 300 caracteres.
- Manter limite de 500 caracteres por campo.
- Manter geração alvo de 400–450 caracteres por campo.
- Não exigir que o texto comece com o nome da pessoa.
- Não usar `Nostálgico` como gatilho automático de pessoa falecida.
- Memorial depende do toggle `Você está escrevendo o perfil de uma pessoa falecida?`.
- Pessoa falecida deve gerar texto em terceira pessoa e passado, com qualquer tom.
- Não enviar dados sensíveis para IA.

## Vínculos

- Pets não podem aparecer como Filhos.
- Filhos humanos não podem aparecer como Pets.
- Cônjuges devem ter no máximo um vínculo ativo no estado local.
- Alterações de vínculo devem seguir como solicitação pendente.
- Badge `Cadastrado` depende de `user_person_links`.
- Mulher irmã deve aparecer como `Irmã`, não `Irmão(a)`.
- Não duplicar botão de adicionar em estado vazio.

## Fatos e arquivos históricos

- Upload deve continuar opcional.
- Fato sem arquivo deve continuar válido.
- `arquivos_historicos.url` pode ser nulo/vazio.
- Fato sem arquivo aparece como `Fato` na timeline.
- Arquivo com anexo aparece como `Arquivo`.
- Não expor URL/storage path/base64 em metadata da timeline.

## Revisão de dados

- Pets em grupo próprio.
- Fatos/arquivos diferenciados como Fato sem arquivo, Imagem ou PDF.
- Header sem ações.

## Mapa familiar

- Dropdown `Família de X`.
- Card `Cadastrados` baseado em `user_person_links`.
- Tour com Favoritos separado de IA/Calendário.
- Não alterar scripts mobile sem frente explícita.
- Não alterar `index.html` sem justificativa específica.

## Código e validação

- Rodar `git diff --check`.
- Rodar `npm run build`.
- Preferir `npx tsc --noEmit`.
- Testar rota alterada em navegador.
- Conferir `git status --short` antes de commit.
