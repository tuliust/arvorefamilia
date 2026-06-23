# Legado técnico consolidado

> Última revisão: 2026-06-23  
> Escopo: registro histórico consolidado de SQLs legados, rotas removidas, imports colados, genealogia e versões antigas da árvore.  
> Status: histórico consolidado.

## Objetivo

Preservar rastreabilidade técnica sem manter múltiplos documentos históricos fragmentados.

Este documento absorve o conteúdo útil dos antigos arquivos:

- `SQLS_LEGADOS.md`;
- `ROTAS_REMOVIDAS.md`;
- `IMPORTS_COLADOS_LEGADOS.md`;
- `GENEALOGIA_VIEW.md`;
- `MINHA_ARVORE_VIEW.md`;
- `MINHA_ARVORE_FILTROS_E_PETS.md`.

## SQLs legados

SQLs antigos devem ser usados apenas como referência histórica. A operação vigente deve seguir:

- `operacao/MIGRATIONS_SUPABASE.md`;
- arquivos SQL versionados em `supabase/`;
- código atual em `src/app/services`.

Não usar SQL legado como fonte operacional sem comparar com o banco atual e com as migrations versionadas.

## Rotas removidas

Rotas removidas permanecem registradas apenas para contexto histórico. A fonte de verdade de rotas é `src/app/routes.tsx`.

Quando houver divergência:

1. `src/app/routes.tsx` prevalece;
2. `arquitetura/ROTAS_E_GUARDS.md` documenta o estado operacional;
3. este arquivo serve apenas para rastreabilidade.

## Imports colados

Arquivos ou blocos importados manualmente em rodadas anteriores não devem ser tratados como módulos ativos sem conferência no código.

Regra:

- verificar se o arquivo existe no repositório;
- verificar se é importado por alguma página, componente ou serviço;
- verificar se participa do build;
- remover referência documental se for apenas resíduo histórico.

## Genealogia e árvore antigas

Documentos antigos de genealogia e de `Minha Árvore` foram consolidados porque o contrato atual está em:

- `funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `funcionalidades/MEUS_VINCULOS.md`.

## Filtros e pets

Registros antigos sobre filtros e pets foram preservados como referência de evolução do produto. O comportamento vigente deve ser conferido no código atual e nos documentos canônicos de mapa, árvore e curiosidades.

## Uso permitido

Este documento pode ser consultado para:

- entender decisões antigas;
- recuperar contexto de migrações;
- evitar reintrodução de rotas removidas;
- explicar por que documentos históricos individuais foram apagados.

## Uso proibido

Este documento não deve ser usado para:

- definir comportamento vigente;
- substituir migrations atuais;
- justificar implementação sem conferência no código;
- recriar documentos históricos fragmentados.
