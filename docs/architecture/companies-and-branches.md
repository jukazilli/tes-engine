# Empresas e filiais

Status: ACCEPTED

Empresas e filiais pertencem a uma organizacao, que continua sendo o tenant do SaaS. O contexto vem
do header `X-Organization-ID`; o corpo da requisicao nao e fonte de verdade para `organization_id`.

## Empresa

Empresa representa um grupo fiscal dentro da organizacao. A chave fiscal inicial e a raiz do CNPJ,
armazenada como oito digitos em `tax_id_root`. O campo `tax_regime` foi mantido como classificacao
legada de cadastro e nao e fonte fiscal definitiva para o motor.

Regras principais:

- uma empresa ativa por raiz de CNPJ em cada organizacao;
- soft delete por `deleted_at`;
- versionamento otimista por `version`;
- status controlado: `ACTIVE`, `SUSPENDED`, `DEACTIVATED`.

## Filial

Filial representa estabelecimento fiscal com CNPJ completo. A raiz do CNPJ deve bater com a raiz da
empresa, e essa regra existe tanto na aplicacao quanto no banco por trigger.

Regras principais:

- CNPJ com 14 digitos e digitos verificadores validos;
- zeros a esquerda preservados;
- inscricoes estadual e municipal como texto;
- uma matriz ativa por empresa;
- `establishment_type` e a fonte controlada para `MATRIZ`, `FILIAL` ou `OUTRO`;
- `is_headquarters` existe como compatibilidade transitoria e deve bater com `MATRIZ`.

## Endereco

`app.branch_addresses` guarda o endereco fiscal inicial. Existe uma morada fiscal ativa por filial,
CEP com oito digitos, UF com duas letras maiusculas, pais inicial `BR` e codigo IBGE opcional com
sete digitos.

## Integridade

As tabelas usam FK composta por `organization_id` para impedir vinculos cross-tenant entre empresa,
filial, endereco, ambiente e perfil fiscal.
