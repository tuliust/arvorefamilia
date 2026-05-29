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

Este arquivo responde a uma duvida pontual sobre relacionamentos de irmaos em uma fase antiga do projeto.

Nao usar este documento para decidir o fluxo atual de banco, migrations ou relacionamento. Antes de executar SQL, migracao ou rotina destrutiva, consultar:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

A rota `/admin/migrar-dados` deve ser tratada como ferramenta destrutiva/legada e nao como procedimento padrao de ambiente atual.

---

# Resposta rapida: Irmaos Estao Interligados

## Resposta Direta

**SIM**, o sistema **detecta e cria automaticamente** relacionamentos bidirecionais entre irmaos no banco de dados.

---

## Como Funciona (Resumo de 30 segundos)

1. Voce executa a **migracao** em `/admin/migrar-dados`
2. O sistema cria pessoas e relacionamentos explicitos (pai, mae, conjuge, filho)
3. **Automaticamente**, o servidor executa `detectarECriarIrmaos()` que:
 - Agrupa filhos pelo mesmo pai
 - Agrupa filhos pela mesma mae
 - Cria relacionamentos **bidirecionais** entre cada par de irmaos
 - Insere tudo na tabela `relacionamentos` com `tipo_relacionamento = 'irmao'`

---

## - Como Verificar AGORA (3 minutos)

### **Opcao 1: Via SQL (MAIS RAPIDO)**

1. Abra o Supabase SQL Editor
2. Execute:

```sql
-- Ver total de irmaos
SELECT COUNT(*) as total_irmaos
FROM relacionamentos
WHERE tipo_relacionamento = 'irmao';

-- Ver alguns exemplos de irmaos
SELECT
  p1.nome_completo as pessoa,
  STRING_AGG(p2.nome_completo, ', ') as irmaos
FROM pessoas p1
JOIN relacionamentos r ON r.pessoa_origem_id = p1.id AND r.tipo_relacionamento = 'irmao'
JOIN pessoas p2 ON p2.id = r.pessoa_destino_id
GROUP Bp1.nome_completo
LIMIT 5;
```

**Resultado esperado:**
- Primeira query: numero > 0 (geralmente 200-400)
- Segunda query: lista de pessoas com seus irmaos

### **Opcao 2: Via Interface**

1. Acesse `/admin/diagnostico`
2. Veja a secao "Relacionamentos por Tipo"
3. Deve ter uma linha "Irmaos" com numero > 0

### **Opcao 3: Via Arvore Visual**

1. Acesse a home (`/`)
2. Procure por **linhas pontilhadas laranjas** conectando pessoas lado a lado
3. Estas sao as conexoes entre irmaos

---

## Se NAO Estiver Funcionando

### **Cenario 1: Migracao nao foi executada**

**Solucao:**
1. Acesse `/admin/migrar-dados`
2. Clique em "Migrar Dados do Seed para o Banco"
3. Aguarde conclusao

### **Cenario 2: Tabelas nao foram criadas**

**Solucao:**
1. Abra o Supabase SQL Editor
2. Execute o arquivo `/database-schema.sql` (copie e cole todo conteudo)
3. Depois execute a migracao

### **Cenario 3: Irmaos criados mas nao aparecem na arvore**

**Solucao:**
1. Na home, abra a sidebar (botao de menu)
2. Em "Filtros de Linhas", verifique se "Irmaos" esta marcado
3. Se nao, marque a checkbox

---

## Numeros Esperados

Apos migracao completa (62 pessoas):

| Item | Valor Esperado |
|------|----------------|
| Pessoas | 62 |
| Relacionamentos de irmaos | 200-400 |
| Total de relacionamentos | 500-800 |

---

## Arquivos de Referencia

- **Schema SQL:** `/database-schema.sql`
- **Verificacao SQL:** `/verificar-irmaos.sql`
- **Codigo do servidor:** `/supabase/functions/server/index.tsx` (linha 541)
- **Guia completo:** `/COMO-FUNCIONA-IRMAOS.md`
- **Setup do banco:** `/SETUP-BANCO-DADOS.md`

---

## Checklist Rapido

- [ ] Schema SQL executado no Supabase
- [ ] Migracao executada em `/admin/migrar-dados`
- [ ] Query SQL retorna relacionamentos de irmaos > 0
- [ ] Diagnostico mostra relacionamentos de irmaos
- [ ] Arvore visual mostra linhas pontilhadas laranjas

**Se todos estao -, entao SIM, os irmaos estao completamente interligados no banco!**

---

## Exemplo Visual

```
Joao -------- Maria -------- Pedro
 |              |              |
filho          filho          filho
 de            de             de

Pai: Carlos   Pai: Carlos   Pai: Carlos
Mae: Ana      Mae: Ana      Mae: Ana

Relacionamentos criados automaticamente:
- Joao -> Maria (bidirecional)
- Joao -> Pedro (bidirecional)
- Maria -> Pedro (bidirecional)

Total: 6 registros na tabela relacionamentos
(3 pares x 2 direcoes)
```

---

**Duvidas** Consulte `/COMO-FUNCIONA-IRMAOS.md` para detalhes completos.
