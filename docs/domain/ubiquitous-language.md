# Linguagem ubiqua

Status: ACCEPTED

| Termo                       | Definicao                                                                    |
| --------------------------- | ---------------------------------------------------------------------------- |
| Organizacao                 | Unidade tenant que agrupa usuarios, empresas e projetos.                     |
| Empresa                     | Pessoa juridica representada no contexto operacional do cliente.             |
| Filial                      | Unidade operacional vinculada a uma empresa.                                 |
| Ambiente Protheus           | Instalacao ou base Protheus alvo de homologacao e exportacao.                |
| Projeto                     | Recorte de trabalho para processar documentos e propor cenarios.             |
| Lote de upload              | Conjunto de arquivos enviado para processamento.                             |
| Documento fiscal            | Documento de entrada analisado pelo sistema, sem afirmar validade juridica.  |
| Item fiscal                 | Linha ou item do documento fiscal.                                           |
| Processamento               | Transformacao controlada de entradas em resultados analisaveis.              |
| Execucao de processamento   | Versao especifica de um processamento.                                       |
| Regra                       | Criterio deterministico ou parametrizado usado pelo motor futuro.            |
| Cenario operacional         | Agrupamento orientado ao resultado operacional.                              |
| Cenario tributario          | Agrupamento orientado ao tratamento tributario.                              |
| Fingerprint                 | Identificador derivado para comparacao ou agrupamento.                       |
| TES existente               | TES ja presente no ambiente Protheus de referencia.                          |
| TES proposta                | Sugestao gerada para revisao e aprovacao.                                    |
| Configurador de Tributos    | Modelo Protheus futuro ou existente para tratamento tributario configuravel. |
| Responsabilidade tributaria | Responsabilidade de definir, revisar e aprovar interpretacoes fiscais.       |
| Revisao                     | Analise humana antes da aprovacao.                                           |
| Aprovacao                   | Decisao humana que libera etapa critica.                                     |
| Exportacao                  | Geracao imutavel de artefato para integracao.                                |
| Layout MILE                 | Formato de arquivo esperado pelo MILE.                                       |
| Snapshot                    | Registro imutavel de um estado relevante.                                    |
| Evidencia                   | Dado que sustenta decisao ou auditoria.                                      |
| Confianca                   | Grau de seguranca operacional de uma sugestao.                               |
| Divergencia                 | Diferenca detectada entre entradas, regras ou resultados.                    |
| Homologacao                 | Validacao em ambiente nao produtivo antes de uso real.                       |

Documentos relacionados:

- [Visao do dominio](domain-overview.md)
- [Regras de negocio](business-rules-register.md)
