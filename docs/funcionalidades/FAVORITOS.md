# Favoritos

> Última revisão: 2026-06-11
> Local canônico: `docs/funcionalidades/FAVORITOS.md`
> Tipo: documentação funcional/técnica de favoritos.
> Status: revisado contra o código atual; favoritos de página estão implementados e `/mapa-familiar` consta em `FAVORITE_PAGES` como página favoritable.

Documentação funcional e técnica da funcionalidade de favoritos do projeto `arvorefamilia`.

## Objetivo

A funcionalidade de favoritos permite que cada usuário autenticado salve conteúdos relevantes da árvore familiar para consulta posterior em `/meus-favoritos`.

A implementação deve preservar três princípios:

1. favoritos são individuais por usuário;
2. favoritos não devem expor dados de outros usuários;
3. favoritos devem apontar para entidades com identificador estável e destino claro.

## Estado atual

A página `/meus-favoritos` existe e lista favoritos gravados na tabela genérica `user_favorites`.

Atualmente, estão ativos ou preparados para uso real:

- Pessoas;
- Arquivos históricos;
- Tópicos do fórum;
- Eventos pessoais;
- Páginas internas.

Categorias ambíguas permanecem ocultas da UI de filtros até terem semântica e destino definidos:

- Relacionamentos;
- Eventos familiares;
- Timeline;
- Histórias.

## Modelo de dados

A tabela `user_favorites` é genérica e trabalha com `entity_type` + `entity_id`.

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

Há unicidade por usuário, tipo e entidade:

```txt
user_id + entity_type + entity_id
```

Isso evita duplicidade do mesmo favorito para o mesmo usuário.

## Tipos técnicos aceitos

O tipo `FavoriteEntityType` aceita:

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

Nem todos os tipos devem estar visíveis na UI antes de terem suporte funcional real.

## Categorias visíveis em `/meus-favoritos`

A UI de filtros deve exibir apenas categorias com implementação segura e destino claro.

Categorias visíveis atualmente:

| Filtro | `entity_type` | Status |
|---|---|---|
| Todos | `all` | Ativo |
| Pessoas | `person` | Ativo |
| Arquivos históricos | `historical_file` | Ativo |
| Fórum | `forum_topic` | Ativo |
| Eventos pessoais | `person_event` | Ativo |
| Páginas | `page` | Ativo |

Categorias ocultas temporariamente:

| Filtro | `entity_type` | Motivo |
|---|---|---|
| Relacionamentos | `relationship` | Falta destino claro de abertura e definição de escopo |
| Eventos familiares | `family_event` | Eventos do calendário são majoritariamente derivados |
| Timeline | `timeline_item` | Timeline é agregadora e pode duplicar favoritos de entidades reais |
| Histórias | `story` | Ainda não existe entidade persistida clara |

Mesmo ocultas nos filtros, categorias antigas ou futuras podem aparecer em “Todos” se existirem registros na tabela, desde que tenham `label` e, idealmente, `href`.

## Componentes e services principais

### Service

Arquivo:

```txt
src/app/services/favoritesService.ts
```

Responsabilidades:

- listar favoritos do usuário atual;
- verificar se uma entidade já está favoritada;
- adicionar favorito;
- remover favorito por entidade;
- remover favorito por ID;
- alternar favorito.

### Botão genérico

Arquivo:

```txt
src/app/components/favorites/FavoriteButton.tsx
```

Responsabilidades:

- exibir estado ativo/inativo;
- carregar estado inicial;
- adicionar/remover favorito;
- bloquear múltiplos cliques durante loading;
- expor `aria-label` adequado.

### Botões específicos

Arquivos atuais:

```txt
src/app/components/favorites/HistoricalFileFavoriteButton.tsx
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/components/favorites/PersonEventFavoriteButton.tsx
src/app/components/favorites/PageFavoriteButton.tsx
```

Esses componentes encapsulam payloads e metadados específicos de cada entidade para evitar duplicação de lógica nas páginas.

## Pessoas

### Status

Implementado.

### Onde aparece

- Perfil da pessoa.

### Payload

```txt
entityType = person
entityId = pessoa.id
label = pessoa.nome_completo
description = Perfil individual da árvore familiar
href = /pessoa/:id
metadata = { source: "person_profile" }
```

### Observações

Pessoas são a categoria mais estável da funcionalidade. Devem permanecer ativas na UI.

## Arquivos históricos

### Status

Implementado.

### Onde aparece

- Cards de arquivos históricos em `ArquivosHistoricos`.

### Payload

```txt
entityType = historical_file
entityId = arquivo.id
label = arquivo.titulo || "Arquivo histórico"
description = arquivo.descricao || arquivo.ano || categoria || tipo
href = /pessoa/:pessoa_id, quando houver pessoa vinculada
```

### Metadata

```txt
file_type
ano
categoria_evento
linked_to
pessoa_id
relacionamento_id
```

### Regras específicas

- Não salvar `url`, `file_url`, base64, caminho de Storage ou dados sensíveis em `metadata`.
- O botão só deve aparecer para arquivos com UUID real.
- Arquivos temporários criados antes de persistência não devem ser favoritáveis.

## Fórum

### Status

Implementado para tópicos.

### Onde aparece

- Cards da listagem do fórum;
- página de detalhe do tópico.

### Payload

```txt
entityType = forum_topic
entityId = topico.id
label = topico.titulo || "Tópico do fórum"
description = topico.conteudo || categoria || "Tópico do fórum"
href = /forum/topico/:id
```

### Metadata

```txt
tipo
status
categoria_id
pessoa_relacionada_id
```

### Decisão de produto

Favoritar “Fórum” significa favoritar tópico, não categoria, comentário ou resposta.

Comentários e respostas não têm favorito próprio nesta etapa.

## Eventos pessoais

### Status

Implementado.

### Onde aparece

- Cards de “Eventos da vida” no perfil da pessoa.

### Payload

```txt
entityType = person_event
entityId = evento.id
label = evento.titulo || "Evento pessoal"
description = evento.descricao || evento.local || evento.data_evento || "Evento pessoal"
href = /pessoa/:pessoa_id
```

### Metadata

```txt
event_type
data_evento
local
pessoa_id
```

### Observações

Eventos pessoais são persistidos em `person_events`, por isso têm ID estável e podem ser favoritados sem migration.

## Páginas internas

### Status

Implementado.

### Onde aparece

- Header padrão de páginas internas com `MemberPageHeader`;
- header das views da árvore com `HomeHeader`.

### Catálogo

Arquivo:

```txt
src/app/constants/favoritePages.ts
```

Páginas suportadas no código atual:

```txt
/minha-arvore
/mapa-familiar
/genealogia
/visao-completa
/calendario-familiar
/forum
/notificacoes
/ajustar-notificacoes
/meus-dados
/meus-vinculos
```

Observação contra o código atual:

```txt
/mapa-familiar
```

A rota `/mapa-familiar` existe como view da árvore e consta em `src/app/constants/favoritePages.ts`, portanto deve ser tratada como página favoritável implementada.

### Payload

```txt
entityType = page
entityId = path
label = title
description = description
href = path
metadata = { source: "page_shortcut" }
```

### Decisão de produto

Favoritar página funciona como atalho salvo para rota interna.

### Mapa Familiar

Status atual: implementado no catálogo de favoritos.

A página `/mapa-familiar` deve ser tratada como favorito de página porque já está incluída em `src/app/constants/favoritePages.ts`.

Payload esperado:

```txt
entityType = page
entityId = /mapa-familiar
label = Mapa Familiar
description = Visualização panorâmica da árvore familiar
href = /mapa-familiar
metadata = { source: "page_shortcut" }
```

Arquivos a manter sincronizados:

```txt
src/app/constants/favoritePages.ts
src/app/services/globalSearchService.ts
src/app/components/FamilyTree/treeViewMode.ts
```

Regra:

- favoritar `/mapa-familiar` salva a página, não uma pessoa nem um estado visual de zoom/filtros;
- `?pessoa=...` pode ser preservado na navegação da sessão, mas o favorito de página deve apontar para a rota canônica;
- a antiga pendência `DOC-015` foi concluída após inclusão de `/mapa-familiar` em `FAVORITE_PAGES` e `GLOBAL_SEARCH_PAGES`.

## Relacionamentos

### Status

Oculto temporariamente.

### Diagnóstico

Existe entidade `Relacionamento`, mas não existe rota própria estável como `/relacionamento/:id`.

Relacionamentos podem representar:

- cônjuge;
- pai;
- mãe;
- filho;
- irmão.

Para favoritos, isso é ambíguo.

### Decisão recomendada

Quando a categoria voltar, “Relacionamentos” deve significar apenas relacionamentos conjugais:

- casamento;
- união;
- separação como estado/metadado.

Relações pai/mãe/filho/irmão devem continuar representadas pela árvore e pelos perfis de pessoas.

### Payload futuro sugerido

```txt
entityType = relationship
entityId = relacionamento.id
label = Relacionamento de Pessoa A e Pessoa B
description = Casamento/União · local/data
href = /pessoa/:idDaPessoaPrincipal
```

### Metadata futura sugerida

```txt
relationship_type
relationship_subtype
pessoa_origem_id
pessoa_destino_id
data_casamento
data_separacao
local_casamento
local_separacao
```

### Critério para reativar filtro

Reativar apenas quando houver decisão sobre destino de abertura:

1. perfil de uma das pessoas com âncora de relacionamentos; ou
2. modal/tela própria de relacionamento; ou
3. futura rota `/relacionamento/:id`.

## Eventos familiares

### Status

Oculto temporariamente.

### Diagnóstico

O calendário familiar atual trabalha majoritariamente com eventos derivados de pessoas e relacionamentos, como:

- aniversário;
- falecimento/memória;
- casamento.

Esses eventos podem ter IDs sintéticos e dados recalculados a partir da data atual ou dos dados-base.

### Decisão recomendada

Não tratar eventos familiares derivados como entidade forte neste momento.

Alternativas atuais:

- favoritar a pessoa;
- favoritar a página Calendário Familiar;
- futuramente, favoritar relacionamento conjugal para casamentos.

### Payload futuro possível, se for adotado snapshot

```txt
entityType = family_event
entityId = evento.id
label = evento.titulo
description = evento.descricao
href = evento.link || /calendario-familiar
```

### Metadata futura possível

```txt
calendar_event_type
category
pessoa_id
related_person_ids
day
month
original_year
source = derived_calendar
```

### Quando exigiria migration

Migration será recomendada se eventos familiares passarem a ser entidades manuais/persistidas com CRUD próprio, permissões próprias e página/detalhe próprio.

## Timeline

### Status

Oculto temporariamente.

### Diagnóstico

A timeline é uma visão agregadora, construída a partir de outras entidades:

- pessoa;
- relacionamento;
- arquivo histórico;
- evento pessoal;
- evento familiar.

Muitos itens de timeline já correspondem a entidades que podem ou poderão ser favoritadas diretamente.

### Decisão recomendada

Timeline não deve ter favoritos próprios no MVP expandido.

Ela deve herdar favoritos das entidades de origem:

| Item da timeline | Favorito correto |
|---|---|
| Arquivo histórico | `historical_file` |
| Evento pessoal | `person_event` |
| Casamento/união/separação | futuro `relationship` |
| Nascimento/falecimento | `person` ou futuro snapshot familiar |
| Memória | `person_event` tipo `memoria` ou `forum_topic` tipo `memoria` |

### Quando usar `timeline_item`

Somente se houver necessidade futura de salvar uma composição narrativa que não exista como entidade de origem.

## Histórias

### Status

Oculto temporariamente.

### Diagnóstico

Ainda não há entidade persistida clara chamada `story`.

O conceito de história pode aparecer hoje como:

- tópico do fórum do tipo memória;
- evento pessoal do tipo memória;
- item de timeline do tipo memória.

### Decisão recomendada

Não ativar `story` enquanto não existir entidade própria.

No curto prazo:

- histórias coletivas ou conversáveis devem ser tópicos do fórum do tipo memória;
- histórias ligadas a uma pessoa devem ser eventos pessoais do tipo memória;
- histórias exibidas na timeline devem herdar o favorito da entidade de origem.

### Quando exigiria migration

Migration será necessária se o produto criar uma entidade editorial própria, por exemplo:

```txt
stories
story_people
story_files
story_visibility
```

Com isso, `story` poderia voltar como categoria real em `/meus-favoritos`.

## Regra para exibição de categorias em `/meus-favoritos`

A página `/meus-favoritos` deve separar:

1. labels técnicos para todos os tipos aceitos;
2. filtros visíveis apenas para categorias com suporte real.

Assim, registros antigos ou futuros não quebram a listagem em “Todos”, mas a UI não promete categorias sem funcionalidade.

Regra prática:

```txt
Se não existe categoria funcional específica, não exibir botão/filtro da categoria.
```

## Padrão visual

### Ícone

Usar `Star` do `lucide-react`.

### Estado inativo

- botão neutro;
- estrela sem preenchimento;
- `aria-label="Adicionar aos favoritos"`.

### Estado ativo

- estrela preenchida;
- destaque amarelo/laranja conforme padrão do `FavoriteButton`;
- `aria-label="Remover dos favoritos"`.

### Loading

- botão desabilitado durante ação;
- não permitir duplo clique.

### Cards pequenos

- usar botão circular ou quadrado compacto;
- preferir canto superior direito ou linha de ações;
- não envolver o botão dentro de `<Link>` do card;
- não bloquear o clique principal do card.

### Páginas de detalhe

- posicionar no header da página ou próximo ao título principal;
- evitar conflito com editar/remover.

### Mobile

- manter área clicável confortável;
- evitar sobreposição com navegação inferior;
- em cards compactos, usar botão icon-only com `aria-label` claro.

## Segurança e privacidade

A implementação deve seguir estas regras:

- favorito pertence ao usuário autenticado;
- nunca expor favoritos de outro usuário;
- não salvar URLs sensíveis, signed URLs, base64, tokens, telefones, e-mails ou endereços em `metadata`;
- tratar entidade removida/inacessível com fallback em `/meus-favoritos`;
- preservar RLS;
- não alterar service role ou secrets.

## Critérios para adicionar nova categoria

Antes de tornar uma nova categoria visível em `/meus-favoritos`, validar:

1. existe entidade ou chave estável?
2. existe rota/destino claro?
3. o favorito não duplica outra entidade já favoritada?
4. metadata não expõe dado sensível?
5. a entidade respeita permissões/RLS?
6. existe estado vazio adequado?
7. existe comportamento claro quando a entidade for removida?

## Validação após alterações

Após qualquer alteração relacionada a favoritos, validar:

```bash
git diff --check
npm run build
git status --short
```

Quando houver outras frentes alterando `docs/`, a validação pode ser filtrada para os arquivos da frente de favoritos, mantendo o build completo.

## Anti-regressões específicas do Mapa Familiar

- Não remover `/mapa-familiar` do catálogo de favoritos se a rota estiver liberada no header.
- Não salvar estado de zoom, grupos expandidos ou filtros do Mapa Familiar como favorito de página sem decisão específica.
- Não favoritar pessoas a partir da rota `/mapa-familiar` usando `entity_type = page`; pessoa continua usando `entity_type = person`.
- Não armazenar dados sensíveis, dumps de layout ou snapshots HTML/SVG em `metadata`.
