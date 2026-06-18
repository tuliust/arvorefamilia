# Histórico consolidado

> Última revisão: 2026-06-14
> Local recomendado: `docs/historico/README.md`
> Tipo: índice e consolidação histórica.
> Status: atualizado após a definição da baseline atual, com índice explícito para rotas removidas, SQLs legados e duas views oficiais: `/mapa-familiar` e `/mapa-familiar-horizontal`.

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

O documento preventivo principal para rotas antigas é:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

Ele deve ser usado antes de interpretar ocorrências de `/minha-arvore`, `/genealogia` ou `/visao-completa` em buscas de código ou documentação.

Os documentos abaixo foram arquivados como legado e não devem permanecer em `docs/funcionalidades/` como guias canônicos:

| Documento histórico | Origem | Motivo |
|---|---|---|
| `docs/historico/ROTAS_REMOVIDAS.md` | frente documental atual | resume substituições, exceção `/minha-arvore/editar` e anti-regressões de rotas removidas |
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
docs/historico/ROTAS_REMOVIDAS.md
```

### 4.2 Antiga Genealogia

A antiga `/genealogia` organizava pessoas por gerações em ReactFlow.

Status atual:

- rota removida;
- linguagem genealógica permanece apenas como conceito visual da horizontal atual;
- horizontal atual é `/mapa-familiar-horizontal`;
- título atual: `Mapa Genealógico de {primeiroNome}`.

Documento histórico:

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

Documento histórico relacionado:

```txt
docs/historico/GENEALOGIA_VIEW.md
docs/historico/ROTAS_REMOVIDAS.md
```

---

## 5. Histórico de filtros, pets e avatares

A documentação antiga de filtros e pets continha regras ainda úteis, mas misturadas à view removida `/minha-arvore`.

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
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
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
- normalização de SVGs;
- preservação de conectores, paletas e avatares.

Documento atual:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 7. Histórico de painel

O painel antigo usava a barra:

```txt
Filtros | Legendas | Ações
```

Esse padrão não é UI vigente.

Estado atual:

- desktop tem painel completo;
- mobile tem modal específico de controles;
- a barra `Filtros | Legendas | Ações` não deve voltar;
- `SidebarPanelTabs.tsx` mantém nome histórico, mas não deve ser entendido como contrato de abas;
- cards do painel desktop devem seguir o visual/gradiente da paleta ativa.

Contrato atual resumido:

| Ambiente | Controles |
|---|---|
| Desktop | Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar, Destacar, Grupos/Filtros |
| Mobile | Vertical, Horizontal, Cores, Grupos, Destacar, Filtros |
| Mobile não deve ter | Zoom, Restaurar, Exportar |

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
- título atual: `Árvore Familiar de {primeiroNome}`;
- exportação HTML/CSS/SVG;
- conectores SVG no desktop;
- conectores HTML/CSS no mobile;
- filtros de grupos/status;
- regras de cônjuges;
- suporte a núcleos conjugais adicionais;
- paletas;
- bordas mobile alinhadas ao desktop;
- cards mobile sem `Nascimento não informado`;
- destaques.

### 8.2 Horizontal

`/mapa-familiar-horizontal` consolidou-se como alternativa horizontal/genealógica.

Características atuais:

- desktop/tablet usa `DesktopFamilyHorizontalMapView`;
- mobile usa `MobileFamilyHorizontalMapView`;
- título atual: `Mapa Genealógico de {primeiroNome}`;
- uma geração por tela no mobile;
- botões `Ger 1`, `Ger 2`, `Ger 3` etc.;
- swipe lateral;
- scroll vertical até cards e conectores visíveis;
- exportação HTML/CSS/SVG;
- cônjuges de pais/Geração 4 na horizontal permanecem pendência `TREE-003` até código incluir esse grupo;
- desktop é referência de hierarquia, conectores e paletas.

Documento atual:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
```

---

## 9. Histórico do calendário mobile

O calendário familiar consolidou filtros compactos mobile.

Estado atual:

- cinco categorias em uma única linha;
- bolinha colorida acima do título;
- título em uma linha;
- sem overflow horizontal;
- card grande de categorias oculto no mobile quando duplicar os filtros compactos.

Documento atual:

```txt
docs/funcionalidades/CALENDARIO_FAMILIAR.md
```

---

## 10. SQLs legados e docs antigos de banco

O documento preventivo principal para SQL solto, dump, diagnóstico antigo ou documento de banco fora de migrations é:

```txt
docs/historico/SQLS_LEGADOS.md
```

Status atual:

- `supabase/migrations/` é a fonte da verdade do schema;
- SQLs soltos podem existir como histórico, diagnóstico ou operação pontual;
- SQL solto não deve ser usado para montar ambiente novo;
- dump com dados reais não deve ser versionado.

Arquivos classificados como legado/preventivo quando existirem no repositório:

```txt
supabase/forum-schema.sql
supabase/google-calendar-schema.sql
database-schema.sql
supabase_schema.sql
supabase_data.sql
diagnostico-*.sql
verificar-*.sql
```

Documento operacional atual:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## 11. Debug temporário documentado

A frente atual prevê ou documenta o debug temporário:

```txt
Visualizar como...
```

Finalidade:

- renderizar `/mapa-familiar` e `/mapa-familiar-horizontal` a partir da visualização de outra pessoa da tabela `pessoas`;
- testar árvore, conectores, paletas e filtros com diferentes pessoas centrais;
- não criar rota nova;
- não substituir autenticação, vínculo real ou permissão;
- ser removido, protegido por flag/admin ou mantido apenas em ambiente controlado conforme decisão futura.

O controle desse item deve ficar em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 12. Itens históricos que não devem voltar

Não restaurar como produto ativo:

```txt
/minha-arvore
/genealogia
/visao-completa
/mapa-horizontal
/visao-completa-teste
```

Referência preventiva:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

Não restaurar:

- `/` redirecionando para `/minha-arvore`;
- favoritos para rotas removidas;
- busca global para rotas removidas;
- botão Horizontal apontando para `/visao-completa`;
- horizontal mobile com barra `Paterno | Central | Materno`;
- tabs antigas `Filtros | Legendas | Ações`;
- docs canônicos tratando rotas antigas como ativas;
- paletas mobile próprias que divergem do desktop;
- avatares por gênero como regra visual obrigatória;
- SQL legado como fonte principal de schema.

---

## 13. Regra de manutenção histórica

Ao concluir uma frente nova:

1. atualizar documento canônico;
2. atualizar baseline se o comportamento estrutural mudar;
3. mover pendências reais para `PLANO_PROXIMOS_PASSOS.md`;
4. registrar resumo aqui apenas se houver valor histórico;
5. não recriar documentação histórica como fonte de implementação;
6. não tratar SQL histórico como migration oficial.

---

## 14. Validação documental

Antes de fechar commit de documentação:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" README.md docs
rg "database-schema\.sql|supabase_schema\.sql|supabase_data\.sql|forum-schema\.sql|google-calendar-schema\.sql" README.md docs supabase scripts src
```

Critério:

- ocorrências em `docs/historico/` são permitidas se marcadas como legado;
- ocorrências em `docs/historico/ROTAS_REMOVIDAS.md` são esperadas e preventivas;
- ocorrências em `docs/historico/SQLS_LEGADOS.md` são esperadas e preventivas;
- `/minha-arvore/editar` é permitido como rota vigente;
- docs canônicos não devem apresentar rotas removidas como views ativas;
- docs canônicos não devem afirmar que a barra `Filtros | Legendas | Ações` é UI vigente;
- docs operacionais devem apontar `supabase/migrations/` como fonte da verdade do schema.

<!-- HISTORICO-LEVANTAMENTO-2026-06-18 -->
## Levantamento de ajustes nÃ£o documentados â€” 2026-06-18

O arquivo `levantamento_ajustes_onboarding_membro(1).md` foi usado como fonte de auditoria para separar:

- implementaÃ§Ãµes confirmadas;
- pendÃªncias;
- scripts planejados;
- tentativas falhas;
- decisÃµes conflitantes;
- itens que exigem confirmaÃ§Ã£o no Git.

Este diretÃ³rio deve receber apenas material histÃ³rico, substituÃ­do ou de rastreabilidade. Contratos vigentes devem permanecer nos documentos funcionais, guias, baseline, QA e regras de nÃ£o regressÃ£o.
