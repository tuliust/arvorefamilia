# Calendário Familiar

> Local recomendado: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`  
> Tipo: documentação funcional específica.

---

## 1. Status

- Funcional no escopo atual do MVP.
- Rota: `/calendario-familiar`.
- Proteção: `MemberRoute`.
- Usa eventos derivados de pessoas, relacionamentos e datas familiares.
- Integração com Google Agenda existe na UI e deve ser tratada com cuidado, porque depende do shape dos eventos.

---

## 2. Objetivo

O Calendário Familiar organiza datas familiares relevantes em uma visualização mensal.

A funcionalidade deve permitir que membros da família acompanhem:

- aniversários;
- datas de casamento;
- datas de falecimento/memória;
- eventos históricos familiares;
- confraternizações.

---

## 3. Arquivos principais

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
src/app/routes.tsx
```

Arquivos relacionados:

```txt
src/app/components/layout/MemberPageHeader.tsx
src/app/components/AppLink.tsx
src/app/services/googleCalendarService.ts
src/app/types/index.ts
```

Documentos relacionados:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

## 4. Rota e navegação

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/calendario-familiar` | `CalendarioFamiliar.tsx` | `MemberRoute` | Exibir calendário mensal familiar. |

Regras:

- a página deve usar header interno padronizado com `MemberPageHeader`;
- deve ser acessível para usuário autenticado/membro;
- não deve expor administração;
- navegação interna deve usar client-side navigation quando possível.

---

## 5. Comportamento consolidado

- Navegação por mês com botões de mês anterior/próximo.
- Grid mensal com dias da semana.
- Dia atual destacado.
- Até 3 eventos visíveis por dia no grid compacto.
- Lista lateral/inferior de aniversariantes e dias de falecimento do mês.
- Sidebar **Categorias** com filtros clicáveis.
- Categorias ficam em `activeCategories`.
- Categorias são alternadas por `toggleCategory`.
- Contadores usam singular/plural: **1 evento**, **2 eventos**.
- Card de aniversário no grid usa primeiro nome para caber no espaço compacto.
- Lista de aniversariantes pode manter nome completo.
- Descrição de aniversário usa **“Faz X anos”**.
- Eventos do mês são considerados para contadores da sidebar.

---

## 6. Categorias

Categorias existentes em `CalendarEventCategory`:

```txt
aniversarios
casamento
falecimento
eventos_historicos
confraternizacoes
```

Função central:

```txt
getCalendarCategory
```

Responsabilidade:

- mapear o tipo de evento para categoria;
- manter contadores consistentes;
- permitir filtros clicáveis;
- evitar duplicação de regras de categoria dentro do componente.

Regra:

```txt
Os contadores da sidebar consideram os eventos do mês exibido,
não apenas os eventos atualmente ativos no filtro.
```

---

## 7. Microcopy

Regras de texto:

- não usar **“item(ns)”**;
- usar **“evento”** e **“eventos”**;
- usar **“Faz X anos”** para idade/aniversário;
- evitar nome completo no card compacto do grid quando o contexto for aniversário;
- a lista lateral/inferior pode manter nome completo.

Exemplos:

| Contexto | Texto esperado |
|---|---|
| 1 evento | `1 evento` |
| 2 ou mais eventos | `N eventos` |
| Aniversário | `Faz X anos` |
| Card compacto de aniversário | primeiro nome |
| Lista de aniversariantes | nome completo permitido |

---

## 8. Google Agenda

A UI permite:

- conectar Google Agenda;
- exibir conta conectada;
- exibir última sincronização;
- escolher sincronização de aniversários;
- escolher sincronização de datas de memória;
- sincronizar agora;
- desconectar.

Regras:

- não alterar `familyDates.ts` sem avaliar impacto em sincronização/exportação;
- qualquer mudança no shape de `EventoCalendarioFamiliar` deve considerar consumidores atuais e futuros;
- tokens/secrets de Google Agenda não devem ir para frontend;
- operações sensíveis devem continuar protegidas por Edge Functions/service adequado;
- validar conectar/sincronizar/desconectar quando a frente for alterada.

---

## 9. Responsividade

Regras:

- calendário precisa funcionar em desktop, tablet e mobile;
- sidebar pode virar bloco empilhado em telas menores;
- grid mensal não deve causar overflow horizontal global;
- cards compactos devem truncar texto quando necessário;
- lista inferior/lateral deve usar quebra de linha segura.

Larguras de QA:

```txt
320px
375px
390px
430px
768px
desktop
```

---

## 10. Troubleshooting

### Categorias não filtram

Verificar:

```txt
activeCategories
toggleCategory
getCalendarCategory
aria-pressed
estilo ativo/inativo dos botões
```

Correção:

- confirmar que o clique altera `activeCategories`;
- confirmar que a lista filtrada usa categorias ativas;
- confirmar que a sidebar não está apenas visualmente ativa.

---

### Contadores aparecem como número cru

Verificar:

```txt
formatEventCount
```

Regra:

```txt
1 evento
N eventos
```

Não usar:

```txt
item
itens
item(ns)
```

---

### Aniversário volta a mostrar nome completo no grid

Verificar:

```txt
formatCalendarEventTitle
```

Regra:

- grid compacto usa primeiro nome em aniversários;
- lista de aniversariantes pode continuar com nome completo.

---

### Texto `item(ns)` voltou

Correção:

- procurar texto literal na página;
- substituir por `evento/eventos`;
- centralizar em `formatEventCount`.

---

### Google Agenda foi afetado por mudança visual

Verificar:

```txt
criarEventosDoCalendario
EventoCalendarioFamiliar
googleCalendarService
Edge Functions relacionadas
```

Correção:

- confirmar que o shape dos eventos não mudou sem necessidade;
- validar conectar;
- validar sincronizar;
- validar desconectar;
- validar erros de permissão/token.

---

### Página quebra com `Link is not defined`

Causa provável:

- import de `AppLink as Link` removido durante padronização visual;
- algum trecho ainda usa `<Link>`.

Correção:

```ts
import { AppLink as Link } from '../components/AppLink';
```

---

## 11. Checklist de QA

### QA técnico

```bash
npm run build
npm test
git diff --check
```

Se houver mudança de rota, navegação ou integração:

```bash
npm run test:e2e
```

### QA manual

- abrir `/calendario-familiar`;
- trocar mês;
- voltar mês;
- clicar em categorias da sidebar;
- validar singular/plural dos contadores;
- validar aniversário no grid;
- validar aniversário na lista;
- validar dia atual destacado;
- validar desktop;
- validar 768px;
- validar 430px;
- validar 390px;
- validar 375px;
- validar 320px;
- garantir ausência de overflow horizontal global;
- se Google Agenda foi afetado, validar conectar/sincronizar/desconectar.

---

## 12. Pós-MVP

Possíveis evoluções:

- integração operacional completa com Google Agenda;
- exportação ICS;
- lembretes configuráveis;
- eventos criados por usuários;
- eventos com aprovação/admin;
- convidados/participantes;
- notificações automáticas de eventos;
- integração com timeline familiar;
- filtros persistidos por usuário;
- visualização anual;
- impressão/exportação do calendário.

Esses itens não bloqueiam o MVP.

---

## 13. Regras de manutenção

Não fazer:

- alterar shape de `EventoCalendarioFamiliar` sem revisar consumidores;
- trocar microcopy de eventos por `item(ns)`;
- remover `formatEventCount`;
- quebrar Google Agenda por ajuste visual;
- criar migration para ajuste puramente visual;
- expor tokens/secrets do Google no frontend.

Fazer:

- manter categoria centralizada;
- manter contadores legíveis;
- validar mobile;
- preservar fallback de erros;
- documentar mudança funcional neste arquivo.
