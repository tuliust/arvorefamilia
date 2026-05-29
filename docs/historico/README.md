# Histórico, diagnósticos e QA

> Local recomendado: `docs/historico/README.md`  
> Tipo: índice da pasta histórica.

---

## 1. Objetivo

Esta pasta preserva documentos de fase, diagnósticos, registros de QA e documentação antiga para rastreabilidade do projeto **Árvore Família**.

O estado canônico atual do projeto fica nos guias oficiais na raiz de `docs/`.

Use os arquivos desta pasta como:

- histórico do processo;
- registro de decisões anteriores;
- rastreabilidade de QA;
- diagnóstico pontual;
- referência para entender evolução de uma frente.

Não use os arquivos desta pasta como fonte principal para novas decisões sem conferir os documentos canônicos atuais.

---

## 2. Regra principal

```txt
Documentos em docs/historico/ são históricos.
Eles não substituem os guias oficiais em docs/.
```

Se houver divergência entre documento histórico e guia atual, prevalece a documentação canônica.

Documentos canônicos principais:

```txt
docs/README.md
docs/GUIA_IMPLEMENTACOES.md
docs/GUIA_COMPONENTES.md
docs/GUIA_UX_LAYOUT.md
docs/GUIA_CORRECAO_ERROS.md
docs/PLANO_PROXIMOS_PASSOS.md
docs/arquitetura/ROTAS_E_GUARDS.md
docs/operacao/MIGRATIONS_SUPABASE.md
```

---

## 3. Documentos preservados

| Arquivo/pasta | Tipo | Uso |
|---|---|---|
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Diagnóstico histórico | Registro da análise da frente de exportação da árvore. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | QA histórico | Registro de validação da exportação da árvore. |
| `DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | Diagnóstico histórico | Registro de uma auditoria anterior da documentação. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Histórico/checklist | Registro da frente de responsividade mobile/tablet. |
| `QA_FINAL_MVP.md` | QA final | Checklist e rastreabilidade da validação final do MVP. |
| `documentacao-antiga/` | Arquivo morto organizado | Documentos antigos movidos da raiz do repositório. |

---

## 4. Documentação antiga

A pasta:

```txt
docs/historico/documentacao-antiga/
```

deve conter documentos antigos que já não são a fonte principal do projeto.

Exemplos possíveis:

```txt
INDICE-DOCUMENTACAO.md
README-DOCUMENTACAO.md
MIGRATION-GUIDE.md
SETUP-BANCO-DADOS.md
RESPOSTA-RAPIDA-IRMAOS.md
COMO-FUNCIONA-IRMAOS.md
RELATORIO-DIAGNOSTICO-COMPLETO.md
ERROS-E-SOLUCOES.md
```

Regras:

- não apagar sem revisão;
- não usar como guia atual;
- não misturar com documentos canônicos;
- manter apenas para rastreabilidade;
- se houver informação ainda útil, migrar para o documento canônico adequado e deixar o original como histórico.

---

## 5. Como usar esta pasta

### Para investigar uma decisão antiga

Consultar o documento histórico correspondente e depois confirmar o estado atual nos guias canônicos.

Exemplo:

```txt
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
  ↓
docs/funcionalidades/EXPORTACAO_ARVORE.md
  ↓
docs/GUIA_CORRECAO_ERROS.md
```

### Para repetir QA final

Usar:

```txt
docs/historico/QA_FINAL_MVP.md
```

Mas confirmar pendências atuais em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

### Para entender responsividade

Usar:

```txt
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
```

Mas decisões atuais de layout devem ser consultadas em:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 6. Quando atualizar documentos históricos

Atualize documentos históricos apenas quando:

- for necessário corrigir o índice;
- for necessário marcar explicitamente que o documento é histórico;
- um novo checklist/QA histórico for adicionado;
- um diagnóstico novo precisar ser preservado;
- algum documento antigo for movido para esta pasta.

Não atualizar documentos históricos para refletir o estado atual do produto. Para isso, atualize os guias canônicos.

---

## 7. Aviso recomendado em documentos antigos

Quando um documento histórico puder causar confusão, adicionar no topo:

```md
> Documento histórico. Não substitui a documentação canônica atual em `docs/`.
```

Esse aviso é especialmente útil para documentos antigos sobre:

- banco;
- migrations;
- erros e soluções;
- arquitetura;
- rotas;
- scripts SQL;
- regras de relacionamento.

---

## 8. Onde documentar novos conteúdos

| Conteúdo novo | Destino correto |
|---|---|
| Estado atual implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Sintoma e correção | `docs/GUIA_CORRECAO_ERROS.md` |
| UX/layout atual | `docs/GUIA_UX_LAYOUT.md` |
| Componente reutilizável | `docs/GUIA_COMPONENTES.md` |
| Pendência ou pós-MVP | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Migrations/Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Storage | `docs/operacao/STORAGE_MAINTENANCE.md` |
| QA final/histórico | `docs/historico/QA_FINAL_MVP.md` |
| Diagnóstico pontual antigo | `docs/historico/` |
| Documento obsoleto da raiz | `docs/historico/documentacao-antiga/` |

---

## 9. Checklist de manutenção desta pasta

Ao reorganizar documentação:

- [ ] confirmar que `docs/README.md` lista os documentos históricos principais;
- [ ] confirmar que este README lista novos históricos relevantes;
- [ ] confirmar que documentos antigos não aparecem como guias oficiais;
- [ ] confirmar que `documentacao-antiga/` não contém backups temporários;
- [ ] remover pastas `backups-reorganizacao-*` se tiverem sido commitadas por engano;
- [ ] preservar documentos históricos úteis;
- [ ] migrar conteúdo ainda atual para documentos canônicos.

---

## 10. O que evitar

Não fazer:

- transformar diagnóstico antigo em guia oficial;
- duplicar conteúdo canônico dentro de documento histórico;
- atualizar histórico antigo como se fosse documentação viva;
- manter backups temporários dentro da pasta;
- deixar documento antigo de banco sem aviso histórico;
- usar `MIGRATION-GUIDE.md` antigo no lugar de `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 11. Resumo

A pasta `docs/historico/` existe para preservar memória técnica e operacional do projeto.

A fonte atual de verdade deve continuar em:

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
