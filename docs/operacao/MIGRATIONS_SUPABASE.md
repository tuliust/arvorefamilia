# Migrations Supabase

> Última revisão: 2026-06-14  
> Local canônico: `docs/operacao/MIGRATIONS_SUPABASE.md`  
> Tipo: documentação operacional de banco, schema, RLS, RPCs e migrations.  
> Status: revisado para separar alterações de banco de ajustes visuais/documentais.

---

## 1. Objetivo

Este documento define o fluxo seguro para trabalhar com migrations Supabase no projeto **Árvore Família**.

Use antes de:

- criar migration;
- aplicar `supabase db push`;
- rodar `supabase db reset`;
- investigar schema local/remoto;
- alterar RLS, RPC, trigger, constraint ou função SQL;
- decidir se SQL solto deve virar migration;
- corrigir divergência de schema cache.

Não use este documento para ajustes puramente visuais.

---

## 2. Regra principal

```txt
supabase/migrations/ é a fonte da verdade do schema.
```

SQL solto pode existir como histórico, diagnóstico ou operação pontual, mas não substitui migration.

Não aplicar como schema principal:

```txt
database-schema.sql
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
diagnostico-*.sql
scripts SQL antigos fora de supabase/migrations/
```

---

## 3. Quando criar migration

Criar migration para:

- nova tabela;
- nova coluna;
- alteração de tipo;
- índice;
- constraint;
- trigger;
- function SQL;
- RPC;
- policy/RLS;
- bucket/policy quando versionado via SQL;
- seed controlado necessário;
- ajuste de permissões/grants.

Não criar migration para:

- paleta;
- CSS;
- layout mobile;
- conectores visuais;
- cards;
- avatar fallback visual;
- modal;
- exportação client-side;
- documentação;
- microcopy estática sem banco.

---

## 4. Checklist antes de alterar banco

```bash
git status --short
git diff --check
npm run build
npm test
supabase migration list
```

Perguntas obrigatórias:

| Pergunta | Motivo |
|---|---|
| A mudança exige banco? | evita migration desnecessária |
| O objeto já existe? | evita duplicidade |
| O ambiente remoto está correto? | evita aplicar no projeto errado |
| Há risco de perda de dados? | exige backup |
| O frontend depende da mudança? | define ordem banco -> frontend |
| RLS precisa mudar? | evita exposição indevida |
| Há Edge Function envolvida? | exige secrets e deploy server-side |

---

## 5. Criar migration

```bash
supabase migration new nome_descritivo
```

Boas práticas:

- nome claro;
- SQL idempotente quando seguro;
- `create or replace function` para RPCs;
- `drop policy if exists` antes de recriar policy;
- revisar locks e dados existentes;
- deduplicar antes de constraint unique;
- separar limpeza destrutiva de alteração de schema;
- comentar SQL complexo.

---

## 6. Aplicar localmente

Ambiente descartável:

```bash
supabase migration list
supabase db reset
npm run build
npm test
git diff --check
```

Quando não puder resetar dados locais:

```bash
supabase migration list
supabase db push
npm run build
git diff --check
```

---

## 7. Aplicar remotamente

Antes:

```bash
git status --short
supabase migration list
```

Aplicar somente com autorização explícita:

```bash
supabase db push
```

Depois:

```bash
supabase migration list
npm run build
npm test
npm run test:e2e
git diff --check
```

Regras:

- confirmar projeto Supabase;
- fazer backup se houver dados reais sensíveis;
- aplicar migration antes de deploy frontend dependente;
- monitorar PostgREST/schema cache;
- não alterar frontend para mascarar schema ausente.

---

## 8. `migration repair`

Usar apenas quando:

- migration foi aplicada manualmente;
- schema remoto comprovadamente reflete o SQL;
- histórico Supabase divergiu;
- decisão foi registrada.

Não usar para:

- pular migration;
- esconder erro de SQL;
- mascarar ambiente errado;
- evitar backup;
- corrigir cache temporário.

---

## 9. Schema cache/PostgREST

Sintomas:

```txt
coluna recém-criada não aparece
RPC corrigida continua antiga
payload falha com coluna inexistente
PGRST202 em RPC existente localmente
```

Fluxo:

1. conferir `supabase migration list`;
2. verificar coluna/RPC no banco;
3. conferir assinatura e grants;
4. aguardar/recarregar schema cache;
5. testar novamente;
6. não remover payload correto para contornar ambiente atrasado.

Exemplos de objetos sensíveis:

```txt
public.arquivos_historicos.categoria_evento
public.admin_reset_person_profile(target_pessoa_id uuid)
public.pessoas.genero
public.pessoas.complemento
```

---

## 10. Migrations recentes relevantes

### `20260522121000_add_historical_file_event_category.sql`

Escopo:

- adiciona `categoria_evento` em `public.arquivos_historicos`;
- cria constraint de categorias;
- deve existir antes de frontend que envie `categoria_evento`.

Categorias esperadas:

```txt
certidao_nascimento
certidao_casamento
alistamento_militar
imigracao
divorcio
carreira_profissional
mudanca_cidade
certidao_obito
outro
```

### `20260522173000_fix_admin_list_profiles_for_linking_rpc.sql`

Escopo:

- cria/corrige RPC `admin_list_profiles_for_linking`;
- usa `security definer`;
- exige admin;
- concede execução a `authenticated`.

### `20260608120000_admin_reset_person_profile_and_true_privacy_defaults.sql`

Escopo:

- ajusta defaults de privacidade/contato;
- cria/atualiza `admin_reset_person_profile(target_pessoa_id uuid)`;
- permite reset administrativo controlado;
- preserva relacionamentos familiares.

### `20260609193000_ensure_admin_reset_person_profile.sql`

Escopo:

- reforça idempotência/assinatura da RPC de reset administrativo.

### `20260611003558_add_genero_to_pessoas.sql`

Escopo:

- adiciona `genero` em `public.pessoas`;
- mantém compatibilidade de cadastro;
- não define fallback visual por gênero.

Regra visual atual:

```txt
Pessoa sem foto usa User; pet sem foto usa PawPrint.
```

### `20260611013000_add_complemento_to_pessoas.sql`

Escopo:

- adiciona `complemento` em `public.pessoas`;
- armazena complemento manual de endereço;
- não altera regras visuais da árvore.

---

## 11. Edge Functions e banco

Edge Function não é migration, mas pode depender de schema.

Antes de alterar função que escreve/lê banco:

- revisar schema;
- revisar RLS/RPC;
- revisar secrets;
- publicar função;
- testar frontend.

Comandos:

```bash
supabase functions list
supabase functions deploy <nome-da-function>
```

---

## 12. Storage e migrations

Storage e schema são frentes distintas.

Storage pode envolver:

- bucket;
- policy;
- paths;
- arquivos reais;
- scripts com service role.

Consulte:

```txt
docs/operacao/STORAGE_MAINTENANCE.md
```

Não criar migration para corrigir:

- avatar fallback;
- ícone SVG;
- card;
- exportação visual;
- paleta;
- modal.

---

## 13. SQL legado

Classificação permitida:

| Tipo | Tratamento |
|---|---|
| migration oficial | fonte da verdade |
| script diagnóstico | executar com cuidado, não como schema |
| script corretivo pontual | exige revisão e backup |
| SQL histórico | manter em histórico ou remover se obsoleto |
| dump | não versionar se contiver dados reais |

Antes de remover SQL legado:

```bash
rg "nome_do_arquivo.sql" .
```

---

## 14. Rollback

Rollback de banco não é igual a revert Git.

Antes de desfazer schema:

1. avaliar impacto em dados;
2. criar migration reversa quando apropriado;
3. fazer backup;
4. revisar frontend dependente;
5. testar ambiente controlado;
6. aplicar com autorização explícita.

Nunca executar `drop` destrutivo em produção sem plano.

---

## 15. Critérios para atualizar este documento

Atualize quando houver:

- nova migration relevante;
- mudança de fluxo Supabase;
- nova RPC crítica;
- mudança de RLS;
- novo script SQL operacional;
- mudança em schema cache/troubleshooting;
- nova política sobre SQL legado.
