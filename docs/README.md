# Documentação do produto — Sua Família / arvorefamilia

> Última revisão: 2026-06-22  
> Estado documentado: branch `feature/questionario-ia-vinculos-pets`, após os commits 6A, 7A, 7B, 7C e 7D.  
> Status: documentação canônica consolidada pós-onboarding, pós-fatos históricos e pós-ajustes de mapa familiar.

Este diretório concentra a documentação funcional, técnica, operacional, de UX, QA e histórico de decisões do produto.

## Estado consolidado do ciclo 2026-06-22


| Frente | Commit | Status |
|---|---:|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Implementado e pushado |
| Prompt 7A — questionário, IA e privacidade | `4a1a995` | Implementado e pushado |
| Prompt 7B — vínculos, pets, cônjuges e badges | `c9a8f27` | Implementado e pushado |
| Prompt 7C — fatos/arquivos históricos na timeline | `6185b6d` | Implementado e pushado |
| Prompt 7D — UX final do onboarding e IA 500 caracteres | `de4f60f` | Implementado e pushado |


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

### `/mapa-familiar`

- Dropdown do painel desktop usa labels **“Família de X”**.
- O card `Cadastrados` usa `user_person_links` como referência.
- O tour foi revisado e separa IA/Calendário de Favoritos.
- Layout compacto é usado para árvore pequena e simples no `DesktopFamilyMapView`.
- Scripts mobile e `index.html` permanecem protegidos contra alterações indiretas.

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
| Levantamento do ciclo | `historico/LEVANTAMENTO_AJUSTES_CHAT_20260622.md` |

## Pendências ainda abertas

A documentação considera resolvidas as frentes 6A, 7A, 7B, 7C e 7D. As pendências reais restantes são:

- validar manualmente o fluxo completo em ambiente de preview/produção;
- aplicar e verificar migrations no Supabase remoto;
- decidir o destino final do seletor/debug `Visualizar como...` (`TREE-005`);
- adicionar verificação de typecheck explícita ao pipeline, se ainda não existir;
- fazer uma rodada visual em mobile e desktop após deploy;
- continuar protegendo os scripts mobile e `index.html` contra regressões.
