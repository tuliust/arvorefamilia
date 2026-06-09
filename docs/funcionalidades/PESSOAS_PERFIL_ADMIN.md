# Pessoas, perfil público e admin de pessoa

> Última revisão: 2026-06-09  
> Local canônico: `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`  
> Tipo: documentação funcional específica  
> Escopo: perfil de pessoa, administração de pessoas, edição pelo usuário, privacidade, vínculos, sugestões, reset administrativo, arquivos históricos e relacionamento conjugal.

## 1. Função deste documento

Este documento descreve o comportamento funcional relacionado a **pessoas** no sistema Árvore Família.

Use este arquivo para entender:

- perfil público/interno de pessoa;
- listagem e formulário administrativo de pessoas;
- edição dos próprios dados pelo usuário;
- permissões de edição;
- privacidade de contato e dados pessoais;
- reset administrativo de perfil;
- sugestões de alteração;
- vínculo usuário-pessoa;
- pets;
- eventos da vida;
- arquivos históricos;
- relacionamento conjugal;
- interações do perfil com fórum, timeline, favoritos e insights.

Este documento não substitui:

| Tema | Documento canônico |
|---|---|
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Modelo de banco | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Migrations e Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Edição da própria árvore | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` |
| Timeline | `docs/funcionalidades/TIMELINE.md` |
| Notificações | `docs/funcionalidades/NOTIFICACOES.md` |
| Fórum | `docs/funcionalidades/FORUM.md` |
| Troubleshooting geral | `docs/GUIA_CORRECAO_ERROS.md` |

---

## 2. Status funcional

| Área | Status |
|---|---|
| Perfil `/pessoa/:id` e alias `/pessoas/:id` | Implementado |
| Favoritar pessoa no perfil | Implementado |
| Botão de editar no card principal | Implementado |
| Sugestão de informações quando não há permissão direta | Implementado |
| Listagem admin `/admin/pessoas` | Implementado |
| Criar/editar pessoa no admin | Implementado |
| Copiar ID da pessoa no admin | Implementado |
| Reset administrativo de perfil | Implementado via RPC |
| Edição dos próprios dados em `/meus-dados` | Implementada |
| Edição ampliada em `/minha-arvore/editar` | Implementada, documentada em arquivo próprio |
| Vínculo usuário-pessoa no admin | Implementado via RPC segura |
| Autocomplete de endereço | Implementado com fallback para input comum |
| Eventos da vida | Implementados em `person_events` |
| Arquivos históricos de pessoa | Implementados |
| Arquivos históricos de relacionamento conjugal | Implementados no modal conjugal com upload direto pelo botão `+`; informações textuais usam sugestão administrativa |
| Insights gerados por IA | Implementados como leitura pública de conteúdo persistido e geração explícita por admin |
| Pets | Implementados como tipo semântico `humano_ou_pet` |

---

## 3. Rotas

| Rota | Guard | Função |
|---|---|---|
| `/pessoa/:id` | `MemberRoute` | Perfil público/interno de pessoa da árvore. |
| `/pessoas/:id` | `MemberRoute` | Alias do perfil de pessoa. |
| `/meus-dados` | `MemberRoute` | Usuário edita dados da pessoa vinculada. |
| `/minha-arvore/editar` | `MemberRoute` | Usuário edita perfil, vínculos, arquivos, eventos e pets em fluxo ampliado. |
| `/admin/pessoas` | `ProtectedRoute` | Listagem administrativa de pessoas. |
| `/admin/pessoas/nova` | `ProtectedRoute` | Criação administrativa de pessoa. |
| `/admin/pessoas/:id` | `ProtectedRoute` | Alias de edição/visualização admin. |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` | Edição administrativa de pessoa. |
| `/admin/solicitacoes-vinculos` | `ProtectedRoute` | Revisão de vínculos, mudanças de relacionamento e sugestões de perfil. |

---

## 4. Arquivos principais

### Páginas

```txt
src/app/pages/PersonProfile.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
```

### Componentes

```txt
src/app/components/person/PersonDataView.tsx
src/app/components/person/PersonRelationshipsView.tsx
src/app/components/person/RelationshipFinder.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/SocialProfilesEditor.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/favorites/FavoriteButton.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/ConfirmDialog.tsx
```

### Services e utils

```txt
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/personProfileSuggestionService.ts
src/app/services/personEventsService.ts
src/app/services/personInsightsService.ts
src/app/services/pessoaSocialProfilesService.ts
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/services/permissionService.ts
src/app/services/favoritesService.ts
src/app/services/forumService.ts
src/app/utils/personFields.ts
src/app/utils/personEntity.ts
src/app/utils/googleAddress.ts
src/app/utils/whatsapp.ts
src/app/utils/buildPersonTimeline.ts
```

### Migrations relacionadas

```txt
20260514130000_add_falecido_to_pessoas.sql
20260514133000_add_exterior_location_flags_to_pessoas.sql
20260514165000_create_person_events.sql
20260522121000_add_historical_file_event_category.sql
20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260608143000_create_person_profile_suggestions.sql
20260609193000_ensure_admin_reset_person_profile.sql
```

---

## 5. Perfil público/interno de pessoa

### 5.1 Dados exibidos

O perfil `/pessoa/:id` pode exibir:

- dados básicos;
- foto principal;
- dados biográficos;
- dados de nascimento e falecimento;
- contato e redes sociais conforme privacidade;
- relacionamentos diretos;
- grau/vínculo com a pessoa logada quando houver contexto;
- timeline;
- eventos da vida;
- arquivos históricos;
- discussões do fórum relacionadas;
- insights persistidos;
- botão de favorito;
- botão de edição quando o usuário tiver permissão;
- ação **Inserir Informações**.

### 5.2 Carregamento

A página carrega:

| Fonte | Uso |
|---|---|
| `obterPessoaPorId` | Dados principais da pessoa. |
| `listarArquivosHistoricosPorPessoa` | Arquivos históricos ligados à pessoa. |
| `listarEventosDaPessoa` | Eventos da vida. |
| `obterRelacionamentosDaPessoa` | Relações agrupadas para exibição. |
| `obterRelacionamentosDetalhadosDaPessoa` | Timeline e vínculos mais completos. |
| `listarArquivosHistoricosDoRelacionamento` | Arquivos históricos de relações conjugais da timeline. |
| `listarTopicosForum({ pessoaRelacionadaId })` | Discussões relacionadas à pessoa. |
| `getCachedTreeData` ou `obterTodasPessoas`/`obterTodosRelacionamentos` | Contexto para cálculo de parentesco. |

### 5.3 Regras de exibição

- O perfil deve permanecer legível mesmo quando campos estiverem vazios.
- Telefone, endereço, data de nascimento e redes sociais respeitam flags de privacidade.
- WhatsApp depende de telefone válido e permissão específica.
- Pet não exibe astrologia/acontecimentos.
- Cards de insights públicos só aparecem quando há conteúdo persistido ou estado válido de loading/erro controlado.
- O texto **Conteúdo ainda não gerado.** não deve aparecer publicamente.
- Arquivos históricos em perfil público são exibidos em modo leitura.
- Discussões relacionadas aparecem apenas para usuário autenticado.

---

## 6. Permissões de edição

### 6.1 Permissão no perfil

O perfil calcula permissão combinando:

```txt
canEditPerson
isAdminUser
getLinkedPessoaIdForUser
getLinkedPersonWithPessoa(user.id, pessoa.id)
canEditLinkedPersonRecord
```

O botão de edição aparece quando o usuário é:

- admin;
- a própria pessoa vinculada;
- usuário com vínculo direto à pessoa e permissão de edição;
- responsável pelo perfil conforme `user_person_links`.

### 6.2 Comportamento do botão Editar

No perfil `/pessoa/:id`:

- o botão **Editar** fica no card principal, ao lado do botão de favorito;
- é circular;
- usa apenas ícone de lápis;
- usa `title` e `aria-label`;
- não fica no header da página.

Destino:

| Usuário | Destino |
|---|---|
| Admin | `/admin/pessoas/:id` |
| Usuário com permissão não-admin | `/meus-dados` |

Regra de segurança: esconder botão no frontend não substitui RLS, RPC segura ou validação em service.

---

## 7. Inserir Informações e sugestões de perfil

### 7.1 Perfil de pessoa

A ação **Inserir Informações** em `/pessoa/:id` segue este fluxo:

| Situação | Comportamento |
|---|---|
| Usuário pode editar diretamente | Navega para edição. |
| Usuário não pode editar diretamente | Abre modal de sugestão. |
| Sugestão enviada | Cria registro em `person_profile_suggestions`. |
| Admin | Revisa em `/admin/solicitacoes-vinculos`. |

Service:

```txt
src/app/services/personProfileSuggestionService.ts
```

Tabela:

```txt
public.person_profile_suggestions
```

Regras:

- sugestão não altera dado real automaticamente;
- texto vazio é bloqueado;
- sugestão guarda usuário solicitante, pessoa solicitante quando houver e pessoa alvo;
- admin pode marcar como `reviewed` ou `dismissed`;
- dados sensíveis devem ser mínimos.

### 7.2 Relacionamento conjugal

No modal de relacionamento conjugal, existem dois fluxos separados:

| Ação | Comportamento |
|---|---|
| **Inserir Informações** | Abre modal de sugestão textual para revisão administrativa. |
| **+** em **Arquivos Históricos** | Abre a área de upload do próprio componente de arquivos históricos. |

O botão **Inserir Informações** deve abrir um modal secundário com os campos:

- **Informações**;
- **Data**;
- **Local**;
- **Outros**.

Regras do modal secundário:

- fechar por **X** ou **Cancelar** deve retornar ao modal conjugal principal;
- clique/interação no modal secundário não deve fechar o modal pai;
- tecla `Escape` deve fechar primeiro o modal secundário, quando ele estiver aberto;
- sugestão enviada cria registro em `person_profile_suggestions`;
- a sugestão não altera o relacionamento automaticamente.

A sugestão inclui contexto textual com:

- nomes do casal;
- ID do relacionamento quando disponível;
- indicação se foi enviada por usuário sem permissão direta ou por pessoa autorizada sem fluxo direto no modal.

O botão **+** em **Arquivos Históricos** não deve abrir o modal de **Inserir Informações**. Ele deve abrir o formulário de upload de arquivo histórico.

---

## 8. Privacidade

### 8.1 Campos

Campos principais de privacidade/contato em `pessoas`:

```txt
permitir_exibir_instagram
permitir_mensagens_whatsapp
permitir_exibir_data_nascimento
permitir_exibir_endereco
permitir_exibir_rede_social
permitir_exibir_telefone
```

### 8.2 Defaults atuais

A migration `20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql` define defaults `true` para:

```txt
permitir_exibir_instagram
permitir_mensagens_whatsapp
permitir_exibir_data_nascimento
permitir_exibir_endereco
permitir_exibir_telefone
```

No frontend, `toPessoa` também normaliza valores ausentes para `true`, incluindo compatibilidade entre `permitir_exibir_rede_social` e `permitir_exibir_instagram`.

### 8.3 Regras por dado

| Dado | Regra |
|---|---|
| Telefone textual | Exibir apenas com `permitir_exibir_telefone = true`. |
| WhatsApp | Exige telefone válido e `permitir_mensagens_whatsapp = true`. |
| Endereço | Exibir apenas com `permitir_exibir_endereco = true`. |
| Data de nascimento | Respeitar `permitir_exibir_data_nascimento`. |
| Instagram | Respeitar `permitir_exibir_instagram`. |
| Rede social legada | Manter compatibilidade, sem burlar privacidade específica. |

Regra permanente: privacidade não deve depender só de esconder componente visual se service/RLS expuser dado indevido.

---

## 9. Administração de pessoas

### 9.1 Listagem `/admin/pessoas`

A listagem administrativa oferece:

- busca normalizada por texto;
- filtro humano/pet;
- filtros avançados por status, foto, geração, dados incompletos e contato;
- edição;
- exclusão;
- cópia do ID da pessoa;
- reset de perfil.

O botão de copiar ID:

- copia `pessoas.id`;
- usa `navigator.clipboard.writeText` quando disponível;
- possui fallback com `textarea` oculto;
- exibe toast de sucesso ou erro;
- não navega;
- não altera dados.

### 9.2 Excluir pessoa

A exclusão chama `deletarPessoa`.

Cuidados:

- é ação destrutiva;
- deve exigir confirmação;
- impacto em relacionamentos e dados associados depende de constraints/RLS/cascades do banco;
- não confundir com reset de perfil.

### 9.3 Formulário admin

O formulário administrativo edita/cria pessoa e reúne blocos de:

- foto;
- dados básicos;
- datas e locais;
- biografia;
- contato;
- privacidade;
- redes sociais;
- eventos da vida;
- arquivos históricos;
- relacionamentos;
- vínculos usuário-pessoa;
- relacionamento conjugal quando aplicável;
- insights gerados.

Regras:

- rascunho usa `sessionStorage`;
- botões internos de formulário devem usar `type="button"` quando não forem submit;
- preview/download de arquivo não deve limpar formulário;
- autocomplete de endereço não pode bloquear salvamento se Google falhar;
- insights são gerados/regenerados por ação explícita do admin.

---

## 10. Reset administrativo de perfil

### 10.1 Objetivo real

O botão **Resetar Perfil** remove dados complementares/customizados associados à pessoa e retorna certas preferências para o estado padrão atual.

Não é uma restauração completa de histórico nem rollback transacional de todos os dados da pessoa.

### 10.2 Implementação

Arquivos:

```txt
src/app/pages/admin/AdminPessoas.tsx
src/app/services/dataService.ts
src/app/components/ConfirmDialog.tsx
```

RPC:

```txt
public.admin_reset_person_profile(target_pessoa_id uuid)
```

Migrations:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260609193000_ensure_admin_reset_person_profile.sql
```

A migration `20260609193000_ensure_admin_reset_person_profile.sql` é uma migration idempotente de reforço para ambientes em que a RPC não foi encontrada pelo PostgREST/schema cache. Ela recria/garante a função, aplica `grant execute` e força `notify pgrst, 'reload schema';`.

### 10.3 O que o reset faz

Conforme a RPC atual:

| Área | Ação |
|---|---|
| `pessoas.foto_principal_url` | Define como `null`. |
| Flags de privacidade/contato | Retornam para `true`. |
| `person_generated_insights` | Remove registros dos tipos `astrology` e `historical_events`. |
| `user_favorites` | Remove favoritos com `entity_type = 'person'` e `entity_id` da pessoa. |
| `preferencias_notificacao` | Recria/atualiza preferências dos usuários vinculados para `true`. |

### 10.4 O que o reset não deve fazer

O reset não deve:

- apagar a pessoa;
- apagar relacionamentos familiares;
- apagar pais, mães, filhos, irmãos ou cônjuges;
- alterar histórico real de parentesco;
- apagar arquivos históricos;
- apagar eventos da vida;
- apagar redes sociais;
- substituir uma auditoria de dados.

### 10.5 Erro conhecido de schema cache/RPC ausente

Sintoma:

```txt
Could not find the function public.admin_reset_person_profile(target_pessoa_id) in the schema cache
PGRST202
```

Causa provável:

- migration de RPC não aplicada no Supabase remoto;
- schema cache do PostgREST desatualizado;
- assinatura/grant da RPC divergente.

Verificar:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
20260609193000_ensure_admin_reset_person_profile.sql
```

Correção operacional: aplicar a migration pendente no ambiente correto e validar schema cache antes de alterar o frontend.

### 10.6 Feedback

Após sucesso, a UI informa quantos conteúdos gerados e favoritos foram removidos.

Regra anti-regressão: qualquer alteração na RPC deve confirmar que não há `delete` em `relacionamentos`.

---

## 11. Área do usuário

### 11.1 `/meus-dados`

Página para edição dos dados da pessoa vinculada ao usuário.

Regras:

- exige `MemberRoute`;
- respeita vínculo e permissão;
- confirma dados quando aplicável;
- não expõe ação administrativa;
- usa componentes compartilhados;
- mantém fallback para endereço sem Google Places.

Services:

```txt
memberProfileService.ts
pessoaSocialProfilesService.ts
arquivosHistoricosService.ts
storageService.ts
userEngagementService.ts
```

### 11.2 `/minha-arvore/editar`

Fluxo ampliado de edição própria, documentado em:

```txt
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
```

Este arquivo só registra a relação com pessoas/perfil. Detalhes de avatar superior, eventos, arquivos, pets, filhos humanos e saída sem salvar devem ficar no documento específico.

---

## 12. Vínculo usuário-pessoa

### 12.1 Tabela

```txt
public.user_person_links
```

A tabela conecta usuário autenticado a pessoa da árvore.

Campos funcionais relevantes incluem:

- `user_id`;
- `pessoa_id`;
- `relacao_com_perfil`;
- `can_edit`;
- `dados_confirmados`.

### 12.2 Admin

No formulário admin de pessoa, o card de usuários vinculados usa RPC:

```txt
public.admin_list_profiles_for_linking()
```

Service/função:

```txt
adminListProfilesForLinking
```

Migration relacionada:

```txt
20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
```

Regras:

- somente admin pode listar perfis para vínculo;
- dropdown exclui usuários já vinculados à pessoa;
- erro aparece inline;
- botão **Recarregar** tenta buscar novamente;
- não usar fallback inseguro de consulta direta em `profiles`.

### 12.3 Solicitações

Alterações de vínculo/relacionamento feitas por usuário comum devem passar por fluxo de solicitação quando não forem edição direta permitida.

Documento complementar:

```txt
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
```

---

## 13. Pets

Pets são pessoas do ponto de vista estrutural da árvore, mas com semântica própria.

Campo:

```txt
humano_ou_pet
```

Regras:

| Tipo | Validação |
|---|---|
| Humano | Exige nome e sobrenome válidos. |
| Pet | Permite nome simples com duas letras ou mais. |

Regras de exibição:

- pet pode aparecer no perfil;
- pet pode aparecer na árvore;
- pet pode ser relacionado como filho técnico;
- pet não deve ser contado como filho humano;
- pet não exibe astrologia/acontecimentos;
- filtros específicos ficam documentados em `MINHA_ARVORE_FILTROS_E_PETS.md`.

---

## 14. Autocomplete de endereço

Componente:

```txt
src/app/components/person/AddressAutocompleteInput.tsx
```

Utilitário:

```txt
src/app/utils/googleAddress.ts
```

Variável opcional:

```txt
VITE_GOOGLE_MAPS_API_KEY
```

Comportamento:

- com API key válida, usa Google Places;
- sem API key, ou em caso de falha, o campo continua como input comum;
- falha de autocomplete não pode impedir salvamento.

Usado em:

- `/meus-dados`;
- formulário admin via `PersonContactFields`.

---

## 15. Eventos da vida

Tabela:

```txt
public.person_events
```

Service:

```txt
src/app/services/personEventsService.ts
```

Componentes:

```txt
src/app/components/person/PersonEventsEditor.tsx
src/app/components/person/PersonEventsList.tsx
```

Tipos funcionais:

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

Usos:

- admin cria/edita eventos;
- usuário pode criar eventos quando permitido;
- perfil exibe eventos;
- timeline consome eventos pessoais;
- ausência de eventos não deve quebrar perfil.

---

## 16. Arquivos históricos

### 16.1 Pessoa

Arquivos de pessoa usam:

```txt
pessoa_id preenchido
relacionamento_id nulo
```

### 16.2 Relacionamento conjugal

Arquivos de relacionamento usam:

```txt
relacionamento_id preenchido
pessoa_id nulo
```

### 16.3 Componente e services

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
```

Comportamento:

- upload em Storage para novos arquivos;
- compatibilidade com base64 legado;
- preview de imagem/PDF quando possível;
- edição de título, descrição, ano e categoria;
- no perfil público, arquivos da pessoa são leitura;
- no modal conjugal, o botão `+` abre a área de upload do próprio componente;
- no modal conjugal, o upload deve coletar Arquivo, Título, Descrição, Ano e Categoria;
- no contexto conjugal, as categorias devem ser restritas a Certidão de Casamento, Divórcio e Outro;
- informações textuais sobre o relacionamento usam o botão **Inserir Informações**, não o botão de arquivo.

Migration de categoria:

```txt
20260522121000_add_historical_file_event_category.sql
```

Regra operacional: se o frontend envia `categoria_evento`, a migration precisa estar aplicada.

---

## 17. Insights gerados

Arquivos:

```txt
src/app/services/personInsightsService.ts
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
supabase/functions/generate-person-insights/index.ts
```

Regras:

- perfil público apenas lê insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- pet não exibe astrologia/acontecimentos;
- card público vazio não deve ser renderizado;
- reset administrativo remove tipos `astrology` e `historical_events`.

---

## 18. Relacionamento conjugal

### 18.1 Dados

Campos principais em `relacionamentos`:

```txt
data_casamento
local_casamento
ativo
data_separacao
local_separacao
observacoes
```

### 18.2 Modal de visualização

Arquivo:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

Comportamento:

- abre ao clicar no anel/aliança conjugal da árvore;
- exibe título **Relacionamento conjugal**;
- mostra nomes/fotos/iniciais do casal;
- usa headline humana, como `Fulana e Sicrano são casados.` ou `Fulana e Sicrano foram casados.`;
- exibe narrativa com data/local quando disponíveis;
- não exibe ID técnico ao usuário final;
- observações aparecem apenas para admin;
- arquivos históricos do relacionamento aparecem no modal;
- botão **Inserir Informações** abre sugestão textual;
- botão `+` em **Arquivos Históricos** abre upload de arquivo histórico.

### 18.3 Narrativa

O modal usa:

- data de casamento quando existir;
- data de separação/fim quando existir no relacionamento;
- local de casamento quando existir.

Regras:

- sem `data_separacao`/`data_fim`, sem `ativo === false`, sem subtipo `separado` e sem pessoa falecida: usar presente, como `são casados`;
- com `data_separacao`, `data_fim`, `ativo === false`, subtipo `separado` ou pessoa falecida: usar passado, como `foram casados`;
- não inventar data/local ausente;
- não mostrar dados técnicos como substitutos de texto humano;
- não expor observações internas para usuário comum.

### 18.4 Edição/sugestão

| Situação | Resultado |
|---|---|
| Clique em **Inserir Informações** | Abre modal secundário de sugestão textual. |
| Clique em `+` em **Arquivos Históricos** | Abre formulário de upload do componente `ArquivosHistoricos`. |
| Usuário não autenticado tentando sugerir informação | Recebe aviso para entrar. |
| Relacionamento sem `relacionamento_id` no salvamento de arquivo | Deve exibir erro controlado, não quebrar a tela. |

---

## 19. Fórum relacionado ao perfil

No perfil de pessoa, há área de discussões relacionadas.

Comportamento:

- carrega tópicos via `listarTopicosForum({ pessoaRelacionadaId })`;
- mostra estado de loading;
- mostra estado vazio com CTA;
- CTA abre `/forum/novo?pessoaId=<id>`;
- criação de tópico já pode pré-selecionar pessoa relacionada.

Documento canônico:

```txt
docs/funcionalidades/FORUM.md
```

---

## 20. Favoritos

No perfil, o botão de favorito usa:

```txt
FavoriteButton
entityType="person"
```

Comportamento:

- botão redondo com estrela;
- adiciona/remove favorito do usuário atual;
- usa `favoritesService`;
- metadata é sanitizada no service;
- favoritos expandidos para outras entidades devem ser tratados em frente específica e no plano/backlog.

---

## 21. Logs e segurança

Logs relevantes:

```txt
person.created
person.updated
person.photo_updated
person.privacy_updated
relationship.created
relationship.updated
relationship.deleted
person_event.added
person_event.updated
person_event.removed
```

Regras:

- não registrar telefone/endereço em metadata de log;
- não registrar observações conjugais sensíveis em metadata;
- usar campos agregados/sanitizados;
- service role não entra no frontend;
- RLS/RPC continuam obrigatórios.

---

## 22. Troubleshooting específico

| Sintoma | Verificar |
|---|---|
| Pessoa não carrega no perfil | `obterPessoaPorId`, RLS de `pessoas`, rota e ID. |
| Botão Editar não aparece | `canEditPerson`, `isAdminUser`, `getLinkedPersonWithPessoa`, `can_edit`. |
| Usuário sem permissão editou direto | Guard/RLS/service; não confiar só em botão oculto. |
| Sugestão não é enviada | `personProfileSuggestionService`, RLS, migration `person_profile_suggestions`, texto vazio. |
| Sugestão não aparece no admin | `listPendingPersonProfileSuggestions`, `/admin/solicitacoes-vinculos`, RLS admin. |
| Reset de perfil falha | RPC `admin_reset_person_profile`, admin real, migration aplicada, schema cache. |
| Reset removeu parentes | P0: revisar RPC imediatamente; ela não deve deletar `relacionamentos`. |
| Copiar ID não funciona | Clipboard API, fallback por `textarea`, toast, ID correto `pessoas.id`. |
| Endereço não sugere | `VITE_GOOGLE_MAPS_API_KEY`, Google Places, fallback normal. |
| Pet exige sobrenome | `validateEditablePersonForm`, `humano_ou_pet`, regra de pet. |
| Card de insight aparece vazio | `PersonDataView`, conteúdo persistido, pet, estado público/admin. |
| Arquivo histórico falha ao salvar | Storage, `categoria_evento`, RLS, `pessoa_id`/`relacionamento_id`. |
| Observações conjugais aparecem para usuário comum | `ViewMarriageModal`, `resolvedIsAdmin`, campo `observacoes`. |

---

## 23. Checklist anti-regressão

Antes de alterar esta frente, validar:

```txt
/pessoa/:id
/pessoas/:id
/meus-dados
/minha-arvore/editar
/admin/pessoas
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/admin/solicitacoes-vinculos
```

Fluxos mínimos:

- perfil carrega pessoa existente;
- perfil trata pessoa inexistente;
- favorito de pessoa funciona;
- botão editar só aparece para autorizado;
- usuário sem permissão cria sugestão;
- admin vê sugestão;
- admin copia ID de pessoa;
- admin reseta perfil sem apagar relacionamentos;
- privacidade de telefone/endereço/data/rede social é respeitada;
- pet não exige sobrenome;
- pet não exibe insights;
- evento da vida aparece quando existe;
- arquivos históricos aparecem sem quebrar perfil;
- modal conjugal abre, fecha e não exibe ID técnico;
- arquivos de relacionamento salvam apenas quando admin;
- não há dado sensível em logs/metadata.

---

## 24. Decisões que não devem ser reabertas sem motivo

- `pessoas` é a entidade principal da árvore; usuário autenticado é outra entidade.
- Vínculo usuário-pessoa fica em `user_person_links`.
- Perfil público de pessoa fica protegido por `MemberRoute`.
- Admin é validado por RPC `is_admin_user`.
- Usuário comum não altera relacionamento real diretamente quando o fluxo exigir solicitação.
- Sugestões de perfil não alteram dado real sem revisão.
- Reset de perfil não apaga parentesco.
- Arquivos históricos novos usam Storage, não base64.
- Pets continuam no modelo de pessoas, com semântica própria.
- Observações conjugais são informação restrita/admin.
