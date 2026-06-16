# Regras de não regressão — Árvore Família

> Última revisão: 2026-06-16
> Local canônico: `docs/REGRAS_DE_NAO_REGRESSAO.md`
> Projeto: `tuliust/arvorefamilia`
> Tipo: regras técnicas e contratos de prevenção de regressão
> Status: atualizado para incluir regras do onboarding condicional, Mini Bio/Curiosidades com IA, revisão de vínculos familiares, pessoa falecida, revisão final e arquivos históricos.

---

## 1. Objetivo

Este documento define regras mínimas que não devem regredir em mudanças futuras.

Use antes de alterar:

- rotas;
- `TreeViewMode`;
- árvore;
- painel desktop;
- modal mobile;
- paletas/CSS;
- exportação;
- favoritos/busca;
- calendário;
- guards/permissões;
- documentação.

Para execução manual de QA, use:

```txt
docs/QA_MANUAL.md
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

QA manual aplicável fica centralizado em `docs/QA_MANUAL.md`.

---

## 3. Buscas obrigatórias

Antes de fechar limpeza ou refatoração da árvore:

```bash
rg "/minha-arvore|/genealogia|/visao-completa" docs src tests
rg "TreeViewMode|treeViewMode" docs src tests
rg "Filtros \| Legendas \| Ações" docs src
rg "MobileTreeControlsPortal" docs src
rg "Nascimento não informado|Falecimento não informado" docs src
rg "FILTERABLE_SPOUSE_ANCHOR_GROUPS|ANCESTOR_SPOUSE_ANCHOR_GROUPS" docs src
rg "data-tree-route-view|data-export-root|data-tree-export-ignore" docs src
rg "Outro pai/mãe|Nenhuma pessoa encontrada|Falecido\\(a\\)|Voltar para preferências|Salvar arquivos|Salvar permissões" docs src tests
```

Interpretação:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode existir como conceito textual, não como rota ativa;
- aliases antigos podem existir se apontarem para rotas atuais;
- `Nascimento não informado` pode existir como dívida técnica transitória, mas não deve aparecer no resultado visual mobile;
- documentos históricos podem conter legado se estiverem claramente marcados;
- `docs/historico/ROTAS_REMOVIDAS.md` é a referência preventiva para interpretar essas ocorrências.

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

Histórico preventivo:

```txt
docs/historico/ROTAS_REMOVIDAS.md
```

Regras:

- `/` redireciona para `/mapa-familiar` ou login conforme guard;
- `/?pessoa=abc` preserva `?pessoa=abc`;
- `/mapa-familiar` e `/mapa-familiar-horizontal` são protegidas por fluxo de acesso à árvore;
- `/minha-arvore/editar` continua em `MemberRoute`;
- `/arquivos-historicos`, `/preferencias` e `/revisao-dados` permanecem em `MemberRoute`;
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
- `?pessoa=...` continua preservado.

QA manual detalhado: `docs/QA_MANUAL.md`.

---

## 7. Painel desktop

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

Regras:

- filtros permanecem acessíveis sem aba;
- exportação, paletas e destaques continuam funcionais;
- painel não aparece na exportação;
- cards do painel seguem paleta ativa;
- `Área` funciona como toggle.

---

## 8. Modal mobile de controles

Deve conter:

```txt
Vertical
Horizontal
Cores
Grupos
Destacar
Filtros de status
```

Não deve conter:

```txt
Zoom +
Zoom -
Restaurar visualização
Exportar
```

Regras:

- título é `Controles`;
- não há subtítulo;
- botão de fechar é `X`;
- overlay fecha;
- body destrava ao fechar;
- grupos aparecem apenas após clicar em `Grupos`;
- filtros permanecem visíveis;
- modal não entra na exportação.

---

## 9. Paletas

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

QA manual por paleta: `docs/QA_MANUAL.md`.

---

## 10. Cards e avatares

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
- `Nascimento não informado` e `Falecimento não informado` não devem aparecer no resultado visual mobile;
- dívida `TREE-004` permanece aberta até correção estrutural no componente.

---

## 11. Cônjuges

### Implementado/esperado

- cônjuge da pessoa central;
- múltiplos núcleos conjugais da pessoa central quando há dados;
- cônjuges de `avos`, `bisavos` e `tataravos` como ancestrais sempre visíveis;
- cônjuges filtráveis atualmente suportados por código: `tios`, `primos`, `sobrinhos`, `filhos`, `netos`.

### Pendência conhecida

```txt
TREE-003 — cônjuges de pais/Geração 4 na horizontal
```

Regras:

- não declarar `pais`/Geração 4 como implementado até código incluir esse grupo;
- se corrigir, atualizar docs e testes/QA no mesmo commit;
- nunca inferir conector conjugal por proximidade visual;
- não criar dado fictício para resolver layout.

---

## 12. Conectores

Regras:

- conectores representam relações explícitas;
- conectores seguem paleta ativa;
- conectores aparecem na exportação;
- conectores não afetam ícones SVG internos;
- ajuste de conector não usa seletor global.

Por view:

- vertical desktop: âncoras e grupos corretos;
- vertical mobile: alinhamento Pai/Mãe/ancestrais coerente;
- horizontal desktop: casal → filhos por geração;
- horizontal mobile: conectores da geração ativa visíveis até fim do scroll.

---

## 13. Calendário familiar

Regras mobile:

- 5 botões em uma linha quando possível;
- bolinha colorida acima do texto;
- título em uma linha;
- sem overflow horizontal indevido;
- categorias continuam filtrando eventos;
- Google Agenda não quebra quando OAuth não está configurado;
- limites de test users/OAuth ficam documentados em operação.

QA manual: `docs/QA_MANUAL.md`.

---

## 14. Exportação

Regras:

- `Área` abre seleção e funciona como toggle;
- PNG, PDF e Impressão continuam disponíveis no painel desktop/completo;
- loading aparece durante ação real;
- erro de tamanho grande é claro;
- header, painel, bottom nav, modal, overlay, loading e debug não entram na captura;
- paleta, conectores, cards e avatares são preservados;
- modal mobile não expõe Exportar.

Detalhes técnicos ficam em `docs/funcionalidades/EXPORTACAO_ARVORE.md`.
QA manual fica em `docs/QA_MANUAL.md`.

---

## 15. Onboarding do membro

Rotas do onboarding:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
```

### Pessoa viva

Regras:

- deve passar pelas cinco etapas;
- `/preferencias` permanece acessível como Etapa 4;
- cidade de residência aparece na Etapa 1;
- contato, endereço e redes sociais aparecem na Etapa 1;
- box de notificações/permissões pode aparecer na revisão final.

### Pessoa falecida

Regras:

- não deve passar por `/preferencias` no fluxo normal;
- acesso direto a `/preferencias` deve redirecionar para `/revisao-dados`;
- cidade de residência não deve aparecer;
- campos de falecimento devem aparecer quando aplicáveis;
- contato, endereço e redes sociais não devem aparecer na Etapa 1;
- notificações devem ser desativadas automaticamente;
- permissões de visualização devem ser ativadas automaticamente;
- WhatsApp deve ficar desativado;
- `MemberOnboardingSteps` deve ocultar a Etapa 4;
- box de notificações/permissões não deve aparecer na revisão final.

### Etapa 1 — Meus dados e IA

Regras:

- campos `minibio` e `curiosidades` devem manter limite de 300 caracteres;
- geração de IA não deve salvar automaticamente no banco;
- modo padrão deve gerar textos em primeira pessoa;
- tom **Nostálgico** deve ativar modo memorial em terceira pessoa e passado;
- modo memorial não deve inventar datas, cidades, causa de morte ou fatos não informados;
- etapas 2 a 8 do modal de IA devem manter cards compactos, centralizados, sem ícones internos e com até 2 linhas visuais;
- botão final do modal deve ser `Gerar textos` na etapa de perguntas opcionais.

### Etapa 2 — Vínculos

Regras:

- tela deve permanecer em largura total, sem painel lateral `Resumo da revisão`;
- botão `Voltar para meus dados` não deve reaparecer;
- card superior deve usar `Familiares de [Primeiro Nome]`;
- rótulo `Pessoa em revisão`, frase `Você está revisando...`, nascimento e local não devem reaparecer no card superior;
- cards-resumo devem funcionar como âncoras para `Pais`, `Filhos`, `Cônjuges` e `Irmãos`;
- pluralização deve ser `Nenhum vínculo`, `1 vínculo` ou `N vínculos`, sem `vínculo(s)`;
- botão final deve permanecer no rodapé da revisão;
- cards de vínculo não devem exibir chips de nascimento/local;
- vínculo confirmado deve exibir `Pré-cadastrado` quando não houver usuário vinculado e `Ativo` quando houver auth user/vínculo;
- vínculo novo ou alterado deve exibir `Em análise`;
- remoção solicitada deve exibir `Remoção em análise` e manter o card visível;
- solicitação de controle deve exibir `Controle em análise`;
- botão de remoção deve permanecer compacto, apenas com ícone, no topo do card;
- busca de pessoa existente deve ocorrer antes ou junto da criação manual para reduzir duplicidade;
- criação manual deve continuar disponível quando a busca não encontra a pessoa correta;
- a própria pessoa em revisão não pode ser selecionada como familiar dela mesma;
- pessoa já vinculada no mesmo grupo não deve ser duplicada;
- `Filho`, `Filha` ou `Filho(a)` devem depender do gênero disponível, sem inferência por nome;
- dropdown `Outro pai/mãe` deve tentar pré-selecionar responsável conhecido sem hard-code de nomes específicos.

### Etapa 3 — Arquivos históricos

Regras:

- botões `Voltar para vínculos` e `Salvar arquivos` não devem reaparecer;
- botão principal é `Salvar e Continuar`;
- card de categoria deve preencher título e descrição da área de upload;
- trocar categoria deve atualizar título e descrição;
- arquivo adicionado deve aparecer como thumbnail/resumo com `Editar` e `Remover`;
- rascunho local não deve sumir ao trocar aba, minimizar ou recarregar antes do salvamento.

### Etapa 4 — Preferências

Regras:

- botão `Salvar permissões` não deve reaparecer;
- botão `Voltar para arquivos históricos` não deve reaparecer;
- manter apenas `Continuar para a revisão`;
- o box geral `Receber notificações por email` não deve reaparecer no onboarding como duplicidade visual.

### Etapa 5 — Revisão final

Regras:

- mini bio não deve aparecer ao lado do nome no topo;
- botão `Finalizar e acessar árvore` deve permanecer no topo ao lado de `Editar perfil`;
- rodapé antigo com `Voltar para preferências` não deve reaparecer;
- box `Informações pessoais` não deve listar `Pessoa falecida`, `Nascimento no exterior` ou `Falecimento no exterior`;
- boxes editáveis devem manter lápis compacto para edição inline quando aplicável;
- familiares e arquivos devem direcionar para suas etapas específicas quando a edição completa for necessária;
- badges de familiares devem respeitar `Vivo`, `Viva`, `Falecido`, `Falecida` e `Em análise`.


## 16. Operação, banco e secrets

Regras:

- ajuste visual/documental não exige migration;
- mudança de schema, RLS, RPC, trigger, bucket/policy ou Edge Function exige revisão operacional;
- `supabase/migrations/` é fonte da verdade de schema;
- service role nunca vai para frontend;
- secrets não usam prefixo `VITE_`;
- `/api/(.*)` deve vir antes do fallback SPA quando houver rotas serverless;
- `index.html` não deve ter cache imutável em SPA Vite com code splitting.

---

## 17. Documentação

Regras:

- `QA_MANUAL.md` centraliza checklists manuais;
- `PLANO_PROXIMOS_PASSOS.md` centraliza pendências;
- documentos funcionais não devem duplicar QA extenso;
- documentos históricos não reabrem rotas removidas;
- `docs/historico/ROTAS_REMOVIDAS.md` centraliza o histórico e as anti-regressões específicas de `/minha-arvore`, `/genealogia` e `/visao-completa`;
- divergência entre histórico e guia canônico é resolvida em favor do guia canônico;
- divergência entre documentação e código exige auditoria do código.

---

## 18. Fechamento de frente

Antes de fechar qualquer frente:

- [ ] comandos mínimos aplicáveis passaram;
- [ ] QA manual aplicável foi executado ou justificado;
- [ ] documentação afetada foi atualizada;
- [ ] pendências novas foram registradas em `PLANO_PROXIMOS_PASSOS.md`;
- [ ] nenhuma rota antiga voltou como view ativa;
- [ ] nenhuma mudança visual criou migration;
- [ ] nenhuma secret foi exposta.

<!-- ajuste-irmaos-conjuges-mapa-familiar-2026-06 -->

## Mapa familiar ? irm?os e c?njuges

Na p?gina `/mapa-familiar`:

- O grupo `Irm?os` exibe at? 4 cards antes de apresentar controle de expandir/recolher.
- Em grade dupla, quando houver quantidade ?mpar de cards vis?veis, o ?ltimo card isolado fica centralizado na segunda linha.
- C?njuges de irm?os s?o exibidos no grupo `Irm?os` quando o filtro `C?njuges` est? ativo e existe relacionamento expl?cito `tipo_relacionamento === 'conjuge'`.
- Esse comportamento n?o cria nem infere dados; depende exclusivamente dos relacionamentos persistidos.
- A regra acima se aplica ? p?gina `/mapa-familiar`. N?o assumir o mesmo comportamento para `/mapa-familiar-horizontal` sem valida??o espec?fica.

