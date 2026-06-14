# Guia de UX e Layout - Árvore Família

> Última revisão: 2026-06-13  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia alinhado à baseline atual da árvore: `/mapa-familiar` como view principal e `/mapa-familiar-horizontal` como alternativa horizontal/genealógica.

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

Anti-padrões:

```txt
Não usar translate/top negativo para corrigir canvas.
Não usar seletor global svg path.
Não reintroduzir /minha-arvore, /genealogia ou /visao-completa como views ativas.
Não usar /visao-completa como substituto da horizontal.
```

---

## 3. Rotas e navegação da árvore

Views oficiais:

| View | Rota | Papel |
|---|---|---|
| Mapa Familiar | `/mapa-familiar` | principal/default |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | alternativa horizontal/genealógica |

Redirect:

```txt
/ -> /mapa-familiar
```

preservando `location.search`.

Rotas antigas removidas do produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

é edição de membro e deve permanecer.

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
- modais auxiliares.

Regras:

- header deve permanecer visualmente estável;
- avatar não deve exibir nome textual ao lado no desktop;
- nome/e-mail ficam no menu do avatar;
- a árvore deve ocupar área de canvas sem scroll externo desnecessário;
- search params devem ser preservados ao alternar vertical/horizontal.

---

## 5. Mapa Familiar

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
- título `Mapa Familiar de {primeiroNome}`.

### Mobile

Componente:

```txt
MobileFamilyTreeView
```

Características:

- experiência segmentada;
- navegação interna Paterno/Central/Materno;
- conectores HTML/CSS;
- botão `Controles` abre modal mobile.

---

## 6. Mapa Familiar Horizontal

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
- título visual/exportável `Genealogia de {primeiroNome}`.

Observação:

- o título pode usar “Genealogia” como conceito visual;
- isso não reativa a rota `/genealogia`.

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
chips G1/G2/G3... = atalho entre gerações
```

Regras:

- não usar barra `Paterno | Central | Materno`;
- não usar canvas desktop amplo no mobile;
- não criar subrotas por geração;
- preservar safe area e bottom nav;
- exportação não deve capturar header, bottom nav ou modal.

---

## 7. Painel desktop

Estado atual:

| Área | Comportamento |
|---|---|
| Topo | Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar, Destacar |
| Abas | `Filtros`, `Legendas`, `Ações` |
| Filtros | grupos/status |
| Legendas | legenda visual |
| Ações | painel auxiliar |

Dívida planejada:

- remover a barra `Filtros | Legendas | Ações`;
- manter filtros/grupos visíveis diretamente;
- ocultar/remover legenda e ações se não forem mais parte do produto;
- preservar controles superiores.

Regras atuais até a limpeza:

- painel não entra na exportação;
- botões ativos refletem a rota;
- `Restaurar visualização` não deve ser confundido com `Zoom -`;
- `Vertical` aponta para `/mapa-familiar`;
- `Horizontal` aponta para `/mapa-familiar-horizontal`.

---

## 8. Painel mobile

Nas rotas oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

comportamento:

- botão `Controles` vem de `HomeMobileNav`;
- painel abre como modal;
- overlay fecha o modal;
- `Escape` fecha quando disponível;
- body fica com scroll travado;
- conteúdo interno tem rolagem própria;
- painel fica acima do header, bottom nav e botões flutuantes;
- painel não entra na exportação.

Regras:

- não duplicar `MobileTreeControlsPortal`;
- não usar sidebar lateral mobile;
- não usar bottom sheet parcial se comprometer controles;
- manter z-index superior às camadas da árvore.

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
- `Pets` no modo visual usa tom teal/ciano;
- ícones de status devem manter contraste;
- avatares/SVGs devem continuar legíveis;
- exportação deve refletir paleta ativa.

---

## 10. Cards

Componente base:

```txt
FamilyTreeVisualCards
```

Regras:

- exibir nome de forma legível;
- preservar distinção de pessoa, falecido e pet;
- ícones SVG internos devem ser exportáveis;
- conectores não devem herdar estilos de ícones;
- não reduzir card a ponto de perder primeiro/segundo nome.

---

## 11. Conectores

### Vertical

- SVG por âncoras;
- acompanha grupos, cards e modo wide;
- recalcula quando grupos são ocultados/expandidos;
- não infere casamento por proximidade visual.

### Horizontal

- SVG de cônjuge e casal → filhos;
- colunas/gaps devem evitar sobreposição;
- conectores são recalculados com `Destacar > Grupos`.

### Mobile vertical

- conectores HTML/CSS próprios;
- não aplicar CSS ReactFlow.

### Mobile horizontal

- conectores devem respeitar geração ativa;
- não capturar controles no export.

---

## 12. Destaques

Flyout:

```txt
Destacar
```

Opções:

| Opção | Efeito |
|---|---|
| Linhas | oculta ou suaviza conectores visuais |
| Cards | destaca cards |
| Grupos | oculta chrome de grupos/cabeçalhos |

Regras:

- destaque não cria relacionamento;
- destaque não reexibe item filtrado;
- destaque não altera banco;
- destaque não persiste no Supabase.

---

## 13. Exportação e captura

A exportação deve ignorar:

```txt
header
painel
bottom nav
modal
overlay
loading
botões flutuantes
```

Marcadores esperados:

```txt
data-tree-export-ignore="true"
data-tree-selection-overlay="true"
data-tree-export-loading="true"
```

Regras:

- PNG/PDF/impressão incluem título no canvas;
- seleção por área captura área visível;
- SVGs internos devem ser normalizados;
- alterações de layout exigem QA de exportação.

---

## 14. Responsividade mínima

Validar:

```txt
320px
375px
390px
430px
768px
1024px
1366px
1440px
1536px
1920px
```

Mobile:

- sem overflow horizontal indesejado;
- controles acessíveis;
- modal com scroll interno;
- chips da horizontal cabem;
- bottom nav não cobre conteúdo crítico.

Desktop:

- painel não corta controles;
- canvas ocupa espaço útil;
- grupos laterais não sobrepõem núcleo;
- exportação captura superfície correta.

---

## 15. Não regressão visual

Antes de aprovar alteração de UX/layout:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Testes manuais mínimos:

- abrir `/`;
- abrir `/mapa-familiar`;
- abrir `/mapa-familiar-horizontal`;
- alternar Vertical/Horizontal com `?pessoa=...`;
- abrir perfil e voltar;
- abrir modal mobile de controles;
- testar exportação PNG/PDF/impressão;
- testar paletas;
- testar destaques;
- verificar favoritos e busca global.
