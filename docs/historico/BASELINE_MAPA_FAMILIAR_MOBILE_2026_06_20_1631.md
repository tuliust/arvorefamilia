# Baseline mobile do mapa familiar — 2026-06-20 16:31

> Escopo: `/mapa-familiar` e `/mapa-familiar-horizontal` no mobile.
>
> Commit de referência antes dos ajustes seguintes: `a44fc4b2b63eaf5bc15fff956b1eca44ea88c8ad`.
>
> Esta baseline foi registrada antes da correção estrutural dos erros relatados em 2026-06-20 às 16:31.

## Estado preservado como referência

A versão atual contém os ajustes anteriores de:

- rolagem e visibilidade mobile em `/mapa-familiar`;
- tentativa de compactação dos painéis superiores `Cor` e `Filtros`;
- tentativa de abertura do botão `Zoom` por clique;
- tentativa de ajuste dos conectores de primos;
- scripts de compatibilidade mobile carregados em `index.html`.

## Erros conhecidos nesta baseline

Esta baseline **não é considerada versão final estável**. Ela foi salva para permitir comparação e rollback visual caso os próximos ajustes provoquem regressão.

Erros conhecidos:

1. `/mapa-familiar`: a linha vertical dos grupos de primos ainda não conecta ao topo do grupo.
2. `/mapa-familiar`: a tela de `Tios Paternos` ainda pode não exibir cards.
3. `/mapa-familiar-horizontal`: o botão `Zoom` ainda pode não abrir o overview e pode travar a navegação.
4. `/mapa-familiar`: o grupo `Tios Maternos` ainda tem altura excessiva.
5. `/mapa-familiar`: a tela inferior de `Irmãos`, `Cônjuge`, `Pets`, `Sobrinhos`, `Filhos` e `Netos` pode tremer por disputa entre scripts de swipe/scroll/transform.

## Regra de não regressão para próximos commits

Os próximos ajustes não devem degradar:

- exibição dos cards já visíveis em `Tios Maternos`;
- acesso ao grupo de `Primos Maternos`;
- navegação básica por swipe entre núcleo, tios e primos;
- abertura dos painéis `Formato`, `Cor` e `Filtros`;
- bottom navigation e safe area no iOS/Safari;
- estilos visuais atuais dos cards.

## Estratégia esperada para os ajustes seguintes

A correção deve reduzir a concorrência entre scripts DOM globais. A prioridade é ter apenas uma camada responsável por:

- navegação por swipe;
- `transform` do stage;
- tela inferior de descendentes;
- overview do botão `Zoom`;
- sizing de tios/primos.

Quando possível, preferir correção estrutural em React/modelo. Quando o ajuste precisar ser emergencial, manter o script novo como camada única e remover scripts conflitantes do carregamento em `index.html`.
