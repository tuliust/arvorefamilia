# Painel de Visualização mobile

> Última revisão: 2026-06-20  
> Local: `docs/funcionalidades/PAINEL_VISUALIZACAO_MOBILE.md`  
> Escopo: janela aberta pelo botão `+` no mobile em `/mapa-familiar` e `/mapa-familiar-horizontal`.

---

## 1. Nome da área

Nome funcional:

```txt
Painel de Visualização mobile
```

Nome de UI:

```txt
Visualização
```

A janela é aberta pelo botão superior `+` e possui:

- seletor de família/pessoa visualizada;
- alternância entre `Linha Geracional` e `Árvore Familiar`;
- paleta de cores;
- resumo numérico;
- grupos familiares;
- filtros de cônjuges.

---

## 2. Resumo

Cards do resumo:

| Card | Regra |
|---|---|
| `Pessoas` | total de pessoas humanas da árvore, com fallback para total geral quando necessário |
| `Vivos` | pessoas humanas sem status de falecimento |
| `Falecidos` | pessoas humanas marcadas como falecidas ou com data de falecimento |
| `Cadastrados` | quantidade de usuários/pessoas com cadastro na plataforma, calculada por vínculos em `user_person_links.user_id`, com fallback para `profiles` quando necessário |

Regra importante:

```txt
Cadastrados não é o total de pessoas da árvore.
Cadastrados é a quantidade de usuários/pessoas com conta/vínculo de cadastro na plataforma.
```

Implementação complementar:

```txt
src/mobileVisualizationPanelFamilyStatsFix.ts
```

---

## 3. Grupos familiares

Os grupos devem exibir números referentes aos parentes da pessoa atualmente ligada/visualizada.

A pessoa central é resolvida nesta ordem:

1. parâmetro `?pessoa=` da URL;
2. valor selecionado no seletor do painel;
3. pessoa principal vinculada ao usuário logado em `user_person_links`;
4. primeira pessoa humana carregada como fallback.

---

## 4. Abas e grupos

### Núcleo

| Grupo | Conteúdo |
|---|---|
| `Pais` | pai e mãe da pessoa central |
| `Cônjuges` | cônjuges da pessoa central |
| `Irmãos` | irmãos da pessoa central |
| `Filhos` | filhos humanos da pessoa central |

### Ascendentes

| Grupo | Conteúdo |
|---|---|
| `Avós` | avós paternos e maternos |
| `Bisavós` | bisavós paternos e maternos |
| `Tataravós` | tataravós paternos e maternos |

### Colaterais

| Grupo | Conteúdo |
|---|---|
| `Tios` | tios paternos e maternos |
| `Primos` | primos paternos e maternos |
| `Sobrinhos` | filhos dos irmãos da pessoa central |

---

## 5. Interação esperada

Ao tocar em um grupo familiar:

- o botão do grupo expande;
- abaixo do botão aparece uma lista com os nomes das pessoas daquele grupo;
- tocar novamente no mesmo botão recolhe a lista;
- trocar entre `Núcleo`, `Ascendentes` e `Colaterais` recolhe a lista aberta;
- quando não houver pessoas no grupo, aparece uma mensagem de estado vazio.

Exemplo:

```txt
Pais — 2
- Nome do pai
- Nome da mãe
```

---

## 6. Arquivo complementar ativo

```txt
src/mobileVisualizationPanelFamilyStatsFix.ts
```

Responsabilidades:

- atualizar o número do card `Cadastrados`;
- recalcular contagens dos grupos familiares com base na pessoa central;
- permitir expansão dos grupos para listar nomes;
- manter a correção aplicada mesmo após re-render do painel;
- evitar loop de `MutationObserver` durante a aplicação dos ajustes no DOM.

---

## 7. QA mínimo

Validar no Safari/iOS:

- [ ] abrir o botão `+` em `/mapa-familiar`;
- [ ] abrir o botão `+` em `/mapa-familiar-horizontal`;
- [ ] `Cadastrados` não repete o total de pessoas da árvore;
- [ ] `Pais` mostra 2 quando há pai e mãe;
- [ ] tocar em `Pais` lista os nomes abaixo;
- [ ] trocar para `Ascendentes` recolhe a lista aberta;
- [ ] tocar em `Avós`, `Bisavós`, `Tios`, `Primos` e `Sobrinhos` mostra nomes ou estado vazio;
- [ ] fechar o painel destrava a página;
- [ ] não há piscada/loop visual após abrir uma lista.
