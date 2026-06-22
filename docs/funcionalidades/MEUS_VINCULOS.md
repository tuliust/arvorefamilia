# Meus vínculos — revisão guiada de vínculos familiares

> Última revisão: 2026-06-22  
> Local canônico: `docs/funcionalidades/MEUS_VINCULOS.md`  
> Tipo: documentação funcional e técnica da Etapa 2 do onboarding.  
> Status: atualizado contra a branch `feature/questionario-ia-vinculos-pets`, após o commit `aadba97 Refine relationship rules for pets and spouses`.

---

## 1. Função deste documento

Este documento descreve a página `/meus-vinculos`, usada na Etapa 2 do onboarding do membro para revisar vínculos familiares.

Use este arquivo para manter:

- estrutura visual da revisão de vínculos;
- grupos de parentesco exibidos ao usuário;
- separação entre filhos humanos e pets;
- cards-resumo e navegação por âncora;
- cards de familiares;
- estados visuais de análise;
- busca de pessoa existente;
- criação manual de familiar ou pet;
- remoção e desfazer remoção;
- solicitação de controle de perfil;
- regras de outro pai/mãe e outros tutores;
- regras de cônjuges ativos/inativos;
- critérios de QA e anti-regressão.

Não use este documento para detalhar:

| Tema | Documento |
|---|---|
| Etapa 1 e Mini Bio/Curiosidades com IA | `docs/funcionalidades/MINI_BIO_CURIOSIDADES_IA.md` |
| Fatos e Arquivos Históricos | documento funcional próprio ou guias gerais de onboarding |
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
- Pets;
- Cônjuges;
- Irmãos.

Ações suportadas:

- visualizar vínculos existentes;
- adicionar familiar;
- adicionar pet;
- buscar pessoa já cadastrada antes de criar nova pessoa;
- criar nova pessoa manualmente quando necessário;
- criar pet local quando necessário;
- solicitar remoção de vínculo;
- desfazer remoção quando aplicável;
- ajustar outro pai/mãe de filhos humanos quando o fluxo permitir;
- ajustar outros tutores de pets, mantendo compatibilidade técnica com o modelo atual;
- editar detalhes de cônjuge quando aplicável;
- solicitar controle de perfil;
- confirmar vínculos e continuar.

Fora do escopo atual:

- aprovação administrativa definitiva na própria página;
- merge automático de pessoas duplicadas;
- deduplicação avançada;
- persistência definitiva de solicitação de controle quando o fluxo administrativo ainda não existir;
- edição completa de dados pessoais do familiar;
- criação de um tipo de relacionamento `tutor` no banco.

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
| Requests pendentes de vínculo | `src/app/services/relationshipChangeRequestService.ts` |
| Tipos gerais | `src/app/types/index.ts` |

---

## 4. Estrutura visual vigente

A página usa largura total. O antigo painel lateral **Resumo da revisão** não faz parte da UI vigente.

Blocos principais:

1. header da etapa;
2. `MemberOnboardingSteps`;
3. card superior `Familiares de [Primeiro Nome]`;
4. cards-resumo de vínculos;
5. seções de Pais, Filhos, Pets, Cônjuges e Irmãos;
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
- Pets;
- Cônjuges;
- Irmãos.

Eles funcionam como âncoras para:

```txt
#vinculos-pais
#vinculos-filhos
#vinculos-pets
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

Contagens:

- **Filhos** deve contar apenas humanos;
- **Pets** deve contar pessoas com `humano_ou_pet === 'Pet'`;
- pendências de pets devem entrar em contagem própria, não em filhos humanos.

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

Regra visual: manter o botão principal do cabeçalho e não reintroduzir botão duplicado dentro do estado vazio.

### Filhos

Confirma filhos humanos e permite informar outro pai/mãe quando aplicável.

Regras:

- não exibir pets nesta seção;
- rótulos `Filho`, `Filha` e `Filho(a)` dependem apenas de dado cadastrado;
- não inferir gênero por nome;
- o campo auxiliar deve usar microcopy como `Outro pai ou mãe`.

### Pets

Confirma pets associados à família.

Regras:

- pet é identificado por `humano_ou_pet === 'Pet'`;
- pets não devem aparecer em Filhos;
- filhos humanos não devem aparecer em Pets;
- criação manual no grupo Pets deve salvar pessoa local com `humano_ou_pet: 'Pet'`;
- se o modelo técnico ainda usar relacionamento parental por compatibilidade, a UI deve tratar semanticamente como tutela/pet;
- enquanto não houver tipo de relacionamento `tutor`, manter TODO técnico documentado e evitar migration desnecessária.

Microcopy:

```txt
Outros tutores
```

Não usar `Alterar mãe` ou `Alterar pai` para pets.

### Cônjuges

Registra relacionamentos relevantes para a árvore familiar.

Regras vigentes:

- pode haver vários cônjuges cadastrados/históricos;
- no máximo um relacionamento conjugal pode ficar ativo por vez;
- todos os cônjuges podem ficar inativos;
- se a pessoa em revisão estiver falecida, nenhum cônjuge pode ficar ativo;
- se o cônjuge estiver falecido, esse relacionamento deve ficar inativo;
- checkbox de relacionamento ativo deve ser bloqueado/protegido quando a pessoa ou o cônjuge estiver falecido;
- ao ativar um cônjuge, os demais devem ser marcados como inativos.

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
- controles específicos, como `Outro pai ou mãe` em filhos e `Outros tutores` em pets;
- ação `Solicitar controle do perfil`, quando aplicável.

Não exibem chips de nascimento/local dentro do card de vínculo.

---

## 9. Status visuais

| Status | Quando aparece |
|---|---|
| `Pré-cadastrado` | Pessoa cadastrada na árvore sem usuário/auth user vinculado. |
| `Cadastrado` | Pessoa com usuário/auth user vinculado. |
| `Em análise` | Vínculo adicionado ou alterado nesta revisão. |
| `Remoção em análise` | Usuário solicitou remoção de vínculo existente. |
| `Controle em análise` | Usuário solicitou controle de perfil. |

Regras:

- não usar `Ativo` como badge de pessoa vinculada; o rótulo vigente é `Cadastrado`;
- remoção solicitada não deve sumir imediatamente da tela;
- card com remoção deve permitir desfazer quando o fluxo permitir;
- `Controle em análise` não deve ser confundido com alteração de vínculo;
- vínculo novo selecionado pela busca conta como adição pendente;
- pessoa com `auth_user_id`, vínculo em `user_person_links` ou perfil vinculado não deve cair em `Pré-cadastrado`.

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
- busca não faz merge automático de duplicidades existentes;
- se o grupo aberto for Pets, pessoa existente selecionada deve ser pet;
- se a pessoa buscada for pet, ela não deve ser adicionada em Filhos humanos.

---

## 11. Criação manual

Quando a pessoa correta não aparece na busca, o usuário pode criar novo cadastro manualmente.

A criação manual preserva o fluxo de revisão:

- pessoa criada entra como vínculo pendente;
- card aparece como `Em análise`;
- alteração é considerada no resumo/finalização.

Regras por grupo:

| Grupo | `humano_ou_pet` esperado |
|---|---|
| Pais | `Humano` |
| Filhos | `Humano` |
| Pets | `Pet` |
| Cônjuges | `Humano` |
| Irmãos | `Humano` |

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

## 13. Filho, filha, outro pai/mãe e tutor de pet

Labels de filhos:

| Dado de gênero | Label |
|---|---|
| masculino/homem/male | `Filho` |
| feminino/mulher/female | `Filha` |
| ausente/desconhecido | `Filho(a)` |

Regras:

- não inferir gênero pelo nome;
- usar apenas dado cadastrado;
- dropdown `Outro pai ou mãe` deve tentar pré-selecionar responsável conhecido pelos relacionamentos existentes;
- não usar hard-code de nomes específicos.

Para pets:

- label do vínculo deve ser `Pet`;
- controle auxiliar deve usar `Outros tutores`;
- não chamar pet de filho no texto da UI;
- o modelo técnico pode continuar usando `pai`/`mae` como compatibilidade até existir relacionamento específico de tutor.

---

## 14. Rascunhos locais

A página usa `sessionStorage` para preservar rascunho da revisão de vínculos durante o onboarding.

Regras:

- rascunhos antigos sem chave `pets` devem continuar funcionando;
- novos rascunhos devem preservar `pets`;
- remoções pendentes devem ter chave própria por grupo;
- alterações de cônjuges e outro pai/mãe/outros tutores não devem ser perdidas em navegação intermediária;
- não quebrar rascunho de `/meus-dados` nem rascunho de `/arquivos-historicos`.

---

## 15. Envio de alterações

Alterações em vínculos familiares são enviadas como pedidos pendentes, não como alteração direta de relacionamento real.

Regras:

- não criar relacionamento definitivo onde a UX indica revisão/admin;
- criar `relationship_change_requests` para adição, alteração ou remoção;
- evitar duplicidade de solicitação pendente;
- para pets, manter compatibilidade com o contrato atual e não criar tipo inválido;
- quando usar relacionamento parental por compatibilidade técnica para pet, documentar como TODO e manter a semântica visual de pet/tutela.

---

## 16. Bloco final de confirmação

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

## 17. Modularização

| Arquivo | Responsabilidade |
|---|---|
| `RelationshipOverview.tsx` | Card superior e cards-resumo com âncoras. |
| `RelationshipGroupPanel.tsx` | Seção de grupo familiar, contador, estado vazio e botão adicionar. |
| `RelativeCard.tsx` | Card individual, badges, remoção compacta e controles de vínculo. |
| `ProfileControlRequestDialog.tsx` | Modal de solicitação de controle de perfil. |
| `meusVinculosUtils.ts` | Helpers de pluralização, status, labels, pets e detecção auxiliar. |
| `types.ts` | Tipos compartilhados, incluindo `pets` em `RelationshipGroupKey`. |

`MeusVinculos.tsx` deve continuar como orquestrador, não como componente visual monolítico.

---

## 18. Regras preservadas

- carregamento dos vínculos;
- separação visual de pets;
- rascunho local;
- busca de pessoa existente;
- criação manual;
- solicitação de controle;
- remoção e desfazer;
- envio de alterações;
- navegação do onboarding;
- compatibilidade com pessoa viva/falecida;
- proteção de cônjuge ativo;
- não regressão de filhos humanos.

---

## 19. Limitações atuais

- solicitação de controle pode depender de persistência futura;
- busca previne duplicidade básica, mas não corrige duplicidades existentes;
- não há merge automático;
- aprovação administrativa não ocorre nesta tela;
- gênero só é usado quando vem preenchido nos dados;
- pets ainda usam compatibilidade técnica do modelo de vínculo parental até haver relacionamento `tutor`;
- qualquer migration para novo relacionamento de tutor deve ser frente própria.

---

## 20. QA manual mínimo

- abrir `/meus-vinculos`;
- verificar `Familiares de [Primeiro Nome]`;
- verificar que o painel lateral não aparece;
- clicar em cards-resumo e validar âncoras;
- validar pluralização;
- validar cards-resumo de Pais, Filhos, Pets, Cônjuges e Irmãos;
- validar que pets não aparecem em Filhos;
- validar que filhos humanos não aparecem em Pets;
- adicionar familiar por busca;
- adicionar pet por busca;
- criar familiar manualmente;
- criar pet manualmente;
- tentar duplicar pessoa no mesmo grupo;
- tentar adicionar humano em Pets e pet em Filhos;
- solicitar remoção;
- desfazer remoção;
- solicitar controle de perfil;
- verificar `Pré-cadastrado`, `Cadastrado`, `Em análise`, `Remoção em análise` e `Controle em análise`;
- validar `Filho`, `Filha` e `Filho(a)` quando houver dados;
- validar pré-seleção de outro pai/mãe conhecido;
- validar `Outros tutores` em pets;
- validar que só um cônjuge pode ficar ativo;
- validar que cônjuge falecido não pode ficar ativo;
- confirmar e continuar;
- testar mobile em 320px, 375px, 390px e 430px.

## Atualização 2026-06-22 — Prompts 7B e 7D

### Prompt 7B + 7D — vínculos, pets, cônjuges e UX

- `Pets` é grupo próprio e não deve ser misturado com `Filhos`.
- Pessoa com `humano_ou_pet: 'Pet'` deve ser removida de grupos humanos durante a normalização.
- Criação manual de pet deve usar `humano_ou_pet: 'Pet'`.
- Estado local deve manter no máximo um cônjuge ativo. Ao marcar/adicionar um cônjuge ativo, os demais ficam inativos no estado local.
- Badge `Cadastrado` depende de vínculo real em `user_person_links`; caso contrário, usar `Pré-cadastrado`.
- Alterações de vínculo seguem como solicitação pendente em `relationship_change_requests`, não como relacionamento definitivo direto.
- Botões inferiores de adicionar em estado vazio foram removidos; manter apenas botão superior do grupo.
- `Sobre mim` fica fora do box de textos gerados, com maior hierarquia visual e ícone.
- `Familiares de [Nome]` fica fora do container, com maior hierarquia visual e ícone/avatar.
- Botão `Salvar textos` foi removido; textos editados são salvos quando o usuário avança.
- Rótulo de irmã deve respeitar gênero feminino (`Irmã`), evitando `Irmão(a)` quando houver sinal de gênero.
