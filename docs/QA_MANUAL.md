# QA manual

> Última revisão: 2026-06-27  
> Escopo: validação manual das rotas e contratos documentados.  
> Status: canônico.

## Pré-condições

- Ambiente com Supabase configurado.
- Usuário membro autenticado.
- Usuário admin para rotas administrativas.
- Dados mínimos de pessoas, relacionamentos, vínculos, fatos históricos, fotos, profissões e notificações.
- Para QA mobile, validar preferencialmente em viewport real de iPhone/Safari ou device mode equivalente.

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

No PowerShell, quando `grep` não estiver disponível, usar alternativa equivalente:

```powershell
git status --short
git diff --check
Select-String -Path docs\*.md,docs\*\*.md -Pattern ([char]0xFFFD)
npm run typecheck
npm run build
```

Quando houver migration nova, confirmar se o arquivo existe localmente e se foi aplicado no Supabase remoto. Para vínculos de responsáveis pessoa-a-pessoa, confirmar a presença de `supabase/migrations/20260627143000_create_person_responsible_links.sql` quando esse fluxo estiver em validação.

## QA transversal de diálogos próprios

Executar a varredura abaixo antes de concluir frentes que alterem UI, admin, vínculos, notificações, calendário, curiosidades ou perfil:

```powershell
Select-String -Path (Get-ChildItem src -Recurse -File -Include *.ts,*.tsx) `
  -Pattern "\b(?:window\.)?confirm\s*\(|\b(?:window\.)?alert\s*\(|\b(?:window\.)?prompt\s*\(" |
  Select-Object Path, LineNumber, Line
```

Resultado esperado:

```text
src/app/components/ui/alert.tsx  function Alert({
```

Esse resultado é falso positivo conhecido, pois `Alert` é componente visual.

Nenhum fluxo sensível deve abrir `alert`, `confirm` ou `prompt` nativo do navegador.

## QA transversal mobile

Validar em todas as rotas mobile relevantes:

- dropdown de notificações aparece acima de header, toolbar, cards e canvas;
- sugestões de busca aparecem acima de header, toolbar, cards e canvas;
- menu do avatar aparece acima de elementos sticky e não exige scroll vertical para ações essenciais;
- modal do botão `+` em páginas de árvore aparece na camada superior;
- navegação inferior não cobre conteúdo final sem respiro inferior;
- ajustes mobile não alteram layout desktop.

## Rotas de árvore

### `/mapa-familiar`

- Abre a partir de `/`.
- Carrega pessoas e relacionamentos.
- Exibe pessoa de referência quando houver vínculo ou query `pessoa`.
- O header mobile deve exibir `Árvore Familiar`.
- Permite alternar filtros de parentes diretos.
- Permite alternar vivos, falecidos e pets.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem manter labels e contadores legíveis.
- Abre perfil em `/pessoa/:id`.
- Mantém painel desktop sem cortar exportação.
- Ao acionar `Imagem`, `PDF` ou `Imprimir`, deve exibir loading global de exportação e mantê-lo até o diálogo do sistema assumir o fluxo ou até fallback.
- Quando o fluxo abrir janela/aba dedicada para salvar ou imprimir, a página principal deve permanecer aberta e preservada.
- O overlay de exportação não deve aparecer no arquivo exportado.
- Mobile não deve abrir painéis persistentes por padrão.
- O painel aberto pelo botão `+` deve ficar acima de toolbar e canvas.
- O painel mobile deve reconhecer familiares reais da pessoa ativa: pais, cônjuges, irmãos, filhos, pets, avós, bisavós, tataravós, tios, primos e sobrinhos.
- Itens expandidos no painel mobile devem exibir primeiro e segundo nome completos.
- Se não houver conteúdo abaixo da tela central, arrasto vertical para baixo deve ser bloqueado.
- Se não houver primos abaixo de tios, arrasto para baixo a partir de tios deve ser bloqueado.
- Linhas abaixo de tios não devem aparecer quando não houver primos.

### `/mapa-familiar-horizontal`

- Preserva query `pessoa` ao alternar visualização.
- Renderiza linha geracional horizontal.
- Mantém filtros aplicáveis e contadores coerentes.
- Replica no painel desktop os critérios visuais de seletor, cabeçalho, grupos, paleta e exportação validados em `/mapa-familiar`.
- Ao acionar `Imagem`, `PDF` ou `Imprimir`, deve exibir o mesmo feedback global de preparação da exportação.

### `/linha-geracional`

- Header mobile deve exibir `Árvore Familiar`.
- A página deve carregar dados da pessoa ativa sem tela vazia indevida.
- Cabeçalhos `Geração 1`, `Geração 2`, etc. devem ter espaçamento superior suficiente.
- Cabeçalhos devem ter fonte e peso moderados no mobile.
- Gerações vazias não devem aparecer como primeira tela quando houver geração seguinte com conteúdo.
- Cards de cônjuges devem ficar empilhados quando o layout mobile exigir.
- Linhas laterais devem conectar apenas relações reais, não todos os cards.

## Onboarding de membro

### `/meus-dados`

- Salva dados básicos.
- Respeita preferências de privacidade.
- Modo memorial depende de toggle explícito.
- Redes sociais devem permitir digitação de perfil completo antes de converter o item em badge/lista finalizada.
- Salvar e recarregar deve preservar o perfil completo da rede social, não apenas a primeira letra.
- No mobile, a área `Outros ajustes` não deve aparecer.
- No mobile, o botão da foto deve exibir `Adicionar foto`.
- No mobile, o toggle `Vivo/Falecido` deve ficar compacto.
- Questionário `Sobre Mim` deve exibir os ícones dos botões com contraste adequado.
- No mobile, `Voltar`, `Pular Tudo` e `Avançar` devem ficar na mesma linha.
- No mobile, `Voltar` e `Avançar` devem exibir apenas ícones.
- Após concluir ou pular o questionário, deve aparecer tela final `Seu Perfil` com Mini Bio e Curiosidades editáveis.
- Mini Bio e Curiosidades não devem aparecer em `/meus-vinculos`.

### `/meus-vinculos`

- Diferencia pessoas humanas e pets.
- Exibe badges de cadastrado/pré-cadastrado conforme vínculos reais.
- Não grava vínculo definitivo quando a regra exigir solicitação.
- Cônjuges devem aparecer antes de filhos.
- Se a regra de filhos exigir cônjuge, exibir mensagem para cadastrar cônjuge inicialmente.
- O rótulo do outro responsável por filho deve ser `Mãe do filho(a)` quando aplicável.
- Pets devem aparecer apenas na área `Pets`; cadastro/edição deve abrir por modal.
- Modal de pet deve ter campos próprios de pet: nome, nascimento, raça, local, falecimento e foto.
- No mobile, botão de lixeira deve ficar no topo direito do card.
- No mobile, badges de status devem ficar na mesma linha quando houver espaço.
- Modais de adicionar parentes não devem abrir teclado automaticamente.
- Selecionar filhos, cônjuges, irmãos ou pets não deve travar a página.
- Alterações pendentes devem aparecer como `Em análise`.

### `/arquivos-historicos`

- Permite fato sem arquivo.
- Permite upload de imagem ou PDF.
- Relaciona fato/arquivo à pessoa ou relacionamento conforme fluxo.
- Registros devem aparecer na timeline do perfil quando implementado pelo serviço.
- Página deve carregar normalmente no mobile.

### `/preferencias`

- Deve ser acessível para pessoa viva.
- Deve ser pulada para pessoa marcada como falecida no fluxo de onboarding.

### `/revisao-dados`

- Resume informações antes de concluir.
- Não deve prometer alteração direta quando há solicitação pendente.
- Parentes adicionados ou removidos devem aparecer como `Em análise`.
- Ao finalizar, se houver perfis sob responsabilidade do usuário, deve aparecer modal perguntando se deseja editar agora ou depois.
- Sem perfis sob responsabilidade, deve seguir para `/mapa-familiar` sem modal.

## Funcionalidades autônomas

### Busca global do header

Validar em desktop e mobile quando aplicável:

- `/mapa-familiar` e `/mapa-familiar-horizontal` exibem sugestões de pessoas e páginas enquanto o usuário digita.
- Páginas internas com `MemberPageHeader`, como `/curiosidades`, `/forum`, `/calendario-familiar`, `/meus-favoritos` e `/notificacoes`, exibem comportamento equivalente.
- Clicar em uma pessoa sugerida navega para `/pessoa/:id`.
- Clicar em uma página sugerida navega para a rota correspondente.
- `Ver todos os resultados` navega para `/busca?q=...`.
- Fechar a busca ou pressionar `Escape` não deixa dropdown preso acima do conteúdo.

### Menu do avatar

- O topo do menu deve exibir primeiro e segundo nome do usuário.
- Abaixo do nome, deve aparecer subtítulo `Editar perfil` com ícone.
- A lista não deve exibir botão duplicado `Atualizar perfil`.
- O botão `Dúvidas?` deve ter borda cinza.
- A área `Seus responsáveis` deve aparecer quando houver perfis administráveis.
- A troca de visualização por perfil responsável deve preservar navegação do ponto de vista selecionado.

### `/curiosidades`

- A rota carrega pessoas, relacionamentos e badges sem bloquear a página quando a RPC de badges não estiver disponível.
- A barra superior de atalhos fica sticky quando alcança o topo da página.
- No mobile, os botões superiores devem permanecer visíveis e roláveis lateralmente.
- `Pergunte à IA` usa placeholder `Faça aqui sua pergunta…`.
- O envio de pergunta à IA só habilita com contexto carregado e pergunta preenchida.
- O quiz exibe até cinco perguntas por rodada e apresenta resultado final consolidado.
- O seletor de conexão entre duas pessoas não deve gerar erro Radix por item com valor vazio.
- `Comparar interesses` deve pluralizar corretamente `1 ponto em comum` e `2 pontos em comum`.

### `/calendario-familiar`

- Mês atual renderiza.
- Eventos aparecem sem quebrar layout.
- Eventos de casamento exibem nomes curtos e não repetem o prefixo `Data de casamento de` no título visual.
- Memórias exibem primeiro e segundo nome da pessoa quando possível.
- Card `Casamentos` aparece abaixo de `Aniversariantes` quando houver casamentos no mês.
- Datas sem evento não geram estado inválido.

### `/forum`

- Lista tópicos.
- Busca/filtros não devem quebrar layout desktop.
- Criar, abrir e editar tópico deve respeitar rotas atuais.
- Menções com `@` não devem quebrar digitação nem layout.
- Reações devem aparecer apenas no tópico principal, não nas respostas.

### `/meus-favoritos`

- Busca/filtros devem ocupar largura adequada no desktop.
- Lista deve permanecer navegável em mobile.

### `/notificacoes`

- Dropdown e página não devem cortar ações.
- No desktop, o botão `Alertas` dos headers de páginas de membro deve abrir o dropdown em vez de redirecionar diretamente.
- No mobile, o dropdown deve ficar acima da toolbar/canvas/conteúdo.
- O rodapé do dropdown deve exibir `Ver todas` e `Preferências` com larguras equivalentes e sem quebra de linha.
- Ajustes devem estar acessíveis por `/ajustar-notificacoes`.

### `/pessoa/:id`

- Exibe perfil da pessoa.
- Respeita query `voltar` quando fornecida.
- Não deve expor dados bloqueados por privacidade.
- Relacionamento atual deve agrupar vínculos conjugais com status `active`.
- Relacionamentos anteriores devem agrupar vínculos `separated`, `divorced` e `inactive`.
- Uniões históricas devem agrupar vínculos `widowed` e `historical`.
- Card `Administração do perfil` não deve aparecer em `/pessoa/:id`.
- Card `Irmãos` deve ficar oculto quando não houver irmãos.
- `Discussões relacionadas` deve ficar abaixo da linha do tempo.
- Botão superior `Criar discussão sobre esta pessoa` não deve aparecer quando houver CTA interno.
- `Seu parentesco com ele` não deve aparecer para o próprio usuário.
- No mobile, conteúdo inferior não deve ficar encoberto pela navegação inferior.

## Área administrativa

- `/admin/login` deve permanecer público.
- Demais rotas `/admin/*` e `/aprovacoes` devem exigir `ProtectedRoute`.
- Validar dashboard, aprovações, pessoas, relacionamentos, importação, diagnóstico, integridade, atividades, notificações, dúvidas e solicitações de vínculos.
- O header das páginas `/admin/*` deve exibir `Painel Administrativo`, `Principal` sem seta e menu do usuário; não deve exibir `Membros`, `Conteúdo` nem `Responsáveis`.

### `/admin`

- Cards superiores devem exibir contagens principais.
- Card `Relações` deve exibir a contagem de relacionamentos.
- Card `Relações` pode manter o subtítulo com casamentos quando couber.
- Card `Solicitações de Aprovações` deve redirecionar para `/aprovacoes` ou `/admin/aprovacoes`.
- Convite por WhatsApp não deve envolver o código final com asteriscos.
- Ação rápida deve aparecer como `Textos automáticos`.

### `/admin/home`

- Botão de salvar deve existir nas abas quando houver alterações aplicáveis.
- Toast `Aguarde o carregamento das configurações antes de salvar.` não deve bloquear salvamento depois do carregamento.
- Alterações salvas devem persistir após recarregar.

### `/admin/notificacoes`

- Todas as abas devem exibir canais, tipos, status, disponibilidade, frequência e categorias humanizados, sem slugs crus.
- Títulos, labels e badges devem iniciar com maiúscula quando aplicável.
- Cards principais da primeira aba devem manter valores legíveis sem quebra exagerada em desktop e mobile.

### `/admin/relacionamentos`

- Cards `Total de Relacionamentos`, `Casamentos` e `Filiações` devem funcionar como filtros combináveis com busca por nome.
- Sugestões de nomes devem aparecer durante a digitação e aplicar filtro ao clicar.
- A listagem deve exibir `Casamento`, `Pai`, `Mãe` ou `Filho`, sem `Tipo: casamento`, `filho` minúsculo, `sangue` ou `adotivo`.
- Edição/exclusão de casamento, exclusão de filiação e deduplicação de `conjugesUnicos` devem continuar funcionando.

### `/admin/relacionamentos/novo`

- Tipo `Cônjuge` com subtipo `Casamento`, `União` ou `União estável`, sem separação e com relacionamento ativo, deve inferir `União ativa`.
- Subtipo `Separado` deve desmarcar e desabilitar `Relacionamento ativo`.
- Data de separação preenchida deve desmarcar e desabilitar `Relacionamento ativo`.
- Local de separação sem data e sem subtipo `Separado` deve bloquear envio.
- O formulário deve exibir status inferido antes de salvar.
- Trocar de `Cônjuge` para outro tipo deve limpar campos conjugais.

### `/admin/aprovacoes`

- Solicitações não devem exibir `Subtipo: sangue` nem `Subtipo: adotivo`.
- Aprovar e rejeitar solicitações devem continuar funcionando.

### `/admin/responsaveis`

- A página deve exibir `Solicitações de administração` acima de `Perfis legados e crianças`.
- A seção `Solicitações de administração` deve ficar oculta quando não houver pendências.
- A página não deve exibir as seções antigas `Vínculos de usuários` e `Consulta`.
- `Perfis legados e crianças` deve listar pessoas falecidas e crianças até 10 anos.
- Pessoas falecidas devem usar ícone de cruz, não ícone de caveira.
- Cards não devem exibir descrição longa de pessoa falecida.
- A área do card deve exibir seletor de responsável e botão de vínculo.
- O seletor de responsável deve listar todas as pessoas retornadas de `pessoas`, não apenas usuários autenticados.
- Ao vincular pessoa responsável por outra pessoa, o sistema deve gravar em `person_responsible_links`, não em `user_person_links`.
- O vínculo pessoa-a-pessoa deve preencher `managed_pessoa_id` e `responsible_pessoa_id` corretamente.
- O sistema deve impedir selecionar a própria pessoa como responsável por ela mesma.
- Após salvar, o contador de responsáveis deve ser atualizado e pluralizado corretamente.
- A tela não deve gerar erro de foreign key `user_person_links_user_id_fkey` ao selecionar responsável da tabela `pessoas`.

### `/admin/duvidas`

- A rota deve carregar a versão refinada da administração de dúvidas.
- Slugs técnicos não devem aparecer nos cards de listagem de categorias ou perguntas.
- `Perguntas e respostas` deve aparecer como título em linha própria.
- Busca, categoria e status devem ficar abaixo do título.
- Botões de editar, publicar/rascunho e arquivar devem ser apenas ícones, mantendo `title` e `aria-label`.

### `/admin/atividades`

- O filtro de ator deve aparecer como `Autor`.
- O placeholder do filtro de autor deve ser `Nome`.
- O filtro de entidade afetada deve aparecer como `Usuário`.
- O botão `Limpar` deve zerar apenas a lista local em tela, sem apagar registros do banco.
- A coluna Autor deve exibir primeiro e segundo nome quando possível.

### `/admin/gestao-conteudo-pessoas`

- A página não deve quebrar se `person_visibility_settings` ainda não existir no schema remoto.
- Quando a tabela estiver ausente, os defaults locais devem permitir carregamento da tela.
- Salvar configurações de visibilidade depende da tabela existente no Supabase.
- Títulos, labels, botões e mensagens devem manter acentuação correta em UTF-8.
- Geração de conteúdos automáticos deve exibir erro legível quando Edge Function ou IA falhar.

## Critérios de aceite

- Nenhum documento canônico cita rota inexistente.
- Nenhum documento marca como pendente uma funcionalidade implementada.
- Nenhum documento marca como implementada uma funcionalidade ausente do código.
- `docs/README.md` referencia apenas arquivos existentes.
- `docs/` não contém mojibake.
