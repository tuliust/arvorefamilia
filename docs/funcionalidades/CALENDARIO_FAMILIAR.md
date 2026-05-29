# CalendÃ¡rio Familiar

> Local recomendado: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`
> Tipo: documentaÃ§Ã£o funcional especÃ­fica.

---

## 1. Status

- Funcional no escopo atual do MVP.
- Rota: `/calendario-familiar`.
- ProteÃ§Ã£o: `MemberRoute`.
- Usa eventos derivados de pessoas, relacionamentos e datas familiares.
- IntegraÃ§Ã£o com Google Agenda existe na UI e deve ser tratada com cuidado, porque depende do shape dos eventos.

---

## 2. Objetivo

O CalendÃ¡rio Familiar organiza datas familiares relevantes em uma visualizaÃ§Ã£o mensal.

A funcionalidade deve permitir que membros da famÃ­lia acompanhem:

- aniversÃ¡rios;
- datas de casamento;
- datas de falecimento/memÃ³ria;
- eventos histÃ³ricos familiares;
- confraternizaÃ§Ãµes.

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

## 4. Rota e navegaÃ§Ã£o

| Rota | Componente | ProteÃ§Ã£o | FunÃ§Ã£o |
|---|---|---|---|
| `/calendario-familiar` | `CalendarioFamiliar.tsx` | `MemberRoute` | Exibir calendÃ¡rio mensal familiar. |

Regras:

- a pÃ¡gina deve usar header interno padronizado com `MemberPageHeader`;
- deve ser acessÃ­vel para usuÃ¡rio autenticado/membro;
- nÃ£o deve expor administraÃ§Ã£o;
- navegaÃ§Ã£o interna deve usar client-side navigation quando possÃ­vel.

---

## 5. Comportamento consolidado

- NavegaÃ§Ã£o por mÃªs com botÃµes de mÃªs anterior/prÃ³ximo.
- Grid mensal com dias da semana.
- Dia atual destacado.
- AtÃ© 3 eventos visÃ­veis por dia no grid compacto.
- Lista lateral/inferior de aniversariantes e dias de falecimento do mÃªs.
- Sidebar **Categorias** com filtros clicÃ¡veis.
- Categorias ficam em `activeCategories`.
- Categorias sÃ£o alternadas por `toggleCategory`.
- Contadores usam singular/plural: **1 evento**, **2 eventos**.
- Card de aniversÃ¡rio no grid usa primeiro nome para caber no espaÃ§o compacto.
- Lista de aniversariantes pode manter nome completo.
- DescriÃ§Ã£o de aniversÃ¡rio usa **â€œFaz X anosâ€**.
- Eventos do mÃªs sÃ£o considerados para contadores da sidebar.

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

FunÃ§Ã£o central:

```txt
getCalendarCategory
```

Responsabilidade:

- mapear o tipo de evento para categoria;
- manter contadores consistentes;
- permitir filtros clicÃ¡veis;
- evitar duplicaÃ§Ã£o de regras de categoria dentro do componente.

Regra:

```txt
Os contadores da sidebar consideram os eventos do mÃªs exibido,
nÃ£o apenas os eventos atualmente ativos no filtro.
```

---

## 7. Microcopy

Regras de texto:

- nÃ£o usar **â€œitem(ns)â€**;
- usar **â€œeventoâ€** e **â€œeventosâ€**;
- usar **â€œFaz X anosâ€** para idade/aniversÃ¡rio;
- evitar nome completo no card compacto do grid quando o contexto for aniversÃ¡rio;
- a lista lateral/inferior pode manter nome completo.

Exemplos:

| Contexto | Texto esperado |
|---|---|
| 1 evento | `1 evento` |
| 2 ou mais eventos | `N eventos` |
| AniversÃ¡rio | `Faz X anos` |
| Card compacto de aniversÃ¡rio | primeiro nome |
| Lista de aniversariantes | nome completo permitido |

---

## 8. Google Agenda

A UI permite:

- conectar Google Agenda;
- exibir conta conectada;
- exibir Ãºltima sincronizaÃ§Ã£o;
- escolher sincronizaÃ§Ã£o de aniversÃ¡rios;
- escolher sincronizaÃ§Ã£o de datas de memÃ³ria;
- sincronizar agora;
- desconectar.

Regras:

- nÃ£o alterar `familyDates.ts` sem avaliar impacto em sincronizaÃ§Ã£o/exportaÃ§Ã£o;
- qualquer mudanÃ§a no shape de `EventoCalendarioFamiliar` deve considerar consumidores atuais e futuros;
- tokens/secrets de Google Agenda nÃ£o devem ir para frontend;
- operaÃ§Ãµes sensÃ­veis devem continuar protegidas por Edge Functions/service adequado;
- validar conectar/sincronizar/desconectar quando a frente for alterada.

---

## 9. Responsividade

Regras:

- calendÃ¡rio precisa funcionar em desktop, tablet e mobile;
- sidebar pode virar bloco empilhado em telas menores;
- grid mensal nÃ£o deve causar overflow horizontal global;
- cards compactos devem truncar texto quando necessÃ¡rio;
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

### Categorias nÃ£o filtram

Verificar:

```txt
activeCategories
toggleCategory
getCalendarCategory
aria-pressed
estilo ativo/inativo dos botÃµes
```

CorreÃ§Ã£o:

- confirmar que o clique altera `activeCategories`;
- confirmar que a lista filtrada usa categorias ativas;
- confirmar que a sidebar nÃ£o estÃ¡ apenas visualmente ativa.

---

### Contadores aparecem como nÃºmero cru

Verificar:

```txt
formatEventCount
```

Regra:

```txt
1 evento
N eventos
```

NÃ£o usar:

```txt
item
itens
item(ns)
```

---

### AniversÃ¡rio volta a mostrar nome completo no grid

Verificar:

```txt
formatCalendarEventTitle
```

Regra:

- grid compacto usa primeiro nome em aniversÃ¡rios;
- lista de aniversariantes pode continuar com nome completo.

---

### Texto `item(ns)` voltou

CorreÃ§Ã£o:

- procurar texto literal na pÃ¡gina;
- substituir por `evento/eventos`;
- centralizar em `formatEventCount`.

---

### Google Agenda foi afetado por mudanÃ§a visual

Verificar:

```txt
criarEventosDoCalendario
EventoCalendarioFamiliar
googleCalendarService
Edge Functions relacionadas
```

CorreÃ§Ã£o:

- confirmar que o shape dos eventos nÃ£o mudou sem necessidade;
- validar conectar;
- validar sincronizar;
- validar desconectar;
- validar erros de permissÃ£o/token.

---

### PÃ¡gina quebra com `Link is not defined`

Causa provÃ¡vel:

- import de `AppLink as Link` removido durante padronizaÃ§Ã£o visual;
- algum trecho ainda usa `<Link>`.

CorreÃ§Ã£o:

```ts
import { AppLink as Link } from '../components/AppLink';
```

---

## 11. Checklist de QA

### QA tÃ©cnico

```bash
npm run build
npm test
git diff --check
```

Se houver mudanÃ§a de rota, navegaÃ§Ã£o ou integraÃ§Ã£o:

```bash
npm run test:e2e
```

### QA manual

- abrir `/calendario-familiar`;
- trocar mÃªs;
- voltar mÃªs;
- clicar em categorias da sidebar;
- validar singular/plural dos contadores;
- validar aniversÃ¡rio no grid;
- validar aniversÃ¡rio na lista;
- validar dia atual destacado;
- validar desktop;
- validar 768px;
- validar 430px;
- validar 390px;
- validar 375px;
- validar 320px;
- garantir ausÃªncia de overflow horizontal global;
- se Google Agenda foi afetado, validar conectar/sincronizar/desconectar.

---

## 12. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- integraÃ§Ã£o operacional completa com Google Agenda;
- exportaÃ§Ã£o ICS;
- lembretes configurÃ¡veis;
- eventos criados por usuÃ¡rios;
- eventos com aprovaÃ§Ã£o/admin;
- convidados/participantes;
- notificaÃ§Ãµes automÃ¡ticas de eventos;
- integraÃ§Ã£o com timeline familiar;
- filtros persistidos por usuÃ¡rio;
- visualizaÃ§Ã£o anual;
- impressÃ£o/exportaÃ§Ã£o do calendÃ¡rio.

Esses itens nÃ£o bloqueiam o MVP.

---

## 13. Regras de manutenÃ§Ã£o

NÃ£o fazer:

- alterar shape de `EventoCalendarioFamiliar` sem revisar consumidores;
- trocar microcopy de eventos por `item(ns)`;
- remover `formatEventCount`;
- quebrar Google Agenda por ajuste visual;
- criar migration para ajuste puramente visual;
- expor tokens/secrets do Google no frontend.

Fazer:

- manter categoria centralizada;
- manter contadores legÃ­veis;
- validar mobile;
- preservar fallback de erros;
- documentar mudanÃ§a funcional neste arquivo.
