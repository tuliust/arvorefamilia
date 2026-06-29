# Guia de implementações

> Última revisão: 2026-06-29
> Escopo: comportamento implementado na branch `main`.
> Status: canônico.

## Rotas e carregamento

- `src/app/routes.tsx` define lazy loading para páginas públicas, de membro, de árvore e administrativas.
- O fallback de rota exibe estado de carregamento.
- Erros de chunk ou asset JS disparam tentativa controlada de reload com chave de sessão.
- A rota raiz redireciona para `/mapa-familiar`.
- `/aprovacoes` e `/admin/aprovacoes` carregam a página administrativa de aprovações.
- Runtime tweaks globais devem ser defensivos, com `requestAnimationFrame`, `try/catch` e observação mínima de mutações para evitar loops de renderização.

## Runtimes defensivos mobile

A branch usa componentes de runtime para pequenos ajustes de compatibilidade visual e transição de UX.

Regras de implementação:

- qualquer ajuste de DOM deve ser isolado por rota e breakpoint;
- não observar `attributes` em `MutationObserver` quando o próprio código altera `style`, `dataset` ou classes;
- evitar recriar repetidamente opções de `<select>` ou nós equivalentes;
- usar `requestAnimationFrame` para agrupar mutações;
- usar `try/catch` para impedir que um ajuste visual bloqueie a página;
- preferir correção no componente de origem quando o ajuste deixar de ser temporário.

Componentes relevantes:

- `MobileGlobalTweaks` para overlays mobile, header, busca, notificações, ajustes de `/meus-dados`, `/meus-vinculos` e mapa quando aplicável;
- `FirstLoginTutorialRuntimeTweaks` para tour e correções pontuais de primeira experiência;
- `PersonProfileRuntimeTweaks` para ocultações e reposicionamentos defensivos em `/pessoa/:id`;
- runtimes específicos de admin quando a página ainda depende de composição intermediária.

## Mapa familiar

- `Home.tsx` carrega pessoas e relacionamentos via `dataService`.
- O cache de árvore é segmentado por usuário e pessoa vinculada.
- Mudanças de dados invalidam cache via `treeDataCache`.
- A pessoa de referência usa, em ordem, query string, foco atual, pessoa vinculada ou primeira pessoa disponível.
- Filtros de parentes diretos são persistidos por usuário.
- Filtros de vida/pet afetam a visibilidade e os contadores.
- Quando a rota está em perspectiva de pessoa por `?pessoa=`, cônjuges colaterais devem iniciar ocultos e a ação equivalente no painel pode ficar bloqueada/indicada como indisponível para preservar a leitura da perspectiva.
- O painel desktop usa `DesktopTreeVisualizationPanel` para visualização, tema, filtros e exportação.
- O painel desktop deve exibir a seção `Grupos de Familiares` com subtítulo `Clique para exibir/ocultar grupos de parentes na árvore`.
- Títulos estruturais do painel, como `Resumo`, `Grupos de Familiares` e `Exportar`, compartilham formatação compacta e consistente.
- Ajustes visuais específicos do painel desktop ficam centralizados em `src/styles/desktop-tree-panel-frente-a.css`, `src/styles/desktop-tree-family-groups-density.css` e `src/styles/index.css`, e devem ser conferidos em conjunto.
- O mapa desktop por grupos usa `DesktopFamilyMapView`; alterações de alinhamento dos grupos devem preservar a posição de pai/mãe e a leitura geracional.
- A renderização de cards em grupos usa `FamilyTreeVisualCards`; a ordenação visual deve evitar linhas desnecessárias quando houver pares conjugais no grupo.
- O subtipo legado `sangue`/`adotivo` não deve ser reintroduzido como texto visível em formulários, cards ou aprovações de relacionamento.
## Mapa e linha geracional no mobile

- O header mobile das experiências de árvore deve usar `Árvore Familiar`.
- `/linha-geracional` deve reaproveitar a leitura horizontal por gerações sempre que possível.
- Cabeçalhos `Geração N` precisam de espaçamento superior suficiente para não colar na toolbar.
- Overlays do botão `+`, busca e notificações devem ficar em camada superior ao canvas e à toolbar.
- O painel de visualização mobile deve exibir familiares reconhecidos por dados reais da árvore, não apenas labels estáticos.
- Nomes listados em grupos devem usar primeiro e segundo nome completos.
- O mobile deve bloquear gesto vertical para áreas inferiores inexistentes, como descendentes ausentes ou primos inexistentes abaixo de tios.

## Status conjugal

- `src/app/utils/conjugalRelationshipStatus.ts` centraliza a inferência de status conjugal.
- O modelo usa `subtipo_relacionamento`, `data_separacao`, `ativo` e falecimento das pessoas.
- A árvore usa o status para símbolo, tooltip, descrição e padrão visual de linha.
- A legenda da árvore diferencia status conjugais por símbolo e padrão de linha, não apenas por cor.
- O modal conjugal usa status para badge, tooltip, headline, narrativa e contexto de sugestão.
- O perfil agrupa vínculos em relacionamento atual, relacionamentos anteriores e uniões históricas.
- O admin exibe status inferido e bloqueia combinações contraditórias entre relacionamento ativo e dados de separação.
- Não há migration de `status_conjugal`; o status permanece inferido pelos campos existentes.

## Alternância de visualização

- `/mapa-familiar` e `/mapa-familiar-horizontal` compartilham `Home`.
- `treeViewMode.ts` converte rota em modo de visualização.
- A query `pessoa` é preservada ao trocar entre modos.
- O seletor de visualização deve manter texto em UTF-8 válido; correções defensivas de mojibake não substituem a manutenção correta dos textos de origem.
- Arquivos defensivos de runtime precisam ser módulos TypeScript, usando `export {}` quando necessário, para evitar colisão de constantes no escopo global.

## Exportação e paletas

- A paleta laranja da árvore foi redesenhada para se diferenciar da branca, com aparência mais quente, terracota e solar.
- A paleta marrom deve permanecer mais documental/sépia; a laranja não deve voltar ao bege-pastel da paleta branca.
- `Área` mantém o fluxo de seleção visível da árvore e exibe botões próprios para `Salvar PNG`, `Salvar PDF`, `Imprimir` e `Cancelar`.
- `Imagem`, `PDF` e `Imprimir` abrem aba/janela dedicada de preview por query string, preservando a página principal do usuário.
- O preview usa a rota real com `exportPreview=1` e `exportIntent=png`, `pdf` ou `print`, ocultando header, painel lateral, controles auxiliares e botão flutuante.
- O toolbar do preview deve exibir apenas a ação escolhida no painel principal: `Salvar PNG`, `Exportar PDF` ou `Imprimir`.
- `Salvar PNG` captura a árvore renderizada no próprio preview com `html2canvas` e escala configurada em `1.5`.
- `Exportar PDF` usa captura do preview e geração via `jsPDF` quando o fluxo estiver estável; não deve abrir a janela de impressão como substituto silencioso.
- `Imprimir` deve preparar composição em página única, escolhendo retrato ou paisagem conforme proporção da árvore e evitando corte do conteúdo.
- `treeExport.ts` concentra timeout, fallback, abertura de preview, sanitização de cores e escrita de erro em aba de preview.
- `exportColorSanitizer.ts` deve ser usado em capturas que passem por `html2canvas`, para evitar erro com cores modernas como `oklch`.
- Overlays e mensagens de exportação devem permanecer em UTF-8 válido e não devem aparecer no artefato exportado.
- Estado atual da frente: o fluxo de preview está implementado, mas a captura por `html2canvas` ainda exige QA visual específico porque sombras/filtros podem aparecer como blocos cinza e etiquetas podem ser cortadas em alguns cenários. Não documentar essa frente como visualmente estabilizada sem nova validação manual.
## IA

`api/ai.ts` implementa:

- perguntas sobre árvore com contexto JSON limitado;
- geração de `minibio` e `curiosidades` quando `purpose === "profile_text"`;
- validação de payload mínimo;
- uso de `OPENAI_API_KEY`;
- modelo padrão `gpt-4.1-mini`, sobrescrevível por `OPENAI_MODEL`;
- resposta JSON estrita para geração de textos de perfil;
- limite de 500 caracteres por campo gerado.

## Feedback e diálogos próprios

- A branch `main` não deve exibir diálogos nativos do navegador em fluxos da aplicação.
- `window.alert` e `alert` foram substituídos por `toast` de `sonner`.
- `window.confirm` e `confirm` foram substituídos por `ConfirmDialog` ou modal controlado.
- `window.prompt` e `prompt` foram substituídos por modal controlado com campo de texto.
- Ações administrativas de limpeza, exclusão, remoção de vínculo, envio de teste, execução de rotina, aprovação/rejeição e restauração de configuração usam UI própria.
- O fluxo sensível de remoção do último vínculo `Sou esta pessoa` mantém dupla confirmação, mas sem API nativa do navegador.
- `/pessoa/:id` não exibe mais o card `Administração do perfil` nem o fluxo público de solicitação de administração; o botão de editar perfil continua respeitando permissões.

A varredura técnica esperada em `src/` deve retornar apenas o falso positivo visual `src/app/components/ui/alert.tsx`.

## Dados e Supabase

- `dataService.ts` centraliza pessoas e relacionamentos.
- Campos de privacidade são normalizados no carregamento.
- Erros de Supabase são convertidos em mensagens técnicas mais legíveis.
- Alterações relevantes criam log de atividade quando o serviço aplicável faz essa chamada.
- Vínculos de membro são tratados por `memberProfileService`.
- Badges selecionadas do questionário de perfil usam RPC versionada quando disponível e fallback no serviço quando a RPC não estiver aplicada no ambiente remoto.
- `personVisibilitySettingsService.ts` deve retornar defaults locais quando a tabela `person_visibility_settings` não estiver disponível no schema remoto, evitando quebra da página administrativa correspondente.
- Responsáveis por perfis legados ou crianças devem usar `person_responsible_links` quando a relação for pessoa-a-pessoa.
- Nunca gravar `pessoas.id` em `user_person_links.user_id`.

## Curiosidades

- `/curiosidades` carrega blocos exploratórios a partir de pessoas, relacionamentos e badges de perfil.
- A página é orquestrada por `Curiosidades.tsx`, que define a composição de Hoje, Fotos, IA, Quiz, Mural, Rankings, Gráficos, Gerações, Relacionamentos, Rota e abas inferiores.
- A barra de navegação interna é sticky e usa âncoras para seções existentes; no mobile, a rolagem horizontal é controlada por botões laterais.
- Os cards numéricos superiores foram removidos da composição final da página e não devem ser reintroduzidos sem decisão explícita.
- `CuriosidadesPhotoSlider` usa `foto_principal_url` de pessoas humanas, limita a lista de fotos e alterna entre miniaturas desktop e uma foto por vez no mobile.
- `CuriosidadesAiSection` monta contexto por `buildAiTreeContext`, usa sugestões rápidas e envia perguntas para `/api/ai` quando a página possui dados carregados.
- O placeholder da pergunta da IA é curto e específico: `Faça aqui sua pergunta…`.
- Seletores que dependem de pessoa devem evitar item Radix com `value` vazio.
- A seção `Descubra mais sobre...` usa placeholder `Selecione` até escolha explícita do usuário.

## Fórum

- Rotas do fórum estão em `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`.
- A documentação funcional do fórum deve considerar `forumService.ts` e o SQL versionado em `supabase/forum-schema.sql`.
- No desktop, a busca do fórum deve preservar alinhamento com `Categorias` à esquerda e com a ação `Criar novo` à direita.
- `/forum/novo` usa categorias com título em duas linhas quando isso melhora a leitura e não deve duplicar o título interno `Novo tópico` se o header já cumpre esse papel.
- Menções com `@` em `/forum/novo` exibem sugestões compactas, filtráveis e posicionadas próximas ao ponto de digitação.
- `/forum/topico/:id` usa o container padrão das páginas internas e pode exibir coluna lateral de `Tópicos recentes` no desktop para equilibrar largura com `/forum`.
- Reações devem ficar disponíveis apenas no tópico principal; respostas não devem exibir botões de reação.
- Tópicos e respostas editados em `/forum/topico/:id` devem exibir badge `Editado` quando `updated_at` indicar alteração posterior à criação.

## Notificações, favoritos e busca

- Notificações usam rotas `/notificacoes` e `/ajustar-notificacoes`.
- O header desktop de mapas e páginas de membro abre `HeaderNotificationsDropdown` sem redirecionar imediatamente para `/notificacoes`.
- O rodapé do dropdown usa ações curtas com larguras equivalentes: `Ver todas` e `Preferências`.
- Favoritos usam `/meus-favoritos`.
- A busca global do header usa `HeaderGlobalSearch`, combinando resultados de pessoas e páginas via `globalSearchService`.
- Páginas internas que usam `MemberPageHeader` devem exibir as mesmas sugestões de busca de pessoas e páginas disponíveis na experiência de mapa.
- No mobile, dropdowns de busca e notificações devem ter camada superior a toolbars sticky, canvas da árvore, painéis e cards.
- O menu de avatar deve exibir primeiro e segundo nome no topo, subtítulo `Editar perfil`, área `Perfis gerenciados` quando aplicável e atalhos de dúvidas e saída sem sobrepor elementos sticky ou o botão flutuante `?`.
- As buscas/filtros dessas áreas devem ser documentadas como comportamento de UI, não como regra de banco, salvo quando o serviço correspondente existir.

## Meus dados

- O editor de redes sociais deve manter o perfil em digitação como rascunho editável até o usuário confirmar a adição.
- Não transformar rede social com uma única letra digitada em item finalizado.
- A área `Outros ajustes` não deve aparecer no mobile.
- O botão de foto no mobile deve usar `Adicionar foto`.
- O questionário `Sobre Mim` deve exibir Mini Bio e Curiosidades na tela final `Seu Perfil` dentro de `/meus-dados`, não em `/meus-vinculos`.

## Meus vínculos

- Cônjuges devem aparecer antes de filhos.
- A seção permanente de cadastro de pets deve ser substituída por modal acionado pela seção `Pets`.
- Filhos podem depender de cônjuge cadastrado quando o fluxo pedir o outro pai/mãe.
- Badges de pendência como `Em análise` devem aparecer para parentes adicionados ou removidos até aprovação.
- No mobile, modais de adicionar parentes não devem abrir teclado automaticamente nem travar ao trocar pessoa selecionada.

## Perfil de pessoa

- `/pessoa/:id` não deve exibir `Administração do perfil`; administração de responsáveis fica fora da página pública do perfil.
- O card `Irmãos` deve ficar oculto quando não houver irmãos cadastrados.
- `Discussões relacionadas` deve ficar abaixo da linha do tempo.
- O botão superior `Criar discussão sobre esta pessoa` não deve aparecer quando já houver CTA interno no estado vazio.
- Badges derivadas do questionário (`Personalidade`, `Família`, `Trabalho`, `Lugares`, `Momentos`, `Hobbies`, `Marcas pessoais`) não devem aparecer no perfil quando o contrato visual pedir ocultação.
- `Seu parentesco com ele` não deve aparecer quando a página estiver sendo vista pelo próprio usuário.

## Administração

- A administração usa `ProtectedRoute`.
- Rotas administrativas atuais estão listadas em `INVENTARIO_TECNICO.md`.
- O header das rotas `/admin/*` deve exibir apenas `Painel Administrativo`, `Principal` e o menu do usuário; links administrativos secundários ficam nas páginas correspondentes, não no header global.
- `/admin` deve exibir contagens dos cards superiores, incluindo `Relações`.
- O card `Solicitações de Aprovações` deve encaminhar para `/aprovacoes` ou `/admin/aprovacoes`.
- Na área de WhatsApp do admin, o código de convite não deve ser envolvido por asteriscos.
- A ação rápida `Conteúdo de Pessoas` deve aparecer como `Textos automáticos`.
- `/admin/home` deve permitir salvar configurações nas abas depois que as configurações carregarem.
- `/admin/notificacoes` deve exibir labels, badges, canais, status, frequências, categorias e disponibilidade em linguagem humana, sem slugs crus na interface.
- `/admin/relacionamentos` deve permitir filtrar por todos, casamentos ou filiações, buscar por pessoa de origem/destino e ocultar a classificação legada `sangue`/`adotivo` da UI.
- `/admin/relacionamentos/novo` exibe status conjugal inferido, força inatividade quando há separação e bloqueia combinações contraditórias.
- `/admin/aprovacoes` não deve exibir `Subtipo: sangue` nem `Subtipo: adotivo`, preservando tecnicamente o campo para valores futuros.
- `/admin/responsaveis` usa `person_responsible_links` para o seletor inline de responsáveis em perfis legados e crianças.
- `/admin/duvidas` usa `AdminDuvidasRefined`, com listagem sem slugs visíveis, filtros abaixo do título da seção e ações compactas por ícone.
- `/admin/atividades` usa tabela com colunas `Data`, `Autor`, `Atividade` e `Resumo`; o botão `Limpar` zera apenas a lista local exibida, sem apagar banco.
- `/admin/gestao-conteudo-pessoas` deve manter labels, botões, mensagens e títulos em UTF-8 válido, com acentuação correta.
- Documentação de admin deve citar apenas rotas existentes em `src/app/routes.tsx`.
