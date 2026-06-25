# Email delivery

Status: ACCEPTED

## Decisao

E-mails de autenticacao passam por um adapter `EmailProvider`. A autenticacao nao depende
diretamente de Nodemailer nem Resend.

## Providers

- `smtp`: desenvolvimento local com Mailpit.
- `resend`: opcional para staging/producao com remetente verificado.
- `fake`: testes e desenvolvimento sem rede.

## Auditoria

Eventos de envio sao registrados em `app.email_delivery_events` sem conteudo integral do e-mail, sem
token em texto e sem segredos.

## Resend

`RESEND_API_KEY` e `RESEND_FROM_ADDRESS` so sao exigidos quando `EMAIL_PROVIDER=resend`. A ausencia
de chave nao quebra SMTP local.
