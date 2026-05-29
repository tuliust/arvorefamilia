# Operacao e manutencao

> Local recomendado: `docs/operacao/README.md`
> Tipo: indice operacional da pasta `docs/operacao/`.

---

## 1. Objetivo

Esta pasta reune procedimentos operacionais, manutencao controlada e rotinas administrativas que nao fazem parte dos guias oficiais de implementacao, UX, componentes ou correcao de erros.

Use esta pasta para temas como:

- Supabase migrations;
- manutencao de Storage;
- scripts administrativos;
- dry-run de limpeza;
- operacoes com service role;
- cuidados com dados legados;
- procedimentos que podem alterar dados ou infraestrutura.

---

## 2. Documentos desta pasta

| Arquivo | Uso |
|---|---|
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
```

O `README.md` desta pasta e apenas o indice operacional.

---

## 4. Regras gerais de operacao

Antes de qualquer operacao que altere dados, banco, Storage ou infraestrutura:

```bash
git status
npm run build
npm test
git diff --check
supabase migration list
```

Quando a operacao envolver scripts administrativos:

- executar primeiro em `dry-run`;
- revisar relatorio gerado;
- confirmar ambiente;
- confirmar uso de service role apenas em ambiente controlado;
- nao commitar relatorio com dados sensiveis;
- nao commitar `.env`, tokens, dumps, service role ou arquivos temporarios.

---

## 5. Service role

Scripts que usam service role devem ser executados apenas em ambiente controlado.

Regras:

- nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend;
- nunca commitar a chave;
- nao enviar a chave em prompt, issue ou documentacao publica;
- preferir ambiente local administrativo ou CI protegido;
- conferir o projeto Supabase antes de executar operacoes destrutivas.

---

## 6. Dry-run como padrao

Para manutencao de dados e Storage, o padrao esperado e:

```txt
1. Rodar em dry-run.
2. Revisar relatorio.
3. Confirmar ambiente.
4. Executar com flag explicita de confirmacao.
5. Revisar resultado.
6. Documentar se necessario.
```

Nenhum script de manutencao deve remover ou migrar dados sem flag explicita.

---

## 7. Operacoes destrutivas

Operacoes destrutivas incluem:

- deletar objetos do Storage;
- remover registros;
- migrar base64 para Storage com update no banco;
- alterar RLS;
- aplicar migrations remotas;
- rodar scripts de limpeza.

Regras:

- exigir confirmacao explicita;
- manter logs/relatorio;
- validar backup quando aplicavel;
- nao executar em producao sem revisao;
- nao misturar limpeza com alteracao funcional no mesmo commit.

---

## 8. Onde documentar novas operacoes

| Tipo de operacao | Destino |
|---|---|
| Migration, schema, RLS, RPC | `MIGRATIONS_SUPABASE.md` |
| Storage, orfaos, base64 legado | `STORAGE_MAINTENANCE.md` |
| QA final de lancamento | `../historico/QA_FINAL_MVP.md` |
| Correcao por sintoma | `../GUIA_CORRECAO_ERROS.md` |
| Decisao pos-MVP | `../PLANO_PROXIMOS_PASSOS.md` |
| Script antigo/relatorio historico | `../historico/` |

---

## 9. Checklist antes de adicionar novo documento operacional

Criar novo `.md` em `docs/operacao/` apenas se o tema nao couber em:

- `MIGRATIONS_SUPABASE.md`;
- `STORAGE_MAINTENANCE.md`;
- `GUIA_CORRECAO_ERROS.md`.

Perguntas:

1. E uma operacao recorrente
2. Tem risco de alterar dados
3. Usa service role
4. Tem dry-run
5. Precisa de checklist proprio
6. Nao e apenas historico

Se a resposta for sim para varios itens, pode justificar novo documento operacional.

---

## 10. Documentos possiveis no futuro

Nao necessarios agora, mas possiveis se o projeto crescer:

```txt
EDGE_FUNCTIONS_OPERACAO.md
BACKUP_E_RESTORE.md
INCIDENT_RESPONSE.md
```

Por enquanto, esses temas podem ser cobertos por `MIGRATIONS_SUPABASE.md`, `STORAGE_MAINTENANCE.md`, `DEPLOYMENT.md` e `GUIA_CORRECAO_ERROS.md`.
