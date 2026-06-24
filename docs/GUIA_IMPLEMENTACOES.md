# Guia de implementações

> Última revisão: 2026-06-24
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

## Alternância de visualização

- `/mapa-familiar` e `/mapa-familiar-horizontal` compartilham `Home`.
- `treeViewMode.ts` converte rota em modo de visualização.
- A query `pessoa` é preservada ao trocar entre modos.
- O seletor de visualização deve manter texto em UTF-8 válido; correções defensivas de mojibake não substituem a manutenção correta dos textos de origem.

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

## Curiosidades

- `/curiosidades` carrega blocos exploratórios a partir de pessoas, relacionamentos e badges de perfil.
- A página é orquestrada por `Curiosidades.tsx`, que define a composição de Hoje, Fotos, IA, Quiz, Mural, Rankings, Gráficos, Gerações, Relacionamentos, Rota e abas inferiores.
- A barra de navegação interna é sticky e usa âncoras para seções existentes; no mobile, a rolagem horizontal é controlada por botões laterais.
- Os cards numéricos superiores foram removidos da composição final da página e não devem ser reintroduzidos sem decisão explícita.
- `CuriosidadesPhotoSlider` usa `foto_principal_url` de pessoas humanas, limita a lista de fotos e alterna entre miniaturas desktop e uma foto por vez no mobile.
- `CuriosidadesAiSection` monta contexto por `buildAiTreeContext`, usa sugestões rápidas e envia perguntas para `/api/ai` quando a página possui dados carregados.
- O placeholder da pergunta da IA é curto e específico: `Faça aqui sua pergunta…`.
- `CuriosidadesQuizSection` usa `buildCuriosityQuizQuestions`; as opções são montadas por utilitários em `curiosidadesUtils.ts` e devem evitar listas com poucos candidatos.
- O quiz deve exibir até seis opções quando houver dados suficientes e usar primeiro e segundo nome nos botões.
- `CuriosidadesMemoryWall` publica lembranças via `memoryWallService`, usando o usuário autenticado como autor e visibilidade familiar fixa.
- `CuriosidadesCharts` concentra aniversários por mês, profissões e faixa etária, com componentes visuais próprios para cada tipo de gráfico.
- `CuriosidadesGenerations` exibe categorias recolhidas inicialmente, com contador por categoria e expansão manual para usuários.
- `CuriosidadesCouples` calcula uniões ativas, idade média ao casar e faixa de idade a partir de relacionamentos e datas disponíveis.
- Bodas exibem apenas marcos exatos permitidos para casais ativos, sem separação registrada e sem pessoas falecidas.
- `CuriosidadesRouteSection` usa uma rota editorial rodoviária fixa, com distância total e distâncias entre cidades.
- `CuriosidadesInsightTabs` concentra descoberta, conexão, comparação de interesses e astrologia em um único card com abas e hash de URL.
- Seletores que dependem de pessoa devem evitar item Radix com `value` vazio.
- A seção `Descubra mais sobre...` usa placeholder `Selecione` até escolha explícita do usuário.

## Fórum

- Rotas do fórum estão em `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`.
- A documentação funcional do fórum deve considerar `forumService.ts` e o SQL versionado em `supabase/forum-schema.sql`.
- No desktop, a busca do fórum deve preservar alinhamento com `Categorias` à esquerda e com a ação `Criar novo` à direita.

## Notificações e favoritos

- Notificações usam rotas `/notificacoes` e `/ajustar-notificacoes`.
- O header desktop de mapas e páginas de membro abre `HeaderNotificationsDropdown` sem redirecionar imediatamente para `/notificacoes`.
- O rodapé do dropdown usa ações curtas com larguras equivalentes: `Ver todas` e `Preferências`.
- Favoritos usam `/meus-favoritos`.
- As buscas/filtros dessas áreas devem ser documentadas como comportamento de UI, não como regra de banco, salvo quando o serviço correspondente existir.

## Administração

- A administração usa `ProtectedRoute`.
- Rotas administrativas atuais estão listadas em `INVENTARIO_TECNICO.md`.
- Documentação de admin deve citar apenas rotas existentes em `src/app/routes.tsx`.
