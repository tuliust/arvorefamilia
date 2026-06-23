# Histórico consolidado

> Última revisão: 2026-06-22  
> Local recomendado: `docs/historico/README.md`  
> Tipo: índice e consolidação histórica.  
> Status: atualizado para deixar explícito que o histórico não prevalece sobre documentação canônica, código atual e migrations oficiais.

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
src/
```

Regra:

```txt
Se houver divergência entre histórico e documentação canônica atual, prevalecem, nesta ordem:
1. código atual;
2. migrations oficiais em supabase/migrations/;
3. documentos canônicos vigentes;
4. documentos históricos.
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

### 4.2 Antiga Genealogia

A antiga `/genealogia` organizava pessoas por gerações em ReactFlow.

Status atual:

- rota removida;
- linguagem genealógica permanece como conceito visual da horizontal atual;
- horizontal atual é `/mapa-familiar-horizontal`;
- título atual: `Mapa Genealógico de {primeiroNome}`.

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

Documentos atuais:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/MEUS_VINCULOS.md
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
- diferenciar branches de rollback da base estável real;
- registrar a restauração e os ajustes pós-restauração.

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
- permitir comparação visual ou rollback controlado.

### 6.4 Ajuste consolidado vigente em 2026-06-20

```txt
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md
```

Uso:

- registrar inclusão de vínculos diretos de tios/tias no modelo mobile;
- registrar `mobileFamilyMapStableMobileFix.ts`;
- registrar redução de scripts concorrentes em `index.html`;
- registrar checklist de QA pós-deploy.

### 6.5 Baseline padrão final de 2026-06-20

```txt
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
```

Branch:

```txt
baseline/mapas-mobile-padrao-2026-06-20
```

Uso:

- congelar a estrutura de `/mapa-familiar` e `/mapa-familiar-horizontal` como referência daquele momento;
- registrar `core` sem descendentes visuais e `descendants` como tela dos grupos descendentes;
- registrar Zoom horizontal por gerações;
- registrar matriz de swipe e conectores.

Atenção:

```txt
Esse documento é histórico e não contém sozinho todos os scripts adicionados na rodada de 2026-06-21.
Quando houver divergência, prevalecem código atual, MAPA_FAMILIAR_MOBILE.md, MAPA_FAMILIAR_MOBILE_ARQUITETURA.md e REGRAS_DE_NAO_REGRESSAO.md.
```

---

## 7. Histórico de ajustes mobile em 2026-06-21

Documento:

```txt
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md
```

Uso:

- registrar a rodada de correções visuais e funcionais em mobile;
- preservar a sequência de scripts adicionados;
- documentar Zoom 3x3 visual, mapa completo em mosaico, filtros de cônjuges, cônjuges estendidos e stability lock;
- servir como rastreabilidade, não como contrato canônico.

Scripts citados nessa rodada incluem:

```txt
mobileFamilyMapZoomOverviewVisualFix.ts
mobileFamilyMapDescendantsStabilityLock.ts
mobileFamilyMapExtendedSpouseCards.ts
mobileFamilyMapFilterButtonsBehaviorFix.ts
mobileFamilyMapFullOverview.ts
mobileFamilyMapFullOverviewMosaicFix.ts
```

Documentos canônicos atualizados devem prevalecer:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```

---

## 8. Histórico de exportação

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

---

## 9. Histórico de onboarding e IA

Históricos de onboarding, Mini Bio, Curiosidades e IA devem ser tratados com cuidado porque o fluxo mudou para etapas protegidas:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
```

Regras atuais:

- `/meus-dados` concentra dados pessoais, Mini Bio e Curiosidades com IA;
- `/meus-vinculos` concentra vínculos, pets e cônjuges;
- `/arquivos-historicos` ainda deve ser validado contra a frente de fatos sem arquivo antes de ser documentado como implementado;
- `/revisao-dados` deve ser conferido contra código atual antes de afirmar separação de Pets;
- Home/Curiosidades/IA não deve expor dados privados ou inventar fatos.

---

## 10. Como usar histórico em novas frentes

Antes de usar um arquivo histórico como base:

1. verificar se há documento canônico mais recente;
2. comparar com o código atual;
3. verificar se o arquivo histórico cita scripts não carregados;
4. verificar se a rota ainda existe;
5. verificar se a frente depende de migration já aplicada;
6. registrar no PR/commit qual documento prevalece.

Não copiar diretamente texto histórico para documentação vigente sem revisão.
