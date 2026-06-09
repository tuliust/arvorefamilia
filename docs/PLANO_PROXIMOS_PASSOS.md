# Plano de próximos passos - Árvore Família

> Última revisão: 2026-06-08  
> Local canônico: `docs/PLANO_PROXIMOS_PASSOS.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: plano vivo da revisão final da documentação e da frente mobile final.

## Objetivo

Este documento registra apenas:

- pendências reais encontradas durante a revisão final da documentação;
- divergências entre documentação e implementação;
- ações futuras que não devem ser executadas nesta frente;
- pontos de QA, migration, refatoração ou melhoria identificados durante a auditoria documental;
- pendências reais surgidas após ajustes técnicos relevantes, como a frente mobile final.

O estado consolidado do que já foi implementado deve permanecer em `docs/GUIA_IMPLEMENTACOES.md`.

---

## 1. Situação atual

As pendências funcionais e visuais antigas registradas neste arquivo foram consideradas finalizadas e validadas, exceto os itens explicitamente mantidos na seção de pendências abertas.

A revisão arquivo por arquivo de `docs/` foi consolidada. As documentações canônicas foram organizadas por tipo de informação e os arquivos históricos individuais foram substituídos por `docs/historico/README.md`.

A frente mobile final de 2026-06-08 também foi concluída tecnicamente, com build validado e arquivos da frente sincronizados no `main`. As pendências remanescentes são de QA específico, decisão futura, encoding ou alinhamento técnico/documental.

---

## 2. Pendências abertas

| ID | Documento de origem | Tipo | Ação necessária | Status |
|---|---|---|---|---|
| DOC-001 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | bug provável / necessidade de QA | Avaliar se `GenealogyMobileStageTabs` deve usar gerações inferidas pelo layout. O componente monta chips a partir de `pessoas[].manual_generation`, enquanto `FamilyTree` infere gerações internamente antes do layout. | Aberto |
| DOC-002 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | ajuste técnico / encoding | Corrigir strings quebradas por encoding em `src/app/pages/MinhaArvore.tsx`, como `Arquivos Hist?ricos`, `hist?ricos` e `Sess?o encerrada.`. | Aberto |
| DOC-003 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | melhoria futura / decisão pendente | Definir se `Complemento` e múltiplas redes sociais devem persistir em schema próprio. Hoje `Complemento` é campo visual local e múltiplas redes são parcialmente sincronizadas apenas para campos legados da primeira rede. | Aberto |
<<<<<<< HEAD
| DOC-004 | `/minha-arvore` mobile | bug visual / conector inferior | Refazer a conexão inferior do card principal no mobile sem depender de CSS de bordas. O desenho desejado é uma haste central curta até uma linha horizontal, com uma haste à esquerda para **Irmãos** e uma haste à direita para **Cônjuge**, sem linha central prolongada entre os grupos. | Aberto |
=======
| DOC-004 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | revisão técnica / alinhamento mobile | Validar se a exportação rápida do `MobileTreeControlsPortal` deve reutilizar `treeExport.ts` ou manter implementação própria. Confirmar também política de `html2canvas`, CORS, elementos ignorados e comportamento de seleção manual no mobile. | Aberto |

Regras:

- não duplicar essas pendências em outros documentos;
- documentos funcionais podem mencionar o contexto, mas o controle fica nesta tabela;
- fechar item apenas após validação técnica ou decisão explícita;
- se houver alteração de schema, criar migration e atualizar `docs/operacao/MIGRATIONS_SUPABASE.md`.
>>>>>>> 834f91f (docs: atualiza guias e documentação funcional)

---

## 3. Frente mobile final - estado e pendências

Estado técnico da frente mobile:

```txt
Concluída no código e validada por build.
```

Arquivos relevantes:

```txt
src/main.tsx
src/styles/family-tree-mobile.css
src/styles/mobile-tree-controls.css
src/styles/mobile-edit-profile.css
src/app/components/Timeline/PersonTimeline.tsx
src/app/components/FamilyTree/MobileTreeControlsPortal.tsx
src/app/components/layout/MobileUserMenuPalettePortal.tsx
src/app/pages/home/HomeHeader.tsx
src/app/pages/home/HomeTreeSection.tsx
```

Ajustes concluídos:

- modal de dica/login com fundo da página e overlay preto;
- título mobile personalizado no header da árvore;
- padronização de setas da árvore no mobile;
- remoção de texto overlay redundante sobre a árvore no mobile;
- remoção do anel azul duplicado no card principal;
- painel mobile de controles da árvore;
- opção de ocultar/exibir setas mobile;
- paleta de cores no menu mobile;
- reset de geração ativa em `/genealogia` e `/visao-completa`;
- acabamento mobile de `/minha-arvore/editar`;
- CSS de edição escopado por `main:has(#minha-arvore-edit-form)`.

Validação visual ainda recomendada, sem bloquear tecnicamente:

```txt
320px
375px
390px
430px
768px
desktop
```

Rotas prioritárias para QA visual:

```txt
/minha-arvore
/genealogia
/visao-completa
/minha-arvore/editar
/meus-favoritos
/calendario-familiar
/forum
/notificacoes
```

---

## 4. Backlog futuro confirmado

| Frente | Direção futura | Status |
|---|---|---|
| Favoritos expandidos | Avaliar favoritos para arquivos históricos, relacionamentos, fórum, eventos, páginas, timeline e histórias. | A confirmar na revisão de favoritos/documentação relacionada. |
| Notificações avançadas | Push real, WhatsApp real, fila/retry avançado e cron externo automatizado. | Pós-MVP. |
| WhatsApp avançado | Privacidade forte em banco/API e log seguro de clique. | Pós-MVP. |
| Timeline avançada | Upload por evento, privacidade por evento e exportação PDF. | Pós-MVP. |
| Exportação avançada | Exportar árvore completa, além da área visível. | Pós-MVP. |
| Parentesco avançado | Integração visual direta na árvore, Genealogia e Visão Completa. | Pós-MVP. |
| Fórum avançado | Moderação ampliada, busca refinada, anexos e filtros adicionais. | Pós-MVP. |
| Home dinâmica | Aniversários, memórias do dia, novidades e destaques. | Pós-MVP. |
| Admin Integridade | Filtros por severidade, paginação e ações assistidas. | Pós-MVP técnico. |
| Storage legado | Prevenir uploads órfãos e avaliar limpeza auditada de legado/base64. | Pós-MVP técnico. |

---

<<<<<<< HEAD
## 4. Pendência específica: conector inferior da `/minha-arvore` mobile

### Contexto

Na página `/minha-arvore`, em viewport mobile, a conexão inferior do card principal ainda não ficou com o desenho desejado.

Comportamento desejado:

```txt
card principal
     |
-----+-----
|         |
irmãos    cônjuge
```

Requisitos visuais:

- uma linha vertical curta saindo da base do card principal;
- uma linha horizontal superior conectando os dois ramos;
- uma linha vertical à esquerda descendo até o grupo **Irmãos**;
- uma linha vertical à direita descendo até o grupo **Cônjuge**;
- nenhuma linha vertical central prolongada entre os dois grupos.

### Estado observado

Mesmo após os ajustes anteriores, a área inferior ainda exibe uma linha central prolongada. O print mais recente mostra que a linha vertical central continua descendo abaixo da linha horizontal, até a região entre os grupos inferiores.

### Ajustes já tentados

1. Ocultar edges centrais via CSS em `src/styles/mobile-tree-lines.css`.
2. Suprimir alguns edges no renderer `src/app/components/FamilyTree/OrthogonalChildEdge.tsx`.
3. Reexibir `direct-central-to-siblings-group` e `direct-central-to-spouse-group` para recuperar o split entre **Irmãos** e **Cônjuge**.
4. Tentar reduzir o `elbowY` mobile dos edges mantidos.
5. Marcar group boxes em `src/app/components/FamilyTree/nodeTypes.ts` e remover bordas internas via CSS.

### Hipótese técnica atual

A correção robusta deve ser feita na geração do layout em:

```txt
src/app/components/FamilyTree/layouts/directFamilyDistributedLayout.ts
```

Pontos relevantes:

- `direct-center-bottom-anchor` é criado na base do card central;
- `direct-siblings-group-top-anchor` e `direct-spouse-group-top-anchor` são criados no topo dos grupos;
- `lowerConnectionElbowY` define a altura da linha horizontal;
- os edges `direct-central-to-siblings-group` e `direct-central-to-spouse-group` desenham caminhos completos até os grupos.

### Próxima abordagem recomendada

Criar uma conexão estrutural mobile específica para o primeiro split inferior:

1. Criar um anchor intermediário central no `lowerConnectionElbowY`, por exemplo:

```txt
direct-mobile-lower-split-anchor
```

2. No mobile, trocar os dois edges completos por três trechos explícitos:

```txt
direct-center-bottom-anchor -> direct-mobile-lower-split-anchor

direct-mobile-lower-split-anchor -> direct-siblings-group-top-anchor

direct-mobile-lower-split-anchor -> direct-spouse-group-top-anchor
```

3. Garantir que o trecho central termine exatamente no `lowerConnectionElbowY` e não continue descendo.
4. Manter a lógica desktop intacta.

### Critério de aceite

No mobile, abaixo do card principal, deve aparecer apenas:

- haste central curta até a linha horizontal;
- linha horizontal conectando os ramos;
- uma haste vertical à esquerda até **Irmãos**;
- uma haste vertical à direita até **Cônjuge**.

Não deve haver linha central descendo entre os grupos.

---

=======
>>>>>>> 834f91f (docs: atualiza guias e documentação funcional)
## 5. Critérios permanentes de bloqueio

- build quebrado;
- login quebrado;
- usuário comum acessando área admin;
- usuário comum alterando dado restrito diretamente;
- RLS liberando escrita indevida;
- perda ou corrupção de dados;
- secret, dump, token, backup sensível ou service role no frontend/repositório;
- migration obrigatória ausente no ambiente final;
- divergência crítica entre documentação e implementação;
- documentação canônica orientando ação insegura de Supabase, Storage, Auth ou migrations;
- responsividade impedindo uso em mobile;
- árvore principal, perfil de pessoa, fórum, notificações ou edição da própria árvore inutilizáveis.

---

<<<<<<< HEAD
## 6. Regras para a revisão final da documentação

- não alterar código do sistema;
- não aplicar migration;
- não alterar dados reais;
- não criar usuário;
- não fazer validação visual autenticada;
- não atualizar arquivos diretamente pelo conector GitHub;
- comparar documentação com código, rotas, componentes, services, hooks, migrations e fluxos reais quando necessário;
- gerar arquivos revisados para download no chat;
- registrar neste plano apenas pendências reais encontradas durante a revisão;
- evitar duplicação entre documentos;
- preservar alertas de segurança, Supabase, RLS, migrations e dados reais.

---

## 7. Controle da revisão documental
=======
## 6. Controle da revisão documental
>>>>>>> 834f91f (docs: atualiza guias e documentação funcional)

| Ordem | Documento | Status | Observações |
|---:|---|---|---|
| 1 | `docs/PLANO_PROXIMOS_PASSOS.md` | Revisado | Plano atualizado com pendências reais e frente mobile final. |
| 2 | `docs/README.md` | Revisado | Índice canônico alinhado aos documentos consolidados e à frente mobile. |
| 3 | `docs/GUIA_IMPLEMENTACOES.md` | Revisado | Inventário consolidado, incluindo portais mobile. |
| 4 | `docs/GUIA_UX_LAYOUT.md` | Revisado | Guia visual atualizado com controles mobile, paleta no menu mobile e edição mobile. |
| 5 | `docs/GUIA_COMPONENTES.md` | Revisado | Catálogo técnico atualizado com `MobileTreeControlsPortal` e `MobileUserMenuPalettePortal`. |
| 6 | `docs/GUIA_CORRECAO_ERROS.md` | Revisado | Troubleshooting reestruturado. |
| 7 | `docs/arquitetura/ARCHITECTURE.md` | Revisado | Arquitetura atualizada. |
| 8 | `docs/arquitetura/ROTAS_E_GUARDS.md` | Revisado | Rotas e guards alinhados. |
| 9 | `docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Revisado | Modelo de dados consolidado. |
| 10 | `docs/operacao/MIGRATIONS_SUPABASE.md` | Revisado | Procedimentos seguros e migrations recentes. |
| 11 | `docs/funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Revisado | Perfil/admin/reset/sugestões/conjugal. |
| 12 | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` | Revisado | View direta da árvore e controles mobile. |
| 13 | `docs/funcionalidades/GENEALOGIA_VIEW.md` | Revisado | Gerações, Visão Completa e reset de geração ativa; mantém DOC-001. |
| 14 | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Revisado | Legendas, conectores e filtros. |
| 15 | `docs/funcionalidades/MINHA_ARVORE_EDITAR.md` | Revisado | Edição própria e CSS mobile escopado; mantém DOC-002 e DOC-003. |
| 16 | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Revisado | Filtros e pets. |
| 17 | `docs/funcionalidades/FORUM.md` | Revisado | Fórum, reações, favoritos e notificações. |
| 18 | `docs/funcionalidades/NOTIFICACOES.md` | Revisado | Preferências, logs, e-mail, Edge Functions e fórum. |
| 19 | `docs/funcionalidades/CALENDARIO_FAMILIAR.md` | Revisado | Calendário, filtros mobile e Google Agenda. |
| 20 | `docs/funcionalidades/TIMELINE.md` | Revisado | Timeline alinhada a `person_events` e `/minha-arvore/editar`. |
| 21 | `docs/funcionalidades/EXPORTACAO_ARVORE.md` | Revisado | Exportação por seleção e fluxo mobile rápido; mantém DOC-004. |
| 22 | `docs/operacao/README.md` | Revisado | Índice operacional enxuto e referência histórica corrigida. |
| 23 | `docs/operacao/DEPLOYMENT.md` | Revisado | Deploy, variáveis, build, Supabase e secrets. |
| 24 | `docs/operacao/STORAGE_MAINTENANCE.md` | Revisado | Storage, dry-run, base64 legado e service role. |
| 25 | `docs/comandos/GIT_RESPONSIVIDADE.md` | Revisado | Mantido como checklist operacional/histórico. |
| 26 | `docs/ATTRIBUTIONS.md` | Revisado | Atribuições e cuidados de licenças consolidados. |
| 27 | `docs/historico/README.md` | Revisado | Índice histórico consolidado, incluindo frente mobile final. |
| 28 | `docs/historico/*` | Consolidado | Conteúdo útil reunido em `docs/historico/README.md`; arquivos históricos individuais devem permanecer removidos. |
| 29 | `docs/historico/documentacao-antiga/*` | Consolidado | Arquivo morto removido após absorção do conteúdo útil nos canônicos. |
| 30 | `docs/historico/sql-legado/*` | Consolidado | SQL legado removido; schema real permanece em `supabase/migrations/`. |

---

<<<<<<< HEAD
=======
## 7. Regras para alteração documental

- não alterar código do sistema durante uma frente apenas documental;
- não aplicar migration;
- não alterar dados reais;
- não criar usuário;
- não fazer validação visual autenticada quando a tarefa for apenas revisão documental;
- comparar documentação com código, rotas, componentes, services, hooks, migrations e fluxos reais quando necessário;
- registrar neste plano apenas pendências reais encontradas durante a revisão;
- evitar duplicação entre documentos;
- preservar alertas de segurança, Supabase, RLS, migrations e dados reais.

---

>>>>>>> 834f91f (docs: atualiza guias e documentação funcional)
## 8. Comandos para o commit documental final

Executar apenas quando todos os arquivos revisados forem substituídos manualmente:

```bash
git status --short
git diff --check
npm run build
```

Commit sugerido:

```bash
git add docs/README.md docs/GUIA_IMPLEMENTACOES.md docs/GUIA_COMPONENTES.md docs/GUIA_UX_LAYOUT.md docs/GUIA_CORRECAO_ERROS.md docs/PLANO_PROXIMOS_PASSOS.md
git add docs/arquitetura/ARCHITECTURE.md docs/arquitetura/ROTAS_E_GUARDS.md docs/arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md
git add docs/operacao/README.md docs/operacao/DEPLOYMENT.md docs/operacao/STORAGE_MAINTENANCE.md docs/operacao/MIGRATIONS_SUPABASE.md
git add docs/funcionalidades/*.md docs/comandos/GIT_RESPONSIVIDADE.md docs/ATTRIBUTIONS.md docs/historico/README.md
git commit -m "docs: revise final project documentation"
git pull --rebase origin main
git push origin main
```

Não usar `git add .`.
