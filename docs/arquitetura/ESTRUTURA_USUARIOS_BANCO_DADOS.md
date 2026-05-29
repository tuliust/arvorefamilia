# Estrutura de usuarios, banco de dados e fluxos de pessoa

> Ultima atualizacao: 2026-05-29
> Projeto: `tuliust/arvorefamilia`
> Stack: React + Vite + TypeScript + Supabase Auth + Supabase Postgres
> Local recomendado: `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`

Este documento consolida a estrutura atual relacionada a usuarios, pessoas, perfis, vinculos, preferencias, notificacoes, favoritos, eventos, arquivos historicos, insights gerados por IA e demais tabelas/views de apoio.

A finalidade e servir como referencia para desenvolvimento, manutencao, auditoria de dados, limpeza controlada de schema e evolucao das funcionalidades.

## Como usar este documento

Use este arquivo para entender **como usuarios autenticados, pessoas da arvore e tabelas de apoio se conectam**. Ele nao substitui:

- `docs/operacao/MIGRATIONS_SUPABASE.md`: regras operacionais para aplicar ou revisar migrations.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, protecoes e regras de acesso.
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: comportamento de produto de pessoas, perfil publico e administracao.
- `docs/funcionalidades/NOTIFICACOES.md`: arquitetura especifica de notificacoes.
- `docs/GUIA_CORRECAO_ERROS.md`: investigacao por sintoma.

Regra central: **a fonte da verdade do schema e `supabase/migrations`**. Scripts SQL soltos, tabelas legadas e colunas legadas devem ser tratados como historico ou compatibilidade ate auditoria especifica.

---

## 1. Visao geral do modelo

O sistema separa claramente dois conceitos:

1. **Usuario autenticado**
   Representado pelo usuario do Supabase Auth (`auth.users`) e complementado por tabelas publicas como `profiles`, `user_person_links`, `preferencias_notificacao`, `notificacoes_usuario` e `user_favorites`.

2. **Pessoa da arvore genealogica**
   Representada pela tabela `pessoas` e conectada a outras pessoas por `relacionamentos`. A pessoa tambem pode ter eventos, arquivos historicos, redes sociais, insights gerados e registros de auditoria associados.

Fluxo conceitual:

```txt
auth.users

profiles

user_person_links

pessoas

relacionamentos / arquivos_historicos / person_events / pessoa_social_profiles / person_generated_insights
```

Fluxo de engajamento do usuario:

```txt
auth.users

preferencias_notificacao
notificacoes_usuario
notification_dispatch_logs
notification_occurrences
user_favorites
activity_logs
```

---

## 2. Paginas e rotas relevantes

### 2.1 Autenticacao e primeiro acesso

| Rota | Componente | Funcao |
|---|---|---|
| `/entrar` | `src/app/pages/Entrar.tsx` | Login, primeiro acesso, validacao de codigo, criacao de conta e vinculo inicial com pessoa da arvore. |

Fluxo resumido:

1. Usuario informa codigo de primeiro acesso.
2. O codigo e validado contra uma pessoa existente.
3. Usuario cria conta no Supabase Auth.
4. O metadata inicial recebe `nome_exibicao`, `pessoa_id` e `primeiro_acesso`.
5. O sistema cria ou resolve o vinculo em `user_person_links`.
6. Se os dados ainda nao foram confirmados, o usuario e enviado para revisar seus dados.

Services envolvidos:

- `memberProfileService.ts`
  - `validateFirstAccessCode`
  - `isPersonAlreadyLinked`
  - `storePendingFirstAccess`
  - `resolveFirstAccessLinkForUser`
  - `ensureMemberProfile`
  - `getPrimaryLinkedPerson`
  - `linkUserToPerson`

---

### 2.2 Area da arvore

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/` | redireciona para `/minha-arvore` | `TreeAccessRoute` | Entrada principal da arvore. |
| `/minha-arvore` | `Home.tsx` | `TreeAccessRoute` | Visualizacao principal da arvore. |
| `/genealogia` | `Home.tsx` | `TreeAccessRoute` | View genealogica. |
| `/visao-completa` | `Home.tsx` | `TreeAccessRoute` | View completa da arvore. |
| `/minha-arvore/editar` | `MinhaArvore.tsx` | `MemberRoute` | Edicao da propria arvore e vinculos familiares pelo membro. |

Services e componentes relacionados:

- `dataService.ts`
- `memberTreeService.ts`
- `relationshipChangeRequestService.ts`
- `FamilyTree.tsx`
- `PersonNode.tsx`
- `directFamilyDistributedLayout.ts`

---

### 2.3 Dados pessoais do usuario

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/meus-dados` | `MeusDados.tsx` | `MemberRoute` | Edicao dos dados da pessoa vinculada ao usuario logado. |
| `/meus-vinculos` | `MeusVinculos.tsx` | `MemberRoute` | Visualizacao/gestao de vinculos usuario-pessoa. |
| `/vincular-perfil` | `VincularPerfil.tsx` | `MemberRoute` | Solicitacao ou criacao de vinculo adicional. |

Campos editaveis pelo proprio usuario sao centralizados no tipo `EditableOwnPersonPayload` e nas funcoes de `personFields.ts`.

Campos principais editaveis:

- `nome_completo`
- `data_nascimento`
- `local_nascimento`
- `local_nascimento_exterior`
- `local_atual`
- `foto_principal_url`
- `falecido`
- `minibio`
- `curiosidades`
- `telefone`
- `endereco`
- `rede_social`
- `instagram_usuario`
- `instagram_url`
- `permitir_exibir_instagram`
- `permitir_mensagens_whatsapp`
- `permitir_exibir_data_nascimento`
- `permitir_exibir_endereco`
- `permitir_exibir_rede_social`
- `permitir_exibir_telefone`

Services envolvidos:

- `memberProfileService.ts`
  - `getCurrentUserLinkedPeople`
  - `updateOwnLinkedPerson`
  - `confirmOwnLinkedPersonData`
- `pessoaSocialProfilesService.ts`
- `arquivosHistoricosService.ts`
- `storageService.ts`
- `userEngagementService.ts`

---

### 2.4 Perfil publico de pessoa

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/pessoa/:id` | `PersonProfile.tsx` | `MemberRoute` | Perfil publico/interno de uma pessoa da arvore. |
| `/pessoas/:id` | `PersonProfile.tsx` | `MemberRoute` | Alias do perfil de pessoa. |

Componentes relacionados:

- `PersonProfile.tsx`
- `PersonDataView.tsx`
- `PersonContactFields.tsx`
- `PersonEventsEditor.tsx`
- `ArquivosHistoricos.tsx`

Regras de privacidade relevantes:

- Telefone so deve aparecer se `permitir_exibir_telefone = true`.
- Endereco so deve aparecer se `permitir_exibir_endereco = true`.
- Data de nascimento deve respeitar `permitir_exibir_data_nascimento`.
- Rede social deve respeitar `permitir_exibir_rede_social` ou `permitir_exibir_instagram`.
- WhatsApp depende de telefone valido e permissao de contato.

---

### 2.5 Administracao

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/admin/login` | `AdminLogin.tsx` | publica | Entrada administrativa. |
| `/admin` | `AdminDashboard.tsx` | `ProtectedRoute` | Dashboard admin. |
| `/admin/dashboard` | `AdminDashboard.tsx` | `ProtectedRoute` | Dashboard admin. |
| `/admin/pessoas` | `AdminPessoas.tsx` | `ProtectedRoute` | Listagem de pessoas. |
| `/admin/pessoas/nova` | `AdminPessoaForm.tsx` | `ProtectedRoute` | Criacao de pessoa. |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm.tsx` | `ProtectedRoute` | Edicao de pessoa. |
| `/admin/pessoas/:id` | `AdminPessoaForm.tsx` | `ProtectedRoute` | Alias de edicao/visualizacao admin. |
| `/admin/relacionamentos` | `AdminRelacionamentos.tsx` | `ProtectedRoute` | Gestao de relacionamentos. |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm.tsx` | `ProtectedRoute` | Criacao de relacionamento. |
| `/admin/diagnostico` | `AdminDiagnostico.tsx` | `ProtectedRoute` | Diagnostico de integridade. |
| `/admin/integridade` | `AdminIntegridade.tsx` | `ProtectedRoute` | Integridade de dados. |
| `/admin/atividades` | `AdminAtividades.tsx` | `ProtectedRoute` | Logs de atividade. |
| `/admin/notificacoes` | `AdminNotificacoes.tsx` | `ProtectedRoute` | Diagnostico/gestao de notificacoes. |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos.tsx` | `ProtectedRoute` | Solicitacoes de vinculo/relacionamento. |

---

## 3. Tabelas e views do schema publico

Lista observada no Supabase:

| Objeto | Tipo | Status recomendado | Modulo |
|---|---|---|---|
| `activity_logs` | BASE TABLE | Ativa | Auditoria |
| `arquivos_historicos` | BASE TABLE | Ativa | Arquivos historicos |
| `event_attendees` | BASE TABLE | Ativa/futura | Eventos familiares |
| `family_events` | BASE TABLE | Ativa/futura | Eventos familiares |
| `forum_categorias` | BASE TABLE | Ativa | Forum |
| `forum_comentarios` | BASE TABLE | Ativa | Forum |
| `forum_denuncias` | BASE TABLE | Ativa | Forum |
| `forum_reacoes` | BASE TABLE | Ativa | Forum |
| `forum_respostas` | BASE TABLE | Ativa | Forum |
| `forum_topico_pessoas` | BASE TABLE | Ativa | Forum |
| `forum_topicos` | BASE TABLE | Ativa | Forum |
| `google_calendar_connection_status` | VIEW | Ativa | Google Calendar |
| `google_calendar_connections` | BASE TABLE | Ativa | Google Calendar |
| `google_calendar_oauth_states` | BASE TABLE | Ativa | Google Calendar |
| `google_calendar_synced_events` | BASE TABLE | Ativa | Google Calendar |
| `notificacoes_usuario` | BASE TABLE | Ativa | Notificacoes atuais |
| `notification_dispatch_logs` | BASE TABLE | Ativa | Logs tecnicos de envio |
| `notification_occurrences` | BASE TABLE | Ativa | Ocorrencias automaticas |
| `notification_preferences` | BASE TABLE | Legado provavel | Preferencias antigas |
| `notifications` | BASE TABLE | Legado provavel | Notificacoes antigas |
| `parentescos_calculados` | BASE TABLE | Ativa/futura | Parentesco calculado |
| `person_events` | BASE TABLE | Ativa | Timeline de pessoa |
| `person_generated_insights` | BASE TABLE | Ativa | Insights gerados por IA |
| `pessoa_social_profiles` | BASE TABLE | Ativa | Redes sociais por pessoa |
| `pessoas` | BASE TABLE | Essencial | Nucleo da arvore |
| `pessoas_com_estatisticas` | VIEW | Ativa | View auxiliar |
| `preferencias_notificacao` | BASE TABLE | Ativa | Preferencias atuais |
| `profiles` | BASE TABLE | Essencial | Perfil de usuario |
| `regras_parentesco` | BASE TABLE | Ativa/futura | Regras de parentesco |
| `relacionamentos` | BASE TABLE | Essencial | Nucleo da arvore |
| `relationship_change_requests` | BASE TABLE | Ativa | Solicitacoes de alteracao |
| `site_visual_settings` | BASE TABLE | Ativa | Configuracoes visuais |
| `user_favorites` | BASE TABLE | Ativa com campos legados | Favoritos |
| `user_person_links` | BASE TABLE | Essencial | Vinculo usuario-pessoa |

---

## 4. Tabelas essenciais do fluxo de usuario

### 4.1 `profiles`

Complementa `auth.users` com dados de exibicao e papel do usuario.

Uso principal:

- identificar se o usuario e `admin` ou `member`;
- exibir nome/avatar do usuario;
- apoiar permissoes administrativas.

Campos esperados:

| Coluna | Tipo | Funcao |
|---|---|---|
| `id` | uuid | Mesmo ID de `auth.users.id`. |
| `nome_exibicao` | text/varchar | Nome de exibicao do usuario. |
| `avatar_url` | text | Avatar do usuario. |
| `role` | text/varchar | `admin` ou `member`. |
| `created_at` | timestamptz | Criacao. |
| `updated_at` | timestamptz | Atualizacao. |

---

### 4.2 `user_person_links`

Tabela central para conectar usuarios autenticados a pessoas da arvore.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID do vinculo. |
| `user_id` | uuid | nao | Referencia ao usuario autenticado. |
| `pessoa_id` | uuid | nao | Referencia a `pessoas.id`. |
| `relacao_com_perfil` | varchar(100) | sim | Ex.: `Sou esta pessoa`. |
| `principal` | boolean | nao | Indica vinculo principal. |
| `created_at` | timestamptz | sim | Criacao do vinculo. |
| `dados_confirmados` | boolean | nao | Indica se o usuario confirmou os proprios dados. |
| `dados_confirmados_em` | timestamptz | sim | Data/hora da confirmacao. |
| `managed_by_admin` | boolean | nao | Indica vinculo criado/gerido por admin. |
| `can_edit` | boolean | nao | Controla se o usuario pode editar a pessoa. |
| `created_by` | uuid | sim | Usuario/admin que criou o vinculo. |
| `updated_at` | timestamptz | sim | Atualizacao. |

Constraints relevantes:

- Primary key em `id`.
- Foreign key `pessoa_id -> pessoas.id`.
- Foreign key `user_id -> auth.users.id`.
- Unique em `(user_id, pessoa_id)`.

Regras de uso:

- Cada usuario pode estar vinculado a uma ou mais pessoas.
- Cada vinculo usuario-pessoa deve ser unico.
- O campo `principal` define qual pessoa e usada como referencia principal.
- O campo `can_edit` controla edicao em `/meus-dados` e fluxos correlatos.

---

### 4.3 `pessoas`

Tabela principal de pessoas e pets da arvore genealogica.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID da pessoa. |
| `nome_completo` | varchar(255) | nao | Nome completo. |
| `data_nascimento` | varchar(50) | sim | Data ou ano de nascimento. |
| `local_nascimento` | varchar(255) | sim | Local de nascimento. |
| `data_falecimento` | varchar(50) | sim | Data ou ano de falecimento. |
| `local_falecimento` | varchar(255) | sim | Local de falecimento. |
| `local_atual` | varchar(255) | sim | Residencia atual. |
| `foto_principal_url` | text | sim | Foto/avatar principal. |
| `humano_ou_pet` | varchar(20) | nao | `Humano` ou `Pet`. |
| `cor_bg_card` | varchar(20) | sim | Cor visual do card. |
| `minibio` | text | sim | Mini biografia. |
| `curiosidades` | text | sim | Curiosidades. |
| `telefone` | varchar(20) | sim | Telefone. |
| `endereco` | text | sim | Endereco. |
| `rede_social` | varchar(500) | sim | Campo legado/simples de rede social. |
| `created_at` | timestamptz | sim | Criacao. |
| `updated_at` | timestamptz | sim | Atualizacao. |
| `arquivos_historicos` | jsonb | nao | Campo legado provavel. Hoje ha tabela relacional. |
| `lado` | varchar | nao | Lado visual na arvore. |
| `manual_generation` | smallint | sim | Geracao manual. |
| `instagram_usuario` | varchar(255) | sim | Perfil legado/simples. |
| `instagram_url` | text | sim | URL legado/simples. |
| `permitir_exibir_instagram` | boolean | sim | Privacidade de Instagram/rede social. |
| `permitir_mensagens_whatsapp` | boolean | sim | Permite contato por WhatsApp. |
| `geracao_sociologica` | varchar(80) | sim | Geracao sociologica. |
| `complemento` | text | sim | Complemento de endereco. |
| `permitir_exibir_data_nascimento` | boolean | nao | Privacidade da data de nascimento. |
| `permitir_exibir_endereco` | boolean | nao | Privacidade do endereco. |
| `permitir_exibir_rede_social` | boolean | nao | Privacidade de redes sociais. |
| `permitir_exibir_telefone` | boolean | nao | Privacidade do telefone. |
| `falecido` | boolean | nao | Status de falecimento. |
| `local_nascimento_exterior` | boolean | nao | Local de nascimento fora do Brasil. |
| `local_falecimento_exterior` | boolean | nao | Local de falecimento fora do Brasil. |

Observacoes:

- `data_nascimento` e `data_falecimento` sao `varchar`, pois o sistema aceita ano isolado ou datas em formato textual.
- `arquivos_historicos` em JSON e legado provavel. A fonte atual recomendada e a tabela `arquivos_historicos`.
- Redes sociais tem campos legados em `pessoas`, mas o modelo atual mais flexivel e `pessoa_social_profiles`.

---

### 4.4 `relacionamentos`

Guarda as conexoes entre pessoas.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID do relacionamento. |
| `pessoa_origem_id` | uuid | nao | Pessoa de origem. |
| `pessoa_destino_id` | uuid | nao | Pessoa de destino. |
| `tipo_relacionamento` | varchar(50) | nao | Ex.: `pai`, `mae`, `filho`, `irmao`, `conjuge`. |
| `subtipo_relacionamento` | varchar(50) | sim | Ex.: `sangue`, `adotivo`, `casamento`, `uniao`, `separado`. |
| `created_at` | timestamptz | sim | Criacao. |
| `updated_at` | timestamptz | sim | Atualizacao. |
| `ativo` | boolean | nao | Relacionamento ativo/inativo. |
| `data_casamento` | text | sim | Data de casamento/uniao. |
| `data_separacao` | date | sim | Data de separacao. |
| `local_casamento` | text | sim | Local do casamento/uniao. |
| `local_separacao` | text | sim | Local da separacao. |
| `observacoes` | text | sim | Observacoes. |

Constraints relevantes:

- Foreign key `pessoa_origem_id -> pessoas.id`.
- Foreign key `pessoa_destino_id -> pessoas.id`.
- Checks para `tipo_relacionamento` e `subtipo_relacionamento`.

Regras de negocio documentadas no codigo:

- `conjuge`: A -> B cria B -> A.
- `irmao`: A -> B cria B -> A.
- `pai`/`mae`: filho -> pai/mae cria pai/mae -> filho.
- `filho`: inverso so deve ser criado quando o sistema sabe se o inverso e `pai` ou `mae`.

---

## 5. Tabelas auxiliares de pessoa

### 5.1 `arquivos_historicos`

Registros historicos associados a pessoas ou relacionamentos.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID do arquivo. |
| `pessoa_id` | uuid | nao | Pessoa vinculada. |
| `url` | text | nao | URL publica ou interna do arquivo. |
| `titulo` | varchar(255) | sim | Titulo. |
| `descricao` | text | sim | Descricao. |
| `ano` | varchar(10) | sim | Ano aproximado. |
| `tipo` | varchar(50) | sim | Ex.: `imagem`, `pdf`. |
| `ordem` | integer | sim | Ordem de exibicao. |
| `created_at` | timestamptz | sim | Criacao. |
| `updated_at` | timestamptz | sim | Atualizacao. |
| `relacionamento_id` | uuid | sim | Relacionamento associado. |
| `storage_bucket` | text | sim | Bucket no Supabase Storage. |
| `storage_path` | text | sim | Caminho no Storage. |
| `mime_type` | text | sim | MIME type. |
| `created_by` | uuid | sim | Usuario que criou. |
| `categoria_evento` | text | sim | Categoria historica. |

Uso:

- Fotos e documentos no perfil da pessoa.
- Arquivos associados a relacionamentos.
- Registros historicos familiares.

---

### 5.2 `pessoa_social_profiles`

Modelo atual para multiplas redes sociais por pessoa.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID do perfil social. |
| `pessoa_id` | uuid | nao | Pessoa vinculada. |
| `rede` | text | nao | Ex.: Instagram, Facebook, LinkedIn, TikTok. |
| `perfil` | text | nao | Usuario/perfil informado. |
| `url` | text | sim | URL calculada ou informada. |
| `exibir_no_perfil` | boolean | nao | Controla exibicao publica. |
| `created_at` | timestamptz | nao | Criacao. |
| `updated_at` | timestamptz | nao | Atualizacao. |

Constraints:

- Foreign key `pessoa_id -> pessoas.id`.
- Unique em `(pessoa_id, rede)`.
- Check em `rede`.

Uso:

- `/meus-dados`
- `/minha-arvore/editar`
- `/admin/pessoas/:id/editar`
- perfil publico, respeitando privacidade.

---

### 5.3 `person_events`

Eventos biograficos/timeline de uma pessoa.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID do evento. |
| `pessoa_id` | uuid | nao | Pessoa vinculada. |
| `tipo` | text | nao | Tipo do evento. |
| `titulo` | text | nao | Titulo. |
| `data_evento` | text | sim | Data textual ou ano. |
| `local` | text | sim | Local do evento. |
| `descricao` | text | sim | Descricao. |
| `ordem` | integer | nao | Ordem de exibicao. |
| `created_at` | timestamptz | nao | Criacao. |
| `updated_at` | timestamptz | nao | Atualizacao. |

Tipos usados no TypeScript:

- `imigracao`
- `chegada_brasil`
- `mudanca`
- `batismo`
- `formatura`
- `profissao`
- `militar`
- `religioso`
- `memoria`
- `outro`

---

### 5.4 `person_generated_insights`

Armazena conteudos gerados por IA para a pessoa.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID do insight. |
| `pessoa_id` | uuid | nao | Pessoa vinculada. |
| `tipo` | text | nao | Tipo de insight. |
| `data_nascimento` | text | nao | Data usada como base da geracao. |
| `conteudo` | jsonb | nao | Conteudo gerado. |
| `modelo` | text | sim | Modelo de IA usado. |
| `prompt_version` | text | nao | Versao do prompt. |
| `status` | text | nao | Ex.: `completed`, erro etc. |
| `error_message` | text | sim | Mensagem de erro, se houver. |
| `created_at` | timestamptz | nao | Criacao. |
| `updated_at` | timestamptz | nao | Atualizacao. |

Constraints:

- Foreign key `pessoa_id -> pessoas.id`.
- Unique provavel em `(pessoa_id, tipo)`.
- Check em `tipo`.
- Check em `status`.

Uso esperado:

- Geracao/regeneracao por admin.
- Exibicao condicional no perfil publico.
- Evitar exibir cards vazios ou mensagem `Conteudo ainda nao gerado.` publicamente.

---

## 6. Notificacoes e preferencias

### 6.1 Modelo atual

O modelo atual usa as tabelas em portugues:

- `preferencias_notificacao`
- `notificacoes_usuario`

Fluxo:

```txt
preferencias_notificacao
   controla
notificationDispatchService
   gera
notificacoes_usuario
   registra envio tecnico em
notification_dispatch_logs
   evita duplicidade/rotina em
notification_occurrences
```

---

### 6.2 `preferencias_notificacao`

Preferencias individuais por usuario.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID. |
| `user_id` | uuid | nao | Usuario. |
| `receber_aniversarios` | boolean | nao | Receber aniversarios. |
| `receber_datas_memoria` | boolean | nao | Receber datas de memoria. |
| `receber_eventos` | boolean | nao | Receber eventos. |
| `receber_avisos_gerais` | boolean | nao | Receber avisos gerais. |
| `receber_email` | boolean | nao | Canal email geral. |
| `receber_push` | boolean | nao | Canal push. |
| `receber_whatsapp` | boolean | nao | Canal WhatsApp. |
| `receber_email_novo_usuario` | boolean | nao | Email para novo usuario. |
| `receber_email_datas_especiais` | boolean | nao | Email para datas especiais. |
| `receber_email_novas_mensagens_forum` | boolean | nao | Email para forum. |
| `receber_email_novos_registros_historicos` | boolean | nao | Email para novos registros historicos. |
| `receber_email_evento_historico_familia` | boolean | nao | Email para evento historico familiar. |
| `created_at` | timestamptz | nao | Criacao. |
| `updated_at` | timestamptz | nao | Atualizacao. |

Constraints:

- Primary key em `id`.
- Unique em `user_id`.
- Foreign key `user_id -> auth.users.id`.

Uso:

- `/meus-dados` ou pagina de ajustes de notificacoes.
- `userEngagementService.ts`.
- `notificationDispatchService.ts`.
- `notificationAdminService.ts`.

---

### 6.3 `notificacoes_usuario`

Notificacoes visiveis para o usuario.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID. |
| `user_id` | uuid | nao | Usuario destinatario. |
| `titulo` | text | nao | Titulo. |
| `mensagem` | text | nao | Corpo. |
| `tipo` | text | nao | Tipo de notificacao. |
| `canal` | text | nao | Ex.: `interna`, `email`, `push`, `whatsapp`. |
| `lida` | boolean | nao | Status de leitura. |
| `link` | text | sim | Link de destino. |
| `metadata` | jsonb | nao | Dados auxiliares. |
| `created_at` | timestamptz | nao | Criacao. |
| `updated_at` | timestamptz | nao | Atualizacao. |

Uso:

- Central de notificacoes.
- Marcar como lida.
- Remover notificacao.
- Criar notificacoes internas.

---

### 6.4 `notification_dispatch_logs`

Logs tecnicos de envio.

Uso:

- Registrar tentativas de envio.
- Registrar falhas.
- Diagnostico admin.
- Acompanhar canal usado (`interna`, `email`, `push`, `whatsapp`).

Nao deve ser confundida com `notificacoes_usuario`. Uma notificacao pode ser visivel para o usuario e tambem gerar logs de tentativa de entrega.

---

### 6.5 `notification_occurrences`

Controle de ocorrencias automaticas.

Uso:

- Evitar duplicidade de notificacoes recorrentes.
- Registrar execucoes de aniversario/datas de memoria.
- Apoiar a Edge Function `run-daily-notifications`.

---

### 6.6 Tabelas legadas provaveis: `notification_preferences` e `notifications`

Existem tambem:

- `notification_preferences`
- `notifications`

Essas tabelas parecem pertencer a uma versao anterior em ingles do modulo de notificacoes.

O codigo atual pesquisado usa principalmente:

- `preferencias_notificacao`
- `notificacoes_usuario`

Recomendacao:

1. Nao apagar diretamente.
2. Verificar contagem de registros.
3. Verificar data de ultima escrita.
4. Migrar dados remanescentes, se houver.
5. Criar migration de limpeza apenas depois de validar que nao ha dependencias.

SQL de auditoria:

```sql
select 'notification_preferences' as tabela, count(*) from public.notification_preferences
union all
select 'notifications', count(*) from public.notifications
union all
select 'preferencias_notificacao', count(*) from public.preferencias_notificacao
union all
select 'notificacoes_usuario', count(*) from public.notificacoes_usuario;
```

---

## 7. Favoritos

### 7.1 `user_favorites`

Tabela ativa de favoritos do usuario.

Campos observados:

| Coluna | Tipo | Nulo | Status | Funcao |
|---|---|---|---|---|
| `id` | uuid | nao | Atual | ID. |
| `user_id` | uuid | nao | Atual | Usuario. |
| `tipo_conteudo` | varchar(40) | sim | Legado | Tipo antigo. |
| `conteudo_id` | varchar(255) | sim | Legado | ID antigo. |
| `titulo` | varchar(255) | sim | Legado | Titulo antigo. |
| `created_at` | timestamptz | sim | Atual | Criacao. |
| `entity_type` | text | nao | Atual | Tipo da entidade. |
| `entity_id` | text | nao | Atual | ID da entidade. |
| `label` | text | nao | Atual | Nome exibido. |
| `description` | text | sim | Atual | Descricao. |
| `href` | text | sim | Atual | Link. |
| `metadata` | jsonb | nao | Atual | Dados auxiliares. |

Tipos atuais aceitos em `entity_type`:

- `person`
- `historical_file`
- `relationship`
- `forum_topic`
- `family_event`
- `person_event`
- `page`
- `timeline_item`
- `story`

Recomendacao:

- Manter os campos legados ate garantir que nao ha dados dependentes.
- Futuramente remover `tipo_conteudo`, `conteudo_id` e `titulo` se estiverem totalmente migrados.

SQL de auditoria:

```sql
select
  count(*) as favoritos_com_campos_modernos_vazios
from public.user_favorites
where entity_type is null
   or entity_id is null
   or label is null;
```

---

## 8. Eventos familiares e calendario

### 8.1 `family_events`

Eventos familiares gerais, como encontros, avisos, aniversarios ou confraternizacoes.

### 8.2 `event_attendees`

Presenca/RSVP de usuarios em eventos familiares.

Diferenca importante:

| Tabela | Uso |
|---|---|
| `person_events` | Eventos biograficos de uma pessoa especifica. |
| `family_events` | Eventos familiares gerais. |
| `event_attendees` | Participantes/convites dos eventos familiares. |

---

## 9. Forum

Tabelas do forum:

- `forum_categorias`
- `forum_topicos`
- `forum_respostas`
- `forum_comentarios`
- `forum_reacoes`
- `forum_denuncias`
- `forum_topico_pessoas`

Uso esperado:

- Categorias do forum.
- Topicos criados por usuarios.
- Respostas e comentarios.
- Reacoes.
- Denuncias/moderacao.
- Associacao entre topicos e pessoas da arvore.

Services esperados:

- `forumService.ts`

Rotas esperadas:

- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`

---

## 10. Google Calendar

Tabelas/views:

- `google_calendar_connections`
- `google_calendar_oauth_states`
- `google_calendar_synced_events`
- `google_calendar_connection_status`  view

Uso esperado:

- Guardar conexao OAuth.
- Controlar estado OAuth temporario.
- Sincronizar eventos.
- Exibir status de conexao via view.

Service esperado:

- `googleCalendarService.ts`

---

## 11. Parentesco calculado

Tabelas:

- `regras_parentesco`
- `parentescos_calculados`

Uso esperado:

- Definir regras para interpretar caminhos na arvore.
- Armazenar relacoes calculadas para consulta mais rapida.
- Apoiar exibicao de parentesco entre duas pessoas.

Essas tabelas sao independentes de `relacionamentos`: `relacionamentos` guarda a aresta base; `parentescos_calculados` pode guardar inferencias derivadas.

---

## 12. Auditoria

### 12.1 `activity_logs`

Registra acoes relevantes do sistema.

Campos observados:

| Coluna | Tipo | Nulo | Funcao |
|---|---|---|---|
| `id` | uuid | nao | ID. |
| `actor_user_id` | uuid | sim | Usuario que executou. |
| `actor_pessoa_id` | uuid | sim | Pessoa associada ao ator. |
| `actor_display_name` | text | sim | Nome exibido do ator. |
| `action` | text | nao | Acao executada. |
| `entity_type` | text | nao | Tipo de entidade. |
| `entity_id` | uuid | sim | ID da entidade afetada. |
| `entity_label` | text | sim | Nome/titulo da entidade. |
| `metadata` | jsonb | nao | Dados auxiliares. |
| `created_at` | timestamptz | nao | Data do log. |

Acoes esperadas no TypeScript incluem:

- `person.created`
- `person.updated`
- `person.photo_updated`
- `person.privacy_updated`
- `user_person_link.created`
- `user_person_link.updated`
- `user_person_link.deleted`
- `person_event.added`
- `person_event.updated`
- `person_event.removed`
- `relationship.created`
- `relationship.updated`
- `relationship.deleted`
- `notification_preferences.updated`
- `notification.created`
- `notification.dispatched`
- `notification.dispatch_failed`
- `notification.marked_read`
- `notification.removed`
- `person_insights.generated`
- `person_insights.regenerated`
- `first_access.confirmed`

---

## 13. Views

### 13.1 `pessoas_com_estatisticas`

View auxiliar para leitura agregada de pessoas.

Campos observados incluem dados de `pessoas` e contadores:

- `total_conjuges`
- `total_filhos`
- `total_pais`
- `total_arquivos`

Uso esperado:

- Diagnostico.
- Listagens administrativas.
- Estatisticas rapidas.

Nao deve ser usada como fonte principal de escrita.

---

### 13.2 `google_calendar_connection_status`

View auxiliar para status de conexao com Google Calendar.

Uso esperado:

- Mostrar se o usuario esta conectado.
- Evitar montar esse estado manualmente a partir de multiplas tabelas.

---

## 14. Pontos de limpeza e organizacao recomendados

### 14.1 Tabelas provavelmente legadas

| Objeto | Motivo | Recomendacao |
|---|---|---|
| `notification_preferences` | Versao antiga em ingles; codigo atual usa `preferencias_notificacao`. | Auditar, migrar dados se houver, remover depois. |
| `notifications` | Versao antiga em ingles; codigo atual usa `notificacoes_usuario`. | Auditar, migrar dados se houver, remover depois. |

SQL para contagem:

```sql
select 'notification_preferences' as tabela, count(*) from public.notification_preferences
union all
select 'notifications', count(*) from public.notifications
union all
select 'preferencias_notificacao', count(*) from public.preferencias_notificacao
union all
select 'notificacoes_usuario', count(*) from public.notificacoes_usuario;
```

SQL para ultima atividade:

```sql
select
  'notification_preferences' as tabela,
  min(created_at) as primeiro_registro,
  max(updated_at) as ultima_atualizacao,
  count(*) as total
from public.notification_preferences
union all
select
  'notifications',
  min(created_at),
  max(created_at),
  count(*)
from public.notifications;
```

---

### 14.2 Colunas provavelmente legadas

| Tabela | Coluna | Motivo | Recomendacao |
|---|---|---|---|
| `pessoas` | `arquivos_historicos` | Hoje existe tabela relacional `arquivos_historicos`. | Verificar se esta vazia antes de remover. |
| `pessoas` | `rede_social` | Modelo atual suporta multiplas redes em `pessoa_social_profiles`. | Manter como fallback ate migracao completa. |
| `pessoas` | `instagram_usuario` | Modelo atual suporta multiplas redes em `pessoa_social_profiles`. | Manter como fallback ate migracao completa. |
| `pessoas` | `instagram_url` | Modelo atual suporta multiplas redes em `pessoa_social_profiles`. | Manter como fallback ate migracao completa. |
| `user_favorites` | `tipo_conteudo` | Modelo atual usa `entity_type`. | Remover so depois de auditoria. |
| `user_favorites` | `conteudo_id` | Modelo atual usa `entity_id`. | Remover so depois de auditoria. |
| `user_favorites` | `titulo` | Modelo atual usa `label`. | Remover so depois de auditoria. |

SQL para verificar `pessoas.arquivos_historicos`:

```sql
select count(*)
from public.pessoas
where arquivos_historicos is not null
  and arquivos_historicos <> '[]'::jsonb;
```

SQL para verificar favoritos parcialmente migrados:

```sql
select
  count(*) as favoritos_com_campos_modernos_vazios
from public.user_favorites
where entity_type is null
   or entity_id is null
   or label is null;
```

---

## 15. Queries uteis de diagnostico

### 15.1 Listar tabelas/views do schema publico

```sql
select
  table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

### 15.2 Listar colunas e tipos de tabelas principais

```sql
select
  table_name as tabela,
  ordinal_position as ordem,
  column_name as coluna,
  data_type as tipo,
  udt_name as tipo_postgres,
  is_nullable as aceita_nulo,
  column_default as valor_padrao
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

### 15.3 Listar constraints

```sql
select
  tc.table_name as tabela,
  tc.constraint_name as constraint,
  tc.constraint_type as tipo_constraint,
  kcu.column_name as coluna,
  ccu.table_name as tabela_referenciada,
  ccu.column_name as coluna_referenciada
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
  and tc.table_schema = kcu.table_schema
left join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
  and tc.table_schema = ccu.constraint_schema
where tc.table_schema = 'public'
order by tc.table_name, tc.constraint_type, tc.constraint_name;
```

### 15.4 Verificar dependencias antes de remover tabelas

```sql
select
  dependent_ns.nspname as dependent_schema,
  dependent_view.relname as dependent_object,
  source_ns.nspname as source_schema,
  source_table.relname as source_table
from pg_depend
join pg_rewrite on pg_depend.objid = pg_rewrite.oid
join pg_class dependent_view on pg_rewrite.ev_class = dependent_view.oid
join pg_class source_table on pg_depend.refobjid = source_table.oid
join pg_namespace dependent_ns on dependent_ns.oid = dependent_view.relnamespace
join pg_namespace source_ns on source_ns.oid = source_table.relnamespace
where source_ns.nspname = 'public'
  and source_table.relname in (
    'notification_preferences',
    'notifications'
  );
```

---

## 16. Recomendacoes finais

### 16.1 Nao remover agora sem auditoria

Mesmo quando uma tabela parece legada, ela pode conter dados antigos ainda nao migrados ou ser usada por RPCs, Edge Functions ou views.

Antes de qualquer `DROP TABLE` ou `DROP COLUMN`:

1. verificar contagem de registros;
2. verificar ultima escrita;
3. procurar referencias no codigo;
4. procurar dependencias no banco;
5. fazer backup;
6. criar migration especifica e reversivel quando possivel.

---

### 16.2 Organizacao sugerida

Criar futuramente uma migration de limpeza com fases:

1. **Auditoria**
   - Contar registros em tabelas legadas.
   - Verificar dados nao migrados.

2. **Migracao complementar**
   - Migrar dados de `notifications` para `notificacoes_usuario`, se existirem.
   - Migrar dados de `notification_preferences` para `preferencias_notificacao`, se existirem.
   - Migrar `pessoas.arquivos_historicos` para `arquivos_historicos`, se houver conteudo.
   - Migrar campos antigos de `user_favorites` para os campos atuais.

3. **Depreciacao**
   - Marcar tabelas/colunas antigas como deprecated em documentacao.
   - Evitar novas escritas.

4. **Remocao**
   - Remover somente depois de uma rodada de producao sem uso.

---

## 17. Criterios para limpeza futura

Antes de remover tabela, coluna ou campo legado:

1. confirmar se ha migration atual equivalente;
2. buscar uso no frontend, services, Edge Functions, testes e scripts;
3. conferir dependencias por constraints, views, triggers, RPCs e policies;
4. executar diagnostico em staging ou ambiente local;
5. criar backup ou plano de reversao;
6. registrar a decisao em documentacao operacional;
7. evitar alteracao simultanea de schema, UI e regra de negocio.

Itens marcados como **legado provavel** nao devem ser apagados apenas por parecerem antigos. Eles indicam que o modelo evoluiu, mas ainda podem sustentar compatibilidade, migracao incremental ou dados historicos.


## 18. Resumo executivo

O fluxo atual esta coerente e funcional em sua estrutura principal:

```txt
auth.users
 profiles
 user_person_links
 pessoas
 relacionamentos
```

As funcionalidades auxiliares tambem estao bem separadas:

```txt
pessoa_social_profiles
person_events
person_generated_insights
arquivos_historicos
user_favorites
preferencias_notificacao
notificacoes_usuario
activity_logs
```

O principal ponto de atencao e a presenca de camadas legadas:

```txt
notification_preferences
notifications
pessoas.arquivos_historicos
user_favorites.tipo_conteudo
user_favorites.conteudo_id
user_favorites.titulo
```

Esses itens nao indicam necessariamente erro. Indicam evolucao do schema. A recomendacao e manter por ora, documentar como legado provavel e limpar apenas apos auditoria controlada.
