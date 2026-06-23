# Arquitetura

> Última revisão: 2026-06-22

## Camadas

```text
React/Vite UI
  ↓
Services de domínio
  ↓
Supabase Auth / DB / Storage / RLS
  ↓
APIs serverless, incluindo api/ai.ts
```

## Frontend

- Páginas de membro ficam em `src/app/pages`.
- Componentes compartilhados ficam em `src/app/components`.
- Services ficam em `src/app/services`.
- Tipos centrais ficam em `src/app/types`.
- Utilitários ficam em `src/app/utils`.

## Backend/Supabase

Supabase provê:

- autenticação;
- tabelas relacionais;
- RLS;
- storage público para arquivos;
- RPCs/policies administrativas;
- migrations versionadas.

## IA

Endpoint:

```text
api/ai.ts
```

Uso atual:

- geração de Mini Bio;
- geração de Curiosidades.

Contrato de segurança:

- sanitizar contexto client-side;
- sanitizar novamente server-side;
- não enviar dados sensíveis;
- retornar JSON válido;
- aplicar limite de 500 caracteres no backend.

## Onboarding

Fluxo:

```text
/meus-dados → /meus-vinculos → /arquivos-historicos → /preferencias → /revisao-dados → /mapa-familiar
```

Pessoa falecida pula `/preferencias`.

## Dados de perfil

Tabela central:

```text
pessoas
```

Campos relevantes:

- dados básicos;
- falecimento;
- profissão;
- foto;
- Mini Bio;
- Curiosidades;
- contatos;
- permissões de privacidade;
- `humano_ou_pet`.

## Questionário IA

Tabela:

```text
person_profile_questionnaire_answers
```

Responsável por:

- tom;
- badges selecionados;
- perguntas geradas;
- respostas;
- modo memorial;
- hash da última geração salva.

## Vínculos

Tabelas:

- `relacionamentos`;
- `relationship_change_requests`;
- `user_person_links`.

Contrato:

- membros propõem alterações;
- alterações entram como solicitação pendente;
- admin/regras futuras aprovam/rejeitam;
- `user_person_links` identifica perfis cadastrados por usuários.

## Pets

Pets são pessoas com:

```text
humano_ou_pet = 'Pet'
```

Não exigem tabela separada.

## Fatos e Arquivos Históricos

Tabela:

```text
arquivos_historicos
```

Contratos:

- arquivo é opcional;
- registro pode ser fato sem arquivo;
- storage fields podem ser nulos;
- timeline consome a mesma fonte.

## Timeline

Builder:

```text
src/app/utils/buildPersonTimeline.ts
```

Componente:

```text
src/app/components/Timeline/PersonTimeline.tsx
```

Fontes:

- pessoa;
- relacionamentos;
- filhos;
- arquivos/fatos históricos;
- eventos pessoais;
- eventos familiares.

## Mapa familiar

A arquitetura do mapa tem duas partes:

- componentes React principais;
- scripts mobile complementares carregados em `index.html`.

Regra: não modificar scripts mobile nem `index.html` fora de frente dedicada.

## Build e validação

Comando mínimo:

```bash
npm run build
```

Recomendado:

```bash
npx tsc --noEmit
```

## Riscos arquiteturais

- excesso de correções mobile via DOM/script;
- ausência de typecheck obrigatório;
- RLS divergente entre local/produção;
- docs e código ficarem fora de sincronia;
- IA receber contexto demais sem sanitização.
