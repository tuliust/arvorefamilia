# Funcionalidades complementares

> Última revisão: 2026-07-01
> Escopo: calendário, dúvidas, fórum, favoritos, notificações, onboarding, exportação, busca global, timeline, perfil, aprovações e cadastros administrativos de pessoas.
> Status: canônico complementar.

## Objetivo

Concentrar em um único documento funcionalidades reais que não precisam mais de documentação isolada nesta fase final do projeto.

Este documento absorve o conteúdo útil dos antigos documentos individuais:

- `CALENDARIO_FAMILIAR.md`;
- `DUVIDAS.md`;
- `FORUM.md`;
- `FAVORITOS.md`;
- `NOTIFICACOES.md`;
- `ONBOARDING_MEMBRO.md`;
- `EXPORTACAO_ARVORE.md`;
- `TIMELINE.md`;
- `PESSOAS_PERFIL_ADMIN.md`.

## Busca global do header

A busca global está disponível nos headers das páginas de mapa e nas páginas internas que usam `MemberPageHeader`.

Regras:

- a busca deve sugerir pessoas e páginas enquanto o usuário digita;
- sugestões de pessoas devem navegar para `/pessoa/:id`;
- sugestões de páginas devem navegar para a rota correspondente;
- o botão `Ver todos os resultados` deve enviar para `/busca?q=...`;
- páginas internas como `/curiosidades`, `/forum` e `/calendario-familiar` devem usar o mesmo componente compartilhado de busca do header;
- no mobile, o dropdown de sugestões deve aparecer acima de headers, toolbars sticky, painéis da árvore, menus e conteúdo da página.

## Menu do avatar

O menu do avatar fica disponível no header das páginas internas autenticadas.

Regras:

- o topo do menu deve exibir foto/avatar e primeiro e segundo nome do usuário quando houver nome disponível;
- abaixo do nome deve aparecer subtítulo `Editar perfil` com ícone;
- a ação de edição de perfil fica no bloco superior do menu, não como botão duplicado na lista de atalhos;
- o botão `Dúvidas?` no rodapé do menu deve ter borda cinza;
- o menu deve ficar em camada superior a barras sticky, botões superiores, botão flutuante `?` e demais controles da página;
- quando o usuário for responsável por outros perfis, o menu deve exibir a área `Perfis gerenciados` com subtítulo `Familiares vinculados à sua conta`;
- o seletor de perfis gerenciados deve listar nomes curtos, preferencialmente primeiro e segundo nome, sem sufixo visual `— memorial`;
- ao selecionar perfil administrado, a navegação deve usar a perspectiva do perfil selecionado;
- se o perfil administrado for de pessoa falecida, ações de criação social como fórum/mural devem respeitar as restrições do modo memorial.
## Notificações no header

O botão de notificações/alertas no header deve abrir dropdown de notificações recentes quando a experiência da página usar header autenticado.

Regras:

- no mobile, o dropdown deve aparecer na camada mais alta da página, acima de toolbar, canvas, painéis, busca e conteúdo;
- o rodapé do dropdown usa ações curtas com largura equivalente: `Ver todas` e `Preferências`;
- estado vazio deve permanecer legível, sem cortar botões;
- abrir o dropdown não deve deslocar indevidamente o layout da página.

## Calendário familiar

Rota principal: `/calendario-familiar`.

Função:

- exibir datas familiares relevantes;
- destacar aniversários, eventos e marcos;
- funcionar como consulta complementar aos dados da árvore.

Regras atuais:

- eventos de casamento no calendário devem omitir o prefixo `Data de casamento de` quando exibidos como título;
- nomes de casamentos devem usar primeiro e segundo nome de cada pessoa quando possível;
- memórias devem usar nome curto, com primeiro e segundo nome da pessoa;
- abaixo de `Aniversariantes`, deve haver card `Casamentos` quando existirem casamentos filtrados no mês.

Não regressão mínima:

- mês atual renderiza;
- eventos aparecem sem quebrar layout;
- datas sem evento não geram estado inválido;
- card de aniversariantes e card de casamentos permanecem legíveis.

## Dúvidas

Função:

- oferecer conteúdo de ajuda ao usuário;
- centralizar perguntas frequentes;
- reduzir dependência de suporte manual.

A página pública `/duvidas` não deve exibir o parágrafo legado sobre integração com Google Agenda quando essa integração não estiver implementada no produto.

Quando houver gestão administrativa de dúvidas, conferir também a área `/admin/duvidas`.

## Fórum

Rotas principais:

- `/forum`;
- `/forum/novo`;
- `/forum/topico/:id`;
- `/forum/topico/:id/editar`.

Função:

- listar tópicos;
- criar tópicos;
- abrir tópico individual;
- editar quando permitido;
- preservar integração com favoritos quando existir.

Regras implementadas:

- `/forum/novo` não deve duplicar título interno de container quando o header já contextualiza a criação;
- categorias de novo tópico podem usar títulos quebrados em duas linhas para preservar legibilidade;
- ao digitar `@` no conteúdo de novo tópico, o menu de pessoas deve aparecer de forma compacta próximo ao cursor, com filtro por letras digitadas e scroll vertical;
- menções já digitadas no campo de conteúdo podem receber destaque visual em azul e negrito sem alterar o valor real do texto;
- `/forum/topico/:id` deve usar largura compatível com o container de `/forum`, não um card estreito isolado;
- no desktop, `/forum/topico/:id` pode exibir coluna lateral de `Tópicos recentes`, excluindo o tópico atual;
- reações devem ficar disponíveis apenas para o tópico principal, não para respostas;
- tópicos e respostas editados devem exibir badge `Editado` quando `updated_at` indicar alteração posterior à criação;
- no campo de resposta do tópico, avatar e input devem permanecer lado a lado e alinhados.

Não regressão mínima:

- lista carrega;
- tópico abre por ID;
- novo tópico respeita autenticação;
- edição respeita permissões;
- menções com `@` não quebram digitação nem layout;
- reações das respostas não reaparecem em `/forum/topico/:id`;
- coluna de tópicos recentes não quebra a leitura do tópico principal no desktop nem cria overflow no mobile.

## Favoritos

Rota principal: `/meus-favoritos`.

Função:

- reunir itens marcados pelo usuário;
- permitir retorno rápido a pessoas, tópicos ou conteúdos favoritos quando suportado.

Não regressão mínima:

- estado vazio renderiza;
- favorito adicionado aparece;
- remoção atualiza a lista.

## Notificações

Rotas principais:

- `/notificacoes`;
- `/ajustar-notificacoes`.

Função:

- listar notificações do usuário;
- abrir um dropdown de notificações recentes a partir do header desktop das páginas de mapa e membro;
- permitir ajuste de preferências quando disponível;
- apoiar fluxos de vínculo, fórum ou administração.

Não regressão mínima:

- lista carrega;
- estado vazio renderiza;
- botão desktop de header abre o dropdown sem redirecionar imediatamente para `/notificacoes`;
- ações do rodapé do dropdown permanecem em uma linha e com largura equivalente;
- ajuste de preferência não quebra navegação.

## Perfil de pessoa

Rotas principais:

- `/pessoa/:id`;
- `/pessoas/:id`.

Regras:

- o perfil deve respeitar privacidade e permissões de exibição;
- o botão duplicado `Voltar para a árvore` não deve aparecer ao lado do avatar quando o header já fornece navegação;
- o card `Administração do perfil` não deve aparecer em `/pessoa/:id`;
- o card `Irmãos` deve ficar oculto quando não houver irmãos cadastrados;
- `Discussões relacionadas` deve aparecer abaixo da linha do tempo;
- o botão superior `Criar discussão sobre esta pessoa` não deve aparecer quando houver CTA interno no estado vazio;
- badges derivadas do questionário de perfil podem ser ocultadas quando o contrato visual pedir uma página mais limpa;
- `Seu parentesco com ele` não deve aparecer quando a página estiver sendo vista pelo próprio usuário;
- no mobile, o conteúdo final deve ter respiro inferior para não ficar atrás da navegação inferior.

## Onboarding de membro

Função:

- orientar usuário recém-vinculado;
- explicar próximos passos;
- reduzir fricção inicial de navegação.

O onboarding deve respeitar sessão, perfil e vínculo familiar disponível.

Fluxo funcional:

- `/meus-dados` revisa dados pessoais, privacidade, avatar e questionário `Sobre Mim`;
- `/meus-vinculos` revisa pais, cônjuges, filhos, pets e irmãos;
- `/arquivos-historicos` permite registrar fatos e arquivos antes da entrada na árvore;
- `/preferencias` é exibida para pessoa viva e pulada quando a pessoa está marcada como falecida;
- `/revisao-dados` consolida o que será mantido, atualizado ou enviado para aprovação antes de seguir para `/mapa-familiar`.

Regras complementares:

- o questionário `Sobre Mim` deve preservar a posição de leitura ao trocar etapas, voltando ao topo da própria seção;
- a última etapa do questionário usa `Finalizar` como CTA principal e não deve exibir `Pular Tudo`;
- pets são tratados como grupo próprio, cadastrados por modal e refletidos na área `Pets`;
- tutores adicionais de pet devem ser restritos a cônjuges cadastrados;
- fatos e arquivos históricos podem ocultar o seletor de participantes até o usuário clicar em `Adicionar outras pessoas`;
- a revisão final deve exibir pets pendentes e manter o CTA final no fim da página mobile.

## Exportação da árvore

Função:

- permitir que o usuário gere artefato visual da árvore sem alterar dados;
- preservar a visualização atual da pessoa de referência;
- evitar que elementos auxiliares da interface apareçam em arquivos ou impressão;
- tratar erros por `toast` e nunca por diálogo nativo do navegador.

Fluxo atual do painel desktop:

- a seção `Exportar` exibe apenas dois botões: `Salvar Imagem` e `Imprimir`;
- `Salvar Imagem` corresponde à ação interna `select-area`;
- `Imagem` e `PDF` não ficam mais expostos como botões diretos do painel;
- os dois botões devem ficar em uma linha com duas colunas, com visual compacto e sem extrapolar o painel;
- o mesmo contrato de ações deve ser preservado no painel compacto/flyout quando aplicável.

### Salvar Imagem

O fluxo de `Salvar Imagem` é guiado por modal próprio antes de iniciar a captura real da tela.

Regras:

- clicar em `Salvar Imagem` abre o modal `Salvar área da árvore`;
- o modal deve explicar três etapas: permitir acesso à guia, selecionar a área desejada e salvar o arquivo;
- o botão `Continuar` fecha o modal e inicia a captura;
- a captura usa `navigator.mediaDevices.getDisplayMedia`;
- a permissão deve orientar o usuário a selecionar `Esta aba` ou `Aba atual`;
- capturas de `Janela`, `Tela inteira`, `monitor` ou superfícies equivalentes podem deslocar o recorte e devem ser bloqueadas ou tratadas com erro claro;
- a seleção da área usa overlay próprio com ponteiro/arraste;
- a seleção mínima deve impedir recortes acidentais muito pequenos;
- o arquivo gerado é PNG;
- quando `showSaveFilePicker` estiver disponível, o navegador pode abrir janela nativa para nome e destino do arquivo;
- quando `showSaveFilePicker` não estiver disponível, o fluxo deve cair para download por link temporário;
- durante a seleção de área, os controles de zoom, o botão de favorito/estrela e o botão flutuante `?`/`/duvidas` devem ficar ocultos;
- o toast instrucional `Na janela do navegador...` não deve aparecer depois do modal, porque o modal é a instrução principal.

### Imprimir

O fluxo de `Imprimir` deve abrir a janela nativa de impressão do navegador.

Regras:

- clicar em `Imprimir` não deve abrir diálogo nativo intermediário próprio da aplicação;
- a impressão usa uma página limpa montada para impressão a partir da árvore capturada internamente;
- a página de impressão deve incluir o título superior da árvore, por exemplo `Árvore Familiar de Tulius`;
- a árvore deve ficar centralizada horizontalmente;
- a árvore deve caber em uma única página usando dimensionamento proporcional;
- o usuário ainda pode escolher `Retrato` ou `Paisagem` na janela do navegador;
- em ambas as orientações, a impressão não deve exibir header, painel lateral, controles de zoom, botão de favorito/estrela, botão flutuante `?` ou overlays;
- `/mapa-familiar` e `/mapa-familiar-horizontal` devem seguir o mesmo contrato visual de impressão.

### Fluxos internos legados

O código ainda pode manter helpers internos de preview, PNG, PDF ou `html2canvas` para compatibilidade técnica, fallback ou usos internos. Esses fluxos não devem ser tratados como ações principais do painel desktop enquanto não estiverem expostos ao usuário.

Não regressão mínima:

- `Exportar` mostra somente `Salvar Imagem` e `Imprimir`;
- botões de exportação não cortam nem saem do painel;
- textos do painel permanecem em UTF-8 válido;
- `Salvar Imagem` abre modal antes da captura;
- o modal aparece com fundo opaco em `/mapa-familiar` e `/mapa-familiar-horizontal`;
- a seleção de área não exibe zoom, favorito ou botão `?`;
- a captura não inclui overlay, modal, toast, toolbar, header, painel lateral ou botão flutuante;
- `Imprimir` abre a janela nativa do navegador;
- impressão contém o título superior e a árvore centralizada;
- impressão cabe em uma página;
- falhas usam `toast` e encerram estados transitórios de preparação/captura;
- `window.alert`, `alert`, `window.confirm`, `confirm`, `window.prompt` e `prompt` não devem ser reintroduzidos.

## Timeline

Função:

- organizar fatos familiares em ordem temporal;
- usar datas estruturadas quando disponíveis;
- tratar eventos sem data completa sem quebrar a renderização.

## Pessoas e perfil administrativo

A área administrativa de pessoas deve permitir manutenção controlada de cadastros, respeitando validações e evitando inconsistências nos vínculos.

Validações de vínculo conjugal e status inferido estão documentadas em `funcionalidades/STATUS_CONJUGAL.md`.

Regras:

- não duplicar pessoas sem confirmação;
- validar campos essenciais;
- preservar relações existentes;
- refletir mudanças nas telas de membro após atualização.

## Header administrativo

### Admin mobile

No dashboard administrativo mobile:

- os quatro cards superiores devem compartilhar a mesma estrutura visual;
- `Membros` e `Relações` mantêm seus títulos;
- `Solicitações de Aprovação` deve usar label compacto `Solicitações`;
- `Responsáveis por Usuários` deve usar label compacto `Responsáveis`;
- ícones, título, alinhamento e formatação desses cards devem permanecer equivalentes entre si.

Nas rotas `/admin/*`, o header global deve ser reduzido para navegação essencial:

- `Painel Administrativo`, com seta de retorno para `/admin`;
- `Principal`, sem seta, apontando para a experiência principal;
- menu do usuário.

Botões como `Membros`, `Conteúdo` e `Responsáveis` não devem aparecer no header global administrativo. Essas entradas devem ficar em cards, menus ou páginas internas quando forem necessárias.

## Admin dashboard e aprovações

Rotas principais:

- `/admin`;
- `/admin/dashboard`;
- `/aprovacoes`;
- `/admin/aprovacoes`.

Regras:

- os cards superiores do dashboard devem exibir os números principais sem subtítulos redundantes;
- o card `Relações` deve exibir a contagem total de relacionamentos;
- o card `Solicitações de Aprovações` deve levar para a página de aprovações;
- a página de aprovações concentra solicitações de novos usuários, edições de vínculos e demais revisões pendentes quando implementadas;
- o convite por WhatsApp não deve envolver o código final com asteriscos;
- a ação rápida `Conteúdo de Pessoas` deve aparecer como `Textos automáticos`.

## `/admin/home`

A página de configurações públicas deve permitir salvar alterações nas abas depois do carregamento das configurações.

Não regressão mínima:

- botão de salvar visível quando houver alterações aplicáveis;
- toast `Aguarde o carregamento das configurações antes de salvar.` não deve bloquear salvamento depois que os dados carregarem;
- configurações salvas devem persistir após recarregar.

## `/admin/responsaveis`

Rota principal: `/admin/responsaveis`.

Regras:

- `Solicitações de administração` deve aparecer acima de `Perfis legados e crianças`;
- a seção de solicitações deve ficar oculta quando não houver solicitações pendentes;
- `Perfis legados e crianças` deve listar pessoas falecidas e crianças até 10 anos;
- a listagem deve ficar em ordem alfabética, independentemente de já existir responsável;
- deve haver campo de busca e filtro acima do primeiro item;
- pessoas falecidas devem usar ícone de cruz, não caveira;
- cards não devem exibir texto instrucional longo mandando usar formulário externo;
- o seletor inline de responsável deve listar pessoas da tabela `pessoas`, não apenas usuários autenticados;
- vínculos pessoa-a-pessoa de responsáveis devem usar `person_responsible_links`;
- badges devem pluralizar corretamente: `1 responsável`, `2 responsáveis`.

## Administração de dúvidas

Rota principal: `/admin/duvidas`.

Regras atuais:

- a rota usa a versão refinada `AdminDuvidasRefined`;
- slugs técnicos não devem aparecer nos cards de listagem de categorias ou perguntas;
- `Perguntas e respostas` deve ficar como título da seção em linha superior;
- busca, categoria e status devem aparecer na linha de filtros abaixo do título;
- ações de pergunta devem usar apenas ícones, mantendo `title` e `aria-label`;
- pergunta e resposta devem usar a largura horizontal disponível do card.

## Histórico administrativo de atividades

Rota principal: `/admin/atividades`.

Regras atuais:

- filtro de ator deve usar label `Autor` e placeholder `Nome`;
- filtro de entidade afetada deve usar label `Usuário`;
- o botão `Limpar` zera apenas a lista local exibida em tela, sem apagar registros do banco;
- após limpar, apenas novas atividades geradas depois daquele momento devem voltar a aparecer para o usuário local;
- o cabeçalho da tabela deve usar `Autor`;
- a coluna de autor deve exibir primeiro e segundo nome quando possível;
- a coluna `Atividade` não deve repetir subtítulo de entidade abaixo do título da ação;
- a coluna `Resumo` deve usar o resumo legível como texto principal e corrigir termos sem acento quando conhecidos, como `mae` para `mãe`.

## Gestão de conteúdo de pessoas

Rota principal: `/admin/gestao-conteudo-pessoas`.

A página de gestão de conteúdo de pessoas deve lidar de forma defensiva com a ausência da tabela `person_visibility_settings` no ambiente remoto, usando defaults locais para evitar quebra de carregamento. A criação ou aplicação da tabela no Supabase permanece pendência operacional quando o ambiente ainda não tiver a migration correspondente.

Todos os textos visíveis da página devem preservar acentuação correta em UTF-8, incluindo `Gestão`, `Conteúdo`, `Geração`, `páginas`, `Árvore`, `históricos`, `Calendário`, `Fórum`, `sensíveis`, `automáticos`, `Título` e `básica`.

## Admin notificações e relacionamentos

Rotas principais:

- `/admin/notificacoes`;
- `/admin/relacionamentos`.

Regras de notificações:

- todas as abas de `/admin/notificacoes` devem exibir canais, tipos, status, disponibilidade, frequência e categorias em linguagem humana;
- não exibir slugs crus como texto principal de leitura;
- títulos, labels e badges devem iniciar com maiúscula quando aplicável;
- cards principais da visão geral devem priorizar legibilidade dos números e reduzir excesso visual nos títulos.

Regras de relacionamentos:

- os cards `Total de Relacionamentos`, `Casamentos` e `Filiações` funcionam como filtros da listagem;
- a busca abaixo dos cards deve aceitar nomes de pessoas e exibir sugestões conforme caracteres digitados;
- cards de casamento devem exibir `Casamento`, não `Tipo: casamento`;
- cards de filiação devem exibir `Pai`, `Mãe` ou `Filho` com capitalização correta;
- classificações legadas `sangue` e `adotivo` não devem aparecer na interface de listagem nem em aprovações, embora o campo técnico possa continuar existindo para compatibilidade futura.

## Regra de manutenção

Novas funcionalidades pequenas devem ser adicionadas aqui, salvo quando tiverem contrato técnico extenso. Evitar recriar arquivos individuais para funcionalidades de apoio.
