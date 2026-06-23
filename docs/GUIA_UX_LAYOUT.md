# Guia de UX e layout

> Última revisão: 2026-06-23  
> Escopo: UX consolidada após 6A–7D e ajustes pós-ciclo em `/curiosidades`, `/mapa-familiar`, header, notificações, `/forum` e `/meus-favoritos`.  
> Este arquivo substitui versões antigas com referências a 10 etapas, 300 caracteres, modo memorial acoplado ao tom Nostálgico e painel desktop sem os ajustes de 2026-06-23.

## Princípios

- Interfaces de onboarding devem ser limpas, progressivas e sem ações paralelas no header.
- Títulos principais devem ficar fora de containers quando introduzem uma seção inteira.
- Cards internos devem conter apenas o conteúdo operacional da seção.
- Botões duplicados devem ser removidos.
- Labels devem respeitar gênero quando há sinal disponível.
- Fluxos de IA devem ser claros: tom textual não é o mesmo que estado de pessoa falecida.
- Ajustes desktop não devem degradar mobile.
- Mudanças visuais de mapa devem preservar legibilidade, conectores e seleção por query string.

## Header do onboarding

Nas páginas abaixo, o header exibe apenas ícone, título e subtítulo:

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

Não exibir:

- Favoritos;
- Notificações;
- Voltar para árvore;
- ações customizadas;
- menus secundários de navegação.

## Menu do avatar do usuário

### Rodapé do menu

O menu do avatar deve manter:

- `Dúvidas?` à esquerda, apontando para `/duvidas`;
- `Sair` à direita, mantendo a ação de logout.

### Navegação

- `Curiosidades` deve estar disponível no menu desktop quando aplicável.
- O botão `Dúvidas?` deve usar a mesma linguagem visual dos demais itens textuais do menu.
- Não adicionar ícone ao botão `Dúvidas?` sem nova decisão de produto.

## Dropdown de notificações

### Layout

O dropdown do sino deve ter largura responsiva e não deve cortar os botões do rodapé.

Regras:

- usar largura segura baseada no viewport;
- rodapé em `flex`, com empilhamento em telas menores e lado a lado em desktop;
- botões com `whitespace-normal`, `text-center`, `leading-tight` e largura flexível.

### Rodapé

Botões obrigatórios:

- `Ver todas as notificações`, rota `/notificacoes`;
- `Personalizar preferências`, rota `/ajustar-notificacoes`.

Não alterar a lógica de listar, marcar ou remover notificações em ajustes puramente visuais.

## `/meus-dados`

### Questionário IA

O questionário possui 8 etapas:

1. Qual é o seu estilo?
2. Personalidade.
3. Família e vínculos.
4. Trabalho e trajetória.
5. Lugares e mudanças de cidade.
6. Momentos marcantes.
7. Hobbies e paixões.
8. Marcas pessoais e curiosidades.

### Etapa 1

Título:

```text
Qual é o seu estilo?
```

A etapa pergunta o estilo do texto, não se a pessoa é falecida.

### Tons disponíveis

- Afetivo;
- Simples e direto;
- Divertido;
- Elegante;
- Nostálgico;
- Inspirador;
- Familiar;
- Emocional;
- Leve;
- Formal.

`Nostálgico` é apenas um tom. Ele não deve ativar memorial automaticamente.

### Toggle memorial

Label atual:

```text
Você está escrevendo o perfil de uma pessoa falecida?
```

Se `Sim`:

- a IA usa terceira pessoa;
- verbos no passado;
- tom respeitoso;
- qualquer tom selecionado é adaptado para memorial.

Se `Não`:

- a IA usa primeira pessoa quando for o perfil do próprio usuário;
- verbos no presente quando adequado.

### Última etapa

A última etapa é `Marcas pessoais e curiosidades`.

Não exibir botão `Avançar` nessa etapa, porque o fluxo continua pelo botão principal `Confirmar meus dados`.

### Badges do questionário

As escolhas do questionário são persistidas em `person_profile_questionnaire_answers.selected_badges`.

Uso atual desses dados:

- perfil individual;
- cards e rankings de `/curiosidades`;
- comparação de interesses;
- geração de Mini Bio/Curiosidades com contexto seguro.

## Mini Bio e Curiosidades

### Limite

- 500 caracteres por campo.
- Contadores devem refletir `0/500` até `500/500`.

### Geração esperada

- Aproximadamente 400–450 caracteres por campo.
- Texto deve ser completo, mas não prolixo.
- Não precisa começar com “Sou [Nome]” ou “[Nome] foi”.
- Evitar repetição do nome, pois ele já aparece no perfil.

## `/meus-vinculos`

### Bloco “Sobre mim”

Deve ficar acima do box de textos, não dentro dele.

Layout recomendado:

- ícone à esquerda;
- título em fonte maior;
- subtítulo explicativo abaixo;
- box abaixo contendo Mini Bio/Curiosidades e botão `Regenerar com IA`.

Não exibir botão `Salvar textos`.

Os textos são salvos quando o usuário avança na página.

### Bloco “Familiares de X”

Deve ficar fora do container dos cards de vínculo.

Layout recomendado:

- avatar/ícone à esquerda;
- título em fonte maior;
- subtítulo explicativo;
- grid/resumo de grupos abaixo.

### Grupos de vínculos

Cada grupo mantém apenas o botão superior de adicionar:

- Adicionar pai ou mãe;
- Adicionar filho;
- Adicionar pet;
- Adicionar cônjuge;
- Adicionar irmão.

Quando o grupo está vazio, o box vazio mostra apenas:

- título do estado vazio;
- descrição;
- sem botão inferior duplicado.

## Labels de gênero

Quando houver `genero` ou hint feminino:

- irmã deve aparecer como `Irmã`;
- mãe como `Mãe`;
- falecida/viva devem concordar com gênero.

Evitar labels genéricas como `Irmão(a)` quando a pessoa é identificada como mulher.

## `/arquivos-historicos`

### Nome funcional

Usar **Fatos e Arquivos Históricos**.

### Estados visuais

- Fato sem arquivo: ícone de fato/memória, badge `Fato` ou `Fato sem arquivo`.
- Imagem: thumbnail da imagem, badge `Imagem`.
- PDF: ícone de documento/PDF, badge `PDF`.

Upload é opcional.

## `/revisao-dados`

A revisão deve mostrar fatos e arquivos em uma seção única, diferenciando tipo:

- `Fato sem arquivo`;
- `Imagem`;
- `PDF`.

Pets devem aparecer em grupo próprio.

## Timeline do perfil

Na lateral do perfil:

- registro histórico sem anexo aparece como `Fato`;
- registro histórico com anexo aparece como `Arquivo`;
- fatos com ano entram em ordem cronológica;
- fatos sem ano ficam ao final;
- não exibir URL, storage path ou dados técnicos.

## `/pessoa/:id`

### Perfil individual

- Contato deve aparecer junto ao cabeçalho/área superior quando permitido.
- Para pessoa falecida, contatos pessoais não devem ser destacados.
- Redes sociais versionadas devem ter prioridade sobre campos legacy.
- Badges do questionário devem aparecer no card `Sobre`, agrupados por categoria.

## `/curiosidades`

### Cards principais

Cards atuais:

- `Pessoas`: familiares humanos cadastrados no site;
- `Localização`: cidades onde vivem;
- `In memoriam`: familiares falecidos na árvore genealógica;
- `Pets`: pets registrados;
- `Casais`: relações de união ativas.

### Rankings e listas

- `Nomes mais comuns`: ranking de primeiros nomes.
- `Mês com mais aniversários`: top 5 meses por quantidade de aniversários.
- `Perfil dos familiares`: ranking por badges/estilo do questionário de `/meus-dados`.
- `Principais cidades de nascimento`: ranking de cidades.
- `Profissões mais comuns`: principais ocupações dos perfis.
- `Faixa Etária`: distribuição por idade, não gerações sociológicas.
- `Bodas`: considera fim por falecimento quando aplicável.

### Interações

- Dropdowns de comparar interesses, astrologia e conexão devem iniciar com estado neutro, exibindo `Selecione`.
- Quiz deve usar opções coerentes e aleatórias controladas:
  - pessoa viva com mais tempo de vida;
  - pessoa mais jovem;
  - pessoa nascida em cidade específica;
  - profissão cadastrada.

## `/mapa-familiar`

### Painel desktop

- Dropdown fechado: `Família de X`.
- Dropdown aberto: primeira opção desabilitada `Visualize a árvore como...`.
- Opções: primeiro e segundo nome da pessoa, por exemplo `Maria Acileide`, não `Família de Maria`.
- Card `Cadastrados`: número baseado em `user_person_links`.
- Cards `Núcleo`, `Ascendentes` e `Colaterais`: gap reduzido e tipografia compacta no desktop.
- Botão de cônjuges:
  - inativo: `Exibir cônjuges de tios, primos etc`;
  - ativo: `Ocultar cônjuges de tios, primos etc`.

### Tour

- IA/Calendário em etapa específica.
- Favoritos em etapa separada: `Guarde os seus destaques`.

### Layout compacto

Árvores pequenas e simples podem usar layout compacto no desktop.

### Canvas desktop

A distribuição direta deve preservar:

- irmãos em até 2 colunas no desktop;
- irmãos em 1 coluna no mobile;
- cônjuge e pets deslocados para a direita no desktop quando necessário;
- mobile sem alteração por ajustes de desktop.

## `/forum`

### Busca desktop

- A barra de busca/filtros deve ocupar a largura do container.
- O botão `Criar novo` deve alinhar com a lateral direita do container de `Tópicos recentes`.
- Não aplicar alterações que quebrem o empilhamento mobile.

## `/meus-favoritos`

### Busca desktop

- A barra de busca/filtros deve ocupar a largura dos cards.
- O botão de filtros deve alinhar com o terceiro card no desktop.
- Não aplicar alterações que quebrem mobile.

## Não regressões de UX

- Não voltar o questionário para 10 etapas.
- Não voltar limite para 300 caracteres.
- Não reintroduzir botão `Salvar textos` em `/meus-vinculos`.
- Não duplicar botões de adicionar em estados vazios.
- Não colocar títulos principais dentro dos containers operacionais.
- Não usar `Nostálgico` como sinônimo de pessoa falecida.
- Não exibir ações no header do onboarding.
- Não listar opções do dropdown de visualização como `Família de Maria`; usar primeiro e segundo nome.
- Não deixar o botão inferior do dropdown de notificações cortado.
- Não misturar Faixa Etária com gerações sociológicas em `/curiosidades`.
- Não contabilizar bodas após falecimento de um dos cônjuges.
