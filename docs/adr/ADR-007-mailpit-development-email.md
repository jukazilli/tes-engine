# ADR-007: Mailpit para e-mail local

## Status

Aceita

## Contexto

Fluxos futuros terao confirmacao de e-mail e notificacoes. O Prompt 02 exige captura local sem envio
real.

## Decisao

Usar `axllent/mailpit:v1.29.1` com SMTP em `1025` e interface web em `8025`.

## Alternativas

- Enviar e-mails reais em desenvolvimento: descartado por risco operacional.
- MailHog: considerado, mas Mailpit fornece interface e API modernas para validacao automatica.

## Consequencias

E-mails futuros poderao ser testados localmente sem destinatarios externos. Producao deve usar
provedor transacional real.
