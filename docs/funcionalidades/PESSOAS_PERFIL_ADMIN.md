# Pessoas, perfil pÃºblico e admin de pessoa

> Local recomendado: `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`
> Tipo: documentaÃ§Ã£o funcional especÃ­fica.

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

- perfil pÃºblico/interno de pessoa;
- admin de pessoa;
- ediÃ§Ã£o dos prÃ³prios dados;
- vÃ­nculos usuÃ¡rio-pessoa;
- insights;
- WhatsApp;
- autocomplete de endereÃ§o;
- privacidade;
- pets;
- eventos pessoais;
- arquivos histÃ³ricos.

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

| Rota | ProteÃ§Ã£o | FunÃ§Ã£o |
|---|---|---|
| `/pessoa/:id` | `MemberRoute` | Perfil pÃºblico/interno de pessoa. |
| `/pessoas/:id` | `MemberRoute` | Alias do perfil de pessoa. |
| `/admin/pessoas/nova` | `ProtectedRoute` | Criar pessoa. |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` | Editar pessoa. |
| `/admin/pessoas/:id` | `ProtectedRoute` | Alias admin de ediÃ§Ã£o/visualizaÃ§Ã£o. |
| `/meus-dados` | `MemberRoute` | UsuÃ¡rio edita dados da pessoa vinculada. |

---

## 4. Perfil pÃºblico/interno

O perfil exibe, conforme dados e permissÃµes:

- dados bÃ¡sicos;
- foto principal;
- informaÃ§Ãµes biogrÃ¡ficas;
- relacionamentos;
- eventos;
- timeline;
- arquivos histÃ³ricos;
- redes sociais;
- contato;
- insights persistidos.

Regras:

- foto principal Ã© ampliÃ¡vel quando existe;
- dados sensÃ­veis respeitam flags de privacidade;
- WhatsApp depende de telefone vÃ¡lido e permissÃ£o de contato;
- cards de astrologia/acontecimentos sÃ³ aparecem com conteÃºdo, loading, erro ou fallback explÃ­cito;
- o texto **â€œConteÃºdo ainda nÃ£o gerado.â€** nÃ£o deve aparecer publicamente;
- pet nÃ£o exibe astrologia/acontecimentos.

---

## 5. Privacidade

### 5.1 Telefone

Telefone textual sÃ³ aparece com:

```txt
permitir_exibir_telefone = true
```

### 5.2 WhatsApp

WhatsApp depende de:

- telefone vÃ¡lido;
- flags de permissÃ£o;
- avaliaÃ§Ã£o por `canUseWhatsAppContact`.

Arquivo:

```txt
src/app/utils/whatsapp.ts
```

### 5.3 EndereÃ§o

EndereÃ§o sÃ³ aparece com:

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
NÃ£o resolver privacidade apenas escondendo UI se o service/RLS expÃµe dados indevidos.
```

---

## 6. Admin de pessoa

O formulÃ¡rio admin Ã© dividido por blocos:

- foto;
- dados bÃ¡sicos;
- datas/locais;
- biografia;
- contato;
- privacidade;
- eventos;
- arquivos histÃ³ricos;
- relacionamentos;
- vÃ­nculos;
- insights.

Arquivo principal:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
```

Comportamento:

- rascunho usa `sessionStorage` com chave por criaÃ§Ã£o/ediÃ§Ã£o;
- eventos da vida usam `PersonEventsEditor`;
- arquivos histÃ³ricos usam `ArquivosHistoricos`;
- redes sociais usam componentes compartilhados;
- privacidade controla exibiÃ§Ã£o pÃºblica;
- dados conjugais aparecem quando aplicÃ¡vel;
- insights sÃ£o gerados/regenerados por aÃ§Ã£o explÃ­cita do admin via `generate-person-insights`;
- card de insights no admin sÃ³ aparece quando hÃ¡ aÃ§Ã£o possÃ­vel, conteÃºdo existente, loading ou erro.

---

## 7. Ãrea do usuÃ¡rio â€” `/meus-dados`

A pÃ¡gina `/meus-dados` permite que o usuÃ¡rio edite dados da pessoa vinculada quando tiver permissÃ£o.

Regras:

- respeitar `user_person_links.can_edit`;
- confirmar dados quando aplicÃ¡vel;
- nÃ£o permitir ediÃ§Ã£o de pessoa sem vÃ­nculo;
- usar componentes compartilhados sempre que possÃ­vel;
- preservar autocomplete de endereÃ§o;
- preservar validaÃ§Ãµes de humano/pet;
- nÃ£o expor aÃ§Ã£o admin.

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

Regras de validaÃ§Ã£o:

```txt
Pet:
  pode ter nome simples com duas letras ou mais.

Humano:
  exige pelo menos nome e sobrenome com duas letras ou mais.
```

Regras de exibiÃ§Ã£o:

- pets nÃ£o exibem astrologia/acontecimentos;
- pets podem aparecer no perfil;
- pets aparecem em card prÃ³prio quando relacionados como filho tÃ©cnico;
- pets usam regra semÃ¢ntica de `humano_ou_pet`.

Arquivo relacionado:

```txt
src/app/utils/personEntity.ts
```

Documento complementar:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 9. VÃ­nculo usuÃ¡rio-pessoa no admin

A listagem de usuÃ¡rios depende de:

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

- dropdown exclui usuÃ¡rios jÃ¡ vinculados Ã  pessoa;
- erro de listagem aparece inline no card;
- botÃ£o **Recarregar** tenta buscar novamente;
- nÃ£o usar fallback inseguro de consulta direta em `profiles`;
- usuÃ¡rio logado precisa ser admin.

---

## 10. Autocomplete de endereÃ§o

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

FormataÃ§Ã£o centralizada em:

```txt
src/app/utils/googleAddress.ts
```

Regra:

```txt
falha do Google nÃ£o pode bloquear salvamento do formulÃ¡rio.
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
- eventos nÃ£o devem quebrar perfil se ausentes.

Documento complementar:

```txt
docs/funcionalidades/TIMELINE.md
```

---

## 12. Arquivos histÃ³ricos

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
- ediÃ§Ã£o de tÃ­tulo, descriÃ§Ã£o, ano e categoria;
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

- perfil apenas lÃª insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- perfil pÃºblico nÃ£o renderiza card vazio;
- texto **â€œConteÃºdo ainda nÃ£o gerado.â€** nÃ£o deve aparecer publicamente;
- pet nÃ£o exibe astrologia/acontecimentos;
- card admin aparece se houver aÃ§Ã£o possÃ­vel, conteÃºdo, loading ou erro.

---

## 14. Troubleshooting

### UsuÃ¡rio nÃ£o aparece no dropdown

Verificar:

- `adminListProfilesForLinking`;
- se a pessoa jÃ¡ nÃ£o tem vÃ­nculo com esse usuÃ¡rio;
- erro inline;
- botÃ£o **Recarregar**;
- usuÃ¡rio logado como admin.

### Erro de schema cache da RPC

Mensagem tÃ­pica:

```txt
Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache
```

CorreÃ§Ã£o:

- aplicar `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` no Supabase remoto;
- conferir assinatura `public.admin_list_profiles_for_linking()` sem parÃ¢metros;
- aguardar/recarregar schema cache, se necessÃ¡rio;
- nÃ£o trocar por consulta direta insegura em `profiles`.

### Campo endereÃ§o nÃ£o mostra sugestÃµes

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY`;
- carregamento de Google Places no console;
- uso de `AddressAutocompleteInput`;
- fallback para input normal.

### API key ausente

Comportamento esperado:

- pode aparecer aviso no console em desenvolvimento;
- formulÃ¡rio continua salvÃ¡vel com input normal.

### Card de insights aparece vazio

Verificar:

- `PersonDataView.tsx`;
- se hÃ¡ conteÃºdo/loading/erro/fallback;
- pet;
- regra pÃºblica versus admin.

### Pet exige sobrenome por regressÃ£o

Verificar:

- `validateEditablePersonForm`;
- `humano_ou_pet = 'Pet'`;
- `hasValidPetName`;
- humano continua usando `hasFirstAndLastName`.

### BotÃ£o WhatsApp aparece sem permissÃ£o

Verificar:

- `canUseWhatsAppContact`;
- telefone vÃ¡lido;
- flags de privacidade/contato da pessoa.

### Arquivo histÃ³rico falha ao salvar categoria

Verificar:

- migration `20260522121000_add_historical_file_event_category.sql`;
- schema cache;
- payload de `ArquivosHistoricos`;
- coluna `categoria_evento`.

---

## 15. Checklist de QA

### Perfil

- perfil pÃºblico humano com insights;
- perfil pÃºblico humano sem insights;
- perfil pÃºblico de pet;
- foto ampliÃ¡vel;
- timeline;
- arquivos histÃ³ricos;
- WhatsApp com permissÃ£o;
- WhatsApp sem permissÃ£o;
- telefone oculto;
- endereÃ§o oculto;
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
- salvar arquivos histÃ³ricos;
- vÃ­nculo usuÃ¡rio-pessoa no admin;
- botÃ£o Recarregar;
- insights admin.

### `/meus-dados`

- editar dados prÃ³prios;
- salvar endereÃ§o;
- autocomplete com API key;
- fallback sem API key;
- validar privacidade;
- confirmar dados quando aplicÃ¡vel.

### TÃ©cnico

```bash
npm run build
npm test
git diff --check
```

Se envolver rota/admin/vÃ­nculo:

```bash
npm run test:e2e
supabase migration list
```

---

## 16. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- refatorar `AdminPessoaForm` em blocos menores;
- reaproveitar mais componentes entre admin e `/meus-dados`;
- persistÃªncia semÃ¢ntica de pet/tutor;
- privacidade por evento;
- arquivos por evento;
- insights adicionais;
- histÃ³rico de alteraÃ§Ãµes por campo;
- validaÃ§Ã£o mais detalhada de endereÃ§o;
- controles administrativos de exibiÃ§Ã£o pÃºblica.

Esses itens nÃ£o bloqueiam o MVP.
