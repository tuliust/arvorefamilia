# Calendário Familiar

## Status

- Funcional no escopo atual do MVP.
- Rota: `/calendario-familiar`.
- Usa eventos derivados de pessoas, relacionamentos e datas familiares.
- A integração com Google Agenda existe na UI e deve ser tratada com cuidado, porque depende do shape dos eventos.

## Arquivos principais

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
src/app/routes.tsx
```

## Comportamento consolidado

- Navegação por mês com botões de mês anterior/próximo.
- Grid mensal com dias da semana, dia atual destacado e até 3 eventos visíveis por dia.
- Lista lateral/inferior de aniversariantes e dias de falecimento do mês.
- Sidebar **Categorias** com filtros clicáveis.
- Categorias ficam em `activeCategories` e são alternadas por `toggleCategory`.
- Contadores usam singular/plural: **1 evento**, **2 eventos**.
- Card de aniversário no grid usa primeiro nome para caber no espaço compacto.
- Lista de aniversariantes pode manter nome completo.
- Descrição de aniversário usa **“Faz X anos”**.

## Categorias

Categorias existentes em `CalendarEventCategory`:

- `aniversarios`
- `casamento`
- `falecimento`
- `eventos_historicos`
- `confraternizacoes`

`getCalendarCategory` centraliza o mapeamento de tipo para categoria. Os contadores da sidebar consideram os eventos do mês exibido e não apenas os eventos atualmente ativos no filtro.

## Microcopy

- Não usar **“item(ns)”**.
- Usar **“evento”** e **“eventos”**.
- Usar **“Faz X anos”** para idade/aniversário.
- Evitar nome completo no card compacto do grid quando o contexto for aniversário.

## Google Agenda

A UI permite:

- conectar Google Agenda;
- exibir conta conectada e última sincronização;
- escolher sincronização de aniversários e datas de memória;
- sincronizar agora;
- desconectar.

Não alterar `familyDates.ts` sem avaliar impacto em sincronização/exportação. Qualquer mudança no shape de `EventoCalendarioFamiliar` deve considerar consumidores atuais e futuros, incluindo Google Agenda.

## Troubleshooting

### Categorias não filtram

- Verificar `activeCategories`.
- Verificar `toggleCategory`.
- Verificar `getCalendarCategory`.
- Confirmar `aria-pressed` e estilo ativo/inativo dos botões.

### Contadores aparecem como número cru

- Verificar `formatEventCount`.
- Manter **1 evento** e **N eventos**.

### Aniversário volta a mostrar nome completo no grid

- Verificar `formatCalendarEventTitle`.
- O grid deve usar primeiro nome em aniversários.
- A lista de aniversariantes pode continuar com nome completo.

### `item(ns)` voltou

- Procurar texto literal na página.
- Substituir por **evento/eventos** via `formatEventCount`.

### Google Agenda foi afetado por mudança visual

- Conferir se `criarEventosDoCalendario` e `EventoCalendarioFamiliar` não mudaram sem necessidade.
- Validar conectar/sincronizar/desconectar quando a frente estiver em QA operacional.

## Checklist de QA

- Abrir `/calendario-familiar`.
- Trocar mês.
- Clicar em categorias da sidebar.
- Validar singular/plural dos contadores.
- Validar aniversário no grid e na lista.
- Validar desktop e mobile.
- Rodar `npm run build`.
- Rodar `npm test`.
- Rodar `git diff --check`.
