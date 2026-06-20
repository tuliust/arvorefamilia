# Histórico — rodada mobile dos mapas familiares em 2026-06-20

> Última revisão: 2026-06-20  
> Local: `docs/historico/RODADA_MAPA_FAMILIAR_MOBILE_2026_06_20.md`  
> Tipo: registro histórico de implementação e QA visual  
> Status: histórico; não substitui documentos canônicos.

---

## 1. Contexto

Esta rodada concentrou ajustes nas experiências mobile das rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

O foco foi corrigir:

- conectores de avós, ancestrais e descendentes;
- criação e comportamento da tela `descendants`;
- sizing, títulos e rolagem das telas de tios;
- travamentos causados por observers e redesenhos de conectores;
- botão `Zoom` e overview com 9 cards;
- painel aberto pelo botão `+`;
- documentação e checklists correspondentes.

---

## 2. Principais entregas técnicas

### 2.1 Conectores de avós e ancestrais

Arquivos:

```txt
src/mobileFamilyTreeAncestorConnectorsFix.ts
```

Implementações:

- linhas verticais dos avós para o núcleo central;
- linhas laterais de avós para ancestrais profundos;
- remoção/ajuste de conectores duplicados ou desalinhados.

### 2.2 Tela `descendants`

Arquivos:

```txt
src/mobileFamilyTreeDescendantScreen.ts
src/mobileFamilyTreeDescendantConnectorsFix.ts
src/mobileFamilyTreeCoreDescendantConnector.ts
```

Implementações:

- tela adicional abaixo de `core`;
- clonagem dos grupos de descendentes/vínculos próximos;
- linha do card central para a tela inferior;
- ramificação para `Irmãos` e `Cônjuge`;
- conexão de `Irmãos` para `Sobrinhos`;
- conexão de `Cônjuge` para `Pets` e/ou `Filhos`;
- ocultação de conectores antigos transparentes.

### 2.3 Telas de tios

Arquivos:

```txt
src/mobileFamilyTreeUncleSizingFix.ts
src/mobileFamilyTreeUncleScreenGuards.ts
src/mobileFamilyTreeScrollAndVisibilityFix.ts
src/app/components/FamilyTree/mobileFamilyTreeModel.ts
```

Implementações:

- ajustes de largura, altura e tipografia dos cards;
- centralização dos grupos;
- redução visual de `maternal-uncles`;
- tentativa de rolagem interna em `paternal-uncles` e `maternal-uncles`;
- inferência melhorada de pai/mãe no modelo mobile.

### 2.4 Títulos de grupos

Arquivo:

```txt
src/mobileFamilyTreeGroupTitleVisibilityFix.ts
```

Implementações:

- títulos forçados como visíveis;
- cor escura em Safari/iOS;
- fonte reduzida;
- marcação de grupos por quantidade de cards.

### 2.5 Performance

Arquivo:

```txt
src/mobileFamilyTreeMutationPerformanceGuard.ts
```

Implementações:

- filtragem de mutações geradas por conectores;
- agendamento por `requestAnimationFrame`;
- redução de risco de loops de `MutationObserver`.

### 2.6 Overview/Zoom

Arquivo:

```txt
src/mobileFamilyTreeZoomOverviewFix.ts
```

Implementações:

- overview com 9 cards em `/mapa-familiar`;
- navegação dos cards para telas da grade 3x3;
- abertura do overview também em `/mapa-familiar-horizontal`;
- mapeamento da horizontal por gerações.

### 2.7 Painel `+`

Arquivo:

```txt
src/mobileFamilyMapFullPanelStyleFix.ts
src/main.tsx
```

Implementações:

- overlay mais escuro;
- painel principal branco/opaco;
- import do ajuste via `main.tsx`.

---

## 3. Commits relevantes

| Commit | Tema |
|---|---|
| `f49fed6f11a43c4c83eda356d1b4042db50433eb` | correção inicial das linhas dos avós |
| `91ae420ad08b2ad54dc2aae955d5de1139475444` | padronização de linhas dos avós |
| `9d63a169880b19e9b63af39762014fd07c9763f2` | conexões laterais dos avós aos bisavós |
| `84445b5db0962b8b5ea38692ccbd5bb17214669b` | conector do card central aos descendentes |
| `d7503293272cc5cb0f8b762111e5b58b8cad9fff` | carregamento do conector central-descendentes |
| `99c42cfa261dcec68a10a424d75d49e7c306bae1` | remoção de linhas nativas transparentes em descendentes |
| `2f128355821c32a216b495eac9c60fde5332ebba` | guard de performance para observers mobile |
| `6d280568269212b4c3c385ca4652dd78f8dd6da9` | ajuste visual inicial das telas de tios |
| `91da8cdd06c51eb273fd261bdb6c59d7d68aaa72` | correção de tamanho e centralização dos tios |
| `1a1b41a7c39739b3f23271896cfb5afa315e0649` | visibilidade dos títulos dos grupos |
| `1927b63b474f7aa257e1355c286ce0f19745d98f` | conexão cônjuge → pets/filhos |
| `6bd58ed286960a695fe76ed4a9be2b44eedf79e4` | fonte menor e largura por número de cards |
| `36800f69204b6e5adac9579721837b9f9e35d486` | inferência de pai/mãe no modelo mobile |
| `384c66857716776bea5fdff165d1115a9d16e748` | overview/zoom mobile nas rotas de mapa |
| `34ca730084d2c7e404bf927206111853eec359c1` | ajuste do painel mobile de visualização |

---

## 4. Pontos que motivaram documentação nova

Durante a rodada, alguns comportamentos ficaram sensíveis a conflitos entre scripts:

- `MutationObserver` reagindo a mudanças criadas pelos próprios conectores;
- scripts carregados no final tentando corrigir DOM produzido por React;
- touch/swipe competindo com scroll interno;
- overview criado por DOM manual e por scripts auxiliares;
- diferenças de comportamento em Safari/iOS.

Por isso foram criados documentos complementares:

```txt
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
```

---

## 5. Pendências abertas ao fim da rodada

| ID | Tema |
|---|---|
| `MOB-001` | Confirmar rolagem interna de `descendants` em iPhone/Safari. |
| `MOB-002` | Confirmar exibição de cards em `paternal-uncles` com dados reais. |
| `MOB-003` | Avaliar consolidação dos scripts auxiliares mobile dentro dos componentes React. |
| `MOB-004` | Confirmar mapeamento do overview da rota horizontal por geração. |
| `MOB-005` | Confirmar overlay opaco do painel `+` em Safari/iOS após cache limpo. |

---

## 6. Documentos canônicos relacionados

```txt
docs/funcionalidades/MAPA_FAMILIAR_VIEW.md
docs/funcionalidades/MAPA_FAMILIAR_MOBILE.md
docs/QA_MANUAL.md
docs/REGRAS_DE_NAO_REGRESSAO.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/operacao/QA_MAPAS_MOBILE_POS_DEPLOY.md
```

Este arquivo é histórico e não deve prevalecer sobre a documentação canônica.
