# Guia de correção de erros

> Última revisão: 2026-06-23

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
npm run typecheck
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
5. Rodar `npm run typecheck`.

## Typecheck falha, mas build passa

### Sintoma

`npm run typecheck` acusa erro, mas `npm run build` conclui.

### Exemplo já observado

- array `readonly []` atribuído a array mutável em `profileBadgesByPersonId`;
- type predicate incompatível em bodas ajustadas.

### Regra

Não fazer commit apenas porque o build passou. O padrão mínimo é:

```bash
npm run typecheck
npm run build
git diff --check
```

## `git diff --check` aponta `new blank line at EOF`

### Sintoma

```text
new blank line at EOF
```

### Correção

Remover linhas em branco extras ao final do arquivo. Deve restar no máximo uma quebra de linha final.

### Observação

Avisos de LF/CRLF no Windows são esperados e não equivalem a erro de whitespace.

## Mojibake / acentos quebrados

### Sintoma

Strings aparecem como:

```text
FamÃ­lia
VisualizaÃ§Ã£o
cÃ´njuges
Irmăos
```

### Causa provável

Arquivo gravado com encoding errado ou reprocessado por script PowerShell sem UTF-8 adequado.

### Correção

1. Reabrir arquivo em editor com UTF-8.
2. Corrigir strings afetadas.
3. Gravar explicitamente como UTF-8.
4. Rodar:
   ```bash
   npm run typecheck
   npm run build
   git diff --check
   ```
5. Conferir no GitHub se os acentos aparecem corretamente.

### Arquivos mais sensíveis

- `src/app/pages/Home.tsx`
- `src/app/pages/home/DesktopTreeVisualizationPanel.tsx`
- `src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts`
- arquivos `.md` atualizados via script local.

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

## Dropdown do mapa lista `Família de Maria`

### Sintoma

No dropdown de visualização, opções aparecem como:

```text
Família de Maria
Família de Titus
```

### Regra correta

- campo fechado: `Família de Tulius`;
- menu aberto: `Visualize a árvore como...`;
- opções: primeiro e segundo nome, por exemplo `Maria Acileide`.

### Arquivos prováveis

- `src/app/pages/Home.tsx`
- `src/app/pages/home/DesktopTreeVisualizationPanel.tsx`

## Botão de cônjuges não alterna

### Sintoma

Botão sempre exibe:

```text
Exibir cônjuges de tios, primos etc
```

mesmo quando ativo.

### Regra correta

- se desativado: `Exibir cônjuges de tios, primos etc`;
- se ativo: `Ocultar cônjuges de tios, primos etc`.

## Dropdown de notificações corta botão inferior

### Sintoma

`Ver todas as notificações` aparece cortado ou não aparece corretamente.

### Correção

- usar largura responsiva no dropdown;
- rodapé flexível;
- botões com `flex-1`, `whitespace-normal`, `text-center` e `leading-tight`.

## Barra do fórum/favoritos curta no desktop

### Sintoma

Busca não se alinha à largura do container/cards.

### Correção

- remover `max-width` da linha de busca em desktop;
- preservar comportamento mobile.

## Problemas após deploy

### Ações recomendadas

1. Confirmar commit no branch correto.
2. Confirmar deploy do commit correto.
3. Limpar cache/CDN se necessário.
4. Abrir em aba anônima.
5. Conferir migrations no Supabase.
6. Conferir RLS com usuário real.
