# Testes de dados de referencia

Status: ACCEPTED

Os testes de referencia garantem que catalogos retornam codigo e label, e que labels nao sao
tratados como valor persistido. A UI deve adaptar `ReferenceOption` para componentes PO UI sem
acoplar a API ao formato do PO UI.

Comandos:

```powershell
pnpm test:reference-data
pnpm ui:field-contracts:validate
```
