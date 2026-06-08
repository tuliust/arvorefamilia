# Estrutura de usuários, banco de dados e fluxos de pessoa

> Última atualização: 2026-06-08  
> Projeto: `tuliust/arvorefamilia`  
> Stack: React + Vite + TypeScript + Supabase Auth + Supabase Postgres  
> Local recomendado: `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md`

Este documento consolida a estrutura atual relacionada a usuários, pessoas, perfis, vínculos, preferências, notificações, favoritos, eventos, arquivos históricos, insights gerados por IA, fórum e demais tabelas/views de apoio.

A finalidade é servir como referência para desenvolvimento, manutenção, auditoria de dados, limpeza controlada de schema e evolução das funcionalidades.

## Como usar este documento

Use este arquivo para entender **como usuários autenticados, pessoas da árvore e tabelas de apoio se conectam**. Ele não substitui:

- `docs/operacao/MIGRATIONS_SUPABASE.md`: regras operacionais para aplicar ou revisar migrations.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, proteções e regras de acesso.
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: comportamento de produto de pessoas, perfil público e administração.
- `docs/funcionalidades/NOTIFICACOES.md`: arquitetura específica de notificações.
- `docs/funcionalidades/FORUM.md`: comportamento funcional do fórum.
- `docs/GUIA_CORRECAO_ERROS.md`: investigação por sintoma.

Regra central: **a fonte da verdade do schema é `supabase/migrations`**. Scripts SQL soltos, tabelas legadas e colunas legadas devem ser tratados como histórico ou compatibilidade até auditoria específica.

---

## 1. Visão geral do modelo

O sistema separa claramente dois conceitos:

1. **Usuário autenticado**
   Representado pelo usuário do Supabase Auth (`auth.users`) e complementado por tabelas públicas como `profiles`, `user_person_links`, `preferencias_notificacao`, `notificacoes_usuario` e `user_favorites`.

2. **Pessoa da árvore genealógica**
   Representada pela tabela `pessoas` e conectada a outras pessoas por `relacionamentos`. A pessoa também pode ter eventos, arquivos históricos, redes sociais, insights gerados, sugestões de alteração e registros de auditoria associados.

Fluxo conceitual:

```txt
auth.users
  -> profiles
  -> user_person_links
  -> pessoas
  -> relacionamentos / arquivos_historicos / person_events / pessoa_social_profiles / person_generated_insights
```

Fluxo de engajamento do usuário:

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
  -> forum_topicos
  -> forum_topico_pessoas
  -> pessoas
  -> user_person_links
  -> notificacoes_usuario
```

---

## 2. Páginas e rotas relevantes

### 2.1 Autenticação e primeiro acesso

| Rota | Componente | Função |
|---|---|---|
| `/entrar` | `src/app/pages/Entrar.tsx` | Login, primeiro acesso, validação de código, criação de conta e vínculo inicial com pessoa da árvore. |

Fluxo resumido:

1. Usuário informa código de primeiro acesso.
2. O código é validado contra uma pessoa existente.
3. Usuário cria conta no Supabase Auth.
4. O metadata inicial recebe `nome_exibicao`, `pessoa_id` e `primeiro_acesso`.
5. O sistema cria ou resolve o vínculo em `user_person_links`.
6. Se os dados ainda não foram confirmados, o usuário é enviado para revisar seus dados.

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

### 2.2 Área da árvore

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/` | redireciona para `/minha-arvore` | `TreeAccessRoute` | Entrada principal da árvore. |
| `/minha-arvore` | `Home.tsx` | `TreeAccessRoute` | Visualização principal da árvore. |
| `/genealogia` | `Home.tsx` | `TreeAccessRoute` | View genealógica. |
| `/visao-completa` | `Home.tsx` | `TreeAccessRoute` | View completa da árvore. |
| `/minha-arvore/editar` | `MinhaArvore.tsx` | `MemberRoute` | Edição da própria árvore e vínculos familiares pelo membro. |

Services e componentes relacionados:

- `dataService.ts`
- `memberTreeService.ts`
- `relationshipChangeRequestService.ts`
- `FamilyTree.tsx`
- `PersonNode.tsx`
- `directFamilyDistributedLayout.ts`

---

### 2.3 Dados pessoais do usuário

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/meus-dados` | `MeusDados.tsx` | `MemberRoute` | Edição dos dados da pessoa vinculada ao usuário logado. |
| `/meus-vinculos` | `MeusVinculos.tsx` | `MemberRoute` | Visualização/gestão de vínculos usuário-pessoa. |
| `/vincular-perfil` | `VincularPerfil.tsx` | `MemberRoute` | Solicitação ou criação de vínculo adicional. |

Campos editáveis pelo próprio usuário são centralizados no tipo `EditableOwnPersonPayload` e nas funções de `personFields.ts`.

Campos principais editáveis:

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
- `complemento`
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

### 2.4 Perfil público de pessoa

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/pessoa/:id` | `PersonProfile.tsx` | `MemberRoute` | Perfil público/interno de uma pessoa da árvore. |
| `/pessoas/:id` | `PersonProfile.tsx` | `MemberRoute` | Alias do perfil de pessoa. |

Componentes relacionados:

- `PersonProfile.tsx`
- `PersonDataView.tsx`
- `PersonContactFields.tsx`
- `PersonEventsEditor.tsx`
- `ArquivosHistoricos.tsx`

Regras de privacidade relevantes:

- Telefone só deve aparecer se `permitir_exibir_telefone = true`.
- Endereço só deve aparecer se `permitir_exibir_endereco = true`.
- Data de nascimento deve respeitar `permitir_exibir_data_nascimento`.
- Rede social deve respeitar `permitir_exibir_rede_social` ou `permitir_exibir_instagram`.
- WhatsApp depende de telefone válido e permissão de contato.

Ações recentes em `/pessoa/:id`:

- botão **Editar** saiu do header e passou para o card principal, ao lado do botão de favorito;
- botão de editar é redondo, apenas com ícone de lápis;
- exibição restrita a admin, responsável pelo perfil ou próprio usuário;
- botão **Inserir Informações** permite inclusão direta quando autorizado ou sugestão para revisão admin quando não autorizado.

---

### 2.5 Administração

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/admin/login` | `AdminLogin.tsx` | pública | Entrada administrativa. |
| `/admin` | `AdminDashboard.tsx` | `ProtectedRoute` | Dashboard admin. |
| `/admin/dashboard` | `AdminDashboard.tsx` | `ProtectedRoute` | Dashboard admin. |
| `/admin/home` | `AdminHomeSettings.tsx` | `ProtectedRoute` | Configurações visuais da home pública. |
| `/admin/pessoas` | `AdminPessoas.tsx` | `ProtectedRoute` | Listagem de pessoas. |
| `/admin/pessoas/nova` | `AdminPessoaForm.tsx` | `ProtectedRoute` | Criação de pessoa. |
| `/admin/pessoas/:id/editar` | `AdminPessoaForm.tsx` | `ProtectedRoute` | Edição de pessoa. |
| `/admin/pessoas/:id` | `AdminPessoaForm.tsx` | `ProtectedRoute` | Alias de edição/visualização admin. |
| `/admin/relacionamentos` | `AdminRelacionamentos.tsx` | `ProtectedRoute` | Gestão de relacionamentos. |
| `/admin/relacionamentos/novo` | `AdminRelacionamentoForm.tsx` | `ProtectedRoute` | Criação de relacionamento. |
| `/admin/importacao` | `AdminImportacao.tsx` | `ProtectedRoute` | Importação. |
| `/admin/migrar-dados` | `AdminMigrarDados.tsx` | `ProtectedRoute` | Ferramenta destrutiva de migração de seed. |
| `/admin/diagnostico` | `AdminDiagnostico.tsx` | `ProtectedRoute` | Diagnóstico de integridade. |
| `/admin/integridade` | `AdminIntegridade.tsx` | `ProtectedRoute` | Integridade de dados. |
| `/admin/atividades` | `AdminAtividades.tsx` | `ProtectedRoute` | Logs de atividade. |
| `/admin/notificacoes` | `AdminNotificacoes.tsx` | `ProtectedRoute` | Diagnóstico/gestão de notificações. |
| `/admin/solicitacoes-vinculos` | `AdminSolicitacoesVinculos.tsx` | `ProtectedRoute` | Solicitações de vínculo, sugestões de perfil e relacionamento. |

Ações recentes em `/admin/pessoas`:

- botão de copiar ID da pessoa;
- botão de resetar perfil;
- RPC `admin_reset_person_profile`;
- defaults booleanos de privacidade para `true`.

---

## 3. Tabelas e views do schema público

Lista observada no Supabase:

| Objeto | Tipo | Status recomendado | Módulo |
|---|---|---|---|
| `activity_logs` | BASE TABLE | Ativa | Auditoria |
| `arquivos_historicos` | BASE TABLE | Ativa | Arquivos históricos |
| `event_attendees` | BASE TABLE | Ativa/futura | Eventos familiares |
| `family_events` | BASE TABLE | Ativa/futura | Eventos familiares |
| `forum_categorias` | BASE TABLE | Ativa | Fórum |
| `forum_comentarios` | BASE TABLE | Ativa | Fórum |
| `forum_denuncias` | BASE TABLE | Ativa | Fórum |
| `forum_reacoes` | BASE TABLE | Ativa | Fórum |
| `forum_respostas` | BASE TABLE | Ativa | Fórum |
| `forum_topico_pessoas` | BASE TABLE | Ativa | Fórum |
| `forum_topicos` | BASE TABLE | Ativa | Fórum |
| `google_calendar_connection_status` | VIEW | Ativa | Google Calendar |
| `google_calendar_connections` | BASE TABLE | Ativa | Google Calendar |
| `google_calendar_oauth_states` | BASE TABLE | Ativa | Google Calendar |
| `google_calendar_synced_events` | BASE TABLE | Ativa | Google Calendar |
| `notificacoes_usuario` | BASE TABLE | Ativa | Notificações atuais |
| `notification_dispatch_logs` | BASE TABLE | Ativa | Logs técnicos de envio |
| `notification_occurrences` | BASE TABLE | Ativa | Ocorrências automáticas |
| `notification_preferences` | BASE TABLE | Legado provável | Preferências antigas |
| `notifications` | BASE TABLE | Legado provável | Notificações antigas |
| `parentescos_calculados` | BASE TABLE | Ativa/futura | Parentesco calculado |
| `person_events` | BASE TABLE | Ativa | Timeline de pessoa |
| `person_generated_insights` | BASE TABLE | Ativa | Insights gerados por IA |
| `person_profile_suggestions` | BASE TABLE | Ativa | Sugestões de perfil |
| `pessoa_social_profiles` | BASE TABLE | Ativa | Redes sociais por pessoa |
| `pessoas` | BASE TABLE | Essencial | Núcleo da árvore |
| `pessoas_com_estatisticas` | VIEW | Ativa | View auxiliar |
| `preferencias_notificacao` | BASE TABLE | Ativa | Preferências atuais |
| `profiles` | BASE TABLE | Essencial | Perfil de usuário |
| `regras_parentesco` | BASE TABLE | Ativa/futura | Regras de parentesco |
| `relacionamentos` | BASE TABLE | Essencial | Núcleo da árvore |
| `relationship_change_requests` | BASE TABLE | Ativa | Solicitações de alteração |
| `site_visual_settings` | BASE TABLE | Ativa | Configurações visuais |
| `user_favorites` | BASE TABLE | Ativa com campos legados | Favoritos |
| `user_person_links` | BASE TABLE | Essencial | Vínculo usuário-pessoa |

---

## 4. Tabelas essenciais do fluxo de usuário

### 4.1 `profiles`

Complementa `auth.users` com dados de exibição e papel do usuário.

Uso principal:

- identificar se o usuário é `admin` ou `member`;
- exibir nome/avatar do usuário;
- apoiar permissões administrativas;
- fornecer avatar/nome em páginas como fórum.

Campos esperados:

| Coluna | Tipo | Função |
|---|---|---|
| `id` | uuid | Mesmo ID de `auth.users.id`. |
| `nome_exibicao` | text/varchar | Nome de exibição do usuário. |
| `avatar_url` | text | Avatar do usuário. |
| `role` | text/varchar | `admin` ou `member`. |
| `created_at` | timestamptz | Criação. |
| `updated_at` | timestamptz | Atualização. |

---

### 4.2 `user_person_links`

Tabela central para conectar usuários autenticados a pessoas da árvore.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID do vínculo. |
| `user_id` | uuid | não | Referência ao usuário autenticado. |
| `pessoa_id` | uuid | não | Referência a `pessoas.id`. |
| `relacao_com_perfil` | varchar(100) | sim | Ex.: `Sou esta pessoa`. |
| `principal` | boolean | não | Indica vínculo principal. |
| `created_at` | timestamptz | sim | Criação do vínculo. |
| `dados_confirmados` | boolean | não | Indica se o usuário confirmou os próprios dados. |
| `dados_confirmados_em` | timestamptz | sim | Data/hora da confirmação. |
| `managed_by_admin` | boolean | não | Indica vínculo criado/gerido por admin. |
| `can_edit` | boolean | não | Controla se o usuário pode editar a pessoa. |
| `created_by` | uuid | sim | Usuário/admin que criou o vínculo. |
| `updated_at` | timestamptz | sim | Atualização. |

Constraints relevantes:

- Primary key em `id`.
- Foreign key `pessoa_id -> pessoas.id`.
- Foreign key `user_id -> auth.users.id`.
- Unique em `(user_id, pessoa_id)`.

Regras de uso:

- Cada usuário pode estar vinculado a uma ou mais pessoas.
- Cada vínculo usuário-pessoa deve ser único.
- O campo `principal` define qual pessoa é usada como referência principal.
- O campo `can_edit` controla edição em `/meus-dados`, `/minha-arvore/editar` e fluxos correlatos.

---

### 4.3 `pessoas`

Tabela principal de pessoas e pets da árvore genealógica.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID da pessoa. |
| `nome_completo` | varchar(255) | não | Nome completo. |
| `data_nascimento` | varchar(50) | sim | Data ou ano de nascimento. |
| `local_nascimento` | varchar(255) | sim | Local de nascimento. |
| `data_falecimento` | varchar(50) | sim | Data ou ano de falecimento. |
| `local_falecimento` | varchar(255) | sim | Local de falecimento. |
| `local_atual` | varchar(255) | sim | Residência atual. |
| `foto_principal_url` | text | sim | Foto/avatar principal. |
| `humano_ou_pet` | varchar(20) | não | `Humano` ou `Pet`. |
| `cor_bg_card` | varchar(20) | sim | Cor visual do card. |
| `minibio` | text | sim | Mini biografia. |
| `curiosidades` | text | sim | Curiosidades. |
| `telefone` | varchar(20) | sim | Telefone. |
| `endereco` | text | sim | Endereço. |
| `rede_social` | varchar(500) | sim | Campo legado/simples de rede social. |
| `created_at` | timestamptz | sim | Criação. |
| `updated_at` | timestamptz | sim | Atualização. |
| `arquivos_historicos` | jsonb | não | Campo legado provável. Hoje há tabela relacional. |
| `lado` | varchar | não | Lado visual na árvore. |
| `manual_generation` | smallint | sim | Geração manual. |
| `instagram_usuario` | varchar(255) | sim | Perfil legado/simples. |
| `instagram_url` | text | sim | URL legado/simples. |
| `permitir_exibir_instagram` | boolean | sim | Privacidade de Instagram/rede social. |
| `permitir_mensagens_whatsapp` | boolean | sim | Permite contato por WhatsApp. |
| `geracao_sociologica` | varchar(80) | sim | Geração sociológica. |
| `complemento` | text | sim | Complemento de endereço. |
| `permitir_exibir_data_nascimento` | boolean | não | Privacidade da data de nascimento. |
| `permitir_exibir_endereco` | boolean | não | Privacidade do endereço. |
| `permitir_exibir_rede_social` | boolean | não | Privacidade de redes sociais. |
| `permitir_exibir_telefone` | boolean | não | Privacidade do telefone. |
| `falecido` | boolean | não | Status de falecimento. |
| `local_nascimento_exterior` | boolean | não | Local de nascimento fora do Brasil. |
| `local_falecimento_exterior` | boolean | não | Local de falecimento fora do Brasil. |

Defaults recentes:

```txt
permitir_exibir_instagram = true
permitir_mensagens_whatsapp = true
permitir_exibir_data_nascimento = true
permitir_exibir_endereco = true
permitir_exibir_telefone = true
```

Observações:

- `data_nascimento` e `data_falecimento` são `varchar`, pois o sistema aceita ano isolado ou datas em formato textual.
- `arquivos_historicos` em JSON é legado provável. A fonte atual recomendada é a tabela `arquivos_historicos`.
- Redes sociais têm campos legados em `pessoas`, mas o modelo atual mais flexível é `pessoa_social_profiles`.
- O reset admin de perfil não remove a pessoa nem seus relacionamentos; ele limpa dados complementares e restaura preferências.

---

### 4.4 `relacionamentos`

Guarda as conexões entre pessoas.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID do relacionamento. |
| `pessoa_origem_id` | uuid | não | Pessoa de origem. |
| `pessoa_destino_id` | uuid | não | Pessoa de destino. |
| `tipo_relacionamento` | varchar(50) | não | Ex.: `pai`, `mae`, `filho`, `irmao`, `conjuge`. |
| `subtipo_relacionamento` | varchar(50) | sim | Ex.: `sangue`, `adotivo`, `casamento`, `uniao`, `separado`. |
| `created_at` | timestamptz | sim | Criação. |
| `updated_at` | timestamptz | sim | Atualização. |
| `ativo` | boolean | não | Relacionamento ativo/inativo. |
| `data_casamento` | text | sim | Data de casamento/união. |
| `data_separacao` | date | sim | Data de separação. |
| `local_casamento` | text | sim | Local do casamento/união. |
| `local_separacao` | text | sim | Local da separação. |
| `observacoes` | text | sim | Observações. |

Constraints relevantes:

- Foreign key `pessoa_origem_id -> pessoas.id`.
- Foreign key `pessoa_destino_id -> pessoas.id`.
- Checks para `tipo_relacionamento` e `subtipo_relacionamento`.

Regras de negócio documentadas no código:

- `conjuge`: A -> B cria B -> A.
- `irmao`: A -> B cria B -> A.
- `pai`/`mae`: filho -> pai/mãe cria pai/mãe -> filho.
- `filho`: inverso só deve ser criado quando o sistema sabe se o inverso é `pai` ou `mae`.

Modal conjugal:

- usa `ViewMarriageModal.tsx`;
- texto principal deve usar “foram casados” quando aplicável;
- subtítulo contextual pode exibir datas e local de cerimônia;
- botão `Inserir Informações` pode gravar diretamente ou enviar sugestão/admin conforme permissão;
- arquivos históricos podem estar associados a `relacionamento_id`.

---

## 5. Tabelas auxiliares de pessoa

### 5.1 `arquivos_historicos`

Registros históricos associados a pessoas ou relacionamentos.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID do arquivo. |
| `pessoa_id` | uuid | não | Pessoa vinculada. |
| `url` | text | não | URL pública ou interna do arquivo. |
| `titulo` | varchar(255) | sim | Título. |
| `descricao` | text | sim | Descrição. |
| `ano` | varchar(10) | sim | Ano aproximado. |
| `tipo` | varchar(50) | sim | Ex.: `imagem`, `pdf`. |
| `ordem` | integer | sim | Ordem de exibição. |
| `created_at` | timestamptz | sim | Criação. |
| `updated_at` | timestamptz | sim | Atualização. |
| `relacionamento_id` | uuid | sim | Relacionamento associado. |
| `storage_bucket` | text | sim | Bucket no Supabase Storage. |
| `storage_path` | text | sim | Caminho no Storage. |
| `mime_type` | text | sim | MIME type. |
| `created_by` | uuid | sim | Usuário que criou. |
| `categoria_evento` | text | sim | Categoria histórica. |

Uso:

- Fotos e documentos no perfil da pessoa.
- Arquivos associados a relacionamentos.
- Registros históricos familiares.

---

### 5.2 `pessoa_social_profiles`

Modelo atual para múltiplas redes sociais por pessoa.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID do perfil social. |
| `pessoa_id` | uuid | não | Pessoa vinculada. |
| `rede` | text | não | Ex.: Instagram, Facebook, LinkedIn, TikTok. |
| `perfil` | text | não | Usuário/perfil informado. |
| `url` | text | sim | URL calculada ou informada. |
| `exibir_no_perfil` | boolean | não | Controla exibição pública. |
| `created_at` | timestamptz | não | Criação. |
| `updated_at` | timestamptz | não | Atualização. |

Constraints:

- Foreign key `pessoa_id -> pessoas.id`.
- Unique em `(pessoa_id, rede)`.
- Check em `rede`.

Uso:

- `/meus-dados`;
- `/minha-arvore/editar`;
- `/admin/pessoas/:id/editar`;
- perfil público, respeitando privacidade.

---

### 5.3 `person_events`

Eventos biográficos/timeline de uma pessoa.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID do evento. |
| `pessoa_id` | uuid | não | Pessoa vinculada. |
| `tipo` | text | não | Tipo do evento. |
| `titulo` | text | não | Título. |
| `data_evento` | text | sim | Data textual ou ano. |
| `local` | text | sim | Local do evento. |
| `descricao` | text | sim | Descrição. |
| `ordem` | integer | não | Ordem de exibição. |
| `created_at` | timestamptz | não | Criação. |
| `updated_at` | timestamptz | não | Atualização. |

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

Uso recente:

- `PersonEventsEditor` em admin e `/minha-arvore/editar`;
- área **Eventos da Vida**;
- eventos manuais combinados com eventos automáticos derivados por `buildPersonTimeline`.

---

### 5.4 `person_generated_insights`

Armazena conteúdos gerados por IA para a pessoa.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID do insight. |
| `pessoa_id` | uuid | não | Pessoa vinculada. |
| `tipo` | text | não | Tipo de insight. |
| `data_nascimento` | text | não | Data usada como base da geração. |
| `conteudo` | jsonb | não | Conteúdo gerado. |
| `modelo` | text | sim | Modelo de IA usado. |
| `prompt_version` | text | não | Versão do prompt. |
| `status` | text | não | Ex.: `completed`, erro etc. |
| `error_message` | text | sim | Mensagem de erro, se houver. |
| `created_at` | timestamptz | não | Criação. |
| `updated_at` | timestamptz | não | Atualização. |

Uso esperado:

- geração/regeneração por admin;
- exibição condicional no perfil público;
- evitar exibir cards vazios ou mensagem `Conteudo ainda nao gerado.` publicamente;
- pet não exibe astrologia/acontecimentos.

---

### 5.5 `person_profile_suggestions`

Tabela criada para receber sugestões de alteração de perfil quando o usuário não tem permissão de edição direta.

Uso:

- botão **Inserir Informações** em `/pessoa/:id`;
- sugestões contextuais de relacionamento conjugal;
- revisão em `/admin/solicitacoes-vinculos`.

Regras:

- usuário autorizado pode seguir fluxo direto;
- usuário sem permissão envia sugestão;
- admin pode marcar como revisada ou descartar;
- o fluxo não deve alterar dados sensíveis sem revisão quando o usuário não tem permissão.

Migration relacionada:

```txt
20260608143000_create_person_profile_suggestions.sql
```

---

## 6. Notificações e preferências

### 6.1 Modelo atual

O modelo atual usa as tabelas em português:

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

Preferências individuais por usuário.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID. |
| `user_id` | uuid | não | Usuário. |
| `receber_aniversarios` | boolean | não | Receber aniversários. |
| `receber_datas_memoria` | boolean | não | Receber datas de memória. |
| `receber_eventos` | boolean | não | Receber eventos. |
| `receber_avisos_gerais` | boolean | não | Receber avisos gerais, publicações e menções. |
| `receber_email` | boolean | não | Canal email geral. |
| `receber_push` | boolean | não | Canal push. |
| `receber_whatsapp` | boolean | não | Canal WhatsApp. |
| `receber_email_novo_usuario` | boolean | não | Email para novo usuário. |
| `receber_email_datas_especiais` | boolean | não | Email para datas especiais. |
| `receber_email_novas_mensagens_forum` | boolean | não | Email para fórum. |
| `receber_email_novos_registros_historicos` | boolean | não | Email para novos registros históricos. |
| `receber_email_evento_historico_familia` | boolean | não | Email para evento histórico familiar. |
| `created_at` | timestamptz | não | Criação. |
| `updated_at` | timestamptz | não | Atualização. |

Constraints:

- Primary key em `id`.
- Unique em `user_id`.
- Foreign key `user_id -> auth.users.id`.

Uso:

- `/ajustar-notificacoes`;
- `userEngagementService.ts`;
- `notificationDispatchService.ts`;
- `notificationAdminService.ts`.

---

### 6.3 `notificacoes_usuario`

Notificações visíveis para o usuário.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID. |
| `user_id` | uuid | não | Usuário destinatário. |
| `titulo` | text | não | Título. |
| `mensagem` | text | não | Corpo. |
| `tipo` | text | não | Tipo de notificação. |
| `canal` | text | não | Ex.: `interna`, `email`, `push`, `whatsapp`. |
| `lida` | boolean | não | Status de leitura. |
| `link` | text | sim | Link de destino. |
| `metadata` | jsonb | não | Dados auxiliares. |
| `created_at` | timestamptz | não | Criação. |
| `updated_at` | timestamptz | não | Atualização. |

Uso:

- Central de notificações.
- Marcar como lida.
- Remover notificação.
- Criar notificações internas.
- Links para `/forum/topico/:id` em menções e pessoas relacionadas.

---

### 6.4 `notification_dispatch_logs`

Logs técnicos de envio.

Uso:

- registrar tentativas de envio;
- registrar falhas;
- diagnóstico admin;
- acompanhar canal usado (`interna`, `email`, `push`, `whatsapp`).

Não deve ser confundida com `notificacoes_usuario`. Uma notificação pode ser visível para o usuário e também gerar logs de tentativa de entrega.

---

### 6.5 `notification_occurrences`

Controle de ocorrências automáticas.

Uso:

- evitar duplicidade de notificações recorrentes;
- registrar execuções de aniversário/datas de memória;
- apoiar a Edge Function `run-daily-notifications`.

---

### 6.6 Tabelas legadas prováveis: `notification_preferences` e `notifications`

Existem também:

- `notification_preferences`
- `notifications`

Essas tabelas parecem pertencer a uma versão anterior em inglês do módulo de notificações.

O código atual pesquisado usa principalmente:

- `preferencias_notificacao`
- `notificacoes_usuario`

Recomendação:

1. Não apagar diretamente.
2. Verificar contagem de registros.
3. Verificar data de última escrita.
4. Migrar dados remanescentes, se houver.
5. Criar migration de limpeza apenas depois de validar que não há dependências.

---

## 7. Favoritos

### 7.1 `user_favorites`

Tabela ativa de favoritos do usuário.

Campos observados:

| Coluna | Tipo | Nulo | Status | Função |
|---|---|---|---|---|
| `id` | uuid | não | Atual | ID. |
| `user_id` | uuid | não | Atual | Usuário. |
| `tipo_conteudo` | varchar(40) | sim | Legado | Tipo antigo. |
| `conteudo_id` | varchar(255) | sim | Legado | ID antigo. |
| `titulo` | varchar(255) | sim | Legado | Título antigo. |
| `created_at` | timestamptz | sim | Atual | Criação. |
| `entity_type` | text | não | Atual | Tipo da entidade. |
| `entity_id` | text | não | Atual | ID da entidade. |
| `label` | text | não | Atual | Nome exibido. |
| `description` | text | sim | Atual | Descrição. |
| `href` | text | sim | Atual | Link. |
| `metadata` | jsonb | não | Atual | Dados auxiliares. |

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

Regra recente de reset:

- `admin_reset_person_profile` remove favoritos associados à pessoa resetada;
- não remove a pessoa nem relacionamentos familiares.

---

## 8. Eventos familiares e calendário

### 8.1 `family_events`

Eventos familiares gerais, como encontros, avisos, aniversários ou confraternizações.

### 8.2 `event_attendees`

Presença/RSVP de usuários em eventos familiares.

Diferença importante:

| Tabela | Uso |
|---|---|
| `person_events` | Eventos biográficos de uma pessoa específica. |
| `family_events` | Eventos familiares gerais. |
| `event_attendees` | Participantes/convites dos eventos familiares. |

---

## 9. Fórum

Tabelas do fórum:

- `forum_categorias`
- `forum_topicos`
- `forum_respostas`
- `forum_comentarios`
- `forum_reacoes`
- `forum_denuncias`
- `forum_topico_pessoas`

Uso esperado:

- Categorias do fórum.
- Tópicos criados por usuários.
- Respostas e comentários.
- Reações.
- Denúncias/moderação.
- Associação entre tópicos e pessoas da árvore.
- Notificações internas para menções e pessoas relacionadas.

Services esperados:

- `forumService.ts`
- `notificationTriggersService.ts`
- `notificationRecipientsService.ts`

Rotas esperadas:

- `/forum`
- `/forum/novo`
- `/forum/topico/:id`
- `/forum/topico/:id/editar`

### 9.1 `forum_categorias`

Guarda categorias exibidas em `/forum/novo` e na listagem.

Uso recente:

- seleção visual por botões em `/forum/novo`;
- ícone/título derivados no frontend;
- categoria exibida como badge em `/forum/topico/:id`.

### 9.2 `forum_topicos`

Guarda tópicos.

Campos centrais esperados:

- `id`
- `categoria_id`
- `autor_id`
- `titulo`
- `slug`
- `conteudo`
- `tipo`
- `status`
- `pessoa_relacionada_id`
- `fixado`
- `destacado`
- `created_at`
- `updated_at`

Regra recente:

- `/forum/novo` não exibe mais dropdown de `Tipo`;
- quando necessário, o frontend usa tipo padrão interno `discussao`.

### 9.3 `forum_topico_pessoas`

Associação N:N entre tópicos e pessoas.

Uso recente:

- múltiplas pessoas relacionadas ao tópico;
- menções `@` podem adicionar pessoa relacionada;
- origem para renderizar menções como links e para notificação de pessoas relacionadas.

Constraint esperada:

```txt
unique(topico_id, pessoa_id)
```

### 9.4 `forum_respostas` e `forum_comentarios`

Uso:

- respostas do tópico;
- comentários em respostas;
- autores usados para avatares;
- gatilhos de notificação para participantes.

### 9.5 `forum_reacoes`

Reações em tópicos, respostas ou comentários conforme modelo.

Tipos internos mantidos:

```txt
curtir
apoiar
lembrar
celebrar
```

Labels visuais atuais:

| Interno | Visual |
|---|---|
| `curtir` | Amei |
| `apoiar` | Apoiar |
| `lembrar` | Orações |
| `celebrar` | Parabéns |

Constraint atual recomendada:

```txt
unique(user_id, alvo_tipo, alvo_id)
```

Migration relacionada:

```txt
20260608180000_enforce_single_forum_reaction.sql
```

Regra:

- uma reação por usuário por alvo;
- trocar reação substitui a anterior;
- clicar novamente na mesma reação remove;
- duplicidades antigas devem ser deduplicadas preservando a reação mais recente.

---

## 10. Google Calendar

Tabelas/views:

- `google_calendar_connections`
- `google_calendar_oauth_states`
- `google_calendar_synced_events`
- `google_calendar_connection_status` view

Uso esperado:

- guardar conexão OAuth;
- controlar estado OAuth temporário;
- sincronizar eventos;
- exibir status de conexão via view.

Service esperado:

- `googleCalendarService.ts`

---

## 11. Parentesco calculado

Tabelas:

- `regras_parentesco`
- `parentescos_calculados`

Uso esperado:

- definir regras para interpretar caminhos na árvore;
- armazenar relações calculadas para consulta mais rápida;
- apoiar exibição de parentesco entre duas pessoas.

Essas tabelas são independentes de `relacionamentos`: `relacionamentos` guarda a aresta base; `parentescos_calculados` pode guardar inferências derivadas.

---

## 12. Auditoria

### 12.1 `activity_logs`

Registra ações relevantes do sistema.

Campos observados:

| Coluna | Tipo | Nulo | Função |
|---|---|---|---|
| `id` | uuid | não | ID. |
| `actor_user_id` | uuid | sim | Usuário que executou. |
| `actor_pessoa_id` | uuid | sim | Pessoa associada ao ator. |
| `actor_display_name` | text | sim | Nome exibido do ator. |
| `action` | text | não | Ação executada. |
| `entity_type` | text | não | Tipo de entidade. |
| `entity_id` | uuid | sim | ID da entidade afetada. |
| `entity_label` | text | sim | Nome/título da entidade. |
| `metadata` | jsonb | não | Dados auxiliares. |
| `created_at` | timestamptz | não | Data do log. |

Ações esperadas no TypeScript incluem:

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

## 13. RPCs e funções relevantes

### 13.1 `admin_reset_person_profile`

RPC administrativa criada para resetar dados complementares de uma pessoa.

Escopo:

- remover foto de perfil;
- remover astrologia/insights e fatos do dia de nascimento quando persistidos;
- remover favoritos associados à pessoa;
- retornar preferências de notificação para `true` quando aplicável ao usuário relacionado;
- retornar preferências de privacidade/contato da pessoa para `true`;
- manter registro da pessoa;
- manter relacionamentos familiares.

Migration relacionada:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
```

### 13.2 `admin_list_profiles_for_linking`

RPC usada para listar perfis disponíveis em vínculo admin usuário-pessoa.

Migration relacionada:

```txt
20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
```

### 13.3 `forum_increment_topic_view`

RPC usada para incrementar visualizações de tópico no fórum.

### 13.4 `forum_mark_solution`

RPC existente para marcar solução, embora a ação tenha sido removida da UI de respostas no ciclo recente.

---

## 14. Views

### 14.1 `pessoas_com_estatisticas`

View auxiliar para leitura agregada de pessoas.

Campos observados incluem dados de `pessoas` e contadores:

- `total_conjuges`
- `total_filhos`
- `total_pais`
- `total_arquivos`

Uso esperado:

- diagnóstico;
- listagens administrativas;
- estatísticas rápidas.

Não deve ser usada como fonte principal de escrita.

---

### 14.2 `google_calendar_connection_status`

View auxiliar para status de conexão com Google Calendar.

Uso esperado:

- mostrar se o usuário está conectado;
- evitar montar esse estado manualmente a partir de múltiplas tabelas.

---

## 15. Pontos de limpeza e organização recomendados

### 15.1 Tabelas provavelmente legadas

| Objeto | Motivo | Recomendação |
|---|---|---|
| `notification_preferences` | Versão antiga em inglês; código atual usa `preferencias_notificacao`. | Auditar, migrar dados se houver, remover depois. |
| `notifications` | Versão antiga em inglês; código atual usa `notificacoes_usuario`. | Auditar, migrar dados se houver, remover depois. |

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

---

### 15.2 Colunas provavelmente legadas

| Tabela | Coluna | Motivo | Recomendação |
|---|---|---|---|
| `pessoas` | `arquivos_historicos` | Hoje existe tabela relacional `arquivos_historicos`. | Verificar se está vazia antes de remover. |
| `pessoas` | `rede_social` | Modelo atual suporta múltiplas redes em `pessoa_social_profiles`. | Manter como fallback até migração completa. |
| `pessoas` | `instagram_usuario` | Modelo atual suporta múltiplas redes em `pessoa_social_profiles`. | Manter como fallback até migração completa. |
| `pessoas` | `instagram_url` | Modelo atual suporta múltiplas redes em `pessoa_social_profiles`. | Manter como fallback até migração completa. |
| `user_favorites` | `tipo_conteudo` | Modelo atual usa `entity_type`. | Remover só depois de auditoria. |
| `user_favorites` | `conteudo_id` | Modelo atual usa `entity_id`. | Remover só depois de auditoria. |
| `user_favorites` | `titulo` | Modelo atual usa `label`. | Remover só depois de auditoria. |

---

## 16. Queries úteis de diagnóstico

### 16.1 Listar tabelas/views do schema público

```sql
select
  table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

### 16.2 Listar colunas e tipos de tabelas principais

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

### 16.3 Listar constraints

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

### 16.4 Verificar unicidade de reações de fórum

```sql
select user_id, alvo_tipo, alvo_id, count(*)
from public.forum_reacoes
group by user_id, alvo_tipo, alvo_id
having count(*) > 1;
```

### 16.5 Verificar dependências antes de remover tabelas

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

## 17. Recomendações finais

### 17.1 Não remover agora sem auditoria

Mesmo quando uma tabela parece legada, ela pode conter dados antigos ainda não migrados ou ser usada por RPCs, Edge Functions ou views.

Antes de qualquer `DROP TABLE` ou `DROP COLUMN`:

1. verificar contagem de registros;
2. verificar última escrita;
3. procurar referências no código;
4. procurar dependências no banco;
5. fazer backup;
6. criar migration específica e reversível quando possível.

---

### 17.2 Organização sugerida

Criar futuramente uma migration de limpeza com fases:

1. **Auditoria**
   - Contar registros em tabelas legadas.
   - Verificar dados não migrados.

2. **Migração complementar**
   - Migrar dados de `notifications` para `notificacoes_usuario`, se existirem.
   - Migrar dados de `notification_preferences` para `preferencias_notificacao`, se existirem.
   - Migrar `pessoas.arquivos_historicos` para `arquivos_historicos`, se houver conteúdo.
   - Migrar campos antigos de `user_favorites` para os campos atuais.

3. **Depreciação**
   - Marcar tabelas/colunas antigas como deprecated em documentação.
   - Evitar novas escritas.

4. **Remoção**
   - Remover somente depois de uma rodada de produção sem uso.

---

## 18. Critérios para limpeza futura

Antes de remover tabela, coluna ou campo legado:

1. confirmar se há migration atual equivalente;
2. buscar uso no frontend, services, Edge Functions, testes e scripts;
3. conferir dependências por constraints, views, triggers, RPCs e policies;
4. executar diagnóstico em staging ou ambiente local;
5. criar backup ou plano de reversão;
6. registrar a decisão em documentação operacional;
7. evitar alteração simultânea de schema, UI e regra de negócio.

Itens marcados como **legado provável** não devem ser apagados apenas por parecerem antigos. Eles indicam que o modelo evoluiu, mas ainda podem sustentar compatibilidade, migração incremental ou dados históricos.

---

## 19. Resumo executivo

O fluxo atual está coerente e funcional em sua estrutura principal:

```txt
auth.users
  -> profiles
  -> user_person_links
  -> pessoas
  -> relacionamentos
```

As funcionalidades auxiliares também estão bem separadas:

```txt
pessoa_social_profiles
person_events
person_generated_insights
person_profile_suggestions
arquivos_historicos
user_favorites
preferencias_notificacao
notificacoes_usuario
activity_logs
forum_topicos
forum_topico_pessoas
forum_reacoes
```

O principal ponto de atenção continua sendo a presença de camadas legadas:

```txt
notification_preferences
notifications
pessoas.arquivos_historicos
user_favorites.tipo_conteudo
user_favorites.conteudo_id
user_favorites.titulo
```

Esses itens não indicam necessariamente erro. Indicam evolução do schema. A recomendação é manter por ora, documentar como legado provável e limpar apenas após auditoria controlada.

---
