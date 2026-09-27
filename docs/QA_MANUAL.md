# QA manual

> Última revisão: 2026-09-27
> Escopo: validação manual das rotas e contratos documentados, incluindo layout compartilhado mobile dos mapas, tutorial inicial, vínculos, notificações administrativas, perspectiva memorial, timeline com PDF, conexões de parentesco, conteúdos automáticos de pessoa e comandos compatíveis com PowerShell.
> Status: canônico.

## Pré-condições

- Ambiente com Supabase configurado.
- Usuário membro autenticado.
- Usuário admin para rotas administrativas.
- Dados mínimos de pessoas, relacionamentos, vínculos, fatos históricos, fotos, profissões e notificações.
- Para QA mobile, validar preferencialmente em iPhone/Safari real ou device mode equivalente.
- Para QA de notificações administrativas, migrations de catálogo/configuração aplicadas no ambiente remoto ou fallback validado.
- Para QA de perfis gerenciados, usuário responsável com ao menos uma pessoa administrada via `person_responsible_links`.
- Para QA de IA de perfil, `OPENAI_API_KEY` configurada ou fallback/erro de IA validado explicitamente.
- Para QA de PDF na timeline, ao menos um registro histórico do tipo PDF com URL acessível pelo navegador.
- Para QA de conteúdos automáticos, pessoa com data de nascimento completa e Supabase Function `generate-person-insights` publicada quando houver mudança nessa função.

## Validação técnica local

### Bash/Git Bash

```bash
git status --short
git diff --check
grep -R --include='*.md' --include='*.txt' --include='*.json' --include='*.sql' $'\xEF\xBF\xBD' docs || true
npm run typecheck
npm run build
npm test
npm run test:e2e
```

### PowerShell

```powershell
git status --short
git diff --check

# Busca o caractere de substituição Unicode U+FFFD apenas em arquivos textuais.
Get-ChildItem -Path .\docs -Recurse -File |
  Where-Object { $_.Extension -in ".md", ".txt", ".json", ".sql" } |
  Select-String -SimpleMatch ([char]0xFFFD)

npm run typecheck
npm run build
npm test
npm run test:e2e
```

## Cobertura automatizada versus manual

O smoke Playwright é obrigatório no CI e cobre rotas públicas, redirects/guards sem sessão, rotas legadas desativadas e 404.

Ele **não substitui** a bateria autenticada/visual abaixo. Cenários que dependem de usuário membro/admin, perfil gerenciado, OAuth Google, IA em produção, upload/download, PDF, gestos mobile ou comparação visual devem ser validados com sessão real.

## QA transversal

- Nenhum fluxo sensível deve abrir diálogo nativo do navegador.
- Confirmações devem usar `ConfirmDialog` ou modal controlado.
- Feedbacks devem usar `toast` de `sonner`.
- Ajustes mobile não podem alterar layout desktop.
- Dropdowns de busca, notificações, avatar e painéis devem ficar acima de header, toolbar, cards e canvas.
- Navegação inferior não deve cobrir conteúdo final sem respiro inferior.
- Scripts defensivos devem permanecer isolados por rota, breakpoint e seletor.
- Não deve haver mojibake em `docs/` nem em textos visíveis de rotas críticas.

## `/mapa-familiar`

- Abre a partir de `/`.
- Carrega pessoas e relacionamentos.
- Exibe pessoa de referência quando houver vínculo ou query `pessoa`.
- O header mobile exibe `Árvore Familiar`.
- Permite alternar filtros de parentes diretos, vivos, falecidos e pets.
- Em perspectiva por `?pessoa=`, cônjuges colaterais iniciam ocultos.
- Cards `Núcleo`, `Ascendentes` e `Colaterais` mantêm labels e contadores legíveis.
- O painel desktop exibe `Grupos de Familiares` e subtítulo correto.
- A seção `Exportar` exibe apenas `Salvar Imagem` e `Imprimir`.
- Não há mojibake em textos de painel.
- `Salvar Imagem` abre modal de instruções antes de solicitar captura.
- `Imprimir` abre janela nativa com título, árvore centralizada e sem elementos auxiliares.

### QA desktop de perspectiva, filtros e grupos

Validar no desktop de `/mapa-familiar`:

- Selecionar Bianca no dropdown `Visualização` e confirmar que a árvore carrega na perspectiva correta.
- Selecionar Charalambos no dropdown `Visualização` e confirmar que a árvore carrega na perspectiva correta.
- Selecionar Leonardo no dropdown `Visualização` e confirmar que a árvore carrega na perspectiva correta.
- Em cada perspectiva por `?pessoa=`, confirmar que `Todos os cônjuges` inicia desativado.
- Confirmar que `Todos os cônjuges` permanece clicável e que ativar/desativar altera a presença de cônjuges colaterais.
- Confirmar que trocar para outra pessoa no dropdown reinicia `Todos os cônjuges` como inativo.
- No caso de Leonardo, confirmar que uma única pessoa cadastrada como parental não aparece duplicada como `Pai` e `Mãe`.
- Em `Primos Paternos` e `Primos Maternos`, testar grupos com 2, 3, 4, 5 e 6 cards quando houver dados disponíveis; grupos com 4 ou 5 cards devem usar largura visual de 2 colunas.
- Confirmar que grupos de tios/primos não exibem espaço vazio lateral excessivo após compactação.
- Em grupos de tios, quando todos os cards couberem sem alterar a altura útil, confirmar que o botão local `+` não aparece e que todos os cards carregam visíveis.

## QA mobile de navegação 3x3

- Em `core`, deslizar para ramos paterno/materno não quebra estrutura.
- Em `core`, deslizar para `descendants` respeita bloqueios quando não houver área inferior.
- Em `paternal-uncles`, esquerda leva para `core`; direita e baixo ficam bloqueados.
- Em `paternal-uncles`, cima leva a `paternal-cousins` quando houver primos.
- Em `paternal-cousins`, puxar para baixo volta a `paternal-uncles` apenas no topo.
- Em `maternal-uncles`, direita leva a `core`; esquerda e baixo ficam bloqueados.
- Em `maternal-uncles`, cima leva a `maternal-cousins` quando houver primos.
- Em `maternal-cousins`, scroll interno funciona e não interfere nos guards.
- Em `descendants`, scroll interno funciona quando houver conteúdo rolável.
- Em `descendants`, a grade 3x3 não acompanha o dedo durante scroll interno.
- Gestos bloqueados não causam tremor, bounce perceptível, deslocamento do stage ou tela branca.

## QA mobile dos botões superiores, backdrop e mapa completo

Validar em 320px, 375px, 390px e 430px.

### Chrome compartilhado

- Em `/mapa-familiar` e `/linha-geracional`, header, toolbar superior e navegação inferior permanecem visualmente montados ao alternar `Formato`.
- Apenas a área central do mapa troca ao alternar entre formatos.
- A URL muda entre `/mapa-familiar` e `/linha-geracional` sem flicker perceptível de header, toolbar ou menu inferior.
- Desktop de `/mapa-familiar-horizontal` não é afetado pelo chrome compartilhado mobile.

### Toolbar mobile

- Header continua exibindo `Árvore Familiar`.
- Toolbar mantém `Formato`, `Cor`, `Filtros`, `Mapa` e `+` abaixo do header.
- Abrir qualquer botão da toolbar não desloca a toolbar para baixo.
- Navegação inferior permanece visível nos painéis parciais.
- Backdrop/blur parcial não cobre header, toolbar, painel ativo, cards, CTA ou navegação inferior.
- Blur parcial termina no topo visual do menu inferior.
- Botões ativos da toolbar usam azul principal do site.

### `Formato`

- Tocar em `Formato` abre cards `Linha Geracional` e `Árvore Familiar` dentro da shell mobile.
- Ícones dos cards aparecem em azul.
- Blur começa abaixo do container completo dos cards.
- Cards não ficam escurecidos, desfocados ou dessaturados.
- Alternar formato preserva header, toolbar e menu inferior.

### `Cor`

- Tocar em `Cor` abre faixa de paletas acima do backdrop.
- Opções de cor permanecem clicáveis e sem blur.

### `Filtros`

- Tocar em `Filtros` abre container de filtros acima do backdrop.
- Blur começa abaixo do painel.
- Área branca do painel não fica cortada.
- Card inativo `Ocultar cards de cônjuges de tios, primos etc` usa leitura cinza equivalente a `Apenas familiares` quando inativo.

### `Mapa` em `/mapa-familiar`

- Tocar em `Mapa` abre painel `Mapa da família` dentro da estrutura mobile.
- Painel exibe 9 botões de grupos com ícone único.
- Fundo branco envolve cards e CTA `Exibir mapa completo`, sem sobra excessiva abaixo do botão.
- Cards e CTA ficam acima do backdrop/blur parcial.
- Círculos e ícones ficam confortáveis em 320px/375px.
- Tocar em grupos navega dentro do mapa e não abre `/pessoa/:id`.
- Repetir a partir de `Tios Paternos`, `Primos Paternos`, `Tios Maternos`, `Primos Maternos` e `Descendentes`.

### `Exibir mapa completo` em `/mapa-familiar`

- Abre camada completa acima do conteúdo.
- Container arredondado inicia logo abaixo da toolbar, sem espaçamento extra.
- Base branca reta acompanha o container até o fim.
- A camada atual não renderiza botão `X` próprio.
- Pan com um dedo move o mapa.
- Zoom por pinça altera escala.
- Após soltar o dedo ou encerrar pinça, zoom e posição não voltam automaticamente.
- Retorno/fechamento pelo fluxo atual não deixa blur, overlay ou tray preso.
- Cards exibem somente dois primeiros termos do nome.
- Datas/status não aparecem ao lado dos nomes.
- `Tios maternos` não deixa espaço vazio excessivo abaixo da última linha.

### `Mapa` e visualização completa em `/linha-geracional`

- Tocar em `Mapa` abre container `Gerações` acima do backdrop.
- Painel exibe cards compactos `GERAÇÃO` numerados de 1 a 6.
- Layout preferencial `3x2`.
- Cada card exibe contador quando disponível.
- Geração ativa tem estado visual evidente em azul.
- Tocar em geração navega para ela e fecha tray.
- Fundo branco envolve grade e `Exibir mapa completo`.
- Visualização completa não renderiza botão `X` próprio e não deixa blur preso ao retornar.
- Pan e zoom funcionam e não resetam após gesto.

### Conectores

- Conectores ligam bisavós a avós, tios a pai/mãe, pessoa central a pai/mãe, pessoa central a irmãos/cônjuge, irmãos a sobrinhos e tios maternos a primos maternos.
- Rótulos `Pai` e `Mãe` não ficam cortados.
- Reabrir mapa completo não duplica conectores, não perde pan/zoom e não deixa mapa sob blur.
- Em `Descendentes`, as linhas verticais superiores acima de cônjuge e irmãos têm altura equivalente à linha que conecta irmãos e sobrinhos.

## `/mapa-familiar-horizontal`

- Preserva query `pessoa` ao alternar visualização.
- Renderiza linha geracional horizontal.
- Mantém filtros e contadores coerentes.
- Não é afetado pelo chrome compartilhado mobile de `/mapa-familiar` e `/linha-geracional`.
- Respeita `directRelativeFilters.conjuge` no escopo filtrado.

## Tutorial de primeiro acesso

- Abrir o tutorial de primeiro acesso em desktop e mobile.
- Avançar até uma etapa intermediária e recarregar a página na mesma sessão.
- Confirmar que o tutorial retoma a etapa armazenada em `sessionStorage`.
- Simular ausência de alvo visual de uma etapa e confirmar que a rota não quebra.
- Confirmar que o painel cai para posição segura quando não houver spotlight disponível.
- Finalizar o tutorial e confirmar que a etapa armazenada é limpa.

## `/meus-vinculos`

- Confirmar que pessoas com vínculo real em `user_person_links` aparecem como `Cadastrado`.
- Confirmar que pessoas sem vínculo real aparecem como `Pré-cadastrado` quando aplicável.
- Validar que a migration de leitura de status de vínculo existe no ambiente remoto.
- Abrir o modal de pet e confirmar que o formulário principal fica em coluna única, sem lateral redundante comprimindo os campos.
- Confirmar que o modal de pet não abre teclado automaticamente antes de foco explícito.
- Confirmar que a seleção de filho, cônjuge, irmão ou pet não trava o mobile.

## `/meus-dados`

- Em desktop, confirmar que `Dia ou Ano de Nascimento` mantém largura compacta.
- Em desktop, confirmar que `Local de falecimento` e `Falecimento no exterior` permanecem legíveis quando a pessoa está marcada como falecida.
- Em mobile, confirmar que os ajustes não alteram o contrato já documentado de botões e questionário.
- Confirmar que pessoa falecida pula `/preferencias`.

### Questionário `Sobre Mim`

- No primeiro acesso, abrir `/meus-dados` e ir até a seção `Sobre Mim`.
- Clicar em `Pular Tudo` sem selecionar características ou responder perguntas.
- Confirmar que não aparece a mensagem `Selecione ao menos uma característica antes de continuar.`
- Confirmar que a tela final `Perfil` aparece com Mini Bio e Curiosidades editáveis.
- Confirmar que Mini Bio e Curiosidades podem ficar vazias.
- Confirmar que `Confirmar meus dados` permite continuar quando os dados pessoais obrigatórios estiverem válidos.
- Clicar em `Voltar ao questionário` e confirmar retorno à primeira etapa.
- Responder parte do questionário, finalizar e confirmar que a geração/regeneração por IA aparece apenas quando houver fonte suficiente.
- Editar Mini Bio e Curiosidades manualmente, salvar, recarregar e confirmar persistência.
- Simular falha de IA e confirmar que o erro não bloqueia leitura, edição manual ou continuação do fluxo.

### Perfil gerenciado em `/meus-dados`

- Selecionar uma pessoa sob responsabilidade no menu do avatar.
- Confirmar que o menu passa a exibir nome/avatar da pessoa administrada.
- Abrir `/meus-dados`.
- Confirmar que o formulário mostra dados da pessoa administrada, não da pessoa responsável.
- Responder o questionário e gerar Mini Bio/Curiosidades.
- Confirmar que o texto gerado menciona dados da pessoa administrada.
- Confirmar que a chamada a `person_profile_questionnaire_answers` não retorna 403/409 por RLS.
- Limpar a perspectiva e confirmar retorno aos dados do perfil principal.


## `/pessoa/:id` e `/pessoas/:id`

### Timeline e PDF

- Abrir perfil com pelo menos um evento de linha do tempo contendo PDF.
- Confirmar que o título `Arquivos e registros vinculados` não aparece.
- Confirmar que o card do anexo exibe ícone, título, tipo `PDF`, ano quando disponível, descrição e ações.
- Confirmar que `Abrir` e `Baixar` têm a mesma hierarquia visual, fonte e peso.
- Clicar em `Abrir` e confirmar que abre modal com título do documento.
- Confirmar que o PDF é renderizado dentro do modal por canvas, sem depender de Google Viewer.
- Confirmar que o console não mostra bloqueio de `https://docs.google.com/` por `X-Frame-Options`.
- Confirmar que o estado `Carregando PDF...` aparece enquanto o arquivo carrega.
- Confirmar que `Abrir em nova aba` aparece no rodapé do modal.
- Confirmar que `Baixar` permanece funcional no card da timeline.
- Testar fechamento e reabertura do modal sem duplicar páginas ou manter canvas antigo.

### Parentesco no perfil

Validar em `/pessoa/4b6eb714-a6e3-4a44-a093-01a95d935271?voltar=%2Fmapa-familiar%3Fpessoa%3D839bac13-31cb-4173-82a3-12bd1376d38c`, ou perfil equivalente de Condilênia quando os IDs forem diferentes no ambiente:

- com pessoa vinculada do usuário, confirmar frase inicial `Você é filho de Condilênia Souza.` quando aplicável;
- selecionar `Caio Cavalcanti Souza` e confirmar frase específica de sobrinho de Márcio Ailton, não fallback genérico;
- selecionar `Absalon Limeira de Souza Neto` e confirmar frase específica de sobrinho de Márcio Ailton;
- selecionar `Adalberto Bezerra Neto` e confirmar frase de cônjuge de Tatiane/Tathiane, sobrinha de Márcio Ailton;
- selecionar `Heitor de Albuquerque Tsangaropulos` e confirmar `Condilênia Souza é avó de Heitor Tsangaropulos.`;
- confirmar que não aparece `avô/avó` quando o gênero da pessoa permite `avó`;
- confirmar que fallback `Há uma ligação familiar...` só aparece quando não houver regra específica.

## `/curiosidades` — conexões

- Abrir `/curiosidades`.
- Entrar na aba `Qual a minha conexão?`.
- Confirmar que a primeira pessoa pode vir preenchida pela pessoa vinculada do usuário.
- Confirmar que pets não aparecem nos seletores.
- Confirmar que não há `SelectItem` com valor vazio.
- Selecionar os mesmos pares validados no perfil, quando disponíveis na base.
- Confirmar que a frase principal usa a mesma lógica de sobrescrita do perfil.
- Confirmar que erros de dados insuficientes aparecem como mensagem textual, sem quebrar a rota.
- Confirmar que o resultado visual não cria overflow horizontal em desktop ou mobile.

## `/admin/gestao-conteudo-pessoas`

- Abrir como admin.
- Selecionar pessoa com data de nascimento completa.
- Clicar em `Gerar conteúdos ausentes`.
- Confirmar que `Astrologia` recebe signo solar e resumo.
- Confirmar que `Fatos do nascimento` recebe título e resumo principal.
- Confirmar que aparecem campos `Subtítulo do período`, `Título Brasil`, `Texto Brasil`, `Título Mundo` e `Texto Mundo`.
- Confirmar que `Texto Brasil` e `Texto Mundo` não ficam vazios após geração bem-sucedida.
- Salvar conteúdos automáticos, recarregar a página e confirmar persistência.
- Editar manualmente Brasil/Mundo usando linha em branco entre parágrafos, salvar e confirmar que os parágrafos são preservados.
- Clicar em `Limpar fatos` e confirmar remoção apenas de `historical_events`.
- Clicar em `Regenerar conteúdos` e confirmar que itens existentes são sobrescritos.
- Testar pessoa sem data de nascimento completa e confirmar erro amigável.
- Confirmar no perfil que o bloco `O que estava acontecendo na época` exibe Brasil e Mundo quando o conteúdo existe.

## Fluxo de onboarding completo

- Validar pessoa viva: `/meus-dados` -> `/meus-vinculos` -> `/arquivos-historicos` -> `/preferencias` -> `/revisao-dados` -> `/mapa-familiar`.
- Validar pessoa falecida: `/meus-dados` -> `/meus-vinculos` -> `/arquivos-historicos` -> `/revisao-dados` -> `/mapa-familiar`.
- Confirmar que dados já salvos não são perdidos ao voltar para etapas anteriores.
- Confirmar que o fluxo não mistura dados quando a pessoa ativa é perfil gerenciado.
- Em `/revisao-dados`, confirmar que Mini Bio e Curiosidades aparecem apenas quando fornecidas ou geradas.
- Confirmar que ausência de Mini Bio e Curiosidades não bloqueia finalização.
- Confirmar que alterações pendentes de vínculos aparecem como pendência de aprovação, não como alteração definitiva.

## Perspectiva memorial

- Selecionar, pelo menu de perfis gerenciados, uma pessoa falecida.
- Abrir `/forum` e confirmar aviso de modo memorial.
- Confirmar que criação de tópico, resposta, edição de resposta e reações ficam bloqueadas.
- Abrir `/curiosidades` e confirmar aviso de modo memorial.
- Confirmar que perguntas à IA, sugestões rápidas e publicação no mural ficam bloqueadas.
- Confirmar que leitura de conteúdo existente em fórum e curiosidades permanece disponível.
- Confirmar que nenhum bloqueio usa `alert`, `confirm` ou `prompt`.

## `/admin/notificacoes`

- Abrir `/admin/notificacoes` como admin.
- Entrar na aba `Configuração`.
- Confirmar que aparecem os modelos `Boas-vindas de primeiro acesso` e `Novo vínculo confirmado`.
- Editar título/texto/CTA de um modelo e salvar.
- Recarregar a página e confirmar que a customização permanece.
- Confirmar que a reconciliação do catálogo não remove tipos customizados já existentes.
- Confirmar que `Usuário do gatilho`, `Usuários específicos` e `Familiares próximos` aparecem como destinatários quando disponíveis.
- Confirmar que `variable_settings` é preservado ao salvar e reabrir.
- Confirmar que a tela não promete disparo real quando o evento estiver apenas preparado.

### Reset de perfil administrativo

- Abrir `/admin/pessoas` como admin.
- Executar reset de perfil em pessoa de teste.
- Confirmar que a RPC não falha com erro de deleção direta em `storage.objects`.
- Confirmar que dados relacionais esperados foram limpos.
- Confirmar que arquivos físicos remanescentes no Storage são tratados por rotina/API própria, não por SQL direto.

## Administração e demais rotas

- Rotas admin exigem usuário admin, exceto `/admin/login`.
- Rotas de membro exigem primeiro acesso concluído quando aplicável.
- `/admin/gestao-conteudo-pessoas` deve estar acessível via rota e ação administrativa quando a frente estiver habilitada.
- Ajustes de mapa mobile não devem alterar dados, notificações, fórum, calendário ou perfil.
