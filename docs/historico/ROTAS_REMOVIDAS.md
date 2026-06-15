# Rotas removidas — histórico

> Última revisão: 2026-06-14
> Local canônico: `docs/historico/ROTAS_REMOVIDAS.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: documentação histórica e preventiva.
> Status: criado para registrar rotas antigas da árvore e evitar reativação acidental.

---

## 1. Objetivo

Este documento registra o histórico das rotas antigas da árvore familiar que foram removidas do produto ativo.

Ele existe para:

- preservar contexto de navegação legado;
- evitar que rotas antigas sejam restauradas por engano;
- diferenciar termos históricos de rotas vigentes;
- orientar auditorias em documentação, favoritos, busca global e navegação;
- indicar os documentos canônicos que substituem o comportamento antigo.

Este arquivo é histórico e preventivo. Ele não define o roteamento vigente.

Fonte atual de rotas e guards:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

Fonte atual das views da árvore:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

## 2. Regra principal

As rotas abaixo não são views ativas da árvore:

```txt
/minha-arvore
/genealogia
/visao-completa
```

As views oficiais atuais são:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

preservando `location.search`, inclusive parâmetros como `?pessoa=...`.

---

## 3. Tabela de substituição

| Rota antiga | Substituição atual | Status |
|---|---|---|
| `/minha-arvore` | `/mapa-familiar` | Removida como view ativa. |
| `/genealogia` | `/mapa-familiar-horizontal` | Removida como rota ativa; o termo pode permanecer como conceito textual. |
| `/visao-completa` | `/mapa-familiar-horizontal` | Removida como view ativa; não deve ser fallback da horizontal. |

Observação:

```txt
Substituição atual não significa redirect automático obrigatório.
Significa o destino funcional/documental que assumiu o papel daquela view.
```

---

## 4. Exceção vigente: `/minha-arvore/editar`

A rota abaixo permanece vigente:

```txt
/minha-arvore/editar
```

Ela pertence ao fluxo de edição de dados do membro e deve continuar protegida por `MemberRoute`.

Ela não é a antiga view `/minha-arvore`.

Regras:

- não remover `/minha-arvore/editar` por busca superficial de `/minha-arvore`;
- não usar `/minha-arvore/editar` como prova de que `/minha-arvore` voltou;
- não transformar `/minha-arvore/editar` em view de árvore;
- manter a distinção clara em rotas, favoritos, busca e documentação.

---

## 5. Termos históricos permitidos

Os termos abaixo podem aparecer como texto, keyword, rótulo histórico ou explicação:

```txt
minha árvore
genealogia
visão completa
```

Uso permitido:

| Uso | Exemplo permitido |
|---|---|
| Keyword de busca | `genealogia` apontando para `/mapa-familiar-horizontal`. |
| Texto conceitual | “mapa genealógico” como explicação da horizontal. |
| Histórico | Documento em `docs/historico/`. |
| Referência de migração | Tabela indicando rota antiga e rota atual equivalente. |

Uso proibido:

| Uso | Exemplo proibido |
|---|---|
| Rota ativa | `/genealogia` renderizando árvore. |
| Alias silencioso | `/visao-completa` abrindo horizontal sem decisão explícita. |
| Fallback de perfil | `?voltar=/minha-arvore`. |
| Favorito ativo | item de favorito apontando para `/minha-arvore`. |
| Botão de UI | botão Horizontal navegando para `/visao-completa`. |

Regra:

```txt
Keyword antiga não reativa rota antiga.
```

---

## 6. Histórico por rota

### 6.1 `/minha-arvore`

Função histórica:

- representava uma view direta da árvore;
- tinha associação com uma experiência anterior de visualização;
- passou a conflitar com a nomenclatura atual da view principal.

Estado atual:

- removida como view ativa;
- substituída funcionalmente por `/mapa-familiar`;
- não deve ser restaurada como alias;
- `/minha-arvore/editar` permanece como exceção de edição.

Documento funcional atual:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

### 6.2 `/genealogia`

Função histórica:

- representava uma visualização genealógica por gerações;
- podia estar associada a implementação ou nomenclatura anterior.

Estado atual:

- removida como rota ativa;
- substituída funcionalmente por `/mapa-familiar-horizontal`;
- “genealogia” pode permanecer como conceito textual;
- o título funcional/exportável vigente é `Mapa Genealógico`.

Documento funcional atual:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

### 6.3 `/visao-completa`

Função histórica:

- representava uma visualização ampliada/completa;
- podia servir como variação da experiência horizontal anterior.

Estado atual:

- removida como view ativa;
- não deve ser fallback da horizontal;
- não deve ser reativada como rota experimental;
- substituída funcionalmente por `/mapa-familiar-horizontal`.

Documento funcional atual:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

## 7. Anti-regressão

Não restaurar:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Não recriar estes padrões:

- `/` redirecionando para `/minha-arvore`;
- `TreeViewMode` contendo `minha-arvore`, `genealogia` ou `visao-completa`;
- `PATH_TO_VIEW_MODE` aceitando rotas antigas como views oficiais;
- botão Horizontal apontando para `/genealogia` ou `/visao-completa`;
- favoritos apontando para rotas removidas;
- busca global retornando rotas removidas como destino;
- perfil usando `/minha-arvore` como fallback de retorno;
- documentação canônica tratando rotas antigas como vigentes;
- testes E2E validando rotas antigas como sucesso.

Exceção permitida:

```txt
/minha-arvore/editar
```

---

## 8. Quando consultar este documento

Consulte este documento antes de:

- alterar `src/app/routes.tsx`;
- alterar `treeViewMode.ts`;
- revisar favoritos ou busca global;
- mexer em retorno de perfil;
- mover documentação histórica;
- reescrever `docs/README.md`;
- fazer limpeza de ocorrências de `/minha-arvore`, `/genealogia` ou `/visao-completa`;
- interpretar resultados de `rg` que encontrem rotas antigas.

Se a dúvida for sobre roteamento vigente, consulte primeiro:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

Se a dúvida for sobre comportamento das views atuais, consulte:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Se a dúvida for sobre validação manual, consulte:

```txt
docs/QA_MANUAL.md
```

---

## 9. Buscas úteis

```bash
rg "/minha-arvore|/genealogia|/visao-completa" docs src tests
rg "TreeViewMode|PATH_TO_VIEW_MODE|VIEW_MODE_TO_PATH" src docs
rg "minha árvore|genealogia|visão completa" docs src
```

Interpretação:

- ocorrência em `docs/historico/` pode ser legítima;
- ocorrência de `/minha-arvore/editar` pode ser legítima;
- ocorrência como keyword pode ser legítima se apontar para rota atual;
- ocorrência como rota renderizável ativa deve ser tratada como suspeita.

---

## 10. Documentos relacionados

| Documento | Papel |
|---|---|
| `docs/README.md` | Índice canônico da documentação. |
| `docs/arquitetura/ROTAS_E_GUARDS.md` | Contrato vigente de rotas e guards. |
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | Comportamento das duas views oficiais da árvore. |
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | Regras que não podem regredir. |
| `docs/QA_MANUAL.md` | Roteiros de validação manual. |
| `docs/historico/README.md` | Índice histórico da documentação. |

---

## 11. Critério para alterar este documento

Atualize este documento quando:

- uma rota antiga for oficialmente removida, arquivada ou substituída;
- uma rota histórica passar a ter novo destino funcional documentado;
- houver mudança formal em `TreeViewMode`;
- `ROTAS_E_GUARDS.md` mudar a política de aliases, redirects ou fallback;
- um documento histórico for criado, movido ou consolidado.

Não atualize este documento para mudanças puramente visuais em cards, conectores, paletas ou exportação.
