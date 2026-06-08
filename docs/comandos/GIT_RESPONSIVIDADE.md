# Git — comandos de responsividade mobile/tablet

> Última revisão: 2026-06-08  
> Local recomendado: `docs/comandos/GIT_RESPONSIVIDADE.md`  
> Tipo: referência operacional histórica.  
> Status: manter como checklist auxiliar; não é documentação funcional canônica.

---

## 1. Objetivo

Este documento preserva comandos Git usados durante a frente de responsividade mobile/tablet.

Use este arquivo apenas para:

- conferir branch;
- revisar diff;
- validar alterações antes de commit;
- evitar inclusão de lixo local;
- entender o fluxo usado naquela frente histórica.

Para decisões atuais de UX, mobile e responsividade, use:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/GENEALOGIA_VIEW.md
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
```

---

## 2. Regra atual

O projeto está na branch principal:

```bash
main
```

Este documento cita a branch histórica:

```bash
feat/responsividade-mobile-tablet
```

Essa branch deve ser entendida como referência de fase. Para novas frentes, substituir o nome da branch pelos nomes reais usados no momento.

---

## 3. Conferir estado local

```bash
git branch --show-current
git status --short
git branch -vv
```

Antes de qualquer commit documental, confirmar:

```bash
git diff --check
npm run build
```

Se houver alteração funcional ou visual relevante:

```bash
npm test
npm run test:e2e
```

---

## 4. Atualizar branch antes de trabalhar

Na branch principal:

```bash
git checkout main
git pull --rebase origin main
```

Em branch de trabalho, quando aplicável:

```bash
git checkout <nome-da-branch>
git rebase main
```

Regra:

- não usar `rebase` em branch compartilhada sem alinhamento prévio;
- se houver conflito, resolver arquivo por arquivo;
- depois de resolver conflitos, rodar build e `git diff --check`.

---

## 5. Enviar branch nova para o GitHub

Quando aparecer:

```txt
fatal: The current branch <branch> has no upstream branch.
```

Usar:

```bash
git push --set-upstream origin <branch>
```

Forma curta:

```bash
git push -u origin <branch>
```

Exemplo histórico:

```bash
git push -u origin feat/responsividade-mobile-tablet
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

Diff de arquivo específico:

```bash
git diff -- caminho/do/arquivo
```

Arquivos staged:

```bash
git diff --cached --stat
git diff --cached
```

---

## 7. Commit seguro

Adicionar apenas o necessário:

```bash
git add caminho/do/arquivo
```

Evitar:

```bash
git add .
```

Conferir staged:

```bash
git status --short
git diff --cached --stat
```

Commit de documentação final sugerido nesta frente:

```bash
git commit -m "docs: revise final project documentation"
```

Push:

```bash
git pull --rebase origin main
git push origin main
```

---

## 8. Evitar commitar lixo local

Não commitar:

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

Limpeza em shell Unix:

```bash
rm -rf test-results/ playwright-report/
rm -rf backups/
find . -name "*.bak" -type f -delete
```

Limpeza em PowerShell:

```powershell
Remove-Item -Recurse -Force test-results, playwright-report -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backups -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter *.bak | Remove-Item -Force
```

---

## 9. Relação com a frente documental atual

Para substituir manualmente arquivos revisados em `docs/`, usar `git add` explícito por arquivo ou grupo controlado.

Exemplo:

```bash
git add docs/PLANO_PROXIMOS_PASSOS.md
git add docs/GUIA_IMPLEMENTACOES.md
git add docs/funcionalidades/FORUM.md
```

O comando consolidado do commit final deve permanecer em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

---

## 10. Quando revisar este arquivo

Revisar este documento apenas se:

- o fluxo de branches mudar;
- o projeto passar a exigir PR obrigatório;
- os comandos de validação mudarem;
- `npm test` ou `npm run test:e2e` forem substituídos;
- a documentação histórica de responsividade for movida ou removida.

---

## 11. Anti-regressões

Não transformar este arquivo em:

- guia de UX;
- histórico longo de QA;
- plano de próximos passos;
- documentação de componentes;
- documento canônico de responsividade.

Se aparecer conteúdo funcional ou visual novo, mover para:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/funcionalidades/
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
```
