# Exportação da árvore

> Última revisão: 2026-06-08  
> Local canônico: `docs/funcionalidades/EXPORTACAO_ARVORE.md`  
> Tipo: documentação funcional e técnica da exportação da árvore.  
> Status: revisado para distinguir exportação por seleção/overlay e controles mobile.

---

## 1. Objetivo

A exportação permite gerar imagem, PDF ou impressão a partir da árvore exibida no ReactFlow.

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
- visibilidade restrita às rotas de árvore.

Fora do escopo atual:

- exportar automaticamente a árvore completa;
- exportar árvore completa com escala automática;
- exportação server-side;
- salvar exportações no Supabase Storage;
- histórico de exportações;
- exportação SVG/vetorial;
- PDF multipágina automático.

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
- a captura mobile deve evitar menus/overlays sempre que tecnicamente possível;
- divergências entre captura mobile e `treeExport.ts` devem ser tratadas como pendência técnica.

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
- usar captura direta da área da árvore quando acionado no mobile;
- ocultar visualmente controles mobile concorrentes;
- permitir ocultar/exibir setas de navegação.

Cuidados:

- validar se o comportamento deve continuar independente ou ser refatorado para reutilizar `treeExport.ts`;
- manter o portal restrito a mobile e rotas de árvore;
- evitar captura de botões, menus, paletas ou overlays;
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

Se o fluxo mobile usar configuração diferente, registrar no plano:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

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

## 11. Pendências conhecidas

Registrar em `docs/PLANO_PROXIMOS_PASSOS.md` se confirmado:

```txt
DOC-004
Confirmar se o fluxo mobile de exportação pelo MobileTreeControlsPortal deve reutilizar integralmente treeExport.ts ou manter captura própria. Validar política de CORS, allowTaint e consistência entre desktop e mobile.
```

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
- deixar o painel mobile aparecer em páginas fora da árvore.

Onde documentar mudanças futuras:

| Mudança | Documento |
|---|---|
| Exportação de árvore completa | `docs/PLANO_PROXIMOS_PASSOS.md` e depois este arquivo |
| Mudança em `treeExport.ts` | Este arquivo + `GUIA_COMPONENTES.md` |
| Mudança visual dos controles | `GUIA_UX_LAYOUT.md` |
| Bug de captura/CORS | `GUIA_CORRECAO_ERROS.md` |
| Upload/histórico de exportações | `docs/operacao/STORAGE_MAINTENANCE.md` e migration específica |
