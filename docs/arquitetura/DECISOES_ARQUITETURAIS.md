# Decisões arquiteturais

> Última revisão: 2026-07-01
> Escopo: arquitetura final documentada após consolidação dos documentos técnicos anteriores e ajustes mobile/admin de 2026-07-01.
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

- Rotas públicas: home, login, termos, privacidade e dúvidas.
- Rotas de membro: mapa, árvore, dados, vínculos, revisão, curiosidades, fórum, favoritos, notificações, preferências e calendário.
- Rotas administrativas: `/admin`, `/aprovacoes` e subrotas administrativas.
- Guards principais: `ProtectedRoute`, `MemberRoute`, `TreeAccessRoute` e checagens administrativas.

Detalhes operacionais ficam em `arquitetura/ROTAS_E_GUARDS.md`.

## Supabase e dados

A aplicação usa Supabase para autenticação, pessoas, relacionamentos, solicitações de vínculo, responsáveis por perfis, arquivos históricos, favoritos, notificações, fórum, preferências e storage.

Regras de banco e migrations ficam em `operacao/MIGRATIONS_SUPABASE.md`. SQLs antigos foram consolidados em `historico/LEGADO_TECNICO.md` apenas para rastreabilidade.

### Vínculos entre usuários, pessoas e responsáveis

A arquitetura separa dois tipos de vínculo:

- `user_person_links`: vínculo entre um usuário autenticado (`auth.users.id`) e uma pessoa da árvore (`pessoas.id`). Deve ser usado quando o vínculo concede acesso, edição, perfil principal ou permissões associadas a login.
- `person_responsible_links`: vínculo pessoa-a-pessoa entre uma pessoa administrada (`managed_pessoa_id`) e uma pessoa responsável (`responsible_pessoa_id`). Deve ser usado para indicar responsáveis familiares por perfis legados ou crianças quando o responsável vem da tabela `pessoas`, mesmo que não tenha usuário autenticado.

Essa separação evita gravar `pessoas.id` em campos que referenciam `auth.users.id` e preserva a integridade referencial de `user_person_links`.

A página `/admin/responsaveis` usa `person_responsible_links` para o seletor inline de responsáveis em perfis legados e crianças. As solicitações de administração continuam sendo tratadas pelo fluxo próprio de solicitações e, quando aprovadas, podem gerar vínculo com usuário autenticado.

### Notificações administrativas

A arquitetura separa três camadas de notificações:

- entrega real ao usuário, persistida em `notificacoes_usuario`;
- preferências individuais, persistidas em `preferencias_notificacao`;
- administração de catálogo e configuração, persistida em `admin_notification_configurations` e `admin_notification_catalogs`.

Decisão vigente:

- o catálogo administrativo de notificações deve ser editável e persistido no Supabase;
- `admin_notification_catalogs` guarda snapshot completo em JSONB com frequências, temas, grupos, tipos, templates, automações e sugestões;
- `admin_notification_configurations` guarda overrides e configurações da tela administrativa;
- `src/app/constants/adminNotificationCatalog.ts` permanece como fallback/base técnica enquanto a UI ainda termina a migração para consumo integral do catálogo persistido;
- novas evoluções devem preferir `loadAdminNotificationCatalog()` e serviços correlatos em vez de imports diretos do catálogo base;
- entregas reais não devem ser confundidas com catálogo; dispatch continua responsável por criar notificações em `notificacoes_usuario`.

Destinatários avançados aceitos:

- usuário do gatilho;
- usuários específicos;
- familiares próximos: pai, mãe, irmãos, cônjuge ativo, filhos, netos e sobrinhos.

O primeiro acesso real a `/mapa-familiar` pode gerar notificação interna de boas-vindas, deduplicada por `user_first_map_accesses`.

A documentação funcional canônica dessa frente é `funcionalidades/NOTIFICACOES_ADMIN.md`. O resumo de notificações do usuário permanece em `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`.

## Configurações públicas e cache local

As configurações públicas de identidade visual continuam sendo persistidas no Supabase pela área `/admin/home`.

Decisão vigente:

- `site_visual_settings` permanece como fonte remota definitiva da versão publicada, rascunho e agendamento;
- `useSiteVisualSettings.ts` pode usar `localStorage` como cache best-effort da versão pública para reduzir flicker visual e servir fallback quando a leitura remota falhar;
- a chave de cache deve ser tratada como implementação de UI, não como fonte canônica de dados;
- leitura de cache não substitui validações, auditoria, publicação manual, rascunho ou agendamento;
- falha de cache local nunca deve bloquear carregamento da página pública.

## Runtimes defensivos de UI

A aplicação admite componentes de runtime para compatibilidade visual temporária, desde que o escopo seja controlado.

Decisão vigente:

- runtime de UI não deve substituir lógica de domínio ou regra de banco;
- ajustes de DOM devem ser isolados por rota, breakpoint e seletor explícito;
- `MutationObserver` não deve observar `attributes` quando o próprio runtime altera `style`, `dataset` ou classes;
- a execução deve ser agrupada via `requestAnimationFrame`;
- falhas devem ser capturadas com `try/catch` para não bloquear a página;
- componentes de origem devem ser corrigidos quando o ajuste deixar de ser pontual;
- scripts vazios ou neutralizados devem ser removidos do carregamento quando não houver dependência operacional real.

Casos aceitos nesta fase:

- sobreposição de dropdowns do header mobile;
- compatibilidade visual temporária em `/meus-dados` e `/meus-vinculos` mobile;
- ajustes de camadas no painel mobile da árvore enquanto não absorvidos pelos componentes React;
- ocultações condicionais em `/pessoa/:id` enquanto o layout definitivo não absorve a regra;
- patches visuais pequenos carregados por `index.html` quando forem isolados, documentados e substituíveis por correção de origem.

## IA

A IA é funcionalidade de apoio e não substitui revisão humana dos dados.

- Endpoint principal: `api/ai.ts`.
- Textos de perfil: `purpose === "profile_text"`.
- Conteúdos automáticos de pessoas: serviço e Edge Function específicos quando aplicável.
- Documentação funcional: `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`.

## Mapa familiar e árvore

- `funcionalidades/MAPA_FAMILIAR_VIEW.md`: contrato das views `/mapa-familiar`, `/mapa-familiar-horizontal` e `/linha-geracional`.
- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`: painéis, conectores, legendas, seletor de visualização e edição da árvore.

Documentos antigos de mobile, baseline e ajustes por rodada foram removidos porque o contrato vigente passou a estar nos documentos canônicos.

### Mapa completo mobile por modelo de nós

Decisão vigente:

- o mapa completo mobile não deve ser mantido como clone visual frágil de seções já renderizadas;
- a renderização deve usar modelo próprio de pessoas, nós e arestas;
- cards devem ser renderizados por estrutura comum, com variantes visuais declaradas;
- conectores devem ser derivados de âncoras e bordas reais dos nós;
- pan/zoom devem preservar o `transform` aplicado pelo usuário após o gesto, sem reset automático por reidratação, observer, resize ou rotina defensiva;
- a ação `Reenquadrar`, quando disponível, é a forma explícita de recalcular escala e posição, salvo reconstrução real do stage;
- o botão `X` do mapa completo deve pertencer à camada React de mapa completo, respeitar `safe-area`, ter área de toque confortável e encerrar corretamente o modo imersivo;
- ajustes de conector, camada ou gesto por runtime são aceitos como etapa de estabilização, mas devem preservar rota e breakpoint;
- a evolução desejável é mover a regra para componentes React definitivos quando o comportamento visual estiver validado.

### Trays mobile e backdrop por componentes React

Decisão vigente:

- `HomeMobileNav.tsx` centraliza o estado dos botões `Formato`, `Cor`, `Filtros`, `Mapa` e `+` nas rotas de mapa mobile;
- `MobileFamilyMapBackdrop.tsx` é a fonte preferencial para backdrop parcial/imersivo dos mapas mobile;
- `MobileFamilyMapContextTray.tsx` é a fonte preferencial para trays contextuais da toolbar;
- `MobileFamilyMapFullLayer.tsx` é a fonte preferencial para a camada completa e o botão `X`;
- novos ajustes não devem recriar scripts globais de backdrop nem depender de `MutationObserver` para posicionamento de blur;
- seletores legados de backdrop de toolbar não devem voltar como contrato operacional.

### Modelo de camadas mobile

Existem dois estados de camada diferentes:

1. **Tray contextual com blur parcial**
   - usado por `Formato`, `Cor`, `Filtros` e `Mapa` em modo overview;
   - preserva header, toolbar superior, tray ativo e navegação inferior visíveis e sem blur;
   - o blur começa abaixo do tray completo, incluindo CTA quando existir;
   - o blur termina no topo real da navegação inferior, com `safe-area` apenas como fallback;
   - cards e CTA do tray ficam acima do blur.

2. **Mapa completo ou painel `+` com blur imersivo**
   - usado para o mapa completo e para a camada de controles globais quando aberta;
   - o blur imersivo cobre a shell da página atrás da camada ativa;
   - a camada ativa, o palco do mapa completo e o botão `X` ficam acima do blur;
   - fechar deve remover a camada e o blur sem deixar overlay preso.

Motivação:

- reduzir divergência entre grupos;
- impedir conectores soltos ou duplicados;
- evitar ghost clicks e vazamento de eventos para cards abaixo de overlays;
- manter a navegação mobile consistente durante painéis e mapas completos;
- permitir pan/zoom estável sem depender do DOM de telas secundárias;
- reduzir disputa entre scripts globais e estado React.

## Scripts neutralizados ou absorvidos

Arquivos de transição que não devem ser tratados como fonte arquitetural vigente quando estiverem vazios, sem carregamento ativo ou absorvidos por componentes React:

- `src/mobileMapPanelRefinements.ts`;
- `src/mobileMapToolbarBackdropLayerFix.ts`;
- `src/mobileFamilyMapFullPanelStyleFix.ts`;
- `src/mobileFamilyMapFullOverviewButtonGuard.ts`, quando seu conteúdo for apenas `export {};`;
- `src/desktopTreeVisualizationPanelTextFix.ts`, quando a correção textual já tiver sido aplicada nos componentes de origem.

Se qualquer um desses arquivos voltar a ter comportamento ativo, a documentação deve explicar escopo, rota, breakpoint, seletor e motivo para não estar no componente React de origem.

## Administração

A área administrativa deve manter rotas protegidas, header reduzido e páginas especializadas.

- `/admin` concentra dashboard e ações rápidas.
- `/aprovacoes` e `/admin/aprovacoes` concentram solicitações pendentes.
- `/admin/home` concentra configurações públicas salváveis.
- `/admin/responsaveis` concentra responsáveis por perfis legados e crianças.
- `/admin/notificacoes` concentra visão geral, configuração, preferências, automações, métricas e diagnóstico de notificações.
- `/admin/gestao-conteudo-pessoas` concentra textos automáticos, visibilidade e conteúdos de pessoas.

## Decisões de documentação

- Documentos datados de rodada não são contrato operacional.
- Histórico técnico fragmentado fica em `historico/LEGADO_TECNICO.md`.
- Funcionalidades menores ficam em `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`.
- Funcionalidades com contrato técnico extenso podem ganhar documento próprio em `funcionalidades/`, como `NOTIFICACOES_ADMIN.md`.
- `docs/README.md` e `docs/INVENTARIO_TECNICO.md` são as fontes de navegação documental.
- Arquivos residuais criados durante testes ou patches temporários devem ser removidos, ou documentados como pendência técnica quando ainda existirem no repositório sem carregamento ativo.

## Regra de atualização

Sempre que uma decisão arquitetural mudar, atualizar este documento e, quando afetar rota, também atualizar `arquitetura/ROTAS_E_GUARDS.md` e `INVENTARIO_TECNICO.md`.

Quando uma alteração criar ou alterar tabelas, vínculos, permissões, policies ou fluxos administrativos, atualizar também `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md`.

Quando uma alteração migrar comportamento de script defensivo para componente React, atualizar também `GUIA_COMPONENTES.md`, `GUIA_IMPLEMENTACOES.md`, `GUIA_UX_LAYOUT.md` e a lista de scripts ativos em `INVENTARIO_TECNICO.md`.
