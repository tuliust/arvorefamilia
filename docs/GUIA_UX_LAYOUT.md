# Guia de UX e layout

> Última revisão: 2026-07-04
> Escopo: experiência visual das rotas principais da branch `main`, com foco em mapa mobile, linha geracional, layout compartilhado, exportação desktop, onboarding, perspectiva memorial, camadas de overlay, Linha do Tempo com anexos, modal de PDF e conexões familiares.
> Status: canônico.

## Princípios

- Priorizar navegação familiar clara, com foco em pessoas, vínculos e memória.
- Evitar telas com excesso de ações concorrentes.
- Manter desktop e mobile como experiências equivalentes, não idênticas.
- Proteger fluxos de onboarding contra perda acidental de contexto.
- Preservar contraste, legibilidade e áreas clicáveis confortáveis.
- Alterações mobile devem ser isoladas por breakpoint/rota e não podem alterar desktop por herança.
- Ajustes visuais transitórios devem migrar para componentes React quando estabilizados.
- Componentes de modal devem usar overlays próprios da aplicação, nunca diálogos nativos do navegador.
- Uploads familiares e documentos históricos devem ter hierarquia visual discreta, sem parecer biblioteca pública de arquivos.

## Mapa familiar

### Desktop

- `/mapa-familiar` usa visualização por grupos de parentesco.
- `/mapa-familiar-horizontal` usa visualização geracional horizontal.
- O painel lateral apresenta seleção de pessoa de referência, temas, métricas, filtros e exportação.
- O seletor de visualização mantém label fechado do tipo `Família de X` quando houver pessoa de referência.
- O placeholder aberto é `Visualize a árvore como...`.
- O cabeçalho do painel mantém título `Visualização`, ícone de olho sem borda visual e ação de recolher na mesma linha.
- `Pai` e `Mãe` são referências de alinhamento visual no mapa por grupos.
- Em perspectiva por outra pessoa, `Todos os cônjuges` inicia inativo, mas continua visualmente clicável e pode ser ativado pelo usuário.
- `Apenas familiares` usa nomenclatura curta e não deve voltar para `Apenas meus familiares`.
- Grupos de tios e primos no desktop devem encolher quando houver poucos cards.

### Exportação desktop

- A seção `Exportar` mostra apenas `Salvar Imagem` e `Imprimir`.
- `Salvar Imagem` abre modal de instruções com fundo opaco, três etapas e botões `Cancelar`/`Continuar`.
- Durante seleção de área, zoom, favorito e botão `?` desaparecem.
- A impressão usa página limpa, título superior, árvore centralizada e uma página em retrato ou paisagem.
- `Imagem` e `PDF` não devem aparecer como botões principais do painel.

## Mobile compartilhado

- Em `/mapa-familiar` e `/linha-geracional`, o mobile usa chrome compartilhado: header, toolbar superior e navegação inferior ficam fora da área central trocada pelo `<Outlet />`.
- Alternar `Formato` entre mapa familiar e linha geracional preserva visualmente header, toolbar e menu inferior.
- A navegação mobile evita manter painéis abertos por padrão.
- O painel aberto pelo botão `+` fica na camada mais alta.
- A toolbar mobile usa o rótulo `Mapa`; `Zoom` não deve ser usado para visão geral.
- O zoom real fica no fluxo `Exibir mapa completo`.

## Linha do Tempo e anexos históricos

A Linha do Tempo da página de pessoa usa `PersonTimeline`.

Contrato visual atual:

- eventos têm ícone circular à esquerda, badge de tipo, título, data e descrição;
- anexos aparecem dentro do card do evento, abaixo da descrição;
- a seção de anexos não deve exibir o título `Arquivos e registros vinculados`;
- cada anexo é um card compacto com ícone, título, selo de tipo (`PDF`, `Imagem`, `Registro`) e ano quando disponível;
- descrição do anexo usa texto pequeno, com `whitespace-pre-line` e quebra segura;
- ações ficam em uma linha compacta: `Abrir` e `Baixar`.

### Botões `Abrir` e `Baixar`

Contrato atual:

- `Abrir` e `Baixar` compartilham a mesma classe visual base;
- ambos usam `text-xs`, `font-semibold`, `leading-5`, `text-gray-600` e `hover:text-gray-900`;
- ícones usam `h-3.5 w-3.5`;
- `Abrir` não deve parecer botão primário;
- `Baixar` continua visível e separado do preview;
- diferença de fonte, peso, cor ou tamanho entre `Abrir` e `Baixar` é regressão visual.

### Modal de PDF

Quando o anexo é PDF:

- clicar em `Abrir` abre modal próprio da aplicação;
- o modal usa `Dialog`;
- a largura máxima é ampla, mas limitada ao viewport;
- a altura usa `min(calc(100dvh - 2rem), 860px)`;
- o cabeçalho mostra título do arquivo e descrição curta;
- o conteúdo usa fundo cinza para área de leitura;
- o rodapé mantém fallback `Abrir em nova aba`.

### Preview de PDF

O preview atual não usa iframe do Google Viewer.

Contrato:

- PDFs são renderizados por `PdfDocumentPreview`;
- o componente carrega PDF.js por CDN;
- busca o arquivo por `fetch`;
- lê o conteúdo como `ArrayBuffer`;
- renderiza página por página em `<canvas>`;
- exibe estado `Carregando PDF...`;
- em erro, exibe mensagem amigável;
- canvas deve respeitar largura do container e permitir rolagem.

Não usar:

- Google Viewer em iframe;
- iframe direto como única forma de preview de PDF;
- download automático ao clicar em `Abrir`.

## Conexões familiares e parentesco

### Perfil da pessoa

A seção `Seu parentesco com ela/ele` usa `RelationshipFinder`.

Contrato visual:

- card com título e ícone `Users`;
- bloco azul claro com resultado do vínculo da pessoa logada com a pessoa do perfil;
- seletor para “Veja qual a relação dela/dele com outra pessoa”;
- resultado em card branco translúcido;
- se não houver seleção, mostrar `O resultado aparece aqui após a seleção.`

Contrato de frase:

- o resultado deve usar `getRelationshipResultSentenceWithOverrides`;
- vínculos conjugais inativos devem ser considerados no perfil (`includeInactiveSpouses: true`);
- o fallback `Há uma ligação familiar entre...` não deve aparecer para padrões já conhecidos;
- quando houver gênero conhecido ou inferível, usar `avó`, `avô`, `sobrinha`, `sobrinho`, `tia`, `tio`, `casada`, `casado`.

Casos de referência:

```txt
Caio Souza é sobrinho de Márcio Ailton, que foi casado com Condilênia Souza.
Adalberto Bezerra Neto é cônjuge de Tathiane/Tatiane, sobrinha de Márcio Ailton, que foi casado com Condilênia Souza.
Absalon Limeira de Souza Neto é sobrinho de Márcio Ailton, que foi casado com Condilênia Souza.
Condilênia Souza é avó de Heitor Tsangaropulos.
```

### `/curiosidades`

A seção `Qual a minha conexão com alguém?` usa `ConnectionDiscoveryPanel`.

Contrato visual:

- dois selects (`Pessoa 1`, `Pessoa 2`);
- botão `Descobrir conexão`;
- resultado em card azul claro com avatares, seta e frase principal;
- narrativa secundária só aparece quando agrega informação real;
- não deve duplicar frase principal como narrativa.

Contrato de frase:

- usar a mesma função de sobrescrita do perfil;
- resultado principal vem de `getRelationshipResultSentenceWithOverrides`;
- narrativa complementar pode usar `getRelationshipNarrative`, desde que não seja genérica ou duplicada;
- seletores não devem receber pessoas sem ID ou pets.

## Fluxo de onboarding

```text
/meus-dados
  -> /meus-vinculos
  -> /arquivos-historicos
  -> /preferencias
  -> /revisao-dados
  -> /mapa-familiar
```

Pessoa marcada como falecida em `/meus-dados` pula `/preferencias` e segue para `/revisao-dados`.

## Perspectiva memorial

- Em perspectiva de pessoa falecida administrada por responsável, áreas sociais permanecem em modo leitura.
- O fórum deve bloquear criação de tópico, resposta, edição de resposta e reações nessa perspectiva.
- `/curiosidades` deve bloquear perguntas à IA, uso de sugestões rápidas e publicação no mural nessa perspectiva.
- O aviso de modo memorial deve ser discreto, legível e não bloquear a leitura do conteúdo já existente.
- O bloqueio não deve usar `alert`, `confirm` ou `prompt` nativos.

## Administração

- No dashboard administrativo mobile, cards principais devem manter estrutura visual equivalente.
- `Conteúdo de Pessoas` deve aparecer como ação administrativa quando a rota `/admin/gestao-conteudo-pessoas` estiver ativa.
- Nas rotas `/admin/*`, o header global deve ser reduzido para navegação essencial.

### `/admin/gestao-conteudo-pessoas`

Contrato visual da área de conteúdos automáticos:

- coluna lateral para busca/seleção de pessoa;
- card de geração manual;
- card de visibilidade;
- card de conteúdos automáticos;
- card de privacidade básica.

Na área de conteúdos automáticos:

- `Astrologia` possui `Signo solar`, `Resumo`, estado atual e ação `Limpar astrologia`;
- `Fatos do nascimento` possui `Título`, `Resumo principal`, `Subtítulo do período`, `Título Brasil`, `Texto Brasil`, `Título Mundo`, `Texto Mundo` e ação `Limpar fatos`;
- textos Brasil/Mundo usam áreas de texto com placeholder sobre linha em branco entre parágrafos;
- botões `Gerar conteúdos ausentes` e `Regenerar conteúdos` ficam acima dos blocos.

Regressão visual:

- campos Brasil/Mundo sumirem;
- `Subtítulo do período` voltar a não ser editável;
- o layout dos dois blocos ficar comprimido em telas grandes;
- conteúdos salvos voltarem vazios ao recarregar.

## Regra de manutenção visual

Mudanças em mapa mobile devem validar 320px, 375px, 390px e 430px.

Mudanças em modal de PDF devem validar:

- desktop com PDF de uma página;
- desktop com PDF de múltiplas páginas;
- mobile 375px;
- fallback `Abrir em nova aba`;
- mensagem de erro quando o PDF não puder ser carregado.

Mudanças em frases de parentesco devem validar:

- perfil da pessoa;
- `/curiosidades`;
- vínculos diretos;
- vínculos por afinidade;
- vínculos com cônjuge falecido/inativo;
- gênero feminino/masculino conhecido.
