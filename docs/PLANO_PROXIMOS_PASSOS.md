# Plano de próximos passos

> Última revisão: 2026-06-25
> Escopo: pendências reais após auditoria documental da branch `main`.
> Status: canônico.

## Pendências operacionais pós-merge

- Conferir deploy gerado a partir da `main`.
- Validar manualmente `/mapa-familiar`, `/mapa-familiar-horizontal`, `/curiosidades`, `/forum`, `/meus-favoritos`, `/notificacoes` e `/pessoa/:id` no ambiente publicado.
- Confirmar que o ambiente remoto do Supabase recebeu as migrations necessárias.
- Confirmar que `OPENAI_API_KEY` e demais variáveis de ambiente estão disponíveis quando exigidas.

## Pendências de produto e QA visual

- Validar em navegador real o overlay de exportação de imagem, PDF e impressão em `/mapa-familiar` e `/mapa-familiar-horizontal`, especialmente duração do feedback visual até o diálogo do sistema.
- Avaliar evolução futura da exportação para abrir preview intermediário de PNG/PDF em nova aba antes do download, caso o overlay atual ainda gere percepção de travamento em navegadores específicos.
- Validar visualmente `/curiosidades` após deploy, incluindo sticky da barra superior, textos acentuados da seção `Rota da família` e ilustração `mapa.png` em 575 x 327 px no desktop.
- Revisar eventual texto com caracteres corrompidos fora de `docs/`, especialmente em componentes de mapa/exportação, se for detectado em QA visual ou validação de código.

## Pendências de produto administrativo

- Planejar a reutilização administrativa dos fluxos `/meus-dados`, `/meus-vinculos` e `/arquivos-historicos` em `/admin/pessoas/:id/editar`, com abas e modo admin sem quebrar os fluxos de usuário.
- Planejar aba de administração de vínculos de usuários em `/admin/relacionamentos`, separando permissões de edição/legado das relações familiares.
- Planejar aba de grupos, preferências e destinatários em `/admin/notificacoes`, respeitando preferências individuais existentes.
- Planejar nova página admin para geração, visibilidade de páginas, fatos do nascimento e astrologia, após definição do modelo de dados e políticas RLS.

## Pendências técnicas permanentes

- Confirmar políticas RLS para pessoas, relacionamentos, vínculos, fatos históricos, notificações, favoritos e fórum.
- Criar documentação administrativa mais detalhada apenas quando as novas rotas/abas administrativas forem implementadas no código.

## Regra de manutenção

- Não recriar documentos datados, temporários, de baseline, rollback ou QA paralelo.
- Não recriar arquivos removidos na limpeza documental final.
- Atualizar `docs/README.md` e `docs/INVENTARIO_TECNICO.md` apenas quando houver criação, remoção, renomeação de documento canônico ou mudança de rota/área.
