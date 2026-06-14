# Estrutura de usuários, banco de dados e fluxos de pessoa — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: revisado para alinhar usuários, pessoas, relacionamentos, permissões, múltiplos cônjuges, pets, manual generation, calendário e fluxos atuais da árvore.

---

## Objetivo

Este documento consolida a estrutura atual relacionada a usuários autenticados, pessoas da árvore, perfis, vínculos, preferências, notificações, favoritos, eventos, arquivos históricos, insights, fórum, calendário e tabelas/views de apoio.

Use este arquivo para entender **como usuários, pessoas e tabelas de apoio se conectam**.

Ele não substitui:

- `docs/operacao/MIGRATIONS_SUPABASE.md`: operação de migrations e SQL legado;
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e acesso;
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: comportamento de pessoa/perfil/admin;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`: comportamento visual das views da árvore;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: filtros, cônjuges, conectores e painel;
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`: calendário e Google Agenda;
- `docs/funcionalidades/NOTIFICACOES.md`: arquitetura específica de notificações;
- `docs/funcionalidades/FORUM.md`: comportamento funcional do fórum;
- `docs/GUIA_CORRECAO_ERROS.md`: troubleshooting por sintoma.

Regra central:

```txt
supabase/migrations é a fonte da verdade do schema.
```

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

Fluxo do calendário:

```txt
pessoas + relacionamentos
  -> criarEventosDoCalendario
  -> /calendario-familiar
  -> google_calendar_connections / google_calendar_synced_events quando sincronizado
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

Regras:

- usuário sem vínculo resolvido não deve acessar as views principais da árvore;
- vínculo de usuário não altera por si só os relacionamentos familiares;
- editar perfil vinculado exige permissão no service/RLS/RPC, não apenas botão visível.

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
| Contato | `telefone`, `endereco`, `complemento`, `rede_social`, `instagram_usuario`, `instagram_url` |
| Privacidade | `permitir_exibir_*`, `permitir_mensagens_whatsapp` |
| Árvore | `lado`, `manual_generation`, `cor_bg_card` |
| Legado/compatibilidade | `arquivos_historicos` em `pessoas`, quando existir no ambiente |

Defaults recentes:

- novos registros de `pessoas` usam defaults `true` para flags principais de privacidade/contato;
- `admin_reset_person_profile` também retorna essas flags para `true`;
- `complemento` é dado separado do endereço principal e não deve ser apagado por atualização de endereço via Google Places.

#### `humano_ou_pet`

Campo semântico para diferenciar pessoa humana de pet.

Regra:

```txt
humano_ou_pet === 'Pet' identifica pet para regras de domínio.
```

Uso:

- filtros de Pets;
- avatar `PawPrint` quando não houver foto;
- separação de filhos humanos e pets em resumos;
- lógica de relacionamento/tutela quando aplicável.

Não inferir pet apenas por nome, avatar ou posição visual.

#### `genero`

`genero` pode existir como metadado textual, mas não é o contrato visual principal de avatar sem foto.

Contrato visual atual:

| Caso | Renderização |
|---|---|
| Pessoa com `foto_principal_url` | foto real |
| Pessoa humana sem foto | `User` de `lucide-react` |
| Pet sem foto | `PawPrint` de `lucide-react` |

Regras:

- não há distinção visual obrigatória por gênero para avatar sem foto;
- `genero = pet` pode existir como compatibilidade, mas não substitui sozinho `humano_ou_pet = 'Pet'`;
- a árvore não deve inferir gênero por nome;
- qualquer mudança para avatar por gênero exigiria nova decisão de produto e atualização da documentação canônica.

#### `manual_generation`

Campo usado principalmente pela horizontal:

```txt
pessoas.manual_generation
```

Regras:

- valores esperados: 1 a 6;
- ausentes/inválidos podem ser inferidos visualmente em memória;
- inferência visual não deve persistir no Supabase;
- alteração manual de geração é dado real e deve ocorrer por fluxo administrativo/edição apropriado;
- `/mapa-familiar-horizontal` deve tratar colunas vazias como ocultáveis/compactáveis.

---

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
- relacionamento inverso é criado/atualizado apenas quando a regra for determinística;
- conector conjugal nas views depende de relacionamento explícito;
- cônjuge nunca deve ser inferido apenas por proximidade visual, sobrenome, ordem ou posição.

Tabelas relacionadas:

```txt
relationship_change_requests
```

---

## 3. Múltiplos relacionamentos conjugais

Múltiplos cônjuges devem ser representados por múltiplos relacionamentos explícitos do tipo `conjuge`.

Regras de dados:

- não criar cônjuge por layout;
- não alterar relacionamento real por causa de ajuste visual;
- um relacionamento conjugal pode ter dados próprios de casamento, união, separação e observações;
- arquivos históricos de casamento/relacionamento devem usar `relacionamento_id` quando disponíveis;
- timeline e calendário podem derivar eventos conjugais de `data_casamento`.

Regras de renderização:

- `/mapa-familiar` pode exibir núcleo conjugal principal e núcleos adicionais;
- filhos podem ser agrupados pelo outro pai/mãe quando houver relação explícita;
- filhos sem outro pai/mãe identificado permanecem no grupo principal;
- `/mapa-familiar-horizontal` deve exibir cônjuges da Geração 4/Pais quando o filtro **Cônjuges** estiver ativo;
- cônjuges de avós, bisavós e tataravós podem ser sempre visíveis conforme contrato da árvore;
- cônjuges colaterais dependem do filtro **Cônjuges**.

---

## 4. Arquivos históricos

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
- base64 legado permanece compatível até limpeza controlada;
- arquivos de casamento usam `relacionamento_id`;
- limpeza de órfãos deve seguir `docs/operacao/STORAGE_MAINTENANCE.md`.

---

## 5. Eventos da vida e timeline

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
- relacionamentos conjugais;
- nascimento de filhos;
- arquivos históricos;
- eventos pessoais.

Fora do MVP atual:

- upload específico por evento;
- privacidade por evento;
- exportação PDF da timeline.

---

## 6. Redes sociais

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

## 7. Insights gerados

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

## 8. Sugestões de perfil

Tabela:

```txt
public.person_profile_suggestions
```

Função: permitir que usuário sem permissão direta sugira informações para uma pessoa ou relacionamento conjugal.

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

## 9. Favoritos

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
- páginas internas favoritáveis incluem `/mapa-familiar` e `/mapa-familiar-horizontal`;
- service aceita tipos genéricos e sanitiza metadata.

Regras de segurança:

- metadata não deve armazenar base64, token, secret, telefone, e-mail, URL sensível ou texto excessivamente longo;
- isolamento por `user_id` deve ser preservado.

---

## 10. Notificações

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
- fórum: menção, pessoa relacionada, resposta e comentário;
- rotina de aniversários e memórias.

---

## 11. Fórum

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

## 12. Calendário e Google Agenda

### 12.1 Eventos familiares

`/calendario-familiar` deriva eventos de:

- `pessoas.data_nascimento`;
- `pessoas.data_falecimento`;
- `relacionamentos.data_casamento`;
- eventos históricos/familiares quando suportados;
- confraternizações/reuniões quando cadastradas ou derivadas.

Regras:

- calendário não deve alterar dados de pessoas/relacionamentos;
- filtros usam o estado `activeCategories`;
- categorias mobile devem ser compactas e não gerar overflow;
- alterações no shape de evento devem revisar Google Agenda.

### 12.2 Google Calendar

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
- desconexão e sincronização devem ser feitas por service/Edge Function;
- `/entrar` deve explicar a finalidade da integração quando necessário para compliance OAuth.

---

## 13. Activity logs

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

## 14. RPCs e funções relevantes

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

## 15. Objetos legados ou de compatibilidade

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

## 16. Impacto do Mapa Familiar no modelo de dados

O **Mapa Familiar** não cria novas tabelas nem altera relacionamentos reais. Ele consome `pessoas`, `relacionamentos`, filtros diretos e modelos de layout para compor visualizações HTML/CSS/SVG.

Pontos de atenção:

- `pessoas.manual_generation` orienta a horizontal quando disponível;
- `pessoas.humano_ou_pet` separa pets de pessoas humanas;
- `foto_principal_url` tem prioridade no avatar;
- pessoa humana sem foto usa `User`;
- pet sem foto usa `PawPrint`;
- relacionamentos `conjuge` explícitos são usados para parear cards de cônjuges;
- cônjuges não devem ser inferidos por proximidade visual;
- múltiplos cônjuges são múltiplos relacionamentos, não colunas especiais;
- pets seguem separados de filhos humanos;
- ajustes de layout não exigem migration;
- criação manual de coluna no Supabase exige migration posterior.

---

## 17. Regras de segurança e manutenção

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

## 18. Checklist ao alterar banco ou fluxos de pessoa

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
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`, se alterar dados consumidos pela árvore;
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`, se alterar datas/eventos;
- `docs/funcionalidades/NOTIFICACOES.md`, se alterar notificações;
- `docs/funcionalidades/FORUM.md`, se alterar fórum;
- `docs/PLANO_PROXIMOS_PASSOS.md`, se surgir pendência real.
