# Linha do tempo do usuario

> Ultima revisao: 2026-05-30

> Local recomendado: `docs/funcionalidades/TIMELINE.md`
> Tipo: documentacao funcional especifica.

---

## 1. Status

A linha do tempo do usuario foi implementada funcionalmente no topico 7.3.

Escopo atual:

- primeira versao derivada dos dados existentes;
- sem tabela propria de timeline;
- sem migration;
- sem edicao manual de eventos da timeline;
- renderizada no perfil da pessoa.

A timeline usa dados de:

- perfil;
- relacionamentos;
- arquivos historicos;
- eventos pessoais;
- filhos;
- eventos familiares globais, quando fornecidos futuramente.

---

## 2. Arquitetura

O fluxo e dividido em tres partes:

```txt
PersonProfile carrega os dados disponiveis para a pessoa.

buildPersonTimeline normaliza, deduplica e ordena os itens.

PersonTimeline renderiza a lista no perfil da pessoa.
```

O builder `buildPersonTimeline`:

- nao acessa Supabase;
- nao faz fetch;
- nao depende de estado React;
- nao acessa variaveis de ambiente;
- e uma funcao pura;
- recebe dados ja carregados;
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
| `dataService.ts` | Expoe relacionamentos detalhados da pessoa. |

Funcoes relevantes:

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
- arquivos historicos da pessoa;
- `categoria_evento`, quando disponivel;
- filhos;
- pessoas carregadas;
- relacionamentos brutos/detalhados;
- arquivos historicos de relacionamentos conjugais;
- eventos familiares globais, se forem fornecidos futuramente ao builder.

Regra:

```txt
a timeline deve renderizar com os dados disponiveis e nao quebrar quando um conjunto opcional estiver ausente.
```

---

## 5. Eventos suportados

A primeira versao suporta:

- nascimento;
- falecimento com data;
- falecimento informado sem data;
- casamento;
- uniao;
- separacao;
- nascimento de filhos;
- arquivos historicos da pessoa;
- arquivos historicos de relacionamento;
- `person_events`;
- memorias;
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
AAAA-MM
AAAA
valores ausentes ou invalidos como unknown
```

Regras importantes:

- data completa preserva precisao `day`;
- ano puro preserva precisao `year`;
- ano puro nao vira `01/01/AAAA`;
- itens com precisao `unknown` vao para o final da ordenacao.

---

## 7. Deduplicacao

Helper:

```txt
dedupeTimelineItems
```

Evita duplicacoes usando chaves estaveis.

Criterios:

- casamento/uniao por par de pessoas, tipo e data;
- separacao por par de pessoas e data;
- arquivos por `id`;
- `person_events` por `id`;
- `family_events` por `id`.

Objetivo:

```txt
evitar duplicacao quando um relacionamento conjugal aparece nos dois sentidos.
```

---

## 8. Ordenacao

Helper:

```txt
sortTimelineItems
```

Ordena:

- datas completas por ano, mes e dia;
- datas com ano e mes por ano/mes;
- datas com ano por ano;
- itens `unknown` no final.

Em empates, a prioridade por tipo e:

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

Persistindo o empate, a ordenacao final usa o titulo.

---

## 9. Seguranca e privacidade

A timeline nao deve expor dados sensiveis.

Regras:

- metadata sensivel e sanitizada;
- URLs completas nao devem ir para metadata;
- base64 e data URL nao devem aparecer;
- telefone nao deve aparecer;
- endereco nao deve aparecer;
- e-mail nao deve aparecer;
- tokens, secrets e keys sensiveis sao removidos;
- IDs tecnicos nao sao exibidos na UI;
- metadata bruta nao e renderizada por `PersonTimeline`;
- arquivos historicos nao sao abertos ou baixados pela timeline nesta versao.

---

## 10. Permissoes

Regras:

- a timeline respeita os dados carregados pelo perfil;
- usuario comum nao ganha acesso administrativo por causa da timeline;
- admin mantem a visualizacao ja permitida pelo perfil;
- RLS nao foi alterada por causa da timeline;
- nao foi criada policy nova para timeline;
- nao foi usado service role no frontend.

---

## 11. Estado vazio e tolerancia a erro

`PersonTimeline` deve renderizar estado vazio quando nao ha itens.

Mensagem esperada:

```txt
Ainda nao ha eventos suficientes para montar a linha do tempo desta pessoa.
```

Regras:

- componente aceita `items` opcional;
- fallback para array vazio;
- falhas ao carregar arquivos historicos de relacionamento nao quebram o perfil;
- se dados adicionais nao estiverem disponiveis, timeline renderiza com o que ja foi carregado.

---

## 12. Limitacoes da versao atual

Ainda nao foram implementados:

- edicao manual de eventos da timeline;
- upload por evento;
- privacidade por evento;
- exportacao PDF;
- modal detalhado por item;
- consolidacao visual com `PersonEventsList`.

Esses itens ficam pos-MVP.

---

## 13. QA realizado

Validacoes registradas:

- `npm run build` passou;
- `git diff --check` passou;
- QA em browser com perfil real;
- mobile checado;
- console sem erro de runtime;
- validacao visual de nascimento;
- validacao visual de nascimento de filho;
- validacao visual de casamento;
- validacao visual de falecimento informado.

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

### Casamento/uniao nao aparece

Verificar:

```txt
relacionamentos detalhados
tipo_relacionamento = conjuge
subtipo_relacionamento
data_casamento
src/app/utils/buildPersonTimeline.ts
```

### Badge Casamento aparece duplicada com Relacionamento

Verificar:

```txt
src/app/components/Timeline/PersonTimeline.tsx
item.type === 'marriage'
item.source === 'relationship'
```

Regra:

- item `marriage` nao deve renderizar badge de tipo **Casamento**;
- quando aplicavel, a badge **Relacionamento** deve ser mantida;
- o titulo, a descricao, o icone e a data do casamento devem permanecer visiveis.

### Badge de obito voltou como Falecimento

Verificar:

```txt
src/app/components/Timeline/PersonTimeline.tsx
TYPE_LABELS.death
```

Regra:

- o label publico para `death` deve ser **Obito**.

### Separacao duplicada

Verificar:

```txt
dedupeTimelineItems
chave relationship-separation
normalizacao do par de pessoas
relacionamentos inversos
```

### Arquivos historicos nao aparecem

Verificar:

```txt
src/app/services/arquivosHistoricosService.ts
arquivos historicos da pessoa
arquivos historicos de relacionamento
dados enviados por PersonProfile
mapeamento em buildPersonTimeline
```

Se o problema acontecer apos editar/salvar arquivos historicos:

- confirmar se `20260522121000_add_historical_file_event_category.sql` foi aplicada no ambiente;
- insert/update pode falhar quando o payload inclui `categoria_evento` e a coluna ainda nao existe.

### Eventos pessoais nao aparecem

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

### Usuario comum nao ve algum item

Verificar:

```txt
RLS
dados disponiveis no perfil
permissoes do service correspondente
se o dado deveria aparecer para usuario comum
```

---

## 15. Checklist de QA

### Perfil

- abrir perfil com nascimento;
- abrir perfil com falecimento;
- abrir perfil com casamento;
- abrir perfil com separacao;
- abrir perfil com filhos;
- abrir perfil com arquivos historicos;
- abrir perfil com eventos pessoais;
- abrir perfil sem eventos suficientes;
- validar estado vazio;
- validar que `death` aparece como **Obito**;
- validar que casamento nao mostra badge **Casamento** duplicada com **Relacionamento**;
- validar mobile.

### Tecnico

```bash
npm run build
npm test
git diff --check
```

Se envolver carregamento/rota/permissao:

```bash
npm run test:e2e
```

---

## 16. Pos-MVP

Possiveis evolucoes:

- edicao manual de eventos da timeline;
- upload por evento;
- privacidade por evento;
- exportacao PDF;
- modal detalhado por item;
- consolidacao visual com `PersonEventsList`;
- integracao com calendario familiar;
- timeline familiar global;
- filtros por tipo de evento;
- busca dentro da timeline;
- impressao/exportacao.

Esses itens nao bloqueiam o MVP.

---
## 17. Ajustes recentes e pendencias - ciclo 2026-05-30

Esta secao registra pendencias mapeadas para casamento, separacao e viuvez no perfil publico e na timeline.

### 17.1 Data de casamento

Problema mapeado:

```txt
Data de casamento salva como 30/07/1988 aparece como Data desconhecida.
```

Regra esperada:

- se `data_casamento` existir, a timeline e as secoes de relacionamento devem usar essa data;
- aceitar `DD/MM/AAAA`, `D/M/AAAA`, `AAAA-MM-DD`, `AAAA-MM`, `AAAA`;
- apenas exibir **Data desconhecida** quando realmente nao houver data valida;
- nao converter ano puro para `01/01/AAAA`.

Arquivos provaveis:

```txt
src/app/utils/buildPersonTimeline.ts
src/app/pages/PersonProfile.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/services/dataService.ts
```

### 17.2 Separacao versus viuvez

Problema mapeado:

```txt
Relacionamento encerrado por falecimento da conjuge nao deve aparecer como separacao.
```

Regra esperada:

- separacao/divorcio dependem de campo explicito de separacao, fim ou status equivalente;
- falecimento de conjuge deve gerar estado de viuvez;
- relacionamento inativo por falecimento nao deve criar evento **Separacao**;
- a timeline nao deve inferir separacao apenas por `ativo = false`.

### 17.3 Regras para o builder

`buildPersonTimeline` deve diferenciar:

```txt
marriage/union -> data_casamento ou data_relacionamento
separation -> data_separacao/data_fim quando houver separacao real
widowhood -> derivado de falecimento de conjuge quando aplicavel
```

Se a versao atual ainda nao tiver tipo especifico de item para viuvez, a implementacao deve escolher entre:

1. criar tipo especifico, documentando impacto visual; ou
2. ajustar apenas para nao renderizar separacao indevida, mantendo falecimento do conjuge como evento proprio.

Nao inferir separacao apenas por:

```txt
ativo = false
```

sem campo explicito de separacao/fim.

### 17.4 Labels visuais da timeline

Regras consolidadas:

- `death` deve aparecer como **Obito**;
- `marriage` nao deve exibir badge **Casamento** quando a UI ja mostra o contexto no titulo/texto;
- a badge **Relacionamento** deve permanecer quando `item.source === 'relationship'` e a visualizacao admin estiver ativa;
- ajustes de badge em `PersonTimeline.tsx` nao devem alterar parser, ordenacao, RLS ou shape dos itens.

### 17.5 Checklist de validacao

Validar perfil com:

```txt
casamento com data_casamento = 30/07/1988
casamento sem data_casamento
relacionamento com separacao real
relacionamento com divorcio real
relacionamento encerrado por falecimento de conjuge
relacionamento ativo
```

Resultado esperado:

```txt
casamento com data -> mostra 30/07/1988
casamento sem data -> mostra Data desconhecida apenas quando inevitavel
separacao real -> mostra Separacao
falecimento de conjuge -> nao mostra Separacao indevida
viuvez -> status/representacao propria quando suportado
```

### 17.6 Relacao com modal conjugal

O modal da alianca ja possui regras documentadas em:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
```

A timeline deve permanecer coerente com esse modal:

- nao exibir ID tecnico;
- usar labels amigaveis;
- respeitar `data_casamento`;
- distinguir viuvez de separacao.
