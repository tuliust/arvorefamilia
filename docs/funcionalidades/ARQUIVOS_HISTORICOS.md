# Fatos e arquivos históricos

> Última revisão: 2026-06-25
> Escopo: `/arquivos-historicos`, fatos sem arquivo, uploads, timeline de perfil e atalhos mobile de edição.
> Status: canônico.

## Objetivo

Registrar memórias, fatos e documentos vinculados à pessoa ou a relacionamentos familiares.

## Tipos de registro

- Fato sem arquivo.
- Imagem.
- PDF.

Upload é opcional quando o usuário deseja registrar apenas um fato histórico.

## Dados esperados

Um registro pode conter:

- título;
- descrição;
- ano ou data aproximada;
- categoria;
- pessoa relacionada;
- relacionamento relacionado;
- metadados de arquivo quando existir anexo.

## Navegação mobile de edição

Fora do onboarding, `/arquivos-historicos` exibe `ProfileEditMobileTabs` logo após o `MemberPageHeader`, com os atalhos `Dados`, `Vínculos` e `Fatos e Arquivos`.

Durante o onboarding, a página mantém `MemberOnboardingSteps` como navegação principal da etapa.

## Integrações

- `/arquivos-historicos` faz parte do fluxo de onboarding.
- Registros podem alimentar timeline em `/pessoa/:id`.
- Contexto de fatos históricos pode ser enviado para geração de texto de perfil quando disponível.
- SQLs e storage devem ser validados conforme `docs/operacao/MIGRATIONS_SUPABASE.md`.
- A página usa rascunho local para preservar fatos e uploads até o salvamento.

## QA mínimo

- Criar fato sem arquivo.
- Criar fato com imagem.
- Criar fato com PDF.
- Validar exibição posterior no perfil/timeline quando o serviço estiver configurado.
- Confirmar que ausência de arquivo permite avanço do fluxo.
- Em acesso fora do onboarding no mobile, confirmar atalhos abaixo do header e `Fatos e Arquivos` marcado como rota atual.
