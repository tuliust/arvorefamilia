# Regras de não regressão — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/REGRAS_DE_NAO_REGRESSAO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Baseline revisada: `main` em `833108f`  
> Status: checklist canônico para alterações futuras.

---

## 1. Objetivo

Este documento define regras e checklists para impedir regressões no projeto.

Use antes de:

- alterar rotas;
- alterar `TreeViewMode`;
- alterar a Home/árvore;
- alterar painel lateral/mobile;
- alterar exportação;
- alterar favoritos ou busca global;
- remover arquivos;
- limpar CSS;
- arquivar documentação;
- alterar guards ou permissões;
- mexer em migrations, Supabase ou dados sensíveis.

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

E QA visual manual.

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
```

Em ambiente Windows sem `rg`, usar:

```powershell
Select-String -Path .\src\**\*.*,.\docs\**\*.* -Pattern "minha-arvore|genealogia|visao-completa|Filtros|Legendas|Ações"
```

Interpretação permitida:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode aparecer como termo textual da horizontal;
- `docs/historico/` pode conter material legado;
- aliases antigos podem existir como keywords de busca/favoritos se apontarem para rotas atuais;
- não pode haver rota ativa, favorito, busca global ou modo ativo para as rotas removidas;
- a barra `Filtros | Legendas | Ações` não deve voltar como UI ativa.

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
- [ ] `?pessoa=...` continua focando/selecionando pessoa quando aplicável.

---

## 7. Regras de navegação e retorno

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
- [ ] `/minha-arvore` não é fallback de perfil.

---

## 8. Regras do painel

### Estado atual que deve funcionar

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
Modal mobile de controles
```

### Não deve voltar

```txt
barra Filtros | Legendas | Ações
activeSidebarPanel como contrato de produto
aba Legendas como UI persistente
aba Ações como UI persistente
```

Checklist:

- [ ] filtros continuam acessíveis sem aba;
- [ ] exportação continua funcionando;
- [ ] paletas continuam funcionando;
- [ ] destaque de linhas/cards/grupos continua funcionando;
- [ ] modal mobile abre e fecha corretamente;
- [ ] `Escape` fecha modal/overlay quando aplicável;
- [ ] scroll do body não fica travado no mobile;
- [ ] painel não aparece na exportação.

---

## 9. Regras de exportação

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
- [ ] overlay/loading não aparecem;
- [ ] SVGs dos cards não viram quadrados escuros;
- [ ] conectores aparecem;
- [ ] paleta ativa é respeitada;
- [ ] filtros ativos são respeitados;
- [ ] captura muito grande é bloqueada com mensagem clara.

---

## 10. Regras de favoritos

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

## 11. Regras de busca global

Checklist:

- [ ] busca por “mapa” retorna `Mapa Familiar`.
- [ ] busca por “horizontal” ou “genealogia” retorna `Mapa Familiar Horizontal`.
- [ ] busca por “minha árvore” não retorna `/minha-arvore` como rota ativa.
- [ ] busca por “visão completa” não retorna `/visao-completa` como rota ativa.
- [ ] busca por pessoas continua usando `buscarPessoas`.
- [ ] termos e privacidade podem aparecer como páginas públicas se estiverem no catálogo.

---

## 12. Regras de guards e segurança

Checklist:

- [ ] `TreeAccessRoute` protege `/`, `/mapa-familiar`, `/mapa-familiar-horizontal` e `/busca`.
- [ ] `MemberRoute` protege páginas de membro.
- [ ] `ProtectedRoute` protege `/admin/*`.
- [ ] usuário comum não acessa admin.
- [ ] UI escondida não é controle de permissão.
- [ ] RLS e services continuam sendo fonte de autorização.
- [ ] `.env`, `.env.local`, `.env*.save` e backups não são versionados.

---

## 13. Regras para remoção de arquivos

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

## 14. Regras de CSS

Checklist:

- [ ] CSS novo usa data attribute, rota ou container como escopo.
- [ ] Não há seletor global `svg path` sem escopo.
- [ ] `mobile-edit-profile.css` continua permitido para `/minha-arvore/editar`.
- [ ] `family-map-horizontal.css` não traz alias antigo `mapa-horizontal`.
- [ ] CSS ReactFlow legado só é removido em frente própria.
- [ ] painel mobile tem z-index acima de header/bottom nav.
- [ ] exportação oculta UI transitória.

---

## 15. Regras de documentação

Checklist:

- [ ] Docs canônicos refletem código atual.
- [ ] Docs históricos estão marcados como legado.
- [ ] `PLANO_PROXIMOS_PASSOS.md` contém pendências reais.
- [ ] Guias não dizem que as tabs antigas ainda existem.
- [ ] Guias não dizem que `TreeViewMode` tem mais de dois modos.
- [ ] Guias não tratam `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.

---

## 16. Checklist final antes de push

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
- docs atualizadas se comportamento mudou.
