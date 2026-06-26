# QA manual

> Última revisão: 2026-06-26
> Escopo: validação manual das rotas e contratos documentados.
> Status: canônico.

## Pré-condições

- Ambiente com Supabase configurado.
- Usuário membro autenticado.
- Usuário admin para rotas administrativas.
- Dados mínimos de pessoas, relacionamentos, vínculos, fatos históricos, fotos, profissões e notificações.

## Validação técnica local

Executar antes de merge:

```bash
git status --short
git diff --check
grep -R $'\xC3\|\xC2\|\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
```

Confirmar que as alterações documentais ficaram restritas aos documentos canônicos necessários.

## Rotas de árvore

### `/mapa-familiar`

- Abre a partir de `/`.
- Carrega pessoas e relacionamentos.
- Exibe pessoa de referência quando houver vínculo ou query `pessoa`.
- O seletor de visualização não deve exibir mojibake em `Família de X` ou `Sua view padrão`.
- O cabeçalho do painel desktop deve exibir ícone de olho sem borda e botão de recolher alinhado dentro do container na linha do título.
- Permite alternar filtros de parentes diretos.
- Permite alternar vivos, falecidos e pets.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem manter labels e contadores em uma linha, sem reticências.
- A paleta laranja deve ser visualmente diferente da branca, com aparência quente/terracota e linhas quentes.
- Abre perfil em `/pessoa/:id`.
- Mantém painel desktop sem cortar exportação.
- Ao acionar `Imagem`, `PDF` ou `Imprimir`, deve exibir loading global de exportação e mantê-lo até o diálogo do sistema assumir o fluxo ou até fallback.
- Quando o fluxo abrir janela/aba dedicada para salvar ou imprimir, a página principal deve permanecer aberta e preservada.
- O overlay de exportação não deve aparecer no arquivo exportado.
- Mobile não deve abrir painéis persistentes por padrão.

### `/mapa-familiar-horizontal`

- Preserva query `pessoa` ao alternar visualização.
- Renderiza linha geracional horizontal.
- Mantém filtros aplicáveis e contadores coerentes.
- Replica no painel desktop os critérios visuais de seletor, cabeçalho, grupos, paleta laranja e exportação validados em `/mapa-familiar`.
- Ao acionar `Imagem`, `PDF` ou `Imprimir`, deve exibir o mesmo feedback global de preparação da exportação.

## Onboarding de membro

### `/meus-dados`

- Salva dados básicos.
- Respeita preferências de privacidade.
- Gera ou mantém insumos de Mini Bio/Curiosidades.
- Modo memorial depende de toggle explícito.
- Redes sociais devem permitir digitação de perfil completo antes de converter o item em badge/lista finalizada.
- Salvar e recarregar deve preservar o perfil completo da rede social, não apenas a primeira letra.

### `/meus-vinculos`

- Diferencia pessoas humanas e pets.
- Exibe badges de cadastrado/pré-cadastrado conforme vínculos reais.
- Não grava vínculo definitivo quando a regra exigir solicitação.
- Mantém textos de perfil fora do box de edição de vínculos.

### `/arquivos-historicos`

- Permite fato sem arquivo.
- Permite upload de imagem ou PDF.
- Relaciona fato/arquivo à pessoa ou relacionamento conforme fluxo.
- Registros devem aparecer na timeline do perfil quando implementado pelo serviço.

### `/preferencias`

- Deve ser acessível para pessoa viva.
- Deve ser pulada para pessoa marcada como falecida no fluxo de onboarding.

### `/revisao-dados`

- Resume informações antes de concluir.
- Não deve prometer alteração direta quando há solicitação pendente.

## Funcionalidades autônomas

### Busca global do header

Validar em desktop e mobile quando aplicável:

- `/mapa-familiar` e `/mapa-familiar-horizontal` exibem sugestões de pessoas e páginas enquanto o usuário digita.
- Páginas internas com `MemberPageHeader`, como `/curiosidades`, `/forum`, `/calendario-familiar`, `/meus-favoritos` e `/notificacoes`, exibem o mesmo comportamento de sugestões.
- Clicar em uma pessoa sugerida navega para `/pessoa/:id`.
- Clicar em uma página sugerida navega para a rota correspondente.
- `Ver todos os resultados` navega para `/busca?q=...`.
- Fechar a busca ou pressionar `Escape` não deixa dropdown preso acima do conteúdo.

### `/curiosidades`

Validar desktop e mobile:

- A rota carrega pessoas, relacionamentos e badges sem bloquear a página quando a RPC de badges não estiver disponível.
- A barra superior de atalhos fica sticky quando alcança o topo da página.
- A barra superior contém apenas atalhos existentes: Hoje, IA, Fotos, Quiz, Mural, Você Sabia, Gráficos, Gerações, Relacionamentos, Rotas e Conexões.
- No mobile, os botões laterais da barra de atalhos aparecem ao lado da lista e permitem avançar/voltar sem sobrepor os cards.
- Os cards numéricos antigos de Pessoas, Localização, In memoriam, Pets e Casais não aparecem na página.
- `Hoje na família` renderiza eventos ou estado vazio sem badge de contador.
- O slide de fotos usa fotos principais de pessoas humanas; no mobile mostra uma foto por vez, com setas circulares sobre a imagem e legenda abaixo.
- `Pergunte à IA` usa placeholder `Faça aqui sua pergunta…`.
- No mobile, `Pergunte à IA` mostra visualmente até três sugestões rápidas, alinhadas à esquerda.
- O envio de pergunta à IA só habilita com contexto carregado e pergunta preenchida.
- `Teste seus conhecimentos` exibe etapa compacta no formato `1/5`, sem ícone de interrogação no cabeçalho.
- O quiz exibe até seis opções quando houver dados suficientes, com nome curto sempre que possível.
- Perguntas do quiz devem variar alternativas quando houver base suficiente e diferenciar homônimos visualmente.
- `Mural da família` não exibe campo de nome nem dropdown de visibilidade.
- `Mural da família` destaca a pergunta `Qual sua lembrança favorita da família?`, publica com usuário logado, limita texto a 200 caracteres e permite exclusão apenas pelo autor.
- A lista do mural deve ter rolagem vertical quando houver mais lembranças do que a área visível comporta.
- `Aniversários por mês` usa meses abreviados e mostra o número acima de cada barra.
- `Profissões mais comuns` exibe círculos sem cortar ícone, número ou título; no mobile aparecem no máximo três profissões.
- `Faixa Etária` não repete labels abaixo das barras e mostra contagens em círculos.
- `Gerações da família` inicia com a primeira geração com pessoas expandida; ao abrir outra geração, a anterior recolhe.
- `Relacionamentos` exibe três métricas: Uniões, Média e Faixa, com Uniões como primeiro card.
- Bodas respeitam casais ativos, sem separação e sem falecidos.
- `Rota da família` exibe título e subtítulo com acentuação correta, distância total, texto `Trajeto de carro`, pins, linha pontilhada, badges de distância e chegada.
- No desktop, a ilustração de `Rota da família` usa `mapa.png` em 575 x 327 px e pode extrapolar visualmente o card sem alterar a estrutura da lista.
- No mobile, a ilustração de `Rota da família` permanece contida e proporcional.
- O card inferior alterna entre Descubra mais sobre, Qual a minha conexão, Comparar interesses e Astrologia da família.
- No mobile, as abas inferiores ficam em uma linha, com ícone acima do título e título interno da aba alinhado à esquerda.
- O seletor de conexão entre duas pessoas não deve gerar erro Radix por item com valor vazio.
- A descoberta sem pessoa selecionada deve manter placeholder `Selecione` e não quebrar.
- `Comparar interesses` deve pluralizar corretamente `1 ponto em comum` e `2 pontos em comum`, usando badges do questionário de perfil quando disponíveis.

### `/forum`

- Lista tópicos.
- Busca/filtros não devem quebrar layout desktop.
- Criar, abrir e editar tópico deve respeitar rotas atuais.

### `/forum/novo`

- O card de criação não deve duplicar o título interno `Novo tópico` quando o header já contextualiza a página.
- Categorias devem manter labels em duas linhas quando necessário para preservar leitura.
- Ao digitar `@`, sugestões de pessoas devem aparecer próximas ao cursor, com lista compacta, scroll vertical e filtro pelas letras digitadas.

### `/forum/topico/:id`

- Tópicos editados exibem badge `Editado`.
- Respostas editadas exibem badge `Editado`.
- O campo de resposta deve manter avatar e textarea lado a lado e alinhados.

### `/meus-favoritos`

- Busca/filtros devem ocupar largura adequada no desktop.
- Lista deve permanecer navegável em mobile.

### `/notificacoes`

- Dropdown e página não devem cortar ações.
- No desktop, o botão `Alertas` dos headers de páginas de membro deve abrir o dropdown em vez de redirecionar diretamente.
- O rodapé do dropdown deve exibir `Ver todas` e `Preferências` com larguras equivalentes e sem quebra de linha.
- Ajustes devem estar acessíveis por `/ajustar-notificacoes`.

### `/pessoa/:id`

- Exibe perfil da pessoa.
- Respeita query `voltar` quando fornecida.
- Não deve expor dados bloqueados por privacidade.

## Área administrativa

- `/admin/login` deve permanecer público.
- Demais rotas `/admin/*` devem exigir `ProtectedRoute`.
- Validar dashboard, pessoas, relacionamentos, importação, diagnóstico, integridade, atividades, notificações, dúvidas e solicitações de vínculos.

### `/admin/duvidas`

- A rota deve carregar a versão refinada da administração de dúvidas.
- Slugs técnicos não devem aparecer nos cards de listagem de categorias ou perguntas.
- `Perguntas e respostas` deve aparecer como título em linha própria.
- Busca, categoria e status devem ficar abaixo do título.
- Botões de editar, publicar/rascunho e arquivar devem ser apenas ícones, mantendo `title` e `aria-label`.
- Pergunta e resposta devem ocupar a largura horizontal disponível do card.

### `/admin/atividades`

- O filtro de ator deve aparecer como `Usuário Autor`.
- O placeholder do filtro de autor deve ser `Nome`.
- O filtro de entidade afetada deve aparecer como `Usuário`.
- O botão `Limpar` deve zerar apenas a lista local em tela, sem apagar registros do banco.
- O cabeçalho da tabela deve usar `Autor`, não `Ator`.
- Colunas de Data, Autor, Atividade e Resumo devem estar alinhadas com as linhas abaixo.
- A coluna Autor deve exibir primeiro e segundo nome quando possível.
- A coluna Atividade não deve repetir subtítulo de entidade abaixo do título da ação.
- A coluna Resumo deve usar o resumo legível como texto principal e corrigir termos conhecidos sem acento, como `mae` para `mãe`.

### `/admin/gestao-conteudo-pessoas`

- A página não deve quebrar se `person_visibility_settings` ainda não existir no schema remoto.
- Quando a tabela estiver ausente, os defaults locais devem permitir carregamento da tela.
- Salvar configurações de visibilidade depende da tabela existente no Supabase.

## Critérios de aceite

- Nenhum documento canônico cita rota inexistente.
- Nenhum documento marca como pendente uma funcionalidade implementada.
- Nenhum documento marca como implementada uma funcionalidade ausente do código.
- `docs/README.md` referencia apenas arquivos existentes.
- `docs/` não contém mojibake.
