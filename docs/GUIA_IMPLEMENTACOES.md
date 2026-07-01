# Guia de implementações

> Última revisão: 2026-07-01
> Escopo: comportamento implementado na branch `main`.
> Status: canônico.

## Rotas e carregamento

- `src/app/routes.tsx` define lazy loading para páginas públicas, de membro, de árvore e administrativas.
- O fallback de rota exibe estado de carregamento.
- Erros de chunk ou asset JS disparam tentativa controlada de reload com chave de sessão.
- A rota raiz redireciona para `/mapa-familiar`.
- `/aprovacoes` e `/admin/aprovacoes` carregam a página administrativa de aprovações.
- Runtime tweaks globais devem ser defensivos, com `requestAnimationFrame`, `try/catch` e observação mínima de mutações para evitar loops de renderização.

## Primeiro acesso e rascunhos locais

- O primeiro acesso usa rotas de membro com estado preservado por usuário e pessoa vinculada.
- Rascunhos de `/meus-dados` e `/meus-vinculos` podem usar `sessionStorage` com chave segmentada por `user.id` e `pessoa.id`.
- Rascunhos são proteção auxiliar de UX; falhas de storage não devem bloquear salvamento nem navegação.
- O fluxo deve preservar a ordem `/meus-dados` → `/meus-vinculos` → `/arquivos-historicos` → `/preferencias` → `/revisao-dados` → `/mapa-familiar`.
- Pessoa marcada como falecida em `/meus-dados` deve pular `/preferencias`.
- Alterações de vínculos que dependem de aprovação devem ser representadas como pendência, não como gravação definitiva.
- Eventos customizados entre componentes de primeiro acesso devem ter escopo local da página e não podem virar substitutos de serviço de dados ou autenticação.

## Runtimes defensivos mobile

A branch usa componentes React e scripts carregados pelo `index.html` para ajustes defensivos de UX.

Regras de implementação:

- qualquer ajuste de DOM deve ser isolado por rota e breakpoint;
- não observar `attributes` em `MutationObserver` quando o próprio código altera `style`, `dataset` ou classes;
- evitar recriar repetidamente opções de `<select>` ou nós equivalentes;
- usar `requestAnimationFrame` para agrupar mutações;
- usar `try/catch` para impedir que um ajuste visual bloqueie a página;
- preferir correção no componente de origem quando o ajuste deixar de ser temporário.

Componentes relevantes:

- `MobileGlobalTweaks` para overlays mobile, header, busca, notificações, ajustes de `/meus-dados`, `/meus-vinculos` e mapa quando aplicável;
- `MobileTopLayerTweaks` para camada superior de busca, notificações, avatar e painéis;
- `LinhaGeracionalMobilePanelLayerTweaks` para isolamento do painel da rota `/linha-geracional`;
- `FirstLoginTutorialRuntimeTweaks` para tour e correções pontuais de primeira experiência;
- `PersonProfileRuntimeTweaks` para ocultações e reposicionamentos defensivos em `/pessoa/:id`.

## Mapa familiar

- `Home.tsx` carrega pessoas e relacionamentos via `dataService`.
- O cache de árvore é segmentado por usuário e pessoa vinculada.
- Mudanças de dados invalidam cache via `treeDataCache`.
- A pessoa de referência usa, em ordem, query string, foco atual, pessoa vinculada ou primeira pessoa disponível.
- Filtros de parentes diretos são persistidos por usuário.
- Filtros de vida/pet afetam visibilidade e contadores.
- Em perspectiva por `?pessoa=`, cônjuges colaterais devem iniciar ocultos.
- O painel desktop usa `DesktopTreeVisualizationPanel` para visualização, tema, filtros e exportação.
- O mapa desktop por grupos usa `DesktopFamilyMapView`; alterações de alinhamento devem preservar pai/mãe e leitura geracional.
- A renderização de cards em grupos usa `FamilyTreeVisualCards`.
- O subtipo legado `sangue`/`adotivo` não deve ser reintroduzido como texto visível.

## Mapa e linha geracional no mobile

- O header mobile das experiências de árvore deve usar `Árvore Familiar`.
- `/linha-geracional` deve reaproveitar a leitura horizontal por gerações sempre que possível.
- Cabeçalhos `Geração N` precisam de espaçamento superior suficiente para não colar na toolbar.
- Overlays do botão `+`, busca e notificações devem ficar em camada superior ao canvas e à toolbar.
- O painel de visualização mobile deve exibir familiares reconhecidos por dados reais da árvore.
- Nomes listados em grupos devem usar primeiro e segundo nome completos.
- O mobile deve bloquear gesto vertical para áreas inferiores inexistentes.
- Em `paternal-uncles` e `maternal-uncles`, a visualização mobile deve limitar inicialmente a lista a 8 cards e expor controle local `+`/`−` quando houver excedentes.
- Em `paternal-cousins` e `maternal-cousins`, o scroll vertical interno deve ter prioridade sobre a navegação por swipe e funcionar com um dedo no iPhone.
- O botão mobile `Mapa` abre a visão geral de grupos; zoom real é reservado ao mapa completo.
- A toolbar mobile de mapa deve permanecer fixa abaixo do header ao abrir `Formato`, `Cor`, `Filtros`, `Mapa` ou `+`.
- `MobileFamilyMapBackdrop.tsx` controla o backdrop React parcial/imersivo:
  - no modo parcial, calcula `bottom` a partir do topo real do menu inferior;
  - no modo imersivo, cobre a shell atrás do mapa completo;
  - não deve usar `MutationObserver` para posicionar o blur.
- `MobileFamilyMapContextTray.tsx` controla os trays contextuais da toolbar:
  - preserva os children originais para ações internas;
  - em `/linha-geracional`, substitui o card único por atalhos compactos `GER. 1` a `GER. 6`;
  - fecha o tray após navegação para a geração selecionada;
  - mantém o CTA `Exibir mapa completo` dentro da área branca.
- `MobileFamilyMapFullLayer.tsx` monta a camada de mapa completo acima do blur imersivo, com botão `X` no canto superior direito, respeito a `safe-area` e área de toque confortável.
- Backdrop/blur parcial deve ser calculado abaixo do painel ativo e terminar no topo da navegação inferior.
- Painéis ativos, cards, CTA e mapas completos devem permanecer acima do backdrop aplicável.
- Os seletores legados `mobile-map-toolbar-panel-backdrop`, `data-mobile-map-toolbar-backdrop`, `--mobile-map-toolbar-backdrop-top` e `--mobile-map-toolbar-backdrop-bottom` não devem ser reintroduzidos.

## Scripts carregados por `index.html`

Scripts relevantes antes de alterar mapa, mobile, curiosidades, tutorial ou painel desktop:

- `mobileFamilyTreeMutationPerformanceGuard.ts`
- `visualPatchB.ts`
- `firstLoginMobileTutorialFixes.ts`
- `mobileCuriositiesNavigationFix.ts`
- `mobileTreePanelViewportFix.ts`
- `staticMobileFamilyTreeScreens.ts`
- `mobileFamilyTreeScreenStateGuards.ts`
- `mobileFamilyTreeGrandparentScreens.ts`
- `mobileFamilyTreeSwipeHints.ts`
- `mobileFamilyTreeAncestorConnectorsFix.ts`
- `mobileFamilyTreeDescendantConnectorsFix.ts`
- `mobileFamilyTreeCoreDescendantConnector.ts`
- `mobileFamilyTreeGroupTitleVisibilityFix.ts`
- `mobileFamilyHorizontalZoomOverview.ts`
- `mobileFamilyMapUncleSwipeNavigationGuard.ts`
- `mobileFamilyMapOverviewGhostClickGuard.ts`
- `mobileFamilyMapOverviewButtonFix.ts`
- `mobileFamilyMapStableMobileFix.ts`
- `mobileFamilyMapDirectionalNavigationFix.ts`
- `mobileFamilyMapUncleCardLimit.ts`
- `mobileFamilyMapCoreConnectorFix.ts`
- `mobileVisualizationPanelFamilyStatsFix.ts`
- `mobileFamilyMapZoomOverviewVisualFix.ts`
- `mobileFamilyMapOverviewTileVisualAdjustments.ts`
- `mobileFamilyMapDescendantsStabilityLock.ts`
- `mobileFamilyMapExtendedSpouseCards.ts`
- `mobileFamilyMapFilterButtonsBehaviorFix.ts`
- `mobileFamilyMapFullOverview.ts`
- `mobileGenerationLineFullOverview.ts`
- `mobileFamilyMapFullOverviewConnectorFix.ts`
- `mobileFamilyMapFullOverviewButtonGuard.ts`

Arquivos de transição neutralizados:

- `mobileMapToolbarBackdropLayerFix.ts`, `mobileMapPanelRefinements.ts`, `mobileFamilyMapFullPanelStyleFix.ts` e `mobileFamilyMapFullOverviewButtonGuard.ts` não devem voltar a concentrar regras de backdrop/tray.
- `visualPatchA.ts` não é carregado e deve ser removido ou justificado em limpeza técnica futura.

Handlers de `touchmove`/`touchend` devem mapear a ordem de captura (`window capture` antes de `document capture`) antes de chamar `preventDefault()` ou `stopImmediatePropagation()`. Scroll interno de listas deve ser avaliado antes de bloquear o gesto para navegação por swipe.

## Mapa completo mobile

O mapa completo mobile não deve ser tratado como simples captura ou clone de DOM.

Contrato:

- a abertura parte do botão `Exibir mapa completo` no painel `Mapa da família` ou no painel de gerações da linha geracional;
- a camada completa fica acima do blur imersivo e da shell da página;
- no modo completo, a shell da página pode ficar como fundo desfocado; a interação principal passa a ser o mapa completo e seu botão `X`;
- o botão `X` deve ficar no canto superior direito, respeitar `safe-area`, ter área de toque confortável e ficar acima do palco do mapa;
- fechar o mapa deve remover a camada completa, limpar o blur imersivo e retornar ao estado anterior sem deixar backdrop preso;
- a estrutura é montada por modelo declarativo com pessoas, nós e arestas;
- conectores são SVGs gerados por âncoras dos nós;
- pan e zoom devem usar eventos de toque sem permitir scroll da página por baixo;
- reidratações e observers não podem sobrescrever o `transform` aplicado pelo usuário após pan ou pinça;
- a ação `Reenquadrar` deve recalcular escala e posição conforme o viewport;
- a camada React de fechamento pertence a `MobileFamilyMapFullLayer.tsx`; fluxos legados de mapa completo devem respeitar os mesmos contratos de camada, toque e fechamento.

## Status conjugal

- `src/app/utils/conjugalRelationshipStatus.ts` centraliza a inferência de status conjugal.
- O modelo usa `subtipo_relacionamento`, `data_separacao`, `ativo` e falecimento das pessoas.
- A árvore usa o status para símbolo, tooltip, descrição e padrão visual de linha.
- A legenda da árvore diferencia status conjugais por símbolo e padrão de linha.
- O modal conjugal usa status para badge, tooltip, headline e narrativa.
- O perfil agrupa vínculos em relacionamento atual, relacionamentos anteriores e uniões históricas.
- O admin exibe status inferido e bloqueia combinações contraditórias.
- Não há migration de `status_conjugal`; o status permanece inferido pelos campos existentes.

## Exportação e paletas

- A paleta laranja da árvore deve permanecer quente, terracota e solar, sem voltar ao bege-pastel da paleta branca.
- A paleta marrom deve preservar caráter documental/sépia.
- A seção `Exportar` do painel desktop exibe somente `Salvar Imagem` e `Imprimir`.
- `Salvar Imagem` é a ação pública de captura de área real da tela.
- `Imprimir` abre a janela nativa de impressão a partir de uma página limpa com título e imagem dimensionada da árvore.
- `Imagem` e `PDF` não são ações diretas expostas no painel principal atual.

### Captura por `Salvar Imagem`

Implementação:

- `DesktopTreeVisualizationPanel.tsx` e `SidebarPanelTabs.tsx` disparam a ação interna `select-area`;
- `HomeTreeSection.tsx` intercepta `select-area` e abre o modal de instruções;
- o modal explica permissão da guia, seleção da área e salvamento;
- `Continuar` chama `captureVisibleScreenAreaAsPng`;
- `screenAreaCapture.ts` usa `navigator.mediaDevices.getDisplayMedia`;
- o fluxo prefere `displaySurface: 'browser'`, `preferCurrentTab`, `selfBrowserSurface: 'include'` e `surfaceSwitching: 'exclude'` quando suportado;
- a captura valida `displaySurface` e rejeita superfícies de janela/tela inteira quando isso puder deslocar o recorte;
- o overlay de seleção usa eventos de ponteiro e `Escape` para cancelar;
- o recorte usa proporção entre viewport e vídeo capturado;
- `showSaveFilePicker` é usado quando disponível;
- quando o File System Access API não estiver disponível, o fallback é download por `a[download]`;
- streams devem ter tracks encerradas no `finally`.

Durante a captura, o documento recebe estado transitório para ocultar:

- `.tree-canvas-zoom-controls`;
- `[data-tour-target="tree-favorite"]`;
- `a[href="/duvidas"].fixed.bottom-8.right-8`.

### Impressão

Implementação atual:

- `print` é tratado separadamente do fluxo de preview;
- `HomeTreeSection.tsx` prepara uma página limpa de impressão;
- a página de impressão inclui título superior com padrão `Árvore Familiar de X`;
- a árvore é capturada internamente como imagem e inserida em uma página isolada;
- a imagem usa contenção proporcional para caber em uma única página;
- a árvore fica centralizada horizontalmente;
- o usuário pode escolher `Retrato` ou `Paisagem` na janela nativa do navegador.

Não devem aparecer na impressão:

- header;
- painel lateral;
- controles de zoom;
- botão de favorito/estrela;
- botão flutuante `?`;
- overlays, modais ou toolbars.

### Helpers internos e compatibilidade

- `html2canvas` ainda pode ser usado por helpers internos de captura/preview;
- `jsPDF` permanece disponível para fluxos internos ou futuros, mas `PDF` não é ação exposta no painel principal;
- `exportColorSanitizer.ts` deve ser usado antes de capturas que passem por `html2canvas`;
- `window.alert`, `alert`, `confirm` e `prompt` não devem ser reintroduzidos.

## IA

`api/ai.ts` implementa:

- perguntas sobre árvore com contexto JSON limitado;
- geração de `minibio` e `curiosidades` quando `purpose === "profile_text"`;
- validação de payload mínimo;
- uso de `OPENAI_API_KEY`;
- modelo padrão `gpt-4.1-mini`, sobrescrevível por `OPENAI_MODEL`;
- resposta JSON estrita para geração de textos de perfil;
- limite de 500 caracteres por campo gerado;
- resposta em português do Brasil para perguntas gerais;
- proteção contra exposição de IDs internos.

## Feedback e diálogos próprios

- A branch `main` não deve exibir diálogos nativos do navegador em fluxos da aplicação.
- `window.alert` e `alert` foram substituídos por `toast` de `sonner`.
- `window.confirm` e `confirm` foram substituídos por `ConfirmDialog` ou modal controlado.
- `window.prompt` e `prompt` foram substituídos por modal controlado com campo de texto.
- Ações administrativas sensíveis usam UI própria.
- O fluxo sensível de remoção do último vínculo `Sou esta pessoa` mantém dupla confirmação, mas sem API nativa do navegador.
- `/pessoa/:id` não exibe mais o card `Administração do perfil` nem o fluxo público de solicitação de administração.

A varredura técnica esperada em `src/` deve retornar apenas o falso positivo visual `src/app/components/ui/alert.tsx`.

## Dados e Supabase

- `dataService.ts` centraliza pessoas e relacionamentos.
- Campos de privacidade são normalizados no carregamento.
- Erros de Supabase são convertidos em mensagens técnicas mais legíveis.
- Alterações relevantes criam log de atividade quando o serviço aplicável faz essa chamada.
- Vínculos de membro são tratados por `memberProfileService`.
- Badges selecionadas do questionário de perfil usam RPC versionada quando disponível e fallback no serviço quando a RPC não estiver aplicada no ambiente remoto.
- `personVisibilitySettingsService.ts` deve retornar defaults locais quando a tabela `person_visibility_settings` não estiver disponível no schema remoto.
- Responsáveis por perfis legados ou crianças devem usar `person_responsible_links` quando a relação for pessoa-a-pessoa.
- Nunca gravar `pessoas.id` em `user_person_links.user_id`.

## Curiosidades

- `/curiosidades` carrega blocos exploratórios a partir de pessoas, relacionamentos e badges de perfil.
- A página é orquestrada por `Curiosidades.tsx`.
- A barra de navegação interna é sticky e usa âncoras para seções existentes.
- Os cards numéricos superiores foram removidos da composição final da página e não devem ser reintroduzidos sem decisão explícita.
- `CuriosidadesAiSection` monta contexto por `buildAiTreeContext`, usa sugestões rápidas e envia perguntas para `/api/ai` quando a página possui dados carregados.
- O placeholder da pergunta da IA é curto e específico: `Faça aqui sua pergunta…`.
- Seletores que dependem de pessoa devem evitar item Radix com `value` vazio.

## Fórum

- Rotas do fórum estão em `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`.
- A documentação funcional do fórum deve considerar `forumService.ts` e `supabase/forum-schema.sql`.
- No desktop, a busca do fórum deve preservar alinhamento com `Categorias` à esquerda e com a ação `Criar novo` à direita.
- Menções com `@` em `/forum/novo` exibem sugestões compactas, filtráveis e posicionadas próximas ao ponto de digitação.
- Reações devem ficar disponíveis apenas no tópico principal; respostas não devem exibir botões de reação.
- Tópicos e respostas editados devem exibir badge `Editado` quando `updated_at` indicar alteração posterior à criação.

## Notificações, favoritos e busca

- Notificações usam rotas `/notificacoes` e `/ajustar-notificacoes`.
- Favoritos usam `/meus-favoritos`.
- A busca global do header usa `HeaderGlobalSearch`, combinando resultados de pessoas e páginas via `globalSearchService`.
- Páginas internas que usam `MemberPageHeader` devem exibir sugestões equivalentes às da experiência de mapa.
- No mobile, dropdowns de busca e notificações devem ter camada superior a toolbars sticky, canvas da árvore, painéis e cards.
- O menu de avatar deve exibir primeiro e segundo nome no topo, subtítulo `Editar perfil`, área `Perfis gerenciados` quando aplicável e atalhos de dúvidas e saída.

## Meus dados

- O editor de redes sociais deve manter o perfil em digitação como rascunho editável até o usuário confirmar a adição.
- Não transformar rede social com uma única letra digitada em item finalizado.
- A área `Outros ajustes` não deve aparecer no mobile.
- O botão de foto no mobile deve usar `Adicionar foto`.
- O questionário `Sobre Mim` deve exibir Mini Bio e Curiosidades na tela final `Seu Perfil` dentro de `/meus-dados`, não em `/meus-vinculos`.
- A âncora de rolagem do questionário `Sobre Mim` deve ficar no container da própria seção, não na seção de contato/endereço.
- Trocas de etapa do questionário devem usar rolagem controlada para o topo da seção e considerar header/áreas fixas no mobile.
- A última etapa do questionário deve ocultar `Pular Tudo` e expor `Finalizar` como CTA principal.
- `MeusDadosWithInlineProfileBio` pode complementar a tela final `Seu Perfil`, mas não deve injetar CTA concorrente que duplique o encerramento do questionário.

## Meus vínculos

- Cônjuges devem aparecer antes de filhos.
- A seção permanente de cadastro de pets deve ser substituída por modal acionado pela seção `Pets`.
- O modal de pet deve reaproveitar o padrão de upload com crop/zoom do avatar quando houver foto.
- Ao salvar pet pelo modal, a página principal deve receber a atualização e refletir o pet na área `Pets`, preservando o estado pendente quando houver aprovação.
- A integração entre modal de pet e página principal pode usar evento customizado local, desde que o payload contenha o pet salvo e não substitua persistência definitiva.
- O dropdown `Outros tutores` de pet deve ser derivado de `relationships.conjuges`, com opção neutra `Sou o único tutor`.
- Filhos podem depender de cônjuge cadastrado quando o fluxo pedir o outro pai/mãe.
- Em dados conjugais, falecimento da pessoa em revisão ou do cônjuge deve zerar/inibir relacionamento ativo e ocultar campos de separação na UI de primeiro acesso.
- Badges de pendência como `Em análise` devem aparecer para parentes adicionados ou removidos até aprovação.
- No mobile, modais de adicionar parentes não devem abrir teclado automaticamente nem travar ao trocar pessoa selecionada.

## Perfil de pessoa

- `/pessoa/:id` não deve exibir `Administração do perfil`.
- O card `Irmãos` deve ficar oculto quando não houver irmãos cadastrados.
- `Discussões relacionadas` deve ficar abaixo da linha do tempo.
- O botão superior `Criar discussão sobre esta pessoa` não deve aparecer quando já houver CTA interno no estado vazio.
- Badges derivadas do questionário não devem aparecer no perfil quando o contrato visual pedir ocultação.
- `Seu parentesco com ele` não deve aparecer quando a página estiver sendo vista pelo próprio usuário.

## Administração

- A administração usa `ProtectedRoute`.
- Rotas administrativas atuais estão listadas em `INVENTARIO_TECNICO.md`.
- O header das rotas `/admin/*` deve exibir apenas `Painel Administrativo`, `Principal` e o menu do usuário.
- `/admin` deve exibir contagens dos cards superiores, incluindo `Relações`.
- O card `Solicitações de Aprovações` deve encaminhar para `/aprovacoes` ou `/admin/aprovacoes`.
- `/admin/home` deve permitir salvar configurações nas abas depois que as configurações carregarem.
- `/admin/notificacoes` deve exibir labels, badges, canais, status, frequências, categorias e disponibilidade em linguagem humana.
- `/admin/relacionamentos` deve filtrar por todos, casamentos ou filiações e ocultar a classificação legada `sangue`/`adotivo` da UI.
- `/admin/aprovacoes` não deve exibir `Subtipo: sangue` nem `Subtipo: adotivo`.
- `/admin/responsaveis` usa `person_responsible_links` para o seletor inline de responsáveis em perfis legados e crianças.
- `/admin/duvidas` usa `AdminDuvidasRefined`.
- `/admin/atividades` usa tabela com colunas `Data`, `Autor`, `Atividade` e `Resumo`; o botão `Limpar` zera apenas a lista local exibida.
- `/admin/gestao-conteudo-pessoas` deve manter labels, botões, mensagens e títulos em UTF-8 válido.
- Documentação de admin deve citar apenas rotas existentes em `src/app/routes.tsx`.
