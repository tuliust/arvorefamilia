# Decisões arquiteturais

> Última revisão: 2026-07-01
> Escopo: arquitetura final documentada após consolidação dos documentos técnicos, ajustes mobile/admin e layout compartilhado de mapas.
> Status: canônico.

## Camadas

```text
React/Vite UI
Rotas, guards e layouts
Componentes de domínio
Services de aplicação
Supabase Auth, Database, Storage e RLS
APIs serverless
```

## Frontend

- Páginas: `src/app/pages`.
- Componentes compartilhados: `src/app/components`.
- Componentes da árvore: `src/app/components/FamilyTree`.
- Services: `src/app/services`.
- Tipos centrais: `src/app/types`.
- Utilitários: `src/app/utils` quando aplicável.
- Scripts defensivos carregados por `index.html` são aceitos apenas como camada de compatibilidade ou transição; a fonte preferencial para comportamento estabilizado deve ser o componente React de origem.

## Rotas e guards

A fonte de verdade é `src/app/routes.tsx`.

- Rotas públicas: login, termos, privacidade e dúvidas.
- Rotas de membro: mapas, árvore, dados, vínculos, revisão, curiosidades, fórum, favoritos, notificações, preferências e calendário.
- Rotas administrativas: `/admin`, `/aprovacoes` e subrotas administrativas.
- Guards principais: `ProtectedRoute`, `MemberRoute`, `TreeAccessRoute` e checagens administrativas.

Detalhes operacionais ficam em `arquitetura/ROTAS_E_GUARDS.md`.

## Layout compartilhado mobile dos mapas

Decisão vigente:

- `/mapa-familiar` e `/linha-geracional` compartilham, no mobile, um shell baseado em `TreeMapSharedLayout`.
- O shell renderiza `HomeHeader`, `<Outlet />` e `HomeMobileNav`, mantendo header, toolbar superior e navegação inferior fora da área central trocada.
- `MobileTreeChromeContext` desacopla o header da implementação específica da rota filha, permitindo que cada rota registre label, busca, sugestões e navegação.
- `MapaFamiliarSharedRoute` é adaptador de transição para encaixar `Home` no layout compartilhado sem duplicar header/nav no mobile.
- `LinhaGeracional` aceita `mobileChromeMode="shared"` para não montar header/nav próprios.
- O evento `arvorefamilia:tree-map-route-change` pode ser usado por runtimes defensivos para reagir à troca de rota sem depender de remount visual do chrome.
- Desktop continua separado: `/mapa-familiar-horizontal` permanece fora desse chrome compartilhado.

Motivação:

- alternar entre `Árvore Familiar` e `Linha Geracional` sem flicker de header, toolbar ou menu inferior;
- reduzir duplicação de shell mobile entre páginas;
- preservar estado e camadas comuns de toolbar;
- criar caminho progressivo para mover regras de compatibilidade para componentes React definitivos.

## Supabase e dados

A aplicação usa Supabase para autenticação, pessoas, relacionamentos, solicitações de vínculo, responsáveis por perfis, arquivos históricos, favoritos, notificações, fórum, preferências e storage.

Regras de banco e migrations ficam em `operacao/MIGRATIONS_SUPABASE.md`.

### Vínculos entre usuários, pessoas e responsáveis

- `user_person_links`: vínculo entre usuário autenticado (`auth.users.id`) e pessoa da árvore (`pessoas.id`).
- `person_responsible_links`: vínculo pessoa-a-pessoa entre pessoa administrada (`managed_pessoa_id`) e pessoa responsável (`responsible_pessoa_id`).

Essa separação evita gravar `pessoas.id` em campos que referenciam `auth.users.id`.

### Notificações administrativas

A arquitetura separa três camadas:

- entrega real ao usuário em `notificacoes_usuario`;
- preferências individuais em `preferencias_notificacao`;
- administração de catálogo e configuração em `admin_notification_configurations` e `admin_notification_catalogs`.

Decisão vigente:

- catálogo administrativo deve ser editável e persistido no Supabase;
- `admin_notification_catalogs` guarda snapshot completo em JSONB;
- `admin_notification_configurations` guarda overrides e configurações da UI administrativa;
- `admin_notification_configurations.variable_settings` guarda regras por variável;
- `src/app/constants/adminNotificationCatalog.ts` permanece fallback/base técnica;
- entregas reais não devem ser confundidas com catálogo.

## Configurações públicas e cache local

- `site_visual_settings` é fonte remota definitiva da versão publicada, rascunho e agendamento.
- `useSiteVisualSettings.ts` pode usar `localStorage` como cache best-effort.
- Cache local não substitui auditoria, publicação, rascunho ou agendamento.
- Falha de cache nunca bloqueia carregamento da página pública.

## Runtimes defensivos de UI

A aplicação admite runtimes para compatibilidade visual temporária, desde que o escopo seja controlado.

Decisão vigente:

- runtime de UI não substitui lógica de domínio ou regra de banco;
- ajustes de DOM são isolados por rota, breakpoint e seletor explícito;
- `MutationObserver` não observa `attributes` quando o runtime altera `style`, `dataset` ou classes;
- execução deve ser agrupada via `requestAnimationFrame`;
- falhas devem ser capturadas com `try/catch`;
- componentes de origem devem ser corrigidos quando o ajuste deixar de ser pontual;
- scripts vazios ou neutralizados devem ser removidos quando não houver dependência real.

## Mapa familiar e árvore

- `funcionalidades/MAPA_FAMILIAR_VIEW.md`: contrato das views `/mapa-familiar`, `/mapa-familiar-horizontal` e `/linha-geracional`.
- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: painéis, conectores, legendas, seletor de visualização e edição da árvore.

### Mapa completo mobile por modelo de nós

Decisão vigente:

- o mapa completo mobile não deve ser clone visual frágil de seções renderizadas;
- a renderização usa modelo próprio de pessoas, nós e arestas;
- cards são renderizados por estrutura comum, com variantes visuais declaradas;
- conectores são derivados de âncoras e bordas reais dos nós;
- pan/zoom preservam o `transform` aplicado pelo usuário após o gesto;
- `Reenquadrar`, quando disponível, é forma explícita de recalcular escala e posição;
- a versão atual não renderiza botão `X` próprio; retorno/fechamento é controlado pelo fluxo de toolbar/estado da rota sem deixar overlay preso;
- ajustes de conector, camada ou gesto por runtime são aceitos como etapa de estabilização;
- comportamento estabilizado deve migrar para componentes React definitivos quando possível.

### Trays mobile e backdrop por componentes React

Decisão vigente:

- `HomeMobileNav.tsx` centraliza estado dos botões `Formato`, `Cor`, `Filtros`, `Mapa` e `+` nas rotas de mapa mobile;
- no layout compartilhado, `HomeMobileNav` fica fora do `<Outlet />`;
- `MobileFamilyMapBackdrop.tsx` é fonte preferencial para backdrop parcial/imersivo;
- `MobileFamilyMapContextTray.tsx` é fonte preferencial para trays contextuais;
- `MobileFamilyMapFullLayer.tsx` é fonte preferencial para a camada completa, base branca e container arredondado abaixo da toolbar;
- novos ajustes não devem recriar scripts globais de backdrop nem depender de `MutationObserver` para posicionamento de blur;
- seletores legados de backdrop de toolbar não devem voltar como contrato operacional.

### Modelo de camadas mobile

1. Tray contextual com blur parcial:
   - usado por `Formato`, `Cor`, `Filtros` e `Mapa` em modo overview;
   - preserva header, toolbar superior, tray ativo e navegação inferior visíveis e sem blur;
   - blur começa abaixo do tray completo, incluindo CTA quando existir;
   - blur termina no topo real da navegação inferior.

2. Mapa completo ou painel `+`:
   - usado para camadas completas;
   - no mapa completo atual, container inicia abaixo da toolbar compartilhada e não renderiza botão `X` próprio;
   - a camada ativa e o palco do mapa ficam acima do blur;
   - retorno/fechamento remove camada e blur sem deixar overlay preso.

## Scripts neutralizados ou absorvidos

Arquivos de transição que não devem ser tratados como fonte arquitetural vigente quando vazios, sem carregamento ativo ou absorvidos:

- `src/mobileMapPanelRefinements.ts`;
- `src/mobileMapToolbarBackdropLayerFix.ts`;
- `src/mobileFamilyMapFullPanelStyleFix.ts`;
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`, quando apenas `export {};`;
- `src/desktopTreeVisualizationPanelTextFix.ts`, quando correção textual já estiver aplicada nos componentes.

## Administração

A área administrativa deve manter rotas protegidas, header reduzido e páginas especializadas. Alterações nessa frente devem preservar guards, auditoria, tabelas de configuração e documentação funcional correspondente.
