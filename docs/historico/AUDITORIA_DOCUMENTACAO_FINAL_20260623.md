# Auditoria documental final — 2026-06-23

> Última revisão: 2026-06-23
> Escopo: auditoria de `docs/` contra a branch `main`.
> Status: histórico de auditoria.

## Resumo executivo

A documentação em `docs/` foi consolidada para reduzir referências a ciclos antigos, branches de trabalho e documentos operacionais duplicados. A fonte canônica de rotas passou a ser explicitamente `src/app/routes.tsx`; os documentos principais foram reescritos com cabeçalho padronizado, linguagem objetiva e foco no comportamento atualmente descrito pelo código.

A branch usada foi `docs/revisao-final-documentacao`. Ela já existia e estava idêntica à `main` antes das alterações. O compare final executado antes desta atualização do relatório mostrou a branch 17 commits à frente de `main`, 0 atrás, com alterações exclusivamente em arquivos de `docs/`.

## Arquivos analisados

Foram analisados por inventário e/ou comparação de escopo:

- `docs/README.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/QA_MANUAL.md`;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/PLANO_PROXIMOS_PASSOS.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `docs/funcionalidades/MEUS_VINCULOS.md`;
- `docs/funcionalidades/REVISAO_DADOS.md`;
- `docs/funcionalidades/CURIOSIDADES.md`;
- `docs/funcionalidades/ARQUIVOS_HISTORICOS.md`;
- documentos históricos e operacionais encontrados por busca em `docs/historico`, `docs/operacao`, `docs/arquitetura`, `docs/comandos` e `docs/funcionalidades`.

## Classificação documental

| Arquivo | Classificação | Observação |
|---|---|---|
| `docs/README.md` | canônico | índice principal atualizado. |
| `docs/INVENTARIO_TECNICO.md` | canônico | inventário técnico alinhado a rotas, serviços e API. |
| `docs/GUIA_UX_LAYOUT.md` | canônico | UX consolidada. |
| `docs/GUIA_COMPONENTES.md` | canônico | mapa de componentes. |
| `docs/GUIA_IMPLEMENTACOES.md` | canônico | comportamento implementado. |
| `docs/QA_MANUAL.md` | canônico | roteiro de validação manual. |
| `docs/REGRAS_DE_NAO_REGRESSAO.md` | canônico | regras transversais. |
| `docs/GUIA_CORRECAO_ERROS.md` | canônico | troubleshooting. |
| `docs/PLANO_PROXIMOS_PASSOS.md` | canônico | pendências reais. |
| `docs/operacao/MIGRATIONS_SUPABASE.md` | canônico | orientação Supabase. |
| `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | canônico | mapa familiar. |
| `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | canônico | árvore e painel; mantido. |
| `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` | canônico | IA e textos de perfil. |
| `docs/funcionalidades/MEUS_VINCULOS.md` | canônico | vínculos. |
| `docs/funcionalidades/REVISAO_DADOS.md` | canônico | revisão final. |
| `docs/funcionalidades/CURIOSIDADES.md` | canônico | página de curiosidades. |
| `docs/funcionalidades/ARQUIVOS_HISTORICOS.md` | canônico | fatos e arquivos. |
| `docs/arquitetura/ARCHITECTURE.md` | complementar | visão arquitetural geral. |
| `docs/arquitetura/ROTAS_E_GUARDS.md` | complementar | deve seguir `INVENTARIO_TECNICO.md`. |
| `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | complementar | banco e usuários. |
| `docs/operacao/DEPLOYMENT.md` | complementar | deploy. |
| `docs/operacao/STORAGE_MAINTENANCE.md` | complementar | storage. |
| `docs/operacao/OAUTH_GOOGLE.md` | complementar | OAuth. |
| `docs/historico/*` | histórico | rastreabilidade, sem força canônica. |
| documentos de rodada mobile/QA antigo | removível ou histórico | substituídos por guias canônicos. |

## Temas sobrepostos encontrados

- mapa familiar mobile, painel e não regressão;
- QA de mapas mobile e QA manual geral;
- atualizações documentais por data e README;
- IA/Curiosidades em home, `/meus-dados`, `/meus-vinculos` e `/curiosidades`;
- Supabase migrations, SQLs legados e documentação de banco.

## Arquivos mantidos

Mantidos como canônicos ou complementares:

- `docs/README.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/QA_MANUAL.md`;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/PLANO_PROXIMOS_PASSOS.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `docs/funcionalidades/MEUS_VINCULOS.md`;
- `docs/funcionalidades/REVISAO_DADOS.md`;
- `docs/funcionalidades/CURIOSIDADES.md`;
- `docs/funcionalidades/ARQUIVOS_HISTORICOS.md`.

## Arquivos atualizados

Atualizados nesta auditoria:

- `docs/README.md`;
- `docs/INVENTARIO_TECNICO.md`;
- `docs/GUIA_UX_LAYOUT.md`;
- `docs/GUIA_COMPONENTES.md`;
- `docs/GUIA_IMPLEMENTACOES.md`;
- `docs/QA_MANUAL.md`;
- `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- `docs/GUIA_CORRECAO_ERROS.md`;
- `docs/PLANO_PROXIMOS_PASSOS.md`;
- `docs/operacao/MIGRATIONS_SUPABASE.md`;
- `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- `docs/funcionalidades/MEUS_VINCULOS.md`;
- `docs/funcionalidades/REVISAO_DADOS.md`;
- `docs/funcionalidades/CURIOSIDADES.md`;
- `docs/funcionalidades/ARQUIVOS_HISTORICOS.md`;
- `docs/historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md`.

## Arquivos mesclados

Não houve `git mv` físico de conteúdo nesta execução via conector. A consolidação lógica foi feita substituindo contratos duplicados por documentos canônicos no índice:

- mapa mobile e QA mobile foram absorvidos por `MAPA_FAMILIAR_VIEW.md`, `ARVORE_LEGENDAS_CONECTORES_PAINEL.md`, `QA_MANUAL.md` e `REGRAS_DE_NAO_REGRESSAO.md`;
- atualizações documentais por data foram absorvidas por `README.md` e por este relatório;
- IA/Curiosidades foram concentradas em `MINI_BIO_CURIOSIDADES_IA.md` e `CURIOSIDADES.md`.

## Arquivos removidos

Nenhum arquivo foi removido nesta execução. Os arquivos redundantes permanecem classificados como históricos/removíveis e podem ser removidos em rodada local com `git rm`, caso a equipe queira limpeza física mais agressiva.

## Inconsistências encontradas e corrigidas

- README citava estado de branch de trabalho e ciclos antigos como estado principal; foi substituído por índice canônico baseado na `main`.
- Documentos canônicos não estavam uniformes em cabeçalho; os principais foram padronizados.
- `/curiosidades` tinha documento sem cabeçalho canônico; foi reescrito.
- Migrations Supabase citavam diretório de migrations sem confirmação; agora documenta que a busca disponível não confirmou `supabase/migrations` versionado.
- QA manual e não regressão foram consolidados para cobrir rotas atuais.
- Guias de UX, componentes e correção de erros foram reescritos para eliminar referências operacionais antigas e padronizar escopo/status.

## Inconsistências que permaneceram como pendência

- A validação local `npm run typecheck` e `npm run build` não foi executada neste ambiente por falta de clone funcional do repositório via rede.
- A remoção física de documentos redundantes deve ser feita em ambiente local se for exigido `git rm`.
- Eventual mojibake fora de `docs/` foi tratado como fora do escopo desta frente documental.
- A busca via índice do GitHub pode retornar conteúdo antigo; a verificação conclusiva de mojibake deve ser feita localmente com `grep`/`rg` após checkout da branch.

## Mapa final da documentação canônica

- Índice: `docs/README.md`;
- Inventário: `docs/INVENTARIO_TECNICO.md`;
- UX: `docs/GUIA_UX_LAYOUT.md`;
- Componentes: `docs/GUIA_COMPONENTES.md`;
- Implementações: `docs/GUIA_IMPLEMENTACOES.md`;
- QA: `docs/QA_MANUAL.md`;
- Não regressão: `docs/REGRAS_DE_NAO_REGRESSAO.md`;
- Correção de erros: `docs/GUIA_CORRECAO_ERROS.md`;
- Próximos passos: `docs/PLANO_PROXIMOS_PASSOS.md`;
- Supabase: `docs/operacao/MIGRATIONS_SUPABASE.md`;
- Mapa familiar: `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`;
- Árvore/conectores/painel: `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- Meus dados/IA/Mini Bio/Curiosidades: `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md`;
- Meus vínculos: `docs/funcionalidades/MEUS_VINCULOS.md`;
- Revisão de dados: `docs/funcionalidades/REVISAO_DADOS.md`;
- Curiosidades: `docs/funcionalidades/CURIOSIDADES.md`;
- Fatos e arquivos históricos: `docs/funcionalidades/ARQUIVOS_HISTORICOS.md`;
- Histórico da auditoria: `docs/historico/AUDITORIA_DOCUMENTACAO_FINAL_20260623.md`.

## Comandos de validação executados

Executado via conector GitHub:

```bash
# equivalente lógico
compare main..docs/revisao-final-documentacao
```

Resultado antes desta atualização final do relatório:

- status: `ahead`;
- ahead: 17 commits;
- behind: 0 commits;
- arquivos alterados: exclusivamente `docs/`.

Tentado no ambiente de execução:

```bash
git clone --depth 1 --branch main https://github.com/tuliust/arvorefamilia.git /mnt/data/arvorefamilia
```

Resultado: falha por DNS (`Could not resolve host: github.com`). Por isso, não foi possível executar localmente:

```bash
git status --short
git diff --check
npm run typecheck
npm run build
```

## Commit final gerado

O conector GitHub gerou commits sequenciais, um por arquivo alterado. A mensagem usada em todos foi:

```text
docs: revisa e consolida documentação final
```

O último commit antes desta atualização do próprio relatório foi:

```text
bd806f3b92e360017a418da0433d8fa46da1f6a6
```

A atualização deste relatório foi feita como fechamento da auditoria; o SHA efetivo final da branch deve ser confirmado no compare final após esta gravação.
