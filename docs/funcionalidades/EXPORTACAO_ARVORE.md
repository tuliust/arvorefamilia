# Exportação da árvore

> Última revisão: 2026-06-14
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`
> Tipo: documentação funcional/técnica da exportação da árvore.
> Status: revisado para as views oficiais atuais e para evitar duplicação com os demais guias.

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
sem incluir painel, header, bottom nav, overlays, loading, debug ou controles.
```

---

## 2. Views cobertas

| View | Rota | Componentes |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | `DesktopFamilyMapView`, `MobileFamilyTreeView` |
| Mapa Genealógico | `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView`, `MobileFamilyHorizontalMapView` |

Rotas antigas fora do produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Observação:

- seletores ou compatibilidades herdadas em `treeExport.ts` não reativam rotas antigas;
- limpeza de ReactFlow/exportação legada deve ocorrer apenas em frente própria.

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
src/styles/family-map-qa.css
src/styles/family-map-horizontal.css
src/styles/family-map-mobile-palettes.css
src/styles/home-sidebar-unified.css
src/styles/mobile-tree-controls.css
src/styles/tree-panel-palette-cards.css
```

Arquivos legados que não devem ser removidos sem frente específica:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

---

## 4. Ações de exportação

| Ação | Comportamento |
|---|---|
| Área | Abre seleção retangular sobre a área visível. |
| Imagem | Gera PNG da view/área. |
| PDF | Gera PDF proporcional com título. |
| Imprimir | Abre fluxo de impressão com canvas titulado. |

Regras:

- disponíveis no painel desktop/completo;
- não disponíveis no modal mobile de controles;
- a view ativa resolve o alvo de captura;
- cliques repetidos devem ser bloqueados durante exportação;
- erros devem liberar loading;
- a ausência da antiga barra `Filtros | Legendas | Ações` não pode quebrar os botões.

---

## 5. Modelo de refs e alvos

Refs esperadas nas views:

| Ref | Papel |
|---|---|
| `viewportRef` | container visível/rolável |
| `exportRootRef` | root exportável completo |
| `mapSurfaceRef` | superfície interna escalada |

Regras:

- PNG/PDF/Imprimir usam root exportável;
- Área usa alvo alinhado ao viewport visível;
- `mapSurfaceRef` isolado pode gerar crop incorreto se houver offsets/escala;
- mobile deve expor alvo coerente com a tela/geração ativa;
- novos blocos visuais renderizados devem entrar nos bounds/canvas.

---

## 6. `treeExport.ts`

Responsabilidades:

- montar nomes de arquivos;
- resolver alvo exportável;
- medir dimensões;
- aplicar limite preventivo de pixels;
- capturar DOM com `html2canvas`;
- recortar canvas;
- baixar PNG;
- gerar PDF;
- abrir/imprimir;
- adicionar título;
- estabilizar UI antes da captura;
- ignorar UI transitória;
- sanitizar cores incompatíveis;
- normalizar SVGs internos.

Conceitos/funções relevantes:

```txt
buildTreeExportFilename
resolveTreeExportTarget
getElementCaptureMetrics
assertSafeElementCaptureSize
captureElementToCanvas
cropCanvas
downloadCanvasAsPng
exportCanvasAsPdf
openTreePrintWindow
printCanvas
prependTitleToCanvas
waitForExportUiSettle
```

---

## 7. Captura com `html2canvas`

Configuração esperada:

```txt
useCORS: true
allowTaint: false
removeContainer: true
backgroundColor: definido pela view/opção
scale: limitado
windowWidth/windowHeight: adequados
scrollX/scrollY: compensados
```

Regras:

- não usar `allowTaint: true` sem revisão;
- não depender de imagem externa sem CORS;
- preservar paleta ativa;
- preservar gradientes dos cards;
- preservar conectores SVG;
- normalizar SVGs/ícones quando necessário;
- evitar seletor global `svg path`;
- testar pessoas com foto, sem foto e pets.

---

## 8. Elementos ignorados

Devem ser ignorados na captura:

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

Exemplos de elementos ignoráveis:

- painel desktop;
- modal mobile;
- header;
- bottom nav;
- overlays;
- loading;
- debug `Visualizar como...`;
- menus de nó/card.

---

## 9. Seleção por área

Componente:

```txt
TreeAreaSelectionOverlay.tsx
```

Fluxo:

```txt
Exportar > Área
-> overlay de seleção
-> arrasto do usuário
-> toolbar da seleção
-> PNG/PDF/Imprimir
-> captura da área visível
-> crop
-> título
-> fechamento
```

Regras:

- seleção mínima de `80 x 80px`;
- impedir fechamento por `Esc` durante exportação;
- respeitar limite de pixels;
- não capturar overlay/toolbar;
- `Área` deve funcionar como toggle;
- recorte deve corresponder à área visual selecionada.

---

## 10. Loading

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
- impressão só resolve depois de disparar `window.print()`;
- cliques repetidos durante loading devem ser ignorados.

---

## 11. Títulos no canvas

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |

Regras:

- PNG recebe título;
- PDF usa canvas titulado;
- Impressão usa canvas titulado;
- Área selecionada também recebe título;
- evitar título duplicado;
- não restaurar `Genealogia de...` nem `Mapa Familiar Horizontal de...` como título exportável principal.

---

## 12. Avatares, ícones e SVGs

Contrato:

| Caso | Renderização |
|---|---|
| Pessoa com foto | `foto_principal_url` |
| Pessoa sem foto | `User`, `lucide-react` |
| Pet | `PawPrint`, `lucide-react` |

Riscos prevenidos:

- SVG interno virar bloco escuro;
- conector afetar ícone por seletor global;
- avatar externo sem CORS falhar;
- status/nascimento/falecimento perder contraste.

Classes úteis:

```txt
family-map-avatar-icon
family-map-person-silhouette
family-map-pet-icon
family-map-status-icon
family-map-birth-icon
family-map-deceased-icon
```

Não há fallback por gênero como regra vigente.

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
- incluir blocos adicionais renderizados;
- calcular bounds considerando grupos, cônjuges, filhos, netos e pets quando existirem.

---

## 14. Mapa Genealógico Horizontal

Roots/atributos esperados:

```txt
data-family-map-horizontal-root
data-family-map-horizontal-mobile-root
```

Compatibilidade histórica que pode aparecer:

```txt
data-mobile-family-horizontal-root
```

Regras:

- capturar superfície horizontal completa ou geração/área ativa no mobile;
- preservar conectores;
- preservar compactação de colunas;
- preservar paleta ativa;
- respeitar `Destacar > Grupos`;
- exportar com título `Mapa Genealógico`.

Observação importante:

```txt
Cônjuges de pais/Geração 4 na horizontal não devem ser tratados como implementados
enquanto a pendência TREE-003 permanecer aberta.
```

A exportação preserva o que a view renderiza; ela não deve criar cônjuges ou relações ausentes.

---

## 15. Paletas na exportação

Paletas oficiais:

```txt
white
visual
orange
brown
```

Regras:

- card, texto, borda, group chrome, conectores e canvas devem preservar a paleta;
- Visual/Azul pode ter gradientes;
- Laranja/Marrom/Branca não podem cair em fallback azul;
- mobile deve exportar com paleta coerente;
- CSS de exportação deve ser escopado.

---

## 16. Limites e erros

Regras:

- captura muito grande deve ser bloqueada antes do consumo excessivo de memória;
- erro deve gerar mensagem clara;
- loading deve fechar em erro;
- área inválida deve ser recusada;
- falha de imagem/CORS deve ser tratada sem travar a UI.

Mensagens devem orientar ação do usuário sem expor stack trace ou dados sensíveis.

---

## 17. Segurança e privacidade

- não incluir tokens, secrets ou dados de ambiente em nome de arquivo, metadados ou logs;
- não capturar UI administrativa ou menus sensíveis;
- não incluir debug na exportação;
- não enviar a captura a serviço externo sem decisão explícita.

---

## 18. QA mínimo

### Por view

- [ ] `/mapa-familiar` PNG.
- [ ] `/mapa-familiar` PDF.
- [ ] `/mapa-familiar` Impressão.
- [ ] `/mapa-familiar` Área.
- [ ] `/mapa-familiar-horizontal` PNG.
- [ ] `/mapa-familiar-horizontal` PDF.
- [ ] `/mapa-familiar-horizontal` Impressão.
- [ ] `/mapa-familiar-horizontal` Área.

### Por conteúdo

- [ ] pessoa com foto;
- [ ] pessoa sem foto;
- [ ] pet;
- [ ] nascimento/falecimento;
- [ ] conectores;
- [ ] cônjuge;
- [ ] paleta Visual;
- [ ] paleta Laranja/Marrom/Branca;
- [ ] filtros ativos;
- [ ] `Destacar > Grupos`.

### Por UI ignorada

- [ ] painel não aparece;
- [ ] modal não aparece;
- [ ] header não aparece;
- [ ] bottom nav não aparece;
- [ ] loading não aparece;
- [ ] debug não aparece;
- [ ] overlay de área não aparece no resultado.

---

## 19. Buscas úteis

```bash
rg "treeExport" src docs
rg "data-tree-export-ignore" src
rg "data-family-map-export-root|data-family-map-horizontal-root" src styles
rg "TreeAreaSelectionOverlay|TreeExportLoadingOverlay" src docs
rg "html2canvas|jspdf|printCanvas|exportCanvasAsPdf" src
rg "react-flow__controls|react-flow__minimap" src docs
```
