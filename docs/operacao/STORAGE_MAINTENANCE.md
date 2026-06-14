# Manutenção de Storage

> Última revisão: 2026-06-14
> Local canônico: `docs/operacao/STORAGE_MAINTENANCE.md`
> Tipo: documentação operacional de manutenção controlada de Storage.
> Status: revisado contra scripts atuais de diagnóstico/migração, buckets principais, arquivos históricos, base64 legado e regras de segurança operacional.

## 1. Objetivo

Este documento descreve procedimentos seguros para diagnosticar, migrar e limpar arquivos do Supabase Storage no projeto **Árvore Família**.

Use este arquivo para:

- diagnosticar objetos órfãos;
- migrar base64 legado para Storage;
- revisar uploads abandonados;
- executar scripts administrativos com service role;
- preservar compatibilidade com dados legados;
- evitar remoções acidentais.

## 2. Regra principal

Os scripts de Storage devem ser executados primeiro em dry-run.

Scripts atuais:

```txt
scripts/storage-diagnose-orphans.mjs
scripts/migrate-legacy-base64-files.mjs
```

Nenhuma operação destrutiva deve acontecer sem:

1. confirmação do ambiente;
2. dry-run;
3. revisão do relatório;
4. backup quando houver risco de perda;
5. flag explícita de escrita/remoção;
6. validação posterior da UI afetada.

## 2.1 Relação com as views da árvore

Ajustes recentes em `/mapa-familiar`, `/mapa-familiar-horizontal`, exportação, conectores, avatares e modal mobile não alteram Storage.

Storage só entra no escopo quando a mudança envolver:

- upload ou remoção de foto/avatar;
- arquivos históricos;
- base64 legado;
- buckets `person-avatars` ou `historical-files`;
- URLs, `storage_bucket`, `storage_path` ou policies;
- scripts administrativos de limpeza/migração.

Regra:

```txt
Corrigir avatar fallback SVG, card visual, exportação, fundo transparente, painel mobile, bolinha de calendário ou borda de grupo não exige operação de Storage.
```

---

## 2.2 Avatares, fotos e fallback visual

A regra de Storage só se aplica à **foto real** quando há upload, remoção ou migração de arquivo.

Contrato visual atual dos cards:

| Caso | Origem |
|---|---|
| Pessoa com foto | `pessoas.foto_principal_url`, bucket `person-avatars` quando aplicável |
| Pessoa sem foto | fallback visual `User`, sem Storage |
| Pet sem foto | fallback visual `PawPrint`, sem Storage |

Regras:

- trocar fallback visual de card não cria objeto de Storage;
- corrigir SVG, cor, borda, paleta ou exportação não exige script de Storage;
- só rodar manutenção quando houver upload, URL, bucket, `storage_path`, base64 ou arquivo real envolvido;
- não apagar fotos reais para corrigir fallback visual.

---

## 3. Variáveis necessárias

Scripts administrativos usam:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Regras:

- usar service role apenas em ambiente administrativo local ou CI protegido;
- nunca usar service role no frontend;
- nunca commitar `.env.local`;
- nunca colar service role em issue, prompt, log público ou documentação;
- scripts devem falhar se `SUPABASE_SERVICE_ROLE_KEY` não estiver definida.

Observação: os scripts também aceitam fallback `VITE_SUPABASE_URL` para URL, mas a service role continua obrigatória para operação administrativa.

## 4. Buckets principais

| Bucket | Uso |
|---|---|
| `person-avatars` | Foto/avatar principal de pessoas. |
| `historical-files` | Arquivos históricos de pessoas e relacionamentos. |

## 5. Diagnóstico de órfãos

Dry-run:

```bash
node scripts/storage-diagnose-orphans.mjs --output=/tmp/storage-orphans.json
```

Com buckets explícitos:

```bash
node scripts/storage-diagnose-orphans.mjs --buckets=person-avatars,historical-files --output=/tmp/storage-orphans.json
```

O script compara objetos dos buckets com referências em:

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
- nenhuma remoção sem `--delete-confirmed`.

## 6. Remoção de órfãos

Executar apenas depois de revisar o relatório:

```bash
node scripts/storage-diagnose-orphans.mjs --delete-confirmed --output=/tmp/storage-orphans-delete.json
```

Regra:

```txt
--delete-confirmed é a única flag que habilita remoção.
```

Antes de remover:

- conferir projeto Supabase;
- revisar quantidade de objetos;
- revisar amostra de paths;
- confirmar se não há referência indireta;
- confirmar backup quando aplicável.

## 7. Migração de base64 legado

Dry-run:

```bash
node scripts/migrate-legacy-base64-files.mjs --output=/tmp/base64-migration.json
```

O script detecta valores no padrão:

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
- plano de atualização no banco.

## 8. Executar migração de base64

Executar apenas depois de revisar o relatório:

```bash
node scripts/migrate-legacy-base64-files.mjs --write-confirmed --output=/tmp/base64-migration-write.json
```

Regra:

```txt
--write-confirmed é a única flag que habilita upload no Storage e update no banco.
```

Sem essa flag, o script apenas planeja a migração.

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

- incluir avatares apenas após revisar impacto;
- validar perfis com foto antes e depois;
- confirmar que `pessoas.foto_principal_url` continua abrindo;
- não apagar base64 legado fora do comportamento do script.

## 10. O que os scripts não fazem

Os scripts não devem:

- alterar schema;
- criar migration;
- dropar coluna legada;
- remover base64 legado sem auditoria separada;
- remover arquivos do Storage durante migração;
- resolver políticas de Storage;
- substituir validação funcional da UI.

Regra:

```txt
migração de conteúdo e alteração de schema são frentes diferentes.
```

## 11. Arquivos históricos recentes

O componente `ArquivosHistoricos` envia novos uploads para:

```txt
historical-files
```

Risco conhecido:

- se o usuário faz upload e abandona o formulário antes de adicionar/salvar o registro, o objeto pode ficar órfão no Storage.

Regra:

- a limpeza deve continuar usando diagnóstico dry-run antes de qualquer remoção.

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

## 13. Relatórios gerados

Relatórios podem conter:

- paths;
- URLs;
- IDs;
- nomes de arquivos;
- referências de banco;
- metadados operacionais.

Regras:

- salvar preferencialmente em `/tmp`;
- não commitar relatório com dados reais;
- sanitizar antes de compartilhar;
- remover relatório local após uso quando contiver dados sensíveis.

## 14. Checklist de execução segura

Se a tarefa for apenas visual/documental, sem arquivos reais, bucket ou URL de Storage:

```txt
Não rodar scripts de Storage.
Não usar service role.
Não gerar relatório de órfãos.
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
5. revisar relatório;
6. executar com flag explícita se aprovado;
7. validar UI afetada;
8. remover/sanitizar relatórios temporários.

## 15. Troubleshooting

### Script falha por falta de service role

Verificar:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

Correção:

- definir variável no ambiente local ou CI protegido;
- não usar anon key;
- não commitar a chave.

### Muitos órfãos aparecem

Possíveis causas:

- upload abandonado;
- path alterado;
- referência antiga em base64;
- campo `storage_path` ausente;
- arquivo associado apenas por URL pública;
- bucket errado no comando.

Correção:

- revisar amostra manualmente;
- confirmar se a UI ainda acessa o arquivo;
- não executar `--delete-confirmed` sem validação.

### Migração base64 não encontra registros

Verificar:

```txt
public.arquivos_historicos.url
```

Possíveis causas:

- dados já migrados;
- base64 salvo em outro campo;
- ambiente errado;
- registros fora do filtro esperado.

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

### Insert/update falha com `categoria_evento`

Verificar:

```txt
20260522121000_add_historical_file_event_category.sql
supabase migration list
schema cache
docs/operacao/MIGRATIONS_SUPABASE.md
```

Não remover `categoria_evento` do payload sem avaliar o ambiente e a migration.

## 16. Não fazer

- Não remover órfãos sem dry-run.
- Não usar service role no frontend.
- Não commitar `.env.local`.
- Não commitar relatório com dados sensíveis.
- Não dropar coluna/tabela legada sem auditoria.
- Não apagar base64 legado automaticamente.
- Não misturar limpeza de Storage com migration de schema.
- Não usar scripts em produção sem confirmar projeto.
- Não tratar relatório de órfãos como autorização automática de remoção.

## 17. Evoluções futuras

| Frente | Direção |
|---|---|
| Admin Storage | Criar tela admin de diagnóstico sem remoção automática. |
| Job de diagnóstico | Gerar relatório periódico de órfãos, sem deleção. |
| Uploads | Definir limite por tipo/tamanho. |
| Retenção | Criar política formal de retenção. |
| Aprovação | Avaliar aprovação de uploads de usuário comum. |
| Logs | Registrar upload/download quando houver necessidade operacional. |
| Legado | Planejar limpeza auditada de `public.pessoas.arquivos_historicos`. |

Esses itens não bloqueiam o MVP.
