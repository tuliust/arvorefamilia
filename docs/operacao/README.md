# Operacao e manutencao

> Local recomendado: `docs/operacao/README.md`  
> Tipo: indice operacional da pasta `docs/operacao/`.

---

## 1. Objetivo

Esta pasta reune procedimentos operacionais, manutencao controlada e rotinas administrativas que nao fazem parte dos guias oficiais de implementacao, UX, componentes ou correcao de erros.

Use esta pasta para temas como:

- Supabase migrations;
- deploy e publicacao;
- manutencao de Storage;
- scripts administrativos versionados em `scripts/`;
- dry-run de limpeza;
- operacoes com service role;
- cuidados com dados legados;
- procedimentos que podem alterar dados ou infraestrutura.

---

## 2. Documentos desta pasta

| Arquivo | Uso |
|---|---|
| `DEPLOYMENT.md` | Deploy, variaveis de ambiente, build, publicacao estatica, Supabase e observacoes operacionais. |
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, `supabase migration list`, `db push`, schema cache, RLS e scripts SQL legados. |
| `STORAGE_MAINTENANCE.md` | Diagnostico de orfaos, migracao de base64 legado, manutencao de buckets e limpeza controlada de Storage. |

---

## 3. Relacao com outros documentos

| Documento | Papel |
|---|---|
| `../README.md` | Indice canonico de toda a documentacao do projeto. |
| `../GUIA_IMPLEMENTACOES.md` | Estado consolidado do que ja foi implementado. |
| `../GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. |
| `../PLANO_PROXIMOS_PASSOS.md` | Fechamento de MVP e backlog pos-MVP. |
| `../historico/QA_FINAL_MVP.md` | Checklist e historico de validacao final. |

Regra:

```txt
docs/operacao/README.md nao substitui docs/README.md.