# Favoritos

> Última revisão: 2026-06-13  
> Local canônico: `docs/funcionalidades/FAVORITOS.md`  
> Tipo: documentação funcional/técnica de favoritos.  
> Status: alinhado ao código atual de `src/app/constants/favoritePages.ts` e `src/app/services/globalSearchService.ts`.

---

## 1. Objetivo

A funcionalidade de favoritos permite que cada usuário autenticado salve conteúdos relevantes para consulta posterior em `/meus-favoritos`.

Princípios:

1. favoritos são individuais por usuário;
2. favoritos não devem expor dados de outros usuários;
3. favoritos devem apontar para entidade ou rota estável;
4. favoritos de página usam rota canônica, não estado visual temporário.

---

## 2. Estado atual

A página `/meus-favoritos` lista registros da tabela genérica:

```txt
user_favorites
```

Tipos implementados ou preparados:

- pessoas;
- arquivos históricos;
- tópicos do fórum;
- eventos pessoais;
- páginas internas.

Categorias ambíguas permanecem ocultas da UI de filtros até terem destino claro:

- relacionamentos;
- eventos familiares;
- timeline;
- histórias.

---

## 3. Páginas favoritáveis

Catálogo técnico:

```txt
src/app/constants/favoritePages.ts
```

Páginas atualmente suportadas:

| ID | Título | Path |
|---|---|---|
| `mapa-familiar` | Mapa Familiar | `/mapa-familiar` |
| `mapa-familiar-horizontal` | Mapa Familiar Horizontal | `/mapa-familiar-horizontal` |
| `meus-dados` | Meus Dados | `/meus-dados` |
| `meus-vinculos` | Meus Vínculos | `/meus-vinculos` |
| `notificacoes` | Notificações | `/notificacoes` |
| `ajustar-notificacoes` | Ajustar Notificações | `/ajustar-notificacoes` |
| `forum` | Fórum | `/forum` |
| `calendario` | Calendário Familiar | `/calendario-familiar` |

Rotas antigas que não devem ser favoritáveis como páginas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção:

```txt
/minha-arvore/editar
```

é uma rota vigente de edição, mas não é atalho principal de view da árvore.

---

## 4. Busca global relacionada

Catálogo técnico:

```txt
src/app/services/globalSearchService.ts
```

A busca global também inclui:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Regra:

- favoritos e busca global devem permanecer sincronizados para as views oficiais;
- rotas antigas não devem voltar como páginas buscáveis/favoritáveis;
- termos como “genealogia” podem aparecer como keyword da horizontal, mas não como rota `/genealogia`.

---

## 5. Modelo de dados

Tabela:

```txt
user_favorites
```

Campos principais:

- `id`;
- `user_id`;
- `entity_type`;
- `entity_id`;
- `label`;
- `description`;
- `href`;
- `metadata`;
- `created_at`;
- `updated_at`.

Unicidade conceitual:

```txt
user_id + entity_type + entity_id
```

---

## 6. Tipos técnicos

Tipo:

```txt
FavoriteEntityType
```

Valores aceitos:

```txt
person
historical_file
relationship
forum_topic
family_event
person_event
page
timeline_item
story
```

Nem todo tipo deve aparecer em filtro de UI.

---

## 7. Categorias visíveis

| Filtro | `entity_type` | Status |
|---|---|---|
| Todos | `all` | ativo |
| Pessoas | `person` | ativo |
| Arquivos históricos | `historical_file` | ativo |
| Fórum | `forum_topic` | ativo |
| Eventos pessoais | `person_event` | ativo |
| Páginas | `page` | ativo |

Categorias ocultas:

| Categoria | Motivo |
|---|---|
| Relacionamentos | falta rota/destino próprio |
| Eventos familiares | muitos eventos são derivados |
| Timeline | agregadora, não entidade forte |
| Histórias | entidade persistida ainda não consolidada |

---

## 8. Componentes e services

### Service

```txt
src/app/services/favoritesService.ts
```

Responsabilidades:

- listar favoritos;
- verificar favorito existente;
- adicionar;
- remover por entidade;
- remover por ID;
- alternar favorito.

### Botão genérico

```txt
src/app/components/favorites/FavoriteButton.tsx
```

Responsabilidades:

- estado ativo/inativo;
- loading;
- `aria-label`;
- prevenção de clique duplicado.

### Botões específicos

```txt
src/app/components/favorites/HistoricalFileFavoriteButton.tsx
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/components/favorites/PersonEventFavoriteButton.tsx
src/app/components/favorites/PageFavoriteButton.tsx
```

---

## 9. Pessoas

Status: implementado.

Payload:

```txt
entityType = person
entityId = pessoa.id
label = pessoa.nome_completo
description = Perfil individual da árvore familiar
href = /pessoa/:id
metadata = { source: "person_profile" }
```

Regras:

- usar UUID real;
- não expor dados sensíveis;
- respeitar permissões/RLS.

---

## 10. Arquivos históricos

Status: implementado.

Payload:

```txt
entityType = historical_file
entityId = arquivo.id
label = arquivo.titulo || "Arquivo histórico"
description = arquivo.descricao || arquivo.ano || categoria || tipo
href = /pessoa/:pessoa_id
```

Metadata permitida:

```txt
file_type
ano
categoria_evento
linked_to
pessoa_id
relacionamento_id
```

Não salvar:

```txt
url
file_url
base64
storage path sensível
token
```

---

## 11. Fórum

Status: tópicos implementados.

Payload:

```txt
entityType = forum_topic
entityId = topico.id
label = topico.titulo || "Tópico do fórum"
description = topico.conteudo || categoria || "Tópico do fórum"
href = /forum/topico/:id
```

Decisão:

- favoritar fórum significa favoritar tópico;
- comentários/respostas não têm favorito próprio nesta etapa.

---

## 12. Eventos pessoais

Status: implementado.

Payload:

```txt
entityType = person_event
entityId = evento.id
label = evento.titulo || "Evento pessoal"
description = evento.descricao || evento.local || evento.data_evento || "Evento pessoal"
href = /pessoa/:pessoa_id
```

---

## 13. Páginas internas

Status: implementado.

Payload:

```txt
entityType = page
entityId = path
label = title
description = description
href = path
metadata = { source: "page_shortcut" }
```

### `/mapa-familiar`

```txt
entityType = page
entityId = /mapa-familiar
label = Mapa Familiar
href = /mapa-familiar
```

### `/mapa-familiar-horizontal`

```txt
entityType = page
entityId = /mapa-familiar-horizontal
label = Mapa Familiar Horizontal
href = /mapa-familiar-horizontal
```

Regras:

- não salvar zoom, filtros, geração mobile ou `?pessoa=...` como favorito de página;
- query params podem ser preservados na navegação da sessão, não no catálogo fixo.

---

## 14. Registros legados

Pode haver favoritos antigos gravados com:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Tratamento recomendado:

- não reativar rotas para suportar favorito antigo;
- criar estratégia de migração/normalização se registros existirem;
- mapear `/minha-arvore` para `/mapa-familiar` apenas se houver decisão explícita;
- não mapear `/genealogia` ou `/visao-completa` automaticamente sem avaliar intenção.

---

## 15. Validação

Após alterar favoritos:

```bash
npm run build
npm test
npm run test:e2e
git diff --check
```

Buscas:

```bash
rg "FAVORITE_PAGES"
rg "GLOBAL_SEARCH_PAGES"
rg "/minha-arvore|/genealogia|/visao-completa" src/app/constants src/app/services docs/funcionalidades/FAVORITOS.md
```

Critério:

- catálogo ativo tem as duas views oficiais;
- rotas antigas não aparecem como páginas favoritáveis;
- `/minha-arvore/editar` não é confundida com view antiga.
