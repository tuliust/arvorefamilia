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

Este documento descreve uma logica historica de deteccao/criacao automatica de relacionamentos de irmaos durante migracao de dados.

Antes de reutilizar qualquer SQL, endpoint ou rotina descrita aqui, conferir o estado atual em:

```txt
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/operacao/MIGRATIONS_SUPABASE.md
supabase/migrations/
```

Nao executar `/admin/migrar-dados` nem SQL destrutivo em ambiente atual sem backup, revisao de migrations e autorizacao explicita.

---

# Como Funciona o Sistema de Relacionamento de Irmaos

## Resumo

O sistema **detecta e cria automaticamente** relacionamentos de irmaos durante a migracao de dados, com base nos relacionamentos de filiacao (pai/mae) existentes.

---

## Fluxo de Criacao dos Relacionamentos de Irmaos

### **1. Durante a Migracao (`/admin/migrar-dados`)**

Quando voce executa a migracao de dados, o sistema segue este fluxo:

```
1. Limpar banco de dados (DELETE)
2. Criar pessoas (INSERT na tabela pessoas)
3. Criar relacionamentos explicitos do seed (INSERT na tabela relacionamentos)
  - Relacionamentos de pai
  - Relacionamentos de mae
  - Relacionamentos de conjuge
  - Relacionamentos de filho
4. DETECTAR E CRIAR IRMAOS automaticamente
```

### **2. Deteccao Automatica de Irmaos**

A funcao `detectarECriarIrmaos()` no servidor (`/supabase/functions/server/index.tsx`) executa:

**Algoritmo:**

```typescript
1. Buscar todos relacionamentos de tipo 'pai' e 'mae'

2. Agrupar filhos por pai:
  - Mapear: pai_id -> [filho1_id, filho2_id, filho3_id, ...]

3. Agrupar filhos por mae:
  - Mapear: mae_id -> [filho1_id, filho2_id, filho3_id, ...]

4. Para cada grupo de filhos do mesmo pai:
  - Criar relacionamento BIDIRECIONAL entre cada par
  - filho1 a filho2
  - filho1 a filho3
  - filho2 a filho3
  - etc.

5. Para cada grupo de filhos da mesma mae:
  - Criar relacionamento BIDIRECIONAL entre cada par
  - (mesmo processo)

6. Evitar duplicatas usando Set<string> com pares ordenados
  - Exemplo: "uuid1-uuid2" (sempre menor UUID primeiro)

7. Inserir todos relacionamentos de irmaos no banco
```

**Codigo simplificado:**

```typescript
async function detectarECriarIrmaos() {
 // 1. Buscar filiacoes
 const { data: relacionamentos } = await supabase
  .from('relacionamentos')
  .select('*')
  .in('tipo_relacionamento', ['pai', 'mae']);

 // 2. Agrupar filhos por pai/mae
 const pessoasPorPai = new Map<string, Set<string>>();
 const pessoasPorMae = new Map<string, Set<string>>();

 for (const rel of relacionamentos) {
  if (rel.tipo_relacionamento === 'pai') {
   // pai_id -> [filho_ids]
   pessoasPorPai.get(rel.pessoa_destino_id).add(rel.pessoa_origem_id);
  }
  if (rel.tipo_relacionamento === 'mae') {
   // mae_id -> [filho_ids]
   pessoasPorMae.get(rel.pessoa_destino_id).add(rel.pessoa_origem_id);
  }
 }

 const irmaosParaCriar = [];
 const paresProcessados = new Set<string>();

 // 3. Criar relacionamentos entre filhos do mesmo pai
 for (const [paiId, filhos] of pessoasPorPai.entries()) {
  const filhosArray = Array.from(filhos);
  for (let i = 0; i < filhosArray.length; i++) {
   for (let j = i + 1; j < filhosArray.length; j++) {
    const par = [filhosArray[i], filhosArray[j]].sort().join('-');
    if (!paresProcessados.has(par)) {
     paresProcessados.add(par);
     // Bidirecional: A -> B e B -> A
     irmaosParaCriar.push({
      pessoa_origem_id: filhosArray[i],
      pessoa_destino_id: filhosArray[j],
      tipo_relacionamento: 'irmao',
      subtipo_relacionamento: 'sangue',
     });
     irmaosParaCriar.push({
      pessoa_origem_id: filhosArray[j],
      pessoa_destino_id: filhosArray[i],
      tipo_relacionamento: 'irmao',
      subtipo_relacionamento: 'sangue',
     });
    }
   }
  }
 }

 // 4. Repetir para filhos da mesma mae
 // (mesmo processo)

 // 5. Inserir no banco
 if (irmaosParaCriar.length > 0) {
  await supabase.from('relacionamentos').insert(irmaosParaCriar);
 }
}
```

---

## Estrutura no Banco de Dados

### **Tabela: relacionamentos**

Os irmaos sao armazenados como registros **bidirecionais**:

```sql
-- Exemplo: Joao e Maria sao irmaos

-- Registro 1: Joao -> Maria
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES ('uuid-joao', 'uuid-maria', 'irmao', 'sangue');

-- Registro 2: Maria -> Joao
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES ('uuid-maria', 'uuid-joao', 'irmao', 'sangue');
```

### **Por que bidirecional**

- Facilita queries em qualquer direcao
- Nao precisa usar `OR` nas queries
- Melhor performance com indices

```sql
-- Buscar irmaos de Joao (simples):
SELECT * FROM relacionamentos
WHERE pessoa_origem_id = 'uuid-joao'
AND tipo_relacionamento = 'irmao';

-- Se fosse unidirecional, precisaria:
SELECT * FROM relacionamentos
WHERE (pessoa_origem_id = 'uuid-joao' OR pessoa_destino_id = 'uuid-joao')
AND tipo_relacionamento = 'irmao';
```

---

## Como Aparece na Arvore Genealogica

Na visualizacao da arvore (`/src/app/components/FamilyTree/FamilyTree.tsx`):

### **Linhas de Irmaos:**

- **Cor:** Laranja/Amarelo (`#f59e0b`)
- **Estilo:** Pontilhado (`strokeDasharray: '5,5'`)
- **Conexao:** Em cadeia (mais velho -> proximo mais novo)

```
Joao (1990) -------- Maria (1992) -------- Pedro (1994)

mais velho     meio        mais novo
```

### **Ordem dos Irmaos:**

Os irmaos sao ordenados por **data de nascimento** (crescente):

```typescript
const siblingsWithDates = childrenIds
 .map(childId => {
  const pessoa = pessoas.find(p => p.id === childId);
  return { id: childId, dataNascimento: pessoa.data_nascimento || '' };
 })
 .sort((a, b) => {
  if (!a.dataNascimento) return 1;
  if (!b.dataNascimento) return -1;
  return a.dataNascimento.localeCompare(b.dataNascimento);
 });

// Conectar em cadeia: irmao[i] -> irmao[i+1]
for (let i = 0; i < siblingsWithDates.length - 1; i++) {
 const sibling1 = siblingsWithDates[i].id;
 const sibling2 = siblingsWithDates[i + 1].id;
 // Criar edge entre sibling1 e sibling2
}
```

---

## - Como Verificar se Esta Funcionando

### **1. Via Painel Admin (`/admin/diagnostico`)**

Acesse o diagnostico e verifique:

- - **Relacionamentos por Tipo:** Deve ter linha "Irmaos" com numero > 0
- - **Pessoas com Irmaos:** Deve ter uma contagem significativa
- - **Avisos:** Nao deve ter avisos sobre relacionamentos faltando

### **2. Via SQL (Supabase SQL Editor)**

Execute: `/verificar-irmaos.sql`

Ou execute diretamente:

```sql
-- 1. Ver total de relacionamentos de irmaos
SELECT COUNT(*) as total_irmaos
FROM relacionamentos
WHERE tipo_relacionamento = 'irmao';
-- Deve retornar > 0 (geralmente centenas)

-- 2. Ver pessoas com seus irmaos
SELECT
 p1.nome_completo as pessoa,
 COUNT(r.id) as total_irmaos,
 STRING_AGG(p2.nome_completo, ', ' ORDER Bp2.nome_completo) as nomes_irmaos
FROM pessoas p1
LEFT JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
LEFT JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
WHERE p1.humano_ou_pet = 'Humano'
GROUP Bp1.id, p1.nome_completo
HAVING COUNT(r.id) > 0
ORDER Btotal_irmaos DESC
LIMIT 10;

-- 3. Verificar se sao bidirecionais
-- Se A e irmao de B, entao B deve ser irmao de A
SELECT COUNT(*) as irmaos_unidirecionais
FROM relacionamentos r1
WHERE r1.tipo_relacionamento = 'irmao'
AND NOT EXISTS (
 SELECT 1 FROM relacionamentos r2
 WHERE r2.tipo_relacionamento = 'irmao'
 AND r2.pessoa_origem_id = r1.pessoa_destino_id
 AND r2.pessoa_destino_id = r1.pessoa_origem_id
);
-- Deve retornar 0 (todos devem ser bidirecionais)
```

### **3. Via Interface (Visualizacao da Arvore)**

1. Acesse a home (`/`)
2. Visualize a arvore genealogica
3. Procure por linhas **pontilhadas laranjas** conectando irmaos lado a lado
4. Verifique se estao ordenados por idade (mais velho a esquerda)

### **4. Via Filtros**

1. Na home, abra o painel lateral (botao hamburger)
2. Em "Filtros de Linhas", desmarque "Irmaos"
3. As linhas pontilhadas laranjas devem **desaparecer**
4. Marque novamente e elas devem **reaparecer**

---

## Solucao de Problemas

### **Problema: Irmaos nao aparecem no banco**

**Causas possiveis:**
1. Migracao nao foi executada completamente
2. Nao existem relacionamentos de filiacao (pai/mae)
3. Erro silencioso na funcao `detectarECriarIrmaos()`

**Solucao:**
```sql
-- 1. Verificar se existem relacionamentos de pai/mae
SELECT COUNT(*) FROM relacionamentos WHERE tipo_relacionamento IN ('pai', 'mae');
-- Se retornar 0, o problema e anterior (filiacoes nao foram criadas)

-- 2. Verificar se existem irmaos
SELECT COUNT(*) FROM relacionamentos WHERE tipo_relacionamento = 'irmao';
-- Se retornar 0, irmaos nao foram criados

-- 3. Re-executar migracao
-- Acesse /admin/migrar-dados e execute novamente
```

### **Problema: Irmaos nao aparecem na arvore**

**Causas possiveis:**
1. Filtro "Irmaos" esta desmarcado
2. Irmaos nao tem conexao visual (layout)
3. Erro no componente FamilyTree

**Solucao:**
1. Verifique o filtro na sidebar
2. Abra o console do navegador (F12) e procure erros
3. Verifique se os relacionamentos existem no estado do React:
  ```javascript
  // No console do navegador:
  // Procure por relacionamentos de tipo 'irmao'
  ```

### **Problema: Irmaos estao conectados mas nao na ordem correta**

**Causa:** Datas de nascimento faltando ou incorretas

**Solucao:**
1. Verifique os dados no seed (`/src/app/data/seed.ts`)
2. Certifique-se que `data_nascimento` esta preenchido
3. Formato deve ser: `DD/MM/` ou ``
4. Re-execute a migracao

---

## Estatisticas Esperadas (Familia com 6x2 membros)

Apos migracao completa, voce deve ter aproximadamente:

| Metrica | Valor Esperado |
|---------|----------------|
| Total de pessoas | 6x2 |
| Relacionamentos de pai | ~50-80 |
| Relacionamentos de mae | ~50-80 |
| Relacionamentos de conjuge | ~30-50 |
| Relacionamentos de filho | ~100-150 |
| **Relacionamentos de irmao** | **~200-400** |
| Total de relacionamentos | ~500-800 |

**Nota:** Os numeros variam dependendo da estrutura da familia no seed.

---

## Manutencao Manual (se necessario)

Se voce precisar criar relacionamentos de irmaos manualmente:

```sql
-- ATENCAO: Executar APENAS se os irmaos nao foram criados automaticamente!

WITH irmaos_detectados AS (
 -- Detectar irmaos pelo mesmo pai
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

 -- Detectar irmaos pela mesma mae
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

---

## Resumo Final

- **Irmaos sao detectados automaticamente** durante a migracao
- **Criados de forma bidirecional** (AB e BA)
- **Baseados em filiacao** (mesmo pai ou mesma mae)
- **Aparecem na arvore** como linhas pontilhadas laranjas
- **Ordenados por idade** (mais velho -> mais novo)
- **Podem ser filtrados** na interface
- **Verificaveis via SQL** ou painel admin

---

## Proximos Passos

1. Execute a migracao em `/admin/migrar-dados`
2. Execute o arquivo `/verificar-irmaos.sql` no Supabase
3. Verifique o diagnostico em `/admin/diagnostico`
4. Visualize a arvore na home e procure pelas linhas pontilhadas laranjas

**Se tudo estiver correto, voce deve ver centenas de relacionamentos de irmaos criados automaticamente! YZ**
