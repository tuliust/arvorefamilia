# QA pós-consolidação — execução assistida — 2026-06-18

Este documento registra uma execução assistida do QA pós-consolidação feita a partir de evidências disponíveis no repositório, logs de terminal e documentação consolidada.

> Escopo: esta execução **não substitui QA visual/manual em navegador**. O app precisa ser validado localmente em desktop e mobile para confirmar layout, cliques, popovers, exportação, dados reais e comportamento visual.

---

## 1. Tipo de execução

| Item | Resultado |
|---|---|
| Tipo | QA estático/documental assistido |
| Código-fonte alterado | Não |
| Supabase alterado | Não |
| Arquivo principal de QA visual | `docs/historico/QA_POS_CONSOLIDACAO_2026_06_18.md` |
| Este relatório | Complementar |
| Responsável pela execução assistida | ChatGPT |
| Data | 2026-06-18 |

---

## 2. Evidências já confirmadas

A partir dos logs informados no terminal:

```txt
npm run build: aprovado
vite build: ✓ built in 6.52s
git diff --check: sem erro bloqueante; apenas avisos LF/CRLF do Windows
marcadores da rodada 2: todos OK
git status --short final: sem saída
```

Marcadores da segunda rodada confirmados no validador:

```txt
RODADA2-BASELINE-2026-06-18
RODADA2-IMPLEMENTACOES-2026-06-18
RODADA2-COMPONENTES-2026-06-18
RODADA2-UX-2026-06-18
RODADA2-QA-2026-06-18
RODADA2-PENDENCIAS-2026-06-18
RODADA2-MAPA-FAMILIAR-2026-06-18
RODADA2-PAINEL-ARVORE-2026-06-18
RODADA2-EXPORTACAO-2026-06-18
RODADA2-CURIOSIDADES-2026-06-18
RODADA2-FAVORITOS-2026-06-18
RODADA2-NOTIFICACOES-2026-06-18
RODADA2-CALENDARIO-2026-06-18
RODADA2-SUPABASE-CURIOSIDADES-2026-06-18
```

Conclusão técnica: a consolidação documental foi aplicada e validada em build, mas os fluxos visuais continuam pendentes de teste manual.

---

## 3. Resultado por frente

| Frente | Status assistido | Próxima ação |
|---|---|---|
| `/mapa-familiar` | Pendente de QA visual | Testar desktop, mobile, painel lateral, filtros e exportação |
| `/mapa-familiar-horizontal` | Pendente de QA visual | Testar toolbar mobile, popovers, botão `+`, cônjuges e exportação |
| Toolbar mobile dos mapas | Pendente de QA visual | Validar 320px, 375px, 390px e 430px |
| Painel lateral desktop | Pendente de QA visual | Confirmar largura compacta, seletor e ausência de controles duplicados |
| `/curiosidades` | Pendente de QA funcional autenticado | Validar gráficos, mural, descobertas, favoritos, compartilhamento e rota |
| `/meus-favoritos` | Pendente de QA visual/funcional | Validar busca, filtros, estrela ativa e descobertas |
| `/notificacoes` | Pendente de QA visual/funcional | Validar card simplificado, estados e contador se houver |
| `/calendario-familiar` | Pendente de QA visual mobile | Validar filtros, nomes longos, memória/falecimento e menu inferior |
| Documentação rodada 2 | Aprovada com ressalva | Corrigir acentuação quebrada no arquivo principal de QA |

---

## 4. Bug encontrado durante a execução assistida

| ID | Rota/arquivo | Severidade | Descrição | Evidência | Próxima ação |
|---|---|---|---|---|---|
| DOC-QA-001 | `docs/historico/QA_POS_CONSOLIDACAO_2026_06_18.md` | Baixa | A seção da segunda rodada aparece com acentuação corrompida em alguns trechos. | Exemplos: `VisualizaÃ§Ã£o`, `ObservaÃ§Ãµes`, `NotificaÃ§Ãµes`, `CalendÃ¡rio`. | Corrigir encoding/acentuação do bloco `RODADA2-QA-POS-CONSOLIDACAO-2026-06-18`. |

Observação: este bug é documental e não indica falha no app.

---

## 5. Checklist manual recomendado para execução local

### 5.1 Mapas familiares

Rotas:

```txt
/mapa-familiar
/mapa-familiar-horizontal
```

Validar:

- [ ] carrega com dados reais;
- [ ] não há erro no console;
- [ ] troca de pessoa principal funciona;
- [ ] painel lateral abre/fecha corretamente;
- [ ] seletor `Visualizar como` aparece no local vigente;
- [ ] filtros não quebram renderização;
- [ ] exportação funciona em Área, Imagem, PDF e Imprimir;
- [ ] desktop/tablet não foram afetados por ajustes mobile.

### 5.2 Toolbar mobile dos mapas

Breakpoints:

```txt
320px
375px
390px
430px
```

Validar:

- [ ] botões cabem na largura;
- [ ] Visualização abre popover correto;
- [ ] Formato abre cards corretos;
- [ ] Cor abre paletas;
- [ ] Filtros abre opções;
- [ ] Exportar mostra Área/Imagem/PDF/Imprimir;
- [ ] botão `+` abre painel completo;
- [ ] popovers não extrapolam tela;
- [ ] bottom nav não cobre ações essenciais.

### 5.3 Curiosidades

Rota:

```txt
/curiosidades
```

Validar:

- [ ] gráficos carregam dados reais ou estado vazio coerente;
- [ ] mural persistente lista posts;
- [ ] criar lembrança autenticada funciona;
- [ ] favoritar descoberta funciona;
- [ ] compartilhar usa `navigator.share` ou fallback de copiar;
- [ ] rota familiar mostra distância quando há coordenadas;
- [ ] rota familiar tem fallback quando faltam coordenadas.

### 5.4 Favoritos

Rota:

```txt
/meus-favoritos
```

Validar:

- [ ] busca funciona;
- [ ] botão de filtro abre menu;
- [ ] filtro ativo aparece corretamente;
- [ ] estrela ativa remove favorito com feedback visual;
- [ ] descobertas de Curiosidades aparecem quando houver dados.

### 5.5 Notificações

Rota:

```txt
/notificacoes
```

Validar:

- [ ] cards aparecem sem box azul interno;
- [ ] badge `NOVA` ou `Lida` aparece corretamente;
- [ ] ações aparecem no topo direito;
- [ ] data/hora aparece no corpo;
- [ ] marcar como lida funciona;
- [ ] marcar todas como lidas funciona;
- [ ] remover notificação funciona;
- [ ] contador global é atualizado se estiver implementado.

### 5.6 Calendário familiar

Rota:

```txt
/calendario-familiar
```

Validar:

- [ ] filtros mobile aparecem como cards horizontais;
- [ ] ícones aparecem nos títulos;
- [ ] nomes longos quebram corretamente;
- [ ] cards de memória/falecimento ficam legíveis;
- [ ] desktop permanece sem regressão.

---

## 6. Resultado desta execução

Status geral:

```txt
Aprovado parcialmente — execução estática/documental concluída; QA visual/manual ainda pendente.
```

Resumo:

```txt
A documentação da segunda rodada foi aplicada e validada por build/marcadores. Não foram detectados erros técnicos bloqueantes nos logs fornecidos. Foi encontrado um bug documental de acentuação no arquivo principal de QA. As rotas e interações visuais seguem pendentes de validação local em navegador.
```

Próxima frente recomendada:

```txt
Corrigir DOC-QA-001 e executar QA visual local começando por /mapa-familiar-horizontal em mobile.
```
