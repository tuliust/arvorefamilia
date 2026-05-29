# Diagnostico de documentacao atual - Arvore Familia

Data: 2026-05-21T02:48:02.562Z

## Escopo

> Este documento e historico. Ele registra o estado observado em 2026-05-21 e nao substitui `docs/README.md` nem os guias canonicos atuais.

Este relatorio compara as documentacoes em `docs/` com o estado atual do codigo local e com as frentes recentes da arvore, painel lateral, exportacao, responsividade e notificacoes.

Nenhum arquivo de producao foi alterado por este diagnostico.

## Estado do Git

```txt
On branch main
Your branch is up to date with 'origin/main'.

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	scripts/audit-docs-status.mjs

nothing added to commit but untracked files present (use "git add" to track)

94b5408 style: ajustar painel lateral e controles da home
e41d9b1 feat: adicionar destaques visuais opcionais nas linhas da arvore
5f5b309 feat: adicionar destaques visuais opcionais nas linhas da arvore
733eb65 feat: preparar camadas visuais opcionais da arvore
779fee6 feat: tornar legenda visual em filtros da arvore
5cab514 feat: finalizar ajustes mobile da home e arvore
92b52b4 style: padronizar headers administrativos restantes
d7a8afc style: padronizar headers administrativos restantes
0ed7377 fix: ajustar normalizacao das views da arvore
6fb5d84 style: padronizar headers das paginas internas
9d22ebc fix: ajustar zoom minimo e enquadramento da genealogia
98bbe07 fix: estabilizar aplicacao inicial do viewport da arvore
b5f0167 fix: padronizar viewport inicial da arvore
d965020 fix: estabilizar viewport inicial da arvore
f6109f4 docs: adicionar guias de ux layout e componentes
```

## Arquivos de documentacao encontrados

```txt
docs/.DS_Store
docs/historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
docs/GUIA_COMPONENTES.md
docs/GUIA_CORRECAO_ERROS.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/NOTIFICACOES.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/funcionalidades/TIMELINE.md
```

## Arquivo indesejado detectado

- `docs/.DS_Store` existe no diretorio local. Nao deve ser commitado.

## Classificacao por documento

| Documento | Classificacao | Atualizacoes necessarias |
|---|---|---|
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Contraditorio | Separar diagnostico 7.6A de implementacao 7.6B/QA 7.6C; documento esta contraditorio. |
| `GUIA_COMPONENTES.md` | Parcialmente atualizado | Atualizar TreeLegend/FamilyTree com filtros e camadas visuais. Registrar botao Destacar pais/filhos. Registrar botao Destacar irmaos. Registrar novo botao externo de Informacoes no painel. |
| `GUIA_CORRECAO_ERROS.md` | Parcialmente atualizado | Adicionar troubleshooting dos destaques visuais. Adicionar troubleshooting do painel lateral atual. |
| `GUIA_IMPLEMENTACOES.md` | Parcialmente atualizado | Consolidar 7.7 como legenda funcional + camadas visuais opcionais. Registrar ajuste do painel lateral da Home. Registrar destaques opcionais de pais/filhos e irmaos. |
| `GUIA_UX_LAYOUT.md` | Parcialmente atualizado | Adicionar Camadas extras na legenda. Registrar Informacoes fora da toggle e botao com icone. Registrar zoom no canto superior direito da arvore. |
| `NOTIFICACOES.md` | Parcialmente atualizado | Resolver possivel divergencia com guias que tratam pg_cron como validado/concluido. |
| `PLANO_PROXIMOS_PASSOS.md` | Parcialmente atualizado | Registrar conclusao dos destaques visuais opcionais. Registrar ajuste recente do painel lateral. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | Parcialmente atualizado | Sem lacuna critica detectada por busca textual. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Parcialmente atualizado | Sem lacuna critica detectada por busca textual. |
| `STORAGE_MAINTENANCE.md` | Referencia especifica | Sem lacuna critica detectada por busca textual. |
| `TIMELINE.md` | Referencia especifica | Sem lacuna critica detectada por busca textual. |

## Conferencia de topicos no codigo versus documentacao

| Topico | Existe no codigo | Existe nos docs | Avaliacao |
|---|---:|---:|---|
| Legenda como filtros reais | Sim | Sim | Parcial |
| Camadas visuais opcionais das linhas | Sim | Nao | Defasagem documental |
| Painel lateral da Home | Sim | Sim | OK |
| Exportacao de area da arvore | Sim | Sim | OK |
| Responsividade mobile/tablet concluida | Sim | Sim | OK |
| Status de notificacoes e cron | Nao | Sim | OK |

## Evidencias rapidas no codigo

```txt
src/app/pages/Home.tsx: visualLineFilters, SquareDashedMousePointer, startAreaSelection
src/app/components/FamilyTree/FamilyTree.tsx: visualLineFilters, TreeAreaSelectionOverlay, startAreaSelection, right-4 top-4
src/app/components/FamilyTree/TreeLegend.tsx: visualLineFilters, parentChildHighlight, siblingHighlight, Destacar pais/filhos, Destacar irmaos
src/app/components/FamilyTree/types.ts: parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx: parentChildHighlight
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts: visualLineFilters, parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts: visualLineFilters, parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx: TreeAreaSelectionOverlay
```

## Recomendacoes objetivas

Status posterior: as recomendacoes abaixo foram usadas como insumo para reorganizacao e revisao documental. Consultar `docs/README.md` para o indice canonico atual.

1. Atualizar `GUIA_COMPONENTES.md` para refletir `TreeLegend`, filtros funcionais, camadas extras e acoes de `FamilyTree`.
2. Atualizar `GUIA_IMPLEMENTACOES.md` para consolidar 7.7 como legenda funcional + camadas visuais opcionais.
3. Atualizar `GUIA_UX_LAYOUT.md` para registrar painel lateral atual, botao externo de Informacoes e zoom a direita.
4. Atualizar `GUIA_CORRECAO_ERROS.md` com troubleshooting de destaques visuais, filtros da legenda e painel lateral.
5. Atualizar `PLANO_PROXIMOS_PASSOS.md` para distinguir concluido versus pos-MVP.
6. Revisar `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` para separar diagnostico historico de implementacao/QA.
7. Marcar `RESPONSIVIDADE_MOBILE_TABLET.md` como documento historico/checklist de regressao.
8. Resolver divergencia entre `NOTIFICACOES.md` e guias principais sobre `pg_cron`/rotina diaria.
9. Remover `docs/.DS_Store`, se estiver presente.
