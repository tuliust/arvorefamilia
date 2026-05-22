# Pessoas, Perfil Público e Admin de Pessoa

## Status

- Perfil público: `/pessoa/:id` e `/pessoas/:id`.
- Admin de pessoa: `/admin/pessoas/nova` e `/admin/pessoas/:id/editar`.
- Área do usuário: `/meus-dados`.
- Inclui vínculos usuário-pessoa, insights, WhatsApp e autocomplete de endereço.

## Arquivos principais

```txt
src/app/pages/PersonProfile.tsx
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/AddressAutocompleteInput.tsx
src/app/utils/googleAddress.ts
src/app/utils/personFields.ts
src/app/services/memberProfileService.ts
src/app/services/personInsightsService.ts
src/app/utils/whatsapp.ts
```

## Perfil público

- Exibe dados básicos, foto, informações biográficas, relacionamentos, eventos, timeline e arquivos conforme dados carregados.
- Foto principal é ampliável quando existe.
- Contato respeita privacidade:
  - telefone textual só aparece com `permitir_exibir_telefone = true`;
  - endereço só aparece com `permitir_exibir_endereco = true`;
  - data de nascimento respeita `permitir_exibir_data_nascimento`.
- WhatsApp depende de telefone válido e permissão de contato conforme `canUseWhatsAppContact`.
- Cards de astrologia/acontecimentos só aparecem com conteúdo, loading, erro ou fallback explícito.
- O texto **“Conteúdo ainda não gerado.”** não deve aparecer publicamente.

## Admin de pessoa

- Formulário dividido por blocos: foto, dados básicos, datas/locais, bio, contato, privacidade, eventos, arquivos históricos, relacionamentos e vínculos.
- Rascunho do admin usa `sessionStorage` com chave por criação/edição.
- Eventos da vida usam `PersonEventsEditor`.
- Arquivos históricos usam `ArquivosHistoricos`.
- Redes sociais usam os componentes compartilhados de perfis sociais.
- Privacidade controla exibição pública de dados sensíveis.
- Dados conjugais aparecem quando o relacionamento aplicável exige edição.
- Insights são gerados/regenerados por ação explícita do admin via `generate-person-insights`.
- Card de insights no admin só aparece quando há ação possível, conteúdo existente, loading ou erro.

## Pets

- Pet pode ter nome simples com duas letras ou mais.
- Humano exige pelo menos nome e sobrenome com duas letras ou mais.
- Pets não exibem astrologia/acontecimentos.

## Vínculo usuário-pessoa no admin

- A listagem de usuários depende de `adminListProfilesForLinking`.
- O service chama a RPC `public.admin_list_profiles_for_linking`.
- Correção da RPC: `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`.
- O dropdown exclui usuários já vinculados à pessoa.
- Erro de listagem deve aparecer inline no card.
- O botão **Recarregar** tenta buscar novamente.
- Não usar fallback inseguro de consulta direta em `profiles`.

## Autocomplete de endereço

- Componente: `AddressAutocompleteInput`.
- Usa Google Places quando `VITE_GOOGLE_MAPS_API_KEY` existe.
- Sem API key, ou se o Google falhar, o campo continua como input normal.
- Usado em `/meus-dados` e no admin via `PersonContactFields`.
- Formatação fica centralizada em `src/app/utils/googleAddress.ts`.

## Privacidade

- Telefone textual: somente com `permitir_exibir_telefone`.
- WhatsApp: depende de telefone válido e flags de permissão avaliadas por `canUseWhatsAppContact`.
- Endereço: somente com `permitir_exibir_endereco`.
- Data de nascimento: respeita `permitir_exibir_data_nascimento`.
- Rede social: respeita `permitir_exibir_rede_social` ou `permitir_exibir_instagram`.

## Troubleshooting

### Usuário não aparece no dropdown

- Verificar `adminListProfilesForLinking`.
- Confirmar que a pessoa já não tem vínculo com esse usuário.
- Conferir erro inline e usar **Recarregar**.
- Confirmar usuário logado como admin.

### Erro de schema cache da RPC

- Mensagem típica: `Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache`.
- Aplicar `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` no Supabase remoto.
- Conferir assinatura `public.admin_list_profiles_for_linking()` sem parâmetros.
- Não trocar por consulta direta insegura em `profiles`.

### Campo endereço não mostra sugestões

- Verificar `VITE_GOOGLE_MAPS_API_KEY`.
- Verificar carregamento de Google Places no console.
- Confirmar uso de `AddressAutocompleteInput`.
- Confirmar fallback para input normal.

### API key ausente

- Em desenvolvimento pode aparecer aviso no console.
- O formulário deve continuar salvável com input normal.

### Card de insights aparece vazio

- Verificar `PersonDataView.tsx`.
- Card público sem conteúdo/loading/erro/fallback deve retornar `null`.
- No admin, card só deve aparecer com ação possível, conteúdo, loading ou erro.

### Pet exige sobrenome por regressão

- Verificar `validateEditablePersonForm`.
- `humano_ou_pet = 'Pet'` deve usar `hasValidPetName`.
- Humano continua usando `hasFirstAndLastName`.

### Botão WhatsApp aparece sem permissão

- Verificar `canUseWhatsAppContact`.
- Confirmar telefone válido.
- Confirmar flags de privacidade/contato da pessoa.

## Checklist de QA

- Perfil público humano com insights.
- Perfil público humano sem insights.
- Perfil público de pet.
- Admin editar pessoa.
- Admin criar pessoa.
- Vínculo usuário-pessoa no admin.
- Autocomplete de endereço com API key.
- Fallback de endereço sem API key.
- Rodar `npm run build`.
- Rodar `npm test`.
- Rodar `git diff --check`.
