# Diagnostico e consolidacao 7.6 - Exportacao de area da arvore

## Status atual

Documento canonico atual da funcionalidade:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

Status: **concluido no escopo MVP**.

A frente 7.6 foi executada em tres etapas:

- **7.6A - Diagnostico tecnico inicial**;
- **7.6B - Implementacao da selecao/exportacao de area visivel**;
- **7.6C - QA tecnico/visual e refinamento pontual**.

A funcionalidade atual permite selecionar uma area visivel da arvore e exportar essa selecao como PNG, PDF ou impressao.

A exportacao permanece limitada a **viewport visivel atual da `.react-flow`**. A exportacao da arvore completa fica como evolucao pos-MVP.

Consolidacao atual: selecao de area, PNG, PDF e impressao estao concluidos no escopo atual; arvore completa permanece fora do MVP.

---

## 1. Historico da frente

### 1.1 7.6A - Diagnostico tecnico

Data original: 2026-05-15.

O diagnostico inicial confirmou que, naquele momento, ainda nao existiam modo **Selecionar area**, overlay de selecao por retangulo, estado de area selecionada, crop de canvas, captura parcial por retangulo nem fluxo de cancelamento da selecao.

Tambem foi identificado que ja havia uma base parcial de exportacao da visualizacao atual com `html2canvas`, `jspdf`, acoes imperativas em `FamilyTree`, botoes no painel de Informacoes e captura baseada na `.react-flow`.

---

## 2. 7.6B - Implementacao concluida

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/pages/Home.tsx
```

Comportamento implementado:

- iniciar modo de selecao pelo botao **Selecionar area** no painel **Informacoes da arvore**;
- desenhar retangulo sobre a area visivel da arvore;
- cancelar selecao por botao;
- cancelar selecao com `Esc`;
- exportar a area selecionada como PNG;
- exportar a area selecionada como PDF;
- imprimir a area selecionada;
- bloquear pan/zoom enquanto a selecao esta ativa;
- restaurar pan/zoom ao cancelar ou concluir exportacao.

`FamilyTreeActions` expoe:

```txt
startAreaSelection
```

---

## 3. Overlay e utilitario de exportacao

### 3.1 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidades:

- capturar pointer events;
- desenhar e normalizar o retangulo;
- validar tamanho minimo;
- mostrar toolbar contextual;
- permitir PNG/PDF/impressao;
- cancelar por botao ou `Esc`;
- exibir erros amigaveis;
- fechar apos exportacao bem-sucedida.

### 3.2 `treeExport.ts`

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

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

Elementos ignorados na captura:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

---

## 4. Escopo funcional atual

Views suportadas:

```txt
Minha Arvore
Genealogia
Visao Completa
```

Formatos suportados:

```txt
PNG
PDF
Impressao
```

A selecao usa coordenadas relativas ao elemento `.react-flow`.

O crop converte CSS pixels para canvas pixels usando:

```txt
canvas.width / targetRect.width
canvas.height / targetRect.height
```

---

## 5. 7.6C - QA e refinamento concluidos

Documento complementar:

```txt
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
```

Bugs corrigidos:

- modo de selecao permanecia aberto apos exportacao concluida;
- pan/zoom continuavam bloqueados apos exportar;
- `releasePointerCapture` podia falhar se a captura ja tivesse sido liberada;
- `ignoreElements` nao cobria descendentes de controles ReactFlow/minimap;
- selecoes muito grandes nao tinham limite preventivo amigavel.

Correcoes aplicadas:

- fechamento automatico do overlay apos PNG/PDF/impressao concluida;
- guarda com `hasPointerCapture`;
- `try/catch` em `releasePointerCapture`;
- `ignoreElements` usando `closest`;
- limite simples de area final estimada antes da captura.

---

## 6. Banco, Storage e permissoes

A frente 7.6 nao exigiu migration, alteracao de schema Supabase, alteracao de RLS, `supabase db push`, Storage, persistencia de PNG/PDF nem logs persistidos.

A exportacao atua apenas sobre a visualizacao que o usuario ja consegue ver.

---

## 7. Limitacoes atuais

Limitacoes aceitas no MVP:

- exportacao limitada a viewport visivel;
- exportacao da arvore completa nao implementada;
- reducao automatica de escala para selecoes grandes nao implementada;
- imagens externas sem CORS podem gerar falha de canvas;
- QA visual amplo em multiplos navegadores fica para monitoramento pos-MVP;
- experiencia touch deve continuar sendo observada em uso real.

---

## 8. Pos-MVP

Evolucoes futuras possiveis:

- exportar arvore completa;
- exportar por ramo/familia;
- permitir selecao fora da viewport visivel;
- reduzir escala automaticamente para selecoes grandes;
- salvar exportacoes no Storage;
- registrar logs/auditoria de exportacao;
- opcoes de margem/orientacao/tamanho de PDF;
- preset de exportacao por view.

---

## 9. Checklist de regressao

Apos alteracoes em arvore, exportacao, ReactFlow ou painel lateral, validar:

```bash
npm run build
npm test
git diff --check
```

E testar manualmente:

- abrir Minha Arvore;
- abrir Genealogia;
- abrir Visao Completa;
- abrir painel Informacoes;
- clicar em Selecionar area;
- cancelar com botao;
- cancelar com `Esc`;
- selecionar area pequena;
- selecionar area valida;
- exportar PNG pelo botao Salvar PNG;
- exportar PDF pelo botao Salvar PDF;
- imprimir;
- confirmar que pan/zoom voltam;
- confirmar que clique em pessoa funciona apos fechar overlay;
- confirmar que modal de casamento funciona fora do modo de selecao;
- confirmar que overlay/menus/filtros/sidebar nao aparecem no arquivo exportado.
