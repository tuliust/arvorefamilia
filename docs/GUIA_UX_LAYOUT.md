# Guia de UX e Layout - Árvore Família

> Última revisão: 2026-06-07  
> Revisão complementar: menu compartilhado, espaçamento da árvore, alianças e páginas auxiliares  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra as decisões consolidadas de experiência, layout, responsividade e comportamento visual do projeto **Árvore Família**.

Use este guia para orientar:

- ajustes de interface;
- revisão visual de telas;
- padronização de headers, containers e margens;
- comportamento da árvore em desktop, tablet e mobile;
- validação visual antes de lançamento;
- decisões de UX que não devem ser reabertas sem motivo técnico ou de produto.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventário funcional e técnico do que já foi implementado;
- `docs/GUIA_COMPONENTES.md`: catálogo técnico dos componentes reutilizáveis;
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma;
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap, pendências e backlog;
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`: comportamento específico da view Minha Árvore;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: legenda, conectores, painel lateral e filtros visuais;
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: seleção de área, PNG, PDF e impressão.

---

## 1. Princípios gerais de UX

O projeto deve manter uma experiência:

- clara para usuários familiares não técnicos;
- objetiva para administradores;
- visualmente estável entre telas;
- responsiva em mobile, tablet e desktop;
- segura quanto a permissões;
- conservadora em mudanças de layout de árvore, para evitar regressões visuais.

Princípios obrigatórios:

1. **Não esconder erro funcional com ajuste visual.**  
   Se uma tela quebra por dados, permissão ou service, corrigir a causa.

2. **Não resolver problema de layout alterando regra de negócio.**  
   Ajustes de Tailwind, scroll, largura e agrupamento não devem mudar payloads, RLS, migrations ou services.

3. **Mobile-first para telas comuns.**  
   Área do usuário, perfil, favoritos, notificações, calendário e fórum devem ser confortáveis em 320px+.

4. **Admin operável, não necessariamente perfeito, em mobile.**  
   O painel administrativo pode usar scroll horizontal controlado em listas/tabelas, mas formulários e ações críticas precisam continuar acessíveis.

5. **Árvore é uma superfície interativa própria.**  
   Pan, zoom, exportação, legenda e seleção de área devem ser tratados como experiência de canvas, não como página tradicional.

6. **Mudança visual não pode enfraquecer permissão.**  
   Botão escondido não substitui `ProtectedRoute`, RLS, RPC segura ou validação server-side.

---

## 2. Estrutura visual global

### 2.1 Stack visual

A UI usa:

- React;
- Vite;
- TypeScript;
- Tailwind;
- `lucide-react`;
- componentes locais em `src/app/components`;
- componentes de UI base em `src/app/components/ui`;
- React Flow para árvore.

Identidade visual predominante:

- fundo geral cinza claro;
- cartões brancos com bordas suaves;
- sombras discretas;
- botões arredondados;
- azul como cor principal de ação/estado ativo;
- estados de erro em vermelho;
- estados de alerta em âmbar;
- texto principal em tons de slate/gray.

### 2.2 Containers

As páginas internas usam container centralizado com largura máxima consistente.

Classe consolidada:

```txt
mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8
```

Essa classe é exportada como `PAGE_CONTAINER_CLASS` em:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Uso esperado:

- páginas internas devem usar `PAGE_CONTAINER_CLASS` para alinhar header e conteúdo;
- não criar variações locais de margem sem necessidade;
- evitar containers com `max-w` divergente em páginas de membro;
- preservar `min-w-0` em wrappers flex/grid para impedir overflow;
- conteúdo de usuário deve usar `break-words`;
- IDs, e-mails, URLs e valores técnicos longos devem usar `break-all`.

---

## 3. Headers e menu do usuário

### 3.1 Header da Home pós-login

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

Componente visual extraído:

```txt
src/app/pages/home/HomeHeader.tsx
```

A Home pós-login mantém header próprio porque concentra:

- nome da família;
- label da view atual;
- seletor de visualização da árvore;
- seletor compacto de paletas visuais da árvore;
- busca expansível;
- atalhos para curiosidades, fórum e calendário;
- menu do usuário com `UserProfileMenu variant="home-header"`;
- integração com estado da árvore.

Regras:

- não substituir o header da Home por `MemberPageHeader`;
- manter altura compacta;
- preservar busca expansível;
- preservar seletor de view;
- seletor de view deve navegar entre `/minha-arvore`, `/genealogia` e `/visao-completa` sem recarregar a página;
- abaixo das opções **Minha Árvore**, **Genealogia** e **Visão Completa**, o dropdown deve exibir três botões circulares de paleta: branco, laranja e marrom;
- a troca de paleta deve alterar apenas CSS variables/tokens visuais da árvore;
- a troca de paleta não deve alterar rota, `viewMode`, filtros, dados, permissão, Supabase ou regras de negócio;
- a escolha de paleta deve persistir em `localStorage`;
- search params existentes, especialmente `?pessoa=...`, devem ser preservados ao trocar view;
- botão **Ações** usa ícone `Printer`;
- no desktop, o botão pode exibir texto **Ações**;
- no mobile, o botão deve aparecer apenas como ícone;
- **Ações** abre painel/ação de informações, não uma terceira aba persistente na toggle principal;
- loading da Home deve usar **Buscando pessoas e relacionamentos...**;
- evitar ações que causem overflow horizontal;
- em breakpoints menores, esconder textos e priorizar ícones.

### 3.2 Menu do usuário no header da árvore

O header da árvore usa `UserProfileMenu` com variante compacta:

```tsx
<UserProfileMenu variant="home-header" />
```

Comportamento esperado:

- o botão no header mantém aparência compacta, com avatar/iniciais, texto **MENU**, nome e seta;
- ao clicar, abre o painel completo do `UserProfileMenu`, igual ao padrão das páginas internas;
- o antigo dropdown local `UserMenu` de `Home.tsx` não deve ser recriado;
- o painel deve ficar acima da árvore e do header;
- o cabeçalho do painel com avatar, nome e e-mail é clicável e leva para `/minha-arvore/editar`;
- o botão `X` fecha o menu sem navegar;
- o item **Editar notificações** não aparece mais;
- **Painel Admin** continua condicional para administradores;
- **Sair** deve manter o fluxo de logout e limpeza de estado/cache relevante.

### 3.3 Header das páginas internas

Arquivo principal:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Páginas internas padronizadas:

```txt
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

O header interno possui:

- ícone opcional;
- título;
- subtítulo;
- ações opcionais;
- layout responsivo em coluna no mobile e linha no desktop;
- `PAGE_CONTAINER_CLASS` para alinhamento;
- `UserProfileMenu` padrão com `variant="avatar"`.

Regras:

- usar `MemberPageHeader` para novas páginas internas de usuário/admin, salvo exceção justificada;
- ações do header devem usar `actions`;
- botões devem preservar foco visível;
- botões de header e ações internas não devem quebrar texto em duas linhas;
- ícones devem vir de `HEADER_ACTION_ICONS` quando já existirem ali;
- títulos e subtítulos devem usar textos curtos, pois são truncados em tela estreita.

### 3.4 Busca expansível no header da árvore

Rotas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Comportamento consolidado:

- botão de busca precisa ser clicável em toda a área visual;
- ao expandir, o campo usa placeholder **Buscar pessoa ou página...**;
- busca sugere pessoas e páginas;
- lista local de páginas inclui rotas recorrentes, como **Notificações** e **Ajustar Notificações**;
- busca oferece atalho para página completa de resultados;
- sugestões fecham ao clicar fora;
- sugestões fecham ao pressionar `Esc`;
- sugestões ficam acima da árvore e não usam fundo transparente.

Para sugestões de pessoas, a linha secundária segue:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Se faltar cidade ou data, exibir apenas a informação disponível. Se ambas estiverem ausentes, ocultar a linha secundária.

### 3.5 Camadas de dropdowns no header

O header da Home usa camada elevada para permanecer acima da árvore. Conteúdos em portal precisam ficar acima do header.

Regras consolidadas:

- `SelectContent` deve abrir acima do header;
- `DropdownMenuContent` deve abrir acima do header;
- `DropdownMenuSubContent` deve abrir acima do header;
- menus devem usar afastamento vertical suficiente para não parecerem encaixados sob a barra;
- sugestões de busca, menu do usuário e seletor de views não devem se sobrepor visualmente de forma indevida;
- botões circulares de paleta ficam dentro do `SelectContent` e devem manter clique/foco funcionais.

Padrão atual:

```txt
conteúdos Radix em portal -> z-[1000]
sideOffset padrão -> 8
```

---

## 4. Layout da Home e painel lateral

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

A Home pós-login é composta por:

- header no topo da viewport;
- área principal `main` com altura restante;
- painel lateral;
- área da árvore;
- modais globais da árvore.

Componentes visuais extraídos:

```txt
HomeHeader
HomeTreeSection
HomeMobileNav
SidebarPanelTabs
SidebarInfoPanel
DirectRelationKpiGrid
DirectRelativeFilterGrid
GenealogyFilterGrid
LifeStatusKpiGrid
HomeCuriositiesDialog
DiscoverResultCard
ContactInfo
ConnectionDiscoveryPanel
AiQuestionPanel
```

Regra de refatoração:

> A extração é incremental. Não mover estado principal, handlers complexos, chamadas Supabase ou regras da árvore para esses componentes sem nova revisão.

### 4.1 Painel lateral desktop

No desktop:

- painel aberto usa largura aproximada `w-80`;
- painel recolhido usa largura estreita, como `w-14`;
- botão de recolher/expandir deve ficar dentro ou junto ao painel;
- conteúdo interno do painel rola verticalmente;
- área da árvore ocupa o espaço restante.

Regra consolidada:

> Deve existir apenas um controle de expandir/recolher painel lateral. Não duplicar botão dentro da árvore.

### 4.2 Painel lateral mobile

No mobile:

- painel aparece como seção acima da árvore quando aberto;
- há botão para recolher;
- quando fechado, aparece botão de expandir sobre a área da árvore;
- conteúdo do painel deve ser legível e compacto;
- árvore continua ocupando o espaço restante;
- textos longos devem truncar ou quebrar sem gerar overflow horizontal.

### 4.3 Abas do painel lateral

O painel lateral organiza conteúdos por abas principais:

```txt
Filtros
Legendas
```

A aba **Informações** não deve aparecer na toggle principal. Ela é acionada pelo botão externo **Ações**.

A aba **Legendas** foi simplificada. Não deve exibir:

- subtítulo **Cores, linhas, anéis e modos da árvore**;
- label **Visualização atual**;
- card azul da view ativa;
- área **Views** no final;
- subtítulos dentro dos cards de Cards, Linhas e Anel de casamento.

Texto consolidado do status conjugal:

```txt
Em relacionamento
```

Além de legenda, `TreeLegend` também pode controlar filtros/camadas visuais reais:

- `visualLineFilters.parentChildHighlight`;
- `visualLineFilters.siblingHighlight`;
- `parentChildHighlight` respeita `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` respeita `edgeFilters.irmaos`;
- estado padrão desligado mantém o visual original.

---

## 5. Árvore: views e comportamento visual

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
```

Views existentes:

| View | Rota | Uso |
|---|---|---|
| Minha Árvore | `/minha-arvore` | Escopo em torno da pessoa central. |
| Genealogia | `/genealogia` | Escopo pessoal por gerações. |
| Visão Completa | `/visao-completa` | Base familiar completa por gerações. |

`/` redireciona para `/minha-arvore` preservando search params. As três rotas usam o mesmo shell `Home`, e a mudança de view deve alterar apenas a área principal da árvore e controles condicionados por `viewMode`.

### 5.1 Título fixo da árvore

O título da árvore deve ser renderizado apenas como overlay fixo em `FamilyTree.tsx`.

Textos atuais esperados:

```txt
A árvore de {primeiro nome}
Família de {primeiro nome}
Linha Genealógica de {primeiro nome}
```

Regras:

- não adicionar title node interno nos layouts;
- `directFamilyDistributedLayout.ts` não deve criar título principal da árvore;
- `genealogyColumnsLayout.ts` não deve criar título/subtítulo principal;
- labels de geração e grupo podem existir, mas não devem duplicar o título principal;
- o título deve ter pequeno espaçamento acima;
- o espaço entre título e cards deve ser controlado por constantes de `FamilyTree.tsx`;
- não usar `translate`, `transform`, `top` negativo ou manipulação de `.react-flow__viewport` para aproximar a árvore;
- CSS de polimento não deve reposicionar o canvas ReactFlow.

### 5.2 Viewport inicial

O viewport inicial separa:

- bounds usados para zoom/enquadramento visual;
- bounds usados para pan/arraste.

Regra consolidada:

- zoom inicial deve considerar cards reais (`personNode`) como base visual;
- elementos auxiliares não devem reduzir a árvore;
- labels, group boxes, legend nodes e anchors não devem comandar o zoom inicial;
- bounds de pan podem considerar mais elementos para permitir navegação segura;
- título fixo não participa do bounds da árvore;
- `FamilyTree.tsx` deve ser a fonte principal do espaçamento entre título, área visual e viewport.

### 5.3 Minha Árvore

A view **Minha Árvore** deve:

- carregar legível após login;
- não aparecer minúscula no centro;
- caber de forma equilibrada no container;
- usar bounds de cards reais;
- permitir zoom máximo perceptível;
- recentralizar apenas quando necessário;
- preservar layout de grupos diretos;
- manter filtros diretos e KPIs em sincronia com a pessoa central.

A view pode considerar altura para fit inicial, desde que isso não reduza a árvore a ponto de perder legibilidade.

Quando a pessoa central tiver árvore direta esparsa, sem pais, ancestrais ou grupos laterais visíveis, `/minha-arvore` pode usar enquadramento vertical mais curto e aproximar os grupos inferiores do card central.

Regras:

- compactação deve ser detectada por estrutura renderizável, não por nome de pessoa;
- árvores densas continuam com o layout distribuído atual;
- filtros de grupos e filtros de linhas não devem ser alterados;
- conectores e anchors existentes continuam comandados pelo layout lógico.

### 5.4 Alianças na Minha Árvore

Em `/minha-arvore`, marriage nodes podem usar variante visual própria:

```txt
visualVariant: 'direct-family'
```

Objetivo:

- tornar o ícone de alianças claramente visível dentro dos grupos diretos;
- preservar o estilo padrão já aprovado em `/genealogia`;
- não alterar dimensão lógica do nó;
- não alterar handles, edges, clique ou modal.

Critérios visuais:

- botão não deve parecer círculo vazio;
- ícone deve ter contraste suficiente;
- halo/borda podem ser usados para leitura;
- botão não deve cobrir texto dos cards;
- clique deve abrir o modal conjugal.

### 5.5 Genealogia

A view **Genealogia** deve:

- usar zoom por largura;
- não reduzir zoom por causa da altura total;
- iniciar no mesmo topo visual das demais views;
- manter largura visual equivalente a Minha Árvore;
- permitir que o usuário arraste/deslize para baixo quando houver muitos cards verticais;
- preservar labels de geração;
- preservar anéis conjugais e conectores ortogonais;
- manter variante padrão do anel/aliança;
- no mobile, oferecer navegação horizontal por gerações, com chips superiores e suporte a swipe lateral.

#### 5.5.1 Genealogia mobile por gerações

No mobile, a view **Genealogia** adota navegação horizontal por etapas:

```txt
Tataravós
Bisavós
Avós
Pais
Núcleo
Descendentes
```

Regras consolidadas:

- barra de chips aparece apenas em `/genealogia` mobile;
- chips ocupam a largura horizontal disponível da área da árvore;
- chips não exibem contagem numérica;
- geração ativa deve ter estado visual claro;
- toque/click em chip deve focar a respectiva geração;
- swipe lateral nos chips deve avançar ou voltar geração;
- chips focam/enquadram a geração, mas não removem as demais colunas do ReactFlow;
- ao reduzir zoom, usuário deve conseguir ver as demais colunas com cards reais;
- tela inicial deve focar a primeira geração renderizada com cards reais;
- se a pessoa central tiver tataravós conectados, a primeira coluna deve aparecer com esses cards;
- colunas sem cards não devem ser exibidas;
- labels `GERAÇÃO X` não devem ficar sobrepostos ao menu de chips;
- em Genealogia mobile, botões `+` e `-` podem ficar ocultos para evitar disputa de espaço com a barra;
- pan vertical e horizontal por touch deve continuar disponível na área da árvore.

A inferência de geração é regra de renderização em memória. Ela não deve alterar dados reais, migrations, RLS ou Supabase.

### 5.6 Visão Completa

A view **Visão Completa** segue a mesma regra de UX da Genealogia:

- zoom por largura;
- mesma posição inicial vertical;
- altura total não reduz zoom;
- navegação vertical por pan/arraste;
- base completa da família;
- sem título/subtítulo duplicado.

### 5.7 Pan e zoom

Controles esperados:

- botão `+`;
- botão `-`;
- scroll/pinch quando habilitados;
- pan por arraste quando permitido.

Regras:

- botões de zoom ficam no canto superior direito da área da árvore, por exemplo `right-4 top-4`;
- em Genealogia mobile, botões `+` e `-` podem ser ocultados;
- durante seleção de área, pan/zoom devem ser bloqueados;
- ao cancelar/concluir seleção, pan/zoom devem voltar;
- Genealogia e Visão Completa sempre precisam permitir pan vertical;
- Minha Árvore pode restringir pan quando está no zoom de fit;
- swipe nos chips de geração não deve bloquear pan/zoom do canvas fora da barra.

---

## 6. Layouts da árvore

### 6.1 Minha Árvore - layout distribuído

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Características:

- pessoa central destacada;
- grupos laterais paternos/maternos;
- pais, avós, bisavós e demais grupos;
- labels de grupo;
- caixas de agrupamento;
- anchors estruturais;
- edges estruturais;
- marriage nodes diretos com variante visual específica quando aplicável.

Regras de UX:

- grupos devem ter alinhamento visual estável;
- labels de grupo são permitidas;
- título geral da árvore não deve ser criado aqui;
- caixas e anchors não devem controlar zoom inicial;
- cards devem continuar clicáveis via `FamilyTree`;
- marriage nodes do layout direto devem receber `visualVariant: 'direct-family'`.

### 6.2 Genealogia/Visão Completa - layout por colunas

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Características:

- colunas por geração;
- cards ordenados por geração;
- ordenação por nascimento/nome;
- cônjuges próximos;
- anéis de casamento;
- conectores familiares ortogonais;
- labels de geração;
- suporte a filtros por geração;
- colunas vazias não devem ser renderizadas;
- espaçamento vertical entre cônjuges deve evitar sobreposição do anel.

Regras de UX:

- `COLUMN_TOP` define o início estrutural das colunas;
- labels de geração são permitidas;
- título/subtítulo principal não deve ser renderizado aqui;
- altura vertical pode exceder a viewport;
- usuário deve navegar por pan/arraste;
- conectores devem continuar legíveis mesmo com filtros ativos;
- em Genealogia, a primeira coluna com cards reais deve ser tratada como ponto inicial de leitura;
- no mobile, barra de gerações deve focar colunas reais, não colunas vazias.

---

## 7. Calendário Familiar

Rota:

```txt
/calendario-familiar
```

Arquivo:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Regras de UX:

- header deve exibir **Calendário**;
- subtítulo deve manter acentuação correta;
- categoria de confraternizações deve aparecer como **Reunião**;
- aria-label de filtros deve usar **Filtros do calendário**;
- título do evento no grid deve ser mais forte, como **Aniversário de Fábio** em negrito;
- descrição do evento, como **Faz 60 anos**, deve usar fonte menor;
- lista lateral/inferior pode manter nome completo;
- grid mensal não deve causar overflow horizontal;
- filtros por categoria devem permanecer clicáveis.

---

## 8. Notificações e preferências

Rotas:

```txt
/notificacoes
/ajustar-notificacoes
```

Arquivos:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
```

Regras de UX:

- `/notificacoes` deve exibir botão **Personalizar Notificações**;
- botão navega para `/ajustar-notificacoes`;
- ação **Marcar todas como lidas** permanece disponível;
- `/ajustar-notificacoes` deve exibir **Preferências**;
- painel interno deve exibir **Notificações**;
- toggles e lógica de preferências devem ser preservados;
- item **Editar notificações** não deve aparecer no menu global do usuário.

---

## 9. Edição do perfil

Rota:

```txt
/minha-arvore/editar
```

Arquivo:

```txt
src/app/pages/MinhaArvore.tsx
```

Regras de UX:

- página usa `MemberPageHeader`;
- avatar do topo é clicável;
- modal de foto permite visualizar, alterar, cortar e remover imagem;
- saída sem salvar deve exibir confirmação quando houver alterações pendentes;
- página não deve exibir preferências de notificação nem campo de edição de signo;
- botão **Trocar Senha** deve aparecer no card superior do perfil;
- botão **Trocar Senha** deve exibir estado **Enviando...** durante a solicitação;
- fluxo de troca de senha usa reset por e-mail e não participa do salvamento dos dados familiares.

---

## 10. Legendas visuais

Documentação específica recomendada:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Estado atual:

- legenda visual simplificada;
- modo compacto para painel lateral;
- modo não compacto preservado para uso futuro;
- sem descrição da view atual;
- sem seção Views;
- sem subtítulos internos nos itens;
- item **Em relacionamento** para união ativa.

Seções atuais:

- Cards;
- Linhas;
- Camadas extras, quando disponíveis;
- Anel de casamento;
- Cores dos grupos, quando houver altura útil.

Regras:

- legenda deve explicar o essencial, não repetir textos de tutorial;
- não deve bloquear pan/zoom;
- deve ser ignorada em exportações;
- não deve criar dependência com Supabase;
- não deve alterar cálculo de status conjugal;
- alterações de copy devem ser refletidas na documentação específica.

---

## 11. Exportação e seleção de área

Documentação específica recomendada:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

UX implementada:

- botão de seleção de área;
- overlay sobre a área visível da árvore;
- instrução **Arraste para selecionar uma área visível da árvore.**;
- retângulo de seleção;
- toolbar contextual para Salvar PNG, Salvar PDF, Imprimir e Cancelar;
- cancelamento por botão ou `Esc`;
- bloqueio temporário de pan/zoom durante seleção.

Regras:

- seleção mínima: 80 x 80px;
- limite de segurança: 12.000.000 pixels estimados;
- exportação opera sobre viewport visível, não árvore completa;
- controles ReactFlow, minimap, menus, overlay e legenda são ignorados;
- imagens externas sem CORS podem falhar com erro amigável;
- exportação não deve salvar no Supabase nem criar log persistido.

---

## 12. Modais, dialogs e overlays

Padrões:

- modais longos usam altura máxima e rolagem interna;
- em mobile, largura deve ser `calc(100vw - margem)`;
- botões internos que não salvam devem usar `type="button"`;
- overlays interativos devem impedir propagação quando necessário;
- modais administrativos devem manter ações destrutivas protegidas por confirmação;
- modais não devem esconder erros funcionais com fechamento automático.

Exemplos:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/pages/Home.tsx
```

---

## 13. Responsividade

Larguras obrigatórias de QA:

```txt
320px
375px
390px
430px
768px
desktop
```

Padrões obrigatórios:

- `min-w-0` em containers flex/grid;
- `break-words` para textos de usuário;
- `break-all` para IDs, e-mails, URLs e valores técnicos longos;
- botões em `w-full sm:w-auto` quando houver risco de overflow;
- headers com `flex-col gap-2 sm:flex-row`;
- listas/tabelas largas com `overflow-x-auto` contido;
- modais com `max-h` e scroll interno;
- cards empilhados no mobile;
- textos e botões truncados quando necessário.

Critérios gerais:

- sem overflow horizontal global indevido;
- ações principais acessíveis;
- menus operáveis;
- modais cabem ou rolam internamente;
- árvore utilizável em touch;
- legenda não bloqueia a árvore;
- admin operável em telas menores.

---

## 14. Padrões de conteúdo e microcopy

Diretrizes:

- títulos curtos;
- subtítulos informativos, mas não redundantes;
- botões com verbo claro;
- mensagens de erro orientadas à ação;
- evitar jargão técnico para usuário comum;
- preservar termos técnicos no admin quando necessário;
- manter arquivos-fonte em UTF-8.

Exemplos consolidados:

| Contexto | Texto |
|---|---|
| View principal | Minha Árvore |
| View genealógica | Genealogia |
| View completa | Visão Completa |
| Título da árvore | A árvore de {primeiro nome} |
| Título genealógico | Linha Genealógica de {primeiro nome} |
| Status conjugal ativo | Em relacionamento |
| Exportação | Selecionar área |
| Exportação PNG | Salvar PNG |
| Exportação PDF | Salvar PDF |
| Ações da árvore | Ações |
| Paletas da árvore | Branco, laranja e marrom |
| Loading da Home | Buscando pessoas e relacionamentos... |
| Busca | Buscar pessoa ou página... |
| Calendário | Calendário |
| Calendário - aniversário | Aniversário de PrimeiroNome / Faz X anos |
| Calendário - falecimento no grid | 44 anos de falecimento / Memória de Nome |
| Calendário - card Memória | 44 anos da morte de Nome |
| Preferências de notificações | Preferências / Notificações |
| Perfil | Trocar Senha |
| Notificações | Personalizar Notificações |

---

## 15. QA visual obrigatório após mudanças de layout

Antes de commitar ajuste visual relevante:

```bash
git status
npm run build
npm test
git diff --check
```

Quando houver mudança em árvore, painel ou responsividade:

```bash
npm run test:e2e
```

Checklist manual mínimo:

- abrir Home pós-login;
- testar Minha Árvore;
- testar Genealogia;
- testar Visão Completa;
- abrir/recolher painel lateral;
- abrir aba Legendas;
- usar zoom `+` e `-`;
- arrastar árvore;
- abrir menu do usuário pelo header da árvore;
- abrir menu do usuário por página interna;
- testar mobile estreito;
- testar exportação de área se algo afetou overlay/ReactFlow;
- garantir que usuário comum não vê ações admin.

Checklist específico do ciclo 2026-06-07:

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/minha-arvore/editar
/notificacoes
/ajustar-notificacoes
```

Validar:

- menu compacto da árvore abre painel completo;
- cabeçalho do menu leva para `/minha-arvore/editar`;
- botão `X` apenas fecha;
- item `Editar notificações` não aparece;
- alianças estão visíveis em `/minha-arvore`;
- alianças permanecem corretas em `/genealogia`;
- títulos da árvore não têm mojibake;
- nenhum card superior é cortado;
- calendário mostra título em negrito e descrição menor;
- **Trocar Senha** aparece;
- **Personalizar Notificações** navega corretamente;
- **Preferências** e **Notificações** aparecem com acentuação correta.

---

## 16. O que evitar

Não fazer:

- adicionar novo título dentro de layouts da árvore;
- usar altura total da Genealogia/Visão Completa para reduzir zoom inicial;
- usar `translate` em `.react-flow__viewport` para corrigir espaçamento do título;
- duplicar controles de painel lateral;
- recriar `UserMenu` local em `Home.tsx`;
- criar nova classe de container se `PAGE_CONTAINER_CLASS` resolver;
- alterar service/RLS/migration para correção visual;
- colocar legenda dentro da exportação;
- salvar estado visual transitório no banco;
- criar nova view de árvore sem documentar comportamento de zoom/pan;
- commitar arquivos de backup, `.bak`, patches temporários ou dumps;
- usar `window.location` para navegação interna quando `navigate` resolver;
- transformar ajuste de copy em alteração de regra de negócio.

---

## 17. Arquivos de referência

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

---

## 18. Manutenção documental

Este arquivo concentra decisões de UX e layout. Para evitar repetição:

- detalhes técnicos de componentes ficam em `docs/GUIA_COMPONENTES.md`;
- troubleshooting fica em `docs/GUIA_CORRECAO_ERROS.md`;
- estado implementado fica em `docs/GUIA_IMPLEMENTACOES.md`;
- exportação da árvore deve ser detalhada em `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- legenda/painel/conectores devem ser detalhados em `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- rotas e guards devem ficar em `docs/arquitetura/ROTAS_E_GUARDS.md`.

---

## 19. Registro de ajustes recentes - ciclo 2026-06-07

Frente documentada:

```txt
3f50694 fix: refine member navigation and page actions
```

Ajustes consolidados:

- `UserProfileMenu` unificado entre páginas internas e header da árvore;
- `variant="home-header"` preserva botão compacto no header da árvore;
- antigo `UserMenu` local não deve ser recriado;
- cabeçalho do menu global navega para `/minha-arvore/editar`;
- item **Editar notificações** removido do menu;
- botão **Personalizar Notificações** adicionado em `/notificacoes`;
- botão **Trocar Senha** adicionado em `/minha-arvore/editar`;
- títulos e microcopy corrigidos em calendário e preferências;
- `MarriageNode` ganhou variante `direct-family` para `/minha-arvore`;
- espaçamento do título da árvore deve ser controlado por `FamilyTree.tsx`, não por transform no ReactFlow.

Validação obrigatória em browser real continua recomendada quando o navegador interno/sandbox não conseguir abrir as rotas.
