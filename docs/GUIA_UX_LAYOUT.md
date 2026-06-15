# Guia de UX e Layout — Árvore Família

> Última revisão: 2026-06-14
> Local canônico: `docs/GUIA_UX_LAYOUT.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: guia de experiência, layout e responsividade
> Status: revisado para documentar comportamento visual vigente e separar pendências técnicas de contrato de UX.

---

## 1. Objetivo

Este documento registra decisões de experiência e layout.

Use para revisar:

- navegação entre views;
- shell da Home;
- painel desktop;
- modal mobile;
- cards;
- conectores;
- paletas;
- calendário;
- exportação;
- QA visual.

Não use este arquivo como inventário técnico; para isso, consulte `INVENTARIO_TECNICO.md`.

---

## 2. Princípios de UX

| Princípio | Regra prática |
|---|---|
| Clareza | Ações devem ter rótulos explícitos e previsíveis. |
| Continuidade | Preservar pessoa central, query params e retorno de perfil. |
| Escopo | Ajuste visual deve ser restrito ao container correto. |
| Consistência | Desktop é referência visual; mobile adapta interação e escala. |
| Separação | UI não substitui guard, RLS, service ou migration. |
| Histórico controlado | Docs históricos não reabrem rotas ou padrões removidos. |
| Exportação limpa | Captura não deve incluir controles, debug ou overlays transitórios. |

Anti-padrões:

```txt
Reintroduzir /minha-arvore, /genealogia ou /visao-completa como views.
Usar /visao-completa como sinônimo da horizontal.
Restaurar a barra Filtros | Legendas | Ações.
Usar cores hardcoded no mobile como fonte da verdade visual.
Usar seletor global svg path.
Corrigir layout criando dados fictícios.
Exibir microcopy de dado ausente em card compacto mobile.
```

---

## 3. Navegação da árvore

Views oficiais:

| View | Rota | Papel |
|---|---|---|
| Árvore Familiar | `/mapa-familiar` | principal/default |
| Mapa Genealógico | `/mapa-familiar-horizontal` | horizontal por gerações |

Comportamento:

```txt
/ -> /mapa-familiar
```

preservando query string.

A alternância Vertical/Horizontal deve preservar:

```txt
?pessoa=...
?voltar=...
outros search params relevantes
```

Rotas removidas como views:

```txt
/minha-arvore
/genealogia
/visao-completa
```

Exceção:

```txt
/minha-arvore/editar
```

---

## 4. Shell visual da Home

Elementos:

- `HomeHeader`;
- área da árvore;
- painel lateral desktop;
- modal mobile de controles;
- bottom nav mobile;
- overlays de exportação/loading;
- modais auxiliares;
- debug temporário, quando habilitado.

Regras:

- header deve permanecer estável;
- avatar não deve exibir nome/e-mail lateral fixo;
- nome/e-mail ficam no menu;
- árvore deve ocupar a área principal como canvas;
- painel, modal, bottom nav, overlays e debug não entram na exportação;
- a UI não deve perder contexto ao trocar vertical/horizontal.

---

## 5. Árvore Familiar — `/mapa-familiar`

### Desktop/tablet

Componente:

```txt
DesktopFamilyMapView
```

Características de UX:

- canvas panorâmico;
- grupos familiares;
- zoom e restauração;
- conectores;
- painel lateral;
- paletas;
- exportação;
- suporte visual a múltiplos núcleos conjugais da pessoa central quando existem dados.

### Mobile

Componente:

```txt
MobileFamilyTreeView
```

Características de UX:

- experiência segmentada;
- navegação interna Paterno/Central/Materno;
- cards compactos;
- conectores HTML/CSS;
- botão `Controles`;
- paletas herdadas do desktop.

Cards mobile:

```txt
NOME DA PESSOA
★ AAAA
✥ AAAA
```

Regras:

- nascimento aparece apenas quando houver data/ano;
- falecimento aparece apenas quando houver data/ano;
- resultado visual não deve mostrar `Nascimento não informado` nem `Falecimento não informado`;
- a implementação atual usa limpeza DOM em `src/main.tsx` para garantir esse resultado visual; a correção estrutural do componente permanece pendente.

---

## 6. Mapa Genealógico — `/mapa-familiar-horizontal`

### Desktop/tablet

Componente:

```txt
DesktopFamilyHorizontalMapView
```

Características de UX:

- colunas por geração;
- colunas vazias ocultadas;
- cônjuges adjacentes conforme suporte atual do código;
- conectores SVG;
- título `Mapa Genealógico de {primeiroNome}`;
- exportação com título e paleta.

Atenção:

```txt
Cônjuges de pais/Geração 4 não devem ser tratados como implementados até fechamento do TREE-003.
```

### Mobile

Componente:

```txt
MobileFamilyHorizontalMapView
```

Contrato:

```txt
1 geração = 1 tela
botões Ger X = atalhos
swipe lateral = troca de geração
scroll vertical = navegação dentro da geração
sem scroll horizontal manual como navegação principal
```

Regras:

- não usar barra Paterno/Central/Materno;
- não criar subrotas por geração;
- não usar setas laterais como navegação principal;
- bottom nav e safe area devem permanecer estáveis;
- botão de controles deve conviver com a linha `Ger X`;
- paletas não azuis não podem cair em fallback azul.

---

## 7. Painel desktop

Estado vigente:

| Área | Comportamento |
|---|---|
| Topo/controles | Zoom, Restaurar, Vertical, Horizontal, Cores, Exportar, Destacar |
| Filtros | Grupos diretos e status visíveis sem aba |
| Ações secundárias | Flyouts específicos |
| Legendas | Não são aba persistente |

A barra abaixo não é UI vigente:

```txt
Filtros | Legendas | Ações
```

Regras:

- painel não entra na exportação;
- botão ativo deve refletir a rota;
- `Restaurar visualização` não é sinônimo de `Zoom -`;
- cards do painel devem seguir a linguagem visual da paleta ativa;
- estado inativo deve reduzir ênfase sem perder legibilidade.

---

## 8. Modal mobile de controles

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Comportamento:

- abre pelo botão `Controles`;
- título: `Controles`;
- sem subtítulo;
- botão superior direito com `X`;
- overlay fecha;
- `Escape` fecha quando disponível;
- body fica travado;
- conteúdo interno rola;
- modal não entra na exportação.

Controles visíveis:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros
```

Não exibir:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Regra de layout:

- `Grupos` abre/fecha cards de grupos;
- grupos não aparecem por padrão;
- filtros permanecem sempre visíveis;
- filtros devem caber em layout compacto, preferencialmente quatro colunas.

---

## 9. Paletas

Paletas:

| Nome | Chave |
|---|---|
| Branca | `white` |
| Visual/Azul | `visual` |
| Laranja | `orange` |
| Marrom | `brown` |

Regras:

- paleta altera CSS variables/tokens;
- paleta não altera dados;
- desktop é referência;
- mobile deve consumir o mesmo contrato visual;
- ícones internos não devem herdar estilos globais de conectores;
- exportação deve preservar paleta ativa;
- CSS novo deve ser escopado.

---

## 10. Cards e avatares

Contratos:

| Caso | UI |
|---|---|
| Pessoa com foto | imagem real |
| Pessoa sem foto | `User` |
| Pet | `PawPrint` |

Regras:

- não diferenciar avatar sem foto por gênero;
- preservar contraste;
- manter crop estável;
- datas só aparecem quando existem;
- nomes devem permanecer legíveis em cards compactos;
- estado selecionado/destaque não pode apagar informação principal.

---

## 11. Conectores

Regras gerais:

- conector deve representar relação explícita;
- não inferir casamento por proximidade visual;
- não usar seletor global que afete ícones;
- conectores devem seguir paleta ativa;
- conectores devem continuar visíveis na exportação.

Por view:

| View | Regra |
|---|---|
| Vertical desktop | SVG por âncoras e grupos. |
| Vertical mobile | HTML/CSS alinhado à hierarquia visual. |
| Horizontal desktop | casal → filhos por geração. |
| Horizontal mobile | conectores da geração ativa e scroll vertical até o fim visual. |

---

## 12. Calendário familiar

Rota:

```txt
/calendario-familiar
```

UX vigente:

- categorias visuais claras;
- filtros por categoria;
- em mobile, cinco botões em linha quando possível;
- bolinha colorida acima do título;
- título do botão em uma linha;
- sem overflow horizontal desnecessário.

Categorias:

```txt
Aniversário
Casamento
Falecimento
Outros
Reunião
```

---

## 13. Exportação

Regras de UX:

- exportar sem header/painel/modal/bottom nav/debug;
- manter título;
- manter paleta;
- preservar conectores e cards;
- mostrar loading enquanto a ação real ocorre;
- erro de tamanho deve orientar o usuário a reduzir zoom ou usar área.

Ações:

```txt
Área
Imagem
PDF
Imprimir
```

---

## 14. Debug temporário

`Visualizar como...` é ferramenta de QA/debug.

Regras:

- não tratar como fluxo final;
- não entrar na exportação;
- não persistir dados reais;
- decisão de manter/remover/flagar fica no `PLANO_PROXIMOS_PASSOS.md`.

---

## 15. Breakpoints e QA visual

Testar, no mínimo:

```txt
320px
375px
390px
430px
768px
1366px
1440px
1536px
1920px
```

Superfícies obrigatórias:

```txt
/mapa-familiar
/mapa-familiar-horizontal
/calendario-familiar
/pessoa/:id
/forum
/notificacoes
/admin
```

---

## 16. Critério de aceitação

Uma mudança de layout só deve ser aceita quando:

- não reativa rotas removidas;
- não quebra alternância Vertical/Horizontal;
- não perde query string;
- não altera dados para resolver visual;
- não captura UI transitória na exportação;
- preserva paletas em desktop e mobile;
- passa em `npm run build`;
- passa nos testes aplicáveis;
- foi validada visualmente nos breakpoints relevantes.
