# Plano de próximos passos

> Última revisão: 2026-07-04  
> Escopo: pendências reais após auditoria documental da branch `main`, validações pós-merge, primeiro acesso, perfis gerenciados, Supabase/RLS, IA, Linha do Tempo, PDF, parentesco e documentação complementar.  
> Status: canônico.

## Pendências operacionais pós-merge

- Conferir deploy gerado a partir da `main`.
- Validar manualmente `/mapa-familiar`, `/linha-geracional`, `/mapa-familiar-horizontal`, `/curiosidades`, `/forum`, `/calendario-familiar`, `/meus-dados`, `/meus-vinculos`, `/arquivos-historicos`, `/preferencias`, `/revisao-dados`, `/admin/duvidas`, `/admin/atividades`, `/admin/notificacoes` e `/admin/gestao-conteudo-pessoas` no ambiente publicado.
- Confirmar que o ambiente remoto do Supabase recebeu as migrations necessárias.
- Confirmar que variáveis de ambiente de IA e demais chaves operacionais estão disponíveis quando exigidas.
- Validar no ambiente publicado o bloqueio de rotas internas para usuário com `dados_confirmados = false`.
- Validar que usuário com onboarding incompleto retorna para `/meus-dados` e mantém dados salvos nas etapas já preenchidas.
- Validar que usuário com onboarding finalizado acessa `/mapa-familiar` e rotas internas normalmente.

## Pendências específicas de Linha do Tempo, PDF e arquivos históricos

- Validar em produção o botão `Abrir` em anexo PDF da Linha do Tempo:
  - abrir modal;
  - renderizar páginas do PDF em canvas;
  - não exibir erro de `X-Frame-Options`;
  - não acionar download automático;
  - manter `Abrir em nova aba` como fallback.
- Validar que `Abrir` e `Baixar` têm mesma hierarquia visual.
- Validar PDF com uma página, múltiplas páginas, arquivo grande, URL pública do Supabase e falha de carregamento.
- Confirmar que o título `Arquivos e registros vinculados` não voltou a aparecer dentro dos cards da Linha do Tempo.
- Se houver falha de `fetch` do PDF por CORS, revisar policy/header do bucket `historical-files` ou fluxo de URL pública/assinada.

## Pendências específicas de parentesco e conexões

- Validar em produção, no perfil de Condilênia, os casos:
  - Caio Souza/Caio Cavalcanti Souza;
  - Adalberto Bezerra Neto;
  - Absalon Limeira de Souza Neto;
  - Heitor de Albuquerque Tsangaropulos.
- Confirmar que o fallback `Há uma ligação familiar entre...` não aparece nesses casos.
- Confirmar que `Condilênia Souza é avó de Heitor Tsangaropulos.` usa `avó`, não `avô/avó`.
- Validar os mesmos pares em `/curiosidades`, na seção `Qual a minha conexão com alguém?`.
- Validar vínculos por afinidade com cônjuges ativos e inativos.
- Validar se `/curiosidades` deve considerar `includeInactiveSpouses: true` de forma permanente. O perfil já usa essa configuração; em `/curiosidades`, confirmar se a regra de produto exige o mesmo comportamento para todos os casos.

## Pendências específicas de IA e conteúdos automáticos

- Validar em `/admin/gestao-conteudo-pessoas`:
  - geração de conteúdos ausentes;
  - regeneração forçada;
  - edição manual de astrologia;
  - edição manual de fatos do nascimento;
  - salvamento de `period_title`, `brazil` e `world`;
  - limpeza individual de astrologia;
  - limpeza individual de fatos históricos.
- Confirmar que a Edge Function `generate-person-insights` está implantada no projeto Supabase correto depois de alterações.
- Confirmar que `OPENAI_API_KEY` está configurada no ambiente da Edge Function.
- Validar pessoa com data em `DD/MM/AAAA` e `YYYY-MM-DD`.
- Validar erro amigável para pessoa sem data completa.
- Confirmar que a geração histórica usa `prompt_version = v2-contexto-brasil-mundo`.
- Confirmar que respostas incompletas da IA acionam reparo automático antes do `upsert`.

## Pendências específicas de primeiro acesso e perfis gerenciados

- Validar em produção `/meus-dados` no primeiro acesso:
  - clicar em `Pular Tudo` sem responder o questionário;
  - confirmar que Mini Bio e Curiosidades podem ficar vazias;
  - confirmar que `Confirmar meus dados` permanece disponível na tela final;
  - clicar em `Voltar ao questionário` e confirmar retorno à primeira etapa.
- Validar geração com IA em `/meus-dados`.
- Validar perfil gerenciado e ausência de mistura entre responsável e pessoa ativa.
- Se ainda não estiver implementado, criar card de reforço em `/revisao-dados` para foto, data completa de nascimento, local de nascimento, local atual, Mini Bio e Curiosidades pendentes.

## Pendências de Supabase, RLS e Storage

- Confirmar aplicação remota das migrations recentes de storage/profile questionnaire quando existirem no repositório.
- Validar RLS de `person_profile_questionnaire_answers`.
- Validar `admin_reset_person_profile` sem erro de deleção direta em `storage.objects`.
- Planejar limpeza física de arquivos via Storage API, não por SQL direto.
- Revisar a policy de `user_person_links`.
- Confirmar políticas RLS para pessoas, relacionamentos, vínculos, fatos históricos, notificações, favoritos, fórum e visibilidade por pessoa.
- Confirmar que o bucket `historical-files` permite leitura compatível com preview de PDF, respeitando privacidade e escopo do projeto.

## Pendências de produto e QA visual

- Validar em navegador real o fluxo de `Salvar Imagem` e `Imprimir`.
- Confirmar que `Imagem` e `PDF` não reaparecem como ações principais do painel `Exportar`.
- Validar visualmente `/curiosidades` após deploy.
- Revisar eventual texto com caracteres corrompidos fora de `docs/`.
- Implementar, quando aprovado, ajustes em `/calendario-familiar`.
- Validar o modal atual de pet em `/meus-vinculos`.
- Revisar o botão local `+`/`−` dos grupos de tios no desktop de `/mapa-familiar`.

## Pendências de produto administrativo

- Corrigir acentuação nativa dos textos em `/admin/gestao-conteudo-pessoas`, caso QA confirme mojibake.
- Criar/aplicar migration real de `person_visibility_settings` no Supabase remoto.
- Planejar reutilização administrativa dos fluxos `/meus-dados`, `/meus-vinculos` e `/arquivos-historicos`.
- Concluir migração visual de `/admin/notificacoes` para consumir catálogo persistido.
- Validar em produção a preservação de aba ativa e rascunho local da aba `Configuração`.

## Pendências técnicas permanentes

- Migrar, quando estável, `src/memberInteractionLayoutRuntimeFixes.ts` para componentes React/serviços tipados.
- Revisar scripts carregados por `index.html`.
- Criar documentação administrativa mais detalhada apenas quando novas rotas/abas administrativas forem implementadas.
- Monitorar wrappers com nomes próximos para evitar lógica aplicada na rota errada.
- Manter validação de `git diff --check`, typecheck, build e testes antes de publicar documentação ou código.

## Próximas documentações para ajustar

1. `README.md` na raiz do repositório: substituir referências quebradas a docs históricos antigos, se ainda existirem.
2. `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md`: revisar lista de runtimes defensivos e alinhar com `index.html`.
3. `docs/arquitetura/ROTAS_E_GUARDS.md`: revisar se precisa mencionar novos runtimes.
4. `docs/arquitetura/DECISOES_ARQUITETURAIS.md`: complementar decisão sobre scripts defensivos versus componentes React.
5. `scripts/reorganizar-documentacao.sh` e `.ps1`: arquivar, neutralizar ou reescrever.
6. Se PDF.js for migrado de CDN para dependência npm, atualizar documentação, package e lockfile.
7. Se `/curiosidades` passar a incluir vínculos conjugais inativos por padrão, atualizar documentação funcional e testes.

## Regra de manutenção

- Não recriar documentos datados, temporários, de baseline, rollback ou QA paralelo.
- Não recriar arquivos removidos na limpeza documental final.
- Atualizar `docs/README.md` e `docs/INVENTARIO_TECNICO.md` apenas quando houver criação, remoção, renomeação de documento canônico ou mudança de rota/área.
- Pendências resolvidas no código devem sair deste plano ou virar item de QA.
- Mudanças em PDF, IA ou parentesco devem atualizar os documentos funcionais, operacionais, QA e não regressão no mesmo commit documental.
