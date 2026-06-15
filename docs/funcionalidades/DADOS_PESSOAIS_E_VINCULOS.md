# Dados pessoais, vínculos familiares e edição de pessoas

> Última revisão: 2026-06-15
> Local canônico: `docs/funcionalidades/DADOS_PESSOAIS_E_VINCULOS.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: documentação funcional/técnica
> Status: Fase 6 de dados pessoais consolidada na `main` pelo merge `f55ac04 Merge branch 'fase-6-consolidacao-dados-pessoais'`.

---

## 1. Função deste documento

Este documento registra o contrato vigente da Fase 6 de dados pessoais, vínculos familiares, edição da árvore pelo membro e administração de pessoas.

Ele complementa, sem substituir:

| Tema | Documento canônico |
|---|---|
| Estado geral do produto | `docs/BASELINE_PRODUTO_ATUAL.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Perfil e admin de pessoa | `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` |
| Edição da própria árvore | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` |
| QA manual | `docs/QA_MANUAL.md` |
| Pendências e riscos | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Migrations e Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Rotas removidas | `docs/historico/ROTAS_REMOVIDAS.md` |

Regra de escopo:

```txt
Este documento descreve dados pessoais e vínculos consolidados na Fase 6.
Ele não documenta como concluídos ajustes visuais da árvore ainda pendentes em branches separadas.
```

---

## 2. Contrato vigente

A Fase 6 está integrada à `main` e consolidou cinco entregas funcionais:

| Fase | Commit | Área |
|---|---|---|
| 1 | `6cc3c28` | Base compartilhada de dados pessoais e validações. |
| 2 | `81c9da8` | `/meus-dados`. |
| 3 | `8304884` | `/meus-vinculos`. |
| 4 | `bc860f4` | `/minha-arvore/editar`. |
| 5 | `98d78d5` | Admin de pessoas. |

Merge final documentável:

```txt
f55ac04 Merge branch 'fase-6-consolidacao-dados-pessoais'
```

A entrega funcional foi validada no checkpoint de 2026-06-15 com:

```txt
npm run build: passou
npm test: passou
npm run test:e2e: passou
git status: limpo
origin/main: f55ac04
```

---

## 3. Banco e migrations

### 3.1 Campos de pessoa

A Fase 6 ampliou o contrato de pessoa para suportar localização nacional/internacional e falecimento.

Campos consolidados ou reforçados:

| Campo | Uso |
|---|---|
| `data_falecimento` | Data de falecimento da pessoa. |
| `local_falecimento` | Local de falecimento. |
| `local_falecimento_exterior` | Indica se o local de falecimento é fora do Brasil. |
| `local_atual_exterior` | Indica se a residência/local atual é fora do Brasil. |
| `falecido` | Controla exibição condicional de campos de falecimento e estado da pessoa. |
| `local_atual` | Residência/local atual normalizado conforme modo nacional/internacional. |
| `local_nascimento` | Local de nascimento normalizado conforme modo nacional/internacional. |
| `profissao` | Normalizada no blur para reduzir variações de capitalização. |
| `complemento` | Complemento de endereço no fluxo administrativo. |
| `receber_avisos_gerais` | Preferência administrativa de avisos gerais. |

Migration relevante da consolidação:

```txt
supabase/migrations/20260615120000_add_local_atual_exterior_to_pessoas.sql
```

Pendência operacional:

```txt
Aplicar a migration no Supabase correto quando a funcionalidade for publicada/usada em ambiente real.
```

### 3.2 Fonte da verdade

Regra permanente:

```txt
supabase/migrations/ é a fonte da verdade do schema.
SQL solto não substitui migration oficial.
```

Referências:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/historico/SQLS_LEGADOS.md
```

---

## 4. Normalização e validação

### 4.1 Utilitários compartilhados

A Fase 6 consolidou validações e normalizações em utilitários compartilhados de dados pessoais, especialmente em `personFields`.

Comportamentos que devem ser preservados:

- normalização compartilhada de dados pessoais;
- normalização de profissão no blur;
- normalização de localização por modo nacional/internacional;
- validações compartilhadas para campos de pessoa;
- preservação de booleanos `false` em payloads;
- ampliação de tipos e payloads de pessoa para os novos campos.

### 4.2 Localização nacional/internacional

Campos de localização devem respeitar o modo selecionado:

| Contexto | Modo Brasil | Modo exterior |
|---|---|---|
| Nascimento | Local brasileiro validável/normalizável. | Local internacional sem forçar padrão nacional. |
| Residência atual | `local_atual_exterior = false`. | `local_atual_exterior = true`. |
| Falecimento | `local_falecimento_exterior = false`. | `local_falecimento_exterior = true`. |

Regra:

```txt
Não limpar nem sobrescrever localização válida apenas por troca visual de formulário.
```

### 4.3 Booleanos

Payloads devem preservar explicitamente `false`.

Exemplos sensíveis:

```txt
falecido = false
local_atual_exterior = false
local_falecimento_exterior = false
receber_avisos_gerais = false, quando aplicável fora do payload admin forçado
```

Regra:

```txt
Não usar fallback com operador || para campos booleanos.
```

---

## 5. `/meus-dados`

Rota:

```txt
/meus-dados
```

Status: implementada na Fase 6.

Comportamentos consolidados:

- remoção do campo **Signo**;
- reorganização do bloco de nascimento;
- suporte a nascimento no exterior;
- suporte a residência atual no exterior;
- suporte a pessoa falecida;
- campos de data/local de falecimento;
- suporte a falecimento no exterior;
- normalização da profissão no blur;
- mitigação de autocomplete nativo em campos de endereço;
- upload de arquivos históricos com interface mais clara;
- categorias de arquivos históricos exibidas em cards;
- avatar pendente persistido em draft como data URL;
- draft restaurável sem perder avatar temporário;
- avisos gerais ativos/bloqueados conforme regra do fluxo.

Regra de histórico:

```txt
O commit 2601aaf docs: cria guia central de QA manual pertence à frente documental separada.
Ele não deve ser tratado como entrega funcional da Fase 6.
```

---

## 6. `/meus-vinculos`

Rota:

```txt
/meus-vinculos
```

Status: implementada na Fase 6 como revisão de vínculos familiares no primeiro acesso.

Comportamentos consolidados:

- botão **Voltar para meus dados**;
- preservação de draft ao voltar;
- painel direito com avatar circular;
- preview do avatar pendente vindo de `/meus-dados`;
- botão final **Confirmar e continuar edição**;
- destino provisório após confirmação: `/minha-arvore/editar`;
- modal de adicionar parentes com botão **Enviar para Aprovação**;
- toast/mensagem de aprovação;
- card de cônjuge compacto e expansível;
- relacionamento ativo desmarcado automaticamente quando pessoa ou cônjuge está falecido;
- seleção de **Outro pai/mãe** para filhos;
- draft ampliado com `childOtherParent`, `spouseExpanded` e `hasPendingRelationshipRequest`.

Pendência de produto:

```txt
O destino atual após confirmação é provisório: /minha-arvore/editar.
A rota futura /revisao-dados ainda não foi implementada.
```

---

## 7. `/minha-arvore/editar`

Rota:

```txt
/minha-arvore/editar
```

Status: rota vigente de edição da própria árvore/dados pelo membro.

Atenção anti-regressão:

```txt
/minha-arvore/editar é vigente.
/minha-arvore sem /editar é rota antiga removida e não deve voltar como view ativa.
```

Comportamentos consolidados:

- replicação do padrão visual e funcional de `/meus-dados`;
- remoção de **Signo**;
- reorganização do bloco de nascimento;
- campo **Moro no exterior**;
- campos de falecimento;
- normalização de profissão no blur;
- uso/ajuste de `AddressAutocompleteInput`;
- preservação de `SocialProfilesEditor`;
- upload/listagem de arquivos históricos;
- preservação de booleanos no payload;
- validações de localização nacional/internacional.

Conflitos resolvidos durante a consolidação:

```txt
src/app/pages/MinhaArvore.tsx
src/app/utils/personFields.ts
```

Solução aplicada:

- mantida a base correta das Fases 1 a 3;
- incorporados os ajustes da Fase 4;
- preservado `local_atual_exterior`;
- corrigidos imports duplicados;
- ajustados blocos de `normalizeFieldOnBlur` e `validateForm`.

---

## 8. Admin de pessoas

Rotas:

```txt
/admin/pessoas/nova
/admin/pessoas/:id
/admin/pessoas/:id/editar
```

Status: padrão de dados pessoais replicado no admin.

Arquivos funcionais principais da implementação, apenas para rastreabilidade documental:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
src/app/components/person/PersonBasicInfoFields.tsx
src/app/components/person/PersonContactFields.tsx
src/app/components/person/PersonDatesLocationsFields.tsx
```

Comportamentos consolidados:

- remoção de **Signo**;
- reorganização do bloco de nascimento;
- suporte a `local_atual_exterior`;
- suporte a `local_falecimento_exterior`;
- suporte a `data_falecimento`;
- suporte a `local_falecimento`;
- suporte a `complemento`;
- suporte a `receber_avisos_gerais`;
- `receber_avisos_gerais` forçado como `true` no payload admin;
- normalização de `local_atual` com `normalizeLocationByMode`;
- preservação de booleanos `false`;
- campos condicionais de falecimento;
- campo de complemento após endereço;
- manutenção de arquivos históricos, eventos e redes sociais versionadas.

Conflito resolvido:

```txt
src/app/pages/admin/AdminPessoaForm.tsx
```

Solução aplicada:

- aceita versão da Fase 5 para o arquivo conflitante;
- conferida presença de `local_atual_exterior`, `receber_avisos_gerais`, `local_falecimento_exterior`, `complemento` e `normalizeLocationByMode`.

---

## 9. Arquivos históricos

A Fase 6 reforçou o uso de arquivos históricos em fluxos de pessoa.

Comportamentos a preservar:

- upload de arquivos históricos em `/meus-dados`;
- upload/listagem de arquivos históricos em `/minha-arvore/editar`;
- manutenção de arquivos históricos no admin;
- categorias exibidas em cards quando o fluxo usar a interface interativa;
- draft de avatar não deve ser perdido ao voltar entre `/meus-dados` e `/meus-vinculos`.

Regra:

```txt
Arquivo histórico pertence ao fluxo funcional de pessoa, mas políticas de bucket, objetos órfãos e manutenção operacional ficam em docs/operacao/STORAGE_MAINTENANCE.md.
```

---

## 10. QA manual pendente

Mesmo com build, testes unitários e E2E passando no checkpoint, ainda é necessário QA visual/manual pós-merge da Fase 6.

Rotas obrigatórias:

```txt
/meus-dados
/meus-vinculos
/minha-arvore/editar
/admin/pessoas/nova
/admin/pessoas/:id
```

Cenários mínimos:

- criação de pessoa viva;
- criação de pessoa falecida;
- pessoa com nascimento no Brasil;
- pessoa com nascimento no exterior;
- pessoa com residência atual no Brasil;
- pessoa com residência atual no exterior;
- falecimento no Brasil;
- falecimento no exterior;
- campos opcionais vazios;
- booleanos desligados preservados como `false`;
- upload/listagem de arquivos históricos;
- draft de `/meus-dados`;
- avatar pendente;
- retorno de `/meus-vinculos` para `/meus-dados`;
- continuidade de `/meus-vinculos` para `/minha-arvore/editar`;
- admin criando nova pessoa;
- admin editando pessoa existente;
- redes sociais versionadas;
- eventos da pessoa;
- arquivos históricos no admin.

Referência central de execução:

```txt
docs/QA_MANUAL.md
```

---

## 11. Frente visual da árvore não integrada

A Fase 6 não integrou a frente visual da árvore.

Branches visuais analisadas e ainda abertas/pendentes:

```txt
feat/ajustes-desktop-minha-arvore
fix/restaurar-direct-family-layout
polish/layout-components-main
redesign/suafamilia-tree-style
```

Conclusão registrada:

- as branches parecem empilhadas;
- a branch mais avançada aparenta ser `feat/ajustes-desktop-minha-arvore`;
- teste de merge visual gerou conflitos;
- nenhum ajuste visual dessas branches entrou na `main` pela Fase 6.

Conflitos observados no teste de merge visual:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/pages/home/HomeTreeSection.tsx
```

Motivo da não integração:

- havia marcadores de conflito;
- havia risco de regressão no layout principal da árvore;
- a decisão foi não marcar conflitos como resolvidos sem revisão;
- a frente visual deve ser resolvida em branch separada, com PR próprio e QA desktop/mobile.

Regra:

```txt
Não documentar ajuste visual da árvore como concluído até que ele entre na main por frente própria validada.
```

---

## 12. Histórico operacional da consolidação

Branch consolidada:

```txt
fase-6-consolidacao-dados-pessoais
```

Fluxo executado:

1. Partida a partir de `fase-3-meus-vinculos`.
2. Cherry-pick da Fase 4.
3. Resolução de conflitos.
4. Cherry-pick da Fase 5.
5. Resolução de conflito no Admin.
6. Merge de `origin/main` na consolidada.
7. Push da branch consolidada.
8. Merge da consolidada em `main`.

Branch consolidada final antes do merge:

```txt
c9506d4 Merge remote-tracking branch 'origin/main' into fase-6-consolidacao-dados-pessoais
```

Merge final na main:

```txt
f55ac04 Merge branch 'fase-6-consolidacao-dados-pessoais'
```

Branches encerradas/limpas conforme checkpoint:

- branches locais das fases foram limpas;
- `fase-6-consolidacao-dados-pessoais` foi removida local e remotamente;
- branches das fases 1 a 5 não existiam no remoto;
- branch vazia `integracao-ajustes-visuais-arvore` foi criada por engano e apagada local/remotamente;
- a entrega funcional está na `main`.

---

## 13. Regras de não regressão

- Não reintroduzir **Signo** nos formulários consolidados sem decisão de produto.
- Não tratar `/minha-arvore` como view ativa.
- Não trocar o destino provisório `/minha-arvore/editar` por `/revisao-dados` antes da rota existir.
- Não perder avatar pendente ao navegar de `/meus-dados` para `/meus-vinculos` e voltar.
- Não converter booleanos `false` em `true` ou vazio por fallback incorreto.
- Não normalizar local internacional como endereço nacional brasileiro.
- Não salvar pessoa falecida com relacionamento conjugal ativo quando a regra do fluxo exigir desativação.
- Não misturar frente visual da árvore com dados pessoais, vínculos ou documentação da Fase 6.
- Não usar SQL solto como substituto da migration oficial.
