# Documentação do produto — arvorefamilia

> Última revisão: 2026-07-04  
> Escopo: documentação canônica mantida em `docs/` após auditoria, limpeza final, ajustes mobile/admin, layout compartilhado de mapas, inventário real de runtimes, Linha do Tempo com PDF, IA de conteúdos automáticos e conexões familiares.  
> Status: canônico.

Este diretório concentra a documentação fundamental do produto. A fonte de verdade para comportamento continua sendo o código da branch `main`, especialmente `src/app/routes.tsx`, `src/app/pages`, `src/app/components`, `src/app/components/Timeline`, `src/app/services`, `src/app/types`, `src/app/utils`, `src/main.tsx`, `index.html`, `api/ai.ts` e os arquivos SQL/Supabase versionados.

## Estrutura canônica

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
    REVISAO_DOCUMENTACAO_MAPA_MOBILE_20260701.md
```

Arquivos residuais fora desse índice não devem ser usados como contrato operacional.

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
| Deploy | `operacao/DEPLOY.md` |
| Migrations Supabase e Edge Functions | `operacao/MIGRATIONS_SUPABASE.md` |
| Storage | `operacao/STORAGE_MAINTENANCE.md` |
| Meus dados, IA, Mini Bio e Curiosidades | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Curiosidades e conexões | `funcionalidades/CURIOSIDADES.md` |
| Fatos, arquivos históricos e Linha do Tempo | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Funcionalidades complementares | `funcionalidades/FUNCIONALIDADES_COMPLEMENTARES.md` |

## Rotas funcionais cobertas

### Públicas e acesso

- `/entrar`;
- `/termos`;
- `/privacidade`;
- `/duvidas`.

### Árvore, busca e perfil

- `/` redireciona para `/mapa-familiar`;
- `/mapa-familiar`;
- `/linha-geracional`;
- `/mapa-familiar-horizontal`;
- `/busca`;
- `/pessoa/:id`;
- `/pessoas/:id`.

### Membro e onboarding

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
- `/ajustar-notificacoes`;
- `/forum`;
- `/forum/novo`;
- `/forum/topico/:id`;
- `/forum/topico/:id/editar`.

### Administração

- `/admin`;
- `/admin/login`;
- `/admin/dashboard`;
- `/admin/home`;
- `/admin/pessoas`;
- `/admin/pessoas/:id`;
- `/admin/pessoas/:id/editar`;
- `/admin/relacionamentos`;
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

### Linha do Tempo, anexos e PDF

- `PersonTimeline` renderiza eventos automáticos/manuais da pessoa.
- Anexos aparecem diretamente nos cards, sem título “Arquivos e registros vinculados”.
- PDFs têm botão `Abrir` e `Baixar`.
- `Abrir` abre modal controlado por `Dialog`.
- PDF é renderizado por `PdfDocumentPreview` com PDF.js + canvas.
- Google Viewer em iframe não deve ser usado por bloqueio potencial de `X-Frame-Options`.
- O botão `Abrir` deve manter a mesma hierarquia visual de `Baixar`.
- `Abrir em nova aba` permanece como fallback no rodapé do modal.

### Conteúdos automáticos de pessoas

- `/admin/gestao-conteudo-pessoas` permite gerar, regenerar, editar, salvar e limpar conteúdos automáticos por pessoa.
- `astrology` e `historical_events` são os tipos atuais em `person_generated_insights`.
- Fatos do nascimento devem preservar `period_title`, `brazil` e `world`.
- A Edge Function `generate-person-insights` normaliza conteúdo histórico e tenta reparo automático se Brasil/Mundo vierem incompletos.
- Alterações na Edge Function exigem deploy com `supabase functions deploy generate-person-insights`.

### Conexões familiares e parentesco

- A seção `Seu parentesco com ela/ele` usa `RelationshipFinder`.
- A seção `Qual a minha conexão com alguém?` usa `ConnectionDiscoveryPanel`.
- Frases principais devem usar `getRelationshipResultSentenceWithOverrides` quando disponível.
- `relationshipSentenceOverrides` cobre padrões por filho em comum e família do cônjuge.
- Termos com gênero conhecido/inferido devem usar forma específica (`avó`, `avô`, `sobrinha`, `sobrinho`, `casada`, `casado`).
- O fallback `Há uma ligação familiar entre...` não deve aparecer para padrões conhecidos.

## Validação técnica

### Bash/Git Bash

```bash
git status --short
git diff --check
grep -R --include='*.md' --include='*.txt' --include='*.json' --include='*.sql' $'\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
npm run test
```

### PowerShell

```powershell
git status --short
git diff --check

Get-ChildItem -Path .\docs -Recurse -File |
  Where-Object { $_.Extension -in ".md", ".txt", ".json", ".sql" } |
  Select-String -SimpleMatch ([char]0xFFFD)

npm run typecheck
npm run build
npm run test
```

## Regra de manutenção

- Alterações funcionais devem atualizar o documento funcional correspondente e, quando necessário, `GUIA_IMPLEMENTACOES.md`, `GUIA_COMPONENTES.md`, `GUIA_UX_LAYOUT.md`, `QA_MANUAL.md`, `REGRAS_DE_NAO_REGRESSAO.md` e `INVENTARIO_TECNICO.md`.
- Alterações de rota, layout compartilhado ou guard devem atualizar `arquitetura/ROTAS_E_GUARDS.md`, `arquitetura/DECISOES_ARQUITETURAIS.md` e `INVENTARIO_TECNICO.md`.
- Alterações de schema, RLS, migrations, Edge Functions ou jobs devem atualizar `operacao/MIGRATIONS_SUPABASE.md`, `QA_MANUAL.md` e o documento funcional afetado.
- Alterações em Linha do Tempo/PDF devem atualizar também `ATTRIBUTIONS.md` quando houver biblioteca/CDN externo.
- Não criar documentos datados de rodada quando o conteúdo couber nos documentos canônicos existentes.
