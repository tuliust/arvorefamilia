# Linha do tempo do usuÃ¡rio

> Local recomendado: `docs/funcionalidades/TIMELINE.md`
> Tipo: documentaÃ§Ã£o funcional especÃ­fica.

---

## 1. Status

A linha do tempo do usuÃ¡rio foi implementada funcionalmente no tÃ³pico 7.3.

Escopo atual:

- primeira versÃ£o derivada dos dados existentes;
- sem tabela prÃ³pria de timeline;
- sem migration;
- sem ediÃ§Ã£o manual de eventos da timeline;
- renderizada no perfil da pessoa.

A timeline usa dados de:

- perfil;
- relacionamentos;
- arquivos histÃ³ricos;
- eventos pessoais;
- filhos;
- eventos familiares globais, quando fornecidos futuramente.

---

## 2. Arquitetura

O fluxo Ã© dividido em trÃªs partes:

```txt
PersonProfile carrega os dados disponÃ­veis para a pessoa.
  â†“
buildPersonTimeline normaliza, deduplica e ordena os itens.
  â†“
PersonTimeline renderiza a lista no perfil da pessoa.
```

O builder `buildPersonTimeline`:

- nÃ£o acessa Supabase;
- nÃ£o faz fetch;
- nÃ£o depende de estado React;
- nÃ£o acessa variÃ¡veis de ambiente;
- Ã© uma funÃ§Ã£o pura;
- recebe dados jÃ¡ carregados;
- retorna `PersonTimelineItem[]`.

---

## 3. Arquivos principais

```txt
src/app/utils/buildPersonTimeline.ts
src/app/components/Timeline/PersonTimeline.tsx
src/app/pages/PersonProfile.tsx
src/app/services/dataService.ts
```

Responsabilidades:

| Arquivo | Responsabilidade |
|---|---|
| `buildPersonTimeline.ts` | Define tipos, normaliza eventos, deduplica e ordena. |
| `PersonTimeline.tsx` | Renderiza a timeline no perfil e trata estado vazio. |
| `PersonProfile.tsx` | Carrega dados e monta `timelineItems`. |
| `dataService.ts` | ExpÃµe relacionamentos detalhados da pessoa. |

FunÃ§Ãµes relevantes:

```txt
buildPersonTimeline
parseTimelineDate
dedupeTimelineItems
sortTimelineItems
```

---

## 4. Dados usados

A timeline pode receber:

- pessoa;
- eventos pessoais;
- arquivos histÃ³ricos da pessoa;
- `categoria_evento`, quando disponÃ­vel;
- filhos;
- pessoas carregadas;
- relacionamentos brutos/detalhados;
- arquivos histÃ³ricos de relacionamentos conjugais;
- eventos familiares globais, se forem fornecidos futuramente ao builder.

Regra:

```txt
a timeline deve renderizar com os dados disponÃ­veis e nÃ£o quebrar quando um conjunto opcional estiver ausente.
```

---

## 5. Eventos suportados

A primeira versÃ£o suporta:

- nascimento;
- falecimento com data;
- falecimento informado sem data;
- casamento;
- uniÃ£o;
- separaÃ§Ã£o;
- nascimento de filhos;
- arquivos histÃ³ricos da pessoa;
- arquivos histÃ³ricos de relacionamento;
- `person_events`;
- memÃ³rias;
- eventos familiares globais, quando fornecidos ao builder.

---

## 6. Parser de datas

Helper:

```txt
parseTimelineDate
```

Suporta:

```txt
DD/MM/AAAA
D/M/AAAA
AAAA-MM-DD
AAAA
valores ausentes ou invÃ¡lidos como unknown
```

Regras importantes:

- data completa preserva precisÃ£o `day`;
- ano puro preserva precisÃ£o `year`;
- ano puro nÃ£o vira `01/01/AAAA`;
- itens com precisÃ£o `unknown` vÃ£o para o final da ordenaÃ§Ã£o.

---

## 7. DeduplicaÃ§Ã£o

Helper:

```txt
dedupeTimelineItems
```

Evita duplicaÃ§Ãµes usando chaves estÃ¡veis.

CritÃ©rios:

- casamento/uniÃ£o por par de pessoas, tipo e data;
- separaÃ§Ã£o por par de pessoas e data;
- arquivos por `id`;
- `person_events` por `id`;
- `family_events` por `id`.

Objetivo:

```txt
evitar duplicaÃ§Ã£o quando um relacionamento conjugal aparece nos dois sentidos.
```

---

## 8. OrdenaÃ§Ã£o

Helper:

```txt
sortTimelineItems
```

Ordena:

- datas completas por ano, mÃªs e dia;
- datas com ano por ano;
- itens `unknown` no final.

Em empates, a prioridade por tipo Ã©:

1. `birth`
2. `child_birth`
3. `union`
4. `marriage`
5. `separation`
6. `person_event`
7. `family_event`
8. `historical_file`
9. `memory`
10. `death`
11. `other`

Persistindo o empate, a ordenaÃ§Ã£o final usa o tÃ­tulo.

---

## 9. SeguranÃ§a e privacidade

A timeline nÃ£o deve expor dados sensÃ­veis.

Regras:

- metadata sensÃ­vel Ã© sanitizada;
- URLs completas nÃ£o devem ir para metadata;
- base64 e data URL nÃ£o devem aparecer;
- telefone nÃ£o deve aparecer;
- endereÃ§o nÃ£o deve aparecer;
- e-mail nÃ£o deve aparecer;
- tokens, secrets e keys sensÃ­veis sÃ£o removidos;
- IDs tÃ©cnicos nÃ£o sÃ£o exibidos na UI;
- metadata bruta nÃ£o Ã© renderizada por `PersonTimeline`;
- arquivos histÃ³ricos nÃ£o sÃ£o abertos ou baixados pela timeline nesta versÃ£o.

---

## 10. PermissÃµes

Regras:

- a timeline respeita os dados carregados pelo perfil;
- usuÃ¡rio comum nÃ£o ganha acesso administrativo por causa da timeline;
- admin mantÃ©m a visualizaÃ§Ã£o jÃ¡ permitida pelo perfil;
- RLS nÃ£o foi alterada por causa da timeline;
- nÃ£o foi criada policy nova para timeline;
- nÃ£o foi usado service role no frontend.

---

## 11. Estado vazio e tolerÃ¢ncia a erro

`PersonTimeline` deve renderizar estado vazio quando nÃ£o hÃ¡ itens.

Mensagem esperada:

```txt
Ainda nÃ£o hÃ¡ eventos suficientes para montar a linha do tempo desta pessoa.
```

Regras:

- componente aceita `items` opcional;
- fallback para array vazio;
- falhas ao carregar arquivos histÃ³ricos de relacionamento nÃ£o quebram o perfil;
- se dados adicionais nÃ£o estiverem disponÃ­veis, timeline renderiza com o que jÃ¡ foi carregado.

---

## 12. LimitaÃ§Ãµes da versÃ£o atual

Ainda nÃ£o foram implementados:

- ediÃ§Ã£o manual de eventos da timeline;
- upload por evento;
- privacidade por evento;
- exportaÃ§Ã£o PDF;
- modal detalhado por item;
- consolidaÃ§Ã£o visual com `PersonEventsList`.

Esses itens ficam pÃ³s-MVP.

---

## 13. QA realizado

ValidaÃ§Ãµes registradas:

- `npm run build` passou;
- `git diff --check` passou;
- QA em browser com perfil real;
- mobile checado;
- console sem erro de runtime;
- validaÃ§Ã£o visual de nascimento;
- validaÃ§Ã£o visual de nascimento de filho;
- validaÃ§Ã£o visual de casamento;
- validaÃ§Ã£o visual de falecimento informado.

---

## 14. Troubleshooting

### Timeline vazia

Verificar:

```txt
src/app/pages/PersonProfile.tsx
dados enviados ao buildPersonTimeline
src/app/components/Timeline/PersonTimeline.tsx
estado vazio do componente
```

### Casamento/uniÃ£o nÃ£o aparece

Verificar:

```txt
relacionamentos detalhados
tipo_relacionamento = conjuge
subtipo_relacionamento
data_casamento
src/app/utils/buildPersonTimeline.ts
```

### SeparaÃ§Ã£o duplicada

Verificar:

```txt
dedupeTimelineItems
chave relationship-separation
normalizaÃ§Ã£o do par de pessoas
relacionamentos inversos
```

### Arquivos histÃ³ricos nÃ£o aparecem

Verificar:

```txt
src/app/services/arquivosHistoricosService.ts
arquivos historicos da pessoa
arquivos historicos de relacionamento
dados enviados por PersonProfile
mapeamento em buildPersonTimeline
```

Se o problema acontecer apÃ³s editar/salvar arquivos histÃ³ricos:

- confirmar se `20260522121000_add_historical_file_event_category.sql` foi aplicada no ambiente;
- insert/update pode falhar quando o payload inclui `categoria_evento` e a coluna ainda nÃ£o existe.

### Eventos pessoais nÃ£o aparecem

Verificar:

```txt
src/app/services/personEventsService.ts
listarEventosDaPessoa
estado personEvents em PersonProfile
mapeamento em buildPersonTimeline
```

### Datas em ordem errada

Verificar:

```txt
parseTimelineDate
sortTimelineItems
precision
dateValue
year
month
day
```

### UsuÃ¡rio comum nÃ£o vÃª algum item

Verificar:

```txt
RLS
dados disponÃ­veis no perfil
permissÃµes do service correspondente
se o dado deveria aparecer para usuÃ¡rio comum
```

---

## 15. Checklist de QA

### Perfil

- abrir perfil com nascimento;
- abrir perfil com falecimento;
- abrir perfil com casamento;
- abrir perfil com separaÃ§Ã£o;
- abrir perfil com filhos;
- abrir perfil com arquivos histÃ³ricos;
- abrir perfil com eventos pessoais;
- abrir perfil sem eventos suficientes;
- validar estado vazio;
- validar mobile.

### TÃ©cnico

```bash
npm run build
npm test
git diff --check
```

Se envolver carregamento/rota/permissÃ£o:

```bash
npm run test:e2e
```

---

## 16. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- ediÃ§Ã£o manual de eventos da timeline;
- upload por evento;
- privacidade por evento;
- exportaÃ§Ã£o PDF;
- modal detalhado por item;
- consolidaÃ§Ã£o visual com `PersonEventsList`;
- integraÃ§Ã£o com calendÃ¡rio familiar;
- timeline familiar global;
- filtros por tipo de evento;
- busca dentro da timeline;
- impressÃ£o/exportaÃ§Ã£o.

Esses itens nÃ£o bloqueiam o MVP.
