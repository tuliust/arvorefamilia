# Plano de próximos passos

> Última revisão: 2026-09-27
> Escopo: estado real da aplicação após estabilização de segurança, sincronização Supabase/GitHub, performance, consistência operacional e implantação de CI.
> Status: canônico.

## Estado estabilizado

Os itens abaixo deixaram de ser pendência:

- GitHub e Supabase estão reconciliados, sem drift de migrations.
- Edge Functions versionadas no repositório foram confrontadas com o ambiente remoto.
- O primeiro acesso garante consistência entre `auth.users`, `profiles` e `user_person_links`.
- Não há solicitações de relacionamento pendentes na base após limpeza do artefato de teste identificado na auditoria.
- As views expostas e RPCs prioritárias passaram pela primeira rodada de hardening de segurança.
- Os hot paths de PostgREST foram identificados e otimizados; o frontend deduplica chamadas redundantes de admin/notificações.
- Os hot paths de `profiles`, `user_person_links`, `notificacoes_usuario` e `person_responsible_links` não mantêm warnings de InitPlan/múltiplas policies permissivas.
- `person_visibility_settings` está aplicada no ambiente remoto.
- As views oficiais da árvore são `/mapa-familiar` e `/mapa-familiar-horizontal`; `/minha-arvore`, `/genealogia` e `/visao-completa` não são rotas ativas.
- O CI executa typecheck, Vitest e build em push/PR; o smoke Playwright passa a fazer parte do mesmo gate nesta rodada.
- A integração Google Agenda possui schema, frontend e Edge Functions implantadas; o que resta é validação operacional do OAuth externo.
- O diagnóstico de Storage considera pessoas, profiles, arquivos históricos e mídias do site.

## Antes de novas funcionalidades

### 1. Fechar privacidade e manutenção de Storage

- Tornar `historical-files` privado somente depois de todos os consumidores usarem download autenticado ou URL assinada.
- Validar preview, abertura em nova aba e download de imagem/PDF após a mudança.
- Manter `person-avatars` e `site-media` públicos enquanto seu uso continuar público.
- Revisar individualmente objetos sem referência antes de exclusão física.
- Executar exclusão somente pela Storage API; nunca por `DELETE FROM storage.objects`.
- O bucket `logo` é legado e fica fora de limpeza automática até revisão explícita.

### 2. QA automatizado obrigatório

O gate mínimo de PR/push deve permanecer:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

O smoke automatizado cobre, no mínimo:

- login público;
- redirects de rotas protegidas sem sessão;
- mapas protegidos sem sessão;
- rotas legadas da árvore retornando 404;
- rotas públicas `/termos`, `/privacidade` e `/duvidas`;
- fallback 404 controlado.

### 3. QA autenticado e visual

Esta camada não deve ser marcada como concluída apenas porque build/E2E público passou.

Validar com sessão real de membro/admin:

- `/mapa-familiar`, `/linha-geracional` e `/mapa-familiar-horizontal` em desktop/mobile;
- onboarding completo: `/meus-dados` → vínculos → arquivos → preferências/revisão → mapa;
- perfil gerenciado via `person_responsible_links`;
- `/curiosidades`, fórum e perspectiva memorial;
- timeline, imagens e PDF;
- `/calendario-familiar`;
- `/admin/integridade`, `/admin/atividades`, `/admin/notificacoes`, `/admin/duvidas` e `/admin/gestao-conteudo-pessoas`;
- exportação `Salvar Imagem` e `Imprimir`;
- mapa/gestos mobile e grupos familiares.

O checklist detalhado permanece em `docs/QA_MANUAL.md`.

### 4. Integrações externas

#### IA

- Validar em produção o endpoint `/api/ai`.
- Confirmar `OPENAI_API_KEY` no ambiente de produção.
- Validar pergunta em Curiosidades, geração de Mini Bio/Curiosidades e fluxo administrativo de conteúdos automáticos.
- Erro de configuração deve continuar aparecendo de forma controlada, sem quebrar a rota.

#### Google Agenda

Implementação interna existente; resta validar configuração externa:

- Google Calendar API habilitada;
- OAuth consent screen;
- redirect URI de produção;
- secrets da Edge Function;
- test users enquanto o app estiver em Testing;
- conectar → callback → sincronizar → repetir sem duplicar → desconectar.

### 5. Advisors e dívida técnica

Tratar de forma dirigida, não apenas para zerar contadores:

- revisar warnings restantes de RLS InitPlan quando tabelas entrarem em hot path real;
- consolidar policies permissivas apenas quando a semântica de autorização estiver comprovada;
- indexar FKs com base em joins/consultas reais;
- remover índice duplicado confirmado em `qa_categories`;
- habilitar proteção contra senhas vazadas no Auth quando a configuração do projeto/plan permitir;
- revisar periodicamente funções `SECURITY DEFINER` executáveis por `authenticated`;
- migrar gradualmente runtimes/patches defensivos para componentes e serviços tipados;
- substituir o nome residual de package/template quando não houver dependência operacional dele.

## Backlog de produto — não bloqueia estabilização

Não misturar estes itens com correções de infraestrutura:

- persistência do mural de memórias em Curiosidades;
- favoritar/compartilhar descobertas;
- integração da distância em km quando houver coordenadas confiáveis;
- melhorias futuras de calendário;
- refactors maiores de componentes/runtimes já estabilizados.

Novas funcionalidades só devem voltar a ser priorizadas depois que Storage privado, CI E2E e a rodada de QA autenticado tiverem resultado registrado.

## Regra de manutenção

- Código e migrations são a fonte de verdade para implementação.
- `docs/QA_MANUAL.md` é a fonte de verdade para QA.
- Este arquivo contém somente pendências atuais; itens concluídos não devem voltar como tarefa.
- Toda PR relevante deve usar `.github/pull_request_template.md`.
- Mudanças de schema/RLS/policy/view/RPC exigem migration versionada e reconciliação GitHub ↔ Supabase.
- Exclusões de arquivo físico devem usar Storage API.
