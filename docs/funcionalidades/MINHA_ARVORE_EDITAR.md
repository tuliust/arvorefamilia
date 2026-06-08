# Minha Árvore - edição do próprio perfil

> Última revisão: 2026-06-08  
> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_EDITAR.md`  
> Tipo: documentação funcional e técnica da rota `/minha-arvore/editar`.

---

## 1. Objetivo

Este documento registra o comportamento esperado da página em que o membro edita os próprios dados familiares.

Rota principal:

```txt
/minha-arvore/editar
```

Componente principal:

```txt
src/app/pages/MinhaArvore.tsx
```

A página permite que o usuário autenticado revise e edite dados da pessoa vinculada ao seu perfil. Ela é mais completa do que `/meus-dados`, pois também inclui avatar, vínculos familiares, arquivos históricos, eventos da vida, troca de senha e proteção contra saída sem salvar.

---

## 2. Documentos relacionados

```txt
docs/README.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md
docs/funcionalidades/NOTIFICACOES.md
docs/funcionalidades/TIMELINE.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

Este documento não substitui:

- `PESSOAS_PERFIL_ADMIN.md`, que cobre perfil público, admin de pessoa, reset de perfil e fluxos de sugestão;
- `MINHA_ARVORE_VIEW.md`, que cobre a visualização da árvore;
- `TIMELINE.md`, que cobre regras gerais de timeline quando aplicável;
- `ROTAS_E_GUARDS.md`, que define proteção e redirecionamentos.

---

## 3. Arquivos principais

```txt
src/app/pages/MinhaArvore.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/ui/dialog.tsx
src/app/components/ui/button.tsx
src/app/lib/supabaseClient.ts
src/app/services/memberProfileService.ts
src/app/services/arquivosHistoricosService.ts
src/app/services/personEventsService.ts
src/app/services/storageService.ts
src/app/utils/buildPersonTimeline.ts
src/app/utils/personFields.ts
src/app/utils/personEntity.ts
```

Services e utils relacionados:

```txt
updateOwnLinkedPerson
ensureMemberProfile
getPrimaryLinkedPerson
resolveFirstAccessLinkForUser
listarArquivosHistoricosPorPessoa
substituirArquivosHistoricosDaPessoa
uploadPersonAvatarFile
buildPersonTimeline
isHumanFamilyMember
isPetFamilyMember
buildEditablePersonFormState
cleanPersonPayload
validateEditablePersonForm
supabase.auth.resetPasswordForEmail
```

---

## 4. Proteção de rota

A rota usa `MemberRoute`.

Regra:

- usuário não autenticado deve ir para `/entrar`;
- usuário autenticado pode acessar a área de edição conforme vínculo e permissões;
- permissões sensíveis continuam dependendo de service/RLS, não apenas da UI;
- não usar `TreeAccessRoute` nesta rota.

---

## 5. Estrutura visual da página

A página usa:

- `MemberPageHeader`;
- container padronizado por `PAGE_CONTAINER_CLASS`;
- card superior com avatar/nome;
- ação **Trocar Senha**;
- bloco **Meus dados**;
- seções de vínculos familiares;
- cards/resumos de relações;
- bloco separado **Arquivos Históricos**;
- bloco **Eventos da Vida**;
- botão flutuante de salvamento.

Regras visuais consolidadas:

- não criar header próprio se `MemberPageHeader` atender;
- o botão **Sair** não deve aparecer no header desta página;
- manter ação principal de salvar no botão flutuante;
- evitar botões duplicados de salvamento dentro dos containers;
- manter espaçamento consistente entre cards;
- preservar responsividade mobile;
- a ação **Trocar Senha** não deve competir com o botão flutuante de salvamento nem submeter o formulário.

---

## 6. Bloco Meus dados

O bloco **Meus dados** deve conter campos pessoais editáveis e terminar após o campo **Curiosidades da Vida**.

Campos esperados:

- Nome completo;
- Data de nascimento;
- Local de nascimento;
- Cidade de residência;
- Profissão;
- Telefone;
- Endereço;
- Complemento;
- Redes sociais;
- Mini bio;
- Curiosidades da Vida.

Regras consolidadas:

- não exibir campo de edição de **Signo**;
- não exibir preferências de notificação nesta página;
- não exibir botão interno **Salvar meus dados**;
- salvamento deve ocorrer pelo botão flutuante;
- alterações nos campos devem marcar o formulário como alterado.

Motivo:

```txt
Signo é derivado da data de nascimento e não deve ser editado manualmente.
Preferências de notificação pertencem a /ajustar-notificacoes.
```

---

## 7. Avatar e foto do perfil

O avatar/foto ao lado do nome, na área superior da página, é o ponto único para edição/exclusão de foto.

Comportamento esperado:

1. Clicar no avatar abre modal de foto.
2. Se houver foto, exibir imagem ampliada.
3. Se não houver foto, exibir estado para cadastrar imagem.
4. O modal permite:
   - visualizar foto;
   - alterar foto;
   - carregar nova imagem;
   - mover/cortar imagem;
   - aplicar corte;
   - remover foto.

Biblioteca usada para corte:

```txt
react-easy-crop
```

Regra consolidada em 2026-06-08:

```txt
Os botões duplicados "Alterar" e "Remover" não devem aparecer no corpo do formulário.
A edição e exclusão da foto devem ocorrer apenas pelo avatar superior.
```

Fluxo de alteração:

- selecionar arquivo;
- abrir crop;
- ajustar zoom/posição;
- aplicar corte;
- manter preview local;
- marcar formulário como alterado;
- salvar definitivamente apenas no submit principal.

Fluxo de remoção:

- remover preview local;
- limpar crop;
- marcar foto para remoção;
- marcar formulário como alterado;
- persistir remoção no submit principal.

Regras:

- botões internos do modal usam `type="button"`;
- remover foto não deve submeter o formulário;
- a ação de foto participa do dirty state;
- salvar persiste foto nova ou remoção;
- cancelar/fechar modal não deve salvar sem o botão principal.

Texto do modal:

```txt
O corte final será quadrado.
```

---

## 8. Trocar senha

A página exibe a ação **Trocar Senha** para o usuário autenticado.

Objetivo:

- permitir que o membro inicie o fluxo seguro de troca/redefinição de senha;
- evitar backend paralelo;
- reaproveitar o fluxo padrão do Supabase Auth;
- manter a troca de senha separada do salvamento de dados familiares.

Comportamento esperado:

1. O usuário clica em **Trocar Senha**.
2. A ação usa o e-mail do usuário autenticado.
3. O sistema chama o fluxo de reset de senha do Supabase Auth.
4. O botão pode exibir estado de carregamento, como **Enviando...**.
5. Em sucesso, exibir toast informando que as instruções foram enviadas.
6. Em erro, exibir toast com mensagem amigável.
7. A ação não deve marcar o formulário como alterado.
8. A ação não deve limpar rascunho, foto, arquivos históricos ou dados de casamento.

Implementação esperada:

```txt
supabase.auth.resetPasswordForEmail(...)
```

Regras:

- não criar migration;
- não alterar RLS;
- não expor service role;
- não salvar senha no frontend;
- não registrar senha em log;
- não submeter o formulário principal;
- botão deve usar `type="button"`.

---

## 9. Cards de vínculos familiares

A página permite revisar grupos familiares ligados à pessoa base.

Grupos principais:

```txt
pais
irmaos
conjuges
filhos
pets
```

Regra consolidada:

```txt
O card FILHOS deve contar apenas filhos humanos.
Pets vinculados tecnicamente como filhos devem ser separados no card PETS.
```

Critérios:

- usar helper semântico para humanos e pets, como `isHumanFamilyMember` e `isPetFamilyMember`;
- não misturar pets na contagem de filhos humanos;
- manter pets visíveis quando houver vínculo técnico;
- não alterar relacionamento real no banco apenas por mudança de contagem visual.

Comportamento esperado:

- grupos vazios usam mensagens claras;
- adição de parente pode usar pessoa existente ou nova pessoa simples, quando o fluxo permitir;
- cônjuges podem ter campos de casamento;
- alterações de casamento podem ser salvas diretamente ou enviadas como solicitação, conforme permissão;
- falhas de relacionamento não devem apagar dados pessoais já salvos.

---

## 10. Dados de casamento

Quando houver cônjuges, a página pode exibir/editar:

- data de casamento;
- local de casamento.

Regras:

- alteração em casamento deve marcar formulário como alterado;
- salvamento deve preservar demais dados da pessoa;
- se o usuário não puder editar diretamente, criar solicitação de alteração quando previsto;
- erros devem ser destacados no campo correspondente;
- falecimento de cônjuge não deve ser tratado automaticamente como separação.

---

## 11. Arquivos Históricos

A área **Arquivos Históricos** deve ficar em container próprio, separado de **Meus dados**.

Componente:

```txt
src/app/components/ArquivosHistoricos.tsx
```

Regras consolidadas em 2026-06-08:

- exibir título externo da seção uma única vez;
- remover título duplicado interno na área inferior;
- estado vazio deve exibir mensagem amigável;
- o botão de adicionar deve ser um botão compacto de **+** acima da mensagem de estado vazio;
- não usar o texto longo **Adicionar Arquivo** quando o layout pede o botão compacto;
- permitir adicionar arquivo;
- permitir revisar arquivo;
- permitir remover arquivo;
- alterações em arquivos devem marcar o formulário como alterado;
- arquivos devem ser salvos junto com o fluxo principal da página.

Texto de estado vazio:

```txt
Nenhum arquivo histórico adicionado.
```

Descrição sugerida:

```txt
Adicione, revise ou remova arquivos históricos associados ao seu perfil familiar.
```

Observação operacional:

- se o ambiente exibir `Hist?ricos`, `hist?ricos` ou outro texto com `?`, revisar encoding do arquivo e salvar como UTF-8.

---

## 12. Eventos da Vida

A página possui uma área de **Eventos da Vida**, também tratada como timeline do perfil.

Componentes relacionados:

```txt
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/person/PersonEventsEditor.tsx
src/app/utils/buildPersonTimeline.ts
src/app/services/personEventsService.ts
```

Objetivo:

- exibir fatos derivados automaticamente dos dados já existentes;
- permitir cadastro de eventos manuais;
- manter timeline ordenada cronologicamente;
- separar eventos reais persistidos de eventos calculados em memória.

### 12.1 Eventos automáticos

A timeline pode exibir eventos derivados de:

- nascimento;
- nascimento de filho;
- casamento;
- falecimento;
- falecimento de cônjuge;
- outros eventos inferidos a partir de dados já existentes.

Regras:

- eventos automáticos não exigem cadastro manual;
- eventos automáticos não devem duplicar eventos manuais equivalentes sem critério;
- casamento deve usar `data_casamento` quando disponível;
- quando a data estiver ausente ou inválida, usar fallback claro, sem inventar data;
- viuvez deve ser tratada separadamente de separação/divórcio.

### 12.2 Eventos manuais

O usuário pode adicionar eventos como:

- alistamento militar;
- mudança de cidade;
- imigração;
- formatura;
- profissão;
- viagem marcante;
- outros acontecimentos relevantes.

Regras:

- eventos manuais devem ser persistidos por service próprio;
- edição/criação de evento manual marca a página como alterada quando o fluxo estiver acoplado ao formulário;
- eventos devem ter título claro;
- data pode ser completa ou parcial, conforme suporte do componente;
- ausência de eventos manuais não deve quebrar a timeline.

---

## 13. Salvamento

O salvamento principal acontece pelo botão flutuante.

Fluxo esperado:

1. Normalizar campos.
2. Validar dados editáveis.
3. Preparar payload com `cleanPersonPayload`.
4. Se foto foi removida, enviar `foto_principal_url = ''` ou valor aceito pelo service.
5. Se nova foto/corte existe, fazer upload e usar URL retornada.
6. Atualizar pessoa via `updateOwnLinkedPerson`.
7. Atualizar perfil via `ensureMemberProfile`.
8. Salvar arquivos históricos.
9. Salvar/corrigir dados de casamento quando aplicável.
10. Salvar eventos manuais, quando o fluxo estiver integrado ao submit.
11. Limpar rascunho.
12. Marcar `isDirtyRef.current = false`.
13. Exibir toast de sucesso ou alerta parcial.

Regras:

- erro no upload da foto deve interromper salvamento;
- erro em arquivos históricos deve informar que dados pessoais foram salvos, mas arquivos falharam;
- após salvamento com sucesso, sair da página não deve abrir modal de alterações pendentes.

---

## 14. Rascunho local

A página usa rascunho auxiliar em `sessionStorage`.

Chave:

```txt
minha-arvore-draft:{userId}:{pessoaId}
```

Responsabilidade:

- proteger edições em andamento;
- restaurar dados se a tela for re-renderizada;
- remover rascunho ao salvar;
- remover rascunho ao confirmar saída sem salvar.

Cuidados:

- rascunho não substitui persistência no banco;
- falha de storage não deve bloquear a edição;
- rascunho deve ser por usuário e pessoa.

---

## 15. Confirmação de saída sem salvar

Quando houver alterações pendentes, a página deve exibir modal de confirmação antes de abandonar a edição.

Eventos interceptados:

- clique em links internos;
- logout;
- troca de rota;
- refresh/fechamento de aba com aviso nativo do navegador.

Mensagem consolidada:

```txt
Deseja sair sem salvar os ajustes?
```

Botões esperados:

```txt
Continuar editando
Sair sem salvar
```

Comportamento:

- **Continuar editando** fecha o modal e mantém o usuário na página;
- **Sair sem salvar** descarta rascunho e continua a navegação/logout;
- se não houver alterações pendentes, navegação deve ocorrer sem modal;
- após salvar pelo botão flutuante, `isDirtyRef.current` deve ficar `false`.

---

## 16. Checklist de validação

### Meus dados

- campo **Signo** não aparece;
- botão **Trocar Senha** aparece no topo/card superior;
- botão **Trocar Senha** não submete o formulário;
- ação de senha não marca o formulário como alterado;
- preferências de notificação não aparecem;
- container fecha após **Curiosidades da Vida**;
- não existe botão interno **Salvar meus dados**;
- botão flutuante salva os dados.

### Avatar/foto

- clicar no avatar superior abre modal;
- foto existente aparece ampliada;
- upload/crop funciona;
- remover foto funciona pelo modal;
- botões duplicados **Alterar** e **Remover** não aparecem no corpo do formulário;
- salvar persiste a alteração.

### Vínculos

- card **FILHOS** conta apenas filhos humanos;
- card **PETS** aparece quando houver pets;
- pets não entram na contagem de filhos humanos;
- cônjuges continuam exibindo dados conjugais quando houver.

### Arquivos Históricos

- container separado aparece abaixo de **Meus dados**;
- título duplicado interno não aparece;
- botão compacto **+** aparece acima da mensagem vazia;
- adicionar/remover arquivo marca formulário como alterado;
- salvar persiste arquivos.

### Eventos da Vida

- timeline aparece em área própria;
- eventos automáticos aparecem quando há dados;
- eventos manuais podem ser adicionados;
- eventos ficam em ordem cronológica;
- ausência de eventos não quebra a UI.

### Saída sem salvar

- editar um campo e clicar em link interno abre modal;
- modal usa o texto **Deseja sair sem salvar os ajustes?**;
- **Continuar editando** mantém na página;
- **Sair sem salvar** descarta rascunho e navega;
- logout com alterações pendentes também abre modal;
- refresh/fechamento de aba exibe aviso nativo;
- depois de salvar, navegar não exibe modal.

### Técnico

```bash
npm run build
git diff --check
git status --short
```

Se houver scripts disponíveis:

```bash
npm test
npm run test:e2e
```

---

## 17. Anti-regressões

Não reintroduzir:

- campo **Signo** editável;
- preferências de notificação nesta página;
- botão interno **Salvar meus dados** dentro do bloco **Meus dados**;
- botão **Sair** no header;
- botões duplicados de foto no corpo do formulário;
- contagem de pets dentro de **FILHOS**;
- ausência do card **PETS** quando houver pets;
- arquivos históricos dentro do container de dados pessoais;
- título duplicado em **Arquivos Históricos**;
- botão longo **Adicionar Arquivo** no estado vazio quando o layout consolidado pede **+**;
- saída sem confirmação quando houver alterações pendentes;
- avatar sem ação de visualização/edição;
- strings quebradas por encoding;
- botão **Trocar Senha** que salva formulário, limpa rascunho ou altera dados familiares.

---

## 18. Pendências e validação visual

Pontos recomendados para QA em browser real:

```txt
/minha-arvore/editar em 320px, 375px, 390px, 430px, 768px e desktop
avatar superior e modal de foto
botão Trocar Senha
card FILHOS somente humanos
card PETS
Arquivos Históricos com botão +
Eventos da Vida
modal de saída sem salvar
```

A ausência de sessão local não deve bloquear validação técnica por build, diff e revisão de código.

---
