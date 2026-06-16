# Minha Árvore - edição do próprio perfil

> Última revisão: 2026-06-15
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_EDITAR.md`
> Tipo: documentação funcional e técnica da rota `/minha-arvore/editar`.
> Status: atualizado para separar `/minha-arvore/editar` do cadastro inicial em 5 etapas e documentar a nova distribuição de Arquivos Históricos, Preferências e Revisão final.

---

## 1. Função deste documento

Este documento descreve a página em que o membro autenticado revisa e edita os próprios dados familiares.

Rota:

```txt
/minha-arvore/editar
```

Componente principal:

```txt
src/app/pages/MinhaArvore.tsx
```

A página é diferente de `/meus-dados`: ela concentra uma experiência mais completa de edição da própria árvore, incluindo dados pessoais, avatar, vínculos familiares, arquivos históricos, eventos da vida, troca de senha e proteção contra saída sem salvar.

O fluxo de cadastro inicial é separado da edição completa:

```txt
Etapa 1: /meus-dados
Etapa 2: /meus-vinculos
Etapa 3: /arquivos-historicos
Etapa 4: /preferencias
Etapa 5: /revisao-dados
```

No cadastro inicial:

- Arquivos Históricos pertencem à Etapa 3, em `/arquivos-historicos`;
- Preferências de notificação e Permissões de exibição pertencem à Etapa 4, em `/preferencias`;
- `/revisao-dados` é apenas a revisão final e a finalização do fluxo.

Documentos relacionados:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/TIMELINE.md
docs/funcionalidades/NOTIFICACOES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_COMPONENTES.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

### 1.1 Exceção nominal na baseline atual

A rota `/minha-arvore/editar` é vigente e deve permanecer documentada.

Ela **não** reativa a antiga view de árvore `/minha-arvore`.

Contrato atual:

| Rota | Status | Função |
|---|---|---|
| `/minha-arvore/editar` | Vigente | edição do membro, dados, vínculos, arquivos e eventos |
| `/minha-arvore` | Removida como view ativa | não restaurar |
| `/mapa-familiar` | Vigente | view vertical principal da árvore |
| `/mapa-familiar-horizontal` | Vigente | view horizontal/genealógica |

Regras:

- links de navegação principal para árvore devem usar `/mapa-familiar` ou `/mapa-familiar-horizontal`;
- documentação desta página não deve ser usada para restaurar a antiga view `/minha-arvore`;
- CSS com nome `minha-arvore` é permitido apenas quando escopado à rota de edição.

## 2. Arquivos principais

```txt
src/app/pages/MinhaArvore.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/services/memberProfileService.ts
src/app/services/memberTreeService.ts
src/app/services/dataService.ts
src/app/services/relationshipChangeRequestService.ts
src/app/services/arquivosHistoricosService.ts
src/app/services/personEventsService.ts
src/app/services/pessoaSocialProfilesService.ts
src/app/services/storageService.ts
src/app/services/permissionService.ts
src/app/utils/buildPersonTimeline.ts
src/app/utils/personFields.ts
src/app/utils/personEntity.ts
src/styles/mobile-edit-profile.css
```

Dependências relevantes:

```txt
react-easy-crop
Supabase Auth
Google Places via VITE_GOOGLE_MAPS_API_KEY
sessionStorage
```

---

## 3. Proteção de rota

A rota `/minha-arvore/editar` é protegida por `MemberRoute`.

Regras:

- usuário não autenticado deve ser redirecionado para `/entrar`;
- usuário autenticado pode acessar a página, mas operações sensíveis continuam dependendo de vínculo, service, RPC/RLS e permissões;
- a página não usa `TreeAccessRoute`;
- o vínculo primário é resolvido por `getPrimaryLinkedPerson`;
- o primeiro acesso pode ser resolvido por `resolveFirstAccessLinkForUser`.

---

## 4. Estrutura visual

A página usa:

- `MemberPageHeader`;
- `PAGE_CONTAINER_CLASS`;
- card superior de identidade com avatar e resumo;
- botão **Trocar Senha**;
- cards de resumo de vínculos;
- bloco **Meus dados**;
- bloco **Arquivos Históricos**;
- bloco **Eventos da Vida**;
- bloco **Vínculos familiares**;
- botão flutuante de salvamento;
- modal de foto;
- modal de adicionar vínculo;
- modal de saída sem salvar.

Regras visuais:

- não criar header próprio se `MemberPageHeader` atende;
- não exibir botão **Sair** no header da página;
- o salvamento principal fica no botão flutuante;
- não reintroduzir botão interno **Salvar meus dados** no bloco de dados;
- `Trocar Senha` deve ser ação independente, sem submeter formulário;
- preservar responsividade em mobile;
- ajustes visuais mobile devem permanecer restritos à rota/tela da edição.

### 4.1 Acabamento mobile consolidado

A frente mobile de 2026-06-08 adicionou ajustes específicos para telas estreitas.

Arquivo de estilo:

```txt
src/styles/mobile-edit-profile.css
```

Esse CSS é importado em:

```txt
src/main.tsx
```

Escopo:

```css
main:has(#minha-arvore-edit-form)
```

Regras consolidadas:

- o CSS mobile da página deve ser escopado pelo formulário `#minha-arvore-edit-form`;
- não usar seletores genéricos como `main section:first-of-type` sem escopo;
- o card superior deve ficar compacto em mobile;
- o avatar superior permanece como ação principal de foto;
- o nome do membro deve ficar menor e limitado a duas linhas;
- o subtítulo do card superior deve começar abaixo da foto, alinhado à esquerda;
- o botão **Trocar Senha** deve ficar menor em mobile;
- os cards **Pais**, **Irmãos**, **Cônjuges**, **Filhos** e **Pets** devem ficar em uma única linha de cinco colunas;
- os cards de resumo devem preservar legibilidade em 320px, 375px, 390px e 430px;
- placeholders de **Mini bio** e **Curiosidades de Vida** devem ser menores em mobile para evitar blocos visualmente pesados.

Não fazer:

- aplicar esse CSS a páginas internas genéricas;
- esconder informação crítica apenas para caber em 320px;
- remover `aria-label`/`title` de ações compactas;
- alterar payload, schema ou validação por causa de ajuste visual.

---

## 5. Dados pessoais

O bloco **Meus dados** contém os campos principais da pessoa vinculada.

Campos editáveis atuais:

| Campo | Observação |
|---|---|
| Nome completo | Obrigatório para humano. |
| Dia ou Ano de Nascimento | Aceita `AAAA` ou `DD/MM/AAAA`, conforme validação. |
| Local de nascimento | Normalizado para formato `Cidade/UF` quando aplicável. |
| Cidade de residência | Campo `local_atual`. |
| Profissão | Opcional. |
| WhatsApp | Usa o campo legado `telefone`, formatado localmente. |
| Endereço | Pode usar Google Places quando configurado. |
| Complemento | Persistido em `public.pessoas.complemento`; serve para dado manual separado do endereço Google Places, como apartamento, bloco, torre, casa ou referência interna. |
| Redes sociais | UI permite múltiplas linhas e persiste os perfis em `pessoa_social_profiles`; a primeira linha continua sincronizada com campos legados por compatibilidade. |
| Mini bio | Campo livre. |
| Curiosidades de Vida | Campo livre. |

Regras:

- não exibir campo de edição de **Signo**;
- signo/astrologia são derivados de dados de nascimento e/ou insights gerados;
- preferências de notificação pertencem a `/ajustar-notificacoes`;
- alterações em campos chamam `markFormDirty`;
- validação passa por `validateEditablePersonForm`;
- payload final passa por `cleanPersonPayload`.

Estado atual de persistência:

```txt
Redes sociais múltiplas são carregadas e salvas por pessoa_social_profiles.
A primeira rede social permanece sincronizada com os campos legados em pessoas para compatibilidade.
Complemento é carregado e salvo em public.pessoas.complemento, separado do endereço principal.
Selecionar novo endereço via Google Places deve atualizar apenas endereco e não apagar complemento.
```


### 5.1 Relação com `/meus-dados`

`/meus-dados` é a Etapa 1 do cadastro inicial e usa um recorte mais orientado à confirmação rápida dos dados do membro.

Contratos que devem permanecer alinhados entre `/meus-dados` e `/minha-arvore/editar`:

- validação por `validateEditablePersonForm`;
- normalização por `cleanPersonPayload`;
- suporte a `AAAA` ou `DD/MM/AAAA` para nascimento e falecimento;
- persistência de redes sociais em `pessoa_social_profiles`;
- primeira rede social sincronizada com campos legados;
- endereço principal separado de `complemento`;
- dados de falecimento condicionados ao status `falecido`.

Diferença funcional:

```txt
/minha-arvore/editar = edição completa e recorrente do perfil.
/meus-dados = etapa inicial de cadastro/confirmação.
```



Services relacionados:

```txt
updateOwnLinkedPerson
buildEditablePersonFormState
cleanPersonPayload
listarPessoaSocialProfiles
substituirPessoaSocialProfiles
buildSocialProfilesFromRows
```

Migration relacionada:

```txt
supabase/migrations/20260611013000_add_complemento_to_pessoas.sql
```

---

## 6. Avatar e foto do perfil

A edição de foto acontece pelo avatar superior.

Fluxo:

1. clicar no avatar;
2. abrir modal;
3. visualizar foto existente ou estado vazio;
4. selecionar imagem;
5. ajustar corte com `react-easy-crop`;
6. aplicar corte;
7. marcar formulário como alterado;
8. persistir apenas no salvamento principal.

Regras:

- botões do modal usam `type="button"`;
- remover foto marca `photoMarkedForRemoval`;
- aplicar crop cria `croppedPhotoBlob`;
- upload definitivo ocorre em `uploadPersonAvatarFile`;
- erro no upload interrompe o salvamento principal;
- não reintroduzir botões duplicados **Alterar**/**Remover** no corpo do formulário.

Texto esperado no modal:

```txt
O corte final será quadrado.
```

---

## 7. Trocar senha

A ação **Trocar Senha** usa Supabase Auth:

```txt
supabase.auth.resetPasswordForEmail(...)
```

Regras:

- usar e-mail do usuário autenticado;
- não salvar senha no frontend;
- não registrar senha em log;
- não criar backend paralelo;
- não marcar formulário como alterado;
- não limpar rascunho;
- não submeter o formulário principal;
- botão deve usar `type="button"`;
- redirect configurado para `/entrar`.

---

## 8. Vínculos familiares

A página exibe e permite solicitar ou executar alterações em vínculos familiares.

Grupos principais:

```txt
pais
irmaos
conjuges
filhos
pets
```

Resumo técnico:

- `buildMemberTreeSummary` monta pais, filhos, irmãos, cônjuges e escopos;
- `filhosHumanos` filtra `resumo.filhos` com `isHumanFamilyMember`;
- `petsVinculados` filtra `resumo.filhos` com `isPetFamilyMember`;
- o card **Filhos** conta apenas humanos;
- o card **Pets** conta pets vinculados tecnicamente como filhos.

Regras:

- admin pode criar/remover vínculos diretamente;
- usuário comum envia solicitação via `relationshipChangeRequestService`;
- criação direta usa `adicionarRelacionamentoComInverso`;
- remoção direta usa `excluirRelacionamentoComInverso`;
- alterações de casamento podem atualizar relacionamento direto para admin ou gerar solicitação para usuário comum;
- falhas em vínculo não devem apagar dados pessoais salvos.

---

### 8.1 Múltiplos relacionamentos e consistência com a árvore

A edição de vínculos deve aceitar que uma pessoa tenha mais de um relacionamento conjugal ao longo da vida.

Regras:

- não substituir relacionamento conjugal existente apenas porque outro foi adicionado;
- manter `data_casamento`, `local_casamento`, `data_separacao`, status e subtipo quando o schema permitir;
- múltiplos cônjuges devem ser preservados para que `/mapa-familiar` possa exibir núcleos conjugais adicionais;
- filhos devem continuar associados por relacionamentos parentais explícitos;
- a edição não deve criar vínculos visuais apenas para resolver layout;
- usuário comum solicita alteração; admin pode executar diretamente conforme permissão.

Impacto nas views:

- `/mapa-familiar` pode agrupar filhos por outro pai/mãe quando há relacionamento explícito;
- `/mapa-familiar-horizontal` deve considerar cônjuges conforme filtros e geração;
- o perfil e a timeline devem refletir todos os relacionamentos preservados.

## 9. Dados de casamento

Para cônjuges, a página pode exibir/editar:

- `data_casamento`;
- `local_casamento`.

Fluxo:

- alteração marca formulário como sujo;
- `saveMarriageChanges` roda após dados pessoais, arquivos e eventos;
- usuário comum envia solicitação de alteração;
- admin atualiza relacionamento principal e inverso quando houver;
- erro de local de casamento marca o campo e gera alerta parcial;
- falecimento de cônjuge não deve ser tratado automaticamente como separação.

---

## 10. Arquivos Históricos

A seção **Arquivos Históricos** fica em container próprio, fora de **Meus dados**.

Componente:

```txt
src/app/components/ArquivosHistoricos.tsx
```

Service:

```txt
listarArquivosHistoricosPorPessoa
substituirArquivosHistoricosDaPessoa
```

Regras:

- seção tem título externo único;
- o componente interno recebe `showTitle={false}`;
- botão de adicionar usa variante compacta `addButtonVariant="icon"`;
- alterações chamam `markFormDirty`;
- arquivos são salvos no submit principal;
- se dados pessoais salvarem e arquivos falharem, exibir erro parcial.

Estado documental: as strings quebradas por encoding foram corrigidas na origem. Novas ocorrências de mojibake devem ser tratadas como regressão e investigadas no arquivo fonte, não por workaround global de runtime.

---

## 11. Eventos da Vida

A seção **Eventos da Vida** combina timeline derivada e eventos manuais.

Componentes/services:

```txt
PersonTimeline
PersonEventsEditor
buildPersonTimeline
listarEventosDaPessoa
salvarEventosDaPessoa
```

Regras:

- `PersonTimeline` exibe eventos automáticos e manuais;
- quando `PersonTimeline` é usado de forma embutida na edição, o título redundante **Eventos automáticos e manuais** deve permanecer oculto;
- `PersonEventsEditor` permite edição de eventos manuais;
- evento manual sem título bloqueia salvamento;
- eventos são salvos no submit principal;
- falha ao salvar eventos gera erro parcial depois de dados pessoais salvos;
- ausência de eventos não deve quebrar a UI.

Eventos automáticos podem derivar de:

- nascimento;
- casamento;
- nascimento de filhos;
- falecimento;
- arquivos históricos;
- eventos manuais persistidos.

---

## 12. Rascunho local

A página usa `sessionStorage` como proteção auxiliar.

Chave:

```txt
minha-arvore-draft:{userId}:{pessoaId}
```

Persistido no rascunho:

- `form`;
- `complemento`;
- `socialProfiles`;
- `personEvents`.

Regras:

- rascunho não substitui persistência no banco;
- falha de `sessionStorage` não bloqueia edição;
- salvar remove o rascunho;
- confirmar saída sem salvar remove o rascunho;
- rascunho deve ser isolado por usuário e pessoa.

---

## 13. Saída sem salvar

A página protege alterações não salvas por:

- `beforeunload`;
- interceptação de links internos;
- interceptação de logout via menu.

Mensagem consolidada:

```txt
Deseja sair sem salvar os ajustes?
```

Botões esperados:

```txt
Continuar editando
Sair sem salvar
```

Regras:

- **Continuar editando** fecha o modal;
- **Sair sem salvar** limpa rascunho e executa navegação/logout;
- sem alterações pendentes, navegação ocorre sem modal;
- após salvamento bem-sucedido, `isDirtyRef.current = false`.

---

## 14. Salvamento principal

Fluxo consolidado:

1. prevenir submit padrão;
2. validar usuário e pessoa vinculada;
3. normalizar/validar formulário;
4. bloquear evento manual sem título;
5. preparar payload com `cleanPersonPayload`;
6. remover foto ou enviar novo avatar, se necessário;
7. atualizar pessoa via `updateOwnLinkedPerson`;
8. salvar redes sociais versionadas via `substituirPessoaSocialProfiles`;
9. salvar arquivos históricos;
10. salvar eventos da vida;
11. atualizar perfil via `ensureMemberProfile`;
12. salvar ou solicitar alterações de casamento;
13. remover rascunho;
14. limpar dirty state;
15. exibir toast de sucesso ou alerta parcial.

Regras:

- erro de upload de foto interrompe salvamento;
- erro de dados pessoais interrompe salvamento;
- erro em redes sociais, arquivos ou eventos gera alerta parcial quando os dados pessoais já foram salvos;
- casamento com erro não deve desfazer dados pessoais já salvos;
- mensagens devem ser claras para o usuário.

---

## 15. Antirregressões

Não reintroduzir:

- campo **Signo** editável;
- preferências de notificação nesta página;
- botão interno **Salvar meus dados**;
- botão **Sair** no header;
- botões duplicados de foto no corpo do formulário;
- contagem de pets dentro de **Filhos**;
- ausência do card **Pets** quando houver pets;
- arquivos históricos dentro do container de dados pessoais;
- título duplicado dentro de `ArquivosHistoricos`;
- título redundante **Eventos automáticos e manuais** dentro da área embutida;
- saída sem confirmação quando houver alterações pendentes;
- avatar sem ação de visualização/edição;
- botão **Trocar Senha** que salva formulário ou limpa rascunho;
- strings quebradas por encoding;
- workaround global de correção de texto em runtime para mascarar mojibake;
- CSS mobile não escopado afetando outras páginas.

---

## 16. Checklist de QA

Validar manualmente:

- `/minha-arvore/editar` em mobile, tablet e desktop;
- mobile em 320px, 375px, 390px e 430px;
- card superior com nome em até duas linhas;
- subtítulo abaixo da foto;
- cards **Pais**, **Irmãos**, **Cônjuges**, **Filhos** e **Pets** em uma linha no mobile;
- placeholders de **Mini bio** e **Curiosidades de Vida** legíveis e menores;
- carregar usuário com vínculo;
- editar dados e salvar;
- editar foto com crop;
- remover foto;
- acionar **Trocar Senha**;
- editar local de nascimento/residência;
- adicionar/remover múltiplas redes sociais;
- confirmar que múltiplas redes persistem em `pessoa_social_profiles`;
- confirmar que a primeira rede continua sincronizada nos campos legados;
- verificar comportamento local do campo Complemento;
- adicionar/remover arquivo histórico;
- adicionar evento manual;
- tentar salvar evento manual sem título;
- editar data/local de casamento;
- usuário comum enviando solicitação de vínculo;
- admin criando/removendo vínculo;
- saída sem salvar por link interno;
- logout com alterações pendentes;
- refresh/fechamento de aba com alterações pendentes.

Comandos técnicos:

```bash
npm run build
git diff --check
git status --short
```

## 17. Anti-regressões específicas desta rota

Checklist:

- [ ] `/minha-arvore/editar` continua protegida por `MemberRoute`.
- [ ] `/minha-arvore` não volta como view ativa.
- [ ] CSS mobile permanece escopado ao formulário de edição.
- [ ] Cards de resumo Pais/Irmãos/Cônjuges/Filhos/Pets continuam legíveis em 320px, 375px, 390px e 430px.
- [ ] Múltiplos cônjuges não são sobrescritos por salvamento parcial.
- [ ] Pets continuam separados semanticamente por `humano_ou_pet === 'Pet'`.
- [ ] `Complemento` não é apagado ao selecionar novo endereço via Google Places.
- [ ] Redes sociais múltiplas continuam persistidas em `pessoa_social_profiles`.

## Fase 2 - Padronização incremental de formulários

- `/minha-arvore/editar` mantém o caráter de edição completa, sem reutilizar `MemberOnboardingSteps` fora do onboarding.
- Os campos de datas, locais, contato, endereço, redes sociais, Mini bio e Curiosidades passam a seguir os padrões compartilhados usados nas páginas recentes de membro.
- O botão de IA em Mini bio/Curiosidades é uma ação auxiliar compacta; não transforma a página em revisão final nem substitui o fluxo de onboarding.
- Arquivos Históricos usam o modo interativo com categorias que expandem a área de upload, preservando rascunho e salvamento existentes.
