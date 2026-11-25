# ARVOREFAMILIA — PROJETOS 2027: checklist e continuidade

**Consolidação inicial:** 24/11/2026, 21h29 (Brasília), sessões 01–12.  
**Atualização:** sessão 13, ciclo de 24/11/2026.  
**Natureza:** registro documental de continuidade, não homologação.  
**Fonte:** relatórios das sessões no chat e [fotografia de referência de 23/11](STATUS_E_CONTINUIDADE.md), lida diretamente no GitHub. Os retornos brutos das consultas das sessões não foram revalidados nesta gravação. A planilha central foi relatada como 21 pendências e 0 concluídas nas sessões 12 e 13; não houve nova consulta ou alteração da planilha nesta gravação.

**Privacidade:** repositório público. Este registro omite dados pessoais, credenciais, definições SQL e detalhes de possíveis explorações. Achados específicos de segurança devem permanecer no controle restrito do responsável. Não confundir alertas estáticos com exploração comprovada.

## 1. Controle principal

Legenda: 🟢 subatividade executada/relatada; 🟡 parcial; 🔴 pendente; 🔒 depende de pré-requisitos. Nenhuma das 21 ações está formalmente concluída: 6 parciais e 15 pendentes (incluindo as dependentes). 28,6% iniciadas parcialmente não significa 28,6% concluídas.

| ID | Atividade | Situação consolidada |
|---|---|---|
| ARV-001 | Ambientes, projetos e permissões | 🟡 |
| ARV-002 | Branches, commits, PRs e issues | 🔴 |
| ARV-003 | Código, dependências e vulnerabilidades | 🔴 |
| ARV-004 | Migrations, schema e integridade | 🟡 |
| ARV-005 | RLS, grants, Auth, Storage e funções | 🟡 |
| ARV-006 | Vercel, deployments e domínios | 🔴 |
| ARV-007 | Fluxos públicos e administrativos | 🔴 |
| ARV-008 | Documentação técnica e operacional | 🟡 |
| ARV-009 | Riscos, prioridades e dependências | 🟡 |
| ARV-010 | Backup preventivo restaurável | 🔴 |
| ARV-011 | Correções de segurança | 🔒 |
| ARV-012 | Correções funcionais | 🔒 |
| ARV-013 | Testes e homologação isolada | 🔴 |
| ARV-014 | Consolidação documental | 🔴 |
| ARV-015 | Consolidação da main | 🔒 |
| ARV-016 | Publicação controlada | 🔒 |
| ARV-017 | Revisão e limpeza de branches | 🔒 |
| ARV-018 | Sincronização local pós-consolidação | 🔒 |
| ARV-019 | Backup definitivo | 🔒 |
| ARV-020 | Auditoria de encerramento | 🔒 |
| ARV-021 | Integridade genealógica e privacidade | 🟡 |

## 2. Checklist detalhado

### Governança
- [x] Acesso à planilha, recuperação das 21 atividades, critérios de aceite e leitura do Registro (relatados).
- [ ] Localizar e ler integralmente GUIA_DE_RETOMADA_DOS_PROJETOS_ATUALIZADO_2026-11-24.md e PROJETOS_2027_PROTOCOLO_OPERACIONAL_E_GOVERNANCA.md. Busca anterior não encontrou os arquivos.
- [x] Ler integralmente STATUS_E_CONTINUIDADE.md na branch documental (confirmado nesta gravação).
- [ ] Revisar demais documentos canônicos e critérios de aceite.
- [ ] Persistir evidências das sessões no controle restrito; atualizar exclusivamente linhas ARV, reler últimos IDs imediatamente antes de escrever, apêndice seguro e readback. Registro anteriormente relatado sem entradas ARV na faixa consultada.
- [ ] Confirmar estado atual da planilha e reconciliar divergências.

### GitHub
- [x] Reconciliação local de 23/11: documentada; não repetir recuperação.
- [x] Acesso ao repositório e à branch documental confirmado nesta gravação.
- [ ] Auditar main e branch documental, comparar commits, PRs, issues, hashes e lockfiles.
- [ ] Auditar dependências e salvaguardas contra ferramentas destrutivas.

### Banco e integridade
- [x] Acesso remoto, inventário de public/storage, cobertura RLS e FORCE RLS (relatados).
- [x] Security Advisor (relatado).
- [ ] Reavaliar Performance Advisor quando houver mudança; referência anterior já existe.
- [ ] Reconciliar migrations atuais e schema por conteúdo quando viável; referência 91/91 por versão em 23/11.
- [ ] Auditar constraints, FKs, órfãos, vínculos inconsistentes, duplicidades, parentescos calculados e integridade de arquivos históricos; preservar dados reais.
- [ ] Expandir verificações pontuais de integridade já documentadas em 23/11.

### Segurança, Auth, privacidade e Storage
- [x] Inventário de funções privilegiadas sinalizadas e análise estática de sete funções, incluindo autorização administrativa (relatados).
- [x] Estado da proteção contra senhas comprometidas verificado (relatado).
- [x] Identificação preliminar de riscos em autorização, onboarding, privacidade e operações administrativas (relatados).
- [x] Consultar as políticas RLS de perfis (sessão 13; análise estática relatada, não homologação de autorização).
- [ ] Verificar grants efetivos por coluna e triggers de proteção de papéis; concluir a classificação de risco de autorização.
- [ ] Revisar restantes funções privilegiadas; grants efetivos, políticas RLS individuais, papéis, triggers, proprietários, BYPASSRLS e search_path.
- [ ] Validar autorização e proteção de papéis em ambiente sintético; não explorar produção.
- [ ] Revisar cadastro, primeiro acesso, configuração Auth, visibilidade de perfis e permissões por papel.
- [ ] Reconciliar inventário dos buckets com referência 23/11; auditar políticas, proteção de documentos/fotos e acesso a arquivos privados.
- [ ] Classificar e registrar detalhes dos riscos em meio restrito; não revogar permissões em massa.

### Vercel
- [ ] Confirmar estado atual, deployment ativo, commit publicado, logs de build/runtime, configuração de ambiente sem expor valores e ambos os domínios.
- [ ] Confirmar salvaguardas contra operações destrutivas e procedimento de rollback.
- [x] Referência de deployment READY e commit conciliado em 23/11 documentada; não equivale a QA atual.

### Backup e recuperação
- [ ] Identificar backups existentes do Postgres, Storage e código.
- [ ] Verificar integridade, checksums, capacidade de restauração isolada e procedimento de rollback.
- [ ] Validar backup preventivo restaurável antes de correções técnicas.
- [ ] Gerar backup definitivo após correções autorizadas.

### Build, testes e homologação
- [ ] Preparar ambiente sintético efêmero isolado, sem segredos, dados reais ou integrações externas reais.
- [ ] Confirmar Node 24/npm, executar npm ci, typecheck, build, testes unitários e E2E conforme scripts do repo; registrar hashes, logs e resultados.
- [ ] Testar árvore, perfis, relacionamentos/parentescos, login/logout, primeiro acesso, edição, permissões administrativas e comuns, upload/Storage e privacidade.
- [ ] Homologar correções e versão final após critérios de aceite; encerrar ambiente efêmero.
- [ ] Consolidar, publicar e sincronizar localmente somente após autorização e salvaguardas aplicáveis.

## 3. Histórico das sessões de 24/11 (relatado, não revalidado)

| Sessão | Horário BRT | Entrega relatada |
|---|---|---|
| 01 | 10h | Acesso à planilha |
| 02 | 11h | Checklist e critérios recuperados |
| 03 | 12h | Cobertura de RLS inventariada |
| 04 | 13h | Revisão do checklist; sem novo diagnóstico |
| 05 | 14h | Security Advisor |
| 06 | 15h | Identificação de operações, sem nova consulta |
| 07 | 16h | Ausência de registros ARV na faixa consultada |
| 08 | 17h | Critérios de aceite; sem avanço técnico novo |
| 09 | 18h | Busca documental sem resultados |
| 10 | 19h | Análise estática de seis funções privilegiadas |
| 11 | 20h | Sem novas consultas técnicas |
| 12 | 21h | Análise de função de autorização administrativa |
| 13 | Não informado | Consulta das políticas RLS de perfis; três políticas relatadas; análise de autorização ainda incompleta |

Indicadores relatados: 53/53 tabelas public/storage com RLS ativo (ativação, não eficácia), 27 ocorrências no Security Advisor, 25 funções sinalizadas, sete funções examinadas individualmente ao todo (não presumir que todas pertençam ao conjunto de 25). Nenhuma correção em produção ou teste sintético executado nas 13 sessões. Nenhum backup restaurável verificado e nenhuma homologação formal.

## 4. Riscos e prioridades (resumo público)

- P0 operacional: backup recuperável não comprovado — impede intervenções técnicas.
- P1 preliminar: revisar autorização administrativa, primeiro acesso, minimização de informações, operações destrutivas e padrões de privacidade. Na sessão 13, a revisão estática das políticas de perfis aprofundou o diagnóstico; grants e triggers ainda precisam ser examinados. Não houve teste de exploração nem confirmação de acesso indevido.
- A classificar: privilégios padrão, desempenho/RLS e proteção de Auth.
- P1 operacional: ausência de evidências persistentes e baixa produtividade das sessões. Não confundir execução insuficiente com indisponibilidade comprovada dos serviços.

## 5. Ordem de retomada

1. Examinar privilégios efetivos por coluna e triggers de proteção de papéis, somente leitura, sem repetir a consulta de políticas já relatada; concluir a classificação preliminar de autorização.
2. Verificar backup preventivo restaurável (P0, pré-requisito de qualquer intervenção).
3. Registrar evidências e riscos detalhados no controle restrito, com readback.
4. Auditar integridade referencial, vínculos genealógicos e órfãos por contagens agregadas.
5. Concluir revisão de funções privilegiadas, Auth, privacidade e Storage.
6. Conciliar GitHub, dependências, lockfile e Vercel, sem repetir a recuperação local concluída.
7. Executar build e testes isolados, preparar correções, validar impacto e rollback.
8. Homologar, consolidar e publicar de forma controlada.

## 6. Salvaguardas permanentes

Preservar o Supabase original, os dados genealógicos e os arquivos históricos. Não substituir dados reais por mocks. Não escrever dados reais durante testes, reaplicar migrations históricas, revogar permissões indiscriminadamente, habilitar ferramentas administrativas destrutivas no ambiente real, executar migração destrutiva, usar npm audit fix --force, criar recursos permanentes/pagos ou fazer merge/deploy automático. Mudanças de alto impacto exigem autorização específica e backup restaurável, escopo, impacto e rollback. Nenhuma alteração técnica foi realizada nesta gravação; rollback técnico desnecessário.

Referência canônica: [STATUS_E_CONTINUIDADE.md](STATUS_E_CONTINUIDADE.md). Os números históricos de 23/11 são evidência documental, não verificação atual; as lacunas acima referem-se ao ciclo de 24/11. A documentação foi mantida separada da main para preservar produção.

## 7. Delta da sessão 13

- ARV-005, ARV-009 e ARV-021: avanço diagnóstico relatado; continuam parciais.
- Consulta estática de três políticas de perfis: relatada como realizada; eficácia e controles complementares pendentes.
- ARV-010: backup restaurável não verificado; nenhuma correção, escrita em produção ou homologação autorizada por este registro.
- Planilha: sessão 13 relata 21 atividades pendentes e 0 concluídas; sem gravação relatada. Esta atualização documental não alterou a planilha.
- Evidência: relatório da sessão 13 no chat; retornos brutos não revalidados nesta atualização. Detalhes sensíveis omitidos por se tratar de repositório público.
