# Operação e manutenção

> Local recomendado: `docs/operacao/README.md`  
> Tipo: índice operacional da pasta `docs/operacao/`.

---

## 1. Objetivo

Esta pasta reúne procedimentos operacionais, manutenção controlada e rotinas administrativas que não fazem parte dos guias oficiais de implementação, UX, componentes ou correção de erros.

Use esta pasta para temas como:

- Supabase migrations;
- manutenção de Storage;
- scripts administrativos;
- dry-run de limpeza;
- operações com service role;
- cuidados com dados legados;
- procedimentos que podem alterar dados ou infraestrutura.

---

## 2. Documentos desta pasta

| Arquivo | Uso |
|---|---|
| `MIGRATIONS_SUPABASE.md` | Fluxo seguro de migrations, `supabase migration list`, `db push`, schema cache, RLS e scripts SQL legados. |
| `STORAGE_MAINTENANCE.md` | Diagnóstico de órfãos, migração de base64 legado, manutenção de buckets e limpeza controlada de Storage. |

---

## 3. Relação com outros documentos

| Documento | Papel |
|---|---|
| `../README.md` | Índice canônico de toda a documentação do projeto. |
| `../GUIA_IMPLEMENTACOES.md` | Estado consolidado do que já foi implementado. |
| `../GUIA_CORRECAO_ERROS.md` | Troubleshooting por sintoma. |
| `../PLANO_PROXIMOS_PASSOS.md` | Fechamento de MVP e backlog pós-MVP. |
| `../historico/QA_FINAL_MVP.md` | Checklist e histórico de validação final. |

Regra:

```txt
docs/operacao/README.md não substitui docs/README.md.
```

O `README.md` desta pasta é apenas o índice operacional.

---

## 4. Regras gerais de operação

Antes de qualquer operação que altere dados, banco, Storage ou infraestrutura:

```bash
git status
npm run build
npm test
git diff --check
supabase migration list
```

Quando a operação envolver scripts administrativos:

- executar primeiro em `dry-run`;
- revisar relatório gerado;
- confirmar ambiente;
- confirmar uso de service role apenas em ambiente controlado;
- não commitar relatório com dados sensíveis;
- não commitar `.env`, tokens, dumps, service role ou arquivos temporários.

---

## 5. Service role

Scripts que usam service role devem ser executados apenas em ambiente controlado.

Regras:

- nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend;
- nunca commitar a chave;
- não enviar a chave em prompt, issue ou documentação pública;
- preferir ambiente local administrativo ou CI protegido;
- conferir o projeto Supabase antes de executar operações destrutivas.

---

## 6. Dry-run como padrão

Para manutenção de dados e Storage, o padrão esperado é:

```txt
1. Rodar em dry-run.
2. Revisar relatório.
3. Confirmar ambiente.
4. Executar com flag explícita de confirmação.
5. Revisar resultado.
6. Documentar se necessário.
```

Nenhum script de manutenção deve remover ou migrar dados sem flag explícita.

---

## 7. Operações destrutivas

Operações destrutivas incluem:

- deletar objetos do Storage;
- remover registros;
- migrar base64 para Storage com update no banco;
- alterar RLS;
- aplicar migrations remotas;
- rodar scripts de limpeza.

Regras:

- exigir confirmação explícita;
- manter logs/relatório;
- validar backup quando aplicável;
- não executar em produção sem revisão;
- não misturar limpeza com alteração funcional no mesmo commit.

---

## 8. Onde documentar novas operações

| Tipo de operação | Destino |
|---|---|
| Migration, schema, RLS, RPC | `MIGRATIONS_SUPABASE.md` |
| Storage, órfãos, base64 legado | `STORAGE_MAINTENANCE.md` |
| QA final de lançamento | `../historico/QA_FINAL_MVP.md` |
| Correção por sintoma | `../GUIA_CORRECAO_ERROS.md` |
| Decisão pós-MVP | `../PLANO_PROXIMOS_PASSOS.md` |
| Script antigo/relatório histórico | `../historico/` |

---

## 9. Checklist antes de adicionar novo documento operacional

Criar novo `.md` em `docs/operacao/` apenas se o tema não couber em:

- `MIGRATIONS_SUPABASE.md`;
- `STORAGE_MAINTENANCE.md`;
- `GUIA_CORRECAO_ERROS.md`.

Perguntas:

1. É uma operação recorrente?
2. Tem risco de alterar dados?
3. Usa service role?
4. Tem dry-run?
5. Precisa de checklist próprio?
6. Não é apenas histórico?

Se a resposta for sim para vários itens, pode justificar novo documento operacional.

---

## 10. Documentos possíveis no futuro

Não necessários agora, mas possíveis se o projeto crescer:

```txt
EDGE_FUNCTIONS_OPERACAO.md
BACKUP_E_RESTORE.md
INCIDENT_RESPONSE.md
```

Por enquanto, esses temas podem ser cobertos por `MIGRATIONS_SUPABASE.md`, `STORAGE_MAINTENANCE.md`, `DEPLOYMENT.md` e `GUIA_CORRECAO_ERROS.md`.
