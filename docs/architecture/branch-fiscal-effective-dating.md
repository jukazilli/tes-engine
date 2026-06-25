# Vigencia do perfil fiscal da filial

Status: ACCEPTED

O perfil fiscal da filial e versionado por periodo. O perfil aplicavel a um documento e derivado da
data de emissao:

```text
valid_from <= document_issue_date
AND
(valid_until IS NULL OR valid_until >= document_issue_date)
```

Nao existe `is_current`. Perfis confirmados nao podem ter periodos sobrepostos para a mesma filial;
o banco bloqueia sobreposicao por trigger deterministica.

Perfis importados, inferidos ou manuais iniciam sem confirmacao automatica. Confirmacao registra
usuario e data. Perfil confirmado nao e editado diretamente; mudancas futuras devem criar novo
periodo.
