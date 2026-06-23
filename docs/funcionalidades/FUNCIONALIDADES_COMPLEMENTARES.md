# Funcionalidades complementares

> Última revisão: 2026-06-23  
> Escopo: calendário, dúvidas, fórum, favoritos, notificações, onboarding, exportação, timeline e cadastros administrativos de pessoas.  
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

Quando houver gestão administrativa de dúvidas, conferir também a área `/admin` correspondente.

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

Não regressão mínima:

- lista carrega;
- tópico abre por ID;
- novo tópico respeita autenticação;
- edição respeita permissões.

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
- exportação não altera dados.

## Timeline

Função:

- organizar fatos familiares em ordem temporal;
- usar datas estruturadas quando disponíveis;
- tratar eventos sem data completa sem quebrar a renderização.

## Pessoas e perfil administrativo

A área administrativa de pessoas deve permitir manutenção controlada de cadastros, respeitando validações e evitando inconsistências nos vínculos.

Regras:

- não duplicar pessoas sem confirmação;
- validar campos essenciais;
- preservar relações existentes;
- refletir mudanças nas telas de membro após atualização.

## Regra de manutenção

Novas funcionalidades pequenas devem ser adicionadas aqui, salvo quando tiverem contrato técnico extenso. Evitar recriar arquivos individuais para funcionalidades de apoio.
