# Calendário Familiar

> Última revisão: 2026-06-14  
> Local canônico: `docs/funcionalidades/CALENDARIO_FAMILIAR.md`  
> Tipo: documentação funcional e técnica da rota `/calendario-familiar`.  
> Status: revisado após ajustes de compliance OAuth/Google Agenda e refatoração dos filtros mobile de categorias.

---

## 1. Objetivo

A rota `/calendario-familiar` exibe uma visão mensal de datas familiares relevantes para usuários autenticados.

A funcionalidade cobre:

- aniversários;
- datas de casamento;
- datas de falecimento/memória;
- eventos históricos familiares;
- confraternizações/reuniões;
- integração operacional com Google Agenda, quando configurada.

Este documento registra o comportamento vigente e os cuidados de manutenção. Histórico de ajustes antigos deve permanecer em `docs/historico/`.

A integração com Google Agenda também tem implicação de compliance/OAuth: a home pública `/entrar` deve declarar o nome do app e a finalidade da sincronização antes da autorização do usuário.

---

## 2. Arquivos principais

```txt
src/app/pages/CalendarioFamiliar.tsx
src/app/utils/familyDates.ts
src/app/services/googleCalendarService.ts
src/app/pages/Entrar.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/AppLink.tsx
src/app/routes.tsx
src/styles/calendar-mobile-category-buttons.css
```

Documentos relacionados:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/GUIA_CORRECAO_ERROS.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/funcionalidades/NOTIFICACOES.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## 3. Rota e proteção

| Rota | Componente | Proteção | Função |
|---|---|---|---|
| `/calendario-familiar` | `CalendarioFamiliar.tsx` | `MemberRoute` | Calendário mensal familiar. |

Regras:

- usuário não autenticado deve ser redirecionado para `/entrar`;
- a página usa `MemberPageHeader`;
- não há função administrativa direta nessa rota;
- integrações externas devem permanecer protegidas por service/Edge Function, nunca por secrets no frontend.

---

## 4. Dados e geração de eventos

A página carrega:

```txt
obterTodasPessoas()
obterTodosRelacionamentos()
```

A criação dos eventos vem de:

```txt
criarEventosDoCalendario(pessoas, relacionamentos, ano)
```

Tipos/categorias usados:

| Categoria | Uso |
|---|---|
| `aniversarios` | Datas de nascimento. |
| `casamento` | Datas de casamento. |
| `falecimento` | Datas de falecimento/memória. |
| `eventos_historicos` | Eventos derivados de arquivos/dados familiares. |
| `confraternizacoes` | Reuniões/confraternizações. |

Função central de classificação:

```txt
getCalendarCategory(evento)
```

Não duplicar regra de categoria em outros componentes sem necessidade.

---

## 5. Estrutura da página

A página possui:

1. header interno;
2. controle do mês exibido;
3. filtros compactos de categoria no mobile;
4. card do Google Agenda;
5. grid mensal;
6. sidebar/listas de resumo;
7. modal de eventos do dia mantido como suporte, mas não é o comportamento principal da bolinha mobile.

Controle do mês:

- botão mês anterior;
- mês/ano centralizado;
- botão próximo mês;
- texto “Mês exibido”.

---

## 6. Filtros e categorias

Estado principal:

```txt
activeCategories
toggleCategory(category)
```

Regras:

- o estado de categorias é único;
- filtros mobile e filtros desktop/tablet devem usar o mesmo estado;
- filtros devem usar `aria-pressed`;
- contadores devem usar eventos do mês, conforme a área em questão;
- nunca remover `activeCategories` para resolver problema visual.

Filtros compactos mobile:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

### 6.1 Contrato visual mobile atual

No mobile, os 5 botões devem ser exibidos em **uma única linha**.

Cada botão deve conter:

- uma bolinha colorida acima do título;
- título centralizado abaixo da bolinha;
- título em uma linha;
- `white-space: nowrap`;
- fallback com `text-overflow: ellipsis` em telas extremas;
- área de toque suficiente para uso em iOS/Safari;
- ausência de overflow horizontal global.

O CSS responsável é:

```txt
src/styles/calendar-mobile-category-buttons.css
```

Regras de breakpoints:

- validar em 320px, 375px, 390px e 430px;
- `Aniversário` e `Falecimento` são os rótulos de maior risco;
- a fonte pode ser compactada em telas menores, mas não deve quebrar linha;
- a bolinha colorida não deve empurrar o título para fora do botão;
- o card grande de categorias deve permanecer oculto no mobile quando duplicar os filtros superiores.

Card `Categorias`:

- pode aparecer em desktop/tablet;
- deve ficar oculto no mobile quando duplicar os filtros superiores;
- deve manter `id="categorias-calendario"` para fallback de navegação quando visível.

---

## 7. Grid mensal

Regras de exibição:

- dias da semana no topo;
- dia atual destacado em cinza claro;
- desktop/tablet exibe até 3 eventos por dia;
- se houver mais de 3 eventos, exibir `+N eventos`;
- mobile exibe bolinha colorida compacta no dia com evento;
- a bolinha mobile não deve abrir modal por padrão.

Microcopy:

| Situação | Texto |
|---|---|
| 1 evento | `1 evento` |
| 2+ eventos | `N eventos` |
| aniversário | `Faz X anos` |
| falecimento no grid | `{X} anos de falecimento` |
| descrição de falecimento | `Memória de Nome Completo` |
| card Memória com anos | `{X} anos da morte de Nome Completo` |
| card Memória sem anos | `Morte de Nome Completo` |

Funções relevantes:

```txt
formatEventCount
formatCalendarEventTitle
formatCalendarEventDescription
formatDeathSidebarTitle
```

---

## 8. Comportamento mobile da bolinha do dia

Função:

```txt
scrollToMonthSummary(eventosDia)
```

Regra:

- se houver aniversário, rolar para `#aniversariantes`;
- se houver falecimento, rolar para `#memoria`;
- caso contrário, tentar `#categorias-calendario` apenas se existir;
- se o alvo estiver oculto ou ausente, não gerar erro;
- não chamar `openDayEvents` como comportamento padrão da bolinha mobile.

---

## 9. Google Agenda

A UI permite:

- conectar Google Agenda;
- exibir conta conectada;
- exibir última sincronização;
- escolher sincronização de aniversários;
- escolher sincronização de datas de memória;
- sincronizar agora;
- desconectar.

Services relacionados:

```txt
obterStatusGoogleCalendar
iniciarConexaoGoogleCalendar
sincronizarGoogleCalendar
desconectarGoogleCalendar
```

### 9.1 Finalidade da integração

A integração existe para sincronizar no calendário do usuário, mediante autorização explícita:

- aniversários familiares;
- datas de memória/falecimento;
- datas familiares relevantes suportadas pela funcionalidade.

Microcopy pública obrigatória na home `/entrar`:

```txt
Família Souza Barros é uma plataforma familiar privada para organizar a árvore genealógica, perfis de familiares, fotos, documentos, memórias e datas importantes da família.

A integração com o Google Agenda permite sincronizar aniversários e datas de memória da família no calendário do usuário, sempre mediante autorização explícita.
```

Regras:

- o texto deve existir diretamente no JSX de `src/app/pages/Entrar.tsx`, não apenas via CSS;
- o nome público do app deve aparecer como **Família Souza Barros**;
- a home pública deve permitir ao Google validar a finalidade do app antes do login;
- o texto não deve prometer sincronização automática sem autorização;
- se o nome do app no Google Cloud mudar, revisar também `/entrar`.

### 9.2 Segurança

Regras de segurança:

- tokens/secrets não devem ir para o frontend;
- não expor credenciais do Google em logs;
- alterações no shape de `EventoCalendarioFamiliar` devem avaliar impacto em sincronização;
- erros de token/permissão devem virar toast amigável;
- não alterar `familyDates.ts` por ajuste visual sem revisar Google Agenda;
- desconexão deve revogar/remover o vínculo local conforme o service atual;
- sincronização deve respeitar escopos concedidos pelo usuário.

### 9.3 QA específico de OAuth

Validar após alteração relacionada ao Google:

- `/entrar` exibe **Família Souza Barros** como nome principal;
- `/entrar` explica que a plataforma organiza árvore, perfis, fotos, documentos, memórias e datas importantes;
- `/entrar` explica que Google Agenda sincroniza aniversários e datas de memória mediante autorização;
- `/calendario-familiar` continua exibindo status da conexão;
- conectar, sincronizar e desconectar continuam funcionando;
- nenhum token aparece em console, DOM, URL persistida ou bundle frontend.

---

## 10. Responsividade

Validar em:

```txt
320px
375px
390px
430px
768px
desktop
```

Regras:

- sem overflow horizontal global;
- filtros compactos legíveis;
- 5 filtros mobile em uma linha;
- bolinha colorida acima do título do botão;
- títulos dos botões em uma linha;
- card inferior de categorias oculto no mobile;
- grid mensal usável;
- Google Agenda acessível por botão no header mobile;
- listas de resumo com quebra segura de texto.

---

## 11. Troubleshooting

### Categorias não filtram

Verificar:

```txt
activeCategories
toggleCategory
getCalendarCategory
aria-pressed
```

### Botões mobile quebraram linha

Verificar:

```txt
src/styles/calendar-mobile-category-buttons.css
white-space: nowrap
text-overflow: ellipsis
grid-template-columns: repeat(5, minmax(0, 1fr))
```

Não voltar para duas linhas sem decisão explícita de UX.

### Bolinha mobile ainda abre modal

Verificar:

```txt
scrollToMonthSummary
onClick da bolinha mobile
selectedDayEvents
```

A bolinha deve rolar para resumo/fallback seguro.

### Card Categorias aparece no mobile

Verificar classes responsivas em `CalendarioFamiliar.tsx` e CSS relacionado. O card grande não deve duplicar os filtros compactos em mobile.

### Texto `item(ns)` voltou

Usar `formatEventCount` e substituir por `evento/eventos`.

### Google Agenda quebrou após ajuste visual

Verificar:

```txt
EventoCalendarioFamiliar
criarEventosDoCalendario
googleCalendarService
```

### Google solicita correção na tela inicial/OAuth

Verificar:

```txt
src/app/pages/Entrar.tsx
```

Conferir se o JSX da rota pública `/entrar` contém o nome **Família Souza Barros** e a descrição explícita da integração com Google Agenda. Não resolver essa exigência apenas com pseudo-elemento CSS.

### Mojibake em textos

Verificar strings literais e encoding UTF-8. Exemplos que não podem aparecer:

```txt
Calend?rio
Reuni?o
Mem?ria
```

---

## 12. QA

### Técnico

```bash
npm run build
git diff --check
git status --short
```

### Manual

- abrir `/calendario-familiar`;
- trocar mês;
- usar filtros desktop/tablet;
- usar filtros mobile;
- validar os 5 botões mobile em uma linha;
- validar bolinha colorida acima do título em cada botão;
- validar singular/plural;
- validar aniversário no grid;
- validar falecimento no grid;
- validar card Memória apenas quando houver itens;
- validar bolinha mobile do dia;
- validar Google Agenda se a área foi alterada;
- validar `/entrar` como home pública exigida pelo OAuth;
- validar mobile e desktop.

---

## 13. Pós-MVP

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

## 14. Anti-regressões

Não reintroduzir:

- card grande de categorias duplicado no mobile;
- filtros compactos sem `aria-pressed`;
- filtros mobile em duas linhas sem decisão explícita;
- botões mobile sem bolinha colorida acima do título;
- quebra de linha nos títulos dos botões mobile;
- overflow horizontal global;
- texto `item(ns)`;
- alteração de shape de evento sem revisar Google Agenda;
- secrets de Google no frontend;
- texto de finalidade do Google Agenda ausente da home `/entrar`;
- nome público diferente de **Família Souza Barros** na home OAuth;
- bolinha mobile abrindo modal como padrão;
- mojibake em labels do calendário.

<!-- CALENDARIO-CONSOLIDACAO-2026-06-18 -->
## Pontos de QA mobile do calendÃ¡rio familiar

Quando houver refinamentos mobile em `/calendario-familiar`, documentar sempre:

- comportamento em 320px, 375px, 390px e 430px;
- visibilidade de filtros;
- se botÃµes e menus nÃ£o cobrem conteÃºdo;
- se eventos permanecem legÃ­veis em cards/chips compactos;
- diferenÃ§as entre mobile, tablet e desktop.
