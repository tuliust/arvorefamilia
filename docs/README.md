# Documentação do produto — Sua Família / arvorefamilia

> Última revisão: 2026-06-23  
> Estado documentado: branch `feature/questionario-ia-vinculos-pets`, após os ciclos 6A–7D e ajustes pós-ciclo 7D.  
> Status: documentação canônica consolidada pós-onboarding, pós-fatos históricos, pós-ajustes de mapa familiar, pós-revisão de `/curiosidades` e pós-atualizações de UX desktop.

Este diretório concentra a documentação funcional, técnica, operacional, de UX, QA e histórico de decisões do produto.

## Estado consolidado

### Ciclo 2026-06-22

| Frente | Commit | Status |
|---|---:|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Implementado e pushado |
| Prompt 7A — questionário, IA e privacidade | `4a1a995` | Implementado e pushado |
| Prompt 7B — vínculos, pets, cônjuges e badges | `c9a8f27` | Implementado e pushado |
| Prompt 7C — fatos/arquivos históricos na timeline | `6185b6d` | Implementado e pushado |
| Prompt 7D — UX final do onboarding e IA 500 caracteres | `de4f60f` | Implementado e pushado |

### Ajustes pós-ciclo 7D — 2026-06-23

| Frente | Commits | Status |
|---|---:|---|
| Revisão ampla de `/curiosidades` | `bf8f57a`, `ce80a00`, `62a6254` | Implementado e pushado |
| Integração de badges do `/meus-dados` em `/curiosidades` | `ce80a00`, `62a6254` | Implementado e pushado |
| Painel desktop, dropdowns, notificações, fórum e favoritos | `e70f8a7`, `dbcc09c` | Implementado e pushado |
| Layout desktop do canvas da árvore | `5b69baf`, `3d228fa` | Implementado e pushado |
| Documentação pós-ciclo 7D | `9f81d61` | Implementado e pushado |

## Contratos implementados

### Onboarding do membro

Fluxo principal:

```text
/meus-dados
  → /meus-vinculos
  → /arquivos-historicos
  → /preferencias
  → /revisao-dados
  → /mapa-familiar
```

Regra especial:

- pessoa marcada como falecida em `/meus-dados` pula `/preferencias` e segue para `/revisao-dados`;
- páginas de onboarding não exibem botões de ação no header, apenas ícone, título e subtítulo à esquerda.

### Mini Bio e Curiosidades com IA

- O questionário em `/meus-dados` possui 8 etapas.
- A etapa 1 pergunta **“Qual é o seu estilo?”**.
- `Nostálgico` é apenas um tom textual, não define sozinho que a pessoa é falecida.
- O modo memorial depende do toggle **“Você está escrevendo o perfil de uma pessoa falecida?”**.
- Qualquer tom pode gerar texto no passado e em terceira pessoa quando o toggle memorial estiver ativo.
- Mini Bio e Curiosidades aceitam até **500 caracteres** cada.
- A IA deve buscar aproximadamente **400–450 caracteres** por campo.
- Os textos não precisam começar com “Sou fulano...” ou “[Nome] foi...”, pois o nome já aparece no perfil.
- A IA pode considerar, quando disponíveis, questionário, dados básicos, profissão, idade aproximada, locais, vínculos e fatos históricos, sem expor telefone, endereço, WhatsApp, redes sociais, URLs, storage paths, tokens ou conteúdo sensível.

### `/meus-vinculos`

- Pets são grupo próprio e não entram como Filhos.
- Criação de pet usa `humano_ou_pet: 'Pet'`.
- Pessoa humana não entra em Pets.
- Badge `Cadastrado` depende de vínculo real em `user_person_links`.
- Pessoa sem vínculo de usuário aparece como `Pré-cadastrado`.
- Cônjuges têm no máximo um relacionamento ativo no estado local.
- Alterações seguem como solicitações pendentes em `relationship_change_requests`, não como gravação definitiva direta.
- O bloco “Sobre mim” fica fora do box de edição de textos.
- O bloco “Familiares de X” fica fora do container de vínculos.
- Botões inferiores de “Adicionar” em estados vazios foram removidos; permanece apenas o botão superior do grupo.
- O texto de Mini Bio/Curiosidades é salvo ao avançar o fluxo; o botão “Salvar textos” foi removido.

### `/arquivos-historicos`

- A etapa representa **Fatos e Arquivos Históricos**.
- Upload é opcional.
- Registros podem ser:
  - fato sem arquivo;
  - imagem;
  - PDF.
- `arquivos_historicos` é a fonte única de fatos/arquivos ligados a uma pessoa ou relacionamento.
- A migration `20260622170000_allow_historical_facts_without_file.sql` permite `url`, `storage_bucket`, `storage_path` e `mime_type` nulos.
- Registros aparecem na timeline do perfil da pessoa.
- Fato sem arquivo aparece como `Fato`; registro com anexo aparece como `Arquivo`.

### `/curiosidades`

- Cards principais revisados:
  - `Pessoas`;
  - `Localização`;
  - `In memoriam`;
  - `Pets`;
  - `Casais`.
- Rankings revisados:
  - `Nomes mais comuns`;
  - `Mês com mais aniversários`, agora em top 5 meses;
  - `Perfil dos familiares`, baseado em badges do questionário quando disponíveis;
  - `Principais cidades de nascimento`.
- Gráficos agora incluem `Faixa Etária` em vez de geração sociológica.
- Bodas consideram fim por falecimento quando um dos cônjuges morreu.
- Comparações de interesses usam badges/características do `/meus-dados` quando disponíveis.
- Dropdowns de interesses, astrologia e conexão iniciam em estado neutro.
- Quiz familiar foi revisado para pessoa viva mais velha, pessoa mais jovem, cidade de nascimento e profissão.
- `/curiosidades` consome `getProfileQuestionnaireSelectedBadges` e monta `profileBadgesByPersonId`.

### `/mapa-familiar`

- Dropdown do painel desktop mantém label fechado **“Família de X”**.
- Dropdown aberto apresenta **“Visualize a árvore como...”** e lista pessoas com primeiro e segundo nome.
- Card `Cadastrados` usa `user_person_links` como referência.
- O tour separa IA/Calendário de Favoritos.
- Layout compacto é usado para árvore pequena e simples no `DesktopFamilyMapView`.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` foram compactados no desktop.
- O botão de cônjuges alterna entre:
  - **Exibir cônjuges de tios, primos etc**;
  - **Ocultar cônjuges de tios, primos etc**.
- No canvas desktop, o grupo de irmãos permite até 2 cards por linha.
- Cônjuge e pets foram deslocados para a direita no layout desktop.
- Mobile foi preservado.
- Scripts mobile e `index.html` permanecem protegidos contra alterações indiretas.

### Header, notificações, fórum e favoritos

- O menu do avatar inclui **Dúvidas?** à esquerda e **Sair** à direita.
- O dropdown de notificações ganhou largura responsiva e rodapé flexível para evitar corte de botões.
- A barra de pesquisa de `/forum` foi expandida no desktop.
- A barra de pesquisa/filtros de `/meus-favoritos` foi expandida no desktop.

## Índice dos documentos

| Tema | Arquivo |
|---|---|
| Estado atual do produto | `BASELINE_PRODUTO_ATUAL.md` |
| Inventário técnico | `INVENTARIO_TECNICO.md` |
| Próximos passos e pendências reais | `PLANO_PROXIMOS_PASSOS.md` |
| Componentes | `GUIA_COMPONENTES.md` |
| Implementações | `GUIA_IMPLEMENTACOES.md` |
| UX e layout | `GUIA_UX_LAYOUT.md` |
| QA manual | `QA_MANUAL.md` |
| Correção de erros | `GUIA_CORRECAO_ERROS.md` |
| Decisões arquiteturais | `DECISOES_ARQUITETURAIS.md` |
| Regras de não regressão | `REGRAS_DE_NAO_REGRESSAO.md` |
| Arquitetura | `arquitetura/ARCHITECTURE.md` |
| Rotas e guards | `arquitetura/ROTAS_E_GUARDS.md` |
| Mapa familiar | `funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Meus vínculos | `funcionalidades/MEUS_VINCULOS.md` |
| Mini Bio/Curiosidades IA | `funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Curiosidades e IA | `funcionalidades/CURIOSIDADES_E_IA.md` |
| Painel/legendas/conectores da árvore | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Fatos e Arquivos Históricos | `funcionalidades/ARQUIVOS_HISTORICOS.md` |
| Revisão de dados | `funcionalidades/REVISAO_DADOS.md` |
| Migrations Supabase | `operacao/MIGRATIONS_SUPABASE.md` |
| Storage | `operacao/STORAGE_MAINTENANCE.md` |
| Deploy | `operacao/DEPLOYMENT.md` |
| Levantamento 2026-06-22 | `historico/LEVANTAMENTO_AJUSTES_CHAT_20260622.md` |
| Levantamento 2026-06-23 | `historico/LEVANTAMENTO_AJUSTES_CHAT_20260623.md` |

## Pendências abertas

As frentes 6A, 7A, 7B, 7C, 7D e os ajustes pós-ciclo 7D estão documentados como concluídos. As pendências reais restantes são:

- validar manualmente o fluxo completo em ambiente de preview/produção;
- aplicar e verificar migrations no Supabase remoto;
- validar RPC `get_person_profile_selected_badges` no ambiente remoto;
- adicionar verificação de typecheck explícita ao pipeline, se ainda não existir;
- fazer rodada visual em mobile e desktop após deploy;
- confirmar que não há regressão de encoding UTF-8 em arquivos alterados via PowerShell;
- manter os scripts mobile e `index.html` protegidos contra regressões.
