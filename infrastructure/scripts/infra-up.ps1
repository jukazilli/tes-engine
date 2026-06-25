$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$ComposeFile = Join-Path $Root 'infrastructure\docker-compose.dev.yml'
$EnvFile = Join-Path $Root '.env.local'
$ValidateScript = Join-Path $PSScriptRoot 'infra-validate.ps1'
$StatusScript = Join-Path $PSScriptRoot 'infra-status.ps1'

Set-Location $Root

docker version | Out-Null
docker compose version | Out-Null
docker info | Out-Null

if (-not (Test-Path $EnvFile)) {
  throw 'Arquivo .env.local nao encontrado. Crie-o na raiz do projeto antes de subir a infraestrutura.'
}

docker compose --env-file $EnvFile -f $ComposeFile up -d

& $StatusScript
& $ValidateScript
