# Pessoas, perfil publico e admin de pessoa

> Ultima revisao: 2026-05-30

> Local recomendado: `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`
> Tipo: documentacao funcional especifica.

---

## 1. Status

Frente funcional consolidada no escopo atual do MVP.

Rotas principais:

```txt
/pessoa/:id
/pessoas/:id
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
/meus-dados
```

Inclui:

- perfil publico/interno de pessoa;
- admin de pessoa;
- edicao dos proprios dados;
- vinculos usuario-pessoa;
- insights;
- WhatsApp;
- autocomplete de endereco;
- privacidade;
- pets;
- eventos pessoais;
- arquivos historicos.

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

| Rota | Protecao | Funcao |
|---|---|---|
| `/pessoa/:id` | `MemberRoute` | Perfil publico/interno de pessoa. |
| `/pessoas/:id` | `MemberRoute` | Alias do perfil de pessoa. |
| `/admin/pessoas/nova` | `ProtectedRoute` | Criar pessoa. |
| `/admin/pessoas/:id/editar` | `ProtectedRoute` | Editar pessoa. |
| `/admin/pessoas/:id` | `ProtectedRoute` | Alias admin de edicao/visualizacao. |
| `/meus-dados` | `MemberRoute` | Usuario edita dados da pessoa vinculada. |

---

## 4. Perfil publico/interno

O perfil exibe, conforme dados e permissoes:

- dados basicos;
- foto principal;
- informacoes biograficas;
- relacionamentos;
- eventos;
- timeline;
- arquivos historicos;
- redes sociais;
- contato;
- insights persistidos.

Regras:

- foto principal e ampliavel quando existe;
- dados sensiveis respeitam flags de privacidade;
- WhatsApp depende de telefone valido e permissao de contato;
- cards de astrologia/acontecimentos so aparecem com conteudo, loading, erro ou fallback explicito;
- o texto **Conteudo ainda nao gerado.** nao deve aparecer publicamente;
- pet nao exibe astrologia/acontecimentos.

---

## 5. Privacidade

### 5.1 Telefone

Telefone textual so aparece com:

```txt
permitir_exibir_telefone = true
```

### 5.2 WhatsApp

WhatsApp depende de:

- telefone valido;
- flags de permissao;
- avaliacao por `canUseWhatsAppContact`.

Arquivo:

```txt
src/app/utils/whatsapp.ts
```

### 5.3 Endereco

Endereco so aparece com:

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
Nao resolver privacidade apenas escondendo UI se o service/RLS expoe dados indevidos.
```

---

## 6. Admin de pessoa

O formulario admin e dividido por blocos:

- foto;
- dados basicos;
- datas/locais;
- biografia;
- contato;
- privacidade;
- eventos;
- arquivos historicos;
- relacionamentos;
- vinculos;
- insights.

Arquivo principal:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
```

Comportamento:

- rascunho usa `sessionStorage` com chave por criacao/edicao;
- eventos da vida usam `PersonEventsEditor`;
- arquivos historicos usam `ArquivosHistoricos`;
- redes sociais usam componentes compartilhados;
- privacidade controla exibicao publica;
- dados conjugais aparecem quando aplicavel;
- insights sao gerados/regenerados por acao explicita do admin via `generate-person-insights`;
- card de insights no admin so aparece quando ha acao possivel, conteudo existente, loading ou erro.

---

## 7. Area do usuario - `/meus-dados`

A pagina `/meus-dados` permite que o usuario edite dados da pessoa vinculada quando tiver permissao.

Regras:

- respeitar `user_person_links.can_edit`;
- confirmar dados quando aplicavel;
- nao permitir edicao de pessoa sem vinculo;
- usar componentes compartilhados sempre que possivel;
- preservar autocomplete de endereco;
- preservar validacoes de humano/pet;
- nao expor acao admin.

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

Regras de validacao:

```txt
Pet:
  pode ter nome simples com duas letras ou mais.

Humano:
  exige pelo menos nome e sobrenome com duas letras ou mais.
```

Regras de exibicao:

- pets nao exibem astrologia/acontecimentos;
- pets podem aparecer no perfil;
- pets aparecem em card proprio quando relacionados como filho tecnico;
- pets usam regra semantica de `humano_ou_pet`.

Arquivo relacionado:

```txt
src/app/utils/personEntity.ts
```

Documento complementar:

```txt
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 9. Vinculo usuario-pessoa no admin

A listagem de usuarios depende de:

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

- dropdown exclui usuarios ja vinculados a pessoa;
- erro de listagem aparece inline no card;
- botao **Recarregar** tenta buscar novamente;
- nao usar fallback inseguro de consulta direta em `profiles`;
- usuario logado precisa ser admin.

---

## 10. Autocomplete de endereco

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

Formatacao centralizada em:

```txt
src/app/utils/googleAddress.ts
```

Regra:

```txt
falha do Google nao pode bloquear salvamento do formulario.
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
- eventos nao devem quebrar perfil se ausentes.

Documento complementar:

```txt
docs/funcionalidades/TIMELINE.md
```

---

## 12. Arquivos historicos

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
- edicao de titulo, descricao, ano e categoria;
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

- perfil apenas le insights persistidos;
- admin gera/regenera explicitamente;
- secrets ficam server-side;
- perfil publico nao renderiza card vazio;
- texto **Conteudo ainda nao gerado.** nao deve aparecer publicamente;
- pet nao exibe astrologia/acontecimentos;
- card admin aparece se houver acao possivel, conteudo, loading ou erro.

---

## 14. Troubleshooting

### Usuario nao aparece no dropdown

Verificar:

- `adminListProfilesForLinking`;
- se a pessoa ja nao tem vinculo com esse usuario;
- erro inline;
- botao **Recarregar**;
- usuario logado como admin.

### Erro de schema cache da RPC

Mensagem tipica:

```txt
Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache
```

Correcao:

- aplicar `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` no Supabase remoto;
- conferir assinatura `public.admin_list_profiles_for_linking()` sem parametros;
- aguardar/recarregar schema cache, se necessario;
- nao trocar por consulta direta insegura em `profiles`.

### Campo endereco nao mostra sugestoes

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY`;
- carregamento de Google Places no console;
- uso de `AddressAutocompleteInput`;
- fallback para input normal.

### API key ausente

Comportamento esperado:

- pode aparecer aviso no console em desenvolvimento;
- formulario continua salvavel com input normal.

### Card de insights aparece vazio

Verificar:

- `PersonDataView.tsx`;
- se ha conteudo/loading/erro/fallback;
- pet;
- regra publica versus admin.

### Pet exige sobrenome por regressao

Verificar:

- `validateEditablePersonForm`;
- `humano_ou_pet = 'Pet'`;
- `hasValidPetName`;
- humano continua usando `hasFirstAndLastName`.

### Botao WhatsApp aparece sem permissao

Verificar:

- `canUseWhatsAppContact`;
- telefone valido;
- flags de privacidade/contato da pessoa.

### Arquivo historico falha ao salvar categoria

Verificar:

- migration `20260522121000_add_historical_file_event_category.sql`;
- schema cache;
- payload de `ArquivosHistoricos`;
- coluna `categoria_evento`.

---

## 15. Checklist de QA

### Perfil

- perfil publico humano com insights;
- perfil publico humano sem insights;
- perfil publico de pet;
- foto ampliavel;
- timeline;
- arquivos historicos;
- WhatsApp com permissao;
- WhatsApp sem permissao;
- telefone oculto;
- endereco oculto;
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
- salvar arquivos historicos;
- vinculo usuario-pessoa no admin;
- botao Recarregar;
- insights admin.

### `/meus-dados`

- editar dados proprios;
- salvar endereco;
- autocomplete com API key;
- fallback sem API key;
- validar privacidade;
- confirmar dados quando aplicavel.

### Tecnico

```bash
npm run build
npm test
git diff --check
```

Se envolver rota/admin/vinculo:

```bash
npm run test:e2e
supabase migration list
```

---

## 16. Pos-MVP

Possiveis evolucoes:

- refatorar `AdminPessoaForm` em blocos menores;
- reaproveitar mais componentes entre admin e `/meus-dados`;
- persistencia semantica de pet/tutor;
- privacidade por evento;
- arquivos por evento;
- insights adicionais;
- historico de alteracoes por campo;
- validacao mais detalhada de endereco;
- controles administrativos de exibicao publica.

Esses itens nao bloqueiam o MVP.

---

## 18. Modal de relacionamento conjugal

O modal aberto ao clicar no anel/alianca de relacionamento deve apresentar dados legiveis para usuario final.

Arquivo principal:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

Regras consolidadas de exibicao:

- `conjuge` deve ser exibido como **Conjuge**;
- `casamento` deve ser exibido como **Casamento**;
- o campo **ID do relacionamento** nao deve ser exibido ao usuario;
- informacoes tecnicas internas nao devem aparecer para usuario comum;
- observacoes podem aparecer quando fizerem sentido para admin;
- arquivos historicos do relacionamento permanecem no modal.

Campos uteis no modal:

- Conjuge 1;
- Conjuge 2;
- Status;
- Tipo de relacionamento;
- Casamento;
- Data do casamento;
- Local do casamento;
- Data de separacao, quando houver;
- Local de separacao, quando houver;
- Observacoes, quando permitido;
- Arquivos historicos.

Cuidados:

- nao exibir separacao quando o relacionamento terminou por falecimento;
- status de viuvez deve ser tratado de forma distinta de separacao/divorcio;
- data de casamento deve usar `data_casamento` quando existir;
- nao voltar a exibir IDs tecnicos no modal publico.

## 19. Pendencias mapeadas para perfil publico

Itens ainda pendentes ou em validacao visual:

- remover **Signo** do topo do perfil publico;
- remover botao separado **Entrar em contato por WhatsApp**;
- transformar o numero de telefone em link para WhatsApp quando permitido;
- usar estilo visual de link semelhante ao de redes sociais;
- corrigir timeline para casamento salvo como `30/07/1988` quando ainda aparecer como **Data desconhecida**;
- evitar evento de separacao quando o relacionamento terminou por falecimento da conjuge.

---
## 20. Ajustes recentes e pendencias - ciclo 2026-05-30

### 20.1 Modal de relacionamento conjugal

Status consolidado:

```txt
remover ID tecnico do relacionamento -> implementado
exibir conjuge como Conjuge/Conjuge acentuado conforme politica de encoding -> implementado
exibir casamento como Casamento -> implementado
manter arquivos historicos do relacionamento -> implementado
```

Regras:

- o modal aberto pela alianca deve priorizar informacao legivel;
- IDs tecnicos nao devem aparecer para usuario final;
- observacoes internas continuam condicionadas a admin;
- arquivos historicos do relacionamento continuam disponiveis quando houver relacionamento persistido.

### 20.2 Perfil publico `/pessoa/:id`

Pendencias mapeadas:

```txt
remover campo Signo do topo do perfil publico
remover botao separado Entrar em contato por WhatsApp
transformar Telefone em link para WhatsApp quando permitido
usar estilo de link semelhante ao de redes sociais
```

Regras para implementacao:

- signo e derivado da data de nascimento e nao deve ocupar destaque no perfil publico;
- WhatsApp nao deve revelar telefone se a privacidade nao permitir;
- se `canUseWhatsAppContact` retornar falso, o telefone pode continuar texto normal ou oculto conforme permissao;
- se telefone for clicavel, usar `target="_blank"` e `rel="noopener noreferrer"`;
- nao duplicar contato exibindo ao mesmo tempo telefone-link e botao separado de WhatsApp.

### 20.3 Casamento, separacao e viuvez

Pendencias mapeadas:

```txt
data_casamento salva como 30/07/1988 nao pode aparecer como Data desconhecida
relacionamento encerrado por falecimento nao deve aparecer como separacao
evento Separacao nao deve ser criado quando o caso e viuvez
```

Regras esperadas:

- timeline e secoes de relacionamento devem ler `data_casamento` quando existir;
- aceitar formato ISO e, quando aplicavel, `DD/MM/AAAA`;
- separacao/divorcio dependem de campo explicito de separacao/fim;
- falecimento de conjuge deve gerar estado de viuvez, nao separacao;
- nao inferir separacao apenas porque um relacionamento nao esta ativo.

### 20.4 Checklist de validacao do perfil

Validar:

```txt
/pessoa/:id humano vivo
/pessoa/:id humano falecido
/pessoa/:id com telefone publico
/pessoa/:id com telefone privado
/pessoa/:id com WhatsApp permitido
/pessoa/:id com WhatsApp nao permitido
/pessoa/:id com casamento e data_casamento
/pessoa/:id com conjuge falecido
modal da alianca sem ID tecnico
timeline sem Data desconhecida quando ha data de casamento
```
