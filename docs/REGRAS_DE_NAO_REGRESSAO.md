# Regras de não regressão — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/REGRAS_DE_NAO_REGRESSAO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: checklist canônico atualizado após ajustes de árvore, painel mobile, paletas, avatares, conectores e debug temporário.

---

## 1. Objetivo

Este documento define regras e checklists para impedir regressões no projeto.

Use antes de:

- alterar rotas;
- alterar `TreeViewMode`;
- alterar a Home/árvore;
- alterar painel desktop ou modal mobile;
- alterar paletas, conectores, cards ou avatares;
- alterar exportação;
- alterar favoritos ou busca global;
- remover arquivos;
- limpar CSS;
- arquivar documentação;
- alterar guards, permissões, Supabase ou dados sensíveis.

Regra principal:

```txt
A documentação canônica descreve o comportamento vigente. Documentação histórica não deve reabrir views, rotas ou padrões removidos.
```

---

## 2. Comandos mínimos antes de commit

Para mudanças relevantes:

```bash
npm run build
npm test
git diff --check
```

Para mudanças que afetem rotas, guards, árvore, mobile, exportação ou navegação:

```bash
npm run test:e2e
```

Para mudanças de CSS/layout:

```bash
npm run build
git diff --check
npm run test:e2e
```

Além dos comandos, mudanças visuais exigem QA manual em desktop e mobile.

---

## 3. Buscas obrigatórias

Antes de fechar qualquer limpeza relacionada à árvore:

```bash
rg "minha-arvore"
rg "genealogia"
rg "visao-completa"
rg "/minha-arvore|/genealogia|/visao-completa"
rg "TreeViewMode|treeViewMode"
rg "data-tree-route-view|data-export-view"
rg "Filtros|Legendas|Ações"
rg "MobileTreeControlsPortal"
rg "G1|G2|G3"
rg "teal-|cyan-|blue-|orange-|brown-"
```

Em ambiente Windows sem `rg`, usar:

```powershell
Select-String -Path .\src\**\*.*,.\docs\**\*.* -Pattern "minha-arvore|genealogia|visao-completa|Filtros|Legendas|Ações|MobileTreeControlsPortal|G1|G2|G3"
```

Interpretação permitida:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode aparecer como conceito textual da horizontal, mas não como rota ativa;
- `docs/historico/` pode conter material legado;
- aliases antigos podem existir como keywords de busca/favoritos se apontarem para rotas atuais;
- a barra `Filtros | Legendas | Ações` não deve voltar como UI ativa;
- classes Tailwind de cor podem existir em áreas fora da árvore, mas o mobile da árvore deve herdar tokens de paleta;
- `G1/G2/G3` deve ser substituído por `Ger 1/Ger 2/Ger 3` na UI vigente.

---

## 4. Regras de rotas

### Deve permanecer

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore/editar
/busca
/entrar
/termos
/privacidade
/meus-dados
/meus-vinculos
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum/*
/admin/*
```

### Não deve voltar como view ativa

```txt
/minha-arvore
/genealogia
/visao-completa
```

### Testes esperados

- `/` redireciona para `/mapa-familiar` ou para `/entrar` conforme autenticação/guard;
- `/?pessoa=abc` preserva `?pessoa=abc` no destino;
- `/mapa-familiar` é protegida;
- `/mapa-familiar-horizontal` é protegida;
- `/minha-arvore/editar` é protegida por `MemberRoute`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não são rotas válidas de árvore.

---

## 5. Regras de `TreeViewMode`

O tipo deve conter apenas:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Checklist:

- [ ] `VIEW_MODE_TO_PATH` contém só as duas rotas oficiais.
- [ ] `PATH_TO_VIEW_MODE` contém `/`, `/mapa-familiar`, `/mapa-familiar-horizontal`.
- [ ] fallback retorna `mapa-familiar`.
- [ ] nenhuma view antiga está no tipo.
- [ ] alternância Vertical/Horizontal preserva `location.search`.
- [ ] `?pessoa=...` não é removido na troca de view.

---

## 6. Regras da renderização da árvore

Matriz obrigatória:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Checklist:

- [ ] `/mapa-familiar` desktop renderiza mapa vertical.
- [ ] `/mapa-familiar` mobile renderiza `MobileFamilyTreeView`.
- [ ] `/mapa-familiar-horizontal` desktop renderiza horizontal completa.
- [ ] `/mapa-familiar-horizontal` mobile renderiza experiência por geração.
- [ ] horizontal mobile não usa barra `Paterno | Central | Materno`.
- [ ] horizontal mobile não usa scroll horizontal manual como navegação principal.
- [ ] horizontal mobile mostra botões `Ger 1`, `Ger 2`, `Ger 3` etc.
- [ ] horizontal mobile permite scroll vertical até cards e linhas conectoras visíveis.
- [ ] `?pessoa=...` continua focando/selecionando pessoa quando aplicável.

---

## 7. Títulos oficiais

Os títulos vigentes são:

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico` |

Regras:

- títulos da UI e da exportação devem seguir o mesmo contrato;
- “Genealogia” pode permanecer como conceito técnico/histórico, mas a nomenclatura da view vigente é `Mapa Genealógico`;
- não restaurar `Mapa Familiar Horizontal de...` nem `Genealogia de...` como título principal.

---

## 8. Regras de navegação e retorno

### Alternância vertical/horizontal

Exemplos esperados:

```txt
/mapa-familiar?pessoa=abc
→ /mapa-familiar-horizontal?pessoa=abc

/mapa-familiar-horizontal?pessoa=abc
→ /mapa-familiar?pessoa=abc
```

### Perfil

Checklist:

- [ ] abrir perfil a partir da vertical gera retorno para `/mapa-familiar`;
- [ ] abrir perfil a partir da horizontal gera retorno para `/mapa-familiar-horizontal`;
- [ ] retorno inválido cai em `/mapa-familiar`;
- [ ] `/minha-arvore` não é fallback de perfil;
- [ ] `?voltar=` não aceita rotas antigas como destino ativo.

---

## 9. Regras do painel desktop

### Deve funcionar no desktop/tablet

```txt
Zoom +
Zoom -
Restaurar/Fit
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros/grupos visíveis diretamente
Filtros de status
```

Checklist:

- [ ] filtros continuam acessíveis sem aba;
- [ ] exportação continua funcionando;
- [ ] paletas continuam funcionando;
- [ ] destaque de linhas/cards/grupos continua funcionando;
- [ ] painel não aparece na exportação;
- [ ] painel não corta controles em telas de baixa altura;
- [ ] flyout de Exportar não substitui o box principal de controles;
- [ ] `Exportar > Área` funciona como toggle de abrir/fechar seleção.

### Não deve voltar

```txt
barra Filtros | Legendas | Ações
activeSidebarPanel como contrato de produto
aba Legendas como UI persistente
aba Ações como UI persistente
```

---

## 10. Regras do modal mobile de controles

O modal mobile é uma versão específica e reduzida do painel. Ele não é uma réplica integral do desktop.

### Deve conter

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

### Não deve conter

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

### Contrato visual e funcional

- título: `Controles`;
- sem subtítulo `Visualização, cores...`;
- botão superior direito com ícone `X`;
- botões principais: `Cores`, `Grupos`, `Destacar`;
- `Grupos` abre/fecha os cards de grupos;
- cards de grupos não aparecem por padrão no modal mobile;
- filtros de status ficam sempre visíveis;
- filtros de status ficam em 4 colunas e uma linha quando houver espaço;
- overlay fecha o modal;
- `Escape` fecha quando disponível;
- body destrava ao fechar;
- modal não entra na exportação;
- modal fica acima de header, bottom nav e botões flutuantes.

Checklist:

- [ ] `/mapa-familiar` mobile abre o modal correto.
- [ ] `/mapa-familiar-horizontal` mobile abre o modal correto.
- [ ] botão `Grupos` aparece entre `Cores` e `Destacar`.
- [ ] grupos aparecem apenas após clicar em `Grupos`.
- [ ] filtros permanecem visíveis mesmo com grupos fechados.
- [ ] não há `Exportar`, `Zoom` ou `Restaurar` no modal mobile.

---

## 11. Regras de paletas

Paletas vigentes:

| Nome visual | Chave |
|---|---|
| Branca | `white` |
| Azul/Visual | `visual` |
| Laranja | `orange` |
| Marrom | `brown` |

Regra principal:

```txt
Desktop é a referência visual das paletas. Mobile deve herdar os mesmos tokens CSS do desktop.
```

Checklist:

- [ ] mobile não usa cores hardcoded como fonte da verdade dos cards;
- [ ] mobile não força `teal/cyan/blue/orange/brown` fora dos tokens de paleta;
- [ ] paletas afetam cards, bordas, textos, ícones, conectores, labels, canvas e exportação;
- [ ] conectores seguem `--tree-palette-edge-*`;
- [ ] cards seguem `--tree-palette-card-*`;
- [ ] fundo/canvas segue `--tree-palette-canvas-*`;
- [ ] nenhuma regra global `svg path` altera ícones ou conectores fora do escopo da árvore.

QA obrigatório:

- [ ] paleta Branca em desktop e mobile;
- [ ] paleta Azul em desktop e mobile;
- [ ] paleta Laranja em desktop e mobile;
- [ ] paleta Marrom em desktop e mobile.

---

## 12. Regras de cards e avatares

Contrato vigente:

| Caso | Renderização |
|---|---|
| Pessoa com foto | `foto_principal_url` |
| Pessoa sem foto | ícone `User` de `lucide-react` |
| Pet | ícone `PawPrint` de `lucide-react` |

Regras:

- não diferenciar avatar sem foto por gênero;
- não restaurar silhuetas homem/mulher/neutro como fallback padrão;
- ícones devem herdar contraste da paleta;
- SVGs internos dos cards não podem virar quadrados escuros na exportação;
- pets preservam iconografia própria.

Checklist:

- [ ] pessoa sem foto mostra `User` no desktop.
- [ ] pessoa sem foto mostra `User` no mobile.
- [ ] pet mostra `PawPrint` no desktop.
- [ ] pet mostra `PawPrint` no mobile.
- [ ] exportação preserva ícones corretamente.

---

## 13. Regras de conectores

### Vertical desktop

- conectores SVG por âncoras;
- conectores respeitam grupos visíveis;
- conectores recalculam com painel aberto/colapsado;
- conectores continuam coerentes com `Destacar > Grupos`.

### Vertical mobile

- conectores HTML/CSS devem alinhar com os eixos visuais de Pai/Mãe e ancestrais;
- desktop é a referência de hierarquia;
- mobile adapta escala, não inventa outra relação;
- correções por `top/translate` não devem mascarar erro estrutural.

### Horizontal desktop

- desktop é a referência estrutural da horizontal;
- cônjuges adjacentes;
- casal → gap → tronco → filhos;
- conectores conjugais dependem de relacionamento explícito;
- não inferir casamento por proximidade visual.

### Horizontal mobile

- deve ser um recorte/paginação responsiva da lógica desktop;
- uma geração por tela;
- botões `Ger X`;
- sem setas laterais como navegação principal;
- scroll vertical deve permitir visualizar cards e conectores abaixo do último card;
- não criar scroll horizontal manual;
- conectores devem usar SVG/geometry alinhados à geração ativa.

Checklist:

- [ ] conectores não invadem cards;
- [ ] conectores não são cortados antes do fim das linhas visíveis;
- [ ] conectores preservam paleta ativa;
- [ ] `Destacar > Linhas` afeta conectores de forma previsível;
- [ ] cônjuge sem relação explícita não recebe conector conjugal.

---

## 14. Regras de exportação

Testar em `/mapa-familiar`:

- [ ] Área → PNG;
- [ ] Área → PDF;
- [ ] Área → Imprimir;
- [ ] Imagem/PNG;
- [ ] PDF;
- [ ] Imprimir.

Testar em `/mapa-familiar-horizontal`:

- [ ] Área → PNG;
- [ ] Área → PDF;
- [ ] Área → Imprimir;
- [ ] Imagem/PNG;
- [ ] PDF;
- [ ] Imprimir.

Verificar:

- [ ] título aparece no canvas;
- [ ] painel não aparece na captura;
- [ ] header não aparece;
- [ ] bottom nav não aparece;
- [ ] modal mobile não aparece;
- [ ] overlay/loading não aparecem;
- [ ] debug `Visualizar como...` não aparece;
- [ ] SVGs dos cards não viram quadrados escuros;
- [ ] conectores aparecem;
- [ ] paleta ativa é respeitada;
- [ ] filtros ativos são respeitados;
- [ ] captura muito grande é bloqueada com mensagem clara.

---

## 15. Regras de debug temporário

Debug temporário previsto/implementável:

```txt
Visualizar como...
```

Objetivo:

```txt
Renderizar /mapa-familiar e /mapa-familiar-horizontal usando outra pessoa da tabela pessoas como referência central.
```

Regras:

- deve ser marcado com `data-tree-export-ignore="true"`;
- deve ser marcado com `data-tree-debug-viewer="true"` se existir no DOM;
- não deve navegar para `/pessoa/:id`;
- não deve alterar dados reais;
- não deve alterar `?pessoa=...` sem decisão explícita;
- deve recalcular layout/contagens após trocar a pessoa;
- deve ser removido, protegido por flag ou restrito a admin antes de produção pública, conforme decisão de produto.

Checklist:

- [ ] funciona em desktop;
- [ ] funciona em mobile;
- [ ] funciona em `/mapa-familiar`;
- [ ] funciona em `/mapa-familiar-horizontal`;
- [ ] não aparece na exportação;
- [ ] decisão final está registrada no plano de próximos passos.

---

## 16. Regras de favoritos

Páginas de árvore favoritáveis:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Checklist:

- [ ] `favoritePages.ts` contém as duas views oficiais.
- [ ] `globalSearchService.ts` contém as duas views oficiais.
- [ ] favoritos não apontam para rotas removidas.
- [ ] favorito de página usa rota canônica sem estado transitório.
- [ ] favorito não salva zoom, geração ativa, filtro ou query específica como contrato obrigatório.
- [ ] aliases antigos são keywords, não destinos.

---

## 17. Regras de busca global

Checklist:

- [ ] busca por “mapa” retorna `Mapa Familiar` ou `Árvore Familiar`, conforme microcopy vigente.
- [ ] busca por “horizontal”, “genealógico” ou “genealogia” retorna `Mapa Genealógico`.
- [ ] busca por “minha árvore” não retorna `/minha-arvore` como rota ativa.
- [ ] busca por “visão completa” não retorna `/visao-completa` como rota ativa.
- [ ] busca por pessoas continua usando `buscarPessoas`.
- [ ] termos e privacidade podem aparecer como páginas públicas se estiverem no catálogo.

---

## 18. Regras de guards e segurança

Checklist:

- [ ] `TreeAccessRoute` protege `/`, `/mapa-familiar`, `/mapa-familiar-horizontal` e `/busca`.
- [ ] `MemberRoute` protege páginas de membro.
- [ ] `ProtectedRoute` protege `/admin/*`.
- [ ] usuário comum não acessa admin.
- [ ] UI escondida não é controle de permissão.
- [ ] RLS e services continuam sendo fonte de autorização.
- [ ] `.env`, `.env.local`, `.env*.save` e backups não são versionados.

---

## 19. Regras para remoção de arquivos

Antes de remover:

```bash
rg "NomeDoArquivoSemExtensao"
rg "NomeDoComponente"
npm run build
npm test
npm run test:e2e
git diff --check
```

Remoção exige:

- sem import ativo;
- sem lazy import;
- sem contrato exportado;
- sem CSS dependente;
- sem teste dependente;
- sem uso em documentação canônica como vigente;
- decisão explícita se for legado técnico.

Arquivos já removidos não devem voltar sem nova justificativa:

```txt
GenealogyMobileStageTabs.tsx
GenealogyFilterGrid.tsx
CentralNotificacoes.tsx
ViewModeToggle.tsx
ImageWithFallback.tsx
relationshipResolverService.ts
```

---

## 20. Regras de CSS

Checklist:

- [ ] CSS novo usa data attribute, rota ou container como escopo.
- [ ] Não há seletor global `svg path` sem escopo.
- [ ] `mobile-edit-profile.css` continua permitido para `/minha-arvore/editar`.
- [ ] `family-map-horizontal.css` não traz alias antigo `mapa-horizontal` como contrato ativo.
- [ ] CSS ReactFlow legado só é removido em frente própria.
- [ ] painel mobile tem z-index acima de header/bottom nav.
- [ ] exportação oculta UI transitória.
- [ ] mobile de árvore não define paleta por classes fixas como fonte da verdade.
- [ ] seletores de paleta usam `data-family-map-*` ou root equivalente.

---

## 21. Regras de documentação

Checklist:

- [ ] Docs canônicos refletem código atual.
- [ ] Docs históricos estão marcados como legado.
- [ ] `PLANO_PROXIMOS_PASSOS.md` contém pendências reais.
- [ ] Guias não dizem que as tabs antigas ainda existem.
- [ ] Guias não dizem que `TreeViewMode` tem mais de dois modos.
- [ ] Guias não tratam `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.
- [ ] Guias registram desktop como referência de paletas.
- [ ] Guias registram mobile horizontal como adaptação da lógica desktop.
- [ ] Guias registram `Visualizar como...` como debug temporário, se implementado.

---

## 22. Checklist final antes de push

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```

Aceitação:

- build sem erro;
- unit tests passando;
- E2E passando;
- sem arquivos locais no status;
- sem `test-results/`, `backups/` ou `.env*.save` versionados;
- docs atualizadas se comportamento mudou;
- QA visual feito quando houve mudança de layout, paleta, mobile ou exportação.
