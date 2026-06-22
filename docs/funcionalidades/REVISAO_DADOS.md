# Revisão de Dados

Última revisão: 2026-06-22

## Objetivo

`/revisao-dados` consolida as informações preenchidas durante o onboarding antes de confirmar o perfil e seguir para o mapa familiar.

## Contratos atuais

- Deve ler dados pessoais, vínculos, redes sociais, privacidade e fatos/arquivos históricos.
- Deve considerar rascunhos de `/meus-vinculos`, incluindo `pets` separados de `filhos`.
- Deve exibir fatos históricos mesmo quando não houver anexo.
- Deve diferenciar registros históricos em `Fato sem arquivo`, `Imagem` e `PDF`.
- Para pessoa falecida, fluxos de preferências/notificações são pulados conforme regra já consolidada.
- Header da página não exibe ações à direita durante o onboarding.

## Pontos de QA

1. Pessoa viva com filhos, pets e cônjuge.
2. Pessoa falecida sem passar por `/preferencias`.
3. Fato histórico sem arquivo.
4. Arquivo histórico com imagem.
5. Arquivo histórico com PDF.
6. Rascunho de vínculos com pet não deve aparecer em filhos.
