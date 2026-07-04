# Deploy

> Última revisão: 2026-07-04  
> Escopo: checklist operacional de validação, publicação, Supabase Functions e QA pós-deploy.  
> Status: canônico.

## Objetivo

Concentrar o procedimento de deploy em um único documento operacional. Este arquivo substitui o antigo `docs/operacao/DEPLOYMENT.md` e o antigo índice local de operação.

## Checklist antes do deploy

### Bash/Git Bash

```bash
git status --short
git diff --check
npm run typecheck
npm run build
npm run test
```

### Windows PowerShell

```powershell
git status --short
git diff --check
npm run typecheck
npm run build
npm run test
```

A saída esperada é:

- `typecheck` sem erros;
- build concluído;
- testes passando;
- nenhuma alteração fora do escopo planejado;
- nenhum erro de whitespace no diff;
- nenhum arquivo temporário `.revisado.md`, `.tmp`, `.bak` ou duplicado fora do plano.

Observação: `npm test` pode funcionar em alguns ambientes, mas o script versionado no `package.json` é `npm run test`.

## Publicação do frontend

1. Confirmar branch correta.
2. Confirmar que a `main` está atualizada.
3. Executar validações locais.
4. Fazer commit com mensagem objetiva.
5. Fazer push.
6. Conferir deploy na plataforma configurada.
7. Executar QA manual mínimo.

### Comandos padrão

```bash
git pull origin main
git status --short
npm run typecheck
npm run build
npm run test
git add docs
git commit -m "docs: atualiza documentacao operacional e contratos recentes"
git push origin main
```

PowerShell:

```powershell
git pull origin main
git status --short
npm run typecheck
npm run build
npm run test
git add docs
git commit -m "docs: atualiza documentacao operacional e contratos recentes"
git push origin main
```

## Publicação de Supabase Edge Functions

Quando houver alteração em `supabase/functions/*`, o push para GitHub não garante, por si só, que a função remota tenha sido atualizada. Confirmar o fluxo real do projeto.

### Função `generate-person-insights`

Alterações nessa função exigem deploy manual ou pipeline equivalente:

```bash
supabase functions deploy generate-person-insights
```

PowerShell:

```powershell
supabase functions deploy generate-person-insights
```

Validação esperada:

```txt
Deployed Functions on project <project-ref>: generate-person-insights
```

Avisos como `Docker is not running` podem não bloquear o deploy de função quando a CLI conseguir subir os assets. Confirmar a mensagem final no terminal e o dashboard do Supabase.

Depois do deploy:

- confirmar `OPENAI_API_KEY` configurada no projeto Supabase;
- gerar conteúdo ausente em `/admin/gestao-conteudo-pessoas`;
- regenerar conteúdo histórico de uma pessoa com data completa;
- confirmar `period_title`, `brazil` e `world`;
- confirmar que `prompt_version` é `v2-contexto-brasil-mundo` para fatos históricos.

## Migrations Supabase

Quando houver migration nova:

```bash
npx supabase db push
```

PowerShell:

```powershell
npx supabase db push
```

Depois validar:

- tabelas;
- RLS;
- RPCs;
- policies;
- buckets;
- funções relacionadas.

Detalhes ficam em `docs/operacao/MIGRATIONS_SUPABASE.md`.

## Integrações relacionadas

Detalhes específicos ficam em:

- `operacao/OAUTH_GOOGLE.md`;
- `operacao/STORAGE_MAINTENANCE.md`;
- `operacao/MIGRATIONS_SUPABASE.md`;
- `GUIA_CORRECAO_ERROS.md`.

## QA mínimo pós-deploy

Validar manualmente:

- `/entrar`;
- `/mapa-familiar`;
- `/linha-geracional`;
- `/mapa-familiar-horizontal`;
- `/pessoa/:id`;
- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`;
- `/curiosidades`;
- `/calendario-familiar`;
- `/forum`;
- `/meus-favoritos`;
- `/notificacoes`;
- `/admin`;
- `/admin/pessoas`;
- `/admin/gestao-conteudo-pessoas`;
- `/admin/notificacoes`;
- `/admin/duvidas`;
- `/admin/atividades`.

## QA específico pós-deploy: Linha do Tempo e PDF

Validar em uma página de pessoa com anexo PDF histórico:

1. Abrir a Linha do Tempo.
2. Confirmar que o título `Arquivos e registros vinculados` não aparece.
3. Confirmar que `Abrir` e `Baixar` têm a mesma hierarquia visual.
4. Clicar em `Abrir`.
5. Confirmar que o modal abre.
6. Confirmar que o PDF renderiza em canvas.
7. Confirmar que o botão `Abrir em nova aba` funciona.
8. Confirmar que `Baixar` continua funcionando no card.
9. Confirmar que não há erro de `X-Frame-Options` no console.

## QA específico pós-deploy: parentesco

Validar no perfil de Condilênia:

```txt
Caio Souza/Caio Cavalcanti Souza
Adalberto Bezerra Neto
Absalon Limeira de Souza Neto
Heitor de Albuquerque Tsangaropulos
```

Resultado esperado:

- não cair no fallback genérico `Há uma ligação familiar entre...`;
- usar `sobrinho/sobrinha`, `cônjuge`, `foi casado/casada` quando aplicável;
- usar `avó` para Condilênia em relação a Heitor.

Validar também em `/curiosidades`, seção `Qual a minha conexão com alguém?`.

## QA específico pós-deploy: conteúdos automáticos

Em `/admin/gestao-conteudo-pessoas`:

1. Selecionar pessoa com data completa.
2. Clicar em `Gerar conteúdos ausentes`.
3. Confirmar astrologia.
4. Confirmar fatos do nascimento.
5. Confirmar campos:
   - `Subtítulo do período`;
   - `Título Brasil`;
   - `Texto Brasil`;
   - `Título Mundo`;
   - `Texto Mundo`.
6. Salvar.
7. Recarregar.
8. Confirmar persistência.
9. Clicar em `Regenerar conteúdos`.
10. Confirmar que Brasil/Mundo continuam preenchidos.

## Troubleshooting

| Sintoma | Verificação |
|---|---|
| Página 404 ao recarregar rota interna | Conferir fallback SPA da hospedagem. |
| Erro de autenticação | Conferir configuração do provedor e callback. |
| Falha em upload ou leitura de arquivos | Conferir buckets, policies e `STORAGE_MAINTENANCE.md`. |
| PDF não aparece no modal | Conferir fetch do arquivo, CORS, PDF.js/CDN e `GUIA_CORRECAO_ERROS.md`. |
| Erro `X-Frame-Options` | Confirmar que não foi reintroduzido Google Viewer/iframe externo. |
| Erro em IA | Conferir Edge Function, `OPENAI_API_KEY`, logs do Supabase e limites de payload. |
| Tela protegida inacessível | Conferir guards, sessão e perfil do usuário. |
| Frase de parentesco genérica | Conferir `relationshipSentenceOverrides` e testes. |

## Regra de manutenção

Não recriar documentos paralelos de deploy. Se o processo mudar, atualizar este arquivo e os documentos específicos de operação quando necessário.
