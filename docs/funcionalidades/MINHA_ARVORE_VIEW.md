# Minha Árvore - view, layout e viewport

> Última revisão: 2026-06-11  
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Minha Árvore**.  
> Status: atualizado com a malha mobile 3×3, tela Central, ancestrais globais, conectores em contexto rolável, preview de swipe, cards mobile com anos, avatar visual por `genero`, card central sem badge e distinção entre `/minha-arvore` e `/mapa-familiar`.

## 1. Função deste documento

Este documento descreve a view direta **Minha Árvore**, acessada pela rota:

```txt
/minha-arvore
```

Use este arquivo para manter:

- shell da Home aplicado à árvore;
- viewport, pan, zoom e scroll da view direta ReactFlow;
- distribuição da pessoa central e dos grupos diretos na Minha Árvore;
- regras de filtros diretos na Minha Árvore;
- largura e alinhamento dos cards compactos da view direta;
- group boxes, labels e âncoras dos grupos ReactFlow;
- integração com painel lateral, legenda e ações;
- controles mobile da árvore;
- experiência mobile segmentada 3×3;
- anti-regressões específicas da view direta.

Não use este documento para detalhar o Mapa Familiar panorâmico desktop/tablet. Essa view possui documento próprio:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Outros documentos relacionados:

| Tema | Documento |
|---|---|
| Mapa Familiar panorâmico | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| edição do próprio perfil | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` |
| filtros e pets em detalhe | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| legendas, linhas e conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| componentes | `docs/GUIA_COMPONENTES.md` |
| UX geral | `docs/GUIA_UX_LAYOUT.md` |
| Genealogia e Visão Completa | `docs/funcionalidades/GENEALOGIA_VIEW.md` |

---

## 2. Nota de verificação contra o código atual

Estado atual da frente:

- `/minha-arvore` desktop/tablet continua usando `FamilyTree.tsx` com ReactFlow.
- `/minha-arvore` mobile usa `MobileFamilyTreeView.tsx`, com experiência segmentada própria.
- `/mapa-familiar` desktop/tablet usa `DesktopFamilyMapView.tsx`, documentado em `MAPA_FAMILIAR_VIEW.md`.
- `/mapa-familiar` mobile usa fallback seguro para `MobileFamilyTreeView`.
- A antiga aba mobile **Núcleo** foi substituída por **Central**.
- A antiga aba mobile **Completa** não deve reaparecer.
- O fluxo mobile antigo de sete telas foi substituído pela malha 3×3 documentada abaixo.
- Conectores do mobile são HTML/CSS próprios, não edges ReactFlow.
- Conectores do Mapa Familiar são SVG por âncoras, documentados em `MAPA_FAMILIAR_VIEW.md`.
- Na tela Central mobile, os conectores entre ancestrais, Pai/Mãe e pessoa central devem viver no mesmo contexto rolável dos cards para não se desalinharem durante scroll vertical.
- Cards mobile exibem apenas o ano nas linhas vitais ao lado dos ícones de nascimento e falecimento.
- O card principal mobile não exibe badge **VOCÊ**; labels como **PAI** e **MÃE** permanecem.
- Avatares mobile reutilizam a lógica visual compartilhada de `FamilyTreeVisualCards.tsx`: foto real primeiro; fallback por `genero` (`homem`, `mulher`, `pet`).

Regra documental:

```txt
Documentar neste arquivo apenas a Minha Árvore direta e seu fallback/experiência mobile.
Detalhes profundos do Mapa Familiar pertencem a MAPA_FAMILIAR_VIEW.md.
```

---

## 3. Estado atual

A view **Minha Árvore** está consolidada no MVP.

Ela renderiza uma visão individual da pessoa central, com:

- pessoa central;
- pais;
- avós, bisavós e tataravós;
- cônjuge;
- irmãos;
- filhos;
- netos;
- tios, primos e sobrinhos;
- pets quando vinculados;
- filtros de grupos;
- filtros por vivo/falecido/pet;
- linhas de parentesco e destaques;
- clique em pessoa para abrir perfil;
- clique em relacionamento conjugal para abrir modal;
- ações de exportação pelo painel lateral no desktop;
- painel compacto de controles no mobile.

A view direta possui ajuste visual próprio: os cards compactos dos grupos laterais, inferiores e centrais podem ser exibidos mais largos do que o padrão lógico original, preservando o card central e sem contaminar as views de Genealogia/Visão Completa.

---

## 4. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Shell da árvore, estado, filtros e navegação | `src/app/pages/Home.tsx` |
| Header da Home pós-login | `src/app/pages/home/HomeHeader.tsx` |
| Área principal da árvore | `src/app/pages/home/HomeTreeSection.tsx` |
| Navegação mobile da Home | `src/app/pages/home/HomeMobileNav.tsx` |
| Componente ReactFlow da árvore | `src/app/components/FamilyTree/FamilyTree.tsx` |
| Controles mobile da árvore | `src/app/components/FamilyTree/MobileTreeControlsPortal.tsx` |
| Layout mobile segmentado da Minha Árvore | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` |
| Estilos dos controles mobile | `src/styles/mobile-tree-controls.css` |
| Ajustes visuais complementares da árvore | `src/styles/family-tree-visual-polish.css` |
| Layout direto ReactFlow | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` |
| Nodes customizados e ajuste de largura visual | `src/app/components/FamilyTree/nodeTypes.ts` |
| Cards ReactFlow de pessoa | `src/app/components/FamilyTree/PersonNode.tsx` |
| Painel especial da pessoa central | `src/app/components/FamilyTree/CentralPersonFocusPanel.tsx` |
| Nó de relacionamento conjugal | `src/app/components/FamilyTree/MarriageNode.tsx` |
| Cores/tokens | `src/app/components/FamilyTree/visualTokens.ts` e `directFamilyColors.ts` |
| Tipos e filtros | `src/app/components/FamilyTree/types.ts` |

Arquivo relacionado, mas documentado separadamente:

| Responsabilidade | Arquivo |
|---|---|
| Mapa Familiar panorâmico desktop/tablet | `src/app/components/FamilyTree/DesktopFamilyMapView.tsx` |
| Cards visuais do Mapa Familiar | `src/app/components/FamilyTree/FamilyTreeVisualCards.tsx` |

---

## 5. Rotas e `viewMode`

A Home pós-login trabalha com quatro views principais da árvore:

| Rota | `viewMode` | Escopo | Renderização |
|---|---|---|---|
| `/minha-arvore` | `minha-arvore` | família direta da pessoa central | ReactFlow desktop/tablet; `MobileFamilyTreeView` mobile |
| `/mapa-familiar` | `mapa-familiar` | mapa panorâmico da família direta | `DesktopFamilyMapView` desktop/tablet; fallback mobile |
| `/genealogia` | `genealogia` | escopo pessoal por gerações | ReactFlow |
| `/visao-completa` | `visao-completa` | base familiar completa por gerações | ReactFlow |

Regras da Minha Árvore:

- ajustes deste documento devem ser condicionados a `viewMode === 'minha-arvore'` ou a sinais equivalentes de layout direto;
- não aplicar ajustes da view direta em `genealogia`, `visao-completa` ou `mapa-familiar` sem validação específica;
- trocar view deve usar helpers de `treeViewMode.ts`;
- search params, como `?pessoa=...`, devem ser preservados na troca de view;
- alterações em `nodeTypes.ts` precisam ser validadas nas três rotas ReactFlow.

---

## 6. Shell da Home

`Home.tsx` usa shell fixo na viewport:

```txt
fixed inset-0
flex flex-col
overflow-hidden
overscroll-none
```

A área principal usa:

```txt
relative flex min-h-0 flex-1 overflow-hidden overscroll-none
```

Regras:

- a página externa não deve rolar quando a árvore ocupa a viewport;
- pan/zoom interno do ReactFlow deve continuar funcionando;
- não resolver scroll externo quebrando a interação do canvas;
- `HomeTreeSection` deve manter `overflow-hidden` e `overscroll-none`;
- sidebar desktop e painel mobile devem ter rolagem própria quando necessário.

---

## 7. Pessoa central

A pessoa central é definida por prioridade:

1. `?pessoa=...`, quando válido;
2. pessoa vinculada ao usuário (`user_person_links`);
3. seleção local;
4. primeira pessoa carregada como fallback.

Em `FamilyTree`, a referência efetiva é:

```txt
centralPersonId || selectedPersonId || pessoas[0]?.id
```

Regras:

- a pessoa central deve permanecer visível mesmo quando filtros por status ocultam outras pessoas;
- em `/minha-arvore`, `isSelected` e `isCentralPerson` são aplicados apenas para essa view;
- quando houver somente a pessoa central real renderizada, o componente pode usar `CentralPersonFocusPanel`;
- o card central da pessoa foco não deve receber a ampliação visual aplicada a pai, mãe, cônjuge, irmãos, descendentes e pets.

---

## 8. Filtros da view direta

A view direta combina quatro grupos de filtros.

| Estado | Função |
|---|---|
| `edgeFilters` | controla linhas visíveis no ReactFlow |
| `visualLineFilters` | controla destaque visual de linhas visíveis |
| `personFilters` | controla cards por vivo/falecido/pet |
| `directRelativeFilters` | controla grupos diretos da Minha Árvore |

`directRelativeFilters` usa:

```txt
pais
avos
bisavos
tataravos
conjuge
filhos
netos
irmaos
sobrinhos
tios
primos
pets
```

Regras:

- `directRelativeFilters` é compartilhado conceitualmente com o Mapa Familiar, mas cada view interpreta alguns grupos visualmente de forma própria;
- em mobile, a view direta usa `DEFAULT_DIRECT_RELATIVE_FILTERS`;
- `pets` permanece sempre ativo nos filtros diretos efetivos quando a regra de produto assim determinar;
- filtros de linha não devem ocultar cards;
- filtros de destaque não devem recriar linhas ocultas;
- contadores devem respeitar o escopo visual da view direta.

Observação sobre **Cônjuges**:

- o rótulo do painel deve ser **Cônjuges**;
- no Mapa Familiar, esse filtro possui regras próprias descritas em `MAPA_FAMILIAR_VIEW.md`;
- na Minha Árvore ReactFlow, validar separadamente se o filtro controla cônjuge principal ou grupos colaterais.

---

## 9. Layout direto ReactFlow

O layout principal é:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Ele monta:

- grupos laterais paternos e maternos;
- centro com pais, pessoa central, cônjuge, irmãos e descendentes;
- group boxes;
- labels de grupos;
- anchors estruturais;
- edges estruturais;
- nós conjugais;
- separação visual de filhos humanos e pets.

Áreas conceituais:

| Área | Papel |
|---|---|
| esquerda | ramo paterno e colaterais |
| centro | núcleo direto da pessoa central |
| direita | ramo materno e colaterais |
| faixa inferior | descendentes, netos e pets |

Regras:

- título geral não deve ser criado pelo layout;
- labels de grupo podem existir;
- group boxes e anchors não devem comandar o zoom inicial;
- alterações em constantes de posição devem ser validadas em desktop e mobile;
- cards diretos devem preservar legibilidade;
- a ampliação atual dos cards centrais é uma decisão de UI específica da Minha Árvore, não um novo padrão global de cards.

---

## 10. Largura dos cards compactos da Minha Árvore

A view direta possui cards com dimensões lógicas calculadas pelo layout e uma camada de ajuste visual complementar.

Dimensões de referência:

| Tipo | Largura | Altura | Observação |
|---|---:|---:|---|
| Card central da pessoa foco | `620px` | `760px` | Não deve ser ampliado pelo ajuste de cards compactos. |
| Cards compactos da Minha Árvore | `340px` | `136px` | Podem ser exibidos visualmente com `360px`. |
| Cards de `/genealogia` e `/visao-completa` | `410px` | `190px` | Não devem herdar a largura de `360px`. |

Escopo da ampliação visual atual:

| Grupo/relação | Pode exibir `360px`? | Observação |
|---|---:|---|
| Pai | Sim | Card central superior. |
| Mãe | Sim | Card central superior. |
| Irmãos | Sim | Não deve cortar nomes com reticências quando houver espaço. |
| Sobrinhos | Sim | Não deve cortar nomes com reticências quando houver espaço. |
| Cônjuge | Sim | Deve permanecer alinhado ao núcleo central. |
| Filhos | Sim | Quando existirem, seguem padrão compacto ampliado. |
| Netos | Sim | Quando existirem, seguem padrão compacto ampliado. |
| Pets | Sim | Mantêm distinção visual de pet. |
| Avós, bisavós e tataravós | Sim | Podem usar `360px`, mas não devem deslocar a árvore para fora da área útil. |
| Tios e primos laterais | Sim | Validar linhas internas e group boxes. |
| Pessoa central | Não | Mantém dimensão própria. |
| Genealogia/Visão Completa | Não | Mantêm `410px × 190px`. |
| Mapa Familiar | Não se aplica | Usa `FamilyTreeVisualCards`, documentado em `MAPA_FAMILIAR_VIEW.md`. |

Regra técnica consolidada:

```txt
A ampliação de cards compactos ReactFlow deve ser restrita à viewMode === 'minha-arvore'.
```

---

## 11. Grupos, labels e anchors após ampliação

Após a ampliação dos cards compactos, grupos visuais, labels e anchors precisam continuar coerentes.

Grupos que exigem validação após alteração de largura:

```txt
PAI
MÃE
AVÓS PATERNOS
BISAVÓS PATERNOS
TATARAVÓS PATERNOS
TIOS PATERNOS
PRIMOS PATERNOS
IRMÃOS
SOBRINHOS
CÔNJUGE
FILHOS
NETOS
PETS
AVÓS MATERNOS
BISAVÓS MATERNOS
TATARAVÓS MATERNOS
TIOS MATERNOS
PRIMOS MATERNOS
```

Regras:

- `directFamilyGroupBoxNode` deve acompanhar visualmente a largura dos cards contidos quando o ajuste for estrutural;
- labels (`directFamilyLabelNode`) devem permanecer centralizadas no centro visual do group box;
- anchors invisíveis (`directFamilyAnchorNode`) devem acompanhar bordas e centros visuais dos grupos;
- linhas devem conectar bordas/centros atuais, não coordenadas antigas;
- grupos laterais de **Tios** e **Primos** devem evitar linhas horizontais excessivamente longas entre cards;
- grupos centrais do lado direito devem crescer em direção ao centro quando necessário;
- ajustes puramente visuais por CSS não devem quebrar hitbox, clique, pan ou cálculo de bounds.

---

## 12. Layout mobile segmentado da Minha Árvore

No mobile, a `/minha-arvore` não usa o canvas ReactFlow. A experiência direta é renderizada por:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Estrutura atual:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Abas superiores:

```txt
Paterno | Central | Materno
```

Comportamento:

- **Paterno** abre a tela de Tios Paternos;
- **Central** abre a tela central;
- **Materno** abre a tela de Tios Maternos;
- swipe para cima a partir da Central abre Ancestrais globais;
- swipe lateral a partir da Central abre tios paternos/maternos;
- swipe para baixo a partir dos tios abre os respectivos primos;
- swipe para cima a partir dos primos volta aos respectivos tios;
- a tela de Ancestrais globais permite retornar para Central ou ir para os tios por gesto lateral;
- o gesto de swipe exibe pré-visualização parcial da próxima tela durante o movimento.

Regras visuais:

- Ancestrais globais ficam em tela própria acima da Central, não como continuidade vertical da Central;
- ramos paterno e materno de ancestrais ficam em duas colunas;
- grupos de ancestrais são **Tataravós**, **Bisavós** e **Avós**;
- primos exibem todos os cards, sem botão **Ver todos**;
- telas com muitos cards usam rolagem vertical interna e padding inferior contra a bottom navigation;
- conectores HTML/CSS do mobile não são edges ReactFlow;
- linhas de Pai/Mãe acompanham o scroll da tela Central;
- não deve haver linha inferior abaixo de primos.

---


### 12.1 Regras recentes de cards e conectores mobile

Estas regras valem para `/minha-arvore` mobile e para o fallback mobile de `/mapa-familiar`, pois ambas as rotas usam `MobileFamilyTreeView.tsx` nesse breakpoint.

| Elemento | Regra atual |
|---|---|
| Linhas de avós → Pai/Mãe | Devem acompanhar o scroll da tela Central e permanecer alinhadas aos cards. Não usar conectores fixos fora do container rolável quando o card relacionado rola. |
| Linhas de Pai/Mãe → pessoa central | Devem permanecer centralizadas mesmo quando a área central é rolada para cima ou para baixo. |
| Linhas vitais dos cards | Exibir apenas o ano ao lado de `Star` e `Cross`. Não exibir local/cidade/UF no mobile. |
| Card principal | Não exibir badge **VOCÊ** no mobile. |
| Pai/Mãe | Manter labels **PAI** e **MÃE** quando presentes. |
| Avatar sem foto real | Usar fallback visual por `genero`: `homem`, `mulher` ou `pet`. |
| Foto real | `foto_principal_url` tem prioridade sobre qualquer fallback visual. |

Anti-regressões:

- não reintroduzir local de nascimento/falecimento nos cards mobile;
- não usar iniciais como fallback principal quando houver fallback visual por `genero` disponível;
- não posicionar conectores de ancestrais fora do scroll se eles precisam acompanhar Pai/Mãe;
- não remover labels de Pai/Mãe ao remover o badge do card principal;
- validar 320px, 375px, 390px e 430px sempre que mexer em cards, conectores ou scroll.

## 13. Viewport, pan, zoom e scroll

`FamilyTree.tsx` calcula bounds e viewport a partir dos nós renderizados.

Regras consolidadas:

- `personNode` deve comandar o enquadramento visual principal;
- labels, group boxes e anchors não devem reduzir indevidamente o zoom inicial;
- título fixo não participa dos bounds do canvas;
- `translateBounds` pode incluir mais elementos que `viewportBounds`;
- em `/minha-arvore`, o fit usa modo `contain`;
- em desktop, o viewport pode restaurar o enquadramento inicial quando o zoom chega ao mínimo;
- em mobile, a pessoa central pode comandar bounds específicos;
- no desktop, quando a árvore já está enquadrada e não existe conteúdo acima, o scroll do mouse para cima não deve deslocar a árvore indevidamente;
- pan/zoom interno do ReactFlow deve continuar funcionando para navegação lateral e inferior.

Não fazer:

- reposicionar `.react-flow__viewport` com `transform` global;
- usar `top` negativo para corrigir corte;
- usar CSS global para alterar bounds;
- alterar zoom da Genealogia ao corrigir a Minha Árvore;
- incluir labels/group boxes como principal referência de fit inicial;
- permitir scroll externo da página quando a árvore já ocupa a viewport.

---

## 14. Título fixo

Em `/minha-arvore`, o título desktop/tablet deve usar o padrão:

```txt
Árvore de {primeiro nome}
```

Exemplo:

```txt
Árvore de Tulius
```

Regras:

- o título visível da view é renderizado pelo shell da Home/área da árvore, não pelo layout do ReactFlow;
- o texto antigo **A árvore de {nome}** não deve voltar;
- no mobile, o texto de orientação sobre a árvore deve permanecer oculto quando competir com a navegação;
- não criar title node no layout;
- não duplicar subtítulo dentro do canvas;
- o espaçamento abaixo do título deve permitir que os cards iniciem com respiro visual;
- validar corte superior de cards após qualquer alteração.

---

## 15. Linhas e relacionamento conjugal

A view direta recebe:

```txt
edgeFilters
visualLineFilters
onMarriageClick
```

Regras:

- `edgeFilters.conjugal` controla linhas conjugais;
- `edgeFilters.filiacao_sangue` e `edgeFilters.filiacao_adotiva` controlam linhas parentais;
- `edgeFilters.irmaos` controla linhas/trechos de irmãos quando suportado;
- destaque visual só altera estilo de linhas visíveis;
- linha oculta por filtro permanece oculta mesmo com destaque ativo;
- o nó conjugal usa `MarriageNode` e abre `ViewMarriageModal`;
- o ícone de aliança e a borda circular do nó conjugal devem acompanhar a cor dos conectores conforme a paleta ativa.

---

## 16. Modal de relacionamento conjugal

O clique no nó conjugal abre `ViewMarriageModal`.

Comportamento consolidado:

- cabeçalho com ícone de coração, título e botão fechar na mesma linha;
- frase usa “são casados” quando relacionamento está ativo e ambos vivos;
- frase usa “foram casados” quando há separação/fim, `ativo === false`, subtipo separado ou falecimento;
- **Inserir Informações** abre formulário textual;
- **+** em Arquivos Históricos abre upload de arquivo do relacionamento.

---

## 17. Painel lateral

No desktop, a sidebar exibe:

| Aba | Conteúdo |
|---|---|
| Filtros | `DirectRelationKpiGrid` ou `GenealogyFilterGrid`, conforme view |
| Legendas | `TreeLegend` |
| Ações | `SidebarInfoPanel` |

Na Minha Árvore:

- a aba **Filtros** usa `DirectRelationKpiGrid`;
- o rodapé usa `LifeStatusKpiGrid`;
- a aba **Legendas** recebe `directRelativeFilters`;
- o botão **Ações** aciona exportação/impressão/seleção de área.

No mobile:

- a sidebar desktop não aparece;
- `HomeMobileNav` controla abertura do painel inferior;
- o painel inferior mostra as mesmas abas conceituais com altura máxima e rolagem própria.

Regras:

- desktop não deve gerar scroll vertical no painel lateral;
- mobile pode usar rolagem interna controlada;
- a ausência de scroll desktop não deve cortar ações essenciais.

---

## 18. Controles mobile da árvore

Arquivos:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/styles/mobile-tree-controls.css
src/main.tsx
```

Rotas atendidas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Ações esperadas no painel mobile:

```txt
Zoom +
Zoom -
Reajustar
Ocultar/Exibir setas
PDF
Imagem
Imprimir
Seleção
```

Regras:

- o portal deve aparecer apenas nas rotas da árvore;
- os botões `+` e `-` antigos do canvas devem ficar ocultos no mobile;
- o botão de seta para cima deve manter a mesma formatação dos demais botões direcionais;
- o usuário deve conseguir ocultar/exibir setas direcionais;
- ações de exportação mobile não devem alterar estado de dados.

---

## 19. Paletas

A view direta respeita as paletas globais da árvore:

```txt
white
orange
brown
visual
```

Regras:

- paleta é decisão visual da Home/header;
- no mobile, a paleta também pode aparecer no menu do usuário via `MobileUserMenuPalettePortal`;
- componentes da árvore devem consumir tokens/CSS variables;
- não hardcodar cor nova sem checar `treeColorPalettes.ts`;
- o modo direto deve preservar contraste dos cards e linhas.

A paleta `visual` foi adicionada para acomodar a estética do Mapa Familiar e dos cards visuais, mas não deve quebrar as views ReactFlow.

---

## 20. Exportação

A exportação da Minha Árvore ReactFlow usa ações expostas por `FamilyTreeActions`:

```txt
saveImage
savePdf
print
startAreaSelection
```

Regras:

- exporta a área visível/capturada, não necessariamente a árvore completa;
- seleção de área bloqueia pan/zoom temporariamente;
- no mobile, há painel rápido de exportação por `MobileTreeControlsPortal`;
- detalhes funcionais ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

Observação:

- exportação do **Mapa Familiar** é tema separado e deve ser documentada em `MAPA_FAMILIAR_VIEW.md` e `EXPORTACAO_ARVORE.md`.

---

## 21. QA mínimo

Validar após alteração em `/minha-arvore`:

- desktop: 1366px, 1440px e largura maior;
- mobile: 320px, 375px, 390px e 430px;
- malha mobile: Ancestrais globais, Central, Tios Paternos, Tios Maternos, Primos Paternos e Primos Maternos;
- ausência de overflow horizontal no layout mobile segmentado;
- header sem scroll externo;
- painel lateral desktop sem scroll vertical;
- pan/zoom interno funcional;
- scroll do mouse para cima não desloca a árvore quando não há conteúdo acima;
- pessoa central visível;
- card central sem ampliação indevida;
- cards compactos da Minha Árvore com largura visual prevista;
- nomes longos sem `...` quando houver espaço suficiente para quebra de linha;
- grupos acompanhando visualmente a largura dos cards;
- labels dos grupos centralizadas;
- linhas conectando bordas/âncoras corretas dos grupos;
- aliança conjugal com cor coerente com conectores/paleta;
- botão de favorito posicionado junto aos controles de zoom no desktop;
- cônjuge abre modal;
- filtros de grupos ocultam cards corretos;
- filtros de linhas não removem cards;
- destaque não recria linha oculta;
- pets não entram como filhos humanos;
- controles mobile aparecem apenas nas rotas da árvore;
- botão de ocultar/exibir setas funciona;
- exportação continua funcionando;
- troca para `/mapa-familiar`, `/genealogia` e `/visao-completa` sem regressão.

---

## 22. Anti-regressões

Não fazer:

- misturar regras de `minha-arvore` com `genealogia`;
- misturar regras de `minha-arvore` com `mapa-familiar`;
- aplicar largura de `360px` em `/genealogia` ou `/visao-completa`;
- aplicar aumento visual no card central da pessoa foco;
- deixar cards compactos com nomes truncados por `...` quando há espaço para quebra de linha;
- persistir inferência visual no Supabase;
- mover título para dentro do layout;
- reverter o título para **A árvore de {nome}**;
- incluir anchors/group boxes no zoom visual principal;
- remover `overflow-hidden` do shell fixo sem testar scroll;
- permitir deslocamento para cima por wheel quando não há conteúdo acima;
- usar `window.location` para trocar view;
- criar migration para ajuste visual;
- alterar RLS/Storage/Auth para corrigir problema de layout;
- criar novo controle mobile fora do portal sem remover o anterior;
- tratar `MobileFamilyTreeView.tsx` como se fosse ReactFlow;
- permitir linha horizontal solta saindo do topo/lateral do grupo no mobile segmentado;
- deixar controles fixos competindo com navegação inferior mobile;
- corrigir conexão de linha apenas no SVG sem revisar anchors dos grupos;
- transformar `family-tree-visual-polish.css` em área sem escopo por rota/view.
