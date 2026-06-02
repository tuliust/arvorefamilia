# Calendario Familiar

> Local recomendado: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`
> Tipo: documentacao funcional especifica.

---

## 1. Status

- Funcional no escopo atual do MVP.
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
- Dia atual destacado.
- Ate 3 eventos visiveis por dia no grid compacto.
- Lista lateral/inferior de aniversariantes e memoria do mes.
- Card lateral **Memoria** so aparece quando houver ao menos um falecimento no mes exibido com os filtros atuais.
- Sidebar **Categorias** com filtros clicaveis.
- Categorias ficam em `activeCategories`.
- Categorias sao alternadas por `toggleCategory`.
- Contadores usam singular/plural: **1 evento**, **2 eventos**.
- Card de aniversario no grid usa primeiro nome para caber no espaco compacto.
- Lista de aniversariantes pode manter nome completo.
- Descricao de aniversario usa **Faz X anos**.
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

---

## 7. Microcopy

Regras de texto:

- nao usar **item(ns)**;
- usar **evento** e **eventos**;
- usar **Faz X anos** para idade/aniversario;
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
| Card compacto de aniversario | primeiro nome |
| Lista de aniversariantes | nome completo permitido |
| Card compacto de falecimento | `44 anos de falecimento` |
| Descricao compacta de falecimento | `Memoria de Nome Completo` |
| Card Memoria com anos | `44 anos da morte de Nome Completo` |
| Card Memoria sem anos | `Morte de Nome Completo` |

---

## 8. Google Agenda

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

## 9. Responsividade

Regras:

- calendario precisa funcionar em desktop, tablet e mobile;
- sidebar pode virar bloco empilhado em telas menores;
- grid mensal nao deve causar overflow horizontal global;
- cards compactos devem truncar texto quando necessario;
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
- confirmar que a sidebar nao esta apenas visualmente ativa.

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

### Pagina quebra com `Link is not defined`

Causa provavel:

- import de `AppLink as Link` removido durante padronizacao visual;
- algum trecho ainda usa `<Link>`.

Correcao:

```ts
import { AppLink as Link } from '../components/AppLink';
```

---

## 11. Checklist de QA

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
- validar singular/plural dos contadores;
- validar aniversario no grid;
- validar aniversario na lista;
- validar falecimento no grid com titulo compacto e descricao separada;
- validar card **Memoria** com texto **anos da morte de**;
- validar que **Memoria** aparece apenas quando houver itens;
- validar setas de mes anterior/proximo com o texto do mes centralizado;
- validar dia atual destacado;
- validar desktop;
- validar 768px;
- validar 430px;
- validar 390px;
- validar 375px;
- validar 320px;
- garantir ausencia de overflow horizontal global;
- se Google Agenda foi afetado, validar conectar/sincronizar/desconectar.

---

## 12. Pos-MVP

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

## 13. Regras de manutencao

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
