# Guia de UX e Layout — Árvore Família

> Última revisão: 2026-06-16
> Local canônico: `docs/GUIA_UX_LAYOUT.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: guia de experiência, layout e responsividade
> Status: revisado para documentar comportamento visual vigente da árvore, Mini Bio/Curiosidades com IA, revisão de vínculos em largura total, onboarding condicional e revisão final editável.

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
- onboarding do membro;
- revisão final;
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

## 14. Onboarding do membro

Rotas do fluxo:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
```

### Etapa 1 — Meus dados

Regras de layout:

- os toggles `Estrangeiro` e `Exterior` devem ficar alinhados verticalmente ao campo correspondente;
- `Local de nascimento` e seu toggle formam uma linha lógica no desktop;
- `Cidade de residência` e seu toggle formam uma linha lógica no desktop;
- em mobile, o layout pode empilhar campo e toggle, desde que a associação visual continue clara.

Regras para pessoa viva:

- exibir `Cidade de residência`;
- exibir container `Contato, endereço e redes sociais`;
- não exibir campos de falecimento.

Regras para pessoa falecida:

- exibir `Dia ou Ano de Falecimento` e `Local de falecimento`;
- ocultar `Cidade de residência`;
- ocultar container `Contato, endereço e redes sociais`;
- preparar defaults de notificações e permissões para pular a Etapa 4.

Regras para Mini Bio e Curiosidades com IA:

- o botão de IA fica na seção **Sobre Mim**;
- o modal usa fluxo progressivo de 10 etapas;
- etapa 1 de tom pode usar ícones nos cards;
- etapas 2 a 8 usam cards compactos em até 3 colunas no desktop;
- cards compactos não exibem ícones internos;
- textos dos cards devem ficar centralizados e limitados visualmente a 2 linhas;
- modo **Nostálgico** adapta títulos, labels e geração para memória de pessoa falecida;
- campos gerados continuam editáveis e não são salvos automaticamente.


### Etapa 2 — Vínculos

A tela de vínculos deve funcionar como revisão guiada em largura total.

Estrutura visual vigente:

- sem botão `Voltar para meus dados` no topo;
- sem painel lateral `Resumo da revisão`;
- card superior simplificado com `Familiares de [Primeiro Nome]`;
- sem rótulo `Pessoa em revisão`;
- sem chips de nascimento/local no card superior;
- cards-resumo de `Pais`, `Filhos`, `Cônjuges` e `Irmãos` com comportamento de âncora;
- seções de vínculos em largura total;
- botão principal no rodapé da revisão.

Pluralização dos cards-resumo:

```txt
Nenhum vínculo
1 vínculo
2 vínculos
```

Cards de familiares:

- exibem avatar/iniciais, nome, relação e badge de status;
- não exibem chips de nascimento/local;
- usam botão compacto de remoção por ícone no topo direito;
- preservam ação de desfazer quando há `Remoção em análise`;
- podem exibir controles específicos, como `Outro pai/mãe` nos filhos;
- podem exibir ação `Solicitar controle do perfil` quando aplicável.

Badges de status:

| Caso | Badge |
|---|---|
| Pessoa cadastrada sem usuário vinculado | `Pré-cadastrado` |
| Pessoa com usuário/auth user vinculado | `Ativo` |
| Vínculo novo ou alterado | `Em análise` |
| Remoção solicitada | `Remoção em análise` |
| Solicitação de controle enviada | `Controle em análise` |

Busca e criação de familiar:

- antes de criar nova pessoa, o fluxo permite buscar pessoa existente;
- resultados devem ajudar a diferenciar homônimos;
- a própria pessoa em revisão não pode ser selecionada;
- pessoa já vinculada no mesmo grupo não deve ser duplicada;
- criação manual continua disponível quando a busca não encontra a pessoa correta;
- vínculo selecionado ou criado entra no fluxo como alteração em análise.

Filhos e outro pai/mãe:

- usar `Filho`, `Filha` ou `Filho(a)` conforme gênero disponível;
- não inferir gênero pelo nome;
- dropdown `Outro pai/mãe` deve tentar pré-selecionar outro responsável conhecido pelos relacionamentos existentes;
- não usar hard-code de nomes específicos.

### Etapa 3 — Arquivos históricos

Regras de UX:

- cards de categoria atualizam título e descrição da área de upload;
- título e descrição são pré-preenchidos com título/subtítulo do card;
- após adicionar arquivo, não exibir campos editáveis por padrão;
- mostrar thumbnail, título, resumo e botões compactos `Editar`/`Remover`;
- rascunho local deve preservar arquivos ao trocar aba, minimizar ou recarregar antes de salvar;
- botão principal é `Salvar e Continuar`.

### Etapa 4 — Preferências

Regras de UX:

- etapa exibida para pessoa viva;
- etapa pulada para pessoa falecida;
- não exibir botão `Salvar permissões`;
- não exibir botão `Voltar para arquivos históricos`;
- manter apenas `Continuar para a revisão`.

### Etapa 5 — Revisão final

A revisão deve funcionar como perfil de conferência, não como formulário longo.

Regras:

- topo com avatar/iniciais, nome, badge de status, profissão e residência quando aplicável;
- não exibir mini bio ao lado do nome;
- botão `Finalizar e acessar árvore` fica na área superior ao lado de `Editar perfil`;
- não exibir rodapé com `Voltar para preferências`;
- boxes devem ter botões compactos com ícone de lápis para edição inline quando aplicável;
- familiares e arquivos podem usar lápis para voltar à etapa específica;
- `Informações pessoais` não exibe `Pessoa falecida`, `Nascimento no exterior` nem `Falecimento no exterior`;
- pessoa falecida não exibe box `Notificações e permissões`.


## 15. Debug temporário

`Visualizar como...` é ferramenta de QA/debug.

Regras:

- não tratar como fluxo final;
- não entrar na exportação;
- não persistir dados reais;
- decisão de manter/remover/flagar fica no `PLANO_PROXIMOS_PASSOS.md`.

---

## 16. Breakpoints e QA visual

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

## 17. Critério de aceitação

Uma mudança de layout só deve ser aceita quando:

- não reativa rotas removidas;
- não quebra alternância Vertical/Horizontal;
- não perde query string;
- não altera dados para resolver visual;
- não captura UI transitória na exportação;
- preserva paletas em desktop e mobile;
- passa em `npm run build`;
- passa nos testes aplicáveis;
- respeita o fluxo vivo/falecido do onboarding;
- foi validada visualmente nos breakpoints relevantes.

<!-- UX-MOBILE-CONSOLIDADO-2026-06-18 -->
## PadrÃµes UX/mobile consolidados

### Inputs mobile

Inputs e textareas devem preservar fonte de pelo menos 16px no mobile para evitar auto-zoom do navegador ao focar campos. O padrÃ£o usado Ã© equivalente a:

```txt
text-base md:text-sm
```

NÃ£o usar `user-scalable=no`, `maximum-scale=1` ou bloqueios de acessibilidade.

### Steps do onboarding

Em telas pequenas, os nÃºmeros das etapas devem permanecer visÃ­veis sem scroll horizontal. Labels podem ser compactados/truncados, mas a sequÃªncia visual das etapas deve continuar compreensÃ­vel.

Breakpoints mÃ­nimos de QA visual:

- 320px
- 375px
- 390px
- 430px

### Tooltips mobile

BotÃµes de informaÃ§Ã£o devem funcionar por toque, nÃ£o apenas por hover. O comportamento esperado inclui:

- abrir/fechar por toque;
- fechar por Escape;
- fechar por clique fora;
- `aria-expanded`;
- `role="tooltip"` quando aplicÃ¡vel.

### Header e bottom nav

- Em rotas de fluxo, o header mobile pode ocultar aÃ§Ãµes laterais quando elas competem com a tarefa principal.
- Menus inferiores nÃ£o devem cobrir botÃµes primÃ¡rios, CTAs finais ou aÃ§Ãµes de salvar/continuar.
- Badges mÃ³veis devem ser discretos e nÃ£o deslocar o layout.

### ConteÃºdo em cards

Cards em mobile devem reduzir padding e espaÃ§amento sem remover informaÃ§Ã£o essencial. Blocos longos devem priorizar hierarquia, agrupamento por categoria e CTAs persistentes apenas quando necessÃ¡rios.

<!-- RODADA2-UX-2026-06-18 -->
## UX complementar â€” painel, mapas e pÃ¡ginas mobile

### Painel lateral da Ã¡rvore

- O painel lateral Ã© o centro de controle da visualizaÃ§Ã£o da Ã¡rvore.
- Deve manter largura compacta e previsÃ­vel.
- Deve evitar voltar a ocupar largura excessiva em desktop.
- Deve conter aÃ§Ãµes de visualizaÃ§Ã£o de forma agrupada e legÃ­vel.
- O seletor â€œVisualizar comoâ€ pertence ao painel/Ã¡rea de visualizaÃ§Ã£o quando essa for a decisÃ£o vigente.

### Toolbar mobile dos mapas

A toolbar mobile deve expor aÃ§Ãµes diretas:

| AÃ§Ã£o | Comportamento |
|---|---|
| VisualizaÃ§Ã£o | Abre box/dropdown de visualizador |
| Formato | Abre cards `Linha Geracional` e `Ãrvore Familiar` |
| Cor | Abre seletor compacto de paletas |
| Filtros | Abre chips/opÃ§Ãµes de filtro |
| Exportar | Abre aÃ§Ãµes `Ãrea`, `Imagem`, `PDF`, `Imprimir` |
| `+` | Abre painel mobile completo de controles |

Regras visuais:

- os botÃµes devem caber em 320px, 375px, 390px e 430px;
- popovers nÃ£o devem extrapolar a largura da tela;
- espaÃ§amento entre botÃµes deve ser uniforme;
- botÃ£o `+` deve ficar alinhado Ã  direita;
- desktop/tablet nÃ£o devem sofrer regressÃ£o.

### Favoritos mobile

- Busca e filtro devem ficar lado a lado quando possÃ­vel.
- BotÃ£o de filtro pode ser apenas Ã­cone, com `aria-label` e `title`.
- Remover favorito deve usar estrela ativa/inativa, nÃ£o lixeira, quando a metÃ¡fora for desfavoritar.

### NotificaÃ§Ãµes mobile

- Evitar card dentro de card.
- Um card branco por notificaÃ§Ã£o Ã© o padrÃ£o preferencial.
- Estado nÃ£o lido deve ser indicado por badge/borda, nÃ£o por excesso de fundos coloridos.
- AÃ§Ãµes devem ficar visÃ­veis no topo direito do card.

### CalendÃ¡rio mobile

- Filtros podem virar cards horizontais com Ã­cones.
- Nomes longos devem quebrar sem truncamento agressivo.
- Cards de memÃ³ria/falecimento devem diferenciar visualmente o contexto sem sobrecarregar a tela.

### Dicas automÃ¡ticas

- Modais informativos automÃ¡ticos no mobile nÃ£o devem bloquear o acesso inicial.
- Se houver orientaÃ§Ã£o, preferir tour contextual ou dica dispensÃ¡vel.
