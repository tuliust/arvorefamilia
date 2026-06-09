# Guia de UX e Layout - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico de decisões visuais, responsividade e padrões de interface, atualizado com a frente mobile recente.

## Objetivo

Este documento registra decisões consolidadas de experiência, layout, responsividade e comportamento visual do projeto **Árvore Família**.

Use este guia para orientar:

- ajustes de interface;
- revisão visual de telas;
- padronização de headers, containers, menus e margens;
- comportamento visual das views da árvore;
- responsividade mobile/tablet/desktop;
- microcopy e hierarquia visual recorrente;
- prevenção de regressões visuais.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventário funcional e técnico do que já foi implementado;
- `docs/GUIA_COMPONENTES.md`: catálogo técnico dos componentes e props;
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma;
- `docs/PLANO_PROXIMOS_PASSOS.md`: pendências reais e backlog;
- `docs/funcionalidades/*.md`: comportamento detalhado de cada funcionalidade;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: banco, migrations e operação Supabase.

---

## 1. Princípios gerais

| Princípio | Regra prática |
|---|---|
| Clareza para usuário familiar | Preferir termos humanos e ações explícitas. Evitar IDs técnicos e jargão de banco na UI pública. |
| Consistência visual | Reusar headers, containers, botões, cards e menus compartilhados. |
| Mobile-first em páginas comuns | Perfil, fórum, notificações, favoritos, calendário e edição do próprio perfil devem ser utilizáveis a partir de 320px. |
| Admin operável em mobile | Formulários e ações críticas precisam continuar acessíveis; tabelas podem usar scroll horizontal contido. |
| Árvore como canvas | Pan, zoom, seleção, exportação, legenda e paletas pertencem à experiência de canvas. |
| Permissão não é visual | Esconder botão não substitui `ProtectedRoute`, `MemberRoute`, `TreeAccessRoute`, RLS, RPC segura ou validação em service. |
| Ajuste visual não muda regra de negócio | Tailwind, espaçamento, scroll e responsividade não devem alterar payloads, Supabase, migrations, services ou RLS. |
| Sem correção agressiva no ReactFlow | Não usar `translate`, `transform`, `top` negativo ou manipulação direta de `.react-flow__viewport` para corrigir espaçamento da árvore. |
| Escopo visual explícito | CSS novo deve ser restrito por rota, container, data attribute ou seletor estrutural confiável para não vazar para outras telas. |

---

## 2. Estrutura visual global

### 2.1 Stack visual

A UI usa:

- React 18;
- Vite;
- TypeScript;
- Tailwind CSS;
- CSS complementar em `src/styles/`;
- componentes locais em `src/app/components`;
- componentes base em `src/app/components/ui`;
- `lucide-react`;
- ReactFlow para árvore;
- Radix UI em componentes base.

### 2.2 Identidade visual

| Elemento | Padrão |
|---|---|
| Fundo geral | Cinza claro (`bg-gray-50` / `bg-gray-100`) |
| Cards | Branco, borda suave, sombra discreta, cantos arredondados |
| Ação primária | Azul |
| Erro/perigo | Vermelho |
| Alerta | Âmbar |
| Sucesso | Verde/esmeralda |
| Texto principal | `gray/slate` escuro |
| Texto secundário | `gray-500/600` |
| Ícones | `lucide-react`, com tamanho consistente por contexto |

### 2.3 Containers

As páginas internas devem usar o container exportado por `MemberPageHeader.tsx`:

```txt
PAGE_CONTAINER_CLASS = mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8
```

Regras:

- alinhar header e conteúdo com o mesmo container;
- evitar `max-w` local divergente sem justificativa;
- manter `min-w-0` em wrappers flex/grid;
- usar `break-words` para conteúdo textual de usuário;
- usar `break-all` para e-mails, URLs, IDs e valores técnicos longos;
- usar `pb-24 md:pb-0` em páginas internas com navegação inferior mobile.

---

## 3. Headers, menus e navegação

### 3.1 Header da Home pós-login

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
```

A Home pós-login é o shell das views:

```txt
/minha-arvore
/genealogia
/visao-completa
```

O header da Home concentra:

- nome da família;
- label da view atual;
- seletor de visualização;
- seletor compacto de paletas;
- busca expansível;
- atalhos para curiosidades, fórum e calendário;
- menu do usuário;
- integração com estado da árvore.

Regras:

- não substituir o header da Home por `MemberPageHeader`;
- preservar altura compacta;
- preservar busca expansível;
- preservar search params ao trocar view, especialmente `?pessoa=...`;
- esconder textos e priorizar ícones em breakpoints menores;
- manter dropdowns e sugestões acima da árvore;
- evitar overflow horizontal;
- no mobile, o título deve priorizar identificação pessoal da árvore, como `Família de {primeiro nome}` quando houver pessoa vinculada.

### 3.2 Seletor de views e paletas da árvore

O seletor de view deve navegar entre:

```txt
Minha Árvore -> /minha-arvore
Genealogia -> /genealogia
Visão Completa -> /visao-completa
```

Paletas disponíveis:

| Paleta | Chave |
|---|---|
| Branca/padrão | `white` |
| Laranja | `orange` |
| Marrom | `brown` |

Regras:

- paletas alteram apenas CSS variables/tokens visuais;
- paletas não alteram rota, filtros, permissões, dados, Supabase ou regras de negócio;
- a escolha persiste em `localStorage`;
- a aplicação ocorre no `document.documentElement`;
- em desktop/tablet, o controle principal de paleta fica associado ao header da árvore;
- em mobile, a paleta também pode aparecer no menu do usuário via `MobileUserMenuPalettePortal`.

### 3.3 Menu do usuário

Arquivo principal:

```txt
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
```

Variantes:

| Contexto | Uso |
|---|---|
| Header da árvore | `<UserProfileMenu variant="home-header" />` |
| Páginas internas | `<UserProfileMenu />` |
| Mobile | Painel fixo com overlay escuro, navegação adaptada e linha de paleta |

Comportamento consolidado:

- variante `home-header` mantém botão compacto com avatar/iniciais, texto **MENU**, primeiro nome e seta;
- variante padrão é botão circular por avatar/iniciais;
- o painel aberto é compartilhado pelas duas variantes;
- o topo do painel, com avatar, nome e e-mail, navega para `/minha-arvore/editar`;
- o botão `X` fecha o painel sem navegar;
- item **Editar notificações** não existe no menu;
- **Painel Admin** aparece apenas para administradores;
- **Sair** limpa cache da árvore e executa logout;
- no mobile, o painel inclui bloco de visualização para alternar entre **Minha Árvore**, **Genealogia** e **Visão Completa**;
- no mobile, a linha **Cores da árvore** exibe botões circulares de paleta via portal.

Regra anti-regressão:

```txt
Não recriar dropdown local de usuário em Home.tsx. O menu deve continuar concentrado em UserProfileMenu.tsx.
```

### 3.4 Header das páginas internas

Arquivo principal:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Páginas internas devem usar `MemberPageHeader` salvo exceção justificada.

Elementos suportados:

- ícone;
- título;
- subtítulo;
- ações;
- `customActions`;
- `mobileCustomActions`;
- `UserProfileMenu`;
- navegação inferior mobile.

Regras:

- ações com ícone devem manter label acessível;
- botões icon-only devem preservar `aria-label`/`title`;
- ícones recorrentes devem vir de `HEADER_ACTION_ICONS`;
- títulos e subtítulos devem ser curtos;
- não quebrar botões de header em duas linhas;
- em mobile, ações específicas podem entrar em `mobileCustomActions`.

### 3.5 Navegação inferior mobile

`MemberPageHeader` renderiza navegação inferior fixa em mobile com:

```txt
Home
Calendário
Fórum
Favoritos
Notificações
```

Regras:

- páginas internas precisam reservar espaço inferior (`pb-24 md:pb-0`);
- o estado ativo deve considerar `/`, `/minha-arvore`, `/genealogia` e `/visao-completa` como **Home**;
- evitar elementos fixos concorrendo com essa navegação em mobile;
- modais e drawers devem considerar `safe-area-inset-bottom`.

### 3.6 Busca expansível no header da árvore

Arquivo principal:

```txt
src/app/pages/home/HomeHeader.tsx
```

Comportamento:

- placeholder: **Buscar pessoa ou página...**;
- sugere pessoas e páginas;
- páginas sugeridas incluem rotas recorrentes como **Notificações**, **Ajustar Notificações**, **Fórum** e **Calendário Familiar**;
- sugestões fecham ao clicar fora;
- sugestões fecham com `Esc`;
- botão **Ver todos os resultados** navega para `/busca?q=...`;
- sugestões devem ter fundo branco e sombra, nunca fundo transparente.

Linha secundária de pessoa:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Se faltar cidade ou data, exibir apenas o dado disponível. Se ambos estiverem ausentes, ocultar a linha secundária.

---

## 4. Views da árvore

### 4.1 Shell e superfície

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
```

Regras gerais:

- a árvore ocupa área de canvas dentro da viewport;
- pan e zoom internos do ReactFlow devem ser preservados;
- a página não deve gerar scroll externo quando a árvore já ocupa a viewport;
- overlays, botões e menus devem respeitar camadas acima do ReactFlow;
- ajustes visuais específicos de uma view não devem vazar para as demais;
- controles mobile fixos não devem competir com navegação inferior de páginas internas.

### 4.2 Minha Árvore

Escopo:

```txt
viewMode === 'minha-arvore'
```

Comportamento visual consolidado:

- layout em torno da pessoa central;
- bounds reais de cards `personNode` para evitar zoom inicial excessivamente pequeno;
- título **A árvore de {nome}** no desktop/tablet quando aplicável;
- no mobile, overlays textuais redundantes devem ficar ocultos;
- borda extra do card central removida;
- borda de status vivo/falecido preservada;
- linhas diretas, grupos e conectores respeitam filtros;
- anel conjugal usa `MarriageNode` com variante visual `direct-family` quando aplicável;
- esconder todas as linhas quando todos os filtros diretos estiverem desligados;
- desligar filtro de irmãos também oculta linhas de primos diretos quando necessário.

Não fazer:

- aplicar deslocamento vertical na `.react-flow__viewport`;
- corrigir espaçamento com `translate`;
- alterar regras de parentesco para resolver layout;
- propagar ajustes da Minha Árvore para Genealogia/Visão Completa sem teste específico.

### 4.3 Genealogia

Escopo:

```txt
viewMode === 'genealogia'
```

Comportamento:

- layout por gerações;
- inferência em memória de `manual_generation` a partir da pessoa central quando necessário;
- colunas vazias não devem ser renderizadas;
- cônjuges permanecem na mesma geração;
- pais sobem uma geração;
- filhos descem uma geração;
- a inferência não grava dados no Supabase;
- desktop/tablet preservam visão ampla com pan/zoom.

### 4.4 Visão Completa

Escopo:

```txt
viewMode === 'visao-completa'
```

Comportamento:

- usa base completa com layout por gerações;
- compartilha parte do padrão visual da Genealogia;
- em mobile, reutiliza navegação por chips/blocos;
- não deve herdar regras específicas de Minha Árvore;
- mantém todos os nodes renderizáveis; chips focam/enquadram, não filtram estruturalmente;
- ao entrar no mobile, não deve herdar indevidamente a geração ativa de `/genealogia`.

### 4.5 Chips mobile por geração/bloco

Arquivo principal:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
```

Aplicado em mobile para:

```txt
/genealogia
/visao-completa
```

Regras:

- chips horizontais aparecem no topo da área da árvore;
- labels devem ser humanos: **Tataravós**, **Bisavós**, **Avós**, **Pais**, **Núcleo** e **Descendentes**;
- chips não exibem contagem;
- toque no chip altera geração/bloco ativo;
- swipe lateral na barra avança/volta quando suportado;
- chips focam/enquadram a geração ativa;
- chips não removem nodes do ReactFlow;
- botões direcionais e zoom `+`/`-` antigos ficam ocultos quando os chips mobile estão ativos;
- título overlay da árvore fica oculto nesse modo para evitar sobreposição;
- a geração ativa deve resetar quando mudar `viewMode`, pessoa central ou conjunto de gerações disponíveis.

### 4.6 Título, viewport e zoom

Constantes de referência ficam em:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Regras:

- título da árvore é overlay fixo único;
- subtítulos internos de layout não devem voltar;
- **Minha Árvore** usa bounds de cards reais;
- **Genealogia** e **Visão Completa** usam zoom inicial por largura;
- altura total não deve reduzir excessivamente a escala em views por geração;
- se houver muitos cards verticalmente, o usuário deve conseguir arrastar/deslizar;
- ajustes de distância entre título e árvore devem ser feitos em constantes e cálculos de viewport, não em CSS agressivo.

### 4.7 Botões e painel de controle da árvore

Controles esperados no conjunto da experiência:

- zoom in;
- zoom out;
- pan direcional;
- reajuste/centralização;
- impressão;
- exportação PNG/imagem;
- exportação PDF;
- seleção de área;
- ocultar/exibir setas no mobile.

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/styles/mobile-tree-controls.css
```

Regras:

- controles devem ser acessíveis por `aria-label`;
- em mobile, os botões antigos `+` e `-` ficam ocultos;
- em mobile, um botão circular abre painel compacto de controles;
- o painel mobile aparece apenas nas rotas `/minha-arvore`, `/genealogia` e `/visao-completa`;
- a ação de ocultar/exibir setas altera apenas camada visual;
- exportação não deve capturar legenda, menus ou overlays marcados para exclusão;
- seleção de área deve ficar contida na superfície da árvore;
- desktop/tablet não devem ser alterados pelo portal mobile.

---

## 5. Cards, ícones e conectores da árvore

### 5.1 Cards de pessoa

Arquivo principal:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Padrões:

- card humano e pet devem ser visualmente distinguíveis;
- pet usa marcador com `Dog`;
- pessoa falecida pode ser inferida por `falecido`, `data_falecimento` ou `local_falecimento`;
- nascimento usa ícone `Star`;
- falecimento usa ícone `Cross`;
- linhas de nascimento/falecimento combinam data e local quando houver;
- textos devem tolerar ausência de dados;
- ações internas do card devem interromper propagação para não disparar clique no node;
- no mobile, não deve haver anel azul duplicado competindo com borda/status visual do card central.

### 5.2 Anel/botão conjugal

Arquivos principais:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Padrões:

- ícone `Blend`;
- tamanho visual de referência: `60px x 60px`;
- cor acompanha token de conector conjugal;
- clique abre modal conjugal;
- variante `direct-family` reforça halo, borda, sombra e stroke na Minha Árvore;
- Genealogia e Visão Completa preservam estilo padrão;
- IDs técnicos não devem aparecer para usuário final.

### 5.3 Cores e destaques de linhas

| Relação | Destaque |
|---|---|
| Cônjuges | Laranja/conector conjugal |
| Pais/filhos | Amarelo/dourado quando destaque ativo |
| Irmãos | Azul tracejado quando destaque ativo |
| Linhas diretas desativadas | Ocultas conforme filtros |
| Primos diretos | Podem ser ocultados junto ao filtro de irmãos |

Regras:

- destaques visuais não devem virar regra de negócio;
- filtros visuais não devem ser persistidos como dado de banco;
- mudanças de cor devem passar por tokens/paletas, não hardcode espalhado.

---

## 6. Painel lateral, filtros e legendas

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/SidebarInfoPanel.tsx
```

O painel lateral da árvore contém:

- aba **Filtros**;
- aba **Legendas**;
- ações/informações auxiliares conforme contexto.

Regras:

- manter apenas um controle visível de expandir/recolher;
- evitar botão flutuante duplicado de legenda;
- a legenda não é apenas informativa: quando recebe callbacks, controla filtros/camadas visuais;
- `TreeLegend` deve respeitar `edgeFilters` e `visualLineFilters`;
- elementos da legenda não devem aparecer na exportação;
- em mobile, painel deve priorizar legibilidade e não competir com chips de geração nem com o painel de controles da árvore.

---

## 7. Páginas internas e padrões por área

### 7.1 `/minha-arvore/editar`

Arquivo principal:

```txt
src/app/pages/MinhaArvore.tsx
src/styles/mobile-edit-profile.css
```

Padrões visuais consolidados:

- usa `MemberPageHeader`;
- não exibe botão **Sair** no header;
- botão **Trocar Senha** fica disponível conforme fluxo de Supabase Auth;
- foto é editada pelo avatar superior;
- botões duplicados **Alterar**/**Remover** foto não devem voltar no bloco de dados;
- card **FILHOS** conta apenas humanos;
- card **PETS** separa pets vinculados como filhos técnicos;
- tentativa de sair com alterações pendentes mostra **Deseja sair sem salvar os ajustes?**;
- arquivos históricos não devem ter título duplicado;
- estado vazio de arquivos usa botão compacto `+`;
- seção **Eventos da Vida** combina eventos derivados e manuais;
- em mobile, o cabeçalho do perfil deve manter nome em até duas linhas;
- em mobile, subtítulo do perfil começa abaixo da foto e alinhado à esquerda;
- em mobile, cards **Pais**, **Irmãos**, **Cônjuges**, **Filhos** e **Pets** ficam em uma linha compacta;
- em mobile, placeholders de **Mini bio** e **Curiosidades de Vida** devem ser menores e legíveis.

Regra de escopo:

```txt
O CSS mobile específico desta tela deve permanecer escopado por #minha-arvore-edit-form ou seletor equivalente.
```

### 7.2 `/pessoa/:id`

Arquivo principal:

```txt
src/app/pages/PersonProfile.tsx
```

Padrões:

- botão de favoritar aparece como botão redondo com ícone de estrela;
- botão **Editar** fica ao lado do favorito em formato redondo com ícone;
- botão **Editar** aparece apenas para admin, responsável pelo perfil ou própria pessoa vinculada;
- **Inserir Informações** deve respeitar permissão;
- dados ocultos por privacidade não devem aparecer por microcopy ou tooltip;
- WhatsApp só aparece quando houver telefone válido e permissão.

### 7.3 Admin de pessoas

Arquivos principais:

```txt
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
```

Padrões:

- botão de copiar ID deve ser icon-only ou compacto, com `title`/`aria-label`;
- **Resetar Perfil** deve exigir confirmação;
- ações destrutivas usam vermelho/perigo;
- formulários longos usam blocos reutilizáveis e grids mobile-first;
- dados conjugais e arquivos históricos devem manter hierarquia clara;
- IDs técnicos podem aparecer em admin, mas não devem poluir telas públicas.

### 7.4 Relacionamento conjugal

Arquivo principal:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

Padrões:

- modal com título centralizado;
- botão `X` alinhado;
- texto público em linguagem humana;
- subtítulo pode exibir período, data e local de cerimônia;
- botão **Inserir Informações** respeita permissão;
- arquivos históricos do relacionamento usam botão compacto `+` quando aplicável;
- `relacionamento_id` é detalhe técnico e não deve aparecer para usuário final.

### 7.5 Fórum

Arquivos principais:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
```

Padrões consolidados:

- `/forum/novo` não usa dropdown **Tipo**;
- categoria usa seleção única por botões/cards;
- categoria selecionada deve ter estado visual claro;
- dropdown de pessoas relacionadas possui busca interna;
- clique fora fecha dropdown;
- aviso **Digite @ para marcar alguém na publicação** aparece acima do conteúdo;
- menções `@Nome Completo` aparecem em negrito/link para `/pessoa/:id`;
- tópico usa badges pequenas/coloridas para categoria, tipo e status;
- autores exibem avatar ou fallback de iniciais;
- respostas não exibem **Marcar solução** nem **Ocultar** na UI final;
- reações usam ícones e cores;
- apenas uma reação por usuário/alvo deve ficar ativa.

### 7.6 Notificações

Arquivos principais:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
```

Padrões:

- `/notificacoes` é central/lista;
- `/ajustar-notificacoes` é página de preferências;
- central possui botão **Personalizar Notificações**;
- lista deve manter estados de loading, vazio e erro;
- item clicável deve deixar claro o destino;
- texto deve usar acentuação correta;
- tags/categorias devem ser curtas e não dominar o card.

### 7.7 Calendário familiar

Arquivo principal:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Padrões:

- título do header: **Calendário**;
- filtros mobile compactos aparecem acima do calendário;
- categorias desktop ficam na lateral/lista, não duplicadas no topo;
- filtros são clicáveis e usam `aria-pressed`;
- aniversário no grid mostra primeiro nome;
- lista inferior pode mostrar nome completo;
- idade de aniversário aparece como **Faz X anos**;
- falecimento pode usar linguagem de memória;
- Google Agenda aparece como card próprio; em mobile, pode ser aberto por ação compacta no header.

### 7.8 Favoritos

Arquivo principal:

```txt
src/app/pages/MeusFavoritos.tsx
```

Padrões:

- filtros/categorias devem refletir o que a implementação suporta;
- favorito de pessoa é a camada funcional confirmada;
- categorias futuras podem existir na UI, mas devem ser tratadas como evolução se não houver botão/fluxo real;
- cards de favoritos devem ter ação clara de abrir/remover;
- remoção deve ser segura e por usuário autenticado.

---

## 8. Responsividade

### 8.1 Larguras de referência

Testar, quando houver alteração visual relevante:

```txt
320px
375px
390px
430px
768px
desktop
```

### 8.2 Regras gerais

- usar layout mobile-first;
- preferir `flex-col` no mobile e `sm:flex-row`/`md:flex-row` no desktop;
- usar `w-full sm:w-auto` para botões principais em telas estreitas;
- usar `overflow-x-auto` contido em tabelas/listas largas;
- preservar `min-w-0`;
- evitar `h-screen` rígido quando houver header/footer fixos;
- usar `dvh` quando o comportamento mobile exigir altura real da viewport;
- modais longos precisam de `max-h` e rolagem interna;
- drawers e menus mobile devem considerar safe area.

### 8.3 Árvore no mobile

- `/minha-arvore` mantém canvas com pan/zoom;
- `/genealogia` e `/visao-completa` usam chips mobile por geração/bloco;
- controles concorrentes com chips podem ser ocultados;
- o painel mobile de controles concentra ações rápidas;
- header da árvore precisa manter ações prioritárias sem overflow;
- menu do usuário não deve cobrir permanentemente a navegação;
- overlays devem fechar com clique fora/ESC quando aplicável.

---

## 9. Modais, diálogos e overlays

Regras gerais:

- título visível e objetivo;
- botão de fechar com `aria-label`;
- foco e teclado preservados quando componente base suportar;
- conteúdo longo com rolagem interna;
- ações primárias e secundárias bem separadas;
- não exibir ID técnico em modal público;
- `DialogContent` deve respeitar largura mobile;
- overlays da árvore, menu e busca devem ter z-index compatível com ReactFlow;
- overlays de login/dica podem usar fundo escuro sem remover a página subjacente.

Modais recorrentes:

| Modal | Regra |
|---|---|
| Modal conjugal | Linguagem humana, título centralizado e arquivos históricos compactos |
| Saída sem salvar | Mensagem explícita: **Deseja sair sem salvar os ajustes?** |
| Upload/foto | Ação concentrada no avatar quando for edição do próprio perfil |
| Curiosidades | Cards legíveis, sem overflow e com cores distintas quando aplicável |

---

## 10. Microcopy e padronização de termos

| Usar | Evitar |
|---|---|
| pessoa | indivíduo, membro técnico |
| perfil | registro de pessoa quando estiver no contexto público/edição |
| usuário | conta autenticada |
| vínculo | ligação usuário-pessoa ou ligação familiar quando o contexto exigir |
| relacionamento | ligação familiar geral |
| relacionamento conjugal | casamento/união/separação/viuvez |
| arquivos históricos | anexos, documentos e imagens históricas |
| eventos da vida | eventos pessoais da timeline |
| fórum | mural/discussões quando for a funcionalidade formal |
| notificações | alertas/avisos internos |
| favoritos | itens salvos pelo usuário |
| Supabase | banco/auth/storage/functions |
| migrations | scripts versionados de schema |

Regras:

- manter acentuação correta em textos finais;
- evitar mojibake em títulos públicos;
- usar **Árvore**, **Calendário**, **Notificações**, **Preferências**, **Fórum**;
- botões devem começar com verbo quando executam ação;
- estados vazios devem explicar o que falta e qual ação possível;
- mensagens de erro devem ser úteis sem expor detalhe sensível.

---

## 11. Acessibilidade mínima

Regras obrigatórias:

- botões icon-only com `aria-label` e `title`;
- botões que abrem/fecham painel com `aria-expanded` quando aplicável;
- filtros toggle com `aria-pressed`;
- links de navegação com texto acessível;
- imagens com `alt` quando informativas;
- foco visível em ações;
- evitar depender só de cor para estado ativo;
- não usar elementos clicáveis sem `<button>`/`<a>` quando houver ação real.

---

## 12. Anti-regressão visual

Antes de alterar layout, verificar:

- `HomeHeader.tsx`;
- `UserProfileMenu.tsx`;
- `MobileUserMenuPalettePortal.tsx`;
- `MemberPageHeader.tsx`;
- `HomeTreeSection.tsx`;
- `FamilyTree.tsx`;
- `MobileTreeControlsPortal.tsx`;
- `PersonNode.tsx`;
- `MarriageNode.tsx`;
- `TreeLegend.tsx`;
- documento funcional correspondente em `docs/funcionalidades/`.

Checklist rápido:

- build não quebra;
- não há overflow horizontal em 320px;
- header continua clicável;
- menu abre acima da árvore;
- busca fecha corretamente;
- árvore mantém pan/zoom;
- painel mobile de controles aparece apenas nas rotas corretas;
- chips mobile não removem nodes;
- botão conjugal continua clicável;
- favoritos, fórum e notificações mantêm ações acessíveis;
- páginas internas não ficam cobertas pela nav inferior mobile;
- nenhuma alteração visual exigiu migration.

---

## 13. Onde documentar mudanças futuras

| Tipo de mudança | Documento principal |
|---|---|
| Estado implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Componente/props | `docs/GUIA_COMPONENTES.md` |
| Erro ou sintoma | `docs/GUIA_CORRECAO_ERROS.md` |
| Rota/guard | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Banco/migration | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Minha Árvore | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
| Genealogia/Visão Completa | `docs/funcionalidades/GENEALOGIA_VIEW.md` |
| Legenda/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Edição do próprio perfil | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` |
| Exportação da árvore | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Perfil/admin | `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` |
| Fórum | `docs/funcionalidades/FORUM.md` |
| Notificações | `docs/funcionalidades/NOTIFICACOES.md` |
| Calendário | `docs/funcionalidades/CALENDARIO_FAMILIAR.md` |
| Pendência real | `docs/PLANO_PROXIMOS_PASSOS.md` |

---

## 14. Observações finais

Este guia deve permanecer objetivo e visual. Não incluir:

- histórico longo de commits;
- checklist de execução de roadmap;
- detalhes extensos de schema;
- código de troubleshooting;
- duplicação de documentos funcionais.

Quando um ajuste visual já estiver melhor documentado em arquivo funcional específico, manter aqui apenas a regra geral e apontar para o documento correto.
