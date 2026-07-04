# Atribuições e licenças

> Última revisão: 2026-07-04
> Local recomendado: `docs/ATTRIBUTIONS.md`
> Tipo: atribuições de terceiros e referências de licença.
> Status: canônico/complementar para auditoria de dependências, componentes, ícones, imagens, PDFs, serviços externos e conteúdo familiar.

## 1. Objetivo

Este arquivo registra atribuições, dependências externas, componentes, ícones, imagens, documentos e materiais usados no projeto **Árvore Família** quando houver obrigação ou recomendação de crédito.

Este documento é complementar e não substitui:

```txt
package.json
package-lock.json
LICENSE
README.md
docs/README.md
```

Regras gerais:

- `package.json` e o lockfile são a referência técnica das dependências instaladas.
- A licença efetiva de cada dependência deve ser conferida no pacote instalado antes de redistribuição comercial, publicação ampla ou auditoria jurídica.
- Este documento não deve conter secrets, tokens, chaves de API, URLs assinadas, dumps, dados pessoais, documentos familiares reais ou prints com dados sensíveis.
- Uploads familiares não são assets livres para redistribuição.

## 2. shadcn/ui

Este projeto inclui ou pode incluir componentes derivados/adaptados de **shadcn/ui**.

- Site: `https://ui.shadcn.com/`
- Licença de referência: MIT, conforme repositório oficial do projeto.

Regras:

- componentes copiados ou adaptados devem preservar compatibilidade com a licença original;
- alterações locais de estilo, composição ou nomenclatura não removem a necessidade de respeitar a licença de origem;
- se um componente for substituído por implementação própria, manter atribuição apenas enquanto houver derivação relevante.

## 3. Radix UI

Componentes de UI podem usar primitives do **Radix UI**, conforme dependências declaradas no projeto.

Exemplos de uso atual:

```txt
Dialog
Select
Accordion
Popover
DropdownMenu
AlertDialog
```

Regras:

- conferir a licença no pacote instalado antes de redistribuição ou auditoria;
- wrappers locais devem manter compatibilidade com a licença da dependência;
- componentes de diálogo usados para visualização de PDF, confirmação ou formulários devem continuar sem `alert`, `confirm` ou `prompt` nativos.

## 4. lucide-react e ícones

O projeto usa **lucide-react** para ícones de interface, árvore, linha do tempo, anexos e navegação.

Exemplos de uso funcional:

```txt
User
PawPrint
Star
Cross
Calendar
CalendarX
Heart
HeartCrack
Search
Settings
FileText
Download
ExternalLink
Image
Users
BookOpen
```

Contrato visual atual:

| Caso | Renderização |
|---|---|
| Pessoa com foto | `foto_principal_url` |
| Pessoa humana sem foto | ícone `User` |
| Pet sem foto | ícone `PawPrint` |
| Anexo PDF na linha do tempo | ícone `FileText` |
| Anexo imagem na linha do tempo | ícone `Image` |
| Ação de download | ícone `Download` |
| Ação de abertura | ícone `ExternalLink` |

Regras:

- não há fallback visual obrigatório por gênero nos cards atuais;
- não incorporar SVG externo sem verificar origem, licença e atribuição;
- se algum SVG externo for copiado para o código, registrar autor, URL, licença e arquivo de destino neste documento.

## 5. PDF.js via CDN

A visualização de PDFs históricos na Linha do Tempo usa **PDF.js** carregado por CDN no componente:

```txt
src/app/components/Timeline/PdfDocumentPreview.tsx
```

URLs técnicas atualmente usadas:

```txt
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

Contrato funcional:

- o PDF não é exibido por iframe externo;
- o componente carrega a biblioteca PDF.js em runtime;
- o PDF é buscado por `fetch(url, { cache: 'no-store' })`;
- o arquivo é lido como `ArrayBuffer`;
- as páginas são renderizadas em `<canvas>`;
- o modal mantém fallback para `Abrir em nova aba`.

Motivo da decisão:

- Google Viewer em iframe foi descartado porque pode retornar bloqueio `X-Frame-Options: sameorigin`;
- iframe direto do PDF pode depender do navegador e não garantir renderização uniforme;
- canvas via PDF.js evita incorporar página externa em iframe e mantém preview dentro do modal.

Auditoria necessária:

- confirmar licença do PDF.js no pacote/projeto oficial antes de redistribuição ampla;
- confirmar disponibilidade e política de uso do CDN escolhido;
- em produção crítica, avaliar empacotar PDF.js como dependência local para reduzir dependência externa de CDN;
- se o CDN for alterado, atualizar este documento, `GUIA_COMPONENTES.md`, `GUIA_IMPLEMENTACOES.md`, `GUIA_CORRECAO_ERROS.md` e `STORAGE_MAINTENANCE.md`.

## 6. React Flow / xyflow

O projeto ainda pode conter stack legado relacionado a React Flow/xyflow, mesmo que as views oficiais atuais da árvore usem HTML/CSS/SVG próprios.

Regras:

- enquanto houver dependência instalada ou código derivado, manter auditoria de licença via `package.json`;
- a presença de React Flow no projeto não significa que `/genealogia` ou `/visao-completa` sejam views ativas;
- eventual remoção de React Flow/Dagre deve ser tratada em frente técnica própria.

## 7. Dependências npm

As dependências do projeto estão declaradas em:

```txt
package.json
package-lock.json
```

Principais bibliotecas ou grupos usados incluem, entre outras:

```txt
React
Vite
TypeScript
Tailwind CSS
Supabase JS
React Router
React Flow / xyflow
lucide-react
html2canvas
jsPDF
Radix UI
react-easy-crop
Vitest
Playwright
```

Observação:

- PDF.js da visualização atual de documentos históricos não está necessariamente declarado no `package.json`, pois é carregado por CDN pelo componente `PdfDocumentPreview.tsx`.
- Caso PDF.js passe a ser instalado via npm, atualizar `package.json`, lockfile e esta documentação.

## 8. Unsplash e imagens externas

Este projeto pode incluir fotos oriundas do **Unsplash** ou de bancos de imagem externos.

Regras:

- registrar autor, URL da foto e licença quando uma imagem específica for incorporada ao produto final;
- evitar usar imagens externas sem confirmar licença;
- se a imagem for substituída por upload próprio da família ou asset autoral, remover atribuição específica desnecessária;
- não usar imagem externa em perfil, árvore ou demonstração pública sem autorização/licença compatível.

Modelo:

```txt
Arquivo:
Fonte:
Autor:
URL:
Licença:
Data de consulta:
Uso no projeto:
```

## 9. Conteúdo familiar e uploads

Fotos, documentos, arquivos históricos, nomes, datas, relatos e dados pessoais adicionados ao sistema são conteúdo da própria família, dos usuários ou do acervo familiar.

Regras:

- não reutilizar fora do projeto sem autorização;
- não usar como material de demonstração pública sem consentimento;
- preservar privacidade de pessoas vivas;
- não incluir dados sensíveis em documentação pública, issues, commits ou exemplos;
- não usar arquivos reais em screenshots de documentação pública sem anonimização;
- uploads familiares não são assets livres para redistribuição;
- PDFs históricos exibidos em modal continuam sendo documentos privados/familiares e devem respeitar as permissões do sistema.

## 10. IA e conteúdo gerado

O projeto pode usar IA em funcionalidades como curiosidades, perguntas assistidas, mini bio, astrologia e fatos do nascimento.

Regras:

- conteúdo gerado por IA deve ser tratado como auxiliar, revisável e dependente do contexto fornecido;
- não usar IA para inventar biografias, datas, relacionamentos ou fatos familiares;
- não enviar secrets, service role, tokens ou dados desnecessários para prompts;
- se algum conteúdo gerado for publicado como texto final permanente, revisar autoria, privacidade e adequação antes de exposição pública;
- fatos históricos gerados por IA devem ser conservadores e editáveis, especialmente quando não houver segurança sobre fato específico do dia.

## 11. Google, Supabase, Resend, OpenAI e serviços externos

O projeto pode integrar serviços externos como:

```txt
Supabase
Google Maps/Places
Google Calendar/OAuth
Resend
OpenAI/serverless IA
CDNJS
```

Regras:

- termos de uso, marcas e requisitos de atribuição devem ser revisados no serviço correspondente;
- chaves, tokens e client secrets não devem constar neste documento;
- requisitos de OAuth/Google Agenda ficam em `docs/operacao/OAUTH_GOOGLE.md`;
- requisitos de Storage ficam em `docs/operacao/STORAGE_MAINTENANCE.md`;
- Edge Functions e deploy operacional ficam em `docs/operacao/MIGRATIONS_SUPABASE.md` e `docs/operacao/DEPLOY.md`.

## 12. Manutenção

Atualizar este arquivo quando:

- nova biblioteca com exigência de atribuição for adicionada;
- imagem externa for incorporada ao repositório;
- asset externo for usado em página pública;
- SVG externo for copiado para o código;
- ícone ou pacote visual novo substituir `lucide-react`;
- houver mudança de licença relevante;
- PDF.js deixar de ser carregado por CDN e virar dependência npm;
- o CDN de PDF.js for alterado.

Checklist:

```bash
git status --short
git diff --check
npm run typecheck
npm run build
npm run test
```

## 13. Não registrar aqui

Não inserir neste arquivo:

- secrets;
- tokens;
- chaves de API;
- service role;
- URLs assinadas;
- dados pessoais;
- dumps;
- prints com dados reais;
- textos longos de licenças copiadas sem necessidade;
- decisões funcionais de produto;
- troubleshooting operacional.
