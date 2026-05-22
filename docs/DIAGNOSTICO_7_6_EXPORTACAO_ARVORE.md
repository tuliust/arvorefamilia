# Diagnóstico e consolidação 7.6 — Exportação de área da árvore

## Status atual

Status: **concluído no escopo MVP**.

A frente 7.6 foi executada em três etapas:

- **7.6A — Diagnóstico técnico inicial**;
- **7.6B — Implementação da seleção/exportação de área visível**;
- **7.6C — QA técnico/visual e refinamento pontual**.

A funcionalidade atual permite selecionar uma área visível da árvore e exportar essa seleção como PNG, PDF ou impressão.

A exportação permanece limitada à **viewport visível atual da `.react-flow`**. A exportação da árvore completa fica como evolução pós-MVP.

Consolidação atual: seleção de área, PNG, PDF e impressão estão concluídos no escopo atual; árvore completa permanece fora do MVP.

---

## 1. Histórico da frente

### 1.1 7.6A — Diagnóstico técnico

Data original: 2026-05-15.

O diagnóstico inicial confirmou que, naquele momento, ainda não existiam modo **Selecionar área**, overlay de seleção por retângulo, estado de área selecionada, crop de canvas, captura parcial por retângulo nem fluxo de cancelamento da seleção.

Também foi identificado que já havia uma base parcial de exportação da visualização atual com `html2canvas`, `jspdf`, ações imperativas em `FamilyTree`, botões no painel de Informações e captura baseada na `.react-flow`.

---

## 2. 7.6B — Implementação concluída

Arquivos principais:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/pages/Home.tsx
```

Comportamento implementado:

- iniciar modo de seleção pelo botão **Selecionar área** no painel **Informações da árvore**;
- desenhar retângulo sobre a área visível da árvore;
- cancelar seleção por botão;
- cancelar seleção com `Esc`;
- exportar a área selecionada como PNG;
- exportar a área selecionada como PDF;
- imprimir a área selecionada;
- bloquear pan/zoom enquanto a seleção está ativa;
- restaurar pan/zoom ao cancelar ou concluir exportação.

`FamilyTreeActions` expõe:

```txt
startAreaSelection
```

---

## 3. Overlay e utilitário de exportação

### 3.1 `TreeAreaSelectionOverlay`

Arquivo:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
```

Responsabilidades:

- capturar pointer events;
- desenhar e normalizar o retângulo;
- validar tamanho mínimo;
- mostrar toolbar contextual;
- permitir PNG/PDF/impressão;
- cancelar por botão ou `Esc`;
- exibir erros amigáveis;
- fechar após exportação bem-sucedida.

### 3.2 `treeExport.ts`

Arquivo:

```txt
src/app/components/FamilyTree/utils/treeExport.ts
```

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
Minha Árvore
Genealogia
Visão Completa
```

Formatos suportados:

```txt
PNG
PDF
Impressão
```

A seleção usa coordenadas relativas ao elemento `.react-flow`.

O crop converte CSS pixels para canvas pixels usando:

```txt
canvas.width / targetRect.width
canvas.height / targetRect.height
```

---

## 5. 7.6C — QA e refinamento concluídos

Documento complementar:

```txt
docs/QA_7_6_EXPORTACAO_ARVORE.md
```

Bugs corrigidos:

- modo de seleção permanecia aberto após exportação concluída;
- pan/zoom continuavam bloqueados após exportar;
- `releasePointerCapture` podia falhar se a captura já tivesse sido liberada;
- `ignoreElements` não cobria descendentes de controles ReactFlow/minimap;
- seleções muito grandes não tinham limite preventivo amigável.

Correções aplicadas:

- fechamento automático do overlay após PNG/PDF/impressão concluída;
- guarda com `hasPointerCapture`;
- `try/catch` em `releasePointerCapture`;
- `ignoreElements` usando `closest`;
- limite simples de área final estimada antes da captura.

---

## 6. Banco, Storage e permissões

A frente 7.6 não exigiu migration, alteração de schema Supabase, alteração de RLS, `supabase db push`, Storage, persistência de PNG/PDF nem logs persistidos.

A exportação atua apenas sobre a visualização que o usuário já consegue ver.

---

## 7. Limitações atuais

Limitações aceitas no MVP:

- exportação limitada à viewport visível;
- exportação da árvore completa não implementada;
- redução automática de escala para seleções grandes não implementada;
- imagens externas sem CORS podem gerar falha de canvas;
- QA visual amplo em múltiplos navegadores fica para monitoramento pós-MVP;
- experiência touch deve continuar sendo observada em uso real.

---

## 8. Pós-MVP

Evoluções futuras possíveis:

- exportar árvore completa;
- exportar por ramo/família;
- permitir seleção fora da viewport visível;
- reduzir escala automaticamente para seleções grandes;
- salvar exportações no Storage;
- registrar logs/auditoria de exportação;
- opções de margem/orientação/tamanho de PDF;
- preset de exportação por view.

---

## 9. Checklist de regressão

Após alterações em árvore, exportação, ReactFlow ou painel lateral, validar:

```bash
npm run build
npm test
git diff --check
```

E testar manualmente:

- abrir Minha Árvore;
- abrir Genealogia;
- abrir Visão Completa;
- abrir painel Informações;
- clicar em Selecionar área;
- cancelar com botão;
- cancelar com `Esc`;
- selecionar área pequena;
- selecionar área válida;
- exportar PNG;
- exportar PDF;
- imprimir;
- confirmar que pan/zoom voltam;
- confirmar que clique em pessoa funciona após fechar overlay;
- confirmar que modal de casamento funciona fora do modo de seleção;
- confirmar que overlay/menus/filtros/sidebar não aparecem no arquivo exportado.
