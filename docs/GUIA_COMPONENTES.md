# Guia de componentes — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/GUIA_COMPONENTES.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia revisado após ajustes de painel desktop, modal mobile, paletas desktop/mobile, calendário mobile, cônjuges, conectores, exportação e debug temporário.

---

## 1. Objetivo

Este guia identifica os principais componentes do projeto, suas responsabilidades e os cuidados necessários para evitar regressões.

Use antes de alterar:

- shell da árvore;
- views do Mapa Familiar;
- painel lateral desktop;
- modal mobile de controles;
- exportação;
- filtros;
- paletas;
- avatares;
- conectores;
- favoritos;
- busca;
- calendário familiar mobile;
- componentes compartilhados.

---

## 2. Convenções gerais

| Regra | Aplicação |
|---|---|
| Componentes visuais não acessam Supabase diretamente | Usar `services`. |
| Cálculos puros ficam em utils/layouts | Evitar lógica pesada dentro de JSX. |
| Botões não-submit usam `type="button"` | Evitar envio acidental de forms. |
| Props devem permanecer tipadas | Evitar `any` para corrigir build rapidamente. |
| Exportação ignora UI transitória | Usar `data-tree-export-ignore="true"`. |
| CSS deve ser escopado | Preferir rota, data attribute ou container. |
| Histórico não orienta implementação | Docs legados não podem reintroduzir views removidas. |
| Painel não usa abas antigas | Não restaurar `Filtros | Legendas | Ações`. |
| Desktop é referência visual | Mobile adapta layout e herda paletas/tokens. |
| Debug não é produto final | `Visualizar como...` deve ser temporário, flagado ou restrito. |
| Ajuste visual não cria dado | Não inserir relacionamentos ou pessoas fictícias para resolver layout. |

---

## 3. Shell da árvore

### 3.1 `Home`

Arquivo:

```txt
src/app/pages/Home.tsx
```

Responsabilidades:

- carregar pessoas e relacionamentos;
- resolver pessoa vinculada/central;
- manter filtros globais;
- controlar painel desktop;
- controlar modal mobile de controles;
- compor header e área da árvore;
- alimentar contagens renderizadas;
- controlar modais, IA, curiosidades, conexão e exportação;
- preservar navegação com `location.search`;
- opcionalmente hospedar debug temporário `Visualizar como...`.

Cuidados:

- `Home` ainda concentra responsabilidades e deve ser refatorado por etapas pequenas;
- não inserir views antigas no shell;
- não misturar regras de rota com layout específico;
- preservar `?pessoa=...` e `?voltar=...`;
- estados temporários de debug não devem persistir dados reais;
- elementos de debug devem usar `data-tree-export-ignore="true"`.

Estados relevantes:

| Estado | Papel |
|---|---|
| `directRelativeFilters` | Filtros de grupos diretos. |
| `personFilters` | Filtros de vivos, falecidos e pets. |
| `visualLineFilters` | Estado visual de linhas/conectores. |
| `activeHighlights` | Destaques de linhas, cards e grupos. |
| `legendOpen` | Abertura do modal mobile de controles. |
| `mobileGroupsOpen` | Exibição sob demanda de grupos no modal mobile. |
| `renderedDirectRelationCounts` | Contagens efetivas informadas pela view renderizada. |
| `treeLayoutRevision` | Força recalculo/re-render quando necessário. |
| `debugViewPersonId` | Debug temporário para visualizar a árvore como outra pessoa. |

### 3.2 `HomeTreeSection`

Arquivo:

```txt
src/app/pages/home/HomeTreeSection.tsx
```

Responsabilidade:

- decidir qual componente de árvore renderizar;
- repassar filtros e callbacks;
- reagir a ações do painel;
- controlar título, loading e estados vazios.

Renderização vigente:

| Condição | Componente |
|---|---|
| mobile + `mapa-familiar` | `MobileFamilyTreeView` |
| mobile + `mapa-familiar-horizontal` | `MobileFamilyHorizontalMapView` |
| desktop/tablet + `mapa-familiar` | `DesktopFamilyMapView` |
| desktop/tablet + `mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` |

Não reintroduzir branches para:

```txt
minha-arvore
genealogia
visao-completa
```

Títulos vigentes:

| View | Título |
|---|---|
| `mapa-familiar` | `Árvore Familiar de {primeiroNome}` |
| `mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` |

### 3.3 `HomeHeader`

Arquivo:

```txt
src/app/pages/home/HomeHeader.tsx
```

Responsabilidades:

- header das views de árvore;
- busca;
- atalhos;
- menu de usuário;
- favoritos de página da view atual.

Cuidados:

- não apontar ação principal para `/minha-arvore`;
- preservar páginas favoritas de `/mapa-familiar` e `/mapa-familiar-horizontal`;
- nome/e-mail do usuário ficam no menu, não ao lado do avatar;
- header não deve aparecer na exportação.

### 3.4 `HomeMobileNav`

Arquivo:

```txt
src/app/pages/home/HomeMobileNav.tsx
```

Responsabilidades:

- navegação inferior mobile;
- botão `Controles` nas views oficiais;
- abertura do modal mobile de controles;
- marcação para ignorar exportação;
- posicionamento do botão de controles alinhado à barra de geração no horizontal mobile.

Regras:

- `/mapa-familiar` mobile pode usar navegação interna de `MobileFamilyTreeView`;
- `/mapa-familiar-horizontal` mobile usa navegação por gerações;
- não reintroduzir `Paterno | Central | Materno` na horizontal mobile;
- não duplicar `MobileTreeControlsPortal`;
- botão de controles não deve sobrepor os chips `Ger X`.

---

## 4. Painel e controles

### 4.1 `SidebarPanelTabs`

Arquivo:

```txt
src/app/pages/home/SidebarPanelTabs.tsx
```

Estado atual:

- renderiza controles de zoom/restauração no desktop;
- troca Vertical/Horizontal preservando search params;
- concentra flyouts `Cores`, `Exportar`, `Destacar`;
- exibe filtros diretos/status sem barra de abas;
- não renderiza a barra `Filtros | Legendas | Ações`;
- recebe props específicas para modo mobile.

Controles desktop:

```txt
Zoom +/-
Restaurar visualização
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros/grupos
Filtros de status
```

Controles mobile:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

No mobile, não renderizar:

```txt
Zoom +/-
Restaurar visualização
Exportar
```

Props relevantes:

| Prop | Uso |
|---|---|
| `mobileControls` | Ativa modo modal mobile reduzido. |
| `mobileGroupsActive` | Indica se grupos estão visíveis no modal mobile. |
| `onMobileGroupsOpenChange` | Abre/fecha grupos no modal mobile. |

Dívida restante:

- `SidebarPanelTabs` mantém nome histórico e responsabilidades amplas;
- eventual renome deve ser feita em frente própria, por exemplo para `TreeControlPanel`.

### 4.2 `DirectRelationKpiGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelationKpiGrid.tsx
```

Responsabilidades:

- exibir KPIs de relações diretas;
- usar contagens efetivas quando a view informa;
- refletir `directRelativeFilters`;
- funcionar tanto no painel desktop quanto no modal mobile sob demanda.

Cuidados:

- no modal mobile, grupos só aparecem ao clicar em `Grupos`;
- grupos não devem aparecer por padrão no modal mobile;
- contagens efetivas não devem inflar cônjuges sempre visíveis.

### 4.3 `DirectRelativeFilterGrid`

Arquivo:

```txt
src/app/pages/home/DirectRelativeFilterGrid.tsx
```

Responsabilidades:

- renderizar cards/filtros de grupos;
- controlar `Cônjuges` e `Pets`;
- preservar semântica de filtros diretos;
- no desktop, expor data attributes para aplicação de paleta visual do painel.

Cuidados:

- `Cônjuges` filtrável não é igual a cônjuge ancestral sempre visível;
- `Pets` pode participar de filtros de grupo e de status/tipo;
- no mobile, o container de grupos deve ficar sem box/título persistente quando acionado sob demanda;
- cards do painel desktop devem seguir gradiente/borda/texto da paleta ativa.

Data attributes esperados quando aplicável:

```txt
data-tree-panel-card="true"
data-tree-panel-card-type="group"
data-family-map-color-key
```

### 4.4 `LifeStatusKpiGrid`

Arquivo:

```txt
src/app/pages/home/LifeStatusKpiGrid.tsx
```

Responsabilidades:

- filtros `Vivos`, `Falecidos`, `Cônjuges` e `Pets`;
- contadores por status/tipo;
- visibilidade permanente no modal mobile;
- no desktop, aplicar vocabulário visual compatível com a paleta ativa.

Cuidados:

- filtros do modal mobile devem caber em 4 colunas/1 linha quando possível;
- não esconder filtros quando `Grupos` estiver fechado;
- manter contraste nas quatro paletas;
- `Vivos` e `Falecidos` não são grupos familiares, mas devem ter tratamento visual coerente com a paleta.

Data attributes esperados quando aplicável:

```txt
data-tree-panel-card="true"
data-tree-panel-card-type="filter"
data-tree-panel-filter-key
data-family-map-color-key
```

### 4.5 Componentes de legenda/info

Arquivos que podem existir por histórico:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/home/SidebarInfoPanel.tsx
```

Regras:

- não documentar como UI ativa se não estiverem montados no painel atual;
- não reintroduzir aba `Legendas`;
- qualquer ajuda contextual futura deve ser reposicionada fora da barra de abas e ignorada pela exportação.

---

## 5. Views oficiais da árvore

### 5.1 `DesktopFamilyMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar` no desktop/tablet;
- compor grupos da família direta;
- aplicar filtros de grupos/status;
- calcular cônjuges;
- suportar núcleos conjugais adicionais da pessoa central;
- agrupar filhos pelo outro pai/mãe quando houver relacionamento explícito;
- desenhar conectores SVG;
- controlar zoom/scroll;
- exportar PNG/PDF/print;
- abrir seleção por área;
- implementar `Destacar > Grupos`;
- servir como referência de hierarquia/paleta para a versão mobile vertical.

Cuidados:

- não corrigir sobreposição por zoom padrão;
- não criar relações por proximidade visual;
- conectores devem depender de âncoras e relacionamentos explícitos;
- alteração de layout exige QA visual;
- paletas desktop são referência para mobile;
- cônjuge adicional não deve criar dado fictício;
- novos blocos devem entrar no cálculo de altura e export bounds.

### 5.2 `MobileFamilyTreeView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
```

Responsabilidades:

- experiência mobile de `/mapa-familiar`;
- telas Paterno/Central/Materno;
- conectores HTML/CSS;
- visual compacto;
- adaptação da hierarquia desktop para mobile;
- cards de pessoas com nome, nascimento e falecimento quando existirem.

Cuidados:

- não usar na horizontal mobile;
- preservar swipe/abas internas;
- manter controles marcados para ignorar exportação;
- alinhar conectores de Pai/Mãe/ancestrais ao eixo visual correto;
- não criar paleta própria hardcoded;
- cards devem herdar tokens da paleta ativa;
- não exibir `Nascimento não informado`;
- não exibir linha de nascimento/falecimento sem ano;
- bordas de grupos mobile devem seguir o desktop.

### 5.3 `DesktopFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` no desktop/tablet;
- organizar pessoas por gerações;
- ocultar colunas vazias;
- posicionar cônjuges;
- incluir cônjuges da Geração 4/Pais quando filtro `Cônjuges` estiver ativo;
- desenhar conectores SVG;
- preservar fundo transparente quando definido;
- exportar com título e paleta;
- servir como referência estrutural da horizontal mobile.

Cuidados:

- conector conjugal depende de relacionamento explícito;
- não inferir casamento por proximidade;
- filhos devem derivar de pais/casais conforme layout genealógico;
- alteração de conectores exige QA em desktop e mobile.

### 5.4 `MobileFamilyHorizontalMapView`

Arquivo:

```txt
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
```

Responsabilidades:

- renderizar `/mapa-familiar-horizontal` no mobile;
- apresentar uma geração por tela;
- permitir swipe lateral;
- permitir scroll vertical interno;
- exibir botões `Ger 1`, `Ger 2`, `Ger 3` etc.;
- renderizar conectores da geração ativa;
- permitir rolagem até cards e conectores visíveis;
- preservar paleta ativa sem fallback azul indevido.

Cuidados:

- não usar barra Paterno/Central/Materno;
- não gerar subrotas por geração;
- não capturar bottom nav/modal na exportação;
- não reintroduzir setas laterais como navegação principal;
- não reintroduzir scroll horizontal manual;
- direção de swipe deve ser validada em aparelho real;
- mobile deve ser recorte responsivo do desktop, não lógica paralela divergente;
- cards sem `data-family-map-color-key` devem receber fallback coerente com a paleta selecionada.

Dívida técnica recomendada:

```txt
Extrair horizontalMapViewModel compartilhado entre DesktopFamilyHorizontalMapView e MobileFamilyHorizontalMapView.
```

---

## 6. Cards, avatares e paletas

### 6.1 `FamilyTreeVisualCards`

Arquivo:

```txt
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
```

Responsabilidades:

- renderizar cards visuais compartilhados;
- aplicar avatar/foto;
- representar pessoa, pet, status e datas;
- preservar legibilidade e exportação;
- fornecer `data-family-map-color-key` quando possível.

Contrato de avatar:

| Caso | Renderização |
|---|---|
| Pessoa com foto | `foto_principal_url` |
| Pessoa sem foto | `User` de `lucide-react` |
| Pet | `PawPrint` de `lucide-react` |

Regras:

- não diferenciar avatar sem foto por gênero;
- não restaurar silhuetas homem/mulher/neutro;
- ícones devem herdar cor/contraste da paleta;
- SVG dos ícones não pode ser afetado por seletor global de conectores;
- card central deve receber tratamento `central` quando a view tiver essa informação.

### 6.2 `treeColorPalettes`

Arquivo:

```txt
src/app/components/FamilyTree/treeColorPalettes.ts
```

Responsabilidades:

- centralizar paletas `white`, `visual`, `orange`, `brown`;
- expor tokens CSS para cards, bordas, texto, conectores e canvas;
- garantir consistência entre vertical, horizontal, desktop, mobile e exportação.

Regra:

```txt
Mobile não deve definir cor própria fora do contrato visual do desktop.
```

### 6.3 CSS de paletas e painéis

Arquivos:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
```

Responsabilidades:

- aplicar paletas na vertical/horizontal;
- corrigir diferenças mobile;
- garantir que cards de painel desktop usem o mesmo tratamento visual dos cards da árvore;
- preservar borda de grupos mobile alinhada à paleta;
- impedir fallback azul/teal em paletas não azuis.

---

## 7. Calendário familiar

### 7.1 `CalendarioFamiliar`

Arquivo:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Responsabilidades:

- renderizar mês atual;
- filtrar eventos por categoria;
- integrar ou preparar integração com Google Agenda;
- manter filtros mobile compactos;
- apresentar eventos familiares.

Contrato mobile dos filtros de categoria:

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

CSS crítico:

```txt
src/styles/calendar-mobile-category-buttons.css
```

Cuidados:

- não voltar para duas linhas sem decisão explícita;
- não remover a bolinha colorida;
- não permitir quebra de linha nos rótulos;
- testar 320px, 375px, 390px e 430px.

---

## 8. Componentes de exportação

Arquivos:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeExportLoadingOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
```

Responsabilidades:

- seleção de área;
- loading de exportação;
- captura com `html2canvas`;
- exportação PNG/PDF/impressão;
- normalização de SVGs e cores.

Regras:

- não remover `treeExport.ts` em limpeza superficial;
- não usar seletor global que afete todos os SVGs;
- não capturar painel, header, bottom nav, modal, overlays ou debug;
- `Exportar > Área` deve operar como toggle;
- loading deve cobrir o ciclo real da captura/exportação.

---

## 9. Debug temporário

### 9.1 `Visualizar como...`

Local previsto:

```txt
src/app/pages/Home.tsx
```

Objetivo:

```txt
Visualizar /mapa-familiar e /mapa-familiar-horizontal usando outra pessoa da tabela pessoas como referência central.
```

Regras:

- elemento deve ter `data-tree-debug-viewer="true"`;
- elemento deve ter `data-tree-export-ignore="true"`;
- não deve alterar dados reais;
- não deve navegar para perfil;
- deve recalcular layout/contagens;
- deve ser removido, protegido por flag ou restrito a admin antes de produção pública, conforme decisão de produto.

---

## 10. Contratos e tipos

Arquivo extraído ou recomendado:

```txt
src/app/components/FamilyTree/actions.ts
```

Responsabilidade:

- declarar `FamilyTreeActions` fora de `FamilyTree.tsx`;
- permitir que views oficiais usem o contrato sem depender do renderer legado.

Regra:

- novos contratos compartilhados devem ficar em arquivos neutros;
- não centralizar tipos novos em componentes legados;
- tipos de layout horizontal compartilhado devem ir para `layouts/` ou `utils/`.

---

## 11. Services principais

Preservar:

```txt
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/treeDataCache.ts
src/app/services/relationshipCacheService.ts
src/app/services/userEngagementService.ts
src/app/services/favoritesService.ts
src/app/services/globalSearchService.ts
```

Removido:

```txt
src/app/services/relationshipResolverService.ts
```

Regras:

- `dataService.ts` é crítico para CRUD e eventos da árvore;
- `treeDataCache.ts` coordena invalidação/recarregamento;
- `relationshipCacheService.ts` limpa `parentescos_calculados`;
- `memberProfileService.ts` é crítico para vínculo usuário-pessoa;
- `userEngagementService.ts` ainda concentra compatibilidade local/legada e notificações;
- `globalSearchService.ts` não deve apontar para rotas removidas.

---

## 12. Componentes removidos

Não reintroduzir sem decisão explícita:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/GenealogyFilterGrid.tsx
src/app/pages/CentralNotificacoes.tsx
src/app/components/FamilyTree/ViewModeToggle.tsx
src/app/components/figma/ImageWithFallback.tsx
```

Se algum import quebrar após remoção:

1. confirmar se o fluxo ainda é vigente;
2. procurar substituto atual;
3. não restaurar o arquivo antigo por conveniência;
4. rodar build/testes.

---

## 13. Legado técnico preservado

Preservar até frente específica:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/nodeTypes.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/styles/mobile-tree-lines.css
```

Motivo:

- pode haver tipos/helpers ativos;
- a horizontal usa layout genealógico;
- remover ReactFlow/Dagre exige frente própria.

---

## 14. Data attributes críticos

Preservar ou documentar alteração antes de remover:

```txt
data-family-map-export-root="true"
data-tree-export-ignore="true"
data-tree-selection-overlay="true"
data-tree-export-loading="true"
data-tree-debug-viewer="true"
data-mobile-family-tree-root="true"
data-family-map-horizontal-root="true"
data-family-map-horizontal-mobile-root="true"
data-family-map-color-key
data-family-map-mobile-card="true"
data-family-map-avatar="true"
data-family-map-connectors="true"
data-tree-panel-card="true"
data-tree-panel-card-type
data-tree-panel-filter-key
```

---

## 15. QA obrigatório por tipo de alteração

### Alteração em árvore

```txt
/mapa-familiar desktop
/mapa-familiar mobile
/mapa-familiar-horizontal desktop
/mapa-familiar-horizontal mobile
paletas white/visual/orange/brown
filtros cônjuges/pets/filhos
exportação
```

### Alteração em calendário

```txt
/calendario-familiar mobile 320px
/calendario-familiar mobile 375px
/calendario-familiar mobile 390px
/calendario-familiar mobile 430px
```

### Alteração em CSS de paleta

```txt
Cards
Bordas de grupos
Conectores
Painel desktop
Mobile vertical
Mobile horizontal
Exportação
```

---

## 16. Comandos finais

Antes de fechar PR/commit relevante:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```
