# Diagnóstico de documentação atual — Árvore Família

Data: 2026-05-21T02:48:02.562Z

## Escopo

Este relatório compara as documentações em `docs/` com o estado atual do código local e com as frentes recentes da árvore, painel lateral, exportação, responsividade e notificações.

Nenhum arquivo de produção foi alterado por este diagnóstico.

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

## Arquivos de documentação encontrados

```txt
docs/.DS_Store
docs/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md
docs/GUIA_COMPONENTES.md
docs/GUIA_CORRECAO_ERROS.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_UX_LAYOUT.md
docs/NOTIFICACOES.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/QA_7_6_EXPORTACAO_ARVORE.md
docs/RESPONSIVIDADE_MOBILE_TABLET.md
docs/STORAGE_MAINTENANCE.md
docs/TIMELINE.md
```

## Arquivo indesejado detectado

- `docs/.DS_Store` existe no diretório local. Não deve ser commitado.

## Classificação por documento

| Documento | Classificação | Atualizações necessárias |
|---|---|---|
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Contraditório | Separar diagnóstico 7.6A de implementação 7.6B/QA 7.6C; documento está contraditório. |
| `GUIA_COMPONENTES.md` | Parcialmente atualizado | Atualizar TreeLegend/FamilyTree com filtros e camadas visuais. Registrar botão Destacar pais/filhos. Registrar botão Destacar irmãos. Registrar novo botão externo de Informações no painel. |
| `GUIA_CORRECAO_ERROS.md` | Parcialmente atualizado | Adicionar troubleshooting dos destaques visuais. Adicionar troubleshooting do painel lateral atual. |
| `GUIA_IMPLEMENTACOES.md` | Parcialmente atualizado | Consolidar 7.7 como legenda funcional + camadas visuais opcionais. Registrar ajuste do painel lateral da Home. Registrar destaques opcionais de pais/filhos e irmãos. |
| `GUIA_UX_LAYOUT.md` | Parcialmente atualizado | Adicionar Camadas extras na legenda. Registrar Informações fora da toggle e botão com ícone. Registrar zoom no canto superior direito da árvore. |
| `NOTIFICACOES.md` | Parcialmente atualizado | Resolver possível divergência com guias que tratam pg_cron como validado/concluído. |
| `PLANO_PROXIMOS_PASSOS.md` | Parcialmente atualizado | Registrar conclusão dos destaques visuais opcionais. Registrar ajuste recente do painel lateral. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | Parcialmente atualizado | Sem lacuna crítica detectada por busca textual. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Parcialmente atualizado | Sem lacuna crítica detectada por busca textual. |
| `STORAGE_MAINTENANCE.md` | Referência específica | Sem lacuna crítica detectada por busca textual. |
| `TIMELINE.md` | Referência específica | Sem lacuna crítica detectada por busca textual. |

## Conferência de tópicos no código versus documentação

| Tópico | Existe no código? | Existe nos docs? | Avaliação |
|---|---:|---:|---|
| Legenda como filtros reais | Sim | Sim | Parcial |
| Camadas visuais opcionais das linhas | Sim | Não | Defasagem documental |
| Painel lateral da Home | Sim | Sim | OK |
| Exportação de área da árvore | Sim | Sim | OK |
| Responsividade mobile/tablet concluída | Sim | Sim | OK |
| Status de notificações e cron | Não | Sim | OK |

## Evidências rápidas no código

```txt
src/app/pages/Home.tsx: visualLineFilters, SquareDashedMousePointer, startAreaSelection
src/app/components/FamilyTree/FamilyTree.tsx: visualLineFilters, TreeAreaSelectionOverlay, startAreaSelection, right-4 top-4
src/app/components/FamilyTree/TreeLegend.tsx: visualLineFilters, parentChildHighlight, siblingHighlight, Destacar pais/filhos, Destacar irmãos
src/app/components/FamilyTree/types.ts: parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/GenealogyFamilyConnectorNode.tsx: parentChildHighlight
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts: visualLineFilters, parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/layouts/genealogyColumnsLayout.ts: visualLineFilters, parentChildHighlight, siblingHighlight
src/app/components/FamilyTree/TreeAreaSelectionOverlay.tsx: TreeAreaSelectionOverlay
```

## Recomendações objetivas

1. Atualizar `GUIA_COMPONENTES.md` para refletir `TreeLegend`, filtros funcionais, camadas extras e ações de `FamilyTree`.
2. Atualizar `GUIA_IMPLEMENTACOES.md` para consolidar 7.7 como legenda funcional + camadas visuais opcionais.
3. Atualizar `GUIA_UX_LAYOUT.md` para registrar painel lateral atual, botão externo de Informações e zoom à direita.
4. Atualizar `GUIA_CORRECAO_ERROS.md` com troubleshooting de destaques visuais, filtros da legenda e painel lateral.
5. Atualizar `PLANO_PROXIMOS_PASSOS.md` para distinguir concluído versus pós-MVP.
6. Revisar `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` para separar diagnóstico histórico de implementação/QA.
7. Marcar `RESPONSIVIDADE_MOBILE_TABLET.md` como documento histórico/checklist de regressão.
8. Resolver divergência entre `NOTIFICACOES.md` e guias principais sobre `pg_cron`/rotina diária.
9. Remover `docs/.DS_Store`, se estiver presente.
