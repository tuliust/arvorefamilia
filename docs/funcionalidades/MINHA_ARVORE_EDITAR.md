# Minha Árvore - edição do próprio perfil

> Última revisão: 2026-06-08  
> Local canônico: `docs/funcionalidades/MINHA_ARVORE_EDITAR.md`  
> Tipo: documentação funcional e técnica da rota `/minha-arvore/editar`.  
> Status: revisado na auditoria documental final.

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

Documentos relacionados:

```txt
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
docs/funcionalidades/TIMELINE.md
docs/funcionalidades/NOTIFICACOES.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

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
src/app/services/storageService.ts
src/app/services/permissionService.ts
src/app/utils/buildPersonTimeline.ts
src/app/utils/personFields.ts
src/app/utils/personEntity.ts
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
- preservar responsividade em mobile.

---

## 5. Dados pessoais

O bloco **Meus dados** contém os campos principais da pessoa vinculada.

Campos editáveis atuais:

| Campo | Observação |
|---|---|
| Nome completo | Obrigatório para humano. |
| Data de nascimento | Aceita data completa ou ano, conforme validação. |
| Local de nascimento | Normalizado para formato `Cidade/UF` quando aplicável. |
| Cidade de residência | Campo `local_atual`. |
| Profissão | Opcional. |
| Telefone | Formatado localmente. |
| Endereço | Pode usar Google Places quando configurado. |
| Complemento | Campo visual local; ainda não persiste em `pessoas` enquanto o schema/tipagem não suportarem. |
| Redes sociais | UI permite múltiplas linhas, mas o fluxo atual sincroniza a primeira linha para campos legados. |
| Mini bio | Campo livre. |
| Curiosidades de Vida | Campo livre. |

Regras:

- não exibir campo de edição de **Signo**;
- signo/astrologia são derivados de dados de nascimento e/ou insights gerados;
- preferências de notificação pertencem a `/ajustar-notificacoes`;
- alterações em campos chamam `markFormDirty`;
- validação passa por `validateEditablePersonForm`;
- payload final passa por `cleanPersonPayload`.

Ponto futuro registrado no plano:

```txt
Complemento e múltiplas redes sociais existem parcialmente na UI, mas não persistem integralmente no modelo atual.
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

Ponto de atenção registrado no plano:

```txt
Há strings quebradas por encoding em MinhaArvore.tsx, como "Arquivos Hist?ricos" e "Sess?o encerrada.".
```

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
8. salvar arquivos históricos;
9. salvar eventos da vida;
10. atualizar perfil via `ensureMemberProfile`;
11. salvar ou solicitar alterações de casamento;
12. remover rascunho;
13. limpar dirty state;
14. exibir toast de sucesso ou alerta parcial.

Regras:

- erro de upload de foto interrompe salvamento;
- erro de dados pessoais interrompe salvamento;
- erro em arquivos ou eventos gera alerta parcial;
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
- saída sem confirmação quando houver alterações pendentes;
- avatar sem ação de visualização/edição;
- botão **Trocar Senha** que salva formulário ou limpa rascunho;
- strings quebradas por encoding.

---

## 16. Checklist de QA

Validar manualmente:

- `/minha-arvore/editar` em mobile, tablet e desktop;
- carregar usuário com vínculo;
- editar dados e salvar;
- editar foto com crop;
- remover foto;
- acionar **Trocar Senha**;
- editar local de nascimento/residência;
- adicionar/remover rede social;
- confirmar que apenas a primeira rede persiste nos campos legados;
- verificar comportamento do campo Complemento;
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
