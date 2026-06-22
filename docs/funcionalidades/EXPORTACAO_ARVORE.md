
# Exportação da árvore

> Última revisão: 2026-06-22
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`
> Tipo: documentação funcional/técnica da exportação da árvore
> Status: revisado contra o código atual para diferenciar exportação desktop, exportação mobile, toolbar fixa, modal legacy e painel completo.

---

## 1. Objetivo

---

## Atualização crítica — 2026-06-22

Estado observado no código atual:

- Desktop: exportação está disponível via painel/controles e ações `Área`, `Imagem`, `PDF` e `Imprimir`.
- Toolbar fixa mobile: `MobileFamilyMapToolbar` não possui botão `Exportar`; possui `Formato`, `Cor`, `Filtros`, `Zoom` e `+`.
- `HomeMobileNav` possui handlers e UI de exportação mobile/painel; o painel completo aberto pelo `+` possui ação `Salvar`, que dispara `save-image`.
- Modal legacy `Controles`: renderiza `SidebarPanelTabs mobileControls`; no código atual, esse componente ainda expõe `Exportar`.

Contrato seguro:

```txt
Exportar não é item fixo da toolbar mobile.
Exportação mobile pode existir por painel/modal auxiliar enquanto o código mantiver essa ação.
Todos os controles de exportação mobile devem ter data-tree-export-ignore="true".
```


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

QA manual detalhado fica em:

```txt
docs/QA_MANUAL.md
```

---

## 2. Views cobertas

| View | Rota | Componentes |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | `DesktopFamilyMapView`, `MobileFamilyTreeView` |
| Mapa Genealógico | `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapFilteredView`, `MobileFamilyHorizontalMapFilteredView` |

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
src/app/components/FamilyTree/DesktopFamilyHorizontalMapFilteredView.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/MobileFamilyHorizontalMapFilteredView.tsx
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
- não disponíveis como item fixo da toolbar mobile;
- podem aparecer em painel/modal mobile auxiliar conforme código atual;
- a view ativa resolve o alvo de captura;
- cliques repetidos devem ser bloqueados durante exportação;
- erros devem liberar loading;
- a ausência da antiga barra `Filtros | Legendas | Ações` não pode quebrar os botões.

---

## 5. Modelo de refs e alvos

## 4.1 Exportação no mobile

Superfícies atuais:

| Superfície | Exportação |
|---|---|
| Toolbar fixa `MobileFamilyMapToolbar` | não possui item `Exportar`. |
| Popover de `HomeMobileNav` | possui handler/estrutura para exportação quando acionado. |
| Painel completo `+` | possui ação `Salvar`, disparando `save-image`. |
| Modal legacy `Controles` | pode expor `Exportar` por `SidebarPanelTabs mobileControls`. |

QA obrigatório:

- [ ] ação de exportação não entra na captura;
- [ ] overlay/painel é ignorado por `data-tree-export-ignore`;
- [ ] body destrava após ação ou erro;
- [ ] PNG/PDF/Imprimir não capturam toolbar, bottom nav, popover, modal ou debug;
- [ ] exportação mobile não quebra Zoom/overview nem scroll interno.


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
Cônjuges de pais/Geração 4 na horizontal não devem ser tratados
como implementados até correção de TREE-003 no código.
```

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

- exportação preserva card, texto, borda, grupos, conectores e canvas;
- a paleta Visual/Azul preserva gradientes quando aplicável;
- paletas não azuis não caem em fallback azul/teal;
- CSS de exportação deve ser escopado;
- clone de captura não deve aplicar seletor global que afete ícones internos.

---

## 16. Erros e limites

Regras:

- captura grande demais deve ser bloqueada com mensagem clara;
- erro de imagem externa/CORS deve ser controlado;
- erro de PDF deve liberar loading;
- erro de impressão não deve deixar UI travada;
- retry não deve duplicar downloads em andamento.

---

## 17. QA manual

Procedimentos de QA ficam em:

```txt
docs/QA_MANUAL.md
```

Usar especialmente as seções:

- QA de exportação;
- QA de paletas;
- QA de cards e avatares;
- QA de cônjuges, núcleos e conectores;
- QA operacional pós-deploy.

Pendências relacionadas continuam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

<!-- EXPORTACAO-PENDENCIAS-2026-06-18 -->
## Pontos recentes a confirmar em exportaÃ§Ã£o da Ã¡rvore

Antes de registrar como implementado, verificar se o cÃ³digo atual confirma:

- botÃ£o â€œSalvar e Imprimirâ€;
- opÃ§Ãµes Ãrea, Imagem, PDF e Imprimir;
- local correto dos botÃµes no painel;
- comportamento mobile;
- limitaÃ§Ãµes conhecidas de exportaÃ§Ã£o.

Itens ainda apenas planejados devem permanecer em `PLANO_PROXIMOS_PASSOS.md`.

<!-- RODADA2-EXPORTACAO-2026-06-18 -->
## ExportaÃ§Ã£o â€” painel e mobile

### AÃ§Ãµes esperadas

A exportaÃ§Ã£o deve oferecer:

```txt
Ãrea
Imagem
PDF
Imprimir
```

### Mobile

No mobile, a aÃ§Ã£o **Exportar** abre um popover prÃ³prio com:

- tÃ­tulo Exportar;
- grid com dois botÃµes por linha;
- botÃµes compactos;
- Ã­cones pequenos;
- bordas suaves;
- consistÃªncia visual com os demais popovers.

### Painel

Quando a exportaÃ§Ã£o estiver no painel lateral, ela deve:

- ficar em local previsÃ­vel;
- nÃ£o competir com visualizaÃ§Ã£o/formato/filtros;
- preservar acesso rÃ¡pido em desktop;
- nÃ£o quebrar o painel compacto.

### QA

- testar exportaÃ§Ã£o em `/mapa-familiar`;
- testar exportaÃ§Ã£o em `/mapa-familiar-horizontal`;
- testar em desktop e mobile;
- validar Ãrea, Imagem, PDF e Imprimir separadamente.
