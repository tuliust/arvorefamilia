# Guia de componentes

> Última revisão: 2026-06-22  
> Escopo: componentes relevantes após o ciclo 6A–7D.

## `MemberPageHeader`

Componente padrão de header para páginas de membro.

### Contrato atual

- Recebe `title`, `subtitle` e `icon`.
- Pode renderizar ações (`actions`, `customActions`, `mobileCustomActions`).
- Nas páginas de onboarding, as ações devem ser ocultadas.
- O ciclo 7D introduziu/usa configuração para ocultar ações do header nas rotas:
  - `/meus-dados`;
  - `/meus-vinculos`;
  - `/arquivos-historicos`;
  - `/preferencias`;
  - `/revisao-dados`.

### Não regressão

Não reintroduzir botões de navegação/favoritos/notificações nessas páginas sem decisão explícita.

## `MemberOnboardingSteps`

Indicador de progresso do fluxo de onboarding.

### Contrato

- Deve refletir o fluxo real de onboarding.
- Pessoa falecida pula `/preferencias`.
- Não deve ser confundido com as 8 etapas internas do questionário de IA.

## `MeusDados`

Tela de dados pessoais e questionário IA.

### Responsabilidades

- Carregar pessoa vinculada principal ou selecionada.
- Editar campos pessoais.
- Gerenciar avatar/crop.
- Gerenciar redes sociais.
- Persistir questionário IA em `person_profile_questionnaire_answers`.
- Controlar modo memorial pelo toggle.

### Questionário IA

- 8 etapas.
- Etapa 1: “Qual é o seu estilo?”
- Última etapa não exibe botão “Avançar”.
- Não existem mais as etapas “Outras características” e “Perguntas opcionais”.

## `MeusVinculosWithProfileBio`

Wrapper que injeta o bloco de Mini Bio/Curiosidades em `/meus-vinculos`.

### Contrato atual

- Renderiza título/subtítulo “Sobre mim” fora do box.
- Exibe textos editáveis com limite de 500 caracteres.
- Gera/regenera com IA.
- Não exibe botão “Salvar textos”.
- Salva os textos ao avançar o fluxo.

## `MeusVinculos`

Tela de revisão de vínculos.

### Responsabilidades

- Carregar vínculos da pessoa.
- Separar Pets de Filhos.
- Permitir solicitação de novos vínculos.
- Controlar cônjuge ativo.
- Gerenciar rascunho em sessionStorage.
- Gerar payloads para `relationship_change_requests`.

### Não regressão

- Pets nunca devem voltar para Filhos.
- Adições/remoções não devem criar vínculo definitivo direto.
- Cônjuges devem manter no máximo um ativo.

## `RelationshipOverview`

Resumo superior de vínculos.

### Contrato atual

- O título “Familiares de X” e subtítulo ficam fora do container/card principal.
- A área visual deve usar fonte maior e ícone/avatar à esquerda.
- Não deve voltar ao card compacto antigo.

## `RelationshipGroupPanel`

Componente de cada grupo de relacionamento.

### Contrato atual

- Renderiza botão superior de adicionar.
- Estado vazio mostra título e descrição.
- Botão inferior em estado vazio deve permanecer removido no onboarding atual.

## `RelativeCard`

Card de pessoa relacionada.

### Contrato atual

- Exibe avatar ou iniciais.
- Para pet sem foto, pode exibir ícone de pata.
- Badge `Cadastrado` depende de usuário vinculado.
- Label de irmã feminina deve ser `Irmã`, não `Irmão(a)`.

## `ArquivosHistoricos`

Componente de fatos/arquivos históricos.

### Contrato atual

- Upload opcional.
- Registro pode ser fato sem arquivo.
- Registro com arquivo pode ser imagem ou PDF.
- Fato sem arquivo tem thumb/ícone de fato.
- Download/abrir em nova aba só aparece quando há arquivo.

## `RevisaoDados`

Tela final do onboarding.

### Contrato atual

- Exibe dados pessoais, história, contato, privacidade, vínculos, pets e fatos/arquivos.
- Diferencia `Fato sem arquivo`, `Imagem` e `PDF`.
- Header sem ações.

## `PersonTimeline`

Timeline do perfil individual.

### Contrato atual

- `historical_file` com arquivo aparece como `Arquivo`.
- `historical_file` sem arquivo aparece como `Fato`.
- Metadata deve ser sanitizada.
- URLs e storage paths não entram na metadata.

## Componentes do mapa familiar

### `DesktopTreeVisualizationPanel`

- Dropdown usa `Família de X`.
- Card `Cadastrados` usa `user_person_links`.

### `DesktopFamilyMapView`

- Suporta layout compacto para árvore pequena e simples.
- Não deve afetar scripts mobile.

### `FirstLoginTutorial`

- Tour separa IA/Calendário de Favoritos.
- Etapa de Favoritos tem target próprio.
