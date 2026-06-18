# Meus vínculos — revisão guiada de vínculos familiares

> Última revisão: 2026-06-16  
> Local canônico: `docs/funcionalidades/MEUS_VINCULOS.md`  
> Tipo: documentação funcional e técnica da Etapa 2 do onboarding.  
> Status: documenta a versão após refatoração visual, modularização, busca de pessoa existente, solicitação de controle e simplificação da revisão.

## 1. Função deste documento

Este documento descreve a página `/meus-vinculos`, usada na Etapa 2 do onboarding do membro para revisar vínculos familiares.

Use este arquivo para manter:

- estrutura visual da revisão de vínculos;
- grupos de parentesco exibidos ao usuário;
- cards-resumo e navegação por âncora;
- cards de familiares;
- estados visuais de análise;
- busca de pessoa existente;
- criação manual de familiar;
- remoção e desfazer remoção;
- solicitação de controle de perfil;
- regras de outro pai/mãe;
- critérios de QA e anti-regressão.

Não use este documento para detalhar:

| Tema | Documento |
|---|---|
| Etapa 1 e Mini Bio/Curiosidades com IA | `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Arquivos Históricos | documento funcional futuro ou guias gerais de onboarding |
| Preferências e revisão final | guias de implementação/UX e documentação funcional específica quando existir |
| Migrations, RLS e policies | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| QA geral do produto | `docs/QA_MANUAL.md` |
| Regras transversais de não regressão | `docs/REGRAS_DE_NAO_REGRESSAO.md` |

---

## 2. Escopo funcional

A página permite ao usuário revisar vínculos familiares antes de seguir no onboarding.

Grupos cobertos:

- Pais;
- Filhos;
- Cônjuges;
- Irmãos.

Ações suportadas:

- visualizar vínculos existentes;
- adicionar familiar;
- buscar pessoa já cadastrada antes de criar nova pessoa;
- criar nova pessoa manualmente quando necessário;
- solicitar remoção de vínculo;
- desfazer remoção quando aplicável;
- ajustar outro pai/mãe de filhos quando o fluxo permitir;
- solicitar controle de perfil;
- confirmar vínculos e continuar.

Fora do escopo atual:

- aprovação administrativa definitiva na própria página;
- merge automático de pessoas duplicadas;
- deduplicação avançada;
- persistência definitiva de solicitação de controle quando o fluxo administrativo ainda não existir;
- edição completa de dados pessoais do familiar.

---

## 3. Arquivos principais

| Responsabilidade | Arquivo |
|---|---|
| Página/orquestração da Etapa 2 | `src/app/pages/MeusVinculos.tsx` |
| Card superior e cards-resumo | `src/app/pages/meus-vinculos/RelationshipOverview.tsx` |
| Seções de grupos familiares | `src/app/pages/meus-vinculos/RelationshipGroupPanel.tsx` |
| Card individual de familiar | `src/app/pages/meus-vinculos/RelativeCard.tsx` |
| Modal de solicitação de controle | `src/app/pages/meus-vinculos/ProfileControlRequestDialog.tsx` |
| Helpers puros e labels | `src/app/pages/meus-vinculos/meusVinculosUtils.ts` |
| Tipos compartilhados | `src/app/pages/meus-vinculos/types.ts` |
| Services de vínculo e busca | `src/app/services/memberProfileService.ts` |
| Tipos gerais | `src/app/types/index.ts` |

---

## 4. Estrutura visual atual

A página usa largura total. O antigo painel lateral **Resumo da revisão** não faz parte da UI vigente.

Blocos principais:

1. header da etapa;
2. `MemberOnboardingSteps`;
3. card superior `Familiares de [Primeiro Nome]`;
4. cards-resumo de vínculos;
5. seções de Pais, Filhos, Cônjuges e Irmãos;
6. bloco final de confirmação.

O botão final fica no rodapé da revisão, depois dos grupos familiares.

---

## 5. Card superior

O card superior deve mostrar:

```txt
Familiares de [Primeiro Nome]
```

Exemplo:

```txt
Familiares de Absalon
```

Não deve exibir:

- rótulo `Pessoa em revisão`;
- frase `Você está revisando os vínculos familiares de:`;
- nascimento;
- cidade/local.

Pode manter avatar/foto ou iniciais e texto instrutivo curto.

---

## 6. Cards-resumo e âncoras

Cards-resumo:

- Pais;
- Filhos;
- Cônjuges;
- Irmãos.

Eles funcionam como âncoras para:

```txt
#vinculos-pais
#vinculos-filhos
#vinculos-conjuges
#vinculos-irmaos
```

Pluralização vigente:

```txt
Nenhum vínculo
1 vínculo
2 vínculos
```

Não usar `vínculo(s)`.

---

## 7. Grupos de vínculos

Cada grupo possui:

- título;
- descrição;
- contador;
- botão de adicionar;
- estado vazio;
- lista de cards.

### Pais

Confirma pai e mãe cadastrados para a árvore.

### Filhos

Confirma filhos e permite informar outro pai/mãe quando aplicável.

### Cônjuges

Registra relacionamentos relevantes para a árvore familiar.

### Irmãos

Confirma irmãos e vínculos laterais.

---

## 8. Cards de familiares

Os cards exibem:

- avatar ou iniciais;
- nome;
- tipo de vínculo;
- badge de status;
- ação compacta de remoção por ícone;
- controles específicos, como `Outro pai/mãe` em filhos;
- ação `Solicitar controle do perfil`, quando aplicável.

Não exibem chips de nascimento/local dentro do card de vínculo.

---

## 9. Status visuais

| Status | Quando aparece |
|---|---|
| `Pré-cadastrado` | Pessoa cadastrada na árvore sem usuário/auth user vinculado. |
| `Ativo` | Pessoa com usuário/auth user vinculado. |
| `Em análise` | Vínculo adicionado ou alterado nesta revisão. |
| `Remoção em análise` | Usuário solicitou remoção de vínculo existente. |
| `Controle em análise` | Usuário solicitou controle de perfil. |

Regras:

- remoção solicitada não deve sumir imediatamente da tela;
- card com remoção deve permitir desfazer quando o fluxo permitir;
- `Controle em análise` não deve ser confundido com alteração de vínculo;
- vínculo novo selecionado pela busca conta como adição pendente.

---

## 10. Busca de pessoa existente

Ao adicionar familiar, o usuário pode buscar pessoa já cadastrada antes de criar nova pessoa.

Fluxo:

```txt
Adicionar familiar
↓
Buscar pessoa existente
↓
Selecionar pessoa encontrada OU criar nova pessoa
↓
Confirmar vínculo
↓
Card entra como Em análise
```

Serviço relacionado:

```txt
searchPeopleForRelationship()
```

Arquivo:

```txt
src/app/services/memberProfileService.ts
```

Regras:

- a própria pessoa em revisão não pode ser selecionada;
- pessoa já vinculada no mesmo grupo não deve ser duplicada;
- pessoa já adicionada na revisão atual não deve ser duplicada;
- criação manual continua disponível;
- busca não faz merge automático de duplicidades existentes.

---

## 11. Criação manual

Quando a pessoa correta não aparece na busca, o usuário pode criar novo cadastro manualmente.

A criação manual preserva o fluxo de revisão:

- pessoa criada entra como vínculo pendente;
- card aparece como `Em análise`;
- alteração é considerada no resumo/finalização.

---

## 12. Solicitação de controle de perfil

A ação **Solicitar controle do perfil** permite pedir permissão para administrar um perfil da árvore.

Casos previstos:

- pessoa falecida;
- criança ou dependente;
- familiar sem conta;
- familiar próximo que precisa de manutenção por outro usuário.

O modal coleta:

- pessoa selecionada;
- motivo;
- justificativa;
- validação mínima da justificativa.

Após envio local:

- card exibe `Controle em análise`;
- solicitação duplicada para a mesma pessoa deve ser bloqueada;
- ação pode depender de persistência administrativa futura.

TODO técnico:

```txt
Persistir solicitação de controle de perfil quando o fluxo administrativo estiver disponível.
```

---

## 13. Filho, filha e outro pai/mãe

Labels de filhos:

| Dado de gênero | Label |
|---|---|
| masculino/homem/male | `Filho` |
| feminino/mulher/female | `Filha` |
| ausente/desconhecido | `Filho(a)` |

Regras:

- não inferir gênero pelo nome;
- usar apenas dado cadastrado;
- dropdown `Outro pai/mãe` deve tentar pré-selecionar responsável conhecido pelos relacionamentos existentes;
- não usar hard-code de nomes específicos.

---

## 14. Bloco final de confirmação

O botão final aparece no fim da página.

Labels possíveis:

```txt
Confirmar vínculos e continuar
Enviar alterações e continuar
Enviar solicitações e continuar
```

O texto varia conforme existam:

- vínculos adicionados;
- vínculos alterados;
- remoções solicitadas;
- solicitações de controle.

---

## 15. Modularização

| Arquivo | Responsabilidade |
|---|---|
| `RelationshipOverview.tsx` | Card superior e cards-resumo com âncoras. |
| `RelationshipGroupPanel.tsx` | Seção de grupo familiar, contador, estado vazio e botão adicionar. |
| `RelativeCard.tsx` | Card individual, badges, remoção compacta e controles de vínculo. |
| `ProfileControlRequestDialog.tsx` | Modal de solicitação de controle de perfil. |
| `meusVinculosUtils.ts` | Helpers de pluralização, status, labels e detecção auxiliar. |
| `types.ts` | Tipos compartilhados. |

`MeusVinculos.tsx` deve continuar como orquestrador, não como componente visual monolítico.

---

## 16. Regras preservadas

- carregamento dos vínculos;
- rascunho local;
- busca de pessoa existente;
- criação manual;
- solicitação de controle;
- remoção e desfazer;
- envio de alterações;
- navegação do onboarding;
- compatibilidade com pessoa viva/falecida.

---

## 17. Limitações atuais

- solicitação de controle pode depender de persistência futura;
- busca previne duplicidade básica, mas não corrige duplicidades existentes;
- não há merge automático;
- aprovação administrativa não ocorre nesta tela;
- gênero só é usado quando vem preenchido nos dados.

---

## 18. QA manual mínimo

- abrir `/meus-vinculos`;
- verificar `Familiares de [Primeiro Nome]`;
- verificar que o painel lateral não aparece;
- clicar em cards-resumo e validar âncoras;
- validar pluralização;
- adicionar familiar por busca;
- criar familiar manualmente;
- tentar duplicar pessoa no mesmo grupo;
- solicitar remoção;
- desfazer remoção;
- solicitar controle de perfil;
- verificar `Pré-cadastrado`, `Ativo`, `Em análise`, `Remoção em análise` e `Controle em análise`;
- validar `Filho`, `Filha` e `Filho(a)` quando houver dados;
- validar pré-seleção de outro pai/mãe conhecido;
- confirmar e continuar;
- testar mobile em 320px, 375px, 390px e 430px.

<!-- VINCULOS-CONSOLIDADOS-2026-06-18 -->
## ConsolidaÃ§Ã£o recente de vÃ­nculos

### Modal de adicionar parente

- A busca deve acontecer enquanto o usuÃ¡rio digita.
- O botÃ£o manual â€œBuscarâ€ nÃ£o deve ser necessÃ¡rio.
- A criaÃ§Ã£o de nova pessoa deve continuar disponÃ­vel.
- Mensagens vazias redundantes, como caixa cinza de â€œNenhuma pessoa encontradaâ€, devem ser evitadas quando nÃ£o agregarem aÃ§Ã£o.

### Badges por gÃªnero/status

| CondiÃ§Ã£o | Badge |
|---|---|
| Homem vivo | Vivo |
| Mulher viva | Viva |
| Homem falecido | Falecido |
| Mulher falecida | Falecida |
| Registro pendente/local | Em anÃ¡lise |

Evitar `Falecido(a)` quando houver informaÃ§Ã£o suficiente para uma forma especÃ­fica.

### Microcopy

Quando o contexto for alteraÃ§Ã£o de mÃ£e, usar microcopy direta, como â€œAlterar a mÃ£eâ€, em vez de rÃ³tulos genÃ©ricos.
