# Migrations Supabase

> Última revisão: 2026-06-23
> Escopo: fontes SQL e orientação de validação do Supabase na branch `main`.
> Status: canônico.

## Estado versionado

A branch atual possui diretório versionado `supabase/migrations`. As fontes SQL versionadas e citadas na documentação são:

- `supabase/migrations/20260622143000_deepen_admin_reset_and_profile_badges.sql`, que cria a RPC `get_person_profile_selected_badges(uuid)`;
- `supabase/forum-schema.sql`;
- `supabase/google-calendar-schema.sql`;
- `supabase/config.toml`;
- SQLs legados preservados em `docs/historico/SQLS_LEGADOS.md`;
- textos SQL legados em `src/imports/pasted_text/*`, documentados apenas como histórico/importação.

## Regras

- Não aplicar SQL diretamente sem revisão.
- Não copiar SQL legado para produção sem adaptar ao estado atual do banco.
- Sempre validar RLS depois de criar ou alterar tabela.
- Manter migrations numeradas em `supabase/migrations` quando houver alteração de schema ou RPC.

## Tabelas e domínios esperados pela aplicação

A documentação funcional depende de tabelas ou estruturas equivalentes para:

- pessoas;
- relacionamentos;
- vínculos entre usuário e pessoa;
- solicitações de alteração de vínculos;
- respostas/questionário de perfil;
- fatos e arquivos históricos;
- insights de pessoa;
- favoritos;
- notificações e preferências;
- fórum;
- logs de atividade;
- permissões administrativas.

## Checklist operacional

1. Confirmar URL e anon key do Supabase.
2. Confirmar tabelas exigidas pelos serviços em `src/app/services`.
3. Confirmar políticas RLS para leitura e escrita.
4. Confirmar buckets e paths usados por arquivos históricos.
5. Confirmar que dados sensíveis não são expostos em views públicas.
6. Rodar a aplicação e validar as rotas documentadas em `QA_MANUAL.md`.
