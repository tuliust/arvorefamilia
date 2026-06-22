# QA manual

> Última revisão: 2026-06-22  
> Escopo: roteiro de validação após commits 6A–7D.

## Pré-condições

- Branch: `feature/questionario-ia-vinculos-pets`.
- Build local aprovado.
- Migrations aplicadas no ambiente testado.
- Usuário de teste vinculado a pelo menos uma pessoa.

## Comandos básicos

```bash
git status --short
git diff --check
npm run build
```

Recomendado:

```bash
npx tsc --noEmit
```

## QA de `/meus-dados`

### Pessoa viva

1. Acessar `/meus-dados`.
2. Confirmar que o header não tem botões de ação.
3. Confirmar que o questionário IA tem 8 etapas.
4. Confirmar que a etapa 1 pergunta `Qual é o seu estilo?`.
5. Selecionar qualquer tom.
6. Manter toggle memorial em `Não`.
7. Avançar até a etapa 8.
8. Confirmar que não existem etapas 9 e 10.
9. Confirmar que na última etapa não aparece botão `Avançar`.
10. Confirmar dados.

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

## QA de `/mapa-familiar`

1. Confirmar dropdown `Família de X`.
2. Confirmar seleção manual por query string.
3. Confirmar card `Cadastrados`.
4. Confirmar tour com etapa IA/Calendário.
5. Confirmar tour com etapa Favoritos.
6. Confirmar layout compacto em árvore pequena.
7. Confirmar que árvore complexa não força layout compacto.

## QA mobile

1. Testar `/mapa-familiar` em largura mobile.
2. Testar `/mapa-familiar-horizontal` em largura mobile.
3. Confirmar zoom/overview/filtros/painel.
4. Confirmar que scripts mobile não foram quebrados por alterações de onboarding.

## Erros conhecidos a vigiar

- `ReferenceError: MapPin is not defined` indica import ausente de ícone.
- Build do Vite pode não detectar todos os erros de runtime.
- Falha ao salvar fato sem arquivo indica migration não aplicada.
- Badge `Cadastrado` incorreto pode indicar problema em `user_person_links` ou RLS.
