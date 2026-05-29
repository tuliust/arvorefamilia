# Manutencao de Storage

> Local recomendado: `docs/operacao/STORAGE_MAINTENANCE.md`
> Tipo: documentacao operacional de manutencao controlada de Storage.

---

## 1. Objetivo

Este documento descreve procedimentos seguros para diagnosticar, migrar e limpar arquivos do Supabase Storage no projeto **Arvore Familia**.

Use este documento para:

- diagnosticar objetos orfaos;
- migrar base64 legado para Storage;
- revisar uploads abandonados;
- evitar remocoes acidentais;
- executar scripts administrativos com service role;
- preservar compatibilidade com dados legados.

---

## 2. Regra principal

Os scripts citados aqui sao seguros por padrao:

```txt
geram relatorio em dry-run e nao removem nem migram dados sem flag explicita.
```

Nenhuma operacao destrutiva deve acontecer sem:

1. dry-run;
2. revisao do relatorio;
3. confirmacao do ambiente;
4. flag explicita de escrita/remocao;
5. validacao posterior.

---

## 3. Variaveis necessarias

Defina no ambiente ou em `.env.local`:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Regras:

- usar service role somente em ambiente administrativo local ou CI protegido;
- nunca expor service role no frontend;
- nunca commitar `.env.local`;
- nunca enviar service role em documentacao, issue, log publico ou prompt;
- scripts devem falhar com mensagem explicita se `SUPABASE_SERVICE_ROLE_KEY` nao estiver definida.

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
| `historical-files` | Arquivos historicos de pessoas e relacionamentos. |

---

## 5. Diagnostico de orfaos

Comando dry-run:

```bash
node scripts/storage-diagnose-orphans.mjs --output=/tmp/storage-orphans.json
```

O script compara objetos dos buckets:

```txt
person-avatars
historical-files
```

com referencias em:

```txt
public.pessoas.foto_principal_url
public.arquivos_historicos.url
public.arquivos_historicos.storage_bucket
public.arquivos_historicos.storage_path
```

Resultado esperado:

- relatorio JSON;
- lista de objetos possivelmente orfaos;
- nenhuma remocao sem flag explicita.

---

## 6. Remocao de orfaos

Depois de revisar o relatorio, executar explicitamente:

```bash
node scripts/storage-diagnose-orphans.mjs --delete-confirmed --output=/tmp/storage-orphans-delete.json
```

Regra:

```txt
--delete-confirmed e a unica flag que habilita remocao.
```

Sem essa flag, o script apenas gera relatorio.

Antes de remover:

- conferir ambiente Supabase;
- revisar quantidade de objetos;
- revisar paths;
- confirmar se nao ha referencia indireta;
- confirmar backup, se aplicavel.

---

## 7. Migracao de base64 legado

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

## 8. Executar migracao de base64

Depois de revisar o relatorio:

```bash
node scripts/migrate-legacy-base64-files.mjs --write-confirmed --output=/tmp/base64-migration-write.json
```

Regra:

```txt
--write-confirmed e a unica flag que habilita upload no Storage e update no banco.
```

Sem essa flag, o script apenas planeja a migracao.

---

## 9. Incluir avatars legados

Opcionalmente:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --output=/tmp/base64-migration-with-avatars.json
```

Regra:

- incluir avatars apenas apos revisar impacto;
- validar perfis com foto antes e depois;
- confirmar que avatar principal continua abrindo no perfil.

---

## 10. O que o script nao faz

O script de migracao nao deve:

- remover automaticamente dados antigos;
- dropar `public.pessoas.arquivos_historicos`;
- apagar base64 legado sem auditoria;
- remover arquivos do Storage;
- alterar schema;
- criar migration.

Regra:

```txt
migracao de conteudo e alteracao de schema sao frentes diferentes.
```

---

## 11. Arquivos historicos recentes

O componente:

```txt
ArquivosHistoricos
```

envia novos arquivos para o bucket:

```txt
historical-files
```

Depois do upload, pode manter uma miniatura/card PDF em draft ate o usuario clicar em:

```txt
Adicionar Arquivo
```

Risco conhecido:

- se o usuario fizer upload e abandonar o formulario antes de adicionar/salvar o registro, o objeto pode ficar orfao no Storage.

Regra:

```txt
a limpeza deve continuar usando diagnostico dry-run antes de qualquer remocao.
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

## 13. Dependencias de produto

Upload de arquivos historicos de casamento por usuario comum continua sem UI ativa.

Antes de liberar, definir:

- moderacao/aprovacao;
- se usuario pode anexar arquivos a qualquer casamento em que sua pessoa participa;
- se usuario pode anexar apenas aos proprios eventos;
- se admin precisa aprovar;
- se notificacao sera disparada;
- como evitar abuso de Storage;
- limite de tamanho e tipo de arquivo.

---

## 14. Checklist de execucao segura

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
5. revisar relatorio;
6. executar com flag explicita se aprovado;
7. validar UI afetada;
8. remover relatorios temporarios se contiverem dados sensiveis.

---

## 15. Relatorios gerados

Relatorios podem conter:

- paths;
- URLs;
- IDs;
- nomes de arquivos;
- referencias de banco.

Regra:

```txt
nao commitar relatorios com dados reais sem revisao.
```

Recomendacoes:

- salvar em `/tmp`;
- remover apos uso;
- se precisar preservar, sanitizar antes;
- nao anexar relatorio sensivel em issue publica.

---

## 16. Troubleshooting

### Script falha por falta de service role

Verificar:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

Correcao:

- definir variavel no ambiente local;
- nao commitar a chave;
- nao usar anon key para operacao administrativa.

---

### Muitos orfaos aparecem

Possiveis causas:

- upload abandonado;
- mudanca de path;
- referencia antiga em base64;
- campo `storage_path` ausente;
- arquivo associado por URL publica;
- relatorio considerando bucket errado.

Correcao:

- revisar amostra manualmente;
- confirmar se a UI ainda acessa o arquivo;
- nao executar `--delete-confirmed` sem validar.

---

### Migracao base64 nao encontra registros

Verificar:

```txt
public.arquivos_historicos.url
```

Possiveis causas:

- dados ja migrados;
- base64 salvo em outro campo;
- filtro do script restrito;
- ambiente errado.

---

### Arquivo migrou, mas nao abre

Verificar:

- bucket;
- path;
- politica de acesso;
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

Nao remover `categoria_evento` do payload sem avaliar o ambiente e a migration.

---

## 17. O que nao fazer

Nao fazer:

- remover orfaos sem dry-run;
- usar service role no frontend;
- commitar `.env.local`;
- commitar relatorio com dados sensiveis;
- dropar coluna/tabela legada sem auditoria;
- apagar base64 legado automaticamente;
- misturar limpeza de Storage com migration de schema;
- usar script em producao sem confirmar projeto.

---

## 18. O que fazer

Fazer:

- rodar dry-run;
- revisar relatorio;
- validar ambiente;
- usar flag explicita;
- validar UI depois;
- manter compatibilidade com legado;
- documentar decisao operacional;
- atualizar `MIGRATIONS_SUPABASE.md` quando houver alteracao de schema.

---

## 19. Pos-MVP

Possiveis evolucoes:

- tela admin de diagnostico de Storage;
- job programado de relatorio de orfaos sem remocao;
- limite de tamanho por tipo de arquivo;
- politica de retencao;
- aprovacao de uploads por usuario comum;
- logs de upload/download;
- migracao completa de base64 legado;
- limpeza auditada de `public.pessoas.arquivos_historicos`.

Esses itens nao bloqueiam o MVP.
