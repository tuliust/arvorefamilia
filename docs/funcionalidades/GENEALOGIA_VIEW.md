# Genealogia - view, layout e navegação mobile

> Última revisão: 2026-06-09  
> Local canônico: `docs/funcionalidades/GENEALOGIA_VIEW.md`  
> Tipo: documentação técnica/funcional da view **Genealogia**.  
> Status: revisado após ajustes de largura da Minha Árvore, correção de anti-regressões entre views e frente mobile.

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
- chips mobile;
- foco/enquadramento;
- reset de geração ativa por view;
- distinção entre Genealogia e Visão Completa;
- padrão de tamanho dos cards em views por geração;
- anti-regressões de pan/zoom/ReactFlow;
- isolamento entre ajustes da Minha Árvore e views por geração.

---

## 2. Diferença entre views

| View | Rota | `viewMode` | Escopo |
|---|---|---|---|
| Minha Árvore | `/minha-arvore` | `minha-arvore` | família direta da pessoa central |
| Genealogia | `/genealogia` | `genealogia` | escopo pessoal por gerações |
| Visão Completa | `/visao-completa` | `visao-completa` | base familiar completa por gerações |

Regras:

- este documento trata principalmente de `genealogia`;
- quando citar `/visao-completa`, tratar apenas o comportamento compartilhado de layout/mobile;
- ajustes da Minha Árvore não devem ser aplicados automaticamente aqui;
- ajustes transversais de header, menu, título, paletas e ReactFlow devem ser validados nas três views;
- qualquer alteração em `nodeTypes.ts`, `PersonNode.tsx` ou dimensões de card deve confirmar que `/genealogia` e `/visao-completa` preservam seu padrão visual.

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

`FamilyTree.tsx` usa `inferGenealogyManualGenerations` antes de chamar `genealogyColumnsLayout`.

Comportamento esperado:

- inferência acontece em memória;
- nenhum dado real é gravado no Supabase;
- pessoa central é referência do cálculo;
- pais sobem geração;
- filhos descem geração;
- cônjuges permanecem na mesma geração;
- resultado é repassado aos `personNodes` usados no layout.

Objetivo:

- reduzir dependência de `manual_generation`;
- evitar que ancestrais conectados corretamente fiquem fora da Genealogia;
- manter coerência entre desktop e mobile.

Atenção:

```txt
GenealogyMobileStageTabs ainda pode montar chips a partir de pessoas[].manual_generation recebidas pelo shell.
FamilyTree infere gerações internamente antes do layout.
Sempre que houver discrepância entre chips e pessoas exibidas, revisar a origem de availableMobileGenerations.
```

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
- cards devem manter largura e proporção compatíveis com as views por geração, sem herdar expansão da área central de `/minha-arvore`.

---

## 8. Padrão de cards em Genealogia e Visão Completa

As views por geração devem manter **padrão próprio de tamanho dos cards**.

Regra consolidada após regressão corrigida:

```txt
A expansão de cards da área central da Minha Árvore não deve afetar /genealogia nem /visao-completa.
```

Contexto técnico:

- ajustes recentes em `nodeTypes.ts` aumentaram visualmente cards centrais compactos de `/minha-arvore`;
- essa ampliação foi restringida por largura-base compacta e relação direta;
- cards de `/genealogia` e `/visao-completa` não devem receber esse acréscimo visual;
- se `PersonNode` ou `nodeTypes.ts` forem alterados, validar que as três views continuam com padrões distintos.

Checklist específico:

- abrir `/genealogia` e comparar cards de diferentes gerações;
- abrir `/visao-completa` e confirmar que os cards não foram esticados como na área central da Minha Árvore;
- abrir `/minha-arvore` e confirmar que apenas os grupos centrais diretos seguem com a ampliação prevista;
- validar que cônjuges em Genealogia mantêm alinhamento e espaçamento.

Não fazer:

- condicionar largura apenas por `directRelation` sem considerar a view/largura-base;
- aplicar `CENTRAL_AREA_CARD_EXTRA_WIDTH` em cards das views por geração;
- deslocar cards de Genealogia com `translateX` criado para a Minha Árvore.

---

## 9. Chips mobile

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

## 10. Estado da geração ativa

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

Objetivo:

```txt
Evitar que /visao-completa herde indevidamente geração ou enquadramento anterior de /genealogia.
```

---

## 11. Foco mobile: foco, não filtro

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

## 12. Enquadramento mobile

Em `FamilyTree.tsx`, o enquadramento mobile genealógico:

- identifica a geração alvo;
- busca bounds da coluna alvo;
- usa a geração 3/Avós como referência vertical quando disponível;
- usa o eixo X da geração ativa;
- mantém o eixo Y ancorado na referência;
- não define `translateExtent` no mobile genealógico, permitindo recuperar área superior por arraste.

Regras:

- o eixo Y não deve saltar a cada troca de chip;
- a área superior deve ser recuperável por pan;
- controles direcionais/zoom podem ficar ocultos no mobile genealógico para não competir com chips;
- `TREE_GENEALOGY_MOBILE_VIEWPORT_TOP_SAFE_AREA` protege a área dos chips.

---

## 13. Controles mobile nas views por geração

As rotas `/genealogia` e `/visao-completa` também recebem `MobileTreeControlsPortal`.

Regras:

- chips continuam sendo a navegação principal por geração;
- botões direcionais e zoom antigos do canvas podem ficar ocultos para não competir com chips;
- o painel mobile pode concentrar ações como exportação, imagem, PDF e impressão;
- ocultar/exibir setas não deve alterar dados nem filtros;
- controles mobile devem aparecer apenas nas rotas de árvore;
- a experiência de seleção manual de área em mobile deve ser tratada com cuidado.

---

## 14. Filtros de Genealogia

`GenealogyFilters` possui:

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

- filtros são aplicados no layout por geração;
- devem evitar edges soltas;
- não devem afetar dados no Supabase;
- filtros de vida (`personFilters`) são aplicados antes no shell;
- chips mobile devem refletir pessoas visíveis após filtros de vida;
- filtros não devem ser usados para simular o recorte de `/minha-arvore`.

---

## 15. Linhas e conectores

A Genealogia usa:

| Elemento | Função |
|---|---|
| `GenealogyFamilyConnectorNode` | conector/bus de pais-filhos |
| `GenealogySpouseEdge` | vínculo conjugal e anel/aliança |
| `visualLineFilters` | destaque de linhas visíveis |
| `edgeFilters` | visibilidade de linhas |

Regras:

- `edgeFilters.conjugal` controla edges conjugais;
- `edgeFilters.filiacao_sangue`/`filiacao_adotiva` controlam conectores parentais;
- `edgeFilters.irmaos` controla conexões de irmãos quando suportadas;
- destaque visual não reexibe linha oculta;
- clique no anel conjugal abre `ViewMarriageModal`;
- o modal conjugal tem regras próprias documentadas em `PESSOAS_PERFIL_ADMIN.md` e `GUIA_COMPONENTES.md`.

---

## 16. Visão Completa

`/visao-completa` compartilha `genealogyColumnsLayout`, mas usa a base completa.

Diferenças:

- não restringe ao escopo pessoal;
- pode ocultar pessoas sem geração (`hideUngenerated`);
- no mobile, usa os mesmos chips de geração;
- o foco por chip continua sendo enquadramento, não filtro;
- a geração ativa deve resetar ao entrar ou alternar a partir de `/genealogia`.

Regras:

- mudanças que alterem escopo devem ser validadas separadamente em `/genealogia` e `/visao-completa`;
- não assumir que contadores ou chips das duas rotas terão os mesmos resultados;
- `/visao-completa` não deve reaproveitar geração ativa obsoleta de outra view;
- `/visao-completa` não deve herdar ampliação de cards ou grupos da Minha Árvore.

---

## 17. QA mínimo

Validar após alteração:

### Desktop

- `/genealogia` abre com colunas por geração;
- `/visao-completa` abre com base completa;
- labels de geração aparecem;
- conectores parentais permanecem legíveis;
- cônjuges mantêm espaçamento;
- anel conjugal abre modal;
- filtros não deixam edges soltas;
- cards mantêm largura padrão das views por geração;
- ajustes recentes de `/minha-arvore` não esticam cards em `/genealogia` ou `/visao-completa`.

### Mobile

- chips aparecem em `/genealogia`;
- chips aparecem em `/visao-completa`;
- chips mostram apenas gerações disponíveis;
- clique no chip muda foco;
- swipe horizontal funciona na barra;
- pan da árvore continua possível;
- eixo Y não salta entre gerações;
- área superior pode ser recuperada;
- ao alternar entre `/genealogia` e `/visao-completa`, a geração ativa reseta corretamente;
- ao mudar pessoa central, a primeira geração disponível é recalculada;
- controles mobile aparecem apenas nas rotas da árvore;
- pessoas inferidas por relacionamento aparecem e os chips correspondentes devem ser verificados.

---

## 18. Anti-regressões

Não fazer:

- transformar chips em filtro destrutivo;
- persistir geração inferida no banco;
- criar colunas vazias fixas;
- usar altura total para reduzir zoom desktop;
- aplicar layout da Minha Árvore na Genealogia;
- aplicar largura ampliada da área central da Minha Árvore em Genealogia/Visão Completa;
- incluir pets no layout genealógico;
- bloquear pan mobile com `translateExtent` restritivo;
- criar migration para ajuste visual;
- alterar RLS para corrigir problema de renderização;
- deixar `/visao-completa` herdar estado de geração obsoleto de `/genealogia`;
- corrigir um card isolado com `transform` global que afete todas as views.
