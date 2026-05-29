# ManutenÃ§Ã£o de Storage

> Local recomendado: `docs/operacao/STORAGE_MAINTENANCE.md`
> Tipo: documentaÃ§Ã£o operacional de manutenÃ§Ã£o controlada de Storage.

---

## 1. Objetivo

Este documento descreve procedimentos seguros para diagnosticar, migrar e limpar arquivos do Supabase Storage no projeto **Ãrvore FamÃ­lia**.

Use este documento para:

- diagnosticar objetos Ã³rfÃ£os;
- migrar base64 legado para Storage;
- revisar uploads abandonados;
- evitar remoÃ§Ãµes acidentais;
- executar scripts administrativos com service role;
- preservar compatibilidade com dados legados.

---

## 2. Regra principal

Os scripts citados aqui sÃ£o seguros por padrÃ£o:

```txt
geram relatÃ³rio em dry-run e nÃ£o removem nem migram dados sem flag explÃ­cita.
```

Nenhuma operaÃ§Ã£o destrutiva deve acontecer sem:

1. dry-run;
2. revisÃ£o do relatÃ³rio;
3. confirmaÃ§Ã£o do ambiente;
4. flag explÃ­cita de escrita/remoÃ§Ã£o;
5. validaÃ§Ã£o posterior.

---

## 3. VariÃ¡veis necessÃ¡rias

Defina no ambiente ou em `.env.local`:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Regras:

- usar service role somente em ambiente administrativo local ou CI protegido;
- nunca expor service role no frontend;
- nunca commitar `.env.local`;
- nunca enviar service role em documentaÃ§Ã£o, issue, log pÃºblico ou prompt;
- scripts devem falhar com mensagem explÃ­cita se `SUPABASE_SERVICE_ROLE_KEY` nÃ£o estiver definida.

---

## 4. Buckets envolvidos

Buckets principais:

```txt
person-avatars
historical-files
```

Uso esperado:

| Bucket | Uso |
|---|---|
| `person-avatars` | Foto/avatar principal de pessoas. |
| `historical-files` | Arquivos histÃ³ricos de pessoas e relacionamentos. |

---

## 5. DiagnÃ³stico de Ã³rfÃ£os

Comando dry-run:

```bash
node scripts/storage-diagnose-orphans.mjs --output=/tmp/storage-orphans.json
```

O script compara objetos dos buckets:

```txt
person-avatars
historical-files
```

com referÃªncias em:

```txt
public.pessoas.foto_principal_url
public.arquivos_historicos.url
public.arquivos_historicos.storage_bucket
public.arquivos_historicos.storage_path
```

Resultado esperado:

- relatÃ³rio JSON;
- lista de objetos possivelmente Ã³rfÃ£os;
- nenhuma remoÃ§Ã£o sem flag explÃ­cita.

---

## 6. RemoÃ§Ã£o de Ã³rfÃ£os

Depois de revisar o relatÃ³rio, executar explicitamente:

```bash
node scripts/storage-diagnose-orphans.mjs --delete-confirmed --output=/tmp/storage-orphans-delete.json
```

Regra:

```txt
--delete-confirmed Ã© a Ãºnica flag que habilita remoÃ§Ã£o.
```

Sem essa flag, o script apenas gera relatÃ³rio.

Antes de remover:

- conferir ambiente Supabase;
- revisar quantidade de objetos;
- revisar paths;
- confirmar se nÃ£o hÃ¡ referÃªncia indireta;
- confirmar backup, se aplicÃ¡vel.

---

## 7. MigraÃ§Ã£o de base64 legado

Comando dry-run:

```bash
node scripts/migrate-legacy-base64-files.mjs --output=/tmp/base64-migration.json
```

Em dry-run, o script detecta:

```txt
data:*;base64,...
```

em:

```txt
public.arquivos_historicos.url
```

e calcula:

- MIME type;
- nome seguro;
- destino no bucket `historical-files`;
- plano de update no banco.

---

## 8. Executar migraÃ§Ã£o de base64

Depois de revisar o relatÃ³rio:

```bash
node scripts/migrate-legacy-base64-files.mjs --write-confirmed --output=/tmp/base64-migration-write.json
```

Regra:

```txt
--write-confirmed Ã© a Ãºnica flag que habilita upload no Storage e update no banco.
```

Sem essa flag, o script apenas planeja a migraÃ§Ã£o.

---

## 9. Incluir avatars legados

Opcionalmente:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --output=/tmp/base64-migration-with-avatars.json
```

Regra:

- incluir avatars apenas apÃ³s revisar impacto;
- validar perfis com foto antes e depois;
- confirmar que avatar principal continua abrindo no perfil.

---

## 10. O que o script nÃ£o faz

O script de migraÃ§Ã£o nÃ£o deve:

- remover automaticamente dados antigos;
- dropar `public.pessoas.arquivos_historicos`;
- apagar base64 legado sem auditoria;
- remover arquivos do Storage;
- alterar schema;
- criar migration.

Regra:

```txt
migraÃ§Ã£o de conteÃºdo e alteraÃ§Ã£o de schema sÃ£o frentes diferentes.
```

---

## 11. Arquivos histÃ³ricos recentes

O componente:

```txt
ArquivosHistoricos
```

envia novos arquivos para o bucket:

```txt
historical-files
```

Depois do upload, pode manter uma miniatura/card PDF em draft atÃ© o usuÃ¡rio clicar em:

```txt
Adicionar Arquivo
```

Risco conhecido:

- se o usuÃ¡rio fizer upload e abandonar o formulÃ¡rio antes de adicionar/salvar o registro, o objeto pode ficar Ã³rfÃ£o no Storage.

Regra:

```txt
a limpeza deve continuar usando diagnÃ³stico dry-run antes de qualquer remoÃ§Ã£o.
```

---

## 12. Schema relacionado

Campo relevante:

```txt
public.arquivos_historicos.categoria_evento
```

Migration:

```txt
20260522121000_add_historical_file_event_category.sql
```

Risco:

- ambientes sem essa migration podem conseguir listar arquivos;
- mas podem falhar ao inserir/atualizar payloads com `categoria_evento`.

Documento relacionado:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## 13. DependÃªncias de produto

Upload de arquivos histÃ³ricos de casamento por usuÃ¡rio comum continua sem UI ativa.

Antes de liberar, definir:

- moderaÃ§Ã£o/aprovaÃ§Ã£o;
- se usuÃ¡rio pode anexar arquivos a qualquer casamento em que sua pessoa participa;
- se usuÃ¡rio pode anexar apenas aos prÃ³prios eventos;
- se admin precisa aprovar;
- se notificaÃ§Ã£o serÃ¡ disparada;
- como evitar abuso de Storage;
- limite de tamanho e tipo de arquivo.

---

## 14. Checklist de execuÃ§Ã£o segura

Antes:

```bash
git status
npm run build
npm test
git diff --check
```

Para banco/schema:

```bash
supabase migration list
```

Para Storage:

1. confirmar `SUPABASE_URL`;
2. confirmar projeto correto;
3. confirmar `SUPABASE_SERVICE_ROLE_KEY`;
4. rodar dry-run;
5. revisar relatÃ³rio;
6. executar com flag explÃ­cita se aprovado;
7. validar UI afetada;
8. remover relatÃ³rios temporÃ¡rios se contiverem dados sensÃ­veis.

---

## 15. RelatÃ³rios gerados

RelatÃ³rios podem conter:

- paths;
- URLs;
- IDs;
- nomes de arquivos;
- referÃªncias de banco.

Regra:

```txt
nÃ£o commitar relatÃ³rios com dados reais sem revisÃ£o.
```

RecomendaÃ§Ãµes:

- salvar em `/tmp`;
- remover apÃ³s uso;
- se precisar preservar, sanitizar antes;
- nÃ£o anexar relatÃ³rio sensÃ­vel em issue pÃºblica.

---

## 16. Troubleshooting

### Script falha por falta de service role

Verificar:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

CorreÃ§Ã£o:

- definir variÃ¡vel no ambiente local;
- nÃ£o commitar a chave;
- nÃ£o usar anon key para operaÃ§Ã£o administrativa.

---

### Muitos Ã³rfÃ£os aparecem

PossÃ­veis causas:

- upload abandonado;
- mudanÃ§a de path;
- referÃªncia antiga em base64;
- campo `storage_path` ausente;
- arquivo associado por URL pÃºblica;
- relatÃ³rio considerando bucket errado.

CorreÃ§Ã£o:

- revisar amostra manualmente;
- confirmar se a UI ainda acessa o arquivo;
- nÃ£o executar `--delete-confirmed` sem validar.

---

### MigraÃ§Ã£o base64 nÃ£o encontra registros

Verificar:

```txt
public.arquivos_historicos.url
```

PossÃ­veis causas:

- dados jÃ¡ migrados;
- base64 salvo em outro campo;
- filtro do script restrito;
- ambiente errado.

---

### Arquivo migrou, mas nÃ£o abre

Verificar:

- bucket;
- path;
- polÃ­tica de acesso;
- URL salva;
- MIME type;
- `storage_bucket`;
- `storage_path`;
- cache do navegador.

---

### Insert/update falha com `categoria_evento`

Verificar:

```txt
20260522121000_add_historical_file_event_category.sql
supabase migration list
schema cache
```

NÃ£o remover `categoria_evento` do payload sem avaliar o ambiente e a migration.

---

## 17. O que nÃ£o fazer

NÃ£o fazer:

- remover Ã³rfÃ£os sem dry-run;
- usar service role no frontend;
- commitar `.env.local`;
- commitar relatÃ³rio com dados sensÃ­veis;
- dropar coluna/tabela legada sem auditoria;
- apagar base64 legado automaticamente;
- misturar limpeza de Storage com migration de schema;
- usar script em produÃ§Ã£o sem confirmar projeto.

---

## 18. O que fazer

Fazer:

- rodar dry-run;
- revisar relatÃ³rio;
- validar ambiente;
- usar flag explÃ­cita;
- validar UI depois;
- manter compatibilidade com legado;
- documentar decisÃ£o operacional;
- atualizar `MIGRATIONS_SUPABASE.md` quando houver alteraÃ§Ã£o de schema.

---

## 19. PÃ³s-MVP

PossÃ­veis evoluÃ§Ãµes:

- tela admin de diagnÃ³stico de Storage;
- job programado de relatÃ³rio de Ã³rfÃ£os sem remoÃ§Ã£o;
- limite de tamanho por tipo de arquivo;
- polÃ­tica de retenÃ§Ã£o;
- aprovaÃ§Ã£o de uploads por usuÃ¡rio comum;
- logs de upload/download;
- migraÃ§Ã£o completa de base64 legado;
- limpeza auditada de `public.pessoas.arquivos_historicos`.

Esses itens nÃ£o bloqueiam o MVP.
