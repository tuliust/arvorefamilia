# Limpeza documental final — 2026-06-23

> Última revisão: 2026-06-23  
> Escopo: fechamento da limpeza física da documentação em `docs/`.  
> > Status: histórico de fechamento final..

## Resumo executivo

A documentação foi reduzida para um conjunto enxuto de arquivos canônicos, operacionais e históricos consolidados. Os arquivos redundantes, datados, duplicados ou substituídos por documentos canônicos foram removidos fisicamente. A branch de limpeza foi incorporada à main por fast-forward e a branch temporária foi removida.

## Branch

`docs/limpeza-final-documentacao`

## Escopo

Somente arquivos dentro de `docs/` e subpastas.

## Criados

- `docs/funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `docs/historico/LEGADO_TECNICO.md`;
- `docs/historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md`.

## Atualizados

- `docs/README.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/arquitetura/DECISOES_ARQUITETURAIS.md`;
- `docs/operacao/DEPLOY.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `docs/funcionalidades/CURIOSIDADES.md`.

## Removidos fisicamente até esta etapa

- Documentos de atualização documental de 2026-06-20 e 2026-06-21.
- Baseline de produto atual.
- Guia antigo de comandos de responsividade.
- Arquivo antigo de arquitetura geral.
- Documentos individuais de calendário, dúvidas, fórum, favoritos, notificações, onboarding, exportação, timeline e pessoas/perfil/admin.
- Documento antigo de edição da árvore.
- Documento antigo de curiosidades e IA.
- Documento antigo de deployment e índice operacional local.

## Consolidações realizadas

- Funcionalidades menores foram absorvidas por `docs/funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`.
- Edição da árvore foi absorvida por `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`.
- IA e curiosidades de perfil foram absorvidas por `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` e `docs/funcionalidades/CURIOSIDADES.md`.
- Arquitetura geral, estrutura de usuários e arquitetura mobile antiga foram consolidadas em `docs/arquitetura/DECISOES_ARQUITETURAIS.md`.
- Deploy e índice operacional antigo foram consolidados em `docs/operacao/DEPLOY.md`.
- SQLs antigos, rotas removidas, imports colados e histórico antigo da árvore foram consolidados conceitualmente em `docs/historico/LEGADO_TECNICO.md`.

## Remoções residuais concluídas

Os documentos residuais de mapa mobile, QA mobile, arquitetura mobile, estrutura antiga de banco, histórico técnico fragmentado, baselines antigas, levantamentos datados, QA pós-consolidação, rollback mobile e índice histórico antigo foram removidos localmente e incorporados à main.

## Documentos finais fundamentais

- `docs/README.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/QA_MANUAL.md`;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/PLANO_PROXIMOS_PASSOS.md`;
- `docs/arquitetura/DECISOES_ARQUITETURAIS.md`;
- `docs/arquitetura/ROTAS_E_GUARDS.md`;
- `docs/operacao/DEPLOY.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`;
- `docs/operacao/OAUTH_GOOGLE.md`;
- `docs/operacao/STORAGE_MAINTENANCE.md`;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `docs/funcionalidades/MEUS_VINCULOS.md`;
- `docs/funcionalidades/REVISAO_DADOS.md`;
- `docs/funcionalidades/CURIOSIDADES.md`;
- `docs/funcionalidades/ARQUIVOS_HISTORICOS.md`;
- `docs/funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md`;
- `docs/historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md`;
- `docs/historico/LEGADO_TECNICO.md`;
- `docs/historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md`.

## Validações registradas

Antes da continuação pelo conector, o usuário informou execução local de `git status --short`, `git diff --check`, `npm run typecheck` e `npm run build`.

`npm run typecheck` e `npm run build` passaram. A busca local de mojibake não foi concluída porque a ferramenta usada no comando não estava disponível no terminal.

## Pendências

- Remover localmente os arquivos residuais fora da estrutura canônica.
- Reexecutar busca de mojibake com ferramenta disponível localmente.
- Rodar novamente `npm run typecheck` e `npm run build` após puxar os commits criados pelo conector.

## Regra pós-limpeza

Não recriar documentos removidos sem necessidade real. A manutenção deve priorizar os documentos canônicos e os consolidados criados nesta etapa.
