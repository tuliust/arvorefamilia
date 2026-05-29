# HistÃ³rico, diagnÃ³sticos e QA

> Local recomendado: `docs/historico/README.md`
> Tipo: Ã­ndice da pasta histÃ³rica.

---

## 1. Objetivo

Esta pasta preserva documentos de fase, diagnÃ³sticos, registros de QA e documentaÃ§Ã£o antiga para rastreabilidade do projeto **Ãrvore FamÃ­lia**.

O estado canÃ´nico atual do projeto fica nos guias oficiais na raiz de `docs/`.

Use os arquivos desta pasta como:

- histÃ³rico do processo;
- registro de decisÃµes anteriores;
- rastreabilidade de QA;
- diagnÃ³stico pontual;
- referÃªncia para entender evoluÃ§Ã£o de uma frente.

NÃ£o use os arquivos desta pasta como fonte principal para novas decisÃµes sem conferir os documentos canÃ´nicos atuais.

---

## 2. Regra principal

```txt
Documentos em docs/historico/ sÃ£o histÃ³ricos.
Eles nÃ£o substituem os guias oficiais em docs/.
```

Se houver divergÃªncia entre documento histÃ³rico e guia atual, prevalece a documentaÃ§Ã£o canÃ´nica.

Documentos canÃ´nicos principais:

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
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | DiagnÃ³stico histÃ³rico | Registro da anÃ¡lise da frente de exportaÃ§Ã£o da Ã¡rvore. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | QA histÃ³rico | Registro de validaÃ§Ã£o da exportaÃ§Ã£o da Ã¡rvore. |
| `DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | DiagnÃ³stico histÃ³rico | Registro de uma auditoria anterior da documentaÃ§Ã£o. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | HistÃ³rico/checklist | Registro da frente de responsividade mobile/tablet. |
| `QA_FINAL_MVP.md` | QA final | Checklist e rastreabilidade da validaÃ§Ã£o final do MVP. |
| `documentacao-antiga/` | Arquivo morto organizado | Documentos antigos movidos da raiz do repositÃ³rio. |

---

## 4. DocumentaÃ§Ã£o antiga

A pasta:

```txt
docs/historico/documentacao-antiga/
```

deve conter documentos antigos que jÃ¡ nÃ£o sÃ£o a fonte principal do projeto.

Exemplos possÃ­veis:

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

- nÃ£o apagar sem revisÃ£o;
- nÃ£o usar como guia atual;
- nÃ£o misturar com documentos canÃ´nicos;
- manter apenas para rastreabilidade;
- se houver informaÃ§Ã£o ainda Ãºtil, migrar para o documento canÃ´nico adequado e deixar o original como histÃ³rico.

---

## 5. Como usar esta pasta

### Para investigar uma decisÃ£o antiga

Consultar o documento histÃ³rico correspondente e depois confirmar o estado atual nos guias canÃ´nicos.

Exemplo:

```txt
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
  â†“
docs/funcionalidades/EXPORTACAO_ARVORE.md
  â†“
docs/GUIA_CORRECAO_ERROS.md
```

### Para repetir QA final

Usar:

```txt
docs/historico/QA_FINAL_MVP.md
```

Mas confirmar pendÃªncias atuais em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

### Para entender responsividade

Usar:

```txt
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
```

Mas decisÃµes atuais de layout devem ser consultadas em:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 6. Quando atualizar documentos histÃ³ricos

Atualize documentos histÃ³ricos apenas quando:

- for necessÃ¡rio corrigir o Ã­ndice;
- for necessÃ¡rio marcar explicitamente que o documento Ã© histÃ³rico;
- um novo checklist/QA histÃ³rico for adicionado;
- um diagnÃ³stico novo precisar ser preservado;
- algum documento antigo for movido para esta pasta.

NÃ£o atualizar documentos histÃ³ricos para refletir o estado atual do produto. Para isso, atualize os guias canÃ´nicos.

---

## 7. Aviso recomendado em documentos antigos

Quando um documento histÃ³rico puder causar confusÃ£o, adicionar no topo:

```md
> Documento histÃ³rico. NÃ£o substitui a documentaÃ§Ã£o canÃ´nica atual em `docs/`.
```

Esse aviso Ã© especialmente Ãºtil para documentos antigos sobre:

- banco;
- migrations;
- erros e soluÃ§Ãµes;
- arquitetura;
- rotas;
- scripts SQL;
- regras de relacionamento.

---

## 8. Onde documentar novos conteÃºdos

| ConteÃºdo novo | Destino correto |
|---|---|
| Estado atual implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Sintoma e correÃ§Ã£o | `docs/GUIA_CORRECAO_ERROS.md` |
| UX/layout atual | `docs/GUIA_UX_LAYOUT.md` |
| Componente reutilizÃ¡vel | `docs/GUIA_COMPONENTES.md` |
| PendÃªncia ou pÃ³s-MVP | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Migrations/Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Storage | `docs/operacao/STORAGE_MAINTENANCE.md` |
| QA final/histÃ³rico | `docs/historico/QA_FINAL_MVP.md` |
| DiagnÃ³stico pontual antigo | `docs/historico/` |
| Documento obsoleto da raiz | `docs/historico/documentacao-antiga/` |

---

## 9. Checklist de manutenÃ§Ã£o desta pasta

Ao reorganizar documentaÃ§Ã£o:

- [ ] confirmar que `docs/README.md` lista os documentos histÃ³ricos principais;
- [ ] confirmar que este README lista novos histÃ³ricos relevantes;
- [ ] confirmar que documentos antigos nÃ£o aparecem como guias oficiais;
- [ ] confirmar que `documentacao-antiga/` nÃ£o contÃ©m backups temporÃ¡rios;
- [ ] remover pastas `backups-reorganizacao-*` se tiverem sido commitadas por engano;
- [ ] preservar documentos histÃ³ricos Ãºteis;
- [ ] migrar conteÃºdo ainda atual para documentos canÃ´nicos.

---

## 10. O que evitar

NÃ£o fazer:

- transformar diagnÃ³stico antigo em guia oficial;
- duplicar conteÃºdo canÃ´nico dentro de documento histÃ³rico;
- atualizar histÃ³rico antigo como se fosse documentaÃ§Ã£o viva;
- manter backups temporÃ¡rios dentro da pasta;
- deixar documento antigo de banco sem aviso histÃ³rico;
- usar `MIGRATION-GUIDE.md` antigo no lugar de `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 11. Resumo

A pasta `docs/historico/` existe para preservar memÃ³ria tÃ©cnica e operacional do projeto.

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
