# Minha Arvore - edicao do proprio perfil

> Ultima revisao: 2026-06-07

> Local recomendado: `docs/funcionalidades/MINHA_ARVORE_EDITAR.md`
> Tipo: documentacao funcional e tecnica da rota `/minha-arvore/editar`.
> Status: documento criado para consolidar ajustes recentes da edicao feita pelo membro.

---

## 1. Objetivo

Este documento registra o comportamento esperado da pagina em que o membro edita os proprios dados familiares.

Rota principal:

```txt
/minha-arvore/editar
```

Componente principal:

```txt
src/app/pages/MinhaArvore.tsx
```

A pagina permite que o usuario autenticado revise e edite dados da pessoa vinculada ao seu perfil, mantendo um fluxo mais amplo do que `/meus-dados`, pois tambem inclui vinculos familiares, arquivos historicos, avatar, troca de senha e confirmacao de saida sem salvar.

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
docs/operacao/MIGRATIONS_SUPABASE.md
```

Este documento nao substitui:

- `PESSOAS_PERFIL_ADMIN.md`, que cobre perfil publico, admin de pessoa e `/meus-dados`;
- `MINHA_ARVORE_VIEW.md`, que cobre a visualizacao da arvore;
- `ROTAS_E_GUARDS.md`, que define protecao e redirecionamentos.

---

## 3. Arquivos principais

```txt
src/app/pages/MinhaArvore.tsx
src/app/components/ArquivosHistoricos.tsx
src/app/components/layout/MemberPageHeader.tsx
src/app/components/ui/dialog.tsx
src/app/components/ui/button.tsx
src/app/lib/supabaseClient.ts
src/app/services/memberProfileService.ts
src/app/services/arquivosHistoricosService.ts
src/app/services/storageService.ts
src/app/utils/personFields.ts
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
buildEditablePersonFormState
cleanPersonPayload
validateEditablePersonForm
supabase.auth.resetPasswordForEmail
```

---

## 4. Protecao de rota

A rota usa `MemberRoute`.

Regra:

- usuario nao autenticado deve ir para `/entrar`;
- usuario autenticado pode acessar a area de edicao conforme vinculo e permissoes;
- permissoes sensiveis continuam dependendo de service/RLS, nao apenas da UI.

Nao usar `TreeAccessRoute` nesta rota.

---

## 5. Estrutura visual da pagina

A pagina usa:

- `MemberPageHeader`;
- container padronizado por `PAGE_CONTAINER_CLASS`;
- card superior com avatar/nome;
- acao **Trocar Senha** no topo ou no card superior;
- bloco **Meus dados**;
- bloco separado **Arquivos Historicos**;
- secoes de vinculos familiares;
- botao flutuante de salvamento.

Regras visuais:

- nao criar header proprio se `MemberPageHeader` atender;
- manter acao principal de salvar no botao flutuante;
- evitar botoes duplicados de salvamento dentro dos containers;
- manter espacamento consistente entre cards;
- preservar responsividade mobile;
- a acao **Trocar Senha** nao deve competir com o botao flutuante de salvamento nem submeter o formulario.

---

## 6. Bloco Meus dados

O bloco **Meus dados** deve conter campos pessoais editaveis e terminar apos o campo **Curiosidades da Vida**.

Campos esperados:

- Nome completo;
- Data de nascimento;
- Local de nascimento;
- Cidade de residencia;
- Profissao;
- Telefone;
- Endereco;
- Complemento;
- Redes sociais;
- Mini bio;
- Curiosidades da Vida.

Regras consolidadas:

- nao exibir campo de edicao de **Signo**;
- nao exibir preferencias de notificacao nesta pagina;
- nao exibir botao interno **Salvar meus dados**;
- salvamento deve ocorrer pelo botao flutuante;
- alteracoes nos campos devem marcar o formulario como alterado.

Motivo:

```txt
Signo e derivado da data de nascimento e nao deve ser editado manualmente.
Preferencias de notificacao pertencem a /ajustar-notificacoes.
```

---

## 7. Arquivos Historicos

A area **Arquivos Historicos** deve ficar em container proprio, separado de **Meus dados**.

Componente:

```txt
src/app/components/ArquivosHistoricos.tsx
```

Regras:

- exibir titulo **Arquivos Historicos**;
- permitir adicionar arquivo;
- permitir revisar arquivo;
- permitir remover arquivo;
- alteracoes em arquivos devem marcar o formulario como alterado;
- arquivos devem ser salvos junto com o fluxo principal da pagina;
- estado vazio deve exibir mensagem amigavel.

Texto esperado:

```txt
Arquivos Historicos
Adicione, revise ou remova arquivos historicos associados ao seu perfil familiar.
```

Observacao operacional:

- se o ambiente exibir `Hist?ricos`, `hist?ricos` ou outro texto com `?`, revisar encoding do arquivo e salvar como UTF-8.

---

## 8. Avatar e foto do perfil

O avatar/foto ao lado do nome deve ser clicavel.

Comportamento esperado:

1. Clicar no avatar abre modal de foto.
2. Se houver foto, exibir imagem ampliada.
3. Se nao houver foto, exibir estado para cadastrar imagem.
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

Fluxo de alteracao:

- selecionar arquivo;
- abrir crop;
- ajustar zoom/posicao;
- aplicar corte;
- manter preview local;
- marcar formulario como alterado;
- salvar definitivamente apenas no submit principal.

Fluxo de remocao:

- remover preview local;
- limpar crop;
- marcar foto para remocao;
- marcar formulario como alterado;
- persistir remocao no submit principal.

Botao **Remover foto**:

- deve ter borda visivel;
- deve usar texto vermelho;
- hover pode usar fundo vermelho claro;
- deve usar `type="button"`;
- nao deve submeter formulario.

Texto do modal:

```txt
O corte final sera quadrado.
```

Se o projeto estiver usando acentuacao plena na UI, validar visualmente:

```txt
O corte final será quadrado.
```

---


## 9. Trocar senha

A pagina exibe a acao **Trocar Senha** para o usuario autenticado.

Objetivo:

- permitir que o membro inicie o fluxo seguro de troca/redefinicao de senha;
- evitar criar backend paralelo;
- reaproveitar o fluxo padrao do Supabase Auth;
- manter a troca de senha separada do salvamento de dados familiares.

Comportamento esperado:

1. O usuario clica em **Trocar Senha**.
2. A acao usa o e-mail do usuario autenticado.
3. O sistema chama o fluxo de reset de senha do Supabase Auth.
4. O botao pode exibir estado de carregamento, como **Enviando...**.
5. Em sucesso, exibir toast informando que as instrucoes foram enviadas.
6. Em erro, exibir toast com mensagem amigavel.
7. A acao nao deve marcar o formulario como alterado.
8. A acao nao deve limpar rascunho, foto, arquivos historicos ou dados de casamento.

Implementacao esperada:

```txt
supabase.auth.resetPasswordForEmail(...)
```

Regras:

- nao criar migration;
- nao alterar RLS;
- nao expor service role;
- nao salvar senha no frontend;
- nao registrar senha em log;
- nao submeter o formulario principal;
- botao deve usar `type="button"`.

Cuidados de UX:

- se o usuario nao tiver e-mail disponivel, mostrar erro claro;
- se o fluxo depender de configuracao externa de redirect, validar no ambiente publicado;
- nao prometer que a senha foi alterada imediatamente; o fluxo apenas envia/inicia a redefinicao.

---

## 10. Salvamento

O salvamento principal acontece pelo botao flutuante.

Fluxo esperado:

1. Normalizar campos.
2. Validar dados editaveis.
3. Preparar payload com `cleanPersonPayload`.
4. Se foto foi removida, enviar `foto_principal_url = ''`.
5. Se nova foto/corte existe, fazer upload e usar URL retornada.
6. Atualizar pessoa via `updateOwnLinkedPerson`.
7. Atualizar perfil via `ensureMemberProfile`.
8. Salvar arquivos historicos.
9. Salvar/corrigir dados de casamento quando aplicavel.
10. Limpar rascunho.
11. Marcar `isDirtyRef.current = false`.
12. Exibir toast de sucesso ou alerta parcial.

Regras:

- erro no upload da foto deve interromper salvamento;
- erro em arquivos historicos deve informar que dados pessoais foram salvos, mas arquivos falharam;
- apos salvamento com sucesso, sair da pagina nao deve abrir modal de alteracoes pendentes.

---

## 11. Rascunho local

A pagina usa rascunho auxiliar em `sessionStorage`.

Chave:

```txt
minha-arvore-draft:{userId}:{pessoaId}
```

Responsabilidade:

- proteger edicoes em andamento;
- restaurar dados se a tela for re-renderizada;
- remover rascunho ao salvar;
- remover rascunho ao confirmar saida sem salvar.

Cuidados:

- rascunho nao substitui persistencia no banco;
- falha de storage nao deve bloquear a edicao;
- rascunho deve ser por usuario e pessoa.

---

## 12. Confirmacao de saida sem salvar

Quando houver alteracoes pendentes, a pagina deve exibir modal de confirmacao antes de abandonar a edicao.

Eventos interceptados:

- clique em links internos;
- logout;
- troca de rota;
- refresh/fechamento de aba com aviso nativo do navegador.

Modal esperado:

```txt
Sair sem salvar?
Voce tem alteracoes pendentes nesta pagina. Se sair agora, as alteracoes nao salvas serao descartadas.
```

Botoes:

```txt
Continuar editando
Sair sem salvar
```

Comportamento:

- **Continuar editando** fecha o modal e mantem o usuario na pagina;
- **Sair sem salvar** descarta rascunho e continua a navegacao/logout;
- se nao houver alteracoes pendentes, navegacao deve ocorrer sem modal;
- apos salvar pelo botao flutuante, `isDirtyRef.current` deve ficar `false`.

Observacao de encoding:

- se a UI exibir `Voc?`, `altera??es`, `p?gina`, `n?o` ou `ser?o`, revisar o arquivo em UTF-8 e corrigir as strings.

---

## 13. Vinculos familiares

A pagina permite revisar grupos familiares ligados a pessoa base.

Grupos:

```txt
pais
irmaos
conjuges
filhos
```

Regras:

- adicao de parente pode usar pessoa existente ou nova pessoa simples;
- conjuges podem ter campos de casamento;
- alteracoes de casamento podem ser salvas diretamente ou enviadas como solicitacao, conforme permissao;
- falhas de relacionamento nao devem apagar dados pessoais ja salvos;
- grupos vazios devem usar mensagens claras.

---

## 14. Dados de casamento

Quando houver conjuges, a pagina pode exibir/editar:

- data de casamento;
- local de casamento.

Regras:

- alteracao em casamento deve marcar formulario como alterado;
- salvamento deve preservar demais dados da pessoa;
- se o usuario nao puder editar diretamente, criar solicitacao de alteracao quando previsto;
- erros devem ser destacados no campo correspondente.

---

## 15. Checklist de validacao

### Meus dados

- campo **Signo** nao aparece;
- botao **Trocar Senha** aparece no topo/card superior;
- botao **Trocar Senha** nao submete o formulario;
- acao de senha nao marca o formulario como alterado;
- preferencias de notificacao nao aparecem;
- container fecha apos **Curiosidades da Vida**;
- nao existe botao interno **Salvar meus dados**;
- botao flutuante salva os dados.

### Arquivos Historicos

- container separado aparece abaixo de **Meus dados**;
- titulo e descricao aparecem sem erro de encoding;
- adicionar/remover arquivo marca formulario como alterado;
- salvar persiste arquivos.

### Avatar/foto

- clicar no avatar abre modal;
- foto existente aparece ampliada;
- **Alterar foto** abre upload/crop;
- **Aplicar corte** atualiza preview;
- **Remover foto** tem borda e remove a foto;
- salvar persiste a alteracao.

### Saida sem salvar

- editar um campo e clicar em link interno abre modal;
- **Continuar editando** mantem na pagina;
- **Sair sem salvar** descarta rascunho e navega;
- logout com alteracoes pendentes tambem abre modal;
- refresh/fechamento de aba exibe aviso nativo;
- depois de salvar, navegar nao exibe modal.

### Encoding

- nao ha `?` substituindo acentos em textos da pagina;
- nao ha mojibake como `SÃ`, `famÃ` ou `proteÃ`;
- arquivos Markdown e TSX devem permanecer em UTF-8.

---

## 16. Pendencias conhecidas

Pendencias mapeadas apos os ajustes recentes:

- conferir acentuacao final do modal **Sair sem salvar?** no ambiente publicado;
- conferir acentuacao de **Arquivos Historicos** no ambiente publicado;
- conferir texto **sera/será** no modal de foto;
- validar botao **Trocar Senha** no ambiente publicado, incluindo recebimento do e-mail de redefinicao;
- garantir borda visual em **Remover foto**;
- revisar se o fluxo de casamento cobre corretamente viuvez e separacao em todos os cenarios.

---

## 17. Anti-regressoes

Nao reintroduzir:

- campo **Signo** editavel;
- preferencias de notificacao nesta pagina;
- botao interno **Salvar meus dados** dentro do bloco **Meus dados**;
- arquivos historicos dentro do container de dados pessoais;
- saida sem confirmacao quando houver alteracoes pendentes;
- avatar sem acao de visualizacao;
- botao **Remover foto** como texto solto sem borda;
- strings quebradas por encoding;
- botao **Trocar Senha** que salva formulario, limpa rascunho ou altera dados familiares.

---
## 18. Atualizacao de rastreabilidade - ciclo 2026-05-30

Esta secao registra o estado consolidado dos ajustes recentes da rota `/minha-arvore/editar`.

### 17.1 Ajustes implementados

Status funcional consolidado:

```txt
remover campo Signo -> implementado
remover preferencias de notificacao -> implementado
fechar Meus dados apos Curiosidades da Vida -> implementado
criar container separado de Arquivos Historicos -> implementado
remover botao interno Salvar meus dados -> implementado
manter botao flutuante de salvar -> implementado
avatar clicavel com modal de foto -> implementado
visualizacao ampliada de foto -> implementado
alterar foto com upload/crop -> implementado
remover foto pelo modal -> implementado
confirmar saida sem salvar -> implementado
trocar senha via Supabase Auth -> implementado
```

### 17.2 Ajustes visuais ainda sujeitos a conferencia

Itens que devem ser conferidos sempre que a tela for validada em ambiente publicado:

```txt
botao Remover foto com borda visivel
texto O corte final sera/será quadrado
texto Arquivos Historicos/Históricos sem encoding quebrado
modal Sair sem salvar? sem Voc?, altera??es, p?gina, n?o ou ser?o
botao Trocar Senha visivel e sem submissao do formulario
```

Se o ambiente final estiver usando acentos normalmente, preferir UI acentuada. Se houver risco de terminal Windows corromper arquivos, manter ASCII no Markdown e corrigir a UI na origem TSX com UTF-8 validado.

### 17.3 Regras de dirty state

Toda acao abaixo deve marcar a tela como alterada:

- edicao de campo de dados pessoais;
- edicao de complemento;
- edicao de redes sociais;
- adicionar, remover ou editar arquivo historico;
- alterar foto;
- remover foto;
- alterar data/local de casamento;
- adicionar/remover parente quando a pagina permitir.

O modal de saida sem salvar so deve aparecer se `isDirtyRef.current === true`.

### 17.4 Fluxo esperado apos salvar

Ao concluir salvamento com sucesso:

1. dados da pessoa persistidos;
2. foto removida ou atualizada, se aplicavel;
3. arquivos historicos salvos;
4. dados de casamento tratados;
5. rascunho local removido;
6. `isDirtyRef.current = false`;
7. navegacao interna liberada sem modal.

### 17.5 Anti-regressao especifica

Nao reintroduzir:

- componente de preferencias de notificacao nesta rota;
- campo editavel de signo;
- botao interno de salvamento dentro do bloco **Meus dados**;
- arquivos historicos dentro do mesmo container de dados pessoais;
- avatar sem clique;
- modal de foto sem opcao de remocao;
- saida sem confirmacao quando houver alteracoes pendentes;
- textos quebrados por encoding.

---

## 19. Atualizacao 2026-06-07 - Menu do usuario e troca de senha

A rota `/minha-arvore/editar` passou a ser tambem o destino principal do cabecalho clicavel do `UserProfileMenu`.

Comportamento consolidado:

- no menu do usuario, clicar na area superior com avatar, nome e e-mail navega para `/minha-arvore/editar`;
- o item **Atualizar perfil** pode continuar apontando para a mesma rota;
- o item **Editar notificacoes** foi removido do menu global;
- preferencias de notificacao continuam pertencendo a `/ajustar-notificacoes`;
- a central `/notificacoes` deve oferecer o botao **Personalizar Notificacoes**.

Na propria pagina `/minha-arvore/editar`:

- o botao **Trocar Senha** inicia o fluxo de redefinicao de senha;
- a acao e independente do salvamento de dados familiares;
- a acao nao cria migration, nao altera RLS e nao usa service role;
- validar em desktop e mobile que o botao nao compete com o botao flutuante de salvamento.

Arquivos relacionados:

```txt
src/app/components/layout/UserProfileMenu.tsx
src/app/pages/MinhaArvore.tsx
src/app/pages/Notificacoes.tsx
src/app/pages/AjustarNotificacoes.tsx
```
