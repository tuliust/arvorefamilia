# Guia de UX e Layout - Árvore Família

> Última revisão: 2026-06-11  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico atualizado com Mapa Familiar Vertical/Horizontal, painel desktop/mobile, barra mobile Paterno/Central/Materno da horizontal, controles de zoom internos, conectores SVG e regras visuais atuais das views da árvore.

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

- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/PLANO_PROXIMOS_PASSOS.md`;
- `docs/funcionalidades/*.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## Nota de verificação contra o código atual

Esta revisão consolida as seguintes frentes:

1. **Minha Árvore mobile segmentada**  
   `MobileFamilyTreeView.tsx`, com malha 3×3 e abas **Paterno | Central | Materno**.

2. **Mapa Familiar Vertical**  
   `/mapa-familiar`, `DesktopFamilyMapView.tsx`, HTML/CSS/SVG próprio no desktop/tablet e `MobileFamilyTreeView` no mobile.

3. **Mapa Familiar Horizontal**  
   `/mapa-familiar-horizontal`, `DesktopFamilyHorizontalMapView.tsx`, colunas por geração, cards visuais, conectores SVG de casal/filhos, colunas vazias ocultadas e painel igual ao Mapa Familiar Vertical.

4. **Genealogia e Visão Completa**  
   ReactFlow com `genealogyColumnsLayout` e cabeçalhos de geração em pílulas escuras.

Regra documental:

```txt
Documentar como implementado apenas o que pertence ao código atual; intenções futuras ou ajustes ainda não validados devem permanecer como backlog explícito.
```

---

## 1. Princípios gerais

| Princípio | Regra prática |
|---|---|
| Clareza para usuário familiar | Preferir termos humanos e ações explícitas. |
| Consistência visual | Reusar headers, containers, botões, cards e menus compartilhados. |
| Mobile-first em páginas comuns | Páginas internas devem funcionar a partir de 320px. |
| Admin operável em mobile | Formulários críticos precisam continuar acessíveis; tabelas podem usar scroll horizontal contido. |
| Árvore como canvas | Pan, zoom, seleção, exportação, legenda e paletas pertencem à experiência de canvas. |
| Permissão não é visual | Esconder botão não substitui guard, RLS, RPC segura ou validação em service. |
| Ajuste visual não muda regra de negócio | CSS não deve alterar payloads, Supabase, migrations ou RLS. |
| Escopo visual explícito | CSS novo deve ser restrito por rota, container, data attribute ou seletor estrutural confiável. |

Anti-padrão:

```txt
Não usar translate/top negativo na .react-flow__viewport para corrigir espaçamento.
```

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
- ReactFlow nas views de grafo;
- HTML/CSS/SVG próprio nos Mapas Familiares;
- Radix UI em componentes base.

### 2.2 Identidade visual

| Elemento | Padrão |
|---|---|
| Fundo geral | Cinza claro (`bg-gray-50` / `bg-gray-100`) |
| Área de árvore do Mapa Familiar | Azul-claro/ciano conforme paleta |
| Cards | Branco ou gradiente de paleta, borda suave, sombra discreta, cantos arredondados |
| Ação primária | Azul/ciano |
| Erro/perigo | Vermelho |
| Alerta | Âmbar |
| Sucesso | Verde/esmeralda |
| Texto principal | `gray/slate` escuro |
| Texto secundário | `gray-500/600` |
| Ícones | `lucide-react`, tamanho consistente por contexto |

### 2.3 Containers

Páginas internas devem usar o container exportado por `MemberPageHeader.tsx`:

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
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
```

O header concentra:

- nome da família;
- busca expansível;
- atalhos para curiosidades, fórum e calendário;
- menu do usuário;
- integração com estado da árvore;
- título mobile como `Família de {primeiro nome}` quando houver pessoa vinculada.

Regras:

- não substituir o header da Home por `MemberPageHeader`;
- preservar altura compacta;
- preservar busca expansível;
- preservar search params ao trocar view, especialmente `?pessoa=...`;
- esconder textos e priorizar ícones em breakpoints menores;
- manter dropdowns e sugestões acima da árvore;
- evitar overflow horizontal.

### 3.2 Navegação entre views no desktop

A troca principal entre as duas views de Mapa Familiar fica no painel:

| Botão | Rota |
|---|---|
| Vertical | `/mapa-familiar` |
| Horizontal | `/mapa-familiar-horizontal` |

Regras:

- não usar `/visao-completa` como destino do botão **Horizontal**;
- não exibir `/mapa-horizontal`;
- preservar search params quando houver pessoa selecionada;
- o botão ativo deve refletir a rota atual.

### 3.3 Paletas da árvore

Paletas disponíveis:

| Paleta | Chave |
|---|---|
| Branca/padrão | `white` |
| Azul/visual | `visual` |
| Laranja | `orange` |
| Marrom | `brown` |

Regras:

- paletas alteram CSS variables/tokens visuais;
- paletas não alteram rota, filtros, permissões, dados, Supabase ou regras de negócio;
- escolha persiste em `localStorage`;
- aplicação ocorre no `document.documentElement`;
- o painel desktop expõe as opções em **Cores**;
- em mobile, a paleta pode ser acessada pelo painel de controle da árvore ou menu mobile, conforme superfície vigente.

### 3.4 Menu do usuário

Arquivo principal:

```txt
src/app/components/layout/UserProfileMenu.tsx
```

Comportamento consolidado:

- variante `home-header` mantém botão compacto;
- variante padrão é botão circular por avatar/iniciais;
- topo do painel navega para `/minha-arvore/editar`;
- botão `X` fecha o painel sem navegar;
- item **Editar notificações** não existe;
- **Painel Admin** aparece apenas para administradores;
- **Sair** limpa cache da árvore e executa logout.

### 3.5 Navegação inferior mobile

A navegação inferior mobile exibe:

```txt
Home
Calendário
Fórum
Favoritos
Alertas
```

Regras:

- `Home` deve considerar rotas da árvore como ativas;
- reservar espaço inferior (`pb-24 md:pb-0`) quando necessário;
- modais e drawers devem considerar `safe-area-inset-bottom`;
- elementos fixos da árvore não devem competir visualmente com essa navegação.

---

## 4. Views da árvore

### 4.1 Shell e superfície

Arquivos principais:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Regras gerais:

- a árvore ocupa área de canvas dentro da viewport;
- página não deve gerar scroll externo quando a árvore já ocupa a viewport;
- overlays, botões e menus devem respeitar camadas acima da árvore;
- ajustes visuais específicos de uma view não devem vazar para as demais;
- controles mobile fixos não devem competir com navegação inferior.

### 4.2 Minha Árvore

Escopo:

```txt
viewMode === 'minha-arvore'
```

Desktop/tablet:

- ReactFlow;
- layout direto em torno da pessoa central;
- título **Árvore de {nome}**;
- filtros de linhas e grupos;
- pan/zoom interno.

Mobile:

- `MobileFamilyTreeView`;
- malha 3×3;
- abas **Paterno | Central | Materno**;
- swipe direcional;
- cards com anos;
- card central sem badge **Você**;
- conectores HTML/CSS acompanhando scroll.

### 4.3 Mapa Familiar Vertical

Escopo:

```txt
viewMode === 'mapa-familiar'
rota: /mapa-familiar
```

Desktop/tablet:

- `DesktopFamilyMapView`;
- HTML/CSS/SVG próprio;
- layout panorâmico;
- grupos por tipo;
- conectores SVG por âncoras;
- grupos expansíveis;
- cônjuges com regra própria;
- zoom via controles e `Ctrl + scroll`;
- exportação da superfície atual.

Mobile:

- usa `MobileFamilyTreeView`;
- mantém toggle nativa **Paterno | Central | Materno**;
- botão de controle fica na mesma faixa da toggle;
- botão abre o painel mobile com filtros/ações do desktop;
- não existe toggle **Vertical | Horizontal**.

### 4.4 Mapa Familiar Horizontal

Escopo:

```txt
viewMode === 'mapa-familiar-horizontal'
rota: /mapa-familiar-horizontal
```

Comportamento:

- `DesktopFamilyHorizontalMapView`;
- colunas por geração;
- `manual_generation` define a coluna prioritária;
- gerações válidas de 1 a 6;
- fallback por inferência de pais/filhos/cônjuges;
- colunas vazias ocultadas;
- cards na ordem aproximada da `/visao-completa` por referência de `genealogyColumnsLayout`;
- filhos do mesmo casal ordenados do mais velho ao mais novo;
- cônjuges ficam adjacentes;
- conectores SVG próprios:
  - linha vertical entre cônjuges;
  - linha horizontal do meio do casal ao gap;
  - tronco vertical no gap;
  - ramais horizontais até filhos;
  - troncos distribuídos em X para evitar sobreposição;
- usa paleta/cores do Mapa Familiar;
- exporta a superfície atual.

Desktop:

- título **Mapa Familiar Horizontal de {primeiro nome}**;
- painel igual ao de `/mapa-familiar`;
- botão **Vertical** volta para `/mapa-familiar`.

Mobile:

- renderiza a própria horizontal;
- exibe barra visual **Paterno | Central | Materno** logo abaixo do header;
- `Central` fica ativo por padrão;
- comportamento funcional dessa barra ainda será definido;
- botão de controle fica na mesma linha da barra;
- botão abre o mesmo painel mobile de filtros/ações do desktop.

### 4.5 Genealogia

Escopo:

```txt
viewMode === 'genealogia'
```

Comportamento:

- ReactFlow;
- layout por colunas genealógicas;
- escopo pessoal;
- chips/tabs mobile de geração;
- cabeçalhos `GERAÇÃO N` com pílula escura.

### 4.6 Visão Completa

Escopo:

```txt
viewMode === 'visao-completa'
```

Comportamento:

- ReactFlow;
- `genealogyColumnsLayout`;
- grafo completo;
- conectores conjugais e familiares do sistema ReactFlow;
- cabeçalhos `GERAÇÃO N` com pílula escura;
- não deve ser usada como destino do botão **Horizontal** do Mapa Familiar.

---

## 5. Painel desktop

No desktop, a sidebar renderiza:

| Área | Conteúdo |
|---|---|
| topo | zoom, recolher/expandir, botões Vertical/Horizontal, Cores, Exportar, Destacar |
| Filtros | `DirectRelationKpiGrid` ou `GenealogyFilterGrid` + `LifeStatusKpiGrid` |
| Legendas | `TreeLegend` |
| Ações | `SidebarInfoPanel` |

Para `/mapa-familiar` e `/mapa-familiar-horizontal`, o painel de grupos usa:

```txt
Tataravós
Bisavós
Avós
Pais
Tios
Primos
Sobrinhos
Irmãos
Filhos
Netos
Cônjuges
Pets
```

Regras:

- o painel lateral desktop deve evitar scroll vertical desnecessário;
- se altura útil for insuficiente, reduzir densidade por `clamp()` antes de reintroduzir scroll;
- cards desligados ficam com opacidade/grayscale;
- contador reflete pessoas renderizadas ou escopo calculado.

---

## 6. Painel mobile

Em mobile:

- não há sidebar lateral;
- `HomeMobileNav` exibe botão de controle nas rotas de Mapa Familiar;
- o botão abre painel inferior com `sidebarPanelContent`;
- painel inferior reaproveita os mesmos componentes do desktop;
- overlay fecha painel;
- conteúdo pode rolar internamente;
- `MobileTreeControlsPortal` fica desativado em `/mapa-familiar` e `/mapa-familiar-horizontal` para evitar duplicidade.

---

## 7. Zoom

Regra consolidada:

```txt
Atalhos de zoom devem afetar somente a área da árvore, mantendo header e painel fixos.
```

Comportamentos:

- `Ctrl/Cmd + +` → zoom interno;
- `Ctrl/Cmd + -` → reduzir zoom interno;
- `Ctrl/Cmd + scroll` → zoom interno quando suportado pela view;
- `Ctrl/Cmd + 0` → impedir reset de zoom do navegador na área da árvore;
- inputs, textareas, selects e áreas editáveis não devem ser interceptados.

---

## 8. Exportação

Views com exportação:

| View | Estratégia |
|---|---|
| `FamilyTree`/ReactFlow | captura de ReactFlow/área exportável |
| `/mapa-familiar` | captura HTML/CSS/SVG da superfície |
| `/mapa-familiar-horizontal` | captura HTML/CSS/SVG da superfície horizontal |

Ações expostas:

```txt
Área
Imagem
PDF
Imprimir
```

Observações:

- em views HTML/CSS/SVG, seleção de área pode cair para exportação direta quando seleção retangular não estiver disponível;
- exportação precisa de QA visual específico por paleta.

---

## 9. Avatares e cards

Regras atuais:

- `genero` orienta avatar quando disponível;
- `Pet` usa avatar de pet;
- cards mobile exibem anos;
- card central mobile não exibe badge **VOCÊ**;
- Pai/Mãe mantêm labels próprios;
- cards de cônjuges usam tom próprio quando identificados;
- cards de `/mapa-familiar-horizontal` usam `VisualPersonCard`.

---

## 10. Anti-regressões visuais

Não fazer:

- reintroduzir toggle **Vertical | Horizontal** no mobile;
- deixar botão de controle mobile no header quando deveria ficar na faixa da toggle;
- criar painel mobile paralelo ao `sidebarPanelContent`;
- usar `/visao-completa` como horizontal do Mapa Familiar;
- reintroduzir `/mapa-horizontal`;
- reintroduzir `/visao-completa-teste`;
- ocultar globalmente SVG de conectores da horizontal;
- deixar colunas vazias ocupando espaço;
- quebrar a regra de cônjuges adjacentes;
- aplicar CSS de uma view em outra sem escopo;
- usar transform de ReactFlow para compensar layout.

---

## 11. QA visual mínimo

### Desktop

Testar:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/visao-completa
/genealogia
/minha-arvore
```

Breakpoints:

```txt
1280px
1366px
1440px
1536px
1920px
```

Validar:

- painel aberto;
- painel colapsado;
- paletas `white`, `visual`, `orange`, `brown`;
- filtros de grupos;
- filtro Cônjuges;
- filtro Pets;
- colunas vazias;
- conectores;
- zoom;
- exportação.

### Mobile

Testar:

```txt
320px
375px
390px
430px
```

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Validar:

- posição da toggle;
- posição do botão de controle;
- abertura/fechamento do painel;
- rolagem interna do painel;
- navegação inferior;
- safe area iOS/Safari;
- cards e conectores visíveis.
