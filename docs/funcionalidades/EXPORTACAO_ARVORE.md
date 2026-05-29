# Exportacao da arvore

> Documento canonico da funcionalidade de exportacao de area visivel da arvore.
> Local recomendado: `docs/funcionalidades/EXPORTACAO_ARVORE.md`.

---

## 1. Objetivo

Este documento consolida a funcionalidade de exportacao da arvore familiar no projeto **Arvore Familia**.

A exportacao atual permite ao usuario selecionar uma area visivel da arvore e gerar:

- imagem PNG;
- arquivo PDF;
- impressao.

A funcionalidade atua sobre a **viewport visivel** da arvore, nao sobre a arvore completa.

---

## 2. Escopo atual

### Implementado

- Selecao retangular de area visivel da arvore.
- Exportacao da selecao em PNG.
- Exportacao da selecao em PDF.
- Impressao da selecao.
- Cancelamento por botao.
- Cancelamento por tecla `Esc`.
- Bloqueio temporario de pan/zoom enquanto a selecao esta ativa.
- Exclusao de controles, overlays, legendas e menus na captura.
- Mensagens amigaveis de erro quando a captura falha.

### Fora do escopo atual

- Exportacao automatica da arvore completa.
- Exportacao com escala automatica de toda a arvore.
- Exportacao server-side.
- Salvamento da exportacao no Supabase Storage.
- Log persistido de exportacao.
- Historico de exportacoes do usuario.
- Exportacao por lote.
- Exportacao vetorial/SVG.

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
docs/arquitetura/ROTAS_E_GUARDS.md
docs/historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
```

---

## 4. Componentes e responsabilidades

### 4.1 `FamilyTree.tsx`

Responsabilidades relacionadas a exportacao:

- expor acao imperativa `startAreaSelection`;
- acionar o modo de selecao de area;
- bloquear pan/zoom enquanto o overlay esta ativo;
- renderizar `TreeAreaSelectionOverlay`;
- fornecer elemento alvo da captura;
- preservar o funcionamento normal da arvore apos cancelar/concluir a selecao.

Acoes expostas via `ref`:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

Observacao:

- `print`, `savePdf` e `saveImage` continuam existindo como acoes de exportacao direta/legada quando aplicavel.
- A selecao de area e a experiencia recomendada para o MVP.

---

### 4.2 `TreeAreaSelectionOverlay.tsx`

Responsabilidades:

- renderizar a camada de selecao;
- capturar inicio, movimento e final da selecao retangular;
- validar area minima;
- exibir toolbar contextual;
- chamar exportacao PNG/PDF/impressao;
- cancelar por botao ou `Esc`;
- exibir erro local quando a operacao falha;
- fechar apos exportacao bem-sucedida.

Props esperadas:

```txt
getTargetElement
filenameLabel
title
onClose
```

Regras implementadas:

- selecao minima de `80 x 80px`;
- limite maximo de exportacao estimado;
- bloqueio de propagacao de eventos;
- fechamento apos sucesso;
- manutencao de pan/zoom bloqueados enquanto a selecao esta ativa.

---

### 4.3 `treeExport.ts`

Responsabilidades:

- gerar nome de arquivo;
- capturar elemento HTML com `html2canvas`;
- sanitizar cores nao suportadas;
- recortar canvas conforme selecao;
- salvar PNG;
- gerar PDF;
- abrir janela de impressao;
- imprimir canvas;
- ignorar elementos que nao devem aparecer na captura.

Funcoes principais:

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
Usuario abre a arvore

Usuario abre Acoes

Usuario escolhe Selecionar area

Overlay e exibido sobre a arvore

Usuario arrasta para selecionar uma area visivel

Toolbar contextual aparece

Usuario escolhe Salvar PNG, Salvar PDF ou Imprimir

Sistema captura a area selecionada

Sistema baixa arquivo ou abre impressao

Overlay fecha apos sucesso
```

Cancelamento:

```txt
Overlay ativo

Usuario clica em Cancelar ou pressiona Esc

Overlay fecha

Pan/zoom voltam ao comportamento normal
```

---

## 6. Regras de UX

### 6.1 Texto e instrucao

Texto esperado no overlay:

```txt
Arraste para selecionar uma area visivel da arvore.
```

Botoes/acoes esperados:

```txt
Salvar PNG
Salvar PDF
Imprimir
Cancelar
```

Observacao:

- os labels devem acompanhar a UI real do `TreeAreaSelectionOverlay.tsx`;
- se a UI mudar, atualizar este documento junto.

### 6.2 Selecao

Regras:

- a selecao deve ser retangular;
- a selecao deve acontecer sobre a area visivel;
- a area minima deve impedir cliques acidentais;
- a selecao nao deve alterar dados da arvore;
- a selecao nao deve alterar filtros, view ou pessoa central.

### 6.3 Pan e zoom

Durante selecao:

- pan deve ficar bloqueado;
- zoom deve ficar bloqueado;
- clique em pessoa deve ficar bloqueado;
- clique em casamento/anel deve ficar bloqueado;
- menus contextuais da arvore nao devem abrir.

Apos cancelar ou concluir:

- pan volta ao estado anterior;
- zoom volta ao estado anterior;
- arvore permanece na mesma view;
- filtros e pessoa central sao preservados.

---

## 7. Elementos ignorados na exportacao

A exportacao deve ignorar elementos de UI que nao fazem parte da arvore capturada.

Seletores esperados:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

Regras:

- controles de zoom nao devem aparecer no PNG/PDF/impressao;
- menus de node nao devem aparecer;
- overlay de selecao nao deve aparecer;
- legenda lateral nao deve aparecer quando marcada com `data-tree-legend="true"`;
- elementos de navegacao da pagina nao devem aparecer;
- se novo overlay/menu for criado na arvore, adicionar seletor de ignore correspondente.

---

## 8. Restricoes tecnicas

### 8.1 CORS

A captura usa `html2canvas`.

Configuracoes esperadas:

```txt
useCORS: true
allowTaint: false
```

Risco:

- imagens externas sem CORS adequado podem quebrar a captura;
- avatares ou arquivos remotos precisam ter acesso compativel;
- erro deve ser tratado com mensagem amigavel.

Regra:

- nao resolver erro de CORS removendo seguranca ou permitindo canvas tainted sem avaliacao.

---

### 8.2 Cores nao suportadas

Algumas cores CSS modernas podem nao ser suportadas pela captura.

Regra:

- preservar sanitizacao de cores;
- nao remover fallback de cores;
- validar captura apos mudanca visual na arvore.

---

### 8.3 Limite de tamanho

A exportacao possui limite de seguranca para evitar canvas grande demais.

Regra atual:

```txt
limite estimado: 12.000.000 pixels
```

Se o usuario selecionar area muito grande:

- exibir erro amigavel;
- orientar selecao menor;
- nao travar a pagina.

---

## 9. Regras por view da arvore

### Minha Arvore

- Exporta apenas a area visivel selecionada.
- Deve preservar layout direto e grupos familiares.
- Labels e group boxes podem aparecer se estiverem dentro da selecao.
- Painel lateral nao deve aparecer.

### Genealogia

- Exporta apenas a area visivel selecionada.
- Como a arvore pode ser verticalmente longa, o usuario deve pan/arrastar ate a regiao desejada antes de selecionar.
- A exportacao nao deve tentar capturar automaticamente toda a altura.

### Visao Completa

- Exporta apenas a area visivel selecionada.
- A arvore completa pode ser maior que a viewport.
- Exportar toda a arvore fica pos-MVP.

---

## 10. QA obrigatorio

Apos alterar exportacao, arvore, ReactFlow, painel lateral ou legenda:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

QA manual minimo:

- abrir `/minha-arvore`;
- iniciar selecao de area;
- cancelar por botao;
- iniciar selecao novamente;
- cancelar por `Esc`;
- selecionar area valida;
- exportar PNG pelo botao Salvar PNG;
- exportar PDF pelo botao Salvar PDF;
- imprimir;
- testar selecao pequena demais;
- testar com painel lateral aberto;
- testar com painel lateral recolhido;
- testar em Genealogia;
- testar em Visao Completa;
- confirmar que pan/zoom voltam apos cancelar/concluir;
- confirmar que legenda/overlay/menus nao aparecem na exportacao.

Larguras recomendadas:

- desktop;
- 768px;
- 430px;
- 390px;
- 375px;
- 320px.

---

## 11. Troubleshooting

### Exportacao falha com imagem externa

Causa provavel:

- imagem sem CORS;
- avatar externo;
- arquivo remoto sem headers adequados.

Correcao:

- validar origem da imagem;
- preferir arquivos servidos por Storage com politica compativel;
- manter `useCORS: true`;
- nao usar `allowTaint: true` sem revisao.

---

### Controles aparecem no PNG/PDF

Causa provavel:

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

### Selecao nao bloqueia pan

Causa provavel:

- eventos propagando para ReactFlow;
- overlay sem interceptar `mousedown`, `mousemove` ou `click`;
- estado de selecao nao repassado ao `FamilyTree`.

Correcao:

- revisar `TreeAreaSelectionOverlay`;
- revisar bloqueio de pan/zoom em `FamilyTree`;
- confirmar `stopPropagation` nos pontos necessarios.

---

### PDF fica cortado

Causa provavel:

- selecao muito grande;
- proporcao incompativel;
- escala do canvas;
- limite de pagina.

Correcao:

- testar selecao menor;
- revisar geracao em `exportCanvasAsPdf`;
- validar orientacao e proporcao.

---

### Impressao abre em branco

Causa provavel:

- janela de impressao bloqueada;
- canvas nao carregou a tempo;
- erro de CORS;
- browser bloqueou popup.

Correcao:

- revisar `openTreePrintWindow`;
- garantir que canvas foi criado antes de chamar print;
- testar em outro navegador.

---

## 12. Pos-MVP

Possiveis evolucoes:

- exportar arvore completa;
- exportar arvore completa com escala automatica;
- exportar ramo especifico;
- exportar por geracao;
- exportar com legenda embutida opcional;
- exportar com titulo e metadados;
- exportar com data/hora e nome da pessoa central;
- salvar exportacoes no Storage;
- criar historico de exportacoes;
- gerar PDF multipagina;
- gerar SVG/vetor.

Esses itens nao bloqueiam o MVP.

---

## 13. Regras de manutencao

Nao fazer:

- salvar exportacao automaticamente no banco;
- criar migration para ajuste visual de exportacao;
- capturar painel lateral junto com a arvore;
- capturar overlay de selecao;
- remover protecao contra canvas grande;
- remover tratamento de erro de CORS;
- alterar viewport da arvore para resolver bug de exportacao sem validar UX;
- confundir exportacao da area visivel com exportacao da arvore completa.

Fazer:

- manter exportacao isolada em componentes/utils da arvore;
- manter mensagens de erro compreensiveis;
- testar em todas as views;
- preservar compatibilidade com mobile/tablet;
- documentar qualquer mudanca de escopo neste arquivo.
