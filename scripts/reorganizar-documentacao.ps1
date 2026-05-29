# Reorganiza a documentação do projeto Árvore Família.
# Uso no PowerShell, a partir da raiz do projeto:
#   powershell -ExecutionPolicy Bypass -File scripts/reorganizar-documentacao.ps1
#
# O script:
# - cria subpastas necessárias;
# - move documentos antigos da raiz para docs/historico/documentacao-antiga/;
# - move documentos específicos da raiz de docs/ para docs/funcionalidades/;
# - cria documentações novas em branco para rotas/guards e migrations Supabase;
# - redefine docs/README.md como índice canônico;
# - evita sobrescrever arquivos existentes sem criar backup.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $RootDir

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = "docs/historico/documentacao-antiga/backups-reorganizacao-$Timestamp"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host $Message
}

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Move-IfExists {
  param(
    [string]$Source,
    [string]$Destination
  )

  if (-not (Test-Path -LiteralPath $Source)) {
    Write-Host "[skip] não existe: $Source"
    return
  }

  $DestinationDir = Split-Path -Parent $Destination
  Ensure-Dir $DestinationDir

  if (Test-Path -LiteralPath $Destination) {
    Ensure-Dir $BackupDir
    $BackupPath = Join-Path $BackupDir (Split-Path -Leaf $Destination)
    Write-Host "[backup] destino já existe: $Destination -> $BackupPath"
    Move-Item -LiteralPath $Destination -Destination $BackupPath -Force
  }

  Write-Host "[move] $Source -> $Destination"
  Move-Item -LiteralPath $Source -Destination $Destination -Force
}

function Create-BlankIfMissing {
  param([string]$FilePath)

  $Dir = Split-Path -Parent $FilePath
  Ensure-Dir $Dir

  if (Test-Path -LiteralPath $FilePath) {
    Write-Host "[skip] já existe: $FilePath"
    return
  }

  Write-Host "[create] $FilePath"
  New-Item -ItemType File -Path $FilePath -Force | Out-Null
}

function Write-CanonicalDocsReadme {
  $FilePath = "docs/README.md"
  Ensure-Dir "docs"

  if (Test-Path -LiteralPath $FilePath) {
    Ensure-Dir $BackupDir
    $BackupPath = Join-Path $BackupDir "README.md"
    Write-Host "[backup] $FilePath -> $BackupPath"
    Copy-Item -LiteralPath $FilePath -Destination $BackupPath -Force
  }

  $Content = @'
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
'@

  Set-Content -LiteralPath $FilePath -Value $Content -Encoding UTF8
}

Write-Step "1. Criando estrutura de pastas"
Ensure-Dir "docs/arquitetura"
Ensure-Dir "docs/funcionalidades"
Ensure-Dir "docs/operacao"
Ensure-Dir "docs/comandos"
Ensure-Dir "docs/historico/documentacao-antiga"

Write-Step "2. Movendo documentos antigos da raiz para histórico"
Move-IfExists "INDICE-DOCUMENTACAO.md" "docs/historico/documentacao-antiga/INDICE-DOCUMENTACAO.md"
Move-IfExists "README-DOCUMENTACAO.md" "docs/historico/documentacao-antiga/README-DOCUMENTACAO.md"
Move-IfExists "MIGRATION-GUIDE.md" "docs/historico/documentacao-antiga/MIGRATION-GUIDE.md"
Move-IfExists "SETUP-BANCO-DADOS.md" "docs/historico/documentacao-antiga/SETUP-BANCO-DADOS.md"
Move-IfExists "RESPOSTA-RAPIDA-IRMAOS.md" "docs/historico/documentacao-antiga/RESPOSTA-RAPIDA-IRMAOS.md"
Move-IfExists "COMO-FUNCIONA-IRMAOS.md" "docs/historico/documentacao-antiga/COMO-FUNCIONA-IRMAOS.md"
Move-IfExists "RELATORIO-DIAGNOSTICO-COMPLETO.md" "docs/historico/documentacao-antiga/RELATORIO-DIAGNOSTICO-COMPLETO.md"
Move-IfExists "ERROS-E-SOLUCOES.md" "docs/historico/documentacao-antiga/ERROS-E-SOLUCOES.md"

Write-Step "3. Movendo documentos específicos da raiz de docs/ para funcionalidades"
Move-IfExists "docs/VIEW_VISAO_GERAL.md" "docs/funcionalidades/MINHA_ARVORE_VIEW.md"

Write-Step "4. Criando documentações novas em branco"
Create-BlankIfMissing "docs/arquitetura/ROTAS_E_GUARDS.md"
Create-BlankIfMissing "docs/operacao/MIGRATIONS_SUPABASE.md"
Create-BlankIfMissing "docs/funcionalidades/EXPORTACAO_ARVORE.md"

Write-Step "5. Redefinindo docs/README.md como índice canônico"
Write-CanonicalDocsReadme

Write-Step "6. Removendo lixo local conhecido, se existir"
if (Test-Path -LiteralPath "docs/.DS_Store") {
  Write-Host "[remove] docs/.DS_Store"
  Remove-Item -LiteralPath "docs/.DS_Store" -Force
} else {
  Write-Host "[skip] docs/.DS_Store não encontrado"
}

Write-Step "7. Resultado"
Write-Host "Reorganização concluída. Revise com:"
Write-Host "  git status --short"
Write-Host "  git diff --stat"
Write-Host "  git diff -- docs/README.md"
Write-Host ""
Write-Host "Depois, rode validações básicas se desejar:"
Write-Host "  npm run build"
Write-Host "  git diff --check"
