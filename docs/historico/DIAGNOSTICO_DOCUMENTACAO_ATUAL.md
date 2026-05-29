# DiagnÃ³stico de documentaÃ§Ã£o atual â€” Ãrvore FamÃ­lia

Data: 2026-05-21T02:48:02.562Z

## Escopo

Este relatÃ³rio compara as documentaÃ§Ãµes em `docs/` com o estado atual do cÃ³digo local e com as frentes recentes da Ã¡rvore, painel lateral, exportaÃ§Ã£o, responsividade e notificaÃ§Ãµes.

Nenhum arquivo de produÃ§Ã£o foi alterado por este diagnÃ³stico.

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

## Arquivos de documentaÃ§Ã£o encontrados

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

- `docs/.DS_Store` existe no diretÃ³rio local. NÃ£o deve ser commitado.

## ClassificaÃ§Ã£o por documento

| Documento | ClassificaÃ§Ã£o | AtualizaÃ§Ãµes necessÃ¡rias |
|---|---|---|
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | ContraditÃ³rio | Separar diagnÃ³stico 7.6A de implementaÃ§Ã£o 7.6B/QA 7.6C; documento estÃ¡ contraditÃ³rio. |
| `GUIA_COMPONENTES.md` | Parcialmente atualizado | Atualizar TreeLegend/FamilyTree com filtros e camadas visuais. Registrar botÃ£o Destacar pais/filhos. Registrar botÃ£o Destacar irmÃ£os. Registrar novo botÃ£o externo de InformaÃ§Ãµes no painel. |
| `GUIA_CORRECAO_ERROS.md` | Parcialmente atualizado | Adicionar troubleshooting dos destaques visuais. Adicionar troubleshooting do painel lateral atual. |
| `GUIA_IMPLEMENTACOES.md` | Parcialmente atualizado | Consolidar 7.7 como legenda funcional + camadas visuais opcionais. Registrar ajuste do painel lateral da Home. Registrar destaques opcionais de pais/filhos e irmÃ£os. |
| `GUIA_UX_LAYOUT.md` | Parcialmente atualizado | Adicionar Camadas extras na legenda. Registrar InformaÃ§Ãµes fora da toggle e botÃ£o com Ã­cone. Registrar zoom no canto superior direito da Ã¡rvore. |
| `NOTIFICACOES.md` | Parcialmente atualizado | Resolver possÃ­vel divergÃªncia com guias que tratam pg_cron como validado/concluÃ­do. |
| `PLANO_PROXIMOS_PASSOS.md` | Parcialmente atualizado | Registrar conclusÃ£o dos destaques visuais opcionais. Registrar ajuste recente do painel lateral. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | Parcialmente atualizado | Sem lacuna crÃ­tica detectada por busca textual. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Parcialmente atualizado | Sem lacuna crÃ­tica detectada por busca textual. |
| `STORAGE_MAINTENANCE.md` | ReferÃªncia especÃ­fica | Sem lacuna crÃ­tica detectada por busca textual. |
| `TIMELINE.md` | ReferÃªncia especÃ­fica | Sem lacuna crÃ­tica detectada por busca textual. |

## ConferÃªncia de tÃ³picos no cÃ³digo versus documentaÃ§Ã£o

| TÃ³pico | Existe no cÃ³digo? | Existe nos docs? | AvaliaÃ§Ã£o |
|---|---:|---:|---|
| Legenda como filtros reais | Sim | Sim | Parcial |
| Camadas visuais opcionais das linhas | Sim | NÃ£o | Defasagem documental |
| Painel lateral da Home | Sim | Sim | OK |
| ExportaÃ§Ã£o de Ã¡rea da Ã¡rvore | Sim | Sim | OK |
| Responsividade mobile/tablet concluÃ­da | Sim | Sim | OK |
| Status de notificaÃ§Ãµes e cron | NÃ£o | Sim | OK |

## EvidÃªncias rÃ¡pidas no cÃ³digo

```txt
src/app/pages/Home.tsx: visualLineFilters, SquareDashedMousePointer, startAreaSelection
src/app/components/FamilyTree/FamilyTree.tsx: visualLineFilters, TreeAreaSelectionOverlay, startAreaSelection, right-4 top-4
src/app/components/FamilyTree/TreeLegend.tsx: visualLineFilters, parentChildHighlight, siblingHighlight, Destacar pais/filhos, Destacar irmÃ£os
src/app/components/FamilyTree/types.ts: parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx: parentChildHighlight
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts: visualLineFilters, parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts: visualLineFilters, parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx: TreeAreaSelectionOverlay
```

## RecomendaÃ§Ãµes objetivas

1. Atualizar `GUIA_COMPONENTES.md` para refletir `TreeLegend`, filtros funcionais, camadas extras e aÃ§Ãµes de `FamilyTree`.
2. Atualizar `GUIA_IMPLEMENTACOES.md` para consolidar 7.7 como legenda funcional + camadas visuais opcionais.
3. Atualizar `GUIA_UX_LAYOUT.md` para registrar painel lateral atual, botÃ£o externo de InformaÃ§Ãµes e zoom Ã  direita.
4. Atualizar `GUIA_CORRECAO_ERROS.md` com troubleshooting de destaques visuais, filtros da legenda e painel lateral.
5. Atualizar `PLANO_PROXIMOS_PASSOS.md` para distinguir concluÃ­do versus pÃ³s-MVP.
6. Revisar `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` para separar diagnÃ³stico histÃ³rico de implementaÃ§Ã£o/QA.
7. Marcar `RESPONSIVIDADE_MOBILE_TABLET.md` como documento histÃ³rico/checklist de regressÃ£o.
8. Resolver divergÃªncia entre `NOTIFICACOES.md` e guias principais sobre `pg_cron`/rotina diÃ¡ria.
9. Remover `docs/.DS_Store`, se estiver presente.
