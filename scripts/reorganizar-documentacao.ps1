# Reorganiza a documentacao do projeto Arvore Familia.
# Uso no PowerShell, a partir da raiz do projeto:
#   powershell -ExecutionPolicy Bypass -File scripts/reorganizar-documentacao.ps1
#
# Versao intencionalmente sem acentos no conteudo gravado para evitar mojibake
# em Windows PowerShell 5.x quando o arquivo .ps1 e interpretado com codepage local.

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
    Write-Host "[skip] nao existe: $Source"
    return
  }

  $DestinationDir = Split-Path -Parent $Destination
  Ensure-Dir $DestinationDir

  if (Test-Path -LiteralPath $Destination) {
    Ensure-Dir $BackupDir
    $BackupPath = Join-Path $BackupDir (Split-Path -Leaf $Destination)
    Write-Host "[backup] destino ja existe: $Destination -> $BackupPath"
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
    Write-Host "[skip] ja existe: $FilePath"
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
# Documentacao - Arvore Familia

Este diretorio e o indice canonico da documentacao do projeto.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, historicos ou arquivos soltos na raiz do repositorio.

## Guias oficiais

- `GUIA_IMPLEMENTACOES.md` - estado consolidado do que ja foi implementado.
- `GUIA_COMPONENTES.md` - componentes reutilizaveis, responsabilidades e cuidados contra regressoes.
- `GUIA_UX_LAYOUT.md` - decisoes de UX, layout, responsividade e comportamento visual.
- `GUIA_CORRECAO_ERROS.md` - investigacao e correcao por sintoma.
- `PLANO_PROXIMOS_PASSOS.md` - pendencias de lancamento, escopo congelado e backlog pos-MVP.

## Arquitetura

- `arquitetura/ROTAS_E_GUARDS.md` - rotas publicas, rotas de membro, rotas administrativas e guards de acesso.

## Funcionalidades especificas

- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`
- `funcionalidades/CALENDARIO_FAMILIAR.md`
- `funcionalidades/EXPORTACAO_ARVORE.md`
- `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`
- `funcionalidades/MINHA_ARVORE_VIEW.md`
- `funcionalidades/NOTIFICACOES.md`
- `funcionalidades/PESSOAS_PERFIL_ADMIN.md`
- `funcionalidades/TIMELINE.md`

## Operacao e manutencao

- `operacao/README.md`
- `operacao/STORAGE_MAINTENANCE.md`
- `operacao/MIGRATIONS_SUPABASE.md`

## Comandos e checklists tecnicos

- `comandos/GIT_RESPONSIVIDADE.md`

## Historico, diagnosticos e QA

Documentos nesta pasta sao referencia historica, diagnostico pontual ou checklist de uma fase especifica. Eles nao devem substituir os guias oficiais.

- `historico/README.md`
- `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md`
- `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md`
- `historico/QA_7_6_EXPORTACAO_ARVORE.md`
- `historico/RESPONSIVIDADE_MOBILE_TABLET.md`
- `historico/documentacao-antiga/`

## Regras de organizacao

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades especificas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
6. Diagnosticos, relatorios antigos, QA e documentos de fase ficam em `docs/historico/`.
7. Documentos antigos da raiz do repositorio devem ser movidos para `docs/historico/documentacao-antiga/`.
8. Scripts SQL soltos sao historicos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
'@

  Set-Content -LiteralPath $FilePath -Value $Content -Encoding UTF8
}

Write-Step "1. Criando estrutura de pastas"
Ensure-Dir "docs/arquitetura"
Ensure-Dir "docs/funcionalidades"
Ensure-Dir "docs/operacao"
Ensure-Dir "docs/comandos"
Ensure-Dir "docs/historico/documentacao-antiga"

Write-Step "2. Movendo documentos antigos da raiz para historico"
Move-IfExists "INDICE-DOCUMENTACAO.md" "docs/historico/documentacao-antiga/INDICE-DOCUMENTACAO.md"
Move-IfExists "README-DOCUMENTACAO.md" "docs/historico/documentacao-antiga/README-DOCUMENTACAO.md"
Move-IfExists "MIGRATION-GUIDE.md" "docs/historico/documentacao-antiga/MIGRATION-GUIDE.md"
Move-IfExists "SETUP-BANCO-DADOS.md" "docs/historico/documentacao-antiga/SETUP-BANCO-DADOS.md"
Move-IfExists "RESPOSTA-RAPIDA-IRMAOS.md" "docs/historico/documentacao-antiga/RESPOSTA-RAPIDA-IRMAOS.md"
Move-IfExists "COMO-FUNCIONA-IRMAOS.md" "docs/historico/documentacao-antiga/COMO-FUNCIONA-IRMAOS.md"
Move-IfExists "RELATORIO-DIAGNOSTICO-COMPLETO.md" "docs/historico/documentacao-antiga/RELATORIO-DIAGNOSTICO-COMPLETO.md"
Move-IfExists "ERROS-E-SOLUCOES.md" "docs/historico/documentacao-antiga/ERROS-E-SOLUCOES.md"

Write-Step "3. Movendo documentos especificos da raiz de docs/ para funcionalidades"
Move-IfExists "docs/VIEW_VISAO_GERAL.md" "docs/funcionalidades/MINHA_ARVORE_VIEW.md"

Write-Step "4. Criando documentacoes novas em branco"
Create-BlankIfMissing "docs/arquitetura/ROTAS_E_GUARDS.md"
Create-BlankIfMissing "docs/operacao/MIGRATIONS_SUPABASE.md"
Create-BlankIfMissing "docs/funcionalidades/EXPORTACAO_ARVORE.md"

Write-Step "5. Redefinindo docs/README.md como indice canonico"
Write-CanonicalDocsReadme

Write-Step "6. Removendo lixo local conhecido, se existir"
if (Test-Path -LiteralPath "docs/.DS_Store") {
  Write-Host "[remove] docs/.DS_Store"
  Remove-Item -LiteralPath "docs/.DS_Store" -Force
} else {
  Write-Host "[skip] docs/.DS_Store nao encontrado"
}

Write-Step "7. Resultado"
Write-Host "Reorganizacao concluida. Revise com:"
Write-Host "  git status --short"
Write-Host "  git diff --stat"
Write-Host "  git diff -- docs/README.md"
Write-Host ""
Write-Host "Depois, rode validacoes basicas se desejar:"
Write-Host "  npm run build"
Write-Host "  git diff --check"
