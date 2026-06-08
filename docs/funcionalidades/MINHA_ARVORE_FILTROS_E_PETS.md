# Minha Árvore - filtros, pets e regras de exibição

> Última revisão: 2026-06-08  
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md`  
> Tipo: documentação funcional da view **Minha Árvore**.  
> Status: revisado na auditoria documental final.

---

## 1. Função deste documento

Este documento descreve as regras específicas da view **Minha Árvore** relacionadas a:

- filtros de grupos familiares;
- filtros por status/tipo;
- pets;
- separação entre filhos humanos e pets;
- contadores dos cards;
- modo foco da pessoa central;
- impacto dos filtros na renderização da árvore.

Para layout, viewport e ReactFlow, use:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
```

Para legendas, conectores e painel lateral, use:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

---

## 2. Arquivos principais

```txt
src/app/pages/Home.tsx
src/app/pages/home/DirectRelationKpiGrid.tsx
src/app/pages/home/DirectRelativeFilterGrid.tsx
src/app/pages/home/LifeStatusKpiGrid.tsx
src/app/components/FamilyTree/FamilyTree.tsx
src/app/components/FamilyTree/TreeLegend.tsx
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
src/app/components/FamilyTree/CentralPersonFocusPanel.tsx
src/app/services/memberTreeService.ts
src/app/utils/personEntity.ts
```

Tipos principais:

```txt
DirectRelativeFilters
DirectRelativeGroup
EdgeFilters
VisualLineFilters
```

---

## 3. Modelo atual para pets

O modelo atual preserva compatibilidade com o banco existente.

Regra de domínio:

```txt
pessoas.humano_ou_pet === 'Pet'
```

define semanticamente que a pessoa é pet.

O relacionamento técnico ainda pode usar:

```txt
relacionamentos.tipo_relacionamento = 'filho'
```

para ligar o pet à família.

Não há migration atual para:

- tipo de relacionamento `pet`;
- tipo de relacionamento `tutor`;
- backfill semântico;
- tabela separada de pets.

Portanto:

- não salvar `tipo_relacionamento = 'pet'` sem migration;
- não criar UI que dependa de `tutor` sem schema;
- documentar qualquer futura mudança de domínio antes de migrar dados.

---

## 4. Helpers obrigatórios

Arquivo:

```txt
src/app/utils/personEntity.ts
```

Usar:

```txt
isHumanFamilyMember(pessoa)
isPetFamilyMember(pessoa)
```

Regras:

- não inferir pet por nome;
- não inferir pet pelo grupo visual;
- não inferir pet apenas pelo relacionamento;
- a fonte semântica é `pessoas.humano_ou_pet`;
- evitar comparações duplicadas em componentes.

---

## 5. Filtros por status/tipo

Estado em `Home.tsx`:

```ts
personFilters = {
  vivos: true,
  falecidos: true,
  pets: true,
}
```

Responsabilidade:

- controlar quais cards de pessoas são renderizados;
- preservar a pessoa central;
- não recalcular a estrutura familiar;
- não alterar dados no Supabase.

Regra central:

```txt
Filtros de status/tipo não devem reorganizar a árvore.
```

Resultado esperado:

- desativar **Vivos** oculta pessoas vivas;
- desativar **Falecidos** oculta pessoas falecidas;
- desativar **Pets** oculta pets;
- a pessoa central permanece visível;
- ramos paterno/materno não devem trocar de lado por causa desses filtros;
- conectores estruturais não devem mudar a semântica da árvore.

---

## 6. Filtros de grupos diretos

Estado em `Home.tsx`:

```ts
directRelativeFilters = {
  pais,
  avos,
  bisavos,
  tataravos,
  conjuge,
  filhos,
  netos,
  irmaos,
  sobrinhos,
  tios,
  primos,
  pets,
}
```

No painel superior, `DirectRelationKpiGrid` usa `DirectRelativeFilterGrid` com `excludedKeys={['pais']}`. Na prática, o card **Pai e Mãe** não aparece no grid principal de filtros, embora exista no tipo/default interno.

Opções visíveis no grid principal:

```txt
Tataravós
Bisavós
Avós
Tios
Primos
Cônjuge
Irmãos
Filhos
Sobrinhos
Netos
```

Regras:

- card de grupo oculta/exibe grupo;
- desativar um grupo não deve zerar o número exibido no próprio card;
- cards com contagem `0` continuam clicáveis;
- grupos diretos não substituem filtros de linhas;
- grupos diretos não persistem no banco;
- em mobile, a view direta usa defaults para evitar painel lateral complexo.

---

## 7. Contadores

Contadores de grupos diretos devem respeitar os filtros inferiores de status/tipo, mas não devem ser zerados pelo próprio toggle do grupo.

Exemplos:

| Ação | Resultado esperado |
|---|---|
| Desativar **Bisavós** | Card **Bisavós** mantém a contagem calculada. |
| Desativar **Falecidos** com bisavós todos falecidos | Card **Bisavós** pode ir para `0`. |
| Reativar **Falecidos** | Contagem volta ao valor anterior. |
| Card com `0` | Continua clicável/restaurável. |

Regra:

```txt
O filtro de status/tipo altera contagem. O toggle do próprio grupo altera visibilidade, não o número-base do card.
```

---

## 8. Separação entre filhos humanos e pets

Regra consolidada:

```txt
Filhos = apenas humanos.
Pets = apenas pets.
```

Aplicações:

| Área | Regra |
|---|---|
| `/minha-arvore` | pets podem aparecer no grupo **Pets**. |
| `/genealogia` | pets não entram na visão genealógica formal. |
| `/visao-completa` | pets não entram na visão genealógica completa. |
| Perfil de pessoa | pets aparecem em card próprio quando vinculados. |
| `/minha-arvore/editar` | card **Filhos** conta humanos; card **Pets** conta pets. |

Regras adicionais:

- pets não geram netos;
- netos derivam apenas de filhos humanos;
- IA/curiosidades não devem tratar pet como filho humano;
- métricas de “mais filhos” contam apenas humanos.

---

## 9. Legenda e relação com linhas

A aba **Legendas** controla três famílias de estado:

| Controle | Estado | Efeito |
|---|---|---|
| Cards | `personFilters` | mostra/oculta pessoas vivas, falecidas e pets. |
| Linhas | `edgeFilters` | mostra/oculta linhas. |
| Destacar | `visualLineFilters` | muda estilo de linhas visíveis. |
| Cores dos grupos | `directRelativeFilters` | mostra/oculta grupos diretos da Minha Árvore. |

Regra obrigatória:

```txt
Destaque não cria linha nova.
Destaque não reexibe linha oculta.
Destaque não altera cards.
```

---

## 10. Modo foco da pessoa central

Quando a view **Minha Árvore** renderiza apenas a pessoa central como `personNode` real, `FamilyTree.tsx` ativa o modo foco.

Condições:

- `viewMode === 'minha-arvore'`;
- existe exatamente um `personNode` real;
- esse node é a pessoa central.

Implementação:

- continua usando `personNode`;
- `PersonNodeData.useCentralFocusPanel = true`;
- `PersonNode.tsx` renderiza `CentralPersonFocusPanel`;
- não cria novo node type;
- não altera Supabase;
- não altera Genealogia ou Visão Completa.

Dados exibíveis no foco:

- foto ou placeholder;
- nome completo;
- badge vivo/falecido/pet;
- idade ou anos de vida;
- nascimento/naturalidade, respeitando privacidade;
- local atual;
- geração sociológica;
- contagem de arquivos históricos;
- minibio/curiosidades limitadas;
- botões de visualizar perfil e adicionar conexão.

---

## 11. Admin e edição de vínculos com pets

Enquanto não houver relacionamento semântico próprio para pet:

| Situação | Label de UI | Valor persistido |
|---|---|---|
| humano → humano | Filho(a) | `filho`, `pai` ou `mae`, conforme direção |
| humano → pet | Pet da família | vínculo técnico compatível |
| pet envolvido | Pet da família | vínculo técnico compatível |

Regras:

- não usar `tipo_relacionamento = 'pet'` sem migration;
- não usar `tipo_relacionamento = 'tutor'` sem migration;
- usuário comum deve solicitar alteração quando não puder editar diretamente;
- admin pode executar diretamente quando a regra de permissão permitir;
- documentação de mudança futura deve passar por `MIGRATIONS_SUPABASE.md`.

---

## 12. Responsividade do painel

Regras de layout:

- containers com `min-h-0` e `min-w-0`;
- área de filtros com rolagem interna;
- grids com `minmax(0, 1fr)`;
- botões com `w-full`, `min-w-0`, `overflow-hidden`;
- textos com `truncate`;
- evitar overflow horizontal global;
- cards com `0` não devem ficar desabilitados.

---

## 13. Antirregressões

Não reintroduzir:

- pet dentro do grupo **Filhos**;
- pet em **Genealogia** ou **Visão Completa**;
- card **Pets** no grid superior de grupos diretos;
- desativação de grupo zerando o próprio contador;
- card com `0` não clicável;
- filtro de status recalculando ramos paterno/materno;
- destaque de linhas recriando edge oculta;
- comparação manual `humano_ou_pet === 'Pet'` espalhada sem helper;
- migration de `pet/tutor` sem plano e backfill.

---

## 14. Backlog futuro

Evoluções possíveis, não bloqueantes:

- relacionamento semântico `pet`;
- relacionamento semântico `tutor`;
- backfill seguro dos pets existentes;
- preferência persistida de exibir/ocultar pets;
- métricas próprias de pets;
- card específico de pet no modo foco;
- persistência dos filtros por usuário em banco.

Se avançar, revisar:

```txt
docs/operacao/MIGRATIONS_SUPABASE.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

## 15. Checklist de QA

Validar em `/minha-arvore`:

- desativar **Vivos**;
- desativar **Falecidos**;
- desativar **Pets**;
- confirmar que a pessoa central permanece visível;
- confirmar que ramos não trocam de lado;
- desativar grupo direto e confirmar que seu número não zera;
- confirmar que cards com `0` continuam clicáveis;
- confirmar que pets aparecem no grupo **Pets**;
- confirmar que pets não aparecem em **Genealogia**;
- confirmar que pets não aparecem em **Visão Completa**;
- confirmar card **Pets** separado no perfil e em `/minha-arvore/editar`;
- testar modo foco quando apenas a pessoa central permanece;
- testar desktop, tablet e mobile.

Comando técnico:

```bash
npm run build
```
