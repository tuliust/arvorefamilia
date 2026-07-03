# Guia de correção de erros

> Última revisão: 2026-07-03
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

### Implementação atual

`src/main.tsx` testa disponibilidade de utilitários CSS e tenta reload controlado com parâmetro específico quando o CSS não parece carregado.

### Ação

1. Conferir se arquivos CSS foram publicados.
2. Confirmar cache/CDN.
3. Rodar build local.
4. Testar janela anônima.
5. Validar se o problema ocorre apenas após deploy ou também em `npm run dev`.

## Supabase sem tabela ou sem permissão

### Sintoma

Mensagens como tabela inexistente, permissão, RLS, token inválido ou erro ao carregar pessoas/relacionamentos.

### Implementação atual

`dataService.ts` converte erros comuns de Supabase em mensagens técnicas mais claras. Rotas e componentes devem falhar de forma defensiva, sem tela branca.

### Ação

1. Confirmar variáveis de ambiente do Supabase.
2. Confirmar existência das tabelas exigidas.
3. Confirmar políticas RLS.
4. Verificar SQLs documentados em `docs/operacao/MIGRATIONS_SUPABASE.md`.
5. Confirmar se migrations recentes foram aplicadas no ambiente remoto.

## Badges de `/meus-vinculos` incorretos

### Sintoma

Pessoa com conta vinculada aparece como `Pré-cadastrado`, ou pessoa sem vínculo aparece como `Cadastrado`.

### Implementação atual

`/meus-vinculos` depende de leitura controlada de `user_person_links`. A migration `20260701090000_allow_member_link_status_lookup.sql` cria a função/policy necessária para resolver status de badge.

### Ação

1. Confirmar se a migration foi aplicada no ambiente remoto.
2. Validar RLS de `user_person_links`.
3. Testar com usuário que tenha vínculo real e com pessoa sem vínculo.
4. Confirmar que falha de leitura não quebra a página.
5. Planejar RPC restrita que retorne apenas `pessoa_id`, caso a policy ampla deixe de ser aceitável.

## Curiosidades não carrega

### Sintoma

A rota `/curiosidades` não renderiza ou o console aponta erro em seleção de pessoa, RPC de badges ou carregamento de dados do questionário.

### Implementação atual

A página usa fallback para badges de perfil quando a RPC `get_person_profile_selected_badges` não estiver disponível. Seletores que usam Radix devem filtrar itens sem ID e iniciar neutros quando dependem de escolha do usuário.

### Ação

1. Confirmar se a migration da RPC foi aplicada no Supabase remoto.
2. Conferir se a página continua carregando pelo fallback.
3. Verificar se não existe item de seleção com valor vazio.
4. Conferir `/curiosidades` no QA manual.

## IA indisponível

### Sintoma

`api/ai.ts` retorna erro de configuração ou falha ao interpretar resposta.

### Causas prováveis

- `OPENAI_API_KEY` ausente.
- `OPENAI_MODEL` inválido ou indisponível.
- Resposta fora do JSON esperado para `profile_text`.
- Payload insuficiente.
- Falha temporária do provedor.

### Ação

1. Validar `OPENAI_API_KEY`.
2. Validar `OPENAI_MODEL` se estiver definido.
3. Reproduzir payload mínimo.
4. Conferir se `selectedBadges`, `customTraits` ou `answers` foram enviados quando `purpose === "profile_text"`.
5. Garantir que erro de IA não bloqueia leitura de conteúdo já existente.

## Diálogo nativo do navegador aparece

### Sintoma

A aplicação abre um `alert`, `confirm` ou `prompt` nativo do navegador em vez de toast, `ConfirmDialog` ou modal próprio.

### Implementação atual

A UI da branch `main` deve usar:

- `toast` de `sonner` para feedback não bloqueante;
- `ConfirmDialog` para confirmação de ações;
- `Dialog` controlado para coleta de texto.

O único resultado esperado na varredura textual pode ser `src/app/components/ui/alert.tsx`, que é componente visual, não diálogo nativo.

### Ação em PowerShell

```powershell
Select-String -Path (Get-ChildItem .\src -Recurse -File -Include *.ts,*.tsx) `
  -Pattern "\b(?:window\.)?confirm\s*\(|\b(?:window\.)?alert\s*\(|\b(?:window\.)?prompt\s*\(" |
  Select-Object Path, LineNumber, Line
```

Se aparecer arquivo diferente de `src/app/components/ui/alert.tsx`, substituir:

- `alert` por `toast`;
- `confirm` por `ConfirmDialog`;
- `prompt` por modal controlado.

Depois rodar `npm run build` e `git diff --check`.

## Mojibake em documentação

### Sintoma

Aparecem sequências de texto corrompido em arquivos de `docs/`, especialmente o caractere `U+FFFD`.

### Ação em Bash/Git Bash

```bash
grep -R $'\xEF\xBF\xBD' docs || true
```

### Ação em PowerShell

```powershell
Get-ChildItem .\docs -Recurse -File | Select-String -SimpleMatch ([char]0xFFFD)
```

Se houver resultado:

1. Abrir o arquivo em editor configurado para UTF-8.
2. Corrigir o texto.
3. Salvar em UTF-8.
4. Repetir a busca.

## Comandos Bash usados por engano no PowerShell

### Sintoma

Erro como:

```text
O token '||' não é um separador de instruções válido nesta versão.
```

### Causa

O comando usa sintaxe de Bash:

- `$'...'` para ANSI-C quoting;
- `|| true` para ignorar código de saída.

Windows PowerShell 5.x não entende essa sintaxe.

### Ação

Use comandos separados ou equivalentes PowerShell:

```powershell
git status --short
git diff --check

# Busca o caractere de substituição Unicode U+FFFD em docs/.
Get-ChildItem .\docs -Recurse -File | Select-String -SimpleMatch ([char]0xFFFD)

npm run typecheck
npm run build
npm test
```

## Link quebrado no índice

### Sintoma

`docs/README.md` ou `README.md` aponta para arquivo inexistente.

### Ação

1. Conferir todos os caminhos listados.
2. Corrigir índice ou restaurar documento.
3. Se o documento antigo foi consolidado, apontar para `docs/historico/LEGADO_TECNICO.md`.
4. Registrar mudança no relatório histórico apenas se houver valor real de rastreabilidade.

## Script antigo de reorganização documental

### Sintoma

`docs/README.md` volta a listar documentos removidos, antigos ou fragmentados depois de executar script de organização.

### Causa provável

`scripts/reorganizar-documentacao.sh` ou `scripts/reorganizar-documentacao.ps1` pode conter uma versão antiga do índice canônico.

### Ação

1. Não executar esses scripts sem revisão.
2. Tratar como legado ou mover para histórico.
3. Preferir atualização manual dos documentos canônicos.
4. Se for necessário automatizar, criar novo script que apenas valide links e não reescreva documentação.

## Validação final recomendada

### Bash/Git Bash

```bash
git status --short
git diff --check
grep -R $'\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
npm test
```

### PowerShell

```powershell
git status --short
git diff --check

# Busca o caractere de substituição Unicode U+FFFD em docs/.
Get-ChildItem .\docs -Recurse -File | Select-String -SimpleMatch ([char]0xFFFD)

npm run typecheck
npm run build
npm test
```
