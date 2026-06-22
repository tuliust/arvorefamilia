# Regras de não regressão — Árvore Família

> Última revisão: 2026-06-22  
> Local canônico: `docs/REGRAS_DE_NAO_REGRESSAO.md`  
> Projeto: `tuliust/arvorefamilia`  
> Tipo: regras técnicas e contratos de prevenção de regressão  
> Status: revisado para incluir contratos dos mapas familiares mobile, overview/zoom, scroll interno, títulos de grupos e painel `+`.

---

## 1. Objetivo

Este documento define regras mínimas que não devem regredir em mudanças futuras.

Use antes de alterar:

- rotas;
- `TreeViewMode`;
- árvore;
- mapas familiares mobile;
- painel desktop;
- toolbar e painel mobile;
- paletas/CSS;
- exportação;
- favoritos/busca;
- calendário;
- guards/permissões;
- documentação.

Para execução manual de QA, use:

```txt
docs/QA_MANUAL.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
```

---

## 2. Comandos mínimos

Mudança somente documental:

```bash
git diff --check
npm run build
```

Mudança de código não visual:

```bash
git diff --check
npm run build
npm test
```

Mudança em rotas, guards, árvore, navegação, exportação ou mobile:

```bash
git diff --check
npm run build
npm test
npm run test:e2e
```

Mudança visual/CSS:

```bash
git diff --check
npm run build
npm run test:e2e
```

---

## 3. Buscas obrigatórias

Antes de fechar limpeza ou refatoração da árvore:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" docs src tests
rg "TreeViewMode|treeViewMode" docs src tests
rg "Filtros \| Legendas \| Ações" docs src
rg "MobileFamilyTreeView|MobileFamilyHorizontalMapView" docs src
rg "mobileFamilyTree|mobileFamilyMap" docs src
rg "Nascimento não informado|Falecimento não informado" docs src
rg "FILTERABLE_SPOUSE_ANCHOR_GROUPS|ANCESTOR_SPOUSE_ANCHOR_GROUPS" docs src
rg "data-tree-route-view|data-export-root|data-tree-export-ignore" docs src
```

Interpretação:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode existir como conceito textual, não como rota ativa;
- aliases antigos podem existir se apontarem para rotas atuais;
- `Nascimento não informado` pode existir como dívida técnica transitória, mas não deve aparecer no resultado visual mobile;
- documentos históricos podem conter legado se estiverem claramente marcados.

---

## 4. Rotas

### Devem permanecer

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
/minha-arvore/editar
/busca
/entrar
/termos
/privacidade
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
/vincular-perfil
/pessoa/:id
/pessoas/:id
/calendario-familiar
/meus-favoritos
/notificacoes
/ajustar-notificacoes
/forum/*
/admin/*
```

### Não devem voltar como views ativas

```txt
/minha-arvore
/genealogia
/visao-completa
```

Regras:

- `/` redireciona para `/mapa-familiar` ou login conforme guard;
- `/?pessoa=abc` preserva `?pessoa=abc`;
- `/mapa-familiar` e `/mapa-familiar-horizontal` são protegidas por fluxo de acesso à árvore;
- `/minha-arvore/editar` continua em `MemberRoute`;
- pessoa falecida deve pular `/preferencias` no fluxo normal;
- rotas antigas não renderizam views da árvore.

---

## 5. `TreeViewMode`

Deve conter apenas:

```txt
mapa-familiar
mapa-familiar-horizontal
```

Regras:

- `VIEW_MODE_TO_PATH` contém só as duas rotas oficiais;
- `PATH_TO_VIEW_MODE` contém `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`;
- fallback retorna `mapa-familiar`;
- alternância preserva `location.search`;
- nenhuma view antiga entra no tipo.

---

## 6. Renderização da árvore

Matriz obrigatória:

| Rota | Desktop/tablet | Mobile |
|---|---|---|
| `/mapa-familiar` | `DesktopFamilyMapView` | `MobileFamilyTreeView` |
| `/mapa-familiar-horizontal` | `DesktopFamilyHorizontalMapView` | `MobileFamilyHorizontalMapView` |

Regras:

- horizontal mobile usa botões `Ger X`;
- horizontal mobile não usa Paterno/Central/Materno;
- horizontal mobile não usa scroll horizontal manual como navegação principal;
- vertical mobile usa grade 3x3;
- `?pessoa=...` continua preservado.

---

## 7. `/mapa-familiar` mobile — grade 3x3

As 9 telas abaixo não devem ser removidas sem decisão explícita:

```txt
paternal-ancestors
ancestors
maternal-ancestors
paternal-uncles
core
maternal-uncles
paternal-cousins
descendants
maternal-cousins
```

Regras:

- `core` permanece como centro da grade;
- `descendants` permanece abaixo de `core`;
- `paternal-uncles` e `maternal-uncles` permanecem na linha central lateral;
- navegação por overview/zoom deve posicionar o stage na tela selecionada;
- telas com conteúdo maior que a altura útil devem permitir rolagem interna;
- safe area e bottom nav não podem impedir acesso ao último card.

Detalhes: `docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md`.

---

## 8. Tela `descendants`

Regras:

- deve permitir scroll interno quando o conteúdo exceder a altura útil;
- deve conter grupos reais, sem criar dados fictícios;
- linha superior deve ramificar para `Irmãos` e `Cônjuge` quando ambos existirem;
- `Irmãos` deve conectar a `Sobrinhos` quando houver sobrinhos;
- `Cônjuge` deve conectar a `Pets` e/ou `Filhos` conforme dados;
- se só houver `Pets`, o grupo pode ocupar sozinho a área abaixo de `Cônjuge`;
- se só houver `Filhos`, o grupo pode ocupar sozinho a área abaixo de `Cônjuge`;
- conectores antigos clonados não devem aparecer como linhas transparentes ou duplicadas.

---

## 9. Telas de tios

Regras para `paternal-uncles` e `maternal-uncles`:

- título escuro e visível;
- cards visíveis quando houver dados;
- grupo centralizado;
- largura adaptada ao número de cards;
- rolagem interna quando o conteúdo exceder a altura útil;
- swipe vertical não pode capturar a navegação antes de o scroll interno chegar ao limite;
- ajustes visuais não podem ocultar cards nem alterar dados.

---

## 10. Títulos dos grupos

Títulos monitorados:

```txt
Tios Paternos
Tios Maternos
Irmãos
Sobrinhos
Pets
Filhos
Netos
```

Regras:

- não podem ficar brancos sobre fundo branco;
- não podem ficar transparentes;
- devem ter fonte compacta no mobile;
- devem preservar `-webkit-text-fill-color` quando necessário para Safari/iOS;
- não podem ser cobertos por conectores.

---

## 11. Zoom/overview mobile

Regras por rota:

| Rota | Contrato do botão `Zoom` |
|---|---|
| `/mapa-familiar` | abre overview com 9 cards da grade 3x3 e pode oferecer **Exibir mapa completo** |
| `/mapa-familiar-horizontal` | abre overview por gerações disponíveis, não a grade 3x3 |

Regras comuns:

- cada card do overview deve responder a toque/click;
- em `/mapa-familiar`, o card leva à tela correspondente da grade;
- em `/mapa-familiar-horizontal`, o card leva à geração correspondente;
- overview deve fechar ao escolher destino;
- overview não entra na exportação;
- abrir/fechar Zoom não pode deixar `body` travado;
- abrir Zoom a partir de `descendants` não pode causar tremor ou disputa de `transform`.

Regra de toolbar:

- a toolbar mobile fixa contém `Formato`, `Cor`, `Filtros` e `Zoom`;
- `Exportar` não é item fixo da toolbar mobile vigente;
- ações de salvar/exportar podem existir no painel completo aberto pelo botão `+`;
- não reintroduzir `Zoom +`, `Zoom -`, `Restaurar` ou `Exportar` como itens fixos da toolbar mobile sem decisão explícita e QA.

## 12. Painel mobile do botão `+`

Regras:

- botão `+` abre painel completo de **Visualização**;
- overlay deve escurecer o fundo;
- painel principal deve ser branco/opaco;
- conteúdo interno deve ter rolagem própria;
- `body` deve destravar ao fechar;
- painel não entra na exportação;
- pode conter seletor de visualizador/família, alternância de formato, paleta, resumo, grupos e filtros;
- pode conter ação de salvar/exportar imagem, conforme o código vigente;
- não confundir o painel completo do `+` com os popovers compactos da toolbar.

## 13. Painel desktop

Deve funcionar:

```txt
Zoom +
Zoom -
Restaurar/Fit
Vertical
Horizontal
Cores
Exportar
Destacar
Filtros/grupos
Filtros de status
```

Não deve voltar:

```txt
Filtros | Legendas | Ações
activeSidebarPanel como contrato de produto
aba Legendas persistente
aba Ações persistente
```

---

## 14. Paletas

Paletas vigentes:

```txt
white
visual
orange
brown
```

Regras:

- desktop e mobile usam a mesma paleta ativa;
- cards, bordas, conectores, labels e canvas mudam com a paleta;
- exportação preserva paleta;
- paletas não azuis não caem em fallback azul/teal;
- não há seletor global `svg path` afetando ícones fora da árvore.

---

## 15. Cards e avatares

Contrato:

| Caso | UI |
|---|---|
| Pessoa com foto | foto real |
| Pessoa sem foto | `User` |
| Pet | `PawPrint` |

Regras:

- não há fallback por gênero;
- ícones preservam contraste;
- exportação preserva ícones;
- nascimento aparece apenas quando há ano/data real;
- falecimento aparece apenas quando há ano/data real;
- `Nascimento não informado` e `Falecimento não informado` não devem aparecer no resultado visual mobile.

---

## 16. Cônjuges e conectores

Regras:

- cônjuge da pessoa central aparece quando há relação explícita;
- cônjuges de `avos`, `bisavos` e `tataravos` podem ser sempre visíveis como ancestrais;
- cônjuges filtráveis: `tios`, `primos`, `sobrinhos`, `filhos`, `netos`;
- `pais`/Geração 4 na horizontal não deve ser declarado implementado sem nova verificação;
- conectores representam relações explícitas;
- conectores seguem paleta ativa;
- conectores aparecem na exportação;
- conectores não afetam ícones SVG internos;
- ajuste de conector não usa seletor global amplo.

---

## 17. Calendário familiar

Regras mobile:

- 5 botões em uma linha quando possível;
- bolinha colorida acima do texto;
- título em uma linha;
- sem overflow horizontal indevido;
- categorias continuam filtrando eventos;
- Google Agenda não quebra quando OAuth não está configurado.

---

## 18. Exportação

Regras:

- `Área` abre seleção e funciona como toggle;
- PNG, PDF e Impressão continuam disponíveis no painel desktop/completo;
- loading aparece durante ação real;
- erro de tamanho grande é claro;
- header, painel, bottom nav, modal, overlay, loading e debug não entram na captura;
- paleta, conectores, cards e avatares são preservados.

---

## 19. Onboarding do membro

Rotas do onboarding:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
```

Regras resumidas:

- pessoa viva passa pelas cinco etapas;
- pessoa falecida não passa por `/preferencias` no fluxo normal;
- pessoa falecida não mantém notificações, WhatsApp ou mensagens ativas no fluxo do membro;
- `MemberOnboardingSteps` deve ocultar a Etapa 4 para pessoa falecida;
- Mini Bio e Curiosidades por IA não salvam automaticamente no banco;
- vínculos em análise preservam status visual local;
- revisão final mantém edição inline e badges por gênero/status.

---

## 19.1. Regras específicas do onboarding recente

Após os prompts do fluxo de onboarding:

- `/meus-dados` coleta o questionário de perfil e não deve voltar a exibir Mini Bio/Curiosidades como campos principais nessa etapa.
- `/meus-vinculos` exibe Mini Bio/Curiosidades editáveis e geradas por IA com base no questionário.
- Pets devem ficar separados de filhos humanos em `/meus-vinculos` e `/revisao-dados`.
- Cônjuge ativo deve permanecer limitado a no máximo 1.
- Cônjuge falecido deve permanecer inativo.
- Mudanças em vínculos de membros devem criar solicitação pendente quando esse for o fluxo vigente, não relacionamento definitivo direto.
- Rascunhos em `sessionStorage`/`localStorage` não devem ser quebrados sem migração defensiva.
- `/arquivos-historicos` passa a aceitar fatos/memórias sem arquivo quando a migration correspondente estiver aplicada.
- Não tornar colunas opcionais como `participante_ids` obrigatórias sem migration e fallback removidos de forma controlada.

## 19.2. Regras de IA, privacidade e inferência

- IA não pode inventar fatos fora dos dados enviados.
- IA não deve receber telefone, endereço, contato ou rede social privada sem respeitar permissões explícitas.
- Inferência de pai/mãe por nome, sufixo ou gênero aparente é risco técnico; quando houver ambiguidade, documentar como inferência e não como verdade factual.
- `homeAiContext.ts` deve ser tratado como frente sensível: alterações exigem revisão de privacidade, prompt e payload.

## 20. Operação, banco e secrets

Regras:

- ajuste visual/documental não exige migration;
- mudança de schema, RLS, RPC, trigger, bucket/policy ou Edge Function exige revisão operacional;
- `supabase/migrations/` é fonte da verdade de schema;
- service role nunca vai para frontend;
- secrets não usam prefixo `VITE_`;
- `/api/(.*)` deve vir antes do fallback SPA quando houver rotas serverless;
- `index.html` não deve ter cache imutável em SPA Vite com code splitting.

---

## 21. Documentação

Regras:

- `QA_MANUAL.md` centraliza checklists manuais;
- `docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md` centraliza QA operacional específico dos mapas mobile;
- `PLANO_PROXIMOS_PASSOS.md` centraliza pendências;
- documentos funcionais não devem duplicar QA extenso;
- documentos históricos não reabrem rotas removidas;
- divergência entre histórico e guia canônico é resolvida em favor do guia canônico;
- divergência entre documentação e código exige auditoria do código.

---

## 22. Fechamento de frente

Antes de fechar qualquer frente:

- [ ] comandos mínimos aplicáveis passaram;
- [ ] QA manual aplicável foi executado ou justificado;
- [ ] documentação afetada foi atualizada;
- [ ] pendências novas foram registradas em `PLANO_PROXIMOS_PASSOS.md` ou documento complementar aprovado;
- [ ] nenhuma rota antiga voltou como view ativa;
- [ ] nenhuma mudança visual criou migration;
- [ ] nenhuma secret foi exposta.
