# Regras de não regressão

> Última revisão: 2026-06-27
> Escopo: contratos que não devem ser quebrados em novas alterações.
> Status: canônico.

## Escopo de alteração documental

- Alterações documentais finais devem ficar restritas a `docs/`.
- Não alterar `src/`, `api/`, `supabase/`, `package.json`, `vite.config`, `index.html` ou arquivos fora de `docs/` em frentes exclusivamente documentais.

## Rotas

- `/` deve continuar redirecionando para `/mapa-familiar`.
- `/mapa-familiar` e `/mapa-familiar-horizontal` devem continuar compartilhando a shell `Home`.
- `/pessoa/:id` e `/pessoas/:id` devem continuar apontando para `PersonProfile`.
- Rotas administrativas, exceto `/admin/login`, devem continuar protegidas por `ProtectedRoute`.

## Mapa familiar

- A alternância entre mapa familiar e linha geracional deve preservar query string.
- A pessoa de referência não pode ser perdida ao trocar de rota.
- Filtros de parentes diretos devem persistir por usuário.
- Mobile não deve herdar layout desktop de painel fixo.
- Exportação não pode ser removida do painel desktop sem substituto documentado.
- O cabeçalho do painel desktop deve manter título, ícone e ação de recolher na mesma linha.
- Cards do painel desktop devem preservar legibilidade e não podem cortar labels ou botões de exportação.
- Em `/mapa-familiar` desktop, os alinhamentos de grupos inferiores devem preservar pai e mãe como referências visuais.
- A ordenação visual de cards deve evitar linhas extras quando houver espaço para singles e pares conjugais.

## Dados

- Pets devem permanecer distinguíveis de pessoas humanas.
- Falecidos devem ser tratados por `falecido` ou por campos de falecimento conforme normalização.
- Campos de privacidade não devem ser expostos indevidamente no perfil.
- Alterações de vínculos que dependem de aprovação não devem ser documentadas como gravação direta.

## Status conjugal

- Não duplicar lógica de status conjugal fora de `src/app/utils/conjugalRelationshipStatus.ts`.
- Árvore, modal, perfil e admin devem consumir o helper compartilhado.
- Separação registrada deve prevalecer sobre união ativa.
- Viuvez e união histórica devem depender dos dados de falecimento das pessoas.
- Não criar coluna persistida de status conjugal sem decisão explícita de schema.
- A legenda da árvore deve diferenciar status por símbolo e padrão de linha, não apenas por cor.
- O perfil deve manter vínculos conjugais agrupados em relacionamento atual, relacionamentos anteriores e uniões históricas.
- O admin deve bloquear combinações contraditórias entre relacionamento ativo e dados de separação.

## Curiosidades

- Seletores Radix não podem receber item com `value` vazio.
- Seleções dependentes de usuário devem iniciar neutras quando o fluxo exigir escolha explícita.
- A falta da RPC `get_person_profile_selected_badges` não deve impedir o carregamento da página.
- Badges de status devem preservar texto em uma linha.
- Bodas devem respeitar apenas marcos exatos permitidos para casais ativos e sem separação registrada.
- Marcadores `+N` em gerações devem ser acionáveis quando houver pessoas ocultas.
- O quiz deve preservar até cinco perguntas por rodada, feedback animado na área das opções e resultado final consolidado.
- O menu do avatar não deve ficar atrás da navegação sticky ou dos botões superiores de `/curiosidades`.

## Calendário familiar

- Eventos de casamento devem manter títulos curtos, sem prefixo `Data de casamento de` na exibição visual.
- Casamentos devem usar primeiro e segundo nome de cada pessoa quando possível.
- Memórias devem exibir primeiro e segundo nome da pessoa quando possível.
- O card `Casamentos` deve permanecer abaixo de `Aniversariantes` quando houver dados no mês.

## Fórum e notificações

- A busca do fórum em desktop deve manter alinhamento à esquerda com `Categorias` e ação à direita com `Criar novo`.
- `/forum/topico/:id` deve preservar largura compatível com `/forum` no desktop, com coluna lateral de tópicos recentes quando aplicável.
- Reações devem aparecer apenas no tópico principal em `/forum/topico/:id`, não nas respostas.
- Menções digitadas em `/forum/novo` não podem quebrar o valor real do campo de conteúdo.
- O botão desktop de notificações deve abrir dropdown sem redirecionar diretamente.
- O rodapé do dropdown de notificações deve manter `Ver todas` e `Preferências` com larguras equivalentes e sem quebra.

## Administração

- O header das rotas `/admin/*` deve exibir apenas `Painel Administrativo`, `Principal` e menu do usuário.
- O botão `Principal` no header administrativo não deve exibir seta.
- `/admin/atividades` não deve apagar registros do banco ao acionar `Limpar`; a limpeza é visual/local.
- `/admin/atividades` deve usar label `Autor` no filtro de ator.
- `/admin/gestao-conteudo-pessoas` deve manter acentuação correta em UTF-8.

## IA

- `api/ai.ts` não deve inventar fatos fora do contexto enviado.
- `profile_text` deve retornar JSON válido com `minibio` e `curiosidades`.
- Cada campo de texto gerado deve respeitar limite de 500 caracteres.
- Modo memorial depende de `memorialMode === true`.

## Documentação

- Todo documento canônico deve manter título, última revisão, escopo e status.
- Histórico não substitui contrato canônico.
- `docs/README.md` deve ser atualizado em qualquer criação, remoção ou renomeação de documento canônico.
- Não inserir mojibake em `docs/`.
