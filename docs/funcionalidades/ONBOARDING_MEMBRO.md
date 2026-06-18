# Onboarding do membro — Árvore Família

> Última revisão: 2026-06-16  
> Local canônico: `docs/funcionalidades/ONBOARDING_MEMBRO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Tipo: documentação funcional do cadastro inicial do membro  
> Status: criado para consolidar o fluxo de onboarding em etapas, incluindo comportamento condicional para pessoa viva/falecida, revisão final editável e regras de QA/não regressão.

---

## 1. Objetivo

Este documento é a referência funcional do **onboarding do membro** no projeto **Árvore Família**.

Use este arquivo para entender e validar:

- fluxo de cadastro inicial do membro;
- diferença entre pessoa viva e pessoa falecida;
- regras de navegação entre etapas;
- comportamento de dados pessoais, vínculos, arquivos históricos, preferências e revisão;
- edição inline na revisão final;
- microcopy, botões, badges e estados visuais;
- regras de QA e não regressão específicas do onboarding.

Este documento complementa, mas não substitui:

```txt
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/funcionalidades/NOTIFICACOES.md
```

Regra principal:

```txt
O onboarding é um fluxo funcional próprio. Alterações em etapas, navegação, permissões, notificações ou revisão final devem atualizar este documento e os guias canônicos relacionados no mesmo lote.
```

---

## 2. Escopo do onboarding

O onboarding do membro cobre o fluxo inicial de revisão/cadastro da pessoa vinculada ao usuário autenticado.

Ele é diferente de:

| Fluxo | Documento principal | Observação |
|---|---|---|
| Edição completa da própria árvore | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Fluxo mais amplo de edição posterior. |
| Perfil público/privado de pessoa | `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Exibição e administração de perfis. |
| Central de notificações | `docs/funcionalidades/NOTIFICACOES.md` | Canal recorrente de notificações. |
| Árvore familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` | Visualização da árvore. |

---

## 3. Rotas e etapas oficiais

O fluxo de onboarding é protegido por `MemberRoute`.

| Etapa | Rota | Página | Responsabilidade |
|---:|---|---|---|
| 1 | `/meus-dados` | `MeusDados` | Dados pessoais, nascimento/residência/falecimento, contato, endereço, redes sociais, Mini Bio e Curiosidades. |
| 2 | `/meus-vinculos` | `MeusVinculos` | Revisão, seleção, criação e solicitação de vínculos familiares. |
| 3 | `/arquivos-historicos` | `ArquivosHistoricosPage` | Upload e organização de documentos, fotos e registros históricos. |
| 4 | `/preferencias` | `PreferenciasPage` | Preferências de notificação e permissões de visualização. |
| 5 | `/revisao-dados` | `RevisaoDados` | Revisão final, edição inline e conclusão do primeiro acesso. |

A conclusão definitiva ocorre na Etapa 5.

---

## 4. Arquivos principais

### Componentes e páginas

```txt
src/app/components/member/MemberOnboardingSteps.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/pages/MeusDados.tsx
src/app/pages/MeusVinculos.tsx
src/app/pages/meus-vinculos/RelativeCard.tsx
src/app/pages/meus-vinculos/meusVinculosUtils.ts
src/app/pages/ArquivosHistoricosPage.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/pages/PreferenciasPage.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/pages/RevisaoDados.tsx
```

### Services e utilitários

```txt
src/app/services/memberProfileService.ts
src/app/services/userEngagementService.ts
src/app/services/pessoaSocialProfilesService.ts
src/app/services/arquivosHistoricosService.ts
src/app/utils/personFields.ts
```

### Rotas e guards

```txt
src/app/routes.tsx
src/app/components/MemberRoute.tsx
```

---

## 5. `MemberOnboardingSteps`

`MemberOnboardingSteps` é o indicador visual das etapas.

Responsabilidades:

- exibir etapas do fluxo;
- destacar etapa ativa;
- permitir navegação direta entre etapas quando aplicável;
- ocultar a Etapa 4 para pessoa falecida;
- preservar responsividade em telas menores;
- aparecer abaixo de `MemberPageHeader`.

### Etapas para pessoa viva

```txt
1. Meus dados
2. Vínculos
3. Arquivos
4. Preferências
5. Revisão
```

### Etapas para pessoa falecida

```txt
1. Meus dados
2. Vínculos
3. Arquivos
5. Revisão
```

A Etapa 4 não deve aparecer visualmente nem ser acessada como etapa intermediária para pessoa falecida.

---

## 6. Regra central: pessoa viva vs. pessoa falecida

O campo `falecido` altera o fluxo.

### Pessoa viva

Comportamento esperado:

- exibe **Cidade de residência**;
- exibe container **Contato, endereço e redes sociais**;
- não exibe campos de falecimento;
- passa pela Etapa 4 `/preferencias`;
- exibe box de **Notificações e permissões** na Etapa 5.

### Pessoa falecida

Comportamento esperado:

- não exibe **Cidade de residência**;
- exibe **Dia ou Ano de Falecimento**;
- exibe **Local de falecimento**;
- pode exibir toggle de falecimento no exterior quando aplicável;
- oculta container **Contato, endereço e redes sociais**;
- pula a Etapa 4 `/preferencias`;
- desativa automaticamente notificações;
- desativa WhatsApp/mensagens;
- ativa automaticamente permissões de visualização;
- não exibe box **Notificações e permissões** na Etapa 5.

Resumo:

| Área | Pessoa viva | Pessoa falecida |
|---|---|---|
| Cidade de residência | Exibe | Oculta |
| Campos de falecimento | Oculta | Exibe |
| Contato/endereço/redes | Exibe | Oculta |
| Etapa 4 | Exibe | Pula |
| Notificações | Editáveis | Desativadas automaticamente |
| Permissões de visualização | Editáveis | Ativadas automaticamente |
| Box lateral de notificações/permissões na revisão | Exibe | Oculta |

---

## 7. Etapa 1 — Meus dados

Rota:

```txt
/meus-dados
```

Arquivo principal:

```txt
src/app/pages/MeusDados.tsx
```

### 7.1 Responsabilidades

A Etapa 1 coleta ou revisa:

- nome completo;
- profissão;
- dia ou ano de nascimento;
- local de nascimento;
- indicador de nascimento no exterior;
- status de falecimento;
- dados de falecimento, quando aplicável;
- cidade de residência, quando aplicável;
- contato, endereço e redes sociais, quando aplicável;
- Mini Bio e Curiosidades.

### 7.2 Layout

Contratos visuais:

- títulos e ícones dos containers devem ter hierarquia visual clara;
- o campo **Local de nascimento** deve ficar alinhado ao toggle **Estrangeiro**;
- o campo **Cidade de residência** deve ficar alinhado ao toggle **Exterior**;
- toggles laterais devem ficar centralizados verticalmente em relação ao input;
- em mobile, o layout pode empilhar, preservando leitura e toque.

### 7.3 Condição para pessoa viva

Quando `falecido !== true`:

- exibir **Cidade de residência**;
- exibir toggle **Exterior** ao lado de Cidade de residência;
- exibir container **Contato, endereço e redes sociais**;
- ocultar **Dia ou Ano de Falecimento**;
- ocultar **Local de falecimento**.

### 7.4 Condição para pessoa falecida

Quando `falecido === true`:

- ocultar **Cidade de residência**;
- ocultar container **Contato, endereço e redes sociais**;
- exibir **Dia ou Ano de Falecimento**;
- exibir **Local de falecimento**;
- aplicar defaults automáticos de notificações/permissões.

### 7.5 Redes sociais

Regras:

- linhas incompletas de redes sociais não devem bloquear o salvamento;
- perfis sociais incompletos devem ser ignorados na validação/salvamento;
- redes sociais não aparecem para pessoa falecida no onboarding.

---

## 8. Etapa 2 — Vínculos

Rota:

```txt
/meus-vinculos
```

Arquivos principais:

```txt
src/app/pages/MeusVinculos.tsx
src/app/pages/meus-vinculos/RelativeCard.tsx
src/app/pages/meus-vinculos/meusVinculosUtils.ts
```

### 8.1 Responsabilidades

A Etapa 2 permite:

- revisar vínculos existentes;
- escolher pessoa cadastrada como parente;
- criar nova pessoa;
- solicitar alteração/inclusão de vínculo;
- exibir status visual dos parentes.

### 8.2 Modal de adicionar parente

Contrato atual:

- não exibir botão **Buscar**;
- o campo de texto filtra pessoas cadastradas automaticamente enquanto o usuário digita;
- resultados aparecem em dropdown/lista abaixo do campo;
- manter botão **Criar nova pessoa**;
- não exibir box cinza **Nenhuma pessoa encontrada com este nome**;
- seleção de pessoa existente deve continuar disponível;
- criação de nova pessoa deve continuar disponível.

### 8.3 Microcopy

Rótulo atualizado:

```txt
Outro pai/mãe -> Alterar a mãe
```

Quando o contexto for materno, o rótulo deve refletir claramente a ação de alterar a mãe.

### 8.4 Badges de status

Badges devem respeitar gênero e status.

| Gênero/status | Badge |
|---|---|
| homem vivo | `Vivo` |
| mulher viva | `Viva` |
| homem falecido | `Falecido` |
| mulher falecida | `Falecida` |
| vínculo local/pendente | `Em análise` |

Fallbacks neutros só devem ser usados quando não houver informação suficiente de gênero.

---

## 9. Etapa 3 — Arquivos históricos

Rota:

```txt
/arquivos-historicos
```

Arquivos principais:

```txt
src/app/pages/ArquivosHistoricosPage.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/services/arquivosHistoricosService.ts
```

### 9.1 Responsabilidades

A Etapa 3 permite adicionar e revisar:

- certidões;
- fotos;
- documentos militares;
- documentos escolares;
- registros de viagem;
- registros profissionais;
- outros arquivos históricos.

### 9.2 Botões

Não devem aparecer:

```txt
Voltar para vínculos
Salvar arquivos
```

Botão principal vigente:

```txt
Salvar e Continuar
```

### 9.3 Cards de categoria

Ao clicar em um card de categoria:

- a área de upload muda para aquela categoria;
- o título da área de upload é atualizado;
- a descrição da área de upload é atualizada;
- campos de título e descrição são pré-preenchidos com o título/subtítulo do card.

Exemplo:

```txt
Título: Alistamento Militar
Descrição: Documentos de serviço militar.
```

Se o usuário clicar em outro card antes de adicionar arquivo, a área deve refletir o novo card.

### 9.4 Arquivo adicionado

Após adicionar um arquivo:

- não exibir campos editáveis diretamente;
- exibir apenas thumbnail, título, dados resumidos e botões:
  - **Editar**;
  - **Remover**.

A edição deve acontecer apenas quando o usuário acionar o botão de editar.

### 9.5 Rascunho local

Arquivos adicionados antes do salvamento definitivo devem ser preservados em rascunho local.

O rascunho deve sobreviver a:

- minimizar janela;
- trocar de aba;
- recarregar a página;
- navegar temporariamente, quando tecnicamente suportado pelo estado local.

Após salvar com sucesso, o rascunho deve ser limpo.

### 9.6 Navegação condicional

Pessoa viva:

```txt
/arquivos-historicos -> /preferencias
```

Pessoa falecida:

```txt
/arquivos-historicos -> /revisao-dados
```

---

## 10. Etapa 4 — Preferências

Rota:

```txt
/preferencias
```

Arquivos principais:

```txt
src/app/pages/PreferenciasPage.tsx
src/app/components/notifications/NotificationPreferencesPanel.tsx
src/app/services/userEngagementService.ts
```

### 10.1 Responsabilidades

A Etapa 4 existe para pessoa viva e controla:

- preferências de notificação;
- permissões de visualização;
- canais disponíveis;
- preferências específicas de e-mail, quando aplicável.

### 10.2 Pessoa viva

Para pessoa viva:

- Etapa 4 aparece no stepper;
- usuário pode revisar preferências e permissões;
- botão principal deve ser **Continuar para a revisão**.

Não devem aparecer:

```txt
Salvar permissões
Voltar para arquivos históricos
Receber notificações por email
```

O toggle geral **Receber notificações por email** foi removido do onboarding. Preferências específicas podem permanecer se forem parte do contrato vigente.

### 10.3 Pessoa falecida

Para pessoa falecida:

- Etapa 4 não aparece no stepper;
- fluxo pula diretamente para `/revisao-dados`;
- acesso direto a `/preferencias` deve aplicar defaults automáticos e redirecionar;
- notificações devem ficar desativadas;
- permissões de visualização devem ficar ativadas;
- WhatsApp/mensagens devem ficar desativados.

Defaults esperados:

```txt
receber_aniversarios = false
receber_datas_memoria = false
receber_eventos = false
receber_avisos_gerais = false
receber_email = false
receber_push = false
receber_whatsapp = false
permitir_mensagens_whatsapp = false
permissões de visualização = true
```

---

## 11. Etapa 5 — Revisão final

Rota:

```txt
/revisao-dados
```

Arquivo principal:

```txt
src/app/pages/RevisaoDados.tsx
```

### 11.1 Responsabilidades

A Etapa 5 consolida todas as etapas anteriores.

Deve exibir:

- resumo superior da pessoa;
- avatar/iniciais;
- nome;
- badge de status;
- profissão e residência quando aplicável;
- box **Informações pessoais**;
- box **Mini bio e curiosidades**;
- box **Familiares**;
- box **Arquivos históricos**;
- box **Contatos**, quando aplicável;
- box **Notificações e permissões**, quando aplicável.

### 11.2 Topo da revisão

O topo deve conter:

- avatar/iniciais;
- nome da pessoa;
- badge de status ao lado do nome;
- dados resumidos relevantes;
- botão **Editar perfil**;
- botão **Finalizar e acessar árvore**.

Não deve conter:

```txt
mini bio ao lado do nome
```

A mini bio deve permanecer apenas no box **Mini bio e curiosidades**.

### 11.3 Rodapé

Não devem aparecer no rodapé:

```txt
Voltar para preferências
Finalizar e acessar a árvore
```

A ação de finalizar pertence ao topo da revisão.

### 11.4 Edição inline

Boxes com edição inline:

- **Informações pessoais**;
- **Mini bio e curiosidades**;
- **Contatos**;
- **Notificações e permissões**, quando exibido.

A edição é aberta por botão compacto com ícone de lápis.

Boxes com navegação para etapa específica:

- **Familiares** → `/meus-vinculos`;
- **Arquivos históricos** → `/arquivos-historicos`.

Motivo:

```txt
Vínculos e arquivos têm fluxos próprios, regras específicas e estados mais complexos do que edição inline simples.
```

### 11.5 Informações pessoais

Não exibir dentro do box **Informações pessoais**:

```txt
Pessoa falecida
Nascimento no exterior
Falecimento no exterior
```

Essas informações não devem aparecer como linhas técnicas na revisão. O status deve aparecer via badge superior.

### 11.6 Pessoa falecida na revisão

Se a pessoa principal for falecida:

- badge superior deve respeitar gênero;
- não exibir box **Contatos** se os dados de contato foram ocultados no fluxo;
- não exibir box **Notificações e permissões**;
- não exibir Etapa 4 no stepper;
- manter botão **Finalizar e acessar árvore** no topo.

### 11.7 Badges na revisão

Badges devem respeitar gênero.

| Condição | Badge |
|---|---|
| pessoa principal homem falecido | `Falecido` |
| pessoa principal mulher falecida | `Falecida` |
| familiar homem vivo | `Vivo` |
| familiar mulher viva | `Viva` |
| familiar homem falecido | `Falecido` |
| familiar mulher falecida | `Falecida` |
| familiar pendente/local | `Em análise` |

---

## 12. Notificações e permissões no onboarding

As preferências do onboarding se relacionam com o módulo documentado em:

```txt
docs/funcionalidades/NOTIFICACOES.md
```

Regras:

- `/preferencias` é a Etapa 4 do onboarding;
- `/ajustar-notificacoes` é página recorrente/dedicada;
- `/revisao-dados` pode mostrar resumo/edit inline, mas não deve duplicar tela completa de preferências;
- pessoa falecida não edita preferências no onboarding;
- pessoa falecida recebe defaults automáticos.

---

## 13. Validação e persistência

### Dados pessoais

Usar utilitários existentes:

```txt
src/app/utils/personFields.ts
```

Regras:

- payload deve ser limpo antes de salvar;
- campos de falecimento só são exigidos quando `falecido === true`;
- campos de residência/contato não devem bloquear pessoa falecida;
- redes sociais incompletas não devem bloquear o avanço.

### Services

Usar camada de services:

```txt
memberProfileService.ts
pessoaSocialProfilesService.ts
userEngagementService.ts
arquivosHistoricosService.ts
```

Regra:

```txt
UI não deve acessar Supabase diretamente quando já houver service responsável.
```

---

## 14. Microcopy vigente

| Contexto | Texto vigente |
|---|---|
| Etapa 3, ação principal | `Salvar e Continuar` |
| Etapa 4, ação principal | `Continuar para a revisão` |
| Etapa 5, ação final | `Finalizar e acessar árvore` |
| Vínculos, mãe | `Alterar a mãe` |
| Status masculino falecido | `Falecido` |
| Status feminino falecido | `Falecida` |
| Status masculino vivo | `Vivo` |
| Status feminino vivo | `Viva` |
| Vínculo pendente/local | `Em análise` |

Textos removidos do onboarding:

```txt
Buscar
Nenhuma pessoa encontrada com este nome
Voltar para vínculos
Salvar arquivos
Salvar permissões
Voltar para arquivos históricos
Voltar para preferências
Receber notificações por email
Falecido(a), quando gênero estiver definido
```

---

## 15. QA manual específico

### 15.1 Pessoa viva

Validar:

- [ ] Etapa 1 exibe Cidade de residência.
- [ ] Etapa 1 exibe Contato, endereço e redes sociais.
- [ ] Etapa 1 não exibe campos de falecimento.
- [ ] Etapa 2 modal filtra pessoas ao digitar, sem botão Buscar.
- [ ] Etapa 3 preenche título/descrição pelo card escolhido.
- [ ] Etapa 3 preserva rascunho local de arquivo.
- [ ] Etapa 3 vai para `/preferencias`.
- [ ] Etapa 4 aparece no stepper.
- [ ] Etapa 4 exibe apenas **Continuar para a revisão** como ação principal.
- [ ] Etapa 5 exibe Contatos.
- [ ] Etapa 5 exibe Notificações e permissões.
- [ ] Etapa 5 permite edição inline onde aplicável.
- [ ] Etapa 5 finaliza pelo botão superior.

### 15.2 Pessoa falecida

Validar:

- [ ] Etapa 1 não exibe Cidade de residência.
- [ ] Etapa 1 exibe campos de falecimento.
- [ ] Etapa 1 oculta Contato, endereço e redes sociais.
- [ ] Etapa 3 vai direto para `/revisao-dados`.
- [ ] Etapa 4 não aparece no stepper.
- [ ] Acesso direto a `/preferencias` redireciona para `/revisao-dados`.
- [ ] Notificações ficam desativadas.
- [ ] Permissões de visualização ficam ativadas.
- [ ] Etapa 5 não exibe Notificações e permissões.
- [ ] Etapa 5 não exibe Pessoa falecida, Nascimento no exterior ou Falecimento no exterior no box Informações pessoais.
- [ ] Badge superior usa `Falecido` ou `Falecida`, conforme gênero.
- [ ] Botão **Finalizar e acessar árvore** aparece no topo.

### 15.3 Vínculos

Validar:

- [ ] Homem vivo exibe `Vivo`.
- [ ] Mulher viva exibe `Viva`.
- [ ] Homem falecido exibe `Falecido`.
- [ ] Mulher falecida exibe `Falecida`.
- [ ] Vínculo pendente/local exibe `Em análise`.
- [ ] `Outro pai/mãe` não aparece quando o contexto correto for `Alterar a mãe`.

### 15.4 Arquivos históricos

Validar:

- [ ] Botão **Voltar para vínculos** não aparece.
- [ ] Botão **Salvar arquivos** não aparece.
- [ ] Card clicado atualiza área de upload.
- [ ] Título e descrição são preenchidos pelo card.
- [ ] Troca de card atualiza título/descrição antes do upload.
- [ ] Arquivo adicionado aparece como thumbnail + título + editar/remover.
- [ ] Campos editáveis não ficam abertos por padrão após adicionar arquivo.
- [ ] Rascunho local permanece após troca de aba/reload.

---

## 16. Regras de não regressão

```txt
Pessoa falecida não passa pela Etapa 4.
Pessoa falecida não exibe Cidade de residência.
Pessoa falecida não exibe Contato, endereço e redes sociais.
Pessoa falecida não exibe Notificações e permissões na Etapa 5.
Pessoa falecida deve ter notificações desativadas automaticamente.
Pessoa falecida deve ter permissões de visualização ativadas automaticamente.
O modal de vínculos não deve voltar a ter botão Buscar.
O box "Nenhuma pessoa encontrada com este nome" não deve voltar.
A Etapa 3 deve preservar rascunho local antes do salvamento.
A Etapa 5 não deve exibir mini bio no topo.
A Etapa 5 não deve reexibir rodapé com Voltar para preferências.
Badges de status devem respeitar gênero quando conhecido.
```

---

## 17. Troubleshooting

### Tela visual não reflete código atualizado

Sintoma:

```txt
git status limpo, build passa, commit está no GitHub, mas a interface mostra versão antiga.
```

Causa provável:

- cache do Vite;
- bundle antigo em `dist`;
- cache do navegador;
- deploy ainda não atualizado.

Correção local:

```powershell
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run dev
```

Depois:

```txt
Ctrl + F5
```

ou abrir em aba anônima.

---

## 18. Documentos que devem ser mantidos sincronizados

Sempre que o onboarding mudar, revisar:

```txt
docs/funcionalidades/ONBOARDING_MEMBRO.md
docs/README.md
docs/BASELINE_PRODUTO_ATUAL.md
docs/GUIA_IMPLEMENTACOES.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/NOTIFICACOES.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/GUIA_CORRECAO_ERROS.md
```

Se a alteração envolver banco, RLS, RPC, Storage, Edge Function ou secrets, revisar também:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/operacao/DEPLOYMENT.md
docs/operacao/STORAGE_MAINTENANCE.md
docs/operacao/OAUTH_GOOGLE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
```

---

## 19. Pendências futuras recomendadas

Registrar em `docs/PLANO_PROXIMOS_PASSOS.md`, quando ainda não houver implementação:

```txt
ONB-001 — criar testes automatizados mínimos para fluxo vivo/falecido.
ONB-002 — validar onboarding completo em mobile 320/375/390/430px.
ONB-003 — testar rascunho local de arquivos históricos com arquivos reais grandes.
ONB-004 — validar permissões automáticas de pessoa falecida contra RLS/service.
ONB-005 — revisar acessibilidade dos botões compactos de lápis na revisão.
ONB-006 — confirmar comportamento de edição inline em campos vazios e dados parciais.
```

---

## 20. Critério de aceite para mudanças no onboarding

Uma mudança no onboarding só deve ser considerada pronta quando:

- `npm run build` passa;
- `git diff --check` não retorna erro real;
- rotas e navegação foram validadas;
- fluxo vivo e fluxo falecido foram testados;
- mobile foi conferido nos breakpoints mínimos aplicáveis;
- documentação sincronizada foi atualizada;
- não há retorno de botões, labels ou boxes removidos;
- regras de não regressão foram preservadas.

<!-- ONBOARDING-CONSOLIDADO-2026-06-18 -->
## ConsolidaÃ§Ã£o recente do onboarding do membro

### Fluxo

| Etapa | Rota | FunÃ§Ã£o |
|---|---|---|
| 1 | `/meus-dados` | Dados pessoais, nascimento, residÃªncia/falecimento, contato, redes sociais, mini bio e curiosidades |
| 2 | `/meus-vinculos` | VÃ­nculos familiares |
| 3 | `/arquivos-historicos` | Documentos, fotos e memÃ³rias |
| 4 | `/preferencias` | NotificaÃ§Ãµes e permissÃµes, apenas para pessoa viva |
| 5 | `/revisao-dados` | RevisÃ£o final, ediÃ§Ã£o e finalizaÃ§Ã£o |

### Pessoa viva

- Exibe cidade de residÃªncia.
- Exibe contato, endereÃ§o e redes sociais.
- Passa por preferÃªncias.
- Revisa contatos e notificaÃ§Ãµes antes de finalizar.

### Pessoa falecida

- Exibe dados de falecimento.
- Oculta cidade de residÃªncia no fluxo do membro.
- Oculta contato/endereÃ§o/redes sociais no fluxo do membro.
- Pula `/preferencias`.
- Tem notificaÃ§Ãµes e mensagens por WhatsApp desativadas automaticamente.
- RevisÃ£o final oculta contatos e permissÃµes/notificaÃ§Ãµes.
- Badge deve respeitar gÃªnero quando houver dado suficiente.

### Arquivos histÃ³ricos

- Cards de categoria podem prÃ©-preencher tÃ­tulo e descriÃ§Ã£o.
- Upload deve preservar rascunho local enquanto o item nÃ£o for salvo.
- Participantes podem ser selecionados visualmente.
- `participante_ids` e participantes locais nÃ£o devem pressupor schema definitivo se o banco ainda nÃ£o tiver coluna compatÃ­vel.

### RevisÃ£o final

- Estrutura em card de perfil.
- Boxes por tema.
- EdiÃ§Ã£o inline para blocos editÃ¡veis.
- Familiares e arquivos direcionam para etapa especÃ­fica.
- Mini bio pertence ao box prÃ³prio, nÃ£o ao header.
- BotÃ£o principal de finalizaÃ§Ã£o fica no topo.

### Mobile

- Inputs nÃ£o devem provocar auto-zoom.
- Etapas devem caber na largura.
- Tooltips de data/local devem abrir por toque.
- Header mobile pode ocultar aÃ§Ãµes laterais para reduzir distraÃ§Ã£o.
