# Git — comandos de responsividade, revisão documental e QA visual

> Última revisão: 2026-06-14  
> Local recomendado: `docs/comandos/GIT_RESPONSIVIDADE.md`  
> Tipo: referência operacional auxiliar.  
> Status: checklist de comandos; não é documentação funcional canônica.

---

## 1. Objetivo

Este documento reúne comandos Git e validações rápidas usados em frentes de responsividade, documentação, layout mobile/tablet e ajustes visuais do projeto **Árvore Família**.

Use este arquivo para:

- conferir branch;
- atualizar a branch local;
- revisar diff;
- validar alterações antes de commit;
- evitar inclusão de artefatos locais;
- substituir manualmente arquivos revisados em `docs/`;
- rodar QA mínimo de responsividade.

Este arquivo **não** define contratos de UX, componente, rota ou produto.

Para decisões vigentes, consultar:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/CALENDARIO_FAMILIAR.md
docs/PLANO_PROXIMOS_PASSOS.md
```

Para histórico de views removidas, consultar apenas:

```txt
docs/historico/
```

---

## 2. Regra atual de branch

Branch principal:

```bash
main
```

Branchs históricas, como:

```bash
feat/responsividade-mobile-tablet
```

devem ser entendidas apenas como referência de fase anterior. Para novas frentes, usar o nome real da branch em andamento.

Sugestões de nomes para novas frentes:

```bash
docs/revisao-final
fix/mobile-family-map-palettes
fix/calendar-mobile-categories
fix/horizontal-spouses
```

---

## 3. Conferir estado local

```bash
git branch --show-current
git status --short
git branch -vv
```

Antes de qualquer alteração relevante:

```bash
git pull --rebase origin main
```

Antes de commit documental simples:

```bash
git diff --check
```

Antes de commit que mexa em layout, árvore, calendário, CSS, exportação ou rota:

```bash
npm run build
git diff --check
```

Quando houver alteração funcional ou risco em rotas/guards:

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

Em branch de trabalho:

```bash
git checkout <nome-da-branch>
git rebase main
```

Regras:

- não usar `rebase` em branch compartilhada sem alinhamento prévio;
- resolver conflitos arquivo por arquivo;
- após conflito, rodar `git diff --check`;
- se o conflito afetar árvore, painel, calendário ou docs canônicos, rodar `npm run build`.

---

## 5. Criar branch de trabalho

```bash
git checkout main
git pull --rebase origin main
git checkout -b <nome-da-branch>
```

Exemplo:

```bash
git checkout -b docs/finalizar-documentacao
```

Enviar branch nova:

```bash
git push -u origin <nome-da-branch>
```

---

## 6. Revisar diff

Resumo geral:

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

Listar arquivos modificados:

```bash
git status --short
```

---

## 7. Substituir arquivos revisados em `docs/`

Ao receber arquivos revisados fora do repositório, copiar manualmente para o caminho canônico antes de commitar.

Exemplos:

```bash
cp /caminho/BASELINE_PRODUTO_ATUAL.md docs/BASELINE_PRODUTO_ATUAL.md
cp /caminho/MAPA_FAMILIAR_VIEW.md docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
cp /caminho/ARCHITECTURE.md docs/arquitetura/ARCHITECTURE.md
cp /caminho/DEPLOYMENT.md docs/operacao/DEPLOYMENT.md
cp /caminho/GIT_RESPONSIVIDADE.md docs/comandos/GIT_RESPONSIVIDADE.md
cp /caminho/ATTRIBUTIONS.md docs/ATTRIBUTIONS.md
```

No Windows/PowerShell, adaptar caminhos:

```powershell
Copy-Item "C:\caminho\BASELINE_PRODUTO_ATUAL.md" "docs\BASELINE_PRODUTO_ATUAL.md" -Force
```

Depois:

```bash
git diff --check -- docs/
git status --short
```

---

## 8. `git add` seguro

Adicionar explicitamente os arquivos alterados:

```bash
git add docs/README.md
git add docs/BASELINE_PRODUTO_ATUAL.md
git add docs/INVENTARIO_TECNICO.md
git add docs/GUIA_IMPLEMENTACOES.md
git add docs/GUIA_COMPONENTES.md
git add docs/GUIA_UX_LAYOUT.md
git add docs/REGRAS_DE_NAO_REGRESSAO.md
git add docs/DECISOES_ARQUITETURAIS.md
git add docs/PLANO_PROXIMOS_PASSOS.md
```

Funcionalidades:

```bash
git add docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
git add docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
git add docs/funcionalidades/CALENDARIO_FAMILIAR.md
git add docs/funcionalidades/EXPORTACAO_ARVORE.md
git add docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
git add docs/funcionalidades/MINHA_ARVORE_EDITAR.md
git add docs/funcionalidades/FAVORITOS.md
git add docs/funcionalidades/FORUM.md
git add docs/funcionalidades/NOTIFICACOES.md
git add docs/funcionalidades/TIMELINE.md
git add docs/funcionalidades/CURIOSIDADES_E_IA.md
```

Arquitetura:

```bash
git add docs/arquitetura/ARCHITECTURE.md
git add docs/arquitetura/ROTAS_E_GUARDS.md
git add docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
```

Operação:

```bash
git add docs/operacao/README.md
git add docs/operacao/MIGRATIONS_SUPABASE.md
git add docs/operacao/DEPLOY.md
git add docs/operacao/DEPLOYMENT.md
git add docs/operacao/OAUTH_GOOGLE.md
git add docs/operacao/STORAGE_MAINTENANCE.md
```

Comandos e atribuições:

```bash
git add docs/comandos/GIT_RESPONSIVIDADE.md
git add docs/ATTRIBUTIONS.md
```

Evitar:

```bash
git add .
```

Só usar `git add .` quando `git status --short` estiver totalmente auditado.

---

## 9. Commit seguro

Conferir staged:

```bash
git status --short
git diff --cached --stat
git diff --cached --check
```

Commit documental amplo:

```bash
git commit -m "docs: revise project documentation"
```

Commit documental segmentado:

```bash
git commit -m "docs: update tree and mobile QA guides"
git commit -m "docs: update architecture and routing guides"
git commit -m "docs: update operation guides"
git commit -m "docs: update commands and attributions"
```

Push:

```bash
git pull --rebase origin main
git push origin main
```

Em branch de PR:

```bash
git push
```

---

## 10. Evitar commitar lixo local

Não commitar:

```txt
dist/
node_modules/
test-results/
playwright-report/
coverage/
backups/
*.bak
*.patch
.DS_Store
.env
.env.local
.env.*.local
.env*.save
```

Limpeza em shell Unix:

```bash
rm -rf test-results/ playwright-report/ coverage/
rm -rf backups/
find . -name "*.bak" -type f -delete
find . -name "*.patch" -type f -delete
```

Limpeza em PowerShell:

```powershell
Remove-Item -Recurse -Force test-results, playwright-report, coverage -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backups -ErrorAction SilentlyContinue
Get-ChildItem -Recurse -Filter *.bak | Remove-Item -Force
Get-ChildItem -Recurse -Filter *.patch | Remove-Item -Force
```

Conferir:

```bash
git status --short
```

---

## 11. QA de responsividade atual

Breakpoints mínimos:

```txt
320px
375px
390px
430px
768px
1024px
1366x768
1440x900
1536x864
1920x1080
```

Rotas prioritárias:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/calendario-familiar
/minha-arvore/editar
/pessoa/:id
/forum
/notificacoes
```

Checklist mobile da árvore:

```txt
/mapa-familiar
- navegação Paterno/Central/Materno preservada;
- cards não exibem "Nascimento não informado";
- bordas dos grupos seguem a paleta desktop;
- paletas branca, visual/azul, laranja e marrom estão coerentes.

/mapa-familiar-horizontal
- uma geração por tela;
- botões Ger X visíveis;
- sem barra Paterno/Central/Materno;
- sem scroll horizontal manual;
- cônjuges da Geração 4/Pais aparecem quando o filtro Cônjuges está ativo;
- paleta mobile não cai em fallback azul indevido.
```

Checklist calendário mobile:

```txt
/calendario-familiar
- 5 categorias em uma única linha;
- bolinha colorida acima do título;
- títulos em uma linha;
- sem overflow horizontal em 320px, 375px, 390px e 430px;
- card grande de categorias não duplica os filtros compactos no mobile.
```

Checklist modal mobile:

```txt
- título "Controles";
- botão X fecha;
- Vertical/Horizontal visíveis;
- Cores, Grupos e Destacar visíveis;
- filtros visíveis;
- sem Zoom, Restaurar e Exportar.
```

---

## 12. QA documental

Após substituir documentação:

```bash
git diff --check -- docs/
```

Buscas úteis:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" docs
rg "Filtros \| Legendas \| Ações" docs
rg "Nascimento não informado" docs
rg "G1|G2|G3" docs
rg "from-teal|to-cyan|border-cyan|bg-cyan|text-cyan" docs
```

Interpretação:

- `/minha-arvore/editar` é permitido;
- `docs/historico/` pode citar rotas removidas como legado;
- `genealogia` pode aparecer como conceito textual da horizontal;
- a barra `Filtros | Legendas | Ações` pode aparecer apenas como padrão removido;
- `Nascimento não informado` pode aparecer apenas como anti-regressão;
- classes de cor hardcoded em docs devem ser tratadas como alerta quando relacionadas ao mobile da árvore.

---

## 13. Quando revisar este arquivo

Revisar este documento se:

- o fluxo de branch/PR mudar;
- o projeto passar a exigir CI obrigatório;
- os scripts de validação mudarem;
- `npm test` ou `npm run test:e2e` forem substituídos;
- novos breakpoints forem adotados;
- novas rotas críticas forem adicionadas;
- a estrutura de documentação mudar.

---

## 14. Anti-regressões

Não transformar este arquivo em:

- guia de UX;
- histórico longo de QA;
- plano de próximos passos;
- documentação de componentes;
- documento canônico de responsividade;
- checklist operacional de banco, Storage ou deploy.

Se aparecer conteúdo funcional ou visual novo, migrar para:

```txt
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/funcionalidades/
docs/PLANO_PROXIMOS_PASSOS.md
```

Se aparecer conteúdo de banco, deploy, OAuth, Storage ou secrets, migrar para:

```txt
docs/operacao/
```
