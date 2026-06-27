# Documentação do produto — arvorefamilia

> Última revisão: 2026-06-26
> Escopo: documentação canônica mantida em `docs/` após auditoria e limpeza final.
> Status: canônico.

Este diretório concentra a documentação fundamental do produto. A fonte de verdade para comportamento continua sendo o código da branch `main`, especialmente `src/app/routes.tsx`, `src/app/pages`, `src/app/components`, `src/app/services`, `src/app/types`, `api/ai.ts` e os arquivos SQL/Supabase versionados.

## Estrutura canônica

A estrutura canônica de leitura e manutenção é:

```text
docs/
  README.md
  ATTRIBUTIONS.md
  INVENTARIO_TECNICO.md
  GUIA_UX_LAYOUT.md
  GUIA_COMPONENTES.md
  GUIA_IMPLEMENTACOES.md
  QA_MANUAL.md
  REGRAS_DE_NAO_REGRESSAO.md
  GUIA_CORRECAO_ERROS.md
  PLANO_PROXIMOS_PASSOS.md
  admin-home-configuracoes-publicas.md

  arquitetura/
    DECISOES_ARQUITETURAIS.md
    ROTAS_E_GUARDS.md

  operacao/
    DEPLOY.md
    MIGRATIONS_SUPABASE.md
    OAUTH_GOOGLE.md
    STORAGE_MAINTENANCE.md

  funcionalidades/
    ARQUIVOS_HISTORICOS.md
    ARVORE_LEGENDAS_CONECTORES_PAINEL.md
    CURIOSIDADES.md
    FUNCIONALIDADES_COMPLEMENTARES.md
    MAPA_FAMILIAR_VIEW.md
    MEUS_VINCULOS.md
    MINI_BIO_CURIOSIDADES_IA.md
    REVISAO_DADOS.md
    STATUS_CONJUGAL.md

  historico/
    AUDITORIA_DOCUMENTACAO_FINAL_20260623.md
    LEGADO_TECNICO.md
    LIMPEZA_DOCUMENTACAO_FINAL_20260623.md
```

Arquivos residuais fora desse índice não devem ser usados como contrato operacional. Se ainda existirem na branch, devem ser removidos em rodada local de `git rm` conforme `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md`.

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
| Configurações públicas e `/admin/home` | `admin-home-configuracoes-publicas.md` |
| Arquitetura e decisões técnicas | `arquitetura/DECISOES_ARQUITETURAIS.md` |
| Rotas e guards | `arquitetura/ROTAS_E_GUARDS.md` |
| Deploy | `operacao/DEPLOY.md` |
| Migrations Supabase | `operacao/MIGRATIONS_SUPABASE.md` |
| OAuth Google | `operacao/OAUTH_GOOGLE.md` |
| Storage | `operacao/STORAGE_MAINTENANCE.md` |
| Mapa familiar | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores e painel | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Status conjugal | `funcionalidades/STATUS_CONJUGAL.md` |
| Meus dados, IA, Mini Bio e Curiosidades | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Fatos e arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Funcionalidades complementares | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |
| Auditoria documental | `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md` |
| Legado técnico consolidado | `historico/LEGADO_TECNICO.md` |
| Limpeza documental final | `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md` |

## Rotas funcionais cobertas

- `/mapa-familiar`, `/mapa-familiar-horizontal` e `/linha-geracional`;
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
- `/entrar`, `/termos`, `/privacidade` e `/duvidas`;
- área administrativa em `/admin` e subrotas, incluindo `/admin/home`.

## Regra de manutenção

1. Antes de alterar documentação, comparar com `src/app/routes.tsx`.
2. Não recriar arquivos de rodada, baseline antigo ou QA datado quando o conteúdo couber nos documentos canônicos.
3. Manter histórico apenas em documentos consolidados.
4. Ao remover, mesclar ou mover arquivos, atualizar este índice e `INVENTARIO_TECNICO.md`.
5. Validar UTF-8, ausência de mojibake e links internos antes do merge.
