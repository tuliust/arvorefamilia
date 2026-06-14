# Histórico consolidado

> Última revisão: 2026-06-13  
> Local canônico: `docs/historico/README.md`  
> Tipo: consolidação histórica e índice da pasta `docs/historico/`.  
> Status: revisado após consolidação de `/mapa-familiar`, `/mapa-familiar-horizontal`, exportação com título/loading/SVGs, remoção de rotas experimentais e atualização dos documentos canônicos.

---

## 1. Objetivo

Esta pasta existe apenas para preservar rastreabilidade técnica e operacional do projeto **Árvore Família**.

O estado atual do produto não deve ser consultado nos históricos. A fonte de verdade fica nos documentos canônicos:

```txt
docs/README.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/arquitetura/
docs/funcionalidades/
docs/operacao/
```

Regra principal:

```txt
Se houver divergência entre este histórico consolidado e a documentação canônica atual, prevalece a documentação canônica atual.
```

---

## 2. Decisão documental

A documentação histórica foi consolidada neste arquivo para:

- reduzir duplicidade;
- evitar que diagnósticos antigos sejam tratados como documentação viva;
- registrar apenas decisões passadas úteis;
- deslocar regras atuais para guias canônicos;
- manter QA e rastreabilidade sem vários arquivos obsoletos.

Conteúdos históricos antigos não devem ser recriados como fonte de operação.

---

## 3. Arquivos históricos consolidados/removidos

| Arquivo antigo | Decisão | Destino atual da informação útil |
|---|---|---|
| `DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | consolidado/removido | `docs/README.md`, `docs/PLANO_PROXIMOS_PASSOS.md` |
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | consolidado/removido | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| `QA_7_6_EXPORTACAO_ARVORE.md` | consolidado/removido | `docs/funcionalidades/EXPORTACAO_ARVORE.md`, `docs/PLANO_PROXIMOS_PASSOS.md` |
| `QA_FINAL_MVP.md` | consolidado/removido | `docs/PLANO_PROXIMOS_PASSOS.md` |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | consolidado/removido | `docs/GUIA_UX_LAYOUT.md` |
| `AJUSTES_MOBILE_2026-06-02.md` | consolidado/removido | guias funcionais e `GUIA_UX_LAYOUT.md` |
| `documentacao-antiga/*` | consolidado/removido | documentos canônicos |
| `sql-legado/*` | consolidado/removido | `supabase/migrations/` e scripts operacionais seguros |

---

## 4. Linha histórica resumida

### 4.1 Auditoria documental

A auditoria anterior identificou lacunas em:

- componentes;
- UX/layout;
- implementação;
- notificações;
- plano de próximos passos;
- exportação;
- responsividade;
- Storage;
- timeline;
- rotas/guards.

Essas lacunas foram redistribuídas entre documentos canônicos. Divergências atuais devem ser registradas em `PLANO_PROXIMOS_PASSOS.md`.

---

### 4.2 Exportação da árvore - frente 7.6

A frente 7.6 introduziu o fluxo de exportação client-side da árvore.

Itens históricos:

- seleção retangular;
- cancelamento por botão/Esc;
- PNG;
- PDF;
- impressão;
- limite preventivo de pixels;
- exclusão de controles/menus/overlays;
- mensagens de erro;
- integração com `html2canvas` e `jspdf`.

A evolução posterior consolidou:

- exportação das superfícies HTML/CSS/SVG de `/mapa-familiar` e `/mapa-familiar-horizontal`;
- título no canvas exportado;
- loading contextual;
- impressão assíncrona;
- correção de avatares/SVGs;
- seleção por área alinhada à superfície exportável.

Documento canônico:

```txt
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

### 4.3 QA final do MVP

O checklist histórico de QA foi consolidado em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/*.md
```

Comandos preservados:

```bash
git status --short
git diff --check
npm run build
npm test
npm run test:e2e
supabase migration list
```

Critérios permanentes:

- sem overflow horizontal global;
- headers usáveis;
- botões acessíveis por toque;
- cards sem estouro;
- modais com rolagem interna;
- árvore utilizável com pan/zoom;
- exportação validada;
- guards e RLS preservados;
- build aprovado.

---

### 4.4 Responsividade mobile/tablet

A frente de responsividade consolidou:

- breakpoints 320, 375, 390, 430 e tablet;
- headers compactos;
- bottom nav;
- modais/drawers com safe area;
- árvore mobile segmentada;
- controles mobile;
- painéis e filtros adaptáveis.

Documento canônico:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

### 4.5 Minha Árvore mobile segmentada

A experiência mobile da Minha Árvore evoluiu para:

```txt
Paterno | Central | Materno
```

com malha 3×3:

```txt
[ vazio            ] [ Ancestrais globais ] [ vazio           ]
[ Tios Paternos    ] [ Central             ] [ Tios Maternos   ]
[ Primos Paternos  ] [ vazio               ] [ Primos Maternos ]
```

Características consolidadas:

- `MobileFamilyTreeView`;
- conectores HTML/CSS;
- preview durante swipe;
- linhas vitais com anos;
- card central sem badge `VOCÊ`;
- avatar visual por `genero`;
- reutilização em `/mapa-familiar` mobile.

Documentos canônicos:

```txt
docs/funcionalidades/MINHA_ARVORE_VIEW.md
docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md
```

---

### 4.6 Mapa Familiar Vertical

A rota `/mapa-familiar` foi consolidada como view default da árvore.

Características:

- desktop/tablet usa `DesktopFamilyMapView`;
- mobile usa `MobileFamilyTreeView`;
- root exportável próprio;
- conectores SVG;
- grupos expansíveis;
- paletas;
- cônjuges com regra própria;
- filtros de grupo/status;
- `Destacar > Grupos` com modo sem chrome;
- labels `PAI`, `MÃE` e `CÔNJUGE` ocultáveis;
- exportação com título e tratamento de SVG.

Documentos canônicos:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

### 4.7 Mapa Familiar Horizontal

A rota `/mapa-familiar-horizontal` substituiu rotas experimentais e tornou-se view oficial.

Características:

- `DesktopFamilyHorizontalMapView`;
- colunas por `manual_generation`;
- gerações 1 a 6;
- colunas vazias ocultadas;
- cônjuges adjacentes;
- conectores SVG de casal/filhos;
- título `Genealogia de {nome}`;
- barra mobile visual `Paterno | Central | Materno`;
- exportação com título, loading e tratamento de SVGs;
- filtro **Cônjuges** com escopo colateral/descendente.

Rotas antigas removidas:

```txt
/mapa-horizontal
/visao-completa-teste
```

Documentos canônicos:

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/arquitetura/ARCHITECTURE.md
```

---

### 4.8 Painel lateral e mobile

O painel foi consolidado com:

- Vertical/Horizontal;
- Cores;
- Exportar;
- Destacar;
- Filtros;
- Legendas;
- Ações;
- Restaurar visualização.

No mobile:

- `/mapa-familiar` e `/mapa-familiar-horizontal` usam painel do `HomeMobileNav`;
- `MobileTreeControlsPortal` retorna `null` nessas duas rotas;
- demais views de árvore podem continuar usando o portal mobile.

Documento canônico:

```txt
docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md
```

---

### 4.9 Paletas, avatares e SVGs

Frente consolidada:

- paletas `white`, `visual`, `orange`, `brown`;
- `FamilyTreeVisualCards`;
- avatar visual por `genero`;
- classes semânticas para SVGs;
- estrela e cruz com contraste;
- pets alinhados à paleta visual;
- correção de SVGs no `html2canvas`.

Documentos canônicos:

```txt
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/funcionalidades/EXPORTACAO_ARVORE.md
```

---

## 5. Estado histórico obsoleto

Não tratar como atual:

- `/mapa-horizontal`;
- `/visao-completa-teste`;
- botão Horizontal apontando para `/visao-completa`;
- `/` redirecionando para `/minha-arvore`;
- Mapa Familiar Horizontal como experimento;
- exportação sem título;
- exportação sem loading;
- `MobileTreeControlsPortal` duplicado nas rotas do Mapa Familiar;
- aba mobile antiga `Núcleo`;
- aba mobile antiga `Completa`;
- filtro **Cônjuges** como controle do cônjuge principal no Mapa Familiar.

---

## 6. Destinos canônicos

| Tema | Documento atual |
|---|---|
| Índice | `docs/README.md` |
| Implementações | `docs/GUIA_IMPLEMENTACOES.md` |
| Componentes | `docs/GUIA_COMPONENTES.md` |
| UX/layout | `docs/GUIA_UX_LAYOUT.md` |
| Pendências | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Rotas/guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Arquitetura | `docs/arquitetura/ARCHITECTURE.md` |
| Minha Árvore | `docs/funcionalidades/MINHA_ARVORE_VIEW.md` |
| Filtros/pets | `docs/funcionalidades/MINHA_ARVORE_FILTROS_E_PETS.md` |
| Mapa Familiar | `docs/funcionalidades/MAPA_FAMILIAR_VIEW.md` |
| Genealogia | `docs/funcionalidades/GENEALOGIA_VIEW.md` |
| Painel/conectores | `docs/funcionalidades/ARVORE_LEGENDAS_CONECTORES_PAINEL.md` |
| Exportação | `docs/funcionalidades/EXPORTACAO_ARVORE.md` |
| Migrations | `docs/operacao/MIGRATIONS_SUPABASE.md` |

---

## 7. Regra de manutenção histórica

Ao concluir uma frente nova:

1. atualizar documento canônico;
2. mover pendências reais para `PLANO_PROXIMOS_PASSOS.md`;
3. registrar apenas resumo histórico aqui, se necessário;
4. não recriar arquivos históricos individuais;
5. não usar histórico para orientar implementação sem checar código atual.
