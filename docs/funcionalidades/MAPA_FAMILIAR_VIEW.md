# Mapa Familiar View

> Última revisão: 2026-06-22  
> Escopo: `/mapa-familiar` após Prompt 6A.

## Objetivo

A tela `/mapa-familiar` apresenta a árvore familiar com painel lateral, filtros, tour e visualização desktop/mobile.

## Ajustes implementados no Prompt 6A

- Dropdown do painel desktop com label `Família de X`.
- Pessoa central/visualizada usada como base do label.
- Seleção manual por `?pessoa=` preservada.
- Card `Cadastrados` baseado em `user_person_links`.
- Tour revisado.
- Layout compacto para árvore pequena e simples.

## Dropdown `Família de X`

### Regra

Quando houver pessoa vinculada/central:

```text
Família de Leonardo
Família de Tulius
Família de Tomás
```

Evitar label genérico como `Sua view padrão` quando há pessoa identificada.

## Card `Cadastrados`

### Fonte

Usar `user_person_links`, deduplicando `pessoa_id`.

### Não fazer

- Não usar fallback silencioso para `1`.
- Não contar pessoa sem vínculo de usuário como cadastrada.

Se RLS impedir leitura completa, registrar limitação e avaliar RPC/policy.

## Tour

### Etapas relevantes

- `Perfis, vínculos e memórias` com posicionamento seguro.
- `Inteligência artificial e datas importantes` para Curiosidades/Calendário.
- `Guarde os seus destaques` para Favoritos/estrela.

## Layout compacto

### Aplicação

Somente no desktop vertical (`DesktopFamilyMapView`) para árvore pequena e simples.

### Não aplicar quando houver

- múltiplos ramos;
- múltiplos pais/cônjuges/filhos complexos;
- árvore extensa;
- layout mobile.

## Proteções

Não alterar sem frente explícita:

- `src/mobileFamilyMap*.ts`;
- `src/mobileFamilyTree*.ts`;
- `src/staticMobileFamilyTreeScreens.ts`;
- `src/firstLoginMobileTutorialFixes.ts`;
- `index.html`.

## QA mínimo

1. Abrir `/mapa-familiar`.
2. Confirmar dropdown `Família de X`.
3. Trocar pessoa via seletor/query e confirmar label.
4. Conferir card `Cadastrados`.
5. Abrir `?tutorial=1`.
6. Validar etapa de Favoritos.
7. Validar árvore pequena compacta.
8. Validar árvore complexa sem compactação indevida.
9. Conferir mobile sem regressão.
