# Minha Arvore - edicao do proprio perfil

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

A pagina permite que o usuario autenticado revise e edite dados da pessoa vinculada ao seu perfil, mantendo um fluxo mais amplo do que `/meus-dados`, pois tambem inclui vinculos familiares, arquivos historicos, avatar e confirmacao de saida sem salvar.

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
- bloco **Meus dados**;
- bloco separado **Arquivos Historicos**;
- secoes de vinculos familiares;
- botao flutuante de salvamento.

Regras visuais:

- nao criar header proprio se `MemberPageHeader` atender;
- manter acao principal de salvar no botao flutuante;
- evitar botoes duplicados de salvamento dentro dos containers;
- manter espacamento consistente entre cards;
- preservar responsividade mobile.

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

## 9. Salvamento

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

## 10. Rascunho local

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

## 11. Confirmacao de saida sem salvar

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

## 12. Vinculos familiares

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

## 13. Dados de casamento

Quando houver conjuges, a pagina pode exibir/editar:

- data de casamento;
- local de casamento.

Regras:

- alteracao em casamento deve marcar formulario como alterado;
- salvamento deve preservar demais dados da pessoa;
- se o usuario nao puder editar diretamente, criar solicitacao de alteracao quando previsto;
- erros devem ser destacados no campo correspondente.

---

## 14. Checklist de validacao

### Meus dados

- campo **Signo** nao aparece;
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

## 15. Pendencias conhecidas

Pendencias mapeadas apos os ajustes recentes:

- conferir acentuacao final do modal **Sair sem salvar?** no ambiente publicado;
- conferir acentuacao de **Arquivos Historicos** no ambiente publicado;
- conferir texto **sera/será** no modal de foto;
- garantir borda visual em **Remover foto**;
- revisar se o fluxo de casamento cobre corretamente viuvez e separacao em todos os cenarios.

---

## 16. Anti-regressoes

Nao reintroduzir:

- campo **Signo** editavel;
- preferencias de notificacao nesta pagina;
- botao interno **Salvar meus dados** dentro do bloco **Meus dados**;
- arquivos historicos dentro do container de dados pessoais;
- saida sem confirmacao quando houver alteracoes pendentes;
- avatar sem acao de visualizacao;
- botao **Remover foto** como texto solto sem borda;
- strings quebradas por encoding.

