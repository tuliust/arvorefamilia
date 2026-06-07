# Guia de correcao de erros - Arvore Familia

> Ultima revisao: 2026-06-07
> Ultima atualizacao: 2026-06-07
> Revisao complementar: sintomas pendentes de titulo/viewport, aliancas e menus de usuario
> Local canonico: `docs/GUIA_CORRECAO_ERROS.md`

## Objetivo

Este documento e um guia de investigacao e correcao por sintoma. Use quando:

- uma funcionalidade falhar;
- houver regressao;
- o build quebrar;
- uma tela nao carregar;
- uma permissao/RLS se comportar de forma inesperada;
- uma Edge Function, migration, Storage ou rotina de notificacao apresentar erro.

Este guia nao descreve roadmap nem lista implementacoes concluidas em detalhe. Para isso, use:

- `docs/GUIA_IMPLEMENTACOES.md`: o que ja foi implementado.
- `docs/PLANO_PROXIMOS_PASSOS.md`: validacoes finais, lancamento e backlog pos-MVP.
- `docs/arquitetura/ROTAS_E_GUARDS.md`: rotas, guards e regras de acesso.
- `docs/operacao/MIGRATIONS_SUPABASE.md`: procedimento operacional de migrations.
- `docs/funcionalidades/CALENDARIO_FAMILIAR.md`: troubleshooting especifico do calendario familiar.
- `docs/funcionalidades/EXPORTACAO_ARVORE.md`: regra funcional de exportacao da arvore.
- `docs/funcionalidades/NOTIFICACOES.md`: detalhes de arquitetura e operacao de notificacoes.
- `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md`: troubleshooting especifico de pessoas, perfil e admin.
- `docs/funcionalidades/TIMELINE.md`: detalhes da timeline.

---

## Como usar este guia

Use este documento por **sintoma observado**, nao por arquivo. O fluxo recomendado e:

1. identificar o sintoma;
2. localizar os arquivos provaveis;
3. reproduzir o erro;
4. corrigir a menor causa real;
5. validar com build/testes;
6. registrar nova regra apenas se ela for recorrente.

Evite usar este guia como backlog. Pendencias e melhorias devem ficar em `docs/PLANO_PROXIMOS_PASSOS.md`.

## 1. Checklist inicial de investigacao

Antes de alterar codigo:

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
- nao rodar `supabase db push` sem revisar `supabase migration list`;
- nao usar `migration repair` para mascarar migration nao aplicada;
- nao commitar dumps, tokens, service role ou secrets;
- nao commitar `backups/`, arquivos `.bak`, patches temporarios ou saidas de build;
- nao apagar dados legados/base64 sem auditoria;
- nao ampliar RLS para resolver bug de leitura sem entender a regra de negocio.

---

## 1.1 Sintomas visuais recentes que exigem atenção

Estes sintomas foram observados na frente de refinamento das views da árvore e devem ser investigados antes de serem tratados como concluídos:

| Sintoma | Status | Arquivos prováveis |
|---|---|---|
| Título da árvore colado no topo | Pendente | `FamilyTree.tsx`, `family-tree-visual-polish.css` |
| Espaço grande entre título e cards | Pendente | `FamilyTree.tsx` |
| Cards superiores cortados após ajuste visual | Regressão conhecida | CSS com `translate`/`transform` em ReactFlow |
| Alianças de `/minha-arvore` pouco visíveis ou ausentes | Pendente | `MarriageNode.tsx`, `types.ts`, `directFamilyDistributedLayout.ts` |
| Menu da árvore diferente do menu das páginas internas | Pendente de diagnóstico | `HomeHeader.tsx`, `UserProfileMenu.tsx`, `MemberPageHeader.tsx` |

Regra:

```txt
Não marcar esses itens como resolvidos apenas porque o build passou. Eles exigem validação visual em browser real.
```

---

## 2. Build quebrado

Arquivos provaveis:

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
- dependencia nao instalada;
- action/log novo nao incluido nos tipos;
- conflito de nome entre tipos, componentes e services;
- arquivo com erro de sintaxe apos merge;
- JSX invalido apos script de substituicao.

Correcao:

1. rodar `npm run build`;
2. ler o primeiro erro do terminal;
3. corrigir o arquivo apontado;
4. repetir `npm run build`;
5. rodar `git diff --check`;
6. confirmar que a correcao nao alterou escopo funcional indevidamente.

### Erro: `Link is not defined`

Sintoma:

```txt
ReferenceError: Link is not defined
```

Exemplo ja ocorrido:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Causa provavel:

- import de `AppLink as Link` removido durante padronizacao de header;
- a pagina ainda usa `<Link>` em trechos internos.

Correcao:

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

Arquivo provavel:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Causa provavel:

- script alterou a declaracao `export const FamilyTree = React.forwardRef...`;
- falta `=`;
- parenteses/chaves foram quebrados.

Correcao segura:

- preferir funcao nomeada + export com `React.forwardRef` ao final:

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

Correcao:

```tsx
style={{ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }}
```

### Erro: arquivo gerado por script nao corresponde ao formato esperado

Sintoma:

```txt
O arquivo ... nao esta exatamente no formato esperado. Nao apliquei alteracoes para evitar quebra.
```

Causa:

- arquivo ja foi alterado por commit posterior;
- script baseado em substituicao literal ficou obsoleto.

Correcao:

- conferir `git diff`;
- buscar trechos por nomes de funcoes, nao por blocos inteiros;
- preferir patch manual localizado;
- se houver risco, recuperar backup e aplicar ajuste menor.

### Erro: `treeColorPalette is not defined`

Sintoma em producao:

```txt
Unexpected Application Error!
treeColorPalette is not defined
ReferenceError: treeColorPalette is not defined
```

Arquivo provavel:

```txt
src/app/pages/home/HomeHeader.tsx
```

Causa provavel:

- JSX do dropdown usa `treeColorPalette` ou `setTreeColorPalette`;
- o estado React `const [treeColorPalette, setTreeColorPalette] = useState<TreeColorPalette>(...)` nao foi declarado;
- o efeito `applyTreePalette(treeColorPalette)` nao foi adicionado;
- uma substituicao/script aplicou apenas parte da implementacao.

Correcao segura quando producao estiver quebrada:

1. reverter o commit que adicionou o JSX quebrado;
2. validar `npm run build`;
3. enviar o revert para `main`;
4. reimplementar em branch separada;
5. abrir PR e validar Preview da Vercel antes de merge.

Exemplo de estabilizacao ja usada:

```bash
git pull --rebase origin main
git revert <commit-problematico> --no-edit
npm run build
git push origin main
```

Ao reimplementar, confirmar que `HomeHeader.tsx` contem:

```txt
TREE_COLOR_PALETTES
const [treeColorPalette, setTreeColorPalette]
applyTreePalette(treeColorPalette)
setTreeColorPalette(paletteKey)
aria-label="Paleta de cores da arvore"
```

Comando de verificacao:

```bash
Select-String -Path "src/app/pages/home/HomeHeader.tsx" -Pattern "const \[treeColorPalette|setTreeColorPalette|applyTreePalette\(treeColorPalette\)|TREE_COLOR_PALETTES|Paleta de cores"
```

Cuidados:

- nao repetir script falho sem limpar scripts temporarios;
- nao commitar `scripts/*.mjs` auxiliares usados apenas para patch;
- nao fazer merge direto em `main` sem Preview da Vercel;
- `npm run build` pode passar em alguns cenarios de runtime se a referencia for introduzida em caminho nao tipado; por isso, fazer busca textual obrigatoria.

---

## 3. Git, backups locais e limpeza

### `index.lock`

Sintoma:

```txt
fatal: Unable to create '.git/index.lock': File exists.
```

Correcao:

1. confirmar que nao ha `git commit`, editor ou processo Git aberto;
2. se nao houver processo ativo, remover o lock:

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
  apply-*.py
```

Regra:

- nao commitar backups gerados por scripts;
- remover depois que build/test passaram e o commit correto foi enviado.

Correcao:

```bash
rm -rf backups/
rm -f *.bak *.patch
rm -f apply-*.py
git status
```

Se os backups estiverem em subpastas:

```bash
find src -name "*.bak" -type f -delete
rm -rf backups/
git status
```

Se arquivos `*.bak-views-normalization` aparecerem rastreados em `src/app/components/FamilyTree`, confirmar que nao sao importados e remover com `git rm`. Backups rastreados ja removidos:

```txt
src/app/components/FamilyTree/PersonNode.tsx.bak-views-normalization
src/app/components/FamilyTree/types.ts.bak-views-normalization
```

---

## 4. Rotas das views da arvore

Arquivos provaveis:

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
- troca de view usa `navigate`, nao `window.location`;
- antes de navegar, comparar `location.pathname` com o path alvo;
- search params como `?pessoa=...` devem ser preservados.

Se uma view abrir publica por engano:

1. revisar `src/app/routes.tsx`;
2. confirmar que a rota usa `TreeAccessRoute`;
3. rodar `npm run build`;
4. testar manualmente login/acesso conforme regra de produto.

Se `?pessoa=...` desaparecer ao trocar view:

1. revisar o callback central de troca de view em `Home.tsx`;
2. confirmar que o destino concatena `location.search`;
3. evitar `setTreeViewMode` local separado da rota.

### Commit ja enviado, mas ha alteracoes locais

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

## 5. Rotas, acesso e permissoes

Arquivos provaveis:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/services/permissionService.ts
src/app/pages/Home.tsx
src/app/contexts/AuthContext.tsx
```

### Usuario comum acessa admin

Verificar:

- rota usa `ProtectedRoute`;
- `isAdminUser(user)` retorna corretamente;
- `profiles.role = 'admin'`;
- RPC/admin role esta funcionando;
- fallback de erro bloqueia acesso;
- RLS da tabela sensivel nao libera leitura/escrita indevida;
- menu nao renderiza botao admin para usuario comum.

Correcao:

- proteger rota;
- corrigir renderizacao condicional;
- corrigir service chamado pela UI;
- corrigir policy RLS, se necessario;
- nunca esconder so no frontend mantendo escrita liberada no banco.

### Admin nao ve Painel Administrativo

Verificar:

- sessao Supabase ativa;
- `profiles.role`;
- RPC `is_admin_user`;
- estado `isAdmin` em `Home.tsx`;
- fallback de loading/erro;
- cache de sessao antigo.

### Usuario autenticado nao acessa pagina de membro

Verificar:

- `MemberRoute`;
- `AuthContext`;
- status de loading da sessao;
- vinculo de perfil, se a rota exigir;
- erro de RLS em consultas iniciais.

---

## 6. Headers, margens e navegacao interna

Arquivos provaveis:

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

### Header interno diferente entre paginas

Verificar:

- pagina usa `MemberPageHeader`;
- container usa `PAGE_CONTAINER_CLASS`;
- Home pos-login deve continuar com header proprio;
- `/minha-arvore`, `/calendario-familiar`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/admin` devem compartilhar o padrao interno.

### Margens laterais divergentes

Verificar:

- `max-w-7xl`;
- `px-4 sm:px-6 lg:px-8`;
- `PAGE_CONTAINER_CLASS`;
- wrappers duplicados em header/main.

### Botao duplicado de recolher/expandir painel

Arquivos provaveis:

```txt
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

Verificar:

- botao interno do painel;
- botao passado por props para `FamilyTree`;
- `showSidebarToggle`;
- `onToggleSidebar`;
- mobile versus desktop;
- estado `sidebarOpen` e `legendOpen`.

Regra esperada:

- apenas um botao de expandir/recolher visivel;
- em desktop, dentro ou junto ao painel;
- em mobile, junto ao painel movel;
- nao pode existir botao duplicado na area da arvore.

---

## 7. Formularios de pessoa

Arquivos provaveis:

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

### Pessoa nao salva

Verificar:

- `cleanPersonPayload`;
- `PESSOA_COLUMNS`;
- tipo `Pessoa`;
- migration do campo;
- validacao de campos obrigatorios;
- `adicionarPessoa`;
- `atualizarPessoa`;
- erro de RLS;
- erro no console do Supabase.

Correcao:

- incluir campo no tipo e no payload somente se existir no banco;
- manter limpeza de campos desconhecidos;
- corrigir policy sem liberar escrita indevida;
- validar que o formulario nao envia `undefined` onde o banco exige `null`.

### Campo novo nao persiste

Confirmar se o campo esta em:

- tipo TypeScript;
- estado do formulario;
- componente de input;
- payload limpo;
- lista de colunas do service;
- migration;
- banco remoto;
- SELECT usado na leitura apos salvar.

### Autocomplete de endereco nao aparece

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY` existe no ambiente do frontend;
- `AddressAutocompleteInput` esta sendo usado no campo de endereco;
- `PersonContactFields` esta presente no admin;
- console do navegador para falha de carregamento do Google Places.

Correcao:

- configurar `VITE_GOOGLE_MAPS_API_KEY` quando autocomplete for necessario;
- confirmar `src/app/utils/googleAddress.ts` para formatacao do endereco;
- manter fallback silencioso para input normal quando a chave nao existir ou o Google falhar;
- nao bloquear salvamento do formulario por falha externa do Google.

Campos frequentes:

- `falecido`;
- `local_nascimento_exterior`;
- `local_falecimento_exterior`;
- `permitir_mensagens_whatsapp`;
- redes sociais;
- datas conjugais;
- observacoes internas.

### Formulario perde dados

Verificar:

- rascunho em `sessionStorage`;
- `useUnsavedChanges`;
- `useEffect` assincrono sobrescrevendo estado apos edicao local;
- preview/download chamando `onChange`;
- botoes internos sem `type="button"`;
- modal fechando e limpando estado pai;
- objeto inicial recalculado sem memoizacao adequada.

### Modal de relacionamento salva antes da hora

Verificar:

- `ConfirmDialog` nao deve ser usado para adicionar relacionamento no fluxo de formulario;
- relacionamento pendente so deve salvar no botao principal;
- cancelamentos usam `type="button"`;
- dados conjugais pendentes ficam no rascunho;
- `onSubmit` do formulario nao e disparado por botao interno.

---

## 8. Busca com acentos

Arquivos provaveis:

```txt
src/app/utils/searchText.ts
src/app/services/dataService.ts
src/app/pages/admin/AdminPessoas.tsx
src/app/components/RelacionamentoManager.tsx
src/app/components/FamilyTree/modals/AddConnectionModal.tsx
```

Sintomas:

- `Marcio` nao encontra `Marcio`;
- `Sao Paulo` nao encontra `Sao Paulo`;
- busca funciona em uma tela e falha em outra.

Verificar:

- uso de `normalizeSearchText`;
- uso de `includesNormalizedText`;
- `toLowerCase().includes(...)` sem normalizacao;
- busca feita no frontend versus busca feita no banco;
- campos nulos.

Correcao:

- padronizar com os helpers;
- tratar `null`/`undefined`;
- testar em admin, arvore, relacionamentos e vinculacao.

---

## 9. Pessoa falecida e locais no exterior

Arquivos provaveis:

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
- SELECT apos salvar;
- componentes da arvore usando helper correto.

### Local exterior rejeitado

Verificar:

- flags `local_nascimento_exterior` e `local_falecimento_exterior`;
- `validateLocationByMode`;
- modo Brasil/exterior;
- placeholder;
- formato esperado `Cidade (Pais)`;
- campo limpo indevidamente antes de salvar.

---

## 10. Arquivos historicos e Storage

Arquivos provaveis:

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

Correcao:

- novos arquivos devem ir para Storage;
- fallback base64 so deve servir legado/compatibilidade;
- nao apagar base64 antigo automaticamente.

### Preview limpa formulario

Verificar:

- abrir/fechar preview nao chama `onChange`;
- botoes de visualizar/baixar/abrir usam `type="button"`;
- estado de `novoArquivo` nao e limpo sem acao explicita;
- preview nao dispara submit do formulario.

### Download falha

Verificar:

- URL publica/acessivel;
- compatibilidade com `data:`;
- fallback de abrir em nova aba;
- nome de arquivo sanitizado;
- CORS;
- tipo MIME.

### Erro ao salvar `categoria_evento`

Sintomas provaveis:

- erro PostgREST/Supabase indicando que a coluna `categoria_evento` nao existe;
- insert/update em `public.arquivos_historicos` falha;
- listagem pode funcionar, mas salvar arquivo novo ou editar arquivo existente falha.

Causa provavel:

- ambiente remoto ainda nao recebeu `20260522121000_add_historical_file_event_category.sql`;
- schema cache do Supabase ainda nao refletiu a coluna apos migration recente.

Correcao:

1. confirmar `supabase migration list`;
2. aplicar a migration pendente aprovada com `supabase db push`;
3. confirmar que `public.arquivos_historicos.categoria_evento` existe;
4. se a coluna ja existir e o erro persistir, aguardar/recarregar schema cache do Supabase antes de alterar codigo.

Regra operacional:

- `20260522121000_add_historical_file_event_category.sql` e pre-requisito de deploy para versoes que enviam `categoria_evento` no payload;
- nao remover `categoria_evento` do payload para contornar ambiente sem migration.

### Upload abandonado deixa orfao

Verificar:

- upload antes do salvamento final;
- existencia de registro correspondente em `arquivos_historicos`;
- scripts dry-run antes de qualquer limpeza.

Correcao:

- nao deletar automaticamente sem auditoria;
- registrar procedimento de limpeza em frente tecnica separada.

### Arquivo de relacionamento salva como arquivo de pessoa

Esperado:

- `relacionamento_id` preenchido;
- `pessoa_id` nulo.

Verificar:

- `ViewMarriageModal`;
- `MarriageDetailsEditor`;
- `adicionarArquivoHistoricoAoRelacionamento`;
- RLS/admin;
- payload de criacao.

---

## 11. Relacionamentos, solicitacoes e dados conjugais

Arquivos provaveis:

```txt
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/pages/MinhaArvore.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/components/RelacionamentoManager.tsx
```

### Usuario comum altera relacionamento real

Verificar:

- UI esta chamando `createRelationshipChangeRequest`;
- UI nao chama `adicionarRelacionamentoComInverso`;
- RLS de `public.relacionamentos`;
- policy antiga permissiva;
- rota admin exposta indevidamente.

Correcao:

- usuario comum deve gerar solicitacao;
- alteracao real deve ser feita apenas por admin/aprovacao.

### Solicitacao nao aparece no admin

Verificar:

- tabela `relationship_change_requests`;
- status `pending`;
- RLS SELECT admin;
- `listAllRelationshipChangeRequests`;
- filtro de status na tela.

### Aprovacao nao altera relacionamento

Verificar:

- `approveRelationshipChangeRequest`;
- chamada ao `dataService`;
- payload de tipo/subtipo;
- dados conjugais;
- logs `relationship_change_approved`.

### Rejeicao altera dado real

P0 funcional.

Correcao:

- rejeitar so deve atualizar status da solicitacao;
- nao chamar funcao que altera relacionamento real.

### Status conjugal nao aparece na arvore

Verificar:

- `RELACIONAMENTO_COLUMNS`;
- `obterTodosRelacionamentos`;
- `getGenealogyMarriageStatus`;
- `ativo`;
- `data_separacao`;
- `subtipo_relacionamento`;
- `falecido`.

---

## 12. Arvore, Genealogia, Visao Completa e anel

Arquivos provaveis:

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

### Minha Arvore carrega muito pequena

Verificar:

- funcao de bounds do viewport;
- se `getViewportContentBounds` usa apenas cards reais;
- se labels, group boxes, legend nodes e anchors estao excluidos do calculo de zoom;
- `personNode` como base do zoom inicial;
- diferenca entre bounds de viewport e bounds de pan;
- `maxZoom` e `minZoom`;
- recenter automatico apos zoom.

Correcao esperada:

- zoom inicial deve usar bounds de cards reais;
- elementos auxiliares nao devem reduzir a escala;
- `+` e `-` devem funcionar ate o zoom maximo.

### Genealogia ou Visao Completa reduzem demais por altura

Regra esperada:

- Genealogia e Visao Completa usam zoom por largura;
- altura total nao deve reduzir o zoom;
- usuario arrasta/desliza para baixo se houver muitos cards verticais;
- posicao vertical inicial deve ser padronizada com Minha Arvore.

Verificar:

- `getNormalizedTreeViewport`;
- diferenciacao de regra por `viewMode`;
- calculo com `zoomX` versus `Math.min(zoomX, zoomY)`;
- `translateExtent` para permitir pan vertical.

### Titulo/subtitulo duplicado nas views genealogicas

Sintoma:

- overlay fixo em `FamilyTree.tsx` aparece;
- outro titulo/subtitulo aparece junto aos cards.

Arquivos provaveis:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/DirectFamilyLabelNode.tsx
```

Correcao:

- manter apenas overlay fixo em `FamilyTree.tsx`;
- remover title/subtitle nodes dos layouts;
- `DirectFamilyLabelNode` so deve permanecer se usado para labels de grupo, nao titulo principal.

### Linha diagonal entre pais e filhos

Verificar:

- regra de filho unico;
- edge ortogonal;
- `GenealogyFamilyConnectorNode`;
- layout por geracoes.

### Conectores/aneis soltos apos filtro

Verificar:

- filtro de pessoas visiveis;
- criacao de edges apenas quando origem/destino visiveis;
- `filterPersonalTreeScope`;
- dados de relacionamento sem pessoa correspondente.

### Genealogia mostra base completa

Verificar:

- view mode;
- escopo pessoal;
- pessoa central;
- `filterGraphToPersonalScope`.

### Visao Completa mostra poucas pessoas

Verificar:

- se usa base completa;
- filtros ativos;
- cache de dados;
- RLS;
- modo de visualizacao selecionado.

### Genealogia inicia na geracao errada ou centraliza a Geracao 2

Sintomas:

```txt
/genealogia mobile abre com a Geracao 2 ao centro
chip Tataravos aparece ativo, mas os cards da Geracao 1 nao ficam visiveis
a primeira coluna real nao e enquadrada no carregamento inicial
```

Arquivos provaveis:

```txt
src/app/pages/home/HomeTreeSection.tsx
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Verificar:

- `activeGenealogyGeneration`;
- `effectiveActiveGenealogyGeneration`;
- calculo de `mobileGenealogyInitialColumnBounds`;
- primeira geracao real renderizada em `layoutResult.nodes`;
- fallback indevido para `REFERENCE_GENERATION = 3`;
- se a geracao ativa esta sendo usada apenas para foco, nao para ocultar nodes.

Correcao esperada:

- o carregamento inicial da Genealogia mobile deve focar a primeira geracao com cards reais;
- no caso de Tulius, se Amalia Tsangaropoulos e Dimitri Tsangaropoulos estiverem conectados por filiacao, a primeira coluna deve ser Tataravos/Geracao 1;
- o chip ativo e o viewport inicial devem apontar para a mesma geracao;
- nao usar Avos como fallback de foco inicial quando houver geracao anterior renderizavel.

### Genealogia mostra Geracao 1 vazia ou nao mostra tataravos

Sintomas:

```txt
Geracao 1 aparece sem cards
Tataravos cadastrados aparecem em outra view, mas nao aparecem em /genealogia
coluna vazia ocupa espaco no desktop e no mobile
```

Causas provaveis:

- `genealogyColumnsLayout.ts` criou colunas fixas vazias;
- pessoas ancestrais nao possuem `manual_generation` coerente;
- a view Genealogia depende de `manual_generation`, mas a cadeia de filiacao permite inferir a geracao;
- relacoes de filiacao entre a pessoa central e os ancestrais estao ausentes ou invertidas.

Correcao consolidada:

- nao criar colunas fixas vazias em Genealogia;
- inferir `manual_generation` em memoria a partir da pessoa central quando a view for Genealogia;
- pais sobem uma geracao, filhos descem uma geracao e conjuges permanecem na mesma geracao;
- nao alterar dados reais no Supabase durante a inferencia de renderizacao.

Validar:

```txt
/genealogia desktop
/genealogia mobile
Tataravos
Bisavos
Avos
Pais
Nucleo
Descendentes
```

Se os tataravos ainda nao aparecerem:

1. verificar se existe cadeia completa de `filiacao_sangue` ou `filiacao_adotiva` ate a pessoa central;
2. verificar se a origem/destino das relacoes esta correta;
3. confirmar que as pessoas sao humanas (`isHumanFamilyMember`);
4. confirmar que filtros de vida/status nao ocultam os cards;
5. confirmar que RLS/cache nao esta omitindo relacionamentos.

### Chips da Genealogia mobile escondem colunas

Sintoma:

```txt
ao selecionar Tataravos, Bisavos ou Avos, as demais colunas somem
ao reduzir zoom, nao e possivel ver a arvore completa
```

Regra consolidada:

```txt
chips da Genealogia mobile controlam foco/enquadramento, nao filtragem estrutural da arvore
```

Correcao esperada:

- `visiblePersonIds` deve continuar representando filtros gerais;
- `activeGenealogyGeneration` deve ser passado ao `FamilyTree` apenas para foco;
- todos os cards renderizaveis da Genealogia devem permanecer no ReactFlow;
- pan/zoom deve continuar considerando a arvore inteira.

### Menu de geracoes sobrepoe labels ou botoes de zoom no mobile

Sintomas:

```txt
Tataravos/Bisavos/Avos sobrepoem GERACAO 1/2/3
botoes + e - reduzem area util da barra superior
a barra de chips fica curta no mobile
```

Correcao consolidada:

- barra de chips em `GenealogyMobileStageTabs` deve usar largura horizontal disponivel;
- contagem numerica dos chips nao deve aparecer;
- botoes `+` e `-` ficam ocultos somente em Genealogia mobile;
- safe area superior deve evitar sobreposicao entre barra e labels de geracao;
- pan/zoom por gesto continua permitido.

### Anel conjugal sobreposto em Genealogia

Sintoma:

```txt
anel de casamento fica sobreposto ou colado aos cards de conjuges
```

Arquivo provavel:

```txt
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Verificar:

- `SPOUSE_ROW_EXTRA_GAP`;
- tamanho visual atual do anel conjugal;
- distancia vertical entre cards de conjuges;
- status visual do anel em `GenealogySpouseEdge`.

Correcao consolidada:

- aumentar o gap vertical especifico entre conjuges;
- preservar conectores e clique no anel;
- validar com paletas `white`, `orange` e `brown`.

### Anel nao abre modal

Verificar:

- `GenealogySpouseEdge`;
- `onMarriageClick`;
- `edge.data.marriageDetails`;
- `event.stopPropagation()`;
- modal em `Home.tsx` ou `FamilyTree`.

### Modal mostra observacao para usuario comum

Correcao:

- renderizar observacoes internas apenas quando `isAdmin = true`.


### Título da árvore colado no topo ou distante demais dos cards

Sintomas:

```txt
A árvore de Tulius aparece muito próxima do topo da área da árvore.
Família de Tulius ou Linha Genealógica de Tulius ficam com grande vazio abaixo.
Cards superiores são cortados após tentativa de subir o viewport.
```

Arquivos prováveis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/styles/family-tree-visual-polish.css
```

Verificar em `FamilyTree.tsx`:

```txt
TREE_TITLE_TOP
TREE_TITLE_HEIGHT
TREE_DESKTOP_VISUAL_TOP_INSET
TREE_DESKTOP_VISUAL_BOTTOM_INSET
TREE_VIEWPORT_PADDING_Y
getNormalizedTreeViewport
flowViewportStyle
```

Verificar em CSS:

```txt
.react-flow__viewport
.react-flow
[data-export-root="family-tree"]
```

Correção esperada:

- dar padding superior ao título por constante/estrutura do overlay;
- reduzir o espaço entre título e cards ajustando o inset real do wrapper/viewport em `FamilyTree.tsx`;
- remover regras CSS que movam `.react-flow__viewport`;
- não usar `translate`, `transform`, `top` negativo ou `height: calc(...)` para compensar o espaço;
- validar se nenhum card superior foi cortado.

Validação visual:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Em desktop e mobile, nas paletas:

```txt
white
orange
brown
```

### Alianças ausentes ou pouco visíveis em `/minha-arvore`

Sintomas:

```txt
O botão conjugal aparece como círculo vazio.
O emoji antigo aparece como ?? ou mojibake.
O SVG existe no código, mas não é perceptível na interface.
/genealogia parece correta, mas /minha-arvore não.
```

Arquivos prováveis:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Verificar:

- `MarriageNodeData` aceita `visualVariant?: 'default' | 'direct-family'`;
- os marriage nodes de `/minha-arvore` recebem `visualVariant: 'direct-family'`;
- `/genealogia` não recebe a variante direta sem decisão explícita;
- o SVG tem `stroke`, `width`, `height`, `viewBox` e contraste suficientes;
- `overflow`, `z-index`, handles invisíveis e classes do botão não escondem o SVG;
- clique no botão ainda abre `ViewMarriageModal`.

Correção esperada:

- usar SVG estável, não emoji;
- reforçar apenas a variante `direct-family` se o problema for exclusivo de `/minha-arvore`;
- não alterar dimensão lógica do node sem revisar layout e anchors;
- não quebrar o estilo aprovado em `/genealogia`.

### Dois menus de usuário diferentes

Sintomas:

```txt
Nas views da árvore, o botão MENU abre uma lista/dropdown compacto.
Em /calendario-familiar, /forum, /notificacoes ou /meus-favoritos, abre painel maior com avatar, e-mail e botão X.
A documentação diz que ambos usam UserProfileMenu, mas a UI mostra diferença.
```

Arquivos prováveis:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/Home.tsx
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/forum/ForumHome.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/MeusFavoritos.tsx
```

Verificar:

- `HomeHeader.tsx` renderiza `UserProfileMenu variant="home-header"` ou componente local legado;
- `MemberPageHeader.tsx` renderiza `UserProfileMenu variant="avatar"`;
- `UserProfileMenu` realmente compartilha o mesmo conteúdo aberto nas duas variantes;
- existe `UserMenu` local ainda ativo em `Home.tsx` ou `HomeHeader.tsx`;
- o item **Editar notificações** foi removido de ambos;
- o topo com avatar/nome/e-mail navega para `/minha-arvore/editar`;
- botão `X` fecha sem navegar.

Correção esperada:

- manter botão compacto no header da árvore;
- unificar conteúdo aberto quando for essa a decisão de UX;
- se houver variação intencional, documentar explicitamente as diferenças por prop;
- não duplicar lógica de permissões, admin ou logout.

Validação:

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/forum
/notificacoes
/meus-favoritos
```

---

## 13. Painel de legendas

Arquivos provaveis:

```txt
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/FamilyTree.tsx
```

### Legenda nao aparece

Verificar:

- aba **Legendas** no painel lateral;
- import de `TreeLegend`;
- `activeSidebarPanel === 'legend'`;
- painel recolhido;
- z-index;
- mobile/desktop.

### Legenda aparece duplicada

Verificar:

- botao flutuante de legenda em `FamilyTree.tsx`;
- painel lateral em `Home.tsx`;
- remover popover/botao flutuante se a regra for legenda apenas no painel lateral.

### Conteudo antigo volta a aparecer

Itens que nao devem voltar no painel lateral compacto:

- subtitulo Cores, linhas, aneis e modos da arvore.;
- label Visualizacao atual;
- card azul com view atual;
- subtitulos dentro dos cards das secoes Cards, Linhas e Anel de casamento;
- area Views no final;
- texto Ativa no anel; usar **Em relacionamento**.

### Legenda atrapalha pan/zoom

Verificar:

- `onMouseDown={(event) => event.stopPropagation()}`;
- `onClick={(event) => event.stopPropagation()}`;
- `data-tree-legend="true"`;
- propagacao para ReactFlow.

### Legenda aparece em exportacao

Verificar:

- `getDefaultTreeExportIgnoreElements`;
- seletor `[data-tree-legend="true"]`.

### Legenda contradiz arvore

Comparar com:

- `GenealogySpouseEdge.tsx`;
- `GenealogyFamilyConnectorNode.tsx`;
- `directFamilyColors.ts`;
- `visualTokens.ts`;
- modos `minha-arvore`, `genealogia`, `visao-completa`.

---

## 14. Historico de atividades

Arquivos provaveis:

```txt
src/app/services/activityLogService.ts
src/app/pages/admin/AdminAtividades.tsx
src/app/types/index.ts
```

### Log nao e criado

Verificar:

- chamada de `createActivityLog`;
- `actor_user_id`;
- RLS de INSERT;
- erro engolido em `catch`;
- action permitida no tipo.

### Log falha para usuario comum

Verificar:

- `createActivityLog` nao deve depender de `.select().single()` apos insert;
- policy permite INSERT proprio;
- metadata esta sanitizada.

### Admin nao ve logs

Verificar:

- policy SELECT admin;
- RPC `is_admin_user`;
- rota protegida;
- `listActivityLogs`.

### Metadata sensivel

Remover imediatamente:

- URL completa;
- base64;
- telefone;
- endereco;
- e-mail;
- token;
- secret;
- service role;
- prompt completo;
- conteudo gerado por IA.

---

## 15. Admin Integridade

Arquivos provaveis:

```txt
src/app/pages/admin/AdminIntegridade.tsx
src/app/routes.tsx
src/app/services/dataService.ts
src/app/services/activityLogService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/lib/supabaseClient.ts
```

### Tela nao abre

Verificar:

- rota;
- import/export;
- `ProtectedRoute`;
- erro de service;
- erro de RLS;
- dados nulos nao tratados.

### Usuario comum acessa

P0 de permissao.

Corrigir:

- protecao de rota;
- fallback de permissao;
- policy RLS;
- renderizacao condicional do menu.

### Diagnostico acusa erro demais

Separar:

- erro critico;
- alerta;
- legado compativel;
- pendencia de validacao;
- item informativo.

### Tela altera dados

P0.

Correcao:

- `/admin/integridade` deve ser somente leitura;
- qualquer correcao automatica deve virar frente propria;
- acoes assistidas ficam pos-MVP.

---

## 16. Vinculo admin usuario-pessoa

Detalhes especificos de pessoas/perfil/admin:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

Arquivos provaveis:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/memberProfileService.ts
supabase/migrations/20260522173000_fix_admin_list_profiles_for_linking_rpc.sql
```

### Erro: `Could not find the function public.admin_list_profiles_for_linking without parameters in the schema cache`

Causas provaveis:

- migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` nao aplicada no Supabase remoto;
- schema cache remoto ainda nao atualizou;
- funcao ausente ou com assinatura diferente.

Correcao:

- aplicar a migration aprovada;
- conferir no Supabase se `public.admin_list_profiles_for_linking()` existe sem parametros;
- aguardar/recarregar schema cache se a funcao acabou de ser criada;
- nao substituir por consulta direta insegura em `profiles`.

### Usuarios nao aparecem no dropdown de vinculo admin

Verificar:

- resultado de `adminListProfilesForLinking`;
- erro inline no card **Adicionar vinculo manual**;
- botao **Recarregar**;
- migration `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql` aplicada;
- usuario logado e admin.

Comportamento esperado:

- dropdown fica desabilitado durante loading;
- dropdown fica desabilitado quando ha erro de listagem;
- **Recarregar** tenta buscar novamente sem depender de toast repetitivo.

---

## 17. Notificacoes

Arquivos provaveis:

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

### Notificacoes nao aparecem

Verificar:

- `listarNotificacoesSupabase`;
- RLS de `notificacoes_usuario`;
- `user_id` correto;
- usuario autenticado;
- central em `/notificacoes`;
- fallback local apenas como compatibilidade.

### Marcar/remover notificacao nao funciona

Verificar:

- funcao filtra por `id` e `user_id`;
- chamadas passam `user.id`;
- RLS UPDATE/DELETE do proprio usuario;
- rollback visual apos erro;
- console do navegador.

### Preferencias nao salvam

Verificar:

- `salvarPreferenciasNotificacao`;
- tabela `preferencias_notificacao`;
- RLS de upsert por `user_id`;
- log `notification_preferences.updated`;
- defaults nao sobrescrevem `false`.

### Preferencias nao aparecem em `/notificacoes`

Causa provavel:

- as preferencias foram separadas da central de notificacoes.

Correcao:

- abrir `/ajustar-notificacoes`;
- verificar `src/app/pages/AjustarNotificacoes.tsx`;
- verificar `src/app/components/notifications/NotificationPreferencesPanel.tsx`;
- manter `/notificacoes` dedicada a lista/central em cards.

### Gatilho nao notifica

Verificar:

- `notificationTriggersService`;
- destinatarios em `notificationRecipientsService`;
- exclusao do ator;
- dispatch log;
- preferencias do destinatario;
- canal interno versus e-mail.

### Notificacao duplica

Verificar:

- `notification_occurrences`;
- `occurrence_key`;
- constraint unica;
- deduplicacao de destinatarios;
- execucao manual repetida;
- Edge Function diaria e rotina manual usando o mesmo padrao de chave.

### E-mail real nao envia

Verificar:

- deploy de `send-notification-email`;
- secrets: `RESEND_API_KEY`, `NOTIFICATION_EMAIL_FROM`, `NOTIFICATION_EMAIL_REPLY_TO`, `SITE_URL`;
- se `NOTIFICATION_EMAIL_FROM` estiver ausente, confirmar se `EMAIL_FROM` esta configurado como fallback;
- dominio/remetente verificado no Resend;
- logs da Edge Function;
- `notification_dispatch_logs`.

### E-mail envia para destinatario errado

P0 operacional.

Verificar imediatamente:

- Edge Function exige usuario autenticado;
- usuario comum so envia para si mesmo;
- usuario comum nao escolhe destinatario arbitrario;
- teste admin e controlado;
- teste admin nao dispara massa de usuarios;
- `userId` no body;
- logs em `notification_dispatch_logs`.

### Rotina diaria retorna 401

Verificar:

- `DAILY_NOTIFICATIONS_SECRET`;
- header `x-daily-notifications-secret`;
- `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`;
- secret sem espacos/quebras de linha;
- function redeployada apos alteracao.

### Cron nao dispara

Verificar:

- `pg_cron`;
- job `run-daily-notifications-0800-brt`;
- horario UTC;
- 08:00 `America/Sao_Paulo` equivale a 11:00 UTC;
- URL da Edge Function;
- header com secret;
- segredo nao esta em migration versionada;
- resposta recente em `net._http_response`;
- retorno da rotina diaria com campos como `skippedDuplicates`, `skippedByPreferences`, `skippedWithoutRecipients` e `dispatchFailures`.

### Push/WhatsApp tentam envio real

Correcao:

- retornar `not_configured` ou `skipped` ate existir provider real.

---

## 18. Astrologia, Timeline, WhatsApp, parentesco, exportacao e favoritos

### Astrologia e acontecimentos do nascimento

Arquivos provaveis:

```txt
src/app/components/person/PersonDataView.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/services/personInsightsService.ts
supabase/functions/generate-person-insights/index.ts
```

Verificar se o perfil apenas le insights. Geracao automatica no perfil e P0 operacional; geracao/regeneracao deve ser acao admin.

Se cards vazios aparecerem no perfil publico:

- verificar `PersonDataView.tsx`;
- garantir que cards sem conteudo, sem loading, sem erro e sem fallback valido retornem `null`;
- o texto **Conteudo ainda nao gerado.** nao deve aparecer publicamente;
- no admin, exibir card apenas quando houver acao possivel, conteudo existente, loading ou erro.

### Timeline

Arquivos provaveis:

```txt
src/app/pages/PersonProfile.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/utils/buildPersonTimeline.ts
src/app/services/personEventsService.ts
```

Verificar eventos vazios, duplicados, fora de ordem e metadata sensivel.

### WhatsApp

Arquivos provaveis:

```txt
src/app/utils/whatsapp.ts
src/app/components/person/WhatsAppContactButton.tsx
src/app/components/person/PersonDataView.tsx
```

Numero textual so aparece se `permitir_exibir_telefone = true`. Botao depende de telefone valido e `permitir_mensagens_whatsapp`.

### Grau de parentesco

Arquivos provaveis:

```txt
src/app/utils/relationshipDegree.ts
src/app/utils/relationshipDegree.test.ts
src/app/utils/relationshipDegreeDisplay.ts
```

Se pai/filho estiver invertido, corrigir algoritmo com teste unitario antes de mexer na UI.

### Exportacao de area da arvore

Arquivos provaveis:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Verificar overlay, crop, CORS, impressao e ignore elements.

### Favoritos

Arquivos provaveis:

```txt
src/app/services/favoritesService.ts
src/app/components/favorites/FavoriteButton.tsx
src/app/pages/MeusFavoritos.tsx
src/app/pages/PersonProfile.tsx
```

Verificar RLS, usuario autenticado, campos novos, colunas legadas relaxadas, link interno e metadata sensivel.

---

## 19. Responsividade

Arquivos prioritarios:

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
- botoes em linha;
- cards com `min-width`;
- ReactFlow;
- modais;
- imagens sem `max-width`.

### Modal nao cabe na tela

Correcao:

- altura maxima;
- scroll interno;
- padding responsivo;
- footer sticky se necessario.

### Arvore ruim em touch

Verificar:

- pan/zoom;
- botoes pequenos;
- sobreposicao de controles;
- menu de pessoa;
- legenda;
- selecao de area.

### Admin inutilizavel em mobile

Priorizar:

- formulario de pessoa;
- listas/tabelas com scroll;
- filtros;
- acoes primarias visiveis.

---

## 20. Migrations e Supabase

Arquivos provaveis:

```txt
supabase/migrations
supabase/config.toml
supabase/functions
```

### Funciona local, mas nao remoto

Verificar:

```bash
supabase migration list
```

Se ha migration local pendente e aprovada:

```bash
supabase db push
```

Se o schema remoto ja tem os efeitos:

- confirmar com SQL/dump;
- so entao considerar `supabase migration repair --status applied`.

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

Antes de qualquer remocao:

```sql
select count(*) as pessoas_com_json_legado
from public.pessoas
where arquivos_historicos is not null
  and arquivos_historicos::text not in ('[]', 'null');
```

Nao remover sem dump, auditoria e QA visual.

---

## 21. Sintomas rapidos

### Usuario comum fez algo indevido

Verificar:

```txt
ProtectedRoute
permissionService
RLS
service chamado pela UI
RPC security definer
policies antigas
```

### Algo salva, mas nao aparece

Verificar:

```txt
service de leitura
cache/refetch
colunas selecionadas
types/index.ts
RLS SELECT
```

### Algo aparece para usuario comum, mas deveria ser admin-only

Verificar:

```txt
isAdmin
renderizacao condicional
readOnly
ProtectedRoute
RLS
```

### Dados digitados somem

Verificar:

```txt
sessionStorage draft
useUnsavedChanges
botoes sem type="button"
preview de arquivos
useEffect sobrescrevendo estado
```

### Notificacao nao chega

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

Correcao imediata:

- remover do frontend;
- rotacionar secret se foi exposto;
- mover para Edge Function ou Supabase secrets;
- revisar historico do Git se houve commit.

---

## 22. Calendario Familiar

Detalhes especificos:

```txt
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

Arquivo provavel:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

### Calendario volta a mostrar `item(ns)` ou contadores brutos

Verificar:

- helper `formatEventCount`;
- textos do calendario e da sidebar;
- singular/plural esperado: **1 evento**, **2 eventos**.

### Categorias nao filtram

Verificar:

- `activeCategories`;
- `toggleCategory`;
- `getCalendarCategory`;
- botoes da sidebar com titulo **Categorias**;
- `aria-pressed` e estado visual ativo/inativo.

### Aniversario nao mostra idade como `Faz X anos`

Verificar:

- `formatCalendarEventDescription`;
- cards do calendario usando primeiro nome;
- lista inferior usando nome completo.

---

## 23. Troubleshooting recente - legenda funcional, camadas visuais e painel lateral

### Destaques visuais aparecem mesmo com filtro oculto

Arquivos provaveis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
```

Verificar:

- `edgeFilters` esta sendo passado aos layouts;
- `parentChildHighlight` esta condicionado a `filiacao_sangue || filiacao_adotiva`;
- `siblingHighlight` esta condicionado a `edgeFilters.irmaos`;
- pessoas/grupos ocultos nao recebem edges opcionais.

### Botao Destacar pais/filhos nao tem efeito

Verificar:

- `visualLineFilters.parentChildHighlight`;
- callback `onToggleVisualLineFilter`;
- repasse de `visualLineFilters` de `Home.tsx` para `FamilyTree.tsx`;
- repasse para `directFamilyDistributedLayout` e `genealogyColumnsLayout`;
- `GenealogyFamilyConnectorNode` recebendo `parentChildHighlight`.

### Botao Destacar irmaos nao tem efeito

Verificar:

- `visualLineFilters.siblingHighlight`;
- `edgeFilters.irmaos`;
- relacoes explicitas `irmao`;
- handles usados nas edges de irmaos;
- restricoes contra linhas longas em Genealogia/Visao Completa.

### Informacoes voltou para dentro da toggle

Arquivo provavel:

```txt
src/app/pages/Home.tsx
```

Esperado:

- `SidebarPanelTabs` mostra apenas **Filtros** e **Legendas**;
- **Informacoes** abre por botao externo;
- botao usa `Printer` e texto **Acoes** no desktop;
- `activeSidebarPanel = 'info'` continua renderizando `SidebarInfoPanel`.

### Zoom voltou para a esquerda

Arquivo provavel:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Esperado:

- botoes `+` e `-` no canto superior direito;
- wrapper visual com `right-4 top-4`;
- nao alterar minZoom, maxZoom, viewport, bounds ou normalizacao.

---
## 22. Correcoes recentes e troubleshooting adicional - ciclo 2026-05-30

### 22.1 Textos com `?` no lugar de acentos

Sintoma observado:

```txt
Arquivos Hist?ricos
arquivos hist?ricos
Voc? tem altera??es pendentes nesta p?gina...
O corte final ser? quadrado.
```

Arquivos provaveis:

```txt
src/app/pages/MinhaArvore.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/utils/textEncodingRepair.ts
src/app/App.tsx
```

Correcao aplicada no ciclo recente:

```txt
src/app/utils/textEncodingRepair.ts
src/app/App.tsx
```

Responsabilidade:

- reparar defensivamente textos renderizados com `?` em pontos conhecidos;
- reduzir regressao visual enquanto a origem e revisada.

Regra importante:

```txt
textEncodingRepair e camada defensiva, nao substitui manter arquivos-fonte em UTF-8.
```

Investigacao recomendada:

1. buscar strings quebradas no codigo;
2. verificar encoding do arquivo;
3. corrigir origem quando possivel;
4. manter reparo defensivo apenas para casos conhecidos;
5. evitar substituicoes genericas que alterem conteudo de usuario.

Comandos uteis:

```bash
git diff -- src/app/pages/MinhaArvore.tsx | Select-String "SÃ|famÃ|proteÃ"
git grep "Hist?ricos"
git grep "altera??es"
git grep "ser?o"
```

### 22.2 Redirecionamento recorrente para `/meus-dados`

Sintoma:

```txt
Usuario autenticado tenta acessar paginas da arvore e e redirecionado para /meus-dados.
```

Arquivo provavel:

```txt
src/app/components/TreeAccessRoute.tsx
```

Causa provavel:

```txt
TreeAccessRoute tratando todo vinculo com dados_confirmados=false como primeiro acesso.
```

Regra corrigida:

```txt
sem sessao -> /entrar
vinculo recem-criado e dados_confirmados=false -> /meus-dados
vinculo existente -> libera arvore mesmo com dados_confirmados=false
```

Validar:

```txt
/minha-arvore
/genealogia
/visao-completa
/busca
```

Se `/pessoa/:id` ou `/notificacoes` redirecionarem indevidamente, investigar `MemberRoute`, pois essas rotas nao usam `TreeAccessRoute`.

### 22.3 Dropdown coberto pelo header

Sintoma:

```txt
Menu do usuario ou seletor de views abre parcialmente por baixo do header.
```

Arquivos provaveis:

```txt
src/app/components/ui/select.tsx
src/app/components/ui/dropdown-menu.tsx
src/app/pages/home/HomeHeader.tsx
```

Regra consolidada:

```txt
SelectContent -> z-[1000]
DropdownMenuContent -> z-[1000]
DropdownMenuSubContent -> z-[1000]
sideOffset -> 8
```

Validar:

```txt
/minha-arvore
/genealogia
/visao-completa
```

### 22.4 Busca do header com clique parcial

Sintoma:

```txt
Somente parte do botao de busca responde ao clique.
```

Arquivo provavel:

```txt
src/app/pages/home/HomeHeader.tsx
```

Verificar:

- `pointer-events-none` em wrappers;
- area visual do botao versus area real;
- z-index da busca;
- sobreposicao por input colapsado;
- `onClick` no botao.

Regra:

```txt
A area visual inteira do botao de busca deve ser clicavel.
```

### 22.5 Linhas de primos nao somem com `Legendas > Linhas > Todas`

Sintoma:

```txt
Todas as linhas somem, exceto conectores horizontais/verticais entre primos.
```

Arquivos provaveis:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/TreeLegend.tsx
src/app/pages/Home.tsx
```

Regra:

```txt
Linhas entre primos tambem devem respeitar edgeFilters.
```

Se uma linha representa relacao familiar para o usuario, nao classificar como `auxiliary` sem filtro.

### 22.6 Notificacoes com tag tecnica ou item nao clicavel

Sintomas:

```txt
DATAS_ESPECIAIS aparece na UI
memoria aparece sem acento ou com encoding quebrado
clicar no corpo do card nao abre a notificacao
```

Arquivo provavel:

```txt
src/app/pages/Notificacoes.tsx
```

Correcao esperada:

- label amigavel `DATAS_ESPECIAIS -> ESPECIAIS`;
- corrigir acentuacao;
- tornar card inteiro clicavel;
- impedir que botao remover propague clique.

### 22.7 Casamento aparece como Data desconhecida

Sintoma:

```txt
data_casamento existe, mas timeline ou perfil mostram Data desconhecida.
```

Arquivos provaveis:

```txt
src/app/utils/buildPersonTimeline.ts
src/app/pages/PersonProfile.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/services/dataService.ts
```

Verificar:

- campo `data_casamento` no relacionamento;
- formato `DD/MM/AAAA` versus ISO;
- parser de datas;
- mapeamento de relacionamento detalhado;
- fallback para `data_relacionamento`.

### 22.8 Viuvez aparece como separacao

Sintoma:

```txt
Relacionamento encerrado por falecimento de conjuge aparece como Separacao.
```

Arquivos provaveis:

```txt
src/app/utils/buildPersonTimeline.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/person/PersonRelationshipsView.tsx
```

Regra:

```txt
Falecimento de conjuge gera viuvez, nao separacao.
```

Nao inferir separacao apenas por `ativo=false`.

---

## Atualizacao 2026-06-06 - Scripts, cherry-pick e paletas visuais

### Sintoma: cherry-pick gera conflito em `MarriageNode.tsx` e `GenealogySpouseEdge.tsx`

Exemplo:

```txt
CONFLICT (content): Merge conflict in src/app/components/FamilyTree/GenealogySpouseEdge.tsx
CONFLICT (content): Merge conflict in src/app/components/FamilyTree/MarriageNode.tsx
```

Correcao segura:

```bash
git cherry-pick --abort
```

Depois, reaplicar o ajuste pontual manualmente ou por script conservador.

### Sintoma: leftover conflict marker

Exemplo:

```txt
leftover conflict marker
``<<<<<<<` HEAD`
`=======`
`>>>>>>>`
```

Correcao:

- nao rodar build antes de resolver ou abortar o conflito;
- usar `git status --short` para identificar arquivos `UU`;
- resolver manualmente ou abortar a operacao;
- validar com:

```bash
git diff --check
npm run build
```

### Sintoma: `Duplicate "style" attribute in JSX element`

Causa provavel:

- script adicionou um novo `style` em elemento JSX que ja possuia `style`.

Correcao:

- combinar as propriedades em um unico objeto `style`.

Exemplo:

```tsx
style={{
  width: '100%',
  height: '100%',
  backgroundColor: 'var(--tree-palette-canvas-bg, #F8FAFC)',
}}
```

### Sintoma: script com substituicao rigida nao encontra trecho

Exemplo:

```txt
Trecho nao encontrado em src/app/components/FamilyTree/nodeTypes.ts
```

Causa provavel:

- arquivo ja mudou;
- formatacao diverge;
- script depende de bloco literal longo.

Correcao:

- usar patch menor;
- buscar por nomes de propriedades/funcoes;
- revisar `git diff`;
- nao repetir script falho sem restaurar o estado.

### Risco: encoding corrompido por script local

Sintoma:

```txt
Arvore vira <C1>rvore
genealogica vira geneal<F3>gica
```

Correcao:

```bash
git restore caminho/do/arquivo
```

Prevencao:

- evitar scripts PowerShell com `Set-Content` em arquivos com acentuacao;
- preferir script Node preservando UTF-8/BOM;
- revisar `git diff` antes de commit.

### Sintoma: script de paleta no `HomeHeader` nao encontra trechos

Exemplos:

```txt
Trecho nao encontrado: helpers de paleta
Trecho nao encontrado: effect searchTerm
Nenhuma alteracao aplicada.
```

Causas provaveis:

- `HomeHeader.tsx` ja foi alterado por commit posterior;
- o script usa substituicao literal longa;
- a primeira execucao aplicou parte do patch e a segunda execucao nao tem mais nada a alterar;
- um script temporario antigo ficou em `scripts/`.

Correcao segura:

```bash
Remove-Item scripts/apply-home-header-palettes-safe.mjs -Force -ErrorAction SilentlyContinue
Remove-Item scripts/hotfix-home-header-palette-state.mjs -Force -ErrorAction SilentlyContinue
git status --short
```

Depois:

- conferir se `HomeHeader.tsx` foi modificado;
- buscar os trechos obrigatorios com `Select-String`;
- se o arquivo ja contem estado/effect/botoes, nao rodar o script novamente;
- remover scripts auxiliares antes do commit;
- validar com `git diff --check` e `npm run build`.

Regra:

```txt
Erro "Nenhuma alteracao aplicada" depois de uma execucao bem-sucedida nao e falha da implementacao; indica que o patch ja foi aplicado.
```
---

## Atualizacao 2026-06-06 - Genealogia mobile e inferencia de geracoes

Frente concluida nesta rodada:

```txt
/genealogia mobile com navegacao horizontal por geracoes
Genealogia desktop/mobile sem colunas vazias
inferencia de geracoes por pessoa central em memoria
```

Commits de referencia:

```txt
60a6cd0 feat: add genealogy mobile stage tabs
8d369f8 feat: show genealogy mobile stage tabs
096d005 feat: control genealogy mobile stage tabs
777d8fd feat: filter genealogy mobile tree by active stage
50609f0 feat: reset genealogy mobile viewport by stage
bd0d24f feat: refine genealogy mobile stage labels
ca593a6 feat: add swipe navigation to genealogy mobile stages
05742bb feat: show empty genealogy mobile stage feedback
af17ffb fix: improve genealogy mobile stage focus
f23e353 fix: refine genealogy mobile stage navigation
9c13e22 fix: focus first genealogy mobile stage on load
189303a fix: start genealogy mobile on first rendered column
b668a59 fix: infer genealogy generations from central person
```

Regras anti-regressao:

- chips da Genealogia mobile focam geracoes, mas nao escondem as demais colunas;
- a primeira visualizacao mobile deve focar a primeira geracao com cards reais;
- colunas vazias nao devem ser renderizadas;
- tataravos devem aparecer se houver cadeia valida de filiacao ate a pessoa central;
- a inferencia de geracoes e apenas em memoria, sem alteracao de Supabase;
- `Visao Completa` ainda nao recebeu a navegacao mobile por chips e deve ser tratada em frente separada.
---

## Atualizacao 2026-06-07 - Menu compartilhado, titulo da arvore e paginas auxiliares

Esta secao registra sintomas e correcoes relacionados ao ciclo de ajustes de menu, espacamento da arvore, aliancas, calendario, edicao de perfil e notificacoes.

### Sintoma: menu da arvore voltou ao dropdown compacto antigo

Sintomas possiveis:

```txt
Nas rotas /minha-arvore, /genealogia ou /visao-completa, o clique no botao MENU abre uma lista compacta antiga.
O painel com avatar, nome, e-mail e botao fechar nao aparece.
O item Editar notificacoes voltou a aparecer no menu.
```

Arquivos provaveis:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeHeader.tsx
src/app/components/layout/UserProfileMenu.tsx
```

Regra consolidada:

```txt
O header da arvore preserva a aparencia compacta do botao, mas o conteudo aberto deve ser o UserProfileMenu compartilhado.
```

Verificar:

- `HomeHeader.tsx` deve renderizar `UserProfileMenu` na variante compacta do header da arvore;
- nao recriar `UserMenu` local em `Home.tsx`;
- o painel deve ser o mesmo menu compartilhado usado nas paginas internas;
- o cabecalho do menu, com avatar/nome/e-mail, deve navegar para `/minha-arvore/editar`;
- o botao de fechar deve apenas fechar o painel e nao disparar navegacao;
- o item **Editar notificacoes** nao deve aparecer no menu.

Correcao esperada:

- usar `UserProfileMenu` com variante visual do header da arvore, por exemplo `variant="home-header"`;
- manter a variante padrao para paginas internas;
- remover logica local antiga somente se o build confirmar que ficou sem uso;
- preservar permissao condicional do botao **Painel Admin**.

Validar:

```bash
npm run build
git diff --check
```

E visualmente:

```txt
/minha-arvore
/genealogia
/visao-completa
/calendario-familiar
/forum
/notificacoes
/favoritos
```

### Sintoma: cabecalho do menu nao leva para edicao do perfil

Sintoma:

```txt
O usuario clica na area superior do menu com avatar, nome e e-mail, mas nada acontece.
```

Arquivo provavel:

```txt
src/app/components/layout/UserProfileMenu.tsx
```

Verificar:

- o bloco superior precisa ser elemento clicavel acessivel;
- clique deve fechar o menu e navegar para `/minha-arvore/editar`;
- para visitante, se aplicavel, navegar para `/entrar`;
- o botao `X` deve usar `stopPropagation` ou estrutura equivalente para nao acionar a navegacao do cabecalho.

### Sintoma: titulo da arvore com mojibake ou espacamento incorreto

Sintomas:

```txt
A Ã¡rvore de Tulius
FamÃ­lia de ...
Linha GenealÃ³gica de ...
titulo encostado no topo da area da arvore
grande vazio entre titulo e cards
cards superiores cortados apos ajuste visual
```

Arquivos provaveis:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
src/styles/family-tree-visual-polish.css
```

Regras consolidadas:

- corrigir textos na origem em UTF-8;
- controlar titulo, area visual do ReactFlow e viewport por constantes em `FamilyTree.tsx`;
- nao usar `transform`, `translate` ou `top` negativo em `.react-flow__viewport` para aproximar a arvore;
- `family-tree-visual-polish.css` deve ser polimento visual, nao fonte de reposicionamento estrutural do ReactFlow;
- subtitulos abaixo do titulo podem permanecer ocultos se a decisao de UX assim definir.

Verificar em `FamilyTree.tsx`:

```txt
TREE_TITLE_TOP
TREE_TITLE_HEIGHT
TREE_DESKTOP_VISUAL_TOP_INSET
TREE_DESKTOP_VISUAL_BOTTOM_INSET
TREE_VIEWPORT_PADDING_Y
getNormalizedTreeViewport
```

Verificar em CSS:

```txt
.react-flow__viewport
.family-tree-title
.family-tree-subtitle
```

Correcao esperada:

- remover overrides conflitantes;
- ajustar constantes de forma conservadora;
- manter cards superiores inteiros;
- validar as tres views da arvore em desktop, tablet e mobile.

### Sintoma: icone de alianca aparece em /genealogia, mas nao em /minha-arvore

Arquivos provaveis:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/types.ts
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
```

Regra consolidada:

```txt
/genealogia preserva a variante visual padrao; /minha-arvore pode usar variante visual direct-family para aumentar legibilidade.
```

Verificar:

- `MarriageNodeData` deve aceitar uma variante visual, como `visualVariant?: 'default' | 'direct-family'`;
- os marriage nodes criados por `directFamilyDistributedLayout.ts` devem receber `visualVariant: 'direct-family'`;
- os nodes/edges da Genealogia devem continuar sem essa variante, preservando o estilo padrao;
- o SVG deve ter contraste suficiente;
- dimensao do no, handles, edges e clique nao devem ser alterados sem decisao especifica;
- o clique deve continuar abrindo `ViewMarriageModal`.

Correcao esperada:

- reforcar SVG, borda, halo ou contraste apenas na variante direta;
- nao mexer globalmente no estilo da Genealogia se ela ja estiver correta.

### Sintoma: textos de paginas internas aparecem como Unicode escapado ou mojibake

Sintomas:

```txt
Calend\u00e1rio
Prefer\u00eancias
Notifica\u00e7\u00f5es
CalendÃ¡rio
PreferÃªncias
NotificaÃ§Ãµes
```

Arquivos provaveis:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/components/layout/MemberPageHeader.tsx
```

Correcao:

- corrigir a string literal no arquivo-fonte;
- salvar em UTF-8;
- revisar `git diff` para garantir que nao houve nova corrupcao;
- evitar scripts PowerShell com `Set-Content` quando houver acentos.

Validar visualmente:

```txt
/calendario-familiar -> Calendario/Calendário conforme politica da UI
/ajustar-notificacoes -> Preferencias/Preferências e Notificacoes/Notificações
```

### Sintoma: /notificacoes nao oferece atalho para preferencias

Arquivo provavel:

```txt
src/app/pages/Notificacoes.tsx
```

Regra consolidada:

- `/notificacoes` permanece a central/lista de notificacoes;
- preferencias ficam em `/ajustar-notificacoes`;
- a central deve oferecer botao **Personalizar Notificacoes** apontando para `/ajustar-notificacoes`.

Verificar:

- acao no header ou bloco superior;
- navegacao client-side;
- preservar acoes existentes, como **Marcar todas como lidas**.

### Sintoma: /minha-arvore/editar nao exibe Trocar Senha

Arquivo provavel:

```txt
src/app/pages/MinhaArvore.tsx
```

Regra consolidada:

- a pagina de edicao do proprio perfil deve oferecer botao **Trocar Senha**;
- o fluxo deve usar mecanismo existente de Supabase Auth quando disponivel;
- nao criar migration, tabela ou RLS para esse ajuste;
- o botao nao participa do salvamento flutuante dos dados familiares;
- erro/sucesso devem aparecer como feedback de UI.

Verificar:

```txt
supabase.auth.resetPasswordForEmail
email do usuario autenticado
estado de loading como Enviando...
toast de sucesso/erro
```

### Sintoma: calendario mostra aniversario sem hierarquia visual

Arquivo provavel:

```txt
src/app/pages/CalendarioFamiliar.tsx
```

Regra consolidada:

- no grid do calendario, o titulo do evento deve ter peso visual maior;
- a descricao, como **Faz X anos**, deve ter fonte menor;
- nao alterar `familyDates.ts` quando a mudanca for apenas visual;
- preservar Google Agenda e o shape de `EventoCalendarioFamiliar`.

Validar:

```txt
/calendario-familiar desktop
/calendario-familiar tablet
/calendario-familiar mobile
```


### Nota complementar de status visual

Mesmo quando o build passa, os seguintes pontos não devem ser considerados resolvidos sem validação visual:

```txt
titulo com padding superior adequado
espaço título ↔ cards reduzido sem corte superior
alianças visíveis em /minha-arvore
menu da árvore coerente com o menu das páginas internas
```

Se algum desses pontos falhar, registrar como pendência em `PLANO_PROXIMOS_PASSOS.md`, não como implementação concluída em `GUIA_IMPLEMENTACOES.md`.
