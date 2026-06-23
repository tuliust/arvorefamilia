# Documentação do produto — arvorefamilia

> Última revisão: 2026-06-23
> Escopo: documentação em `docs/` comparada com a branch `main`.
> Status: canônico.

Este diretório concentra a documentação funcional, técnica, operacional, de UX, QA e histórico do produto. A fonte de verdade para rotas é `src/app/routes.tsx`; a fonte de verdade para dados é o conjunto de serviços em `src/app/services`, tipos em `src/app/types` e SQLs em `supabase/`.

## Índice canônico

| Tema | Documento |
|---|---|
| Inventário técnico | `INVENTARIO_TECNICO.md` |
| UX e layout | `GUIA_UX_LAYOUT.md` |
| Componentes | `GUIA_COMPONENTES.md` |
| Implementações | `GUIA_IMPLEMENTACOES.md` |
| QA manual | `QA_MANUAL.md` |
| Regras de não regressão | `REGRAS_DE_NAO_REGRESSAO.md` |
| Correção de erros | `GUIA_CORRECAO_ERROS.md` |
| Próximos passos | `PLANO_PROXIMOS_PASSOS.md` |
| Rotas e guards | `arquitetura/ROTAS_E_GUARDS.md` |
| Migrations Supabase | `operacao/MIGRATIONS_SUPABASE.md` |
| Mapa familiar | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores e painel | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Meus dados, IA, Mini Bio e Curiosidades | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Fatos e arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Histórico da auditoria documental | `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md` |

## Rotas funcionais documentadas

As rotas atualmente cobertas são:

- `/mapa-familiar` e `/mapa-familiar-horizontal`;
- `/minha-arvore/editar`;
- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/revisao-dados`;
- `/curiosidades`;
- `/forum`, `/forum/novo`, `/forum/topico/:id` e `/forum/topico/:id/editar`;
- `/meus-favoritos`;
- `/notificacoes` e `/ajustar-notificacoes`;
- `/preferencias`;
- `/pessoa/:id` e `/pessoas/:id`;
- `/calendario-familiar`;
- área administrativa em `/admin` e subrotas.

## Padrão documental

Todo documento canônico deve manter:

- título;
- última revisão;
- escopo;
- status;
- descrição objetiva do comportamento implementado;
- referências a caminhos reais do repositório.

Documentos históricos devem ficar em `docs/historico/` e não podem ser usados como contrato operacional quando houver documento canônico atualizado.

## Regra de manutenção

Antes de alterar documentação:

1. comparar com `src/app/routes.tsx`;
2. conferir componentes e serviços citados;
3. evitar duplicação de contratos;
4. atualizar este índice se criar, remover ou renomear arquivo;
5. verificar UTF-8 e ausência de mojibake em `docs/`.
