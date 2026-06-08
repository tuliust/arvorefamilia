# Fórum

> Última revisão: 2026-06-08  
> Local recomendado: `docs/funcionalidades/FORUM.md`  
> Tipo: documentação funcional, técnica e operacional do módulo de fórum.  
> Status: frente funcional consolidada após refinamentos de criação de tópico, notificações, visualização de tópico e reações.

---

## 1. Objetivo

Este documento registra o comportamento esperado do módulo de fórum familiar do projeto `tuliust/arvorefamilia`.

O fórum permite que membros autenticados criem publicações, relacionem pessoas da árvore, mencionem familiares com `@`, respondam, comentem e reajam a tópicos.

Rotas principais:

```txt
/forum
/forum/novo
/forum/topico/:id
/forum/topico/:id/editar
```

Escopo coberto:

- listagem de tópicos;
- criação de tópico;
- categorias;
- pessoas relacionadas;
- menções com `@`;
- notificações internas para pessoas mencionadas/relacionadas;
- visualização de tópico;
- respostas e comentários;
- badges de categoria/tipo/status;
- avatares;
- reações;
- regra de uma reação por pessoa por alvo;
- constraints e migrations relacionadas.

---

## 2. Documentos relacionados

```txt
docs/README.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/GUIA_IMPLEMENTACOES.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/NOTIFICACOES.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

Este documento complementa:

- `NOTIFICACOES.md`, que cobre arquitetura geral de notificações;
- `ESTRUTURA_USUARIOS_BANCO_DADOS.md`, que lista tabelas e relações do schema;
- `MIGRATIONS_SUPABASE.md`, que define o fluxo operacional para aplicar migrations.

---

## 3. Arquivos principais

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/components/forum/ForumEmptyState.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationDispatchService.ts
src/app/services/userEngagementService.ts
src/app/types/index.ts
```

Componentes compartilhados usados:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/components/ui/button.tsx
src/app/components/ui/card.tsx
src/app/components/ui/input.tsx
src/app/components/ui/textarea.tsx
src/app/components/ui/badge.tsx
```

---

## 4. Rotas e proteção

| Rota | Proteção | Função |
|---|---|---|
| `/forum` | `MemberRoute` | Lista tópicos, categorias e atalhos. |
| `/forum/novo` | `MemberRoute` | Criação de nova publicação. |
| `/forum/topico/:id` | `MemberRoute` | Visualização do tópico, respostas, comentários e reações. |
| `/forum/topico/:id/editar` | `MemberRoute` + regra de autor/admin | Edição de tópico existente. |

Regras:

- usuário não autenticado deve ir para `/entrar`;
- usuário autenticado pode ler tópicos visíveis;
- criação, resposta, comentário e reação exigem usuário logado;
- edição/exclusão devem respeitar autor ou admin;
- moderação administrativa deve continuar protegida por service/RLS, não apenas por UI.

---

## 5. Schema e tabelas

Tabelas ativas do fórum:

```txt
forum_categorias
forum_topicos
forum_respostas
forum_comentarios
forum_reacoes
forum_denuncias
forum_topico_pessoas
```

Resumo:

| Tabela | Função |
|---|---|
| `forum_categorias` | Categorias exibidas em `/forum` e `/forum/novo`. |
| `forum_topicos` | Publicações principais. |
| `forum_respostas` | Respostas diretas aos tópicos. |
| `forum_comentarios` | Comentários vinculados a respostas. |
| `forum_reacoes` | Reações em tópicos/respostas, conforme modelo atual. |
| `forum_denuncias` | Denúncias/moderação. |
| `forum_topico_pessoas` | Relação N:N entre tópicos e pessoas da árvore. |

A documentação de banco já registra essas tabelas como ativas no módulo Fórum e indica as rotas esperadas `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`.

---

## 6. Criação de tópico — `/forum/novo`

Arquivo principal:

```txt
src/app/pages/forum/ForumNovoTopico.tsx
```

### 6.1 Campos da tela

Campos esperados:

- Título;
- Categoria;
- Pessoas Relacionadas;
- Conteúdo;
- botão Publicar.

Campo removido da UI:

```txt
Tipo
```

Regra atual:

- o campo `Tipo` não aparece para o usuário;
- se o backend/service exigir tipo, o frontend usa valor padrão interno.

Valor padrão atual:

```txt
discussao
```

Motivo:

```txt
O usuário escolhe categoria; o tipo técnico permanece compatível com o modelo sem expor mais um dropdown.
```

---

### 6.2 Categorias como botões

O campo `Categoria` deve ser exibido como botões de seleção única, não como dropdown.

Regras visuais:

- botões quadrados ou quase quadrados;
- bordas arredondadas;
- ícone centralizado na área superior;
- título na área inferior;
- título pode quebrar em até 2 linhas;
- categoria selecionada deve ter background/borda/estado visual diferente;
- botões devem respeitar responsividade mobile.

Acessibilidade:

```txt
aria-pressed
foco por teclado
texto acessível
```

Ícones podem ser derivados semanticamente de nome/slug da categoria, por exemplo:

| Categoria/semântica | Ícone sugerido |
|---|---|
| dúvidas/perguntas | `HelpCircle` |
| memórias/histórias/documentos | `BookOpen` |
| avisos/comunicados | `Megaphone` |
| ajuda/apoio | `LifeBuoy` |
| família/pessoa | `UsersRound` |
| fallback | `MessageCircle` |

---

### 6.3 Pessoas Relacionadas

O campo `Pessoas Relacionadas` usa dropdown com seleção múltipla.

Regras:

- ao abrir o dropdown, a primeira linha deve ser campo de busca;
- busca filtra opções pelo nome da pessoa;
- clicar fora fecha o dropdown;
- seleção múltipla deve ser preservada;
- filtrar não deve apagar seleções existentes;
- pessoas selecionadas devem continuar identificáveis por chips/lista;
- pessoas relacionadas são persistidas em `forum_topico_pessoas`.

Comportamento esperado:

```txt
Selecionar pessoa -> adiciona ao estado de relacionadas.
Clicar em pessoa já selecionada -> remove do estado.
Publicar tópico -> vincula pessoas ao tópico.
```

---

### 6.4 Aviso de menção

Acima do campo `Conteúdo`, deve aparecer o aviso:

```txt
Digite @ para marcar alguém na publicação
```

O aviso deve ser discreto e legível.

---

### 6.5 Menções com `@`

O editor de conteúdo deve permitir menções textuais no padrão:

```txt
@Nome Completo
```

Comportamento atual esperado:

- ao digitar `@`, o sistema pode abrir autocomplete de pessoas;
- selecionar uma pessoa insere `@Nome Completo`;
- a pessoa mencionada também é adicionada a `Pessoas Relacionadas`;
- ao publicar, o conteúdo é varrido para identificar menções textuais compatíveis;
- menções e pessoas relacionadas são deduplicadas;
- o tópico continua salvando mesmo sem menções.

Regras:

- não transformar texto em menção se não houver correspondência segura;
- não duplicar pessoa se ela já estiver relacionada;
- não bloquear criação do tópico por falha no vínculo de pessoas, salvo regra futura explícita.

---

## 7. Notificações de fórum

Notificações do fórum usam a arquitetura geral de notificações do projeto.

Arquivos principais:

```txt
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationDispatchService.ts
src/app/components/notifications/NotificationPreferencesPanel.tsx
```

### 7.1 Gatilhos atuais

Ao criar tópico:

- pessoa mencionada com `@` recebe notificação interna;
- pessoa adicionada em `Pessoas Relacionadas` recebe notificação interna;
- o autor do tópico não recebe notificação sobre a própria publicação;
- se uma pessoa foi mencionada e relacionada, recebe apenas uma notificação;
- nesse caso, a notificação de menção tem prioridade.

Mensagem para menção:

```txt
Você foi mencionado em uma publicação.
```

Mensagem para pessoa relacionada:

```txt
Você foi relacionado a uma publicação.
```

Link:

```txt
/forum/topico/:id
```

### 7.2 Deduplicação

Regras:

- deduplicar pessoas antes de resolver destinatários;
- deduplicar usuários vinculados;
- criar no máximo uma notificação por usuário destinatário por tópico criado;
- se o mesmo usuário estiver vinculado a mais de uma pessoa envolvida, evitar duplicidade;
- se o usuário foi mencionado e relacionado, priorizar a razão `mention`.

### 7.3 Preferência usada

A preferência geral usada para notificações internas de publicações/fórum é:

```txt
receber_avisos_gerais
```

O tipo de notificação usado no dispatch é:

```txt
novas_mensagens_forum
```

Observação:

- não foi criada preferência nova específica apenas para publicações;
- a página `/ajustar-notificacoes` deve deixar claro que avisos gerais cobrem publicações, menções e pessoas relacionadas;
- e-mails de fórum seguem as preferências específicas de e-mail quando o canal `email` for usado.

### 7.4 Escopo que não foi implementado

Não fazem parte do escopo atual:

- push real;
- WhatsApp real;
- fila/retry avançado;
- cron para fórum;
- autocomplete remoto complexo de menções;
- notificação externa para todos os seguidores do tópico.

A documentação de notificações já define `push` e `whatsapp` como canais futuros e mantém o escopo ativo em notificações internas e e-mail configurado.

---

## 8. Visualização de tópico — `/forum/topico/:id`

Arquivo principal:

```txt
src/app/pages/forum/ForumTopico.tsx
```

### 8.1 Header do tópico

Regras atuais:

- botão `Ocultar` não deve aparecer no header do post;
- ações permitidas devem ficar restritas a voltar, editar e excluir, conforme permissão;
- ações administrativas sensíveis não devem aparecer para usuário comum.

### 8.2 Badges superiores

Categoria, tipo e status devem aparecer como badges pequenas e coloridas.

Exemplos:

```txt
Dúvidas da Família
Discussão
Aberto
```

Regras:

- badge não deve parecer botão se não for clicável;
- texto deve ser curto;
- cores devem ser discretas;
- layout deve quebrar corretamente no mobile;
- tipo/status técnico deve ser convertido em label legível.

Mapeamento esperado para tipo:

| Tipo interno | Label |
|---|---|
| `pergunta` | Pergunta |
| `discussao` | Discussão |
| `aviso` | Aviso |
| `memoria` | Memória |
| `ajuda` | Ajuda |

Mapeamento esperado para status:

| Status interno | Label |
|---|---|
| `aberto` | Aberto |
| `resolvido` | Resolvido |
| `fechado` | Fechado |
| `oculto` | Oculto |

---

### 8.3 Avatares

A visualização do tópico deve exibir avatar para:

- autor do tópico;
- autor de cada resposta;
- autor de cada comentário.

Fonte atual:

```txt
profiles.avatar_url
profiles.nome_exibicao
```

Fallback:

- iniciais do nome exibido;
- se não houver perfil carregado, usar fallback como `Familiar {id curto}`.

Regras:

- nomes longos não devem quebrar o layout;
- avatar não deve usar imagem quebrada;
- se `profiles` não retornar dados, a tela deve continuar funcional;
- erro ao carregar avatares deve gerar aviso controlado no console, não quebrar o tópico.

---

### 8.4 Pessoa relacionada

Quando houver pessoa relacionada principal, a tela pode exibir card com:

- foto da pessoa, se houver;
- nome completo;
- link para `/pessoa/:id`.

Regras:

- usar `pessoa.foto_principal_url` quando disponível;
- usar fallback com ícone quando não houver foto;
- respeitar layout responsivo.

---

### 8.5 Menções renderizadas

Na visualização do tópico, trechos no formato:

```txt
@Nome Completo
```

devem virar links quando houver correspondência segura com uma pessoa relacionada ao tópico.

Comportamento esperado:

- trecho fica em negrito;
- trecho fica clicável;
- link aponta para `/pessoa/:id`;
- se não houver correspondência, mantém texto normal.

Regras:

- evitar XSS;
- não renderizar HTML bruto;
- montar nós React/JSX a partir do texto;
- ordenar nomes por tamanho decrescente antes do match para evitar colisões entre nomes parecidos.

---

## 9. Respostas e comentários

### 9.1 Respostas

Respostas são exibidas abaixo do tópico.

Regras atuais:

- mostrar autor, avatar, data e conteúdo;
- autor/admin pode editar/excluir;
- botão `Marcar solução` foi removido da UI;
- botão `Ocultar` foi removido da UI;
- se uma resposta já estiver marcada como solução por dado legado, pode continuar exibindo selo `Solução`.

A lógica de backend não precisa ser removida se ainda existir para compatibilidade.

### 9.2 Comentários

Comentários ficam associados a respostas.

Regras:

- mostrar autor, avatar e conteúdo;
- autor/admin pode editar/excluir;
- campo de comentário deve ser responsivo;
- comentários não têm reações no escopo atual, salvo evolução futura.

---

## 10. Reações do fórum

Arquivos principais:

```txt
src/app/pages/forum/ForumTopico.tsx
src/app/services/forumService.ts
supabase/migrations/20260608180000_enforce_single_forum_reaction.sql
```

### 10.1 Tipos internos

Os tipos internos foram preservados:

```txt
curtir
apoiar
lembrar
celebrar
```

Esses valores não devem ser renomeados sem migration e auditoria.

### 10.2 Labels visuais

Mapeamento visual atual:

| Tipo interno | Label visual |
|---|---|
| `curtir` | Amei |
| `apoiar` | Apoiar |
| `lembrar` | Orações |
| `celebrar` | Parabéns |

### 10.3 Ícones e cores

Mapeamento visual atual:

| Label | Ícone lucide-react | Cor |
|---|---|---|
| Amei | `HeartHandshake` | vermelho |
| Apoiar | `Handshake` | verde |
| Orações | `Flower2` | azul |
| Parabéns | `PartyPopper` | laranja |

Observação importante:

```txt
Rose não está disponível na versão atual de lucide-react usada pelo projeto.
```

Por isso, a reação `Orações` usa:

```txt
Flower2
```

Regra anti-regressão:

```txt
Não importar Rose de lucide-react neste projeto enquanto a versão instalada não exportar esse ícone.
```

---

### 10.4 Comportamento visual

Os botões de reação devem:

- exibir apenas ícone por padrão;
- mostrar label no `title`/hover;
- mostrar texto visível quando a reação está selecionada;
- manter contador quando houver reações;
- usar `aria-label`;
- usar `aria-pressed`;
- ter estado visual selecionado claro.

Labels de acessibilidade:

```txt
Reagir com Amei
Reagir com Apoiar
Reagir com Orações
Reagir com Parabéns
```

---

### 10.5 Uma reação por pessoa

Regra funcional atual:

```txt
Um usuário pode ter apenas uma reação por alvo.
```

Alvo:

```txt
alvo_tipo
alvo_id
```

Ação esperada:

| Ação | Resultado |
|---|---|
| Usuário sem reação clica em uma reação | Cria reação. |
| Usuário com reação clica em reação diferente | Substitui reação anterior. |
| Usuário com reação clica na mesma reação | Remove reação. |

Após cada ação:

- recarregar resumo de reações;
- atualizar reação selecionada;
- atualizar contador;
- não duplicar reação no banco.

Service relacionado:

```txt
reagirAoConteudo
obterMinhaReacaoForum
removerReacao
obterResumoReacoes
```

---

### 10.6 Constraint de unicidade

Migration criada:

```txt
supabase/migrations/20260608180000_enforce_single_forum_reaction.sql
```

Escopo:

- remove duplicidades antigas, preservando a reação mais recente;
- remove constraint antiga por `user_id, alvo_tipo, alvo_id, tipo`, se existir;
- cria constraint única por:

```txt
user_id, alvo_tipo, alvo_id
```

Validação SQL:

```sql
select user_id, alvo_tipo, alvo_id, count(*) as total
from public.forum_reacoes
group by user_id, alvo_tipo, alvo_id
having count(*) > 1;
```

O resultado esperado após a migration é zero linhas.

---

## 11. Services do fórum

Arquivo:

```txt
src/app/services/forumService.ts
```

Funções relevantes:

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

- services devem logar erro Supabase de forma controlada;
- falha de notificação não deve impedir criação de resposta/comentário quando o conteúdo foi salvo;
- funções de moderação podem existir, mesmo que botões tenham sido removidos da UI pública;
- operações sensíveis dependem de RLS/RPC/permissões, não apenas de esconder botão.

---

## 12. Integração com favoritos

O schema de favoritos aceita:

```txt
forum_topic
```

em `user_favorites.entity_type`.

Uso esperado:

- tópicos podem ser favoritados em evolução presente/futura;
- links devem apontar para `/forum/topico/:id`;
- metadata não deve conter dados sensíveis.

---

## 13. Integração com busca e navegação

O fórum aparece como rota interna importante.

Regras gerais:

- links para tópico devem usar `/forum/topico/:id`;
- menções de pessoas devem usar `/pessoa/:id`;
- botões de voltar devem retornar para `/forum`;
- notificações de fórum devem apontar para o tópico.

---

## 14. QA funcional

### `/forum/novo`

Validar:

```txt
campo Tipo não aparece
categoria aparece como botões
categoria selecionada tem estado visual diferente
dropdown de Pessoas Relacionadas abre
campo de busca aparece na primeira linha do dropdown
busca filtra pessoas
clicar fora fecha dropdown
seleção é preservada ao filtrar
aviso Digite @ para marcar alguém na publicação aparece acima de Conteúdo
digitar @ permite inserir menção quando aplicável
publicar tópico com pessoa relacionada salva vínculo
publicar tópico com menção salva/vincula pessoa mencionada
publicar tópico sem pessoa relacionada continua funcionando
```

### `/forum/topico/:id`

Validar:

```txt
botão Ocultar não aparece no header
categoria/tipo/status aparecem como badges
autor do tópico tem avatar ou iniciais
autor de resposta tem avatar ou iniciais
autor de comentário tem avatar ou iniciais
botões Marcar solução e Ocultar não aparecem nas respostas
menção @Nome Completo vira link quando há pessoa correspondente
link de menção abre /pessoa/:id
conteúdo sem menção continua normal
```

### Reações

Validar:

```txt
Amei usa HeartHandshake vermelho
Apoiar usa Handshake verde
Orações usa Flower2 azul
Parabéns usa PartyPopper laranja
botões mostram ícone por padrão
label aparece no hover/title
label aparece no botão selecionado
contador aparece quando houver reações
clicar em reação cria reação
clicar em reação diferente substitui anterior
clicar novamente na mesma reação remove
não há duplicidade em forum_reacoes por user_id/alvo_tipo/alvo_id
```

### Notificações

Validar:

```txt
pessoa mencionada recebe notificação interna
pessoa relacionada recebe notificação interna
autor não recebe notificação da própria publicação
pessoa mencionada e relacionada recebe uma única notificação
menção tem prioridade sobre relacionada
notificação aponta para /forum/topico/:id
preferência receber_avisos_gerais é respeitada
```

---

## 15. Validação técnica

Comandos mínimos:

```bash
npm run build
git diff --check
git status --short
```

Se houver alteração de banco:

```bash
supabase migration list
supabase db push
```

Se houver alteração de Edge Function/notificações externas:

```bash
supabase functions list
supabase functions deploy <nome-da-function>
```

Observação:

- validação visual autenticada pode não ser executável em ambiente local sem sessão;
- ausência de sessão local não bloqueia merge se build, diff e revisão estática passarem;
- registrar no relatório quando a validação visual autenticada não for executada.

---

## 16. Troubleshooting

### Build falha dizendo que `Rose` não é exportado

Sintoma:

```txt
"Rose" is not exported by "lucide-react"
```

Causa:

```txt
A versão instalada de lucide-react não exporta Rose.
```

Correção:

```txt
Usar Flower2 para a reação Orações.
```

Não corrigir trocando por emoji.

---

### Reações duplicadas

Sintoma:

```txt
Usuário consegue registrar mais de uma reação no mesmo tópico/resposta.
```

Verificar:

```sql
select user_id, alvo_tipo, alvo_id, count(*) as total
from public.forum_reacoes
group by user_id, alvo_tipo, alvo_id
having count(*) > 1;
```

Correção:

- aplicar `20260608180000_enforce_single_forum_reaction.sql`;
- confirmar constraint `forum_reacoes_user_id_alvo_tipo_alvo_id_key`;
- revisar `reagirAoConteudo`.

---

### Notificação de menção não aparece

Verificar:

- pessoa mencionada existe;
- texto está no padrão `@Nome Completo`;
- pessoa foi relacionada ao tópico;
- pessoa tem usuário vinculado em `user_person_links`;
- destinatário não é o próprio autor;
- preferência `receber_avisos_gerais`;
- tabela `notificacoes_usuario`;
- logs em `notification_dispatch_logs`.

---

### Pessoa relacionada não recebe notificação

Verificar:

- registro em `forum_topico_pessoas`;
- `listLinkedUserIdsForPessoas`;
- vínculo em `user_person_links`;
- deduplicação com menção;
- preferência `receber_avisos_gerais`.

---

### Categoria não aparece

Verificar:

```txt
forum_categorias
listarCategoriasForum
ordem
nome
slug
```

Se a tabela estiver vazia, a tela não terá botões de categoria.

---

### Dropdown de pessoas não fecha

Verificar:

- `relatedDropdownRef`;
- listeners de `mousedown` e `touchstart`;
- `contains(target)`;
- desmontagem dos listeners no cleanup do `useEffect`.

---

### Menção não vira link

Verificar:

- se a pessoa mencionada está em `pessoasRelacionadas`;
- se `listarPessoasDoTopico` retorna a pessoa;
- se o nome no texto bate com `nome_completo`;
- se há variação de acento, abreviação ou espaço extra;
- ordenação por tamanho dos nomes antes do regex.

---

## 17. Segurança e privacidade

Não fazer:

- expor dados privados de pessoa apenas porque foi relacionada ao tópico;
- salvar telefone, endereço, e-mail ou token em metadata de notificação;
- permitir que usuário comum notifique arbitrariamente qualquer usuário sem vínculo de pessoa;
- usar service role no frontend;
- depender apenas de esconder botão para proteger moderação;
- usar HTML bruto para renderizar conteúdo do fórum.

Fazer:

- respeitar RLS;
- sanitizar metadata;
- usar links internos controlados;
- resolver destinatários por vínculo pessoa-usuário;
- evitar duplicidade de notificações;
- preservar logs técnicos sem vazar dados sensíveis.

---

## 18. Anti-regressões

Não reintroduzir:

- dropdown visual de `Tipo` em `/forum/novo`;
- categoria como dropdown se o padrão atual for botões;
- dropdown de pessoas sem busca;
- dropdown de pessoas que não fecha ao clicar fora;
- ausência do aviso `Digite @ para marcar alguém na publicação`;
- botão `Ocultar` no header público do tópico;
- botões `Marcar solução` e `Ocultar` nas respostas;
- reação `Curtir` como label visual;
- reação `Lembrar` como label visual;
- reação `Celebrar` como label visual;
- múltiplas reações por pessoa no mesmo alvo;
- import `Rose` de `lucide-react`;
- emojis como substitutos dos ícones das reações;
- notificações duplicadas para pessoa mencionada e relacionada no mesmo tópico.

---

## 19. Pendências e evoluções futuras

Possíveis evoluções:

- autocomplete mais robusto de menções, com busca assíncrona;
- menções em respostas e comentários;
- notificações para respostas/comentários com menções;
- reações em comentários, se o produto exigir;
- moderação administrativa dedicada;
- página de tópicos favoritos;
- filtros avançados por pessoa relacionada;
- estatísticas de participação;
- busca full-text no fórum;
- upload/anexo em tópicos;
- integração com timeline de pessoa quando tópico mencionar pessoa.

Esses itens não bloqueiam o estado atual do MVP.

---

## 20. Resumo executivo

O fórum está consolidado com:

```txt
/forum/novo
  -> categoria por botões
  -> pessoas relacionadas com busca
  -> menções com @
  -> tipo padrão discussao

/forum/topico/:id
  -> badges de categoria/tipo/status
  -> avatares
  -> menções clicáveis
  -> respostas e comentários sem botões de moderação pública

notificações
  -> menções e pessoas relacionadas
  -> deduplicação
  -> preferência receber_avisos_gerais

reações
  -> Amei / Apoiar / Orações / Parabéns
  -> ícones lucide-react disponíveis
  -> uma reação por pessoa por alvo
```

A principal atenção operacional é aplicar e conferir a migration:

```txt
20260608180000_enforce_single_forum_reaction.sql
```

sem a qual o banco pode permitir duplicidades históricas de reações.
