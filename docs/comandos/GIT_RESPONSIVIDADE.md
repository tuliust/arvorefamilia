# Git  comandos de responsividade mobile/tablet

> Local recomendado: `docs/comandos/GIT_RESPONSIVIDADE.md`
> Tipo: comando/checklist tecnico pontual.
> Status: referencia operacional, nao documentacao funcional canonica.

---

## 1. Objetivo

Este documento registra comandos Git usados durante a frente de **responsividade mobile/tablet**.

Use apenas como referencia rapida para situacoes de branch, push, revisao de diff e validacao antes de commit.

Para documentacao canonica de UX/responsividade, use:

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

Conferir relacao com remoto:

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

- nao usar `rebase` em branch compartilhada sem alinhamento previo;
- se houver conflito, resolver arquivo por arquivo e rodar validacao antes do push.

---

## 5. Validar antes de commit

Checklist minimo:

```bash
git status
npm run build
npm test
git diff --check
```

Quando a alteracao envolver layout, arvore, painel lateral ou responsividade:

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

Diff de arquivo especifico:

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

Adicionar alteracoes:

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

Nao commitar:

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
- o projeto passar a usar PR obrigatorio;
- os comandos de validacao mudarem;
- `npm test` ou `npm run test:e2e` forem substituidos;
- a frente de responsividade deixar de ser uma branch especifica e virar checklist permanente.

---

## 10. Observacao documental

Este arquivo e um comando auxiliar. Nao deve acumular diagnostico, decisoes de UX, checklist final de QA ou historico longo.

Se o conteudo crescer, separar em:

```txt
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
docs/historico/QA_FINAL_MVP.md
```
