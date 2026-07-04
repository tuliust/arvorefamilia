# Fatos e arquivos históricos

> Última revisão: 2026-07-04
> Escopo: `/arquivos-historicos`, fatos sem arquivo, uploads, timeline de perfil, preview de PDF no perfil e atalhos mobile de edição.
> Status: canônico.

## Objetivo

Registrar memórias, fatos e documentos vinculados à pessoa ou a relacionamentos familiares.

## Ajustes de manutenção de 2026-07-04

- Este documento permanece canônico para fatos, memórias e arquivos vinculados a pessoas ou relacionamentos.
- Upload continua opcional quando o usuário registrar apenas fato histórico.
- Mudanças de storage, RLS, bucket, tamanho de arquivo ou MIME types devem atualizar `docs/operacao/STORAGE_MAINTENANCE.md` e `docs/operacao/MIGRATIONS_SUPABASE.md`.
- Mudanças no fluxo mobile de edição devem refletir também `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md`.


- Na timeline de perfil, anexos vinculados devem aparecer diretamente no card do evento, sem o título intermediário `Arquivos e registros vinculados`.
- PDFs vinculados à timeline usam modal próprio e renderização client-side por `PdfDocumentPreview`, com PDF.js carregado por CDN e páginas desenhadas em `<canvas>`.
- O botão `Abrir` de PDF abre o modal; o botão `Baixar` continua fazendo download pelo link do arquivo. Ambos usam a mesma hierarquia visual de ação textual.
- O link `Abrir em nova aba` permanece como fallback quando o preview não carregar por CORS, indisponibilidade do arquivo ou falha de PDF.js.
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

## Exibição na timeline de perfil

A timeline exibida em `/pessoa/:id` e `/pessoas/:id` é renderizada por `src/app/components/Timeline/PersonTimeline.tsx`.

Contratos atuais:

- eventos usam o tipo do item para badge, ícone e cor;
- fatos sem arquivo podem ser exibidos como memória/fato histórico sem exigir anexo;
- anexos aparecem dentro do card do evento, após separador visual discreto;
- não deve existir cabeçalho textual `Arquivos e registros vinculados` acima dos anexos;
- cada anexo exibe ícone, título, tipo (`PDF`, `Imagem` ou `Registro`), ano quando disponível, descrição e ações;
- `Abrir` e `Baixar` usam a mesma classe base de ação: texto pequeno, peso semibold, ícone de 14px, cor cinza e hover escuro;
- para PDF, `Abrir` não deve baixar automaticamente e não deve trocar a rota;
- para imagem ou outro registro com URL, `Abrir` pode abrir em nova aba.

## Preview de PDF no perfil

O preview de PDF não usa mais `iframe` direto nem Google Viewer. A estratégia vigente é:

1. abrir `AttachmentPreviewDialog`;
2. carregar `PdfDocumentPreview`;
3. carregar PDF.js por CDN quando necessário;
4. buscar o PDF por `fetch(url, { cache: 'no-store' })`;
5. converter a resposta para `ArrayBuffer`;
6. renderizar cada página do PDF em `<canvas>`;
7. exibir estado de carregamento, erro ou ausência de URL;
8. limpar os canvases quando o modal fecha ou o arquivo muda.

Motivação: visualizadores externos podem bloquear embed por `X-Frame-Options: sameorigin`, e alguns navegadores exibem apenas ícone de arquivo quando um PDF remoto é carregado em iframe.

Regras:

- se o PDF não carregar no canvas, o modal deve continuar oferecendo `Abrir em nova aba`;
- o botão `Baixar` permanece no card da timeline e não deve depender do modal;
- falha de preview não deve quebrar a página de perfil;
- arquivos sensíveis continuam dependentes de URL, bucket, RLS/policies e permissões vigentes;
- se o CDN de PDF.js for substituído por pacote local, atualizar `GUIA_COMPONENTES.md`, `GUIA_IMPLEMENTACOES.md`, `INVENTARIO_TECNICO.md`, `ATTRIBUTIONS.md` e documentação de deploy.

## Navegação mobile de edição

Fora do onboarding, `/arquivos-historicos` exibe `ProfileEditMobileTabs` logo após o `MemberPageHeader`, com os atalhos `Dados`, `Vínculos` e `Fatos e Arquivos`.

Durante o onboarding, a página mantém `MemberOnboardingSteps` como navegação principal da etapa.

## Integrações

- `/arquivos-historicos` faz parte do fluxo de onboarding.
- Registros podem alimentar timeline em `/pessoa/:id` e `/pessoas/:id`.
- Contexto de fatos históricos pode ser enviado para geração de texto de perfil quando disponível.
- SQLs e storage devem ser validados conforme `docs/operacao/MIGRATIONS_SUPABASE.md`.
- A página usa rascunho local para preservar fatos e uploads até o salvamento.

## Regras de storage e segurança

- Arquivos devem respeitar buckets, permissões e políticas RLS vigentes.
- Falhas de upload devem usar feedback não bloqueante e preservar o rascunho textual quando possível.
- Dados privados ou documentos familiares sensíveis não devem aparecer para usuários sem permissão.

## QA mínimo

- Criar fato sem arquivo.
- Criar fato com imagem.
- Criar fato com PDF.
- Validar exibição posterior no perfil/timeline quando o serviço estiver configurado.
- Confirmar que o título `Arquivos e registros vinculados` não aparece mais na timeline.
- Confirmar que `Abrir` e `Baixar` têm a mesma hierarquia visual.
- Em PDF, clicar em `Abrir` e confirmar que o modal renderiza páginas em canvas.
- Desligar/bloquear temporariamente o preview e confirmar que `Abrir em nova aba` permanece disponível como fallback.
- Confirmar que `Baixar` continua disponível no card do anexo e baixa o arquivo.
- Confirmar que ausência de arquivo permite avanço do fluxo.
- Em acesso fora do onboarding no mobile, confirmar atalhos abaixo do header e `Fatos e Arquivos` marcado como rota atual.
