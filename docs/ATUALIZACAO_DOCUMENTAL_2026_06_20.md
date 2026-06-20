# Atualização documental — mapas familiares mobile — 2026-06-20

> Local: `docs/ATUALIZACAO_DOCUMENTAL_2026_06_20.md`  
> Tipo: índice de atualização documental  
> Status: atualizado após salvar a estrutura atual como baseline padrão.

---

## 1. Objetivo

Registrar quais documentos foram atualizados, revisados ou criados após a rodada de ajustes nos mapas familiares mobile.

Escopo principal:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Temas cobertos:

- grade mobile 3x3;
- tela `core` sem descendentes duplicados;
- tela `descendants` como dona dos grupos descendentes;
- telas `paternal-uncles` e `maternal-uncles`;
- inferência de tios por vínculos diretos;
- navegação direcional das 9 telas;
- títulos e largura/altura de grupos;
- conectores;
- remoção da linha vertical central abaixo da pessoa principal;
- remoção das linhas verticais acima dos tios;
- scroll interno;
- Zoom 3x3 em `/mapa-familiar`;
- Zoom por gerações em `/mapa-familiar-horizontal`;
- painéis `Formato`, `Cor`, `Filtros` e botão `+`;
- performance de observers;
- QA pós-deploy;
- baseline e histórico da rodada;
- auditoria do código atual para separar implementação ativa, arquivo existente não carregado e comportamento ainda dependente de QA visual.

---

## 2. Baseline final criada

Branch preservada:

```txt
baseline/mapas-mobile-padrao-2026-06-20
```

Documento principal da baseline:

```txt
docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md
```

Uso:

- comparação visual;
- validação de não regressão;
- referência para rollback controlado;
- ponto de congelamento do padrão atual das duas páginas mobile.

---

## 3. Documentos criados nesta rodada

| Documento | Papel |
|---|---|
| `docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md` | preserva o estado imediatamente anterior à correção consolidada |
| `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md` | registra modelo de tios, script consolidado, redução de scripts concorrentes e QA recomendado |
| `docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md` | salva a estrutura atual das duas páginas como padrão de não regressão |
| `docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md` | complemento operacional de não regressão específico dos mapas mobile |

---

## 4. Documentos revisados e complementados

| Documento | Revisão realizada |
|---|---|
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` | atualizado como contrato canônico do estado vigente: core sem descendentes, descendants com grupos, Zoom horizontal por gerações, scripts carregados e matriz 3x3 |
| `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` | atualizado para refletir `mobileFamilyHorizontalZoomOverview.ts`, `mobileFamilyMapStableMobileFix.ts`, `mobileFamilyMapDirectionalNavigationFix.ts` e `mobileFamilyMapCoreConnectorFix.ts` |
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md` | atualizado para listar scripts carregados, scripts substituídos, tios diretos, guard direcional e conector central removido |
| `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` | atualizado com checklist operacional para baseline, core sem duplicação, descendants, Zoom horizontal por gerações e matriz direcional |
| `docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md` | atualizado para tratar a baseline final como padrão operacional |
| `docs/historico/README.md` | deve ser mantido como índice histórico e apontar para baseline/ajustes consolidados quando necessário |

---

## 5. Pontos canônicos por assunto

| Assunto | Documento principal |
|---|---|
| contrato geral das duas views | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| contrato mobile detalhado | `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` |
| auditoria do código atual mobile | `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md` |
| arquitetura técnica mobile | `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` |
| QA manual geral | `docs/QA_MANUAL.md` |
| QA pós-deploy mobile | `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` |
| não regressão geral | `docs/REGRAS_DE_NAO_REGRESSAO.md` |
| não regressão específica mobile | `docs/operacao/NAO_REGRESSAO_MAPAS_MOBILE.md` |
| baseline padrão final | `docs/historico/BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md` |
| histórico da rodada consolidada | `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_STABLE_FIX.md` |
| baseline antes da correção consolidada | `docs/historico/BASELINE_MAPA_FAMILIAR_MOBILE_2026_06_20_1631.md` |
| rollback e ajustes pós-restauração | `docs/historico/ROLLBACK_E_AJUSTES_POS_RESTAURACAO_2026_06_20.md` |

---

## 6. Implementações documentadas como vigentes

Arquivos ativos carregados no `index.html` como contrato mobile recente:

```txt
src/mobileFamilyHorizontalZoomOverview.ts
src/mobileFamilyMapStableMobileFix.ts
src/mobileFamilyMapDirectionalNavigationFix.ts
src/mobileFamilyMapCoreConnectorFix.ts
```

Comportamento documentado:

- `mobileFamilyHorizontalZoomOverview.ts`: Zoom específico da página horizontal por gerações;
- `mobileFamilyMapStableMobileFix.ts`: tela `descendants`, estabilidade de scroll/transform, tios compactos, primos, painéis compactos e Zoom 3x3;
- `mobileFamilyMapDirectionalNavigationFix.ts`: matriz de direções permitidas/bloqueadas das 9 telas;
- `mobileFamilyMapCoreConnectorFix.ts`: remoção da linha vertical central, ocultação de linhas acima de tios e ocultação de descendentes duplicados no `core`.

---

## 7. Arquivos legados ou substituídos

Os arquivos abaixo não devem ser usados como contrato vigente se não estiverem carregados em `index.html`:

```txt
src/mobileFamilyTreeViewportContentFix.ts
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeZoomOverviewFix.ts
src/mobileFamilyTreeOverviewMode.ts
src/mobileFamilyTreeOverviewFixes.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/mobileFamilyMapMicroLayoutFix.ts
src/mobileFamilyMapOverviewNavigationBridge.ts
```

---

## 8. Pendências citadas na documentação

IDs `MOB-*` já existem em backlog geral. Para novas pendências específicas dos mapas mobile, preferir `MAP-MOB-*` quando a frente ainda não estiver registrada no `PLANO_PROXIMOS_PASSOS.md`.

| ID | Tema |
|---|---|
| `MAP-MOB-001` | confirmar rolagem interna de `descendants` em iPhone/Safari |
| `MAP-MOB-002` | confirmar exibição dos cards em `paternal-uncles` com dados reais |
| `MAP-MOB-003` | confirmar bloqueio de direções proibidas nas 9 telas |
| `MAP-MOB-004` | confirmar Zoom horizontal por gerações em Safari/iOS após cache limpo |
| `MAP-MOB-005` | confirmar overlay opaco do painel `+` em Safari/iOS |
| `MAP-MOB-006` | confirmar conectores, ausência da linha central abaixo da pessoa principal e ausência de linhas acima dos tios |
| `MAP-MOB-007` | avaliar migração futura dos scripts DOM consolidados para React/hooks |
| `MOB-ZOOM` | confirmar que o Zoom abre, fecha, navega e não trava swipe/bottom nav |

---

## 9. Regra de leitura

Em caso de divergência:

1. código atual da `main` prevalece sobre histórico;
2. `MAPA_FAMILIAR_VIEW.md` prevalece como contrato geral das views;
3. `MAPA_FAMILIAR_MOBILE.md` prevalece sobre detalhes mobile;
4. `MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md` prevalece para dizer o que está carregado/importado hoje;
5. `QA_MANUAL.md` e `QA_MAPAS_MOBILE_POS_DEPLOY.md` prevalecem para validação;
6. `NAO_REGRESSAO_MAPAS_MOBILE.md` complementa as regras gerais de não regressão para a frente mobile;
7. `BASELINE_MAPAS_FAMILIARES_MOBILE_PADRAO_2026_06_20.md` preserva a referência visual/operacional atual;
8. documentos em `docs/historico/` preservam contexto, não contrato vigente;
9. branches/commits de refatoração revertida não devem ser usados como base sem nova validação visual e build.

---

## 10. Observação operacional

Nesta atualização documental feita via GitHub connector, não foram executados localmente:

```bash
npm run build
npm test
npm run test:e2e
```

Validação final de comportamento mobile continua dependendo de deploy Vercel `Ready` e teste manual em Safari/iOS.
