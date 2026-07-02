# QA manual

> Última revisão: 2026-07-01
> Escopo: validação manual das rotas e contratos documentados, incluindo layout compartilhado mobile dos mapas.
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
npm run test
npm run typecheck
npm run build
```

## QA transversal

- Nenhum fluxo sensível deve abrir diálogo nativo do navegador.
- Confirmações devem usar `ConfirmDialog` ou modal controlado.
- Feedbacks devem usar `toast` de `sonner`.
- Ajustes mobile não podem alterar layout desktop.
- Dropdowns de busca, notificações, avatar e painéis devem ficar acima de header, toolbar, cards e canvas.
- Navegação inferior não deve cobrir conteúdo final sem respiro inferior.

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
- Card inativo `Ocultar cards de cônjuges de tios, primos etc` usa leitura cinza equivalente a `Apenas meus familiares` quando inativo.

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

## Administração e demais rotas

- Rotas admin exigem usuário admin, exceto `/admin/login`.
- Rotas de membro exigem primeiro acesso concluído quando aplicável.
- Ajustes de mapa mobile não devem alterar dados, notificações, fórum, calendário ou perfil.
