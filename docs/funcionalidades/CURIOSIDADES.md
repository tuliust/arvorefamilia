# Curiosidades

> Tipo: documentação inicial da página `/curiosidades`.
> Status: estrutura inicial criada com placeholders funcionais.

## Escopo desta fase

A página `/curiosidades` reúne a estrutura inicial para uma experiência dedicada a descobertas, números, memórias e conexões familiares.

Nesta etapa, a implementação é apenas estrutural:

- rota protegida `/curiosidades`;
- página principal `src/app/pages/Curiosidades.tsx`;
- componentes separados em `src/app/pages/curiosidades/`;
- cards de placeholder com estados `Em breve` ou `Aguardando dados familiares`;
- sem cálculos complexos, persistência, novas integrações de IA, gráficos reais ou alterações de banco.

## Seções previstas

- Hero;
- Big numbers;
- Hoje na família;
- Você Sabia?;
- Gerações da família;
- Bodas e vínculos;
- Descubra mais sobre...;
- Pergunte à IA;
- Conexões familiares;
- Teste seus conhecimentos;
- Rota da família;
- Comparar interesses;
- Mural da família;
- Astrologia da família.

## Contratos de navegação

A página usa `MemberPageHeader`.

Em `/curiosidades`, o atalho padrão de Curiosidades do header não é exibido para evitar navegação redundante. O primeiro botão disponível no header continua sendo `Árvore Familiar`, apontando para `/mapa-familiar`.

O modal atual de Curiosidades da Home não foi removido nem reescrito.

