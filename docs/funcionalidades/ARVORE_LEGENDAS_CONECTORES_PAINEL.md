
# Árvore — painel, filtros, conectores, destaques e exportação

> Última revisão: 2026-06-22
> Local canônico: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
> Tipo: documentação funcional/técnica do painel, filtros, conectores e destaques da árvore
> Status: revisado contra o código atual para resolver a tensão entre toolbar mobile, modal legacy, Exportar, Zoom, painel `+` e scripts auxiliares.

---

## 1. Função deste documento

---

## Atualização crítica — 2026-06-22

Este documento deve distinguir três superfícies mobile diferentes:

| Superfície | Arquivo principal | Estado observado |
|---|---|---|
| Toolbar fixa | `MobileFamilyMapToolbar.tsx` | Botões `Formato`, `Cor`, `Filtros`, `Zoom` e `+`. |
| Popovers/painel da toolbar | `HomeMobileNav.tsx` | Controla visualização, cor, filtros, Zoom, exportação por handler e painel completo. |
| Modal legacy `Controles` | `Home.tsx` + `SidebarPanelTabs mobileControls` | Ainda renderiza `SidebarPanelTabs`; no código atual, `Exportar` continua aparecendo nesse componente. |

Portanto:

- `Zoom` é ação fixa da toolbar mobile;
- `Exportar` não é item fixo da toolbar mobile;
- `Exportar` ainda pode aparecer no modal legacy/painel conforme código atual;
- se o contrato de produto for remover `Exportar` do modal legacy, isso exige alteração em `SidebarPanelTabs`, não apenas documentação.


Este documento descreve:

- painel lateral desktop;
- modal mobile de controles;
- filtros de grupos;
- filtros de status;
- cards do painel;
- conectores;
- destaques;
- relação do painel com exportação.

Para detalhes das views em si:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Para detalhes da exportação:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Para QA manual:

```txt
docs/QA_MANUAL.md
```

---

## 2. Views cobertas

Views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Rotas antigas fora do produto ativo:

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

## 3. Estado atual do painel

O painel atual **não usa** a barra:

```txt
Filtros | Legendas | Ações
```

Contrato vigente:

- controles superiores compactos no desktop;
- filtros de grupos e status acessíveis diretamente;
- flyouts específicos para `Cores`, `Exportar` e `Destacar`;
- modal mobile reduzido para controles essenciais;
- cards do painel alinhados visualmente à paleta ativa;
- painel, modal e elementos auxiliares ignorados pela exportação.

Não tratar como contrato vigente:

```txt
activeSidebarPanel
aba Legendas
aba Ações
barra Filtros | Legendas | Ações
```

---

## 4. Arquivos principais

```txt
src/app/pages/Home.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeMobileNav.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapFilteredView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapFilteredView.tsx
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/tree-panel-palette-cards.css
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
```

---

## 5. Estados principais

| Estado | Papel |
|---|---|
| `directRelativeFilters` | Controla filtros de grupos diretos. |
| `personFilters` | Controla vivos, falecidos e pets. |
| `visualLineFilters` | Controla linhas/conectores conforme view. |
| `activeHighlights` | Controla `Destacar`: linhas, cards e grupos. |
| `legendOpen` | Nome histórico; controla modal mobile de controles. |
| `mobileGroupsOpen` | Controla abertura dos grupos no modal mobile. |
| `renderedDirectRelationCounts` | Contagens efetivas retornadas pela view renderizada. |

Regras:

- filtro não altera dados;
- destaque não altera dados;
- contagem deve refletir renderização efetiva quando disponível;
- cônjuge sempre visível não deve inflar contagem de cônjuges filtráveis.

---

## 6. Controles desktop

| Controle | Função |
|---|---|
| Zoom + | Aproxima a view ativa. |
| Zoom - | Afasta a view ativa. |
| Restaurar visualização | Restaura enquadramento/zoom/scroll conforme view. |
| Vertical | Navega para `/mapa-familiar`. |
| Horizontal | Navega para `/mapa-familiar-horizontal`. |
| Cores | Alterna paleta. |
| Exportar | Abre ações Área, Imagem, PDF e Imprimir. |
| Destacar | Abre destaque de Linhas, Cards e Grupos. |
| Grupos/Filtros | Controla grupos diretos e status. |

Regras:

- Vertical/Horizontal preservam `location.search`;
- `?pessoa=...` não pode ser perdido;
- painel não entra na exportação;
- `Restaurar visualização` não é sinônimo de `Zoom -`;
- ações não dependem de abas removidas.

---

## 7. Modal mobile de controles

O modal mobile é uma versão reduzida, não uma réplica do desktop.

### Contrato esperado do modal legacy

Deve conter, no mínimo:

```txt
Vertical/Horizontal
Cores
Grupos
Filtros
```

Não deve conter controles externos de zoom desktop:

```txt
Zoom +
Zoom -
Restaurar visualização
```

### Tensão atual sobre Exportar

O código atual de `SidebarPanelTabs mobileControls` ainda renderiza `Exportar`.

Regra documental:

```txt
Exportar não é item fixo da toolbar mobile.
Exportar pode existir em fluxo mobile auxiliar enquanto o código mantiver essa ação.
Se o produto decidir remover Exportar do modal legacy, alterar código + docs no mesmo commit.
```

Contrato visual:

- título `Controles`;
- sem subtítulo;
- botão superior direito com ícone `X`;
- overlay fecha o modal;
- `Escape` fecha quando disponível;
- body fica com scroll travado enquanto aberto;
- conteúdo interno tem rolagem própria;
- modal fica acima de header, bottom nav e botões flutuantes;
- modal não entra na exportação.

Regras específicas:

- `Grupos` exibe/oculta cards de grupos;
- grupos não aparecem por padrão;
- filtros de status ficam sempre visíveis;
- filtros devem caber em 4 colunas quando houver espaço.

---

## 8. Filtros de grupos

## 7.1 Scripts mobile que afetam painel/zoom/filtros

O comportamento mobile dos controles também depende dos scripts carregados pelo `index.html`, especialmente:

```txt
mobileFamilyHorizontalZoomOverview.ts
mobileFamilyMapZoomOverviewVisualFix.ts
mobileFamilyMapDescendantsStabilityLock.ts
mobileFamilyMapExtendedSpouseCards.ts
mobileFamilyMapFilterButtonsBehaviorFix.ts
mobileFamilyMapFullOverview.ts
mobileFamilyMapFullOverviewMosaicFix.ts
```

Regras:

- não criar novo script de toolbar/zoom/exportação sem auditar os scripts acima;
- não alterar `data-mobile-family-spouse-scope` sem validar filtros de cônjuges;
- não alterar overview/Zoom sem validar `descendants` e mapa completo.


Keys esperadas:

```txt
tataravos
bisavos
avos
pais
tios
primos
sobrinhos
irmaos
filhos
netos
conjuge
pets
```

Regras:

- `Cônjuges` é filtro visual;
- `Pets` participa de filtros de grupo/status conforme view;
- pessoa central permanece visível quando aplicável;
- filtros devem funcionar nas duas views oficiais;
- filtros devem refletir a view renderizada, não apenas a base bruta;
- bordas e fundos no mobile seguem a paleta ativa.

---

## 9. Filtros de status

Componente principal:

```txt
LifeStatusKpiGrid
```

Filtros:

```txt
Vivos
Falecidos
Pets
```

Regras:

- não alterar dados;
- não esconder pessoa central quando a regra da view exigir permanência;
- filtros devem ser refletidos na exportação;
- no mobile, filtros são compactos e permanecem visíveis mesmo com `Grupos` fechado;
- cores devem ser coerentes com a paleta ativa.

---

## 10. Cards do painel e paletas

Contrato:

- cards de grupos e filtros usam o vocabulário visual da árvore;
- desktop é referência visual;
- mobile adapta layout, não redefine paleta;
- `tree-panel-palette-cards.css` aplica background/borda/texto com base em data attributes e variáveis;
- a paleta Visual/Azul pode usar gradientes equivalentes aos cards da árvore;
- paletas Branca, Laranja e Marrom não devem cair em fallback azul/teal.

Data attributes esperados quando aplicável:

```txt
data-tree-panel-card="true"
data-tree-panel-card-type="group"
data-tree-panel-card-type="filter"
data-family-map-color-key
data-tree-panel-filter-key
```

Anti-regressão:

```txt
O painel não deve parecer um sistema visual separado da árvore.
```

---

## 11. Regras de cônjuges no painel/filtros

### Sempre visíveis

Não dependem do filtro `Cônjuges`:

- cônjuge da pessoa central;
- cônjuges de avós;
- cônjuges de bisavós;
- cônjuges de tataravós.

### Filtráveis implementados no código atual

Dependem do filtro `Cônjuges`:

```txt
tios
primos
sobrinhos
filhos
netos
```

### Pendência conhecida

`pais`/Geração 4 na horizontal é uma pendência aberta (`TREE-003`). Não documentar como implementado enquanto `pais` não estiver no conjunto filtrável do desktop e do mobile horizontal.

---

## 12. Legendas e ajuda contextual

A aba `Legendas` não é UI vigente do painel.

Possibilidades futuras:

| Opção | Decisão necessária |
|---|---|
| Remover totalmente | Excluir UI/CSS/docs legadas após auditoria. |
| Manter como ajuda contextual | Reposicionar fora de tabs, por exemplo em tooltip ou modal independente. |

Até nova decisão:

- não restaurar a aba `Legendas`;
- qualquer ajuda contextual deve usar `data-tree-export-ignore="true"`;
- documentação histórica sobre legendas deve ficar em `docs/historico/`.

---

## 13. Conectores

### Vertical desktop

- SVG por âncoras;
- recalcula com grupos, zoom, scroll e painel;
- respeita filtros e destaques;
- não depende de proximidade visual;
- usa espessura discreta.

### Vertical mobile

- conectores HTML/CSS;
- navegação Paterno/Central/Materno;
- paleta ativa;
- alinhamento baseado na hierarquia desktop.

### Horizontal desktop

- SVG por geração/casal/filhos;
- cônjuges adjacentes quando incluídos;
- casal → tronco → filhos;
- colunas compactadas;
- conectores recalculam com grupos/cabeçalhos.

### Horizontal mobile

- uma geração por tela;
- botões `Ger X`;
- swipe lateral;
- scroll vertical interno;
- sem scroll horizontal manual;
- conectores alinhados à geração ativa.

Regra crítica:

```txt
Conector conjugal nunca deve ser inferido por proximidade visual.
```

---

## 14. Destaques

Flyout:

```txt
Destacar
```

Opções:

| Opção | Comportamento |
|---|---|
| Linhas | Afeta conectores/linhas conforme view. |
| Cards | Realça ou destaca cards. |
| Grupos | Reduz/oculta chrome visual de grupos, preservando conteúdo. |

Regras:

- destaque não altera dados;
- destaque deve ser refletido na exportação;
- `Destacar > Grupos` não pode quebrar conectores;
- labels auxiliares não devem aparecer na exportação se forem apenas UI.

---

## 15. Relação com exportação

O painel desktop/completo aciona:

```txt
Área
Imagem
PDF
Imprimir
```

Este documento registra apenas que o painel expõe as ações. Detalhes técnicos de refs, `html2canvas`, loading, crop e título ficam em:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Regras locais:

- modal mobile não exibe Exportar;
- painel/modal não entram na captura;
- remoção da antiga barra de tabs não pode quebrar exportação.

---

## 16. QA

Procedimentos manuais ficam em:

```txt
docs/QA_MANUAL.md
```

Usar especialmente as seções:

- painel desktop;
- modal mobile de controles;
- paletas;
- cônjuges, núcleos e conectores;
- exportação.

Pendências continuam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

<!-- ARVORE-PAINEL-PENDENCIAS-2026-06-18 -->
## Pontos recentes a confirmar em Ã¡rvore, legendas, conectores e painel

Antes de registrar como contrato vigente, confirmar no cÃ³digo/Git:

- conectores e espessura de linhas;
- destaque visual de relaÃ§Ãµes;
- painel desktop de visualizaÃ§Ã£o;
- popovers mÃ³veis;
- filtros por grupo;
- paletas/cores por geraÃ§Ã£o;
- separaÃ§Ã£o entre painel fixo e popovers contextuais.

Registrar tentativas antigas ou scripts substituÃ­dos apenas em `docs/historico/`.

<!-- RODADA2-PAINEL-ARVORE-2026-06-18 -->
## Painel lateral, header, conectores e tour

### Painel lateral

O painel lateral da Ã¡rvore concentra:

- seletor â€œVisualizar comoâ€;
- modos de visualizaÃ§Ã£o;
- formato;
- resumo;
- grupos familiares;
- aÃ§Ãµes de navegaÃ§Ã£o e suporte.

Commits citados no levantamento:

| Commit | FunÃ§Ã£o |
|---|---|
| `4a535a3` | Move visualizar como para painel lateral |
| `cea87e9` | Destaca modos de visualizaÃ§Ã£o no painel lateral |
| `895790c` | Ajusta header e move visualizar como para painel lateral |
| `5e7491c` | Ajusta painel lateral desktop da Ã¡rvore familiar |
| `2e6fc66` | Ajusta painel para largura mÃ¡xima de 350px |
| `8212bb0` | Ajusta painel de visualizaÃ§Ã£o para largura compacta |

### Header

O header foi refinado para:

- nÃ£o concentrar controles que pertencem ao painel;
- manter aÃ§Ãµes principais organizadas;
- preservar Favoritos/Alertas quando aplicÃ¡vel;
- permitir fechar busca pelo botÃ£o do header.

### Tour inicial e holofote

O tour inicial deve:

- apontar para elementos reais;
- evitar destacar controles removidos;
- explicar painel, favoritos, alvos e controles de Ã¡rvore;
- nÃ£o bloquear a experiÃªncia em mobile.

Commit de referÃªncia citado:

```txt
c37d91c Ajusta tour inicial e controles da Ã¡rvore
```

### Conectores e destaque de linhas

O levantamento registra ajuste de dica/destaque de linhas no mapa horizontal, incluindo:

```txt
b7710a9 feat: adiciona dica de destaque de linhas no mapa horizontal
```

Regras:

- conectores devem permanecer visualmente legÃ­veis;
- destaque de linhas deve auxiliar leitura sem competir com os cards;
- qualquer dica/sticker deve ser contextual e nÃ£o permanente quando atrapalhar navegaÃ§Ã£o.

## Atualização 2026-06-22 — Painel do mapa

- Dropdown de visualização deve mostrar `Família de [Nome]`.
- Contagem `Cadastrados` depende de `user_person_links`.
- Layout compacto de árvore pequena é regra de apresentação, não de dados.
- Tour passa a ter etapa separada para favoritos.
