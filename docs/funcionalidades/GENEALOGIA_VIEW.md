# Genealogia - view, layout e navegação mobile

> Última revisão: 2026-06-11  
> Local canônico: `docs/funcionalidades/GENEALOGIA_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Genealogia** e do comportamento compartilhado com **Visão Completa**.  
> Status: revisado após consolidação de `/mapa-familiar-horizontal`, atualização dos cabeçalhos de geração em pílula escura, manutenção dos chips mobile, distinção entre views ReactFlow e views visuais do Mapa Familiar.

## 1. Função deste documento

Este documento descreve a view **Genealogia**, acessada por:

```txt
/genealogia
```

A view organiza o escopo pessoal da pessoa central em colunas por geração e, no mobile, oferece navegação por chips de geração. O padrão mobile também é usado em `/visao-completa`, mas o escopo de dados é diferente.

Use este arquivo para manter:

- modelo de gerações;
- layout por colunas;
- inferência visual de geração;
- base mobile com gerações inferidas;
- chips mobile;
- foco/enquadramento;
- reset de geração ativa por view;
- distinção entre Genealogia e Visão Completa;
- padrão de tamanho dos cards em views por geração;
- formatação dos cabeçalhos de coluna `Geração N`;
- anti-regressões de pan/zoom/ReactFlow;
- isolamento entre ajustes da Minha Árvore e views do Mapa Familiar.

---

## 2. Diferença entre views

| View | Rota | `viewMode` | Escopo | Renderização |
|---|---|---|---|---|
| Minha Árvore | `/minha-arvore` | `minha-arvore` | família direta da pessoa central | ReactFlow desktop; `MobileFamilyTreeView` mobile |
| Mapa Familiar Vertical | `/mapa-familiar` | `mapa-familiar` | família direta visual | HTML/CSS/SVG; mobile usa `MobileFamilyTreeView` |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | `mapa-familiar-horizontal` | família direta por gerações | HTML/CSS/SVG próprio |
| Genealogia | `/genealogia` | `genealogia` | escopo pessoal por gerações | ReactFlow |
| Visão Completa | `/visao-completa` | `visao-completa` | base familiar completa por gerações | ReactFlow |

Regras:

- este documento trata principalmente de `genealogia`;
- quando citar `/visao-completa`, tratar apenas comportamento compartilhado de layout/mobile;
- `/mapa-familiar-horizontal` pode usar `genealogyColumnsLayout` como referência de ordenação, mas não é view ReactFlow e não pertence ao escopo funcional de Genealogia;
- ajustes da Minha Árvore ou Mapa Familiar não devem ser aplicados automaticamente aqui;
- ajustes transversais em `PersonNode`, nodes, edges ou dimensões devem validar `/genealogia` e `/visao-completa`.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Estado global da árvore | `src/app/pages/Home.tsx` |
| Área principal da árvore | `src/app/pages/home/HomeTreeSection.tsx` |
| Chips mobile | `src/app/pages/home/GenealogyMobileStageTabs.tsx` |
| Componente ReactFlow | `src/app/components/FamilyTree/FamilyTree.tsx` |
| Controles mobile da árvore | `src/app/components/FamilyTree/MobileTreeControlsPortal.tsx` |
| Layout por gerações | `src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts` |
| Filtro de escopo pessoal | `src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts` |
| Tipos/filtros/nodes | `src/app/components/FamilyTree/types.ts` e `nodeTypes.ts` |
| Card de pessoa | `src/app/components/FamilyTree/PersonNode.tsx` |
| Cabeçalhos de coluna | `src/app/components/FamilyTree/DirectFamilyLabelNode.tsx` |
| Conector de família | `src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx` |
| Edge conjugal | `src/app/components/FamilyTree/GenealogySpouseEdge.tsx` |

---

## 4. Modelo de gerações

Modelo visual atual:

| Geração | Label mobile | Uso |
|---:|---|---|
| 1 | Tataravós | ascendentes mais distantes no modelo atual |
| 2 | Bisavós | bisavós da pessoa central |
| 3 | Avós | avós da pessoa central |
| 4 | Pais | pais da pessoa central |
| 5 | Núcleo | pessoa central, cônjuges e núcleo imediato |
| 6 | Descendentes | filhos, netos e descendentes no limite atual |

Regras:

- chips usam labels humanos;
- labels técnicos de coluna podem continuar como `Geração N`;
- colunas vazias não devem ser renderizadas;
- gerações sem pessoas não devem aparecer nos chips;
- pessoas sem geração podem ser ocultadas em `/visao-completa` quando `hideUngenerated` estiver ativo;
- inferência visual de geração não substitui dado administrativo quando houver `manual_generation` consistente.

---

## 5. Escopo da Genealogia

Em `FamilyTree.tsx`:

- `viewMode === 'visao-completa'` usa o grafo completo;
- `viewMode === 'genealogia'` usa `filterGraphToPersonalScope`;
- o escopo pessoal é calculado a partir da pessoa central;
- apenas humanos participam do layout genealógico por gerações;
- pets devem ficar fora do layout genealógico.

Regras:

- não ampliar Genealogia para base completa sem alterar `viewMode`;
- não inserir pets no layout por gerações;
- não persistir alterações de geração feitas apenas para renderização;
- não aplicar filtros diretos da Minha Árvore como se fossem filtros de Genealogia.

---

## 6. Inferência visual de gerações

`FamilyTree.tsx` usa inferência visual de gerações antes de chamar `genealogyColumnsLayout`. Em mobile, `HomeTreeSection.tsx` também prepara a base visual inferida para que `GenealogyMobileStageTabs` e `FamilyTree` trabalhem com a mesma referência de gerações.

Comportamento esperado:

- inferência acontece em memória;
- nenhum dado real é gravado no Supabase;
- pessoa central é referência do cálculo;
- pais sobem geração;
- filhos descem geração;
- cônjuges permanecem na mesma geração;
- resultado é repassado aos `personNodes` usados no layout.

Objetivo:

- reduzir dependência de `manual_generation` em casos incompletos;
- evitar que ancestrais conectados corretamente fiquem fora da Genealogia;
- manter coerência entre desktop e mobile;
- impedir divergência entre chips mobile e colunas renderizadas.

Observação técnica: se a inferência for alterada no futuro, evitar duplicar regras em componentes diferentes. Preferir extrair a lógica comum para util compartilhado.

---

## 7. Layout desktop

`genealogyColumnsLayout.ts`:

- agrupa por geração;
- ordena por data de nascimento e nome;
- posiciona cônjuges próximos;
- adiciona labels de geração;
- cria conectores parentais por `GenealogyFamilyConnectorNode`;
- cria edges conjugais por `GenealogySpouseEdge`;
- aplica filtros de geração;
- evita colunas vazias;
- preserva espaçamento extra entre cônjuges.

Regras:

- título geral não deve ser criado pelo layout;
- labels de geração são permitidos;
- zoom desktop usa largura como referência;
- altura total da árvore não deve reduzir excessivamente o zoom;
- usuário deve conseguir navegar verticalmente quando houver muitos cards;
- cards devem manter largura e proporção próprias das views por geração;
- não herdar largura/estilo especial da Minha Árvore ou do Mapa Familiar.

---

## 8. Padrão de cards em Genealogia e Visão Completa

As views por geração devem manter padrão próprio de tamanho dos cards.

Dimensão de referência:

| View | Largura do card | Altura do card |
|---|---:|---:|
| `/genealogia` | `410px` | `190px` |
| `/visao-completa` | `410px` | `190px` |

Regra consolidada:

```txt
A expansão de cards compactos da Minha Árvore e o visual dos cards do Mapa Familiar não devem afetar /genealogia nem /visao-completa.
```

Checklist específico:

- abrir `/genealogia` e comparar cards de diferentes gerações;
- abrir `/visao-completa` e confirmar que os cards não foram convertidos para o visual do Mapa Familiar;
- abrir `/minha-arvore` e confirmar que seus cards compactos mantêm padrão próprio;
- abrir `/mapa-familiar-horizontal` e confirmar que ela usa `VisualPersonCard`, não `PersonNode`;
- validar que cônjuges em Genealogia mantêm alinhamento e espaçamento.

Não fazer:

- aplicar largura de `/minha-arvore` em cards das views por geração;
- aplicar CSS de `/mapa-familiar-horizontal` em `.react-flow__node-personNode`;
- deslocar cards de Genealogia com `translateX` criado para outra view;
- usar CSS de outra view sem escopo por rota/data attribute.

---

## 9. Títulos das views e cabeçalhos de geração

Títulos das views:

| Rota | Título esperado |
|---|---|
| `/minha-arvore` | `Árvore de {primeiro nome}` |
| `/mapa-familiar` | `Mapa Familiar de {primeiro nome}` |
| `/mapa-familiar-horizontal` | `Mapa Familiar Horizontal de {primeiro nome}` |
| `/genealogia` | `Família de {primeiro nome}` |
| `/visao-completa` | `Linha Genealógica de {primeiro nome}` |

Formatação visual de referência dos títulos desktop:

```txt
font-bold
text-slate-950
text-center
text-[clamp(1.65rem,2.1vw,2.25rem)]
leading-tight
```

Cabeçalhos das colunas:

```txt
Geração 1
Geração 2
Geração 3
...
```

Formatação atual esperada:

```txt
pílula arredondada
bg-slate-600
texto branco
uppercase
tracking moderado
sombra discreta
sem wrapper branco externo
```

Regras:

- não usar wrapper branco ao redor da pílula;
- manter contraste suficiente em desktop/tablet;
- validar alinhamento ao centro de cada coluna;
- não deixar cabeçalho competir visualmente com o card;
- não reaplicar o antigo padrão cinza/texto solto.

---

## 10. Chips mobile

`HomeTreeSection.tsx` ativa chips quando:

```txt
isMobile && (viewMode === 'genealogia' || viewMode === 'visao-completa')
```

Componente:

```txt
GenealogyMobileStageTabs
```

Comportamento:

- aparece acima da área da árvore;
- calcula gerações disponíveis a partir da base mobile já inferida por `HomeTreeSection`;
- mostra apenas gerações com pessoas visíveis;
- usa `role="tablist"` e `role="tab"`;
- permite clique direto no chip;
- permite swipe horizontal na barra;
- não exibe contadores;
- não remove colunas do canvas;
- apenas muda o foco/enquadramento.

Labels atuais:

```txt
Tataravós
Bisavós
Avós
Pais
Núcleo
Descendentes
```

---

## 11. Estado da geração ativa

O estado de geração ativa é coordenado por `HomeTreeSection.tsx`.

Estados/conceitos:

```txt
availableMobileGenerations
defaultGenealogyMobileGeneration
activeGenealogyGeneration
effectiveActiveGenealogyGeneration
mobileGenerationSignature
```

Regras consolidadas:

- em `/genealogia` e `/visao-completa`, a geração inicial deve ser a menor geração disponível entre as pessoas visíveis;
- ao alternar entre `/genealogia` e `/visao-completa`, a geração ativa deve resetar para a primeira geração disponível da nova view;
- ao mudar pessoa central, a geração ativa também deve ser recalculada;
- ao mudar o conjunto de gerações disponíveis, a geração ativa deve acompanhar a nova assinatura;
- ao sair das views com chips mobile, o estado deve ser limpo;
- a geração ativa não deve se transformar em filtro destrutivo.

---

## 12. Foco mobile: foco, não filtro

Decisão consolidada:

```txt
Chips focam/enquadram a geração ativa, mas não removem as demais colunas renderizadas.
```

Motivos:

- o usuário pode reduzir zoom e recuperar contexto;
- ReactFlow precisa manter os nodes para bounds e pan;
- a Genealogia continua sendo uma árvore navegável, não uma lista filtrada.

Regras:

- geração ativa deve ser centralizada/enquadrada;
- demais gerações continuam no canvas;
- `activeGenealogyGeneration` não deve virar filtro destrutivo;
- chips não devem alterar dados, Supabase, filtros salvos ou permissões.

---

## 13. Distinção com Mapa Familiar Horizontal

`/mapa-familiar-horizontal` usa algumas referências genealógicas para ordenar cards, mas não é Genealogia.

Diferenças:

| Aspecto | Genealogia/Visão Completa | Mapa Familiar Horizontal |
|---|---|---|
| Renderização | ReactFlow | HTML/CSS/SVG próprio |
| Card | `PersonNode` | `VisualPersonCard` |
| Conectores | ReactFlow edges/nodes | SVG manual |
| Colunas | ReactFlow layout | DOM absoluto por colunas ativas |
| Mobile | chips de geração | barra Paterno/Central/Materno visual |
| Exportação | ReactFlow/seleção | superfície HTML/CSS/SVG |

Regras:

- não corrigir `/mapa-familiar-horizontal` em `genealogyColumnsLayout` sem necessidade;
- não aplicar CSS da horizontal em Genealogia;
- não usar `GenealogySpouseEdge` para conectores da horizontal;
- manter documentação separada em `MAPA_FAMILIAR_VIEW.md`.

---

## 14. Painel e filtros

Genealogia/Visão Completa usam `GenealogyFilterGrid`.

Grupos documentados:

```txt
generation1
generation2
generation3Family
generation3Spouses
generation4Family
generation4Spouses
generation5Family
generation5Spouses
generation6
```

Regras:

- filtros de geração não são iguais aos filtros de grupos diretos;
- `directRelativeFilters` não deve controlar Genealogia;
- `genealogyFilters` não deve controlar Mapa Familiar;
- contadores precisam refletir pessoas visíveis por grupo;
- filtros não devem deixar edges soltas.

Observação: `/visao-completa` pode usar painel de gerações, não o painel de grupos diretos, salvo decisão explícita de produto. O botão **Horizontal** do painel do Mapa Familiar deve apontar para `/mapa-familiar-horizontal`, não para `/visao-completa`.

---

## 15. Exportação

Genealogia e Visão Completa usam fluxo ReactFlow.

Regras:

- seleção retangular permitida;
- PNG/PDF/impressão pelo fluxo canônico;
- `TreeAreaSelectionOverlay` deve bloquear pan/zoom durante seleção;
- overlays/controles não devem sair no artefato;
- `MobileTreeControlsPortal` pode atuar em mobile para views ReactFlow;
- não usar captura HTML/CSS/SVG do Mapa Familiar nas views ReactFlow.

---

## 16. QA

### Desktop

Rotas:

```txt
/genealogia
/visao-completa
```

Checklist:

- títulos corretos;
- pílulas `Geração N` sem wrapper branco;
- cards com tamanho próprio;
- cônjuges alinhados;
- conectores parentais visíveis;
- edges conjugais visíveis;
- colunas vazias ocultadas;
- pan/zoom preservados;
- filtros de geração funcionam.

### Mobile

Rotas:

```txt
/genealogia
/visao-completa
```

Checklist:

- chips aparecem;
- chips mostram apenas gerações disponíveis;
- foco muda sem remover colunas;
- geração ativa reseta ao trocar view;
- não há bottom nav cobrindo controle crítico;
- painel mobile não duplica botões.

---

## 17. Anti-regressões

Não fazer:

- voltar o cabeçalho `Geração N` para texto simples solto;
- adicionar wrapper branco na pílula de geração;
- alterar `manual_generation` no banco por inferência visual;
- aplicar CSS de Mapa Familiar nos cards de `PersonNode`;
- reaproveitar `DesktopFamilyHorizontalMapView` como Genealogia;
- apontar botão **Horizontal** para `/visao-completa`;
- transformar chips mobile em filtro destrutivo;
- inserir pets no layout genealógico;
- reintroduzir `/visao-completa-teste` para testar layout;
- corrigir alinhamento por CSS global em `.react-flow__viewport`.
