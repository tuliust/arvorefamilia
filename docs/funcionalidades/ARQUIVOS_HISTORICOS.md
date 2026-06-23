# Fatos e arquivos históricos

> Última revisão: 2026-06-23
> Escopo: `/arquivos-historicos`, fatos sem arquivo, uploads e timeline de perfil.
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

## Integrações

- `/arquivos-historicos` faz parte do fluxo de onboarding.
- Registros podem alimentar timeline em `/pessoa/:id`.
- Contexto de fatos históricos pode ser enviado para geração de texto de perfil quando disponível.
- SQLs e storage devem ser validados conforme `docs/operacao/MIGRATIONS_SUPABASE.md`.

## QA mínimo

- Criar fato sem arquivo.
- Criar fato com imagem.
- Criar fato com PDF.
- Validar exibição posterior no perfil/timeline quando o serviço estiver configurado.
- Confirmar que ausência de arquivo não bloqueia o avanço do fluxo.
