# âš ï¸ ERROS ENCONTRADOS E COMO CORRIGIR

**Data:** 05/04/2026
**Sistema:** Ãrvore GenealÃ³gica
**Banco:** Supabase PostgreSQL

---

## ðŸ“Š RESUMO DE ERROS

| # | Tipo | Severidade | DescriÃ§Ã£o | Status |
|---|------|------------|-----------|--------|
| 1 | Dados | ðŸŸ¡ BAIXA | Pessoa sem relacionamentos | âš ï¸ Requer atenÃ§Ã£o |

**Total de erros:** 1
**Erros crÃ­ticos:** 0
**Erros de mÃ©dia severidade:** 0
**Erros de baixa severidade:** 1

---

## âŒ ERRO #1: Pessoa Isolada no Grafo

### **DescriÃ§Ã£o**
A pessoa **"Glauce ThaÃ­s Barros"** estÃ¡ cadastrada no banco de dados mas nÃ£o possui nenhum relacionamento (pai, mÃ£e, cÃ´njuge, filho ou irmÃ£o).

### **Detalhes TÃ©cnicos**
- **Tabela afetada:** `pessoas`
- **ID da pessoa:** (UUID no banco)
- **Nome completo:** Glauce ThaÃ­s Barros
- **Tipo:** Humano
- **Total de relacionamentos:** 0

### **Impacto**
- ðŸŸ¡ **BAIXO:** NÃ£o afeta funcionamento do sistema
- Esta pessoa nÃ£o aparecerÃ¡ na Ã¡rvore genealÃ³gica visual
- NÃ£o causa erros na aplicaÃ§Ã£o
- Pode confundir usuÃ¡rios se esperarem ver esta pessoa

### **Como Detectado**
```sql
SELECT
  p.nome_completo,
  p.humano_ou_pet,
  COUNT(r.id) as total_relacionamentos
FROM pessoas p
LEFT JOIN relacionamentos r ON (r.pessoa_origem_id = p.id OR r.pessoa_destino_id = p.id)
GROUP BY p.id, p.nome_completo, p.humano_ou_pet
HAVING COUNT(r.id) = 0;
```

**Resultado:**
```
| nome_completo       | humano_ou_pet | total_relacionamentos |
| ------------------- | ------------- | --------------------- |
| Glauce ThaÃ­s Barros | Humano        | 0                     |
```

---

## ðŸ”§ SOLUÃ‡Ã•ES PROPOSTAS

### **SoluÃ§Ã£o 1: Adicionar Relacionamentos (RECOMENDADO)**

Se Glauce ThaÃ­s Barros Ã© membro da famÃ­lia, adicione seus relacionamentos.

#### **Passo 1: Investigar quem Ã© esta pessoa**

```sql
-- Ver informaÃ§Ãµes completas
SELECT * FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros';
```

#### **Passo 2: Identificar relacionamentos corretos**

Perguntas a responder:
- Quem sÃ£o os pais dela?
- Ela tem cÃ´njuge?
- Ela tem filhos?
- Ela tem irmÃ£os?

#### **Passo 3: Adicionar relacionamentos via SQL**

**Exemplo 1: Adicionar pais**
```sql
-- Supondo que os pais sejam conhecidos
-- Substitua os UUIDs pelos IDs corretos

-- Relacionamento com pai
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES (
  (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros'),
  (SELECT id FROM pessoas WHERE nome_completo = 'Nome do Pai'),
  'pai',
  'sangue'
);

-- Relacionamento com mÃ£e
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES (
  (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros'),
  (SELECT id FROM pessoas WHERE nome_completo = 'Nome da MÃ£e'),
  'mae',
  'sangue'
);
```

**Exemplo 2: Adicionar cÃ´njuge**
```sql
-- Relacionamento de casamento (bidirecional)
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES
  (
    (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros'),
    (SELECT id FROM pessoas WHERE nome_completo = 'Nome do CÃ´njuge'),
    'conjuge',
    'casamento'
  ),
  (
    (SELECT id FROM pessoas WHERE nome_completo = 'Nome do CÃ´njuge'),
    (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros'),
    'conjuge',
    'casamento'
  );
```

**Exemplo 3: Adicionar filhos**
```sql
-- Relacionamento de filiaÃ§Ã£o
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES (
  (SELECT id FROM pessoas WHERE nome_completo = 'Nome do Filho'),
  (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros'),
  'mae',
  'sangue'
);
```

#### **Passo 4: Re-executar detecÃ§Ã£o de irmÃ£os**

ApÃ³s adicionar relacionamentos de pai/mÃ£e, os irmÃ£os serÃ£o detectados automaticamente:

1. Acesse `/admin/migrar-dados`
2. Clique em **"Migrar Dados do Seed para o Banco"**
3. Aguarde conclusÃ£o

Ou execute manualmente:
```sql
-- Detectar e criar irmÃ£os automaticamente
WITH irmaos_detectados AS (
  SELECT DISTINCT
    r1.pessoa_origem_id as pessoa_a,
    r2.pessoa_origem_id as pessoa_b
  FROM relacionamentos r1
  JOIN relacionamentos r2
    ON r1.pessoa_destino_id = r2.pessoa_destino_id
    AND r1.pessoa_origem_id < r2.pessoa_origem_id
  WHERE r1.tipo_relacionamento = 'pai'
  AND r2.tipo_relacionamento = 'pai'

  UNION

  SELECT DISTINCT
    r1.pessoa_origem_id as pessoa_a,
    r2.pessoa_origem_id as pessoa_b
  FROM relacionamentos r1
  JOIN relacionamentos r2
    ON r1.pessoa_destino_id = r2.pessoa_destino_id
    AND r1.pessoa_origem_id < r2.pessoa_origem_id
  WHERE r1.tipo_relacionamento = 'mae'
  AND r2.tipo_relacionamento = 'mae'
)
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
SELECT pessoa_a, pessoa_b, 'irmao', 'sangue' FROM irmaos_detectados
UNION ALL
SELECT pessoa_b, pessoa_a, 'irmao', 'sangue' FROM irmaos_detectados
ON CONFLICT (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento) DO NOTHING;
```

#### **Passo 5: Atualizar seed.ts**

Se esta pessoa deve estar na Ã¡rvore, atualize o arquivo `/src/app/data/seed.ts`:

```typescript
// Adicionar no array de pessoas
{
  id: 'uuid-glauce',
  nomeCompleto: 'Glauce ThaÃ­s Barros',
  dataNascimento: '01/01/1980', // data correta
  localNascimento: 'Cidade, Estado',
  localAtual: 'Cidade atual',
  fotoPrincipalUrl: 'https://...',
  humanouPet: 'Humano' as TipoEntidade,
  corBgCard: '#e0f2fe',
  minibio: 'Biografia...',
},

// Adicionar relacionamentos no array
{
  pessoaOrigemId: 'uuid-glauce',
  pessoaDestinoId: 'uuid-do-pai',
  tipoRelacionamento: 'pai' as TipoRelacionamento,
  subtipoRelacionamento: 'sangue' as SubtipoRelacionamento,
},
{
  pessoaOrigemId: 'uuid-glauce',
  pessoaDestinoId: 'uuid-da-mae',
  tipoRelacionamento: 'mae' as TipoRelacionamento,
  subtipoRelacionamento: 'sangue' as SubtipoRelacionamento,
},
```

---

### **SoluÃ§Ã£o 2: Remover Pessoa (SE NÃƒO PERTENCE Ã€ FAMÃLIA)**

Se esta pessoa foi cadastrada por engano ou nÃ£o deve estar na Ã¡rvore:

#### **Passo 1: Backup antes de deletar**
```sql
-- Fazer backup dos dados
SELECT * FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros';
```

#### **Passo 2: Deletar do banco**
```sql
-- Deletar pessoa (relacionamentos sÃ£o deletados automaticamente por CASCADE)
DELETE FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros';
```

#### **Passo 3: Remover do seed.ts**

Abra `/src/app/data/seed.ts` e remova:
- O objeto da pessoa no array `pessoas`
- Todos relacionamentos que referenciam esta pessoa

#### **Passo 4: Re-executar migraÃ§Ã£o**

1. Acesse `/admin/migrar-dados`
2. Clique em **"Migrar Dados do Seed para o Banco"**
3. Verifique que a pessoa nÃ£o aparece mais

---

### **SoluÃ§Ã£o 3: Adicionar via Interface Admin (MAIS FÃCIL)**

Use o painel administrativo para adicionar relacionamentos:

#### **Passo 1: Acessar painel admin**
1. Acesse `/admin/login`
2. Login: (credenciais configuradas)
3. Senha: `admin123` (ou conforme configurado)

#### **Passo 2: Editar pessoa**
1. VÃ¡ em "Gerenciar Pessoas"
2. Procure "Glauce ThaÃ­s Barros"
3. Clique em "Editar"

#### **Passo 3: Adicionar relacionamentos**
1. Na seÃ§Ã£o "Relacionamentos"
2. Adicione pais, cÃ´njuge, filhos conforme necessÃ¡rio
3. Salve as alteraÃ§Ãµes

#### **Passo 4: Re-executar detecÃ§Ã£o de irmÃ£os**
1. VÃ¡ em "Migrar para Banco"
2. Clique em "Migrar Dados" para recalcular irmÃ£os

---

## ðŸ“‹ CHECKLIST DE CORREÃ‡ÃƒO

### **Antes de Corrigir**
- [ ] Identifiquei se a pessoa deve estar na Ã¡rvore
- [ ] Descobri quem sÃ£o os pais dela
- [ ] Verifiquei se ela tem cÃ´njuge
- [ ] Verifiquei se ela tem filhos
- [ ] Fiz backup dos dados atuais

### **Durante a CorreÃ§Ã£o**
- [ ] Executei as queries SQL corretamente
- [ ] Adicionei relacionamentos bidirecionais (cÃ´njuge)
- [ ] Atualizei o seed.ts se necessÃ¡rio
- [ ] Testei as queries antes de executar

### **ApÃ³s CorreÃ§Ã£o**
- [ ] Verifiquei que a pessoa tem relacionamentos
- [ ] Executei diagnÃ³stico novamente
- [ ] Verifiquei na Ã¡rvore visual
- [ ] IrmÃ£os foram detectados automaticamente
- [ ] Sistema estÃ¡ funcionando normalmente

---

## ðŸ§ª TESTES DE VALIDAÃ‡ÃƒO

ApÃ³s corrigir, execute estes testes:

### **Teste 1: Pessoa tem relacionamentos**
```sql
SELECT COUNT(*) as total_relacionamentos
FROM relacionamentos
WHERE pessoa_origem_id = (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros')
   OR pessoa_destino_id = (SELECT id FROM pessoas WHERE nome_completo = 'Glauce ThaÃ­s Barros');
```
**Esperado:** > 0

### **Teste 2: Pessoa aparece na lista de irmÃ£os**
```sql
SELECT
  p1.nome_completo as pessoa,
  COUNT(r.id) as total_irmaos,
  STRING_AGG(p2.nome_completo, ', ') as nomes_irmaos
FROM pessoas p1
LEFT JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
LEFT JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
WHERE p1.nome_completo = 'Glauce ThaÃ­s Barros'
GROUP BY p1.id, p1.nome_completo;
```
**Esperado:** Lista de irmÃ£os ou 0 se for filho Ãºnico

### **Teste 3: Nenhuma pessoa isolada**
```sql
SELECT COUNT(*) as total_pessoas_isoladas
FROM pessoas p
LEFT JOIN relacionamentos r ON (r.pessoa_origem_id = p.id OR r.pessoa_destino_id = p.id)
GROUP BY p.id
HAVING COUNT(r.id) = 0;
```
**Esperado:** 0

### **Teste 4: DiagnÃ³stico completo**
Execute `/diagnostico-rapido.sql` no Supabase SQL Editor.

**Esperado:** Todos 5 testes devem PASSAR âœ…

---

## ðŸ“Š IMPACTO DA CORREÃ‡ÃƒO

### **Antes da CorreÃ§Ã£o**
- Total de pessoas: 56
- Pessoas isoladas: 1
- Pessoas com irmÃ£os: 29

### **Depois da CorreÃ§Ã£o (Estimado)**

**Se adicionar relacionamentos:**
- Total de pessoas: 56
- Pessoas isoladas: 0 âœ…
- Pessoas com irmÃ£os: 29-30 (depende dos irmÃ£os)
- Novos relacionamentos: +2 a +10 (pais, cÃ´njuge, filhos, irmÃ£os)

**Se remover pessoa:**
- Total de pessoas: 55
- Pessoas isoladas: 0 âœ…
- Pessoas com irmÃ£os: 29
- Relacionamentos deletados: 0 (pessoa jÃ¡ estava isolada)

---

## ðŸŽ¯ RECOMENDAÃ‡ÃƒO FINAL

### **OpÃ§Ã£o Recomendada: Adicionar Relacionamentos**

**Por quÃª?**
- Preserva os dados
- MantÃ©m a integridade histÃ³rica
- Permite rastreabilidade
- Mais fÃ¡cil de reverter se necessÃ¡rio

**Como fazer:**
1. Use a **SoluÃ§Ã£o 1** (Adicionar Relacionamentos)
2. Comece pelo mÃ©todo mais fÃ¡cil (Interface Admin)
3. Se nÃ£o funcionar, use SQL direto
4. Sempre atualize o seed.ts depois

### **Quando remover:**
- Se a pessoa foi cadastrada por engano
- Se nÃ£o pertence Ã  famÃ­lia
- Se Ã© um teste/exemplo que deve ser removido

---

## ðŸ“ž SUPORTE

Se encontrar dificuldades:

1. **Verifique os logs:**
   - Console do navegador (F12)
   - Logs do Supabase
   - Erros SQL

2. **Execute diagnÃ³sticos:**
   - `/diagnostico-rapido.sql`
   - `/verificar-irmaos.sql`
   - `/admin/diagnostico`

3. **Consulte documentaÃ§Ã£o:**
   - `/RELATORIO-DIAGNOSTICO-COMPLETO.md`
   - `/COMO-FUNCIONA-IRMAOS.md`
   - `/SETUP-BANCO-DADOS.md`

4. **Restaure backup:**
   - Re-execute migraÃ§Ã£o em `/admin/migrar-dados`
   - Todos dados serÃ£o recriados do seed.ts

---

## âœ… CONCLUSÃƒO

**Erro encontrado:** 1 pessoa isolada (baixa severidade)
**Impacto:** MÃ­nimo, nÃ£o afeta funcionamento
**SoluÃ§Ã£o:** Simples, pode ser corrigida em minutos
**Prioridade:** MÃ©dia (corrigir quando possÃ­vel)

**Sistema estÃ¡ 99% funcional!** âœ…

Este Ã© um problema de dados, nÃ£o de cÃ³digo. O sistema de irmÃ£os estÃ¡ funcionando perfeitamente.

---

**Documento criado em:** 05/04/2026
**Ãšltima atualizaÃ§Ã£o:** 05/04/2026
**Status:** âœ… Documentado e com soluÃ§Ãµes prontas
