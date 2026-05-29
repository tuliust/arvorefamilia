# Guia de correÃ§Ã£o de erros â€” Ãrvore FamÃ­lia

> Ãšltima atualizaÃ§Ã£o: 2026-05-29
> Local canÃ´nico: `docs/GUIA_CORRECAO_ERROS.md`

## Objetivo

Este documento Ã© um guia de investigaÃ§Ã£o e correÃ§Ã£o por sintoma. Use quando:

- uma funcionalidade falhar;
- houver regressÃ£o;
- o build quebrar;
- uma tela nÃ£o carregar;
- uma permissÃ£o/RLS se comportar de forma inesperada;
- uma Edge Function, migration, Storage ou rotina de notificaÃ§Ã£o apresentar erro.

Este guia nÃ£o descreve roadmap nem lista implementaÃ§Ãµes concluÃ­das em detalhe. Para isso, use:

- `docs/GUIA_IMPLEMENTACOES.md`: o que jÃ¡ foi implementado.
- `docs/PLANO_PROXIMOS_PASSOS.md`: validaÃ§Ãµes finais, lanÃ§amento e backlog pÃ³s-MVP.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: procedimento operacional de migrations.
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`: troubleshooting especÃ­fico do calendÃ¡rio familiar.
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: regra funcional de exportaÃ§Ã£o da Ã¡rvore.
- `docs/funcionalidades/NOTIFICACOES.md`: detalhes de arquitetura e operaÃ§Ã£o de notificaÃ§Ãµes.
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: troubleshooting especÃ­fico de pessoas, perfil e admin.
- `docs/funcionalidades/TIMELINE.md`: detalhes da timeline.

---

## Como usar este guia

Use este documento por **sintoma observado**, nÃ£o por arquivo. O fluxo recomendado Ã©:

1. identificar o sintoma;
2. localizar os arquivos provÃ¡veis;
3. reproduzir o erro;
4. corrigir a menor causa real;
5. validar com build/testes;
6. registrar nova regra apenas se ela for recorrente.

Evite usar este guia como backlog. PendÃªncias e melhorias devem ficar em `docs/PLANO_PROXIMOS_PASSOS.md`.

## 1. Checklist inicial de investigaÃ§Ã£o

Antes de alterar cÃ³digo:

```bash
git status
npm run build
git diff --check
```

Se envolver banco:

```bash
supabase migration list
```

Se envolver Edge Functions:

```bash
supabase functions list
```

Se envolver testes:

```bash
npm test
npm run test:e2e
```

Regras:

- corrigir build antes de QA manual;
- corrigir o primeiro erro real do terminal antes de seguir para erros derivados;
- nÃ£o rodar `supabase db push` sem revisar `supabase migration list`;
- nÃ£o usar `migration repair` para mascarar migration nÃ£o aplicada;
- nÃ£o commitar dumps, tokens, service role ou secrets;
- nÃ£o commitar `backups/`, arquivos `.bak`, patches temporÃ¡rios ou saÃ­das de build;
- nÃ£o apagar dados legados/base64 sem auditoria;
- nÃ£o ampliar RLS para resolver bug de leitura sem entender a regra de negÃ³cio.

---

## 2. Build quebrado

Arquivos provÃ¡veis:

```txt
src/app/types/index.ts
src/app/routes.tsx
src/app/pages
src/app/components
src/app/services
src/app/utils
package.json
vite.config.ts
tsconfig.json
```

Investigar:

- import inexistente;
- export ausente;
- componente movido sem ajustar caminho;
- tipo ausente em `types/index.ts`;
- campo de banco usado no frontend sem tipo;
- dependÃªncia nÃ£o instalada;
- action/log novo nÃ£o incluÃ­do nos tipos;
- conflito de nome entre tipos, componentes e services;
- arquivo com erro de sintaxe apÃ³s merge;
- JSX invÃ¡lido apÃ³s script de substituiÃ§Ã£o.

CorreÃ§Ã£o:

1. rodar `npm run build`;
2. ler o primeiro erro do terminal;
3. corrigir o arquivo apontado;
4. repetir `npm run build`;
5. rodar `git diff --check`;
6. confirmar que a correÃ§Ã£o nÃ£o alterou escopo funcional indevidamente.

### Erro: `Link is not defined`

Sintoma:

```txt
ReferenceError: Link is not defined
```

Exemplo jÃ¡ ocorrido:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Causa provÃ¡vel:

- import de `AppLink as Link` removido durante padronizaÃ§Ã£o de header;
- a pÃ¡gina ainda usa `<Link>` em trechos internos.

CorreÃ§Ã£o:

```ts
import { AppLink as Link } from '../components/AppLink';
```

Confirmar:

```bash
npm run build
npm test
git diff --check
```

### Erro: `Missing initializer in const declaration` em `React.forwardRef`

Sintoma:

```txt
Missing initializer in const declaration
```

Arquivo provÃ¡vel:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Causa provÃ¡vel:

- script alterou a declaraÃ§Ã£o `export const FamilyTree = React.forwardRef...`;
- falta `=`;
- parÃªnteses/chaves foram quebrados.

CorreÃ§Ã£o segura:

- preferir funÃ§Ã£o nomeada + export com `React.forwardRef` ao final:

```ts
function FamilyTreeComponent(props: FamilyTreeProps, ref: React.ForwardedRef<FamilyTreeActions>) {
  // ...
}

export const FamilyTree = React.forwardRef<FamilyTreeActions, FamilyTreeProps>(FamilyTreeComponent);
```

Ajustar o formato real conforme a assinatura de props usada no arquivo.

### Erro: `Expected "}" but found ":"` em `style`

Sintoma:

```txt
Expected "}" but found ":"
style={ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }
```

CorreÃ§Ã£o:

```tsx
style={{ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }}
```

### Erro: arquivo gerado por script nÃ£o corresponde ao formato esperado

Sintoma:

```txt
O arquivo ... nÃ£o estÃ¡ exatamente no formato esperado. NÃ£o apliquei alteraÃ§Ãµes para evitar quebra.
```

Causa:

- arquivo jÃ¡ foi alterado por commit posterior;
- script baseado em substituiÃ§Ã£o literal ficou obsoleto.

CorreÃ§Ã£o:

- conferir `git diff`;
- buscar trechos por nomes de funÃ§Ãµes, nÃ£o por blocos inteiros;
- preferir patch manual localizado;
- se houver risco, recuperar backup e aplicar ajuste menor.

---

## 3. Git, backups locais e limpeza

### `index.lock`

Sintoma:

```txt
fatal: Unable to create '.git/index.lock': File exists.
```

CorreÃ§Ã£o:

1. confirmar que nÃ£o hÃ¡ `git commit`, editor ou processo Git aberto;
2. se nÃ£o houver processo ativo, remover o lock:

```bash
rm -f .git/index.lock
git status
```

### Backups aparecem no `git status`

Sintoma:

```txt
Untracked files:
  backups/
  *.bak
  *.patch
```

Regra:

- nÃ£o commitar backups gerados por scripts;
- remover depois que build/test passaram e o commit correto foi enviado.

CorreÃ§Ã£o:

```bash
rm -rf backups/
rm -f *.bak *.patch
git status
```

Se os backups estiverem em subpastas:

```bash
find src -name "*.bak" -type f -delete
rm -rf backups/
git status
```

Se arquivos `*.bak-views-normalization` aparecerem rastreados em `src/app/components/FamilyTree`, confirmar que nÃ£o sÃ£o importados e remover com `git rm`. Backups rastreados jÃ¡ removidos:

```txt
src/app/components/FamilyTree/PersonNode.tsx.bak-views-normalization
src/app/components/FamilyTree/types.ts.bak-views-normalization
```

---

## 4. Rotas das views da Ã¡rvore

Arquivos provÃ¡veis:

```txt
src/app/routes.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeMobileNav.tsx
```

Comportamento esperado:

- `/` redireciona para `/minha-arvore` preservando search params;
- `/minha-arvore`, `/genealogia` e `/visao-completa` usam `TreeAccessRoute`;
- `Home.tsx` deriva `treeViewMode` de `location.pathname`;
- header e nav mobile usam o mesmo callback de troca de view;
- troca de view usa `navigate`, nÃ£o `window.location`;
- antes de navegar, comparar `location.pathname` com o path alvo;
- search params como `?pessoa=...` devem ser preservados.

Se uma view abrir pÃºblica por engano:

1. revisar `src/app/routes.tsx`;
2. confirmar que a rota usa `TreeAccessRoute`;
3. rodar `npm run build`;
4. testar manualmente login/acesso conforme regra de produto.

Se `?pessoa=...` desaparecer ao trocar view:

1. revisar o callback central de troca de view em `Home.tsx`;
2. confirmar que o destino concatena `location.search`;
3. evitar `setTreeViewMode` local separado da rota.

### Commit jÃ¡ enviado, mas hÃ¡ alteraÃ§Ãµes locais

Verificar:

```bash
git status
git diff --stat
```

Se for ajuste novo:

```bash
git add caminho/do/arquivo
git commit -m "mensagem"
git push origin main
```

Se for lixo local:

```bash
git restore caminho/do/arquivo
rm -rf backups/
git status
```

---

## 5. Rotas, acesso e permissÃµes

Arquivos provÃ¡veis:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
src/app/contexts/AuthContext.tsx
```

### UsuÃ¡rio comum acessa admin

Verificar:

- rota usa `ProtectedRoute`;
- `isAdminUser(user)` retorna corretamente;
- `profiles.role = 'admin'`;
- RPC/admin role estÃ¡ funcionando;
- fallback de erro bloqueia acesso;
- RLS da tabela sensÃ­vel nÃ£o libera leitura/escrita indevida;
- menu nÃ£o renderiza botÃ£o admin para usuÃ¡rio comum.

CorreÃ§Ã£o:

- proteger rota;
- corrigir renderizaÃ§Ã£o condicional;
- corrigir service chamado pela UI;
- corrigir policy RLS, se necessÃ¡rio;
- nunca esconder sÃ³ no frontend mantendo escrita liberada no banco.

### Admin nÃ£o vÃª Painel Administrativo

Verificar:

- sessÃ£o Supabase ativa;
- `profiles.role`;
- RPC `is_admin_user`;
- estado `isAdmin` em `Home.tsx`;
- fallback de loading/erro;
- cache de sessÃ£o antigo.

### UsuÃ¡rio autenticado nÃ£o acessa pÃ¡gina de membro

Verificar:

- `MemberRoute`;
- `AuthContext`;
- status de loading da sessÃ£o;
- vÃ­nculo de perfil, se a rota exigir;
- erro de RLS em consultas iniciais.

---

## 6. Headers, margens e navegaÃ§Ã£o interna

Arquivos provÃ¡veis:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/Home.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/admin/AdminDashboard.tsx
```

### Header interno diferente entre pÃ¡ginas

Verificar:

- pÃ¡gina usa `MemberPageHeader`;
- container usa `PAGE_CONTAINER_CLASS`;
- Home pÃ³s-login deve continuar com header prÃ³prio;
- `/minha-arvore`, `/calendario-familiar`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/admin` devem compartilhar o padrÃ£o interno.

### Margens laterais divergentes

Verificar:

- `max-w-7xl`;
- `px-4 sm:px-6 lg:px-8`;
- `PAGE_CONTAINER_CLASS`;
- wrappers duplicados em header/main.

### BotÃ£o duplicado de recolher/expandir painel

Arquivos provÃ¡veis:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

Verificar:

- botÃ£o interno do painel;
- botÃ£o passado por props para `FamilyTree`;
- `showSidebarToggle`;
- `onToggleSidebar`;
- mobile versus desktop;
- estado `sidebarOpen` e `legendOpen`.

Regra esperada:

- apenas um botÃ£o de expandir/recolher visÃ­vel;
- em desktop, dentro ou junto ao painel;
- em mobile, junto ao painel mÃ³vel;
- nÃ£o pode existir botÃ£o duplicado na Ã¡rea da Ã¡rvore.

---

## 7. FormulÃ¡rios de pessoa

Arquivos provÃ¡veis:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/components/person
src/app/components/person/AddressAutocompleteInput.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/utils/googleAddress.ts
src/app/utils/personFields.ts
src/app/services/dataService.ts
```

### Pessoa nÃ£o salva

Verificar:

- `cleanPersonPayload`;
- `PESSOA_COLUMNS`;
- tipo `Pessoa`;
- migration do campo;
- validaÃ§Ã£o de campos obrigatÃ³rios;
- `adicionarPessoa`;
- `atualizarPessoa`;
- erro de RLS;
- erro no console do Supabase.

CorreÃ§Ã£o:

- incluir campo no tipo e no payload somente se existir no banco;
- manter limpeza de campos desconhecidos;
- corrigir policy sem liberar escrita indevida;
- validar que o formulÃ¡rio nÃ£o envia `undefined` onde o banco exige `null`.

### Campo novo nÃ£o persiste

Confirmar se o campo estÃ¡ em:

- tipo TypeScript;
- estado do formulÃ¡rio;
- componente de input;
- payload limpo;
- lista de colunas do service;
- migration;
- banco remoto;
- SELECT usado na leitura apÃ³s salvar.

### Autocomplete de endereÃ§o nÃ£o aparece

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY` existe no ambiente do frontend;
- `AddressAutocompleteInput` estÃ¡ sendo usado no campo de endereÃ§o;
- `PersonContactFields` estÃ¡ presente no admin;
- console do navegador para falha de carregamento do Google Places.

CorreÃ§Ã£o:

- configurar `VITE_GOOGLE_MAPS_API_KEY` quando autocomplete for necessÃ¡rio;
- confirmar `src/app/utils/googleAddress.ts` para formataÃ§Ã£o do endereÃ§o;
- manter fallback silencioso para input normal quando a chave nÃ£o existir ou o Google falhar;
- nÃ£o bloquear salvamento do formulÃ¡rio por falha externa do Google.

Campos frequentes:

- `falecido`;
- `local_nascimento_exterior`;
- `local_falecimento_exterior`;
- `permitir_mensagens_whatsapp`;
- redes sociais;
- datas conjugais;
- observaÃ§Ãµes internas.

### FormulÃ¡rio perde dados

Verificar:

- rascunho em `sessionStorage`;
- `useUnsavedChanges`;
- `useEffect` assÃ­ncrono sobrescrevendo estado apÃ³s ediÃ§Ã£o local;
- preview/download chamando `onChange`;
- botÃµes internos sem `type="button"`;
- modal fechando e limpando estado pai;
- objeto inicial recalculado sem memoizaÃ§Ã£o adequada.

### Modal de relacionamento salva antes da hora

Verificar:

- `ConfirmDialog` nÃ£o deve ser usado para adicionar relacionamento no fluxo de formulÃ¡rio;
- relacionamento pendente sÃ³ deve salvar no botÃ£o principal;
- cancelamentos usam `type="button"`;
- dados conjugais pendentes ficam no rascunho;
- `onSubmit` do formulÃ¡rio nÃ£o Ã© disparado por botÃ£o interno.

---

## 8. Busca com acentos

Arquivos provÃ¡veis:

```txt
src/app/utils/searchText.ts
src/app/services/dataService.ts
src/app/pages/admin/AdminPessoas.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
```

Sintomas:

- `Marcio` nÃ£o encontra `MÃ¡rcio`;
- `Sao Paulo` nÃ£o encontra `SÃ£o Paulo`;
- busca funciona em uma tela e falha em outra.

Verificar:

- uso de `normalizeSearchText`;
- uso de `includesNormalizedText`;
- `toLowerCase().includes(...)` sem normalizaÃ§Ã£o;
- busca feita no frontend versus busca feita no banco;
- campos nulos.

CorreÃ§Ã£o:

- padronizar com os helpers;
- tratar `null`/`undefined`;
- testar em admin, Ã¡rvore, relacionamentos e vinculaÃ§Ã£o.

---

## 9. Pessoa falecida e locais no exterior

Arquivos provÃ¡veis:

```txt
src/app/utils/personFields.ts
src/app/components/person/PersonDatesLocationsFields.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/MeusDados.tsx
src/app/services/dataService.ts
src/app/components/FamilyTree
```

### Pessoa marcada como falecida volta viva

Verificar:

- `falecido` em `PESSOA_COLUMNS`;
- `isPersonDeceased`;
- payload de salvamento;
- migration aplicada;
- SELECT apÃ³s salvar;
- componentes da Ã¡rvore usando helper correto.

### Local exterior rejeitado

Verificar:

- flags `local_nascimento_exterior` e `local_falecimento_exterior`;
- `validateLocationByMode`;
- modo Brasil/exterior;
- placeholder;
- formato esperado `Cidade (PaÃ­s)`;
- campo limpo indevidamente antes de salvar.

---

## 10. Arquivos histÃ³ricos e Storage

Arquivos provÃ¡veis:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/components/FotoUpload.tsx
src/app/pages/PersonProfile.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
```

### Arquivo novo salva como base64

Verificar:

- `uploadHistoricalFile`;
- bucket `historical-files`;
- `uploadPersonAvatar`;
- bucket `person-avatars`;
- fallback legado sendo chamado indevidamente;
- falha de upload escondida por fallback.

CorreÃ§Ã£o:

- novos arquivos devem ir para Storage;
- fallback base64 sÃ³ deve servir legado/compatibilidade;
- nÃ£o apagar base64 antigo automaticamente.

### Preview limpa formulÃ¡rio

Verificar:

- abrir/fechar preview nÃ£o chama `onChange`;
- botÃµes de visualizar/baixar/abrir usam `type="button"`;
- estado de `novoArquivo` nÃ£o Ã© limpo sem aÃ§Ã£o explÃ­cita;
- preview nÃ£o dispara submit do formulÃ¡rio.

### Download falha

Verificar:

- URL pÃºblica/acessÃ­vel;
- compatibilidade com `data:`;
- fallback de abrir em nova aba;
- nome de arquivo sanitizado;
- CORS;
- tipo MIME.

### Erro ao salvar `categoria_evento`

Sintomas provÃ¡veis:

- erro PostgREST/Supabase indicando que a coluna `categoria_evento` nÃ£o existe;
- insert/update em `public.arquivos_historicos` falha;
- listagem pode funcionar, mas salvar arquivo novo ou editar arquivo existente falha.

Causa provÃ¡vel:

- ambiente remoto ainda nÃ£o recebeu `20260522121000_add_historical_file_event_category.sql`;
- schema cache do Supabase ainda nÃ£o refletiu a coluna apÃ³s migration recente.

CorreÃ§Ã£o:

1. confirmar `supabase migration list`;
2. aplicar a migration pendente aprovada com `supabase db push`;
3. confirmar que `public.arquivos_historicos.categoria_evento` existe;
4. se a coluna jÃ¡ existir e o erro persistir, aguardar/recarregar schema cache do Supabase antes de alterar cÃ³digo.

Regra operacional:

- `20260522121000_add_historical_file_event_category.sql` Ã© prÃ©-requisito de deploy para versÃµes que enviam `categoria_evento` no payload;
- nÃ£o remover `categoria_evento` do payload para contornar ambiente sem migration.

### Upload abandonado deixa Ã³rfÃ£o

Verificar:

- upload antes do salvamento final;
- existÃªncia de registro correspondente em `arquivos_historicos`;
- scripts dry-run antes de qualquer limpeza.

CorreÃ§Ã£o:

- nÃ£o deletar automaticamente sem auditoria;
- registrar procedimento de limpeza em frente tÃ©cnica separada.

### Arquivo de relacionamento salva como arquivo de pessoa

Esperado:

- `relacionamento_id` preenchido;
- `pessoa_id` nulo.

Verificar:

- `ViewMarriageModal`;
- `MarriageDetailsEditor`;
- `adicionarArquivoHistoricoAoRelacionamento`;
- RLS/admin;
- payload de criaÃ§Ã£o.

---

## 11. Relacionamentos, solicitaÃ§Ãµes e dados conjugais

Arquivos provÃ¡veis:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
```

### UsuÃ¡rio comum altera relacionamento real

Verificar:

- UI estÃ¡ chamando `createRelationshipChangeRequest`;
- UI nÃ£o chama `adicionarRelacionamentoComInverso`;
- RLS de `public.relacionamentos`;
- policy antiga permissiva;
- rota admin exposta indevidamente.

CorreÃ§Ã£o:

- usuÃ¡rio comum deve gerar solicitaÃ§Ã£o;
- alteraÃ§Ã£o real deve ser feita apenas por admin/aprovaÃ§Ã£o.

### SolicitaÃ§Ã£o nÃ£o aparece no admin

Verificar:

- tabela `relationship_change_requests`;
- status `pending`;
- RLS SELECT admin;
- `listAllRelationshipChangeRequests`;
- filtro de status na tela.

### AprovaÃ§Ã£o nÃ£o altera relacionamento

Verificar:

- `approveRelationshipChangeRequest`;
- chamada ao `dataService`;
- payload de tipo/subtipo;
- dados conjugais;
- logs `relationship_change_approved`.

### RejeiÃ§Ã£o altera dado real

P0 funcional.

CorreÃ§Ã£o:

- rejeitar sÃ³ deve atualizar status da solicitaÃ§Ã£o;
- nÃ£o chamar funÃ§Ã£o que altera relacionamento real.

### Status conjugal nÃ£o aparece na Ã¡rvore

Verificar:

- `RELACIONAMENTO_COLUMNS`;
- `obterTodosRelacionamentos`;
- `getGenealogyMarriageStatus`;
- `ativo`;
- `data_separacao`;
- `subtipo_relacionamento`;
- `falecido`.

---

## 12. Ãrvore, Genealogia, VisÃ£o Completa e anel

Arquivos provÃ¡veis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/buildTreeGraph.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/filterPersonalTreeScope.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/pages/Home.tsx
```

### Minha Ãrvore carrega muito pequena

Verificar:

- funÃ§Ã£o de bounds do viewport;
- se `getViewportContentBounds` usa apenas cards reais;
- se labels, group boxes, legend nodes e anchors estÃ£o excluÃ­dos do cÃ¡lculo de zoom;
- `personNode` como base do zoom inicial;
- diferenÃ§a entre bounds de viewport e bounds de pan;
- `maxZoom` e `minZoom`;
- recenter automÃ¡tico apÃ³s zoom.

CorreÃ§Ã£o esperada:

- zoom inicial deve usar bounds de cards reais;
- elementos auxiliares nÃ£o devem reduzir a escala;
- `+` e `-` devem funcionar atÃ© o zoom mÃ¡ximo.

### Genealogia ou VisÃ£o Completa reduzem demais por altura

Regra esperada:

- Genealogia e VisÃ£o Completa usam zoom por largura;
- altura total nÃ£o deve reduzir o zoom;
- usuÃ¡rio arrasta/desliza para baixo se houver muitos cards verticais;
- posiÃ§Ã£o vertical inicial deve ser padronizada com Minha Ãrvore.

Verificar:

- `getNormalizedTreeViewport`;
- diferenciaÃ§Ã£o de regra por `viewMode`;
- cÃ¡lculo com `zoomX` versus `Math.min(zoomX, zoomY)`;
- `translateExtent` para permitir pan vertical.

### TÃ­tulo/subtÃ­tulo duplicado nas views genealÃ³gicas

Sintoma:

- overlay fixo em `FamilyTree.tsx` aparece;
- outro tÃ­tulo/subtÃ­tulo aparece junto aos cards.

Arquivos provÃ¡veis:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

CorreÃ§Ã£o:

- manter apenas overlay fixo em `FamilyTree.tsx`;
- remover title/subtitle nodes dos layouts;
- `DirectFamilyLabelNode` sÃ³ deve permanecer se usado para labels de grupo, nÃ£o tÃ­tulo principal.

### Linha diagonal entre pais e filhos

Verificar:

- regra de filho Ãºnico;
- edge ortogonal;
- `GenealogyFamilyConnectorNode`;
- layout por geraÃ§Ãµes.

### Conectores/anÃ©is soltos apÃ³s filtro

Verificar:

- filtro de pessoas visÃ­veis;
- criaÃ§Ã£o de edges apenas quando origem/destino visÃ­veis;
- `filterPersonalTreeScope`;
- dados de relacionamento sem pessoa correspondente.

### Genealogia mostra base completa

Verificar:

- view mode;
- escopo pessoal;
- pessoa central;
- `filterGraphToPersonalScope`.

### VisÃ£o Completa mostra poucas pessoas

Verificar:

- se usa base completa;
- filtros ativos;
- cache de dados;
- RLS;
- modo de visualizaÃ§Ã£o selecionado.

### Anel nÃ£o abre modal

Verificar:

- `GenealogySpouseEdge`;
- `onMarriageClick`;
- `edge.data.marriageDetails`;
- `event.stopPropagation()`;
- modal em `Home.tsx` ou `FamilyTree`.

### Modal mostra observaÃ§Ã£o para usuÃ¡rio comum

CorreÃ§Ã£o:

- renderizar observaÃ§Ãµes internas apenas quando `isAdmin = true`.

---

## 13. Painel de legendas

Arquivos provÃ¡veis:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

### Legenda nÃ£o aparece

Verificar:

- aba **Legendas** no painel lateral;
- import de `TreeLegend`;
- `activeSidebarPanel === 'legend'`;
- painel recolhido;
- z-index;
- mobile/desktop.

### Legenda aparece duplicada

Verificar:

- botÃ£o flutuante de legenda em `FamilyTree.tsx`;
- painel lateral em `Home.tsx`;
- remover popover/botÃ£o flutuante se a regra for legenda apenas no painel lateral.

### ConteÃºdo antigo volta a aparecer

Itens que nÃ£o devem voltar no painel lateral compacto:

- subtÃ­tulo â€œCores, linhas, anÃ©is e modos da Ã¡rvore.â€;
- label â€œVisualizaÃ§Ã£o atualâ€;
- card azul com view atual;
- subtÃ­tulos dentro dos cards das seÃ§Ãµes Cards, Linhas e Anel de casamento;
- Ã¡rea â€œViewsâ€ no final;
- texto â€œAtivaâ€ no anel; usar **Em relacionamento**.

### Legenda atrapalha pan/zoom

Verificar:

- `onMouseDown={(event) => event.stopPropagation()}`;
- `onClick={(event) => event.stopPropagation()}`;
- `data-tree-legend="true"`;
- propagaÃ§Ã£o para ReactFlow.

### Legenda aparece em exportaÃ§Ã£o

Verificar:

- `getDefaultTreeExportIgnoreElements`;
- seletor `[data-tree-legend="true"]`.

### Legenda contradiz Ã¡rvore

Comparar com:

- `GenealogySpouseEdge.tsx`;
- `GenealogyFamilyConnectorNode.tsx`;
- `directFamilyColors.ts`;
- `visualTokens.ts`;
- modos `minha-arvore`, `genealogia`, `visao-completa`.

---

## 14. HistÃ³rico de atividades

Arquivos provÃ¡veis:

```txt
src/app/services/activityLogService.ts
src/app/pages/admin/AdminAtividades.tsx
src/app/types/index.ts
```

### Log nÃ£o Ã© criado

Verificar:

- chamada de `createActivityLog`;
- `actor_user_id`;
- RLS de INSERT;
- erro engolido em `catch`;
- action permitida no tipo.

### Log falha para usuÃ¡rio comum

Verificar:

- `createActivityLog` nÃ£o deve depender de `.select().single()` apÃ³s insert;
- policy permite INSERT prÃ³prio;
- metadata estÃ¡ sanitizada.

### Admin nÃ£o vÃª logs

Verificar:

- policy SELECT admin;
- RPC `is_admin_user`;
- rota protegida;
- `listActivityLogs`.

### Metadata sensÃ­vel

Remover imediatamente:

- URL completa;
- base64;
- telefone;
- endereÃ§o;
- e-mail;
- token;
- secret;
- service role;
- prompt completo;
- conteÃºdo gerado por IA.

---

## 15. Admin Integridade

Arquivos provÃ¡veis:

```txt
src/app/pages/admin/AdminIntegridade.tsx
src/app/routes.tsx
src/app/services/dataService.ts
src/app/services/activityLogService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/lib/supabaseClient.ts
```

### Tela nÃ£o abre

Verificar:

- rota;
- import/export;
- `ProtectedRoute`;
- erro de service;
- erro de RLS;
- dados nulos nÃ£o tratados.

### UsuÃ¡rio comum acessa

P0 de permissÃ£o.

Corrigir:

- proteÃ§Ã£o de rota;
- fallback de permissÃ£o;
- policy RLS;
- renderizaÃ§Ã£o condicional do menu.

### DiagnÃ³stico acusa erro demais

Separar:

- erro crÃ­tico;
- alerta;
- legado compatÃ­vel;
- pendÃªncia de validaÃ§Ã£o;
- item informativo.

### Tela altera dados

P0.

CorreÃ§Ã£o:

- `/admin/integridade` deve ser somente leitura;
- qualquer correÃ§Ã£o automÃ¡tica deve virar frente prÃ³pria;
- aÃ§Ãµes assistidas ficam pÃ³s-MVP.

---

## 16. VÃ­nculo admin usuÃ¡rio-pessoa

Detalhes especÃ­ficos de pessoas/perfil/admin:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

Arquivos provÃ¡veis:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/memberProfileService.ts
supabase/migrations/20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
```

### Erro: `Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache`

Causas provÃ¡veis:

- migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` nÃ£o aplicada no Supabase remoto;
- schema cache remoto ainda nÃ£o atualizou;
- funÃ§Ã£o ausente ou com assinatura diferente.

CorreÃ§Ã£o:

- aplicar a migration aprovada;
- conferir no Supabase se `public.admin_list_profiles_for_linking()` existe sem parÃ¢metros;
- aguardar/recarregar schema cache se a funÃ§Ã£o acabou de ser criada;
- nÃ£o substituir por consulta direta insegura em `profiles`.

### UsuÃ¡rios nÃ£o aparecem no dropdown de vÃ­nculo admin

Verificar:

- resultado de `adminListProfilesForLinking`;
- erro inline no card **Adicionar vÃ­nculo manual**;
- botÃ£o **Recarregar**;
- migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` aplicada;
- usuÃ¡rio logado Ã© admin.

Comportamento esperado:

- dropdown fica desabilitado durante loading;
- dropdown fica desabilitado quando hÃ¡ erro de listagem;
- **Recarregar** tenta buscar novamente sem depender de toast repetitivo.

---

## 17. NotificaÃ§Ãµes

Arquivos provÃ¡veis:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/userEngagementService.ts
src/app/services/notificationDispatchService.ts
src/app/services/notificationRecipientsService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationScheduledService.ts
src/app/services/notificationAdminService.ts
supabase/functions/send-notification-email
supabase/functions/run-daily-notifications
docs/funcionalidades/NOTIFICACOES.md
```

### NotificaÃ§Ãµes nÃ£o aparecem

Verificar:

- `listarNotificacoesSupabase`;
- RLS de `notificacoes_usuario`;
- `user_id` correto;
- usuÃ¡rio autenticado;
- central em `/notificacoes`;
- fallback local apenas como compatibilidade.

### Marcar/remover notificaÃ§Ã£o nÃ£o funciona

Verificar:

- funÃ§Ã£o filtra por `id` e `user_id`;
- chamadas passam `user.id`;
- RLS UPDATE/DELETE do prÃ³prio usuÃ¡rio;
- rollback visual apÃ³s erro;
- console do navegador.

### PreferÃªncias nÃ£o salvam

Verificar:

- `salvarPreferenciasNotificacao`;
- tabela `preferencias_notificacao`;
- RLS de upsert por `user_id`;
- log `notification_preferences.updated`;
- defaults nÃ£o sobrescrevem `false`.

### PreferÃªncias nÃ£o aparecem em `/notificacoes`

Causa provÃ¡vel:

- as preferÃªncias foram separadas da central de notificaÃ§Ãµes.

CorreÃ§Ã£o:

- abrir `/ajustar-notificacoes`;
- verificar `src/app/pages/AjustarNotificacoes.tsx`;
- verificar `src/app/components/notifications/NotificationPreferencesPanel.tsx`;
- manter `/notificacoes` dedicada Ã  lista/central em cards.

### Gatilho nÃ£o notifica

Verificar:

- `notificationTriggersService`;
- destinatÃ¡rios em `notificationRecipientsService`;
- exclusÃ£o do ator;
- dispatch log;
- preferÃªncias do destinatÃ¡rio;
- canal interno versus e-mail.

### NotificaÃ§Ã£o duplica

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- constraint Ãºnica;
- deduplicaÃ§Ã£o de destinatÃ¡rios;
- execuÃ§Ã£o manual repetida;
- Edge Function diÃ¡ria e rotina manual usando o mesmo padrÃ£o de chave.

### E-mail real nÃ£o envia

Verificar:

- deploy de `send-notification-email`;
- secrets: `RESEND_API_KEY`, `NOTIFICATION_EMAIL_FROM`, `NOTIFICATION_EMAIL_REPLY_TO`, `SITE_URL`;
- domÃ­nio/remetente verificado no Resend;
- logs da Edge Function;
- `notification_dispatch_logs`.

### E-mail envia para destinatÃ¡rio errado

P0 operacional.

Verificar imediatamente:

- Edge Function exige usuÃ¡rio autenticado;
- usuÃ¡rio comum sÃ³ envia para si mesmo;
- usuÃ¡rio comum nÃ£o escolhe destinatÃ¡rio arbitrÃ¡rio;
- teste admin Ã© controlado;
- teste admin nÃ£o dispara massa de usuÃ¡rios;
- `userId` no body;
- logs em `notification_dispatch_logs`.

### Rotina diÃ¡ria retorna 401

Verificar:

- `DAILY_NOTIFICATIONS_SECRET`;
- header `x-daily-notifications-secret`;
- `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`;
- secret sem espaÃ§os/quebras de linha;
- function redeployada apÃ³s alteraÃ§Ã£o.

### Cron nÃ£o dispara

Verificar:

- `pg_cron`;
- job `run-daily-notifications-0800-brt`;
- horÃ¡rio UTC;
- 08:00 `America/Sao_Paulo` equivale a 11:00 UTC;
- URL da Edge Function;
- header com secret;
- segredo nÃ£o estÃ¡ em migration versionada;
- resposta recente em `net._http_response`.

### Push/WhatsApp tentam envio real

CorreÃ§Ã£o:

- retornar `not_configured` ou `skipped` atÃ© existir provider real.

---

## 18. Astrologia, Timeline, WhatsApp, parentesco, exportaÃ§Ã£o e favoritos

### Astrologia e acontecimentos do nascimento

Arquivos provÃ¡veis:

```txt
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/personInsightsService.ts
supabase/functions/generate-person-insights/index.ts
```

Verificar se o perfil apenas lÃª insights. GeraÃ§Ã£o automÃ¡tica no perfil Ã© P0 operacional; geraÃ§Ã£o/regeneraÃ§Ã£o deve ser aÃ§Ã£o admin.

Se cards vazios aparecerem no perfil pÃºblico:

- verificar `PersonDataView.tsx`;
- garantir que cards sem conteÃºdo, sem loading, sem erro e sem fallback vÃ¡lido retornem `null`;
- o texto **â€œConteÃºdo ainda nÃ£o gerado.â€** nÃ£o deve aparecer publicamente;
- no admin, exibir card apenas quando houver aÃ§Ã£o possÃ­vel, conteÃºdo existente, loading ou erro.

### Timeline

Arquivos provÃ¡veis:

```txt
src/app/pages/PersonProfile.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/services/personEventsService.ts
```

Verificar eventos vazios, duplicados, fora de ordem e metadata sensÃ­vel.

### WhatsApp

Arquivos provÃ¡veis:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
```

NÃºmero textual sÃ³ aparece se `permitir_exibir_telefone = true`. BotÃ£o depende de telefone vÃ¡lido e `permitir_mensagens_whatsapp`.

### Grau de parentesco

Arquivos provÃ¡veis:

```txt
src/app/utils/relationshipDegree.ts
src/app/utils/relationshipDegree.test.ts
src/app/utils/relationshipDegreeDisplay.ts
```

Se pai/filho estiver invertido, corrigir algoritmo com teste unitÃ¡rio antes de mexer na UI.

### ExportaÃ§Ã£o de Ã¡rea da Ã¡rvore

Arquivos provÃ¡veis:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Verificar overlay, crop, CORS, impressÃ£o e ignore elements.

### Favoritos

Arquivos provÃ¡veis:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
```

Verificar RLS, usuÃ¡rio autenticado, campos novos, colunas legadas relaxadas, link interno e metadata sensÃ­vel.

---

## 19. Responsividade

Arquivos prioritÃ¡rios:

```txt
src/app/pages/Home.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/forum
src/app/pages/admin
src/app/components/FamilyTree
src/app/components/ArquivosHistoricos.tsx
```

### Overflow horizontal

Verificar:

- containers com largura fixa;
- tabelas;
- botÃµes em linha;
- cards com `min-width`;
- ReactFlow;
- modais;
- imagens sem `max-width`.

### Modal nÃ£o cabe na tela

CorreÃ§Ã£o:

- altura mÃ¡xima;
- scroll interno;
- padding responsivo;
- footer sticky se necessÃ¡rio.

### Ãrvore ruim em touch

Verificar:

- pan/zoom;
- botÃµes pequenos;
- sobreposiÃ§Ã£o de controles;
- menu de pessoa;
- legenda;
- seleÃ§Ã£o de Ã¡rea.

### Admin inutilizÃ¡vel em mobile

Priorizar:

- formulÃ¡rio de pessoa;
- listas/tabelas com scroll;
- filtros;
- aÃ§Ãµes primÃ¡rias visÃ­veis.

---

## 20. Migrations e Supabase

Arquivos provÃ¡veis:

```txt
supabase/migrations
supabase/config.toml
supabase/functions
```

### Funciona local, mas nÃ£o remoto

Verificar:

```bash
supabase migration list
```

Se hÃ¡ migration local pendente e aprovada:

```bash
supabase db push
```

Se o schema remoto jÃ¡ tem os efeitos:

- confirmar com SQL/dump;
- sÃ³ entÃ£o considerar `supabase migration repair --status applied`.

### RLS inesperada

Consultar:

```sql
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

E:

```sql
select
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
order by c.relname;
```

### Coluna legada `pessoas.arquivos_historicos`

Antes de qualquer remoÃ§Ã£o:

```sql
select count(*) as pessoas_com_json_legado
from public.pessoas
where arquivos_historicos is not null
  and arquivos_historicos::text not in ('[]', 'null');
```

NÃ£o remover sem dump, auditoria e QA visual.

---

## 21. Sintomas rÃ¡pidos

### UsuÃ¡rio comum fez algo indevido

Verificar:

```txt
ProtectedRoute
permissionService
RLS
service chamado pela UI
RPC security definer
policies antigas
```

### Algo salva, mas nÃ£o aparece

Verificar:

```txt
service de leitura
cache/refetch
colunas selecionadas
types/index.ts
RLS SELECT
```

### Algo aparece para usuÃ¡rio comum, mas deveria ser admin-only

Verificar:

```txt
isAdmin
renderizaÃ§Ã£o condicional
readOnly
ProtectedRoute
RLS
```

### Dados digitados somem

Verificar:

```txt
sessionStorage draft
useUnsavedChanges
botÃµes sem type="button"
preview de arquivos
useEffect sobrescrevendo estado
```

### NotificaÃ§Ã£o nÃ£o chega

Verificar:

```txt
notificationTriggersService
notificationRecipientsService
notificationDispatchService
notificacoes_usuario
notification_dispatch_logs
preferencias_notificacao
RLS/RPC
```

### Secret apareceu no frontend

P0.

CorreÃ§Ã£o imediata:

- remover do frontend;
- rotacionar secret se foi exposto;
- mover para Edge Function ou Supabase secrets;
- revisar histÃ³rico do Git se houve commit.

---

## 22. CalendÃ¡rio Familiar

Detalhes especÃ­ficos:

```txt
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Arquivo provÃ¡vel:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

### CalendÃ¡rio volta a mostrar `item(ns)` ou contadores brutos

Verificar:

- helper `formatEventCount`;
- textos do calendÃ¡rio e da sidebar;
- singular/plural esperado: **1 evento**, **2 eventos**.

### Categorias nÃ£o filtram

Verificar:

- `activeCategories`;
- `toggleCategory`;
- `getCalendarCategory`;
- botÃµes da sidebar com tÃ­tulo **Categorias**;
- `aria-pressed` e estado visual ativo/inativo.

### AniversÃ¡rio nÃ£o mostra idade como `Faz X anos`

Verificar:

- `formatCalendarEventDescription`;
- cards do calendÃ¡rio usando primeiro nome;
- lista inferior usando nome completo.

---

## 23. Troubleshooting recente â€” legenda funcional, camadas visuais e painel lateral

### Destaques visuais aparecem mesmo com filtro oculto

Arquivos provÃ¡veis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
```

Verificar:

- `edgeFilters` estÃ¡ sendo passado aos layouts;
- `parentChildHighlight` estÃ¡ condicionado a `filiacao_sangue || filiacao_adotiva`;
- `siblingHighlight` estÃ¡ condicionado a `edgeFilters.irmaos`;
- pessoas/grupos ocultos nÃ£o recebem edges opcionais.

### BotÃ£o â€œDestacar pais/filhosâ€ nÃ£o tem efeito

Verificar:

- `visualLineFilters.parentChildHighlight`;
- callback `onToggleVisualLineFilter`;
- repasse de `visualLineFilters` de `Home.tsx` para `FamilyTree.tsx`;
- repasse para `directFamilyDistributedLayout` e `genealogyColumnsLayout`;
- `GenealogyFamilyConnectorNode` recebendo `parentChildHighlight`.

### BotÃ£o â€œDestacar irmÃ£osâ€ nÃ£o tem efeito

Verificar:

- `visualLineFilters.siblingHighlight`;
- `edgeFilters.irmaos`;
- relaÃ§Ãµes explÃ­citas `irmao`;
- handles usados nas edges de irmÃ£os;
- restriÃ§Ãµes contra linhas longas em Genealogia/VisÃ£o Completa.

### InformaÃ§Ãµes voltou para dentro da toggle

Arquivo provÃ¡vel:

```txt
src/app/pages/Home.tsx
```

Esperado:

- `SidebarPanelTabs` mostra apenas **Filtros** e **Legendas**;
- **InformaÃ§Ãµes** abre por botÃ£o externo;
- botÃ£o usa `Printer` e texto **AÃ§Ãµes** no desktop;
- `activeSidebarPanel = 'info'` continua renderizando `SidebarInfoPanel`.

### Zoom voltou para a esquerda

Arquivo provÃ¡vel:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Esperado:

- botÃµes `+` e `-` no canto superior direito;
- wrapper visual com `right-4 top-4`;
- nÃ£o alterar minZoom, maxZoom, viewport, bounds ou normalizaÃ§Ã£o.
