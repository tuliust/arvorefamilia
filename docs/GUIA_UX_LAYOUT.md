# Guia de UX e Layout — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia alinhado às duas views oficiais, painel desktop, modal mobile, paletas, calendário mobile, avatares e conectores.

---

## 1. Objetivo

Este documento registra decisões consolidadas de experiência, layout, responsividade e comportamento visual.

Use este guia para revisar:

- shell da árvore;
- navegação entre Vertical e Horizontal;
- painel desktop;
- modal mobile de controles;
- cards;
- conectores;
- paletas;
- calendário familiar;
- exportação;
- anti-regressões visuais.

---

## 2. Princípios gerais

| Princípio | Regra prática |
|---|---|
| Clareza | Usar nomes e ações explícitas. |
| Continuidade | Preservar query params, foco de pessoa e retorno de perfil. |
| Escopo visual | CSS novo deve ser restrito por rota, container ou data attribute. |
| Canvas controlado | Zoom, pan, scroll e exportação pertencem à superfície da árvore. |
| Permissão não é visual | UI não substitui guards, RLS ou services. |
| Histórico não é produto ativo | Docs históricos não devem reabrir views removidas. |
| Ajuste visual não muda dados | CSS não altera Supabase nem relacionamentos. |
| Painel sem abas internas | A barra `Filtros | Legendas | Ações` não deve voltar como UI ativa. |
| Desktop como referência | Mobile adapta escala/navegação, mas não redefine paleta ou hierarquia. |
| Coerência visual | Painel, cards, bordas e conectores devem falar a mesma linguagem da paleta ativa. |

Anti-padrões:

```txt
Não usar translate/top negativo para corrigir canvas.
Não usar seletor global svg path.
Não reintroduzir /minha-arvore, /genealogia ou /visao-completa como views ativas.
Não usar /visao-completa como substituto da horizontal.
Não restaurar activeSidebarPanel para resolver organização do painel.
Não usar cores hardcoded no mobile quando houver token de paleta.
Não exibir microcopy de dado ausente dentro de card compacto mobile.
Não deixar cards de paletas não azuis caírem em fallback azul/teal.
```

---

## 3. Rotas e navegação da árvore

| View | Rota | Papel |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | Principal/default |
| Mapa Genealógico | `/mapa-familiar-horizontal` | Alternativa horizontal/genealógica |

Redirect:

```txt
/ -> /mapa-familiar
```

preservando `location.search`.

Rotas antigas removidas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

---

## 4. Shell visual da Home

A Home pós-login é o shell das duas views oficiais.

Elementos:

- `HomeHeader`;
- área da árvore (`HomeTreeSection`);
- painel lateral desktop;
- modal mobile de controles;
- navegação inferior mobile;
- overlays de exportação/loading;
- modais auxiliares;
- debug temporário `Visualizar como...`, se habilitado.

Regras:

- header deve permanecer visualmente estável;
- avatar não deve exibir nome textual ao lado no desktop;
- nome/e-mail ficam no menu do avatar;
- a árvore deve ocupar área de canvas sem scroll externo desnecessário;
- search params devem ser preservados ao alternar vertical/horizontal;
- painel, modal e overlays auxiliares não entram na exportação;
- debug temporário não entra na exportação.

---

## 5. Árvore Familiar

Rota:

```txt
/mapa-familiar
```

### Desktop/tablet

Componente:

```txt
DesktopFamilyMapView
```

Características:

- canvas panorâmico;
- grupos familiares;
- conectores SVG;
- zoom e scroll;
- modo wide quando painel é colapsado;
- exportação HTML/CSS/SVG;
- título `Árvore Familiar de {primeiroNome}`;
- suporte visual a múltiplos núcleos conjugais quando a pessoa central tiver mais de um relacionamento.

### Mobile

Componente:

```txt
MobileFamilyTreeView
```

Características:

- experiência segmentada;
- navegação interna Paterno/Central/Materno;
- conectores HTML/CSS;
- botão `Controles` abre modal mobile;
- paletas devem seguir desktop;
- alinhamento de conectores deve ter o desktop como referência visual;
- bordas de grupos devem usar a cor da paleta ativa;
- cards de pessoas exibem apenas dados vitais existentes.

### Cards mobile

Contrato visual:

```txt
NOME DA PESSOA
★ AAAA
✥ AAAA
```

Regras:

- `★ AAAA` aparece apenas quando houver nascimento;
- `✥ AAAA` aparece apenas quando houver falecimento;
- não exibir `Nascimento não informado`;
- não exibir `Falecimento não informado`;
- manter contraste e legibilidade nas quatro paletas.

---

## 6. Mapa Genealógico

Rota:

```txt
/mapa-familiar-horizontal
```

### Desktop/tablet

Componente:

```txt
DesktopFamilyHorizontalMapView
```

Características:

- colunas por geração;
- pessoas organizadas por `manual_generation` quando disponível;
- colunas vazias ocultadas;
- cônjuges adjacentes;
- conectores SVG casal → filhos;
- título visual/exportável `Mapa Genealógico de {primeiroNome}`;
- cônjuges da Geração 4/Pais aparecem quando o filtro `Cônjuges` está ativo.

### Mobile

Componente:

```txt
MobileFamilyHorizontalMapView
```

Contrato:

```txt
1 geração = 1 tela
swipe lateral = troca de geração
scroll vertical = rolagem interna da geração ativa
botões Ger 1/Ger 2/Ger 3... = atalho entre gerações
sem scroll horizontal manual
```

Regras:

- não usar barra `Paterno | Central | Materno`;
- não usar canvas desktop amplo com rolagem horizontal manual;
- não criar subrotas por geração;
- preservar safe area e bottom nav;
- exportação não deve capturar header, bottom nav ou modal;
- o botão de controles deve ficar alinhado à linha dos botões `Ger`;
- botões laterais de seta não devem aparecer;
- rolagem vertical deve ir até o último card ou até o fim dos conectores visíveis;
- se houver preview de swipe, ele não deve permitir scroll horizontal manual;
- cards de paletas não azuis não podem cair em fallback visual azul.

---

## 7. Painel desktop

Estado atual:

| Área | Comportamento |
|---|---|
| Topo/controles | Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar, Destacar |
| Filtros | Grupos diretos e status visíveis diretamente |
| Ações secundárias | Organizadas em flyouts, não em abas persistentes |
| Legendas | Não são aba ativa do painel; ajuda futura deve ser reposicionada se necessária |

A barra abaixo não é mais UI vigente:

```txt
Filtros | Legendas | Ações
```

Regras:

- painel não entra na exportação;
- botões ativos refletem a rota;
- `Restaurar visualização` não deve ser confundido com `Zoom -`;
- `Vertical` aponta para `/mapa-familiar`;
- `Horizontal` aponta para `/mapa-familiar-horizontal`;
- filtros continuam acessíveis sem alternância por aba;
- qualquer ajuda contextual deve ser independente e ignorada pela exportação;
- cards de `Grupos` e `Filtros` devem usar o mesmo vocabulário visual da árvore na paleta ativa;
- painel desktop não deve parecer um sistema visual separado da árvore.

### Cards do painel

Contrato:

- cards de grupos replicam gradiente/borda/texto dos cards equivalentes da árvore;
- cards de filtros têm tratamento coerente com a paleta;
- `Cônjuges` e `Pets` usam tom equivalente aos cards da árvore;
- `Vivos` e `Falecidos` podem usar tons semânticos coerentes com a paleta;
- estado inativo preserva legibilidade.

---

## 8. Modal mobile de controles

Nas rotas oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Comportamento:

- botão flutuante abre o modal;
- em `/mapa-familiar-horizontal`, o botão fica alinhado à linha dos botões `Ger`;
- título do modal: `Controles`;
- não exibir subtítulo;
- botão superior direito usa ícone `X`;
- overlay fecha o modal;
- `Escape` fecha quando disponível;
- body fica com scroll travado;
- conteúdo interno tem rolagem própria;
- painel fica acima do header, bottom nav e botões flutuantes;
- painel não entra na exportação.

Controles visíveis:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros
```

Não exibir:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Regras específicas:

- botão `Grupos` abre/fecha os cards de grupos;
- grupos não aparecem por padrão;
- filtros permanecem visíveis;
- filtros devem caber em 4 colunas;
- os cards de grupos no mobile podem ficar fora de box e sem título `GRUPOS`.

---

## 9. Paletas

Paletas vigentes:

| Nome visual | Chave |
|---|---|
| Branca | `white` |
| Visual/Azul | `visual` |
| Laranja | `orange` |
| Marrom | `brown` |

Regras:

- paletas alteram CSS variables;
- paletas não alteram dados;
- paleta ativa deve afetar cards, conectores, labels, canvas e exportação;
- desktop é a referência visual;
- mobile deve consumir o mesmo contrato visual;
- não usar cores fixas em mobile como fonte de verdade visual;
- ícones internos não devem herdar regras globais de conectores;
- a paleta Visual/Azul usa gradientes em cards;
- as demais paletas não podem cair em gradiente azul por fallback.

---

## 10. Cards e avatares

Regras:

- cards devem preservar contraste entre texto/fundo;
- avatar com foto deve manter crop estável;
- avatar sem foto usa `User` de `lucide-react`;
- pet usa `PawPrint` de `lucide-react`;
- não há avatar diferente por gênero;
- falecimento/data de nascimento usam ícones semânticos;
- microcopy não deve depender de hover para informação essencial;
- SVGs internos devem exportar corretamente.

Contrato de avatar:

```txt
foto_principal_url -> foto real
sem foto           -> User
pet                -> PawPrint
```

Contrato de datas em cards compactos:

```txt
Exibir dado existente.
Omitir dado ausente.
Não substituir ausência por frase longa.
```

---

## 11. Conectores

### Vertical

- conectores SVG por âncoras no desktop;
- conectores HTML/CSS no mobile vertical;
- respeitam grupos visíveis;
- se `Destacar > Grupos` remover chrome, conectores continuam coerentes;
- cônjuge não é inferido por proximidade.

### Horizontal

- casal → filhos;
- cônjuges adjacentes;
- colunas por geração;
- conectores não devem invadir cards;
- conectores devem respeitar paleta ativa;
- mobile deve seguir estrutura desktop, adaptando recorte/escala/navegação.

### Espessura visual

Contrato:

```txt
Conectores desktop devem permanecer finos o suficiente para não competir com os cards.
Referência atual: stroke visual discreto, em torno de 2px nas views oficiais.
```

Regras:

- reduzir espessura não deve comprometer legibilidade;
- aumentar espessura exige QA em todas as paletas;
- conectores devem continuar legíveis em exportação.

### Mobile

- vertical usa conectores HTML/CSS;
- horizontal usa conectores escopados à geração/tela;
- conectores não devem criar overflow horizontal indevido;
- altura do stage deve considerar linhas conectoras visíveis abaixo do último card.

---

## 12. Calendário familiar

Rota:

```txt
/calendario-familiar
```

### Mobile

Contrato atual dos filtros de categoria:

```txt
5 botões em uma linha
bolinha colorida acima do título
título em uma linha
sem overflow horizontal
```

Categorias:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

Regras:

- manter os 5 botões em uma única linha;
- a bolinha colorida deve ficar acima do título;
- o título deve preencher o botão sem quebrar linha;
- usar `nowrap` e `ellipsis` em telas estreitas;
- não voltar para layout em duas linhas sem decisão de produto;
- validar 320px, 375px, 390px e 430px;
- o card do mês e a grade do calendário não devem ser afetados por ajustes nos botões.

---

## 13. Exportação

Ações:

```txt
Área
Imagem/PNG
PDF
Imprimir
```

Regras visuais:

- título deve aparecer no canvas exportado quando aplicável;
- painel, header, bottom nav, modal, debug e overlay não entram;
- conectores aparecem;
- paleta ativa é respeitada;
- SVGs internos não viram quadrados escuros;
- imagem grande demais deve gerar erro claro;
- loading permanece até exportação concluir.

---

## 14. Debug temporário

Um dropdown `Visualizar como...` pode existir como ferramenta temporária de QA:

- permite renderizar as duas views a partir da perspectiva de outra pessoa da tabela `pessoas`;
- não altera dados;
- não navega para perfil;
- não entra na exportação;
- deve ser removido, protegido por flag ou restrito a admin antes de produção, conforme decisão futura.

---

## 15. Breakpoints de QA

Validar principalmente:

```txt
320px
375px
390px
430px
768px a 1023px
1366x768
1440x900
1536x864
1920x1080
```

Prioridades:

- mobile iOS/Safari;
- modal de controles;
- horizontal por geração;
- calendário mobile;
- exportação;
- painel desktop em altura baixa;
- paletas nas quatro opções;
- avatares e conectores.

---

## 16. Anti-regressões visuais

Não reintroduzir:

```txt
/minha-arvore como view ativa
/genealogia como rota ativa
/visao-completa como rota ativa
toggle antigo de múltiplas views
barra Filtros | Legendas | Ações
MobileTreeControlsPortal duplicado
Paterno/Central/Materno na horizontal mobile
CSS global que atinja todos os svg/path
Zoom/Exportar/Restaurar no modal mobile
cores hardcoded no mobile como fonte de verdade
setas laterais no mobile horizontal
scroll horizontal manual no mobile horizontal
Nascimento não informado em card mobile
fallback azul em paleta laranja/marrom/branca
calendário mobile com categorias quebrando linha
```

---

## 17. Critério de aceitação para mudanças de layout

Antes de aceitar mudança visual:

```txt
[ ] Rota testada no desktop.
[ ] Rota testada no mobile.
[ ] Paletas white/visual/orange/brown testadas.
[ ] 320px, 375px, 390px e 430px testados quando houver mobile.
[ ] Exportação preservada quando a mudança afetar árvore.
[ ] Sem overflow horizontal novo.
[ ] Sem mudança de dados.
[ ] Build executado.
[ ] git diff --check sem erro real.
```
