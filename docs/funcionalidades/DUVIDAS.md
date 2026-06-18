# Dúvidas / FAQ

> Última revisão: 2026-06-18  
> Local canônico: `docs/funcionalidades/DUVIDAS.md`  
> Tipo: documentação funcional, editorial, técnica e operacional do módulo **Dúvidas / FAQ**.  
> Status: página pública `/duvidas` implementada, conteúdo persistido no Supabase e área administrativa `/admin/duvidas` implementada.

---

## 1. Objetivo

O módulo **Dúvidas / FAQ** centraliza perguntas e respostas sobre navegação, cadastro, árvore familiar, vínculos, arquivos históricos, privacidade, notificações, calendário, fórum, favoritos, IA e demais áreas do produto **Árvore Família**.

A funcionalidade existe para:

- auxiliar usuários antes ou durante o primeiro acesso;
- reduzir dúvidas de navegação;
- explicar nomes de páginas e conceitos do produto;
- permitir busca por termos em perguntas, respostas, categorias, palavras-chave e página relacionada;
- exibir categorias em layout responsivo;
- carregar conteúdo publicado diretamente do Supabase;
- permitir edição de categorias, perguntas e respostas pelo painel administrativo;
- evitar novo deploy para ajustes editoriais simples.

---

## 2. Escopo implementado

Implementado:

- rota pública `/duvidas`;
- rota administrativa protegida `/admin/duvidas`;
- carregamento lazy das duas páginas em `src/app/routes.tsx`;
- leitura das tabelas `qa_categories` e `qa_items` via `qaService`;
- exibição pública apenas de categorias ativas;
- exibição pública apenas de perguntas publicadas;
- filtro local por categoria;
- busca local normalizada, com suporte a termos com ou sem acento;
- bloco de dúvidas frequentes com perguntas marcadas como destaque;
- accordion de perguntas e respostas;
- sidebar de categorias no desktop;
- chips horizontais de categorias no mobile;
- estados de carregamento, erro e resultado vazio;
- entrada da página **Dúvidas** na busca global do produto;
- listagem administrativa de categorias;
- criação e edição de categorias;
- ativação e desativação de categorias;
- listagem administrativa de perguntas/respostas;
- criação e edição de perguntas/respostas;
- alteração de status editorial para `draft`, `published` e `archived`;
- marcação de pergunta como destaque;
- filtros administrativos por categoria, status e busca textual;
- card **Dúvidas** no painel administrativo.

Não implementado nesta frente:

- reordenação por drag and drop;
- editor rich text ou markdown controlado;
- busca server-side por RPC;
- auditoria administrativa específica de alterações em QA;
- analytics de dúvidas mais acessadas;
- exclusão física de categorias ou perguntas pelo frontend.

Esses itens devem permanecer em **Pendências futuras** até haver código correspondente.

---

## 3. Arquivos principais

### 3.1 Página pública

```txt
src/app/pages/Duvidas.tsx
src/app/pages/duvidas/QAHero.tsx
src/app/pages/duvidas/QASearchBox.tsx
src/app/pages/duvidas/QACategorySidebar.tsx
src/app/pages/duvidas/QACategoryChips.tsx
src/app/pages/duvidas/QAAccordion.tsx
src/app/pages/duvidas/QAEmptyState.tsx
src/app/pages/duvidas/QAFeaturedQuestions.tsx
src/app/pages/duvidas/QAResultCount.tsx
```

### 3.2 Área administrativa

```txt
src/app/pages/admin/AdminDuvidas.tsx
src/app/pages/admin/AdminDashboard.tsx
```

### 3.3 Dados, tipos, rotas e busca global

```txt
src/app/services/qaService.ts
src/app/types/qa.ts
src/app/routes.tsx
src/app/services/globalSearchService.ts
src/app/utils/searchText.ts
```

### 3.4 Documentos relacionados

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

## 4. Rotas e proteção

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/duvidas` | `Duvidas.tsx` | Pública | Página pública de dúvidas e ajuda. |
| `/admin/duvidas` | `AdminDuvidas.tsx` | `ProtectedRoute` | Gestão administrativa de categorias, perguntas e respostas. |

Regras da rota pública:

- não usar `MemberRoute`;
- não usar `TreeAccessRoute`;
- não usar `ProtectedRoute`;
- permitir acesso antes do login;
- manter carregamento lazy;
- não expor dados familiares privados;
- não buscar dados de pessoas, relacionamentos, arquivos, notificações ou perfis.

Regras da rota administrativa:

- usar `ProtectedRoute`;
- depender das políticas de RLS do Supabase para escrita;
- não substituir segurança de banco por validação visual;
- permitir apenas operação editorial do módulo QA.

---

## 5. Modelo de dados

A funcionalidade depende de duas tabelas no Supabase:

```txt
public.qa_categories
public.qa_items
```

### 5.1 `qa_categories`

Representa categorias exibidas na página pública e gerenciadas no admin.

| Campo | Uso |
|---|---|
| `id` | Identificador da categoria. |
| `title` | Título completo exibido no desktop, cabeçalhos e admin. |
| `short_title` | Título curto usado preferencialmente em chips mobile. |
| `slug` | Identificador textual estável e único. |
| `description` | Descrição opcional da categoria. |
| `order_index` | Ordem de exibição. |
| `is_active` | Controla se a categoria aparece publicamente. |
| `created_by` | Usuário criador, quando disponível. |
| `updated_by` | Usuário responsável pela última alteração, quando disponível. |
| `created_at` | Data de criação. |
| `updated_at` | Data de atualização. |

Regra pública:

```txt
A página /duvidas só deve exibir qa_categories.is_active = true.
```

### 5.2 `qa_items`

Representa perguntas e respostas.

| Campo | Uso |
|---|---|
| `id` | Identificador da pergunta. |
| `category_id` | Categoria vinculada. |
| `question` | Pergunta exibida ao usuário. |
| `answer` | Resposta exibida no accordion. |
| `slug` | Identificador textual estável e único. |
| `keywords` | Lista de termos pesquisáveis. |
| `related_page_label` | Nome de página relacionada, quando houver. |
| `related_page_path` | Caminho interno relacionado, quando houver. |
| `is_featured` | Define se aparece no bloco de dúvidas frequentes. |
| `status` | Estado editorial da pergunta. |
| `order_index` | Ordem de exibição. |
| `published_at` | Data de publicação, quando houver. |
| `created_by` | Usuário criador, quando disponível. |
| `updated_by` | Usuário responsável pela última alteração, quando disponível. |
| `created_at` | Data de criação. |
| `updated_at` | Data de atualização. |

### 5.3 Status editoriais

Status aceitos em `qa_items`:

| Status | Aparece em `/duvidas`? | Uso |
|---|---:|---|
| `draft` | Não | Rascunho em preparação. |
| `published` | Sim | Conteúdo publicado. |
| `archived` | Não | Conteúdo retirado do ar sem exclusão física. |

Regra permanente:

```txt
A página pública só deve exibir qa_items.status = 'published'.
```

---

## 6. Service de dados

Arquivo:

```txt
src/app/services/qaService.ts
```

Responsabilidade geral:

```txt
Componentes não devem acessar Supabase diretamente quando houver função correspondente em qaService.ts.
```

### 6.1 Função pública

```txt
listPublishedQaContent()
```

Responsabilidades:

- consultar `qa_categories`;
- filtrar categorias com `is_active = true`;
- ordenar categorias por `order_index` e `title`;
- consultar `qa_items`;
- filtrar perguntas com `status = 'published'`;
- ordenar perguntas por `order_index` e `question`;
- mapear rows do Supabase para tipos TypeScript;
- remover perguntas vinculadas a categorias inativas;
- lançar erro controlado se categorias ou perguntas não puderem ser carregadas.

### 6.2 Funções administrativas

Funções vigentes:

```txt
adminListQaCategories()
adminCreateQaCategory(payload)
adminUpdateQaCategory(id, payload)
adminToggleQaCategory(id, isActive)
adminListQaItems()
adminCreateQaItem(payload)
adminUpdateQaItem(id, payload)
adminSetQaItemStatus(id, status)
```

Responsabilidades:

- listar todas as categorias, ativas e inativas;
- criar categoria;
- atualizar categoria;
- ativar ou desativar categoria;
- listar todas as perguntas, independentemente do status;
- criar pergunta;
- atualizar pergunta;
- publicar, arquivar ou mover pergunta para rascunho;
- normalizar `keywords`;
- normalizar `slug` recebido da UI;
- atualizar `published_at` quando uma pergunta é publicada;
- limpar `published_at` quando uma pergunta deixa de estar publicada.

### 6.3 Mapeamento defensivo

Regras vigentes:

- `short_title`, `description`, `related_page_label`, `related_page_path`, `published_at`, `created_by` e `updated_by` podem ser `null`;
- `keywords` deve sempre chegar ao frontend como array de strings;
- `order_index` deve ser convertido para número;
- `is_active` deve ser tratado como `true`, exceto quando vier explicitamente `false`;
- `is_featured` só é `true` quando o valor vier explicitamente `true`;
- status diferente de `draft` ou `archived` é normalizado como `published` no mapeamento atual.

---

## 7. Tipos TypeScript

Arquivo:

```txt
src/app/types/qa.ts
```

Tipos vigentes:

```txt
QaItemStatus
QaCategory
QaItem
QaPublishedContent
QaCategoryInput
QaItemInput
```

Contrato:

- `QaItemStatus` aceita `draft`, `published` e `archived`;
- `QaCategory` representa uma categoria do Supabase;
- `QaItem` representa uma pergunta/resposta do Supabase;
- `QaPublishedContent` agrupa `{ categories, items }` retornados pelo service público;
- `QaCategoryInput` representa payload de criação/edição de categoria;
- `QaItemInput` representa payload de criação/edição de pergunta.

---

## 8. Página pública `/duvidas`

Arquivo:

```txt
src/app/pages/Duvidas.tsx
```

Responsabilidades:

- carregar conteúdo publicado via `listPublishedQaContent`;
- guardar estado de categorias, perguntas, categoria ativa, termo de busca, itens abertos, carregamento e erro;
- criar mapa de categorias por `id`;
- calcular contagem de perguntas por categoria;
- filtrar perguntas por categoria ativa;
- filtrar perguntas por busca textual;
- selecionar perguntas em destaque;
- abrir pergunta ao clicar em dúvida frequente;
- renderizar layout desktop/mobile.

Estados internos principais:

| Estado | Função |
|---|---|
| `categories` | Categorias ativas carregadas do Supabase. |
| `items` | Perguntas publicadas carregadas do Supabase. |
| `activeCategoryId` | Categoria selecionada; `all` indica todas. |
| `searchTerm` | Termo digitado na busca. |
| `openItemIds` | Perguntas abertas no accordion. |
| `loading` | Estado de carregamento inicial. |
| `error` | Mensagem de erro quando o Supabase falha. |

---

## 9. Componentes da página pública

### 9.1 `QAHero`

Arquivo:

```txt
src/app/pages/duvidas/QAHero.tsx
```

Responsabilidades:

- exibir título principal;
- exibir subtítulo explicativo;
- renderizar o campo de busca por meio de `QASearchBox`.

Microcopy vigente:

```txt
Como podemos ajudar?
Encontre respostas sobre cadastro, árvore familiar, vínculos, arquivos, privacidade, notificações e navegação pelo site.
```

### 9.2 `QASearchBox`

Arquivo:

```txt
src/app/pages/duvidas/QASearchBox.tsx
```

Responsabilidades:

- receber `value` e `onChange`;
- exibir input com placeholder;
- permitir busca em tempo real conforme digitação.

Placeholder vigente:

```txt
Buscar uma dúvida...
```

### 9.3 `QACategorySidebar`

Arquivo:

```txt
src/app/pages/duvidas/QACategorySidebar.tsx
```

Responsabilidades:

- exibir categorias no desktop;
- exibir item **Todas**;
- mostrar contagem total e contagem por categoria;
- destacar categoria ativa;
- permitir troca de categoria.

Regra:

```txt
A sidebar deve ficar oculta no mobile.
```

### 9.4 `QACategoryChips`

Arquivo:

```txt
src/app/pages/duvidas/QACategoryChips.tsx
```

Responsabilidades:

- exibir categorias em chips horizontais;
- usar `short_title` quando disponível;
- exibir fallback para `title`;
- incluir chip **Todas**;
- permitir scroll horizontal no mobile.

Regra:

```txt
Os chips são a navegação principal de categorias no mobile.
```

### 9.5 `QAAccordion`

Arquivo:

```txt
src/app/pages/duvidas/QAAccordion.tsx
```

Responsabilidades:

- listar perguntas filtradas;
- abrir/fechar respostas;
- renderizar resposta com preservação de quebras de linha;
- exibir página relacionada quando houver `related_page_label` e `related_page_path`.

Contrato:

- a pergunta deve ser clicável como botão;
- o estado aberto vem de `openItemIds`;
- o componente não deve buscar dados;
- o componente não deve alterar status ou persistir alterações.

### 9.6 `QAFeaturedQuestions`

Arquivo:

```txt
src/app/pages/duvidas/QAFeaturedQuestions.tsx
```

Responsabilidades:

- exibir até seis perguntas marcadas como destaque;
- permitir que o usuário selecione uma pergunta destacada;
- ao selecionar, abrir a pergunta e mudar a categoria ativa para a categoria da pergunta.

Regra:

```txt
Exibir dúvidas frequentes apenas quando não houver busca ativa e a categoria ativa for Todas.
```

### 9.7 `QAResultCount`

Arquivo:

```txt
src/app/pages/duvidas/QAResultCount.tsx
```

Responsabilidades:

- mostrar contagem de resultados;
- adaptar texto quando há termo de busca.

### 9.8 `QAEmptyState`

Arquivo:

```txt
src/app/pages/duvidas/QAEmptyState.tsx
```

Responsabilidades:

- exibir mensagem quando nenhum item corresponde à busca/filtro;
- sugerir termos alternativos.

---

## 10. Área administrativa `/admin/duvidas`

Arquivo:

```txt
src/app/pages/admin/AdminDuvidas.tsx
```

Responsabilidades:

- carregar todas as categorias via `adminListQaCategories`;
- carregar todas as perguntas via `adminListQaItems`;
- exibir cards de resumo;
- exibir formulário de categoria;
- exibir lista de categorias;
- exibir formulário de pergunta/resposta;
- exibir lista filtrável de perguntas/respostas;
- filtrar perguntas por categoria;
- filtrar perguntas por status;
- buscar por pergunta, resposta, slug, página relacionada, keywords e categoria;
- criar e editar categorias;
- ativar e desativar categorias;
- criar e editar perguntas/respostas;
- publicar, arquivar ou mover pergunta para rascunho;
- marcar ou desmarcar pergunta como destaque;
- controlar estado de carregamento, salvamento e erro.

### 10.1 Cards de resumo

Cards vigentes:

```txt
Categorias
Ativas
Publicadas
Rascunhos
Arquivadas
```

### 10.2 Formulário de categoria

Campos:

| Campo | Uso |
|---|---|
| `title` | Título completo. |
| `short_title` | Título curto para chips. |
| `slug` | Slug único. |
| `description` | Descrição opcional. |
| `order_index` | Ordem numérica. |
| `is_active` | Controle de exibição pública. |

Validações atuais no frontend:

- título obrigatório;
- `slug` gerado automaticamente a partir do título se estiver vazio.

### 10.3 Formulário de pergunta/resposta

Campos:

| Campo | Uso |
|---|---|
| `category_id` | Categoria da pergunta. |
| `question` | Pergunta. |
| `answer` | Resposta. |
| `slug` | Slug único. |
| `keywords` | Palavras-chave separadas por vírgula na UI. |
| `related_page_label` | Nome da página relacionada. |
| `related_page_path` | Caminho interno relacionado. |
| `is_featured` | Define destaque. |
| `status` | `draft`, `published` ou `archived`. |
| `order_index` | Ordem numérica. |

Validações atuais no frontend:

- categoria obrigatória;
- pergunta obrigatória;
- resposta obrigatória;
- `slug` gerado automaticamente a partir da pergunta se estiver vazio;
- `keywords` normalizadas a partir de lista separada por vírgulas.

### 10.4 Filtros administrativos

Filtros vigentes:

- busca textual;
- categoria;
- status.

Campos pesquisados:

- pergunta;
- resposta;
- slug;
- página relacionada;
- caminho relacionado;
- keywords;
- título da categoria.

### 10.5 Responsividade do admin

No desktop:

- layout em duas colunas;
- categorias à esquerda;
- perguntas e respostas à direita.

No mobile:

- tabs/botões para alternar entre **Perguntas** e **Categorias**;
- cards empilhados;
- sem tabela larga.

---

## 11. Busca e filtragem pública

A busca pública é local, executada no frontend após carregamento do conteúdo publicado.

Campos pesquisados:

- pergunta;
- resposta;
- página relacionada;
- keywords;
- título da categoria;
- título curto da categoria.

Utilitário usado:

```txt
src/app/utils/searchText.ts
includesNormalizedText
```

Regras:

- a busca deve ignorar diferenças de acento;
- a busca deve funcionar com termos parciais;
- a busca deve combinar com o filtro de categoria ativa;
- com categoria **Todas**, busca em todas as perguntas publicadas;
- com categoria específica, busca apenas dentro da categoria selecionada.

Exemplos de equivalência esperada:

```txt
arvore = árvore
vinculo = vínculo
notificacao = notificação
calendario = calendário
duvida = dúvida
```

---

## 12. Layout e responsividade da página pública

### 12.1 Desktop

No desktop, a página usa:

- hero superior;
- campo de busca destacado;
- layout em duas colunas;
- sidebar de categorias à esquerda;
- conteúdo principal à direita;
- bloco de dúvidas frequentes quando aplicável;
- accordion de perguntas.

Estrutura conceitual:

```txt
Header público
Hero + busca
Categorias mobile/chips
Grid desktop:
  Sidebar de categorias
  Conteúdo principal:
    Dúvidas frequentes
    Perguntas e respostas
```

### 12.2 Mobile

No mobile, a página usa:

- layout em uma coluna;
- campo de busca full width;
- chips horizontais de categorias;
- sidebar desktop oculta;
- accordion empilhado.

Regras:

- não usar tabela;
- não exigir rolagem horizontal fora dos chips;
- manter área de toque confortável;
- manter texto legível em telas pequenas;
- preservar espaçamento entre perguntas.

---

## 13. Conteúdo e microcopy

As respostas públicas devem usar nomes de páginas, não rotas técnicas, sempre que forem exibidas para usuário final.

Exemplo recomendado:

```txt
Acesse a página Meus Vínculos.
```

Evitar em respostas públicas:

```txt
Acesse /meus-vinculos.
```

Exceção:

- documentação técnica;
- campos internos como `related_page_path`;
- instruções para desenvolvedores.

Regras de conteúdo:

- respostas devem ser objetivas;
- não expor IDs técnicos;
- não expor estrutura interna de banco ao usuário final;
- não prometer funções não implementadas;
- não mencionar rotas antigas como destino principal;
- usar nomes oficiais das páginas vigentes.

---

## 14. Integração com busca global

A página **Dúvidas** está registrada em:

```txt
src/app/services/globalSearchService.ts
```

Entrada esperada:

```txt
id: 'duvidas'
title: 'Dúvidas'
path: '/duvidas'
```

Keywords esperadas incluem variações com e sem acento:

```txt
duvidas
dúvidas
ajuda
faq
perguntas
respostas
como usar
suporte
arvore
árvore
vinculos
vínculos
notificacoes
notificações
privacidade
```

Regra:

```txt
A busca global deve levar para /duvidas, mas a busca detalhada de perguntas ocorre dentro da própria página.
```

---

## 15. Supabase, RLS e operação

O módulo depende das políticas de leitura e escrita configuradas no Supabase.

Regras esperadas:

- leitura pública de `qa_categories` deve retornar apenas categorias ativas ou permitir que o frontend aplique esse filtro;
- leitura pública de `qa_items` deve retornar apenas perguntas publicadas ou permitir que o frontend aplique esse filtro;
- escrita deve permanecer restrita a administradores;
- o frontend não deve confiar em filtros visuais para proteger conteúdo não publicado;
- RLS deve ser a camada principal de proteção de conteúdo editorial não publicado.

Consulta pública atual no frontend:

```txt
qa_categories: is_active = true
qa_items: status = 'published'
```

Consultas administrativas atuais no frontend:

```txt
qa_categories: todas as categorias
qa_items: todas as perguntas
```

Cuidados:

- se RLS bloquear leitura pública, `/duvidas` exibirá erro de carregamento;
- se RLS bloquear leitura/escrita admin, `/admin/duvidas` exibirá erro administrativo;
- se não houver seed inicial, a página pública carregará sem perguntas;
- se perguntas publicadas estiverem vinculadas a categoria inativa, o service remove essas perguntas da exibição pública;
- se `keywords` vier nulo ou malformado, o service normaliza para array vazio.

---

## 16. Regras de não regressão

```txt
/duvidas deve continuar pública.
/duvidas não deve exigir login.
/duvidas não deve usar MemberRoute, TreeAccessRoute ou ProtectedRoute.
/admin/duvidas deve continuar protegida por ProtectedRoute.
/admin/duvidas não deve ser pública.
A página pública deve carregar conteúdo do Supabase, não de lista hardcoded definitiva.
A página pública deve exibir apenas categorias ativas.
A página pública deve exibir apenas perguntas publicadas.
Perguntas de categorias inativas não devem aparecer publicamente.
Busca pública deve considerar pergunta, resposta, categoria, keywords e página relacionada.
Busca pública deve funcionar com termos com e sem acento.
Desktop deve manter sidebar de categorias na página pública.
Mobile deve manter chips horizontais de categorias na página pública.
Dúvidas frequentes devem depender de is_featured.
Respostas públicas devem usar nomes de páginas, não rotas técnicas.
Componentes não devem acessar Supabase diretamente.
qaService.ts deve permanecer como camada de dados do módulo.
Perguntas em draft não devem aparecer em /duvidas.
Perguntas archived não devem aparecer em /duvidas.
Arquivar deve retirar a pergunta da página pública sem exclusão física.
```

---

## 17. QA manual

### 17.1 Página pública — carregamento

Validar:

- [ ] `/duvidas` abre sem autenticação.
- [ ] Página carrega sem erro quando Supabase está acessível.
- [ ] Estado de carregamento aparece antes dos dados.
- [ ] Erro amigável aparece se o carregamento falhar.
- [ ] Página vazia não quebra quando não há perguntas publicadas.

### 17.2 Página pública — categorias

Validar:

- [ ] Categorias ativas aparecem.
- [ ] Categorias inativas não aparecem.
- [ ] Ordem respeita `order_index`.
- [ ] Desktop exibe sidebar.
- [ ] Mobile exibe chips horizontais.
- [ ] Chip **Todas** mostra perguntas de todas as categorias.
- [ ] Contagem por categoria reflete apenas perguntas carregadas.

### 17.3 Página pública — perguntas e respostas

Validar:

- [ ] Perguntas publicadas aparecem.
- [ ] Perguntas em rascunho não aparecem.
- [ ] Perguntas arquivadas não aparecem.
- [ ] Perguntas de categorias inativas não aparecem.
- [ ] Accordion abre e fecha corretamente.
- [ ] Resposta preserva quebras de linha.
- [ ] Página relacionada aparece quando `related_page_label` e `related_page_path` existem.

### 17.4 Página pública — dúvidas frequentes

Validar:

- [ ] Perguntas com `is_featured = true` aparecem no bloco de destaque.
- [ ] No máximo seis perguntas aparecem no bloco.
- [ ] Clicar em uma pergunta destacada abre a resposta correspondente.
- [ ] Bloco não aparece quando há busca ativa.
- [ ] Bloco não aparece quando categoria ativa não é **Todas**.

### 17.5 Página pública — busca

Validar buscas por:

```txt
arvore
árvore
vinculo
vínculo
notificacao
notificação
calendario
calendário
favoritos
privacidade
```

Critérios:

- [ ] Busca por pergunta funciona.
- [ ] Busca por resposta funciona.
- [ ] Busca por keyword funciona.
- [ ] Busca por categoria funciona.
- [ ] Busca por página relacionada funciona.
- [ ] Busca sem resultado exibe estado vazio.

### 17.6 Página pública — responsividade

Validar breakpoints:

```txt
320px
375px
390px
430px
768px
1024px
1440px
```

Critérios:

- [ ] Mobile não tem overflow horizontal indevido.
- [ ] Chips rolam horizontalmente.
- [ ] Sidebar não aparece no mobile.
- [ ] Sidebar aparece no desktop.
- [ ] Accordions mantêm leitura confortável.
- [ ] Busca permanece acessível no topo.

### 17.7 Busca global

Validar:

- [ ] Busca global encontra **Dúvidas** por `duvidas`.
- [ ] Busca global encontra **Dúvidas** por `dúvidas`.
- [ ] Busca global encontra **Dúvidas** por `faq`.
- [ ] Busca global encontra **Dúvidas** por `ajuda`.
- [ ] Resultado navega para `/duvidas`.

### 17.8 Admin — acesso

Validar:

- [ ] Usuário não admin não acessa `/admin/duvidas`.
- [ ] Usuário admin acessa `/admin/duvidas`.
- [ ] Card **Dúvidas** aparece no painel administrativo.
- [ ] Card navega para `/admin/duvidas`.

### 17.9 Admin — categorias

Validar:

- [ ] Admin lista categorias.
- [ ] Admin cria categoria.
- [ ] Admin edita categoria.
- [ ] Admin altera título curto.
- [ ] Admin altera descrição.
- [ ] Admin altera ordem.
- [ ] Admin desativa categoria.
- [ ] Categoria desativada deixa de aparecer em `/duvidas`.
- [ ] Admin reativa categoria.
- [ ] Categoria reativada volta a aparecer quando há perguntas publicadas.

### 17.10 Admin — perguntas/respostas

Validar:

- [ ] Admin lista perguntas.
- [ ] Admin cria pergunta em rascunho.
- [ ] Pergunta em rascunho não aparece em `/duvidas`.
- [ ] Admin publica pergunta.
- [ ] Pergunta publicada aparece em `/duvidas`.
- [ ] Admin edita pergunta publicada.
- [ ] Alteração aparece em `/duvidas`.
- [ ] Admin marca pergunta como destaque.
- [ ] Pergunta destacada aparece em **Dúvidas frequentes** quando aplicável.
- [ ] Admin remove destaque.
- [ ] Pergunta deixa de aparecer no bloco de destaque quando aplicável.
- [ ] Admin arquiva pergunta.
- [ ] Pergunta arquivada deixa de aparecer em `/duvidas`.
- [ ] Admin move pergunta arquivada para rascunho ou publicado.

### 17.11 Admin — filtros

Validar:

- [ ] Filtro por categoria funciona.
- [ ] Filtro por status funciona.
- [ ] Busca por pergunta funciona.
- [ ] Busca por resposta funciona.
- [ ] Busca por slug funciona.
- [ ] Busca por keyword funciona.
- [ ] Busca por página relacionada funciona.
- [ ] Estado vazio aparece quando não há resultado.

---

## 18. Troubleshooting

### 18.1 Página pública exibe erro de carregamento

Sintoma:

```txt
A página abre, mas exibe mensagem de erro em vez das dúvidas.
```

Causas prováveis:

- Supabase indisponível;
- tabela `qa_categories` inexistente;
- tabela `qa_items` inexistente;
- RLS bloqueando leitura pública;
- erro de schema/cache no Supabase;
- variável de ambiente de Supabase incorreta.

Verificar:

```sql
select * from public.qa_categories limit 1;
select * from public.qa_items limit 1;
```

### 18.2 Página pública não mostra perguntas

Causas prováveis:

- perguntas estão com `status = 'draft'`;
- perguntas estão com `status = 'archived'`;
- categorias estão com `is_active = false`;
- `category_id` aponta para categoria inexistente ou inativa;
- RLS retorna lista vazia.

Consulta de diagnóstico:

```sql
select
  c.title as categoria,
  c.is_active,
  i.question,
  i.status,
  i.is_featured
from public.qa_items i
left join public.qa_categories c on c.id = i.category_id
order by c.order_index, i.order_index;
```

### 18.3 Dúvidas frequentes não aparecem

Causas prováveis:

- nenhuma pergunta publicada possui `is_featured = true`;
- há termo de busca ativo;
- categoria ativa não é **Todas**;
- perguntas destacadas estão em categoria inativa.

Consulta:

```sql
select question, status, is_featured
from public.qa_items
where is_featured = true;
```

### 18.4 Admin não consegue salvar

Causas prováveis:

- usuário não é admin;
- RLS bloqueando insert/update;
- `slug` duplicado;
- categoria obrigatória ausente;
- pergunta ou resposta vazia;
- erro de schema/cache no Supabase.

Verificar:

```sql
select slug from public.qa_categories group by slug having count(*) > 1;
select slug from public.qa_items group by slug having count(*) > 1;
```

### 18.5 Busca não encontra termo com acento

Verificar:

- se `includesNormalizedText` continua sendo usado na página pública;
- se `normalizeText` do admin continua removendo acentos;
- se a pergunta/resposta/keyword realmente contém o termo esperado;
- se a pergunta está publicada e a categoria está ativa.

---

## 19. Pendências futuras

Pendências aceitas para evolução:

```txt
QA-001 — adicionar reordenação por drag and drop no admin.
QA-002 — adicionar editor markdown controlado para respostas.
QA-003 — adicionar preview da pergunta antes de publicar.
QA-004 — adicionar logs específicos de criação/edição/publicação/arquivamento.
QA-005 — adicionar analytics de dúvidas mais acessadas.
QA-006 — adicionar busca server-side por RPC se o volume crescer.
QA-007 — adicionar testes automatizados mínimos para /duvidas e /admin/duvidas.
QA-008 — revisar acessibilidade dos formulários administrativos.
QA-009 — adicionar confirmação visual antes de arquivar pergunta publicada.
```

Não tratar como pendência:

```txt
CRUD administrativo de categorias.
CRUD administrativo de perguntas/respostas.
Publicar pergunta pelo admin.
Arquivar pergunta pelo admin.
Ativar/desativar categoria pelo admin.
Marcar/desmarcar destaque pelo admin.
```

Esses itens já fazem parte do escopo implementado.

---

## 20. Critério de aceite

O módulo deve ser considerado consistente quando:

- `/duvidas` abre sem autenticação;
- `/admin/duvidas` exige usuário admin;
- categorias e perguntas vêm do Supabase;
- página pública não depende de conteúdo hardcoded definitivo;
- admin cria e edita categorias;
- admin cria e edita perguntas/respostas;
- perguntas `draft` e `archived` não aparecem publicamente;
- perguntas `published` aparecem publicamente quando a categoria está ativa;
- categorias inativas não aparecem publicamente;
- busca pública ignora acentos;
- busca admin filtra por texto, categoria e status;
- `npm run build` passa;
- `git diff --check` não retorna erro real;
- documentação está sincronizada com código e banco.
