> Status: documento historico / obsoleto.
> Local: `docs/historico/documentacao-antiga/`.
> Nao usar como fonte canonica para desenvolvimento atual.
>
> Fonte canonica atual:
>
> ```txt
> docs/README.md
> docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
> docs/arquitetura/ROTAS_E_GUARDS.md
> docs/operacao/MIGRATIONS_SUPABASE.md
> docs/GUIA_CORRECAO_ERROS.md
> ```
>
> Este arquivo foi preservado apenas para rastreabilidade historica. Ele pode citar rotas, scripts SQL, endpoints, senhas, dados de seed, contagens ou fluxos que nao representam mais o estado atual do projeto.

---

## Aviso tecnico atual

Este setup descreve um fluxo antigo baseado em `database-schema.sql`, seed e `/admin/migrar-dados`.

No projeto atual, a fonte principal de schema deve ser:

```txt
supabase/migrations/
docs/operacao/MIGRATIONS_SUPABASE.md
```

Nao aplicar `database-schema.sql` como fonte principal de schema em ambiente novo sem revisar migrations, RLS, RPCs, Storage, backups e estado remoto.

---

# Setup do Banco de Dados no Supabase

## - O que precisa ser criado no Supabase

### 1. **Tabelas**
- - `pessoas` - Membros da familia e pets
- - `relacionamentos` - Conexoes entre pessoas (pai, mae, conjuge, filho, irmao)
- - `arquivos_historicos` - Fotos e documentos historicos

### 2. **Funcao**
- - `update_updated_at_column()` - Atualiza automaticamente o campo `updated_at`

### 3. **Triggers**
- - `update_pessoas_updated_at` - Atualiza `updated_at` na tabela `pessoas`
- - `update_relacionamentos_updated_at` - Atualiza `updated_at` na tabela `relacionamentos`
- - `update_arquivos_updated_at` - Atualiza `updated_at` na tabela `arquivos_historicos`

### 4. **Indices**
- - Indices em `pessoas` (nome, tipo, created_at)
- - Indices em `relacionamentos` (origem, destino, tipo)
- - Indices em `arquivos_historicos` (pessoa_id, ordem)

### 5. **Politicas RLS (Row Level Security)**
- - Leitura publica para todas as tabelas (area publica do site)
- - Escrita permitida via `service_role` (backend)

### 6. **View (opcional)**
- - `pessoas_com_estatisticas` - Estatisticas agregadas por pessoa

### 7. **Extensao**
- - `uuid-ossp` - Para gerar UUIDs automaticamente

---

## Como Executar o Setup

### **Passo 1: Acessar o Supabase SQL Editor**
1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query**

### **Passo 2: Executar o Schema**
1. Abra o arquivo `database-schema.sql` (na raiz do projeto)
2. Copie TODO o conteudo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

### **Passo 3: Verificar Criacao**
Apos executar, voce deve ver:
- - 3 tabelas criadas
- - 1 funcao criada
- - 3 triggers criados
- - 9 indices criados
- - 12 politicas RLS criadas
- - 1 view criada
- - 1 extensao habilitada

### **Passo 4: Migrar os Dados**
1. Acesse o painel administrativo: `/admin/login`
2. Faca login (senha padrao: `admin123`)
3. Va em **Migrar para Banco** ou acesse `/admin/migrar-dados`
4. Clique em **Migrar Dados do Seed para o Banco**
5. Aguarde a conclusao (62 pessoas + relacionamentos serao criados)

---

## Como Verificar se Esta Funcionando

### **Metodo 1: Via Interface**
1. Acesse `/admin/diagnostico`
2. Verifique as estatisticas:
 - Total de pessoas cadastradas
 - Total de relacionamentos
 - Total de relacionamentos de irmaos
 - Avisos sobre integridade dos dados

### **Metodo 2: Via Supabase Dashboard**
1. No Supabase, va em **Table Editor**
2. Selecione a tabela `pessoas` - deve ter 62 registros
3. Selecione a tabela `relacionamentos` - deve ter centenas de registros
4. Filtre por `tipo_relacionamento = 'irmao'` - deve ter muitos registros
5. Verifique se os dados estao corretos

### **Metodo 3: Via SQL (RECOMENDADO para verificar irmaos)**
Execute o arquivo `verificar-irmaos.sql` no SQL Editor do Supabase:
```sql
-- Ver total de relacionamentos por tipo
SELECT tipo_relacionamento, COUNT(*) as total
FROM relacionamentos
GROUP Btipo_relacionamento;

-- Ver pessoas com seus irmaos
SELECT
  p1.nome_completo as pessoa,
  COUNT(r.id) as total_irmaos,
  STRING_AGG(p2.nome_completo, ', ') as nomes_irmaos
FROM pessoas p1
LEFT JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
LEFT JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
WHERE p1.humano_ou_pet = 'Humano'
GROUP Bp1.id, p1.nome_completo
HAVING COUNT(r.id) > 0
ORDER Btotal_irmaos DESC
LIMIT 10;
```

- **Arquivo completo de verificacao disponivel em:** `/verificar-irmaos.sql`

### **Metodo 4: Via SQL Basico**
Execute no SQL Editor:
```sql
-- Ver total de pessoas
SELECT COUNT(*) FROM pessoas;

-- Ver total de relacionamentos
SELECT COUNT(*) FROM relacionamentos;

-- Ver estatisticas por tipo de relacionamento
SELECT tipo_relacionamento, COUNT(*)
FROM relacionamentos
GROUP Btipo_relacionamento;

-- IMPORTANTE: Verificar se existe relacionamento de irmaos
SELECT COUNT(*) as total_irmaos
FROM relacionamentos
WHERE tipo_relacionamento = 'irmao';
-- Este numero deve ser > 0 (geralmente centenas)

-- Ver algumas pessoas de exemplo
SELECT id, nome_completo, humano_ou_pet
FROM pessoas
LIMIT 10;
```

---

## Aviso: Solucao de Problemas

### **Erro: "relation already exists"**
- **Causa:** Tabelas ja foram criadas anteriormente
- **Solucao:** O script usa `CREATE TABLE IF NOT EXISTS`, entao e seguro executar novamente

### **Erro: "permission denied"**
- **Causa:** Usuario sem permissoes adequadas
- **Solucao:** Use o SQL Editor do Supabase (ja tem permissoes corretas)

### **Erro: "extension uuid-ossp does not exist"**
- **Causa:** Extensao nao instalada
- **Solucao:** Execute primeiro: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### **Tabelas criadas mas vazias**
- **Causa:** Migracao de dados nao foi executada
- **Solucao:** Acesse `/admin/migrar-dados` e execute a migracao

### **Erro na migracao: "seed invalido"**
- **Causa:** Arquivo seed.ts nao esta acessivel
- **Solucao:** Verifique se o arquivo `/src/app/data/seed.ts` existe

---

## Checklist Completo

Antes de considerar o setup completo, verifique:

- [ ] Extensao `uuid-ossp` habilitada
- [ ] Tabela `pessoas` criada (62 registros apos migracao)
- [ ] Tabela `relacionamentos` criada (centenas de registros apos migracao)
- [ ] Tabela `arquivos_historicos` criada (vazia inicialmente)
- [ ] Funcao `update_updated_at_column()` criada
- [ ] 3 triggers criados (um para cada tabela)
- [ ] Indices criados em todas as tabelas
- [ ] Politicas RLS configuradas
- [ ] View `pessoas_com_estatisticas` criada
- [ ] Migracao de dados executada com sucesso
- [ ] Arvore genealogica aparecendo na home (`/`)
- [ ] Diagnostico em `/admin/diagnostico` mostrando dados corretos

---

## Estrutura das Tabelas

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

## Proximos Passos

Apos concluir o setup:

1. - Acesse a home (`/`) para ver a arvore genealogica
2. - Teste a navegacao clicando nas pessoas
3. - Acesse o painel admin (`/admin`) para gerenciar dados
4. - Use o diagnostico (`/admin/diagnostico`) para verificar integridade
5. - Experimente adicionar/editar pessoas e relacionamentos

---

## Suporte

Se encontrar problemas:
1. Verifique os logs do servidor Supabase
2. Verifique os logs do navegador (Console do DevTools)
3. Execute o diagnostico em `/admin/diagnostico`
4. Consulte a documentacao do Supabase: https://supabase.com/docs
