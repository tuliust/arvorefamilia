# Ajustes do fluxo de cadastro

Plano de implementação para o fluxo em três etapas:

1. `/meus-dados` — dados pessoais, contato, endereço, mini bio e curiosidades.
2. `/meus-vinculos` — vínculos familiares.
3. `/revisao-dados` — revisão, arquivos históricos, notificações e permissões.

Pendências principais:
- corrigir `avatarSource` em `src/app/pages/MeusVinculos.tsx`;
- registrar rota `/revisao-dados` em `src/app/routes.tsx`;
- criar `src/app/pages/RevisaoDados.tsx`;
- reorganizar containers de `src/app/pages/MeusDados.tsx`;
- manter OpenAI no backend via `api/ai.ts`, sem chave no frontend.
