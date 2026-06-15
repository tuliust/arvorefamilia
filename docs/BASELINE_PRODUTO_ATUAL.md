# Baseline do produto atual — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/BASELINE_PRODUTO_ATUAL.md`  
> Projeto: `tuliust/arvorefamilia`  
> Tipo: baseline funcional  
> Status: revisado contra os arquivos enviados e contra a `main` atual; separa comportamento implementado de pendências registradas.

---

## 1. Objetivo

Este documento define a fonte de verdade funcional do produto no estado atual da `main`.

Use esta baseline para:

- orientar novas alterações de produto;
- evitar regressões em rotas, árvore, painel, mobile, exportação, calendário e documentação;
- impedir que documentação histórica seja tratada como comportamento vigente;
- diferenciar claramente **estado implementado** de **pendências abertas**.

Regra principal:

```txt
O comportamento implementado no código atual prevalece sobre documentação histórica.
Pendências conhecidas ficam no docs/PLANO_PROXIMOS_PASSOS.md.
```

---

## 2. Rotas vigentes e removidas

### 2.1 Views oficiais da árvore

| View | Rota | Status | Papel |
|---|---|---|---|
| Árvore Familiar | `/mapa-familiar` | vigente/default | view vertical principal |
| Mapa Genealógico | `/mapa-familiar-horizontal` | vigente | view horizontal por gerações |

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`, especialmente `?pessoa=...`.

### 2.2 Rotas antigas removidas como views

As rotas abaixo **não são views ativas**:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Elas só podem aparecer como:

- histórico;
- termo de busca/keyword redirecionado para rota vigente;
- item de checklist para garantir que não voltem.

Não devem voltar a aparecer em `routes.tsx`, `TreeViewMode`, menu, favoritos, breadcrumb, fallback de perfil ou teste como rota válida.

### 2.3 Exceção vigente

```txt
/minha-arvore/editar
```

Essa rota continua válida para edição de dados do membro e não deve ser confundida com a antiga view `/minha-arvore`.

---

## 3. Contrato de `TreeViewMode`

O tipo vigente deve permanecer restrito a:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Mapeamento esperado:

| Modo | Rota |
|---|---|
| `mapa-familiar` | `/mapa-familiar` |
| `mapa-familiar-horizontal` | `/mapa-familiar-horizontal` |

Fallback esperado:

```txt
getTreeViewModeFromPath(path desconhecido) -> mapa-familiar
```

Qualquer nova view futura exige atualização coordenada em:

```txt
src/app/routes.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/pages/home/HomeTreeSection.tsx
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
tests/e2e/
docs/
```

---

## 4. Renderização oficial da árvore

| Rota | Ambiente | Componente |
|---|---|---|
| `/mapa-familiar` | desktop/tablet | `DesktopFamilyMapView` |
| `/mapa-familiar` | mobile | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | desktop/tablet | `DesktopFamilyHorizontalMapView` |
| `/mapa-familiar-horizontal` | mobile | `MobileFamilyHorizontalMapView` |

Títulos funcionais/exportáveis:

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |

Observação: rótulos de navegação podem usar texto mais curto, mas não devem reativar nomes de rotas removidas.

---

## 5. Estado funcional consolidado

| Área | Estado atual |
|---|---|
| Rotas da árvore | Implementadas com duas views oficiais. |
| Redirect raiz | Implementado para `/mapa-familiar`, preservando query string. |
| Guards | `TreeAccessRoute`, `MemberRoute` e `ProtectedRoute` permanecem como contratos de acesso. |
| Shell da árvore | `Home` orquestra carregamento, pessoa central, filtros, painel, modal, exportação e debug temporário. |
| Painel desktop | Implementado sem barra `Filtros | Legendas | Ações`; controles e filtros ficam diretos ou em flyouts. |
| Modal mobile | Implementado como versão reduzida de controles; não deve expor Zoom, Restaurar ou Exportar. |
| Exportação | Implementada nas duas views oficiais para Área, PNG, PDF e Imprimir. |
| Paletas | `white`, `visual`, `orange`, `brown`; desktop é a referência visual. |
| Calendário | Implementado em `/calendario-familiar`, com categorias e layout mobile específico. |
| Perfil/pessoas | Implementado com `/pessoa/:id`, `/pessoas/:id` e área de membro. |
| Fórum | Implementado em `/forum/*`. |
| Favoritos | Implementados para páginas, pessoas e conteúdos suportados. |
| Notificações | Implementadas em central e preferências. |
| Admin | Implementado em `/admin/*`. |
| Testes | Há Vitest e Playwright cobrindo parte da baseline estrutural. |

---

## 6. Painel, controles e navegação

### Desktop/tablet

Controles vigentes:

```txt
Zoom +
Zoom -
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros de grupos
Filtros de status
```

Regras:

- a barra `Filtros | Legendas | Ações` não é UI vigente;
- painel, flyouts, overlays e loading não entram na exportação;
- `Vertical` navega para `/mapa-familiar`;
- `Horizontal` navega para `/mapa-familiar-horizontal`;
- alternância preserva `location.search`;
- `?pessoa=...` não pode ser perdido.

### Mobile

Controles vigentes:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros
```

Não exibir no modal mobile:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Regras:

- modal mobile tem título `Controles`;
- não exibe subtítulo;
- botão superior direito usa ícone `X`;
- `Grupos` exibe/oculta cards de grupos;
- filtros de status permanecem visíveis;
- body deve ficar travado enquanto o modal está aberto;
- conteúdo interno do modal deve rolar sem prender a página inteira.

---

## 7. Exportação

A exportação é parte da baseline nas duas views oficiais.

Ações:

```txt
Área
Imagem/PNG
PDF
Imprimir
```

Contratos:

- captura deve ignorar header, painel, bottom nav, modal mobile, overlays transitórios e debug;
- exportação deve preservar título, paleta, filtros, cards e conectores;
- `Área` funciona como toggle de seleção;
- captura muito grande deve retornar erro claro;
- `treeExport.ts` e `TreeAreaSelectionOverlay.tsx` são dependências críticas;
- a existência de utilitários herdados de ReactFlow não reativa rotas antigas.

---

## 8. Paletas, cards, avatares e pets

Paletas oficiais:

```txt
white
visual
orange
brown
```

Contratos:

- desktop é referência visual;
- mobile deve herdar o mesmo contrato visual;
- cards, bordas, texto, conectores, labels, canvas e exportação devem mudar de forma coerente;
- a paleta `visual` pode usar gradientes teal/ciano/azul;
- `white`, `orange` e `brown` não devem cair em fallback azul/teal.

Avatares:

| Caso | Renderização |
|---|---|
| Pessoa com foto | `foto_principal_url` |
| Pessoa sem foto | ícone `User` de `lucide-react` |
| Pet | ícone `PawPrint` de `lucide-react` |

Não há fallback visual diferente por gênero.

---

## 9. Mobile horizontal

Contrato:

```txt
1 geração = 1 tela
botões Ger 1/Ger 2/Ger 3... = navegação
swipe lateral = troca de geração
scroll vertical = rolagem da geração ativa
sem scroll horizontal manual como navegação principal
```

Regras:

- horizontal mobile usa `MobileFamilyHorizontalMapView`;
- não usa barra `Paterno | Central | Materno`;
- não cria subrotas por geração;
- deve preservar safe area e bottom nav;
- botão de controles deve ficar alinhado à linha dos botões `Ger`;
- cartões de paletas não azuis não devem cair em fallback azul.

---

## 10. Cônjuges e núcleos conjugais

### Implementado

- A view vertical suporta múltiplos núcleos conjugais da pessoa central quando os dados existem.
- Cônjuges ancestrais de `avos`, `bisavos` e `tataravos` são tratados como grupos ancestrais sempre visíveis na horizontal.
- Cônjuges de `tios`, `primos`, `sobrinhos`, `filhos` e `netos` são filtráveis pelo filtro `Cônjuges`.

### Pendência registrada

A documentação anterior tratava cônjuges de `pais`/Geração 4 na horizontal como implementados. A auditoria do código indica que `pais` ainda não está em `FILTERABLE_SPOUSE_ANCHOR_GROUPS` nas views horizontais.

Essa pendência deve permanecer registrada como:

```txt
TREE-003 — verificar/corrigir ausência de cônjuges da Geração 4/Pais na horizontal
```

Até correção de código autorizada, não documentar esse comportamento como implementado.

---

## 11. Cards mobile e datas desconhecidas

Contrato de produto:

```txt
Nome da pessoa
★ AAAA, se houver nascimento
✥ AAAA, se houver falecimento
```

Não deve aparecer no resultado visual:

```txt
Nascimento não informado
Falecimento não informado
```

Estado técnico atual:

- o resultado visual é protegido por limpeza em `src/main.tsx`;
- essa limpeza oculta linhas de fallback por `MutationObserver`;
- a correção estrutural no componente React permanece pendente.

Pendência relacionada:

```txt
TREE-004 — reduzir dependência de limpeza DOM para remover fallback de nascimento/falecimento no mobile
```

---

## 12. Calendário familiar

Baseline atual:

- rota: `/calendario-familiar`;
- categorias visuais: aniversário, casamento, falecimento, outros e reunião;
- filtros mobile usam botões compactos;
- no mobile, os botões devem caber em uma linha, com bolinha colorida acima do texto;
- integração Google Agenda depende de configuração de OAuth, test users e secrets, quando aplicável.

Detalhes operacionais de OAuth devem ficar em `docs/operacao/OAUTH_GOOGLE.md`, não neste arquivo.

---

## 13. Debug temporário

O dropdown `Visualizar como...`, quando presente, deve ser tratado como ferramenta de QA/debug, não como funcionalidade final de produto.

Regras:

- não entrar na exportação;
- não persistir dados reais;
- não substituir fluxo oficial de seleção de pessoa;
- decisão de manter, remover ou condicionar por flag/admin deve ficar em `docs/PLANO_PROXIMOS_PASSOS.md`.

---

## 14. Arquivos canônicos relacionados

| Tema | Documento |
|---|---|
| Mapa técnico de arquivos | `docs/INVENTARIO_TECNICO.md` |
| Estado implementado por frente | `docs/GUIA_IMPLEMENTACOES.md` |
| Responsabilidades de componentes | `docs/GUIA_COMPONENTES.md` |
| UX/layout/responsividade | `docs/GUIA_UX_LAYOUT.md` |
| Checklists de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |
| Pendências e decisões futuras | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Operação/deploy/migrations | `docs/operacao/` |

---

## 15. Validação mínima

Para mudanças documentais:

```bash
git diff --check
npm run build
```

Para mudanças que possam tocar rotas, guards, árvore ou navegação:

```bash
npm test
npm run test:e2e
```

Para mudanças visuais:

```bash
npm run build
npm run test:e2e
```

Além dos comandos, fazer QA visual manual nas larguras:

```txt
320
375
390
430
768
1366
1440
1536
1920
```

---

## 16. Checklist rápido de baseline

- [ ] `/` preserva query string ao redirecionar para `/mapa-familiar`.
- [ ] `/mapa-familiar` e `/mapa-familiar-horizontal` são as únicas views ativas da árvore.
- [ ] `/minha-arvore`, `/genealogia` e `/visao-completa` não voltaram como rotas ativas.
- [ ] `/minha-arvore/editar` continua vigente.
- [ ] `TreeViewMode` possui apenas dois modos.
- [ ] Mobile horizontal usa uma geração por tela.
- [ ] Modal mobile não exibe Zoom, Restaurar ou Exportar.
- [ ] Exportação ignora UI transitória.
- [ ] Paletas mobile seguem desktop.
- [ ] Pendências `TREE-003` e `TREE-004` não são descritas como implementadas.
