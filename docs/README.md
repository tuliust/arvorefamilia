# Documentacao - Arvore Familia

> Indice canonico da documentacao do projeto `tuliust/arvorefamilia`.
> Ultima revisao: 2026-06-07
> Status: documentacao canonica com pendencias visuais finais rastreadas.

Este diretorio concentra a documentacao tecnica e funcional do projeto **Arvore Familia**.

Use este arquivo como ponto de entrada antes de consultar documentos antigos, historicos ou arquivos soltos na raiz do repositorio.

Regra geral:

- documentos na raiz de `docs/` sao canonicos para guias gerais;
- documentos em `docs/funcionalidades/` sao canonicos para comportamento detalhado de funcionalidades especificas;
- documentos historicos nao substituem os guias oficiais;
- pendencias visuais ainda abertas devem ficar em `PLANO_PROXIMOS_PASSOS.md`, nao misturadas com estado consolidado.

---

## 1. Guias oficiais

Os guias oficiais ficam na raiz de `docs/` e devem ser tratados como documentacao canonica.

| Arquivo | Quando usar |
|---|---|
| `GUIA_IMPLEMENTACOES.md` | Consultar o estado consolidado do que ja foi implementado, decisoes tecnicas e frentes concluidas. Deve separar implementado de refinamento visual pendente. |
| `GUIA_COMPONENTES.md` | Localizar componentes reutilizaveis, responsabilidades, props, padroes de uso e cuidados contra regressoes. |
| `GUIA_UX_LAYOUT.md` | Orientar decisoes visuais, responsividade, headers, containers, arvore, painel lateral, menus e microcopy. |
| `GUIA_CORRECAO_ERROS.md` | Investigar falhas por sintoma, build quebrado, permissoes, RLS, Storage, formularios, arvore e regressoes visuais. |
| `PLANO_PROXIMOS_PASSOS.md` | Acompanhar fechamento de MVP, criterios de bloqueio, QA final, pendencias visuais finais e backlog pos-MVP. |

---

## 2. Arquitetura

Documentos de arquitetura ficam em `docs/arquitetura/`.

| Arquivo | Quando usar |
|---|---|
| `arquitetura/ARCHITECTURE.md` | Consultar a visao sintetica da arquitetura atual do projeto. |
| `arquitetura/ROTAS_E_GUARDS.md` | Consultar rotas publicas, rotas de membro, rotas administrativas, guards de acesso e regras de navegacao. |
| `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Consultar estrutura de usuarios, pessoas, vinculos, perfis, tabelas de apoio e fluxos de dados. |

Se houver divergencia entre documento antigo e guia canonico, prevalece a documentacao canonica em `docs/`.

---

## 3. Funcionalidades especificas

Documentos de funcionalidades ficam em `docs/funcionalidades/`.

| Arquivo | Escopo |
|---|---|
| `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Legenda visual, conectores, painel lateral, filtros de linhas e camadas visuais da arvore. |
| `funcionalidades/CALENDARIO_FAMILIAR.md` | Calendario familiar, datas familiares, categorias, sidebar, filtros e ajustes de exibicao. |
| `funcionalidades/EXPORTACAO_ARVORE.md` | Exportacao de area visivel da arvore em PNG/PDF/impressao e selecao retangular. |
| `funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` | Regras especificas da Minha Arvore, filtros diretos, pets e regras de exibicao. |
| `funcionalidades/MINHA_ARVORE_VIEW.md` | Layout, viewport, ReactFlow, area central, ramos paterno/materno e comportamento da view Minha Arvore. |
| `funcionalidades/GENEALOGIA_VIEW.md` | Layout por geracoes, navegacao mobile por chips, viewport, inferencia visual e QA da view Genealogia. |
| `funcionalidades/MINHA_ARVORE_EDITAR.md` | Edicao da propria arvore pelo membro, Meus Dados, avatar, arquivos historicos e saida sem salvar. |
| `funcionalidades/NOTIFICACOES.md` | Notificacoes internas/e-mail, preferencias, logs, Edge Functions, rotina diaria e cron seguro. |
| `funcionalidades/PESSOAS_PERFIL_ADMIN.md` | Perfil publico, admin de pessoa, dados pessoais, privacidade, vinculos e edicao. |
| `funcionalidades/TIMELINE.md` | Linha do tempo, eventos derivados, eventos pessoais e evolucao pos-MVP. |

---

## 4. Operacao e manutencao

Documentos operacionais ficam em `docs/operacao/`.

| Arquivo | Quando usar |
|---|---|
| `operacao/README.md` | Indice da pasta de operacao e manutencao. |
| `operacao/DEPLOYMENT.md` | Deploy, variaveis de ambiente, Supabase, build e publicacao estatica. |
| `operacao/STORAGE_MAINTENANCE.md` | Manutencao controlada de Storage, dry-run, orfaos e auditoria. |
| `operacao/MIGRATIONS_SUPABASE.md` | Fluxo de migrations, Supabase, `db push`, scripts SQL legados e seguranca operacional. |

Regras operacionais de banco:

- `supabase/migrations` e a fonte da verdade do schema.
- Scripts SQL soltos sao historicos ou operacionais.
- Nao aplicar SQL legado como schema principal de ambiente novo.
- Nao rodar `supabase db push` sem revisar `supabase migration list`.
- Nao versionar secrets, dumps, tokens ou service role.
- Nao criar migration para ajuste visual de layout, paleta, titulo, menu ou ReactFlow.

---

## 5. Licencas e atribuicoes

| Arquivo | Uso |
|---|---|
| `ATTRIBUTIONS.md` | Atribuicoes e licencas de componentes, bibliotecas ou assets externos. |

---

## 6. Comandos e checklists tecnicos

Documentos de comandos ficam em `docs/comandos/`.

| Arquivo | Uso |
|---|---|
| `comandos/GIT_RESPONSIVIDADE.md` | Comandos, checkpoints e historico tecnico da frente de responsividade. |

Scripts auxiliares relacionados a documentacao ficam em `scripts/` e devem ser usados com cuidado:

| Script | Uso |
|---|---|
| `scripts/fix-docs-encoding.py` | Corrigir mojibake/encoding em Markdown. Usar com `--ascii` se o terminal Windows voltar a corromper acentos. |
| `scripts/polir-documentacao-etapa1.py` | Script experimental de polimento textual. Nao usar sem revisar diff antes do commit. |

Regras para scripts:

- revisar `git diff` antes de commit;
- evitar scripts PowerShell com `Set-Content` em arquivos com acentos quando houver risco de mojibake;
- remover scripts temporarios antes de commit;
- nao commitar `.bak`, patches locais ou saidas de build.

---

## 7. Historico, diagnosticos e QA

Documentos historicos ficam em `docs/historico/`.

Esses arquivos sao referencia historica, diagnostico pontual ou checklist de uma fase especifica. Eles **nao substituem os guias oficiais**.

| Arquivo/pasta | Uso |
|---|---|
| `historico/README.md` | Indice da pasta historica. |
| `historico/DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | Diagnostico de documentacao em uma fase especifica. |
| `historico/DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Diagnostico historico da frente de exportacao da arvore. |
| `historico/QA_7_6_EXPORTACAO_ARVORE.md` | QA historico da frente de exportacao da arvore. |
| `historico/QA_FINAL_MVP.md` | Checklist e rastreabilidade da validacao final do MVP. |
| `historico/RESPONSIVIDADE_MOBILE_TABLET.md` | Checklist/historico da frente de responsividade. |
| `historico/documentacao-antiga/` | Documentos antigos movidos da raiz do repositorio. |
| `historico/sql-legado/` | SQLs antigos, diagnosticos ou referencia historica que nao substituem migrations. |

---

## 8. Como decidir onde documentar

| Tipo de informacao | Destino correto |
|---|---|
| Estado consolidado de uma frente implementada | `GUIA_IMPLEMENTACOES.md` |
| Padrao visual, comportamento responsivo, menu ou microcopy | `GUIA_UX_LAYOUT.md` |
| Componente, props, cuidados de uso e anti-regressao | `GUIA_COMPONENTES.md` |
| Erro, sintoma, causa provavel e correcao | `GUIA_CORRECAO_ERROS.md` |
| Pendencia, bloqueio, QA final ou pos-MVP | `PLANO_PROXIMOS_PASSOS.md` |
| Rota, guard, permissao de acesso ou navegacao | `arquitetura/ROTAS_E_GUARDS.md` |
| Usuario, pessoa, perfil, vinculo e modelo de dados | `arquitetura/ESTRUTURA_USUARIOS_BANCO_DADOS.md` |
| Arquitetura sintetica do projeto | `arquitetura/ARCHITECTURE.md` |
| Deploy, variaveis e publicacao | `operacao/DEPLOYMENT.md` |
| Migration, Supabase, schema, SQL legado ou `db push` | `operacao/MIGRATIONS_SUPABASE.md` |
| Storage, orfaos, base64 legado ou limpeza de midia | `operacao/STORAGE_MAINTENANCE.md` |
| Comportamento detalhado de funcionalidade especifica | `funcionalidades/<NOME_DA_FUNCIONALIDADE>.md` |
| Licencas e atribuicoes externas | `ATTRIBUTIONS.md` |
| Diagnostico antigo, relatorio pontual ou QA de fase | `historico/` |

---

## 9. Regras de organizacao

1. Guias oficiais ficam na raiz de `docs/`.
2. Funcionalidades especificas ficam em `docs/funcionalidades/`.
3. Procedimentos operacionais ficam em `docs/operacao/`.
4. Arquitetura fica em `docs/arquitetura/`.
5. Licencas e atribuicoes ficam em `docs/ATTRIBUTIONS.md`.
6. Comandos auxiliares e checklists pontuais ficam em `docs/comandos/`.
7. Diagnosticos, relatorios antigos, QA e documentos de fase ficam em `docs/historico/`.
8. Documentos antigos da raiz do repositorio devem ficar em `docs/historico/documentacao-antiga/`.
9. Scripts SQL soltos sao historicos ou operacionais; a fonte da verdade do banco deve continuar sendo `supabase/migrations`.
10. Dumps, backups sensiveis, tokens, secrets e service role nao devem ser versionados.
11. Documentos historicos devem ser identificados como historicos para evitar uso como fonte canonica.
12. Quando uma informacao couber em mais de um arquivo, mantenha o detalhe tecnico em apenas um lugar e use links cruzados nos demais.
13. Nao documentar como concluido item que ainda depende de validacao visual aberta.

---

## 10. Checklist antes de criar nova documentacao

Antes de criar um novo `.md`, verificar:

- se o tema ja esta coberto por um guia oficial;
- se o conteudo e funcional, operacional, arquitetural, legal ou historico;
- se o novo documento evita duplicidade;
- se ha links cruzados para os guias relacionados;
- se o documento deixa claro o que e canonico, historico ou pos-MVP;
- se pendencias foram colocadas no plano, nao em guias de implementacao;
- se o arquivo pertence mesmo a `docs/` ou se deve ficar fora do repositorio por conter dado sensivel.

---

## 11. Ajustes recentes documentados - ciclo 2026-05-30

Este ciclo consolidou ajustes em header da arvore, busca, dropdowns, modal de curiosidades, edicao da propria arvore, modal de relacionamento e guard de acesso.

Documentos que devem permanecer sincronizados:

| Frente | Documento canonico |
|---|---|
| Header da arvore, busca, sugestoes e camadas | `GUIA_UX_LAYOUT.md` e `funcionalidades/MINHA_ARVORE_VIEW.md` |
| Componentes base Radix, modais e utilitarios visuais | `GUIA_COMPONENTES.md` |
| Edicao da propria arvore pelo membro | `funcionalidades/MINHA_ARVORE_EDITAR.md` |
| Perfil publico, contato, relacionamento e modal conjugal | `funcionalidades/PESSOAS_PERFIL_ADMIN.md` |
| Rotas, guards e redirecionamento para `/meus-dados` | `arquitetura/ROTAS_E_GUARDS.md` |
| Sintomas, encoding e correcoes por regressao | `GUIA_CORRECAO_ERROS.md` |
| Linhas, conectores e legenda da arvore | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |

### 11.1 Estado consolidado

Itens concluidos e que devem ser tratados como anti-regressao:

- `/privacidade` e `/termos` sem texto **Arvore Genealogica** no lado direito do header;
- data oficial de ultima atualizacao legal: **01/06/2026**;
- `Legendas > Linhas > Todas` oculta tambem linhas de primos;
- header da arvore possui busca com sugestoes de pessoas e paginas;
- busca possui pagina completa de resultados;
- dropdown de views e menu do usuario abrem acima do header;
- cards estatisticos de **Curiosidades > Voce Sabia?** possuem cores distintas;
- `/minha-arvore/editar` possui modal de foto, arquivos historicos separados e saida sem salvar;
- modal conjugal nao exibe ID tecnico;
- `TreeAccessRoute` nao deve redirecionar recorrentemente usuarios ja vinculados para `/meus-dados`.

### 11.2 Pendencias a manter rastreaveis

Itens ainda pendentes ou em ajuste incremental devem ficar em `PLANO_PROXIMOS_PASSOS.md` ou no documento funcional correspondente:

- reduzir espacos laterais e ampliar cards da view `/minha-arvore`;
- reduzir truncamento excessivo de nomes;
- concluir ajustes de `/pessoa/:id`: remover signo, contato por WhatsApp no telefone e casamento/viuvez;
- concluir ajustes de `/notificacoes`: acentuacao, tag **ESPECIAIS** e item inteiro clicavel;
- revisar ocorrencias de encoding na origem quando surgirem novos textos corrompidos.

---

## 12. Ajustes recentes documentados - ciclo 2026-06-06

Este ciclo documenta os PRs #6 e #7:

```txt
PR #6 - feat: adicionar paletas visuais da arvore
PR #7 - fix: exibir paletas no header da arvore
```

Resumo:

- base tecnica de paletas visuais na arvore;
- seletor compacto de paletas visuais no dropdown do `HomeHeader`;
- paletas `white`, `orange` e `brown`;
- persistencia em `localStorage`;
- aplicacao por CSS variables;
- botao/anel conjugal ampliado para `60px x 60px`;
- producao estabilizada apos revert da tentativa anterior e reimplementacao segura via PR #7.

Documentos sincronizados:

| Frente | Documento canonico |
|---|---|
| UX do seletor de paletas | `GUIA_UX_LAYOUT.md` |
| Exposicao das paletas no `HomeHeader` | `GUIA_UX_LAYOUT.md`, `GUIA_COMPONENTES.md` e `GUIA_CORRECAO_ERROS.md` |
| Componentes e tokens | `GUIA_COMPONENTES.md` |
| Estado implementado | `GUIA_IMPLEMENTACOES.md` |
| Legendas, conectores e camadas visuais | `funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Minha Arvore, containers e grupos | `funcionalidades/MINHA_ARVORE_VIEW.md` |
| Pendencias e QA visual | `PLANO_PROXIMOS_PASSOS.md` |
| Erros recorrentes de script/merge | `GUIA_CORRECAO_ERROS.md` |

Pendencias rastreadas:

- validar contraste das tres paletas quando tokens forem alterados;
- avaliar acesso equivalente em mobile estreito, se o dropdown de views nao estiver disponivel;
- ajustar padding superior dos titulos dos grupos sem alterar o tamanho total dos containers, se a demanda visual continuar ativa.

---

## 13. Ajustes recentes documentados - ciclo 2026-06-06 / Genealogia mobile

Este ciclo documenta a frente de navegacao mobile da view **Genealogia**.

Resumo:

- `/genealogia` mobile passou a usar chips horizontais por geracao;
- labels dos chips foram refinados para **Tataravos**, **Bisavos**, **Avos**, **Pais**, **Nucleo** e **Descendentes**;
- chips nao exibem contagem;
- swipe lateral entre geracoes foi implementado;
- chips focam/enquadram a geracao ativa, mas nao escondem as demais colunas;
- colunas vazias foram removidas;
- inferencia de `manual_generation` em memoria foi adicionada para a Genealogia com base na pessoa central;
- a tela inicial mobile deve focar a primeira coluna real renderizada;
- o ajuste estrutural tambem beneficia desktop quando havia `Geracao 1` vazia;
- botoes de zoom `+` e `-` foram ocultados apenas na Genealogia mobile;
- nenhuma migration, RLS, permissao ou dado real foi alterado.

Documentos que devem permanecer sincronizados:

| Frente | Documento canonico |
|---|---|
| UX da Genealogia mobile | `GUIA_UX_LAYOUT.md` e `funcionalidades/GENEALOGIA_VIEW.md` |
| Componentes da Genealogia | `GUIA_COMPONENTES.md` |
| Estado implementado | `GUIA_IMPLEMENTACOES.md` |
| Troubleshooting de geracoes/viewport | `GUIA_CORRECAO_ERROS.md` |
| Pendencia de aplicar padrao em Visao Completa | `PLANO_PROXIMOS_PASSOS.md` |

Pendencia rastreavel:

- aplicar padrao semelhante em `/visao-completa` somente apos validacao da Genealogia.

---

## 14. Ajustes recentes documentados - ciclo 2026-06-07 / Menu, arvore e paginas auxiliares

Este ciclo documenta ajustes de navegacao do usuario, refinamento visual das views da arvore e acoes auxiliares de calendario, perfil e notificacoes.

### 14.1 Consolidado

- o header da arvore deve manter o botao compacto de usuario;
- o menu aberto nas views da arvore deve ser o painel compartilhado de `UserProfileMenu`;
- `UserProfileMenu` tem variante visual para o header da arvore;
- o cabecalho do menu, com avatar, nome e e-mail, deve navegar para `/minha-arvore/editar`;
- o item **Editar notificacoes** foi removido do menu;
- `/minha-arvore/editar` recebeu botao **Trocar Senha**;
- `/notificacoes` recebeu botao **Personalizar Notificacoes** para `/ajustar-notificacoes`;
- `/calendario-familiar` teve textos e hierarquia visual refinados no grid de eventos;
- `/ajustar-notificacoes` teve titulos corrigidos;
- as views da arvore nao devem corrigir espacamento com `translate` em `.react-flow__viewport`.

### 14.2 Pendencias visuais ainda abertas

Nao documentar como concluido ate validacao visual final:

- aliancas ainda podem aparecer pouco visiveis em `/minha-arvore`;
- titulo da arvore pode estar muito proximo do topo;
- espaco entre titulo e cards ainda pode estar grande;
- pode haver divergencia visual entre menu das views da arvore e menu das paginas internas;
- qualquer diferenca de menu deve ser diagnosticada em `HomeHeader.tsx`, `UserProfileMenu.tsx` e `MemberPageHeader.tsx` antes de unificacao.

Documentos sincronizados neste ciclo:

| Frente | Documento canonico |
|---|---|
| Menu compartilhado e variante do header da arvore | `GUIA_COMPONENTES.md`, `GUIA_UX_LAYOUT.md` e `GUIA_CORRECAO_ERROS.md` |
| Titulo, viewport e aliancas da Minha Arvore | `funcionalidades/MINHA_ARVORE_VIEW.md`, `GUIA_UX_LAYOUT.md` e `GUIA_CORRECAO_ERROS.md` |
| Estado implementado e refinamentos pendentes | `GUIA_IMPLEMENTACOES.md` |
| Calendario familiar | `funcionalidades/CALENDARIO_FAMILIAR.md` |
| Edicao do proprio perfil | `funcionalidades/MINHA_ARVORE_EDITAR.md` |
| Notificacoes e preferencias | `funcionalidades/NOTIFICACOES.md` |
| QA e pendencias finais | `PLANO_PROXIMOS_PASSOS.md` |

Checklist de manutencao:

- nao reintroduzir `UserMenu` local no shell da Home;
- nao usar reposicionamento visual agressivo do ReactFlow para corrigir espacamento;
- manter `/notificacoes` como central/lista e `/ajustar-notificacoes` como pagina de preferencias;
- manter troca de senha sem nova migration ou regra de banco;
- validar manualmente `/minha-arvore`, `/genealogia`, `/visao-completa`, `/calendario-familiar`, `/minha-arvore/editar`, `/notificacoes` e `/ajustar-notificacoes`.

---

## 15. Validacao documental apos alteracoes

Quando qualquer arquivo desta documentacao for atualizado:

```bash
git diff --check
```

Quando a documentacao acompanhar mudanca de codigo:

```bash
npm run build
git status --short
```

Se houver commit documental:

```bash
git add docs/README.md docs/<outros-arquivos-especificos>
git commit -m "docs: update tree layout and menu documentation"
git push origin main
```

Nao usar `git add .`.
