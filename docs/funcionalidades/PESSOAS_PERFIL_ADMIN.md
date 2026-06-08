# Pessoas, perfil público e admin de pessoa

> Última revisão: 2026-06-08  
> Local recomendado: `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`  
> Tipo: documentação funcional específica.

---

## 1. Status

Frente funcional consolidada no escopo atual do MVP.

Rotas principais:

```txt
/pessoa/:id
/pessoas/:id
/admin/pessoas
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/meus-dados
/minha-arvore/editar
/admin/solicitacoes-vinculos
```

Inclui:

- perfil público/interno de pessoa;
- admin de pessoa;
- listagem administrativa de pessoas;
- reset administrativo de perfil;
- edição dos próprios dados;
- sugestões de alteração de perfil;
- vínculos usuário-pessoa;
- relacionamento conjugal;
- insights;
- WhatsApp;
- autocomplete de endereço;
- privacidade;
- pets;
- eventos pessoais;
- arquivos históricos;
- favoritos.

---

## 2. Arquivos principais

```txt
src/app/pages/PersonProfile.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MinhaArvore.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/SocialProfilesEditor.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/ConfirmDialog.tsx
src/app/utils/googleAddress.ts
src/app/utils/personFields.ts
src/app/utils/whatsapp.ts
src/app/services/dataService.ts
src/app/services/memberProfileService.ts
src/app/services/personInsightsService.ts
src/app/services/personProfileSuggestionService.ts
src/app/services/permissionService.ts
src/app/services/favoritesService.ts
```

Migrations recentes relacionadas:

```txt
supabase/migrations/20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
supabase/migrations/20260608143000_create_person_profile_suggestions.sql
```

Documentos relacionados:

```txt
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
docs/funcionalidades/TIMELINE.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/funcionalidades/NOTIFICACOES.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/GUIA_CORRECAO_ERROS.md
```

---

## 3. Rotas

| Rota | Proteção | Função |
|---|---|---|
| `/pessoa/:id` | `MemberRoute` | Perfil público/interno de pessoa. |
| `/pessoas/:id` | `MemberRoute` | Alias do perfil de pessoa. |
| `/admin/pessoas` | `ProtectedRoute` | Listagem administrativa de pessoas. |
| `/admin/pessoas/nova` | `ProtectedRoute` | Criar pessoa. |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` | Editar pessoa. |
| `/admin/pessoas/:id` | `ProtectedRoute` | Alias admin de edição/visualização. |
| `/meus-dados` | `MemberRoute` | Usuário edita dados da pessoa vinculada. |
| `/minha-arvore/editar` | `MemberRoute` | Usuário edita perfil próprio ampliado. |
| `/admin/solicitacoes-vinculos` | `ProtectedRoute` | Admin revisa vínculos e sugestões de alteração. |

---

## 4. Perfil público/interno

O perfil exibe, conforme dados e permissões:

- dados básicos;
- foto principal;
- informações biográficas;
- relacionamentos;
- eventos;
- timeline;
- arquivos históricos;
- redes sociais;
- contato;
- insights persistidos;
- botão de favorito;
- ação de edição quando o usuário tiver permissão.

Regras:

- foto principal é ampliável quando existe;
- dados sensíveis respeitam flags de privacidade;
- WhatsApp depende de telefone válido e permissão de contato;
- cards de astrologia/acontecimentos só aparecem com conteúdo, loading, erro ou fallback explícito;
- o texto **Conteúdo ainda não gerado.** não deve aparecer publicamente;
- pet não exibe astrologia/acontecimentos.

---

## 5. Botão de editar no perfil `/pessoa/:id`

Regra consolidada:

```txt
O botão Editar saiu do header e fica ao lado do botão de favoritar.
```

Comportamento esperado:

- botão redondo;
- apenas ícone de lápis;
- sem título visível no botão;
- título/descrição apenas por `title`/tooltip/aria-label;
- visual alinhado ao botão de favorito;
- exibido somente para:
  - admin;
  - responsável pelo perfil;
  - próprio usuário;
  - usuário com vínculo direto e `can_edit !== false`.

Permissão reutilizada:

```txt
canEditPerson
isAdminUser
getLinkedPersonWithPessoa(user.id, pessoa.id)
canEditLinkedPersonRecord
```

Regra:

- esconder o botão no frontend não substitui validação de service/RLS;
- usuário sem permissão não deve conseguir editar diretamente por URL.

---

## 6. Inserir Informações e sugestões de perfil

A página `/pessoa/:id` possui ação **Inserir Informações**.

Comportamento:

- se o usuário for responsável pelo perfil, admin ou tiver permissão direta, entra no fluxo de edição;
- se não tiver permissão direta, envia sugestão para revisão administrativa;
- sugestões aparecem no painel admin;
- admin pode marcar como revisada ou descartar.

Service:

```txt
src/app/services/personProfileSuggestionService.ts
```

Migration:

```txt
20260608143000_create_person_profile_suggestions.sql
```

Admin relacionado:

```txt
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
```

Regras:

- sugestão não altera dado real imediatamente;
- sugestão deve guardar contexto suficiente para revisão;
- não expor informações internas desnecessárias ao usuário comum;
- falha ao enviar sugestão deve exibir feedback amigável.

---

## 7. Privacidade

### 7.1 Defaults de privacidade

Migration relacionada:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
```

Todas as colunas abaixo da tabela `pessoas` começam com valor padrão `true`:

```txt
permitir_exibir_instagram
permitir_mensagens_whatsapp
permitir_exibir_data_nascimento
permitir_exibir_endereco
permitir_exibir_telefone
```

Regra de UX:

```txt
No primeiro acesso, o usuário vê todos os campos marcados e pode desmarcar se quiser.
```

Regras:

- usar boolean `true`, não string `"TRUE"`;
- defaults não devem sobrescrever escolha explícita do usuário já salva;
- reset administrativo pode retornar esses campos para `true`, conforme seção de reset.

### 7.2 Telefone

Telefone textual só aparece com:

```txt
permitir_exibir_telefone = true
```

### 7.3 WhatsApp

WhatsApp depende de:

- telefone válido;
- flags de permissão;
- avaliação por `canUseWhatsAppContact`.

Arquivo:

```txt
src/app/utils/whatsapp.ts
```

Campo relacionado:

```txt
permitir_mensagens_whatsapp
```

### 7.4 Endereço

Endereço só aparece com:

```txt
permitir_exibir_endereco = true
```

### 7.5 Data de nascimento

Data de nascimento respeita:

```txt
permitir_exibir_data_nascimento
```

### 7.6 Redes sociais

Instagram respeita:

```txt
permitir_exibir_instagram
```

Quando houver campos legados de rede social, manter compatibilidade sem burlar o novo campo específico.

Regra:

```txt
Não resolver privacidade apenas escondendo UI se o service/RLS expõe dados indevidos.
```

---

## 8. Admin de pessoas

### 8.1 Listagem `/admin/pessoas`

Arquivo principal:

```txt
src/app/pages/admin/AdminPessoas.tsx
```

A listagem possui, em cada pessoa:

- botão **Editar**;
- botão **Excluir**;
- botão apenas com ícone para copiar ID.

Regra consolidada:

```txt
O terceiro botão copia automaticamente o ID da pessoa da tabela pessoas.
```

Exemplo:

```txt
25cddc2d-3927-4b68-8dcb-9993d203f3e5
```

Comportamento esperado:

- botão sem título visível;
- ícone claro de copiar;
- `title`/`aria-label` para acessibilidade;
- feedback visual/toast de cópia;
- não navegar;
- não alterar dados;
- não expor outro identificador por engano.

### 8.2 Formulário admin

Arquivo principal:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
```

O formulário admin é dividido por blocos:

- foto;
- dados básicos;
- datas/locais;
- biografia;
- contato;
- privacidade;
- eventos;
- arquivos históricos;
- relacionamentos;
- vínculos;
- insights.

Comportamento:

- rascunho usa `sessionStorage` com chave por criação/edição;
- eventos da vida usam `PersonEventsEditor`;
- arquivos históricos usam `ArquivosHistoricos`;
- redes sociais usam componentes compartilhados;
- privacidade controla exibição pública;
- dados conjugais aparecem quando aplicável;
- insights são gerados/regenerados por ação explícita do admin via `generate-person-insights`;
- card de insights no admin só aparece quando há ação possível, conteúdo existente, loading ou erro.

---

## 9. Resetar Perfil no admin

### 9.1 Objetivo

O botão **Resetar Perfil** permite ao admin devolver os dados customizados do perfil para a versão atualmente existente na tabela `pessoas`, removendo personalizações e preferências alteradas.

Arquivo principal:

```txt
src/app/pages/admin/AdminPessoas.tsx
src/app/services/dataService.ts
src/app/components/ConfirmDialog.tsx
```

Migration/RPC:

```txt
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
admin_reset_person_profile
```

### 9.2 Comportamento esperado

Ao resetar uma pessoa:

- todos os dados relacionados à pessoa voltam para a versão atualmente persistida na tabela `pessoas`;
- remove foto de perfil;
- remove informações de astrologia;
- remove fatos do dia de nascimento;
- remove todos os favoritos da pessoa;
- retorna preferências de notificações para `true`;
- retorna preferências de exibição/contato para `true`;
- mantém relações com parentes atualmente existentes no banco;
- não apaga relacionamentos familiares;
- não apaga pessoa;
- não altera histórico de parentesco.

Campos de privacidade que voltam para `true`:

```txt
permitir_exibir_instagram
permitir_mensagens_whatsapp
permitir_exibir_data_nascimento
permitir_exibir_endereco
permitir_exibir_telefone
```

### 9.3 Proteções

Regras:

- ação disponível apenas para admin;
- exigir confirmação antes de executar;
- RPC deve validar permissão admin;
- não executar deletes em relações familiares;
- não executar cascade destrutivo em `relacionamentos`;
- falha deve exibir erro claro;
- sucesso deve recarregar dados/listagem.

Checklist anti-regressão:

```txt
Reset remove favoritos.
Reset remove foto.
Reset limpa astrologia/fatos.
Reset retorna booleans para true.
Reset não remove pais, filhos, irmãos, cônjuges ou demais relacionamentos.
```

---

## 10. Área do usuário - `/meus-dados`

A página `/meus-dados` permite que o usuário edite dados da pessoa vinculada quando tiver permissão.

Regras:

- respeitar `user_person_links.can_edit`;
- confirmar dados quando aplicável;
- não permitir edição de pessoa sem vínculo;
- usar componentes compartilhados sempre que possível;
- preservar autocomplete de endereço;
- preservar validações de humano/pet;
- não expor ação admin.

Services relacionados:

```txt
memberProfileService.ts
pessoaSocialProfilesService.ts
arquivosHistoricosService.ts
storageService.ts
userEngagementService.ts
```

---

## 11. Pets

Regras de validação:

```txt
Pet:
  pode ter nome simples com duas letras ou mais.

Humano:
  exige pelo menos nome e sobrenome com duas letras ou mais.
```

Regras de exibição:

- pets não exibem astrologia/acontecimentos;
- pets podem aparecer no perfil;
- pets aparecem em card próprio quando relacionados como filho técnico;
- pets não devem ser contados como filhos humanos;
- pets usam regra semântica de `humano_ou_pet`.

Arquivo relacionado:

```txt
src/app/utils/personEntity.ts
```

Documento complementar:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 12. Vínculo usuário-pessoa no admin

A listagem de usuários depende de:

```txt
adminListProfilesForLinking
```

O service chama a RPC:

```txt
public.admin_list_profiles_for_linking
```

Migration relacionada:

```txt
20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
```

Regras:

- dropdown exclui usuários já vinculados à pessoa;
- erro de listagem aparece inline no card;
- botão **Recarregar** tenta buscar novamente;
- não usar fallback inseguro de consulta direta em `profiles`;
- usuário logado precisa ser admin.

---

## 13. Autocomplete de endereço

Componente:

```txt
AddressAutocompleteInput
```

Arquivo:

```txt
src/app/components/person/AddressAutocompleteInput.tsx
```

Usa Google Places quando existe:

```txt
VITE_GOOGLE_MAPS_API_KEY
```

Sem API key, ou se o Google falhar:

```txt
o campo continua como input normal.
```

Usado em:

- `/meus-dados`;
- admin de pessoa via `PersonContactFields`.

Formatação centralizada em:

```txt
src/app/utils/googleAddress.ts
```

Regra:

```txt
falha do Google não pode bloquear salvamento do formulário.
```

---

## 14. Eventos pessoais

Componente:

```txt
PersonEventsEditor
```

Service relacionado:

```txt
personEventsService.ts
```

Tabela:

```txt
person_events
```

Uso:

- admin cria/edita eventos pessoais;
- usuário pode adicionar eventos manuais onde permitido;
- perfil pode exibir eventos;
- timeline pode consumir eventos pessoais;
- eventos não devem quebrar perfil se ausentes.

Documento complementar:

```txt
docs/funcionalidades/TIMELINE.md
```

---

## 15. Arquivos históricos

Componente:

```txt
ArquivosHistoricos
```

Service relacionado:

```txt
arquivosHistoricosService.ts
storageService.ts
```

Uso:

- arquivos associados a pessoa;
- arquivos associados a relacionamento;
- preview;
- download;
- edição de título, descrição, ano e categoria;
- compatibilidade com base64 legado.

Migration relevante:

```txt
20260522121000_add_historical_file_event_category.sql
```

Regra:

```txt
se o frontend envia categoria_evento, a migration precisa estar aplicada no ambiente.
```

---

## 16. Insights

Arquivos:

```txt
src/app/services/personInsightsService.ts
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
supabase/functions/generate-person-insights/index.ts
```

Regras:

- perfil apenas lê insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- perfil público não renderiza card vazio;
- texto **Conteúdo ainda não gerado.** não deve aparecer publicamente;
- pet não exibe astrologia/acontecimentos;
- card admin aparece se houver ação possível, conteúdo, loading ou erro.

Reset admin pode limpar os dados de astrologia e fatos do nascimento, conforme regra da seção **Resetar Perfil**.

---

## 17. Modal de relacionamento conjugal

O modal aberto ao clicar no anel/aliança de relacionamento deve apresentar dados legíveis para usuário final.

Arquivo principal:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

### 17.1 Layout do modal

Regras consolidadas:

- título do modal centralizado;
- botão `X` de fechar alinhado corretamente com o ícone;
- não exibir ID técnico do relacionamento para usuário final;
- informações técnicas internas não devem aparecer para usuário comum;
- observações podem aparecer quando fizerem sentido para admin;
- arquivos históricos do relacionamento permanecem no modal.

### 17.2 Texto principal

Trocar texto genérico:

```txt
Fulana e Secundino tiveram um relacionamento conjugal.
```

por:

```txt
Fulana e Secundino foram casados.
```

Quando houver dados adicionais, exibir em subtítulo.

Exemplo:

```txt
O matrimônio aconteceu entre DD/MM/AAAA e DD/MM/AAAA. A cerimônia foi realizada em Cidade/UF.
```

Regras:

- usar data de casamento quando existir;
- usar data de separação/fim apenas quando for semanticamente correta;
- não exibir separação quando o relacionamento terminou por falecimento;
- status de viuvez deve ser tratado de forma distinta de separação/divórcio;
- não inventar cidade/data ausente.

### 17.3 Inserir Informações no relacionamento

O modal possui botão **Inserir Informações**.

Comportamento:

- usuário com permissão direta/admin/responsável entra no fluxo de edição;
- usuário sem permissão envia sugestão para confirmação no painel admin;
- sugestão deve incluir contexto do casal e ID do relacionamento;
- sugestão não altera dados reais imediatamente.

### 17.4 Arquivos Históricos do relacionamento

Na área de **Arquivos Históricos** do modal:

- existe botão compacto **+**;
- admin pode gravar diretamente quando o service exigir admin;
- usuários sem permissão direta devem enviar sugestão/admin, quando aplicável;
- arquivos continuam associados ao relacionamento, não à pessoa individual.

Regras técnicas:

```txt
relacionamento_id preenchido
pessoa_id nulo
```

---

## 18. Troubleshooting

### Usuário não aparece no dropdown

Verificar:

- `adminListProfilesForLinking`;
- se a pessoa já não tem vínculo com esse usuário;
- erro inline;
- botão **Recarregar**;
- usuário logado como admin.

### Erro de schema cache da RPC

Mensagem típica:

```txt
Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache
```

Correção:

- aplicar `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` no Supabase remoto;
- conferir assinatura `public.admin_list_profiles_for_linking()` sem parâmetros;
- aguardar/recarregar schema cache, se necessário;
- não trocar por consulta direta insegura em `profiles`.

### Reset de perfil não funciona

Verificar:

- migration `20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql` aplicada;
- RPC `admin_reset_person_profile` existe;
- usuário logado é admin;
- `dataService.ts` chama a RPC correta;
- `ConfirmDialog` confirma antes de executar;
- erro Supabase é exibido ao admin.

### Reset removeu parentes

P0 funcional.

Verificar imediatamente:

- RPC não deve deletar registros de `relacionamentos`;
- não deve apagar relações de filiação, irmãos ou cônjuges;
- revisar migration e logs;
- restaurar dados se houve execução indevida.

### Botão copiar ID não copia

Verificar:

- uso de `navigator.clipboard`;
- fallback se navegador bloquear clipboard;
- ID copiado é `pessoas.id`;
- toast/feedback visual;
- botão não dispara navegação/edição/exclusão.

### Campo endereço não mostra sugestões

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY`;
- carregamento de Google Places no console;
- uso de `AddressAutocompleteInput`;
- fallback para input normal.

### Card de insights aparece vazio

Verificar:

- `PersonDataView.tsx`;
- se há conteúdo/loading/erro/fallback;
- pet;
- regra pública versus admin.

### Pet exige sobrenome por regressão

Verificar:

- `validateEditablePersonForm`;
- `humano_ou_pet = 'Pet'`;
- `hasValidPetName`;
- humano continua usando `hasFirstAndLastName`.

### Botão WhatsApp aparece sem permissão

Verificar:

- `canUseWhatsAppContact`;
- telefone válido;
- flags de privacidade/contato da pessoa.

### Arquivo histórico falha ao salvar categoria

Verificar:

- migration `20260522121000_add_historical_file_event_category.sql`;
- schema cache;
- payload de `ArquivosHistoricos`;
- coluna `categoria_evento`.

### Sugestão de informação não aparece no admin

Verificar:

- migration `20260608143000_create_person_profile_suggestions.sql`;
- service `personProfileSuggestionService.ts`;
- status pendente;
- tela `/admin/solicitacoes-vinculos`;
- RLS/policy de leitura admin.

---

## 19. Checklist de QA

### Perfil

- perfil público humano com insights;
- perfil público humano sem insights;
- perfil público de pet;
- foto ampliável;
- timeline;
- arquivos históricos;
- WhatsApp com permissão;
- WhatsApp sem permissão;
- telefone oculto;
- endereço oculto;
- nascimento oculto;
- botão favorito;
- botão editar ao lado do favorito para quem tem permissão;
- botão editar ausente para quem não tem permissão;
- botão **Inserir Informações** envia sugestão quando usuário não tem permissão.

### Admin pessoas

- criar pessoa;
- editar pessoa;
- salvar humano;
- salvar pet;
- salvar pessoa falecida;
- salvar local exterior;
- salvar redes sociais;
- salvar eventos;
- salvar arquivos históricos;
- copiar ID na listagem;
- resetar perfil;
- reset não remove parentes;
- reset remove favoritos/foto/astrologia/fatos;
- reset retorna privacidade para `true`.

### Modal conjugal

- título centralizado;
- botão X alinhado;
- texto **foram casados**;
- subtítulo com matrimônio quando houver dados;
- sem ID técnico;
- arquivos históricos com botão **+**;
- inserir informações direto para quem tem permissão;
- sugestão admin para quem não tem permissão.

### `/meus-dados` e `/minha-arvore/editar`

- editar dados próprios;
- salvar endereço;
- autocomplete com API key;
- fallback sem API key;
- validar privacidade;
- confirmar dados quando aplicável;
- card **FILHOS** conta humanos;
- card **PETS** separa pets;
- eventos da vida aparecem.

### Técnico

```bash
npm run build
git diff --check
git status --short
```

Se houver scripts disponíveis:

```bash
npm test
npm run test:e2e
supabase migration list
```

---

## 20. Anti-regressões

Não reintroduzir:

- botão Editar no header de `/pessoa/:id`;
- botão editar textual quando a regra pede botão redondo só com ícone;
- campo `Signo` editável no perfil público;
- botão separado de WhatsApp duplicando telefone-link, se a decisão vigente for telefone clicável;
- defaults de privacidade como string `"TRUE"`;
- reset que apaga parentes;
- reset sem confirmação;
- sugestão que altera dado real sem revisão;
- ID técnico no modal conjugal;
- texto **tiveram um relacionamento conjugal** quando a copy aprovada é **foram casados**;
- arquivos de relacionamento salvos como arquivo de pessoa;
- ações admin disponíveis para usuário comum.

---

## 21. Pós-MVP

Possíveis evoluções:

- refatorar `AdminPessoaForm` em blocos menores;
- reaproveitar mais componentes entre admin e `/meus-dados`;
- persistência semântica de pet/tutor;
- privacidade por evento;
- arquivos por evento;
- insights adicionais;
- histórico de alterações por campo;
- validação mais detalhada de endereço;
- controles administrativos de exibição pública;
- painel dedicado para sugestões de perfil, separado de vínculos, se o volume crescer.

---
