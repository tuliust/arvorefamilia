# Exportação da árvore

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`  
> Tipo: documentação funcional/técnica da exportação da árvore.  
> Status: alinhado à baseline atual: views oficiais `/mapa-familiar` e `/mapa-familiar-horizontal`.

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
sem incluir painel, header, bottom nav, overlays ou controles.
```

---

## 2. Views cobertas

Views oficiais:

| View | Rota | Base técnica |
|---|---|---|
| Mapa Familiar | `/mapa-familiar` | HTML/CSS/SVG em `DesktopFamilyMapView`; mobile em `MobileFamilyTreeView` |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | HTML/CSS/SVG em `DesktopFamilyHorizontalMapView`; mobile em `MobileFamilyHorizontalMapView` |

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

- o painel dispara a ação;
- a view ativa decide o alvo de captura;
- cliques repetidos devem ser bloqueados durante exportação;
- erros devem liberar loading;
- a futura remoção das abas `Filtros | Legendas | Ações` não pode quebrar esses botões.

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
- mobile deve expor alvo coerente com a tela/geração ativa.

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
- testar em desktop e mobile.

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
- não capturar interface transitória.

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

Títulos:

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Mapa Familiar de {primeiroNome}` ou `Mapa Familiar` |
| `/mapa-familiar-horizontal` | `Genealogia de {primeiroNome}` ou `Genealogia` |

Regras:

- PNG recebe título no canvas;
- PDF recebe canvas já titulado;
- Impressão recebe canvas já titulado;
- Área selecionada também recebe título;
- evitar título duplicado no PDF.

---

## 11. SVGs e avatares

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

---

## 12. Elementos ignorados

Devem ser ignorados:

```txt
[data-tree-export-ignore="true"]
[data-tree-selection-overlay="true"]
[data-tree-export-loading="true"]
[data-tree-node-menu="true"]
[data-tree-legend="true"]
.react-flow__controls
.react-flow__minimap
```

Mesmo que seletores ReactFlow permaneçam em utilitário, as views oficiais atuais são HTML/CSS/SVG.

---

## 13. Mapa Familiar Vertical

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
- exportar com título de Mapa Familiar.

---

## 14. Mapa Familiar Horizontal

Roots/atributos esperados:

```txt
data-family-map-horizontal-root
data-mobile-family-horizontal-root
```

Regras:

- capturar superfície horizontal completa ou geração/área ativa no mobile;
- preservar conectores;
- preservar compactação de colunas;
- respeitar `Destacar > Grupos`;
- exportar com título de Genealogia.

---

## 15. QA obrigatório

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

Comandos:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Critérios:

- painel não aparece no resultado;
- título aparece uma vez;
- SVGs aparecem corretamente;
- PDF proporcional;
- impressão abre janela;
- área selecionada corresponde à seleção;
- loading fecha em erro/sucesso.
