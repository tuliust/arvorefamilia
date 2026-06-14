# Guia de UX e Layout - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado contra a estrutura atual das views da árvore, Mapa Familiar Vertical/Horizontal, horizontal mobile por geração, modal mobile de controles, destaques, exportação, paletas e cards visuais.

---

## Objetivo

Este documento registra decisões consolidadas de experiência, layout, responsividade e comportamento visual do projeto **Árvore Família**.

Use este guia para orientar:

- ajustes de interface;
- hierarquia visual;
- comportamento das views da árvore;
- responsividade mobile/tablet/desktop;
- regras de painel;
- exportação;
- prevenção de regressões visuais.

---

## 1. Princípios gerais

| Princípio | Regra prática |
|---|---|
| Clareza | Usar termos humanos e ações explícitas. |
| Consistência | Reusar headers, cards, botões e menus existentes. |
| Escopo visual | CSS novo deve ser restrito por rota, data attribute ou container. |
| Canvas controlado | Pan, zoom, seleção e exportação pertencem à superfície da árvore. |
| Permissão não é visual | UI não substitui RLS, guards ou services. |
| Ajuste visual não muda dados | CSS não altera Supabase, filtros persistidos ou relacionamentos. |

Anti-padrão:

```txt
Não usar translate/top negativo em .react-flow__viewport para corrigir espaçamento.
Não usar seletor global svg path para conectores.
```

---

## 2. Shell da Home

A Home pós-login é o shell das views:

```txt
/minha-arvore
/mapa-familiar
/mapa-familiar-horizontal
/genealogia
/visao-completa
```

Elementos:

- `HomeHeader`;
- sidebar desktop;
- modal mobile de controles;
- `HomeTreeSection`;
- navegação inferior mobile.

Regras:

- header deve permanecer visualmente estável entre views;
- avatar não exibe nome textual ao lado;
- nome/e-mail ficam no menu do avatar;
- search params devem ser preservados;
- a árvore deve ocupar área de canvas sem gerar scroll externo desnecessário.

---

## 3. Rotas e navegação

| View | Rota |
|---|---|
| Minha Árvore | `/minha-arvore` |
| Mapa Familiar Vertical | `/mapa-familiar` |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` |
| Genealogia | `/genealogia` |
| Visão Completa | `/visao-completa` |

Regras:

- `/` direciona para `/mapa-familiar`;
- botão `Vertical` aponta para `/mapa-familiar`;
- botão `Horizontal` aponta para `/mapa-familiar-horizontal`;
- não usar `/mapa-horizontal`;
- não usar `/visao-completa` como destino do botão horizontal do Mapa Familiar.

---

## 4. Paletas

Paletas:

| Nome visual | Chave |
|---|---|
| Branca | `white` |
| Azul/visual | `visual` |
| Laranja | `orange` |
| Marrom | `brown` |

Regras:

- paletas alteram CSS variables;
- não alteram dados;
- `Pets` no modo visual usa teal/ciano, não laranja;
- estrela e cruz seguem contraste por paleta;
- bordas/contornos de ícones acompanham a lógica de cor do card;
- avatares/SVGs devem permanecer legíveis em todas as paletas.

---

## 5. Painel desktop

O painel lateral contém:

| Área | Comportamento |
|---|---|
| Topo | zoom, restaurar, vertical/horizontal, cores, exportar, destacar |
| Filtros | grupos/status |
| Legendas | legenda da árvore |
| Ações | painel auxiliar |

Regras:

- manter compacto sem esconder controles;
- evitar scroll interno desnecessário;
- painel não entra na exportação;
- botões ativos refletem rota/estado atual;
- `Restaurar visualização` reseta zoom e posição.

---

## 6. Painel mobile

Nas rotas `/mapa-familiar` e `/mapa-familiar-horizontal`:

- o botão `Controles` vem de `HomeMobileNav`;
- o painel abre como modal de controles, em camada superior ao header, bottom nav, chips e botões flutuantes;
- conteúdo reaproveita o painel desktop;
- há overlay de fechamento;
- `Escape` fecha o modal;
- o `body` fica com scroll travado enquanto o modal está aberto;
- bottom nav, painel, overlay e loading não entram na captura.

Regras:

- não duplicar `MobileTreeControlsPortal`;
- manter botão de controle acessível na faixa superior segura;
- não exibir toggle `Vertical/Horizontal` no mobile;
- garantir rolagem interna do modal;
- preservar safe-area de iOS/Safari;
- usar z-index superior ao header e à bottom nav.

---

## 7. Minha Árvore

### Desktop/tablet

- ReactFlow;
- pan/zoom;
- título `Árvore de {nome}`;
- filtros de linhas/grupos;
- exportação ReactFlow.

### Mobile

- `MobileFamilyTreeView`;
- malha 3×3;
- abas `Paterno | Central | Materno`;
- swipe direcional;
- conectores HTML/CSS;
- card central sem badge `Você`.

---

## 8. Mapa Familiar Vertical

Rota:

```txt
/mapa-familiar
```

Desktop/tablet:

- `DesktopFamilyMapView`;
- HTML/CSS/SVG próprio;
- grupos familiares em canvas panorâmico;
- conectores SVG por âncoras;
- zoom por botões e `Ctrl + scroll`;
- exportação própria.

Mobile:

- usa `MobileFamilyTreeView`;
- mantém toggle nativa `Paterno | Central | Materno`;
- botão `Controles` abre o modal de controles.

### 8.1 Visual de grupos

Estado normal:

- grupos têm moldura, fundo, título/pill e cards internos.

`Destacar > Grupos` ativo:

- molduras/fundos/sombras dos grupos somem;
- títulos dos grupos somem;
- labels `PAI`, `MÃE`, `CÔNJUGE` somem;
- cards ficam soltos;
- conectores aproximam-se dos cards.

---

## 9. Mapa Familiar Horizontal

Rota:

```txt
/mapa-familiar-horizontal
```

Comportamento:

- `DesktopFamilyHorizontalMapView`;
- colunas por geração;
- `manual_generation` é referência primária;
- colunas vazias são ocultadas;
- cônjuges adjacentes;
- conectores de casal → filhos;
- título `Genealogia de {nome}`;
- exportação própria.

Mobile:

- usa `MobileFamilyHorizontalMapView`;
- cada geração visível ocupa uma tela própria;
- chips compactos `G1`, `G2`, `G3` etc. alternam a geração ativa;
- swipe para esquerda avança para a próxima geração;
- swipe para direita retorna para a geração anterior;
- scroll vertical ocorre dentro da geração ativa;
- não usa a barra `Paterno | Central | Materno`.

### 9.1 Cabeçalhos de geração

Normal:

- cabeçalhos `Geração X` aparecem no topo das colunas.

`Destacar > Grupos` ativo:

- cabeçalhos somem;
- cards sobem;
- conectores são recalculados;
- estado desligado restaura o layout.

---

## 10. Destaques

| Botão | UX atual |
|---|---|
| `Linhas` | oculta conectores. |
| `Cards` | destaca cards visíveis. |
| `Grupos` | simplifica/remover chrome de grupos/cabeçalhos. |

Regras:

- `Linhas` não deve afetar ícones internos;
- `Grupos` não deve ocultar cards;
- `Cards` não deve reexibir cards filtrados;
- destaques não alteram dados/contadores.

---

## 11. Exportação

A exportação deve ser percebida como processo explícito.

### 11.1 Loading

UX esperada:

- loading aparece imediatamente;
- texto contextual:
  - `Preparando imagem...`;
  - `Gerando PDF...`;
  - `Preparando impressão...`;
- bloqueia cliques repetidos;
- não fecha cedo demais;
- some após download/PDF/print ser disparado;
- erro libera a interface.

### 11.2 Título

Exportações do Mapa Familiar incluem título no canvas:

| View | Título |
|---|---|
| Vertical | `Mapa Familiar de {nome}` |
| Horizontal | `Genealogia de {nome}` |

O título deve aparecer em:

- PNG;
- PDF;
- impressão;
- área selecionada.

### 11.3 Área

UX esperada:

- overlay cinza cobre a área visível da árvore;
- instrução no topo;
- seleção com borda azul/âmbar;
- toolbar com PNG, PDF, Imprimir e cancelar;
- loading local durante exportação;
- overlay fecha após sucesso.

---

## 12. Avatares e ícones

Avatares sem foto usam silhuetas SVG.

Regras UX:

- não devem aparecer como quadrados no arquivo exportado;
- pet usa ícone próprio;
- estrela e cruz devem manter contraste;
- ícones internos não devem receber stroke/fill dos conectores;
- fotos reais mantêm `object-cover`.

Classes semânticas:

```txt
family-map-avatar-icon
family-map-person-silhouette
family-map-pet-icon
family-map-status-icon
family-map-birth-icon
family-map-deceased-icon
```

---

## 13. Cards

Regras gerais:

- cantos arredondados;
- sombra discreta;
- `min-w-0`;
- texto truncado apenas onde necessário;
- cores via `data-family-map-color-key`;
- card de grupo com uma pessoa pode ter largura menor;
- grupo de `Primos Maternos`/`Primos Paternos` com uma pessoa deve ter menos destaque.

---

## 14. Conectores

Sistemas separados:

| View | Sistema |
|---|---|
| Minha Árvore desktop | ReactFlow edges |
| Minha Árvore mobile | HTML/CSS |
| Mapa Familiar Vertical | SVG próprio |
| Mapa Familiar Horizontal | SVG próprio |
| Genealogia/Visão Completa | ReactFlow |

Regras UX:

- conectores não devem parecer soltos;
- ao ocultar grupos, linhas devem se aproximar dos cards;
- ao ocultar linhas, ícones internos permanecem visíveis;
- conectores da horizontal devem manter alinhamento com cônjuges/filhos.

---

## 15. Responsividade

### 15.1 Mobile

Breakpoints obrigatórios:

```txt
320px
375px
390px
430px
```

Verificar:

- header;
- botão `Controles`;
- modal de controles;
- bottom nav;
- árvore;
- seleção por área;
- exportação.

### 15.2 Desktop

Verificar:

- sidebar aberta;
- sidebar colapsada;
- modo wide do Mapa Familiar;
- exportação com zoom alterado;
- `restore-view`.

---

## 16. Elementos ignorados na exportação

UX correta:

```txt
Arquivo exportado deve parecer uma peça final da árvore, não um screenshot da interface.
```

Não devem aparecer:

- sidebar;
- header;
- bottom nav;
- botão `Controles`;
- menus/flyouts;
- overlay de seleção;
- loading;
- toolbars.

---

## 17. QA visual recomendado

### Mapa Familiar Vertical

- paletas white/visual/orange/brown;
- grupos normais;
- `Destacar > Grupos`;
- `Destacar > Linhas`;
- cônjuges;
- pets;
- modo wide;
- exportação.

### Mapa Familiar Horizontal

- colunas 1–6;
- colunas vazias;
- cônjuges adjacentes;
- casal → filhos;
- `Destacar > Grupos`;
- exportação;
- mobile.

### Exportação

- PNG;
- PDF;
- imprimir;
- área;
- avatares;
- título;
- loading.

---

## 18. Backlog visual explícito

Se ainda não implementado ou não validado, permanece como backlog/QA:

- QA da horizontal mobile por geração em 320px, 375px, 390px e 430px;
- QA de safe-area em iOS/Safari para modal de controles, chips e bottom nav;
- refinamento avançado de conectores internos/fan-out por card em grupos sem chrome;
- PDF multipágina ou vetorial.

---

## 19. Anti-regressões

Não fazer:

- reintroduzir título horizontal antigo `Mapa Familiar Horizontal de {nome}`;
- reintroduzir laranja em Pets na paleta visual;
- usar `svg path` global para conectores;
- exportar painel/header;
- esconder cards ao ativar `Destacar > Grupos`;
- fechar loading cedo demais;
- deixar avatares como quadrados no export;
- duplicar controles mobile;
- remover `restore-view`.
