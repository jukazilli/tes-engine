# Local infrastructure

## Diagrama

```text
apps locais
  | localhost
  v
PostgreSQL  Redis  MinIO  Mailpit
      \       |      |      /
       tes-engine-network
```

## Responsabilidades

- PostgreSQL: banco relacional local futuro da API.
- Redis: armazenamento local futuro para cache e filas.
- MinIO: armazenamento S3 compativel local para arquivos privados.
- MinIO Client: inicializacao idempotente do bucket privado.
- Mailpit: SMTP e caixa de e-mail local para desenvolvimento.

## Rede

Todos os containers participam da rede dedicada `tes-engine-network`.

As portas publicadas usam `127.0.0.1`, evitando exposicao para interfaces externas.

## Volumes

- `postgres_data`: dados do PostgreSQL.
- `redis_data`: dados persistidos do Redis.
- `minio_data`: objetos do MinIO.

`infra:down` preserva volumes.

## Health checks

- PostgreSQL: `pg_isready`.
- Redis: `redis-cli ping`.
- MinIO: endpoint `/minio/health/live`.
- Mailpit: API HTTP local, quando suportada pela imagem.
- MinIO init: container de inicializacao deve concluir com codigo zero.

## Politica de portas

Padroes documentados:

- PostgreSQL: `5432`.
- Redis: `6379`.
- MinIO API: `9000`.
- MinIO Console: `9001`.
- Mailpit SMTP: `1025`.
- Mailpit Web: `8025`.

Se uma porta estiver ocupada, usar porta alternativa somente em `.env.local`.

## Politica de segredos

Credenciais locais ficam em `.env.local`, ignorado pelo Git.

`.env.example` contem apenas placeholders.

## Local, compartilhado e producao

Local usa containers e credenciais descartaveis. Desenvolvimento compartilhado devera usar infraestrutura provisionada e segredos gerenciados. Producao nao deve usar Mailpit, credenciais locais, volumes Docker locais ou MinIO sem avaliacao operacional.

## Por que MinIO localmente

MinIO fornece API S3 compativel para validar contratos de armazenamento sem depender de servico externo no desenvolvimento local.

## Por que Mailpit localmente

Mailpit captura e-mails de teste sem envio real para destinatarios externos.

## O que nao replicar em producao

- Senhas do `.env.local`.
- Mailpit como servidor de e-mail real.
- Publicacao de portas em localhost como modelo de seguranca.
- Volumes Docker locais como estrategia de backup.
