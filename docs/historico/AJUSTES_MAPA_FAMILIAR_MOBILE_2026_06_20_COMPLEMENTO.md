# Histórico — complemento da navegação mobile do Mapa Familiar em 2026-06-20

> Última revisão: 2026-06-20  
> Local: `docs/historico/AJUSTES_MAPA_FAMILIAR_MOBILE_2026_06_20_COMPLEMENTO.md`  
> Tipo: registro histórico complementar  
> Status: histórico; não substitui `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md` nem `docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md`.

---

## 1. Contexto

Esta frente ocorreu após múltiplos ajustes visuais e funcionais em `/mapa-familiar` mobile, principalmente na grade de telas por grupos familiares.

Houve implementações sucessivas, parte delas com regressão visual ou funcional. Por isso, este arquivo registra o que foi tentado, o que virou contrato desejado e o que deve ser tratado como risco até estabilização.

---

## 2. Contrato desejado da grade 3x3

A matriz alvo ficou definida como:

| Posição | Tela técnica | Conteúdo |
|---|---|---|
| superior esquerda | `paternal-ancestors` | bisavós/tataravós paternos |
| superior centro | `ancestors` | avós paternos e maternos |
| superior direita | `maternal-ancestors` | bisavós/tataravós maternos |
| meio esquerda | `paternal-uncles` | tios paternos |
| meio centro | `core` | pai, mãe e pessoa central |
| meio direita | `maternal-uncles` | tios maternos |
| inferior esquerda | `paternal-cousins` | primos paternos |
| inferior centro | `descendants` | irmãos, cônjuge, pets, filhos, sobrinhos e netos |
| inferior direita | `maternal-cousins` | primos maternos |

---

## 3. Navegação desejada

| Tela atual | Permitir | Bloquear |
|---|---|---|
| `paternal-ancestors` | direita → `ancestors` | cima, baixo, esquerda |
| `ancestors` | esquerda → `paternal-ancestors`; direita → `maternal-ancestors`; baixo → `core` | cima |
| `maternal-ancestors` | esquerda → `ancestors` | cima, baixo, direita |
| `paternal-uncles` | direita → `core`; baixo → `paternal-cousins` | cima, esquerda |
| `core` | cima → `ancestors`; esquerda → `paternal-uncles`; direita → `maternal-uncles`; baixo → `descendants` | nenhuma, se houver conteúdo |
| `maternal-uncles` | esquerda → `core`; baixo → `maternal-cousins` | cima, direita |
| `paternal-cousins` | cima → `paternal-uncles` | baixo, esquerda, direita |
| `descendants` | cima → `core` | baixo, esquerda, direita |
| `maternal-cousins` | cima → `maternal-uncles` | baixo, esquerda, direita |

---

## 4. Ajustes visuais realizados ou tentados

### 4.1 Avós

- A tela `ancestors` deveria mostrar apenas avós paternos e maternos.
- Bisavós/tataravós foram removidos da tela de avós e deslocados para telas laterais.
- Linhas verticais acima dos grupos de avós foram removidas/ocultadas.
- Linhas horizontais laterais foram adicionadas:
  - avós paternos → esquerda;
  - avós maternos → direita.

### 4.2 Ancestrais profundos

- Telas `paternal-ancestors` e `maternal-ancestors` foram criadas por script auxiliar.
- Grupos foram reduzidos visualmente.
- Bordas/cards deveriam seguir a família visual dos avós.
- Linhas horizontais laterais deveriam conectar visualmente essas telas à tela de avós.

### 4.3 Tios

- Linhas verticais acima de `paternal-uncles` e `maternal-uncles` foram removidas/neutralizadas.
- Gestos inválidos foram bloqueados por `mobileFamilyTreeUncleScreenGuards.ts`.
- Houve relato posterior de navegação incorreta, indicando conflito entre guards e coordenador global.

### 4.4 Descendentes

- A área abaixo da pessoa central foi extraída para uma tela própria `descendants`.
- A tela clona o grid original de irmãos, cônjuge, pets, filhos, sobrinhos e netos.
- O retorno para `core` deve respeitar scroll interno.

---

## 5. Arquitetura atual sensível

A navegação atual envolve múltiplos scripts com listeners de touch:

```txt
src/mobileFamilyTreeNavigationRules.ts
src/mobileFamilyTreeGrandparentScreens.ts
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeUncleScreenGuards.ts
```

O contrato preferencial deve ficar em:

```txt
src/mobileFamilyTreeNavigationRules.ts
```

Os demais scripts deveriam limitar-se a:

- criar/ajustar telas auxiliares;
- corrigir conectores;
- controlar scroll interno;
- ajustar largura, cor e visibilidade;
- exibir setas/overview.

---

## 6. Risco documentado

Risco principal:

```txt
Navegação mobile não determinística por sobreposição de scripts de gesture.
```

Sintomas observados durante a rodada:

- gesto permitido não muda para a tela esperada;
- gesto bloqueado ainda muda de tela;
- linhas aparecem em telas erradas;
- tela ativa visual difere do atributo `data-mobile-family-tree-active-screen`;
- scroll interno compete com swipe global;
- patches visuais funcionam em uma tela, mas quebram outra.

---

## 7. Recomendação de estabilização

Próxima frente técnica recomendada:

1. congelar novos ajustes visuais em conectores;
2. consolidar navegação em `mobileFamilyTreeNavigationRules.ts`;
3. remover ou neutralizar navegação direta dos scripts específicos;
4. fazer `SwipeHints` e `Zoom/Overview` lerem a mesma matriz;
5. revalidar as 9 telas em Safari/iOS real;
6. só depois refinar linhas e espaçamentos.

---

## 8. Documentos canônicos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/arquitetura/MAPA_FAMILIAR_MOBILE_ARQUITETURA.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/REGRAS_DE_NAO_REGRESSAO.md
```
