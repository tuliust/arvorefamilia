# ExportaÃ§Ã£o da Ã¡rvore

> Documento canÃ´nico da funcionalidade de exportaÃ§Ã£o de Ã¡rea visÃ­vel da Ã¡rvore.
> Local recomendado: `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 1. Objetivo

Este documento consolida a funcionalidade de exportaÃ§Ã£o da Ã¡rvore familiar no projeto **Ãrvore FamÃ­lia**.

A exportaÃ§Ã£o atual permite ao usuÃ¡rio selecionar uma Ã¡rea visÃ­vel da Ã¡rvore e gerar:

- imagem PNG;
- arquivo PDF;
- impressÃ£o.

A funcionalidade atua sobre a **viewport visÃ­vel** da Ã¡rvore, nÃ£o sobre a Ã¡rvore completa.

---

## 2. Escopo atual

### Implementado

- SeleÃ§Ã£o retangular de Ã¡rea visÃ­vel da Ã¡rvore.
- ExportaÃ§Ã£o da seleÃ§Ã£o em PNG.
- ExportaÃ§Ã£o da seleÃ§Ã£o em PDF.
- ImpressÃ£o da seleÃ§Ã£o.
- Cancelamento por botÃ£o.
- Cancelamento por tecla `Esc`.
- Bloqueio temporÃ¡rio de pan/zoom enquanto a seleÃ§Ã£o estÃ¡ ativa.
- ExclusÃ£o de controles, overlays, legendas e menus na captura.
- Mensagens amigÃ¡veis de erro quando a captura falha.

### Fora do escopo atual

- ExportaÃ§Ã£o automÃ¡tica da Ã¡rvore completa.
- ExportaÃ§Ã£o com escala automÃ¡tica de toda a Ã¡rvore.
- ExportaÃ§Ã£o server-side.
- Salvamento da exportaÃ§Ã£o no Supabase Storage.
- Log persistido de exportaÃ§Ã£o.
- HistÃ³rico de exportaÃ§Ãµes do usuÃ¡rio.
- ExportaÃ§Ã£o por lote.
- ExportaÃ§Ã£o vetorial/SVG.

---

## 3. Arquivos principais

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/pages/Home.tsx
```

Arquivos relacionados:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/types.ts
```

Documentos relacionados:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
```

---

## 4. Componentes e responsabilidades

### 4.1 `FamilyTree.tsx`

Responsabilidades relacionadas Ã  exportaÃ§Ã£o:

- expor aÃ§Ã£o imperativa `startAreaSelection`;
- acionar o modo de seleÃ§Ã£o de Ã¡rea;
- bloquear pan/zoom enquanto o overlay estÃ¡ ativo;
- renderizar `TreeAreaSelectionOverlay`;
- fornecer elemento alvo da captura;
- preservar o funcionamento normal da Ã¡rvore apÃ³s cancelar/concluir a seleÃ§Ã£o.

AÃ§Ãµes expostas via `ref`:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

ObservaÃ§Ã£o:

- `print`, `savePdf` e `saveImage` continuam existindo como aÃ§Ãµes de exportaÃ§Ã£o direta/legada quando aplicÃ¡vel.
- A seleÃ§Ã£o de Ã¡rea Ã© a experiÃªncia recomendada para o MVP.

---

### 4.2 `TreeAreaSelectionOverlay.tsx`

Responsabilidades:

- renderizar a camada de seleÃ§Ã£o;
- capturar inÃ­cio, movimento e final da seleÃ§Ã£o retangular;
- validar Ã¡rea mÃ­nima;
- exibir toolbar contextual;
- chamar exportaÃ§Ã£o PNG/PDF/impressÃ£o;
- cancelar por botÃ£o ou `Esc`;
- exibir erro local quando a operaÃ§Ã£o falha;
- fechar apÃ³s exportaÃ§Ã£o bem-sucedida.

Props esperadas:

```txt
getTargetElement
filenameLabel
title
onClose
```

Regras implementadas:

- seleÃ§Ã£o mÃ­nima de `80 x 80px`;
- limite mÃ¡ximo de exportaÃ§Ã£o estimado;
- bloqueio de propagaÃ§Ã£o de eventos;
- fechamento apÃ³s sucesso;
- manutenÃ§Ã£o de pan/zoom bloqueados enquanto a seleÃ§Ã£o estÃ¡ ativa.

---

### 4.3 `treeExport.ts`

Responsabilidades:

- gerar nome de arquivo;
- capturar elemento HTML com `html2canvas`;
- sanitizar cores nÃ£o suportadas;
- recortar canvas conforme seleÃ§Ã£o;
- salvar PNG;
- gerar PDF;
- abrir janela de impressÃ£o;
- imprimir canvas;
- ignorar elementos que nÃ£o devem aparecer na captura.

FunÃ§Ãµes principais:

```txt
buildTreeExportFilename
getDefaultTreeExportIgnoreElements
captureElementToCanvas
cropCanvas
downloadCanvasAsPng
exportCanvasAsPdf
openTreePrintWindow
printCanvas
```

---

## 5. Fluxo de uso

Fluxo funcional esperado:

```txt
UsuÃ¡rio abre a Ã¡rvore
  â†“
UsuÃ¡rio abre AÃ§Ãµes
  â†“
UsuÃ¡rio escolhe Selecionar Ã¡rea
  â†“
Overlay Ã© exibido sobre a Ã¡rvore
  â†“
UsuÃ¡rio arrasta para selecionar uma Ã¡rea visÃ­vel
  â†“
Toolbar contextual aparece
  â†“
UsuÃ¡rio escolhe PNG, PDF ou Imprimir
  â†“
Sistema captura a Ã¡rea selecionada
  â†“
Sistema baixa arquivo ou abre impressÃ£o
  â†“
Overlay fecha apÃ³s sucesso
```

Cancelamento:

```txt
Overlay ativo
  â†“
UsuÃ¡rio clica em Cancelar ou pressiona Esc
  â†“
Overlay fecha
  â†“
Pan/zoom voltam ao comportamento normal
```

---

## 6. Regras de UX

### 6.1 Texto e instruÃ§Ã£o

Texto esperado no overlay:

```txt
Arraste para selecionar uma Ã¡rea visÃ­vel da Ã¡rvore.
```

BotÃµes/aÃ§Ãµes esperados:

```txt
PNG
PDF
Imprimir
Cancelar
```

### 6.2 SeleÃ§Ã£o

Regras:

- a seleÃ§Ã£o deve ser retangular;
- a seleÃ§Ã£o deve acontecer sobre a Ã¡rea visÃ­vel;
- a Ã¡rea mÃ­nima deve impedir cliques acidentais;
- a seleÃ§Ã£o nÃ£o deve alterar dados da Ã¡rvore;
- a seleÃ§Ã£o nÃ£o deve alterar filtros, view ou pessoa central.

### 6.3 Pan e zoom

Durante seleÃ§Ã£o:

- pan deve ficar bloqueado;
- zoom deve ficar bloqueado;
- clique em pessoa deve ficar bloqueado;
- clique em casamento/anel deve ficar bloqueado;
- menus contextuais da Ã¡rvore nÃ£o devem abrir.

ApÃ³s cancelar ou concluir:

- pan volta ao estado anterior;
- zoom volta ao estado anterior;
- Ã¡rvore permanece na mesma view;
- filtros e pessoa central sÃ£o preservados.

---

## 7. Elementos ignorados na exportaÃ§Ã£o

A exportaÃ§Ã£o deve ignorar elementos de UI que nÃ£o fazem parte da Ã¡rvore capturada.

Seletores esperados:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

Regras:

- controles de zoom nÃ£o devem aparecer no PNG/PDF/impressÃ£o;
- menus de node nÃ£o devem aparecer;
- overlay de seleÃ§Ã£o nÃ£o deve aparecer;
- legenda lateral nÃ£o deve aparecer quando marcada com `data-tree-legend="true"`;
- elementos de navegaÃ§Ã£o da pÃ¡gina nÃ£o devem aparecer.

---

## 8. RestriÃ§Ãµes tÃ©cnicas

### 8.1 CORS

A captura usa `html2canvas`.

ConfiguraÃ§Ãµes esperadas:

```txt
useCORS: true
allowTaint: false
```

Risco:

- imagens externas sem CORS adequado podem quebrar a captura;
- avatares ou arquivos remotos precisam ter acesso compatÃ­vel;
- erro deve ser tratado com mensagem amigÃ¡vel.

Regra:

- nÃ£o resolver erro de CORS removendo seguranÃ§a ou permitindo canvas tainted sem avaliaÃ§Ã£o.

---

### 8.2 Cores nÃ£o suportadas

Algumas cores CSS modernas podem nÃ£o ser suportadas pela captura.

Regra:

- preservar sanitizaÃ§Ã£o de cores;
- nÃ£o remover fallback de cores;
- validar captura apÃ³s mudanÃ§a visual na Ã¡rvore.

---

### 8.3 Limite de tamanho

A exportaÃ§Ã£o possui limite de seguranÃ§a para evitar canvas grande demais.

Regra atual:

```txt
limite estimado: 12.000.000 pixels
```

Se o usuÃ¡rio selecionar Ã¡rea muito grande:

- exibir erro amigÃ¡vel;
- orientar seleÃ§Ã£o menor;
- nÃ£o travar a pÃ¡gina.

---

## 9. Regras por view da Ã¡rvore

### Minha Ãrvore

- Exporta apenas a Ã¡rea visÃ­vel selecionada.
- Deve preservar layout direto e grupos familiares.
- Labels e group boxes podem aparecer se estiverem dentro da seleÃ§Ã£o.
- Painel lateral nÃ£o deve aparecer.

### Genealogia

- Exporta apenas a Ã¡rea visÃ­vel selecionada.
- Como a Ã¡rvore pode ser verticalmente longa, o usuÃ¡rio deve pan/arrastar atÃ© a regiÃ£o desejada antes de selecionar.
- A exportaÃ§Ã£o nÃ£o deve tentar capturar automaticamente toda a altura.

### VisÃ£o Completa

- Exporta apenas a Ã¡rea visÃ­vel selecionada.
- A Ã¡rvore completa pode ser maior que a viewport.
- Exportar toda a Ã¡rvore fica pÃ³s-MVP.

---

## 10. QA obrigatÃ³rio

ApÃ³s alterar exportaÃ§Ã£o, Ã¡rvore, ReactFlow, painel lateral ou legenda:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

QA manual mÃ­nimo:

- abrir `/minha-arvore`;
- iniciar seleÃ§Ã£o de Ã¡rea;
- cancelar por botÃ£o;
- iniciar seleÃ§Ã£o novamente;
- cancelar por `Esc`;
- selecionar Ã¡rea vÃ¡lida;
- exportar PNG;
- exportar PDF;
- imprimir;
- testar seleÃ§Ã£o pequena demais;
- testar com painel lateral aberto;
- testar com painel lateral recolhido;
- testar em Genealogia;
- testar em VisÃ£o Completa;
- confirmar que pan/zoom voltam apÃ³s cancelar/concluir;
- confirmar que legenda/overlay/menus nÃ£o aparecem na exportaÃ§Ã£o.

Larguras recomendadas:

- desktop;
- 768px;
- 430px;
- 390px;
- 375px;
- 320px.

---

## 11. Troubleshooting

### ExportaÃ§Ã£o falha com imagem externa

Causa provÃ¡vel:

- imagem sem CORS;
- avatar externo;
- arquivo remoto sem headers adequados.

CorreÃ§Ã£o:

- validar origem da imagem;
- preferir arquivos servidos por Storage com polÃ­tica compatÃ­vel;
- manter `useCORS: true`;
- nÃ£o usar `allowTaint: true` sem revisÃ£o.

---

### Controles aparecem no PNG/PDF

Causa provÃ¡vel:

- seletor de ignore incompleto;
- elemento sem atributo esperado;
- classe ReactFlow alterada.

Verificar:

```txt
getDefaultTreeExportIgnoreElements
data-tree-selection-overlay="true"
data-tree-legend="true"
data-tree-node-menu="true"
```

---

### SeleÃ§Ã£o nÃ£o bloqueia pan

Causa provÃ¡vel:

- eventos propagando para ReactFlow;
- overlay sem interceptar `mousedown`, `mousemove` ou `click`;
- estado de seleÃ§Ã£o nÃ£o repassado ao `FamilyTree`.

CorreÃ§Ã£o:

- revisar `TreeAreaSelectionOverlay`;
- revisar bloqueio de pan/zoom em `FamilyTree`;
- confirmar `stopPropagation` nos pontos necessÃ¡rios.

---

### PDF fica cortado

Causa provÃ¡vel:

- seleÃ§Ã£o muito grande;
- proporÃ§Ã£o incompatÃ­vel;
- escala do canvas;
- limite de pÃ¡gina.

CorreÃ§Ã£o:

- testar seleÃ§Ã£o menor;
- revisar geraÃ§Ã£o em `exportCanvasAsPdf`;
- validar orientaÃ§Ã£o e proporÃ§Ã£o.

---

### ImpressÃ£o abre em branco

Causa provÃ¡vel:

- janela de impressÃ£o bloqueada;
- canvas nÃ£o carregou a tempo;
- erro de CORS;
- browser bloqueou popup.

CorreÃ§Ã£o:

- revisar `openTreePrintWindow`;
- garantir que canvas foi criado antes de chamar print;
- testar em outro navegador.

---

## 12. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- exportar Ã¡rvore completa;
- exportar Ã¡rvore completa com escala automÃ¡tica;
- exportar ramo especÃ­fico;
- exportar por geraÃ§Ã£o;
- exportar com legenda embutida opcional;
- exportar com tÃ­tulo e metadados;
- exportar com data/hora e nome da pessoa central;
- salvar exportaÃ§Ãµes no Storage;
- criar histÃ³rico de exportaÃ§Ãµes;
- gerar PDF multipÃ¡gina;
- gerar SVG/vetor.

Esses itens nÃ£o bloqueiam o MVP.

---

## 13. Regras de manutenÃ§Ã£o

NÃ£o fazer:

- salvar exportaÃ§Ã£o automaticamente no banco;
- criar migration para ajuste visual de exportaÃ§Ã£o;
- capturar painel lateral junto com a Ã¡rvore;
- capturar overlay de seleÃ§Ã£o;
- remover proteÃ§Ã£o contra canvas grande;
- remover tratamento de erro de CORS;
- alterar viewport da Ã¡rvore para resolver bug de exportaÃ§Ã£o sem validar UX;
- confundir exportaÃ§Ã£o da Ã¡rea visÃ­vel com exportaÃ§Ã£o da Ã¡rvore completa.

Fazer:

- manter exportaÃ§Ã£o isolada em componentes/utils da Ã¡rvore;
- manter mensagens de erro compreensÃ­veis;
- testar em todas as views;
- preservar compatibilidade com mobile/tablet;
- documentar qualquer mudanÃ§a de escopo neste arquivo.
