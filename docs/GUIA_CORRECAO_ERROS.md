# Guia de correção de erros

> Última revisão: 2026-07-04  
> Escopo: erros conhecidos de operação e manutenção documental/técnica, com comandos compatíveis com Bash/Git Bash e Windows PowerShell.  
> Status: canônico.

## Erro de chunk ou asset JS

### Sintoma

Tela de rota não carrega após deploy, troca de versão ou publicação incompleta dos assets.

### Implementação atual

- `src/app/routes.tsx` possui fallback e error boundary de rota.
- `src/main.tsx` instala recuperação global para falhas de import dinâmico ou asset JS, limpa caches quando possível e tenta reload controlado com chave de sessão.
- A recuperação deve ocorrer uma vez por sessão para evitar loop de reload.

### Ação

1. Recarregar a página.
2. Limpar cache do navegador se persistir.
3. Verificar se o deploy publicou todos os arquivos de `dist/assets`.
4. Conferir se o host SPA retorna o `index.html` apenas para rotas internas, não para assets.
5. Validar `npm run build`.

## CSS ou Tailwind aparentemente ausente

### Sintoma

Página carrega sem estilos, elementos aparecem empilhados ou com layout quebrado após deploy.

### Ação

1. Conferir se arquivos CSS foram publicados.
2. Confirmar cache/CDN.
3. Rodar build local.
4. Testar janela anônima.
5. Validar se o problema ocorre apenas após deploy ou também em `npm run dev`.

## Supabase sem tabela ou sem permissão

### Sintoma

Mensagens como tabela inexistente, permissão, RLS, token inválido ou erro ao carregar pessoas/relacionamentos.

### Ação

1. Confirmar variáveis de ambiente do Supabase.
2. Confirmar existência das tabelas exigidas.
3. Confirmar políticas RLS.
4. Verificar SQLs documentados em `docs/operacao/MIGRATIONS_SUPABASE.md`.
5. Confirmar se migrations recentes foram aplicadas no ambiente remoto.

## PDF não aparece no modal

### Sintoma

Ao clicar em `Abrir` em um PDF da Linha do Tempo:

- o modal abre, mas o documento não aparece;
- aparece só ícone de PDF;
- aparece tela em branco;
- aparece erro de rede;
- aparece mensagem de erro do preview.

### Implementação atual

A visualização correta usa:

```txt
src/app/components/Timeline/PdfDocumentPreview.tsx
```

Contrato:

- PDF.js é carregado por CDN;
- o PDF é buscado via `fetch`;
- o arquivo é convertido para `ArrayBuffer`;
- cada página é renderizada em `<canvas>`;
- o modal mantém fallback `Abrir em nova aba`.

### Ação

1. Abrir console do navegador.
2. Confirmar se o erro é de `fetch`, CORS, CDN ou PDF.js.
3. Testar o link do arquivo em nova aba.
4. Confirmar que o arquivo ainda existe no bucket `historical-files`.
5. Confirmar que a URL está pública ou assinada e válida para o usuário.
6. Confirmar que o arquivo é realmente PDF e não HTML de erro.
7. Confirmar se o CDN de PDF.js está acessível.
8. Confirmar se CSP/ambiente bloqueia `cdnjs.cloudflare.com`.
9. Rodar build local.
10. Validar em navegador real.

## Erro `X-Frame-Options: sameorigin` ao abrir PDF

### Sintoma

Console mostra:

```txt
Refused to display 'https://docs.google.com/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.
```

### Causa

Google Viewer foi usado dentro de iframe. Esse serviço pode bloquear incorporação externa.

### Ação

1. Confirmar que `PersonTimeline.tsx` não monta URL `https://docs.google.com/gview`.
2. Confirmar que `AttachmentPreviewDialog` usa `PdfDocumentPreview` para PDFs.
3. Confirmar que PDF.js + canvas está ativo.
4. Rebuildar e publicar frontend.
5. Limpar cache do navegador/deploy se o erro persistir.

Não usar:

```txt
https://docs.google.com/gview?embedded=1&url=...
```

## Botão `Abrir` diferente do botão `Baixar`

### Sintoma

O botão `Abrir` parece maior, mais azul, mais pesado ou desalinhado em relação a `Baixar`.

### Implementação atual

Ambos devem usar a mesma classe base em `PersonTimeline.tsx`:

```txt
ATTACHMENT_ACTION_CLASS
```

Contrato visual:

```txt
inline-flex
items-center
gap-1
text-xs
font-semibold
leading-5
text-gray-600
hover:text-gray-900
```

### Ação

1. Conferir `ATTACHMENT_ACTION_CLASS`.
2. Conferir se `button` e `a` usam a mesma classe.
3. Conferir se o container pai não aplica `sm:text-sm` ou cor diferente a apenas uma ação.
4. Validar no navegador com zoom 100%.
5. Testar desktop e mobile.

## Frase de parentesco genérica indevida

### Sintoma

A aplicação mostra:

```txt
Há uma ligação familiar entre X e Y.
```

em um caso que deveria ter frase específica.

### Implementação atual

A camada principal está em:

```txt
src/app/utils/relationshipDegreeDisplay.ts
```

A camada de sobrescrita está em:

```txt
src/app/utils/relationshipSentenceOverrides.ts
```

Componentes que devem usar a camada com sobrescritas:

```txt
src/app/components/person/RelationshipFinder.tsx
src/app/pages/home/ConnectionDiscoveryPanel.tsx
```

### Ação

1. Conferir se o componente usa `getRelationshipResultSentenceWithOverrides`.
2. Conferir se o padrão do caminho está coberto.
3. Conferir se `includeInactiveSpouses` está coerente com a regra da rota.
4. Adicionar teste em `relationshipSentenceOverrides.test.ts`.
5. Rodar `npm run test`.
6. Validar no perfil e em `/curiosidades`.

## `avô/avó` aparece quando gênero é conhecido

### Sintoma

A frase mostra:

```txt
Condilênia Souza é avô/avó de Heitor Tsangaropulos.
```

### Esperado

```txt
Condilênia Souza é avó de Heitor Tsangaropulos.
```

### Ação

1. Conferir se a pessoa possui `genero = mulher`.
2. Conferir inferência de gênero em `relationshipDegreeDisplay.ts`.
3. Confirmar que a frase usa `getGrandparentLabel(originPerson)`.
4. Adicionar/rodar teste automatizado.
5. Validar em produção.

## IA indisponível

### Sintoma

`api/ai.ts` ou Edge Function retorna erro de configuração ou falha ao interpretar resposta.

### Ação

1. Validar `OPENAI_API_KEY`.
2. Validar `OPENAI_MODEL` se estiver definido.
3. Reproduzir payload mínimo.
4. Conferir logs da Edge Function no Supabase.
5. Garantir que erro de IA não bloqueia leitura de conteúdo já existente.
6. Se a função alterada for `generate-person-insights`, rodar:

```bash
supabase functions deploy generate-person-insights
```

PowerShell:

```powershell
supabase functions deploy generate-person-insights
```

## Conteúdo Brasil/Mundo não aparece nos fatos do nascimento

### Sintoma

A página/admin mostra o fato principal, mas não mostra:

```txt
O que estava acontecendo na época
Brasil
Mundo
```

### Implementação atual

A Edge Function deve gerar:

```txt
period_title
brazil.title
brazil.body
world.title
world.body
```

O admin deve carregar, editar e salvar esses campos.

### Ação

1. Confirmar se a função `generate-person-insights` foi publicada.
2. Em `/admin/gestao-conteudo-pessoas`, clicar em `Regenerar conteúdos`.
3. Conferir se `Texto Brasil` e `Texto Mundo` foram preenchidos.
4. Salvar.
5. Recarregar.
6. Conferir registro em `person_generated_insights`.
7. Confirmar `prompt_version = v2-contexto-brasil-mundo`.
8. Se vier incompleto, consultar logs para saber se o repair prompt falhou.

## Diálogo nativo do navegador aparece

### Sintoma

A aplicação abre um `alert`, `confirm` ou `prompt` nativo.

### Ação em PowerShell

```powershell
Select-String -Path (Get-ChildItem .\src -Recurse -File -Include *.ts,*.tsx) `
  -Pattern "\b(?:window\.)?confirm\s*\(|\b(?:window\.)?alert\s*\(|\b(?:window\.)?prompt\s*\(" |
  Select-Object Path, LineNumber, Line
```

## Mojibake em documentação

### Ação em Bash/Git Bash

```bash
grep -R --include='*.md' --include='*.txt' --include='*.json' --include='*.sql' $'\xEF\xBF\xBD' docs || true
```

### Ação em PowerShell

```powershell
Get-ChildItem -Path .\docs -Recurse -File |
  Where-Object { $_.Extension -in ".md", ".txt", ".json", ".sql" } |
  Select-String -SimpleMatch ([char]0xFFFD)
```

## Comandos Bash usados por engano no PowerShell

Windows PowerShell 5.x não entende `$'...'` nem `|| true`. Use equivalentes PowerShell.

## Link quebrado no índice

1. Conferir todos os caminhos listados.
2. Corrigir índice ou restaurar documento.
3. Se o documento antigo foi consolidado, apontar para `docs/historico/LEGADO_TECNICO.md`.

## Script antigo de reorganização documental

1. Não executar esses scripts sem revisão.
2. Tratar como legado ou mover para histórico.
3. Preferir atualização manual dos documentos canônicos.
4. Se for necessário automatizar, criar novo script que apenas valide links e não reescreva documentação.

## Validação final recomendada

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
