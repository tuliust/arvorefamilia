# Histórico consolidado

> Última revisão: 2026-06-08  
> Local canônico: `docs/historico/README.md`  
> Tipo: consolidação histórica e índice da pasta `docs/historico/`.  
> Status: substitui os documentos históricos individuais preservados anteriormente nesta pasta.

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
Consolidar tudo em docs/historico/README.md e depois remover os arquivos históricos individuais.
```

Motivos:

- reduzir duplicidade documental;
- evitar que diagnósticos antigos sejam usados como documentação viva;
- manter apenas o que ajuda a entender decisões passadas;
- deslocar regras atuais para documentos canônicos;
- preservar QA e rastreabilidade sem manter vários arquivos obsoletos.

---

## 3. Arquivos históricos consolidados

Os conteúdos relevantes dos arquivos abaixo foram consolidados neste README ou já foram absorvidos pelos documentos canônicos atuais.

| Arquivo antigo | Decisão | Destino atual da informação útil |
|---|---|---|
| `DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | Remover após consolidação. | Revisão documental atual e `docs/PLANO_PROXIMOS_PASSOS.md`. |
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Remover após consolidação. | `docs/funcionalidades/EXPORTACAO_ARVORE.md` + resumo neste README. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | Remover após consolidação. | `docs/funcionalidades/EXPORTACAO_ARVORE.md` + resumo de QA neste README. |
| `QA_FINAL_MVP.md` | Remover após consolidação. | Critérios permanentes em `docs/PLANO_PROXIMOS_PASSOS.md` + checklist resumido neste README. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Remover após consolidação. | `docs/GUIA_UX_LAYOUT.md` + checklist resumido neste README. |
| `AJUSTES_MOBILE_2026-06-02.md` | Remover após consolidação. | `docs/GUIA_UX_LAYOUT.md`, documentos funcionais de árvore/calendário/fórum/admin + resumo neste README. |
| `documentacao-antiga/*` | Remover após checagem final. | Informação útil deve estar nos guias canônicos ou neste README. |

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

## 5. Documentação antiga

A antiga pasta:

```txt
docs/historico/documentacao-antiga/
```

foi classificada como arquivo morto. Documentos antigos dessa pasta não devem ser usados como fonte atual de banco, rotas, migrations, erros, irmãos, setup ou arquitetura.

Regra:

```txt
Se algum conteúdo ainda for útil, migrar para o documento canônico adequado antes de remover o arquivo antigo.
```

Possíveis documentos antigos que podem ser removidos após consolidação:

```txt
INDICE-DOCUMENTACAO.md
README-DOCUMENTACAO.md
MIGRATION-GUIDE.md
SETUP-BANCO-DADOS.md
RESPOSTA-RAPIDA-IRMAOS.md
COMO-FUNCIONA-IRMAOS.md
RELATORIO-DIAGNOSTICO-COMPLETO.md
ERROS-E-SOLUCOES.md
```

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

---

## 6. Arquivos que podem ser removidos após substituição manual

Depois que este README consolidado for salvo em `docs/historico/README.md`, os arquivos abaixo podem ser removidos do repositório, desde que não haja mudança local não revisada:

```bash
git rm docs/historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md
git rm docs/historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
git rm docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
git rm docs/historico/QA_FINAL_MVP.md
git rm docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
git rm docs/historico/AJUSTES_MOBILE_2026-06-02.md
```

Para a documentação antiga:

```bash
git rm -r docs/historico/documentacao-antiga
```

Executar apenas depois de confirmar que nenhum arquivo útil ficou fora dos documentos canônicos.

---

## 7. O que não fazer

Não fazer:

- usar documento histórico como guia atual;
- manter diagnóstico antigo como fonte de verdade;
- duplicar QA antigo nos documentos funcionais;
- remover arquivos históricos antes de substituir este README consolidado;
- remover SQL ou documentação antiga sem checar se há conteúdo único ainda não migrado;
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
- revisar `docs/README.md` por último para refletir a nova estrutura.

---

## 9. Resumo executivo

A pasta `docs/historico/` passa a ter função de rastreabilidade consolidada, não de documentação viva.

Depois desta revisão, a estrutura recomendada é:

```txt
docs/historico/README.md
```

como único arquivo histórico consolidado.

Os arquivos históricos individuais podem ser removidos depois da substituição manual, pois seus pontos úteis foram absorvidos nos guias canônicos ou resumidos neste arquivo.
