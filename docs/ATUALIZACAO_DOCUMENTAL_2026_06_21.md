# Atualização documental — 2026-06-21

> Última revisão: 2026-06-21  
> Local: `docs/ATUALIZACAO_DOCUMENTAL_2026_06_21.md`  
> Escopo: consolidação documental dos ajustes realizados nos mapas familiares mobile durante a rodada do chat.  
> Status: manifesto documental.

---

## 1. Objetivo

Registrar quais documentos foram criados ou atualizados para refletir os ajustes recentes em:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

A rodada cobriu tios, conectores, Zoom, filtros mobile, cônjuges estendidos e mapa completo em tela única.

---

## 2. Documentos atualizados ou criados

| Documento | Tipo | Papel |
|---|---|---|
| `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` | canônico técnico | Atualiza arquitetura vigente dos mapas mobile, scripts carregados, Zoom, cônjuges e mapa completo. |
| `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md` | histórico técnico | Resgata a sequência de ajustes realizados na rodada. |
| `docs/operacao/QA_MAPAS_MOBILE_2026_06_21.md` | checklist operacional | Define validação pós-deploy específica para a rodada. |
| `docs/ATUALIZACAO_DOCUMENTAL_2026_06_21.md` | manifesto | Lista e contextualiza a atualização documental. |

---

## 3. Principais contratos documentados

### 3.1 Tios e conectores

- `paternal-uncles` fica centralizado.
- Linha horizontal sai da direita do grupo para o lado de pai/core.
- Linha vertical inferior desce até o final da tela.
- `maternal-uncles` fica centralizado.
- Linha horizontal sai da esquerda do grupo para o lado de mãe/core.
- Linha vertical inferior desce até o final da tela.
- Áreas coloridas residuais não fazem parte do contrato visual.

### 3.2 Zoom 3x3

- `Zoom` em `/mapa-familiar` abre overview com 9 cards.
- Títulos compactos.
- Sem subtítulos como `Ancestrais profundos`.
- Ícone central em cada card.
- Badge de contagem preservada.
- `DESCENDENTES` deve ficar em uma linha quando possível.
- Abrir Zoom a partir de `descendants` não deve causar tremor.

### 3.3 Filtros mobile

- **Exibir cônjuges de tios, primos etc** é toggle real.
- **Apenas meus familiares** fica sempre ativo visualmente e, por enquanto, sem ação funcional.
- Cônjuges estendidos aparecem/ocultam por `data-mobile-family-spouse-scope="extended|direct"`.

### 3.4 Cônjuges estendidos

- Grupos afetados: tios, primos, sobrinhos, filhos, netos e irmãos quando aplicável.
- Cônjuges são marcados com `data-family-map-extended-spouse-card="true"`.
- Cônjuges recebem `data-family-map-spouse-tone="true"`.
- A cor deve ser diferente, mas próxima da cor do grupo.

### 3.5 Mapa completo

- Fluxo: `/mapa-familiar → Zoom → Exibir mapa completo`.
- O resultado deve ser uma tela única/mosaico, não cards soltos.
- Deve permitir pinça, arraste, reenquadrar e fechar.
- Deve incluir grupos familiares renderizados nas telas mobile, com conectores visuais.

---

## 4. Arquivos de código referenciados pela documentação

```txt
src/mobileFamilyMapCoreConnectorFix.ts
src/styles/mobile-family-map-branch-connectors-final.css
src/mobileFamilyMapZoomOverviewVisualFix.ts
src/mobileFamilyMapDescendantsStabilityLock.ts
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
src/mobileFamilyMapExtendedSpouseCards.ts
src/mobileFamilyMapFilterButtonsBehaviorFix.ts
src/styles/family-map-horizontal-spouse-tone.css
src/mobileFamilyMapFullOverview.ts
src/mobileFamilyMapFullOverviewMosaicFix.ts
index.html
```

---

## 5. Limitações registradas

- A implementação usa scripts auxiliares DOM/CSS para correções mobile.
- O mapa completo usa clones do DOM existente.
- O comportamento estabilizado deve ser migrado futuramente para React/hooks.
- Esta rodada foi feita via conector GitHub; build/testes locais não foram executados nesta sessão.

---

## 6. Leitura recomendada

Para entender o estado vigente:

```txt
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
```

Para entender a sequência histórica da rodada:

```txt
docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md
```

Para validar após deploy:

```txt
docs/operacao/QA_MAPAS_MOBILE_2026_06_21.md
```
