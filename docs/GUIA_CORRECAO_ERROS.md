# Guia de correção de erros

> Última revisão: 2026-06-27
> Escopo: erros conhecidos de operação e manutenção documental/técnica.
> Status: canônico.

## Erro de chunk ou asset JS

### Sintoma

Tela de rota não carrega após deploy ou troca de versão.

### Implementação atual

`src/app/routes.tsx` possui boundary de erro e handler global para falhas de import dinâmico ou asset JS. A recuperação tenta reload controlado com chave de sessão.

### Ação

1. Recarregar a página.
2. Limpar cache do navegador se persistir.
3. Verificar se o deploy publicou todos os arquivos de `dist/assets`.

## Supabase sem tabela ou sem permissão

### Sintoma

Mensagens como tabela inexistente, permissão, RLS, token inválido ou erro ao carregar pessoas/relacionamentos.

### Implementação atual

`dataService.ts` converte erros comuns de Supabase em mensagens técnicas mais claras.

### Ação

1. Confirmar variáveis de ambiente do Supabase.
2. Confirmar existência das tabelas exigidas.
3. Confirmar políticas RLS.
4. Verificar SQLs documentados em `docs/operacao/MIGRATIONS_SUPABASE.md`.

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
- Modelo indisponível.
- Resposta fora do JSON esperado para `profile_text`.
- Payload insuficiente.

### Ação

1. Validar `OPENAI_API_KEY`.
2. Validar `OPENAI_MODEL` se estiver definido.
3. Reproduzir payload mínimo.
4. Conferir se `selectedBadges`, `customTraits` ou `answers` foram enviados quando `purpose === "profile_text"`.

## Diálogo nativo do navegador aparece

### Sintoma

A aplicação abre um `alert`, `confirm` ou `prompt` nativo do navegador em vez de toast, `ConfirmDialog` ou modal próprio.

### Implementação atual

A UI da branch `main` deve usar:

- `toast` de `sonner` para feedback não bloqueante;
- `ConfirmDialog` para confirmação de ações;
- `Dialog` controlado para coleta de texto.

O único resultado esperado na varredura textual é `src/app/components/ui/alert.tsx`, que é componente visual.

### Ação

1. Rodar a varredura:

```powershell
Select-String -Path (Get-ChildItem src -Recurse -File -Include *.ts,*.tsx) `
  -Pattern "\b(?:window\.)?confirm\s*\(|\b(?:window\.)?alert\s*\(|\b(?:window\.)?prompt\s*\(" |
  Select-Object Path, LineNumber, Line
```

2. Se aparecer arquivo diferente de `src/app/components/ui/alert.tsx`, substituir:
   - `alert` por `toast`;
   - `confirm` por `ConfirmDialog`;
   - `prompt` por modal controlado.
3. Rodar `npm run build` e `git diff --check`.
4. Validar manualmente o fluxo alterado.

## Mojibake em documentação

### Sintoma

Aparecem sequências de texto corrompido em arquivos de `docs/`.

### Ação

```bash
grep -R $'\xC3\|\xC2\|\xEF\xBF\xBD' docs || true
```

Corrigir o arquivo em UTF-8 e repetir a busca.

## Link quebrado no índice

### Sintoma

`docs/README.md` aponta para arquivo inexistente.

### Ação

1. Conferir todos os caminhos listados.
2. Corrigir índice ou restaurar documento.
3. Registrar mudança no relatório histórico se houver remoção.
