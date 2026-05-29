# Guia de UX e Layout â€” Ãrvore FamÃ­lia

> Ãšltima revisÃ£o: 2026-05-29
> Local canÃ´nico: `docs/GUIA_UX_LAYOUT.md`
> Projeto: `tuliust/arvorefamilia`

## Objetivo

Este documento registra as decisÃµes consolidadas de experiÃªncia, layout, responsividade e comportamento visual do projeto **Ãrvore FamÃ­lia**.

Use este guia para orientar:

- ajustes de interface;
- revisÃ£o visual de telas;
- padronizaÃ§Ã£o de headers, containers e margens;
- comportamento da Ã¡rvore em desktop, tablet e mobile;
- validaÃ§Ã£o visual antes de lanÃ§amento;
- decisÃµes de UX que nÃ£o devem ser reabertas sem motivo tÃ©cnico ou de produto.

Este documento nÃ£o substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventÃ¡rio funcional e tÃ©cnico do que jÃ¡ foi implementado.
- `docs/GUIA_COMPONENTES.md`: catÃ¡logo tÃ©cnico dos componentes reutilizÃ¡veis.
- `docs/GUIA_CORRECAO_ERROS.md`: investigaÃ§Ã£o por sintoma.
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap, pendÃªncias e backlog.
- `docs/funcionalidades/MINHA_ARVORE_VIEW.md`: comportamento especÃ­fico da view Minha Ãrvore.
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: legenda, conectores, painel lateral e filtros visuais.
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: seleÃ§Ã£o de Ã¡rea, PNG, PDF e impressÃ£o.

---

## 1. PrincÃ­pios gerais de UX

O projeto deve manter uma experiÃªncia:

- clara para usuÃ¡rios familiares nÃ£o tÃ©cnicos;
- objetiva para administradores;
- visualmente estÃ¡vel entre telas;
- responsiva em mobile, tablet e desktop;
- segura quanto a permissÃµes;
- conservadora em mudanÃ§as de layout de Ã¡rvore, para evitar regressÃµes visuais.

PrincÃ­pios obrigatÃ³rios:

1. **NÃ£o esconder erro funcional com ajuste visual.**
   Se uma tela quebra por dados, permissÃ£o ou service, corrigir a causa.
2. **NÃ£o resolver problema de layout alterando regra de negÃ³cio.**
   Ajustes de Tailwind, scroll, largura e agrupamento nÃ£o devem mudar payloads, RLS, migrations ou services.
3. **Mobile-first para telas comuns.**
   Ãrea do usuÃ¡rio, perfil, favoritos, notificaÃ§Ãµes e fÃ³rum devem ser confortÃ¡veis em 320px+.
4. **Admin operÃ¡vel, nÃ£o necessariamente perfeito, em mobile.**
   O painel administrativo pode usar scroll horizontal controlado em listas/tabelas, mas formulÃ¡rios e aÃ§Ãµes crÃ­ticas precisam continuar acessÃ­veis.
5. **Ãrvore Ã© uma superfÃ­cie interativa prÃ³pria.**
   Pan, zoom, exportaÃ§Ã£o, legenda e seleÃ§Ã£o de Ã¡rea devem ser tratados como experiÃªncia de canvas, nÃ£o como pÃ¡gina tradicional.
6. **MudanÃ§a visual nÃ£o pode enfraquecer permissÃ£o.**
   BotÃ£o escondido nÃ£o substitui `ProtectedRoute`, RLS, RPC segura ou validaÃ§Ã£o server-side.

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
- React Flow para Ã¡rvore.

A identidade visual predominante usa:

- fundo geral cinza claro;
- cartÃµes brancos com bordas suaves;
- sombras discretas;
- botÃµes arredondados;
- azul como cor principal de aÃ§Ã£o/estado ativo;
- estados de erro em vermelho;
- estados de alerta em Ã¢mbar;
- texto principal em tons de slate/gray.

### 2.2 Containers

As pÃ¡ginas internas usam container centralizado com largura mÃ¡xima consistente.

Classe consolidada:

```txt
mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8
```

Essa classe estÃ¡ exportada como `PAGE_CONTAINER_CLASS` em:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

Uso esperado:

- pÃ¡ginas internas devem usar `PAGE_CONTAINER_CLASS` para alinhar header e conteÃºdo;
- nÃ£o criar variaÃ§Ãµes locais de margem sem necessidade;
- evitar containers com `max-w` divergente em pÃ¡ginas de membro;
- preservar `min-w-0` em wrappers flex/grid para impedir overflow;
- conteÃºdo de usuÃ¡rio deve usar `break-words` quando houver risco de texto longo;
- IDs, e-mails, URLs e valores tÃ©cnicos longos devem usar `break-all`.

---

## 3. Headers

### 3.1 Header da Home pÃ³s-login

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

Componente visual extraÃ­do:

```txt
src/app/pages/home/HomeHeader.tsx
```

A Home pÃ³s-login mantÃ©m header prÃ³prio porque concentra:

- nome da famÃ­lia;
- label da view atual;
- seletor de visualizaÃ§Ã£o da Ã¡rvore;
- busca expansÃ­vel;
- atalhos para curiosidades, fÃ³rum e calendÃ¡rio;
- `UserMenu`;
- integraÃ§Ã£o com estado da Ã¡rvore.

Regras:

- nÃ£o substituir o header da Home por `MemberPageHeader`;
- manter altura compacta;
- preservar busca expansÃ­vel;
- preservar seletor de view;
- seletor de view deve navegar entre `/minha-arvore`, `/genealogia` e `/visao-completa` sem recarregar a pÃ¡gina;
- search params existentes, especialmente `?pessoa=...`, devem ser preservados ao trocar view;
- botÃ£o **AÃ§Ãµes** usa Ã­cone `Printer`;
- no desktop, o botÃ£o pode exibir texto **AÃ§Ãµes**;
- no mobile, o botÃ£o deve aparecer apenas como Ã­cone;
- **AÃ§Ãµes** abre o painel/aÃ§Ã£o de informaÃ§Ãµes, nÃ£o uma terceira aba persistente na toggle principal;
- loading da Home deve usar **â€œBuscando pessoas e relacionamentosâ€¦â€**, sem â€œno Supabaseâ€;
- evitar aÃ§Ãµes que causem overflow horizontal;
- em breakpoints menores, esconder textos e priorizar Ã­cones.

### 3.2 Header das pÃ¡ginas internas

Arquivo principal:

```txt
src/app/components/layout/MemberPageHeader.tsx
```

PÃ¡ginas internas padronizadas:

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

- Ã­cone opcional;
- tÃ­tulo;
- subtÃ­tulo;
- aÃ§Ãµes opcionais;
- layout responsivo em coluna no mobile e linha no desktop;
- `PAGE_CONTAINER_CLASS` para alinhamento.

Regras:

- usar `MemberPageHeader` para novas pÃ¡ginas internas de usuÃ¡rio/admin, salvo exceÃ§Ã£o justificada;
- aÃ§Ãµes do header devem usar `actions`;
- botÃµes devem preservar foco visÃ­vel;
- botÃµes de header e aÃ§Ãµes internas nÃ£o devem quebrar texto em duas linhas;
- Ã­cones devem vir de `HEADER_ACTION_ICONS` quando jÃ¡ existirem ali;
- tÃ­tulos e subtÃ­tulos devem usar textos curtos, pois sÃ£o truncados em tela estreita.

---

## 4. Layout da Home e painel lateral

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

A Home pÃ³s-login Ã© composta por:

- header no topo da viewport;
- Ã¡rea principal `main` com altura restante;
- painel lateral;
- Ã¡rea da Ã¡rvore;
- modais globais da Ã¡rvore.

Componentes visuais extraÃ­dos:

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

Regra de refatoraÃ§Ã£o:

> A extraÃ§Ã£o Ã© incremental. NÃ£o mover estado principal, handlers complexos, chamadas Supabase ou regras da Ã¡rvore para esses componentes sem nova revisÃ£o.

### 4.1 Painel lateral desktop

No desktop:

- painel aberto usa largura aproximada `w-80`;
- painel recolhido usa largura estreita, como `w-14`;
- botÃ£o de recolher/expandir deve ficar dentro ou junto ao painel;
- conteÃºdo interno do painel rola verticalmente;
- Ã¡rea da Ã¡rvore ocupa o espaÃ§o restante.

Regra consolidada:

> Deve existir apenas um controle de expandir/recolher painel lateral. NÃ£o duplicar botÃ£o dentro da Ã¡rvore.

### 4.2 Painel lateral mobile

No mobile:

- painel aparece como seÃ§Ã£o acima da Ã¡rvore quando aberto;
- hÃ¡ botÃ£o para recolher;
- quando fechado, aparece botÃ£o de expandir sobre a Ã¡rea da Ã¡rvore;
- conteÃºdo do painel deve ser legÃ­vel e compacto;
- a Ã¡rvore continua ocupando o espaÃ§o restante;
- textos longos devem truncar ou quebrar sem gerar overflow horizontal.

### 4.3 Abas do painel lateral

O painel lateral organiza conteÃºdos por abas principais:

```txt
Filtros
Legendas
```

A aba **InformaÃ§Ãµes** nÃ£o deve aparecer na toggle principal. Ela Ã© acionada pelo botÃ£o externo **AÃ§Ãµes**.

A aba **Legendas** foi simplificada. NÃ£o deve exibir:

- subtÃ­tulo â€œCores, linhas, anÃ©is e modos da Ã¡rvore.â€;
- label â€œVisualizaÃ§Ã£o atualâ€;
- card azul da view atual;
- Ã¡rea â€œViewsâ€ no final;
- subtÃ­tulos dentro dos cards de Cards, Linhas e Anel de casamento.

Texto consolidado do status conjugal:

```txt
Em relacionamento
```

AlÃ©m de legenda, `TreeLegend` tambÃ©m pode controlar filtros/camadas visuais reais:

- `visualLineFilters.parentChildHighlight`;
- `visualLineFilters.siblingHighlight`;
- `parentChildHighlight` respeita `edgeFilters.filiacao_sangue || edgeFilters.filiacao_adotiva`;
- `siblingHighlight` respeita `edgeFilters.irmaos`;
- estado padrÃ£o desligado mantÃ©m o visual original.

---

## 5. Ãrvore: views e comportamento visual

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
```

Views existentes:

| View | Rota | Uso |
|---|---|---|
| Minha Ãrvore | `/minha-arvore` | Escopo em torno da pessoa central. |
| Genealogia | `/genealogia` | Escopo pessoal por geraÃ§Ãµes. |
| VisÃ£o Completa | `/visao-completa` | Base familiar completa por geraÃ§Ãµes. |

`/` redireciona para `/minha-arvore` preservando search params. As trÃªs rotas usam o mesmo shell `Home`, e a mudanÃ§a de view deve alterar apenas a Ã¡rea principal da Ã¡rvore e controles condicionados por `viewMode`.

### 5.1 TÃ­tulo fixo da Ã¡rvore

O tÃ­tulo/subtÃ­tulo da Ã¡rvore deve ser renderizado apenas como overlay fixo em `FamilyTree.tsx`.

Texto atual:

```txt
Linha GenealÃ³gica de {primeiro nome}
Use zoom, arraste a Ã¡rvore e clique nas pessoas para abrir detalhes.
```

Regras:

- nÃ£o adicionar title node interno nos layouts;
- `directFamilyDistributedLayout.ts` nÃ£o deve criar tÃ­tulo principal da Ã¡rvore;
- `genealogyColumnsLayout.ts` nÃ£o deve criar tÃ­tulo/subtÃ­tulo principal;
- labels de geraÃ§Ã£o e grupo podem existir, mas nÃ£o devem duplicar o tÃ­tulo principal.

### 5.2 Viewport inicial

O viewport inicial separa:

- bounds usados para zoom/enquadramento visual;
- bounds usados para pan/arraste.

Regra consolidada:

- zoom inicial deve considerar cards reais (`personNode`) como base visual;
- elementos auxiliares nÃ£o devem reduzir a Ã¡rvore;
- labels, group boxes, legend nodes e anchors nÃ£o devem comandar o zoom inicial;
- bounds de pan podem considerar mais elementos para permitir navegaÃ§Ã£o segura;
- tÃ­tulo fixo nÃ£o participa do bounds da Ã¡rvore.

### 5.3 Minha Ãrvore

A view **Minha Ãrvore** deve:

- carregar legÃ­vel apÃ³s login;
- nÃ£o aparecer minÃºscula no centro;
- caber de forma equilibrada no container;
- usar bounds de cards reais;
- permitir zoom mÃ¡ximo perceptÃ­vel;
- recentralizar apenas quando necessÃ¡rio;
- preservar layout de grupos diretos;
- manter filtros diretos e KPIs em sincronia com a pessoa central.

A view pode considerar altura para fit inicial, desde que isso nÃ£o reduza a Ã¡rvore a ponto de perder legibilidade.

### 5.4 Genealogia

A view **Genealogia** deve:

- usar zoom por largura;
- nÃ£o reduzir zoom por causa da altura total;
- iniciar no mesmo topo visual das demais views;
- manter largura visual equivalente Ã  Minha Ãrvore;
- permitir que o usuÃ¡rio arraste/deslize para baixo quando houver muitos cards verticais;
- preservar labels de geraÃ§Ã£o;
- preservar anÃ©is conjugais e conectores ortogonais.

### 5.5 VisÃ£o Completa

A view **VisÃ£o Completa** segue a mesma regra de UX da Genealogia:

- zoom por largura;
- mesma posiÃ§Ã£o inicial vertical;
- altura total nÃ£o reduz zoom;
- navegaÃ§Ã£o vertical por pan/arraste;
- base completa da famÃ­lia;
- sem tÃ­tulo/subtÃ­tulo duplicado.

### 5.6 Pan e zoom

Controles esperados:

- botÃ£o `+`;
- botÃ£o `-`;
- scroll/pinch quando habilitados;
- pan por arraste quando permitido.

Regras:

- botÃµes de zoom ficam no canto superior direito da Ã¡rea da Ã¡rvore, por exemplo `right-4 top-4`;
- durante seleÃ§Ã£o de Ã¡rea, pan/zoom devem ser bloqueados;
- ao cancelar/concluir seleÃ§Ã£o, pan/zoom devem voltar;
- Genealogia e VisÃ£o Completa sempre precisam permitir pan vertical;
- Minha Ãrvore pode restringir pan quando estÃ¡ no zoom de fit, para evitar deslocamento acidental.

---

## 6. Layouts da Ã¡rvore

### 6.1 Minha Ãrvore â€” layout distribuÃ­do

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

CaracterÃ­sticas:

- pessoa central destacada;
- grupos laterais paternos/maternos;
- pais, avÃ³s, bisavÃ³s e demais grupos;
- labels de grupo;
- caixas de agrupamento;
- anchors estruturais;
- edges estruturais.

Regras de UX:

- grupos devem ter alinhamento visual estÃ¡vel;
- labels de grupo sÃ£o permitidas;
- tÃ­tulo geral da Ã¡rvore nÃ£o deve ser criado aqui;
- caixas e anchors nÃ£o devem controlar zoom inicial;
- cards devem continuar clicÃ¡veis via `FamilyTree`.

### 6.2 Genealogia/VisÃ£o Completa â€” layout por colunas

Arquivo:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

CaracterÃ­sticas:

- colunas por geraÃ§Ã£o;
- cards ordenados por geraÃ§Ã£o;
- ordenaÃ§Ã£o por nascimento/nome;
- cÃ´njuges prÃ³ximos;
- anÃ©is de casamento;
- conectores familiares ortogonais;
- labels de geraÃ§Ã£o;
- suporte a filtros por geraÃ§Ã£o.

Regras de UX:

- `COLUMN_TOP` define o inÃ­cio estrutural das colunas;
- labels de geraÃ§Ã£o sÃ£o permitidas;
- tÃ­tulo/subtÃ­tulo principal nÃ£o deve ser renderizado aqui;
- altura vertical pode exceder a viewport;
- usuÃ¡rio deve navegar por pan/arraste;
- conectores devem continuar legÃ­veis mesmo com filtros ativos.

---

## 7. Legendas visuais

DocumentaÃ§Ã£o especÃ­fica recomendada:

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
- modo nÃ£o compacto preservado para uso futuro;
- sem descriÃ§Ã£o da view atual;
- sem seÃ§Ã£o â€œViewsâ€;
- sem subtÃ­tulos internos nos itens;
- item â€œEm relacionamentoâ€ para uniÃ£o ativa.

SeÃ§Ãµes atuais:

- Cards;
- Linhas;
- Camadas extras, quando disponÃ­veis;
- Anel de casamento;
- Cores dos grupos, quando houver altura Ãºtil.

Regras:

- a legenda deve explicar o essencial, nÃ£o repetir textos de tutorial;
- nÃ£o deve bloquear pan/zoom;
- deve ser ignorada em exportaÃ§Ãµes;
- nÃ£o deve criar dependÃªncia com Supabase;
- nÃ£o deve alterar cÃ¡lculo de status conjugal;
- alteraÃ§Ãµes de copy devem ser feitas em `TreeLegend.tsx` e refletidas na documentaÃ§Ã£o especÃ­fica.

---

## 8. ExportaÃ§Ã£o e seleÃ§Ã£o de Ã¡rea

DocumentaÃ§Ã£o especÃ­fica recomendada:

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

- botÃ£o de seleÃ§Ã£o de Ã¡rea;
- overlay sobre a Ã¡rea visÃ­vel da Ã¡rvore;
- instruÃ§Ã£o **â€œArraste para selecionar uma Ã¡rea visÃ­vel da Ã¡rvore.â€**;
- retÃ¢ngulo de seleÃ§Ã£o;
- toolbar contextual para PNG, PDF, imprimir e cancelar;
- cancelamento por botÃ£o ou `Esc`;
- bloqueio temporÃ¡rio de pan/zoom durante seleÃ§Ã£o.

Regras:

- seleÃ§Ã£o mÃ­nima: 80 x 80px;
- limite de seguranÃ§a: 12.000.000 pixels estimados;
- exportaÃ§Ã£o opera sobre viewport visÃ­vel, nÃ£o Ã¡rvore completa;
- controles ReactFlow, minimap, menus, overlay e legenda sÃ£o ignorados;
- imagens externas sem CORS podem falhar com erro amigÃ¡vel;
- exportaÃ§Ã£o nÃ£o deve salvar no Supabase nem criar log persistido.

---

## 9. Modais, dialogs e overlays

PadrÃµes:

- modais longos usam altura mÃ¡xima e rolagem interna;
- em mobile, largura deve ser `calc(100vw - margem)`;
- botÃµes internos que nÃ£o salvam devem usar `type="button"`;
- overlays interativos devem impedir propagaÃ§Ã£o quando necessÃ¡rio;
- modais administrativos devem manter aÃ§Ãµes destrutivas protegidas por confirmaÃ§Ã£o;
- modais nÃ£o devem esconder erros funcionais com fechamento automÃ¡tico.

Exemplos relevantes:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/pages/Home.tsx
```

---

## 10. Responsividade

Larguras obrigatÃ³rias de QA:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

PadrÃµes obrigatÃ³rios:

- `min-w-0` em containers flex/grid;
- `break-words` para textos de usuÃ¡rio;
- `break-all` para IDs, e-mails, URLs e valores tÃ©cnicos longos;
- botÃµes em `w-full sm:w-auto` quando houver risco de overflow;
- headers com `flex-col gap-2 sm:flex-row`;
- listas/tabelas largas com `overflow-x-auto` contido;
- modais com `max-h` e scroll interno;
- cards empilhados no mobile;
- textos e botÃµes truncados quando necessÃ¡rio.

CritÃ©rios gerais:

- sem overflow horizontal global indevido;
- aÃ§Ãµes principais acessÃ­veis;
- menus operÃ¡veis;
- modais cabem ou rolam internamente;
- Ã¡rvore utilizÃ¡vel em touch;
- legenda nÃ£o bloqueia a Ã¡rvore;
- admin operÃ¡vel em telas menores.

---

## 11. PadrÃµes de conteÃºdo e microcopy

Diretrizes:

- tÃ­tulos curtos;
- subtÃ­tulos informativos, mas nÃ£o redundantes;
- botÃµes com verbo claro;
- mensagens de erro orientadas Ã  aÃ§Ã£o;
- evitar jargÃ£o tÃ©cnico para usuÃ¡rio comum;
- preservar termos tÃ©cnicos no admin quando necessÃ¡rio.

Exemplos consolidados:

| Contexto | Texto |
|---|---|
| View principal | Minha Ãrvore |
| View genealÃ³gica | Genealogia |
| View completa | VisÃ£o Completa |
| TÃ­tulo da Ã¡rvore | Linha GenealÃ³gica de {primeiro nome} |
| SubtÃ­tulo da Ã¡rvore | Use zoom, arraste a Ã¡rvore e clique nas pessoas para abrir detalhes. |
| Status conjugal ativo | Em relacionamento |
| ExportaÃ§Ã£o | Selecionar Ã¡rea |
| AÃ§Ãµes da Ã¡rvore | AÃ§Ãµes |
| Loading da Home | Buscando pessoas e relacionamentosâ€¦ |
| Busca | Buscar por nome ou local... |

---

## 12. QA visual obrigatÃ³rio apÃ³s mudanÃ§as de layout

Antes de commitar ajuste visual relevante:

```bash
git status
npm run build
npm test
git diff --check
```

Quando houver mudanÃ§a em Ã¡rvore, painel ou responsividade:

```bash
npm run test:e2e
```

Checklist manual mÃ­nimo:

- abrir Home pÃ³s-login;
- testar Minha Ãrvore;
- testar Genealogia;
- testar VisÃ£o Completa;
- abrir/recolher painel lateral;
- abrir aba Legendas;
- usar zoom `+` e `-`;
- arrastar Ã¡rvore;
- testar mobile estreito;
- testar exportaÃ§Ã£o de Ã¡rea se algo afetou overlay/ReactFlow;
- garantir que usuÃ¡rio comum nÃ£o vÃª aÃ§Ãµes admin.

---

## 13. AlteraÃ§Ãµes recentes registradas

### 13.1 Header e margens internas

- criado/padronizado `MemberPageHeader`;
- consolidado `PAGE_CONTAINER_CLASS`;
- pÃ¡ginas internas passaram a seguir o mesmo padrÃ£o visual de header;
- Home pÃ³s-login permaneceu com header prÃ³prio.

### 13.2 Painel lateral

- removida duplicidade de botÃµes de recolher/expandir painel;
- controle passou a ficar junto ao painel;
- mobile mantÃ©m botÃ£o de expandir sobre a Ã¡rvore quando painel estÃ¡ fechado;
- toggle principal ficou restrita a **Filtros** e **Legendas**;
- **InformaÃ§Ãµes** saiu da toggle e passou a ser acionada por **AÃ§Ãµes**.

### 13.3 Viewport da Ã¡rvore

- zoom inicial passou a usar bounds de cards reais;
- bounds de viewport foram separados de bounds de pan;
- Genealogia/VisÃ£o Completa passaram a usar zoom por largura;
- altura total nÃ£o reduz mais a escala dessas views;
- tÃ­tulo/subtÃ­tulo interno das views genealÃ³gicas foi removido;
- overlay fixo em `FamilyTree.tsx` tornou-se a fonte Ãºnica do tÃ­tulo.

### 13.4 Legendas

- removido subtÃ­tulo da legenda;
- removida â€œVisualizaÃ§Ã£o atualâ€;
- removido card azul da view atual;
- removida seÃ§Ã£o â€œViewsâ€;
- removidas descriÃ§Ãµes internas dos itens;
- â€œAtivaâ€ foi trocado por â€œEm relacionamentoâ€;
- legenda tambÃ©m controla filtros/camadas visuais quando callbacks sÃ£o fornecidos;
- controles de camadas extras incluem destaque opcional de pais/filhos e irmÃ£os.

### 13.5 Arquivos histÃ³ricos

- apÃ³s upload, o input nativo fica oculto;
- campos e botÃµes **Cancelar**/**Adicionar** ficam ocultos imediatamente;
- mensagem verde **â€œâœ“ Arquivo carregadoâ€** permanece visÃ­vel;
- imagens mostram thumbnail;
- PDF mostra card/Ã­cone/label PDF;
- botÃ£o **Adicionar Arquivo** reabre campos sem apagar a miniatura carregada;
- usuÃ¡rio ainda pode preencher tÃ­tulo, descriÃ§Ã£o, ano e categoria depois do upload.

### 13.6 Minha Ãrvore

- cards de **Escopo da visualizaÃ§Ã£o** exibem avatar circular com foto ou iniciais;
- botÃ£o individual **Salvar casamento** foi removido;
- botÃ£o geral **Salvar meus dados** salva dados pessoais e processa dados conjugais;
- local de casamento invÃ¡lido nÃ£o bloqueia os dados pessoais, mas deixa casamento sem salvar e mostra aviso.

### 13.7 Ajustes pÃ³s-PDF

NotificaÃ§Ãµes:

- `/notificacoes` Ã© lista/central em cards;
- `/ajustar-notificacoes` Ã© pÃ¡gina dedicada de preferÃªncias.

CalendÃ¡rio Familiar:

- bloco superior de **Categorias** foi removido;
- sidebar mantÃ©m o tÃ­tulo **Categorias**;
- categorias sÃ£o filtros clicÃ¡veis;
- contadores usam singular/plural: **1 evento**, **2 eventos**;
- aniversÃ¡rios mostram **â€œFaz X anosâ€**.

Perfil e contato:

- cards vazios de insights nÃ£o devem renderizar no perfil pÃºblico;
- botÃ£o WhatsApp deve manter o mesmo peso visual dos botÃµes de aÃ§Ã£o/header.

Admin:

- erro de listagem de usuÃ¡rios para vÃ­nculo aparece inline;
- evitar toast repetitivo para a mesma falha de listagem;
- autocomplete de endereÃ§o nÃ£o bloqueia o formulÃ¡rio se o Google falhar.

---

## 14. O que evitar

NÃ£o fazer:

- adicionar novo tÃ­tulo dentro de layouts da Ã¡rvore;
- usar altura total da Genealogia/VisÃ£o Completa para reduzir zoom inicial;
- duplicar controles de painel lateral;
- criar nova classe de container se `PAGE_CONTAINER_CLASS` resolver;
- alterar service/RLS/migration para correÃ§Ã£o visual;
- colocar legenda dentro da exportaÃ§Ã£o;
- salvar estado visual transitÃ³rio no banco;
- criar nova view de Ã¡rvore sem documentar comportamento de zoom/pan;
- commitar arquivos de backup, `.bak`, patches temporÃ¡rios ou dumps;
- usar `window.location` para navegaÃ§Ã£o interna quando `navigate` resolver;
- transformar ajuste de copy em alteraÃ§Ã£o de regra de negÃ³cio.

---

## 15. Arquivos de referÃªncia

```txt
src/app/pages/Home.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/FamilyTree/FamilyTree.tsx
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

## 16. ManutenÃ§Ã£o documental

Este arquivo deve concentrar decisÃµes de UX e layout. Para evitar repetiÃ§Ã£o:

- detalhes tÃ©cnicos de componentes ficam em `docs/GUIA_COMPONENTES.md`;
- troubleshooting fica em `docs/GUIA_CORRECAO_ERROS.md`;
- estado implementado fica em `docs/GUIA_IMPLEMENTACOES.md`;
- exportaÃ§Ã£o da Ã¡rvore deve ser detalhada em `docs/funcionalidades/EXPORTACAO_ARVORE.md`;
- legenda/painel/conectores devem ser detalhados em `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- rotas e guards devem ficar em `docs/arquitetura/ROTAS_E_GUARDS.md`.
