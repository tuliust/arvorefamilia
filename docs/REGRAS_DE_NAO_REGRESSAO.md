# Regras de não regressão

> Última revisão: 2026-06-23

## Onboarding

- Não exibir ações no header de `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias` e `/revisao-dados`.
- Não reintroduzir etapas 9 e 10 no questionário IA.
- Não exibir botão `Avançar` na última etapa do questionário IA.
- Não alterar o fluxo de pessoa falecida que pula `/preferencias`.
- Não reintroduzir botões duplicados em estados vazios.
- Não mover títulos principais para dentro de containers operacionais.

## IA / Mini Bio / Curiosidades

- Não voltar o limite para 300 caracteres.
- Manter limite de 500 caracteres por campo.
- Manter geração alvo de 400–450 caracteres por campo.
- Não exigir que o texto comece com o nome da pessoa.
- Não usar `Nostálgico` como gatilho automático de pessoa falecida.
- Memorial depende do toggle `Você está escrevendo o perfil de uma pessoa falecida?`.
- Pessoa falecida deve gerar texto em terceira pessoa e passado, com qualquer tom.
- Não enviar dados sensíveis para IA.
- Não salvar `lastGeneratedHash` sem geração efetivamente salva.
- Não expor telefone, endereço, WhatsApp, redes sociais, URLs, storage paths, signed URLs, tokens ou base64 no contexto de IA.

## Questionário de perfil e badges

- `selected_badges` deve continuar persistido em `person_profile_questionnaire_answers`.
- Badges devem continuar disponíveis para:
  - perfil individual;
  - `/curiosidades`;
  - comparação de interesses;
  - contexto seguro de IA.
- Não tratar ausência de badges como erro fatal; usar fallback textual quando necessário.
- Não exibir categorias vazias no perfil.

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
- Não bloquear criação de fato histórico quando não houver upload.

## Revisão de dados

- Pets em grupo próprio.
- Fatos/arquivos diferenciados como Fato sem arquivo, Imagem ou PDF.
- Header sem ações.
- Pessoa falecida não deve manter local atual/WhatsApp/notificações pessoais como se estivesse viva.

## Perfil `/pessoa/:id`

- Contato permitido deve continuar aparecendo no topo/área superior para pessoa viva.
- Pessoa falecida não deve ter contato pessoal destacado.
- Redes sociais versionadas devem ter prioridade sobre campos legacy.
- Fallback legacy deve continuar funcionando quando não houver rede versionada.
- Badges do questionário devem continuar agrupados no card `Sobre`.
- Não exibir dados privados se permissões estiverem desativadas.

## `/curiosidades`

- Cards principais devem permanecer com os textos:
  - `Pessoas`;
  - `Localização`;
  - `In memoriam`;
  - `Pets`;
  - `Casais`.
- `Localização` deve contar cidades atuais distintas.
- `In memoriam` deve contar pessoas falecidas.
- `Casais` deve usar relações de união/casamento ativas.
- `Nomes mais comuns` não deve voltar para `Nome mais repetido`.
- `Mês com mais aniversários` deve listar top 5 meses, não lista de nomes.
- `Perfil dos familiares` deve usar badges/estilo do `/meus-dados` quando disponíveis.
- `Principais cidades de nascimento` não deve voltar para singular.
- `Faixa Etária` deve usar idade/faixa etária, não gerações sociológicas.
- `Bodas` não deve somar anos após falecimento de um cônjuge.
- Dropdowns de interesses, astrologia e conexão devem iniciar em `Selecione`.
- Quiz deve manter opções controladas e não inventar respostas.

## Mapa familiar

- Dropdown fechado deve mostrar `Família de X`.
- Dropdown aberto deve mostrar `Visualize a árvore como...`.
- Opções do dropdown devem listar primeiro e segundo nome, não `Família de X`.
- Card `Cadastrados` baseado em `user_person_links`.
- Tour com Favoritos separado de IA/Calendário.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem manter gap e tipografia compactos no desktop.
- Botão de cônjuges deve alternar entre `Exibir` e `Ocultar`.
- Irmãos devem permitir 2 colunas no desktop.
- Irmãos devem preservar 1 coluna no mobile.
- Cônjuge e pets podem ser deslocados à direita no desktop.
- Não alterar scripts mobile sem frente explícita.
- Não alterar `index.html` sem justificativa específica.

## Fórum

- Barra de busca/filtros deve ocupar largura do container no desktop.
- Botão `Criar novo` deve alinhar com o container de tópicos recentes.
- Mobile não deve sofrer overflow por ajustes de desktop.

## Meus favoritos

- Barra de busca/filtros deve ocupar largura dos cards em desktop.
- Botão de filtros deve alinhar com o terceiro card em desktop.
- Mobile não deve sofrer overflow por ajustes de desktop.

## Notificações

- Dropdown do sino não deve cortar `Ver todas as notificações`.
- Rodapé deve continuar acessível em desktop e mobile.
- Não alterar rotas `/notificacoes` e `/ajustar-notificacoes`.

## Código, encoding e validação

- Rodar `git diff --check`.
- Rodar `npm run typecheck`.
- Rodar `npm run build`.
- Testar rota alterada em navegador.
- Conferir `git status --short` antes de commit.
- Manter arquivos alterados em UTF-8.
- Corrigir qualquer mojibake visível (`FamÃ­lia`, `cÃ´njuges`, `Ãrvore`, etc.).
