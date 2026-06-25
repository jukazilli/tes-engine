# ADR-002: Angular com PO UI

## Status

Aceita

## Contexto

A interface inicial deve ser uma SPA Angular usando PO UI real, sem simular componentes com HTML
proprio. O projeto precisa preservar compatibilidade oficial de versoes.

## Decisao

Usar Angular 21.2.17 com PO UI 21.21.0, componentes standalone, roteamento Angular e PO UI para
toolbar, menu e pagina inicial.

## Alternativas consideradas

- Angular 22: descartado porque PO UI 21.21.0 declara suporte a Angular `^21` e `@nx/angular` 23.0.1
  limita builders a `<22`.
- Componentes HTML proprios: descartado por contrariar o requisito de PO UI real.

## Consequencias

A UI inicial fica alinhada ao design system PO UI. Atualizacoes para Angular 22 dependem de uma
versao futura do PO UI compativel.
