# Atualização documental — mapas familiares mobile — 2026-06-20

> Local: `docs/ATUALIZACAO_DOCUMENTAL_2026_06_20.md`  
> Tipo: índice de atualização documental  
> Status: complemento ao `docs/README.md`.

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
- tela `descendants`;
- telas `paternal-uncles` e `maternal-uncles`;
- títulos e largura de grupos;
- conectores;
- scroll interno;
- Zoom/overview com 9 cards;
- painel `+`;
- performance de observers;
- QA pós-deploy;
- rollback da refatoração ampla e restauração da `main` a partir da versão estável `52ee451`;
- auditoria do código atual para separar implementação ativa, arquivo existente não carregado e comportamento ainda dependente de QA visual.

---

## 2. Documentos criados

| Documento | Papel |
|---|---|
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` | contrato funcional detalhado dos mapas familiares mobile |
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md` | auditoria do código atual, scripts carregados, scripts não carregados, riscos e pendências sem conflito de IDs |
| `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` | checklist operacional pós-deploy para mapas mobile |
| `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` | arquitetura técnica dos mapas mobile e scripts auxiliares |
| `docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md` | histórico da rodada de implementação e ajustes |
| `docs/historico/ROLLBACK_E_AJUSTES_POS_RESTAURACAO_2026_06_20.md` | histórico específico do rollback, restauração da `main`, branch estável e ajustes pós-restauração |

---

## 3. Documentos revisados

| Documento | Revisão realizada |
|---|---|
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | revisado contra o código atual para diferenciar componente React, scripts auxiliares, overview ativo e arquivo existente não carregado |
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` | revisado contra o código atual da `main`, com aviso sobre refatorações revertidas e QA aberto de conectores |
| `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` | revisado para refletir scripts auxiliares carregados em `index.html`, ajuste importado em `main.tsx` e risco de lógica DOM fora do React |
| `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` | revisado com checklists específicos para grade 3x3, descendants, tios, overview, painel `+` e conferência de deployment correto |
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | revisado para incluir regras de scroll, tios, descendentes, overview, painel `+` e paletas |
| `docs/QA_MANUAL.md` | revisado com checklists específicos para grade 3x3, descendants, tios, overview e painel `+` |

---

## 4. Pontos canônicos por assunto

| Assunto | Documento principal |
|---|---|
| contrato geral das duas views | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| contrato mobile detalhado | `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` |
| auditoria do código atual mobile | `docs/funcionalidades/MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md` |
| arquitetura técnica mobile | `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` |
| QA manual geral | `docs/QA_MANUAL.md` |
| QA pós-deploy mobile | `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` |
| regras de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |
| histórico da rodada | `docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md` |
| rollback e ajustes pós-restauração | `docs/historico/ROLLBACK_E_AJUSTES_POS_RESTAURACAO_2026_06_20.md` |

---

## 5. Pendências citadas na documentação

IDs `MOB-*` já existem no backlog geral. Para novas pendências específicas dos mapas mobile, preferir `MAP-MOB-*` quando a frente ainda não estiver registrada no `PLANO_PROXIMOS_PASSOS.md`.

| ID | Tema |
|---|---|
| `MOB-001` | confirmar rolagem interna de `descendants` em iPhone/Safari |
| `MOB-002` | confirmar exibição dos cards em `paternal-uncles` com dados reais |
| `MOB-003` | avaliar consolidação dos scripts auxiliares mobile em React/hooks |
| `MOB-004` | confirmar mapeamento do overview horizontal por geração |
| `MOB-005` | confirmar overlay opaco do painel `+` em Safari/iOS |
| `MOB-006` | confirmar conectores verticais abaixo de `Avós paternos` e `Avós maternos` após ajuste vigente |
| `MOB-007` | confirmar conectores internos da tela `descendants`, especialmente espessura e encaixe no topo dos grupos |
| `MOB-ZOOM` | confirmar que o Zoom abre, fecha, navega por grupo e não trava swipe/bottom nav |
| `MAP-MOB-006` | decidir se `mobileFamilyMapOverviewNavigationBridge.ts`, existente mas não carregado no `index.html`, deve ser removido, carregado ou mantido como legado inativo |

---

## 6. Regra de leitura

Em caso de divergência:

1. código atual da `main` prevalece sobre histórico;
2. `MAPA_FAMILIAR_VIEW.md` prevalece como contrato geral das views;
3. `MAPA_FAMILIAR_MOBILE.md` prevalece sobre detalhes mobile;
4. `MAPA_FAMILIAR_MOBILE_AUDITORIA_CODIGO_ATUAL.md` prevalece para dizer o que está carregado/importado hoje;
5. `QA_MANUAL.md` e `QA_MAPAS_MOBILE_POS_DEPLOY.md` prevalecem para validação;
6. documentos em `docs/historico/` preservam contexto, não contrato vigente;
7. branches/commits de refatoração revertida não devem ser usados como base sem nova validação visual e build.
