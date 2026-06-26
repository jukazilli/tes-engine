# Matriz de autoridade de fontes

Status: ACCEPTED

| Dominio                  | Fonte primaria                                           | Fonte secundaria permitida              | Regra de desempate                 |
| ------------------------ | -------------------------------------------------------- | --------------------------------------- | ---------------------------------- |
| NF-e XML                 | Portal Nacional NF-e, XSDs e notas tecnicas oficiais     | Artigos tecnicos apenas como apoio      | Fonte oficial normativa prevalece. |
| Protheus MILE            | TDN/TOTVS                                                | Videos, blogs e exemplos de implantacao | TDN/TOTVS prevalece.               |
| SX3                      | Snapshot confirmado do ambiente e documentacao TOTVS     | Catalogos publicos de tabelas           | Ambiente confirmado prevalece.     |
| SF4/TES                  | Ambiente Protheus, TDN/TOTVS e decisoes internas aceitas | SempreJU e catalogos similares          | Ambiente/TOTVS prevalecem.         |
| Configurador de Tributos | TDN/TOTVS e arquitetura aceita                           | Consultorias e blogs                    | TDN/TOTVS prevalece.               |

## SempreJU SF4

`https://sempreju.com.br/tabelas_protheus/tabelas/tabela_sf4.html` e classificado como
`THIRD_PARTY_TECHNICAL_CATALOG` e `SECONDARY_TECHNICAL`. Ele pode ser usado para localizar nomes de
campos e formular perguntas, mas nao pode definir tipo, tamanho, dominio, validacao, obrigatoriedade
ou comportamento fiscal final.
