param(
  [string]$Service
)

$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$ComposeFile = Join-Path $Root 'infrastructure\docker-compose.dev.yml'
$EnvFile = Join-Path $Root '.env.local'

Set-Location $Root

if (-not (Test-Path $EnvFile)) {
  throw 'Arquivo .env.local nao encontrado. Crie-o na raiz do projeto antes de usar a infraestrutura.'
}

if ($Service) {
  docker compose --env-file $EnvFile -f $ComposeFile logs -f $Service
} else {
  docker compose --env-file $EnvFile -f $ComposeFile logs -f
}
