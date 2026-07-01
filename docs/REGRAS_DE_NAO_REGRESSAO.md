# Regras de não regressão

> Última revisão: 2026-07-01
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
- Em perspectiva por `?pessoa=`, cônjuges colaterais não podem reaparecer por preferência persistida ou herança de estado.
- Mobile não deve herdar layout desktop de painel fixo.
- Exportação não pode ser removida do painel desktop sem substituto documentado.
- A seção `Exportar` deve exibir somente `Salvar Imagem` e `Imprimir`.
- `Imagem` e `PDF` não devem reaparecer como botões diretos no painel principal sem decisão explícita.
- Os botões `Salvar Imagem` e `Imprimir` devem permanecer compactos, em duas colunas, sem cortar a área do painel.
- Textos do painel devem permanecer em UTF-8 válido, sem mojibake.
- `Salvar Imagem` deve abrir modal de instruções antes de iniciar captura real.
- O modal de `Salvar Imagem` deve ter fundo opaco em `/mapa-familiar` e `/mapa-familiar-horizontal`.
- Durante a seleção de área, controles de zoom, favorito e botão flutuante `?` devem ficar ocultos.
- A captura não pode incluir modal, overlay, toast, toolbar, header, painel lateral, zoom, favorito ou botão `?`.
- O toast instrucional redundante depois do modal não deve reaparecer.
- `Imprimir` deve abrir a janela nativa do navegador.
- A impressão deve incluir título superior, árvore centralizada e caber em uma página.
- A impressão não pode exibir header, painel lateral, controles de zoom, favorito, botão `?`, overlays ou toolbars.
- Falhas de exportação/captura/impressão devem encerrar estado transitório e informar erro por `toast`.
- Capturas internas por `html2canvas` devem sanitizar cores modernas não suportadas, como `oklch`, antes de gerar artefatos.
- O cabeçalho do painel desktop deve manter título, ícone e ação de recolher na mesma linha.
- Cards do painel desktop devem preservar legibilidade e não podem cortar labels ou botões de exportação.
- A seção `Grupos de Familiares` e seu subtítulo não devem desaparecer do painel.
- Em `/mapa-familiar` desktop, os alinhamentos de grupos inferiores devem preservar pai e mãe como referências visuais.
- A ordenação visual de cards deve evitar linhas extras quando houver espaço para singles e pares conjugais.
- No mobile, o header deve exibir `Árvore Familiar`, não `Família de X`.
- O painel do botão `+` deve ficar acima de todos os demais elementos da página.
- O painel mobile deve reconhecer pais, filhos, cônjuges, irmãos, pets, avós, tios, primos e sobrinhos a partir dos dados reais da árvore.
- Itens de familiares no painel mobile devem exibir primeiro e segundo nome completos.
- Não permitir arrasto vertical para regiões sem conteúdo abaixo da tela central.
- Não permitir arrasto para primos quando não houver primos abaixo de tios.
- Não exibir linha vertical abaixo de tios quando não houver primos no lado correspondente.
- A visão geral/Mapa mobile não deve duplicar ícones, disparar ghost click ou deslocar conectores após abrir/fechar.
- O botão da toolbar mobile deve se chamar `Mapa`; `Zoom` não deve ser usado para abrir a visão geral de grupos.
- O botão `Mapa` deve abrir a visão geral em `/mapa-familiar` e cada card deve navegar para sua tela correta, sem depender da tela atual do usuário.
- O zoom real no mobile deve permanecer no fluxo `Exibir mapa completo`, com pan e pinça próprios.
- Ao abrir `Formato`, `Cor`, `Filtros`, `Mapa` ou `+`, a toolbar mobile não pode mudar de posição e a navegação inferior não pode desaparecer.
- Backdrop/blur parcial deve ficar atrás do painel ativo e nunca cobrir header, toolbar, cards, CTA ou navegação inferior.
- Backdrop/blur parcial deve terminar no topo real da navegação inferior, sem faixa desfocada acima do menu inferior.
- O modo imersivo é reservado a camadas completas, como mapa completo e painel do botão `+`, e nunca pode cobrir a camada ativa nem seus controles próprios, como o botão `X`.
- No modo imersivo, header, toolbar, tray, conteúdo e navegação inferior ficam atrás do blur; mapa completo e botão `X` ficam acima.
- Em `Formato`, `Mapa da família` e `Gerações`, o blur parcial deve começar abaixo do container completo do painel, incluindo botões inferiores.
- O fundo branco de `Mapa da família` e `Gerações` deve envolver cards e CTA, sem corte abaixo de `Exibir mapa completo`.
- `Tios Paternos` e `Tios Maternos` devem exibir inicialmente no máximo 8 cards no mobile quando houver muitos registros.
- O botão local `+` dos tios deve revelar os demais cards e alternar para `−` para recolher; ele não pode acionar o painel global da toolbar.
- `Primos Paternos` e `Primos Maternos` devem rolar com um dedo em iPhone/Safari.
- Handlers em `window capture` ou `document capture` não podem bloquear `touchmove` antes de avaliar se há scroll interno vertical disponível.
- O retorno de primos para tios deve ocorrer apenas no topo da lista de primos, quando o usuário puxar para baixo.
- Os seletores legados `mobile-map-toolbar-panel-backdrop`, `data-mobile-map-toolbar-backdrop`, `--mobile-map-toolbar-backdrop-top` e `--mobile-map-toolbar-backdrop-bottom` não devem ser reintroduzidos como contrato ou dependência funcional.

### Mapa completo mobile

- O botão `Exibir mapa completo` deve abrir uma camada completa acima do blur imersivo.
- O mapa completo não pode ficar por baixo de backdrop/blur.
- O modal/painel anterior não pode permanecer por cima do mapa completo.
- O mapa completo deve ter botão `X` e ação `Reenquadrar` quando aplicável.
- O botão `X` deve ficar no canto superior direito, respeitar `safe-area`, ter área de toque confortável e permanecer acima do palco do mapa.
- Fechar pelo `X` deve remover a camada completa, limpar o blur imersivo e restaurar a shell mobile sem overlay preso.
- Pan e zoom por pinça devem funcionar sem rolar a página por baixo.
- Pan e zoom não podem resetar automaticamente após o usuário soltar o dedo ou encerrar a pinça.
- Reidratação, `MutationObserver`, resize ou runtime defensivo não podem sobrescrever o `transform` do usuário, salvo por `Reenquadrar` ou reconstrução real do stage.
- O mapa completo deve ser renderizado por modelo próprio de nós/cards/conectores, não por clone visual frágil de seções.
- Cada card de pessoa deve usar estrutura visual comum, com variantes controladas.
- Conectores devem partir da borda real de grupos/cards.
- `Bisavós paternos → Avós paternos` e `Bisavós maternos → Avós maternos` não podem gerar múltiplas linhas laterais.
- `Tios paternos → Pai` e `Tios maternos → Mãe` devem permanecer conectados horizontalmente.
- A ramificação superior da pessoa central para `Pai`/`Mãe` deve ser única antes de se dividir.
- A ramificação inferior da pessoa central para `Irmãos`/`Cônjuge` deve ser única antes de se dividir.
- `Irmãos → Sobrinhos` e `Tios maternos → Primos maternos` devem permanecer conectados quando houver conteúdo.
- Rótulos `Pai` e `Mãe` não podem ficar cortados.

## Linha geracional mobile

- `/linha-geracional` deve preservar o título `Árvore Familiar` no header mobile.
- Cabeçalhos `Geração N` não podem ficar colados à toolbar ou ao topo da área rolável.
- Gerações vazias não devem aparecer como tela inicial quando houver gerações posteriores com conteúdo.
- Cards de cônjuges devem ficar empilhados quando necessário.
- Linhas laterais devem conectar apenas relações reais, não todos os cards da geração.
- Mudanças na linha geracional mobile não devem alterar o layout desktop de `/mapa-familiar-horizontal`.
- O painel `Mapa` de `/linha-geracional` deve preservar header, toolbar superior e navegação inferior durante o painel parcial.
- O container `Gerações`, seus cards e o botão `Exibir mapa completo` devem ficar acima do backdrop/blur parcial.
- O painel `Mapa` deve exibir atalhos compactos `GER. 1` a `GER. 6`, preferencialmente em grid `3x2`.
- Cada card `GER. N` deve navegar para a geração correspondente, atualizar o estado ativo e fechar o tray sem trocar de rota.
- Contadores de pessoas por geração devem refletir os cards renderizados quando disponíveis.
- O fundo branco do painel deve envolver grade e CTA inferior.
- A visualização completa de `/linha-geracional` deve preservar o `transform` após pan ou pinch.

## Overlays mobile de header

- Dropdown de notificações deve aparecer acima de header, toolbar, canvas, painéis e conteúdo.
- Sugestões de busca devem aparecer acima de header, toolbar, canvas, painéis e conteúdo.
- Menu de avatar deve aparecer acima de elementos sticky e do botão flutuante `?`, e não deve exigir scroll vertical excessivo para mostrar ações essenciais.
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
- Notificações reais entregues ao usuário devem continuar em `notificacoes_usuario`, não em tabelas administrativas.
- Preferências individuais de usuário devem continuar em `preferencias_notificacao`.
- Configurações administrativas da tela `/admin/notificacoes` devem usar `admin_notification_configurations`.
- O catálogo administrativo editável deve usar `admin_notification_catalogs`.
- `admin_notification_configurations.variable_settings` deve armazenar regras por variável de template, como origem, valor/fallback, link considerado e formato de data.
- O snapshot de `admin_notification_catalogs.notification_templates` pode conter `variableSettings` como metadado do template, mas a execução real deve continuar validando o contexto do gatilho antes de substituir variáveis.
- A deduplicação do primeiro acesso real a `/mapa-familiar` deve continuar em `user_first_map_accesses`.
- Tokens de destinatário `specific_user:<uuid>` não podem ser confundidos com grupos fixos.
- Tokens de evento `trigger_event:<evento>` não podem ser tratados como usuários reais.
- `trigger_event:first_map_access` representa o gatilho já implementado de primeiro acesso a `/mapa-familiar`.
- `trigger_event:first_login`, `trigger_event:onboarding_completed` e `trigger_event:profile_updated` podem existir como configuração preparada, mas não devem ser documentados como disparo real enquanto não estiverem conectados aos fluxos de autenticação, onboarding ou atualização de perfil.

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
- Nas etapas intermediárias do questionário mobile, `Voltar`, `Pular Tudo` e `Avançar` devem ficar na mesma linha quando houver espaço.
- `Voltar` e `Avançar` podem ser icon-only no mobile para evitar texto espremido dentro dos botões.
- Ao avançar, voltar ou finalizar etapas do questionário `Sobre Mim`, a página deve reposicionar no topo da seção `Sobre Mim`.
- O `ref`/âncora de rolagem do questionário não pode apontar para a seção `Contato, endereço e redes`.
- Na última etapa do questionário `Sobre Mim`, `Pular Tudo` não deve aparecer.
- Na última etapa do questionário `Sobre Mim`, o CTA `Finalizar` deve aparecer com largura confortável no mobile.

## Meus vínculos

- Cônjuges devem aparecer antes de filhos.
- Filhos devem respeitar regra de cônjuge quando o fluxo pedir outro pai/mãe.
- Pets devem abrir modal próprio e não podem reaparecer como área permanente separada de cadastro.
- Pet cadastrado por modal deve ser refletido na área `Pets` sem exigir recarregamento manual.
- O modal de pet deve manter upload com zoom/crop e não deve reintroduzir botão redundante `Atualizar`.
- O dropdown `Outros tutores` de pet deve listar apenas `Sou o único tutor` e cônjuges cadastrados.
- O dropdown `Outros tutores` de pet não pode listar pais, mães, filhos, irmãos ou parentes genéricos.
- Badges `Pré-cadastrado`, `Vivo`, `Falecido` e `Falecida` devem manter formatação coerente no mobile.
- Botão de lixeira no mobile deve ficar no topo direito do card.
- Modais de adicionar parentes não devem abrir teclado automaticamente sem foco explícito.
- A seleção de filhos, cônjuges, irmãos ou pets não pode travar o mobile.
- Se a pessoa em revisão ou o cônjuge for falecido, não reexibir `Relacionamento ativo`, `Data de separação` ou `Local de separação`.
- Alterações pendentes devem aparecer como `Em análise` até revisão.

## Arquivos históricos

- O seletor `Pessoas participantes` deve ficar oculto por padrão no primeiro acesso.
- O botão `Adicionar outras pessoas` deve revelar o seletor sem deslocar o layout de forma quebrada.
- Se já houver participantes selecionados, o seletor pode permanecer visível para edição.

## Revisão de dados

- Parentes adicionados ou removidos devem aparecer como `Em análise`.
- Pets pendentes devem aparecer no resumo final; quando a UI usar `Em aprovação`, esse estado deve ser tratado como equivalente funcional de pendência.
- No mobile, o card inicial não deve exibir o botão `Editar perfil`.
- No mobile, o botão `Finalizar e acessar árvore` deve ficar no final da página.
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
- `/admin/notificacoes` deve persistir configurações em `admin_notification_configurations`.
- `/admin/notificacoes` deve persistir snapshot editável do catálogo completo em `admin_notification_catalogs`.
- `/admin/notificacoes` deve preservar a aba ativa em recarregamento, troca de aba do navegador ou remount da página.
- `/admin/notificacoes` deve preservar rascunhos locais da aba `Configuração` enquanto o admin ainda não clicou em `Salvar`.
- A aba `Configuração` deve permitir criar novo tipo de notificação sem manter o nome genérico `Nova notificação N` depois que o admin editar o título.
- Tipos customizados devem usar o título preenchido pelo admin como nome administrativo exibido no seletor e persistido no catálogo.
- O card `Usuário do gatilho` deve abrir configuração de eventos do gatilho quando selecionado.
- A configuração de `Usuário do gatilho` deve oferecer ao menos `Primeiro acesso ao mapa familiar`, `Primeiro login`, `Conclusão do primeiro acesso` e `Atualização própria de perfil`, diferenciando visualmente gatilhos implementados e apenas preparados.
- Selecionar `Usuário do gatilho` deve gravar o grupo `trigger_user` e tokens de evento `trigger_event:<evento>` em `recipientOverrides`.
- Selecionar `Usuários específicos` deve continuar abrindo lista de usuários e gravando tokens `specific_user:<uuid>`.
- `Usuários específicos` e `Usuário do gatilho` não podem apagar seleções de outros grupos de destinatários que não pertençam ao mesmo namespace.
- A área de variáveis deve permitir inserir tokens no campo ativo preservando cursor e seleção.
- A área de variáveis deve permitir editar regras por variável, incluindo origem, valor/fallback, link considerado e formato de data.
- A variável `{{link}}`, quando configurada com valor fixo, deve atualizar o `defaultLink` do template/tipo customizado salvo.
- Variáveis de data devem manter opção de formato curto, longo, relativo ou personalizado.
- Salvar a aba `Configuração` deve gravar tanto `variable_overrides` quanto `variable_settings`.
- `src/app/constants/adminNotificationCatalog.ts` pode permanecer como fallback/base técnica, mas não deve voltar a ser a única fonte de verdade para tipos customizados criados por admin.
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
