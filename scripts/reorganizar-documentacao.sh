#!/usr/bin/env bash
set -euo pipefail

# Reorganiza a documentação do projeto Árvore Família.
# Uso:
#   bash scripts/reorganizar-documentacao.sh
#
# O script:
# - cria subpastas necessárias;
# - move documentos antigos da raiz para docs/historico/documentacao-antiga/;
# - move documentos específicos da raiz de docs/ para docs/funcionalidades/;
# - cria documentações novas em branco para rotas/guards e migrations Supabase;
# - redefine docs/README.md como índice canônico;
# - evita sobrescrever arquivos existentes sem criar backup.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="docs/historico/documentacao-antiga/backups-reorganizacao-$(date +%Y%m%d-%H%M%S)"

log() {
  printf '\n%s\n' "$1"
}

ensure_dir() {
  mkdir -p "$1"
}

move_if_exists() {
  local src="$1"
  local dest="$2"

  if [[ ! -e "$src" ]]; then
    echo "[skip] não existe: $src"
    return 0
  fi

  ensure_dir "$(dirname "$dest")"

  if [[ -e "$dest" ]]; then
    ensure_dir "$BACKUP_DIR"
    local backup_path="$BACKUP_DIR/$(basename "$dest")"
    echo "[backup] destino já existe: $dest -> $backup_path"
    mv "$dest" "$backup_path"
  fi

  echo "[move] $src -> $dest"
  mv "$src" "$dest"
}

create_blank_if_missing() {
  local file="$1"
  ensure_dir "$(dirname "$file")"

  if [[ -e "$file" ]]; then
    echo "[skip] já existe: $file"
    return 0
  fi

  echo "[create] $file"
  : > "$file"
}

write_canonical_docs_readme() {
  local file="docs/README.md"
  ensure_dir "docs"

  if [[ -e "$file" ]]; then
    ensure_dir "$BACKUP_DIR"
    echo "[backup] $file -> $BACKUP_DIR/README.md"
    cp "$file" "$BACKUP_DIR/README.md"
  fi

  cat > "$file" <<'EOF'
# Documentação — Árvore Família

Este diretório é o **índice canônico da documentação do projeto**.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, históricos ou arquivos soltos na raiz do repositório.

## Guias oficiais

- `GUIA_IMPLEMENTACOES.md` — estado consolidado do que já foi implementado.
- `GUIA_COMPONENTES.md` — componentes reutilizáveis, responsabilidades e cuidados contra regressões.
- `GUIA_UX_LAYOUT.md` — decisões de UX, layout, responsividade e comportamento visual.
- `GUIA_CORRECAO_ERROS.md` — investigação e correção por sintoma.
- `PLANO_PROXIMOS_PASSOS.md` — pendências de lançamento, escopo congelado e backlog pós-MVP.

## Arquitetura

- `arquitetura/ROTAS_E_GUARDS.md` — rotas públicas, rotas de membro, rotas administrativas e guards de acesso.

## Funcionalidades específicas

- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
- `funcionalidades/CALENDARIO_FAMILIAR.md`
- `funcionalidades/EXPORTACAO_ARVORE.md`
- `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
- `funcionalidades/MINHA_ARVORE_VIEW.md`
- `funcionalidades/NOTIFICACOES.md`
- `funcionalidades/PESSOAS_PERFIL_ADMIN.md`
- `funcionalidades/TIMELINE.md`

## Operação e manutenção

- `operacao/README.md`
- `operacao/STORAGE_MAINTENANCE.md`
- `operacao/MIGRATIONS_SUPABASE.md`

## Comandos e checklists técnicos

- `comandos/GIT_RESPONSIVIDADE.md`

## Histórico, diagnósticos e QA

Documentos nesta pasta são referência histórica, diagnóstico pontual ou checklist de uma fase específica. Eles **não devem substituir os guias oficiais**.

- `historico/README.md`
- `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md`
- `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md`
- `historico/QA_7_6_EXPORTACAO_ARVORE.md`
- `historico/RESPONSIVIDADE_MOBILE_TABLET.md`
- `historico/documentacao-antiga/`

## Regras de organização

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades específicas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
6. Diagnósticos, relatórios antigos, QA e documentos de fase ficam em `docs/historico/`.
7. Documentos antigos da raiz do repositório devem ser movidos para `docs/historico/documentacao-antiga/`.
8. Scripts SQL soltos são históricos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
EOF
}

log "1. Criando estrutura de pastas"
ensure_dir "docs/arquitetura"
ensure_dir "docs/funcionalidades"
ensure_dir "docs/operacao"
ensure_dir "docs/comandos"
ensure_dir "docs/historico/documentacao-antiga"

log "2. Movendo documentos antigos da raiz para histórico"
move_if_exists "INDICE-DOCUMENTACAO.md" "docs/historico/documentacao-antiga/INDICE-DOCUMENTACAO.md"
move_if_exists "README-DOCUMENTACAO.md" "docs/historico/documentacao-antiga/README-DOCUMENTACAO.md"
move_if_exists "MIGRATION-GUIDE.md" "docs/historico/documentacao-antiga/MIGRATION-GUIDE.md"
move_if_exists "SETUP-BANCO-DADOS.md" "docs/historico/documentacao-antiga/SETUP-BANCO-DADOS.md"
move_if_exists "RESPOSTA-RAPIDA-IRMAOS.md" "docs/historico/documentacao-antiga/RESPOSTA-RAPIDA-IRMAOS.md"
move_if_exists "COMO-FUNCIONA-IRMAOS.md" "docs/historico/documentacao-antiga/COMO-FUNCIONA-IRMAOS.md"
move_if_exists "RELATORIO-DIAGNOSTICO-COMPLETO.md" "docs/historico/documentacao-antiga/RELATORIO-DIAGNOSTICO-COMPLETO.md"
move_if_exists "ERROS-E-SOLUCOES.md" "docs/historico/documentacao-antiga/ERROS-E-SOLUCOES.md"

log "3. Movendo documentos específicos da raiz de docs/ para funcionalidades"
move_if_exists "docs/VIEW_VISAO_GERAL.md" "docs/funcionalidades/MINHA_ARVORE_VIEW.md"

log "4. Criando documentações novas em branco"
create_blank_if_missing "docs/arquitetura/ROTAS_E_GUARDS.md"
create_blank_if_missing "docs/operacao/MIGRATIONS_SUPABASE.md"
create_blank_if_missing "docs/funcionalidades/EXPORTACAO_ARVORE.md"

log "5. Redefinindo docs/README.md como índice canônico"
write_canonical_docs_readme

log "6. Removendo lixo local conhecido, se existir"
if [[ -e "docs/.DS_Store" ]]; then
  echo "[remove] docs/.DS_Store"
  rm -f "docs/.DS_Store"
else
  echo "[skip] docs/.DS_Store não encontrado"
fi

log "7. Resultado"
echo "Reorganização concluída. Revise com:"
echo "  git status --short"
echo "  git diff --stat"
echo "  git diff -- docs/README.md"
echo ""
echo "Depois, rode validações básicas se desejar:"
echo "  npm run build"
echo "  git diff --check"
