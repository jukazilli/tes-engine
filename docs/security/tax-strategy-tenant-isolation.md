# Isolamento tenant da estrategia tributaria

Status: ACCEPTED

## Escopo

As tabelas `environment_tax_strategies` e `environment_tax_strategy_items` possuem
`organization_id`, RLS habilitado e `FORCE ROW LEVEL SECURITY`.

## Policy

As policies usam:

```text
organization_id = app_private.current_organization_id()
```

## Integridade

FK composta impede estrategia apontar para ambiente de outro tenant ou branch divergente.
Controllers tambem exigem `X-Organization-ID` e RBAC.
