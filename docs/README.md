# Documentação — Árvore Família

> Última revisão: 2026-06-14  
> Local canônico: `docs/README.md`  
> Projeto: `tuliust/arvorefamilia`  
> Status: índice canônico atualizado após ajustes nas views `/mapa-familiar`, `/mapa-familiar-horizontal`, painel desktop, modal mobile, paletas, avatares e QA.

Este diretório concentra a documentação técnica, funcional, operacional e histórica do projeto **Árvore Família**.

Use este arquivo como ponto de entrada antes de consultar guias específicos. A documentação canônica deve registrar comportamento implementado, contratos de produto vigentes ou pendências explicitamente classificadas como backlog/QA.

---

## 1. Estado atual consolidado

A baseline funcional atual registra:

- `/entrar` funciona como home pública, login, cadastro, primeiro acesso e aceite legal;
- a rota raiz `/` redireciona para `/mapa-familiar`, preservando `location.search`;
- as views oficiais da árvore são apenas:
  - **Árvore Familiar** — `/mapa-familiar`;
  - **Mapa Genealógico** — `/mapa-familiar-horizontal`;
- as antigas views de árvore foram removidas do roteamento ativo:
  - `/minha-arvore`;
  - `/genealogia`;
  - `/visao-completa`;
- `/minha-arvore/editar` continua vigente como rota protegida de edição do membro;
- `TreeViewMode` possui exatamente:
  - `mapa-familiar`;
  - `mapa-familiar-horizontal`;
- `/mapa-familiar` usa:
  - `DesktopFamilyMapView` no desktop/tablet;
  - `MobileFamilyTreeView` no mobile;
- `/mapa-familiar-horizontal` usa:
  - `DesktopFamilyHorizontalMapView` no desktop/tablet;
  - `MobileFamilyHorizontalMapView` no mobile;
- os títulos vigentes são:
  - `/mapa-familiar`: `Árvore Familiar de {primeiroNome}` ou `Árvore Familiar`;
  - `/mapa-familiar-horizontal`: `Mapa Genealógico de {primeiroNome}` ou `Mapa Genealógico`;
- o painel desktop foi simplificado e não possui mais a barra visual `Filtros | Legendas | Ações`;
- o painel desktop preserva:
  - Zoom +;
  - Zoom -;
  - Restaurar visualização;
  - Vertical;
  - Horizontal;
  - Cores;
  - Exportar;
  - Destacar;
  - Grupos;
  - Filtros;
- o modal mobile possui contrato próprio e reduzido:
  - Vertical;
  - Horizontal;
  - Cores;
  - Grupos;
  - Destacar;
  - Filtros;
- o modal mobile não deve exibir:
  - Zoom +;
  - Zoom -;
  - Restaurar visualização;
  - Exportar;
- o botão **Grupos** no mobile abre/fecha os cards de grupos sob demanda;
- os filtros mobile ficam sempre visíveis e devem caber em 4 colunas;
- a alternância Vertical/Horizontal preserva `location.search`, incluindo `?pessoa=...`;
- `PersonProfile` aceita retorno seguro para `/`, `/mapa-familiar` e `/mapa-familiar-horizontal`;
- favoritos e busca global incluem as duas views oficiais;
- aliases como “minha árvore”, “genealogia” e “visão completa” podem existir apenas como keywords que apontam para rotas atuais;
- exportação nas views oficiais cobre:
  - Área;
  - Imagem/PNG;
  - PDF;
  - Imprimir;
- exportação é recurso do painel desktop/completo; o modal mobile de controles não deve expor Exportar;
- ReactFlow/Dagre continuam presentes como dependência técnica de código legado ativo, tipos, layouts ou utilitários; não devem ser removidos por limpeza superficial;
- artefatos locais como `test-results/`, `playwright-report/`, `coverage/`, `backups/` e `.env*.save` ficam fora do versionamento.

---

## 2. Regras de uso da documentação

- Arquivos na raiz de `docs/` são guias canônicos gerais.
- Arquivos em `docs/funcionalidades/` são guias canônicos de comportamento funcional específico.
- Arquivos em `docs/arquitetura/` descrevem rotas, guards, arquitetura e modelo de usuários/dados.
- Arquivos em `docs/operacao/` descrevem procedimentos operacionais e de manutenção.
- Arquivos em `docs/historico/` são históricos e não substituem os guias canônicos.
- Pendências reais, QA e decisões futuras devem ficar em `PLANO_PROXIMOS_PASSOS.md`.
- Quando houver divergência entre documentação e código atual, revisar o código e atualizar o guia canônico.
- Quando houver divergência entre guia atual e conteúdo histórico, prevalece o guia atual.
- Conteúdo histórico não deve ser usado para restaurar `/minha-arvore`, `/genealogia` ou `/visao-completa` como views ativas.
- A referência visual de paletas é o desktop; o mobile deve herdar os mesmos tokens CSS.

---

## 3. Guias oficiais na raiz de `docs/`

| Arquivo | Uso | Status |
|---|---|---|
| `README.md` | Índice canônico da documentação. | Atualizado. |
| `BASELINE_PRODUTO_ATUAL.md` | Estado funcional observado na `main`. | Atualizado. |
| `INVENTARIO_TECNICO.md` | Rotas, componentes, services, tipos, CSS, testes e documentação. | Manter sincronizado. |
| `GUIA_IMPLEMENTACOES.md` | Inventário consolidado do que está implementado. | Manter sincronizado. |
| `GUIA_COMPONENTES.md` | Componentes, responsabilidades, padrões e anti-regressões. | Manter sincronizado. |
| `GUIA_UX_LAYOUT.md` | UX, layout, responsividade, árvore, menus, painéis, paletas e microcopy. | Atualizado. |
| `GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma, causa provável e correção. | Preservar. |
| `REGRAS_DE_NAO_REGRESSAO.md` | Checklist técnico e manual para mudanças futuras. | Atualizar após esta frente. |
| `PLANO_PROXIMOS_PASSOS.md` | Pendências reais, QA e backlog pós-frente. | Atualizado. |
| `DECISOES_ARQUITETURAIS.md` | Decisões estruturais e justificativas. | Manter sincronizado. |
| `ATTRIBUTIONS.md` | Licenças, atribuições e cuidados com assets externos. | Preservar. |

---

## 4. Arquitetura

Pasta:

```txt
docs/arquitetura/
```

| Arquivo | Uso |
|---|---|
| `ARCHITECTURE.md` | Visão sintética da arquitetura atual, stack, camadas, shell da Home, duas views da árvore, exportação client-side, paletas e integrações. |
| `ROTAS_E_GUARDS.md` | Rotas públicas, rotas de árvore, rotas de membro, rotas administrativas, guards, redirecionamentos e navegação. |
| `ESTRUTURA_USUARIOS_BANCO_DADOS.md` | Modelo de usuários, pessoas, vínculos, permissões, favoritos, fórum, notificações e objetos legados. |

---

## 5. Funcionalidades

Pasta:

```txt
docs/funcionalidades/
```

| Arquivo | Escopo | Status |
|---|---|---|
| `MAPA_FAMILIAR_VIEW.md` | Documento canônico de `/mapa-familiar` e `/mapa-familiar-horizontal`. | Referência principal. |
| `ARVORE_LEGENDAS_CONECTORES_PAINEL.md` | Painel, filtros, controles, destaques, conectores e exportação. | Atualizado após ajustes desktop/mobile. |
| `EXPORTACAO_ARVORE.md` | Exportação por Área, Imagem, PDF e Impressão nas duas views oficiais. | Preservar e validar. |
| `FAVORITOS.md` | Favoritos de páginas, pessoas, fórum e integrações. | Preservar. |
| `PESSOAS_PERFIL_ADMIN.md` | Perfil público/admin, reset, sugestões, privacidade, arquivos, eventos e relacionamento conjugal. | Preservar. |
| `MINHA_ARVORE_EDITAR.md` | Edição da própria árvore e CSS mobile escopado. | Vigente; não confundir com a view removida `/minha-arvore`. |
| `FORUM.md` | Fórum, tópicos, menções, respostas, reações, favoritos e notificações. | Preservar. |
| `NOTIFICACOES.md` | Notificações internas/e-mail, preferências, logs, Edge Functions e cron futuro. | Preservar. |
| `CALENDARIO_FAMILIAR.md` | Calendário familiar, categorias, filtros mobile e Google Agenda. | Preservar. |
| `TIMELINE.md` | Timeline de pessoa, eventos derivados, arquivos históricos, relacionamentos e pós-MVP. | Preservar. |
| `CURIOSIDADES_E_IA.md` | Funcionalidades de curiosidades, IA e geração de conteúdo. | Preservar. |

Documentos sobre antigas views de árvore devem permanecer em `docs/historico/` ou marcados como legado:

```txt
MINHA_ARVORE_VIEW.md
MINHA_ARVORE_FILTROS_E_PETS.md
GENEALOGIA_VIEW.md
```

Antes de arquivar documentos mistos, extrair regras ainda vigentes sobre pets, filtros, cônjuges, conectores ou exportação.

---

## 6. Contratos críticos

### Rotas oficiais da árvore

```txt
/
/mapa-familiar
/mapa-familiar-horizontal
```

### Exceção nominal vigente

```txt
/minha-arvore/editar
```

### Rotas antigas removidas como views

```txt
/minha-arvore
/genealogia
/visao-completa
```

### Títulos oficiais

```txt
/mapa-familiar            -> Árvore Familiar de {primeiroNome}
/mapa-familiar-horizontal -> Mapa Genealógico de {primeiroNome}
```

### Avatares oficiais

```txt
Pessoa com foto -> foto_principal_url
Pessoa sem foto -> User, lucide-react
Pet             -> PawPrint, lucide-react
```

Não há distinção visual de avatar por gênero.

### Paletas oficiais

```txt
white  -> Branca
visual -> Azul
orange -> Laranja
brown  -> Marrom
```

O desktop é referência visual. Mobile deve usar os mesmos tokens `--tree-palette-*`.

### Testes mínimos de baseline

```bash
npm run build
npm test
npm run test:e2e
git diff --check
git status --short
```

### Buscas recomendadas

```bash
rg "minha-arvore"
rg "genealogia"
rg "visao-completa"
rg "/minha-arvore|/genealogia|/visao-completa"
rg "TreeViewMode|treeViewMode"
rg "Filtros|Legendas|Ações"
rg "from-teal|to-cyan|border-cyan|bg-cyan|text-cyan"
rg "Visualizar como"
```

Interpretação:

- `/minha-arvore/editar` pode permanecer;
- `genealogia` pode aparecer como conceito textual da horizontal, mas não como rota ativa;
- `docs/historico/` pode conter material legado;
- aliases antigos podem existir como keywords de busca/favoritos, desde que apontem para rotas atuais;
- a barra `Filtros | Legendas | Ações` não deve voltar como UI ativa;
- cores hardcoded em mobile devem ser tratadas como possível regressão se substituírem tokens de paleta.

---

## 7. Estado final da frente

A frente de refatoração e ajustes da árvore deve fechar com:

- build de produção passando;
- testes unitários passando;
- testes E2E passando, quando aplicáveis;
- `git diff --check` sem erro;
- working tree limpo;
- `main` sincronizada com `origin/main`;
- rotas antigas bloqueadas por teste;
- painel desktop completo e modal mobile específico;
- paletas mobile sincronizadas com desktop;
- avatares padronizados;
- documentação canônica revisada.

Pendências reais remanescentes ficam em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```
