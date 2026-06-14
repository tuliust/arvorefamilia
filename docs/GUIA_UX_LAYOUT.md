# Guia de UX e Layout — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/GUIA_UX_LAYOUT.md`  
> Projeto: `tuliust/arvorefamilia`  
> Baseline revisada: `main` em `833108f`  
> Status: guia alinhado às duas views oficiais e ao painel simplificado.

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
| Painel sem abas internas | A barra `Filtros | Legendas | Ações` não deve voltar como UI ativa. |

Anti-padrões:

```txt
Não usar translate/top negativo para corrigir canvas.
Não usar seletor global svg path.
Não reintroduzir /minha-arvore, /genealogia ou /visao-completa como views ativas.
Não usar /visao-completa como substituto da horizontal.
Não restaurar activeSidebarPanel para resolver organização do painel.
```

---

## 3. Rotas e navegação da árvore

| View | Rota | Papel |
|---|---|---|
| Mapa Familiar | `/mapa-familiar` | Principal/default |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | Alternativa horizontal/genealógica |

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
- modais auxiliares.

Regras:

- header deve permanecer visualmente estável;
- avatar não deve exibir nome textual ao lado no desktop;
- nome/e-mail ficam no menu do avatar;
- a árvore deve ocupar área de canvas sem scroll externo desnecessário;
- search params devem ser preservados ao alternar vertical/horizontal;
- painel, modal e overlays auxiliares não entram na exportação.

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
- qualquer ajuda contextual deve ser independente e ignorada pela exportação.

---

## 8. Painel mobile

Nas rotas oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Comportamento:

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
- paleta ativa deve afetar cards, conectores, labels e exportação;
- a horizontal preserva fundo transparente onde definido;
- ícones internos não devem herdar regras globais de conectores.

---

## 10. Cards e avatares

Regras:

- cards devem preservar contraste entre texto/fundo;
- avatar com foto deve manter crop estável;
- avatar sem foto usa ícones/silhuetas sem virar quadrado escuro na exportação;
- pet usa iconografia própria;
- falecimento/data de nascimento usam ícones semânticos;
- microcopy não deve depender de hover para informação essencial.

---

## 11. Conectores

### Vertical

- conectores SVG por âncoras;
- respeitam grupos visíveis;
- se `Destacar > Grupos` remover chrome, conectores continuam coerentes;
- cônjuge não é inferido por proximidade.

### Horizontal

- casal → filhos;
- cônjuges adjacentes;
- colunas por geração;
- conectores não devem invadir cards;
- conectores devem respeitar paleta ativa.

### Mobile

- vertical usa conectores HTML/CSS;
- horizontal usa conectores escopados à geração/tela;
- conectores não devem criar overflow horizontal indevido.

---

## 12. Exportação

Ações:

```txt
Área
Imagem/PNG
PDF
Imprimir
```

Regras visuais:

- título deve aparecer no canvas exportado quando aplicável;
- painel, header, bottom nav, modal e overlay não entram;
- conectores aparecem;
- paleta ativa é respeitada;
- SVGs internos não viram quadrados escuros;
- imagem grande demais deve gerar erro claro.

---

## 13. Breakpoints de QA

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
- exportação;
- painel desktop em altura baixa.

---

## 14. Anti-regressões visuais

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
```

---

## 15. Critério de aceitação para mudanças de layout

Antes de commit:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Para mudanças visuais relevantes:

- registrar screenshots manuais nos principais breakpoints;
- testar exportação;
- testar painel aberto/fechado;
- testar paleta;
- testar filtros;
- testar retorno de perfil com `?voltar=`.
