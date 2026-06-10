# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-10
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`
> Projeto: `tuliust/arvorefamilia`
> Status: plano vivo revisado após conferência dos documentos recentes com o código atual da Minha Árvore mobile segmentada, mantendo separado o que está implementado do que segue como pendência visual/produto.

## Objetivo

Este documento registra apenas:

- pendências reais encontradas durante revisão documental, QA visual ou implementação;
- divergências entre documentação e implementação;
- ações futuras que não devem ser executadas sem decisão explícita;
- pontos de QA, migration, refatoração ou melhoria identificados durante auditoria técnica;
- pendências remanescentes após ajustes de mobile, fórum, favoritos, deploy/cache e documentação.

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

Durante a revisão desta rodada, foram fechadas tecnicamente quatro frentes que antes apareciam como pendências documentais:

- chips mobile de Genealogia/Visão Completa passaram a usar a mesma base de gerações inferidas que alimenta a árvore;
- strings quebradas por encoding em `MinhaArvore.tsx` foram corrigidas na origem e o workaround global `textEncodingRepair` foi removido;
- múltiplas redes sociais passaram a ser carregadas e persistidas em `pessoa_social_profiles`, mantendo compatibilidade com os campos legados da primeira rede;
- a exportação mobile rápida passou a reutilizar o fluxo canônico de `treeExport.ts`.

Permanecem como pendências abertas apenas itens ainda não resolvidos por código, decisão de produto, QA visual ou validação externa. A divergência ainda aberta na UI de `/forum` continua registrada: a documentação prevê remoção dos filtros de tipo/status, mas a validação visual indicou que os dropdowns ainda aparecem.

Também permanecem pendências de consolidação estrutural de CSS visual da árvore, validação de cards compactos em `360px`, QA das respostas de IA, compliance OAuth/Google Agenda e operação do endpoint serverless `/api/ai`.

Na revisão documental de 2026-06-10, a frente da **Minha Árvore mobile segmentada** foi comparada com o código atual de `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` e `src/app/pages/home/HomeTreeSection.tsx`. O código atual já possui `MobileFamilyTreeView` como renderização específica para `/minha-arvore` em mobile, navegação horizontal entre ramo paterno, núcleo e ramo materno, e navegação vertical dentro dos ramos laterais entre ancestrais, tios e primos. Porém, ainda não contém a reestruturação visual final solicitada para: remover o container externo único de ancestrais, fazer tios/primos ocuparem 70% a 80% da tela e levar todos os conectores aplicáveis até as extremidades da viewport.


---

## 2. Pendências abertas

| ID | Documento de origem | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| DOC-003 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | melhoria futura / decisão pendente | Definir se `Complemento` deve persistir em schema próprio. As múltiplas redes sociais já persistem em `pessoa_social_profiles`; a pendência restante é apenas o campo visual `Complemento`. | Parcial |
| DOC-004 | `/minha-arvore` mobile | bug visual / conector inferior | Refazer a conexão inferior do card principal no mobile sem depender de CSS de bordas. O desenho desejado é uma haste central curta até uma linha horizontal, com uma haste à esquerda para **Irmãos** e uma haste à direita para **Cônjuge**, sem linha central prolongada entre os grupos. | Aberto |
| DOC-013 | `src/app/components/FamilyTree/MobileFamilyTreeView.tsx` / `/minha-arvore` mobile segmentada | bug visual / divergência documentação-código | Finalizar a experiência mobile em 7 telas: tela principal, ancestrais paternos, tios paternos, primos paternos, ancestrais maternos, tios maternos e primos maternos. Remover o container externo único de ancestrais, renderizando cards/grupos independentes de **Tataravós**, **Bisavós** e **Avós** quando houver; ampliar containers de **Tios** e **Primos** para cerca de 70% a 80% da altura útil; ajustar cards ao espaço; e fazer conectores horizontais/verticais chegarem às extremidades aplicáveis da viewport, sem linha acima dos ancestrais nem abaixo dos primos. | Aberto |
| DOC-006 | `src/app/pages/forum/ForumHome.tsx` / `docs/funcionalidades/FORUM.md` | divergência UI/documentação | Aplicar ou revisar a remoção real dos dropdowns **Todos os tipos** e **Todos os status** em `/forum`. A UI esperada deve manter apenas busca, categoria e botão icon-only de limpar filtros ao lado do dropdown de categoria. | Aberto |
| DOC-007 | `src/styles/family-tree-visual-polish.css` / `docs/GUIA_UX_LAYOUT.md` | dívida técnica / refatoração visual | Consolidar overrides acumulados de `family-tree-visual-polish.css` em componentes, tokens ou layouts estruturais quando a UI estabilizar. O arquivo hoje concentra árvore, modal, login/OAuth e ajustes pontuais. | Aberto |
| DOC-008 | `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts` | melhoria técnica / layout | Migrar a ampliação visual dos cards compactos da `/minha-arvore` para cálculo estrutural do layout, incluindo cards de `360px`, crescimento em direção ao centro e linhas de tios/primos, reduzindo dependência de CSS por seletor. | Aberto |
| DOC-009 | `src/app/pages/home/homeAiContext.ts` / `api/ai.ts` | QA funcional / IA | Validar em produção ou preview as respostas de IA para bisavós paternos, nascidos em Recife, irmãos de Márcio, pessoas mais antigas, cidades recorrentes e resumo genealógico, garantindo ausência de IDs e de inferências sensíveis. | Aberto |
| DOC-010 | `/entrar` / Google OAuth | compliance / validação externa | Confirmar se a home pública exibe no DOM/JSX o nome **Família Souza Barros** e a finalidade da integração com Google Agenda de forma compatível com a revisão OAuth do Google. | Aberto |
| DOC-011 | `api/ai.ts` / `docs/operacao/DEPLOYMENT.md` | operação / secrets | Confirmar variáveis server-side da IA no provedor de deploy, como `OPENAI_API_KEY` e modelo configurado, sem exposição no frontend e sem fallback SPA capturar `/api/*`. | Aberto |
| DOC-012 | `docs/funcionalidades/CURIOSIDADES_E_IA.md` | documentação / manutenção | Manter o novo documento de Curiosidades e IA sincronizado com `HomeCuriositiesDialog`, `ConnectionDiscoveryPanel`, `AiQuestionPanel`, `homeAiContext` e `api/ai.ts`. | Aberto |

### 2.1 Itens fechados nesta revisão técnica

| ID | Documento de origem | Resultado | Status |
|---|---|---|---|
| DOC-001 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | `HomeTreeSection.tsx` passou a calcular a base mobile de Genealogia/Visão Completa com gerações inferidas antes de montar chips e antes de repassar pessoas ao `FamilyTree`. | Concluído tecnicamente; manter QA visual mobile. |
| DOC-002 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Strings quebradas por encoding foram corrigidas na origem e `textEncodingRepair.ts` foi removido. | Concluído. |
| DOC-005 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | `MobileTreeControlsPortal` passou a usar o fluxo canônico de `treeExport.ts` para imagem, PDF e impressão. | Concluído tecnicamente; manter QA de captura em mobile. |

Regras:

- não duplicar essas pendências em outros documentos;
- documentos funcionais podem mencionar o contexto, mas o controle fica nesta tabela;
- fechar item apenas após validação técnica, QA visual ou decisão explícita;
- se houver alteração de schema, criar migration e atualizar `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 3. Frente mobile final - estado e pendências

Estado técnico da frente mobile:

```txt
Concluída para o shell mobile geral e para os controles mobile principais. A Minha Árvore mobile segmentada está implementada em primeira versão, mas ainda tem pendência visual/produto aberta em DOC-013.
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
- toggle compacto de **Minha Árvore**, **Genealogia** e **Visão Completa** no menu mobile;
- `MobileFamilyTreeView` renderizado apenas quando `isMobile && treeViewMode === 'minha-arvore'`;
- primeira versão da Minha Árvore mobile segmentada com telas laterais para **Tios Paternos** e **Tios Maternos**, e navegação vertical para ancestrais/tios/primos de cada ramo;
- cards mobile especializados para pessoa principal, irmãos/tios, pets, ancestrais e primos.

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

## 4. Pendência específica: conector inferior da `/minha-arvore` mobile

### Contexto

Na página `/minha-arvore`, em viewport mobile, a conexão inferior do card principal ainda não ficou com o desenho desejado.

Comportamento desejado:

```txt
card principal
     |
-----+-----
|         |
irmãos    cônjuge
```

Requisitos visuais:

- uma linha vertical curta saindo da base do card principal;
- uma linha horizontal superior conectando os dois ramos;
- uma linha vertical à esquerda descendo até o grupo **Irmãos**;
- uma linha vertical à direita descendo até o grupo **Cônjuge**;
- nenhuma linha vertical central prolongada entre os grupos.

### Estado observado

Mesmo após ajustes anteriores, a área inferior ainda pode exibir uma linha central prolongada. O print de validação indicou que a linha vertical central continuava descendo abaixo da linha horizontal, até a região entre os grupos inferiores.

### Ajustes já tentados

1. Ocultar edges centrais via CSS em `src/styles/mobile-tree-lines.css`.
2. Suprimir alguns edges no renderer `src/app/components/FamilyTree/OrthogonalChildEdge.tsx`.
3. Reexibir `direct-central-to-siblings-group` e `direct-central-to-spouse-group` para recuperar o split entre **Irmãos** e **Cônjuge**.
4. Tentar reduzir o `elbowY` mobile dos edges mantidos.
5. Marcar group boxes em `src/app/components/FamilyTree/nodeTypes.ts` e remover bordas internas via CSS.

### Hipótese técnica atual

A correção robusta deve ser feita na geração do layout em:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Pontos relevantes:

- `direct-center-bottom-anchor` é criado na base do card central;
- `direct-siblings-group-top-anchor` e `direct-spouse-group-top-anchor` são criados no topo dos grupos;
- `lowerConnectionElbowY` define a altura da linha horizontal;
- os edges `direct-central-to-siblings-group` e `direct-central-to-spouse-group` desenham caminhos completos até os grupos.

### Próxima abordagem recomendada

Criar uma conexão estrutural mobile específica para o primeiro split inferior:

1. Criar um anchor intermediário central no `lowerConnectionElbowY`, por exemplo:

```txt
direct-mobile-lower-split-anchor
```

2. No mobile, trocar os dois edges completos por três trechos explícitos:

```txt
direct-center-bottom-anchor -> direct-mobile-lower-split-anchor

direct-mobile-lower-split-anchor -> direct-siblings-group-top-anchor

direct-mobile-lower-split-anchor -> direct-spouse-group-top-anchor
```

3. Garantir que o trecho central termine exatamente no `lowerConnectionElbowY` e não continue descendo.
4. Manter a lógica desktop intacta.

### Critério de aceite

No mobile, abaixo do card principal, deve aparecer apenas:

- haste central curta até a linha horizontal;
- linha horizontal conectando os ramos;
- uma haste vertical à esquerda até **Irmãos**;
- uma haste vertical à direita até **Cônjuge**.

Não deve haver linha central descendo entre os grupos.

---

## 4.1 Pendência específica: Minha Árvore mobile segmentada em 7 telas

### Contexto

A experiência mobile da `/minha-arvore` usa `MobileFamilyTreeView.tsx` e não o ReactFlow direto. Ela é acionada por `HomeTreeSection.tsx` apenas quando a árvore pode renderizar, o viewport é mobile e `treeViewMode === 'minha-arvore'`.

O código atual já prevê sete áreas/telas conceituais:

```txt
Principal/Núcleo
Ancestrais paternos
Tios paternos
Primos paternos
Ancestrais maternos
Tios maternos
Primos maternos
```

O estado atual, entretanto, ainda não corresponde integralmente ao desenho visual final solicitado.

### Estado atual observado no código

- `MobileFamilyTreeView` ainda mantém abas internas `Núcleo`, `Paterno`, `Materno` e `Completa`.
- A aba `Núcleo` usa swipe horizontal com painel paterno à esquerda, núcleo no centro e painel materno à direita.
- Cada painel lateral usa swipe vertical entre ancestrais, tios e primos.
- `Tios` usam `VerticalRelativeScreen` com `columns="double"` e limite de 6 pessoas.
- `Primos` usam `VerticalRelativeScreen` com `columns="triple"` e limite de 9 pessoas.
- `Ancestrais` usam `AncestorGroupsScreen`, que ainda renderiza um container externo com título **Ancestrais Paternos/Maternos** e subgrupos internos de **Tataravós**, **Bisavós** e **Avós**.
- O container dos grupos laterais ainda usa largura máxima próxima de `max-w-[360px]`; não há, no código atual, regra estrutural para ocupar 70% a 80% da altura útil.
- Linhas laterais e verticais existem, mas ainda não foram normalizadas para sempre chegar às extremidades aplicáveis da viewport.

### Estado visual desejado

Nas telas de ancestrais:

- remover o container externo único **Ancestrais Paternos/Maternos**;
- renderizar diretamente até três cards/grupos independentes:
  - **Tataravós**;
  - **Bisavós**;
  - **Avós**;
- exibir apenas grupos que tenham pessoas cadastradas;
- manter todos dentro de uma única tela vertical do ramo;
- não exibir linha vertical acima da tela de ancestrais.

Nas telas de tios e primos:

- ampliar o container principal do grupo para cerca de `70vh` a `80vh` da altura útil mobile;
- preservar área segura da navegação inferior mobile;
- ajustar cards internos ao espaço disponível;
- tios devem continuar cabendo em até 6 cards, preferencialmente 2 colunas × 3 linhas;
- primos devem continuar cabendo em até 9 cards, preferencialmente 3 colunas × 3 linhas;
- evitar concentração dos cards no topo quando houver poucos itens.

Conectores:

- linha horizontal da tela de tios paternos deve ir até a extremidade esquerda da tela;
- linha horizontal da tela de tios maternos deve ir até a extremidade direita da tela;
- conectores verticais entre ancestrais → tios → primos devem chegar às extremidades superior/inferior aplicáveis de cada tela;
- não deve haver linha acima dos ancestrais;
- não deve haver linha abaixo dos primos;
- os conectores devem encostar visualmente nos grupos, sem sobras quebradas, cortes ou linhas flutuantes.

### Arquivos envolvidos

```txt
src/app/components/FamilyTree/MobileFamilyTreeView.tsx
src/app/pages/home/HomeTreeSection.tsx
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_IMPLEMENTACOES.md
```

### Critérios de aceite

- as sete telas são navegáveis em mobile;
- ancestrais paternos e maternos não têm container externo único;
- tataravós, bisavós e avós aparecem como grupos/cards próprios;
- tios e primos ocupam aproximadamente 70% a 80% da tela útil;
- cards se adaptam ao espaço sem overflow horizontal;
- conectores chegam às extremidades aplicáveis;
- não há linha acima de ancestrais;
- não há linha abaixo de primos;
- validação visual em `320px`, `375px`, `390px` e `430px`.

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
- validar que `/genealogia` e `/visao-completa` não herdam ajustes da view direta.

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
| Favoritos expandidos | Avaliar favoritos para arquivos históricos, relacionamentos, fórum, eventos, páginas, timeline e histórias. | A confirmar por uso real. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado e cron externo automatizado. | Pós-MVP. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. | Pós-MVP. |
| Timeline avançada | Upload por evento, privacidade por evento e exportação PDF. | Pós-MVP. |
| Exportação avançada | Exportar árvore completa, além da área visível. | Pós-MVP. |
| Parentesco avançado | Integração visual direta na árvore, Genealogia e Visão Completa. | Pós-MVP. |
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
- árvore principal, perfil de pessoa, fórum, notificações ou edição da própria árvore inutilizáveis.

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
| 1 | `docs/PLANO_PROXIMOS_PASSOS.md` | Revisado | Conflitos Git resolvidos; DOC-004 e DOC-005 separados; DOC-006 adicionado para filtros da home do fórum. |
| 2 | `docs/README.md` | Revisado | Índice atualizado para refletir a pendência DOC-013 da Minha Árvore mobile segmentada e o escopo atual dos documentos de árvore. |
| 3 | `docs/GUIA_IMPLEMENTACOES.md` | Revisado nesta rodada | Inventário consolidado ajustado para árvore, IA, Google/OAuth, fórum, favoritos e pendências reais. |
| 4 | `docs/GUIA_UX_LAYOUT.md` | Revisado em frente documental paralela | Manter alinhado com o estado real do `MobileFamilyTreeView` e com a pendência DOC-013. |
| 5 | `docs/GUIA_COMPONENTES.md` | Revisado em frente documental paralela | Inclui `MobileFamilyTreeView` e seus subcomponentes; manter pendências visuais no plano. |
| 6 | `docs/funcionalidades/FORUM.md` | Revisado nesta rodada | Alinhado ao padrão atual: categoria, respostas diretas, sem box de pessoa relacionada e sem comentário aninhado na UI. |
| 7 | `docs/operacao/DEPLOYMENT.md` | Revisado nesta rodada | Inclui `/api/ai`, variáveis server-side, Google/OAuth e checklist pós-deploy. |
| 8 | `docs/funcionalidades/CURIOSIDADES_E_IA.md` | Criado nesta rodada | Novo guia funcional para Curiosidades, conexão familiar e IA. |

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
git add docs/PLANO_PROXIMOS_PASSOS.md docs/README.md
git commit -m "docs: update mobile tree plan and docs index"
git pull --rebase origin main
git push origin main
```

Não usar `git add .`.
