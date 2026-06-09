# Fórum

> Última revisão: 2026-06-09  
> Local canônico: `docs/funcionalidades/FORUM.md`  
> Tipo: documentação funcional e técnica do módulo de fórum.  
> Status: revisado após remoção de filtros tipo/status, remoção do campo manual de pessoas relacionadas e padronização das categorias em cards.

---

## 1. Objetivo

Este documento registra o comportamento atual do fórum familiar.

Rotas:

| Rota | Proteção | Função |
|---|---|---|
| `/forum` | `MemberRoute` | Lista tópicos, categorias e atalhos. |
| `/forum/novo` | `MemberRoute` | Criação de nova publicação. |
| `/forum/topico/:id` | `MemberRoute` | Visualização, respostas, comentários, favoritos e reações. |
| `/forum/topico/:id/editar` | `MemberRoute` + autor/admin | Edição de tópico existente, com categorias em cards e sem campo manual de pessoa relacionada. |

Este arquivo não substitui:

- `docs/funcionalidades/NOTIFICACOES.md`, para arquitetura geral de notificações;
- `docs/arquitetura/ROTAS_E_GUARDS.md`, para guards;
- `docs/operacao/MIGRATIONS_SUPABASE.md`, para migrations;
- `docs/GUIA_COMPONENTES.md`, para catálogo de componentes.

---

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
| `forum_categorias` | Categorias exibidas em `/forum` e `/forum/novo`. |
| `forum_topicos` | Publicações principais. |
| `forum_respostas` | Respostas diretas aos tópicos. |
| `forum_comentarios` | Comentários vinculados a respostas. |
| `forum_reacoes` | Reações em tópicos e respostas. |
| `forum_denuncias` | Base de denúncias/moderação. |
| `forum_topico_pessoas` | Relação N:N entre tópicos e pessoas da árvore. |
| `user_favorites` | Favoritos de tópicos via `entity_type = forum_topic`. |

Regras:

- não alterar tipos internos sem migration;
- operações sensíveis devem depender de RLS/RPC/permissões, não apenas de esconder botão;
- metadata de notificações e favoritos não deve conter dados sensíveis.

---

## 4. Listagem do fórum — `/forum`

Arquivo principal:

```txt
src/app/pages/forum/ForumHome.tsx
```

A listagem do fórum exibe busca, filtro por categoria e ação para criação de tópico.

Campos/filtros visíveis:

- busca textual por termo;
- dropdown **Todas as categorias**;
- botão compacto apenas com ícone para limpar filtros;
- botão/atalho para criar novo tópico, conforme header da página.

Filtros removidos da UI atual:

- dropdown de tipo;
- dropdown de status.

Regras:

- tipo e status continuam podendo existir como campos técnicos/legados em `forum_topicos`, mas não devem voltar como filtros visíveis sem decisão explícita de produto;
- o botão de limpar filtros deve resetar busca e categoria;
- o botão de limpar filtros deve usar `aria-label`/`title`, pois não possui texto visível;
- a busca e a categoria devem funcionar de forma independente;
- a remoção dos filtros visuais não altera RLS, service ou schema.

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

Categorias são exibidas como botões, não como dropdown.

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
- vínculos já existentes em tópicos legados podem continuar sendo lidos pela visualização;
- falha ao vincular pessoas não deve apagar o tópico já criado;
- não reintroduzir dropdown manual sem decisão explícita de produto.

### 5.3 Menções com `@`

O conteúdo aceita menções no padrão:

```txt
@Nome Completo
```

Comportamento atual:

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

## 6. Visualização de tópico — `/forum/topico/:id`

Arquivo principal:

```txt
src/app/pages/forum/ForumTopico.tsx
```

### 5.1 Header e ações

Ações esperadas:

- **Voltar ao fórum**;
- **Editar**, para autor/admin;
- **Excluir**, para autor/admin.

Regras:

- botão **Ocultar** não aparece no header público do tópico;
- moderação pode permanecer no service/backend para compatibilidade;
- usuário comum não deve ver ação administrativa sensível.

### 5.2 Badges

Badges superiores exibem:

- categoria;
- tipo técnico convertido em label;
- status convertido em label.

Mapeamento de tipo:

| Tipo interno | Label |
|---|---|
| `pergunta` | Pergunta |
| `discussao` | Discussão |
| `aviso` | Aviso |
| `memoria` | Memória |
| `ajuda` | Ajuda |

Mapeamento de status:

| Status interno | Label |
|---|---|
| `aberto` | Aberto |
| `resolvido` | Resolvido |
| `fechado` | Fechado |
| `oculto` | Oculto |

### 5.3 Avatares

A tela exibe avatar ou iniciais para:

- autor do tópico;
- autores de respostas;
- autores de comentários.

Fonte:

```txt
profiles.avatar_url
profiles.nome_exibicao
```

Fallback:

```txt
Familiar {id curto}
```

### 5.4 Pessoa relacionada

Quando `pessoa_relacionada` existe, a tela exibe card com:

- foto ou fallback;
- nome completo;
- link para `/pessoa/:id`.

Observação: `forum_topico_pessoas` pode conter múltiplas pessoas relacionadas, mas o card principal do tópico usa `pessoa_relacionada` quando disponível.

### 5.5 Menções renderizadas

Menções no conteúdo viram links quando há correspondência segura com pessoa relacionada ao tópico.

Regras:

- não usar HTML bruto;
- criar nós React;
- ordenar nomes por tamanho decrescente antes do regex;
- link aponta para `/pessoa/:id`;
- se não houver match, manter texto normal.

---

## 7. Respostas e comentários

### 6.1 Respostas

Regras:

- exibir autor, avatar, data e conteúdo;
- autor/admin pode editar/excluir;
- tópico fechado não aceita nova resposta;
- botão **Marcar solução** não aparece na UI pública;
- botão **Ocultar** não aparece na UI pública;
- selo **Solução** pode aparecer para dado legado `aceita_como_solucao`.

### 6.2 Comentários

Regras:

- comentários ficam associados a respostas;
- exibir autor, avatar e conteúdo;
- autor/admin pode editar/excluir;
- campo deve ser responsivo;
- comentários não possuem reações no escopo atual.

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

### 7.1 Uma reação por pessoa por alvo

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

Gatilhos atuais:

| Evento | Função | Destinatários |
|---|---|---|
| Criação de tópico | `notifyForumTopicCreated` | usuários vinculados a pessoas mencionadas/relacionadas |
| Nova resposta | `notifyForumReplyCreated` | participantes do tópico, exceto autor |
| Novo comentário | `notifyForumCommentCreated` | participantes da conversa, exceto autor |

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
- falha de notificação não deve impedir criação de tópico/resposta/comentário.

Mensagens atuais:

| Motivo | Título | Mensagem |
|---|---|---|
| menção | Você foi mencionado no fórum | Você foi mencionado em uma publicação. |
| pessoa relacionada | Você foi relacionado a uma publicação | Você foi relacionado a uma publicação. |
| resposta | Nova resposta no fórum | Um tópico que você acompanha recebeu uma nova resposta. |
| comentário | Novo comentário no fórum | Uma conversa do fórum que você acompanha recebeu um novo comentário. |

---

## 10. Favoritos

A visualização de tópico inclui `ForumTopicFavoriteButton`.

Uso:

```txt
entity_type = forum_topic
entity_id = topico.id
```

Regras:

- metadata deve ser mínima;
- link esperado é `/forum/topico/:id`;
- favoritos de fórum devem ser documentados em detalhe quando a frente de favoritos expandidos for consolidada.

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
- não bloquear conteúdo salvo por falha de notificação.

---

## 12. QA funcional

### `/forum`

- busca por termo funciona;
- dropdown de categoria funciona;
- dropdowns de tipo/status não aparecem;
- botão de limpar filtros aparece apenas com ícone e possui `aria-label`/`title`;
- limpar filtros reseta busca e categoria.

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
- menções existentes continuam renderizando;
- salvar preserva/atualiza vínculos técnicos derivados de menção.

### `/forum/topico/:id`

- badges aparecem;
- autor tem avatar ou iniciais;
- pessoa relacionada tem link para perfil;
- menções viram link quando há pessoa correspondente;
- respostas e comentários funcionam;
- autor/admin pode editar/excluir;
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
- pessoa relacionada recebe notificação;
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

### Campo Pessoas Relacionadas voltou na criação/edição

Verificar:

- `ForumNovoTopico.tsx`;
- `ForumEditarTopico.tsx`;
- se algum merge reintroduziu dropdown manual;
- se o vínculo está sendo feito por menção `@`.

Regra: a relação manual por dropdown não faz parte da UI atual. A vinculação deve ser derivada de menções ou preservada como dado legado na visualização.

### Menção não vira link

Verificar:

- pessoa está em `forum_topico_pessoas` ou `pessoa_relacionada`;
- nome do texto bate com `nome_completo`;
- regex está ordenando nomes por tamanho;
- acentuação e espaços.

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
- categoria como dropdown;
- dropdown de pessoas sem busca;
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
- falha de notificação sem rollback do conteúdo salvo.

---

## 15. Evoluções futuras

Não bloqueiam o MVP:

- autocomplete remoto/assíncrono de menções;
- menções em respostas e comentários;
- notificações específicas por menção em resposta/comentário;
- reações em comentários;
- moderação administrativa dedicada;
- busca full-text;
- anexos em tópicos;
- filtros por pessoa relacionada;
- estatísticas de participação.
