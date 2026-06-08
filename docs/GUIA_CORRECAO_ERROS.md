# Guia de correção de erros - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/GUIA_CORRECAO_ERROS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: guia canônico revisado para troubleshooting por sintoma.

## Objetivo

Este documento orienta investigação e correção de erros por **sintoma observado**.

Use quando houver:

- build quebrado;
- tela que não carrega;
- regressão visual;
- falha de permissão;
- erro de Supabase/RLS/migration;
- falha de Storage;
- falha de notificações;
- comportamento inesperado em árvore, perfil, fórum, favoritos ou calendário.

Este documento não substitui:

- `docs/GUIA_IMPLEMENTACOES.md`: estado implementado;
- `docs/GUIA_COMPONENTES.md`: componentes e responsabilidades;
- `docs/GUIA_UX_LAYOUT.md`: decisões visuais;
- `docs/PLANO_PROXIMOS_PASSOS.md`: pendências reais e backlog;
- `docs/operacao/MIGRATIONS_SUPABASE.md`: procedimento operacional de migrations;
- `docs/funcionalidades/*.md`: detalhes funcionais por área.

---

## 1. Checklist inicial

Antes de alterar código:

```bash
git status --short
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

- corrigir o primeiro erro real antes de tratar erros derivados;
- não rodar `supabase db push` sem revisar migrations;
- não usar `migration repair` para mascarar migration não aplicada;
- não commitar secrets, dumps, tokens, service role, `.bak`, patches locais ou saídas de build;
- não ampliar RLS para resolver leitura/escrita sem entender a regra de negócio;
- não apagar dados legados/base64 sem auditoria.

---

## 2. Build quebrado

Arquivos prováveis:

```txt
src/app/routes.tsx
src/app/pages/
src/app/components/
src/app/services/
src/app/types/index.ts
src/app/utils/
package.json
vite.config.ts
tsconfig.json
```

Causas comuns:

- import inexistente;
- export ausente;
- componente movido sem ajustar caminho;
- tipo novo ausente em `types/index.ts`;
- campo de banco usado no frontend sem tipo;
- dependência não instalada;
- JSX inválido após script;
- conflito de merge;
- arquivo salvo com encoding problemático.

Correção:

1. rodar `npm run build`;
2. ler o primeiro erro;
3. corrigir o arquivo apontado;
4. repetir build;
5. rodar `git diff --check`;
6. confirmar que a correção não mudou escopo funcional.

### 2.1 `Link is not defined`

Sintoma:

```txt
ReferenceError: Link is not defined
```

Causa provável:

- import de `AppLink as Link` removido em página que ainda usa `<Link>`.

Correção:

```ts
import { AppLink as Link } from '../components/AppLink';
```

Ajustar caminho relativo conforme a pasta.

### 2.2 `Missing initializer in const declaration` em `React.forwardRef`

Sintoma:

```txt
Missing initializer in const declaration
```

Arquivo provável:

```txt
src/app/components/FamilyTree/FamilyTree.tsx
```

Causa provável:

- script quebrou a declaração `export const FamilyTree = React.forwardRef...`.

Correção segura:

```ts
function FamilyTreeComponent(
  props: FamilyTreeProps,
  ref: React.ForwardedRef<FamilyTreeActions>
) {
  // ...
}

export const FamilyTree = React.forwardRef<FamilyTreeActions, FamilyTreeProps>(FamilyTreeComponent);
```

### 2.3 `Expected "}" but found ":"` em `style`

Sintoma:

```txt
Expected "}" but found ":"
style={ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }
```

Correção:

```tsx
style={{ top: TREE_TITLE_TOP, height: TREE_TITLE_HEIGHT }}
```

### 2.4 `treeColorPalette is not defined`

Sintoma:

```txt
ReferenceError: treeColorPalette is not defined
```

Arquivo provável:

```txt
src/app/pages/home/HomeHeader.tsx
```

Causa provável:

- JSX dos botões de paleta foi inserido sem estado/effect correspondente.

Verificar se existem:

```txt
TREE_COLOR_PALETTES
TREE_COLOR_PALETTE_STORAGE_KEY
const [treeColorPalette, setTreeColorPalette]
applyTreePalette(treeColorPalette)
setTreeColorPalette(paletteKey)
```

Correção:

- se produção estiver quebrada, reverter o commit problemático;
- reimplementar em branch/PR;
- validar build e preview;
- evitar script parcial que aplique apenas JSX.

---

## 3. Git, backups e arquivos temporários

### 3.1 `.git/index.lock`

Sintoma:

```txt
fatal: Unable to create '.git/index.lock': File exists.
```

Correção:

```bash
# confirmar antes que não existe processo Git ativo
rm -f .git/index.lock
git status
```

### 3.2 Backups no `git status`

Sintoma:

```txt
Untracked files:
  backups/
  *.bak
  *.patch
  apply-*.py
```

Correção:

```bash
rm -rf backups/
rm -f *.bak *.patch
rm -f apply-*.py
git status --short
```

Regra:

- não commitar backups, scripts temporários ou patches auxiliares.

### 3.3 Mojibake/acentuação corrompida

Sintoma:

```txt
CalendÃ¡rio
NotificaÃ§Ãµes
PrÃ³ximos
```

Causas:

- arquivo salvo em encoding errado;
- PowerShell/terminal regravou Markdown/TSX sem UTF-8 correto;
- script de substituição usou encoding implícito.

Correção:

- confirmar encoding UTF-8;
- evitar `Set-Content` sem encoding explícito;
- revisar diff antes de commit;
- em Markdown, preferir edição controlada e `git diff --check`.

---

## 4. Rotas, guards e navegação

Arquivos prováveis:

```txt
src/app/routes.tsx
src/app/components/ProtectedRoute.tsx
src/app/components/MemberRoute.tsx
src/app/components/TreeAccessRoute.tsx
src/app/pages/Home.tsx
src/app/components/FamilyTree/treeViewMode.ts
src/app/services/permissionService.ts
```

Comportamento esperado:

- `/` redireciona para `/minha-arvore` preservando search params;
- `/minha-arvore`, `/genealogia` e `/visao-completa` usam `TreeAccessRoute`;
- páginas de membro usam `MemberRoute`;
- admin usa `ProtectedRoute`;
- usuário comum não acessa admin;
- `treeViewMode` deriva da rota;
- troca de view usa navegação client-side.

Sintomas comuns:

| Sintoma | Investigar |
|---|---|
| Usuário comum acessa admin | `ProtectedRoute`, `permissionService`, RLS. |
| Usuário vinculado volta para `/meus-dados` em loop | `TreeAccessRoute`, `memberProfileService`. |
| View errada abre na árvore | `treeViewMode.ts`, `Home.tsx`, `HomeHeader.tsx`. |
| Search param `?pessoa=` some ao trocar view | helper de navegação em `Home.tsx`. |
| 404 inesperado | `routes.tsx`, path digitado, lazy import. |

---

## 5. Árvore, viewport e React Flow

Arquivos prováveis:

```txt
src/app/pages/Home.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/PersonNode.tsx
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
src/styles/family-tree-visual-polish.css
```

### 5.1 Título colado no topo ou espaço grande até cards

Investigar:

- constantes de título/viewport em `FamilyTree.tsx`;
- safe area mobile;
- bounds usados no viewport inicial;
- CSS externo que altere React Flow.

Não fazer:

```txt
.react-flow__viewport { transform: ... }
top negativo
translate manual
```

Correção segura:

- ajustar constantes/cálculo em `FamilyTree.tsx`;
- validar `/minha-arvore`, `/genealogia`, `/visao-completa`;
- validar mobile e desktop;
- preservar pan/zoom interno.

### 5.2 Cards superiores cortados

Causa provável:

- deslocamento visual aplicado diretamente ao viewport do React Flow;
- bounds de pan/zoom calculados sem espaço superior;
- labels/group boxes entrando no cálculo indevidamente.

Correção:

- remover transform/translate externo;
- revisar separação entre bounds visuais e bounds técnicos;
- confirmar que `personNode` comanda bounds de zoom quando aplicável.

### 5.3 Pan/zoom não funciona

Investigar:

- `panOnScroll`;
- `zoomOnScroll`;
- overlay de seleção de área ativo;
- elemento invisível interceptando eventos;
- `nodrag`/`nopan` em botões internos.

Correção:

- confirmar se seleção de área foi finalizada/cancelada;
- inspecionar z-index e pointer events;
- validar botões direcionais e zoom.

### 5.4 Genealogia/Visão Completa mobile com chips problemáticos

Arquivos:

```txt
src/app/pages/home/GenealogyMobileStageTabs.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts
```

Sintomas:

| Sintoma | Causa provável |
|---|---|
| Chip remove pessoas da árvore | `activeGenealogyGeneration` usado como filtro destrutivo. |
| Não aparece primeira geração real | cálculo de gerações disponíveis. |
| Cabeçalho não recuperável por pan | `translateExtent` restritivo. |
| Botões de zoom aparecem onde não devem | CSS condicional de `usesMobileGenerationStages`. |
| Árvore salta verticalmente entre chips | eixo Y não ancorado em referência comum. |

Regra:

- chips focam/enquadram, mas não removem colunas do React Flow;
- inferência de geração é visual e não persiste no Supabase.

### 5.5 Anel/ícone conjugal ausente ou inconsistente

Arquivos:

```txt
src/app/components/FamilyTree/MarriageNode.tsx
src/app/components/FamilyTree/GenealogySpouseEdge.tsx
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/directFamilyColors.ts
src/app/components/FamilyTree/types.ts
```

Verificar:

- ícone `Blend`;
- tamanho `60px × 60px`;
- `FAMILY_TREE_COLORS.EDGE_SPOUSE`;
- `visualVariant: 'direct-family'` apenas onde aplicável;
- clique abrindo `ViewMarriageModal`.

Não fazer:

- trocar o ícone por texto;
- aplicar a variante da Minha Árvore em todas as views sem validação;
- remover `stopPropagation`.

---

## 6. Paletas visuais da árvore

Arquivos:

```txt
src/app/pages/home/HomeHeader.tsx
src/app/components/FamilyTree/treeColorPalettes.ts
src/app/components/FamilyTree/visualTokens.ts
src/app/components/FamilyTree/directFamilyColors.ts
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Paleta não muda | `applyTreePalette`, CSS variables, `document.documentElement`. |
| Paleta não persiste | `TREE_COLOR_PALETTE_STORAGE_KEY`, `localStorage`. |
| Build passa, runtime quebra | referência a estado não declarado. |
| Contraste ruim em anel/linhas | tokens visuais e paletas. |

Regras:

- paleta não altera dados, filtros, rota, Supabase ou permissão;
- validar `white`, `orange` e `brown`;
- não aplicar migration para paleta.

---

## 7. Perfil, pessoa e admin

Arquivos prováveis:

```txt
src/app/pages/PersonProfile.tsx
src/app/pages/admin/AdminPessoaForm.tsx
src/app/pages/admin/AdminPessoas.tsx
src/app/components/person/
src/app/services/dataService.ts
src/app/services/personProfileSuggestionService.ts
src/app/services/permissionService.ts
```

### 7.1 Botão de editar aparece para pessoa errada

Investigar:

- `permissionService`;
- pessoa vinculada ao usuário;
- responsável pelo perfil;
- status admin;
- condição de renderização no `PersonProfile`.

Regra:

- botão visual não substitui permissão;
- usuário sem permissão deve enviar sugestão, não editar diretamente.

### 7.2 Sugestão de perfil não aparece no admin

Investigar:

```txt
person_profile_suggestions
personProfileSuggestionService.ts
/admin/solicitacoes-vinculos
RLS da migration correspondente
```

Verificar:

- status `pending`;
- usuário autenticado;
- `target_pessoa_id`;
- tela admin carregando pendências.

### 7.3 Reset de perfil removeu dado indevido

Investigar:

```txt
admin_reset_person_profile
20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql
dataService.ts
```

Regra crítica:

- reset não deve apagar relacionamentos familiares;
- remove foto, insights derivados, favoritos da pessoa e reseta preferências/flags previstas;
- executar apenas como admin.

### 7.4 Autocomplete de endereço não funciona

Arquivos:

```txt
src/app/components/person/AddressAutocompleteInput.tsx
src/app/utils/googleAddress.ts
```

Verificar:

- `VITE_GOOGLE_MAPS_API_KEY`;
- carregamento da API;
- fallback para input comum;
- erros no console.

Regra:

- ausência da chave não pode bloquear edição manual.

---

## 8. Relacionamentos e modal conjugal

Arquivos:

```txt
src/app/components/FamilyTree/modals/ViewMarriageModal.tsx
src/app/components/relationships/MarriageDetailsEditor.tsx
src/app/services/relationshipChangeRequestService.ts
src/app/services/personProfileSuggestionService.ts
src/app/pages/admin/AdminSolicitacoesVinculos.tsx
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Modal mostra ID técnico | `ViewMarriageModal`. |
| Texto público estranho | formatador de relacionamento conjugal. |
| Usuário comum alterou relacionamento real | `permissionService`, `relationshipChangeRequestService`. |
| Arquivo histórico do casamento não aparece | `relacionamento_id`, permissões e `ArquivosHistoricos`. |
| Dados conjugais somem ao salvar | `MarriageDetailsEditor`, `marriageForms`, payload do formulário. |

Regra:

- usuário comum solicita alteração;
- admin/responsável edita conforme permissão;
- observações internas não aparecem para usuário final.

---

## 9. Arquivos históricos e Storage

Arquivos:

```txt
src/app/components/ArquivosHistoricos.tsx
src/app/components/FotoUpload.tsx
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
docs/operacao/STORAGE_MAINTENANCE.md
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Upload falha | bucket, path, RLS, tamanho, MIME. |
| Preview some depois do upload | estado local do componente. |
| PDF não abre preview | fallback de PDF/URL. |
| Insert falha com `categoria_evento` | migration ausente no remoto. |
| Arquivo de casamento aparece em pessoa errada | `relacionamento_id` vs `pessoa_id`. |
| Base64 legado não renderiza | compatibilidade com data URL. |

Regras:

- novos arquivos usam Storage;
- não salvar novo base64;
- não remover base64 legado automaticamente;
- não mascarar migration ausente removendo campo do payload;
- limpeza de órfãos exige dry-run/auditoria.

---

## 10. Fórum

Arquivos:

```txt
src/app/pages/forum/ForumHome.tsx
src/app/pages/forum/ForumNovoTopico.tsx
src/app/pages/forum/ForumTopico.tsx
src/app/pages/forum/ForumEditarTopico.tsx
src/app/services/forumService.ts
src/app/services/notificationTriggersService.ts
```

### 10.1 Categoria/tipo na criação

Sintomas:

| Sintoma | Investigar |
|---|---|
| Dropdown de tipo voltou | `ForumNovoTopico.tsx`. |
| Categoria não seleciona | `categoriaId`, `listarCategoriasForum`. |
| Cards quebram no mobile | grid, `min-w-0`, `break-words`. |

Regra:

- tipo padrão é `discussao`;
- categoria é seleção única por botões/cards.

### 10.2 Pessoas relacionadas e menções

Sintomas:

| Sintoma | Investigar |
|---|---|
| Dropdown não fecha | listener de clique fora. |
| Busca não encontra pessoa com acento | normalização. |
| `@` não abre sugestões | `detectMention`. |
| Menção não vira link no tópico | `MentionedContent`. |
| Pessoa mencionada não vira relacionada | `addRelatedPerson`. |

Regra:

- menção usa `@Nome Completo`;
- pessoa mencionada também entra no conjunto de relacionadas;
- falha de notificação não bloqueia publicação.

### 10.3 Reações

Arquivos:

```txt
src/app/pages/forum/ForumTopico.tsx
src/app/services/forumService.ts
supabase/migrations/20260608180000_enforce_single_forum_reaction.sql
```

Sintomas:

| Sintoma | Causa provável |
|---|---|
| Usuário consegue duas reações no mesmo alvo | constraint ausente ou service alterado. |
| Clicar na mesma reação não remove | `reagirAoConteudo`. |
| Trocar reação duplica | delete anterior falhou. |
| Ícone de Orações quebra build | import incorreto; usar `Flower2`. |

Labels corretos:

```txt
curtir -> Amei
apoiar -> Apoiar
lembrar -> Orações
celebrar -> Parabéns
```

---

## 11. Notificações

Arquivos:

```txt
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/admin/AdminNotificacoes.tsx
src/app/services/notificationDispatchService.ts
src/app/services/notificationTriggersService.ts
src/app/services/notificationRecipientsService.ts
supabase/functions/
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Notificação não aparece | trigger, recipients, preferências, dispatch. |
| Autor recebe notificação da própria ação | `excludeActor`. |
| Menção e pessoa relacionada duplicam | deduplicação em `notifyForumTopicCreated`. |
| E-mail não envia | provider/secrets/Edge Function/log. |
| Preferência não salva | `NotificationPreferencesPanel`, RLS, service. |
| Falha de notificação quebra ação principal | try/catch no fluxo chamador. |

Regras:

- central é `/notificacoes`;
- preferências ficam em `/ajustar-notificacoes`;
- push/WhatsApp não devem fingir envio real;
- cron automático depende de configuração segura externa.

---

## 12. Favoritos

Arquivos:

```txt
src/app/components/favorites/FavoriteButton.tsx
src/app/services/favoritesService.ts
src/app/pages/MeusFavoritos.tsx
src/app/types/index.ts
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Botão não ativa | `isFavorite`, `entityType`, `entityId`. |
| Duplicidade de favorito | unique/upsert `user_id,entity_type,entity_id`. |
| Remoção não reflete na UI | estado local, `onChange`, reload da lista. |
| Metadata sensível salva | `sanitizeMetadata`. |
| Filtro da página mostra categoria sem item real | expansão parcial de tipos. |

Regras:

- pessoa é a primeira camada funcional;
- tipos futuros já existem em `FavoriteEntityType`, mas botões reais dependem de validação por entidade;
- não salvar telefone, URL sensível, token, base64 ou dado privado em `metadata`.

---

## 13. Calendário familiar e Google Agenda

Arquivos:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
src/app/services/googleCalendarService.ts
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Calendário sem eventos | `criarEventosDoCalendario`, filtros ativos, dados de pessoas/relacionamentos. |
| Filtros mobile não aparecem | `MOBILE_CALENDAR_LEGEND_ITEMS`, breakpoint `md:hidden`. |
| Texto de idade errado | formatadores de aniversário/falecimento. |
| Google Agenda não conecta | Edge Function/OAuth/env/secrets. |
| Sincronização não cria eventos | service, token, opções de aniversários/memórias. |

Regras:

- título da página deve ser **Calendário**;
- filtros mobile ficam acima do grid;
- card Google Agenda pode ficar recolhido no mobile;
- tokens OAuth não devem ir para frontend.

---

## 14. Exportação da árvore

Arquivos:

```txt
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx
src/app/components/FamilyTree/utils/treeExport.ts
src/app/components/FamilyTree/FamilyTree.tsx
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Seleção não inicia | ref/actions do `FamilyTree`, botão Ações/Home. |
| Canvas vem vazio | elemento raiz, timing, `html2canvas`. |
| Overlay aparece na exportação | atributos/filtros de exportação. |
| PDF corta área | dimensões do canvas e cálculo do PDF. |
| Pan/zoom fica travado | seleção não foi finalizada/cancelada. |

Regras:

- exportação atual é de área visível/selecionada;
- árvore completa é evolução futura;
- sem Storage e sem migration.

---

## 15. Supabase, migrations e RLS

Documentação operacional:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

Sintomas:

| Sintoma | Investigar |
|---|---|
| Campo enviado não existe | migration ausente no remoto. |
| RPC não existe | migration não aplicada ou search path errado. |
| Usuário comum lê/escreve indevidamente | RLS/policies. |
| Admin não consegue executar RPC | grants, `is_admin_user`, auth. |
| `db push` quer aplicar alteração inesperada | migration list/diff antes de prosseguir. |

Regras:

- `supabase/migrations` é a fonte da verdade;
- scripts SQL soltos são históricos/operacionais;
- não criar migration para ajuste visual;
- não usar service role no frontend;
- não versionar secrets/dumps/tokens.

---

## 16. Procedimento para hotfix seguro

1. Reproduzir sintoma.
2. Rodar `git status --short`.
3. Rodar `npm run build`.
4. Corrigir a menor causa real.
5. Rodar `npm run build` novamente.
6. Rodar `git diff --check`.
7. Se envolver banco, revisar `supabase migration list`.
8. Se envolver rota crítica, testar fluxo manualmente.
9. Documentar apenas se a regra for recorrente.

Para commit localizado:

```bash
git status --short
git diff --check
npm run build
git add <arquivos-especificos>
git commit -m "fix: describe the concrete fix"
git pull --rebase origin main
git push origin main
```

Não usar `git add .`.
