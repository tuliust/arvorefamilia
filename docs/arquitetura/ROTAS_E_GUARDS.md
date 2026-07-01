# Rotas e guards

> Última revisão: 2026-07-01
> Escopo: rotas principais, guards e fluxos de navegação.
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
| `/mapa-familiar` | Mapa vertical e principal. | `TreeAccessRoute` |
| `/mapa-familiar-horizontal` | Visualização horizontal. | `TreeAccessRoute` |
| `/linha-geracional` | Visualização geracional mobile/dedicada. | `TreeAccessRoute` |
| `/busca` | Resultados da busca global. | `TreeAccessRoute` |
| `/pessoa/:id` | Perfil individual com dados, vínculos, fórum, arquivos e timeline. | `MemberRoute` |
| `/pessoas/:id` | Alias de perfil individual. | `MemberRoute` |

### Montagem de runtimes mobile

- `MobileTopLayerTweaks` pode ser montado globalmente em rotas renderizadas por `lazyRoute`, desde que suas regras internas sejam defensivas por rota/breakpoint.
- `LinhaGeracionalMobilePanelLayerTweaks` deve ser montado somente na rota `/linha-geracional`.
- `/mapa-familiar` não deve carregar runtime específico da linha geracional.
- O isolamento entre `/mapa-familiar` e `/linha-geracional` é regra de não regressão para evitar travamentos, overlays indevidos ou mudança de layout entre rotas.
- Runtimes de mapa mobile importados por side effect devem permanecer isolados por rota, breakpoint e seletor explícito.
- Componentes React de mapa mobile (`MobileFamilyMapBackdrop`, `MobileFamilyMapContextTray` e `MobileFamilyMapFullLayer`) não alteram rota, guard ou estado de autenticação.
- O backdrop/blur parcial dos painéis de mapa é recurso visual da shell mobile e não deve mudar rota, guard ou estado de autenticação.
- O mapa completo é camada visual temporária acima da rota atual; fechar pelo `X` deve restaurar a mesma rota e a mesma perspectiva de pessoa.

## Rotas de onboarding

| Rota | Etapa | Observações |
|---|---:|---|
| `/minha-arvore/editar` | Alias | Redireciona para `/meus-dados`. |
| `/meus-dados` | 1 | Dados pessoais, status vivo/falecido, redes sociais e questionário IA com tela final `Seu Perfil`. |
| `/meus-vinculos` | 2 | Vínculos familiares, cônjuges, filhos, irmãos e pets. Mini Bio/Curiosidades não ficam mais nesta página. |
| `/arquivos-historicos` | 3 | Fatos e arquivos históricos. |
| `/preferencias` | 4 | Apenas pessoa viva. |
| `/revisao-dados` | 5 | Revisão final e eventuais pendências de edição/responsabilidade. |
| `/vincular-perfil` | Apoio | Vinculação de usuário a perfil. |
| `/mapa-familiar` | Pós-onboarding | Visualização da árvore. |

## Fluxo para pessoa viva

```text
/meus-dados
  → /meus-vinculos
  → /arquivos-historicos
  → /preferencias
  → /revisao-dados
  → /mapa-familiar
```

## Fluxo para pessoa falecida

```text
/meus-dados
  → /meus-vinculos
  → /arquivos-historicos
  → /revisao-dados
  → /mapa-familiar
```

`/preferencias` deve redirecionar pessoa falecida para `/revisao-dados` após aplicar defaults seguros.

Antes de finalizar `/revisao-dados`, se o usuário logado for responsável por outros perfis, o fluxo pode exibir modal de escolha para editar essas páginas agora ou seguir para a árvore.

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

## Header nessas rotas

Rotas de onboarding usam header simplificado. No mobile, a navegação inferior pode permanecer disponível quando o contrato visual da experiência principal exigir.

## Guards principais

### Usuário não autenticado

- Deve ser redirecionado/impedido conforme AuthContext/rotas autenticadas.

### Usuário sem pessoa vinculada

- Exibir card de estado vazio ou erro amigável.
- Não quebrar tela.

### Primeiro acesso

- `resolveFirstAccessLinkForUser` deve ser chamado antes de carregar dados principais.
- Pendências de primeiro acesso em localStorage/sessionStorage devem ser resolvidas.

### Pessoa falecida

- Sem preferências de notificação pessoais.
- Sem WhatsApp ativo.
- Local atual não deve ser tratado como dado vivo.
- IA deve gerar memorial quando toggle for marcado.
- Pessoa falecida administrada por responsável não deve criar conteúdo social em nome próprio quando a regra do fluxo proibir.

## Retorno seguro para árvore

Parâmetros de retorno devem aceitar apenas paths internos permitidos, como:

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
