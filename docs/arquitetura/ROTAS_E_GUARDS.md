# Rotas e guards

> Última revisão: 2026-06-22

## Rotas de onboarding

| Rota | Etapa | Observações |
|---|---:|---|
| `/meus-dados` | 1 | Dados pessoais e questionário IA. |
| `/meus-vinculos` | 2 | Mini Bio/Curiosidades e vínculos. |
| `/arquivos-historicos` | 3 | Fatos e arquivos históricos. |
| `/preferencias` | 4 | Apenas pessoa viva. |
| `/revisao-dados` | 5 | Revisão final. |
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

## Header nessas rotas

Rotas de onboarding usam header sem ações.

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

## Rotas de mapa

| Rota | Uso |
|---|---|
| `/mapa-familiar` | Mapa vertical e principal. |
| `/mapa-familiar-horizontal` | Visualização horizontal. |
| `/` | Pode redirecionar para mapa preservando query. |

## Retorno seguro para árvore

Parâmetros de retorno devem aceitar apenas paths internos permitidos, como:

- `/`;
- `/mapa-familiar`;
- `/mapa-familiar-horizontal`.

Não aceitar URL externa.

## Rotas de perfil

| Rota | Uso |
|---|---|
| `/pessoa/:id` | Perfil individual com dados, vínculos, fórum, arquivos e timeline. |

## Não regressões

- Não remover preservação de query string onde o fluxo depende dela.
- Não reintroduzir ações no header do onboarding.
- Não tratar `/preferencias` como obrigatória para pessoa falecida.
- Não expor rotas admin para membro sem guard.
