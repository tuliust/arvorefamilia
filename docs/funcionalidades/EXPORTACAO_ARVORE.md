# Exportação da árvore

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`  
> Tipo: documentação funcional e técnica da exportação da árvore.  
> Status: revisado contra `treeExport.ts`, `TreeAreaSelectionOverlay.tsx`, `DesktopFamilyMapView.tsx`, `DesktopFamilyHorizontalMapView.tsx`, `FamilyTreeVisualCards.tsx` e CSS de exportação.

---

## 1. Objetivo

A exportação permite gerar:

- PNG/Imagem;
- PDF;
- impressão;
- recorte manual por área.

Contrato atual:

```txt
Exportar a superfície capturável da view ativa ou a área selecionada pelo usuário,
sem incluir painel, header, bottom nav, overlays ou controles.
```

Nas views de Mapa Familiar, a exportação deve preservar:

- paleta ativa;
- filtros ativos;
- zoom/escala atual;
- grupos visíveis/expandidos;
- conectores SVG;
- avatares/silhuetas/pets;
- título da view composto no canvas.

---

## 2. Views cobertas

| View | Rota | Base técnica |
|---|---|---|
| Minha Árvore | `/minha-arvore` | ReactFlow |
| Genealogia | `/genealogia` | ReactFlow |
| Visão Completa | `/visao-completa` | ReactFlow |
| Mapa Familiar Vertical | `/mapa-familiar` | HTML/CSS/SVG |
| Mapa Familiar Horizontal | `/mapa-familiar-horizontal` | HTML/CSS/SVG |

Regra:

```txt
Views ReactFlow capturam o root ReactFlow.
Mapas Familiares capturam seus roots HTML/CSS/SVG próprios.
```

---

## 3. Arquivos principais

```txt
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/DesktopFamilyHorizontalMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/pages/home/SidebarPanelTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
src/styles/home-sidebar-unified.css
src/styles/family-map-horizontal.css
src/styles/family-map-qa.css
```

---

## 4. Contrato dos botões

| Botão | Comportamento |
|---|---|
| `Área` | Abre overlay fixo para seleção retangular da área visível do alvo. |
| `Imagem` | Captura a superfície exportável e baixa PNG. |
| `PDF` | Captura a superfície exportável, compõe título no canvas e insere em PDF A4 proporcional. |
| `Imprimir` | Captura a superfície exportável, compõe título no canvas e abre janela de impressão. |

Regras:

- o painel dispara a ação;
- a view ativa decide qual elemento capturar;
- uma exportação em andamento bloqueia cliques repetidos;
- erros devem liberar loading e exibir mensagem clara.

---

## 5. Modelo de refs

Nas views de Mapa Familiar:

| Ref | Papel |
|---|---|
| `viewportRef` | container visível/rolável, usado para scroll e seleção por área visível. |
| `exportRootRef` | root exportável completo/normalizado. |
| `mapSurfaceRef` | superfície interna escalada com cards, grupos e conectores. |

Regras:

- `Imagem`, `PDF` e `Imprimir` usam o root exportável da view;
- `Área` usa alvo alinhado ao viewport/área visível, com `captureVisibleAreaOnly`;
- `mapSurfaceRef` não deve ser usado isoladamente quando houver offsets, escala ou laterais normalizadas.

---

## 6. `treeExport.ts`

Responsabilidades:

- montar nomes de arquivos;
- resolver alvo padrão de exportação;
- calcular tamanho e escala;
- limitar tamanho preventivo;
- capturar com `html2canvas`;
- recortar canvas;
- baixar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- compor título no canvas;
- preservar SVGs internos;
- ignorar UI transitória;
- sanitizar cores não suportadas no clone.

Funções/conceitos principais:

| Função/conceito | Papel |
|---|---|
| `buildTreeExportFilename` | Gera nome seguro com timestamp. |
| `resolveTreeExportTarget` | Resolve root exportável por prioridade. |
| `getElementCaptureMetrics` | Calcula dimensões e escala. |
| `assertSafeElementCaptureSize` | Bloqueia capturas grandes demais. |
| `captureElementToCanvas` | Captura DOM com `html2canvas`. |
| `cropCanvas` | Recorta canvas por retângulo. |
| `downloadCanvasAsPng` | Dispara download PNG. |
| `exportCanvasAsPdf` | Gera PDF. |
| `openTreePrintWindow` | Abre janela em branco para impressão. |
| `printCanvas` | Escreve imagem, aguarda carregamento e dispara `window.print()`. |
| `prependTitleToCanvas` | Adiciona faixa de título no topo do canvas. |
| `waitForExportUiSettle` | Mantém feedback visual por tempo mínimo. |

---

## 7. Captura com `html2canvas`

Configuração esperada:

```txt
useCORS: true
allowTaint: false
removeContainer: true
backgroundColor: definido pela view/opção
scale: limitado por maxScale/devicePixelRatio
windowWidth/windowHeight: no mínimo viewport e dimensão capturada
scrollX/scrollY: compensados pelo scroll da janela
```

Regras:

- não usar `allowTaint: true` sem revisão;
- não depender de imagens externas sem CORS;
- não capturar painel, overlays ou botões;
- não capturar loading;
- sanitizar cores modernas incompatíveis no clone;
- normalizar SVGs internos dos cards.

---

## 8. Área selecionada

Componente:

```txt
TreeAreaSelectionOverlay.tsx
```

Características atuais:

- overlay usa `position: fixed`;
- recebe `getTargetElement`;
- calcula `targetRect` por `getBoundingClientRect()`;
- impede fechar por `Esc` quando há exportação em andamento;
- exige seleção mínima de `80 x 80px`;
- aplica limite preventivo de pixels;
- usa `captureElementToCanvas(target, { captureVisibleAreaOnly: true })`;
- recorta com base no retângulo selecionado;
- compõe título no canvas recortado;
- oferece PNG, PDF e impressão.

Fluxo:

```txt
Exportar > Área
→ overlay fixo
→ usuário arrasta
→ toolbar aparece
→ escolhe PNG/PDF/Imprimir
→ loading local
→ captura visível
→ crop
→ prependTitleToCanvas
→ exportação
→ pequeno settle
→ fecha overlay
```

---

## 9. Loading de exportação

Componentes/conceitos:

```txt
TreeExportLoadingOverlay
waitForTreeExportPaint
waitForExportUiSettle
```

Regras:

- loading aparece antes do `html2canvas`;
- a view aguarda pintura com `waitForTreeExportPaint`;
- o loading não deve fechar antes do download/PDF/print ser disparado;
- para PNG/PDF, aguardar `waitForExportUiSettle`;
- para impressão, `printCanvas` deve resolver apenas após a imagem carregar e `window.print()` ser chamado;
- loading deve ser ignorado na captura por `data-tree-export-loading` e `data-tree-export-ignore`;
- erro fecha loading em `finally`.

---

## 10. Título no canvas

As exportações de Mapa Familiar compõem o título diretamente no canvas.

| View | Título |
|---|---|
| `/mapa-familiar` | `Mapa Familiar de {primeiroNome}` ou `Mapa Familiar` |
| `/mapa-familiar-horizontal` | `Genealogia de {primeiroNome}` ou `Genealogia` |

Função:

```txt
prependTitleToCanvas(canvas, title)
```

Regras:

- PNG recebe título no canvas;
- PDF recebe canvas já titulado e deve evitar título duplicado;
- Impressão recebe canvas já titulado;
- Área selecionada também recebe título;
- o título visual da página não precisa estar dentro do DOM capturado;
- o título deve usar fundo claro e texto legível.

---

## 11. PDF

Fluxo esperado:

```txt
captureElementToCanvas
→ prependTitleToCanvas
→ exportCanvasAsPdf(canvas, filename, '')
```

Atenção:

- passar título vazio quando o canvas já tem título para evitar duplicação;
- ajustar imagem proporcionalmente em A4;
- orientação depende da proporção do canvas.

---

## 12. Impressão

Fluxo esperado:

```txt
openTreePrintWindow
→ captureElementToCanvas
→ prependTitleToCanvas
→ printCanvas
```

`printCanvas` deve:

- usar `toDataURL`;
- escrever HTML de impressão;
- aguardar carregamento da imagem;
- focar a janela;
- chamar `window.print()`;
- resolver depois de disparar a impressão;
- tratar janela bloqueada/fechada.

---

## 13. SVGs, avatares e ícones

Problema corrigido:

```txt
Alguns SVGs internos dos cards podiam virar quadrados escuros no html2canvas.
```

Mitigações atuais:

- `FamilyTreeVisualCards.tsx` usa classes semânticas:
  - `family-map-avatar-icon`;
  - `family-map-person-silhouette`;
  - `family-map-pet-icon`;
  - `family-map-status-icon`;
  - `family-map-birth-icon`;
  - `family-map-deceased-icon`;
- `treeExport.ts` normaliza SVGs no clone;
- SVGs internos dos cards têm `currentColor`, `fill` e `stroke` resolvidos;
- SVGs dos cards podem ser serializados como `data:image/svg+xml` no clone;
- conectores são excluídos da rotina de serialização de ícones.

Regras CSS:

- não usar seletor amplo `svg path` sem escopo;
- conectores devem ser estilizados por `[data-family-map-connectors="true"]`;
- ícones internos não podem herdar stroke/fill dos conectores.

---

## 14. Elementos ignorados

Devem ser ignorados pelo clone/exportação:

```txt
[data-tree-export-ignore="true"]
[data-tree-selection-overlay="true"]
[data-tree-export-loading="true"]
[data-tree-node-menu="true"]
[data-tree-legend="true"]
.react-flow__controls
.react-flow__minimap
```

---

## 15. Mapa Familiar Vertical

Root:

```txt
[data-family-map-export-root="true"]
```

Arquivo:

```txt
DesktopFamilyMapView.tsx
```

Regras:

- capturar root exportável normalizado;
- preservar laterais e offsets;
- incluir conectores SVG;
- respeitar modo wide;
- respeitar `hideGroupChrome` quando `Destacar > Grupos` estiver ativo;
- exportar com título `Mapa Familiar de {primeiroNome}`;
- não capturar painel ou header.

---

## 16. Mapa Familiar Horizontal

Roots:

```txt
[data-family-map-export-root="true"]
[data-family-map-horizontal-root="true"]
```

Arquivo:

```txt
DesktopFamilyHorizontalMapView.tsx
```

Regras:

- capturar colunas ativas;
- preservar conectores SVG casal/filhos;
- respeitar cabeçalhos ocultos quando `Destacar > Grupos` estiver ativo;
- exportar com título `Genealogia de {primeiroNome}`;
- não usar `.react-flow` como alvo principal.

---

## 17. Mobile

Nas rotas do Mapa Familiar:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Regras:

- ações são disparadas pelo painel inferior do `HomeMobileNav`;
- painel, header, bottom nav e botão de controle não entram na captura;
- seleção por área deve considerar a área visível da árvore;
- o alvo não deve ser a interface inteira.

---

## 18. Limites e performance

Limites:

```txt
DEFAULT_TREE_EXPORT_MAX_SCALE = 2
DEFAULT_TREE_EXPORT_MAX_PIXELS = 24_000_000
MAX_EXPORT_PIXELS em área = 12_000_000
```

Boas práticas:

- reduzir zoom antes de exportar se a área for grande demais;
- usar `Área` para recortes grandes;
- manter loading durante processamento;
- evitar sombras e filtros pesados desnecessários em clones de exportação;
- validar em paletas white, visual, orange e brown.

---

## 19. QA obrigatório

Testar em `/mapa-familiar` e `/mapa-familiar-horizontal`:

| Ação | Verificação |
|---|---|
| Imagem | PNG com título, cards, conectores e avatares corretos. |
| PDF | PDF sem título duplicado. |
| Imprimir | Janela abre com imagem pronta e título no conteúdo. |
| Área PNG | Recorte respeita seleção e inclui título. |
| Área PDF | Recorte em PDF com título. |
| Área Imprimir | Recorte impresso com título. |
| Loading | Aparece antes e não fecha cedo demais. |
| SVGs | Silhuetas/pets/estrela/cruz não viram quadrados. |
| UI | Painel, loading e overlays não aparecem no artefato. |

---

## 20. Anti-regressões

Não fazer:

- usar `allowTaint: true`;
- remover `useCORS`;
- capturar header/painel por engano;
- aplicar CSS global em todos os `svg path`;
- usar `mapSurfaceRef` isoladamente como alvo de seleção se o viewport/root tiver outro sistema de coordenadas;
- duplicar título no PDF;
- fechar loading antes de `printCanvas` resolver;
- reintroduzir exportação por `.react-flow` no Mapa Familiar.
