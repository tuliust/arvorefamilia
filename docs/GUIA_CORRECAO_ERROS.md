# Guia de correção de erros

> Última revisão: 2026-06-22

## `ReferenceError: MapPin is not defined`

### Sintoma

Erro ao acessar `/meus-dados`:

```text
ReferenceError: MapPin is not defined
```

### Causa

`MapPin` foi usado no JSX sem import correspondente de `lucide-react`.

### Correção

Em `src/app/pages/MeusDados.tsx`:

```tsx
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Info,
  MapPin,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  UserCircle2,
} from 'lucide-react';
```

### Prevenção

Rodar typecheck explícito:

```bash
npx tsc --noEmit
```

## Build passa, mas rota quebra em runtime

### Sintoma

`npm run build` passa, mas uma página quebra no navegador.

### Causas comuns

- import ausente;
- variável global inexistente;
- branch com cache antigo no navegador;
- chunk antigo em produção;
- problema de RLS que só aparece com usuário real.

### Correção

1. Reproduzir em aba anônima.
2. Limpar cache do navegador.
3. Verificar console.
4. Procurar símbolo citado no erro.
5. Rodar typecheck.

## Fato histórico sem arquivo não salva

### Sintoma

Erro ao salvar registro sem upload em `/arquivos-historicos`.

### Causa provável

Migration `20260622170000_allow_historical_facts_without_file.sql` não aplicada no Supabase remoto.

### Correção

Verificar se estes campos aceitam nulo:

- `url`;
- `storage_bucket`;
- `storage_path`;
- `mime_type`.

## Fato aparece como Arquivo na timeline

### Sintoma

Registro sem upload aparece com badge `Arquivo`.

### Causa

A lógica que identifica presença de arquivo deve verificar `url` preenchida.

### Regra correta

- `url` vazia/nula → `Fato`;
- `url` preenchida → `Arquivo`.

## IA gera texto curto demais

### Sintoma

Mini Bio/Curiosidades abaixo de 300 caracteres quando havia dados suficientes.

### Causa possível

- questionário pobre;
- prompt não reforçado;
- limite backend antigo de 300;
- frontend ainda truncando em 300.

### Regra atual

- limite máximo: 500;
- alvo: 400–450 caracteres.

Verificar:

- `MAX_PROFILE_TEXT_LENGTH`;
- `limitText` em `api/ai.ts`;
- prompt do backend;
- contador visual.

## IA trata `Nostálgico` como pessoa falecida

### Sintoma

Selecionar `Nostálgico` com toggle memorial em `Não` gera texto como falecido.

### Regra correta

`Nostálgico` é apenas um tom. Memorial depende de:

```text
Você está escrevendo o perfil de uma pessoa falecida? = Sim
```

## Pessoa falecida com tom não nostálgico gera texto no presente

### Sintoma

Toggle memorial em `Sim`, mas texto usa presente/primeira pessoa.

### Regra correta

Qualquer tom deve respeitar memorial quando o toggle estiver ativo:

- terceira pessoa;
- passado;
- respeito;
- sem falar como se a pessoa estivesse viva.

## Pets aparecem em Filhos

### Sintoma

Pet aparece no grupo `Filhos`.

### Causa provável

Normalização não está aplicando `isPetPerson` ou `humano_ou_pet` não veio como `Pet`.

### Regra correta

- `humano_ou_pet === 'Pet'` → grupo Pets;
- humano → grupo humano correspondente.

## “Irmão(a)” aparece para mulher

### Sintoma

Pessoa feminina aparece como `Irmão(a)`.

### Correção

Verificar normalização de gênero e função de label de relacionamento.

Regra:

- mulher → `Irmã`;
- homem → `Irmão`;
- desconhecido → label genérico aceitável.

## Botões duplicados em grupos vazios

### Sintoma

Aparece botão superior e botão inferior `Adicionar filho/pet/cônjuge`.

### Regra correta

No onboarding atual, manter apenas o botão superior.

## Header mostra Favoritos/Notificações no onboarding

### Sintoma

Páginas de onboarding exibem ações no header.

### Rotas afetadas

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

### Regra correta

Header sem ações nessas rotas.

## `Cadastrados` incorreto no mapa

### Sintoma

Card `Cadastrados` mostra número artificial ou sempre 1.

### Regra correta

Usar `user_person_links`, deduplicando `pessoa_id`. Não usar fallback silencioso para 1.

## Problemas após deploy

### Ações recomendadas

1. Confirmar commit no branch correto.
2. Confirmar deploy do commit correto.
3. Limpar cache/CDN se necessário.
4. Abrir em aba anônima.
5. Conferir migrations no Supabase.
6. Conferir RLS com usuário real.
