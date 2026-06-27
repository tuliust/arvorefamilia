# Rotas e guards

> Última revisão: 2026-06-27
> Escopo: rotas principais, guards e fluxos de navegação.
> Status: canônico.

## Rotas de onboarding

| Rota | Etapa | Observações |
|---|---:|---|
| `/meus-dados` | 1 | Dados pessoais, status vivo/falecido, redes sociais e questionário IA com tela final `Seu Perfil`. |
| `/meus-vinculos` | 2 | Vínculos familiares, cônjuges, filhos, irmãos e pets. Mini Bio/Curiosidades não ficam mais nesta página. |
| `/arquivos-historicos` | 3 | Fatos e arquivos históricos. |
| `/preferencias` | 4 | Apenas pessoa viva. |
| `/revisao-dados` | 5 | Revisão final e eventuais pendências de edição/responsabilidade. |
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

## Rotas de mapa

| Rota | Uso |
|---|---|
| `/mapa-familiar` | Mapa vertical e principal. |
| `/mapa-familiar-horizontal` | Visualização horizontal. |
| `/linha-geracional` | Visualização geracional mobile/dedicada. |
| `/` | Pode redirecionar para mapa preservando query. |

## Retorno seguro para árvore

Parâmetros de retorno devem aceitar apenas paths internos permitidos, como:

- `/`;
- `/mapa-familiar`;
- `/mapa-familiar-horizontal`;
- `/linha-geracional` quando o fluxo permitir.

Não aceitar URL externa.

## Rotas de perfil

| Rota | Uso |
|---|---|
| `/pessoa/:id` | Perfil individual com dados, vínculos, fórum, arquivos e timeline. |
| `/pessoas/:id` | Alias de perfil individual. |

## Rotas administrativas

| Rota | Uso | Guard |
|---|---|---|
| `/admin/login` | Login administrativo. | Pública |
| `/admin` | Dashboard administrativo. | `ProtectedRoute` |
| `/admin/dashboard` | Alias do dashboard. | `ProtectedRoute` |
| `/aprovacoes` | Aprovações administrativas. | `ProtectedRoute` |
| `/admin/aprovacoes` | Alias administrativo de aprovações. | `ProtectedRoute` |
| `/admin/home` | Configurações públicas/home. | `ProtectedRoute` |
| `/admin/responsaveis` | Responsáveis por perfis legados e crianças. | `ProtectedRoute` |
| `/admin/gestao-conteudo-pessoas` | Textos automáticos e visibilidade de pessoas. | `ProtectedRoute` |

Demais subrotas administrativas declaradas em `src/app/routes.tsx` também devem permanecer protegidas por `ProtectedRoute`.

## Não regressões

- Não remover preservação de query string onde o fluxo depende dela.
- Não reintroduzir ações no header do onboarding quando a rota exigir header simplificado.
- Não tratar `/preferencias` como obrigatória para pessoa falecida.
- Não expor rotas admin para membro sem guard.
- Não remover `/aprovacoes` quando o card do dashboard apontar para essa rota.
