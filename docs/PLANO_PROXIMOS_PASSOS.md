# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-10
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Projeto: `tuliust/arvorefamilia`
> Status: plano vivo revisado após inclusão da view `/mapa-familiar`, reclassificação das pendências antigas da Minha Árvore mobile e abertura de pendências específicas para QA, busca/favoritos e exportação do Mapa Familiar.

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
| Mapa Familiar | `/mapa-familiar` | Implementada tecnicamente como view protegida; usa `DesktopFamilyMapView` no desktop/tablet e fallback para `MobileFamilyTreeView` no mobile. QA visual autenticado segue pendente. |
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
| DOC-003 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | melhoria futura / decisão pendente | Definir se `Complemento` deve persistir em schema próprio. As múltiplas redes sociais já persistem em `pessoa_social_profiles`; a pendência restante é apenas o campo visual `Complemento`. | Parcial |
| DOC-006 | `src/app/pages/forum/ForumHome.tsx` / `docs/funcionalidades/FORUM.md` | divergência UI/documentação | Aplicar ou revisar a remoção real dos dropdowns **Todos os tipos** e **Todos os status** em `/forum`. A UI esperada deve manter apenas busca, categoria e botão icon-only de limpar filtros ao lado do dropdown de categoria. | Aberto |
| DOC-007 | `src/styles/family-tree-visual-polish.css` / `docs/GUIA_UX_LAYOUT.md` | dívida técnica / refatoração visual | Consolidar overrides acumulados de `family-tree-visual-polish.css` em componentes, tokens ou layouts estruturais quando a UI estabilizar. | Aberto |
| DOC-008 | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` | melhoria técnica / layout | Migrar a ampliação visual dos cards compactos da `/minha-arvore` para cálculo estrutural do layout, incluindo cards de `360px`, crescimento em direção ao centro e linhas de tios/primos, reduzindo dependência de CSS por seletor. | Aberto |
| DOC-009 | `src/app/pages/home/homeAiContext.ts` / `api/ai.ts` | QA funcional / IA | Validar em produção ou preview as respostas de IA para perguntas genealógicas prioritárias, garantindo ausência de IDs e de inferências sensíveis. | Aberto |
| DOC-010 | `/entrar` / Google OAuth | compliance / validação externa | Confirmar se a home pública exibe no DOM/JSX o nome **Família Souza Barros** e a finalidade da integração com Google Agenda de forma compatível com a revisão OAuth do Google. | Aberto |
| DOC-011 | `api/ai.ts` / `docs/operacao/DEPLOYMENT.md` | operação / secrets | Confirmar variáveis server-side da IA no provedor de deploy, como `OPENAI_API_KEY` e modelo configurado, sem exposição no frontend e sem fallback SPA capturar `/api/*`. | Aberto |
| DOC-012 | `docs/funcionalidades/CURIOSIDADES_E_IA.md` | documentação / manutenção | Manter o documento de Curiosidades e IA sincronizado com `HomeCuriositiesDialog`, `ConnectionDiscoveryPanel`, `AiQuestionPanel`, `homeAiContext` e `api/ai.ts`. | Aberto |
| DOC-014 | `/mapa-familiar` / `DesktopFamilyMapView.tsx` | QA visual manual autenticado | Validar a nova view panorâmica após login em desktop/tablet: seletor, rota, preservação de `?pessoa=...`, alinhamento, conectores, grupos roláveis, paleta Visual e fallback mobile. | Aberto |
| DOC-015 | `/mapa-familiar` busca/favoritos | ajuste técnico / consistência de navegação | Verificar e, se necessário, incluir `Mapa Familiar` em `GLOBAL_SEARCH_PAGES` e `FAVORITE_PAGES`, para aparecer na busca global e poder ser favoritado como as demais views da árvore. | Aberto |
| DOC-016 | `/mapa-familiar` exportação | decisão de produto / implementação futura | Decidir se a exportação canônica deve capturar a view HTML/SVG do Mapa Familiar. Enquanto não houver implementação, documentar que exportação segue focada nas views ReactFlow. | Aberto |

Regras:

- não duplicar essas pendências em outros documentos;
- documentos funcionais podem mencionar o contexto, mas o controle fica nesta tabela;
- fechar item apenas após validação técnica, QA visual ou decisão explícita;
- se houver alteração de schema, criar migration e atualizar `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 2.1 Itens fechados, obsoletos ou reclassificados

| ID | Documento/origem | Resultado | Status |
|---|---|---|---|
| DOC-001 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | `HomeTreeSection.tsx` passou a calcular a base mobile de Genealogia/Visão Completa com gerações inferidas antes de montar chips e antes de repassar pessoas ao `FamilyTree`. | Concluído tecnicamente; manter QA visual mobile. |
| DOC-002 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Strings quebradas por encoding foram corrigidas na origem e `textEncodingRepair.ts` foi removido. | Concluído. |
| DOC-004 | `/minha-arvore` mobile ReactFlow | Reclassificado como obsoleto para a rota mobile principal, pois `/minha-arvore` mobile deixou de depender do desenho inferior ReactFlow e usa `MobileFamilyTreeView`. Se o ReactFlow mobile voltar a ser usado, reabrir com novo escopo. | Obsoleto/substituído. |
| DOC-005 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | `MobileTreeControlsPortal` passou a usar o fluxo canônico de `treeExport.ts` para imagem, PDF e impressão. | Concluído tecnicamente; manter QA de captura em mobile. |
| DOC-013 | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` / `/minha-arvore` mobile segmentada | Reclassificado: a implementação atual usa malha 3×3, abas `Paterno | Central | Materno`, tela global de ancestrais, primos sem **Ver todos**, linhas Pai/Mãe acompanhando scroll e preview durante swipe. Pendências residuais devem ser registradas como bug visual específico, não como “finalizar sete telas”. | Concluído tecnicamente; manter QA visual manual. |

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
- linhas laterais de Pai/Mãe acompanhando o scroll da tela central.

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

`/mapa-familiar` é uma nova view de árvore protegida por `TreeAccessRoute`.

Estado técnico atual:

- rota adicionada em `src/app/routes.tsx`;
- view mode `mapa-familiar` em `src/app/components/FamilyTree/treeViewMode.ts`;
- renderização desktop/tablet em `src/app/components/FamilyTree/DesktopFamilyMapView.tsx`;
- fallback mobile para `MobileFamilyTreeView` em `HomeTreeSection.tsx`;
- cards visuais compartilhados em `FamilyTreeVisualCards.tsx`;
- paleta `visual` em `treeColorPalettes.ts`.

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
- árvore panorâmica aparece sem swipe;
- Pai, Pessoa Central e Mãe ficam no eixo principal;
- ancestrais paternos ficam no lado esquerdo/superior;
- ancestrais maternos ficam no lado direito/superior;
- tios paternos e maternos ficam nas laterais;
- primos paternos e maternos ficam na parte inferior lateral;
- grupos centrais de irmãos, cônjuge, filhos, pets, sobrinhos e netos ficam abaixo da pessoa central;
- conectores não atravessam cards;
- conectores não ficam soltos quando grupos não existem;
- grupos grandes têm scroll interno;
- não há overflow horizontal indevido da página;
- paleta **Visual** aparece e aplica cores;
- fallback mobile não quebra bottom nav;
- `/minha-arvore`, `/genealogia` e `/visao-completa` não sofrem regressão.

### Pendências técnicas relacionadas

- Verificar inclusão de **Mapa Familiar** em `GLOBAL_SEARCH_PAGES`.
- Verificar inclusão de **Mapa Familiar** em `FAVORITE_PAGES`.
- Decidir se `DesktopFamilyMapView` deve participar do fluxo de exportação da árvore.

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

Critério de aceite futuro:

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

Critérios para considerar a pendência fechada:

- `/entrar` mostra **Família Souza Barros** como nome principal do app;
- `/entrar` explica que a plataforma organiza árvore, perfis, fotos, documentos, memórias e datas familiares;
- `/entrar` explica que Google Agenda sincroniza aniversários e datas de memória mediante autorização explícita;
- o texto existe diretamente no JSX/DOM, não apenas em pseudo-elemento CSS;
- domínio, nome do app e finalidade declarada são coerentes com a tela de consentimento OAuth.

---

## 7. Backlog futuro confirmado

| Frente | Direção futura | Status |
|---|---|---|
| Favoritos expandidos | Avaliar favoritos para arquivos históricos, relacionamentos, fórum, eventos, páginas, timeline, histórias e Mapa Familiar. | A confirmar por uso real. |
| Busca global | Manter páginas principais sincronizadas com `GLOBAL_SEARCH_PAGES`, incluindo novas rotas como `/mapa-familiar`. | Manutenção contínua. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado e cron externo automatizado. | Pós-MVP. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. | Pós-MVP. |
| Timeline avançada | Upload por evento, privacidade por evento e exportação PDF. | Pós-MVP. |
| Exportação avançada | Exportar árvore completa e avaliar captura do Mapa Familiar HTML/SVG. | Pós-MVP. |
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
| 3 | `docs/README.md` | Revisado nesta rodada | Índice atualizado para Mapa Familiar e reclassificação das pendências antigas da mobile segmentada. |
| 4 | `docs/PLANO_PROXIMOS_PASSOS.md` | Revisado nesta rodada | DOC-014, DOC-015 e DOC-016 adicionados; DOC-004 e DOC-013 reclassificados. |
| 5 | `docs/GUIA_IMPLEMENTACOES.md` | Revisar se alterado futuramente | Deve permanecer sincronizado com Mapa Familiar, paleta Visual e fallback mobile. |
| 6 | `docs/GUIA_UX_LAYOUT.md` | Revisar se alterado futuramente | Deve cobrir fit-to-screen, escala e QA visual do Mapa Familiar. |
| 7 | `docs/GUIA_COMPONENTES.md` | Revisar se alterado futuramente | Deve cobrir `DesktopFamilyMapView` e `FamilyTreeVisualCards`. |
| 8 | `docs/funcionalidades/FORUM.md` | Revisar conforme DOC-006 | Pendência de filtros tipo/status na home do fórum. |
| 9 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | Revisar conforme DOC-016 | Decidir/documentar exportação do Mapa Familiar. |
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
git add docs/arquitetura/ROTAS_E_GUARDS.md

git add docs/arquitetura/ARCHITECTURE.md

git add docs/README.md

git add docs/PLANO_PROXIMOS_PASSOS.md

git commit -m "docs: atualiza arquitetura e plano do mapa familiar"

git pull --rebase origin main

git push origin main
```

Não usar `git add .`.
