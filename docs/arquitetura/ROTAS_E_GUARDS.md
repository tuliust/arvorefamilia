# Rotas e guards

> Última revisão: 2026-07-01
> Escopo: rotas principais, guards, layout compartilhado mobile dos mapas e fluxos de navegação.
> Status: canônico.

## Fonte de verdade

As rotas são declaradas em `src/app/routes.tsx`. Este documento deve citar apenas rotas existentes na branch `main`.

## Rotas públicas

| Rota | Uso |
|---|---|
| `/entrar` | Tela pública de entrada. |
| `/termos` | Termos de uso. |
| `/privacidade` | Política de privacidade. |
| `/duvidas` | Página pública de dúvidas. |

## Rotas de árvore, busca e perfil

| Rota | Uso | Guard |
|---|---|---|
| `/` | Redireciona para `/mapa-familiar`. | `TreeAccessRoute` |
| `/mapa-familiar` | Mapa vertical e principal; no mobile é filha de `TreeMapSharedLayout` via `MapaFamiliarSharedRoute`. | `TreeAccessRoute` |
| `/mapa-familiar-horizontal` | Visualização horizontal baseada na shell `Home`/`TreeHomeShell`. | `TreeAccessRoute` |
| `/linha-geracional` | Visualização geracional mobile/dedicada; filha de `TreeMapSharedLayout` com `mobileChromeMode="shared"`. | `TreeAccessRoute` |
| `/busca` | Resultados da busca global. | `TreeAccessRoute` |
| `/pessoa/:id` | Perfil individual com dados, vínculos, fórum, arquivos e timeline. | `MemberRoute` |
| `/pessoas/:id` | Alias de perfil individual. | `MemberRoute` |

## Layout compartilhado mobile dos mapas

`/mapa-familiar` e `/linha-geracional` compartilham um route element pai no mobile:

```text
TreeAccessRoute
  TreeMapSharedLayout
    /mapa-familiar -> MapaFamiliarSharedRoute
    /linha-geracional -> LinhaGeracional mobileChromeMode="shared"
```

`TreeMapSharedLayout` mantém `HomeHeader`, `<Outlet />` e `HomeMobileNav` montados. A troca de rota deve substituir apenas o conteúdo central. `/mapa-familiar-horizontal` permanece fora desse layout compartilhado.

Contratos:

- header, toolbar superior e navegação inferior ficam fora do `<Outlet />`;
- alternar `Formato` não pode remontar visualmente o chrome;
- `MobileTreeChromeContext` recebe dados da rota filha ativa;
- `MapaFamiliarSharedRoute` é adaptador de transição para `Home`;
- `LinhaGeracional` usa `mobileChromeMode="shared"` para não duplicar shell;
- desktop deve continuar controlado pelas páginas originais.

## Montagem de runtimes mobile

- `MobileTopLayerTweaks` pode ser montado globalmente em rotas renderizadas por `lazyRoute`, desde que suas regras internas sejam defensivas por rota/breakpoint.
- `LinhaGeracionalMobilePanelLayerTweaks` pode estar montado no route element compartilhado desde que se isole internamente por `pathname`, breakpoint e seletores da linha geracional.
- O isolamento entre `/mapa-familiar` e `/linha-geracional` continua obrigatório para evitar travamentos, overlays indevidos ou mudança de layout entre rotas.
- Runtimes de mapa mobile importados por side effect devem permanecer isolados por rota, breakpoint e seletor explícito.
- Componentes React de mapa mobile não alteram rota, guard ou estado de autenticação.
- O mapa completo é camada visual temporária da rota atual; a versão vigente não renderiza botão `X` próprio e deve retornar/fechar sem perder rota, perspectiva de pessoa, header, toolbar ou menu inferior.

## Rotas de onboarding

| Rota | Etapa | Observações |
|---|---:|---|
| `/minha-arvore/editar` | Alias | Redireciona para `/meus-dados`. |
| `/meus-dados` | 1 | Dados pessoais, status vivo/falecido, redes sociais e questionário IA. |
| `/meus-vinculos` | 2 | Vínculos familiares, cônjuges, filhos, irmãos e pets. |
| `/arquivos-historicos` | 3 | Fatos e arquivos históricos. |
| `/preferencias` | 4 | Apenas pessoa viva. |
| `/revisao-dados` | 5 | Revisão final e pendências. |
| `/vincular-perfil` | Apoio | Vinculação de usuário a perfil. |
| `/mapa-familiar` | Pós-onboarding | Visualização da árvore. |

## Fluxos de onboarding

Pessoa viva:

```text
/meus-dados -> /meus-vinculos -> /arquivos-historicos -> /preferencias -> /revisao-dados -> /mapa-familiar
```

Pessoa falecida:

```text
/meus-dados -> /meus-vinculos -> /arquivos-historicos -> /revisao-dados -> /mapa-familiar
```

`/preferencias` deve redirecionar pessoa falecida para `/revisao-dados` após aplicar defaults seguros.

## Rotas de membro autônomas

| Rota | Uso | Guard |
|---|---|---|
| `/calendario-familiar` | Calendário familiar. | `MemberRoute` |
| `/curiosidades` | Curiosidades, IA e exploração dos dados familiares. | `MemberRoute` |
| `/meus-favoritos` | Favoritos do usuário. | `MemberRoute` |
| `/notificacoes` | Central de notificações. | `MemberRoute` |
| `/ajustar-notificacoes` | Preferências de notificação. | `MemberRoute` |
| `/forum` | Home do fórum. | `MemberRoute` |
| `/forum/novo` | Criação de tópico. | `MemberRoute` |
| `/forum/topico/:id` | Tópico individual. | `MemberRoute` |
| `/forum/topico/:id/editar` | Edição de tópico. | `MemberRoute` |

## Guards principais

### Usuário não autenticado

- Deve ser redirecionado/impedido conforme AuthContext/rotas autenticadas.

### Usuário sem pessoa vinculada

- Exibir card de estado vazio ou erro amigável.
- Não quebrar tela.

### Primeiro acesso

- `resolveFirstAccessLinkForUser` deve ser chamado antes de carregar dados principais.
- Usuário autenticado com vínculo `linked` e `dados_confirmados = false` deve acessar apenas etapas do onboarding.
- `TreeAccessRoute` impede acesso a `/`, `/mapa-familiar`, `/mapa-familiar-horizontal`, `/linha-geracional` e `/busca` enquanto `dados_confirmados = false`.
- `MemberRoute` aplica a mesma restrição para demais rotas internas.
- O retorno para `/mapa-familiar` só é permitido depois de `/revisao-dados` confirmar cadastro e persistir `dados_confirmados = true`.
- Dados já salvos não devem ser descartados pelo redirecionamento de segurança.

## Retorno seguro para árvore

Parâmetros de retorno aceitam apenas paths internos permitidos:

- `/`;
- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- `/linha-geracional` quando o fluxo permitir.

Não aceitar URL externa.

## Rotas administrativas

| Rota | Uso | Guard |
|---|---|---|
| `/admin/login` | Login administrativo. | Pública |
| `/admin` | Dashboard administrativo. | `ProtectedRoute` |
| `/admin/dashboard` | Alias do dashboard. | `ProtectedRoute` |
| `/aprovacoes` | Aprovações administrativas. | `ProtectedRoute` |
| `/admin/aprovacoes` | Alias administrativo de aprovações. | `ProtectedRoute` |
| `/admin/home` | Configurações públicas/home. | `ProtectedRoute` |
| `/admin/pessoas` | Listagem/gestão administrativa de pessoas. | `ProtectedRoute` |
| `/admin/pessoas/novas` | Alias/listagem de pessoas novas. | `ProtectedRoute` |
| `/admin/pessoas/nova` | Criação administrativa de pessoa. | `ProtectedRoute` |
| `/admin/pessoas/:id` | Workspace de edição de pessoa. | `ProtectedRoute` |
| `/admin/pessoas/:id/editar` | Workspace de edição de pessoa. | `ProtectedRoute` |
| `/admin/relacionamentos` | Listagem administrativa de relacionamentos. | `ProtectedRoute` |
| `/admin/relacionamentos/novo` | Cadastro de relacionamento. | `ProtectedRoute` |
| `/admin/importacao` | Importação administrativa. | `ProtectedRoute` |
| `/admin/migrar-dados` | Ferramenta administrativa de migração. | `ProtectedRoute` |
| `/admin/diagnostico` | Diagnóstico administrativo. | `ProtectedRoute` |
| `/admin/integridade` | Integridade de dados. | `ProtectedRoute` |
| `/admin/atividades` | Histórico de atividades administrativas. | `ProtectedRoute` |
| `/admin/responsaveis` | Responsáveis por perfis legados e crianças. | `ProtectedRoute` |
| `/admin/notificacoes` | Administração de notificações. | `ProtectedRoute` |
| `/admin/gestao-conteudo-pessoas` | Textos automáticos e visibilidade de pessoas. | `ProtectedRoute` |
| `/admin/duvidas` | Administração de dúvidas. | `ProtectedRoute` |

## Não regressões

- Não remover preservação de query string onde o fluxo depende dela.
- Não reintroduzir ações no header do onboarding quando a rota exigir header simplificado.
- Não tratar `/preferencias` como obrigatória para pessoa falecida.
- Não expor rotas admin para membro sem guard.
- Não remover `/aprovacoes` quando o card do dashboard apontar para essa rota.
- Não mover header, toolbar ou menu inferior para dentro do `<Outlet />` do layout compartilhado mobile.
