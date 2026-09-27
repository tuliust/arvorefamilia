# Storage Maintenance

> Última revisão: 2026-09-27
> Escopo: buckets, arquivos históricos, preview de PDF, limpeza de órfãos e QA de Storage.
> Status: canônico.

## Buckets

| Bucket | Uso |
|---|---|
| `person-avatars` | Avatares das pessoas. |
| `historical-files` | Imagens/PDFs históricos. |
| `site-media` | Mídias institucionais do site. |
| `logo` | Bucket legado. Não usar em uploads novos; revisar seus 2 objetos antes de remoção. |

## Fatos sem arquivo

Fatos sem arquivo não usam Storage.

Portanto:

- não exigem bucket;
- não geram `storage_path`;
- não têm `url` pública;
- não devem ser tratados como upload pendente;
- podem aparecer na Linha do Tempo como memória/fato textual quando a lógica funcional permitir.

## Arquivos históricos com upload

Quando há upload:

- salvar arquivo no bucket `historical-files`;
- preencher `url`;
- preencher `storage_bucket`;
- preencher `storage_path`;
- preencher `mime_type`;
- permitir abrir/download quando aplicável;
- manter relação com o registro histórico.

Campos esperados no registro ou estrutura equivalente:

```txt
url
storage_bucket
storage_path
mime_type
titulo
descricao
ano/data
```

## PDFs históricos

PDFs históricos podem ser exibidos na Linha do Tempo da página de pessoa.

Contrato atual:

- o card do anexo mostra selo `PDF`;
- o botão `Abrir` abre modal;
- o botão `Baixar` permanece separado;
- o preview no modal usa `PdfDocumentPreview`;
- o preview usa PDF.js + canvas;
- o PDF é buscado pelo navegador com `fetch`;
- o fallback `Abrir em nova aba` permanece no rodapé do modal.

Requisitos de Storage para preview:

- a URL precisa ser acessível pelo navegador do usuário autorizado;
- o `fetch` do arquivo precisa retornar `response.ok`;
- o conteúdo precisa ser um PDF válido ou compatível com PDF.js;
- a política/CORS do bucket não pode bloquear a leitura;
- se URLs assinadas forem usadas, devem estar válidas durante a visualização.

Observação:

- Google Viewer em iframe não deve ser usado como solução de preview, pois pode ser bloqueado por `X-Frame-Options: sameorigin`.
- iframe direto de PDF também não deve ser a única estratégia, pois depende do navegador.

## Imagens históricas

Imagens históricas podem continuar abrindo em nova aba quando aplicável.

Contrato:

- o card do anexo mostra selo `Imagem`;
- `Abrir` pode usar link externo/nova aba;
- `Baixar` usa o arquivo original;
- o preview em modal específico de imagem só deve ser implementado se houver decisão funcional.

## Fallbacks de leitura

Quando o preview de PDF falhar:

- mostrar mensagem amigável;
- preservar o botão `Abrir em nova aba`;
- preservar o botão `Baixar` no card da Linha do Tempo;
- não deixar modal vazio sem explicação;
- não iniciar download automático ao tentar abrir.

Mensagens técnicas devem ser investigadas no console:

| Sintoma | Possível causa |
|---|---|
| `Failed to fetch` | CORS, URL inválida, policy ou token expirado. |
| `response.ok = false` | Arquivo removido, URL quebrada, permissão negada. |
| PDF.js não carregou | CDN indisponível, CSP, bloqueio de rede. |
| Erro de parse/renderização | PDF corrompido, MIME incorreto ou arquivo não-PDF. |
| `X-Frame-Options` | Google Viewer/iframe externo foi reintroduzido indevidamente. |

## Diagnóstico automatizado

O script `scripts/storage-diagnose-orphans.mjs` opera em dry-run por padrão e cruza:

- `pessoas.foto_principal_url`;
- `profiles.avatar_url`;
- `arquivos_historicos.storage_bucket/storage_path` e `url`;
- URLs publicadas e referências em `draft_payload` de `site_visual_settings`.

Buckets verificados por padrão:

- `person-avatars`;
- `historical-files`;
- `site-media`.

O bucket legado `logo` fica fora da limpeza automática padrão.

## Limpeza de órfãos

Possíveis órfãos:

- upload concluído, mas registro não salvo;
- registro removido sem remover arquivo;
- substituição de arquivo sem limpeza antiga;
- arquivo no bucket sem referência em `arquivos_historicos`;
- avatar antigo sem referência em `pessoas.foto_principal_url`.

A limpeza deve ser cautelosa e preferencialmente administrativa.

Regras:

- nunca remover arquivo apenas por nome parecido;
- cruzar `storage_path` com registros ativos;
- registrar dry-run antes de remoção real;
- usar Storage API para remoção física, não SQL direto em `storage.objects`.

## Não remover

- arquivos ainda referenciados em `arquivos_historicos.storage_path`;
- PDFs ainda exibidos na Linha do Tempo;
- imagens históricas ainda associadas a pessoa/fato;
- avatares referenciados em `pessoas.foto_principal_url`;
- mídias do site em uso;
- arquivos de pessoas vivas sem validação de permissão/consentimento.

## QA Storage

1. Upload de avatar.
2. Upload de imagem histórica.
3. Upload de PDF histórico.
4. Registro histórico sem upload.
5. Remoção/edição de registro.
6. Link público ou assinado de arquivo.
7. Falha amigável se bucket ausente.
8. Preview de PDF na Linha do Tempo.
9. Download de PDF pelo botão `Baixar`.
10. Abertura de PDF em nova aba pelo fallback do modal.
11. PDF removido do Storage sem registro atualizado.
12. PDF com `mime_type` incorreto.
13. URL expirada, quando o fluxo usar signed URL.

## QA específico do modal de PDF

Para um PDF em `historical-files`:

- abrir página de pessoa;
- localizar evento da Linha do Tempo;
- clicar em `Abrir`;
- confirmar modal;
- confirmar `Carregando PDF...`;
- confirmar renderização em canvas;
- rolar páginas se houver múltiplas;
- fechar modal;
- abrir novamente;
- confirmar que o componente não duplica canvases;
- clicar em `Abrir em nova aba`;
- clicar em `Baixar`.

## Regra de manutenção

Atualizar este documento quando:

- bucket novo for criado;
- regra de upload for alterada;
- arquivos históricos mudarem de schema;
- PDFs passarem a usar outra estratégia de preview;
- PDF.js mudar de CDN para dependência npm;
- RLS/policy/CORS de Storage mudar;
- fluxo de limpeza de órfãos for automatizado.
