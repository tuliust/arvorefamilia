# ðŸ—„ï¸ Setup do Banco de Dados no Supabase

## âœ… O que precisa ser criado no Supabase

### 1ï¸âƒ£ **Tabelas**
- âœ… `pessoas` - Membros da famÃ­lia e pets
- âœ… `relacionamentos` - ConexÃµes entre pessoas (pai, mÃ£e, cÃ´njuge, filho, irmÃ£o)
- âœ… `arquivos_historicos` - Fotos e documentos histÃ³ricos

### 2ï¸âƒ£ **FunÃ§Ã£o**
- âœ… `update_updated_at_column()` - Atualiza automaticamente o campo `updated_at`

### 3ï¸âƒ£ **Triggers**
- âœ… `update_pessoas_updated_at` - Atualiza `updated_at` na tabela `pessoas`
- âœ… `update_relacionamentos_updated_at` - Atualiza `updated_at` na tabela `relacionamentos`
- âœ… `update_arquivos_updated_at` - Atualiza `updated_at` na tabela `arquivos_historicos`

### 4ï¸âƒ£ **Ãndices**
- âœ… Ãndices em `pessoas` (nome, tipo, created_at)
- âœ… Ãndices em `relacionamentos` (origem, destino, tipo)
- âœ… Ãndices em `arquivos_historicos` (pessoa_id, ordem)

### 5ï¸âƒ£ **PolÃ­ticas RLS (Row Level Security)**
- âœ… Leitura pÃºblica para todas as tabelas (Ã¡rea pÃºblica do site)
- âœ… Escrita permitida via `service_role` (backend)

### 6ï¸âƒ£ **View (opcional)**
- âœ… `pessoas_com_estatisticas` - EstatÃ­sticas agregadas por pessoa

### 7ï¸âƒ£ **ExtensÃ£o**
- âœ… `uuid-ossp` - Para gerar UUIDs automaticamente

---

## ðŸ“ Como Executar o Setup

### **Passo 1: Acessar o Supabase SQL Editor**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query**

### **Passo 2: Executar o Schema**
1. Abra o arquivo `database-schema.sql` (na raiz do projeto)
2. Copie TODO o conteÃºdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

### **Passo 3: Verificar CriaÃ§Ã£o**
ApÃ³s executar, vocÃª deve ver:
- âœ… 3 tabelas criadas
- âœ… 1 funÃ§Ã£o criada
- âœ… 3 triggers criados
- âœ… 9 Ã­ndices criados
- âœ… 12 polÃ­ticas RLS criadas
- âœ… 1 view criada
- âœ… 1 extensÃ£o habilitada

### **Passo 4: Migrar os Dados**
1. Acesse o painel administrativo: `/admin/login`
2. FaÃ§a login (senha padrÃ£o: `admin123`)
3. VÃ¡ em **Migrar para Banco** ou acesse `/admin/migrar-dados`
4. Clique em **Migrar Dados do Seed para o Banco**
5. Aguarde a conclusÃ£o (62 pessoas + relacionamentos serÃ£o criados)

---

## ðŸ” Como Verificar se EstÃ¡ Funcionando

### **MÃ©todo 1: Via Interface**
1. Acesse `/admin/diagnostico`
2. Verifique as estatÃ­sticas:
   - Total de pessoas cadastradas
   - Total de relacionamentos
   - Total de relacionamentos de irmÃ£os
   - Avisos sobre integridade dos dados

### **MÃ©todo 2: Via Supabase Dashboard**
1. No Supabase, vÃ¡ em **Table Editor**
2. Selecione a tabela `pessoas` - deve ter 62 registros
3. Selecione a tabela `relacionamentos` - deve ter centenas de registros
4. Filtre por `tipo_relacionamento = 'irmao'` - deve ter muitos registros
5. Verifique se os dados estÃ£o corretos

### **MÃ©todo 3: Via SQL (RECOMENDADO para verificar irmÃ£os)**
Execute o arquivo `verificar-irmaos.sql` no SQL Editor do Supabase:
```sql
-- Ver total de relacionamentos por tipo
SELECT tipo_relacionamento, COUNT(*) as total
FROM relacionamentos
GROUP BY tipo_relacionamento;

-- Ver pessoas com seus irmÃ£os
SELECT
  p1.nome_completo as pessoa,
  COUNT(r.id) as total_irmaos,
  STRING_AGG(p2.nome_completo, ', ') as nomes_irmaos
FROM pessoas p1
LEFT JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
LEFT JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
WHERE p1.humano_ou_pet = 'Humano'
GROUP BY p1.id, p1.nome_completo
HAVING COUNT(r.id) > 0
ORDER BY total_irmaos DESC
LIMIT 10;
```

âœ… **Arquivo completo de verificaÃ§Ã£o disponÃ­vel em:** `/verificar-irmaos.sql`

### **MÃ©todo 4: Via SQL BÃ¡sico**
Execute no SQL Editor:
```sql
-- Ver total de pessoas
SELECT COUNT(*) FROM pessoas;

-- Ver total de relacionamentos
SELECT COUNT(*) FROM relacionamentos;

-- Ver estatÃ­sticas por tipo de relacionamento
SELECT tipo_relacionamento, COUNT(*)
FROM relacionamentos
GROUP BY tipo_relacionamento;

-- IMPORTANTE: Verificar se existe relacionamento de irmÃ£os
SELECT COUNT(*) as total_irmaos
FROM relacionamentos
WHERE tipo_relacionamento = 'irmao';
-- Este nÃºmero deve ser > 0 (geralmente centenas)

-- Ver algumas pessoas de exemplo
SELECT id, nome_completo, humano_ou_pet
FROM pessoas
LIMIT 10;
```

---

## âš ï¸ SoluÃ§Ã£o de Problemas

### **Erro: "relation already exists"**
- **Causa:** Tabelas jÃ¡ foram criadas anteriormente
- **SoluÃ§Ã£o:** O script usa `CREATE TABLE IF NOT EXISTS`, entÃ£o Ã© seguro executar novamente

### **Erro: "permission denied"**
- **Causa:** UsuÃ¡rio sem permissÃµes adequadas
- **SoluÃ§Ã£o:** Use o SQL Editor do Supabase (jÃ¡ tem permissÃµes corretas)

### **Erro: "extension uuid-ossp does not exist"**
- **Causa:** ExtensÃ£o nÃ£o instalada
- **SoluÃ§Ã£o:** Execute primeiro: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### **Tabelas criadas mas vazias**
- **Causa:** MigraÃ§Ã£o de dados nÃ£o foi executada
- **SoluÃ§Ã£o:** Acesse `/admin/migrar-dados` e execute a migraÃ§Ã£o

### **Erro na migraÃ§Ã£o: "seed invÃ¡lido"**
- **Causa:** Arquivo seed.ts nÃ£o estÃ¡ acessÃ­vel
- **SoluÃ§Ã£o:** Verifique se o arquivo `/src/app/data/seed.ts` existe

---

## ðŸŽ¯ Checklist Completo

Antes de considerar o setup completo, verifique:

- [ ] ExtensÃ£o `uuid-ossp` habilitada
- [ ] Tabela `pessoas` criada (62 registros apÃ³s migraÃ§Ã£o)
- [ ] Tabela `relacionamentos` criada (centenas de registros apÃ³s migraÃ§Ã£o)
- [ ] Tabela `arquivos_historicos` criada (vazia inicialmente)
- [ ] FunÃ§Ã£o `update_updated_at_column()` criada
- [ ] 3 triggers criados (um para cada tabela)
- [ ] Ãndices criados em todas as tabelas
- [ ] PolÃ­ticas RLS configuradas
- [ ] View `pessoas_com_estatisticas` criada
- [ ] MigraÃ§Ã£o de dados executada com sucesso
- [ ] Ãrvore genealÃ³gica aparecendo na home (`/`)
- [ ] DiagnÃ³stico em `/admin/diagnostico` mostrando dados corretos

---

## ðŸ“š Estrutura das Tabelas

### **Tabela: pessoas**
```
id                  UUID (PK)
nome_completo       VARCHAR(255) NOT NULL
data_nascimento     VARCHAR(50)
local_nascimento    VARCHAR(255)
data_falecimento    VARCHAR(50)
local_falecimento   VARCHAR(255)
local_atual         VARCHAR(255)
foto_principal_url  TEXT
humano_ou_pet       VARCHAR(20) NOT NULL DEFAULT 'Humano'
cor_bg_card         VARCHAR(20)
minibio             TEXT
curiosidades        TEXT
telefone            VARCHAR(20)
endereco            TEXT
rede_social         VARCHAR(500)
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### **Tabela: relacionamentos**
```
id                      UUID (PK)
pessoa_origem_id        UUID (FK -> pessoas.id)
pessoa_destino_id       UUID (FK -> pessoas.id)
tipo_relacionamento     VARCHAR(50) NOT NULL
subtipo_relacionamento  VARCHAR(50)
created_at              TIMESTAMP
updated_at              TIMESTAMP

UNIQUE (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento)
```

### **Tabela: arquivos_historicos**
```
id          UUID (PK)
pessoa_id   UUID (FK -> pessoas.id)
url         TEXT NOT NULL
titulo      VARCHAR(255)
descricao   TEXT
ano         VARCHAR(10)
tipo        VARCHAR(50) DEFAULT 'foto'
ordem       INT DEFAULT 0
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

---

## ðŸš€ PrÃ³ximos Passos

ApÃ³s concluir o setup:

1. âœ… Acesse a home (`/`) para ver a Ã¡rvore genealÃ³gica
2. âœ… Teste a navegaÃ§Ã£o clicando nas pessoas
3. âœ… Acesse o painel admin (`/admin`) para gerenciar dados
4. âœ… Use o diagnÃ³stico (`/admin/diagnostico`) para verificar integridade
5. âœ… Experimente adicionar/editar pessoas e relacionamentos

---

## ðŸ“ž Suporte

Se encontrar problemas:
1. Verifique os logs do servidor Supabase
2. Verifique os logs do navegador (Console do DevTools)
3. Execute o diagnÃ³stico em `/admin/diagnostico`
4. Consulte a documentaÃ§Ã£o do Supabase: https://supabase.com/docs
