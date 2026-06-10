# Exportação da árvore

> Última revisão: 2026-06-10
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`
> Tipo: documentação funcional e técnica da exportação da árvore.
> Status: revisado com a limitação atual da exportação do Mapa Familiar HTML/CSS/SVG e a pendência de decisão sobre captura panorâmica.

---

## 1. Objetivo

A exportação permite gerar imagem, PDF ou impressão a partir das views da árvore suportadas pelo fluxo canônico de captura. No estado atual, o fluxo consolidado atende principalmente às views ReactFlow; a rota `/mapa-familiar`, por ser HTML/CSS/SVG e não ReactFlow, permanece documentada como limitação/pendência de decisão.

O escopo atual é:

```txt
Exportar a área visível/selecionada ou a captura disponível da árvore, não a árvore completa calculada server-side.
```

A exportação completa de toda a árvore, com escala automática integral, multipágina ou processamento server-side, permanece fora do escopo atual.

---

## 2. Arquivos principais

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/DesktopFamilyMapView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/components/FamilyTree/types.ts
src/app/pages/Home.tsx
src/main.tsx
src/styles/mobile-tree-controls.css
```

Documentos relacionados:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/historico/README.md
```

Observação: diagnósticos históricos individuais de exportação foram consolidados em `docs/historico/README.md`. Não referenciar arquivos históricos removidos como fonte viva.

---

## 3. Escopo atual

Implementado no fluxo principal:

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

Implementado no fluxo mobile rápido:

- painel mobile de controles da árvore;
- ação de imagem;
- ação de PDF;
- ação de impressão;
- acesso sem abrir overlay manual de seleção;
- captura usando o fluxo canônico de exportação em `treeExport.ts`;
- política segura de `html2canvas` com `useCORS: true` e `allowTaint: false`;
- visibilidade restrita às rotas de árvore.

Fora do escopo atual:

- exportar automaticamente a árvore completa;
- exportar árvore completa com escala automática;
- exportação server-side;
- salvar exportações no Supabase Storage;
- histórico de exportações;
- exportação SVG/vetorial;
- PDF multipágina automático.

### 3.1 Escopo da rota `/mapa-familiar`

A view **Mapa Familiar** usa `DesktopFamilyMapView.tsx`, cards HTML/CSS de `FamilyTreeVisualCards.tsx` e conectores SVG posicionados por âncoras.

No estado atual, ela **não deve ser documentada como plenamente coberta pela exportação canônica** da árvore ReactFlow.

Regra documental:

```txt
/minha-arvore, /genealogia e /visao-completa usam o fluxo canônico atual de exportação da árvore.
 /mapa-familiar exige decisão técnica específica antes de ser declarado exportável.
```

Motivo técnico:

- `DesktopFamilyMapView` não é canvas ReactFlow;
- os conectores são SVG absoluto;
- o layout possui escala responsiva e zoom manual por `Ctrl + scroll`;
- grupos laterais e grupos expansíveis alteram a altura/posição real da superfície;
- a exportação precisa decidir se captura a viewport visível, o canvas lógico completo ou uma área selecionada.

Pendência relacionada:

```txt
DOC-016 - decidir se a exportação canônica deve capturar a view HTML/SVG panorâmica do Mapa Familiar.
```

Enquanto essa decisão não for tomada, a UI não deve prometer exportação completa do Mapa Familiar.

---

## 4. Fluxos de exportação

### 4.1 Fluxo principal com seleção de área

Arquivos:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
```

Fluxo:

```txt
Usuário abre a árvore
Usuário escolhe seleção/exportação
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

### 4.2 Fluxo mobile rápido

Arquivos:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/styles/mobile-tree-controls.css
src/main.tsx
```

Fluxo:

```txt
Usuário abre /minha-arvore, /genealogia ou /visao-completa no mobile
Botão circular de controles aparece
Usuário abre o painel
Usuário escolhe PDF, Imagem ou Imprimir
Sistema captura a área disponível da árvore
Sistema baixa arquivo ou abre impressão
```

Regras:

- o portal mobile deve aparecer apenas nas rotas de árvore;
- não deve aparecer em páginas internas como `/minha-arvore/editar`, `/meus-favoritos` ou `/calendario-familiar`;
- o painel mobile não altera dados, filtros, permissões, Supabase ou migrations;
- a captura mobile deve reutilizar os utilitários canônicos de `treeExport.ts`;
- a captura mobile deve evitar menus/overlays sempre que tecnicamente possível;
- divergências futuras entre desktop e mobile devem ser tratadas como regressão, não como comportamento esperado.

---

## 5. Componentes

### 5.1 `FamilyTree.tsx`

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

### 5.2 `TreeAreaSelectionOverlay.tsx`

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

### 5.3 `treeExport.ts`

Responsabilidades:

- montar nome de arquivo;
- capturar elemento com `html2canvas`;
- recortar canvas;
- baixar PNG;
- gerar PDF;
- abrir janela de impressão;
- imprimir canvas;
- ignorar elementos de UI não exportáveis.

### 5.4 `MobileTreeControlsPortal.tsx`

Responsabilidades:

- renderizar painel mobile de ações da árvore;
- oferecer atalhos para PDF, imagem e impressão;
- usar captura direta da área da árvore quando acionado no mobile, passando pelo fluxo canônico de `treeExport.ts`;
- ocultar visualmente controles mobile concorrentes;
- permitir ocultar/exibir setas de navegação.

Cuidados:

- manter o portal restrito a mobile e rotas de árvore;
- preservar reutilização de `treeExport.ts` para PNG, PDF, impressão e captura segura;
- evitar captura de botões, menus, paletas ou overlays;
- não reintroduzir `allowTaint: true` no fluxo mobile;
- manter mensagens amigáveis quando a captura falhar.

---

## 6. Regras de interação

Durante a seleção pelo overlay:

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

No painel mobile rápido:

- pan/zoom da árvore permanecem como estão;
- a ação de exportar não deve modificar viewport;
- ocultar/exibir setas é apenas estado visual local/global de UI;
- falhas de exportação devem exibir aviso amigável.

---

## 7. Elementos ignorados na exportação

Seletores relevantes no fluxo principal:

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
- novos overlays/menus devem receber seletor de ignore;
- o painel `MobileTreeControlsPortal` não deve aparecer na captura final.

---

## 8. Restrições técnicas

### 8.1 CORS

A captura usa `html2canvas`.

Configurações esperadas para o fluxo canônico:

```txt
useCORS: true
allowTaint: false
```

Não resolver erro de CORS com `allowTaint: true` sem revisão técnica.

O fluxo mobile também deve respeitar essa política. Diferenças futuras devem ser registradas como regressão ou decisão técnica explícita em `docs/PLANO_PROXIMOS_PASSOS.md`.

### 8.2 Tamanho de canvas

Manter limite preventivo para evitar travamento do navegador em dispositivos móveis ou máquinas com pouca memória.

Referência atual:

```txt
12.000.000 pixels
```

### 8.3 PDF

Regras:

- respeitar proporção da área capturada;
- evitar esticar imagem;
- não prometer PDF multipágina automático;
- não prometer árvore completa em PDF no escopo atual.

### 8.4 Impressão

Regras:

- abrir fluxo de impressão com imagem capturada;
- exibir erro se popup/janela de impressão falhar;
- não depender de Storage;
- não salvar arquivo automaticamente no banco.

---

## 9. Acessibilidade e UX

Regras:

- ações de exportação devem ter texto ou `aria-label`;
- cancelar seleção deve ser possível por botão e `Esc`;
- mensagens devem ser compreensíveis;
- não exibir IDs técnicos;
- não bloquear a árvore após erro;
- em mobile, painel de controles deve ser fácil de fechar e não cobrir permanentemente a navegação principal.

---

## 10. QA recomendado

Validar desktop/tablet:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Validar mobile:

```txt
320px
375px
390px
430px
```

Checklist:

- seleção retangular aparece;
- cancelar por botão funciona;
- cancelar por `Esc` funciona;
- PNG baixa arquivo;
- PDF baixa arquivo;
- impressão abre janela/diálogo;
- seleção pequena demais mostra aviso;
- legenda/menus/overlays não aparecem na captura;
- painel mobile aparece apenas nas rotas da árvore;
- PDF/imagem/impressão do painel mobile não quebram a página;
- desktop/tablet não são afetados pelo portal mobile.

---

## 11. Estado documental

A pendência técnica anterior de alinhamento da exportação mobile foi encerrada: o `MobileTreeControlsPortal` deve permanecer integrado ao fluxo canônico de `treeExport.ts`.

Validações futuras continuam recomendadas em dispositivos móveis reais, especialmente para CORS de imagens, limites de canvas e comportamento de impressão, mas isso é QA de regressão, não decisão arquitetural aberta.

---

## 12. Anti-regressão

Não fazer:

- transformar exportação em upload automático;
- salvar imagem/PDF no Supabase sem nova frente;
- usar service role no frontend;
- aplicar migration por ajuste visual;
- exportar árvore completa dizendo que é apenas área visível;
- capturar dados privados ocultos por filtros/privacidade;
- deixar seleção de área bloquear pan/zoom após cancelamento;
- deixar o painel mobile aparecer em páginas fora da árvore;
- criar uma segunda implementação de exportação mobile divergente de `treeExport.ts`;
- usar `allowTaint: true` para contornar CORS sem revisão técnica.

Onde documentar mudanças futuras:

| Mudança | Documento |
|---|---|
| Exportação de árvore completa | `docs/PLANO_PROXIMOS_PASSOS.md` e depois este arquivo |
| Mudança em `treeExport.ts` | Este arquivo + `GUIA_COMPONENTES.md` |
| Mudança visual dos controles | `GUIA_UX_LAYOUT.md` |
| Bug de captura/CORS | `GUIA_CORRECAO_ERROS.md` |
| Upload/histórico de exportações | `docs/operacao/STORAGE_MAINTENANCE.md` e migration específica |

## 15. QA específico para Mapa Familiar

Se a exportação de `/mapa-familiar` for implementada futuramente, validar:

- captura com zoom manual em `1x`, menor que `1x` e maior que `1x`;
- captura com grupos laterais recolhidos e expandidos;
- captura com filtro **Cônjuges** desativado e ativado;
- captura preservando conectores SVG principais;
- captura preservando conectores internos de cônjuges;
- ausência de botões `+/-`, painel lateral, header, menu e overlays na imagem final;
- nomes com acentos sem corte;
- avatares por `genero` visíveis;
- limite de pixels em telas grandes;
- comportamento em 1366px, 1440px, 1536px e 1920px.

Anti-regressão:

```txt
Não adaptar a exportação do Mapa Familiar alterando o fluxo ReactFlow existente sem validar /minha-arvore, /genealogia e /visao-completa.
```
