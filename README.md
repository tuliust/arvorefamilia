# Árvore Família

Aplicação web para árvore genealógica familiar, com área de membros, painel administrativo, perfis de pessoas, relacionamentos, arquivos históricos, fórum, calendário, notificações, favoritos e integrações opcionais.

Este `README.md` é a porta de entrada rápida do repositório. A documentação técnica completa fica em `docs/README.md`.

---

## Estado atual

O projeto está estruturado como uma aplicação React/Vite com persistência no Supabase.

Principais frentes consolidadas:

- árvore familiar interativa nas duas views oficiais atuais;
- **Árvore Familiar** em `/mapa-familiar`;
- **Mapa Genealógico** em `/mapa-familiar-horizontal`;
- rota raiz `/` redirecionando para `/mapa-familiar`, preservando query string;
- `/minha-arvore/editar` como rota vigente de edição do membro;
- perfis individuais de pessoas;
