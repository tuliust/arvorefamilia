# Fórum

> Última revisão: 2026-06-14
> Local canônico: `docs/funcionalidades/FORUM.md`  
> Tipo: documentação funcional e técnica do módulo de fórum.  
> Status: revisado e alinhado ao fechamento da divergência documental DOC-006; a UI documentada remove filtros visíveis de tipo/status, badges legadas de tipo/status e campo manual de pessoas relacionadas.

---

## 1. Objetivo

Este documento registra o comportamento atual do fórum familiar.

### 1.1 Status documental

A divergência documental `DOC-006` foi fechada no plano canônico.

Estado esperado:

```txt
/forum exibe busca, filtro por categoria, botão compacto para limpar filtros e ação de novo tópico.
Dropdowns de tipo/status não fazem parte da UI atual.
Tipo/status podem existir como campos técnicos ou legados, mas não devem voltar como controles visíveis sem nova decisão de produto.
```


Rotas:

| Rota | Proteção | Função |
|---|---|---|
| `/forum` | `MemberRoute` | Lista tópicos, categorias, busca, filtro por categoria, favoritos e ação de criação. |
| `/forum/novo` | `MemberRoute` | Criação de nova publicação com categoria em cards, conteúdo e menções `@`. |
| `/forum/topico/:id` | `MemberRoute` | Visualização do tópico em formato de post, respostas diretas, favoritos e reações. |
| `/forum/topico/:id/editar` | `MemberRoute` + autor/admin | Edição de tópico existente, com categorias em cards e sem campo manual de pessoa relacionada. |

Este arquivo não substitui:

- `docs/funcionalidades/NOTIFICACOES.md`, para arquitetura geral de notificações;
- `docs/arquitetura/ROTAS_E_GUARDS.md`, para guards;
- `docs/operacao/MIGRATIONS_SUPABASE.md`, para migrations;
- `docs/GUIA_COMPONENTES.md`, para catálogo de componentes;
- `docs/PLANO_PROXIMOS_PASSOS.md`, para pendências abertas e divergências UI/documentação.

---

### 1.2 Relação com árvore, pessoas e notificações

O fórum é funcionalidade de membro e se integra com:

- perfis de pessoa por links `/pessoa/:id`;
- favoritos de tópicos com `entity_type = forum_topic`;
- menções `@Nome Completo` que podem vincular pessoas em `forum_topico_pessoas`;
- notificações internas para menções, pessoas relacionadas e respostas;
- busca e navegação autenticada, sem depender das views antigas da árvore.

As views oficiais da árvore continuam sendo apenas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

O fórum não deve usar `/minha-arvore`, `/genealogia` ou `/visao-completa` como destino de retorno ou contexto de árvore.

## 2. Arquivos principais

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationDispatchService.ts
src/app/components/favorites/ForumTopicFavoriteButton.tsx
src/app/types/index.ts
```

Componentes compartilhados:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/components/ui/button.tsx
src/app/components/ui/card.tsx
src/app/components/ui/input.tsx
src/app/components/ui/textarea.tsx
src/app/components/ui/badge.tsx
```

---

## 3. Schema e tabelas

Tabelas ativas do fórum:

| Tabela | Função |
|---|---|
| `forum_categorias` | Categorias exibidas em `/forum`, `/forum/novo` e `/forum/topico/:id`. |
| `forum_topicos` | Publicações principais. |
| `forum_respostas` | Respostas diretas aos tópicos. |
| `forum_comentarios` | Tabela técnica/legada para comentários vinculados a respostas. Não compõe o fluxo visual atual de `/forum/topico/:id`. |
| `forum_reacoes` | Reações em tópicos e respostas. |
| `forum_denuncias` | Base de denúncias/moderação. |
| `forum_topico_pessoas` | Relação N:N entre tópicos e pessoas da árvore derivada de menções ou dados legados. |
| `user_favorites` | Favoritos de tópicos via `entity_type = forum_topic`. |

Regras:

- não alterar tipos internos sem migration;
- operações sensíveis devem depender de RLS/RPC/permissões, não apenas de esconder botão;
- metadata de notificações e favoritos não deve conter dados sensíveis;
- tabelas técnicas/legadas podem permanecer no schema mesmo quando a UI atual não expõe o fluxo correspondente.

---

## 4. Listagem do fórum — `/forum`

Arquivo principal:

```txt
src/app/pages/forum/ForumHome.tsx
```

A listagem do fórum exibe busca, filtro por categoria, botão para limpar filtros e ação para criação de tópico.

Campos/filtros esperados na UI:

- busca textual por termo;
- dropdown **Todas as categorias**;
- botão compacto apenas com ícone para limpar filtros;
- botão/atalho para criar novo tópico.

Filtros removidos da UI atual:

- dropdown de tipo;
- dropdown de status.

Regras:

- tipo e status continuam podendo existir como campos técnicos/legados em `forum_topicos`, mas não devem voltar como filtros visíveis sem decisão explícita de produto;
- o botão de limpar filtros deve resetar busca e categoria;
- o botão de limpar filtros deve usar `aria-label`/`title`, pois não possui texto visível;
- a busca e a categoria devem funcionar de forma independente;
- a remoção dos filtros visuais não altera RLS, service ou schema;
- se a UI voltar a exibir dropdowns de tipo/status, tratar como regressão ou novo requisito explícito, não como pendência documental herdada.

### 4.1 Cards da listagem

Cards de tópico devem exibir:

- badge de categoria, como **Dúvidas**, **Memórias**, **Documentos** ou **Eventos**;
- badge **Fixado**, apenas quando aplicável;
- título;
- resumo do conteúdo;
- visualizações;
- data relativa/contextual;
- botão de favoritar tópico.

Badges removidas dos cards:

- **Discussão**;
- **Aberto**;
- demais badges derivadas diretamente de `tipo` ou `status`.

Datas devem usar formato contextual:

```txt
Há XX min
Hoje, às HH:MM
Ontem, às HH:MM
```

Para datas antigas, o formato curto continua aceitável.

---

## 5. Criação de tópico — `/forum/novo`

Arquivo principal:

```txt
src/app/pages/forum/ForumNovoTopico.tsx
```

Campos visíveis:

- Título;
- Categoria em cards;
- Conteúdo;
- botão **Publicar**.

Campo removido da UI atual:

- **Pessoas Relacionadas** como dropdown manual.

Campo técnico não exibido:

| Campo | Valor atual |
|---|---|
| `tipo` | `discussao` |

### 5.1 Categorias

Categorias são exibidas como botões/cards, não como dropdown.

Regras:

- seleção única;
- `aria-pressed`;
- ícone semântico por slug/nome;
- grid responsivo;
- em desktop amplo, as 5 categorias devem ficar em uma única linha (`lg:grid-cols-5` ou equivalente);
- estado visual diferenciado para selecionada;
- texto com quebra controlada.

Ícones usados semanticamente:

| Semântica | Ícone |
|---|---|
| dúvidas/perguntas | `HelpCircle` |
| memórias/histórias/documentos | `BookOpen` |
| avisos/comunicados | `Megaphone` |
| ajuda/apoio | `LifeBuoy` |
| família/pessoa | `UsersRound` |
| fallback | `MessageCircle` |

### 5.2 Pessoas relacionadas

O campo manual **Pessoas Relacionadas** não aparece mais em `/forum/novo` nem em `/forum/topico/:id/editar`.

Modelo atual:

- pessoas são relacionadas principalmente por menções no conteúdo;
- o usuário digita `@` para localizar e inserir uma pessoa;
- ao publicar ou salvar, menções compatíveis são varridas e vinculadas em `forum_topico_pessoas`;
- vínculos já existentes em tópicos legados podem continuar preservados no banco;
- falha ao vincular pessoas não deve apagar o tópico já criado;
- não reintroduzir dropdown manual sem decisão explícita de produto.

### 5.3 Menções com `@`

O conteúdo aceita menções no padrão:

```txt
@Nome Completo
```

Comportamento esperado:

- digitar `@` abre autocomplete local;
- `ArrowDown`/`ArrowUp` navegam;
- `Enter` insere menção;
- `Escape` fecha;
- selecionar pessoa adiciona `@Nome Completo` no texto;
- a pessoa mencionada também entra no conjunto técnico de pessoas vinculadas ao tópico;
- ao publicar, o conteúdo é varrido para identificar menções textuais compatíveis;
- menções e vínculos técnicos em `forum_topico_pessoas` são deduplicados.

Aviso exibido acima do campo de conteúdo:

```txt
Digite @ para marcar alguém na publicação
```

---

### 5.4 Pessoas, perfis e múltiplos vínculos

Quando um tópico menciona ou relaciona uma pessoa:

- o vínculo técnico deve apontar para `pessoas.id`;
- o link visual, quando existir, deve usar `/pessoa/:id`;
- não usar rotas de árvore como destino direto da pessoa mencionada;
- não inferir parentesco, casamento ou consanguinidade a partir de menções no fórum;
- múltiplos cônjuges ou múltiplos relacionamentos pertencem aos dados de árvore/perfil, não ao fórum;
- o fórum pode exibir a pessoa relacionada, mas não deve alterar relacionamentos.

## 6. Visualização de tópico — `/forum/topico/:id`

Arquivo principal:

```txt
src/app/pages/forum/ForumTopico.tsx
```

A tela de tópico foi reorganizada para seguir estrutura de conversa/post:

```txt
tópico principal
respostas diretas
campo único de nova resposta
```

Não há segundo nível visual de comentários dentro de cada resposta.

### 6.1 Header e ações

Ações esperadas:

- **Voltar ao fórum**;
- **Editar**, para autor/admin;
- **Excluir**, para autor/admin.

Regras:

- botão **Ocultar** não aparece no header público do tópico;
- moderação pode permanecer no service/backend para compatibilidade;
- usuário comum não deve ver ação administrativa sensível;
- botão **Excluir** deve ser compacto, neutro e icon-only;
- botão `...` não deve aparecer ao lado da lixeira no estado atual.

### 6.2 Estrutura visual do post

O tópico principal exibe:

- avatar ou iniciais do autor;
- nome do autor;
- badge de categoria;
- data relativa/contextual;
- botão de favoritar;
- botão de excluir icon-only quando permitido;
- título do tópico;
- conteúdo;
- reações;
- contador de respostas.

A tela não deve exibir:

- badge **Discussão**;
- badge **Aberto**;
- badges derivadas de tipo/status;
- box **Pessoa relacionada**;
- botão `...` de mais opções;
- bloco separado de comentários por resposta.

### 6.3 Badges

Badges superiores exibem apenas a categoria normalizada.

Exemplos:

| Nome original/legado | Label visual |
|---|---|
| `Dúvidas da Família` | `Dúvidas` |
| `Dúvidas` | `Dúvidas` |
| `Memórias da Família` | `Memórias` |
| `Documentos da Família` | `Documentos` |
| `Eventos da Família` | `Eventos` |

Tipo e status continuam podendo existir como campos técnicos, mas não aparecem como badges visíveis nesta tela.

### 6.4 Avatares

A tela exibe avatar ou iniciais para:

- autor do tópico;
- autores de respostas.

Fonte:

```txt
profiles.avatar_url
profiles.nome_exibicao
```

Fallback:

```txt
Familiar {id curto}
```

### 6.5 Datas

Datas devem usar formato contextual:

```txt
Há XX min
Hoje, às HH:MM
Há XX horas
Ontem, às HH:MM
```

Para datas antigas, pode ser usado formato completo ou curto conforme a UI.

### 6.6 Pessoa relacionada

O box **Pessoa relacionada** foi removido da visualização pública do tópico.

Regras:

- vínculos em `forum_topico_pessoas` podem permanecer para notificações, busca futura, legado e menções;
- dados legados de `pessoa_relacionada` não devem gerar card visual nesta tela;
- reintroduzir o box exige decisão explícita de produto.

### 6.7 Menções renderizadas

Menções no conteúdo podem virar links quando houver correspondência segura com pessoa vinculada ao tópico.

Regras:

- não usar HTML bruto;
- criar nós React;
- ordenar nomes por tamanho decrescente antes do regex, quando a renderização por link estiver ativa;
- link aponta para `/pessoa/:id`;
- se não houver match, manter texto normal;
- se a implementação atual estiver simplificada e mantiver menções apenas como texto, registrar a diferença antes de reativar links.

---

## 7. Respostas diretas

Regras:

- respostas são o único nível visual de conversa abaixo do tópico principal;
- exibir autor, avatar, data e conteúdo;
- autor/admin pode editar/excluir;
- tópico fechado não aceita nova resposta;
- botão **Marcar solução** não aparece na UI pública;
- botão **Ocultar** não aparece na UI pública;
- selo **Solução** pode aparecer para dado legado `aceita_como_solucao`;
- cada resposta pode ter reações;
- não exibir campo de comentário dentro da resposta.

### 7.1 Campo de nova resposta

O campo único de nova resposta aparece no rodapé do bloco de tópico.

Comportamento esperado:

- avatar do usuário atual;
- placeholder contextual, como `Responder como {nome}`;
- textarea compacta;
- botão circular/icon-only de envio;
- submissão cria registro em `forum_respostas`;
- se o tópico estiver fechado, exibir aviso e bloquear nova resposta.

### 7.2 Comentários técnicos/legados

A tabela `forum_comentarios` e funções relacionadas podem permanecer no service por compatibilidade técnica, histórico ou reativação futura.

No escopo visual atual:

- não há campo de comentário abaixo de resposta;
- não há lista de comentários aninhados em resposta;
- notificações de comentário podem permanecer documentadas como legado/técnico, mas não devem ser acionadas pela UI atual se não houver fluxo visível.

---

## 8. Reações

Arquivos principais:

```txt
src/app/pages/forum/ForumTopico.tsx
src/app/services/forumService.ts
supabase/migrations/20260608180000_enforce_single_forum_reaction.sql
```

Tipos internos preservados:

```txt
curtir
apoiar
lembrar
celebrar
```

Labels e ícones:

| Tipo interno | Label visual | Ícone | Cor |
|---|---|---|---|
| `curtir` | Amei | `HeartHandshake` | vermelho |
| `apoiar` | Apoiar | `Handshake` | verde |
| `lembrar` | Orações | `Flower2` | azul |
| `celebrar` | Parabéns | `PartyPopper` | laranja |

Regra anti-regressão:

```txt
Não importar Rose de lucide-react enquanto a versão instalada não exportar esse ícone.
```

### 8.1 Uma reação por pessoa por alvo

Alvo:

```txt
alvo_tipo
alvo_id
```

Comportamento:

| Ação | Resultado |
|---|---|
| Sem reação + clica em reação | Cria reação. |
| Com reação + clica em reação diferente | Substitui anterior. |
| Com reação + clica na mesma reação | Remove reação. |

Funções:

```txt
obterMinhaReacaoForum
reagirAoConteudo
removerReacao
obterResumoReacoes
```

Constraint esperada:

```txt
user_id, alvo_tipo, alvo_id
```

Verificação SQL:

```sql
select user_id, alvo_tipo, alvo_id, count(*) as total
from public.forum_reacoes
group by user_id, alvo_tipo, alvo_id
having count(*) > 1;
```

Resultado esperado: zero linhas.

---

## 9. Notificações de fórum

Gatilhos atuais/previstos:

| Evento | Função | Destinatários |
|---|---|---|
| Criação de tópico | `notifyForumTopicCreated` | usuários vinculados a pessoas mencionadas/relacionadas |
| Nova resposta | `notifyForumReplyCreated` | participantes do tópico, exceto autor |
| Novo comentário | `notifyForumCommentCreated` | participantes da conversa, exceto autor, quando o fluxo técnico de comentários estiver ativo |

Tipo usado:

```txt
novas_mensagens_forum
```

Preferência interna usada:

```txt
receber_avisos_gerais
```

Regras:

- autor não recebe notificação sobre a própria ação;
- pessoa mencionada e relacionada gera uma única notificação;
- menção tem prioridade sobre relação;
- link aponta para `/forum/topico/:id`;
- falha de notificação não deve impedir criação de tópico/resposta/comentário;
- se comentários não estiverem expostos na UI, o gatilho de comentário não deve ser considerado parte do fluxo visual atual.

Mensagens atuais:

| Motivo | Título | Mensagem |
|---|---|---|
| menção | Você foi mencionado no fórum | Você foi mencionado em uma publicação. |
| pessoa relacionada | Você foi relacionado a uma publicação | Você foi relacionado a uma publicação. |
| resposta | Nova resposta no fórum | Um tópico que você acompanha recebeu uma nova resposta. |
| comentário | Novo comentário no fórum | Uma conversa do fórum que você acompanha recebeu um novo comentário. |

---

## 10. Favoritos de fórum

A visualização de tópico inclui `ForumTopicFavoriteButton`.

Uso:

```txt
entity_type = forum_topic
entity_id = topico.id
href = /forum/topico/:id
```

Regras:

- metadata deve ser mínima;
- link esperado é `/forum/topico/:id`;
- botão de favorito deve permanecer compacto;
- favoritos de fórum aparecem em `/meus-favoritos` como categoria **Fórum**;
- em `/meus-favoritos`, o card inteiro é clicável e substitui o antigo botão **Abrir conteúdo**;
- o botão de lixeira de `/meus-favoritos` deve interromper propagação para não abrir o card ao remover.

---

## 11. Services

Arquivo:

```txt
src/app/services/forumService.ts
```

Funções principais:

```txt
listarCategoriasForum
listarTopicosForum
obterTopicoForumPorId
criarTopicoForum
atualizarTopicoForum
deletarTopicoForum
incrementarVisualizacaoTopico

vincularPessoasAoTopico
listarPessoasDoTopico

listarRespostasDoTopico
criarRespostaForum
atualizarRespostaForum
deletarRespostaForum

listarComentariosDaResposta
criarComentarioForum
atualizarComentarioForum
deletarComentarioForum

obterMinhaReacaoForum
reagirAoConteudo
removerReacao
obterResumoReacoes

denunciarConteudo
listarDenunciasForum
ocultarTopicoForum
ocultarRespostaForum
ocultarComentarioForum
fecharTopicoForum
reabrirTopicoForum
```

Regras:

- logar erro Supabase de forma controlada;
- não expor service role;
- não vazar dados sensíveis em metadata;
- manter funções de moderação protegidas por RLS/permissões;
- não bloquear conteúdo salvo por falha de notificação;
- funções de comentário podem permanecer por compatibilidade, mas não justificam reintrodução do campo de comentário na UI sem decisão de produto.

---

## 12. QA funcional

### `/forum`

- busca por termo funciona;
- dropdown de categoria funciona;
- dropdowns de tipo/status não aparecem;
- botão de limpar filtros aparece apenas com ícone e possui `aria-label`/`title`;
- limpar filtros reseta busca e categoria;
- cards exibem apenas badge de categoria e badge **Fixado** quando aplicável;
- cards não exibem **Discussão** nem **Aberto**.

### `/forum/novo`

- campo `Tipo` não aparece;
- campo manual `Pessoas Relacionadas` não aparece;
- categoria aparece como cards/botões;
- em desktop, as 5 categorias ficam em uma linha;
- aviso `Digite @ para marcar alguém na publicação` aparece;
- `@` abre autocomplete;
- menção insere nome e gera vínculo técnico em `forum_topico_pessoas`;
- publicar com menção salva vínculo;
- publicar sem menção funciona.

### `/forum/topico/:id/editar`

- campo `Tipo` não aparece;
- campo manual `Pessoas Relacionadas` não aparece;
- categoria aparece como cards/botões;
- em desktop, as 5 categorias ficam em uma linha;
- conteúdo existente é preservado;
- menções existentes continuam preservadas no texto;
- salvar preserva/atualiza vínculos técnicos derivados de menção.

### `/forum/topico/:id`

- apenas a badge de categoria aparece;
- categoria **Dúvidas da Família** aparece como **Dúvidas**;
- badges **Discussão** e **Aberto** não aparecem;
- autor tem avatar ou iniciais;
- botão `...` não aparece ao lado da lixeira;
- botão excluir é compacto, neutro e icon-only;
- box **Pessoa relacionada** não aparece;
- data aparece em formato contextual;
- respostas diretas funcionam;
- não há campo de comentário dentro de resposta;
- autor/admin pode editar/excluir quando permitido;
- usuário comum não vê ação administrativa indevida;
- tópico fechado não aceita nova resposta.

### Reações

- Amei usa `HeartHandshake`;
- Apoiar usa `Handshake`;
- Orações usa `Flower2`;
- Parabéns usa `PartyPopper`;
- uma reação por pessoa por alvo;
- clicar em outra reação substitui;
- clicar na mesma remove.

### Notificações

- pessoa mencionada recebe notificação;
- pessoa relacionada recebe notificação quando houver vínculo técnico aplicável;
- autor não recebe notificação própria;
- menção + relação não duplica;
- link abre `/forum/topico/:id`;
- `receber_avisos_gerais` é respeitado.

---

## 13. Troubleshooting

### Build falha com `Rose`

Usar `Flower2` para **Orações**. Não substituir por emoji.

### Reações duplicadas

Verificar migration:

```txt
20260608180000_enforce_single_forum_reaction.sql
```

e rodar a consulta de duplicidades em `forum_reacoes`.

### Dropdowns de tipo/status voltaram em `/forum`

Verificar:

- `ForumHome.tsx`;
- se `TIPO_LABELS` e `STATUS_LABELS` ainda estão sendo usados para renderização visível;
- se o grid de filtros ainda possui colunas reservadas para tipo/status;
- se o botão de limpar filtros foi inserido ao lado do dropdown de categoria;
- se `setTipo('todos')` e `setStatus('todos')` permanecem apenas como reset interno, sem controle visual.

Regra: tipo/status podem existir tecnicamente, mas não devem aparecer como filtros visíveis na home do fórum.

### Campo Pessoas Relacionadas voltou na criação/edição

Verificar:

- `ForumNovoTopico.tsx`;
- `ForumEditarTopico.tsx`;
- se algum merge reintroduziu dropdown manual;
- se o vínculo está sendo feito por menção `@`.

Regra: a relação manual por dropdown não faz parte da UI atual. A vinculação deve ser derivada de menções ou preservada como dado legado.

### Box Pessoa relacionada voltou no tópico

Verificar:

- `ForumTopico.tsx`;
- blocos condicionais de `pessoa_relacionada`;
- renderização de cards laterais/auxiliares;
- eventual reuso de trecho antigo do layout.

Regra: dados relacionados podem existir tecnicamente, mas o box visual foi removido da tela atual.

### Comentário aninhado voltou na resposta

Verificar:

- renderização de `comentarios[resposta.id]`;
- campo `comentarioTexto`;
- handlers `comentar`, `removerComentario`, `salvarComentarioEditado`;
- imports de funções `criarComentarioForum`, `atualizarComentarioForum`, `deletarComentarioForum` quando não usados pela UI.

Regra: a UI atual possui tópico principal e respostas diretas. Não há segundo nível de comentário.

### Menção não vira link

Verificar:

- pessoa está em `forum_topico_pessoas` ou dado legado compatível;
- nome do texto bate com `nome_completo`;
- regex está ordenando nomes por tamanho;
- acentuação e espaços;
- se a implementação atual optou por manter menção como texto simples.

### Notificação não aparece

Verificar:

- pessoa tem usuário vinculado em `user_person_links`;
- preferência `receber_avisos_gerais`;
- `notificacoes_usuario`;
- `notification_dispatch_logs`;
- autor não é o próprio destinatário.

---

## 14. Segurança e anti-regressões

Não reintroduzir:

- dropdown de `Tipo` em `/forum/novo`;
- dropdowns de tipo/status em `/forum`;
- categoria como dropdown em `/forum/novo` ou edição;
- dropdown manual de pessoas relacionadas em criação/edição;
- box visual **Pessoa relacionada** em `/forum/topico/:id`;
- badges **Discussão** e **Aberto** em cards ou tópico;
- botão `...` ao lado da lixeira no tópico;
- campo de comentário aninhado em resposta;
- botão `Ocultar` no header público do tópico;
- botão `Marcar solução` na UI pública;
- label visual `Curtir`, `Lembrar` ou `Celebrar`;
- múltiplas reações por pessoa no mesmo alvo;
- import de `Rose`;
- HTML bruto para renderizar conteúdo;
- notificação duplicada para menção + pessoa relacionada.

Preservar:

- RLS;
- metadata mínima;
- links internos controlados;
- logs técnicos sem dados sensíveis;
- falha de notificação sem rollback do conteúdo salvo;
- compatibilidade de tabelas/funções legadas quando ainda existirem no service.

---

## 15. Evoluções futuras

Não bloqueiam o MVP:

- autocomplete remoto/assíncrono de menções;
- menções em respostas;
- notificações específicas por menção em resposta;
- reações em comentários, caso o nível de comentários volte por decisão de produto;
- moderação administrativa dedicada;
- busca full-text;
- anexos em tópicos;
- filtros por pessoa relacionada;
- estatísticas de participação;
- reintrodução de comentários aninhados, somente se houver decisão explícita e atualização de UX/documentação.

## 15. Anti-regressões de integração

Checklist:

- [ ] Fórum não reintroduz filtros visíveis de tipo/status sem decisão de produto.
- [ ] Tópicos favoritados continuam usando `forum_topic`.
- [ ] Menções continuam vinculando pessoas por ID, quando houver correspondência segura.
- [ ] Links de pessoa usam `/pessoa/:id`.
- [ ] Notificações de fórum não impedem criação de tópico/resposta se falharem.
- [ ] O fórum não aponta para `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.
