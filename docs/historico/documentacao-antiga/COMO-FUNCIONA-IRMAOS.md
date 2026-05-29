# ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ Como Funciona o Sistema de Relacionamento de Irmãos

## ðŸ“‹ Resumo

O sistema **detecta e cria automaticamente** relacionamentos de irmãos durante a migração de dados, com base nos relacionamentos de filiação (pai/mãe) existentes.

---

## ðŸ”„ Fluxo de Criação dos Relacionamentos de Irmãos

### **1. Durante a Migração (`/admin/migrar-dados`)**

Quando você executa a migração de dados, o sistema segue este fluxo:

```
1. Limpar banco de dados (DELETE)
2. Criar pessoas (INSERT na tabela pessoas)
3. Criar relacionamentos explícitos do seed (INSERT na tabela relacionamentos)
   - Relacionamentos de pai
   - Relacionamentos de mãe
   - Relacionamentos de cônjuge
   - Relacionamentos de filho
4. ðŸŽ¯ DETECTAR E CRIAR IRMÃƒOS automaticamente
```

### **2. Detecção Automática de Irmãos**

A função `detectarECriarIrmaos()` no servidor (`/supabase/functions/server/index.tsx`) executa:

**Algoritmo:**

```typescript
1. Buscar todos relacionamentos de tipo 'pai' e 'mae'

2. Agrupar filhos por pai:
   - Mapear: pai_id -> [filho1_id, filho2_id, filho3_id, ...]

3. Agrupar filhos por mãe:
   - Mapear: mae_id -> [filho1_id, filho2_id, filho3_id, ...]

4. Para cada grupo de filhos do mesmo pai:
   - Criar relacionamento BIDIRECIONAL entre cada par
   - filho1 â†” filho2
   - filho1 â†” filho3
   - filho2 â†” filho3
   - etc.

5. Para cada grupo de filhos da mesma mãe:
   - Criar relacionamento BIDIRECIONAL entre cada par
   - (mesmo processo)

6. Evitar duplicatas usando Set<string> com pares ordenados
   - Exemplo: "uuid1-uuid2" (sempre menor UUID primeiro)

7. Inserir todos relacionamentos de irmãos no banco
```

**Código simplificado:**

```typescript
async function detectarECriarIrmaos() {
  // 1. Buscar filiações
  const { data: relacionamentos } = await supabase
    .from('relacionamentos')
    .select('*')
    .in('tipo_relacionamento', ['pai', 'mae']);

  // 2. Agrupar filhos por pai/mãe
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

  // 4. Repetir para filhos da mesma mãe
  // (mesmo processo)

  // 5. Inserir no banco
  if (irmaosParaCriar.length > 0) {
    await supabase.from('relacionamentos').insert(irmaosParaCriar);
  }
}
```

---

## ðŸ—„ï¸ Estrutura no Banco de Dados

### **Tabela: relacionamentos**

Os irmãos são armazenados como registros **bidirecionais**:

```sql
-- Exemplo: João e Maria são irmãos

-- Registro 1: João → Maria
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES ('uuid-joao', 'uuid-maria', 'irmao', 'sangue');

-- Registro 2: Maria → João
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES ('uuid-maria', 'uuid-joao', 'irmao', 'sangue');
```

### **Por que bidirecional**

- Facilita queries em qualquer direção
- Não precisa usar `OR` nas queries
- Melhor performance com índices

```sql
-- Buscar irmãos de João (simples):
SELECT * FROM relacionamentos
WHERE pessoa_origem_id = 'uuid-joao'
AND tipo_relacionamento = 'irmao';

-- Se fosse unidirecional, precisaria:
SELECT * FROM relacionamentos
WHERE (pessoa_origem_id = 'uuid-joao' OR pessoa_destino_id = 'uuid-joao')
AND tipo_relacionamento = 'irmao';
```

---

## ðŸŽ¨ Como Aparece na Árvore Genealógica

Na visualização da árvore (`/src/app/components/FamilyTree/FamilyTree.tsx`):

### **Linhas de Irmãos:**

- **Cor:** Laranja/Amarelo (`#f59e0b`)
- **Estilo:** Pontilhado (`strokeDasharray: '5,5'`)
- **Conexão:** Em cadeia (mais velho → próximo mais novo)

```
João (1990) -------- Maria (1992) -------- Pedro (1994)
  ↑                      ↑                      ↑
mais velho         meio               mais novo
```

### **Ordem dos Irmãos:**

Os irmãos são ordenados por **data de nascimento** (crescente):

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

// Conectar em cadeia: irmão[i] -> irmão[i+1]
for (let i = 0; i < siblingsWithDates.length - 1; i++) {
  const sibling1 = siblingsWithDates[i].id;
  const sibling2 = siblingsWithDates[i + 1].id;
  // Criar edge entre sibling1 e sibling2
}
```

---

## âœ… Como Verificar se Está Funcionando

### **1. Via Painel Admin (`/admin/diagnostico`)**

Acesse o diagnóstico e verifique:

- âœ… **Relacionamentos por Tipo:** Deve ter linha "Irmãos" com número > 0
- âœ… **Pessoas com Irmãos:** Deve ter uma contagem significativa
- âœ… **Avisos:** Não deve ter avisos sobre relacionamentos faltando

### **2. Via SQL (Supabase SQL Editor)**

Execute: `/verificar-irmaos.sql`

Ou execute diretamente:

```sql
-- 1. Ver total de relacionamentos de irmãos
SELECT COUNT(*) as total_irmaos
FROM relacionamentos
WHERE tipo_relacionamento = 'irmao';
-- Deve retornar > 0 (geralmente centenas)

-- 2. Ver pessoas com seus irmãos
SELECT
  p1.nome_completo as pessoa,
  COUNT(r.id) as total_irmaos,
  STRING_AGG(p2.nome_completo, ', ' ORDER BY p2.nome_completo) as nomes_irmaos
FROM pessoas p1
LEFT JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
LEFT JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
WHERE p1.humano_ou_pet = 'Humano'
GROUP BY p1.id, p1.nome_completo
HAVING COUNT(r.id) > 0
ORDER BY total_irmaos DESC
LIMIT 10;

-- 3. Verificar se são bidirecionais
-- Se A é irmão de B, então B deve ser irmão de A
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

### **3. Via Interface (Visualização da Árvore)**

1. Acesse a home (`/`)
2. Visualize a árvore genealógica
3. Procure por linhas **pontilhadas laranjas** conectando irmãos lado a lado
4. Verifique se estão ordenados por idade (mais velho Ã  esquerda)

### **4. Via Filtros**

1. Na home, abra o painel lateral (botão hamburger)
2. Em "Filtros de Linhas", desmarque "Irmãos"
3. As linhas pontilhadas laranjas devem **desaparecer**
4. Marque novamente e elas devem **reaparecer**

---

## ðŸ› Solução de Problemas

### **Problema: Irmãos não aparecem no banco**

**Causas possíveis:**
1. Migração não foi executada completamente
2. Não existem relacionamentos de filiação (pai/mãe)
3. Erro silencioso na função `detectarECriarIrmaos()`

**Solução:**
```sql
-- 1. Verificar se existem relacionamentos de pai/mãe
SELECT COUNT(*) FROM relacionamentos WHERE tipo_relacionamento IN ('pai', 'mae');
-- Se retornar 0, o problema é anterior (filiações não foram criadas)

-- 2. Verificar se existem irmãos
SELECT COUNT(*) FROM relacionamentos WHERE tipo_relacionamento = 'irmao';
-- Se retornar 0, irmãos não foram criados

-- 3. Re-executar migração
-- Acesse /admin/migrar-dados e execute novamente
```

### **Problema: Irmãos não aparecem na árvore**

**Causas possíveis:**
1. Filtro "Irmãos" está desmarcado
2. Irmãos não têm conexão visual (layout)
3. Erro no componente FamilyTree

**Solução:**
1. Verifique o filtro na sidebar
2. Abra o console do navegador (F12) e procure erros
3. Verifique se os relacionamentos existem no estado do React:
   ```javascript
   // No console do navegador:
   // Procure por relacionamentos de tipo 'irmao'
   ```

### **Problema: Irmãos estão conectados mas não na ordem correta**

**Causa:** Datas de nascimento faltando ou incorretas

**Solução:**
1. Verifique os dados no seed (`/src/app/data/seed.ts`)
2. Certifique-se que `data_nascimento` está preenchido
3. Formato deve ser: `DD/MM/YYYY` ou `YYYY`
4. Re-execute a migração

---

## ðŸ“Š Estatísticas Esperadas (Família com 62 membros)

Após migração completa, você deve ter aproximadamente:

| Métrica | Valor Esperado |
|---------|----------------|
| Total de pessoas | 62 |
| Relacionamentos de pai | ~50-80 |
| Relacionamentos de mãe | ~50-80 |
| Relacionamentos de cônjuge | ~30-50 |
| Relacionamentos de filho | ~100-150 |
| **Relacionamentos de irmão** | **~200-400** |
| Total de relacionamentos | ~500-800 |

**Nota:** Os números variam dependendo da estrutura da família no seed.

---

## ðŸ”§ Manutenção Manual (se necessário)

Se você precisar criar relacionamentos de irmãos manualmente:

```sql
-- ATENÇÃƒO: Executar APENAS se os irmãos não foram criados automaticamente!

WITH irmaos_detectados AS (
  -- Detectar irmãos pelo mesmo pai
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

  -- Detectar irmãos pela mesma mãe
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

## ðŸ“ Resumo Final

âœ… **Irmãos são detectados automaticamente** durante a migração
âœ… **Criados de forma bidirecional** (A→B e B→A)
âœ… **Baseados em filiação** (mesmo pai ou mesma mãe)
âœ… **Aparecem na árvore** como linhas pontilhadas laranjas
âœ… **Ordenados por idade** (mais velho → mais novo)
âœ… **Podem ser filtrados** na interface
âœ… **Verificáveis via SQL** ou painel admin

---

## ðŸŽ¯ Próximos Passos

1. Execute a migração em `/admin/migrar-dados`
2. Execute o arquivo `/verificar-irmaos.sql` no Supabase
3. Verifique o diagnóstico em `/admin/diagnostico`
4. Visualize a árvore na home e procure pelas linhas pontilhadas laranjas

**Se tudo estiver correto, você deve ver centenas de relacionamentos de irmãos criados automaticamente! ðŸŽ‰**
