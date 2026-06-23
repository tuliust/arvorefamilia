# QA manual

> Última revisão: 2026-06-23  
> Escopo: roteiro de validação após commits 6A–7D e ajustes pós-ciclo em `/curiosidades`, `/mapa-familiar`, header, notificações, `/forum` e `/meus-favoritos`.

## Pré-condições

- Branch: `feature/questionario-ia-vinculos-pets`.
- Build local aprovado.
- Migrations aplicadas no ambiente testado.
- Usuário de teste vinculado a pelo menos uma pessoa.
- Para QA de badges, pelo menos uma pessoa deve ter questionário de `/meus-dados` salvo com características selecionadas.
- Para QA de mapa, usar árvore com irmãos, cônjuge e pets.

## Comandos básicos

```bash
git status --short
git diff --check
npm run typecheck
npm run build
```

Observações:

- `npm run build` não substitui `npm run typecheck`.
- Avisos de LF/CRLF no Windows podem aparecer; erros de `git diff --check` devem ser corrigidos.
- `git status --short` deve estar limpo após commit/push.

## QA de `/meus-dados`

### Pessoa viva

1. Acessar `/meus-dados`.
2. Confirmar que o header não tem botões de ação.
3. Confirmar que o questionário IA tem 8 etapas.
4. Confirmar que a etapa 1 pergunta `Qual é o seu estilo?`.
5. Selecionar qualquer tom.
6. Manter toggle memorial em `Não`.
7. Selecionar badges/características em diferentes categorias.
8. Avançar até a etapa 8.
9. Confirmar que não existem etapas 9 e 10.
10. Confirmar que na última etapa não aparece botão `Avançar`.
11. Confirmar dados.

### Pessoa falecida

1. Marcar `Você está escrevendo o perfil de uma pessoa falecida?` como `Sim`.
2. Selecionar um tom que não seja `Nostálgico`.
3. Confirmar dados.
4. Ir para `/meus-vinculos`.
5. Gerar Mini Bio/Curiosidades.
6. Confirmar que o texto usa terceira pessoa e passado.
7. Confirmar que o texto não depende exclusivamente do tom `Nostálgico`.

### Limites de texto

1. Gerar Mini Bio/Curiosidades.
2. Confirmar contador de até 500 caracteres.
3. Confirmar que textos gerados ficam próximos de 400–450 caracteres quando há insumo suficiente.
4. Editar manualmente até 500 caracteres.
5. Confirmar que texto maior é bloqueado ou truncado com segurança.

## QA de `/meus-vinculos`

### Header e títulos

1. Confirmar header sem botões.
2. Confirmar título `Sobre mim` fora do box de textos.
3. Confirmar título `Familiares de X` fora do container de vínculos.
4. Confirmar fontes maiores e ícone/avatar à esquerda.

### Mini Bio/Curiosidades

1. Confirmar ausência do botão `Salvar textos`.
2. Editar Mini Bio.
3. Editar Curiosidades.
4. Avançar página.
5. Voltar e confirmar persistência dos textos.

### Pets

1. Adicionar pet.
2. Confirmar que aparece em `Pets`.
3. Confirmar que não aparece em `Filhos`.
4. Confirmar ícone de pet quando não houver foto.

### Filhos

1. Adicionar filho humano.
2. Confirmar que aparece em `Filhos`.
3. Confirmar que não aparece em `Pets`.

### Estados vazios

1. Em grupo sem registros, confirmar título/descrição do estado vazio.
2. Confirmar que não há botão inferior duplicado.
3. Confirmar que o botão superior permanece.

### Irmã feminina

1. Usar pessoa com `genero` feminino ou hint feminino.
2. Confirmar label `Irmã`.
3. Confirmar que não aparece `Irmão(a)`.

### Cônjuges

1. Adicionar cônjuge ativo.
2. Adicionar segundo cônjuge ativo.
3. Confirmar que apenas um fica ativo no estado local.
4. Confirmar que o fluxo gera solicitação pendente, não relacionamento definitivo.

## QA de `/arquivos-historicos`

### Fato sem arquivo

1. Criar registro com título/descrição e sem upload.
2. Salvar.
3. Confirmar sucesso.
4. Confirmar que aparece na lista como fato/memória.
5. Confirmar que não há botão de download/abrir arquivo.

### Imagem

1. Criar registro com imagem.
2. Confirmar thumbnail.
3. Confirmar tipo `Imagem`.

### PDF

1. Criar registro com PDF.
2. Confirmar ícone de PDF.
3. Confirmar tipo `PDF`.

### Participantes

1. Associar participantes.
2. Salvar.
3. Confirmar que participantes aparecem quando a coluna `participante_ids` está disponível.

## QA de `/revisao-dados`

1. Confirmar header sem ações.
2. Confirmar dados pessoais.
3. Confirmar Mini Bio/Curiosidades com até 500 caracteres.
4. Confirmar grupos de vínculos.
5. Confirmar Pets separados de Filhos.
6. Confirmar fatos/arquivos com labels:
   - Fato sem arquivo;
   - Imagem;
   - PDF.
7. Confirmar edição inline das seções permitidas.
8. Confirmar conclusão do onboarding.

## QA do perfil `/pessoa/:id`

1. Abrir perfil com fatos históricos.
2. Confirmar timeline lateral.
3. Confirmar que fato sem arquivo aparece como `Fato`.
4. Confirmar que arquivo com anexo aparece como `Arquivo`.
5. Confirmar ordenação por ano/data.
6. Confirmar que registros sem ano ficam ao final.
7. Confirmar que não aparecem URLs/storage paths na interface.
8. Confirmar contatos no topo quando permitidos e pessoa viva.
9. Confirmar múltiplas redes sociais quando cadastradas.
10. Confirmar badges do questionário no card `Sobre`.

## QA de `/curiosidades`

### Cards principais

1. Abrir `/curiosidades`.
2. Confirmar cards:
   - `Pessoas`;
   - `Localização`;
   - `In memoriam`;
   - `Pets`;
   - `Casais`.
3. Confirmar descrições revisadas.
4. Confirmar `Localização` contando cidades atuais.
5. Confirmar `In memoriam` contando falecidos.
6. Confirmar `Casais` contando relações ativas.

### Rankings

1. Confirmar `Nomes mais comuns`.
2. Confirmar `Mês com mais aniversários` listando top 5 meses.
3. Confirmar que a lista de aniversários não mostra nomes antigos indevidos.
4. Confirmar `Perfil dos familiares` usando badges quando disponíveis.
5. Confirmar `Principais cidades de nascimento`.
6. Confirmar `Profissões mais comuns`.

### Gráficos

1. Confirmar `Faixa Etária`.
2. Confirmar que não aparece `Pessoas por geração` com gerações sociológicas nesse card.
3. Confirmar distribuição coerente por idade.

### Bodas

1. Abrir card/seção `Bodas`.
2. Confirmar que relação com cônjuge falecido não soma anos após falecimento.
3. Confirmar que relações ativas continuam calculando até data atual.
4. Confirmar que o título não volta para `Bodas e Vínculos`.

### Interações

1. Confirmar dropdowns iniciando com `Selecione` em:
   - Comparar interesses;
   - Astrologia;
   - Qual a minha conexão com alguém.
2. Confirmar que não há pré-seleção automática de Absalon ou primeira pessoa.
3. Confirmar comparação usando características/badges quando disponíveis.

### Quiz

1. Confirmar pergunta de pessoa viva com mais tempo de vida.
2. Confirmar opções com 5 pessoas vivas mais velhas.
3. Confirmar pergunta de pessoa mais jovem.
4. Confirmar pergunta de cidade de nascimento.
5. Confirmar pergunta de profissão com alternativas válidas.

## QA de `/mapa-familiar`

### Painel desktop

1. Confirmar dropdown fechado `Família de X`.
2. Abrir dropdown e confirmar opção desabilitada `Visualize a árvore como...`.
3. Confirmar nomes listados com primeiro e segundo nome, sem `Família de Maria`.
4. Confirmar seleção manual por query string `?pessoa=`.
5. Confirmar card `Cadastrados`.
6. Confirmar cards `Núcleo`, `Ascendentes` e `Colaterais` com gap reduzido.
7. Confirmar fontes menores nos títulos de parentes.
8. Confirmar botão:
   - inativo: `Exibir cônjuges de tios, primos etc`;
   - ativo: `Ocultar cônjuges de tios, primos etc`.

### Canvas desktop

1. Confirmar layout compacto em árvore pequena.
2. Confirmar que árvore complexa não força layout compacto.
3. Confirmar irmãos em até 2 colunas no desktop.
4. Confirmar Lorenzo ao lado direito de Titus quando houver espaço.
5. Confirmar cônjuge mais à direita.
6. Confirmar pets mais à direita.
7. Confirmar ausência de sobreposição entre irmãos, cônjuge e pets.

### Tour

1. Abrir `/mapa-familiar?tutorial=1`.
2. Confirmar etapa IA/Calendário.
3. Confirmar etapa Favoritos.
4. Confirmar que o target visual não fica fora da tela.

## QA de `/forum`

### Desktop

1. Abrir `/forum` em desktop.
2. Confirmar que a barra de busca/filtros ocupa a largura do container.
3. Confirmar botão `Criar novo` alinhado à lateral direita do container de `Tópicos recentes`.
4. Confirmar que não há overflow horizontal.

### Mobile

1. Abrir `/forum` em largura mobile.
2. Confirmar que a busca e os botões continuam acessíveis.
3. Confirmar que não há quebra de layout.

## QA de `/meus-favoritos`

### Desktop

1. Abrir `/meus-favoritos` em desktop.
2. Confirmar que a barra de busca/filtros ocupa a largura dos cards.
3. Confirmar botão de filtro alinhado com o terceiro card.
4. Confirmar que grid de favoritos continua correto.

### Mobile

1. Abrir `/meus-favoritos` em largura mobile.
2. Confirmar busca/filtro sem overflow.
3. Confirmar cards empilhados corretamente.

## QA de notificações

1. Abrir dropdown do sino.
2. Confirmar que `Ver todas as notificações` aparece inteiro.
3. Confirmar que `Personalizar preferências` aparece inteiro.
4. Confirmar que os botões funcionam.
5. Confirmar que dropdown não corta horizontalmente em desktop.
6. Confirmar empilhamento em viewport estreito.

## QA mobile

1. Testar `/mapa-familiar` em largura mobile.
2. Testar `/mapa-familiar-horizontal` em largura mobile.
3. Confirmar zoom/overview/filtros/painel.
4. Confirmar que scripts mobile não foram quebrados por alterações de onboarding ou desktop.

## Erros conhecidos a vigiar

- `ReferenceError: MapPin is not defined` indica import ausente de ícone.
- Build do Vite pode não detectar todos os erros de runtime.
- Falha ao salvar fato sem arquivo indica migration não aplicada.
- Badge `Cadastrado` incorreto pode indicar problema em `user_person_links` ou RLS.
- Texto com mojibake (`FamÃ­lia`, `cÃ´njuges`, `Árvore` corrompido) indica gravação com encoding incorreto.
- Se `npm run build` passar mas `npm run typecheck` falhar, corrigir antes do commit.
