# Árvore Família — Estado do projeto e roteiro de continuidade

> **Registro de referência: 23/11/2026**  
> **Situação: sistema com banco Supabase real ativo; ambiente local validado; pronto para entrar em standby, sem desativar a integração.**  
> **IMPORTANTE:** este projeto **NÃO utiliza dados mockados na execução local validada**. Diferentemente dos projetos Eventos Invest RS e Cartões Digitais, aqui existe um banco Supabase com registros reais. **Não substituir o cliente Supabase por simuladores, não importar dados fictícios sobre a base e não recriar um banco desnecessariamente.**
>
> Este documento registra uma **fotografia de auditoria** da data acima. Não substitui verificação atual quando o trabalho for retomado. Não contém senhas, tokens, dados pessoais de membros nem backups do banco.

## 1. Identificação e localização

| Item | Referência |
| --- | --- |
| Aplicação | Árvore Família — sistema de genealogia familiar |
| Repositório GitHub | https://github.com/tuliust/arvorefamilia |
| Branch de produção | `main` |
| Commit validado (GitHub, local e Vercel) | `a21cdef8e2be06a36135fdae0686a90f54d8d0b3` |
| Pasta local Windows | `C:\Users\Tulius\Documents\github\arvorefamilia` |
| Projeto Supabase | `arvorefamilia` |
| Project ref Supabase | `jimymkzejbhuseozunxl` |
| URL Supabase | https://jimymkzejbhuseozunxl.supabase.co |
| Região Supabase | `sa-east-1` (São Paulo) |
| Projeto Vercel | `arvorefamilia` |
| Domínio de produção identificado | https://familiasouzabarros.com.br |
| Documentação canônica | [docs/README.md](README.md) |
| Instalação e visão geral | [README da raiz](../README.md) |

**Atenção a contas/organizações:** inicialmente o projeto Supabase não aparecia na primeira conexão disponível ao ChatGPT. Depois que a conexão correta foi autorizada, foi localizado na organização Supabase **`arvorefamilia`** (`jrameslhghqlpiegxumf`). Portanto, a ausência na primeira conta **não significava exclusão do projeto**. Verificar a organização/conta selecionada antes de concluir que um projeto foi perdido.

## 2. Resultado confirmado da sincronização Git e do teste local

O responsável executou em `C:\Users\Tulius\Documents\github\arvorefamilia`:

```powershell
git rev-parse --show-toplevel
git remote -v
git branch -vv
git status --short --branch
git fetch origin
git rev-list --left-right --count main...origin/main
```

Resultado em 23/11/2026:

- `origin`: `https://github.com/tuliust/arvorefamilia.git` (fetch/push).
- Branch ativa: `main`.
- Commit local: `a21cdef8`; mesma referência da branch remota.
- Divergência: `0 0` — sem commits à frente ou atrás.
- Nenhuma alteração de arquivos indicada no `git status` apresentado.
- Arquivo `.env.local` existente, com `VITE_SUPABASE_URL` apontando para **`jimymkzejbhuseozunxl`** e `VITE_SUPABASE_ANON_KEY` preenchida.
- O responsável instalou as dependências, iniciou o Vite, acessou a aplicação e **confirmou que o teste local com o banco real funcionou**.

**Escopo da confirmação:** validação manual informada do acesso local e leitura da aplicação. Não equivale a QA integral de todas as ações administrativas, permissões, integrações externas ou produção no domínio público.

### Vercel

Na mesma data, a inspeção apontou:

- Projeto `arvorefamilia`, framework Vite.
- Deployment de produção `READY`, criado a partir da branch `main` do repositório `tuliust/arvorefamilia`, no commit `a21cdef8`.
- Aliases observados: `familiasouzabarros.com.br`, `arvorefamilia-tuliust.vercel.app` e `arvorefamilia-git-main-tuliust.vercel.app`.
- Variáveis cadastradas em Development/Preview/Production: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_MAPS_API_KEY` e `OPENAI_API_KEY`.

**Limite:** valores protegidos do Vercel não puderam ser comparados conclusivamente com as chaves/URL do Supabase usando o conector. O fato de existir um deployment `READY` **não comprova** que login, leitura de dados e APIs funcionem no domínio de produção. Testar separadamente quando necessário.

## 3. Supabase real: estado de referência da auditoria

Em 23/11/2026, o conector autorizado para a organização correta retornou:

- Projeto `jimymkzejbhuseozunxl`: **`ACTIVE_HEALTHY`**.
- PostgreSQL 17; região `sa-east-1`.
- **43 tabelas no schema `public`**, todas apresentadas com Row Level Security (RLS) habilitado.
- **91 migrations registradas no banco e 91 arquivos `.sql` no GitHub**, com **91 identificadores de versão correspondentes**, sem migrations faltando em nenhum dos lados na comparação de nomes/versões. Isso não é uma comparação de conteúdo SQL byte a byte.
- **9 Supabase Edge Functions** com status ativo na consulta.

### Inventário de dados (contagens, não exportação)

| Coleção ou elemento | Total em 23/11/2026 |
| --- | ---: |
| Pessoas (`public.pessoas`) | 64 |
| Relacionamentos (`public.relacionamentos`) | 202 |
| Usuários Auth (`auth.users`) | 8 |
| Perfis (`public.profiles`) | 8 |
| Vínculos de usuário-pessoa (`public.user_person_links`) | 8 |
| Arquivos históricos registrados na tabela | 2 |
| Objetos no Storage | 40 |

Verificações de integridade pontuais retornaram **zero** usuários Auth sem perfil, **zero** perfis sem usuário Auth e **zero** vínculos apontando para pessoas inexistentes. Não foram executadas verificações exaustivas de toda a árvore genealógica.

### Storage

| Bucket | Visibilidade | Objetos |
| --- | --- | ---: |
| `historical-files` | Privado | 16 |
| `logo` | Público | 2 |
| `person-avatars` | Público | 22 |
| `site-media` | Público | 0 |

**Nota de privacidade:** revisar individualmente as regras de acesso a fotos e outros arquivos; não presumir que bucket público seja adequado a todo tipo de imagem pessoal. O bucket `historical-files` estava privado na auditoria. A existência de 2 linhas em `arquivos_historicos` e 16 objetos em Storage **não é contradição automática**; podem existir outras referências, versões ou objetos órfãos a investigar antes de excluir qualquer coisa. Nunca excluir objetos fisicamente sem revisão e backup; usar a Storage API, não operações diretas sobre `storage.objects`.

### Segurança e performance: pontos a revisar, sem mudanças automáticas

Os advisors do Supabase indicaram:

- **Segurança:** 1 função `SECURITY DEFINER` executável por `anon`; 25 funções `SECURITY DEFINER` executáveis por usuários autenticados; proteção contra senhas vazadas não habilitada.
- **Performance:** 23 FKs sem índice identificado; 109 avisos de `auth_rls_initplan`; 48 índices potencialmente não utilizados; 24 políticas permissivas múltiplas.
- **Health advisor:** nenhum aviso no retorno consultado.

**Interpretação:** avisos de função executável **não são prova isolada de exploração ou falha**. Há funções deliberadamente destinadas ao primeiro acesso ou a usuários autenticados; inspecionar código, checagens internas, `GRANT EXECUTE` e políticas antes de alterar. Não revogar em massa nem mudar `SECURITY DEFINER` para `INVOKER` automaticamente. Consultar os documentos de manutenção e os links oficiais dos advisors.

Links de referência:

- [Supabase — Security Advisor](https://supabase.com/dashboard/project/jimymkzejbhuseozunxl/advisors/security)
- [Supabase — Performance Advisor](https://supabase.com/dashboard/project/jimymkzejbhuseozunxl/advisors/performance)
- [Documentação das migrations](operacao/MIGRATIONS_SUPABASE.md)
- [Plano atual de próximos passos](PLANO_PROXIMOS_PASSOS.md)

## 4. Arquitetura e funcionalidades

Frontend React/TypeScript/Vite, React Router, Tailwind; Supabase Auth, Postgres, Storage e Edge Functions; Vitest e Playwright. Fluxo principal no código:

- `src/app/routes.tsx`: rotas, guards e carregamento das telas.
- `src/app/contexts/AuthContext.tsx`: sessão Supabase e autenticação.
- `src/app/lib/supabaseClient.ts`: instanciação do cliente, validação de variáveis de ambiente.
- `src/app/pages/`, `src/app/components/`, `src/app/services/`: páginas, componentes e lógica de domínio.
- `supabase/migrations/`: fonte versionada de schema, policies e RPCs.
- `supabase/functions/`: Edge Functions; alterações exigem processo próprio de deploy.
- `docs/`: documentação canônica.

Principais módulos: árvore genealógica, perfis de pessoas, relacionamentos familiares, históricos e anexos, Linha do Tempo, busca, vínculos entre usuários e perfis, administração, fórum, calendário, favoritos, notificações, curiosidades/insights e opções de exportação.

**Views atuais:** `/mapa-familiar` e `/mapa-familiar-horizontal`; a rota `/` redireciona para a árvore. A experiência geracional mobile utiliza `/linha-geracional`. **Não reativar** `/minha-arvore`, `/genealogia` e `/visao-completa` como views antigas. `/minha-arvore/editar` permanece uma rota válida de edição.

**Área sensível:** `/admin/migrar-dados` contém ferramenta potencialmente destrutiva. A flag `VITE_ENABLE_DESTRUCTIVE_ADMIN_TOOLS=true` não deve ser habilitada no ambiente conectado à base real sem autorização explícita e plano de backup/rollback.

## 5. Retomada local com o Supabase real

### Preparar o terminal

```powershell
cd C:\Users\Tulius\Documents\github\arvorefamilia
git status --short --branch
git remote -v
git fetch origin
git rev-list --left-right --count main...origin/main
```

Se a branch `main` estiver limpa e o resultado indicar atraso local, sincronizar **somente após revisar o status**:

```powershell
git switch main
git pull --ff-only origin main
```

Não usar `git reset --hard` nem `git clean -fd` para resolver divergências: ambos podem eliminar trabalho local. Se houver commits à frente, divergência de histórico ou alterações locais, interromper e reconciliar antes de atualizar.

### Conferir variáveis sem revelar credenciais

```powershell
if (Test-Path .env.local) {
    Select-String -Path .env.local -Pattern '^VITE_SUPABASE_URL='
    "Chave configurada: " + [bool](Select-String -Path .env.local -Pattern '^VITE_SUPABASE_ANON_KEY=.+')
} else {
    "Arquivo .env.local ausente"
}
```

Esperado:

```env
VITE_SUPABASE_URL=https://jimymkzejbhuseozunxl.supabase.co
VITE_SUPABASE_ANON_KEY=<chave publica atual do mesmo projeto>
```

- A chave pública deve ser obtida em **Supabase → Project Settings → API Keys** sob a **organização correta**.
- `.env.local` permanece local e ignorado pelo Git. **Nunca enviar seu conteúdo ao chat ou GitHub**.
- Nunca usar `service_role`, secret keys, tokens OAuth ou `OPENAI_API_KEY` em variáveis `VITE_*`.
- Confirmar que a chave configurada pertence ao mesmo projeto, caso o login volte a falhar.

### Instalar e iniciar

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir o endereço local indicado pelo Vite (geralmente `http://localhost:5173/`) e autenticar com uma conta **existente e autorizada** no Supabase. Não criar usuários ou editar registros apenas para validar o login.

**Verificação mínima de leitura:** login, `/mapa-familiar`, `/mapa-familiar-horizontal`, perfil de uma pessoa, vínculos e área administrativa (se possuir permissão). Não ativar comandos destrutivos, migrações ou importação em massa durante o smoke test.

### Testes antes de alterações ou deploy

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test
npm.cmd run test:e2e
```

Os E2E dependem de ambiente/navegador configurados; smoke sem sessão não substitui QA autenticado. Consulte [QA manual](QA_MANUAL.md), [regras de não regressão](REGRAS_DE_NAO_REGRESSAO.md) e [deploy](operacao/DEPLOY.md).

## 6. Regras para continuidade e alterações futuras

1. **Banco existente é a fonte de dados real.** Não usar a demonstração fictícia dos outros repositórios como base para este projeto.
2. **Não executar `supabase db reset`, seeds de teste ou migrações no projeto remoto** para “corrigir” algo sem revisão, backup e autorização explícita.
3. A correspondência atual de migrations por versão (91/91) precisa ser reavaliada após qualquer mudança de schema; migration nova é versionada, revisada e testada em staging.
4. Alterações de Edge Functions não são necessariamente implantadas por push do frontend; conferir deploy específico e logs.
5. Toda mudança de RLS, permissões, login, arquivos privados e funções privilegiadas exige avaliação de segurança; não desativar RLS para fazer uma página funcionar.
6. Antes de alterações importantes, conferir um **backup recuperável** do Postgres **e dos arquivos Storage**. O repositório GitHub **não é backup dos registros**, nem dos objetos armazenados no Storage; a auditoria não criou backup.
7. Proteger dados de familiares: não versionar dumps, capturas de dados privados, `.env.local`, tokens, certificados, logs pessoais nem fotos/documentos privados.
8. **Vercel em produção:** a `main` é fonte do deployment. Um `git push origin main` pode disparar um novo deploy, **mesmo se a mudança for apenas documental**. Preferir branch de documentação até a publicação ser autorizada.
9. Testar a produção separadamente do localhost, especialmente autenticação, upload e acesso a arquivos privados.
10. Atualizar esta fotografia de auditoria com nova data após confirmar resultados no futuro.

## 7. Pendências prioritárias antes de novas funcionalidades

De acordo com o [plano canônico](PLANO_PROXIMOS_PASSOS.md) e a auditoria de novembro de 2026:

- Validar acesso a PDF/imagens em `historical-files` privado, inclusive URL assinada, download e preview.
- Executar QA autenticado com diferentes perfis/permissões e em mobile.
- Revisar cada função `SECURITY DEFINER` sinalizada e a função anônima de primeiro acesso; não quebrar onboarding legítimo.
- Avaliar a proteção de senhas vazadas e os avisos de RLS/performance pelos caminhos quentes realmente utilizados.
- Verificar integrações Google Agenda (OAuth, callback, sincronização, desconexão) se forem necessárias.
- Validar IA (`/api/ai` e `generate-person-insights`) com os segredos corretos e sem expô-los.
- Conferir estratégia de backup/restauração e titularidade da organização Supabase.
- Fazer QA do deployment de produção no domínio real.

Não marcar essas pendências como concluídas apenas pelo sucesso do login local.

## 8. Documento versionado no GitHub sem afetar a produção

**Localização no repositório:** `docs/STATUS_E_CONTINUIDADE.md`.

Em 23/11/2026, este documento foi publicado na branch remota `docs/continuidade-2026`, criada a partir de `main`. A `main` permanece inalterada; por isso, **a documentação não exigiu um redeploy de produção**. O Vercel pode gerar um preview para a branch documental.

### Trazer a documentação ao computador, preservando `main`

No PowerShell, com a árvore de trabalho limpa:

```powershell
cd C:\Users\Tulius\Documents\github\arvorefamilia
git fetch origin
git switch --track origin/docs/continuidade-2026
git status
```

Se a branch `docs/continuidade-2026` já existir localmente, use em vez do comando `git switch --track`:

```powershell
git switch docs/continuidade-2026
git pull --ff-only
```

O arquivo estará em `docs/STATUS_E_CONTINUIDADE.md`. Para retornar à branch principal, depois de conferir `git status`:

```powershell
git switch main
```

**Integração opcional:** quando for desejável incluir a documentação no histórico de produção, abrir um Pull Request de `docs/continuidade-2026` para `main`. Fazer merge na `main` pode disparar novo deploy do Vercel, mesmo sem mudanças no código da aplicação. Não fazer merge automaticamente só para concluir o arquivamento.

## 9. Referências

- [GitHub — arvorefamilia](https://github.com/tuliust/arvorefamilia)
- [Supabase — projeto arvorefamilia](https://supabase.com/dashboard/project/jimymkzejbhuseozunxl)
- [Vercel — projeto arvorefamilia](https://vercel.com/)
- [Índice da documentação](README.md)
- [Plano de próximos passos](PLANO_PROXIMOS_PASSOS.md)
- [Migrations](operacao/MIGRATIONS_SUPABASE.md)
- [Deploy](operacao/DEPLOY.md)
- [QA](QA_MANUAL.md)
- [Segurança e não regressão](REGRAS_DE_NAO_REGRESSAO.md)

---

**Orientação final:** manter **uma única pasta local**, **um único repositório GitHub** e **o Supabase original** para a continuidade do Árvore Família. A prioridade é preservar os dados familiares reais; qualquer cenário de demonstração deve ser isolado, não misturado à base existente.