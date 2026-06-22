# Manutenção de Storage

> Última revisão: 2026-06-22
> Local canônico: `docs/operacao/STORAGE_MAINTENANCE.md`
> Tipo: documentação operacional de Storage.
> Status: revisado para diferenciar arquivos reais de fatos históricos sem anexo.

---

## 1. Objetivo

Este documento define procedimentos seguros para diagnosticar, migrar e limpar arquivos do Supabase Storage.

Use quando a tarefa envolver:

- objetos órfãos;
- uploads abandonados;
- base64 legado;
- buckets;
- `storage_bucket` ou `storage_path`;
- service role;
- scripts administrativos;
- limpeza ou migração de arquivos reais.

Não use este fluxo para corrigir CSS, avatar fallback visual, cards, paletas, conectores ou exportação visual.

---

## 2. Regra principal

```txt
Storage só entra no escopo quando houver arquivo real, URL, bucket, path, base64 legado ou policy de Storage.
```

Ajustes como estes não exigem operação de Storage:

- trocar fallback visual de pessoa sem foto;
- trocar fallback visual de pet;
- corrigir ícone SVG na exportação;
- alterar borda, cor, paleta ou card;
- ajustar modal mobile;
- ajustar calendário mobile.

---

## 3. Scripts atuais

```txt
scripts/storage-diagnose-orphans.mjs
scripts/migrate-legacy-base64-files.mjs
```

Regra:

```txt
Todo script deve rodar primeiro em dry-run.
```

Nenhuma remoção ou escrita deve ocorrer sem:

1. ambiente confirmado;
2. dry-run;
3. relatório revisado;
4. backup quando houver risco;
5. flag explícita;
6. validação posterior da UI.

---

## 4. Variáveis necessárias

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Regras:

- usar service role apenas em execução administrativa local/CI protegido;
- nunca usar service role no frontend;
- nunca commitar `.env.local`;
- nunca colar service role em issue, prompt, log ou documentação;
- scripts devem falhar sem `SUPABASE_SERVICE_ROLE_KEY`.

---

## 5. Buckets principais

| Bucket | Uso |
|---|---|
| `person-avatars` | fotos principais de pessoas |
| `historical-files` | arquivos históricos de pessoas/relacionamentos |

Contrato visual:

| Caso | Origem |
|---|---|
| Pessoa com foto | `pessoas.foto_principal_url` / Storage quando aplicável |
| Pessoa sem foto | ícone `User`, sem Storage |
| Pet sem foto | ícone `PawPrint`, sem Storage |

---

## 6. Diagnóstico de órfãos

Dry-run:

```bash
node scripts/storage-diagnose-orphans.mjs --output=/tmp/storage-orphans.json
```

Com buckets explícitos:

```bash
node scripts/storage-diagnose-orphans.mjs --buckets=person-avatars,historical-files --output=/tmp/storage-orphans.json
```

O script deve comparar objetos com referências em:

```txt
public.pessoas.foto_principal_url
public.arquivos_historicos.url
public.arquivos_historicos.storage_bucket
public.arquivos_historicos.storage_path
```

Resultado esperado:

- JSON de diagnóstico;
- contagem por bucket;
- lista de possíveis órfãos;
- nenhuma remoção.

---

## 7. Remoção de órfãos

Somente após revisar o relatório:

```bash
node scripts/storage-diagnose-orphans.mjs --delete-confirmed --output=/tmp/storage-orphans-delete.json
```

Regra:

```txt
--delete-confirmed é a única flag que habilita remoção.
```

Antes de remover:

- confirmar projeto Supabase;
- revisar quantidade e amostra de paths;
- conferir se não há referência indireta;
- confirmar backup quando aplicável;
- validar perfis, arquivos históricos e UI depois.

---

## 8. Migração de base64 legado

Dry-run:

```bash
node scripts/migrate-legacy-base64-files.mjs --output=/tmp/base64-migration.json
```

O script deve detectar:

```txt
data:*;base64,...
```

em:

```txt
public.arquivos_historicos.url
```

E planejar:

- MIME type;
- tamanho;
- nome seguro;
- path no bucket `historical-files`;
- update no banco.

Aplicar escrita:

```bash
node scripts/migrate-legacy-base64-files.mjs --write-confirmed --output=/tmp/base64-migration-write.json
```

Regra:

```txt
--write-confirmed é a única flag que habilita upload e update.
```

---

## 9. Avatares legados

Opcional:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --output=/tmp/base64-migration-with-avatars.json
```

Escrita com avatares:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --write-confirmed --output=/tmp/base64-migration-with-avatars-write.json
```

Cuidados:

- incluir avatares apenas com revisão;
- validar perfis antes/depois;
- confirmar que `foto_principal_url` abre corretamente;
- não apagar base64 legado fora do comportamento previsto.

---

## 10. Schema relacionado

Campos relevantes:

```txt
public.pessoas.foto_principal_url
public.arquivos_historicos.url
public.arquivos_historicos.storage_bucket
public.arquivos_historicos.storage_path
public.arquivos_historicos.mime_type
public.arquivos_historicos.categoria_evento
```

Migration relevante para categoria de arquivo histórico:

```txt
20260522121000_add_historical_file_event_category.sql
```

Se `categoria_evento` não existir no ambiente remoto, inserts/updates que enviem esse campo podem falhar. Isso é problema de migration/schema, não de Storage.

---

## 11. O que os scripts não devem fazer

Scripts de Storage não devem:

- alterar schema;
- criar migration;
- dropar coluna;
- remover base64 legado sem auditoria;
- remover arquivos durante migração sem flag;
- resolver policy de Storage;
- substituir QA funcional da UI;
- apagar fotos reais para corrigir fallback visual.

---

## 12. Uploads abandonados

Risco conhecido:

```txt
Usuário faz upload e abandona o formulário antes de salvar o registro.
```

Resultado:

- objeto real pode ficar no Storage;
- banco não referencia o arquivo;
- diagnóstico pode apontar como órfão.

Tratamento:

- dry-run;
- revisão manual;
- remoção apenas com `--delete-confirmed`.

---

## 13. QA após operação

Validar:

- perfil com foto;
- perfil sem foto;
- pet sem foto;
- arquivos históricos;
- download/abertura de arquivo;
- uploads novos;
- console sem erros de Storage;
- ausência de objetos removidos indevidamente.

---

## 14. Critérios para atualizar este documento

Atualize quando houver:

- novo bucket;
- novo script de Storage;
- mudança de flags;
- mudança de schema de arquivos;
- nova policy de Storage;
- novo fluxo de upload;
- alteração operacional de base64 legado.

## 15. Fatos históricos sem arquivo

A frente **Fatos e Arquivos Históricos** permite que um registro histórico exista sem upload.

Regra operacional:

```txt
Registro sem arquivo não cria objeto no Storage.
```

Campos esperados para fato/memória sem anexo:

```txt
url = null
storage_bucket = null
storage_path = null
mime_type = null
```

Consequências:

- scripts de órfãos devem comparar apenas objetos reais existentes no bucket;
- ausência de `url` em um registro histórico não significa Storage quebrado;
- limpeza de Storage não deve remover registros textuais sem anexo;
- UI deve renderizar fato textual com ícone/estado próprio, não imagem quebrada;
- migration que permite esses campos como nulos deve estar aplicada antes do deploy do frontend dependente.

---

## 16. `participante_ids`

`participante_ids` pertence ao schema da tabela `arquivos_historicos`, não ao Storage.

Regras:

- não tornar `participante_ids` obrigatório sem migration, backfill e atualização de services;
- fallback para ausência da coluna é compatibilidade de schema, não rotina de Storage;
- erro de schema cache em `participante_ids` deve ser tratado em `MIGRATIONS_SUPABASE.md`.

---

## 17. Upload opcional e órfãos

Com upload opcional, há três casos distintos:

| Caso | Storage | Banco |
|---|---|---|
| fato/memória sem anexo | não cria objeto | registro textual com campos de arquivo nulos |
| upload concluído e item salvo | objeto referenciado | registro com `url`, bucket/path e MIME |
| upload concluído e formulário abandonado | objeto possivelmente órfão | sem registro correspondente |

Apenas o terceiro caso deve aparecer como possível órfão em diagnóstico.
