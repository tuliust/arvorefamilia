> Status: documento historico / obsoleto.
> Local: `docs/historico/documentacao-antiga/`.
> Nao usar como fonte canonica para desenvolvimento atual.
>
> Fonte canonica atual:
>
> ```txt
> docs/README.md
> docs/operacao/MIGRATIONS_SUPABASE.md
> docs/arquitetura/ROTAS_E_GUARDS.md
> docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
> ```
>
> Este arquivo foi preservado apenas para rastreabilidade historica. Ele pode citar rotas, scripts SQL, endpoints, dados de seed, senhas, numeros de registros ou fluxos que nao representam mais o estado atual do projeto.

---

# Indice dDocumentacao - Sistemde Arvore Genealogica

##  Documentos Criados parVoce

### **1. RESPOSTA RAPIDA** as
**Arquivo:** `/RESPOSTA-RAPIDA-IRMAOS.md`
**Quando usar:** Respostdirete objetivsobre irmaos
**Tempo de leitura:** 2 minutos
**Conteudo:**
- RespostSIM/NAO direta
- Como verificar em 3 minutos
- Troubleshooting rapido
- Checklist

---

### **2. SETUP DO BANCO DE DADOS**
**Arquivo:** `/SETUP-BANCO-DADOS.md`
**Quando usar:** Primeirvez configurando o banco
**Tempo de leitura:** 10 minutos
**Conteudo:**
- O que precisser criado no Supabase
- Passo passo completo
- Como verificar se estfuncionando
- Solucao de problemas
- Checklist completo

---

### **3. COMO FUNCIONA O SISTEMA DE IRMAOS** aaa
**Arquivo:** `/COMO-FUNCIONA-IRMAOS.md`
**Quando usar:** Entender detalhadamente logicde irmaos
**Tempo de leitura:** 15 minutos
**Conteudo:**
- Fluxo completo de criacao de irmaos
- Algoritmo de deteccao
- Codigo TypeScript comentado
- Estruturno banco de dados
- Como aparece narvore visual
- Verificacao detalhada
- Manutencao manual

---

### **4. SCHEMA SQL COMPLETO**
**Arquivo:** `/database-schema.sql`
**Quando usar:** Criar as tabelas no Supabase
**Tempo de execucao:** 10 segundos
**Conteudo:**
- Criacao de 3 tabelas (pessoas, relacionamentos, arquivos_historicos)
- Funcao update_updated_at_column()
- 3 Triggers
- Indices
- Politicas RLS
- View pessoas_com_estatisticas
- Extensao uuid-ossp

---

### **5. VERIFICACAO DE IRMAOS SQL**
**Arquivo:** `/verificar-irmaos.sql`
**Quando usar:** Verificar integridade dos relacionamentos de irmaos
**Tempo de execucao:** 30 segundos
**Conteudo:**
- 7 queries de verificacao
- Total de relacionamentos por tipo
- Pessoas com seus irmaos
- Familias completas
- Verificacao de bidirecionalidade
- Estatisticas gerais
- Exemplo de familiespecifica
- Pessoas sem relacionamentos
- Acoes corretivas (se necessario)

---

### **6. DIAGNOSTICO RAPIDO SQL** as
**Arquivo:** `/diagnostico-rapido.sql`
**Quando usar:** Verificacao rapidde 5 testes essenciais
**Tempo de execucao:** 5 segundos
**Conteudo:**
- 5 testes automatizados
- Interpretacao dos resultados
- Resultado PASSOU/FALHOU claro

---

### **7. RELATORIO DE DIAGNOSTICO COMPLETO** (novo, historico)
**Arquivo:** `/RELATORIO-DIAGNOSTICO-COMPLETO.md`
**Quando usar:** Ver analise completdo sistemcom resultados reais
**Tempo de leitura:** 10 minutos
**Conteudo:**
- Resumo executivo com status geral
- Resultados dos 5 testes executados
- Analise detalhadde familias e relacionamentos
- Estatisticas avancadas
- ProblemAvisodentificados com detalhes
- Visualizacao de como irmaos aparecem narvore
- Codigo-fonte relevante
- Recomendacoes prioritizadas

---

### **8. ERROS E SOLUCAES** Aviso (novo, historico)
**Arquivo:** `/ERROS-E-SOLUCOES.md`
**Quando usar:** Quando encontrar erros no diagnostico
**Tempo de leitura:** 8 minutos
**Conteudo:**
- Listde todos erros encontrados
- Descricao detalhadde caderro
- Impacto e severidade
- 3 solucoes diferentes parcadproblema
- Passo passo de correcao
- Testes de validacao
- Checklist de correcao

---

### **9. SCRIPT DE CORRECAO SQL** (novo, historico)
**Arquivo:** `/corrigir-pessoa-isolada.sql`
**Quando usar:** Corrigir pessosem relacionamentos
**Tempo de execucao:** 10 segundos
**Conteudo:**
- 3 opcoes de correcao (remover, adicionar, investigar)
- Scripts SQL prontos parexecutar
- Queries de investigacao
- Testes de validacao
- Instrucoes detalhadas

---

##  Fluxo de Uso Recomendado

### **ParPrimeirVez (Setup Inicial)**

```
1. Leia: SETUP-BANCO-DADOS.md

2. Execute: database-schema.sql (no Supabase SQL Editor)

3. Execute: Migracao em /admin/migrar-dados

4. Execute: diagnostico-rapido.sql (no Supabase SQL Editor)

5. Se tudo -, pronto! Se nao, vejSETUP-BANCO-DADOS.md Solucao de Problemas
```

### **ParVerificar se Irmaos Estao Conectados**

```
1. Leia: RESPOSTA-RAPIDA-IRMAOS.md (2 min)

2. Execute: diagnostico-rapido.sql (5 seg)

3. Se quiser detalhes, execute: verificar-irmaos.sql (30 seg)
```

### **ParEntender Como Funciona**

```
1. Leia: COMO-FUNCIONA-IRMAOS.md (15 min)

2. Explore o codigo: /supabase/functions/server/index.tsx (linh541)

3. Teste modificacoes e re-execute migracao
```

### **ParVer Diagnostico Completo e Erros** (novo, historico)

```
1. Execute: diagnostico-rapido.sql ou verificar-irmaos.sql

2. Leia: RELATORIO-DIAGNOSTICO-COMPLETO.md

3. Se houver erros, leia: ERROS-E-SOLUCOES.md

4. Execute: corrigir-pessoa-isolada.sql (se necessario)
```

---

## Matriz de Decisao: Qual Arquivo Ler

| Situacao | Arquivo Recomendado | Tempo |
|----------|---------------------|-------|
| "Irmaos estao conectados" | RESPOSTA-RAPIDA-IRMAOS.md | 2 min |
| "Primeirvez configurando" | SETUP-BANCO-DADOS.md | 10 min |
| "Como funciondeteccao" | COMO-FUNCIONA-IRMAOS.md | 15 min |
| "Criar tabelas no banco" | database-schema.sql | 10 seg |
| "Verificar integridade completa" | verificar-irmaos.sql | 30 seg |
| "Teste rapido" | diagnostico-rapido.sql | 5 seg |
| "Ver diagnostico completo" | RELATORIO-DIAGNOSTICO-COMPLETO.md | 10 min |
| "Corrigir erros encontrados" | ERROS-E-SOLUCOES.md | 8 min |
| "Corrigir pessoisolada" | corrigir-pessoa-isolada.sql | 10 seg |

---

## Arquivos Tecnicos (Codigo-fonte)

### **Backend (Servidor Hono)**
- `/supabase/functions/server/index.tsx`
 - Linh541: `detectarECriarIrmaos()` - Funcao que detectirmaos
 - Linh637: Rot`/diagnostico` - Diagnostico de integridade

### **Frontend (React)**
- `/src/app/components/FamilyTree/FamilyTree.tsx`
 - Linh415-450: Renderizacao de linhas de irmaos
 - Linh420-431: Ordenacao de irmaos por datde nascimento
- `/src/app/pages/admin/AdminDiagnostico.tsx`
 - Painel de diagnostico visual
- `/src/app/pages/admin/AdminMigrarDados.tsx`
 - Interface de migracao de dados

### **Dados**
- `/src/app/data/seed.ts`
 - Dados iniciais dfamili(62 membros)

---

##  Checklist de Verificacao Final

Use estchecklist pargarantir que tudo estfuncionando:

### **Setup Inicial**
- [ ] Executou `database-schema.sql` no Supabase
- [ ] Executou migracao em `/admin/migrar-dados`
- [ ] Migracao concluiu com sucesso (sem erros)

### **Verificacao de Irmaos**
- [ ] Executou `diagnostico-rapido.sql`
- [ ] TESTE 1 PASSOU (irmaos > 0)
- [ ] TESTE 2 PASSOU (bidirecional)
- [ ] TESTE 3 mostrexemplos de irmaos
- [ ] TESTE 4 mostrestatisticas corretas
- [ ] TESTE 5 mostrtipo "irmao" nlista

### **Verificacao Visual**
- [ ] Home (`/`) mostrarvore genealogica
- [ ] Linhas pontilhadas laranjas aparecem (irmaos)
- [ ] Filtro "Irmaos" funcion(ocultar/mostrar)
- [ ] Diagnostico admin mostrdados corretos

### **Testes de Integridade**
- [ ] Executou `verificar-irmaos.sql` (todas 7 queries)
- [ ] Relacionamentos sao bidirecionais
- [ ] Familias estao completas
- [ ] Sem pessoAvisosoladas (exceto casos validos)

---

## Suporte e Referencias

### **Documentacao Oficial**
- Supabase: https://supabase.com/docs
- React Flow: https://reactflow.dev/
- React Router: https://reactrouter.com/

### **Arquivos de Configuracao**
- `/database-schema.sql` - SchemSQL completo
- `/package.json` - Dependencias do projeto
- `/tsconfig.json` - Configuracao TypeScript

### **Troubleshooting**
1. Consulte SETUP-BANCO-DADOS.md "Solucao de Problemas"
2. Consulte COMO-FUNCIONA-IRMAOS.md "Solucao de Problemas"
3. Execute diagnostico-rapido.sql e interprete os resultados
4. Verifique logs no console do navegador (F12)
5. Verifique logs do servidor no Supabase Dashboard

---

## Proximos Passos

Apos verificar que tudo estfuncionando:

1. **Explorar interface:**
  - Home: Visualize arvore
  - Clique em pessoas parver detalhes
  - Use filtros nsidebar

2. **Painel Admin:**
  - Acesse `/admin/login` (senha: `admin123`)
  - Explore CRUD de pessoas
  - Vejdiagnostico detalhado
  - Teste exportacao de dados

3. **Personalizar:**
  - Adicione mais pessoas
  - Adicione fotos
  - Customize cores dos cards
  - Adicione curiosidades e minibios

4. **Avancado:**
  - Configure autenticacao real
  - Adicione upload de fotos no Supabase Storage
  - Implemente historico de mudancas
  - Adicione mais views e relatorios

---

**Ultimatualizacao:** 2026-04-05
**Versao ddocumentacao:** 1.0
**Status:** - Completo e testado
