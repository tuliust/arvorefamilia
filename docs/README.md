# Documentacao - Arvore Familia

Este diretorio e o indice canonico da documentacao do projeto.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, historicos ou arquivos soltos na raiz do repositorio.

## Guias oficiais

- `GUIA_IMPLEMENTACOES.md` - estado consolidado do que ja foi implementado.
- `GUIA_COMPONENTES.md` - componentes reutilizaveis, responsabilidades e cuidados contra regressoes.
- `GUIA_UX_LAYOUT.md` - decisoes de UX, layout, responsividade e comportamento visual.
- `GUIA_CORRECAO_ERROS.md` - investigacao e correcao por sintoma.
- `PLANO_PROXIMOS_PASSOS.md` - pendencias de lancamento, escopo congelado e backlog pos-MVP.

## Arquitetura

- `arquitetura/ROTAS_E_GUARDS.md` - rotas publicas, rotas de membro, rotas administrativas e guards de acesso.

## Funcionalidades especificas

- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
- `funcionalidades/CALENDARIO_FAMILIAR.md`
- `funcionalidades/EXPORTACAO_ARVORE.md`
- `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
- `funcionalidades/MINHA_ARVORE_VIEW.md`
- `funcionalidades/NOTIFICACOES.md`
- `funcionalidades/PESSOAS_PERFIL_ADMIN.md`
- `funcionalidades/TIMELINE.md`

## Operacao e manutencao

- `operacao/README.md`
- `operacao/STORAGE_MAINTENANCE.md`
- `operacao/MIGRATIONS_SUPABASE.md`

## Comandos e checklists tecnicos

- `comandos/GIT_RESPONSIVIDADE.md`

## Historico, diagnosticos e QA

Documentos nesta pasta sao referencia historica, diagnostico pontual ou checklist de uma fase especifica. Eles nao devem substituir os guias oficiais.

- `historico/README.md`
- `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md`
- `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md`
- `historico/QA_7_6_EXPORTACAO_ARVORE.md`
- `historico/RESPONSIVIDADE_MOBILE_TABLET.md`
- `historico/documentacao-antiga/`

## Regras de organizacao

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades especificas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
6. Diagnosticos, relatorios antigos, QA e documentos de fase ficam em `docs/historico/`.
7. Documentos antigos da raiz do repositorio devem ser movidos para `docs/historico/documentacao-antiga/`.
8. Scripts SQL soltos sao historicos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
