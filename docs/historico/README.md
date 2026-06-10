# Histórico consolidado

> Última revisão: 2026-06-10
> Local canônico: `docs/historico/README.md`
> Tipo: consolidação histórica e índice da pasta `docs/historico/`.
> Status: resumo histórico consolidado atualizado com a frente Mapa Familiar e a coluna `genero`.

---

## 1. Objetivo

Esta pasta existe apenas para preservar rastreabilidade técnica e operacional do projeto **Árvore Família**.

O estado atual do produto não deve ser consultado nos históricos. A fonte de verdade fica nos documentos canônicos:

```txt
docs/README.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/arquitetura/
docs/funcionalidades/
docs/operacao/
```

Regra principal:

```txt
Se houver divergência entre este histórico consolidado e a documentação canônica atual, prevalece a documentação canônica atual.
```

---

## 2. Decisão documental desta revisão

Durante a revisão final da documentação, foi adotada a seguinte decisão para o grupo histórico:

```txt
Consolidar tudo em docs/historico/README.md e remover os arquivos históricos individuais.
```

Motivos:

- reduzir duplicidade documental;
- evitar que diagnósticos antigos sejam usados como documentação viva;
- manter apenas o que ajuda a entender decisões passadas;
- deslocar regras atuais para documentos canônicos;
- preservar QA e rastreabilidade sem manter vários arquivos obsoletos.

---

## 3. Arquivos históricos consolidados e removidos

Os conteúdos relevantes dos arquivos abaixo foram consolidados neste README ou já foram absorvidos pelos documentos canônicos atuais.

| Arquivo antigo | Decisão | Destino atual da informação útil |
|---|---|---|
| `DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | Removido após consolidação. | Revisão documental atual e `docs/PLANO_PROXIMOS_PASSOS.md`. |
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Removido após consolidação. | `docs/funcionalidades/EXPORTACAO_ARVORE.md` + resumo neste README. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | Removido após consolidação. | `docs/funcionalidades/EXPORTACAO_ARVORE.md` + resumo de QA neste README. |
| `QA_FINAL_MVP.md` | Removido após consolidação. | Critérios permanentes em `docs/PLANO_PROXIMOS_PASSOS.md` + checklist resumido neste README. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Removido após consolidação. | `docs/GUIA_UX_LAYOUT.md` + checklist resumido neste README. |
| `AJUSTES_MOBILE_2026-06-02.md` | Removido após consolidação. | `docs/GUIA_UX_LAYOUT.md`, documentos funcionais de árvore/calendário/fórum/admin + resumo neste README. |
| `documentacao-antiga/*` | Removido após consolidação. | Informação útil deve estar nos guias canônicos ou neste README. |
| `sql-legado/*` | Removido após consolidação. | `supabase/migrations/` permanece como fonte de verdade do schema; SQL operacional útil deve ficar em `scripts/` com aviso claro. |

---

## 4. Consolidação por frente histórica

### 4.1 Auditoria documental de 2026-05-21

O diagnóstico de documentação registrou uma auditoria anterior dos arquivos em `docs/` e apontou lacunas nos guias de componentes, UX, implementação, notificações, plano, exportação, responsividade, Storage e timeline.

Na revisão final atual, esses pontos foram tratados nos documentos canônicos correspondentes. Portanto, o diagnóstico antigo não deve continuar como arquivo separado.

Referências atuais:

```txt
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/PLANO_PROXIMOS_PASSOS.md
```

---

### 4.2 Frente 7.6 — exportação da área visível da árvore

A frente 7.6 foi concluída no escopo MVP com três etapas históricas:

| Etapa | Resumo |
|---|---|
| 7.6A | Diagnóstico técnico inicial da exportação. |
| 7.6B | Implementação da seleção/exportação de área visível. |
| 7.6C | QA técnico/visual e refinamentos pontuais. |

Estado consolidado:

```txt
A exportação atual permite selecionar uma área visível da árvore e gerar PNG, PDF ou impressão.
```

Limitação preservada:

```txt
A exportação atua sobre a viewport visível atual, não sobre a árvore completa.
```

Itens validados historicamente:

- botão **Selecionar área**;
- overlay de seleção retangular;
- cancelamento por botão;
- cancelamento por `Esc`;
- bloqueio temporário de pan/zoom;
- exportação PNG;
- exportação PDF;
- impressão;
- recusa de seleção pequena demais;
- limite preventivo para seleção grande;
- exclusão de controles, minimap, overlays, menus e legendas da captura;
- erro amigável para falhas de captura/impressão/CORS.

Documento canônico atual:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

### 4.3 QA final do MVP

O checklist histórico de QA final foi consolidado em regras permanentes e referências canônicas.

Escopo de validação relevante:

- árvore familiar;
- perfis de pessoa;
- administração de pessoas e relacionamentos;
- solicitações de vínculo;
- arquivos históricos e Storage;
- fórum;
- notificações;
- calendário familiar;
- timeline;
- favoritos;
- exportação;
- rotas e guards;
- responsividade mobile/tablet;
- admin.

Comandos técnicos mínimos preservados:

```bash
git status --short
git diff --check
npm run build
npm test
npm run test:e2e
supabase migration list
```

Critérios de bloqueio atuais ficam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

Rotas e guards ficam em:

```txt
docs/arquitetura/ROTAS_E_GUARDS.md
```

---

### 4.4 Responsividade mobile/tablet

A frente de responsividade mobile/tablet foi concluída no escopo MVP e não deve permanecer como guia vivo separado.

Critérios históricos preservados:

- não introduzir nova funcionalidade durante ajuste responsivo;
- não criar migration por ajuste visual;
- não alterar RLS/Edge Functions por responsividade;
- priorizar legibilidade, toque, ausência de overflow horizontal e uso real em telas pequenas;
- testar 320px, 375px, 390px, 430px, 768px e desktop;
- validar modais, overlays e formulários longos com altura reduzida.

Critérios globais de aceite preservados:

- sem overflow horizontal global;
- headers usáveis;
- botões acessíveis por toque;
- cards sem estouro de container;
- tabelas com scroll controlado;
- modais com altura máxima e rolagem;
- CTAs principais visíveis;
- árvore utilizável com pan/zoom;
- build aprovado após ajustes.

Documento canônico atual:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

### 4.5 Ajustes mobile do ciclo 2026-06-02

O ciclo de 2026-06-02 envolveu refinamentos em:

```txt
/minha-arvore
/genealogia
/visao-completa
/forum
/calendario-familiar
/meus-favoritos
/admin
/minha-arvore/editar
menu do avatar/header
```

Decisões úteis preservadas:

- manter ajustes mobile restritos a mobile quando esse for o escopo;
- validar árvore em 320px, 375px, 390px e 430px;
- manter setas de navegação mobile alinhadas aos controles visuais reais;
- preservar seletor mobile de visualização entre **Minha Árvore**, **Genealogia** e **Visão Completa**;
- evitar cards, filtros e botões duplicados em mobile;
- manter filtros compactos do calendário sem overflow;
- evitar duplicação visual entre filtros superiores e cards inferiores;
- preservar navegação mobile por avatar/menu quando esse padrão já estiver consolidado.

Documentos canônicos atuais:

```txt
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/funcionalidades/FORUM.md
docs/GUIA_COMPONENTES.md
```

---

### 4.6 Frente mobile final de 2026-06-08

A frente mobile final de 2026-06-08 consolidou ajustes visuais e de usabilidade apenas para mobile, preservando tablet/desktop.

Escopo histórico:

```txt
/minha-arvore
/genealogia
/visao-completa
/minha-arvore/editar
menu mobile do usuário
modal de login/dica
controles mobile da árvore
```

Itens concluídos:

- overlay do modal de login/dica com fundo da página e opacidade preta;
- header mobile da árvore com título personalizado **Família de {primeiro nome}**;
- remoção do texto overlay mobile sobre a árvore;
- padronização dos botões direcionais da árvore;
- possibilidade de ocultar/exibir setas mobile;
- painel mobile de controles da árvore via `MobileTreeControlsPortal`;
- controles mobile para zoom, reajuste, PDF, imagem e impressão;
- paleta de cores no menu mobile via `MobileUserMenuPalettePortal`;
- reset de geração ativa ao alternar `/genealogia` e `/visao-completa`;
- acabamento mobile de `/minha-arvore/editar` via `mobile-edit-profile.css`;
- escopo do CSS de edição restrito por `main:has(#minha-arvore-edit-form)`.

Arquivos relevantes:

```txt
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/styles/family-tree-mobile.css
src/main.tsx
```

Validações técnicas registradas no ciclo:

```bash
npm run build
git diff --check
```

Documentos canônicos atualizados ou a atualizar:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/GUIA_IMPLEMENTACOES.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/funcionalidades/MINHA_ARVORE_EDITAR.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 5. Documentação antiga e SQL legado removidos

As antigas pastas abaixo foram removidas após consolidação:

```txt
docs/historico/documentacao-antiga/
docs/historico/sql-legado/
```

Esses conteúdos não devem ser recriados como fonte operacional. Se algum conteúdo antigo ainda for necessário, ele deve ser migrado para o documento canônico adequado ou para um script operacional seguro.

Destinos canônicos:

| Conteúdo antigo | Destino atual |
|---|---|
| Índice de documentação | `docs/README.md` |
| Setup/deploy | `docs/operacao/DEPLOYMENT.md` |
| Banco/migrations | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Erros e soluções | `docs/GUIA_CORRECAO_ERROS.md` |
| Arquitetura | `docs/arquitetura/ARCHITECTURE.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Usuários e banco | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Funcionalidades específicas | `docs/funcionalidades/*.md` |
| SQL operacional pontual ainda útil | `scripts/`, com aviso, dry-run quando aplicável e confirmação explícita para ação destrutiva |
| Schema real do banco | `supabase/migrations/` |

---

## 6. Estrutura histórica esperada

Após a revisão e os commits documentais, a estrutura histórica esperada é:

```txt
docs/historico/README.md
```

Não devem existir novamente, salvo decisão explícita futura:

```txt
docs/historico/documentacao-antiga/
docs/historico/sql-legado/
docs/historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md
docs/historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
docs/historico/QA_FINAL_MVP.md
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
docs/historico/AJUSTES_MOBILE_2026-06-02.md
```

---

## 7. O que não fazer

Não fazer:

- usar documento histórico como guia atual;
- manter diagnóstico antigo como fonte de verdade;
- duplicar QA antigo nos documentos funcionais;
- recriar arquivos históricos individuais sem necessidade explícita;
- recriar `documentacao-antiga/` ou `sql-legado/` como arquivo morto;
- aplicar SQL legado como schema principal;
- remover conteúdo histórico futuro sem checar se há conteúdo único ainda não migrado;
- manter backups temporários dentro de `docs/historico/`;
- documentar nova pendência em histórico em vez de usar `docs/PLANO_PROXIMOS_PASSOS.md`.

---

## 8. O que fazer daqui em diante

Fazer:

- manter este arquivo como único histórico consolidado;
- registrar novas pendências em `docs/PLANO_PROXIMOS_PASSOS.md`;
- registrar estado implementado em `docs/GUIA_IMPLEMENTACOES.md`;
- registrar troubleshooting em `docs/GUIA_CORRECAO_ERROS.md`;
- registrar decisões visuais em `docs/GUIA_UX_LAYOUT.md`;
- registrar operação em `docs/operacao/`;
- revisar `docs/README.md` quando a estrutura documental mudar.

---

## 9. Resumo executivo

A pasta `docs/historico/` passa a ter função de rastreabilidade consolidada, não de documentação viva.

Depois desta revisão, a estrutura recomendada é:

```txt
docs/historico/README.md
```

### 4.7 Frente Mapa Familiar de 2026-06-10

A frente **Mapa Familiar** adicionou uma quarta visualização protegida da árvore:

```txt
/mapa-familiar
```

Escopo histórico:

- criação da rota protegida `/mapa-familiar`;
- criação/uso de `TreeViewMode = 'mapa-familiar'`;
- renderização desktop/tablet com `DesktopFamilyMapView.tsx`;
- fallback mobile para `MobileFamilyTreeView.tsx`;
- cards compartilhados em `FamilyTreeVisualCards.tsx`;
- paleta `visual`;
- layout panorâmico com HTML/CSS/SVG;
- conectores por âncoras;
- grupos expansíveis;
- regras de cônjuges principais, ancestrais e colaterais;
- zoom manual por `Ctrl + scroll`;
- uso de `pessoas.genero` para avatar masculino, feminino e pet.

Decisão documental:

```txt
O estado atual do Mapa Familiar deve ficar em docs/funcionalidades/MAPA_FAMILIAR_VIEW.md.
Este histórico registra apenas a origem da frente.
```

Pendências relacionadas:

- QA visual autenticado em desktop/tablet;
- refinamento de grupos laterais de tios/primos;
- busca/favoritos;
- decisão sobre exportação HTML/SVG;
- migration/tipagem para `pessoas.genero`, se a coluna foi criada manualmente.
