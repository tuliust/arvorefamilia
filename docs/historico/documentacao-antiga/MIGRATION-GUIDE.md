# ðŸŒ³ Guia de MigraÃ§Ã£o para Banco de Dados Supabase

## ðŸ“‹ VisÃ£o Geral

Este guia explica como migrar os dados da Ã¡rvore genealÃ³gica do armazenamento em memÃ³ria para o banco de dados PostgreSQL do Supabase.

## ðŸ—ï¸ Arquitetura do Banco de Dados

### Tabelas Criadas:

1. **`pessoas`** - Armazena informaÃ§Ãµes sobre membros da famÃ­lia e pets
   - Campos: id, nome_completo, data_nascimento, local_nascimento, foto_principal_url, etc.
   - Chave primÃ¡ria: UUID gerado automaticamente

2. **`relacionamentos`** - Define as conexÃµes entre pessoas
   - Campos: id, pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento
   - Chaves estrangeiras: pessoa_origem_id â†’ pessoas.id, pessoa_destino_id â†’ pessoas.id
   - Tipos: pai, mae, filho, conjuge, irmao

3. **`arquivos_historicos`** - Fotos e documentos histÃ³ricos
   - Campos: id, pessoa_id, url, titulo, descricao, ano, tipo
   - Chave estrangeira: pessoa_id â†’ pessoas.id

### Relacionamentos entre Tabelas:

```
pessoas (1) â”€â”€â”€ (N) relacionamentos
pessoas (1) â”€â”€â”€ (N) arquivos_historicos
```

## ðŸ“ Passo a Passo da MigraÃ§Ã£o

### 1ï¸âƒ£ Executar o Schema SQL

1. Acesse o **Supabase Dashboard**
2. VÃ¡ em **SQL Editor**
3. Clique em **New Query**
4. Abra o arquivo `/database-schema.sql` deste projeto
5. **Copie todo o conteÃºdo** e cole no SQL Editor
6. Clique em **Run** para executar

**O que esse script faz:**
- âœ… Cria as 3 tabelas com todos os campos e tipos corretos
- âœ… Define chaves primÃ¡rias e estrangeiras
- âœ… Cria Ã­ndices para otimizaÃ§Ã£o de queries
- âœ… Configura triggers para atualizar `updated_at` automaticamente
- âœ… Habilita RLS (Row Level Security) com polÃ­ticas de acesso
- âœ… Cria views Ãºteis para estatÃ­sticas

### 2ï¸âƒ£ Executar a MigraÃ§Ã£o dos Dados

**OpÃ§Ã£o A: Via rotina server-side/transacional (Recomendado)**

1. FaÃ§a backup do banco no ambiente correto
2. Execute uma rotina server-side/RPC revisada em ambiente local ou staging
3. Garanta que a rotina rode em transaÃ§Ã£o e valide admin via `profiles.role = 'admin'`
4. NÃ£o execute deletes/inserts destrutivos a partir do frontend

**OpÃ§Ã£o B: Via API legado**

```bash
curl -X POST \
  https://{PROJECT_ID}.supabase.co/functions/v1/make-server-055bf375/migrar-dados \
  -H "Authorization: Bearer {ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"seed": [...dados do seed...]}'
```

### 3ï¸âƒ£ Verificar a MigraÃ§Ã£o

**No Supabase Dashboard:**

1. VÃ¡ em **Table Editor**
2. Verifique a tabela `pessoas`:
   - Deve ter 62 registros
   - Todos com UUIDs gerados automaticamente
3. Verifique a tabela `relacionamentos`:
   - Deve ter centenas de registros (filiaÃ§Ã£o, conjugal, irmÃ£os)
4. Confirme que os relacionamentos estÃ£o corretos

**Na AplicaÃ§Ã£o:**

1. Acesse a home `/` para ver a Ã¡rvore genealÃ³gica
2. Navegue entre as pessoas
3. Teste a busca
4. Verifique se as fotos e dados aparecem corretamente
5. Acesse `/pessoa/{id}` de algum membro para ver detalhes

## ðŸ”§ Endpoints da API

O servidor Hono expÃµe os seguintes endpoints:

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

### Arquivos HistÃ³ricos

- `GET /make-server-055bf375/pessoas/:id/arquivos` - Listar de uma pessoa
- `POST /make-server-055bf375/arquivos` - Criar novo
- `PUT /make-server-055bf375/arquivos/:id` - Atualizar
- `DELETE /make-server-055bf375/arquivos/:id` - Deletar

### MigraÃ§Ã£o

- `POST /make-server-055bf375/migrar-dados` - Executar migraÃ§Ã£o inicial

## ðŸŽ¯ O Que Foi Implementado

âœ… **Schema Relacional Completo**
- 3 tabelas normalizadas
- Chaves primÃ¡rias e estrangeiras
- Ãndices para performance
- Triggers automÃ¡ticos

âœ… **API RESTful Completa**
- CRUD para todas as entidades
- Endpoints especÃ­ficos para relacionamentos
- Tratamento de erros
- CORS habilitado

âœ… **DetecÃ§Ã£o AutomÃ¡tica de IrmÃ£os**
- Algoritmo que identifica irmÃ£os pelos pais
- CriaÃ§Ã£o automÃ¡tica de relacionamentos
- Evita duplicatas

âœ… **IntegraÃ§Ã£o Frontend**
- dataService atualizado para usar API
- Carregamento assÃ­ncrono de dados
- Interface de migraÃ§Ã£o no admin

âœ… **SeguranÃ§a**
- RLS habilitado
- Service role para operaÃ§Ãµes de escrita
- Anon key para leitura pÃºblica

## âš ï¸ Avisos Importantes

1. **Backup**: A migraÃ§Ã£o apaga todos os dados existentes. Sempre faÃ§a backup antes!

2. **UUID vs String**: Os IDs agora sÃ£o UUIDs gerados pelo Supabase. O frontend foi atualizado para lidar com isso.

3. **Async/Await**: Todas as operaÃ§Ãµes de dados agora sÃ£o assÃ­ncronas. Certifique-se de usar `await` nas chamadas.

4. **Performance**: Para grandes volumes de dados, considere implementar paginaÃ§Ã£o e cache.

5. **RLS em ProduÃ§Ã£o**: As polÃ­ticas atuais permitem acesso pÃºblico para leitura. Em produÃ§Ã£o, implemente autenticaÃ§Ã£o e restrinja adequadamente.

## ðŸš€ PrÃ³ximos Passos (Opcional)

1. **Implementar PaginaÃ§Ã£o**: Para listas grandes de pessoas
2. **Adicionar Cache**: Redis ou similar para performance
3. **Upload de Fotos**: Integrar com Supabase Storage para uploads reais
4. **AutenticaÃ§Ã£o**: Implementar login com Supabase Auth
5. **Logs de Auditoria**: Rastrear quem fez o quÃª e quando
6. **Backup AutomÃ¡tico**: Schedule para backups regulares
7. **Search Otimizado**: Implementar full-text search no Postgres

## ðŸ› Troubleshooting

### Erro: "relation pessoas does not exist"
**SoluÃ§Ã£o**: Execute o `database-schema.sql` primeiro no SQL Editor

### Erro: "CORS policy blocked"
**SoluÃ§Ã£o**: Verifique se o servidor Hono estÃ¡ rodando e o CORS estÃ¡ habilitado

### Erro: "Authentication required"
**SoluÃ§Ã£o**: Verifique se estÃ¡ usando `publicAnonKey` nos headers

### Dados nÃ£o aparecem
**SoluÃ§Ã£o**:
1. Verifique no Supabase Table Editor se os dados foram criados
2. Abra o Console do navegador e veja os erros
3. Confirme que a migraÃ§Ã£o foi executada com sucesso

## ðŸ“š DocumentaÃ§Ã£o Adicional

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Hono Framework](https://hono.dev/)
- [React Router](https://reactrouter.com/)

---

**Criado por**: Sistema de Ãrvore GenealÃ³gica
**Data**: 2026-04-05
