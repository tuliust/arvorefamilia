# Histórico consolidado

> Última revisão: 2026-06-20  
> Local recomendado: `docs/historico/README.md`  
> Tipo: índice e consolidação histórica.  
> Status: atualizado com a baseline padrão dos mapas familiares mobile.

---

## 1. Objetivo

Esta pasta preserva rastreabilidade técnica e operacional do projeto **Árvore Família**.

Ela não é fonte de verdade do produto atual.

A fonte de verdade fica em:

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/INVENTARIO_TECNICO.md
docs/DECISOES_ARQUITETURAIS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/arquitetura/
docs/funcionalidades/
docs/operacao/
supabase/migrations/
```

Regra:

```txt
Se houver divergência entre histórico e documentação canônica atual, prevalece a documentação canônica atual.
```

Para banco de dados:

```txt
supabase/migrations/ é a fonte da verdade do schema.
```

---

## 2. Baseline atual do produto

A baseline atual da árvore é:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

A rota raiz:

```txt
/
```

redireciona para:

```txt
/mapa-familiar
```

Rotas antigas removidas como views ativas:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção vigente:

```txt
/minha-arvore/editar
```

é rota de edição de membro e deve permanecer documentada fora do contexto das views antigas.

Títulos vigentes das views oficiais:

| Rota | Título |
|---|---|
| `/mapa-familiar` | `Árvore Familiar de {primeiroNome}` |
| `/mapa-familiar-horizontal` | `Mapa Genealógico de {primeiroNome}` |

---

## 3. Documentos históricos de views antigas

Documento preventivo principal:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

Documentos arquivados como legado:

| Documento histórico | Origem | Motivo |
|---|---|---|
| `docs/historico/ROTAS_REMOVIDAS.md` | frente documental atual | resume substituições, exceção `/minha-arvore/editar` e anti-regressões de rotas removidas |
| `docs/historico/MINHA_ARVORE_VIEW.md` | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` | `/minha-arvore` não é view ativa |
| `docs/historico/GENEALOGIA_VIEW.md` | `docs/funcionalidades/GENEALOGIA_VIEW.md` | `/genealogia` e `/visao-completa` não são views ativas |
| `docs/historico/MINHA_ARVORE_FILTROS_E_PETS.md` | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | regras vigentes foram extraídas para docs atuais |

---

## 4. Histórico resumido das views

### 4.1 Antiga Minha Árvore

A antiga `/minha-arvore` era uma view direta baseada em ReactFlow no desktop/tablet e `MobileFamilyTreeView` no mobile.

Status atual:

- rota removida como view ativa;
- comportamento principal substituído por `/mapa-familiar`;
- mobile segmentado permanece útil em `/mapa-familiar` mobile;
- `/minha-arvore/editar` continua vigente como edição.

Documentos históricos:

```txt
docs/historico/MINHA_ARVORE_VIEW.md
docs/historico/ROTAS_REMOVIDAS.md
```

### 4.2 Antiga Genealogia

A antiga `/genealogia` organizava pessoas por gerações em ReactFlow.

Status atual:

- rota removida;
- linguagem genealógica permanece como conceito visual da horizontal atual;
- horizontal atual é `/mapa-familiar-horizontal`;
- título atual: `Mapa Genealógico de {primeiroNome}`.

Documentos históricos:

```txt
docs/historico/GENEALOGIA_VIEW.md
docs/historico/ROTAS_REMOVIDAS.md
```

### 4.3 Antiga Visão Completa

A antiga `/visao-completa` era uma variação ampliada/completa da visão genealógica.

Status atual:

- rota removida;
- não deve ser usada como fallback da horizontal;
- código ReactFlow remanescente deve ser tratado como legado técnico.

---

## 5. Histórico de filtros, pets e avatares

Regras preservadas nos docs atuais:

- separação entre `personFilters` e `directRelativeFilters`;
- pets por `humano_ou_pet === 'Pet'`;
- cônjuges sempre visíveis versus filtráveis;
- cônjuges de pais/Geração 4 na horizontal permanecem pendência `TREE-003` até correção no código;
- múltiplos cônjuges da pessoa central na vertical;
- contagens efetivas por view;
- filtros não alteram dados;
- pessoa com foto usa `foto_principal_url`;
- pessoa humana sem foto usa `User`;
- pet sem foto usa `PawPrint`;
- não há distinção visual obrigatória por gênero para avatar sem foto.

Documento histórico:

```txt
docs/historico/MINHA_ARVORE_FILTROS_E_PETS.md
```

Documentos atuais:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 6. Histórico de rollback e ajustes mobile em 2026-06-20

### 6.1 Rollback/restauração

```txt
docs/historico/ROLLBACK_E_AJUSTES_POS_RESTAURACAO_2026_06_20.md
```

Uso:

- rastrear a refatoração ampla da árvore mobile que foi tentada e abandonada como contrato vigente;
- diferenciar `rollback/mobile-9-telas-d7385dc-v2` da base estável real;
- registrar a restauração da `main` a partir de `52ee451`;
- documentar ajustes pós-restauração em Zoom, conectores de `ancestors` e conectores de `descendants`.

### 6.2 Complemento de navegação mobile

```txt
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_COMPLEMENTO.md
```

Uso:

- registrar a matriz 3x3 desejada após ajustes de avós, tios, primos e descendentes;
- separar contrato desejado de regressões observadas;
- documentar a sensibilidade da navegação por sobreposição de scripts de gesture.

### 6.3 Baseline antes da correção consolidada

```txt
docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md
```

Uso:

- preservar o estado imediatamente anterior aos ajustes consolidados;
- registrar o commit de referência `a44fc4b2b63eaf5bc15fff956b1eca44ea88c8ad`;
- permitir comparação visual ou rollback controlado.

### 6.4 Ajuste consolidado vigente

```txt
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md
```

Uso:

- registrar a inclusão de vínculos diretos de tios/tias no modelo mobile;
- registrar `mobileFamilyMapStableMobileFix.ts`;
- registrar a redução de scripts concorrentes em `index.html`;
- registrar checklist de QA pós-deploy.

### 6.5 Baseline padrão final dos mapas mobile

```txt
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
```

Branch:

```txt
baseline/mapas-mobile-padrao-2026-06-20
```

Uso:

- congelar a estrutura atual de `/mapa-familiar` e `/mapa-familiar-horizontal` como padrão de referência;
- registrar `core` sem descendentes visuais e `descendants` como tela dos grupos descendentes;
- registrar Zoom horizontal por gerações;
- registrar matriz de swipe e conectores atuais;
- servir como base de comparação para regressões.

### 6.6 Documentos canônicos atualizados

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
```

Esses documentos prevalecem sobre histórico em caso de divergência.

---

## 7. Histórico de exportação

A frente de exportação consolidou:

- seleção por área;
- PNG;
- PDF;
- impressão;
- loading;
- título no canvas;
- exclusão de painel/header/bottom nav;
- normalização de SVGs;
- preservação de conectores, paletas e avatares.

Documento atual:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```
