# DocumentaÃ§Ã£o â€” Ãrvore FamÃ­lia

Este diretÃ³rio Ã© o **Ã­ndice canÃ´nico da documentaÃ§Ã£o do projeto**.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, histÃ³ricos ou arquivos soltos na raiz do repositÃ³rio.

## Guias oficiais

- `GUIA_IMPLEMENTACOES.md` â€” estado consolidado do que jÃ¡ foi implementado.
- `GUIA_COMPONENTES.md` â€” componentes reutilizÃ¡veis, responsabilidades e cuidados contra regressÃµes.
- `GUIA_UX_LAYOUT.md` â€” decisÃµes de UX, layout, responsividade e comportamento visual.
- `GUIA_CORRECAO_ERROS.md` â€” investigaÃ§Ã£o e correÃ§Ã£o por sintoma.
- `PLANO_PROXIMOS_PASSOS.md` â€” pendÃªncias de lanÃ§amento, escopo congelado e backlog pÃ³s-MVP.

## Arquitetura

- `arquitetura/ROTAS_E_GUARDS.md` â€” rotas pÃºblicas, rotas de membro, rotas administrativas e guards de acesso.

## Funcionalidades especÃ­ficas

- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
- `funcionalidades/CALENDARIO_FAMILIAR.md`
- `funcionalidades/EXPORTACAO_ARVORE.md`
- `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
- `funcionalidades/MINHA_ARVORE_VIEW.md`
- `funcionalidades/NOTIFICACOES.md`
- `funcionalidades/PESSOAS_PERFIL_ADMIN.md`
- `funcionalidades/TIMELINE.md`

## OperaÃ§Ã£o e manutenÃ§Ã£o

- `operacao/README.md`
- `operacao/STORAGE_MAINTENANCE.md`
- `operacao/MIGRATIONS_SUPABASE.md`

## Comandos e checklists tÃ©cnicos

- `comandos/GIT_RESPONSIVIDADE.md`

## HistÃ³rico, diagnÃ³sticos e QA

Documentos nesta pasta sÃ£o referÃªncia histÃ³rica, diagnÃ³stico pontual ou checklist de uma fase especÃ­fica. Eles **nÃ£o devem substituir os guias oficiais**.

- `historico/README.md`
- `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md`
- `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md`
- `historico/QA_7_6_EXPORTACAO_ARVORE.md`
- `historico/RESPONSIVIDADE_MOBILE_TABLET.md`
- `historico/documentacao-antiga/`

## Regras de organizaÃ§Ã£o

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades especÃ­ficas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
6. DiagnÃ³sticos, relatÃ³rios antigos, QA e documentos de fase ficam em `docs/historico/`.
7. Documentos antigos da raiz do repositÃ³rio devem ser movidos para `docs/historico/documentacao-antiga/`.
8. Scripts SQL soltos sÃ£o histÃ³ricos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
