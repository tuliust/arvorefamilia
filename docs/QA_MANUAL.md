# QA manual

> Última revisão: 2026-07-01
> Escopo: validação manual das rotas e contratos documentados.
> Status: canônico.

## Pré-condições

- Ambiente com Supabase configurado.
- Usuário membro autenticado.
- Usuário admin para rotas administrativas.
- Dados mínimos de pessoas, relacionamentos, vínculos, fatos históricos, fotos, profissões e notificações.
- Para QA mobile, validar preferencialmente em iPhone/Safari real ou device mode equivalente.

## Validação técnica local

Executar antes de merge:

```bash
git status --short
git diff --check
grep -R $'\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
```

No PowerShell, usar alternativa equivalente para buscar o caractere `U+FFFD` nos arquivos Markdown.

Quando houver migration nova, confirmar se o arquivo existe localmente e se foi aplicado no Supabase remoto. Para vínculos de responsáveis pessoa-a-pessoa, validar `supabase/migrations/20260627143000_create_person_responsible_links.sql` e `supabase/migrations/20260627152000_allow_responsible_people_perspective.sql`.

## QA transversal

- Nenhum fluxo sensível deve abrir diálogo nativo do navegador.
- Confirmações devem usar `ConfirmDialog` ou modal controlado.
- Feedbacks devem usar `toast` de `sonner`.
- A varredura técnica de diálogos nativos deve retornar apenas o falso positivo visual `src/app/components/ui/alert.tsx`.
- Ajustes mobile não podem alterar layout desktop.
- Dropdowns de busca, notificações, avatar e painéis devem ficar acima de header, toolbar, cards e canvas.
- Navegação inferior não deve cobrir conteúdo final sem respiro inferior.

## Rotas de árvore

### `/mapa-familiar`

- Abre a partir de `/`.
- Carrega pessoas e relacionamentos.
- Exibe pessoa de referência quando houver vínculo ou query `pessoa`.
- O header mobile deve exibir `Árvore Familiar`.
- Permite alternar filtros de parentes diretos, vivos, falecidos e pets.
- Em perspectiva por `?pessoa=`, cônjuges colaterais devem iniciar ocultos.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` devem manter labels e contadores legíveis.
- O painel deve exibir `Grupos de Familiares` e subtítulo `Clique para exibir/ocultar grupos de parentes na árvore`.
- Abre perfil em `/pessoa/:id`.
- Mantém painel desktop sem cortar exportação.
- A seção `Exportar` deve exibir apenas `Salvar Imagem` e `Imprimir`.
- Os botões `Salvar Imagem` e `Imprimir` devem ficar compactos, em uma linha com duas colunas, sem extrapolar o painel.
- Não deve haver mojibake em textos do painel, como `Visualização`, `Visão por grupos`, `Por gerações`, `Núcleo`, `Avós`, `Bisavós`, `Irmãos` e `Cônjuges`.
- `Salvar Imagem` deve abrir o modal de instruções antes de solicitar permissão de captura.
- O modal deve ter fundo opaco em `/mapa-familiar` e `/mapa-familiar-horizontal`.
- Após `Continuar`, a captura deve ocultar controles de zoom, botão de favorito/estrela e botão flutuante `?`.
- A captura deve orientar o usuário a escolher `Esta aba`/`Aba atual` pela interface do modal, sem toast instrucional redundante.
- O arquivo salvo não deve incluir modal, overlay, toast, controles de zoom, favorito ou botão `?`.
- `Imprimir` deve abrir a janela nativa de impressão.
- A impressão deve incluir o título superior `Árvore Familiar de ...`.
- A impressão deve ocultar header, painel lateral, controles de zoom, botão de favorito/estrela e botão flutuante `?`.
- A árvore deve aparecer centralizada horizontalmente e caber em uma única página em `Retrato` e `Paisagem`.
- Mobile não deve abrir painéis persistentes por padrão.
- O painel aberto pelo botão `+` deve ficar acima de toolbar e canvas.
- O painel mobile deve reconhecer familiares reais da pessoa ativa: pais, cônjuges, irmãos, filhos, pets, avós, bisavós, tataravós, tios, primos e sobrinhos.
- Itens expandidos no painel mobile devem exibir primeiro e segundo nome completos.
- Se não houver conteúdo abaixo da tela central, arrasto vertical para baixo deve ser bloqueado.
- Se não houver primos abaixo de tios, arrasto para baixo a partir de tios deve ser bloqueado.
- Linhas abaixo de tios não devem aparecer quando não houver primos.
- Em `Tios Paternos` e `Tios Maternos`, quando houver mais de 8 cards, devem aparecer inicialmente apenas 8 cards e um botão local `+`.
- O botão local `+` deve revelar os demais cards, alternar para `−` e recolher novamente sem afetar o botão `+` global da toolbar.
- Em `Primos Paternos` e `Primos Maternos`, o scroll vertical deve funcionar com um dedo em iPhone/Safari.
- A navegação de primos para tios deve ocorrer apenas quando a lista estiver no topo e o usuário puxar para baixo.

### QA mobile de navegação 3x3

Validar a direção física do dedo em iPhone/Safari real sempre que possível:

- em `core`, deslizar para o ramo paterno e materno não deve quebrar a estrutura;
- em `core`, deslizar para `descendants` deve respeitar o contrato da rota e bloquear quando não houver área inferior aplicável;
- em `paternal-uncles`, deslizar para esquerda deve levar para `core`;
- em `paternal-uncles`, deslizar para direita deve ficar bloqueado;
- em `paternal-uncles`, deslizar para cima deve levar para `paternal-cousins` quando houver primos;
- em `paternal-uncles`, deslizar para baixo deve ficar bloqueado;
- `paternal-uncles` não deve abrir `paternal-ancestors` nem `maternal-ancestors` por gesto indevido;
- em `paternal-cousins`, gestos laterais e gesto para cima devem ficar bloqueados;
- em `paternal-cousins`, puxar para baixo deve voltar para `paternal-uncles` somente quando a lista estiver no topo;
- em `maternal-uncles`, deslizar para direita deve levar para `core`;
- em `maternal-uncles`, deslizar para esquerda e para baixo devem ficar bloqueados;
- em `maternal-uncles`, deslizar para cima deve levar para `maternal-cousins` quando houver primos;
- em `maternal-cousins`, a tela deve abrir a partir de `maternal-uncles`, permitir scroll interno e não interferir nos guards de tios;
- em `descendants`, o scroll interno deve funcionar quando houver conteúdo rolável;
- em `descendants`, durante scroll interno, a grade 3x3 não deve acompanhar o dedo;
- em `descendants`, no topo do scroll, deslizar para baixo deve voltar para `core`;
- gestos bloqueados não devem causar tremor, bounce elástico perceptível, deslocamento do stage ou tela branca.

### QA mobile do botão `Mapa` e mapa completo

- Tocar no botão `Mapa` deve abrir o modal `Mapa da família` acima do header e da toolbar.
- O modal deve exibir 9 botões de grupos, cada um com ícone único.
- Tocar em grupos deve navegar dentro do mapa e não abrir `/pessoa/:id`.
- Repetir o teste a partir de `Tios Paternos`, `Primos Paternos`, `Tios Maternos`, `Primos Maternos` e `Descendentes`.
- Cada botão da visão geral deve navegar para a tela correta independentemente da tela de origem.
- `Exibir mapa completo` deve abrir camada acima do modal anterior.
- `Reenquadrar` deve reposicionar o palco.
- Pan e zoom por pinça devem funcionar.
- Fechar pelo `X` deve liberar scroll e restaurar o estado anterior.
- Conectores devem ligar bisavós a avós, tios a pai/mãe, pessoa central a pai/mãe, pessoa central a irmãos/cônjuge, irmãos a sobrinhos e tios maternos a primos maternos.
- Rótulos `Pai` e `Mãe` não podem ficar cortados.

### `/mapa-familiar-horizontal`

- Preserva query `pessoa` ao alternar visualização.
- Renderiza linha geracional horizontal.
- Mantém filtros aplicáveis e contadores coerentes.
- Replica no painel desktop os critérios visuais de seletor, cabeçalho, grupos, paleta e exportação.
- A exportação deve seguir o mesmo contrato de `/mapa-familiar`: `Salvar Imagem` com modal/captura de área e `Imprimir` em uma página com título, centralização e sem elementos auxiliares.
- No mobile, `data-family-map-horizontal-mobile-root="true"` deve ser respeitado.
- Scripts de `/mapa-familiar` não devem alterar transformações da rota horizontal.
- O CSS `family-map-horizontal.css` deve continuar aplicado.
- Locks de `descendants` da rota 3x3 não devem afetar a rota horizontal.

### QA desktop de exportação da árvore

Validar em `/mapa-familiar` e `/mapa-familiar-horizontal`:

#### Painel `Exportar`

- Exibir apenas `Salvar Imagem` e `Imprimir`.
- Não exibir botões diretos `Imagem` ou `PDF`.
- Botões devem caber no painel, sem corte inferior.
- Textos devem permanecer em UTF-8 válido.
- O painel compacto/flyout deve preservar as mesmas ações.

#### `Salvar Imagem`

- Clicar em `Salvar Imagem` abre modal de instruções.
- O modal deve exibir as três etapas: permitir guia, selecionar área e salvar arquivo.
- O botão `Cancelar` fecha o modal sem iniciar captura.
- O botão `Continuar` inicia captura real de tela.
- A permissão do navegador deve permitir selecionar a aba atual.
- Captura de janela/tela inteira não deve gerar recorte deslocado.
- Durante a seleção, zoom, favorito e botão `?` devem ficar ocultos.
- Não deve aparecer toast instrucional redundante depois do modal.
- O PNG salvo deve conter apenas a região selecionada.

#### `Imprimir`

- Clicar em `Imprimir` abre a janela nativa do navegador.
- Validar `Retrato` e `Paisagem`.
- O título superior da árvore deve aparecer.
- A árvore deve ficar centralizada horizontalmente.
- A árvore deve caber em uma página.
- Header, painel lateral, controles de zoom, botão de favorito, botão `?` e overlays não podem aparecer.

### `/linha-geracional`

- Header mobile deve exibir `Árvore Familiar`.
- A página deve carregar dados da pessoa ativa sem tela vazia indevida.
- Cabeçalhos `Geração 1`, `Geração 2`, etc. devem ter espaçamento superior suficiente.
- Gerações vazias não devem aparecer como primeira tela quando houver geração seguinte com conteúdo.
- Cards de cônjuges devem ficar empilhados quando o layout mobile exigir.
- Linhas laterais devem conectar apenas relações reais.
- O painel de visualização deve ficar acima do header, exibir apenas um botão `X`, listar familiares reais e preservar a query `pessoa` ao selecionar uma pessoa.
- `/mapa-familiar` não deve carregar runtime específico da linha geracional.

## Onboarding de membro

### `/meus-dados`

- Salva dados básicos e respeita preferências de privacidade.
- Modo memorial depende de toggle explícito.
- Redes sociais devem permitir digitação de perfil completo antes de converter o item em badge/lista finalizada.
- No mobile, a área `Outros ajustes` não deve aparecer.
- No mobile, o botão da foto deve exibir `Adicionar foto`.
- Em 320px, 375px, 390px e 430px, avançar e voltar no questionário `Sobre Mim` deve reposicionar a página no topo da própria seção.
- O reposicionamento do questionário não pode parar no bloco `Contato, endereço e redes`, no meio da seção ou no final do formulário.
- Nas etapas intermediárias, os botões de navegação devem caber no container; `Voltar` e `Avançar` podem aparecer apenas com setas no mobile.
- Na última etapa do questionário, `Pular Tudo` não deve aparecer.
- Na última etapa do questionário, o botão `Finalizar` deve aparecer com largura suficiente para não cortar o texto.
- Após concluir ou pular o questionário, deve aparecer tela final `Seu Perfil` com Mini Bio e Curiosidades editáveis.
- Mini Bio e Curiosidades não devem aparecer em `/meus-vinculos`.

### `/meus-vinculos`

- Diferencia pessoas humanas e pets.
- Exibe badges conforme vínculos reais.
- Não grava vínculo definitivo quando a regra exigir solicitação.
- Cônjuges devem aparecer antes de filhos.
- Pets devem aparecer apenas na área `Pets`; cadastro/edição deve abrir por modal.
- Cadastrar pet pelo modal deve atualizar a área `Pets` sem exigir recarregamento manual.
- Pet adicionado localmente deve aparecer com estado pendente quando depender de aprovação.
- O modal de pet deve permitir foto com zoom/crop e não deve expor botão redundante `Atualizar`.
- Campos de data de pet devem aceitar `DD/MM/AAAA` ou `AAAA`.
- Campos de local/cidade do pet devem seguir `Cidade/UF` quando não forem exterior.
- O dropdown `Outros tutores` de pet deve exibir apenas `Sou o único tutor` e cônjuges cadastrados.
- O dropdown `Outros tutores` de pet não deve listar pais, filhos, irmãos ou parentes genéricos.
- Quando a pessoa em revisão ou o cônjuge for falecido, não deve aparecer checkbox `Relacionamento ativo`.
- Quando a pessoa em revisão ou o cônjuge for falecido, não devem aparecer `Data de separação` nem `Local de separação`.
- Modais de adicionar parentes não devem abrir teclado automaticamente.
- Selecionar filhos, cônjuges, irmãos ou pets não deve travar a página.
- Alterações pendentes devem aparecer como `Em análise`.

### `/arquivos-historicos`, `/preferencias` e `/revisao-dados`

- `/arquivos-historicos` permite fato sem arquivo, upload de imagem/PDF e vínculo com pessoa ou relacionamento.
- Em `/arquivos-historicos`, `Pessoas participantes` deve ficar oculto por padrão.
- Em `/arquivos-historicos`, clicar em `Adicionar outras pessoas` deve revelar o seletor de participantes.
- `/preferencias` deve ser acessível para pessoa viva e pulada para pessoa marcada como falecida.
- `/revisao-dados` resume informações, respeita solicitações pendentes e pode perguntar se o usuário deseja editar perfis sob sua responsabilidade.
- Em `/revisao-dados`, pets pendentes devem aparecer no resumo final, com badge `Em aprovação` ou estado equivalente.
- Em `/revisao-dados` mobile, o card inicial deve exibir o nome completo e não deve exibir `Editar perfil`.
- Em `/revisao-dados` mobile, `Finalizar e acessar árvore` deve ficar no final da página.

## Funcionalidades autônomas

### Busca global do header

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
- A área `Perfis gerenciados` deve aparecer quando houver perfis administráveis.
- As opções do seletor devem usar primeiro e segundo nome quando houver nome disponível.
- O seletor não deve exibir sufixo `— memorial`.
- A troca de visualização por perfil responsável deve preservar navegação do ponto de vista selecionado.
- No desktop, o menu deve ter camada acima do botão flutuante `?` e altura suficiente para ações essenciais.

### `/curiosidades`

- A rota carrega pessoas, relacionamentos e badges sem bloquear a página quando a RPC de badges não estiver disponível.
- A barra superior de atalhos fica sticky quando alcança o topo da página.
- No mobile, os botões superiores devem permanecer visíveis e roláveis lateralmente.
- `Pergunte à IA` usa placeholder `Faça aqui sua pergunta…`.
