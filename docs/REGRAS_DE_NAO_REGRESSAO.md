# Regras de não regressão

> Última revisão: 2026-07-03
> Escopo: contratos que não devem ser quebrados em novas alterações, incluindo layout compartilhado mobile dos mapas, scripts defensivos, exportação, onboarding, vínculos, notificações administrativas e perspectiva memorial.
> Status: canônico.

## Rotas

- `/` deve continuar redirecionando para `/mapa-familiar`.
- No mobile, `/mapa-familiar` e `/linha-geracional` devem permanecer sob o layout compartilhado `TreeMapSharedLayout`, com header, toolbar superior e navegação inferior fora da área trocada pelo `<Outlet />`.
- `/mapa-familiar-horizontal` deve continuar usando a shell `Home`/`TreeHomeShell`, sem herdar o chrome compartilhado mobile.
- `/linha-geracional` deve continuar sendo experiência geracional mobile, mas como filha do layout compartilhado de mapas.
- `/pessoa/:id` e `/pessoas/:id` devem continuar apontando para `PersonProfile`.
- Rotas administrativas, exceto `/admin/login`, devem continuar protegidas por `ProtectedRoute`.
- Usuário com primeiro acesso incompleto (`dados_confirmados = false`) não pode acessar rotas internas fora do fluxo de onboarding.
- `/admin/gestao-conteudo-pessoas` não deve ser removida enquanto estiver listada em `routes.tsx` e no dashboard administrativo.

## Chrome mobile compartilhado

- Alternar `Formato` entre `/mapa-familiar` e `/linha-geracional` não pode remontar visualmente header, toolbar superior ou navegação inferior.
- A área trocada pelo `<Outlet />` deve ser somente o conteúdo central do mapa.
- `TreeMapSharedLayout`, `MobileTreeChromeContext`, `MapaFamiliarSharedRoute` e `LinhaGeracional mobileChromeMode="shared"` são parte do contrato vigente.
- O adaptador `MapaFamiliarSharedRoute` é transição: pode esconder o shell antigo do `Home` no mobile, mas não deve afetar desktop.
- Runtimes específicos de linha geracional podem estar montados no layout compartilhado desde que sejam isolados internamente por `pathname`, breakpoint e seletores explícitos.

## Scripts defensivos

- Scripts carregados por `index.html` devem estar documentados em `INVENTARIO_TECNICO.md`, `GUIA_COMPONENTES.md` e `GUIA_IMPLEMENTACOES.md`.
- Novo script defensivo não pode ser adicionado sem escopo por rota, breakpoint e seletor.
- Scripts defensivos não podem substituir regra de domínio, schema, RLS, guard ou serviço.
- Scripts antigos de reorganização documental não devem reescrever `docs/README.md` com índice obsoleto.
- Comportamento estabilizado deve migrar para componente React, serviço ou utilitário tipado.

## Mapa familiar desktop por grupos

- Em `/mapa-familiar` desktop, a alternância de pessoa pelo dropdown `Visualização` deve preservar a perspectiva via query e carregar cônjuges colaterais ocultos por padrão.
- O botão `Todos os cônjuges` não pode ficar `disabled` em perspectiva por `?pessoa=`; deve iniciar inativo, mas permanecer clicável.
- A UI do painel deve refletir `directRelativeFilters.conjuge` real e não um filtro efetivo artificial que force `conjuge: false`.
- Ao trocar a pessoa de referência, é permitido reiniciar `conjuge` como inativo para a nova perspectiva.
- `Apenas familiares` não deve voltar para a nomenclatura antiga `Apenas meus familiares`.
- A mesma pessoa não pode ser renderizada simultaneamente como `Pai` e `Mãe`.
- Grupos de tios e primos não podem manter largura de 4 colunas quando a quantidade visível pede 1, 2 ou 3 colunas.
- `Primos Paternos` e `Primos Maternos` com 4 ou 5 cards devem usar largura visual de 2 colunas.
- Espaço vazio lateral excessivo dentro de grupos colaterais é regressão visual.
- Botão local `+`/`−` em grupos de tios ou primos só deve aparecer quando a expansão muda linhas visíveis ou altura útil; se todos os cards já cabem, eles devem carregar visíveis.

## Mapa familiar mobile

- A alternância entre mapa familiar e linha geracional deve preservar query string e pessoa de referência.
- No mobile, o header deve exibir `Árvore Familiar`.
- O painel do botão `+` deve ficar acima de todos os demais elementos da página.
- A visão geral/Mapa mobile não deve duplicar ícones, disparar ghost click ou deslocar conectores.
- O botão da toolbar mobile deve se chamar `Mapa`; `Zoom` não deve ser usado para visão geral.
- Ao abrir `Formato`, `Cor`, `Filtros`, `Mapa` ou `+`, a toolbar não pode mudar de posição e a navegação inferior não pode desaparecer.
- Backdrop/blur parcial deve ficar atrás do painel ativo e nunca cobrir header, toolbar, cards, CTA ou navegação inferior.
- O fundo branco de `Mapa da família` e `Gerações` deve envolver cards e CTA, sem corte nem sobra excessiva.
- `Tios Paternos` e `Tios Maternos` devem exibir inicialmente no máximo 8 cards quando houver muitos registros.
- O botão local `+` dos tios revela os demais cards e alterna para `−`.
- `Primos Paternos` e `Primos Maternos` devem rolar com um dedo em iPhone/Safari.
- Handlers de toque não podem bloquear scroll interno antes de avaliar se há rolagem disponível.

## Mapa completo mobile

- `Exibir mapa completo` abre camada completa com container arredondado abaixo da toolbar.
- O mapa completo não pode ficar por baixo de backdrop/blur.
- A versão atual não deve renderizar botão `X` próprio.
- Retorno/fechamento deve ser controlado pelo fluxo da toolbar/estado da rota, sem deixar blur, overlay ou tray preso.
- Pan e zoom por pinça funcionam sem rolar a página por baixo.
- Pan e zoom não podem resetar automaticamente após o gesto.
- Runtimes e observers não podem sobrescrever o `transform` do usuário, salvo por `Reenquadrar` ou reconstrução real.
- Cards exibem somente os dois primeiros termos do nome e não exibem datas/status ao lado do nome.
- `Tios maternos` não pode deixar espaço vazio excessivo abaixo da última linha.
- Conectores devem partir da borda real de grupos/cards e não podem ficar soltos ou duplicados.

## Linha geracional mobile

- `/linha-geracional` preserva título `Árvore Familiar` no header mobile.
- O painel `Mapa` preserva header, toolbar superior e navegação inferior.
- O painel `Mapa` exibe cards compactos `GERAÇÃO` numerados de 1 a 6, preferencialmente em grid `3x2`.
- Cada card navega para a geração correspondente, atualiza estado ativo e fecha o tray sem trocar rota.
- O fundo branco do painel envolve grade e CTA inferior.
- A visualização completa preserva `transform` após pan ou pinch.

## Exportação

- A seção `Exportar` do painel desktop deve mostrar apenas `Salvar Imagem` e `Imprimir`.
- `Imagem` e `PDF` não devem voltar como ações principais do painel.
- `Salvar Imagem` deve abrir modal de instruções antes de solicitar captura.
- Durante seleção de área, controles de zoom, favorito e botão `?` devem ficar ocultos.
- `Imprimir` deve abrir janela nativa de impressão com página limpa e árvore centralizada.
- Falhas de exportação devem usar `toast`, não diálogo nativo.

## Primeiro acesso e vínculos

- O tutorial de primeiro acesso não pode quebrar a rota quando um alvo visual não existir.
- A etapa corrente do tutorial deve ser preservada durante a sessão e limpa ao finalizar.
- Badges de `/meus-vinculos` não podem regredir para `Pré-cadastrado` quando há vínculo real em `user_person_links`.
- O modal de pet não deve voltar a comprimir o formulário principal com lista lateral redundante.
- Modais mobile de vínculo e pet não devem abrir teclado automaticamente antes de foco explícito.
- Pessoa falecida no primeiro acesso não deve ser obrigada a passar por `/preferencias`.

## Perspectiva memorial

- Perfis memoriais gerenciados por responsáveis podem navegar e ler conteúdo em `/forum` e `/curiosidades`.
- Perfis memoriais não podem criar tópico, responder, editar resposta, reagir, publicar no mural ou perguntar à IA.
- O bloqueio de ações memoriais não pode usar `alert`, `confirm` ou `prompt` nativos.
- A seleção de perfil memorial no menu de avatar não deve exibir sufixo visual `— memorial`, mas deve aplicar as restrições funcionais.

## Notificações administrativas

- O catálogo persistido em `admin_notification_catalogs` não pode sobrescrever customizações do admin durante reconciliação.
- Novos modelos runtime devem ser adicionados ao catálogo salvo apenas quando ausentes.
- `Boas-vindas de primeiro acesso` e `Novo vínculo confirmado` devem aparecer na aba `Configuração`.
- A presença de modelo editável não deve ser confundida com disparo real até que o dispatch correspondente esteja conectado e testado.
- `variable_settings` deve ser preservado ao salvar e reabrir configuração.
- `Usuário do gatilho`, `Usuários específicos` e `Familiares próximos` não devem desaparecer quando suportados pelo catálogo/UI.

## Validação documental

- Não pode haver caractere `U+FFFD` nos arquivos textuais de `docs/`.
- Comando Bash de busca de mojibake não deve ser documentado como se funcionasse em Windows PowerShell.
- Em PowerShell, usar busca filtrada por arquivos textuais:

```powershell
Get-ChildItem -Path .\docs -Recurse -File |
  Where-Object { $_.Extension -in ".md", ".txt", ".json", ".sql" } |
  Select-String -SimpleMatch ([char]0xFFFD)
```
- Índices não devem apontar para documentos removidos ou consolidados.
- Documentos históricos fragmentados não devem ser recriados quando `historico/LEGADO_TECNICO.md` já absorveu o conteúdo.

## Escopo documental

- Alterações documentais finais devem ficar restritas a `docs/`, salvo quando o ajuste necessário for no `README.md` raiz ou em scripts legados.
- Alterações funcionais de mapa mobile devem atualizar `MAPA_FAMILIAR_VIEW.md`, `GUIA_UX_LAYOUT.md`, `GUIA_COMPONENTES.md`, `GUIA_IMPLEMENTACOES.md`, `QA_MANUAL.md`, `REGRAS_DE_NAO_REGRESSAO.md`, `INVENTARIO_TECNICO.md`, `ROTAS_E_GUARDS.md` e `DECISOES_ARQUITETURAIS.md`.
