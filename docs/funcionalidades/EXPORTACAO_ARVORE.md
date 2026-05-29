# Exportação da árvore

> Documento canônico da funcionalidade de exportação de área visível da árvore.  
> Local recomendado: `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 1. Objetivo

Este documento consolida a funcionalidade de exportação da árvore familiar no projeto **Árvore Família**.

A exportação atual permite ao usuário selecionar uma área visível da árvore e gerar:

- imagem PNG;
- arquivo PDF;
- impressão.

A funcionalidade atua sobre a **viewport visível** da árvore, não sobre a árvore completa.

---

## 2. Escopo atual

### Implementado

- Seleção retangular de área visível da árvore.
- Exportação da seleção em PNG.
- Exportação da seleção em PDF.
- Impressão da seleção.
- Cancelamento por botão.
- Cancelamento por tecla `Esc`.
- Bloqueio temporário de pan/zoom enquanto a seleção está ativa.
- Exclusão de controles, overlays, legendas e menus na captura.
- Mensagens amigáveis de erro quando a captura falha.

### Fora do escopo atual

- Exportação automática da árvore completa.
- Exportação com escala automática de toda a árvore.
- Exportação server-side.
- Salvamento da exportação no Supabase Storage.
- Log persistido de exportação.
- Histórico de exportações do usuário.
- Exportação por lote.
- Exportação vetorial/SVG.

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

Responsabilidades relacionadas à exportação:

- expor ação imperativa `startAreaSelection`;
- acionar o modo de seleção de área;
- bloquear pan/zoom enquanto o overlay está ativo;
- renderizar `TreeAreaSelectionOverlay`;
- fornecer elemento alvo da captura;
- preservar o funcionamento normal da árvore após cancelar/concluir a seleção.

Ações expostas via `ref`:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Observação:

- `print`, `savePdf` e `saveImage` continuam existindo como ações de exportação direta/legada quando aplicável.
- A seleção de área é a experiência recomendada para o MVP.

---

### 4.2 `TreeAreaSelectionOverlay.tsx`

Responsabilidades:

- renderizar a camada de seleção;
- capturar início, movimento e final da seleção retangular;
- validar área mínima;
- exibir toolbar contextual;
- chamar exportação PNG/PDF/impressão;
- cancelar por botão ou `Esc`;
- exibir erro local quando a operação falha;
- fechar após exportação bem-sucedida.

Props esperadas:

```txt
getTargetElement
filenameLabel
title
onClose
```

Regras implementadas:

- seleção mínima de `80 x 80px`;
- limite máximo de exportação estimado;
- bloqueio de propagação de eventos;
- fechamento após sucesso;
- manutenção de pan/zoom bloqueados enquanto a seleção está ativa.

---

### 4.3 `treeExport.ts`

Responsabilidades:

- gerar nome de arquivo;
- capturar elemento HTML com `html2canvas`;
- sanitizar cores não suportadas;
- recortar canvas conforme seleção;
- salvar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- ignorar elementos que não devem aparecer na captura.

Funções principais:

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
Usuário abre a árvore
  ↓
Usuário abre Ações
  ↓
Usuário escolhe Selecionar área
  ↓
Overlay é exibido sobre a árvore
  ↓
Usuário arrasta para selecionar uma área visível
  ↓
Toolbar contextual aparece
  ↓
Usuário escolhe PNG, PDF ou Imprimir
  ↓
Sistema captura a área selecionada
  ↓
Sistema baixa arquivo ou abre impressão
  ↓
Overlay fecha após sucesso
```

Cancelamento:

```txt
Overlay ativo
  ↓
Usuário clica em Cancelar ou pressiona Esc
  ↓
Overlay fecha
  ↓
Pan/zoom voltam ao comportamento normal
```

---

## 6. Regras de UX

### 6.1 Texto e instrução

Texto esperado no overlay:

```txt
Arraste para selecionar uma área visível da árvore.
```

Botões/ações esperados:

```txt
PNG
PDF
Imprimir
Cancelar
```

### 6.2 Seleção

Regras:

- a seleção deve ser retangular;
- a seleção deve acontecer sobre a área visível;
- a área mínima deve impedir cliques acidentais;
- a seleção não deve alterar dados da árvore;
- a seleção não deve alterar filtros, view ou pessoa central.

### 6.3 Pan e zoom

Durante seleção:

- pan deve ficar bloqueado;
- zoom deve ficar bloqueado;
- clique em pessoa deve ficar bloqueado;
- clique em casamento/anel deve ficar bloqueado;
- menus contextuais da árvore não devem abrir.

Após cancelar ou concluir:

- pan volta ao estado anterior;
- zoom volta ao estado anterior;
- árvore permanece na mesma view;
- filtros e pessoa central são preservados.

---

## 7. Elementos ignorados na exportação

A exportação deve ignorar elementos de UI que não fazem parte da árvore capturada.

Seletores esperados:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

Regras:

- controles de zoom não devem aparecer no PNG/PDF/impressão;
- menus de node não devem aparecer;
- overlay de seleção não deve aparecer;
- legenda lateral não deve aparecer quando marcada com `data-tree-legend="true"`;
- elementos de navegação da página não devem aparecer.

---

## 8. Restrições técnicas

### 8.1 CORS

A captura usa `html2canvas`.

Configurações esperadas:

```txt
useCORS: true
allowTaint: false
```

Risco:

- imagens externas sem CORS adequado podem quebrar a captura;
- avatares ou arquivos remotos precisam ter acesso compatível;
- erro deve ser tratado com mensagem amigável.

Regra:

- não resolver erro de CORS removendo segurança ou permitindo canvas tainted sem avaliação.

---

### 8.2 Cores não suportadas

Algumas cores CSS modernas podem não ser suportadas pela captura.

Regra:

- preservar sanitização de cores;
- não remover fallback de cores;
- validar captura após mudança visual na árvore.

---

### 8.3 Limite de tamanho

A exportação possui limite de segurança para evitar canvas grande demais.

Regra atual:

```txt
limite estimado: 12.000.000 pixels
```

Se o usuário selecionar área muito grande:

- exibir erro amigável;
- orientar seleção menor;
- não travar a página.

---

## 9. Regras por view da árvore

### Minha Árvore

- Exporta apenas a área visível selecionada.
- Deve preservar layout direto e grupos familiares.
- Labels e group boxes podem aparecer se estiverem dentro da seleção.
- Painel lateral não deve aparecer.

### Genealogia

- Exporta apenas a área visível selecionada.
- Como a árvore pode ser verticalmente longa, o usuário deve pan/arrastar até a região desejada antes de selecionar.
- A exportação não deve tentar capturar automaticamente toda a altura.

### Visão Completa

- Exporta apenas a área visível selecionada.
- A árvore completa pode ser maior que a viewport.
- Exportar toda a árvore fica pós-MVP.

---

## 10. QA obrigatório

Após alterar exportação, árvore, ReactFlow, painel lateral ou legenda:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

QA manual mínimo:

- abrir `/minha-arvore`;
- iniciar seleção de área;
- cancelar por botão;
- iniciar seleção novamente;
- cancelar por `Esc`;
- selecionar área válida;
- exportar PNG;
- exportar PDF;
- imprimir;
- testar seleção pequena demais;
- testar com painel lateral aberto;
- testar com painel lateral recolhido;
- testar em Genealogia;
- testar em Visão Completa;
- confirmar que pan/zoom voltam após cancelar/concluir;
- confirmar que legenda/overlay/menus não aparecem na exportação.

Larguras recomendadas:

- desktop;
- 768px;
- 430px;
- 390px;
- 375px;
- 320px.

---

## 11. Troubleshooting

### Exportação falha com imagem externa

Causa provável:

- imagem sem CORS;
- avatar externo;
- arquivo remoto sem headers adequados.

Correção:

- validar origem da imagem;
- preferir arquivos servidos por Storage com política compatível;
- manter `useCORS: true`;
- não usar `allowTaint: true` sem revisão.

---

### Controles aparecem no PNG/PDF

Causa provável:

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

### Seleção não bloqueia pan

Causa provável:

- eventos propagando para ReactFlow;
- overlay sem interceptar `mousedown`, `mousemove` ou `click`;
- estado de seleção não repassado ao `FamilyTree`.

Correção:

- revisar `TreeAreaSelectionOverlay`;
- revisar bloqueio de pan/zoom em `FamilyTree`;
- confirmar `stopPropagation` nos pontos necessários.

---

### PDF fica cortado

Causa provável:

- seleção muito grande;
- proporção incompatível;
- escala do canvas;
- limite de página.

Correção:

- testar seleção menor;
- revisar geração em `exportCanvasAsPdf`;
- validar orientação e proporção.

---

### Impressão abre em branco

Causa provável:

- janela de impressão bloqueada;
- canvas não carregou a tempo;
- erro de CORS;
- browser bloqueou popup.

Correção:

- revisar `openTreePrintWindow`;
- garantir que canvas foi criado antes de chamar print;
- testar em outro navegador.

---

## 12. Pós-MVP

Possíveis evoluções:

- exportar árvore completa;
- exportar árvore completa com escala automática;
- exportar ramo específico;
- exportar por geração;
- exportar com legenda embutida opcional;
- exportar com título e metadados;
- exportar com data/hora e nome da pessoa central;
- salvar exportações no Storage;
- criar histórico de exportações;
- gerar PDF multipágina;
- gerar SVG/vetor.

Esses itens não bloqueiam o MVP.

---

## 13. Regras de manutenção

Não fazer:

- salvar exportação automaticamente no banco;
- criar migration para ajuste visual de exportação;
- capturar painel lateral junto com a árvore;
- capturar overlay de seleção;
- remover proteção contra canvas grande;
- remover tratamento de erro de CORS;
- alterar viewport da árvore para resolver bug de exportação sem validar UX;
- confundir exportação da área visível com exportação da árvore completa.

Fazer:

- manter exportação isolada em componentes/utils da árvore;
- manter mensagens de erro compreensíveis;
- testar em todas as views;
- preservar compatibilidade com mobile/tablet;
- documentar qualquer mudança de escopo neste arquivo.
