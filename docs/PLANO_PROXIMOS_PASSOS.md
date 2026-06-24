# Plano de próximos passos

> Última revisão: 2026-06-23
> Escopo: pendências reais após auditoria documental da branch `main`.
> Status: canônico.

## Pendências operacionais pós-merge

- Conferir deploy gerado a partir da `main`.
- Validar manualmente `/mapa-familiar`, `/mapa-familiar-horizontal`, `/curiosidades`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/pessoa/:id` no ambiente publicado.
- Confirmar que o ambiente remoto do Supabase recebeu as migrations necessárias.
- Confirmar que `OPENAI_API_KEY` e demais variáveis de ambiente estão disponíveis quando exigidas.

## Pendências de produto

- Confirmar políticas RLS para pessoas, relacionamentos, vínculos, fatos históricos, notificações, favoritos e fórum.
- Revisar eventual texto com caracteres corrompidos fora de `docs/`, se for detectado em QA visual ou validação de código.
- Criar documentação administrativa mais detalhada apenas se houver necessidade operacional após QA.

## Regra de manutenção

- Não recriar documentos datados, temporários, de baseline, rollback ou QA paralelo.
- Não recriar arquivos removidos na limpeza documental final.
- Atualizar `docs/README.md` e `docs/INVENTARIO_TECNICO.md` apenas quando houver criação, remoção, renomeação de documento canônico ou mudança de rota/área.
