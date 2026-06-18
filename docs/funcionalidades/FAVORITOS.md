# Favoritos

> Última revisão: 2026-06-14
> Local canônico: `docs/funcionalidades/FAVORITOS.md`
> Tipo: documentação funcional/técnica de favoritos.
> Status: revisado para rotas oficiais atuais, busca global, páginas favoritáveis e tratamento de registros legados.

---

## 1. Objetivo

A funcionalidade de favoritos permite que cada usuário autenticado salve conteúdos relevantes para consulta posterior em `/meus-favoritos`.

Princípios:

1. favoritos são individuais por usuário;
2. favoritos não devem expor dados de outros usuários;
3. favoritos devem apontar para entidade ou rota estável;
4. favoritos de página usam rota canônica, não estado visual temporário;
5. favoritos não reativam rotas históricas.

Este documento não substitui:

| Tema | Documento canônico |
|---|---|
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Rotas antigas removidas | `docs/historico/ROTAS_REMOVIDAS.md` |
| Views da árvore | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| QA manual | `docs/QA_MANUAL.md` |
| Regras de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |

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
| `mapa-familiar` | Árvore Familiar | `/mapa-familiar` |
| `mapa-familiar-horizontal` | Mapa Genealógico | `/mapa-familiar-horizontal` |
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

Exceção vigente:

```txt
/minha-arvore/editar
```

Essa exceção é uma rota de edição do membro, não um atalho principal de view da árvore.

---

## 4. Contrato atual das views de árvore

Páginas favoritáveis da árvore:

| ID | Título vigente | Path |
|---|---|---|
| `mapa-familiar` | Árvore Familiar | `/mapa-familiar` |
| `mapa-familiar-horizontal` | Mapa Genealógico | `/mapa-familiar-horizontal` |

Regras:

- favorito de página deve salvar a rota canônica;
- não salvar geração ativa, zoom, pan, filtro, pessoa central temporária ou estado do modal como contrato obrigatório;
- query params podem existir em navegação contextual, mas o favorito de página deve continuar estável;
- aliases históricos podem existir como keywords de busca, não como destinos favoritos;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não devem voltar para `favoritePages.ts`.

---

## 5. Busca global relacionada

Catálogo técnico:

```txt
src/app/services/globalSearchService.ts
```

A busca global inclui as duas views oficiais:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Regra:

- favoritos e busca global devem permanecer sincronizados para as views oficiais;
- rotas antigas não devem voltar como páginas buscáveis/favoritáveis;
- termos como “minha árvore”, “genealogia” e “visão completa” podem aparecer como keywords, desde que apontem para rotas vigentes;
- keyword antiga não reativa rota antiga.

Exemplos permitidos:

| Keyword | Destino |
|---|---|
| minha árvore | `/mapa-familiar` |
| árvore familiar | `/mapa-familiar` |
| genealogia | `/mapa-familiar-horizontal` |
| árvore genealógica | `/mapa-familiar-horizontal` |
| visão completa | `/mapa-familiar-horizontal` |

---

## 6. Modelo de dados

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

Regras:

- `user_id` deve ser sempre o usuário autenticado;
- `href` deve ser interno e seguro;
- `metadata` deve ser sanitizada;
- favoritos não devem armazenar token, URL privada de storage, base64 ou dado sensível.

---

## 7. Tipos técnicos

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

## 8. Categorias visíveis

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

## 9. Componentes e services

### 9.1 Service

```txt
src/app/services/favoritesService.ts
```

Responsabilidades:

- listar favoritos;
- verificar favorito existente;
- adicionar;
- remover por entidade;
- remover por ID;
- alternar favorito;
- sanitizar metadata;
- manter isolamento por usuário.

### 9.2 Botão genérico

```txt
src/app/components/favorites/FavoriteButton.tsx
```

Responsabilidades:

- estado ativo/inativo;
- loading;
- `aria-label`;
- prevenção de clique duplicado;
- feedback visual seguro.

### 9.3 Botões específicos

```txt
src/app/components/favorites/HistoricalFileFavoriteButton.tsx
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/components/favorites/PersonEventFavoriteButton.tsx
src/app/components/favorites/PageFavoriteButton.tsx
```

---

## 10. Pessoas

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
- respeitar permissões/RLS;
- não apontar favorito de pessoa para uma view da árvore.

---

## 11. Arquivos históricos

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

## 12. Fórum

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

## 13. Eventos pessoais

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

## 14. Páginas internas

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

### 14.1 `/mapa-familiar`

```txt
entityType = page
entityId = /mapa-familiar
label = Árvore Familiar
href = /mapa-familiar
```

### 14.2 `/mapa-familiar-horizontal`

```txt
entityType = page
entityId = /mapa-familiar-horizontal
label = Mapa Genealógico
href = /mapa-familiar-horizontal
```

Regras:

- não salvar zoom, filtros, geração mobile ou `?pessoa=...` como favorito de página;
- query params podem ser preservados na navegação da sessão, não no catálogo fixo;
- rótulos de favoritos devem seguir o vocabulário canônico das views atuais.

---

## 15. Registros legados

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
- mapear `/genealogia` e `/visao-completa` para `/mapa-familiar-horizontal` apenas se houver decisão explícita;
- registrar qualquer normalização em frente própria, com validação de dados reais.

Referência preventiva:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

---

## 16. Validação

Após alterar favoritos:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
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
- `/minha-arvore/editar` não é confundida com view antiga;
- keywords antigas apontam para rotas atuais;
- favoritos de pessoa continuam apontando para `/pessoa/:id`.

QA manual complementar:

```txt
docs/QA_MANUAL.md
```

---

## 17. Anti-regressões específicas

Não reintroduzir como favorito de página:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Checklist:

- [ ] `favoritePages.ts` contém `/mapa-familiar` com título **Árvore Familiar**.
- [ ] `favoritePages.ts` contém `/mapa-familiar-horizontal` com título **Mapa Genealógico**.
- [ ] Busca global e favoritos usam o mesmo vocabulário das views oficiais.
- [ ] `/minha-arvore/editar` não é tratada como substituta da antiga `/minha-arvore`.
- [ ] Favoritos de pessoa continuam apontando para `/pessoa/:id`, não para uma view da árvore.
- [ ] Registros legados não são usados como justificativa para recriar rotas removidas.

<!-- FAVORITOS-PENDENCIAS-2026-06-18 -->
## Pontos recentes a confirmar em favoritos

O levantamento cita ajustes em `/meus-favoritos`, mas parte deles aparece como script gerado ou visual sugerido por print.

Confirmar no Git antes de documentar como implementado:

- busca compacta;
- botÃ£o â€œFiltrosâ€ ao lado da busca;
- categorias em menu suspenso;
- estrela ativa substituindo lixeira;
- delay de 0,5s antes de remover favorito.

Comando sugerido:

```powershell
git log --oneline -- src/app/pages/MeusFavoritos.tsx
```
