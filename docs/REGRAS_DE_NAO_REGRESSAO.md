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
- `/linha-geracional` deve permanecer rota própria de membro para experiência geracional mobile.
- `/pessoa/:id` e `/pessoas/:id` devem continuar apontando para `PersonProfile`.
- `/aprovacoes` e `/admin/aprovacoes` devem permanecer protegidas por `ProtectedRoute`.
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
- No mobile, o header deve exibir `Árvore Familiar`, não `Família de X`.
- O painel do botão `+` deve ficar acima de todos os demais elementos da página.
- O painel mobile deve reconhecer pais, filhos, cônjuges, irmãos, pets, avós, tios, primos e sobrinhos a partir dos dados reais da árvore.
- Itens de familiares no painel mobile devem exibir primeiro e segundo nome completos.
- Não permitir arrasto vertical para regiões sem conteúdo abaixo da tela central.
- Não permitir arrasto para primos quando não houver primos abaixo de tios.
- Não exibir linha vertical abaixo de tios quando não houver primos no lado correspondente.

## Linha geracional mobile

- `/linha-geracional` deve preservar o título `Árvore Familiar` no header mobile.
- Cabeçalhos `Geração N` não podem ficar colados à toolbar ou ao topo da área rolável.
- Gerações vazias não devem aparecer como tela inicial quando houver gerações posteriores com conteúdo.
- Cards de cônjuges devem ficar empilhados quando necessário.
- Linhas laterais devem conectar apenas relações reais, não todos os cards da geração.
- Mudanças na linha geracional mobile não devem alterar o layout desktop de `/mapa-familiar-horizontal`.

## Overlays mobile de header

- Dropdown de notificações deve aparecer acima de header, toolbar, canvas, painéis e conteúdo.
- Sugestões de busca devem aparecer acima de header, toolbar, canvas, painéis e conteúdo.
- Menu de avatar deve aparecer acima de elementos sticky e não deve exigir scroll vertical excessivo para mostrar ações essenciais.
- Nenhum ajuste de `z-index` mobile deve afetar desktop.

## Feedback, confirmação e diálogos

- Não usar `window.alert`, `alert`, `window.confirm`, `confirm`, `window.prompt` ou `prompt` em `src/`.
- Feedbacks devem usar `toast` de `sonner`.
- Confirmações devem usar `ConfirmDialog` ou modal controlado equivalente.
- Coleta de texto deve usar modal controlado com campo de formulário e validação explícita.
- Ações destrutivas ou sensíveis devem expor estado de carregamento durante a execução assíncrona.
- Fluxos com dupla confirmação devem preservar os dois passos mesmo após trocar a UI.
- A varredura por diálogos nativos deve retornar apenas `src/app/components/ui/alert.tsx`, que é falso positivo por ser componente visual.

## Dados

- Pets devem permanecer distinguíveis de pessoas humanas.
- Falecidos devem ser tratados por `falecido` ou por campos de falecimento conforme normalização.
- Campos de privacidade não devem ser expostos indevidamente no perfil.
- Alterações de vínculos que dependem de aprovação não devem ser documentadas como gravação direta.
- `user_person_links.user_id` referencia `auth.users.id`; nunca gravar `pessoas.id` nesse campo.
- Vínculos que concedem acesso ou edição a usuário autenticado devem continuar usando `user_person_links`.
- Vínculos administrativos pessoa-a-pessoa para responsáveis por perfis legados ou crianças devem usar `person_responsible_links`.
- `person_responsible_links.managed_pessoa_id` deve representar a pessoa administrada.
- `person_responsible_links.responsible_pessoa_id` deve representar a pessoa responsável.
- Uma pessoa não pode ser responsável por ela mesma em `person_responsible_links`.
- O schema de `person_responsible_links` não deve substituir nem enfraquecer as regras de acesso autenticado de `user_person_links`.

## Status conjugal

- Não duplicar lógica de status conjugal fora de `src/app/utils/conjugalRelationshipStatus.ts`.
- Árvore, modal, perfil e admin devem consumir o helper compartilhado.
- Separação registrada deve prevalecer sobre união ativa.
- Viuvez e união histórica devem depender dos dados de falecimento das pessoas.
- Não criar coluna persistida de status conjugal sem decisão explícita de schema.
- A legenda da árvore deve diferenciar status por símbolo e padrão de linha, não apenas por cor.
- O perfil deve manter vínculos conjugais agrupados em relacionamento atual, relacionamentos anteriores e uniões históricas.
- O admin deve bloquear combinações contraditórias entre relacionamento ativo e dados de separação.

## Meus dados

- Redes sociais devem permitir digitação completa antes de salvar badge final.
- No mobile, a área `Outros ajustes` não deve aparecer.
- O botão de foto no mobile deve usar `Adicionar foto`.
- O toggle `Vivo/Falecido` no mobile deve permanecer compacto.
- A tela final do questionário `Sobre Mim` deve exibir `Seu Perfil`.
- Mini Bio e Curiosidades devem ser editáveis em `/meus-dados`, não em `/meus-vinculos`.
- `Voltar`, `Pular Tudo` e `Avançar` devem ficar na mesma linha no questionário mobile.

## Meus vínculos

- Cônjuges devem aparecer antes de filhos.
- Filhos devem respeitar regra de cônjuge quando o fluxo pedir outro pai/mãe.
- Pets devem abrir modal próprio e não podem reaparecer como área permanente separada de cadastro.
- Badges `Pré-cadastrado`, `Vivo`, `Falecido` e `Falecida` devem manter formatação coerente no mobile.
- Botão de lixeira no mobile deve ficar no topo direito do card.
- Modais de adicionar parentes não devem abrir teclado automaticamente sem foco explícito.
- A seleção de filhos, cônjuges, irmãos ou pets não pode travar o mobile.
- Alterações pendentes devem aparecer como `Em análise` até revisão.

## Revisão de dados

- Parentes adicionados ou removidos devem aparecer como `Em análise`.
- Antes de finalizar para `/mapa-familiar`, se o usuário tiver perfis sob responsabilidade, deve aparecer modal perguntando se deseja editar esses perfis agora.
- O modal de responsáveis não deve aparecer quando não houver perfis sob responsabilidade.

## Perfil de pessoa

- `Administração do perfil` não deve reaparecer em `/pessoa/:id`.
- `Irmãos` deve ficar oculto quando não houver irmãos cadastrados.
- `Discussões relacionadas` deve aparecer abaixo da linha do tempo.
- O botão superior `Criar discussão sobre esta pessoa` não deve reaparecer quando o CTA interno já existir.
- `Seu parentesco com ele` não deve aparecer para o próprio usuário.
- Badges de categorias do questionário não devem reaparecer quando o contrato visual pedir ocultação.

## Curiosidades

- Seletores Radix não podem receber item com `value` vazio.
- Seleções dependentes de usuário devem iniciar neutras quando o fluxo exigir escolha explícita.
- A falta da RPC `get_person_profile_selected_badges` não deve impedir o carregamento da página.
- Badges de status devem preservar texto em uma linha.
- Bodas devem respeitar apenas marcos exatos permitidos para casais ativos e sem separação registrada.
- Marcadores `+N` em gerações devem ser acionáveis quando houver pessoas ocultas.
- O quiz deve preservar até cinco perguntas por rodada, feedback animado na área das opções e resultado final consolidado.
- O menu do avatar não deve ficar atrás da navegação sticky ou dos botões superiores de `/curiosidades`.
- No mobile, botões superiores de `/curiosidades` devem permanecer visíveis e roláveis lateralmente.

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
- `/admin` deve exibir contagem do card `Relações`.
- `/admin` deve direcionar `Solicitações de Aprovações` para `/aprovacoes` ou `/admin/aprovacoes`.
- `/admin` deve exibir a contagem do card `Relações` com base em `obterTodosRelacionamentos()` e pode manter o subtítulo de casamentos quando couber.
- Convite por WhatsApp no admin não deve envolver o código final com asteriscos.
- A ação rápida deve usar `Textos automáticos`, não `Conteúdo de Pessoas`.
- `/admin/home` deve permitir salvar alterações após carregamento das configurações.
- `/admin/notificacoes` não deve exibir slugs crus em canais, tipos, status, disponibilidade, frequência ou categorias.
- `/admin/relacionamentos` deve manter filtros por cards, busca por pessoa, sugestões por nome e deduplicação de casamentos.
- `/admin/relacionamentos` e `/admin/aprovacoes` não devem exibir a classificação legada `sangue`/`adotivo`.
- `/admin/atividades` não deve apagar registros do banco ao acionar `Limpar`; a limpeza é visual/local.
- `/admin/atividades` deve usar label `Autor` no filtro de ator.
- `/admin/gestao-conteudo-pessoas` deve manter acentuação correta em UTF-8.
- `/admin/responsaveis` deve manter `Solicitações de administração` acima de `Perfis legados e crianças`.
- `/admin/responsaveis` não deve reintroduzir as seções antigas `Vínculos de usuários` e `Consulta` sem nova decisão explícita.
- `/admin/responsaveis` deve usar seletor inline de pessoa responsável nos cards de perfis legados e crianças.
- O seletor inline de responsável em `/admin/responsaveis` deve listar pessoas da tabela `pessoas`, não apenas perfis autenticados.
- O vínculo criado pelo seletor inline de `/admin/responsaveis` deve gravar em `person_responsible_links`, não em `user_person_links`.
- O ícone de pessoa falecida em `/admin/responsaveis` deve permanecer como cruz, não caveira.
- Cards de perfis legados e crianças não devem exibir texto instrucional mandando usar formulário externo de vínculos.
- A seção `Solicitações de administração` deve ficar oculta quando não houver pendências.

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
