# ADR-016 - Runtime configuration

## Status

ACCEPTED

## Data

2026-06-25

## Decisores

- Engenharia

## Contexto

A API precisa falhar cedo quando variaveis obrigatorias estao ausentes ou invalidas. A configuracao
tambem deve ser tipada para evitar `process.env` espalhado pela aplicacao.

## Forcas de decisao

- Bootstrap deve falhar claramente para ambiente invalido.
- O codigo de dominio e contratos compartilhados nao deve depender de decorators do NestJS.
- A configuracao deve ser simples de testar.

## Alternativas

1. Ler `process.env` diretamente no bootstrap.
2. Usar `@nestjs/config` com validacao explicita via Joi.

## Decisao

Usar `@nestjs/config` com schema Joi, objeto tipado `AppConfig` e service de acesso. Chamadas a
`process.env` ficam centralizadas em `apps/api/src/config`.

## Consequencias positivas

- Falha clara para porta, ambiente, log level, CORS e booleanos invalidos.
- Bootstrap e modulos consomem configuracao tipada.
- Testes podem validar parser e schema isoladamente.

## Consequencias negativas

- Novas variaveis exigem atualizacao do schema e da documentacao.

## Riscos

- Variaveis futuras podem ser adicionadas sem passar pela validacao central.

## Relacoes

- Substitui: nenhum.
- Substituido por: nenhum.
- Relacionado a: [API foundation](../architecture/api-foundation.md)
