# Guia de implementações

> Última revisão: 2026-06-26
> Escopo: comportamento implementado na branch `main`.
> Status: canônico.

## Rotas e carregamento

- `src/app/routes.tsx` define lazy loading para páginas públicas, de membro, de árvore e administrativas.
- O fallback de rota exibe estado de carregamento.
- Erros de chunk ou asset JS disparam tentativa controlada de reload com chave de sessão.
- A rota raiz redireciona para `/mapa-familiar`.

## Mapa familiar

- `Home.tsx` carrega pessoas e relacionamentos via `dataService`.
- O cache de árvore é segmentado por usuário e pessoa vinculada.
- Mudanças de dados invalidam cache via `treeDataCache`.
- A pessoa de referência usa, em ordem, query string, foco atual, pessoa vinculada ou primeira pessoa disponível.
- Filtros de parentes diretos são persistidos por usuário.
- Filtros de vida/pet afetam a visibilidade e os contadores.
- O painel desktop usa `DesktopTreeVisualizationPanel` para visualização, tema, filtros e exportação.
- Ajustes visuais específicos do painel desktop ficam centralizados em `src/styles/desktop-tree-panel-frente-a.css` e devem ser conferidos em conjunto com `src/styles/index.css`.
- O mapa desktop por grupos usa `DesktopFamilyMapView`; alterações de alinhamento dos grupos devem preservar a posição de pai/mãe e a leitura geracional.
- A renderização de cards em grupos usa `FamilyTreeVisualCards`; a ordenação visual deve evitar linhas desnecessárias quando houver pares conjugais no grupo.
- O subtipo legado `sangue` não deve ser reintroduzido nos formulários de relacionamento.

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
- `Imagem`, `PDF` e `Imprimir` mantêm feedback visual de preparação durante operações pesadas.
- Quando o fluxo de exportação abrir janela/aba dedicada para salvar ou imprimir, ele não deve substituir a página de trabalho atual do usuário.
- Overlays e mensagens de exportação devem permanecer em UTF-8 válido e não devem aparecer no artefato exportado.

## IA

`api/ai.ts` implementa:

- perguntas sobre árvore com contexto JSON limitado;
- geração de `minibio` e `curiosidades` quando `purpose === "profile_text"`;
- validação de payload mínimo;
- uso de `OPENAI_API_KEY`;
- modelo padrão `gpt-4.1-mini`, sobrescrevível por `OPENAI_MODEL`;
- resposta JSON estrita para geração de textos de perfil;
- limite de 500 caracteres por campo gerado.

## Dados e Supabase

- `dataService.ts` centraliza pessoas e relacionamentos.
- Campos de privacidade são normalizados no carregamento.
- Erros de Supabase são convertidos em mensagens técnicas mais legíveis.
- Alterações relevantes criam log de atividade quando o serviço aplicável faz essa chamada.
- Vínculos de membro são tratados por `memberProfileService`.
- Badges selecionadas do questionário de perfil usam RPC versionada quando disponível e fallback no serviço quando a RPC não estiver aplicada no ambiente remoto.
- `personVisibilitySettingsService.ts` deve retornar defaults locais quando a tabela `person_visibility_settings` não estiver disponível no schema remoto, evitando quebra da página administrativa correspondente.

## Curiosidades

- `/curiosidades` carrega blocos exploratórios a partir de pessoas, relacionamentos e badges de perfil.
- A página é orquestrada por `Curiosidades.tsx`, que define a composição de Hoje, Fotos, IA, Quiz, Mural, Rankings, Gráficos, Gerações, Relacionamentos, Rota e abas inferiores.
- A barra de navegação interna é sticky e usa âncoras para seções existentes; no mobile, a rolagem horizontal é controlada por botões laterais.
- Os cards numéricos superiores foram removidos da composição final da página e não devem ser reintroduzidos sem decisão explícita.
- `CuriosidadesPhotoSlider` usa `foto_principal_url` de pessoas humanas, limita a lista de fotos e alterna entre miniaturas desktop e uma foto por vez no mobile.
- `CuriosidadesAiSection` monta contexto por `buildAiTreeContext`, usa sugestões rápidas e envia perguntas para `/api/ai` quando a página possui dados carregados.
- O placeholder da pergunta da IA é curto e específico: `Faça aqui sua pergunta…`.
- `CuriosidadesQuizSection` usa `buildCuriosityQuizQuestions`; as opções são montadas por utilitários em `curiosidadesUtils.ts`, variam candidatos quando há base suficiente e desambiguam homônimos.
- O quiz deve exibir até seis opções quando houver dados suficientes, usando nome curto sempre que possível e nome expandido quando necessário para diferenciar homônimos.
- `CuriosidadesMemoryWall` publica lembranças via `memoryWallService`, usando o usuário autenticado como autor, limite de 200 caracteres e exclusão restrita ao autor.
- `CuriosidadesCharts` concentra aniversários por mês, profissões e faixa etária, com componentes visuais próprios para cada tipo de gráfico.
- `CuriosidadesGenerations` exibe a primeira geração com pessoas expandida inicialmente; ao expandir outra, apenas a geração ativa permanece aberta.
- `CuriosidadesCouples` calcula uniões ativas, idade média ao casar e faixa de idade a partir de relacionamentos e datas disponíveis.
- Bodas exibem apenas marcos exatos permitidos para casais ativos, sem separação registrada e sem pessoas falecidas.
- `CuriosidadesRouteSection` usa uma rota editorial rodoviária fixa, com distância total e distâncias entre cidades.
- `CuriosidadesInsightTabs` concentra descoberta, conexão, comparação de interesses e astrologia em um único card com abas e hash de URL.
- `CuriosidadesInterestsSection` compara interesses usando dados do perfil e badges do questionário de `/meus-dados`, com pluralização correta de `ponto/pontos`.
- Seletores que dependem de pessoa devem evitar item Radix com `value` vazio.
- A seção `Descubra mais sobre...` usa placeholder `Selecione` até escolha explícita do usuário.

## Fórum

- Rotas do fórum estão em `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`.
- A documentação funcional do fórum deve considerar `forumService.ts` e o SQL versionado em `supabase/forum-schema.sql`.
- No desktop, a busca do fórum deve preservar alinhamento com `Categorias` à esquerda e com a ação `Criar novo` à direita.
- `/forum/novo` usa categorias com título em duas linhas quando isso melhora a leitura e não deve duplicar o título interno `Novo tópico` se o header já cumpre esse papel.
- Menções com `@` em `/forum/novo` exibem sugestões compactas, filtráveis e posicionadas próximas ao ponto de digitação.
- Tópicos e respostas editados em `/forum/topico/:id` devem exibir badge `Editado` quando `updated_at` indicar alteração posterior à criação.
- O campo de resposta do tópico deve manter avatar e textarea alinhados lado a lado.

## Notificações, favoritos e busca

- Notificações usam rotas `/notificacoes` e `/ajustar-notificacoes`.
- O header desktop de mapas e páginas de membro abre `HeaderNotificationsDropdown` sem redirecionar imediatamente para `/notificacoes`.
- O rodapé do dropdown usa ações curtas com larguras equivalentes: `Ver todas` e `Preferências`.
- Favoritos usam `/meus-favoritos`.
- A busca global do header usa `HeaderGlobalSearch`, combinando resultados de pessoas e páginas via `globalSearchService`.
- Páginas internas que usam `MemberPageHeader` devem exibir as mesmas sugestões de busca de pessoas e páginas disponíveis na experiência de mapa.
- As buscas/filtros dessas áreas devem ser documentadas como comportamento de UI, não como regra de banco, salvo quando o serviço correspondente existir.

## Meus dados

- O editor de redes sociais deve manter o perfil em digitação como rascunho editável até o usuário confirmar a adição.
- Não transformar rede social com uma única letra digitada em item finalizado.

## Administração

- A administração usa `ProtectedRoute`.
- Rotas administrativas atuais estão listadas em `INVENTARIO_TECNICO.md`.
- `/admin/relacionamentos/novo` exibe status conjugal inferido, força inatividade quando há separação e bloqueia combinações contraditórias.
- `/admin/duvidas` usa `AdminDuvidasRefined`, com listagem sem slugs visíveis, filtros abaixo do título da seção e ações compactas por ícone.
- `/admin/atividades` usa tabela com colunas `Data`, `Autor`, `Atividade` e `Resumo`; o botão `Limpar` zera apenas a lista local exibida, sem apagar banco.
- Documentação de admin deve citar apenas rotas existentes em `src/app/routes.tsx`.
