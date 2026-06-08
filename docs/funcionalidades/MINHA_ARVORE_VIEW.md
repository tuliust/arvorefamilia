# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-08  
> Revisão complementar: ajustes de `/minha-arvore`, scroll externo, título/cards, botão conjugal, borda do card principal e paletas visuais  
> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Minha Árvore**.

---

## 1. Objetivo

Este documento registra o estado da view direta da árvore familiar chamada na UI de **Minha Árvore**.

A view funciona como uma visão geral individual da pessoa central, exibindo:

- ancestrais;
- pais;
- colaterais;
- cônjuge;
- irmãos;
- descendentes;
- pets, quando vinculados;
- filtros laterais;
- painel lateral;
- ReactFlow.

Este documento consolida decisões sobre:

- título fixo da árvore;
- viewport e fit inicial;
- comportamento de scroll/pan/zoom;
- distribuição da área central;
- ramos paterno e materno;
- cards;
- conectores;
- botão conjugal;
- paletas visuais;
- anti-regressões de layout.

---

## 2. Escopo

Este documento trata da geometria e UX da view **Minha Árvore**.

Para filtros, pets e regras de exibição, use:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

Para edição do próprio perfil, use:

```txt
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
```

Para linhas, conectores, destaques e legenda, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

Para exportação, use:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Para componentes reutilizáveis, use:

```txt
docs/GUIA_COMPONENTES.md
```

Para decisões gerais de UX, use:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 3. Estado consolidado em 2026-06-08

A rodada de ajustes de layout em `/minha-arvore` consolidou:

- shell da Home fixado na viewport;
- scroll externo da página bloqueado quando não há conteúdo fora da área visível;
- zoom inicial no mínimo preservado;
- pan/zoom interno do ReactFlow preservado;
- título da árvore reposicionado um pouco mais abaixo;
- cards/reposicionamento visual ajustados especificamente para `/minha-arvore`;
- ícone conjugal alinhado à cor das linhas conectoras;
- borda extra do card principal removida;
- borda por status vivo/falecido preservada;
- paletas `white`, `orange` e `brown` preservadas;
- nenhuma alteração de dados, RLS ou Supabase para ajuste visual.

Regra importante:

```txt
O scroll de mouse não deve mover a página externa quando a árvore já ocupa a viewport.
O scroll/pan/zoom do ReactFlow deve continuar funcionando conforme a configuração da árvore.
```

---

## 4. Contexto técnico

Stack:

- React;
- Vite;
- TypeScript;
- Tailwind;
- Supabase;
- ReactFlow;
- `lucide-react`.

Página funcional:

```txt
src/app/pages/Home.tsx
```

Componentes do shell da Home:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/HomeMobileNav.tsx
```

Componente principal da árvore:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Layout da view direta:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Componentes visuais principais:

```txt
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/CentralPersonFocusPanel.tsx
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/treeColorPalettes.ts
```

---

## 5. Views existentes na Home

A página `Home.tsx` possui três views principais:

| View na UI | `viewMode` | Papel |
|---|---|---|
| Minha Árvore | `minha-arvore` | Visão direta individual da pessoa central |
| Genealogia | `genealogia` | Visão genealógica por gerações |
| Visão Completa | `visao-completa` | Árvore expandida/completa |

Regras:

- os ajustes deste documento se aplicam à view **Minha Árvore**;
- **Genealogia** e **Visão Completa** continuam isoladas por `viewMode`;
- não aplicar automaticamente lógica da Minha Árvore nas views por geração;
- as três views compartilham o shell `Home`, mas cada layout preserva regras próprias;
- qualquer ajuste condicionado à view deve usar `viewMode === 'minha-arvore'`.

---

## 6. Home, header e painel lateral

A página usa estrutura de tela cheia:

```txt
h-screen
flex flex-col
bg-gray-50
header no topo
main com flex-1 overflow-hidden
```

Regra consolidada em 2026-06-08:

```txt
O shell da Home deve ocupar a viewport e usar overflow-hidden/overscroll-none para impedir scroll externo indevido.
```

Isso evita que o usuário role a página com o botão de scroll do mouse quando a árvore já ocupa toda a área visível.

No desktop, o painel lateral fica em um `aside`:

```txt
aberto: w-80 p-4
fechado: w-14 p-2
conteúdo em coluna
tabs via SidebarPanelTabs
área de conteúdo com min-h-0 flex-1
```

Na view **Minha Árvore**, o painel lateral exibe a aba **Filtros** com:

```txt
DirectRelativeFilterGrid
LifeStatusKpiGrid
```

A Home é o shell comum das três rotas da árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

`/` redireciona para `/minha-arvore` preservando search params. A troca de view pelo header ou pela navegação mobile usa navegação client-side e mantém parâmetros como `pessoa=...`.

---

## 7. Menu do usuário no header da árvore

O header da árvore usa:

```tsx
<UserProfileMenu variant="home-header" />
```

Comportamento esperado:

- o botão visual permanece compacto no header;
- o conteúdo aberto deve ser o painel completo de `UserProfileMenu`, equivalente ao menu das páginas internas;
- o antigo `UserMenu` local de `Home.tsx` não deve ser recriado;
- a área superior do painel com avatar, nome e e-mail é clicável e navega para `/minha-arvore/editar`;
- o botão `X` apenas fecha o painel;
- o item **Editar notificações** não aparece mais no menu.

---

## 8. Filtros exibidos

A grade de filtros da família direta inclui grupos como:

```txt
Tataravós
Bisavós
Avós
Tios
Primos
Cônjuge
Irmãos
Filhos
Sobrinhos
Netos
Pets
```

O bloco inferior de status/tipo inclui:

```txt
Vivos
Falecidos
Pets
```

Regras específicas de filtros e pets ficam em:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 9. Título fixo e viewport da árvore

Em `FamilyTree.tsx`, o título da árvore é renderizado como overlay fixo acima do ReactFlow.

Textos esperados, conforme view:

```txt
A árvore de {primeiro nome}
Família de {primeiro nome}
Linha Genealógica de {primeiro nome}
```

Regras:

- o título geral não deve ser criado em `directFamilyDistributedLayout.ts`;
- o título geral não deve ser criado em `genealogyColumnsLayout.ts`;
- subtítulos abaixo do título podem permanecer ocultos/removidos nas views da árvore;
- em `/minha-arvore`, o título pode ter ajuste vertical específico por `viewMode`;
- o espaço entre título e cards deve ser controlado por constantes/cálculo em `FamilyTree.tsx`;
- não usar `translate`, `transform`, `top` negativo ou manipulação de `.react-flow__viewport`;
- `family-tree-visual-polish.css` não deve reposicionar o ReactFlow nem alterar bounds.

Estado consolidado:

```txt
/minha-arvore recebeu ajuste para descer levemente o título e os cards sem alterar o layout lógico das demais views.
```

Constantes e pontos relevantes em `FamilyTree.tsx`:

```txt
TREE_TITLE_TOP
TREE_TITLE_HEIGHT
TREE_DESKTOP_VISUAL_TOP_INSET
TREE_DESKTOP_VISUAL_BOTTOM_INSET
TREE_VIEWPORT_PADDING_X
TREE_VIEWPORT_PADDING_Y
TREE_DIRECT_FAMILY_VIEWPORT_BOTTOM_PADDING_Y
DIRECT_FAMILY_TRANSLATE_PADDING
DIRECT_FAMILY_MAX_ZOOM
DIRECT_FAMILY_FALLBACK_MIN_ZOOM
```

---

## 10. Viewport inicial, pan e zoom

A view **Minha Árvore** usa:

- fit inicial com zoom mínimo calculado;
- bounds baseados em cards reais;
- filtros e elementos auxiliares sem comandar zoom inicial;
- pan/zoom controlado pelo ReactFlow;
- scroll externo da página bloqueado no shell da Home.

Regras:

- zoom inicial deve considerar cards reais (`personNode`) como base visual;
- labels, group boxes, anchors e legendas não devem reduzir o zoom inicial;
- elementos auxiliares podem participar dos bounds de pan, quando necessário;
- título fixo não participa dos bounds da árvore;
- o usuário não deve conseguir rolar a página externa quando não há conteúdo fora da viewport;
- não confundir bloqueio de scroll externo com bloqueio de pan/zoom interno da árvore.

---

## 11. Prevenção do flash inicial

Foi ajustado o carregamento inicial da árvore para evitar que uma versão ampliada apareça por um frame antes do enquadramento final.

Estado consolidado:

```txt
TREE_PENDING_VIEWPORT_ZOOM = TREE_INITIAL_TECHNICAL_MIN_ZOOM
```

A `viewportSignature` considera:

```txt
viewMode
layoutRevision
containerSize.width
containerSize.height
activeTreeViewport.x
activeTreeViewport.y
activeTreeViewport.zoom
```

Controles usados:

```txt
hasAppliedCurrentViewport
canRenderReactFlow = Boolean(activeTreeViewport && viewportSignature)
```

Regras:

- wrapper do ReactFlow fica com `visibility: hidden` até o viewport atual ser aplicado;
- ReactFlow renderiza condicionalmente somente quando há viewport calculado;
- `defaultViewport` usa diretamente `activeTreeViewport.x/y/zoom`;
- a área principal pode ficar brevemente vazia;
- a árvore deve aparecer já no enquadramento correto.

---

## 12. Layout lógico da Minha Árvore

Arquivo:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

A distribuição horizontal continua baseada em três áreas:

| Área | Papel | Proporção visual |
|---|---|---|
| Esquerda | Ramo paterno | ~35% |
| Centro | Pais, pessoa central, irmãos, cônjuge e descendentes diretos | ~30% |
| Direita | Ramo materno | ~35% |

Regras:

- layout não usa offsets específicos por pessoa ou família para alinhar lados;
- separação horizontal permanece sistemática;
- não introduzir ajustes manuais por família sem decisão explícita;
- reduzir espaços laterais ociosos deve preservar gap entre colunas;
- mudanças visuais devem ser incrementais e validadas nas três paletas.

---

## 13. Área central

A área central contém:

- Pai;
- Mãe;
- Pessoa principal;
- Irmãos;
- Sobrinhos;
- Cônjuge;
- Filhos humanos;
- Pets, quando aplicável;
- Netos.

A área central usa lógica própria:

```txt
CENTRAL_PARENT_GAP
CENTRAL_LOWER_GROUP_GAP
CENTRAL_LOWER_STACK_GAP
compactLowerGroupTopPositions()
```

Não reintroduzir alinhamento inferior rígido nos grupos centrais sem decisão explícita de UX.

---

## 14. Cards de pessoa

Cards são renderizados por:

```txt
src/app/components/FamilyTree/PersonNode.tsx
```

Para relações diretas (`directRelation`):

- card recebe `layoutWidth` e `layoutHeight` definidos pelo layout;
- estilo visual vem de tokens da família direta;
- pets podem usar estilo específico;
- borda de status diferencia vivo/falecido;
- há sombra e transição de hover;
- clique abre detalhes;
- menu de contexto permite visualizar, editar, adicionar conexão e remover;
- handles do ReactFlow continuam presentes para conexões.

Regras:

- nome em cards comuns deve ocupar no máximo 2 linhas;
- nascimento/falecimento em cards comuns devem caber com ellipsis quando necessário;
- nascimento deve usar `Star` do `lucide-react`, não emoji;
- falecimento deve usar `Cross` do `lucide-react`, não emoji;
- mudanças de largura devem preservar conectores e anchors;
- evitar corte inferior de nomes/informações.

---

## 15. Card da pessoa principal

A pessoa principal usa tratamento especial:

- `directRelation = central`;
- layout vertical;
- foto/avatar acima;
- nome abaixo;
- detalhes abaixo do nome;
- fundo branco;
- texto escuro;
- borda por status vivo/falecido;
- foto clicável abre dialog com imagem ampliada.

Regra consolidada em 2026-06-08:

```txt
A borda extra/moldura interna do card principal foi removida.
Permanece apenas a borda externa relevante por status vivo/falecido e eventuais rings de foco/seleção.
```

Anti-regressão:

- não reintroduzir uma segunda borda visual em outra cor ao redor da pessoa principal;
- não remover a borda de status vivo/falecido;
- não remover feedback de foco/seleção;
- validar nas paletas `white`, `orange` e `brown`.

---

## 16. Labels, linhas e anchors

As linhas são criadas depois do posicionamento dos grupos.

O layout mede containers reais com:

```txt
getGroupBoxBounds()
```

e adiciona anchors via:

```txt
addGroupBoundaryAnchors()
```

Anchors:

- top;
- bottom;
- left;
- right;
- center.

Regra:

```txt
as conexões estruturais usam anchors, não dimensões presumidas
```

Isso permite que mudanças de escala, colunas, altura de containers e reposicionamento central sejam refletidas automaticamente nas linhas.

---

## 17. Botão conjugal e vínculo conjugal

### 17.1 Componentes

```txt
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Tipo relacionado:

```txt
src/app/components/FamilyTree/types.ts
```

Campo relevante:

```ts
visualVariant?: 'default' | 'direct-family';
```

### 17.2 Ícone atual

O botão conjugal usa ícone vetorial de `lucide-react`, conforme implementação vigente.

Regras consolidadas:

- não usar emoji;
- não usar SVG quebrado/mojibake;
- manter ícone estável;
- o ícone em `/minha-arvore` deve usar a mesma cor das linhas conectoras;
- `MarriageNode` deve respeitar tokens/variáveis de paleta;
- `GenealogySpouseEdge` deve preservar seu caminho visual próprio nas views por geração;
- manter `title` e `aria-label` como **Ver vínculo do casal** ou equivalente aprovado.

### 17.3 Variante `direct-family`

Os marriage nodes criados pelo layout direto devem receber:

```ts
visualVariant: 'direct-family'
```

Objetivo:

- ajustar tamanho/força visual na view direta;
- preservar clique no modal conjugal;
- preservar dimensão lógica do nó;
- preservar handles invisíveis;
- preservar edges;
- evitar interferência no clique dos cards próximos.

### 17.4 Anti-regressão

Não fazer:

- voltar a exibir emoji corrompido como `??`;
- reintroduzir emoji de aliança;
- deixar o botão parecendo círculo vazio;
- usar cor fixa que ignore paleta ativa;
- esconder o ícone por falta de contraste;
- alterar dimensão lógica do node para resolver problema visual sem recalcular layout;
- quebrar clique no modal conjugal.

---

## 18. Paletas visuais e containers de grupo

A view **Minha Árvore** respeita a paleta visual global escolhida no seletor da árvore.

Paletas definidas em:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
```

Paletas atuais:

```txt
white
orange
brown
```

Impactos na view direta:

- cards de parentes usam cores derivadas da paleta ativa;
- containers de grupo usam background, borda e largura de borda por CSS variables;
- paleta branca preserva visual padrão;
- paleta laranja incorpora variação visual quente;
- paleta marrom aplica identidade editorial bege/marrom;
- escolha da paleta não altera geometria, filtros, contadores ou dados;
- conectores e ícone conjugal devem acompanhar tokens de linhas.

---

## 19. Busca no header da árvore

A busca do header é compartilhada pelas rotas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Comportamento consolidado:

- botão de busca deve ser clicável em toda a área visual;
- campo usa placeholder **Buscar pessoa ou página...**;
- sugestões aparecem automaticamente ao digitar;
- sugestões incluem pessoas e páginas;
- páginas locais importantes, como **Notificações** e **Ajustar Notificações**, devem aparecer quando o termo bater;
- usuário pode abrir página completa de resultados;
- clicar fora fecha sugestões;
- pressionar `Esc` fecha sugestões;
- sugestões devem ficar acima do canvas da árvore.

Para pessoas sugeridas, a linha secundária deve seguir:

```txt
Cidade de nascimento – DD/MM/AAAA
```

Não exibir cidade atual nessa linha.

---

## 20. Legendas > Linhas

A opção **Todas** em **Legendas > Linhas** deve ocultar todas as linhas da árvore.

Isso inclui:

- linhas de filiação;
- linhas de irmãos;
- linhas conjugais quando aplicável ao filtro;
- linhas horizontais e verticais que conectam cards de primos.

Regra anti-regressão:

```txt
se usuário desliga Todas, nenhuma linha estrutural de primos deve permanecer visível
```

---

## 21. Validação visual obrigatória

Após qualquer ajuste futuro nesta view, validar:

### View

- [ ] Minha Árvore abre sem flash ampliado inicial.
- [ ] Zoom inicial fica no mínimo esperado.
- [ ] Página externa não rola com mouse quando não há conteúdo fora da viewport.
- [ ] ReactFlow continua permitindo interações previstas.
- [ ] Genealogia permanece funcional.
- [ ] Visão Completa permanece funcional.

### Header

- [ ] Busca abre e fecha corretamente.
- [ ] Sugestões de pessoas e páginas aparecem.
- [ ] Seletor de views não fica coberto pelo header.
- [ ] Menu do usuário não fica coberto pelo header.
- [ ] Botão compacto do menu abre o painel de `UserProfileMenu`.
- [ ] Cabeçalho do menu navega para `/minha-arvore/editar`.
- [ ] Botão `X` apenas fecha.

### Título e cards

- [ ] Título aparece com respiro superior.
- [ ] Cards ficam próximos o suficiente do título sem corte.
- [ ] Nenhum card superior é cortado.
- [ ] Ajuste de `/minha-arvore` não altera `/genealogia` e `/visao-completa`.

### Card principal

- [ ] Borda extra foi removida.
- [ ] Borda por status vivo/falecido permanece.
- [ ] Foco/seleção continuam visíveis.
- [ ] Paletas `white`, `orange` e `brown` continuam legíveis.

### Linhas e botão conjugal

- [ ] Títulos dos grupos estão legíveis.
- [ ] Linhas estruturais conectam anchors corretos.
- [ ] Highlights continuam funcionando.
- [ ] Legendas > Linhas > Todas oculta linhas de primos.
- [ ] Botão conjugal está visível em `/minha-arvore`.
- [ ] Ícone conjugal usa cor compatível com linhas conectoras.
- [ ] Clique na aliança abre modal conjugal.

### Técnico

```bash
npm run build
git diff --check
git status --short
```

Se houver scripts disponíveis:

```bash
npm test
npm run test:e2e
```

---

## 22. Anti-regressões

Não fazer:

- reativar scroll externo da Home quando a árvore ocupa a viewport;
- resolver espaço do título com `translate` em `.react-flow__viewport`;
- alterar `/genealogia` e `/visao-completa` por efeito colateral de ajuste da Minha Árvore;
- reintroduzir borda dupla no card principal;
- fixar cor do ícone conjugal ignorando paletas;
- trocar ajuste visual por migration ou alteração de banco;
- criar offsets por nome de pessoa/família;
- duplicar menu do usuário no header;
- usar emoji para nascimento, falecimento ou casamento;
- quebrar exportação, legenda ou seleção de área.

---

## 23. Sugestões futuras

Possíveis evoluções:

1. Medir altura real do card central.
2. Transformar constantes em parâmetros configuráveis.
3. Registrar snapshots visuais por paleta.
4. Criar modo debug de geometria central.
5. Criar documentação visual com imagens de antes/depois.
6. Criar QA automatizado específico para presença visual de alianças.
7. Criar snapshot visual controlado para as três views da árvore.

---

## 24. Resumo do estado atual

A view **Minha Árvore** está estruturada como composição de três áreas:

- ramo paterno à esquerda;
- área central independente;
- ramo materno à direita.

A área central usa lógica própria, com pessoa principal maior, Pai/Mãe acima e grupos inferiores posicionados em pilhas compactas.

O ReactFlow só aparece após o viewport final estar calculado e aplicado, evitando flash inicial de árvore ampliada.

O shell da Home bloqueia scroll externo indevido. O título e os cards da `/minha-arvore` têm ajuste visual específico, sem alterar o layout lógico das views por geração.

O card principal mantém apenas a borda externa por status/foco. O botão conjugal acompanha a cor das linhas conectoras e deve respeitar as paletas `white`, `orange` e `brown`.

---
