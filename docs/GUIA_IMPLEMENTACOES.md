# Guia de implementações

> Última revisão: 2026-06-22  
> Escopo: comportamento implementado após 6A–7D.

## Regra geral

A documentação deve descrever o que está implementado. Pendências devem ser marcadas explicitamente como pendência. Não misturar comportamento antigo com contrato vigente.

## Prompt 6A — mapa familiar, tour e painel

### Implementado

- Dropdown do painel desktop com label `Família de X`.
- Seleção manual por query string preservada.
- Contagem `Cadastrados` baseada em `user_person_links`.
- Tour revisado:
  - IA/Calendário em uma etapa;
  - Favoritos em etapa separada.
- Layout compacto para árvore pequena e simples em `DesktopFamilyMapView`.

### Não alterado

- Scripts mobile.
- `index.html`.
- Migrations.
- `/meus-dados` e `/meus-vinculos`.

## Prompt 7A — questionário e geração de perfil

### Implementado

- Persistência do questionário em `person_profile_questionnaire_answers`.
- Hash de geração (`lastGeneratedHash`) só é atualizado após geração salva com sucesso.
- Contexto de IA sanitizado.
- Server-side também filtra contexto sensível em `api/ai.ts`.

### Regras

- Não enviar telefone, endereço, WhatsApp, redes sociais, permissões privadas, URLs, storage paths ou tokens para IA.
- Não registrar dados sensíveis em logs ou metadata.

## Prompt 7B — vínculos, pets e cônjuges

### Implementado

- Pets separados de Filhos.
- Criação de pet com `humano_ou_pet: 'Pet'`.
- Pessoa humana não entra em Pets.
- Pet não entra em Filhos.
- Cônjuges normalizados para no máximo um ativo.
- Badge `Cadastrado`/`Pré-cadastrado` baseado em `user_person_links`.
- Alterações continuam como solicitações pendentes.

### Regras

- Não criar relacionamento definitivo direto no fluxo de membro.
- Não duplicar pessoa entre pai/mãe/pet/filho.

## Prompt 7C — fatos e arquivos históricos na timeline

### Implementado

- `arquivos_historicos` aceita registros sem arquivo após migration.
- Upload é opcional.
- `/arquivos-historicos` permite fato sem arquivo, imagem e PDF.
- `/revisao-dados` diferencia os três tipos.
- Timeline do perfil exibe fatos e arquivos.
- Fato sem arquivo aparece como `Fato`.
- Arquivo com anexo aparece como `Arquivo`.

### Migration

```text
supabase/migrations/20260622170000_allow_historical_facts_without_file.sql
```

Campos que podem ser nulos:

- `url`;
- `storage_bucket`;
- `storage_path`;
- `mime_type`.

## Prompt 7D — UX final do onboarding

### Implementado em `/meus-dados`

- Etapa 1: `Qual é o seu estilo?`
- Remoção das etapas 9 e 10.
- Última etapa sem botão `Avançar`.
- Toggle: `Você está escrevendo o perfil de uma pessoa falecida?`
- `Nostálgico` deixou de ser gatilho de memorial.

### Implementado na IA

- Limite de 500 caracteres por campo.
- Geração de 400–450 caracteres por campo.
- Evita início redundante com nome da pessoa.
- Pode considerar dados estruturados seguros.

### Implementado em `/meus-vinculos`

- Remoção do botão `Salvar textos`.
- Salvamento no avanço da página.
- Título `Sobre mim` fora do box.
- Título `Familiares de X` fora do container.
- Botões inferiores de adicionar removidos.
- Label feminina `Irmã`.

### Implementado nos headers

Sem ações no header em:

- `/meus-dados`;
- `/meus-vinculos`;
- `/arquivos-historicos`;
- `/preferencias`;
- `/revisao-dados`.

## Hotfix MapPin

### Problema

`ReferenceError: MapPin is not defined` em `/meus-dados`.

### Causa

`MapPin` era usado, mas não estava importado de `lucide-react`.

### Correção

Adicionar `MapPin` ao import em `MeusDados.tsx`.

### Lição

`npm run build` com Vite pode passar mesmo com erro de referência em runtime. Recomenda-se typecheck explícito.

## Checklist de implementação futura

Antes de qualquer frente:

1. Rodar `git status --short`.
2. Confirmar branch.
3. Isolar escopo.
4. Evitar alterar scripts mobile sem pedido explícito.
5. Rodar `git diff --check`.
6. Rodar `npm run build`.
7. Idealmente rodar `npx tsc --noEmit`.
8. Testar rota afetada no navegador.
