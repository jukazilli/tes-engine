# Isolamento tenant de master data

Status: ACCEPTED

Ameacas cobertas:

- IDOR em ids de empresa, filial, ambiente, perfil fiscal e mapping;
- spoofing de tenant por header;
- CNPJ cross-tenant;
- troca de filial em ambiente;
- ambiente de outro tenant em mapping;
- vazamento de contexto no pool;
- logs com dados fiscais completos.

Mitigacoes:

- `X-Organization-ID` validado por membership ativa;
- RLS com `FORCE ROW LEVEL SECURITY`;
- FKs compostas por `organization_id`;
- transacao tenant-scoped;
- logs sem CNPJ completo, endereco completo ou payload integral.
