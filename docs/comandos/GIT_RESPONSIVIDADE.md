# Git â€” comandos de responsividade mobile/tablet

> Local recomendado: `docs/comandos/GIT_RESPONSIVIDADE.md`
> Tipo: comando/checklist tÃ©cnico pontual.
> Status: referÃªncia operacional, nÃ£o documentaÃ§Ã£o funcional canÃ´nica.

---

## 1. Objetivo

Este documento registra comandos Git usados durante a frente de **responsividade mobile/tablet**.

Use apenas como referÃªncia rÃ¡pida para situaÃ§Ãµes de branch, push, revisÃ£o de diff e validaÃ§Ã£o antes de commit.

Para documentaÃ§Ã£o canÃ´nica de UX/responsividade, use:

```txt
docs/GUIA_UX_LAYOUT.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
```

---

## 2. Enviar branch nova para o GitHub

Usar quando aparecer o erro:

```txt
fatal: The current branch feat/responsividade-mobile-tablet has no upstream branch.
```

Comando:

```bash
git push --set-upstream origin feat/responsividade-mobile-tablet
```

Forma curta equivalente:

```bash
git push -u origin feat/responsividade-mobile-tablet
```

---

## 3. Conferir branch atual

```bash
git branch --show-current
```

Conferir estado local:

```bash
git status --short
```

Conferir relaÃ§Ã£o com remoto:

```bash
git branch -vv
```

---

## 4. Atualizar branch local antes de trabalhar

Na branch principal:

```bash
git checkout main
git pull
```

Na branch de trabalho:

```bash
git checkout feat/responsividade-mobile-tablet
git merge main
```

ou, se o fluxo do projeto preferir rebase:

```bash
git checkout feat/responsividade-mobile-tablet
git rebase main
```

Regra:

- nÃ£o usar `rebase` em branch compartilhada sem alinhamento prÃ©vio;
- se houver conflito, resolver arquivo por arquivo e rodar validaÃ§Ã£o antes do push.

---

## 5. Validar antes de commit

Checklist mÃ­nimo:

```bash
git status
npm run build
npm test
git diff --check
```

Quando a alteraÃ§Ã£o envolver layout, Ã¡rvore, painel lateral ou responsividade:

```bash
npm run test:e2e
```

---

## 6. Revisar diff

Resumo:

```bash
git diff --stat
```

Diff completo:

```bash
git diff
```

Diff de arquivo especÃ­fico:

```bash
git diff -- caminho/do/arquivo
```

Arquivos staged:

```bash
git diff --cached --stat
git diff --cached
```

---

## 7. Commit

Adicionar alteraÃ§Ãµes:

```bash
git add -A
```

Conferir staged:

```bash
git status --short
git diff --cached --stat
```

Commit:

```bash
git commit -m "style: ajustar responsividade mobile e tablet"
```

Push:

```bash
git push
```

---

## 8. Evitar commitar lixo local

NÃ£o commitar:

```txt
dist/
test-results/
playwright-report/
backups/
*.bak
*.patch
.DS_Store
.env
.env.local
```

Se aparecerem no status:

```bash
git status --short
```

Remover exemplos comuns:

```bash
rm -rf test-results/ playwright-report/
rm -rf backups/
find . -name "*.bak" -type f -delete
```

No PowerShell:

```powershell
Remove-Item -Recurse -Force test-results, playwright-report -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backups -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter *.bak | Remove-Item -Force
```

---

## 9. Quando este arquivo deve ser revisado

Revisar este documento se:

- o fluxo de branches mudar;
- o projeto passar a usar PR obrigatÃ³rio;
- os comandos de validaÃ§Ã£o mudarem;
- `npm test` ou `npm run test:e2e` forem substituÃ­dos;
- a frente de responsividade deixar de ser uma branch especÃ­fica e virar checklist permanente.

---

## 10. ObservaÃ§Ã£o documental

Este arquivo Ã© um comando auxiliar. NÃ£o deve acumular diagnÃ³stico, decisÃµes de UX, checklist final de QA ou histÃ³rico longo.

Se o conteÃºdo crescer, separar em:

```txt
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
docs/historico/QA_FINAL_MVP.md
```
