# Historico, diagnosticos e QA

> Local recomendado: `docs/historico/README.md`
> Tipo: indice da pasta historica.

---

## 1. Objetivo

Esta pasta preserva documentos de fase, diagnosticos, registros de QA e documentacao antiga para rastreabilidade do projeto **Arvore Familia**.

O estado canonico atual do projeto fica nos guias oficiais na raiz de `docs/`.

Use os arquivos desta pasta como:

- historico do processo;
- registro de decisoes anteriores;
- rastreabilidade de QA;
- diagnostico pontual;
- referencia para entender evolucao de uma frente.

Nao use os arquivos desta pasta como fonte principal para novas decisoes sem conferir os documentos canonicos atuais.

---

## 2. Regra principal

```txt
Documentos em docs/historico/ sao historicos.
Eles nao substituem os guias oficiais em docs/.
```

Se houver divergencia entre documento historico e guia atual, prevalece a documentacao canonica.

Documentos canonicos principais:

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
| `DIAGNOSTICO_7_6_EXPORTACAO_ARVORE.md` | Diagnostico historico | Registro da analise da frente de exportacao da arvore. |
| `QA_7_6_EXPORTACAO_ARVORE.md` | QA historico | Registro de validacao da exportacao da arvore. |
| `DIAGNOSTICO_DOCUMENTACAO_ATUAL.md` | Diagnostico historico | Registro de uma auditoria anterior da documentacao. |
| `RESPONSIVIDADE_MOBILE_TABLET.md` | Historico/checklist | Registro da frente de responsividade mobile/tablet. |
| `QA_FINAL_MVP.md` | QA final | Checklist e rastreabilidade da validacao final do MVP. |
| `documentacao-antiga/` | Arquivo morto organizado | Documentos antigos movidos da raiz do repositorio. |

---

## 4. Documentacao antiga

A pasta:

```txt
docs/historico/documentacao-antiga/
```

deve conter documentos antigos que ja nao sao a fonte principal do projeto.

Exemplos possiveis:

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

- nao apagar sem revisao;
- nao usar como guia atual;
- nao misturar com documentos canonicos;
- manter apenas para rastreabilidade;
- se houver informacao ainda util, migrar para o documento canonico adequado e deixar o original como historico.

---

## 5. Como usar esta pasta

### Para investigar uma decisao antiga

Consultar o documento historico correspondente e depois confirmar o estado atual nos guias canonicos.

Exemplo:

```txt
docs/historico/QA_7_6_EXPORTACAO_ARVORE.md
  
docs/funcionalidades/EXPORTACAO_ARVORE.md
  
docs/GUIA_CORRECAO_ERROS.md
```

### Para repetir QA final

Usar:

```txt
docs/historico/QA_FINAL_MVP.md
```

Mas confirmar pendencias atuais em:

```txt
docs/PLANO_PROXIMOS_PASSOS.md
```

### Para entender responsividade

Usar:

```txt
docs/historico/RESPONSIVIDADE_MOBILE_TABLET.md
```

Mas decisoes atuais de layout devem ser consultadas em:

```txt
docs/GUIA_UX_LAYOUT.md
```

---

## 6. Quando atualizar documentos historicos

Atualize documentos historicos apenas quando:

- for necessario corrigir o indice;
- for necessario marcar explicitamente que o documento e historico;
- um novo checklist/QA historico for adicionado;
- um diagnostico novo precisar ser preservado;
- algum documento antigo for movido para esta pasta.

Nao atualizar documentos historicos para refletir o estado atual do produto. Para isso, atualize os guias canonicos.

---

## 7. Aviso recomendado em documentos antigos

Quando um documento historico puder causar confusao, adicionar no topo:

```md
> Documento historico. Nao substitui a documentacao canonica atual em `docs/`.
```

Esse aviso e especialmente util para documentos antigos sobre:

- banco;
- migrations;
- erros e solucoes;
- arquitetura;
- rotas;
- scripts SQL;
- regras de relacionamento.

---

## 8. Onde documentar novos conteudos

| Conteudo novo | Destino correto |
|---|---|
| Estado atual implementado | `docs/GUIA_IMPLEMENTACOES.md` |
| Sintoma e correcao | `docs/GUIA_CORRECAO_ERROS.md` |
| UX/layout atual | `docs/GUIA_UX_LAYOUT.md` |
| Componente reutilizavel | `docs/GUIA_COMPONENTES.md` |
| Pendencia ou pos-MVP | `docs/PLANO_PROXIMOS_PASSOS.md` |
| Rotas e guards | `docs/arquitetura/ROTAS_E_GUARDS.md` |
| Migrations/Supabase | `docs/operacao/MIGRATIONS_SUPABASE.md` |
| Storage | `docs/operacao/STORAGE_MAINTENANCE.md` |
| QA final/historico | `docs/historico/QA_FINAL_MVP.md` |
| Diagnostico pontual antigo | `docs/historico/` |
| Documento obsoleto da raiz | `docs/historico/documentacao-antiga/` |

---

## 9. Checklist de manutencao desta pasta

Ao reorganizar documentacao:

- [ ] confirmar que `docs/README.md` lista os documentos historicos principais;
- [ ] confirmar que este README lista novos historicos relevantes;
- [ ] confirmar que documentos antigos nao aparecem como guias oficiais;
- [ ] confirmar que `documentacao-antiga/` nao contem backups temporarios;
- [ ] remover pastas `backups-reorganizacao-*` se tiverem sido commitadas por engano;
- [ ] preservar documentos historicos uteis;
- [ ] migrar conteudo ainda atual para documentos canonicos.

---

## 10. O que evitar

Nao fazer:

- transformar diagnostico antigo em guia oficial;
- duplicar conteudo canonico dentro de documento historico;
- atualizar historico antigo como se fosse documentacao viva;
- manter backups temporarios dentro da pasta;
- deixar documento antigo de banco sem aviso historico;
- usar `MIGRATION-GUIDE.md` antigo no lugar de `docs/operacao/MIGRATIONS_SUPABASE.md`.

---

## 11. Resumo

A pasta `docs/historico/` existe para preservar memoria tecnica e operacional do projeto.

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
