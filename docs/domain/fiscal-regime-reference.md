# Referencia de dominios fiscais

Status: ACCEPTED

Fontes oficiais consultadas neste corte: documentacao oficial da NF-e para CRT e indicador
`indIEDest`, e documentacao oficial TOTVS/TDN sobre o parametro `MV_CODREG`. Quando a fonte oficial
nao permite mapeamento seguro, o mapeamento externo fica pendente.

| Conceito          | Codigo interno do TES Engine | Descricao exibida                       | Codigo oficial externo | Origem oficial          | Vigencia   | Observacoes                         |
| ----------------- | ---------------------------- | --------------------------------------- | ---------------------- | ----------------------- | ---------- | ----------------------------------- |
| Regime tributario | LUCRO_REAL                   | Lucro Real                              | Pendente               | Cadastro fiscal interno | 2026-06-25 | Nao mapear automaticamente para CRT |
| Regime tributario | LUCRO_PRESUMIDO              | Lucro Presumido                         | Pendente               | Cadastro fiscal interno | 2026-06-25 | Nao mapear automaticamente para CRT |
| Regime tributario | SIMPLES_NACIONAL             | Simples Nacional                        | Pendente               | Cadastro fiscal interno | 2026-06-25 | Separado do CRT                     |
| Regime tributario | MEI                          | Microempreendedor Individual            | Pendente               | Cadastro fiscal interno | 2026-06-25 | Separado do CRT                     |
| CRT NF-e          | 1                            | Simples Nacional                        | 1                      | Manual NF-e             | 2026-06-25 | Codigo proprio da NF-e              |
| CRT NF-e          | 2                            | Simples Nacional - excesso de sublimite | 2                      | Manual NF-e             | 2026-06-25 | Nao e regime tributario empresarial |
| CRT NF-e          | 3                            | Regime Normal                           | 3                      | Manual NF-e             | 2026-06-25 | Agrupa regimes normais              |
| CRT NF-e          | 4                            | Simples Nacional - MEI                  | 4                      | Manual NF-e             | 2026-06-25 | Codigo proprio da NF-e              |
| Indicador ICMS    | CONTRIBUINTE                 | Contribuinte do ICMS                    | indIEDest=1            | Manual NF-e             | 2026-06-25 | Persistir codigo interno            |
| Indicador ICMS    | CONTRIBUINTE_ISENTO          | Contribuinte isento                     | indIEDest=2            | Manual NF-e             | 2026-06-25 | Persistir codigo interno            |
| Indicador ICMS    | NAO_CONTRIBUINTE             | Nao contribuinte                        | indIEDest=9            | Manual NF-e             | 2026-06-25 | Persistir codigo interno            |
| Protheus          | MV_CODREG                    | Parametro de regime                     | MV_CODREG              | TOTVS TDN               | 2026-06-25 | Valor nao e codigo canonico do TES  |
