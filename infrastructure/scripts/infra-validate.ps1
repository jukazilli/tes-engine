$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$ComposeFile = Join-Path $Root 'infrastructure\docker-compose.dev.yml'
$EnvFile = Join-Path $Root '.env.local'

Set-Location $Root

function Read-EnvFile {
  param([string]$Path)

  $values = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) {
      return
    }

    $key, $value = $line -split '=', 2
    if ($key) {
      $values[$key] = $value
    }
  }

  return $values
}

function Invoke-Compose {
  param([string[]]$ComposeArgs)
  docker compose --env-file $EnvFile -f $ComposeFile @ComposeArgs
}

function Wait-HttpOk {
  param(
    [string]$Uri,
    [int]$Retries = 30
  )

  for ($i = 0; $i -lt $Retries; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  return $false
}

if (-not (Test-Path $EnvFile)) {
  throw 'Arquivo .env.local nao encontrado.'
}

$envValues = Read-EnvFile -Path $EnvFile
$postgresDb = $envValues['POSTGRES_DB']
$postgresUser = $envValues['POSTGRES_USER']
$postgresPort = $envValues['POSTGRES_PORT']
$redisPort = $envValues['REDIS_PORT']
$bucket = $envValues['S3_BUCKET']
$s3AccessKey = $envValues['S3_ACCESS_KEY']
$s3SecretKey = $envValues['S3_SECRET_KEY']
$smtpPort = [int]$envValues['SMTP_PORT']

Write-Host 'Validando PostgreSQL...'
Invoke-Compose @('exec', '-T', 'postgres', 'pg_isready', '-U', $postgresUser, '-d', $postgresDb) | Out-Host
$selectResult = Invoke-Compose @('exec', '-T', 'postgres', 'psql', '-U', $postgresUser, '-d', $postgresDb, '-tAc', 'SELECT 1;')
if ($selectResult.Trim() -ne '1') {
  throw "PostgreSQL SELECT 1 falhou. Resultado: $selectResult"
}
Write-Host "PostgreSQL OK em localhost:$postgresPort"

Write-Host 'Validando Redis...'
$redisResult = Invoke-Compose @('exec', '-T', 'redis', 'redis-cli', 'ping')
if ($redisResult.Trim() -ne 'PONG') {
  throw "Redis PING falhou. Resultado: $redisResult"
}
Write-Host "Redis OK em localhost:$redisPort"

Write-Host 'Validando MinIO...'
if (-not (Wait-HttpOk -Uri 'http://localhost:9000/minio/health/live')) {
  throw 'MinIO health endpoint nao respondeu com sucesso.'
}

$mcResult = Invoke-Compose @(
  'run',
  '--rm',
  'minio-init',
  'sh',
  '-c',
  "mc alias set local http://minio:9000 '$s3AccessKey' '$s3SecretKey' >/dev/null && mc ls local/$bucket >/dev/null && mc anonymous get local/$bucket"
)
if ($mcResult -match 'public|download|upload') {
  throw "Bucket $bucket possui politica anonima publica: $mcResult"
}
Write-Host "MinIO OK; bucket $bucket existe e permanece privado"

Write-Host 'Validando Mailpit...'
if (-not (Wait-HttpOk -Uri 'http://localhost:8025/api/v1/info')) {
  throw 'Mailpit API nao respondeu.'
}

$subject = "TES Engine infra validation $(Get-Date -Format 'yyyyMMddHHmmss')"
$message = New-Object System.Net.Mail.MailMessage
$message.From = $envValues['SMTP_FROM']
$message.To.Add('dev@tes-engine.local')
$message.Subject = $subject
$message.Body = 'Mensagem de validacao local do Mailpit.'

$smtp = New-Object System.Net.Mail.SmtpClient('localhost', $smtpPort)
$smtp.Send($message)
$smtp.Dispose()
$message.Dispose()

$found = $false
for ($i = 0; $i -lt 15; $i++) {
  try {
    $messages = Invoke-RestMethod -Uri 'http://localhost:8025/api/v1/messages' -TimeoutSec 3
    $json = $messages | ConvertTo-Json -Depth 10
    if ($json.Contains($subject)) {
      $found = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $found) {
  throw 'Mensagem SMTP de teste nao foi encontrada na API do Mailpit.'
}

Write-Host 'Mailpit OK; SMTP aceitou mensagem e API listou a mensagem'
Write-Host 'Infraestrutura local validada com sucesso.'
