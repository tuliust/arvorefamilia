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
> docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
> docs/funcionalidades/MINHA_ARVORE_VIEW.md
> docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
> docs/operacao/MIGRATIONS_SUPABASE.md
> ```
>
> Este arquivo foi preservado apenas para rastreabilidade historica. Ele pode citar rotas, scripts SQL, endpoints, dados de seed, senhas, numeros de registros ou fluxos que nao representam mais o estado atual do projeto.

---

## Aviso tecnico atual

Este documento registra um erro de dados identificado em diagnostico antigo. Os nomes, contagens e solucoes SQL aqui descritos nao devem ser aplicados automaticamente no banco atual.

Para diagnostico corrente, consultar:

```txt
docs/GUIA_CORRECAO_ERROS.md
docs/historico/QA_FINAL_MVP.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

Qualquer correcao de dados deve ser validada no ambiente atual antes de executar SQL manual.

---

# Aviso: ERROS ENCONTRADOS E COMO CORRIGIR

**Data:** 05/04/2026
**Sistema:** Arvore Genealogica
**Banco:** Supabase PostgreSQL

---

## RESUMO DE ERROS

| # | Tipo | Severidade | Descricao | Status |
|---|------|------------|-----------|--------|
| 1 | Dados | YBAIXA | Pessoa sem relacionamentos | Aviso: Requer atencao |

**Total de erros:** 1
**Erros criticos:** 0
**Erros de media severidade:** 0
**Erros de baixa severidade:** 1

---

## a ERRO #1: Pessoa Isolada no Grafo

### **Descricao**
A pessoa **"Glauce Thais Barros"** esta cadastrada no banco de dados mas nao possui nenhum relacionamento (pai, mae, conjuge, filho ou irmao).

### **Detalhes Tecnicos**
- **Tabela afetada:** `pessoas`
- **ID da pessoa:** (UUID no banco)
- **Nome completo:** Glauce Thais Barros
- **Tipo:** Humano
- **Total de relacionamentos:** 0

### **Impacto**
- Y**BAIXO:** Nao afeta funcionamento do sistema
- Esta pessoa nao aparecera na arvore genealogica visual
- Nao causa erros na aplicacao
- Pode confundir usuarios se esperarem ver esta pessoa

### **Como Detectado**
```sql
SELECT
 p.nome_completo,
 p.humano_ou_pet,
 COUNT(r.id) as total_relacionamentos
FROM pessoas p
LEFT JOIN relacionamentos r ON (r.pessoa_origem_id = p.id OR r.pessoa_destino_id = p.id)
GROUP Bp.id, p.nome_completo, p.humano_ou_pet
HAVING COUNT(r.id) = 0;
```

**Resultado:**
```
| nome_completo    | humano_ou_pet | total_relacionamentos |
| ------------------- | ------------- | --------------------- |
| Glauce Thais Barros | Humano    | 0           |
```

---

## SOLUCAES PROPOSTAS

### **Solucao 1: Adicionar Relacionamentos (RECOMENDADO)**

Se Glauce Thais Barros e membro da familia, adicione seus relacionamentos.

#### **Passo 1: Investigar quem e esta pessoa**

```sql
-- Ver informacoes completas
SELECT * FROM pessoas WHERE nome_completo = 'Glauce Thais Barros';
```

#### **Passo 2: Identificar relacionamentos corretos**

Perguntas a responder:
- Quem sao os pais dela
- Ela tem conjuge
- Ela tem filhos
- Ela tem irmaos

#### **Passo 3: Adicionar relacionamentos via SQL**

**Exemplo 1: Adicionar pais**
```sql
-- Supondo que os pais sejam conhecidos
-- Substitua os UUIDs pelos IDs corretos

-- Relacionamento com pai
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES (
 (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros'),
 (SELECT id FROM pessoas WHERE nome_completo = 'Nome do Pai'),
 'pai',
 'sangue'
);

-- Relacionamento com mae
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES (
 (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros'),
 (SELECT id FROM pessoas WHERE nome_completo = 'Nome da Mae'),
 'mae',
 'sangue'
);
```

**Exemplo 2: Adicionar conjuge**
```sql
-- Relacionamento de casamento (bidirecional)
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES
 (
  (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros'),
  (SELECT id FROM pessoas WHERE nome_completo = 'Nome do Conjuge'),
  'conjuge',
  'casamento'
 ),
 (
  (SELECT id FROM pessoas WHERE nome_completo = 'Nome do Conjuge'),
  (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros'),
  'conjuge',
  'casamento'
 );
```

**Exemplo 3: Adicionar filhos**
```sql
-- Relacionamento de filiacao
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES (
 (SELECT id FROM pessoas WHERE nome_completo = 'Nome do Filho'),
 (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros'),
 'mae',
 'sangue'
);
```

#### **Passo 4: Re-executar deteccao de irmaos**

Apos adicionar relacionamentos de pai/mae, os irmaos serao detectados automaticamente:

1. Acesse `/admin/migrar-dados`
2. Clique em **"Migrar Dados do Seed para o Banco"**
3. Aguarde conclusao

Ou execute manualmente:
```sql
-- Detectar e criar irmaos automaticamente
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

Se esta pessoa deve estar na arvore, atualize o arquivo `/src/app/data/seed.ts`:

```typescript
// Adicionar no array de pessoas
{
 id: 'uuid-glauce',
 nomeCompleto: 'Glauce Thais Barros',
 dataNascimento: '01/01/1980', // data correta
 localNascimento: 'Cidade, Estado',
 localAtual: 'Cidade atual',
 fotoPrincipalUrl: 'https://...',
 humanouPet: 'Humano' as TipoEntidade,
 corBgCard: '#e0f2fe',
 minibio: 'Biografi-',
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

### **Solucao 2: Remover Pessoa (SE NAO PERTENCE A FAMILIA)**

Se esta pessoa foi cadastrada por engano ou nao deve estar na arvore:

#### **Passo 1: Backup antes de deletar**
```sql
-- Fazer backup dos dados
SELECT * FROM pessoas WHERE nome_completo = 'Glauce Thais Barros';
```

#### **Passo 2: Deletar do banco**
```sql
-- Deletar pessoa (relacionamentos sao deletados automaticamente por CASCADE)
DELETE FROM pessoas WHERE nome_completo = 'Glauce Thais Barros';
```

#### **Passo 3: Remover do seed.ts**

Abra `/src/app/data/seed.ts` e remova:
- O objeto da pessoa no array `pessoas`
- Todos relacionamentos que referenciam esta pessoa

#### **Passo 4: Re-executar migracao**

1. Acesse `/admin/migrar-dados`
2. Clique em **"Migrar Dados do Seed para o Banco"**
3. Verifique que a pessoa nao aparece mais

---

### **Solucao 3: Adicionar via Interface Admin (MAIS FACIL)**

Use o painel administrativo para adicionar relacionamentos:

#### **Passo 1: Acessar painel admin**
1. Acesse `/admin/login`
2. Login: (credenciais configuradas)
3. Senha: `admin123` (ou conforme configurado)

#### **Passo 2: Editar pessoa**
1. Va em "Gerenciar Pessoas"
2. Procure "Glauce Thais Barros"
3. Clique em "Editar"

#### **Passo 3: Adicionar relacionamentos**
1. Na secao "Relacionamentos"
2. Adicione pais, conjuge, filhos conforme necessario
3. Salve as alteracoes

#### **Passo 4: Re-executar deteccao de irmaos**
1. Va em "Migrar para Banco"
2. Clique em "Migrar Dados" para recalcular irmaos

---

## CHECKLIST DE CORRECAO

### **Antes de Corrigir**
- [ ] Identifiquei se a pessoa deve estar na arvore
- [ ] Descobri quem sao os pais dela
- [ ] Verifiquei se ela tem conjuge
- [ ] Verifiquei se ela tem filhos
- [ ] Fiz backup dos dados atuais

### **Durante a Correcao**
- [ ] Executei as queries SQL corretamente
- [ ] Adicionei relacionamentos bidirecionais (conjuge)
- [ ] Atualizei o seed.ts se necessario
- [ ] Testei as queries antes de executar

### **Apos Correcao**
- [ ] Verifiquei que a pessoa tem relacionamentos
- [ ] Executei diagnostico novamente
- [ ] Verifiquei na arvore visual
- [ ] Irmaos foram detectados automaticamente
- [ ] Sistema esta funcionando normalmente

---

## TESTES DE VALIDACAO

Apos corrigir, execute estes testes:

### **Teste 1: Pessoa tem relacionamentos**
```sql
SELECT COUNT(*) as total_relacionamentos
FROM relacionamentos
WHERE pessoa_origem_id = (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros')
  OR pessoa_destino_id = (SELECT id FROM pessoas WHERE nome_completo = 'Glauce Thais Barros');
```
**Esperado:** > 0

### **Teste 2: Pessoa aparece na lista de irmaos**
```sql
SELECT
 p1.nome_completo as pessoa,
 COUNT(r.id) as total_irmaos,
 STRING_AGG(p2.nome_completo, ', ') as nomes_irmaos
FROM pessoas p1
LEFT JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
LEFT JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
WHERE p1.nome_completo = 'Glauce Thais Barros'
GROUP Bp1.id, p1.nome_completo;
```
**Esperado:** Lista de irmaos ou 0 se for filho unico

### **Teste 3: Nenhuma pessoa isolada**
```sql
SELECT COUNT(*) as total_pessoas_isoladas
FROM pessoas p
LEFT JOIN relacionamentos r ON (r.pessoa_origem_id = p.id OR r.pessoa_destino_id = p.id)
GROUP Bp.id
HAVING COUNT(r.id) = 0;
```
**Esperado:** 0

### **Teste 4: Diagnostico completo**
Execute `/diagnostico-rapido.sql` no Supabase SQL Editor.

**Esperado:** Todos 5 testes devem PASSAR -

---

## IMPACTO DA CORRECAO

### **Antes da Correcao**
- Total de pessoas: 56
- Pessoas isoladas: 1
- Pessoas com irmaos: 29

### **Depois da Correcao (Estimado)**

**Se adicionar relacionamentos:**
- Total de pessoas: 56
- Pessoas isoladas: 0 -
- Pessoas com irmaos: 29-30 (depende dos irmaos)
- Novos relacionamentos: +2 a +10 (pais, conjuge, filhos, irmaos)

**Se remover pessoa:**
- Total de pessoas: 55
- Pessoas isoladas: 0 -
- Pessoas com irmaos: 29
- Relacionamentos deletados: 0 (pessoa ja estava isolada)

---

## RECOMENDACAO FINAL

### **Opcao Recomendada: Adicionar Relacionamentos**

**Por que**
- Preserva os dados
- Mantem a integridade historica
- Permite rastreabilidade
- Mais facil de reverter se necessario

**Como fazer:**
1. Use a **Solucao 1** (Adicionar Relacionamentos)
2. Comece pelo metodo mais facil (Interface Admin)
3. Se nao funcionar, use SQL direto
4. Sempre atualize o seed.ts depois

### **Quando remover:**
- Se a pessoa foi cadastrada por engano
- Se nao pertence a familia
- Se e um teste/exemplo que deve ser removido

---

## SUPORTE

Se encontrar dificuldades:

1. **Verifique os logs:**
 - Console do navegador (F12)
 - Logs do Supabase
 - Erros SQL

2. **Execute diagnosticos:**
 - `/diagnostico-rapido.sql`
 - `/verificar-irmaos.sql`
 - `/admin/diagnostico`

3. **Consulte documentacao:**
 - `/RELATORIO-DIAGNOSTICO-COMPLETO.md`
 - `/COMO-FUNCIONA-IRMAOS.md`
 - `/SETUP-BANCO-DADOS.md`

4. **Restaure backup:**
 - Re-execute migracao em `/admin/migrar-dados`
 - Todos dados serao recriados do seed.ts

---

## - CONCLUSAO

**Erro encontrado:** 1 pessoa isolada (baixa severidade)
**Impacto:** Minimo, nao afeta funcionamento
**Solucao:** Simples, pode ser corrigida em minutos
**Prioridade:** Media (corrigir quando possivel)

**Sistema esta 99% funcional!** -

Este e um problema de dados, nao de codigo. O sistema de irmaos esta funcionando perfeitamente.

---

**Documento criado em:** 05/04/2026
**Ultima atualizacao:** 05/04/2026
**Status:** - Documentado e com solucoes prontas
