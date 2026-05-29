# Y3 Guia de Migracao para Banco de Dados Supabase

## Y Visao Geral

Este guia explica como migrar os dados da arvore genealogica do armazenamento em memoria para o banco de dados PostgreSQL do Supabase.

## Yi  Arquitetura do Banco de Dados

### Tabelas Criadas:

1. **`pessoas`** - Armazena informacoes sobre membros da familia e pets
   - Campos: id, nome_completo, data_nascimento, local_nascimento, foto_principal_url, etc.
   - Chave primaria: UUID gerado automaticamente

2. **`relacionamentos`** - Define as conexoes entre pessoas
   - Campos: id, pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento
   - Chaves estrangeiras: pessoa_origem_id  pessoas.id, pessoa_destino_id  pessoas.id
   - Tipos: pai, mae, filho, conjuge, irmao

3. **`arquivos_historicos`** - Fotos e documentos historicos
   - Campos: id, pessoa_id, url, titulo, descricao, ano, tipo
   - Chave estrangeira: pessoa_id  pessoas.id

### Relacionamentos entre Tabelas:

```
pessoas (1) aaa (N) relacionamentos
pessoas (1) aaa (N) arquivos_historicos
```

## Y Passo a Passo da Migracao

### 1i a Executar o Schema SQL

1. Acesse o **Supabase Dashboard**
2. Va em **SQL Editor**
3. Clique em **New Query**
4. Abra o arquivo `/database-schema.sql` deste projeto
5. **Copie todo o conteudo** e cole no SQL Editor
6. Clique em **Run** para executar

**O que esse script faz:**
- a... Cria as 3 tabelas com todos os campos e tipos corretos
- a... Define chaves primarias e estrangeiras
- a... Cria indices para otimizacao de queries
- a... Configura triggers para atualizar `updated_at` automaticamente
- a... Habilita RLS (Row Level Security) com politicas de acesso
- a... Cria views uteis para estatisticas

### 2i a Executar a Migracao dos Dados

**Opcao A: Via rotina server-side/transacional (Recomendado)**

1. Faca backup do banco no ambiente correto
2. Execute uma rotina server-side/RPC revisada em ambiente local ou staging
3. Garanta que a rotina rode em transacao e valide admin via `profiles.role = 'admin'`
4. Nao execute deletes/inserts destrutivos a partir do frontend

**Opcao B: Via API legado**

```bash
curl -X POST \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-055bf375/migrar-dados \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"seed": [...dados do seed...]}'
```

### 3i a Verificar a Migracao

**No Supabase Dashboard:**

1. Va em **Table Editor**
2. Verifique a tabela `pessoas`:
   - Deve ter 62 registros
   - Todos com UUIDs gerados automaticamente
3. Verifique a tabela `relacionamentos`:
   - Deve ter centenas de registros (filiacao, conjugal, irmaos)
4. Confirme que os relacionamentos estao corretos

**Na Aplicacao:**

1. Acesse a home `/` para ver a arvore genealogica
2. Navegue entre as pessoas
3. Teste a busca
4. Verifique se as fotos e dados aparecem corretamente
5. Acesse `/pessoa/{id}` de algum membro para ver detalhes

## Y Endpoints da API

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

- `GET /make-server-055bf375/pessoas/:id/arquivos` - Listar de uma pessoa
- `POST /make-server-055bf375/arquivos` - Criar novo
- `PUT /make-server-055bf375/arquivos/:id` - Atualizar
- `DELETE /make-server-055bf375/arquivos/:id` - Deletar

### Migracao

- `POST /make-server-055bf375/migrar-dados` - Executar migracao inicial

## YZ  O Que Foi Implementado

a... **Schema Relacional Completo**
- 3 tabelas normalizadas
- Chaves primarias e estrangeiras
- Indices para performance
- Triggers automaticos

a... **API RESTful Completa**
- CRUD para todas as entidades
- Endpoints especificos para relacionamentos
- Tratamento de erros
- CORS habilitado

a... **Deteccao Automatica de Irmaos**
- Algoritmo que identifica irmaos pelos pais
- Criacao automatica de relacionamentos
- Evita duplicatas

a... **Integracao Frontend**
- dataService atualizado para usar API
- Carregamento assincrono de dados
- Interface de migracao no admin

a... **Seguranca**
- RLS habilitado
- Service role para operacoes de escrita
- Anon key para leitura publica

## as i  Avisos Importantes

1. **Backup**: A migracao apaga todos os dados existentes. Sempre faca backup antes!

2. **UUID vs String**: Os IDs agora sao UUIDs gerados pelo Supabase. O frontend foi atualizado para lidar com isso.

3. **Async/Await**: Todas as operacoes de dados agora sao assincronas. Certifique-se de usar `await` nas chamadas.

4. **Performance**: Para grandes volumes de dados, considere implementar paginacao e cache.

5. **RLS em Producao**: As politicas atuais permitem acesso publico para leitura. Em producao, implemente autenticacao e restrinja adequadamente.

## Ys Proximos Passos (Opcional)

1. **Implementar Paginacao**: Para listas grandes de pessoas
2. **Adicionar Cache**: Redis ou similar para performance
3. **Upload de Fotos**: Integrar com Supabase Storage para uploads reais
4. **Autenticacao**: Implementar login com Supabase Auth
5. **Logs de Auditoria**: Rastrear quem fez o que e quando
6. **Backup Automatico**: Schedule para backups regulares
7. **Search Otimizado**: Implementar full-text search no Postgres

## Y Troubleshooting

### Erro: "relation pessoas does not exist"
**Solucao**: Execute o `database-schema.sql` primeiro no SQL Editor

### Erro: "CORS policy blocked"
**Solucao**: Verifique se o servidor Hono esta rodando e o CORS esta habilitado

### Erro: "Authentication required"
**Solucao**: Verifique se esta usando `publicAnonKey` nos headers

### Dados nao aparecem
**Solucao**:
1. Verifique no Supabase Table Editor se os dados foram criados
2. Abra o Console do navegador e veja os erros
3. Confirme que a migracao foi executada com sucesso

## Ys Documentacao Adicional

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Hono Framework](https://hono.dev/)
- [React Router](https://reactrouter.com/)

---

**Criado por**: Sistema de Arvore Genealogica
**Data**: 2026-04-05
