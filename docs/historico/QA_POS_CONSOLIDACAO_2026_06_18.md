# QA pós-consolidação — 2026-06-18

Este documento registra a validação manual posterior à consolidação documental dos ajustes recentes do sistema.

Commit base recomendado:

```txt
 ae1a2e1 docs: consolida ajustes recentes do sistema
```

---

## 1. Ambiente de teste

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit base | `ae1a2e1` |
| Navegador desktop | A preencher |
| Navegador mobile/emulador | A preencher |
| Sistema operacional | A preencher |
| Data do teste | 2026-06-18 |
| Responsável | A preencher |

### Breakpoints obrigatórios

- [ ] 320px
- [ ] 375px
- [ ] 390px
- [ ] 430px
- [ ] Desktop

---

## 2. Comandos iniciais

Antes de iniciar o QA:

```powershell
git status --short
git pull origin main
npm run build
npm run dev
```

Resultado esperado:

- `git status --short` sem saída;
- build aprovado;
- app disponível localmente.

### Resultado executado

```txt
A preencher
```

---

## 3. Onboarding do membro — pessoa viva

Rotas:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/preferencias
/revisao-dados
```

### Checklist

- [ ] As 5 etapas aparecem no stepper.
- [ ] `/meus-dados` exibe cidade de residência.
- [ ] `/meus-dados` exibe contato, endereço e redes sociais.
- [ ] Inputs mobile não disparam auto-zoom.
- [ ] Tooltips de data/local funcionam por toque no mobile.
- [ ] Redes sociais incompletas não bloqueiam salvamento indevidamente.
- [ ] `/meus-vinculos` permite busca automática de parentes.
- [ ] Badges de vínculos respeitam status/gênero quando possível.
- [ ] `/arquivos-historicos` pré-preenche título/descrição ao selecionar categoria.
- [ ] Rascunho local é preservado antes de salvar.
- [ ] Participantes podem ser selecionados/removidos visualmente.
- [ ] `/preferencias` aparece e funciona para pessoa viva.
- [ ] `/revisao-dados` exibe contatos e notificações.
- [ ] Botão final não é coberto pelo menu inferior no mobile.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

Prints/evidências:

```txt
A preencher
```

---

## 4. Onboarding do membro — pessoa falecida

Rotas:

```txt
/meus-dados
/meus-vinculos
/arquivos-historicos
/revisao-dados
```

### Checklist

- [ ] `/meus-dados` exibe campos de falecimento.
- [ ] Cidade de residência é ocultada no fluxo do membro.
- [ ] Contato, endereço e redes sociais são ocultados no fluxo do membro.
- [ ] `/preferencias` não aparece no stepper.
- [ ] Ao salvar arquivos históricos, o fluxo segue para `/revisao-dados`.
- [ ] Acesso direto a `/preferencias` redireciona para `/revisao-dados`.
- [ ] Notificações são desativadas automaticamente.
- [ ] Mensagens por WhatsApp são desativadas automaticamente.
- [ ] Revisão final não mostra contatos.
- [ ] Revisão final não mostra notificações/permissões.
- [ ] Badge respeita `Falecido` ou `Falecida` quando houver gênero suficiente.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

Prints/evidências:

```txt
A preencher
```

---

## 5. `/minha-arvore/editar`

### Checklist

- [ ] A rota não se comporta como onboarding.
- [ ] `MemberOnboardingSteps` não aparece.
- [ ] Labels estão alinhados ao padrão do onboarding.
- [ ] Dados pessoais, contatos, bio, arquivos, eventos e vínculos permanecem editáveis conforme a regra vigente.
- [ ] Redes sociais incompletas não bloqueiam salvamento indevidamente.
- [ ] Edição de casamento/cônjuge aparece apenas quando o comportamento estiver confirmado como vigente.
- [ ] Alterações não salvas são protegidas, quando aplicável.
- [ ] Mobile não apresenta sobreposição de botões com bottom nav.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

---

## 6. Admin — pessoas e dashboard

Rotas:

```txt
/admin
/admin/pessoas
/admin/pessoas/:id/editar
/admin/pessoas/nova
```

### Checklist — dashboard

- [ ] Card `Membros` navega para `/admin/pessoas`.
- [ ] Card `Relações` navega para `/admin/relacionamentos`.
- [ ] Card `Pendentes` navega para `/admin/solicitacoes-vinculos`.
- [ ] Card `Memória` permanece informativo se não houver rota definida.

### Checklist — formulário admin

- [ ] Criar pessoa funciona.
- [ ] Editar pessoa funciona.
- [ ] Labels estão consistentes.
- [ ] Contexto de privacidade admin usa texto neutro.
- [ ] Comportamento de pessoa falecida no admin foi verificado no código e visualmente.
- [ ] A decisão final sobre contato/privacidade de pessoa falecida foi anotada abaixo.

### Decisão verificada — pessoa falecida no admin

```txt
A preencher: contato/privacidade aparecem ou são ocultados? Registrar comportamento real da main.
```

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

---

## 7. Mapas familiares

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

### Checklist geral

- [ ] View carrega com dados reais.
- [ ] Não há erro no console.
- [ ] Troca de pessoa principal funciona.
- [ ] Dropdown `Visualizar como` aparece no header.
- [ ] Dropdown não aparece como seletor flutuante/debug.
- [ ] Nomes no seletor aparecem encurtados e ordenados.
- [ ] Filtros não quebram a renderização.
- [ ] Mobile mantém controles acessíveis.

### Checklist — horizontal

- [ ] Cônjuges são contados corretamente no card de filtro.
- [ ] Cônjuges de tios/primos/filhos/sobrinhos/netos entram na contagem quando aplicável.
- [ ] Cônjuge da pessoa principal não entra indevidamente na contagem de cônjuges filtráveis.
- [ ] Cônjuges de tataravós/bisavós/avós não entram indevidamente.
- [ ] Geração 4/pais/cônjuges foi validada quando houver dados reais.

### Checklist — vertical

- [ ] Grupos existentes sobem quando a árvore é esparsa.
- [ ] Não há grande vazio no topo quando há poucos parentes.
- [ ] Conectores continuam legíveis.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

Prints/evidências:

```txt
A preencher
```

---

## 8. Mobile da árvore

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

### Checklist

- [ ] Modal/controles mobile abrem e fecham corretamente.
- [ ] Botões de geração funcionam.
- [ ] Swipe/scroll não conflita com menu inferior.
- [ ] Toolbar não cobre conteúdo essencial.
- [ ] Popovers não extrapolam a tela.
- [ ] Painel e popovers não duplicam a mesma função indevidamente.
- [ ] Exportação aparece apenas onde fizer sentido no mobile.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

---

## 9. Exportação da árvore

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

### Checklist

- [ ] Botão `Salvar e Imprimir` aparece no local correto.
- [ ] Opção `Área` funciona.
- [ ] Opção `Imagem`/PNG funciona.
- [ ] Opção `PDF` funciona.
- [ ] Opção `Imprimir` funciona.
- [ ] Exportação não corta conteúdo essencial.
- [ ] Exportação respeita view/filtros atuais, quando aplicável.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

---

## 10. Calendário familiar

Rota:

```txt
/calendario-familiar
```

### Checklist

- [ ] Calendário carrega no desktop.
- [ ] Calendário carrega no mobile.
- [ ] Filtros mobile são acessíveis.
- [ ] Eventos permanecem legíveis.
- [ ] Chips/cards não extrapolam containers.
- [ ] Menu inferior não cobre ações.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / bloqueado
```

Observações:

```txt
A preencher
```

---

## 11. Favoritos

Rota:

```txt
/meus-favoritos
```

### Checklist

- [ ] Busca funciona.
- [ ] Botão `Filtros` aparece se a frente estiver implementada.
- [ ] Menu suspenso de categorias funciona se implementado.
- [ ] Estrela ativa substitui lixeira se implementado.
- [ ] Remoção com delay visual funciona se implementado.
- [ ] Caso não esteja implementado, registrar como pendência real.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / pendência confirmada
```

Observações:

```txt
A preencher
```

---

## 12. Notificações

Rota:

```txt
/notificacoes
```

### Checklist

- [ ] Contador de não lidas aparece no header/menu se implementado.
- [ ] Texto usa `Todas lidas` quando total for zero.
- [ ] Texto usa `1 não lida` no singular.
- [ ] Texto usa `N não lidas` no plural.
- [ ] Cards não exibem badges redundantes.
- [ ] Data/hora aparece no lugar correto.
- [ ] Marcar como lida atualiza contador.
- [ ] Marcar todas como lidas atualiza contador.
- [ ] Remover notificação atualiza contador.
- [ ] Caso não esteja implementado, registrar como pendência real.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / pendência confirmada
```

Observações:

```txt
A preencher
```

---

## 13. Perfil de pessoa e timeline

Rota:

```txt
/pessoa/:id
```

### Checklist — perfil

- [ ] Perfil carrega.
- [ ] Box `Informações do perfil` está no estado esperado.
- [ ] Bloco de parentesco aparece no local esperado.
- [ ] Relacionamentos aparecem no local esperado.
- [ ] Discussões ocupam largura correta.
- [ ] Layout desktop mantém duas colunas se implementado.
- [ ] Layout mobile não quebra.

### Checklist — timeline

- [ ] Cards usam textos narrativos se implementado.
- [ ] Badge única se implementado.
- [ ] `Data desconhecida` não aparece se a remoção estiver implementada.
- [ ] Eventos de nascimento, casamento, filhos e relacionamentos fazem sentido.
- [ ] Caso não esteja implementado, registrar como pendência real.

### Resultado

Status:

```txt
A preencher: aprovado / ajuste necessário / pendência confirmada
```

Observações:

```txt
A preencher
```

---

## 14. Bugs encontrados

| ID | Rota | Severidade | Descrição | Evidência | Próxima ação |
|---|---|---|---|---|---|
| QA-001 | A preencher | Alta/Média/Baixa | A preencher | A preencher | A preencher |

---

## 15. Pendências confirmadas após QA

| ID | Frente | Status | Observação |
|---|---|---|---|
| PEND-001 | A preencher | Confirmada / descartada / precisa investigar | A preencher |

---

## 16. Decisões tomadas durante o QA

| Tema | Decisão | Impacto documental/código |
|---|---|---|
| A preencher | A preencher | A preencher |

---

## 17. Resultado final do QA

Status geral:

```txt
A preencher: aprovado / aprovado com ressalvas / bloqueado
```

Resumo:

```txt
A preencher
```

Próxima frente recomendada:

```txt
A preencher
```
