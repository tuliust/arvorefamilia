# Histórico consolidado

> Última revisão: 2026-06-13  
> Local recomendado: `docs/historico/README.md`  
> Tipo: índice e consolidação histórica.  
> Status: atualizado após a definição da baseline atual com duas views oficiais: `/mapa-familiar` e `/mapa-familiar-horizontal`.

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
```

Regra:

```txt
Se houver divergência entre histórico e documentação canônica atual, prevalece a documentação canônica atual.
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

---

## 3. Documentos históricos de views antigas

Os documentos abaixo foram arquivados como legado e não devem permanecer em `docs/funcionalidades/` como guias canônicos:

| Documento histórico | Origem | Motivo |
|---|---|---|
| `docs/historico/MINHA_ARVORE_VIEW.md` | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` | `/minha-arvore` não é view ativa |
| `docs/historico/GENEALOGIA_VIEW.md` | `docs/funcionalidades/GENEALOGIA_VIEW.md` | `/genealogia` e `/visao-completa` não são views ativas |
| `docs/historico/MINHA_ARVORE_FILTROS_E_PETS.md` | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | regras vigentes foram extraídas para docs atuais |

Após mover esses arquivos para histórico, recomenda-se remover as versões antigas de:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

ou substituí-las por stubs mínimos apontando para `docs/historico/`, conforme a política do projeto.

---

## 4. Histórico resumido das views

### 4.1 Antiga Minha Árvore

A antiga `/minha-arvore` era uma view direta baseada em ReactFlow no desktop/tablet e `MobileFamilyTreeView` no mobile.

Status atual:

- rota removida como view ativa;
- comportamento principal substituído por `/mapa-familiar`;
- mobile segmentado permanece útil em `/mapa-familiar` mobile;
- `/minha-arvore/editar` continua vigente como edição.

Documento histórico:

```txt
docs/historico/MINHA_ARVORE_VIEW.md
```

### 4.2 Antiga Genealogia

A antiga `/genealogia` organizava pessoas por gerações em ReactFlow.

Status atual:

- rota removida;
- título “Genealogia” permanece apenas como conceito visual da horizontal;
- horizontal atual é `/mapa-familiar-horizontal`.

Documento histórico:

```txt
docs/historico/GENEALOGIA_VIEW.md
```

### 4.3 Antiga Visão Completa

A antiga `/visao-completa` era uma variação ampliada/completa da visão genealógica.

Status atual:

- rota removida;
- não deve ser usada como fallback da horizontal;
- código ReactFlow remanescente deve ser tratado como legado técnico.

Documento histórico relacionado:

```txt
docs/historico/GENEALOGIA_VIEW.md
```

---

## 5. Histórico de filtros e pets

A documentação antiga de filtros e pets continha regras ainda úteis, mas misturadas à view removida `/minha-arvore`.

Regras preservadas nos docs atuais:

- separação entre `personFilters` e `directRelativeFilters`;
- pets por `humano_ou_pet === 'Pet'`;
- avatar visual por `genero`;
- cônjuges sempre visíveis versus filtráveis;
- contagens efetivas por view;
- filtros não alteram dados.

Documento histórico:

```txt
docs/historico/MINHA_ARVORE_FILTROS_E_PETS.md
```

Documentos atuais:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
```

---

## 6. Histórico de exportação

A frente de exportação consolidou:

- seleção por área;
- PNG;
- PDF;
- impressão;
- loading;
- título no canvas;
- exclusão de painel/header/bottom nav;
- normalização de SVGs.

Documento atual:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 7. Histórico de painel

O painel atual ainda contém:

```txt
Filtros
Legendas
Ações
```

Isso deve ser tratado como estado atual com dívida conhecida.

Próxima frente:

- remover barra de abas;
- manter filtros/grupos visíveis diretamente;
- preservar controles superiores:
  - Zoom;
  - Restaurar;
  - Vertical;
  - Horizontal;
  - Cores;
  - Exportar;
  - Destacar.

Documento atual:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

---

## 8. Histórico de Mapa Familiar

### 8.1 Vertical

`/mapa-familiar` consolidou-se como view principal/default.

Características atuais:

- desktop/tablet usa `DesktopFamilyMapView`;
- mobile usa `MobileFamilyTreeView`;
- exportação HTML/CSS/SVG;
- conectores SVG;
- filtros de grupos/status;
- regras de cônjuges;
- paletas;
- destaques.

### 8.2 Horizontal

`/mapa-familiar-horizontal` consolidou-se como alternativa horizontal/genealógica.

Características atuais:

- desktop/tablet usa `DesktopFamilyHorizontalMapView`;
- mobile usa `MobileFamilyHorizontalMapView`;
- uma geração por tela no mobile;
- chips de geração;
- swipe lateral;
- exportação HTML/CSS/SVG.

Documento atual:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

## 9. Itens históricos que não devem voltar

Não restaurar como produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
/mapa-horizontal
/visao-completa-teste
```

Não restaurar:

- `/` redirecionando para `/minha-arvore`;
- favoritos para rotas removidas;
- busca global para rotas removidas;
- botão Horizontal apontando para `/visao-completa`;
- horizontal mobile com barra `Paterno | Central | Materno`;
- docs canônicos tratando rotas antigas como ativas.

---

## 10. Regra de manutenção histórica

Ao concluir uma frente nova:

1. atualizar documento canônico;
2. atualizar baseline se o comportamento estrutural mudar;
3. mover pendências reais para `PLANO_PROXIMOS_PASSOS.md`;
4. registrar resumo aqui apenas se houver valor histórico;
5. não recriar documentação histórica como fonte de implementação.

---

## 11. Validação documental

Antes de fechar commit de documentação:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" README.md docs
```

Critério:

- ocorrências em `docs/historico/` são permitidas se marcadas como legado;
- `/minha-arvore/editar` é permitido como rota vigente;
- docs canônicos não devem apresentar rotas removidas como views ativas.
