# Timeline

> Última revisão: 2026-06-14  
> Local canônico: `docs/funcionalidades/TIMELINE.md`  
> Tipo: documentação funcional e técnica da linha do tempo de pessoa.

---

## 1. Objetivo

A timeline organiza eventos relevantes da vida de uma pessoa em ordem cronológica.

Ela aparece no perfil da pessoa e também é usada na edição do próprio perfil em `/minha-arvore/editar`, onde eventos manuais podem ser revisados e salvos.

---

### 1.1 Relação com perfil, árvore e calendário

A timeline é uma visão cronológica de pessoa. Ela não substitui:

- `/mapa-familiar`, que organiza grupos e relações na árvore vertical;
- `/mapa-familiar-horizontal`, que organiza gerações;
- `/calendario-familiar`, que agrega datas por mês;
- `/minha-arvore/editar`, que edita eventos manuais.

As mesmas fontes de dados podem alimentar todos esses contextos, mas cada módulo tem responsabilidade visual própria.

## 2. Arquivos principais

```txt
src/app/utils/buildPersonTimeline.ts
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/pages/PersonProfile.tsx
src/app/pages/MinhaArvore.tsx
src/app/services/personEventsService.ts
src/app/services/arquivosHistoricosService.ts
src/app/services/dataService.ts
```

Documentos relacionados:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## 3. Estado atual

Implementado:

- timeline derivada de dados existentes;
- eventos de nascimento e falecimento;
- eventos conjugais;
- nascimento de filhos;
- arquivos históricos da pessoa;
- arquivos históricos de relacionamento;
- eventos pessoais manuais via `person_events`;
- sanitização de metadata;
- deduplicação;
- ordenação cronológica;
- estado vazio seguro.

Não implementado no escopo atual:

- upload próprio por evento da timeline;
- privacidade por evento;
- exportação PDF da timeline;
- modal detalhado por item;
- timeline familiar global.

---

## 4. Arquitetura

Fluxo:

```txt
PersonProfile / MinhaArvore
  -> carrega dados necessários
  -> envia dados para buildPersonTimeline
  -> PersonTimeline renderiza itens
```

`buildPersonTimeline` é função pura:

- não acessa Supabase;
- não faz fetch;
- não depende de React;
- não lê variável de ambiente;
- recebe dados já carregados;
- retorna `PersonTimelineItem[]`.

---

## 5. Dados aceitos pelo builder

Interface principal:

```txt
BuildPersonTimelineInput
```

Entradas relevantes:

- `pessoa`;
- `relacionamentos`;
- `pessoas`;
- `filhos`;
- `arquivosHistoricosPessoa`;
- `arquivosHistoricosRelacionamentos`;
- `eventosPessoais`;
- `eventosFamiliares`.

A timeline deve renderizar com o que estiver disponível. Dados opcionais ausentes não podem quebrar a UI.

---

## 6. Tipos de item

Tipos atuais:

```txt
birth
death
marriage
union
separation
child_birth
historical_file
person_event
family_event
memory
other
```

Fontes atuais:

```txt
person
relationship
historical_file
person_event
family_event
```

---

## 7. Parser de datas

Função:

```txt
parseTimelineDate
```

Formatos aceitos:

```txt
DD/MM/AAAA
D/M/AAAA
AAAA-MM-DD
AAAA-MM
AAAA
```

Regras:

- ano puro mantém precisão `year`;
- ano puro não vira `01/01/AAAA`;
- data inválida vira precisão `unknown`;
- itens sem data válida vão para o fim da ordenação;
- `dateLabel` deve ser amigável.

---

## 8. Relacionamentos conjugais

A timeline deve diferenciar:

| Situação | Regra |
|---|---|
| casamento/união | usar `data_casamento` quando disponível. |
| separação/divórcio | usar `data_separacao` ou subtipo explícito. |
| viuvez/falecimento de cônjuge | não inferir separação apenas por falecimento. |

Funções relevantes:

```txt
getPreferredConjugalRelationships
hasExplicitSeparationData
isRelationshipEndedByWidowhood
shouldCreateRelationshipSeparation
```

Regra crítica:

```txt
ativo = false
```

não deve, sozinho, gerar separação se a relação foi encerrada por falecimento de cônjuge.

---

### 8.1 Múltiplos relacionamentos conjugais

A timeline deve preservar eventos de múltiplos relacionamentos quando existirem.

Regras:

- cada relacionamento conjugal explícito pode gerar item próprio de casamento/união;
- separação/divórcio só deve aparecer com dado explícito;
- viuvez não deve ser convertida automaticamente em separação;
- arquivos históricos de relacionamento devem permanecer associados ao relacionamento correto;
- eventos de filhos devem derivar de relação parental explícita, não de proximidade visual na árvore.

Impacto:

- uma pessoa pode ter mais de um item de casamento/união;
- o perfil e a árvore devem contar a mesma história relacional;
- a timeline não deve ocultar relacionamento anterior porque há cônjuge atual.

## 9. Deduplicação

Função:

```txt
dedupeTimelineItems
```

Objetivo:

- evitar duplicidade por relacionamento nos dois sentidos;
- evitar duplicidade de arquivos;
- evitar duplicidade de eventos pessoais/familiares.

Chaves estáveis incluem:

- nascimento/falecimento por pessoa;
- casamento/união por par de pessoas, tipo e data;
- separação por par e data;
- arquivo histórico por `id`;
- `person_events` por `id`;
- `family_events` por `id`.

---

## 10. Ordenação

Função:

```txt
sortTimelineItems
```

Critérios:

1. valor cronológico;
2. prioridade por tipo;
3. título em `pt-BR`.

Prioridade atual:

```txt
birth
child_birth
union
marriage
separation
person_event
family_event
historical_file
memory
death
other
```

---

## 11. Eventos manuais

Eventos manuais vêm de:

```txt
person_events
personEventsService.ts
PersonEventsEditor.tsx
```

Uso atual:

- exibidos na timeline;
- editáveis na página `/minha-arvore/editar`;
- salvos no fluxo principal da edição;
- não possuem upload próprio por evento no escopo atual.

Regras:

- evento manual precisa de título;
- ausência de eventos manuais não quebra timeline;
- salvar eventos deve respeitar RLS/service;
- se salvar eventos falhar após dados pessoais, exibir erro parcial.

---

## 12. Arquivos históricos

A timeline pode incluir:

- arquivos históricos da pessoa;
- arquivos históricos de relacionamento conjugal;
- `categoria_evento`, quando disponível.

A migration relacionada à categoria de evento é:

```txt
20260522121000_add_historical_file_event_category.sql
```

Se `categoria_evento` for enviado para ambiente sem coluna aplicada, inserts/updates podem falhar.

---

## 13. Segurança e privacidade

A timeline não deve expor:

- telefone;
- endereço;
- e-mail;
- URLs completas sensíveis;
- base64/data URL;
- tokens;
- secrets;
- service role;
- metadata bruta não sanitizada.

Função relevante:

```txt
sanitizeTimelineMetadata
```

`PersonTimeline` não deve renderizar metadata bruta ao usuário.

---

## 14. Estado vazio

Mensagem esperada:

```txt
Ainda não há eventos suficientes para montar a linha do tempo desta pessoa.
```

Regras:

- componente aceita `items` opcional;
- fallback para array vazio;
- falhas de dados complementares não quebram o perfil;
- se houver apenas dados parciais, renderizar o que for possível.

---

## 15. Troubleshooting

### Casamento aparece como data desconhecida

Verificar:

```txt
data_casamento
parseTimelineDate
buildPersonTimeline
PersonTimeline
```

### Separação indevida por viuvez

Verificar:

```txt
ativo
data_separacao
subtipo_relacionamento
isRelationshipEndedByWidowhood
shouldCreateRelationshipSeparation
```

### Evento manual não aparece

Verificar:

```txt
person_events
listarEventosDaPessoa
salvarEventosDaPessoa
eventosPessoais
buildPersonTimeline
```

### Arquivos históricos não aparecem

Verificar:

```txt
listarArquivosHistoricosPorPessoa
arquivosHistoricosPessoa
arquivosHistoricosRelacionamentos
categoria_evento
```

### Datas fora de ordem

Verificar:

```txt
parseTimelineDate
sortTimelineItems
precision
dateValue
```

---

## 16. QA

### Perfil público

- pessoa com nascimento;
- pessoa com falecimento;
- pessoa com casamento;
- pessoa com separação real;
- pessoa viúva;
- pessoa com filhos;
- pessoa com arquivos históricos;
- pessoa com eventos pessoais;
- pessoa sem eventos suficientes.

### Edição

- abrir `/minha-arvore/editar`;
- adicionar evento manual;
- salvar;
- confirmar persistência;
- reabrir perfil e conferir timeline.

### Técnico

```bash
npm run build
git diff --check
git status --short
```

---

## 17. Pós-MVP

- upload por evento;
- privacidade por evento;
- exportação PDF;
- modal detalhado por item;
- filtros por tipo;
- busca na timeline;
- timeline familiar global;
- integração visual ampliada com calendário;
- impressão/exportação.

Esses itens não bloqueiam o MVP.

---

## 16. Anti-regressões

Checklist:

- [ ] Timeline não usa `/minha-arvore`, `/genealogia` ou `/visao-completa` como rotas ativas.
- [ ] Eventos de casamento/união usam relacionamento explícito.
- [ ] Múltiplos relacionamentos não são colapsados em um único cônjuge.
- [ ] Separação exige dado explícito e não é inferida apenas por `ativo = false` quando houver viuvez.
- [ ] Eventos manuais continuam editáveis em `/minha-arvore/editar`.
- [ ] Datas de aniversário/falecimento permanecem compatíveis com `/calendario-familiar`.
- [ ] Metadata sensível continua sanitizada.


## 18. Anti-regressões

Não reintroduzir:

- “sem edição manual” como descrição do estado atual;
- separação inferida apenas por `ativo = false`;
- ano puro convertido para `01/01`;
- metadata sensível na UI;
- quebra quando dados opcionais faltam;
- badge/label técnica confusa para evento público.
