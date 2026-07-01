# Documentação do produto — arvorefamilia

> Última revisão: 2026-07-01
> Escopo: documentação canônica mantida em `docs/` após auditoria e limpeza final.
> Status: canônico.

Este diretório concentra a documentação fundamental do produto. A fonte de verdade para comportamento continua sendo o código da branch `main`, especialmente `src/app/routes.tsx`, `src/app/pages`, `src/app/components`, `src/app/components/FamilyTree`, `src/app/services`, `src/app/types`, `src/app/utils`, `index.html`, `api/ai.ts` e os arquivos SQL/Supabase versionados.

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
    NOTIFICACOES_ADMIN.md
    REVISAO_DADOS.md
    STATUS_CONJUGAL.md

  historico/
    AUDITORIA_DOCUMENTACAO_FINAL_20260623.md
    LEGADO_TECNICO.md
    LIMPEZA_DOCUMENTACAO_FINAL_20260623.md
```

Arquivos residuais fora desse índice não devem ser usados como contrato operacional. Checklists datados, baselines antigos ou documentos de rodada devem ser removidos ou absorvidos pelos documentos canônicos, preservando histórico apenas quando houver valor real de manutenção.

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
| Mapa familiar e linha geracional | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Árvore, conectores e painel | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Status conjugal | `funcionalidades/STATUS_CONJUGAL.md` |
| Meus dados, IA, Mini Bio e Curiosidades | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Curiosidades | `funcionalidades/CURIOSIDADES.md` |
| Fatos e arquivos históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Notificações administrativas | `funcionalidades/NOTIFICACOES_ADMIN.md` |
| Funcionalidades complementares | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |
| Auditoria documental | `historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md` |
| Legado técnico consolidado | `historico/LEGADO_TECNICO.md` |
| Limpeza documental final | `historico/LIMPEZA_DOCUMENTACAO_FINAL_20260623.md` |

## Rotas funcionais cobertas

As rotas abaixo refletem `src/app/routes.tsx` na branch `main`.

### Públicas e acesso

- `/entrar`;
- `/termos`;
- `/privacidade`;
- `/duvidas`.

### Árvore, busca e perfil

- `/` redireciona para `/mapa-familiar`;
- `/mapa-familiar`, `/mapa-familiar-horizontal` e `/linha-geracional`;
- `/busca`;
- `/pessoa/:id` e `/pessoas/:id`.

### Membro e onboarding

- `/minha-arvore/editar` redireciona para `/meus-dados`;
- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`;
- `/vincular-perfil`;
- `/calendario-familiar`;
- `/curiosidades`;
- `/meus-favoritos`;
- `/notificacoes`;
- `/ajustar-notificacoes`.

### Fórum

- `/forum`;
- `/forum/novo`;
- `/forum/topico/:id`;
- `/forum/topico/:id/editar`.

### Administração

- `/admin`;
- `/admin/login`;
- `/admin/dashboard`;
- `/aprovacoes`;
- `/admin/aprovacoes`;
- `/admin/home`;
- `/admin/pessoas`;
- `/admin/pessoas/novas`;
- `/admin/pessoas/nova`;
- `/admin/pessoas/:id`;
- `/admin/pessoas/:id/editar`;
- `/admin/relacionamentos`;
- `/admin/relacionamentos/novo`;
- `/admin/importacao`;
- `/admin/migrar-dados`;
- `/admin/diagnostico`;
- `/admin/integridade`;
- `/admin/atividades`;
- `/admin/responsaveis`;
- `/admin/notificacoes`;
- `/admin/gestao-conteudo-pessoas`;
- `/admin/duvidas`.

## Contratos transversais recentes

- Diálogos nativos do navegador (`window.alert`, `alert`, `window.confirm`, `confirm`, `window.prompt` e `prompt`) não devem ser usados em fluxos da aplicação.
- Feedback não bloqueante deve usar `toast` de `sonner`.
- Confirmações devem usar `ConfirmDialog` ou modal controlado equivalente.
- Coleta de texto deve usar modal controlado com campo de formulário, validação explícita e feedback por `toast`.
- O arquivo `src/app/components/ui/alert.tsx` é componente visual e pode aparecer em varreduras textuais como falso positivo; ele não representa uso de API nativa do navegador.
- Ajustes mobile devem ser isolados por rota/breakpoint e não podem alterar layout ou comportamento desktop sem decisão explícita.
- Overlays mobile de busca, notificações, avatar e painel da árvore devem permanecer acima de toolbars sticky e canvas.
- Catálogo administrativo de notificações deve ser persistido no Supabase e documentado em `funcionalidades/NOTIFICACOES_ADMIN.md` quando houver mudança de schema, destinatários ou gatilhos.

## Atualizações recentes documentadas

Esta revisão incorpora contratos recentes de mobile, exportação, notificações administrativas e limpeza documental:

- camada superior de notificações, busca, avatar, botão `+` e painéis de árvore no mobile;
- isolamento do runtime específico de `/linha-geracional`;
- visão geral `Mapa da família` em `/mapa-familiar` mobile;
- botão `Mapa`, mapa completo com pan/zoom, cards normalizados e conectores por bordas reais;
- guard contra ghost click nos botões do mapa mobile;
- scroll vertical das telas de primos paternos e maternos;
- limite visual inicial de 8 cards em tios paternos e maternos no mobile;
- labels compactos dos cards superiores de `/admin` mobile;
- persistência de configurações e catálogo administrativo de notificações em Supabase;
- destinatários avançados de notificações: usuário do gatilho, usuários específicos e familiares próximos;
- gatilho de primeira entrada real em `/mapa-familiar` com deduplicação por usuário;
- continuidade do fluxo de preview/exportação em aba dedicada;
- remoção de checklist datado de QA mobile após consolidação em `QA_MANUAL.md`.

## Regra de manutenção

1. Antes de alterar documentação, comparar com `src/app/routes.tsx`, `index.html` e módulos citados no documento afetado.
2. Não recriar arquivos de rodada, baseline antigo ou QA datado quando o conteúdo couber nos documentos canônicos.
3. Manter histórico apenas em documentos consolidados.
4. Ao remover, mesclar ou mover arquivos, atualizar este índice e `INVENTARIO_TECNICO.md`.
5. Validar UTF-8, ausência de mojibake e links internos antes do merge.
