# Funcionalidades complementares

> Última revisão: 2026-06-26  
> Escopo: calendário, dúvidas, fórum, favoritos, notificações, onboarding, exportação, busca global, timeline e cadastros administrativos de pessoas.  
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
- páginas internas como `/curiosidades`, `/forum` e `/calendario-familiar` devem usar o mesmo componente compartilhado de busca do header.

## Calendário familiar

Rota principal: `/calendario-familiar`.

Função:

- exibir datas familiares relevantes;
- destacar aniversários, eventos e marcos;
- funcionar como consulta complementar aos dados da árvore.

Não regressão mínima:

- mês atual renderiza;
- eventos aparecem sem quebrar layout;
- datas sem evento não geram estado inválido.

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
- tópicos e respostas editados devem exibir badge `Editado` quando `updated_at` indicar alteração posterior à criação;
- no campo de resposta do tópico, avatar e input devem permanecer lado a lado e alinhados.

Não regressão mínima:

- lista carrega;
- tópico abre por ID;
- novo tópico respeita autenticação;
- edição respeita permissões;
- menções com `@` não quebram digitação nem layout.

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

## Onboarding de membro

Função:

- orientar usuário recém-vinculado;
- explicar próximos passos;
- reduzir fricção inicial de navegação.

O onboarding deve respeitar sessão, perfil e vínculo familiar disponível.

## Exportação da árvore

Função:

- permitir geração de artefato visual ou arquivo derivado da árvore quando disponível;
- preservar consistência com a visualização atual;
- não bloquear navegação caso exportação falhe.

Não regressão mínima:

- botão ou fluxo de exportação existe quando aplicável;
- erro é tratado;
- exportação não altera dados;
- fluxos de imagem, PDF e impressão devem preservar feedback visual de preparação e não travar a página em estado permanente.

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

- filtro de ator deve usar label `Usuário Autor` e placeholder `Nome`;
- filtro de entidade afetada deve usar label `Usuário`;
- o botão `Limpar` zera apenas a lista local exibida em tela, sem apagar registros do banco;
- o cabeçalho da tabela deve usar `Autor`;
- a coluna de autor deve exibir primeiro e segundo nome quando possível;
- a coluna `Atividade` não deve repetir subtítulo de entidade abaixo do título da ação;
- a coluna `Resumo` deve usar o resumo legível como texto principal e corrigir termos sem acento quando conhecidos, como `mae` para `mãe`.

## Gestão de conteúdo de pessoas

Rota principal: `/admin/gestao-conteudo-pessoas`.

A página de gestão de conteúdo de pessoas deve lidar de forma defensiva com a ausência da tabela `person_visibility_settings` no ambiente remoto, usando defaults locais para evitar quebra de carregamento. A criação ou aplicação da tabela no Supabase permanece pendência operacional quando o ambiente ainda não tiver a migration correspondente.

## Regra de manutenção

Novas funcionalidades pequenas devem ser adicionadas aqui, salvo quando tiverem contrato técnico extenso. Evitar recriar arquivos individuais para funcionalidades de apoio.
