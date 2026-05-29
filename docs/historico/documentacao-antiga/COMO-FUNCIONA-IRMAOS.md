# ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ Como Funciona o Sistema de Relacionamento de IrmÃ£os

## ðŸ“‹ Resumo

O sistema **detecta e cria automaticamente** relacionamentos de irmÃ£os durante a migraÃ§Ã£o de dados, com base nos relacionamentos de filiaÃ§Ã£o (pai/mÃ£e) existentes.

---

## ðŸ”„ Fluxo de CriaÃ§Ã£o dos Relacionamentos de IrmÃ£os

### **1. Durante a MigraÃ§Ã£o (`/admin/migrar-dados`)**

Quando vocÃª executa a migraÃ§Ã£o de dados, o sistema segue este fluxo:

```
1. Limpar banco de dados (DELETE)
2. Criar pessoas (INSERT na tabela pessoas)
3. Criar relacionamentos explÃ­citos do seed (INSERT na tabela relacionamentos)
   - Relacionamentos de pai
   - Relacionamentos de mÃ£e
   - Relacionamentos de cÃ´njuge
   - Relacionamentos de filho
4. ðŸŽ¯ DETECTAR E CRIAR IRMÃƒOS automaticamente
```

### **2. DetecÃ§Ã£o AutomÃ¡tica de IrmÃ£os**

A funÃ§Ã£o `detectarECriarIrmaos()` no servidor (`/supabase/functions/server/index.tsx`) executa:

**Algoritmo:**

```typescript
1. Buscar todos relacionamentos de tipo 'pai' e 'mae'

2. Agrupar filhos por pai:
   - Mapear: pai_id -> [filho1_id, filho2_id, filho3_id, ...]

3. Agrupar filhos por mÃ£e:
   - Mapear: mae_id -> [filho1_id, filho2_id, filho3_id, ...]

4. Para cada grupo de filhos do mesmo pai:
   - Criar relacionamento BIDIRECIONAL entre cada par
   - filho1 â†” filho2
   - filho1 â†” filho3
   - filho2 â†” filho3
   - etc.

5. Para cada grupo de filhos da mesma mÃ£e:
   - Criar relacionamento BIDIRECIONAL entre cada par
   - (mesmo processo)

6. Evitar duplicatas usando Set<string> com pares ordenados
   - Exemplo: "uuid1-uuid2" (sempre menor UUID primeiro)

7. Inserir todos relacionamentos de irmÃ£os no banco
```

**CÃ³digo simplificado:**

```typescript
async function detectarECriarIrmaos() {
  // 1. Buscar filiaÃ§Ãµes
  const { data: relacionamentos } = await supabase
    .from('relacionamentos')
    .select('*')
    .in('tipo_relacionamento', ['pai', 'mae']);

  // 2. Agrupar filhos por pai/mÃ£e
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

  // 4. Repetir para filhos da mesma mÃ£e
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

Os irmÃ£os sÃ£o armazenados como registros **bidirecionais**:

```sql
-- Exemplo: JoÃ£o e Maria sÃ£o irmÃ£os

-- Registro 1: JoÃ£o â†’ Maria
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES ('uuid-joao', 'uuid-maria', 'irmao', 'sangue');

-- Registro 2: Maria â†’ JoÃ£o
INSERT INTO relacionamentos (pessoa_origem_id, pessoa_destino_id, tipo_relacionamento, subtipo_relacionamento)
VALUES ('uuid-maria', 'uuid-joao', 'irmao', 'sangue');
```

### **Por que bidirecional?**

- Facilita queries em qualquer direÃ§Ã£o
- NÃ£o precisa usar `OR` nas queries
- Melhor performance com Ã­ndices

```sql
-- Buscar irmÃ£os de JoÃ£o (simples):
SELECT * FROM relacionamentos
WHERE pessoa_origem_id = 'uuid-joao'
AND tipo_relacionamento = 'irmao';

-- Se fosse unidirecional, precisaria:
SELECT * FROM relacionamentos
WHERE (pessoa_origem_id = 'uuid-joao' OR pessoa_destino_id = 'uuid-joao')
AND tipo_relacionamento = 'irmao';
```

---

## ðŸŽ¨ Como Aparece na Ãrvore GenealÃ³gica

Na visualizaÃ§Ã£o da Ã¡rvore (`/src/app/components/FamilyTree/FamilyTree.tsx`):

### **Linhas de IrmÃ£os:**

- **Cor:** Laranja/Amarelo (`#f59e0b`)
- **Estilo:** Pontilhado (`strokeDasharray: '5,5'`)
- **ConexÃ£o:** Em cadeia (mais velho â†’ prÃ³ximo mais novo)

```
JoÃ£o (1990) -------- Maria (1992) -------- Pedro (1994)
  â†‘                      â†‘                      â†‘
mais velho         meio               mais novo
```

### **Ordem dos IrmÃ£os:**

Os irmÃ£os sÃ£o ordenados por **data de nascimento** (crescente):

```typescript
const siblingsWithDates = childrenIds
  .map(childId => {
    const pessoa = pessoas.find(p => p.id === childId);
    return { id: childId, dataNascimento: pessoa?.data_nascimento || '' };
  })
  .sort((a, b) => {
    if (!a.dataNascimento) return 1;
    if (!b.dataNascimento) return -1;
    return a.dataNascimento.localeCompare(b.dataNascimento);
  });

// Conectar em cadeia: irmÃ£o[i] -> irmÃ£o[i+1]
for (let i = 0; i < siblingsWithDates.length - 1; i++) {
  const sibling1 = siblingsWithDates[i].id;
  const sibling2 = siblingsWithDates[i + 1].id;
  // Criar edge entre sibling1 e sibling2
}
```

---

## âœ… Como Verificar se EstÃ¡ Funcionando

### **1. Via Painel Admin (`/admin/diagnostico`)**

Acesse o diagnÃ³stico e verifique:

- âœ… **Relacionamentos por Tipo:** Deve ter linha "IrmÃ£os" com nÃºmero > 0
- âœ… **Pessoas com IrmÃ£os:** Deve ter uma contagem significativa
- âœ… **Avisos:** NÃ£o deve ter avisos sobre relacionamentos faltando

### **2. Via SQL (Supabase SQL Editor)**

Execute: `/verificar-irmaos.sql`

Ou execute diretamente:

```sql
-- 1. Ver total de relacionamentos de irmÃ£os
SELECT COUNT(*) as total_irmaos
FROM relacionamentos
WHERE tipo_relacionamento = 'irmao';
-- Deve retornar > 0 (geralmente centenas)

-- 2. Ver pessoas com seus irmÃ£os
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

-- 3. Verificar se sÃ£o bidirecionais
-- Se A Ã© irmÃ£o de B, entÃ£o B deve ser irmÃ£o de A
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

### **3. Via Interface (VisualizaÃ§Ã£o da Ãrvore)**

1. Acesse a home (`/`)
2. Visualize a Ã¡rvore genealÃ³gica
3. Procure por linhas **pontilhadas laranjas** conectando irmÃ£os lado a lado
4. Verifique se estÃ£o ordenados por idade (mais velho Ã  esquerda)

### **4. Via Filtros**

1. Na home, abra o painel lateral (botÃ£o hamburger)
2. Em "Filtros de Linhas", desmarque "IrmÃ£os"
3. As linhas pontilhadas laranjas devem **desaparecer**
4. Marque novamente e elas devem **reaparecer**

---

## ðŸ› SoluÃ§Ã£o de Problemas

### **Problema: IrmÃ£os nÃ£o aparecem no banco**

**Causas possÃ­veis:**
1. MigraÃ§Ã£o nÃ£o foi executada completamente
2. NÃ£o existem relacionamentos de filiaÃ§Ã£o (pai/mÃ£e)
3. Erro silencioso na funÃ§Ã£o `detectarECriarIrmaos()`

**SoluÃ§Ã£o:**
```sql
-- 1. Verificar se existem relacionamentos de pai/mÃ£e
SELECT COUNT(*) FROM relacionamentos WHERE tipo_relacionamento IN ('pai', 'mae');
-- Se retornar 0, o problema Ã© anterior (filiaÃ§Ãµes nÃ£o foram criadas)

-- 2. Verificar se existem irmÃ£os
SELECT COUNT(*) FROM relacionamentos WHERE tipo_relacionamento = 'irmao';
-- Se retornar 0, irmÃ£os nÃ£o foram criados

-- 3. Re-executar migraÃ§Ã£o
-- Acesse /admin/migrar-dados e execute novamente
```

### **Problema: IrmÃ£os nÃ£o aparecem na Ã¡rvore**

**Causas possÃ­veis:**
1. Filtro "IrmÃ£os" estÃ¡ desmarcado
2. IrmÃ£os nÃ£o tÃªm conexÃ£o visual (layout)
3. Erro no componente FamilyTree

**SoluÃ§Ã£o:**
1. Verifique o filtro na sidebar
2. Abra o console do navegador (F12) e procure erros
3. Verifique se os relacionamentos existem no estado do React:
   ```javascript
   // No console do navegador:
   // Procure por relacionamentos de tipo 'irmao'
   ```

### **Problema: IrmÃ£os estÃ£o conectados mas nÃ£o na ordem correta**

**Causa:** Datas de nascimento faltando ou incorretas

**SoluÃ§Ã£o:**
1. Verifique os dados no seed (`/src/app/data/seed.ts`)
2. Certifique-se que `data_nascimento` estÃ¡ preenchido
3. Formato deve ser: `DD/MM/YYYY` ou `YYYY`
4. Re-execute a migraÃ§Ã£o

---

## ðŸ“Š EstatÃ­sticas Esperadas (FamÃ­lia com 62 membros)

ApÃ³s migraÃ§Ã£o completa, vocÃª deve ter aproximadamente:

| MÃ©trica | Valor Esperado |
|---------|----------------|
| Total de pessoas | 62 |
| Relacionamentos de pai | ~50-80 |
| Relacionamentos de mÃ£e | ~50-80 |
| Relacionamentos de cÃ´njuge | ~30-50 |
| Relacionamentos de filho | ~100-150 |
| **Relacionamentos de irmÃ£o** | **~200-400** |
| Total de relacionamentos | ~500-800 |

**Nota:** Os nÃºmeros variam dependendo da estrutura da famÃ­lia no seed.

---

## ðŸ”§ ManutenÃ§Ã£o Manual (se necessÃ¡rio)

Se vocÃª precisar criar relacionamentos de irmÃ£os manualmente:

```sql
-- ATENÃ‡ÃƒO: Executar APENAS se os irmÃ£os nÃ£o foram criados automaticamente!

WITH irmaos_detectados AS (
  -- Detectar irmÃ£os pelo mesmo pai
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

  -- Detectar irmÃ£os pela mesma mÃ£e
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

âœ… **IrmÃ£os sÃ£o detectados automaticamente** durante a migraÃ§Ã£o
âœ… **Criados de forma bidirecional** (Aâ†’B e Bâ†’A)
âœ… **Baseados em filiaÃ§Ã£o** (mesmo pai ou mesma mÃ£e)
âœ… **Aparecem na Ã¡rvore** como linhas pontilhadas laranjas
âœ… **Ordenados por idade** (mais velho â†’ mais novo)
âœ… **Podem ser filtrados** na interface
âœ… **VerificÃ¡veis via SQL** ou painel admin

---

## ðŸŽ¯ PrÃ³ximos Passos

1. Execute a migraÃ§Ã£o em `/admin/migrar-dados`
2. Execute o arquivo `/verificar-irmaos.sql` no Supabase
3. Verifique o diagnÃ³stico em `/admin/diagnostico`
4. Visualize a Ã¡rvore na home e procure pelas linhas pontilhadas laranjas

**Se tudo estiver correto, vocÃª deve ver centenas de relacionamentos de irmÃ£os criados automaticamente! ðŸŽ‰**
