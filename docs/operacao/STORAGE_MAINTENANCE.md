# ManutenÃ§Ã£o de Storage

> Ãšltima revisÃ£o: 2026-06-14
> Local canÃ´nico: `docs/operacao/STORAGE_MAINTENANCE.md`
> Tipo: documentaÃ§Ã£o operacional de manutenÃ§Ã£o controlada de Storage.
> Status: revisado contra scripts atuais de diagnÃ³stico/migraÃ§Ã£o, buckets principais, arquivos histÃ³ricos, base64 legado e regras de seguranÃ§a operacional.

## 1. Objetivo

Este documento descreve procedimentos seguros para diagnosticar, migrar e limpar arquivos do Supabase Storage no projeto **Ãrvore FamÃ­lia**.

Use este arquivo para:

- diagnosticar objetos Ã³rfÃ£os;
- migrar base64 legado para Storage;
- revisar uploads abandonados;
- executar scripts administrativos com service role;
- preservar compatibilidade com dados legados;
- evitar remoÃ§Ãµes acidentais.

## 2. Regra principal

Os scripts de Storage devem ser executados primeiro em dry-run.

Scripts atuais:

```txt
scripts/storage-diagnose-orphans.mjs
scripts/migrate-legacy-base64-files.mjs
```

Nenhuma operaÃ§Ã£o destrutiva deve acontecer sem:

1. confirmaÃ§Ã£o do ambiente;
2. dry-run;
3. revisÃ£o do relatÃ³rio;
4. backup quando houver risco de perda;
5. flag explÃ­cita de escrita/remoÃ§Ã£o;
6. validaÃ§Ã£o posterior da UI afetada.

## 2.1 RelaÃ§Ã£o com as views da Ã¡rvore

Ajustes recentes em `/mapa-familiar`, `/mapa-familiar-horizontal`, exportaÃ§Ã£o, conectores, avatares e modal mobile nÃ£o alteram Storage.

Storage sÃ³ entra no escopo quando a mudanÃ§a envolver:

- upload ou remoÃ§Ã£o de foto/avatar;
- arquivos histÃ³ricos;
- base64 legado;
- buckets `person-avatars` ou `historical-files`;
- URLs, `storage_bucket`, `storage_path` ou policies;
- scripts administrativos de limpeza/migraÃ§Ã£o.

Regra:

```txt
Corrigir avatar fallback SVG, card visual, exportaÃ§Ã£o, fundo transparente ou painel mobile nÃ£o exige operaÃ§Ã£o de Storage.
```

---

## 3. VariÃ¡veis necessÃ¡rias

Scripts administrativos usam:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Regras:

- usar service role apenas em ambiente administrativo local ou CI protegido;
- nunca usar service role no frontend;
- nunca commitar `.env.local`;
- nunca colar service role em issue, prompt, log pÃºblico ou documentaÃ§Ã£o;
- scripts devem falhar se `SUPABASE_SERVICE_ROLE_KEY` nÃ£o estiver definida.

ObservaÃ§Ã£o: os scripts tambÃ©m aceitam fallback `VITE_SUPABASE_URL` para URL, mas a service role continua obrigatÃ³ria para operaÃ§Ã£o administrativa.

## 4. Buckets principais

| Bucket | Uso |
|---|---|
| `person-avatars` | Foto/avatar principal de pessoas. |
| `historical-files` | Arquivos histÃ³ricos de pessoas e relacionamentos. |

## 5. DiagnÃ³stico de Ã³rfÃ£os

Dry-run:

```bash
node scripts/storage-diagnose-orphans.mjs --output=/tmp/storage-orphans.json
```

Com buckets explÃ­citos:

```bash
node scripts/storage-diagnose-orphans.mjs --buckets=person-avatars,historical-files --output=/tmp/storage-orphans.json
```

O script compara objetos dos buckets com referÃªncias em:

```txt
public.pessoas.foto_principal_url
public.arquivos_historicos.url
public.arquivos_historicos.storage_bucket
public.arquivos_historicos.storage_path
```

Resultado esperado:

- JSON de diagnÃ³stico;
- contagem por bucket;
- lista de possÃ­veis Ã³rfÃ£os;
- nenhuma remoÃ§Ã£o sem `--delete-confirmed`.

## 6. RemoÃ§Ã£o de Ã³rfÃ£os

Executar apenas depois de revisar o relatÃ³rio:

```bash
node scripts/storage-diagnose-orphans.mjs --delete-confirmed --output=/tmp/storage-orphans-delete.json
```

Regra:

```txt
--delete-confirmed Ã© a Ãºnica flag que habilita remoÃ§Ã£o.
```

Antes de remover:

- conferir projeto Supabase;
- revisar quantidade de objetos;
- revisar amostra de paths;
- confirmar se nÃ£o hÃ¡ referÃªncia indireta;
- confirmar backup quando aplicÃ¡vel.

## 7. MigraÃ§Ã£o de base64 legado

Dry-run:

```bash
node scripts/migrate-legacy-base64-files.mjs --output=/tmp/base64-migration.json
```

O script detecta valores no padrÃ£o:

```txt
data:*;base64,...
```

em:

```txt
public.arquivos_historicos.url
```

e calcula:

- MIME type;
- bytes;
- nome seguro;
- path de destino no bucket `historical-files`;
- plano de atualizaÃ§Ã£o no banco.

## 8. Executar migraÃ§Ã£o de base64

Executar apenas depois de revisar o relatÃ³rio:

```bash
node scripts/migrate-legacy-base64-files.mjs --write-confirmed --output=/tmp/base64-migration-write.json
```

Regra:

```txt
--write-confirmed Ã© a Ãºnica flag que habilita upload no Storage e update no banco.
```

Sem essa flag, o script apenas planeja a migraÃ§Ã£o.

## 9. Avatares legados

Opcionalmente, o script pode incluir avatares:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --output=/tmp/base64-migration-with-avatars.json
```

Para aplicar escrita incluindo avatares:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --write-confirmed --output=/tmp/base64-migration-with-avatars-write.json
```

Regras:

- incluir avatares apenas apÃ³s revisar impacto;
- validar perfis com foto antes e depois;
- confirmar que `pessoas.foto_principal_url` continua abrindo;
- nÃ£o apagar base64 legado fora do comportamento do script.

## 10. O que os scripts nÃ£o fazem

Os scripts nÃ£o devem:

- alterar schema;
- criar migration;
- dropar coluna legada;
- remover base64 legado sem auditoria separada;
- remover arquivos do Storage durante migraÃ§Ã£o;
- resolver polÃ­ticas de Storage;
- substituir validaÃ§Ã£o funcional da UI.

Regra:

```txt
migraÃ§Ã£o de conteÃºdo e alteraÃ§Ã£o de schema sÃ£o frentes diferentes.
```

## 11. Arquivos histÃ³ricos recentes

O componente `ArquivosHistoricos` envia novos uploads para:

```txt
historical-files
```

Risco conhecido:

- se o usuÃ¡rio faz upload e abandona o formulÃ¡rio antes de adicionar/salvar o registro, o objeto pode ficar Ã³rfÃ£o no Storage.

Regra:

- a limpeza deve continuar usando diagnÃ³stico dry-run antes de qualquer remoÃ§Ã£o.

## 12. Schema relacionado

Campos relevantes de `public.arquivos_historicos`:

```txt
url
storage_bucket
storage_path
mime_type
categoria_evento
```

Migration relevante:

```txt
20260522121000_add_historical_file_event_category.sql
```

Risco:

- ambiente sem essa migration pode listar arquivos, mas falhar ao inserir/atualizar payloads com `categoria_evento`.

Documento relacionado:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

## 13. RelatÃ³rios gerados

RelatÃ³rios podem conter:

- paths;
- URLs;
- IDs;
- nomes de arquivos;
- referÃªncias de banco;
- metadados operacionais.

Regras:

- salvar preferencialmente em `/tmp`;
- nÃ£o commitar relatÃ³rio com dados reais;
- sanitizar antes de compartilhar;
- remover relatÃ³rio local apÃ³s uso quando contiver dados sensÃ­veis.

## 14. Checklist de execuÃ§Ã£o segura

Se a tarefa for apenas visual/documental, sem arquivos reais, bucket ou URL de Storage:

```txt
NÃ£o rodar scripts de Storage.
NÃ£o usar service role.
NÃ£o gerar relatÃ³rio de Ã³rfÃ£os.
```

Para tarefas reais de Storage:

Antes:

```bash
git status --short
git diff --check
npm run build
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
8. remover/sanitizar relatÃ³rios temporÃ¡rios.

## 15. Troubleshooting

### Script falha por falta de service role

Verificar:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

CorreÃ§Ã£o:

- definir variÃ¡vel no ambiente local ou CI protegido;
- nÃ£o usar anon key;
- nÃ£o commitar a chave.

### Muitos Ã³rfÃ£os aparecem

PossÃ­veis causas:

- upload abandonado;
- path alterado;
- referÃªncia antiga em base64;
- campo `storage_path` ausente;
- arquivo associado apenas por URL pÃºblica;
- bucket errado no comando.

CorreÃ§Ã£o:

- revisar amostra manualmente;
- confirmar se a UI ainda acessa o arquivo;
- nÃ£o executar `--delete-confirmed` sem validaÃ§Ã£o.

### MigraÃ§Ã£o base64 nÃ£o encontra registros

Verificar:

```txt
public.arquivos_historicos.url
```

PossÃ­veis causas:

- dados jÃ¡ migrados;
- base64 salvo em outro campo;
- ambiente errado;
- registros fora do filtro esperado.

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

### Insert/update falha com `categoria_evento`

Verificar:

```txt
20260522121000_add_historical_file_event_category.sql
supabase migration list
schema cache
docs/operacao/MIGRATIONS_SUPABASE.md
```

NÃ£o remover `categoria_evento` do payload sem avaliar o ambiente e a migration.

## 16. NÃ£o fazer

- NÃ£o remover Ã³rfÃ£os sem dry-run.
- NÃ£o usar service role no frontend.
- NÃ£o commitar `.env.local`.
- NÃ£o commitar relatÃ³rio com dados sensÃ­veis.
- NÃ£o dropar coluna/tabela legada sem auditoria.
- NÃ£o apagar base64 legado automaticamente.
- NÃ£o misturar limpeza de Storage com migration de schema.
- NÃ£o usar scripts em produÃ§Ã£o sem confirmar projeto.
- NÃ£o tratar relatÃ³rio de Ã³rfÃ£os como autorizaÃ§Ã£o automÃ¡tica de remoÃ§Ã£o.

## 17. EvoluÃ§Ãµes futuras

| Frente | DireÃ§Ã£o |
|---|---|
| Admin Storage | Criar tela admin de diagnÃ³stico sem remoÃ§Ã£o automÃ¡tica. |
| Job de diagnÃ³stico | Gerar relatÃ³rio periÃ³dico de Ã³rfÃ£os, sem deleÃ§Ã£o. |
| Uploads | Definir limite por tipo/tamanho. |
| RetenÃ§Ã£o | Criar polÃ­tica formal de retenÃ§Ã£o. |
| AprovaÃ§Ã£o | Avaliar aprovaÃ§Ã£o de uploads de usuÃ¡rio comum. |
| Logs | Registrar upload/download quando houver necessidade operacional. |
| Legado | Planejar limpeza auditada de `public.pessoas.arquivos_historicos`. |

Esses itens nÃ£o bloqueiam o MVP.
