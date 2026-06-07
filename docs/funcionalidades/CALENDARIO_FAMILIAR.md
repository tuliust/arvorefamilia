# Calendario Familiar

> Ultima revisao: 2026-06-07
> Local recomendado: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`
> Tipo: documentacao funcional especifica.

---

## 1. Status

- Funcional no escopo atual do MVP.
- Header e microcopy revisados para evitar mojibake em **Calendario**, **Reuniao** e labels relacionadas.
- Rota: `/calendario-familiar`.
- Protecao: `MemberRoute`.
- Usa eventos derivados de pessoas, relacionamentos e datas familiares.
- Integracao com Google Agenda existe na UI e deve ser tratada com cuidado, porque depende do shape dos eventos.
- Tokens/secrets de Google Agenda nao devem ser expostos no frontend.

---

## 2. Objetivo

O Calendario Familiar organiza datas familiares relevantes em uma visualizacao mensal.

A funcionalidade deve permitir que membros da familia acompanhem:

- aniversarios;
- datas de casamento;
- datas de falecimento/memoria;
- eventos historicos familiares;
- confraternizacoes.

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
docs/funcionalidades/NOTIFICACOES.md
docs/historico/AJUSTES_MOBILE_2026-06-02.md
```

---

## 4. Rota e navegacao

| Rota | Componente | Protecao | Funcao |
|---|---|---|---|
| `/calendario-familiar` | `CalendarioFamiliar.tsx` | `MemberRoute` | Exibir calendario mensal familiar. |

Regras:

- a pagina deve usar header interno padronizado com `MemberPageHeader`;
- deve ser acessivel para usuario autenticado/membro;
- nao deve expor administracao;
- navegacao interna deve usar client-side navigation quando possivel.

---

## 5. Comportamento consolidado

- Navegacao por mes com botoes de mes anterior/proximo.
- Grid mensal com dias da semana.
- Dia atual destacado em cinza claro, sem usar azul nem cinza escuro dominante.
- Ate 3 eventos visiveis por dia no grid desktop/tablet.
- No mobile, o dia com evento exibe bolinha colorida compacta.
- No mobile, tocar na bolinha colorida nao abre modal por padrao; deve rolar/ancorar para um card de resumo.
- Lista lateral/inferior de aniversariantes e memoria do mes.
- Card lateral **Memoria** so aparece quando houver ao menos um falecimento no mes exibido com os filtros atuais.
- Sidebar **Categorias** com filtros clicaveis.
- Legenda/filtros mobile tambem alternam categorias, usando o mesmo estado de filtro da sidebar.
- Categorias ficam em `activeCategories`.
- Categorias sao alternadas por `toggleCategory`.
- Contadores usam singular/plural: **1 evento**, **2 eventos**.
- Card de aniversario no grid usa primeiro nome para caber no espaco compacto.
- Lista de aniversariantes pode manter nome completo.
- Descricao de aniversario usa **Faz X anos**.
- No grid desktop/tablet, o titulo compacto do evento deve aparecer em negrito ou peso forte.
- No grid desktop/tablet, a descricao secundaria, como **Faz X anos**, deve usar fonte menor.
- Eventos de falecimento no grid usam titulo compacto, como **44 anos de falecimento**, e descricao separada, como **Memoria de Nome Completo**.
- Card lateral **Memoria** usa microcopy propria: **44 anos da morte de Nome Completo** ou **Morte de Nome Completo** quando nao houver anos.
- O controle do mes exibido usa estrutura visual em 3 colunas: seta anterior, texto centralizado e seta proximo.
- Eventos do mes sao considerados para contadores da sidebar.

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

Funcao central:

```txt
getCalendarCategory
```

Responsabilidade:

- mapear o tipo de evento para categoria;
- manter contadores consistentes;
- permitir filtros clicaveis;
- evitar duplicacao de regras de categoria dentro do componente.

Regra:

```txt
Os contadores da sidebar consideram os eventos do mes exibido,
nao apenas os eventos atualmente ativos no filtro.
```

### 6.1 Legenda/filtros mobile

No mobile, o card de legenda abaixo de **Mes exibido** deve funcionar tambem como filtro.

Categorias exibidas no card mobile:

```txt
Aniversario
Casamento
Falecimento
Outros
Reuniao
```

Regra de encoding:

- a UI nao deve exibir `Reuni\u00e3o`, `ReuniÃ£o`, `Reuni?o` ou variantes corrompidas;
- se o ambiente estiver com UTF-8 pleno, validar **Reunião** visualmente.

Regras:

- cada item deve ser botao clicavel;
- cada item deve chamar `toggleCategory(category)`;
- cada item deve refletir estado ativo/inativo via `activeCategories`;
- cada item deve usar `aria-pressed`;
- estado inativo pode usar opacidade reduzida e fundo branco;
- estado ativo deve manter cor visual da categoria;
- nao duplicar estado local de filtro apenas para o mobile.

---

## 7. Interacao mobile com bolinhas do calendario

No mobile, a bolinha colorida do dia deve servir como atalho para o resumo do mes, nao como abertura do modal de eventos do dia.

Regra de destino:

| Evento do dia | Destino esperado |
|---|---|
| Aniversario | Card **Aniversariantes** |
| Falecimento/memoria | Card **Memoria** |
| Outros eventos sem card especifico | Card **Categorias** ou resumo equivalente |

Implementacao esperada:

```txt
scrollToMonthSummary(eventosDia)
```

Comportamento:

- se houver aniversario no dia, priorizar `#aniversariantes`;
- se nao houver aniversario e houver falecimento, usar `#memoria`;
- se nao houver card especifico, usar `#categorias-calendario`;
- usar `scrollIntoView({ behavior: 'smooth', block: 'start' })` quando o alvo existir;
- manter o modal de eventos apenas se uma decisao futura reintroduzir esse comportamento explicitamente.

---

## 8. Microcopy

Regras de texto:

- nao usar **item(ns)**;
- usar **evento** e **eventos**;
- usar **Faz X anos** para idade/aniversario;
- no grid, o titulo do evento deve ter peso forte/negrito;
- no grid, a descricao secundaria deve usar fonte menor que o titulo;
- evitar nome completo no card compacto do grid quando o contexto for aniversario;
- a lista lateral/inferior pode manter nome completo.
- no grid, falecimento com anos deve separar:
  `44 anos de falecimento de Jackson Souza Sobral` -> titulo `44 anos de falecimento` e descricao `Memoria de Jackson Souza Sobral`;
- no grid, falecimento sem anos usa titulo `Falecimento` e descricao `Memoria de {evento.nome}`;
- no card **Memoria**, falecimento com anos usa `{X} anos da morte de {evento.nome}`;
- no card **Memoria**, falecimento sem anos usa `Morte de {evento.nome}`.

Exemplos:

| Contexto | Texto esperado |
|---|---|
| 1 evento | `1 evento` |
| 2 ou mais eventos | `N eventos` |
| Aniversario | `Faz X anos` |
| Titulo de aniversario no grid | primeiro nome em negrito/peso forte |
| Descricao de aniversario no grid | `Faz X anos` em fonte menor |
| Card compacto de aniversario | primeiro nome |
| Lista de aniversariantes | nome completo permitido |
| Card compacto de falecimento | `44 anos de falecimento` |
| Descricao compacta de falecimento | `Memoria de Nome Completo` |
| Card Memoria com anos | `44 anos da morte de Nome Completo` |
| Card Memoria sem anos | `Morte de Nome Completo` |

---

## 9. Google Agenda

A UI permite:

- conectar Google Agenda;
- exibir conta conectada;
- exibir ultima sincronizacao;
- escolher sincronizacao de aniversarios;
- escolher sincronizacao de datas de memoria;
- sincronizar agora;
- desconectar.

Regras:

- nao alterar `familyDates.ts` sem avaliar impacto em sincronizacao/exportacao;
- qualquer mudanca no shape de `EventoCalendarioFamiliar` deve considerar consumidores atuais e futuros;
- tokens/secrets de Google Agenda nao devem ir para frontend;
- operacoes sensiveis devem continuar protegidas por Edge Functions/service adequado;
- validar conectar/sincronizar/desconectar quando a frente for alterada.

---

## 10. Responsividade

Regras:

- calendario precisa funcionar em desktop, tablet e mobile;
- sidebar pode virar bloco empilhado em telas menores;
- grid mensal nao deve causar overflow horizontal global;
- cards compactos devem truncar texto quando necessario;
- lista inferior/lateral deve usar quebra de linha segura;
- filtros mobile devem caber em telas estreitas sem criar overflow horizontal;
- o destaque do dia atual deve ser perceptivel sem escurecer demais o grid.

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

## 11. Troubleshooting

### Categorias nao filtram

Verificar:

```txt
activeCategories
toggleCategory
getCalendarCategory
aria-pressed
estilo ativo/inativo dos botoes
```

Correcao:

- confirmar que o clique altera `activeCategories`;
- confirmar que a lista filtrada usa categorias ativas;
- confirmar que a sidebar nao esta apenas visualmente ativa;
- confirmar que a legenda mobile nao criou estado paralelo ao da sidebar.

---

### Bolinha mobile ainda abre modal

Verificar:

```txt
openDayEvents
scrollToMonthSummary
onClick da bolinha mobile
selectedDayEvents
```

Regra:

- a bolinha mobile deve chamar `scrollToMonthSummary(eventosDia)`;
- nao deve chamar `openDayEvents(dia, eventosDia)` como comportamento padrao;
- cards de destino devem ter IDs estaveis: `aniversariantes`, `memoria`, `categorias-calendario`.

---

### Contadores aparecem como numero cru

Verificar:

```txt
formatEventCount
```

Regra:

```txt
1 evento
N eventos
```

Nao usar:

```txt
item
itens
item(ns)
```

---

### Aniversario volta a mostrar nome completo no grid

Verificar:

```txt
formatCalendarEventTitle
```

Regra:

- grid compacto usa primeiro nome em aniversarios;
- lista de aniversariantes pode continuar com nome completo.

---

### Card Memoria aparece vazio

Verificar:

```txt
falecimentosMes.length
src/app/pages/CalendarioFamiliar.tsx
```

Regra:

- o card **Memoria** nao deve aparecer quando `falecimentosMes.length === 0`;
- nao substituir o card vazio por mensagem de estado vazio na sidebar;
- a categoria **Dia de Falecimento** pode continuar aparecendo na lista de categorias com contador `0 eventos`.

---

### Texto `item(ns)` voltou

Correcao:

- procurar texto literal na pagina;
- substituir por `evento/eventos`;
- centralizar em `formatEventCount`.

---

### Google Agenda foi afetado por mudanca visual

Verificar:

```txt
criarEventosDoCalendario
EventoCalendarioFamiliar
googleCalendarService
Edge Functions relacionadas
```

Correcao:

- confirmar que o shape dos eventos nao mudou sem necessidade;
- validar conectar;
- validar sincronizar;
- validar desconectar;
- validar erros de permissao/token.

---

### Texto do header ou categorias aparece com mojibake

Sintomas:

```txt
Calend\u00e1rio
CalendÃ¡rio
Calend?rio
Reuni\u00e3o
ReuniÃ£o
```

Correcao:

- revisar strings literais em `CalendarioFamiliar.tsx`;
- salvar o arquivo em UTF-8;
- validar visualmente o header e a legenda/filtro mobile;
- rodar `git diff --check` e `npm run build`.

---

### Evento de aniversario sem hierarquia visual

Sintoma:

- `Aniversario de Nome` e `Faz X anos` aparecem com o mesmo peso/tamanho no grid.

Correcao:

- aplicar peso forte ao titulo do evento;
- aplicar texto menor na descricao secundaria;
- preservar truncamento e altura compacta do card.

---

### Pagina quebra com `Link is not defined`

Causa provavel:

- import de `AppLink as Link` removido durante padronizacao visual;
- algum trecho ainda usa `<Link>`.

Correcao:

```ts
import { AppLink as Link } from '../components/AppLink';
```

---

## 12. Checklist de QA

### QA tecnico

```bash
npm run build
npm test
git diff --check
```

Se houver mudanca de rota, navegacao ou integracao:

```bash
npm run test:e2e
```

### QA manual

- abrir `/calendario-familiar`;
- trocar mes;
- voltar mes;
- clicar em categorias da sidebar;
- clicar em categorias da legenda/filtro mobile;
- validar singular/plural dos contadores;
- validar aniversario no grid;
- validar titulo de aniversario em negrito/peso forte;
- validar **Faz X anos** em fonte menor;
- validar aniversario na lista;
- validar falecimento no grid com titulo compacto e descricao separada;
- validar card **Memoria** com texto **anos da morte de**;
- validar que **Memoria** aparece apenas quando houver itens;
- validar setas de mes anterior/proximo com o texto do mes centralizado;
- validar dia atual destacado em cinza claro;
- validar que bolinha mobile ancora para **Aniversariantes**, **Memoria** ou **Categorias**;
- validar desktop;
- validar 768px;
- validar 430px;
- validar 390px;
- validar 375px;
- validar 320px;
- garantir ausencia de overflow horizontal global;
- se Google Agenda foi afetado, validar conectar/sincronizar/desconectar.

---

## 13. Pos-MVP

Possiveis evolucoes:

- integracao operacional completa com Google Agenda;
- exportacao ICS;
- lembretes configuraveis;
- eventos criados por usuarios;
- eventos com aprovacao/admin;
- convidados/participantes;
- notificacoes automaticas de eventos;
- integracao com timeline familiar;
- filtros persistidos por usuario;
- visualizacao anual;
- impressao/exportacao do calendario.

Esses itens nao bloqueiam o MVP.

---

## 14. Regras de manutencao

Nao fazer:

- alterar shape de `EventoCalendarioFamiliar` sem revisar consumidores;
- trocar microcopy de eventos por `item(ns)`;
- remover `formatEventCount`;
- quebrar Google Agenda por ajuste visual;
- criar migration para ajuste puramente visual;
- expor tokens/secrets do Google no frontend.

Fazer:

- manter categoria centralizada;
- manter contadores legiveis;
- validar mobile;
- preservar fallback de erros;
- documentar mudanca funcional neste arquivo.

---

## 15. Atualizacao 2026-06-07 - Header, microcopy e hierarquia dos eventos

Ajustes consolidados:

- o header da pagina deve exibir **Calendario** sem texto escapado ou mojibake;
- se a UI final estiver com UTF-8 pleno, validar visualmente **Calendário**;
- a categoria mobile **Reuniao** nao deve aparecer com escape ou caracteres corrompidos;
- no grid do calendario, aniversarios devem ter hierarquia visual clara:
  - titulo do evento em peso forte/negrito;
  - descricao, como **Faz X anos**, em fonte menor;
- esses ajustes sao apenas de renderizacao e nao mudam `EventoCalendarioFamiliar`, `familyDates.ts`, Google Agenda, Supabase ou regras de permissao.

Arquivos relacionados:

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/components/layout/MemberPageHeader.tsx
```

Checklist anti-regressao:

```txt
Header -> Calendario/Calendário sem mojibake
Filtro mobile -> Reuniao/Reunião sem mojibake
Grid -> titulo do aniversario em peso forte
Grid -> Faz X anos em fonte menor
Mobile -> bolinha continua funcionando como atalho para resumo
Google Agenda -> shape dos eventos preservado
```
