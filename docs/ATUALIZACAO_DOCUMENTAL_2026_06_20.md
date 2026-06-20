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
- QA pós-deploy.

---

## 2. Documentos criados

| Documento | Papel |
|---|---|
| `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` | contrato funcional detalhado dos mapas familiares mobile |
| `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` | checklist operacional pós-deploy para mapas mobile |
| `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` | arquitetura técnica dos mapas mobile e scripts auxiliares |
| `docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md` | histórico da rodada de implementação e ajustes |

---

## 3. Documentos revisados

| Documento | Revisão realizada |
|---|---|
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | reescrito e limpo para refletir as duas views oficiais, grade 3x3, overview/zoom e painel `+` |
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | revisado para incluir regras de scroll, tios, descendentes, overview, painel `+` e paletas |
| `docs/QA_MANUAL.md` | revisado com checklists específicos para grade 3x3, descendants, tios, overview e painel `+` |

---

## 4. Pontos canônicos por assunto

| Assunto | Documento principal |
|---|---|
| contrato geral das duas views | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| contrato mobile detalhado | `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` |
| arquitetura técnica mobile | `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` |
| QA manual geral | `docs/QA_MANUAL.md` |
| QA pós-deploy mobile | `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` |
| regras de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |
| histórico da rodada | `docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md` |

---

## 5. Pendências citadas na documentação

| ID | Tema |
|---|---|
| `MOB-001` | confirmar rolagem interna de `descendants` em iPhone/Safari |
| `MOB-002` | confirmar exibição dos cards em `paternal-uncles` com dados reais |
| `MOB-003` | avaliar consolidação dos scripts auxiliares mobile em React/hooks |
| `MOB-004` | confirmar mapeamento do overview horizontal por geração |
| `MOB-005` | confirmar overlay opaco do painel `+` em Safari/iOS |

---

## 6. Regra de leitura

Em caso de divergência:

1. código atual da `main` prevalece sobre histórico;
2. `MAPA_FAMILIAR_VIEW.md` prevalece como contrato geral das views;
3. `MAPA_FAMILIAR_MOBILE.md` prevalece sobre detalhes mobile;
4. `QA_MANUAL.md` e `QA_MAPAS_MOBILE_POS_DEPLOY.md` prevalecem para validação;
5. documentos em `docs/historico/` preservam contexto, não contrato vigente.
