# Baseline atual do produto

> Última revisão: 2026-06-22  
> Escopo: estado implementado após commits 6A, 7A, 7B, 7C e 7D.

## Commits de referência


| Frente | Commit | Status |
|---|---:|---|
| Prompt 6A — mapa familiar, tour e painel | `5e64d74` | Implementado e pushado |
| Prompt 7A — questionário, IA e privacidade | `4a1a995` | Implementado e pushado |
| Prompt 7B — vínculos, pets, cônjuges e badges | `c9a8f27` | Implementado e pushado |
| Prompt 7C — fatos/arquivos históricos na timeline | `6185b6d` | Implementado e pushado |
| Prompt 7D — UX final do onboarding e IA 500 caracteres | `de4f60f` | Implementado e pushado |


## Visão geral

O produto é uma plataforma familiar privada para organizar perfis, vínculos, fatos, arquivos históricos, favoritos, timeline e mapa familiar.

O baseline atual cobre:

- onboarding do membro;
- questionário de perfil com IA;
- Mini Bio e Curiosidades;
- vínculos familiares, pets e cônjuges;
- fatos e arquivos históricos com ou sem anexo;
- revisão final de dados;
- mapa familiar desktop/mobile;
- timeline do perfil individual.

## Fluxo principal de onboarding

```text
/meus-dados
  → /meus-vinculos
  → /arquivos-historicos
  → /preferencias
  → /revisao-dados
  → /mapa-familiar
```

Se `pessoa.falecido === true`:

```text
/meus-dados
  → /meus-vinculos
  → /arquivos-historicos
  → /revisao-dados
  → /mapa-familiar
```

## Header das páginas de onboarding

Nas rotas abaixo, o header não exibe botões de navegação/ação:

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

O header mantém apenas:

- ícone ou imagem à esquerda;
- título;
- subtítulo.

## `/meus-dados`

### Dados pessoais

A tela mantém edição de:

- nome;
- data/local de nascimento;
- data/local de falecimento;
- profissão;
- local atual quando aplicável;
- avatar;
- contatos e redes sociais;
- preferências de privacidade associadas ao perfil.

### Questionário de IA

O questionário possui 8 etapas:

1. Qual é o seu estilo?
2. Personalidade.
3. Família e vínculos.
4. Trabalho e trajetória.
5. Lugares e mudanças de cidade.
6. Momentos marcantes.
7. Hobbies e paixões.
8. Marcas pessoais e curiosidades.

Foram removidas as antigas etapas:

- Outras características;
- Perguntas opcionais.

### Memorial

O modo memorial é controlado pelo toggle:

```text
Você está escrevendo o perfil de uma pessoa falecida?
```

`Nostálgico` é somente um tom. Qualquer tom pode gerar textos no passado se o toggle memorial estiver ativo.

## Mini Bio e Curiosidades

- Limite por campo: 500 caracteres.
- Geração esperada: cerca de 400–450 caracteres por campo.
- O texto não precisa começar com o nome da pessoa.
- Para pessoa viva, usar primeira pessoa quando o perfil é do próprio usuário.
- Para pessoa falecida/memorial, usar terceira pessoa e verbos no passado.
- A IA pode considerar dados do questionário e alguns campos estruturados seguros.
- Dados sensíveis não entram no contexto da IA.

## `/meus-vinculos`

- Pets têm grupo próprio.
- Pets não são filhos humanos.
- `humano_ou_pet: 'Pet'` identifica pet.
- Cônjuges têm no máximo um vínculo ativo no estado local.
- Adições/remoções/edições seguem como solicitações pendentes.
- Badge `Cadastrado` depende de vínculo real em `user_person_links`.
- Badge `Pré-cadastrado` é usado quando não há usuário vinculado.
- Títulos principais ficam fora dos containers.
- Botões de adicionar abaixo de estados vazios foram removidos.
- Mini Bio e Curiosidades são salvas no avanço da página.

## `/arquivos-historicos`

- Nome funcional: Fatos e Arquivos Históricos.
- Upload é opcional.
- Um registro pode não ter arquivo.
- Registros com anexo podem ser imagem ou PDF.
- Registros sem arquivo aparecem como fatos/memórias.
- Participantes podem ser associados quando `participante_ids` está disponível.
- A timeline do perfil consome os registros de `arquivos_historicos`.

## `/revisao-dados`

A tela revisa:

- dados pessoais;
- história/Mini Bio/Curiosidades;
- contatos;
- privacidade;
- vínculos;
- pets;
- fatos e arquivos históricos.

A revisão diferencia:

- Fato sem arquivo;
- Imagem;
- PDF.

## Perfil da pessoa

A página do perfil individual usa a timeline lateral para organizar:

- nascimento;
- filhos;
- casamento/união;
- separação;
- falecimento;
- eventos pessoais;
- fatos históricos sem arquivo;
- arquivos históricos com imagem/PDF;
- fatos/arquivos de relacionamento.

## `/mapa-familiar`

- Dropdown: `Família de X`.
- Card `Cadastrados`: baseado em `user_person_links`.
- Tour atualizado.
- Layout compacto para árvore pequena e simples no desktop.
- Mobile map permanece protegido por scripts específicos carregados em `index.html`.

## Fora do escopo deste baseline

- Refatoração estrutural dos scripts mobile.
- Remoção do seletor/debug `Visualizar como...`.
- Substituição completa de `arquivos_historicos` por nova tabela.
- Criação de novo modelo de relacionamento `tutor/pet_tutor`.
