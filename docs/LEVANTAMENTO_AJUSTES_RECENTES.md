# Levantamento dos ajustes recentes

> Última revisão: 2026-06-25  
> Local: `docs/LEVANTAMENTO_AJUSTES_RECENTES.md`  
> Escopo: consolidação documental dos ajustes implementados recentemente na branch `main`.  
> Status: documento de apoio canônico para a rodada recente; regras permanentes devem continuar nos guias canônicos existentes.

## 1. Regras de manutenção documental

- A documentação canônica continua organizada a partir de `docs/README.md`.
- Documentos históricos, temporários, de rollback, baseline antiga ou rodada anterior não devem ser recriados.
- Pendências reais devem permanecer em `docs/PLANO_PROXIMOS_PASSOS.md`.
- Este levantamento registra apenas comportamento implementado em código ou confirmado por commits recentes.

## 2. Painel administrativo `/admin`

A área **Convite por WhatsApp** foi ajustada para funcionar como box expansível/recolhível. O estado inicial é recolhido, mantendo visível a faixa superior azul com ícone, título, subtítulo e controle de expandir/recolher.

A área expandida mantém a seleção de pessoa, o campo de WhatsApp, a mensagem e o envio via WhatsApp. O chip `Código: ...` passou para a área inferior do conteúdo expandido, substituindo o texto explicativo anterior sobre o ID da pessoa.

Em **Ações Rápidas**, o painel passou a manter apenas seis cards:

1. Adicionar Pessoa
2. Dúvidas
3. Histórico
4. Notificações
5. Aparência da home
6. Integridade dos dados

Foram removidos da grade rápida os cards `Ver Pessoas`, `Relacionamentos` e `Solicitações de vínculos`.

## 3. Primeiro acesso e edição posterior do membro

As rotas abaixo passaram a funcionar em dois modos:

- `/meus-dados`
- `/meus-vinculos`
- `/arquivos-historicos`
- `/preferencias`
- `/revisao-dados`

O modo é definido pelo vínculo em `user_person_links.dados_confirmados`:

- `dados_confirmados !== true`: fluxo de primeiro acesso/onboarding.
- `dados_confirmados === true`: modo de edição posterior.

### Primeiro acesso

No onboarding, as páginas continuam ocultando ações do header e navegação mobile inferior. O fluxo segue a sequência de etapas e mantém `MemberOnboardingSteps`.

### Edição posterior

No modo de edição posterior, as mesmas páginas exibem header normal, navegação mobile normal e salvamento local da área editada, sem forçar conclusão de todas as etapas.

A página `/revisao-dados` permanece como etapa de revisão do onboarding. Quando o vínculo já está confirmado, ela deixa de ser etapa obrigatória do fluxo de edição.

## 4. `/meus-dados`

### Foto e atalhos de edição

Em modo de edição posterior, a coluna lateral de `/meus-dados` exibe, abaixo do card de foto do usuário, atalhos para ajustes relacionados:

- `Ajustar Meus Vínculos` → `/meus-vinculos`
- `Ajustar Fatos e Arquivos Históricos` → `/arquivos-historicos`

Esses atalhos não devem aparecer no primeiro acesso.

### Redes sociais

A área de redes sociais passou a usar fluxo por badges no modo não compacto:

1. Exibe inicialmente apenas o dropdown de plataforma.
2. Após escolher uma plataforma, o dropdown é ocultado.
3. Surge o campo com prefixo fixo da rede, input do perfil e botão `+`.
4. Ao preencher e clicar em `+`, o perfil vira uma badge com botão `X`.
5. O dropdown volta a aparecer para nova plataforma opcional.

O fluxo evita badge vazia e impede duplicidade exata de plataforma/perfil. O botão de remoção na etapa de preenchimento não é usado; a remoção ocorre apenas pela badge.

### Status Vivo/Falecido

As opções `Vivo` e `Falecido` receberam largura mínima equivalente para evitar desequilíbrio visual, especialmente no mobile.

### Questionário de perfil

No modo de edição posterior, o usuário pode salvar alterações sem ser obrigado a finalizar todas as etapas do questionário. Em mobile, os botões inferiores do questionário foram compactados para priorizar setas de navegação.

## 5. `/meus-vinculos`

A página passou a diferenciar onboarding e edição posterior.

No modo de edição posterior:

- o header aparece normalmente;
- a página salva alterações sem avançar automaticamente para outra etapa;
- foram adicionados atalhos mobile para `/meus-dados` e `/arquivos-historicos`;
- a seção `Sobre mim` continua permitindo geração/edição da Mini Bio e Curiosidades.

## 6. `/arquivos-historicos`

A página passou a diferenciar onboarding e edição posterior.

No modo de edição posterior:

- o header aparece normalmente;
- o salvamento permanece na própria página;
- foram adicionados atalhos mobile para `/meus-dados` e `/meus-vinculos`.

## 7. `/preferencias`

No onboarding, `/preferencias` continua fazendo parte do fluxo e avança para revisão. Para pessoa falecida, o fluxo de primeiro acesso pula preferências pessoais e segue para revisão.

No modo de edição posterior, a página salva preferências localmente e não conduz o usuário para a revisão final.

## 8. Header, alertas e navegação mobile

O header mobile passou a separar o botão de alertas do menu/avatar do usuário em páginas internas. O dropdown de notificações recebeu configuração de posicionamento para funcionar de forma consistente em páginas como `/meus-favoritos`, `/notificacoes` e demais páginas internas, não apenas em `/mapa-familiar`.

Foi criado suporte global de ajustes mobile por rota para aplicar correções visuais sem afetar desktop.

## 9. `/mapa-familiar` mobile

### Painel superior e botão `Formato`

No menu superior mobile da árvore, o painel aberto por `Formato` recebeu respiro inferior para que a área de fundo fique visualmente mais alta que os botões internos.

### Painel do botão `+`

A classificação de grupos familiares no painel mobile foi corrigida para considerar direção do relacionamento, tipo de vínculo e entidade pet.

Regras atuais:

- pais/mães aparecem como ascendentes da pessoa central;
- filhos aparecem apenas quando a pessoa central é pai/mãe da pessoa relacionada;
- relações `tipo='filho'` são tratadas bidirecionalmente quando necessário para identificar pais;
- pets não entram em `Filhos` e passam para grupo próprio `Pets`;
- os nomes dos botões de grupos foram centralizados/organizados para leitura mobile.

## 10. `/curiosidades`

Foram aplicados ajustes de UX e responsividade na rota `/curiosidades`.

### Navegação superior

- A barra sticky mobile foi ajustada para respeitar o header.
- Setas laterais de navegação foram adicionadas ao lado dos botões de seção.
- Os botões de seta foram ajustados para círculos perfeitos.

### Rota da Família

- A ilustração do mapa foi reposicionada e redimensionada.
- O texto da seção foi corrigido para UTF-8 válido.
- A imagem usa largura ampliada com altura proporcional no mobile e dimensões controladas no desktop.

### Relacionamentos

- Os cards de indicadores de união, média e faixa receberam tratamento visual diferenciado por cor de fundo.
- A lógica de uniões considera casais ativos e evita contar relações encerradas quando aplicável.

### Profissões mais comuns

- Os círculos das profissões foram ajustados para manter altura e largura iguais e maior presença visual.

### Pergunte à IA

- O campo de entrada, área de resposta e botões passaram a respeitar a largura do box pai no mobile.
- O placeholder foi simplificado para `Faça aqui sua pergunta…`.

### Slide de fotos

- Os botões de avançar e voltar foram ajustados para círculos perfeitos.
- O carrossel foi ajustado para exibir menos fotos por página, melhorando legibilidade.

### Mural e quiz

- O mural passou a usar o nome do usuário logado como autor.
- O quiz passou a usar opções mais compactas, priorizando os dois primeiros nomes em respostas longas.

## 11. Pendências reais

As pendências reais de QA visual, produto administrativo e operação devem continuar concentradas em `docs/PLANO_PROXIMOS_PASSOS.md`.

Este levantamento não cria novas pendências fora do plano canônico.
