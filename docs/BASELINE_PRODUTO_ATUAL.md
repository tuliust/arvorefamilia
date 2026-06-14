# Baseline do produto atual — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/BASELINE_PRODUTO_ATUAL.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: baseline funcional revisada após ajustes em views oficiais, painel, paletas desktop/mobile, calendário mobile, cônjuges na horizontal e suporte visual a núcleos conjugais adicionais.

---

## 1. Objetivo

Este documento define o estado canônico atual do produto para orientar novas alterações, revisões, limpezas e QA.

A baseline serve para evitar regressões como:

- restaurar rotas antigas da árvore;
- reintroduzir documentos canônicos desatualizados;
- remover código ainda compartilhado pelas views oficiais;
- apagar compatibilidades de dados sem migração;
- remover CSS misto sem teste visual;
- alterar navegação, exportação ou retorno de perfil sem validação;
- reintroduzir artefatos locais no versionamento;
- reintroduzir cores mobile divergentes do desktop;
- reintroduzir controles desktop no modal mobile;
- fazer cards mobile caírem em fallback azul/teal quando outra paleta está ativa;
- quebrar a exibição de cônjuges na horizontal;
- voltar a exibir microcopy de data desconhecida nos cards mobile.

Regra principal:

```txt
O comportamento implementado no código atual prevalece sobre documentação histórica.
```

---

## 2. Baseline funcional da árvore

O produto mantém duas views oficiais de árvore:

| View | Rota | Status | Uso |
|---|---|---|---|
| Árvore Familiar | `/mapa-familiar` | Oficial/default | View vertical principal da árvore |
| Mapa Genealógico | `/mapa-familiar-horizontal` | Oficial | View horizontal/genealógica por gerações |

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`, especialmente `?pessoa=...`.

### Rotas antigas removidas do produto ativo

As rotas abaixo não são mais views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Elas não devem voltar a aparecer como:

- rotas da árvore em `routes.tsx`;
- valores de `TreeViewMode`;
- destino de menu do usuário;
- favorito de página ativo;
- resultado de busca global como página ativa;
- fallback de perfil;
- item de header/breadcrumb;
- teste E2E de rota válida.

### Exceção nominal importante

A rota abaixo continua vigente:

```txt
/minha-arvore/editar
```

Ela representa edição de dados/perfil/árvore do membro e não deve ser confundida com a view antiga `/minha-arvore`.

---

## 3. Contrato de `TreeViewMode`

O contrato atual deve permanecer restrito a:

```ts
export type TreeViewMode =
  | 'mapa-familiar'
  | 'mapa-familiar-horizontal';
```

Mapeamento esperado:

```txt
mapa-familiar            -> /mapa-familiar
mapa-familiar-horizontal -> /mapa-familiar-horizontal
```

Fallback esperado:

```txt
getTreeViewModeFromPath(path desconhecido) -> mapa-familiar
```

Regras:

- não reintroduzir `minha-arvore`, `genealogia` ou `visao-completa` no tipo;
- não criar alias silencioso para rotas removidas;
- qualquer nova view futura exige alteração coordenada em rotas, navegação, favoritos, busca, testes e documentação;
- alternância Vertical/Horizontal deve preservar `location.search`.

---

## 4. Renderização oficial das views

| Rota | Ambiente | Componente oficial |
|---|---|---|
| `/mapa-familiar` | Desktop/tablet | `DesktopFamilyMapView` |
| `/mapa-familiar` | Mobile | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | Desktop/tablet | `DesktopFamilyHorizontalMapView` |
| `/mapa-familiar-horizontal` | Mobile | `MobileFamilyHorizontalMapView` |

Regras:

- `/mapa-familiar` é a experiência visual vertical principal;
- `/mapa-familiar-horizontal` é a experiência horizontal por gerações;
- a horizontal mobile não é subrota; é uma renderização interna da mesma rota;
- a palavra “Genealogia” pode aparecer como conceito/título visual, mas não reativa `/genealogia`;
- não reintroduzir ReactFlow como view pública principal sem decisão arquitetural explícita.

---

## 5. Títulos oficiais

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |
| `/calendario-familiar` | `Calendário` |

Regras:

- títulos exibidos e exportados devem permanecer consistentes;
- nomes de rota não mudam;
- títulos antigos `Mapa Familiar de...`, `Mapa Familiar Horizontal de...` e `Genealogia de...` não são mais o contrato vigente da UI principal.

---

## 6. Navegação, favoritos e busca global

As duas views oficiais devem estar alinhadas em:

```txt
src/app/routes.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/pages/home/SidebarPanelTabs.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/PersonProfile.tsx
```

### Favoritos

Páginas de árvore favoritáveis:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Favoritar uma página salva o atalho da rota canônica, não estado visual de zoom, geração ativa ou filtros.

### Busca global

A busca global deve indexar as duas views oficiais.

Termos antigos podem existir apenas como keywords que redirecionam para rotas vigentes:

```txt
minha árvore -> /mapa-familiar
árvore genealógica -> /mapa-familiar-horizontal
linha genealógica -> /mapa-familiar-horizontal
visão completa -> /mapa-familiar-horizontal
```

### Retorno de perfil

Retornos seguros para a árvore:

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

Fallback padrão:

```txt
/mapa-familiar
```

---

## 7. Painel da árvore

### Desktop

Estado atual:

- não há mais barra visual `Filtros | Legendas | Ações`;
- filtros/grupos/status ficam disponíveis diretamente no painel;
- controles superiores e flyouts permanecem preservados;
- painel, overlays e loading são marcados para não entrar na exportação;
- cards de `Grupos` e `Filtros` devem seguir o vocabulário visual da paleta ativa;
- no desktop, cards do painel devem replicar gradiente/borda/texto dos cards da árvore sempre que houver equivalência visual;
- estados inativos continuam perceptíveis por opacidade/desaturação, sem perder legibilidade.

Controles desktop vigentes:

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

### Mobile

Estado atual:

- modal específico aberto pelo botão de controles;
- título `Controles`;
- subtítulo removido;
- botão superior direito com ícone `X`;
- botão `Grupos` exibe/oculta cards de grupos;
- filtros ficam sempre visíveis em 4 colunas;
- mobile não deve receber controles de zoom/exportação/restauração;
- paletas mobile devem seguir o desktop.

Controles mobile vigentes:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros
```

Não exibir no mobile:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Regras:

- `Vertical` navega para `/mapa-familiar`;
- `Horizontal` navega para `/mapa-familiar-horizontal`;
- ambos preservam `location.search`;
- `?pessoa=...` não pode ser perdido;
- `Restaurar visualização` não é sinônimo de `Zoom -`;
- painel mobile deve travar scroll do body e manter rolagem interna.

---

## 8. Exportação

A exportação vigente deve funcionar nas duas views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Ações oficiais:

- Área;
- Imagem/PNG;
- PDF;
- Imprimir.

Regras:

- painel, header, bottom nav, overlays, modal mobile, loading e debug não devem entrar na captura;
- a exportação deve preservar paleta, filtros, conectores SVG, cards e título;
- área selecionada deve capturar apenas a região escolhida;
- `Área` deve funcionar como toggle;
- loading deve permanecer até a ação real concluir;
- captura muito grande deve falhar com mensagem clara;
- `treeExport.ts` é utilitário crítico e não deve ser removido em limpezas gerais;
- compatibilidade técnica com ReactFlow não significa que as rotas antigas estejam ativas;
- o modal mobile de controles não deve expor Exportar.

---

## 9. Paletas, cards e avatares

### Paletas oficiais

```txt
white
visual
orange
brown
```

Contrato:

- desktop é a referência visual;
- mobile deve herdar o mesmo contrato visual do desktop;
- cards, bordas, texto, conectores, labels, grupos e canvas devem mudar juntos;
- exportação deve preservar a paleta ativa;
- a paleta Visual/Azul usa gradientes teal/ciano/azul nos cards, mesmo quando os tokens base da paleta são sólidos;
- paletas Branca, Laranja e Marrom no mobile não podem cair em fallback azul/teal.

CSS crítico de paletas recentes:

```txt
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
```

### Cards mobile de pessoas

Em `/mapa-familiar` mobile, os cards devem exibir:

```txt
Nome da pessoa
★ AAAA, se houver nascimento
✥ AAAA, se houver falecimento
```

Regras:

- não exibir `Nascimento não informado`;
- não exibir `Falecimento não informado`;
- não exibir linha de nascimento se não houver data/ano;
- não exibir linha de falecimento se não houver data/ano;
- manter ícones e texto legíveis em todas as paletas;
- o mesmo princípio se aplica a cards compactos que tenham metadados vitais.

### Avatares

Contrato:

```txt
Pessoa com foto -> foto_principal_url
Pessoa sem foto -> User, lucide-react
Pet             -> PawPrint, lucide-react
```

Não há mais distinção visual de avatar por gênero.

---

## 10. Mobile horizontal

Contrato:

```txt
1 geração = 1 tela
botões Ger 1/Ger 2/Ger 3... = navegação
sem scroll horizontal manual
scroll vertical até cards e conectores visíveis
```

Regras:

- primeira tela deve ser a menor geração visível;
- botões laterais de seta não aparecem;
- botão de controles fica alinhado à linha de botões `Ger`;
- conectores devem seguir a estrutura desktop;
- direção de swipe deve ser validada em aparelho real antes de fechar QA;
- cards sem `data-family-map-color-key` não podem herdar fallback azul quando outra paleta estiver ativa;
- a paleta ativa deve ser coerente com a versão desktop.

---

## 11. Múltiplos cônjuges e núcleos conjugais

A view vertical `/mapa-familiar` deve suportar múltiplos relacionamentos da pessoa central.

Contrato:

- o primeiro cônjuge visível permanece como núcleo principal;
- cônjuges adicionais podem gerar bloco `Outro relacionamento`;
- filhos devem ser agrupados pelo outro pai/mãe quando houver relacionamento explícito;
- filhos sem outro pai/mãe identificado permanecem no grupo principal;
- dados reais não devem ser criados por ajuste visual;
- novos núcleos devem entrar no cálculo de altura, bounds e exportação.

Na horizontal:

- cônjuges ancestrais e diretos devem respeitar filtros;
- cônjuges de `pais` / Geração 4 devem aparecer quando o filtro `Cônjuges` estiver ativo;
- cônjuges adjacentes não devem ser inferidos por proximidade visual: dependem de relacionamento explícito.

---

## 12. Calendário familiar mobile

Rota:

```txt
/calendario-familiar
```

Contrato mobile atual dos botões de categoria:

- cinco categorias em uma única linha;
- categorias: `Aniversário`, `Casamento`, `Falecimento`, `Outros`, `Reunião`;
- cada botão mantém o título em uma linha;
- cada botão exibe uma bolinha colorida acima do título;
- o título deve ocupar a largura útil do botão;
- em telas estreitas, usar `nowrap`, `ellipsis` e ajustes responsivos sem criar overflow horizontal;
- o layout deve ser validado em 320px, 375px, 390px e 430px.

CSS crítico:

```txt
src/styles/calendar-mobile-category-buttons.css
```

---

## 13. Debug temporário

Pode existir um dropdown de diagnóstico:

```txt
Visualizar como...
```

Objetivo:

- selecionar uma pessoa da tabela `pessoas` como referência central temporária;
- visualizar `/mapa-familiar` e `/mapa-familiar-horizontal` a partir dessa pessoa;
- não alterar dados;
- não navegar para perfil;
- não entrar na exportação.

Status:

- ferramenta de debug temporário;
- antes de produção, decidir se será removida, protegida por flag ou restrita a admin.

---

## 14. Componentes e contratos críticos

### Oficiais

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/actions.ts
src/app/pages/CalendarioFamiliar.tsx
```

### Preservados por dependência até refatoração específica

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Motivos:

- ainda podem conter tipos, helpers ou compatibilidades compartilhadas;
- `directFamilyDistributedLayout.ts` contém helpers usados pelas views oficiais;
- `genealogyColumnsLayout.ts` é dependência real da horizontal;
- CSS ReactFlow legado deve ser limpo apenas junto do projeto de desativação do renderer legado.

---

## 15. CSS e data attributes críticos

Preservar:

```txt
data-tree-route-view="mapa-familiar-horizontal"
data-family-map-horizontal-root
data-family-map-horizontal-mobile-root
data-mobile-family-tree-root
data-family-map-export-root="true"
data-tree-export-ignore="true"
data-tree-selection-overlay="true"
data-tree-export-loading="true"
data-tree-debug-viewer="true"
data-family-map-color-key
data-family-map-mobile-card="true"
data-family-map-connectors="true"
data-tree-panel-card="true"
data-tree-panel-filter-key
```

CSS crítico:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-tree-mobile.css
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
src/styles/tree-view-desktop-polish.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
src/styles/calendar-mobile-category-buttons.css
```

Atenção:

- `mobile-edit-profile.css` pode usar nomenclatura associada a `/minha-arvore/editar`;
- isso é permitido porque a rota de edição continua vigente;
- não remover CSS apenas por nome antigo;
- aliases antigos devem ser tratados caso a caso;
- CSS importado por último costuma ser usado para vencer conflitos de Tailwind/inline styles; revisar ordem antes de mover arquivos.

---

## 16. Testes obrigatórios de baseline

Antes de fechar mudanças relevantes:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```

E2E mínimo esperado:

- `/` redireciona ou bloqueia conforme sessão/guard;
- `/mapa-familiar` é protegida;
- `/mapa-familiar-horizontal` é protegida;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não voltam como rotas ativas;
- `/minha-arvore/editar` continua protegida;
- `/pessoa/:id` e `/pessoas/:id` redirecionam para login sem sessão;
- `/admin/*` bloqueia usuário não autenticado;
- `/calendario-familiar` continua protegida.

---

## 17. Pendências reais pós-baseline

Pendências devem ficar centralizadas em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

A baseline não deve virar backlog. Ela deve registrar o estado aceito do produto.

---

## 18. Checklist de anti-regressão rápido

Antes de aceitar alteração visual:

```txt
[ ] /mapa-familiar desktop preservado.
[ ] /mapa-familiar mobile preservado.
[ ] /mapa-familiar-horizontal desktop preservado.
[ ] /mapa-familiar-horizontal mobile preservado.
[ ] Paletas white/visual/orange/brown preservadas.
[ ] Cards mobile sem “Nascimento não informado”.
[ ] Bordas de grupos mobile seguem paleta desktop.
[ ] Cônjuges da Geração 4 aparecem na horizontal quando filtro Cônjuges está ativo.
[ ] Cards de painel desktop seguem gradiente/paleta da árvore.
[ ] Conectores continuam finos e legíveis.
[ ] Calendário mobile mantém 5 categorias em uma linha com bolinha acima do título.
[ ] Exportação não captura painel/header/bottom nav/modal/debug.
```
