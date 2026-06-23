# Guia de componentes

> Última revisão: 2026-06-23  
> Escopo: componentes relevantes após o ciclo 6A–7D e ajustes pós-ciclo em mapa, curiosidades, notificações, fórum e favoritos.

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

## `UserProfileMenu`

Menu do avatar do usuário.

### Contrato atual

- Renderiza navegação de membro.
- Inclui item `Curiosidades` quando aplicável.
- Rodapé do menu deve exibir:
  - `Dúvidas?` à esquerda, rota `/duvidas`;
  - `Sair` à direita, preservando logout.
- `Dúvidas?` não deve ter ícone no estado atual.

## `HeaderNotificationsDropdown`

Dropdown do sino de notificações.

### Contrato atual

- Largura responsiva baseada no viewport.
- Lista notificações recentes.
- Rodapé com:
  - `Ver todas as notificações`;
  - `Personalizar preferências`.
- Rodapé deve usar layout resiliente:
  - empilhado em telas menores;
  - lado a lado em desktop;
  - sem corte horizontal.

### Não regressão

- Não cortar `Ver todas as notificações`.
- Não alterar rotas `/notificacoes` e `/ajustar-notificacoes`.
- Não alterar lógica de marcar/remover notificações em ajustes visuais.

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
- Persistir `selected_badges` para uso em perfil, IA e `/curiosidades`.

### Questionário IA

- 8 etapas.
- Etapa 1: `Qual é o seu estilo?`.
- Última etapa não exibe botão `Avançar`.
- Não existem mais as etapas `Outras características` e `Perguntas opcionais`.

## `MeusVinculosWithProfileBio`

Wrapper que injeta o bloco de Mini Bio/Curiosidades em `/meus-vinculos`.

### Contrato atual

- Renderiza título/subtítulo `Sobre mim` fora do box.
- Exibe textos editáveis com limite de 500 caracteres.
- Gera/regenera com IA.
- Não exibe botão `Salvar textos`.
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

- O título `Familiares de X` e subtítulo ficam fora do container/card principal.
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

## `PersonDataView`

Bloco principal do perfil individual `/pessoa/:id`.

### Contrato atual

- Renderiza dados públicos da pessoa.
- Exibe contato permitido no topo/área superior.
- Para pessoa falecida, não deve destacar telefone/WhatsApp/endereço como ação pessoal.
- Suporta redes sociais versionadas por `pessoa_social_profiles`.
- Mantém fallback para campos legacy de rede social.
- Exibe badges do questionário no card `Sobre`, agrupados por categoria.

## `PersonTimeline`

Timeline do perfil individual.

### Contrato atual

- `historical_file` com arquivo aparece como `Arquivo`.
- `historical_file` sem arquivo aparece como `Fato`.
- Metadata deve ser sanitizada.
- URLs e storage paths não entram na metadata.

## Componentes de `/curiosidades`

### `CuriosidadesStats`

Cards atuais:

- `Pessoas`;
- `Localização`;
- `In memoriam`;
- `Pets`;
- `Casais`.

### `CuriosidadesRankings`

Rankings atuais:

- `Nomes mais comuns`;
- `Mês com mais aniversários`;
- `Perfil dos familiares`;
- `Principais cidades de nascimento`.

### `CuriosidadesCharts`

- `Faixa Etária` deve usar idade/faixas etárias.
- `Profissões mais comuns` deve listar ocupações dos perfis.

### `CuriosidadesCouples`

- Título atual: `Bodas`.
- Cálculo de anos deve parar no falecimento de um dos cônjuges, quando aplicável.

### `CuriosidadesInterestsSection`

- Dropdowns devem iniciar com `Selecione`.
- Comparação deve usar badges/características de `/meus-dados` quando disponíveis.

### `CuriosidadesAstrology`

- Dropdowns devem iniciar com `Selecione`.
- Não deve pré-selecionar automaticamente Absalon ou primeira pessoa da lista.

### `CuriosidadesConnectionSection`

- Dropdowns devem iniciar com `Selecione`.
- A busca de conexão só deve rodar após seleção válida.

### `CuriosidadesQuizSection`

Perguntas/regras atuais:

- pessoa viva com mais tempo de vida;
- pessoa mais jovem;
- pessoa nascida em cidade específica;
- profissão específica com alternativas controladas.

## Componentes do mapa familiar

### `DesktopTreeVisualizationPanel`

Contrato atual:

- Dropdown fechado usa `Família de X`.
- Dropdown aberto inclui opção desabilitada `Visualize a árvore como...`.
- Opções de pessoas usam primeiro e segundo nome, não `Família de X`.
- Card `Cadastrados` usa `user_person_links`.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` usam layout compacto no desktop.
- Botão de cônjuges alterna:
  - `Exibir cônjuges de tios, primos etc`;
  - `Ocultar cônjuges de tios, primos etc`.

### `DesktopFamilyMapView`

- Suporta layout compacto para árvore pequena e simples.
- Não deve afetar scripts mobile.

### `directFamilyDistributedLayout`

Responsável pela distribuição direta da árvore.

Contratos recentes:

- `LOWER_RIGHT_GROUP_SHIFT_X = 180` desloca grupo inferior direito no desktop.
- `lowerRightGroupCenterX` preserva mobile e aplica deslocamento apenas em desktop.
- `siblingGroup.maxPerRow` preserva 1 coluna no mobile e permite 2 no desktop.
- Cônjuge e pets derivam do centro inferior direito.

### `FirstLoginTutorial`

- Tour separa IA/Calendário de Favoritos.
- Etapa de Favoritos tem target próprio.

## Componentes de `/forum`

### `ForumHome`

- Seção de busca/filtros deve ocupar largura total do container no desktop.
- `Criar novo` deve alinhar com a lateral direita do container de tópicos recentes.
- Mobile deve continuar empilhado/sem overflow.

## Componentes de `/meus-favoritos`

### `MeusFavoritos`

- Seção de busca/filtros deve ocupar largura dos cards em desktop.
- Botão de filtros deve alinhar com o terceiro card quando houver grid de 3 colunas.
- Mobile não deve ser alterado por ajustes desktop.
