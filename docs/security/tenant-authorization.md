# Tenant authorization

Status: ACCEPTED

## Principios

- Autenticacao identifica usuario.
- `X-Organization-ID` seleciona tenant.
- Membership ativa autoriza acesso basico ao tenant.
- Permissions autorizam operacoes especificas.
- RLS no PostgreSQL e a ultima fronteira de isolamento.

## Rejeicoes obrigatorias

- requisicao sem sessao;
- operacao mutavel sem CSRF valido;
- `Origin` invalido em operacao mutavel;
- `X-Organization-ID` ausente ou invalido;
- mismatch entre header e rota;
- membership ausente, inativa ou de outra organizacao;
- permissao ausente;
- tentativa de remover o ultimo administrador ativo.

## Convites

Convites usam token opaco e persistem somente hash. Aceite exige usuario autenticado com e-mail
igual ao convite.

## Risco residual

Rate limiting de convites e mantido em memoria. Antes de operar multiplas instancias, migrar esse
controle para armazenamento distribuido.
