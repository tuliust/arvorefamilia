# Manutenção de Storage

> Local recomendado: `docs/operacao/STORAGE_MAINTENANCE.md`  
> Tipo: documentação operacional de manutenção controlada de Storage.

---

## 1. Objetivo

Este documento descreve procedimentos seguros para diagnosticar, migrar e limpar arquivos do Supabase Storage no projeto **Árvore Família**.

Use este documento para:

- diagnosticar objetos órfãos;
- migrar base64 legado para Storage;
- revisar uploads abandonados;
- evitar remoções acidentais;
- executar scripts administrativos com service role;
- preservar compatibilidade com dados legados.

---

## 2. Regra principal

Os scripts citados aqui são seguros por padrão:

```txt
geram relatório em dry-run e não removem nem migram dados sem flag explícita.
```

Nenhuma operação destrutiva deve acontecer sem:

1. dry-run;
2. revisão do relatório;
3. confirmação do ambiente;
4. flag explícita de escrita/remoção;
5. validação posterior.

---

## 3. Variáveis necessárias

Defina no ambiente ou em `.env.local`:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Regras:

- usar service role somente em ambiente administrativo local ou CI protegido;
- nunca expor service role no frontend;
- nunca commitar `.env.local`;
- nunca enviar service role em documentação, issue, log público ou prompt;
- scripts devem falhar com mensagem explícita se `SUPABASE_SERVICE_ROLE_KEY` não estiver definida.

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
| `historical-files` | Arquivos históricos de pessoas e relacionamentos. |

---

## 5. Diagnóstico de órfãos

Comando dry-run:

```bash
node scripts/storage-diagnose-orphans.mjs --output=/tmp/storage-orphans.json
```

O script compara objetos dos buckets:

```txt
person-avatars
historical-files
```

com referências em:

```txt
public.pessoas.foto_principal_url
public.arquivos_historicos.url
public.arquivos_historicos.storage_bucket
public.arquivos_historicos.storage_path
```

Resultado esperado:

- relatório JSON;
- lista de objetos possivelmente órfãos;
- nenhuma remoção sem flag explícita.

---

## 6. Remoção de órfãos

Depois de revisar o relatório, executar explicitamente:

```bash
node scripts/storage-diagnose-orphans.mjs --delete-confirmed --output=/tmp/storage-orphans-delete.json
```

Regra:

```txt
--delete-confirmed é a única flag que habilita remoção.
```

Sem essa flag, o script apenas gera relatório.

Antes de remover:

- conferir ambiente Supabase;
- revisar quantidade de objetos;
- revisar paths;
- confirmar se não há referência indireta;
- confirmar backup, se aplicável.

---

## 7. Migração de base64 legado

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

## 8. Executar migração de base64

Depois de revisar o relatório:

```bash
node scripts/migrate-legacy-base64-files.mjs --write-confirmed --output=/tmp/base64-migration-write.json
```

Regra:

```txt
--write-confirmed é a única flag que habilita upload no Storage e update no banco.
```

Sem essa flag, o script apenas planeja a migração.

---

## 9. Incluir avatars legados

Opcionalmente:

```bash
node scripts/migrate-legacy-base64-files.mjs --include-avatars --output=/tmp/base64-migration-with-avatars.json
```

Regra:

- incluir avatars apenas após revisar impacto;
- validar perfis com foto antes e depois;
- confirmar que avatar principal continua abrindo no perfil.

---

## 10. O que o script não faz

O script de migração não deve:

- remover automaticamente dados antigos;
- dropar `public.pessoas.arquivos_historicos`;
- apagar base64 legado sem auditoria;
- remover arquivos do Storage;
- alterar schema;
- criar migration.

Regra:

```txt
migração de conteúdo e alteração de schema são frentes diferentes.
```

---

## 11. Arquivos históricos recentes

O componente:

```txt
ArquivosHistoricos
```

envia novos arquivos para o bucket:

```txt
historical-files
```

Depois do upload, pode manter uma miniatura/card PDF em draft até o usuário clicar em:

```txt
Adicionar Arquivo
```

Risco conhecido:

- se o usuário fizer upload e abandonar o formulário antes de adicionar/salvar o registro, o objeto pode ficar órfão no Storage.

Regra:

```txt
a limpeza deve continuar usando diagnóstico dry-run antes de qualquer remoção.
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

## 13. Dependências de produto

Upload de arquivos históricos de casamento por usuário comum continua sem UI ativa.

Antes de liberar, definir:

- moderação/aprovação;
- se usuário pode anexar arquivos a qualquer casamento em que sua pessoa participa;
- se usuário pode anexar apenas aos próprios eventos;
- se admin precisa aprovar;
- se notificação será disparada;
- como evitar abuso de Storage;
- limite de tamanho e tipo de arquivo.

---

## 14. Checklist de execução segura

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
5. revisar relatório;
6. executar com flag explícita se aprovado;
7. validar UI afetada;
8. remover relatórios temporários se contiverem dados sensíveis.

---

## 15. Relatórios gerados

Relatórios podem conter:

- paths;
- URLs;
- IDs;
- nomes de arquivos;
- referências de banco.

Regra:

```txt
não commitar relatórios com dados reais sem revisão.
```

Recomendações:

- salvar em `/tmp`;
- remover após uso;
- se precisar preservar, sanitizar antes;
- não anexar relatório sensível em issue pública.

---

## 16. Troubleshooting

### Script falha por falta de service role

Verificar:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

Correção:

- definir variável no ambiente local;
- não commitar a chave;
- não usar anon key para operação administrativa.

---

### Muitos órfãos aparecem

Possíveis causas:

- upload abandonado;
- mudança de path;
- referência antiga em base64;
- campo `storage_path` ausente;
- arquivo associado por URL pública;
- relatório considerando bucket errado.

Correção:

- revisar amostra manualmente;
- confirmar se a UI ainda acessa o arquivo;
- não executar `--delete-confirmed` sem validar.

---

### Migração base64 não encontra registros

Verificar:

```txt
public.arquivos_historicos.url
```

Possíveis causas:

- dados já migrados;
- base64 salvo em outro campo;
- filtro do script restrito;
- ambiente errado.

---

### Arquivo migrou, mas não abre

Verificar:

- bucket;
- path;
- política de acesso;
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

Não remover `categoria_evento` do payload sem avaliar o ambiente e a migration.

---

## 17. O que não fazer

Não fazer:

- remover órfãos sem dry-run;
- usar service role no frontend;
- commitar `.env.local`;
- commitar relatório com dados sensíveis;
- dropar coluna/tabela legada sem auditoria;
- apagar base64 legado automaticamente;
- misturar limpeza de Storage com migration de schema;
- usar script em produção sem confirmar projeto.

---

## 18. O que fazer

Fazer:

- rodar dry-run;
- revisar relatório;
- validar ambiente;
- usar flag explícita;
- validar UI depois;
- manter compatibilidade com legado;
- documentar decisão operacional;
- atualizar `MIGRATIONS_SUPABASE.md` quando houver alteração de schema.

---

## 19. Pós-MVP

Possíveis evoluções:

- tela admin de diagnóstico de Storage;
- job programado de relatório de órfãos sem remoção;
- limite de tamanho por tipo de arquivo;
- política de retenção;
- aprovação de uploads por usuário comum;
- logs de upload/download;
- migração completa de base64 legado;
- limpeza auditada de `public.pessoas.arquivos_historicos`.

Esses itens não bloqueiam o MVP.
