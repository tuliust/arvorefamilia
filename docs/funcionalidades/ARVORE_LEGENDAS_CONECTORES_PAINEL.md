# Árvore, legendas, conectores e painel

> Última revisão: 2026-06-22

## Painel desktop do mapa familiar

### Dropdown

Label padrão:

```text
Família de [Nome]
```

Deve usar a pessoa central/visualizada ou principal vinculada.

### Contagem de cadastrados

Fonte:

```text
user_person_links
```

Regras:

- deduplicar `pessoa_id`;
- não usar fallback artificial para 1;
- se RLS limitar leitura, registrar limitação.

## Cards e status

### Cadastrado

Pessoa com usuário vinculado.

### Pré-cadastrado

Pessoa existente na árvore sem usuário vinculado.

## Conectores

- Conectores devem preservar relação visual entre gerações.
- Ajustes de layout compacto não devem desconectar cards.
- Layout compacto é permitido apenas para árvore pequena e simples.

## Tour

Etapas pós-6A:

- Perfis, vínculos e memórias.
- Inteligência artificial e datas importantes.
- Guarde os seus destaques.

## Proteções mobile

Não alterar scripts mobile sem frente explícita.

## QA

1. Conferir dropdown `Família de X`.
2. Conferir contagem `Cadastrados`.
3. Conferir cards cadastrados/pré-cadastrados.
4. Conferir conectores no layout padrão.
5. Conferir conectores no layout compacto.
6. Conferir tour.
7. Conferir mobile.
