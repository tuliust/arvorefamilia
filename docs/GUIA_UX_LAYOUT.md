# Guia de UX e layout

> Última revisão: 2026-06-22  
> Escopo: UX consolidada após 6A–7D.  
> Este arquivo substitui versões antigas com referências a 10 etapas, 300 caracteres e modo memorial acoplado ao tom Nostálgico.

## Princípios

- Interfaces de onboarding devem ser limpas, progressivas e sem ações paralelas no header.
- Títulos principais devem ficar fora de containers quando introduzem uma seção inteira.
- Cards internos devem conter apenas o conteúdo operacional da seção.
- Botões duplicados devem ser removidos.
- Labels devem respeitar gênero quando há sinal disponível.
- Fluxos de IA devem ser claros: tom textual não é o mesmo que estado de pessoa falecida.

## Header do onboarding

Nas páginas abaixo, o header exibe apenas ícone, título e subtítulo:

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

Não exibir:

- Favoritos;
- Notificações;
- Voltar para árvore;
- ações customizadas;
- menus secundários de navegação.

## `/meus-dados`

### Questionário IA

O questionário possui 8 etapas:

1. Qual é o seu estilo?
2. Personalidade.
3. Família e vínculos.
4. Trabalho e trajetória.
5. Lugares e mudanças de cidade.
6. Momentos marcantes.
7. Hobbies e paixões.
8. Marcas pessoais e curiosidades.

### Etapa 1

Título:

```text
Qual é o seu estilo?
```

A etapa pergunta o estilo do texto, não se a pessoa é falecida.

### Tons disponíveis

- Afetivo;
- Simples e direto;
- Divertido;
- Elegante;
- Nostálgico;
- Inspirador;
- Familiar;
- Emocional;
- Leve;
- Formal.

`Nostálgico` é apenas um tom. Ele não deve ativar memorial automaticamente.

### Toggle memorial

Label atual:

```text
Você está escrevendo o perfil de uma pessoa falecida?
```

Se `Sim`:

- a IA usa terceira pessoa;
- verbos no passado;
- tom respeitoso;
- qualquer tom selecionado é adaptado para memorial.

Se `Não`:

- a IA usa primeira pessoa quando for o perfil do próprio usuário;
- verbos no presente quando adequado.

### Última etapa

A última etapa é `Marcas pessoais e curiosidades`.

Não exibir botão `Avançar` nessa etapa, porque o fluxo continua pelo botão principal `Confirmar meus dados`.

## Mini Bio e Curiosidades

### Limite

- 500 caracteres por campo.
- Contadores devem refletir `0/500` até `500/500`.

### Geração esperada

- Aproximadamente 400–450 caracteres por campo.
- Texto deve ser completo, mas não prolixo.
- Não precisa começar com “Sou [Nome]” ou “[Nome] foi”.
- Evitar repetição do nome, pois ele já aparece no perfil.

## `/meus-vinculos`

### Bloco “Sobre mim”

Deve ficar acima do box de textos, não dentro dele.

Layout recomendado:

- ícone à esquerda;
- título em fonte maior;
- subtítulo explicativo abaixo;
- box abaixo contendo Mini Bio/Curiosidades e botão `Regenerar com IA`.

Não exibir botão `Salvar textos`.

Os textos são salvos quando o usuário avança na página.

### Bloco “Familiares de X”

Deve ficar fora do container dos cards de vínculo.

Layout recomendado:

- avatar/ícone à esquerda;
- título em fonte maior;
- subtítulo explicativo;
- grid/resumo de grupos abaixo.

### Grupos de vínculos

Cada grupo mantém apenas o botão superior de adicionar:

- Adicionar pai ou mãe;
- Adicionar filho;
- Adicionar pet;
- Adicionar cônjuge;
- Adicionar irmão.

Quando o grupo está vazio, o box vazio mostra apenas:

- título do estado vazio;
- descrição;
- sem botão inferior duplicado.

## Labels de gênero

Quando houver `genero` ou hint feminino:

- irmã deve aparecer como `Irmã`;
- mãe como `Mãe`;
- falecida/viva devem concordar com gênero.

Evitar labels genéricas como `Irmão(a)` quando a pessoa é identificada como mulher.

## `/arquivos-historicos`

### Nome funcional

Usar **Fatos e Arquivos Históricos**.

### Estados visuais

- Fato sem arquivo: ícone de fato/memória, badge `Fato` ou `Fato sem arquivo`.
- Imagem: thumbnail da imagem, badge `Imagem`.
- PDF: ícone de documento/PDF, badge `PDF`.

Upload é opcional.

## `/revisao-dados`

A revisão deve mostrar fatos e arquivos em uma seção única, diferenciando tipo:

- `Fato sem arquivo`;
- `Imagem`;
- `PDF`.

Pets devem aparecer em grupo próprio.

## Timeline do perfil

Na lateral do perfil:

- registro histórico sem anexo aparece como `Fato`;
- registro histórico com anexo aparece como `Arquivo`;
- fatos com ano entram em ordem cronológica;
- fatos sem ano ficam ao final;
- não exibir URL, storage path ou dados técnicos.

## `/mapa-familiar`

### Painel

- Dropdown: `Família de X`.
- Card `Cadastrados`: número baseado em `user_person_links`.

### Tour

- IA/Calendário em etapa específica.
- Favoritos em etapa separada: `Guarde os seus destaques`.

### Layout compacto

Árvores pequenas e simples podem usar layout compacto no desktop.

## Não regressões de UX

- Não voltar o questionário para 10 etapas.
- Não voltar limite para 300 caracteres.
- Não reintroduzir botão `Salvar textos` em `/meus-vinculos`.
- Não duplicar botões de adicionar em estados vazios.
- Não colocar títulos principais dentro dos containers operacionais.
- Não usar `Nostálgico` como sinônimo de pessoa falecida.
- Não exibir ações no header do onboarding.
