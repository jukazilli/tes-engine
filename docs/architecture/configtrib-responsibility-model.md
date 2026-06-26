# Modelo de responsabilidade ConfigTrib

Status: ACCEPTED

## Decisao

O TES Engine separa responsabilidade por tributo antes de analisar XML ou sugerir TES.

## Prevencao de dupla tributacao

Quando um tributo for `CONFIGTRIB`, a futura geracao de TES devera neutralizar gatilhos legados
equivalentes. Quando for `LEGACY_TES`, a futura estrategia depende de dados SF4.

## Bloqueio futuro de exportacao

A exportacao devera ser bloqueada quando uma TES neutra depender de ConfigTrib e nao houver
cobertura equivalente validada.

## Fora do corte

Nao ha comparacao FISA170 nem leitura real de ConfigTrib neste prompt.
