# Guia de implementações - Árvore Família

> Última revisão: 2026-06-11
> Local canônico: `docs/GUIA_IMPLEMENTACOES.md`
> Projeto: `tuliust/arvorefamilia`
> Status: guia canônico revisado contra o código atual com persistência de `pessoas.complemento`, IA/Curiosidades validada, Google OAuth em modo testes, Minha Árvore mobile segmentada, Mapa Familiar panorâmico, avatares visuais por `genero`, `/mapa-familiar` em busca/favoritos e migrations versionadas de `pessoas.genero` e `pessoas.complemento`.

## Objetivo

Este documento registra **o que já está implementado** no projeto **Árvore Família**, quais comportamentos estão consolidados e quais arquivos devem ser consultados para manutenção.

Este guia deve responder:

- o que existe hoje;
- qual é o comportamento esperado;
- quais decisões técnicas não devem ser reabertas sem motivo;
- onde está a documentação detalhada de cada tema.

Este guia **não** deve funcionar como:

- checklist de execução;
- roadmap;
- histórico longo de commits;
- manual de troubleshooting;
- documentação detalhada de cada tela.

Use também:

| Tema | Documento |
|---|---|
| Índice canônico | `docs/README.md` |
| Pendências reais e backlog | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Componentes, props e responsabilidades | `docs/GUIA_COMPONENTES.md` |
| UX, layout, responsividade e microcopy | `docs/GUIA_UX_LAYOUT.md` |
| Sintomas, erros e correções | `docs/GUIA_CORRECAO_ERROS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Estrutura de usuários, pessoas e banco | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Supabase, migrations e SQL legado | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Deploy e cache | `docs/operacao/DEPLOYMENT.md` |
| Funcionalidades específicas | `docs/funcionalidades/*.md` |

---

## 1. Estado consolidado do MVP

As frentes principais do MVP estão implementadas no escopo atual. Pendências visuais e funcionais antigas foram removidas deste guia por já terem sido finalizadas/validadas. Novas divergências encontradas durante revisão ou QA devem ser registradas em `docs/PLANO_PROXIMOS_PASSOS.md`.

| Frente | Estado atual | Observação de manutenção |
|---|---|---|
| Árvore familiar | Implementada | `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa` usam o shell autenticado da Home. ReactFlow continua em Minha Árvore/Genealogia/Visão Completa; Mapa Familiar usa HTML/CSS/SVG. |
| Minha Árvore | Implementada no escopo atual | Desktop/tablet usam ReactFlow + `directFamilyDistributedLayout.ts`; mobile usa `MobileFamilyTreeView.tsx` com malha 3×3, abas **Paterno/Central/Materno**, tela global de ancestrais acima da Central, tios nas laterais, primos abaixo dos tios, conectores HTML/CSS próprios e preview durante swipe. |
| Mapa Familiar | Implementado no escopo atual | `/mapa-familiar` usa `DesktopFamilyMapView.tsx` em desktop/tablet, `FamilyTreeVisualCards.tsx`, `FAMILY_MAP_LAYOUT`, conectores SVG por âncoras, grupos expansíveis, modo wide quando o painel lateral é colapsado, título ocultável por scroll, card central sem badge, zoom `Ctrl + scroll`, regras próprias de cônjuges e fallback mobile para `MobileFamilyTreeView.tsx`. |
| Genealogia | Implementada | Layout por gerações, chips mobile alinhados à base de gerações inferidas, inferência em memória quando necessário e reset mobile de geração ativa por view. Não deve herdar largura da Minha Árvore. |
| Visão Completa | Implementada | Layout por gerações/blocos, navegação mobile por chips calculados sobre a base inferida e reset de geração ao alternar views. Mantém padrão de cards das views por geração. |
| Perfil de pessoa | Implementado | Perfil público autenticado, dados pessoais, privacidade, arquivos, eventos, favoritos e sugestões. |
| Admin de pessoas | Implementado | Criação/edição, copiar ID e reset de perfil por RPC sem apagar relacionamentos. Existe migration de reforço para garantir a RPC no Supabase remoto. |
| Relacionamentos | Implementados | Admin altera dados reais; usuário comum envia solicitação/sugestão conforme permissão. |
| Relacionamento conjugal | Implementado | Modal público com texto humano, tempo verbal ativo/inativo, formulário de informações e arquivos históricos vinculados ao relacionamento. |
| Arquivos históricos | Implementados | Storage para novos arquivos, compatibilidade com base64 legado, categoria histórica e categorias específicas por contexto. |
| Dados próprios/endereço | Implementados | Formulários de dados próprios persistem `endereco` e `complemento` separadamente. `endereco` pode ser preenchido por Google Places; `complemento` guarda apartamento, bloco, torre, casa ou referência interna em `public.pessoas.complemento`. |
| Eventos da vida / timeline | Implementados no escopo atual | Eventos derivados e manuais existem; título redundante embutido é ocultado em `/minha-arvore/editar`; upload por evento, privacidade por evento e PDF ficam como evolução futura. |
| Astrologia/acontecimentos | Implementados no escopo atual | Perfil lê insights persistidos; geração/regeneração é ação admin/server-side. |
| WhatsApp no perfil | Implementado no frontend | Botão depende de telefone válido e permissão; não há WhatsApp Business API no MVP. |
| Grau de parentesco/vínculo | Implementado | Utilitário puro, testes unitários e integração em Home/perfil. Narrativas refinadas para pai/mãe, primos, tio/sobrinho e tutor de pet. |
| Curiosidades, conexão e IA | Implementadas e validadas no escopo atual | Modal de Curiosidades reúne abas informativas, descoberta de conexão familiar e painel de perguntas à IA. Respostas genealógicas usam contexto estruturado, regras de privacidade, fallback determinístico quando aplicável e tratamento controlado de erro. |
| Favoritos | Primeira camada implementada | Serviço suporta `entity_type`; UI real consolidada inclui favoritos de pessoa, tópicos de fórum, eventos pessoais, arquivos históricos e páginas presentes em `FAVORITE_PAGES`, incluindo `/mapa-familiar` como favorito de página. |
| Página de favoritos | Implementada | Lista, busca, filtros, remoção e cards inteiros clicáveis. O botão textual **Abrir conteúdo** foi removido; a lixeira não deve disparar abertura do card. |
| Fórum | Implementado no escopo atual | Categorias, tópicos, respostas diretas, menções, vínculos automáticos com pessoas mencionadas, avatares, favoritos e reações. Campo manual de Pessoas Relacionadas foi removido da criação/edição; `/forum/topico/:id` não exibe box de pessoa relacionada nem comentários aninhados na UI atual. |
| Reações do fórum | Implementadas | Uma reação por usuário/alvo, troca/remoção e constraint de unicidade em migration. |
| Notificações | Implementadas no escopo atual | Central, preferências, logs, dispatch interno/e-mail configurável e gatilhos de fórum/arquivos/vínculos. Cron externo fica operacional. |
| Calendário familiar | Implementado | Datas familiares, sidebar de categorias, filtros, ajustes mobile e integração operacional com Google Agenda quando configurada. Enquanto a autorização OAuth não for concedida, operar em modo Testing e cadastrar manualmente os e-mails autorizados no Google Cloud. A página `/entrar` não deve exibir o parágrafo promocional da integração sem nova decisão. |
| Home pública/legal | Implementada | `/entrar` funciona como home pública do app **Família Souza Barros**, login, primeiro acesso e aceite legal. O texto institucional deve apresentar a plataforma familiar privada; o parágrafo específico sobre Google Agenda foi removido do JSX da página de entrada. |
| Headers e menu | Implementados | Páginas internas usam `MemberPageHeader`; views da árvore usam `HomeHeader` com `UserProfileMenu`; menu mobile recebeu paleta por portal. |
| Paletas da árvore | Implementadas | `white`, `orange`, `brown` e `visual` por CSS variables e `localStorage`, incluindo exibição no menu mobile quando aplicável. |
| Exportação da árvore | Implementada no escopo atual | Seleção/exportação ReactFlow em PNG/PDF/impressão, painel mobile rápido e captura direta HTML/CSS/SVG do `/mapa-familiar`; exportação integral fica pós-MVP. |
| Navegação preservando contexto da view | Concluída tecnicamente | `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa` abrem `/pessoa/:id?voltar=...`; retorno e navegação entre parentes preservam a origem com fallback seguro. |
| Dívida CSS/layout da árvore | Parcialmente resolvida | Overrides mobile duplicados removidos; manutenção restante deve ser incremental e não bloqueia o MVP. |
| Deploy/cache | Implementado no escopo atual | `vercel.json` define fallback SPA e cache correto; `src/main.tsx` possui recuperação para erro de chunk dinâmico. Rotas `/api/*`, incluindo `/api/ai` quando ativa, devem ser preservadas fora do fallback SPA. |
| Responsividade | Implementada no escopo MVP | Ajustes mobile/tablet consolidados em layout, headers, árvore, fórum, calendário, perfil, modais e `/minha-arvore/editar`. |

---

## 1.1 Estado atual da Minha Árvore mobile segmentada

Estado implementado confirmado:

- `HomeTreeSection.tsx` renderiza `MobileFamilyTreeView` somente em mobile e somente para `treeViewMode === 'minha-arvore'`;
- `MobileFamilyTreeView.tsx` usa apenas três abas superiores internas: **Paterno**, **Central** e **Materno**;
- clicar em **Paterno** posiciona a malha em **Tios Paternos**; clicar em **Central** volta para a tela central; clicar em **Materno** posiciona em **Tios Maternos**;
- a experiência segmentada usa malha 3×3, com **Ancestrais globais** acima da Central, tios nas laterais e primos abaixo dos respectivos tios;
- a tela de ancestrais reúne ramo paterno e materno em duas colunas, com grupos de **Tataravós**, **Bisavós** e **Avós** quando houver pessoas;
- o antigo container externo único `Ancestrais Paternos/Maternos` foi removido do desenho mobile atual;
- tios usam cards compactos em telas laterais ampliadas;
- primos exibem todos os cards disponíveis, sem botão **Ver todos**, com duas colunas em 320px e três colunas a partir de 360px quando couber;
- telas com conteúdo maior que a altura útil usam rolagem vertical interna com padding inferior para não serem cobertas pela bottom navigation;
- conectores HTML/CSS do mobile ligam gerações de ancestrais, avós a Pai/Mãe, Pai/Mãe a tios e tios a primos;
- conectores entre ancestrais e Pai/Mãe ficam no mesmo contexto rolável da tela Central quando precisam acompanhar cards em `data-mobile-tree-scroll`;
- linhas horizontais de Pai/Mãe acompanham o scroll da tela Central;
- cards mobile exibem apenas o ano de nascimento/falecimento ao lado dos ícones, sem localidade;
- o card principal mobile não exibe badge **Você**;
- avatares mobile reutilizam `FamilyTreeVisualCards.tsx`, priorizando foto real e depois fallback visual por `genero` (`homem`, `mulher`, `pet`);
- primos não têm linha inferior, por serem fim de ramo;
- a navegação por swipe foi mantida e recebeu pré-visualização da tela vizinha durante o movimento por `dragOffset`/`touchMove`.

Pendências/atenções que permanecem como QA visual, não como backlog estrutural:

- validar visualmente 320px, 375px, 390px e 430px em navegador autenticado real;
- observar se o preview durante swipe não conflita com a rolagem interna de ancestrais/primos;
- revisar refinamentos finos de alinhamento dos conectores conforme dados reais de famílias maiores.

Essas mudanças são de UI/componente e não exigem migration.

---


## 1.2 Estado atual do Mapa Familiar

Estado implementado confirmado:

- rota autenticada `/mapa-familiar` protegida por `TreeAccessRoute`;
- `treeViewMode` técnico `mapa-familiar`;
- desktop/tablet renderizam `DesktopFamilyMapView.tsx`, sem ReactFlow;
- mobile usa `MobileFamilyTreeView.tsx` como fallback seguro, herdando conectores roláveis da tela Central, cards com apenas ano, card principal sem badge **Você** e avatares visuais por `genero`;
- dados vêm de `buildMobileFamilyTreeModel`, sem persistência ou alteração de backend;
- cards e grupos visuais vêm de `FamilyTreeVisualCards.tsx`;
- layout centralizado em `FAMILY_MAP_LAYOUT`, com configuração explícita de canvas, métricas, áreas, grupos e conectores;
- conectores principais são SVG e derivados de âncoras dos grupos;
- conectores internos de cônjuges são renderizados somente quando há relacionamento conjugal explícito;
- tios e primos laterais usam até 4 colunas, limite inicial de 8 cards e expansão por `+/-`;
- grupos com uma pessoa usam largura proporcional para reduzir espaço vazio;
- cônjuge principal aparece quando existir, independentemente do filtro **Cônjuges**;
- cônjuges de tataravós, bisavós e avós aparecem por padrão;
- cônjuges de tios, primos, sobrinhos, filhos e netos aparecem apenas quando o filtro **Cônjuges** está ativo;
- `Ctrl + scroll` controla zoom manual e não deve bloquear o scroll comum sem `Ctrl`;
- avatares visuais usam `pessoas.genero` quando disponível: `homem`, `mulher` e `pet`.

Pendências/atenções:

- validar visualmente grupos laterais de tios/primos em resoluções reais;
- manter a tipagem frontend de `Pessoa.genero` e a migration `20260611003558_add_genero_to_pessoas.sql` sincronizadas com os ambientes Supabase;
- decidir exportação HTML/SVG do Mapa Familiar;
- `/mapa-familiar` já está sincronizado com busca global e favoritos por meio de `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES`.

Documento funcional canônico:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```


### 1.3 Estado atual verificado do Mapa Familiar pós-refinamento visual

Estado implementado confirmado no código atual:

- `Home.tsx` mantém `sidebarOpen` e aciona revisão de layout quando o painel abre/fecha.
- `HomeTreeSection.tsx` recebe `sidebarOpen`, deriva `sidebarCollapsed` e repassa para `DesktopFamilyMapView`.
- `HomeTreeSection.tsx` mantém `familyMapHasScrolled` para ocultar o título quando a superfície do Mapa Familiar rola.
- `DesktopFamilyMapView.tsx` aceita `sidebarCollapsed` e `onScrollStateChange`.
- `DesktopFamilyMapView.tsx` usa `getFamilyMapLayout(false)` no modo base e `getFamilyMapLayout(true)` no modo wide.
- O modo wide usa canvas maior e áreas laterais/inferiores específicas, mantendo o wrapper centralizado.
- `DesktopFamilyMapView.tsx` passa `showLabel={false}` para a pessoa central.
- `DesktopFamilyMapView.tsx` usa `vitalMode="full"` em grupos quando `isWideLayout` é verdadeiro.
- `FamilyTreeVisualCards.tsx` implementa `VisualPersonAvatar` com prioridade para foto, depois `genero`, depois fallbacks legados.
- `Pessoa.genero` já está tipado em `src/app/types/index.ts`.
- `MobileTreeControlsPortal.tsx` reconhece `/mapa-familiar` como rota de árvore para controles mobile.
- `MobileFamilyTreeView.tsx` reutiliza `getVisualPersonCardData` e `VisualPersonAvatar` de `FamilyTreeVisualCards.tsx`.
- no fallback mobile, `birthYearLine` e `deathYearLine` são usados para exibir apenas anos nos cards.
- no fallback mobile, o card central não recebe `label="Você"`; labels como **Pai** e **Mãe** permanecem.

Observação de consistência com busca/favoritos:

- `src/app/services/globalSearchService.ts` cataloga `/mapa-familiar` para busca global como **Mapa Familiar**;
- `src/app/constants/favoritePages.ts` cataloga `/mapa-familiar` como página favoritável;
- o favorito de página usa a rota canônica `/mapa-familiar`, sem salvar zoom, filtros ou `?pessoa=...` como estado persistido.

Pendências que permanecem fora deste estado consolidado:

- manter a migration `20260611003558_add_genero_to_pessoas.sql` aplicada nos ambientes necessários;
- validar visualmente o modo wide com dados reais em navegador autenticado;
- decidir se exportação do Mapa Familiar deve capturar HTML/CSS/SVG de forma canônica;
- manter `/mapa-familiar` em `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES`.


## 2. Stack e arquitetura base

Stack em uso:

- React 18;
- React Router 7;
- Vite 6;
- TypeScript;
- Tailwind CSS 4;
- Supabase Auth;
- Supabase Postgres, RLS, RPCs e Storage;
- Supabase Edge Functions;
- `lucide-react`;
- ReactFlow/Dagre;
- `html2canvas` e `jspdf`;
- `react-easy-crop`;
- Vitest;
- Playwright.

Áreas implementadas no MVP:

- árvore familiar;
- perfil de pessoa;
- edição da própria árvore com redes sociais versionadas em `pessoa_social_profiles`;
- admin de pessoas;
- admin de relacionamentos;
- solicitações de vínculo/relacionamento;
- sugestões de informações de perfil e relacionamento conjugal;
- arquivos históricos;
- eventos da vida;
- fórum;
- notificações;
- calendário familiar;
- favoritos;
- insights persistidos;
- grau de parentesco;
- Curiosidades, descoberta de conexão familiar e IA assistida;
- exportação de área da árvore;
- paletas visuais da árvore;
- responsividade mobile/tablet;
- fallback e cache de SPA;
- página pública `/entrar` com texto institucional da plataforma, sem parágrafo específico sobre Google Agenda.

Regras de arquitetura:

- `supabase/migrations` é a fonte da verdade do schema.
- Scripts SQL soltos são históricos, diagnósticos ou operacionais.
- Ajustes visuais não devem criar migration.
- Mudanças de schema devem ser documentadas em `docs/operacao/MIGRATIONS_SUPABASE.md`.
- Detalhes de deploy/cache pertencem a `docs/operacao/DEPLOYMENT.md`.
- Detalhes de rotas/guards pertencem a `docs/arquitetura/ROTAS_E_GUARDS.md`.
- Detalhes funcionais pertencem aos arquivos em `docs/funcionalidades/`.

---

## 3. Rotas, acesso e guards

Documentação detalhada: `docs/arquitetura/ROTAS_E_GUARDS.md`.

Arquivos principais:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/contexts/AuthContext.tsx
```

Comportamento consolidado:

- `/` redireciona para `/minha-arvore`, preservando search params;
- `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa` usam `TreeAccessRoute` e renderizam `Home`;
- rotas de membro usam `MemberRoute`;
- rotas admin usam `ProtectedRoute`;
- `/admin/login` existe, mas não deve ser o caminho principal do menu de usuário;
- usuário comum não deve acessar rotas administrativas;
- o item **Painel administrativo** deve aparecer apenas para administradores;
- o cabeçalho clicável do menu do usuário navega para `/minha-arvore/editar`.

Rotas públicas:

```txt
/entrar
/termos
/privacidade
```

Rotas autenticadas de árvore:

```txt
/
/minha-arvore
/mapa-familiar
/genealogia
/visao-completa
/busca
```

Rotas autenticadas de membro:

```txt
/minha-arvore/editar
/meus-dados
/meus-vinculos
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum
/forum/novo
/forum/topico/:id
/forum/topico/:id/editar
```

Rotas administrativas:

```txt
/admin
/admin/login
/admin/dashboard
/admin/home
/admin/pessoas
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/admin/relacionamentos
/admin/relacionamentos/novo
/admin/importacao
/admin/migrar-dados
/admin/diagnostico
/admin/integridade
/admin/atividades
/admin/notificacoes
/admin/solicitacoes-vinculos
```

---

## 4. Home, headers, menu, paletas e controles mobile

Documentação detalhada:

- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- `docs/funcionalidades/GENEALOGIA_VIEW.md`.

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
src/main.tsx
```

Comportamento consolidado:

- Home pós-login é o shell das quatro views da árvore;
- `treeViewMode` é derivado da rota;
- troca de view preserva search params;
- header da árvore usa `HomeHeader`;
- páginas internas usam `MemberPageHeader`;
- menu do usuário usa `UserProfileMenu`;
- no header da árvore, `UserProfileMenu` usa variante `home-header` em desktop/tablet e padrão compacto no mobile;
- busca do header pesquisa pessoas e páginas;
- busca possui sugestões e rota completa `/busca`;
- seletor de view permite alternar entre **Minha Árvore**, **Mapa Familiar**, **Genealogia** e **Visão Completa**;
- seletor de paleta fica no dropdown de views em desktop/tablet;
- no mobile, paletas também aparecem no menu do usuário por `MobileUserMenuPalettePortal`;
- paletas `white`, `orange`, `brown` e `visual` são aplicadas por CSS variables no `document.documentElement`;
- paleta ativa é persistida em `localStorage`;
- paletas não alteram dados, permissões, Supabase, filtros ou grafo;
- `MobileTreeControlsPortal` concentra controles mobile da árvore nas rotas `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa`;
- o painel mobile permite zoom, reajuste, ocultar/exibir setas, exportação PDF/imagem e impressão;
- `/genealogia` e `/visao-completa` resetam a geração ativa ao alternar view, pessoa central ou conjunto de gerações disponíveis;
- em mobile, `HomeTreeSection` calcula as gerações disponíveis a partir da mesma base inferida repassada ao `FamilyTree`, evitando divergência entre chips e canvas;
- títulos desktop das views da árvore usam hierarquia maior e externa ao canvas, evitando duplicidade de título interno;
- na `/minha-arvore`, o botão de favorito da página fica próximo aos controles de zoom para reduzir dispersão no header;
- o painel lateral desktop usa ritmo visual ampliado em títulos, subtítulos, cards e ações, sem scroll vertical interno quando o conteúdo cabe na viewport.

Regras anti-regressão:

- não reintroduzir menu local antigo da Home;
- não usar `translate` ou deslocamento manual da camada `.react-flow__viewport` para corrigir espaçamento;
- não mover estado principal da Home para componentes de apresentação sem necessidade clara;
- não persistir preferência visual de paleta no banco sem decisão de produto;
- não deixar controles mobile aparecerem fora das rotas da árvore;
- não duplicar controles `+`/`-` antigos com painel mobile.

---

## 5. Pessoas, perfis, admin e privacidade

Documentação detalhada:

- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`.

Arquivos principais:

```txt
src/app/pages/PersonProfile.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/personProfileSuggestionService.ts
src/app/services/permissionService.ts
src/app/utils/personFields.ts
src/app/utils/googleAddress.ts
```

Comportamento consolidado:

- admin cria e edita pessoas;
- usuário edita os próprios dados conforme permissão;
- usuário sem permissão direta envia sugestão para revisão admin;
- `/admin/solicitacoes-vinculos` concentra solicitações de vínculo e sugestões de perfil;
- `/admin/pessoas` permite copiar o ID da pessoa;
- admin pode resetar perfil por RPC;
- reset remove foto de perfil, insights gerados e favoritos de pessoa;
- reset retorna flags de privacidade/contato e preferências de notificação para `true`;
- reset **não** remove relacionamentos familiares;
- dados de contato respeitam permissões de exibição;
- autocomplete de endereço usa Google Places quando houver chave configurada;
- sem chave ou em caso de falha do Google, o campo permanece como input normal.

Migrations/RPCs relacionadas:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260609193000_ensure_admin_reset_person_profile.sql
admin_reset_person_profile(target_pessoa_id uuid)
20260608143000_create_person_profile_suggestions.sql
```

Regras anti-regressão:

- usuário comum não deve alterar dado restrito diretamente;
- reset administrativo não deve apagar relacionamentos;
- dados sensíveis não devem ser expostos no perfil público;
- geração de IA/insights não deve ocorrer automaticamente no frontend;
- erro `PGRST202` em RPC indica ambiente remoto/schema cache desalinhado, não deve ser mascarado no frontend.

---

## 6. Pessoa falecida, locais e busca

Arquivos principais:

```txt
src/app/utils/personFields.ts
src/app/utils/search.ts
src/app/pages/admin/AdminPessoaForm.tsx
src/app/components/person/PersonDataView.tsx
```

Comportamento consolidado:

- pessoa pode ser marcada como falecida por `falecido`;
- `data_falecimento` ou `local_falecimento` também indicam falecimento;
- locais no Brasil usam padrão `Cidade/UF`;
- locais no exterior usam `Cidade (País)`;
- busca deve ignorar caixa e acentos;
- em relacionamento conjugal, falecimento de uma das pessoas força texto no passado.

Migrations relacionadas:

```txt
20260514130000_add_falecido_to_pessoas.sql
20260514133000_add_exterior_location_flags_to_pessoas.sql
```

---

## 7. Redes sociais e contato

Arquivos principais:

```txt
src/app/components/person/SocialProfilesEditor.tsx
src/app/services/pessoaSocialProfilesService.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/utils/whatsapp.ts
```

Comportamento consolidado:

- UI de redes sociais usa `SocialProfilesEditor` quando disponível e mantém fluxo compatível em `/minha-arvore/editar`;
- múltiplas redes sociais são carregadas e salvas em `pessoa_social_profiles` nas rotas de edição suportadas;
- campos legados em `pessoas` continuam por compatibilidade;
- primeiro perfil social pode ser sincronizado com campos legados;
- exibição no perfil respeita privacidade;
- botão de WhatsApp aparece apenas com telefone válido e permissão;
- número textual só aparece se `permitir_exibir_telefone = true`;
- WhatsApp Business API não faz parte do MVP.

Futuro:

- melhorias avançadas de UX para ordenação, destaque ou visibilidade por rede social somente se o uso real exigir;
- persistência de `Complemento` depende de decisão de produto, schema e tipagem;
- log seguro de clique e privacidade forte em banco/API ficam pós-MVP.

---

## 8. Eventos da vida e timeline

Documentação detalhada: `docs/funcionalidades/TIMELINE.md`.

Arquivos principais:

```txt
src/app/services/personEventsService.ts
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/utils/buildPersonTimeline.ts
src/app/components/Timeline/PersonTimeline.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MinhaArvore.tsx
```

Tabela principal:

```txt
public.person_events
```

Tipos suportados:

```txt
imigracao
chegada_brasil
mudanca
batismo
formatura
profissao
militar
religioso
memoria
outro
```

Comportamento consolidado:

- eventos pessoais podem ser criados/editados no escopo implementado;
- `/minha-arvore/editar` possui área **Eventos da Vida**;
- timeline combina fatos derivados e eventos manuais;
- em contexto embutido da edição, título redundante **Eventos automáticos e manuais** fica oculto;
- fontes derivadas incluem nascimento, falecimento, relacionamentos, filhos, arquivos históricos e eventos pessoais.

Migration relacionada:

```txt
20260514165000_create_person_events.sql
```

Fora do MVP:

- upload por evento;
- privacidade por evento;
- edição diretamente na timeline pública;
- exportação PDF da timeline/eventos.

---

## 9. Arquivos históricos e Storage

Documentação detalhada:

- `docs/operacao/STORAGE_MAINTENANCE.md`;
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- `docs/GUIA_COMPONENTES.md`.

Arquivos principais:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/components/FotoUpload.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

Comportamento consolidado:

- novas fotos principais usam bucket `person-avatars`;
- novos arquivos históricos usam bucket `historical-files`;
- novos arquivos não devem ser salvos como base64;
- base64/data URL legado permanece compatível;
- arquivos de pessoa usam `pessoa_id`;
- arquivos de relacionamento/casamento usam `relacionamento_id` e `pessoa_id` nulo;
- preview de imagem e PDF funciona quando possível;
- áreas compactas podem usar botão `+` com `aria-label`;
- arquivos existentes permitem editar título, ano, descrição e categoria histórica;
- usuário comum visualiza arquivos conforme permissões;
- admin gerencia arquivos via formulário/perfil;
- `ArquivosHistoricos` aceita `eventCategoryOptions` para restringir categorias por contexto.

Categoria histórica:

```txt
HistoricalFileEventCategory
ArquivoHistorico.categoria_evento
public.arquivos_historicos.categoria_evento
20260522121000_add_historical_file_event_category.sql
```

Valores aceitos:

```txt
certidao_nascimento
certidao_casamento
alistamento_militar
imigracao
divorcio
carreira_profissional
mudanca_cidade
certidao_obito
outro
```

No modal conjugal, categorias exibidas:

```txt
certidao_casamento
divorcio
outro
```

Regras operacionais:

- `20260522121000_add_historical_file_event_category.sql` é pré-requisito para ambientes que recebem `categoria_evento`;
- não remover `categoria_evento` do payload para mascarar ambiente remoto desatualizado;
- não apagar base64 legado automaticamente;
- evitar uploads órfãos como evolução técnica de Storage.

---

## 10. Relacionamentos, vínculos e relacionamento conjugal

Documentação detalhada:

- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`;
- `docs/funcionalidades/MINHA_ARVORE_EDITAR.md`;
- `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`.

Arquivos principais:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/pages/admin/AdminRelacionamentos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/MeusVinculos.tsx
```

Comportamento consolidado:

- admin cria, edita e remove relacionamentos reais;
- usuário comum solicita criação, remoção ou correção;
- solicitação usa `relationship_change_requests`;
- aprovação aplica alteração real;
- rejeição não altera relacionamento real;
- dados conjugais incluem data/local de casamento, separação, status ativo e observações;
- observações internas aparecem apenas para admin;
- relacionamento conjugal pode ter arquivos históricos próprios;
- modal conjugal oculta IDs técnicos para usuário final;
- texto público usa linguagem humana;
- o título do modal conjugal usa:
  - “são casados” quando não há encerramento/separação, `ativo !== false`, subtipo não separado e ambos estão vivos;
  - “foram casados” quando há separação/fim, `ativo === false`, subtipo separado ou pelo menos uma pessoa falecida;
- botão **Inserir Informações** abre formulário textual com Informações, Data, Local e Outros;
- botão **+** em Arquivos Históricos abre área de upload com Arquivo, Título, Descrição, Ano e Categoria;
- categorias de arquivo histórico no contexto conjugal são Certidão de Casamento, Divórcio e Outro.

Migration relacionada:

```txt
20260513173000_create_relationship_change_requests.sql
```

Regra anti-regressão:

- usuário não-admin não deve alterar relacionamento real diretamente;
- modal conjugal não deve salvar antes da ação principal do fluxo;
- local inválido de casamento não deve impedir salvamento de dados pessoais;
- o botão **+** de Arquivos Históricos não deve abrir o modal de Inserir Informações.

---

## 11. Árvore, layouts, conectores, paletas e controles mobile

Documentação detalhada:

- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`;
- `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`;
- `docs/funcionalidades/GENEALOGIA_VIEW.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/buildTreeGraph.ts
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/styles/mobile-tree-controls.css
```

Modos de visualização:

| View | Escopo |
|---|---|
| `minha-arvore` | Layout próprio em torno da pessoa central. |
| `genealogia` | Escopo pessoal por gerações. |
| `visao-completa` | Base completa por gerações/blocos. |

Comportamento consolidado:

- conectores pais-filhos são ortogonais nas views por geração;
- cônjuges dos filhos não são tratados como filhos reais;
- conectores/aneis são filtrados conforme pessoas visíveis;
- anel/botão conjugal aparece entre cônjuges e abre modal;
- status visual do anel considera união ativa, separação/divórcio, viuvez ou indefinido;
- `/minha-arvore` aplica ajustes visuais próprios sem contaminar Genealogia/Visão Completa;
- cards centrais de pai, mãe, irmãos, sobrinhos, cônjuge, filhos, netos e pets possuem largura ampliada na Minha Árvore;
- cards compactos laterais/inferiores da Minha Árvore receberam ampliação visual recente para `360px`, com crescimento direcionado ao centro quando necessário;
- nomes longos nesses cards devem quebrar linha de forma controlada, sem reticências prematuras;
- grupos, labels e anchors da área central acompanham a largura ampliada;
- título da árvore é overlay único em `FamilyTree.tsx`;
- Genealogia e Visão Completa não devem renderizar título duplicado;
- pan/zoom interno do ReactFlow deve ser preservado;
- scroll externo da página deve ser bloqueado quando a árvore ocupa a viewport;
- em mobile, `/genealogia` e `/visao-completa` usam chips de navegação por gerações/blocos;
- chips focam/enquadram a geração ativa, mas não removem estruturalmente as demais colunas;
- botões de pan/zoom antigos podem ser ocultados em mobile quando os chips ou o painel mobile assumem a navegação principal;
- `MobileTreeControlsPortal` fornece painel compacto de ações em mobile nas rotas da árvore;
- paletas `white`, `orange`, `brown` e `visual` alteram apenas tokens visuais.

Regras anti-regressão:

- não usar deslocamento manual em `.react-flow__viewport`;
- não salvar filtros visuais como regra de negócio;
- não alterar nodes, edges, handles ou dimensões do botão conjugal sem QA visual;
- manter diferenças intencionais entre `/minha-arvore` e views por gerações;
- não permitir que largura ampliada ou overrides visuais da Minha Árvore afetem `/genealogia` ou `/visao-completa`;
- não duplicar controles mobile;
- não permitir que `/visao-completa` herde geração ativa obsoleta de `/genealogia`.

---

## 12. Painel lateral e legendas visuais

Documentação detalhada: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/utils/treeExport.ts
src/app/pages/Home.tsx
```

Comportamento consolidado:

- legenda aparece no painel lateral, aba **Legendas**;
- `TreeLegend` pode ser informativa e também controlar filtros/camadas visuais;
- camadas visuais incluem destaque de pais/filhos e irmãos;
- estado padrão desligado mantém visual original;
- botões de destaque respeitam filtros de linhas correspondentes;
- conteúdo da legenda deve permanecer objetivo;
- elementos da legenda devem ser ignorados na exportação quando marcados com `data-tree-legend`;
- versão administrativa/configurável da legenda não faz parte do MVP.

---


## 13. Curiosidades, conexão familiar e IA

Documentação detalhada: `docs/funcionalidades/CURIOSIDADES_E_IA.md`.

Arquivos principais:

```txt
src/app/pages/home/HomeCuriositiesDialog.tsx
src/app/pages/home/ConnectionDiscoveryPanel.tsx
src/app/pages/home/AiQuestionPanel.tsx
src/app/pages/home/homeCuriositiesUtils.ts
src/app/pages/home/homeAiContext.ts
src/app/utils/relationshipDegreeDisplay.ts
api/ai.ts
```

Comportamento consolidado:

- o modal **Curiosidades** concentra abas de exploração familiar a partir dos dados já carregados pela Home;
- tooltips de cidades em blocos como **Onde moram** e **Onde nasceram** devem ser estáveis e não provocar tremor/resize do modal;
- a aba **Qual a minha conexão com alguém?** compara duas pessoas e exibe título de parentesco, subtítulo narrativo e caminho familiar;
- narrativas de parentesco devem priorizar linguagem humana, como pai, mãe, irmão, primo, tio, sobrinho e tutor de pet;
- nomes longos nos cards da conexão devem quebrar linha sem truncamento prematuro;
- a aba **Pergunte à IA** usa contexto estruturado de pessoas, relacionamentos, cidades, gerações, irmãos e ancestrais;
- respostas sobre bisavós, nascidos por cidade, irmãos, pessoas mais antigas, cidades recorrentes e resumo genealógico podem usar fallback determinístico para reduzir alucinação;
- a IA não deve inferir condição financeira, saúde, orientação sexual, aparência, acusações, causa da morte não cadastrada ou dados privados sem base nos dados do sistema;
- IDs técnicos, UUIDs e detalhes internos não devem aparecer para o usuário final.

Regras anti-regressão:

- não enviar secrets de IA para o frontend;
- não expor dados ocultos por privacidade em resposta de IA;
- não inventar parentesco quando o grafo não sustentar a relação;
- não usar IA para gravar dados, alterar vínculos ou aprovar solicitações;
- não transformar respostas probabilísticas em dado cadastral;
- não deixar falha da IA quebrar o modal de Curiosidades.


## 14. Favoritos

Arquivos principais:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/components/favorites/HistoricalFileFavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/forum/ForumTopico.tsx
```

Tipos previstos no código:

```txt
person
historical_file
relationship
forum_topic
family_event
person_event
page
timeline_item
story
```

Estado consolidado:

- serviço suporta favoritos por `entity_type`/`entity_id`;
- metadados passam por sanitização para evitar dados sensíveis;
- UI de favorito de pessoa está implementada;
- tópico de fórum pode ser favoritado;
- arquivo histórico pode ser favoritado quando componente exibe a ação;
- `/meus-favoritos` possui listagem, busca, filtros, remoção e abertura de favoritos;
- cards de `/meus-favoritos` são clicáveis por inteiro quando possuem `href`;
- links internos devem navegar via SPA;
- links externos devem abrir em nova aba com `noopener,noreferrer`;
- cards clicáveis devem aceitar `Enter` e `Espaço`;
- botão de lixeira deve interromper propagação para não abrir o card;
- o botão textual **Abrir conteúdo** não faz parte da UI atual;
- a badge superior não usa ícone de coração;
- `forum_topic` deve aparecer como **Fórum** na badge visual;
- cada categoria visual de favorito pode ter cor própria para facilitar escaneabilidade;
- expansão para outras entidades deve ser estudada antes de alterar UI ou schema.

Regra anti-regressão:

- não gravar telefone, endereço, URL sensível, token, base64 ou dados longos em `metadata`;
- não reintroduzir rótulo duplicado inferior com ícone e tipo do conteúdo;
- não reintroduzir botão textual **Abrir conteúdo** sem decisão explícita de produto;
- não permitir que a lixeira dispare navegação do card.

## 15. Notificações

Documentação detalhada: `docs/funcionalidades/NOTIFICACOES.md`.

Arquivos principais:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/services/notificationDispatchService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
supabase/functions/send-notification-email/index.ts
supabase/functions/run-daily-notifications/index.ts
```

Comportamento consolidado:

- `/notificacoes` é a central/lista de notificações;
- `/ajustar-notificacoes` é a página dedicada de preferências;
- botão **Personalizar Notificações** na central navega para `/ajustar-notificacoes`;
- notificações internas são disparadas via services;
- preferências são respeitadas pelo dispatch;
- falha de notificação não deve impedir a ação principal;
- fórum dispara notificações internas para pessoas mencionadas, pessoas relacionadas e participantes conforme o evento;
- arquivos históricos e vínculos também possuem gatilhos de notificação;
- e-mail real depende de provider/secrets configurados;
- cron automático deve ser configurado fora do frontend e com segurança operacional.

Fora do MVP:

- push real;
- WhatsApp real;
- fila/retry avançado;
- painel operacional avançado de cron/retry.

---

## 16. Fórum

Documentação detalhada: `docs/funcionalidades/FORUM.md`.

Arquivos principais:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
src/app/types/index.ts
```

Comportamento consolidado:

- fórum possui categorias, tópicos, respostas diretas, reações, favoritos e estrutura técnica de denúncias/moderação;
- `/forum` deve listar tópicos com busca, filtro de categoria e botão icon-only para limpar filtros;
- filtros visuais de tipo e status foram removidos da home do fórum no desenho desejado;
- se dropdowns de tipo/status ainda aparecerem na UI, tratar como pendência real em `docs/PLANO_PROXIMOS_PASSOS.md`;
- cards da home do fórum exibem badge de categoria e badge **Fixado** quando aplicável;
- cards da home não exibem badges **Discussão** e **Aberto**;
- datas de cards e tópico usam formato contextual, como `Há XX min`, `Hoje, às HH:MM`, `Há XX horas` ou `Ontem, às HH:MM`;
- `/forum/novo` usa categoria por botões/cards de seleção única;
- em desktop, as 5 categorias aparecem em uma linha;
- campo manual **Pessoas Relacionadas** foi removido de `/forum/novo`;
- `/forum/topico/:id/editar` usa o mesmo padrão visual de cards de categoria;
- campo manual **Pessoa relacionada** foi removido da edição;
- conteúdo orienta uso de `@` para marcar pessoa;
- pessoas mencionadas por `@` são vinculadas automaticamente e podem receber notificação interna;
- dados legados de pessoa relacionada continuam preservados tecnicamente quando existentes;
- `/forum/topico/:id` usa estrutura visual de post/conversa com tópico principal, respostas diretas e campo único de resposta;
- `/forum/topico/:id` exibe apenas badge de categoria, normalizando **Dúvidas da Família** para **Dúvidas**;
- `/forum/topico/:id` não exibe badges de tipo/status, box **Pessoa relacionada**, botão `...` ou campo de comentário aninhado em resposta;
- autores exibem avatar ou fallback por iniciais;
- respostas não exibem ações antigas **Marcar solução** e **Ocultar**;
- reações usam ícones e labels finais:
  - **Amei** (`curtir`, `HeartHandshake`);
  - **Apoiar** (`apoiar`, `Handshake`);
  - **Orações** (`lembrar`, `Flower2`);
  - **Parabéns** (`celebrar`, `PartyPopper`);
- apenas uma reação por usuário/alvo é mantida;
- clicar na mesma reação remove;
- clicar em outra reação substitui.

Migration relacionada:

```txt
20260608180000_enforce_single_forum_reaction.sql
```

Regras anti-regressão:

- não reintroduzir dropdown manual de Pessoas Relacionadas em criação/edição sem decisão de produto;
- não reintroduzir dropdowns de tipo/status em `/forum` sem decisão explícita;
- não reintroduzir badges **Discussão** e **Aberto** em cards ou tópico;
- não reintroduzir box **Pessoa relacionada** em `/forum/topico/:id`;
- não reintroduzir campo de comentário aninhado em resposta sem redesenho de UX e documentação;
- não trocar `Flower2` por ícone inexistente;
- não remover constraint de unicidade de `forum_reacoes`;
- não interromper criação de tópico/resposta por falha de notificação.

## 17. Calendário familiar e Google Calendar

Documentação detalhada: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`.

Arquivos principais:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
```

Comportamento consolidado:

- calendário reúne datas familiares e eventos;
- categorias ficam na sidebar quando aplicável;
- categorias funcionam como filtros;
- contadores usam singular/plural;
- aniversário mostra primeiro nome no grid e nome completo na lista;
- idade aparece como **Faz X anos** em texto secundário;
- layout mobile possui filtros superiores compactos;
- card lateral de categorias pode ser ocultado no mobile quando prejudicar espaço.

Google Calendar:

- integração está versionada em migration;
- tokens devem ficar restritos a Edge Functions/service role;
- OAuth, sincronização e proteção de tokens exigem validação operacional quando a frente for priorizada;
- `/entrar` deve exibir diretamente no JSX o nome **Família Souza Barros** e a descrição institucional da plataforma, sem o parágrafo específico sobre Google Agenda;
- quando houver revisão OAuth, a finalidade da integração deve estar documentada em superfície pública adequada definida pelo produto/compliance, sem reintroduzir o parágrafo removido em `/entrar` sem decisão explícita.

---

## 18. Exportação da árvore

Documentação detalhada: `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/pages/Home.tsx
```

Comportamento consolidado:

- usuário pode selecionar área visível da árvore em fluxo padrão;
- exportação suporta PNG;
- exportação suporta PDF;
- impressão é suportada;
- mobile possui painel rápido de ações;
- exportação não usa Storage;
- exportação não cria migration;
- legenda/overlays auxiliares não devem aparecer no artefato exportado quando marcados para exclusão.
- `/mapa-familiar` usa `data-family-map-export-root="true"` e captura cards HTML/CSS, conectores SVG, grupos, pessoa central e escala visual atual;
- `data-tree-export-ignore="true"` exclui controles auxiliares;
- seleção retangular permanece exclusiva das views ReactFlow.

Fora do MVP:

- exportação da árvore completa fora da viewport;
- persistência/log de exportações.

Ponto técnico:

- manter alinhamento entre o fluxo padrão `treeExport.ts` e qualquer captura direta usada pelo portal mobile.

---

## 19. Deploy, cache e recuperação de chunks

Documentação detalhada: `docs/operacao/DEPLOYMENT.md` e `docs/GUIA_CORRECAO_ERROS.md`.

Arquivos principais:

```txt
src/main.tsx
vercel.json
vite.config.ts
api/ai.ts
```

Comportamento consolidado:

- SPA estática usa fallback para `index.html`;
- `index.html` deve ser servido sem cache forte;
- `/assets/*` pode usar cache longo por conter hash;
- `src/main.tsx` captura erros de dynamic import e faz reload controlado;
- erro de MIME `text/html` para `.js` geralmente indica HTML antigo apontando para chunk removido;
- `/api/ai` é rota serverless do provedor quando a frente de IA está ativa e deve permanecer protegida por secrets server-side;
- fallback SPA não deve capturar `/api/*`.

Regra anti-regressão:

- não cachear `index.html` como immutable;
- não remover recuperação de chunk sem validar deploy real;
- após alterações em lazy routes, testar `/forum`, `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa` em janela anônima.

---

## 20. Banco, migrations e objetos legados

Documentação detalhada: `docs/operacao/MIGRATIONS_SUPABASE.md`.

Regras permanentes:

- revisar `supabase migration list` antes de `supabase db push`;
- não aplicar SQL legado como schema principal de ambiente novo;
- usar `migration repair` apenas quando o schema remoto já refletir comprovadamente a migration;
- não criar migration para objeto legado sem consumidor runtime;
- não remover coluna/view legada sem dump recente, SQL de auditoria e QA;
- não commitar secrets, dumps, tokens, backups ou service role.

Migrations recentes relevantes:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260608143000_create_person_profile_suggestions.sql
20260608180000_enforce_single_forum_reaction.sql
20260609193000_ensure_admin_reset_person_profile.sql
```

Objetos legados/compatibilidade:

- `public.pessoas.arquivos_historicos`: compatibilidade até auditoria futura;
- `public.imagens_pessoa`: legado/migrations-only;
- `public.pessoas_com_estatisticas`: view remota legada sem uso runtime confirmado;
- SQLs antigos de fórum/Google Calendar devem ser tratados como legado quando já houver migration oficial.

---

## 21. Regras de segurança permanentes

Não deve acontecer:

- usuário comum acessar admin;
- usuário comum alterar relacionamento real diretamente;
- usuário comum alterar dado restrito sem permissão;
- perfil gerar IA automaticamente no frontend;
- e-mail real ser enviado sem provider, secrets e teste controlado;
- push/WhatsApp simularem envio real;
- dados novos serem salvos como base64;
- metadados de favoritos/notificações/logs salvarem dados sensíveis;
- `/admin/integridade` alterar dados sem decisão explícita;
- `supabase db push` ser usado sem revisar migrations;
- secrets entrarem no frontend ou no repositório;
- RLS liberar escrita indevida;
- título/subtítulo interno voltar a duplicar em Genealogia/Visão Completa;
- legenda, overlays ou controles auxiliares aparecerem indevidamente na exportação;
- filtros visuais serem persistidos como regra de negócio;
- cache de HTML antigo quebrar rotas lazy-loaded após deploy.

---

## 22. Manutenção documental

Este guia deve permanecer como inventário consolidado.

Onde documentar:

| Informação | Destino correto |
|---|---|
| Estado implementado resumido | `docs/GUIA_IMPLEMENTACOES.md` |
| Pendência, divergência, QA futuro ou backlog | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Comportamento detalhado de uma tela/funcionalidade | `docs/funcionalidades/*.md` |
| Componentes, props e responsabilidades | `docs/GUIA_COMPONENTES.md` |
| UX, responsividade e layout | `docs/GUIA_UX_LAYOUT.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Schema, migrations e SQL legado | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Deploy/cache | `docs/operacao/DEPLOYMENT.md` |
| Erro, sintoma e correção | `docs/GUIA_CORRECAO_ERROS.md` |
| Histórico de fase, diagnóstico ou QA antigo | `docs/historico/` |

Regras:

- não adicionar histórico longo de commits neste arquivo;
- não duplicar documentação funcional extensa;
- não manter pendências antigas já validadas;
- usar links cruzados para documentos específicos;
- atualizar este guia apenas quando o estado consolidado do produto mudar.
