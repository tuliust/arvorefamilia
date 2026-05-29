# Pessoas, perfil público e admin de pessoa

> Local recomendado: `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`  
> Tipo: documentação funcional específica.

---

## 1. Status

Frente funcional consolidada no escopo atual do MVP.

Rotas principais:

```txt
/pessoa/:id
/pessoas/:id
/admin/pessoas/nova
/admin/pessoas/:id/editar
/meus-dados
```

Inclui:

- perfil público/interno de pessoa;
- admin de pessoa;
- edição dos próprios dados;
- vínculos usuário-pessoa;
- insights;
- WhatsApp;
- autocomplete de endereço;
- privacidade;
- pets;
- eventos pessoais;
- arquivos históricos.

---

## 2. Arquivos principais

```txt
src/app/pages/PersonProfile.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/SocialProfilesEditor.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/utils/googleAddress.ts
src/app/utils/personFields.ts
src/app/services/memberProfileService.ts
src/app/services/personInsightsService.ts
src/app/utils/whatsapp.ts
```

Documentos relacionados:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
docs/funcionalidades/TIMELINE.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/operacao/MIGRATIONS_SUPABASE.md
docs/GUIA_CORRECAO_ERROS.md
```

---

## 3. Rotas

| Rota | Proteção | Função |
|---|---|---|
| `/pessoa/:id` | `MemberRoute` | Perfil público/interno de pessoa. |
| `/pessoas/:id` | `MemberRoute` | Alias do perfil de pessoa. |
| `/admin/pessoas/nova` | `ProtectedRoute` | Criar pessoa. |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` | Editar pessoa. |
| `/admin/pessoas/:id` | `ProtectedRoute` | Alias admin de edição/visualização. |
| `/meus-dados` | `MemberRoute` | Usuário edita dados da pessoa vinculada. |

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
- insights persistidos.

Regras:

- foto principal é ampliável quando existe;
- dados sensíveis respeitam flags de privacidade;
- WhatsApp depende de telefone válido e permissão de contato;
- cards de astrologia/acontecimentos só aparecem com conteúdo, loading, erro ou fallback explícito;
- o texto **“Conteúdo ainda não gerado.”** não deve aparecer publicamente;
- pet não exibe astrologia/acontecimentos.

---

## 5. Privacidade

### 5.1 Telefone

Telefone textual só aparece com:

```txt
permitir_exibir_telefone = true
```

### 5.2 WhatsApp

WhatsApp depende de:

- telefone válido;
- flags de permissão;
- avaliação por `canUseWhatsAppContact`.

Arquivo:

```txt
src/app/utils/whatsapp.ts
```

### 5.3 Endereço

Endereço só aparece com:

```txt
permitir_exibir_endereco = true
```

### 5.4 Data de nascimento

Data de nascimento respeita:

```txt
permitir_exibir_data_nascimento
```

### 5.5 Rede social

Rede social respeita:

```txt
permitir_exibir_rede_social
permitir_exibir_instagram
```

Regra:

```txt
Não resolver privacidade apenas escondendo UI se o service/RLS expõe dados indevidos.
```

---

## 6. Admin de pessoa

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

Arquivo principal:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
```

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

## 7. Área do usuário — `/meus-dados`

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

## 8. Pets

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

## 9. Vínculo usuário-pessoa no admin

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

## 10. Autocomplete de endereço

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

## 11. Eventos pessoais

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
- perfil pode exibir eventos;
- timeline pode consumir eventos pessoais;
- eventos não devem quebrar perfil se ausentes.

Documento complementar:

```txt
docs/funcionalidades/TIMELINE.md
```

---

## 12. Arquivos históricos

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

## 13. Insights

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
- texto **“Conteúdo ainda não gerado.”** não deve aparecer publicamente;
- pet não exibe astrologia/acontecimentos;
- card admin aparece se houver ação possível, conteúdo, loading ou erro.

---

## 14. Troubleshooting

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

### Campo endereço não mostra sugestões

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY`;
- carregamento de Google Places no console;
- uso de `AddressAutocompleteInput`;
- fallback para input normal.

### API key ausente

Comportamento esperado:

- pode aparecer aviso no console em desenvolvimento;
- formulário continua salvável com input normal.

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

---

## 15. Checklist de QA

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
- nascimento oculto.

### Admin

- criar pessoa;
- editar pessoa;
- salvar humano;
- salvar pet;
- salvar pessoa falecida;
- salvar local exterior;
- salvar redes sociais;
- salvar eventos;
- salvar arquivos históricos;
- vínculo usuário-pessoa no admin;
- botão Recarregar;
- insights admin.

### `/meus-dados`

- editar dados próprios;
- salvar endereço;
- autocomplete com API key;
- fallback sem API key;
- validar privacidade;
- confirmar dados quando aplicável.

### Técnico

```bash
npm run build
npm test
git diff --check
```

Se envolver rota/admin/vínculo:

```bash
npm run test:e2e
supabase migration list
```

---

## 16. Pós-MVP

Possíveis evoluções:

- refatorar `AdminPessoaForm` em blocos menores;
- reaproveitar mais componentes entre admin e `/meus-dados`;
- persistência semântica de pet/tutor;
- privacidade por evento;
- arquivos por evento;
- insights adicionais;
- histórico de alterações por campo;
- validação mais detalhada de endereço;
- controles administrativos de exibição pública.

Esses itens não bloqueiam o MVP.
