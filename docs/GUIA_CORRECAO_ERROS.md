# Guia de correção de erros — Árvore Família

## Objetivo

Este documento é um guia de investigação e correção por sintoma. Use quando:

- uma funcionalidade falhar;
- houver regressão;
- o build quebrar;
- uma tela não carregar;
- uma permissão/RLS se comportar de forma inesperada;
- uma Edge Function, migration, Storage ou rotina de notificação apresentar erro.

Este guia não descreve roadmap nem lista implementações concluídas em detalhe. Para isso, use:

- `docs/GUIA_IMPLEMENTACOES.md`: o que já foi implementado.
- `docs/PLANO_PROXIMOS_PASSOS.md`: validações finais, lançamento e backlog pós-MVP.
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`: troubleshooting específico do calendário familiar.
- `docs/funcionalidades/NOTIFICACOES.md`: detalhes de arquitetura e operação de notificações.
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: troubleshooting específico de pessoas, perfil e admin.
- `docs/funcionalidades/TIMELINE.md`: detalhes da timeline.

---

## 1. Checklist inicial de investigação

Antes de alterar código:

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
- não rodar `supabase db push` sem revisar `supabase migration list`;
- não usar `migration repair` para mascarar migration não aplicada;
- não commitar dumps, tokens, service role ou secrets;
- não commitar `backups/`, arquivos `.bak`, patches temporários ou saídas de build;
- não apagar dados legados/base64 sem auditoria;
- não ampliar RLS para resolver bug de leitura sem entender a regra de negócio.

---

## 2. Build quebrado

Arquivos prováveis:

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
- dependência não instalada;
- action/log novo não incluído nos tipos;
- conflito de nome entre tipos, componentes e services;
- arquivo com erro de sintaxe após merge;
- JSX inválido após script de substituição.

Correção:

1. rodar `npm run build`;
2. ler o primeiro erro do terminal;
3. corrigir o arquivo apontado;
4. repetir `npm run build`;
5. rodar `git diff --check`;
6. confirmar que a correção não alterou escopo funcional indevidamente.

### Erro: `Link is not defined`

Sintoma:

```txt
ReferenceError: Link is not defined
```

Exemplo já ocorrido:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Causa provável:

- import de `AppLink as Link` removido durante padronização de header;
- a página ainda usa `<Link>` em trechos internos.

Correção:

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

Arquivo provável:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Causa provável:

- script alterou a declaração `export const FamilyTree = React.forwardRef...`;
- falta `=`;
- parênteses/chaves foram quebrados.

Correção segura:

- preferir função nomeada + export com `React.forwardRef` ao final:

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

Correção:

```tsx
style={{ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }}
```

### Erro: arquivo gerado por script não corresponde ao formato esperado

Sintoma:

```txt
O arquivo ... não está exatamente no formato esperado. Não apliquei alterações para evitar quebra.
```

Causa:

- arquivo já foi alterado por commit posterior;
- script baseado em substituição literal ficou obsoleto.

Correção:

- conferir `git diff`;
- buscar trechos por nomes de funções, não por blocos inteiros;
- preferir patch manual localizado;
- se houver risco, recuperar backup e aplicar ajuste menor.

---

## 3. Git, backups locais e limpeza

### `index.lock`

Sintoma:

```txt
fatal: Unable to create '.git/index.lock': File exists.
```

Correção:

1. confirmar que não há `git commit`, editor ou processo Git aberto;
2. se não houver processo ativo, remover o lock:

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

- não commitar backups gerados por scripts;
- remover depois que build/test passaram e o commit correto foi enviado.

Correção:

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

### Commit já enviado, mas há alterações locais

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

## 4. Rotas, acesso e permissões

Arquivos prováveis:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
src/app/contexts/AuthContext.tsx
```

### Usuário comum acessa admin

Verificar:

- rota usa `ProtectedRoute`;
- `isAdminUser(user)` retorna corretamente;
- `profiles.role = 'admin'`;
- RPC/admin role está funcionando;
- fallback de erro bloqueia acesso;
- RLS da tabela sensível não libera leitura/escrita indevida;
- menu não renderiza botão admin para usuário comum.

Correção:

- proteger rota;
- corrigir renderização condicional;
- corrigir service chamado pela UI;
- corrigir policy RLS, se necessário;
- nunca esconder só no frontend mantendo escrita liberada no banco.

### Admin não vê Painel Administrativo

Verificar:

- sessão Supabase ativa;
- `profiles.role`;
- RPC `is_admin_user`;
- estado `isAdmin` em `Home.tsx`;
- fallback de loading/erro;
- cache de sessão antigo.

### Usuário autenticado não acessa página de membro

Verificar:

- `MemberRoute`;
- `AuthContext`;
- status de loading da sessão;
- vínculo de perfil, se a rota exigir;
- erro de RLS em consultas iniciais.

---

## 5. Headers, margens e navegação interna

Arquivos prováveis:

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

### Header interno diferente entre páginas

Verificar:

- página usa `MemberPageHeader`;
- container usa `PAGE_CONTAINER_CLASS`;
- Home pós-login deve continuar com header próprio;
- `/minha-arvore`, `/calendario-familiar`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/admin` devem compartilhar o padrão interno.

### Margens laterais divergentes

Verificar:

- `max-w-7xl`;
- `px-4 sm:px-6 lg:px-8`;
- `PAGE_CONTAINER_CLASS`;
- wrappers duplicados em header/main.

### Botão duplicado de recolher/expandir painel

Arquivos prováveis:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

Verificar:

- botão interno do painel;
- botão passado por props para `FamilyTree`;
- `showSidebarToggle`;
- `onToggleSidebar`;
- mobile versus desktop;
- estado `sidebarOpen` e `legendOpen`.

Regra esperada:

- apenas um botão de expandir/recolher visível;
- em desktop, dentro ou junto ao painel;
- em mobile, junto ao painel móvel;
- não pode existir botão duplicado na área da árvore.

---

## 6. Formulários de pessoa

Arquivos prováveis:

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

### Pessoa não salva

Verificar:

- `cleanPersonPayload`;
- `PESSOA_COLUMNS`;
- tipo `Pessoa`;
- migration do campo;
- validação de campos obrigatórios;
- `adicionarPessoa`;
- `atualizarPessoa`;
- erro de RLS;
- erro no console do Supabase.

Correção:

- incluir campo no tipo e no payload somente se existir no banco;
- manter limpeza de campos desconhecidos;
- corrigir policy sem liberar escrita indevida;
- validar que o formulário não envia `undefined` onde o banco exige `null`.

### Campo novo não persiste

Confirmar se o campo está em:

- tipo TypeScript;
- estado do formulário;
- componente de input;
- payload limpo;
- lista de colunas do service;
- migration;
- banco remoto;
- SELECT usado na leitura após salvar.

### Autocomplete de endereço não aparece

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY` existe no ambiente do frontend;
- `AddressAutocompleteInput` está sendo usado no campo de endereço;
- `PersonContactFields` está presente no admin;
- console do navegador para falha de carregamento do Google Places.

Correção:

- configurar `VITE_GOOGLE_MAPS_API_KEY` quando autocomplete for necessário;
- confirmar `src/app/utils/googleAddress.ts` para formatação do endereço;
- manter fallback silencioso para input normal quando a chave não existir ou o Google falhar;
- não bloquear salvamento do formulário por falha externa do Google.

Campos frequentes:

- `falecido`;
- `local_nascimento_exterior`;
- `local_falecimento_exterior`;
- `permitir_mensagens_whatsapp`;
- redes sociais;
- datas conjugais;
- observações internas.

### Formulário perde dados

Verificar:

- rascunho em `sessionStorage`;
- `useUnsavedChanges`;
- `useEffect` assíncrono sobrescrevendo estado após edição local;
- preview/download chamando `onChange`;
- botões internos sem `type="button"`;
- modal fechando e limpando estado pai;
- objeto inicial recalculado sem memoização adequada.

### Modal de relacionamento salva antes da hora

Verificar:

- `ConfirmDialog` não deve ser usado para adicionar relacionamento no fluxo de formulário;
- relacionamento pendente só deve salvar no botão principal;
- cancelamentos usam `type="button"`;
- dados conjugais pendentes ficam no rascunho;
- `onSubmit` do formulário não é disparado por botão interno.

---

## 7. Busca com acentos

Arquivos prováveis:

```txt
src/app/utils/searchText.ts
src/app/services/dataService.ts
src/app/pages/admin/AdminPessoas.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
```

Sintomas:

- `Marcio` não encontra `Márcio`;
- `Sao Paulo` não encontra `São Paulo`;
- busca funciona em uma tela e falha em outra.

Verificar:

- uso de `normalizeSearchText`;
- uso de `includesNormalizedText`;
- `toLowerCase().includes(...)` sem normalização;
- busca feita no frontend versus busca feita no banco;
- campos nulos.

Correção:

- padronizar com os helpers;
- tratar `null`/`undefined`;
- testar em admin, árvore, relacionamentos e vinculação.

---

## 8. Pessoa falecida e locais no exterior

Arquivos prováveis:

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
- SELECT após salvar;
- componentes da árvore usando helper correto.

### Local exterior rejeitado

Verificar:

- flags `local_nascimento_exterior` e `local_falecimento_exterior`;
- `validateLocationByMode`;
- modo Brasil/exterior;
- placeholder;
- formato esperado `Cidade (País)`;
- campo limpo indevidamente antes de salvar.

---

## 9. Arquivos históricos e Storage

Arquivos prováveis:

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

Correção:

- novos arquivos devem ir para Storage;
- fallback base64 só deve servir legado/compatibilidade;
- não apagar base64 antigo automaticamente.

### Preview limpa formulário

Verificar:

- abrir/fechar preview não chama `onChange`;
- botões de visualizar/baixar/abrir usam `type="button"`;
- estado de `novoArquivo` não é limpo sem ação explícita;
- preview não dispara submit do formulário.

### Download falha

Verificar:

- URL pública/acessível;
- compatibilidade com `data:`;
- fallback de abrir em nova aba;
- nome de arquivo sanitizado;
- CORS;
- tipo MIME.

### Erro ao salvar `categoria_evento`

Sintomas prováveis:

- erro PostgREST/Supabase indicando que a coluna `categoria_evento` não existe;
- insert/update em `public.arquivos_historicos` falha;
- listagem pode funcionar, mas salvar arquivo novo ou editar arquivo existente falha.

Causa provável:

- ambiente remoto ainda não recebeu `20260522121000_add_historical_file_event_category.sql`;
- schema cache do Supabase ainda não refletiu a coluna após migration recente.

Correção:

1. confirmar `supabase migration list`;
2. aplicar a migration pendente aprovada com `supabase db push`;
3. confirmar que `public.arquivos_historicos.categoria_evento` existe;
4. se a coluna já existir e o erro persistir, aguardar/recarregar schema cache do Supabase antes de alterar código.

Regra operacional:

- `20260522121000_add_historical_file_event_category.sql` é pré-requisito de deploy para versões que enviam `categoria_evento` no payload;
- não remover `categoria_evento` do payload para contornar ambiente sem migration.

### Upload abandonado deixa órfão

Verificar:

- upload antes do salvamento final;
- existência de registro correspondente em `arquivos_historicos`;
- scripts dry-run antes de qualquer limpeza.

Correção:

- não deletar automaticamente sem auditoria;
- registrar procedimento de limpeza em frente técnica separada.

### Arquivo de relacionamento salva como arquivo de pessoa

Esperado:

- `relacionamento_id` preenchido;
- `pessoa_id` nulo.

Verificar:

- `ViewMarriageModal`;
- `MarriageDetailsEditor`;
- `adicionarArquivoHistoricoAoRelacionamento`;
- RLS/admin;
- payload de criação.

---

## 10. Relacionamentos, solicitações e dados conjugais

Arquivos prováveis:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
```

### Usuário comum altera relacionamento real

Verificar:

- UI está chamando `createRelationshipChangeRequest`;
- UI não chama `adicionarRelacionamentoComInverso`;
- RLS de `public.relacionamentos`;
- policy antiga permissiva;
- rota admin exposta indevidamente.

Correção:

- usuário comum deve gerar solicitação;
- alteração real deve ser feita apenas por admin/aprovação.

### Solicitação não aparece no admin

Verificar:

- tabela `relationship_change_requests`;
- status `pending`;
- RLS SELECT admin;
- `listAllRelationshipChangeRequests`;
- filtro de status na tela.

### Aprovação não altera relacionamento

Verificar:

- `approveRelationshipChangeRequest`;
- chamada ao `dataService`;
- payload de tipo/subtipo;
- dados conjugais;
- logs `relationship_change_approved`.

### Rejeição altera dado real

P0 funcional.

Correção:

- rejeitar só deve atualizar status da solicitação;
- não chamar função que altera relacionamento real.

### Status conjugal não aparece na árvore

Verificar:

- `RELACIONAMENTO_COLUMNS`;
- `obterTodosRelacionamentos`;
- `getGenealogyMarriageStatus`;
- `ativo`;
- `data_separacao`;
- `subtipo_relacionamento`;
- `falecido`.

---

## 11. Árvore, Genealogia, Visão Completa e anel 💍

Arquivos prováveis:

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

### Minha Árvore carrega muito pequena

Verificar:

- função de bounds do viewport;
- se `getViewportContentBounds` usa apenas cards reais;
- se labels, group boxes, legend nodes e anchors estão excluídos do cálculo de zoom;
- `personNode` como base do zoom inicial;
- diferença entre bounds de viewport e bounds de pan;
- `maxZoom` e `minZoom`;
- recenter automático após zoom.

Correção esperada:

- zoom inicial deve usar bounds de cards reais;
- elementos auxiliares não devem reduzir a escala;
- `+` e `-` devem funcionar até o zoom máximo.

### Genealogia ou Visão Completa reduzem demais por altura

Regra esperada:

- Genealogia e Visão Completa usam zoom por largura;
- altura total não deve reduzir o zoom;
- usuário arrasta/desliza para baixo se houver muitos cards verticais;
- posição vertical inicial deve ser padronizada com Minha Árvore.

Verificar:

- `getNormalizedTreeViewport`;
- diferenciação de regra por `viewMode`;
- cálculo com `zoomX` versus `Math.min(zoomX, zoomY)`;
- `translateExtent` para permitir pan vertical.

### Título/subtítulo duplicado nas views genealógicas

Sintoma:

- overlay fixo em `FamilyTree.tsx` aparece;
- outro título/subtítulo aparece junto aos cards.

Arquivos prováveis:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Correção:

- manter apenas overlay fixo em `FamilyTree.tsx`;
- remover title/subtitle nodes dos layouts;
- `DirectFamilyLabelNode` só deve permanecer se usado para labels de grupo, não título principal.

### Linha diagonal entre pais e filhos

Verificar:

- regra de filho único;
- edge ortogonal;
- `GenealogyFamilyConnectorNode`;
- layout por gerações.

### Conectores/anéis soltos após filtro

Verificar:

- filtro de pessoas visíveis;
- criação de edges apenas quando origem/destino visíveis;
- `filterPersonalTreeScope`;
- dados de relacionamento sem pessoa correspondente.

### Genealogia mostra base completa

Verificar:

- view mode;
- escopo pessoal;
- pessoa central;
- `filterGraphToPersonalScope`.

### Visão Completa mostra poucas pessoas

Verificar:

- se usa base completa;
- filtros ativos;
- cache de dados;
- RLS;
- modo de visualização selecionado.

### Anel não abre modal

Verificar:

- `GenealogySpouseEdge`;
- `onMarriageClick`;
- `edge.data.marriageDetails`;
- `event.stopPropagation()`;
- modal em `Home.tsx` ou `FamilyTree`.

### Modal mostra observação para usuário comum

Correção:

- renderizar observações internas apenas quando `isAdmin = true`.

---

## 12. Painel de legendas

Arquivos prováveis:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

### Legenda não aparece

Verificar:

- aba **Legendas** no painel lateral;
- import de `TreeLegend`;
- `activeSidebarPanel === 'legend'`;
- painel recolhido;
- z-index;
- mobile/desktop.

### Legenda aparece duplicada

Verificar:

- botão flutuante de legenda em `FamilyTree.tsx`;
- painel lateral em `Home.tsx`;
- remover popover/botão flutuante se a regra for legenda apenas no painel lateral.

### Conteúdo antigo volta a aparecer

Itens que não devem voltar no painel lateral compacto:

- subtítulo “Cores, linhas, anéis e modos da árvore.”;
- label “Visualização atual”;
- card azul com view atual;
- subtítulos dentro dos cards das seções Cards, Linhas e Anel de casamento;
- área “Views” no final;
- texto “Ativa” no anel; usar **Em relacionamento**.

### Legenda atrapalha pan/zoom

Verificar:

- `onMouseDown={(event) => event.stopPropagation()}`;
- `onClick={(event) => event.stopPropagation()}`;
- `data-tree-legend="true"`;
- propagação para ReactFlow.

### Legenda aparece em exportação

Verificar:

- `getDefaultTreeExportIgnoreElements`;
- seletor `[data-tree-legend="true"]`.

### Legenda contradiz árvore

Comparar com:

- `GenealogySpouseEdge.tsx`;
- `GenealogyFamilyConnectorNode.tsx`;
- `directFamilyColors.ts`;
- `visualTokens.ts`;
- modos `minha-arvore`, `genealogia`, `visao-completa`.

---

## 13. Histórico de atividades

Arquivos prováveis:

```txt
src/app/services/activityLogService.ts
src/app/pages/admin/AdminAtividades.tsx
src/app/types/index.ts
```

### Log não é criado

Verificar:

- chamada de `createActivityLog`;
- `actor_user_id`;
- RLS de INSERT;
- erro engolido em `catch`;
- action permitida no tipo.

### Log falha para usuário comum

Verificar:

- `createActivityLog` não deve depender de `.select().single()` após insert;
- policy permite INSERT próprio;
- metadata está sanitizada.

### Admin não vê logs

Verificar:

- policy SELECT admin;
- RPC `is_admin_user`;
- rota protegida;
- `listActivityLogs`.

### Metadata sensível

Remover imediatamente:

- URL completa;
- base64;
- telefone;
- endereço;
- e-mail;
- token;
- secret;
- service role;
- prompt completo;
- conteúdo gerado por IA.

---

## 14. Admin Integridade

Arquivos prováveis:

```txt
src/app/pages/admin/AdminIntegridade.tsx
src/app/routes.tsx
src/app/services/dataService.ts
src/app/services/activityLogService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/lib/supabaseClient.ts
```

### Tela não abre

Verificar:

- rota;
- import/export;
- `ProtectedRoute`;
- erro de service;
- erro de RLS;
- dados nulos não tratados.

### Usuário comum acessa

P0 de permissão.

Corrigir:

- proteção de rota;
- fallback de permissão;
- policy RLS;
- renderização condicional do menu.

### Diagnóstico acusa erro demais

Separar:

- erro crítico;
- alerta;
- legado compatível;
- pendência de validação;
- item informativo.

### Tela altera dados

P0.

Correção:

- `/admin/integridade` deve ser somente leitura;
- qualquer correção automática deve virar frente própria;
- ações assistidas ficam pós-MVP.

---

## 14.1 Vínculo admin usuário-pessoa

Detalhes específicos de pessoas/perfil/admin:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

Arquivos prováveis:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/memberProfileService.ts
supabase/migrations/20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
```

### Erro: `Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache`

Causas prováveis:

- migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` não aplicada no Supabase remoto;
- schema cache remoto ainda não atualizou;
- função ausente ou com assinatura diferente.

Correção:

- aplicar a migration aprovada;
- conferir no Supabase se `public.admin_list_profiles_for_linking()` existe sem parâmetros;
- aguardar/recarregar schema cache se a função acabou de ser criada;
- não substituir por consulta direta insegura em `profiles`.

### Usuários não aparecem no dropdown de vínculo admin

Verificar:

- resultado de `adminListProfilesForLinking`;
- erro inline no card **Adicionar vínculo manual**;
- botão **Recarregar**;
- migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` aplicada;
- usuário logado é admin.

Comportamento esperado:

- dropdown fica desabilitado durante loading;
- dropdown fica desabilitado quando há erro de listagem;
- **Recarregar** tenta buscar novamente sem depender de toast repetitivo.

---

## 15. Notificações

Arquivos prováveis:

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

### Notificações não aparecem

Verificar:

- `listarNotificacoesSupabase`;
- RLS de `notificacoes_usuario`;
- `user_id` correto;
- usuário autenticado;
- central em `/notificacoes`;
- fallback local apenas como compatibilidade.

### Marcar/remover notificação não funciona

Verificar:

- função filtra por `id` e `user_id`;
- chamadas passam `user.id`;
- RLS UPDATE/DELETE do próprio usuário;
- rollback visual após erro;
- console do navegador.

### Preferências não salvam

Verificar:

- `salvarPreferenciasNotificacao`;
- tabela `preferencias_notificacao`;
- RLS de upsert por `user_id`;
- log `notification_preferences.updated`;
- defaults não sobrescrevem `false`.

### Preferências não aparecem em `/notificacoes`

Causa provável:

- as preferências foram separadas da central de notificações.

Correção:

- abrir `/ajustar-notificacoes`;
- verificar `src/app/pages/AjustarNotificacoes.tsx`;
- verificar `src/app/components/notifications/NotificationPreferencesPanel.tsx`;
- manter `/notificacoes` dedicada à lista/central em cards.

### Gatilho não notifica

Verificar:

- `notificationTriggersService`;
- destinatários em `notificationRecipientsService`;
- exclusão do ator;
- dispatch log;
- preferências do destinatário;
- canal interno versus e-mail.

### Notificação duplica

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- constraint única;
- deduplicação de destinatários;
- execução manual repetida;
- Edge Function diária e rotina manual usando o mesmo padrão de chave.

### E-mail real não envia

Verificar:

- deploy de `send-notification-email`;
- secrets: `RESEND_API_KEY`, `NOTIFICATION_EMAIL_FROM`, `NOTIFICATION_EMAIL_REPLY_TO`, `SITE_URL`;
- domínio/remetente verificado no Resend;
- logs da Edge Function;
- `notification_dispatch_logs`.

### E-mail envia para destinatário errado

P0 operacional.

Verificar imediatamente:

- Edge Function exige usuário autenticado;
- usuário comum só envia para si mesmo;
- usuário comum não escolhe destinatário arbitrário;
- teste admin é controlado;
- teste admin não dispara massa de usuários;
- `userId` no body;
- logs em `notification_dispatch_logs`.

### Rotina diária retorna 401

Verificar:

- `DAILY_NOTIFICATIONS_SECRET`;
- header `x-daily-notifications-secret`;
- `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`;
- secret sem espaços/quebras de linha;
- function redeployada após alteração.

### Cron não dispara

Verificar:

- `pg_cron`;
- job `run-daily-notifications-0800-brt`;
- horário UTC;
- 08:00 `America/Sao_Paulo` equivale a 11:00 UTC;
- URL da Edge Function;
- header com secret;
- segredo não está em migration versionada;
- resposta recente em `net._http_response`.

### Push/WhatsApp tentam envio real

Correção:

- retornar `not_configured` ou `skipped` até existir provider real.

---

## 16. Astrologia, Timeline, WhatsApp, parentesco, exportação e favoritos

### Astrologia e acontecimentos do nascimento

Arquivos prováveis:

```txt
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/personInsightsService.ts
supabase/functions/generate-person-insights/index.ts
```

Verificar se o perfil apenas lê insights. Geração automática no perfil é P0 operacional; geração/regeneração deve ser ação admin.

Se cards vazios aparecerem no perfil público:

- verificar `PersonDataView.tsx`;
- garantir que cards sem conteúdo, sem loading, sem erro e sem fallback válido retornem `null`;
- o texto **“Conteúdo ainda não gerado.”** não deve aparecer publicamente;
- no admin, exibir card apenas quando houver ação possível, conteúdo existente, loading ou erro.

### Timeline

Arquivos prováveis:

```txt
src/app/pages/PersonProfile.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/services/personEventsService.ts
```

Verificar eventos vazios, duplicados, fora de ordem e metadata sensível.

### WhatsApp

Arquivos prováveis:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
```

Número textual só aparece se `permitir_exibir_telefone = true`. Botão depende de telefone válido e `permitir_mensagens_whatsapp`.

### Grau de parentesco

Arquivos prováveis:

```txt
src/app/utils/relationshipDegree.ts
src/app/utils/relationshipDegree.test.ts
src/app/utils/relationshipDegreeDisplay.ts
```

Se pai/filho estiver invertido, corrigir algoritmo com teste unitário antes de mexer na UI.

### Exportação de área da árvore

Arquivos prováveis:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Verificar overlay, crop, CORS, impressão e ignore elements.

### Favoritos

Arquivos prováveis:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
```

Verificar RLS, usuário autenticado, campos novos, colunas legadas relaxadas, link interno e metadata sensível.

---

## 17. Responsividade

Arquivos prioritários:

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
- botões em linha;
- cards com `min-width`;
- ReactFlow;
- modais;
- imagens sem `max-width`.

### Modal não cabe na tela

Correção:

- altura máxima;
- scroll interno;
- padding responsivo;
- footer sticky se necessário.

### Árvore ruim em touch

Verificar:

- pan/zoom;
- botões pequenos;
- sobreposição de controles;
- menu de pessoa;
- legenda;
- seleção de área.

### Admin inutilizável em mobile

Priorizar:

- formulário de pessoa;
- listas/tabelas com scroll;
- filtros;
- ações primárias visíveis.

---

## 18. Migrations e Supabase

Arquivos prováveis:

```txt
supabase/migrations
supabase/config.toml
supabase/functions
```

### Funciona local, mas não remoto

Verificar:

```bash
supabase migration list
```

Se há migration local pendente e aprovada:

```bash
supabase db push
```

Se o schema remoto já tem os efeitos:

- confirmar com SQL/dump;
- só então considerar `supabase migration repair --status applied`.

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

Antes de qualquer remoção:

```sql
select count(*) as pessoas_com_json_legado
from public.pessoas
where arquivos_historicos is not null
  and arquivos_historicos::text not in ('[]', 'null');
```

Não remover sem dump, auditoria e QA visual.

---

## 19. Sintomas rápidos

### Usuário comum fez algo indevido

Verificar:

```txt
ProtectedRoute
permissionService
RLS
service chamado pela UI
RPC security definer
policies antigas
```

### Algo salva, mas não aparece

Verificar:

```txt
service de leitura
cache/refetch
colunas selecionadas
types/index.ts
RLS SELECT
```

### Algo aparece para usuário comum, mas deveria ser admin-only

Verificar:

```txt
isAdmin
renderização condicional
readOnly
ProtectedRoute
RLS
```

### Dados digitados somem

Verificar:

```txt
sessionStorage draft
useUnsavedChanges
botões sem type="button"
preview de arquivos
useEffect sobrescrevendo estado
```

### Notificação não chega

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

Correção imediata:

- remover do frontend;
- rotacionar secret se foi exposto;
- mover para Edge Function ou Supabase secrets;
- revisar histórico do Git se houve commit.

---

## 19.1 Calendário Familiar

Detalhes específicos:

```txt
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Arquivo provável:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

### Calendário volta a mostrar `item(ns)` ou contadores brutos

Verificar:

- helper `formatEventCount`;
- textos do calendário e da sidebar;
- singular/plural esperado: **1 evento**, **2 eventos**.

### Categorias não filtram

Verificar:

- `activeCategories`;
- `toggleCategory`;
- `getCalendarCategory`;
- botões da sidebar com título **Categorias**;
- `aria-pressed` e estado visual ativo/inativo.

### Aniversário não mostra idade como `Faz X anos`

Verificar:

- `formatCalendarEventDescription`;
- cards do calendário usando primeiro nome;
- lista inferior usando nome completo.

---

## 20. Troubleshooting recente — legenda funcional, camadas visuais e painel lateral

### Destaques visuais aparecem mesmo com filtro oculto

Arquivos prováveis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
```

Verificar:

- `edgeFilters` está sendo passado aos layouts;
- `parentChildHighlight` está condicionado a `filiacao_sangue || filiacao_adotiva`;
- `siblingHighlight` está condicionado a `edgeFilters.irmaos`;
- pessoas/grupos ocultos não recebem edges opcionais.

### Botão “Destacar pais/filhos” não tem efeito

Verificar:

- `visualLineFilters.parentChildHighlight`;
- callback `onToggleVisualLineFilter`;
- repasse de `visualLineFilters` de `Home.tsx` para `FamilyTree.tsx`;
- repasse para `directFamilyDistributedLayout` e `genealogyColumnsLayout`;
- `GenealogyFamilyConnectorNode` recebendo `parentChildHighlight`.

### Botão “Destacar irmãos” não tem efeito

Verificar:

- `visualLineFilters.siblingHighlight`;
- `edgeFilters.irmaos`;
- relações explícitas `irmao`;
- handles usados nas edges de irmãos;
- restrições contra linhas longas em Genealogia/Visão Completa.

### Informações voltou para dentro da toggle

Arquivo provável:

```txt
src/app/pages/Home.tsx
```

Esperado:

- `SidebarPanelTabs` mostra apenas **Filtros** e **Legendas**;
- **Informações** abre por botão externo;
- botão usa `Printer` e texto **Ações** no desktop;
- `activeSidebarPanel = 'info'` continua renderizando `SidebarInfoPanel`.

### Zoom voltou para a esquerda

Arquivo provável:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Esperado:

- botões `+` e `-` no canto superior direito;
- wrapper visual com `right-4 top-4`;
- não alterar minZoom, maxZoom, viewport, bounds ou normalização.
