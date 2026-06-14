# Regras de não regressão — Árvore Família

> Local canônico sugerido: `docs/REGRAS_DE_NAO_REGRESSAO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: checklist canônico para alterações futuras  
> Escopo: rotas, árvore, painel, exportação, favoritos, busca, guards, docs e segurança

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
```

Interpretação permitida:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode aparecer como termo textual da horizontal;
- `docs/historico/` pode conter material legado;
- arquivos de documentação legada devem estar claramente marcados;
- não pode haver rota ativa, favorito, busca global ou modo ativo para as rotas removidas.

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
- [ ] alternância vertical/horizontal preserva `location.search`.

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

- [ ] abrir perfil a partir da vertical gera retorno para `/mapa-familiar`.
- [ ] abrir perfil a partir da horizontal gera retorno para `/mapa-familiar-horizontal`.
- [ ] retorno inválido cai em `/mapa-familiar`.
- [ ] `/minha-arvore` não é fallback de perfil.

---

## 8. Regras do painel

### Estado atual que deve funcionar

- Zoom +;
- Zoom -;
- Restaurar visualização;
- Vertical;
- Horizontal;
- Cores;
- Exportar;
- Destacar;
- Filtros;
- Legendas;
- Ações;
- modal mobile de controles.

### Próxima mudança planejada

Remover:

```txt
Filtros
Legendas
Ações
```

Mas preservar:

```txt
Zoom +
Zoom -
Restaurar/Fit
Vertical
Horizontal
Cores
Exportar
Destacar
filtros/grupos visíveis diretamente
modal mobile
```

Checklist após simplificação futura:

- [ ] filtros continuam acessíveis sem aba;
- [ ] exportação continua funcionando;
- [ ] paletas continuam funcionando;
- [ ] destaque de linhas/cards/grupos continua funcionando;
- [ ] modal mobile abre e fecha corretamente;
- [ ] `Escape` fecha modal/overlay quando aplicável;
- [ ] scroll do body não fica travado no mobile.

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

---

## 11. Regras de busca global

Checklist:

- [ ] busca por “mapa” retorna `Mapa Familiar`.
- [ ] busca por “horizontal” ou “genealogia” retorna `Mapa Familiar Horizontal`.
- [ ] busca não retorna `/minha-arvore`, `/genealogia` ou `/visao-completa` como páginas ativas.
- [ ] busca por pessoas continua usando `buscarPessoas`.
- [ ] termos e privacidade podem aparecer como páginas públicas se estiverem no catálogo.

---

## 12. Regras de guards e segurança

Checklist:

- [ ] `TreeAccessRoute` protege `/`, `/mapa-familiar`, `/mapa-familiar-horizontal` e `/busca`.
- [ ] `MemberRoute` protege páginas de membro.
- [ ] `ProtectedRoute` protege `/admin/*`.
- [ ] usuário comum não acessa admin.
- [ ] UI escondida não é usada como única barreira de segurança.
- [ ] RLS/RPC/services continuam aplicando permissões.
- [ ] ferramentas destrutivas exigem env flag e confirmação.

---

## 13. Regras para remover arquivos

Antes de remover qualquer arquivo:

```bash
rg "NomeDoArquivoSemExtensao"
rg "from ['\"].*NomeDoArquivo"
rg "import .*NomeDoArquivo"
npm run build
git diff --check
```

Se for componente da árvore:

```bash
npm run test:e2e
```

Não remover isoladamente:

```txt
FamilyTree.tsx
PersonNode.tsx
MarriageNode.tsx
GenealogySpouseEdge.tsx
directFamilyDistributedLayout.ts
genealogyColumnsLayout.ts
treeExport.ts
TreeAreaSelectionOverlay.tsx
```

Sem plano específico.

---

## 14. Regras para limpar CSS

Antes de remover CSS:

```bash
rg "nome-da-classe|data-attribute" src/app src/styles
```

Checklist:

- [ ] seletor não existe no DOM atual;
- [ ] seletor não é usado por exportação;
- [ ] seletor não é usado no mobile;
- [ ] seletor não pertence a `/minha-arvore/editar`;
- [ ] seletor não é compartilhado entre view oficial e legado;
- [ ] QA visual feito em desktop;
- [ ] QA visual feito em mobile;
- [ ] exportação testada se o CSS afetar árvore.

---

## 15. Regras para documentação

Ao alterar comportamento:

- [ ] atualizar `README.md` se afetar uso geral;
- [ ] atualizar `docs/README.md` se afetar índice/status;
- [ ] atualizar `ARCHITECTURE.md` se afetar arquitetura;
- [ ] atualizar `ROTAS_E_GUARDS.md` se afetar rotas;
- [ ] atualizar doc funcional correspondente;
- [ ] atualizar `BASELINE_PRODUTO_ATUAL.md` se afetar baseline;
- [ ] atualizar `DECISOES_ARQUITETURAIS.md` se houver decisão nova;
- [ ] atualizar `INVENTARIO_TECNICO.md` se mudar inventário;
- [ ] atualizar este arquivo se criar nova regra de validação.

Documentos legados devem ir para:

```txt
docs/historico/
```

com aviso claro de que não são fonte de verdade.

---

## 16. Regras de segurança e higiene do repositório

Nunca versionar:

```txt
.env.local
.env.* com segredo
service role keys
dumps reais
tokens
backups sensíveis
dist/
test-results/
node_modules/
```

Atenção especial:

- auditar `.env.local.save` se existir no repo;
- remover backups versionados depois de confirmar que não são necessários;
- rotacionar credenciais se segredo real tiver sido versionado;
- não colar segredo em issue, commit, prompt ou documentação.

---

## 17. Checklist manual desktop

- [ ] login/entrada;
- [ ] `/` resolve corretamente;
- [ ] `/mapa-familiar` carrega;
- [ ] `/mapa-familiar-horizontal` carrega;
- [ ] alternância Vertical/Horizontal preserva query;
- [ ] clique em pessoa abre perfil;
- [ ] voltar do perfil retorna à view correta;
- [ ] filtros funcionam;
- [ ] Cores funcionam;
- [ ] Exportar funciona;
- [ ] Destacar funciona;
- [ ] favoritos funcionam;
- [ ] busca global funciona;
- [ ] admin bloqueia usuário comum.

---

## 18. Checklist manual mobile

- [ ] `/mapa-familiar` renderiza mobile;
- [ ] `/mapa-familiar-horizontal` renderiza uma geração por tela;
- [ ] chips de geração funcionam;
- [ ] swipe lateral funciona na horizontal;
- [ ] scroll vertical da geração ativa funciona;
- [ ] botão de controles abre modal;
- [ ] modal fecha;
- [ ] bottom nav não cobre controles críticos;
- [ ] exportação não captura header/bottom nav;
- [ ] retorno de perfil funciona.

---

## 19. Checklist para commit

Antes do commit:

```bash
git status --short
npm run build
npm test
npm run test:e2e
git diff --check
```

Revisar:

- [ ] diff não inclui secrets;
- [ ] diff não inclui backups;
- [ ] docs atualizadas;
- [ ] testes atualizados;
- [ ] rotas antigas não reapareceram;
- [ ] `/minha-arvore/editar` preservada;
- [ ] exportação não quebrada;
- [ ] mobile não quebrado.

---

## 20. Mensagens de commit recomendadas

Rotas:

```bash
git commit -m "refactor: simplifica rotas da arvore"
```

Painel:

```bash
git commit -m "refactor: simplifica painel dos mapas familiares"
```

Docs:

```bash
git commit -m "docs: registra baseline atual do produto"
```

Testes:

```bash
git commit -m "test: atualiza smoke tests das rotas oficiais"
```

CSS:

```bash
git commit -m "style: remove seletores legados da arvore"
```

---

## 21. Regra final

Uma mudança só está pronta quando:

1. o código compila;
2. os testes relevantes passam;
3. a documentação canônica não contradiz o código;
4. a busca por rotas antigas foi interpretada;
5. não há segredo, backup ou artefato local no diff;
6. o comportamento mobile e exportação foram avaliados quando afetados.

