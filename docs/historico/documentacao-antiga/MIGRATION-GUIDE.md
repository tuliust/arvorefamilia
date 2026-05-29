> Status: documento historico / obsoleto.
> Local: `docs/historico/documentacao-antiga/`.
> Nao usar como fonte canonica para desenvolvimento atual.
>
> Fonte canonica atual:
>
> ```txt
> docs/README.md
> docs/operacao/MIGRATIONS_SUPABASE.md
> docs/arquitetura/ROTAS_E_GUARDS.md
> docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
> ```
>
> Este arquivo foi preservado apenas para rastreabilidade historica. Ele pode citar rotas, scripts SQL, endpoints, dados de seed, senhas, numeros de registros ou fluxos que nao representam mais o estado atual do projeto.

---

## Aviso operacional atual

Este guia e anterior ao fluxo atual de migrations.

Nao executar `database-schema.sql` nem rotinas destrutivas antigas como fonte principal de schema em ambiente atual. Para operacao corrente, usar:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
supabase/migrations/
```

Scripts SQL antigos devem ser tratados como referencia historica, nao como procedimento padrao.

---

# Guide Migracao parBanco de Dados Supabase

## Visao Geral

Este guiexpliccomo migrar os dados darvore genealogicdo armazenamento em memoriparo banco de dados PostgreSQL do Supabase.

##  Arquiteturdo Banco de Dados

### Tabelas Criadas:

1. **`pessoas`** - Armazeninformacoes sobre membros dfamilie pets
  - Campos: id, nome_completo, data_nascimento, local_nascimento, foto_principal_url, etc.
  - Chave primaria: UUID gerado automaticamente

2. **`relacionamentos`** - Define as conexoes entre pessoas
  - Campos: id, pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento
  - Chaves estrangeiras: pessoa_origem_id -> pessoas.id, pessoa_destino_id -> pessoas.id
  - Tipos: pai, mae, filho, conjuge, irmao

3. **`arquivos_historicos`** - Fotos e documentos historicos
  - Campos: id, pessoa_id, url, titulo, descricao, ano, tipo
  - Chave estrangeira: pessoa_id pessoas.id

### Relacionamentos entre Tabelas:

```
pessoas (1) -> (N) relacionamentos
pessoas (1) -> (N) arquivos_historicos
```

## Passo Passo dMigracao

### 1. Executar o SchemSQL

1. Acesse o **Supabase Dashboard**
2. Vem **SQL Editor**
3. Clique em **New Query**
4. Abro arquivo `/database-schema.sql` deste projeto
5. **Copie todo o conteudo** e cole no SQL Editor
6. Clique em **Run** parexecutar

**O que esse script faz:**
- - Crias 3 tabelas com todos os campos e tipos corretos
- - Define chaves primarias e estrangeiras
- - Criindices parotimizacao de queries
- - Configurtriggers paratualizar `updated_at` automaticamente
- - HabilitRLS (Row Level Security) com politicas de acesso
- - Criviews uteis parestatisticas

### 2. Executar Migracao dos Dados

**Opcao A: Virotinserver-side/transacional (Recomendado)**

1. Facbackup do banco no ambiente correto
2. Execute umrotinserver-side/RPC revisadem ambiente local ou staging
3. Garantque rotinrode em transacao e valide admin vi`profiles.role = 'admin'`
4. Nao execute deletes/inserts destrutivos partir do frontend

**Opcao B: ViAPI legado**

```bash
curl -X POST \
 https://{PROJECT_ID}.supabase.co/functions/v1/make-server-055bf375/migrar-dados \
 -H "Authorization: Bearer {ANON_KE}" \
 -H "Content-Type: application/json" \
 -d '{"seed": [...dados do seed...]}'
```

### 3. Verificar Migracao

**No Supabase Dashboard:**

1. Vem **Table Editor**
2. Verifique tabel`pessoas`:
  - Deve ter 62 registros
  - Todos com UUIDs gerados automaticamente
3. Verifique tabel`relacionamentos`:
  - Deve ter centenas de registros (filiacao, conjugal, irmaos)
4. Confirme que os relacionamentos estao corretos

**NAplicacao:**

1. Acesse home `/` parver arvore genealogica
2. Navegue entre as pessoas
3. Teste busca
4. Verifique se as fotos e dados aparecem corretamente
5. Acesse `/pessoa/{id}` de algum membro parver detalhes

## Endpoints dAPI

O servidor Hono expoe os seguintes endpoints:

### Pessoas

- `GET /make-server-055bf375/pessoas` - Listar todas
- `GET /make-server-055bf375/pessoas/:id` - Obter por ID
- `POST /make-server-055bf375/pessoas` - Criar nova
- `PUT /make-server-055bf375/pessoas/:id` - Atualizar
- `DELETE /make-server-055bf375/pessoas/:id` - Deletar

### Relacionamentos

- `GET /make-server-055bf375/relacionamentos` - Listar todos
- `GET /make-server-055bf375/pessoas/:id/relacionamentos` - Por pessoa
- `POST /make-server-055bf375/relacionamentos` - Criar novo
- `PUT /make-server-055bf375/relacionamentos/:id` - Atualizar
- `DELETE /make-server-055bf375/relacionamentos/:id` - Deletar

### Arquivos Historicos

- `GET /make-server-055bf375/pessoas/:id/arquivos` - Listar de umpessoa
- `POST /make-server-055bf375/arquivos` - Criar novo
- `PUT /make-server-055bf375/arquivos/:id` - Atualizar
- `DELETE /make-server-055bf375/arquivos/:id` - Deletar

### Migracao

- `POST /make-server-055bf375/migrar-dados` - Executar migracao inicial

##  O Que Foi Implementado

- **SchemRelacional Completo**
- 3 tabelas normalizadas
- Chaves primarias e estrangeiras
- Indices parperformance
- Triggers automaticos

- **API RESTful Completa**
- CRUD partodas as entidades
- Endpoints especificos parrelacionamentos
- Tratamento de erros
- CORS habilitado

- **Deteccao Automaticde Irmaos**
- Algoritmo que identificirmaos pelos pais
- Criacao automaticde relacionamentos
- Evitduplicatas

- **Integracao Frontend**
- dataService atualizado parusar API
- Carregamento assincrono de dados
- Interface de migracao no admin

- **Seguranca**
- RLS habilitado
- Service role paroperacoes de escrita
- Anon key parleiturpublica

## Aviso Avisos Importantes

1. **Backup**: A migracao apagtodos os dados existentes. Sempre facbackup antes!

2. **UUID vs String**: Os IDs agorsao UUIDs gerados pelo Supabase. O frontend foi atualizado parlidar com isso.

3. **Async/Await**: Todas as operacoes de dados agorsao assincronas. Certifique-se de usar `await` nas chamadas.

4. **Performance**: Pargrandes volumes de dados, considere implementar paginacao e cache.

5. **RLS em Producao**: As politicas atuais permitem acesso publico parleitura. Em producao, implemente autenticacao e restrinjadequadamente.

## Proximos Passos (Opcional)

1. **Implementar Paginacao**: Parlistas grandes de pessoas
2. **Adicionar Cache**: Redis ou similar parperformance
3. **Upload de Fotos**: Integrar com Supabase Storage paruploads reais
4. **Autenticacao**: Implementar login com Supabase Auth
5. **Logs de Auditoria**: Rastrear quem fez o que e quando
6. **Backup Automatico**: Schedule parbackups regulares
7. **Search Otimizado**: Implementar full-text search no Postgres

## Troubleshooting

### Erro: "relation pessoas does not exist"
**Solucao**: Execute o `database-schema.sql` primeiro no SQL Editor

### Erro: "CORS policy blocked"
**Solucao**: Verifique se o servidor Hono estrodando e o CORS esthabilitado

### Erro: "Authentication required"
**Solucao**: Verifique se estusando `publicAnonKey` nos headers

### Dados nao aparecem
**Solucao**:
1. Verifique no Supabase Table Editor se os dados foram criados
2. Abro Console do navegador e vejos erros
3. Confirme que migracao foi executadcom sucesso

## Documentacao Adicional

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Hono Framework](https://hono.dev/)
- [React Router](https://reactrouter.com/)

---

**Criado por**: Sistemde Arvore Genealogica
**Data**: 2026-04-05
