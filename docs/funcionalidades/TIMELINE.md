# Linha do tempo do usuário

> Local recomendado: `docs/funcionalidades/TIMELINE.md`  
> Tipo: documentação funcional específica.

---

## 1. Status

A linha do tempo do usuário foi implementada funcionalmente no tópico 7.3.

Escopo atual:

- primeira versão derivada dos dados existentes;
- sem tabela própria de timeline;
- sem migration;
- sem edição manual de eventos da timeline;
- renderizada no perfil da pessoa.

A timeline usa dados de:

- perfil;
- relacionamentos;
- arquivos históricos;
- eventos pessoais;
- filhos;
- eventos familiares globais, quando fornecidos futuramente.

---

## 2. Arquitetura

O fluxo é dividido em três partes:

```txt
PersonProfile carrega os dados disponíveis para a pessoa.
  ↓
buildPersonTimeline normaliza, deduplica e ordena os itens.
  ↓
PersonTimeline renderiza a lista no perfil da pessoa.
```

O builder `buildPersonTimeline`:

- não acessa Supabase;
- não faz fetch;
- não depende de estado React;
- não acessa variáveis de ambiente;
- é uma função pura;
- recebe dados já carregados;
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
| `dataService.ts` | Expõe relacionamentos detalhados da pessoa. |

Funções relevantes:

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
- arquivos históricos da pessoa;
- `categoria_evento`, quando disponível;
- filhos;
- pessoas carregadas;
- relacionamentos brutos/detalhados;
- arquivos históricos de relacionamentos conjugais;
- eventos familiares globais, se forem fornecidos futuramente ao builder.

Regra:

```txt
a timeline deve renderizar com os dados disponíveis e não quebrar quando um conjunto opcional estiver ausente.
```

---

## 5. Eventos suportados

A primeira versão suporta:

- nascimento;
- falecimento com data;
- falecimento informado sem data;
- casamento;
- união;
- separação;
- nascimento de filhos;
- arquivos históricos da pessoa;
- arquivos históricos de relacionamento;
- `person_events`;
- memórias;
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
valores ausentes ou inválidos como unknown
```

Regras importantes:

- data completa preserva precisão `day`;
- ano puro preserva precisão `year`;
- ano puro não vira `01/01/AAAA`;
- itens com precisão `unknown` vão para o final da ordenação.

---

## 7. Deduplicação

Helper:

```txt
dedupeTimelineItems
```

Evita duplicações usando chaves estáveis.

Critérios:

- casamento/união por par de pessoas, tipo e data;
- separação por par de pessoas e data;
- arquivos por `id`;
- `person_events` por `id`;
- `family_events` por `id`.

Objetivo:

```txt
evitar duplicação quando um relacionamento conjugal aparece nos dois sentidos.
```

---

## 8. Ordenação

Helper:

```txt
sortTimelineItems
```

Ordena:

- datas completas por ano, mês e dia;
- datas com ano por ano;
- itens `unknown` no final.

Em empates, a prioridade por tipo é:

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

Persistindo o empate, a ordenação final usa o título.

---

## 9. Segurança e privacidade

A timeline não deve expor dados sensíveis.

Regras:

- metadata sensível é sanitizada;
- URLs completas não devem ir para metadata;
- base64 e data URL não devem aparecer;
- telefone não deve aparecer;
- endereço não deve aparecer;
- e-mail não deve aparecer;
- tokens, secrets e keys sensíveis são removidos;
- IDs técnicos não são exibidos na UI;
- metadata bruta não é renderizada por `PersonTimeline`;
- arquivos históricos não são abertos ou baixados pela timeline nesta versão.

---

## 10. Permissões

Regras:

- a timeline respeita os dados carregados pelo perfil;
- usuário comum não ganha acesso administrativo por causa da timeline;
- admin mantém a visualização já permitida pelo perfil;
- RLS não foi alterada por causa da timeline;
- não foi criada policy nova para timeline;
- não foi usado service role no frontend.

---

## 11. Estado vazio e tolerância a erro

`PersonTimeline` deve renderizar estado vazio quando não há itens.

Mensagem esperada:

```txt
Ainda não há eventos suficientes para montar a linha do tempo desta pessoa.
```

Regras:

- componente aceita `items` opcional;
- fallback para array vazio;
- falhas ao carregar arquivos históricos de relacionamento não quebram o perfil;
- se dados adicionais não estiverem disponíveis, timeline renderiza com o que já foi carregado.

---

## 12. Limitações da versão atual

Ainda não foram implementados:

- edição manual de eventos da timeline;
- upload por evento;
- privacidade por evento;
- exportação PDF;
- modal detalhado por item;
- consolidação visual com `PersonEventsList`.

Esses itens ficam pós-MVP.

---

## 13. QA realizado

Validações registradas:

- `npm run build` passou;
- `git diff --check` passou;
- QA em browser com perfil real;
- mobile checado;
- console sem erro de runtime;
- validação visual de nascimento;
- validação visual de nascimento de filho;
- validação visual de casamento;
- validação visual de falecimento informado.

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

### Casamento/união não aparece

Verificar:

```txt
relacionamentos detalhados
tipo_relacionamento = conjuge
subtipo_relacionamento
data_casamento
src/app/utils/buildPersonTimeline.ts
```

### Separação duplicada

Verificar:

```txt
dedupeTimelineItems
chave relationship-separation
normalização do par de pessoas
relacionamentos inversos
```

### Arquivos históricos não aparecem

Verificar:

```txt
src/app/services/arquivosHistoricosService.ts
arquivos historicos da pessoa
arquivos historicos de relacionamento
dados enviados por PersonProfile
mapeamento em buildPersonTimeline
```

Se o problema acontecer após editar/salvar arquivos históricos:

- confirmar se `20260522121000_add_historical_file_event_category.sql` foi aplicada no ambiente;
- insert/update pode falhar quando o payload inclui `categoria_evento` e a coluna ainda não existe.

### Eventos pessoais não aparecem

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

### Usuário comum não vê algum item

Verificar:

```txt
RLS
dados disponíveis no perfil
permissões do service correspondente
se o dado deveria aparecer para usuário comum
```

---

## 15. Checklist de QA

### Perfil

- abrir perfil com nascimento;
- abrir perfil com falecimento;
- abrir perfil com casamento;
- abrir perfil com separação;
- abrir perfil com filhos;
- abrir perfil com arquivos históricos;
- abrir perfil com eventos pessoais;
- abrir perfil sem eventos suficientes;
- validar estado vazio;
- validar mobile.

### Técnico

```bash
npm run build
npm test
git diff --check
```

Se envolver carregamento/rota/permissão:

```bash
npm run test:e2e
```

---

## 16. Pós-MVP

Possíveis evoluções:

- edição manual de eventos da timeline;
- upload por evento;
- privacidade por evento;
- exportação PDF;
- modal detalhado por item;
- consolidação visual com `PersonEventsList`;
- integração com calendário familiar;
- timeline familiar global;
- filtros por tipo de evento;
- busca dentro da timeline;
- impressão/exportação.

Esses itens não bloqueiam o MVP.
