# Exportação da árvore

> Última revisão: 2026-06-08  
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`  
> Tipo: documentação funcional e técnica da exportação da área visível da árvore.

---

## 1. Objetivo

A exportação permite gerar PNG, PDF ou impressão a partir de uma área visível da árvore.

O escopo atual é **exportar a área visível/selecionada**, não a árvore completa.

---

## 2. Arquivos principais

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/types.ts
src/app/pages/Home.tsx
```

Documentos relacionados:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
```

---

## 3. Escopo atual

Implementado:

- seleção retangular de área visível;
- exportação PNG;
- exportação PDF;
- impressão;
- cancelamento por botão;
- cancelamento por `Esc`;
- seleção mínima de `80 x 80px`;
- limite estimado de 12.000.000 pixels;
- bloqueio de pan/zoom durante seleção;
- exclusão de controles/overlays/legendas da captura;
- mensagens de erro amigáveis.

Fora do escopo atual:

- exportar automaticamente a árvore completa;
- exportar árvore completa com escala automática;
- exportação server-side;
- salvar exportações no Supabase Storage;
- histórico de exportações;
- exportação SVG/vetorial;
- PDF multipágina automático.

---

## 4. Componentes

### `FamilyTree.tsx`

Responsabilidades:

- expor ações por ref;
- iniciar seleção de área;
- bloquear interações durante seleção;
- renderizar `TreeAreaSelectionOverlay`;
- fornecer elemento alvo para captura;
- manter viewport/filtros após cancelar ou concluir.

Ações expostas:

```txt
zoomIn
zoomOut
print
savePdf
saveImage
startAreaSelection
```

### `TreeAreaSelectionOverlay.tsx`

Responsabilidades:

- capturar arraste de seleção;
- validar área mínima;
- exibir instrução;
- exibir toolbar contextual;
- exportar PNG/PDF/impressão;
- cancelar por botão ou `Esc`;
- fechar após sucesso;
- exibir erro local se a exportação falhar.

Texto atual:

```txt
Arraste para selecionar uma área visível da árvore.
```

Ações atuais:

```txt
Salvar PNG
Salvar PDF
Imprimir
Cancelar
```

### `treeExport.ts`

Responsabilidades:

- montar nome de arquivo;
- capturar elemento com `html2canvas`;
- recortar canvas;
- baixar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- ignorar elementos de UI não exportáveis.

---

## 5. Fluxo de uso

```txt
Usuário abre a árvore
Usuário escolhe ação de exportação/seleção
Overlay aparece sobre a árvore
Usuário arrasta uma área visível
Toolbar aparece
Usuário escolhe PNG, PDF ou Imprimir
Sistema captura a área
Sistema baixa arquivo ou abre impressão
Overlay fecha após sucesso
```

Cancelamento:

```txt
Cancelar ou Esc
-> overlay fecha
-> pan/zoom voltam ao normal
-> filtros, view e pessoa central são preservados
```

---

## 6. Regras de interação

Durante a seleção:

- pan bloqueado;
- zoom bloqueado;
- clique em pessoa bloqueado;
- clique em casamento bloqueado;
- menus contextuais não abrem;
- eventos do overlay não propagam para ReactFlow.

Após concluir/cancelar:

- árvore mantém a mesma view;
- filtros não são alterados;
- pessoa central não muda;
- pan/zoom voltam ao comportamento normal.

---

## 7. Elementos ignorados

Seletores relevantes:

```txt
.react-flow__controls
.react-flow__minimap
[data-tree-node-menu="true"]
[data-tree-selection-overlay="true"]
[data-tree-legend="true"]
```

Regras:

- controles de zoom não devem aparecer;
- menu de node não deve aparecer;
- overlay de seleção não deve aparecer;
- legenda marcada com `data-tree-legend="true"` não deve aparecer;
- novos overlays/menus devem receber seletor de ignore.

---

## 8. Restrições técnicas

### CORS

A captura usa `html2canvas`.

Configurações esperadas:

```txt
useCORS: true
allowTaint: false
```

Não resolver erro de CORS com `allowTaint: true` sem revisão técnica.

### Cores

Manter sanitização/fallback de cores não suportadas por `html2canvas`.

### Tamanho

Limite estimado:

```txt
12.000.000 pixels
```

Se a seleção exceder o limite:

- mostrar erro amigável;
- orientar seleção menor;
- não travar a página.

---

## 9. Regras por view

| View | Regra |
|---|---|
| `/minha-arvore` | Exporta apenas área visível selecionada. |
| `/genealogia` | Exporta área visível; usuário deve navegar até a região desejada. |
| `/visao-completa` | Exporta área visível; árvore completa é pós-MVP. |

---

## 10. QA

### Técnico

```bash
npm run build
git diff --check
git status --short
```

### Manual

- abrir `/minha-arvore`;
- iniciar seleção;
- cancelar por botão;
- iniciar seleção;
- cancelar por `Esc`;
- selecionar área válida;
- salvar PNG;
- salvar PDF;
- imprimir;
- testar seleção pequena demais;
- testar área grande demais;
- testar com painel lateral aberto;
- testar com painel lateral recolhido;
- testar em `/genealogia`;
- testar em `/visao-completa`;
- confirmar que overlays/controles não aparecem na captura;
- confirmar que pan/zoom voltam após finalizar.

Larguras úteis:

```txt
320px
375px
390px
430px
768px
desktop
```

---

## 11. Troubleshooting

### Exportação falha com imagem externa

Possíveis causas:

- imagem sem CORS;
- avatar externo;
- arquivo remoto sem headers adequados.

Verificar origem da imagem e Storage.

### Controles aparecem no PNG/PDF

Verificar:

```txt
getDefaultTreeExportIgnoreElements
data-tree-selection-overlay
data-tree-legend
data-tree-node-menu
```

### Seleção não bloqueia pan

Verificar propagação de eventos no overlay e props repassadas ao ReactFlow.

### PDF cortado

Verificar proporção, tamanho da seleção e `exportCanvasAsPdf`.

### Impressão abre em branco

Verificar popup bloqueado, `openTreePrintWindow`, carregamento do canvas e CORS.

---

## 12. Pós-MVP

- exportar árvore completa;
- exportar ramo específico;
- exportar por geração;
- incluir legenda opcional;
- incluir título/metadados;
- salvar no Storage;
- histórico de exportações;
- PDF multipágina;
- SVG/vetor.

---

## 13. Anti-regressões

Não reintroduzir:

- confusão entre área visível e árvore completa;
- captura do painel lateral;
- captura do overlay de seleção;
- remoção do limite de canvas;
- `allowTaint: true` sem revisão;
- alteração de viewport para “corrigir” exportação sem QA visual;
- salvamento automático em banco/Storage sem decisão de produto.
