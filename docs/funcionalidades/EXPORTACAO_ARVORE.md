# Exportação da árvore

> Última revisão: 2026-06-14  
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`  
> Tipo: documentação funcional/técnica da exportação da árvore.  
> Status: alinhado à baseline atual das views oficiais `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 1. Objetivo

A exportação permite gerar:

- PNG/Imagem;
- PDF;
- impressão;
- recorte manual por área.

Contrato:

```txt
Exportar a superfície capturável da view ativa ou da área selecionada,
sem incluir painel, header, bottom nav, overlays, debug ou controles.
```

---

## 2. Views cobertas

Views oficiais:

| View | Rota | Base técnica |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | HTML/CSS/SVG em `DesktopFamilyMapView`; mobile em `MobileFamilyTreeView` |
| Mapa Genealógico | `/mapa-familiar-horizontal` | HTML/CSS/SVG em `DesktopFamilyHorizontalMapView`; mobile em `MobileFamilyHorizontalMapView` |

Rotas antigas fora do produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Observação técnica:

- `treeExport.ts` pode conter compatibilidades ou seletores herdados;
- isso não significa que rotas antigas estejam ativas;
- limpeza de exportação ligada a ReactFlow deve ocorrer junto da remoção planejada do renderer legado.

---

## 3. Arquivos principais

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/TreeExportLoadingOverlay.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
src/styles/home-sidebar-unified.css
src/styles/family-map-horizontal.css
src/styles/family-map-qa.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
src/styles/mobile-tree-controls.css
```

Arquivos a preservar até refatoração própria:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

---

## 4. Contrato dos botões

| Botão | Comportamento |
|---|---|
| Área | abre seleção retangular da área visível |
| Imagem | baixa PNG |
| PDF | gera PDF proporcional |
| Imprimir | abre fluxo de impressão |

Regras:

- o painel desktop/completo dispara a ação;
- o modal mobile de controles não expõe Exportar;
- a view ativa decide o alvo de captura;
- cliques repetidos devem ser bloqueados durante exportação;
- erros devem liberar loading;
- a ausência da barra `Filtros | Legendas | Ações` não pode quebrar esses botões.

---

## 5. Modelo de refs

Nas views:

| Ref | Papel |
|---|---|
| `viewportRef` | container visível/rolável |
| `exportRootRef` | root exportável completo |
| `mapSurfaceRef` | superfície interna escalada |

Regras:

- Imagem/PDF/Imprimir usam o root exportável;
- Área usa alvo alinhado ao viewport visível;
- `mapSurfaceRef` não deve ser capturado isoladamente quando houver offsets/escala;
- mobile deve expor alvo coerente com a tela/geração ativa;
- novos blocos estruturais, como segundo núcleo conjugal, devem entrar no cálculo de bounds/canvas quando renderizados.

---

## 6. `treeExport.ts`

Responsabilidades:

- montar nomes de arquivos;
- resolver alvo exportável;
- medir dimensões;
- aplicar limite preventivo de pixels;
- capturar DOM com `html2canvas`;
- recortar canvas;
- gerar PNG/PDF/print;
- compor título no canvas;
- ignorar UI transitória;
- sanitizar cores modernas incompatíveis;
- normalizar SVGs internos.

Funções/conceitos:

| Item | Papel |
|---|---|
| `buildTreeExportFilename` | nome seguro com timestamp |
| `resolveTreeExportTarget` | resolve root exportável |
| `getElementCaptureMetrics` | calcula dimensões/escala |
| `assertSafeElementCaptureSize` | bloqueia captura grande demais |
| `captureElementToCanvas` | captura DOM |
| `cropCanvas` | recorta canvas |
| `downloadCanvasAsPng` | baixa PNG |
| `exportCanvasAsPdf` | gera PDF |
| `openTreePrintWindow` | abre janela de impressão |
| `printCanvas` | imprime imagem |
| `prependTitleToCanvas` | adiciona título |
| `waitForExportUiSettle` | estabiliza feedback visual |

---

## 7. Captura com `html2canvas`

Configuração esperada:

```txt
useCORS: true
allowTaint: false
removeContainer: true
backgroundColor: definido pela view/opção
scale: limitado
windowWidth/windowHeight: adequados à captura
scrollX/scrollY: compensados
```

Regras:

- não usar `allowTaint: true` sem revisão;
- não depender de imagem externa sem CORS;
- não capturar painel, overlay, loading, header ou bottom nav;
- sanitizar cores incompatíveis;
- testar em desktop e mobile;
- preservar paleta ativa e gradientes dos cards;
- validar que avatares, ícones e conectores não viram blocos escuros no clone.

---

## 8. Área selecionada

Componente:

```txt
TreeAreaSelectionOverlay.tsx
```

Fluxo:

```txt
Exportar > Área
-> overlay fixo
-> usuário arrasta seleção
-> toolbar aparece
-> PNG/PDF/Imprimir
-> captura visível
-> crop
-> título
-> exportação
-> fecha overlay
```

Regras:

- seleção mínima de `80 x 80px`;
- impedir fechamento por `Esc` durante exportação;
- respeitar limite preventivo de pixels;
- não capturar interface transitória;
- `Exportar > Área` deve operar como toggle;
- recorte deve corresponder à área visível selecionada.

---

## 9. Loading de exportação

Elementos/conceitos:

```txt
TreeExportLoadingOverlay
waitForTreeExportPaint
waitForExportUiSettle
data-tree-export-loading
data-tree-export-ignore
```

Regras:

- loading aparece antes do `html2canvas`;
- loading não entra na captura;
- erro fecha loading em `finally`;
- impressão só resolve depois de disparar `window.print()`.

---

## 10. Título no canvas

Títulos vigentes:

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |

Regras:

- PNG recebe título no canvas;
- PDF recebe canvas já titulado;
- Impressão recebe canvas já titulado;
- Área selecionada também recebe título;
- evitar título duplicado no PDF;
- não restaurar `Genealogia de...` nem `Mapa Familiar Horizontal de...` como título exportável principal.

---

## 11. SVGs, avatares e ícones

Problema prevenido:

```txt
SVGs internos dos cards podem ser capturados como quadrados escuros.
```

Mitigações:

- classes semânticas em `FamilyTreeVisualCards`;
- normalização de SVGs no clone;
- escopo separado para conectores;
- evitar seletor global `svg path`.

Classes úteis:

```txt
family-map-avatar-icon
family-map-person-silhouette
family-map-pet-icon
family-map-status-icon
family-map-birth-icon
family-map-deceased-icon
```

Contrato de avatar:

```txt
Pessoa com foto -> foto_principal_url
Pessoa sem foto -> User, lucide-react
Pet             -> PawPrint, lucide-react
```

Não há fallback visual por gênero como regra vigente.

---

## 12. Elementos ignorados

Devem ser ignorados:

```txt
[data-tree-export-ignore="true"]
[data-tree-selection-overlay="true"]
[data-tree-export-loading="true"]
[data-tree-node-menu="true"]
[data-tree-legend="true"]
[data-tree-debug-viewer="true"]
.react-flow__controls
.react-flow__minimap
```

Mesmo que seletores ReactFlow permaneçam em utilitário, as views oficiais atuais são HTML/CSS/SVG.

---

## 13. Árvore Familiar Vertical

Root esperado:

```txt
[data-family-map-export-root="true"]
```

Regras:

- capturar root exportável normalizado;
- preservar conectores SVG;
- respeitar paleta e filtros;
- respeitar `hideGroupChrome`;
- não capturar painel;
- exportar com título `Árvore Familiar`;
- incluir blocos descendentes adicionais quando renderizados;
- calcular bounds considerando novos grupos, cônjuges adicionais, filhos e netos quando existirem.

---

## 14. Mapa Genealógico Horizontal

Roots/atributos esperados:

```txt
data-family-map-horizontal-root
data-family-map-horizontal-mobile-root
```

Compatibilidade histórica que pode aparecer em CSS/utilitário:

```txt
data-mobile-family-horizontal-root
```

Regras:

- capturar superfície horizontal completa ou geração/área ativa no mobile;
- preservar conectores;
- preservar compactação de colunas;
- respeitar `Destacar > Grupos`;
- respeitar cônjuges da Geração 4/Pais quando renderizados;
- exportar com título `Mapa Genealógico`;
- preservar paleta ativa, inclusive correções mobile para evitar fallback azul indevido.

---

## 15. Paletas e CSS na exportação

Paletas oficiais:

```txt
white
visual
orange
brown
```

Regras:

- exportação deve preservar card, texto, borda, group chrome, conectores e canvas;
- Visual/Azul deve preservar gradientes teal/cyan/blue onde esse for o contrato da view;
- white/orange/brown não podem cair em fallback azul;
- bordas de grupos mobile devem seguir a paleta;
- cards do painel não entram na captura, mas não devem contaminar variáveis da árvore;
- CSS de calendário não deve afetar exportação da árvore.

Arquivos de CSS relacionados:

```txt
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/tree-panel-palette-cards.css
```

---

## 16. QA obrigatório

Testar:

```txt
/mapa-familiar
/mapa-familiar-horizontal
desktop
mobile
paletas
filtros
destaques
Área
Imagem
PDF
Imprimir
```

### Desktop

- [ ] `/mapa-familiar` exporta PNG;
- [ ] `/mapa-familiar` exporta PDF;
- [ ] `/mapa-familiar` imprime;
- [ ] `/mapa-familiar` exporta área;
- [ ] `/mapa-familiar-horizontal` exporta PNG;
- [ ] `/mapa-familiar-horizontal` exporta PDF;
- [ ] `/mapa-familiar-horizontal` imprime;
- [ ] `/mapa-familiar-horizontal` exporta área.

### Mobile

- [ ] `/mapa-familiar` não captura modal de controles;
- [ ] `/mapa-familiar-horizontal` não captura bottom nav;
- [ ] paletas mobile permanecem corretas se a exportação for acionada por fluxo completo;
- [ ] geração ativa horizontal não corta cards/conectores visíveis.

### Critérios gerais

- [ ] painel não aparece no resultado;
- [ ] título aparece uma vez;
- [ ] título usa nomenclatura vigente;
- [ ] SVGs aparecem corretamente;
- [ ] PDF proporcional;
- [ ] impressão abre janela;
- [ ] área selecionada corresponde à seleção;
- [ ] loading fecha em erro/sucesso;
- [ ] conectores aparecem;
- [ ] paleta ativa é respeitada;
- [ ] filtros ativos são respeitados;
- [ ] debug `Visualizar como...` não aparece.
