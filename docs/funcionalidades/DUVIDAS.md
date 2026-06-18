# Dúvidas / FAQ

> Última revisão: 2026-06-18  
> Local canônico: `docs/funcionalidades/DUVIDAS.md`  
> Tipo: documentação funcional e técnica da página pública `/duvidas`.  
> Status: implementado para leitura pública de conteúdo via Supabase. Área administrativa de gerenciamento permanece pendência documentada.

---

## 1. Objetivo

A página `/duvidas` centraliza perguntas e respostas sobre navegação, cadastro, árvore familiar, vínculos, arquivos históricos, privacidade, notificações e demais áreas do produto **Árvore Família**.

A funcionalidade existe para:

- auxiliar usuários antes ou durante o primeiro acesso;
- reduzir dúvidas de navegação;
- explicar nomes de páginas e conceitos do produto;
- permitir busca por termos em perguntas, respostas, categorias, palavras-chave e página relacionada;
- exibir categorias em layout responsivo;
- carregar conteúdo publicado diretamente do Supabase, sem exigir novo deploy para alteração de conteúdo.

A página é pública e não depende de autenticação.

---

## 2. Escopo implementado

Implementado:

- rota pública `/duvidas`;
- carregamento lazy da página em `src/app/routes.tsx`;
- leitura das tabelas `qa_categories` e `qa_items` via `qaService`;
- exibição apenas de categorias ativas;
- exibição apenas de perguntas publicadas;
- filtro local por categoria;
- busca local normalizada, com suporte a termos com ou sem acento;
- bloco de dúvidas frequentes com perguntas marcadas como destaque;
- accordion de perguntas e respostas;
- sidebar de categorias no desktop;
- chips horizontais de categorias no mobile;
- estados de carregamento, erro e resultado vazio;
- entrada da página **Dúvidas** na busca global do produto.

Não implementado nesta frente:

- CRUD administrativo para categorias;
- CRUD administrativo para perguntas/respostas;
- reordenação por drag and drop;
- editor rich text;
- busca server-side por RPC;
- auditoria administrativa de alterações;
- analytics de dúvidas mais acessadas.

Esses itens devem permanecer em **Pendências futuras** até haver código correspondente.

---

## 3. Arquivos principais

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
src/app/services/qaService.ts
src/app/types/qa.ts
src/app/routes.tsx
src/app/services/globalSearchService.ts
src/app/utils/searchText.ts
```

Documentos relacionados:

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

## 4. Rota e proteção

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/duvidas` | `Duvidas.tsx` | Pública | Página de dúvidas e ajuda. |

Regras:

- não usar `MemberRoute`;
- não usar `TreeAccessRoute`;
- não usar `ProtectedRoute`;
- permitir acesso antes do login;
- manter carregamento lazy;
- manter fallback de rota padrão definido em `routes.tsx`;
- não expor dados familiares privados;
- não buscar dados de pessoas, relacionamentos, arquivos, notificações ou perfis.

A página possui link superior **Voltar para entrar**, apontando para `/entrar`.

---

## 5. Modelo de dados

A funcionalidade depende de duas tabelas no Supabase:

```txt
public.qa_categories
public.qa_items
```

### 5.1 `qa_categories`

Representa categorias exibidas na página.

Campos esperados:

| Campo | Uso |
|---|---|
| `id` | Identificador da categoria. |
| `title` | Título completo exibido no desktop e em cabeçalhos. |
| `short_title` | Título curto usado preferencialmente em chips mobile. |
| `slug` | Identificador textual estável. |
| `description` | Descrição opcional da categoria ativa. |
| `order_index` | Ordem de exibição. |
| `is_active` | Controla se a categoria aparece publicamente. |
| `created_by` | Usuário criador, quando disponível. |
| `updated_by` | Usuário responsável pela última alteração, quando disponível. |
| `created_at` | Data de criação. |
| `updated_at` | Data de atualização. |

### 5.2 `qa_items`

Representa perguntas e respostas.

Campos esperados:

| Campo | Uso |
|---|---|
| `id` | Identificador da pergunta. |
| `category_id` | Categoria vinculada. |
| `question` | Pergunta exibida ao usuário. |
| `answer` | Resposta exibida no accordion. |
| `slug` | Identificador textual estável. |
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

Função pública vigente:

```txt
listPublishedQaContent()
```

Responsabilidades:

- consultar `qa_categories`;
- filtrar categorias com `is_active = true`;
- ordenar por `order_index` e `title`;
- consultar `qa_items`;
- filtrar perguntas com `status = 'published'`;
- ordenar por `order_index` e `question`;
- mapear rows do Supabase para tipos TypeScript;
- remover perguntas vinculadas a categorias inativas;
- lançar erro controlado se categorias ou perguntas não puderem ser carregadas.

Regra:

```txt
Componentes da página não devem acessar Supabase diretamente.
Toda leitura do módulo QA deve passar por src/app/services/qaService.ts.
```

### 6.1 Mapeamento defensivo

O service usa mapeamento defensivo para campos opcionais e valores ausentes.

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
```

Contrato:

- `QaItemStatus` aceita `draft`, `published` e `archived`;
- `QaCategory` representa uma categoria do Supabase;
- `QaItem` representa uma pergunta/resposta do Supabase;
- `QaPublishedContent` agrupa `{ categories, items }` retornados pelo service.

---

## 8. Página pública

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

## 9. Componentes da página

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

## 10. Busca e filtragem

A busca é local, executada no frontend após carregamento do conteúdo publicado.

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

## 11. Layout e responsividade

### 11.1 Desktop

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

### 11.2 Mobile

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

## 12. Conteúdo e microcopy

As respostas devem usar nomes de páginas, não rotas técnicas, sempre que forem exibidas para usuário final.

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
- não expor estrutura interna de banco;
- não prometer funções não implementadas;
- não mencionar rotas antigas como destino principal;
- usar nomes oficiais das páginas vigentes.

---

## 13. Integração com busca global

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

## 14. Supabase, RLS e operação

A página pública depende das políticas de leitura configuradas no Supabase.

Regras esperadas:

- leitura pública de `qa_categories` deve retornar apenas categorias ativas;
- leitura pública de `qa_items` deve retornar apenas perguntas publicadas;
- escrita deve permanecer restrita a administradores ou processos autorizados;
- o frontend não deve confiar em filtros visuais para proteger conteúdo não publicado;
- RLS deve ser a camada principal de proteção de conteúdo editorial não publicado.

Consulta pública atual no frontend:

```txt
qa_categories: is_active = true
qa_items: status = 'published'
```

Cuidados:

- se RLS bloquear leitura anônima, `/duvidas` exibirá erro de carregamento;
- se não houver seed inicial, a página carregará sem perguntas;
- se perguntas publicadas estiverem vinculadas a categoria inativa, o service remove essas perguntas da exibição;
- se `keywords` vier nulo ou malformado, o service normaliza para array vazio.

---

## 15. Área administrativa

A área administrativa de gerenciamento de dúvidas **não está implementada** nesta versão.

Escopo futuro recomendado:

```txt
/admin/duvidas
```

Funcionalidades futuras:

- listar categorias;
- criar categoria;
- editar categoria;
- ativar/desativar categoria;
- ordenar categorias;
- listar perguntas;
- criar pergunta;
- editar pergunta;
- publicar pergunta;
- arquivar pergunta;
- marcar/desmarcar destaque;
- filtrar por categoria;
- filtrar por status;
- buscar por pergunta, resposta e keywords;
- registrar atividade administrativa.

Enquanto a área admin não existir, o conteúdo deve ser gerenciado via Supabase, migrations, seeds ou scripts controlados.

Regra:

```txt
Não documentar /admin/duvidas como rota vigente até o componente, rota e ProtectedRoute existirem no código.
```

---

## 16. Regras de não regressão

```txt
/duvidas deve continuar pública.
/duvidas não deve exigir login.
/duvidas não deve usar MemberRoute, TreeAccessRoute ou ProtectedRoute.
A página deve carregar conteúdo do Supabase, não de lista hardcoded definitiva.
A página deve exibir apenas categorias ativas.
A página deve exibir apenas perguntas publicadas.
Perguntas de categorias inativas não devem aparecer.
Busca deve considerar pergunta, resposta, categoria, keywords e página relacionada.
Busca deve funcionar com termos com e sem acento.
Desktop deve manter sidebar de categorias.
Mobile deve manter chips horizontais de categorias.
Dúvidas frequentes devem depender de is_featured.
Respostas públicas devem usar nomes de páginas, não rotas técnicas.
Componentes não devem acessar Supabase diretamente.
qaService.ts deve permanecer como camada de leitura do módulo.
```

---

## 17. QA manual

### 17.1 Carregamento

Validar:

- [ ] `/duvidas` abre sem autenticação.
- [ ] Página carrega sem erro quando Supabase está acessível.
- [ ] Estado de carregamento aparece antes dos dados.
- [ ] Erro amigável aparece se o carregamento falhar.
- [ ] Página vazia não quebra quando não há perguntas publicadas.

### 17.2 Categorias

Validar:

- [ ] Categorias ativas aparecem.
- [ ] Categorias inativas não aparecem.
- [ ] Ordem respeita `order_index`.
- [ ] Desktop exibe sidebar.
- [ ] Mobile exibe chips horizontais.
- [ ] Chip **Todas** mostra perguntas de todas as categorias.
- [ ] Contagem por categoria reflete apenas perguntas carregadas.

### 17.3 Perguntas e respostas

Validar:

- [ ] Perguntas publicadas aparecem.
- [ ] Perguntas em rascunho não aparecem.
- [ ] Perguntas arquivadas não aparecem.
- [ ] Perguntas de categorias inativas não aparecem.
- [ ] Accordion abre e fecha corretamente.
- [ ] Resposta preserva quebras de linha.
- [ ] Página relacionada aparece quando `related_page_label` e `related_page_path` existem.

### 17.4 Dúvidas frequentes

Validar:

- [ ] Perguntas com `is_featured = true` aparecem no bloco de destaque.
- [ ] No máximo seis perguntas aparecem no bloco.
- [ ] Clicar em uma pergunta destacada abre a resposta correspondente.
- [ ] Bloco não aparece quando há busca ativa.
- [ ] Bloco não aparece quando categoria ativa não é **Todas**.

### 17.5 Busca

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

### 17.6 Responsividade

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

---

## 18. Troubleshooting

### 18.1 Página exibe erro de carregamento

Sintoma:

```txt
A página abre, mas exibe mensagem de erro em vez das dúvidas.
```

Causas prováveis:

- tabelas `qa_categories` ou `qa_items` inexistentes no ambiente;
- RLS bloqueando leitura pública;
- políticas de leitura não aplicadas;
- variáveis de ambiente do Supabase incorretas;
- schema cache desatualizado.

Verificar:

```txt
qa_categories existe?
qa_items existe?
RLS permite select público para categorias ativas?
RLS permite select público para perguntas published?
VITE_SUPABASE_URL está correto?
VITE_SUPABASE_ANON_KEY está correto?
```

### 18.2 Página abre, mas não mostra perguntas

Causas prováveis:

- não há perguntas com `status = 'published'`;
- categorias estão com `is_active = false`;
- perguntas estão ligadas a categorias inativas;
- `category_id` não corresponde a categoria existente;
- seed inicial não foi executado.

Verificar no Supabase:

```sql
select id, title, is_active, order_index
from public.qa_categories
order by order_index, title;

select id, category_id, question, status, is_featured, order_index
from public.qa_items
order by order_index, question;
```

### 18.3 Busca não encontra termos com acento

Causa provável:

- regressão em `includesNormalizedText` ou uso de comparação sem normalização.

Verificar:

```txt
src/app/utils/searchText.ts
src/app/pages/Duvidas.tsx
```

### 18.4 Dúvidas frequentes não aparecem

Causas prováveis:

- nenhum item publicado possui `is_featured = true`;
- há busca ativa;
- categoria ativa não é **Todas**.

Verificar:

```sql
select question, status, is_featured
from public.qa_items
where is_featured = true;
```

### 18.5 Conteúdo antigo aparece após deploy

Causas prováveis:

- cache do navegador;
- deploy ainda não atualizado;
- bundle antigo;
- cache do Vite em ambiente local.

Correção local:

```powershell
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run dev
```

Depois usar `Ctrl + F5` ou aba anônima.

---

## 19. Pendências futuras recomendadas

Registrar em `docs/PLANO_PROXIMOS_PASSOS.md` quando ainda não houver implementação:

```txt
QAFAQ-001 — criar área administrativa /admin/duvidas com CRUD de categorias e perguntas.
QAFAQ-002 — adicionar logs administrativos para criação, edição, publicação e arquivamento.
QAFAQ-003 — criar busca server-side por RPC quando volume de perguntas crescer.
QAFAQ-004 — permitir reordenação visual de categorias e perguntas no admin.
QAFAQ-005 — adicionar editor markdown sanitizado para respostas.
QAFAQ-006 — adicionar slug/âncora compartilhável por pergunta.
QAFAQ-007 — adicionar métricas de dúvidas mais acessadas e buscas sem resultado.
QAFAQ-008 — criar testes automatizados mínimos para carregamento, busca e filtros.
QAFAQ-009 — validar acessibilidade completa dos accordions e chips.
QAFAQ-010 — documentar seed inicial em operação, caso o conteúdo seja versionado.
```

---

## 20. Critério de aceite para alterações futuras

Uma alteração no módulo de dúvidas só deve ser considerada pronta quando:

- `npm run build` passa;
- `git diff --check` não retorna erro real;
- `/duvidas` carrega sem login;
- conteúdo vem do Supabase;
- perguntas `draft` e `archived` não aparecem;
- categorias inativas não aparecem;
- busca funciona com e sem acento;
- desktop mantém sidebar;
- mobile mantém chips horizontais;
- busca global encontra **Dúvidas**;
- documentação canônica permanece atualizada.

Para mudanças que alterem banco, RLS, policies, RPC ou seeds, revisar também:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
```
