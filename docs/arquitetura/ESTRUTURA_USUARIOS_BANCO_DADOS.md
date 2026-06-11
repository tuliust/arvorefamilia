# Estrutura de usuários, banco de dados e fluxos de pessoa - Árvore Família

> Última revisão: 2026-06-11
> Local canônico: `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`
> Projeto: `tuliust/arvorefamilia`
> Status: revisado contra o código atual com `Pessoa.genero` tipado no frontend, uso visual de `pessoas.genero` no Mapa Familiar e no mobile compartilhado, e migration versionada `20260611003558_add_genero_to_pessoas.sql`.

## Objetivo

Este documento consolida a estrutura atual relacionada a usuários autenticados, pessoas da árvore, perfis, vínculos, preferências, notificações, favoritos, eventos, arquivos históricos, insights, fórum e tabelas/views de apoio.

Use este arquivo para entender **como usuários, pessoas e tabelas de apoio se conectam**.

Ele não substitui:

- `docs/operacao/MIGRATIONS_SUPABASE.md`: operação de migrations e SQL legado;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e acesso;
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: comportamento de pessoa/perfil/admin;
- `docs/funcionalidades/NOTIFICACOES.md`: arquitetura específica de notificações;
- `docs/funcionalidades/FORUM.md`: comportamento funcional do fórum;
- `docs/GUIA_CORRECAO_ERROS.md`: troubleshooting por sintoma.

Regra central: **`supabase/migrations` é a fonte da verdade do schema**.

---

## 1. Conceitos centrais

O sistema separa dois conceitos:

| Conceito | Representação | Função |
|---|---|---|
| Usuário autenticado | `auth.users` + tabelas públicas de apoio | Conta que entra no sistema |
| Pessoa da árvore | `public.pessoas` | Indivíduo, familiar ou pet representado na árvore |

Um usuário pode estar vinculado a uma pessoa por `user_person_links`. A pessoa existe independentemente de ter usuário autenticado.

Fluxo conceitual:

```txt
auth.users
  -> profiles
  -> user_person_links
  -> pessoas
  -> relacionamentos
  -> arquivos_historicos / person_events / pessoa_social_profiles / person_generated_insights
```

Fluxo de engajamento:

```txt
auth.users
  -> preferencias_notificacao
  -> notificacoes_usuario
  -> notification_dispatch_logs
  -> notification_occurrences
  -> user_favorites
  -> activity_logs
```

Fluxo do fórum:

```txt
auth.users
  -> forum_topicos / forum_respostas / forum_comentarios / forum_reacoes
  -> forum_topico_pessoas
  -> pessoas
  -> user_person_links
  -> notificacoes_usuario
```

---

## 2. Tabelas principais

### 2.1 Autenticação e perfis

| Objeto | Status | Função |
|---|---|---|
| `auth.users` | Supabase Auth | Conta autenticada |
| `profiles` | Ativa | Perfil público/complementar do usuário, incluindo role |
| `user_person_links` | Ativa | Vínculo entre usuário e pessoa da árvore |

Campos relevantes de `user_person_links`:

| Campo | Uso |
|---|---|
| `user_id` | Usuário autenticado |
| `pessoa_id` | Pessoa vinculada |
| `relacao_com_perfil` | Relação declarada com a pessoa |
| `can_edit` | Permissão de edição do registro vinculado |
| `dados_confirmados` | Controle de revisão/primeiro acesso |
| `is_primary` / equivalente funcional | Indicação do vínculo principal quando aplicável |

Services relacionados:

```txt
src/app/services/memberProfileService.ts
src/app/services/permissionService.ts
```

---

### 2.2 Pessoas

Tabela:

```txt
public.pessoas
```

Função: núcleo da árvore genealógica.

Campos funcionais relevantes:

| Grupo | Exemplos |
|---|---|
| Identificação | `id`, `nome_completo`, `humano_ou_pet`, `genero` |
| Datas/locais | `data_nascimento`, `local_nascimento`, `data_falecimento`, `local_falecimento` |
| Exterior | `local_nascimento_exterior`, `local_falecimento_exterior` |
| Estado de vida | `falecido` + helpers que consideram data/local de falecimento |
| Perfil | `foto_principal_url`, `minibio`, `curiosidades` |
| Contato | `telefone`, `endereco`, `rede_social`, `instagram_usuario`, `instagram_url` |
| Privacidade | `permitir_exibir_*`, `permitir_mensagens_whatsapp` |
| Árvore | `lado`, `manual_generation`, `cor_bg_card` |
| Legado/compatibilidade | `arquivos_historicos` em `pessoas`, quando existir no ambiente |

Defaults recentes:

- novos registros de `pessoas` usam defaults `true` para flags principais de privacidade/contato;
- `admin_reset_person_profile` também retorna essas flags para `true`.

#### Campo `genero`

A coluna `pessoas.genero` passa a ser usada como fonte visual para avatares no **Mapa Familiar** e nos cards visuais compartilhados. No frontend, o contrato `Pessoa` já possui `genero?: 'homem' | 'mulher' | 'pet' | string | null`.

Valores esperados:

```txt
homem
mulher
pet
```

Uso atual:

| Valor | Efeito visual |
|---|---|
| `homem` | avatar masculino |
| `mulher` | avatar feminino |
| `pet` | ícone/avatar de pet |

Regra de domínio:

- `genero` orienta avatar/representação visual;
- `humano_ou_pet` continua sendo o campo semântico histórico para diferenciar pessoa humana de pet em regras de domínio;
- `genero = pet` deve ficar consistente com `humano_ou_pet = 'Pet'`, mas não substitui sozinho as regras existentes de pets enquanto não houver migration/backfill definitivo;
- a árvore não deve inferir gênero por nome quando `genero` estiver preenchido.

Estado confirmado contra o código atual:

- a tipagem frontend de `Pessoa.genero` existe;
- os cards visuais leem `person.genero` antes de usar fallbacks legados;
- a coluna `public.pessoas.genero` existe no Supabase como `text` nullable;
- a migration oficial está versionada em `supabase/migrations/20260611003558_add_genero_to_pessoas.sql`;
- a migration cria comentário e índice parcial `idx_pessoas_genero`.

Migration oficial:

```txt
20260611003558_add_genero_to_pessoas.sql
```

---

#### Uso de `genero` nas views da árvore

O campo `genero` é consumido visualmente por cards compartilhados da árvore.

Escopos confirmados:

| View/contexto | Uso |
|---|---|
| `/mapa-familiar` desktop/tablet | `FamilyTreeVisualCards` escolhe avatar por foto real ou `genero` |
| `/minha-arvore` mobile | `MobileFamilyTreeView` reutiliza avatar visual compartilhado |
| `/mapa-familiar` mobile | fallback para `MobileFamilyTreeView`, herdando a mesma regra |
| Pets | `genero = pet` orienta avatar de pet, sem substituir sozinho `humano_ou_pet` |

Regras:

- `foto_principal_url` tem prioridade sobre avatar gráfico;
- `genero` deve ser tratado como informação visual, não como relação familiar;
- alteração de avatar não altera `relacionamentos`;
- manter `humano_ou_pet` como fonte semântica até haver decisão de migração/backfill;
- a migration de `genero` já está criada oficialmente; manter este documento e `docs/operacao/MIGRATIONS_SUPABASE.md` sincronizados se houver constraint, backfill ou normalização futura.


### 2.3 Relacionamentos

Tabela:

```txt
public.relacionamentos
```

Função: arestas entre pessoas.

Campos relevantes:

| Campo | Uso |
|---|---|
| `pessoa_origem_id` | Pessoa de origem |
| `pessoa_destino_id` | Pessoa de destino |
| `tipo_relacionamento` | `conjuge`, `pai`, `mae`, `filho`, `irmao` |
| `subtipo_relacionamento` | `sangue`, `adotivo`, `uniao`, `casamento`, `separado` |
| `ativo` | Relação ativa/inativa |
| `data_casamento`, `local_casamento` | Dados conjugais |
| `data_separacao`, `local_separacao` | Separação/divórcio |
| `observacoes` | Observações internas/admin |

Regras:

- admin cria/edita relacionamento real;
- usuário comum envia solicitação;
- dados conjugais são preservados nos fluxos de edição;
- relacionamento inverso é criado/atualizado apenas quando a regra for determinística.

Tabelas relacionadas:

```txt
relationship_change_requests
```

---

### 2.4 Arquivos históricos

Tabela:

```txt
public.arquivos_historicos
```

Função: arquivos vinculados a pessoa ou relacionamento.

Campos relevantes:

| Campo | Uso |
|---|---|
| `pessoa_id` | Arquivo de pessoa |
| `relacionamento_id` | Arquivo de relacionamento/casamento |
| `tipo` | `imagem` ou `pdf` |
| `url` | URL pública/assinada conforme fluxo |
| `storage_bucket`, `storage_path` | Referência Storage |
| `mime_type` | Tipo MIME |
| `created_by` | Autor do upload |
| `titulo`, `descricao`, `ano` | Metadados editoriais |
| `categoria_evento` | Categoria histórica |
| `ordem` | Ordenação |

Categorias aceitas:

```txt
certidao_nascimento
certidao_casamento
alistamento_militar
imigracao
divorcio
carreira_profissional
mudanca_cidade
certidao_obito
outro
```

Regras:

- novos arquivos usam Storage, não base64;
- base64 legado permanece compatível;
- arquivos de casamento usam `relacionamento_id`;
- limpeza de órfãos deve seguir `docs/operacao/STORAGE_MAINTENANCE.md`.

---

### 2.5 Eventos da vida e timeline

Tabela:

```txt
public.person_events
```

Função: eventos manuais da vida de uma pessoa, usados na timeline e em edição de perfil.

Tipos suportados:

```txt
imigracao
chegada_brasil
mudanca
batismo
formatura
profissao
militar
religioso
memoria
outro
```

A timeline também deriva eventos de:

- nascimento;
- falecimento;
- relacionamentos;
- filhos;
- arquivos históricos;
- eventos pessoais.

Fora do MVP atual:

- upload específico por evento;
- privacidade por evento;
- exportação PDF da timeline.

---

### 2.6 Redes sociais

Tabela:

```txt
public.pessoa_social_profiles
```

Função: redes sociais estruturadas por pessoa, permitindo múltiplos perfis sem depender exclusivamente dos campos legados de `pessoas`.

Campos típicos:

```txt
pessoa_id
rede
perfil
url
exibir_no_perfil
```

Fluxos consumidores atuais:

```txt
src/app/pages/MeusDados.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/pessoaSocialProfilesService.ts
```

Compatibilidade:

- campos legados em `pessoas` continuam existindo quando necessários;
- o primeiro perfil social pode ser sincronizado com `rede_social`, `instagram_usuario` e/ou `instagram_url`;
- `/minha-arvore/editar` carrega e salva múltiplas redes via `pessoa_social_profiles`;
- a exibição pública deve respeitar flags de privacidade e `exibir_no_perfil`;
- falha ao salvar redes sociais após salvar dados pessoais deve ser tratada como alerta parcial, não como motivo para desfazer dados já persistidos.

---

### 2.7 Insights gerados

Tabela:

```txt
public.person_generated_insights
```

Função: armazenar textos gerados por tipo para pessoa.

Tipos usados:

```txt
astrology
historical_events
```

Regras:

- perfil público apenas lê insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam em Edge Function/server-side;
- cards vazios não aparecem publicamente;
- reset administrativo remove insights gerados desses tipos para a pessoa.

---

### 2.8 Sugestões de perfil

Tabela:

```txt
public.person_profile_suggestions
```

Função: permitir que usuário sem permissão direta sugira informações para uma pessoa.

Campos principais:

```txt
requester_user_id
requester_pessoa_id
target_pessoa_id
suggestion_text
status
admin_reviewed_by
admin_reviewed_at
admin_note
```

Status:

```txt
pending
reviewed
dismissed
```

Fluxo:

- usuário envia sugestão em perfil/modal quando não pode editar diretamente;
- admin revisa em `/admin/solicitacoes-vinculos`;
- revisar sugestão não aplica automaticamente dados no perfil sem ação administrativa correspondente.

---

## 3. Favoritos

Tabela:

```txt
public.user_favorites
```

Função: favoritos isolados por usuário.

Tipos TypeScript previstos:

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

Estado funcional atual:

- botão implementado para pessoa;
- tópicos de fórum podem ser favoritados por componente próprio;
- arquivos históricos podem expor favorito quando a tela/componente disponibiliza a ação;
- página `/meus-favoritos` lista, busca, filtra e remove favoritos;
- service aceita tipos genéricos e sanitiza metadata;
- expansão para outros tipos permanece backlog controlado.

Regras de segurança:

- metadata não deve armazenar base64, token, secret, telefone, e-mail, URL sensível ou texto excessivamente longo;
- isolamento por `user_id` deve ser preservado.

---

## 4. Notificações

Tabelas atuais:

| Objeto | Função |
|---|---|
| `preferencias_notificacao` | Preferências atuais do usuário |
| `notificacoes_usuario` | Notificações internas/lista do usuário |
| `notification_dispatch_logs` | Logs técnicos por canal |
| `notification_occurrences` | Deduplicação/ocorrências de rotina automática |

Canais previstos:

```txt
interna
email
push
whatsapp
```

Status atual:

- canal interno funcional;
- preferências editáveis;
- logs e deduplicação preparados;
- e-mail depende de provider/secrets;
- push/WhatsApp reais são pós-MVP;
- cron automático depende de configuração operacional externa.

Gatilhos relevantes:

- novo arquivo histórico;
- novo vínculo de usuário;
- fórum: menção, pessoa relacionada, resposta e comentário.

---

## 5. Fórum

Tabelas:

```txt
forum_categorias
forum_topicos
forum_topico_pessoas
forum_respostas
forum_comentarios
forum_reacoes
forum_denuncias
```

Relações principais:

```txt
forum_topicos.autor_id -> auth.users.id
forum_topicos.categoria_id -> forum_categorias.id
forum_topicos.pessoa_relacionada_id -> pessoas.id
forum_topico_pessoas.topico_id -> forum_topicos.id
forum_topico_pessoas.pessoa_id -> pessoas.id
forum_respostas.topico_id -> forum_topicos.id
forum_comentarios.resposta_id -> forum_respostas.id
forum_reacoes.alvo_tipo + alvo_id -> tópico/resposta/comentário
```

Tipos funcionais:

```txt
ForumTopicoTipo = pergunta | discussao | aviso | memoria | ajuda
ForumTopicoStatus = aberto | resolvido | fechado | oculto
ForumConteudoStatus = publicado | oculto
ForumReacaoTipo = curtir | apoiar | lembrar | celebrar
ForumAlvoTipo = topico | resposta | comentario
```

Regra consolidada de reações:

```txt
UNIQUE (user_id, alvo_tipo, alvo_id)
```

Isso garante uma reação ativa por usuário e alvo.

---

## 6. Google Calendar

Objetos:

```txt
google_calendar_connections
google_calendar_oauth_states
google_calendar_synced_events
google_calendar_connection_status
```

Função:

- conectar conta Google;
- armazenar metadados/tokens de forma restrita;
- sincronizar aniversários e datas de memória;
- exibir status da conexão.

Regras:

- tokens devem ficar restritos a Edge Functions/service role;
- frontend não deve manipular segredo OAuth;
- desconexão e sincronização devem ser feitas por service/Edge Function.

---

## 7. Activity logs

Tabela:

```txt
public.activity_logs
```

Função: auditoria de ações relevantes.

Exemplos de ações:

```txt
person.created
person.updated
person.photo_updated
person.privacy_updated
user_person_link.created
user_person_link.updated
user_person_link.deleted
person_event.added
person_event.updated
person_event.removed
relationship_change_requested
relationship_change_approved
relationship_change_rejected
relationship_change_cancelled
relationship.created
relationship.updated
relationship.deleted
historical_file.added
historical_file.updated
historical_file.removed
notification.created
notification.dispatched
notification.dispatch_failed
notification.marked_read
notification.removed
person_insights.generated
person_insights.regenerated
first_access.confirmed
```

Regras:

- logs devem ser úteis para auditoria;
- não registrar secrets, tokens, dumps, base64 ou payloads sensíveis extensos;
- logs técnicos ruidosos podem ser limpos apenas com auditoria.

---

## 8. RPCs e funções relevantes

| Função/RPC | Uso |
|---|---|
| `is_admin_user(target_user_id)` | Verificar admin |
| `admin_list_profiles_for_linking()` | Listar usuários para vínculo admin |
| `admin_reset_person_profile(target_pessoa_id)` | Resetar dados de perfil sem apagar relacionamentos familiares |

Regras:

- RPC administrativa deve validar admin server-side;
- não criar fallback inseguro de consulta direta em `profiles` no frontend;
- alteração em RPC exige migration versionada e documentação em `MIGRATIONS_SUPABASE.md`.

---

## 9. Objetos legados ou de compatibilidade

| Objeto | Tratamento |
|---|---|
| `pessoas.arquivos_historicos` | Compatibilidade/legado; não usar para novos arquivos |
| base64/data URLs antigos | Compatibilidade até auditoria/limpeza controlada |
| `notification_preferences` / `notifications` quando presentes | Possível legado; não assumir uso atual sem verificar runtime |
| `imagens_pessoa` quando presente | Legado/migrations-only se não houver consumidor runtime |
| SQLs soltos de fórum/Google Calendar | Histórico se já existir migration oficial equivalente |

Regra:

- não apagar coluna/tabela/view legada sem dump recente, SQL de auditoria, revisão de runtime e QA;
- não recriar objeto legado apenas porque aparece em documento antigo.

---

## 10. Regras de segurança e manutenção

- `supabase/migrations` é a fonte da verdade.
- Não aplicar schema por SQL solto em ambiente novo.
- Não alterar RLS para mascarar bug de frontend.
- Não dar permissão ampla a `authenticated` sem revisar escopo.
- Não salvar dados novos como base64.
- Não duplicar dados estruturados de redes sociais em novos campos soltos sem avaliar `pessoa_social_profiles`.
- Não versionar dump, backup, token, secret ou service role.
- Não remover dados reais em revisão documental.
- Não aplicar migration sem `supabase migration list` e plano de rollback.
- Não confiar em UI como única barreira de segurança.

---

## 11. Checklist ao alterar banco ou fluxos de pessoa

Antes:

```bash
git status --short
supabase migration list
```

Depois de alteração local:

```bash
npm run build
git diff --check
```

Quando houver testes aplicáveis:

```bash
npm test
npm run test:e2e
```

Documentar impacto em:

- `docs/operacao/MIGRATIONS_SUPABASE.md`;
- `docs/arquitetura/ROTAS_E_GUARDS.md`, se alterar acesso;
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`, se alterar pessoa/perfil;
- `docs/funcionalidades/NOTIFICACOES.md`, se alterar notificações;
- `docs/funcionalidades/FORUM.md`, se alterar fórum;
- `docs/PLANO_PROXIMOS_PASSOS.md`, se surgir pendência real.

## 12. Impacto do Mapa Familiar no modelo de dados

O **Mapa Familiar** não cria novas tabelas nem altera relacionamentos reais. Ele consome `pessoas`, `relacionamentos`, filtros diretos e `buildMobileFamilyTreeModel` para compor uma visualização panorâmica HTML/CSS/SVG.

Pontos de atenção:

- `pessoas.genero` é usado para escolher avatar visual;
- relacionamentos `conjuge` explícitos são usados para parear cards de cônjuges;
- cônjuges não devem ser inferidos por proximidade visual;
- pets seguem separados de filhos humanos;
- ajustes de layout não exigem migration;
- criação manual de coluna no Supabase exige migration posterior.


---

### 12.1 Verificação contra o código atual

Estado observado na revisão deste lote:

- `src/app/types/index.ts` já tipa `Pessoa.genero` como `homem`, `mulher`, `pet`, string ou `null`;
- `FamilyTreeVisualCards.tsx` usa `person.genero` como fonte primária dos avatares visuais;
- `genero` não deve substituir sozinho `humano_ou_pet` nas regras de domínio enquanto não houver decisão de migração/backfill;
- o Mapa Familiar usa `genero` para representação visual, não para alterar relacionamentos, filtros ou permissões;
- se a coluna existir apenas no Supabase remoto por edição manual, a documentação operacional exige criar migration versionada.
