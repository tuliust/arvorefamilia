# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-11
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Projeto: `tuliust/arvorefamilia`
> Status: plano vivo revisado contra o código atual após fechamento de divergências documentais, persistência de `pessoas.complemento`, validação de IA/Curiosidades, operação temporária de Google OAuth em modo testes, ajustes mobile da árvore, Mapa Familiar em busca/favoritos e migrations versionadas de `pessoas.genero` e `pessoas.complemento`.

## Objetivo

Este documento registra apenas:

- pendências reais encontradas durante revisão documental, QA visual ou implementação;
- divergências entre documentação e implementação;
- ações futuras que não devem ser executadas sem decisão explícita;
- pontos de QA, migration, refatoração ou melhoria identificados durante auditoria técnica;
- pendências remanescentes após ajustes de mobile, fórum, favoritos, deploy/cache, Mapa Familiar e documentação.

O estado consolidado do que já está implementado deve permanecer em `docs/GUIA_IMPLEMENTACOES.md`.

---

## 1. Situação atual

A documentação canônica do projeto foi reorganizada por tipo de informação:

- estado consolidado em `docs/GUIA_IMPLEMENTACOES.md`;
- comportamento funcional específico em `docs/funcionalidades/*.md`;
- padrões visuais em `docs/GUIA_UX_LAYOUT.md`;
- responsabilidades de componentes em `docs/GUIA_COMPONENTES.md`;
- operação, deploy, migrations e storage em `docs/operacao/*.md`;
- pendências reais neste arquivo.

Estado técnico atual das views da árvore:

| View | Rota | Estado |
|---|---|---|
| Minha Árvore | `/minha-arvore` | Implementada; ReactFlow no desktop/tablet e `MobileFamilyTreeView` no mobile. |
| Mapa Familiar | `/mapa-familiar` | Implementada tecnicamente como view protegida; usa `DesktopFamilyMapView` no desktop/tablet, fallback para `MobileFamilyTreeView` no mobile, modo wide com painel colapsado, título ocultável por scroll, avatares por `genero`, busca global e favoritos de página. QA visual autenticado segue pendente. |
| Genealogia | `/genealogia` | Implementada; chips mobile usam base de gerações inferidas. |
| Visão Completa | `/visao-completa` | Implementada; chips mobile usam base de gerações inferidas. |

Durante revisões anteriores, foram fechadas tecnicamente frentes que antes apareciam como pendências documentais:

- chips mobile de Genealogia/Visão Completa passaram a usar a mesma base de gerações inferidas que alimenta a árvore;
- strings quebradas por encoding em `MinhaArvore.tsx` foram corrigidas na origem e o workaround global `textEncodingRepair` foi removido;
- múltiplas redes sociais passaram a ser carregadas e persistidas em `pessoa_social_profiles`, mantendo compatibilidade com os campos legados da primeira rede;
- a exportação mobile rápida passou a reutilizar o fluxo canônico de `treeExport.ts`;
- a Minha Árvore mobile segmentada foi reestruturada para malha 3×3 com abas `Paterno | Central | Materno`, tela global de ancestrais, primos sem **Ver todos** e preview parcial durante swipe;
- a nova view `Mapa Familiar` foi adicionada como experiência panorâmica desktop/tablet baseada nos cards visuais compartilhados e na paleta **Visual**.

Permanecem como pendências abertas apenas itens ainda não resolvidos por código, decisão de produto, QA visual ou validação externa.

---

## 2. Pendências abertas

| ID | Documento/origem | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| DOC-014 | `/mapa-familiar` / `DesktopFamilyMapView.tsx` | QA visual manual autenticado | **1. Mapa Familiar - QA visual e correções finais.** Validar alinhamento panorâmico, conectores, grupos laterais, painel colapsado, centralização, colisões, margens, desktop/tablet, exportação e resoluções reais com dados autenticados. | Aberto - pendência principal |

Regras:

- não duplicar essas pendências em outros documentos;
- documentos funcionais podem mencionar o contexto, mas o controle fica nesta tabela;
- fechar item apenas após validação técnica, QA visual ou decisão explícita;
- se houver alteração de schema, criar migration e atualizar `docs/operacao/MIGRATIONS_SUPABASE.md`.

### 2.0.1 Observação contra o código atual

Na revisão atual, as divergências anteriores foram fechadas:

- `/mapa-familiar` já consta em `GLOBAL_SEARCH_PAGES`;
- `/mapa-familiar` já consta em `FAVORITE_PAGES`;
- `public.pessoas.genero` já existe no banco e possui migration versionada em `supabase/migrations/20260611003558_add_genero_to_pessoas.sql`;
- `public.pessoas.complemento` já existe no banco, possui migration versionada em `supabase/migrations/20260611013000_add_complemento_to_pessoas.sql` e é persistido pelos formulários de edição do próprio perfil;
- `docs/funcionalidades/FORUM.md` já descreve a UI atual sem dropdowns de tipo/status na listagem e sem badges legadas de tipo/status nos tópicos;
- IA/Curiosidades já foi validada no escopo funcional atual;
- Google OAuth/Agenda já foi reclassificado como operação temporária em modo **Testing**, com cadastro manual de test users no Google Cloud até a autorização externa.

Portanto, busca/favoritos do Mapa Familiar, versionamento básico de `pessoas.genero`, persistência de `pessoas.complemento`, documentação do Fórum, validação de IA/Curiosidades, operação temporária de Google OAuth, navegação contextual e exportação do Mapa Familiar deixam de ser pendências abertas. Permanece como pendência principal apenas o QA visual autenticado do Mapa Familiar; CSS/layout residual é manutenção incremental.


---

## 2.1 Itens fechados, obsoletos ou reclassificados

| ID | Documento/origem | Resultado | Status |
|---|---|---|---|
| DOC-001 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | `HomeTreeSection.tsx` passou a calcular a base mobile de Genealogia/Visão Completa com gerações inferidas antes de montar chips e antes de repassar pessoas ao `FamilyTree`. | Concluído tecnicamente; manter QA visual mobile. |
| DOC-002 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Strings quebradas por encoding foram corrigidas na origem e `textEncodingRepair.ts` foi removido. | Concluído. |
| DOC-003 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | `Complemento` deixou de ser campo visual/local e passou a persistir em `public.pessoas.complemento`, separado do endereço principal preenchido pelo Google Places. Migration versionada em `20260611013000_add_complemento_to_pessoas.sql`. | Concluído tecnicamente. |
| DOC-004 | `/minha-arvore` mobile ReactFlow | Reclassificado como obsoleto para a rota mobile principal, pois `/minha-arvore` mobile deixou de depender do desenho inferior ReactFlow e usa `MobileFamilyTreeView`. Se o ReactFlow mobile voltar a ser usado, reabrir com novo escopo. | Obsoleto/substituído. |
| DOC-005 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | `MobileTreeControlsPortal` passou a usar o fluxo canônico de `treeExport.ts` para imagem, PDF e impressão. | Concluído tecnicamente; manter QA de captura em mobile. |
| DOC-006 | `docs/funcionalidades/FORUM.md` | A documentação do Fórum foi alinhada ao comportamento esperado da UI atual: listagem com busca, categoria e limpar filtros; dropdowns de tipo/status e badges legadas permanecem fora da superfície visual salvo nova decisão de produto. | Fechado como divergência documental. |
| DOC-009 | `src/app/pages/home/homeAiContext.ts` / `api/ai.ts` | IA/Curiosidades foi validada no escopo funcional atual, com contexto estruturado, ausência de IDs na resposta esperada, tratamento de falha e preservação do modal. | Concluído. |
| DOC-010 | Google Agenda/OAuth | Compliance público reclassificado como resolvido no escopo documental atual. Até a aprovação externa do Google, a integração deve operar em modo **Testing**, com e-mails cadastrados manualmente como test users no Google Cloud. | OK / operação temporária documentada. |
| DOC-011 | `api/ai.ts` / `docs/operacao/DEPLOYMENT.md` | Variáveis server-side e rewrite `/api/*` foram revisados/validados no escopo atual. Manter secrets fora do frontend e tratar novas mudanças como manutenção operacional. | Concluído. |
| DOC-012 | `docs/funcionalidades/CURIOSIDADES_E_IA.md` | Documento funcional de Curiosidades e IA alinhado ao estado validado atual. Novas mudanças devem entrar como requisito específico, não como pendência aberta herdada. | Concluído. |
| DOC-013 | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` / `/minha-arvore` mobile segmentada | Reclassificado: a implementação atual usa malha 3×3, abas `Paterno | Central | Materno`, tela global de ancestrais, primos sem **Ver todos**, linhas Pai/Mãe acompanhando scroll e preview durante swipe. Pendências residuais devem ser registradas como bug visual específico, não como “finalizar sete telas”. | Concluído tecnicamente; manter QA visual manual. |
| DOC-021 | `MobileFamilyTreeView.tsx` / conectores mobile | Conectores entre ancestrais, Pai/Mãe e pessoa central ajustados para acompanhar o contexto rolável da tela Central. | Concluído tecnicamente; manter QA visual manual em 320px, 375px, 390px e 430px. |
| DOC-022 | `MobileFamilyTreeView.tsx` / cards mobile | Cards mobile passaram a exibir apenas ano em nascimento/falecimento e o card central não exibe badge **Você**. | Concluído tecnicamente; manter QA visual manual. |
| DOC-023 | `FamilyTreeVisualCards.tsx` / `MobileFamilyTreeView.tsx` | Avatares mobile passaram a reutilizar a lógica visual de foto real e fallback por `genero` (`homem`, `mulher`, `pet`). | Concluído tecnicamente; migration de `pessoas.genero` versionada em `20260611003558_add_genero_to_pessoas.sql`. |
| DOC-015 | `/mapa-familiar` busca/favoritos | `Mapa Familiar` foi incluído em `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES`, permitindo busca global e favorito de página para a rota canônica `/mapa-familiar`. | Concluído. |
| DOC-018 | `pessoas.genero` | A coluna `public.pessoas.genero` foi confirmada no banco e versionada em `supabase/migrations/20260611003558_add_genero_to_pessoas.sql`, com comentário e índice parcial `idx_pessoas_genero`. | Concluído tecnicamente; manter coerência entre `genero` visual e `humano_ou_pet` sem substituir regra semântica. |
| DOC-007 / DOC-008 | CSS/layout da árvore | Overrides mobile comprovadamente duplicados foram removidos. O restante permanece escopado e deve migrar incrementalmente para componentes, tokens ou cálculo estrutural somente com QA visual. | Parcialmente resolvido; manter manutenção incremental sem bloquear MVP. |
| DOC-016 | `/mapa-familiar` exportação | `DesktopFamilyMapView` passou a expor `FamilyTreeActions` e a capturar seu root HTML/CSS/SVG específico para PNG, PDF e impressão. O helper canônico resolve alvo explícito, Mapa Familiar, ReactFlow e fallback, mantendo `useCORS: true` e `allowTaint: false`. | Concluído tecnicamente; manter QA manual de exportação. |
| DOC-017 / DOC-020 | laterais e painel colapsado do Mapa Familiar | Consolidados em `DOC-014`, pois dependem do mesmo QA visual autenticado com dados reais. | Reclassificados no QA visual principal. |
| DOC-019 | documentação do Mapa Familiar | Documentação canônica sincronizada com navegação contextual, exportação HTML/CSS/SVG e manutenção incremental de layout. | Concluído nesta revisão. |
| DOC-024 | Navegação preservando contexto da view | Perfis abertos a partir de `/minha-arvore`, `/mapa-familiar`, `/genealogia` e `/visao-completa` recebem `?voltar=...`; retornos e navegação entre parentes preservam a view com fallback interno seguro. | Concluído tecnicamente; manter QA manual de navegação por view. |

---

## 3. Frente mobile atual - estado e QA

Estado técnico da frente mobile:

```txt
Concluída para o shell mobile geral, controles mobile principais e Minha Árvore mobile segmentada em malha 3×3. Manter QA visual manual por breakpoint e abrir bugs específicos se forem encontrados problemas residuais.
```

Arquivos relevantes:

```txt
src/main.tsx
src/styles/family-tree-mobile.css
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
src/styles/mobile-tree-lines.css
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/components/FamilyTree/FamilyTreeVisualCards.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Ajustes concluídos:

- modal de dica/login com fundo da página e overlay preto;
- título mobile personalizado no header da árvore;
- padronização de setas da árvore no mobile;
- remoção de texto overlay redundante sobre a árvore no mobile;
- remoção do anel azul duplicado no card principal;
- painel mobile de controles da árvore;
- exportação mobile rápida alinhada ao fluxo canônico de `treeExport.ts`;
- opção de ocultar/exibir setas mobile;
- paleta de cores no menu mobile;
- reset de geração ativa em `/genealogia` e `/visao-completa`;
- chips mobile de Genealogia/Visão Completa alinhados à base de gerações inferidas em `HomeTreeSection.tsx`;
- acabamento mobile de `/minha-arvore/editar`;
- CSS de edição escopado por `main:has(#minha-arvore-edit-form)`;
- menu mobile da árvore ajustado para exibir Visualização e Cores sem sobreposição;
- toggle compacto das views da árvore no menu mobile;
- `MobileFamilyTreeView` renderizado quando `isMobile` e `treeViewMode` é `minha-arvore` ou `mapa-familiar`;
- malha mobile com `Paterno | Central | Materno`;
- tela global de ancestrais acima da Central;
- tios e primos em telas laterais/derivadas;
- primos sem botão **Ver todos**, com rolagem vertical interna;
- preview parcial durante swipe;
- conectores entre ancestrais, Pai/Mãe e pessoa central acompanhando o contexto rolável da tela Central;
- cards mobile com apenas ano de nascimento/falecimento;
- card central mobile sem badge **Você**;
- avatares mobile reutilizando foto real e fallback visual por `genero` (`homem`, `mulher`, `pet`).

Validação visual ainda recomendada, sem bloquear tecnicamente:

```txt
320px
375px
390px
430px
768px
desktop
```

Rotas prioritárias para QA visual:

```txt
/minha-arvore
/mapa-familiar
/genealogia
/visao-completa
/minha-arvore/editar
/meus-favoritos
/calendario-familiar
/forum
/forum/topico/:id
/notificacoes
```

---

## 4. Pendência específica: Mapa Familiar

### Contexto

`/mapa-familiar` é uma view protegida por `TreeAccessRoute` e possui documento funcional canônico próprio:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

Estado técnico atual:

- rota `/mapa-familiar` adicionada em `src/app/routes.tsx`;
- view mode `mapa-familiar` em `treeViewMode.ts`;
- renderização desktop/tablet em `DesktopFamilyMapView.tsx`, sem ReactFlow;
- fallback mobile para `MobileFamilyTreeView.tsx` em `HomeTreeSection.tsx`, com conectores roláveis da tela Central, cards com apenas ano, card central sem badge e avatares por `genero`;
- cards compartilhados em `FamilyTreeVisualCards.tsx`;
- layout centralizado em `FAMILY_MAP_LAYOUT`;
- modo wide em `getFamilyMapLayout(true)` quando o painel lateral é colapsado;
- conectores principais SVG derivados de âncoras;
- conectores internos de cônjuges derivados de relacionamentos `conjuge` explícitos;
- zoom manual por `Ctrl + scroll`;
- grupos expansíveis sem scroll interno apertado;
- tios/primos laterais com até 4 colunas e limite inicial de 8 cards;
- paleta `visual` disponível junto de `white`, `orange` e `brown`;
- avatares visuais orientados por `pessoas.genero` quando disponível;
- avatar feminino fallback revisado em `FamilyTreeVisualCards.tsx`, preservando homem e pet;
- título desktop do Mapa Familiar ocultado quando o scroll interno passa de 24px;
- badge `PESSOA CENTRAL` removida do card central via `showLabel={false}`;
- `vitalMode="full"` aplicado aos grupos no modo wide para exibir local + ano quando houver espaço.

### Critérios de QA manual

Validar após login em:

```txt
1366x768
1440x900
1536x864
1920x1080
768px a 1023px quando possível
```

Checklist:

- seletor mostra **Mapa Familiar**;
- rota `/mapa-familiar` abre corretamente;
- search param `?pessoa=...` é preservado;
- título desktop mostra `Mapa Familiar de {primeiro nome}`;
- fundo do título e da árvore usam o mesmo azul claro;
- árvore panorâmica aparece sem swipe no desktop/tablet;
- Pai, Pessoa Central e Mãe ficam no eixo principal;
- grupos laterais de tios/primos não invadem a área central;
- grupos laterais preservam margem mínima e não cortam nas bordas;
- com painel lateral colapsado, o canvas continua centralizado e não fica preso à esquerda;
- com painel lateral colapsado, margens paterna e materna permanecem proporcionais;
- cônjuge, pets, irmãos/sobrinhos e filhos/netos não se sobrepõem no ramo inferior;
- tios/primos usam 4 colunas e até 8 cards iniciais;
- botão `+/-` expande/recolhe grupos extensos;
- grupos unitários não ficam estreitos demais nem largos demais;
- cônjuge principal aparece mesmo com filtro **Cônjuges** desativado;
- cônjuges de ancestrais aparecem por padrão;
- cônjuges colaterais aparecem apenas com filtro **Cônjuges** ativo;
- conectores internos ligam apenas cônjuges reais;
- conectores principais estão claros e alinhados;
- conectores internos de cônjuges são mais escuros que os conectores principais;
- avatares respeitam `genero = homem`, `genero = mulher` e `genero = pet`;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não sofrem regressão.

### Pendências técnicas relacionadas

- Verificar inclusão de **Mapa Familiar** em `GLOBAL_SEARCH_PAGES`.
- Verificar inclusão de **Mapa Familiar** em `FAVORITE_PAGES`.
- Decidir se `DesktopFamilyMapView` deve participar do fluxo de exportação da árvore.
- Confirmar migration e tipagem para `pessoas.genero`.
- Validar visualmente os grupos laterais após cada ajuste de `FAMILY_MAP_LAYOUT.areas.left/right`.
- Validar visualmente `areas.lowerLeft`, `areas.lowerMiddle`, `areas.lowerRight` e `groups.spouse/pets/siblings/nephews/children/grandchildren` após qualquer ajuste do painel colapsado.

---

## 5. Pendência específica: filtros da home do fórum

### Contexto

A documentação atual de fórum prevê que `/forum` exiba:

- busca textual;
- dropdown de categoria;
- botão compacto icon-only para limpar filtros.

Os dropdowns de tipo e status devem ficar fora da UI.

### Estado observado

Após solicitação de ajuste, a validação visual indicou que a interface ainda não refletiu a remoção dos dropdowns de:

- **Todos os tipos**;
- **Todos os status**.

### Critério de aceite

Em `/forum`, o bloco de filtros deve ter:

```txt
[Buscar por termo] [Todas as categorias] [ícone limpar filtros]
```

Em mobile, os controles podem quebrar linha conforme largura, mas não devem reintroduzir tipo/status.

### Regras

- `tipo` e `status` podem continuar existindo em `forum_topicos` por compatibilidade técnica;
- `ForumTopicoFiltros` pode continuar aceitando tipo/status para service/legado, se necessário;
- a UI da home do fórum não deve exibir dropdowns de tipo/status sem decisão explícita de produto;
- o botão de limpar filtros deve possuir `aria-label` e `title`.

---

## 6. Pendências específicas: árvore, IA e OAuth

### 6.1 Consolidação de CSS visual da árvore

A camada `src/styles/family-tree-visual-polish.css` acumulou ajustes de:

- cores de linhas e conectores;
- largura visual de cards compactos na `/minha-arvore`;
- deslocamento de cards do lado direito em direção ao centro;
- quebra de nomes longos sem reticências;
- estabilização de tooltip em modal;
- overrides antigos relacionados à home pública.

Estado após auditoria:

- regras mobile duplicadas e integralmente sobrescritas foram removidas de `family-tree-mobile.css`;
- `family-tree-visual-polish.css` continua escopado por root/view nas regras da árvore;
- seletores frágeis ainda existentes não foram migrados agressivamente sem QA visual autenticado;
- a dívida deixou de ser bloqueio do MVP e passa a ser manutenção incremental.

Direção de manutenção:

- mover regras estáveis para componentes, tokens ou cálculos de layout;
- reduzir seletores baseados em `style*="width: 340px"` e `translate(...)`;
- preservar isolamento de `/minha-arvore`;
- validar que `/genealogia` e `/visao-completa` não herdam ajustes da view direta;
- não conflitar com a composição HTML/SVG de `/mapa-familiar`.

### 6.2 Cards compactos de `360px` na `/minha-arvore`

A decisão visual recente ampliou cards compactos de grupos laterais/inferiores para `360px`.

Critérios de QA:

- pais, irmãos, sobrinhos, cônjuge, filhos, netos e pets legíveis;
- avós, bisavós, tios e primos sem linhas horizontais excessivamente longas;
- cards do lado direito crescendo em direção ao centro;
- nomes longos com quebra natural e sem `...` prematuro;
- card central da pessoa foco sem ampliação indevida;
- nenhuma alteração visual herdada por `/genealogia` ou `/visao-completa`.

### 6.3 IA e Curiosidades

Perguntas prioritárias para validação:

```txt
Quem são meus bisavós paternos?
Quantas pessoas nasceram em Recife?
Quem são os irmãos de Márcio Ailton?
Quais são as pessoas mais antigas?
Quais cidades aparecem mais vezes como local de nascimento?
Monte um resumo da linha genealógica de Tulius.
```

Critérios:

- resposta sem UUIDs ou IDs técnicos;
- uso de `você/seu/sua` quando a referência for a pessoa central;
- ausência de inferência sobre saúde, dinheiro, orientação sexual, aparência ou acusações;
- fallback determinístico quando o dado estiver no contexto estruturado;
- falha da IA não deve quebrar o modal.

### 6.4 Google Agenda/OAuth

Estado atual:

- `/entrar` mostra **Família Souza Barros** como nome principal do app;
- `/entrar` explica que a plataforma organiza árvore, perfis, fotos, documentos, memórias e datas familiares;
- o parágrafo específico sobre Google Agenda foi removido de `/entrar`;
- a integração com Google Agenda permanece funcional quando configurada no Calendário Familiar.

Critérios para considerar a pendência fechada:

- produto/compliance decide onde a finalidade da integração deve ser declarada publicamente, caso a revisão OAuth exija essa comunicação;
- a superfície escolhida deve ser rastreável no código e acessível conforme exigência de validação;
- não reintroduzir o parágrafo de Google Agenda em `/entrar` sem decisão explícita;
- domínio, nome do app e finalidade declarada devem permanecer coerentes com a tela de consentimento OAuth.

---

## 7. Backlog futuro confirmado

| Frente | Direção futura | Status |
|---|---|---|
| Favoritos expandidos | Avaliar favoritos para arquivos históricos, relacionamentos, fórum, eventos, páginas, timeline, histórias e Mapa Familiar. | A confirmar por uso real. |
| Busca global | Manter páginas principais sincronizadas com `GLOBAL_SEARCH_PAGES`, incluindo novas rotas como `/mapa-familiar`. | Manutenção contínua. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado e cron externo automatizado. | Pós-MVP. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. | Pós-MVP. |
| Timeline avançada | Upload por evento, privacidade por evento e exportação PDF. | Pós-MVP. |
| Exportação avançada | Exportar árvore completa, PDF multipágina ou processamento server-side. A captura atual do Mapa Familiar HTML/CSS/SVG já está implementada. | Pós-MVP. |
| Parentesco avançado | Integração visual direta na árvore, Genealogia, Mapa Familiar e Visão Completa. | Pós-MVP. |
| Fórum avançado | Moderação ampliada, busca refinada, anexos e filtros adicionais. | Pós-MVP. |
| Home dinâmica | Aniversários, memórias do dia, novidades e destaques. | Pós-MVP. |
| Admin Integridade | Filtros por severidade, paginação e ações assistidas. | Pós-MVP técnico. |
| Storage legado | Prevenir uploads órfãos e avaliar limpeza auditada de legado/base64. | Pós-MVP técnico. |

---

## 8. Critérios permanentes de bloqueio

- build quebrado;
- login quebrado;
- usuário comum acessando área admin;
- usuário comum alterando dado restrito diretamente;
- RLS liberando escrita indevida;
- perda ou corrupção de dados;
- secret, dump, token, backup sensível ou service role no frontend/repositório;
- migration obrigatória ausente no ambiente final;
- divergência crítica entre documentação e implementação;
- documentação canônica orientando ação insegura de Supabase, Storage, Auth ou migrations;
- responsividade impedindo uso em mobile;
- árvore principal, Mapa Familiar, perfil de pessoa, fórum, notificações ou edição da própria árvore inutilizáveis.

---

## 9. Regras para alteração documental

- não alterar código do sistema durante uma frente apenas documental;
- não aplicar migration;
- não alterar dados reais;
- não criar usuário;
- não fazer validação visual autenticada quando a tarefa for apenas revisão documental;
- comparar documentação com código, rotas, componentes, services, hooks, migrations e fluxos reais quando necessário;
- registrar neste plano apenas pendências reais encontradas durante a revisão;
- evitar duplicação entre documentos;
- preservar alertas de segurança, Supabase, RLS, migrations e dados reais.

---

## 10. Controle da revisão documental

| Ordem | Documento | Status | Observações |
|---:|---|---|---|
| 1 | `docs/arquitetura/ROTAS_E_GUARDS.md` | Revisado nesta rodada | Inclui `/mapa-familiar`, `TreeAccessRoute`, quatro views e contrato atualizado de `TreeViewMode`. |
| 2 | `docs/arquitetura/ARCHITECTURE.md` | Revisado nesta rodada | Inclui `DesktopFamilyMapView`, `FamilyTreeVisualCards`, fallback mobile e paleta `visual`. |
| 3 | `docs/README.md` | Revisado nesta rodada | Índice atualizado para Mapa Familiar, ajustes mobile e remoção do texto de Google Agenda de `/entrar`. |
| 4 | `docs/PLANO_PROXIMOS_PASSOS.md` | Revisado nesta rodada | DOC-010 ajustado e DOC-021/DOC-022/DOC-023 registrados como concluídos tecnicamente. |
| 5 | `docs/GUIA_IMPLEMENTACOES.md` | Revisado nesta rodada | Inclui Mapa Familiar, ajustes mobile de conectores, anos nos cards, card central sem badge e avatares por `genero`. |
| 6 | `docs/GUIA_UX_LAYOUT.md` | Revisado nesta rodada | Inclui UX do Mapa Familiar, grupos expansíveis, laterais, zoom, avatares e cônjuges. |
| 7 | `docs/GUIA_COMPONENTES.md` | Revisado nesta rodada | Inclui `DesktopFamilyMapView`, `FamilyTreeVisualCards`, `VisualGroup`, conectores e avatares por `genero`. |
| 8 | `docs/funcionalidades/FORUM.md` | Revisar conforme DOC-006 | Pendência de filtros tipo/status na home do fórum. |
| 9 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | Revisado nesta rodada | Documenta exportação HTML/CSS/SVG do Mapa Familiar e fechamento técnico de DOC-016. |
| 10 | `docs/funcionalidades/FAVORITOS.md` | Revisar conforme DOC-015 | Sincronizar Mapa Familiar com favoritos, se implementado. |

---

## 11. Comandos para commit documental

Executar apenas quando todos os arquivos revisados forem substituídos manualmente:

```bash
git status --short
git diff --check
npm run build
```

Commit sugerido para esta atualização documental específica:

```bash
git add docs/funcionalidades/MAPA_FAMILIAR_VIEW.md

git add docs/GUIA_COMPONENTES.md

git add docs/GUIA_IMPLEMENTACOES.md

git add docs/GUIA_UX_LAYOUT.md

git add docs/PLANO_PROXIMOS_PASSOS.md

git commit -m "docs: atualiza guias do mapa familiar"

git pull --rebase origin main

git push origin main
```

Não usar `git add .`.
