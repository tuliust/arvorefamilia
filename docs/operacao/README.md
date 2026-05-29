# OperaÃ§Ã£o e manutenÃ§Ã£o

> Local recomendado: `docs/operacao/README.md`
> Tipo: Ã­ndice operacional da pasta `docs/operacao/`.

---

## 1. Objetivo

Esta pasta reÃºne procedimentos operacionais, manutenÃ§Ã£o controlada e rotinas administrativas que nÃ£o fazem parte dos guias oficiais de implementaÃ§Ã£o, UX, componentes ou correÃ§Ã£o de erros.

Use esta pasta para temas como:

- Supabase migrations;
- manutenÃ§Ã£o de Storage;
- scripts administrativos;
- dry-run de limpeza;
- operaÃ§Ãµes com service role;
- cuidados com dados legados;
- procedimentos que podem alterar dados ou infraestrutura.

---

## 2. Documentos desta pasta

| Arquivo | Uso |
|---|---|
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, `supabase migration list`, `db push`, schema cache, RLS e scripts SQL legados. |
| `STORAGE_MAINTENANCE.md` | DiagnÃ³stico de Ã³rfÃ£os, migraÃ§Ã£o de base64 legado, manutenÃ§Ã£o de buckets e limpeza controlada de Storage. |

---

## 3. RelaÃ§Ã£o com outros documentos

| Documento | Papel |
|---|---|
| `../README.md` | Ãndice canÃ´nico de toda a documentaÃ§Ã£o do projeto. |
| `../GUIA_IMPLEMENTACOES.md` | Estado consolidado do que jÃ¡ foi implementado. |
| `../GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. |
| `../PLANO_PROXIMOS_PASSOS.md` | Fechamento de MVP e backlog pÃ³s-MVP. |
| `../historico/QA_FINAL_MVP.md` | Checklist e histÃ³rico de validaÃ§Ã£o final. |

Regra:

```txt
docs/operacao/README.md nÃ£o substitui docs/README.md.
```

O `README.md` desta pasta Ã© apenas o Ã­ndice operacional.

---

## 4. Regras gerais de operaÃ§Ã£o

Antes de qualquer operaÃ§Ã£o que altere dados, banco, Storage ou infraestrutura:

```bash
git status
npm run build
npm test
git diff --check
supabase migration list
```

Quando a operaÃ§Ã£o envolver scripts administrativos:

- executar primeiro em `dry-run`;
- revisar relatÃ³rio gerado;
- confirmar ambiente;
- confirmar uso de service role apenas em ambiente controlado;
- nÃ£o commitar relatÃ³rio com dados sensÃ­veis;
- nÃ£o commitar `.env`, tokens, dumps, service role ou arquivos temporÃ¡rios.

---

## 5. Service role

Scripts que usam service role devem ser executados apenas em ambiente controlado.

Regras:

- nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend;
- nunca commitar a chave;
- nÃ£o enviar a chave em prompt, issue ou documentaÃ§Ã£o pÃºblica;
- preferir ambiente local administrativo ou CI protegido;
- conferir o projeto Supabase antes de executar operaÃ§Ãµes destrutivas.

---

## 6. Dry-run como padrÃ£o

Para manutenÃ§Ã£o de dados e Storage, o padrÃ£o esperado Ã©:

```txt
1. Rodar em dry-run.
2. Revisar relatÃ³rio.
3. Confirmar ambiente.
4. Executar com flag explÃ­cita de confirmaÃ§Ã£o.
5. Revisar resultado.
6. Documentar se necessÃ¡rio.
```

Nenhum script de manutenÃ§Ã£o deve remover ou migrar dados sem flag explÃ­cita.

---

## 7. OperaÃ§Ãµes destrutivas

OperaÃ§Ãµes destrutivas incluem:

- deletar objetos do Storage;
- remover registros;
- migrar base64 para Storage com update no banco;
- alterar RLS;
- aplicar migrations remotas;
- rodar scripts de limpeza.

Regras:

- exigir confirmaÃ§Ã£o explÃ­cita;
- manter logs/relatÃ³rio;
- validar backup quando aplicÃ¡vel;
- nÃ£o executar em produÃ§Ã£o sem revisÃ£o;
- nÃ£o misturar limpeza com alteraÃ§Ã£o funcional no mesmo commit.

---

## 8. Onde documentar novas operaÃ§Ãµes

| Tipo de operaÃ§Ã£o | Destino |
|---|---|
| Migration, schema, RLS, RPC | `MIGRATIONS_SUPABASE.md` |
| Storage, Ã³rfÃ£os, base64 legado | `STORAGE_MAINTENANCE.md` |
| QA final de lanÃ§amento | `../historico/QA_FINAL_MVP.md` |
| CorreÃ§Ã£o por sintoma | `../GUIA_CORRECAO_ERROS.md` |
| DecisÃ£o pÃ³s-MVP | `../PLANO_PROXIMOS_PASSOS.md` |
| Script antigo/relatÃ³rio histÃ³rico | `../historico/` |

---

## 9. Checklist antes de adicionar novo documento operacional

Criar novo `.md` em `docs/operacao/` apenas se o tema nÃ£o couber em:

- `MIGRATIONS_SUPABASE.md`;
- `STORAGE_MAINTENANCE.md`;
- `GUIA_CORRECAO_ERROS.md`.

Perguntas:

1. Ã‰ uma operaÃ§Ã£o recorrente?
2. Tem risco de alterar dados?
3. Usa service role?
4. Tem dry-run?
5. Precisa de checklist prÃ³prio?
6. NÃ£o Ã© apenas histÃ³rico?

Se a resposta for sim para vÃ¡rios itens, pode justificar novo documento operacional.

---

## 10. Documentos possÃ­veis no futuro

NÃ£o necessÃ¡rios agora, mas possÃ­veis se o projeto crescer:

```txt
EDGE_FUNCTIONS_OPERACAO.md
BACKUP_E_RESTORE.md
INCIDENT_RESPONSE.md
```

Por enquanto, esses temas podem ser cobertos por `MIGRATIONS_SUPABASE.md`, `STORAGE_MAINTENANCE.md`, `DEPLOYMENT.md` e `GUIA_CORRECAO_ERROS.md`.
