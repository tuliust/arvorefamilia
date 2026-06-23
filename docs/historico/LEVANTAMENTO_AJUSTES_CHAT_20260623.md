# Levantamento de ajustes pós-ciclo 7D

> Última revisão: 2026-06-23  
> Escopo: ajustes implementados após a documentação de 2026-06-22.

## Objetivo

Registrar os ajustes implementados depois da última atualização consolidada em `docs/`, cobrindo `/curiosidades`, `/meus-dados`, `/pessoa/:id`, `/mapa-familiar`, notificações, fórum, favoritos e layout do canvas da árvore.

## Commits citados no ciclo

Commits informados durante a execução:

- `bf8f57a` — Ajusta cards e interações de curiosidades familiares.
- `ce80a00` — Ajusta cards e interações de curiosidades familiares.
- `62a6254` — Corrige tipagem dos badges e bodas em curiosidades.
- `0a77e5a` — Expande busca de favoritos no desktop.
- `d9326a0` — Ajusta rodapé do dropdown de notificações.
- `8b6a35c` — Adiciona overrides desktop para painel e buscas.
- `e70f8a7` — Importa overrides desktop pontuais.
- `dbcc09c` — Ajusta seletor de visualização e cônjuges no painel.
- `5b69baf` — Ajusta distribuição de irmãos cônjuge e pets no mapa.
- `3d228fa` — Correção de encoding UTF-8 em layout do mapa.

## `/curiosidades`

### Cards e textos

- `Pessoas`;
- `Localização`;
- `In memoriam`;
- `Pets`;
- `Casais`.

### Rankings

- `Nomes mais comuns`;
- `Mês com mais aniversários` com top 5 meses;
- `Perfil dos familiares` com badges do questionário;
- `Principais cidades de nascimento`.

### Interações

- Dropdowns de comparação, astrologia e conexão iniciam com `Selecione`.
- Quiz atualizado com regras para pessoa viva mais velha, pessoa mais jovem, cidade de nascimento e profissão.
- Bodas interrompem contagem em caso de falecimento de cônjuge.

### Integração

- `/curiosidades` carrega `selected_badges` por pessoa.
- `profileBadgesByPersonId` alimenta rankings e comparações.
- Correção de tipagem para arrays mutáveis.

## `/meus-dados` e questionário IA

- `person_profile_questionnaire_answers` centraliza respostas e badges.
- `selected_badges` alimenta perfil público e `/curiosidades`.
- RPC/fallback permite leitura segura de badges selecionados.
- Modo memorial permanece independente do tom `Nostálgico`.

## `/pessoa/:id`

- Perfil público pode exibir badges agrupados por categoria.
- Redes sociais versionadas são preferidas.
- Dados de contato aparecem no topo quando permitidos e quando a pessoa não é falecida.
- Pessoa falecida não deve exibir contato operacional.

## Reset administrativo de perfil

- Reset limpa dados personalizáveis.
- Remove questionário, redes sociais, eventos, arquivos, favoritos, preferências, vínculos e usuários auth elegíveis.
- Retorna contadores para auditoria operacional.

## Header/menu do avatar

- `Dúvidas?` aparece à esquerda no rodapé.
- `Sair` aparece à direita.
- `Curiosidades` aparece no menu desktop.

## Dropdown de notificações

- Largura responsiva com `min(24rem, calc(100vw - 1rem))`.
- Rodapé passou de grid para flex responsivo.
- Botões inferiores não devem cortar texto.

## `/forum`

- Barra de busca/filtros expandida no desktop.
- Botão `Criar novo` deve alinhar com a lateral direita do container de tópicos recentes.

## `/meus-favoritos`

- Barra de busca/filtros expandida no desktop.
- Botão de filtros deve alinhar com o terceiro card em layout desktop.

## `/mapa-familiar`

### Painel lateral

- Cards `Núcleo`, `Ascendentes` e `Colaterais` compactados.
- Gap, padding e fontes reduzidos.
- Botão de cônjuges alterna entre `Exibir` e `Ocultar`.

### Dropdown de visualização

- Label fechado `Família de X`.
- Opção desabilitada `Visualize a árvore como...`.
- Pessoas listadas por primeiro e segundo nome.

### Canvas

- Irmãos em até 2 colunas no desktop.
- Cônjuge e pets deslocados para a direita.
- Mobile preservado.

## Correções técnicas

- `npm run typecheck` limpo após correções.
- `npm run build` limpo.
- `git diff --check` limpo no ciclo final.
- Encoding UTF-8 restaurado em `directFamilyDistributedLayout.ts`.

## Documentos atualizados neste pacote

- `MAPA_FAMILIAR_VIEW.md`;
- `MEUS_VINCULOS.md`;
- `MINI_BIO_CURIOSIDADES_IA.md`;
- `REVISAO_DADOS.md`;
- `ARVORE_LEGENDAS_CONECTORES_PAINEL.md`;
- `CURIOSIDADES_E_IA.md`.

## QA recomendado pós-documentação

1. Rodar `npm run typecheck`.
2. Rodar `npm run build`.
3. Rodar `git diff --check`.
4. Conferir `/mapa-familiar` desktop e mobile.
5. Conferir `/curiosidades`.
6. Conferir `/pessoa/:id`.
7. Conferir `/forum`.
8. Conferir `/meus-favoritos`.
9. Conferir dropdown de notificações.
10. Conferir `/meus-dados`, `/meus-vinculos` e `/revisao-dados`.
