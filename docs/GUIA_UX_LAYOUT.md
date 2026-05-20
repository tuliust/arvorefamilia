# Guia de UX e Layout — Árvore Família

## Objetivo

Este documento registra as decisões consolidadas de experiência, layout, responsividade e comportamento visual do projeto **Árvore Família**.

Use este guia para orientar:

- ajustes de interface;
- revisão de telas;
- padronização de headers, containers e margens;
- comportamento da árvore em desktop, tablet e mobile;
- validação visual antes de lançamento;
- decisões de UX que não devem ser reabertas sem motivo técnico ou de produto.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: inventário funcional e técnico do que já foi implementado.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma.
- `docs/PLANO_PROXIMOS_PASSOS.md`: roadmap e pendências.
- `docs/GUIA_COMPONENTES.md`: catálogo técnico dos componentes reutilizáveis.

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
   Área do usuário, perfil, favoritos, notificações e fórum devem ser confortáveis em 320px+.
4. **Admin operável, não necessariamente perfeito, em mobile.**
   O painel administrativo pode usar scroll horizontal controlado em listas/tabelas, mas formulários e ações críticas precisam continuar acessíveis.
5. **Árvore é uma superfície interativa própria.**
   Pan, zoom, exportação, legenda e seleção de área devem ser tratados como experiência de canvas, não como página tradicional.

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

A identidade visual predominante usa:

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

Essa classe está exportada como `PAGE_CONTAINER_CLASS` em `MemberPageHeader.tsx`.

Uso esperado:

- páginas internas devem usar `PAGE_CONTAINER_CLASS` para alinhar header e conteúdo;
- não criar variações locais de margem sem necessidade;
- evitar containers com `max-w` divergente em páginas de membro;
- preservar `min-w-0` em wrappers flex/grid para impedir overflow.

---

## 3. Headers

## 3.1 Header da Home pós-login

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

A Home pós-login mantém header próprio porque concentra:

- nome da família;
- label da view atual;
- seletor de visualização da árvore;
- busca expansível;
- atalhos para curiosidades, fórum e calendário;
- `UserMenu`;
- integração com estado da árvore.

Regras:

- não substituir o header da Home por `MemberPageHeader`;
- manter altura compacta;
- preservar busca expansível;
- preservar seletor de view;
- evitar ações que causem overflow horizontal;
- em breakpoints menores, esconder textos e priorizar ícones.

## 3.2 Header das páginas internas

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
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

O header interno possui:

- ícone opcional;
- título;
- subtítulo;
- ações opcionais;
- layout responsivo em coluna no mobile e linha no desktop;
- `PAGE_CONTAINER_CLASS` para alinhamento.

Regras:

- usar `MemberPageHeader` para novas páginas internas de usuário/admin, salvo exceção justificada;
- ações do header devem usar `actions`;
- botões devem preservar foco visível;
- ícones devem vir de `HEADER_ACTION_ICONS` quando já existirem ali;
- títulos e subtítulos devem usar textos curtos, pois são truncados em tela estreita.

---

## 4. Layout da Home e painel lateral

Arquivo principal:

```txt
src/app/pages/Home.tsx
```

A Home pós-login é composta por:

- header fixo no topo da viewport;
- área principal `main` com altura restante;
- painel lateral;
- área da árvore;
- modais globais da árvore.

### 4.1 Painel lateral desktop

No desktop:

- painel aberto usa largura de `w-80`;
- painel recolhido usa largura estreita (`w-14`);
- botão de recolher/expandir deve ficar dentro do painel;
- conteúdo interno do painel rola verticalmente;
- área da árvore ocupa o espaço restante.

Regra consolidada:

> Deve existir apenas um controle de expandir/recolher painel lateral. Não duplicar botão dentro da árvore.

### 4.2 Painel lateral mobile

No mobile:

- o painel aparece como seção acima da árvore quando aberto;
- há botão para recolher;
- quando fechado, aparece botão de expandir sobre a área da árvore;
- conteúdo do painel deve ser legível e compacto;
- a árvore continua ocupando o espaço restante.

### 4.3 Abas do painel lateral

O painel lateral organiza conteúdos por abas, incluindo:

- informações/filtros;
- legendas;
- outros painéis de contexto da árvore.

A aba **Legendas** foi simplificada recentemente. Não deve exibir:

- subtítulo “Cores, linhas, anéis e modos da árvore.”;
- label “Visualização atual”;
- card azul da view atual;
- área “Views” no final;
- subtítulos dentro dos cards de Cards, Linhas e Anel de casamento.

Texto consolidado do status conjugal:

- “Em relacionamento” no lugar de “Ativa”.

---

## 5. Árvore: views e comportamento visual

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
```

Views existentes:

| View | Uso |
|---|---|
| Minha Árvore | Escopo em torno da pessoa central. |
| Genealogia | Escopo pessoal por gerações. |
| Visão Completa | Base familiar completa por gerações. |

### 5.1 Título fixo da árvore

O título/subtítulo da árvore deve ser renderizado apenas como overlay fixo em `FamilyTree.tsx`.

Texto atual:

```txt
Linha Genealógica de {primeiro nome}
Use zoom, arraste a árvore e clique nas pessoas para abrir detalhes.
```

Regras:

- não adicionar title node interno nos layouts;
- `directFamilyDistributedLayout.ts` não deve criar título principal da árvore;
- `genealogyColumnsLayout.ts` não deve criar título/subtítulo principal;
- labels de geração e grupo podem existir, mas não devem duplicar o título principal.

### 5.2 Viewport inicial

O viewport inicial foi ajustado recentemente para separar:

- bounds usados para zoom/enquadramento visual;
- bounds usados para pan/arraste.

Regra consolidada:

- zoom inicial deve considerar cards reais (`personNode`) como base visual;
- elementos auxiliares não devem reduzir a árvore;
- labels, group boxes, legend nodes e anchors não devem comandar o zoom inicial;
- bounds de pan podem considerar mais elementos para permitir navegação segura;
- título fixo não participa do bounds da árvore.

### 5.3 Minha Árvore

A view **Minha Árvore** deve:

- carregar legível após login;
- não aparecer minúscula no centro;
- caber de forma equilibrada no container;
- usar bounds de cards reais;
- permitir zoom máximo perceptível;
- recentralizar apenas quando necessário;
- preservar layout de grupos diretos.

A view pode considerar altura para fit inicial, desde que isso não reduza a árvore a ponto de perder legibilidade.

### 5.4 Genealogia

A view **Genealogia** deve:

- usar zoom por largura;
- não reduzir zoom por causa da altura total;
- iniciar no mesmo topo visual das demais views;
- manter largura visual equivalente à Minha Árvore;
- permitir que o usuário arraste/deslize para baixo quando houver muitos cards verticais;
- preservar labels de geração;
- preservar anéis conjugais e conectores ortogonais.

### 5.5 Visão Completa

A view **Visão Completa** segue a mesma regra de UX da Genealogia:

- zoom por largura;
- mesma posição inicial vertical;
- altura total não reduz zoom;
- navegação vertical por pan/arraste;
- base completa da família;
- sem título/subtítulo duplicado.

### 5.6 Pan e zoom

Controles esperados:

- botão `+`;
- botão `-`;
- scroll/pinch quando habilitados;
- pan por arraste quando permitido.

Regras:

- durante seleção de área, pan/zoom devem ser bloqueados;
- ao cancelar/concluir seleção, pan/zoom devem voltar;
- Genealogia e Visão Completa sempre precisam permitir pan vertical;
- Minha Árvore pode restringir pan quando está no zoom de fit, para evitar deslocamento acidental.

---

## 6. Layouts da árvore

## 6.1 Minha Árvore — layout distribuído

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
- edges estruturais.

Regras de UX:

- grupos devem ter alinhamento visual estável;
- labels de grupo são permitidas;
- título geral da árvore não deve ser criado aqui;
- caixas e anchors não devem controlar zoom inicial;
- cards devem continuar clicáveis via `FamilyTree`.

## 6.2 Genealogia/Visão Completa — layout por colunas

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
- suporte a filtros por geração.

Regras de UX:

- `COLUMN_TOP` define o início estrutural das colunas;
- labels de geração são permitidas;
- título/subtítulo principal não deve ser renderizado aqui;
- altura vertical pode exceder a viewport;
- o usuário deve navegar por pan/arraste;
- conectores devem continuar legíveis mesmo com filtros ativos.

---

## 7. Legendas visuais

Arquivo:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
```

Estado atual:

- legenda visual simplificada;
- modo compacto para painel lateral;
- modo não compacto preservado para uso futuro;
- sem descrição da view atual;
- sem seção “Views”;
- sem subtítulos internos nos itens;
- item “Em relacionamento” para união ativa.

Seções atuais:

- Cards;
- Linhas;
- Anel de casamento;
- Cores dos grupos.

Regras:

- a legenda deve explicar o essencial, não repetir textos de tutorial;
- não deve bloquear pan/zoom;
- deve ser ignorada em exportações;
- não deve criar dependência com Supabase;
- não deve alterar cálculo de status conjugal;
- alterações de copy devem ser feitas em `TreeLegend.tsx`.

---

## 8. Exportação e seleção de área

Arquivos principais:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

UX implementada:

- botão de seleção de área;
- overlay sobre a área visível da árvore;
- instrução “Arraste para selecionar uma área visível da árvore.”;
- retângulo de seleção;
- toolbar contextual para PNG, PDF, imprimir e cancelar;
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

## 9. Modais, dialogs e overlays

Padrões:

- modais longos usam altura máxima e rolagem interna;
- em mobile, largura deve ser `calc(100vw - margem)`;
- botões internos que não salvam devem usar `type="button"`;
- overlays interativos devem impedir propagação quando necessário;
- modais administrativos devem manter ações destrutivas protegidas por confirmação.

Exemplos relevantes:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/pages/Home.tsx
```

---

## 10. Responsividade

Larguras obrigatórias de QA:

- 320px;
- 375px;
- 390px;
- 430px;
- 768px;
- desktop.

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

## 11. Padrões de conteúdo e microcopy

Diretrizes:

- títulos curtos;
- subtítulos informativos, mas não redundantes;
- botões com verbo claro;
- mensagens de erro orientadas à ação;
- evitar jargão técnico para usuário comum;
- preservar termos técnicos no admin quando necessário.

Exemplos consolidados:

| Contexto | Texto |
|---|---|
| View principal | Minha Árvore |
| View genealógica | Genealogia |
| View completa | Visão Completa |
| Título da árvore | Linha Genealógica de {primeiro nome} |
| Subtítulo da árvore | Use zoom, arraste a árvore e clique nas pessoas para abrir detalhes. |
| Status conjugal ativo | Em relacionamento |
| Exportação | Selecionar área |
| Busca | Buscar por nome ou local... |

---

## 12. QA visual obrigatório após mudanças de layout

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
- usar zoom + e -;
- arrastar árvore;
- testar mobile estreito;
- testar exportação de área se algo afetou overlay/ReactFlow;
- garantir que usuário comum não vê ações admin.

---

## 13. Alterações recentes registradas

### 13.1 Header e margens internas

- criado/padronizado `MemberPageHeader`;
- consolidado `PAGE_CONTAINER_CLASS`;
- páginas internas passaram a seguir o mesmo padrão visual de header;
- Home pós-login permaneceu com header próprio.

### 13.2 Painel lateral

- removida duplicidade de botões de recolher/expandir painel;
- controle passou a ficar junto ao painel;
- mobile mantém botão de expandir sobre a árvore quando painel está fechado.

### 13.3 Viewport da árvore

- zoom inicial passou a usar bounds de cards reais;
- bounds de viewport foram separados de bounds de pan;
- Genealogia/Visão Completa passaram a usar zoom por largura;
- altura total não reduz mais a escala dessas views;
- título/subtítulo interno das views genealógicas foi removido;
- overlay fixo em `FamilyTree.tsx` tornou-se a fonte única do título.

### 13.4 Legendas

- removido subtítulo da legenda;
- removida “Visualização atual”;
- removido card azul da view atual;
- removida seção “Views”;
- removidas descrições internas dos itens;
- “Ativa” foi trocado por “Em relacionamento”.

---

## 14. O que evitar

Não fazer:

- adicionar novo título dentro de layouts da árvore;
- usar altura total da Genealogia/Visão Completa para reduzir zoom inicial;
- duplicar controles de painel lateral;
- criar nova classe de container se `PAGE_CONTAINER_CLASS` resolver;
- alterar service/RLS/migration para correção visual;
- colocar legenda dentro da exportação;
- salvar estado visual transitório no banco;
- criar nova view de árvore sem documentar comportamento de zoom/pan;
- commitar arquivos de backup, `.bak`, patches temporários ou dumps.

---

## 15. Arquivos de referência

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
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```
