# Ajustes do mapa familiar mobile — rodada 2026-06-21

> Última revisão: 2026-06-21  
> Local: `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_21.md`  
> Escopo: registro consolidado dos ajustes realizados em `/mapa-familiar` e `/mapa-familiar-horizontal` mobile durante a rodada de correções visuais, filtros, Zoom e mapa completo.  
> Status: histórico técnico. O contrato vigente deve ser lido em `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md` e nos guias canônicos.

---

## 1. Objetivo

Este documento preserva a rastreabilidade da sequência de ajustes feitos nos mapas familiares mobile.

A rodada concentrou-se em:

- compactação e centralização dos grupos de tios;
- conectores laterais e verticais de tios para pai/mãe e primos;
- correção do Zoom/overview de `/mapa-familiar`;
- estabilização da tela `descendants`;
- separação funcional dos filtros mobile de cônjuges;
- exibição/ocultação de cônjuges estendidos;
- diferenciação tonal dos cards de cônjuges;
- criação do botão **Exibir mapa completo**;
- substituição da grade 3x3 do mapa completo por um mosaico único conectado.

---

## 2. Arquivos criados ou alterados

### 2.1 Código e scripts auxiliares

| Arquivo | Papel na rodada |
|---|---|
| `src/mobileFamilyMapCoreConnectorFix.ts` | controla cleanup de conectores antigos e desenha conectores laterais/verticais dos grupos de tios. |
| `src/styles/mobile-family-map-branch-connectors-final.css` | compacta grupos de tios, centraliza painéis e define fallback CSS para conectores. |
| `src/mobileFamilyMapZoomOverviewVisualFix.ts` | ajusta cards do Zoom, remove subtítulos, adiciona ícone central e compacta títulos. |
| `src/mobileFamilyMapDescendantsStabilityLock.ts` | estabiliza `descendants` e pausa o lock enquanto o Zoom está aberto. |
| `src/app/components/FamilyTree/mobileFamilyTreeModel.ts` | inclui cônjuges estendidos nos grupos mobile suportados. |
| `src/mobileFamilyMapExtendedSpouseCards.ts` | marca cônjuges estendidos no DOM, expande grupos com **Ver todos** e aplica tom visual próprio. |
| `src/mobileFamilyMapFilterButtonsBehaviorFix.ts` | separa comportamento dos botões **Exibir cônjuges...** e **Apenas meus familiares**. |
| `src/styles/family-map-horizontal-spouse-tone.css` | aplica tons próximos, mas distintos, para cards de cônjuges na vertical e horizontal mobile. |
| `src/mobileFamilyMapFullOverview.ts` | cria o botão **Exibir mapa completo**, abre overlay com pinça/arraste e monta mosaico único. |
| `src/mobileFamilyMapFullOverviewMosaicFix.ts` | refinamento complementar do mosaico: busca exata de avós, inclusão de filhos/netos e conectores extras. |
| `index.html` | carrega os scripts auxiliares da rodada. |

### 2.2 Observação sobre abordagem

A maioria dos ajustes foi feita em camadas auxiliares de DOM/CSS por ser uma frente de correção incremental no mobile. Isso mantém baixo risco imediato, mas aumenta a dívida técnica. O refactor recomendado é migrar comportamentos estabilizados para React/hooks.

---

## 3. Tios paternos e maternos

### 3.1 Problemas tratados

- áreas coloridas residuais ao lado ou abaixo dos grupos;
- grupos altos ou largos demais;
- falta de conectores visuais entre tios e pai/mãe;
- falta de conectores verticais entre tios e primos;
- conectores antigos duplicados ou cortados;
- necessidade de linhas verticais descendo até o final da tela.

### 3.2 Contrato visual resultante

| Tela | Contrato |
|---|---|
| `paternal-uncles` | grupo centralizado; linha horizontal sai da direita do grupo em direção ao card do pai; linha vertical sai da parte inferior do grupo até o fim da tela em direção a `paternal-cousins`. |
| `maternal-uncles` | grupo centralizado; linha horizontal sai da esquerda do grupo em direção ao card da mãe; linha vertical sai da parte inferior do grupo até o fim da tela em direção a `maternal-cousins`. |

### 3.3 Implementação

- conectores nativos antigos são marcados/ocultados;
- conectores controlados recebem `data-mobile-uncle-branch-connector`;
- fallback CSS usa pseudo-elementos para garantir renderização no Safari/iOS;
- `mobile-family-map-branch-connectors-final.css` compacta cards, títulos e painéis.

---

## 4. Zoom/overview de `/mapa-familiar`

### 4.1 Ajustes visuais

A janela aberta pelo botão **Zoom** passou a ter:

- títulos menores;
- letter-spacing reduzido;
- menor espaçamento horizontal entre cards;
- remoção de subtítulos como **Ancestrais profundos**;
- ícone central entre título e badge de contagem;
- badge de pessoas preservada;
- tratamento específico para manter **DESCENDENTES** em uma linha quando possível.

### 4.2 Correções funcionais

Problemas tratados:

- cards abrindo telas incorretas quando o usuário estava em `descendants`;
- tela `descendants` tremendo ao abrir Zoom;
- lock de transform competindo com o overlay.

Solução:

- `mobileFamilyMapDescendantsStabilityLock.ts` pausa o lock quando `mobile-family-tree-overview-mode` está aberto;
- `mobileFamilyMapZoomOverviewVisualFix.ts` libera o lock antes da navegação pelo card.

---

## 5. Filtros mobile de cônjuges

### 5.1 Separação funcional

Os botões de filtros mobile passaram a ter funções distintas:

| Botão | Estado/ação atual |
|---|---|
| **Exibir cônjuges de tios, primos etc** | toggle real. Ativado exibe cônjuges estendidos; desativado oculta esses cards. |
| **Apenas meus familiares** | sempre ativo visualmente; por enquanto sem ação funcional. |

### 5.2 Escopo de cônjuges estendidos

O toggle afeta os grupos:

- tios;
- primos;
- sobrinhos;
- filhos;
- netos;
- irmãos, quando aplicável à tela técnica do core.

### 5.3 Implementação

- estado persistido em `localStorage` na chave `arvorefamilia:mobile-family-map:show-extended-spouses`;
- escopo exposto no HTML por `data-mobile-family-spouse-scope="extended|direct"`;
- cards de cônjuge marcados com `data-family-map-extended-spouse-card="true"` e `data-family-map-spouse-tone="true"`;
- `family-map-horizontal-spouse-tone.css` aplica tons próximos, mas distintos, ao card do cônjuge.

---

## 6. Cônjuges estendidos no modelo mobile

### 6.1 Problemas tratados

- cônjuges como Ildo, Maria Nubia, Monika e Enildes não apareciam ou não eram marcados corretamente;
- grupos com botão **Ver todos** podiam ocultar membros, como Mário em `Tios Paternos`;
- cônjuges ficavam com a mesma cor do parente principal.

### 6.2 Contrato resultante

- o modelo mobile pode intercalar cônjuges após o parente âncora;
- grupos suportados são expandidos automaticamente quando houver **Ver todos**;
- cônjuges recebem tom próprio próximo ao tom do grupo;
- ocultação via filtro não remove dados, apenas esconde cards.

---

## 7. Mapa completo em tela única

### 7.1 Entrada

Na janela de **Zoom / Visão geral** de `/mapa-familiar`, foi adicionado o botão:

```txt
Exibir mapa completo
```

### 7.2 Primeira versão

A primeira versão abriu os 9 grupos em uma grade 3x3 com pinça e arraste.

### 7.3 Versão refinada

Depois, a visualização foi ajustada para uma tela única tipo mosaico, inspirada no anexo fornecido pelo usuário.

Contrato atual:

- overlay dedicado `mobile-family-map-full-overview`;
- canvas único com fundo comum;
- grupos posicionados por coordenadas absolutas;
- conectores SVG entre blocos;
- pinça para ampliar/reduzir;
- arraste com um dedo;
- botão **Reenquadrar**;
- botão de fechar;
- filhos e netos incluídos como grupos próprios;
- busca mais exata para evitar que **Avós** puxem **Bisavós** por engano.

### 7.4 Limitação técnica

O mosaico usa clones do DOM renderizado nas telas mobile. Portanto, ele depende da existência prévia das telas/grupos no DOM e de seletores estáveis.

---

## 8. Ordem de carregamento relevante

A rodada adicionou ou reforçou scripts no `index.html` após a app principal e outros guards:

```txt
mobileFamilyMapZoomOverviewVisualFix.ts
mobileFamilyMapDescendantsStabilityLock.ts
mobileFamilyMapExtendedSpouseCards.ts
mobileFamilyMapFilterButtonsBehaviorFix.ts
mobileFamilyMapFullOverview.ts
mobileFamilyMapFullOverviewMosaicFix.ts
```

Regra de manutenção:

```txt
Qualquer novo script mobile deve declarar rota, seletor raiz, atributo de escopo e risco de conflito com MutationObserver/touch handlers.
```

---

## 9. QA recomendado pós-deploy

Validar em Safari/iPhone, no mínimo:

1. `/mapa-familiar` abre normalmente no mobile.
2. `Tios Paternos`:
   - Mário aparece quando o grupo está expandido;
   - linha horizontal sai para a direita;
   - linha vertical desce até o final da tela;
   - cônjuges aparecem/ocultam pelo toggle.
3. `Tios Maternos`:
   - Monika aparece quando toggle está ativo;
   - linha horizontal sai para a esquerda;
   - linha vertical desce até o final da tela.
4. `Primos Paternos`, `Primos Maternos`, `Sobrinhos`, `Filhos` e `Netos`:
   - cônjuges estendidos aparecem quando toggle está ativo;
   - cônjuges têm tom diferente;
   - cônjuges somem quando toggle está desativado.
5. Botão **Apenas meus familiares**:
   - permanece ativo visualmente;
   - não altera exibição.
6. `Zoom`:
   - abre 9 cards;
   - `DESCENDENTES` fica em uma linha quando possível;
   - cards navegam para as telas corretas.
7. `descendants`:
   - abrir Zoom a partir dessa tela não gera tremor.
8. **Exibir mapa completo**:
   - abre tela única integrada;
   - pinça funciona;
   - arraste funciona;
   - **Reenquadrar** funciona;
   - botão fechar destrava o body.
9. `/mapa-familiar-horizontal`:
   - toggle de cônjuges respeita `data-mobile-family-spouse-scope`;
   - cônjuges marcados por `data-family-map-spouse-tone="true"` têm cor distinta.

---

## 10. Pendências e risco técnico

- Migrar lógica de DOM/CSS para componentes React quando o contrato visual estiver estável.
- Consolidar seletores de grupos em constantes compartilhadas.
- Reduzir dependência de `MutationObserver` para marcação de cônjuges e ajustes de Zoom.
- Revisar se o mosaico completo deve ter uma fonte de dados própria, em vez de clonar telas existentes.
- Executar build/testes localmente ou por CI; nesta rodada, as alterações foram aplicadas via conector GitHub e exigem validação pós-deploy.
